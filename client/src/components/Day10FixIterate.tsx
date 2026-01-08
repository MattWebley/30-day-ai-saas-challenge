import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pause, Play, ChevronRight, ArrowRight } from "lucide-react";

interface Day10FixIterateProps {
  topPriority?: string;
  onComplete: (data: { issueFixed: string; howYouFixedIt: string; stillNeedsToDo: string }) => void;
}

export function Day10FixIterate({ topPriority, onComplete }: Day10FixIterateProps) {
  const [step, setStep] = useState<"focus" | "fix" | "done">("focus");
  const [issueToFix, setIssueToFix] = useState(topPriority || "");
  const [howYouFixedIt, setHowYouFixedIt] = useState("");
  const [stillNeedsToDo, setStillNeedsToDo] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const canProceedToFix = issueToFix.length >= 10;
  const canComplete = howYouFixedIt.length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Fix Your #1 Issue</h3>
        <p className="text-slate-600 mt-1">Today's mission: Fix the most important thing from your reality check.</p>
      </Card>

      {/* Pause Notice */}
      <Card className="p-4 border-2 border-slate-200 bg-slate-50">
        <p className="font-medium text-slate-900">Take Your Time</p>
        <p className="text-sm text-slate-700 mt-1">
          If you need more than one session to fix things, that's totally fine.
          Use the pause button and come back when ready. Quality over speed.
        </p>
      </Card>

      {/* Pause Button */}
      <Card className="p-4 border-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900">Challenge Status</h4>
            <p className="text-sm text-slate-600">
              {isPaused ? "Paused - take your time fixing" : "In progress"}
            </p>
          </div>
          <Button
            variant={isPaused ? "default" : "outline"}
            onClick={() => setIsPaused(!isPaused)}
            className="gap-2"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Step 1: Focus on ONE Issue */}
      {step === "focus" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What's the ONE thing to fix?</h4>
            <p className="text-sm text-slate-600 mb-4">
              {topPriority
                ? "Your top priority from yesterday's reality check:"
                : "Describe the most important issue to fix right now:"}
            </p>
            <Textarea
              placeholder="The issue I need to fix is..."
              value={issueToFix}
              onChange={(e) => setIssueToFix(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-700">
              <strong>Why just ONE?</strong> Fixing one thing well beats half-fixing five things.
              Once this works, you can tackle the next issue tomorrow.
            </p>
          </Card>

          {canProceedToFix && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("fix")}
            >
              Start Fixing <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Fix It */}
      {step === "fix" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your Mission</h4>
            <p className="text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200">
              "{issueToFix}"
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Fix Workflow</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Describe the problem to Claude Code</p>
                  <p className="text-sm text-slate-600">"The [feature] is broken. It should [do X] but instead it [does Y]."</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Let Claude Code fix it</p>
                  <p className="text-sm text-slate-600">Review the changes it suggests</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Test immediately</p>
                  <p className="text-sm text-slate-600">Does the issue work correctly now?</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Iterate if needed</p>
                  <p className="text-sm text-slate-600">"That's closer, but now [describe remaining issue]"</p>
                </div>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("done")}
          >
            I Fixed It!
          </Button>
        </>
      )}

      {/* Step 3: Document the Fix */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-2">Issue Fixed!</h4>
            <p className="text-slate-700">
              You just improved your app. Every fix gets you closer to something users will love.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What did you fix?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Describe the fix - both the problem and the solution:
            </p>
            <Textarea
              placeholder="I fixed [issue] by [solution]. Now it [works correctly by doing X]."
              value={howYouFixedIt}
              onChange={(e) => setHowYouFixedIt(e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What's still on the list?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Quick note of other issues you still need to address (for your reference):
            </p>
            <Textarea
              placeholder="Still need to fix:
- Issue 2
- Issue 3
(or 'Nothing major - app is in good shape!')"
              value={stillNeedsToDo}
              onChange={(e) => setStillNeedsToDo(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ issueFixed: issueToFix, howYouFixedIt, stillNeedsToDo })}
            >
              Save & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {!canComplete && (
            <p className="text-sm text-slate-500 text-center">
              Describe how you fixed it ({20 - howYouFixedIt.length} more characters)
            </p>
          )}
        </>
      )}
    </div>
  );
}
