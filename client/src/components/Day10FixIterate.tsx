import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Check,
  Zap,
  Wrench,
  Bug,
  Palette,
  Sparkles,
  Play,
  Pause,
  Clock,
  Trophy,
  Coffee
} from "lucide-react";

interface Day10FixIterateProps {
  topPriority?: string;
  onComplete: (data: {
    focusArea: string;
    duration: number;
    actualTime: number;
    whatYouWorkedOn: string;
    whatYouShipped: string;
    howItFelt: string;
  }) => void;
}

const FOCUS_OPTIONS = [
  { id: "feature", label: "New Feature", icon: Sparkles, description: "Add something new to your app", color: "bg-purple-100 text-purple-600" },
  { id: "bug", label: "Bug Fixes", icon: Bug, description: "Squash some bugs", color: "bg-red-100 text-red-600" },
  { id: "design", label: "Design & Polish", icon: Palette, description: "Make it look better", color: "bg-blue-100 text-blue-600" },
  { id: "vibe", label: "Whatever Calls Me", icon: Zap, description: "Go with the flow", color: "bg-amber-100 text-amber-600" },
];

const DURATION_OPTIONS = [
  { minutes: 30, label: "30 min", description: "Quick session" },
  { minutes: 45, label: "45 min", description: "Solid focus" },
  { minutes: 60, label: "60 min", description: "Deep work" },
];

