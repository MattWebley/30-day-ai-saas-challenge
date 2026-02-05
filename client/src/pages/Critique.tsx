import { useState, useEffect } from "react";
import { ArrowRight, Check, Shield, Lock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useStats";

export default function Critique() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currency, setCurrency] = useState<"gbp" | "usd">("gbp");
  const [conversionBoost, setConversionBoost] = useState(1); // percentage points increase
  const { user } = useAuth();
  const { stats } = useUserStats();

  // Check if user has reached Launch phase (Day 19+)
  const lastCompletedDay = (stats as any)?.lastCompletedDay ?? -1;
  const hasReachedLaunchPhase = lastCompletedDay >= 18; // Completed Day 18 = on Day 19

  // Set default currency based on user's purchase currency
  useEffect(() => {
    if ((user as any)?.purchaseCurrency) {
      const userCurrency = (user as any).purchaseCurrency.toLowerCase();
      if (userCurrency === 'usd' || userCurrency === 'gbp') {
        setCurrency(userCurrency);
      }
    }
  }, [user]);

  const prices = {
    critique: { gbp: 495, usd: 595 }
  };

  const currencySymbol = currency === "gbp" ? "£" : "$";

  const handlePurchase = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout/critique", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currency })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Announcement Bar - fixed at very top, above everything */}
      <div className="fixed top-0 left-0 right-0 bg-amber-400 py-3 px-4 text-center z-50">
        <p className="text-slate-900 font-bold">
          🚀 Use code <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-mono mx-1">LAUNCHOFFER</span> at checkout for 75% off
        </p>
      </div>

      <Layout currentDay={0}>
        <div className="pt-10" /> {/* Spacer for fixed announcement bar */}
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {hasReachedLaunchPhase ? (
          <>
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <img
                src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                alt="Matt Webley"
                className="w-24 h-24 rounded-full object-cover mx-auto"
                loading="lazy"
              />

              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Get Your Sales Page Reviewed
                </h1>
                <p className="text-lg text-slate-700">
                  You've built the page. Now let me tear it apart BEFORE you start sending traffic. I'll screen-record myself going through YOUR sales page and tell you EXACTLY what to fix. No fluff. No "nice work!" Just what needs to change so your first visitors actually buy.
                </p>
              </div>

              <p className="text-slate-600">
                <span className="font-bold text-slate-900">$23M+ in sales.</span> I know what converts and what doesn't.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* What You Get */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Here's what happens:</h2>
              <div className="space-y-3">
                {[
                  "I record my screen. I go through your page. You watch over my shoulder.",
                  "I tell you if your headline makes me want to keep reading or bounce.",
                  "I show you where I'd lose interest, what's confusing, and what's missing.",
                  "You get a list of EXACTLY what to fix. Then you fix it. Then you launch."
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">How it works:</h2>
              <div className="space-y-3">
                {[
                  "Complete your purchase",
                  "Submit your sales page URL via the form you'll receive",
                  "I'll record a video reviewing your page",
                  "You'll get the video within 5 business days"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {i + 1}
                    </div>
                    <span className="text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Calculator */}
            {(() => {
              const baseConversion = 2; // 2% baseline
              const monthlyVisitors = 500;
              const monthlyPrice = currency === "gbp" ? 29 : 39; // SaaS monthly subscription
              const avgCustomerLifetime = 8; // months

              const extraCustomersPerMonth = Math.round(monthlyVisitors * (conversionBoost / 100));

              // After 12 months of acquiring extra customers who each pay monthly
              // Month 1: extraCustomers * monthlyPrice
              // Month 2: (extraCustomers * 2) * monthlyPrice (first batch still paying + new batch)
              // This compounds! But we'll simplify with LTV
              const extraCustomersYear1 = extraCustomersPerMonth * 12;
              const ltvPerCustomer = monthlyPrice * avgCustomerLifetime;
              const extraRevenueYear1 = extraCustomersYear1 * ltvPerCustomer;

              return (
                <Card className="p-6 border-2 border-slate-200 bg-slate-50 space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-slate-900">SaaS compounds. Small changes = big money.</h2>
                    <p className="text-slate-600">
                      Every extra subscriber pays you EVERY month. A tiny conversion bump snowballs fast.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Conversion rate improvement:</span>
                      <span className="text-xl font-bold text-primary">+{conversionBoost}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.5"
                      value={conversionBoost}
                      onChange={(e) => setConversionBoost(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>+0.5%</span>
                      <span>+3%</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
                    <p className="text-sm text-slate-500 text-center">
                      {monthlyVisitors} visitors/month • {currencySymbol}{monthlyPrice}/month subscription • {avgCustomerLifetime} month avg. lifetime
                    </p>

                    <div className="text-center space-y-1">
                      <p className="text-slate-600">
                        +{conversionBoost}% conversion = <span className="font-bold text-slate-900">{extraCustomersPerMonth} extra subscribers/month</span>
                      </p>
                      <p className="text-slate-600">
                        Each one worth <span className="font-bold text-slate-900">{currencySymbol}{ltvPerCustomer}</span> over their lifetime
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-center">
                      <p className="text-2xl font-black text-primary">
                        {currencySymbol}{extraRevenueYear1.toLocaleString()}
                      </p>
                      <p className="text-slate-600">
                        extra revenue in year one
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-700 text-center font-medium">
                    I've seen single headline changes double conversion rates. What do you think an 8-figure copywriter might spot on YOUR page?
                  </p>

                  <p className="text-xs text-slate-400 text-center">
                    *Illustrative example only. Your results will vary.
                  </p>
                </Card>
              );
            })()}

            {/* Price & CTA */}
            <Card className="p-6 border-2 border-slate-200 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-4xl font-black text-slate-900">{currencySymbol}{prices.critique[currency]}</span>
                <p className="text-slate-500">One-time payment</p>
              </div>

              {/* Currency Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setCurrency("usd")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      currency === "usd"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setCurrency("gbp")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      currency === "gbp"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    GBP
                  </button>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                size="lg"
                className="w-full h-14 text-lg font-bold"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Get My Video Critique
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>Delivered within 5 business days</span>
              </div>

              {/* Test Button - Remove before launch */}
              {(user as any)?.isAdmin && (
                <button
                  onClick={() => window.location.href = '/critique/success'}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  [Admin] Skip to success page (test)
                </button>
              )}
            </Card>
          </>
        ) : (
          /* Locked State */
          <Card className="p-12 border-2 border-slate-200 bg-slate-50 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-500 mb-3">
              Sales Page Video Critique
            </h1>
            <p className="text-slate-400 text-lg mb-6">
              This unlocks when you reach Day 19.
            </p>
            <p className="text-slate-500">
              Build your sales page first, then get expert feedback.
            </p>
          </Card>
        )}

        {/* Questions */}
        <p className="text-center text-slate-400 text-sm">
          Questions? Email matt@mattwebley.com
        </p>

        </div>
      </Layout>
    </>
  );
}
