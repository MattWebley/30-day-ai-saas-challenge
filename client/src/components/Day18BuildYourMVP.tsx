import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  ChevronRight,
  ExternalLink,
  Trophy,
  Video,
  Camera,
  Loader2,
  Star
} from "lucide-react";

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
  { id: "core", text: "My core feature works - users can do the ONE main thing", critical: true },
  { id: "value", text: "It delivers real value - solves an actual problem", critical: true },
  { id: "usable", text: "Someone else could use it without me explaining everything", critical: true },
  { id: "stable", text: "It doesn't crash or lose data", critical: true },
];

const TESTIMONIAL_PROMPTS = [
  "Before this challenge, I had never...",
  "The moment it clicked for me was when...",
  "If you're thinking about doing this, just know...",
  "I built [app name] in 21 days, which I never thought...",
];

export function Day18BuildYourMVP({ appName, onComplete }: Day18BuildYourMVPProps) {
  const [step, setStep] = useState<"checklist" | "showcase" | "complete">("checklist");
  const [checksComplete, setChecksComplete] = useState<Set<string>>(new Set());

  // Showcase fields
  const [appUrl, setAppUrl] = useState("");
  const [showcaseAppName, setShowcaseAppName] = useState(appName || "");
  const [screenshotUrl, setScreenshotUrl] = useState("");
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
      setScreenshotUrl(existingShowcase.screenshotUrl || "");
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
        description: `Built with the 21 Day AI SaaS Challenge`, // Auto description
        screenshotUrl,
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

  const allCriticalDone = MVP_CHECKLIST.filter(c => c.critical).every(c => checksComplete.has(c.id));
  const canSubmitShowcase = showcaseAppName.length >= 2 && screenshotUrl.length >= 10 && testimonial.length >= 50 && appUrl.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Build Your MVP</h3>
        <p className="text-slate-600 mt-1">
          THE PAUSE POINT. Stay here until your MVP is ready - then capture your progress.
        </p>
      </Card>

      {/* Step 1: MVP Checklist */}
      {step === "checklist" && (
        <>
          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="text-slate-700">
              <p className="font-medium">What is an MVP?</p>
              <p className="mt-1">
                The SMALLEST version of your product that delivers REAL VALUE.
                Not half-built. Not broken. Just focused on ONE thing done well.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Is Your MVP Ready?</h4>
            <div className="space-y-3">
              {MVP_CHECKLIST.map((check) => (
                <div
                  key={check.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    checksComplete.has(check.id)
                      ? "bg-green-50 border-green-200"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => toggleCheck(check.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checksComplete.has(check.id)}
                      onChange={() => toggleCheck(check.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-700">{check.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {!allCriticalDone && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-amber-800">
                  Keep building until all items are checked. This is THE PAUSE POINT - take your time.
                </p>
              </div>
            )}
          </Card>

          {allCriticalDone && (
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-lg text-slate-900">Your MVP is Ready!</h4>
              </div>
              <p className="text-slate-700 mb-4">
                Time to capture your progress and join the showcase.
                This is how you earn your <strong>MVP Builder badge</strong>.
              </p>
              <Button
                size="lg"
                className="w-full h-12 text-lg font-bold gap-2"
                onClick={() => setStep("showcase")}
              >
                Capture My Progress <ChevronRight className="w-5 h-5" />
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Step 2: Showcase Submission */}
      {step === "showcase" && (
        <>
          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500" />
              <p className="font-bold text-slate-900">Earn Your Badge</p>
            </div>
            <p className="text-slate-700">
              Submit your app to the showcase to get your <strong>MVP Builder badge</strong> and
              inspire others taking the challenge.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your App</h4>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  App Name
                </label>
                <Input
                  placeholder="My Awesome SaaS"
                  value={showcaseAppName}
                  onChange={(e) => setShowcaseAppName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  App URL
                </label>
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

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Screenshot URL
                </label>
                <Input
                  placeholder="https://i.imgur.com/your-screenshot.png"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                />
                <p className="text-slate-500 mt-1">
                  Take a screenshot of your dashboard/main screen. Upload to{" "}
                  <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">
                    imgur.com
                  </a>{" "}
                  and paste the direct image URL.
                </p>
                {screenshotUrl && (
                  <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                    <img
                      src={screenshotUrl}
                      alt="App preview"
                      className="w-full h-48 object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Share Your Experience</h4>
            <p className="text-slate-600 mb-4">
              A few words about your journey. This helps inspire others and shows what's possible.
            </p>

            <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 font-medium mb-2">Try starting with:</p>
              <ul className="text-slate-600 space-y-1">
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
            <p className="text-slate-400 mt-1">{testimonial.length}/500 characters (min 50)</p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-slate-700" />
              <h4 className="font-bold text-lg text-slate-900">Video Testimonial</h4>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded ml-2">Bonus</span>
            </div>
            <p className="text-slate-600 mb-4">
              Record a short video (30-60 seconds) of yourself talking about what you built.
              This is optional but HUGELY appreciated - real faces inspire real action.
            </p>

            <Input
              placeholder="https://www.loom.com/share/your-video or YouTube link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-slate-500 mt-1">
              Use <a href="https://www.loom.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">Loom</a> for quick recording, or upload to YouTube.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
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
                Submit to Showcase & Earn Badge <Trophy className="w-5 h-5" />
              </>
            )}
          </Button>

          {!canSubmitShowcase && (
            <p className="text-center text-slate-500">
              Complete all required fields above to submit
            </p>
          )}
        </>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-bold text-2xl text-slate-900 mb-2">MVP Complete!</h4>
              <p className="text-slate-700">
                You've built a working product and submitted to the showcase.
                Your app will appear in the gallery once approved.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">What's Next?</h4>
            <ul className="text-slate-700 space-y-2">
              <li>Days 19-20 cover business essentials and go-to-market planning</li>
              <li>Day 21 is LAUNCH DAY - time to share with the world</li>
              <li>You're in the home stretch!</li>
            </ul>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({
              appUrl,
              showcaseSubmitted: true
            })}
          >
            Continue to Day 19 <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
