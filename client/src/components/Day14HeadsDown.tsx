import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Zap,
  Bug,
  Paintbrush,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface Day14HeadsDownProps {
  onComplete: (data: {
    focusArea: string;
    sessionMinutes: number;
    accomplishments: string;
  }) => void;
}

const FOCUS_OPTIONS = [
  { id: "feature", label: "New Feature", icon: Zap, color: "bg-blue-100 text-blue-600" },
  { id: "bugs", label: "Bug Fixes", icon: Bug, color: "bg-amber-100 text-amber-600" },
  { id: "polish", label: "Design & Polish", icon: Paintbrush, color: "bg-purple-100 text-purple-600" },
  { id: "whatever", label: "Whatever Calls Me", icon: Sparkles, color: "bg-green-100 text-green-600" },
];

export function Day14HeadsDown({ onComplete }: Day14HeadsDownProps) {
  const [step, setStep] = useState<"intro" | "focus" | "build" | "done">("intro");
  const [focusArea, setFocusArea] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [accomplishments, setAccomplishments] = useState("");

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

  const sessionMinutes = Math.ceil(seconds / 60);

  return (
    <div className="space-y-6">
      {/* Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-lg">THIS IS THE PAUSE POINT</h4>
                <p className="text-amber-800 mt-1">
                  Build Mode isn't a one-day thing. This is where you STAY until your app is ready.
                </p>
                <p className="text-amber-700 text-sm mt-2">
                  Some people spend one day here. Some spend two weeks. Both are fine.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-4">What You Should Have By Now</h4>
            <div className="space-y-2">
              {[
                "Core features from your PRD",
                "AI-powered functionality",
                "User authentication",
                "Email setup",
                "Any APIs you need",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-600 mt-4">
              Now it's about making it all WORK TOGETHER. Smoothly. Reliably.
            </p>
          </Card>

          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <p className="text-blue-800">
              <strong>Use the PAUSE button</strong> in the sidebar to stay on this day. Come back tomorrow and do another session. And another. Until your app is ready.
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
            <h4 className="font-bold text-lg text-slate-900 mb-4">What's calling you today?</h4>
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
            <p className="text-slate-600 text-sm">
              <strong>Tip:</strong> If you get stuck, ask Claude Code for help. If you break something, that's fine - fix it. The goal is progress, not perfection.
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
                  {sessionMinutes} minute{sessionMinutes !== 1 ? "s" : ""} of focused building. Nice work.
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
            <p className="text-amber-800 text-sm">
              Use the <strong>PAUSE button</strong> in the sidebar to stay on Day 14. Come back tomorrow for another build session. Only complete this day when your app is ready for testing.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">Ready to Move On?</h4>
            <p className="text-slate-700 mb-4">Your app should:</p>
            <ul className="space-y-2 text-slate-600 mb-4">
              <li>• Have core features working</li>
              <li>• Handle basic errors gracefully</li>
              <li>• Look decent (not perfect, decent)</li>
              <li>• Be something you'd show to a real person</li>
            </ul>
            <p className="text-slate-700">
              If you hit that bar, complete this day. If not, use PAUSE and keep building.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => onComplete({
              focusArea: focusArea || "whatever",
              sessionMinutes,
              accomplishments,
            })}
          >
            Complete Day 14 <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
