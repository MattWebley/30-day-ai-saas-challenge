import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Palette,
  Sparkles,
  Copy,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Type,
  Paintbrush
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface Day9BrandingProps {
  dayId: number;
  userIdea: string;
  onComplete: () => void;
}

const BRAND_VIBES = [
  { id: "professional", label: "Professional & Trustworthy", emoji: "💼", description: "Clean, corporate, reliable" },
  { id: "friendly", label: "Friendly & Warm", emoji: "😊", description: "Approachable, encouraging, human" },
  { id: "bold", label: "Bold & Powerful", emoji: "💪", description: "Confident, no-nonsense, strong" },
  { id: "minimal", label: "Simple & Clean", emoji: "✨", description: "Minimal, focused, elegant" },
];

const COLOR_PALETTES: Record<string, { name: string; primary: string; secondary: string; accent: string }[]> = {
  professional: [
    { name: "Corporate Blue", primary: "#2563EB", secondary: "#F1F5F9", accent: "#10B981" },
    { name: "Executive Gray", primary: "#1F2937", secondary: "#F9FAFB", accent: "#6366F1" },
    { name: "Trust Teal", primary: "#0D9488", secondary: "#F0FDFA", accent: "#F59E0B" },
  ],
  friendly: [
    { name: "Warm Orange", primary: "#F97316", secondary: "#FFF7ED", accent: "#06B6D4" },
    { name: "Happy Purple", primary: "#8B5CF6", secondary: "#FAF5FF", accent: "#EC4899" },
    { name: "Sunny Yellow", primary: "#EAB308", secondary: "#FEFCE8", accent: "#3B82F6" },
  ],
  bold: [
    { name: "Power Red", primary: "#DC2626", secondary: "#1F2937", accent: "#FBBF24" },
    { name: "Electric Blue", primary: "#2563EB", secondary: "#0F172A", accent: "#22D3EE" },
    { name: "Neon Green", primary: "#22C55E", secondary: "#18181B", accent: "#A855F7" },
  ],
  minimal: [
    { name: "Pure Black", primary: "#171717", secondary: "#FAFAFA", accent: "#737373" },
    { name: "Soft Gray", primary: "#6B7280", secondary: "#FFFFFF", accent: "#3B82F6" },
    { name: "Gentle Blue", primary: "#64748B", secondary: "#F8FAFC", accent: "#0EA5E9" },
  ],
};

