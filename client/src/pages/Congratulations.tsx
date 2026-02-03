import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowUpRight, PartyPopper, Calendar } from "lucide-react";
import { ds } from "@/lib/design-system";

export default function Congratulations() {
  const [, setLocation] = useLocation();

  // Check for admin preview mode
  const params = new URLSearchParams(window.location.search);
  const isPreviewParam = params.get('preview') === 'true';

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const isPreview = isPreviewParam && (user as any)?.isAdmin;

  // Redirect if not logged in or hasn't completed the challenge (skip in preview mode)
  useEffect(() => {
    if (user === null && !isPreviewParam) {
      setLocation("/");
    }
  }, [user, setLocation, isPreviewParam]);

  const completedDays = Array.isArray(progress) ? progress.filter((p: any) => p.completed)?.length : 0;
  const hasCompletedChallenge = completedDays >= 21;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Preview Mode Banner */}
      {isPreview && (
        <div className="bg-purple-600 text-white text-center py-2 px-4 text-sm font-medium">
          Admin Preview Mode
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Confetti/Celebration Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-4">
            <PartyPopper className="w-10 h-10 text-amber-500" />
            <Trophy className="w-12 h-12 text-yellow-500" />
            <PartyPopper className="w-10 h-10 text-amber-500 scale-x-[-1]" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            YOU DID IT!
          </h1>
          <p className="text-xl text-slate-600">
            You completed the 21-Day AI SaaS Challenge
          </p>
        </div>

        {/* Video Section */}
        <Card className={`${ds.cardWithPadding} mb-6`}>
          <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4">
            <video 
              className="w-full h-full object-cover"
              controls
              autoPlay
              playsInline
              poster=""
            >
              <source src="/congrats-day21.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className={`${ds.body} text-center`}>
            A personal message from Matt
          </p>
        </Card>

        {/* Stats Card */}
        <Card className={`${ds.cardWithPadding} mb-6`}>
          <h2 className={`${ds.heading} mb-4 text-center`}>Your Journey</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">21</p>
              <p className="text-slate-600 text-sm">Days Completed</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">1</p>
              <p className="text-slate-600 text-sm">SaaS Built</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">Top 1%</p>
              <p className="text-slate-600 text-sm">Of Starters</p>
            </div>
          </div>
        </Card>

        {/* What You've Accomplished */}
        <Card className={`${ds.cardWithPadding} mb-6`}>
          <h2 className={`${ds.heading} mb-4`}>What You've Accomplished</h2>
          <div className="space-y-3">
            {[
              "Validated a real problem worth solving",
              "Defined your core features and USP",
              "Built a working AI-powered SaaS product",
              "Created your brand and sales page",
              "Published and connected your domain",
              "Learned 40+ growth strategies",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className={ds.body}>{item}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA Card */}
        <Card className="p-6 border-2 border-slate-900 bg-slate-900 text-white mb-6">
          <div className="text-center mb-6">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-white/80" />
            <h2 className="text-2xl font-bold mb-3">What's Next?</h2>
            <p className="text-slate-300">
              You've built something real. Now let's make sure it's ready for customers.
              Book a free Readiness Review and I'll tell you exactly where you stand and what to focus on next.
            </p>
          </div>

          <a
            href="https://www.mattwebley.com/readiness"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button size="lg" className="w-full h-16 text-xl font-bold gap-2 bg-white text-slate-900 hover:bg-slate-100">
              Book Your Free Readiness Review <ArrowUpRight className="w-6 h-6" />
            </Button>
          </a>
          <p className="text-center text-slate-400 text-sm mt-3">
            Free call. Honest feedback. Find out exactly where you stand.
          </p>
        </Card>

        {/* Return to Dashboard */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
            className="gap-2"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
