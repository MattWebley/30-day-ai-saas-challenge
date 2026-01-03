import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Terminal,
  Zap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Trophy,
  Copy,
  FileText,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon
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

export function Day8ClaudeCode({ userIdea, onComplete }: Day8ClaudeCodeProps) {
  const [step, setStep] = useState<"choose" | "build" | "done">("choose");
  const [selectedWin, setSelectedWin] = useState("");
  const [customWin, setCustomWin] = useState("");
  const [whatYouBuilt, setWhatYouBuilt] = useState("");
  const [showWorkflow, setShowWorkflow] = useState(false);
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
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Your First Build Win</h3>
            <p className="text-slate-600 mt-1">Today you'll add ONE thing to your app using Claude Code.</p>
          </div>
        </div>
      </Card>

      {/* Pro Workflow Section */}
      <Card className="border-2 border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => setShowWorkflow(!showWorkflow)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-violet-600" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-900">The Pro Workflow (CLAUDE.md + GitHub)</h4>
              <p className="text-sm text-slate-500">Safe, organized sessions with automatic context</p>
            </div>
          </div>
          {showWorkflow ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showWorkflow && (
          <div className="p-6 pt-2 space-y-6 border-t border-slate-100">
            {/* What is CLAUDE.md */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <h5 className="font-semibold text-slate-900">What is CLAUDE.md?</h5>
              </div>
              <p className="text-sm text-slate-600">
                A file in your project root that stores project rules, context, tech stack, and session logs.
                Claude reads it at the start of each session so you never have to repeat yourself.
              </p>
            </div>

            {/* Safety Rules */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-900 mb-2">Key Safety Rules</h5>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• <strong>Commit before editing</strong> - Always save working code first</li>
                <li>• <strong>Branch for risky changes</strong> - New branch if it might break things</li>
                <li>• <strong>Never remove working features</strong> - Unless explicitly asked</li>
                <li>• <strong>Update session log daily</strong> - Track what you did and discovered</li>
              </ul>
            </div>

            {/* Daily Prompts */}
            <div className="space-y-4">
              {/* Kickoff Prompt */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-sm text-slate-900">Session Start Prompt</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(KICKOFF_PROMPT, "Kickoff prompt")}
                    className="h-7 gap-1 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
                <pre className="p-3 text-xs text-slate-700 whitespace-pre-wrap bg-white font-mono">
                  {KICKOFF_PROMPT}
                </pre>
              </div>

              {/* Wrap-up Prompt */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-sm text-slate-900">Session End Prompt</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(WRAPUP_PROMPT, "Wrap-up prompt")}
                    className="h-7 gap-1 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
                <pre className="p-3 text-xs text-slate-700 whitespace-pre-wrap bg-white font-mono">
                  {WRAPUP_PROMPT}
                </pre>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">
              Use these prompts every session. Claude will handle git, context, and progress tracking automatically.
            </p>
          </div>
        )}
      </Card>

      {/* Step 1: Choose What to Build */}
      {step === "choose" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Pick Your Quick Win</h4>
            <p className="text-sm text-slate-600 mb-4">
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
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedWin === idea && !customWin
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedWin === idea && !customWin ? "border-primary bg-primary" : "border-slate-300"
                    }`}>
                      {selectedWin === idea && !customWin && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">{idea}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <label className="text-sm font-medium text-slate-700">Or describe your own:</label>
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
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">Your Mission</h4>
            </div>
            <p className="text-lg font-medium text-slate-800 bg-white p-4 rounded-lg border border-slate-200">
              "{currentWin}"
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">How to Build It</h4>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Open Claude Code in your Replit project</p>
                  <p className="text-sm text-slate-600">Make sure you're in your app's directory</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Tell Claude Code exactly what you want</p>
                  <p className="text-sm text-slate-600">Be specific: "Add a [thing] that [does what] on the [where]"</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Test it immediately</p>
                  <p className="text-sm text-slate-600">Refresh your app and make sure it works</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Iterate if needed</p>
                  <p className="text-sm text-slate-600">Not quite right? Tell Claude Code what to change</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800">
              <strong>Pro tip:</strong> If something breaks, don't panic. Tell Claude Code: "That broke [describe what's wrong]. Please fix it."
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={handleBuildComplete}
          >
            <CheckCircle2 className="w-5 h-5" />
            I Built It!
          </Button>
        </>
      )}

      {/* Step 3: Capture the Win */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">Congratulations!</h4>
            </div>
            <p className="text-slate-700">
              You just used AI to build something real. This is exactly how professional developers work now.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Document Your Win</h4>
            <p className="text-sm text-slate-600 mb-4">
              Describe what you built. This goes in your Build Log as proof of progress.
            </p>
            <Textarea
              placeholder="Today I added... It works by... The result is..."
              value={whatYouBuilt}
              onChange={(e) => setWhatYouBuilt(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-slate-500 mt-2">
              Be specific! Future you will appreciate the details.
            </p>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium">What you learned today:</p>
                <ul className="mt-2 space-y-1 text-slate-600">
                  <li>• Claude Code can build features for you</li>
                  <li>• Being specific gets better results</li>
                  <li>• You can iterate until it's right</li>
                  <li>• Breaking things is normal - just fix them</li>
                </ul>
              </div>
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
            <p className="text-sm text-slate-500 text-center">
              Add a bit more detail ({20 - whatYouBuilt.length} more characters)
            </p>
          )}
        </>
      )}
    </div>
  );
}
