import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Check, Sparkles, Loader2, ChevronRight, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface Day2Props {
  onComplete: () => void;
}

const VALIDATION_PROMPTS = [
  {
    id: "market_viability",
    title: "Market Viability Check Prompt",
    prompt: `I'm considering building a SaaS product: "[IDEA_TITLE]" - [IDEA_DESC]

Target customer: [TARGET_CUSTOMER]

Please be BRUTALLY HONEST - I don't want sugar coating. Analyze:
1. Is there proven demand for this type of solution?
2. Are people already paying for similar products?
3. What's the realistic revenue potential?
4. What are the biggest risks?

Give me a viability score out of 10 and tell me if I should proceed.`,
  },
  {
    id: "competitor_analysis",
    title: "Competitor Deep Dive Prompt",
    prompt: `Find me 3-5 competitors for this SaaS idea: "[IDEA_TITLE]" - [IDEA_DESC]

For each competitor, tell me:
1. Company name and website
2. Their pricing model
3. What they do well
4. What they do poorly (opportunity for me)
5. Estimated revenue if you can find it

Remember: Competition is GOOD - it proves there's money in this market!`,
  },
  {
    id: "customer_pain",
    title: "Customer Pain Points Prompt",
    prompt: `My SaaS idea is: "[IDEA_TITLE]" - [IDEA_DESC]
Target customer: [TARGET_CUSTOMER]

Help me understand:
1. What specific pain points does this solve?
2. How painful is this problem (mild annoyance vs hair-on-fire)?
3. What do people currently do to solve this? (competitors, spreadsheets, nothing?)
4. Would they pay monthly for a solution?
5. What would make them switch from their current solution?`,
  },
];

