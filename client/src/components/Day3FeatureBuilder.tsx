import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Check, Sparkles, Loader2, ChevronRight, Plus, X, Zap, Target, Star } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Day3Props {
  onComplete: () => void;
}

const FEATURE_PROMPTS = [
  {
    id: "competitor_features",
    title: "Step 1: Find Core Features",
    description: "Analyze competitors to find the features EVERYONE has (these are your must-haves)",
    prompt: `I'm building a SaaS product: "[IDEA_TITLE]" - [IDEA_DESC]

Find 3-5 competitors in this space and analyze their features. Then tell me:

1. List each competitor and their main features
2. Which features do ALL or MOST competitors share? (These are the CORE features I must have)
3. Which features are unique to only 1-2 competitors?

Format the core features as a simple bullet list I can use as my MVP checklist.`,
  },
  {
    id: "usp_generator",
    title: "Step 2: Generate Your USP",
    description: "Create unique features based on your skills and competitor gaps",
    prompt: `I'm building: "[IDEA_TITLE]" - [IDEA_DESC]

My unique background:
- Skills: [SKILLS]
- Knowledge: [KNOWLEDGE]
- Interests: [INTERESTS]

Based on the competitor analysis, suggest 2-3 potential USP (Unique Selling Proposition) features I could build that:
1. Leverage my unique skills/knowledge
2. Fill a gap that competitors are missing
3. Would make customers choose ME over the competition

For each USP idea, explain WHY it would be a competitive advantage and HOW it connects to my background.`,
  },
];

