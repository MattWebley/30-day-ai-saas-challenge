import { useEffect } from "react";
import { useLocation } from "wouter";

export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    // Fire-and-forget — don't block rendering
    fetch("/api/track/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        path: location,
        referrer: document.referrer || null,
      }),
    }).catch(() => {
      // Silently ignore tracking errors
    });
  }, [location]);
}
