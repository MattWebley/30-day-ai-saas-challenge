import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ChevronLeft, ChevronDown, ChevronUp, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { ds } from "@/lib/design-system";

interface Day5LogoProps {
  appName: string;
  userIdea?: string;
  onComplete: (data: {
    logoType: string;
    logoDescription: string;
    toolUsed: string;
    brandVibe?: string;
  }) => void;
}

const BRAND_VIBES = [
  { id: "minimal", label: "Minimal & Clean", keywords: "minimal, clean, simple, whitespace, modern" },
  { id: "bold", label: "Bold & Strong", keywords: "bold, strong, powerful, impactful, confident" },
  { id: "playful", label: "Playful & Fun", keywords: "playful, fun, friendly, approachable, colorful" },
  { id: "professional", label: "Professional & Corporate", keywords: "professional, corporate, trustworthy, established, reliable" },
  { id: "techy", label: "Tech & Modern", keywords: "tech, modern, futuristic, innovative, cutting-edge" },
  { id: "elegant", label: "Elegant & Premium", keywords: "elegant, premium, luxury, sophisticated, refined" },
];

const COLOR_PREFERENCES = [
  // Single colors (like Spotify, Netflix, Facebook)
  { id: "classic-blue", label: "Classic Blue", colors: ["#2563eb"], keywords: "blue, trustworthy, professional, like Facebook or LinkedIn", isGradient: false },
  { id: "bold-red", label: "Bold Red", colors: ["#dc2626"], keywords: "red, powerful, exciting, like Netflix or YouTube", isGradient: false },
  { id: "fresh-green", label: "Fresh Green", colors: ["#16a34a"], keywords: "green, growth, fresh, like Spotify or WhatsApp", isGradient: false },
  { id: "modern-purple", label: "Modern Purple", colors: ["#7c3aed"], keywords: "purple, creative, modern, like Twitch or Figma", isGradient: false },
  { id: "monochrome", label: "Black & White", colors: ["#000000", "#ffffff"], keywords: "monochrome, black and white, classic, timeless, like Apple or Nike", isGradient: false },
  // Gradients (like Instagram, Stripe)
  { id: "sunset-gradient", label: "Sunset Gradient", colors: ["#f97316", "#ec4899", "#8b5cf6"], keywords: "gradient from orange to pink to purple, like Instagram, vibrant, social", isGradient: true },
  { id: "ocean-gradient", label: "Ocean Gradient", colors: ["#06b6d4", "#3b82f6", "#8b5cf6"], keywords: "gradient from cyan to blue to purple, like Stripe, professional, tech", isGradient: true },
  { id: "aurora-gradient", label: "Aurora Gradient", colors: ["#10b981", "#06b6d4", "#6366f1"], keywords: "gradient from green to cyan to indigo, fresh, modern, innovative", isGradient: true },
  // Custom option
  { id: "other", label: "Other", colors: ["#94a3b8", "#cbd5e1", "#e2e8f0"], keywords: "", isGradient: false, isOther: true },
];

// No specific AI tools listed - they change too fast

