import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ArrowRight,
  Lightbulb,
  Target,
  CheckCircle2,
  Copy,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  Layers,
  GitBranch,
  HelpCircle,
  Sparkles,
  MessageCircleQuestion,
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
  bad: "Build a complete dashboard with stats, charts, recent activity, notifications, and user management",
  good: [
    "Add a dashboard page that shows total users and signups this week",
    "Add a chart showing signups over the last 7 days",
    "Add a list of the 10 most recent actions",
    "Add a section showing any errors or issues",
  ],
};

export function Day9ClaudeCodeMastery({ userIdea, onComplete }: Day9ClaudeCodeMasteryProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "specific" | "reverse" | "errors" | "breakdown" | "commit" | "options" | "vibe" | "askwhy" | "done"
  >("specific");
  const [specificDone, setSpecificDone] = useState(false);
  const [reverseDone, setReverseDone] = useState(false);
  const [errorsDone, setErrorsDone] = useState(false);
  const [breakdownDone, setBreakdownDone] = useState(false);
  const [commitDone, setCommitDone] = useState(false);
  const [optionsDone, setOptionsDone] = useState(false);
  const [vibeDone, setVibeDone] = useState(false);
  const [askWhyDone, setAskWhyDone] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const completedCount = [specificDone, reverseDone, errorsDone, breakdownDone, commitDone, optionsDone, vibeDone, askWhyDone].filter(Boolean).length;

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
              <p className="font-bold text-slate-900">Before you start - Open the Claude Code Guide</p>
              <p className={ds.muted}>Use the prompts there to set up Claude Code and start your session.</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Progress indicator */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={ds.heading}>Mastery Progress</h3>
          <span className={ds.muted}>{completedCount} of 8 complete</span>
        </div>
        <div className="flex gap-1">
          {[
            { done: specificDone, label: "Specific", step: "specific" as const },
            { done: reverseDone, label: "Reverse", step: "reverse" as const },
            { done: errorsDone, label: "Errors", step: "errors" as const },
            { done: breakdownDone, label: "Breakdown", step: "breakdown" as const },
            { done: commitDone, label: "Commit", step: "commit" as const },
            { done: optionsDone, label: "Options", step: "options" as const },
            { done: vibeDone, label: "Vibe", step: "vibe" as const },
            { done: askWhyDone, label: "Ask Why", step: "askwhy" as const },
          ].map((item, i) => (
            <div
              key={i}
              className="flex-1 cursor-pointer group"
              onClick={() => setStep(item.step)}
            >
              <div className={`h-2 rounded-full transition-all ${item.done ? "bg-green-500 group-hover:bg-green-600" : "bg-slate-200 group-hover:bg-slate-300"}`} />
              <p className={`text-xs mt-1 text-center transition-colors hidden sm:block ${item.done ? "text-green-600 font-medium group-hover:text-green-700" : "text-slate-500 group-hover:text-slate-700"}`}>
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
                  <Checkbox checked={specificDone} onCheckedChange={() => {}} className="pointer-events-none" />
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
                  <Checkbox checked={reverseDone} onCheckedChange={() => {}} className="pointer-events-none" />
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

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Last resort:</strong> If NOTHING else fixes it, click "Debug with Agent" in the Replit preview window. Replit will fix it in 99% of cases. (It costs agent fees, but usually not much.)
                </p>
              </div>

              <div
                className={errorsDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setErrorsDone(!errorsDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={errorsDone} onCheckedChange={() => {}} className="pointer-events-none" />
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

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body + " font-medium mb-2"}>The workflow:</p>
                <div className="space-y-1">
                  <p className={ds.body}>1. Ask for ONE change</p>
                  <p className={ds.body}>2. Test it - does it work?</p>
                  <p className={ds.body}>3. <strong>YES?</strong> Move on to the next thing</p>
                  <p className={ds.body}>4. <strong>NO?</strong> Tell Claude what's wrong, let it fix it</p>
                  <p className={ds.body}>5. Repeat until it works, THEN move on</p>
                </div>
              </div>

              <p className={ds.muted}>
                This loop is how real builders work. One thing at a time. Test. Fix. Move on.
              </p>

              <div
                className={breakdownDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setBreakdownDone(!breakdownDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={breakdownDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("errors")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("commit")} disabled={!breakdownDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Commit Before Big Changes */}
      {step === "commit" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #5: Commit Before Big Changes</h3>
                <p className={ds.muted}>Your safety net</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                About to make a big change? Ask Claude to commit first.
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Say this</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Commit what we have so far before we continue", "Prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">Commit what we have so far before we continue</code>
              </div>

              <p className={ds.body}>
                This saves your progress. If something goes wrong, you can always go back.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>When to commit:</strong>
                </p>
                <ul className="mt-2 space-y-1">
                  <li className={ds.muted}>Before adding a new feature</li>
                  <li className={ds.muted}>Before refactoring or restructuring code</li>
                  <li className={ds.muted}>When something is working and you don't want to lose it</li>
                  <li className={ds.muted}>At the end of a session</li>
                </ul>
              </div>

              <div
                className={commitDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setCommitDone(!commitDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={commitDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("breakdown")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("options")} disabled={!commitDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 6: Ask for Options */}
      {step === "options" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #6: Ask for Options</h3>
                <p className={ds.muted}>Don't guess - get advice</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Not sure how to do something? Don't guess. Ask Claude for options.
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Say this</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Give me 3 options for how to approach this", "Prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">Give me 3 options for how to approach this</code>
              </div>

              <p className={ds.body}>
                Claude will explain the pros and cons. Then YOU pick the one you want.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Great for:</strong>
                </p>
                <ul className="mt-2 space-y-1">
                  <li className={ds.muted}>"How should I structure this feature?"</li>
                  <li className={ds.muted}>"What's the best way to handle this?"</li>
                  <li className={ds.muted}>"I'm stuck - what are my options here?"</li>
                </ul>
              </div>

              <div
                className={optionsDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setOptionsDone(!optionsDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={optionsDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("commit")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("vibe")} disabled={!optionsDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 7: Vibe With It */}
      {step === "vibe" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #7: Vibe With It</h3>
                <p className={ds.muted}>Be creative, but watch scope creep</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Don't be scared to be creative. Go with the flow. Have fun with it.
              </p>

              <p className={ds.body}>
                See something cool you want to try? Go for it. Claude can help you explore ideas quickly.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>BUT...</strong> watch out for scope creep.
                </p>
                <p className={ds.muted + " mt-2"}>
                  It's easy to keep adding "just one more thing" until you're building a monster. Before you know it, your simple app has 47 features and you're months away from shipping.
                </p>
              </div>

              <p className={ds.body}>
                <strong>The balance:</strong> Be creative within your MVP. Save the extras for version 2.
              </p>

              <div
                className={vibeDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setVibeDone(!vibeDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={vibeDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("options")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("askwhy")} disabled={!vibeDone} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 8: Ask Why */}
      {step === "askwhy" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <MessageCircleQuestion className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Rule #8: Ask Why</h3>
                <p className={ds.muted}>Don't just stare at it - ask!</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Not seeing what you expect in the preview? Don't just sit there confused.
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Say this</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Why isn't this showing what I expected?", "Prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">Why isn't this showing what I expected?</code>
              </div>

              <p className={ds.body}>
                Claude will investigate and explain what's happening. Often it'll spot the issue immediately.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Also try:</strong>
                </p>
                <ul className="mt-2 space-y-1">
                  <li className={ds.muted}>"Why is [X] happening instead of [Y]?"</li>
                  <li className={ds.muted}>"The button isn't working - why?"</li>
                  <li className={ds.muted}>"This looks different from what I asked for - what's going on?"</li>
                </ul>
              </div>

              <div
                className={askWhyDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setAskWhyDone(!askWhyDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={askWhyDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>Got it</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("vibe")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("done")} disabled={!askWhyDone} className="gap-2">
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
              <p className={ds.body}><strong>3. Report errors/bugs</strong> - copy it, paste it, explain what you expected</p>
              <p className={ds.body}><strong>4. Break it down</strong> - one task at a time</p>
              <p className={ds.body}><strong>5. Commit first</strong> - save your progress before big changes</p>
              <p className={ds.body}><strong>6. Ask for options</strong> - get advice, then you choose</p>
              <p className={ds.body}><strong>7. Vibe with it</strong> - be creative, but watch scope creep</p>
              <p className={ds.body}><strong>8. Ask why</strong> - not seeing what you expect? Ask!</p>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.label + " mb-3"}>🎯 Try It Now (30 seconds)</h4>
            <div className="space-y-3">
              <p className={ds.body}>
                Before you finish, try this quick exercise to practice Rules 1 & 2
              </p>
              <div className="space-y-2 pl-4 border-l-2 border-primary">
                <p className={ds.body}><strong>1.</strong> Ask Claude to change a button color in your app</p>
                <p className={ds.body}><strong>2.</strong> See the change in your preview</p>
                <p className={ds.body}><strong>3.</strong> Say "reverse that" to undo it</p>
              </div>
              <p className={ds.muted}>
                That's it! You just practiced giving a specific instruction AND using the undo command. You're ready.
              </p>
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
