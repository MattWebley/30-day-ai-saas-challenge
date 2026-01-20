import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ArrowRight,
  Lightbulb,
  Target,
  Zap,
  CheckCircle2,
  Copy,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";

interface Day9ClaudeCodeMasteryProps {
  userIdea: string;
  onComplete: (data: { masteryComplete: boolean }) => void;
}

const GOOD_VS_BAD_PROMPTS = [
  {
    bad: "Make it look better",
    good: "Add 16px padding around all cards and change the background to white",
  },
  {
    bad: "Fix the bug",
    good: "When I click submit, nothing happens. It should show a success message.",
  },
  {
    bad: "Add authentication",
    good: "Add a login form with email and password. When submitted, redirect to /dashboard.",
  },
];

const BIG_TASK_EXAMPLE = {
  bad: "Build a complete user authentication system with login, signup, password reset, and email verification",
  good: [
    "Add a login page with email and password fields",
    "Add a signup page that creates a new user",
    "Add a 'forgot password' link that sends a reset email",
    "Add email verification when users sign up",
  ],
};

export function Day9ClaudeCodeMastery({ userIdea, onComplete }: Day9ClaudeCodeMasteryProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "specific" | "reverse" | "errors" | "breakdown" | "stacking" | "done"
  >("specific");
  const [specificDone, setSpecificDone] = useState(false);
  const [reverseDone, setReverseDone] = useState(false);
  const [errorsDone, setErrorsDone] = useState(false);
  const [breakdownDone, setBreakdownDone] = useState(false);
  const [stackingDone, setStackingDone] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const completedCount = [specificDone, reverseDone, errorsDone, breakdownDone, stackingDone].filter(Boolean).length;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Claude Code Guide Reminder */}
      <Link href="/claude-code">
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Before you start: Open the Claude Code Guide</p>
              <p className={ds.muted}>Use the prompts there to set up Claude Code and start your session.</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Progress indicator */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={ds.heading}>Mastery Progress</h3>
          <span className={ds.muted}>{completedCount} of 5 complete</span>
        </div>
        <div className="flex gap-1">
          {[
            { done: specificDone, label: "Specific" },
            { done: reverseDone, label: "Reverse" },
            { done: errorsDone, label: "Errors" },
            { done: breakdownDone, label: "Breakdown" },
            { done: stackingDone, label: "Stacking" },
          ].map((item, i) => (
            <div key={i} className="flex-1">
              <div className={`h-2 rounded-full ${item.done ? "bg-green-500" : "bg-slate-200"}`} />
              <p className={`text-xs mt-1 text-center ${item.done ? "text-green-600 font-medium" : "text-slate-500"}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Be Specific */}
      {step === "specific" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #1: Be Specific</h3>
                <p className={ds.muted}>Vague prompts = vague results</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                The #1 reason people get frustrated: they're not specific enough.
              </p>

              <div className="space-y-3">
                {GOOD_VS_BAD_PROMPTS.map((example, i) => (
                  <div key={i} className={ds.infoBoxHighlight}>
                    <div className="space-y-2">
                      <p className={ds.muted + " line-through"}>{example.bad}</p>
                      <p className={ds.body + " text-green-700"}>{example.good}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>The formula:</strong> WHAT you want + WHERE it goes + WHAT should happen.
                </p>
              </div>

              <div
                className={specificDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setSpecificDone(!specificDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={specificDone} onCheckedChange={() => setSpecificDone(!specificDone)} />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep("reverse")} disabled={!specificDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: When Things Go Wrong */}
      {step === "reverse" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #2: When Things Go Wrong</h3>
                <p className={ds.muted}>Just say "reverse"</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Claude made a change you don't like? Don't panic. Don't try to fix it yourself.
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Say this</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Reverse that last change", "Prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">Reverse that last change</code>
              </div>

              <p className={ds.body}>
                Claude will undo what it just did. Then you can try again with a better prompt.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Other useful phrases:</strong>
                </p>
                <ul className="mt-2 space-y-1">
                  <li className={ds.muted}>"Undo that"</li>
                  <li className={ds.muted}>"Go back to before that change"</li>
                  <li className={ds.muted}>"That's not what I meant, let me explain better..."</li>
                </ul>
              </div>

              <div
                className={reverseDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setReverseDone(!reverseDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={reverseDone} onCheckedChange={() => setReverseDone(!reverseDone)} />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("specific")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("errors")} disabled={!reverseDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Describing Errors */}
      {step === "errors" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #3: How to Report Errors</h3>
                <p className={ds.muted}>Copy, paste, explain</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                See an error? Don't just say "it's broken." Do this:
              </p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <p className={ds.body}><strong>Copy the error message</strong> - the red text, the console error, whatever you see</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <p className={ds.body}><strong>Paste it to Claude</strong></p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <p className={ds.body}><strong>Say what you expected</strong> - "I clicked X and expected Y but got Z"</p>
                </div>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Example:</strong> "I'm getting this error: [paste error]. This happens when I click the submit button. It should save the form and show a success message."
                </p>
              </div>

              <p className={ds.body}>
                Claude can also see screenshots. If something looks wrong, take a screenshot and share it.
              </p>

              <div
                className={errorsDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setErrorsDone(!errorsDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={errorsDone} onCheckedChange={() => setErrorsDone(!errorsDone)} />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("reverse")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("breakdown")} disabled={!errorsDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Breaking Down Big Tasks */}
      {step === "breakdown" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #4: Break Down Big Tasks</h3>
                <p className={ds.muted}>One thing at a time</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Big prompts = big mess. Split them up.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body + " text-red-600 line-through mb-3"}>{BIG_TASK_EXAMPLE.bad}</p>
                <p className={ds.body + " font-medium mb-2"}>Instead, send these one at a time:</p>
                <div className="space-y-2">
                  {BIG_TASK_EXAMPLE.good.map((prompt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">{i + 1}.</span>
                      <span className={ds.body}>{prompt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className={ds.body}>
                Wait for each one to finish before sending the next. Test it works. Then move on.
              </p>

              <div
                className={breakdownDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setBreakdownDone(!breakdownDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={breakdownDone} onCheckedChange={() => setBreakdownDone(!breakdownDone)} />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("errors")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("stacking")} disabled={!breakdownDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Prompt Stacking */}
      {step === "stacking" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #5: Prompt Stacking</h3>
                <p className={ds.muted}>Speed hack for pros</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Most people: send prompt, wait, watch, send next prompt. SLOW.
              </p>

              <p className={ds.body}>
                <strong>Pro move:</strong> While Claude works on one thing, queue up your next prompt.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>THE RULE:</strong> Only stack prompts that touch DIFFERENT files.
                </p>
                <p className={ds.muted + " mt-2"}>
                  Claude editing the header? Don't also ask it to change the header color. That's the same file = conflict.
                </p>
                <p className={ds.muted + " mt-2"}>
                  Claude building the login page? You CAN ask it to set up the database schema. Different files = stack away.
                </p>
              </div>

              <div
                className={stackingDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setStackingDone(!stackingDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={stackingDone} onCheckedChange={() => setStackingDone(!stackingDone)} />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("breakdown")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("done")} disabled={!stackingDone} className="gap-2">
              Finish <ArrowRight className="w-5 h-5" />
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
              <h3 className={ds.heading + " mb-2"}>You've Got the Skills!</h3>
              <p className={ds.body + " mb-6"}>
                You now know how to talk to Claude Code like a pro.
              </p>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.label + " mb-3"}>Quick Reference</h4>
            <div className="space-y-2">
              <p className={ds.body}><strong>1. Be specific</strong> - what, where, what should happen</p>
              <p className={ds.body}><strong>2. Say "reverse"</strong> - to undo any change</p>
              <p className={ds.body}><strong>3. Report errors</strong> - copy error, paste it, explain what you expected</p>
              <p className={ds.body}><strong>4. Break it down</strong> - one task at a time</p>
              <p className={ds.body}><strong>5. Stack smart</strong> - different files only</p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold"
            onClick={() => onComplete({ masteryComplete: true })}
          >
            Complete Day 9
          </Button>
        </>
      )}
    </div>
  );
}
