import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface Day17OnboardingProps {
  appName: string;
  onComplete: (data: { firstSuccess: string; onboardingTime: string; onboardingResult: string }) => void;
}

export function Day17Onboarding({ appName, onComplete }: Day17OnboardingProps) {
  const [step, setStep] = useState<"define" | "build" | "test">("define");
  const [firstSuccess, setFirstSuccess] = useState("");
  const [onboardingTime, setOnboardingTime] = useState("");
  const [onboardingResult, setOnboardingResult] = useState("");

  const canProceedToBuild = firstSuccess.length >= 15;
  const canProceedToTest = true;
  const canComplete = onboardingTime !== "" && onboardingResult.length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">User Onboarding</h3>
        <p className="text-slate-600 mt-1">Get new users to their "aha moment" as fast as possible.</p>
      </Card>

      {/* Step 1: Define First Success */}
      {step === "define" && (
        <>
          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-700">
              <p className="font-medium">The 2-Minute Rule</p>
              <p className="mt-1">
                Within 2 minutes of signing up, users should understand what your app does,
                complete ONE action, and see value from it. If it takes longer, they'll leave.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What's Their First Success?</h4>
            <p className="text-sm text-slate-600 mb-4">
              What ONE action should new users complete to "get" your app? This is the moment they say "Oh, this is cool!"
            </p>

            <div className="space-y-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">"Generate their first AI output"</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">"Save their first item"</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">"See their first analysis result"</p>
              </div>
            </div>

            <Textarea
              placeholder="New users should [complete what action] within their first 2 minutes. They'll know it worked when they see [what result]..."
              value={firstSuccess}
              onChange={(e) => setFirstSuccess(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          {canProceedToBuild && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("build")}
            >
              Build Onboarding Flow <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Build the Onboarding */}
      {step === "build" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">First Success Goal</h4>
            <p className="text-slate-800 bg-white p-4 rounded-lg border border-slate-200">
              "{firstSuccess}"
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Build the Path to First Success</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Welcome message with their name</p>
                  <p className="text-sm text-slate-600">Make it personal, make it quick</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Point them directly to the main feature</p>
                  <p className="text-sm text-slate-600">No tours, no explanations - let them DO</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Pre-fill with example data</p>
                  <p className="text-sm text-slate-600">So they can click "Go" immediately</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Show a success message</p>
                  <p className="text-sm text-slate-600">"Nice! You just [did thing]" - celebrate the win</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Tell Claude Code</h4>
            <p className="text-sm text-slate-600 mb-4">Describe what to build:</p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 font-mono">
              "Add onboarding for new users:<br /><br />
              1. When they first sign in, show a welcome<br />
              2. Take them to [main feature]<br />
              3. Pre-fill with [example data]<br />
              4. After they complete it, show success<br />
              5. Mark onboarding as done so they don't see it again"
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("test")}
          >
            I Built It - Time to Test <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Test with Fresh Account */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Onboarding Built!</h4>
            <p className="text-slate-700">
              Now let's verify that new users can reach their first success quickly.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Time the Onboarding</h4>
            <p className="text-sm text-slate-600 mb-4">
              Create a fresh account (or clear your data) and time how long it takes to reach first success.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-sm font-medium text-slate-700">Time to first success:</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  value={onboardingTime}
                  onChange={(e) => setOnboardingTime(e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-slate-600">seconds</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${Number(onboardingTime) <= 60 ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200"}`}>
                <p className={`text-sm font-medium ${Number(onboardingTime) <= 60 ? "text-green-800" : "text-slate-700"}`}>
                  Under 60 seconds = Excellent
                </p>
              </div>
              <div className={`p-3 rounded-lg ${Number(onboardingTime) > 60 && Number(onboardingTime) <= 120 ? "bg-amber-50 border border-amber-200" : "bg-slate-50 border border-slate-200"}`}>
                <p className={`text-sm font-medium ${Number(onboardingTime) > 60 && Number(onboardingTime) <= 120 ? "text-amber-800" : "text-slate-700"}`}>
                  60-120 seconds = Acceptable
                </p>
              </div>
              <div className={`p-3 rounded-lg ${Number(onboardingTime) > 120 ? "bg-red-50 border border-red-200" : "bg-slate-50 border border-slate-200"}`}>
                <p className={`text-sm font-medium ${Number(onboardingTime) > 120 ? "text-red-800" : "text-slate-700"}`}>
                  Over 120 seconds = Needs work
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Document the Experience</h4>
            <p className="text-sm text-slate-600 mb-4">
              What was it like going through onboarding as a new user?
            </p>
            <Textarea
              placeholder="As a new user, I:
1. Signed up and saw [welcome message]
2. Was taken to [where]
3. Completed [action] in [X] seconds
4. The result was [good/confusing/needs work]
5. I would improve [what]..."
              value={onboardingResult}
              onChange={(e) => setOnboardingResult(e.target.value)}
              className="min-h-[140px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ firstSuccess, onboardingTime: `${onboardingTime} seconds`, onboardingResult })}
            >
              Save Onboarding & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
