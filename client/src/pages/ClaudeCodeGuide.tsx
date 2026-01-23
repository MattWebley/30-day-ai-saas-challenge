import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Copy, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const INSTALL_COMMAND = `curl -fsSL https://claude.ai/install.sh | bash && source ~/.bashrc && claude`;
const INSTALL_FALLBACK = `npm install -g @anthropic-ai/claude-code && claude`;

const KICKOFF_PROMPT = `I'm starting a new coding session. Please:

1. Check CLAUDE.md file size - if over 30k chars, trim by moving old session logs to CLAUDE_ARCHIVE.md
2. Read CLAUDE.md for project context, rules, and pending tasks.
3. Run \`git pull\` to ensure we're up-to-date.
4. Run \`git status\` and \`git log --oneline -5\` to see recent activity.
5. Summarize where we left off and what's pending.
6. Suggest the best next step.`;

const WRAPUP_PROMPT = `I'm ending my coding session. Please:

1. Verify all changes are committed (run git status).
2. If there's work-in-progress, save it to a branch.
3. Update CLAUDE.md with:
   - Tasks completed today
   - Any fixes applied
   - New issues discovered
   - Notes for next session
4. Commit and push everything.`;

export default function ClaudeCodeGuide() {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Claude Code Daily Routine</h1>
            <p className="text-slate-600 mt-1">Your 3-step process for every build session</p>
          </div>
        </div>

        {/* Explanation */}
        <Card className="p-6 border-2 border-slate-200 bg-white mb-6">
          <p className="text-slate-700">
            <strong>Every time you open Replit</strong>, paste these 3 prompts in order.
            The first installs Claude Code. The second gets Claude up to speed on your project.
            The third saves everything before you close.
          </p>
          <p className="text-slate-700 mt-3">
            <strong>Result:</strong> You never lose work. Claude always knows where you left off.
            No more explaining your project from scratch.
          </p>
        </Card>

        {/* The 3 Prompts */}
        <div className="space-y-4">
          {/* Step 1: Install */}
          <Card className="border-2 border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Install Claude Code</h3>
                  <p className="text-slate-600">Run EVERY session - Replit resets each time</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(INSTALL_COMMAND, "Install command")}
                className="gap-2 bg-white"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
            <pre className="p-6 text-slate-700 whitespace-pre-wrap bg-white font-mono text-sm">
              {INSTALL_COMMAND}
            </pre>
            <details className="px-6 pb-4 text-slate-500">
              <summary className="cursor-pointer text-sm hover:text-slate-700">If that doesn't work, try this instead</summary>
              <div className="mt-2 flex items-center justify-between bg-slate-100 rounded-lg p-3">
                <code className="text-slate-700 font-mono text-sm">{INSTALL_FALLBACK}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(INSTALL_FALLBACK, "Fallback command")}
                  className="text-slate-500 hover:text-slate-700 gap-1"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </details>
          </Card>

          {/* Step 2: Session Start */}
          <Card className="border-2 border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Start Your Session</h3>
                  <p className="text-slate-600">Paste this after Claude Code opens</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(KICKOFF_PROMPT, "Start prompt")}
                className="gap-2 bg-white"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
            <pre className="p-6 text-slate-700 whitespace-pre-wrap bg-white font-mono">
              {KICKOFF_PROMPT}
            </pre>
          </Card>

          {/* Step 3: Session End */}
          <Card className="border-2 border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">End Your Session</h3>
                  <p className="text-slate-600">Paste this before closing Replit</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(WRAPUP_PROMPT, "End prompt")}
                className="gap-2 bg-white"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
            <pre className="p-6 text-slate-700 whitespace-pre-wrap bg-white font-mono">
              {WRAPUP_PROMPT}
            </pre>
          </Card>
        </div>

        {/* Bottom Note */}
        <Card className="p-6 border-2 border-slate-200 bg-white mt-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-700 font-medium">
                Bookmark this page! You'll use it every single time you build.
              </p>
              <p className="text-slate-600 mt-1">
                These prompts are the difference between chaos and progress. Use them every session.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
