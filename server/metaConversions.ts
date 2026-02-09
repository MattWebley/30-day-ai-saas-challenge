/**
 * Meta Conversions API (CAPI) — Server-Side Event Tracking
 *
 * Sends conversion events directly from the server to Meta,
 * so ad blockers and browser privacy features can't block them.
 *
 * Required env vars:
 *   META_CONVERSIONS_API_TOKEN — Generate in Meta Events Manager → Settings → Conversions API
 *
 * The pixel ID is hardcoded to match the one in client/index.html.
 */

import crypto from 'crypto';

const PIXEL_ID = '2480835232355599';
const API_VERSION = 'v21.0';

interface PurchaseEventData {
  eventId: string;
  email: string;
  value: number;          // amount in major currency units (e.g. 295, not 29500)
  currency: string;       // 'USD' or 'GBP'
  contentName: string;
  contentIds?: string[];
  firstName?: string;
  lastName?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

/**
 * SHA-256 hash a value (Meta requires hashed PII in user_data)
 */
function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

/**
 * Send a Purchase event to Meta Conversions API.
 * This runs server-side so it works even when the client-side pixel is blocked.
 *
 * Uses the Stripe session ID as event_id for deduplication with the
 * client-side pixel event fired on the CheckoutSuccess page.
 */
export async function sendPurchaseEvent(data: PurchaseEventData): Promise<void> {
  const token = process.env.META_CONVERSIONS_API_TOKEN;

  if (!token) {
    console.log('[Meta CAPI] No META_CONVERSIONS_API_TOKEN set — skipping server-side event');
    return;
  }

  const userData: Record<string, any> = {
    em: [sha256(data.email)],
  };

  if (data.firstName) userData.fn = [sha256(data.firstName)];
  if (data.lastName) userData.ln = [sha256(data.lastName)];
  if (data.clientIpAddress) userData.client_ip_address = data.clientIpAddress;
  if (data.clientUserAgent) userData.client_user_agent = data.clientUserAgent;

  const eventPayload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.eventId,
        action_source: 'website',
        event_source_url: 'https://challenge.mattwebley.com/checkout/success',
        user_data: userData,
        custom_data: {
          currency: data.currency.toUpperCase(),
          value: data.value,
          content_name: data.contentName,
          content_type: 'product',
          content_ids: data.contentIds || [],
        }
      }
    ],
  };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('[Meta CAPI] Purchase event sent:', {
        eventId: data.eventId,
        email: data.email.substring(0, 3) + '***',
        value: data.value,
        currency: data.currency,
        eventsReceived: result.events_received
      });
    } else {
      console.error('[Meta CAPI] Error response:', result);
    }
  } catch (error: any) {
    console.error('[Meta CAPI] Failed to send event:', error.message);
  }
}
