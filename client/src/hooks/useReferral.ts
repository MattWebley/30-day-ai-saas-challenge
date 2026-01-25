import { useEffect } from "react";
import { useAuth } from "./useAuth";

const REFERRAL_STORAGE_KEY = "referral_code";

// Store referral code from URL params
export function captureReferralCode() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  if (ref) {
    // Store in localStorage so we can use it after authentication
    localStorage.setItem(REFERRAL_STORAGE_KEY, ref);

    // Clean up URL (remove the ref param)
    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());
  }
}

// Track the referral after user authenticates
export function useReferralTracking() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const trackReferral = async () => {
      const storedCode = localStorage.getItem(REFERRAL_STORAGE_KEY);

      if (!storedCode || !isAuthenticated || !user) return;

      try {
        const response = await fetch("/api/referral/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: storedCode }),
          credentials: "include",
        });

        if (response.ok) {
          // Successfully tracked, remove from storage
          localStorage.removeItem(REFERRAL_STORAGE_KEY);
          console.log("Referral tracked successfully");
        } else {
          const data = await response.json();
          // If already referred or invalid code, also remove from storage
          if (data.message === "Already referred by someone" || data.message === "Invalid referral code") {
            localStorage.removeItem(REFERRAL_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Error tracking referral:", error);
      }
    };

    trackReferral();
  }, [isAuthenticated, user]);
}
