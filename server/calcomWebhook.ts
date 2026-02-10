import { db } from './db';
import { coachingSessions, coachingPurchases, coaches } from '../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

interface CalcomBookingPayload {
  triggerEvent: string;
  payload: {
    uid: string;
    startTime: string;
    endTime: string;
    attendees: { email: string; name?: string }[];
    organizer: { email: string; name?: string };
    metadata?: Record<string, any>;
    status?: string;
    rescheduleUid?: string;
  };
}

export async function handleCalcomWebhook(body: CalcomBookingPayload) {
  const { triggerEvent, payload } = body;

  if (!payload?.uid) {
    console.log('[Cal.com] Ignoring event without UID:', triggerEvent);
    return;
  }

  console.log(`[Cal.com] ${triggerEvent} — UID: ${payload.uid}`);

  switch (triggerEvent) {
    case 'BOOKING_CREATED': {
      await handleBookingCreated(payload);
      break;
    }
    case 'BOOKING_RESCHEDULED': {
      await handleBookingRescheduled(payload);
      break;
    }
    case 'BOOKING_CANCELLED': {
      await handleBookingCancelled(payload);
      break;
    }
    default:
      console.log(`[Cal.com] Unhandled event: ${triggerEvent}`);
  }
}

async function handleBookingCreated(payload: CalcomBookingPayload['payload']) {
  // Find the client's email from attendees (not the organizer/coach)
  const organizerEmail = payload.organizer?.email?.toLowerCase();
  const clientAttendee = payload.attendees?.find(
    a => a.email.toLowerCase() !== organizerEmail
  );

  if (!clientAttendee) {
    console.log('[Cal.com] No client attendee found, skipping');
    return;
  }

  const clientEmail = clientAttendee.email.toLowerCase();
  const scheduledAt = new Date(payload.startTime);

  // If metadata has purchaseId, use it for exact match
  const purchaseId = payload.metadata?.purchaseId ? parseInt(payload.metadata.purchaseId) : null;

  let session;

  if (purchaseId) {
    // Exact match by purchaseId — find the first pending session
    [session] = await db.select().from(coachingSessions)
      .where(and(
        eq(coachingSessions.coachingPurchaseId, purchaseId),
        eq(coachingSessions.status, 'pending'),
      ))
      .orderBy(coachingSessions.sessionNumber)
      .limit(1);
  }

  if (!session) {
    // Fallback: match by client email — find the first pending session
    [session] = await db.select().from(coachingSessions)
      .where(and(
        sql`lower(${coachingSessions.clientEmail}) = ${clientEmail}`,
        eq(coachingSessions.status, 'pending'),
      ))
      .orderBy(coachingSessions.sessionNumber)
      .limit(1);
  }

  if (!session) {
    console.log(`[Cal.com] No pending session found for ${clientEmail} (purchaseId: ${purchaseId})`);
    return;
  }

  // Mark session as scheduled
  await db.update(coachingSessions)
    .set({
      status: 'scheduled',
      scheduledAt,
      calcomBookingUid: payload.uid,
    })
    .where(eq(coachingSessions.id, session.id));

  console.log(`[Cal.com] Session #${session.sessionNumber} scheduled for ${clientEmail} at ${scheduledAt.toISOString()}`);
}

async function handleBookingRescheduled(payload: CalcomBookingPayload['payload']) {
  const oldUid = payload.rescheduleUid || payload.uid;
  const newScheduledAt = new Date(payload.startTime);

  // Find session by old booking UID
  const [session] = await db.select().from(coachingSessions)
    .where(eq(coachingSessions.calcomBookingUid, oldUid))
    .limit(1);

  if (!session) {
    console.log(`[Cal.com] No session found for rescheduled UID: ${oldUid}`);
    return;
  }

  await db.update(coachingSessions)
    .set({
      scheduledAt: newScheduledAt,
      calcomBookingUid: payload.uid,
    })
    .where(eq(coachingSessions.id, session.id));

  console.log(`[Cal.com] Session #${session.sessionNumber} rescheduled to ${newScheduledAt.toISOString()}`);
}

async function handleBookingCancelled(payload: CalcomBookingPayload['payload']) {
  const [session] = await db.select().from(coachingSessions)
    .where(eq(coachingSessions.calcomBookingUid, payload.uid))
    .limit(1);

  if (!session) {
    console.log(`[Cal.com] No session found for cancelled UID: ${payload.uid}`);
    return;
  }

  // Set back to pending (so client can rebook), clear schedule info
  await db.update(coachingSessions)
    .set({
      status: 'pending',
      scheduledAt: null,
      calcomBookingUid: null,
    })
    .where(eq(coachingSessions.id, session.id));

  console.log(`[Cal.com] Session #${session.sessionNumber} cancelled — reset to pending`);
}
