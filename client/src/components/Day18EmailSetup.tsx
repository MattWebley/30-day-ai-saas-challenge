import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Copy,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Send,
  KeyRound,
  Bell,
  Receipt,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface Day18EmailSetupProps {
  dayId: number;
  appName: string;
  onComplete: () => void;
}

const EMAIL_TYPES = [
  {
    id: "welcome",
    label: "Welcome Email",
    icon: Send,
    description: "First impression when someone signs up",
    required: true,
  },
  {
    id: "password",
    label: "Password Reset",
    icon: KeyRound,
    description: "Critical for user trust and security",
    required: true,
  },
  {
    id: "notification",
    label: "Notifications",
    icon: Bell,
    description: "Keep users engaged with updates",
    required: false,
  },
  {
    id: "receipt",
    label: "Payment Receipts",
    icon: Receipt,
    description: "Professional invoices for payments",
    required: false,
  },
];

export function Day18EmailSetup({ dayId, appName, onComplete }: Day18EmailSetupProps) {
  const [step, setStep] = useState<"select" | "customize" | "prompt" | "test">("select");
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set(["welcome", "password"]));
  const [personality, setPersonality] = useState<string>("friendly");
  const [customAppName, setCustomAppName] = useState<string>(appName || "");
  const [emailCopy, setEmailCopy] = useState<Record<string, { subject: string; preview: string }>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [testChecklist, setTestChecklist] = useState({
    resendAccount: false,
    keyStored: false,
    welcomeWorks: false,
    resetWorks: false,
  });
  const { toast } = useToast();

  const toggleEmail = (emailId: string) => {
    const email = EMAIL_TYPES.find(e => e.id === emailId);
    if (email?.required) return; // Can't toggle required emails

    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const generateEmailCopy = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-email-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: customAppName,
          personality,
          emailTypes: Array.from(selectedEmails),
        }),
      });
      if (!response.ok) throw new Error("Failed to generate");
      return response.json();
    },
    onSuccess: (data) => {
      setEmailCopy(data.emails || {});
      setStep("prompt");
      generateBuildPrompt(data.emails || {});
    },
    onError: () => {
      // Fallback copy
      const fallback: Record<string, { subject: string; preview: string }> = {};

      if (selectedEmails.has("welcome")) {
        fallback.welcome = {
          subject: `Welcome to ${customAppName}! 🎉`,
          preview: personality === "professional"
            ? `Thank you for joining ${customAppName}. Here's how to get started with your account.`
            : `You're in! We're so excited to have you. Let's get you set up and making magic.`,
        };
      }
      if (selectedEmails.has("password")) {
        fallback.password = {
          subject: `Reset your ${customAppName} password`,
          preview: personality === "professional"
            ? `Click the link below to reset your password. This link expires in 1 hour.`
            : `Forgot your password? No worries - it happens to the best of us! Click below to get back in.`,
        };
      }
      if (selectedEmails.has("notification")) {
        fallback.notification = {
          subject: `Update from ${customAppName}`,
          preview: `Here's what's new in your account.`,
        };
      }
      if (selectedEmails.has("receipt")) {
        fallback.receipt = {
          subject: `Your ${customAppName} receipt`,
          preview: `Thanks for your payment! Here's your receipt.`,
        };
      }

      setEmailCopy(fallback);
      setStep("prompt");
      generateBuildPrompt(fallback);
    },
  });

  const generateBuildPrompt = (emails: Record<string, { subject: string; preview: string }>) => {
    const prompt = `Set up email with Resend (API key in secrets as RESEND_API_KEY):

APP NAME: ${customAppName}
PERSONALITY: ${personality}

${selectedEmails.has("welcome") ? `
1. WELCOME EMAIL
   Trigger: When user signs up
   From: hello@${customAppName.toLowerCase().replace(/\s/g, '')}.com (or use onboarding@resend.dev for testing)
   Subject: ${emails.welcome?.subject || `Welcome to ${customAppName}!`}
   Body:
   - Friendly greeting with their name
   - ${emails.welcome?.preview || "Welcome message"}
   - Clear CTA button: "Get Started"
   - Quick tips for first steps
` : ""}
${selectedEmails.has("password") ? `
2. PASSWORD RESET EMAIL
   Trigger: When user requests password reset
   Subject: ${emails.password?.subject || "Reset your password"}
   Body:
   - ${emails.password?.preview || "Reset instructions"}
   - Secure reset link (expires in 1 hour)
   - "If you didn't request this, ignore this email"
` : ""}
${selectedEmails.has("notification") ? `
3. NOTIFICATION EMAIL
   Create a reusable function for sending notifications
   Subject: ${emails.notification?.subject || "Update from your app"}
   Body: Dynamic content based on notification type
` : ""}
${selectedEmails.has("receipt") ? `
4. PAYMENT RECEIPT
   Trigger: After successful payment
   Subject: ${emails.receipt?.subject || "Your receipt"}
   Body: Professional invoice with payment details
` : ""}

STYLING:
- Clean, modern design
- ${customAppName} branding in header
- ${personality === "professional" ? "Professional, clean tone" : "Warm, friendly tone"}
- Mobile-responsive
- Unsubscribe link in footer (for non-transactional)

TEST: Send yourself a test email to verify it works and looks good.`;

    setGeneratedPrompt(prompt);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Email Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const toggleTest = (key: keyof typeof testChecklist) => {
    setTestChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allTestsPass = Object.values(testChecklist).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Emails That Actually ARRIVE</h3>
            <p className="text-slate-600 mt-1">
              Hit inboxes, not spam folders. Professional communication.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Select", "Customize", "Build", "Test"].map((label, idx) => {
          const steps = ["select", "customize", "prompt", "test"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-blue-100 text-blue-700" :
                isCurrent ? "bg-blue-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 3 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Select */}
      {step === "select" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Which emails does your app need?</h4>
          <p className="text-sm text-slate-500 mb-4">Welcome and Password Reset are required</p>

          <div className="grid gap-3">
            {EMAIL_TYPES.map((email) => {
              const Icon = email.icon;
              const isSelected = selectedEmails.has(email.id);
              return (
                <button
                  key={email.id}
                  onClick={() => toggleEmail(email.id)}
                  disabled={email.required}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  } ${email.required ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{email.label}</span>
                        {email.required && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Required</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">{email.description}</div>
                    </div>
                    <Checkbox checked={isSelected} disabled={email.required} />
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={() => setStep("customize")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Customize */}
      {step === "customize" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-4">Customize Your Emails</h4>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-2">Your App Name</label>
              <Input
                value={customAppName}
                onChange={(e) => setCustomAppName(e.target.value)}
                placeholder="e.g., TaskMaster Pro"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">Email Personality</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPersonality("friendly")}
                  className={`p-4 rounded-lg border-2 text-left ${
                    personality === "friendly" ? "border-blue-500 bg-blue-50" : "border-slate-200"
                  }`}
                >
                  <div className="font-bold text-slate-900">😊 Friendly</div>
                  <div className="text-sm text-slate-600">"You're in! Let's make magic..."</div>
                </button>
                <button
                  onClick={() => setPersonality("professional")}
                  className={`p-4 rounded-lg border-2 text-left ${
                    personality === "professional" ? "border-blue-500 bg-blue-50" : "border-slate-200"
                  }`}
                >
                  <div className="font-bold text-slate-900">💼 Professional</div>
                  <div className="text-sm text-slate-600">"Thank you for joining..."</div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("select")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!customAppName || generateEmailCopy.isPending}
              onClick={() => generateEmailCopy.mutate()}
            >
              {generateEmailCopy.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <>Generate Email Copy <Sparkles className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Prompt */}
      {step === "prompt" && (
        <>
          {Object.keys(emailCopy).length > 0 && (
            <Card className="p-6 border-2 border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900 mb-4">Email Preview</h4>
              <div className="space-y-3">
                {Object.entries(emailCopy).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 uppercase mb-1">{key}</div>
                    <div className="font-semibold text-slate-900">{value.subject}</div>
                    <div className="text-sm text-slate-600 mt-1">{value.preview}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Email Setup Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-blue-500 hover:bg-blue-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={() => setStep("test")}
            >
              I've Built It - Let's Test <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </>
      )}

      {/* Step 4: Test */}
      {step === "test" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Test Your Emails</h4>
          <p className="text-sm text-slate-500 mb-4">Send yourself test emails</p>

          <div className="space-y-3">
            {[
              { key: "resendAccount", label: "Resend account created", desc: "Sign up at resend.com (free tier works great)" },
              { key: "keyStored", label: "API key stored", desc: "RESEND_API_KEY in Replit Secrets" },
              { key: "welcomeWorks", label: "Welcome email works", desc: "Sign up with a new account and check your inbox" },
              { key: "resetWorks", label: "Password reset works", desc: "Request a reset and check the link works" },
            ].map((item) => (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  testChecklist[item.key as keyof typeof testChecklist]
                    ? "border-green-300 bg-green-50"
                    : "border-slate-200 hover:border-green-300"
                }`}
                onClick={() => toggleTest(item.key as keyof typeof testChecklist)}
              >
                <Checkbox checked={testChecklist[item.key as keyof typeof testChecklist]} />
                <div>
                  <div className="font-semibold text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {allTestsPass && (
            <Card className="p-4 border-2 border-green-300 bg-green-50 mt-4">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-bold text-green-800">Your emails are ready!</div>
                  <div className="text-sm text-green-700">Professional communication that hits inboxes.</div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setStep("prompt")}>Back</Button>
            <Button className="flex-1" size="lg" disabled={!allTestsPass} onClick={onComplete}>
              Complete Day 18
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