export function Day3FeatureBuilder({ onComplete }: Day3Props) {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [loadingPrompt, setLoadingPrompt] = useState<string | null>(null);
  const [coreFeatures, setCoreFeatures] = useState<string[]>([]);
  const [uspFeatures, setUspFeatures] = useState<string[]>([]);
  const [newCoreFeature, setNewCoreFeature] = useState("");
  const [newUspFeature, setNewUspFeature] = useState("");
  const [step, setStep] = useState<'research' | 'finalize'>('research');

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

  const chosenIdea = day2Progress?.chosenIdea !== undefined && shortlistedIdeas[day2Progress.chosenIdea]
    ? shortlistedIdeas[day2Progress.chosenIdea]
    : null;

  const userInputs = day1Progress?.userInputs;

  const runAiPrompt = useMutation({
    mutationFn: async ({ promptId }: { promptId: string }) => {
      const promptTemplate = FEATURE_PROMPTS.find(p => p.id === promptId)?.prompt || "";
      let filledPrompt = promptTemplate
        .replace(/\[IDEA_TITLE\]/g, chosenIdea?.title || "My SaaS")
        .replace(/\[IDEA_DESC\]/g, chosenIdea?.desc || "A software product")
        .replace(/\[SKILLS\]/g, userInputs?.skills || "Not specified")
        .replace(/\[KNOWLEDGE\]/g, userInputs?.knowledge || "Not specified")
        .replace(/\[INTERESTS\]/g, userInputs?.interests || "Not specified");
      
      const res = await apiRequest("POST", "/api/ai-prompt", { prompt: filledPrompt });
      return res.json();
    },
    onSuccess: (data, { promptId }) => {
      setAiResponses(prev => ({ ...prev, [promptId]: data.response }));
      setLoadingPrompt(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to run AI analysis");
      setLoadingPrompt(null);
    },
  });

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day3", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
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

  const getFilledPrompt = (promptId: string) => {
    const promptTemplate = FEATURE_PROMPTS.find(p => p.id === promptId)?.prompt || "";
    return promptTemplate
      .replace(/\[IDEA_TITLE\]/g, chosenIdea?.title || "My SaaS")
      .replace(/\[IDEA_DESC\]/g, chosenIdea?.desc || "A software product")
      .replace(/\[SKILLS\]/g, userInputs?.skills || "Not specified")
      .replace(/\[KNOWLEDGE\]/g, userInputs?.knowledge || "Not specified")
      .replace(/\[INTERESTS\]/g, userInputs?.interests || "Not specified");
  };

  const handleRunAi = (promptId: string) => {
    setLoadingPrompt(promptId);
    runAiPrompt.mutate({ promptId });
  };

  const addCoreFeature = () => {
    if (newCoreFeature.trim()) {
      setCoreFeatures(prev => [...prev, newCoreFeature.trim()]);
      setNewCoreFeature("");
    }
  };

  const addUspFeature = () => {
    if (newUspFeature.trim()) {
      setUspFeatures(prev => [...prev, newUspFeature.trim()]);
      setNewUspFeature("");
    }
  };

  const removeCoreFeature = (index: number) => {
    setCoreFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const removeUspFeature = (index: number) => {
    setUspFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalize = () => {
    if (coreFeatures.length === 0) {
      toast.error("Add at least one core feature");
      return;
    }
    if (uspFeatures.length === 0) {
      toast.error("Add at least one USP feature");
      return;
    }
    saveProgress.mutate({ coreFeatures, uspFeatures });
    setStep('finalize');
  };

  if (!chosenIdea) {
    return (
      <Card className="p-8 border-2 border-amber-200 bg-amber-50 text-center">
        <Target className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Day 2 First!</h3>
        <p className="text-slate-600">
          You need to choose your final idea in Day 2 before defining features here.
        </p>
      </Card>
    );
  }

  if (step === 'finalize') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Feature Plan is Ready!</h2>
          <p className="text-slate-500">Here's what you're building for {chosenIdea.title}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5 border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Core Features</h3>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{coreFeatures.length}</span>
            </div>
            <ul className="space-y-2">
              {coreFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900">USP Features</h3>
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{uspFeatures.length}</span>
            </div>
            <ul className="space-y-2">
              {uspFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
          <p className="text-lg font-bold text-green-900 mb-2">
            "You now know EXACTLY what to build. No more guessing!"
          </p>
          <p className="text-green-700">
            Tomorrow we'll start turning these features into reality.
          </p>
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
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Define Your Features</h2>
        <p className="text-slate-500">
          Research competitors, identify core features, and create your USP
        </p>
      </div>

      <Card className="p-5 border-2 border-primary/30 bg-blue-50/50">
        <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Building:</p>
        <h3 className="font-bold text-lg text-slate-900">{chosenIdea.title}</h3>
        <p className="text-slate-600 mt-1">{chosenIdea.desc}</p>
      </Card>

      {FEATURE_PROMPTS.map((prompt) => {
        const filledPrompt = getFilledPrompt(prompt.id);
        const aiResponse = aiResponses[prompt.id];
        const isLoading = loadingPrompt === prompt.id;

        return (
          <Card key={prompt.id} className="p-5 border-2 border-slate-100">
            <div className="flex items-start gap-3 mb-3">
              {prompt.id === 'competitor_features' ? (
                <Target className="w-6 h-6 text-blue-600 flex-shrink-0" />
              ) : (
                <Star className="w-6 h-6 text-amber-500 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-slate-900">{prompt.title}</h4>
                <p className="text-sm text-slate-500">{prompt.description}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700 whitespace-pre-wrap mb-4 max-h-48 overflow-y-auto">
              {filledPrompt}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => copyToClipboard(filledPrompt, prompt.id)}
                data-testid={`copy-prompt-${prompt.id}`}
              >
                {copiedId === prompt.id ? (
                  <><Check className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Prompt</>
                )}
              </Button>

              <Button
                className="gap-2"
                onClick={() => handleRunAi(prompt.id)}
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
                className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 max-h-64 overflow-y-auto"
              >
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">AI Response</p>
                <p className="text-slate-700 whitespace-pre-wrap text-sm">{aiResponse}</p>
              </motion.div>
            )}
          </Card>
        );
      })}

      <Card className="p-6 border-2 border-slate-200">
        <h3 className="font-bold text-lg text-slate-900 mb-4">Build Your Feature List</h3>
        <p className="text-sm text-slate-500 mb-6">
          Based on your research, add the features you'll include in your MVP
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-slate-800">Core Features</h4>
              <span className="text-xs text-slate-400">(must-haves)</span>
            </div>
            <div className="space-y-2 mb-3">
              {coreFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <span className="flex-1 text-sm text-blue-900">{feature}</span>
                  <button
                    onClick={() => removeCoreFeature(i)}
                    className="text-blue-400 hover:text-blue-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a core feature..."
                value={newCoreFeature}
                onChange={(e) => setNewCoreFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCoreFeature()}
                data-testid="input-core-feature"
              />
              <Button variant="outline" size="icon" onClick={addCoreFeature}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-slate-800">USP Features</h4>
              <span className="text-xs text-slate-400">(your edge)</span>
            </div>
            <div className="space-y-2 mb-3">
              {uspFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                  <span className="flex-1 text-sm text-amber-900">{feature}</span>
                  <button
                    onClick={() => removeUspFeature(i)}
                    className="text-amber-400 hover:text-amber-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a USP feature..."
                value={newUspFeature}
                onChange={(e) => setNewUspFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addUspFeature()}
                data-testid="input-usp-feature"
              />
              <Button variant="outline" size="icon" onClick={addUspFeature}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Lock In Your Features?</h3>
          <p className="text-slate-600 mb-4">
            You have {coreFeatures.length} core features and {uspFeatures.length} USP features
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={handleFinalize}
            disabled={coreFeatures.length === 0 || uspFeatures.length === 0}
            data-testid="button-finalize-features"
          >
            <Check className="w-5 h-5" />
            Finalize Feature List
          </Button>
        </div>
      </Card>
    </div>
  );
}
