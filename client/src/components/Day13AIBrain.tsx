import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Trophy,
  ArrowRight,
  ExternalLink,
  Zap,
  Key,
  Copy,
  CreditCard,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day13AIBrainProps {
  userIdea: string;
  onComplete: (data: { aiFeature: string; aiTestResult: string; aiWow: string }) => void;
}

export function Day13AIBrain({ userIdea, onComplete }: Day13AIBrainProps) {
  const [step, setStep] = useState<"setup" | "test">("setup");
  const [aiFeature, setAiFeature] = useState("");
  const [aiTestResult, setAiTestResult] = useState("");
  const [aiWow, setAiWow] = useState("");
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const canComplete = aiTestResult.length >= 20 && aiWow.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Add The AI Brain</h3>
            <p className="text-slate-600 mt-1">Give your app intelligence. This is what makes AI SaaS special.</p>
          </div>
        </div>
      </Card>

      {step === "setup" && (
        <>

          {/* Step 1: Create OpenAI Account */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="font-bold text-green-700">1</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">Create OpenAI Account & Add Credits</h4>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-700 mb-3">
                  OpenAI (makers of ChatGPT) is the easiest AI to add to your app. Here's how to get access:
                </p>
                <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">platform.openai.com/signup</a></li>
                  <li>Create an account (use Google login for speed)</li>
                  <li>Once logged in, click <strong>Settings</strong> (bottom left) → <strong>Billing</strong></li>
                  <li>Click <strong>Add payment method</strong> and add a card</li>
                  <li>Add <strong>$5-10 credits</strong> to start (this will last you MONTHS)</li>
                </ol>
              </div>

              <a
                href="https://platform.openai.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                Open OpenAI Platform <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </Card>

          {/* Step 2: Get API Key */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="font-bold text-amber-700">2</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">Get Your API Key</h4>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">platform.openai.com/api-keys</a></li>
                  <li>Click <strong>Create new secret key</strong></li>
                  <li>Give it a name like "My SaaS App"</li>
                  <li>Click <strong>Create secret key</strong></li>
                  <li><strong className="text-red-600">COPY IT NOW</strong> - you won't see it again!</li>
                </ol>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Your API key looks like: <code className="bg-amber-100 px-1 rounded">sk-proj-xxxxxxxxxxxxx</code><br/>
                  Keep it secret - anyone with this key can use your credits!
                </p>
              </div>

              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-sm"
              >
                Get API Key <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </Card>

          {/* Step 3: Add to Replit Secrets */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="font-bold text-indigo-700">3</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">Add Key to Replit Secrets</h4>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-700 mb-3">
                  Replit Secrets keeps your API key safe and hidden from your code:
                </p>
                <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                  <li>In Replit, click <strong>Tools</strong> in the left sidebar</li>
                  <li>Click <strong>Secrets</strong></li>
                  <li>Click <strong>+ New Secret</strong></li>
                  <li>For <strong>Key</strong>, enter exactly: <code className="bg-slate-200 px-1 rounded">OPENAI_API_KEY</code></li>
                  <li>For <strong>Value</strong>, paste your API key (the sk-proj-xxx thing)</li>
                  <li>Click <strong>Add Secret</strong></li>
                </ol>
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-100 p-3 rounded-lg text-sm font-mono border border-slate-200">
                  OPENAI_API_KEY
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard("OPENAI_API_KEY", "Secret name")}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>

              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-800">
                  <strong>Why Secrets?</strong> Your API key stays hidden from your code.
                  Anyone viewing your code can't steal it. Your app accesses it securely.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 4: Describe Your AI Feature */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">4</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">Describe Your AI Feature</h4>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                What will AI do in your app? Describe ONE feature:
              </p>
              <Textarea
                placeholder="AI will [do what] when users [do what action].

Example: 'AI will generate 5 social media posts when users paste a blog URL'
Example: 'AI will analyze uploaded data and give actionable insights'"
                value={aiFeature}
                onChange={(e) => setAiFeature(e.target.value)}
                className="min-h-[100px]"
              />
              {userIdea && (
                <p className="text-xs text-slate-500">Your app: {userIdea}</p>
              )}
            </div>
          </Card>

          {/* Step 5: Tell Claude Code */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">5</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">Tell Claude Code to Build It</h4>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Copy this prompt and paste it into Claude Code:
              </p>

              <div className="relative">
                <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap">
{`Add an AI feature to my app:

${aiFeature || "[Describe your AI feature above first]"}

Use the OpenAI API. The API key is already stored in Replit Secrets as OPENAI_API_KEY.

Use GPT-3.5-turbo for speed and low cost. Make sure to handle errors gracefully.`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`Add an AI feature to my app:\n\n${aiFeature}\n\nUse the OpenAI API. The API key is already stored in Replit Secrets as OPENAI_API_KEY.\n\nUse GPT-3.5-turbo for speed and low cost. Make sure to handle errors gracefully.`, "Claude Code prompt")}
                  className="absolute top-2 right-2 gap-2"
                  disabled={!aiFeature}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Cost is low</p>
                <p className="mt-1">
                  GPT-3.5: ~$0.002 per 1K tokens (500 calls for $1)<br />
                  GPT-4: ~$0.06 per 1K tokens (more capable but pricier)
                </p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("test")}
          >
            <CheckCircle2 className="w-5 h-5" />
            I Built It - Let's Test!
          </Button>
        </>
      )}

      {/* Step 3: Test and Document */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">Your App Has AI!</h4>
            </div>
            <p className="text-slate-700">
              You've added intelligence to your product. This is what separates you from basic tools.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Test Result</h4>
            <p className="text-sm text-slate-600 mb-4">
              You tested the AI feature. What happened?
            </p>
            <Textarea
              placeholder="I gave it [input] and it returned [output]. It took about [X seconds]. The result was [useful/not useful] because..."
              value={aiTestResult}
              onChange={(e) => setAiTestResult(e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">The Wow Factor</h4>
            <p className="text-sm text-slate-600 mb-4">
              When you saw it work, what was your reaction?
            </p>
            <Textarea
              placeholder="This is impressive because... / This needs improvement because..."
              value={aiWow}
              onChange={(e) => setAiWow(e.target.value)}
              className="min-h-[80px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ aiFeature, aiTestResult, aiWow })}
            >
              Save AI Feature & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
