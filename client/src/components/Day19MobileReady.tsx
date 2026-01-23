import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Smartphone,
  Zap,
  CheckCircle2,
  Wrench
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ds } from "@/lib/design-system";

interface Day19MobileReadyProps {
  appName: string;
  onComplete: (data: { testedOnPhone: boolean; mobileIssues: string }) => void;
}

const MOBILE_TESTS = [
  {
    id: "load",
    text: "App loads on phone",
    critical: true,
    fixPrompt: "My app won't load on mobile - I just see a blank screen or error. Check for JavaScript errors in the console, make sure all routes work, and verify there are no mobile-specific bugs breaking the app."
  },
  {
    id: "read",
    text: "Text is readable (no zooming needed)",
    critical: true,
    fixPrompt: "The text on my app is too small on mobile. Make all body text at least 16px and ensure good contrast. No one should need to zoom to read."
  },
  {
    id: "buttons",
    text: "Buttons are easy to tap",
    critical: true,
    fixPrompt: "The buttons on my app are too small to tap on mobile. Make all clickable elements at least 44px tall with enough spacing between them so users don't accidentally tap the wrong thing."
  },
  {
    id: "scroll",
    text: "No weird horizontal scrolling",
    critical: true,
    fixPrompt: "My app has horizontal scrolling on mobile which shouldn't be there. Fix the layout so everything fits within the screen width. No element should overflow horizontally."
  },
  {
    id: "forms",
    text: "Forms work with mobile keyboard",
    critical: true,
    fixPrompt: "The forms on my app don't work well with mobile keyboards. Make sure input fields are visible when the keyboard opens, use appropriate input types (email, tel, number), and the form doesn't break when typing."
  },
  {
    id: "main-feature",
    text: "Main feature works on mobile",
    critical: true,
    fixPrompt: "The main feature of my app doesn't work properly on mobile. Test it at 375px width and fix whatever is broken so users can complete the core action on their phone."
  },
  {
    id: "looks-good",
    text: "Generally looks good",
    critical: false,
    fixPrompt: "My app doesn't look good on mobile. Review the mobile layout and fix any visual issues - spacing, alignment, text overflow, images that are too big or too small."
  },
];

const PERFORMANCE_TESTS = [
  {
    id: "initial-load",
    text: "First page loads in under 3 seconds",
    critical: true,
    fixPrompt: "My app takes too long on the first load. Add code splitting and lazy load routes that aren't needed immediately. The user should see something useful within 3 seconds."
  },
  {
    id: "navigation",
    text: "Clicking around feels instant",
    critical: true,
    fixPrompt: "Navigation in my app feels sluggish. Make sure page transitions are instant - use client-side routing, prefetch links on hover, and avoid full page reloads."
  },
  {
    id: "loading-states",
    text: "Loading states shown while waiting",
    critical: true,
    fixPrompt: "My app feels frozen when loading data. Add loading spinners or skeleton screens so users know something is happening. Never leave users staring at a blank screen."
  },
  {
    id: "images",
    text: "Images load quickly (not huge files)",
    critical: false,
    fixPrompt: "My images are slowing down the page. Optimize all images - compress them, use modern formats (WebP), lazy load images below the fold, and add width/height to prevent layout shift."
  },
  {
    id: "no-freeze",
    text: "App doesn't freeze during actions",
    critical: false,
    fixPrompt: "My app freezes when doing certain actions. Move heavy operations off the main thread, add debouncing to search/filter inputs, and show progress for long-running tasks."
  },
];

