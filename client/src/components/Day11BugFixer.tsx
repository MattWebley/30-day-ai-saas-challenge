import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bug,
  Copy,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Eye,
  Zap,
  HelpCircle,
  Trophy,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day11BugFixerProps {
  dayId: number;
  onComplete: () => void;
}

const BUG_TYPES = [
  {
    id: "visual",
    label: "Something LOOKS wrong",
    icon: Eye,
    color: "purple",
    description: "Colors, layout, text, styling issues",
    promptTemplate: (expected: string, actual: string) => `I have a VISUAL bug:

WHAT I SEE: ${actual}

WHAT IT SHOULD LOOK LIKE: ${expected}

Please fix the styling/CSS to make it look correct. Check:
- Colors and backgrounds
- Spacing and alignment
- Font sizes and weights
- Responsive/mobile layout`
  },
  {
    id: "functional",
    label: "Something DOESN'T WORK",
    icon: Zap,
    color: "orange",
    description: "Buttons don't click, forms don't submit, features broken",
    promptTemplate: (expected: string, actual: string) => `I have a FUNCTIONAL bug:

WHAT'S HAPPENING: ${actual}

WHAT SHOULD HAPPEN: ${expected}

Please fix the functionality. Check:
- Event handlers (onClick, onSubmit)
- State management
- API calls and responses
- Data flow between components`
  },
  {
    id: "error",
    label: "I see an ERROR message",
    icon: AlertTriangle,
    color: "red",
    description: "Red text, crash, error popup, console errors",
    promptTemplate: (expected: string, actual: string) => `I have an ERROR:

THE ERROR MESSAGE: ${actual}

WHAT I WAS TRYING TO DO: ${expected}

Please fix this error. The error likely means:
- Check the exact line mentioned in the error
- Look for undefined variables or missing imports
- Check API endpoints and database queries
- Verify all required props are being passed`
  },
  {
    id: "weird",
    label: "It's just... WEIRD",
    icon: HelpCircle,
    color: "blue",
    description: "Unexpected behavior, glitchy, something's off",
    promptTemplate: (expected: string, actual: string) => `I have UNEXPECTED BEHAVIOR:

WHAT'S HAPPENING: ${actual}

WHAT I EXPECTED: ${expected}

Please investigate and fix. Check:
- Race conditions or timing issues
- State not updating correctly
- Cache or stale data problems
- Edge cases not handled`
  },
];

interface BugFixed {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
}

