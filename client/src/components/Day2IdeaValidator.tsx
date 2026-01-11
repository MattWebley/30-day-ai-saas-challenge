import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Loader2, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ds } from "@/lib/design-system";

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
      <div className={`${ds.cardWithPadding} text-center`}>
        <h3 className={`${ds.titleLg} mb-2`}>Complete Day 1 First</h3>
        <p className={ds.text}>
          Generate and shortlist 3-5 ideas in Day 1 before validating them here.
        </p>
      </div>
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
        <h2 className={`${ds.titleXl} mb-2`}>Your Chosen Idea</h2>
        <p className={`${ds.textMuted} mb-6`}>This is the one you're building!</p>

        <div className={`${ds.cardWithPadding} max-w-2xl mx-auto text-left`}>
          <h3 className={`${ds.titleLg} mb-2`}>{idea.title}</h3>
          <p className={`${ds.text} mb-3`}>{idea.desc}</p>
          <p className={`${ds.textMuted} mb-4`}>Target: {idea.targetCustomer}</p>

          <div className="pt-4 border-t border-slate-200">
            <p className={`${ds.label} uppercase mb-2`}>Pain Points You're Solving:</p>
            <ul className="space-y-1">
              {selectedPainPoints.map((pain, i) => (
                <li key={i} className={`${ds.textMuted} flex items-start gap-2`}>
                  <span className={ds.successText}>•</span>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`mt-8 ${ds.infoBoxHighlight} max-w-2xl mx-auto`}>
          <p className={`${ds.titleLg} mb-2`}>
            "There is NO perfect idea. The perfect idea is the one you BUILD."
          </p>
          <p className={ds.text}>
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
        className={ds.section}
      >
        <div className={ds.optionSelected}>
          <div>
            <h3 className={ds.title}>{idea.title}</h3>
            <p className={`${ds.textMuted} mt-1`}>{idea.desc}</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className={`${ds.titleXl} mb-2`}>What Pain Points Will You Solve?</h2>
          <p className={ds.textMuted}>Select 1-3 pain points to focus on</p>
          <p className={`${ds.label} mt-2`}>{selectedPainPoints.length}/3 selected</p>
        </div>

        {loadingPainPoints ? (
          <div className={`${ds.cardWithPadding} p-12 text-center`}>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className={ds.text}>Identifying pain points...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {painPoints.map((pain, idx) => {
                const cleanPain = typeof pain === 'string' ? pain.replace(/^["'\[]+|["'\]]+$/g, '').trim() : '';
                if (!cleanPain) return null;
                const isSelected = selectedPainPoints.includes(cleanPain);

                return (
                  <div
                    key={`pain-${idx}`}
                    className={isSelected ? ds.optionSelected : ds.optionDefault}
                    onClick={() => togglePainPoint(cleanPain)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={isSelected ? ds.checkSelected : ds.checkDefault}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p className={ds.text}>{cleanPain}</p>
                    </div>
                  </div>
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
    <div className={ds.section}>
      <div className="text-center">
        <h2 className={`${ds.titleXl} mb-2`}>Your Shortlist from Day 1</h2>
        <p className={ds.textMuted}>
          You selected {shortlistedIdeas.length} ideas. Now validate them and choose ONE to build.
        </p>
      </div>

      {/* Action over perfection message */}
      <div className={ds.infoBoxHighlight}>
        <p className={`${ds.text} text-center`}>
          <span className="font-bold text-slate-900">Remember:</span> Choosing an imperfect idea and TAKING ACTION beats endlessly second-guessing yourself. There is no perfect idea - only the one you actually build.
        </p>
      </div>

      <div className="space-y-4">
        {shortlistedIdeas.map((idea, idx) => {
          const insight = validationInsights[idx];
          const isLoading = loadingValidation === idx;

          return (
            <div key={idx} className={ds.cardWithPadding}>
              <div className="flex flex-col gap-4">
                {/* Idea header */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={ds.titleLg}>{idea.title}</h3>
                      <p className={`${ds.textMuted} mt-1`}>{idea.desc}</p>
                      <p className={`${ds.textMuted} mt-2`}>Target: {idea.targetCustomer}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{idea.totalScore}/25</div>
                      <p className={ds.textMuted}>Day 1 Score</p>
                    </div>
                  </div>
                </div>

                {/* Validation insights */}
                {insight ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                    <div className={`${ds.infoBoxHighlight} text-center`}>
                      <div className={ds.titleLg}>{insight.demandScore}/10</div>
                      <p className={ds.textMuted}>Demand</p>
                    </div>
                    <div className={`${ds.infoBoxHighlight} text-center`}>
                      <div className={ds.title}>{insight.competitionLevel.split(' - ')[0]}</div>
                      <p className={ds.textMuted}>Competition</p>
                    </div>
                    <div className={`col-span-2 ${ds.infoBoxHighlight}`}>
                      <p className={`${ds.textMuted} mb-1`}>Top Risk</p>
                      <p className={`${ds.label}`}>{insight.topRisk}</p>
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
                        <>Get Validation Insights</>
                      )}
                    </Button>
                  </div>
                )}

                {/* Choose button */}
                <div className="pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => handleChooseIdea(idx)}
                    className="w-full"
                  >
                    Choose This Idea
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={ds.infoBox}>
        <p className={`${ds.textMuted} text-center`}>
          <span className="font-semibold text-slate-700">Pro tip:</span> Click "Get Validation Insights" on each idea to compare them, then choose the one that excites you most AND has decent demand.
        </p>
      </div>

      {/* Stuck? Book a call */}
      <div className={ds.cardWithPadding}>
        <div className="text-center space-y-3">
          <h3 className={ds.title}>Stuck? Can't Decide?</h3>
          <p className={ds.textMuted}>
            Sometimes you just need a fresh perspective. Book a 30-minute 1:1 call with Matt to talk through your ideas and get unstuck.
          </p>
          <Button
            variant="outline"
            className="border-2"
            disabled
          >
            Book a Call - Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
