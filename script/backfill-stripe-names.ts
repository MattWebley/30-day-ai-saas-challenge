import { db } from "../server/db";
import { users } from "../shared/schema";
import { and, isNotNull, isNull, or, eq } from "drizzle-orm";
import { getUncachableStripeClient } from "../server/stripeClient";

function splitName(fullName: string): { firstName: string | null; lastName: string | null } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: null, lastName: null };
  const [first, ...rest] = trimmed.split(" ");
  return { firstName: first || null, lastName: rest.length ? rest.join(" ") : null };
}

async function main() {
  const stripe = await getUncachableStripeClient();

  const usersNeedingNames = await db
    .select()
    .from(users)
    .where(
      and(
        isNotNull(users.stripeCustomerId),
        or(isNull(users.firstName), isNull(users.lastName)),
      ),
    );

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const user of usersNeedingNames) {
    const customerId = user.stripeCustomerId;
    if (!customerId) continue;

    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !("deleted" in customer)) {
        const fullName = customer.name || "";
        const { firstName, lastName } = splitName(fullName);
        if (!firstName && !lastName) {
          missing++;
          continue;
        }
        await db
          .update(users)
          .set({
            ...(user.firstName ? {} : { firstName }),
            ...(user.lastName ? {} : { lastName }),
          })
          .where(eq(users.id, user.id));
        updated++;
      } else {
        skipped++;
      }
    } catch (err) {
      skipped++;
    }
  }

  console.log(
    JSON.stringify(
      {
        scanned: usersNeedingNames.length,
        updated,
        missing,
        skipped,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