export function Day5Logo({ appName, userIdea, onComplete }: Day5LogoProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"customize" | "create" | "confirm">("customize");
  const [brandVibe, setBrandVibe] = useState<string | null>(null);
  const [colorPreference, setColorPreference] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [toolUsed, setToolUsed] = useState<string | null>(null);
  const [logoDescription, setLogoDescription] = useState("");
  const [hasCreated, setHasCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCanvaGuide, setShowCanvaGuide] = useState(false);

  const displayName = appName || "YourApp";
  const selectedColor = COLOR_PREFERENCES.find(c => c.id === colorPreference);
  const isGradientSelected = selectedColor?.isGradient || false;

  const generateAIPrompt = () => {
    const vibe = BRAND_VIBES.find(v => v.id === brandVibe);
    const vibeKeywords = vibe?.keywords || "modern, clean";
    const color = COLOR_PREFERENCES.find(c => c.id === colorPreference);
    const colorKeywords = colorPreference === "other" && customColors
      ? customColors
      : color?.keywords || "single or two colors";

    const gradientNote = isGradientSelected
      ? "Use a smooth gradient."
      : "No gradients, no shadows, no 3D effects.";

    const prompt = `Create a simple, memorable logo for "${displayName}"${userIdea ? `, a ${userIdea}` : ""}. Style: ${vibeKeywords}. Colors: ${colorKeywords}. The logo should work at small sizes (favicon). Vector style, flat design, white background. ${gradientNote} --v 6`;

    setGeneratedPrompt(prompt);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success("Prompt copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const regeneratePrompt = () => {
    generateAIPrompt();
    toast.success("Prompt regenerated!");
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Brand Vibe & Colors - Generate AI Prompt */}
      {step === "customize" && (
        <>
          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-2"}>What's your brand vibe?</h4>
            <p className={ds.muted + " mb-4"}>Pick the style that fits your app.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BRAND_VIBES.map((vibe) => {
                const isSelected = brandVibe === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setBrandVibe(vibe.id)}
                    className={isSelected ? ds.optionSelected : ds.optionDefault}
                  >
                    <p className={isSelected ? "font-medium text-primary" : ds.label}>
                      {vibe.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {brandVibe && (
            <div className={ds.cardWithPadding}>
              <h4 className={ds.heading + " mb-2"}>What colors do you want?</h4>
              <p className={ds.muted + " mb-4"}>Pick a color style for your logo.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_PREFERENCES.map((color) => {
                  const isSelected = colorPreference === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => setColorPreference(color.id)}
                      className={isSelected ? ds.optionSelected + " scale-[1.02]" : ds.optionDefault}
                    >
                      <div className="flex gap-1 mb-2">
                        {color.id === "other" ? (
                          <div className="w-full h-8 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-sm font-medium">
                            Your choice
                          </div>
                        ) : color.isGradient ? (
                          <div
                            className="w-full h-8 rounded-md border border-slate-200"
                            style={{ background: `linear-gradient(135deg, ${color.colors.join(', ')})` }}
                          />
                        ) : (
                          color.colors.map((c, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-md border border-slate-200"
                              style={{ backgroundColor: c }}
                            />
                          ))
                        )}
                      </div>
                      <p className={isSelected ? "font-medium text-sm text-primary" : ds.label + " text-sm"}>
                        {color.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Custom color input when "Other" is selected */}
              {colorPreference === "other" && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className={ds.label + " block mb-2"}>
                    Describe your colors
                  </label>
                  <Input
                    placeholder="e.g., teal and coral, dark navy with gold accents, earthy browns and greens"
                    value={customColors}
                    onChange={(e) => setCustomColors(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {brandVibe && colorPreference && (colorPreference !== "other" || customColors.length > 0) && (
            <div className={ds.cardWithPadding}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={ds.heading}>Your AI Logo Prompt</h4>
                  <p className={ds.muted}>Copy this into any AI image tool.</p>
                </div>
                <Button
                  size="sm"
                  onClick={generatedPrompt ? regeneratePrompt : generateAIPrompt}
                >
                  {generatedPrompt ? "Regenerate" : "Generate"}
                </Button>
              </div>

              {!generatedPrompt ? (
                <div className="p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-center">
                  <p className={ds.muted}>Click "Generate" to create your logo prompt</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-900 rounded-lg">
                    <p className="text-slate-100 font-mono text-sm leading-relaxed">
                      {generatedPrompt}
                    </p>
                  </div>
                  <Button
                    onClick={copyPrompt}
                    className={`w-full gap-2 transition-colors ${copied ? "bg-green-600 hover:bg-green-600 text-white border-green-600" : ""}`}
                    variant="outline"
                  >
                    {copied ? (
                      <><CheckCircle2 className="w-4 h-4" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy Prompt</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {generatedPrompt && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("create")}
            >
              Next: Create Your Logo
            </Button>
          )}
        </>
      )}

      {/* Step 2: Create Logo with AI Tools */}
      {step === "create" && (
        <>
          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-2"}>Create Your Logo with AI</h4>
            <p className={ds.body + " mb-4"}>
              AI image tools change ALL the time. What works great today might not tomorrow. Here's the approach
            </p>

            <div className="space-y-4">
              {/* Option 1: Use what you have */}
              <div
                className={toolUsed === "existing-ai" ? ds.optionSelected : ds.optionDefault}
                onClick={() => setToolUsed("existing-ai")}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={toolUsed === "existing-ai"}
                    onChange={() => setToolUsed("existing-ai")}
                    className="w-4 h-4 text-primary mt-1"
                  />
                  <div>
                    <p className={ds.label}>Option 1: Use What You Already Have</p>
                    <p className={ds.body + " mt-1"}>
                      If you're already paying for ChatGPT Plus or another AI with image generation - give it a try. Some models are better at logos than others, so you may need to experiment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Abacus AI (Recommended for images) */}
              <div
                className={toolUsed === "abacus" ? ds.optionSelected : ds.optionDefault}
                onClick={() => setToolUsed("abacus")}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={toolUsed === "abacus"}
                    onChange={() => setToolUsed("abacus")}
                    className="w-4 h-4 text-primary mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={ds.label}>Option 2: Try Multiple AI Models</p>
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-medium">RECOMMENDED</span>
                    </div>
                    <p className={ds.body + " mt-1"}>
                      Use Abacus AI to test your prompt across different image generators - DALL-E, Stable Diffusion, Midjourney-style models, and more. Same prompt, multiple models, see what looks best. This is the best way to get a great logo.
                    </p>
                    <a
                      href="https://chatllm.abacus.ai/WlwgmxfvHg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline mt-2 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open Abacus AI <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt reference */}
            <div className="mt-4 p-4 bg-slate-900 rounded-lg">
              <p className={ds.capsLabel + " text-slate-400 mb-2"}>YOUR PROMPT</p>
              <p className="text-slate-100 font-mono text-sm leading-relaxed">
                {generatedPrompt}
              </p>
              <Button
                onClick={copyPrompt}
                className={`w-full mt-3 gap-2 transition-colors ${copied ? "bg-green-600 hover:bg-green-600 text-white border-green-600" : ""}`}
                variant="outline"
              >
                {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Prompt</>}
              </Button>
            </div>
          </div>

          {/* Fallback Options */}
          <div className={ds.cardWithPadding}>
            <button
              onClick={() => setShowCanvaGuide(!showCanvaGuide)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <p className={ds.label}>AI not working? Fallback options</p>
                <p className={ds.muted}>DIY text logo or hire someone cheap</p>
              </div>
              {showCanvaGuide ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {showCanvaGuide && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-6">
                {/* Canva DIY */}
                <div>
                  <h5 className={ds.label + " mb-3"}>Make a Text Logo in 5 Minutes (Free)</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={ds.stepCircle + " flex-shrink-0"}>1</div>
                      <p className={ds.body}>Go to <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Canva</a> (free)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={ds.stepCircle + " flex-shrink-0"}>2</div>
                      <p className={ds.body}>Search "logo" templates</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={ds.stepCircle + " flex-shrink-0"}>3</div>
                      <p className={ds.body}>Pick one that's SIMPLE (avoid busy designs)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={ds.stepCircle + " flex-shrink-0"}>4</div>
                      <p className={ds.body}>Replace the text with your app name... <strong>{displayName}</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={ds.stepCircle + " flex-shrink-0"}>5</div>
                      <p className={ds.body}>Choose 1-2 colors max</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={ds.stepCircle + " flex-shrink-0"}>6</div>
                      <p className={ds.body}>Download as PNG</p>
                    </div>
                  </div>
                  <div className={ds.infoBoxHighlight + " mt-4"}>
                    <p className={ds.muted}>
                      <strong>Pro tip</strong> - Text-only logos are totally fine. Stripe, Google, and FedEx all use text logos. Simple = memorable.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 gap-2"
                    onClick={() => {
                      setToolUsed("canva-text");
                      window.open("https://www.canva.com/logos/", "_blank");
                    }}
                  >
                    Open Canva <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                {/* Fiverr outsource */}
                <div className="pt-4 border-t border-slate-200">
                  <h5 className={ds.label + " mb-2"}>Or Just Outsource It ($5-20)</h5>
                  <p className={ds.body + " mb-3"}>
                    Not into design? Hire someone on Fiverr. Logos start at $5 and you can get something decent for under $20. Takes the pressure off.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setToolUsed("fiverr");
                      window.open("https://www.fiverr.com/categories/graphics-design/creative-logo-design", "_blank");
                    }}
                  >
                    Browse Fiverr Logo Designers <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Confirmation */}
          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-3"}>I've created my logo</h4>
            <p className={ds.body + " mb-4"}>
              Describe your logo briefly (helps you remember what you chose)
            </p>
            <Input
              placeholder={`e.g., Blue abstract icon with "${displayName}" text`}
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
              <label htmlFor="hasCreated" className={ds.body}>
                I've created and saved my logo file
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("customize")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            {(toolUsed || hasCreated) && hasCreated && logoDescription.length >= 5 && (
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
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3">
              <div className={ds.stepCircleComplete + " w-12 h-12"}>
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className={ds.successText + " font-bold text-xl"}>Logo Created!</h4>
                <p className={ds.body}>
                  Your app now has a face.
                </p>
              </div>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-3"}>Your Logo</h4>
            <div className={"space-y-2 " + ds.body}>
              <p><strong>Vibe:</strong> {BRAND_VIBES.find(v => v.id === brandVibe)?.label}</p>
              <p><strong>Colors:</strong> {COLOR_PREFERENCES.find(c => c.id === colorPreference)?.label}</p>
              <p><strong>Method:</strong> {
                toolUsed === "canva-text" ? "Canva (Text Logo)" :
                toolUsed === "fiverr" ? "Fiverr Designer" :
                toolUsed === "existing-ai" ? "Existing AI Tool" :
                toolUsed === "abacus" ? "Abacus AI" : "Other"
              }</p>
              <p><strong>Description:</strong> {logoDescription}</p>
            </div>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.muted}>
              <strong>Tip:</strong> Save your logo in multiple sizes (favicon at 32x32, header at ~200px wide). You can always refine it later.
            </p>
          </div>

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
                logoType: toolUsed === "canva-text" ? "text-logo" : "ai-generated",
                logoDescription,
                toolUsed: toolUsed || "other",
                brandVibe: brandVibe || undefined,
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