export function Day2IdeaValidator({ onComplete }: Day2Props) {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(null);
  const [aiResponses, setAiResponses] = useState<Record<string, Record<number, string>>>({});
  const [loadingPrompt, setLoadingPrompt] = useState<string | null>(null);
  const [finalChoice, setFinalChoice] = useState<number | null>(null);
  const [step, setStep] = useState<'select' | 'pain' | 'validate'>('select');
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [selectedPainPoint, setSelectedPainPoint] = useState<string | null>(null);
  const [loadingPainPoints, setLoadingPainPoints] = useState(false);

  const saveChosenIdea = useMutation({
    mutationFn: async (chosenIdea: number) => {
      const res = await apiRequest("POST", "/api/progress/day2", { chosenIdea });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const handleSelectFinalIdea = (index: number) => {
    setFinalChoice(index);
    saveChosenIdea.mutate(index);
  };

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

  const generatePainPoints = useMutation({
    mutationFn: async (ideaIndex: number) => {
      const idea = shortlistedIdeas[ideaIndex];
      const prompt = `For this SaaS idea: "${idea.title}" - ${idea.desc}

Target customer: ${idea.targetCustomer}

Generate 3-5 specific, painful problems this idea solves. For each pain point:
- Be specific (not generic)
- Focus on emotional or financial impact
- Make it relatable

Return ONLY the pain points as a numbered list:
1. [Pain point 1]
2. [Pain point 2]
3. [Pain point 3]`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      return res.json();
    },
    onSuccess: (data) => {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(data.response);
        if (Array.isArray(parsed)) {
          setPainPoints(parsed);
          setLoadingPainPoints(false);
          return;
        }
      } catch {
        // Not JSON, parse as text
      }

      // Parse numbered list format
      const lines = data.response
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)
        .map((l: string) => {
          // Remove number prefix like "1. " or "1) "
          return l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•]\s*/, '');
        })
        .filter((l: string) => l.length > 10); // Filter out short junk

      setPainPoints(lines);
      setLoadingPainPoints(false);
    },
    onError: () => {
      toast.error("Failed to generate pain points");
      setLoadingPainPoints(false);
    },
  });

  const runAiPrompt = useMutation({
    mutationFn: async ({ promptId, ideaIndex }: { promptId: string; ideaIndex: number }) => {
      const idea = shortlistedIdeas[ideaIndex];
      const promptTemplate = VALIDATION_PROMPTS.find(p => p.id === promptId)?.prompt || "";
      const filledPrompt = promptTemplate
        .replace(/\[IDEA_TITLE\]/g, idea.title)
        .replace(/\[IDEA_DESC\]/g, idea.desc)
        .replace(/\[TARGET_CUSTOMER\]/g, idea.targetCustomer);
      
      const res = await apiRequest("POST", "/api/ai-prompt", { prompt: filledPrompt });
      return res.json();
    },
    onSuccess: (data, { promptId, ideaIndex }) => {
      setAiResponses(prev => ({
        ...prev,
        [promptId]: {
          ...prev[promptId],
          [ideaIndex]: data.response,
        },
      }));
      setLoadingPrompt(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to run AI analysis");
      setLoadingPrompt(null);
    },
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const getFilledPrompt = (promptTemplate: string, idea: Idea) => {
    return promptTemplate
      .replace(/\[IDEA_TITLE\]/g, idea.title)
      .replace(/\[IDEA_DESC\]/g, idea.desc)
      .replace(/\[TARGET_CUSTOMER\]/g, idea.targetCustomer);
  };

  const handleRunAi = (promptId: string, ideaIndex: number) => {
    setLoadingPrompt(`${promptId}-${ideaIndex}`);
    runAiPrompt.mutate({ promptId, ideaIndex });
  };

  const handleSelectIdea = (idx: number) => {
    setSelectedIdeaIndex(idx);
    setStep('pain');
    setLoadingPainPoints(true);
    generatePainPoints.mutate(idx);
  };

  const handleSelectPainPoint = (pain: string) => {
    setSelectedPainPoint(pain);
    setStep('validate');
  };

  if (!day1Progress?.shortlistedIdeas?.length) {
    return (
      <Card className="p-8 border-2 border-amber-200 bg-amber-50 text-center">
        <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Day 1 First!</h3>
        <p className="text-slate-600">
          You need to generate and shortlist your ideas (3-5) in Day 1 before validating them here.
        </p>
      </Card>
    );
  }

  if (finalChoice !== null) {
    const chosenIdea = shortlistedIdeas[finalChoice];
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
          <h3 className="text-xl font-bold text-slate-900 mb-2">{chosenIdea.title}</h3>
          <p className="text-slate-600 mb-3">{chosenIdea.desc}</p>
          <p className="text-sm text-slate-500">Target: {chosenIdea.targetCustomer}</p>
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 max-w-2xl mx-auto">
          <p className="text-lg font-bold text-blue-900 mb-2">
            "Progress beats perfection. Every. Single. Time."
          </p>
          <p className="text-blue-700">
            You've made a decision. That puts you ahead of 90% of people who never start.
          </p>
        </div>

        <Button 
          size="lg" 
          className="mt-8 h-14 px-10 text-lg font-bold gap-2"
          onClick={onComplete}
          data-testid="button-complete-day2"
        >
          Complete Day 2 <ChevronRight className="w-5 h-5" />
        </Button>
      </motion.div>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-8">
      {/* Step 1: Select Idea */}
      {step === 'select' && (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Pick Your Idea</h2>
            <p className="text-slate-500">
              Select one idea to discover its core pain point
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shortlistedIdeas.map((idea, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSelectIdea(idx)}
                    className="p-4 rounded-xl border-2 text-left transition-all cursor-pointer border-slate-200 hover:border-primary hover:bg-blue-50"
                    data-testid={`select-idea-${idx}`}
                  >
                    <p className="font-bold text-sm text-slate-900 leading-snug">{idea.title}</p>
                    <p className="text-xs text-slate-500 mt-2">Score: {idea.totalScore}/25</p>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold mb-1">{idea.title}</p>
                  <p className="text-xs text-slate-300 mb-2">{idea.desc}</p>
                  <p className="text-xs text-slate-400">Target: {idea.targetCustomer}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Pain Point Discovery */}
      {step === 'pain' && selectedIdeaIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-5 border-2 border-primary/30 bg-blue-50/50">
            <h3 className="font-bold text-lg text-slate-900">{shortlistedIdeas[selectedIdeaIndex].title}</h3>
            <p className="text-slate-600 mt-1">{shortlistedIdeas[selectedIdeaIndex].desc}</p>
          </Card>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">What Pain Does This Solve?</h2>
            <p className="text-slate-500">
              Pick the ONE pain point that resonates most
            </p>
          </div>

          {loadingPainPoints ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-slate-600">Discovering pain points...</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {painPoints.map((pain, idx) => {
                // Clean up any JSON artifacts, quotes, brackets
                const cleanPain = pain
                  .replace(/^["'\[]+|["'\]]+$/g, '') // Remove leading/trailing quotes and brackets
                  .replace(/\\"/g, '"') // Unescape quotes
                  .trim();

                return (
                  <Card
                    key={idx}
                    className="p-5 border-2 border-slate-200 hover:border-primary hover:bg-blue-50/50 cursor-pointer transition-all"
                    onClick={() => handleSelectPainPoint(cleanPain)}
                  >
                    <p className="text-slate-700 font-medium">{cleanPain}</p>
                  </Card>
                );
              })}
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setStep('select');
              setSelectedIdeaIndex(null);
              setPainPoints([]);
            }}
          >
            ← Back to Ideas
          </Button>
        </motion.div>
      )}

      {/* Step 3: Validation */}
      {step === 'validate' && selectedIdeaIndex !== null && (
        <>
          <Card className="p-5 border-2 border-green-300 bg-green-50">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900">{shortlistedIdeas[selectedIdeaIndex].title}</h3>
                <p className="text-sm text-slate-600 mt-1">Pain: {selectedPainPoint}</p>
              </div>
            </div>
          </Card>

          <div className="text-center mt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Validate This Idea</h2>
            <p className="text-slate-500">
              Use these prompts to research the market. Then lock in your choice!
            </p>
          </div>

          {/* Validation Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                <strong>How to use these prompts:</strong> Copy the prompt below and paste it into ChatGPT, Claude, or any AI assistant. Or click "Use Our AI" to get an instant response here.
              </p>
            </div>
            {VALIDATION_PROMPTS.map((prompt) => {
              const filledPrompt = getFilledPrompt(prompt.prompt, shortlistedIdeas[selectedIdeaIndex]);
              const aiResponse = aiResponses[prompt.id]?.[selectedIdeaIndex];
              const isLoading = loadingPrompt === `${prompt.id}-${selectedIdeaIndex}`;

              return (
                <Card key={prompt.id} className="p-5 border-2 border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-3">{prompt.title}</h4>
                  
                  <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700 whitespace-pre-wrap mb-4">
                    {filledPrompt}
                  </div>

                  <div className="flex gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => copyToClipboard(filledPrompt, `${prompt.id}-${selectedIdeaIndex}`)}
                          data-testid={`copy-prompt-${prompt.id}`}
                        >
                          {copiedId === `${prompt.id}-${selectedIdeaIndex}` ? (
                            <><Check className="w-4 h-4" /> Copied!</>
                          ) : (
                            <><Copy className="w-4 h-4" /> Copy Prompt</>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy this prompt to paste into ChatGPT or Claude</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="gap-2"
                          onClick={() => handleRunAi(prompt.id, selectedIdeaIndex)}
                          disabled={isLoading}
                          data-testid={`run-ai-${prompt.id}`}
                        >
                          {isLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Use Our AI</>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Get an instant AI analysis right here</TooltipContent>
                    </Tooltip>
                  </div>

                  {aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                    >
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">AI Response</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{aiResponse}</p>
                    </motion.div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Final Choice Section */}
          <Card className="p-6 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Decide?</h3>
              <p className="text-slate-600 mb-4">
                Done your research? Trust your gut and pick this one!
              </p>
              <p className="text-sm text-amber-700 font-semibold mb-4">
                "There is NO perfect idea. The perfect idea is the one you actually BUILD."
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={() => handleSelectFinalIdea(selectedIdeaIndex!)}
                    data-testid="button-choose-idea"
                  >
                    <Trophy className="w-5 h-5" />
                    Choose "{shortlistedIdeas[selectedIdeaIndex].title}"
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lock in this idea and move to Day 3</TooltipContent>
              </Tooltip>
            </div>
          </Card>

          <Button
            variant="outline"
            onClick={() => {
              setStep('pain');
              setSelectedPainPoint(null);
            }}
          >
            ← Change Pain Point
          </Button>
        </motion.div>
        </>
      )}
    </div>
    </TooltipProvider>
  );
}
