import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  Rocket,
  CheckCircle2,
  ChevronRight,
  Trophy,
  AlertTriangle,
  PartyPopper,
  ExternalLink,
  Share2,
  ArrowUpRight,
  Camera,
  Image,
  Loader2,
  Star
} from "lucide-react";

interface Day21LaunchDayProps {
  appName: string;
  onComplete: (data: { appUrl: string; launchedAt: string; launchFeeling: string; nextSteps: string }) => void;
}

interface ShowcaseEntry {
  id: number;
  appName: string;
  description: string;
  screenshotUrl: string;
  liveUrl: string | null;
  status: string;
}

const PRE_LAUNCH_CHECKS = [
  { id: "works", text: "Core feature works end-to-end", critical: true },
  { id: "auth", text: "Login/logout works", critical: true },
  { id: "mobile", text: "Works on mobile", critical: true },
  { id: "no-crashes", text: "No obvious crashes or errors", critical: true },
  { id: "data-saves", text: "User data saves correctly", critical: true },
];

export function Day21LaunchDay({ appName, onComplete }: Day21LaunchDayProps) {
  const [step, setStep] = useState<"check" | "launch" | "celebrate">("check");
  const [checksComplete, setChecksComplete] = useState<Set<string>>(new Set());
  const [appUrl, setAppUrl] = useState("");
  const [launchFeeling, setLaunchFeeling] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [hasLaunched, setHasLaunched] = useState(false);

  // Showcase submission
  const [showcaseAppName, setShowcaseAppName] = useState(appName || "");
  const [showcaseDescription, setShowcaseDescription] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [showcaseSubmitted, setShowcaseSubmitted] = useState(false);

  // Check if user already submitted to showcase
  const { data: existingShowcase } = useQuery<ShowcaseEntry | null>({
    queryKey: ["/api/showcase/mine"],
  });

  useEffect(() => {
    if (existingShowcase) {
      setShowcaseSubmitted(true);
      setShowcaseAppName(existingShowcase.appName || "");
      setShowcaseDescription(existingShowcase.description || "");
      setScreenshotUrl(existingShowcase.screenshotUrl || "");
    }
  }, [existingShowcase]);

  const submitShowcase = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/showcase", {
        appName: showcaseAppName,
        description: showcaseDescription,
        screenshotUrl,
        liveUrl: appUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowcaseSubmitted(true);
      toast.success("Submitted to showcase! It will appear after approval.");
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

  const allCriticalDone = PRE_LAUNCH_CHECKS.filter(c => c.critical).every(c => checksComplete.has(c.id));
  const canLaunch = allCriticalDone && appUrl.length >= 10;
  const canSubmitShowcase = showcaseAppName.length >= 2 && showcaseDescription.length >= 20 && screenshotUrl.length >= 10;
  const canComplete = hasLaunched && showcaseSubmitted && launchFeeling.length >= 20 && nextSteps.length >= 20;

  const handleLaunch = () => {
    setHasLaunched(true);
    setStep("celebrate");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Launch Day</h3>
            <p className="text-slate-600 mt-1">This is it. Time to share your creation with the world.</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Pre-Launch Check */}
      {step === "check" && (
        <>
          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Before You Launch</p>
                <p className="mt-1">
                  Make sure the critical items are done. Your app doesn't need to be perfect -
                  it needs to work for the main use case.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Pre-Launch Checklist</h4>
            <div className="space-y-3">
              {PRE_LAUNCH_CHECKS.map((check) => (
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
                    <span className="text-sm text-slate-700">{check.text}</span>
                  </div>
                  {check.critical && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                  )}
                </div>
              ))}
            </div>

            {!allCriticalDone && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  Complete all required items before launching. {checksComplete.size}/{PRE_LAUNCH_CHECKS.filter(c => c.critical).length} done.
                </p>
              </div>
            )}
          </Card>

          {allCriticalDone && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("launch")}
            >
              Ready to Launch <Rocket className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Launch */}
      {step === "launch" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h4 className="font-bold text-lg text-slate-900">Pre-Launch Complete!</h4>
            </div>
            <p className="text-slate-700">
              Your app is ready. Let's make it official.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your App URL</h4>
            <p className="text-sm text-slate-600 mb-4">
              Enter the URL where people can access your app:
            </p>
            <Input
              placeholder="https://your-app.replit.app"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              className="text-lg"
            />
            {appUrl && (
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                Open {appName || "your app"} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </Card>

          {canLaunch && (
            <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center">
                <h4 className="font-bold text-2xl mb-3 text-slate-900">Ready to Launch?</h4>
                <p className="text-slate-600 mb-6">
                  Click the button below to officially launch {appName || "your app"}.
                  This moment marks the end of building and the beginning of growing.
                </p>
                <Button
                  size="lg"
                  className="h-20 px-16 text-2xl font-bold gap-4 bg-primary hover:bg-primary/90"
                  onClick={handleLaunch}
                >
                  <Rocket className="w-8 h-8" />
                  LAUNCH {appName ? appName.toUpperCase() : "MY APP"}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Step 3: Celebrate */}
      {step === "celebrate" && (
        <>
          <Card className="p-8 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-center">
              <PartyPopper className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-3xl text-green-800 mb-2">YOU DID IT!</h4>
              <p className="text-green-700 text-lg">
                {appName || "Your app"} is now LIVE. You built an AI SaaS product in 21 days.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">What You Just Did</h4>
            </div>
            <ul className="text-slate-700 space-y-2">
              <li>• Went from idea to working product</li>
              <li>• Built with AI-powered features</li>
              <li>• Added user authentication</li>
              <li>• Tested on mobile</li>
              <li>• Polished the brand</li>
              <li>• And most importantly: <strong>SHIPPED</strong></li>
            </ul>
          </Card>

          {/* Showcase Submission */}
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Submit to the Showcase</h4>
                <p className="text-sm text-slate-600">Show off what you built to inspire others</p>
              </div>
            </div>

            {showcaseSubmitted ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Submitted to showcase!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your app will appear in the gallery once approved.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    App Name
                  </label>
                  <Input
                    placeholder="My Awesome SaaS"
                    value={showcaseAppName}
                    onChange={(e) => setShowcaseAppName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    One-Line Description
                  </label>
                  <Textarea
                    placeholder="What does your app do? Who is it for? (Keep it punchy!)"
                    value={showcaseDescription}
                    onChange={(e) => setShowcaseDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-slate-400 mt-1">{showcaseDescription.length}/200 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Screenshot URL
                  </label>
                  <div className="flex items-start gap-2">
                    <Camera className="w-5 h-5 text-slate-400 mt-2.5" />
                    <div className="flex-1">
                      <Input
                        placeholder="https://i.imgur.com/your-screenshot.png"
                        value={screenshotUrl}
                        onChange={(e) => setScreenshotUrl(e.target.value)}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Take a screenshot of your app's main screen. Upload to{" "}
                        <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          imgur.com
                        </a>{" "}
                        or similar and paste the direct image URL.
                      </p>
                    </div>
                  </div>
                </div>

                {screenshotUrl && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
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

                <Button
                  onClick={() => submitShowcase.mutate()}
                  disabled={!canSubmitShowcase || submitShowcase.isPending}
                  className="w-full gap-2"
                >
                  {submitShowcase.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      Submit to Showcase
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Hard CTA - Work with Matt */}
          <Card className="p-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
            <h4 className="font-bold text-xl mb-3 text-slate-900">
              You've Built a SaaS. Now Let's Build a Business.
            </h4>
            <p className="text-slate-700 mb-4">
              Congratulations - you now have a working, saleable SaaS product. That puts you ahead of 99% of people
              who just <span className="italic">talk</span> about building something. But a product isn't a business yet.
            </p>
            <p className="text-slate-700 mb-5">
              If you want help with the next step - getting customers, pricing, marketing, and actually making money
              from what you've built - let's talk. I offer 1:1 mentorship for SaaS founders who are ready to go from
              product to profitable business.
            </p>
            <a
              href="https://www.mattwebley.com/workwithmatt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700">
                Book a Call - Let's Talk <ArrowUpRight className="w-5 h-5" />
              </Button>
            </a>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">How Does It Feel?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Take a moment to reflect. You just launched something real.
            </p>
            <Textarea
              placeholder="Launching feels [amazing/scary/exciting/relieving]...

I'm proud of [what I built/how far I came/finishing]...

The hardest part was [what]...

The best part was [what]..."
              value={launchFeeling}
              onChange={(e) => setLaunchFeeling(e.target.value)}
              className="min-h-[140px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">What's Next?</h4>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              You've launched. Now what? Write down your first 3 next steps:
            </p>
            <Textarea
              placeholder="My next steps:
1. Share on [Twitter/LinkedIn/Reddit] to get first users
2. Ask [X people] to try it and give feedback
3. Fix [the thing I know needs work]

My goal for the next week is..."
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="min-h-[140px]"
            />
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-sm mb-2 text-slate-900">Remember</h4>
            <p className="text-sm text-slate-600">
              Launching is the beginning, not the end. Your first version won't be perfect -
              and that's okay. The people who succeed are the ones who ship, learn, and improve.
              You just proved you can ship. Now keep going.
            </p>
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                appUrl,
                launchedAt: new Date().toISOString(),
                launchFeeling,
                nextSteps
              })}
            >
              <CheckCircle2 className="w-5 h-5" />
              Complete the 21 Day Challenge
            </Button>
          )}
        </>
      )}
    </div>
  );
}
