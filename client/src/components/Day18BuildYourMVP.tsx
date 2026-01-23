import { useState, useEffect } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trophy,
  Video,
  Loader2,
  Star,
  Pause,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ds } from "@/lib/design-system";

interface Day18BuildYourMVPProps {
  appName: string;
  onComplete: (data: { appUrl: string; showcaseSubmitted: boolean }) => void;
}

interface ShowcaseEntry {
  id: number;
  appName: string;
  description: string;
  screenshotUrl: string;
  liveUrl: string | null;
  testimonial: string | null;
  videoUrl: string | null;
  status: string;
}

const MVP_CHECKLIST = [
  { id: "core", text: "My core feature works - users can do the ONE main thing" },
  { id: "usp", text: "My USP feature is built - the thing that makes me different" },
  { id: "value", text: "It delivers real value - solves an actual problem" },
  { id: "usable", text: "Someone else could use it without me explaining everything" },
  { id: "stable", text: "It doesn't crash or lose data" },
];

const TESTIMONIAL_PROMPTS = [
  "Before this challenge, I had never...",
  "The moment it clicked for me was when...",
  "If you're thinking about doing this, just know...",
  "I built [app name] in 21 days, which I never thought...",
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

export function Day18BuildYourMVP({ appName, onComplete }: Day18BuildYourMVPProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"checklist" | "showcase" | "complete">("checklist");
  const [checksComplete, setChecksComplete] = useState<Set<string>>(new Set());
  const [pausePressed, setPausePressed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseQuote, setPauseQuote] = useState<string>("");

  const handlePauseClick = () => {
    // Trigger press animation
    setPausePressed(true);
    setTimeout(() => setPausePressed(false), 150);

    if (!isPaused) {
      // Pausing - show quote
      const quote = PAUSE_QUOTES[Math.floor(Math.random() * PAUSE_QUOTES.length)];
      setPauseQuote(quote);
    }

    // Toggle paused state
    setIsPaused(!isPaused);
  };

  // Showcase fields
  const [appUrl, setAppUrl] = useState("");
  const [showcaseAppName, setShowcaseAppName] = useState(appName || "");
  const [testimonial, setTestimonial] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showcaseSubmitted, setShowcaseSubmitted] = useState(false);

  // Check if user already submitted to showcase
  const { data: existingShowcase } = useQuery<ShowcaseEntry | null>({
    queryKey: ["/api/showcase/mine"],
  });

  useEffect(() => {
    if (existingShowcase) {
      setShowcaseSubmitted(true);
      setShowcaseAppName(existingShowcase.appName || "");
      setTestimonial(existingShowcase.testimonial || "");
      setVideoUrl(existingShowcase.videoUrl || "");
      setAppUrl(existingShowcase.liveUrl || "");
      setStep("complete");
    }
  }, [existingShowcase]);

  const submitShowcase = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/showcase", {
        appName: showcaseAppName,
        description: `Built with the 21 Day AI SaaS Challenge`,
        screenshotUrl: "",
        liveUrl: appUrl,
        testimonial,
        videoUrl: videoUrl || null,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowcaseSubmitted(true);
      setStep("complete");
      toast.success("Submitted to showcase! You've earned your MVP Builder badge.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit to showcase");
    },
  });

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
  const canSubmitShowcase = showcaseAppName.length >= 2 && appUrl.length >= 10;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: MVP Checklist */}
      {step === "checklist" && (
        <>
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
                <strong>Now go build.</strong> Open your code editor, put in the work, and come back when you've made progress. Click the button above to unpause and check off what you've completed.
              </p>
            </div>
          ) : (
            <div className={ds.infoBoxHighlight}>
              <p className={ds.body}>
                <strong>How this works:</strong> Click PAUSE CHALLENGE when you're done for the day. Go build your MVP. Come back tomorrow, unpause, and check off what you've finished. Repeat until all boxes are checked.
              </p>
            </div>
          )}

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
                          onCheckedChange={() => toggleCheck(check.id)}
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
                    Time to capture your progress and join the showcase.
                    This is how you earn your MVP Builder badge.
                  </p>
                  <Button
                    size="lg"
                    className="w-full h-12 text-lg font-bold gap-2"
                    onClick={() => setStep("showcase")}
                  >
                    Capture My Progress <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Step 2: Showcase Submission */}
      {step === "showcase" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Earn Your Badge</h3>
                <p className={ds.muted}>Submit to the showcase and inspire others</p>
              </div>
            </div>
            <p className={ds.body}>
              Submit your app to the showcase to get your MVP Builder badge and
              inspire others taking the challenge.
            </p>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-4"}>Your App</h4>

            <div className="space-y-4">
              <div>
                <label className={ds.label + " mb-1 block"}>App Name</label>
                <Input
                  placeholder="My Awesome SaaS"
                  value={showcaseAppName}
                  onChange={(e) => setShowcaseAppName(e.target.value)}
                />
              </div>

              <div>
                <label className={ds.label + " mb-1 block"}>App URL</label>
                <Input
                  placeholder="https://your-app.replit.app"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                />
                {appUrl && (
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:underline mt-1"
                  >
                    Test link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-2 mb-2">
              <h4 className={ds.heading}>Share Your Experience</h4>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Optional</span>
            </div>
            <p className={ds.muted + " mb-4"}>
              A few words about your journey. This helps inspire others and shows what's possible.
            </p>

            <div className={ds.infoBoxHighlight + " mb-3"}>
              <p className={ds.label + " mb-2"}>Try starting with</p>
              <ul className={ds.muted + " space-y-1"}>
                {TESTIMONIAL_PROMPTS.map((prompt, i) => (
                  <li key={i} className="cursor-pointer hover:text-slate-900" onClick={() => setTestimonial(prompt)}>
                    "{prompt}"
                  </li>
                ))}
              </ul>
            </div>

            <Textarea
              placeholder="Share what this experience was like for you..."
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              className="min-h-[120px]"
            />
            <p className={ds.muted + " mt-1"}>{testimonial.length}/500 characters</p>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-slate-700" />
              <h4 className={ds.heading}>Video Testimonial</h4>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Optional</span>
            </div>
            <p className={ds.muted + " mb-4"}>
              Record a short video (30-60 seconds) of yourself talking about what you built.
              This is optional but HUGELY appreciated - real faces inspire real action.
            </p>

            <Input
              placeholder="https://www.loom.com/share/your-video or YouTube link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className={ds.muted + " mt-1"}>
              Use <a href="https://www.loom.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">Loom</a> for quick recording, or upload to YouTube.
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("checklist")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => submitShowcase.mutate()}
              disabled={!canSubmitShowcase || submitShowcase.isPending}
            >
              {submitShowcase.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit to Showcase <Trophy className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          {!canSubmitShowcase && (
            <p className={ds.muted + " text-center"}>
              Fill in App Name and App URL to submit
            </p>
          )}
        </>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && (
        <>
          <div className="p-6 border-2 border-green-300 bg-white rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-2xl text-slate-900 mb-2">MVP Complete!</h4>
              <p className={ds.body}>
                You've built a working product and submitted to the showcase.
                Your app will appear in the gallery once approved.
              </p>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-3"}>What's Next?</h4>
            <ul className={ds.body + " space-y-2"}>
              <li>• Days 19-20 cover business essentials and go-to-market planning</li>
              <li>• Day 21 is LAUNCH DAY - time to share with the world</li>
              <li>• You're in the home stretch!</li>
            </ul>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("showcase")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                appUrl,
                showcaseSubmitted: true
              })}
            >
              Continue to Day 19 <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
