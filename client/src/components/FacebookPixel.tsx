import { useEffect } from "react";
import { hasMarketingConsent } from "./CookieConsent";

// Replace with your Facebook Pixel ID when you have one
const FACEBOOK_PIXEL_ID = "";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export function FacebookPixel() {
  useEffect(() => {
    // Don't load if no Pixel ID configured
    if (!FACEBOOK_PIXEL_ID) return;

    // Don't load if user hasn't consented to marketing cookies
    if (!hasMarketingConsent()) return;

    // Don't load twice
    if (window.fbq) return;

    // Facebook Pixel base code
    const f = window;
    const b = document;
    const e = "script";
    const n = function () {
      // @ts-ignore
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    } as any;

    if (!f.fbq) f.fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";

    const s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);

    // Initialize pixel (use n directly since we just assigned it)
    n("init", FACEBOOK_PIXEL_ID);
    n("track", "PageView");

  }, []);

  // Don't render noscript fallback if no consent or no pixel ID
  if (!FACEBOOK_PIXEL_ID || !hasMarketingConsent()) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}

// Helper to track custom events (use after user actions)
export function trackFacebookEvent(eventName: string, params?: Record<string, any>) {
  if (!FACEBOOK_PIXEL_ID || !hasMarketingConsent() || !window.fbq) return;
  window.fbq("track", eventName, params);
}

// Common events you might want to track:
// trackFacebookEvent("Purchase", { value: 97, currency: "USD" });
// trackFacebookEvent("Lead");
// trackFacebookEvent("CompleteRegistration");
// trackFacebookEvent("InitiateCheckout");
