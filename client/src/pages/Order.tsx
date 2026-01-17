import { useState } from "react";
import { ArrowRight, Check, Shield, Lock, CreditCard, ArrowLeft } from "lucide-react";

export default function Order() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'gbp'>('usd');
  const [includePromptPack, setIncludePromptPack] = useState(false);
  const [includeLaunchPack, setIncludeLaunchPack] = useState(false);

  const pricing = {
    usd: { symbol: '$', amount: 399, code: 'USD', promptPack: 49, launchPack: 97 },
    gbp: { symbol: '£', amount: 295, code: 'GBP', promptPack: 39, launchPack: 75 }
  };

  const total = pricing[selectedCurrency].amount
    + (includePromptPack ? pricing[selectedCurrency].promptPack : 0)
    + (includeLaunchPack ? pricing[selectedCurrency].launchPack : 0);

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: selectedCurrency, includePromptPack, includeLaunchPack })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <a href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to info
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Order Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">

            {/* Header */}
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                Step 2 of 2
              </span>
              <h1 className="text-2xl font-bold text-slate-900">Complete Your Order</h1>
            </div>

            {/* What You're Getting */}
            <div>
              <h2 className="font-bold text-slate-900 mb-4 text-lg">You're getting the 21 Day AI SaaS Challenge:</h2>
              <div className="space-y-3">
                {[
                  'Go from zero to working product in 21 days',
                  '28 AI-generated business ideas (personalized to YOU)',
                  'Build without writing a single line of code',
                  'Sales page that converts visitors to customers',
                  'Step-by-step guidance from idea to launch ready',
                  'Full curriculum + daily accountability'
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

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Price Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600">Select currency:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCurrency('usd')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCurrency === 'usd'
                        ? 'bg-white border-2 border-slate-900 text-slate-900'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span>🇺🇸</span> USD
                  </button>
                  <button
                    onClick={() => setSelectedCurrency('gbp')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCurrency === 'gbp'
                        ? 'bg-white border-2 border-slate-900 text-slate-900'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span>🇬🇧</span> GBP
                  </button>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">21 Day AI SaaS Challenge</span>
                  <span className="font-bold text-slate-900">
                    {pricing[selectedCurrency].symbol}{pricing[selectedCurrency].amount}
                  </span>
                </div>
                {includePromptPack && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">AI Prompt Pack</span>
                    <span className="font-bold text-slate-900">
                      {pricing[selectedCurrency].symbol}{pricing[selectedCurrency].promptPack}
                    </span>
                  </div>
                )}
                {includeLaunchPack && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Launch & Marketing Playbook</span>
                    <span className="font-bold text-slate-900">
                      {pricing[selectedCurrency].symbol}{pricing[selectedCurrency].launchPack}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Total Today</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {pricing[selectedCurrency].symbol}{total} {pricing[selectedCurrency].code}
                  </span>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  One-time payment · 12 months access · No recurring fees
                </p>
              </div>
            </div>

            {/* Bump Offer - Prompt Pack */}
            <div
              onClick={() => setIncludePromptPack(!includePromptPack)}
              className={`relative p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                includePromptPack
                  ? 'border-violet-400 bg-violet-50'
                  : 'border-violet-300 bg-violet-50/50 hover:bg-violet-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  includePromptPack
                    ? 'bg-violet-500 border-violet-500'
                    : 'border-slate-300 bg-white'
                }`}>
                  {includePromptPack && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">
                    YES! Add the AI Prompt Pack (73 Advanced Prompts)
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Get instant access to 73 battle-tested AI prompts for every stage of building your SaaS: ideation, development, marketing, sales, and more.
                    <span className="font-bold text-violet-600 ml-1">Just {pricing[selectedCurrency].symbol}{pricing[selectedCurrency].promptPack}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bump Offer - Launch Pack */}
            <div
              onClick={() => setIncludeLaunchPack(!includeLaunchPack)}
              className={`relative p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                includeLaunchPack
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  includeLaunchPack
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-slate-300 bg-white'
                }`}>
                  {includeLaunchPack && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">
                    YES! Add the Launch & Marketing Playbook (68 Strategies)
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    The challenge gets you to a working product. This playbook shows you exactly how to launch it and get paying customers: launch tactics, marketing channels, sales strategies, and growth systems.
                    <span className="font-bold text-amber-600 ml-1">Just {pricing[selectedCurrency].symbol}{pricing[selectedCurrency].launchPack}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-bold text-xl py-5 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {isCheckingOut ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  Complete My Order
                  <ArrowRight className="w-6 h-6 inline ml-2" />
                </>
              )}
            </button>

            {/* Guarantee */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Shield className="w-10 h-10 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900">100% Money-Back Guarantee</p>
                <p className="text-sm text-slate-600">
                  Do the work, get a working product, or your money back. Complete the challenge and don't have a working product? We'll help you fix it. Still can't get you there? Full refund. No questions.
                </p>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-6 text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Powered by Stripe</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Questions? Email matt@mattwebley.com
        </p>
      </main>
    </div>
  );
}
