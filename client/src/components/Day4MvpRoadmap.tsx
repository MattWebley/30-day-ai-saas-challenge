import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Rocket, Calendar, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface RoadmapFeature {
  name: string;
  description: string;
  priority: "mvp" | "post-mvp";
  estimatedWeeks?: number;
}

interface Day4MvpRoadmapProps {
  dayId: number;
  selectedFeatures: string[];
  userIdea: string;
  onComplete: (data: {
    mvpFeatures: RoadmapFeature[];
    postMvpFeatures: RoadmapFeature[];
    selectedMvpFeatures: string[];
  }) => void;
}

export function Day4MvpRoadmap({
  dayId,
  selectedFeatures,
  userIdea,
  onComplete,
}: Day4MvpRoadmapProps) {
  const [step, setStep] = useState<"generate" | "select">("generate");
  const [mvpFeatures, setMvpFeatures] = useState<RoadmapFeature[]>([]);
  const [postMvpFeatures, setPostMvpFeatures] = useState<RoadmapFeature[]>([]);
  const [selectedMvpFeatures, setSelectedMvpFeatures] = useState<Set<string>>(new Set());

  const generateRoadmap = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-mvp-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: userIdea,
          features: selectedFeatures,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate roadmap");
      return response.json();
    },
    onSuccess: (data) => {
      setMvpFeatures(data.mvpFeatures || []);
      setPostMvpFeatures(data.postMvpFeatures || []);

      // Pre-select all MVP features
      const allMvpNames = (data.mvpFeatures || []).map((f: RoadmapFeature) => f.name);
      setSelectedMvpFeatures(new Set(allMvpNames));

      setStep("select");
    },
  });

  const toggleFeature = (featureName: string) => {
    const newSelected = new Set(selectedMvpFeatures);
    if (newSelected.has(featureName)) {
      newSelected.delete(featureName);
    } else {
      newSelected.add(featureName);
    }
    setSelectedMvpFeatures(newSelected);
  };

  const handleContinue = () => {
    onComplete({
      mvpFeatures,
      postMvpFeatures,
      selectedMvpFeatures: Array.from(selectedMvpFeatures),
    });
  };

  if (step === "generate") {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Your Selected Features</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {selectedFeatures.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6 border-2 border-primary bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="space-y-4 text-center">
            <Rocket className="w-12 h-12 text-primary mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Ready to Build Your Roadmap?
              </h3>
              <p className="text-slate-600 mb-4">
                AI will analyze your features and create a prioritized roadmap:
              </p>
              <ul className="text-left space-y-2 max-w-md mx-auto mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">
                    <strong>MVP Features:</strong> What you MUST build first to launch
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">
                    <strong>Post-MVP Features:</strong> What to build after launch
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">
                    <strong>Build Order:</strong> The optimal sequence to build features
                  </span>
                </li>
              </ul>
            </div>

            <Button
              size="lg"
              onClick={() => generateRoadmap.mutate()}
              disabled={generateRoadmap.isPending}
              className="w-full max-w-xs"
            >
              {generateRoadmap.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating your roadmap...
                </>
              ) : (
                "Generate My Roadmap"
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Select step
  const totalMvpWeeks = mvpFeatures
    .filter((f) => selectedMvpFeatures.has(f.name))
    .reduce((sum, f) => sum + (f.estimatedWeeks || 0), 0);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Your MVP Roadmap</h3>
        <p className="text-slate-600 mb-6">
          Review your roadmap below. MVP features are pre-selected - these are essential for launch.
          You can adjust the MVP scope if needed.
        </p>

        {/* MVP Features */}
        {mvpFeatures.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-slate-900">MVP Features (Build First)</h4>
              </div>
              <span className="text-sm font-medium text-slate-600">
                Est. {totalMvpWeeks} weeks to build
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              These are the essential features you need to launch your product
            </p>
            <div className="space-y-3">
              {mvpFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border-2 border-slate-200 bg-white hover:border-primary transition-colors"
                >
                  <Checkbox
                    checked={selectedMvpFeatures.has(feature.name)}
                    onCheckedChange={() => toggleFeature(feature.name)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-semibold text-slate-900">{feature.name}</h5>
                      {feature.estimatedWeeks && (
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-600 whitespace-nowrap">
                          ~{feature.estimatedWeeks}w
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post-MVP Features */}
        {postMvpFeatures.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-slate-900">Post-MVP Features (Build After Launch)</h4>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              These features can wait until after you launch and validate your MVP
            </p>
            <div className="space-y-3">
              {postMvpFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border-2 border-slate-200 bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-slate-700">{feature.name}</h5>
                    {feature.estimatedWeeks && (
                      <span className="text-xs bg-white px-2 py-1 rounded font-medium text-slate-600 whitespace-nowrap">
                        ~{feature.estimatedWeeks}w
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
          <p className="text-sm text-slate-600">
            {selectedMvpFeatures.size} MVP feature{selectedMvpFeatures.size !== 1 ? "s" : ""} selected
            {totalMvpWeeks > 0 && ` • ~${totalMvpWeeks} weeks to build`}
          </p>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={selectedMvpFeatures.size === 0}
          >
            Continue with This Roadmap
          </Button>
        </div>
      </Card>
    </div>
  );
}
