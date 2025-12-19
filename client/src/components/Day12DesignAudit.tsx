import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Palette,
  Copy,
  CheckCircle2,
  Layout,
  Type,
  Smartphone,
  Sparkles,
  Star,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day12DesignAuditProps {
  dayId: number;
  onComplete: () => void;
}

const AUDIT_CATEGORIES = [
  {
    id: "layout",
    label: "Layout & Spacing",
    icon: Layout,
    color: "blue",
    items: [
      { id: "consistent-spacing", label: "Consistent spacing between elements", fix: "Add consistent padding/margin throughout the app. Use 16px (p-4) for cards, 24px (p-6) for sections." },
      { id: "visual-hierarchy", label: "Clear visual hierarchy (headings > text)", fix: "Make headings larger and bolder (text-2xl font-bold), body text smaller (text-base)." },
      { id: "breathing-room", label: "Enough white space (not cramped)", fix: "Add more padding inside cards and sections. Use py-8 or py-12 for major sections." },
      { id: "alignment", label: "Things line up properly", fix: "Use flex or grid layouts. Ensure all elements align to a consistent grid." },
    ]
  },
  {
    id: "colors",
    label: "Colors & Contrast",
    icon: Palette,
    color: "purple",
    items: [
      { id: "readable-text", label: "Text is easy to read (good contrast)", fix: "Use dark text (slate-900) on light backgrounds. Minimum contrast ratio 4.5:1." },
      { id: "consistent-colors", label: "Using consistent brand colors", fix: "Pick 2-3 colors max. Use your primary color for buttons/CTAs, secondary for accents." },
      { id: "not-too-many", label: "Not too many different colors", fix: "Audit all colors used. Remove any that aren't in your brand palette. Stick to 3-4 max." },
      { id: "button-stands-out", label: "Main button/CTA stands out", fix: "Make your primary CTA a bold, contrasting color. Add hover states for interactivity." },
    ]
  },
  {
    id: "typography",
    label: "Text & Typography",
    icon: Type,
    color: "green",
    items: [
      { id: "readable-font", label: "Font is readable and professional", fix: "Use a clean sans-serif font (Inter, system-ui). Avoid decorative fonts for body text." },
      { id: "font-sizes", label: "Text sizes make sense (not too small)", fix: "Body text minimum 16px (text-base). Headlines 24-32px. Never go below 14px." },
      { id: "line-spacing", label: "Line spacing is comfortable", fix: "Add leading-relaxed or leading-loose to body text for better readability." },
      { id: "max-width", label: "Lines aren't too long to read", fix: "Add max-w-prose or max-w-2xl to text containers. Ideal line length is 50-75 characters." },
    ]
  },
  {
    id: "mobile",
    label: "Mobile & Responsive",
    icon: Smartphone,
    color: "orange",
    items: [
      { id: "works-on-phone", label: "App works on phone (test it!)", fix: "Test at 375px width. Use responsive classes: sm:, md:, lg: for different breakpoints." },
      { id: "tap-targets", label: "Buttons big enough to tap", fix: "Minimum button size 44x44px. Add py-3 px-6 or larger to all buttons." },
      { id: "no-horizontal-scroll", label: "No horizontal scrolling", fix: "Check for fixed widths. Use w-full and max-w-screen-xl. Add overflow-x-hidden if needed." },
      { id: "stacks-nicely", label: "Content stacks nicely on small screens", fix: "Use flex-col on mobile, flex-row on desktop. grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" },
    ]
  },
  {
    id: "polish",
    label: "Polish & Details",
    icon: Sparkles,
    color: "pink",
    items: [
      { id: "loading-states", label: "Loading states when things load", fix: "Add skeleton loaders or spinners during data fetches. Show 'Loading...' text." },
      { id: "hover-states", label: "Hover effects on clickable things", fix: "Add hover:bg-primary/90, hover:shadow-lg, or hover:scale-105 to interactive elements." },
      { id: "error-messages", label: "Friendly error messages", fix: "Show helpful red error messages near the problem. Don't just say 'Error' - explain what to do." },
      { id: "success-feedback", label: "Success feedback when actions complete", fix: "Add toast notifications or success messages. Show checkmarks, green colors for success." },
    ]
  },
];

