import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, Target, Bug, Zap } from "lucide-react";

interface Day18TestEverythingProps {
  userIdea: string;
  onComplete: (data: {
    uspDescription: string;
    uspWorks: boolean;
    bugsFound: string;
    bugsFixes: string;
    overallStatus: string;
  }) => void;
}

export function Day18TestEverything({ userIdea, onComplete }: Day18TestEverythingProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"usp" | "features" | "fix" | "summary">("usp");
  const [uspDescription, setUspDescription] = useState("");
  const [uspWorks, setUspWorks] = useState<boolean | null>(null);
  const [bugsFound, setBugsFound] = useState("");
  const [bugsFixes, setBugsFixes] = useState("");
  const [overallStatus, setOverallStatus] = useState("");

  const canProceedToFeatures = uspDescription.length >= 20 && uspWorks !== null;
  const canProceedToFix = bugsFound.length >= 10;
  const canProceedToSummary = bugsFixes.length >= 10;
  const canComplete = overallStatus.length >= 20;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: USP Testing */}
      {step === "usp" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Test Your USP</h3>
                <p className="text-slate-600">Your unique selling point is your weapon. Does it work?</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What's Your USP?</h4>
            <p className="text-slate-600 mb-4">
              Describe the ONE thing that makes your app different from competitors:
            </p>
            <Textarea
              placeholder="My app is the only one that [does X] for [specific audience] because [unique reason]."
              value={uspDescription}
              onChange={(e) => setUspDescription(e.target.value)}
              className="min-h-[100px] bg-white"
            />
            {userIdea && (
              <p className="text-slate-500 text-sm mt-2">Your app: {userIdea}</p>
            )}
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-4">Now Test It</h4>
            <div className="space-y-2 mb-4 text-slate-700">
              <p>1. Open your app</p>
              <p>2. Use the USP feature from start to finish</p>
              <p>3. Time how long it takes</p>
              <p>4. Check if the result is actually useful</p>
            </div>

            <p className="text-slate-700 font-medium mb-3">Does your USP feature work as intended?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setUspWorks(true)}
                className={`flex-1 p-4 rounded-lg border-2 text-center font-medium transition-colors ${
                  uspWorks === true
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                Yes, it works!
              </button>
              <button
                onClick={() => setUspWorks(false)}
                className={`flex-1 p-4 rounded-lg border-2 text-center font-medium transition-colors ${
                  uspWorks === false
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                Needs work
              </button>
            </div>
          </Card>

          {uspWorks === false && (
            <Card className="p-4 border-2 border-amber-200 bg-amber-50">
              <p className="text-amber-800">
                <strong>That's valuable information!</strong> Consider going back to Day 17 to improve your USP before continuing. A weak USP makes everything harder.
              </p>
            </Card>
          )}

          {canProceedToFeatures && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("features")}
            >
              Test All Features <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Feature Testing */}
      {step === "features" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Test Everything Else</h3>
                <p className="text-slate-600">Click every button. Try to break things.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-4">Testing Checklist</h4>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 font-medium">Try to break it:</p>
                <p className="text-slate-600 text-sm">Submit empty forms. Enter garbage. Paste a novel into text boxes.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 font-medium">Check error handling:</p>
                <p className="text-slate-600 text-sm">When things fail, do you know WHY? Are error messages helpful?</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 font-medium">Check loading states:</p>
                <p className="text-slate-600 text-sm">Is there a spinner? Do you know when something worked?</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 font-medium">Test on mobile:</p>
                <p className="text-slate-600 text-sm">Open on your actual phone. Does everything work?</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Bugs Found</h4>
            <p className="text-slate-600 mb-4">
              List everything that's broken, slow, or confusing:
            </p>
            <Textarea
              placeholder="1. [Button X] doesn't respond when clicked
2. Error message on [page Y] isn't helpful
3. [Feature Z] is slow - takes 10+ seconds
4. Mobile layout broken on [screen]
(or 'No bugs found - everything works!')"
              value={bugsFound}
              onChange={(e) => setBugsFound(e.target.value)}
              className="min-h-[150px] bg-white"
            />
          </Card>

          {canProceedToFix && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("fix")}
            >
              Fix the Bugs <Bug className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 3: Fix */}
      {step === "fix" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Bug className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Fix What's Broken</h3>
                <p className="text-slate-600">Every bug you fix now is one your users won't hit.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Bugs You Found</h4>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap">
              {bugsFound}
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What Did You Fix?</h4>
            <p className="text-slate-600 mb-4">
              Work through your bug list with Claude Code. What did you fix?
            </p>
            <Textarea
              placeholder="Fixed:
- [Bug 1] - changed X to do Y
- [Bug 2] - added validation

Still need to fix later:
- [Bug 3] - not critical for launch"
              value={bugsFixes}
              onChange={(e) => setBugsFixes(e.target.value)}
              className="min-h-[150px] bg-white"
            />
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-600">
              <strong>Tip:</strong> Fix critical bugs now. Minor issues can wait until after launch. The goal is "good enough to ship" not "perfect."
            </p>
          </Card>

          {canProceedToSummary && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("summary")}
            >
              Continue <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 4: Summary */}
      {step === "summary" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">Testing Complete!</h4>
                <p className="text-green-700">
                  You just did what most founders skip entirely.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Testing Summary</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-5 h-5 ${uspWorks ? "text-green-600" : "text-amber-600"}`} />
                <span className="text-slate-700">USP: {uspWorks ? "Working" : "Needs work"}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <span className="text-slate-700">Features tested & bugs addressed</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Overall App Status</h4>
            <p className="text-slate-600 mb-4">
              After all this testing, how confident are you in your app?
            </p>
            <Textarea
              placeholder="My app is ready/almost ready/needs more work because..."
              value={overallStatus}
              onChange={(e) => setOverallStatus(e.target.value)}
              className="min-h-[100px] bg-white"
            />
          </Card>

          <Card className="p-4 border-2 border-blue-200 bg-blue-50">
            <p className="text-blue-800">
              <strong>You now know exactly what works.</strong> That's more than most founders know when they launch. Tomorrow: making it look beautiful.
            </p>
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() =>
                onComplete({
                  uspDescription,
                  uspWorks: uspWorks || false,
                  bugsFound,
                  bugsFixes,
                  overallStatus,
                })
              }
            >
              Complete Day 18 <CheckCircle2 className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
