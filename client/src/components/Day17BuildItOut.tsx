import { useState, useEffect } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Zap,
  Bug,
  Paintbrush,
  Sparkles,
  AlertCircle,
  Wrench,
  HelpCircle
} from "lucide-react";

interface Day17BuildItOutProps {
  onComplete: (data: {
    focusArea: string;
    sessionMinutes: number;
    accomplishments: string;
    checklistProgress: string[];
  }) => void;
}

const FOCUS_OPTIONS = [
  { id: "feature", label: "Core Features", icon: Zap, color: "bg-blue-100 text-blue-600" },
  { id: "bugs", label: "Bug Fixes", icon: Bug, color: "bg-amber-100 text-amber-600" },
  { id: "polish", label: "UI Polish", icon: Paintbrush, color: "bg-purple-100 text-purple-600" },
  { id: "whatever", label: "New Functionality", icon: Sparkles, color: "bg-green-100 text-green-600" },
];

const BUILD_CHECKLIST = [
  "Core features from PRD working",
  "AI feature(s) integrated",
  "User authentication working",
  "Email setup complete",
  "Mobile responsive",
  "Onboarding flow built",
  "Admin dashboard working",
  "No major bugs or crashes",
];

const COMMON_ISSUES = [
  {
    problem: "Button does nothing when clicked",
    solution: "Check browser console for errors. Tell Claude Code: 'When I click [button], nothing happens. Check for errors and fix.'",
  },
  {
    problem: "Data not saving",
    solution: "Ask: 'When I [action], the data should save but it doesn't persist. Debug the save function.'",
  },
  {
    problem: "Page looks broken on mobile",
    solution: "Tell Claude Code: 'Fix mobile layout at 375px width. No horizontal scrolling, readable text, tappable buttons.'",
  },
  {
    problem: "AI feature not working",
    solution: "Check if OPENAI_API_KEY is in Replit Secrets. Ask: 'Debug my AI feature - it's not returning results.'",
  },
  {
    problem: "User sees other users' data",
    solution: "Critical auth bug. Ask: 'Ensure each user only sees their own data. Filter all queries by user ID.'",
  },
];

