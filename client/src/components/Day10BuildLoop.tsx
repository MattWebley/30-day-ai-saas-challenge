import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Hammer,
  Search,
  Terminal,
  RefreshCw,
  XCircle,
  Eye,
  Wrench,
} from "lucide-react";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";

interface Day10BuildLoopProps {
  onComplete: (data: { loopComplete: boolean; loopType: string; whatTheyDid: string; iterations: number }) => void;
}

export function Day10BuildLoop({ onComplete }: Day10BuildLoopProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "setup" | "choose" | "describe" | "build" | "test" | "fix" | "done"
  >("setup");
  const [replitOpen, setReplitOpen] = useState(false);
  const [claudeOpen, setClaudeOpen] = useState(false);
  const [loopType, setLoopType] = useState<"build" | "fix" | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [askedClaude, setAskedClaude] = useState(false);
  const [iterations, setIterations] = useState(1);
  const [whatTheyDid, setWhatTheyDid] = useState("");

  const setupComplete = replitOpen && claudeOpen;

  const handleTestResult = (worked: boolean) => {
    if (worked) {
      // It worked! Go to completion
      setWhatTheyDid(taskDescription);
      setStep("done");
    } else {
      // Didn't work - go to fix step
      setStep("fix");
    }
  };

  const handleFixDone = () => {
    // After fixing, go back to test and increment iteration count
    setIterations(prev => prev + 1);
    setStep("test");
  };

  const handleDoAnotherLoop = () => {
    // Reset for another loop
    setLoopType(null);
    setTaskDescription("");
    setAskedClaude(false);
    setIterations(1);
    setWhatTheyDid("");
    setStep("choose");
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Claude Code Guide Reminder */}
      <Link href="/claude-code">
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Open the Claude Code Guide</p>
              <p className={ds.muted}>Use the prompts there to start your session.</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Loop Progress Indicator - shows after setup */}
      {step !== "setup" && step !== "choose" && step !== "describe" && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${step === "build" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}>
            <Hammer className="w-4 h-4" />
            <span className="text-sm font-medium">Build</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${step === "test" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}>
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Test</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${step === "fix" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}>
            <Wrench className="w-4 h-4" />
            <span className="text-sm font-medium">Fix</span>
          </div>
          {iterations > 1 && (
            <>
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">x{iterations}</span>
            </>
          )}
        </div>
      )}

      {/* Step 1: Setup */}
      {step === "setup" && (
        <>
          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-4"}>Step 1: Get Ready</h3>

            <div className="space-y-4">
              <p className={ds.body}>
                Before we practice the loop, make sure you're set up:
              </p>

              <div
                className={replitOpen ? ds.optionSelected : ds.optionDefault}
                onClick={() => setReplitOpen(!replitOpen)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={replitOpen} onCheckedChange={() => setReplitOpen(!replitOpen)} />
                  <span className={ds.body}>I'm logged into Replit with my project open</span>
                </div>
              </div>

              <div
                className={claudeOpen ? ds.optionSelected : ds.optionDefault}
                onClick={() => setClaudeOpen(!claudeOpen)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={claudeOpen} onCheckedChange={() => setClaudeOpen(!claudeOpen)} />
                  <span className={ds.body}>I have Claude Code open and ready</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep("choose")} disabled={!setupComplete} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Choose Path */}
      {step === "choose" && (
        <>
          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-4"}>Step 2: What Are You Working On?</h3>

            <div className="space-y-4">
              <p className={ds.body}>
                Pick your starting point. Either way, you'll go through the same Build-Test-Fix loop.
              </p>

              <div
                className={loopType === "build" ? ds.optionSelected : ds.optionDefault}
                onClick={() => setLoopType("build")}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <Hammer className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className={ds.body + " font-bold"}>Build something new</p>
                    <p className={ds.muted}>Add a feature, change something, make an improvement</p>
                  </div>
                </div>
              </div>

              <div
                className={loopType === "fix" ? ds.optionSelected : ds.optionDefault}
                onClick={() => setLoopType("fix")}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className={ds.body + " font-bold"}>Fix something broken</p>
                    <p className={ds.muted}>Found a bug? Something not working right? Let's fix it</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("setup")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("describe")}
              disabled={!loopType}
              className="gap-2"
            >
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Describe the task */}
      {step === "describe" && (
        <>
          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-4"}>Step 3: Describe Your Task</h3>

            <div className="space-y-4">
              <p className={ds.body}>
                {loopType === "build"
                  ? "What do you want to build? Keep it small - this is practice."
                  : "What's broken? Describe what you expected vs what actually happens."}
              </p>

              <Textarea
                placeholder={loopType === "build"
                  ? "e.g., Add a logout button to the header"
                  : "e.g., The save button on settings doesn't actually save - I click it but my changes disappear when I refresh"}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="min-h-[100px]"
              />

              {loopType === "build" && (
                <div className={ds.infoBoxHighlight}>
                  <p className={ds.body + " font-medium mb-2"}>Ideas for small tasks:</p>
                  <ul className="space-y-1">
                    <li className={ds.muted}>• Change a button color or text</li>
                    <li className={ds.muted}>• Add a welcome message</li>
                    <li className={ds.muted}>• Tweak the layout of something</li>
                    <li className={ds.muted}>• Add a simple new element</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("choose")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("build")}
              disabled={!taskDescription.trim()}
              className="gap-2"
            >
              Start the Loop <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: BUILD - Ask Claude */}
      {step === "build" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Hammer className="w-5 h-5 text-white" />
              </div>
              <h3 className={ds.heading}>BUILD: Ask Claude</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                <p className={ds.label + " mb-2"}>Your task</p>
                <p className={ds.body + " font-medium"}>{taskDescription}</p>
              </div>

              <p className={ds.body}>
                Go to Claude Code and ask it to {loopType === "build" ? "build this" : "fix this"}. Be specific about what you want.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body + " font-medium mb-2"}>Good prompt structure</p>
                <p className={ds.muted}>
                  "{loopType === "build" ? "I want to add" : "I have a bug..."} [what].
                  {loopType === "build" ? " It should [expected behavior]." : " When I [action], I expected [x] but got [y]."}
                  "
                </p>
              </div>

              <div
                className={askedClaude ? ds.optionSelected : ds.optionDefault}
                onClick={() => setAskedClaude(!askedClaude)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={askedClaude} onCheckedChange={() => setAskedClaude(!askedClaude)} />
                  <span className={ds.body + " font-medium"}>I've asked Claude and it made changes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => { setStep("describe"); setAskedClaude(false); }} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("test")}
              disabled={!askedClaude}
              className="gap-2"
            >
              Now Test It <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: TEST - Check the preview */}
      {step === "test" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h3 className={ds.heading}>TEST: Check the Preview</h3>
              {iterations > 1 && (
                <span className="text-sm bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                  Attempt #{iterations}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                <p className={ds.label + " mb-2"}>Testing:</p>
                <p className={ds.body + " font-medium"}>{taskDescription}</p>
              </div>

              <p className={ds.body}>
                Open your preview window and test the change. Click around. Does it work the way you expected?
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body + " font-medium mb-2"}>Check for:</p>
                <ul className="space-y-1">
                  <li className={ds.muted}>• Does it look right?</li>
                  <li className={ds.muted}>• Does it behave right when you interact with it?</li>
                  <li className={ds.muted}>• Did it break anything else?</li>
                </ul>
              </div>

              <p className={ds.body + " font-medium"}>Does it work?</p>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-20 flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50"
                  onClick={() => handleTestResult(true)}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="font-medium">Yes, it works!</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-20 flex-col gap-2 border-2 hover:border-red-500 hover:bg-red-50"
                  onClick={() => handleTestResult(false)}
                >
                  <XCircle className="w-6 h-6 text-red-500" />
                  <span className="font-medium">No, something's wrong</span>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 6: FIX - Tell Claude what's wrong */}
      {step === "fix" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <h3 className={ds.heading}>FIX: Tell Claude What's Wrong</h3>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                This is the most important skill. You need to tell Claude EXACTLY what's wrong.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body + " font-medium mb-2"}>Be specific:</p>
                <ul className="space-y-2">
                  <li className={ds.body}>
                    <strong>Bad:</strong> <span className={ds.muted}>"It doesn't work"</span>
                  </li>
                  <li className={ds.body}>
                    <strong>Good:</strong> <span className={ds.muted}>"The button appears but when I click it nothing happens. I expected it to show a confirmation message."</span>
                  </li>
                </ul>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body + " font-medium mb-2"}>Include:</p>
                <ul className="space-y-1">
                  <li className={ds.muted}>• What you did (clicked, typed, etc.)</li>
                  <li className={ds.muted}>• What you expected to happen</li>
                  <li className={ds.muted}>• What actually happened</li>
                  <li className={ds.muted}>• Any error messages (copy/paste them!)</li>
                </ul>
              </div>

              <p className={ds.body}>
                Go tell Claude what's wrong. Let it make another attempt.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleFixDone}
              className="gap-2"
            >
              I've Told Claude - Test Again <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Done */}
      {step === "done" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={ds.heading + " mb-2"}>Loop Complete!</h3>
              <p className={ds.body + " mb-4"}>
                You just completed the Build-Test-Fix loop
                {iterations > 1 && ` in ${iterations} iterations`}.
              </p>
              {iterations > 1 && (
                <p className={ds.muted + " mb-4"}>
                  That's totally normal! Real development is iterative. The pros go through this loop dozens of times per feature.
                </p>
              )}
              {iterations === 1 && (
                <p className={ds.muted + " mb-4"}>
                  First try! Nice. But don't worry if future tasks take a few iterations - that's completely normal.
                </p>
              )}
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.label + " mb-2"}>What you accomplished</h4>
            <p className={ds.body}>{whatTheyDid}</p>
            {iterations > 1 && (
              <p className={ds.muted + " mt-2"}>Iterations... {iterations}</p>
            )}
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-3"}>The Loop You Just Learned</h4>
            <div className="space-y-2">
              <p className={ds.body}>
                <strong>1. BUILD</strong> - Ask Claude to make a change
              </p>
              <p className={ds.body}>
                <strong>2. TEST</strong> - Check the preview, try it out
              </p>
              <p className={ds.body}>
                <strong>3. FIX</strong> - If wrong, describe what's broken
              </p>
              <p className={ds.body}>
                <strong>4. REPEAT</strong> - Until it works perfectly
              </p>
            </div>
            <p className={ds.muted + " mt-4"}>
              This is the skill that will carry you through the entire build phase. Repeat this loop hundreds of times and you'll have a finished product.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold"
              onClick={() => onComplete({
                loopComplete: true,
                loopType: loopType || "build",
                whatTheyDid,
                iterations
              })}
            >
              Complete Day 10
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={handleDoAnotherLoop}
            >
              <RefreshCw className="w-5 h-5" />
              Do Another Loop (Practice More)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
