import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Check, Palette, Bug, Sparkles, Wrench } from "lucide-react";

interface Day13KeepBuildingProps {
  onComplete: (data: {
    focusArea: string;
    whatYouWorkedOn: string;
    whatYouImproved: string;
  }) => void;
}

const FOCUS_OPTIONS = [
  { id: "ui", label: "UI/UX Polish", icon: Palette, description: "Make it look consistent and professional" },
  { id: "bugs", label: "Bug Fixes", icon: Bug, description: "Squash remaining issues" },
  { id: "features", label: "Missing Features", icon: Sparkles, description: "Add what's still needed" },
  { id: "general", label: "General Improvements", icon: Wrench, description: "Whatever needs attention" },
];

export function Day13KeepBuilding({ onComplete }: Day13KeepBuildingProps) {
  const [step, setStep] = useState<"focus" | "work" | "reflect">("focus");
  const [focusArea, setFocusArea] = useState("");
  const [whatYouWorkedOn, setWhatYouWorkedOn] = useState("");
  const [whatYouImproved, setWhatYouImproved] = useState("");

  const canComplete = whatYouWorkedOn.length >= 10 && whatYouImproved.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Keep Building</h3>
        <p className="text-slate-600 mt-1">
          Extended build time. Focus on polishing what you've created.
        </p>
      </Card>

      {/* Focus Selection */}
      {step === "focus" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What needs the most attention?</h4>
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
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-slate-600" />
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
          </Card>

          {focusArea && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("work")}
            >
              Start Building <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Work Phase */}
      {step === "work" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="text-center">
              <h4 className="font-bold text-lg text-slate-900 mb-2">
                Focus: {FOCUS_OPTIONS.find(o => o.id === focusArea)?.label}
              </h4>
              <p className="text-slate-600">
                Open your app and get to work. Come back when you've made progress.
              </p>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-700">
              <strong>Reminder:</strong> Focus on making things consistent and professional.
              Test as you go. Fix issues as you find them.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("reflect")}
          >
            Done Building - Let's Document <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Reflection */}
      {step === "reflect" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-3 text-slate-900">What did you work on?</h4>
            <Textarea
              placeholder="I worked on...
- Fixed the styling on...
- Added...
- Changed..."
              value={whatYouWorkedOn}
              onChange={(e) => setWhatYouWorkedOn(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-3 text-slate-900">What improved?</h4>
            <Textarea
              placeholder="The app is now better because...
- The UI looks more...
- Users can now...
- It feels more..."
              value={whatYouImproved}
              onChange={(e) => setWhatYouImproved(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          {canComplete ? (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                focusArea,
                whatYouWorkedOn,
                whatYouImproved
              })}
            >
              Complete Day 13 <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <p className="text-sm text-slate-500 text-center">
              Fill in what you worked on and what improved to continue
            </p>
          )}
        </>
      )}
    </div>
  );
}
