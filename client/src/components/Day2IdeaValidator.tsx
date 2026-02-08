import { useState, useEffect, useRef } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, ChevronLeft, Loader2, ChevronRight, Pencil, Plus, X, Search, ExternalLink, Copy } from "lucide-react";
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
  marketSize: string;
  competitionLevel: string;
  differentiationPotential: string;
  revenueClarity: string;
  timeToFirstCustomer: string;
  moatPotential: string;
  topRisk: string;
  firstCustomersStrategy: string;
  verdict: string;
}

interface Competitor {
  name: string;
  url: string;
  notes: string;
}

interface Day2Props {
  onComplete: (data: {
    chosenIdea: string;
    chosenIdeaTitle: string;
    selectedIdeaIndex: number | null;
    selectedPainPoints: string[];
    competitors: Competitor[];
    validationInsights: ValidationInsight;
    iHelpStatement: string;
  }) => void;
  savedInputs?: Record<string, any>;
}

export function Day2IdeaValidator({ onComplete, savedInputs }: Day2Props) {
  const queryClient = useQueryClient();
  const [step, setStep, containerRef] = useStepWithScroll<'shortlist' | 'competitors' | 'pain' | 'done'>(savedInputs ? 'done' : 'shortlist');
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(savedInputs?.selectedIdeaIndex ?? null);
  const [validationInsights, setValidationInsights] = useState<Record<number, ValidationInsight>>(savedInputs?.validationInsights || {});
  const [loadingValidation, setLoadingValidation] = useState<number | null>(null);
  const [painPoints, setPainPoints] = useState<string[]>(savedInputs?.selectedPainPoints || []);
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>(savedInputs?.selectedPainPoints || []);
  const [loadingPainPoints, setLoadingPainPoints] = useState(false);
  const [customPainInput, setCustomPainInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Competitor research state
  const [competitors, setCompetitors] = useState<Competitor[]>(savedInputs?.competitors || []);
  const [newCompetitor, setNewCompetitor] = useState({ name: '', url: '', notes: '' });
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);

  // I Help statement
  const [iHelpStatement, setIHelpStatement] = useState(savedInputs?.iHelpStatement || "");

  // AI usage limits (silent until close to limit)
  const [painPointAttempts, setPainPointAttempts] = useState(0);
  const [competitorAttempts, setCompetitorAttempts] = useState(0);
  const MAX_PAIN_ATTEMPTS = 5;
  const MAX_COMPETITOR_ATTEMPTS = 3;

  const { data: day1Progress } = useQuery({
    queryKey: ["/api/progress/1"],
    queryFn: async () => {
      const res = await fetch("/api/progress", { credentials: "include" });
      const all = await res.json();
      return all.find((p: any) => p.day === 1);
    },
  });

  // Load Day 2 progress (for restoring iHelpStatement)
  const { data: day2Progress } = useQuery({
    queryKey: ["/api/progress/2"],
    queryFn: async () => {
      const res = await fetch("/api/progress", { credentials: "include" });
      const all = await res.json();
      return all.find((p: any) => p.day === 2);
    },
  });

  // Restore iHelpStatement from saved progress
  const initializedRef = useRef(false);
  useEffect(() => {
    const savedStatement = (day2Progress?.userInputs as any)?.iHelpStatement;
    if (savedStatement && !initializedRef.current) {
      setIHelpStatement(savedStatement);
      initializedRef.current = true;
    }
  }, [day2Progress]);

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

  // Auto-save iHelpStatement with debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUserTypedRef = useRef(false);
  useEffect(() => {
    // Don't auto-save empty values or before user has typed
    if (!iHelpStatement.trim() || !hasUserTypedRef.current) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress.mutate({ iHelpStatement: iHelpStatement.trim() });
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [iHelpStatement]);

  // Validate a single idea - encouraging analysis focused on potential
  const validateIdea = useMutation({
    mutationFn: async (ideaIndex: number) => {
      console.log("[Day2 Mutation] Starting mutation for ideaIndex:", ideaIndex);
      const idea = shortlistedIdeas[ideaIndex];
      console.log("[Day2 Mutation] Found idea:", idea?.title || "NOT FOUND");
      const prompt = `You are an encouraging SaaS coach helping a first-time builder validate their idea. Your job is to help them see the POTENTIAL and give them confidence to move forward. Focus on what's GOOD about the idea and how they can succeed.

IDEA: "${idea.title}"
DESCRIPTION: ${idea.desc}
TARGET CUSTOMER: ${idea.targetCustomer}

Be encouraging and focus on the positives. Every idea has potential - help them see it. Respond in EXACTLY this JSON format (no other text):
{
  "demandScore": [7-10 number - assume demand exists unless obviously not],
  "marketSize": "[who would pay for this and why there are plenty of them]",
  "competitionLevel": "[Competition means there's money here! Frame positively] - [mention any competitors as validation of demand]",
  "differentiationPotential": "[what makes THIS version special or how they can stand out]",
  "revenueClarity": "[how this makes money - be specific about pricing potential]",
  "timeToFirstCustomer": "[encouraging estimate] - [why finding customers is achievable]",
  "moatPotential": "[what could make this defensible as they grow]",
  "topRisk": "[one thing to watch out for, framed constructively as something to plan for]",
  "firstCustomersStrategy": "[One specific, actionable, encouraging way to find the first 10 paying customers]",
  "verdict": "Proceed - [encouraging reason why this idea has legs]"
}`;

      console.log("[Day2 Mutation] Sending request to /api/ai-prompt");
      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      console.log("[Day2 Mutation] Got response, parsing JSON...");
      const data = await res.json();
      console.log("[Day2 Mutation] Response data:", data);
      return data;
    },
    onSuccess: (data, ideaIndex) => {
      console.log("[Day2 Mutation] onSuccess called with data:", data);
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
            marketSize: "Unknown - AI response parsing failed",
            competitionLevel: "Unknown - try again",
            differentiationPotential: "Unknown",
            revenueClarity: "Unknown",
            timeToFirstCustomer: "Unknown",
            moatPotential: "Unable to analyze",
            topRisk: "Unable to analyze - try again",
            firstCustomersStrategy: "Unable to analyze",
            verdict: "Needs Research - analysis failed",
          },
        }));
      }
      setLoadingValidation(null);
    },
    onError: (error: any) => {
      console.error("Validation error:", error);
      // Try to extract the error message from the response
      const message = error?.message || "Failed to validate idea";
      if (message.includes("429")) {
        toast.error("Rate limit reached. Please wait a few minutes and try again.");
      } else if (message.includes("401")) {
        toast.error("AI service not configured. Please contact support.");
      } else {
        toast.error(message.includes(":") ? message.split(":").slice(1).join(":").trim() : message);
      }
      setLoadingValidation(null);
    },
  });

  // Generate pain points for selected idea
  const generatePainPoints = useMutation({
    mutationFn: async (ideaIndex: number) => {
      const idea = shortlistedIdeas[ideaIndex];
      const prompt = `What problems does "${idea.title}" solve for ${idea.targetCustomer}?

Product: ${idea.title}
Description: ${idea.desc}
Target customer: ${idea.targetCustomer}

List 8 GENERAL pain points this product addresses. Keep them:
- SHORT (under 10 words each)
- GENERAL (apply to many people, not hyper-specific scenarios)
- PROBLEM-FOCUSED (what's broken, not the solution)

Good examples:
- Wasting time on repetitive tasks
- Missing deadlines due to poor organization
- Losing track of customer conversations
- Struggling to create professional content

Bad examples (too specific):
- "I spend 3 hours every Tuesday reformatting the same report for my boss Steve"
- "My colleague Janet always asks me where the files are"

Format: One pain point per line, numbered 1-8. No explanations, just the pain point.`;

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
      setPainPointAttempts(prev => prev + 1);
    },
    onError: () => {
      toast.error("Failed to generate pain points");
      setLoadingPainPoints(false);
    },
  });

  // Find competitors with AI
  const findCompetitors = useMutation({
    mutationFn: async (ideaIndex: number) => {
      const idea = shortlistedIdeas[ideaIndex];
      const res = await apiRequest("POST", "/api/research-competitors", {
        ideaTitle: idea.title,
        ideaDescription: idea.desc,
        targetCustomer: idea.targetCustomer,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const aiCompetitors = (data.competitors || []).map((comp: any) => ({
        name: comp.name,
        url: comp.url || '',
        notes: comp.description || '',
      }));
      setCompetitors(aiCompetitors);
      setLoadingCompetitors(false);
      setCompetitorAttempts(prev => prev + 1);
      toast.success(`Found ${aiCompetitors.length} competitors`);
    },
    onError: () => {
      toast.error("Failed to find competitors. Try adding them manually.");
      setLoadingCompetitors(false);
      setShowManualAdd(true);
    },
  });

  const handleFindCompetitors = () => {
    if (selectedIdeaIndex === null) return;
    if (competitorAttempts >= MAX_COMPETITOR_ATTEMPTS) {
      toast.error("Search limit reached. Please add competitors manually.");
      setShowManualAdd(true);
      return;
    }
    setLoadingCompetitors(true);
    findCompetitors.mutate(selectedIdeaIndex);
  };

  const handleValidateIdea = (index: number) => {
    console.log("[Day2] handleValidateIdea called with index:", index);
    console.log("[Day2] shortlistedIdeas:", shortlistedIdeas);
    console.log("[Day2] validationInsights:", validationInsights);

    if (validationInsights[index]) {
      console.log("[Day2] Already validated, returning early");
      return;
    }

    const idea = shortlistedIdeas[index];
    if (!idea) {
      console.error("[Day2] No idea found at index:", index);
      toast.error("Could not find idea to validate. Please refresh the page.");
      return;
    }

    console.log("[Day2] Starting validation for idea:", idea.title);
    setLoadingValidation(index);
    validateIdea.mutate(index);
  };

  const handleChooseIdea = (index: number) => {
    setSelectedIdeaIndex(index);
    setStep('competitors');
    setCompetitors([]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCompetitorsDone = () => {
    if (selectedIdeaIndex === null) return;
    setStep('pain');
    setLoadingPainPoints(true);
    generatePainPoints.mutate(selectedIdeaIndex);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const addCompetitor = () => {
    if (!newCompetitor.name.trim()) {
      toast.error("Enter a competitor name");
      return;
    }
    setCompetitors([...competitors, { ...newCompetitor }]);
    setNewCompetitor({ name: '', url: '', notes: '' });
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getSearchQueries = (idea: Idea) => {
    // Extract keywords from description (what it DOES), not the made-up title
    const desc = idea.desc.toLowerCase();
    const target = idea.targetCustomer?.toLowerCase() || '';

    // Common filler words to remove
    const stopWords = ['a', 'an', 'the', 'for', 'to', 'and', 'or', 'that', 'this', 'with', 'your', 'their', 'helps', 'help', 'allows', 'enables', 'makes', 'it', 'is', 'are', 'be', 'been', 'being'];

    // Get meaningful words from description (first 4 non-stop words)
    const descWords = desc.replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2 && !stopWords.includes(w)).slice(0, 4);
    const keyPhrase = descWords.slice(0, 3).join(' ');

    // Get target customer keyword
    const targetWord = target.replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2 && !stopWords.includes(w))[0] || '';

    return [
      `${keyPhrase} software`,
      targetWord ? `${targetWord} ${descWords[0] || ''} tools` : `${keyPhrase} tools`,
    ].filter(q => q.trim().length > 5);
  };

  const togglePainPoint = (pain: string) => {
    setSelectedPainPoints(prev => {
      if (prev.includes(pain)) {
        return prev.filter(p => p !== pain);
      }
      if (prev.length >= 5) {
        toast.error("Select up to 5 pain points");
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
      <div ref={containerRef} className={`${ds.cardWithPadding} text-center`}>
        <h3 className={`${ds.heading} mb-2`}>Complete Day 1 First</h3>
        <p className={ds.body}>
          Generate and shortlist your ideas in Day 1 before validating them here.
        </p>
      </div>
    );
  }

  // Done state
  if (step === 'done' && selectedIdeaIndex !== null) {
    const idea = shortlistedIdeas[selectedIdeaIndex];
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <h2 className={`${ds.heading} mb-2`}>Your Chosen Idea</h2>
        <p className={`${ds.muted} mb-6`}>This is the one you're building!</p>

        <div className={`${ds.cardWithPadding} max-w-2xl mx-auto text-left`}>
          <h3 className={`${ds.heading} mb-2`}>{idea.title}</h3>
          <p className={`${ds.body} mb-3`}>{idea.desc}</p>
          <p className={`${ds.muted} mb-4`}>Target... {idea.targetCustomer}</p>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className={`${ds.label} uppercase`}>Pain Points You're Solving</p>
              <button
                onClick={() => setStep('pain')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            </div>
            <ul className="space-y-1">
              {selectedPainPoints.map((pain, i) => (
                <li key={i} className={`${ds.muted} flex items-start gap-2`}>
                  <span className={ds.successText}>•</span>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200">
            <p className={`${ds.label} uppercase mb-2`}>Your "I Help" Statement:</p>
            <p className={`${ds.muted} text-sm mb-3`}>
              Complete this: "I help [SPECIFIC PERSON] solve [PAINFUL PROBLEM] so they can [DESIRED OUTCOME]."
            </p>
            <Input
              placeholder="I help small business owners automate their invoicing so they can get paid faster..."
              value={iHelpStatement}
              onChange={(e) => {
                hasUserTypedRef.current = true;
                setIHelpStatement(e.target.value);
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className={`mt-8 ${ds.infoBoxHighlight} max-w-2xl mx-auto`}>
          <p className={`${ds.heading} mb-2`}>
            "There is NO perfect idea. The perfect idea is the one you BUILD."
          </p>
          <p className={ds.body}>
            You've made a decision. That puts you ahead of 90% of dreamers.
          </p>
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep('pain')}
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>
          <Button
            size="lg"
            className="flex-1 h-14 text-lg font-bold gap-2"
            onClick={() => {
              if (!iHelpStatement.trim()) {
                toast.error("Write your 'I help' statement first");
                return;
              }
              onComplete({
                chosenIdea: `${idea.title} - ${idea.desc}`,
                chosenIdeaTitle: idea.title,
                selectedIdeaIndex,
                selectedPainPoints,
                competitors,
                validationInsights: validationInsights[selectedIdeaIndex] || {
                  demandScore: 7,
                  marketSize: "Not validated",
                  competitionLevel: "Not validated",
                  differentiationPotential: "Not validated",
                  revenueClarity: "Not validated",
                  timeToFirstCustomer: "Not validated",
                  moatPotential: "Not validated",
                  topRisk: "Unknown",
                  firstCustomersStrategy: "Not validated",
                  verdict: "Proceed",
                },
                iHelpStatement: iHelpStatement.trim(),
              });
            }}
            disabled={!iHelpStatement.trim()}
          >
            Complete Day 2 <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Competitor research step
  if (step === 'competitors' && selectedIdeaIndex !== null) {
    const idea = shortlistedIdeas[selectedIdeaIndex];
    const searchQueries = getSearchQueries(idea);

    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={ds.section}
      >
        <div className={ds.optionSelected}>
          <div>
            <h3 className={ds.label}>{idea.title}</h3>
            <p className={`${ds.muted} mt-1`}>{idea.desc}</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className={`${ds.heading} mb-2`}>Who Are Your Competitors?</h2>
          <p className={ds.muted}>Finding competitors proves there's money in this market. No competitors = risky.</p>
        </div>

        {/* AI Competitor Search */}
        {competitors.length === 0 && !loadingCompetitors && (
          <div className={ds.cardWithPadding}>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className={ds.label}>Let AI Find Your Competitors</h3>
                <p className={`${ds.muted} mt-1`}>We'll search for real companies doing something similar to your idea.</p>
              </div>
              <Button
                size="lg"
                onClick={handleFindCompetitors}
                className="w-full h-14 text-lg font-bold gap-2"
                disabled={competitorAttempts >= MAX_COMPETITOR_ATTEMPTS}
              >
                <Search className="w-5 h-5" /> {competitorAttempts >= MAX_COMPETITOR_ATTEMPTS ? "Search limit reached" : "Find Competitors"}
              </Button>
              {competitorAttempts >= MAX_COMPETITOR_ATTEMPTS - 1 && competitorAttempts < MAX_COMPETITOR_ATTEMPTS && (
                <p className="text-sm text-amber-600 text-center mt-2">1 search remaining</p>
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loadingCompetitors && (
          <div className={ds.cardWithPadding}>
            <div className="text-center space-y-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className={ds.body}>Searching for competitors...</p>
            </div>
          </div>
        )}

        {/* Competitors list */}
        {competitors.length > 0 && (
          <div className={ds.cardWithPadding}>
            <h3 className={`${ds.label} mb-3`}>Competitors Found</h3>
            <p className={`${ds.muted} mb-4`}>Review these competitors. Remove any that aren't relevant.</p>

            <div className="space-y-2 mb-4">
              {competitors.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 min-w-0">
                    <p className={ds.label}>{comp.name}</p>
                    {comp.url && (
                      <a href={comp.url.startsWith('http') ? comp.url : `https://${comp.url}`} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline flex items-center gap-1">
                        {comp.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {comp.notes && <p className={`${ds.muted} text-sm mt-1`}>{comp.notes}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeCompetitor(idx)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => setShowManualAdd(!showManualAdd)} className="w-full gap-2">
              <Plus className="w-4 h-4" /> {showManualAdd ? 'Hide Manual Add' : 'Add More Manually'}
            </Button>
          </div>
        )}

        {/* Google Search suggestion */}
        {competitors.length > 0 && (
          <div className={ds.cardWithPadding}>
            <h3 className={`${ds.label} mb-2`}>Want to find more?</h3>
            <p className={`${ds.muted} mb-4`}>Search Google manually to discover competitors we might have missed.</p>
            <div className="flex flex-wrap gap-2">
              {searchQueries.slice(0, 2).map((query, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')}
                >
                  <Search className="w-4 h-4" /> {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Manual add section */}
        {showManualAdd && (
          <div className={ds.cardWithPadding}>
            <h3 className={`${ds.label} mb-3`}>Add Competitor Manually</h3>
            <div className="space-y-3">
              <Input
                placeholder="Competitor name (e.g., Notion, Asana)"
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
              />
              <Input
                placeholder="Website URL (optional)"
                value={newCompetitor.url}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, url: e.target.value })}
              />
              <Input
                placeholder="What do they do? (optional)"
                value={newCompetitor.notes}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, notes: e.target.value })}
              />
              <Button variant="outline" onClick={addCompetitor} className="w-full gap-2">
                <Plus className="w-4 h-4" /> Add Competitor
              </Button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className={ds.infoBoxHighlight}>
          <p className={ds.body}>
            <span className="font-bold">{competitors.length}</span> competitor{competitors.length !== 1 ? 's' : ''} added
            {competitors.length === 0 && " - add at least 1 to continue"}
            {competitors.length >= 2 && " - great research!"}
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleCompetitorsDone}
          disabled={competitors.length === 0}
          className="w-full h-14 text-lg font-bold gap-2"
        >
          Continue to Pain Points <ChevronRight className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          onClick={() => { setStep('shortlist'); setSelectedIdeaIndex(null); setCompetitors([]); }}
        >
          ← Back to Shortlist
        </Button>
      </motion.div>
    );
  }

  // Pain points selection
  if (step === 'pain' && selectedIdeaIndex !== null) {
    const idea = shortlistedIdeas[selectedIdeaIndex];

    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={ds.section}
      >
        <div className={ds.optionSelected}>
          <div>
            <h3 className={ds.label}>{idea.title}</h3>
            <p className={`${ds.muted} mt-1`}>{idea.desc}</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className={`${ds.heading} mb-2`}>What Pain Points Will You Solve?</h2>
          <p className={ds.muted}>Select 1-5 pain points to focus on</p>
          <p className={`${ds.label} mt-2`}>{selectedPainPoints.length}/5 selected</p>
        </div>

        {loadingPainPoints ? (
          <div className={`${ds.cardWithPadding} p-12 text-center`}>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className={ds.body}>Identifying pain points...</p>
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
                      <p className={ds.body}>{cleanPain}</p>
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Enter a pain point..."
                    value={customPainInput}
                    onChange={(e) => setCustomPainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomPain()}
                    autoFocus
                    className="flex-1"
                  />
                  <div className="flex gap-2 flex-shrink-0">
                    <Button onClick={handleAddCustomPain}><Plus className="w-4 h-4" /></Button>
                    <Button variant="outline" onClick={() => { setShowCustomInput(false); setCustomPainInput(""); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
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
    <div ref={containerRef} className={ds.section}>
      <div className="text-center">
        <h2 className={`${ds.heading} mb-2`}>Your Shortlist from Day 1</h2>
        <p className={ds.muted}>
          You selected {shortlistedIdeas.length} ideas. Now validate them and choose ONE to build.
        </p>
      </div>

      {/* Action over perfection message */}
      <div className={ds.infoBoxHighlight}>
        <p className={`${ds.body} text-center`}>
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
                      <h3 className={ds.heading}>{idea.title}</h3>
                      <p className={`${ds.muted} mt-1`}>{idea.desc}</p>
                      <p className={`${ds.muted} mt-2`}>Target... {idea.targetCustomer}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{idea.totalScore}/25</div>
                      <p className={ds.muted}>Day 1 Score</p>
                    </div>
                  </div>
                </div>

                {/* Validation insights - expanded view */}
                {insight ? (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    {/* Quick stats row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`${ds.infoBoxHighlight} text-center`}>
                        <div className={ds.heading}>{insight.demandScore}/10</div>
                        <p className={ds.muted}>Demand Score</p>
                      </div>
                      <div className={`${ds.infoBoxHighlight} text-center`}>
                        <div className={ds.label}>{insight.competitionLevel?.split(' - ')[0] || 'Unknown'}</div>
                        <p className={ds.muted}>Competition</p>
                      </div>
                      <div className={`${ds.infoBoxHighlight} text-center`}>
                        <div className={ds.label}>{insight.timeToFirstCustomer?.split(' - ')[0] || 'Unknown'}</div>
                        <p className={ds.muted}>Time to 1st Customer</p>
                      </div>
                    </div>

                    {/* Detailed insights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={ds.infoBoxHighlight}>
                        <p className={`${ds.muted} mb-1 text-xs uppercase tracking-wide`}>Market Size</p>
                        <p className={ds.body}>{insight.marketSize || 'Not analyzed'}</p>
                      </div>
                      <div className={ds.infoBoxHighlight}>
                        <p className={`${ds.muted} mb-1 text-xs uppercase tracking-wide`}>Differentiation Potential</p>
                        <p className={ds.body}>{insight.differentiationPotential || 'Not analyzed'}</p>
                      </div>
                      <div className={ds.infoBoxHighlight}>
                        <p className={`${ds.muted} mb-1 text-xs uppercase tracking-wide`}>Revenue Clarity</p>
                        <p className={ds.body}>{insight.revenueClarity || 'Not analyzed'}</p>
                      </div>
                      <div className={ds.infoBoxHighlight}>
                        <p className={`${ds.muted} mb-1 text-xs uppercase tracking-wide`}>Moat Potential</p>
                        <p className={ds.body}>{insight.moatPotential || 'Not analyzed'}</p>
                      </div>
                    </div>

                    {/* Planning tip and strategy */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className={`${ds.infoBoxHighlight} border-l-4 border-l-blue-400`}>
                        <p className={`${ds.muted} mb-1 text-xs uppercase tracking-wide`}>Thing to Plan For</p>
                        <p className={ds.body}>{insight.topRisk || 'Not analyzed'}</p>
                      </div>
                      <div className={`${ds.infoBoxHighlight} border-l-4 border-l-green-400`}>
                        <p className={`${ds.muted} mb-1 text-xs uppercase tracking-wide`}>How to Find Your First 10 Customers</p>
                        <p className={ds.body}>{insight.firstCustomersStrategy || 'Not analyzed'}</p>
                      </div>
                    </div>

                    {/* Verdict - always encouraging */}
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="font-bold text-green-800">
                        {insight.verdict || 'This idea has potential - go build it!'}
                      </p>
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
        <p className={`${ds.muted} text-center`}>
          <span className="font-semibold text-slate-700">Pro tip:</span> Click "Get Validation Insights" on each idea to compare them, then choose the one that excites you most AND has decent demand.
        </p>
      </div>

      {/* Stuck? Book a call */}
      <div className={ds.cardWithPadding}>
        <div className="text-center space-y-3">
          <h3 className={ds.label}>Stuck? Can't Decide?</h3>
          <p className={ds.muted}>
            Sometimes you just need a fresh perspective. Book a 1:1 call with Matt to talk through your ideas and get unstuck.
          </p>
          <Button
            variant="outline"
            className="border-2"
            onClick={() => window.open('/coaching', '_blank')}
          >
            Book a Call
          </Button>
        </div>
      </div>
    </div>
  );
}
