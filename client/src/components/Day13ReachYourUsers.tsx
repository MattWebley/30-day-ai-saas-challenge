import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Mail,
  ExternalLink,
  Copy,
  CheckCircle2,
  Key
} from "lucide-react";
import { toast } from "sonner";

interface Day13ReachYourUsersProps {
  appName: string;
  onComplete: (data: {
    resendSetup: boolean;
    welcomeEmailDraft: string;
    testSent: boolean;
  }) => void;
}

export function Day13ReachYourUsers({ appName, onComplete }: Day13ReachYourUsersProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"why" | "setup" | "draft" | "test" | "done">("why");
  const [resendSetup, setResendSetup] = useState(false);
  const [welcomeEmailDraft, setWelcomeEmailDraft] = useState("");
  const [testSent, setTestSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const claudePrompt = `When a new user signs up, send them a welcome email using Resend. The email should:
- Welcome them by name
- Tell them what to do first in ${appName || "the app"}
- Include a link back to the app
Use the RESEND_API_KEY from secrets.`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Why Email Matters */}
      {step === "why" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Why Email Matters</h4>
              </div>
            </div>

            <p className="text-slate-700 mb-4">
              Without email, you have NO way to reach users after they leave your app.
            </p>

            <p className="text-slate-700 mb-4">
              They sign up. They leave. They forget about you. Game over.
            </p>

            <p className="text-slate-700">
              Email is your direct line back to them. Today we set up ONE email - the welcome email.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("setup")}
          >
            Let's Set Up Email <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Resend Setup */}
      {step === "setup" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Set Up Resend</h4>
                <p className="text-slate-600 text-sm">Free for 3,000 emails/month</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <ol className="list-decimal list-inside space-y-3 text-slate-700">
                  <li>
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Go to resend.com <ExternalLink className="w-3 h-3" />
                    </a>
                    {" "}and create an account
                  </li>
                  <li>In the dashboard, create an API key</li>
                  <li>Copy the API key immediately (you won't see it again)</li>
                </ol>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Key className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">Add to Replit Secrets:</p>
                    <p className="text-amber-800 text-sm mt-1">
                      In your Replit project, go to Secrets (lock icon). Add:
                    </p>
                    <code className="block mt-2 p-2 bg-amber-100 rounded text-sm text-amber-900">
                      Name: RESEND_API_KEY<br/>
                      Value: [your API key]
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="resendSetup"
                  checked={resendSetup}
                  onChange={(e) => setResendSetup(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300"
                />
                <label htmlFor="resendSetup" className="text-slate-700 font-medium">
                  I've added RESEND_API_KEY to Replit Secrets
                </label>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("why")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("draft")}
              disabled={!resendSetup}
            >
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Draft Welcome Email */}
      {step === "draft" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Draft Your Welcome Email</h4>
                <p className="text-slate-600 text-sm">Keep it short - 3-4 sentences max</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg mb-4">
              <p className="text-slate-700 text-sm mb-2"><strong>A good welcome email:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                <li>Uses their name</li>
                <li>Gives ONE clear action</li>
                <li>Sets expectations</li>
                <li>Links back to your app</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-blue-800 text-sm">
                <strong>Example:</strong> "Hey [Name]! Welcome to {appName || "[App]"}. You're all set up and ready to go. Click here to [do the main thing]. If you have any questions, just reply to this email."
              </p>
            </div>

            <Textarea
              placeholder="Write your welcome email here..."
              value={welcomeEmailDraft}
              onChange={(e) => setWelcomeEmailDraft(e.target.value)}
              className="min-h-[120px] bg-white"
            />
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("setup")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("test")}
              disabled={welcomeEmailDraft.length < 20}
            >
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Implement & Test */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Tell Claude Code to Add Email</h4>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 whitespace-pre-wrap">
                {claudePrompt}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={() => copyToClipboard(claudePrompt)}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="font-bold text-green-900 mb-2">Test it:</p>
              <p className="text-green-800 text-sm">
                Sign up with a new account using a real email you can check. Did you receive the welcome email?
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="testSent"
                checked={testSent}
                onChange={(e) => setTestSent(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
              <label htmlFor="testSent" className="text-slate-700 font-medium">
                I received the welcome email in my inbox
              </label>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("draft")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("done")}
              disabled={!testSent}
            >
              Email is Working <ChevronRight className="w-5 h-5" />
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
                <h4 className="font-bold text-xl text-green-900">You Can Reach Your Users!</h4>
                <p className="text-green-700">
                  Email is your lifeline to customers. Now you have it.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Future Emails to Add (Later)</h4>
            <div className="space-y-2 text-slate-600">
              <p>You can add more emails when you need them:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Password reset</li>
                <li>Activity notifications</li>
                <li>Weekly digest</li>
                <li>Re-engagement for inactive users</li>
              </ul>
              <p className="text-sm mt-2">But for now, one working email is enough. Move on.</p>
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
              className="flex-1 h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                resendSetup: true,
                welcomeEmailDraft,
                testSent: true,
              })}
            >
              Complete Day 13 <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
