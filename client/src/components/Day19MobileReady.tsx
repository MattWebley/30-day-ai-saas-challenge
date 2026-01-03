import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Trophy,
  ArrowRight,
  AlertTriangle,
  XCircle
} from "lucide-react";

interface Day19MobileReadyProps {
  appName: string;
  onComplete: (data: { testedOnPhone: boolean; mobileIssues: string; mobileResult: string }) => void;
}

const MOBILE_TESTS = [
  { id: "load", text: "App loads on phone", critical: true },
  { id: "read", text: "Text is readable (no zooming needed)", critical: true },
  { id: "buttons", text: "Buttons are easy to tap", critical: true },
  { id: "scroll", text: "No weird horizontal scrolling", critical: true },
  { id: "forms", text: "Forms work with mobile keyboard", critical: true },
  { id: "main-feature", text: "Main feature works on mobile", critical: true },
  { id: "fast", text: "Loads in under 5 seconds", critical: false },
  { id: "looks-good", text: "Generally looks good", critical: false },
];

export function Day19MobileReady({ appName, onComplete }: Day19MobileReadyProps) {
  const [step, setStep] = useState<"test" | "fix" | "done">("test");
  const [testResults, setTestResults] = useState<Map<string, boolean>>(new Map());
  const [mobileIssues, setMobileIssues] = useState("");
  const [mobileResult, setMobileResult] = useState("");

  const setTestResult = (id: string, passed: boolean) => {
    const newResults = new Map(testResults);
    newResults.set(id, passed);
    setTestResults(newResults);
  };

  const criticalTests = MOBILE_TESTS.filter(t => t.critical);
  const criticalPassed = criticalTests.filter(t => testResults.get(t.id) === true).length;
  const allCriticalPassed = criticalPassed === criticalTests.length;
  const hasFailures = Array.from(testResults.values()).some(v => v === false);

  const canProceedToFix = testResults.size >= 6;
  const canComplete = mobileResult.length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Test On Your Phone</h3>
            <p className="text-slate-600 mt-1">Open your app on your actual phone and test everything.</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Test on Phone */}
      {step === "test" && (
        <>
          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Use Your Actual Phone</p>
                <p className="mt-1">
                  Don't use browser dev tools - actually open your app URL on your phone.
                  That's what your users will do.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Mobile Test Checklist</h4>
            <p className="text-sm text-slate-600 mb-4">
              Go through each test. Mark pass or fail honestly:
            </p>

            <div className="space-y-3">
              {MOBILE_TESTS.map((test) => (
                <div
                  key={test.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    testResults.get(test.id) === true
                      ? "bg-green-50 border-green-200"
                      : testResults.get(test.id) === false
                      ? "bg-red-50 border-red-200"
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
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={testResults.get(test.id) === false ? "destructive" : "outline"}
                      className="h-8 px-3"
                      onClick={() => setTestResult(test.id, false)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
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

          {canProceedToFix && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep(hasFailures ? "fix" : "done")}
            >
              {hasFailures ? "Document Issues" : "All Good!"} <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Fix Issues */}
      {step === "fix" && (
        <>
          <Card className="p-6 border-2 border-red-200 bg-red-50">
            <h4 className="font-bold text-lg mb-2 text-red-900">Found Mobile Issues</h4>
            <p className="text-sm text-red-700">
              You found some things that don't work well on mobile. Let's document and fix them.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What Needs Fixing?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Describe the mobile issues you found:
            </p>
            <Textarea
              placeholder="1. [Issue]: [What's wrong and where]
2. [Issue]: [What's wrong and where]
3. [Issue]: [What's wrong and where]

The most important one to fix is..."
              value={mobileIssues}
              onChange={(e) => setMobileIssues(e.target.value)}
              className="min-h-[140px]"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Tell Claude Code to Fix</h4>
            <p className="text-sm text-slate-600 mb-4">Use this template:</p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 font-mono">
              "Fix mobile responsiveness:<br /><br />
              1. On mobile, [describe problem]<br />
              2. [Next problem]<br /><br />
              Make sure everything works at 375px width (iPhone SE).<br />
              Touch targets should be at least 44px."
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("done")}
          >
            <CheckCircle2 className="w-5 h-5" />
            I Fixed Them (or noted for later)
          </Button>
        </>
      )}

      {/* Step 3: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-lg text-slate-900">Mobile Tested!</h4>
            </div>
            <p className="text-slate-700">
              You've tested your app on an actual phone. Most builders skip this step and find out
              their app is broken on mobile after launch. Not you.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Mobile Test Summary</h4>
            <p className="text-sm text-slate-600 mb-4">
              Document your mobile testing experience:
            </p>
            <Textarea
              placeholder="I tested on [phone model].

What works well:
- [Feature] works great on mobile
- [Feature] is easy to use

What I fixed/still need to fix:
- [Issue] - fixed/will fix later

Overall, my app on mobile is [ready/almost ready/needs work] because..."
              value={mobileResult}
              onChange={(e) => setMobileResult(e.target.value)}
              className="min-h-[160px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                testedOnPhone: true,
                mobileIssues: mobileIssues || "No major issues found",
                mobileResult
              })}
            >
              Save Mobile Test & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
