import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe,
  Copy,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface Day27LandingPageProps {
  dayId: number;
  onComplete: () => void;
}

interface ProblemPoint {
  id: string;
  text: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
}

export function Day27LandingPage({ dayId, onComplete }: Day27LandingPageProps) {
  const [step, setStep] = useState<"headline" | "problems" | "features" | "prompt">("headline");
  const [productName, setProductName] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [mainBenefit, setMainBenefit] = useState<string>("");
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState<string>("");
  const [problems, setProblems] = useState<ProblemPoint[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
    { id: "3", text: "" },
  ]);
  const [features, setFeatures] = useState<Feature[]>([
    { id: "1", title: "", description: "" },
    { id: "2", title: "", description: "" },
    { id: "3", title: "", description: "" },
  ]);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const { toast } = useToast();

  const headlineMutation = useMutation({
    mutationFn: async (data: { product: string; audience: string; benefit: string }) => {
      const response = await fetch("/api/ai/generate-headlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to generate headlines");
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedHeadlines(data.headlines || []);
    },
    onError: () => {
      // Fallback headlines
      setGeneratedHeadlines([
        `${mainBenefit} for ${targetAudience}`,
        `Stop struggling. Start ${mainBenefit.toLowerCase()}.`,
        `The ${productName} that ${targetAudience} actually love`,
        `${mainBenefit}. Finally.`,
        `Built for ${targetAudience} who want to ${mainBenefit.toLowerCase()}`,
      ]);
    },
  });

  const generateHeadlines = () => {
    if (productName && targetAudience && mainBenefit) {
      headlineMutation.mutate({
        product: productName,
        audience: targetAudience,
        benefit: mainBenefit,
      });
    }
  };

  const updateProblem = (id: string, text: string) => {
    setProblems(problems.map(p => p.id === id ? { ...p, text } : p));
  };

  const addProblem = () => {
    setProblems([...problems, { id: Date.now().toString(), text: "" }]);
  };

  const removeProblem = (id: string) => {
    if (problems.length > 1) {
      setProblems(problems.filter(p => p.id !== id));
    }
  };

  const updateFeature = (id: string, field: "title" | "description", value: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const addFeature = () => {
    setFeatures([...features, { id: Date.now().toString(), title: "", description: "" }]);
  };

  const removeFeature = (id: string) => {
    if (features.length > 1) {
      setFeatures(features.filter(f => f.id !== id));
    }
  };

  const generateBuildPrompt = () => {
    const validProblems = problems.filter(p => p.text.trim());
    const validFeatures = features.filter(f => f.title.trim());

    const prompt = `Build a high-converting landing page:

PRODUCT: ${productName}
AUDIENCE: ${targetAudience}

HERO SECTION:
- Headline: "${selectedHeadline}"
- Subheadline: ${mainBenefit} - explain in one sentence what they get
- CTA Button: "Get Started Free" or "Start Your Free Trial"
- Optional: Hero image or product screenshot

PROBLEM SECTION (Agitate the Pain):
${validProblems.map((p, i) => `${i + 1}. "${p.text}"`).join("\n")}

Format as:
- Bold headline: "Sound familiar?"
- 3 problem cards with icons
- Each card: brief description of the pain
- Transition: "There's a better way."

SOLUTION/FEATURES SECTION:
${validFeatures.map((f, i) => `${i + 1}. ${f.title}: ${f.description}`).join("\n")}

Format as:
- Section headline: "How ${productName} helps"
- Feature cards in a grid (3 columns on desktop)
- Each card: Icon + Title + Short description
- Keep descriptions to 1-2 sentences max

SOCIAL PROOF SECTION:
- Add placeholder for 3 testimonials
- Format: Quote + Name + Role
- Include star ratings if applicable
- "Trusted by X+ users" counter

PRICING SECTION:
- Link to your pricing page or embed pricing cards
- Highlight most popular plan
- Include "Money-back guarantee" badge

FINAL CTA SECTION:
- Repeat the main headline
- "Ready to ${mainBenefit.toLowerCase()}?"
- Big CTA button
- "No credit card required" or similar trust element

FOOTER:
- Links: Home, Features, Pricing, Contact
- Social media icons
- Copyright notice

DESIGN REQUIREMENTS:
- Mobile-first responsive
- Fast loading (optimize images)
- Consistent spacing (use Tailwind's spacing scale)
- Clear visual hierarchy
- Sticky navigation bar
- Smooth scroll to sections
- Accessible (proper contrast, focus states)

COLOR PALETTE:
- Use your existing brand colors
- Primary color for CTAs
- Light backgrounds for sections
- Alternate white/gray backgrounds between sections

The page should answer these questions in order:
1. What is this? (Hero)
2. Is this for me? (Problem)
3. How does it help? (Features)
4. Can I trust it? (Social Proof)
5. What does it cost? (Pricing)
6. What do I do now? (CTA)`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Landing Page Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-violet-500 flex items-center justify-center">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Landing Page That CONVERTS</h3>
            <p className="text-slate-600 mt-1">
              Your homepage is your storefront. Make it impossible to ignore.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Headline", "Problems", "Features", "Build"].map((label, idx) => {
          const steps = ["headline", "problems", "features", "prompt"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-violet-100 text-violet-700" :
                isCurrent ? "bg-violet-500 text-white" :
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

      {/* Step 1: Headline */}
      {step === "headline" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">Craft your headline</h4>
          <p className="text-sm text-slate-500 mb-4">You have 3 seconds to capture attention</p>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-2">Product name</label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., TaskFlow, BudgetBuddy, FitTrack..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">Who is this for?</label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., busy professionals, first-time founders, fitness enthusiasts..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-2">Main benefit in 5 words or less</label>
              <Input
                value={mainBenefit}
                onChange={(e) => setMainBenefit(e.target.value)}
                placeholder="e.g., Ship faster, Save 10 hours/week..."
              />
            </div>
          </div>

          {productName && targetAudience && mainBenefit && (
            <Button
              variant="outline"
              className="w-full mt-4 gap-2"
              onClick={generateHeadlines}
              disabled={headlineMutation.isPending}
            >
              <Sparkles className="w-4 h-4" />
              {headlineMutation.isPending ? "Generating..." : "Generate Headline Ideas"}
            </Button>
          )}

          {generatedHeadlines.length > 0 && (
            <div className="mt-4 space-y-2">
              <label className="block font-semibold text-slate-900">Pick your favorite:</label>
              {generatedHeadlines.map((headline, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedHeadline(headline)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedHeadline === headline
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200 hover:border-violet-300"
                  }`}
                >
                  <span className="font-medium text-slate-900">{headline}</span>
                </button>
              ))}
              <div className="mt-2">
                <label className="block text-sm text-slate-600 mb-1">Or write your own:</label>
                <Input
                  value={selectedHeadline}
                  onChange={(e) => setSelectedHeadline(e.target.value)}
                  placeholder="Type your custom headline..."
                />
              </div>
            </div>
          )}

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={!selectedHeadline}
            onClick={() => setStep("problems")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Problems */}
      {step === "problems" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900">What problems do you solve?</h4>
              <p className="text-sm text-slate-500">List the pains your audience feels</p>
            </div>
            <Button variant="outline" onClick={addProblem} className="gap-2">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="space-y-3">
            {problems.map((problem, idx) => (
              <div key={problem.id} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500 w-6">{idx + 1}.</span>
                <Input
                  value={problem.text}
                  onChange={(e) => updateProblem(problem.id, e.target.value)}
                  placeholder={
                    idx === 0 ? "e.g., Spending hours on manual tasks" :
                    idx === 1 ? "e.g., Losing track of important deadlines" :
                    "e.g., Frustrated by clunky tools"
                  }
                  className="flex-1"
                />
                {problems.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeProblem(problem.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("headline")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!problems.some(p => p.text.trim())}
              onClick={() => setStep("features")}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Features */}
      {step === "features" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900">Key features</h4>
              <p className="text-sm text-slate-500">How does your product solve the problems?</p>
            </div>
            <Button variant="outline" onClick={addFeature} className="gap-2">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div key={feature.id} className="p-4 rounded-lg border-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Feature {idx + 1}</span>
                  {features.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeFeature(feature.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <Input
                  value={feature.title}
                  onChange={(e) => updateFeature(feature.id, "title", e.target.value)}
                  placeholder="Feature title (e.g., One-Click Automation)"
                  className="mb-2"
                />
                <Textarea
                  value={feature.description}
                  onChange={(e) => updateFeature(feature.id, "description", e.target.value)}
                  placeholder="Brief description (1-2 sentences)"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("problems")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!features.some(f => f.title.trim())}
              onClick={generateBuildPrompt}
            >
              Generate Build Prompt <ArrowRight className="w-4 h-4 ml-2" />
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
                <h4 className="font-bold text-slate-900">Your Landing Page Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-violet-500 hover:bg-violet-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Your storefront is ready</p>
                <p className="text-sm text-slate-500">Now you have somewhere to send people</p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 27
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">Landing Page Formula</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Above the fold:</strong> Headline + CTA visible without scrolling.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>One CTA per screen:</strong> Don't confuse visitors with options.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Social proof:</strong> Even "Join 50+ users" is better than nothing.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
