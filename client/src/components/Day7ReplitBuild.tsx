import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";

interface Day7ReplitBuildProps {
  dayId: number;
  prd: string;
  onComplete: () => void;
}

const BUILD_STEPS = [
  {
    title: "Open Replit",
    description: "Go to Replit and create a new project",
    url: "https://replit.com/~",
  },
  {
    title: "Create a New Repl",
    description: "Click 'Create Repl' and choose your tech stack (e.g., Node.js, Python, React)",
    url: null,
  },
  {
    title: "Copy Your PRD",
    description: "Copy your PRD from below and paste it into a new file called 'PRD.md' in your Repl",
    url: null,
  },
  {
    title: "Ask Claude Code to Build",
    description: "In your Repl, use Claude Code to start building your MVP. Paste your PRD and ask it to scaffold your project",
    url: null,
  },
  {
    title: "Build Your First Feature",
    description: "Start with the first MVP feature from your roadmap. Use Claude Code to help you implement it",
    url: null,
  },
];

export function Day7ReplitBuild({ dayId, prd, onComplete }: Day7ReplitBuildProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const toggleStep = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const handleCopyPRD = () => {
    navigator.clipboard.writeText(prd);
    toast({
      title: "PRD Copied!",
      description: "Your PRD has been copied to your clipboard",
    });
  };

  const allStepsComplete = BUILD_STEPS.every((_, idx) => completedSteps.has(idx));

  const handleContinue = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className={ds.cardWithPadding}>
        <div className="space-y-4">
          <div>
            <h3 className={ds.titleXl}>Time to Build!</h3>
            <p className={ds.text}>
              Today you start building your SaaS in Replit
            </p>
          </div>
        </div>
      </div>

      {/* Build Steps */}
      <div className={ds.cardWithPadding}>
        <h4 className={ds.title + " mb-4"}>Build Steps</h4>
        <p className={ds.textMuted + " mb-4"}>
          Follow these steps to get started building your SaaS
        </p>

        <div className="space-y-3">
          {BUILD_STEPS.map((step, idx) => (
            <div
              key={idx}
              className={completedSteps.has(idx) ? ds.optionSelected : ds.optionDefault}
              onClick={() => toggleStep(idx)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedSteps.has(idx)}
                  onCheckedChange={() => toggleStep(idx)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h5 className={ds.title}>
                      {idx + 1}. {step.title}
                    </h5>
                    {step.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={(e) => { e.stopPropagation(); window.open(step.url, "_blank"); }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </Button>
                    )}
                  </div>
                  <p className={ds.textMuted}>{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRD */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={ds.title}>Your PRD</h4>
          <Button variant="outline" size="sm" onClick={handleCopyPRD} className="gap-2">
            <Copy className="w-4 h-4" />
            Copy PRD
          </Button>
        </div>

        <div className={ds.infoBoxHighlight + " max-h-[400px] overflow-y-auto"}>
          <pre className={ds.textMuted + " whitespace-pre-wrap font-mono text-xs"}>
            {prd}
          </pre>
        </div>
      </div>

      {/* Continue Button */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between">
          <div>
            <p className={ds.title}>
              {completedSteps.size} of {BUILD_STEPS.length} steps completed
            </p>
            {!allStepsComplete && (
              <p className={ds.textMuted + " mt-1"}>
                Complete all steps to continue
              </p>
            )}
            {allStepsComplete && (
              <div className="flex items-center gap-2 mt-2">
                <span className={ds.successText + " font-medium"}>All steps complete! You're building!</span>
              </div>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!allStepsComplete}
          >
            {allStepsComplete ? "Complete Week 1" : "Complete All Steps First"}
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className={ds.infoBoxHighlight}>
        <div className="space-y-3">
          <h4 className={ds.title}>
            Pro Tips for Building in Replit
          </h4>
          <ul className="space-y-2">
            <li className={ds.textMuted}>
              <strong>Start simple:</strong> Build one feature at a time, test it, then move to the next
            </li>
            <li className={ds.textMuted}>
              <strong>Use Claude Code:</strong> Ask it to explain any code you don't understand
            </li>
            <li className={ds.textMuted}>
              <strong>Test constantly:</strong> Use Replit's built-in preview to test your app as you build
            </li>
            <li className={ds.textMuted}>
              <strong>Don't overthink:</strong> Your MVP doesn't need to be perfect, it needs to work
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