export function Day10FixIterate({ topPriority, onComplete }: Day10FixIterateProps) {
  const [step, setStep] = useState<"setup" | "focus" | "duration" | "building" | "reflect">("setup");
  const [focusArea, setFocusArea] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [actualTimeSpent, setActualTimeSpent] = useState(0);
  const [whatYouWorkedOn, setWhatYouWorkedOn] = useState("");
  const [whatYouShipped, setWhatYouShipped] = useState("");
  const [howItFelt, setHowItFelt] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Timer logic
  useEffect(() => {
    if (step === "building" && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
        setActualTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isPaused, timeRemaining]);

  const startBuildMode = () => {
    setTimeRemaining(duration * 60);
    startTimeRef.current = Date.now();
    setStep("building");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const endSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("reflect");
  };

  const canComplete = whatYouWorkedOn.length >= 10 && whatYouShipped.length >= 5;

  const selectedFocus = FOCUS_OPTIONS.find(f => f.id === focusArea);

  return (
    <div className="space-y-6">
      {/* Setup */}
      {step === "setup" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h3 className="text-2xl font-extrabold text-slate-900">Build Mode</h3>
            <p className="text-slate-600 mt-2">
              Time to get in the zone. You'll set a timer, pick a focus, and just BUILD.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
            <h4 className="font-bold text-lg text-slate-900 mb-4">Quick Setup Checklist</h4>
            <div className="space-y-3">
              {[
                { icon: "🖥️", text: "Your app is open in Replit" },
                { icon: "🤖", text: "Claude Code is ready" },
                { icon: "🎧", text: "Distractions minimized (phone away, notifications off)" },
                { icon: "☕", text: "Drink nearby (optional but recommended)" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800">
              <strong>The goal isn't perfection.</strong> It's immersion. Spend real time improving your app.
              Fix things, add things, tweak things. Get lost in the work.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("focus")}
          >
            I'm Ready <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Pick Focus */}
      {step === "focus" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h3 className="text-xl font-bold text-slate-900 mb-2">What's calling you today?</h3>
            <p className="text-slate-600">Pick a focus area, or just go with the flow.</p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {FOCUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = focusArea === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setFocusArea(option.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-slate-400 bg-slate-50 ring-2 ring-slate-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${option.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900">{option.label}</h4>
                  <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                  {isSelected && (
                    <div className="mt-2">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {focusArea && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("duration")}
            >
              Set Duration <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Pick Duration */}
      {step === "duration" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h3 className="text-xl font-bold text-slate-900 mb-2">How long can you focus?</h3>
            <p className="text-slate-600">Pick a time. You can always extend or end early.</p>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {DURATION_OPTIONS.map((option) => {
              const isSelected = duration === option.minutes;
              return (
                <button
                  key={option.minutes}
                  onClick={() => setDuration(option.minutes)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    isSelected
                      ? 'border-slate-400 bg-slate-900 text-white'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="text-2xl font-black">{option.label}</p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <Card className="p-4 border-2 border-blue-200 bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>Pro tip:</strong> Start with 30 minutes if you're new to focused building.
              It's better to finish strong than burn out.
            </p>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800">
              <strong>NEED MORE THAN ONE DAY?</strong> That's totally fine! Build Mode isn't a one-day thing.
              Come back tomorrow and do another session. Use the PAUSE button in the sidebar to stay on this day until you're ready to move on.
            </p>
          </Card>

          {duration > 0 && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={startBuildMode}
            >
              <Play className="w-5 h-5" /> Enter Build Mode
            </Button>
          )}
        </>
      )}

      {/* Building Mode */}
      {step === "building" && (
        <>
          <Card className={`p-8 border-4 ${isPaused ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {isPaused ? (
                  <Coffee className="w-6 h-6 text-amber-600" />
                ) : (
                  <Wrench className="w-6 h-6 text-green-600 animate-pulse" />
                )}
                <span className={`text-sm font-bold uppercase tracking-wider ${isPaused ? 'text-amber-600' : 'text-green-600'}`}>
                  {isPaused ? 'Paused' : 'Building'}
                </span>
              </div>

              <div className={`text-6xl font-black my-4 font-mono ${isPaused ? 'text-amber-700' : 'text-green-700'}`}>
                {formatTime(timeRemaining)}
              </div>

              {selectedFocus && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-slate-600">Focus:</span>
                  <span className="font-bold text-slate-900">{selectedFocus.label}</span>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={togglePause}
                  className="gap-2"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  onClick={endSession}
                  className="gap-2"
                >
                  End Session
                </Button>
              </div>
            </div>
          </Card>

          {!isPaused && (
            <Card className="p-4 border-2 border-slate-200 bg-slate-50">
              <p className="text-center text-slate-600 text-sm">
                <strong>You're in the zone.</strong> Build something. Fix something. Make it better.
                <br />Come back when you're done or the timer ends.
              </p>
            </Card>
          )}

          {isPaused && (
            <Card className="p-4 border-2 border-amber-200 bg-amber-50">
              <p className="text-center text-amber-700 text-sm">
                Take a breather. When you're ready, hit Resume and keep building.
              </p>
            </Card>
          )}

          {timeRemaining === 0 && (
            <Card className="p-6 border-2 border-green-300 bg-green-100">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h4 className="font-bold text-lg text-green-900">Time's Up!</h4>
                <p className="text-green-700 text-sm mb-4">Amazing work! Now let's capture what you did.</p>
                <Button onClick={() => setStep("reflect")} className="gap-2">
                  Log Your Session <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Reflection */}
      {step === "reflect" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">Build Session Complete!</h3>
                <p className="text-green-700 text-sm">
                  You spent {Math.round(actualTimeSpent / 60)} minutes in build mode
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What did you work on?</h4>
            <p className="text-sm text-slate-600 mb-3">List what you touched during this session:</p>
            <Textarea
              placeholder="I worked on...
- Added a new button for X
- Fixed the bug where Y
- Improved the styling of Z"
              value={whatYouWorkedOn}
              onChange={(e) => setWhatYouWorkedOn(e.target.value)}
              className="min-h-[100px] bg-white"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">What did you SHIP?</h4>
            <p className="text-sm text-slate-600 mb-3">What's actually working now that wasn't before?</p>
            <Textarea
              placeholder="Now my app can...
- Save user data correctly
- Show a nice error message
- Look good on mobile"
              value={whatYouShipped}
              onChange={(e) => setWhatYouShipped(e.target.value)}
              className="min-h-[100px] bg-white"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-3">How did it feel?</h4>
            <p className="text-sm text-slate-600 mb-3">Were you in the zone? Frustrated? Excited?</p>
            <div className="flex gap-2 mb-3">
              {["🔥 In the zone", "😤 Bit frustrating", "🎉 Great progress", "🤔 Learning a lot"].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setHowItFelt(mood)}
                  className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                    howItFelt === mood
                      ? 'border-slate-400 bg-slate-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Any other thoughts about this session..."
              value={howItFelt.startsWith("🔥") || howItFelt.startsWith("😤") || howItFelt.startsWith("🎉") || howItFelt.startsWith("🤔") ? "" : howItFelt}
              onChange={(e) => setHowItFelt(e.target.value)}
              className="min-h-[60px] bg-white"
            />
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-700">
              <strong>Remember:</strong> Every build session makes your app better.
              This is what building looks like - not giant leaps, but consistent progress.
            </p>
          </Card>

          {canComplete ? (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                focusArea,
                duration,
                actualTime: actualTimeSpent,
                whatYouWorkedOn,
                whatYouShipped,
                howItFelt,
              })}
            >
              Complete Build Mode <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <p className="text-sm text-slate-500 text-center">
              Fill in what you worked on and shipped to continue
            </p>
          )}

          <Card className="p-4 border-2 border-amber-300 bg-amber-50 mt-4">
            <div className="text-center">
              <p className="text-amber-900 font-bold text-lg mb-2">Not ready to move on?</p>
              <p className="text-amber-800 text-sm mb-3">
                Build Mode can take multiple days. Use the PAUSE button in the sidebar to stay here and do more build sessions.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