export function Day11BugFixer({ dayId, onComplete }: Day11BugFixerProps) {
  const [selectedBugType, setSelectedBugType] = useState<string>("");
  const [expectedBehavior, setExpectedBehavior] = useState<string>("");
  const [actualBehavior, setActualBehavior] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [bugsFixed, setBugsFixed] = useState<BugFixed[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  const bugType = BUG_TYPES.find(b => b.id === selectedBugType);

  const generateFixPrompt = () => {
    if (!bugType) return;
    const prompt = bugType.promptTemplate(expectedBehavior, actualBehavior);
    setGeneratedPrompt(prompt);
    setShowPrompt(true);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Fix Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const handleBugFixed = () => {
    const newBug: BugFixed = {
      id: Date.now().toString(),
      type: bugType?.label || "",
      description: actualBehavior.slice(0, 50) + "...",
      timestamp: new Date(),
    };
    setBugsFixed([...bugsFixed, newBug]);

    // Reset for next bug
    setSelectedBugType("");
    setExpectedBehavior("");
    setActualBehavior("");
    setGeneratedPrompt("");
    setShowPrompt(false);

    toast({
      title: "Bug Squashed! 🎉",
      description: `${bugsFixed.length + 1} bugs fixed today!`,
    });
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">5-Minute Bug Fixes</h3>
            <p className="text-slate-600 mt-1">
              Something broken? Let's fix it FAST. No more hours of frustration.
            </p>
          </div>
        </div>
      </Card>

      {/* Bug Counter */}
      {bugsFixed.length > 0 && (
        <Card className="p-4 border-2 border-green-300 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-bold text-green-800">Bugs Squashed Today: {bugsFixed.length}</div>
                <div className="text-sm text-green-700">Every bug fixed makes you better at this!</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!showPrompt ? (
        <>
          {/* Step 1: Bug Type */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-2">What's going wrong?</h4>
            <p className="text-sm text-slate-500 mb-4">Select the type of problem you're experiencing</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {BUG_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedBugType(type.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedBugType === type.id
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                    style={{
                      borderColor: selectedBugType === type.id ?
                        type.color === "purple" ? "#8B5CF6" :
                        type.color === "orange" ? "#F97316" :
                        type.color === "red" ? "#EF4444" : "#3B82F6"
                        : undefined,
                      backgroundColor: selectedBugType === type.id ?
                        type.color === "purple" ? "#FAF5FF" :
                        type.color === "orange" ? "#FFF7ED" :
                        type.color === "red" ? "#FEF2F2" : "#EFF6FF"
                        : undefined
                    }}
                  >
                    <Icon className="w-6 h-6 mb-2 text-slate-600" />
                    <div className="font-bold text-slate-900">{type.label}</div>
                    <div className="text-sm text-slate-500">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Step 2: Describe */}
          {selectedBugType && (
            <Card className="p-6 border-2 border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900 mb-4">Describe the bug</h4>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-900 mb-2">
                    What's ACTUALLY happening? (the bug)
                  </label>
                  <Textarea
                    value={actualBehavior}
                    onChange={(e) => setActualBehavior(e.target.value)}
                    placeholder={
                      selectedBugType === "visual" ? "e.g., The button is gray instead of blue, and the text is tiny" :
                      selectedBugType === "functional" ? "e.g., When I click Submit, nothing happens at all" :
                      selectedBugType === "error" ? "e.g., TypeError: Cannot read property 'map' of undefined" :
                      "e.g., Sometimes the data loads, sometimes it doesn't..."
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-2">
                    What SHOULD happen? (expected)
                  </label>
                  <Textarea
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    placeholder={
                      selectedBugType === "visual" ? "e.g., The button should be blue and the text should be readable" :
                      selectedBugType === "functional" ? "e.g., It should save my data and show a success message" :
                      selectedBugType === "error" ? "e.g., I was trying to load the list of items on the dashboard" :
                      "e.g., The data should always load within 2 seconds"
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Button
                className="w-full mt-4"
                size="lg"
                disabled={!actualBehavior || !expectedBehavior}
                onClick={generateFixPrompt}
              >
                Generate Fix Prompt <Wrench className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Generated Prompt */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Fix Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-orange-500 hover:bg-orange-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-4">Did it work?</h4>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPrompt(false);
                }}
              >
                Still broken - Try again
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 gap-2"
                onClick={handleBugFixed}
              >
                <CheckCircle2 className="w-4 h-4" />
                Bug Fixed!
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">The 5-Minute Rule</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>30 seconds:</strong> Identify the bug type</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>1 minute:</strong> Describe expected vs actual</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>30 seconds:</strong> Copy prompt into Replit</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>2-3 minutes:</strong> Let Agent fix it, test result</span>
          </li>
        </ul>
      </Card>

      {/* Complete Button */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {bugsFixed.length === 0
                ? "Fix at least one bug to continue"
                : `Great work! ${bugsFixed.length} bug${bugsFixed.length > 1 ? 's' : ''} fixed.`}
            </p>
            <p className="text-sm text-slate-500">
              You can always come back to fix more bugs later
            </p>
          </div>
          <Button
            size="lg"
            disabled={bugsFixed.length === 0}
            onClick={handleComplete}
          >
            Complete Day 11
          </Button>
        </div>
      </Card>
    </div>
  );
}
