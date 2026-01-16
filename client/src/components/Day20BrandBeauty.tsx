import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface Day20BrandBeautyProps {
  appName: string;
  onComplete: (data: { primaryColor: string; brandApplied: boolean; brandResult: string }) => void;
}

const COLOR_PRESETS = [
  { name: "Blue", color: "#3B82F6", desc: "Trust, professional" },
  { name: "Green", color: "#22C55E", desc: "Growth, success" },
  { name: "Purple", color: "#8B5CF6", desc: "Creative, premium" },
  { name: "Orange", color: "#F97316", desc: "Energy, friendly" },
  { name: "Teal", color: "#14B8A6", desc: "Calm, modern" },
  { name: "Rose", color: "#F43F5E", desc: "Bold, passionate" },
];

export function Day20BrandBeauty({ appName, onComplete }: Day20BrandBeautyProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"choose" | "apply" | "done">("choose");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [brandApplied, setBrandApplied] = useState(false);
  const [brandResult, setBrandResult] = useState("");

  const canProceedToApply = primaryColor !== "";
  const canComplete = brandResult.length >= 20;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Polish Your Brand</h3>
        <p className="text-slate-600 mt-1">Make your app look professional and consistent.</p>
      </Card>

      {/* Step 1: Choose Brand Color */}
      {step === "choose" && (
        <>
          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-700">
              <p className="font-medium">Keep It Simple</p>
              <p className="mt-1">
                You don't need a fancy brand. Pick ONE primary color, use it consistently,
                and keep everything else clean (white/gray backgrounds, dark text).
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Pick Your Primary Color</h4>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {COLOR_PRESETS.map((preset) => (
                <div
                  key={preset.color}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    primaryColor === preset.color
                      ? "border-slate-900"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setPrimaryColor(preset.color)}
                >
                  <div
                    className="w-full h-10 rounded-lg mb-2"
                    style={{ backgroundColor: preset.color }}
                  />
                  <p className="text-sm font-medium text-slate-900">{preset.name}</p>
                  <p className="text-xs text-slate-500">{preset.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-slate-700">Or pick custom:</p>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-slate-200"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-24 font-mono text-sm"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Preview</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {appName ? appName.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{appName || "Your App"}</p>
                  <p className="text-sm text-slate-600">Your tagline here</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="px-6 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Primary Button
                </button>
                <button
                  className="px-6 py-2 rounded-lg font-medium border-2"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Secondary
                </button>
              </div>
            </div>
          </Card>

          {canProceedToApply && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("apply")}
            >
              Apply This Color <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 2: Apply Brand */}
      {step === "apply" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your Brand Color</h4>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg"
                style={{ backgroundColor: primaryColor }}
              />
              <div>
                <p className="font-mono text-lg text-slate-900">{primaryColor}</p>
                <p className="text-sm text-slate-600">Use this for buttons, links, and accents</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Apply Your Brand</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Update primary color in your app</p>
                  <p className="text-sm text-slate-600">All buttons, links, and highlights</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Add a simple logo or text logo</p>
                  <p className="text-sm text-slate-600">App name in a nice font is enough</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Add favicon (browser tab icon)</p>
                  <p className="text-sm text-slate-600">Can be first letter of app name</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Set page title</p>
                  <p className="text-sm text-slate-600">Shows in browser tab</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Tell Claude Code</h4>
            <p className="text-sm text-slate-600 mb-4">Describe what to apply:</p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 font-mono">
              "Update my app's branding:<br /><br />
              1. Set primary color to {primaryColor}<br />
              2. Add a text logo saying '{appName || "App Name"}'<br />
              3. Add a favicon (letter {appName ? appName.charAt(0).toUpperCase() : "A"} in primary color)<br />
              4. Set page title to '{appName || "App Name"}'<br />
              5. Make sure buttons and links use the primary color"
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("done")}
          >
            I Applied the Brand <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Done */}
      {step === "done" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Brand Applied!</h4>
            <p className="text-slate-700">
              Your app now has consistent, professional branding. First impressions matter,
              and yours just got better.
            </p>
          </Card>

          {/* Soft CTA - Building narrative to hard CTA tomorrow */}
          <Card className="p-5 border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Look at what you've built.</span>{" "}
              A branded, professional SaaS product. This isn't a side project anymore - it's something
              you could genuinely charge money for. Tomorrow you launch. After that? It's time to
              think about turning this product into a <span className="font-semibold">business</span>.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Verify Your Brand</h4>
            <p className="text-sm text-slate-600 mb-4">
              Look at your app now. Check these things:
            </p>

            <div className="flex gap-3 mb-4">
              <Button
                variant={brandApplied ? "default" : "outline"}
                className="flex-1"
                onClick={() => setBrandApplied(true)}
              >
                Looks professional!
              </Button>
              <Button
                variant={!brandApplied ? "outline" : "outline"}
                className="flex-1"
                onClick={() => setBrandApplied(false)}
              >
                Needs more work
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Brand Summary</h4>
            <p className="text-sm text-slate-600 mb-4">
              Document your branding:
            </p>
            <Textarea
              placeholder="My app now has:
- Primary color: [color]
- Logo: [describe]
- Favicon: [yes/no]

The overall look is [professional/clean/modern] because...
I would still improve [what] when I have time."
              value={brandResult}
              onChange={(e) => setBrandResult(e.target.value)}
              className="min-h-[140px]"
            />
          </Card>

          {canComplete && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => onComplete({ primaryColor, brandApplied, brandResult })}
            >
              Save Brand & Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
