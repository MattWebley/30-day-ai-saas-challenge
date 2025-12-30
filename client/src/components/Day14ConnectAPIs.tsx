import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plug,
  CheckCircle2,
  ChevronRight,
  Database,
  Mail,
  Image,
  BarChart3
} from "lucide-react";

interface Day14ConnectAPIsProps {
  onComplete: () => void;
}

const API_OPTIONS = [
  {
    id: "none",
    icon: CheckCircle2,
    name: "None Needed",
    desc: "AI was enough for my MVP",
    when: "Your app works with just OpenAI",
  },
  {
    id: "storage",
    icon: Image,
    name: "File Storage",
    desc: "Cloudinary, AWS S3",
    when: "Users upload images/files",
  },
  {
    id: "email",
    icon: Mail,
    name: "Email",
    desc: "Resend, SendGrid",
    when: "Send notifications (covered Day 16)",
  },
  {
    id: "analytics",
    icon: BarChart3,
    name: "Analytics",
    desc: "Mixpanel, PostHog, Plausible",
    when: "Track user behavior (add later)",
  },
  {
    id: "external",
    icon: Database,
    name: "External Data",
    desc: "Weather, stocks, etc.",
    when: "Need real-time external data",
  },
];

const INTEGRATION_STEPS = [
  { id: "identify", text: "Identified which APIs my app needs" },
  { id: "signup", text: "Signed up for necessary services" },
  { id: "keys", text: "Added API keys to Replit Secrets" },
  { id: "integrated", text: "Integrated API(s) with Claude Code" },
  { id: "tested", text: "Tested that integrations work" },
];

export function Day14ConnectAPIs({ onComplete }: Day14ConnectAPIsProps) {
  const [selectedAPIs, setSelectedAPIs] = useState<Set<string>>(new Set());
  const [stepsChecked, setStepsChecked] = useState<Set<string>>(new Set());

  const toggleAPI = (id: string) => {
    const newSelected = new Set(selectedAPIs);
    if (id === "none") {
      // If selecting "none", clear others
      newSelected.clear();
      newSelected.add("none");
    } else {
      // Remove "none" if selecting something else
      newSelected.delete("none");
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
    }
    setSelectedAPIs(newSelected);
  };

  const toggleStep = (id: string) => {
    const newChecked = new Set(stepsChecked);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setStepsChecked(newChecked);
  };

  const hasSelection = selectedAPIs.size > 0;
  const canComplete = hasSelection && stepsChecked.size >= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center">
            <Plug className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Connect APIs</h3>
            <p className="text-slate-600 mt-1">Add external services your app needs. Only add what's essential.</p>
          </div>
        </div>
      </Card>

      {/* API Selection */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">What APIs Does Your App Need?</h4>
        <div className="grid gap-3">
          {API_OPTIONS.map((api) => (
            <div
              key={api.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAPIs.has(api.id)
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => toggleAPI(api.id)}
            >
              <Checkbox checked={selectedAPIs.has(api.id)} onCheckedChange={() => toggleAPI(api.id)} />
              <api.icon className={`w-5 h-5 ${selectedAPIs.has(api.id) ? "text-orange-600" : "text-slate-400"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{api.name}</span>
                  <span className="text-xs text-slate-500">({api.desc})</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">When: {api.when}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Integration Steps */}
      {hasSelection && !selectedAPIs.has("none") && (
        <Card className="p-6 border-2 border-slate-200">
          <h4 className="font-bold text-lg mb-4 text-slate-900">Integration Checklist</h4>
          <div className="space-y-3">
            {INTEGRATION_STEPS.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
                onClick={() => toggleStep(step.id)}
              >
                <Checkbox
                  checked={stepsChecked.has(step.id)}
                  onCheckedChange={() => toggleStep(step.id)}
                />
                <span className="text-sm text-slate-700">{step.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* None Selected - Quick Complete */}
      {selectedAPIs.has("none") && (
        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">No Additional APIs Needed</p>
              <p className="text-sm text-green-700">Your MVP works with just OpenAI. You can add more APIs later.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Complete Button */}
      {(selectedAPIs.has("none") || canComplete) && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          Week 3 Complete - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
