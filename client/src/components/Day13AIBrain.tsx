import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ExternalLink, Copy } from "lucide-react";
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
        <h3 className="text-2xl font-extrabold text-slate-900">Add The AI Brain</h3>
        <p className="text-slate-600 mt-1">Give your app intelligence. This is what makes AI SaaS special.</p>
      </Card>

      {step === "setup" && (
        <>

          {/* Step 1: Create OpenAI Account */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="font-bold text-slate-700">1</span>
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
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="font-bold text-slate-700">2</span>
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

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">
                  Your API key looks like: <code className="bg-slate-200 px-1 rounded">sk-proj-xxxxxxxxxxxxx</code><br/>
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
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="font-bold text-slate-700">3</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">Add Key to Replit Secrets</h4>
            </div>

            <div className="space-y-4">
              {/* EASY WAY */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-bold text-green-800 mb-2">THE EASY WAY (Recommended)</p>
                <p className="text-sm text-green-800 mb-3">
                  Just tell Replit Agent in plain English:
                </p>
                <div className="relative">
                  <pre className="bg-white p-3 rounded-lg text-sm font-mono border border-green-200 whitespace-pre-wrap text-slate-800">
{`Add a secret called OPENAI_API_KEY with the value: [paste your key here]`}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("Add a secret called OPENAI_API_KEY with the value: ", "Replit Agent prompt")}
                    className="absolute top-2 right-2 gap-2 bg-white"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Replit Agent will add it to your Secrets automatically. Done in 2 seconds!
                </p>
              </div>

              {/* MANUAL WAY */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700 mb-2">Manual way (if Agent doesn't work):</p>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Click <strong>Tools</strong> in the left sidebar</li>
                  <li>Click <strong>Secrets</strong></li>
                  <li>Click <strong>+ New Secret</strong></li>
                  <li>Key: <code className="bg-slate-200 px-1 rounded">OPENAI_API_KEY</code></li>
                  <li>Value: paste your API key</li>
                  <li>Click <strong>Add Secret</strong></li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">
                  <strong>Why Secrets?</strong> Your API key stays hidden from your code.
                  Anyone viewing your code can't steal it. Your app accesses it securely.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 4: Describe Your AI Feature */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="font-bold text-slate-700">4</span>
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
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="font-bold text-slate-700">5</span>
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

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="font-medium text-sm text-slate-900">Cost is low</p>
            <p className="mt-1 text-sm text-slate-700">
              GPT-3.5: ~$0.002 per 1K tokens (500 calls for $1)<br />
              GPT-4: ~$0.06 per 1K tokens (more capable but pricier)
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("test")}
          >
            I Built It - Let's Test!
          </Button>
        </>
      )}

      {/* Step 3: Test and Document */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-2">Your App Has AI!</h4>
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
