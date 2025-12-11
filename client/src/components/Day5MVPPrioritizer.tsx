import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
import { Sparkles, Loader2, Check, X, Minus } from "lucide-react";
import { toast } from "sonner";

const MOCK_DATA = {
  chosenIdea: { title: "AI Content Optimizer" },
  coreFeatures: ["Content editor", "AI suggestions", "Analytics dashboard", "Team collaboration"],
  uspFeatures: ["Real-time optimization", "Competitor analysis"],
};

interface Day5Props {
  onComplete: () => void;
}

type FeaturePriority = 'must' | 'nice' | 'cut' | null;

interface FeatureItem {
  name: string;
  priority: FeaturePriority;
}

export function Day5MVPPrioritizer({ onComplete }: Day5Props) {
  const queryClient = useQueryClient();
  const { testMode } = useTestMode();
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [killerFeature, setKillerFeature] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAttempts, setAiAttempts] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState("");
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
  const day3Progress = allProgress?.find((p: any) => p.day === 3);

  const shortlistedIdeas = day1Progress?.generatedIdeas?.filter((_: any, i: number) => 
    day1Progress?.shortlistedIdeas?.includes(i)
  ) || [];

  const chosenIdeaIndex = day2Progress?.userInputs?.chosenIdea;
  const realChosenIdea = chosenIdeaIndex !== undefined && shortlistedIdeas[chosenIdeaIndex]
    ? shortlistedIdeas[chosenIdeaIndex]
    : null;

  const chosenIdea = testMode ? MOCK_DATA.chosenIdea : realChosenIdea;
  const coreFeatures = testMode ? MOCK_DATA.coreFeatures : (day3Progress?.userInputs?.coreFeatures || []);
  const uspFeatures = testMode ? MOCK_DATA.uspFeatures : (day3Progress?.userInputs?.uspFeatures || []);

  useEffect(() => {
    const allFeatures = [...coreFeatures, ...uspFeatures];
    if (allFeatures.length > 0 && features.length === 0) {
      setFeatures(allFeatures.map((f: string) => ({ name: f, priority: null })));
    }
  }, [coreFeatures, uspFeatures, features.length]);

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day5", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const setPriority = (index: number, priority: FeaturePriority) => {
    setFeatures(prev => prev.map((f, i) => i === index ? { ...f, priority } : f));
  };

  const generateAISuggestion = async () => {
    if (aiAttempts >= MAX_AI_ATTEMPTS) return;
    setAiAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const mustHaves = features.filter(f => f.priority === 'must').map(f => f.name);
      const niceToHaves = features.filter(f => f.priority === 'nice').map(f => f.name);
      
      const prompt = `I'm building "${chosenIdea?.title}". Help me identify the ONE killer feature for my MVP.

My features marked as "Must Have": ${mustHaves.join(', ') || 'None yet'}
My features marked as "Nice to Have": ${niceToHaves.join(', ') || 'None yet'}

Based on these features, which SINGLE feature should be my #1 focus for MVP? This should be:
- The one feature that delivers the core value
- Something I can build quickly
- The feature users would pay for even if nothing else existed

Give me:
1. The ONE killer feature (pick from my list or suggest a refined version)
2. One sentence explaining WHY this is the one to focus on

Format: Start with the feature name, then a dash, then the explanation. Keep it under 50 words total.`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      setAiSuggestion(data.response.replace(/^\.\s*/, '').trim());
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGenerating(false);
  };

  const handleFinish = () => {
    const mustHaves = features.filter(f => f.priority === 'must').map(f => f.name);
    const niceToHaves = features.filter(f => f.priority === 'nice').map(f => f.name);
    const cut = features.filter(f => f.priority === 'cut').map(f => f.name);
    
    saveProgress.mutate({ 
      mustHaveFeatures: mustHaves,
      niceToHaveFeatures: niceToHaves,
      cutFeatures: cut,
      killerFeature,
      aiSuggestion
    });
    onComplete();
  };

  const mustHaveCount = features.filter(f => f.priority === 'must').length;
  const niceToHaveCount = features.filter(f => f.priority === 'nice').length;
  const cutCount = features.filter(f => f.priority === 'cut').length;
  const allCategorized = features.every(f => f.priority !== null);

  if (!chosenIdea || features.length === 0) {
    return (
      <Card className="p-8 border-2 border-slate-200 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Previous Days First</h3>
        <p className="text-slate-600">
          You need to define your features on Day 3 before prioritizing them.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 border border-slate-200 bg-slate-50">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Your Product:</p>
        <h3 className="font-bold text-slate-900">{chosenIdea.title}</h3>
      </Card>

      <Card className="p-5 border-2 border-black bg-slate-50">
        <p className="text-center text-lg font-bold text-black mb-2">
          Your MVP needs ONE killer feature
        </p>
        <p className="text-center text-sm text-slate-600">
          Not ten mediocre ones. Ruthlessly cut everything that's not essential.
        </p>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Categorize Your Features</h3>
          <div className="flex gap-4 text-xs">
            <span className="text-green-600 font-medium">Must: {mustHaveCount}</span>
            <span className="text-amber-600 font-medium">Nice: {niceToHaveCount}</span>
            <span className="text-slate-400 font-medium">Cut: {cutCount}</span>
          </div>
        </div>

        {features.map((feature, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg border-2 transition-all ${
              feature.priority === 'must' ? 'border-green-500 bg-green-50' :
              feature.priority === 'nice' ? 'border-amber-400 bg-amber-50' :
              feature.priority === 'cut' ? 'border-slate-300 bg-slate-100 opacity-60' :
              'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`font-medium ${feature.priority === 'cut' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {feature.name}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPriority(i, 'must')}
                  className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                    feature.priority === 'must' 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : 'border-slate-200 hover:border-green-500 text-slate-400 hover:text-green-500'
                  }`}
                  title="Must Have"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPriority(i, 'nice')}
                  className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                    feature.priority === 'nice' 
                      ? 'border-amber-400 bg-amber-400 text-white' 
                      : 'border-slate-200 hover:border-amber-400 text-slate-400 hover:text-amber-500'
                  }`}
                  title="Nice to Have"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPriority(i, 'cut')}
                  className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                    feature.priority === 'cut' 
                      ? 'border-slate-400 bg-slate-400 text-white' 
                      : 'border-slate-200 hover:border-slate-400 text-slate-400 hover:text-slate-500'
                  }`}
                  title="Cut It"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allCategorized && mustHaveCount > 0 && (
        <Card className="p-5 border-2 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">What's Your ONE Killer Feature?</h3>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={generateAISuggestion}
              disabled={isGenerating || aiAttempts >= MAX_AI_ATTEMPTS}
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Get AI Suggestion{aiAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
              )}
            </Button>
          </div>

          {aiSuggestion && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{aiSuggestion}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-slate-600 mb-2">
              Pick ONE feature from your "Must Haves" or type your own:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {features.filter(f => f.priority === 'must').map((f, i) => (
                <button
                  key={i}
                  onClick={() => setKillerFeature(f.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    killerFeature === f.name
                      ? 'bg-black text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or type your killer feature..."
              value={killerFeature}
              onChange={(e) => setKillerFeature(e.target.value)}
              className="text-base"
              data-testid="input-killer-feature"
            />
          </div>
        </Card>
      )}

      {killerFeature && (
        <Card className="p-5 border-2 border-black bg-black text-white">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Your MVP's Killer Feature:</p>
          <p className="text-xl font-bold">{killerFeature}</p>
          <p className="text-sm text-slate-300 mt-2">
            This is what you'll build first. Everything else comes later.
          </p>
        </Card>
      )}

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          className="gap-2 bg-green-600 hover:bg-green-700"
          onClick={handleFinish}
          disabled={!killerFeature.trim()}
          data-testid="button-finish"
        >
          <Check className="w-5 h-5" /> Complete Day 5
        </Button>
      </div>
    </div>
  );
}
