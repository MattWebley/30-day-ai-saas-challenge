import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  Camera,
  Upload,
  Check,
  Share2,
  Trophy,
  Image as ImageIcon,
} from "lucide-react";

interface Day12CaptureProgressProps {
  appName: string;
  onComplete: (data: {
    screenshotUrl: string;
    whatItDoes: string;
    whatWorks: string;
    sharedToCommunity: boolean;
  }) => void;
}

export function Day12CaptureProgress({ appName, onComplete }: Day12CaptureProgressProps) {
  const [step, setStep] = useState<"screenshot" | "summary" | "share">("screenshot");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [whatItDoes, setWhatItDoes] = useState("");
  const [whatWorks, setWhatWorks] = useState("");
  const [sharedToCommunity, setSharedToCommunity] = useState(false);

  const canProceedToSummary = screenshotUrl.length > 0;
  const canProceedToShare = whatItDoes.length >= 10 && whatWorks.length >= 10;
  const canComplete = true; // Can always complete from share step

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-2">
          <Camera className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-extrabold text-slate-900">Capture Your Progress</h3>
        </div>
        <p className="text-slate-600">You're halfway through the challenge. Let's document what you've built.</p>
      </Card>

      {/* Celebration Banner */}
      <Card className="p-4 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          <div>
            <p className="font-bold text-amber-900">Halfway Point!</p>
            <p className="text-sm text-amber-700">Day 12 of 21 - You're actually doing this.</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Screenshot */}
      {step === "screenshot" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Step 1: Take a Screenshot</h4>
            <p className="text-sm text-slate-600 mb-4">
              Open your app and take a screenshot of the main screen. Don't wait until it's "perfect" - capture it NOW.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="font-medium text-slate-900 text-sm mb-2">How to take a screenshot:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li><strong>Mac:</strong> Cmd + Shift + 4</li>
                  <li><strong>Windows:</strong> Win + Shift + S</li>
                  <li><strong>Chrome:</strong> Right-click → Inspect → Device toolbar → Screenshot</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paste or enter your screenshot URL:
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://i.imgur.com/... or paste image URL"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Tip: Upload to <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-primary underline">imgur.com</a> (free, no account needed) and paste the direct link.
                </p>
              </div>

              {screenshotUrl && (
                <div className="border-2 border-slate-200 rounded-lg p-2 bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2">Preview:</p>
                  <img
                    src={screenshotUrl}
                    alt="App screenshot preview"
                    className="max-w-full rounded border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 border-2 border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 text-sm">Why this matters</p>
                <p className="text-sm text-green-700">
                  This screenshot becomes part of your build journey. When you launch, you'll have a "before and after" story to share.
                </p>
              </div>
            </div>
          </Card>

          {canProceedToSummary && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("summary")}
            >
              Next: Write Summary <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Two-Sentence Summary */}
      {step === "summary" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Step 2: Two-Sentence Summary</h4>
            <p className="text-sm text-slate-600 mb-4">
              Answer these two questions in one sentence each. Keep it simple.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What does {appName || "your app"} do?
                </label>
                <Textarea
                  placeholder={`${appName || "My app"} helps [who] to [do what]...`}
                  value={whatItDoes}
                  onChange={(e) => setWhatItDoes(e.target.value)}
                  className="min-h-[80px]"
                />
                <p className="text-xs text-slate-500 mt-1">{whatItDoes.length} characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What works right now?
                </label>
                <Textarea
                  placeholder="Right now, users can [list working features]..."
                  value={whatWorks}
                  onChange={(e) => setWhatWorks(e.target.value)}
                  className="min-h-[80px]"
                />
                <p className="text-xs text-slate-500 mt-1">{whatWorks.length} characters</p>
              </div>
            </div>
          </Card>

          {canProceedToShare && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("share")}
            >
              Next: Share & Celebrate <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 3: Share & Complete */}
      {step === "share" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-lg text-green-900">Progress Captured!</h4>
            </div>
            <p className="text-green-800">
              You've got proof of what you're building. This is YOUR journey.
            </p>
          </Card>

          {/* Preview */}
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your Day 12 Snapshot</h4>

            {screenshotUrl && (
              <img
                src={screenshotUrl}
                alt="App screenshot"
                className="w-full rounded-lg border border-slate-200 mb-4"
              />
            )}

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">What it does:</p>
                <p className="text-slate-900">{whatItDoes}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">What works:</p>
                <p className="text-slate-900">{whatWorks}</p>
              </div>
            </div>
          </Card>

          {/* Share Option */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-start gap-4">
              <div
                onClick={() => setSharedToCommunity(!sharedToCommunity)}
                className={`w-6 h-6 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
                  sharedToCommunity
                    ? "bg-primary border-primary"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              >
                {sharedToCommunity && <Check className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <p className="font-medium text-slate-900">Share to Community</p>
                </div>
                <p className="text-sm text-slate-600">
                  Post your progress to the Day 12 discussion. See what others are building. Get encouragement.
                </p>
              </div>
            </div>
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                screenshotUrl,
                whatItDoes,
                whatWorks,
                sharedToCommunity
              })}
            >
              Complete Day 12 <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
