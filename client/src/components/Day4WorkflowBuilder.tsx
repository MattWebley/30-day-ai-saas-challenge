import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
import { Sparkles, Loader2, ChevronRight, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ScreenIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    landing: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="5" y="5" width="14" height="4" rx="1" />
        <circle cx="8" cy="14" r="2" />
        <path d="M12 12h5M12 16h5" />
      </svg>
    ),
    signup: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="6" y="8" width="12" height="2" rx="1" />
        <rect x="6" y="12" width="12" height="2" rx="1" />
        <rect x="8" y="17" width="8" height="2" rx="1" />
      </svg>
    ),
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="5" y="5" width="6" height="6" rx="1" />
        <rect x="13" y="5" width="6" height="3" rx="1" />
        <rect x="13" y="10" width="6" height="3" rx="1" />
        <rect x="5" y="13" width="14" height="6" rx="1" />
      </svg>
    ),
    list: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M6 8h12M6 12h12M6 16h8" />
        <circle cx="18" cy="8" r="1" fill="currentColor" />
        <circle cx="18" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
    detail: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="5" y="5" width="14" height="6" rx="1" />
        <path d="M5 14h10M5 17h6" />
      </svg>
    ),
    form: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M6 7h6M6 11h12M6 15h12" />
        <rect x="6" y="18" width="4" height="2" rx="0.5" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="9" r="2" />
        <path d="M6 15h4M14 15h4" />
        <circle cx="10" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
    pricing: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="5" y="6" width="4" height="10" rx="1" />
        <rect x="10" y="5" width="4" height="12" rx="1" />
        <rect x="15" y="7" width="4" height="9" rx="1" />
      </svg>
    ),
    checkout: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="5" y="6" width="6" height="4" rx="1" />
        <rect x="5" y="12" width="14" height="2" rx="0.5" />
        <rect x="5" y="16" width="14" height="2" rx="0.5" />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="9" r="3" />
        <path d="M6 18c0-3 3-4 6-4s6 1 6 4" />
      </svg>
    ),
    results: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 14l3-3 3 3 4-5" />
        <circle cx="17" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 12h8M8 8h4M8 16h6" />
        <circle cx="16" cy="8" r="2" />
      </svg>
    ),
  };
  return icons[type] || icons.landing;
};

interface ScreenTemplate {
  id: string;
  name: string;
  description: string;
  category: 'essential' | 'growth' | 'advanced';
  type: string;
}

const SCREEN_TEMPLATES: ScreenTemplate[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Main hub with overview and quick actions', category: 'essential', type: 'dashboard' },
  { id: 'list', name: 'List View', description: 'Browse, search, and filter your data', category: 'essential', type: 'list' },
  { id: 'detail', name: 'Detail View', description: 'View a single item with full info', category: 'essential', type: 'detail' },
  { id: 'form', name: 'Create/Edit', description: 'Add new items or update existing ones', category: 'essential', type: 'form' },
  { id: 'ai', name: 'AI Generation', description: 'Input screen for AI-powered features', category: 'essential', type: 'ai' },
  { id: 'results', name: 'Results / Output', description: 'Display AI results or generated content', category: 'essential', type: 'results' },
  { id: 'settings', name: 'Settings', description: 'User preferences and configurations', category: 'growth', type: 'settings' },
  { id: 'profile', name: 'Account / Profile', description: 'User account and subscription info', category: 'growth', type: 'profile' },
  { id: 'history', name: 'History / Saved', description: 'Past generations or saved items', category: 'growth', type: 'list' },
  { id: 'onboarding', name: 'Onboarding', description: 'First-time user setup wizard', category: 'growth', type: 'form' },
  { id: 'compare', name: 'Compare / Analyze', description: 'Side-by-side comparison view', category: 'advanced', type: 'results' },
  { id: 'export', name: 'Export / Share', description: 'Download or share your results', category: 'advanced', type: 'detail' },
];

interface WorkflowOption {
  id: string;
  name: string;
  description: string;
  screens: string[];
}

