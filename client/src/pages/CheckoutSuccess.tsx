import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("Processing your order...");

  useEffect(() => {
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
          await fetch('/api/checkout/process-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ sessionId })
          });
        } catch (error) {
          console.error('Error processing checkout:', error);
          // Continue anyway - the upsell will just use traditional checkout
        }

        // Redirect to coaching upsell page with currency
        setLocation(`/coaching/upsell?currency=${currency}`);
      } else {
        // Otherwise redirect to dashboard
        setLocation('/dashboard');
      }
    };

    processCheckout();
  }, [setLocation]);

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
