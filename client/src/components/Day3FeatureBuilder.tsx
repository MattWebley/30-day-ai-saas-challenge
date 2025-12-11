import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
import { Sparkles, Loader2, ChevronRight, ChevronLeft, Plus, X, Check } from "lucide-react";

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
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  
  const [bleedingNeckAttempts, setBleedingNeckAttempts] = useState(0);
  const [coreAttempts, setCoreAttempts] = useState(0);
  const [uspAttempts, setUspAttempts] = useState(0);
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

  const generateCoreFeatures = async () => {
    if (coreAttempts >= MAX_AI_ATTEMPTS) return;
    setCoreAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const prompt = `I'm building: "${chosenIdea?.title}" - ${chosenIdea?.desc}

The bleeding neck problem I'm solving: ${bleedingNeckProblem}

What are the 4-5 CORE features that ALL competitors in this space have? These are the baseline features users expect.

List them as simple bullet points, one feature per line. Just the feature names, no explanations. Example format:
- User authentication
- Dashboard
- etc.`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const features = data.response
        .split('\n')
        .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
        .filter((line: string) => line.length > 0 && line.length < 100);
      setCoreFeatures(features.slice(0, 6));
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

Bleeding neck problem: ${bleedingNeckProblem}

My skills: ${userInputs?.skills || 'Not specified'}
My knowledge: ${userInputs?.knowledge || 'Not specified'}

Generate 6 unique USP feature ideas that:
1. Competitors DON'T have
2. Leverage my unique skills/knowledge
3. Would make customers choose ME over alternatives

Format each as: Feature Name - Short benefit (10 words max)

Example:
- AI Writing Coach - Personalized feedback improves copy quality
- Smart A/B Testing - Automatically finds winning variations

Give me exactly 6 ideas, one per line:`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const features = data.response
        .split('\n')
        .map((line: string) => line.replace(/^[-•*\d.]\s*/, '').trim())
        .filter((line: string) => line.length > 5 && line.length < 150);
      setUspSuggestions(features.slice(0, 6));
      setSelectedUspIndexes([]);
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGenerating(false);
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

  const handleFinish = () => {
    saveProgress.mutate({ bleedingNeckProblem, coreFeatures, uspFeatures });
    setCurrentStep(4);
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
    { num: 2, label: "Core" },
    { num: 3, label: "USP" },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-4 border border-slate-200 bg-slate-50">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Building:</p>
        <h3 className="font-bold text-slate-900">{chosenIdea.title}</h3>
      </Card>

      {currentStep < 4 && (
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep > step.num 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.num 
                      ? 'bg-black text-white' 
                      : 'bg-slate-200 text-slate-400'
                }`}
              >
                {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= step.num ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-3 ${currentStep > step.num ? 'bg-green-500' : 'bg-slate-200'}`} />
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
                placeholder="e.g., Small business owners waste 10+ hours/week on manual bookkeeping because existing tools are too complex..."
                value={bleedingNeckProblem}
                onChange={(e) => setBleedingNeckProblem(e.target.value)}
                className="min-h-[120px] text-lg border-0 shadow-none focus-visible:ring-0 resize-none"
                data-testid="input-bleeding-neck"
              />
              <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
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
                    <><Sparkles className="w-4 h-4" /> Write It For Me ({MAX_AI_ATTEMPTS - bleedingNeckAttempts} left)</>
                  )}
                </Button>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep(2)}
                disabled={!bleedingNeckProblem.trim()}
                data-testid="button-next-step1"
              >
                Next: Core Features <ChevronRight className="w-5 h-5" />
              </Button>
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
                <CoreFeaturesIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">What Core Features Do You Need?</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                The baseline features ALL competitors have. Users <strong>expect</strong> these.
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
                      <><Sparkles className="w-4 h-4" /> Generate with AI ({MAX_AI_ATTEMPTS - coreAttempts} left)</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep(1)}
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep(3)}
                disabled={coreFeatures.length === 0}
                data-testid="button-next-step2"
              >
                Next: Your USP <ChevronRight className="w-5 h-5" />
              </Button>
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
                        <><Sparkles className="w-4 h-4" /> Generate 6 Ideas ({MAX_AI_ATTEMPTS - uspAttempts} left)</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep(2)}
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleFinish}
                disabled={uspFeatures.length === 0}
                data-testid="button-finish"
              >
                <Check className="w-5 h-5" /> Finish
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
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
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Feature Plan is Ready!</h2>
              <p className="text-slate-500">Here's exactly what you're building.</p>
            </div>

            <Card className="p-5 border-2 border-black">
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

            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={onComplete}
              data-testid="button-complete-day3"
            >
              Complete Day 3 <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