export function Day19MobileReady({ appName, onComplete }: Day19MobileReadyProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"test" | "performance" | "fix" | "done">("test");
  const [testResults, setTestResults] = useState<Map<string, boolean>>(new Map());
  const [perfResults, setPerfResults] = useState<Map<string, boolean>>(new Map());
  const [mobileIssues, setMobileIssues] = useState("");
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Prompt copied - paste it into Claude Code",
    });
  };

  const setTestResult = (id: string, passed: boolean) => {
    const newResults = new Map(testResults);
    newResults.set(id, passed);
    setTestResults(newResults);
  };

  const setPerfResult = (id: string, passed: boolean) => {
    const newResults = new Map(perfResults);
    newResults.set(id, passed);
    setPerfResults(newResults);
  };

  const criticalTests = MOBILE_TESTS.filter(t => t.critical);
  const criticalPassed = criticalTests.filter(t => testResults.get(t.id) === true).length;
  const allCriticalPassed = criticalPassed === criticalTests.length;
  const hasFailures = Array.from(testResults.values()).some(v => v === false);

  const criticalPerfTests = PERFORMANCE_TESTS.filter(t => t.critical);
  const criticalPerfPassed = criticalPerfTests.filter(t => perfResults.get(t.id) === true).length;
  const hasPerfFailures = Array.from(perfResults.values()).some(v => v === false);

  const canProceedToPerf = testResults.size >= 6;
  const canProceedToFix = perfResults.size >= 3;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Test on Phone */}
      {step === "test" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Step 1: Mobile Test</h4>
                <p className={ds.muted}>Open your app on your actual phone</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
              <p className={ds.label + " mb-2"}>How to open your app on your phone</p>
              <ol className="space-y-2 list-decimal list-inside text-slate-700">
                <li>In Replit, look at the preview window (where your app shows)</li>
                <li>Click the "Open in new tab" icon in the top right (box with arrow)</li>
                <li>Copy the URL from your browser</li>
                <li>On your phone, open your browser and paste that URL</li>
              </ol>
              <p className={ds.muted + " mt-3"}>
                Or just text/email yourself the link. That's what your users will do.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Mobile Test Checklist</h4>
            <p className={ds.muted + " mb-4"}>
              Go through each test. Mark pass or fail honestly.
            </p>

            <div className="space-y-3">
              {MOBILE_TESTS.map((test) => (
                <div key={test.id}>
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      testResults.get(test.id) === true
                        ? "bg-green-50 border-green-200"
                        : testResults.get(test.id) === false
                        ? "bg-red-50 border-red-200 rounded-b-none"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-700">{test.text}</span>
                      {test.critical && (
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Critical</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={testResults.get(test.id) === true ? "default" : "outline"}
                        className="h-8 px-3"
                        onClick={() => setTestResult(test.id, true)}
                      >
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        variant={testResults.get(test.id) === false ? "destructive" : "outline"}
                        className="h-8 px-3"
                        onClick={() => setTestResult(test.id, false)}
                      >
                        Fail
                      </Button>
                    </div>
                  </div>
                  {/* Fix prompt when failed */}
                  {testResults.get(test.id) === false && (
                    <div className="bg-red-50 border border-t-0 border-red-200 rounded-b-lg p-3">
                      <p className="text-xs font-medium text-red-800 mb-2">Copy this prompt to Claude Code to fix it:</p>
                      <div className="flex gap-2">
                        <code className="flex-1 text-xs bg-white p-2 rounded border border-red-200 text-slate-700">
                          {test.fixPrompt}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-auto px-2 shrink-0"
                          onClick={() => copyToClipboard(test.fixPrompt)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {testResults.size >= 6 && (
              <div className={`mt-4 p-3 rounded-lg ${allCriticalPassed ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                <p className={`text-sm font-medium ${allCriticalPassed ? "text-green-800" : "text-amber-800"}`}>
                  {allCriticalPassed
                    ? `All critical tests passed! ${criticalPassed}/${criticalTests.length}`
                    : `${criticalPassed}/${criticalTests.length} critical tests passed`}
                </p>
              </div>
            )}
          </Card>

          {canProceedToPerf && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("performance")}
            >
              Next - Test Loading Speed <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Performance / Loading Speed */}
      {step === "performance" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Step 2: Speed Test</h4>
                <p className={ds.muted}>Slow apps lose users. Let's make sure yours is fast.</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className={ds.label + " text-amber-900 mb-2"}>Why this matters</p>
              <p className={ds.body + " text-amber-800"}>
                53% of mobile users leave a page that takes longer than 3 seconds to load.
                Every second of delay = lost customers. Test on your phone, not your fast computer.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Performance Checklist</h4>
            <p className={ds.muted + " mb-4"}>
              Test on your phone with a normal internet connection (not wifi)
            </p>

            <div className="space-y-3">
              {PERFORMANCE_TESTS.map((test) => (
                <div key={test.id}>
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      perfResults.get(test.id) === true
                        ? "bg-green-50 border-green-200"
                        : perfResults.get(test.id) === false
                        ? "bg-red-50 border-red-200 rounded-b-none"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-700">{test.text}</span>
                      {test.critical && (
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Critical</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={perfResults.get(test.id) === true ? "default" : "outline"}
                        className="h-8 px-3"
                        onClick={() => setPerfResult(test.id, true)}
                      >
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        variant={perfResults.get(test.id) === false ? "destructive" : "outline"}
                        className="h-8 px-3"
                        onClick={() => setPerfResult(test.id, false)}
                      >
                        Fail
                      </Button>
                    </div>
                  </div>
                  {/* Fix prompt when failed */}
                  {perfResults.get(test.id) === false && (
                    <div className="bg-red-50 border border-t-0 border-red-200 rounded-b-lg p-3">
                      <p className="text-xs font-medium text-red-800 mb-2">Copy this prompt to Claude Code to fix it</p>
                      <div className="flex gap-2">
                        <code className="flex-1 text-xs bg-white p-2 rounded border border-red-200 text-slate-700">
                          {test.fixPrompt}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-auto px-2 shrink-0"
                          onClick={() => copyToClipboard(test.fixPrompt)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {perfResults.size >= 3 && (
              <div className={`mt-4 p-3 rounded-lg ${criticalPerfPassed === criticalPerfTests.length ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                <p className={`text-sm font-medium ${criticalPerfPassed === criticalPerfTests.length ? "text-green-800" : "text-amber-800"}`}>
                  {criticalPerfPassed === criticalPerfTests.length
                    ? `All critical performance tests passed!`
                    : `${criticalPerfPassed}/${criticalPerfTests.length} critical performance tests passed`}
                </p>
              </div>
            )}
          </Card>

          {/* Quick performance fix prompt */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <p className={ds.label + " mb-3"}>Quick fix - copy this to Claude Code</p>
            <div className="relative">
              <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 whitespace-pre-wrap">
                Optimize my app for faster loading. Add code splitting, lazy load routes, compress images, add loading spinners where data is fetched, and make sure the first paint happens in under 3 seconds.
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={() => copyToClipboard("Optimize my app for faster loading. Add code splitting, lazy load routes, compress images, add loading spinners where data is fetched, and make sure the first paint happens in under 3 seconds.")}
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>
          </Card>

          {canProceedToFix && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep("test")}
                className="gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                size="lg"
                className="flex-1 h-14 text-lg font-bold gap-2"
                onClick={() => setStep((hasFailures || hasPerfFailures) ? "fix" : "done")}
              >
                {(hasFailures || hasPerfFailures) ? "Document Issues" : "All Tests Passed!"} <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Step 3: Fix Issues */}
      {step === "fix" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Step 3: Fix Issues</h4>
                <p className={ds.muted}>You found things that need fixing. Let's document them.</p>
              </div>
            </div>

            <div className="mb-4">
              <p className={ds.label + " mb-2"}>What Needs Fixing?</p>
              <p className={ds.muted + " mb-3"}>
                List the mobile and performance issues you found
              </p>
              <Textarea
                placeholder="MOBILE ISSUES:
1. [What's wrong and where]
2. [What's wrong and where]

PERFORMANCE ISSUES:
1. [What's slow or freezing]
2. [What needs loading states]

The most important one to fix is..."
                value={mobileIssues}
                onChange={(e) => setMobileIssues(e.target.value)}
                className="min-h-[160px]"
              />
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <p className={ds.label + " mb-3"}>Tell Claude Code to Fix - use this template</p>
            <div className="relative">
              <div className="p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 whitespace-pre-wrap">
{`Fix these mobile and performance issues:

MOBILE:
1. [describe problem]
2. [next problem]

PERFORMANCE:
1. [what's slow]
2. [what needs loading states]

Test at 375px width. Touch targets 44px minimum.
First load should be under 3 seconds.`}
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("performance")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => setStep("done")}
            >
              I Fixed Them (or noted for later) <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">Mobile + Speed Tested!</h4>
                <p className="text-green-700">
                  Most builders skip this step and find out their app is broken after launch. Not you.
                </p>
              </div>
            </div>
          </Card>

          {/* Soft CTA - Building narrative */}
          <Card className="p-5 border-2 border-slate-200 bg-slate-50">
            <p className={ds.body}>
              <span className="font-semibold text-slate-800">Take a moment to realise what you're doing.</span>{" "}
              You're not just playing around anymore - you're building a real product that works on any device.
              That's more than most people ever do.
            </p>
          </Card>

          {(
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep("performance")}
                className="gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                size="lg"
                className="flex-1 h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => onComplete({
                  testedOnPhone: true,
                  mobileIssues: mobileIssues || "No major issues found"
                })}
              >
                Complete Day <CheckCircle2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
