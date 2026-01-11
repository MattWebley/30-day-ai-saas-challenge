import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Shield, Info } from "lucide-react";

// Example content rendered in each style
function ExampleContent({ style }: { style: "minimal" | "slate" | "shadow" }) {
  const [selected, setSelected] = useState<boolean | null>(null);

  // Define styles based on theme
  const styles = {
    minimal: {
      card: "bg-white border border-slate-200 rounded-lg",
      cardHeader: "bg-white border border-slate-200 rounded-lg",
      infoBox: "bg-white border border-slate-200 rounded-lg",
      infoIcon: "text-slate-400",
      infoText: "text-slate-600",
      optionDefault: "bg-white border border-slate-200 rounded-lg hover:border-slate-300",
      optionSelected: "bg-white border-2 border-primary rounded-lg",
      checkDefault: "bg-slate-100",
      checkSelected: "bg-primary",
      sectionTitle: "text-slate-900 font-semibold",
      mutedText: "text-slate-500",
    },
    slate: {
      card: "bg-slate-50 border border-slate-200 rounded-lg",
      cardHeader: "bg-white border border-slate-200 rounded-lg",
      infoBox: "bg-slate-100 border border-slate-200 rounded-lg",
      infoIcon: "text-slate-500",
      infoText: "text-slate-700",
      optionDefault: "bg-white border border-slate-200 rounded-lg hover:border-slate-300",
      optionSelected: "bg-primary/5 border-2 border-primary rounded-lg",
      checkDefault: "bg-slate-200",
      checkSelected: "bg-primary",
      sectionTitle: "text-slate-900 font-semibold",
      mutedText: "text-slate-500",
    },
    shadow: {
      card: "bg-white rounded-xl shadow-sm",
      cardHeader: "bg-white rounded-xl shadow-sm",
      infoBox: "bg-white rounded-xl shadow-sm",
      infoIcon: "text-slate-400",
      infoText: "text-slate-600",
      optionDefault: "bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow",
      optionSelected: "bg-white rounded-xl shadow-md ring-2 ring-primary",
      checkDefault: "bg-slate-100",
      checkSelected: "bg-primary",
      sectionTitle: "text-slate-900 font-semibold",
      mutedText: "text-slate-500",
    },
  };

  const s = styles[style];

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className={`p-5 ${s.cardHeader}`}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className={`text-lg ${s.sectionTitle}`}>User Authentication</h3>
        </div>
        <p className={s.mutedText}>Check if your app has login functionality.</p>
      </div>

      {/* Info Box */}
      <div className={`p-4 ${s.infoBox}`}>
        <div className="flex gap-3">
          <Info className={`w-5 h-5 mt-0.5 ${s.infoIcon}`} />
          <p className={`text-sm ${s.infoText}`}>
            Ask Replit Agent: "Does my app have user authentication?"
          </p>
        </div>
      </div>

      {/* Interactive Options */}
      <div className={`p-5 ${s.card}`}>
        <p className={`mb-3 ${s.sectionTitle}`}>Does your app have auth?</p>
        <div className="space-y-2">
          <div
            onClick={() => setSelected(true)}
            className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
              selected === true ? s.optionSelected : s.optionDefault
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              selected === true ? s.checkSelected : s.checkDefault
            }`}>
              {selected === true && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-slate-900">Yes, auth exists</span>
          </div>

          <div
            onClick={() => setSelected(false)}
            className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
              selected === false ? s.optionSelected : s.optionDefault
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              selected === false ? s.checkSelected : s.checkDefault
            }`}>
              {selected === false && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-slate-900">No, I need to add it</span>
          </div>
        </div>
      </div>

      {/* Text Input */}
      <div className={`p-5 ${s.card}`}>
        <p className={`mb-2 ${s.sectionTitle}`}>Describe what you built</p>
        <Textarea
          placeholder="I added authentication by..."
          className="min-h-[80px] bg-white"
        />
      </div>

      {/* Button */}
      <Button className="w-full" size="lg">
        Complete Section
      </Button>
    </div>
  );
}

export default function DesignPreview() {
  const [selectedStyle, setSelectedStyle] = useState<"minimal" | "slate" | "shadow" | null>(null);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Design System Preview</h1>
          <p className="text-slate-600">Compare the three design approaches. Click one to select it.</p>
        </div>

        <div className="space-y-8">
          {/* Style 1: Minimal */}
          <div
            className={`cursor-pointer transition-all ${selectedStyle === 'minimal' ? 'ring-4 ring-primary ring-offset-4 rounded-2xl' : ''}`}
            onClick={() => setSelectedStyle('minimal')}
          >
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900">1. Minimal Clean</h2>
                {selectedStyle === 'minimal' && (
                  <span className="text-xs font-medium text-white bg-primary px-2 py-1 rounded">SELECTED</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-6">
                White backgrounds, thin borders, no colored boxes. Maximum simplicity.
              </p>
              <div className="bg-slate-50 rounded-xl p-4">
                <ExampleContent style="minimal" />
              </div>
            </div>
          </div>

          {/* Style 2: Soft Slate */}
          <div
            className={`cursor-pointer transition-all ${selectedStyle === 'slate' ? 'ring-4 ring-primary ring-offset-4 rounded-2xl' : ''}`}
            onClick={() => setSelectedStyle('slate')}
          >
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900">2. Soft Slate</h2>
                {selectedStyle === 'slate' && (
                  <span className="text-xs font-medium text-white bg-primary px-2 py-1 rounded">SELECTED</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Subtle gray backgrounds, clear sections, gentle visual hierarchy.
              </p>
              <div className="bg-slate-50 rounded-xl p-4">
                <ExampleContent style="slate" />
              </div>
            </div>
          </div>

          {/* Style 3: Card Shadows */}
          <div
            className={`cursor-pointer transition-all ${selectedStyle === 'shadow' ? 'ring-4 ring-primary ring-offset-4 rounded-2xl' : ''}`}
            onClick={() => setSelectedStyle('shadow')}
          >
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900">3. Card Shadows</h2>
                {selectedStyle === 'shadow' && (
                  <span className="text-xs font-medium text-white bg-primary px-2 py-1 rounded">SELECTED</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Floating cards with soft shadows, no borders. Modern & elevated.
              </p>
              <div className="bg-slate-100 rounded-xl p-4">
                <ExampleContent style="shadow" />
              </div>
            </div>
          </div>
        </div>

        {selectedStyle && (
          <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-green-800 font-medium">
              You selected: <strong>{selectedStyle === 'minimal' ? 'Minimal Clean' : selectedStyle === 'slate' ? 'Soft Slate' : 'Card Shadows'}</strong>
            </p>
            <p className="text-green-700 text-sm mt-1">
              Tell me to apply this style and I'll create a consistent design system used across all day components.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
