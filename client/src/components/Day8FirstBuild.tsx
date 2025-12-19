import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ExternalLink,
  Rocket,
  CheckCircle2,
  Copy,
  Sparkles,
  PartyPopper
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day8FirstBuildProps {
  dayId: number;
  prd: string;
  onComplete: () => void;
}

const BUILD_STEPS = [
  {
    id: "open-replit",
    title: "Open Replit",
    description: "Go to Replit and click 'Create Repl' → Select 'Agent'",
    url: "https://replit.com/~",
    action: "Open Replit",
  },
  {
    id: "paste-prd",
    title: "Paste Your PRD",
    description: "Copy your PRD below and paste the ENTIRE thing into the Agent chat",
    url: null,
    action: null,
  },
  {
    id: "watch-magic",
    title: "Watch The Magic",
    description: "Hit enter and watch the Agent build your app. This takes 2-5 minutes.",
    url: null,
    action: null,
  },
  {
    id: "click-around",
    title: "Click Around Your App",
    description: "Once it's done, open the preview and click through. Does it load? Can you see screens?",
    url: null,
    action: null,
  },
];

export function Day8FirstBuild({ dayId, prd, onComplete }: Day8FirstBuildProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const handleCopyPRD = () => {
    navigator.clipboard.writeText(prd);
    toast({
      title: "PRD Copied!",
      description: "Now paste it into Replit Agent",
    });
  };

  const allStepsComplete = BUILD_STEPS.every((step) => completedSteps.has(step.id));
  const progress = (completedSteps.size / BUILD_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Watch The MAGIC Happen
            </h3>
            <p className="text-slate-600 mt-1">
              Today your idea becomes REAL. Follow these steps and watch AI build your app.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-slate-700">Your Progress</span>
          <span className="font-bold text-primary">{completedSteps.size} of {BUILD_STEPS.length} steps</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Build Steps */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h4 className="font-bold text-slate-900 mb-2">Build Steps</h4>
        <p className="text-sm text-slate-500 mb-4">
          Check each step as you complete it
        </p>

        <div className="space-y-3">
          {BUILD_STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                completedSteps.has(step.id)
                  ? "border-green-300 bg-green-50"
                  : "border-slate-200 bg-white hover:border-primary"
              }`}
            >
              <Checkbox
                checked={completedSteps.has(step.id)}
                onCheckedChange={() => toggleStep(step.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h5 className={`font-bold ${completedSteps.has(step.id) ? "text-green-700" : "text-slate-900"}`}>
                    {idx + 1}. {step.title}
                  </h5>
                  {step.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 shrink-0"
                      onClick={() => window.open(step.url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {step.action || "Open"}
                    </Button>
                  )}
                </div>
                <p className={`text-sm ${completedSteps.has(step.id) ? "text-green-600" : "text-slate-600"}`}>
                  {step.description}
                </p>
              </div>
              {completedSteps.has(step.id) && (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* PRD Card */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-slate-900">Your PRD</h4>
            <p className="text-sm text-slate-500">Copy this and paste into Replit Agent</p>
          </div>
          <Button
            onClick={handleCopyPRD}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Copy className="w-4 h-4" />
            Copy PRD
          </Button>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
          {prd ? (
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
              {prd}
            </pre>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="font-medium">No PRD found</p>
              <p className="text-sm mt-1">Complete Day 6 first to generate your PRD</p>
            </div>
          )}
        </div>
      </Card>

      {/* Completion Card */}
      {allStepsComplete ? (
        <Card className="p-6 border-2 border-green-300 bg-green-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-800 text-lg">
                You Did It! You're a BUILDER Now!
              </h4>
              <p className="text-green-700 text-sm mt-1">
                You just built something REAL. Most people never get this far.
              </p>
            </div>
            <Button
              size="lg"
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              Complete Day 8
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {BUILD_STEPS.length - completedSteps.size} steps remaining
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Complete all steps to continue
              </p>
            </div>
            <Button
              size="lg"
              disabled
              className="opacity-50"
            >
              Complete All Steps First
            </Button>
          </div>
        </Card>
      )}

      {/* Motivation Card */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <div className="space-y-3">
          <h4 className="font-bold text-amber-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Remember This
          </h4>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>It won't be perfect.</strong> That's okay. You'll customize it over the next few days.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>You don't need to understand the code.</strong> You just need to DIRECT it.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>This would take a dev team WEEKS.</strong> You're doing it in MINUTES.
              </span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
