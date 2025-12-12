import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
import { Sparkles, Loader2, Check, ArrowRight, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Screen {
  name: string;
  purpose: string;
  keyElements: string[];
}

interface UserFlow {
  steps: string[];
  reasoning: string;
}

interface Day4Props {
  onComplete: () => void;
}

const MOCK_DATA = {
  chosenIdea: { title: "AI Content Optimizer" },
  coreFeatures: ["Content editor", "AI suggestions", "Analytics dashboard"],
  uspFeatures: ["Smart A/B testing", "Competitor analysis"],
  icp: "Solo content creators who post 3+ times per week",
};

export function Day4WorkflowBuilder({ onComplete }: Day4Props) {
  const queryClient = useQueryClient();
  const { testMode } = useTestMode();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAttempts, setAiAttempts] = useState(0);
  const MAX_AI_ATTEMPTS = 3;

  const [screens, setScreens] = useState<Screen[]>([]);
  const [userFlow, setUserFlow] = useState<UserFlow | null>(null);
  const [editingScreen, setEditingScreen] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

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
  const icp = testMode ? MOCK_DATA.icp : (day3Progress?.userInputs?.icp || "");

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day4", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const generateAppFlow = async () => {
    if (aiAttempts >= MAX_AI_ATTEMPTS) return;
    setAiAttempts(prev => prev + 1);
    setIsGenerating(true);

    try {
      const allFeatures = [...coreFeatures, ...uspFeatures];
      
      const prompt = `You are designing the MVP for an AI SaaS app. Think carefully about what screens this specific product needs.

PRODUCT: "${chosenIdea?.title}"
TARGET USER: ${icp || "Busy professionals who need quick results"}
CORE FEATURES: ${coreFeatures.join(', ')}
UNIQUE FEATURES: ${uspFeatures.join(', ')}

Based on these SPECIFIC features and this SPECIFIC user, design the minimum screens needed for a working MVP.

Rules:
- Only include screens that directly support the listed features
- Think about what THIS specific user needs, not generic SaaS screens
- Maximum 4-5 screens for MVP
- Each screen must have a clear purpose tied to a feature

For each screen, provide:
1. Screen name (short, descriptive)
2. Purpose (one sentence explaining why this screen exists)
3. Key elements (3-4 main things on this screen)

Also describe the user flow - the order a new user would go through these screens.

Format your response EXACTLY like this:
SCREEN1_NAME: [name]
SCREEN1_PURPOSE: [purpose]
SCREEN1_ELEMENTS: [element1, element2, element3]

SCREEN2_NAME: [name]
SCREEN2_PURPOSE: [purpose]
SCREEN2_ELEMENTS: [element1, element2, element3]

(continue for each screen)

FLOW_STEPS: [screen1 name, screen2 name, ...]
FLOW_REASONING: [One sentence explaining why this order makes sense for your target user]`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const response = data.response;

      const parsedScreens: Screen[] = [];
      for (let i = 1; i <= 6; i++) {
        const nameMatch = response.match(new RegExp(`SCREEN${i}_NAME:\\s*(.+)`));
        const purposeMatch = response.match(new RegExp(`SCREEN${i}_PURPOSE:\\s*(.+)`));
        const elementsMatch = response.match(new RegExp(`SCREEN${i}_ELEMENTS:\\s*(.+)`));

        if (nameMatch && purposeMatch && elementsMatch) {
          parsedScreens.push({
            name: nameMatch[1].trim(),
            purpose: purposeMatch[1].trim(),
            keyElements: elementsMatch[1].split(',').map((e: string) => e.trim()),
          });
        }
      }

      const flowStepsMatch = response.match(/FLOW_STEPS:\s*(.+)/);
      const flowReasoningMatch = response.match(/FLOW_REASONING:\s*(.+)/);

      const parsedFlow: UserFlow = {
        steps: flowStepsMatch ? flowStepsMatch[1].split(',').map((s: string) => s.trim()) : parsedScreens.map(s => s.name),
        reasoning: flowReasoningMatch ? flowReasoningMatch[1].trim() : "This flow guides users from setup to value delivery.",
      };

      if (parsedScreens.length === 0) {
        toast.error("Couldn't parse AI response. Please try again.");
      } else {
        setScreens(parsedScreens);
        setUserFlow(parsedFlow);
      }
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGenerating(false);
  };

  const handleEditScreen = (index: number, newName: string) => {
    const updated = [...screens];
    updated[index] = { ...updated[index], name: newName };
    setScreens(updated);
    setEditingScreen(null);
  };

  const handleRemoveScreen = (index: number) => {
    setScreens(screens.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    saveProgress.mutate({ 
      screens,
      userFlow,
    });
    onComplete();
  };

  if (!chosenIdea) {
    return (
      <Card className="p-8 border-2 border-slate-200 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Previous Days First</h3>
        <p className="text-slate-600">
          You need to complete Days 1-3 before planning your app screens.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 border border-slate-200 bg-slate-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Building:</p>
            <p className="font-bold text-slate-900">{chosenIdea.title}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">For:</p>
            <p className="text-slate-700">{icp || "Your target user"}</p>
          </div>
        </div>
        {(coreFeatures.length > 0 || uspFeatures.length > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Features to support:</p>
            <div className="flex flex-wrap gap-1">
              {[...coreFeatures, ...uspFeatures].map((f, i) => (
                <span key={i} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <AnimatePresence mode="wait">
        {screens.length === 0 ? (
          <motion.div
            key="generate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <path d="M10 6.5h4M17.5 10v4M14 17.5h-4M6.5 14v-4" strokeDasharray="2 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Design Your App Screens</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                AI will analyze your features and target user to recommend the exact screens your MVP needs.
              </p>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={generateAppFlow}
                      disabled={isGenerating || aiAttempts >= MAX_AI_ATTEMPTS}
                      data-testid="button-generate-screens"
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing your product...</>
                      ) : (
                        <><Sparkles className="w-5 h-5" /> Design My App Screens</>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>AI designs screens based on YOUR features and users</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {aiAttempts > 0 && aiAttempts < MAX_AI_ATTEMPTS && (
                <p className="text-xs text-slate-400 mt-2">{MAX_AI_ATTEMPTS - aiAttempts} attempts remaining</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">1</span>
                Your MVP Screens
              </h3>
              <div className="space-y-3">
                {screens.map((screen, i) => (
                  <Card key={i} className="p-4 border-2 border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      {editingScreen === i ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditScreen(i, editValue)}
                          onKeyDown={(e) => e.key === 'Enter' && handleEditScreen(i, editValue)}
                          className="font-bold text-slate-900 border-b-2 border-black outline-none bg-transparent"
                          autoFocus
                        />
                      ) : (
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs">{i + 1}</span>
                          {screen.name}
                        </h4>
                      )}
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => { setEditingScreen(i); setEditValue(screen.name); }}
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Edit screen name</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {screens.length > 2 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleRemoveScreen(i)}
                                  className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Remove screen</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{screen.purpose}</p>
                    <div className="flex flex-wrap gap-1">
                      {screen.keyElements.map((el, j) => (
                        <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{el}</span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {userFlow && (
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">2</span>
                  User Flow
                </h3>
                <Card className="p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                    {userFlow.steps.map((step, i) => (
                      <React.Fragment key={i}>
                        <div className="flex-shrink-0 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium">
                          {step}
                        </div>
                        {i < userFlow.steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 italic">{userFlow.reasoning}</p>
                </Card>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {aiAttempts < MAX_AI_ATTEMPTS && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={generateAppFlow}
                        disabled={isGenerating}
                      >
                        <Sparkles className="w-4 h-4" /> Regenerate{aiAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Get a fresh set of screen recommendations</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2 bg-green-600 hover:bg-green-700 ml-auto"
                      onClick={handleFinish}
                      data-testid="button-finish"
                    >
                      <Check className="w-5 h-5" /> Complete Day 4
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save your app screens and complete Day 4</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