export function Day9Branding({ dayId, userIdea, onComplete }: Day9BrandingProps) {
  const [step, setStep] = useState<"vibe" | "colors" | "tagline" | "prompt" | "done">("vibe");
  const [selectedVibe, setSelectedVibe] = useState<string>("");
  const [selectedPalette, setSelectedPalette] = useState<typeof COLOR_PALETTES["professional"][0] | null>(null);
  const [taglines, setTaglines] = useState<string[]>([]);
  const [selectedTagline, setSelectedTagline] = useState<string>("");
  const [customizationPrompt, setCustomizationPrompt] = useState<string>("");
  const [appliedToReplit, setAppliedToReplit] = useState(false);
  const { toast } = useToast();

  const generateTaglines = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/generate-taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: userIdea,
          vibe: selectedVibe,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate taglines");
      return response.json();
    },
    onSuccess: (data) => {
      setTaglines(data.taglines || []);
    },
    onError: () => {
      // Fallback taglines if API fails
      setTaglines([
        `${userIdea ? userIdea.split(' ').slice(0, 3).join(' ') : 'Your solution'} - made simple`,
        "The smarter way to get things done",
        "Built for people who ship",
        "Less hassle, more results",
        "Your secret weapon for success",
      ]);
    }
  });

  const handleVibeSelect = (vibeId: string) => {
    setSelectedVibe(vibeId);
  };

  const handlePaletteSelect = (palette: typeof COLOR_PALETTES["professional"][0]) => {
    setSelectedPalette(palette);
  };

  const handleTaglineSelect = (tagline: string) => {
    setSelectedTagline(tagline);
  };

  const generatePrompt = () => {
    const prompt = `I want to customize the look and feel of my app:

BRAND PERSONALITY: ${BRAND_VIBES.find(v => v.id === selectedVibe)?.label || "Professional"}

COLORS:
- Primary color: ${selectedPalette?.primary || "#2563EB"} (buttons, links, accents)
- Background: ${selectedPalette?.secondary || "#F1F5F9"} (page backgrounds)
- Accent: ${selectedPalette?.accent || "#10B981"} (highlights, success states)

TAGLINE: "${selectedTagline}"

Apply these changes throughout the ENTIRE app:
1. Update all buttons to use the primary color
2. Update backgrounds to use the secondary color
3. Add the tagline to the landing page header
4. Make sure colors are consistent on ALL pages
5. Update any text that says "Welcome" to include the brand personality

Keep the existing layout and functionality - just update the visual branding.`;

    setCustomizationPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(customizationPrompt);
    toast({
      title: "Prompt Copied!",
      description: "Paste this into Replit Agent to brand your app",
    });
  };

  const handleComplete = () => {
    onComplete();
  };

  const palettes = selectedVibe ? COLOR_PALETTES[selectedVibe] || COLOR_PALETTES.professional : [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Paintbrush className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Make It YOURS</h3>
            <p className="text-slate-600 mt-1">
              Let's give your app a personality that's unmistakably YOU.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Brand Vibe", "Colors", "Tagline", "Apply"].map((label, idx) => {
          const steps = ["vibe", "colors", "tagline", "prompt"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx || step === "done";
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-green-100 text-green-700" :
                isCurrent ? "bg-primary text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 3 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Brand Vibe */}
      {step === "vibe" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What's your brand VIBE?</h4>
          <p className="text-sm text-slate-500 mb-4">Pick the personality that fits your app</p>

          <div className="grid sm:grid-cols-2 gap-3">
            {BRAND_VIBES.map((vibe) => (
              <button
                key={vibe.id}
                onClick={() => handleVibeSelect(vibe.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedVibe === vibe.id
                    ? "border-primary bg-blue-50"
                    : "border-slate-200 hover:border-primary"
                }`}
              >
                <div className="text-2xl mb-2">{vibe.emoji}</div>
                <div className="font-bold text-slate-900">{vibe.label}</div>
                <div className="text-sm text-slate-500">{vibe.description}</div>
              </button>
            ))}
          </div>

          <Button
            className="w-full mt-4"
            size="lg"
            disabled={!selectedVibe}
            onClick={() => setStep("colors")}
          >
            Continue to Colors
          </Button>
        </Card>
      )}

      {/* Step 2: Colors */}
      {step === "colors" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Pick your color palette</h4>
          <p className="text-sm text-slate-500 mb-4">
            Based on your "{BRAND_VIBES.find(v => v.id === selectedVibe)?.label}" vibe
          </p>

          <div className="space-y-3">
            {palettes.map((palette) => (
              <button
                key={palette.name}
                onClick={() => handlePaletteSelect(palette)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPalette?.name === palette.name
                    ? "border-primary bg-blue-50"
                    : "border-slate-200 hover:border-primary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{palette.name}</span>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: palette.primary }}
                      title={`Primary: ${palette.primary}`}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-slate-200"
                      style={{ backgroundColor: palette.secondary }}
                      title={`Secondary: ${palette.secondary}`}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: palette.accent }}
                      title={`Accent: ${palette.accent}`}
                    />
                  </div>
                </div>
                {selectedPalette?.name === palette.name && (
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>Primary: {palette.primary}</span>
                    <span>Background: {palette.secondary}</span>
                    <span>Accent: {palette.accent}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setStep("vibe")}>
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!selectedPalette}
              onClick={() => {
                setStep("tagline");
                generateTaglines.mutate();
              }}
            >
              Continue to Tagline
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Tagline */}
      {step === "tagline" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900">Pick your tagline</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateTaglines.mutate()}
              disabled={generateTaglines.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generateTaglines.isPending ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          </div>
          <p className="text-sm text-slate-500 mb-4">AI-generated taglines for your app</p>

          {generateTaglines.isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-slate-500">Generating taglines...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {taglines.map((tagline, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTaglineSelect(tagline)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTagline === tagline
                      ? "border-primary bg-blue-50"
                      : "border-slate-200 hover:border-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-900">"{tagline}"</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setStep("colors")}>
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!selectedTagline}
              onClick={generatePrompt}
            >
              Generate Customization Prompt
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Customization Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {customizationPrompt}
              </pre>
            </div>
          </Card>

          {/* Summary Card */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-4">Your Brand Summary</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Brand Vibe</div>
                <div className="font-bold text-slate-900">
                  {BRAND_VIBES.find(v => v.id === selectedVibe)?.label}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Color Palette</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: selectedPalette?.primary }} />
                  <span className="font-bold text-slate-900">{selectedPalette?.name}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Tagline</div>
                <div className="font-bold text-slate-900 text-sm">"{selectedTagline}"</div>
              </div>
            </div>
          </Card>

          {/* Completion Checklist */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-slate-900 mb-4">Final Step</h4>
            <div
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                appliedToReplit ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-primary"
              }`}
              onClick={() => setAppliedToReplit(!appliedToReplit)}
            >
              <Checkbox checked={appliedToReplit} />
              <div>
                <div className="font-semibold text-slate-900">I've applied the branding in Replit</div>
                <div className="text-sm text-slate-500">Paste the prompt and let the Agent customize your app</div>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              disabled={!appliedToReplit}
              onClick={handleComplete}
            >
              {appliedToReplit ? "Complete Day 9" : "Apply Branding First"}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
