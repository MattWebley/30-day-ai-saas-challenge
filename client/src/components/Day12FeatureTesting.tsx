import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  TestTube2,
  CheckCircle2,
  ChevronRight,
  Trophy,
  ArrowRight,
  AlertCircle,
  Bug
} from "lucide-react";

interface Day12FeatureTestingProps {
  onComplete: (data: {
    featuresTestedCount: number;
    bugsFound: string;
    bugsFixed: string;
    appStatus: string;
  }) => void;
}

export function Day12FeatureTesting({ onComplete }: Day12FeatureTestingProps) {
  const [step, setStep] = useState<"test" | "document" | "fix">("test");
  const [featuresCount, setFeaturesCount] = useState<number>(0);
  const [bugsFound, setBugsFound] = useState("");
  const [bugsFixed, setBugsFixed] = useState("");
  const [appStatus, setAppStatus] = useState("");

  const canProceedToDocument = true;
  const canProceedToFix = bugsFound.length >= 10;
  const canComplete = appStatus.length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <TestTube2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Test Every Feature</h3>
            <p className="text-slate-600 mt-1">Click every button. Try to break things. Find bugs before users do.</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Testing Mission */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your Testing Mission</h4>
            <p className="text-sm text-slate-600 mb-4">
              Go through your ENTIRE app and test every feature. For each feature, ask:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">Happy Path</p>
                <p className="text-xs text-green-700">Does the normal use case work?</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">Edge Cases</p>
                <p className="text-xs text-amber-700">What happens with weird input? Empty data? Really long text?</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium">Error Handling</p>
                <p className="text-xs text-red-700">What happens when things fail? Are errors helpful?</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">Speed</p>
                <p className="text-xs text-blue-700">Is everything fast enough? Anything annoyingly slow?</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800">
              <strong>Test like a user, not a developer.</strong> Pretend you've never seen this app before.
              Click things you're not supposed to. Enter data that doesn't make sense.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("document")}
          >
            I've Tested Everything <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Document Findings */}
      {step === "document" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">How Many Features Did You Test?</h4>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFeaturesCount(num)}
                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                      featuresCount === num
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {num}+
                  </button>
                ))}
              </div>
              <span className="text-sm text-slate-600">features tested</span>
            </div>
          </Card>

          <Card className="p-6 border-2 border-red-200 bg-red-50">
            <div className="flex items-center gap-3 mb-3">
              <Bug className="w-6 h-6 text-red-600" />
              <h4 className="font-bold text-lg text-red-900">Bugs Found</h4>
            </div>
            <p className="text-sm text-red-700 mb-4">
              List every bug, issue, or thing that didn't work as expected:
            </p>
            <Textarea
              placeholder="1. [Button X] doesn't respond when clicked
2. Error message on [page Y] isn't helpful
3. [Feature Z] is slow - takes 10+ seconds
4. No validation on [form field]
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
              Continue <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 3: Fix or Acknowledge */}
      {step === "fix" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Bugs Fixed Today</h4>
            <p className="text-sm text-slate-600 mb-4">
              Did you fix any of the bugs you found? List what you fixed (or "none yet" if you need more time):
            </p>
            <Textarea
              placeholder="Fixed:
- [Bug 1] - changed X to do Y
- [Bug 2] - added validation

Still need to fix:
- [Bug 3] - will tackle tomorrow"
              value={bugsFixed}
              onChange={(e) => setBugsFixed(e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Overall App Status</h4>
            <p className="text-sm text-slate-600 mb-4">
              After all this testing, how would you describe your app's current state?
            </p>
            <Textarea
              placeholder="My app is [ready/almost ready/needs work] because..."
              value={appStatus}
              onChange={(e) => setAppStatus(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">You Just Did QA!</h4>
            </div>
            <p className="text-slate-700">
              Most indie hackers skip this step and launch broken products.
              You now know exactly what works and what doesn't. That's powerful.
            </p>
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() =>
                onComplete({
                  featuresTestedCount: featuresCount,
                  bugsFound,
                  bugsFixed,
                  appStatus,
                })
              }
            >
              <CheckCircle2 className="w-5 h-5" />
              Save Testing Results & Continue
            </Button>
          )}
        </>
      )}
    </div>
  );
}
