import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ArrowRight,
  Copy,
  Brain,
  Zap,
  AlertTriangle,
  FileText,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Bug,
  Clipboard,
  Bot,
  Shield,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day8ClaudeCodeProps {
  userIdea: string;
  onComplete: (data: { firstBuild: string; whatYouBuilt: string }) => void;
}

const QUICK_WIN_IDEAS = [
  "Add a beautiful header with your app name",
  "Create a dashboard that shows user stats",
  "Build a simple form that saves data",
  "Add a settings page where users can update their profile",
  "Create a list view that displays saved items",
  "Build a search feature for existing content",
];

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

const INSTALL_COMMAND = `npm install -g @anthropic-ai/claude-code && claude`;

export function Day8ClaudeCode({ userIdea, onComplete }: Day8ClaudeCodeProps) {
  const [step, setStep] = useState<"learn" | "choose" | "build" | "done">("learn");
  const [selectedWin, setSelectedWin] = useState("");
  const [customWin, setCustomWin] = useState("");
  const [whatYouBuilt, setWhatYouBuilt] = useState("");
  const { toast } = useToast();

  const currentWin = customWin || selectedWin;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleStartBuild = () => {
    if (currentWin) {
      setStep("build");
    }
  };

  const handleBuildComplete = () => {
    setStep("done");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Master Claude Code</h3>
        <p className="text-slate-700 mt-1">The mindset + workflow that separates amateurs from pros.</p>
      </Card>

      {/* Why Claude Code - Cost Warning */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Why Claude Code? It'll Save You THOUSANDS.</h3>
        <p className="text-slate-700 mb-3">
          You CAN just use Replit's built-in AI agent on its own - it's easier to get started. But here's the truth:
          <strong> it gets VERY expensive, VERY fast.</strong>
        </p>
        <p className="text-slate-700">
          Using Claude Code in the Replit shell drops your development costs by thousands of dollars.
          Same power, fraction of the price. The workflow below is how I teach my 1:1 mentorship clients to do it.
        </p>
      </Card>

      {step === "learn" && (
        <>
          {/* THE BIG SECRET */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">The #1 Mistake Everyone Makes</h2>
                <p className="text-slate-700">
                  Most people open Claude Code and start typing. <strong>WRONG.</strong>
                </p>
                <p className="text-slate-700 mt-2">
                  The first thing you need to do is <strong>THINK.</strong> Not type. Think.
                </p>
                <p className="text-slate-700 mt-2">
                  Planning before coding produces DRAMATICALLY better results than typing and hoping Claude figures it out. Every. Single. Time.
                </p>
              </div>
            </div>
          </Card>

          {/* PLAN MODE */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Use Plan Mode</h2>
            </div>

            <Card className="p-6 border-2 border-slate-200 bg-white">
              <p className="text-slate-700 mb-4">
                <strong>Shift + Tab (twice)</strong> puts Claude in PLAN MODE.
              </p>
              <p className="text-slate-700 mb-4">
                In plan mode, Claude thinks through the architecture BEFORE writing code.
                It'll ask you questions. It'll consider options. It'll come up with a proper approach.
              </p>
              <p className="text-slate-700 mb-4">
                Takes 5 extra minutes. Saves you HOURS of debugging later.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-slate-700 font-medium">
                  Don't know what to tell it? Ask ChatGPT or Claude.ai first. Describe what you want to build.
                  Ask what options you have. Have a back-and-forth. THEN bring the plan to Claude Code.
                </p>
              </div>
            </Card>
          </div>

          {/* HOW TO WRITE GOOD PROMPTS */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">How to Write Good Prompts</h2>
            </div>

            <Card className="p-6 border-2 border-slate-200 bg-white mb-4">
              <h3 className="text-lg font-bold text-slate-900 mb-3">The Golden Rule: Vague = Garbage</h3>
              <p className="text-slate-700 mb-4">
                The quality of Claude's output is directly tied to the quality of your input.
                Vague prompts let Claude make decisions. Claude will make them POORLY.
              </p>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-medium mb-1">BAD:</p>
                  <p className="text-slate-600 font-mono text-sm">"Build me an auth system"</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 font-medium mb-1">GOOD:</p>
                  <p className="text-slate-600 font-mono text-sm">"Build email/password login using the existing User model. Store sessions in the database. Add middleware that protects all /api/protected routes."</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-slate-200 bg-white mb-4">
              <h3 className="text-lg font-bold text-slate-900 mb-3">The Prompt Formula</h3>
              <p className="text-slate-700 mb-4">
                Follow this structure for every request:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <div>
                    <span className="text-slate-900 font-medium">WHAT</span>
                    <span className="text-slate-600"> - What do you want built?</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <div>
                    <span className="text-slate-900 font-medium">WHERE</span>
                    <span className="text-slate-600"> - Where does it go? Which file/page/component?</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <div>
                    <span className="text-slate-900 font-medium">HOW</span>
                    <span className="text-slate-600"> - Any specific requirements? Use existing code/patterns?</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <div>
                    <span className="text-slate-900 font-medium">CONSTRAINTS</span>
                    <span className="text-slate-600"> - What should it NOT do? Keep it simple? No new files?</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                <p className="text-slate-700 font-medium mb-2">Example using the formula:</p>
                <p className="text-slate-600 font-mono text-sm">
                  "Add a delete button [WHAT] to each item in the task list on Dashboard.tsx [WHERE].
                  Use the existing deleteTask API endpoint [HOW].
                  Keep it simple, just a red trash icon, no confirmation modal [CONSTRAINTS]."
                </p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-slate-200 bg-white mb-4">
              <h3 className="text-lg font-bold text-slate-900 mb-3">More Good vs Bad Examples</h3>
              <div className="space-y-4">
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                    <p className="text-red-700 font-medium text-sm">BAD: "Make it look better"</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 font-medium text-sm">GOOD: "Change the header background to slate-900, make the logo larger (w-12), and add more padding (py-6)"</p>
                  </div>
                </div>
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                    <p className="text-red-700 font-medium text-sm">BAD: "Add a form"</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 font-medium text-sm">GOOD: "Add a contact form with name, email, and message fields. On submit, POST to /api/contact. Show a success toast. Clear the form after."</p>
                  </div>
                </div>
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                    <p className="text-red-700 font-medium text-sm">BAD: "Fix the bug"</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 font-medium text-sm">GOOD: "The save button does nothing when clicked. It should call saveData() and show a loading spinner while saving. Check the onClick handler in EditForm.tsx."</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-slate-200 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Power Phrases That Get Better Results</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700">"Keep it simple. Don't over-engineer this."</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700">"Use the existing pattern from [file]. Match that style."</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700">"Don't create new files unless absolutely necessary."</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700">"Before you code, tell me your plan."</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700">"Only change what I asked for. Don't refactor other code."</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700">"If you're unsure about anything, ask me first."</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                <p className="text-slate-700">
                  <strong>Remember:</strong> You're the boss. Claude works for you.
                  Tell it exactly what you want, how you want it, and what to avoid.
                  The more specific you are, the better the results.
                </p>
              </div>
            </Card>
          </div>

          {/* CLAUDE.MD */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Your CLAUDE.md File</h2>
            </div>

            <Card className="p-6 border-2 border-slate-200 bg-white">
              <p className="text-slate-700 mb-4">
                This file is your leverage. Claude reads it FIRST, every single session.
                Every instruction in there shapes how Claude works on YOUR project.
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700"><strong>Keep it short.</strong> Claude can only follow ~150 instructions well. Don't write a novel.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700"><strong>Make it specific.</strong> Don't explain what a "components folder" is. Tell it the WEIRD stuff about YOUR project.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700"><strong>Tell it WHY.</strong> "Use TypeScript strict mode because we've had bugs from implicit any types" beats "Use TypeScript strict mode."</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-slate-700"><strong>Update it constantly.</strong> Every time you correct Claude twice on the same thing = add it to CLAUDE.md.</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-slate-700">
                  <strong>Pro tip:</strong> Press # while working and Claude will add instructions to CLAUDE.md automatically.
                </p>
              </div>
            </Card>
          </div>

          {/* CONTEXT WINDOW */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">When To Clear & Reset</h2>
            </div>

            <Card className="p-6 border-2 border-slate-200 bg-white">
              <p className="text-slate-700 mb-4">
                Here's something most people don't know: Claude's quality starts dropping at about 30% of its context window.
                NOT 100%. Way before that.
              </p>
              <p className="text-slate-700 mb-4">
                If Claude starts giving you weird output, the conversation might be too long.
              </p>
              <div className="space-y-3 mb-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-slate-700 font-medium mb-1">The Reset Trick:</p>
                  <p className="text-slate-600">
                    1. Copy what's important from the terminal<br/>
                    2. Type <code className="bg-slate-200 px-1 rounded">/compact</code> to get a summary<br/>
                    3. Type <code className="bg-slate-200 px-1 rounded">/clear</code> to wipe the context<br/>
                    4. Paste back only what matters
                  </p>
                </div>
              </div>
              <p className="text-slate-700 font-medium">
                Rule: One conversation per feature. Don't build auth AND refactor the database in the same session. Contexts bleed together.
              </p>
            </Card>
          </div>

          {/* BAD INPUT BAD OUTPUT */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Bad Output = Bad Input</h2>
            </div>

            <Card className="p-6 border-2 border-slate-200 bg-white">
              <p className="text-slate-700 mb-4">
                If you're getting garbage results, the model isn't broken. Your input is.
              </p>
              <p className="text-slate-700 mb-4">
                Before you blame the AI, ask yourself:
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-700">Was I specific or vague?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-700">Did I give constraints or leave it wide open?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-700">Did I explain WHY I need this?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-700">Did I show an example of what good looks like?</span>
                </div>
              </div>
              <p className="text-slate-700 font-medium">
                Output comes from input. Full stop. Get better at communicating what you want.
              </p>
            </Card>
          </div>

          {/* WHEN STUCK */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">When Claude Gets Stuck</h2>
            </div>

            <Card className="p-6 border-2 border-slate-200 bg-white">
              <p className="text-slate-700 mb-4">
                Sometimes Claude loops. Same fix, same failure, over and over. Don't keep pushing. Change something.
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span className="text-slate-700"><strong>Clear the conversation.</strong> Type /clear. Fresh start.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span className="text-slate-700"><strong>Simplify the task.</strong> Break it into smaller pieces. Get each one working first.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span className="text-slate-700"><strong>Show, don't tell.</strong> Write a tiny example yourself. "Here's what I want. Apply this pattern."</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  <span className="text-slate-700"><strong>Reframe the problem.</strong> Ask for it differently. Sometimes Claude just needs a different angle.</span>
                </div>
              </div>
              <p className="text-slate-700 font-medium">
                If you've explained the same thing 3 times and Claude still doesn't get it - stop explaining. Change your approach.
              </p>
            </Card>
          </div>

          {/* WHEN THINGS BREAK */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">When Things Break</h2>
                <p className="text-slate-600">Your debugging escalation path</p>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-2 border-slate-200 overflow-hidden">
                <div className="flex items-start gap-4 p-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">1</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Tell Claude What's Wrong</h3>
                    <p className="text-slate-700">Be specific. What did you expect? What happened instead?</p>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mt-3">
                      <p className="text-sm font-mono text-slate-600">
                        "The login button doesn't work. When I click it, nothing happens. It should take me to the dashboard."
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-2 border-slate-200 overflow-hidden">
                <div className="flex items-start gap-4 p-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">2</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Didn't Work? Say So</h3>
                    <p className="text-slate-700">First fix didn't work? Tell Claude directly. Ask for a different approach.</p>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mt-3">
                      <p className="text-sm font-mono text-slate-600">
                        "That didn't work. Still broken. Try something different."
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-2 border-slate-200 overflow-hidden">
                <div className="flex items-start gap-4 p-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">3</div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clipboard className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-slate-900">Copy the Actual Error</h3>
                    </div>
                    <p className="text-slate-700 mb-3">Check two places:</p>
                    <div className="space-y-2">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <p className="text-slate-700"><strong>Preview window:</strong> Red error screens in your app</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <p className="text-slate-700"><strong>Browser console (F12):</strong> Red messages with file names and line numbers</p>
                      </div>
                    </div>
                    <p className="text-slate-700 mt-3">Copy the WHOLE error. More detail = better fix.</p>
                  </div>
                </div>
              </Card>

              <Card className="border-2 border-slate-200 overflow-hidden">
                <div className="flex items-start gap-4 p-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">4</div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-slate-900">Use Replit's Debug Button</h3>
                    </div>
                    <p className="text-slate-700 mb-3">
                      Still stuck? Look for "Debug with Agent" on error screens. Let Replit analyze it.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-slate-700">
                        <strong>Important:</strong> Use Replit for DIAGNOSIS only. Don't let it fix things.
                        Take what it found back to Claude Code.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-2 border-slate-200 overflow-hidden">
                <div className="flex items-start gap-4 p-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">5</div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-slate-900">Fix It & Prevent It Forever</h3>
                    </div>
                    <p className="text-slate-700 mb-3">Tell Claude what you found. Then make sure it never happens again:</p>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-sm font-mono text-slate-600">
                        "Replit found [X]. Fix this and add a rule to CLAUDE.md so you never make this mistake again."
                      </p>
                    </div>
                    <p className="text-slate-700 mt-3">Each bug you fix this way makes future bugs less likely. Your CLAUDE.md gets smarter.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* DAILY ROUTINE */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Your Daily Routine</h2>
            </div>

            <Card className="p-6 border-2 border-slate-200 bg-white mb-4">
              <p className="text-slate-700 font-medium mb-4">Every session, follow these 5 steps:</p>
              <ol className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Open Replit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>
                    Paste the{" "}
                    <a
                      href="/claude-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      INSTALL prompt <ExternalLink className="w-3 h-3" />
                    </a>{" "}
                    (installs Claude Code)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>
                    Paste the{" "}
                    <a
                      href="/claude-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      START prompt <ExternalLink className="w-3 h-3" />
                    </a>{" "}
                    (Claude catches up on your project)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  <span>Build stuff</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">5.</span>
                  <span>
                    Before closing, paste the{" "}
                    <a
                      href="/claude-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      END prompt <ExternalLink className="w-3 h-3" />
                    </a>{" "}
                    (saves everything)
                  </span>
                </li>
              </ol>
            </Card>

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
                <pre className="p-6 text-slate-700 whitespace-pre-wrap bg-white font-mono">
                  {INSTALL_COMMAND}
                </pre>
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

            <Card className="p-4 border-2 border-slate-200 bg-slate-50 mt-4">
              <p className="text-slate-600">
                <strong>Good news:</strong> Once you complete today, you'll unlock the <strong>Claude Code Guide</strong> in the sidebar for quick access to these prompts.
              </p>
            </Card>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("choose")}
          >
            Got It - Let's Build Something <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 1: Choose What to Build */}
      {step === "choose" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Pick Your Quick Win</h4>
            <p className="text-slate-600 mb-4">
              What ONE thing will make your app better today? Keep it small and achievable.
            </p>

            <div className="space-y-2 mb-4">
              {QUICK_WIN_IDEAS.map((idea) => (
                <div
                  key={idea}
                  onClick={() => {
                    setSelectedWin(idea);
                    setCustomWin("");
                  }}
                  className={selectedWin === idea && !customWin
                    ? "bg-white border-2 border-primary rounded-lg p-4 cursor-pointer"
                    : "bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-slate-300"}
                >
                  <div className="flex items-center gap-3">
                    <div className={selectedWin === idea && !customWin
                      ? "w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      : "w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center"}>
                      {selectedWin === idea && !customWin && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-slate-700">{idea}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <label className="text-slate-700 font-medium">Or describe your own:</label>
              <Input
                placeholder="I want to add..."
                value={customWin}
                onChange={(e) => {
                  setCustomWin(e.target.value);
                  setSelectedWin("");
                }}
                className="mt-2"
              />
            </div>
          </Card>

          {currentWin && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={handleStartBuild}
            >
              Let's Build This <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Build It */}
      {step === "build" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Your Mission</h4>
            <p className="text-slate-700 font-medium bg-white p-4 rounded-lg border border-slate-200">
              "{currentWin}"
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-4">How to Build It</h4>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <p className="text-slate-700 font-medium">Open Claude Code in your Replit project</p>
                  <p className="text-slate-600">Make sure you're in your app's directory</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <p className="text-slate-700 font-medium">Tell Claude Code exactly what you want</p>
                  <p className="text-slate-600">Be specific: "Add a [thing] that [does what] on the [where]"</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <p className="text-slate-700 font-medium">Test it immediately</p>
                  <p className="text-slate-600">Refresh your app and make sure it works</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">4</div>
                <div>
                  <p className="text-slate-700 font-medium">Iterate if needed</p>
                  <p className="text-slate-600">Not quite right? Tell Claude Code what to change</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-600">
              <strong>Pro tip:</strong> If something breaks, don't panic. Tell Claude Code: "That broke [describe what's wrong]. Please fix it."
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={handleBuildComplete}
          >
            I Built It!
          </Button>
        </>
      )}

      {/* Step 3: Capture the Win */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Congratulations!</h4>
            <p className="text-slate-700">
              You just used AI to build something real. This is exactly how professional developers work now.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Document Your Win</h4>
            <p className="text-slate-600 mb-4">
              Describe what you built. This goes in your Build Log as proof of progress.
            </p>
            <Textarea
              placeholder="Today I added... It works by... The result is..."
              value={whatYouBuilt}
              onChange={(e) => setWhatYouBuilt(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-slate-600 mt-2">
              Be specific! Future you will appreciate the details.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div>
              <p className="text-slate-700 font-medium">What you learned today:</p>
              <ul className="mt-2 space-y-1">
                <li className="text-slate-600">- Claude Code can build features for you</li>
                <li className="text-slate-600">- Being specific gets better results</li>
                <li className="text-slate-600">- You can iterate until it's right</li>
                <li className="text-slate-600">- Breaking things is normal - just fix them</li>
              </ul>
            </div>
          </Card>

          {whatYouBuilt.length >= 20 && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ firstBuild: currentWin, whatYouBuilt })}
            >
              Save My Win & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {whatYouBuilt.length > 0 && whatYouBuilt.length < 20 && (
            <p className="text-slate-600 text-center">
              Add a bit more detail ({20 - whatYouBuilt.length} more characters)
            </p>
          )}
        </>
      )}
    </div>
  );
}
