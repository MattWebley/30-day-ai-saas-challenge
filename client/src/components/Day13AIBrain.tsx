import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Trophy,
  ArrowRight,
  ExternalLink,
  Zap
} from "lucide-react";

interface Day13AIBrainProps {
  userIdea: string;
  onComplete: (data: { aiFeature: string; aiTestResult: string; aiWow: string }) => void;
}

export function Day13AIBrain({ userIdea, onComplete }: Day13AIBrainProps) {
  const [step, setStep] = useState<"plan" | "build" | "test">("plan");
  const [aiFeature, setAiFeature] = useState("");
  const [aiTestResult, setAiTestResult] = useState("");
  const [aiWow, setAiWow] = useState("");

  const canProceedToBuild = aiFeature.length >= 20;
  const canProceedToTest = true;
  const canComplete = aiTestResult.length >= 20 && aiWow.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Add The AI Brain</h3>
            <p className="text-slate-600 mt-1">Give your app intelligence. This is what makes AI SaaS special.</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Plan the AI Feature */}
      {step === "plan" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What Will AI Do In Your App?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Describe ONE AI-powered feature that will make users say "wow":
            </p>
            <Textarea
              placeholder="AI will [do what] when users [do what action].

Example: 'AI will generate 5 social media posts when users paste a blog URL'
Example: 'AI will analyze uploaded data and give actionable insights'
Example: 'AI will answer questions about the user's documents'"
              value={aiFeature}
              onChange={(e) => setAiFeature(e.target.value)}
              className="min-h-[120px]"
            />
            {userIdea && (
              <p className="text-xs text-slate-500 mt-2">Your app: {userIdea}</p>
            )}
          </Card>

          <Card className="p-4 border-2 border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Cost is low</p>
                <p className="mt-1">
                  GPT-3.5: ~$0.002 per 1K tokens (500 calls for $1)<br />
                  GPT-4: ~$0.06 per 1K tokens (more capable but pricier)
                </p>
              </div>
            </div>
          </Card>

          {canProceedToBuild && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("build")}
            >
              Build This AI Feature <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Build It */}
      {step === "build" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your AI Feature</h4>
            <p className="text-slate-800 bg-white p-4 rounded-lg border border-slate-200">
              "{aiFeature}"
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Setup Checklist</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Get OpenAI API Key</p>
                  <a
                    href="https://platform.openai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    platform.openai.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Add to Replit Secrets</p>
                  <p className="text-sm text-slate-600">Key name: OPENAI_API_KEY</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Tell Claude Code what to build</p>
                  <p className="text-sm text-slate-600">
                    "Add an AI feature that [your description]. Use the OpenAI API with OPENAI_API_KEY from secrets."
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Test it!</p>
                  <p className="text-sm text-slate-600">Try the AI feature yourself</p>
                </div>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("test")}
          >
            <CheckCircle2 className="w-5 h-5" />
            I Built It - Let's Test!
          </Button>
        </>
      )}

      {/* Step 3: Test and Document */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">Your App Has AI!</h4>
            </div>
            <p className="text-slate-700">
              You've added intelligence to your product. This is what separates you from basic tools.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Test Result</h4>
            <p className="text-sm text-slate-600 mb-4">
              You tested the AI feature. What happened?
            </p>
            <Textarea
              placeholder="I gave it [input] and it returned [output]. It took about [X seconds]. The result was [useful/not useful] because..."
              value={aiTestResult}
              onChange={(e) => setAiTestResult(e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">The Wow Factor</h4>
            <p className="text-sm text-slate-600 mb-4">
              When you saw it work, what was your reaction?
            </p>
            <Textarea
              placeholder="This is impressive because... / This needs improvement because..."
              value={aiWow}
              onChange={(e) => setAiWow(e.target.value)}
              className="min-h-[80px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ aiFeature, aiTestResult, aiWow })}
            >
              Save AI Feature & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
