import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  TestTube2,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight
} from "lucide-react";

interface Day12FeatureTestingProps {
  onComplete: () => void;
}

interface FeatureTest {
  id: string;
  feature: string;
  happyPath: boolean;
  edgeCases: boolean;
  errorHandling: boolean;
  speed: boolean;
}

const TEST_CHECKLIST = [
  { id: "happyPath", label: "Happy Path - Does the intended action work?" },
  { id: "edgeCases", label: "Edge Cases - Tried weird inputs?" },
  { id: "errorHandling", label: "Error Handling - Fails gracefully?" },
  { id: "speed", label: "Speed - Fast enough for users?" },
];

export function Day12FeatureTesting({ onComplete }: Day12FeatureTestingProps) {
  const [features, setFeatures] = useState<FeatureTest[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures([
      ...features,
      {
        id: Date.now().toString(),
        feature: newFeature.trim(),
        happyPath: false,
        edgeCases: false,
        errorHandling: false,
        speed: false,
      },
    ]);
    setNewFeature("");
  };

  const toggleCheck = (featureId: string, checkId: keyof FeatureTest) => {
    setFeatures(
      features.map((f) =>
        f.id === featureId ? { ...f, [checkId]: !f[checkId] } : f
      )
    );
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id));
  };

  const getFeatureProgress = (feature: FeatureTest) => {
    const checks = [feature.happyPath, feature.edgeCases, feature.errorHandling, feature.speed];
    return checks.filter(Boolean).length;
  };

  const totalTests = features.length * 4;
  const completedTests = features.reduce((sum, f) => sum + getFeatureProgress(f), 0);
  const canComplete = features.length >= 2 && completedTests >= features.length * 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center">
            <TestTube2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Feature Testing</h3>
            <p className="text-slate-600 mt-1">Test every feature systematically. Find bugs before your users do.</p>
          </div>
        </div>
      </Card>

      {/* Add Feature */}
      <Card className="p-4 border-2 border-slate-200">
        <h4 className="font-bold text-sm mb-3 text-slate-900">Add Features to Test</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Feature name (e.g., 'Login form', 'AI generation', 'Export')"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFeature()}
          />
          <Button onClick={addFeature} className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Progress */}
      {features.length > 0 && (
        <Card className="p-4 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-900">Testing Progress</span>
            <span className="text-sm text-teal-600 font-bold">
              {completedTests} / {totalTests} tests
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all"
              style={{ width: `${totalTests > 0 ? (completedTests / totalTests) * 100 : 0}%` }}
            />
          </div>
        </Card>
      )}

      {/* Feature Tests */}
      {features.map((feature) => (
        <Card key={feature.id} className="p-4 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getFeatureProgress(feature) === 4 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
              )}
              <h4 className="font-bold text-slate-900">{feature.feature}</h4>
            </div>
            <button onClick={() => removeFeature(feature.id)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TEST_CHECKLIST.map((check) => (
              <div
                key={check.id}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 cursor-pointer hover:bg-slate-100"
                onClick={() => toggleCheck(feature.id, check.id as keyof FeatureTest)}
              >
                <Checkbox
                  checked={feature[check.id as keyof FeatureTest] as boolean}
                  onCheckedChange={() => toggleCheck(feature.id, check.id as keyof FeatureTest)}
                />
                <span className="text-xs text-slate-700">{check.label}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          Testing Complete - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      {features.length > 0 && !canComplete && (
        <p className="text-sm text-slate-500 text-center">
          Test at least 2 features with 2+ checks each to continue
        </p>
      )}
    </div>
  );
}
