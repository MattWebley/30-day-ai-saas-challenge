import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  Copy,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface Day10CoreFeatureProps {
  dayId: number;
  userIdea: string;
  onComplete: () => void;
}

const FEATURE_TYPES = [
  { id: "save", label: "SAVE time on something tedious", icon: "⏱️" },
  { id: "make", label: "MAKE more money", icon: "💰" },
  { id: "avoid", label: "AVOID costly mistakes", icon: "🛡️" },
  { id: "get", label: "GET something they couldn't before", icon: "🎯" },
];

export function Day10CoreFeature({ dayId, userIdea, onComplete }: Day10CoreFeatureProps) {
  const [step, setStep] = useState<"define" | "specify" | "prompt" | "test">("define");
  const [featureType, setFeatureType] = useState<string>("");
  const [coreStatement, setCoreStatement] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [userOutput, setUserOutput] = useState<string>("");
  const [featureSpec, setFeatureSpec] = useState<string>("");
  const [buildPrompt, setBuildPrompt] = useState<string>("");
  const [testChecklist, setTestChecklist] = useState({
    acceptsInput: false,
    processes: false,
    showsOutput: false,
    handlesErrors: false,
  });
  const { toast } = useToast();

  const generateSpec = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-feature-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: userIdea,
          coreStatement,
          featureType,
          userInput,
          userOutput,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate spec");
      return response.json();
    },
    onSuccess: (data) => {
      setFeatureSpec(data.spec || "");
      setBuildPrompt(data.prompt || "");
      setStep("prompt");
    },
    onError: () => {
      // Generate fallback spec
      const spec = `CORE FEATURE SPECIFICATION

What users pay for: ${coreStatement}

USER FLOW:
1. User provides: ${userInput}
2. System processes the input
3. User receives: ${userOutput}

REQUIREMENTS:
- Clear input field/form for user data
- Processing with loading state
- Output display with clear formatting
- Error handling for invalid inputs

SUCCESS CRITERIA:
- User can complete the flow in under 30 seconds
- Output is immediately useful
- Errors are helpful, not scary`;

      const prompt = `Build my core feature: ${coreStatement}

Here's what it needs to do:

1. USER INPUT
   Create a form/input area where users provide: ${userInput}
   - Add proper validation
   - Show clear labels and placeholders
   - Make it obvious what to enter

2. PROCESSING
   When user submits:
   - Show a loading state
   - Process their input
   - Handle any errors gracefully

3. OUTPUT
   Display the result: ${userOutput}
   - Make it easy to read/use
   - Add a "copy" button if it's text
   - Show success state

4. ERROR HANDLING
   - Show helpful error messages
   - Don't lose their input if something fails
   - Provide "try again" option

Make this the MAIN feature of the app - it should be front and center on the dashboard.`;

      setFeatureSpec(spec);
      setBuildPrompt(prompt);
      setStep("prompt");
    }
  });

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildPrompt);
    toast({
      title: "Prompt Copied!",
      description: "Paste this into Replit Agent to build your feature",
    });
  };

  const allTestsPass = Object.values(testChecklist).every(Boolean);

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Build The MONEY Feature</h3>
            <p className="text-slate-600 mt-1">
              The ONE thing people will actually PAY for. Let's build it.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Define", "Specify", "Build", "Test"].map((label, idx) => {
          const steps = ["define", "specify", "prompt", "test"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-green-100 text-green-700" :
                isCurrent ? "bg-green-500 text-white" :
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

      {/* Step 1: Define */}
      {step === "define" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What does your app help people DO?</h4>
          <p className="text-sm text-slate-500 mb-4">Pick the primary value you provide</p>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {FEATURE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setFeatureType(type.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  featureType === type.id
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-green-500"
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-bold text-slate-900">{type.label}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                Complete this sentence: "People pay me to..."
              </label>
              <Input
                value={coreStatement}
                onChange={(e) => setCoreStatement(e.target.value)}
                placeholder="e.g., automatically generate social media posts from their blog"
                className="text-lg"
              />
              <p className="text-sm text-slate-500 mt-1">Be specific! Not "manage things" but "track Amazon FBA inventory"</p>
            </div>
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={!featureType || !coreStatement}
            onClick={() => setStep("specify")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Specify */}
      {step === "specify" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Define the Input → Output</h4>
          <p className="text-sm text-slate-500 mb-4">What do users give, and what do they get back?</p>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                Users INPUT: (what they provide)
              </label>
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., their blog post URL, a text description, raw data..."
              />
            </div>

            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-8 h-0.5 bg-slate-200" />
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Your app processes it</span>
                <div className="w-8 h-0.5 bg-slate-200" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                Users GET: (what they receive)
              </label>
              <Input
                value={userOutput}
                onChange={(e) => setUserOutput(e.target.value)}
                placeholder="e.g., 5 ready-to-post social updates, a detailed report, actionable insights..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("define")}>
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!userInput || !userOutput || generateSpec.isPending}
              onClick={() => generateSpec.mutate()}
            >
              {generateSpec.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Build Prompt <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Build Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-2">Your Feature Spec</h4>
            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[200px] overflow-y-auto mb-4">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {featureSpec}
              </pre>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Build Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-green-500 hover:bg-green-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {buildPrompt}
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
          <h4 className="font-bold text-slate-900 mb-2">Test Your Feature</h4>
          <p className="text-sm text-slate-500 mb-4">Check each item as you verify it works</p>

          <div className="space-y-3">
            {[
              { key: "acceptsInput", label: "Does it accept input?", desc: "Can you enter/upload what users need to provide?" },
              { key: "processes", label: "Does it process correctly?", desc: "Does it do something with the input?" },
              { key: "showsOutput", label: "Does it show the output?", desc: "Can you see the result clearly?" },
              { key: "handlesErrors", label: "Does it handle errors?", desc: "What happens with bad/empty input?" },
            ].map((item) => (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  testChecklist[item.key as keyof typeof testChecklist]
                    ? "border-green-300 bg-green-50"
                    : "border-slate-200 hover:border-green-500"
                }`}
                onClick={() => setTestChecklist(prev => ({
                  ...prev,
                  [item.key]: !prev[item.key as keyof typeof testChecklist]
                }))}
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
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-bold text-green-800">Your money feature WORKS!</div>
                  <div className="text-sm text-green-700">This is the thing people will pay for.</div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setStep("prompt")}>
              Back to Prompt
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!allTestsPass}
              onClick={handleComplete}
            >
              {allTestsPass ? "Complete Day 10" : "Complete All Tests First"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
