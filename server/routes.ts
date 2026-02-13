import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserProgressSchema, insertDayContentSchema, users, abTests, abVariants, critiqueRequests, pendingPurchases, coachingPurchases, moodCheckins, type User, userProgress, chatMessages, dayComments, dayQuestions, userBadges, aiUsageLogs, showcase, testimonials, badges, pageViews, coaches, coachingSessions, coachPayouts, coachInvitations, coachAgreements } from "@shared/schema";
import dns from "dns";
import { promisify } from "util";
import crypto, { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { db } from "./db";
import { eq, desc, isNull, isNotNull, sql, and, or, gte, lte, count, countDistinct } from "drizzle-orm";
import { sendPurchaseConfirmationEmail, sendCoachingConfirmationEmail, sendTestimonialNotificationEmail, sendCritiqueNotificationEmail, sendCritiqueCompletedEmail, sendQuestionNotificationEmail, sendQuestionAnsweredEmail, sendDiscussionNotificationEmail, sendCoachingPurchaseNotificationEmail, sendReferralNotificationEmail, sendMagicLinkEmail, sendLoginHelpEmail, sendPasswordResetEmail, sendBadgeEarnedEmail, processDripEmails, sendCoachAssignmentEmail, sendBookNextSessionEmail, sendCoachInvitationEmail, sendCoachAgreementCopyEmail, sendCalcomSetupEmail, sendCoachNudgeEmail, sendCoachingRebookEmail } from "./emailService";
import { addContactToSysteme, addContactToSystemeDetailed } from "./systemeService";
import { magicTokens } from "@shared/schema";
import { generateBadgeImage, generateReferralImage } from "./badge-image";
import { callClaude, callClaudeForJSON, detectAbuse, checkRateLimit, logAIUsage, sendAbuseAlert } from "./aiService";

const dnsResolve = promisify(dns.resolve);

// Simple in-memory rate limiter for auth endpoints
const authAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = authAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    authAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxAttempts;
}

// Clean up stale rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  authAttempts.forEach((entry, key) => {
    if (now > entry.resetAt) authAttempts.delete(key);
  });
}, 10 * 60 * 1000);

// In-memory tracking for live users (no DB overhead)
interface LiveUserActivity {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  currentPage: string;
  lastSeen: Date;
}

const liveUsers = new Map<string, LiveUserActivity>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
  Array.from(liveUsers.entries()).forEach(([userId, activity]) => {
    if (activity.lastSeen < cutoff) {
      liveUsers.delete(userId);
    }
  });
}, 5 * 60 * 1000);

