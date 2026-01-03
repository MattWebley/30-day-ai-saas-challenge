import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Sparkles, Loader2, ChevronRight, Trophy, Flame, Plus, X, CheckCircle2, TrendingUp, Users, AlertTriangle, Target } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Idea {
  title: string;
  desc: string;
  targetCustomer: string;
  scores: {
    marketDemand: number;
    skillMatch: number;
    passionFit: number;
    speedToMvp: number;
    monetization: number;
  };
  totalScore: number;
  whyThisWorks: string;
}

interface ValidationInsight {
  demandScore: number;
  competitionLevel: string;
  topRisk: string;
  verdict: string;
}

interface Day2Props {
  onComplete: (data: {
    chosenIdea: string;
    chosenIdeaTitle: string;
    selectedPainPoints: string[];
    validationInsights: ValidationInsight;
  }) => void;
}

export function Day2IdeaValidator({ onComplete }: Day2Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'shortlist' | 'validate' | 'pain' | 'done'>('shortlist');
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(null);
  const [validationInsights, setValidationInsights] = useState<Record<number, ValidationInsight>>({});
  const [loadingValidation, setLoadingValidation] = useState<number | null>(null);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [loadingPainPoints, setLoadingPainPoints] = useState(false);
  const [customPainInput, setCustomPainInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const { data: day1Progress } = useQuery({
    queryKey: ["/api/progress/1"],
    queryFn: async () => {
      const res = await fetch("/api/progress", { credentials: "include" });
      const all = await res.json();
      return all.find((p: any) => p.day === 1);
    },
  });

  const shortlistedIdeas: Idea[] = day1Progress?.generatedIdeas?.filter((_: Idea, i: number) =>
    day1Progress?.shortlistedIdeas?.includes(i)
  ) || [];

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day2", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  // Validate a single idea
  const validateIdea = useMutation({
    mutationFn: async (ideaIndex: number) => {
      const idea = shortlistedIdeas[ideaIndex];
      const prompt = `Analyze this SaaS idea for validation. Be honest but constructive.

IDEA: "${idea.title}"
DESCRIPTION: ${idea.desc}
TARGET: ${idea.targetCustomer}

Respond in EXACTLY this JSON format (no other text):
{
  "demandScore": [1-10 number - 7+ unless fundamental issues],
  "competitionLevel": "[Low/Medium/High] - [one sentence explanation]",
  "topRisk": "[The #1 thing that could kill this - one sentence]",
  "verdict": "[Proceed/Pivot/Needs More Research] - [one sentence why]"
}`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      return res.json();
    },
    onSuccess: (data, ideaIndex) => {
      try {
        // Try to extract JSON from response
        let jsonStr = data.response;
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        const parsed = JSON.parse(jsonStr);
        setValidationInsights(prev => ({
          ...prev,
          [ideaIndex]: parsed,
        }));
      } catch (e) {
        console.error("Failed to parse validation response:", e);
        // Fallback
        setValidationInsights(prev => ({
          ...prev,
          [ideaIndex]: {
            demandScore: 7,
            competitionLevel: "Unknown - AI response parsing failed",
            topRisk: "Unable to analyze - try again",
            verdict: "Needs More Research",
          },
        }));
      }
      setLoadingValidation(null);
    },
    onError: () => {
      toast.error("Failed to validate idea");
      setLoadingValidation(null);
    },
  });

  // Generate pain points for selected idea
  const generatePainPoints = useMutation({
    mutationFn: async (ideaIndex: number) => {
      const idea = shortlistedIdeas[ideaIndex];
      const prompt = `Identify 6-8 specific pain points that "${idea.title}" solves for ${idea.targetCustomer}.

Rules:
- Each pain must be 5-12 words max
- Focus on REAL pains in this niche
- Most painful first
- No percentages or specific metrics

Return ONLY a numbered list:
1. [pain]
2. [pain]
...`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      return res.json();
    },
    onSuccess: (data) => {
      const lines = data.response
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)
        .map((l: string) => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•]\s*/, ''))
        .filter((l: string) => l.length > 10);
      setPainPoints(lines);
      setLoadingPainPoints(false);
    },
    onError: () => {
      toast.error("Failed to generate pain points");
      setLoadingPainPoints(false);
    },
  });

  const handleValidateIdea = (index: number) => {
    if (validationInsights[index]) return; // Already validated
    setLoadingValidation(index);
    validateIdea.mutate(index);
  };

  const handleChooseIdea = (index: number) => {
    setSelectedIdeaIndex(index);
    setStep('pain');
    setLoadingPainPoints(true);
    generatePainPoints.mutate(index);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const togglePainPoint = (pain: string) => {
    setSelectedPainPoints(prev => {
      if (prev.includes(pain)) {
        return prev.filter(p => p !== pain);
      }
      if (prev.length >= 3) {
        toast.error("Select up to 3 pain points");
        return prev;
      }
      return [...prev, pain];
    });
  };

  const handleAddCustomPain = () => {
    const trimmed = customPainInput.trim();
    if (!trimmed) return;
    if (painPoints.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Already exists");
      return;
    }
    setPainPoints(prev => [...prev, trimmed]);
    setCustomPainInput("");
    setShowCustomInput(false);
  };

  const handleConfirmChoice = () => {
    if (selectedPainPoints.length === 0) {
      toast.error("Select at least 1 pain point");
      return;
    }
    setStep('done');
    const idea = shortlistedIdeas[selectedIdeaIndex!];
    saveProgress.mutate({
      chosenIdea: `${idea.title} - ${idea.desc}`,
      chosenIdeaTitle: idea.title,
      selectedPainPoints,
      validationInsights: validationInsights[selectedIdeaIndex!],
    });
  };

  // No shortlist - need Day 1
  if (!day1Progress?.shortlistedIdeas?.length) {
    return (
      <Card className="p-8 border-2 border-amber-200 bg-amber-50 text-center">
        <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Day 1 First</h3>
        <p className="text-slate-600">
          Generate and shortlist 3-5 ideas in Day 1 before validating them here.
        </p>
      </Card>
    );
  }

  // Done state
  if (step === 'done' && selectedIdeaIndex !== null) {
    const idea = shortlistedIdeas[selectedIdeaIndex];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Chosen Idea</h2>
        <p className="text-slate-500 mb-6">This is the one you're building!</p>

        <Card className="p-6 border-2 border-green-400 bg-green-50 max-w-2xl mx-auto text-left">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{idea.title}</h3>
          <p className="text-slate-600 mb-3">{idea.desc}</p>
          <p className="text-sm text-slate-500 mb-4">Target: {idea.targetCustomer}</p>

          <div className="pt-4 border-t border-green-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Pain Points You're Solving:</p>
            <ul className="space-y-1">
              {selectedPainPoints.map((pain, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 max-w-2xl mx-auto">
          <p className="text-lg font-bold text-blue-900 mb-2">
            "There is NO perfect idea. The perfect idea is the one you BUILD."
          </p>
          <p className="text-blue-700">
            You've made a decision. That puts you ahead of 90% of dreamers.
          </p>
        </div>

        <Button
          size="lg"
          className="mt-8 h-14 px-10 text-lg font-bold gap-2"
          onClick={() => {
            onComplete({
              chosenIdea: `${idea.title} - ${idea.desc}`,
              chosenIdeaTitle: idea.title,
              selectedPainPoints,
              validationInsights: validationInsights[selectedIdeaIndex] || {
                demandScore: 7,
                competitionLevel: "Not validated",
                topRisk: "Unknown",
                verdict: "Proceed",
              },
            });
          }}
        >
          Complete Day 2 <ChevronRight className="w-5 h-5" />
        </Button>
      </motion.div>
    );
  }

  // Pain points selection
  if (step === 'pain' && selectedIdeaIndex !== null) {
    const idea = shortlistedIdeas[selectedIdeaIndex];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="p-5 border-2 border-primary bg-blue-50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-slate-900">{idea.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{idea.desc}</p>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">What Pain Points Will You Solve?</h2>
          <p className="text-slate-500">Select 1-3 pain points to focus on</p>
          <p className="text-sm text-primary font-semibold mt-2">{selectedPainPoints.length}/3 selected</p>
        </div>

        {loadingPainPoints ? (
          <Card className="p-12 text-center border-2 border-slate-200">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Identifying pain points...</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-3">
              {painPoints.map((pain, idx) => {
                const cleanPain = typeof pain === 'string' ? pain.replace(/^["'\[]+|["'\]]+$/g, '').trim() : '';
                if (!cleanPain) return null;
                const isSelected = selectedPainPoints.includes(cleanPain);

                return (
                  <Card
                    key={`pain-${idx}`}
                    className={`p-4 border-2 cursor-pointer ${
                      isSelected ? 'border-primary bg-blue-50' : 'border-slate-200 hover:border-primary'
                    }`}
                    onClick={() => togglePainPoint(cleanPain)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                      <p className="text-slate-700 font-medium">{cleanPain}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Custom pain point */}
            <div className="pt-4 border-t border-slate-200">
              {!showCustomInput ? (
                <Button variant="outline" onClick={() => setShowCustomInput(true)} className="w-full gap-2">
                  <Plus className="w-4 h-4" /> Add Your Own
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a pain point..."
                    value={customPainInput}
                    onChange={(e) => setCustomPainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomPain()}
                    autoFocus
                  />
                  <Button onClick={handleAddCustomPain}><Plus className="w-4 h-4" /></Button>
                  <Button variant="outline" onClick={() => { setShowCustomInput(false); setCustomPainInput(""); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {selectedPainPoints.length > 0 && (
              <Button size="lg" onClick={handleConfirmChoice} className="w-full h-14 text-lg font-bold gap-2">
                Lock In My Choice <ChevronRight className="w-5 h-5" />
              </Button>
            )}

            <Button variant="outline" onClick={() => { setStep('shortlist'); setSelectedIdeaIndex(null); setPainPoints([]); setSelectedPainPoints([]); }}>
              ← Back to Shortlist
            </Button>
          </>
        )}
      </motion.div>
    );
  }

  // Main shortlist view
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Shortlist from Day 1</h2>
        <p className="text-slate-500">
          You selected {shortlistedIdeas.length} ideas. Now validate them and choose ONE to build.
        </p>
      </div>

      <div className="space-y-4">
        {shortlistedIdeas.map((idea, idx) => {
          const insight = validationInsights[idx];
          const isLoading = loadingValidation === idx;

          return (
            <Card key={idx} className="p-5 border-2 border-slate-200">
              <div className="flex flex-col gap-4">
                {/* Idea header */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{idea.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{idea.desc}</p>
                      <p className="text-xs text-slate-400 mt-2">Target: {idea.targetCustomer}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{idea.totalScore}/25</div>
                      <p className="text-xs text-slate-500">Day 1 Score</p>
                    </div>
                  </div>
                </div>

                {/* Validation insights */}
                {insight ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${insight.demandScore >= 7 ? 'text-green-600' : insight.demandScore >= 5 ? 'text-amber-600' : 'text-red-600'}`} />
                      <div className="text-lg font-bold text-slate-900">{insight.demandScore}/10</div>
                      <p className="text-xs text-slate-500">Demand</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <Users className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                      <div className="text-sm font-bold text-slate-900">{insight.competitionLevel.split(' - ')[0]}</div>
                      <p className="text-xs text-slate-500">Competition</p>
                    </div>
                    <div className="col-span-2 p-3 bg-amber-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mb-1" />
                      <p className="text-xs font-medium text-amber-900">{insight.topRisk}</p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleValidateIdea(idx)}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Validating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Get Validation Insights</>
                      )}
                    </Button>
                  </div>
                )}

                {/* Choose button */}
                <div className="pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => handleChooseIdea(idx)}
                    className="w-full gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Choose This Idea
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 border-2 border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-600 text-center">
          <span className="font-semibold">Pro tip:</span> Click "Get Validation Insights" on each idea to compare them, then choose the one that excites you most AND has decent demand.
        </p>
      </Card>
    </div>
  );
}
