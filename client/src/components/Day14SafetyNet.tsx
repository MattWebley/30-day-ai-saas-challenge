import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  Copy,
  CheckCircle2,
  GitBranch,
  Save,
  History,
  ArrowRight,
  PartyPopper,
  Rocket,
  Trophy,
  Star,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day14SafetyNetProps {
  dayId: number;
  onComplete: () => void;
}

const GIT_STEPS = [
  {
    id: "understand",
    title: "Understand What Git Is",
    description: "Git is like 'save points' in a video game. If you mess up, you can go back!",
    icon: History,
    tip: "Replit uses Git automatically. Every time you click 'Deploy', it saves your code.",
  },
  {
    id: "find-history",
    title: "Find Your Version History",
    description: "In Replit: Click the 'Version Control' icon (looks like a branch) in the left sidebar",
    icon: GitBranch,
    tip: "You'll see a list of all changes made to your project.",
  },
  {
    id: "make-save",
    title: "Make a Manual Save Point",
    description: "Click 'Commit All' and write what you changed (e.g., 'Added login feature')",
    icon: Save,
    tip: "Good commit messages help you find old versions later!",
  },
  {
    id: "restore",
    title: "Know How to Restore",
    description: "If something breaks, you can click on any old version and restore it",
    icon: Shield,
    tip: "This is your safety net. No more losing work to bugs!",
  },
];

const WEEK_2_WINS = [
  "Built your first working app with AI",
  "Created your brand identity (colors, name, tagline)",
  "Built the MONEY feature people will pay for",
  "Learned to fix bugs in 5 minutes",
  "Made your design look professional",
  "Added a sticky second feature",
  "Set up your safety net (version control)",
];

const WEEK_3_PREVIEW = [
  { emoji: "🔗", label: "Connect to APIs", description: "Pull in data from anywhere" },
  { emoji: "🧠", label: "Add AI Smarts", description: "Make your app intelligent" },
  { emoji: "💰", label: "Accept Payments", description: "Start making money" },
  { emoji: "📧", label: "Send Emails", description: "Keep users engaged" },
  { emoji: "🔐", label: "User Authentication", description: "Secure accounts" },
  { emoji: "📊", label: "Admin Dashboard", description: "See what's happening" },
  { emoji: "📱", label: "Go Mobile", description: "Work on any device" },
];

export function Day14SafetyNet({ dayId, onComplete }: Day14SafetyNetProps) {
  const [step, setStep] = useState<"learn" | "celebrate">("learn");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [celebrationChecks, setCelebrationChecks] = useState<Set<number>>(new Set());
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

  const toggleCelebration = (idx: number) => {
    const newChecks = new Set(celebrationChecks);
    if (newChecks.has(idx)) {
      newChecks.delete(idx);
    } else {
      newChecks.add(idx);
    }
    setCelebrationChecks(newChecks);
  };

  const allStepsComplete = GIT_STEPS.every((s) => completedSteps.has(s.id));
  const allCelebrationChecked = celebrationChecks.size >= 4; // At least 4 wins acknowledged

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
            {step === "learn" ? (
              <Shield className="w-7 h-7 text-white" />
            ) : (
              <Trophy className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {step === "learn" ? "Your SAFETY NET" : "WEEK 2 COMPLETE! 🎉"}
            </h3>
            <p className="text-slate-600 mt-1">
              {step === "learn"
                ? "Never lose your work again. Set up version control in 3 minutes."
                : "Look at everything you've accomplished!"}
            </p>
          </div>
        </div>
      </Card>

      {step === "learn" && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {["Learn Git", "Celebrate Week 2"].map((label, idx) => {
              const isComplete = idx === 0 && allStepsComplete;
              const isCurrent = (idx === 0 && !allStepsComplete) || (idx === 1 && allStepsComplete);

              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                    isComplete ? "bg-emerald-100 text-emerald-700" :
                    isCurrent ? "bg-emerald-500 text-white" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                    {label}
                  </div>
                  {idx < 1 && <div className="w-4 h-0.5 bg-slate-200" />}
                </div>
              );
            })}
          </div>

          {/* Git Steps */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-2">Set Up Your Safety Net</h4>
            <p className="text-sm text-slate-500 mb-4">
              Check each step as you understand it
            </p>

            <div className="space-y-3">
              {GIT_STEPS.map((gitStep) => {
                const Icon = gitStep.icon;
                return (
                  <div
                    key={gitStep.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      completedSteps.has(gitStep.id)
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={completedSteps.has(gitStep.id)}
                        onCheckedChange={() => toggleStep(gitStep.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-5 h-5 ${
                            completedSteps.has(gitStep.id) ? "text-emerald-600" : "text-slate-500"
                          }`} />
                          <h5 className={`font-bold ${
                            completedSteps.has(gitStep.id) ? "text-emerald-700" : "text-slate-900"
                          }`}>
                            {gitStep.title}
                          </h5>
                        </div>
                        <p className={`text-sm ${
                          completedSteps.has(gitStep.id) ? "text-emerald-600" : "text-slate-600"
                        }`}>
                          {gitStep.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 italic">
                          💡 {gitStep.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {allStepsComplete && (
              <Button
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600"
                size="lg"
                onClick={() => setStep("celebrate")}
              >
                Continue to Celebration <PartyPopper className="w-4 h-4 ml-2" />
              </Button>
            )}
          </Card>

          {/* Tips */}
          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <h4 className="font-bold text-amber-900 mb-3">Why This Matters</h4>
            <ul className="space-y-2 text-sm text-amber-900">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>No more lost work.</strong> Every change is saved.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Experiment freely.</strong> You can always go back.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Work with confidence.</strong> Break things, fix things, learn things.</span>
              </li>
            </ul>
          </Card>
        </>
      )}

      {step === "celebrate" && (
        <>
          {/* Week 2 Wins */}
          <Card className="p-6 border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
              <h4 className="font-bold text-slate-900">Your Week 2 Wins</h4>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Check each thing you accomplished this week:
            </p>

            <div className="space-y-2">
              {WEEK_2_WINS.map((win, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCelebration(idx)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    celebrationChecks.has(idx)
                      ? "border-yellow-400 bg-yellow-100"
                      : "border-slate-200 bg-white hover:border-yellow-300"
                  }`}
                >
                  <Checkbox checked={celebrationChecks.has(idx)} />
                  <span className={`font-medium ${
                    celebrationChecks.has(idx) ? "text-yellow-800" : "text-slate-700"
                  }`}>
                    {win}
                  </span>
                  {celebrationChecks.has(idx) && (
                    <CheckCircle2 className="w-5 h-5 text-yellow-600 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Week 3 Preview */}
          <Card className="p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-6 h-6 text-purple-600" />
              <h4 className="font-bold text-slate-900">Week 3 Preview: SUPERPOWERS</h4>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Next week, you'll unlock these abilities:
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {WEEK_3_PREVIEW.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border-2 border-purple-200"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Celebration Message */}
          {allCelebrationChecked && (
            <Card className="p-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <PartyPopper className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-800 text-lg">
                    You're a REAL Builder Now!
                  </h4>
                  <p className="text-green-700 text-sm mt-1">
                    Two weeks ago you had an idea. Now you have a working app. That's AMAZING.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Complete */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {allCelebrationChecked
                    ? "Ready for Week 3?"
                    : "Acknowledge at least 4 wins to continue"}
                </p>
                <p className="text-sm text-slate-500">
                  You've earned this celebration!
                </p>
              </div>
              <Button
                size="lg"
                disabled={!allCelebrationChecked}
                onClick={handleComplete}
                className="gap-2"
              >
                Complete Week 2 <Sparkles className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
