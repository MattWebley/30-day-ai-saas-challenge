import { useState } from "react";
import { ArrowRight, Check, Shield, Lock, CreditCard, ArrowLeft, FastForward, Copy } from "lucide-react";
import { useTestMode } from "@/contexts/TestModeContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Order() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [unlockAllDays, setUnlockAllDays] = useState(false);
  const { testMode } = useTestMode();
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'gbp'>('usd');
  const [copiedCode, setCopiedCode] = useState(false);

  const copyPromoCode = async () => {
    await navigator.clipboard.writeText('LAUNCHOFFER');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const pricing = {
    usd: { symbol: '$', amount: 399, code: 'USD' },
    gbp: { symbol: '£', amount: 295, code: 'GBP' }
  };

  const bumpPricing = {
    usd: { symbol: '$', amount: 29 },
    gbp: { symbol: '£', amount: 19 }
  };

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currency: selectedCurrency, unlockAllDays }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const details = errorData.error ? ` (${errorData.error})` : '';
        throw new Error((errorData.message || 'Checkout failed') + details);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (error.name === 'AbortError') {
        setCheckoutError('Request timed out. Please try again.');
      } else {
        setCheckoutError(error.message || 'Something went wrong. Please try again.');
      }
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-amber-400 py-3 px-4 text-center">
        <p className="text-slate-900 font-bold text-sm sm:text-base">
          🚀 Use code <button onClick={copyPromoCode} className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-mono mx-1 hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1">{copiedCode ? <><Check className="w-3 h-3" /> Copied!</> : 'LAUNCHOFFER'}</button> at checkout for 75% off
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to info
          </a>
          <div className="flex flex-col items-center">
            <img
              src="/logo.png?v=3"
              alt="21-Day AI SaaS Challenge"
              className="h-12 w-auto object-contain"
              style={{ imageRendering: 'auto' }}
            />
            <span className="text-xs text-slate-500">by Matt Webley</span>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Main Order Card */}
        <Card className="border-2 border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">

            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-slate-900">You're One Step Away</h1>
              <p className="text-slate-600">Complete your order and start Day 1 immediately</p>
            </div>

            {/* What You're Getting */}
            <div className="space-y-4">
              <h2 className="font-bold text-slate-900 text-lg">Here's what you're getting:</h2>
              <div className="space-y-3">
                {[
                  'The complete 21-Day Challenge with daily tasks',
                  'AI-generated SaaS ideas personalized for YOU',
                  'Copy-paste prompts that do the heavy lifting',
                  'AI Mentor to help when you get stuck',
                  'Progress tracking with badges and streaks',
                  '6 months access to complete at your pace'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Select currency:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCurrency('usd')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCurrency === 'usd'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  USD
                </button>
                <button
                  onClick={() => setSelectedCurrency('gbp')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCurrency === 'gbp'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  GBP
                </button>
              </div>
            </div>

            {/* Bump Offer */}
            <button
              onClick={() => setUnlockAllDays(!unlockAllDays)}
              className={`w-full text-left rounded-xl p-5 border-2 transition-all ${
                unlockAllDays
                  ? 'border-primary bg-primary/5'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                  unlockAllDays ? 'bg-primary border-primary' : 'border-slate-300 bg-white'
                }`}>
                  {unlockAllDays && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    YES! Unlock all 21 days instantly{' '}
                    <span className="text-primary">+{bumpPricing[selectedCurrency].symbol}{bumpPricing[selectedCurrency].amount}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Skip the daily drip and work through the entire challenge at your own pace. Perfect if you want to move fast.
                  </p>
                </div>
              </div>
            </button>

            {/* Order Summary */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">21-Day AI SaaS Challenge</span>
                <span className="font-bold text-slate-900">
                  {pricing[selectedCurrency].symbol}{pricing[selectedCurrency].amount}
                </span>
              </div>
              {unlockAllDays && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Unlock All Days</span>
                  <span className="font-bold text-slate-900">
                    {bumpPricing[selectedCurrency].symbol}{bumpPricing[selectedCurrency].amount}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="text-3xl font-black text-slate-900">
                  {pricing[selectedCurrency].symbol}{pricing[selectedCurrency].amount + (unlockAllDays ? bumpPricing[selectedCurrency].amount : 0)}
                </span>
              </div>
              <p className="text-sm text-slate-500 text-center">
                One-time payment. 6 months access. No subscriptions.
              </p>
            </div>

            {/* Coupon Code */}
            <div className="bg-amber-400 rounded-lg p-4 text-center space-y-1">
              <p className="text-slate-900 font-bold">
                🚀 Use code <button onClick={copyPromoCode} className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-mono mx-1 hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1">{copiedCode ? <><Check className="w-3 h-3" /> Copied!</> : 'LAUNCHOFFER'}</button> for 75% off
              </p>
              <p className="text-slate-800 text-sm">
                Enter the code on the next screen
              </p>
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                {checkoutError}
              </div>
            )}

            {/* CTA Button */}
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              size="lg"
              className="w-full h-14 text-lg font-bold"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Test Mode Skip */}
            {testMode && (
              <a
                href="/coaching/upsell"
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                <FastForward className="w-5 h-5" />
                Test Mode: Skip to Upsell
              </a>
            )}

            {/* Guarantee */}
            <div className="flex items-start gap-4 p-5 bg-slate-50 border-2 border-slate-200 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Zero Risk Guarantee</p>
                <p className="text-slate-600 mt-1">
                  Complete the challenge and don't have a working product? We'll help you fix it. Still stuck? Full refund. You literally can't lose.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-center gap-8">
                {/* SSL Badge - Shield Shape */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Shield className="w-14 h-16 text-slate-300 fill-slate-100" />
                    <Lock className="w-6 h-6 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-700 font-bold">SSL Secure</div>
                    <div className="text-[10px] text-slate-400">256-bit Encryption</div>
                  </div>
                </div>
                {/* Stripe Badge - Shield Shape */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Shield className="w-14 h-16 text-slate-300 fill-slate-100" />
                    <CreditCard className="w-6 h-6 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-700 font-bold">Secure Payments</div>
                    <div className="text-[10px] text-slate-400">Powered by Stripe</div>
                  </div>
                </div>
                {/* Money Back Badge - Shield Shape */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Shield className="w-14 h-16 text-slate-300 fill-slate-100" />
                    <Check className="w-6 h-6 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-700 font-bold">Money Back</div>
                    <div className="text-[10px] text-slate-400">Guarantee</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Card>

        {/* Reassurance */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-slate-600">
            Questions? Email <a href="mailto:matt@mattwebley.com" className="text-primary font-medium hover:underline">matt@mattwebley.com</a>
          </p>
          <p className="text-slate-500 text-sm">
            Instant access. Start Day 1 immediately after purchase.
          </p>
        </div>
      </main>
    </div>
  );
}
