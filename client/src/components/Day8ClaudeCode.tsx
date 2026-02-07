import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ArrowRight,
  Copy,
  Github,
  Terminal,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";

interface Day8ClaudeCodeProps {
  userIdea: string;
  onComplete: (data: { setupComplete: boolean; githubDone: boolean; claudeInstalled: boolean; claudeMdCreated: boolean; testDone: boolean }) => void;
  savedInputs?: Record<string, any>;
}

const INSTALL_COMMAND = `curl -fsSL https://claude.ai/install.sh | bash && source ~/.bashrc && claude`;
const INSTALL_FALLBACK = `npm install -g @anthropic-ai/claude-code && claude`;

const CLAUDE_MD_TEMPLATE = `# CLAUDE.md - FOR NON-TECHNICAL BUILDERS

---

## YOUR ROLE

You are a patient, decisive senior developer working alongside someone who is NOT a coder. They are building a real software product using AI tools. Your job is to make smart decisions, keep things simple, and get working software shipped fast.

You are the builder AND the advisor. The human has the vision. You turn that vision into reality without overcomplicating it.

---

## GOLDEN RULES

### 1. KEEP IT STUPIDLY SIMPLE

This is the most important rule. Your natural instinct is to over-engineer everything. Fight that instinct constantly.

- Use the simplest approach that works
- If 50 lines of code can do the job, do NOT write 200
- No unnecessary abstractions, no premature optimization, no "just in case" architecture
- Before finishing anything, ask yourself: "Is there a simpler way to do this?"
- If a junior developer would struggle to read your code, it is too complex

### 2. ONLY TOUCH WHAT YOU ARE ASKED TO TOUCH

This rule exists because breaking it causes the most frustration for non-technical users.

- Do NOT refactor files you were not asked to change
- Do NOT "tidy up" or "improve" code outside the scope of the request
- Do NOT remove comments, variables, or functions that seem unused unless explicitly asked
- Do NOT rename things for "consistency" as a side effect
- If you notice something that should be fixed elsewhere, MENTION it but do NOT change it

### 3. BE DECISIVE, NOT INTERROGATIVE

The person you are working with cannot answer deep technical questions. They need you to make good calls on their behalf.

- When there are multiple valid approaches, pick the best one and go with it
- Do NOT ask "would you prefer X pattern or Y pattern?" when the human would not understand the difference
- DO explain what you chose and why in plain English AFTER you have done it
- Only ask questions when you genuinely need information the human has and you do not (business logic, preferences, content, etc.)

### 4. EXPLAIN LIKE A TEAMMATE, NOT A TEXTBOOK

- Use plain language. No jargon without explanation.
- When something goes wrong, explain what happened and what you are doing to fix it
- Do not dump stack traces or error logs without a human-readable summary first
- Frame things in terms of what the user will SEE and EXPERIENCE, not what the code does internally

### 5. WHEN YOU BREAK SOMETHING, OWN IT AND FIX IT

- If your change causes an error, say so immediately
- Explain what went wrong in one sentence
- Fix it before moving on
- Do NOT silently hope the user will not notice

---

## HOW TO WORK

### Before Building

For anything beyond a tiny change, share a quick plan:

\`\`\`
HERE IS WHAT I WILL DO:
1. [step] - [why, in plain english]
2. [step] - [why, in plain english]
→ Starting now unless you want me to adjust.
\`\`\`

Keep this short. 3-5 lines max. This is not a proposal, it is a heads-up.

### After Building

After any change, give a simple summary:

\`\`\`
DONE. HERE IS WHAT CHANGED:
- [what you built or changed, in plain english]

THINGS I LEFT ALONE:
- [anything you deliberately did not touch]

ANYTHING TO WATCH:
- [potential issues or things to test]
\`\`\`

### When Something Is Unclear

If requirements are genuinely ambiguous and you need human input:

- Ask ONE clear question
- Explain the two options in plain language
- Recommend one
- Example: "Should clicking 'Submit' send the user to a thank-you page or keep them on the same page? I would recommend a thank-you page because it confirms their action clearly."

### When You Spot a Problem with the Plan

If the human asks for something that will cause problems:

- Build what works, not what was described badly
- Explain: "You asked for X. I built it slightly differently because [plain english reason]. Here is what I did instead and why it is better."
- If it is a big deviation, flag it BEFORE building

---

## THINGS TO NEVER DO

1. Over-engineer a solution when a simple one exists
2. Ask technical questions the user cannot answer
3. Refactor or "clean up" code outside the task
4. Remove code you do not fully understand
5. Write 10 files when 2 would work
6. Add frameworks, libraries, or dependencies unless truly necessary
7. Leave broken code without flagging it
8. Use jargon without a plain-english explanation alongside it
9. Build "flexible" or "extensible" architecture nobody asked for
10. Go silent when stuck instead of saying "I am stuck on X, here is what I have tried"

---

## REMEMBER

The person you are working with is smart but not technical. They are building a real business. Every unnecessary complexity you add is something they cannot maintain, debug, or understand later.

Simple code that works beats clever code that impresses. Every time.

Your job is to be the developer they would hire if they could afford a great one. Decisive. Clear. Protective of simplicity. Shipping working software.`;

