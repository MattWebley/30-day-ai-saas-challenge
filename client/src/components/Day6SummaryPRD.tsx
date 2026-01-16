import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Edit3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { ds } from "@/lib/design-system";

interface Day6SummaryPRDProps {
  dayId: number;
  userIdea: string;
  painPoints: string[];
  features: string[];
  mvpFeatures: string[];
  onComplete: (data: { prd: string; summary: string }) => void;
}

export function Day6SummaryPRD({
  dayId,
  userIdea,
  painPoints,
  features,
  mvpFeatures,
  onComplete,
}: Day6SummaryPRDProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"generate" | "review" | "edit">("generate");
  const [summary, setSummary] = useState("");
  const [prd, setPrd] = useState("");
  const [editedPrd, setEditedPrd] = useState("");

  const generatePRD = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: userIdea,
          painPoints,
          features,
          mvpFeatures,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate PRD");
      return response.json();
    },
    onSuccess: (data) => {
      setSummary(data.summary || "");
      setPrd(data.prd || "");
      setEditedPrd(data.prd || "");
      setStep("review");
    },
  });

  const handleEdit = () => {
    setStep("edit");
  };

  const handleSaveEdits = () => {
    setPrd(editedPrd);
    setStep("review");
  };

  const handleCancelEdits = () => {
    setEditedPrd(prd);
    setStep("review");
  };

  const handleDownload = () => {
    const blob = new Blob([prd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-requirements-document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinue = () => {
    onComplete({
      prd,
      summary,
    });
  };

  if (step === "generate") {
    return (
      <div ref={containerRef} className="space-y-6">
        <div className={ds.cardWithPadding}>
          <h3 className={ds.heading + " mb-4"}>Your Journey So Far</h3>

          <div className="space-y-4">
            <div>
              <h4 className={ds.label + " mb-2"}>Your Idea</h4>
              <p className={ds.body}>{userIdea}</p>
            </div>

            <div>
              <h4 className={ds.label + " mb-2"}>Pain Points</h4>
              <ul className="list-disc list-inside space-y-1">
                {painPoints.map((pain, idx) => (
                  <li key={idx} className={ds.body}>{pain}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={ds.label + " mb-2"}>MVP Features ({mvpFeatures.length})</h4>
              <ul className="list-disc list-inside space-y-1">
                {mvpFeatures.slice(0, 5).map((feature, idx) => (
                  <li key={idx} className={ds.body}>{feature}</li>
                ))}
                {mvpFeatures.length > 5 && (
                  <li className={ds.muted}>+ {mvpFeatures.length - 5} more...</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className={ds.cardWithPadding}>
          <div className="space-y-4 text-center">
            <div>
              <h3 className={ds.heading + " mb-2"}>
                Ready to Create Your PRD?
              </h3>
              <p className={ds.muted + " mb-4"}>
                AI will analyze everything you've done and create:
              </p>
              <ul className="text-left space-y-2 max-w-md mx-auto mb-6">
                <li className={ds.body}>
                  <strong>Executive Summary:</strong> A concise overview of your product
                </li>
                <li className={ds.body}>
                  <strong>Product Requirements Document:</strong> Complete spec for development
                </li>
                <li className={ds.body}>
                  <strong>Feature Specifications:</strong> Detailed requirements for each feature
                </li>
              </ul>
            </div>

            <Button
              size="lg"
              onClick={() => generatePRD.mutate()}
              disabled={generatePRD.isPending}
              className="w-full max-w-xs"
            >
              {generatePRD.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating your PRD...
                </>
              ) : (
                "Generate My PRD"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "edit") {
    return (
      <div ref={containerRef} className="space-y-6">
        <div className={ds.cardWithPadding}>
          <h3 className={ds.heading + " mb-4"}>Edit Your PRD</h3>
          <p className={ds.muted + " mb-4"}>
            Make any changes you'd like to your Product Requirements Document.
          </p>

          <Textarea
            value={editedPrd}
            onChange={(e) => setEditedPrd(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Your PRD will appear here..."
          />

          <div className="flex gap-3 mt-4">
            <Button onClick={handleSaveEdits} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancelEdits}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Review step
  return (
    <div ref={containerRef} className="space-y-6">
      <div className={ds.cardWithPadding}>
        <h3 className={ds.heading + " mb-4"}>Executive Summary</h3>
        <div className="prose prose-slate max-w-none">
          <p className={ds.body + " whitespace-pre-line"}>{summary}</p>
        </div>
      </div>

      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={ds.heading}>Product Requirements Document</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        <div className={ds.infoBoxHighlight + " max-h-[600px] overflow-y-auto"}>
          <pre className={ds.muted + " whitespace-pre-wrap font-mono"}>
            {prd}
          </pre>
        </div>
      </div>

      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between">
          <div>
            <p className={ds.label}>Your PRD is ready!</p>
            <p className={ds.muted + " mt-1"}>
              You can edit or download it above, then continue to start building
            </p>
          </div>
          <Button size="lg" onClick={handleContinue}>
            Continue to Build
          </Button>
        </div>
      </div>
    </div>
  );
}
