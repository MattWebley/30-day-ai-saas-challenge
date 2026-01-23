import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Terminal,
  CheckCircle2,
  MousePointer,
  Chrome,
  Sparkles,
  ListChecks,
  Wrench,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";

interface Day17AutonomousTestingProps {
  appName: string;
  onComplete: (data: { testingComplete: boolean; issuesFound: string }) => void;
}

const TEST_AREAS = [
  { id: "signup", label: "Sign up / Login flow", description: "Can new users create an account and log in?" },
  { id: "main-feature", label: "Main feature", description: "Does the core thing your app does actually work?" },
  { id: "happy-path", label: "Happy path", description: "If a user does everything right, does it work?" },
  { id: "navigation", label: "Basic navigation", description: "Can you get to the main pages without getting lost?" },
  { id: "mobile", label: "Mobile check", description: "Does it work on your phone?" },
];

export function Day17AutonomousTesting({ appName, onComplete }: Day17AutonomousTestingProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "intro" | "methods" | "test" | "fix" | "done"
  >("intro");

  const [testedAreas, setTestedAreas] = useState<Set<string>>(new Set());
  const [issuesFound, setIssuesFound] = useState("");
  const [issuesFixed, setIssuesFixed] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const toggleArea = (id: string) => {
    const newSet = new Set(testedAreas);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setTestedAreas(newSet);
  };

  const hasIssues = issuesFound.trim().length > 10;

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
                <MousePointer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Test Everything</h3>
                <p className={ds.muted}>Click every button. Fill every form. Break things on purpose.</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Tomorrow is MVP day. Before you ship, you want to make sure the <strong>important stuff</strong> works.
              </p>

              <p className={ds.body}>
                Here's a truth about building a business - you WILL ship with bugs. You can't find them all. The only way to find every edge case is with REAL users using your app in ways you'd never think of.
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>The goal</strong> - Make sure your core features work. Fix the obvious stuff. Then ship it and let beta testers find the rest.
                </p>
              </div>

              <p className={ds.muted}>
                Perfect is the enemy of shipped. A working MVP with minor bugs beats a "perfect" app that never launches.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep("methods")} className="gap-2">
              Let's Do It <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Methods */}
      {step === "methods" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Your Testing Options</h3>
                <p className={ds.muted}>Pick whichever works for you</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Option 1: Replit */}
              <div className="p-4 border-2 border-slate-200 rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 font-bold text-sm">R</span>
                  </div>
                  <div>
                    <p className={ds.label}>Replit Autonomous Agent</p>
                    <p className={ds.muted + " mt-1"}>
                      Replit Autonomous Agent can test your app for you. Just tell it "Test my entire app and report any bugs you find." It'll click through everything and tell you what's broken.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Claude for Chrome */}
              <div className="p-4 border-2 border-slate-200 rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Chrome className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className={ds.label}>Claude for Chrome Extension</p>
                    <p className={ds.muted + " mt-1"}>
                      Install the Claude browser extension. Open your app, then ask Claude to "look at this page and tell me if anything seems broken or could be improved." It can see your screen and spot issues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Manual */}
              <div className="p-4 border-2 border-slate-200 rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MousePointer className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className={ds.label}>Manual Testing (Always Do This Too)</p>
                    <p className={ds.muted + " mt-1"}>
                      Nothing beats actually using your app. Click every button. Fill every form. Try to break it. Pretend you're a confused user who does everything wrong.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className={ds.body + " text-amber-900"}>
                  <strong>Best approach?</strong> Use all three. Let Replit or Claude find the obvious stuff, then manually test the important flows yourself.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("intro")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("test")} className="gap-2">
              Start Testing <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Test Checklist */}
      {step === "test" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Test Checklist</h3>
                <p className={ds.muted}>Go through each area. Check it off when tested.</p>
              </div>
            </div>

            <div className="space-y-3">
              {TEST_AREAS.map((area) => (
                <div
                  key={area.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    testedAreas.has(area.id)
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => toggleArea(area.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={testedAreas.has(area.id)}
                      onCheckedChange={() => toggleArea(area.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className={ds.label}>{area.label}</p>
                      <p className={ds.muted}>{area.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {testedAreas.size >= 5 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  {testedAreas.size}/{TEST_AREAS.length} areas tested
                </p>
              </div>
            )}
          </div>

          <div className={ds.cardWithPadding}>
            <p className={ds.label + " mb-3"}>Issues Found</p>
            <p className={ds.muted + " mb-3"}>
              Write down everything that's broken, weird, or confusing. Be specific.
            </p>
            <Textarea
              placeholder="- Button X doesn't do anything
- Form Y shows error but doesn't say why
- Page Z takes forever to load
- On mobile, can't tap the menu
- When I submit empty, it crashes..."
              value={issuesFound}
              onChange={(e) => setIssuesFound(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("methods")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep(hasIssues ? "fix" : "done")}
              disabled={testedAreas.size < 5}
              className="gap-2"
            >
              {hasIssues ? "Fix Issues" : "All Good!"} <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Fix Issues */}
      {step === "fix" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Fix What You Found</h3>
                <p className={ds.muted}>Better to fix now than have users find these</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-bold text-amber-800 mb-2">This is normal</p>
                <p className={ds.body + " text-amber-800"}>
                  Every app has bugs before testing. You're doing exactly what professional developers do - find issues and fix them before shipping.
                </p>
              </div>

              <div className={ds.cardWithPadding + " bg-slate-50"}>
                <p className={ds.label + " mb-2"}>Your issues to fix</p>
                <p className={ds.body + " whitespace-pre-wrap"}>{issuesFound}</p>
              </div>

              <div className="relative">
                <p className={ds.label + " mb-2"}>Copy this to Claude Code</p>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
{`Fix these issues I found while testing:

${issuesFound}

Go through each one and fix it. After fixing, tell me what you changed.`}
                </pre>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(`Fix these issues I found while testing:\n\n${issuesFound}\n\nGo through each one and fix it. After fixing, tell me what you changed.`, "Fix prompt")}
                  className="absolute top-8 right-2 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>

              <div
                className={issuesFixed ? ds.optionSelected : ds.optionDefault}
                onClick={() => setIssuesFixed(!issuesFixed)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={issuesFixed} onCheckedChange={() => setIssuesFixed(!issuesFixed)} />
                  <span className={ds.body + " font-medium"}>I've fixed the issues (or noted them for later)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("test")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("done")} disabled={!issuesFixed} className="gap-2">
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Done */}
      {step === "done" && (
        <>
          <div className="p-6 border-2 border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">Ready to Ship!</h4>
                <p className="text-green-700">
                  The important stuff works. That's what matters.
                </p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="space-y-4">
              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>Here's the truth.</strong> Your app probably still has bugs. Every app does at launch. The difference is - your CORE features work. That's enough to ship.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className={ds.label + " mb-2 text-blue-900"}>What happens next</p>
                <p className={ds.body + " text-blue-800"}>
                  Real users will find bugs you never thought of. That's not failure - that's how software works. Get a few beta testers, fix what they find, repeat. Your app gets better with every user.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className={ds.body + " mb-2"}>
                  <strong>There's no such thing as 100% bug-free software.</strong>
                </p>
                <p className={ds.muted}>
                  Google, Apple, Microsoft - they all ship bugs. Every single day. The difference? They fix them fast. That's your job too. Ship it, then be ready to fix what users find.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("test")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => onComplete({ testingComplete: true, issuesFound: issuesFound || "No issues found" })}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              Complete Day <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
