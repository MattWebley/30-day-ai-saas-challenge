import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Clock,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day16EmailProps {
  appName: string;
  onComplete: (data: { selectedEmails: string[]; sequence: string; setupComplete: boolean }) => void;
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
  {
    id: "weekly",
    name: "Weekly Summary",
    timing: "Every 7 days",
    purpose: "Show activity, keep them engaged",
    essential: false,
  },
  {
    id: "inactive",
    name: "Win-back Email",
    timing: "After 14 days inactive",
    purpose: "Bring back users who stopped using the app",
    essential: false,
  },
];

export function Day16Email({ appName, onComplete }: Day16EmailProps) {
  const [step, setStep] = useState<"sequence" | "prompts" | "setup">("sequence");
  const [selectedEmails, setSelectedEmails] = useState<string[]>(["welcome", "day1"]);
  const [customNotes, setCustomNotes] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleEmail = (id: string) => {
    if (selectedEmails.includes(id)) {
      // Don't allow deselecting welcome (it's required)
      if (id === "welcome") return;
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

  const generatePrompt = (emailType: typeof EMAIL_TYPES[0]) => {
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

      weekly: `Add a weekly summary email using Resend. Send every Monday morning.

Subject: Your ${appNameStr} week in review

The email should:
- Summarize their activity this week (or say "no activity yet")
- Highlight any achievements or milestones
- Suggest one thing to try this week
- Keep it scannable with bullet points

Use RESEND_API_KEY from secrets. Pull actual user stats from the database.`,

      inactive: `Add a win-back email using Resend. Send after 14 days of no login.

Subject: We miss you at ${appNameStr}

The email should:
- Be warm, not guilt-trippy
- Mention what's new (if anything)
- Give ONE compelling reason to come back
- Make it easy to unsubscribe (respect their choice)

Only send once per user. Track in database to avoid repeat sends. Use RESEND_API_KEY from secrets.`,
    };

    return prompts[emailType.id] || "";
  };

  const canProceedToPrompts = selectedEmails.length >= 1;
  const canProceedToSetup = selectedEmails.length >= 1;
  const canComplete = setupComplete || selectedEmails.length >= 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Build Your Email Sequence</h3>
        <p className="text-slate-600 mt-1">Plan the emails that keep users engaged, then get prompts to build them.</p>
      </Card>

      {/* Step 1: Choose Your Sequence */}
      {step === "sequence" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Which Emails Does Your App Need?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Select the emails you want. We recommend starting with Welcome + Day 1 (already selected).
            </p>

            <div className="space-y-3">
              {EMAIL_TYPES.map((email) => {
                const isSelected = selectedEmails.includes(email.id);
                const isRequired = email.id === "welcome";

                return (
                  <div
                    key={email.id}
                    onClick={() => toggleEmail(email.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
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
                          {email.essential && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                          {isRequired && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              Required
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
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium">Start small, add more later</p>
                <p className="mt-1">
                  You don't need all these on day one. Welcome + Day 1 is enough to start. Add more when you see what users need.
                </p>
              </div>
            </div>
          </Card>

          {canProceedToPrompts && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("prompts")}
            >
              Get Email Prompts ({selectedEmails.length} emails) <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Copy Prompts */}
      {step === "prompts" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <h4 className="font-bold text-lg mb-2 text-green-900">Your Email Sequence</h4>
            <p className="text-sm text-green-800">
              {selectedEmails.length} emails selected. Copy each prompt below and paste into Claude Code to build them.
            </p>
          </Card>

          {selectedEmails.map((emailId) => {
            const email = EMAIL_TYPES.find(e => e.id === emailId);
            if (!email) return null;

            const prompt = generatePrompt(email);
            const isCopied = copiedId === emailId;

            return (
              <Card key={emailId} className="p-5 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <h4 className="font-bold text-slate-900">{email.name}</h4>
                  </div>
                  <span className="text-xs text-slate-500">{email.timing}</span>
                </div>

                <div className="relative">
                  <pre className="bg-slate-50 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap text-slate-700 max-h-48 overflow-y-auto">
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
              </Card>
            );
          })}

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-700">
              <strong>Tip:</strong> Build and test one email at a time. Start with Welcome, make sure it works, then add the next one.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("setup")}
          >
            Set Up Resend <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Set Up Resend */}
      {step === "setup" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Resend Setup (5 minutes)</h4>
            <p className="text-sm text-slate-600 mb-4">
              Resend is the easiest way to send emails. 3,000 emails/month free - more than enough for your MVP.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Create a Resend account</p>
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    resend.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Get your API key</p>
                  <p className="text-sm text-slate-600">Dashboard → API Keys → Create API Key</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Add to Replit Secrets</p>
                  <p className="text-sm text-slate-600">
                    Tell Replit Agent: "Add a secret called RESEND_API_KEY with value [your key]"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Use the prompts from Step 2</p>
                  <p className="text-sm text-slate-600">Paste each email prompt into Claude Code to build your sequence</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <div className="text-sm text-amber-800">
              <p className="font-medium">Testing tip</p>
              <p className="mt-1">
                In test mode, Resend only sends to your own email. That's perfect for testing! Once you verify your domain, you can send to anyone.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Did You Set Up Resend?</h4>
            <div className="flex gap-3">
              <Button
                variant={setupComplete ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSetupComplete(true)}
              >
                Yes, it's working!
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSetupComplete(false)}
              >
                I'll do it later
              </Button>
            </div>
            {!setupComplete && (
              <p className="text-xs text-slate-500 mt-3">
                That's fine! You have the prompts ready. You can set up Resend anytime.
              </p>
            )}
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                selectedEmails,
                sequence: selectedEmails.map(id => EMAIL_TYPES.find(e => e.id === id)?.name).join(", "),
                setupComplete
              })}
            >
              Save Email Plan & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
