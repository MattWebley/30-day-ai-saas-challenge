import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Sparkles, Loader2, ChevronRight, Trophy, Flame, Plus, X, CheckCircle2 } from "lucide-react";
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
    title: "Market Viability Check",
    prompt: `"[IDEA_TITLE]" - [IDEA_DESC]
Target: [TARGET_CUSTOMER]

Be honest but constructive. Most SaaS ideas are viable with the right execution - only give scores below 7/10 if there are fundamental deal-breakers (no demand, massive regulation, impossible to build, etc).

Answer in 4 short lines:

**DEMAND**: Are people already paying for this? (Yes/No + 1 sentence why)
**MARKET SIZE**: Small niche / Mid-market / Massive opportunity?
**TOP RISK**: The #1 thing that could kill this
**VERDICT**: Score /10 (7-10 unless fundamental issues) + Proceed or Pivot?

Maximum 4 sentences total.`,
  },
  {
    id: "competitor_analysis",
    title: "Competitor Analysis",
    prompt: `Find 3-5 direct competitors for: "[IDEA_TITLE]" - [IDEA_DESC]

For EACH competitor, be brief:
• **Name** + Website
• **Pricing**: What they charge
• **Strengths**: What they do well (1-2 points)
• **Weaknesses**: Gaps you could exploit (1-2 points)

End with: **KEY TAKEAWAY** - What does this competition tell you about market demand?

No fluff. Bullet points only.`,
  },
];

