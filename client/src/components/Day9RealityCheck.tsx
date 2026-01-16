import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft, Copy, Check, AlertCircle, Bug, Wrench, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Day9RealityCheckProps {
  userIdea: string;
  onComplete: (data: {
    bugFound: string;
    bugDescription: string;
    fixApplied: string;
    loopLearned: boolean;
  }) => void;
}

export function Day9RealityCheck({ userIdea, onComplete }: Day9RealityCheckProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"intro" | "find" | "describe" | "fix" | "verify">("intro");
  const [bugFound, setBugFound] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [fixApplied, setFixApplied] = useState("");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const fixPrompt = `I found a bug in my app. Here's what's happening:

**What I expected:** ${bugFound ? bugFound.split('\n')[0] || '[expected behavior]' : '[expected behavior]'}

**What actually happens:** ${bugDescription || '[actual behavior]'}

Please help me:
1. Find the root cause
2. Fix the issue
3. Explain what was wrong so I learn from it

Start by asking me any clarifying questions if needed.`;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h3 className="text-2xl font-extrabold text-slate-900">The Build-Test-Fix Loop</h3>
            <p className="text-slate-600 mt-2">
              This is the most important skill you'll learn. Every successful builder does this hundreds of times:
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Wrench className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">BUILD</span>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300" />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <Bug className="w-8 h-8 text-amber-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">TEST</span>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300" />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">FIX</span>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300" />
              <div className="flex flex-col items-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                  <span className="text-lg">🔄</span>
                </div>
                <span className="text-xs font-bold">REPEAT</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-blue-200 bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>Today's goal:</strong> Find ONE bug in your app and fix it using Claude Code. You'll learn the exact process you'll repeat every time you build.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("find")}
          >
            Let's Find a Bug <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 1: Find a Bug */}
      {step === "find" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Bug className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Step 1: Find ONE Bug</h4>
                <p className="text-sm text-slate-500">Open your app and look for something broken</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-slate-700">Quick bug-hunting checklist:</p>
              <div className="grid gap-2">
                {[
                  "Click every button - does each one do something?",
                  "Submit a form with empty fields - does it handle it?",
                  "Try the main feature - does it actually work?",
                  "Refresh the page - does your data stay?",
                  "Look at the design - anything ugly or broken?",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded text-sm text-slate-700">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-900">What bug did you find?</label>
              <Textarea
                placeholder="Example: When I click the 'Save' button, nothing happens. The button doesn't respond at all."
                value={bugFound}
                onChange={(e) => setBugFound(e.target.value)}
                className="min-h-[100px] bg-white"
              />
              <p className="text-xs text-slate-500">
                Can't find a bug? That's actually great! Pick something that could be BETTER instead - a missing feature, confusing text, or ugly design.
              </p>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("intro")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("describe")}
              disabled={bugFound.length < 10}
            >
              I Found Something <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Describe the Bug */}
      {step === "describe" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Step 2: Describe It Clearly</h4>
                <p className="text-sm text-slate-500">The better you describe it, the faster AI fixes it</p>
              </div>
            </div>

            <Card className="p-4 border-2 border-amber-200 bg-amber-50 mb-6">
              <p className="text-sm text-amber-800">
                <strong>The #1 mistake:</strong> Vague descriptions like "it's broken" or "it doesn't work."
                Claude Code needs specifics to help you.
              </p>
            </Card>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Your bug:</p>
                <p className="text-sm text-slate-700">{bugFound}</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900">Now describe EXACTLY what happens:</label>
                <Textarea
                  placeholder="Be specific:
- What steps cause the bug?
- What do you see on screen?
- Any error messages?
- What SHOULD happen instead?"
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  className="min-h-[120px] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-bold text-red-700 mb-1">❌ Bad description:</p>
                  <p className="text-red-600 text-xs">"The button is broken"</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-bold text-green-700 mb-1">✅ Good description:</p>
                  <p className="text-green-600 text-xs">"When I click Save, the page refreshes but data isn't saved to the database"</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("find")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("fix")}
              disabled={bugDescription.length < 20}
            >
              Ready to Fix <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Fix It */}
      {step === "fix" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Step 3: Fix It with Claude Code</h4>
                <p className="text-sm text-slate-500">Copy this prompt and paste it into Claude Code</p>
              </div>
            </div>

            <div className="relative">
              <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 whitespace-pre-wrap">
                {fixPrompt}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={() => copyToClipboard(fixPrompt)}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-bold text-slate-700">After Claude Code fixes it, describe what changed:</p>
              <Textarea
                placeholder="What did Claude Code change to fix the issue? (This helps you learn for next time)"
                value={fixApplied}
                onChange={(e) => setFixApplied(e.target.value)}
                className="min-h-[80px] bg-white"
              />
            </div>
          </Card>

          <Card className="p-4 border-2 border-blue-200 bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>Pro tip:</strong> If Claude Code's first fix doesn't work, tell it! Say "That didn't fix it, here's what I still see..." - iteration is normal.
            </p>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("describe")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("verify")}
              disabled={fixApplied.length < 10}
            >
              I Fixed It <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Verify */}
      {step === "verify" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">You just completed the loop!</h4>
                <p className="text-sm text-green-700">BUILD → TEST → FIX → REPEAT</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-4">What You Just Learned</h4>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">How to find bugs</p>
                  <p className="text-sm text-slate-600">Click everything, try to break it, check edge cases</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">How to describe bugs to AI</p>
                  <p className="text-sm text-slate-600">Specific steps, expected vs actual, error messages</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">How to fix with Claude Code</p>
                  <p className="text-sm text-slate-600">Clear prompt → let it fix → verify → iterate if needed</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-700">
              <strong>Remember:</strong> You'll do this loop MANY times. Finding bugs isn't failure - it's progress. The faster you find and fix them, the faster you ship.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => onComplete({
              bugFound,
              bugDescription,
              fixApplied,
              loopLearned: true
            })}
          >
            Complete Day 9 <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
