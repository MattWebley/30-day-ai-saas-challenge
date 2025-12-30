import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LayoutDashboard,
  Copy,
  CheckCircle2,
  ChevronRight,
  Users,
  Activity,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day18AdminDashboardProps {
  onComplete: () => void;
}

const METRICS = [
  { id: "total-users", icon: Users, text: "Total users count" },
  { id: "new-users", icon: TrendingUp, text: "New users this week" },
  { id: "active-users", icon: Activity, text: "Active users (last 7 days)" },
  { id: "actions", icon: Activity, text: "Total main actions taken" },
  { id: "recent", icon: Activity, text: "Recent activity list" },
];

const CHECKLIST = [
  { id: "created", text: "Created admin dashboard page" },
  { id: "protected", text: "Protected it - only admins can access" },
  { id: "metrics", text: "Added key metrics" },
  { id: "activity", text: "Added recent activity list" },
  { id: "myself", text: "Marked my account as admin" },
];

const ADMIN_PROMPT = `Create an admin dashboard at /admin:

1. Protect it - only admin users can access
2. Show these stats:
   - Total users (count)
   - Users signed up this week (count)
   - Active users this week (used app in last 7 days)
   - Total [main actions] (count of main feature usage)

3. Show recent activity:
   - Last 20 [actions] with user and timestamp

4. Make it simple and clean - this is for me, not users

Mark my account as admin.`;

export function Day18AdminDashboard({ onComplete }: Day18AdminDashboardProps) {
  const [metricsSelected, setMetricsSelected] = useState<Set<string>>(new Set());
  const [checklistDone, setChecklistDone] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleMetric = (id: string) => {
    const newSelected = new Set(metricsSelected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setMetricsSelected(newSelected);
  };

  const toggleChecklist = (id: string) => {
    const newDone = new Set(checklistDone);
    if (newDone.has(id)) {
      newDone.delete(id);
    } else {
      newDone.add(id);
    }
    setChecklistDone(newDone);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(ADMIN_PROMPT);
    toast({
      title: "Copied!",
      description: "Admin dashboard prompt copied to clipboard",
    });
  };

  const canComplete = metricsSelected.size >= 3 && checklistDone.size >= 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h3>
            <p className="text-slate-600 mt-1">See what's happening in your app. Users, activity, metrics.</p>
          </div>
        </div>
      </Card>

      {/* Why Admin */}
      <Card className="p-4 border-2 border-slate-200">
        <h4 className="font-bold text-sm mb-2 text-slate-900">Why You Need This</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Know who's signing up</li>
          <li>• See which features are used</li>
          <li>• Spot issues before users complain</li>
          <li>• Make data-driven decisions</li>
        </ul>
      </Card>

      {/* Metrics Selection */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">What Metrics Will You Track?</h4>
        <div className="space-y-3">
          {METRICS.map((metric) => (
            <div
              key={metric.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleMetric(metric.id)}
            >
              <Checkbox
                checked={metricsSelected.has(metric.id)}
                onCheckedChange={() => toggleMetric(metric.id)}
              />
              <metric.icon className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">{metric.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Prompt Template */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">Admin Dashboard Prompt</h4>
        <p className="text-sm text-slate-600 mb-4">Copy and customize for your app:</p>
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded border border-slate-200">
          {ADMIN_PROMPT}
        </pre>
        <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={copyPrompt}>
          <Copy className="w-4 h-4" />
          Copy Prompt
        </Button>
      </Card>

      {/* Checklist */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Implementation Checklist</h4>
        <div className="space-y-3">
          {CHECKLIST.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleChecklist(item.id)}
            >
              <Checkbox
                checked={checklistDone.has(item.id)}
                onCheckedChange={() => toggleChecklist(item.id)}
              />
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          Week 4 Complete - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
