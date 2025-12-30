import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Smartphone,
  Copy,
  CheckCircle2,
  ChevronRight,
  Monitor,
  Tablet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day19MobileReadyProps {
  onComplete: () => void;
}

const LAYOUT_CHECKS = [
  { id: "no-scroll", text: "No horizontal scrolling" },
  { id: "readable", text: "Text is readable without zooming" },
  { id: "tappable", text: "Buttons are tappable (not too small)" },
  { id: "forms", text: "Forms are usable" },
  { id: "nav", text: "Navigation works" },
];

const FUNCTION_CHECKS = [
  { id: "features", text: "All features work on mobile" },
  { id: "touch", text: "Touch targets are big enough (44x44px)" },
  { id: "no-hover", text: "No hover-only interactions" },
  { id: "keyboard", text: "Forms work with mobile keyboard" },
];

const DEVICE_TESTS = [
  { id: "small", icon: Smartphone, text: "Tested at 375px (iPhone SE)" },
  { id: "medium", icon: Smartphone, text: "Tested at 390px (iPhone 14)" },
  { id: "tablet", icon: Tablet, text: "Tested at 768px (tablet)" },
  { id: "desktop", icon: Monitor, text: "Still works on desktop" },
];

const MOBILE_FIX_PROMPT = `Fix mobile responsiveness:

1. On screens under 768px:
   - Stack elements vertically
   - Make buttons full width
   - Increase touch targets to 44px minimum
   - Hide non-essential elements

2. Fix these specific issues:
   [List what's broken]

3. Test at 375px width`;

export function Day19MobileReady({ onComplete }: Day19MobileReadyProps) {
  const [layoutChecks, setLayoutChecks] = useState<Set<string>>(new Set());
  const [functionChecks, setFunctionChecks] = useState<Set<string>>(new Set());
  const [deviceTests, setDeviceTests] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleLayout = (id: string) => {
    const newChecks = new Set(layoutChecks);
    if (newChecks.has(id)) newChecks.delete(id);
    else newChecks.add(id);
    setLayoutChecks(newChecks);
  };

  const toggleFunction = (id: string) => {
    const newChecks = new Set(functionChecks);
    if (newChecks.has(id)) newChecks.delete(id);
    else newChecks.add(id);
    setFunctionChecks(newChecks);
  };

  const toggleDevice = (id: string) => {
    const newChecks = new Set(deviceTests);
    if (newChecks.has(id)) newChecks.delete(id);
    else newChecks.add(id);
    setDeviceTests(newChecks);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(MOBILE_FIX_PROMPT);
    toast({
      title: "Copied!",
      description: "Mobile fix prompt copied to clipboard",
    });
  };

  const totalProgress = layoutChecks.size + functionChecks.size + deviceTests.size;
  const totalItems = LAYOUT_CHECKS.length + FUNCTION_CHECKS.length + DEVICE_TESTS.length;
  const canComplete = totalProgress >= totalItems - 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Mobile Ready</h3>
            <p className="text-slate-600 mt-1">Make your app work beautifully on phones. Most users are on mobile.</p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <Card className="p-4 border-2 border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-slate-900">Mobile Readiness</span>
          <span className="text-sm text-cyan-600 font-bold">{totalProgress} / {totalItems} checks</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-600 transition-all"
            style={{ width: `${(totalProgress / totalItems) * 100}%` }}
          />
        </div>
      </Card>

      {/* Layout Checks */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Layout Checks</h4>
        <div className="space-y-2">
          {LAYOUT_CHECKS.map((check) => (
            <div
              key={check.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleLayout(check.id)}
            >
              <Checkbox checked={layoutChecks.has(check.id)} onCheckedChange={() => toggleLayout(check.id)} />
              <span className="text-sm text-slate-700">{check.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Functionality Checks */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Functionality Checks</h4>
        <div className="space-y-2">
          {FUNCTION_CHECKS.map((check) => (
            <div
              key={check.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleFunction(check.id)}
            >
              <Checkbox checked={functionChecks.has(check.id)} onCheckedChange={() => toggleFunction(check.id)} />
              <span className="text-sm text-slate-700">{check.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Device Tests */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Device Testing</h4>
        <div className="space-y-2">
          {DEVICE_TESTS.map((test) => (
            <div
              key={test.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleDevice(test.id)}
            >
              <Checkbox checked={deviceTests.has(test.id)} onCheckedChange={() => toggleDevice(test.id)} />
              <test.icon className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">{test.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Fix Prompt */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">Mobile Fix Prompt</h4>
        <p className="text-sm text-slate-600 mb-4">If you found issues, use this to fix them:</p>
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded border border-slate-200">
          {MOBILE_FIX_PROMPT}
        </pre>
        <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={copyPrompt}>
          <Copy className="w-4 h-4" />
          Copy Prompt
        </Button>
      </Card>

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          Mobile Ready - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
