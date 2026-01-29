import { useState, useEffect } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Lightbulb, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface Day1IdeaGeneratorProps {
  existingProgress: any;
  onComplete: () => void;
}

export function Day1IdeaGenerator({ existingProgress, onComplete }: Day1IdeaGeneratorProps) {
  const queryClient = useQueryClient();
  const [step, setStep, containerRef] = useStepWithScroll<'choice' | 'inputs' | 'generating' | 'ideas' | 'manual' | 'shortlist'>(
    existingProgress?.generatedIdeas ? 'ideas' :
    existingProgress?.manualIdeas?.length > 0 ? 'manual' : 'choice'
  );
  
  const [inputs, setInputs] = useState({
    knowledge: existingProgress?.userInputs?.knowledge || "",
    skills: existingProgress?.userInputs?.skills || "",
    interests: existingProgress?.userInputs?.interests || "",
    experience: existingProgress?.userInputs?.experience || "",
  });
  
  const [ideas, setIdeas] = useState<Idea[]>(existingProgress?.generatedIdeas || []);
  const [manualIdeas, setManualIdeas] = useState<Idea[]>(existingProgress?.manualIdeas || []);
  const [selectedIdeas, setSelectedIdeas] = useState<number[]>(existingProgress?.shortlistedIdeas || []);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customIdea, setCustomIdea] = useState({ title: "", desc: "", targetCustomer: "" });
  const [editingIdeaIndex, setEditingIdeaIndex] = useState<number | null>(null);
  const [editingIdea, setEditingIdea] = useState({ title: "", desc: "", targetCustomer: "" });
  const [visibleIdeasCount, setVisibleIdeasCount] = useState(existingProgress?.generatedIdeas?.length || 0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds((prev: number) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // Staggered reveal effect - show ideas one at a time
  useEffect(() => {
    if (isRevealing && visibleIdeasCount < ideas.length) {
      const timer = setTimeout(() => {
        setVisibleIdeasCount((prev: number) => prev + 1);
      }, 150); // 150ms delay between each idea
      return () => clearTimeout(timer);
    }
    if (visibleIdeasCount >= ideas.length && isRevealing) {
      setIsRevealing(false);
    }
  }, [isRevealing, visibleIdeasCount, ideas.length]);

  const generateIdeas = useMutation({
    mutationFn: async () => {
      console.log('[Day1] Starting idea generation with inputs:', inputs);
      const res = await apiRequest("POST", "/api/generate-ideas", inputs);
      const data = await res.json();
      console.log('[Day1] Received response:', data);

      // Check if response is an error object
      if (data.message && !Array.isArray(data)) {
        throw new Error(data.message);
      }

      // Check if we got valid ideas
      if (!Array.isArray(data) || data.length === 0) {
        console.error('[Day1] Invalid response format:', data);
        throw new Error("AI returned invalid data. Please try again.");
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('[Day1] Successfully generated', data.length, 'ideas');
      setIdeas(data);
      setSelectedIdeas([]); // Clear selections on regenerate
      setVisibleIdeasCount(0); // Reset to start reveal from beginning
      setIsRevealing(true); // Start the staggered reveal
      setStep('ideas');
      saveProgress.mutate({ userInputs: inputs, generatedIdeas: data, shortlistedIdeas: [] });
    },
    onError: (error: any) => {
      console.error('[Day1] Idea generation failed:', error);
      toast.error(error.message || "Failed to generate ideas. Please try again.");
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

  const handleRegenerate = () => {
    if (cooldownSeconds > 0) {
      toast.error(`Please wait ${cooldownSeconds} seconds before regenerating`);
      return;
    }
    if (regenerationCount >= 10) {
      toast.error("You've reached the maximum number of regenerations");
      return;
    }
    setRegenerationCount((prev: number) => prev + 1);
    setCooldownSeconds(30);
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
    if (selectedIdeas.length < 1) {
      toast.error("Please select at least 1 idea to continue");
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

  const handleAddManualIdea = () => {
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

    setManualIdeas(prev => [...prev, newIdea]);
    setCustomIdea({ title: "", desc: "", targetCustomer: "" });
    saveProgress.mutate({ manualIdeas: [...manualIdeas, newIdea] });
    toast.success("Idea added!");
  };

  const handleManualIdeasComplete = () => {
    if (manualIdeas.length < 1) {
      toast.error("Please add at least 1 idea to continue");
      return;
    }
    // Auto-select all manual ideas since user entered them deliberately
    const allSelected = manualIdeas.map((_, i) => i);
    setSelectedIdeas(allSelected);
    setIdeas(manualIdeas);
    saveProgress.mutate({
      manualIdeas,
      generatedIdeas: manualIdeas,
      shortlistedIdeas: allSelected,
    });
    setStep('shortlist');
  };

  const startEditingIdea = (index: number) => {
    const idea = ideas[index];
    setEditingIdeaIndex(index);
    setEditingIdea({
      title: idea.title,
      desc: idea.desc,
      targetCustomer: idea.targetCustomer,
    });
  };

  const saveEditedIdea = () => {
    if (editingIdeaIndex === null) return;
    if (!editingIdea.title.trim() || !editingIdea.desc.trim()) {
      toast.error("Please fill in at least the title and description");
      return;
    }

    const updatedIdeas = [...ideas];
    updatedIdeas[editingIdeaIndex] = {
      ...updatedIdeas[editingIdeaIndex],
      title: editingIdea.title.trim(),
      desc: editingIdea.desc.trim(),
      targetCustomer: editingIdea.targetCustomer.trim() || "Your target market",
    };

    setIdeas(updatedIdeas);
    setEditingIdeaIndex(null);
    setEditingIdea({ title: "", desc: "", targetCustomer: "" });

    saveProgress.mutate({
      userInputs: inputs,
      generatedIdeas: updatedIdeas,
      shortlistedIdeas: selectedIdeas,
    });

    toast.success("Idea updated!");
  };

  const cancelEditing = () => {
    setEditingIdeaIndex(null);
    setEditingIdea({ title: "", desc: "", targetCustomer: "" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' };
    if (score >= 3) return { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100' };
    return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' };
  };

  const getTotalScoreColor = (total: number) => {
    if (total >= 20) return { border: 'border-slate-200', bg: 'bg-white', badge: 'bg-green-500 text-white' };
    if (total >= 15) return { border: 'border-slate-200', bg: 'bg-white', badge: 'bg-amber-500 text-white' };
    return { border: 'border-slate-200', bg: 'bg-white', badge: 'bg-slate-400 text-white' };
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

  if (step === 'choice') {
    return (
      <div ref={containerRef} className={ds.section}>
        <div className="text-center mb-8">
          <h2 className={`${ds.heading} mb-2`}>How Would You Like to Start?</h2>
          <p className={ds.muted}>Choose the path that fits your situation best</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setStep('inputs')}
            className={`${ds.optionDefault} text-left hover:border-primary/50 transition-colors`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className={`${ds.label} mb-2`}>Generate Ideas For Me</h3>
                <p className={ds.muted}>
                  Tell us about your skills and interests, and AI will generate 3 personalized SaaS ideas scored against proven criteria.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setStep('manual')}
            className={`${ds.optionDefault} text-left hover:border-primary/50 transition-colors`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className={`${ds.label} mb-2`}>I Already Have Ideas</h3>
                <p className={ds.muted}>
                  Already have SaaS ideas you're considering? Enter them directly and we'll help you validate and choose the best one.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'manual') {
    return (
      <div ref={containerRef} className={ds.section}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className={ds.heading}>Enter Your SaaS Ideas</h2>
            <button
              onClick={() => setStep('choice')}
              className="text-slate-500 hover:text-slate-700 text-sm"
            >
              ← Back to options
            </button>
          </div>
          <p className={ds.muted}>Add the ideas you're considering. We'll help you validate them in Day 2.</p>
        </div>

        {/* Idea entry form */}
        <div className={`${ds.infoBoxHighlight} space-y-4`}>
          <div>
            <label className={`block ${ds.label} mb-1`}>Idea Name *</label>
            <Input
              placeholder="e.g. AI Resume Builder, Freelancer Invoice Tool..."
              value={customIdea.title}
              onChange={(e) => setCustomIdea(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <label className={`block ${ds.label} mb-1`}>Description *</label>
            <Textarea
              placeholder="What does it do? What problem does it solve? Who is it for?"
              value={customIdea.desc}
              onChange={(e) => setCustomIdea(prev => ({ ...prev, desc: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
          <div>
            <label className={`block ${ds.label} mb-1`}>Target Customer (optional)</label>
            <Input
              placeholder="e.g. Freelancers, small business owners, recruiters..."
              value={customIdea.targetCustomer}
              onChange={(e) => setCustomIdea(prev => ({ ...prev, targetCustomer: e.target.value }))}
            />
          </div>
          <Button onClick={handleAddManualIdea} className="gap-2">
            <Plus className="w-4 h-4" /> Add Idea
          </Button>
        </div>

        {/* List of added ideas */}
        {manualIdeas.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className={ds.label}>Your Ideas ({manualIdeas.length} added)</h3>
            {manualIdeas.map((idea, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={ds.optionDefault}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400">#{index + 1}</span>
                      <h4 className={ds.label}>{idea.title}</h4>
                    </div>
                    <p className={`${ds.muted} text-sm`}>{idea.desc}</p>
                    {idea.targetCustomer && idea.targetCustomer !== "Your target market" && (
                      <p className={`${ds.muted} text-sm mt-1`}>
                        <span className="font-medium">Target:</span> {idea.targetCustomer}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const updated = manualIdeas.filter((_, i) => i !== index);
                      setManualIdeas(updated);
                      saveProgress.mutate({ manualIdeas: updated });
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Encouragement & Continue */}
        {manualIdeas.length > 0 && manualIdeas.length < 3 && (
          <p className={`${ds.muted} text-sm mt-6 text-center`}>
            Having 2-3 ideas to compare helps you pick the best one in Day 2, but you can continue with just one if you're confident.
          </p>
        )}

        {manualIdeas.length >= 1 && (
          <Button
            size="lg"
            onClick={handleManualIdeasComplete}
            className="w-full h-14 text-lg font-bold gap-2 mt-4"
          >
            Continue with {manualIdeas.length} {manualIdeas.length === 1 ? 'Idea' : 'Ideas'} <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    );
  }

  if (step === 'inputs') {
    return (
      <div ref={containerRef} className={ds.section}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className={ds.heading}>Let's Find Your Perfect SaaS Idea</h2>
            <button
              onClick={() => setStep('choice')}
              className="text-slate-500 hover:text-slate-700 text-sm"
            >
              ← Back to options
            </button>
          </div>
          <p className={ds.muted}>Tell us about yourself and we'll generate 3 personalized ideas scored against Matt's criteria</p>
        </div>

        <div className="grid gap-6">
          <div>
            <label className={`block ${ds.label} mb-2`}>
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
            <label className={`block ${ds.label} mb-2`}>
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
            <label className={`block ${ds.label} mb-2`}>
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
            <label className={`block ${ds.label} mb-2`}>
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
                Generate 3 SaaS Ideas
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI will create 3 personalized ideas based on your profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div ref={containerRef} className="flex flex-col items-center justify-center py-16 space-y-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="text-center space-y-3">
          <h3 className={`${ds.heading} mb-2`}>Generating 3 Personalized Ideas...</h3>
          <p className={ds.muted}>AI is analyzing your profile and scoring each idea against 5 criteria</p>
          <p className="text-sm text-amber-600 font-medium">This can take up to 2 minutes - please don't refresh!</p>
        </div>
      </div>
    );
  }

  if (step === 'ideas' || step === 'shortlist') {
    const showConfirmation = step === 'shortlist';

    return (
      <div ref={containerRef} className={ds.section}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={ds.heading}>
              {showConfirmation ? `Your Top ${selectedIdeas.length} ${selectedIdeas.length === 1 ? 'Idea' : 'Ideas'}` : "Your 3 Ideas"}
            </h2>
            <p className={ds.muted}>
              {showConfirmation
                ? "These ideas will carry through to Day 2 for validation"
                : `${selectedIdeas.length} selected - Pick the ideas that excite you most`}
            </p>
          </div>
          {!showConfirmation && selectedIdeas.length >= 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleConfirmShortlist}
                    className="gap-2"
                    data-testid="button-confirm-shortlist"
                  >
                    Confirm Selection <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lock in your favorite ideas</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Regenerate button */}
        {!showConfirmation && regenerationCount < 10 && (
          <div className={`${ds.infoBoxHighlight} flex items-center justify-between`}>
            <div>
              <p className={ds.label}>Not feeling these ideas?</p>
              <p className={`${ds.muted} text-sm`}>
                {cooldownSeconds > 0
                  ? `Wait ${cooldownSeconds}s before regenerating...`
                  : "Generate 3 completely new ideas"}
              </p>
              {regenerationCount >= 5 && (
                <p className="text-amber-600 text-sm mt-1">
                  {10 - regenerationCount} regenerations remaining
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={cooldownSeconds > 0 || generateIdeas.isPending}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : "Regenerate"}
            </Button>
          </div>
        )}

        {!showConfirmation && (
          <div className={`${ds.infoBoxHighlight} border-dashed`}>
            {showCustomForm ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={ds.label}>Add Your Own Idea</h3>
                </div>
                <div>
                  <label className={`block ${ds.label} mb-1`}>Idea Name</label>
                  <Input
                    placeholder="e.g. AI Resume Builder"
                    value={customIdea.title}
                    onChange={(e) => setCustomIdea(prev => ({ ...prev, title: e.target.value }))}
                    data-testid="input-custom-title"
                  />
                </div>
                <div>
                  <label className={`block ${ds.label} mb-1`}>Description</label>
                  <Textarea
                    placeholder="What does your idea do? What problem does it solve?"
                    value={customIdea.desc}
                    onChange={(e) => setCustomIdea(prev => ({ ...prev, desc: e.target.value }))}
                    className="min-h-[60px]"
                    data-testid="input-custom-desc"
                  />
                </div>
                <div>
                  <label className={`block ${ds.label} mb-1`}>Target Customer (optional)</label>
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
          </div>
        )}

        {/* Show loading indicator while revealing */}
        {isRevealing && visibleIdeasCount < ideas.length && (
          <div className="flex items-center gap-3 text-slate-500 py-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading ideas... ({visibleIdeasCount}/{ideas.length})</span>
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {(showConfirmation
              ? ideas.filter((_, i) => selectedIdeas.includes(i))
              : ideas.slice(0, visibleIdeasCount)
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
                  {/* Editing mode for this idea */}
                  {showConfirmation && editingIdeaIndex === actualIndex ? (
                    <div className={`${ds.cardWithPadding} border-primary`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={ds.label}>Edit Idea</h3>
                        <button
                          onClick={cancelEditing}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className={`block ${ds.label} mb-1`}>Idea Name</label>
                          <Input
                            value={editingIdea.title}
                            onChange={(e) => setEditingIdea(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className={`block ${ds.label} mb-1`}>Description</label>
                          <Textarea
                            value={editingIdea.desc}
                            onChange={(e) => setEditingIdea(prev => ({ ...prev, desc: e.target.value }))}
                            className="min-h-[80px]"
                          />
                        </div>
                        <div>
                          <label className={`block ${ds.label} mb-1`}>Target Customer</label>
                          <Input
                            value={editingIdea.targetCustomer}
                            onChange={(e) => setEditingIdea(prev => ({ ...prev, targetCustomer: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={saveEditedIdea} className="gap-2">
                            <Check className="w-4 h-4" /> Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={isSelected ? ds.optionSelected : ds.optionDefault}
                      onClick={() => !showConfirmation && toggleIdeaSelection(actualIndex)}
                      data-testid={`idea-card-${actualIndex}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={ds.muted}>#{actualIndex + 1}</span>
                            <h3 className={ds.label}>{idea.title}</h3>
                            <span className={`px-3 py-1 ${scoreColors.badge} text-sm font-bold rounded-full`}>
                              {idea.totalScore}/25
                            </span>
                            {showConfirmation && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingIdea(actualIndex);
                                }}
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                                title="Edit this idea"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className={`${ds.muted} mb-3`}>{idea.desc}</p>
                          <p className={`${ds.muted} mb-3`}>
                            <span className="font-medium">Target:</span> {idea.targetCustomer}
                          </p>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            <ScoreBar label="Market Demand" score={idea.scores.marketDemand} />
                            <ScoreBar label="Skill Match" score={idea.scores.skillMatch} />
                            <ScoreBar label="Passion Fit" score={idea.scores.passionFit} />
                            <ScoreBar label="Speed to MVP" score={idea.scores.speedToMvp} />
                            <ScoreBar label="Monetization" score={idea.scores.monetization} />
                          </div>

                          <p className={`${ds.muted} mt-3 italic`}>"{idea.whyThisWorks}"</p>
                        </div>

                        {!showConfirmation && (
                          <div className={isSelected ? ds.checkSelected : ds.checkDefault}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!showConfirmation && selectedIdeas.length >= 1 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  onClick={handleConfirmShortlist}
                  className="w-full h-14 text-lg font-bold gap-2"
                  data-testid="button-confirm-shortlist-bottom"
                >
                  Confirm Selection ({selectedIdeas.length} {selectedIdeas.length === 1 ? 'idea' : 'ideas'}) <ChevronRight className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lock in your favorite ideas and proceed</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {showConfirmation && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep('ideas')}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Change Selection
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold gap-2"
              onClick={() => {
                console.log('[Day1] Complete Day 1 button clicked');
                onComplete();
              }}
              data-testid="button-complete-day1"
            >
              Complete Day 1 <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
