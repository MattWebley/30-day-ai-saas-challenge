import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Palette,
  Copy,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Type,
  Image
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day20BrandBeautyProps {
  appName: string;
  onComplete: () => void;
}

const POLISH_AREAS = [
  { id: "logo", icon: Image, text: "Simple logo or text logo" },
  { id: "colors", icon: Palette, text: "2-3 brand colors defined" },
  { id: "fonts", icon: Type, text: "Consistent fonts (1-2 max)" },
  { id: "spacing", icon: Sparkles, text: "Clean spacing and alignment" },
];

const QUICK_WINS = [
  { id: "favicon", text: "Added favicon (browser tab icon)" },
  { id: "title", text: "Page title shows app name" },
  { id: "loading", text: "Loading states for slow actions" },
  { id: "empty", text: "Empty states look good" },
  { id: "errors", text: "Error messages are helpful" },
];

const BRAND_PROMPT = `Make my app look more polished:

1. Create a simple text logo using [App Name] with a nice font
2. Apply consistent colors:
   - Primary: [color] for buttons and links
   - Background: Clean white/gray
   - Text: Dark gray for readability

3. Fix these UI issues:
   - Consistent spacing (use 4/8/16/24px)
   - Aligned elements
   - Rounded corners on cards/buttons

4. Add polish:
   - Subtle shadows on cards
   - Hover states on clickable elements
   - Smooth transitions`;

export function Day20BrandBeauty({ appName, onComplete }: Day20BrandBeautyProps) {
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [polishDone, setPolishDone] = useState<Set<string>>(new Set());
  const [quickWinsDone, setQuickWinsDone] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const togglePolish = (id: string) => {
    const newDone = new Set(polishDone);
    if (newDone.has(id)) newDone.delete(id);
    else newDone.add(id);
    setPolishDone(newDone);
  };

  const toggleQuickWin = (id: string) => {
    const newDone = new Set(quickWinsDone);
    if (newDone.has(id)) newDone.delete(id);
    else newDone.add(id);
    setQuickWinsDone(newDone);
  };

  const copyPrompt = () => {
    const customPrompt = BRAND_PROMPT.replace("[App Name]", appName || "[App Name]");
    navigator.clipboard.writeText(customPrompt);
    toast({
      title: "Copied!",
      description: "Brand polish prompt copied to clipboard",
    });
  };

  const canComplete = polishDone.size >= 3 && quickWinsDone.size >= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center">
            <Palette className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Brand & Beauty</h3>
            <p className="text-slate-600 mt-1">Make your app look professional. First impressions matter.</p>
          </div>
        </div>
      </Card>

      {/* Keep It Simple */}
      <Card className="p-4 border-2 border-purple-200 bg-purple-50">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-purple-800">Keep It Simple</p>
            <p className="text-sm text-purple-700 mt-1">
              You don't need a perfect brand. You need a clean, professional look that builds trust.
              Simple beats fancy at this stage.
            </p>
          </div>
        </div>
      </Card>

      {/* Color Picker */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Pick Your Primary Color</h4>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-200"
          />
          <div>
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="font-mono w-28"
            />
            <p className="text-xs text-slate-500 mt-1">Use this for buttons & links</p>
          </div>
          <div
            className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            {appName || "Your App"}
          </div>
        </div>
      </Card>

      {/* Polish Areas */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Polish Checklist</h4>
        <div className="space-y-3">
          {POLISH_AREAS.map((area) => (
            <div
              key={area.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => togglePolish(area.id)}
            >
              <Checkbox
                checked={polishDone.has(area.id)}
                onCheckedChange={() => togglePolish(area.id)}
              />
              <area.icon className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">{area.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Prompt Template */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-2 text-slate-900">Polish Prompt</h4>
        <p className="text-sm text-slate-600 mb-4">Copy and customize for your app:</p>
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded border border-slate-200">
          {BRAND_PROMPT}
        </pre>
        <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={copyPrompt}>
          <Copy className="w-4 h-4" />
          Copy Prompt
        </Button>
      </Card>

      {/* Quick Wins */}
      <Card className="p-6 border-2 border-slate-200">
        <h4 className="font-bold text-lg mb-4 text-slate-900">Quick Wins</h4>
        <p className="text-sm text-slate-600 mb-4">Small details that make a big difference:</p>
        <div className="space-y-3">
          {QUICK_WINS.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => toggleQuickWin(item.id)}
            >
              <Checkbox
                checked={quickWinsDone.has(item.id)}
                onCheckedChange={() => toggleQuickWin(item.id)}
              />
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={onComplete}
        >
          Looking Good - Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
