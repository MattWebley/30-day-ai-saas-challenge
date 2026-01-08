import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ArrowRight } from "lucide-react";

interface Day11TestUSPProps {
  userIdea: string;
  onComplete: (data: { uspDescription: string; uspDemo: string; wouldPay: string }) => void;
}

export function Day11TestUSP({ userIdea, onComplete }: Day11TestUSPProps) {
  const [step, setStep] = useState<"define" | "test" | "validate">("define");
  const [uspDescription, setUspDescription] = useState("");
  const [uspDemo, setUspDemo] = useState("");
  const [wouldPay, setWouldPay] = useState("");

  const canProceedToTest = uspDescription.length >= 20;
  const canProceedToValidate = uspDemo.length >= 20;
  const canComplete = wouldPay.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Prove Your USP Works</h3>
        <p className="text-slate-600 mt-1">Your unique selling point is your weapon. Let's make sure it's sharp.</p>
      </Card>

      {/* Step 1: Define Your USP */}
      {step === "define" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What Makes You Different?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Your USP is the ONE thing that makes your app different from competitors.
              It's not a feature list - it's the reason someone chooses YOU.
            </p>
            <Textarea
              placeholder="My app is the only one that [does X] for [specific audience] because [unique reason]."
              value={uspDescription}
              onChange={(e) => setUspDescription(e.target.value)}
              className="min-h-[100px]"
            />
            {userIdea && (
              <p className="text-xs text-slate-500 mt-2">Your app: {userIdea}</p>
            )}
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="font-medium mb-1 text-sm text-slate-700">Good USP examples:</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>- "Generate 10 social posts in 30 seconds from any blog URL"</li>
              <li>- "The only CRM that syncs with your calendar automatically"</li>
              <li>- "Turn voice notes into structured meeting minutes instantly"</li>
            </ul>
          </Card>

          {canProceedToTest && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("test")}
            >
              Test My USP <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Test the USP */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your USP</h4>
            <p className="text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200">
              "{uspDescription}"
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Now Prove It Works</h4>
            <p className="text-sm text-slate-600 mb-4">
              Go to your app and use the USP feature right now. Then describe what happened:
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">1</div>
                <p className="text-sm text-slate-700">Open your app</p>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">2</div>
                <p className="text-sm text-slate-700">Use the USP feature from start to finish</p>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">3</div>
                <p className="text-sm text-slate-700">Time how long it takes</p>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">4</div>
                <p className="text-sm text-slate-700">Check if the result is actually useful</p>
              </div>
            </div>

            <Textarea
              placeholder="I tested my USP and here's what happened:
- I did [action]
- It took [X seconds/minutes]
- The result was [describe output]
- It worked / didn't work because [reason]"
              value={uspDemo}
              onChange={(e) => setUspDemo(e.target.value)}
              className="min-h-[150px]"
            />
          </Card>

          {canProceedToValidate && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("validate")}
            >
              Continue <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 3: Validate */}
      {step === "validate" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-2">USP Tested!</h4>
            <p className="text-slate-700">
              You've proven your USP works in practice, not just theory.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">The Money Question</h4>
            <p className="text-sm text-slate-600 mb-4">
              Be honest: Based on what you just tested, would someone pay $10/month for this?
            </p>
            <Textarea
              placeholder="Yes/No, because..."
              value={wouldPay}
              onChange={(e) => setWouldPay(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="font-medium text-sm text-slate-900">If you said "No" - that's valuable information!</p>
            <p className="mt-1 text-sm text-slate-700">
              Consider: Can you improve the USP? Is there a different feature that would be more valuable?
              It's better to pivot now than after launch.
            </p>
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ uspDescription, uspDemo, wouldPay })}
            >
              Save USP Test & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
