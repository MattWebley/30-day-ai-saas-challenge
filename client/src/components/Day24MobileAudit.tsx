import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Smartphone,
  Copy,
  CheckCircle2,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day24MobileAuditProps {
  dayId: number;
  onComplete: () => void;
}

const MOBILE_CHECKS = [
  {
    id: "text",
    label: "Text & Readability",
    items: [
      { id: "t1", text: "Can read all text without zooming", priority: "high" },
      { id: "t2", text: "Font size is at least 16px", priority: "high" },
      { id: "t3", text: "Lines aren't too long to read comfortably", priority: "medium" },
      { id: "t4", text: "Headings are clearly larger than body text", priority: "medium" },
    ],
  },
  {
    id: "taps",
    label: "Tap Targets",
    items: [
      { id: "tp1", text: "Buttons are big enough to tap (44x44px minimum)", priority: "high" },
      { id: "tp2", text: "Links have enough space between them", priority: "high" },
      { id: "tp3", text: "Form inputs are easy to tap into", priority: "high" },
      { id: "tp4", text: "No accidental taps on wrong things", priority: "medium" },
    ],
  },
  {
    id: "forms",
    label: "Forms & Inputs",
    items: [
      { id: "f1", text: "Forms are full-width on mobile", priority: "high" },
      { id: "f2", text: "Labels are above fields (not beside)", priority: "medium" },
      { id: "f3", text: "Keyboard doesn't cover inputs", priority: "high" },
      { id: "f4", text: "Correct keyboard type (email, number, etc.)", priority: "medium" },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    items: [
      { id: "n1", text: "Menu is accessible (hamburger or bottom bar)", priority: "high" },
      { id: "n2", text: "Can navigate with one thumb", priority: "medium" },
      { id: "n3", text: "Back button works as expected", priority: "high" },
      { id: "n4", text: "Current page is clear", priority: "medium" },
    ],
  },
  {
    id: "layout",
    label: "Layout & Fit",
    items: [
      { id: "l1", text: "No horizontal scrolling", priority: "high" },
      { id: "l2", text: "Content stacks nicely (not cramped)", priority: "high" },
      { id: "l3", text: "Images scale down properly", priority: "medium" },
      { id: "l4", text: "Tables are readable or scrollable", priority: "medium" },
    ],
  },
];

export function Day24MobileAudit({ dayId, onComplete }: Day24MobileAuditProps) {
  const [step, setStep] = useState<"audit" | "prompt">("audit");
  const [passedItems, setPassedItems] = useState<Set<string>>(new Set());
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const { toast } = useToast();

  const toggleItem = (itemId: string, passed: boolean) => {
    const newPassed = new Set(passedItems);
    const newFailed = new Set(failedItems);

    if (passed) {
      newPassed.add(itemId);
      newFailed.delete(itemId);
    } else {
      newFailed.add(itemId);
      newPassed.delete(itemId);
    }

    setPassedItems(newPassed);
    setFailedItems(newFailed);
  };

  const totalItems = MOBILE_CHECKS.reduce((sum, cat) => sum + cat.items.length, 0);
  const totalReviewed = passedItems.size + failedItems.size;
  const passedCount = passedItems.size;
  const failedCount = failedItems.size;

  const highPriorityFailed = MOBILE_CHECKS.flatMap(cat =>
    cat.items.filter(item => item.priority === "high" && failedItems.has(item.id))
  );

  const generateFixPrompt = () => {
    const issues = MOBILE_CHECKS.flatMap(cat =>
      cat.items.filter(item => failedItems.has(item.id)).map(item => ({
        category: cat.label,
        text: item.text,
        priority: item.priority,
      }))
    );

    const prompt = `Fix these mobile issues in my app:

${issues.map((issue, i) => `${i + 1}. [${issue.priority.toUpperCase()}] ${issue.category}: ${issue.text}`).join("\n")}

MOBILE FIXES TO APPLY:

1. NAVIGATION
   - Add hamburger menu for mobile (hide full nav)
   - Consider bottom navigation bar for main actions
   - Make all touch targets 44x44px minimum

2. TEXT
   - Set minimum font size to 16px everywhere
   - Limit line width to ~70 characters with max-width
   - Use proper line spacing (1.5 line-height)

3. FORMS
   - Full-width inputs on mobile (w-full)
   - Labels above fields, not beside
   - Use correct input types: type="email", type="tel", type="number"
   - Add proper padding so keyboard doesn't cover

4. LAYOUT
   - Use flex-col on mobile, flex-row on desktop
   - grid-cols-1 on mobile, sm:grid-cols-2, lg:grid-cols-3
   - Add overflow-x-hidden to prevent horizontal scroll
   - Make sure images have max-width: 100%

5. TABLES (if you have them)
   - Convert to card layout on mobile, OR
   - Make horizontally scrollable with overflow-x-auto

Test at 375px width (iPhone SE) for the worst case.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Mobile Fix Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const getScore = () => {
    if (totalReviewed === 0) return 0;
    return Math.round((passedCount / totalItems) * 100);
  };

  const allReviewed = totalReviewed === totalItems;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-cyan-500 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Mobile That WORKS</h3>
            <p className="text-slate-600 mt-1">
              55% of users are on mobile. Don't lose half your customers.
            </p>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 border-2 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">Open your app on your REAL phone right now</div>
            <div className="text-sm text-amber-800 mt-1">
              Not the browser simulator. Your actual phone. Click everything. Find the pain.
            </div>
          </div>
        </div>
      </Card>

      {step === "audit" && (
        <>
          {/* Score */}
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">Mobile Score</span>
              <span className="font-bold text-cyan-600">{getScore()}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${getScore()}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-green-600 font-medium">✓ {passedCount} passed</span>
              <span className="text-red-600 font-medium">✗ {failedCount} failed</span>
            </div>
          </Card>

          {/* High Priority Warning */}
          {highPriorityFailed.length > 0 && (
            <Card className="p-4 border-2 border-red-300 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-bold text-red-800">
                    {highPriorityFailed.length} HIGH priority issue{highPriorityFailed.length > 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-red-700">These will frustrate mobile users!</div>
                </div>
              </div>
            </Card>
          )}

          {/* Audit Categories */}
          {MOBILE_CHECKS.map((category) => (
            <Card key={category.id} className="p-6 border-2 border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900 mb-3">{category.label}</h4>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const isPassed = passedItems.has(item.id);
                  const isFailed = failedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        isPassed ? "border-green-300 bg-green-50" :
                        isFailed ? "border-red-300 bg-red-50" :
                        "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.priority === "high" && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">HIGH</span>
                        )}
                        <span className={isPassed ? "text-green-700" : isFailed ? "text-red-700" : "text-slate-700"}>
                          {item.text}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleItem(item.id, true)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isPassed ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-green-100"
                          }`}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => toggleItem(item.id, false)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isFailed ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-red-100"
                          }`}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}

          {allReviewed && (
            <Button className="w-full" size="lg" onClick={generateFixPrompt}>
              {failedCount > 0 ? "Generate Fix Prompt" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </>
      )}

      {step === "prompt" && (
        <>
          {failedCount > 0 ? (
            <Card className="p-6 border-2 border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">Your Mobile Fix Prompt</h4>
                  <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
                </div>
                <Button onClick={handleCopyPrompt} className="gap-2 bg-cyan-500 hover:bg-cyan-600">
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </Button>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {generatedPrompt}
                </pre>
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-bold text-green-800 text-lg">Perfect Mobile Score!</div>
                  <div className="text-green-700">Your app works great on phones. Nice work!</div>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Mobile audit complete</p>
                <p className="text-sm text-slate-500">You just stopped losing half your users</p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 24
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