export function Day2IdeaValidator({ onComplete }: Day2Props) {
  const queryClient = useQueryClient();
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(null);
  const [aiResponses, setAiResponses] = useState<Record<string, Record<number, string>>>({});
  const [loadingPrompt, setLoadingPrompt] = useState<string | null>(null);
  const [finalChoice, setFinalChoice] = useState<number | null>(null);
  const [step, setStep] = useState<'select' | 'pain' | 'validate'>('select');
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [loadingPainPoints, setLoadingPainPoints] = useState(false);
  const [customPainInput, setCustomPainInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const prompt = `You are a pain point expert. Analyze this SaaS idea and identify the MOST PROMINENT pain points it solves.

SaaS Idea: "${idea.title}" - ${idea.desc}
Target Customer: ${idea.targetCustomer}

TASK: Generate 7-10 pain points, ranked by prominence and severity.

CRITICAL RULES:
1. Use your knowledge of this specific niche/industry to identify REAL pains
2. Don't be random - think about what ACTUALLY hurts in this space
3. Rank them by how painful/costly they are (most painful first)
4. Each pain must be CONCISE (5-12 words max)
5. Focus on the core problem, NOT specific metrics or percentages

WHAT MAKES A GOOD PAIN POINT:
✓ "Spending excessive time manually entering invoices"
✓ "Losing revenue from poor follow-up tracking"
✓ "Missing compliance deadlines and facing penalties"
✓ "Struggling to track customer interactions across teams"
✓ "Wasting time on repetitive administrative tasks"

BAD EXAMPLES:
✗ "It's hard to manage things" (too vague)
✗ "Customers are frustrated" (not specific enough)
✗ "Inefficient processes" (generic)
✗ "Losing 25% of leads" (too specific with metrics)
✗ "Spending 10+ hours per week" (avoid exact numbers)

Return ONLY a numbered list, most painful first:
1. [Most painful problem]
2. [Second most painful]
...
7-10. [Still painful but less critical]`;

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

  const handleRunAi = (promptId: string, ideaIndex: number) => {
    setLoadingPrompt(`${promptId}-${ideaIndex}`);
    runAiPrompt.mutate({ promptId, ideaIndex });
  };

  const handleSelectIdea = (idx: number) => {
    setSelectedIdeaIndex(idx);
    setStep('pain');
    setLoadingPainPoints(true);
    generatePainPoints.mutate(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePainPoint = (pain: string) => {
    setSelectedPainPoints(prev => {
      if (prev.includes(pain)) {
        return prev.filter(p => p !== pain);
      }
      if (prev.length >= 3) {
        toast.error("You can select up to 3 pain points");
        return prev;
      }
      return [...prev, pain];
    });
  };

  const handleAddCustomPain = () => {
    const trimmedInput = customPainInput.trim();
    if (!trimmedInput) {
      toast.error("Please enter a pain point");
      return;
    }

    // Check if already exists (case-insensitive)
    const exists = painPoints.some(p =>
      p.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (exists) {
      toast.error("This pain point already exists");
      return;
    }

    setPainPoints(prev => [...prev, trimmedInput]);
    setCustomPainInput("");
    setShowCustomInput(false);
    toast.success("Custom pain point added!");
  };

  const handleContinueWithPainPoints = () => {
    if (selectedPainPoints.length === 0) {
      toast.error("Please select at least 1 pain point");
      return;
    }
    setStep('validate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    className="p-4 rounded-xl border-2 text-left cursor-pointer border-slate-200 hover:border-primary hover:bg-blue-50"
                    data-testid={`select-idea-${idx}`}
                  >
                    <p className="font-bold text-sm text-slate-900 leading-snug">{idea.title}</p>
                    <p className="text-xs text-slate-500 mt-2">Score: {idea.totalScore}/25</p>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-slate-900">
                  <p className="font-semibold mb-1 text-white">{idea.title}</p>
                  <p className="text-xs text-slate-100 mb-2">{idea.desc}</p>
                  <p className="text-xs text-slate-200">Target: {idea.targetCustomer}</p>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">What Pains Does This Solve?</h2>
            <p className="text-slate-500">
              Select up to 3 pain points that resonate most with you
            </p>
            <p className="text-sm text-primary font-semibold mt-2">
              {selectedPainPoints.length}/3 selected
            </p>
          </div>

          {loadingPainPoints ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-slate-600">AI is analyzing the most prominent pain points in this niche...</p>
            </Card>
          ) : (
            <>
              <div className="grid gap-3">
                {painPoints.map((pain, idx) => {
                  // Clean up any JSON artifacts, quotes, brackets (for AI-generated content)
                  // Custom pain points won't need this cleaning
                  const cleanPain = typeof pain === 'string' ? pain
                    .replace(/^["'\[]+|["'\]]+$/g, '') // Remove leading/trailing quotes and brackets
                    .replace(/\\"/g, '"') // Unescape quotes
                    .trim() : '';

                  if (!cleanPain) return null; // Skip empty pain points

                  const isSelected = selectedPainPoints.includes(cleanPain);

                  // Randomly assign fire ratings to suggest strong options (not always in order)
                  const fireRating =
                    (idx === 0 || idx === 2) ? 3 : // High impact
                    (idx === 1 || idx === 4) ? 2 : // Medium-high impact
                    (idx === 3) ? 1 : // Notable
                    0; // No indicator

                  return (
                    <Card
                      key={`pain-${idx}-${cleanPain.slice(0, 20)}`}
                      className={`p-5 border-2 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-blue-50'
                          : 'border-slate-200 hover:border-primary hover:bg-blue-50/50'
                      }`}
                      onClick={() => togglePainPoint(cleanPain)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-400 font-bold">#{idx + 1}</span>
                            {fireRating > 0 && (
                              <div className="inline-flex items-center gap-0.5">
                                {Array.from({ length: fireRating }).map((_, i) => (
                                  <Flame key={i} className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-slate-700 font-medium">{cleanPain}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Add Custom Pain Point */}
              <div className="border-t border-slate-200 pt-4">
                {!showCustomInput ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your Own Pain Point
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter a custom pain point..."
                        value={customPainInput}
                        onChange={(e) => setCustomPainInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCustomPain();
                          }
                          if (e.key === 'Escape') {
                            setShowCustomInput(false);
                            setCustomPainInput("");
                          }
                        }}
                        autoFocus
                        className="flex-1"
                      />
                      <Button onClick={handleAddCustomPain} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomPainInput("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Press Enter to add, Escape to cancel
                    </p>
                  </div>
                )}
              </div>

              {selectedPainPoints.length > 0 && (
                <Button
                  size="lg"
                  onClick={handleContinueWithPainPoints}
                  className="w-full h-14 text-lg font-bold gap-2"
                >
                  Continue with {selectedPainPoints.length} pain point{selectedPainPoints.length > 1 ? 's' : ''} <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setStep('select');
              setSelectedIdeaIndex(null);
              setPainPoints([]);
              setSelectedPainPoints([]);
              setShowCustomInput(false);
              setCustomPainInput("");
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
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2">{shortlistedIdeas[selectedIdeaIndex].title}</h3>
                <p className="text-xs font-semibold text-green-700 mb-2">Selected Pain Points:</p>
                <ul className="space-y-1">
                  {selectedPainPoints.map((pain, idx) => (
                    <li key={`selected-${idx}-${pain.slice(0, 20)}`} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <div className="text-center mt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Validate This Idea</h2>
            <p className="text-slate-500">
              Run AI-powered market analysis to validate your idea. Then lock in your choice!
            </p>
          </div>

          {/* Validation Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <p className="font-bold text-blue-900">Quick AI Validation</p>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                Get instant AI-powered insights to guide your research. Note: AI can miss important details or make assumptions.
              </p>
              <p className="text-xs text-blue-600 font-semibold">
                ⚠️ Always validate with real people before building!
              </p>
            </div>

            {/* Manual Validation (Better) */}
            <Card className="p-5 border-2 border-green-200 bg-green-50">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Better: Manual Validation Methods
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-green-900 mb-1">1. Talk to 5-10 potential customers</p>
                  <p className="text-green-700">Ask about their current solution and pain points. Do they match yours?</p>
                </div>
                <div>
                  <p className="font-semibold text-green-900 mb-1">2. Search online communities</p>
                  <p className="text-green-700">Check Reddit, Facebook groups, forums - are people complaining about this problem?</p>
                </div>
                <div>
                  <p className="font-semibold text-green-900 mb-1">3. Find existing competitors</p>
                  <p className="text-green-700">If 3+ companies are solving this, there's proven demand. Study their pricing and reviews.</p>
                </div>
                <div>
                  <p className="font-semibold text-green-900 mb-1">4. Gauge willingness to pay</p>
                  <p className="text-green-700">Ask: "Would you pay $X/month for this?" Real money talk = real validation.</p>
                </div>
              </div>
            </Card>
            {VALIDATION_PROMPTS.map((prompt) => {
              const aiResponse = aiResponses[prompt.id]?.[selectedIdeaIndex];
              const isLoading = loadingPrompt === `${prompt.id}-${selectedIdeaIndex}`;

              return (
                <Card key={prompt.id} className="p-5 border-2 border-slate-100 hover:border-primary/50">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{prompt.title}</h4>
                      <p className="text-xs text-slate-500">Click to run instant AI analysis</p>
                    </div>
                    <Button
                      className="gap-2 flex-shrink-0"
                      onClick={() => handleRunAi(prompt.id, selectedIdeaIndex)}
                      disabled={isLoading}
                      data-testid={`run-ai-${prompt.id}`}
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                      ) : aiResponse ? (
                        <><Check className="w-4 h-4" /> Re-run</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Run Analysis</>
                      )}
                    </Button>
                  </div>

                  {aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200"
                    >
                      {aiResponse.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;

                        // Helper function to render text with clickable URLs
                        const renderWithLinks = (text: string) => {
                          // More precise URL regex that excludes trailing punctuation
                          const urlRegex = /(https?:\/\/[^\s<>",\)]+[^\s<>",\.\)!?:;])/g;
                          const parts = text.split(urlRegex);

                          return parts.map((part, i) => {
                            if (part.match(urlRegex)) {
                              // Clean the URL and ensure it's valid
                              const cleanUrl = part.trim();
                              return (
                                <a
                                  key={i}
                                  href={cleanUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    // Extra safeguard to ensure new tab opens
                                    e.preventDefault();
                                    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
                                  }}
                                  className="text-blue-600 hover:text-blue-800 underline font-medium break-all cursor-pointer"
                                >
                                  {cleanUrl}
                                </a>
                              );
                            }
                            return <span key={i}>{part}</span>;
                          });
                        };

                        // Check if line starts with bold markdown (**TEXT**)
                        const boldMatch = trimmedLine.match(/^\*\*(.*?)\*\*:?\s*(.*)$/);
                        if (boldMatch) {
                          return (
                            <div key={idx} className="mb-3 last:mb-0">
                              <div className="flex items-start gap-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[110px] pt-0.5">
                                  {boldMatch[1]}
                                </span>
                                <span className="text-slate-900 font-medium flex-1 leading-relaxed">
                                  {renderWithLinks(boldMatch[2])}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Check if it's a bullet point
                        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                          return (
                            <div key={idx} className="flex gap-2 ml-28 mb-1.5">
                              <span className="text-slate-400 mt-1.5">•</span>
                              <span className="text-slate-700 leading-relaxed">
                                {renderWithLinks(trimmedLine.substring(1).trim())}
                              </span>
                            </div>
                          );
                        }

                        // Regular text
                        return (
                          <p key={idx} className="text-slate-700 mb-2 leading-relaxed">
                            {renderWithLinks(trimmedLine)}
                          </p>
                        );
                      })}
                    </motion.div>
                  )}
                </Card>
              );
            })}

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
                setSelectedPainPoints([]);
              }}
            >
              ← Change Pain Points
            </Button>
          </motion.div>
        </>
      )}
    </div>
    </TooltipProvider>
  );
}
