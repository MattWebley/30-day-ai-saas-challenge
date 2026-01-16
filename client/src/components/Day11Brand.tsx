import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Palette, Copy, Check } from "lucide-react";

interface Day11BrandProps {
  appName: string;
  onComplete: (data: {
    primaryColor: string;
    primaryColorName: string;
    fontChoice: string;
    brandVibe: string;
  }) => void;
}

const COLOR_OPTIONS = [
  { id: "blue", name: "Blue", hex: "#3B82F6", vibe: "Trustworthy, Professional" },
  { id: "green", name: "Green", hex: "#22C55E", vibe: "Growth, Money, Health" },
  { id: "purple", name: "Purple", hex: "#8B5CF6", vibe: "Creative, Premium" },
  { id: "orange", name: "Orange", hex: "#F97316", vibe: "Friendly, Energetic" },
  { id: "red", name: "Red", hex: "#EF4444", vibe: "Bold, Urgent" },
  { id: "indigo", name: "Indigo", hex: "#6366F1", vibe: "Modern, Tech" },
  { id: "teal", name: "Teal", hex: "#14B8A6", vibe: "Fresh, Innovative" },
  { id: "slate", name: "Slate/Black", hex: "#1E293B", vibe: "Sophisticated, Luxury" },
];

const FONT_OPTIONS = [
  { id: "inter", name: "Inter", style: "Clean & Modern", sample: "font-sans" },
  { id: "poppins", name: "Poppins", style: "Friendly & Approachable", sample: "font-sans" },
  { id: "roboto", name: "Roboto", style: "Neutral & Readable", sample: "font-sans" },
  { id: "space-grotesk", name: "Space Grotesk", style: "Tech & Contemporary", sample: "font-mono" },
];

export function Day11Brand({ appName, onComplete }: Day11BrandProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"color" | "font" | "apply" | "done">("color");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("");
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentColor = COLOR_OPTIONS.find(c => c.id === selectedColor);
  const currentFont = FONT_OPTIONS.find(f => f.id === selectedFont);
  const finalColor = customColor || currentColor?.hex || "#3B82F6";

  const claudeCodePrompt = `Use ${finalColor} as the primary color throughout the app. All buttons should be ${finalColor}. Use ${currentFont?.name || "Inter"} font for all text. Keep spacing consistent - 16px padding on cards, 8px gaps between elements.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(claudeCodePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Pick Color */}
      {step === "color" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Pick Your Primary Color</h4>
            <p className="text-slate-700 mb-4">
              This one color will be used for buttons, links, and accents throughout <strong>{appName || "your app"}</strong>.
            </p>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {COLOR_OPTIONS.map((color) => {
                const isSelected = selectedColor === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => {
                      setSelectedColor(color.id);
                      setCustomColor("");
                    }}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-slate-900"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-lg mb-2 border border-slate-200"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="text-sm font-medium text-slate-900">{color.name}</p>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-900 mt-1" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <p className="text-slate-700 font-medium">Or enter custom hex:</p>
              <Input
                placeholder="#FF5733"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setSelectedColor(null);
                }}
                className="w-32"
              />
              {customColor && (
                <div
                  className="w-8 h-8 rounded border border-slate-200"
                  style={{ backgroundColor: customColor }}
                />
              )}
            </div>

            {currentColor && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700">
                  <strong>{currentColor.name}</strong> says: {currentColor.vibe}
                </p>
              </div>
            )}
          </Card>

          {(selectedColor || customColor) && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("font")}
            >
              Choose Font <Palette className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Pick Font */}
      {step === "font" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Choose Your Font</h4>
            <p className="text-slate-700 mb-4">
              Pick one font that matches your brand vibe. You can always change it later.
            </p>

            <div className="space-y-3">
              {FONT_OPTIONS.map((font) => {
                const isSelected = selectedFont === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <p className={`text-xl font-bold text-slate-900 ${font.sample}`}>{font.name}</p>
                      <p className="text-slate-600">{font.style}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </Card>

          {selectedFont && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("apply")}
            >
              Apply to Your App
            </Button>
          )}
        </>
      )}

      {/* Step 3: Apply */}
      {step === "apply" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Your Brand</h4>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-lg border border-slate-200"
                style={{ backgroundColor: finalColor }}
              />
              <div>
                <p className="text-slate-700"><strong>Color:</strong> {currentColor?.name || "Custom"} ({finalColor})</p>
                <p className="text-slate-700"><strong>Font:</strong> {currentFont?.name}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Tell Claude Code</h4>
            <p className="text-slate-700 mb-3">
              Copy this prompt and paste it to Claude Code to apply your brand:
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
              <p className="text-slate-700 text-sm font-mono">{claudeCodePrompt}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Prompt"}
            </Button>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Did you apply the branding?</h4>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasApplied"
                checked={hasApplied}
                onChange={(e) => setHasApplied(e.target.checked)}
                className="w-5 h-5 text-primary rounded"
              />
              <label htmlFor="hasApplied" className="text-slate-700">
                I've applied my brand colors and font to my app
              </label>
            </div>
          </Card>

          {hasApplied && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("done")}
            >
              Complete Branding
            </Button>
          )}
        </>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-900">Brand Applied!</h4>
                <p className="text-green-700">
                  Your app now has a consistent, professional look.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Your Brand Identity</h4>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg border border-slate-200"
                style={{ backgroundColor: finalColor }}
              />
              <div className="space-y-1">
                <p className="text-slate-700"><strong>Primary Color:</strong> {currentColor?.name || "Custom"} ({finalColor})</p>
                <p className="text-slate-700"><strong>Font:</strong> {currentFont?.name}</p>
                <p className="text-slate-600">{currentColor?.vibe || "Custom style"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-600">
              <strong>What's next:</strong> Now that your app looks consistent, we'll add the AI brain that makes it special.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => onComplete({
              primaryColor: finalColor,
              primaryColorName: currentColor?.name || "Custom",
              fontChoice: currentFont?.name || "",
              brandVibe: currentColor?.vibe || "Custom",
            })}
          >
            Complete Day 11 <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
