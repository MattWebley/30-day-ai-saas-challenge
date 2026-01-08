import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Copy, Sparkles, ArrowLeft, Bug, AlertTriangle, RefreshCw, Clipboard, Bot, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const INSTALL_COMMAND = `npm install -g @anthropic-ai/claude-code && claude`;

const KICKOFF_PROMPT = `I'm starting a new coding session. Please:

1. Read CLAUDE.md for project context, rules, and pending tasks.
2. Run \`git pull\` to ensure we're up-to-date.
3. Run \`git status\` and \`git log --oneline -5\` to see recent activity.
4. Summarize where we left off and what's pending.
5. Suggest the best next step.`;

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
        <Link href="/dashboard">
          <a className="inline-flex items-center gap-2 text-slate-600 hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
        </Link>

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
          <p className="text-lg text-slate-700">
            <strong>Every time you open Replit</strong>, paste these 3 prompts in order.
            The first installs Claude Code. The second gets Claude up to speed on your project.
            The third saves everything before you close.
          </p>
          <p className="text-lg text-slate-700 mt-3">
            <strong>Result:</strong> You never lose work. Claude always knows where you left off.
            No more explaining your project from scratch.
          </p>
        </Card>

        {/* The 3 Prompts */}
        <div className="space-y-6">
          {/* Step 1: Install */}
          <Card className="border-2 border-green-300 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">1</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Install Claude Code</h3>
                  <p className="text-sm text-green-700">Run this EVERY session - Replit resets each time</p>
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
            <pre className="p-6 text-base text-slate-700 whitespace-pre-wrap bg-white font-mono">
              {INSTALL_COMMAND}
            </pre>
          </Card>

          {/* Step 2: Session Start */}
          <Card className="border-2 border-amber-300 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg">2</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Start Your Session</h3>
                  <p className="text-sm text-amber-700">Paste this after Claude Code opens</p>
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
            <pre className="p-6 text-base text-slate-700 whitespace-pre-wrap bg-white font-mono">
              {KICKOFF_PROMPT}
            </pre>
          </Card>

          {/* Step 3: Session End */}
          <Card className="border-2 border-indigo-300 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg">3</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">End Your Session</h3>
                  <p className="text-sm text-indigo-700">Paste this before closing Replit</p>
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
            <pre className="p-6 text-base text-slate-700 whitespace-pre-wrap bg-white font-mono">
              {WRAPUP_PROMPT}
            </pre>
          </Card>
        </div>

        {/* Debugging Section */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">When Things Break</h2>
              <p className="text-slate-600">Your 5-step debugging process</p>
            </div>
          </div>

          <Card className="p-6 border-2 border-slate-200 bg-white mb-6">
            <p className="text-lg text-slate-700">
              <strong>Bugs happen.</strong> Don't panic. Follow this exact process and you'll fix
              99% of issues without wasting hours. The key is escalation - start simple, get more
              detailed if needed.
            </p>
          </Card>

          <div className="space-y-4">
            {/* Step 1: Tell Claude */}
            <Card className="border-2 border-slate-200 overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-lg shrink-0">1</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-lg text-slate-900">Tell Claude Code What's Wrong</h3>
                  </div>
                  <p className="text-slate-600 mb-3">
                    Describe the problem in plain English. Be specific about what you expected vs what happened.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm font-mono text-slate-700">
                      "The login button doesn't work. When I click it, nothing happens. It should take me to the dashboard."
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 2: Try Again */}
            <Card className="border-2 border-slate-200 overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-lg shrink-0">2</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-lg text-slate-900">If It Doesn't Work, Say So</h3>
                  </div>
                  <p className="text-slate-600 mb-3">
                    Claude's first attempt didn't fix it? Tell it directly. Ask for a different approach.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm font-mono text-slate-700">
                      "That didn't work. The button still does nothing. Try a different approach - maybe the click handler isn't attached properly?"
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 3: Copy Error */}
            <Card className="border-2 border-slate-200 overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-lg shrink-0">3</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clipboard className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-lg text-slate-900">Copy the Actual Error</h3>
                  </div>
                  <p className="text-slate-600 mb-3">
                    Look in two places for error messages:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-sm font-semibold text-slate-800 mb-1">Preview Window Error:</p>
                      <p className="text-sm text-slate-600">Red error screens that appear in your app preview</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-sm font-semibold text-slate-800 mb-1">Browser Console (F12 → Console tab):</p>
                      <p className="text-sm text-slate-600">Red error messages that show the exact file and line number</p>
                    </div>
                  </div>
                  <p className="text-slate-600 mt-3">
                    <strong>Copy the ENTIRE error message</strong> and paste it to Claude Code. The more detail, the better.
                  </p>
                </div>
              </div>
            </Card>

            {/* Step 4: Replit Agent */}
            <Card className="border-2 border-amber-300 overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">4</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-lg text-slate-900">Use Replit's Debug Button</h3>
                  </div>
                  <p className="text-slate-600 mb-3">
                    Still stuck? Replit has a secret weapon. When you see an error in the preview:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-3">
                    <li>Look for the <strong>"Debug with Agent"</strong> button on the error screen</li>
                    <li>Click it and let Replit's AI analyze the problem</li>
                    <li>Read what it says - it often finds the root cause</li>
                    <li><strong>Don't let Replit fix it</strong> - just note what it found</li>
                  </ol>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Why not let Replit fix it?</strong> Claude Code knows your whole project. Replit Agent doesn't.
                      Use Replit for diagnosis, Claude Code for the fix.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 5: Tell Claude + Prevent */}
            <Card className="border-2 border-green-300 overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shrink-0">5</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-lg text-slate-900">Fix It & Prevent It Forever</h3>
                  </div>
                  <p className="text-slate-600 mb-3">
                    Now tell Claude Code exactly what Replit found, and make sure it never happens again:
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-3">
                    <p className="text-sm font-mono text-slate-700">
                      "Replit Agent found the issue: [paste what Replit said]. Fix this and add a rule to CLAUDE.md so you never make this mistake again."
                    </p>
                  </div>
                  <p className="text-slate-600">
                    <strong>This is the key:</strong> By updating CLAUDE.md, you're training Claude Code on YOUR project's quirks.
                    Each bug you fix this way makes future bugs less likely.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Debug Summary */}
          <Card className="p-6 border-2 border-red-200 bg-red-50 mt-6">
            <h4 className="font-bold text-slate-900 mb-3">Quick Reference: The Debug Flow</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">1. Tell Claude</span>
              <span className="text-slate-400">→</span>
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">2. Try Again</span>
              <span className="text-slate-400">→</span>
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">3. Copy Error</span>
              <span className="text-slate-400">→</span>
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">4. Replit Debug</span>
              <span className="text-slate-400">→</span>
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">5. Fix + Prevent</span>
            </div>
          </Card>
        </div>

        {/* Bottom Note */}
        <Card className="p-6 border-2 border-primary/30 bg-primary/5 mt-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-700 font-medium">
                Bookmark this page! You'll use it every single time you build.
              </p>
              <p className="text-slate-600 mt-1">
                These prompts and debugging steps are the difference between chaos and progress. Use them every session.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
