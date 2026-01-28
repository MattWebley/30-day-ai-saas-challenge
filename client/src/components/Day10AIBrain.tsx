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
  Sparkles,
  CheckCircle2,
  Brain,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";

interface Day10AIBrainProps {
  userIdea: string;
  onComplete: (data: { aiFeature: string; aiTestResult: string; aiWow: string }) => void;
}

export function Day10AIBrain({ userIdea, onComplete }: Day10AIBrainProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "account" | "apikey" | "secrets" | "describe" | "build" | "test"
  >("account");

  const [accountDone, setAccountDone] = useState(false);
  const [apiKeyDone, setApiKeyDone] = useState(false);
  const [secretsDone, setSecretsDone] = useState(false);
  const [aiFeature, setAiFeature] = useState("");
  const [aiWorking, setAiWorking] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const completedSteps = [accountDone, apiKeyDone, secretsDone].filter(Boolean).length;

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

      {/* Progress indicator */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={ds.heading}>Setup Progress</h3>
          <span className={ds.muted}>{completedSteps} of 3 complete</span>
        </div>
        <div className="flex gap-1">
          {[
            { done: accountDone, label: "Account", step: "account" as const },
            { done: apiKeyDone, label: "API Key", step: "apikey" as const },
            { done: secretsDone, label: "Secrets", step: "secrets" as const },
          ].map((item, i) => (
            <div
              key={i}
              className="flex-1 cursor-pointer group"
              onClick={() => setStep(item.step)}
            >
              <div className={`h-2 rounded-full transition-all ${item.done ? "bg-green-500 group-hover:bg-green-600" : "bg-slate-200 group-hover:bg-slate-300"}`} />
              <p className={`text-xs mt-1 text-center transition-colors ${item.done ? "text-green-600 font-medium group-hover:text-green-700" : "text-slate-500 group-hover:text-slate-700"}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className={ds.infoBoxHighlight + " mt-4"}>
          <p className={ds.body}>
            This might take multiple sessions. That's OK! Complete each step at your own pace.
          </p>
        </div>
      </div>

      {/* Step 1: Create OpenAI Account */}
      {step === "account" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 1: Create OpenAI Account & Add Credits</h3>
                <p className={ds.muted}>Get access to the AI that powers your app</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                OpenAI's API is the easiest way to add AI features to your app. Here's how to get access
              </p>

              <div className={ds.infoBoxHighlight}>
                <ol className={ds.body + " space-y-2 list-decimal list-inside"}>
                  <li>Go to <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">platform.openai.com/signup</a></li>
                  <li>Create an account (use Google login for speed)</li>
                  <li>Once logged in, click Settings (bottom left) then Billing</li>
                  <li>Click Add payment method and add a card</li>
                  <li>Add $5-10 credits to start (this will last you MONTHS)</li>
                </ol>
              </div>

              <a
                href="https://platform.openai.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Open OpenAI Platform <ExternalLink className="w-4 h-4" />
              </a>

              <div
                className={accountDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setAccountDone(!accountDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={accountDone} onCheckedChange={() => setAccountDone(!accountDone)} />
                  <span className={ds.body + " font-medium"}>I've created my account and added credits</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep("apikey")} disabled={!accountDone} className="gap-2">
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
                <p className={ds.muted}>This is how your app talks to OpenAI</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <ol className={ds.body + " space-y-2 list-decimal list-inside"}>
                  <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">platform.openai.com/api-keys</a></li>
                  <li>Click Create new secret key</li>
                  <li>Give it a name like "My SaaS App"</li>
                  <li>Click Create secret key</li>
                  <li className="text-red-600 font-medium">COPY IT NOW - you won't see it again!</li>
                </ol>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  Your API key looks like <code className="bg-slate-200 px-1 rounded">sk-proj-xxxxxxxxxxxxx</code>
                </p>
                <p className={ds.muted + " mt-1"}>Keep it secret - anyone with this key can use your credits!</p>
              </div>

              <a
                href="https://platform.openai.com/api-keys"
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
                  <Checkbox checked={apiKeyDone} onCheckedChange={() => setApiKeyDone(!apiKeyDone)} />
                  <span className={ds.body + " font-medium"}>I've copied my API key</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("account")} className="gap-2">
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
              {/* EASY WAY */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                <p className="font-bold text-slate-800 mb-2">THE EASY WAY (Recommended)</p>
                <p className={ds.body + " text-slate-700 mb-3"}>
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
              <div className={ds.infoBoxHighlight}>
                <p className={ds.label + " mb-2"}>Manual way (if Agent doesn't work):</p>
                <ol className={ds.muted + " space-y-1 list-decimal list-inside text-sm"}>
                  <li>Click Tools in the left sidebar</li>
                  <li>Click Secrets</li>
                  <li>Click + New Secret</li>
                  <li>Key: <code className="bg-slate-200 px-1 rounded">OPENAI_API_KEY</code></li>
                  <li>Value: paste your API key</li>
                  <li>Click Add Secret</li>
                </ol>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  Why Secrets? Your API key stays hidden from your code. Anyone viewing your code can't steal it.
                </p>
              </div>

              <div
                className={secretsDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setSecretsDone(!secretsDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={secretsDone} onCheckedChange={() => setSecretsDone(!secretsDone)} />
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

      {/* Step 4: Describe Your AI Feature */}
      {step === "describe" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 4: Describe Your AI Feature</h3>
                <p className={ds.muted}>What will AI do in your app?</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Describe ONE feature. What should happen when users interact with AI?
              </p>

              <Textarea
                placeholder="AI will [do what] when users [do what action].

Example: 'AI will generate 5 social media posts when users paste a blog URL'
Example: 'AI will analyze uploaded data and give actionable insights'"
                value={aiFeature}
                onChange={(e) => setAiFeature(e.target.value)}
                className="min-h-[120px]"
              />

              {userIdea && (
                <p className={ds.muted}>Your app... {userIdea}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("secrets")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("build")} disabled={aiFeature.length < 10} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Tell Claude Code */}
      {step === "build" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 5: Tell Claude Code to Build It</h3>
                <p className={ds.muted}>Copy this prompt and let Claude do the work</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Copy this prompt and paste it into Claude Code:
              </p>

              <div className="relative">
                <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap">
{`Add an AI feature to my app:

${aiFeature || "[Describe your AI feature above first]"}

Use the OpenAI API. The API key is already stored in Replit Secrets as OPENAI_API_KEY.`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`Add an AI feature to my app:\n\n${aiFeature}\n\nUse the OpenAI API. The API key is already stored in Replit Secrets as OPENAI_API_KEY.`, "Claude Code prompt")}
                  className="absolute top-2 right-2 gap-2"
                  disabled={!aiFeature}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>Cost is tiny</p>
                <p className={ds.muted + " mt-1"}>
                  AI APIs cost fractions of a penny per request. And most users won't use it as much as you think - actual costs are usually way lower than worst-case estimates.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("describe")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("test")} className="gap-2">
              I Built It - Let's Test! <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Test and Complete */}
      {step === "test" && (
        <>
          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-4"}>Did it work?</h3>

            <div
              className={aiWorking ? ds.optionSelected : ds.optionDefault}
              onClick={() => setAiWorking(!aiWorking)}
            >
              <div className="flex items-center gap-3">
                <Checkbox checked={aiWorking} onCheckedChange={() => setAiWorking(!aiWorking)} />
                <span className={ds.body + " font-medium"}>My AI feature is working</span>
              </div>
            </div>

            <div className="mt-4">
              <p className={ds.muted + " mb-2"}>Notes (optional)...</p>
              <Textarea
                placeholder="Anything you want to remember about how it works..."
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("build")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => onComplete({ aiFeature, aiTestResult: aiNotes, aiWow: aiWorking ? "Working" : "Not working" })}
              disabled={!aiWorking}
              className="gap-2"
            >
              Complete <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