const MOCK_DATA = {
  chosenIdea: { title: "AI Content Optimizer" },
  coreFeatures: ["Content editor", "AI suggestions"],
  uspFeatures: ["Smart A/B testing"],
};

interface Day4Props {
  onComplete: () => void;
}

export function Day4WorkflowBuilder({ onComplete }: Day4Props) {
  const queryClient = useQueryClient();
  const { testMode } = useTestMode();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAttempts, setAiAttempts] = useState(0);
  const MAX_AI_ATTEMPTS = 3;

  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [workflowOptions, setWorkflowOptions] = useState<WorkflowOption[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [customFlow, setCustomFlow] = useState<string[]>([]);

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

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day4", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const toggleScreen = (screenId: string) => {
    setSelectedScreens(prev => 
      prev.includes(screenId) 
        ? prev.filter(id => id !== screenId)
        : [...prev, screenId]
    );
  };

  const generateWorkflowOptions = async () => {
    if (aiAttempts >= MAX_AI_ATTEMPTS) return;
    setAiAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const selectedScreenNames = selectedScreens.map(id => 
        SCREEN_TEMPLATES.find(s => s.id === id)?.name
      ).filter(Boolean);

      const prompt = `I'm building: "${chosenIdea?.title}"
Core features: ${coreFeatures.join(', ')}
USP features: ${uspFeatures.join(', ')}

The user has selected these screens for their MVP: ${selectedScreenNames.join(', ')}

Create 3 different user flow options showing how these screens connect. Each flow should represent a different approach:
1. "Simple Flow" - Minimal steps, fastest to build
2. "Standard Flow" - Balanced approach for most users
3. "Full Flow" - Complete experience with all features

For each flow:
- Give it a catchy name
- Write a one-sentence description of the approach
- List the screens in order of the user journey (use exact screen names from the list above)

Format your response EXACTLY like this:
FLOW1_NAME: [name]
FLOW1_DESC: [description]
FLOW1_SCREENS: [screen1, screen2, screen3...]

FLOW2_NAME: [name]
FLOW2_DESC: [description]
FLOW2_SCREENS: [screen1, screen2, screen3...]

FLOW3_NAME: [name]
FLOW3_DESC: [description]
FLOW3_SCREENS: [screen1, screen2, screen3...]`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const response = data.response;

      const flows: WorkflowOption[] = [];
      for (let i = 1; i <= 3; i++) {
        const nameMatch = response.match(new RegExp(`FLOW${i}_NAME:\\s*(.+)`));
        const descMatch = response.match(new RegExp(`FLOW${i}_DESC:\\s*(.+)`));
        const screensMatch = response.match(new RegExp(`FLOW${i}_SCREENS:\\s*(.+)`));

        if (nameMatch && descMatch && screensMatch) {
          const screenNames = screensMatch[1].split(',').map((s: string) => s.trim());
          const screenIds = screenNames.map((name: string) => {
            const template = SCREEN_TEMPLATES.find(t => 
              t.name.toLowerCase().includes(name.toLowerCase()) || 
              name.toLowerCase().includes(t.name.toLowerCase())
            );
            return template?.id;
          }).filter(Boolean);

          flows.push({
            id: `flow${i}`,
            name: nameMatch[1].trim(),
            description: descMatch[1].trim(),
            screens: screenIds.length > 0 ? screenIds : selectedScreens.slice(0, 4),
          });
        }
      }

      if (flows.length === 0) {
        flows.push(
          { id: 'simple', name: 'Quick MVP', description: 'Get to market fast with core screens only', screens: selectedScreens.slice(0, 3) },
          { id: 'standard', name: 'Standard Flow', description: 'Balanced approach for most users', screens: selectedScreens.slice(0, 5) },
          { id: 'full', name: 'Complete Experience', description: 'Full featured user journey', screens: selectedScreens },
        );
      }

      setWorkflowOptions(flows);
    } catch {
      toast.error("Failed to generate. Try again.");
      setWorkflowOptions([
        { id: 'simple', name: 'Quick MVP', description: 'Get to market fast with core screens only', screens: selectedScreens.slice(0, 3) },
        { id: 'standard', name: 'Standard Flow', description: 'Balanced approach for most users', screens: selectedScreens.slice(0, 5) },
        { id: 'full', name: 'Complete Experience', description: 'Full featured user journey', screens: selectedScreens },
      ]);
    }
    setIsGenerating(false);
  };

  const handleSelectWorkflow = (index: number) => {
    setSelectedWorkflow(index);
    setCustomFlow(workflowOptions[index].screens);
  };

  const handleFinish = () => {
    const finalScreens = customFlow.length > 0 ? customFlow : selectedScreens;
    const screenDetails = finalScreens.map(id => {
      const template = SCREEN_TEMPLATES.find(t => t.id === id);
      return template ? { id: template.id, name: template.name, description: template.description } : null;
    }).filter(Boolean);

    saveProgress.mutate({ 
      selectedScreens: finalScreens,
      screenDetails,
      workflowName: selectedWorkflow !== null ? workflowOptions[selectedWorkflow]?.name : 'Custom',
    });
    onComplete();
  };

  if (!chosenIdea) {
    return (
      <Card className="p-8 border-2 border-slate-200 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Previous Days First</h3>
        <p className="text-slate-600">
          You need to complete Days 1-3 before planning your workflow.
        </p>
      </Card>
    );
  }

  const essentialScreens = SCREEN_TEMPLATES.filter(s => s.category === 'essential');
  const growthScreens = SCREEN_TEMPLATES.filter(s => s.category === 'growth');
  const advancedScreens = SCREEN_TEMPLATES.filter(s => s.category === 'advanced');

  return (
    <div className="space-y-6">
      <Card className="p-4 border border-slate-200 bg-slate-50">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Building:</p>
        <h3 className="font-bold text-slate-900">{chosenIdea.title}</h3>
      </Card>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <path d="M10 6.5h4M17.5 10v4M14 17.5h-4M6.5 14v-4" strokeDasharray="2 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Plan Your App Screens</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                Select which screens your MVP needs. Start simple - you can always add more later.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">1</span>
                  Core App Screens
                  <span className="text-xs font-normal text-slate-500">(Pick at least 3 for your MVP)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {essentialScreens.map(screen => (
                    <button
                      key={screen.id}
                      onClick={() => toggleScreen(screen.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        selectedScreens.includes(screen.id)
                          ? 'border-black bg-black text-white'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`mb-2 ${selectedScreens.includes(screen.id) ? 'text-white' : 'text-slate-700'}`}>
                        <ScreenIcon type={screen.type} />
                      </div>
                      <p className={`font-bold text-sm ${selectedScreens.includes(screen.id) ? 'text-white' : 'text-slate-900'}`}>
                        {screen.name}
                      </p>
                      <p className={`text-xs mt-1 ${selectedScreens.includes(screen.id) ? 'text-slate-300' : 'text-slate-500'}`}>
                        {screen.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                  Nice-to-Have Screens
                  <span className="text-xs font-normal text-slate-500">(Add later once core works)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {growthScreens.map(screen => (
                    <button
                      key={screen.id}
                      onClick={() => toggleScreen(screen.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        selectedScreens.includes(screen.id)
                          ? 'border-black bg-black text-white'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`mb-2 ${selectedScreens.includes(screen.id) ? 'text-white' : 'text-slate-700'}`}>
                        <ScreenIcon type={screen.type} />
                      </div>
                      <p className={`font-bold text-sm ${selectedScreens.includes(screen.id) ? 'text-white' : 'text-slate-900'}`}>
                        {screen.name}
                      </p>
                      <p className={`text-xs mt-1 ${selectedScreens.includes(screen.id) ? 'text-slate-300' : 'text-slate-500'}`}>
                        {screen.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">3</span>
                  Extra Features
                  <span className="text-xs font-normal text-slate-500">(Consider for v2)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {advancedScreens.map(screen => (
                    <button
                      key={screen.id}
                      onClick={() => toggleScreen(screen.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        selectedScreens.includes(screen.id)
                          ? 'border-black bg-black text-white'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`mb-2 ${selectedScreens.includes(screen.id) ? 'text-white' : 'text-slate-700'}`}>
                        <ScreenIcon type={screen.type} />
                      </div>
                      <p className={`font-bold text-sm ${selectedScreens.includes(screen.id) ? 'text-white' : 'text-slate-900'}`}>
                        {screen.name}
                      </p>
                      <p className={`text-xs mt-1 ${selectedScreens.includes(screen.id) ? 'text-slate-300' : 'text-slate-500'}`}>
                        {screen.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Card className="p-4 border-2 border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{selectedScreens.length} screens selected</p>
                  <p className="text-sm text-slate-500">
                    {selectedScreens.length < 3 ? 'Select at least 3 screens to continue' : 'Great selection for an MVP!'}
                  </p>
                </div>
                {selectedScreens.length >= 3 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedScreens.slice(0, 4).map(id => {
                      const screen = SCREEN_TEMPLATES.find(s => s.id === id);
                      return (
                        <span key={id} className="text-xs bg-black text-white px-2 py-1 rounded-full">
                          {screen?.name}
                        </span>
                      );
                    })}
                    {selectedScreens.length > 4 && (
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                        +{selectedScreens.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => {
                        setCurrentStep(2);
                        if (workflowOptions.length === 0) {
                          generateWorkflowOptions();
                        }
                      }}
                      disabled={selectedScreens.length < 3}
                      data-testid="button-next-step1"
                    >
                      Create Your Flow <ChevronRight className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Continue to arrange your screens into a user flow</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                  <path d="M7 12h3M14 12h3" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your User Flow</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                Pick how users will navigate through your app. AI generated 3 options for you.
              </p>
            </div>

            {isGenerating ? (
              <Card className="p-8 border-2 border-slate-200 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
                <p className="font-medium text-slate-600">Creating workflow options...</p>
              </Card>
            ) : workflowOptions.length > 0 ? (
              <div className="space-y-4">
                {workflowOptions.map((flow, i) => (
                  <button
                    key={flow.id}
                    onClick={() => handleSelectWorkflow(i)}
                    className={`w-full p-5 rounded-lg border-2 text-left transition-all cursor-pointer ${
                      selectedWorkflow === i
                        ? 'border-black bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedWorkflow === i ? 'border-black bg-black' : 'border-slate-300'
                          }`}>
                            {selectedWorkflow === i && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <h4 className="font-bold text-slate-900">{flow.name}</h4>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 ml-8">{flow.description}</p>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {flow.screens.length} screens
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-8 overflow-x-auto pb-2">
                      {flow.screens.map((screenId, idx) => {
                        const screen = SCREEN_TEMPLATES.find(s => s.id === screenId);
                        return (
                          <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                            <div className={`p-2 rounded-lg border ${
                              selectedWorkflow === i ? 'border-black bg-white' : 'border-slate-200 bg-slate-50'
                            }`}>
                              <ScreenIcon type={screen?.type || 'landing'} />
                              <p className="text-xs font-medium text-center mt-1 max-w-[60px] truncate">{screen?.name}</p>
                            </div>
                            {idx < flow.screens.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </button>
                ))}

                {aiAttempts < MAX_AI_ATTEMPTS && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={generateWorkflowOptions}
                          disabled={isGenerating}
                        >
                          <Sparkles className="w-4 h-4" /> Generate New Options{aiAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>AI will create 3 new workflow options</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ) : (
              <Card className="p-6 border-2 border-slate-200 text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="gap-2"
                        onClick={generateWorkflowOptions}
                        disabled={isGenerating || aiAttempts >= MAX_AI_ATTEMPTS}
                      >
                        {isGenerating ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Generate Workflow Options</>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI creates 3 different user flow options</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Card>
            )}

            <div className="flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to select screens</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={handleFinish}
                      disabled={selectedWorkflow === null}
                      data-testid="button-finish"
                    >
                      <Check className="w-5 h-5" /> Complete Day 4
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save your workflow and complete Day 4</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
