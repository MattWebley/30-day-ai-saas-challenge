import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ArrowRight,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";

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
  const [step, setStep] = useState<"choose" | "build" | "done">("choose");
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
      <div className={ds.cardWithPadding}>
        <h3 className="text-2xl font-extrabold text-slate-900">Your First Build Win</h3>
        <p className={ds.body + " mt-1"}>Today you'll add ONE thing to your app using Claude Code.</p>
      </div>

      {/* Why Claude Code - Cost Warning */}
      <div className={ds.infoBoxHighlight}>
        <h3 className={ds.heading + " mb-2"}>Why Claude Code? It'll Save You THOUSANDS.</h3>
        <p className={ds.body + " mb-3"}>
          You CAN just use Replit's built-in AI agent on its own - it's easier to get started. But here's the truth:
          <strong> it gets VERY expensive, VERY fast.</strong>
        </p>
        <p className={ds.body}>
          Using Claude Code in the Replit shell drops your development costs by thousands of dollars.
          Same power, fraction of the price. The workflow below is how I teach my 1:1 mentorship clients to do it.
        </p>
      </div>

      {/* Simple Workflow Section */}
      <div className={ds.cardWithPadding}>
        <div className="mb-4">
          <h3 className={ds.heading}>Your Daily Build Routine</h3>
          <p className={ds.body}>3 prompts. Copy, paste, build. That's it.</p>
        </div>

        <div className={ds.infoBoxHighlight + " mb-6"}>
          <p className={ds.body}>
            <strong>Here's the deal:</strong> Every time you open Replit, you'll paste these 3 prompts.
            The first one installs Claude Code. The second tells Claude what you're working on.
            The third saves your work before you close. <strong>Never lose progress. Never start from scratch.</strong>
          </p>
        </div>

        <div className="space-y-6">
          {/* Daily Prompts */}
          <div>
            <h4 className={ds.label + " mb-3"}>Copy These 3 Prompts:</h4>
            <div className="space-y-4">
              {/* Install Command */}
              <div className={ds.card + " overflow-hidden"}>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                  <div>
                    <span className={ds.label}>Step 1: Install Claude Code</span>
                    <span className={ds.muted + " ml-2"}>(Run this EVERY session - Replit resets!)</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(INSTALL_COMMAND, "Install command")}
                    className="gap-2 bg-white"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <pre className={ds.muted + " p-4 whitespace-pre-wrap bg-white font-mono"}>
                  {INSTALL_COMMAND}
                </pre>
              </div>

              {/* Kickoff Prompt */}
              <div className={ds.card + " overflow-hidden"}>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                  <span className={ds.label}>Step 2: Session START Prompt</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(KICKOFF_PROMPT, "Kickoff prompt")}
                    className="gap-2 bg-white"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <pre className={ds.muted + " p-4 whitespace-pre-wrap bg-white font-mono"}>
                  {KICKOFF_PROMPT}
                </pre>
              </div>

              {/* Wrap-up Prompt */}
              <div className={ds.card + " overflow-hidden"}>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                  <span className={ds.label}>Step 3: Session END Prompt</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(WRAPUP_PROMPT, "Wrap-up prompt")}
                    className="gap-2 bg-white"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <pre className={ds.muted + " p-4 whitespace-pre-wrap bg-white font-mono"}>
                  {WRAPUP_PROMPT}
                </pre>
              </div>
            </div>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.muted}>
              <strong>That's it.</strong> Do this every time you open Replit and Claude will remember everything about your project.
              No more explaining from scratch. No more lost work.
            </p>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.muted}>
              <strong>Good news:</strong> Once you complete today, you'll unlock the <strong>Claude Code Guide</strong> in the menu.
              It has all 3 prompts in one place so you can easily copy them every session.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Choose What to Build */}
      {step === "choose" && (
        <>
          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-2"}>Pick Your Quick Win</h4>
            <p className={ds.muted + " mb-4"}>
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
                  className={selectedWin === idea && !customWin ? ds.optionSelected : ds.optionDefault}
                >
                  <div className="flex items-center gap-3">
                    <div className={selectedWin === idea && !customWin ? ds.checkSelected : ds.checkDefault}>
                      {selectedWin === idea && !customWin && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={ds.muted}>{idea}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <label className={ds.label}>Or describe your own:</label>
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
          </div>

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
          <div className={ds.infoBoxHighlight}>
            <h4 className={ds.heading + " mb-4"}>Your Mission</h4>
            <p className={ds.label + " bg-white p-4 rounded-lg border border-slate-200"}>
              "{currentWin}"
            </p>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-4"}>How to Build It</h4>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className={ds.stepCircle + " shrink-0"}>1</div>
                <div>
                  <p className={ds.label}>Open Claude Code in your Replit project</p>
                  <p className={ds.muted}>Make sure you're in your app's directory</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={ds.stepCircle + " shrink-0"}>2</div>
                <div>
                  <p className={ds.label}>Tell Claude Code exactly what you want</p>
                  <p className={ds.muted}>Be specific: "Add a [thing] that [does what] on the [where]"</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={ds.stepCircle + " shrink-0"}>3</div>
                <div>
                  <p className={ds.label}>Test it immediately</p>
                  <p className={ds.muted}>Refresh your app and make sure it works</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={ds.stepCircle + " shrink-0"}>4</div>
                <div>
                  <p className={ds.label}>Iterate if needed</p>
                  <p className={ds.muted}>Not quite right? Tell Claude Code what to change</p>
                </div>
              </div>
            </div>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.muted}>
              <strong>Pro tip:</strong> If something breaks, don't panic. Tell Claude Code: "That broke [describe what's wrong]. Please fix it."
            </p>
          </div>

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
          <div className={ds.infoBoxHighlight}>
            <h4 className={ds.heading + " mb-2"}>Congratulations!</h4>
            <p className={ds.body}>
              You just used AI to build something real. This is exactly how professional developers work now.
            </p>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-2"}>Document Your Win</h4>
            <p className={ds.muted + " mb-4"}>
              Describe what you built. This goes in your Build Log as proof of progress.
            </p>
            <Textarea
              placeholder="Today I added... It works by... The result is..."
              value={whatYouBuilt}
              onChange={(e) => setWhatYouBuilt(e.target.value)}
              className="min-h-[120px]"
            />
            <p className={ds.muted + " mt-2"}>
              Be specific! Future you will appreciate the details.
            </p>
          </div>

          <div className={ds.infoBoxHighlight}>
            <div>
              <p className={ds.label}>What you learned today:</p>
              <ul className="mt-2 space-y-1">
                <li className={ds.muted}>- Claude Code can build features for you</li>
                <li className={ds.muted}>- Being specific gets better results</li>
                <li className={ds.muted}>- You can iterate until it's right</li>
                <li className={ds.muted}>- Breaking things is normal - just fix them</li>
              </ul>
            </div>
          </div>

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
            <p className={ds.muted + " text-center"}>
              Add a bit more detail ({20 - whatYouBuilt.length} more characters)
            </p>
          )}
        </>
      )}
    </div>
  );
}
