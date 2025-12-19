import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Copy,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  Target,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day23UserDashboardProps {
  dayId: number;
  onComplete: () => void;
}

const METRIC_TYPES = [
  { id: "progress", label: "Am I making progress?", icon: TrendingUp, example: "73% to weekly goal" },
  { id: "action", label: "What should I do next?", icon: Target, example: "3 tasks waiting" },
  { id: "total", label: "What did I accomplish?", icon: Activity, example: "147 items created" },
  { id: "recent", label: "What's happening now?", icon: Clock, example: "Last active 2h ago" },
];

const CHART_TYPES = [
  { id: "line", label: "Line Chart", desc: "For trends over time" },
  { id: "bar", label: "Bar Chart", desc: "For comparing things" },
  { id: "number", label: "Big Number", desc: "Just show the number, big" },
  { id: "none", label: "No Chart", desc: "Keep it simple" },
];

export function Day23UserDashboard({ dayId, onComplete }: Day23UserDashboardProps) {
  const [step, setStep] = useState<"main" | "supporting" | "chart" | "prompt">("main");
  const [mainMetric, setMainMetric] = useState<string>("");
  const [mainMetricType, setMainMetricType] = useState<string>("");
  const [supportingMetrics, setSupportingMetrics] = useState<string[]>(["", "", ""]);
  const [chartType, setChartType] = useState<string>("line");
  const [chartData, setChartData] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const { toast } = useToast();

  const updateSupportingMetric = (index: number, value: string) => {
    const newMetrics = [...supportingMetrics];
    newMetrics[index] = value;
    setSupportingMetrics(newMetrics);
  };

  const generateBuildPrompt = () => {
    const metricType = METRIC_TYPES.find(m => m.id === mainMetricType);

    const prompt = `Create a user dashboard that answers ONE question clearly:

MAIN METRIC (big and prominent):
"${mainMetric}"
- Type: ${metricType?.label || "Progress tracking"}
- Make this HUGE - it's the first thing users see
- Show comparison to last period (↑ or ↓ arrow with %)
- Color code: Green if improving, red if declining

SUPPORTING STATS (row of cards below):
${supportingMetrics.filter(m => m).map((m, i) => `${i + 1}. ${m}`).join("\n")}
- Display as compact stat cards in a row
- Each card: Label on top, number below, optional trend indicator

${chartType !== "none" ? `
CHART:
- Type: ${chartType === "line" ? "Line chart" : chartType === "bar" ? "Bar chart" : "Large number display"}
${chartData ? `- Data: ${chartData}` : "- Show last 30 days of activity"}
- Keep it simple - one chart maximum
- Mobile responsive` : ""}

RECENT ACTIVITY:
- List of last 5-10 user actions
- Format: "[Action] - [timestamp]"
- "View All" link to full history

LAYOUT:
1. Main metric at top (biggest)
2. Supporting stats in a row
${chartType !== "none" ? "3. Chart below stats" : ""}
3. Recent activity at bottom

DESIGN:
- Clean, minimal
- Main metric should be 2-3x larger than everything else
- Use your app's color scheme
- Mobile responsive (stack on small screens)

The dashboard should load fast and answer "${mainMetricType === "progress" ? "Am I making progress?" : mainMetricType === "action" ? "What should I do next?" : mainMetricType === "total" ? "What have I accomplished?" : "What's happening now?"}" in under 3 seconds of looking at it.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Dashboard Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Numbers That MATTER</h3>
            <p className="text-slate-600 mt-1">
              Not a data dump. ONE clear answer to what users care about.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Main Metric", "Supporting", "Visualization", "Build"].map((label, idx) => {
          const steps = ["main", "supporting", "chart", "prompt"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-indigo-100 text-indigo-700" :
                isCurrent ? "bg-indigo-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 3 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Main Metric */}
      {step === "main" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What's the ONE thing users want to know?</h4>
          <p className="text-sm text-slate-500 mb-4">When they log in, what question are they asking?</p>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {METRIC_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setMainMetricType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    mainMetricType === type.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${mainMetricType === type.id ? "text-indigo-600" : "text-slate-400"}`} />
                  <div className="font-bold text-slate-900">{type.label}</div>
                  <div className="text-sm text-slate-500 mt-1">e.g., "{type.example}"</div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-2">
              Your main metric
            </label>
            <Input
              value={mainMetric}
              onChange={(e) => setMainMetric(e.target.value)}
              placeholder="e.g., Tasks completed this week, Revenue this month, Streak days..."
            />
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={!mainMetric || !mainMetricType}
            onClick={() => setStep("supporting")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Supporting Metrics */}
      {step === "supporting" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Supporting stats (optional)</h4>
          <p className="text-sm text-slate-500 mb-4">Add context around the main number</p>

          <div className="space-y-3">
            {supportingMetrics.map((metric, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stat {idx + 1}
                </label>
                <Input
                  value={metric}
                  onChange={(e) => updateSupportingMetric(idx, e.target.value)}
                  placeholder={
                    idx === 0 ? "e.g., Current streak: X days" :
                    idx === 1 ? "e.g., Total items created" :
                    "e.g., Time saved this month"
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("main")}>Back</Button>
            <Button className="flex-1" size="lg" onClick={() => setStep("chart")}>
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Chart */}
      {step === "chart" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Add a visualization?</h4>
          <p className="text-sm text-slate-500 mb-4">Optional - sometimes less is more</p>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {CHART_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  chartType === type.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="font-bold text-slate-900">{type.label}</div>
                <div className="text-sm text-slate-500">{type.desc}</div>
              </button>
            ))}
          </div>

          {chartType !== "none" && (
            <div>
              <label className="block font-semibold text-slate-900 mb-2">
                What data should the chart show?
              </label>
              <Input
                value={chartData}
                onChange={(e) => setChartData(e.target.value)}
                placeholder="e.g., Daily usage over last 30 days"
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("supporting")}>Back</Button>
            <Button className="flex-1" size="lg" onClick={generateBuildPrompt}>
              Generate Build Prompt <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Dashboard Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-indigo-500 hover:bg-indigo-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Build it, then continue</p>
                <p className="text-sm text-slate-500">A good dashboard keeps users coming back</p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 23
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">Dashboard Golden Rules</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>One clear answer.</strong> Not 15 charts and no insights.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Context matters.</strong> "47" means nothing. "47 more than last week" means something.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Less is more.</strong> If in doubt, remove the chart.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
