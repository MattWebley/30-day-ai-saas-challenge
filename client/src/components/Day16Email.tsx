import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface Day16EmailProps {
  appName: string;
  onComplete: (data: { emailType: string; emailSent: boolean; testResult: string }) => void;
}

export function Day16Email({ appName, onComplete }: Day16EmailProps) {
  const [step, setStep] = useState<"plan" | "setup" | "test">("plan");
  const [emailType, setEmailType] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [testResult, setTestResult] = useState("");

  const canProceedToSetup = emailType.length >= 10;
  const canComplete = testResult.length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Send Your First Email</h3>
        <p className="text-slate-600 mt-1">Set up email so your app can communicate with users.</p>
      </Card>

      {/* Step 1: Plan What Email to Send */}
      {step === "plan" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What's Your First Email?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Start with ONE email type. The most common first email is a welcome email when someone signs up.
            </p>

            <div className="space-y-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-sm text-slate-900">Welcome Email (most common)</p>
                <p className="text-xs text-slate-600">Sent when a user creates an account</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-sm text-slate-900">Action Notification</p>
                <p className="text-xs text-slate-600">Sent when something important happens</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-sm text-slate-900">Weekly Summary</p>
                <p className="text-xs text-slate-600">Recap of user's activity</p>
              </div>
            </div>

            <Textarea
              placeholder="I'll add a [type] email that gets sent when [trigger]. It will say [brief content]..."
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-700">
              <p className="font-medium">Resend: 3,000 emails/month free</p>
              <p className="mt-1">
                That's more than enough for an MVP. Don't worry about cost until you have lots of users.
              </p>
            </div>
          </Card>

          {canProceedToSetup && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("setup")}
            >
              Set Up Email <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Set Up Resend */}
      {step === "setup" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your Email Plan</h4>
            <p className="text-slate-800 bg-white p-4 rounded-lg border border-slate-200">
              "{emailType}"
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Resend Setup</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Create Resend Account</p>
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-700 hover:underline flex items-center gap-1"
                  >
                    resend.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Get Your API Key</p>
                  <p className="text-sm text-slate-600">Dashboard → API Keys → Create</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Add to Replit Secrets</p>
                  <p className="text-sm text-slate-600">Key name: RESEND_API_KEY</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Tell Claude Code to Add Email</p>
                  <p className="text-sm text-slate-600">
                    "Add email using Resend. When [trigger], send an email with subject '[subject]' and body '[message]'. Use RESEND_API_KEY from secrets."
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-700">
              <p className="font-medium">For testing, Resend sends from your domain</p>
              <p className="mt-1">
                In test mode, you can only send to your own email. That's fine for now - you just need to verify it works!
              </p>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("test")}
          >
            I Set It Up - Send Test Email <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Test and Verify */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your App Can Send Email!</h4>
            <p className="text-slate-700">
              This is huge. Email is how you'll communicate with users, send notifications, and keep them engaged.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Send a Test Email</h4>
            <p className="text-sm text-slate-600 mb-4">
              Trigger the email in your app. Did you receive it?
            </p>

            <div className="flex gap-3 mb-4">
              <Button
                variant={emailSent ? "default" : "outline"}
                className="flex-1"
                onClick={() => setEmailSent(true)}
              >
                Yes, I got the email!
              </Button>
              <Button
                variant={!emailSent ? "outline" : "outline"}
                className="flex-1"
                onClick={() => setEmailSent(false)}
              >
                Not yet / Had issues
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Document the Result</h4>
            <p className="text-sm text-slate-600 mb-4">
              What happened when you tested the email?
            </p>
            <Textarea
              placeholder={emailSent
                ? "I triggered [action] and received an email! The subject was [X] and the content looked [good/needs work]. It arrived in [X seconds]."
                : "I tried to send an email but [what happened]. The error was [X]. I need to fix [Y]."
              }
              value={testResult}
              onChange={(e) => setTestResult(e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ emailType, emailSent, testResult })}
            >
              Save Email Setup & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
