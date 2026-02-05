import Stripe from 'stripe';
import { db } from '../server/db';
import { users, pendingPurchases } from '../shared/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function processRecentCheckouts() {
  const sessions = await stripe.checkout.sessions.list({ limit: 15 });
  const paid = sessions.data.filter(s => s.payment_status === "paid");

  console.log("Processing", paid.length, "paid sessions...\n");

  for (const session of paid) {
    const email = (session.customer_email || session.customer_details?.email || "").toLowerCase();
    if (!email) continue;

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const productType = session.metadata?.productType || "challenge";
    const currency = session.metadata?.currency || session.currency || "usd";
    const amountPaid = session.amount_total || 0;

    const [existingUser] = await db.select().from(users).where(eq(users.email, email));

    if (existingUser) {
      if (productType === "challenge" && !existingUser.challengePurchased) {
        await db.update(users).set({
          challengePurchased: true,
          stripeCustomerId: customerId,
          purchaseCurrency: currency
        }).where(eq(users.email, email));
        console.log("✓ Granted challenge access to:", email);
      } else if (productType.includes("coaching") && !existingUser.coachingPurchased) {
        await db.update(users).set({ coachingPurchased: true }).where(eq(users.email, email));
        console.log("✓ Granted coaching access to:", email);
      } else {
        console.log("- Already has access:", email);
      }
    } else {
      const [existing] = await db.select().from(pendingPurchases).where(eq(pendingPurchases.email, email));

      if (!existing) {
        await db.insert(pendingPurchases).values({
          email,
          stripeCustomerId: customerId || "unknown",
          stripeSessionId: session.id,
          productType,
          currency,
          amountPaid
        });
        console.log("✓ Added pending purchase for:", email);
      } else {
        console.log("- Already pending:", email);
      }
    }
  }
  console.log("\nDone!");
}

processRecentCheckouts().then(() => process.exit(0)).catch(console.error);
