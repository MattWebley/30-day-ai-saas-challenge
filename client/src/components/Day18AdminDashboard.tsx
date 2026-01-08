import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface Day18AdminDashboardProps {
  appName: string;
  onComplete: (data: { metricsChosen: string; dashboardBuilt: boolean; currentStats: string }) => void;
}

const METRIC_OPTIONS = [
  { id: "total-users", name: "Total Users", desc: "How many people signed up" },
  { id: "active-users", name: "Active Users", desc: "Used app in last 7 days" },
  { id: "new-users", name: "New This Week", desc: "Signups in past 7 days" },
  { id: "total-actions", name: "Total Actions", desc: "How many times main feature was used" },
];

export function Day18AdminDashboard({ appName, onComplete }: Day18AdminDashboardProps) {
  const [step, setStep] = useState<"choose" | "build" | "check">("choose");
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());
  const [dashboardBuilt, setDashboardBuilt] = useState(false);
  const [currentStats, setCurrentStats] = useState("");

  const toggleMetric = (id: string) => {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMetrics(newSelected);
  };

  const canProceedToBuild = selectedMetrics.size >= 2;
  const canComplete = currentStats.length >= 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Build Your Admin Dashboard</h3>
        <p className="text-slate-600 mt-1">Know what's happening in your app. Data-driven decisions start here.</p>
      </Card>

      {/* Step 1: Choose Metrics */}
      {step === "choose" && (
        <>
          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What Do You Want to Track?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Pick 2-4 metrics that matter for your app. You can always add more later.
            </p>

            <div className="space-y-3">
              {METRIC_OPTIONS.map((metric) => (
                <div
                  key={metric.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedMetrics.has(metric.id)
                      ? "border-slate-400 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => toggleMetric(metric.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.has(metric.id)}
                    onChange={() => toggleMetric(metric.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="font-medium text-slate-900">{metric.name}</span>
                    <p className="text-xs text-slate-600">{metric.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-sm mb-2 text-slate-900">Why Track Metrics?</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Know if anyone is actually using your app</li>
              <li>• See what features people engage with</li>
              <li>• Spot problems before users complain</li>
              <li>• Make decisions based on data, not gut</li>
            </ul>
          </Card>

          {canProceedToBuild && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("build")}
            >
              Build Admin Dashboard <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Build the Dashboard */}
      {step === "build" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedMetrics).map((id) => {
                const metric = METRIC_OPTIONS.find(m => m.id === id);
                return metric ? (
                  <span key={id} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-slate-700 border border-slate-200">
                    {metric.name}
                  </span>
                ) : null;
              })}
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Build the Dashboard</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Create /admin page</p>
                  <p className="text-sm text-slate-600">Protected route - only you can access</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Add stat cards for each metric</p>
                  <p className="text-sm text-slate-600">Big numbers, easy to read at a glance</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Add recent activity list</p>
                  <p className="text-sm text-slate-600">Last 10-20 user actions with timestamps</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Mark your account as admin</p>
                  <p className="text-sm text-slate-600">So you can access the dashboard</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Tell Claude Code</h4>
            <p className="text-sm text-slate-600 mb-4">Describe what to build:</p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 font-mono">
              "Create an admin dashboard at /admin:<br /><br />
              1. Only admin users can access<br />
              2. Show: {Array.from(selectedMetrics).map(id => METRIC_OPTIONS.find(m => m.id === id)?.name).join(", ")}<br />
              3. Add a list of recent user activity<br />
              4. Make my account an admin<br />
              5. Keep it simple - just stats and a list"
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("check")}
          >
            I Built It - Check My Stats <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Check Your Stats */}
      {step === "check" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Admin Dashboard Built!</h4>
            <p className="text-slate-700">
              You now have visibility into your app. No more guessing - you can see exactly what's happening.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Check Your Stats</h4>
            <p className="text-sm text-slate-600 mb-4">
              Go to your admin dashboard. What do you see?
            </p>

            <div className="flex gap-3 mb-4">
              <Button
                variant={dashboardBuilt ? "default" : "outline"}
                className="flex-1"
                onClick={() => setDashboardBuilt(true)}
              >
                Dashboard works!
              </Button>
              <Button
                variant={!dashboardBuilt ? "outline" : "outline"}
                className="flex-1"
                onClick={() => setDashboardBuilt(false)}
              >
                Still building
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">What Are Your Current Stats?</h4>
            <p className="text-sm text-slate-600 mb-4">
              Record what you see on your dashboard right now:
            </p>
            <Textarea
              placeholder="My current stats:
- Total Users: [X]
- Active Users: [X]
- Total Actions: [X]
- Most recent activity: [user did X at Y time]

Observations: The dashboard shows [what I learned]..."
              value={currentStats}
              onChange={(e) => setCurrentStats(e.target.value)}
              className="min-h-[140px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({
                metricsChosen: Array.from(selectedMetrics).map(id => METRIC_OPTIONS.find(m => m.id === id)?.name).join(", "),
                dashboardBuilt,
                currentStats
              })}
            >
              Save Dashboard & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
