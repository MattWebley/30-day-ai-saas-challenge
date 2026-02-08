import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Zap, Clock, Rocket, TrendingUp, CheckCircle2, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unlock() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // If already unlocked, redirect to dashboard
  const allDaysUnlocked = (user as any)?.allDaysUnlocked;
  const coachingPurchased = (user as any)?.coachingPurchased;
  if (isAuthenticated && (allDaysUnlocked || coachingPurchased)) {
    setLocation('/dashboard');
    return null;
  }

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/checkout/unlock-all-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Checkout failed');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setCheckoutError('Request timed out. Please try again.');
      } else {
        setCheckoutError(error.message || 'Something went wrong. Please try again.');
      }
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back button */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Skip the wait</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            Unlock All 21 Days Instantly
          </h1>
          <p className="text-slate-700 text-lg">
            Stop waiting for the daily drip. Get immediate access to every single day of the challenge and move at your own pace.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Why unlock all days?</h2>
          <div className="space-y-3">
            {[
              { icon: Clock, title: "Work at your own pace", desc: "Binge through the challenge in a weekend or spread it over a month. You're in control." },
              { icon: Rocket, title: "No more waiting", desc: "Every lesson, every exercise, every AI prompt - available right now. No daily drip." },
              { icon: TrendingUp, title: "Get ahead of other challengers", desc: "While others wait for tomorrow's lesson, you'll already be building." },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <benefit.icon className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{benefit.title}</p>
                  <p className="text-slate-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Instant access to all 22 lessons:</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Day 0: Start Here",
              "Days 1-2: Your Winning Idea",
              "Days 3-4: Plan & Name It",
              "Day 5: Logo Design",
              "Days 6-9: Get Set Up",
              "Days 10-18: Build Your MVP",
              "Days 19-21: Launch & Grow",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing card */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6 mb-6">
          {/* Price */}
          <div className="text-center mb-5">
            <div className="text-4xl font-black text-slate-900">
              $29 <span className="text-2xl font-bold text-slate-400">/ £19</span>
            </div>
            <p className="text-slate-600 mt-1">One-time payment. No subscription.</p>
          </div>

          {/* CTA */}
          {isAuthenticated ? (
            <>
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    Unlock All Days Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              {checkoutError && (
                <p className="text-red-600 text-center mt-3">{checkoutError}</p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => setLocation('/login')}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                Log in to unlock
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-slate-600 text-center">
                Already a challenger? Log in to purchase the unlock.
              </p>
            </div>
          )}
        </div>

        {/* FAQ/Reassurance */}
        <div className="text-center text-slate-600 space-y-1">
          <p>Secure payment via Stripe. Instant access after purchase.</p>
          <p>Already bought this at checkout? You're all set - <a href="/dashboard" className="text-primary font-medium hover:underline">go to your dashboard</a>.</p>
        </div>
      </div>
    </div>
  );
}
