import { useState } from "react";
import { ArrowRight, Check, Shield, Lock, CreditCard, ArrowLeft } from "lucide-react";

export default function Order() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'gbp'>('usd');

  const pricing = {
    usd: { symbol: '$', amount: 399, code: 'USD' },
    gbp: { symbol: '£', amount: 295, code: 'GBP' }
  };

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: selectedCurrency })
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
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Total Today</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {pricing[selectedCurrency].symbol}{pricing[selectedCurrency].amount} {pricing[selectedCurrency].code}
                  </span>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  One-time payment · 12 months access · No recurring fees
                </p>
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
                <p className="font-bold text-slate-900 text-sm">Do The Work, Get a Working Product - Or Your Money Back</p>
                <p className="text-sm text-slate-600">
                  Complete the challenge and don't have a working product? We'll help you fix it. Still can't get you there? Full refund. No questions.
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
