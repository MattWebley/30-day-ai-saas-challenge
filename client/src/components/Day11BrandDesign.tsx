import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Palette,
  Type,
  Sparkles,
  Copy,
  AlertTriangle,
  SkipForward,
  Terminal,
} from "lucide-react";
import { ds } from "@/lib/design-system";
import { Link } from "wouter";
import { toast } from "sonner";

interface Day11BrandDesignProps {
  projectName: string;
  onComplete: (data: {
    skipped: boolean;
    fontStyle?: string;
    colorScheme?: string;
    designVibe?: string;
    prompt?: string;
  }) => void;
}

const FONT_STYLES = [
  {
    id: "modern-clean",
    name: "Modern & Clean",
    preview: "Inter / Helvetica",
    fontFamily: "system-ui, -apple-system, sans-serif",
    description: "Professional, minimal, easy to read",
  },
  {
    id: "bold-geometric",
    name: "Bold & Geometric",
    preview: "Poppins / Montserrat",
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: "800",
    description: "Strong, confident, startup vibes",
  },
  {
    id: "friendly-rounded",
    name: "Friendly & Rounded",
    preview: "Nunito / Quicksand",
    fontFamily: "system-ui, sans-serif",
    description: "Approachable, warm, consumer apps",
  },
  {
    id: "elegant-serif",
    name: "Elegant & Classic",
    preview: "Georgia / Playfair",
    fontFamily: "Georgia, serif",
    description: "Sophisticated, premium, trustworthy",
  },
  {
    id: "techy-mono",
    name: "Techy & Developer",
    preview: "Fira Code / JetBrains",
    fontFamily: "monospace",
    description: "Technical, precise, dev tools",
  },
];

const COLOR_SCHEMES = [
  {
    id: "blue-trust",
    name: "Trust Blue",
    primary: "#2563eb",
    secondary: "#dbeafe",
    accent: "#1e40af",
    description: "Professional, reliable, corporate",
  },
  {
    id: "green-growth",
    name: "Growth Green",
    primary: "#16a34a",
    secondary: "#dcfce7",
    accent: "#15803d",
    description: "Fresh, eco-friendly, health",
  },
  {
    id: "purple-creative",
    name: "Creative Purple",
    primary: "#9333ea",
    secondary: "#f3e8ff",
    accent: "#7e22ce",
    description: "Innovative, creative, premium",
  },
  {
    id: "orange-energy",
    name: "Energy Orange",
    primary: "#ea580c",
    secondary: "#ffedd5",
    accent: "#c2410c",
    description: "Bold, energetic, action-oriented",
  },
  {
    id: "pink-playful",
    name: "Playful Pink",
    primary: "#db2777",
    secondary: "#fce7f3",
    accent: "#be185d",
    description: "Fun, youthful, social",
  },
  {
    id: "slate-minimal",
    name: "Minimal Slate",
    primary: "#475569",
    secondary: "#f1f5f9",
    accent: "#1e293b",
    description: "Understated, elegant, serious",
  },
  {
    id: "teal-calm",
    name: "Calm Teal",
    primary: "#0d9488",
    secondary: "#ccfbf1",
    accent: "#0f766e",
    description: "Balanced, healthcare, wellness",
  },
  {
    id: "red-bold",
    name: "Bold Red",
    primary: "#dc2626",
    secondary: "#fee2e2",
    accent: "#b91c1c",
    description: "Urgent, powerful, attention-grabbing",
  },
];

const DESIGN_VIBES = [
  {
    id: "minimal-clean",
    name: "Minimal & Clean",
    description: "Lots of whitespace, simple layouts, focus on content",
    visual: "□ ─── □",
  },
  {
    id: "bold-striking",
    name: "Bold & Striking",
    description: "Large typography, high contrast, makes a statement",
    visual: "██ ▌▌▌ ██",
  },
  {
    id: "soft-friendly",
    name: "Soft & Friendly",
    description: "Rounded corners, soft shadows, approachable feel",
    visual: "◯ ~~~ ◯",
  },
  {
    id: "modern-glassmorphism",
    name: "Modern Glass",
    description: "Frosted glass effects, gradients, contemporary look",
    visual: "◇ ░░░ ◇",
  },
  {
    id: "card-based",
    name: "Card-Based",
    description: "Content in distinct cards, organized and structured",
    visual: "▢ ▢ ▢",
  },
  {
    id: "dark-mode",
    name: "Dark & Sleek",
    description: "Dark backgrounds, light text, modern and cool",
    visual: "▓▓▓▓▓",
  },
];

