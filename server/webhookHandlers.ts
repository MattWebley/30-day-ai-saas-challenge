import Stripe from 'stripe';
import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { users, pendingPurchases } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { sendPurchaseConfirmationEmail, sendCoachingConfirmationEmail, sendCoachingPurchaseNotificationEmail, sendCritiqueNotificationEmail } from './emailService';

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

    // First, process with our custom handler
    await this.handleCheckoutComplete(payload, signature);

    // Then let StripeSync handle it (for general Stripe data sync)
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }

  static async handleCheckoutComplete(payload: Buffer, signature: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log('[Webhook] No STRIPE_WEBHOOK_SECRET configured, skipping custom processing');
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      return;
    }

    console.log('[Webhook] Received event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.processCompletedCheckout(session);
    }
  }

  static async processCompletedCheckout(session: Stripe.Checkout.Session): Promise<void> {
    const email = session.customer_email || session.customer_details?.email;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const productType = session.metadata?.productType || 'challenge';
    const currency = session.metadata?.currency || 'usd';
    const userId = session.metadata?.userId;
    const amountPaid = session.amount_total || 0;

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
      const [foundUser] = await db.select().from(users).where(eq(users.email, email));
      user = foundUser;
    }

    if (user) {
      // User exists - grant access directly
      console.log('[Webhook] User found, granting access:', user.id);
      await this.grantAccessToUser(user.id, productType, customerId, currency, email, amountPaid);
    } else {
      // No user found - save as pending purchase
      console.log('[Webhook] No user found, saving pending purchase for:', email);
      await db.insert(pendingPurchases).values({
        email,
        stripeCustomerId: customerId,
        stripeSessionId: session.id,
        productType,
        currency,
        amountPaid
      }).onConflictDoNothing();

      // Send purchase confirmation email with login instructions
      const firstName = session.customer_details?.name?.split(' ')[0] || 'there';
      await sendPurchaseConfirmationEmail({
        to: email,
        firstName,
        currency: (currency as 'usd' | 'gbp') || 'usd',
        total: amountPaid / 100
      }).catch((err: any) => console.error('[Webhook] Purchase email error:', err));
    }
  }

  static async grantAccessToUser(
    userId: string,
    productType: string,
    customerId: string,
    currency: string,
    email: string,
    amountPaid: number
  ): Promise<void> {
    const updateData: Record<string, any> = {
      stripeCustomerId: customerId,
      purchaseCurrency: currency.toLowerCase()
    };

    // Grant access based on product type
    switch (productType) {
      case 'challenge':
        updateData.challengePurchased = true;
        break;
      case 'coaching':
      case 'coaching-single':
      case 'coaching-matt':
      case 'coaching-matt-single':
        updateData.coachingPurchased = true;
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
        break;
      case 'critique':
        // Critique notification - will be sent when they submit the form
        console.log('[Webhook] Critique purchased for:', email);
        break;
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));
    console.log('[Webhook] Access granted for user:', userId, 'Product:', productType);
  }
}
