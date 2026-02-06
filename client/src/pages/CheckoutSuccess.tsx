import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Check, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("Processing your order...");
  const { isAuthenticated, isLoading, user } = useAuth();

  // Check for admin preview mode
  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get('preview') === 'true' && (user as any)?.isAdmin;

  useEffect(() => {
    // If preview mode, don't process or redirect
    if (isPreview) return;

    // Wait for auth to finish loading before making decisions
    if (isLoading) return;

    const processCheckout = async () => {
      // Get URL params to check what was purchased
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      const currency = params.get('currency') || 'usd';

      // If there's a session_id, this is coming from main challenge checkout
      if (sessionId) {
        // Track purchase with Meta Pixel
        if (window.fbq) {
          window.fbq('track', 'Purchase', {
            value: currency === 'gbp' ? 295 : 399,
            currency: currency.toUpperCase(),
            content_name: '21-Day AI SaaS Challenge',
            content_type: 'product'
          });
        }

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
        setLocation(isAuthenticated ? '/dashboard' : '/login');
      }
    };

    processCheckout();
  }, [setLocation, isAuthenticated, isLoading, isPreview]);

  // Preview mode for admins
  if (isPreview) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium">
            Admin Preview Mode
          </div>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Order Complete!</h1>
            <p className="text-slate-600">
              This is a processing page. Normally it saves the Stripe session and redirects to the coaching upsell.
            </p>
          </div>
          <div className="pt-4 space-y-3">
            <a href="/coaching/upsell?preview=true" className="block">
              <button className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                Preview Coaching Upsell <ArrowRight className="w-4 h-4" />
              </button>
            </a>
            <a href="/welcome?preview=true" className="block">
              <button className="w-full bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-lg">
                Preview Welcome Page
              </button>
            </a>
          </div>
        </div>
      </div>
    );
  }

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
