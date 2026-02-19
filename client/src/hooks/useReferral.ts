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

// Fire the referral tracking API call directly (used by CheckoutSuccess after account creation)
export async function trackReferralNow(): Promise<boolean> {
  const storedCode = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!storedCode) return false;

  try {
    const response = await fetch("/api/referral/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: storedCode }),
      credentials: "include",
    });

    if (response.ok) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      console.log("Referral tracked successfully");
      return true;
    } else {
      const data = await response.json();
      if (data.message === "Already referred by someone" || data.message === "Invalid referral code") {
        localStorage.removeItem(REFERRAL_STORAGE_KEY);
      }
      return false;
    }
  } catch (error) {
    console.error("Error tracking referral:", error);
    return false;
  }
}

// Track the referral after user authenticates (with retry)
export function useReferralTracking() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const storedCode = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!storedCode) return;

    // Try up to 3 times with increasing delays (1s, 3s, 6s)
    let attempt = 0;
    const maxAttempts = 3;

    const tryTrack = async () => {
      attempt++;
      const success = await trackReferralNow();
      if (!success && attempt < maxAttempts) {
        setTimeout(tryTrack, attempt * 2000);
      }
    };

    // Small initial delay to let session fully establish
    setTimeout(tryTrack, 1000);
  }, [isAuthenticated, user]);
}
