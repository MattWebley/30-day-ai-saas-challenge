import Stripe from 'stripe';
import crypto from 'crypto';
import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { users, pendingPurchases, coachingPurchases, magicTokens } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { sendPurchaseConfirmationEmail, sendCoachingConfirmationEmail, sendCoachingPurchaseNotificationEmail, sendCritiqueNotificationEmail, sendWelcomeAccessEmail } from './emailService';
import { addContactToSysteme } from './systemeService';
import { sendPurchaseEvent } from './metaConversions';

export class WebhookHandlers {
  static lastWebhookAt: Date | null = null;
  static lastWebhookType: string | null = null;
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    // Process with our custom handler - this MUST succeed or throw
    await this.handleCheckoutComplete(payload, signature);

    // Then let StripeSync handle it (for general Stripe data sync)
    try {
      const sync = await getStripeSync();
      await sync.processWebhook(payload, signature);
    } catch (syncError: any) {
      console.error('[Webhook] StripeSync error (non-fatal):', syncError.message);
    }
  }

  static async handleCheckoutComplete(payload: Buffer, signature: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('[Webhook] STRIPE_WEBHOOK_SECRET is not configured - cannot process webhooks');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new Error('[Webhook] Signature verification failed: ' + err.message);
    }

    WebhookHandlers.lastWebhookAt = new Date();
    WebhookHandlers.lastWebhookType = event.type;
    console.log('[Webhook] Verified event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.processCompletedCheckout(session);
      console.log('[Webhook] Successfully processed checkout for:', session.customer_email || session.customer_details?.email);
    }
  }

  static async processCompletedCheckout(session: Stripe.Checkout.Session): Promise<void> {
    const rawEmail = session.customer_email || session.customer_details?.email;
    const email = rawEmail?.toLowerCase().trim();
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const productType = session.metadata?.productType || 'challenge';
    const currency = session.metadata?.currency || 'usd';
    const userId = session.metadata?.userId;
    const amountPaid = session.amount_total || 0;
    const unlockAllDays = session.metadata?.unlockAllDays === 'true';

    console.log('[Webhook] Processing checkout:', {
      email,
      customerId,
      productType,
      userId: userId || 'guest',
      sessionId: session.id
    });

    if (!email || !customerId) {
      console.error('[Webhook] Missing email or customer ID');
      return;
    }

    // Try to find existing user by email or userId
    let user = null;
    if (userId) {
      const [foundUser] = await db.select().from(users).where(eq(users.id, userId));
      user = foundUser;
    }
    if (!user) {
      const [foundUser] = await db
        .select()
        .from(users)
        .where(sql`lower(${users.email}) = ${email}`);
      user = foundUser;
    }

    // Bump (Unlock All Days) is now included as a line item in the Stripe checkout
    // so it's already paid for - no separate charge needed. The LAUNCHOFFER coupon
    // is restricted to the challenge product only, so the bump is always full price.

    // Send server-side Purchase event to Meta Conversions API
    // Uses Stripe session ID as event_id for deduplication with client-side pixel
    if (productType === 'challenge') {
      const firstName = session.customer_details?.name?.split(' ')[0] || undefined;
      const lastName = session.customer_details?.name?.split(' ').slice(1).join(' ') || undefined;
      sendPurchaseEvent({
        eventId: session.id,
        email,
        value: amountPaid / 100,
        currency: currency.toUpperCase(),
        contentName: '21-Day AI SaaS Challenge',
        contentIds: ['challenge-21day'],
        firstName,
        lastName,
      }).catch(err => console.error('[Webhook] Meta CAPI error:', err));
    }

    if (user) {
      // User exists - grant access directly
      console.log('[Webhook] User found, granting access:', user.id);
      // If user is missing name, try to set from Stripe customer details
      const fullName = session.customer_details?.name?.trim();
      if ((!user.firstName || !user.lastName) && fullName) {
        const [firstName, ...rest] = fullName.split(' ');
        const lastName = rest.join(' ') || null;
        await db.update(users)
          .set({
            firstName: user.firstName || firstName || null,
            lastName: user.lastName || lastName,
          })
          .where(eq(users.id, user.id));
      }
      await this.grantAccessToUser(user.id, productType, customerId, currency, email, amountPaid, unlockAllDays);
    } else {
      // No user found - save as pending purchase
      console.log('[Webhook] No user found, saving pending purchase for:', email);
      const storedProductType = unlockAllDays ? `${productType}+unlock` : productType;
      const custFirstName = session.customer_details?.name?.split(' ')[0] || null;
      const custLastName = session.customer_details?.name?.split(' ').slice(1).join(' ') || null;
      await db.insert(pendingPurchases).values({
        email,
        firstName: custFirstName,
        lastName: custLastName,
        stripeCustomerId: customerId,
        stripeSessionId: session.id,
        productType: storedProductType,
        currency,
        amountPaid
      }).onConflictDoNothing();

      // Generate magic link for instant access
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(magicTokens).values({
        email,
        token,
        expiresAt,
      });

      const magicLink = `https://challenge.mattwebley.com/api/auth/magic-link/verify?token=${token}`;

      // Send welcome email with magic link
      await sendWelcomeAccessEmail(email, magicLink)
        .catch((err: any) => console.error('[Webhook] Welcome email error:', err));

      console.log('[Webhook] Sent welcome email with magic link to:', email);

      // Add guest purchaser to Systeme.io immediately (don't wait for account creation)
      const firstName = session.customer_details?.name?.split(' ')[0] || undefined;
      const lastName = session.customer_details?.name?.split(' ').slice(1).join(' ') || undefined;

      if (productType === 'challenge') {
        addContactToSysteme({
          email,
          firstName,
          lastName,
          tags: ['21-Day Challenge Buyer'],
        }).catch((err: any) => console.error('[Webhook] Systeme.io guest error:', err));
      }
    }
  }

  static async grantAccessToUser(
    userId: string,
    productType: string,
    customerId: string,
    currency: string,
    email: string,
    amountPaid: number,
    unlockAllDays: boolean = false
  ): Promise<void> {
    const updateData: Record<string, any> = {
      stripeCustomerId: customerId,
      purchaseCurrency: currency.toLowerCase()
    };

    // Grant access based on product type
    switch (productType) {
      case 'challenge':
        updateData.challengePurchased = true;
        if (unlockAllDays) {
          updateData.allDaysUnlocked = true;
          console.log('[Webhook] Unlock All Days bump purchased for:', email);
        }
        // Add to Systeme.io for email drip campaign
        const [challengeUser] = await db.select().from(users).where(eq(users.id, userId));
        addContactToSysteme({
          email,
          firstName: challengeUser?.firstName || undefined,
          lastName: challengeUser?.lastName || undefined,
          tags: ['21-Day Challenge Buyer'],
        }).catch((err: any) => console.error('[Webhook] Systeme.io error:', err));
        break;
      case 'coaching':
      case 'coaching-single':
      case 'coaching-matt':
      case 'coaching-matt-single':
        updateData.coachingPurchased = true;
        updateData.allDaysUnlocked = true;

        // Record the coaching purchase details
        const isMattCoach = productType.includes('matt');
        const isSingleSession = productType.includes('single');
        await db.insert(coachingPurchases).values({
          userId,
          email,
          coachType: isMattCoach ? 'matt' : 'expert',
          packageType: isSingleSession ? 'single' : 'pack',
          sessionsTotal: isSingleSession ? 1 : 4,
          amountPaid,
          currency: currency.toLowerCase(),
          stripeSessionId: `coaching_${userId}_${Date.now()}`,
        });
        console.log('[Webhook] Coaching purchase recorded:', { email, coach: isMattCoach ? 'matt' : 'expert', sessions: isSingleSession ? 1 : 4 });

        // Send coaching emails
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        const firstName = user?.firstName || 'there';
        const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown';

        sendCoachingConfirmationEmail({
          to: email,
          firstName,
          currency: currency.toLowerCase() as 'usd' | 'gbp',
          amount: amountPaid / 100
        }).catch((err: any) => console.error('[Webhook] Coaching email error:', err));

        sendCoachingPurchaseNotificationEmail({
          userEmail: email,
          userName,
          coachingType: productType.includes('matt') ? 'Sessions with Matt' : 'Expert Coaching',
          currency: currency.toLowerCase() as 'usd' | 'gbp',
          amount: amountPaid / 100
        }).catch((err: any) => console.error('[Webhook] Coaching notification error:', err));

        // Tag coaching buyers in Systeme.io
        addContactToSysteme({
          email,
          firstName: user?.firstName || undefined,
          lastName: user?.lastName || undefined,
          tags: ['Coaching Customer'],
        }).catch((err: any) => console.error('[Webhook] Systeme.io coaching tag error:', err));
        break;
      case 'critique':
        // Critique notification - will be sent when they submit the form
        console.log('[Webhook] Critique purchased for:', email);
        break;
      case 'unlock-all-days':
        updateData.allDaysUnlocked = true;
        console.log('[Webhook] Unlock All Days standalone purchase for:', email);
        break;
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));
    console.log('[Webhook] Access granted for user:', userId, 'Product:', productType);
  }
}
