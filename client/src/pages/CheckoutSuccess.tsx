import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("Processing your order...");
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading before making decisions
    if (isLoading) return;

    const processCheckout = async () => {
      // Get URL params to check what was purchased
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      const currency = params.get('currency') || 'usd';

      // If there's a session_id, this is coming from main challenge checkout
      if (sessionId) {
        try {
          // Save the Stripe customer ID for one-click upsells
          setStatus("Saving your payment details...");
          const response = await fetch('/api/checkout/process-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ sessionId })
          });

          const data = await response.json();
          console.log('[CheckoutSuccess] Process result:', data);

          if (data.success) {
            setStatus("Payment details saved! Redirecting...");
            // Small delay to ensure session cookie is fully processed by browser
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error('Error processing checkout:', error);
          // Continue anyway - the upsell will just use traditional checkout
        }

        // Redirect to coaching upsell page with currency
        setLocation(`/coaching/upsell?currency=${currency}`);
      } else {
        // Otherwise redirect to dashboard (or login if not authenticated)
        setLocation(isAuthenticated ? '/dashboard' : '/api/login');
      }
    };

    processCheckout();
  }, [setLocation, isAuthenticated, isLoading]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium">{status}</p>
      </div>
    </div>
  );
}
