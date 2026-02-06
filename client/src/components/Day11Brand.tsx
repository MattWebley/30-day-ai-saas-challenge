import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ChevronLeft, Sparkles, Copy, Check, Globe, Loader2, ExternalLink } from "lucide-react";

interface Day11BrandProps {
  appName: string;
  onComplete: (data: {
    primaryColor: string;
    primaryColorName: string;
    designPersonality: string;
    brandVibe: string;
    method: string;
    selectedPersonality: string | null;
    selectedColor: string | null;
  }) => void;
  savedInputs?: Record<string, any>;
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

const DESIGN_PERSONALITIES = [
  {
    id: "spotify",
    name: "Spotify",
    tagline: "Dark & Energetic",
    preview: "Bold dark mode, vibrant green accents, music energy",
    prompt: `Design like Spotify - dark, bold, and energetic:
- DARK MODE: Rich black backgrounds (#121212) with subtle gray layers
- Vibrant accent color that POPS against the dark
- Bold, punchy typography - headlines grab attention
- Cards and album-art style imagery
- Rounded corners on buttons and cards
- Hover states that feel alive and responsive
- Dense but organized - lots of content, never cluttered
- Green accents for actions and highlights
- Everything feels modern and music-forward`,
  },
  {
    id: "netflix",
    name: "Netflix",
    tagline: "Cinematic & Bold",
    preview: "Dark, dramatic, red accents, content takes center stage",
    prompt: `Design like Netflix - cinematic, immersive, dramatic:
- VERY DARK: Almost black backgrounds, content is the star
- Red accent color for CTAs and key actions
- Large imagery and thumbnails that dominate
- Typography is bold but minimal - let visuals speak
- Cards have hover effects that expand or highlight
- Smooth transitions and animations
- Content-first - UI gets out of the way
- High contrast between dark background and content
- Everything feels like entertainment`,
  },
  {
    id: "airbnb",
    name: "Airbnb",
    tagline: "Warm & Inviting",
    preview: "Friendly, trustworthy, beautiful photography, feels human",
    prompt: `Design like Airbnb - warm, human, inviting:
- WARM COLOR PALETTE: Soft pinks, corals, warm grays
- Large, beautiful imagery throughout
- Rounded corners but not childish (8-12px radius)
- Typography feels friendly and readable
- Cards have subtle shadows, feel touchable
- Lots of whitespace but still content-rich
- Search and filtering are prominent
- Everything feels trustworthy and safe
- Micro-interactions make it feel alive`,
  },
  {
    id: "duolingo",
    name: "Duolingo",
    tagline: "Fun & Playful",
    preview: "Rounded, colorful, gamified, makes you smile",
    prompt: `Design like Duolingo - playful, fun, gamified:
- ROUNDED EVERYTHING: Big border-radius on cards, buttons, inputs (16px+)
- Bold, saturated colors that pop and feel joyful
- Chunky shadows that give depth (not subtle - BOLD drop shadows)
- Typography is friendly and rounded
- Generous padding makes everything feel touchable
- Hover states are bouncy and satisfying
- Success states are celebratory with color
- Nothing feels corporate or boring
- Buttons look like you WANT to click them
- Progress bars and achievements feel rewarding`,
  },
  {
    id: "apple",
    name: "Apple",
    tagline: "Premium & Elegant",
    preview: "Beautiful typography, refined details, worth paying for",
    prompt: `Design like Apple - premium, elegant, refined:
- TYPOGRAPHY IS ART: San Francisco or similar, perfect sizing and weight
- Generous, intentional whitespace - let things breathe
- Subtle animations that feel magical and smooth
- High contrast for key elements
- Photos and imagery are large and stunning
- Buttons are understated but clear
- Everything has perfect alignment
- Color palette is restrained and sophisticated
- Details are obsessed over - every pixel matters
- Glass effects and subtle gradients where appropriate`,
  },
  {
    id: "uber",
    name: "Uber",
    tagline: "Clean & Minimal",
    preview: "Black and white, functional, no-nonsense, modern",
    prompt: `Design like Uber - clean, minimal, functional:
- BLACK AND WHITE as the foundation
- Very clean, no unnecessary decoration
- Typography is bold and clear - easy to read quickly
- Lots of whitespace, nothing feels cramped
- Accent color used sparingly for key actions only
- Cards and containers have minimal borders
- Maps and location elements are prominent
- Everything feels fast and efficient
- Mobile-first thinking - thumb-friendly tap targets
- Shadows are subtle, almost flat design`,
  },
  {
    id: "slack",
    name: "Slack",
    tagline: "Professional & Friendly",
    preview: "Purple accents, approachable, work feels less like work",
    prompt: `Design like Slack - professional but friendly:
- PURPLE as the signature accent color
- Light, airy interface with subtle colors
- Rounded corners throughout (8px)
- Typography is clean and highly readable
- Sidebar navigation is prominent
- Emoji and reactions feel natural
- Messages and cards have subtle backgrounds
- Hover states are clear but not aggressive
- Everything feels approachable and human
- Professional without being boring or corporate`,
  },
  {
    id: "calm",
    name: "Calm",
    tagline: "Soft & Peaceful",
    preview: "Soothing colors, gentle, wellness vibes, relaxing",
    prompt: `Design like Calm - peaceful, soothing, wellness-focused:
- SOFT COLOR PALETTE: Muted blues, soft greens, gentle gradients
- Lots of breathing room - generous whitespace everywhere
- Typography is gentle and easy on the eyes
- Rounded corners, nothing sharp or harsh
- Subtle animations that feel slow and calming
- Nature imagery and soft textures
- Dark mode option with deep, restful blues
- Everything feels like a deep breath
- No urgency, no aggressive CTAs
- Buttons and actions feel gentle, not pushy`,
  },
];

type StepType = "choose-method" | "personality" | "url-input" | "url-result" | "color" | "apply" | "done";

export function Day11Brand({ appName, onComplete, savedInputs }: Day11BrandProps) {
  const [step, setStep, containerRef] = useStepWithScroll<StepType>("choose-method");
  const [method, setMethod] = useState<"personality" | "url" | null>(savedInputs?.method || null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(savedInputs?.selectedPersonality || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(savedInputs?.selectedColor || null);
  const [customColor, setCustomColor] = useState(savedInputs?.customColor || "");
  const [hasApplied, setHasApplied] = useState(savedInputs?.hasApplied || false);
  const [copied, setCopied] = useState(false);

  // URL inspiration state
  const [urlInput, setUrlInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [urlAnalysis, setUrlAnalysis] = useState<{
    analysis: string;
    generatedPrompt: string;
    screenshotUrl: string;
  } | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // AI usage limits
  const [urlAnalyzeAttempts, setUrlAnalyzeAttempts] = useState(0);
  const MAX_URL_ATTEMPTS = 3;

  const currentPersonality = DESIGN_PERSONALITIES.find(p => p.id === selectedPersonality);
  const currentColor = COLOR_OPTIONS.find(c => c.id === selectedColor);
  const finalColor = customColor || currentColor?.hex || "#3B82F6";

  // Generate prompt based on method
  const getClaudeCodePrompt = () => {
    if (method === "url" && urlAnalysis) {
      // Add color to the URL-generated prompt
      return `${urlAnalysis.generatedPrompt}

**PRIMARY COLOR: ${finalColor}**
Use this as the main accent color, adapting it to work with the style described above.

**IMPORTANT:**
1. This is a COMPLETE visual overhaul - be bold
2. Keep existing layout and functionality
3. Make sure all text remains readable
4. The app is called "${appName || 'my app'}"`;
    }

    if (method === "personality" && currentPersonality) {
      return `Transform my app's design to look like this:

**DESIGN PERSONALITY: ${currentPersonality.name}**
${currentPersonality.prompt}

**PRIMARY COLOR: ${finalColor}**
Use this as the main accent color for buttons, links, and key interactive elements. Adapt it to work with the design personality above.

**IMPORTANT INSTRUCTIONS:**
1. This is a COMPLETE visual overhaul - be bold, not conservative
2. Update the CSS/theme files, component styles, everything visual
3. Keep the existing layout and functionality - just transform the look
4. If the personality calls for dark mode, implement it fully
5. Make sure all text remains readable with good contrast
6. Apply consistent styling across ALL components

The app is called "${appName || 'my app'}". Make it look like it belongs in the same family as ${currentPersonality.name.split('-')[0]}.`;
    }

    return "";
  };

  const claudeCodePrompt = getClaudeCodePrompt();

  const handleCopy = () => {
    navigator.clipboard.writeText(claudeCodePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const analyzeUrl = async () => {
    if (!urlInput.trim()) return;

    if (urlAnalyzeAttempts >= MAX_URL_ATTEMPTS) {
      setUrlError("Analysis limit reached. Please choose a design personality instead.");
      return;
    }

    setIsAnalyzing(true);
    setUrlError(null);

    try {
      const response = await fetch("/api/analyze-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error - please restart the app and try again");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to analyze");
      }

      const data = await response.json();
      setUrlAnalysis(data);
      setUrlAnalyzeAttempts(prev => prev + 1);
      setStep("url-result");
    } catch (error: any) {
      setUrlError(error.message || "Failed to analyze the website. Try a different URL.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 0: Choose Method */}
      {step === "choose-method" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-2">How do you want to define your style?</h4>
            <p className="text-slate-700 mb-6">
              Pick a proven design style, or get inspired by a website you love.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setMethod("personality");
                  setStep("personality");
                }}
                className="text-left p-5 rounded-xl border-2 border-slate-200 hover:border-primary hover:shadow-md transition-all bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-slate-900 mb-1">Pick a Design Style</p>
                <p className="text-sm text-slate-600">
                  Choose from 8 proven styles like Stripe, Linear, Notion, Duolingo...
                </p>
              </button>

              <button
                onClick={() => {
                  setMethod("url");
                  setStep("url-input");
                }}
                className="text-left p-5 rounded-xl border-2 border-slate-200 hover:border-primary hover:shadow-md transition-all bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-slate-900 mb-1">Get Inspired by a URL</p>
                <p className="text-sm text-slate-600">
                  Paste a website you love and we'll analyze its style for you
                </p>
              </button>
            </div>
          </Card>
        </>
      )}

      {/* URL Input Step */}
      {step === "url-input" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-2">What website inspires you?</h4>
            <p className="text-slate-700 mb-4">
              Paste a URL and we'll analyze its design style. We'll capture the overall vibe - colors, spacing, typography feel - and create a prompt to recreate something similar.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Website URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && analyzeUrl()}
                  />
                  <Button
                    onClick={analyzeUrl}
                    disabled={!urlInput.trim() || isAnalyzing || urlAnalyzeAttempts >= MAX_URL_ATTEMPTS}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : urlAnalyzeAttempts >= MAX_URL_ATTEMPTS ? (
                      <>Limit reached</>
                    ) : urlAnalyzeAttempts > 0 ? (
                      <>Try Another URL</>
                    ) : (
                      <>Analyze</>
                    )}
                  </Button>
                </div>
              </div>

              {urlError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {urlError}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm">
                <strong>Note:</strong> This gives you an <em>approximate</em> style inspired by the site - not an exact copy. Results vary depending on how the site renders.
              </p>
            </div>
          </Card>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep("choose-method")}
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>
        </>
      )}

      {/* URL Analysis Result */}
      {step === "url-result" && urlAnalysis && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Style Analysis</h4>

            {/* Screenshot preview */}
            <div className="mb-4 rounded-lg overflow-hidden border border-slate-200">
              <img
                src={urlAnalysis.screenshotUrl}
                alt="Website screenshot"
                className="w-full h-48 object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="prose prose-sm prose-slate max-w-none">
              <div className="text-slate-700 whitespace-pre-wrap text-sm">
                {urlAnalysis.analysis.split('Transform my app')[0]}
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("color")}
          >
            Choose Your Color <Sparkles className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setUrlAnalysis(null);
              setStep("url-input");
            }}
            className="w-full gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Try a Different URL
          </Button>
        </>
      )}

      {/* Step 1: Pick Design Personality */}
      {step === "personality" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-2">What should your app FEEL like?</h4>
            <p className="text-slate-700 mb-6">
              Pick a design personality. Claude Code will transform your entire app to match this vibe - not just colors, but spacing, shadows, animations, everything.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DESIGN_PERSONALITIES.map((personality) => {
                const isSelected = selectedPersonality === personality.id;
                return (
                  <button
                    key={personality.id}
                    onClick={() => setSelectedPersonality(personality.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-slate-900">{personality.name}</p>
                        <p className="text-sm text-primary font-medium">{personality.tagline}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-600">{personality.preview}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("choose-method")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            {selectedPersonality && (
              <Button
                size="lg"
                className="flex-1 h-14 text-lg font-bold gap-2"
                onClick={() => setStep("color")}
              >
                Choose Your Color <Sparkles className="w-5 h-5" />
              </Button>
            )}
          </div>
        </>
      )}

      {/* Step 2: Pick Color */}
      {step === "color" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary">
                  {method === "url" ? "Inspired by URL" : currentPersonality?.name}
                </span>
              </div>
            </div>

            <h4 className="text-lg font-bold text-slate-900 mb-2">Pick Your Accent Color</h4>
            <p className="text-slate-700 mb-4">
              This color will be your main accent for buttons, links, and interactive elements.
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
              <p className="text-slate-700 font-medium">Or enter custom hex</p>
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

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(method === "url" ? "url-result" : "personality")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            {(selectedColor || customColor) && (
              <Button
                size="lg"
                className="flex-1 h-14 text-lg font-bold gap-2"
                onClick={() => setStep("apply")}
              >
                Generate Prompt
              </Button>
            )}
          </div>
        </>
      )}

      {/* Step 3: Apply */}
      {step === "apply" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Your Design Brief</h4>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl border border-slate-200 flex items-center justify-center"
                style={{ backgroundColor: finalColor }}
              >
                <span className="text-white font-bold text-xs drop-shadow">Aa</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">
                  {method === "url" ? "URL-Inspired Style" : currentPersonality?.name}
                </p>
                <p className="text-slate-600">
                  {method === "url" ? "Based on your reference site" : currentPersonality?.tagline}
                </p>
                <p className="text-sm text-slate-500">Accent: {currentColor?.name || "Custom"} ({finalColor})</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary/30 bg-primary/5">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Your Claude Code Prompt</h4>
            <p className="text-slate-700 mb-3">
              This prompt tells Claude Code exactly how to transform your app. Copy it and paste it in
            </p>
            <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4 max-h-64 overflow-y-auto">
              <pre className="text-slate-700 text-sm whitespace-pre-wrap font-mono">{claudeCodePrompt}</pre>
            </div>
            <Button
              size="lg"
              onClick={handleCopy}
              className="w-full gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? "Copied!" : "Copy Prompt to Clipboard"}
            </Button>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-2">Expect Multiple Iterations</h4>
            <p className="text-slate-700">
              Design changes often need tweaking. After Claude Code applies this, you might say things like "make the shadows softer" or "increase the padding" or "that's too dark". That's normal - designers iterate dozens of times.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Did you apply the design?</h4>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasApplied"
                checked={hasApplied}
                onChange={(e) => setHasApplied(e.target.checked)}
                className="w-5 h-5 text-primary rounded"
              />
              <label htmlFor="hasApplied" className="text-slate-700">
                I've pasted this prompt to Claude Code and applied the design
              </label>
            </div>
            <p className="text-slate-600 text-sm mt-3">
              Don't like the result? Just tell Claude Code "reverse that" or "undo" and try different tweaks.
            </p>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("color")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            {hasApplied && (
              <Button
                size="lg"
                className="flex-1 h-14 text-lg font-bold gap-2"
                onClick={() => setStep("done")}
              >
                Complete Day 11
              </Button>
            )}
          </div>
        </>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-slate-900">Design Transformed!</h4>
                <p className="text-green-600">
                  Your app now has a fresh new look.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Your Design Identity</h4>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl border border-slate-200 flex items-center justify-center"
                style={{ backgroundColor: finalColor }}
              >
                <span className="text-white font-bold text-xs drop-shadow">Aa</span>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">
                  {method === "url" ? "URL-Inspired Style" : currentPersonality?.name}
                </p>
                <p className="text-slate-600">
                  {method === "url" ? "Custom style from reference" : currentPersonality?.tagline}
                </p>
                <p className="text-sm text-slate-500">Color: {currentColor?.name || "Custom"} ({finalColor})</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700">
              <strong>Remember:</strong> You can always refine the design later. Just describe what you want to Claude Code - "make buttons bigger", "add more whitespace", "darker background" - and it'll adjust.
            </p>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("apply")}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete({
                primaryColor: finalColor,
                primaryColorName: currentColor?.name || "Custom",
                designPersonality: method === "url" ? "URL-Inspired" : (currentPersonality?.name || ""),
                brandVibe: method === "url" ? "Custom" : (currentPersonality?.tagline || ""),
                method: method || "",
                selectedPersonality,
                selectedColor,
              })}
            >
              Complete Day 11 <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
