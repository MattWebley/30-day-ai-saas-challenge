import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Loader2, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
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

interface Day1IdeaGeneratorProps {
  existingProgress: any;
  onComplete: () => void;
}

export function Day1IdeaGenerator({ existingProgress, onComplete }: Day1IdeaGeneratorProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'inputs' | 'generating' | 'ideas' | 'shortlist'>(
    existingProgress?.generatedIdeas ? 'ideas' : 'inputs'
  );
  
  const [inputs, setInputs] = useState({
    knowledge: existingProgress?.userInputs?.knowledge || "",
    skills: existingProgress?.userInputs?.skills || "",
    interests: existingProgress?.userInputs?.interests || "",
    experience: existingProgress?.userInputs?.experience || "",
  });
  
  const [ideas, setIdeas] = useState<Idea[]>(existingProgress?.generatedIdeas || []);
  const [selectedIdeas, setSelectedIdeas] = useState<number[]>(existingProgress?.shortlistedIdeas || []);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customIdea, setCustomIdea] = useState({ title: "", desc: "", targetCustomer: "" });

  const generateIdeas = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/generate-ideas", inputs);
      return res.json();
    },
    onSuccess: (data) => {
      setIdeas(data);
      setStep('ideas');
      saveProgress.mutate({ userInputs: inputs, generatedIdeas: data, shortlistedIdeas: [] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate ideas");
      setStep('inputs');
    },
  });

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day1", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const handleGenerate = () => {
    if (!inputs.knowledge || !inputs.skills || !inputs.interests) {
      toast.error("Please fill in at least knowledge, skills, and interests");
      return;
    }
    setStep('generating');
    generateIdeas.mutate();
  };

  const toggleIdeaSelection = (index: number) => {
    setSelectedIdeas(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      if (prev.length >= 5) {
        toast.error("You can select up to 5 ideas. Deselect one first.");
        return prev;
      }
      return [...prev, index];
    });
  };

  const handleConfirmShortlist = () => {
    if (selectedIdeas.length < 3) {
      toast.error("Please select at least 3 ideas to continue");
      return;
    }
    saveProgress.mutate({
      userInputs: inputs,
      generatedIdeas: ideas,
      shortlistedIdeas: selectedIdeas,
    });
    setStep('shortlist');
  };

  const handleAddCustomIdea = () => {
    if (!customIdea.title.trim() || !customIdea.desc.trim()) {
      toast.error("Please fill in at least the title and description");
      return;
    }
    
    const newIdea: Idea = {
      title: customIdea.title.trim(),
      desc: customIdea.desc.trim(),
      targetCustomer: customIdea.targetCustomer.trim() || "Your target market",
      scores: {
        marketDemand: 3,
        skillMatch: 5,
        passionFit: 5,
        speedToMvp: 3,
        monetization: 3,
      },
      totalScore: 19,
      whyThisWorks: "This is YOUR idea - you know it best!",
    };
    
    setIdeas(prev => [newIdea, ...prev]);
    setCustomIdea({ title: "", desc: "", targetCustomer: "" });
    setShowCustomForm(false);
    toast.success("Your idea has been added to the list!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' };
    if (score >= 3) return { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100' };
    return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' };
  };

  const getTotalScoreColor = (total: number) => {
    if (total >= 20) return { border: 'border-green-400', bg: 'bg-green-50', badge: 'bg-green-500 text-white', glow: 'shadow-green-200' };
    if (total >= 15) return { border: 'border-amber-400', bg: 'bg-amber-50', badge: 'bg-amber-500 text-white', glow: 'shadow-amber-200' };
    return { border: 'border-red-400', bg: 'bg-red-50', badge: 'bg-red-500 text-white', glow: 'shadow-red-200' };
  };

  const ScoreBar = ({ label, score }: { label: string; score: number }) => {
    const colors = getScoreColor(score);
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="w-24 text-slate-500 truncate">{label}</span>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.bg} rounded-full transition-all`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className={`w-5 font-bold ${colors.text}`}>{score}</span>
      </div>
    );
  };

  if (step === 'inputs') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Let's Find Your Perfect SaaS Idea</h2>
          <p className="text-slate-500">Tell us about yourself and we'll generate 28 personalized ideas scored against Matt's criteria</p>
        </div>

        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What do you know a lot about? (Knowledge/Expertise)
            </label>
            <Textarea
              placeholder="e.g. Digital marketing, accounting, fitness training, real estate..."
              value={inputs.knowledge}
              onChange={(e) => setInputs(prev => ({ ...prev, knowledge: e.target.value }))}
              className="min-h-[80px]"
              data-testid="input-knowledge"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What are you good at? (Skills)
            </label>
            <Textarea
              placeholder="e.g. Writing, design, data analysis, project management..."
              value={inputs.skills}
              onChange={(e) => setInputs(prev => ({ ...prev, skills: e.target.value }))}
              className="min-h-[80px]"
              data-testid="input-skills"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What do you enjoy doing? (Interests/Passions)
            </label>
            <Textarea
              placeholder="e.g. Helping small businesses, solving puzzles, teaching..."
              value={inputs.interests}
              onChange={(e) => setInputs(prev => ({ ...prev, interests: e.target.value }))}
              className="min-h-[80px]"
              data-testid="input-interests"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What's your work experience? (Optional)
            </label>
            <Textarea
              placeholder="e.g. 5 years in sales, ran a restaurant, worked in healthcare..."
              value={inputs.experience}
              onChange={(e) => setInputs(prev => ({ ...prev, experience: e.target.value }))}
              className="min-h-[80px]"
              data-testid="input-experience"
            />
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold gap-2"
                onClick={handleGenerate}
                data-testid="button-generate-ideas"
              >
                Generate 28 SaaS Ideas
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI will create 28 personalized ideas based on your profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Loader2 className="w-10 h-10 text-slate-700 animate-spin" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Generating Your Ideas...</h3>
          <p className="text-slate-500">AI is analyzing your profile and finding the best opportunities</p>
        </div>
      </div>
    );
  }

  if (step === 'ideas' || step === 'shortlist') {
    const showConfirmation = step === 'shortlist';

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {showConfirmation ? `Your Top ${selectedIdeas.length} Ideas` : "Select Your Top 3-5 Ideas"}
            </h2>
            <p className="text-slate-500 text-sm">
              {showConfirmation 
                ? "These ideas will carry through to Day 2 for validation" 
                : `${selectedIdeas.length} selected (need 3-5) - Pick the ideas that excite you most`}
            </p>
          </div>
          {!showConfirmation && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleConfirmShortlist}
                    disabled={selectedIdeas.length < 3}
                    className="gap-2"
                    data-testid="button-confirm-shortlist"
                  >
                    Confirm Selection <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lock in your favorite ideas (3-5)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {!showConfirmation && (
          <Progress value={Math.min((selectedIdeas.length / 3) * 100, 100)} className="h-2" />
        )}

        {!showConfirmation && (
          <Card className="p-4 border-2 border-dashed border-slate-300 bg-slate-50">
            {showCustomForm ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-slate-900">Add Your Own Idea</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Idea Name</label>
                  <Input
                    placeholder="e.g. AI Resume Builder"
                    value={customIdea.title}
                    onChange={(e) => setCustomIdea(prev => ({ ...prev, title: e.target.value }))}
                    data-testid="input-custom-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <Textarea
                    placeholder="What does your idea do? What problem does it solve?"
                    value={customIdea.desc}
                    onChange={(e) => setCustomIdea(prev => ({ ...prev, desc: e.target.value }))}
                    className="min-h-[60px]"
                    data-testid="input-custom-desc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Customer (optional)</label>
                  <Input
                    placeholder="e.g. Job seekers, freelancers..."
                    value={customIdea.targetCustomer}
                    onChange={(e) => setCustomIdea(prev => ({ ...prev, targetCustomer: e.target.value }))}
                    data-testid="input-custom-target"
                  />
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleAddCustomIdea} className="gap-2" data-testid="button-add-custom">
                          <Plus className="w-4 h-4" /> Add to List
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add your idea to the list of options</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-700 font-semibold hover:text-slate-900 transition-colors cursor-pointer"
                data-testid="button-show-custom-form"
              >
                <Plus className="w-5 h-5" />
                Already have an idea? Add your own!
              </button>
            )}
          </Card>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {(showConfirmation 
              ? ideas.filter((_, i) => selectedIdeas.includes(i))
              : ideas
            ).map((idea, displayIndex) => {
              const actualIndex = showConfirmation 
                ? selectedIdeas[displayIndex] 
                : displayIndex;
              const isSelected = selectedIdeas.includes(actualIndex);
              
              const scoreColors = getTotalScoreColor(idea.totalScore);
              
              return (
                <motion.div
                  key={actualIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: displayIndex * 0.05 }}
                >
                  <Card
                    className={`p-5 border-2 cursor-pointer shadow-md ${scoreColors.border} ${
                      isSelected ? scoreColors.bg : 'bg-white hover:shadow-lg'
                    }`}
                    onClick={() => !showConfirmation && toggleIdeaSelection(actualIndex)}
                    data-testid={`idea-card-${actualIndex}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-slate-400">#{actualIndex + 1}</span>
                          <h3 className="font-bold text-slate-900">{idea.title}</h3>
                          <span className={`px-3 py-1 ${scoreColors.badge} text-sm font-bold rounded-full`}>
                            {idea.totalScore}/25
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{idea.desc}</p>
                        <p className="text-xs text-slate-400 mb-3">
                          <span className="font-medium">Target:</span> {idea.targetCustomer}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                          <ScoreBar label="Market Demand" score={idea.scores.marketDemand} />
                          <ScoreBar label="Skill Match" score={idea.scores.skillMatch} />
                          <ScoreBar label="Passion Fit" score={idea.scores.passionFit} />
                          <ScoreBar label="Speed to MVP" score={idea.scores.speedToMvp} />
                          <ScoreBar label="Monetization" score={idea.scores.monetization} />
                        </div>

                        <p className="text-xs text-slate-500 mt-3 italic">"{idea.whyThisWorks}"</p>
                      </div>

                      {!showConfirmation && (
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-slate-700 border-slate-700 text-white'
                            : 'border-slate-200'
                        }`}>
                          {isSelected && <Check className="w-5 h-5" />}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!showConfirmation && selectedIdeas.length >= 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  onClick={handleConfirmShortlist}
                  className="w-full h-14 text-lg font-bold gap-2"
                  data-testid="button-confirm-shortlist-bottom"
                >
                  Confirm Selection ({selectedIdeas.length} ideas) <ChevronRight className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lock in your favorite ideas and proceed</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {showConfirmation && (
          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => {
              console.log('[Day1] Complete Day 1 button clicked');
              onComplete();
            }}
            data-testid="button-complete-day1"
          >
            Complete Day 1 <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    );
  }

  return null;
}