export function Day11BrandDesign({ projectName, onComplete }: Day11BrandDesignProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "happy" | "fonts" | "colors" | "vibe" | "prompt" | "done"
  >("happy");

  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [madeChanges, setMadeChanges] = useState(false);

  const selectedFontData = FONT_STYLES.find(f => f.id === selectedFont);
  const selectedColorData = COLOR_SCHEMES.find(c => c.id === selectedColor);
  const selectedVibeData = DESIGN_VIBES.find(v => v.id === selectedVibe);

  const generatePrompt = () => {
    if (!selectedFontData || !selectedColorData || !selectedVibeData) return "";

    return `I want to completely redesign the look and feel of my app. Here's my new design direction:

**Typography:**
- Style: ${selectedFontData.name}
- Feel: ${selectedFontData.description}
- Use a clean, ${selectedFont?.includes('serif') ? 'serif' : 'sans-serif'} font throughout

**Color Scheme:**
- Primary color: ${selectedColorData.primary} (${selectedColorData.name})
- Secondary/background: ${selectedColorData.secondary}
- Accent color: ${selectedColorData.accent}
- Feel: ${selectedColorData.description}

**Overall Vibe:**
- Style: ${selectedVibeData.name}
- ${selectedVibeData.description}

Please update the entire app to match this design direction. This includes:
1. Update the color variables/theme
2. Adjust typography styles
3. Update component styling (buttons, cards, inputs, etc.)
4. Make sure the design is consistent across all pages

Start with the global styles/theme, then work through each component.`;
  };

  const copyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setPromptCopied(false), 3000);
  };

  const handleSkip = () => {
    onComplete({ skipped: true });
  };

  const handleComplete = () => {
    onComplete({
      skipped: false,
      fontStyle: selectedFont || undefined,
      colorScheme: selectedColor || undefined,
      designVibe: selectedVibe || undefined,
      prompt: generatePrompt(),
    });
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Claude Code Guide Reminder */}
      <Link href="/claude-code">
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Open the Claude Code Guide</p>
              <p className={ds.muted}>Use the prompts there to start your session.</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Step 1: Are you happy with current design? */}
      {step === "happy" && (
        <>
          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-4"}>How's Your Current Design?</h3>

            <div className="space-y-4">
              <p className={ds.body}>
                Take a look at your app right now. Are you happy with how it looks? The colors, the fonts, the overall feel?
              </p>

              <div className={ds.infoBoxHighlight}>
                <p className={ds.body}>
                  <strong>It's okay to skip this!</strong> If Replit gave you something decent and you want to focus on features instead of design, that's a valid choice. You can always come back to styling later.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-24 flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50"
              onClick={handleSkip}
            >
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="font-medium">I'm Happy - Skip This</span>
              <span className="text-xs text-slate-500">Keep current design</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-24 flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setStep("fonts")}
            >
              <Palette className="w-6 h-6 text-primary" />
              <span className="font-medium">I Want Changes</span>
              <span className="text-xs text-slate-500">Pick a new look</span>
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Choose Font Style */}
      {step === "fonts" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Type className="w-5 h-5 text-white" />
              </div>
              <h3 className={ds.heading}>Pick Your Font Style</h3>
            </div>

            <p className={ds.body + " mb-4"}>
              What feeling should your text give off? Click each option to see how it looks.
            </p>

            <div className="space-y-3">
              {FONT_STYLES.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setSelectedFont(font.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedFont === font.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-xl mb-1"
                        style={{
                          fontFamily: font.fontFamily,
                          fontWeight: font.fontWeight || "600"
                        }}
                      >
                        {font.name}
                      </p>
                      <p className={ds.muted}>{font.description}</p>
                    </div>
                    {selectedFont === font.id && (
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div
                    className="mt-3 p-3 bg-slate-50 rounded text-lg"
                    style={{
                      fontFamily: font.fontFamily,
                      fontWeight: font.fontWeight || "normal"
                    }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("happy")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("colors")}
              disabled={!selectedFont}
              className="gap-2"
            >
              Next: Colors <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Choose Color Scheme */}
      {step === "colors" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h3 className={ds.heading}>Pick Your Colors</h3>
            </div>

            <p className={ds.body + " mb-4"}>
              Colors set the mood. What feeling fits your brand?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COLOR_SCHEMES.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedColor === color.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  style={{
                    background: selectedColor === color.id ? color.secondary : "white",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex gap-1 flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm -ml-2"
                        style={{ backgroundColor: color.accent }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">{color.name}</p>
                      <p className="text-slate-600 text-sm">{color.description}</p>
                    </div>
                    {selectedColor === color.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  {/* Preview bar */}
                  <div className="mt-3 flex rounded overflow-hidden h-3">
                    <div className="flex-1" style={{ backgroundColor: color.primary }} />
                    <div className="flex-1" style={{ backgroundColor: color.secondary }} />
                    <div className="flex-1" style={{ backgroundColor: color.accent }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("fonts")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("vibe")}
              disabled={!selectedColor}
              className="gap-2"
            >
              Next: Style <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Choose Design Vibe */}
      {step === "vibe" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className={ds.heading}>Pick Your Style</h3>
            </div>

            <p className={ds.body + " mb-4"}>
              How should things be laid out? What's the overall vibe?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DESIGN_VIBES.map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => setSelectedVibe(vibe.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedVibe === vibe.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{vibe.name}</p>
                      <p className="text-slate-600 text-sm">{vibe.description}</p>
                    </div>
                    {selectedVibe === vibe.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-slate-100 rounded text-center font-mono text-slate-500 text-lg tracking-widest">
                    {vibe.visual}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("colors")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("prompt")}
              disabled={!selectedVibe}
              className="gap-2"
            >
              Generate Prompt <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Your Design Prompt */}
      {step === "prompt" && (
        <>
          {/* Summary of choices */}
          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-4"}>Your Design Choices</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Type className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="font-medium text-slate-900">{selectedFontData?.name}</p>
              </div>
              <div className="text-center">
                <div
                  className="w-6 h-6 rounded-full mx-auto mb-2 border-2 border-white shadow"
                  style={{ backgroundColor: selectedColorData?.primary }}
                />
                <p className="font-medium text-slate-900">{selectedColorData?.name}</p>
              </div>
              <div className="text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="font-medium text-slate-900">{selectedVibeData?.name}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-900">Heads Up: This Takes Iteration</p>
                <p className="text-amber-800 text-sm mt-1">
                  Design changes often need several Build-Test-Fix loops. Claude will make changes, you'll test them, and you'll tell it what to adjust. This is normal - don't expect perfection on the first try!
                </p>
              </div>
            </div>
          </div>

          {/* The Prompt */}
          <div className={ds.cardWithPadding}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={ds.heading}>Your Design Prompt</h3>
              <Button
                variant="outline"
                onClick={copyPrompt}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {promptCopied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
              {generatePrompt()}
            </div>
          </div>

          {/* Instructions */}
          <div className={ds.cardWithPadding}>
            <h4 className={ds.heading + " mb-3"}>What To Do</h4>
            <ol className="space-y-2">
              <li className={ds.body}>
                <strong>1.</strong> Copy the prompt above
              </li>
              <li className={ds.body}>
                <strong>2.</strong> Paste it into Claude Code
              </li>
              <li className={ds.body}>
                <strong>3.</strong> Let it make the changes
              </li>
              <li className={ds.body}>
                <strong>4.</strong> Test in your preview - does it look right?
              </li>
              <li className={ds.body}>
                <strong>5.</strong> If not perfect, tell Claude what to adjust
              </li>
            </ol>
          </div>

          <div
            className={madeChanges ? ds.optionSelected : ds.optionDefault}
            onClick={() => setMadeChanges(!madeChanges)}
          >
            <div className="flex items-center gap-3">
              <Checkbox checked={madeChanges} onCheckedChange={() => setMadeChanges(!madeChanges)} />
              <span className={ds.body + " font-medium"}>I've updated my design (or at least started!)</span>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("vibe")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => setStep("done")}
              disabled={!madeChanges}
              className="gap-2"
            >
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Done */}
      {step === "done" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={ds.heading + " mb-2"}>Design Updated!</h3>
              <p className={ds.body + " mb-4"}>
                Your app now has a fresh new look.
              </p>
              <p className={ds.muted}>
                Remember: design is iterative. You can always tweak things later as you keep building.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className={ds.cardWithPadding}>
            <h4 className={ds.label + " mb-3"}>Your Design Direction</h4>
            <div className="space-y-2">
              <p className={ds.body}><strong>Font:</strong> {selectedFontData?.name}</p>
              <p className={ds.body}><strong>Colors:</strong> {selectedColorData?.name}</p>
              <p className={ds.body}><strong>Style:</strong> {selectedVibeData?.name}</p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold"
            onClick={handleComplete}
          >
            Complete Day 11
          </Button>
        </>
      )}
    </div>
  );
}
