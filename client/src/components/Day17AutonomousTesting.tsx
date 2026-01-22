import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ArrowRight,
  Copy,
  Terminal,
  CheckCircle2,
  FlaskConical,
  Play,
  Bug,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";

interface Day17AutonomousTestingProps {
  appName: string;
  onComplete: (data: { testingSetup: boolean; coreFeatureTested: string }) => void;
}

export function Day17AutonomousTesting({ appName, onComplete }: Day17AutonomousTestingProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "intro" | "identify" | "write" | "run" | "fix" | "done"
  >("intro");

  const [coreFeature, setCoreFeature] = useState("");
  const [testWritten, setTestWritten] = useState(false);
  const [testRan, setTestRan] = useState(false);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [bugFixed, setBugFixed] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const writeTestPrompt = `Write an automated test for my app's core feature:

${coreFeature || "[Describe your core feature above first]"}

The test should:
1. Set up any required test data
2. Perform the main action a user would take
3. Verify the expected result happened
4. Clean up after itself

Use whatever testing framework makes sense for my stack. Make the test simple and focused on the ONE most important thing.`;

  const runTestPrompt = `Run the test you just wrote and show me the results. If it fails, explain what went wrong.`;

  const fixTestPrompt = `The test failed. Here's what happened:

[Paste the error or describe what went wrong]

Fix the issue so the test passes. Don't just change the test to pass - fix the actual bug in the code.`;

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

      {/* Intro */}
      {step === "intro" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Autonomous Testing</h3>
                <p className={ds.muted}>Let Claude Code test your app for you</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Here's a superpower most builders don't know about...
              </p>

              <p className={ds.body}>
                Instead of manually clicking through your app to check if things work, you can have Claude Code write tests that do it automatically. Every time. In seconds.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Why this matters</strong> - Before you ship your MVP tomorrow, you want to KNOW your core feature works. Not hope. Not "I think so." KNOW.
                </p>
              </div>

              <p className={ds.body}>
                Today you'll write ONE test for your most important feature. When it passes, you'll have confidence your app actually works.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep("identify")} className="gap-2">
              Let's Do It <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 1: Identify core feature */}
      {step === "identify" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 1: What's Your Core Feature?</h3>
                <p className={ds.muted}>The ONE thing your app absolutely must do</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Describe the main thing a user does in your app. Be specific about what happens.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>Examples</p>
                <ul className={ds.muted + " mt-2 space-y-1 list-disc list-inside"}>
                  <li>"User enters a topic, clicks generate, and gets 5 blog post ideas"</li>
                  <li>"User uploads a CSV, the app parses it and shows a chart"</li>
                  <li>"User creates a project, adds tasks, marks them complete"</li>
                  <li>"User enters their food, the app calculates calories and saves it"</li>
                </ul>
              </div>

              <Textarea
                placeholder="When a user does [action], my app should [result]..."
                value={coreFeature}
                onChange={(e) => setCoreFeature(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("intro")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("write")} disabled={coreFeature.length < 20} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Write the test */}
      {step === "write" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 2: Have Claude Write the Test</h3>
                <p className={ds.muted}>Copy this prompt into Claude Code</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap">
{writeTestPrompt}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(writeTestPrompt.replace("[Describe your core feature above first]", coreFeature), "Claude Code prompt")}
                  className="absolute top-2 right-2 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>What Claude will do</p>
                <p className={ds.muted + " mt-1"}>
                  Claude will create a test file and write code that automatically tests your feature. You don't need to understand the test code - just let Claude write it.
                </p>
              </div>

              <div
                className={testWritten ? ds.optionSelected : ds.optionDefault}
                onClick={() => setTestWritten(!testWritten)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={testWritten} onCheckedChange={() => setTestWritten(!testWritten)} />
                  <span className={ds.body + " font-medium"}>Claude has written my test</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("identify")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("run")} disabled={!testWritten} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Run the test */}
      {step === "run" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 3: Run the Test</h3>
                <p className={ds.muted}>See if your core feature actually works</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap">
{runTestPrompt}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(runTestPrompt, "Claude Code prompt")}
                  className="absolute top-2 right-2 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>

              <div
                className={testRan ? ds.optionSelected : ds.optionDefault}
                onClick={() => setTestRan(!testRan)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={testRan} onCheckedChange={() => setTestRan(!testRan)} />
                  <span className={ds.body + " font-medium"}>I've run the test</span>
                </div>
              </div>

              {testRan && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <p className={ds.label}>Did it pass?</p>
                  <div className="flex gap-3">
                    <Button
                      variant={testPassed === true ? "default" : "outline"}
                      className="flex-1 gap-2"
                      onClick={() => setTestPassed(true)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Yes, it passed!
                    </Button>
                    <Button
                      variant={testPassed === false ? "destructive" : "outline"}
                      className="flex-1 gap-2"
                      onClick={() => setTestPassed(false)}
                    >
                      <Bug className="w-4 h-4" />
                      No, it failed
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("write")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            {testPassed === true && (
              <Button size="lg" onClick={() => setStep("done")} className="gap-2">
                Next <ArrowRight className="w-5 h-5" />
              </Button>
            )}
            {testPassed === false && (
              <Button size="lg" onClick={() => setStep("fix")} className="gap-2">
                Fix the Bug <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </>
      )}

      {/* Step 4: Fix if failed */}
      {step === "fix" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Step 4: Fix the Bug</h3>
                <p className={ds.muted}>This is exactly why we test</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <p className="font-bold text-amber-800 mb-2">Good news!</p>
                <p className={ds.body + " text-amber-800"}>
                  You found a bug BEFORE shipping. That's the whole point. Better you find it now than your users find it later.
                </p>
              </div>

              <div className="relative">
                <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono border border-slate-200 whitespace-pre-wrap">
{fixTestPrompt}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(fixTestPrompt, "Claude Code prompt")}
                  className="absolute top-2 right-2 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>The loop</p>
                <ol className={ds.muted + " mt-2 space-y-1 list-decimal list-inside"}>
                  <li>Tell Claude what went wrong</li>
                  <li>Claude fixes the code</li>
                  <li>Run the test again</li>
                  <li>Repeat until it passes</li>
                </ol>
              </div>

              <div
                className={bugFixed ? ds.optionSelected : ds.optionDefault}
                onClick={() => setBugFixed(!bugFixed)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={bugFixed} onCheckedChange={() => setBugFixed(!bugFixed)} />
                  <span className={ds.body + " font-medium"}>I fixed the bug and the test passes now</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("run")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("done")} disabled={!bugFixed} className="gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Done */}
      {step === "done" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Your Core Feature is Tested!</h3>
                <p className={ds.muted}>You KNOW it works</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-800 mb-2">This is huge</p>
                <p className={ds.body + " text-green-800"}>
                  You now have a test that proves your core feature works. You can run it anytime to make sure you haven't broken anything.
                </p>
              </div>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>Pro tip</p>
                <p className={ds.muted + " mt-1"}>
                  Before making big changes, run your tests. If they pass after your changes, you haven't broken anything. This is how the pros build with confidence.
                </p>
              </div>

              <div className={ds.cardWithPadding + " bg-slate-50"}>
                <p className={ds.label + " mb-2"}>What you tested</p>
                <p className={ds.body}>{coreFeature}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={() => onComplete({ testingSetup: true, coreFeatureTested: coreFeature })}
              className="gap-2"
            >
              Complete Day <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
