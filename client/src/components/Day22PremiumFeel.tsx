import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles,
  Copy,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  ThumbsUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day22PremiumFeelProps {
  dayId: number;
  onComplete: () => void;
}

interface AppAction {
  id: string;
  name: string;
  hasLoading: boolean;
  hasSuccess: boolean;
  hasError: boolean;
}

const VIBE_OPTIONS = [
  { id: "professional", label: "💼 Professional", desc: "Clean, corporate, trustworthy" },
  { id: "friendly", label: "😊 Friendly", desc: "Warm, encouraging, approachable" },
  { id: "powerful", label: "💪 Powerful", desc: "Bold, confident, no-nonsense" },
  { id: "fun", label: "🎉 Fun", desc: "Playful, delightful, surprising" },
];

export function Day22PremiumFeel({ dayId, onComplete }: Day22PremiumFeelProps) {
  const [step, setStep] = useState<"vibe" | "actions" | "audit" | "prompt">("vibe");
  const [selectedVibe, setSelectedVibe] = useState<string>("");
  const [actions, setActions] = useState<AppAction[]>([
    { id: "1", name: "Submit form", hasLoading: false, hasSuccess: false, hasError: false },
    { id: "2", name: "Generate content", hasLoading: false, hasSuccess: false, hasError: false },
    { id: "3", name: "Save changes", hasLoading: false, hasSuccess: false, hasError: false },
  ]);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const { toast } = useToast();

  const addAction = () => {
    setActions([...actions, {
      id: Date.now().toString(),
      name: "",
      hasLoading: false,
      hasSuccess: false,
      hasError: false,
    }]);
  };

  const removeAction = (id: string) => {
    if (actions.length > 1) {
      setActions(actions.filter(a => a.id !== id));
    }
  };

  const updateAction = (id: string, field: keyof AppAction, value: any) => {
    setActions(actions.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const missingFeedback = actions.filter(
    a => a.name && (!a.hasLoading || !a.hasSuccess || !a.hasError)
  );

  const generateBuildPrompt = () => {
    const vibe = VIBE_OPTIONS.find(v => v.id === selectedVibe);
    const needsFix = missingFeedback.map(a => ({
      name: a.name,
      needs: [
        !a.hasLoading && "loading state",
        !a.hasSuccess && "success feedback",
        !a.hasError && "error handling",
      ].filter(Boolean),
    }));

    const prompt = `Improve the UX polish of my app to make it feel PREMIUM:

APP VIBE: ${vibe?.label} - ${vibe?.desc}

${needsFix.length > 0 ? `ACTIONS THAT NEED FEEDBACK:
${needsFix.map((a, i) => `${i + 1}. "${a.name}" needs: ${a.needs.join(", ")}`).join("\n")}

For each action above, add:
- LOADING: Spinner or "Processing..." text while working
- SUCCESS: Green checkmark or toast saying "Done!" or similar
- ERROR: Red message explaining what went wrong + how to fix

` : ""}
GENERAL IMPROVEMENTS:

1. TOAST NOTIFICATIONS
   - Use a toast library (like sonner or react-hot-toast)
   - Success: Green, auto-dismiss after 3 seconds
   - Error: Red, stays until dismissed
   - ${selectedVibe === "fun" ? "Add subtle animations and emojis" : "Keep them clean and professional"}

2. LOADING STATES
   - Buttons show spinner when clicked
   - Forms disable during submission
   - Skeleton loaders for data that takes time

3. CONFIRMATION DIALOGS
   - Before deleting anything important
   - Before canceling subscriptions
   - Clear "Cancel" and "Confirm" buttons

4. ERROR MESSAGES
   ${selectedVibe === "professional" ? `
   - "Unable to complete this action. Please try again."
   - "There was an issue saving your changes."` : `
   - "Oops! Something went wrong. Let's try that again."
   - "Hmm, that didn't work. Mind trying once more?"`}

5. MICRO-INTERACTIONS
   - Buttons have hover effects
   - Inputs have focus states
   - ${selectedVibe === "fun" ? "Add subtle animations on success" : "Keep transitions smooth but minimal"}

Make every click feel acknowledged. No dead clicks. No confusion.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Premium Feel Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Make It FEEL Premium</h3>
            <p className="text-slate-600 mt-1">
              Every click should feel acknowledged. That's the difference.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Vibe", "Actions", "Audit", "Build"].map((label, idx) => {
          const steps = ["vibe", "actions", "audit", "prompt"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-pink-100 text-pink-700" :
                isCurrent ? "bg-pink-500 text-white" :
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

      {/* Step 1: Vibe */}
      {step === "vibe" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What's your app's personality?</h4>
          <p className="text-sm text-slate-500 mb-4">This affects how feedback messages feel</p>

          <div className="grid sm:grid-cols-2 gap-3">
            {VIBE_OPTIONS.map((vibe) => (
              <button
                key={vibe.id}
                onClick={() => setSelectedVibe(vibe.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedVibe === vibe.id
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-pink-300"
                }`}
              >
                <div className="text-xl mb-1">{vibe.label}</div>
                <div className="text-sm text-slate-600">{vibe.desc}</div>
              </button>
            ))}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={!selectedVibe}
            onClick={() => setStep("actions")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Actions */}
      {step === "actions" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900">What are your main actions?</h4>
              <p className="text-sm text-slate-500">List the buttons/forms users interact with</p>
            </div>
            <Button variant="outline" onClick={addAction} className="gap-2">
              <Plus className="w-4 h-4" /> Add Action
            </Button>
          </div>

          <div className="space-y-3">
            {actions.map((action) => (
              <div key={action.id} className="p-3 rounded-lg border-2 border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Input
                    value={action.name}
                    onChange={(e) => updateAction(action.id, "name", e.target.value)}
                    placeholder="e.g., Submit form, Generate report..."
                    className="flex-1"
                  />
                  {actions.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeAction(action.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("vibe")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!actions.some(a => a.name)}
              onClick={() => setStep("audit")}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Audit */}
      {step === "audit" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Audit your feedback states</h4>
          <p className="text-sm text-slate-500 mb-4">Does each action have all three?</p>

          <div className="space-y-4">
            {actions.filter(a => a.name).map((action) => (
              <div key={action.id} className="p-4 rounded-lg border-2 border-slate-200">
                <div className="font-semibold text-slate-900 mb-3">{action.name}</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateAction(action.id, "hasLoading", !action.hasLoading)}
                    className={`p-3 rounded-lg border-2 text-center ${
                      action.hasLoading ? "border-green-500 bg-green-50" : "border-slate-200"
                    }`}
                  >
                    <Loader2 className={`w-5 h-5 mx-auto mb-1 ${action.hasLoading ? "text-green-600" : "text-slate-400"}`} />
                    <div className="text-xs font-medium">Loading</div>
                  </button>
                  <button
                    onClick={() => updateAction(action.id, "hasSuccess", !action.hasSuccess)}
                    className={`p-3 rounded-lg border-2 text-center ${
                      action.hasSuccess ? "border-green-500 bg-green-50" : "border-slate-200"
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 mx-auto mb-1 ${action.hasSuccess ? "text-green-600" : "text-slate-400"}`} />
                    <div className="text-xs font-medium">Success</div>
                  </button>
                  <button
                    onClick={() => updateAction(action.id, "hasError", !action.hasError)}
                    className={`p-3 rounded-lg border-2 text-center ${
                      action.hasError ? "border-green-500 bg-green-50" : "border-slate-200"
                    }`}
                  >
                    <AlertCircle className={`w-5 h-5 mx-auto mb-1 ${action.hasError ? "text-green-600" : "text-slate-400"}`} />
                    <div className="text-xs font-medium">Error</div>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {missingFeedback.length > 0 && (
            <Card className="p-4 border-2 border-amber-200 bg-amber-50 mt-4">
              <div className="text-sm text-amber-800">
                <strong>{missingFeedback.length} action{missingFeedback.length > 1 ? "s" : ""} need{missingFeedback.length === 1 ? "s" : ""} improvement.</strong>
                {" "}We'll generate fixes for these.
              </div>
            </Card>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("actions")}>Back</Button>
            <Button className="flex-1" size="lg" onClick={generateBuildPrompt}>
              Generate Fix Prompt <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Premium Feel Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-pink-500 hover:bg-pink-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Ready to continue?</p>
                <p className="text-sm text-slate-500">Apply the fixes, then move on</p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 22
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">The Premium Feel Formula</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Something is happening</strong> → Loading spinner or text</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>It worked</strong> → Green checkmark or success toast</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>It broke</strong> → Helpful error message with next steps</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
