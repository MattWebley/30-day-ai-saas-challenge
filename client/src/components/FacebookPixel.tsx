/**
 * Facebook Pixel Utility
 *
 * The pixel base code is loaded in index.html (loads fast, before React hydrates).
 * This module provides helpers for tracking custom conversion events
 * with event_id support for server-side CAPI deduplication.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Generate a unique event ID for deduplication between client-side pixel
 * and server-side Conversions API. For Purchase events, prefer using
 * the Stripe session ID instead (both client and server have access to it).
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Track a Facebook Pixel event with optional event_id for CAPI deduplication.
 *
 * @param eventName - Standard or custom event name (e.g. 'Purchase', 'ViewContent')
 * @param params - Event parameters (value, currency, content_name, etc.)
 * @param eventId - Unique ID for deduplication with server-side events
 */
export function trackFacebookEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
) {
  if (!window.fbq) return;

  if (eventId) {
    window.fbq('track', eventName, params || {}, { eventID: eventId });
  } else {
    window.fbq('track', eventName, params || {});
  }
}

// Kept as a no-op component since it's imported in App.tsx.
// The actual pixel loads via the <script> tag in index.html.
export function FacebookPixel() {
  return null;
}
