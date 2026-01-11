import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  Camera,
  Check,
  Share2,
  Trophy,
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

/**
 * UNIFORM TYPOGRAPHY (proposed standard):
 * - Card header: text-lg font-bold text-slate-900
 * - Body text: text-sm text-slate-600
 * - Labels: text-sm font-medium text-slate-700
 * - Muted/helper: text-sm text-slate-500
 *
 * UNIFORM SPACING:
 * - Card padding: p-5
 * - Between sections: space-y-4
 * - After header: mb-3
 * - After labels: mb-2
 */

export function Day12CaptureProgress({ appName, onComplete }: Day12CaptureProgressProps) {
  const [step, setStep] = useState<"screenshot" | "summary" | "share">("screenshot");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [whatItDoes, setWhatItDoes] = useState("");
  const [whatWorks, setWhatWorks] = useState("");
  const [sharedToCommunity, setSharedToCommunity] = useState(false);

  const canProceedToSummary = screenshotUrl.length > 0;
  const canProceedToShare = whatItDoes.length >= 10 && whatWorks.length >= 10;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-1">
          <Camera className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-slate-900">Document Your Build</h3>
        </div>
        <p className="text-sm text-slate-600">You're halfway through. Let's capture what you've built so far.</p>
      </div>

      {/* Celebration Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Halfway Point!</p>
            <p className="text-sm text-slate-500">Day 12 of 21 - You're actually doing this.</p>
          </div>
        </div>
      </div>

      {/* Step 1: Screenshot */}
      {step === "screenshot" && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Step 1: Take a Screenshot</h4>
            <p className="text-sm text-slate-600 mb-4">
              Open your app and take a screenshot of the main screen. Don't wait for perfect - capture it NOW.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">How to take a screenshot:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li><span className="font-medium">Mac:</span> Cmd + Shift + 4</li>
                  <li><span className="font-medium">Windows:</span> Win + Shift + S</li>
                  <li><span className="font-medium">Chrome:</span> Right-click → Inspect → Device toolbar</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paste your screenshot URL:
                </label>
                <Input
                  type="url"
                  placeholder="https://i.imgur.com/..."
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                />
                <p className="text-sm text-slate-500 mt-2">
                  Tip: Upload to <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-primary underline">imgur.com</a> (free) and paste the link.
                </p>
              </div>

              {screenshotUrl && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-2">Preview:</p>
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
          </div>

          {canProceedToSummary && (
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold"
              onClick={() => setStep("summary")}
            >
              Next: Write Summary <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Two-Sentence Summary */}
      {step === "summary" && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Step 2: Two-Sentence Summary</h4>
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
                <p className="text-sm text-slate-500 mt-1">{whatItDoes.length} characters</p>
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
                <p className="text-sm text-slate-500 mt-1">{whatWorks.length} characters</p>
              </div>
            </div>
          </div>

          {canProceedToShare && (
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold"
              onClick={() => setStep("share")}
            >
              Next: Share & Celebrate <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </>
      )}

      {/* Step 3: Share & Complete */}
      {step === "share" && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Progress Captured!</h4>
            </div>
            <p className="text-sm text-slate-600">
              You've got proof of what you're building. This is YOUR journey.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Your Day 12 Snapshot</h4>

            {screenshotUrl && (
              <img
                src={screenshotUrl}
                alt="App screenshot"
                className="w-full rounded-lg border border-slate-200 mb-4"
              />
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What it does</p>
                <p className="text-sm text-slate-900 mt-1">{whatItDoes}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What works</p>
                <p className="text-sm text-slate-900 mt-1">{whatWorks}</p>
              </div>
            </div>
          </div>

          {/* Share Option */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div
              className="flex items-start gap-4 cursor-pointer"
              onClick={() => setSharedToCommunity(!sharedToCommunity)}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${sharedToCommunity ? 'bg-primary' : 'bg-slate-100'}`}>
                {sharedToCommunity && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-900">Share to Community</p>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Post your progress to the Day 12 discussion. See what others are building.
                </p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-12 text-base font-semibold"
            onClick={() => onComplete({
              screenshotUrl,
              whatItDoes,
              whatWorks,
              sharedToCommunity
            })}
          >
            Complete Day 12 <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </>
      )}
    </div>
  );
}
