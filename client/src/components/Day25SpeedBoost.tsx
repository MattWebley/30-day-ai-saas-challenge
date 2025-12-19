import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Zap,
  Copy,
  CheckCircle2,
  ArrowRight,
  Clock,
  Image,
  Database,
  Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day25SpeedBoostProps {
  dayId: number;
  onComplete: () => void;
}

const SPEED_CATEGORIES = [
  {
    id: "images",
    label: "Images",
    icon: Image,
    items: [
      { id: "i1", text: "Images are compressed (not massive file sizes)", priority: "high" },
      { id: "i2", text: "Using WebP format where possible", priority: "medium" },
      { id: "i3", text: "Lazy loading images below the fold", priority: "medium" },
      { id: "i4", text: "No images larger than needed", priority: "medium" },
    ],
  },
  {
    id: "loading",
    label: "Loading States",
    icon: Clock,
    items: [
      { id: "l1", text: "Skeleton loaders while data loads", priority: "high" },
      { id: "l2", text: "Show something in under 1 second", priority: "high" },
      { id: "l3", text: "Progressive loading (show what you have)", priority: "medium" },
      { id: "l4", text: "No blank screens while loading", priority: "high" },
    ],
  },
  {
    id: "database",
    label: "Database",
    icon: Database,
    items: [
      { id: "d1", text: "Using pagination (not loading ALL data)", priority: "high" },
      { id: "d2", text: "Indexes on frequently-searched columns", priority: "medium" },
      { id: "d3", text: "Caching data that doesn't change often", priority: "medium" },
      { id: "d4", text: "No N+1 query problems", priority: "medium" },
    ],
  },
  {
    id: "code",
    label: "Code & Bundle",
    icon: Code,
    items: [
      { id: "c1", text: "Lazy loading routes (code splitting)", priority: "medium" },
      { id: "c2", text: "No unused dependencies", priority: "low" },
      { id: "c3", text: "Minified for production", priority: "medium" },
      { id: "c4", text: "No blocking scripts in head", priority: "medium" },
    ],
  },
];

export function Day25SpeedBoost({ dayId, onComplete }: Day25SpeedBoostProps) {
  const [step, setStep] = useState<"measure" | "audit" | "prompt">("measure");
  const [lighthouseScore, setLighthouseScore] = useState<string>("");
  const [loadTime, setLoadTime] = useState<string>("");
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

  const totalItems = SPEED_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const totalReviewed = passedItems.size + failedItems.size;
  const passedCount = passedItems.size;
  const failedCount = failedItems.size;

  const getScoreColor = () => {
    const score = parseInt(lighthouseScore);
    if (score >= 80) return "green";
    if (score >= 50) return "yellow";
    return "red";
  };

  const generateFixPrompt = () => {
    const issues = SPEED_CATEGORIES.flatMap(cat =>
      cat.items.filter(item => failedItems.has(item.id)).map(item => ({
        category: cat.label,
        text: item.text,
        priority: item.priority,
      }))
    );

    const prompt = `Improve my app's performance:

CURRENT STATUS:
- Lighthouse Performance Score: ${lighthouseScore || "Unknown"}
- Load Time: ${loadTime || "Unknown"} seconds

ISSUES TO FIX:
${issues.map((issue, i) => `${i + 1}. [${issue.priority.toUpperCase()}] ${issue.category}: ${issue.text}`).join("\n")}

OPTIMIZATIONS TO APPLY:

1. IMAGES
   - Compress all images with TinyPNG or Squoosh
   - Convert to WebP format
   - Add loading="lazy" to images below the fold
   - Set explicit width/height to prevent layout shift

2. LOADING STATES
   - Add skeleton screens while data loads
   - Show cached/placeholder content immediately
   - Don't block render waiting for data
   - Progressive disclosure - show what you have

3. DATABASE
   - Add pagination (limit 20-50 items per page)
   - Add indexes on: user_id, created_at, any column you filter/sort by
   - Cache frequently-accessed data
   - Use select() to only fetch needed columns

4. CODE BUNDLE
   - Enable code splitting / lazy loading for routes
   - Remove unused dependencies from package.json
   - Make sure Vite/build tool is minifying output
   - Move non-critical scripts to end of body

5. QUICK WINS
   - Enable gzip/brotli compression (usually automatic)
   - Use CDN for static assets (Replit handles this)
   - Preconnect to external domains you use

Run Lighthouse again after fixes to verify improvement.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Speed Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  const allReviewed = totalReviewed === totalItems;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Speed That WINS</h3>
            <p className="text-slate-600 mt-1">
              A 1-second delay = 7% drop in conversions. Make it FAST.
            </p>
          </div>
        </div>
      </Card>

      {/* Step 1: Measure */}
      {step === "measure" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Measure your current speed</h4>
          <p className="text-sm text-slate-500 mb-4">
            Open Chrome DevTools → Lighthouse tab → Analyze page load
          </p>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                Lighthouse Performance Score (0-100)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={lighthouseScore}
                onChange={(e) => setLighthouseScore(e.target.value)}
                placeholder="e.g., 72"
              />
              {lighthouseScore && (
                <div className={`text-sm mt-2 font-medium ${
                  getScoreColor() === "green" ? "text-green-600" :
                  getScoreColor() === "yellow" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {parseInt(lighthouseScore) >= 80 ? "✓ Good! But there's always room to improve." :
                   parseInt(lighthouseScore) >= 50 ? "⚠ Needs work. Users are noticing slowness." :
                   "✗ Problem. This is losing you users."}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                How many seconds to fully load?
              </label>
              <Input
                value={loadTime}
                onChange={(e) => setLoadTime(e.target.value)}
                placeholder="e.g., 3.5"
              />
              {loadTime && (
                <div className={`text-sm mt-2 font-medium ${
                  parseFloat(loadTime) <= 2 ? "text-green-600" :
                  parseFloat(loadTime) <= 4 ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {parseFloat(loadTime) <= 2 ? "✓ Fast! Users are happy." :
                   parseFloat(loadTime) <= 4 ? "⚠ Users are starting to notice." :
                   "✗ Too slow. Users are leaving."}
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={() => setStep("audit")}
          >
            Continue to Audit <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Audit */}
      {step === "audit" && (
        <>
          {SPEED_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="p-6 border-2 border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-slate-600" />
                  <h4 className="font-bold text-slate-900">{category.label}</h4>
                </div>
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
            );
          })}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("measure")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!allReviewed}
              onClick={generateFixPrompt}
            >
              Generate Fix Prompt <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Speed Boost Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-yellow-500 hover:bg-yellow-600">
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

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Speed matters more than you think</p>
                <p className="text-sm text-slate-500">Fast apps feel professional. Slow apps feel broken.</p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 25
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
