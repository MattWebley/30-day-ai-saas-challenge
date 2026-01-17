import { useState } from "react";
import { ArrowRight, Check, Video, Calendar, Clock, Users, Zap, Shield, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

export default function Coaching() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
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

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Video className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">1:1 Vibe Coding Coaching</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Build Your SaaS With an Expert Coach
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get 4 x 1-hour sessions with an experienced vibe coding coach who will help you build your product live, on screen, with you.
          </p>
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
          </div>

          {/* Right Column - Pricing & CTA */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border-2 border-primary p-6 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Investment</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl text-slate-400 line-through">£1,200</span>
                  <span className="text-4xl font-extrabold text-slate-900">£995</span>
                </div>
                <p className="text-slate-600">4 hours of 1:1 coaching (£249/hour)</p>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/70 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Get Coaching Access
                    <ArrowRight className="w-5 h-5 inline ml-2" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>100% satisfaction guarantee</span>
              </div>
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

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Who are the coaches?",
                a: "Our coaches are experienced developers who have built multiple SaaS products using AI-assisted development (vibe coding). They know the tools inside and out."
              },
              {
                q: "How do I book sessions?",
                a: "After purchase, you'll get access to a calendar where you can book your 4 sessions at times that work for you. Sessions are typically available within a few days."
              },
              {
                q: "What if I can't finish all 4 sessions?",
                a: "Your sessions never expire. You can use them at your own pace over the course of your challenge and beyond."
              },
              {
                q: "What will we work on?",
                a: "Whatever you need! Your coach will help with setup, debugging, building features, understanding AI prompts, deployment - anything that's blocking you."
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
