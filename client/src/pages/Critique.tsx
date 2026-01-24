import { useState, useEffect } from "react";
import { ArrowRight, Check, Video, Shield, Lock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useStats";

export default function Critique() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currency, setCurrency] = useState<"gbp" | "usd">("gbp");
  const [includeHeadlines, setIncludeHeadlines] = useState(false);
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
    critique: { gbp: 495, usd: 595 },
    critiqueHeadlines: { gbp: 95, usd: 97 }
  };

  const currencySymbol = currency === "gbp" ? "£" : "$";

  const handlePurchase = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout/critique", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, includeHeadlines })
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
    <Layout currentDay={0}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Currency Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setCurrency("usd")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currency === "usd"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🇺🇸</span> USD
            </button>
            <button
              onClick={() => setCurrency("gbp")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currency === "gbp"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🇬🇧</span> GBP
            </button>
          </div>
        </div>

        {hasReachedLaunchPhase ? (
          <>
            {/* Training Included Notice */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-900">Sales Page Training Already Included</p>
                  <p className="text-green-800 text-sm mt-1">
                    The full sales page training, structure, and prompts are included FREE in Day 19 of your challenge. This critique is an <strong>optional upgrade</strong> - get personal feedback on YOUR sales page from someone who's generated $23M+ in sales.
                  </p>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                <Video className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-700">Optional Upgrade</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                Get Your Sales Page Reviewed by an 8-Figure Copywriter
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                You've got the training. Now get personal feedback. I'll record a video walking through YOUR sales page, showing you exactly what to change to convert more visitors into customers.
              </p>
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* Left Column - What You Get */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">What You Get:</h2>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Up to 15 Minutes of Video Feedback",
                        description: "I'll screen-record my honest thoughts as I go through your page"
                      },
                      {
                        title: "Headline Analysis",
                        description: "Is your headline grabbing attention? I'll tell you exactly what's working and what's not"
                      },
                      {
                        title: "Copy & Structure Review",
                        description: "Where are people dropping off? What's confusing? What needs to change?"
                      },
                      {
                        title: "Actionable Suggestions",
                        description: "Not vague advice - specific changes you can implement immediately"
                      }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Perfect for you if...</h3>
                  <div className="space-y-3">
                    {[
                      "You've built your sales page but aren't sure if it converts",
                      "You want honest feedback from someone who knows what converts",
                      "You'd rather get it right now than guess and lose sales",
                      "You want specific, actionable changes - not vague advice"
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

                {/* About Matt */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-start gap-4">
                    <img
                      src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                      alt="Matt Webley"
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Matt Webley</p>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        I specialize in boosting conversion rates. $23 million+ generated online, $12 million from SaaS alone. I'm not going to sugarcoat it - I'll tell you exactly what needs to change.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Pricing & CTA */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Video Critique</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-extrabold text-slate-900">{currencySymbol}{prices.critique[currency]}</span>
                    </div>
                    <p className="text-slate-600">Up to 15 minutes of detailed feedback</p>
                  </div>

                  {/* Bump Offer */}
                  <label className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg cursor-pointer hover:border-amber-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeHeadlines}
                      onChange={(e) => setIncludeHeadlines(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        ADD: 5 Headlines Written By Me
                        <span className="ml-2 text-amber-600">+{currencySymbol}{prices.critiqueHeadlines[currency]}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        I'll write 5 headline variations for you to test - based on what I see converts best
                      </p>
                    </div>
                  </label>

                  <div className="text-center py-2">
                    <p className="text-slate-900 font-bold text-lg">
                      Total: {currencySymbol}{includeHeadlines
                        ? prices.critique[currency] + prices.critiqueHeadlines[currency]
                        : prices.critique[currency]
                      }
                    </p>
                  </div>

                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        Get My Video Critique
                        <ArrowRight className="w-5 h-5 inline ml-2" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Delivered within 5 business days</span>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="font-bold text-slate-900">How It Works:</h3>
                  <ol className="space-y-4">
                    {[
                      "Complete your purchase",
                      "You'll receive a form to submit your sales page URL",
                      "I'll record a screen share video reviewing your page",
                      "You'll get the video within 5 business days"
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                          {i + 1}
                        </div>
                        <span className="text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* What I'll Cover */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">What I'll Cover:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      "Headline strength",
                      "Opening hook",
                      "Benefit clarity",
                      "Social proof",
                      "Call to action",
                      "Price presentation",
                      "Objection handling",
                      "Overall flow"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Locked State */
          <div className="max-w-xl mx-auto">
            <div className="bg-slate-100 rounded-2xl p-12 border-2 border-slate-200 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-slate-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-500 mb-3">
                Sales Page Video Critique
              </h1>
              <p className="text-slate-400 text-lg mb-6">
                This option unlocks when you reach the Launch phase (Day 19).
              </p>
              <p className="text-slate-500">
                Build your sales page first, then get expert feedback from an 8-figure copywriter.
              </p>
            </div>
          </div>
        )}

        {/* Questions */}
        <p className="text-center text-slate-500 text-sm">
          Questions? Email matt@mattwebley.com
        </p>

      </div>
    </Layout>
  );
}
