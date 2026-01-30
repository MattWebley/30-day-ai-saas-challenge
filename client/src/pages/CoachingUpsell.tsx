import { useState, useMemo, useEffect } from "react";
import { ArrowRight, Check, Video, Calendar, Clock, Users, Zap, Shield, Eye, CheckCircle } from "lucide-react";
import { useTestMode } from "@/contexts/TestModeContext";
import { useAuth } from "@/hooks/useAuth";

export default function CoachingUpsell() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [buttonText, setButtonText] = useState("Yes! Add Coaching to My Order");
  const { testMode } = useTestMode();
  const { user } = useAuth();

  // Check if user already has coaching - redirect to dashboard
  useEffect(() => {
    if ((user as any)?.coachingPurchased && !testMode) {
      window.location.href = '/dashboard';
    }
  }, [user, testMode]);

  // Get currency from URL params, fall back to user's purchase currency
  const currency: 'usd' | 'gbp' = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCurrency = params.get('currency')?.toLowerCase();
    if (urlCurrency === 'usd' || urlCurrency === 'gbp') {
      return urlCurrency;
    }
    // Fall back to user's stored purchase currency
    const userCurrency = (user as any)?.purchaseCurrency?.toLowerCase();
    if (userCurrency === 'usd' || userCurrency === 'gbp') {
      return userCurrency;
    }
    return 'usd';
  }, [user]);

  // Pricing based on currency
  const pricing = {
    usd: { symbol: '$', amount: 1195, originalAmount: 1500, hourlyValue: 299 },
    gbp: { symbol: '£', amount: 995, originalAmount: 1200, hourlyValue: 249 }
  };

  const price = pricing[currency];

  const handleAddToOrder = async () => {
    if (isProcessing || purchaseSuccess) return;
    setIsProcessing(true);
    setButtonText("Processing...");

    try {
      // Try one-click upsell first (uses saved payment method)
      const response = await fetch('/api/upsell/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency })
      });
      const data = await response.json();

      if (data.success) {
        // One-click purchase succeeded!
        setPurchaseSuccess(true);
        setButtonText("Added to Your Order!");
        // Redirect to welcome page after a moment
        setTimeout(() => {
          window.location.href = '/welcome';
        }, 2000);
        return;
      }

      // If one-click failed and requires checkout, fall back to traditional checkout
      if (data.requiresCheckout) {
        setButtonText("Redirecting to checkout...");
        const checkoutResponse = await fetch('/api/checkout/coaching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currency })
        });
        const checkoutData = await checkoutResponse.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
        }
        return;
      }

      // Other error
      console.error('Upsell error:', data.message);
      setButtonText("Yes! Add Coaching to My Order");
      setIsProcessing(false);
    } catch (error) {
      console.error('Checkout error:', error);
      setButtonText("Yes! Add Coaching to My Order");
      setIsProcessing(false);
    }
  };

  const handleNoThanks = () => {
    // Redirect to welcome page
    window.location.href = '/welcome';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Test Mode Banner */}
      {testMode && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          Test Mode: This upsell page is only visible because test mode is ON
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
            Order Complete - One More Thing...
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">

            {/* Headline */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Want Expert Help{" "}
                <span className="text-primary">Building Your SaaS</span>?
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Get 4 x 1-hour sessions with an experienced vibe coding coach who will help you build your product live, on screen, with you.
              </p>
            </div>

            {/* Video Placeholder */}
            <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <p className="text-white/60 text-sm">Video coming soon</p>
              </div>
            </div>

            {/* What You Get */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">What You Get:</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Video,
                    title: "4 x 1-Hour Live Sessions",
                    description: "Direct 1:1 video calls with your dedicated coach"
                  },
                  {
                    icon: Calendar,
                    title: "Flexible Scheduling",
                    description: "Book sessions when it suits you via our calendar"
                  },
                  {
                    icon: Users,
                    title: "Screen Share Building",
                    description: "Your coach builds alongside you, showing every step"
                  },
                  {
                    icon: Zap,
                    title: "Unblock Any Issue",
                    description: "Get unstuck immediately - no more wasted hours"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unlock All Days Bonus */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-900">Bonus: Unlock All 21 Days Instantly</p>
                  <p className="text-slate-600">Skip the daily drip and work through the challenge at your own pace with your coach guiding you.</p>
                </div>
              </div>
            </div>

            {/* Perfect For */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">This is perfect if you...</h3>
              <div className="space-y-3">
                {[
                  "Want an expert looking over your shoulder as you build",
                  "Learn faster by watching someone do it live",
                  "Don't want to waste hours stuck on technical issues",
                  "Want to launch faster with expert guidance",
                  "Prefer hands-on learning over watching videos alone"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Section */}
            <div className="text-center space-y-4 py-4">
              <div>
                <p className="text-slate-500 mb-2">Special One-Time Offer</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl text-slate-400 line-through">{price.symbol}{price.originalAmount.toLocaleString()}</span>
                  <span className="text-5xl font-extrabold text-slate-900">{price.symbol}{price.amount.toLocaleString()}</span>
                </div>
                <p className="text-slate-500 mt-2">4 hours of dedicated 1:1 coaching</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToOrder}
              disabled={isProcessing || purchaseSuccess}
              className={`w-full font-bold text-xl py-5 px-8 rounded-xl shadow-lg transition-all duration-200 ${
                purchaseSuccess
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {purchaseSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  {buttonText}
                </span>
              ) : isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {buttonText}
                </span>
              ) : (
                <>
                  {buttonText}
                  <ArrowRight className="w-6 h-6 inline ml-2" />
                </>
              )}
            </button>

            {/* No Thanks */}
            <button
              onClick={handleNoThanks}
              className="w-full text-slate-500 hover:text-slate-700 text-sm py-3 transition-colors"
            >
              No thanks, I'll figure it out on my own
            </button>

            {/* Guarantee */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Shield className="w-10 h-10 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900">100% Satisfaction Guarantee</p>
                <p className="text-sm text-slate-600">
                  If you're not completely satisfied after your first session, we'll refund you in full. No questions asked.
                </p>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 text-slate-400 pt-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">This offer expires when you leave this page</span>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
