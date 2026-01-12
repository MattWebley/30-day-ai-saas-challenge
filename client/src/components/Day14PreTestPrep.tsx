import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Check, AlertCircle } from "lucide-react";

interface Day14PreTestPrepProps {
  userIdea: string;
  appName: string;
  onComplete: (data: {
    readinessRating: string;
    whatWorks: string;
    knownIssues: string;
    excitedToTest: string;
  }) => void;
}

const READINESS_OPTIONS = [
  { id: "ready", label: "Ready to test!", description: "Core features work, UI is decent" },
  { id: "almost", label: "Almost there", description: "A few things to fix, but close" },
  { id: "needs-work", label: "Needs more work", description: "Should go back to Day 12" },
  { id: "unsure", label: "Not sure", description: "Need to look at it more closely" },
];

export function Day14PreTestPrep({ userIdea, appName, onComplete }: Day14PreTestPrepProps) {
  const [step, setStep] = useState<"assess" | "document" | "ready">("assess");
  const [readinessRating, setReadinessRating] = useState("");
  const [whatWorks, setWhatWorks] = useState("");
  const [knownIssues, setKnownIssues] = useState("");
  const [excitedToTest, setExcitedToTest] = useState("");

  const canComplete = readinessRating && whatWorks.length >= 20 && excitedToTest.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Pre-Test Prep</h3>
        <p className="text-slate-600 mt-1">
          Final check before testing phase. Document what works and what doesn't.
        </p>
      </Card>

      {/* Assessment */}
      {step === "assess" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">
              How would you rate {appName || "your app"} right now?
            </h4>
            <div className="space-y-3">
              {READINESS_OPTIONS.map((option) => {
                const isSelected = readinessRating === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setReadinessRating(option.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "bg-primary border-primary" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{option.label}</p>
                        <p className="text-sm text-slate-500">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {readinessRating === "needs-work" && (
            <Card className="p-4 border-2 border-amber-200 bg-amber-50">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-medium text-amber-900">No shame in going back!</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Use the PAUSE button and return to Day 12. Take more time to build.
                    Testing an unfinished app is frustrating for everyone.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {readinessRating && readinessRating !== "needs-work" && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("document")}
            >
              Document Status <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Documentation */}
      {step === "document" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-3 text-slate-900">What WORKS right now?</h4>
            <p className="text-sm text-slate-600 mb-3">
              List the features and functionality that are ready:
            </p>
            <Textarea
              placeholder="Working features:
- Users can log in and see their data
- The AI feature generates...
- Data saves correctly
- The main page shows..."
              value={whatWorks}
              onChange={(e) => setWhatWorks(e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Known Issues (optional)</h4>
            <p className="text-sm text-slate-600 mb-3">
              Any bugs or incomplete features you already know about:
            </p>
            <Textarea
              placeholder="Known issues:
- The button on page X doesn't...
- Haven't finished the...
- Mobile view needs work..."
              value={knownIssues}
              onChange={(e) => setKnownIssues(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-3 text-slate-900">What are you most excited for users to try?</h4>
            <Textarea
              placeholder="I'm most excited for people to try...
The thing I think will impress them is..."
              value={excitedToTest}
              onChange={(e) => setExcitedToTest(e.target.value)}
              className="min-h-[80px]"
            />
          </Card>

          {canComplete ? (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                readinessRating,
                whatWorks,
                knownIssues,
                excitedToTest
              })}
            >
              Complete - Ready for Testing! <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <p className="text-sm text-slate-500 text-center">
              Fill in what works and what excites you to continue
            </p>
          )}
        </>
      )}
    </div>
  );
}
