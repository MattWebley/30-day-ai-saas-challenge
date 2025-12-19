import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Zap,
  Brain,
  CreditCard,
  Mail,
  Database,
  Copy,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day15SuperpowerSelectorProps {
  dayId: number;
  onComplete: () => void;
}

const SUPERPOWERS = [
  {
    id: "ai",
    label: "AI Brain",
    icon: Brain,
    color: "purple",
    description: "Make your app SMART - generate, analyze, answer, automate",
    service: "OpenAI",
    signupUrl: "https://platform.openai.com",
    cost: "~$0.002 per request",
    setupTime: "5 minutes",
  },
  {
    id: "payments",
    label: "Money Collection",
    icon: CreditCard,
    color: "green",
    description: "Accept payments, subscriptions, handle refunds",
    service: "Stripe",
    signupUrl: "https://stripe.com",
    cost: "2.9% + 30¢ per transaction",
    setupTime: "15 minutes",
  },
  {
    id: "email",
    label: "Communication",
    icon: Mail,
    color: "blue",
    description: "Send emails that hit INBOXES, not spam folders",
    service: "Resend",
    signupUrl: "https://resend.com",
    cost: "Free for 3,000/month",
    setupTime: "10 minutes",
  },
  {
    id: "storage",
    label: "File Storage",
    icon: Database,
    color: "orange",
    description: "Let users upload files, images, documents",
    service: "Cloudinary or AWS S3",
    signupUrl: "https://cloudinary.com",
    cost: "Free tier available",
    setupTime: "10 minutes",
  },
];

export function Day15SuperpowerSelector({ dayId, onComplete }: Day15SuperpowerSelectorProps) {
  const [step, setStep] = useState<"select" | "prioritize" | "roadmap">("select");
  const [selectedPowers, setSelectedPowers] = useState<Set<string>>(new Set());
  const [prioritizedPowers, setPrioritizedPowers] = useState<string[]>([]);
  const [signedUp, setSignedUp] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const togglePower = (powerId: string) => {
    const newSelected = new Set(selectedPowers);
    if (newSelected.has(powerId)) {
      newSelected.delete(powerId);
    } else {
      newSelected.add(powerId);
    }
    setSelectedPowers(newSelected);
  };

  const handleContinueToPrioritize = () => {
    setPrioritizedPowers(Array.from(selectedPowers));
    setStep("prioritize");
  };

  const movePower = (index: number, direction: "up" | "down") => {
    const newOrder = [...prioritizedPowers];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setPrioritizedPowers(newOrder);
  };

  const toggleSignedUp = (powerId: string) => {
    const newSignedUp = new Set(signedUp);
    if (newSignedUp.has(powerId)) {
      newSignedUp.delete(powerId);
    } else {
      newSignedUp.add(powerId);
    }
    setSignedUp(newSignedUp);
  };

  const generateRoadmapPrompt = () => {
    const powers = prioritizedPowers.map(id => SUPERPOWERS.find(p => p.id === id)!);
    return `I want to add these superpowers to my app in this order:

${powers.map((p, i) => `${i + 1}. ${p.label} (${p.service})
   - What it does: ${p.description}
   - I'll use: ${p.service}`).join("\n\n")}

For each one, tell me:
1. What API key/secret I need
2. Where to store it in Replit Secrets
3. The basic integration code

Start with #1 and make sure it's working before moving to #2.`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generateRoadmapPrompt());
    toast({
      title: "Roadmap Prompt Copied!",
      description: "Paste this into ChatGPT or Claude for guidance",
    });
  };

  const allSignedUp = prioritizedPowers.every(p => signedUp.has(p));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Unlock Your SUPERPOWERS</h3>
            <p className="text-slate-600 mt-1">
              APIs let you add features that would take YEARS to build yourself.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Select Powers", "Prioritize", "Setup Roadmap"].map((label, idx) => {
          const steps = ["select", "prioritize", "roadmap"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-purple-100 text-purple-700" :
                isCurrent ? "bg-purple-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 2 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Select */}
      {step === "select" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Which superpowers does your app need?</h4>
          <p className="text-sm text-slate-500 mb-4">Select all that apply - you don't need all of them!</p>

          <div className="grid gap-3">
            {SUPERPOWERS.map((power) => {
              const Icon = power.icon;
              const isSelected = selectedPowers.has(power.id);
              return (
                <button
                  key={power.id}
                  onClick={() => togglePower(power.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-slate-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900">{power.label}</div>
                        <span className="text-xs text-slate-400">{power.service}</span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">{power.description}</div>
                      <div className="flex gap-4 mt-2 text-xs text-slate-400">
                        <span>Cost: {power.cost}</span>
                        <span>Setup: {power.setupTime}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={selectedPowers.size === 0}
            onClick={handleContinueToPrioritize}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Prioritize */}
      {step === "prioritize" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What order should you add them?</h4>
          <p className="text-sm text-slate-500 mb-4">Drag or use arrows to prioritize. Top = add first.</p>

          <div className="space-y-2">
            {prioritizedPowers.map((powerId, index) => {
              const power = SUPERPOWERS.find(p => p.id === powerId)!;
              const Icon = power.icon;
              return (
                <div
                  key={powerId}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 bg-white"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => movePower(index, "up")}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? "text-slate-200" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => movePower(index, "down")}
                      disabled={index === prioritizedPowers.length - 1}
                      className={`p-1 rounded ${index === prioritizedPowers.length - 1 ? "text-slate-200" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <Icon className="w-5 h-5 text-slate-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{power.label}</div>
                    <div className="text-xs text-slate-500">{power.service}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("select")}>
              Back
            </Button>
            <Button className="flex-1" size="lg" onClick={() => setStep("roadmap")}>
              Create My Roadmap <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Roadmap */}
      {step === "roadmap" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-4">Your Superpower Roadmap</h4>

            <div className="space-y-3">
              {prioritizedPowers.map((powerId, index) => {
                const power = SUPERPOWERS.find(p => p.id === powerId)!;
                const Icon = power.icon;
                const isSignedUp = signedUp.has(powerId);
                return (
                  <div
                    key={powerId}
                    className={`p-4 rounded-lg border-2 ${
                      isSignedUp ? "border-green-300 bg-green-50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isSignedUp ? "bg-green-500 text-white" : "bg-purple-100 text-purple-600"
                      }`}>
                        {isSignedUp ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900">{power.label}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => window.open(power.signupUrl, "_blank")}
                          >
                            <ExternalLink className="w-3 h-3" />
                            {power.service}
                          </Button>
                        </div>
                        <div className="text-sm text-slate-600 mt-1">{power.description}</div>
                        <div className="mt-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={isSignedUp}
                              onCheckedChange={() => toggleSignedUp(powerId)}
                            />
                            <span className={`text-sm font-medium ${isSignedUp ? "text-green-700" : "text-slate-600"}`}>
                              I've signed up for {power.service}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Integration Help Prompt</h4>
                <p className="text-sm text-slate-500">Copy this for ChatGPT/Claude guidance</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-purple-500 hover:bg-purple-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[200px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generateRoadmapPrompt()}
              </pre>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {allSignedUp ? "All accounts created!" : `${signedUp.size} of ${prioritizedPowers.length} accounts created`}
                </p>
                <p className="text-sm text-slate-500">
                  You can add more superpowers anytime
                </p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 15
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">API Golden Rules</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>NEVER put API keys in your code.</strong> Always use environment variables/secrets.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Start with one.</strong> Get it working before adding the next.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Test in test mode.</strong> Stripe, OpenAI all have test modes. Use them!</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