export function Day12DesignAudit({ dayId, onComplete }: Day12DesignAuditProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const toggleItem = (itemId: string, passed: boolean) => {
    const newChecked = new Set(checkedItems);
    const newFailed = new Set(failedItems);

    if (passed) {
      newChecked.add(itemId);
      newFailed.delete(itemId);
    } else {
      newFailed.add(itemId);
      newChecked.delete(itemId);
    }

    setCheckedItems(newChecked);
    setFailedItems(newFailed);
  };

  const totalItems = AUDIT_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const totalReviewed = checkedItems.size + failedItems.size;
  const passedCount = checkedItems.size;
  const failedCount = failedItems.size;

  const getScore = () => {
    if (totalReviewed === 0) return 0;
    return Math.round((passedCount / totalItems) * 100);
  };

  const getGrade = () => {
    const score = getScore();
    if (score >= 90) return { grade: "A", label: "Excellent!", color: "green" };
    if (score >= 75) return { grade: "B", label: "Good", color: "blue" };
    if (score >= 60) return { grade: "C", label: "Needs Work", color: "yellow" };
    return { grade: "D", label: "Needs Lots of Work", color: "red" };
  };

  const generateFixPrompt = () => {
    const issues = AUDIT_CATEGORIES.flatMap(cat =>
      cat.items.filter(item => failedItems.has(item.id))
    );

    if (issues.length === 0) {
      return "Your design looks great! No major issues found.";
    }

    return `Please fix these design issues in my app:

${issues.map((issue, idx) => `${idx + 1}. ${issue.label}
   FIX: ${issue.fix}`).join("\n\n")}

Make these changes throughout the app for consistency. Focus on making it look professional and polished.`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generateFixPrompt());
    toast({
      title: "Fix Prompt Copied!",
      description: "Paste this into Replit Agent to fix your design issues",
    });
  };

  const handleComplete = () => {
    onComplete();
  };

  const allReviewed = totalReviewed === totalItems;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center">
            <Palette className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">3-Minute Design Audit</h3>
            <p className="text-slate-600 mt-1">
              Rate each item. Get instant fixes for anything that fails.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <Card className="p-4 border-2 border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-700">Audit Progress</span>
          <span className="font-bold text-purple-600">{totalReviewed} of {totalItems} reviewed</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${(totalReviewed / totalItems) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-green-600 font-medium">✓ {passedCount} passed</span>
          <span className="text-red-600 font-medium">✗ {failedCount} need work</span>
        </div>
      </Card>

      {!showResults ? (
        <>
          {/* Audit Categories */}
          {AUDIT_CATEGORIES.map((category) => {
            const CategoryIcon = category.icon;
            const categoryPassed = category.items.filter(item => checkedItems.has(item.id)).length;
            const categoryFailed = category.items.filter(item => failedItems.has(item.id)).length;

            return (
              <Card key={category.id} className="p-6 border-2 border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <CategoryIcon className="w-6 h-6 text-slate-600" />
                  <h4 className="font-bold text-slate-900">{category.label}</h4>
                  <span className="text-sm text-slate-500 ml-auto">
                    {categoryPassed + categoryFailed}/{category.items.length} reviewed
                  </span>
                </div>

                <div className="space-y-3">
                  {category.items.map((item) => {
                    const isPassed = checkedItems.has(item.id);
                    const isFailed = failedItems.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border-2 ${
                          isPassed ? "border-green-300 bg-green-50" :
                          isFailed ? "border-red-300 bg-red-50" :
                          "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={`font-medium ${
                            isPassed ? "text-green-700" :
                            isFailed ? "text-red-700" :
                            "text-slate-700"
                          }`}>
                            {item.label}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleItem(item.id, true)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                isPassed
                                  ? "bg-green-500 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-green-100"
                              }`}
                            >
                              ✓ Pass
                            </button>
                            <button
                              onClick={() => toggleItem(item.id, false)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                isFailed
                                  ? "bg-red-500 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-red-100"
                              }`}
                            >
                              ✗ Fail
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          {allReviewed && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowResults(true)}
            >
              See My Results <Star className="w-4 h-4 ml-2" />
            </Button>
          )}
        </>
      ) : (
        <>
          {/* Results */}
          <Card className="p-6 border-2 border-purple-300 bg-purple-50">
            <div className="text-center">
              <div className={`text-6xl font-black mb-2 ${
                getGrade().color === "green" ? "text-green-600" :
                getGrade().color === "blue" ? "text-blue-600" :
                getGrade().color === "yellow" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {getGrade().grade}
              </div>
              <div className="text-xl font-bold text-slate-900">{getGrade().label}</div>
              <div className="text-slate-600 mt-1">
                {getScore()}% - {passedCount} of {totalItems} items passed
              </div>
            </div>
          </Card>

          {/* Fix Prompt */}
          {failedCount > 0 && (
            <Card className="p-6 border-2 border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">Your Fix Prompt</h4>
                  <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
                </div>
                <Button onClick={handleCopyPrompt} className="gap-2 bg-purple-500 hover:bg-purple-600">
                  <Copy className="w-4 h-4" />
                  Copy Fix Prompt
                </Button>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {generateFixPrompt()}
                </pre>
              </div>
            </Card>
          )}

          {/* All Passed */}
          {failedCount === 0 && (
            <Card className="p-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-bold text-green-800 text-lg">Perfect Score!</div>
                  <div className="text-green-700">Your design is looking professional. Great work!</div>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowResults(false)}
              >
                Back to Audit
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleComplete}
              >
                Complete Day 12
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">Design Doesn't Have To Be Perfect</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>80% good enough beats 100% never.</strong> Ship it, improve later.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Users care about VALUE first.</strong> Design matters, but it's not everything.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Keep it simple.</strong> Less design is often better design.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
