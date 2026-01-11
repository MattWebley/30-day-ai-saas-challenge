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
  Info,
} from "lucide-react";
import { ds } from "@/lib/design-system";

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
    <div className={ds.section}>
      {/* Header */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center gap-3 mb-2">
          <Camera className="w-6 h-6 text-primary" />
          <h3 className={ds.titleXl}>Capture Your Progress</h3>
        </div>
        <p className={ds.text}>You're halfway through the challenge. Let's document what you've built.</p>
      </div>

      {/* Celebration Banner */}
      <div className={ds.infoBoxHighlight}>
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <div>
            <p className={ds.title}>Halfway Point!</p>
            <p className={ds.textMuted}>Day 12 of 21 - You're actually doing this.</p>
          </div>
        </div>
      </div>

      {/* Step 1: Screenshot */}
      {step === "screenshot" && (
        <>
          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.titleLg} mb-2`}>Step 1: Take a Screenshot</h4>
            <p className={`${ds.textMuted} mb-4`}>
              Open your app and take a screenshot of the main screen. Don't wait until it's "perfect" - capture it NOW.
            </p>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <p className={`${ds.label} mb-2`}>How to take a screenshot:</p>
                <ul className={`${ds.textMuted} space-y-1`}>
                  <li><strong className="text-slate-700">Mac:</strong> Cmd + Shift + 4</li>
                  <li><strong className="text-slate-700">Windows:</strong> Win + Shift + S</li>
                  <li><strong className="text-slate-700">Chrome:</strong> Right-click → Inspect → Device toolbar → Screenshot</li>
                </ul>
              </div>

              <div>
                <label className={`block ${ds.label} mb-2`}>
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
                <p className={`${ds.textMuted} mt-2`}>
                  Tip: Upload to <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-primary underline">imgur.com</a> (free, no account needed) and paste the direct link.
                </p>
              </div>

              {screenshotUrl && (
                <div className={ds.infoBoxHighlight}>
                  <p className={`${ds.textMuted} mb-2`}>Preview:</p>
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

          <div className={ds.infoBox}>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className={ds.label}>Why this matters</p>
                <p className={ds.textMuted}>
                  This screenshot becomes part of your build journey. When you launch, you'll have a "before and after" story to share.
                </p>
              </div>
            </div>
          </div>

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
          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.titleLg} mb-2`}>Step 2: Two-Sentence Summary</h4>
            <p className={`${ds.textMuted} mb-4`}>
              Answer these two questions in one sentence each. Keep it simple.
            </p>

            <div className="space-y-4">
              <div>
                <label className={`block ${ds.label} mb-2`}>
                  What does {appName || "your app"} do?
                </label>
                <Textarea
                  placeholder={`${appName || "My app"} helps [who] to [do what]...`}
                  value={whatItDoes}
                  onChange={(e) => setWhatItDoes(e.target.value)}
                  className="min-h-[80px]"
                />
                <p className={`${ds.textMuted} mt-1`}>{whatItDoes.length} characters</p>
              </div>

              <div>
                <label className={`block ${ds.label} mb-2`}>
                  What works right now?
                </label>
                <Textarea
                  placeholder="Right now, users can [list working features]..."
                  value={whatWorks}
                  onChange={(e) => setWhatWorks(e.target.value)}
                  className="min-h-[80px]"
                />
                <p className={`${ds.textMuted} mt-1`}>{whatWorks.length} characters</p>
              </div>
            </div>
          </div>

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
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-3">
              <div className={ds.stepCircleComplete}>
                <Check className="w-5 h-5" />
              </div>
              <h4 className={ds.titleLg}>Progress Captured!</h4>
            </div>
            <p className={ds.text}>
              You've got proof of what you're building. This is YOUR journey.
            </p>
          </div>

          {/* Preview */}
          <div className={ds.cardWithPadding}>
            <h4 className={`${ds.titleLg} mb-4`}>Your Day 12 Snapshot</h4>

            {screenshotUrl && (
              <img
                src={screenshotUrl}
                alt="App screenshot"
                className="w-full rounded-lg border border-slate-200 mb-4"
              />
            )}

            <div className={`${ds.infoBoxHighlight} space-y-3`}>
              <div>
                <p className={`${ds.label} uppercase`}>What it does:</p>
                <p className="text-slate-900">{whatItDoes}</p>
              </div>
              <div>
                <p className={`${ds.label} uppercase`}>What works:</p>
                <p className="text-slate-900">{whatWorks}</p>
              </div>
            </div>
          </div>

          {/* Share Option */}
          <div className={ds.cardWithPadding}>
            <div className="flex items-start gap-4">
              <div
                onClick={() => setSharedToCommunity(!sharedToCommunity)}
                className={sharedToCommunity ? ds.checkSelected : ds.checkDefault}
                style={{ cursor: 'pointer' }}
              >
                {sharedToCommunity && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <p className={ds.title}>Share to Community</p>
                </div>
                <p className={ds.textMuted}>
                  Post your progress to the Day 12 discussion. See what others are building. Get encouragement.
                </p>
              </div>
            </div>
          </div>

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
