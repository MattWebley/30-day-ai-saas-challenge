import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Trophy,
  Pause,
  CheckCircle2,
  Clock,
  Users,
  Play,
  Video,
} from "lucide-react";
import { ds } from "@/lib/design-system";

interface Day18BuildYourMVPProps {
  appName: string;
  daysSinceStart: number;
  onComplete: () => void;
}

interface ShowcaseStats {
  count: number;
  recent: { appName: string; liveUrl: string | null }[];
}

const MVP_CHECKLIST = [
  { id: "competitors", text: "I've built the core features my competitors all have" },
  { id: "usp", text: "I've built my USP - the thing that makes me different" },
  { id: "accounts", text: "Users can sign up, log in, and their data is saved" },
  { id: "payments", text: "Users can pay me - Stripe is connected and working" },
  { id: "mobile", text: "It's mobile optimized and looks good on a phone" },
  { id: "speed", text: "It loads fast with no slow pages or freezing" },
  { id: "domain", text: "My custom domain is connected and working" },
  { id: "tested", text: "I've tested the main user flow from start to finish" },
  { id: "appearance", text: "It looks professional, not like a school project" },
  { id: "stranger", text: "A stranger could sign up and use it without my help" },
];

const PAUSE_QUOTES = [
  "Rome wasn't built in a day, but they were laying bricks every hour.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Small daily improvements are the key to staggering long-term results.",
  "You don't have to be great to start, but you have to start to be great.",
  "The only way to do great work is to love what you do. Keep going.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock. Do what it does - keep going.",
  "A year from now you'll wish you had started today. Oh wait, you did.",
  "The hard days are what make you stronger.",
  "Brick by brick, my citizens. Brick by brick.",
  "Consistency beats intensity. Show up today.",
  "Your future self is watching you right now through memories. Make them proud.",
];

export function Day18BuildYourMVP({ appName, daysSinceStart, onComplete }: Day18BuildYourMVPProps) {
  const [checksComplete, setChecksComplete] = useState<Set<string>>(new Set());
  const [pausePressed, setPausePressed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseQuote, setPauseQuote] = useState<string>("");

  // Fetch showcase stats for social proof
  const { data: showcaseStats } = useQuery<ShowcaseStats>({
    queryKey: ["/api/showcase/stats"],
  });

  const handlePauseClick = () => {
    setPausePressed(true);
    setTimeout(() => setPausePressed(false), 150);

    if (!isPaused) {
      const quote = PAUSE_QUOTES[Math.floor(Math.random() * PAUSE_QUOTES.length)];
      setPauseQuote(quote);
    }

    setIsPaused(!isPaused);
  };

  const toggleCheck = (id: string) => {
    const newChecks = new Set(checksComplete);
    if (newChecks.has(id)) {
      newChecks.delete(id);
    } else {
      newChecks.add(id);
    }
    setChecksComplete(newChecks);
  };

  const allChecked = MVP_CHECKLIST.every(c => checksComplete.has(c.id));

  return (
    <div className="space-y-6">
      {/* Video Message from Matt - Placeholder */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 cursor-pointer group" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg mb-3">
            <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
          </div>
          <p className="font-bold text-lg">A Message From Matt</p>
          <p className="text-slate-300 text-sm">Day 18 - The MVP Milestone</p>
        </div>
        {/* TODO: Replace with actual video embed */}
      </div>

      {/* Social Proof - only show when count is meaningful */}
      {showcaseStats && showcaseStats.count >= 10 && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{showcaseStats.count} builders</p>
            <p className="text-slate-500 text-sm">have shipped their MVP</p>
          </div>
        </div>
      )}

      {/* Large Pause Button */}
      <button
        onClick={handlePauseClick}
        className={`w-full h-20 px-6 flex items-center justify-center gap-3 text-white rounded-2xl shadow-inner font-bold cursor-pointer transition-all duration-150 text-xl ${
          pausePressed ? "scale-95 brightness-90" : "scale-100"
        } ${isPaused
          ? "bg-red-600 hover:bg-red-700 border-t-2 border-red-700"
          : "bg-green-600 hover:bg-green-700 border-t-2 border-green-700"
        }`}
      >
        {isPaused ? (
          <Clock className="w-8 h-8 animate-spin" />
        ) : (
          <Pause className="w-8 h-8" />
        )}
        {isPaused ? "CHALLENGE PAUSED" : "PAUSE CHALLENGE"}
      </button>

      {/* Quote appears below button when paused */}
      {isPaused && pauseQuote && (
        <div className="text-center text-slate-600 italic">
          "{pauseQuote}"
        </div>
      )}

      {/* Instructions based on pause state */}
      {isPaused ? (
        <div className={ds.infoBoxHighlight}>
          <p className={ds.body}>
            <strong>Now go build.</strong> Open Replit, fire up Claude Code, and get to work. Come back when you've made progress and unpause to check off what you've done.
          </p>
        </div>
      ) : (
        <div className={ds.infoBoxHighlight}>
          <p className={ds.body}>
            <strong>How this works:</strong> Click PAUSE CHALLENGE when you're done for the day. Go build your MVP. Come back tomorrow, unpause, and check off what you've finished. Repeat until all boxes are checked.
          </p>
        </div>
      )}

      {/* Struggling? Book a coaching call - SOS style - always visible */}
      <a
        href="/coaching"
        className="block"
      >
        <button
          className="w-full h-16 px-6 flex items-center justify-center gap-3 text-white rounded-2xl shadow-inner font-bold cursor-pointer transition-all duration-150 text-lg bg-primary hover:bg-primary/90 border-t-2 border-primary/80 hover:scale-[1.02] active:scale-95"
        >
          <Video className="w-6 h-6" />
          STUCK? BOOK A COACHING CALL
        </button>
      </a>

      {/* Hide checklist when paused */}
      {!isPaused && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Is Your MVP Ready?</h3>
                <p className={ds.muted}>Check each item when it's done</p>
              </div>
            </div>

            <div className="space-y-3">
              {MVP_CHECKLIST.map((check) => (
                <div
                  key={check.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    checksComplete.has(check.id)
                      ? "border-green-500 bg-white"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => toggleCheck(check.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checksComplete.has(check.id)}
                      onCheckedChange={() => {}}
                      className="pointer-events-none"
                    />
                    <span className={ds.body}>{check.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allChecked && (
            <div className="p-6 border-2 border-green-300 bg-white rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-lg text-slate-900">Your MVP is Ready!</h4>
              </div>
              <p className={ds.body + " mb-4"}>
                Amazing work. You've built something real. Tomorrow we'll create your sales page,
                then you'll have a chance to share your experience and get featured.
              </p>
              <Button
                size="lg"
                className="w-full h-12 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => onComplete()}
              >
                Continue to Day 19: Sales Page <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
