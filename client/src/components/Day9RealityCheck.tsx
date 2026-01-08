import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";

interface Day9RealityCheckProps {
  userIdea: string;
  onComplete: (data: {
    workingWell: string;
    needsFix: string;
    biggestWin: string;
    topPriority: string;
  }) => void;
}

export function Day9RealityCheck({ userIdea, onComplete }: Day9RealityCheckProps) {
  const [step, setStep] = useState<"test" | "document" | "prioritize">("test");
  const [workingWell, setWorkingWell] = useState("");
  const [needsFix, setNeedsFix] = useState("");
  const [biggestWin, setBiggestWin] = useState("");
  const [topPriority, setTopPriority] = useState("");

  const canProceedToDocument = true; // Always can proceed after reading instructions
  const canProceedToPrioritize = workingWell.length >= 10 && needsFix.length >= 10;
  const canComplete = biggestWin.length >= 10 && topPriority.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">The Reality Check</h3>
        <p className="text-slate-600 mt-1">Test your app like a real user and document what you find.</p>
      </Card>

      {/* Step 1: Test Instructions */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your Testing Mission</h4>
            <p className="text-slate-600 mb-4">
              Open your app in a new browser tab and pretend you're a first-time user. Go through the entire experience:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">1</div>
                <p className="text-sm text-slate-700">Land on the homepage - does it make sense?</p>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">2</div>
                <p className="text-sm text-slate-700">Try to use the main feature - does it work?</p>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">3</div>
                <p className="text-sm text-slate-700">Click every button - do they do what you expect?</p>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">4</div>
                <p className="text-sm text-slate-700">Try to break it - enter weird data, click things twice</p>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">5</div>
                <p className="text-sm text-slate-700">Note EVERYTHING - what works, what doesn't, what confuses you</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800">
              <strong>Be honest with yourself.</strong> This isn't about feeling good - it's about knowing exactly where you stand. Finding problems now is a WIN, not a failure.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("document")}
          >
            I've Tested My App <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Document Findings */}
      {step === "document" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What's Working Well?</h4>
            <p className="text-sm text-slate-600 mb-4">
              List everything that works. These are your wins - celebrate them!
            </p>
            <Textarea
              placeholder="The homepage loads correctly...
The main form saves data...
The design looks clean..."
              value={workingWell}
              onChange={(e) => setWorkingWell(e.target.value)}
              className="min-h-[120px] bg-white"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What Needs Fixing?</h4>
            <p className="text-sm text-slate-600 mb-4">
              List every issue, bug, or thing that's missing. Be specific.
            </p>
            <Textarea
              placeholder="The submit button doesn't respond...
Error messages aren't helpful...
Missing the ability to delete items..."
              value={needsFix}
              onChange={(e) => setNeedsFix(e.target.value)}
              className="min-h-[120px] bg-white"
            />
          </Card>

          {canProceedToPrioritize && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("prioritize")}
            >
              Continue to Prioritize <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {!canProceedToPrioritize && (
            <p className="text-sm text-slate-500 text-center">
              Fill in both sections to continue
            </p>
          )}
        </>
      )}

      {/* Step 3: Prioritize */}
      {step === "prioritize" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-2">Reality Check Complete!</h4>
            <p className="text-slate-700">
              You now have a clear picture of where your app stands. That's huge - most people skip this step and launch broken products.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Your Biggest Win So Far</h4>
            <p className="text-sm text-slate-600 mb-4">
              What's the ONE thing about your app that makes you proud?
            </p>
            <Textarea
              placeholder="I'm most proud of..."
              value={biggestWin}
              onChange={(e) => setBiggestWin(e.target.value)}
              className="min-h-[80px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Top Priority to Fix</h4>
            <p className="text-sm text-slate-600 mb-4">
              What's the ONE thing you MUST fix before anything else?
            </p>
            <Textarea
              placeholder="The most important thing to fix is..."
              value={topPriority}
              onChange={(e) => setTopPriority(e.target.value)}
              className="min-h-[80px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ workingWell, needsFix, biggestWin, topPriority })}
            >
              Save Reality Check & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {!canComplete && (
            <p className="text-sm text-slate-500 text-center">
              Complete both sections to continue
            </p>
          )}
        </>
      )}
    </div>
  );
}
