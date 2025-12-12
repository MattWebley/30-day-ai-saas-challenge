import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
import { Sparkles, Loader2, ChevronRight, ChevronLeft, Plus, X, Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const BleedingNeckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4" strokeWidth="2.5" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const CoreFeaturesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);

const UniqueFeatureIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
  </svg>
);

const PitchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const CustomerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const CompetitorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

interface Competitor {
  name: string;
  url: string;
  description: string;
  topFeatures: string[];
  screenshotUrl: string;
}

const MOCK_IDEA = {
  title: "AI Content Optimizer",
  desc: "A SaaS tool that uses AI to analyze and optimize marketing content for better engagement",
  targetCustomer: "Digital marketers and content creators",
};

const MOCK_USER_INPUTS = {
  skills: "copywriting, marketing",
  knowledge: "digital marketing, SEO",
  interests: "AI tools, automation",
};

interface Day3Props {
  onComplete: () => void;
}

export function Day3FeatureBuilder({ onComplete }: Day3Props) {
  const queryClient = useQueryClient();
  const { testMode } = useTestMode();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [bleedingNeckProblem, setBleedingNeckProblem] = useState("");
  const [coreFeatures, setCoreFeatures] = useState<string[]>([]);
  const [uspFeatures, setUspFeatures] = useState<string[]>([]);
  const [uspSuggestions, setUspSuggestions] = useState<string[]>([]);
  const [selectedUspIndexes, setSelectedUspIndexes] = useState<number[]>([]);
  const [newFeature, setNewFeature] = useState("");
  
  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");
  const [benefit, setBenefit] = useState("");
  const [pitchVariations, setPitchVariations] = useState<string[]>([]);
  const [selectedPitch, setSelectedPitch] = useState<number | null>(null);
  const [finalPitch, setFinalPitch] = useState("");
  
  const [icpData, setIcpData] = useState<{ description: string; hangouts: string[] } | null>(null);
  const [isGeneratingICP, setIsGeneratingICP] = useState(false);
  
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [sharedFeatures, setSharedFeatures] = useState<string[]>([]);
  const [isResearchingCompetitors, setIsResearchingCompetitors] = useState(false);
  const [competitorAttempts, setCompetitorAttempts] = useState(0);
  
  const [bleedingNeckAttempts, setBleedingNeckAttempts] = useState(0);
  const [coreAttempts, setCoreAttempts] = useState(0);
  const [uspAttempts, setUspAttempts] = useState(0);
  const [pitchAttempts, setPitchAttempts] = useState(0);
  const [icpAttempts, setIcpAttempts] = useState(0);
  const MAX_AI_ATTEMPTS = 3;

  const { data: allProgress } = useQuery({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const res = await fetch("/api/progress", { credentials: "include" });
      return res.json();
    },
  });

  const day1Progress = allProgress?.find((p: any) => p.day === 1);
  const day2Progress = allProgress?.find((p: any) => p.day === 2);

  const shortlistedIdeas = day1Progress?.generatedIdeas?.filter((_: any, i: number) => 
    day1Progress?.shortlistedIdeas?.includes(i)
  ) || [];

  const chosenIdeaIndex = day2Progress?.userInputs?.chosenIdea;
  const realChosenIdea = chosenIdeaIndex !== undefined && shortlistedIdeas[chosenIdeaIndex]
    ? shortlistedIdeas[chosenIdeaIndex]
    : null;

  const chosenIdea = testMode ? MOCK_IDEA : realChosenIdea;
  const userInputs = testMode ? MOCK_USER_INPUTS : day1Progress?.userInputs;

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day3", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const generateBleedingNeck = async () => {
    if (bleedingNeckAttempts >= MAX_AI_ATTEMPTS) return;
    setBleedingNeckAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const prompt = `I'm building: "${chosenIdea?.title}" - ${chosenIdea?.desc}

What is the ONE critical "bleeding neck" problem this product solves? This is the pain so urgent that customers would pay almost anything to fix it.

Give me a clear, one-sentence problem statement in this format:
"[Target customers] desperately need [solution] because [pain point is critical]."

Just the one sentence, nothing else.`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      setBleedingNeckProblem(data.response.trim().replace(/^["']|["']$/g, ''));
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGenerating(false);
  };

  const researchCompetitors = async () => {
    if (competitorAttempts >= MAX_AI_ATTEMPTS) return;
    setCompetitorAttempts(prev => prev + 1);
    setIsResearchingCompetitors(true);
    try {
      const res = await apiRequest("POST", "/api/research-competitors", {
        ideaTitle: chosenIdea?.title,
        ideaDescription: chosenIdea?.desc,
        targetCustomer: chosenIdea?.targetCustomer,
      });
      const data = await res.json();
      setCompetitors(data.competitors || []);
      setSharedFeatures(data.sharedFeatures || []);
      if (data.sharedFeatures?.length > 0) {
        setCoreFeatures(data.sharedFeatures);
      }
    } catch {
      toast.error("Failed to research competitors. Try again.");
    }
    setIsResearchingCompetitors(false);
  };

  const generateUSPFromCompetitors = async () => {
    if (uspAttempts >= MAX_AI_ATTEMPTS) return;
    setUspAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/generate-usp-features", {
        ideaTitle: chosenIdea?.title,
        ideaDescription: chosenIdea?.desc,
        userSkills: `${userInputs?.skills || ''}, ${userInputs?.knowledge || ''}`,
        sharedFeatures: coreFeatures,
        competitors: competitors,
      });
      const data = await res.json();
      setUspSuggestions(data.uspFeatures || []);
      setSelectedUspIndexes([]);
    } catch {
      toast.error("Failed to generate USP features. Try again.");
    }
    setIsGenerating(false);
  };

  const generateCoreFeatures = async () => {
    if (coreAttempts >= MAX_AI_ATTEMPTS) return;
    setCoreAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const prompt = `I'm building: "${chosenIdea?.title}" - ${chosenIdea?.desc}
Target: ${chosenIdea?.targetCustomer}

What are the 5-7 CORE features that every competitor in this space has? These are baseline features users expect.

List only essential features that are common across the industry. One feature per line, keep each under 8 words.`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const features = data.response
        .split('\n')
        .map((line: string) => line.replace(/^[-•*\d.]+\s*/, '').replace(/^\.\s*/, '').trim())
        .filter((line: string) => line.length > 3 && line.length < 60);
      setCoreFeatures(features.slice(0, 7));
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGenerating(false);
  };

  const generateUSPFeatures = async () => {
    if (uspAttempts >= MAX_AI_ATTEMPTS) return;
    setUspAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const prompt = `I'm building: "${chosenIdea?.title}" - ${chosenIdea?.desc}
My skills: ${userInputs?.skills || 'general tech skills'}
My knowledge: ${userInputs?.knowledge || 'general knowledge'}

I already have these core features: ${coreFeatures.join(', ')}

Now suggest 6 UNIQUE features that would make my product stand out from competitors. These should leverage my skills/knowledge and fill gaps competitors miss.

Format each as: Feature Name - Brief explanation of the unique value
Example:
- AI Writing Coach - Personalized feedback improves copy quality
- Smart A/B Testing - Automatically finds winning variations

Give me exactly 6 ideas, one per line:`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const features = data.response
        .split('\n')
        .map((line: string) => line.replace(/^[-•*\d.]+\s*/, '').replace(/^\.\s*/, '').trim())
        .filter((line: string) => line.length > 5 && line.length < 150);
      setUspSuggestions(features.slice(0, 6));
      setSelectedUspIndexes([]);
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGenerating(false);
  };

  const generatePitches = async () => {
    if (pitchAttempts >= MAX_AI_ATTEMPTS) return;
    setPitchAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const prompt = `Create 4 different 10-second pitch variations for this product:

Product: ${chosenIdea?.title}
Description: ${chosenIdea?.desc}
Problem it solves: ${bleedingNeckProblem || 'Not specified'}
Target: ${who || 'Not specified'}
What they do: ${what || 'Not specified'}
Benefit: ${benefit || 'Not specified'}

Each pitch should:
- Be ONE sentence, under 15 words
- Be so simple a 10-year-old understands it
- Use the formula: "I help [WHO] [DO WHAT] so they can [BENEFIT]"
- No jargon or buzzwords

Give me exactly 4 variations, one per line. Just the pitch, nothing else:`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const pitches = data.response
        .split('\n')
        .map((line: string) => line.replace(/^[-•*\d.]+\s*/, '').replace(/^\.\s*/, '').trim())
        .filter((line: string) => line.length > 10 && line.length < 200);
      setPitchVariations(pitches.slice(0, 4));
      setSelectedPitch(null);
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGenerating(false);
  };

  const generateICP = async () => {
    if (icpAttempts >= MAX_AI_ATTEMPTS) return;
    setIcpAttempts(prev => prev + 1);
    setIsGeneratingICP(true);
    try {
      const prompt = `Based on this target customer description, create a detailed ideal customer profile (ICP/avatar):

Target Customer: ${who}
Product: ${chosenIdea?.title}
What they need: ${what}
Benefit they want: ${benefit}
Problem it solves: ${bleedingNeckProblem || 'Not specified'}

Give me TWO things:

1. A 2-3 sentence vivid description of this ideal customer. Include their typical age range, job/situation, daily frustrations, and what success looks like for them. Make it feel like a real person.

2. Exactly 7 specific online places where this exact person hangs out (be specific - not just "Facebook" but "Facebook Groups for [specific topic]"). Include specific subreddits, communities, podcasts, YouTube channels, newsletters, or forums they'd frequent.

Format your response EXACTLY like this:
DESCRIPTION: [your 2-3 sentence avatar description]
HANGOUTS:
1. [specific place]
2. [specific place]
3. [specific place]
4. [specific place]
5. [specific place]
6. [specific place]
7. [specific place]`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const response = data.response;

      const descMatch = response.match(/DESCRIPTION:\s*([\s\S]+?)(?=HANGOUTS:|$)/);
      const description = descMatch ? descMatch[1].trim() : "";

      const hangoutsMatch = response.match(/HANGOUTS:\s*([\s\S]+)/);
      const hangoutsText = hangoutsMatch ? hangoutsMatch[1] : "";
      const hangouts = hangoutsText
        .split('\n')
        .map((line: string) => line.replace(/^[\d.)\-•*]+\s*/, '').trim())
        .filter((line: string) => line.length > 5)
        .slice(0, 7);

      setIcpData({ description, hangouts });
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGeneratingICP(false);
  };

  const toggleUspSelection = (index: number) => {
    setSelectedUspIndexes(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else if (prev.length < 2) {
        return [...prev, index];
      }
      return prev;
    });
  };

  const confirmUspSelection = () => {
    const selected = selectedUspIndexes.map(i => uspSuggestions[i]);
    setUspFeatures(prev => [...prev, ...selected]);
    setUspSuggestions([]);
    setSelectedUspIndexes([]);
  };

  const addFeature = (type: 'core' | 'usp') => {
    if (!newFeature.trim()) return;
    if (type === 'core') {
      setCoreFeatures(prev => [...prev, newFeature.trim()]);
    } else {
      setUspFeatures(prev => [...prev, newFeature.trim()]);
    }
    setNewFeature("");
  };

  const removeFeature = (type: 'core' | 'usp', index: number) => {
    if (type === 'core') {
      setCoreFeatures(prev => prev.filter((_, i) => i !== index));
    } else {
      setUspFeatures(prev => prev.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSelectPitch = (index: number) => {
    setSelectedPitch(index);
    setFinalPitch(pitchVariations[index]);
  };

  const handleFinish = () => {
    saveProgress.mutate({ 
      bleedingNeckProblem, 
      coreFeatures, 
      uspFeatures,
      who,
      what,
      benefit,
      finalPitch,
      icpDescription: icpData?.description,
      icpHangouts: icpData?.hangouts
    });
    setCurrentStep(7);
  };

  if (!chosenIdea) {
    return (
      <Card className="p-8 border-2 border-amber-200 bg-amber-50 text-center">
        <BleedingNeckIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Day 2 First!</h3>
        <p className="text-slate-600">
          You need to choose your final idea in Day 2 before defining features here.
        </p>
      </Card>
    );
  }

  const steps = [
    { num: 1, label: "Problem" },
    { num: 2, label: "Competitors" },
    { num: 3, label: "Core" },
    { num: 4, label: "USP" },
    { num: 5, label: "Pitch" },
    { num: 6, label: "Customer" },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-4 border border-slate-200 bg-slate-50">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Building:</p>
        <h3 className="font-bold text-slate-900">{chosenIdea.title}</h3>
      </Card>

      {currentStep < 7 && (
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep > step.num 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.num 
                      ? 'bg-black text-white' 
                      : 'bg-slate-200 text-slate-400'
                }`}
              >
                {currentStep > step.num ? <Check className="w-3 h-3" /> : step.num}
              </div>
              <span className={`ml-1 text-xs font-medium ${currentStep >= step.num ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`w-6 h-0.5 mx-2 ${currentStep > step.num ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <BleedingNeckIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">What's the Bleeding Neck Problem?</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                The ONE critical problem your customers are <strong>desperate</strong> to solve. 
                So painful they'd pay almost anything to fix it.
              </p>
            </div>

            <Card className="p-6 border-2 border-slate-200">
              <Textarea
                placeholder="e.g. Small business owners waste 10+ hours/week on manual bookkeeping because existing tools are too complex..."
                value={bleedingNeckProblem}
                onChange={(e) => setBleedingNeckProblem(e.target.value)}
                className="min-h-[120px] text-lg border-0 shadow-none focus-visible:ring-0 resize-none"
                data-testid="input-bleeding-neck"
              />
              <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={generateBleedingNeck}
                        disabled={isGenerating || bleedingNeckAttempts >= MAX_AI_ATTEMPTS}
                        data-testid="button-generate-problem"
                      >
                        {isGenerating ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</>
                        ) : bleedingNeckAttempts >= MAX_AI_ATTEMPTS ? (
                          <>No attempts left</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Write It For Me{MAX_AI_ATTEMPTS - bleedingNeckAttempts === 1 ? ' (1 left)' : ''}</>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI will write a problem statement for you</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card>

            <div className="flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(2)}
                      disabled={!bleedingNeckProblem.trim()}
                      data-testid="button-next-step1"
                    >
                      Next: Find Competitors <ChevronRight className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Continue to define your core features</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <CompetitorIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Who Are Your Direct Competitors?</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                Let's find SaaS products that do <strong>exactly</strong> what you're building.
              </p>
            </div>

            <Card className="p-6 border-2 border-slate-200">
              <div className="text-center mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        className="gap-2"
                        onClick={researchCompetitors}
                        disabled={isResearchingCompetitors || competitorAttempts >= MAX_AI_ATTEMPTS}
                        data-testid="button-research-competitors"
                      >
                        {isResearchingCompetitors ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Searching the market...</>
                        ) : competitorAttempts >= MAX_AI_ATTEMPTS ? (
                          <>No attempts left</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Find My Competitors{competitorAttempts > 0 && MAX_AI_ATTEMPTS - competitorAttempts === 1 ? ' (1 left)' : ''}</>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI will search for direct SaaS competitors</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {competitors.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-lg">Found {competitors.length} Direct Competitors:</h3>
                  <div className="space-y-4">
                    {competitors.map((comp, i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex gap-4">
                          <img 
                            src={comp.screenshotUrl} 
                            alt={`${comp.name} screenshot`}
                            className="w-32 h-24 object-cover rounded border border-slate-200 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="96" viewBox="0 0 128 96"><rect fill="%23f1f5f9" width="128" height="96"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="10">Screenshot</text></svg>';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900">{comp.name}</h4>
                              <a 
                                href={comp.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                                data-testid={`link-competitor-${i}`}
                              >
                                Visit site ↗
                              </a>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{comp.description}</p>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Top 5 Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {comp.topFeatures.slice(0, 5).map((feature, fi) => (
                                  <span key={fi} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {sharedFeatures.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-bold text-green-900 mb-2">Shared Core Features (Found in 2+ Competitors):</h4>
                      <p className="text-sm text-green-700 mb-3">These are the baseline features you MUST have to compete:</p>
                      <div className="flex flex-wrap gap-2">
                        {sharedFeatures.map((feature, i) => (
                          <span key={i} className="px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-lg font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <div className="flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to the problem step</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(3)}
                      disabled={competitors.length === 0}
                      data-testid="button-next-step2"
                    >
                      Next: Core Features <ChevronRight className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Review core features from competitor analysis</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <CoreFeaturesIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Core Features (From Competitors)</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                These are the baseline features users <strong>expect</strong>. Edit or add more below.
              </p>
            </div>

            <Card className="p-6 border-2 border-slate-200">
              <div className="space-y-3">
                {coreFeatures.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group border border-slate-200">
                    <Check className="w-4 h-4 text-black flex-shrink-0" />
                    <span className="flex-1 text-slate-800">{feature}</span>
                    <button
                      onClick={() => removeFeature('core', i)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a feature and press Enter..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFeature('core')}
                    className="flex-1"
                    data-testid="input-core-feature"
                  />
                  <Button variant="outline" onClick={() => addFeature('core')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 uppercase">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={generateCoreFeatures}
                          disabled={isGenerating || coreAttempts >= MAX_AI_ATTEMPTS}
                          data-testid="button-generate-core"
                        >
                          {isGenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing competitors...</>
                          ) : coreAttempts >= MAX_AI_ATTEMPTS ? (
                            <>No attempts left</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Generate with AI{MAX_AI_ATTEMPTS - coreAttempts === 1 ? ' (1 left)' : ''}</>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>AI analyzes competitors to find core features</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to competitors</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(4)}
                      disabled={coreFeatures.length === 0}
                      data-testid="button-next-step3"
                    >
                      Next: Your USP <ChevronRight className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Continue to define your unique features</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <UniqueFeatureIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">What Makes You Different?</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                1-2 unique features that competitors <strong>don't have</strong>. Your unfair advantage.
              </p>
            </div>

            <Card className="p-6 border-2 border-slate-200">
              <div className="space-y-4">
                {uspFeatures.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Your USP Features:</p>
                    {uspFeatures.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-black text-white rounded-lg group">
                        <UniqueFeatureIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{feature}</span>
                        <button
                          onClick={() => removeFeature('usp', i)}
                          className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uspSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Pick 1-2 features that excite you:</p>
                    <div className="grid gap-2">
                      {uspSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => toggleUspSelection(i)}
                          className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                            selectedUspIndexes.includes(i)
                              ? 'border-black bg-slate-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedUspIndexes.includes(i) ? 'border-black bg-black' : 'border-slate-300'
                            }`}>
                              {selectedUspIndexes.includes(i) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-slate-800">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={confirmUspSelection}
                      disabled={selectedUspIndexes.length === 0}
                    >
                      Add Selected ({selectedUspIndexes.length}/2)
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your unique feature and press Enter..."
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addFeature('usp')}
                        className="flex-1"
                        data-testid="input-usp-feature"
                      />
                      <Button variant="outline" onClick={() => addFeature('usp')}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400 uppercase">or</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={generateUSPFeatures}
                            disabled={isGenerating || uspAttempts >= MAX_AI_ATTEMPTS}
                            data-testid="button-generate-usp"
                          >
                            {isGenerating ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Generating ideas...</>
                            ) : uspAttempts >= MAX_AI_ATTEMPTS ? (
                              <>No attempts left</>
                            ) : (
                              <><Sparkles className="w-4 h-4" /> Generate 6 Ideas{MAX_AI_ATTEMPTS - uspAttempts === 1 ? ' (1 left)' : ''}</>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>AI generates 6 unique feature ideas</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(3)}
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to core features</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(5)}
                      disabled={uspFeatures.length === 0}
                      data-testid="button-next-step4"
                    >
                      Next: Your Pitch <ChevronRight className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Continue to create your 10-second pitch</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <PitchIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your 10-Second Pitch</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                Explain what you do in one simple sentence anyone can understand.
              </p>
            </div>

            <Card className="p-5 border-2 border-black bg-slate-50">
              <p className="text-center text-sm font-medium text-slate-600 mb-2">The magic formula:</p>
              <div className="text-center text-xl font-bold text-black">
                "I help <span className="text-blue-600">[WHO]</span> do <span className="text-blue-600">[WHAT]</span> so they can <span className="text-blue-600">[BENEFIT]</span>"
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-4 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  WHO do you help?
                </label>
                <Input
                  placeholder="e.g. busy freelancers, first-time homebuyers..."
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  className="text-base"
                  data-testid="input-who"
                />
              </Card>

              <Card className="p-4 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  WHAT do you help them do?
                </label>
                <Input
                  placeholder="e.g. find clients, save for retirement..."
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                  className="text-base"
                  data-testid="input-what"
                />
              </Card>

              <Card className="p-4 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  What BENEFIT do they get?
                </label>
                <Input
                  placeholder="e.g. earn more money, save 5 hours/week..."
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  className="text-base"
                  data-testid="input-benefit"
                />
              </Card>
            </div>

            {who && what && benefit && (
              <>
                <Card className="p-4 border-2 border-black bg-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Your draft pitch:</p>
                  <p className="text-lg font-medium text-slate-900">
                    "I help {who} {what} so they can {benefit}."
                  </p>
                </Card>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">AI Pitch Variations</p>
                    {pitchVariations.length === 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              className="gap-2"
                              onClick={generatePitches}
                              disabled={isGenerating || pitchAttempts >= MAX_AI_ATTEMPTS}
                              data-testid="button-generate-pitches"
                            >
                              {isGenerating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Generate 4 Ideas{pitchAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>AI creates 4 pitch variations</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : pitchAttempts < MAX_AI_ATTEMPTS && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={generatePitches}
                              disabled={isGenerating}
                            >
                              {isGenerating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</>
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Regenerate{pitchAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Generate new pitch variations</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {pitchVariations.length > 0 && (
                    <div className="space-y-2">
                      {pitchVariations.map((pitch, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectPitch(i)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all cursor-pointer text-sm ${
                            selectedPitch === i
                              ? 'border-black bg-black text-white'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selectedPitch === i ? 'border-white bg-white' : 'border-slate-300'
                            }`}>
                              {selectedPitch === i && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <span className={selectedPitch === i ? 'text-white' : 'text-slate-800'}>
                              {pitch}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPitch !== null && (
                  <Card className="p-4 border-2 border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Your final pitch (edit if needed):
                    </label>
                    <Textarea
                      value={finalPitch}
                      onChange={(e) => setFinalPitch(e.target.value)}
                      className="min-h-[60px] text-base"
                      data-testid="input-final-pitch"
                    />
                    <div className="flex justify-end mt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => copyToClipboard(finalPitch)}
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy your pitch to clipboard</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Card>
                )}
              </>
            )}

            <div className="flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(4)}
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to USP features</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(6)}
                      disabled={!finalPitch.trim()}
                      data-testid="button-next-step5"
                    >
                      Meet Your Customer <ChevronRight className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Continue to discover your ideal customer</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}

        {currentStep === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <CustomerIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Ideal Customer</h2>
              <p className="text-slate-500">Discover who they are and where to find them.</p>
            </div>

            <Card className="p-4 border-2 border-black bg-slate-50">
              <p className="text-sm font-bold text-slate-500 uppercase mb-1">You're building for:</p>
              <p className="text-lg font-bold text-black">{who}</p>
            </Card>

            {!icpData ? (
              <Card className="p-6 border-2 border-slate-200 text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="gap-2"
                        onClick={generateICP}
                        disabled={isGeneratingICP || icpAttempts >= MAX_AI_ATTEMPTS}
                        data-testid="button-generate-icp"
                      >
                        {isGeneratingICP ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Building profile...</>
                        ) : icpAttempts >= MAX_AI_ATTEMPTS ? (
                          <>No attempts left</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Generate Customer Profile{icpAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI creates a detailed customer avatar and where to find them</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                      <CustomerIcon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-900">Your Ideal Customer</h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm">{icpData.description}</p>
                </Card>

                <Card className="p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20" />
                        <ellipse cx="12" cy="12" rx="4" ry="10" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900">7 Places They Hang Out</h4>
                  </div>
                  <div className="space-y-2">
                    {icpData.hangouts.map((hangout, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-slate-700 text-sm">{hangout}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {icpAttempts < MAX_AI_ATTEMPTS && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={generateICP}
                    disabled={isGeneratingICP}
                  >
                    {isGeneratingICP ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Regenerate{icpAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                    )}
                  </Button>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(5)}
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to your pitch</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={handleFinish}
                      disabled={!icpData}
                      data-testid="button-finish"
                    >
                      <Check className="w-5 h-5" /> Finish
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save everything and see your summary</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}

        {currentStep === 7 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Product Blueprint is Ready!</h2>
              <p className="text-slate-500">Everything you need to start building.</p>
            </div>

            <Card className="p-4 border-2 border-black">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Your 10-Second Pitch:</p>
              <p className="text-lg font-medium text-slate-900">{finalPitch}</p>
            </Card>

            <Card className="p-5 border-2 border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <BleedingNeckIcon className="w-5 h-5 text-black" />
                <h3 className="font-bold text-black">Bleeding Neck Problem</h3>
              </div>
              <p className="text-slate-700">{bleedingNeckProblem}</p>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <CoreFeaturesIcon className="w-5 h-5 text-black" />
                  <h3 className="font-bold text-black">Core Features</h3>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{coreFeatures.length}</span>
                </div>
                <ul className="space-y-2">
                  {coreFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <UniqueFeatureIcon className="w-5 h-5 text-black" />
                  <h3 className="font-bold text-black">USP Features</h3>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{uspFeatures.length}</span>
                </div>
                <ul className="space-y-2">
                  {uspFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <UniqueFeatureIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {icpData && (
              <Card className="p-5 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <CustomerIcon className="w-5 h-5 text-black" />
                  <h3 className="font-bold text-black">Your Ideal Customer</h3>
                </div>
                <p className="text-slate-700 text-sm mb-3">{icpData.description}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Find them at:</p>
                <div className="flex flex-wrap gap-2">
                  {icpData.hangouts.slice(0, 4).map((h, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{h}</span>
                  ))}
                  {icpData.hangouts.length > 4 && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">+{icpData.hangouts.length - 4} more</span>
                  )}
                </div>
              </Card>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold gap-2"
                    onClick={onComplete}
                    data-testid="button-complete-day3"
                  >
                    Complete Day 3 <ChevronRight className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark Day 3 as complete and move on</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
