import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Copy,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day16EmailProps {
  appName: string;
  onComplete: () => void;
}

const EMAIL_TYPES = [
  { id: "welcome", text: "Welcome email when user signs up", essential: true },
  { id: "reset", text: "Password reset email (if using email auth)", essential: true },
  { id: "notification", text: "Usage notifications", essential: false },
  { id: "updates", text: "Feature update emails", essential: false },
];

const SETUP_STEPS = [
  { id: "signup", text: "Signed up at resend.com", url: "https://resend.com" },
  { id: "domain", text: "Verified domain (or using test mode)" },
  { id: "key", text: "Added RESEND_API_KEY to Replit Secrets" },
  { id: "integrated", text: "Integrated email sending in my app" },
  { id: "tested", text: "Tested that emails arrive" },
];

const EMAIL_PROMPT = `Add email functionality using Resend:

1. When a user signs up, send a welcome email:
   - To: their email
   - Subject: "Welcome to [Your App Name]!"
   - Body: [Your welcome message]

2. When [event happens], send a notification:
   - To: the user's email
   - Subject: "[Relevant subject]"
   - Body: [Relevant message]

Use RESEND_API_KEY from secrets.
Handle errors gracefully - don't break the app if email fails.`;

export function Day16Email({ appName, onComplete }: Day16EmailProps) {
  const [emailTypes, setEmailTypes] = useState<Set<string>>(new Set());
  const [setupDone, setSetupDone] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleEmailType = (id: string) => {
    const newTypes = new Set(emailTypes);
    if (newTypes.has(id)) {
      newTypes.delete(id);
    } else {
      newTypes.add(id);
    }
    setEmailTypes(newTypes);
  };

  const toggleSetup = (id: string) => {
    const newDone = new Set(setupDone);
    if (newDone.has(id)) {
      newDone.delete(id);
    } else {
      newDone.add(id);
    }
    setSetupDone(newDone);
  };

  const copyPrompt = () => {
    const customPrompt = EMAIL_PROMPT.replace("[Your App Name]", appName || "[Your App Name]");
    navigator.clipboard.writeText(customPrompt);
    toast({
      title: "Copied!",
      description: "Email prompt copied to clipboard",
    });
  };

  const canComplete = emailTypes.size >= 1 && setupDone.size >= 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Email Setup</h3>
            <p className="text-slate-600 mt-1">Send welcome emails and notifications to keep users engaged.</p>
          </div>
        </div>
      </Card>

      {/* Cost Info */}
      <Card className="p-4 border-2 border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800">Resend Free Tier: 3,000 emails/month</p>
            <p className="text-sm text-green-700">More than enough for your MVP</p>
          </div>
        </div>
      </Card>

      {/* Email Types */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">What Emails Will You Send?</h4>
        <div className="space-y-3">
          {EMAIL_TYPES.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleEmailType(type.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={emailTypes.has(type.id)}
                  onCheckedChange={() => toggleEmailType(type.id)}
                />
                <span className="text-sm text-slate-700">{type.text}</span>
              </div>
              {type.essential && (
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded">Essential</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Prompt Template */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">Email Integration Prompt</h4>
        <p className="text-sm text-slate-600 mb-4">Copy and customize for your app:</p>
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded border border-slate-200">
          {EMAIL_PROMPT}
        </pre>
        <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={copyPrompt}>
          <Copy className="w-4 h-4" />
          Copy Prompt
        </Button>
      </Card>

      {/* Setup Steps */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Setup Checklist</h4>
        <div className="space-y-3">
          {SETUP_STEPS.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleSetup(step.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={setupDone.has(step.id)}
                  onCheckedChange={() => toggleSetup(step.id)}
                />
                <span className="text-sm text-slate-700">{step.text}</span>
              </div>
              {step.url && (
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          Email Setup Complete - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
