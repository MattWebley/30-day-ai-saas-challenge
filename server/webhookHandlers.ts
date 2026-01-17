import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    // Let StripeSync handle the webhook first
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // Now handle our custom prompt pack logic
    try {
      const stripe = await getUncachableStripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (webhookSecret) {
        const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const metadata = session.metadata || {};

          // Handle standalone prompt pack purchase
          if (metadata.productType === 'prompt_pack' && metadata.userId) {
            console.log(`Prompt pack purchased by user ${metadata.userId}`);
            await db.update(users)
              .set({ promptPackPurchased: true })
              .where(eq(users.id, metadata.userId));
          }

          // Handle standalone launch pack purchase
          if (metadata.productType === 'launch_pack' && metadata.userId) {
            console.log(`Launch pack purchased by user ${metadata.userId}`);
            await db.update(users)
              .set({ launchPackPurchased: true })
              .where(eq(users.id, metadata.userId));
          }

          // Handle prompt pack as part of main challenge purchase
          if (metadata.includePromptPack === 'true' && session.customer_email) {
            console.log(`Prompt pack included in challenge purchase for ${session.customer_email}`);
            await db.update(users)
              .set({ promptPackPurchased: true })
              .where(eq(users.email, session.customer_email));
          }

          // Handle launch pack as part of main challenge purchase
          if (metadata.includeLaunchPack === 'true' && session.customer_email) {
            console.log(`Launch pack included in challenge purchase for ${session.customer_email}`);
            await db.update(users)
              .set({ launchPackPurchased: true })
              .where(eq(users.email, session.customer_email));
          }
        }
      }
    } catch (error) {
      // Log but don't fail - the main webhook processing already succeeded
      console.error('Error processing pack purchase webhook:', error);
    }
  }
}
