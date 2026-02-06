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

  // AI usage limits
  const [generateAttempts, setGenerateAttempts] = useState(0);
  const MAX_GENERATE_ATTEMPTS = 5;

  const generateFeatures = useMutation({
    mutationFn: async () => {
      console.log('[Day3] Generating features for:', { idea: userIdea, painPoints: userPainPoints });

      if (!userIdea || userIdea.trim() === '') {
        console.error('[Day3] No idea found. userIdea:', userIdea);
        throw new Error("No idea found. Please complete Day 2 first (click 'Lock In My Choice').");
      }
      if (!userPainPoints || userPainPoints.length === 0) {
        console.error('[Day3] No pain points found. userPainPoints:', userPainPoints);
        throw new Error("No pain points found. Please complete Day 2 first (select pain points).");
      }

      console.log('[Day3] Sending request to /api/ai/generate-features...');
      const response = await fetch("/api/ai/generate-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idea: userIdea,
          painPoints: userPainPoints,
        }),
      });

      console.log('[Day3] Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Day3] Error response:', errorData);
        if (response.status === 429) {
          throw new Error("Rate limit reached. Please wait a few minutes and try again.");
        }
        throw new Error(errorData.message || "Failed to generate features");
      }
      const data = await response.json();
      console.log('[Day3] Success response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('[Day3] Features generated:', data);
      setCoreFeatures(data.coreFeatures || []);
      setSharedFeatures(data.sharedFeatures || []);
      setUspFeatures(data.uspFeatures || []);

      // Don't pre-select - let user choose which features they want
      setSelectedFeatures(new Set());
      setGenerateAttempts(prev => prev + 1);

      setStep("select");
    },
    onError: (error: any) => {
      console.error('[Day3] Feature generation failed:', error);
      toast.error(error.message || "Failed to generate features. Please try again.");
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

  // Check if Day 2 data is missing
  const missingData = !userIdea || userIdea.trim() === '' || !userPainPoints || userPainPoints.length === 0;

  if (step === "generate") {
    return (
      <div ref={containerRef} className="space-y-6">
        {missingData && (
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">
              ⚠️ Missing Day 2 data. Please go back to Day 2 and complete all steps:
            </p>
            <ul className="text-amber-700 text-sm mt-2 list-disc list-inside">
              {(!userIdea || userIdea.trim() === '') && <li>Choose an idea and click "Lock In My Choice"</li>}
              {(!userPainPoints || userPainPoints.length === 0) && <li>Select your pain points</li>}
            </ul>
          </div>
        )}

        <div className={ds.cardWithPadding}>
          <div className="space-y-4">
            <div>
              <h3 className={ds.label + " mb-2"}>Your Idea</h3>
              <p className={ds.body}>{userIdea || <span className="text-amber-600 italic">No idea saved yet</span>}</p>
            </div>

            <div>
              <h3 className={ds.label + " mb-2"}>Pain Points</h3>
              {userPainPoints.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {userPainPoints.map((pain, idx) => (
                    <li key={idx} className={ds.body}>{pain}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-amber-600 italic">No pain points saved yet</p>
              )}
            </div>
          </div>
        </div>

        <div className={ds.cardWithPadding}>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className={ds.heading + " mb-2"}>
                Ready to Define Your Features?
              </h3>
              <p className={ds.muted}>
                AI will analyze your idea and competitors to generate your feature set
              </p>
            </div>

            <div className="grid gap-3">
              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>Core Features</p>
                <p className={ds.muted + " text-sm"}>Essential features based on your pain points</p>
              </div>
              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>Shared Features</p>
                <p className={ds.muted + " text-sm"}>Must-haves your competitors all have</p>
              </div>
              <div className={ds.infoBoxHighlight}>
                <p className={ds.label}>USP Features</p>
                <p className={ds.muted + " text-sm"}>Unique features that make you stand out</p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => generateFeatures.mutate()}
              disabled={generateFeatures.isPending || generateAttempts >= MAX_GENERATE_ATTEMPTS || missingData}
              className="w-full h-14 text-lg font-bold"
            >
              {generateFeatures.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing competitors & generating features...
                </>
              ) : missingData ? (
                "Complete Day 2 first"
              ) : generateAttempts >= MAX_GENERATE_ATTEMPTS ? (
                "Generation limit reached"
              ) : generateAttempts > 0 ? (
                "Regenerate Features"
              ) : (
                "Generate My Features"
              )}
            </Button>

            {generateFeatures.isPending && (
              <p className="text-sm text-amber-600 font-medium text-center">
                This can take up to 2 minutes - please don't refresh!
              </p>
            )}
            {generateAttempts >= MAX_GENERATE_ATTEMPTS - 2 && generateAttempts < MAX_GENERATE_ATTEMPTS && (
              <p className="text-sm text-amber-600 font-medium text-center">
                {MAX_GENERATE_ATTEMPTS - generateAttempts} generation{MAX_GENERATE_ATTEMPTS - generateAttempts !== 1 ? 's' : ''} remaining
              </p>
            )}
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
                      onCheckedChange={() => {}}
                      className="mt-1 pointer-events-none"
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
                      onCheckedChange={() => {}}
                      className="mt-1 pointer-events-none"
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
                      onCheckedChange={() => {}}
                      className="mt-1 pointer-events-none"
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
                        onCheckedChange={() => {}}
                        className="mt-1 pointer-events-none"
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
