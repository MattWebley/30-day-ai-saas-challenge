import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  ArrowRight,
  Check,
  HelpCircle
} from "lucide-react";

interface Day15AuthenticationProps {
  appName: string;
  onComplete: (data: { hasAuth: boolean; authStatus: string; testResult: string }) => void;
}

export function Day15Authentication({ appName, onComplete }: Day15AuthenticationProps) {
  const [step, setStep] = useState<"check" | "add" | "test">("check");
  const [hasAuth, setHasAuth] = useState<boolean | null>(null);
  const [testResult, setTestResult] = useState("");

  const canComplete = testResult.length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Let Users In</h3>
        <p className="text-slate-600 mt-1">Auth = managing who can access what. Replit usually handles this for you.</p>
      </Card>

      {/* Step 1: Check if you already have auth */}
      {step === "check" && (
        <>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <h4 className="font-bold text-lg mb-2 text-amber-900">Step 1: Check If You Already Have Auth</h4>
            <p className="text-sm text-amber-800 mb-3">
              Ask Replit Agent:
            </p>
            <div className="bg-white/60 p-3 rounded-lg mb-3">
              <p className="text-sm text-amber-900 italic">"Does my app have user authentication? Can users log in and see only their own data?"</p>
            </div>
            <p className="text-sm text-amber-800">
              Replit may have already built this for you. Check before adding anything new.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Does Your App Have Auth?</h4>

            <div className="space-y-3">
              <div
                onClick={() => setHasAuth(true)}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  hasAuth === true
                    ? "border-green-400 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  hasAuth === true ? "bg-green-500" : "bg-slate-200"
                }`}>
                  {hasAuth === true && <Check className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">Yes, auth already exists</p>
                  <p className="text-sm text-slate-600">Users can log in and see their own data</p>
                </div>
              </div>

              <div
                onClick={() => setHasAuth(false)}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  hasAuth === false
                    ? "border-slate-400 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  hasAuth === false ? "bg-slate-500" : "bg-slate-200"
                }`}>
                  {hasAuth === false && <HelpCircle className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">No, I need to add it</p>
                  <p className="text-sm text-slate-600">Everyone sees everyone's data right now</p>
                </div>
              </div>
            </div>
          </Card>

          {hasAuth !== null && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep(hasAuth ? "test" : "add")}
            >
              {hasAuth ? "Test My Auth" : "Add Auth"} <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Add Auth (only if needed) */}
      {step === "add" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Step 2: Ask Replit to Add Auth</h4>
            <p className="text-sm text-slate-600 mb-4">
              Tell Replit Agent exactly what you need:
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700 italic">
                "Add user authentication to my app. I need:
              </p>
              <ul className="text-sm text-slate-700 italic mt-2 ml-4 space-y-1">
                <li>• A login/signup button in the header</li>
                <li>• Show the user's name when logged in</li>
                <li>• A logout button</li>
                <li>• Each user should only see their own data"</li>
              </ul>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-700">
              <strong>That's it.</strong> Replit handles the hard stuff - OAuth, sessions, tokens, security. You just describe what you want.
            </p>
          </Card>

          <Card className="p-4 border-2 border-green-200 bg-green-50">
            <p className="text-sm text-green-800">
              <strong>Don't overthink this.</strong> Auth is just "who are you?" so the app shows you YOUR stuff. Get it working, move on.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("test")}
          >
            I Added Auth - Test It <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Test */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <h4 className="font-bold text-lg mb-2 text-green-900">
              {hasAuth ? "Auth Already Working!" : "Auth Added!"}
            </h4>
            <p className="text-green-800">
              Now let's make sure it actually works.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Quick Auth Test</h4>
            <p className="text-sm text-slate-600 mb-4">
              Do this simple test and tell me what happened:
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
              <ol className="text-sm text-slate-700 space-y-2">
                <li><strong>1.</strong> Log in as a user</li>
                <li><strong>2.</strong> Create some data (save something)</li>
                <li><strong>3.</strong> Log out</li>
                <li><strong>4.</strong> Log back in - is your data still there?</li>
                <li><strong>5.</strong> (Bonus) Log in as a different user - can you see the first user's data?</li>
              </ol>
            </div>

            <Textarea
              placeholder="I tested it:
- Logged in as [user] ✓
- Created data: [what you saved]
- Logged out and back in: [data was/wasn't there]
- Different user test: [could/couldn't see other user's data]"
              value={testResult}
              onChange={(e) => setTestResult(e.target.value)}
              className="min-h-[140px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                hasAuth: hasAuth ?? true,
                authStatus: hasAuth ? "Already had auth" : "Added auth with Replit",
                testResult
              })}
            >
              Save & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
