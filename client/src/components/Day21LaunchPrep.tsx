import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Rocket,
  Copy,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Trophy,
  PartyPopper,
  Sparkles,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day21LaunchPrepProps {
  dayId: number;
  onComplete: () => void;
}

const TEST_CATEGORIES = [
  {
    id: "firstImpression",
    label: "First Impression",
    items: [
      { id: "fi1", text: "Landing page loads quickly", priority: "high" },
      { id: "fi2", text: "I understand what this app does in 5 seconds", priority: "high" },
      { id: "fi3", text: "Signup button is obvious", priority: "high" },
    ],
  },
  {
    id: "signupFlow",
    label: "Signup Flow",
    items: [
      { id: "sf1", text: "Can sign up with new email", priority: "high" },
      { id: "sf2", text: "Welcome email arrives", priority: "medium" },
      { id: "sf3", text: "Automatically logged in after signup", priority: "high" },
      { id: "sf4", text: "Know what to do next", priority: "medium" },
    ],
  },
  {
    id: "coreFeature",
    label: "Core Feature",
    items: [
      { id: "cf1", text: "Can find the main feature easily", priority: "high" },
      { id: "cf2", text: "Core feature works end-to-end", priority: "high" },
      { id: "cf3", text: "Loading states show while processing", priority: "medium" },
      { id: "cf4", text: "Results display correctly", priority: "high" },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    items: [
      { id: "py1", text: "Can find upgrade/pricing option", priority: "high" },
      { id: "py2", text: "Pricing is clear", priority: "high" },
      { id: "py3", text: "Checkout works (test card 4242...)", priority: "high" },
      { id: "py4", text: "Account shows upgraded after payment", priority: "high" },
    ],
  },
  {
    id: "account",
    label: "Account Stuff",
    items: [
      { id: "ac1", text: "Can log out", priority: "high" },
      { id: "ac2", text: "Can log back in", priority: "high" },
      { id: "ac3", text: "Password reset works", priority: "high" },
      { id: "ac4", text: "Data persists after refresh", priority: "high" },
    ],
  },
  {
    id: "edgeCases",
    label: "Edge Cases",
    items: [
      { id: "ec1", text: "Empty input shows helpful error", priority: "medium" },
      { id: "ec2", text: "Works on mobile", priority: "high" },
      { id: "ec3", text: "Refresh doesn't break anything", priority: "medium" },
      { id: "ec4", text: "404 page exists for bad URLs", priority: "low" },
    ],
  },
];

const WEEK_3_WINS = [
  { emoji: "🔗", text: "Understood APIs and their power" },
  { emoji: "🧠", text: "Added AI features that wow users" },
  { emoji: "💰", text: "Set up payment processing" },
  { emoji: "📧", text: "Emails that hit inboxes" },
  { emoji: "🔐", text: "User authentication and security" },
  { emoji: "📊", text: "Admin dashboard for control" },
  { emoji: "🧪", text: "Tested everything thoroughly" },
];

export function Day21LaunchPrep({ dayId, onComplete }: Day21LaunchPrepProps) {
  const [step, setStep] = useState<"test" | "fix" | "celebrate">("test");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());
  const [celebrationChecked, setCelebrationChecked] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const toggleItem = (itemId: string, passed: boolean) => {
    const newChecked = new Set(checkedItems);
    const newFailed = new Set(failedItems);

    if (passed) {
      newChecked.add(itemId);
      newFailed.delete(itemId);
    } else {
      newFailed.add(itemId);
      newChecked.delete(itemId);
    }

    setCheckedItems(newChecked);
    setFailedItems(newFailed);
  };

  const totalItems = TEST_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const totalReviewed = checkedItems.size + failedItems.size;
  const passedCount = checkedItems.size;
  const failedCount = failedItems.size;

  const highPriorityFailed = TEST_CATEGORIES.flatMap(cat =>
    cat.items.filter(item => item.priority === "high" && failedItems.has(item.id))
  );

  const generateFixPrompt = () => {
    const issues = TEST_CATEGORIES.flatMap(cat =>
      cat.items.filter(item => failedItems.has(item.id)).map(item => ({
        category: cat.label,
        text: item.text,
        priority: item.priority,
      }))
    );

    if (issues.length === 0) return "All tests passed! No fixes needed.";

    return `Fix these issues in my app before launch:

${issues.map((issue, i) => `${i + 1}. [${issue.priority.toUpperCase()}] ${issue.category}: ${issue.text}`).join("\n")}

For each issue:
1. Find where the problem is
2. Fix it
3. Test that it works

Start with HIGH priority issues first.`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generateFixPrompt());
    toast({
      title: "Fix Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const getReadinessScore = () => {
    if (totalReviewed === 0) return 0;
    const score = (passedCount / totalItems) * 100;
    return Math.round(score);
  };

  const getReadinessLabel = () => {
    const score = getReadinessScore();
    if (score >= 90) return { label: "READY TO LAUNCH! 🚀", color: "green" };
    if (score >= 70) return { label: "Almost Ready", color: "yellow" };
    if (score >= 50) return { label: "Needs Work", color: "orange" };
    return { label: "Not Ready", color: "red" };
  };

  const allReviewed = totalReviewed === totalItems;
  const readyToLaunch = getReadinessScore() >= 70 && highPriorityFailed.length === 0;

  const toggleCelebration = (idx: number) => {
    const newChecked = new Set(celebrationChecked);
    if (newChecked.has(idx)) {
      newChecked.delete(idx);
    } else {
      newChecked.add(idx);
    }
    setCelebrationChecked(newChecked);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {step === "celebrate" ? "WEEK 3 COMPLETE! 🎉" : "Test EVERYTHING"}
            </h3>
            <p className="text-slate-600 mt-1">
              {step === "celebrate"
                ? "Look at all the superpowers you've added!"
                : "Go through as a new user. Find the breaks. Fix them."}
            </p>
          </div>
        </div>
      </Card>

      {step !== "celebrate" && (
        <>
          {/* Readiness Score */}
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">Launch Readiness</span>
              <span className={`font-bold ${
                getReadinessLabel().color === "green" ? "text-green-600" :
                getReadinessLabel().color === "yellow" ? "text-yellow-600" :
                getReadinessLabel().color === "orange" ? "text-orange-600" :
                "text-red-600"
              }`}>
                {getReadinessScore()}% - {getReadinessLabel().label}
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  getReadinessLabel().color === "green" ? "bg-green-500" :
                  getReadinessLabel().color === "yellow" ? "bg-yellow-500" :
                  getReadinessLabel().color === "orange" ? "bg-orange-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${getReadinessScore()}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-green-600 font-medium">✓ {passedCount} passed</span>
              <span className="text-red-600 font-medium">✗ {failedCount} failed</span>
              <span className="text-slate-400">{totalItems - totalReviewed} remaining</span>
            </div>
          </Card>

          {/* High Priority Failures Warning */}
          {highPriorityFailed.length > 0 && (
            <Card className="p-4 border-2 border-red-300 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-bold text-red-800">
                    {highPriorityFailed.length} HIGH priority issue{highPriorityFailed.length > 1 ? "s" : ""} must be fixed
                  </div>
                  <div className="text-sm text-red-700 mt-1">
                    These will block your launch. Fix them first!
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Test Categories */}
      {step === "test" && (
        <>
          {TEST_CATEGORIES.map((category) => (
            <Card key={category.id} className="p-6 border-2 border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900 mb-3">{category.label}</h4>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const isPassed = checkedItems.has(item.id);
                  const isFailed = failedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        isPassed ? "border-green-300 bg-green-50" :
                        isFailed ? "border-red-300 bg-red-50" :
                        "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.priority === "high" && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">HIGH</span>
                        )}
                        <span className={`${
                          isPassed ? "text-green-700" : isFailed ? "text-red-700" : "text-slate-700"
                        }`}>
                          {item.text}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleItem(item.id, true)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isPassed ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-green-100"
                          }`}
                        >
                          ✓ Pass
                        </button>
                        <button
                          onClick={() => toggleItem(item.id, false)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isFailed ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-red-100"
                          }`}
                        >
                          ✗ Fail
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}

          {allReviewed && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setStep(failedCount > 0 ? "fix" : "celebrate")}
            >
              {failedCount > 0 ? "See Fix Prompt" : "Continue to Celebration"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </>
      )}

      {/* Fix Prompt */}
      {step === "fix" && (
        <>
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
                {generateFixPrompt()}
              </pre>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("test")}>
              Back to Tests
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={highPriorityFailed.length > 0}
              onClick={() => setStep("celebrate")}
            >
              {highPriorityFailed.length > 0 ? "Fix HIGH Priority First" : "Continue to Celebration"}
            </Button>
          </div>
        </>
      )}

      {/* Celebration */}
      {step === "celebrate" && (
        <>
          <Card className="p-6 border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <h4 className="font-bold text-slate-900">Your Week 3 Superpowers</h4>
            </div>

            <div className="space-y-2">
              {WEEK_3_WINS.map((win, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCelebration(idx)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    celebrationChecked.has(idx)
                      ? "border-yellow-400 bg-yellow-100"
                      : "border-slate-200 bg-white hover:border-yellow-300"
                  }`}
                >
                  <span className="text-xl">{win.emoji}</span>
                  <span className={`font-medium ${celebrationChecked.has(idx) ? "text-yellow-800" : "text-slate-700"}`}>
                    {win.text}
                  </span>
                  {celebrationChecked.has(idx) && <CheckCircle2 className="w-5 h-5 text-yellow-600 ml-auto" />}
                </div>
              ))}
            </div>
          </Card>

          {celebrationChecked.size >= 5 && (
            <Card className="p-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <PartyPopper className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-green-800 text-lg">You Have SUPERPOWERS Now!</h4>
                  <p className="text-green-700 text-sm">AI, payments, email, auth, admin - all working. Next week: polish and LAUNCH!</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {celebrationChecked.size >= 5 ? "Ready for Week 4?" : "Acknowledge your wins!"}
                </p>
                <p className="text-sm text-slate-500">Check at least 5 to continue</p>
              </div>
              <Button
                size="lg"
                disabled={celebrationChecked.size < 5}
                onClick={onComplete}
              >
                Complete Day 21
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
