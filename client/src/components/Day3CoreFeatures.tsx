import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ds } from "@/lib/design-system";

interface Feature {
  name: string;
  description: string;
  category: "core" | "shared" | "usp";
}

interface Day3CoreFeaturesProps {
  dayId: number;
  userIdea: string;
  userPainPoints: string[];
  onComplete: (data: {
    coreFeatures: Feature[];
    sharedFeatures: Feature[];
    uspFeatures: Feature[];
    selectedFeatures: string[];
  }) => void;
}

export function Day3CoreFeatures({
  dayId,
  userIdea,
  userPainPoints,
  onComplete,
}: Day3CoreFeaturesProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"generate" | "select">("generate");
  const [coreFeatures, setCoreFeatures] = useState<Feature[]>([]);
  const [sharedFeatures, setSharedFeatures] = useState<Feature[]>([]);
  const [uspFeatures, setUspFeatures] = useState<Feature[]>([]);
  const [customFeatures, setCustomFeatures] = useState<Feature[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");

  const generateFeatures = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: userIdea,
          painPoints: userPainPoints,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate features");
      return response.json();
    },
    onSuccess: (data) => {
      setCoreFeatures(data.coreFeatures || []);
      setSharedFeatures(data.sharedFeatures || []);
      setUspFeatures(data.uspFeatures || []);

      // Don't pre-select - let user choose which features they want
      setSelectedFeatures(new Set());

      setStep("select");
    },
  });

  const toggleFeature = (featureName: string) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureName)) {
      newSelected.delete(featureName);
    } else {
      newSelected.add(featureName);
    }
    setSelectedFeatures(newSelected);
  };

  const addCustomFeature = () => {
    if (!newFeatureName.trim()) {
      toast.error("Enter a feature name");
      return;
    }
    const newFeature: Feature = {
      name: newFeatureName.trim(),
      description: newFeatureDesc.trim() || "Custom feature",
      category: "usp",
    };
    setCustomFeatures([...customFeatures, newFeature]);
    setSelectedFeatures(new Set([...Array.from(selectedFeatures), newFeature.name]));
    setNewFeatureName("");
    setNewFeatureDesc("");
    toast.success("Feature added!");
  };

  const removeCustomFeature = (index: number) => {
    const featureName = customFeatures[index].name;
    setCustomFeatures(customFeatures.filter((_, i) => i !== index));
    const newSelected = new Set(selectedFeatures);
    newSelected.delete(featureName);
    setSelectedFeatures(newSelected);
  };

  const handleContinue = () => {
    onComplete({
      coreFeatures,
      sharedFeatures,
      uspFeatures: [...uspFeatures, ...customFeatures],
      selectedFeatures: Array.from(selectedFeatures),
    });
  };

  if (step === "generate") {
    return (
      <div ref={containerRef} className="space-y-6">
        <div className={ds.cardWithPadding}>
          <div className="space-y-4">
            <div>
              <h3 className={ds.label + " mb-2"}>Your Idea</h3>
              <p className={ds.body}>{userIdea}</p>
            </div>

            <div>
              <h3 className={ds.label + " mb-2"}>Pain Points</h3>
              <ul className="list-disc list-inside space-y-1">
                {userPainPoints.map((pain, idx) => (
                  <li key={idx} className={ds.body}>{pain}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={ds.cardWithPadding}>
          <div className="space-y-4">
            <h3 className={ds.heading}>
              Ready to Define Your Features?
            </h3>
            <p className={ds.muted}>
              AI will analyze your idea and generate
            </p>
            <ul className="space-y-2">
              <li className={ds.body}><strong>Core Features</strong> - Essential features based on your pain points</li>
              <li className={ds.body}><strong>Shared Features</strong> - Must-haves your competitors all have</li>
              <li className={ds.body}><strong>USP Features</strong> - Unique features that make you stand out</li>
            </ul>

            <Button
              size="lg"
              onClick={() => generateFeatures.mutate()}
              disabled={generateFeatures.isPending}
            >
              {generateFeatures.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing competitors & generating features...
                </>
              ) : (
                "Generate My Features"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Select step
  return (
    <div ref={containerRef} className="space-y-6">
      <div className={ds.cardWithPadding}>
        <h3 className={ds.heading + " mb-4"}>
          Select Your Features
        </h3>
        <p className={ds.muted + " mb-6"}>
          Review the features below and select the ones you want to include in your MVP.
          Click to select - you don't need all of them, just the essentials.
        </p>

        {/* Core Features */}
        {coreFeatures.length > 0 && (
          <div className="mb-6">
            <h4 className={ds.label + " mb-1"}>Core Features</h4>
            <p className={ds.muted + " mb-3"}>
              Essential features based on your pain points
            </p>
            <div className="space-y-3">
              {coreFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className={selectedFeatures.has(feature.name) ? ds.optionSelected : ds.optionDefault}
                  onClick={() => toggleFeature(feature.name)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedFeatures.has(feature.name)}
                      onCheckedChange={() => toggleFeature(feature.name)}
                      className="mt-1"
                    />
                    <div>
                      <h5 className={ds.label}>{feature.name}</h5>
                      <p className={ds.muted}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Features */}
        {sharedFeatures.length > 0 && (
          <div className="mb-6">
            <h4 className={ds.label + " mb-1"}>Shared Must-Have Features</h4>
            <p className={ds.muted + " mb-3"}>
              Features your competitors all have - you need these to compete
            </p>
            <div className="space-y-3">
              {sharedFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className={selectedFeatures.has(feature.name) ? ds.optionSelected : ds.optionDefault}
                  onClick={() => toggleFeature(feature.name)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedFeatures.has(feature.name)}
                      onCheckedChange={() => toggleFeature(feature.name)}
                      className="mt-1"
                    />
                    <div>
                      <h5 className={ds.label}>{feature.name}</h5>
                      <p className={ds.muted}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USP Features */}
        {uspFeatures.length > 0 && (
          <div className="mb-6">
            <h4 className={ds.label + " mb-1"}>Your Unique Features (USP)</h4>
            <p className={ds.muted + " mb-3"}>
              What makes you different from the competition
            </p>
            <div className="space-y-3">
              {uspFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className={selectedFeatures.has(feature.name) ? ds.optionSelected : ds.optionDefault}
                  onClick={() => toggleFeature(feature.name)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedFeatures.has(feature.name)}
                      onCheckedChange={() => toggleFeature(feature.name)}
                      className="mt-1"
                    />
                    <div>
                      <h5 className={ds.label}>{feature.name}</h5>
                      <p className={ds.muted}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Features */}
        <div className="mb-6 pt-6 border-t border-slate-200">
          <h4 className={ds.label + " mb-1"}>Add Your Own Features</h4>
          <p className={ds.muted + " mb-3"}>
            Have ideas the AI didn't suggest? Add them here.
          </p>

          {customFeatures.length > 0 && (
            <div className="space-y-3 mb-4">
              {customFeatures.map((feature, idx) => (
                <div
                  key={`custom-${idx}`}
                  className={selectedFeatures.has(feature.name) ? ds.optionSelected : ds.optionDefault}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3" onClick={() => toggleFeature(feature.name)}>
                      <Checkbox
                        checked={selectedFeatures.has(feature.name)}
                        onCheckedChange={() => toggleFeature(feature.name)}
                        className="mt-1"
                      />
                      <div>
                        <h5 className={ds.label}>{feature.name}</h5>
                        <p className={ds.muted}>{feature.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeCustomFeature(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Input
              placeholder="Feature name (e.g., AI-powered suggestions)"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
            />
            <Input
              placeholder="Brief description (optional)"
              value={newFeatureDesc}
              onChange={(e) => setNewFeatureDesc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomFeature()}
            />
            <Button variant="outline" onClick={addCustomFeature} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Add Feature
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setStep("generate")}
            >
              ← Back
            </Button>
            <p className={ds.muted}>
              {selectedFeatures.size} feature{selectedFeatures.size !== 1 ? "s" : ""} selected
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={selectedFeatures.size === 0}
          >
            Continue with Selected Features
          </Button>
        </div>
      </div>
    </div>
  );
}
