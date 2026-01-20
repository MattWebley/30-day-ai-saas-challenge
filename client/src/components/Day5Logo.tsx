import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ChevronLeft, ExternalLink, Upload, Palette, Type } from "lucide-react";

interface Day5LogoProps {
  appName: string;
  onComplete: (data: {
    logoType: string;
    logoDescription: string;
    toolUsed: string;
  }) => void;
}

const LOGO_TYPES = [
  { id: "wordmark", label: "Text-only (Wordmark)", icon: Type, description: "Just your app name in a nice font. Clean & professional." },
  { id: "icon-text", label: "Icon + Text", icon: Palette, description: "A simple symbol next to your name." },
  { id: "ai-generated", label: "AI-Generated", icon: Upload, description: "Use AI tools to generate logo concepts." },
];

const LOGO_TOOLS = [
  { id: "canva", label: "Canva", url: "https://www.canva.com/logos/", description: "Free, easy templates" },
  { id: "midjourney", label: "Midjourney", url: "https://www.midjourney.com/", description: "AI image generation" },
  { id: "ideogram", label: "Ideogram", url: "https://ideogram.ai/", description: "AI with text support" },
  { id: "logomaker", label: "Logo Maker", url: "https://www.namecheap.com/logo-maker/", description: "Namecheap's free tool" },
];

export function Day5Logo({ appName, onComplete }: Day5LogoProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"choose" | "create" | "confirm">("choose");
  const [logoType, setLogoType] = useState<string | null>(null);
  const [toolUsed, setToolUsed] = useState<string | null>(null);
  const [logoDescription, setLogoDescription] = useState("");
  const [hasCreated, setHasCreated] = useState(false);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Choose Logo Type */}
      {step === "choose" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-4">What type of logo do you want?</h4>
            <p className="text-slate-700 mb-4">
              Your logo is the face of <strong>{appName || "your app"}</strong>. Choose the style that fits your brand.
            </p>
            <div className="space-y-3">
              {LOGO_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = logoType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setLogoType(type.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{type.label}</p>
                      <p className="text-slate-600">{type.description}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </Card>

          {logoType && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("create")}
            >
              Create Your Logo
            </Button>
          )}
        </>
      )}

      {/* Step 2: Create Logo */}
      {step === "create" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Create Your Logo</h4>
            <p className="text-slate-700 mb-4">
              Pick a tool and create your logo. This shouldn't take more than 30 minutes.
            </p>

            <div className="space-y-3 mb-6">
              {LOGO_TOOLS.map((tool) => {
                const isSelected = toolUsed === tool.id;
                return (
                  <div
                    key={tool.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      isSelected ? "border-primary bg-primary/5" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setToolUsed(tool.id)}
                        className="w-4 h-4 text-primary"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{tool.label}</p>
                        <p className="text-slate-600">{tool.description}</p>
                      </div>
                    </div>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      Open <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </Card>

          {logoType === "wordmark" && (
            <Card className="p-6 border-2 border-slate-200 bg-white">
              <h4 className="text-lg font-bold text-slate-900 mb-3">Quick Wordmark Guide</h4>
              <ol className="space-y-2 text-slate-700">
                <li>1. Open Canva and search "logo" templates</li>
                <li>2. Pick a simple, minimal template</li>
                <li>3. Replace the text with "{appName || "your app name"}"</li>
                <li>4. Choose 1-2 colors max</li>
                <li>5. Download as PNG (transparent background if possible)</li>
              </ol>
            </Card>
          )}

          {logoType === "ai-generated" && (
            <Card className="p-6 border-2 border-slate-200 bg-white">
              <h4 className="text-lg font-bold text-slate-900 mb-3">AI Logo Prompt</h4>
              <p className="text-slate-700 mb-3">Try this prompt in Midjourney or Ideogram:</p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-slate-700 font-mono text-sm">
                  "Minimal modern logo for {appName || "[your app name]"}, simple geometric design, flat vector style, single color, white background --v 6"
                </p>
              </div>
            </Card>
          )}

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-3">I've created my logo</h4>
            <p className="text-slate-700 mb-4">
              Describe your logo briefly (helps you remember what you chose):
            </p>
            <Input
              placeholder="e.g., Blue wordmark in Inter font, all lowercase"
              value={logoDescription}
              onChange={(e) => setLogoDescription(e.target.value)}
              className="mb-4"
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasCreated"
                checked={hasCreated}
                onChange={(e) => setHasCreated(e.target.checked)}
                className="w-5 h-5 text-primary rounded"
              />
              <label htmlFor="hasCreated" className="text-slate-700">
                I've created and saved my logo file
              </label>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("choose")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            {toolUsed && hasCreated && logoDescription.length >= 5 && (
              <Button
                size="lg"
                className="flex-1 h-14 text-lg font-bold gap-2"
                onClick={() => setStep("confirm")}
              >
                Review & Complete
              </Button>
            )}
          </div>
        </>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">Logo Created!</h4>
                <p className="text-green-700">
                  Your app now has a face.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Your Logo</h4>
            <div className="space-y-2 text-slate-700">
              <p><strong>Type:</strong> {LOGO_TYPES.find(t => t.id === logoType)?.label}</p>
              <p><strong>Tool:</strong> {LOGO_TOOLS.find(t => t.id === toolUsed)?.label}</p>
              <p><strong>Description:</strong> {logoDescription}</p>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-600">
              <strong>Tip:</strong> Save your logo in multiple sizes (favicon at 32x32, header at ~200px wide). You can always refine it later - the important thing is you have one now.
            </p>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("create")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                logoType: logoType || "",
                logoDescription,
                toolUsed: toolUsed || "",
              })}
            >
              Complete Day 5 <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
