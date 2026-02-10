import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync, getStripePublishableKey } from './stripeClient';
import { WebhookHandlers } from './webhookHandlers';
import { handleCalcomWebhook } from './calcomWebhook';
import { seedIfNeeded } from './seed';
import { seedDripEmails } from './dripEmailSeed';
import { startDripEmailProcessor } from './emailService';
import { db } from './db';
import { sql } from 'drizzle-orm';

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('DATABASE_URL not found - skipping Stripe initialization');
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    console.log('Syncing Stripe data...');
    stripeSync.syncBackfill()
      .then(() => {
        console.log('Stripe data synced');
      })
      .catch((err: any) => {
        console.error('Error syncing Stripe data:', err);
      });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

initStripe().catch(err => console.error('Stripe init error:', err));

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      console.error('Webhook error stack:', error.stack);
      res.status(400).json({ error: 'Webhook processing error', detail: error.message });
    }
  }
);

// Cal.com webhook — receives booking events (JSON body, no raw parsing needed)
app.post('/api/webhooks/calcom', express.json(), async (req, res) => {
  try {
    // Verify webhook signature if secret is configured
    const secret = process.env.CALCOM_WEBHOOK_SECRET;
    if (secret) {
      const signature = req.headers['x-cal-signature-256'] as string;
      if (signature) {
        const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
        if (signature !== expected) {
          console.error('[Cal.com Webhook] Signature mismatch');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }
    }

    await handleCalcomWebhook(req.body);
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[Cal.com Webhook] Error:', error.message);
    res.status(200).json({ received: true }); // Always return 200 so Cal.com doesn't retry
  }
});

app.get('/api/stripe/publishable-key', async (req, res) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get publishable key' });
  }
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await seedIfNeeded();
  await seedDripEmails();

  // One-time migration: remove duplicate comments (safe to remove after first deploy)
  try {
    const result = await db.execute(sql`
      DELETE FROM day_comments
      WHERE id NOT IN (
        SELECT MIN(id) FROM day_comments
        GROUP BY user_id, day, content
      )
    `);
    console.log('[Migration] Duplicate comments cleanup complete');
  } catch (e) {
    console.error('[Migration] Duplicate comments cleanup failed (non-fatal):', e);
  }

  startDripEmailProcessor();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