// Helper to track user activity (called on authenticated requests)
function trackUserActivity(user: any, page: string = 'unknown') {
  if (!user?.id) return;

  liveUsers.set(user.id, {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    currentPage: page,
    lastSeen: new Date(),
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Admin restore tokens - each works once, remove when no longer needed
  const restoreTokens = new Set([
    'r1-a4e8c7f2b91d3056',
    'r2-d7b3f1e8a04c9265',
    'r3-91c5a8d3e7f24b06',
    'r4-f6e2b9a1c8d03745',
    'r5-3a7d4c9e1b85f206',
    'r6-c8f1d5a7e3b09264',
    'r7-e4a9c2f6d1b73850',
    'r8-b5d8a3e7c9f01246',
    'r9-7c1f4b8e2a6d9350',
    'r10-a2e6d9c4f8b15073',
  ]);
  app.get('/api/restore/:token', async (req: any, res) => {
    const token = req.params.token;
    if (!restoreTokens.has(token)) {
      return res.status(404).json({ message: 'Invalid or already used.' });
    }
    await db.update(users).set({ isAdmin: true }).where(eq(users.id, '43411523'));
    restoreTokens.delete(token);
    res.json({ success: true, message: 'Admin access restored. Log out, log back in, then go to /admin.' });
  });

  // Email tracking endpoints (no auth - must be lightweight for tracking pixels)
  // 1x1 transparent PNG pixel for open tracking
  const TRACKING_PIXEL = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  app.get('/api/t/:trackingId/pixel.png', async (req, res) => {
    try {
      const { trackingId } = req.params;
      if (trackingId && trackingId.length > 10) {
        storage.recordEmailOpen(trackingId).catch(() => {});
      }
    } catch (_) {}
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': TRACKING_PIXEL.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(TRACKING_PIXEL);
  });

  app.get('/api/t/:trackingId/link', async (req, res) => {
    try {
      const { trackingId } = req.params;
      const url = req.query.url as string;
      if (trackingId && trackingId.length > 10) {
        storage.recordEmailClick(trackingId).catch(() => {});
      }
      if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
        return res.redirect(302, url);
      }
    } catch (_) {}
    res.redirect(302, 'https://challenge.mattwebley.com');
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Check if user is banned
      if (user?.isBanned) {
        return res.status(403).json({
          message: "Account suspended",
          banned: true,
          reason: user.banReason || "Your account has been suspended. Please contact support.",
        });
      }

      // Track user activity (for live users feature)
      if (user) {
        trackUserActivity(user, 'dashboard');
      }

      // Strip sensitive fields before sending to client
      if (user) {
        const { passwordHash, adminNotes, stripeCustomerId, ...safeUser } = user;
        res.json(safeUser);
      } else {
        res.json(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, profileImageUrl } = req.body;

      // Build update data
      const updateData: Record<string, any> = {
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
      };

      // Handle profile photo (base64 data URL, strict validation)
      if (profileImageUrl !== undefined) {
        if (profileImageUrl === null) {
          updateData.profileImageUrl = null;
        } else if (typeof profileImageUrl === 'string') {
          // 1. Only allow JPEG, PNG, WebP - NO SVG (can contain scripts)
          const allowedPrefixes = [
            'data:image/jpeg;base64,',
            'data:image/png;base64,',
            'data:image/webp;base64,',
          ];
          const matchedPrefix = allowedPrefixes.find(p => profileImageUrl.startsWith(p));
          if (!matchedPrefix) {
            return res.status(400).json({ message: "Invalid image format. Only JPEG, PNG, or WebP allowed." });
          }

          // 2. Size limit (300KB data URL ~= 200KB image)
          if (profileImageUrl.length > 300000) {
            return res.status(400).json({ message: "Photo too large. Please use a smaller image." });
          }

          // 3. Extract and validate base64
          const base64Data = profileImageUrl.slice(matchedPrefix.length);
          if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            return res.status(400).json({ message: "Invalid image data." });
          }

          // 4. Decode and check magic bytes to confirm it's actually an image
          const buffer = Buffer.from(base64Data, 'base64');
          const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
          const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
          const isWebP = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
                      && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

          if (!isJPEG && !isPNG && !isWebP) {
            return res.status(400).json({ message: "File content doesn't match image format. Upload rejected." });
          }

          // 5. Check decoded size (max 200KB actual image data)
          if (buffer.length > 200000) {
            return res.status(400).json({ message: "Photo too large after decoding." });
          }

          updateData.profileImageUrl = profileImageUrl;
        }
      }

      // Update user in database
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      // Fetch updated user
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Magic link login - request a magic link
  app.post('/api/auth/magic-link', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Rate limit: 3 requests per email per hour
      if (isRateLimited(`magic:${normalizedEmail}`, 3, 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Too many requests. Please try again later." });
      }

      // Check if this email has any purchases - only send magic links to paying customers
      const pendingPurchase = await db.select().from(pendingPurchases)
        .where(sql`lower(${pendingPurchases.email}) = ${normalizedEmail}`)
        .limit(1);

      const coachingPurchase = await db.select().from(coachingPurchases)
        .where(sql`lower(${coachingPurchases.email}) = ${normalizedEmail}`)
        .limit(1);

      const existingUser = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`)
        .limit(1);

      // Only send magic links if they have a purchase (pending or completed) or are an existing paying user
      const hasPurchase = pendingPurchase.length > 0 || coachingPurchase.length > 0;
      const isPaidUser = existingUser.length > 0 && (existingUser[0].challengePurchased || existingUser[0].coachingPurchased || existingUser[0].isAdmin);

      if (!hasPurchase && !isPaidUser) {
        // Don't reveal if email exists - always say "sent"
        return res.json({
          success: true,
          message: "If you have a purchase with this email, you'll receive a login link shortly."
        });
      }

      // Generate a secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store the token
      await db.insert(magicTokens).values({
        email: normalizedEmail,
        token,
        expiresAt,
      });

      // Send the magic link email - always use production URL
      const magicLink = `https://challenge.mattwebley.com/api/auth/magic-link/verify?token=${token}`;

      console.log('[Magic Link] Sending to:', normalizedEmail);
      console.log('[Magic Link] URL:', magicLink);

      const emailSent = await sendMagicLinkEmail(normalizedEmail, magicLink);

      if (!emailSent) {
        console.error('[Magic Link] Email failed to send for:', normalizedEmail);
        return res.status(500).json({ message: "Failed to send login link. Please try again." });
      }

      console.log('[Magic Link] Email sent successfully to:', normalizedEmail);

      res.json({
        success: true,
        message: "If you have a purchase with this email, you'll receive a login link shortly."
      });
    } catch (error) {
      console.error("Error requesting magic link:", error);
      res.status(500).json({ message: "Failed to send login link" });
    }
  });

  // Magic link login - verify token and create session
  app.get('/api/auth/magic-link/verify', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.redirect('/auth/error?reason=invalid_token');
      }

      // Find the token
      const tokenRecord = await db.select().from(magicTokens)
        .where(eq(magicTokens.token, token))
        .limit(1);

      if (tokenRecord.length === 0) {
        return res.redirect('/auth/error?reason=invalid_token');
      }

      const magicToken = tokenRecord[0];

      // Check if already used
      if (magicToken.usedAt) {
        return res.redirect('/auth/error?reason=token_used');
      }

      // Check if expired
      if (new Date() > magicToken.expiresAt) {
        return res.redirect('/auth/error?reason=token_expired');
      }

      // Mark token as used
      await db.update(magicTokens)
        .set({ usedAt: new Date() })
        .where(eq(magicTokens.token, token));

      // Find or create user by email
      const tokenEmail = magicToken.email.toLowerCase().trim();
      let user = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${tokenEmail}`)
        .limit(1)
        .then(rows => rows[0]);

      if (!user) {
        // Create a new user
        const newUserId = crypto.randomUUID();
        await db.insert(users).values({
          id: newUserId,
          email: magicToken.email,
        });
        const newUser = await storage.getUser(newUserId);
        if (!newUser) {
          return res.redirect('/auth/error?reason=server_error');
        }
        user = newUser;
      }

      // Link any pending purchases to this user
      const pending = await db.select().from(pendingPurchases)
        .where(sql`lower(${pendingPurchases.email}) = ${tokenEmail}`);

      for (const purchase of pending) {
        if (!purchase.linkedToUserId) {
          // Grant the purchase to the user
          if (purchase.productType.startsWith('challenge')) {
            const hasUnlock = purchase.productType.includes('+unlock');
            await db.update(users)
              .set({
                challengePurchased: true,
                ...(hasUnlock ? { allDaysUnlocked: true } : {}),
                stripeCustomerId: purchase.stripeCustomerId,
                purchaseCurrency: purchase.currency as 'usd' | 'gbp',
              })
              .where(eq(users.id, user!.id));
          } else if (purchase.productType.includes('coaching')) {
            await db.update(users)
              .set({ coachingPurchased: true, allDaysUnlocked: true })
              .where(eq(users.id, user!.id));
          }
          // If user missing name, populate from pending purchase
          if (!user!.firstName && purchase.firstName) {
            await db.update(users)
              .set({ firstName: purchase.firstName })
              .where(eq(users.id, user!.id));
            user!.firstName = purchase.firstName;
          }
          if (!user!.lastName && purchase.lastName) {
            await db.update(users)
              .set({ lastName: purchase.lastName })
              .where(eq(users.id, user!.id));
            user!.lastName = purchase.lastName;
          }

          // Mark purchase as linked
          await db.update(pendingPurchases)
            .set({ linkedToUserId: user!.id, linkedAt: new Date() })
            .where(eq(pendingPurchases.id, purchase.id));
        }
      }

      // Also link any coaching purchases from the coaching table
      const coachingPurchasesList = await db.select().from(coachingPurchases)
        .where(sql`lower(${coachingPurchases.email}) = ${tokenEmail}`);

      if (coachingPurchasesList.length > 0) {
        // Grant coaching access and link purchases to user
        await db.update(users)
          .set({ coachingPurchased: true, allDaysUnlocked: true })
          .where(eq(users.id, user!.id));

        for (const coaching of coachingPurchasesList) {
          if (!coaching.userId) {
            await db.update(coachingPurchases)
              .set({ userId: user!.id })
              .where(eq(coachingPurchases.id, coaching.id));
          }
        }
      }

      // Track login
      await db.update(users)
        .set({ lastLoginAt: new Date(), loginCount: (user!.loginCount || 0) + 1 })
        .where(eq(users.id, user!.id));

      // Create a session for the user
      // Store user info in session
      if (req.session) {
        (req.session as any).userId = user!.id;
        (req.session as any).userEmail = magicToken.email;
        (req.session as any).magicLinkAuth = true;
      }

      // Save session to database BEFORE redirecting (prevents race condition
      // where browser follows redirect before session is persisted)
      req.session.save((err) => {
        if (err) {
          console.error("Error saving magic link session:", err);
          return res.redirect('/auth/error?reason=server_error');
        }
        res.redirect('/welcome');
      });
    } catch (error) {
      console.error("Error verifying magic link:", error);
      res.redirect('/auth/error?reason=server_error');
    }
  });

  // =============================================
  // COACH SETUP (public - token-based)
  // =============================================

  // GET /api/coach/setup/:token - Validate token and return invitation details + contract
  app.get('/api/coach/setup/:token', async (req, res) => {
    try {
      const { token } = req.params;

      const [invitation] = await db.select().from(coachInvitations)
        .where(eq(coachInvitations.token, token));

      if (!invitation) {
        return res.status(404).json({ message: "Invalid invitation link" });
      }

      if (invitation.status !== 'pending') {
        return res.status(410).json({ message: "This invitation has already been used" });
      }

      if (new Date() > invitation.expiresAt) {
        // Mark as expired
        await db.update(coachInvitations).set({ status: 'expired' }).where(eq(coachInvitations.id, invitation.id));
        return res.status(410).json({ message: "This invitation has expired. Please ask for a new one." });
      }

      const contractText = getCoachContractText(invitation.email, invitation.ratePerSession, invitation.rateCurrency);

      res.json({
        email: invitation.email,
        ratePerSession: invitation.ratePerSession,
        rateCurrency: invitation.rateCurrency,
        contractText,
      });
    } catch (error: any) {
      console.error("Error validating coach setup token:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });

  // POST /api/coach/setup/:token - Sign contract and create coach account
  app.post('/api/coach/setup/:token', async (req: any, res) => {
    try {
      const { token } = req.params;
      const { firstName, lastName, password, signatureName, agreedToContract, calComLink } = req.body;

      // Validate inputs
      if (!firstName || !lastName || !password || !signatureName || !agreedToContract) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      // Validate token
      const [invitation] = await db.select().from(coachInvitations)
        .where(eq(coachInvitations.token, token));

      if (!invitation) {
        return res.status(404).json({ message: "Invalid invitation link" });
      }
      if (invitation.status !== 'pending') {
        return res.status(410).json({ message: "This invitation has already been used" });
      }
      if (new Date() > invitation.expiresAt) {
        await db.update(coachInvitations).set({ status: 'expired' }).where(eq(coachInvitations.id, invitation.id));
        return res.status(410).json({ message: "This invitation has expired" });
      }

      const normalizedEmail = invitation.email.toLowerCase().trim();

      // Capture IP and User Agent
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Create or update user
      let userId: string;
      const [existing] = await db.select().from(users).where(sql`lower(${users.email}) = ${normalizedEmail}`);

      const salt = randomBytes(16).toString('hex');
      const hash = scryptSync(password, salt, 64).toString('hex');
      const passwordHash = `${salt}:${hash}`;

      if (existing) {
        userId = existing.id;
        await db.update(users).set({
          isCoach: true,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          passwordHash,
        }).where(eq(users.id, userId));
      } else {
        userId = crypto.randomUUID();
        await db.insert(users).values({
          id: userId,
          email: normalizedEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          passwordHash,
          isCoach: true,
        });
      }

      // Create coach profile
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      const [newCoach] = await db.insert(coaches).values({
        userId,
        displayName,
        email: normalizedEmail,
        calComLink: calComLink?.trim() || null,
        ratePerSession: invitation.ratePerSession,
        rateCurrency: invitation.rateCurrency,
      }).returning();

      // Store signed agreement
      const contractText = getCoachContractText(invitation.email, invitation.ratePerSession, invitation.rateCurrency);
      const signedAt = new Date();

      await db.insert(coachAgreements).values({
        coachId: newCoach.id,
        userId,
        agreementVersion: '1.0',
        fullText: contractText,
        signedAt,
        ipAddress,
        userAgent,
        signatureName: signatureName.trim(),
      });

      // Mark invitation as accepted
      await db.update(coachInvitations).set({ status: 'accepted' }).where(eq(coachInvitations.id, invitation.id));

      // Create session (same pattern as magic link auth)
      if (req.session) {
        (req.session as any).userId = userId;
        (req.session as any).userEmail = normalizedEmail;
        (req.session as any).magicLinkAuth = true;
      }

      // Email signed contract to Matt
      sendCoachAgreementCopyEmail({
        coachName: displayName,
        coachEmail: normalizedEmail,
        signedAt: signedAt.toISOString(),
        ipAddress,
        signatureName: signatureName.trim(),
        agreementText: contractText,
      }).catch(err => console.error('Failed to send agreement copy:', err));

      res.json({ success: true, message: "Account created and contract signed" });
    } catch (error: any) {
      console.error("Error completing coach setup:", error);
      res.status(500).json({ message: error.message || "Something went wrong" });
    }
  });

  // Set up password for current user (after magic link login)
  app.post('/api/auth/set-password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      // Hash the password using scrypt
      const salt = randomBytes(16).toString('hex');
      const hash = scryptSync(password, salt, 64).toString('hex');
      const passwordHash = `${salt}:${hash}`;

      await db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, userId));

      res.json({ success: true, message: "Password set successfully" });
    } catch (error) {
      console.error("Error setting password:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });

  // Login with email and password
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Rate limit: 5 attempts per email per 15 minutes
      if (isRateLimited(`login:${normalizedEmail}`, 5, 15 * 60 * 1000)) {
        return res.status(429).json({ message: "Too many login attempts. Please try again in 15 minutes." });
      }

      // Find user by email
      const [user] = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`);

      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password (timing-safe comparison)
      const [salt, storedHash] = user.passwordHash.split(':');
      const hash = scryptSync(password, salt, 64).toString('hex');

      if (!timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      if (req.session) {
        (req.session as any).userId = user.id;
        (req.session as any).userEmail = user.email;
        (req.session as any).magicLinkAuth = true;
      }

      // Track login
      await db.update(users)
        .set({ lastLoginAt: new Date(), loginCount: (user.loginCount || 0) + 1 })
        .where(eq(users.id, user.id));

      res.json({ success: true, message: "Logged in successfully", isCoach: user.isCoach || false });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  // Register with email and password
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName } = req.body;

      if (!email || !password || !firstName) {
        return res.status(400).json({ message: "Email, password, and first name are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Rate limit: 3 registration attempts per email per hour
      if (isRateLimited(`register:${normalizedEmail}`, 3, 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Too many attempts. Please try again later." });
      }

      // Check if email already exists
      const [existing] = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`);

      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists. Try logging in instead." });
      }

      // Hash password
      const salt = randomBytes(16).toString('hex');
      const hash = scryptSync(password, salt, 64).toString('hex');
      const passwordHash = `${salt}:${hash}`;

      // Create user
      const newUserId = crypto.randomUUID();
      await db.insert(users).values({
        id: newUserId,
        email: normalizedEmail,
        firstName: firstName.trim(),
        passwordHash,
      });

      const newUser = await storage.getUser(newUserId);
      if (!newUser) {
        return res.status(500).json({ message: "Failed to create account" });
      }

      // Link any pending purchases to this user
      const tokenEmail = normalizedEmail;
      const pending = await db.select().from(pendingPurchases)
        .where(sql`lower(${pendingPurchases.email}) = ${tokenEmail}`);

      for (const purchase of pending) {
        if (!purchase.linkedToUserId) {
          if (purchase.productType.startsWith('challenge')) {
            const hasUnlock = purchase.productType.includes('+unlock');
            await db.update(users)
              .set({
                challengePurchased: true,
                ...(hasUnlock ? { allDaysUnlocked: true } : {}),
                stripeCustomerId: purchase.stripeCustomerId,
                purchaseCurrency: purchase.currency as 'usd' | 'gbp',
              })
              .where(eq(users.id, newUserId));
          } else if (purchase.productType.includes('coaching')) {
            await db.update(users)
              .set({ coachingPurchased: true, allDaysUnlocked: true })
              .where(eq(users.id, newUserId));
          }
          if (!newUser.lastName && purchase.lastName) {
            await db.update(users)
              .set({ lastName: purchase.lastName })
              .where(eq(users.id, newUserId));
          }
          await db.update(pendingPurchases)
            .set({ linkedToUserId: newUserId, linkedAt: new Date() })
            .where(eq(pendingPurchases.id, purchase.id));
        }
      }

      // Also link coaching purchases
      const coachingPurchasesList = await db.select().from(coachingPurchases)
        .where(sql`lower(${coachingPurchases.email}) = ${tokenEmail}`);

      if (coachingPurchasesList.length > 0) {
        await db.update(users)
          .set({ coachingPurchased: true, allDaysUnlocked: true })
          .where(eq(users.id, newUserId));

        for (const coaching of coachingPurchasesList) {
          if (!coaching.userId) {
            await db.update(coachingPurchases)
              .set({ userId: newUserId })
              .where(eq(coachingPurchases.id, coaching.id));
          }
        }
      }

      // Track first login
      await db.update(users)
        .set({ lastLoginAt: new Date(), loginCount: 1 })
        .where(eq(users.id, newUserId));

      // Create session
      if (req.session) {
        (req.session as any).userId = newUserId;
        (req.session as any).userEmail = normalizedEmail;
        (req.session as any).magicLinkAuth = true;
      }

      res.json({ success: true, message: "Account created successfully" });
    } catch (error) {
      console.error("Error registering:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Forgot password - send reset email
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Rate limit: 3 per email per hour
      if (isRateLimited(`forgot:${normalizedEmail}`, 3, 60 * 60 * 1000)) {
        // Still return success to not reveal if email exists
        return res.json({ success: true, message: "If an account exists with that email, we've sent a password reset link." });
      }

      // Always return success (don't reveal if email exists)
      const [user] = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`);

      if (user) {
        // Generate reset token and store in magicTokens table
        const token = crypto.randomUUID();
        await db.insert(magicTokens).values({
          email: normalizedEmail,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });

        const resetLink = `https://challenge.mattwebley.com/reset-password?token=${token}`;
        await sendPasswordResetEmail(normalizedEmail, resetLink);
      }

      res.json({ success: true, message: "If an account exists with that email, we've sent a password reset link." });
    } catch (error) {
      console.error("Error sending reset email:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  // Reset password with token
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      // Look up token
      const [resetToken] = await db.select().from(magicTokens)
        .where(eq(magicTokens.token, token));

      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
      }

      if (resetToken.usedAt) {
        return res.status(400).json({ message: "This reset link has already been used. Please request a new one." });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "This reset link has expired. Please request a new one." });
      }

      // Mark token as used
      await db.update(magicTokens)
        .set({ usedAt: new Date() })
        .where(eq(magicTokens.id, resetToken.id));

      // Find user and update password
      const tokenEmail = resetToken.email.toLowerCase().trim();
      const [user] = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${tokenEmail}`);

      if (!user) {
        return res.status(400).json({ message: "No account found for this email." });
      }

      // Hash new password
      const salt = randomBytes(16).toString('hex');
      const hash = scryptSync(password, salt, 64).toString('hex');
      const passwordHash = `${salt}:${hash}`;

      await db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, user.id));

      res.json({ success: true, message: "Password updated successfully. You can now log in." });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Helper to generate unsubscribe confirmation HTML page
  function unsubscribeHTML(message: string, success: boolean): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${success ? 'Unsubscribed' : 'Error'} - 21-Day AI SaaS Challenge</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f8fafc;color:#334155}
.box{background:#fff;border:2px solid #e2e8f0;border-radius:12px;padding:40px;max-width:440px;text-align:center}
h1{font-size:20px;margin:0 0 12px}p{margin:0;line-height:1.6}
a{color:#2563eb;text-decoration:none}</style></head>
<body><div class="box"><h1>${success ? 'Done!' : 'Oops'}</h1><p>${message}</p>
${success ? '<p style="margin-top:16px"><a href="https://challenge.mattwebley.com/dashboard">Back to Dashboard</a></p>' : ''}
</div></body></html>`;
  }

  // Drip email unsubscribe (public - no auth needed, clicked from email)
  app.get('/api/drip/unsubscribe', async (req, res) => {
    try {
      const { uid, token } = req.query;

      if (!uid || !token) {
        return res.status(400).send(unsubscribeHTML('Invalid unsubscribe link.', false));
      }

      // Verify token
      const expectedToken = crypto.createHmac('sha256', 'drip-unsubscribe-salt')
        .update(uid as string)
        .digest('hex')
        .slice(0, 16);

      if (token !== expectedToken) {
        return res.status(400).send(unsubscribeHTML('Invalid unsubscribe link.', false));
      }

      // Set unsubscribed
      const user = await storage.getUser(uid as string);
      if (!user) {
        return res.status(400).send(unsubscribeHTML('User not found.', false));
      }

      await storage.updateUser(uid as string, { dripUnsubscribed: true } as any);
      res.send(unsubscribeHTML(`You've been unsubscribed from the daily challenge emails, ${user.firstName || ''}.`, true));
    } catch (error) {
      console.error('Unsubscribe error:', error);
      res.status(500).send(unsubscribeHTML('Something went wrong. Please try again or email matt@mattwebley.com.', false));
    }
  });

  // Heartbeat endpoint for live user tracking (lightweight, no DB)
  app.post('/api/heartbeat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { page } = req.body;

      if (user) {
        trackUserActivity(user, page || 'unknown');
      }

      res.json({ ok: true });
    } catch (error) {
      res.json({ ok: true }); // Don't fail - this is non-critical
    }
  });

  // Admin endpoint to get live users (only fetched when admin is viewing)
  app.get('/api/admin/live-users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get users active in the last 3 minutes
      const cutoff = new Date(Date.now() - 3 * 60 * 1000);
      const activeUsers: LiveUserActivity[] = Array.from(liveUsers.values()).filter(
        (activity) => activity.lastSeen >= cutoff
      );

      // Sort by most recently seen
      activeUsers.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());

      res.json({
        count: activeUsers.length,
        users: activeUsers,
      });
    } catch (error) {
      console.error("Error fetching live users:", error);
      res.status(500).json({ message: "Failed to fetch live users" });
    }
  });

  // Day content routes (require auth + purchase)
  app.get("/api/days", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.challengePurchased && !user?.coachingPurchased && !user?.allDaysUnlocked && !user?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const days = await storage.getAllDayContent();
      res.json(days);
    } catch (error) {
      console.error("Error fetching day content:", error);
      res.status(500).json({ message: "Failed to fetch day content" });
    }
  });

  app.get("/api/days/:day", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.challengePurchased && !user?.coachingPurchased && !user?.allDaysUnlocked && !user?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const day = parseInt(req.params.day);
      const content = await storage.getDayContent(day);
      if (!content) {
        return res.status(404).json({ message: "Day not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching day content:", error);
      res.status(500).json({ message: "Failed to fetch day content" });
    }
  });

  // Admin route to create/update day content (protected)
  app.post("/api/admin/days", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const parsed = insertDayContentSchema.parse(req.body);
      const content = await storage.createDayContent(parsed);
      res.json(content);
    } catch (error: any) {
      console.error("Error creating day content:", error);
      res.status(400).json({ message: error.message || "Failed to create day content" });
    }
  });

  app.patch("/api/admin/days/:day", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const day = parseInt(req.params.day);
      const updated = await storage.updateDayContent(day, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Day not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating day content:", error);
      res.status(400).json({ message: error.message || "Failed to update day content" });
    }
  });

  // User progress routes
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.get("/api/progress/:day", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const day = parseInt(req.params.day);
      const progress = await storage.getUserProgressForDay(userId, day);
      res.json(progress || null);
    } catch (error) {
      console.error("Error fetching day progress:", error);
      res.status(500).json({ message: "Failed to fetch day progress" });
    }
  });

  app.post("/api/progress/complete/:day", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const day = parseInt(req.params.day);

      if (isNaN(day) || day < 0 || day > 21) {
        return res.status(400).json({ message: "Invalid day number" });
      }

      // --- Server-side day access enforcement ---
      const user = await storage.getUser(userId);
      const hasPurchased = user?.challengePurchased || false;
      const hasCoaching = user?.coachingPurchased || false;
      const hasUnlockedAll = user?.allDaysUnlocked || false;
      const isAdmin = user?.isAdmin || false;

      // Must have purchased the challenge (or be admin/coaching)
      if (!hasPurchased && !hasCoaching && !isAdmin) {
        return res.status(403).json({ message: "You need to purchase the challenge to access this content." });
      }

      // Coaching purchasers, unlock-all buyers, and admins bypass all drip restrictions
      if (!hasCoaching && !hasUnlockedAll && !isAdmin) {
        // Check 1: Previous day must be completed (except Day 0)
        if (day > 0) {
          const allProgress = await storage.getUserProgress(userId);
          const completedDays = new Set(allProgress.filter(p => p.completed).map(p => p.day));

          if (!completedDays.has(day - 1)) {
            return res.status(403).json({ message: `You must complete Day ${day - 1} before starting Day ${day}` });
          }
        }

        // Check 2: Time-based drip (Day 0 & 1 available immediately, then 1 per day)
        if (day >= 2) {
          const userCreatedAt = user?.createdAt || new Date();
          const daysSinceStart = Math.floor((Date.now() - new Date(userCreatedAt).getTime()) / (1000 * 60 * 60 * 24));
          const maxAllowedDay = daysSinceStart + 1; // Day 0 & 1 on signup, then +1 per day

          if (day > maxAllowedDay) {
            return res.status(403).json({ message: "This day hasn't unlocked yet. New days unlock once per day." });
          }
        }
      }
      // --- End enforcement ---

      const { selectedSuggestion, microDecisionChoice, reflectionAnswer, ...componentData } = req.body;

      // Build userInputs from component data (customDomain, etc.)
      const userInputs = Object.keys(componentData).length > 0 ? componentData : undefined;

      const progress = await storage.completeDay(userId, day, {
        selectedSuggestion,
        microDecisionChoice,
        reflectionAnswer,
        userInputs,
      });

      if (day === 3) {
        const inputs = userInputs as Record<string, any> | undefined;
        const selectedCount = Array.isArray(inputs?.selectedFeatures) ? inputs?.selectedFeatures.length : 0;
        console.log(`[Day3] Completion`, {
          userId,
          selectedCount,
          hasCore: Array.isArray(inputs?.coreFeatures) && inputs?.coreFeatures.length > 0,
          hasShared: Array.isArray(inputs?.sharedFeatures) && inputs?.sharedFeatures.length > 0,
          hasUsp: Array.isArray(inputs?.uspFeatures) && inputs?.uspFeatures.length > 0,
        });
      }

      // Update user stats
      const stats = await storage.getUserStats(userId);
      if (stats) {
        const today = new Date().toDateString();
        const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate).toDateString() : null;
        
        let newStreak = stats.currentStreak || 0;
        if (lastActivity !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          if (lastActivity === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        await storage.updateUserStats(userId, {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, stats.longestStreak || 0),
          totalXp: (stats.totalXp || 0) + 100,
          lastCompletedDay: day,
          lastActivityDate: new Date(),
          nagResetAt: new Date(),
        });

        // Update Systeme.io tags at key milestones (fire and forget)
        if (user?.email && (day === 0 || day === 9 || day === 21)) {
          const tag = day === 0 ? 'Challenge Started' : day === 9 ? 'Challenge Building' : 'Challenge Finished';
          addContactToSysteme({
            email: user.email,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            tags: [tag],
          }).catch(err => console.error('[Systeme] Progress tag error:', err));
        }

        // Check for badge awards
        const allBadges = await storage.getAllBadges();
        const userBadgesEarned = await storage.getUserBadges(userId);
        const earnedBadgeIds = new Set(userBadgesEarned.map(ub => ub.badgeId));
        const updatedStats = await storage.getUserStats(userId);
        const totalXp = updatedStats?.totalXp || 0;

        // Check if user shared build in public (from Day 0 completion data in request body)
        const buildInPublicLink = req.body?.buildInPublic;
        const hasBuildInPublic = buildInPublicLink && typeof buildInPublicLink === 'string' && buildInPublicLink.length > 10;

        for (const badge of allBadges) {
          if (earnedBadgeIds.has(badge.id)) continue;

          let shouldAward = false;

          if (badge.triggerType === 'day_completed' && badge.triggerValue === day) {
            shouldAward = true;
          } else if (badge.triggerType === 'streak' && newStreak >= (badge.triggerValue || 0)) {
            shouldAward = true;
          } else if (badge.triggerType === 'xp' && totalXp >= (badge.triggerValue || 0)) {
            shouldAward = true;
          } else if (badge.triggerType === 'build_in_public' && hasBuildInPublic) {
            shouldAward = true;
          }

          if (shouldAward) {
            await storage.awardBadge(userId, badge.id);
            // Send badge notification email (fire and forget)
            if (user?.email) {
              sendBadgeEarnedEmail({
                to: user.email,
                firstName: user.firstName || 'there',
                badgeName: badge.name,
                badgeDescription: badge.description || `You earned the ${badge.name} badge!`,
              }).catch(err => console.error('Failed to send badge email:', err));
            }
          }
        }
      }

      res.json(progress);
    } catch (error: any) {
      console.error("Error completing day:", error);
      res.status(400).json({ message: error.message || "Failed to complete day" });
    }
  });

  // User stats routes
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let stats = await storage.getUserStats(userId);

      if (!stats) {
        stats = await storage.createUserStats({ userId });
      }

      // Include user's coaching/unlock status for unlock-all feature
      const user = await storage.getUser(userId);
      const hasCoaching = user?.coachingPurchased || false;
      const allDaysUnlocked = user?.allDaysUnlocked || false;

      // Calculate days since user started
      const userCreatedAt = user?.createdAt || new Date();
      const daysSinceStart = Math.floor((Date.now() - new Date(userCreatedAt).getTime()) / (1000 * 60 * 60 * 24));

      res.json({ ...stats, hasCoaching, allDaysUnlocked, daysSinceStart });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Admin stats route
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await storage.getAllUsers();
      const allStats = await storage.getAllUserStats();
      const allProgress = await storage.getAllUserProgress();

      // Count pending purchasers who haven't created accounts
      const allPending = await db.select().from(pendingPurchases).where(
        isNull(pendingPurchases.linkedToUserId)
      );
      const registeredEmails = new Set(allUsers.map((u: any) => u.email?.toLowerCase()));
      const pendingCount = allPending.filter(p => !registeredEmails.has(p.email.toLowerCase())).length;

      // Calculate metrics
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeUsers = allStats.filter((s: any) => 
        s.lastActivityDate && new Date(s.lastActivityDate) > sevenDaysAgo
      ).length;
      
      const completedChallenges = allStats.filter((s: any) => 
        s.lastCompletedDay && s.lastCompletedDay >= 30
      ).length;
      
      const avgProgress = allStats.length > 0
        ? allStats.reduce((sum: number, s: any) => sum + ((s.lastCompletedDay || 0) / 30) * 100, 0) / allStats.length
        : 0;
      
      // Day completion counts
      const dayCompletions: Record<number, number> = {};
      allProgress.forEach((p: any) => {
        if (p.completed) {
          dayCompletions[p.day] = (dayCompletions[p.day] || 0) + 1;
        }
      });
      
      // User progress list with referral counts
      const userProgress = await Promise.all(allUsers.map(async (user: any) => {
        const stats = allStats.find((s: any) => s.userId === user.id);
        // Get Day 17 progress to find custom domain
        const day17Progress = allProgress.find((p: any) => p.userId === user.id && p.day === 17);
        const day17Inputs = day17Progress?.userInputs as Record<string, unknown> | null;
        const customDomain = day17Inputs?.customDomain as string | undefined;

        // Get referral count
        const referralCount = await storage.getReferralCount(user.id);

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          currentDay: (stats?.lastCompletedDay || 0) + 1,
          totalXp: stats?.totalXp || 0,
          lastActive: stats?.lastActivityDate,
          isActive: stats?.lastActivityDate && new Date(stats.lastActivityDate) > sevenDaysAgo,
          customDomain,
          referralCount,
          referralCode: user.referralCode,
        };
      }));
      
      res.json({
        totalUsers: allUsers.length + pendingCount,
        activeUsers,
        completedChallenges,
        avgProgress,
        dayCompletions,
        userProgress,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Admin diagnostics (quick sanity checks for live data)
  app.get("/api/admin/diagnostics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [usersCountRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      const [pendingCountRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pendingPurchases);
      const [coachingCountRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(coachingPurchases);

      const [lastUserRow] = await db
        .select({ last: sql<Date | null>`max(${users.createdAt})` })
        .from(users);
      const [lastPendingRow] = await db
        .select({ last: sql<Date | null>`max(${pendingPurchases.createdAt})` })
        .from(pendingPurchases);
      const [lastCoachingRow] = await db
        .select({ last: sql<Date | null>`max(${coachingPurchases.purchasedAt})` })
        .from(coachingPurchases);

      res.json({
        serverTime: new Date().toISOString(),
        host: req.hostname,
        nodeEnv: process.env.NODE_ENV || "unknown",
        databaseUrlSet: !!process.env.DATABASE_URL,
        stripeWebhookSecretSet: !!process.env.STRIPE_WEBHOOK_SECRET,
        counts: {
          users: Number(usersCountRow?.count || 0),
          pendingPurchases: Number(pendingCountRow?.count || 0),
          coachingPurchases: Number(coachingCountRow?.count || 0),
        },
        lastActivity: {
          userCreatedAt: lastUserRow?.last || null,
          pendingPurchaseAt: lastPendingRow?.last || null,
          coachingPurchaseAt: lastCoachingRow?.last || null,
          webhookAt: WebhookHandlers.lastWebhookAt,
          webhookType: WebhookHandlers.lastWebhookType,
        },
      });
    } catch (error) {
      console.error("Error fetching diagnostics:", error);
      res.status(500).json({ message: "Failed to fetch diagnostics" });
    }
  });

  // Get all coaching purchases
  app.get("/api/admin/coaching-purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const purchases = await db.select().from(coachingPurchases).orderBy(coachingPurchases.purchasedAt);
      const purchaseList = purchases.reverse(); // Most recent first

      // Also find users with coachingPurchased=true who don't have a coachingPurchases record
      // (e.g. manually granted via admin panel)
      const coachingUsers = await db.select().from(users).where(eq(users.coachingPurchased, true));
      const purchaseEmails = new Set(purchaseList.map(p => p.email.toLowerCase()));

      for (const cu of coachingUsers) {
        if (cu.email && !purchaseEmails.has(cu.email.toLowerCase())) {
          purchaseList.push({
            id: 0,
            userId: cu.id,
            email: cu.email,
            coachType: 'unknown',
            packageType: 'unknown',
            sessionsTotal: 0,
            amountPaid: 0,
            currency: cu.purchaseCurrency || 'gbp',
            stripeSessionId: null as any,
            assignedCoachId: null,
            coachNotes: null,
            dismissed: false,
            purchasedAt: cu.createdAt as any,
          });
        }
      }

      // Also include coaching purchases from pendingPurchases (guest purchases before account creation)
      const allPendingCoaching = await db.select().from(pendingPurchases)
        .where(sql`${pendingPurchases.productType} LIKE '%coaching%'`);
      for (const pp of allPendingCoaching) {
        if (!purchaseEmails.has(pp.email.toLowerCase())) {
          const isMatt = (pp.productType || '').includes('matt');
          const isSingle = (pp.productType || '').includes('single');
          purchaseList.push({
            id: 0,
            userId: null as any,
            email: pp.email,
            coachType: isMatt ? 'matt' : 'expert',
            packageType: isSingle ? 'single' : 'pack',
            sessionsTotal: isSingle ? 1 : 4,
            amountPaid: pp.amountPaid,
            currency: pp.currency,
            stripeSessionId: pp.stripeSessionId as any,
            assignedCoachId: null,
            coachNotes: null,
            dismissed: false,
            purchasedAt: pp.createdAt as any,
          });
          purchaseEmails.add(pp.email.toLowerCase());
        }
      }

      res.json(purchaseList);
    } catch (error) {
      console.error("Error fetching coaching purchases:", error);
      res.status(500).json({ message: "Failed to fetch coaching purchases" });
    }
  });

  // ========== USER MANAGEMENT ROUTES ==========

  // Get all users with detailed info
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await storage.getAllUsers();
      const allStats = await storage.getAllUserStats();
      const allProgress = await storage.getAllUserProgress();

      const usersWithDetails = await Promise.all(allUsers.map(async (user) => {
        const stats = allStats.find((s: any) => s.userId === user.id);
        const progress = allProgress.filter((p: any) => p.userId === user.id);
        const completedDays = progress.filter((p: any) => p.completed).length;

        return {
          ...user,
          stats: {
            lastCompletedDay: stats?.lastCompletedDay || 0,
            totalXp: stats?.totalXp || 0,
            currentStreak: stats?.currentStreak || 0,
            lastActivityDate: stats?.lastActivityDate,
          },
          completedDays,
        };
      }));

      // Include pending purchasers who haven't created accounts yet
      const allPending = await db.select().from(pendingPurchases).where(
        isNull(pendingPurchases.linkedToUserId)
      );
      const registeredEmails = new Set(allUsers.map((u: any) => u.email?.toLowerCase()));

      // Group pending purchases by email so each person shows once with all their purchases
      const pendingByEmail = new Map<string, typeof allPending>();
      for (const p of allPending) {
        const email = p.email.toLowerCase();
        if (registeredEmails.has(email)) continue;
        if (!pendingByEmail.has(email)) pendingByEmail.set(email, []);
        pendingByEmail.get(email)!.push(p);
      }

      const pendingUsers = Array.from(pendingByEmail.entries()).map(([, purchases]) => {
        const first = purchases[0]; // Use first purchase for basic info
        const hasChallenge = purchases.some(p => (p.productType || '').startsWith('challenge'));
        const hasCoaching = purchases.some(p => (p.productType || '').includes('coaching'));
        const hasUnlock = purchases.some(p => (p.productType || '').includes('unlock'));
        const totalPaid = purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        return {
          id: `pending_${first.id}`,
          email: first.email,
          firstName: first.firstName || purchases.find(p => p.firstName)?.firstName || null,
          lastName: first.lastName || purchases.find(p => p.lastName)?.lastName || null,
          profileImageUrl: null,
          isAdmin: false,
          challengePurchased: hasChallenge,
          coachingPurchased: hasCoaching,
          allDaysUnlocked: hasUnlock || hasCoaching,
          stripeCustomerId: first.stripeCustomerId,
          purchaseCurrency: first.currency,
          referralCode: null,
          adminNotes: null,
          isBanned: false,
          banReason: null,
          bannedAt: null,
          createdAt: first.createdAt,
          isPending: true,
          amountPaid: totalPaid,
          lastLoginAt: null,
          loginCount: 0,
          stats: {
            lastCompletedDay: 0,
            totalXp: 0,
            currentStreak: 0,
            lastActivityDate: null,
          },
          completedDays: 0,
        };
      });

      res.json([...usersWithDetails, ...pendingUsers]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get single user with full details
  app.get("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;

      // Handle pending users (id starts with "pending_")
      if (id.startsWith('pending_')) {
        const pendingId = parseInt(id.replace('pending_', ''));
        const [pending] = await db.select().from(pendingPurchases).where(eq(pendingPurchases.id, pendingId));
        if (!pending) {
          return res.status(404).json({ message: "Pending purchase not found" });
        }

        // Check magic token usage for this email
        const tokens = await db.select().from(magicTokens)
          .where(eq(magicTokens.email, pending.email))
          .orderBy(desc(magicTokens.createdAt));

        return res.json({
          isPending: true,
          email: pending.email,
          stripeCustomerId: pending.stripeCustomerId,
          currency: pending.currency,
          amountPaid: pending.amountPaid,
          productType: pending.productType,
          allDaysUnlocked: (pending.productType || "").includes("unlock"),
          purchasedAt: pending.createdAt,
          magicLinks: tokens.map(t => ({
            sentAt: t.createdAt,
            expiresAt: t.expiresAt,
            clicked: !!t.usedAt,
            clickedAt: t.usedAt,
          })),
          progress: [],
          comments: [],
          questions: [],
          chatMessageCount: 0,
          aiUsageCount: 0,
          badgesEarned: [],
          showcaseEntries: [],
          testimonial: null,
        });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Fetch everything about this user in parallel
      const [
        stats,
        progressData,
        userBadgeData,
        commentsData,
        questionsData,
        chatCount,
        aiUsageData,
        showcaseData,
        testimonialData,
        coachingData,
        tokenData,
        purchaseData,
      ] = await Promise.all([
        storage.getUserStats(id),
        db.select().from(userProgress).where(eq(userProgress.userId, id)).orderBy(userProgress.day),
        db.select({ badgeId: userBadges.badgeId, earnedAt: userBadges.earnedAt }).from(userBadges).where(eq(userBadges.userId, id)),
        db.select({ id: dayComments.id, day: dayComments.day, content: dayComments.content, status: dayComments.status, createdAt: dayComments.createdAt }).from(dayComments).where(eq(dayComments.userId, id)).orderBy(desc(dayComments.createdAt)),
        db.select({ id: dayQuestions.id, day: dayQuestions.day, question: dayQuestions.question, status: dayQuestions.status, createdAt: dayQuestions.createdAt }).from(dayQuestions).where(eq(dayQuestions.userId, id)).orderBy(desc(dayQuestions.createdAt)),
        db.select().from(chatMessages).where(eq(chatMessages.userId, id)),
        db.select({ id: aiUsageLogs.id, endpoint: aiUsageLogs.endpoint, tokensUsed: aiUsageLogs.tokensUsed, createdAt: aiUsageLogs.createdAt }).from(aiUsageLogs).where(eq(aiUsageLogs.userId, id)),
        db.select().from(showcase).where(eq(showcase.userId, id)),
        db.select().from(testimonials).where(eq(testimonials.userId, id)),
        db.select().from(coachingPurchases).where(eq(coachingPurchases.userId, id)),
        db.select().from(magicTokens).where(eq(magicTokens.email, user.email!)).orderBy(desc(magicTokens.createdAt)),
        db.select().from(pendingPurchases).where(
          or(
            eq(pendingPurchases.linkedToUserId, id),
            eq(pendingPurchases.email, user.email!)
          )
        ).orderBy(pendingPurchases.createdAt),
      ]);

      // Get badge names
      const allBadges = await db.select().from(badges);
      const badgesEarned = userBadgeData.map(ub => {
        const badge = allBadges.find(b => b.id === ub.badgeId);
        return { name: badge?.name || 'Unknown', earnedAt: ub.earnedAt };
      });

      // Calculate AI token total
      const totalAiTokens = aiUsageData.reduce((sum, log) => sum + (log.tokensUsed || 0), 0);

      res.json({
        ...user,
        stats,
        progress: progressData.map(p => ({
          day: p.day,
          completed: p.completed,
          completedAt: p.completedAt,
        })),
        comments: commentsData,
        questions: questionsData,
        chatMessageCount: chatCount.length,
        aiUsage: {
          totalRequests: aiUsageData.length,
          totalTokens: totalAiTokens,
        },
        badgesEarned,
        showcaseEntries: showcaseData,
        testimonial: testimonialData[0] || null,
        coachingPurchases: coachingData,
        purchaseHistory: purchaseData.map(p => ({
          productType: p.productType,
          amountPaid: p.amountPaid,
          currency: p.currency,
          purchasedAt: p.createdAt,
        })),
        magicLinks: tokenData.map(t => ({
          sentAt: t.createdAt,
          expiresAt: t.expiresAt,
          clicked: !!t.usedAt,
          clickedAt: t.usedAt,
        })),
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Link a pending purchase to an existing user account
  app.post("/api/admin/link-pending", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { pendingId, userId } = req.body;

      if (!pendingId || !userId) {
        return res.status(400).json({ message: "pendingId and userId are required" });
      }

      // Get the pending purchase
      const [pending] = await db.select().from(pendingPurchases)
        .where(eq(pendingPurchases.id, pendingId));

      if (!pending) {
        return res.status(404).json({ message: "Pending purchase not found" });
      }

      if (pending.linkedToUserId) {
        return res.status(400).json({ message: "This purchase is already linked to a user" });
      }

      // Get the target user
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      // Grant the purchase to the user
      if (pending.productType.startsWith('challenge')) {
        const hasUnlock = pending.productType.includes('+unlock');
        await db.update(users)
          .set({
            challengePurchased: true,
            ...(hasUnlock ? { allDaysUnlocked: true } : {}),
            stripeCustomerId: pending.stripeCustomerId,
            purchaseCurrency: pending.currency as 'usd' | 'gbp',
          })
          .where(eq(users.id, userId));
      } else if (pending.productType.includes('coaching')) {
        await db.update(users)
          .set({ coachingPurchased: true, allDaysUnlocked: true })
          .where(eq(users.id, userId));
      }

      // Populate missing name from pending purchase
      if (!targetUser.firstName && pending.firstName) {
        await db.update(users)
          .set({ firstName: pending.firstName })
          .where(eq(users.id, userId));
      }
      if (!targetUser.lastName && pending.lastName) {
        await db.update(users)
          .set({ lastName: pending.lastName })
          .where(eq(users.id, userId));
      }

      // Mark purchase as linked
      await db.update(pendingPurchases)
        .set({ linkedToUserId: userId, linkedAt: new Date() })
        .where(eq(pendingPurchases.id, pendingId));

      // Also link coaching purchases by email
      const coachingByEmail = await db.select().from(coachingPurchases)
        .where(sql`lower(${coachingPurchases.email}) = ${pending.email.toLowerCase()}`);

      if (coachingByEmail.length > 0) {
        await db.update(users)
          .set({ coachingPurchased: true, allDaysUnlocked: true })
          .where(eq(users.id, userId));

        for (const coaching of coachingByEmail) {
          if (!coaching.userId) {
            await db.update(coachingPurchases)
              .set({ userId })
              .where(eq(coachingPurchases.id, coaching.id));
          }
        }
      }

      res.json({ success: true, message: `Purchase linked to ${targetUser.email || targetUser.firstName || userId}` });
    } catch (error) {
      console.error("Error linking pending purchase:", error);
      res.status(500).json({ message: "Failed to link purchase" });
    }
  });

  // Create a user account from a pending purchase
  app.post("/api/admin/create-from-pending", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { pendingId } = req.body;

      if (!pendingId) {
        return res.status(400).json({ message: "pendingId is required" });
      }

      // Get the pending purchase
      const [pending] = await db.select().from(pendingPurchases)
        .where(eq(pendingPurchases.id, pendingId));

      if (!pending) {
        return res.status(404).json({ message: "Pending purchase not found" });
      }

      if (pending.linkedToUserId) {
        return res.status(400).json({ message: "This purchase is already linked to a user" });
      }

      // Check if a user with this email already exists
      const normalizedEmail = pending.email.toLowerCase().trim();
      const [existing] = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`);

      if (existing) {
        return res.status(409).json({ message: `A user with email ${pending.email} already exists. Use "Link Account" instead.` });
      }

      // Create the user account
      const newUserId = crypto.randomUUID();
      const hasUnlock = (pending.productType || "").includes("+unlock");

      await db.insert(users).values({
        id: newUserId,
        email: normalizedEmail,
        firstName: pending.firstName || null,
        lastName: pending.lastName || null,
        challengePurchased: pending.productType.startsWith("challenge"),
        coachingPurchased: pending.productType.includes("coaching"),
        allDaysUnlocked: hasUnlock,
        stripeCustomerId: pending.stripeCustomerId,
        purchaseCurrency: pending.currency as "usd" | "gbp",
      });

      // Mark purchase as linked
      await db.update(pendingPurchases)
        .set({ linkedToUserId: newUserId, linkedAt: new Date() })
        .where(eq(pendingPurchases.id, pendingId));

      // Also link coaching purchases by email
      const coachingByEmail = await db.select().from(coachingPurchases)
        .where(sql`lower(${coachingPurchases.email}) = ${normalizedEmail}`);

      if (coachingByEmail.length > 0) {
        await db.update(users)
          .set({ coachingPurchased: true, allDaysUnlocked: true })
          .where(eq(users.id, newUserId));

        for (const coaching of coachingByEmail) {
          if (!coaching.userId) {
            await db.update(coachingPurchases)
              .set({ userId: newUserId })
              .where(eq(coachingPurchases.id, coaching.id));
          }
        }
      }

      res.json({ success: true, message: `Account created for ${pending.email}. They can use "Forgot Password" to set a password and log in.` });
    } catch (error) {
      console.error("Error creating user from pending:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Backfill user names from pending purchases
  app.post("/api/admin/backfill-names", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Find users missing first or last names
      const allUsers = await db.select().from(users);
      let updated = 0;

      for (const user of allUsers) {
        if (!user.firstName && !user.lastName && user.email) {
          // Check pending purchases for name data
          const [pending] = await db.select().from(pendingPurchases)
            .where(sql`lower(${pendingPurchases.email}) = ${user.email.toLowerCase()}`);

          if (pending && (pending.firstName || pending.lastName)) {
            await db.update(users)
              .set({
                firstName: pending.firstName || user.firstName,
                lastName: pending.lastName || user.lastName,
              })
              .where(eq(users.id, user.id));
            updated++;
          }
        }
      }

      res.json({ success: true, message: `Updated names for ${updated} user(s)` });
    } catch (error) {
      console.error("Error backfilling names:", error);
      res.status(500).json({ message: "Failed to backfill names" });
    }
  });

  // Create new user
  app.post("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email, firstName, lastName, isAdmin, challengePurchased, coachingPurchased } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Generate a unique referral code
      const referralCode = `REF${Date.now().toString(36).toUpperCase()}`;

      const newUser = await storage.upsertUser({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        isAdmin: isAdmin || false,
        challengePurchased: challengePurchased || false,
        coachingPurchased: coachingPurchased || false,
        referralCode,
      });

      // Log activity
      const adminUserId = req.user?.claims?.sub;
      await storage.logActivity({
        userId: adminUserId,
        targetUserId: newUser.id,
        action: 'user_created',
        category: 'user',
        details: { email, challengePurchased, coachingPurchased },
        ipAddress: req.ip,
      });

      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user
  app.patch("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const {
        email,
        firstName,
        lastName,
        isAdmin,
        challengePurchased,
        coachingPurchased,
        allDaysUnlocked,
        stripeCustomerId,
        purchaseCurrency,
        adminNotes
      } = req.body;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If changing email, check it's not taken
      if (email && email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Protected admin accounts - cannot have admin status removed
      const PROTECTED_ADMIN_EMAILS = ['info@rapidwebsupport.com'];
      if (isAdmin === false && user.email && PROTECTED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return res.status(403).json({ message: "This admin account is protected and cannot be modified" });
      }

      const updated = await storage.updateUser(id, {
        email: email !== undefined ? email : user.email,
        firstName: firstName !== undefined ? firstName : user.firstName,
        lastName: lastName !== undefined ? lastName : user.lastName,
        isAdmin: isAdmin !== undefined ? isAdmin : user.isAdmin,
        challengePurchased: challengePurchased !== undefined ? challengePurchased : user.challengePurchased,
        coachingPurchased: coachingPurchased !== undefined ? coachingPurchased : user.coachingPurchased,
        allDaysUnlocked: allDaysUnlocked !== undefined ? allDaysUnlocked : user.allDaysUnlocked,
        stripeCustomerId: stripeCustomerId !== undefined ? stripeCustomerId : user.stripeCustomerId,
        purchaseCurrency: purchaseCurrency !== undefined ? purchaseCurrency : user.purchaseCurrency,
        adminNotes: adminNotes !== undefined ? adminNotes : user.adminNotes,
      });

      // Log activity with changes
      const adminUserId = req.user?.claims?.sub;
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      if (challengePurchased !== undefined && challengePurchased !== user.challengePurchased) {
        changes.challengePurchased = { from: user.challengePurchased, to: challengePurchased };
      }
      if (coachingPurchased !== undefined && coachingPurchased !== user.coachingPurchased) {
        changes.coachingPurchased = { from: user.coachingPurchased, to: coachingPurchased };
      }
      if (allDaysUnlocked !== undefined && allDaysUnlocked !== user.allDaysUnlocked) {
        changes.allDaysUnlocked = { from: user.allDaysUnlocked, to: allDaysUnlocked };
      }
      if (isAdmin !== undefined && isAdmin !== user.isAdmin) {
        changes.isAdmin = { from: user.isAdmin, to: isAdmin };
      }

      let action = 'user_updated';
      if (changes.challengePurchased && changes.challengePurchased.to) action = 'access_granted';
      else if (changes.challengePurchased && !changes.challengePurchased.to) action = 'access_revoked';
      else if (changes.isAdmin && changes.isAdmin.to) action = 'admin_granted';
      else if (changes.isAdmin && !changes.isAdmin.to) action = 'admin_revoked';

      await storage.logActivity({
        userId: adminUserId,
        targetUserId: id,
        action,
        category: 'user',
        details: { changes },
        ipAddress: req.ip,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user
  app.delete("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent deleting yourself
      if (req.user?.claims?.sub === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      // Protected admin accounts - cannot be deleted
      const PROTECTED_ADMIN_EMAILS = ['info@rapidwebsupport.com'];
      if (user.email && PROTECTED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return res.status(403).json({ message: "This admin account is protected and cannot be deleted" });
      }

      // Log before deletion (since user won't exist after)
      const adminUserId = req.user?.claims?.sub;
      await storage.logActivity({
        userId: adminUserId,
        action: 'user_deleted',
        category: 'user',
        details: { deletedUserId: id, deletedEmail: user.email },
        ipAddress: req.ip,
      });

      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Ban user
  app.post("/api/admin/users/:id/ban", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const adminUser = await storage.getUser(adminUserId);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent banning yourself
      if (id === adminUserId) {
        return res.status(400).json({ message: "Cannot ban yourself" });
      }

      // Prevent banning other admins
      if (user.isAdmin) {
        return res.status(400).json({ message: "Cannot ban an admin user" });
      }

      const updated = await storage.updateUser(id, {
        isBanned: true,
        banReason: reason || 'No reason provided',
        bannedAt: new Date(),
        bannedBy: adminUserId,
      });

      // Log activity
      await storage.logActivity({
        userId: adminUserId,
        targetUserId: id,
        action: 'user_banned',
        category: 'user',
        details: { reason: reason || 'No reason provided', userEmail: user.email },
        ipAddress: req.ip,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  // Unban user
  app.post("/api/admin/users/:id/unban", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const adminUser = await storage.getUser(adminUserId);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updated = await storage.updateUser(id, {
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null,
      });

      // Log activity
      await storage.logActivity({
        userId: adminUserId,
        targetUserId: id,
        action: 'user_unbanned',
        category: 'user',
        details: { userEmail: user.email },
        ipAddress: req.ip,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({ message: "Failed to unban user" });
    }
  });

  // Reset user progress (without deleting user)
  app.post("/api/admin/users/:id/reset-progress", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.deleteAllUserProgress(id);
      await storage.deleteUserBadges(id);

      // Reset user stats
      await storage.updateUserStats(id, {
        lastCompletedDay: 0,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
      });

      // Log activity
      const adminUserId = req.user?.claims?.sub;
      await storage.logActivity({
        userId: adminUserId,
        targetUserId: id,
        action: 'progress_reset',
        category: 'user',
        details: { userEmail: user.email },
        ipAddress: req.ip,
      });

      res.json({ message: "User progress reset successfully" });
    } catch (error) {
      console.error("Error resetting user progress:", error);
      res.status(500).json({ message: "Failed to reset user progress" });
    }
  });

  // Get detailed progress for a specific user (for admin)
  app.get("/api/admin/users/:id/progress", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const progress = await storage.getUserProgress(id);
      const stats = await storage.getUserStats(id);

      // Return all progress entries with their data
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        stats,
        progress: progress.map(p => ({
          day: p.day,
          completed: p.completed,
          completedAt: p.completedAt,
          userInputs: p.userInputs,
          generatedIdeas: p.generatedIdeas,
          shortlistedIdeas: p.shortlistedIdeas,
          selectedSuggestion: p.selectedSuggestion,
          microDecisionChoice: p.microDecisionChoice,
          reflectionAnswer: p.reflectionAnswer,
        })),
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Badge routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/badges/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Sync badges - check for any missing badges based on current progress
      const allBadges = await storage.getAllBadges();
      const existingUserBadges = await storage.getUserBadges(userId);
      const earnedBadgeIds = new Set(existingUserBadges.map(ub => ub.badgeId));

      // Get user's completed days
      const userProgressList = await storage.getUserProgress(userId);
      const completedDays = new Set(userProgressList.filter(p => p.completed).map(p => p.day));

      // Check if user has build in public link (from Day 0 progress)
      const day0Progress = userProgressList.find(p => p.day === 0);
      const day0Inputs = day0Progress?.userInputs as Record<string, unknown> | null;
      const buildInPublicLink = day0Inputs?.buildInPublic;
      const hasBuildInPublic = buildInPublicLink && typeof buildInPublicLink === 'string' && buildInPublicLink.length > 10;

      // Get user stats for streak
      const userStats = await storage.getUserStats(userId);
      const currentStreak = userStats?.currentStreak || 0;
      const totalXp = userStats?.totalXp || 0;

      // Award any missing badges
      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        let shouldAward = false;

        if (badge.triggerType === 'day_completed' && badge.triggerValue !== null && badge.triggerValue !== undefined && completedDays.has(badge.triggerValue)) {
          shouldAward = true;
        } else if (badge.triggerType === 'streak' && currentStreak >= (badge.triggerValue || 0)) {
          shouldAward = true;
        } else if (badge.triggerType === 'xp' && totalXp >= (badge.triggerValue || 0)) {
          shouldAward = true;
        } else if (badge.triggerType === 'build_in_public' && hasBuildInPublic) {
          shouldAward = true;
        }

        if (shouldAward) {
          await storage.awardBadge(userId, badge.id);
          console.log(`Retroactively awarded badge ${badge.name} to user ${userId}`);
        }
      }

      // Return updated badges list
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Badge image generation for social sharing
  app.get("/api/badge-image/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const badges = await storage.getAllBadges();

      // Find badge by slug (convert name to slug format)
      const badge = badges.find(b =>
        b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === slug
      );

      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      const imageBuffer = await generateBadgeImage({
        badgeName: badge.name,
        badgeIcon: badge.icon,
        badgeDescription: badge.description,
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error generating badge image:", error);
      res.status(500).json({ message: "Failed to generate badge image" });
    }
  });

  // Referral share image for social media
  app.get("/api/referral-image", async (req, res) => {
    try {
      const imageBuffer = await generateReferralImage();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error generating referral image:", error);
      res.status(500).json({ message: "Failed to generate referral image" });
    }
  });

  // Referral landing page with OG tags (for when referral links are shared)
  app.get("/api/share/referral", async (req, res) => {
    try {
      const host = req.get('host');
      const protocol = req.protocol;
      const baseUrl = `${protocol}://${host}`;
      const imageUrl = `${baseUrl}/api/referral-image`;
      const ref = req.query.ref || '';
      const shareUrl = ref ? `${baseUrl}/?ref=${ref}` : baseUrl;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Your Own AI SaaS in 21 Days</title>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="Build Your Own AI SaaS in 21 Days">
  <meta property="og:description" content="No coding required. 100% AI-powered. Join the 21-Day Challenge and launch your own software business.">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="Build Your Own AI SaaS in 21 Days">
  <meta name="twitter:description" content="No coding required. 100% AI-powered. Join the 21-Day Challenge and launch your own software business.">
  <meta name="twitter:image" content="${imageUrl}">

  <meta http-equiv="refresh" content="0;url=${shareUrl}">
</head>
<body>
  <p>Redirecting to the challenge...</p>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error serving referral share page:", error);
      res.status(500).send("Error loading page");
    }
  });

  // Badge share page with OG tags (under /api for dev server compatibility)
  app.get("/api/share/badge/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const badges = await storage.getAllBadges();

      const badge = badges.find(b =>
        b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === slug
      );

      if (!badge) {
        return res.status(404).send("Badge not found");
      }

      // Get the host for absolute URLs
      const host = req.get('host');
      const protocol = req.protocol;
      const baseUrl = `${protocol}://${host}`;
      const imageUrl = `${baseUrl}/api/badge-image/${slug}`;
      const shareUrl = `${baseUrl}/api/share/badge/${slug}`;

      // Return HTML with OG tags for social sharing
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${badge.name} - 21-Day AI SaaS Challenge Badge</title>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="I earned the ${badge.name} badge!">
  <meta property="og:description" content="${badge.description} - 21-Day AI SaaS Challenge by Matt Webley">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="I earned the ${badge.name} badge!">
  <meta name="twitter:description" content="${badge.description} - 21-Day AI SaaS Challenge by Matt Webley">
  <meta name="twitter:image" content="${imageUrl}">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: white;
    }
    .badge-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      max-width: 500px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .badge-icon {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 70px;
      margin: 0 auto 24px;
      box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
    }
    .badge-earned {
      font-size: 12px;
      color: #22c55e;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 8px;
    }
    .badge-name {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .badge-desc {
      font-size: 18px;
      color: #94a3b8;
      margin-bottom: 32px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
    }
    .branding {
      margin-top: 32px;
      font-size: 14px;
      color: #64748b;
    }
    .branding a {
      color: #94a3b8;
      text-decoration: none;
    }
    .branding a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="badge-card">
    <div class="badge-icon">${badge.icon}</div>
    <div class="badge-earned">Badge Earned</div>
    <h1 class="badge-name">${badge.name}</h1>
    <p class="badge-desc">${badge.description}</p>
    <a href="/" class="cta-button">Join the 21-Day Challenge</a>
    <p class="branding">by <a href="https://mattwebley.com" target="_blank">Matt Webley</a></p>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error serving badge share page:", error);
      res.status(500).send("Error loading badge");
    }
  });

  // Referral system routes
  // Generate a unique referral code for the user
  function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing chars like 0/O, 1/I/L
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Get user's referral info
  app.get("/api/referral", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate referral code if user doesn't have one
      if (!user.referralCode) {
        let code = generateReferralCode();
        // Make sure it's unique
        let existing = await storage.getUserByReferralCode(code);
        while (existing) {
          code = generateReferralCode();
          existing = await storage.getUserByReferralCode(code);
        }
        user = await storage.setUserReferralCode(userId, code) || user;
      }

      // Get referral stats
      const referralCount = await storage.getReferralCount(userId);
      const referralsList = await storage.getReferrals(userId);

      // Calculate rewards unlocked
      const rewards = {
        launchChecklist: referralCount >= 1,
        marketingPrompts: referralCount >= 3,
        critiqueVideo: referralCount >= 5,
        coachingCall: referralCount >= 10,
      };

      res.json({
        referralCode: user.referralCode,
        referralLink: `https://challenge.mattwebley.com/?ref=${user.referralCode}`,
        referralCount,
        referrals: referralsList,
        rewards,
        nextReward: referralCount < 1 ? { at: 1, name: "Launch Checklist" }
          : referralCount < 3 ? { at: 3, name: "Marketing Prompt Pack" }
          : referralCount < 5 ? { at: 5, name: "Custom Critique Video" }
          : referralCount < 10 ? { at: 10, name: "1-Hour Coaching Call" }
          : null,
      });
    } catch (error) {
      console.error("Error fetching referral info:", error);
      res.status(500).json({ message: "Failed to fetch referral info" });
    }
  });

  // Track a referral (called when a new user signs up with a referral code)
  app.post("/api/referral/track", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { referralCode } = req.body;

      if (!referralCode) {
        return res.status(400).json({ message: "Referral code required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow self-referral
      if (user.referralCode === referralCode) {
        return res.status(400).json({ message: "Cannot refer yourself" });
      }

      // Check if user was already referred
      if (user.referredBy) {
        return res.status(400).json({ message: "Already referred by someone" });
      }

      // Find the referrer
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      // Mark user as referred
      await storage.setUserReferredBy(userId, referralCode);

      // Create referral record
      await storage.createReferral(referrer.id, userId);

      // Check if referrer earned new badges
      const referralCount = await storage.getReferralCount(referrer.id);

      // Send notification email to Matt
      const referrerName = `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || 'Unknown';
      const newUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
      sendReferralNotificationEmail({
        referrerEmail: referrer.email || 'unknown',
        referrerName,
        newUserEmail: user.email || 'unknown',
        newUserName,
        referralCount
      }).catch(err => console.error('Referral notification error:', err));
      const allBadges = await storage.getAllBadges();
      const userBadges = await storage.getUserBadges(referrer.id);
      const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        if (badge.triggerType === 'referral' && referralCount >= (badge.triggerValue || 0)) {
          await storage.awardBadge(referrer.id, badge.id);
          console.log(`Awarded referral badge ${badge.name} to user ${referrer.id}`);
          if (referrer.email) {
            sendBadgeEarnedEmail({
              to: referrer.email,
              firstName: referrer.firstName || 'there',
              badgeName: badge.name,
              badgeDescription: badge.description || `You earned the ${badge.name} badge!`,
            }).catch(err => console.error('Failed to send badge email:', err));
          }
        }
      }

      res.json({ success: true, referrerId: referrer.id });
    } catch (error) {
      console.error("Error tracking referral:", error);
      res.status(500).json({ message: "Failed to track referral" });
    }
  });

  // Day 1: Generate SaaS ideas based on user inputs
  app.post("/api/generate-ideas", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { knowledge, skills, interests, experience } = req.body;

      console.log(`[generate-ideas] Starting for user ${userId}`);
      console.log(`[generate-ideas] Inputs: knowledge=${knowledge?.length || 0} chars, skills=${skills?.length || 0} chars`);

      const userMessage = `Generate exactly 3 B2B SaaS product ideas for this user profile:

USER PROFILE:
- Knowledge/Expertise: ${knowledge}
- Skills: ${skills}
- Interests/Passions: ${interests}
- Work Experience: ${experience}

CRITICAL RULES:
1. Each idea should leverage ONE area where they have a clear advantage (knowledge, skills, OR experience)
2. DO NOT force weird combinations of all three unless it's genuinely natural
3. Focus on problems they ALREADY understand deeply from one of their inputs
4. Ideas should feel obvious given their background, not Frankenstein combinations
5. Make each idea DIFFERENT - don't give variations of the same concept

SCORING CRITERIA (rate each 1-5):
1. Market Demand - Is there proven demand? Are competitors making money?
2. Skill Match - Does it align with their skills and knowledge?
3. Passion Fit - Will they enjoy working on this?
4. Speed to MVP - Can they build an MVP in 21 days?
5. Monetization - Clear path to $1k+ MRR?

For each idea, provide:
- title: Short catchy name (2-4 words)
- desc: One sentence description of what it does
- targetCustomer: Who would pay for this
- scores: Object with marketDemand, skillMatch, passionFit, speedToMvp, monetization (each 1-5)
- totalScore: Sum of all scores (out of 25)
- whyThisWorks: One sentence explaining why THEIR background gives them an edge

Return JSON array of 3 ideas, sorted by totalScore descending.
Format: { "ideas": [...] }`;

      const result = await callClaudeForJSON<{ ideas: any[] }>({
        userId,
        endpoint: 'generate-ideas',
        endpointType: 'ideaGen',
        systemPrompt: 'You are a SaaS business idea expert. Generate exactly 3 diverse B2B SaaS product ideas where the user has a NATURAL ADVANTAGE. Each idea should be distinctly different. Return valid JSON only.',
        userMessage,
        maxTokens: 2000,
      });

      console.log(`[generate-ideas] Claude result: success=${result.success}, error=${result.error || 'none'}, ideas count=${result.data?.ideas?.length || 0}`);

      if (!result.success) {
        console.error(`[generate-ideas] Failed for user ${userId}:`, result.error);
        return res.status(result.error?.includes('limit') ? 429 : 500).json({
          message: result.error || "Failed to generate ideas"
        });
      }

      const ideas = result.data?.ideas || [];
      if (ideas.length === 0) {
        console.error(`[generate-ideas] No ideas returned for user ${userId}`);
        return res.status(500).json({ message: "AI generated no ideas. Please try again." });
      }

      console.log(`[generate-ideas] Success! Returning ${ideas.length} ideas for user ${userId}`);
      res.json(ideas);
    } catch (error: any) {
      console.error("[generate-ideas] Exception:", error);
      res.status(500).json({ message: error.message || "Failed to generate ideas" });
    }
  });

  // Save Day 1 progress with ideas
  app.post("/api/progress/day1", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userInputs, generatedIdeas, shortlistedIdeas, manualIdeas, previousIdeas } = req.body;

      // Bundle manualIdeas and previousIdeas into userInputs (no separate DB columns for these)
      const enrichedInputs = { ...userInputs, manualIdeas, previousIdeas };

      // Check if progress exists
      const existing = await storage.getUserProgressForDay(userId, 1);

      if (existing) {
        // Update existing progress
        const updated = await storage.updateUserProgress(existing.id, {
          userInputs: enrichedInputs,
          generatedIdeas,
          shortlistedIdeas,
        });
        res.json(updated);
      } else {
        // Create new progress
        const created = await storage.createUserProgress({
          userId,
          day: 1,
          userInputs: enrichedInputs,
          generatedIdeas,
          shortlistedIdeas,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 1 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Save Day 2 progress with chosen idea
  app.post("/api/progress/day2", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { chosenIdea, chosenIdeaTitle, selectedPainPoints, validationInsights, iHelpStatement } = req.body;

      const existing = await storage.getUserProgressForDay(userId, 2);

      // Build new inputs, only including fields that were provided
      const newInputs: Record<string, any> = {};
      if (chosenIdea !== undefined) newInputs.chosenIdea = chosenIdea;
      if (chosenIdeaTitle !== undefined) newInputs.chosenIdeaTitle = chosenIdeaTitle;
      if (selectedPainPoints !== undefined) newInputs.selectedPainPoints = selectedPainPoints;
      if (validationInsights !== undefined) newInputs.validationInsights = validationInsights;
      if (iHelpStatement !== undefined) newInputs.iHelpStatement = iHelpStatement;

      // Merge with existing data
      const existingInputs = (existing?.userInputs as Record<string, any>) || {};
      const progressData = {
        userInputs: { ...existingInputs, ...newInputs },
      };

      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day: 2,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 2 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Save Day 3 progress with features
  app.post("/api/progress/day3", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bleedingNeckProblem, coreFeatures, uspFeatures } = req.body;
      
      const existing = await storage.getUserProgressForDay(userId, 3);
      
      const progressData = {
        userInputs: { bleedingNeckProblem, coreFeatures, uspFeatures },
      };
      
      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day: 3,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 3 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Save Day 4 progress with pitch
  app.post("/api/progress/day4", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { who, what, benefit, finalPitch, pitchVariations } = req.body;
      
      const existing = await storage.getUserProgressForDay(userId, 4);
      
      const progressData = {
        userInputs: { who, what, benefit, finalPitch, pitchVariations },
      };
      
      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day: 4,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 4 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Reset all progress (for testing)
  app.post("/api/progress/reset-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteAllUserProgress(userId);
      await storage.deleteUserBadges(userId);
      res.json({ success: true, message: "All progress reset" });
    } catch (error: any) {
      console.error("Error resetting progress:", error);
      res.status(500).json({ message: error.message || "Failed to reset progress" });
    }
  });

  // Save Day 5 progress with MVP prioritization
  app.post("/api/progress/day5", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mustHaveFeatures, niceToHaveFeatures, cutFeatures, killerFeature, aiSuggestion } = req.body;
      
      const existing = await storage.getUserProgressForDay(userId, 5);
      
      const progressData = {
        userInputs: { mustHaveFeatures, niceToHaveFeatures, cutFeatures, killerFeature, aiSuggestion },
      };
      
      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day: 5,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 5 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Generic progress save endpoint (used by Day4Naming and others)
  app.post("/api/progress/:day(\\d+)", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const day = parseInt(req.params.day);
      const data = req.body;

      const existing = await storage.getUserProgressForDay(userId, day);

      const progressData = {
        userInputs: data,
      };

      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error(`Error saving Day ${req.params.day} progress:`, error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Generic AI prompt endpoint for Day 2 validation
  app.post("/api/ai-prompt", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { prompt } = req.body;

      const result = await callClaude({
        userId,
        endpoint: 'ai-prompt',
        endpointType: 'general',
        systemPrompt: 'You are a helpful assistant for the 21-Day AI SaaS Challenge. Be concise and actionable.',
        userMessage: prompt,
        maxTokens: 1500,
        temperature: 1,
      });

      if (!result.success) {
        return res.status(result.blocked ? 429 : 500).json({
          message: result.error || "Failed to run AI prompt"
        });
      }

      res.json({ response: result.response });
    } catch (error: any) {
      console.error("Error running AI prompt:", error);
      res.status(500).json({ message: error.message || "Failed to run AI prompt" });
    }
  });

  // Analyze website design from URL
  app.post("/api/analyze-design", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL is required" });
      }

      // Check rate limit
      const rateCheck = await checkRateLimit(userId, 'general');
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: rateCheck.reason });
      }

      // Validate URL format
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      // Use thum.io for free screenshots (no API key needed)
      const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/${cleanUrl}`;

      // Use callClaude for text-based design analysis (describe what to look for)
      const result = await callClaude({
        userId,
        endpoint: 'analyze-design',
        endpointType: 'general',
        systemPrompt: 'You are a UI/UX design expert helping users understand and recreate website design styles.',
        userMessage: `I'm looking at a website at ${cleanUrl}. Based on this URL and common design patterns for this type of site, describe what a similar design style might look like:

1. COLOR PALETTE: What colors would work well? (suggest hex codes)
2. OVERALL VIBE: Is it likely minimal, bold, playful, corporate, dark, light, etc?
3. SPACING: Recommend whitespace approach
4. TYPOGRAPHY FEEL: Suggest modern, classic, friendly, technical, or elegant?
5. SHADOWS & BORDERS: Recommend shadow and border styles
6. CORNERS: Sharp, slightly rounded, or very rounded?
7. SPECIAL EFFECTS: Suggest any gradients, glass effects, or animations

Then write a prompt I can give to Claude Code to create this style. Start the prompt with "Transform my app's design:" and include specific, actionable instructions.

Be creative and specific. Focus on what would make this design FEEL professional and polished.`,
        maxTokens: 1000,
      });

      if (!result.success) {
        return res.status(result.blocked ? 429 : 500).json({
          message: result.error || "Failed to analyze design."
        });
      }

      const analysis = result.response || "";

      // Extract the Claude Code prompt (everything after "Transform my app's design:")
      const promptMatch = analysis.match(/Transform my app's design:[\s\S]*/i);
      const generatedPrompt = promptMatch ? promptMatch[0] : analysis;

      res.json({
        analysis,
        generatedPrompt,
        screenshotUrl
      });
    } catch (error: any) {
      console.error("Error analyzing design:", error);
      res.status(500).json({ message: error.message || "Failed to analyze design. The website might be blocking screenshots." });
    }
  });

  // Domain availability check endpoint
  app.post("/api/check-domain", isAuthenticated, async (req: any, res) => {
    try {
      const { domain } = req.body;

      if (!domain || typeof domain !== 'string') {
        return res.status(400).json({ message: "Domain is required" });
      }

      // Clean the domain - remove protocol, www, and trailing slashes
      const cleanDomain = domain.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .trim();

      // Add timeout to DNS lookup
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('DNS_TIMEOUT')), 3000);
      });

      try {
        // Try to resolve DNS with timeout - if it fails, domain is likely available
        await Promise.race([dnsResolve(cleanDomain), timeoutPromise]);
        // DNS resolved - domain is taken
        res.json({ domain: cleanDomain, available: false });
      } catch (dnsError: any) {
        if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
          // No DNS records - domain is likely available
          res.json({ domain: cleanDomain, available: true });
        } else if (dnsError.message === 'DNS_TIMEOUT') {
          // Timeout - assume available (most invented names won't have DNS)
          res.json({ domain: cleanDomain, available: true });
        } else {
          // Other DNS error - assume available for invented names
          console.error("DNS lookup error:", dnsError.code || dnsError.message);
          res.json({ domain: cleanDomain, available: true });
        }
      }
    } catch (error: any) {
      console.error("Error checking domain:", error);
      res.status(500).json({ message: error.message || "Failed to check domain" });
    }
  });

  // Competitor Research endpoint for Day 3
  app.post("/api/research-competitors", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { ideaTitle, ideaDescription, targetCustomer } = req.body;

      const competitorResult = await callClaudeForJSON<{ competitors: any[] }>({
        userId,
        endpoint: 'research-competitors',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS market research expert. Only include REAL companies with real websites. Return valid JSON only.',
        userMessage: `Find DIRECT competitors for this SaaS idea:

Product: "${ideaTitle}"
Description: ${ideaDescription}
Target Customer: ${targetCustomer}

Find 4-5 REAL, EXISTING SaaS companies that do EXACTLY the same thing or very similar. For each competitor, provide:
1. Company name
2. Website URL (must be real and working)
3. A one-line description of what they do
4. Their top 5 features that they promote most prominently on their sales page

Respond in this exact JSON format:
{
  "competitors": [
    {
      "name": "Company Name",
      "url": "https://example.com",
      "description": "One line description",
      "topFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"]
    }
  ]
}`,
        maxTokens: 2000,
      });

      if (!competitorResult.success) {
        return res.status(competitorResult.error?.includes('limit') ? 429 : 500).json({
          message: competitorResult.error || "Failed to research competitors"
        });
      }

      const competitors = competitorResult.data?.competitors || [];

      // Add screenshot URLs using free screenshot service
      const competitorsWithScreenshots = competitors.map((comp: any) => ({
        ...comp,
        screenshotUrl: `https://shot.screenshotapi.net/screenshot?url=${encodeURIComponent(comp.url)}&width=400&height=300&output=image&file_type=png&wait_for_event=load`,
      }));

      // Find shared features across all competitors
      const allFeatures: Record<string, number> = {};
      competitorsWithScreenshots.forEach((comp: any) => {
        (comp.topFeatures || []).forEach((feature: string) => {
          const normalized = feature.toLowerCase().trim();
          allFeatures[normalized] = (allFeatures[normalized] || 0) + 1;
        });
      });

      // Features that appear in 2+ competitors are "core" features
      const sharedFeatureNames = Object.entries(allFeatures)
        .filter(([_, count]) => count >= 2)
        .map(([feature]) => feature.charAt(0).toUpperCase() + feature.slice(1))
        .slice(0, 8);

      // Generate detailed descriptions for shared features using AI
      let sharedFeaturesWithDetails = sharedFeatureNames.map(name => ({
        name,
        description: '',
        why: ''
      }));

      if (sharedFeatureNames.length > 0) {
        try {
          const descResult = await callClaudeForJSON<{ features: any[] }>({
            userId,
            endpoint: 'feature-descriptions',
            endpointType: 'features',
            systemPrompt: 'You are a SaaS product expert. Return valid JSON only.',
            userMessage: `For this product idea: "${ideaTitle}" (${ideaDescription}), explain these core features that all competitors have.

Target Customer: ${targetCustomer}

Core Features Found in Competitors:
${sharedFeatureNames.map((f, i) => `${i + 1}. ${f}`).join('\n')}

For EACH feature, provide:
1. A clear 1-sentence description of what this feature does
2. A 1-sentence explanation of why this feature is important/valuable to the target customer

Respond in this exact JSON format:
{
  "features": [
    {
      "name": "Feature Name",
      "description": "What this feature does...",
      "why": "Why customers need this..."
    }
  ]
}

Keep each description and why statement under 120 characters.`,
            maxTokens: 1500,
          });

          if (descResult.success && descResult.data?.features) {
            sharedFeaturesWithDetails = descResult.data.features;
          }
        } catch (error) {
          console.error("Error generating feature descriptions:", error);
          // Fall back to simple format if AI call fails
        }
      }

      res.json({
        competitors: competitorsWithScreenshots,
        sharedFeatures: sharedFeaturesWithDetails,
      });
    } catch (error: any) {
      console.error("Error researching competitors:", error);
      res.status(500).json({ message: error.message || "Failed to research competitors" });
    }
  });

  // Generate USP features based on competitors
  app.post("/api/generate-usp-features", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.coachingPurchased && !aiUser?.allDaysUnlocked && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { ideaTitle, ideaDescription, userSkills, sharedFeatures, competitors } = req.body;

      const competitorInfo = competitors.map((c: any) =>
        `${c.name}: ${c.topFeatures?.join(', ')}`
      ).join('\n');

      const result = await callClaude({
        userId,
        endpoint: 'generate-usp-features',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS positioning expert. Suggest unique differentiating features.',
        userMessage: `Based on this analysis, suggest unique differentiating features (USPs) for a new product.

Product: "${ideaTitle}"
Description: ${ideaDescription}
User's Skills: ${userSkills}

Competitor Features:
${competitorInfo}

Shared Core Features (what everyone has): ${sharedFeatures.join(', ')}

What are 5-7 UNIQUE features this product could have that competitors DON'T have? Focus on:
- Gaps in the market
- Features the user's skills enable
- Innovative approaches competitors haven't tried

List only the features, one per line, each under 10 words. No numbering or bullets.`,
        maxTokens: 500,
      });

      if (!result.success) {
        return res.status(result.blocked ? 429 : 500).json({
          message: result.error || "Failed to generate USP features"
        });
      }

      const features = (result.response || "")
        .split('\n')
        .map((line: string) => line.replace(/^[-•*\d.]+\s*/, '').trim())
        .filter((line: string) => line.length > 3 && line.length < 80);

      res.json({ uspFeatures: features });
    } catch (error: any) {
      console.error("Error generating USP features:", error);
      res.status(500).json({ message: error.message || "Failed to generate USP features" });
    }
  });

  // Generate all features for Day 3 (Core + Shared + USP)
  app.post("/api/ai/generate-features", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.coachingPurchased && !aiUser?.allDaysUnlocked && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { idea, painPoints } = req.body;

      // Step 1: Generate core features based on idea and pain points
      const coreResult = await callClaudeForJSON<{ coreFeatures: any[] }>({
        userId,
        endpoint: 'generate-core-features',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS product expert. Return valid JSON only.',
        userMessage: `Based on this idea and pain points, suggest 5-7 core features.

Product Idea: ${idea}

Pain Points to Solve:
${painPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

Generate 5-7 CORE features that directly solve these pain points. Each feature should:
- Solve at least one of the pain points
- Be specific and actionable
- Be essential to the product

Respond in this exact JSON format:
{
  "coreFeatures": [
    {
      "name": "Feature Name (3-6 words)",
      "description": "What this feature does and which pain point it solves (1 sentence, max 120 chars)"
    }
  ]
}`,
        maxTokens: 1500,
      });

      if (!coreResult.success) {
        return res.status(coreResult.error?.includes('limit') ? 429 : 500).json({
          message: coreResult.error || "Failed to generate features"
        });
      }

      const coreFeatures = coreResult.data?.coreFeatures || [];

      // Step 2: Find competitors and analyze shared features
      const competitorResult = await callClaudeForJSON<{ competitors: any[] }>({
        userId,
        endpoint: 'find-competitors',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS market research expert. Return valid JSON only.',
        userMessage: `Find 3-4 REAL competitors for this idea: "${idea}"

Find REAL, EXISTING SaaS companies that do the same or very similar thing. For each competitor, provide their top 3-5 features.

Respond in this exact JSON format:
{
  "competitors": [
    {
      "name": "Company Name",
      "topFeatures": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ]
}`,
        maxTokens: 1000,
      });

      const competitors = competitorResult.data?.competitors || [];

      // Find shared features across competitors
      const allFeatures: Record<string, number> = {};
      competitors.forEach((comp: any) => {
        (comp.topFeatures || []).forEach((feature: string) => {
          const normalized = feature.toLowerCase().trim();
          allFeatures[normalized] = (allFeatures[normalized] || 0) + 1;
        });
      });

      // Features that appear in 2+ competitors are "shared must-haves"
      const sharedFeatureNames = Object.entries(allFeatures)
        .filter(([_, count]) => count >= 2)
        .map(([feature]) => feature.charAt(0).toUpperCase() + feature.slice(1))
        .slice(0, 6);

      // Generate descriptions for shared features
      let sharedFeatures: any[] = [];
      if (sharedFeatureNames.length > 0) {
        const sharedResult = await callClaudeForJSON<{ sharedFeatures: any[] }>({
          userId,
          endpoint: 'describe-shared-features',
          endpointType: 'features',
          systemPrompt: 'You are a SaaS product expert. Return valid JSON only.',
          userMessage: `For this product idea: "${idea}", explain these features that all competitors have:

Shared Features:
${sharedFeatureNames.map((f, i) => `${i + 1}. ${f}`).join('\n')}

For EACH feature, provide:
1. A clear 1-sentence description (max 100 chars)

Respond in this exact JSON format:
{
  "sharedFeatures": [
    {
      "name": "Feature Name",
      "description": "What this feature does and why it's essential to compete (1 sentence, max 120 chars)"
    }
  ]
}`,
          maxTokens: 1000,
        });

        sharedFeatures = sharedResult.data?.sharedFeatures || [];
      }

      // Step 3: Generate USP features
      const uspResult = await callClaudeForJSON<{ uspFeatures: any[] }>({
        userId,
        endpoint: 'generate-usp-features',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS positioning expert. Return valid JSON only.',
        userMessage: `Based on this analysis, suggest 4-6 UNIQUE differentiating features.

Product Idea: ${idea}

Core Features (what we're building): ${coreFeatures.map((f: any) => f.name).join(', ')}
Shared Features (what competitors have): ${sharedFeatureNames.join(', ')}

Generate 4-6 UNIQUE features this product could have that competitors DON'T have. Focus on:
- Gaps in the market
- Innovative approaches competitors haven't tried
- Features that give a competitive advantage

Respond in this exact JSON format:
{
  "uspFeatures": [
    {
      "name": "Feature Name (3-6 words)",
      "description": "What makes this unique and why customers would want it (1 sentence, max 120 chars)"
    }
  ]
}`,
        maxTokens: 1000,
      });

      const uspFeatures = uspResult.data?.uspFeatures || [];

      res.json({
        coreFeatures,
        sharedFeatures,
        uspFeatures,
      });
    } catch (error: any) {
      console.error("Error generating features:", error);
      res.status(500).json({ message: error.message || "Failed to generate features" });
    }
  });

  // Generate MVP Roadmap for Day 4
  app.post("/api/ai/generate-mvp-roadmap", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { idea, features } = req.body;

      const result = await callClaudeForJSON<{ mvpFeatures: any[]; postMvpFeatures: any[] }>({
        userId,
        endpoint: 'generate-mvp-roadmap',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS product strategist. Return valid JSON only.',
        userMessage: `Create an MVP roadmap for this product idea.

Product Idea: ${idea}

All Features:
${features.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

Divide these features into two groups:
1. **MVP Features** (MUST build first): The minimum features needed to launch and deliver core value
2. **Post-MVP Features** (build after launch): Nice-to-haves that can wait

For each feature, estimate build time in weeks (be realistic).

Prioritize features that:
- Solve the core pain point
- Are essential to basic functionality
- Provide immediate value

De-prioritize features that:
- Are nice-to-have but not essential
- Can be added based on user feedback
- Are complex or time-consuming

Respond in this exact JSON format:
{
  "mvpFeatures": [
    {
      "name": "Feature Name",
      "description": "Why this is essential for MVP (1 sentence, max 100 chars)",
      "estimatedWeeks": 2
    }
  ],
  "postMvpFeatures": [
    {
      "name": "Feature Name",
      "description": "Why this can wait until after launch (1 sentence, max 100 chars)",
      "estimatedWeeks": 1
    }
  ]
}

Keep MVP scope tight - aim for 4-6 weeks total build time for MVP features.`,
        maxTokens: 2000,
      });

      if (!result.success) {
        return res.status(result.error?.includes('limit') ? 429 : 500).json({
          message: result.error || "Failed to generate MVP roadmap"
        });
      }

      res.json({
        mvpFeatures: result.data?.mvpFeatures || [],
        postMvpFeatures: result.data?.postMvpFeatures || [],
      });
    } catch (error: any) {
      console.error("Error generating MVP roadmap:", error);
      res.status(500).json({ message: error.message || "Failed to generate MVP roadmap" });
    }
  });

  // Generate PRD for Day 6
  app.post("/api/ai/generate-prd", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { idea, painPoints, features, mvpFeatures, appName, iHelpStatement, uspFeatures, brandVibe, customerAvatar, lookAndFeel } = req.body;

      // Generate summary
      const summaryResult = await callClaude({
        userId,
        endpoint: 'generate-prd-summary',
        endpointType: 'features',
        systemPrompt: 'You are a product strategist. Be concise and compelling.',
        userMessage: `Create a 3-4 sentence executive summary for this SaaS product.

Product Name: ${appName || 'TBD'}
Product Idea: ${idea}
${iHelpStatement ? `Value Proposition: "${iHelpStatement}"` : ''}
${customerAvatar ? `Target Customer: ${customerAvatar}` : ''}

Pain Points: ${painPoints.join(', ')}
MVP Features: ${mvpFeatures.join(', ')}
${uspFeatures && uspFeatures.length > 0 ? `Standout Features (USP): ${uspFeatures.join(', ')}` : ''}

Write a compelling executive summary that explains:
1. What the product is
2. What problem it solves
3. Who it's for (use the target customer description)
4. The key value proposition

Keep it concise, professional, and compelling. 3-4 sentences maximum.`,
        maxTokens: 500,
      });

      if (!summaryResult.success) {
        return res.status(summaryResult.blocked ? 429 : 500).json({
          message: summaryResult.error || "Failed to generate PRD"
        });
      }

      const summary = summaryResult.response || "";

      // Generate full PRD
      const prdResult = await callClaude({
        userId,
        endpoint: 'generate-prd',
        endpointType: 'features',
        systemPrompt: 'You are a senior product manager who writes PRDs specifically for SaaS products being built in Replit. You write PRDs that a non-technical founder can hand directly to an AI coding tool (like Claude Code) and start building immediately. No fluff, no filler, no generic advice. Every line should be specific and actionable for THIS product.',
        userMessage: `I need a PRD for my SaaS I'm building in Replit.

${appName ? `My SaaS NAME is "${appName}".` : ''}
My CUSTOMER AVATAR is: ${customerAvatar || 'Not specified yet'}
The PROBLEM my SaaS solves is: ${painPoints.map((p: string) => p).join('; ')}
${iHelpStatement ? `My VALUE PROPOSITION is: "${iHelpStatement}"` : ''}

My FEATURE set is:
${mvpFeatures.map((f: string) => `- ${f}`).join('\n')}
${features.filter((f: string) => !mvpFeatures.includes(f)).length > 0 ? `\nFuture features (not MVP):\n${features.filter((f: string) => !mvpFeatures.includes(f)).map((f: string) => `- ${f}`).join('\n')}` : ''}

${uspFeatures && uspFeatures.length > 0 ? `My USP is: ${uspFeatures.join('; ')}` : ''}
I want it to LOOK AND FEEL like: ${lookAndFeel || 'Modern and clean'}
${brandVibe ? `Brand vibe: ${brandVibe}` : ''}

Write the PRD in this exact format:

# ${appName || idea} — Product Requirements Document

## What It Is
[2-3 sentences. What does this product do, who is it for, and why does it exist? Write this so someone with zero context immediately understands the product.]

## Target User
[Use the customer avatar above. Paint a vivid picture: who are they, what's their day like, what's frustrating them right now, and what are they currently doing instead of using this product?]

## Core Problem
[The #1 pain point this solves. One clear sentence.]

## Unique Value Proposition
[What makes this different from alternatives? Why would someone switch to THIS product? Be specific — not "better UX" but exactly what's better.]

## MVP Features (Build These First)

[For EACH MVP feature, write:]

### [Feature Name]
**What the user does:** [The exact action — e.g. "Clicks 'New Project', fills in name and deadline, hits Save"]
**What the system does:** [The exact response — e.g. "Creates project record, shows it on dashboard with countdown timer"]
**It works when:** [Testable success criteria — e.g. "User can see their new project on the dashboard within 1 second of saving"]

## Pages & Navigation
[List every page/screen in the MVP. For each one: page name, what it shows, and key actions available. E.g.:]
[- **Dashboard** — Shows all projects as cards with status. User can create new, click to open, or archive.]
[- **Project Detail** — Shows tasks, deadline, progress bar. User can add/complete tasks.]

## Data Model
[List the database tables needed for MVP. For each table: name and key fields with types. E.g.:]
[- **users** — id, email, name, password_hash, created_at]
[- **projects** — id, user_id, name, deadline, status, created_at]

## API Endpoints
[List the essential API routes. Format: METHOD /path — what it does. Group by resource. E.g.:]
[- POST /api/auth/register — Create new account]
[- GET /api/projects — List user's projects]

## Third-Party Services
[Only list services actually needed. For each: what it is, what it's for, and whether it's required for MVP or can wait. E.g.:]
[- **Stripe** — Payments. Required for MVP if charging at launch.]
[- **Resend** — Transactional email. Can wait until post-MVP.]

## UI/UX Direction
[Based on "${lookAndFeel || 'modern and clean'}". Reference 1-2 real apps as visual inspiration. Describe the vibe in 2-3 sentences so a designer or AI tool knows exactly what to aim for.]

## Launch Checklist
[5-7 specific things that MUST work before real users touch this. Not generic best practices — specific to THIS product. E.g.:]
[- User can complete full signup → create first project → add tasks flow without errors]
[- Stripe checkout works with test card and creates paid account]

IMPORTANT: This PRD will be handed to an AI coding assistant to build. Make every section specific enough that a developer (human or AI) can start building without asking clarifying questions. No generic advice. No "ensure scalability". No "consider accessibility". Only what's needed for THIS specific product.`,
        maxTokens: 4000,
      });

      const prd = prdResult.response || "";

      res.json({
        summary,
        prd,
      });
    } catch (error: any) {
      console.error("Error generating PRD:", error);
      res.status(500).json({ message: error.message || "Failed to generate PRD" });
    }
  });

  // Chat/Comments routes
  app.get("/api/comments/:day", isAuthenticated, async (req: any, res) => {
    try {
      const day = parseInt(req.params.day);
      const comments = await storage.getDayComments(day);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Generate PRD details (customer avatar or look & feel)
  app.post("/api/ai/generate-prd-details", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aiUser = await storage.getUser(userId);
      if (!aiUser?.challengePurchased && !aiUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { type, idea, painPoints, iHelpStatement, brandVibe, appName } = req.body;

      if (type === "avatar") {
        const result = await callClaude({
          userId,
          endpoint: 'generate-prd-avatar',
          endpointType: 'features',
          systemPrompt: 'You are a marketing expert who specializes in customer personas. Be specific and vivid.',
          userMessage: `Based on this product idea, generate a specific customer avatar description.

Product Idea: ${idea}
${iHelpStatement ? `Value Proposition: "${iHelpStatement}"` : ''}
${painPoints && painPoints.length > 0 ? `Pain Points: ${painPoints.join(', ')}` : ''}

Write a detailed customer avatar in 2-3 sentences. Be SPECIFIC - not just "business owners" but describe their exact situation, frustrations, and daily reality. Include:
- Their specific role/profession
- Their key frustration related to this problem
- What they're currently doing that isn't working

Example format: "Freelance graphic designers who waste hours chasing invoices and tracking project deadlines across multiple apps, often losing track of which clients owe them money..."

Just output the avatar description, nothing else.`,
          maxTokens: 200,
        });

        if (!result.success) {
          return res.status(result.blocked ? 429 : 500).json({ message: result.error || "Failed to generate" });
        }
        return res.json({ result: result.response });

      } else if (type === "lookfeel") {
        const result = await callClaude({
          userId,
          endpoint: 'generate-prd-lookfeel',
          endpointType: 'features',
          systemPrompt: 'You are a UI/UX designer who knows popular apps. Be specific and reference real products.',
          userMessage: `Based on this product, suggest a look & feel description.

Product: ${appName || idea}
${brandVibe ? `Brand Vibe: ${brandVibe}` : ''}

Write a 2-3 sentence description of how this app should look and feel. Reference REAL, well-known apps as examples (like Notion, Stripe, Linear, Slack, etc). Include:
- Overall visual style (clean, bold, minimal, playful, etc)
- 1-2 specific apps to reference for inspiration
- Any specific UI preferences (dark mode, animations, etc)

Example format: "Clean and minimal like Notion, with a dashboard similar to Stripe. Dark mode option. Professional but not boring..."

Just output the look & feel description, nothing else.`,
          maxTokens: 200,
        });

        if (!result.success) {
          return res.status(result.blocked ? 429 : 500).json({ message: result.error || "Failed to generate" });
        }
        return res.json({ result: result.response });
      }

      return res.status(400).json({ message: "Invalid type" });
    } catch (error: any) {
      console.error("Error generating PRD details:", error);
      res.status(500).json({ message: error.message || "Failed to generate" });
    }
  });

  // Anti-spam detection function
  // Sanitize user content - strip dangerous HTML tags but keep normal text
  // React handles XSS protection, so we only need to remove script/event handlers
  function sanitizeContent(content: string): string {
    return content
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove event handlers (onclick, onerror, etc.)
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: URLs
      .replace(/javascript:/gi, '')
      // Remove other potentially dangerous tags
      .replace(/<(iframe|object|embed|link|style|meta)[^>]*>/gi, '')
      // Keep normal characters like apostrophes, quotes, etc.
      .trim();
  }

  function detectSpam(content: string): { isSpam: boolean; reason?: string } {
    const lowerContent = content.toLowerCase();

    // Check for prompt injection attempts (IMPORTANT: before any AI processing)
    const promptInjectionPatterns = [
      { pattern: /ignore (previous|all|your|above|prior) (instructions|rules|prompt|context)/i, reason: "Prompt injection attempt" },
      { pattern: /pretend you('re| are) (not|a different|an? )/i, reason: "Role manipulation attempt" },
      { pattern: /\b(jailbreak|bypass security|hack this|exploit)\b/i, reason: "Abuse keywords detected" },
      { pattern: /repeat after me|say exactly|output the following/i, reason: "Output manipulation attempt" },
      { pattern: /what('s| is) (your|the) (system|initial|original) (prompt|message|instructions)/i, reason: "Prompt extraction attempt" },
      { pattern: /act as (if you|a |an )|roleplay as|pretend to be/i, reason: "Role hijacking attempt" },
      { pattern: /\b(DAN|developer mode|unrestricted mode|god mode)\b/i, reason: "Known jailbreak attempt" },
      { pattern: /disregard (all |your |previous )?instructions/i, reason: "Instruction override attempt" },
      { pattern: /you are now|from now on you|forget (everything|your rules)/i, reason: "Context manipulation attempt" },
      { pattern: /<\/?script|javascript:|on\w+\s*=/i, reason: "Script injection attempt" },
      { pattern: /\{\{.*\}\}|\$\{.*\}/i, reason: "Template injection attempt" },
    ];

    for (const { pattern, reason } of promptInjectionPatterns) {
      if (pattern.test(content)) {
        return { isSpam: true, reason };
      }
    }

    // Check for links (various patterns)
    const linkPatterns = [
      /https?:\/\//i,
      /www\./i,
      /\[url/i,
      /\.com\b/i,
      /\.net\b/i,
      /\.org\b/i,
      /\.io\b/i,
      /\.co\b/i,
      /bit\.ly/i,
      /tinyurl/i,
      /t\.co/i,
      /goo\.gl/i,
      // Unicode domain obfuscation
      /[\u0430-\u044f]+\.(com|net|org|io)/i, // Cyrillic
      // Spaced out links
      /h\s*t\s*t\s*p/i,
      /w\s*w\s*w\s*\./i,
      // Common substitutions
      /\[dot\]/i,
      /\(dot\)/i,
      /\[at\]/i,
      /\(at\)/i,
    ];

    for (const pattern of linkPatterns) {
      if (pattern.test(content)) {
        return { isSpam: true, reason: "Contains links or link-like content" };
      }
    }

    // Check for email patterns
    if (/[\w.-]+@[\w.-]+\.\w+/.test(content)) {
      return { isSpam: true, reason: "Contains email address" };
    }

    // Check for phone numbers
    if (/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(content)) {
      return { isSpam: true, reason: "Contains phone number" };
    }

    // Check for promotional keywords
    const promoKeywords = ["buy now", "click here", "free money", "guaranteed", "limited time", "act now", "discount code", "promo code", "affiliate"];
    for (const keyword of promoKeywords) {
      if (lowerContent.includes(keyword)) {
        return { isSpam: true, reason: `Contains promotional content: ${keyword}` };
      }
    }

    return { isSpam: false };
  }

  app.post("/api/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commenter = await storage.getUser(userId);
      if (!commenter?.challengePurchased && !commenter?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { day, content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment cannot be empty" });
      }
      
      if (content.length > 1000) {
        return res.status(400).json({ message: "Comment too long (max 1000 characters)" });
      }
      
      // Check for duplicate comment (same user, same day, same content)
      const existingComments = await storage.getDayComments(day);
      const trimmedContent = sanitizeContent(content.trim());
      const isDuplicate = existingComments.some(
        (c: any) => c.userId === userId && c.content === trimmedContent
      );
      if (isDuplicate) {
        return res.status(409).json({ message: "You've already posted this comment" });
      }

      // Check user's spam status
      const spamStatus = await storage.getUserSpamStatus(userId);
      const requiresApproval = spamStatus?.requiresApproval || false;
      
      // Check for spam content
      const spamCheck = detectSpam(content);
      
      let status = "approved";
      let flagReason = null;
      
      if (requiresApproval) {
        status = "pending";
        flagReason = "User flagged for repeated suspicious activity";
      } else if (spamCheck.isSpam) {
        status = "pending";
        flagReason = spamCheck.reason;
        // Increment flag count
        await storage.incrementFlagCount(userId);
      }
      
      const comment = await storage.createDayComment({
        day,
        userId,
        content: sanitizeContent(content.trim()),
        status,
        flagReason,
      });
      
      // Get user and day info for email
      const user = await storage.getUser(userId);
      const dayContent = await storage.getDayContent(day);

      // Send email notification (for approved comments only)
      if (status === "approved") {
        await sendDiscussionNotificationEmail({
          userEmail: user?.email || 'unknown@unknown.com',
          userName: `${user?.firstName || 'Unknown'} ${user?.lastName || ''}`.trim(),
          day,
          dayTitle: dayContent?.title || 'Unknown',
          content: content.trim(),
        });
      }

      if (status === "pending") {
        res.json({
          ...comment,
          message: "Your comment is being reviewed and will appear once approved."
        });
      } else {
        res.json({ ...comment, user });
      }
    } catch (error: any) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: error.message || "Failed to create comment" });
    }
  });

  // Admin: Get notification counts (lightweight endpoint for the bell icon)
  app.get("/api/admin/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const [pendingCommentsArr, pendingQuestionsArr, flaggedArr, pendingShowcaseArr, critiquesArr] = await Promise.all([
        storage.getPendingComments(),
        storage.getPendingQuestions(),
        storage.getFlaggedMessages(),
        storage.getPendingShowcase(),
        db.select({ id: critiqueRequests.id, status: critiqueRequests.status }).from(critiqueRequests),
      ]);

      const pendingComments = pendingCommentsArr.length;
      const pendingQuestions = pendingQuestionsArr.length;
      const flaggedMessages = flaggedArr.length;
      const pendingShowcase = pendingShowcaseArr.filter((s: any) => s.status === 'pending').length;
      const pendingCritiques = critiquesArr.filter((c: any) => c.status === 'pending' || c.status === 'in_progress').length;
      const total = pendingComments + pendingQuestions + flaggedMessages + pendingShowcase + pendingCritiques;

      res.json({
        total,
        items: [
          { key: 'comments', label: 'Pending comments', count: pendingComments, tab: 'content', section: 'admin-comments' },
          { key: 'questions', label: 'Unanswered questions', count: pendingQuestions, tab: 'content', section: 'admin-questions' },
          { key: 'showcase', label: 'Pending showcase apps', count: pendingShowcase, tab: 'content', section: 'admin-showcase' },
          { key: 'critiques', label: 'Pending critique requests', count: pendingCritiques, tab: 'content', section: 'admin-critiques' },
          { key: 'flagged', label: 'Flagged chat messages', count: flaggedMessages, tab: 'settings', section: 'admin-flagged' },
        ].filter(item => item.count > 0),
      });
    } catch (error) {
      console.error("Error fetching notification counts:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Admin: Get pending comments
  app.get("/api/admin/pending-comments", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const comments = await storage.getPendingComments();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching pending comments:", error);
      res.status(500).json({ message: "Failed to fetch pending comments" });
    }
  });

  // Admin: Approve/reject comment
  app.post("/api/admin/comments/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const id = parseInt(req.params.id);
      const { status } = req.body; // 'approved' or 'rejected'

      const updated = await storage.updateCommentStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating comment status:", error);
      res.status(500).json({ message: error.message || "Failed to update comment" });
    }
  });

  // Admin: Delete comment
  app.delete("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteComment(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: error.message || "Failed to delete comment" });
    }
  });

  // Admin: Get ALL comments (approved + pending + rejected)
  app.get("/api/admin/comments", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const comments = await storage.getAllComments();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching all comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Admin: Get ALL questions (pending + answered + hidden)
  app.get("/api/admin/questions", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching all questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Admin: Answer a question by ID (same logic as token-based, but admin-authenticated)
  app.post("/api/admin/questions/:id/answer", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const id = parseInt(req.params.id);
      const { answer } = req.body;

      if (!answer) {
        return res.status(400).json({ message: "Answer is required" });
      }
      if (answer.length > 10000) {
        return res.status(400).json({ message: "Answer too long (max 10000 characters)" });
      }

      const sanitizedAnswer = sanitizeContent(answer.trim());
      const updated = await storage.answerQuestion(id, sanitizedAnswer);

      if (!updated) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Send email notification to the student
      try {
        const student = await storage.getUser(updated.userId);
        if (student?.email) {
          await sendQuestionAnsweredEmail({
            to: student.email,
            firstName: student.firstName || 'there',
            day: updated.day,
            question: updated.question,
            answer: sanitizedAnswer,
          });
        }
      } catch (emailError) {
        console.error('[Admin Answer] Failed to send notification email:', emailError);
      }

      res.json({ success: true, question: updated });
    } catch (error: any) {
      console.error("Error answering question:", error);
      res.status(500).json({ message: error.message || "Failed to answer question" });
    }
  });

  // Brand settings - public endpoint (for applying theme)
  app.get("/api/brand-settings", async (req, res) => {
    try {
      const settings = await storage.getBrandSettings();
      res.json(settings || {
        primaryColor: "#007BFF",
        textColor: "#000000",
        backgroundColor: "#FFFFFF",
        accentColor: "#007BFF",
        fontFamily: "Poppins",
        borderRadius: 6,
        appName: "21-Day AI SaaS Challenge",
      });
    } catch (error) {
      console.error("Error fetching brand settings:", error);
      res.status(500).json({ message: "Failed to fetch brand settings" });
    }
  });

  // Admin: Update brand settings
  app.post("/api/admin/brand-settings", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const settings = req.body;
      const updated = await storage.updateBrandSettings(settings);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating brand settings:", error);
      res.status(500).json({ message: error.message || "Failed to update brand settings" });
    }
  });

  // AI Build Coach chat endpoint
  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      // Purchase check - AI chat costs money per call
      const chatUser = req.user?.claims?.sub ? await storage.getUser(req.user.claims.sub) : null;
      if (!chatUser?.challengePurchased && !chatUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required to use AI Mentor" });
      }
      // Debug: Log user object to diagnose auth issues
      if (!req.user) {
        console.error("Chat error: req.user is undefined");
        return res.status(401).json({ message: "User session not found. Please log in again." });
      }
      if (!req.user.claims) {
        console.error("Chat error: req.user.claims is undefined", { user: req.user });
        return res.status(401).json({ message: "Invalid session. Please log in again." });
      }
      if (!req.user.claims.sub) {
        console.error("Chat error: req.user.claims.sub is undefined", { claims: req.user.claims });
        return res.status(401).json({ message: "User ID not found. Please log in again." });
      }

      const userId = req.user.claims.sub;
      const { message, context, history } = req.body;

      // Check rate limits
      const usageCheck = await storage.checkAndIncrementChatUsage(userId);
      if (!usageCheck.allowed) {
        return res.status(429).json({
          error: "rate_limit",
          message: usageCheck.reason,
          resetIn: usageCheck.resetIn
        });
      }

      // Fetch admin-configurable rules (if any)
      const chatSettings = await storage.getChatbotSettings();
      const customRules = chatSettings?.customRules || '';

      // The complete 21-day curriculum - this is what we help with
      const curriculum = `
THE 21 DAY AI SAAS CHALLENGE CURRICULUM:

DAY 0 - START HERE: Commit to the challenge, set income goals, write accountability promise
DAY 1 - IDEA GENERATION: Use AI to generate SaaS ideas based on skills/knowledge/interests, shortlist 2-3
DAY 2 - VALIDATE IDEA: Research competitors, identify pain points, write "I help X solve Y" statement, lock in final idea
DAY 3 - FEATURES: Generate feature list with AI (core features, shared features, USP features), select MVP features
DAY 4 - NAMING: Generate name suggestions, pick name, register .com domain, check trademarks, claim social handles
DAY 5 - LOGO: Pick brand vibe/colors, generate AI logo prompt, create logo using Abacus AI or similar
DAY 6 - TECH STACK: Set up Replit account, set up Claude Pro account, optional tools (Wispr Flow, Abacus AI)
DAY 7 - PRD: Generate Product Requirements Document with AI, paste into Replit, start first build
DAY 8 - CLAUDE CODE SETUP: Connect GitHub, install Claude Code, create CLAUDE.md instruction file
DAY 9 - MASTER CLAUDE CODE: Learn the 8 rules for prompting Claude Code effectively
DAY 10 - BUILD LOOP: Learn Build-Test-Fix workflow, find and fix your first bug
DAY 11 - BRAND DESIGN: Pick design style, choose accent color, apply consistent styling with Claude Code
DAY 12 - AI BRAIN: Add OpenAI API integration to make app intelligent
DAY 13 - EMAIL: Set up Resend for transactional emails
DAY 14 - AUTH & ADMIN: Add user authentication, build admin dashboard with key metrics
DAY 15 - PAYMENTS: Add Stripe integration for payments
DAY 16 - MOBILE: Test app on phone, fix mobile issues
DAY 17 - TESTING: Write automated tests for core features
DAY 18 - MVP: THE PAUSE POINT - build until MVP is truly ready, submit to Showcase
DAY 19 - SALES PAGE: Create high-converting sales page with AI-generated copy
DAY 20 - SEO: Get found by Google and AI assistants, submit to directories
DAY 21 - GROWTH: Calculate income goals, learn passive/active growth strategies

TECH STACK COVERED:
- Replit (hosting, deployment)
- Claude Code (AI coding assistant)
- Claude Pro / Claude.ai (AI prompts)
- OpenAI API (adding AI to apps)
- Resend (email service)
- Stripe (payments)
- GitHub (version control)
- PostgreSQL/Drizzle (database)
- React/TypeScript/Tailwind (frontend)
- Express/Node.js (backend)`;

      const systemPrompt = `You are the AI Mentor for the 21-Day AI SaaS Challenge. You ONLY help with topics covered in this specific challenge.

${curriculum}

STRICT SCOPE - VERY IMPORTANT:
You ONLY help with:
- Questions about the challenge days listed above
- The specific tech stack: Replit, Claude Code, OpenAI API, Resend, Stripe, React, TypeScript, Tailwind, Express, PostgreSQL
- Building their specific SaaS MVP
- Debugging code issues in their challenge project
- Understanding the challenge curriculum

You DO NOT help with:
- Marketing, sales strategy, pricing strategy, growth hacking (beyond Day 19-21 basics)
- Technologies not in the challenge (AWS, Firebase, Next.js, Vue, Angular, Python, etc.)
- Business strategy, fundraising, hiring, scaling
- Anything not directly related to completing the 21-day challenge

If asked about off-topic subjects, say: "That's outside what we cover in the 21-Day Challenge. I'm here to help you build your MVP using Replit, Claude Code, and the tech stack we teach. What can I help you with for your current day's task?"

USER CONTEXT:
${context.userName ? `Name: ${context.userName}` : ''}
Currently on Day ${context.currentDay}
Completed days: ${context.completedDays?.join(', ') || 'None yet'}
${context.userIdea ? `Their idea: ${context.userIdea}` : 'No idea selected yet'}
${context.painPoints?.length ? `Pain points they solve: ${context.painPoints.join(', ')}` : ''}
${context.features?.length ? `Features planned: ${context.features.join(', ')}` : ''}

RESPONSE RULES:
1. Keep answers focused on their current day's task when possible
2. Reference their specific idea/features when relevant
3. Give ONE clear next step when they're stuck
4. Be concise - no lengthy explanations unless asked
5. Use code examples only when directly helpful
6. If they haven't completed earlier days, gently point them back

${customRules ? `ADDITIONAL RULES:\n${customRules}` : ''}`;

      // Build history for callClaude
      const historyForClaude: { role: "user" | "assistant"; content: string }[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          historyForClaude.push({ role: msg.role, content: msg.content });
        });
      }

      // Check for abuse using aiService's detectAbuse
      const abuseCheck = detectAbuse(message);

      // Save user message with flagging
      await storage.saveChatMessage({
        userId,
        role: "user",
        content: message,
        flagged: abuseCheck.flagged,
        flagReason: abuseCheck.reason,
      });

      // Use callClaude with rate limiting and logging (PREMIUM - stays on Claude for quality)
      const result = await callClaude({
        userId,
        endpoint: 'ai-mentor-chat',
        endpointType: 'chat',
        systemPrompt,
        userMessage: message,
        maxTokens: 500,
        history: historyForClaude,
      });

      if (!result.success) {
        if (result.blocked) {
          return res.status(429).json({
            error: "rate_limit",
            message: result.error
          });
        }
        return res.status(500).json({ message: result.error || "Failed to get AI response" });
      }

      const reply = result.response || "I'm not sure how to help with that. Can you try rephrasing?";

      // Save assistant response
      await storage.saveChatMessage({
        userId,
        role: "assistant",
        content: reply,
        flagged: false,
      });

      res.json({ response: reply });
    } catch (error: any) {
      console.error("Error in chat:", {
        message: error.message,
        code: error.code,
        status: error.status,
        type: error.type,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      });

      res.status(500).json({ message: error.message || "Failed to get response from AI. Please try again." });
    }
  });

  // Admin: Get chatbot settings
  app.get("/api/admin/chatbot/settings", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const settings = await storage.getChatbotSettings();
      res.json(settings || { customRules: "", dailyLimit: 20, hourlyLimit: 10 });
    } catch (error: any) {
      console.error("Error fetching chatbot settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Admin: Update chatbot settings
  app.post("/api/admin/chatbot/settings", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const { customRules, dailyLimit, hourlyLimit } = req.body;
      const updated = await storage.updateChatbotSettings({ customRules, dailyLimit, hourlyLimit });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating chatbot settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Admin: Get all chat messages
  app.get("/api/admin/chatbot/messages", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const messages = await storage.getAllChatMessages();
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Admin: Get flagged messages
  app.get("/api/admin/chatbot/flagged", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const flagged = await storage.getFlaggedMessages();
      res.json(flagged);
    } catch (error: any) {
      console.error("Error fetching flagged messages:", error);
      res.status(500).json({ message: "Failed to fetch flagged messages" });
    }
  });

  // Admin: Get chat summary by user
  app.get("/api/admin/chatbot/users", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const summary = await storage.getUserChatSummary();
      res.json(summary);
    } catch (error: any) {
      console.error("Error fetching user chat summary:", error);
      res.status(500).json({ message: "Failed to fetch user summary" });
    }
  });

  // Admin: Get specific user's chat history
  app.get("/api/admin/chatbot/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const messages = await storage.getChatMessages(req.params.userId);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching user messages:", error);
      res.status(500).json({ message: "Failed to fetch user messages" });
    }
  });

  // Admin: Mark message as reviewed
  app.post("/api/admin/chatbot/review/:id", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const id = parseInt(req.params.id);
      const updated = await storage.markMessageReviewed(id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error marking message reviewed:", error);
      res.status(500).json({ message: "Failed to mark reviewed" });
    }
  });

  // Admin: Manually flag a message
  app.post("/api/admin/chatbot/flag/:id", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const updated = await storage.flagMessage(id, reason || "Flagged by admin");
      res.json(updated);
    } catch (error: any) {
      console.error("Error flagging message:", error);
      res.status(500).json({ message: "Failed to flag message" });
    }
  });

  // Showcase routes
  // Submit to showcase (user)
  app.post("/api/showcase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const showcaseUser = await storage.getUser(userId);
      if (!showcaseUser?.challengePurchased && !showcaseUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { appName, description, screenshotUrl, liveUrl, testimonial, videoUrl } = req.body;

      if (!appName || !description) {
        return res.status(400).json({ message: "App name and description are required" });
      }

      const entry = await storage.createShowcaseEntry({
        userId,
        appName,
        description,
        screenshotUrl: screenshotUrl || null,
        liveUrl: liveUrl || null,
        testimonial: testimonial || null,
        videoUrl: videoUrl || null,
      });

      // Award Ambassador badge if testimonial is included
      if (testimonial && testimonial.trim().length > 0) {
        try {
          const allBadges = await storage.getAllBadges();
          const ambassadorBadge = allBadges.find(b => b.triggerType === 'testimonial_submitted');
          if (ambassadorBadge) {
            const userBadges = await storage.getUserBadges(userId);
            const alreadyHas = userBadges.some(ub => ub.badgeId === ambassadorBadge.id);
            if (!alreadyHas) {
              await storage.awardBadge(userId, ambassadorBadge.id);
              console.log(`Awarded Ambassador badge to user ${userId}`);
            }
          }
        } catch (badgeError) {
          console.error("Error awarding Ambassador badge:", badgeError);
          // Don't fail the request if badge awarding fails
        }
      }

      res.json(entry);
    } catch (error: any) {
      console.error("Error creating showcase entry:", error);
      res.status(500).json({ message: "Failed to submit to showcase" });
    }
  });

  // Challenge testimonial (separate from app showcase)
  app.post("/api/testimonial", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.challengePurchased && !user?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { testimonial, videoUrl, appName, appUrl } = req.body;

      if (!testimonial && !videoUrl) {
        return res.status(400).json({ message: "Please provide a written testimonial or video link" });
      }

      // Check if user already submitted a testimonial
      const existing = await storage.getUserTestimonial(userId);
      if (existing) {
        // Already submitted - just return success without creating duplicate
        return res.json({ success: true, message: "Thank you for your testimonial!" });
      }

      // Store the testimonial in the database
      const created = await storage.createTestimonial({
        userId,
        testimonial: testimonial || null,
        videoUrl: videoUrl || null,
        appName: appName || null,
        appUrl: appUrl || null,
      });

      console.log("=== NEW CHALLENGE TESTIMONIAL ===");
      console.log("User:", user?.email || userId);
      console.log("Testimonial ID:", created.id);
      console.log("================================");

      // Send email notification to Matt
      const userName = user?.firstName
        ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
        : user?.email || 'Unknown User';

      sendTestimonialNotificationEmail({
        userEmail: user?.email || 'unknown',
        userName,
        testimonial: testimonial || null,
        videoUrl: videoUrl || null,
        appName: appName || null,
        appUrl: appUrl || null,
      }).catch(err => console.error('Testimonial email error:', err));

      // Award Ambassador badge for testimonial
      try {
        const allBadges = await storage.getAllBadges();
        const ambassadorBadge = allBadges.find(b => b.triggerType === 'testimonial_submitted');
        if (ambassadorBadge) {
          const userBadges = await storage.getUserBadges(userId);
          const alreadyHas = userBadges.some(ub => ub.badgeId === ambassadorBadge.id);
          if (!alreadyHas) {
            await storage.awardBadge(userId, ambassadorBadge.id);
            console.log(`Awarded Ambassador badge to user ${userId}`);
          }
        }
      } catch (badgeError) {
        console.error("Error awarding Ambassador badge:", badgeError);
      }

      res.json({ success: true, message: "Thank you for your testimonial!" });
    } catch (error: any) {
      console.error("Error submitting testimonial:", error);
      res.status(500).json({ message: "Failed to submit testimonial" });
    }
  });

  // Get user's showcase entry
  app.get("/api/showcase/mine", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.getShowcaseEntry(userId);
      res.json(entry || null);
    } catch (error: any) {
      console.error("Error fetching showcase entry:", error);
      res.status(500).json({ message: "Failed to fetch showcase entry" });
    }
  });

  // Get approved showcase (public)
  app.get("/api/showcase", async (req, res) => {
    try {
      const entries = await storage.getApprovedShowcase();
      res.json(entries);
    } catch (error: any) {
      console.error("Error fetching showcase:", error);
      res.status(500).json({ message: "Failed to fetch showcase" });
    }
  });

  // Get showcase stats (public)
  app.get("/api/showcase/stats", async (req, res) => {
    try {
      const entries = await storage.getApprovedShowcase();
      res.json({
        count: entries.length,
        recent: entries.slice(0, 3).map(e => ({ appName: e.appName, liveUrl: e.liveUrl }))
      });
    } catch (error: any) {
      console.error("Error fetching showcase stats:", error);
      res.status(500).json({ message: "Failed to fetch showcase stats" });
    }
  });

  // Admin: Get pending showcase entries
  app.get("/api/admin/showcase/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const entries = await storage.getPendingShowcase();
      res.json(entries);
    } catch (error: any) {
      console.error("Error fetching pending showcase:", error);
      res.status(500).json({ message: "Failed to fetch pending showcase" });
    }
  });

  // Admin: Update showcase status
  app.post("/api/admin/showcase/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateShowcaseStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating showcase status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Admin: Toggle featured
  app.post("/api/admin/showcase/:id/feature", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const updated = await storage.toggleShowcaseFeatured(id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error toggling featured:", error);
      res.status(500).json({ message: "Failed to toggle featured" });
    }
  });

  // ============================================
  // TESTIMONIAL ADMIN ROUTES
  // ============================================

  // Get all testimonials (admin)
  app.get("/api/admin/testimonials", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error: any) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Toggle testimonial featured status (admin)
  app.post("/api/admin/testimonials/:id/feature", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const updated = await storage.toggleTestimonialFeatured(id);
      if (!updated) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error toggling testimonial featured:", error);
      res.status(500).json({ message: "Failed to toggle featured" });
    }
  });

  // ============================================
  // EMAIL TEMPLATE ADMIN ROUTES
  // ============================================

  // Get all email templates (admin)
  app.get("/api/admin/email-templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  // Create email template (admin)
  app.post("/api/admin/email-templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { templateKey, name, subject, body, description, variables } = req.body;
      if (!templateKey || !name || !subject || !body) {
        return res.status(400).json({ message: "Template key, name, subject, and body are required" });
      }

      // Check for duplicate key
      const existing = await storage.getEmailTemplate(templateKey);
      if (existing) {
        return res.status(409).json({ message: "A template with that key already exists" });
      }

      const created = await storage.createEmailTemplate({
        templateKey,
        name,
        subject,
        body,
        description: description || null,
        variables: variables || null,
        isActive: true,
      });

      res.json(created);
    } catch (error: any) {
      console.error("Error creating email template:", error);
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  // Update email template (admin)
  app.patch("/api/admin/email-templates/:templateKey", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { templateKey } = req.params;
      const { subject, body, isActive } = req.body;

      const updated = await storage.updateEmailTemplate(templateKey, { subject, body, isActive });
      if (!updated) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  // Send test email (admin)
  app.post("/api/admin/email-templates/:templateKey/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { templateKey } = req.params;
      const { testEmail } = req.body;

      const template = await storage.getEmailTemplate(templateKey);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Send test email with placeholder values
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Replace variables with sample values for testing
      let testBody = template.body;
      let testSubject = template.subject;
      const sampleValues: Record<string, string> = {
        firstName: 'Test User',
        userName: 'Test User',
        userEmail: testEmail,
        currencySymbol: '£',
        currency: 'GBP',
        total: '295',
        amount: '995',
        coachingType: '4 x 1-hour coaching sessions',
        testimonial: 'This is a sample testimonial for testing.',
        videoUrl: 'https://example.com/video',
        appName: 'Test App',
        appUrl: 'https://testapp.com',
        day: '5',
        dayTitle: 'Logo Design',
        question: 'This is a sample question?',
        content: 'This is a sample discussion post.',
        answerUrl: 'https://challenge.mattwebley.com/admin/answer/test-token',
        salesPageUrl: 'https://example.com/sales',
        productDescription: 'A sample product description.',
        targetAudience: 'Small business owners.',
        specificQuestions: 'Is this headline good?',
        preferredEmail: testEmail,
        timestamp: new Date().toLocaleString(),
        referrerName: 'John Doe',
        referrerEmail: 'john@example.com',
        newUserName: 'Jane Smith',
        newUserEmail: 'jane@example.com',
        referralCount: '5',
      };

      for (const [key, value] of Object.entries(sampleValues)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        testBody = testBody.replace(regex, value);
        testSubject = testSubject.replace(regex, value);
      }

      await resend.emails.send({
        from: 'Matt Webley <matt@mattwebley.com>',
        to: [testEmail],
        subject: `[TEST] ${testSubject}`,
        text: testBody,
      });

      res.json({ success: true, message: `Test email sent to ${testEmail}` });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Get email send logs (admin)
  app.get("/api/admin/email-logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = (page - 1) * limit;

      const logs = await storage.getEmailLogs(limit, offset);
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ message: "Failed to fetch email logs" });
    }
  });

  // Get email stats (admin)
  app.get("/api/admin/email-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getEmailStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching email stats:", error);
      res.status(500).json({ message: "Failed to fetch email stats" });
    }
  });

  // ============================================
  // DRIP EMAIL ROUTES (Admin)
  // ============================================

  // Get all drip emails
  app.get("/api/admin/drip-emails", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const dripEmails = await storage.getAllDripEmails();
      const sentCounts = await storage.getDripEmailSentCount();
      const sentMap = new Map(sentCounts.map(s => [s.dripEmailId, s.count]));

      const result = dripEmails.map(d => ({
        ...d,
        sentCount: sentMap.get(d.id) || 0,
      }));

      res.json(result);
    } catch (error: any) {
      console.error("Error fetching drip emails:", error);
      res.status(500).json({ message: "Failed to fetch drip emails" });
    }
  });

  // Update a drip email
  app.patch("/api/admin/drip-emails/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const { subject, altSubject, body, isActive, dayTrigger } = req.body;
      const updated = await storage.updateDripEmail(id, { subject, altSubject, body, isActive, dayTrigger });

      if (!updated) {
        return res.status(404).json({ message: "Drip email not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating drip email:", error);
      res.status(500).json({ message: "Failed to update drip email" });
    }
  });

  // Toggle all drip emails on/off
  app.post("/api/admin/drip-emails/toggle-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { isActive } = req.body;
      await storage.setAllDripEmailsActive(!!isActive);
      res.json({ message: `All drip emails ${isActive ? 'enabled' : 'disabled'}` });
    } catch (error: any) {
      console.error("Error toggling drip emails:", error);
      res.status(500).json({ message: "Failed to toggle drip emails" });
    }
  });

  // Manually trigger drip email processing
  app.post("/api/admin/drip-emails/process", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = await processDripEmails();
      res.json({ message: `Processed: ${result.sent} sent, ${result.errors} errors`, ...result });
    } catch (error: any) {
      console.error("Error processing drip emails:", error);
      res.status(500).json({ message: "Failed to process drip emails" });
    }
  });

  // Send test drip email to admin
  app.post("/api/admin/drip-emails/:id/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const { testEmail } = req.body;

      if (!testEmail) {
        return res.status(400).json({ message: "testEmail is required" });
      }

      const dripEmail = await storage.getDripEmail(id);
      if (!dripEmail) {
        return res.status(404).json({ message: "Drip email not found" });
      }

      // Send using the existing email infrastructure with sample data
      const { Resend } = await import('resend');
      const client = new Resend(process.env.RESEND_API_KEY);

      // Replace variables with sample data (including legal footer like real sends)
      const sampleUnsubscribeUrl = 'https://challenge.mattwebley.com/api/drip/unsubscribe?uid=test&token=test';
      const legalFooter = `\n\n—\nMatt Webley · Webley Global FZCO · Dubai Silicon Oasis, UAE\nUnsubscribe: ${sampleUnsubscribeUrl}`;

      const variables: Record<string, string> = {
        firstName: 'Sarah',
        DASHBOARD_URL: 'https://challenge.mattwebley.com/dashboard',
        UNLOCK_URL: 'https://challenge.mattwebley.com/unlock',
        READINESS_CALL_URL: 'https://cal.com/mattwebley/readiness-review',
        COACHING_URL: 'https://challenge.mattwebley.com/coaching',
        REFERRAL_URL: 'https://challenge.mattwebley.com/referrals',
        CRITIQUE_URL: 'https://challenge.mattwebley.com/critique',
        SHOWCASE_URL: 'https://challenge.mattwebley.com/showcase',
        UNSUBSCRIBE_URL: sampleUnsubscribeUrl,
      };

      let subject = dripEmail.subject;
      let body = dripEmail.body + legalFooter;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      }

      await client.emails.send({
        from: 'Matt Webley <matt@mattwebley.com>',
        replyTo: 'matt@mattwebley.com',
        to: [testEmail],
        subject: `[TEST] ${subject}`,
        text: body,
        headers: {
          'List-Unsubscribe': `<${sampleUnsubscribeUrl}>`,
        },
      });

      res.json({ message: `Test email #${dripEmail.emailNumber} sent to ${testEmail}` });
    } catch (error: any) {
      console.error("Error sending test drip email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // ============================================
  // Q&A ROUTES
  // ============================================

  // Submit a question (sends email notification)
  app.post("/api/questions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const qUser = await storage.getUser(userId);
      if (!qUser?.challengePurchased && !qUser?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }
      const { day, question } = req.body;

      if (!day || !question) {
        return res.status(400).json({ message: "Day and question are required" });
      }

      // Validate question length
      if (question.length > 2000) {
        return res.status(400).json({ message: "Question too long (max 2000 characters)" });
      }

      if (question.trim().length < 10) {
        return res.status(400).json({ message: "Question too short (min 10 characters)" });
      }

      // Check for spam/abuse patterns (including prompt injection)
      const spamCheck = detectSpam(question);
      if (spamCheck.isSpam) {
        console.warn(`[Q&A] Blocked question from user ${userId}: ${spamCheck.reason}`);
        return res.status(400).json({
          message: "Your question couldn't be submitted. Please rephrase and try again."
        });
      }

      // Sanitize the question content
      const sanitizedQuestion = sanitizeContent(question.trim());

      // Generate unique answer token
      const answerToken = crypto.randomUUID();

      // Create the question
      const created = await storage.createQuestion({
        day,
        userId,
        question: sanitizedQuestion,
        answerToken,
        status: "pending"
      });

      // Get user info for email
      const user = await storage.getUser(userId);
      const dayContent = await storage.getDayContent(day);

      // Generate AI suggested answer
      try {
        const aiResult = await callClaude({
          userId,
          endpoint: 'ai-suggested-answer',
          endpointType: 'general',
          systemPrompt: `You are Matt Webley's assistant for the 21-Day AI SaaS Challenge. Generate a BRIEF 2-3 sentence answer to this student question about Day ${day}: "${dayContent?.title || 'Unknown'}". Be direct and practical. Use Matt's punchy style. NEVER use em dashes. Keep it short.`,
          userMessage: question,
          maxTokens: 200,
        });

        if (aiResult.success && aiResult.response) {
          await storage.setAiSuggestedAnswer(created.id, aiResult.response);
        }
      } catch (aiError) {
        console.error("Failed to generate AI answer:", aiError);
        // Continue without AI answer
      }

      // Build answer URL - always use production URL
      const answerUrl = `https://challenge.mattwebley.com/admin/answer/${answerToken}`;

      // Send email notification
      await sendQuestionNotificationEmail({
        userEmail: user?.email || 'unknown@unknown.com',
        userName: `${user?.firstName || 'Unknown'} ${user?.lastName || ''}`.trim(),
        day,
        dayTitle: dayContent?.title || 'Unknown',
        question,
        answerUrl,
      });

      res.json({
        success: true,
        message: "Question submitted! Matt will be notified and may answer it soon.",
        questionId: created.id
      });
    } catch (error: any) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to submit question" });
    }
  });

  // Admin: Draft an answer from notes
  app.post("/api/admin/questions/draft-answer", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { question, notes, day } = req.body;
      if (!question || !notes) return res.status(400).json({ message: "Question and notes required" });

      const result = await callClaude({
        userId: req.user.claims.sub,
        endpoint: 'admin-draft-answer',
        endpointType: 'general',
        systemPrompt: `You are Matt Webley, running the 21-Day AI SaaS Challenge. A student asked a question${day ? ` on Day ${day}` : ''}. You have written rough notes on how to answer. Turn these notes into a clear, well-written response.

Rules:
- Write as Matt speaking directly to the student (use "you", be warm but direct)
- NEVER use em dashes. Use commas, full stops, or rewrite the sentence
- Keep the same meaning and advice from the notes, just make it read well
- Use short paragraphs. No walls of text
- Be practical and actionable
- Don't add information that isn't in the notes
- Don't use emojis unless the notes include them
- Aim for 3-5 sentences unless the notes clearly need more`,
        userMessage: `STUDENT QUESTION: ${question}\n\nMY NOTES: ${notes}`,
        maxTokens: 500,
      });

      if (result.success && result.response) {
        res.json({ draft: result.response });
      } else {
        res.status(500).json({ message: "Failed to generate draft" });
      }
    } catch (error) {
      console.error("Error drafting answer:", error);
      res.status(500).json({ message: "Failed to generate draft" });
    }
  });

  // Admin: Refine a drafted answer
  app.post("/api/admin/questions/refine-answer", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { question, currentDraft, action } = req.body;
      if (!currentDraft || !action) return res.status(400).json({ message: "Draft and action required" });

      const instructions: Record<string, string> = {
        shorten: "Make this response shorter and more concise. Cut unnecessary words. Keep the key advice.",
        lengthen: "Expand this response with a bit more detail and explanation. Add an example if helpful. Don't pad it with fluff.",
        simplify: "Simplify this response. Use shorter words and simpler sentences. Make it easy for a complete beginner to understand.",
        detail: "Add more specific, actionable detail to this response. Include concrete steps or examples where helpful.",
      };

      const instruction = instructions[action];
      if (!instruction) return res.status(400).json({ message: "Invalid action" });

      const result = await callClaude({
        userId: req.user.claims.sub,
        endpoint: 'admin-refine-answer',
        endpointType: 'general',
        systemPrompt: `You are rewriting a response from Matt Webley to a student. ${instruction} NEVER use em dashes. Keep it natural and direct. Return ONLY the rewritten response, nothing else.`,
        userMessage: `STUDENT QUESTION: ${question || '(not provided)'}\n\nCURRENT RESPONSE:\n${currentDraft}`,
        maxTokens: 600,
      });

      if (result.success && result.response) {
        res.json({ draft: result.response });
      } else {
        res.status(500).json({ message: "Failed to refine draft" });
      }
    } catch (error) {
      console.error("Error refining answer:", error);
      res.status(500).json({ message: "Failed to refine draft" });
    }
  });

  // Get answered questions for a day (requires auth)
  app.get("/api/questions/day/:day", isAuthenticated, async (req: any, res) => {
    try {
      const day = parseInt(req.params.day);
      const questions = await storage.getAnsweredQuestionsByDay(day);
      res.json(questions);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get pending questions (admin only)
  app.get("/api/admin/questions/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const questions = await storage.getPendingQuestions();
      res.json(questions);
    } catch (error: any) {
      console.error("Error fetching pending questions:", error);
      res.status(500).json({ message: "Failed to fetch pending questions" });
    }
  });

  // Get question by answer token (for email link)
  app.get("/api/questions/token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const question = await storage.getQuestionByToken(token);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      console.error("Error fetching question by token:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Answer a question (via token - no auth needed for email link)
  app.post("/api/questions/token/:token/answer", async (req, res) => {
    try {
      const { token } = req.params;
      const { answer } = req.body;

      if (!answer) {
        return res.status(400).json({ message: "Answer is required" });
      }

      // Validate answer length
      if (answer.length > 10000) {
        return res.status(400).json({ message: "Answer too long (max 10000 characters)" });
      }

      const question = await storage.getQuestionByToken(token);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Sanitize the answer content
      const sanitizedAnswer = sanitizeContent(answer.trim());

      const updated = await storage.answerQuestion(question.id, sanitizedAnswer);

      // Send email notification to the student
      try {
        const student = await storage.getUser(question.userId);
        if (student?.email) {
          await sendQuestionAnsweredEmail({
            to: student.email,
            firstName: student.firstName || 'there',
            day: question.day,
            question: question.question,
            answer: sanitizedAnswer,
          });
        }
      } catch (emailError) {
        console.error('[Answer] Failed to send notification email:', emailError);
        // Don't fail the answer submission if email fails
      }

      res.json({ success: true, question: updated });
    } catch (error: any) {
      console.error("Error answering question:", error);
      res.status(500).json({ message: "Failed to answer question" });
    }
  });

  // Mark question as helpful
  app.post("/api/questions/:id/helpful", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markQuestionHelpful(id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error marking helpful:", error);
      res.status(500).json({ message: "Failed to mark helpful" });
    }
  });

  // Hide a question (admin only)
  app.post("/api/admin/questions/:id/hide", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const updated = await storage.hideQuestion(id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error hiding question:", error);
      res.status(500).json({ message: "Failed to hide question" });
    }
  });

  // Stripe checkout - create checkout session for the 21-Day Challenge
  // No auth required - users can buy as guests, access granted via webhook
  app.post("/api/checkout", async (req, res) => {
    try {
      const { currency = 'usd', unlockAllDays = false, utm } = req.body;
      const userEmail = req.isAuthenticated() && req.user ? (req.user as any).email : null;
      const stripe = await getUncachableStripeClient();

      // Price IDs from Stripe - main challenge
      const priceIds: Record<string, string> = {
        usd: 'price_1SqGYdLcRVtxg5yV9eeLLOJK',
        gbp: 'price_1SqGYdLcRVtxg5yVgbtDKL7S'
      };

      // Price IDs for Unlock All Days bump (coupon is restricted to challenge product only)
      const unlockPriceIds: Record<string, string> = {
        usd: 'price_1SxhHpLcRVtxg5yVD93NYLz6',
        gbp: 'price_1SxhHpLcRVtxg5yVeJC8rNlY'
      };

      const priceId = priceIds[currency.toLowerCase()] || priceIds.usd;
      const host = req.get('host');
      const protocol = req.protocol;

      const userId = req.isAuthenticated() && req.user ? (req.user as User).id : null;

      // Build line items - bump is a separate product so LAUNCHOFFER coupon won't apply to it
      const lineItems: any[] = [{ price: priceId, quantity: 1 }];
      if (unlockAllDays) {
        const unlockPriceId = unlockPriceIds[currency.toLowerCase()] || unlockPriceIds.usd;
        lineItems.push({ price: unlockPriceId, quantity: 1 });
      }

      const sessionConfig: any = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${protocol}://${host}/checkout/success?session_id={CHECKOUT_SESSION_ID}&currency=${currency}`,
        cancel_url: `${protocol}://${host}/order`,
        // Create a customer and save their payment method for one-click upsells
        customer_creation: 'always',
        payment_intent_data: {
          setup_future_usage: 'off_session',
          capture_method: 'automatic',
          description: '21-Day AI SaaS Challenge',
          metadata: { productType: 'challenge' },
        },
        metadata: {
          currency: currency,
          productType: 'challenge',
          unlockAllDays: unlockAllDays ? 'true' : 'false',
          userId: userId || '',
          landingUrl: utm?.landingUrl || '',
          referrer: utm?.referrer || '',
          utmSource: utm?.utm_source || '',
          utmMedium: utm?.utm_medium || '',
          utmCampaign: utm?.utm_campaign || '',
          utmContent: utm?.utm_content || '',
          utmTerm: utm?.utm_term || '',
        }
      };

      // Pre-fill email if user is logged in (reduces friction)
      if (userEmail) {
        sessionConfig.customer_email = userEmail;
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      const errorMessage = error?.message || "Unknown error";
      const errorType = error?.type || "unknown";
      res.status(500).json({
        message: "Failed to create checkout session",
        error: errorMessage,
        type: errorType,
        code: error?.code
      });
    }
  });

  // Stripe checkout - standalone Prompt Pack purchase (for users who already have the challenge)
  // Stripe checkout - Coaching (4 x 1-hour sessions) - Traditional checkout flow
  app.post("/api/checkout/coaching", async (req, res) => {
    try {
      const { currency = 'usd' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // 50% off pricing for upsell timer offer
      const coachingAmounts: Record<string, number> = {
        usd: 59900, // $599
        gbp: 49900  // £499
      };
      const amount = coachingAmounts[currency.toLowerCase()] || coachingAmounts.usd;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: '1:1 Vibe Coding Coaching - 4 x 1-Hour Sessions (50% Off)',
            },
            unit_amount: amount,
          },
          quantity: 1
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${protocol}://${host}/coaching/success?type=expert`,
        cancel_url: `${protocol}://${host}/coaching/upsell?currency=${currency}`,
        payment_intent_data: {
          capture_method: 'automatic',
          description: '4x Expert Coaching Sessions (50% Off)',
          metadata: { productType: 'coaching' },
        },
        metadata: {
          productType: 'coaching',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating coaching checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Single coaching session checkout
  app.post("/api/checkout/coaching-single", async (req, res) => {
    try {
      const { currency = 'gbp' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Expert Coaching Single Session by currency
      const singleCoachingPriceIds: Record<string, string> = {
        usd: 'price_1SuRqQLcRVtxg5yVXZEiD90P', // $449
        gbp: 'price_1SuRrJLcRVtxg5yV1VVLj4tb'  // £349
      };
      const priceId = singleCoachingPriceIds[currency.toLowerCase()] || singleCoachingPriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${protocol}://${host}/coaching/success?type=expert-single`,
        cancel_url: `${protocol}://${host}/coaching`,
        payment_intent_data: {
          capture_method: 'automatic',
          description: 'Expert Coaching Session',
          metadata: { productType: 'coaching-single' },
        },
        metadata: {
          productType: 'coaching-single',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating single coaching checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Matt Webley single session checkout
  app.post("/api/checkout/coaching-matt-single", async (req, res) => {
    try {
      const { currency = 'gbp' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Matt Webley Single Session by currency
      const mattSinglePriceIds: Record<string, string> = {
        usd: 'price_1SuRuZLcRVtxg5yV0KbmvkJq', // $2,495
        gbp: 'price_1SuRvNLcRVtxg5yVtZjO8frz'  // £1,995
      };
      const priceId = mattSinglePriceIds[currency.toLowerCase()] || mattSinglePriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${protocol}://${host}/coaching/success?type=matt-single`,
        cancel_url: `${protocol}://${host}/coaching`,
        payment_intent_data: {
          capture_method: 'automatic',
          description: 'Coaching Session with Matt',
          metadata: { productType: 'coaching-matt-single' },
        },
        metadata: {
          productType: 'coaching-matt-single',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating Matt single session checkout:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Matt Webley premium coaching checkout (4-pack)
  app.post("/api/checkout/coaching-matt", async (req, res) => {
    try {
      const { currency = 'gbp' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Matt Webley 4-Pack by currency
      const mattCoachingPriceIds: Record<string, string> = {
        usd: 'price_1SuRx2LcRVtxg5yVzHb934Fj', // $4,995
        gbp: 'price_1SuRxbLcRVtxg5yV1o8QJedw'  // £3,995
      };
      const priceId = mattCoachingPriceIds[currency.toLowerCase()] || mattCoachingPriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${protocol}://${host}/coaching/success?type=matt`,
        cancel_url: `${protocol}://${host}/coaching`,
        payment_intent_data: {
          capture_method: 'automatic',
          description: '4x Coaching Sessions with Matt',
          metadata: { productType: 'coaching-matt' },
        },
        metadata: {
          productType: 'coaching-matt',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating Matt coaching checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Unlock All Days - standalone purchase (for users already in the challenge)
  app.post("/api/checkout/unlock-all-days", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.allDaysUnlocked || user.coachingPurchased) {
        return res.status(400).json({ message: "You already have all days unlocked" });
      }

      const currency = user.purchaseCurrency || 'usd';
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      const bumpAmounts: Record<string, number> = {
        usd: 2900,
        gbp: 1900
      };

      const sessionConfig: any = {
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Unlock All 21 Days Instantly',
            },
            unit_amount: bumpAmounts[currency.toLowerCase()] || bumpAmounts.usd,
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/dashboard?unlocked=true`,
        cancel_url: `${protocol}://${host}/unlock`,
        metadata: {
          productType: 'unlock-all-days',
          currency,
          userId
        }
      };

      // Link to existing Stripe customer, or pre-fill email as fallback
      // Stripe doesn't allow both customer and customer_email at the same time
      if (user.stripeCustomerId) {
        sessionConfig.customer = user.stripeCustomerId;
      } else if (user.email) {
        sessionConfig.customer_email = user.email;
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating unlock checkout:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Sales Page Video Critique checkout
  app.post("/api/checkout/critique", async (req, res) => {
    try {
      const { currency = 'gbp' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Video Critique by currency
      const critiquePriceIds: Record<string, string> = {
        usd: 'price_1SuRyALcRVtxg5yVHWUA01js', // $595
        gbp: 'price_1SuRyiLcRVtxg5yVTFd2ME6M'  // £495
      };

      const priceId = critiquePriceIds[currency.toLowerCase()] || critiquePriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${protocol}://${host}/critique/success`,
        cancel_url: `${protocol}://${host}/critique`,
        payment_intent_data: {
          capture_method: 'automatic',
          description: 'SaaS Critique',
          metadata: { productType: 'critique' },
        },
        metadata: {
          productType: 'critique',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating critique checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Process checkout success - verify purchase and store customer ID for upsells
  // No auth required - works for guests and logged-in users
  app.post("/api/checkout/process-success", async (req, res) => {
    console.log('[Process Success] Starting...');
    console.log('[Process Success] Express Session ID:', req.sessionID);
    console.log('[Process Success] Has session:', !!req.session);

    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      const isLoggedIn = req.isAuthenticated() && req.user;
      console.log('[Process Success] Stripe Session:', sessionId, 'Logged in:', !!isLoggedIn);

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'payment_intent.payment_method']
      });

      // Debug: Log the full session object to understand what Stripe returns
      console.log('[Process Success] Full session object:', JSON.stringify({
        id: session.id,
        mode: session.mode,
        payment_status: session.payment_status,
        status: session.status,
        customer: session.customer,
        payment_intent: session.payment_intent,
        payment_method_types: session.payment_method_types,
        amount_total: session.amount_total
      }, null, 2));
      
      console.log('[Process Success] Payment status:', session.payment_status, 'Customer:', session.customer);

      // Verify payment was successful
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      // Get customer ID for one-click upsells
      const customerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;

      // Get payment method from the payment intent for one-click upsells
      let paymentMethodId: string | null = null;
      
      // Try to get payment intent ID from session
      const paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : (session.payment_intent as any)?.id || null;
      
      console.log('[Process Success] PaymentIntent ID from session:', paymentIntentId);
      
      if (paymentIntentId) {
        // Retrieve the payment intent to get the payment method
        try {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
          console.log('[Process Success] Retrieved PI:', pi.id, 'payment_method:', pi.payment_method, 'status:', pi.status);
          paymentMethodId = typeof pi.payment_method === 'string' 
            ? pi.payment_method 
            : (pi.payment_method as any)?.id || null;
          console.log('[Process Success] Got payment method from PI:', paymentMethodId);
        } catch (err) {
          console.error('[Process Success] Error retrieving payment intent:', err);
        }
      }
      
      // Fallback: If no payment method found, search customer's payment intents
      if (!paymentMethodId && customerId) {
        console.log('[Process Success] No PM from session PI, searching customer payment intents...');
        try {
          const paymentIntents = await stripe.paymentIntents.list({
            customer: customerId,
            limit: 5
          });
          console.log('[Process Success] Found', paymentIntents.data.length, 'payment intents for customer');
          
          // Find the most recent successful one with a payment method
          for (const pi of paymentIntents.data) {
            if (pi.status === 'succeeded' && pi.payment_method) {
              paymentMethodId = typeof pi.payment_method === 'string' 
                ? pi.payment_method 
                : (pi.payment_method as any)?.id || null;
              console.log('[Process Success] Found PM from customer PI:', paymentMethodId);
              break;
            }
          }
        } catch (err) {
          console.error('[Process Success] Error searching customer PIs:', err);
        }
      }
      
      // Last fallback: List payment methods attached to customer
      if (!paymentMethodId && customerId) {
        console.log('[Process Success] Still no PM, listing customer payment methods...');
        try {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
            limit: 1
          });
          if (paymentMethods.data.length > 0) {
            paymentMethodId = paymentMethods.data[0].id;
            console.log('[Process Success] Found PM from customer list:', paymentMethodId);
          }
        } catch (err) {
          console.error('[Process Success] Error listing customer PMs:', err);
        }
      }
      
      console.log('[Process Success] Final payment method ID:', paymentMethodId);

      // Store customer ID and payment method in session for immediate upsells (works for guests)
      // CRITICAL: Must save session explicitly before responding for it to persist
      if (customerId && req.session) {
        (req.session as any).stripeCustomerId = customerId;
        (req.session as any).stripePaymentMethodId = paymentMethodId;
        (req.session as any).purchaseCurrency = session.metadata?.currency?.toLowerCase() || 'usd';
        console.log('[Process Success] Storing in session - Customer:', customerId, 'PaymentMethod:', paymentMethodId);

        // Explicitly save session to ensure it persists before response
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error('[Process Success] Session save error:', err);
              reject(err);
            } else {
              console.log('[Process Success] Session saved successfully');
              resolve();
            }
          });
        });
      }

      // If user is logged in, also update their user record
      if (isLoggedIn) {
        const updateData: Record<string, any> = {
          challengePurchased: true,
        };

        if (customerId) {
          updateData.stripeCustomerId = customerId;
        }
        if (session.metadata?.currency) {
          updateData.purchaseCurrency = session.metadata.currency.toLowerCase();
        }

        await db.update(users)
          .set(updateData)
          .where(eq(users.id, (req.user as User).id));

        console.log('[Process Success] Updated user record:', (req.user as User).id);
      }

      // Track A/B test conversion if variant was assigned
      const abVariantId = req.cookies?.ab_variant;
      if (abVariantId) {
        try {
          const variantIdNum = parseInt(abVariantId);
          const [variant] = await db.select().from(abVariants).where(eq(abVariants.id, variantIdNum));
          if (variant) {
            await db.update(abVariants)
              .set({ conversions: (variant.conversions || 0) + 1 })
              .where(eq(abVariants.id, variantIdNum));
          }
        } catch (abError) {
          console.error('A/B conversion tracking error:', abError);
          // Don't fail the purchase if A/B tracking fails
        }
      }

      // Send purchase confirmation email only for logged-in users (they already have an account)
      // Guest checkouts get a welcome email with magic link from the webhook instead
      if (isLoggedIn && req.user) {
        const user = req.user as any;
        const userEmail = user.email;
        const firstName = user.firstName || 'there';
        const currency = (session.metadata?.currency || 'usd').toLowerCase() as 'usd' | 'gbp';
        const total = session.amount_total ? session.amount_total / 100 : 399;

        if (userEmail) {
          sendPurchaseConfirmationEmail({
            to: userEmail,
            firstName,
            currency,
            total
          }).catch(err => console.error('Email send error:', err));
        }
      }

      res.json({
        success: true,
        challengePurchased: true,
        // Debug info for tracking session persistence
        debug: {
          sessionId: req.sessionID,
          hasStripeCustomer: !!(req.session as any)?.stripeCustomerId
        }
      });
    } catch (error: any) {
      console.error("Error processing checkout success:", error);
      res.status(500).json({ message: "Failed to process checkout" });
    }
  });

  // Create account directly from Stripe checkout session (for guest purchasers)
  // This runs on the success page so users don't need to find a magic link email
  app.post("/api/auth/setup-from-checkout", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      const rawEmail = session.customer_email || session.customer_details?.email;
      const email = rawEmail?.toLowerCase().trim();
      if (!email) {
        return res.status(400).json({ message: "No email found in checkout session" });
      }

      // Check if user already exists (logged-in purchase or already created)
      const [existingUser] = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${email}`);

      if (existingUser) {
        // User exists  - just log them in
        if (req.session) {
          (req.session as any).userId = existingUser.id;
          (req.session as any).userEmail = existingUser.email;
          (req.session as any).checkoutAuth = true;
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => err ? reject(err) : resolve());
          });
        }
        return res.json({ success: true, message: "Logged in to existing account", userId: existingUser.id });
      }

      // Create new user account
      const newUserId = crypto.randomUUID();
      const fullName = session.customer_details?.name?.trim();
      const firstName = fullName?.split(' ')[0] || null;
      const lastName = fullName?.split(' ').slice(1).join(' ') || null;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      const currency = session.metadata?.currency || 'usd';
      const unlockAllDays = session.metadata?.unlockAllDays === 'true';
      const productType = session.metadata?.productType || 'challenge';

      await db.insert(users).values({
        id: newUserId,
        email,
        firstName,
        lastName,
        challengePurchased: productType.startsWith('challenge'),
        coachingPurchased: productType.includes('coaching'),
        allDaysUnlocked: unlockAllDays,
        stripeCustomerId: customerId || null,
        purchaseCurrency: currency.toLowerCase() as 'usd' | 'gbp',
        // Traffic source from ad click
        landingUrl: session.metadata?.landingUrl || null,
        referrerUrl: session.metadata?.referrer || null,
        utmSource: session.metadata?.utmSource || null,
        utmMedium: session.metadata?.utmMedium || null,
        utmCampaign: session.metadata?.utmCampaign || null,
        utmContent: session.metadata?.utmContent || null,
        utmTerm: session.metadata?.utmTerm || null,
      });

      // Link any pending purchases for this email
      const pendingList = await db.select().from(pendingPurchases)
        .where(sql`lower(${pendingPurchases.email}) = ${email}`);

      for (const purchase of pendingList) {
        if (!purchase.linkedToUserId) {
          const hasUnlock = purchase.productType.includes('+unlock');
          if (hasUnlock) {
            await db.update(users).set({ allDaysUnlocked: true }).where(eq(users.id, newUserId));
          }
          await db.update(pendingPurchases)
            .set({ linkedToUserId: newUserId, linkedAt: new Date() })
            .where(eq(pendingPurchases.id, purchase.id));
        }
      }

      // Log them in immediately
      if (req.session) {
        (req.session as any).userId = newUserId;
        (req.session as any).userEmail = email;
        (req.session as any).checkoutAuth = true;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => err ? reject(err) : resolve());
        });
      }

      console.log('[Setup From Checkout] Account created and logged in:', email, newUserId);

      // Send purchase confirmation email
      const total = session.amount_total ? session.amount_total / 100 : 399;
      sendPurchaseConfirmationEmail({
        to: email,
        firstName: firstName || 'there',
        currency: currency.toLowerCase() as 'usd' | 'gbp',
        total
      }).catch(err => console.error('[Setup From Checkout] Email error:', err));

      res.json({ success: true, message: "Account created", userId: newUserId });
    } catch (error: any) {
      console.error("Error setting up account from checkout:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Debug endpoint to check session state (Admin only)
  app.get("/api/debug/session", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const isLoggedIn = req.isAuthenticated() && req.user;
      res.json({
        sessionId: req.sessionID,
        hasSession: !!req.session,
        isLoggedIn,
        sessionData: {
          stripeCustomerId: (req.session as any)?.stripeCustomerId || null,
          purchaseCurrency: (req.session as any)?.purchaseCurrency || null,
        },
        userData: isLoggedIn ? {
          id: (req.user as any).id,
          stripeCustomerId: (req.user as any).stripeCustomerId || null,
        } : null,
        cookies: req.headers.cookie ? 'present' : 'missing',
      });
    } catch (error) {
      res.status(500).json({ message: "Error checking session" });
    }
  });

  // One-click upsell - Coaching purchase using saved payment method
  // Works for both logged-in users and guests (uses session-stored customer ID)
  app.post("/api/upsell/coaching", async (req, res) => {
    console.log('[One-click upsell] Starting...');
    console.log('[One-click upsell] Session ID:', req.sessionID);
    console.log('[One-click upsell] Session data:', JSON.stringify({
      stripeCustomerId: (req.session as any)?.stripeCustomerId,
      stripePaymentMethodId: (req.session as any)?.stripePaymentMethodId,
      purchaseCurrency: (req.session as any)?.purchaseCurrency,
      hasSession: !!req.session
    }));

    try {
      const { currency = 'usd' } = req.body;

      // Get customer ID from user record OR session (for guests)
      const isLoggedIn = req.isAuthenticated() && req.user;
      const userId = isLoggedIn ? (req.user as User).id : null;

      // For logged-in users, fetch FRESH data from database (req.user might be stale)
      let userCustomerId = null;
      if (isLoggedIn && userId) {
        const [freshUser] = await db.select().from(users).where(eq(users.id, userId));
        userCustomerId = freshUser?.stripeCustomerId || null;
        console.log('[One-click upsell] Fresh user data - customerId:', userCustomerId);
      }

      const sessionCustomerId = (req.session as any)?.stripeCustomerId;
      const sessionPaymentMethodId = (req.session as any)?.stripePaymentMethodId;
      const stripeCustomerId = userCustomerId || sessionCustomerId;

      console.log('[One-click upsell] User:', userId || 'guest');
      console.log('[One-click upsell] User customerId (from DB):', userCustomerId);
      console.log('[One-click upsell] Session customerId:', sessionCustomerId);
      console.log('[One-click upsell] Session paymentMethodId:', sessionPaymentMethodId);
      console.log('[One-click upsell] Using customerId:', stripeCustomerId, '(from', userCustomerId ? 'user-db' : sessionCustomerId ? 'session' : 'none', ')');

      // Pricing based on currency (amount in smallest unit - cents/pence)
      const coachingPricing: Record<string, { amount: number; currency: string }> = {
        usd: { amount: 59900, currency: 'usd' }, // $599 (50% off)
        gbp: { amount: 49900, currency: 'gbp' }  // £499 (50% off)
      };
      const priceConfig = coachingPricing[currency.toLowerCase()] || coachingPricing.usd;

      if (!stripeCustomerId) {
        console.log('[One-click upsell] No stripeCustomerId found - falling back to checkout');
        return res.status(400).json({ message: "No saved payment method", requiresCheckout: true });
      }

      const stripe = await getUncachableStripeClient();

      // If we have a stored payment method from session, use it directly
      if (sessionPaymentMethodId) {
        console.log('[One-click upsell] Using stored payment method from session:', sessionPaymentMethodId);
        
        try {
          // Get customer email for receipts
          const customer = await stripe.customers.retrieve(stripeCustomerId) as any;
          const customerEmail = customer.email;
          
          // Create and confirm payment intent with the stored payment method
          const paymentIntent = await stripe.paymentIntents.create({
            amount: priceConfig.amount,
            currency: priceConfig.currency,
            customer: stripeCustomerId,
            payment_method: sessionPaymentMethodId,
            off_session: true,
            confirm: true,
            capture_method: 'automatic',
            description: '1:1 Vibe Coding Coaching - 4 x 1-hour sessions',
            metadata: {
              userId: userId || '',
              productType: 'coaching',
              email: customerEmail || ''
            }
          });

          console.log('[One-click upsell] Stored PM payment intent status:', paymentIntent.status);

          if (paymentIntent.status === 'succeeded') {
            console.log('[One-click upsell] SUCCESS with stored PM! Charging completed for:', userId || 'guest');

            if (userId) {
              await db.update(users)
                .set({ coachingPurchased: true, allDaysUnlocked: true })
                .where(eq(users.id, userId));

              const user = req.user as any;
              const userEmail = user?.email;
              const firstName = user?.firstName || 'there';
              const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown';
              if (userEmail) {
                sendCoachingConfirmationEmail({
                  to: userEmail,
                  firstName,
                  currency: currency.toLowerCase() as 'usd' | 'gbp',
                  amount: priceConfig.amount / 100
                }).catch(err => console.error('Email send error:', err));

                sendCoachingPurchaseNotificationEmail({
                  userEmail,
                  userName,
                  coachingType: '4 x 1-hour coaching sessions',
                  currency: currency.toLowerCase() as 'usd' | 'gbp',
                  amount: priceConfig.amount / 100
                }).catch(err => console.error('Coaching notification error:', err));
              }
            } else if (customerEmail) {
              const normalizedEmail = customerEmail.toLowerCase().trim();
              await db.insert(pendingPurchases).values({
                email: normalizedEmail,
                stripeCustomerId,
                stripeSessionId: `pi_${paymentIntent.id}`,
                productType: 'coaching',
                currency: priceConfig.currency,
                amountPaid: priceConfig.amount
              }).onConflictDoNothing();

              sendCoachingConfirmationEmail({
                to: normalizedEmail,
                firstName: 'there',
                currency: currency.toLowerCase() as 'usd' | 'gbp',
                amount: priceConfig.amount / 100
              }).catch(err => console.error('Email send error:', err));

              sendCoachingPurchaseNotificationEmail({
                userEmail: normalizedEmail,
                userName: normalizedEmail,
                coachingType: '4 x 1-hour coaching sessions (guest)',
                currency: currency.toLowerCase() as 'usd' | 'gbp',
                amount: priceConfig.amount / 100
              }).catch(err => console.error('Coaching notification error:', err));
            }

            return res.json({ success: true, message: "Coaching purchased successfully!" });
          } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method') {
            console.log('[One-click upsell] Stored PM requires action - falling back to checkout');
            return res.status(400).json({ 
              message: "Card requires additional verification", 
              requiresCheckout: true 
            });
          } else {
            console.log('[One-click upsell] Stored PM failed with status:', paymentIntent.status);
            return res.status(400).json({ message: "Payment failed", status: paymentIntent.status, requiresCheckout: true });
          }
        } catch (storedPmError: any) {
          console.error('[One-click upsell] Error with stored PM:', storedPmError.message);
          // Fall through to try other methods
        }
      }

      // Get the customer with expanded payment methods info
      const customer = await stripe.customers.retrieve(stripeCustomerId, {
        expand: ['invoice_settings.default_payment_method']
      }) as any;
      
      console.log('[One-click upsell] Customer retrieved:', {
        id: customer.id,
        email: customer.email,
        defaultPM: customer.invoice_settings?.default_payment_method,
        defaultSource: customer.default_source
      });

      let paymentMethodId = customer.invoice_settings?.default_payment_method?.id ||
                            customer.invoice_settings?.default_payment_method ||
                            customer.default_source;

      console.log('[One-click upsell] Initial payment method ID:', paymentMethodId);

      if (!paymentMethodId) {
        // If no default, list all payment methods attached to customer
        const paymentMethods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card',
          limit: 10
        });

        console.log('[One-click upsell] Payment methods found:', paymentMethods.data.length);
        if (paymentMethods.data.length > 0) {
          console.log('[One-click upsell] Available payment methods:', paymentMethods.data.map(pm => ({
            id: pm.id,
            brand: pm.card?.brand,
            last4: pm.card?.last4,
            created: pm.created
          })));
        }

        if (paymentMethods.data.length === 0) {
          // Last resort: check recent payment intents for this customer
          console.log('[One-click upsell] No payment methods via list - checking recent payment intents...');
          
          const recentPayments = await stripe.paymentIntents.list({
            customer: stripeCustomerId,
            limit: 5
          });
          
          console.log('[One-click upsell] Recent payment intents:', recentPayments.data.length);
          
          // Find the most recent successful payment with a payment method
          const successfulPayment = recentPayments.data.find(pi => 
            pi.status === 'succeeded' && pi.payment_method
          );
          
          if (successfulPayment && successfulPayment.payment_method) {
            const pmId = typeof successfulPayment.payment_method === 'string' 
              ? successfulPayment.payment_method 
              : successfulPayment.payment_method.id;
            console.log('[One-click upsell] Found payment method from recent intent:', pmId);
            paymentMethodId = pmId;
          } else {
            console.log('[One-click upsell] No payment methods found anywhere - falling back to checkout');
            return res.status(400).json({ message: "No saved payment method", requiresCheckout: true });
          }
        }

        // Use the first available payment method (or the one from payment intent)
        const pm = paymentMethods.data[0] || { id: paymentMethodId };

        // Get customer email from Stripe for guest purchases
        const customerEmail = customer.email;

        // Create and confirm payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: priceConfig.amount,
          currency: priceConfig.currency,
          customer: stripeCustomerId,
          payment_method: pm.id,
          off_session: true,
          confirm: true,
          capture_method: 'automatic',
          description: '1:1 Vibe Coding Coaching - 4 x 1-hour sessions',
          metadata: {
            userId: userId || '',
            productType: 'coaching',
            email: customerEmail || ''
          }
        });

        console.log('[One-click upsell] Payment intent status:', paymentIntent.status);

        if (paymentIntent.status === 'succeeded') {
          console.log('[One-click upsell] SUCCESS! Charging completed for:', userId || 'guest');

          if (userId) {
            // Logged-in user - update their record directly
            await db.update(users)
              .set({ coachingPurchased: true, allDaysUnlocked: true })
              .where(eq(users.id, userId));

            // Send coaching confirmation email to customer
            const user = req.user as any;
            const userEmail = user.email;
            const firstName = user.firstName || 'there';
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
            if (userEmail) {
              sendCoachingConfirmationEmail({
                to: userEmail,
                firstName,
                currency: currency.toLowerCase() as 'usd' | 'gbp',
                amount: priceConfig.amount / 100
              }).catch(err => console.error('Email send error:', err));

              sendCoachingPurchaseNotificationEmail({
                userEmail,
                userName,
                coachingType: '4 x 1-hour coaching sessions',
                currency: currency.toLowerCase() as 'usd' | 'gbp',
                amount: priceConfig.amount / 100
              }).catch(err => console.error('Coaching notification error:', err));
            }
          } else if (customerEmail) {
            // Guest - save as pending purchase (will be linked when they log in)
            const normalizedEmail = customerEmail.toLowerCase().trim();
            await db.insert(pendingPurchases).values({
              email: normalizedEmail,
              stripeCustomerId,
              stripeSessionId: `pi_${paymentIntent.id}`, // Use payment intent ID as unique identifier
              productType: 'coaching',
              currency: priceConfig.currency,
              amountPaid: priceConfig.amount
            }).onConflictDoNothing();

            // Send emails using customer email
            sendCoachingConfirmationEmail({
              to: normalizedEmail,
              firstName: 'there',
              currency: currency.toLowerCase() as 'usd' | 'gbp',
              amount: priceConfig.amount / 100
            }).catch(err => console.error('Email send error:', err));

            sendCoachingPurchaseNotificationEmail({
              userEmail: normalizedEmail,
              userName: normalizedEmail,
              coachingType: '4 x 1-hour coaching sessions (guest)',
              currency: currency.toLowerCase() as 'usd' | 'gbp',
              amount: priceConfig.amount / 100
            }).catch(err => console.error('Coaching notification error:', err));
          }

          return res.json({ success: true, message: "Coaching purchased successfully!" });
        } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method') {
          // Card requires 3D Secure - fall back to checkout
          console.log('[One-click upsell] Listed PM requires action - falling back to checkout');
          return res.status(400).json({ 
            message: "Card requires additional verification", 
            requiresCheckout: true 
          });
        } else {
          console.log('[One-click upsell] Listed PM failed with status:', paymentIntent.status);
          return res.status(400).json({ message: "Payment failed", status: paymentIntent.status, requiresCheckout: true });
        }
      }

      // Get customer email from Stripe for guest purchases
      const customerEmail = customer.email;

      // Create and confirm payment intent with default payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceConfig.amount,
        currency: priceConfig.currency,
        customer: stripeCustomerId,
        payment_method: paymentMethodId as string,
        off_session: true,
        confirm: true,
        capture_method: 'automatic',
        description: '1:1 Vibe Coding Coaching - 4 x 1-hour sessions',
        metadata: {
          userId: userId || '',
          productType: 'coaching',
          email: customerEmail || ''
        }
      });

      console.log('[One-click upsell] Payment intent status (default PM):', paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        console.log('[One-click upsell] SUCCESS! Charging completed for:', userId || 'guest');

        if (userId) {
          // Logged-in user - update their record directly
          await db.update(users)
            .set({ coachingPurchased: true, allDaysUnlocked: true })
            .where(eq(users.id, userId));

          const user = req.user as any;
          const userEmail = user.email;
          const firstName = user.firstName || 'there';
          const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
          if (userEmail) {
            sendCoachingConfirmationEmail({
              to: userEmail,
              firstName,
              currency: currency.toLowerCase() as 'usd' | 'gbp',
              amount: priceConfig.amount / 100
            }).catch(err => console.error('Email send error:', err));

            sendCoachingPurchaseNotificationEmail({
              userEmail,
              userName,
              coachingType: '4 x 1-hour coaching sessions',
              currency: currency.toLowerCase() as 'usd' | 'gbp',
              amount: priceConfig.amount / 100
            }).catch(err => console.error('Coaching notification error:', err));
          }
        } else if (customerEmail) {
          // Guest - save as pending purchase
          const normalizedEmail = customerEmail.toLowerCase().trim();
          await db.insert(pendingPurchases).values({
            email: normalizedEmail,
            stripeCustomerId,
            stripeSessionId: `pi_${paymentIntent.id}`,
            productType: 'coaching',
            currency: priceConfig.currency,
            amountPaid: priceConfig.amount
          }).onConflictDoNothing();

          sendCoachingConfirmationEmail({
            to: normalizedEmail,
            firstName: 'there',
            currency: currency.toLowerCase() as 'usd' | 'gbp',
            amount: priceConfig.amount / 100
          }).catch(err => console.error('Email send error:', err));

          sendCoachingPurchaseNotificationEmail({
            userEmail: normalizedEmail,
            userName: normalizedEmail,
            coachingType: '4 x 1-hour coaching sessions (guest)',
            currency: currency.toLowerCase() as 'usd' | 'gbp',
            amount: priceConfig.amount / 100
          }).catch(err => console.error('Coaching notification error:', err));
        }

        return res.json({ success: true, message: "Coaching purchased successfully!" });
      } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method') {
        // Card requires 3D Secure or additional action - fall back to checkout
        console.log('[One-click upsell] Payment requires action - falling back to checkout');
        return res.status(400).json({ 
          message: "Card requires additional verification", 
          requiresCheckout: true 
        });
      } else {
        console.log('[One-click upsell] Payment failed with status:', paymentIntent.status);
        return res.status(400).json({ message: "Payment failed", status: paymentIntent.status, requiresCheckout: true });
      }
    } catch (error: any) {
      console.error("Error processing one-click upsell:", error);
      console.error("Error details:", { 
        code: error.code, 
        type: error.type, 
        message: error.message,
        decline_code: error.decline_code
      });

      // Handle card declined or authentication required
      if (error.code === 'authentication_required' || 
          error.code === 'card_declined' ||
          error.code === 'payment_intent_authentication_failure') {
        return res.status(400).json({
          message: "Card requires authentication or was declined",
          requiresCheckout: true
        });
      }

      res.status(500).json({ message: "Failed to process payment", requiresCheckout: true });
    }
  });

  // ==========================================
  // A/B TESTING ROUTES
  // ==========================================

  // Public: Get active headline test and assign variant
  app.get("/api/ab/active-headline", async (req, res) => {
    try {
      // Get active test
      const activeTest = await db.select().from(abTests).where(eq(abTests.isActive, true)).limit(1);

      if (activeTest.length === 0) {
        return res.json({ hasTest: false });
      }

      const test = activeTest[0];

      // Get all variants for this test
      const variants = await db.select().from(abVariants).where(eq(abVariants.testId, test.id));

      if (variants.length === 0) {
        return res.json({ hasTest: false });
      }

      // Check if visitor already has a variant assigned (from cookie)
      const existingVariantId = req.cookies?.ab_variant;
      const existingVariant = existingVariantId
        ? variants.find(v => v.id === parseInt(existingVariantId))
        : null;

      if (existingVariant) {
        return res.json({
          hasTest: true,
          testId: test.id,
          variantId: existingVariant.id,
          headline: existingVariant.headline,
          variantName: existingVariant.name
        });
      }

      // Randomly assign a variant
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];

      // Set cookie (30 day expiry)
      res.cookie('ab_variant', randomVariant.id.toString(), {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
      });

      res.json({
        hasTest: true,
        testId: test.id,
        variantId: randomVariant.id,
        headline: randomVariant.headline,
        variantName: randomVariant.name
      });
    } catch (error) {
      console.error("Error fetching active headline test:", error);
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  // Public: Track a view for a variant
  app.post("/api/ab/track-view", async (req, res) => {
    try {
      const { variantId } = req.body;
      if (!variantId) {
        return res.status(400).json({ message: "Variant ID required" });
      }

      // Check if this visitor already viewed (using cookie)
      const viewedKey = `ab_viewed_${variantId}`;
      if (req.cookies?.[viewedKey]) {
        return res.json({ success: true, alreadyTracked: true });
      }

      // Increment view count
      const [variant] = await db.select().from(abVariants).where(eq(abVariants.id, variantId));
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      await db.update(abVariants)
        .set({ views: (variant.views || 0) + 1 })
        .where(eq(abVariants.id, variantId));

      // Set cookie to prevent duplicate view tracking
      res.cookie(viewedKey, '1', {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Admin: List all A/B tests with variants and stats
  app.get("/api/admin/ab/tests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tests = await db.select().from(abTests).orderBy(abTests.createdAt);

      // Get variants for each test
      const testsWithVariants = await Promise.all(
        tests.map(async (test) => {
          const variants = await db.select().from(abVariants).where(eq(abVariants.testId, test.id));
          const totalViews = variants.reduce((sum, v) => sum + (v.views || 0), 0);
          const totalConversions = variants.reduce((sum, v) => sum + (v.conversions || 0), 0);
          return {
            ...test,
            variants,
            totalViews,
            totalConversions,
            overallConversionRate: totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(2) : '0.00'
          };
        })
      );

      res.json(testsWithVariants);
    } catch (error) {
      console.error("Error fetching A/B tests:", error);
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  // Admin: Create a new A/B test
  app.post("/api/admin/ab/tests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { name, variants: variantData } = req.body;
      if (!name || !variantData || !Array.isArray(variantData) || variantData.length < 2) {
        return res.status(400).json({ message: "Name and at least 2 variants required" });
      }

      // Create the test
      const [newTest] = await db.insert(abTests).values({ name }).returning();

      // Create variants
      const createdVariants = await Promise.all(
        variantData.map(async (v: { name: string; headline: string }) => {
          const [variant] = await db.insert(abVariants).values({
            testId: newTest.id,
            name: v.name,
            headline: v.headline
          }).returning();
          return variant;
        })
      );

      res.json({ ...newTest, variants: createdVariants });
    } catch (error) {
      console.error("Error creating A/B test:", error);
      res.status(500).json({ message: "Failed to create test" });
    }
  });

  // Admin: Update a test (toggle active, rename)
  app.patch("/api/admin/ab/tests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const testId = parseInt(req.params.id);
      const { name, isActive } = req.body;

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (isActive !== undefined) {
        // If activating this test, deactivate all others first
        if (isActive) {
          await db.update(abTests).set({ isActive: false });
        }
        updateData.isActive = isActive;
      }

      const [updated] = await db.update(abTests)
        .set(updateData)
        .where(eq(abTests.id, testId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating A/B test:", error);
      res.status(500).json({ message: "Failed to update test" });
    }
  });

  // Admin: Delete a test
  app.delete("/api/admin/ab/tests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const testId = parseInt(req.params.id);
      await db.delete(abTests).where(eq(abTests.id, testId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting A/B test:", error);
      res.status(500).json({ message: "Failed to delete test" });
    }
  });

  // Admin: Add variant to a test
  app.post("/api/admin/ab/tests/:id/variants", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const testId = parseInt(req.params.id);
      const { name, headline } = req.body;

      if (!name || !headline) {
        return res.status(400).json({ message: "Name and headline required" });
      }

      const [variant] = await db.insert(abVariants).values({
        testId,
        name,
        headline
      }).returning();

      res.json(variant);
    } catch (error) {
      console.error("Error adding variant:", error);
      res.status(500).json({ message: "Failed to add variant" });
    }
  });

  // Admin: Update a variant
  app.patch("/api/admin/ab/variants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const variantId = parseInt(req.params.id);
      const { name, headline } = req.body;

      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = name;
      if (headline !== undefined) updateData.headline = headline;

      const [updated] = await db.update(abVariants)
        .set(updateData)
        .where(eq(abVariants.id, variantId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating variant:", error);
      res.status(500).json({ message: "Failed to update variant" });
    }
  });

  // Admin: Delete a variant
  app.delete("/api/admin/ab/variants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const variantId = parseInt(req.params.id);
      await db.delete(abVariants).where(eq(abVariants.id, variantId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting variant:", error);
      res.status(500).json({ message: "Failed to delete variant" });
    }
  });

  // Admin: Reset stats for a test
  app.post("/api/admin/ab/tests/:id/reset", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const testId = parseInt(req.params.id);
      await db.update(abVariants)
        .set({ views: 0, conversions: 0 })
        .where(eq(abVariants.testId, testId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error resetting stats:", error);
      res.status(500).json({ message: "Failed to reset stats" });
    }
  });

  // Admin: Generate headline alternatives with AI
  app.post("/api/admin/ab/generate-headlines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { currentHeadline } = req.body;
      if (!currentHeadline) {
        return res.status(400).json({ message: "Current headline required" });
      }

      const result = await callClaude({
        userId,
        endpoint: 'generate-ab-headlines',
        endpointType: 'general',
        systemPrompt: 'You are a world-class direct response copywriter. Return ONLY a JSON array of 5 headline strings.',
        userMessage: `Generate 5 alternative headlines for an A/B test. The current control headline is:

"${currentHeadline}"

This is for a product called "21-Day AI SaaS Challenge" - a course that teaches complete beginners how to build working software products using AI, without coding experience, in 21 days, for less than $100.

Generate 5 distinctly different headline approaches. Consider:
- Different emotional angles (fear, curiosity, aspiration, urgency)
- Different structures (how-to, question, story, direct promise)
- Different hooks (specificity, social proof, contrarian, news)

Return ONLY a JSON array of 5 strings, nothing else. Each headline should be compelling, specific, and testable against the control.

Example format:
["Headline 1...", "Headline 2...", "Headline 3...", "Headline 4...", "Headline 5..."]`,
        maxTokens: 1000,
        temperature: 1,
      });

      if (!result.success) {
        return res.status(result.blocked ? 429 : 500).json({
          message: result.error || "Failed to generate headlines"
        });
      }

      const content = result.response || "[]";

      // Parse the JSON array from the response
      let headlines: string[] = [];
      try {
        // Try to extract JSON array from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          headlines = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse headlines:", parseError);
        return res.status(500).json({ message: "Failed to parse generated headlines" });
      }

      if (!Array.isArray(headlines) || headlines.length === 0) {
        return res.status(500).json({ message: "No headlines generated" });
      }

      res.json({ headlines: headlines.slice(0, 5) });
    } catch (error) {
      console.error("Error generating headlines:", error);
      res.status(500).json({ message: "Failed to generate headlines" });
    }
  });

  // Critique submission - save details for Matt to review
  app.post("/api/critique/submit", isAuthenticated, async (req: any, res) => {
    console.log("[CRITIQUE] Endpoint hit, user:", req.user?.claims?.sub);
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.challengePurchased && !user?.isAdmin) {
        return res.status(403).json({ message: "Purchase required" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { salesPageUrl, preferredEmail, productDescription, targetAudience, specificQuestions } = req.body;

      if (!salesPageUrl) {
        return res.status(400).json({ message: "Sales page URL is required" });
      }

      const userName = user.firstName || user.email || 'Unknown';
      const emailForVideo = preferredEmail || user.email || 'unknown@email.com';

      // Save to database
      await db.insert(critiqueRequests).values({
        userId,
        salesPageUrl,
        preferredEmail: emailForVideo,
        productDescription: productDescription || null,
        targetAudience: targetAudience || null,
        specificQuestions: specificQuestions || null,
        status: 'pending'
      });

      console.log("Critique submission saved:", {
        userId,
        email: user.email,
        preferredEmail: emailForVideo,
        name: userName,
        salesPageUrl
      });

      // Send email notification to Matt
      try {
        await sendCritiqueNotificationEmail({
          userEmail: user.email || 'unknown@email.com',
          preferredEmail: emailForVideo,
          userName,
          salesPageUrl,
          productDescription: productDescription || null,
          targetAudience: targetAudience || null,
          specificQuestions: specificQuestions || null
        });
      } catch (emailError) {
        console.error("Failed to send critique notification email:", emailError);
        // Don't fail the request if email fails
      }

      res.json({ success: true, message: "Critique request submitted" });
    } catch (error) {
      console.error("Error submitting critique request:", error);
      res.status(500).json({ message: "Failed to submit critique request" });
    }
  });

  // Admin: Get all critique requests
  app.get("/api/admin/critiques", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const requests = await db
        .select({
          id: critiqueRequests.id,
          userId: critiqueRequests.userId,
          salesPageUrl: critiqueRequests.salesPageUrl,
          productDescription: critiqueRequests.productDescription,
          targetAudience: critiqueRequests.targetAudience,
          specificQuestions: critiqueRequests.specificQuestions,
          status: critiqueRequests.status,
          videoUrl: critiqueRequests.videoUrl,
          completedAt: critiqueRequests.completedAt,
          createdAt: critiqueRequests.createdAt,
          userEmail: users.email,
          userFirstName: users.firstName
        })
        .from(critiqueRequests)
        .leftJoin(users, eq(critiqueRequests.userId, users.id))
        .orderBy(critiqueRequests.createdAt);

      res.json(requests);
    } catch (error) {
      console.error("Error fetching critique requests:", error);
      res.status(500).json({ message: "Failed to fetch critique requests" });
    }
  });

  // Admin: Update critique status
  app.patch("/api/admin/critiques/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const critiqueId = parseInt(req.params.id);
      const { status, videoUrl } = req.body;

      const updateData: any = { status };
      if (videoUrl) updateData.videoUrl = videoUrl;
      if (status === 'completed') updateData.completedAt = new Date();

      await db
        .update(critiqueRequests)
        .set(updateData)
        .where(eq(critiqueRequests.id, critiqueId));

      // Send email to user when critique is completed with video
      if (status === 'completed' && videoUrl) {
        const [critique] = await db
          .select({
            preferredEmail: critiqueRequests.preferredEmail,
            userEmail: users.email,
            userFirstName: users.firstName
          })
          .from(critiqueRequests)
          .leftJoin(users, eq(critiqueRequests.userId, users.id))
          .where(eq(critiqueRequests.id, critiqueId));

        if (critique) {
          const recipientEmail = critique.preferredEmail || critique.userEmail;
          const firstName = critique.userFirstName || 'there';

          if (recipientEmail) {
            sendCritiqueCompletedEmail({
              to: recipientEmail,
              firstName,
              videoUrl
            }).catch(err => console.error('Critique completed email error:', err));
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating critique request:", error);
      res.status(500).json({ message: "Failed to update critique request" });
    }
  });

  // Admin: Delete critique request
  app.delete("/api/admin/critiques/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const critiqueId = parseInt(req.params.id);

      await db
        .delete(critiqueRequests)
        .where(eq(critiqueRequests.id, critiqueId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting critique request:", error);
      res.status(500).json({ message: "Failed to delete critique request" });
    }
  });

  // Admin: Send test emails (one-time testing endpoint)
  app.post("/api/admin/test-emails", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { emailType, toEmail } = req.body;
      const targetEmail = toEmail || user.email;

      if (!targetEmail) {
        return res.status(400).json({ message: "Email address required" });
      }

      const results: string[] = [];

      // Send test emails based on type (or all if type is 'all')
      if (emailType === 'purchase' || emailType === 'all') {
        await sendPurchaseConfirmationEmail({
          to: targetEmail,
          firstName: 'Matt',
          currency: 'gbp',
          total: 295
        });
        results.push('Purchase confirmation sent');
      }

      if (emailType === 'coaching' || emailType === 'all') {
        await sendCoachingConfirmationEmail({
          to: targetEmail,
          firstName: 'Test User',
          currency: 'gbp',
          amount: 997
        });
        results.push('Coaching confirmation sent');
      }

      if (emailType === 'testimonial' || emailType === 'all') {
        await sendTestimonialNotificationEmail({
          userEmail: 'testuser@example.com',
          userName: 'Test User',
          testimonial: 'This is a test testimonial! The challenge was amazing and helped me build my SaaS in 21 days.',
          videoUrl: 'https://example.com/test-video',
          appName: 'TestApp',
          appUrl: 'https://testapp.example.com',
          sendTo: targetEmail
        });
        results.push('Testimonial notification sent');
      }

      if (emailType === 'critique' || emailType === 'all') {
        await sendCritiqueNotificationEmail({
          userEmail: 'testuser@example.com',
          preferredEmail: 'testuser-preferred@example.com',
          userName: 'Test User',
          salesPageUrl: 'https://example.com/sales-page',
          productDescription: 'This is a test product description for the critique.',
          targetAudience: 'Small business owners looking to automate their workflow.',
          specificQuestions: 'Is the headline compelling enough?\nDoes the CTA stand out?',
          sendTo: targetEmail
        });
        results.push('Critique notification sent');
      }

      if (emailType === 'critique-completed' || emailType === 'all') {
        await sendCritiqueCompletedEmail({
          to: targetEmail,
          firstName: 'Matt',
          videoUrl: 'https://www.loom.com/share/example-critique-video'
        });
        results.push('Critique completed sent');
      }

      if (results.length === 0) {
        return res.status(400).json({
          message: "Invalid emailType. Use: purchase, coaching, testimonial, critique, critique-completed, or all"
        });
      }

      console.log(`Test emails sent to ${targetEmail}:`, results);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Error sending test emails:", error);
      res.status(500).json({ message: "Failed to send test emails", error: String(error) });
    }
  });

  // Admin: Get AI usage logs
  app.get("/api/admin/ai-usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { flagged, blocked, limit } = req.query;

      const logs = await storage.getAIUsageLogs({
        flagged: flagged === 'true' ? true : flagged === 'false' ? false : undefined,
        blocked: blocked === 'true' ? true : blocked === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : 100,
      });

      const stats = await storage.getAIUsageStats();

      // Get user info for each log
      const logsWithUsers = await Promise.all(
        logs.map(async (log) => {
          const logUser = await storage.getUser(log.userId);
          return {
            ...log,
            userName: logUser ? `${logUser.firstName || ''} ${logUser.lastName || ''}`.trim() || logUser.email : 'Unknown',
            userEmail: logUser?.email || 'Unknown',
          };
        })
      );

      res.json({
        logs: logsWithUsers,
        stats,
      });
    } catch (error) {
      console.error("Error fetching AI usage logs:", error);
      res.status(500).json({ message: "Failed to fetch AI usage logs" });
    }
  });

  // Admin: Get AI usage stats
  app.get("/api/admin/ai-usage/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAIUsageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching AI usage stats:", error);
      res.status(500).json({ message: "Failed to fetch AI usage stats" });
    }
  });

  // ========== REVENUE & PAYMENTS ==========

  // Admin: View pending purchases (guests who paid but haven't logged in yet)
  app.get("/api/admin/pending-purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pending = await db
        .select()
        .from(pendingPurchases)
        .orderBy(desc(pendingPurchases.createdAt));

      res.json({
        total: pending.length,
        unlinked: pending.filter(p => !p.linkedToUserId).length,
        purchases: pending
      });
    } catch (error) {
      console.error("Error fetching pending purchases:", error);
      res.status(500).json({ message: "Failed to fetch pending purchases" });
    }
  });

  // Admin: Manually link a pending purchase to a user
  app.post("/api/admin/pending-purchases/:id/link", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ message: "targetUserId required" });
      }

      // Get the pending purchase
      const [purchase] = await db
        .select()
        .from(pendingPurchases)
        .where(eq(pendingPurchases.id, parseInt(id)));

      if (!purchase) {
        return res.status(404).json({ message: "Pending purchase not found" });
      }

      // Get the target user
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      // Grant access based on product type
      const updateData: Record<string, any> = {};
      switch (purchase.productType) {
        case 'challenge':
          updateData.challengePurchased = true;
          break;
        case 'coaching':
        case 'coaching-single':
        case 'coaching-matt':
        case 'coaching-matt-single':
          updateData.coachingPurchased = true;
          break;
      }

      if (purchase.stripeCustomerId) {
        updateData.stripeCustomerId = purchase.stripeCustomerId;
      }
      if (purchase.currency) {
        updateData.purchaseCurrency = purchase.currency;
      }

      // Update user
      await db.update(users).set(updateData).where(eq(users.id, targetUserId));

      // Mark purchase as linked
      await db
        .update(pendingPurchases)
        .set({ linkedToUserId: targetUserId, linkedAt: new Date() })
        .where(eq(pendingPurchases.id, parseInt(id)));

      res.json({ success: true, message: `Linked purchase to user ${targetUser.email}` });
    } catch (error) {
      console.error("Error linking pending purchase:", error);
      res.status(500).json({ message: "Failed to link pending purchase" });
    }
  });

  // Admin: Grant access by email (for manual fixes when webhooks fail)
  app.post("/api/admin/grant-access", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email, productType = 'challenge' } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`);

      if (existingUser) {
        // Grant access to existing user
        const updateData: Record<string, any> = {};
        if (productType === 'challenge') {
          updateData.challengePurchased = true;
        } else if (productType.includes('coaching')) {
          updateData.coachingPurchased = true;
        }

        await db
          .update(users)
          .set(updateData)
          .where(sql`lower(${users.email}) = ${normalizedEmail}`);

        // Log the action
        await storage.logActivity({
          userId,
          targetUserId: existingUser.id,
          action: 'manual_access_granted',
          category: 'user',
          details: { productType, method: 'admin_grant' }
        });

        return res.json({
          success: true,
          message: `Access granted to existing user: ${normalizedEmail}`,
          userExists: true
        });
      } else {
        // Check if already in pending purchases
        const [existing] = await db
          .select()
          .from(pendingPurchases)
          .where(sql`lower(${pendingPurchases.email}) = ${normalizedEmail}`);

        if (existing) {
          return res.json({
            success: true,
            message: `Already has pending access: ${normalizedEmail}`,
            alreadyPending: true
          });
        }

        // Add to pending purchases
        await db.insert(pendingPurchases).values({
          email: normalizedEmail,
          stripeCustomerId: 'manual_grant',
          stripeSessionId: `manual_${Date.now()}`,
          productType,
          currency: 'usd',
          amountPaid: 0
        });

        return res.json({
          success: true,
          message: `Pending access added for: ${normalizedEmail} (will activate when they sign up)`,
          userExists: false
        });
      }
    } catch (error) {
      console.error("Error granting access:", error);
      res.status(500).json({ message: "Failed to grant access" });
    }
  });

  // Admin: Send login help email to a user who is struggling to log in
  app.post("/api/admin/send-login-help", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: "userId is required" });

      // Find the target user
      const targetUser = await storage.getUser(userId);
      if (!targetUser || !targetUser.email) {
        return res.status(404).json({ message: "User not found or has no email" });
      }

      // Generate a fresh magic link for them
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await db.insert(magicTokens).values({
        email: targetUser.email.toLowerCase().trim(),
        token,
        expiresAt,
      });
      const magicLink = `https://challenge.mattwebley.com/api/auth/magic-link/verify?token=${token}`;

      // Send the login help email
      const emailSent = await sendLoginHelpEmail(
        targetUser.email,
        targetUser.firstName || '',
        magicLink
      );

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send email" });
      }

      // Log the action
      await storage.logActivity({
        userId: req.user.claims.sub,
        targetUserId: userId,
        action: 'login_help_sent',
        category: 'user',
        details: { email: targetUser.email }
      });

      res.json({ success: true, message: `Login help email sent to ${targetUser.email}` });
    } catch (error) {
      console.error("Error sending login help:", error);
      res.status(500).json({ message: "Failed to send login help email" });
    }
  });

  // Admin: Backfill missing user names from Stripe customer data
  app.post("/api/admin/backfill-names", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const stripe = await getUncachableStripeClient();

      // Find users missing first name (null or empty) who have an email
      const usersWithoutNames = await db
        .select()
        .from(users)
        .where(and(
          sql`(${users.firstName} IS NULL OR TRIM(${users.firstName}) = '')`,
          isNotNull(users.email)
        ));

      let updated = 0;
      const skipped: string[] = [];
      const results: { email: string; name: string }[] = [];

      for (const user of usersWithoutNames) {
        try {
          // Search Stripe by email to find customer record
          const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
          if (customers.data.length === 0) {
            skipped.push(user.email || user.id);
            continue;
          }

          const customer = customers.data[0];
          if (customer.deleted) continue;

          const name = customer.name as string | null;
          if (!name || !name.trim()) {
            skipped.push(user.email || user.id);
            continue;
          }

          // Split "First Last" into parts
          const parts = name.trim().split(/\s+/);
          const firstName = parts[0];
          const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;

          await storage.updateUser(user.id, { firstName, lastName });
          updated++;
          results.push({ email: user.email || user.id, name });
        } catch (stripeErr: any) {
          // Skip this user if Stripe lookup fails (deleted customer, etc.)
          console.error(`[Backfill] Failed for ${user.email}:`, stripeErr.message);
        }
      }

      res.json({
        success: true,
        message: `Updated ${updated} of ${usersWithoutNames.length} users missing names${skipped.length > 0 ? ` (${skipped.length} not found in Stripe)` : ''}`,
        updated,
        total: usersWithoutNames.length,
        skipped,
        results,
      });
    } catch (error: any) {
      console.error("Error backfilling names:", error);
      res.status(500).json({ message: error.message || "Failed to backfill names" });
    }
  });

  // Admin: Get revenue overview
  // IMPORTANT: Only show Stripe data from 2026-01-30 onwards (challenge launch date)
  // This filters out any pre-existing Stripe data from other products
  const STRIPE_DATA_CUTOFF = new Date('2026-01-30T00:00:00Z');

  app.get("/api/admin/revenue", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Parse date range filter
      const dateRange = req.query.range as string || 'all';
      const now = new Date();
      let rangeStart = STRIPE_DATA_CUTOFF;

      switch (dateRange) {
        case '7d':
          rangeStart = new Date(Math.max(now.getTime() - 7 * 24 * 60 * 60 * 1000, STRIPE_DATA_CUTOFF.getTime()));
          break;
        case '30d':
          rangeStart = new Date(Math.max(now.getTime() - 30 * 24 * 60 * 60 * 1000, STRIPE_DATA_CUTOFF.getTime()));
          break;
        case '90d':
          rangeStart = new Date(Math.max(now.getTime() - 90 * 24 * 60 * 60 * 1000, STRIPE_DATA_CUTOFF.getTime()));
          break;
        case '365d':
          rangeStart = new Date(Math.max(now.getTime() - 365 * 24 * 60 * 60 * 1000, STRIPE_DATA_CUTOFF.getTime()));
          break;
        case 'thisYear':
          rangeStart = new Date(Math.max(new Date(now.getFullYear(), 0, 1).getTime(), STRIPE_DATA_CUTOFF.getTime()));
          break;
        case 'lastYear':
          rangeStart = new Date(Math.max(new Date(now.getFullYear() - 1, 0, 1).getTime(), STRIPE_DATA_CUTOFF.getTime()));
          break;
        default:
          rangeStart = STRIPE_DATA_CUTOFF;
      }

      const stripe = await getUncachableStripeClient();

      // Get balance (this shows current balance, not historical)
      const balance = await stripe.balance.retrieve();

      // For lastYear, cap the end date to Dec 31 of last year
      const rangeEnd = dateRange === 'lastYear'
        ? new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
        : null;
      const createdFilter: { gte: number; lte?: number } = {
        gte: Math.floor(rangeStart.getTime() / 1000),
      };
      if (rangeEnd) createdFilter.lte = Math.floor(rangeEnd.getTime() / 1000);

      // Get charges in range
      const charges = await stripe.charges.list({
        limit: 100,
        created: createdFilter,
        expand: ['data.customer'],
      });

      // Get refunds in range
      const refunds = await stripe.refunds.list({
        limit: 50,
        created: createdFilter,
      });

      // Calculate totals
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // All-time stats from successful charges (already filtered by range)
      const successfulCharges = charges.data.filter(c => c.status === 'succeeded' && !c.refunded);
      const totalRevenue = successfulCharges.reduce((sum, c) => sum + c.amount, 0);
      const totalTransactions = successfulCharges.length;

      // Last 30 days
      const last30DaysCharges = successfulCharges.filter(c => new Date(c.created * 1000) >= thirtyDaysAgo);
      const revenue30Days = last30DaysCharges.reduce((sum, c) => sum + c.amount, 0);

      // Last 7 days
      const last7DaysCharges = successfulCharges.filter(c => new Date(c.created * 1000) >= sevenDaysAgo);
      const revenue7Days = last7DaysCharges.reduce((sum, c) => sum + c.amount, 0);

      // Refund stats (already filtered by cutoff)
      const totalRefunds = refunds.data.reduce((sum, r) => sum + r.amount, 0);
      const refundCount = refunds.data.length;

      // Determine product label from charge data
      const getProductLabel = (charge: any): { description: string; productType: string } => {
        // 1. If Stripe has a description, use it
        if (charge.description) {
          const d = charge.description.toLowerCase();
          if (d.includes('coaching') && d.includes('matt')) return { description: charge.description, productType: 'coaching' };
          if (d.includes('coaching')) return { description: charge.description, productType: 'coaching' };
          if (d.includes('critique')) return { description: charge.description, productType: 'critique' };
          if (d.includes('unlock')) return { description: charge.description, productType: 'unlock' };
          return { description: charge.description, productType: 'challenge' };
        }
        // 2. If charge has metadata from payment_intent_data (future charges)
        if (charge.metadata?.productType) {
          const pt = charge.metadata.productType;
          if (pt.includes('coaching') && pt.includes('matt')) return { description: 'Coaching (Matt)', productType: 'coaching' };
          if (pt.includes('coaching')) return { description: 'Expert Coaching', productType: 'coaching' };
          if (pt.includes('critique')) return { description: 'SaaS Critique', productType: 'critique' };
          if (pt.includes('unlock')) return { description: 'Unlock All Days', productType: 'unlock' };
          return { description: 'Challenge Purchase', productType: 'challenge' };
        }
        // 3. Fallback: use amount to distinguish (coaching is always ≥ £349/$449 = 34900)
        if (charge.amount >= 34900) return { description: 'Coaching Purchase', productType: 'coaching' };
        return { description: 'Challenge Purchase', productType: 'challenge' };
      };

      // Map charge to transaction object
      const mapCharge = (charge: any) => {
        const label = getProductLabel(charge);
        return {
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          refunded: charge.refunded,
          customerEmail: (charge.customer as any)?.email || charge.billing_details?.email || 'Unknown',
          customerName: charge.billing_details?.name || 'Unknown',
          description: label.description,
          created: charge.created,
          productType: label.productType,
        };
      };
      const recentTransactions = successfulCharges.slice(0, 20).map(mapCharge);
      const chartTransactions = successfulCharges.map(mapCharge);

      // Revenue by product (uses same getProductLabel logic)
      const revenueByProduct: Record<string, { amount: number; count: number; currency: string }> = {};
      successfulCharges.forEach(charge => {
        const label = getProductLabel(charge);
        const product = label.description.replace(' Purchase', '');
        const currency = charge.currency.toUpperCase();
        const key = `${product}__${currency}`;
        if (!revenueByProduct[key]) {
          revenueByProduct[key] = { amount: 0, count: 0, currency };
        }
        revenueByProduct[key].amount += charge.amount;
        revenueByProduct[key].count += 1;
      });

      // Revenue by currency (GBP vs USD breakdown)
      const revenueByCurrency: Record<string, { amount: number; count: number }> = {};
      successfulCharges.forEach(charge => {
        const currency = charge.currency.toUpperCase();
        if (!revenueByCurrency[currency]) {
          revenueByCurrency[currency] = { amount: 0, count: 0 };
        }
        revenueByCurrency[currency].amount += charge.amount;
        revenueByCurrency[currency].count += 1;
      });

      // Also calculate 7-day and 30-day by currency
      const last7DaysByCurrency: Record<string, { amount: number; count: number }> = {};
      const last30DaysByCurrency: Record<string, { amount: number; count: number }> = {};

      last7DaysCharges.forEach(charge => {
        const currency = charge.currency.toUpperCase();
        if (!last7DaysByCurrency[currency]) {
          last7DaysByCurrency[currency] = { amount: 0, count: 0 };
        }
        last7DaysByCurrency[currency].amount += charge.amount;
        last7DaysByCurrency[currency].count += 1;
      });

      last30DaysCharges.forEach(charge => {
        const currency = charge.currency.toUpperCase();
        if (!last30DaysByCurrency[currency]) {
          last30DaysByCurrency[currency] = { amount: 0, count: 0 };
        }
        last30DaysByCurrency[currency].amount += charge.amount;
        last30DaysByCurrency[currency].count += 1;
      });

      res.json({
        balance: {
          available: balance.available.reduce((sum, b) => sum + b.amount, 0),
          pending: balance.pending.reduce((sum, b) => sum + b.amount, 0),
          currency: balance.available[0]?.currency || 'gbp',
        },
        totals: {
          allTime: totalTransactions,
          last30Days: last30DaysCharges.length,
          last7Days: last7DaysCharges.length,
          transactions: totalTransactions,
        },
        revenueByCurrency: Object.entries(revenueByCurrency).map(([currency, data]) => ({
          currency,
          amount: data.amount,
          count: data.count,
        })),
        last7DaysByCurrency: Object.entries(last7DaysByCurrency).map(([currency, data]) => ({
          currency,
          amount: data.amount,
          count: data.count,
        })),
        last30DaysByCurrency: Object.entries(last30DaysByCurrency).map(([currency, data]) => ({
          currency,
          amount: data.amount,
          count: data.count,
        })),
        refunds: {
          total: totalRefunds,
          count: refundCount,
        },
        recentTransactions,
        chartTransactions,
        revenueByProduct: Object.entries(revenueByProduct).map(([key, data]) => ({
          name: key.split('__')[0],
          amount: data.amount,
          count: data.count,
          currency: data.currency,
        })),
      });
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  // Admin: Issue refund
  app.post("/api/admin/refund", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { chargeId, amount, reason } = req.body;

      if (!chargeId) {
        return res.status(400).json({ message: "Charge ID is required" });
      }

      const stripe = await getUncachableStripeClient();

      // Verify the charge exists and was created after the cutoff date
      const charge = await stripe.charges.retrieve(chargeId);
      const chargeDate = new Date(charge.created * 1000);

      if (chargeDate < STRIPE_DATA_CUTOFF) {
        return res.status(403).json({
          message: "Cannot refund charges from before the challenge launch date"
        });
      }

      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount || undefined, // If not provided, refunds full amount
        reason: reason || 'requested_by_customer',
      });

      // Log the refund activity
      await storage.logActivity({
        userId,
        action: 'refund_issued',
        category: 'payment',
        details: {
          chargeId,
          refundId: refund.id,
          amount: refund.amount,
          reason: reason || 'requested_by_customer',
        },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
        },
      });
    } catch (error: any) {
      console.error("Error processing refund:", error);
      res.status(500).json({ message: error.message || "Failed to process refund" });
    }
  });

  // Admin: Get activity logs
  app.get("/api/admin/activity-logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { category, limit, offset } = req.query;

      const logs = await storage.getActivityLogs({
        category: category as string | undefined,
        limit: limit ? parseInt(limit as string) : 100,
        offset: offset ? parseInt(offset as string) : 0,
      });

      const stats = await storage.getActivityLogStats();

      res.json({ logs, stats });
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Admin: Get all coupons
  app.get("/api/admin/coupons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  // Admin: Create coupon
  app.post("/api/admin/coupons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { code, description, discountType, discountAmount, maxUses, minPurchaseAmount, applicableProducts, startsAt, expiresAt } = req.body;

      if (!code || !discountType || discountAmount === undefined) {
        return res.status(400).json({ message: "Code, discount type, and discount amount are required" });
      }

      // Check if code already exists
      const existing = await storage.getCouponByCode(code);
      if (existing) {
        return res.status(400).json({ message: "A coupon with this code already exists" });
      }

      const coupon = await storage.createCoupon({
        code: code.toUpperCase(),
        description,
        discountType,
        discountAmount,
        maxUses: maxUses || null,
        minPurchaseAmount: minPurchaseAmount || null,
        applicableProducts: applicableProducts || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: userId,
      });

      // Log activity
      await storage.logActivity({
        userId,
        action: 'coupon_created',
        category: 'payment',
        details: { couponCode: code, discountType, discountAmount },
        ipAddress: req.ip,
      });

      res.json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  // Admin: Update coupon
  app.patch("/api/admin/coupons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const updates = req.body;

      const coupon = await storage.getCoupon(parseInt(id));
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      // If updating code, ensure it doesn't conflict
      if (updates.code && updates.code.toUpperCase() !== coupon.code) {
        const existing = await storage.getCouponByCode(updates.code);
        if (existing) {
          return res.status(400).json({ message: "A coupon with this code already exists" });
        }
        updates.code = updates.code.toUpperCase();
      }

      // Convert date strings to Date objects
      if (updates.startsAt) updates.startsAt = new Date(updates.startsAt);
      if (updates.expiresAt) updates.expiresAt = new Date(updates.expiresAt);

      const updated = await storage.updateCoupon(parseInt(id), updates);

      // Log activity
      await storage.logActivity({
        userId,
        action: 'coupon_updated',
        category: 'payment',
        details: { couponId: id, couponCode: coupon.code, updates },
        ipAddress: req.ip,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  // Admin: Delete coupon
  app.delete("/api/admin/coupons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;

      const coupon = await storage.getCoupon(parseInt(id));
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      await storage.deleteCoupon(parseInt(id));

      // Log activity
      await storage.logActivity({
        userId,
        action: 'coupon_deleted',
        category: 'payment',
        details: { couponId: id, couponCode: coupon.code },
        ipAddress: req.ip,
      });

      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Admin: Get coupon usages
  app.get("/api/admin/coupons/:id/usages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const usages = await storage.getCouponUsages(parseInt(id));
      res.json(usages);
    } catch (error) {
      console.error("Error fetching coupon usages:", error);
      res.status(500).json({ message: "Failed to fetch coupon usages" });
    }
  });

  // Public: Validate coupon code (for checkout)
  app.post("/api/validate-coupon", async (req, res) => {
    try {
      const { code, purchaseAmount } = req.body;

      if (!code) {
        return res.status(400).json({ valid: false, error: "Coupon code is required" });
      }

      const result = await storage.validateCoupon(code, purchaseAmount);
      res.json(result);
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ valid: false, error: "Failed to validate coupon" });
    }
  });

  // Admin: Send test broadcast email
  app.post("/api/admin/broadcast/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { subject, body, email } = req.body;

      if (!subject || !body || !email) {
        return res.status(400).json({ message: "Subject, body, and email are required" });
      }

      const { sendBroadcastEmail } = await import('./emailService');
      const success = await sendBroadcastEmail({
        to: email,
        firstName: 'Test',
        subject,
        body,
      });

      if (success) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test broadcast:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Admin: Send broadcast email to segment
  app.post("/api/admin/broadcast/send", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { subject, body, segment } = req.body;

      if (!subject || !body || !segment) {
        return res.status(400).json({ message: "Subject, body, and segment are required" });
      }

      // Get all users
      const allUsers = await storage.getAllUsers();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Filter by segment
      let targetUsers = allUsers;
      switch (segment) {
        case 'paid':
          targetUsers = allUsers.filter(u => u.challengePurchased);
          break;
        case 'unpaid':
          targetUsers = allUsers.filter(u => !u.challengePurchased);
          break;
        case 'active':
          const activeStats = await storage.getAllUserStats();
          const activeUserIds = new Set(
            activeStats
              .filter(s => s.lastActivityDate && new Date(s.lastActivityDate) > sevenDaysAgo)
              .map(s => s.userId)
          );
          targetUsers = allUsers.filter(u => activeUserIds.has(u.id));
          break;
        case 'inactive':
          const inactiveStats = await storage.getAllUserStats();
          const inactiveUserIds = new Set(
            inactiveStats
              .filter(s => !s.lastActivityDate || new Date(s.lastActivityDate) <= sevenDaysAgo)
              .map(s => s.userId)
          );
          targetUsers = allUsers.filter(u => inactiveUserIds.has(u.id));
          break;
        case 'stuck':
          const stuckStats = await storage.getAllUserStats();
          const stuckUserIds = new Set(
            stuckStats
              .filter(s => s.lastCompletedDay !== null && s.lastCompletedDay > 0 && s.lastCompletedDay < 21 &&
                (!s.lastActivityDate || new Date(s.lastActivityDate) <= sevenDaysAgo))
              .map(s => s.userId)
          );
          targetUsers = allUsers.filter(u => stuckUserIds.has(u.id));
          break;
      }

      // Only send to users with email addresses
      targetUsers = targetUsers.filter(u => u.email);

      const { sendBroadcastEmail } = await import('./emailService');
      let sent = 0;

      // Send emails (with small delay to avoid rate limits)
      for (const targetUser of targetUsers) {
        if (targetUser.email) {
          const success = await sendBroadcastEmail({
            to: targetUser.email,
            firstName: targetUser.firstName || 'there',
            subject,
            body,
          });
          if (success) sent++;

          // Small delay between emails
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Log activity
      await storage.logActivity({
        userId,
        action: 'broadcast_sent',
        category: 'content',
        details: { segment, recipientCount: sent, subject },
        ipAddress: req.ip,
      });

      res.json({ sent, total: targetUsers.length });
    } catch (error) {
      console.error("Error sending broadcast:", error);
      res.status(500).json({ message: "Failed to send broadcast" });
    }
  });

  // Admin: Get all announcements
  app.get("/api/admin/announcements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Admin: Create announcement
  app.post("/api/admin/announcements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { title, message, type, targetSegment, dismissible, linkUrl, linkText, startsAt, expiresAt, priority } = req.body;

      if (!title || !message) {
        return res.status(400).json({ message: "Title and message are required" });
      }

      const announcement = await storage.createAnnouncement({
        title,
        message,
        type: type || 'info',
        targetSegment: targetSegment || 'all',
        dismissible: dismissible !== false,
        linkUrl: linkUrl || null,
        linkText: linkText || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        priority: priority || 0,
        createdBy: userId,
      });

      // Log activity
      await storage.logActivity({
        userId,
        action: 'announcement_created',
        category: 'content',
        details: { announcementId: announcement.id, title },
        ipAddress: req.ip,
      });

      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Admin: Update announcement
  app.patch("/api/admin/announcements/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const updates = req.body;

      // Convert date strings to Date objects
      if (updates.startsAt) updates.startsAt = new Date(updates.startsAt);
      if (updates.expiresAt) updates.expiresAt = new Date(updates.expiresAt);

      const updated = await storage.updateAnnouncement(parseInt(id), updates);
      if (!updated) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  // Admin: Delete announcement
  app.delete("/api/admin/announcements/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      await storage.deleteAnnouncement(parseInt(id));
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // User: Get announcements for current user
  app.get("/api/announcements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const stats = await storage.getUserStats(userId);

      // Determine user segment
      let segment = 'all';
      if (user?.challengePurchased) {
        segment = 'paid';
      } else {
        segment = 'unpaid';
      }

      const announcements = await storage.getAnnouncementsForUser(userId, segment);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching user announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // User: Dismiss announcement
  app.post("/api/announcements/:id/dismiss", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      await storage.dismissAnnouncement(parseInt(id), userId);
      res.json({ message: "Announcement dismissed" });
    } catch (error) {
      console.error("Error dismissing announcement:", error);
      res.status(500).json({ message: "Failed to dismiss announcement" });
    }
  });

  // ===== MOOD CHECK-INS =====

  // Save a mood check-in
  app.post("/api/mood-checkin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.challengePurchased && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { day, emoji, emojiLabel, text, consentToShare } = req.body;
      if (day == null || !emoji || !emojiLabel) {
        return res.status(400).json({ message: "day, emoji, and emojiLabel are required" });
      }

      // Check if already submitted for this day
      const [existing] = await db.select().from(moodCheckins)
        .where(and(eq(moodCheckins.userId, userId), eq(moodCheckins.day, day)));
      if (existing) {
        return res.status(409).json({ message: "Already submitted for this day" });
      }

      await db.insert(moodCheckins).values({
        userId,
        day,
        emoji,
        emojiLabel,
        text: text ? String(text).substring(0, 500) : null,
        consentToShare: !!consentToShare,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error saving mood check-in:", error);
      res.status(500).json({ message: "Failed to save" });
    }
  });

  // Check if user already submitted a mood check-in for a day
  app.get("/api/mood-checkin/:day", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const day = parseInt(req.params.day);
      const [existing] = await db.select().from(moodCheckins)
        .where(and(eq(moodCheckins.userId, userId), eq(moodCheckins.day, day)));
      res.json({ submitted: !!existing });
    } catch (error) {
      res.status(500).json({ message: "Failed to check" });
    }
  });

  // Admin: Get all mood check-ins
  app.get("/api/admin/mood-checkins", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const checkins = await db.select({
        id: moodCheckins.id,
        userId: moodCheckins.userId,
        day: moodCheckins.day,
        emoji: moodCheckins.emoji,
        emojiLabel: moodCheckins.emojiLabel,
        text: moodCheckins.text,
        consentToShare: moodCheckins.consentToShare,
        promotedToTestimonial: moodCheckins.promotedToTestimonial,
        createdAt: moodCheckins.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(moodCheckins)
      .leftJoin(users, eq(moodCheckins.userId, users.id))
      .orderBy(desc(moodCheckins.createdAt));

      res.json(checkins);
    } catch (error) {
      console.error("Error fetching mood check-ins:", error);
      res.status(500).json({ message: "Failed to fetch" });
    }
  });

  // Admin: Promote a mood check-in to testimonial
  app.post("/api/admin/mood-checkins/:id/promote", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const checkinId = parseInt(req.params.id);
      const [checkin] = await db.select().from(moodCheckins).where(eq(moodCheckins.id, checkinId));
      if (!checkin) return res.status(404).json({ message: "Not found" });
      if (!checkin.text) return res.status(400).json({ message: "No text to promote" });

      // Create testimonial from mood check-in
      await db.insert(testimonials).values({
        userId: checkin.userId,
        testimonial: checkin.text,
        featured: false,
      });

      // Mark as promoted
      await db.update(moodCheckins)
        .set({ promotedToTestimonial: true })
        .where(eq(moodCheckins.id, checkinId));

      res.json({ success: true, message: "Promoted to testimonial" });
    } catch (error) {
      console.error("Error promoting mood check-in:", error);
      res.status(500).json({ message: "Failed to promote" });
    }
  });

  // Admin: Get mood check-in summary (aggregated by day)
  app.get("/api/admin/mood-summary", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const summary = await db.select({
        day: moodCheckins.day,
        emojiLabel: moodCheckins.emojiLabel,
        emoji: moodCheckins.emoji,
        count: sql<number>`count(*)::int`,
      })
      .from(moodCheckins)
      .groupBy(moodCheckins.day, moodCheckins.emojiLabel, moodCheckins.emoji)
      .orderBy(moodCheckins.day);

      res.json(summary);
    } catch (error) {
      console.error("Error fetching mood summary:", error);
      res.status(500).json({ message: "Failed to fetch" });
    }
  });

  // Admin user lookup by email (for invoice pre-fill)
  app.get("/api/admin/user-lookup", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const email = (req.query.email as string || "").trim().toLowerCase();
      const name = (req.query.name as string || "").trim().toLowerCase();

      if (!email && !name) return res.status(400).json({ message: "Email or name required" });

      let foundUser: { firstName: string; lastName: string; email: string } | null = null;

      // Try email first (exact match)
      if (email) {
        const user = await storage.getUserByEmail(email);
        if (user) {
          foundUser = { firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "" };
        }
      }

      // Fall back to name search — only return if exactly 1 match
      if (!foundUser && name) {
        const allUsers = await storage.getAllUsers();
        const matches = allUsers.filter(u => {
          const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim().toLowerCase();
          return fullName === name ||
            (u.firstName && u.lastName && name.includes(u.firstName.toLowerCase()) && name.includes(u.lastName.toLowerCase()));
        });
        if (matches.length === 1) {
          const user = matches[0];
          foundUser = { firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "" };
        }
      }

      if (!foundUser) return res.json({ found: false });

      // Look up their Stripe purchase to get amount, currency, date, product
      let purchase: { amount: number; currency: string; date: number; product: string } | null = null;
      if (foundUser.email) {
        try {
          const stripe = await getUncachableStripeClient();
          const customers = await stripe.customers.list({ email: foundUser.email, limit: 1 });
          if (customers.data.length > 0) {
            const charges = await stripe.charges.list({ customer: customers.data[0].id, limit: 10 });
            const successfulCharge = charges.data.find(c => c.status === 'succeeded' && !c.refunded);
            if (successfulCharge) {
              purchase = {
                amount: successfulCharge.amount,
                currency: successfulCharge.currency,
                date: successfulCharge.created,
                product: successfulCharge.description || "21-Day AI SaaS Challenge",
              };
            }
          }
        } catch (stripeErr) {
          console.error("Stripe lookup for invoice failed:", stripeErr);
        }
      }

      res.json({
        found: true,
        ...foundUser,
        purchase,
      });
    } catch (error) {
      console.error("Error looking up user:", error);
      res.status(500).json({ message: "Failed to look up user" });
    }
  });

  // ===== PAGE VIEW TRACKING =====

  // In-memory rate limiter for page views: sessionId:path -> last tracked timestamp
  const pageViewRateLimit = new Map<string, number>();

  // Clean up old entries every 10 minutes
  setInterval(() => {
    const cutoff = Date.now() - 5 * 60 * 1000;
    pageViewRateLimit.forEach((timestamp, key) => {
      if (timestamp < cutoff) pageViewRateLimit.delete(key);
    });
  }, 10 * 60 * 1000);

  app.post("/api/track/page-view", async (req: any, res) => {
    try {
      const { path, referrer } = req.body;
      if (!path || typeof path !== "string") {
        return res.status(400).json({ message: "path is required" });
      }

      // Get or set visitor session cookie
      let sessionId = req.cookies?.visitor_session;
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        res.cookie("visitor_session", sessionId, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }

      // Rate limit: 1 per path per session per 5 minutes
      const rateKey = `${sessionId}:${path}`;
      const lastTracked = pageViewRateLimit.get(rateKey);
      if (lastTracked && Date.now() - lastTracked < 5 * 60 * 1000) {
        return res.json({ ok: true });
      }
      pageViewRateLimit.set(rateKey, Date.now());

      // Get userId if authenticated — skip tracking for admins
      const userId = req.user?.claims?.sub || null;
      if (userId) {
        const viewUser = await storage.getUser(userId);
        if (viewUser?.isAdmin) return res.json({ ok: true });
      }

      await db.insert(pageViews).values({
        sessionId,
        userId,
        path: path.substring(0, 500), // Limit path length
        referrer: referrer ? String(referrer).substring(0, 1000) : null,
      });

      res.json({ ok: true });
    } catch (error) {
      console.error("Error tracking page view:", error);
      res.status(500).json({ message: "Failed to track" });
    }
  });

  // Admin: Analytics / Traffic data
  app.get("/api/admin/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const range = req.query.range as string || '30';
      const now2 = new Date();
      let analyticsStart: Date;
      switch (range) {
        case '1': analyticsStart = new Date(now2.getTime() - 1 * 86400000); break;
        case '3': analyticsStart = new Date(now2.getTime() - 3 * 86400000); break;
        case '7': analyticsStart = new Date(now2.getTime() - 7 * 86400000); break;
        case '90': analyticsStart = new Date(now2.getTime() - 90 * 86400000); break;
        case '365': analyticsStart = new Date(now2.getTime() - 365 * 86400000); break;
        case 'thisYear': analyticsStart = new Date(now2.getFullYear(), 0, 1); break;
        case 'lastYear': analyticsStart = new Date(now2.getFullYear() - 1, 0, 1); break;
        default: analyticsStart = new Date(now2.getTime() - 30 * 86400000); break;
      }
      const analyticsEnd = range === 'lastYear' ? new Date(now2.getFullYear() - 1, 11, 31, 23, 59, 59) : now2;

      const dateFilter = range === 'lastYear'
        ? and(gte(pageViews.createdAt, analyticsStart), lte(pageViews.createdAt, analyticsEnd))
        : gte(pageViews.createdAt, analyticsStart);

      // Daily unique visitors
      const dailyVisitors = await db
        .select({
          date: sql<string>`DATE(${pageViews.createdAt})`.as("date"),
          uniqueVisitors: countDistinct(pageViews.sessionId).as("unique_visitors"),
          totalViews: count().as("total_views"),
        })
        .from(pageViews)
        .where(dateFilter)
        .groupBy(sql`DATE(${pageViews.createdAt})`)
        .orderBy(sql`DATE(${pageViews.createdAt})`);

      // Top pages
      const topPages = await db
        .select({
          path: pageViews.path,
          uniqueVisitors: countDistinct(pageViews.sessionId).as("unique_visitors"),
          totalViews: count().as("total_views"),
        })
        .from(pageViews)
        .where(dateFilter)
        .groupBy(pageViews.path)
        .orderBy(sql`count(*) DESC`)
        .limit(10);

      // Conversion funnel counts
      // Landing page visitors (path = "/")
      const [landingResult] = await db
        .select({ cnt: countDistinct(pageViews.sessionId) })
        .from(pageViews)
        .where(and(dateFilter, eq(pageViews.path, "/")));

      // Order page visitors (path = "/order")
      const [orderResult] = await db
        .select({ cnt: countDistinct(pageViews.sessionId) })
        .from(pageViews)
        .where(and(dateFilter, eq(pageViews.path, "/order")));

      // Total unique visitors across all pages
      const [totalResult] = await db
        .select({ cnt: countDistinct(pageViews.sessionId) })
        .from(pageViews)
        .where(dateFilter);

      // Purchases in period (from users table)
      const userDateFilter = range === 'lastYear'
        ? and(eq(users.challengePurchased, true), gte(users.createdAt, analyticsStart), lte(users.createdAt, analyticsEnd))
        : and(eq(users.challengePurchased, true), gte(users.createdAt, analyticsStart));
      const recentPurchases = await db
        .select({ cnt: count() })
        .from(users)
        .where(userDateFilter);

      // Traffic sources for purchases in this period
      const trafficSources = await db
        .select({
          referrerUrl: users.referrerUrl,
          landingUrl: users.landingUrl,
          utmSource: users.utmSource,
          utmMedium: users.utmMedium,
          utmCampaign: users.utmCampaign,
          utmContent: users.utmContent,
          firstName: users.firstName,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(userDateFilter);

      res.json({
        dailyVisitors,
        topPages,
        funnel: {
          totalVisitors: totalResult?.cnt || 0,
          landingVisitors: landingResult?.cnt || 0,
          orderVisitors: orderResult?.cnt || 0,
          purchases: recentPurchases[0]?.cnt || 0,
        },
        trafficSources,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // One-time backfill: add all paying customers to Systeme.io with progress tags
  app.post("/api/admin/backfill-systeme", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (!adminUser?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const allUsers = await storage.getAllUsers();
      const paidUsers = allUsers.filter(u => u.challengePurchased && u.email);
      const allProgress = await storage.getAllUserProgress();
      const allStats = await storage.getAllUserStats();

      const progressMap = new Map<string, Set<number>>();
      for (const p of allProgress) {
        if (p.completed) {
          if (!progressMap.has(p.userId)) progressMap.set(p.userId, new Set());
          progressMap.get(p.userId)!.add(p.day);
        }
      }
      const statsMap = new Map(allStats.map(s => [s.userId, s]));

      let processed = 0;
      const results: string[] = [];
      const dayMs = 1000 * 60 * 60 * 24;
      const now = new Date();

      for (const user of paidUsers) {
        const completedDays = progressMap.get(user.id) || new Set<number>();
        const stats = statsMap.get(user.id);
        const tags: string[] = ['21-Day Challenge Buyer'];

        if (completedDays.has(0)) tags.push('Challenge Started');
        if (completedDays.has(9)) tags.push('Challenge Building');
        if (completedDays.has(21)) tags.push('Challenge Finished');
        if (user.coachingPurchased) tags.push('Coaching Customer');

        // Check if stalled (started but inactive 7+ days and not finished)
        if (completedDays.size > 0 && !completedDays.has(21) && stats?.lastActivityDate) {
          const daysInactive = Math.floor((now.getTime() - new Date(stats.lastActivityDate).getTime()) / dayMs);
          if (daysInactive >= 7) tags.push('Challenge Stalled');
        }

        try {
          const result = await addContactToSystemeDetailed({
            email: user.email!,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            tags,
          });
          results.push(`${user.email}: ${result.success ? tags.join(', ') : 'FAILED  - ' + result.error}`);
        } catch (err: any) {
          results.push(`${user.email}: ERROR  - ${err.message || String(err)}`);
        }
        processed++;

        // Rate limit: 500ms between users to avoid Systeme API limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      res.json({ processed, results });
    } catch (error: any) {
      console.error("Error backfilling Systeme:", error);
      res.status(500).json({ message: error.message || "Backfill failed" });
    }
  });

  // =============================================
  // COACH CONTRACT TEXT
  // =============================================

  function getCoachContractText(email: string, rate: number, currency: string): string {
    const currencySymbol = currency === 'gbp' ? '£' : '$';
    const rateFormatted = `${currencySymbol}${(rate / 100).toFixed(2)}`;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return `INDEPENDENT CONTRACTOR AGREEMENT
Version 1.0 — ${today}

BETWEEN:
(1) Webley Global - FZCO, Dubai Silicon Oasis, Dubai, United Arab Emirates ("the Company")
(2) The individual accepting this agreement via electronic signature ("the Contractor")

Contractor Email: ${email}
Agreed Rate: ${rateFormatted} per session (${currency.toUpperCase()})

---

1. RELATIONSHIP AND STATUS

1.1. The Contractor is engaged as an independent contractor and is NOT an employee, worker, or agent of the Company.

1.2. The Contractor is responsible for their own tax obligations, national insurance contributions (or equivalent), and any other statutory payments in their jurisdiction.

1.3. Nothing in this agreement creates a partnership, joint venture, or employment relationship.

1.4. The Contractor shall not hold themselves out as an employee or agent of the Company.

2. SERVICES

2.1. The Contractor will provide 1:1 coaching sessions to students of the 21-Day AI SaaS Challenge ("the Challenge") via video call.

2.2. Sessions will be booked through the platform's booking system or as otherwise arranged.

2.3. Each session is expected to last approximately 30-60 minutes unless otherwise agreed.

3. PAYMENT

3.1. The Contractor will be paid ${rateFormatted} per completed coaching session.

3.2. Payment will be made solely through the Company's platform payout system.

3.3. The Contractor must submit a payout request via their coach dashboard. Payouts will be processed within 14 business days of an approved request.

3.4. The Company reserves the right to withhold payment in cases of client complaint, breach of this agreement, or suspected fraud, pending investigation.

3.5. The Contractor is responsible for issuing their own invoices where required by their local tax jurisdiction.

4. PROFESSIONAL CONDUCT

4.1. The Contractor shall respond to client messages and booking requests within 48 hours during business days.

4.2. The Contractor shall not make guarantees about specific financial outcomes, revenue targets, or business results.

4.3. The Contractor shall operate within their area of competence and refer clients to appropriate professionals (legal, financial, medical) where necessary.

4.4. The Contractor shall treat all clients with professionalism and respect.

4.5. The Contractor shall not engage in any conduct that could bring the Company or the Challenge into disrepute.

5. CONFIDENTIALITY

5.1. The Contractor shall keep confidential all information relating to:
  (a) Client personal data, business ideas, and session content
  (b) The Company's business operations, pricing, revenue, and strategy
  (c) The Company's proprietary methods, content, and technology
  (d) Any information marked or reasonably understood to be confidential

5.2. This obligation survives termination of this agreement indefinitely.

5.3. The Contractor may disclose confidential information only where required by law, and shall notify the Company promptly if such disclosure is required.

6. DATA PROTECTION AND GDPR

6.1. The Contractor shall process client personal data solely for the purpose of delivering coaching sessions.

6.2. The Contractor shall not store client personal data outside of the Company's platform unless strictly necessary for session delivery.

6.3. Any client data stored locally (notes, recordings with consent) must be deleted within 30 days of the coaching engagement ending.

6.4. The Contractor shall report any data breach or suspected data breach to the Company within 24 hours of becoming aware.

6.5. The Contractor shall comply with all applicable data protection laws including (where applicable) the UK GDPR, EU GDPR, and UAE data protection regulations.

7. NON-SOLICITATION

7.1. During this agreement and for 12 months after termination, the Contractor shall not:
  (a) Directly or indirectly solicit, approach, or accept business from any client introduced through the Challenge platform
  (b) Encourage any client to leave the Challenge or use alternative coaching services
  (c) Recruit, solicit, or attempt to hire any other contractor or employee of the Company

7.2. This restriction applies regardless of who initiates contact.

8. INTELLECTUAL PROPERTY

8.1. All Challenge content, curriculum, branding, and materials remain the exclusive intellectual property of the Company.

8.2. The Contractor shall not reproduce, distribute, or create derivative works from any Challenge materials.

8.3. Any materials created by the Contractor specifically for Challenge clients (session notes, templates, frameworks) shall be jointly owned, with the Company retaining the right to use them.

8.4. The Contractor retains ownership of their pre-existing intellectual property and general coaching methodologies.

9. INDEMNIFICATION

9.1. The Contractor shall indemnify, defend, and hold harmless the Company, its directors, officers, and employees from and against ALL claims, damages, losses, costs, and expenses (including reasonable legal fees) arising from:
  (a) The Contractor's breach of this agreement
  (b) The Contractor's negligence or wilful misconduct
  (c) Any claim by a client relating to the Contractor's coaching services
  (d) The Contractor's violation of any applicable law or regulation
  (e) Any tax liability arising from the Contractor's engagement

9.2. This indemnification obligation survives termination of this agreement.

10. LIMITATION OF LIABILITY

10.1. The Company's total aggregate liability to the Contractor under or in connection with this agreement shall not exceed the total fees paid to the Contractor in the 3 months preceding the claim.

10.2. The Company shall not be liable for any indirect, consequential, special, or incidental damages, including lost profits or loss of business opportunity.

10.3. Nothing in this agreement excludes liability for fraud, death, or personal injury caused by negligence.

11. INSURANCE

11.1. The Contractor is strongly recommended to maintain professional indemnity insurance appropriate to their coaching activities.

11.2. The Company does not provide insurance coverage for the Contractor's activities.

12. TERMINATION

12.1. Either party may terminate this agreement by giving 14 days' written notice to the other party.

12.2. The Company may terminate this agreement immediately and without notice in the event of:
  (a) Material breach of this agreement by the Contractor
  (b) Gross misconduct or behaviour that brings the Company into disrepute
  (c) Breach of confidentiality obligations
  (d) Breach of data protection obligations
  (e) Client complaint substantiated by investigation

12.3. Upon termination:
  (a) The Contractor shall complete any sessions already booked (unless terminated for cause)
  (b) Outstanding approved payments will be processed
  (c) The Contractor shall return or destroy any confidential information
  (d) Platform access will be revoked

13. DISPUTE RESOLUTION

13.1. Any dispute arising from this agreement shall first be attempted to be resolved by good-faith negotiation between the parties.

13.2. If negotiation fails within 30 days, the dispute shall be referred to mediation.

13.3. If mediation fails, the dispute shall be submitted to the exclusive jurisdiction of the courts of Dubai, United Arab Emirates.

14. FORCE MAJEURE

14.1. Neither party shall be liable for failure to perform obligations due to circumstances beyond their reasonable control, including but not limited to natural disasters, war, pandemic, government action, or widespread technology failure.

14.2. The affected party shall notify the other party as soon as reasonably practicable.

15. GENERAL

15.1. This agreement constitutes the entire agreement between the parties.

15.2. This agreement is governed by and construed in accordance with the laws of the United Arab Emirates, specifically the Emirate of Dubai.

15.3. If any provision is found to be unenforceable, the remaining provisions shall continue in full force.

15.4. Amendments to this agreement must be made in writing and agreed by both parties.

15.5. The Contractor may not assign or transfer this agreement without the Company's prior written consent.

---

BY SIGNING BELOW, THE CONTRACTOR CONFIRMS THEY HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY ALL TERMS OF THIS AGREEMENT.`;
  }

  // =============================================
  // COACH ADMIN ENDPOINTS (Matt's admin panel)
  // =============================================

  // Helper: check if user is admin
  const requireAdmin = async (req: any, res: any): Promise<boolean> => {
    const userId = req.user?.claims?.sub;
    if (!userId) { res.status(401).json({ message: "Unauthorized" }); return false; }
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) { res.status(403).json({ message: "Admin access required" }); return false; }
    return true;
  };

  // Helper: check if user is a coach (admins can impersonate via ?coachId=X)
  const requireCoach = async (req: any, res: any): Promise<{ userId: string; coachId: number } | null> => {
    const userId = req.user?.claims?.sub;
    if (!userId) { res.status(401).json({ message: "Unauthorized" }); return null; }
    const user = await storage.getUser(userId);

    // Admin impersonation: allow admins to view any coach's data
    if (user?.isAdmin && req.query.coachId) {
      const impersonateId = parseInt(req.query.coachId);
      const [coach] = await db.select().from(coaches).where(eq(coaches.id, impersonateId));
      if (!coach) { res.status(404).json({ message: "Coach not found" }); return null; }
      return { userId, coachId: coach.id };
    }

    if (!user?.isCoach) { res.status(403).json({ message: "Coach access required" }); return null; }
    const [coach] = await db.select().from(coaches).where(eq(coaches.userId, userId));
    if (!coach) { res.status(403).json({ message: "Coach profile not found" }); return null; }
    return { userId, coachId: coach.id };
  };

  // GET /api/my-coaching - Client's own coaching info (coach, sessions, booking link)
  app.get('/api/my-coaching', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Find this user's coaching purchases
      const purchases = await db.select().from(coachingPurchases)
        .where(eq(coachingPurchases.userId, userId))
        .orderBy(desc(coachingPurchases.purchasedAt));

      if (purchases.length === 0) {
        // Also check by email
        const user = await storage.getUser(userId);
        if (user?.email) {
          const byEmail = await db.select().from(coachingPurchases)
            .where(sql`lower(${coachingPurchases.email}) = ${user.email.toLowerCase()}`)
            .orderBy(desc(coachingPurchases.purchasedAt));
          if (byEmail.length === 0) {
            return res.json({ purchases: [] });
          }
          purchases.push(...byEmail);
        } else {
          return res.json({ purchases: [] });
        }
      }

      // Get coach info and sessions for each purchase
      const allCoaches = await db.select().from(coaches);
      const coachMap = new Map(allCoaches.map(c => [c.id, c]));

      const result = await Promise.all(purchases.map(async (purchase) => {
        const coach = purchase.assignedCoachId ? coachMap.get(purchase.assignedCoachId) : null;
        const sessions = await db.select().from(coachingSessions)
          .where(eq(coachingSessions.coachingPurchaseId, purchase.id))
          .orderBy(coachingSessions.sessionNumber);

        return {
          id: purchase.id,
          coachType: purchase.coachType,
          packageType: purchase.packageType,
          sessionsTotal: purchase.sessionsTotal,
          purchasedAt: purchase.purchasedAt,
          coach: coach ? {
            displayName: coach.displayName,
            calComLink: coach.calComLink,
          } : null,
          sessions: sessions.map(s => ({
            id: s.id,
            sessionNumber: s.sessionNumber,
            status: s.status,
            scheduledAt: s.scheduledAt,
            completedAt: s.completedAt,
          })),
        };
      }));

      res.json({ purchases: result });
    } catch (error: any) {
      console.error("Error fetching my coaching:", error);
      res.status(500).json({ message: error.message || "Failed to fetch coaching info" });
    }
  });

  // GET /api/admin/coaches - List all coaches with stats
  app.get('/api/admin/coaches', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const allCoaches = await db.select().from(coaches).orderBy(desc(coaches.createdAt));

      // Get stats for each coach
      const coachesWithStats = await Promise.all(allCoaches.map(async (coach) => {
        const sessions = await db.select().from(coachingSessions).where(eq(coachingSessions.coachId, coach.id));
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const payouts = await db.select().from(coachPayouts).where(eq(coachPayouts.coachId, coach.id));
        const paidOut = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
        const pendingPayouts = payouts.filter(p => p.status === 'requested').reduce((sum, p) => sum + p.amount, 0);
        const totalEarned = completedSessions.length * coach.ratePerSession;
        const availableBalance = totalEarned - paidOut - pendingPayouts;

        // Unique clients
        const clientIds = Array.from(new Set(sessions.map(s => s.clientUserId || s.clientEmail)));

        return {
          ...coach,
          stats: {
            totalClients: clientIds.length,
            completedSessions: completedSessions.length,
            pendingSessions: sessions.filter(s => s.status === 'pending').length,
            totalEarned,
            availableBalance,
            paidOut,
            pendingPayouts,
          },
        };
      }));

      res.json(coachesWithStats);
    } catch (error: any) {
      console.error("Error fetching coaches:", error);
      res.status(500).json({ message: error.message || "Failed to fetch coaches" });
    }
  });

  // POST /api/admin/coaches - Send coach invitation (email + rate only)
  app.post('/api/admin/coaches', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const { email, ratePerSession, rateCurrency } = req.body;

      if (!email || !ratePerSession) {
        return res.status(400).json({ message: "Email and rate per session are required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if already an active coach
      const [existingCoach] = await db.select().from(coaches)
        .where(sql`lower(${coaches.email}) = ${normalizedEmail}`);
      if (existingCoach) {
        return res.status(409).json({ message: "This email is already registered as a coach" });
      }

      // Check for existing pending invitation
      const [existingInvite] = await db.select().from(coachInvitations)
        .where(and(
          sql`lower(${coachInvitations.email}) = ${normalizedEmail}`,
          eq(coachInvitations.status, 'pending')
        ));
      if (existingInvite) {
        return res.status(409).json({ message: "An invitation is already pending for this email" });
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const adminUserId = req.user?.claims?.sub;

      await db.insert(coachInvitations).values({
        token,
        email: normalizedEmail,
        ratePerSession: parseInt(ratePerSession),
        rateCurrency: rateCurrency || 'gbp',
        status: 'pending',
        expiresAt,
        invitedBy: adminUserId,
      });

      // Send invitation email
      const setupLink = `https://challenge.mattwebley.com/coach-setup/${token}`;
      await sendCoachInvitationEmail(normalizedEmail, setupLink);

      res.json({ message: "Invitation sent", email: normalizedEmail });
    } catch (error: any) {
      console.error("Error sending coach invitation:", error);
      res.status(500).json({ message: error.message || "Failed to send invitation" });
    }
  });

  // GET /api/admin/coach-invitations - List pending invitations
  app.get('/api/admin/coach-invitations', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const invitations = await db.select().from(coachInvitations)
        .orderBy(desc(coachInvitations.createdAt));

      res.json(invitations);
    } catch (error: any) {
      console.error("Error fetching coach invitations:", error);
      res.status(500).json({ message: error.message || "Failed to fetch invitations" });
    }
  });

  // DELETE /api/admin/coach-invitations/:id - Cancel a pending invitation
  app.delete('/api/admin/coach-invitations/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const invId = parseInt(req.params.id);
      const [invitation] = await db.select().from(coachInvitations).where(eq(coachInvitations.id, invId));

      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      if (invitation.status !== 'pending') {
        return res.status(400).json({ message: "Only pending invitations can be cancelled" });
      }

      await db.update(coachInvitations)
        .set({ status: 'expired' })
        .where(eq(coachInvitations.id, invId));

      res.json({ message: "Invitation cancelled" });
    } catch (error: any) {
      console.error("Error cancelling invitation:", error);
      res.status(500).json({ message: error.message || "Failed to cancel invitation" });
    }
  });

  // GET /api/admin/coach-contract-preview - Preview the contract text
  app.get('/api/admin/coach-contract-preview', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const email = (req.query.email as string) || 'coach@example.com';
      const rate = parseInt(req.query.rate as string) || 5000;
      const currency = (req.query.currency as string) || 'gbp';

      const contractText = getCoachContractText(email, rate, currency);
      res.json({ contractText });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate preview" });
    }
  });

  // GET /api/admin/coach-agreements/:coachId - Get signed agreement for a coach
  app.get('/api/admin/coach-agreements/:coachId', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const coachId = parseInt(req.params.coachId);
      const [agreement] = await db.select().from(coachAgreements)
        .where(eq(coachAgreements.coachId, coachId))
        .orderBy(desc(coachAgreements.signedAt))
        .limit(1);

      if (!agreement) {
        return res.status(404).json({ message: "No signed agreement found for this coach" });
      }

      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch agreement" });
    }
  });

  // PATCH /api/admin/coaches/:id - Update coach details
  app.patch('/api/admin/coaches/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const coachId = parseInt(req.params.id);
      const { displayName, calComLink, ratePerSession, rateCurrency, isActive } = req.body;

      const updateData: Record<string, any> = {};
      if (displayName !== undefined) updateData.displayName = displayName.trim();
      if (calComLink !== undefined) updateData.calComLink = calComLink?.trim() || null;
      if (ratePerSession !== undefined) updateData.ratePerSession = parseInt(ratePerSession);
      if (rateCurrency !== undefined) updateData.rateCurrency = rateCurrency;
      if (isActive !== undefined) updateData.isActive = isActive;

      const [updated] = await db.update(coaches).set(updateData).where(eq(coaches.id, coachId)).returning();

      if (!updated) {
        return res.status(404).json({ message: "Coach not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating coach:", error);
      res.status(500).json({ message: error.message || "Failed to update coach" });
    }
  });

  // GET /api/admin/unassigned-coaching - List coaching purchases without a coach
  app.get('/api/admin/unassigned-coaching', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const unassigned = await db.select().from(coachingPurchases)
        .where(isNull(coachingPurchases.assignedCoachId))
        .orderBy(desc(coachingPurchases.purchasedAt));

      // Enrich with user info
      const enriched = await Promise.all(unassigned.map(async (cp) => {
        let user = null;
        if (cp.userId) {
          user = await storage.getUser(cp.userId);
        }
        return {
          ...cp,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
        };
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error("Error fetching unassigned coaching:", error);
      res.status(500).json({ message: error.message || "Failed to fetch unassigned coaching" });
    }
  });

  // GET /api/admin/all-coaching-clients - List ALL coaching clients from all sources
  app.get('/api/admin/all-coaching-clients', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      // 1. Get all actual coaching purchase records (exclude dismissed)
      const allPurchases = await db.select().from(coachingPurchases)
        .where(or(eq(coachingPurchases.dismissed, false), isNull(coachingPurchases.dismissed)))
        .orderBy(desc(coachingPurchases.purchasedAt));
      const purchaseEmails = new Set(allPurchases.map(p => p.email.toLowerCase()));

      // 2. Find users with coachingPurchased=true who don't have a coachingPurchases record
      const coachingUsers = await db.select().from(users).where(eq(users.coachingPurchased, true));
      for (const cu of coachingUsers) {
        const cuEmail = cu.email || `user-${cu.id}@unknown`;
        if (!purchaseEmails.has(cuEmail.toLowerCase())) {
          allPurchases.push({
            id: 0,
            userId: cu.id,
            email: cuEmail,
            coachType: 'unknown',
            packageType: 'unknown',
            sessionsTotal: 0,
            amountPaid: 0,
            currency: cu.purchaseCurrency || 'gbp',
            stripeSessionId: null as any,
            assignedCoachId: null,
            coachNotes: null,
            dismissed: false,
            purchasedAt: cu.createdAt as any,
          });
          purchaseEmails.add(cuEmail.toLowerCase());
        }
      }

      // 3. Find pending purchases with coaching that don't have a coachingPurchases record
      const allPendingCoaching = await db.select().from(pendingPurchases)
        .where(sql`${pendingPurchases.productType} LIKE '%coaching%'`);
      for (const pp of allPendingCoaching) {
        if (!purchaseEmails.has(pp.email.toLowerCase())) {
          const isMatt = (pp.productType || '').includes('matt');
          const isSingle = (pp.productType || '').includes('single');
          allPurchases.push({
            id: 0,
            userId: null as any,
            email: pp.email,
            coachType: isMatt ? 'matt' : 'expert',
            packageType: isSingle ? 'single' : 'pack',
            sessionsTotal: isSingle ? 1 : 4,
            amountPaid: pp.amountPaid,
            currency: pp.currency,
            stripeSessionId: pp.stripeSessionId as any,
            assignedCoachId: null,
            coachNotes: null,
            dismissed: false,
            purchasedAt: pp.createdAt as any,
          });
          purchaseEmails.add(pp.email.toLowerCase());
        }
      }

      const allCoaches = await db.select().from(coaches);
      const coachMap = new Map(allCoaches.map(c => [c.id, c]));

      // Get session counts per purchase
      const allSess = await db.select().from(coachingSessions);
      const sessionsByPurchase = new Map<number, { completed: number; pending: number }>();
      for (const s of allSess) {
        const cur = sessionsByPurchase.get(s.coachingPurchaseId) || { completed: 0, pending: 0 };
        if (s.status === 'completed') cur.completed++;
        else if (s.status === 'pending') cur.pending++;
        sessionsByPurchase.set(s.coachingPurchaseId, cur);
      }

      const enriched = await Promise.all(allPurchases.map(async (cp) => {
        let user = null;
        if (cp.userId) {
          user = await storage.getUser(cp.userId);
        }
        const coach = cp.assignedCoachId ? coachMap.get(cp.assignedCoachId) : null;
        const sessions = sessionsByPurchase.get(cp.id) || { completed: 0, pending: 0 };

        return {
          ...cp,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
          assignedCoach: coach ? { id: coach.id, displayName: coach.displayName } : null,
          sessionsCompleted: sessions.completed,
          sessionsPending: sessions.pending,
        };
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error("Error fetching all coaching clients:", error);
      res.status(500).json({ message: error.message || "Failed to fetch coaching clients" });
    }
  });

  // POST /api/admin/coaching-clients/add - Manually add a coaching client
  app.post('/api/admin/coaching-clients/add', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const { email, coachType, packageType, sessionsTotal } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if they already exist in coachingPurchases
      const existing = await db.select().from(coachingPurchases)
        .where(sql`lower(${coachingPurchases.email}) = ${email.toLowerCase()}`);
      if (existing.length > 0) {
        return res.status(400).json({ message: "This email already has a coaching purchase record" });
      }

      // Find user by email if they have an account
      const userRecord = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${email.toLowerCase()}`);
      const userId = userRecord[0]?.id || null;

      const sessions = sessionsTotal || (packageType === 'single' ? 1 : 4);

      const [purchase] = await db.insert(coachingPurchases).values({
        userId,
        email,
        coachType: coachType || 'expert',
        packageType: packageType || 'pack',
        sessionsTotal: sessions,
        amountPaid: 0,
        currency: 'gbp',
        stripeSessionId: `manual_${Date.now()}`,
      }).returning();

      res.json({ success: true, purchase, message: `Added ${email} as coaching client` });
    } catch (error: any) {
      console.error("Error adding coaching client:", error);
      res.status(500).json({ message: error.message || "Failed to add coaching client" });
    }
  });

  // POST /api/admin/coaching-clients/:id/dismiss - Dismiss a client from the coaching queue
  app.post('/api/admin/coaching-clients/:id/dismiss', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const id = parseInt(req.params.id);
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Remove from ALL sources so they don't reappear

      // 1. Set coachingPurchased=false on user record
      const userRecord = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${email.toLowerCase()}`);
      if (userRecord[0]) {
        await db.update(users)
          .set({ coachingPurchased: false })
          .where(eq(users.id, userRecord[0].id));
      }

      // 2. Mark ALL coachingPurchases records for this email as dismissed
      await db.update(coachingPurchases)
        .set({ dismissed: true })
        .where(sql`lower(${coachingPurchases.email}) = ${email.toLowerCase()}`);

      // 3. Remove from pendingPurchases coaching entries
      await db.delete(pendingPurchases)
        .where(and(
          sql`lower(${pendingPurchases.email}) = ${email.toLowerCase()}`,
          sql`${pendingPurchases.productType} LIKE '%coaching%'`,
        ));

      res.json({ success: true, message: `Dismissed ${email} from all sources` });
    } catch (error: any) {
      console.error("Error dismissing coaching client:", error);
      res.status(500).json({ message: error.message || "Failed to dismiss" });
    }
  });

  // POST /api/admin/coaching-purchases/:id/assign - Assign or reassign a client to a coach
  app.post('/api/admin/coaching-purchases/:id/assign', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const purchaseId = parseInt(req.params.id);
      const { coachId, email, sessionsTotal: reqSessions, coachType, packageType, currency } = req.body;

      if (!coachId) {
        return res.status(400).json({ message: "Coach ID is required" });
      }

      // Get the coach
      const [coach] = await db.select().from(coaches).where(eq(coaches.id, parseInt(coachId)));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }

      let purchase;

      if (purchaseId === 0 && email) {
        // This is a synthetic record (from users table or pendingPurchases) — create a real coachingPurchases record
        const sessionsCount = reqSessions || 4;
        const userRecord = await db.select().from(users).where(sql`lower(${users.email}) = ${email.toLowerCase()}`);
        const userId = userRecord[0]?.id || null;

        [purchase] = await db.insert(coachingPurchases).values({
          userId,
          email,
          coachType: coachType || 'expert',
          packageType: packageType || 'pack',
          sessionsTotal: sessionsCount,
          amountPaid: 0,
          currency: currency || 'gbp',
          stripeSessionId: `manual_${Date.now()}`,
          assignedCoachId: coach.id,
        }).returning();

        // Create pending session records
        for (let i = 1; i <= sessionsCount; i++) {
          await db.insert(coachingSessions).values({
            coachingPurchaseId: purchase.id,
            coachId: coach.id,
            clientUserId: userId,
            clientEmail: email,
            sessionNumber: i,
            status: 'pending',
          });
        }
      } else {
        // Normal flow — lookup existing purchase
        [purchase] = await db.select().from(coachingPurchases).where(eq(coachingPurchases.id, purchaseId));
        if (!purchase) {
          return res.status(404).json({ message: "Coaching purchase not found" });
        }

        const isReassignment = purchase.assignedCoachId !== null && purchase.assignedCoachId !== coach.id;

        // Update the purchase with assigned coach
        await db.update(coachingPurchases)
          .set({ assignedCoachId: coach.id })
          .where(eq(coachingPurchases.id, purchaseId));

        if (isReassignment) {
          // Reassignment: move pending sessions to new coach (completed sessions stay with old coach)
          await db.update(coachingSessions)
            .set({ coachId: coach.id })
            .where(and(
              eq(coachingSessions.coachingPurchaseId, purchaseId),
              eq(coachingSessions.status, 'pending'),
            ));
        } else if (!purchase.assignedCoachId) {
          // First-time assignment: create pending session records
          for (let i = 1; i <= purchase.sessionsTotal; i++) {
            await db.insert(coachingSessions).values({
              coachingPurchaseId: purchaseId,
              coachId: coach.id,
              clientUserId: purchase.userId || null,
              clientEmail: purchase.email,
              sessionNumber: i,
              status: 'pending',
            });
          }
        }
      }

      // Send assignment email to client
      try {
        await sendCoachAssignmentEmail({
          to: purchase.email,
          firstName: '',
          coachName: coach.displayName,
          calComLink: coach.calComLink || '',
          sessionsTotal: purchase.sessionsTotal,
        });
      } catch (emailErr) {
        console.error("Failed to send coach assignment email:", emailErr);
      }

      res.json({ success: true, message: `Assigned to ${coach.displayName}` });
    } catch (error: any) {
      console.error("Error assigning coach:", error);
      res.status(500).json({ message: error.message || "Failed to assign coach" });
    }
  });

  // POST /api/admin/coaches/:id/set-default - Set a coach as the default for auto-assignment
  app.post('/api/admin/coaches/:id/set-default', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const coachId = parseInt(req.params.id);

      // Clear all existing defaults
      await db.update(coaches).set({ isDefault: false }).where(eq(coaches.isDefault, true));

      // Set the new default
      await db.update(coaches).set({ isDefault: true }).where(eq(coaches.id, coachId));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error setting default coach:", error);
      res.status(500).json({ message: error.message || "Failed to set default coach" });
    }
  });

  // DELETE /api/admin/coaches/default - Remove default coach (no auto-assignment)
  app.delete('/api/admin/coaches/default', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      await db.update(coaches).set({ isDefault: false }).where(eq(coaches.isDefault, true));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing default coach:", error);
      res.status(500).json({ message: error.message || "Failed to remove default coach" });
    }
  });

  // POST /api/admin/coaches/:id/send-calcom-setup - Send Cal.com webhook setup instructions
  app.post('/api/admin/coaches/:id/send-calcom-setup', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const coachId = parseInt(req.params.id);
      const [coach] = await db.select().from(coaches).where(eq(coaches.id, coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }

      const webhookUrl = 'https://challenge.mattwebley.com/api/webhooks/calcom';
      const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET || null;

      const sent = await sendCalcomSetupEmail({
        to: coach.email,
        coachName: coach.displayName,
        webhookUrl,
        webhookSecret,
      });

      if (sent) {
        res.json({ success: true, message: `Setup instructions sent to ${coach.email}` });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error: any) {
      console.error("Error sending Cal.com setup email:", error);
      res.status(500).json({ message: error.message || "Failed to send email" });
    }
  });

  // GET /api/admin/coach-payouts - List all payout requests
  app.get('/api/admin/coach-payouts', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const payouts = await db.select().from(coachPayouts).orderBy(desc(coachPayouts.requestedAt));

      // Enrich with coach info
      const enriched = await Promise.all(payouts.map(async (payout) => {
        const [coach] = await db.select().from(coaches).where(eq(coaches.id, payout.coachId));
        return { ...payout, coach: coach || null };
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ message: error.message || "Failed to fetch payouts" });
    }
  });

  // PATCH /api/admin/coach-payouts/:id - Mark payout as paid
  app.patch('/api/admin/coach-payouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const payoutId = parseInt(req.params.id);
      const [updated] = await db.update(coachPayouts)
        .set({ status: 'paid', paidAt: new Date() })
        .where(eq(coachPayouts.id, payoutId))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Payout not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating payout:", error);
      res.status(500).json({ message: error.message || "Failed to update payout" });
    }
  });

  // GET /api/admin/coach-sessions - All sessions across coaches
  app.get('/api/admin/coach-sessions', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const sessions = await db.select().from(coachingSessions).orderBy(desc(coachingSessions.createdAt));

      // Enrich with coach and client info
      const enriched = await Promise.all(sessions.map(async (session) => {
        const [coach] = await db.select().from(coaches).where(eq(coaches.id, session.coachId));
        let clientUser = null;
        if (session.clientUserId) {
          clientUser = await storage.getUser(session.clientUserId);
        }
        return {
          ...session,
          coach: coach ? { id: coach.id, displayName: coach.displayName } : null,
          clientUser: clientUser ? { firstName: clientUser.firstName, lastName: clientUser.lastName, email: clientUser.email } : null,
        };
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch sessions" });
    }
  });

  // PATCH /api/admin/coach-sessions/:id - Admin manually update a session
  app.patch('/api/admin/coach-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!await requireAdmin(req, res)) return;

      const sessionId = parseInt(req.params.id);
      const { status, completedAt, scheduledAt, coachNotes } = req.body;

      const [session] = await db.select().from(coachingSessions).where(eq(coachingSessions.id, sessionId));
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const updateData: Record<string, any> = {};
      if (status) updateData.status = status;
      if (status === 'completed') updateData.completedAt = completedAt ? new Date(completedAt) : new Date();
      if (status === 'pending') { updateData.completedAt = null; updateData.scheduledAt = null; updateData.calcomBookingUid = null; }
      if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      if (coachNotes !== undefined) updateData.coachNotes = coachNotes || null;

      await db.update(coachingSessions).set(updateData).where(eq(coachingSessions.id, sessionId));

      res.json({ success: true, message: `Session #${session.sessionNumber} updated to ${status || 'updated'}` });
    } catch (error: any) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: error.message || "Failed to update session" });
    }
  });

  // =============================================
  // COACH DASHBOARD ENDPOINTS (coach's own view)
  // =============================================

  // GET /api/coach/profile - Coach's own profile and stats
  app.get('/api/coach/profile', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const [coach] = await db.select().from(coaches).where(eq(coaches.id, auth.coachId));
      const sessions = await db.select().from(coachingSessions).where(eq(coachingSessions.coachId, auth.coachId));
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const payouts = await db.select().from(coachPayouts).where(eq(coachPayouts.coachId, auth.coachId));
      const paidOut = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const pendingPayouts = payouts.filter(p => p.status === 'requested').reduce((sum, p) => sum + p.amount, 0);
      const totalEarned = completedSessions.length * coach.ratePerSession;
      const availableBalance = totalEarned - paidOut - pendingPayouts;

      res.json({
        ...coach,
        stats: {
          completedSessions: completedSessions.length,
          pendingSessions: sessions.filter(s => s.status === 'pending').length,
          totalEarned,
          availableBalance,
          paidOut,
          pendingPayouts,
        },
      });
    } catch (error: any) {
      console.error("Error fetching coach profile:", error);
      res.status(500).json({ message: error.message || "Failed to fetch profile" });
    }
  });

  // PATCH /api/coach/profile - Coach updates their own company/profile details
  app.patch('/api/coach/profile', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const { calComLink, companyName, companyAddress, taxId, bankDetails } = req.body;

      const updateData: Record<string, any> = {};
      if (calComLink !== undefined) updateData.calComLink = calComLink?.trim() || null;
      if (companyName !== undefined) updateData.companyName = companyName?.trim() || null;
      if (companyAddress !== undefined) updateData.companyAddress = companyAddress?.trim() || null;
      if (taxId !== undefined) updateData.taxId = taxId?.trim() || null;
      if (bankDetails !== undefined) updateData.bankDetails = bankDetails?.trim() || null;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const [updated] = await db.update(coaches).set(updateData).where(eq(coaches.id, auth.coachId)).returning();
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating coach profile:", error);
      res.status(500).json({ message: error.message || "Failed to update profile" });
    }
  });

  // GET /api/coach/clients - Coach's assigned clients with progress data
  app.get('/api/coach/clients', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      // Get all coaching purchases assigned to this coach
      const purchases = await db.select().from(coachingPurchases)
        .where(eq(coachingPurchases.assignedCoachId, auth.coachId));

      const clients = await Promise.all(purchases.map(async (purchase) => {
        let user = null;
        let progress: any[] = [];
        if (purchase.userId) {
          user = await storage.getUser(purchase.userId);
          // Get their challenge progress
          progress = await db.select().from(userProgress)
            .where(and(eq(userProgress.userId, purchase.userId), eq(userProgress.completed, true)));
        }

        // Get sessions for this purchase
        const sessions = await db.select().from(coachingSessions)
          .where(eq(coachingSessions.coachingPurchaseId, purchase.id));

        const completedSessions = sessions.filter(s => s.status === 'completed').length;

        return {
          purchaseId: purchase.id,
          email: purchase.email,
          coachType: purchase.coachType,
          packageType: purchase.packageType,
          sessionsTotal: purchase.sessionsTotal,
          sessionsCompleted: completedSessions,
          sessionsRemaining: purchase.sessionsTotal - completedSessions,
          amountPaid: purchase.amountPaid,
          currency: purchase.currency,
          purchasedAt: purchase.purchasedAt,
          coachNotes: purchase.coachNotes || '',
          user: user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            currentDay: progress.length > 0 ? Math.max(...progress.map(p => p.day)) : 0,
            daysCompleted: progress.length,
          } : null,
          sessions,
        };
      }));

      res.json(clients);
    } catch (error: any) {
      console.error("Error fetching coach clients:", error);
      res.status(500).json({ message: error.message || "Failed to fetch clients" });
    }
  });

  // PATCH /api/coach/clients/:purchaseId/notes - Save notes for a client
  app.patch('/api/coach/clients/:purchaseId/notes', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const purchaseId = parseInt(req.params.purchaseId);
      const { notes } = req.body;

      // Verify this purchase belongs to this coach
      const [purchase] = await db.select().from(coachingPurchases)
        .where(and(eq(coachingPurchases.id, purchaseId), eq(coachingPurchases.assignedCoachId, auth.coachId)));

      if (!purchase) {
        return res.status(404).json({ message: "Client not found" });
      }

      await db.update(coachingPurchases)
        .set({ coachNotes: notes || null })
        .where(eq(coachingPurchases.id, purchaseId));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error saving client notes:", error);
      res.status(500).json({ message: error.message || "Failed to save notes" });
    }
  });

  // POST /api/coach/clients/:purchaseId/nudge - Send a nudge email to get client to book
  app.post('/api/coach/clients/:purchaseId/nudge', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const purchaseId = parseInt(req.params.purchaseId);

      // Verify this purchase belongs to this coach
      const [purchase] = await db.select().from(coachingPurchases)
        .where(and(eq(coachingPurchases.id, purchaseId), eq(coachingPurchases.assignedCoachId, auth.coachId)));
      if (!purchase) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Get coach details
      const [coach] = await db.select().from(coaches).where(eq(coaches.id, auth.coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }

      // Get client name
      let firstName = 'there';
      if (purchase.userId) {
        const user = await storage.getUser(purchase.userId);
        if (user?.firstName) firstName = user.firstName;
      }

      const completedCount = (await db.select().from(coachingSessions)
        .where(and(eq(coachingSessions.coachingPurchaseId, purchaseId), eq(coachingSessions.status, 'completed')))).length;
      const remaining = purchase.sessionsTotal - completedCount;

      if (remaining <= 0) {
        return res.status(400).json({ message: "This client has no remaining sessions" });
      }

      await sendCoachNudgeEmail({
        to: purchase.email,
        firstName,
        coachName: coach.displayName,
        calComLink: coach.calComLink || '',
        sessionsRemaining: remaining,
      });

      res.json({ success: true, message: `Nudge sent to ${purchase.email}` });
    } catch (error: any) {
      console.error("Error sending nudge:", error);
      res.status(500).json({ message: error.message || "Failed to send nudge" });
    }
  });

  // POST /api/coach/clients/:purchaseId/rebook - Send a payment link for another 4 sessions at the same price
  app.post('/api/coach/clients/:purchaseId/rebook', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const purchaseId = parseInt(req.params.purchaseId);

      // Verify this purchase belongs to this coach
      const [purchase] = await db.select().from(coachingPurchases)
        .where(and(eq(coachingPurchases.id, purchaseId), eq(coachingPurchases.assignedCoachId, auth.coachId)));
      if (!purchase) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Get coach details
      const [coach] = await db.select().from(coaches).where(eq(coaches.id, auth.coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }

      // Get client name
      let firstName = 'there';
      if (purchase.userId) {
        const user = await storage.getUser(purchase.userId);
        if (user?.firstName) firstName = user.firstName;
      }

      // Create a Stripe checkout session for 4 sessions at the same price
      const stripe = await getUncachableStripeClient();
      const currency = purchase.currency || 'gbp';
      const amount = purchase.amountPaid; // Same price they paid before
      const isMatt = purchase.coachType === 'matt';
      const productType = isMatt ? 'coaching-matt' : 'coaching';

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: purchase.email,
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `1:1 ${isMatt ? 'Matt Webley' : 'Expert'} Coaching - 4 x 1-Hour Sessions (Returning Client)`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `https://challenge.mattwebley.com/coaching/success?type=${isMatt ? 'matt' : 'expert'}`,
        cancel_url: `https://challenge.mattwebley.com/dashboard`,
        payment_intent_data: {
          capture_method: 'automatic',
          description: `4x ${isMatt ? 'Matt Webley' : 'Expert'} Coaching Sessions (Returning Client)`,
          metadata: { productType },
        },
        metadata: {
          productType,
          currency,
        },
      });

      if (!checkoutSession.url) {
        return res.status(500).json({ message: "Failed to create payment link" });
      }

      // Format price for the email
      const symbol = currency === 'gbp' ? '£' : currency === 'aed' ? 'AED ' : '$';
      const priceStr = `${symbol}${(amount / 100).toFixed(2)}`;

      // Send the email with the payment link
      await sendCoachingRebookEmail({
        to: purchase.email,
        firstName,
        coachName: coach.displayName,
        sessionsCount: 4,
        paymentUrl: checkoutSession.url,
        price: priceStr,
      });

      res.json({ success: true, message: `Rebooking link sent to ${purchase.email} (${priceStr} for 4 sessions)` });
    } catch (error: any) {
      console.error("Error sending rebook link:", error);
      res.status(500).json({ message: error.message || "Failed to send rebooking link" });
    }
  });

  // GET /api/coach/sessions - All sessions for this coach
  app.get('/api/coach/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const sessions = await db.select().from(coachingSessions)
        .where(eq(coachingSessions.coachId, auth.coachId))
        .orderBy(desc(coachingSessions.createdAt));

      // Enrich with client info
      const enriched = await Promise.all(sessions.map(async (session) => {
        let clientUser = null;
        if (session.clientUserId) {
          clientUser = await storage.getUser(session.clientUserId);
        }
        return {
          ...session,
          clientUser: clientUser ? { firstName: clientUser.firstName, lastName: clientUser.lastName, email: clientUser.email } : null,
        };
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error("Error fetching coach sessions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch sessions" });
    }
  });

  // POST /api/coach/sessions/:id/complete - Mark session as done
  app.post('/api/coach/sessions/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const sessionId = parseInt(req.params.id);
      const { notes } = req.body;

      // Verify this session belongs to this coach
      const [session] = await db.select().from(coachingSessions)
        .where(and(eq(coachingSessions.id, sessionId), eq(coachingSessions.coachId, auth.coachId)));

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.status === 'completed') {
        return res.status(400).json({ message: "Session already completed" });
      }

      // Mark as completed
      const [updated] = await db.update(coachingSessions)
        .set({
          status: 'completed',
          completedAt: new Date(),
          coachNotes: notes?.trim() || null,
        })
        .where(eq(coachingSessions.id, sessionId))
        .returning();

      // Get coach details for the email
      const [coach] = await db.select().from(coaches).where(eq(coaches.id, auth.coachId));

      // Check remaining sessions and send email
      const allSessions = await db.select().from(coachingSessions)
        .where(eq(coachingSessions.coachingPurchaseId, session.coachingPurchaseId));
      const remaining = allSessions.filter(s => s.status === 'pending').length;

      if (remaining > 0 && coach) {
        try {
          await sendBookNextSessionEmail({
            to: session.clientEmail,
            firstName: '',
            coachName: coach.displayName,
            calComLink: coach.calComLink || '',
            sessionsRemaining: remaining,
          });
        } catch (emailErr) {
          console.error("Failed to send book-next-session email:", emailErr);
        }
      }

      res.json({ ...updated, sessionsRemaining: remaining });
    } catch (error: any) {
      console.error("Error completing session:", error);
      res.status(500).json({ message: error.message || "Failed to complete session" });
    }
  });

  // GET /api/coach/earnings - Earnings summary
  app.get('/api/coach/earnings', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const [coach] = await db.select().from(coaches).where(eq(coaches.id, auth.coachId));
      const sessions = await db.select().from(coachingSessions)
        .where(and(eq(coachingSessions.coachId, auth.coachId), eq(coachingSessions.status, 'completed')));
      const payouts = await db.select().from(coachPayouts)
        .where(eq(coachPayouts.coachId, auth.coachId));

      const totalEarned = sessions.length * coach.ratePerSession;
      const paidOut = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const requested = payouts.filter(p => p.status === 'requested').reduce((sum, p) => sum + p.amount, 0);
      const availableBalance = totalEarned - paidOut - requested;

      // Enrich sessions with client info
      const enrichedSessions = await Promise.all(sessions.map(async (session) => {
        let clientUser = null;
        if (session.clientUserId) {
          clientUser = await storage.getUser(session.clientUserId);
        }
        return {
          ...session,
          earnings: coach.ratePerSession,
          clientUser: clientUser ? { firstName: clientUser.firstName, lastName: clientUser.lastName, email: clientUser.email } : null,
        };
      }));

      res.json({
        currency: coach.rateCurrency,
        ratePerSession: coach.ratePerSession,
        totalEarned,
        availableBalance,
        requested,
        paidOut,
        completedSessions: enrichedSessions,
        payouts: payouts.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime()),
      });
    } catch (error: any) {
      console.error("Error fetching earnings:", error);
      res.status(500).json({ message: error.message || "Failed to fetch earnings" });
    }
  });

  // POST /api/coach/payouts/request - Request payout of available balance
  app.post('/api/coach/payouts/request', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const [coach] = await db.select().from(coaches).where(eq(coaches.id, auth.coachId));
      const sessions = await db.select().from(coachingSessions)
        .where(and(eq(coachingSessions.coachId, auth.coachId), eq(coachingSessions.status, 'completed')));
      const payouts = await db.select().from(coachPayouts)
        .where(eq(coachPayouts.coachId, auth.coachId));

      const totalEarned = sessions.length * coach.ratePerSession;
      const paidOut = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const requested = payouts.filter(p => p.status === 'requested').reduce((sum, p) => sum + p.amount, 0);
      const availableBalance = totalEarned - paidOut - requested;

      if (availableBalance <= 0) {
        return res.status(400).json({ message: "No balance available for payout" });
      }

      // Find session IDs that haven't been paid out yet
      const paidSessionIds = payouts.flatMap(p => (p.sessionIds as number[]) || []);
      const unpaidSessions = sessions.filter(s => !paidSessionIds.includes(s.id));
      const sessionIds = unpaidSessions.map(s => s.id);

      // Generate invoice number
      const invoiceNumber = `INV-${coach.id}-${Date.now().toString(36).toUpperCase()}`;

      const [payout] = await db.insert(coachPayouts).values({
        coachId: auth.coachId,
        amount: availableBalance,
        currency: coach.rateCurrency,
        status: 'requested',
        invoiceNumber,
        sessionIds,
      }).returning();

      res.json(payout);
    } catch (error: any) {
      console.error("Error requesting payout:", error);
      res.status(500).json({ message: error.message || "Failed to request payout" });
    }
  });

  // GET /api/coach/invoice/:payoutId - Generate invoice HTML
  app.get('/api/coach/invoice/:payoutId', isAuthenticated, async (req: any, res) => {
    try {
      const auth = await requireCoach(req, res);
      if (!auth) return;

      const payoutId = parseInt(req.params.payoutId);
      const [payout] = await db.select().from(coachPayouts)
        .where(and(eq(coachPayouts.id, payoutId), eq(coachPayouts.coachId, auth.coachId)));

      if (!payout) {
        return res.status(404).json({ message: "Payout not found" });
      }

      const [coach] = await db.select().from(coaches).where(eq(coaches.id, auth.coachId));

      // Get sessions included in this payout
      const sessionIds = (payout.sessionIds as number[]) || [];
      const sessions = sessionIds.length > 0
        ? await db.select().from(coachingSessions).where(sql`${coachingSessions.id} = ANY(${sessionIds})`)
        : [];

      // Enrich sessions with client info
      const enrichedSessions = await Promise.all(sessions.map(async (session) => {
        let clientName = session.clientEmail;
        if (session.clientUserId) {
          const user = await storage.getUser(session.clientUserId);
          if (user) {
            clientName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || session.clientEmail;
          }
        }
        return { ...session, clientName };
      }));

      const { generateInvoiceHTML } = await import('./coachInvoiceTemplate');
      const html = generateInvoiceHTML({
        invoiceNumber: payout.invoiceNumber || `INV-${payout.id}`,
        coachName: coach.displayName,
        coachEmail: coach.email,
        date: payout.requestedAt || payout.createdAt || new Date(),
        sessions: enrichedSessions.map(s => ({
          clientName: s.clientName,
          completedAt: s.completedAt,
          amount: coach.ratePerSession,
        })),
        total: payout.amount,
        currency: payout.currency,
        status: payout.status,
        paidAt: payout.paidAt,
      });

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error: any) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: error.message || "Failed to generate invoice" });
    }
  });

  return httpServer;
}
