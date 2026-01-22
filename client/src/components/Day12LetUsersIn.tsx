import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Users,
  Lock,
  CheckCircle2,
  Copy,
  BarChart3,
  Terminal
} from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Day12LetUsersInProps {
  onComplete: (data: {
    hasAuth: boolean;
    authAdded: boolean;
    testPassed: boolean;
    adminDashboard: boolean;
  }) => void;
}

export function Day12LetUsersIn({ onComplete }: Day12LetUsersInProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"check" | "add" | "test" | "admin" | "done">("check");
  const [hasAuth, setHasAuth] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [adminBuilt, setAdminBuilt] = useState(false);
  const { toast: toastHook } = useToast();

  const authPrompt = `Add user authentication. I need:
- Login/signup button in the header
- Show the user's name when logged in
- Logout button
- Each user should only see their own data`;

  const adminPrompt = `Create an admin page at /admin that only I can access. Show me:
- Total users (how many have ever signed up)
- New users this week
- Active users this week (anyone who logged in)
- Total [main actions] in the app
- A list of the last 20 [main actions] with username and timestamp`;

  const copyPrompt = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toastHook({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="space-y-6">
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

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("check")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("test")}
            >
              I've Added Auth <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
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
              <p className="text-slate-700">Run this test to make sure auth is working correctly</p>

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
                  <strong>Fail</strong> - You can see the other account's data. Tell Claude Code "Each user should only see their own data, not other users' data."
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

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(hasAuth ? "check" : "add")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("admin")}
              disabled={!testPassed}
            >
              Auth is Working <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Admin Dashboard */}
      {step === "admin" && (
        <>
          {/* Claude Code Guide Reminder */}
          <Link href="/claude-code">
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Open the Claude Code Guide</p>
                  <p className="text-slate-600 text-sm">Use the prompts there to start your session.</p>
                </div>
              </div>
            </div>
          </Link>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Now You Have Users... Track Them!</h4>
                <p className="text-slate-600 text-sm">Build a simple admin dashboard</p>
              </div>
            </div>

            <p className="text-slate-700 mb-4">
              You have authentication. People can sign up. But how many? Are they coming back? Are they actually USING the thing?
            </p>

            <p className="text-slate-700 mb-4">
              Don't guess. KNOW. Build a simple admin page that shows you the numbers.
            </p>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-6">
              <p className="text-purple-900 font-bold mb-2">The 4 Numbers You Need</p>
              <ol className="text-purple-800 space-y-1 list-decimal list-inside">
                <li><strong>Total users</strong> - how many have ever signed up</li>
                <li><strong>New this week</strong> - are people still finding you?</li>
                <li><strong>Active this week</strong> - are they coming back?</li>
                <li><strong>Total actions</strong> - are they doing the thing?</li>
              </ol>
            </div>

            <div className="relative mb-6">
              <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 whitespace-pre-wrap">
                {adminPrompt}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={() => copyPrompt(adminPrompt, "Admin dashboard prompt")}
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg mb-6">
              <p className="text-slate-700 text-sm">
                <strong>Replace [main actions]</strong> with whatever people DO in your app - "tasks created", "recipes saved", "reports generated", etc.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <p className="text-amber-900 font-bold mb-3">🚀 Want More? Add These Too</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-amber-800 text-sm">
                <div className="flex items-start gap-2">
                  <span>💰</span>
                  <span><strong>Revenue today/week/month</strong> - if you have payments</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>⭐</span>
                  <span><strong>Power users</strong> - who's using it the most?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>🔥</span>
                  <span><strong>User streaks</strong> - who's coming back daily?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>📊</span>
                  <span><strong>Feature popularity</strong> - what do people use most?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>⏱️</span>
                  <span><strong>Time to first action</strong> - how fast do new users engage?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>🎯</span>
                  <span><strong>Conversion funnel</strong> - signup → action → return</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>🌍</span>
                  <span><strong>Where are users from?</strong> - countries/timezones</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>📱</span>
                  <span><strong>Device breakdown</strong> - mobile vs desktop</span>
                </div>
              </div>
              <p className="text-amber-700 text-sm mt-3 italic">
                Start with the basics. Add the fun stuff later when you're curious.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="adminBuilt"
                checked={adminBuilt}
                onChange={(e) => setAdminBuilt(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
              <label htmlFor="adminBuilt" className="text-slate-700 font-medium">
                I've built my admin dashboard
              </label>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("test")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("done")}
              disabled={!adminBuilt}
            >
              Dashboard Built <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">Auth + Admin Dashboard Done!</h4>
                <p className="text-green-700">
                  Users can log in AND you can see what's happening inside your app.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What You Now Have</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Users can create accounts and log in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Each person sees only their data</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>You know how many users you have</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>You can see if they're coming back</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>You can see if they're using the features</span>
              </div>
            </div>
          </Card>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-slate-700 text-sm">
              <strong>Pro tip:</strong> Check your admin dashboard every day. The numbers tell you what to fix. "50 signups but only 5 came back" = onboarding problem. "Users signing up but not using the feature" = feature problem.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("admin")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                hasAuth: true,
                authAdded: hasAuth === false,
                testPassed: true,
                adminDashboard: true,
              })}
            >
              Complete Day <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
