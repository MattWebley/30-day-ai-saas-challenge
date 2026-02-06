import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Copy,
  Terminal,
  Key,
  Lock,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";

interface Day13ExternalAPIsProps {
  appName: string;
  savedInputs?: Record<string, any>;
  onComplete: (data: { emailFeature: string; apiSetup: boolean; needsEmail: boolean | null; signupDone: boolean; apiKeyDone: boolean; secretsDone: boolean; testEmail: string; emailReceived: boolean }) => void;
}

export function Day13ExternalAPIs({ appName, savedInputs, onComplete }: Day13ExternalAPIsProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "intro" | "signup" | "apikey" | "secrets" | "describe" | "build" | "done"
  >("intro");

  const [needsEmail, setNeedsEmail] = useState<boolean | null>(savedInputs?.needsEmail ?? null);
  const [signupDone, setSignupDone] = useState(savedInputs?.signupDone ?? false);
  const [apiKeyDone, setApiKeyDone] = useState(savedInputs?.apiKeyDone ?? false);
  const [secretsDone, setSecretsDone] = useState(savedInputs?.secretsDone ?? false);
  const [testEmail, setTestEmail] = useState(savedInputs?.testEmail ?? "");
  const [emailReceived, setEmailReceived] = useState(savedInputs?.emailReceived ?? false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Claude Code Guide Reminder */}
      <Link href="/claude-code">
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Open the Claude Code Guide</p>
              <p className={ds.muted}>Use the prompts there to start your session.</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Intro - Do you need email? */}
      {step === "intro" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Your First External API</h3>
                <p className={ds.muted}>Let's set up email... you'll definitely need it</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Today is about external APIs. Instead of just talking about them, let's set one up that you'll definitely use... email.
              </p>

              <p className={ds.body}>
                Welcome emails, password resets, notifications, receipts... almost every app needs to send emails. We'll use Resend - it's modern, developer-friendly, and the free tier gives you 3,000 emails/month.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  Once you've done this once, you'll know how to add any API. They all work the same way... sign up, get a key, add to secrets, tell Claude Code to use it.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div
                  className={needsEmail === true ? ds.optionSelected : ds.optionDefault}
                  onClick={() => setNeedsEmail(true)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={needsEmail === true} onCheckedChange={() => {}} className="pointer-events-none" />
                    <span className={ds.body + " font-medium"}>Set up email with Resend</span>
                  </div>
                </div>

                <div
                  className={needsEmail === false ? ds.optionSelected : ds.optionDefault}
                  onClick={() => setNeedsEmail(false)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={needsEmail === false} onCheckedChange={() => {}} className="pointer-events-none" />
                    <span className={ds.body + " font-medium"}>Skip - I don't need email right now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            {needsEmail === true && (
              <Button size="lg" onClick={() => setStep("signup")} className="gap-2">
                Let's do it <ArrowRight className="w-5 h-5" />
              </Button>
            )}
            {needsEmail === false && (
              <Button size="lg" onClick={() => onComplete({ emailFeature: "", apiSetup: false, needsEmail, signupDone, apiKeyDone, secretsDone, testEmail, emailReceived })} className="gap-2">
                Skip & Complete Day <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </>
      )}

      {/* Step 1: Sign up for Resend */}
      {step === "signup" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 1: Create a Resend Account</h3>
                <p className={ds.muted}>Free tier gives you 3,000 emails/month</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <ol className={ds.body + " space-y-2 list-decimal list-inside"}>
                  <li>Go to <a href="https://resend.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">resend.com/signup</a></li>
                  <li>Sign up</li>
                  <li>Verify your email if prompted</li>
                </ol>
              </div>

              <a
                href="https://resend.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Open Resend <ExternalLink className="w-4 h-4" />
              </a>

              <div
                className={signupDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setSignupDone(!signupDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={signupDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>I've created my Resend account</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("intro")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("apikey")} disabled={!signupDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Get API Key */}
      {step === "apikey" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 2: Get Your API Key</h3>
                <p className={ds.muted}>This is how your app sends emails</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <ol className={ds.body + " space-y-2 list-decimal list-inside"}>
                  <li>Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">resend.com/api-keys</a></li>
                  <li>Click "Create API Key"</li>
                  <li>Give it a name like "{appName || "My App"}"</li>
                  <li>Set permission to "Sending access"</li>
                  <li className="text-red-600 font-medium">COPY IT NOW - you won't see it again!</li>
                </ol>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  Your API key looks like... <code className="bg-slate-200 px-1 rounded">re_xxxxxxxxxx</code>
                </p>
              </div>

              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
              >
                Get API Key <ExternalLink className="w-4 h-4" />
              </a>

              <div
                className={apiKeyDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setApiKeyDone(!apiKeyDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={apiKeyDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>I've copied my API key</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("signup")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("secrets")} disabled={!apiKeyDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Add to Replit Secrets */}
      {step === "secrets" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 3: Add Key to Replit Secrets</h3>
                <p className={ds.muted}>Keep your key safe and hidden</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                <p className="font-bold text-slate-800 mb-2">THE EASY WAY</p>
                <p className={ds.body + " text-slate-700 mb-3"}>
                  Tell Replit Agent...
                </p>
                <div className="relative">
                  <pre className="bg-white p-3 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap text-slate-800">
{`Add a secret called RESEND_API_KEY with the value: [paste your key here]`}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("Add a secret called RESEND_API_KEY with the value: ", "Prompt")}
                    className="absolute top-2 right-2 gap-2 bg-white"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label + " mb-2"}>Manual way...</p>
                <ol className={ds.muted + " space-y-1 list-decimal list-inside text-sm"}>
                  <li>Click Tools in the left sidebar</li>
                  <li>Click Secrets</li>
                  <li>Click + New Secret</li>
                  <li>Key... <code className="bg-slate-200 px-1 rounded">RESEND_API_KEY</code></li>
                  <li>Value... paste your API key</li>
                  <li>Click Add Secret</li>
                </ol>
              </div>

              <div
                className={secretsDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setSecretsDone(!secretsDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={secretsDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>I've added my API key to Secrets</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("apikey")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("describe")} disabled={!secretsDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Enter your email for testing */}
      {step === "describe" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 4: Let's Test It</h3>
                <p className={ds.muted}>Enter your email to receive a test message</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                We're going to build a test email button and send you an email. If you receive it... your API is working!
              </p>

              <div>
                <label className={ds.label + " mb-2 block"}>Your email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.muted}>
                  This should be an email you can check right now.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("secrets")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("build")} disabled={!testEmail.includes("@")} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Build test email button */}
      {step === "build" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 5: Build a Test Email Button</h3>
                <p className={ds.muted}>Copy this prompt into Claude Code</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap">
{`Add a temporary "Send Test Email" button somewhere visible in my app.

When clicked, it should send an email to: ${testEmail}

Subject: "🎉 Your email is working!"
Body: "If you're reading this, your Resend API is set up correctly. You can now send emails from your app!"

Use the Resend API. The API key is in Replit Secrets as RESEND_API_KEY.

Send from: onboarding@resend.dev`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`Add a temporary "Send Test Email" button somewhere visible in my app.\n\nWhen clicked, it should send an email to: ${testEmail}\n\nSubject: "🎉 Your email is working!"\nBody: "If you're reading this, your Resend API is set up correctly. You can now send emails from your app!"\n\nUse the Resend API. The API key is in Replit Secrets as RESEND_API_KEY.\n\nSend from: onboarding@resend.dev`, "Claude Code prompt")}
                  className="absolute top-2 right-2 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>After Claude Code builds it...</p>
                <ol className={ds.muted + " mt-2 space-y-1 list-decimal list-inside"}>
                  <li>Find the test button in your app</li>
                  <li>Click it</li>
                  <li>Check your inbox (and spam folder)</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("describe")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("done")} className="gap-2">
              I Sent the Test Email <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Done - Confirm email received */}
      {step === "done" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 6: Did You Receive It?</h3>
                <p className={ds.muted}>Check your inbox (and spam folder)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className={emailReceived ? ds.optionSelected : ds.optionDefault}
                onClick={() => setEmailReceived(!emailReceived)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={emailReceived} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>I received the test email</span>
                </div>
              </div>

              {emailReceived && (
                <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
                  <p className="font-bold text-green-600 mb-2">Your API is working!</p>
                  <p className={ds.body}>
                    You can now send emails from your app. Welcome emails, notifications, receipts... whatever you need.
                  </p>
                </div>
              )}

              {!emailReceived && (
                <div className={ds.infoBoxHighlight}>
                  <p className={ds.label}>Didn't get it? Try these...</p>
                  <ul className={ds.muted + " mt-2 space-y-2 list-disc list-inside"}>
                    <li>Check your spam folder</li>
                    <li>Look for any red errors in the Replit console</li>
                    <li>
                      <span className="font-medium text-slate-700">Ask Claude Code:</span> "The test email didn't send. Can you check if Resend is set up correctly and show me any errors?"
                    </li>
                    <li>
                      <span className="font-medium text-slate-700">Ask Replit:</span> "Is my RESEND_API_KEY secret set up correctly?"
                    </li>
                  </ul>
                  <p className={ds.muted + " mt-3 pt-3 border-t border-slate-200"}>
                    Still stuck? The most common issue is the API key not being copied correctly. Try deleting the secret and adding it again.
                  </p>
                  <button
                    onClick={() => onComplete({ emailFeature: "Skipped - will return later", apiSetup: false, needsEmail, signupDone, apiKeyDone, secretsDone, testEmail, emailReceived })}
                    className="mt-4 text-slate-500 hover:text-slate-700 underline text-sm"
                  >
                    Skip for now - I'll come back to this later
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("build")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => onComplete({ emailFeature: `Test email sent to ${testEmail}`, apiSetup: true, needsEmail, signupDone, apiKeyDone, secretsDone, testEmail, emailReceived })}
              disabled={!emailReceived}
              className="gap-2"
            >
              Complete Day <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
