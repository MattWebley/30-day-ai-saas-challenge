import { useEffect, useState } from "react";
import { Check, ArrowRight, Sparkles, Calendar, BookOpen, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import confetti from "canvas-confetti";

export default function Welcome() {
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti on load
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Show content after a brief delay
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const firstName = (user as any)?.firstName || "there";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className={`max-w-lg w-full text-center space-y-8 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900">
            You're In, {firstName}!
          </h1>
          <p className="text-xl text-slate-600">
            Welcome to the 21-Day AI SaaS Challenge
          </p>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 text-left space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            What Happens Next
          </h2>
          <div className="space-y-3">
            {[
              { icon: Calendar, text: "Start Day 0 today - it only takes 5 minutes" },
              { icon: BookOpen, text: "Complete one day at a time at your own pace" },
              { icon: Trophy, text: "In 21 days, you'll have a working product" }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-slate-700 pt-1">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 w-full"
        >
          Start Day 0
          <ArrowRight className="w-6 h-6" />
        </a>

        {/* Support Note */}
        <p className="text-sm text-slate-500">
          Questions? Email matt@mattwebley.com
        </p>
      </div>
    </div>
  );
}
