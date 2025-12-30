import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Copy,
  CheckCircle2,
  ChevronRight,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day17OnboardingProps {
  onComplete: () => void;
}

const ONBOARDING_PATTERNS = [
  { id: "guided", name: "Guided First Action", desc: "Take users straight to main feature with example data" },
  { id: "tour", name: "Quick Tour", desc: "3-4 tooltips pointing at key features" },
  { id: "preferences", name: "Collect Preferences", desc: "Ask 2-3 questions, then personalize" },
];

const CHECKLIST = [
  { id: "pattern", text: "Chose an onboarding pattern" },
  { id: "implemented", text: "Implemented onboarding flow" },
  { id: "first-success", text: "Users reach first success within 2 minutes" },
  { id: "skip", text: "Added skip/dismiss option" },
  { id: "tested", text: "Tested with fresh account" },
];

const ONBOARDING_PROMPT = `Add onboarding for new users:

When a user first signs up:
1. Show a welcome message with their name
2. Take them to [main feature]
3. Pre-fill with [example data] so they can try immediately
4. After they [complete action], show a success message
5. Then show quick tips for what to do next

Mark onboarding as complete so they don't see it again.`;

export function Day17Onboarding({ onComplete }: Day17OnboardingProps) {
  const [selectedPattern, setSelectedPattern] = useState<string>("");
  const [firstSuccess, setFirstSuccess] = useState("");
  const [checklistDone, setChecklistDone] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleChecklist = (id: string) => {
    const newDone = new Set(checklistDone);
    if (newDone.has(id)) {
      newDone.delete(id);
    } else {
      newDone.add(id);
    }
    setChecklistDone(newDone);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(ONBOARDING_PROMPT);
    toast({
      title: "Copied!",
      description: "Onboarding prompt copied to clipboard",
    });
  };

  const canComplete = selectedPattern && firstSuccess.length > 10 && checklistDone.size >= 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">User Onboarding</h3>
            <p className="text-slate-600 mt-1">Help new users understand and love your app in 2 minutes.</p>
          </div>
        </div>
      </Card>

      {/* 2-Minute Rule */}
      <Card className="p-4 border-2 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">The 2-Minute Rule</p>
            <p className="text-sm text-amber-700 mt-1">
              Within 2 minutes of signing up, users should understand what your app does,
              complete ONE action, and see value from it.
            </p>
          </div>
        </div>
      </Card>

      {/* First Success */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">What's Their First Success?</h4>
        <p className="text-sm text-slate-600 mb-4">
          What ONE action should new users complete to "get" your app?
        </p>
        <Textarea
          placeholder="e.g., 'Generate their first AI post' or 'Save their first item' or 'See their first analysis result'"
          value={firstSuccess}
          onChange={(e) => setFirstSuccess(e.target.value)}
          className="min-h-[80px]"
        />
      </Card>

      {/* Onboarding Pattern */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Choose Onboarding Pattern</h4>
        <div className="space-y-3">
          {ONBOARDING_PATTERNS.map((pattern) => (
            <div
              key={pattern.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPattern === pattern.id
                  ? "border-amber-500 bg-amber-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => setSelectedPattern(pattern.id)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={selectedPattern === pattern.id}
                  onChange={() => setSelectedPattern(pattern.id)}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-medium text-slate-900">{pattern.name}</span>
                  <p className="text-xs text-slate-600 mt-0.5">{pattern.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Prompt Template */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">Onboarding Prompt</h4>
        <p className="text-sm text-slate-600 mb-4">Copy and customize for your app:</p>
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded border border-slate-200">
          {ONBOARDING_PROMPT}
        </pre>
        <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={copyPrompt}>
          <Copy className="w-4 h-4" />
          Copy Prompt
        </Button>
      </Card>

      {/* Checklist */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Implementation Checklist</h4>
        <div className="space-y-3">
          {CHECKLIST.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleChecklist(item.id)}
            >
              <Checkbox
                checked={checklistDone.has(item.id)}
                onCheckedChange={() => toggleChecklist(item.id)}
              />
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          Onboarding Complete - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
