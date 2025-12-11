import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Check, Sparkles, Loader2, ChevronRight, Trophy } from "lucide-react";
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

interface Day2Props {
  onComplete: () => void;
}

const VALIDATION_PROMPTS = [
  {
    id: "market_viability",
    title: "Market Viability Check",
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
    title: "Competitor Deep Dive",
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
    title: "Customer Pain Points",
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

  if (!day1Progress?.shortlistedIdeas?.length) {
    return (
      <Card className="p-8 border-2 border-amber-200 bg-amber-50 text-center">
        <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Day 1 First!</h3>
        <p className="text-slate-600">
          You need to generate and shortlist your 5 ideas in Day 1 before validating them here.
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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Validate Your Top 5 Ideas</h2>
        <p className="text-slate-500">
          Use these prompts to research each idea. Then pick ONE to move forward with.
        </p>
        <p className="text-sm text-amber-600 font-semibold mt-2">
          Remember: Progress beats procrastination. Pick one and GO!
        </p>
      </div>

      {/* Idea Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shortlistedIdeas.map((idea, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIdeaIndex(idx)}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              selectedIdeaIndex === idx
                ? "border-primary bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
            data-testid={`select-idea-${idx}`}
          >
            <p className="font-bold text-sm text-slate-900 leading-snug">{idea.title}</p>
            <p className="text-xs text-slate-500 mt-2">Score: {idea.totalScore}/25</p>
          </button>
        ))}
      </div>

      {selectedIdeaIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-5 border-2 border-primary/30 bg-blue-50/50">
            <h3 className="font-bold text-lg text-slate-900">{shortlistedIdeas[selectedIdeaIndex].title}</h3>
            <p className="text-slate-600 mt-1">{shortlistedIdeas[selectedIdeaIndex].desc}</p>
            <p className="text-sm text-slate-500 mt-2">Target: {shortlistedIdeas[selectedIdeaIndex].targetCustomer}</p>
          </Card>

          {/* Validation Prompts */}
          <div className="space-y-6">
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
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={() => handleSelectFinalIdea(selectedIdeaIndex!)}
                data-testid="button-choose-idea"
              >
                <Trophy className="w-5 h-5" />
                Choose "{shortlistedIdeas[selectedIdeaIndex].title}"
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {selectedIdeaIndex === null && (
        <div className="text-center py-8 text-slate-400">
          Select an idea above to start validating it
        </div>
      )}
    </div>
  );
}
