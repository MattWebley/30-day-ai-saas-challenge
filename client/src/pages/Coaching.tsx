import { useState, useEffect } from "react";
import { ArrowRight, Check, Video, Calendar, Clock, Users, Zap, Shield, Star } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";

export default function Coaching() {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"gbp" | "usd">("gbp");
  const { user } = useAuth();

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
    single: { gbp: 349, usd: 449 },
    pack: { gbp: 995, usd: 1195 },
    packOriginal: { gbp: 1396, usd: 1796 },
    perHour: { gbp: 249, usd: 299 },
    savings: { gbp: 401, usd: 601 },
    mattSingle: { gbp: 1995, usd: 2495 },
    matt: { gbp: 3995, usd: 4995 },
    mattOriginal: { gbp: 7980, usd: 9980 }
  };

  const currencySymbol = currency === "gbp" ? "£" : "$";

  const handlePurchase = async (type: "single" | "pack" | "matt-single" | "matt") => {
    if (isProcessing) return;
    setIsProcessing(type);
    try {
      const endpoints: Record<string, string> = {
        "single": "/api/checkout/coaching-single",
        "pack": "/api/checkout/coaching",
        "matt-single": "/api/checkout/coaching-matt-single",
        "matt": "/api/checkout/coaching-matt"
      };
      const endpoint = endpoints[type];
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(null);
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

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Video className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">1:1 Vibe Coding Coaching</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Build Your SaaS With 1:1 Expert Coaching
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Work directly with an expert coach personally trained by Matt Webley. They'll build your product live, on screen, with you.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-amber-800">Trained & certified by Matt Webley himself</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Left Column - What You Get */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">What's Included:</h2>
              <div className="space-y-4">
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
                  <div key={i} className="flex items-start gap-3">
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

            {/* Coach Capabilities */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Your Coach Can Help With:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  "Claude Code setup",
                  "Debugging errors",
                  "Building features",
                  "Prompting Claude",
                  "API integrations",
                  "Auth & payments",
                  "Deployment",
                  "UI/UX polish"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Perfect for you if...</h3>
              <div className="space-y-3">
                {[
                  "You want an expert looking over your shoulder as you build",
                  "You learn faster by watching someone do it live",
                  "You don't want to waste hours stuck on technical issues",
                  "You want to launch faster with expert guidance",
                  "You prefer hands-on learning over watching videos alone"
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

            {/* Coach Credibility */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
              <p className="text-slate-700 text-sm leading-relaxed">
                <strong className="text-slate-900">Our coaches have built real products.</strong> They've shipped apps, integrated payments, set up auth systems, and solved the exact problems you'll face. They're not just watching tutorials - they've done it for real.
              </p>
            </div>
          </div>

          {/* Right Column - Pricing & CTA */}
          <div className="space-y-6">
            {/* Single Session Option */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Single Session</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">{currencySymbol}{prices.single[currency]}</span>
                </div>
                <p className="text-slate-600">1 hour of focused 1:1 coaching</p>
              </div>

              <button
                onClick={() => handlePurchase("single")}
                disabled={isProcessing !== null}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                {isProcessing === "single" ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>Book Single Session</>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Perfect for a quick unblock or specific question
              </p>
              <p className="text-center text-xs text-slate-400">
                Unlocks booking calendar immediately after purchase
              </p>
            </div>

            {/* 4-Pack Option - Best Value */}
            <div className="bg-white rounded-2xl border-2 border-primary p-6 space-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wide">
                Best Value - Save {currencySymbol}{prices.savings[currency]}
              </div>
              <div className="text-center space-y-2 pt-2">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">4-Session Pack</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl text-slate-400 line-through">{currencySymbol}{prices.packOriginal[currency].toLocaleString()}</span>
                  <span className="text-4xl font-extrabold text-slate-900">{currencySymbol}{prices.pack[currency].toLocaleString()}</span>
                </div>
                <p className="text-slate-600">4 hours of dedicated 1:1 coaching</p>
              </div>

              {/* Unlock All Days Bonus */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Bonus: Unlock All 21 Days Instantly</p>
                    <p className="text-sm text-slate-600">Skip the drip - work at your own pace with your coach</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePurchase("pack")}
                disabled={isProcessing !== null}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/70 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isProcessing === "pack" ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Get 4-Session Pack
                    <ArrowRight className="w-5 h-5 inline ml-2" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>100% satisfaction guarantee</span>
              </div>
              <p className="text-center text-xs text-slate-400">
                Unlocks booking calendar immediately after purchase
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-bold text-slate-900">How It Works:</h3>
              <ol className="space-y-4">
                {[
                  "Complete your purchase to unlock coaching access",
                  "Get access to the booking calendar immediately",
                  "Schedule your 4 sessions at times that work for you",
                  "Join video calls and build with your coach live"
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {i + 1}
                    </div>
                    <span className="text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Guarantee */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Shield className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-sm">Satisfaction Guarantee</p>
                <p className="text-xs text-slate-600">
                  If you're not satisfied after your first session, we'll refund you in full.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work With Matt Directly */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-amber-400 font-medium text-sm uppercase tracking-wide">Work With a $23M+ Entrepreneur</span>
            </div>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <img
                src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                alt="Matt Webley"
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                  Want to Work Directly With Matt Webley?
                </h2>
                <p className="text-slate-300 text-lg">
                  Building an app is one thing. Building something you can <strong className="text-white">actually sell</strong> is another. Work with Matt through the challenge and make the key decisions now that set you up for revenue later.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <h3 className="font-bold text-white">What you get:</h3>
                {[
                  "4 x 1-hour sessions directly with Matt",
                  "Pricing strategy - what to charge & how",
                  "Positioning & go-to-market advice",
                  "Business model feedback (not just code)",
                  "Unlock all 21 days instantly"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-white">Perfect for:</h3>
                {[
                  "Those who need help choosing the right niche & SaaS idea",
                  "Builders who want to make real money",
                  "Those building a business, not a side project",
                  "People who need help with pricing & positioning"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Single Session with Matt */}
              <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Single Session</p>
                <span className="text-3xl font-extrabold text-white">{currencySymbol}{prices.mattSingle[currency].toLocaleString()}</span>
                <p className="text-slate-400 text-sm mt-1 mb-4">1 hour with Matt + unlock all days</p>
                <button
                  onClick={() => handlePurchase("matt-single")}
                  disabled={isProcessing !== null}
                  className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isProcessing === "matt-single" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Book Single Session</>
                  )}
                </button>
              </div>

              {/* 4-Pack with Matt - Best Value */}
              <div className="bg-white rounded-xl p-5 relative">
                <div className="absolute -top-2 right-4 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full uppercase">
                  50% Off
                </div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">4-Session Pack</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-slate-400 line-through">{currencySymbol}{prices.mattOriginal[currency].toLocaleString()}</span>
                  <span className="text-3xl font-extrabold text-slate-900">{currencySymbol}{prices.matt[currency].toLocaleString()}</span>
                </div>
                <p className="text-slate-500 text-sm mt-1 mb-4">4 hours with Matt + unlock all days</p>
                <button
                  onClick={() => handlePurchase("matt")}
                  disabled={isProcessing !== null}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isProcessing === "matt" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get 4-Pack
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-slate-300 text-xs mt-3 text-center">
              Unlocks Matt's personal calendar immediately after purchase
            </p>

            <p className="text-slate-400 text-sm mt-4">
              Not sure which option is right? The coached sessions are incredible value for building your product. Matt's option is for those who want business strategy from someone who's generated over $23 million online across 20+ years of building and selling.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Who is my coach?",
                a: "Your coach is UK-based and personally trained and certified by Matt Webley. They've built multiple SaaS products using the exact vibe coding methods taught in this challenge and know the tools inside and out."
              },
              {
                q: "How do I book sessions?",
                a: "After purchase, you'll get access to a calendar where you can book your session(s) at times that work for you. Sessions are typically available within a few days."
              },
              {
                q: "What's the difference between single and 4-pack?",
                a: `Single sessions (${currencySymbol}${prices.single[currency]}) are perfect for a quick unblock or specific question. The 4-pack (${currencySymbol}${prices.pack[currency]}) saves you ${currencySymbol}${prices.savings[currency]} and gives you ongoing support throughout your build - most people find they want multiple sessions.`
              },
              {
                q: "What will we work on?",
                a: "Whatever you need! Your coach will help with setup, debugging, building features, understanding AI prompts, deployment - anything that's blocking you from launching."
              }
            ].map((faq, i) => (
              <div key={i} className="space-y-2">
                <p className="font-bold text-slate-900">{faq.q}</p>
                <p className="text-slate-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <p className="text-center text-slate-500 text-sm">
          Questions? Email matt@mattwebley.com
        </p>

      </div>
    </Layout>
  );
}
