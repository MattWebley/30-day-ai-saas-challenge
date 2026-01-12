import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Check,
  Shield,
  Users,
  Lock,
  CheckCircle2,
  Copy
} from "lucide-react";
import { toast } from "sonner";

interface Day12LetUsersInProps {
  onComplete: (data: {
    hasAuth: boolean;
    authAdded: boolean;
    testPassed: boolean;
  }) => void;
}

export function Day12LetUsersIn({ onComplete }: Day12LetUsersInProps) {
  const [step, setStep] = useState<"check" | "add" | "test" | "done">("check");
  const [hasAuth, setHasAuth] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [testPassed, setTestPassed] = useState(false);

  const authPrompt = `Add user authentication. I need:
- Login/signup button in the header
- Show the user's name when logged in
- Logout button
- Each user should only see their own data`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Check if auth exists */}
      {step === "check" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Check: Does your app have authentication?</h4>
              </div>
            </div>

            <p className="text-slate-700 mb-4">
              Ask Replit Agent: "Does my app have user authentication? Can users sign up, log in, and see only their own data?"
            </p>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Good news:</strong> Replit often adds auth automatically when you build. Check before adding it again!
              </p>
            </div>

            <p className="text-slate-700 font-medium mb-4">What did Replit say?</p>

            <div className="space-y-3">
              <button
                onClick={() => setHasAuth(true)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  hasAuth === true
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-5 h-5 ${hasAuth === true ? "text-green-600" : "text-slate-400"}`} />
                  <span className="text-slate-700 font-medium">Yes, auth is already set up</span>
                </div>
              </button>

              <button
                onClick={() => setHasAuth(false)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  hasAuth === false
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className={`w-5 h-5 ${hasAuth === false ? "text-amber-600" : "text-slate-400"}`} />
                  <span className="text-slate-700 font-medium">No, I need to add authentication</span>
                </div>
              </button>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep(hasAuth ? "test" : "add")}
            disabled={hasAuth === null}
          >
            Continue <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Add Auth (if needed) */}
      {step === "add" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Add Authentication</h4>
                <p className="text-slate-600 text-sm">Copy this prompt to Replit Agent or Claude Code</p>
              </div>
            </div>

            <div className="relative">
              <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 whitespace-pre-wrap">
                {authPrompt}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={() => copyToClipboard(authPrompt)}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700 text-sm">
                Replit will handle all the hard stuff - OAuth, sessions, tokens, security. You just describe what you want.
              </p>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("test")}
          >
            I've Added Auth <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Test Auth */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Test: Does each user see only their data?</h4>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-slate-700">Run this test to make sure auth is working correctly:</p>

              <ol className="list-decimal list-inside space-y-3 text-slate-700">
                <li className="p-3 bg-slate-50 rounded-lg">Sign up with a test email (e.g., test1@example.com)</li>
                <li className="p-3 bg-slate-50 rounded-lg">Add some data in your app</li>
                <li className="p-3 bg-slate-50 rounded-lg">Log out</li>
                <li className="p-3 bg-slate-50 rounded-lg">Sign up with a DIFFERENT email (e.g., test2@example.com)</li>
                <li className="p-3 bg-slate-50 rounded-lg">Check: Can you see the first account's data?</li>
              </ol>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>Pass:</strong> Each account only sees its own data.
                </p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>Fail:</strong> You can see the other account's data. Tell Claude Code: "Each user should only see their own data, not other users' data."
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="testPassed"
                checked={testPassed}
                onChange={(e) => setTestPassed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
              <label htmlFor="testPassed" className="text-slate-700 font-medium">
                Test passed - each user sees only their own data
              </label>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("done")}
            disabled={!testPassed}
          >
            Auth is Working <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">Users Can Log In!</h4>
                <p className="text-green-700">
                  Your app is no longer single-player. Each user has their own account and data.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What Auth Gives You</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Users can create accounts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Each person sees only their data</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Data persists when they return</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>You can identify who to charge (later)</span>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => onComplete({
              hasAuth: true,
              authAdded: hasAuth === false,
              testPassed: true,
            })}
          >
            Complete Day 12 <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
