import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Check,
  Shield,
  Mail,
  Info,
  ExternalLink,
  Copy,
  Clock,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day11ReadyForLaunchProps {
  userIdea: string;
  appName: string;
  onComplete: (data: {
    hasAuth: boolean;
    authStatus: string;
    selectedEmails: string[];
    emailSetupComplete: boolean;
  }) => void;
}

const EMAIL_TYPES = [
  {
    id: "welcome",
    name: "Welcome Email",
    timing: "Immediately after signup",
    purpose: "Thank them, confirm signup, set expectations",
    essential: true,
  },
  {
    id: "day1",
    name: "Day 1 Check-in",
    timing: "24 hours after signup",
    purpose: "Help them get started, share a quick win",
    essential: true,
  },
  {
    id: "day3",
    name: "Day 3 Nudge",
    timing: "3 days after signup",
    purpose: "Re-engage if inactive, share tips",
    essential: false,
  },
];

export function Day11ReadyForLaunch({ userIdea, appName, onComplete }: Day11ReadyForLaunchProps) {
  const [phase, setPhase] = useState<"auth" | "email" | "complete">("auth");
  const [hasAuth, setHasAuth] = useState<boolean | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>(["welcome"]);
  const [emailSetupComplete, setEmailSetupComplete] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleEmail = (id: string) => {
    if (id === "welcome") return; // Welcome is required
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter(e => e !== id));
    } else {
      setSelectedEmails([...selectedEmails, id]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generatePrompt = (emailId: string) => {
    const appNameStr = appName || "[Your App Name]";

    const prompts: Record<string, string> = {
      welcome: `Add a welcome email using Resend. Send it immediately when a user signs up.

Subject: Welcome to ${appNameStr}!

The email should:
- Thank them for signing up
- Tell them ONE thing to do first (their quick win)
- Include a button/link to get started
- Be short and friendly (under 150 words)

Use RESEND_API_KEY from secrets. Send from noreply@[your-domain].`,

      day1: `Add a Day 1 check-in email using Resend. Send it 24 hours after signup.

Subject: Quick tip to get more from ${appNameStr}

The email should:
- Ask if they've tried [main feature] yet
- Share one helpful tip or shortcut
- Offer help if they're stuck (reply to this email)
- Be encouraging, not pushy

Use RESEND_API_KEY from secrets. You'll need to track signup date to trigger this.`,

      day3: `Add a Day 3 nudge email using Resend. Send it 3 days after signup IF user hasn't been active.

Subject: Need help getting started with ${appNameStr}?

The email should:
- Acknowledge they might be busy
- Share a success story or use case
- Offer a specific next step
- Include an easy "unsubscribe" option

Only send if user hasn't logged in for 2+ days. Use RESEND_API_KEY from secrets.`,
    };

    return prompts[emailId] || "";
  };

  const canMoveToEmail = hasAuth !== null;
  const canComplete = selectedEmails.length >= 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Ready for Launch</h3>
        <p className="text-slate-600 mt-1">
          Two quick setup tasks to make your app user-ready: authentication and email.
        </p>
      </Card>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${phase === "auth" ? "bg-primary text-white" : hasAuth !== null ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          <Shield className="w-4 h-4" />
          <span className="font-medium text-sm">1. Auth</span>
          {hasAuth !== null && phase !== "auth" && <Check className="w-4 h-4" />}
        </div>
        <div className={`w-8 h-1 ${hasAuth !== null ? "bg-green-500" : "bg-slate-200"}`} />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${phase === "email" ? "bg-primary text-white" : phase === "complete" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          <Mail className="w-4 h-4" />
          <span className="font-medium text-sm">2. Email</span>
          {phase === "complete" && <Check className="w-4 h-4" />}
        </div>
      </div>

      {/* ============================================ */}
      {/* PART 1: AUTHENTICATION */}
      {/* ============================================ */}
      {phase === "auth" && (
        <>
          <Card className="p-6 border-2 border-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-slate-900">User Authentication</h4>
            </div>

            <div className="space-y-4">
              {/* Check if you have auth */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-700 font-medium">First, check if you already have it:</p>
                    <p className="text-slate-600 mt-1 italic">
                      "Does my app have user authentication? Can users log in and see only their own data?"
                    </p>
                    <p className="text-slate-500 text-sm mt-2">Ask Replit Agent this question.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-slate-700">
                  <strong className="text-slate-900">Replit Auth is fastest</strong> - it just works, it's secure, takes minutes.
                  If Replit already added it, you're done!
                </p>
              </div>

              {/* Yes/No selection */}
              <div className="space-y-2">
                <p className="text-slate-700 font-medium">Does your app have auth?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setHasAuth(true)}
                    className={`p-4 rounded-lg border-2 text-left ${
                      hasAuth === true ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        hasAuth === true ? "bg-primary border-primary" : "border-slate-300"
                      }`}>
                        {hasAuth === true && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Yes</p>
                        <p className="text-sm text-slate-500">Users can log in</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setHasAuth(false)}
                    className={`p-4 rounded-lg border-2 text-left ${
                      hasAuth === false ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        hasAuth === false ? "bg-primary border-primary" : "border-slate-300"
                      }`}>
                        {hasAuth === false && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">No</p>
                        <p className="text-sm text-slate-500">Need to add it</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Add auth instructions */}
              {hasAuth === false && (
                <Card className="p-4 border-2 border-slate-200 bg-white">
                  <p className="text-slate-700 font-medium mb-2">Ask Replit to Add Auth</p>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-700 italic text-sm">
                      "Add user authentication to my app. I need a login/signup button in the header,
                      show the user's name when logged in, a logout button, and each user should only see their own data."
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">
                    Replit handles OAuth, sessions, tokens - you just describe what you want.
                  </p>
                </Card>
              )}

              {canMoveToEmail && (
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold gap-2"
                  onClick={() => setPhase("email")}
                >
                  {hasAuth ? "Auth Done - Set Up Email" : "Auth Added - Set Up Email"} <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ============================================ */}
      {/* PART 2: EMAIL SETUP */}
      {/* ============================================ */}
      {phase === "email" && (
        <>
          <Card className="p-6 border-2 border-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-slate-900">Welcome Email</h4>
            </div>

            <div className="space-y-4">
              <p className="text-slate-600">
                Every SaaS needs at least a welcome email. Pick which emails you want to set up:
              </p>

              <div className="space-y-3">
                {EMAIL_TYPES.map((email) => {
                  const isSelected = selectedEmails.includes(email.id);
                  const isRequired = email.id === "welcome";

                  return (
                    <div
                      key={email.id}
                      onClick={() => toggleEmail(email.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer ${
                        isSelected ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                      } ${isRequired ? "cursor-default" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          isSelected ? "bg-primary border-primary" : "border-slate-300"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{email.name}</p>
                            {isRequired && (
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                            {email.essential && !isRequired && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <p className="text-xs text-slate-500">{email.timing}</p>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{email.purpose}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <p className="font-medium">Start small</p>
                    <p className="mt-1">
                      You only NEED a welcome email to launch. Add more later when you see what users need.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Email Prompts */}
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Claude Code Prompts</h4>
            <p className="text-sm text-slate-600 mb-4">
              Copy these prompts into Claude Code to build your emails:
            </p>

            {selectedEmails.map((emailId) => {
              const email = EMAIL_TYPES.find(e => e.id === emailId);
              if (!email) return null;

              const prompt = generatePrompt(emailId);
              const isCopied = copiedId === emailId;

              return (
                <div key={emailId} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-900 text-sm">{email.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{email.timing}</span>
                  </div>

                  <div className="relative">
                    <pre className="bg-slate-50 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap text-slate-700 max-h-32 overflow-y-auto">
                      {prompt}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(prompt, emailId)}
                      className="absolute top-2 right-2 gap-2 bg-white"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Resend Setup */}
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Set Up Resend (Free)</h4>
            <p className="text-sm text-slate-600 mb-4">
              Resend is the easiest way to send emails. 3,000 emails/month free.
            </p>

            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 text-sm">1</div>
                <div>
                  <p className="font-medium text-slate-900">Create account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">resend.com <ExternalLink className="w-3 h-3" /></a></p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 text-sm">2</div>
                <div>
                  <p className="font-medium text-slate-900">Get API key (Dashboard → API Keys)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 text-sm">3</div>
                <div>
                  <p className="font-medium text-slate-900">Add to Replit Secrets as <code className="bg-slate-100 px-1 rounded text-sm">RESEND_API_KEY</code></p>
                </div>
              </div>
            </div>
          </Card>

          {/* Complete button */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={emailSetupComplete ? "default" : "outline"}
                className="h-12"
                onClick={() => setEmailSetupComplete(true)}
              >
                <Check className="w-4 h-4 mr-2" />
                Email Set Up
              </Button>
              <Button
                variant={!emailSetupComplete ? "default" : "outline"}
                className="h-12"
                onClick={() => setEmailSetupComplete(false)}
              >
                Skip For Now
              </Button>
            </div>
            {!emailSetupComplete && (
              <p className="text-xs text-slate-500 text-center">
                You can always add email later. The prompts will be here.
              </p>
            )}
          </div>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                hasAuth: hasAuth ?? true,
                authStatus: hasAuth ? "Already had auth" : "Added auth with Replit",
                selectedEmails,
                emailSetupComplete
              })}
            >
              Complete Day 11 <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