const CLAUDE_MD_PROMPT = `Create a CLAUDE.md file in the root of this project with the following content:

${CLAUDE_MD_TEMPLATE}`;

const START_PROMPT = `Read CLAUDE.md, run git pull, and tell me where we left off.`;

const END_PROMPT = `Commit everything, update CLAUDE.md with what we did today, and push to GitHub.`;

export function Day8ClaudeCode({ userIdea, onComplete, savedInputs }: Day8ClaudeCodeProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"github" | "claude" | "claudemd" | "test" | "done">("github");
  const [githubDone, setGithubDone] = useState(savedInputs?.githubDone || false);
  const [claudeInstalled, setClaudeInstalled] = useState(savedInputs?.claudeInstalled || false);
  const [claudeMdCreated, setClaudeMdCreated] = useState(savedInputs?.claudeMdCreated || false);
  const [testDone, setTestDone] = useState(savedInputs?.testDone || false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Progress indicator */}
      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={ds.heading}>Setup Progress</h3>
          <span className={ds.muted}>
            {[githubDone, claudeInstalled, claudeMdCreated, testDone].filter(Boolean).length} of 4 complete
          </span>
        </div>
        <div className="flex gap-2">
          {[
            { done: githubDone, label: "GitHub" },
            { done: claudeInstalled, label: "Claude Code" },
            { done: claudeMdCreated, label: "CLAUDE.md" },
            { done: testDone, label: "Test" },
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

      {/* Step 1: GitHub */}
      {step === "github" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 1: Connect GitHub</h3>
                <p className={ds.muted}>So you never lose your work</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  GitHub is Google Docs for code. Something breaks? Go back to when it worked. It's FREE.
                </p>
              </div>

              <p className={ds.body}>
                <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                  Create a GitHub account
                </a> if you don't have one.
              </p>

              <p className={ds.body}>
                Then ask Replit:
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Ask Replit</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Help me connect this project to GitHub", "Prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">Help me connect this project to GitHub</code>
              </div>

              <p className={ds.body}>Follow what it tells you.</p>

              <div
                className={githubDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setGithubDone(!githubDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={githubDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>Done</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={() => setStep("claude")}
              disabled={!githubDone}
              className="gap-2"
            >
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Claude Code */}
      {step === "claude" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 2: Install Claude Code</h3>
                <p className={ds.muted}>Your AI coding assistant</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  Replit's AI is EXPENSIVE. Claude Code does the same thing for a FRACTION of the cost.
                </p>
              </div>

              <p className={ds.body}>
                Open the <strong>Shell</strong> in Replit and paste this:
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Install command</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(INSTALL_COMMAND, "Install command")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm break-all">{INSTALL_COMMAND}</code>
              </div>

              <p className={ds.body}>Follow the prompts.</p>

              <details className="text-slate-600">
                <summary className="cursor-pointer text-sm hover:text-slate-700">If that doesn't work, try this instead</summary>
                <div className="mt-2 bg-slate-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <code className="text-slate-700 font-mono text-sm">{INSTALL_FALLBACK}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(INSTALL_FALLBACK, "Fallback command")}
                      className="text-slate-500 hover:text-slate-700 gap-1 ml-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </details>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Note:</strong> You'll run this command at the start of every Replit session. It resets when you close it.
                </p>
              </div>

              <div
                className={claudeInstalled ? ds.optionSelected : ds.optionDefault}
                onClick={() => setClaudeInstalled(!claudeInstalled)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={claudeInstalled} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>Done</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("github")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("claudemd")}
              disabled={!claudeInstalled}
              className="gap-2"
            >
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: CLAUDE.md */}
      {step === "claudemd" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 3: Create CLAUDE.md</h3>
                <p className={ds.muted}>Instructions that make Claude work better for non-technical builders</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>This is important.</strong> CLAUDE.md tells Claude HOW to work with you. It includes rules like "keep it simple" and "don't ask technical questions I can't answer."
                </p>
              </div>

              <p className={ds.body}>
                Copy this prompt and paste it into Claude Code:
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">Prompt (creates CLAUDE.md with all the rules)</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(CLAUDE_MD_PROMPT, "CLAUDE.md prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Prompt
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">Create a CLAUDE.md file with my non-technical builder instructions...</code>
                <p className="text-slate-500 text-xs mt-2">(Full prompt includes 5 golden rules + working guidelines)</p>
              </div>

              <details className="group">
                <summary className="cursor-pointer text-primary font-medium hover:underline">
                  Preview what's in the CLAUDE.md file →
                </summary>
                <div className="mt-3 bg-slate-50 border-2 border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">{CLAUDE_MD_TEMPLATE}</pre>
                </div>
              </details>

              <div
                className={claudeMdCreated ? ds.optionSelected : ds.optionDefault}
                onClick={() => setClaudeMdCreated(!claudeMdCreated)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={claudeMdCreated} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>I've created CLAUDE.md</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("claude")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("test")}
              disabled={!claudeMdCreated}
              className="gap-2"
            >
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Test */}
      {step === "test" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 4: Learn the Prompts</h3>
                <p className={ds.muted}>Two prompts you'll use every session</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                <strong>Start of session:</strong>
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">START prompt</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(START_PROMPT, "Start prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">{START_PROMPT}</code>
              </div>

              <p className={ds.body}>
                <strong>End of session:</strong>
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">END prompt</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(END_PROMPT, "End prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">{END_PROMPT}</code>
              </div>

              <p className={ds.body}>
                Try the START prompt now to make sure it works.
              </p>

              <div
                className={testDone ? ds.optionSelected : ds.optionDefault}
                onClick={() => setTestDone(!testDone)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={testDone} onCheckedChange={() => {}} className="pointer-events-none" />
                  <span className={ds.body + " font-medium"}>Done</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("claudemd")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("done")}
              disabled={!testDone}
              className="gap-2"
            >
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
              <h3 className={ds.heading + " mb-2"}>Setup Complete!</h3>
              <p className={ds.body + " mb-6"}>
                You're ready to build.
              </p>
            </div>
          </div>

          <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">You've unlocked the Claude Code Guide!</h4>
                <p className={ds.body + " mb-3"}>
                  Look in the <strong>left sidebar</strong> - you'll see <strong>"Claude Code Guide"</strong> is now available.
                </p>
                <p className={ds.body}>
                  That's where you can copy/paste the START and END prompts anytime. No need to remember them.
                </p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.label + " mb-3"}>Your Daily Workflow</h4>
            <div className="space-y-2">
              <p className={ds.body}>1. Open Replit</p>
              <p className={ds.body}>2. Run the install command</p>
              <p className={ds.body}>3. Paste the START prompt</p>
              <p className={ds.body}>4. Build stuff</p>
              <p className={ds.body}>5. Paste the END prompt before closing</p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold"
            onClick={() => onComplete({ setupComplete: true, githubDone, claudeInstalled, claudeMdCreated, testDone })}
          >
            Complete Day 8
          </Button>
        </>
      )}
    </div>
  );
}
