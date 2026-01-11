import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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
  const [step, setStep] = useState<"generate" | "select">("generate");
  const [coreFeatures, setCoreFeatures] = useState<Feature[]>([]);
  const [sharedFeatures, setSharedFeatures] = useState<Feature[]>([]);
  const [uspFeatures, setUspFeatures] = useState<Feature[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

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

      // Pre-select all features
      const allFeatureNames = [
        ...(data.coreFeatures || []),
        ...(data.sharedFeatures || []),
        ...(data.uspFeatures || []),
      ].map((f: Feature) => f.name);
      setSelectedFeatures(new Set(allFeatureNames));

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

  const handleContinue = () => {
    onComplete({
      coreFeatures,
      sharedFeatures,
      uspFeatures,
      selectedFeatures: Array.from(selectedFeatures),
    });
  };

  if (step === "generate") {
    return (
      <div className="space-y-6">
        <div className={ds.cardWithPadding}>
          <div className="space-y-4">
            <div>
              <h3 className={ds.title + " mb-2"}>Your Idea</h3>
              <p className={ds.text}>{userIdea}</p>
            </div>

            <div>
              <h3 className={ds.title + " mb-2"}>Pain Points</h3>
              <ul className="list-disc list-inside space-y-1">
                {userPainPoints.map((pain, idx) => (
                  <li key={idx} className={ds.text}>{pain}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={ds.cardWithPadding}>
          <div className="space-y-4">
            <h3 className={ds.titleXl}>
              Ready to Define Your Features?
            </h3>
            <p className={ds.textMuted}>
              AI will analyze your idea and generate:
            </p>
            <ul className="space-y-2">
              <li className={ds.text}><strong>Core Features:</strong> Essential features based on your pain points</li>
              <li className={ds.text}><strong>Shared Features:</strong> Must-haves your competitors all have</li>
              <li className={ds.text}><strong>USP Features:</strong> Unique features that make you stand out</li>
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
    <div className="space-y-6">
      <div className={ds.cardWithPadding}>
        <h3 className={ds.titleLg + " mb-4"}>
          Select Your Features
        </h3>
        <p className={ds.textMuted + " mb-6"}>
          Review the features below and select which ones you want to include in your product.
          All features are pre-selected, but you can uncheck any you don't want.
        </p>

        {/* Core Features */}
        {coreFeatures.length > 0 && (
          <div className="mb-6">
            <h4 className={ds.title + " mb-1"}>Core Features</h4>
            <p className={ds.textMuted + " mb-3"}>
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
                      <h5 className={ds.title}>{feature.name}</h5>
                      <p className={ds.textMuted}>{feature.description}</p>
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
            <h4 className={ds.title + " mb-1"}>Shared Must-Have Features</h4>
            <p className={ds.textMuted + " mb-3"}>
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
                      <h5 className={ds.title}>{feature.name}</h5>
                      <p className={ds.textMuted}>{feature.description}</p>
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
            <h4 className={ds.title + " mb-1"}>Your Unique Features (USP)</h4>
            <p className={ds.textMuted + " mb-3"}>
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
                      <h5 className={ds.title}>{feature.name}</h5>
                      <p className={ds.textMuted}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className={ds.textMuted}>
            {selectedFeatures.size} feature{selectedFeatures.size !== 1 ? "s" : ""} selected
          </p>
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
