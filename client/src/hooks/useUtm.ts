/**
 * Traffic Source Tracking
 *
 * Captures where visitors came from so you can see which ads/campaigns
 * drive purchases. Works automatically - just put any params on your ad URL:
 *
 *   https://challenge.mattwebley.com/?campaign=cold_uk
 *   https://challenge.mattwebley.com/?utm_source=facebook&utm_campaign=test1
 *   https://challenge.mattwebley.com/?fb=video_ad_v2
 *
 * It captures:
 *   - The full landing URL (with whatever params you used)
 *   - The referrer (facebook.com, google.com, etc.)
 *   - Any UTM params (for structured reporting)
 */

const TRAFFIC_STORAGE_KEY = "traffic_source";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export interface TrafficSource {
  landingUrl: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/** Capture traffic source on landing. Call once on app load. */
export function captureUtmParams() {
  if (typeof window === "undefined") return;

  // Only capture on first visit - don't overwrite if already stored
  if (localStorage.getItem(TRAFFIC_STORAGE_KEY)) return;

  const url = window.location.href;
  const referrer = document.referrer || "";

  // Only store if there's something useful (has query params or external referrer)
  const hasParams = window.location.search.length > 1;
  const hasReferrer = referrer && !referrer.includes(window.location.hostname);

  if (!hasParams && !hasReferrer) return;

  const data: TrafficSource = {
    landingUrl: url,
    referrer,
  };

  // Also parse out UTM params for structured reporting
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_PARAMS) {
    const value = params.get(key);
    if (value) {
      data[key as keyof TrafficSource] = value;
    }
  }

  localStorage.setItem(TRAFFIC_STORAGE_KEY, JSON.stringify(data));
}

/** Get stored traffic source data */
export function getStoredUtmData(): TrafficSource | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(TRAFFIC_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