export function Day17BuildItOut({ onComplete }: Day17BuildItOutProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"intro" | "checklist" | "focus" | "build" | "done">("intro");
  const [focusArea, setFocusArea] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [accomplishments, setAccomplishments] = useState("");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [showDebugging, setShowDebugging] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleChecked = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const sessionMinutes = Math.ceil(seconds / 60);
  const checklistProgress = Math.round((checkedItems.length / BUILD_CHECKLIST.length) * 100);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-lg">THIS IS THE PAUSE POINT</h4>
                <p className="text-amber-800 mt-1">
                  You've learned 95% of everything you need. Now it's time to BUILD.
                </p>
                <p className="text-amber-700 mt-2">
                  Stay here as long as you need - days, weeks, whatever it takes. Use the PAUSE button in the sidebar to come back tomorrow.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">The Skills You Have</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              {[
                "AI Integration",
                "External APIs",
                "User Auth",
                "Email Setup",
                "Mobile Design",
                "User Onboarding",
                "Admin Dashboard",
                "Claude Code",
              ].map((skill, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("checklist")}
          >
            Review Build Checklist <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Checklist */}
      {step === "checklist" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-slate-900">Build Checklist</h4>
              <span className="text-sm text-slate-600">{checkedItems.length}/{BUILD_CHECKLIST.length} complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
            <p className="text-slate-600 mb-4">
              Check off what's working. This helps you see what still needs attention.
            </p>
            <div className="space-y-3">
              {BUILD_CHECKLIST.map((item) => {
                const isChecked = checkedItems.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleChecked(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 hover:border-slate-300 bg-white text-left transition-colors"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={isChecked ? "text-slate-500 line-through" : "text-slate-700"}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Common Issues Section */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <button
              onClick={() => setShowDebugging(!showDebugging)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-slate-600" />
                <h4 className="font-bold text-lg text-slate-900">Common Issues & Fixes</h4>
              </div>
              <HelpCircle className={`w-5 h-5 text-slate-400 transition-transform ${showDebugging ? "rotate-180" : ""}`} />
            </button>
            {showDebugging && (
              <div className="mt-4 space-y-4">
                {COMMON_ISSUES.map((issue, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-medium text-slate-900 mb-1">{issue.problem}</p>
                    <p className="text-slate-600 text-sm">{issue.solution}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* When to Move On */}
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <h4 className="font-bold text-blue-900 mb-3">When to Move On</h4>
            <p className="text-blue-800 mb-3">Your app is ready when</p>
            <ul className="space-y-2 text-blue-700">
              <li>• Core features work without crashing</li>
              <li>• You'd show it to a stranger without apologizing</li>
              <li>• It does what you said it would do</li>
              <li>• It looks decent (not perfect - decent)</li>
            </ul>
            <p className="text-blue-800 mt-3 font-medium">
              If you're not there yet, that's fine. Keep building.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("focus")}
          >
            Start Build Session <Play className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Focus Selection */}
      {step === "focus" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-4">What are you focusing on today?</h4>
            <div className="grid grid-cols-2 gap-3">
              {FOCUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = focusArea === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setFocusArea(option.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-slate-900">{option.label}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => {
              setStep("build");
              setTimerRunning(true);
            }}
            disabled={!focusArea}
          >
            Start Timer <Play className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Build Session */}
      {step === "build" && (
        <>
          <Card className="p-8 border-2 border-slate-200 bg-white text-center">
            <p className="text-slate-600 mb-2">
              {FOCUS_OPTIONS.find((o) => o.id === focusArea)?.label}
            </p>
            <div className="text-6xl font-mono font-bold text-slate-900 mb-6">
              {formatTime(seconds)}
            </div>
            <div className="flex justify-center gap-3">
              <Button
                size="lg"
                variant={timerRunning ? "outline" : "default"}
                onClick={() => setTimerRunning(!timerRunning)}
                className="gap-2"
              >
                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {timerRunning ? "Pause" : "Resume"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setSeconds(0)}
                className="gap-2"
              >
                <RotateCcw className="w-5 h-5" /> Reset
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-4">What did you accomplish?</h4>
            <Textarea
              placeholder="e.g., Fixed the login bug, added loading spinner to save button, cleaned up the dashboard layout..."
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              className="min-h-[100px] bg-white"
            />
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-600">
              <strong>Stuck?</strong> Describe the problem clearly to Claude Code. "When I click X, Y happens instead of Z."
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => {
              setTimerRunning(false);
              setStep("done");
            }}
            disabled={accomplishments.length < 10 || seconds < 60}
          >
            End Build Session <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">Build Session Complete!</h4>
                <p className="text-green-700">
                  {sessionMinutes} minute{sessionMinutes !== 1 ? "s" : ""} of focused building.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What You Accomplished</h4>
            <p className="text-slate-700 whitespace-pre-wrap">{accomplishments}</p>
          </Card>

          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <h4 className="font-bold text-amber-900 mb-2">Not Ready to Move On?</h4>
            <p className="text-amber-800">
              Use the PAUSE button in the sidebar. Come back tomorrow for another session. Stay on Day 17 until your app is ready.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Ready to Move On?</h4>
            <p className="text-slate-700 mb-3">Your app should</p>
            <ul className="space-y-2 text-slate-600 mb-4">
              <li>• Have core features working</li>
              <li>• Handle basic errors gracefully</li>
              <li>• Be something you'd show to a real person</li>
            </ul>
            <p className="text-slate-700">
              If that's you, complete this day. If not, PAUSE and keep building.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => onComplete({
              focusArea: focusArea || "whatever",
              sessionMinutes,
              accomplishments,
              checklistProgress: checkedItems,
            })}
          >
            Complete Day 17 <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
