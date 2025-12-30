import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Wrench,
  CheckCircle2,
  Pause,
  Play,
  ChevronRight,
  AlertTriangle
} from "lucide-react";

interface Day10FixIterateProps {
  onComplete: () => void;
}

const FIX_WORKFLOW = [
  { id: "pick", text: "Pick ONE issue from your Day 9 audit list" },
  { id: "describe", text: "Describe the issue clearly to Claude Code" },
  { id: "fix", text: "Let AI fix it" },
  { id: "test", text: "Test immediately - does it work now?" },
  { id: "commit", text: "If it works, commit to GitHub" },
];

const FIX_TIPS = [
  "Don't batch fixes - one at a time",
  "Commit working code before trying risky changes",
  "It's OK to skip something and come back later",
  "Ask Claude Code to EXPLAIN the problem if stuck",
];

export function Day10FixIterate({ onComplete }: Day10FixIterateProps) {
  const [workflowChecked, setWorkflowChecked] = useState<Set<string>>(new Set());
  const [fixCount, setFixCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const toggleWorkflow = (id: string) => {
    const newChecked = new Set(workflowChecked);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setWorkflowChecked(newChecked);
  };

  const incrementFix = () => {
    setFixCount(fixCount + 1);
    // Reset workflow for next fix
    setWorkflowChecked(new Set());
  };

  const allWorkflowComplete = FIX_WORKFLOW.every((step) => workflowChecked.has(step.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Fix & Iterate</h3>
            <p className="text-slate-600 mt-1">Work through your fix list. Take your time - use PAUSE if needed.</p>
          </div>
        </div>
      </Card>

      {/* Pause Notice */}
      <Card className="p-4 border-2 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">This day is designed to be PAUSED</p>
            <p className="text-sm text-amber-700 mt-1">
              If you have many fixes, take your time. Use the pause button below and come back when ready.
              There's no prize for rushing - a working app is worth more than a fast launch.
            </p>
          </div>
        </div>
      </Card>

      {/* Pause Button */}
      <Card className="p-4 border-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900">Challenge Status</h4>
            <p className="text-sm text-slate-600">
              {isPaused ? "Challenge paused - take your time fixing" : "Challenge active"}
            </p>
          </div>
          <Button
            variant={isPaused ? "default" : "outline"}
            onClick={() => setIsPaused(!isPaused)}
            className="gap-2"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause Challenge
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Fix Counter */}
      <Card className="p-4 border-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900">Fixes Completed Today</h4>
            <p className="text-sm text-slate-600">Track your progress</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black text-green-600">{fixCount}</span>
          </div>
        </div>
      </Card>

      {/* Fix Workflow */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Current Fix Workflow</h4>
        <div className="space-y-3">
          {FIX_WORKFLOW.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleWorkflow(step.id)}
            >
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {index + 1}
              </span>
              <Checkbox
                checked={workflowChecked.has(step.id)}
                onCheckedChange={() => toggleWorkflow(step.id)}
              />
              <span className={`text-sm ${workflowChecked.has(step.id) ? "text-slate-500 line-through" : "text-slate-700"}`}>
                {step.text}
              </span>
            </div>
          ))}
        </div>
        {allWorkflowComplete && (
          <Button onClick={incrementFix} className="w-full mt-4 gap-2" variant="outline">
            <CheckCircle2 className="w-4 h-4" />
            Mark Fix Complete & Start Next
          </Button>
        )}
      </Card>

      {/* Tips */}
      <Card className="p-4 border-2 border-slate-200">
        <h4 className="font-bold text-sm mb-3 text-slate-900">Fixing Tips</h4>
        <ul className="space-y-2">
          {FIX_TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-green-600">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </Card>

      {/* Complete Button */}
      {fixCount >= 1 && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          {fixCount} Fix{fixCount !== 1 ? "es" : ""} Done - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
