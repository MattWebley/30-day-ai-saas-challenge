import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Loader2, Download, Edit3, RefreshCw, RotateCcw, Pencil } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { ds } from "@/lib/design-system";
import { useToast } from "@/hooks/use-toast";

interface Day6SummaryPRDProps {
  dayId: number;
  userIdea: string;
  painPoints: string[];
  features: string[];
  mvpFeatures: string[];
  appName: string;
  iHelpStatement: string;
  uspFeatures: string[];
  brandVibe: string;
  onComplete: (data: { prd: string; summary: string }) => void;
}

export function Day6SummaryPRD({
  dayId,
  userIdea,
  painPoints,
  features,
  mvpFeatures,
  appName,
  iHelpStatement,
  uspFeatures,
  brandVibe,
  onComplete,
}: Day6SummaryPRDProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"generate" | "review" | "edit">("generate");
  const [customerAvatar, setCustomerAvatar] = useState("");
  const [lookAndFeel, setLookAndFeel] = useState("");
  const { toast } = useToast();

  // AI usage limits
  const [prdAttempts, setPrdAttempts] = useState(0);
  const [avatarAttempts, setAvatarAttempts] = useState(0);
  const [lookFeelAttempts, setLookFeelAttempts] = useState(0);
  const MAX_PRD_ATTEMPTS = 5;
  const MAX_DETAIL_ATTEMPTS = 5;
  const [summary, setSummary] = useState("");
  const [prd, setPrd] = useState("");
  const [editedPrd, setEditedPrd] = useState("");
  const [originalPrd, setOriginalPrd] = useState(""); // Store original for revert

  // Editable versions of the props
  const [editingData, setEditingData] = useState(false);
  const [editAppName, setEditAppName] = useState(appName);
  const [editIdea, setEditIdea] = useState(userIdea);
  const [editHelpStatement, setEditHelpStatement] = useState(iHelpStatement);
  const [editPainPoints, setEditPainPoints] = useState(painPoints.join("\n"));
  const [editFeatures, setEditFeatures] = useState(mvpFeatures.join("\n"));
  const [editUspFeatures, setEditUspFeatures] = useState(uspFeatures.join("\n"));
  const [editBrandVibe, setEditBrandVibe] = useState(brandVibe);

  const generatePRD = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: editIdea,
          painPoints: editPainPoints.split("\n").filter(p => p.trim()),
          features: editFeatures.split("\n").filter(f => f.trim()),
          mvpFeatures: editFeatures.split("\n").filter(f => f.trim()),
          appName: editAppName,
          iHelpStatement: editHelpStatement,
          uspFeatures: editUspFeatures.split("\n").filter(f => f.trim()),
          brandVibe: editBrandVibe,
          customerAvatar,
          lookAndFeel,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate PRD");
      return response.json();
    },
    onSuccess: (data) => {
      setSummary(data.summary || "");
      setPrd(data.prd || "");
      setEditedPrd(data.prd || "");
      setOriginalPrd(data.prd || ""); // Store for revert
      setPrdAttempts(prev => prev + 1);
      setStep("review");
    },
  });

  const generateAvatar = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-prd-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "avatar",
          idea: editIdea,
          painPoints: editPainPoints.split("\n").filter(p => p.trim()),
          iHelpStatement: editHelpStatement,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate");
      return response.json();
    },
    onSuccess: (data) => {
      setCustomerAvatar(data.result || "");
      setAvatarAttempts(prev => prev + 1);
    },
    onError: () => {
      toast({ title: "Failed to generate", description: "Please try again", variant: "destructive" });
    },
  });

  const generateLookFeel = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-prd-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "lookfeel",
          idea: editIdea,
          brandVibe: editBrandVibe,
          appName: editAppName,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate");
      return response.json();
    },
    onSuccess: (data) => {
      setLookAndFeel(data.result || "");
      setLookFeelAttempts(prev => prev + 1);
    },
    onError: () => {
      toast({ title: "Failed to generate", description: "Please try again", variant: "destructive" });
    },
  });

  const handleRegenerate = () => {
    if (prdAttempts >= MAX_PRD_ATTEMPTS) {
      toast({ title: "Limit reached", description: "You've reached the maximum number of regenerations", variant: "destructive" });
      return;
    }
    generatePRD.mutate();
  };

  const handleRevertToOriginal = () => {
    setPrd(originalPrd);
    setEditedPrd(originalPrd);
  };

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
    const blob = new Blob([prd], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PRD.txt";
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
    const displayPainPoints = editPainPoints.split("\n").filter(p => p.trim());
    const displayFeatures = editFeatures.split("\n").filter(f => f.trim());
    const displayUspFeatures = editUspFeatures.split("\n").filter(f => f.trim());

    return (
      <div ref={containerRef} className="space-y-6">
        <div className={ds.cardWithPadding}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={ds.heading}>Everything We Know So Far</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingData(!editingData)}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              {editingData ? "Done Editing" : "Edit"}
            </Button>
          </div>

          {editingData ? (
            <div className="space-y-4">
              <div>
                <h4 className={ds.label + " mb-2"}>Product Name</h4>
                <Input
                  value={editAppName}
                  onChange={(e) => setEditAppName(e.target.value)}
                  placeholder="Your product name"
                />
              </div>

              <div>
                <h4 className={ds.label + " mb-2"}>The Idea</h4>
                <Textarea
                  value={editIdea}
                  onChange={(e) => setEditIdea(e.target.value)}
                  placeholder="Describe your idea"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <h4 className={ds.label + " mb-2"}>Value Proposition</h4>
                <Input
                  value={editHelpStatement}
                  onChange={(e) => setEditHelpStatement(e.target.value)}
                  placeholder="I help X solve Y"
                />
              </div>

              <div>
                <h4 className={ds.label + " mb-2"}>Pain Points (one per line)</h4>
                <Textarea
                  value={editPainPoints}
                  onChange={(e) => setEditPainPoints(e.target.value)}
                  placeholder="Enter pain points, one per line"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <h4 className={ds.label + " mb-2"}>Features (one per line)</h4>
                <Textarea
                  value={editFeatures}
                  onChange={(e) => setEditFeatures(e.target.value)}
                  placeholder="Enter features, one per line"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <h4 className={ds.label + " mb-2"}>Standout Features / USP (one per line)</h4>
                <Textarea
                  value={editUspFeatures}
                  onChange={(e) => setEditUspFeatures(e.target.value)}
                  placeholder="Enter standout features, one per line"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <h4 className={ds.label + " mb-2"}>Brand Vibe</h4>
                <Input
                  value={editBrandVibe}
                  onChange={(e) => setEditBrandVibe(e.target.value)}
                  placeholder="e.g., Professional, Playful, Minimal"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {editAppName && (
                <div>
                  <h4 className={ds.label + " mb-2"}>Product Name</h4>
                  <p className={ds.body + " font-semibold text-lg"}>{editAppName}</p>
                </div>
              )}

              <div>
                <h4 className={ds.label + " mb-2"}>The Idea</h4>
                <p className={ds.body}>{editIdea}</p>
              </div>

              {editHelpStatement && (
                <div>
                  <h4 className={ds.label + " mb-2"}>Value Proposition</h4>
                  <p className={ds.body + " italic"}>"{editHelpStatement}"</p>
                </div>
              )}

              <div>
                <h4 className={ds.label + " mb-2"}>Pain Points ({displayPainPoints.length})</h4>
                <ul className="list-disc list-inside space-y-1">
                  {displayPainPoints.slice(0, 4).map((pain, idx) => (
                    <li key={idx} className={ds.body}>{pain}</li>
                  ))}
                  {displayPainPoints.length > 4 && (
                    <li className={ds.muted}>+ {displayPainPoints.length - 4} more...</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className={ds.label + " mb-2"}>Features ({displayFeatures.length})</h4>
                <ul className="list-disc list-inside space-y-1">
                  {displayFeatures.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className={ds.body}>{feature}</li>
                  ))}
                  {displayFeatures.length > 5 && (
                    <li className={ds.muted}>+ {displayFeatures.length - 5} more...</li>
                  )}
                </ul>
              </div>

              {displayUspFeatures.length > 0 && (
                <div>
                  <h4 className={ds.label + " mb-2"}>Standout Features (USP)</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {displayUspFeatures.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className={ds.body}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {editBrandVibe && (
                <div>
                  <h4 className={ds.label + " mb-2"}>Brand Vibe</h4>
                  <p className={ds.body}>{editBrandVibe}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={ds.cardWithPadding}>
          <h3 className={ds.heading + " mb-4"}>Two More Details</h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className={ds.label}>Customer Avatar</h4>
                <Button
                  size="sm"
                  onClick={() => generateAvatar.mutate()}
                  disabled={generateAvatar.isPending || !editIdea.trim() || avatarAttempts >= MAX_DETAIL_ATTEMPTS}
                >
                  {generateAvatar.isPending ? (
                    <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Generating...</>
                  ) : avatarAttempts >= MAX_DETAIL_ATTEMPTS ? (
                    "Limit reached"
                  ) : avatarAttempts > 0 ? (
                    "Regenerate"
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
              <p className={ds.muted + " mb-2"}>
                Who exactly is this for? Be specific - not just "businesses" but "freelance designers who struggle with..."
              </p>
              <Textarea
                value={customerAvatar}
                onChange={(e) => setCustomerAvatar(e.target.value)}
                placeholder="e.g., Freelance graphic designers who waste hours chasing invoices and tracking project deadlines across multiple apps..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className={ds.label}>Look & Feel</h4>
                <Button
                  size="sm"
                  onClick={() => generateLookFeel.mutate()}
                  disabled={generateLookFeel.isPending || !editIdea.trim() || lookFeelAttempts >= MAX_DETAIL_ATTEMPTS}
                >
                  {generateLookFeel.isPending ? (
                    <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Generating...</>
                  ) : lookFeelAttempts >= MAX_DETAIL_ATTEMPTS ? (
                    "Limit reached"
                  ) : lookFeelAttempts > 0 ? (
                    "Regenerate"
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
              <p className={ds.muted + " mb-2"}>
                What apps or websites do you want yours to look/feel like? What style are you going for?
              </p>
              <Textarea
                value={lookAndFeel}
                onChange={(e) => setLookAndFeel(e.target.value)}
                placeholder="e.g., Clean and minimal like Notion, with a dashboard similar to Stripe. Dark mode option. Professional but not boring..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div className={ds.cardWithPadding}>
          <div className="flex items-center justify-between">
            <div>
              {(!customerAvatar.trim() || !lookAndFeel.trim()) && (
                <p className={ds.muted}>
                  Fill in both fields above to generate
                </p>
              )}
            </div>
            <Button
              size="lg"
              onClick={() => generatePRD.mutate()}
              disabled={generatePRD.isPending || !customerAvatar.trim() || !lookAndFeel.trim() || prdAttempts >= MAX_PRD_ATTEMPTS}
            >
              {generatePRD.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PRD...
                </>
              ) : prdAttempts >= MAX_PRD_ATTEMPTS ? (
                "Generation limit reached"
              ) : (
                "Generate My PRD"
              )}
            </Button>
          </div>
          {generatePRD.isPending && (
            <p className="text-sm text-amber-600 font-medium text-center mt-3">
              This can take up to a minute - please don't refresh!
            </p>
          )}
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
            <Button variant="outline" onClick={handleCancelEdits} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Cancel
            </Button>
            <Button onClick={handleSaveEdits} className="flex-1">
              Save Changes
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
          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={generatePRD.isPending || prdAttempts >= MAX_PRD_ATTEMPTS}
              className="gap-2"
            >
              {generatePRD.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {prdAttempts >= MAX_PRD_ATTEMPTS ? "Limit reached" : prdAttempts >= MAX_PRD_ATTEMPTS - 2 ? `Regenerate (${MAX_PRD_ATTEMPTS - prdAttempts} left)` : "Regenerate"}
            </Button>
            {prd !== originalPrd && originalPrd && (
              <Button variant="outline" size="sm" onClick={handleRevertToOriginal} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Revert
              </Button>
            )}
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

      {/* Big Download Button */}
      <div className={ds.cardWithPadding}>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h3 className={ds.heading + " mb-2"}>Your PRD is Ready!</h3>
          <p className={ds.muted + " mb-4"}>
            Download your PRD - you'll paste this into Replit tomorrow.
          </p>
          <Button size="lg" onClick={handleDownload} className="gap-2">
            <Download className="w-5 h-5" />
            Download PRD
          </Button>
        </div>
      </div>

      {/* How to use it */}
      <div className={ds.cardWithPadding}>
        <h3 className={ds.heading + " mb-4"}>Now Paste It Into Replit</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className={ds.stepCircle + " flex-shrink-0"}>1</div>
            <p className={ds.body}>Open <a href="https://replit.com/refer/info7410" target="_blank" rel="noopener noreferrer" className="text-primary underline">Replit</a> and create a new project</p>
          </div>
          <div className="flex gap-3">
            <div className={ds.stepCircle + " flex-shrink-0"}>2</div>
            <p className={ds.body}>Open the Replit AI chat and paste your entire PRD</p>
          </div>
          <div className="flex gap-3">
            <div className={ds.stepCircle + " flex-shrink-0"}>3</div>
            <p className={ds.body}>Tell it: "Build this app based on my PRD"</p>
          </div>
          <div className="flex gap-3">
            <div className={ds.stepCircle + " flex-shrink-0"}>4</div>
            <p className={ds.body}>Watch the magic happen!</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
          <p className={ds.body}>
            <strong>Important:</strong> Let Replit build your initial app, then STOP. Don't start adding features or iterating yet - Replit charges per use and can get expensive quickly. In the next lesson we'll show you how to switch to Claude Code for ongoing work (much cheaper!).
          </p>
        </div>
      </div>

      <div className={ds.cardWithPadding}>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep("generate")}>
            ← Back
          </Button>
          <Button size="lg" onClick={handleContinue}>
            I've Pasted My PRD Into Replit
          </Button>
        </div>
      </div>
    </div>
  );
}
