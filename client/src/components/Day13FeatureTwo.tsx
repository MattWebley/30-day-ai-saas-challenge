import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Copy,
  CheckCircle2,
  User,
  History,
  Download,
  Settings,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface Day13FeatureTwoProps {
  dayId: number;
  userIdea: string;
  onComplete: () => void;
}

const FEATURE_OPTIONS = [
  {
    id: "accounts",
    label: "User Accounts & Profiles",
    icon: User,
    description: "Let users save their data, track progress, have personal settings",
    useCase: "Best for: Apps where users come back repeatedly",
    prompt: (idea: string, customization: string) => `Add user accounts to my app (${idea}):

1. SIGN UP / LOG IN
   - Simple email + password signup
   - Google OAuth option (one-click signup)
   - Clean login/signup pages

2. USER PROFILE
   - Profile page showing their info
   - Ability to change name, email, password
   - Profile picture upload (optional)

3. SAVE USER DATA
   - All their generated content saved to their account
   - History of what they've created
   - Ability to delete their data

${customization ? `ADDITIONAL REQUIREMENTS:\n${customization}` : ""}

Make the auth flow smooth and simple. Show "Login" button in header when logged out, user avatar when logged in.`
  },
  {
    id: "history",
    label: "History & Saved Items",
    icon: History,
    description: "Let users see their past results and revisit what they created",
    useCase: "Best for: Generators, converters, any repeat-use tool",
    prompt: (idea: string, customization: string) => `Add history/saved items to my app (${idea}):

1. SAVE RESULTS
   - After each use, save the result automatically
   - Option to "star" or "favorite" important ones
   - Timestamp when created

2. HISTORY VIEW
   - Page showing all past results
   - Most recent first
   - Search/filter through history
   - Click to view full result again

3. ACTIONS
   - Copy any past result
   - Delete individual items
   - Clear all history option

${customization ? `ADDITIONAL REQUIREMENTS:\n${customization}` : ""}

Store in database if user has account, or localStorage if not logged in.`
  },
  {
    id: "export",
    label: "Export & Download",
    icon: Download,
    description: "Let users download their results as files (PDF, CSV, etc)",
    useCase: "Best for: Reports, documents, data analysis tools",
    prompt: (idea: string, customization: string) => `Add export/download features to my app (${idea}):

1. EXPORT OPTIONS
   - Download as PDF (formatted nicely)
   - Download as text file
   - Copy to clipboard button

2. PDF FORMATTING
   - Clean, professional layout
   - Include my app branding/logo
   - Proper headings and sections

3. USER EXPERIENCE
   - Clear "Download" button near results
   - Show download progress
   - Success message when complete

${customization ? `ADDITIONAL REQUIREMENTS:\n${customization}` : ""}

Make the PDF look professional - something they could share with a client or boss.`
  },
  {
    id: "settings",
    label: "Settings & Preferences",
    icon: Settings,
    description: "Let users customize their experience (dark mode, defaults, etc)",
    useCase: "Best for: Apps used daily, power users",
    prompt: (idea: string, customization: string) => `Add settings/preferences to my app (${idea}):

1. APPEARANCE
   - Dark mode toggle
   - Font size options (small/medium/large)
   - Compact vs comfortable spacing

2. DEFAULT VALUES
   - Remember their last used settings
   - Set preferred defaults
   - Quick reset to defaults option

3. NOTIFICATIONS
   - Email notification preferences
   - In-app notification settings

${customization ? `ADDITIONAL REQUIREMENTS:\n${customization}` : ""}

Store in localStorage for quick access, sync to database if logged in.`
  },
  {
    id: "ai-enhance",
    label: "AI-Powered Enhancements",
    icon: Zap,
    description: "Add smarter AI features - suggestions, improvements, analysis",
    useCase: "Best for: Content creation, analysis, recommendations",
    prompt: (idea: string, customization: string) => `Enhance my app (${idea}) with smarter AI features:

1. AI SUGGESTIONS
   - Offer suggestions based on what user entered
   - "Did you mean..." or "You might also like..."
   - Auto-complete as they type

2. QUALITY ANALYSIS
   - Score or rate the output quality
   - Explain what makes it good/bad
   - Offer specific improvements

3. SMART VARIATIONS
   - Generate multiple options/versions
   - Different styles or tones
   - A/B comparison view

${customization ? `ADDITIONAL REQUIREMENTS:\n${customization}` : ""}

Make the AI features feel magical but not overwhelming. Suggest, don't force.`
  },
  {
    id: "security",
    label: "Security & Trust Features",
    icon: Shield,
    description: "Add features that make users feel safe (encryption, privacy, etc)",
    useCase: "Best for: Apps handling sensitive data",
    prompt: (idea: string, customization: string) => `Add security/trust features to my app (${idea}):

1. DATA PRIVACY
   - Clear privacy policy page
   - Show what data you collect and why
   - Data deletion request option

2. SECURITY INDICATORS
   - "Your data is encrypted" badge
   - Secure connection indicator
   - Two-factor auth option

3. TRUST ELEMENTS
   - Terms of service page
   - Contact support option
   - FAQ or help section

${customization ? `ADDITIONAL REQUIREMENTS:\n${customization}` : ""}

The goal is to make users feel safe trusting you with their data.`
  },
];

