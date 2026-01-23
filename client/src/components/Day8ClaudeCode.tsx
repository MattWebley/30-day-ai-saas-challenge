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
  onComplete: (data: { setupComplete: boolean }) => void;
}

const INSTALL_COMMAND = `curl -fsSL https://claude.ai/install.sh | bash && source ~/.bashrc && claude`;
const INSTALL_FALLBACK = `npm install -g @anthropic-ai/claude-code && claude`;

const CLAUDE_MD_PROMPT = `Create a CLAUDE.md file for this project. Keep it simple - just the app name, what it does, and what we're currently working on.`;

const START_PROMPT = `Read CLAUDE.md, run git pull, and tell me where we left off.`;

const END_PROMPT = `Commit everything, update CLAUDE.md with what we did today, and push to GitHub.`;

export function Day8ClaudeCode({ userIdea, onComplete }: Day8ClaudeCodeProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"github" | "claude" | "claudemd" | "test" | "done">("github");
  const [githubDone, setGithubDone] = useState(false);
  const [claudeInstalled, setClaudeInstalled] = useState(false);
  const [claudeMdCreated, setClaudeMdCreated] = useState(false);
  const [testDone, setTestDone] = useState(false);
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
                  <Checkbox checked={githubDone} onCheckedChange={() => setGithubDone(!githubDone)} />
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
                  <Checkbox checked={claudeInstalled} onCheckedChange={() => setClaudeInstalled(!claudeInstalled)} />
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
                <p className={ds.muted}>A file that tells Claude about your project</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Ask Claude Code:
              </p>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Ask Claude Code</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(CLAUDE_MD_PROMPT, "Prompt")}
                    className="text-slate-300 hover:text-white gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm">{CLAUDE_MD_PROMPT}</code>
              </div>

              <p className={ds.body}>It'll create the file for you.</p>

              <div
                className={claudeMdCreated ? ds.optionSelected : ds.optionDefault}
                onClick={() => setClaudeMdCreated(!claudeMdCreated)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={claudeMdCreated} onCheckedChange={() => setClaudeMdCreated(!claudeMdCreated)} />
                  <span className={ds.body + " font-medium"}>Done</span>
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
                  <Checkbox checked={testDone} onCheckedChange={() => setTestDone(!testDone)} />
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
            onClick={() => onComplete({ setupComplete: true })}
          >
            Complete Day 8
          </Button>
        </>
      )}
    </div>
  );
}