export function Day13FeatureTwo({ dayId, userIdea, onComplete }: Day13FeatureTwoProps) {
  const [step, setStep] = useState<"choose" | "customize" | "prompt">("choose");
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [customization, setCustomization] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const { toast } = useToast();

  const feature = FEATURE_OPTIONS.find(f => f.id === selectedFeature);

  const generatePrompt = () => {
    if (!feature) return;
    const prompt = feature.prompt(userIdea, customization);
    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Prompt Copied!",
      description: "Paste this into Replit Agent to build the feature",
    });
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Add Feature #2</h3>
            <p className="text-slate-600 mt-1">
              The "nice to have" that makes your app STICKY. Users come back for this.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Choose Feature", "Customize", "Build It"].map((label, idx) => {
          const steps = ["choose", "customize", "prompt"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-blue-100 text-blue-700" :
                isCurrent ? "bg-blue-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 2 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Choose Feature */}
      {step === "choose" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What should your app do NEXT?</h4>
          <p className="text-sm text-slate-500 mb-4">
            Pick the feature that will keep users coming back
          </p>

          <div className="grid gap-3">
            {FEATURE_OPTIONS.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedFeature(option.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedFeature === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <OptionIcon className={`w-6 h-6 mt-0.5 ${
                      selectedFeature === option.id ? "text-blue-600" : "text-slate-500"
                    }`} />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{option.label}</div>
                      <div className="text-sm text-slate-600 mt-1">{option.description}</div>
                      <div className="text-xs text-slate-400 mt-1">{option.useCase}</div>
                    </div>
                    {selectedFeature === option.id && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={!selectedFeature}
            onClick={() => setStep("customize")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Customize */}
      {step === "customize" && feature && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Customize Your {feature.label}</h4>
          <p className="text-sm text-slate-500 mb-4">
            Add any specific requirements (optional)
          </p>

          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const Icon = feature.icon;
                return <Icon className="w-5 h-5 text-blue-600" />;
              })()}
              <span className="font-bold text-blue-900">{feature.label}</span>
            </div>
            <p className="text-sm text-blue-800">{feature.description}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-2">
              Any specific requirements? (optional)
            </label>
            <Textarea
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
              placeholder="e.g., I only want Google login, no email signup. Or: Export should include a cover page with company logo."
              className="min-h-[100px]"
            />
            <p className="text-sm text-slate-500 mt-1">
              Leave blank to use the default setup
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("choose")}>
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              onClick={generatePrompt}
            >
              Generate Build Prompt <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Build Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Build Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-blue-500 hover:bg-blue-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[300px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("customize")}>
                Back
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleComplete}
              >
                Complete Day 13
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">Feature #2 Strategy</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Feature #1 = Why they TRY you.</strong> (The core value)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Feature #2 = Why they STAY.</strong> (The stickiness)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Don't overdo it.</strong> One additional feature is enough for now.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
