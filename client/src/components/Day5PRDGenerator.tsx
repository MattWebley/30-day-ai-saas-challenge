import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
import { FileText, Copy, ChevronRight, ExternalLink, Sparkles, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Day5Props {
  onComplete: () => void;
}

export function Day5PRDGenerator({ onComplete }: Day5Props) {
  const queryClient = useQueryClient();
  const { testMode } = useTestMode();
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedPRD, setGeneratedPRD] = useState("");
  const [prdCopied, setPrdCopied] = useState(false);
  const [replitStarted, setReplitStarted] = useState(false);

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
  const day4Progress = allProgress?.find((p: any) => p.day === 4);

  const shortlistedIdeas = day1Progress?.generatedIdeas?.filter((_: any, i: number) =>
    day1Progress?.shortlistedIdeas?.includes(i)
  ) || [];

  const chosenIdeaIndex = day2Progress?.userInputs?.chosenIdea;
  const chosenIdea = chosenIdeaIndex !== undefined && shortlistedIdeas[chosenIdeaIndex]
    ? shortlistedIdeas[chosenIdeaIndex]
    : null;

  const day3Data = day3Progress?.userInputs || {};
  const aiTool = day4Progress?.userInputs?.aiTool || 'chatgpt';

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day5", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const buildPRDPrompt = () => {
    return `You are a senior product manager. Create a comprehensive Product Requirements Document (PRD) for this SaaS product.

PRODUCT INFORMATION:
- Product Name: ${chosenIdea?.title || 'TBD'}
- Description: ${chosenIdea?.desc || ''}
- Target Customer: ${chosenIdea?.targetCustomer || day3Data.who || ''}

PROBLEM & SOLUTION:
- Bleeding Neck Problem: ${day3Data.bleedingNeckProblem || ''}
- 10-Second Pitch: ${day3Data.finalPitch || ''}

FEATURES:
Core Features (Must Have):
${(day3Data.coreFeatures || []).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

Unique Features (Our USP):
${(day3Data.uspFeatures || []).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

IDEAL CUSTOMER:
${day3Data.icpDescription || ''}

---

Create a detailed PRD with these sections:

## 1. Product Overview
- Brief product summary
- Problem being solved
- Target audience

## 2. User Personas
- Detailed ideal customer profile
- Use cases and scenarios

## 3. Features & Requirements
For each feature (both core and USP), provide:
- Feature name
- User story (As a [user], I want [feature] so that [benefit])
- Acceptance criteria
- Priority (Must Have / Should Have / Nice to Have)

## 4. User Flow
- Step-by-step user journey from signup to achieving their goal
- Key screens and interactions

## 5. Technical Requirements
- Recommended tech stack (suggest modern, beginner-friendly stack)
- Database schema suggestions
- API endpoints needed
- Third-party integrations

## 6. MVP Scope
- What's included in the MVP (first version)
- What's deferred to v2

## 7. Success Metrics
- Key metrics to track
- Definition of success

Make it detailed, actionable, and ready for a developer (or Replit Agent) to build from.`;
  };

  const copyPRDPrompt = () => {
    const prompt = buildPRDPrompt();
    navigator.clipboard.writeText(prompt);
    setPrdCopied(true);
    toast.success("PRD prompt copied! Paste it into your AI tool.");
    setTimeout(() => setPrdCopied(false), 3000);
  };

  const copyGeneratedPRD = () => {
    navigator.clipboard.writeText(generatedPRD);
    toast.success("PRD copied! Now paste it into Replit Agent.");
  };

  const handleComplete = () => {
    saveProgress.mutate({
      prdGenerated: true,
      prdContent: generatedPRD,
      replitStarted: replitStarted,
    });
    onComplete();
  };

  if (!chosenIdea || !day3Data.bleedingNeckProblem) {
    return (
      <Card className="p-8 border-2 border-amber-200 bg-amber-50 text-center">
        <FileText className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Days 2-4 First!</h3>
        <p className="text-slate-600">
          You need to complete your product definition and tool setup before generating your PRD.
        </p>
      </Card>
    );
  }

  const aiToolNames: Record<string, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    abacus: 'Abacus AI'
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Your PRD & Start Building</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Create a complete Product Requirements Document and give it to Replit Agent to start building.
        </p>
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Step 1: Copy Prompt */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-lg text-slate-900">Copy the PRD Prompt</h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              We've created a detailed prompt with all your product information. Copy it to your clipboard:
            </p>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={copyPRDPrompt}
              data-testid="button-copy-prompt"
            >
              <Copy className="w-4 h-4" />
              {prdCopied ? 'Copied!' : 'Copy PRD Prompt'}
            </Button>

            {prdCopied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700"
              >
                <Check className="w-4 h-4" />
                Prompt copied! Proceed to step 2.
              </motion.div>
            )}
          </Card>

          {/* Step 2: Generate in AI */}
          <Card className="p-6 border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-lg text-slate-900">Generate PRD in {aiToolNames[aiTool]}</h3>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">1.</span>
                <div className="flex-1">
                  <span>Open {aiToolNames[aiTool]}:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 ml-2"
                    onClick={() => {
                      const urls: Record<string, string> = {
                        chatgpt: 'https://chat.openai.com',
                        claude: 'https://claude.ai',
                        abacus: 'https://abacus.ai'
                      };
                      window.open(urls[aiTool], '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open {aiToolNames[aiTool]}
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">2.</span>
                <span>Paste the prompt you copied from Step 1</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">3.</span>
                <span>Wait for {aiToolNames[aiTool]} to generate your complete PRD (1-2 minutes)</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">4.</span>
                <span>Copy the entire PRD response</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900">5.</span>
                <span>Paste it in the box below:</span>
              </div>
            </div>

            <Textarea
              placeholder="Paste your generated PRD here..."
              value={generatedPRD}
              onChange={(e) => setGeneratedPRD(e.target.value)}
              className="min-h-[200px] font-mono text-xs mt-4"
              data-testid="textarea-prd"
            />

            <Button
              size="lg"
              className="w-full mt-4 gap-2"
              onClick={() => setCurrentStep(2)}
              disabled={!generatedPRD.trim()}
              data-testid="button-next-step"
            >
              Next: Start Building in Replit <ChevronRight className="w-5 h-5" />
            </Button>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          {/* PRD Preview */}
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-green-900">Your PRD is Ready!</h3>
            </div>
            <p className="text-sm text-green-700 mb-4">
              You have a complete Product Requirements Document. Now let's give it to Replit Agent to build.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={copyGeneratedPRD}
            >
              <Copy className="w-3 h-3" />
              Copy PRD Again
            </Button>
          </Card>

          {/* Replit Instructions */}
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-blue-900 text-lg">Start Building with Replit Agent</h3>
            </div>

            <div className="space-y-4 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-900">1.</span>
                <div className="flex-1">
                  <span>Go to Replit and start a new project:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 ml-2 mt-2"
                    onClick={() => window.open('https://replit.com/new', '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Create New Replit
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-900">2.</span>
                <span>Open Replit Agent (look for the Agent button or press Ctrl+I / Cmd+I)</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-900">3.</span>
                <div className="flex-1">
                  <span>Paste this exact message to Agent:</span>
                  <div className="mt-2 p-3 bg-white border border-blue-200 rounded font-mono text-xs">
                    Build this SaaS product based on this PRD:<br/><br/>
                    [PASTE YOUR PRD HERE]
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-900">4.</span>
                <span>Watch Replit Agent start building your MVP! 🎉</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-900">5.</span>
                <span>Once Agent starts working, check the box below:</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <button
                onClick={() => setReplitStarted(!replitStarted)}
                className="flex items-center gap-3"
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  replitStarted ? 'bg-blue-600 border-blue-600' : 'border-blue-300 hover:border-blue-400'
                }`}>
                  {replitStarted && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-medium text-blue-900">
                  Replit Agent is building my product!
                </span>
              </button>
            </div>
          </Card>

          {/* Warning */}
          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-bold mb-1">Important:</p>
                <p>Replit Agent will take 30-60 minutes to build your MVP. You don't need to stay and watch! Check back later and see the magic.</p>
              </div>
            </div>
          </Card>

          {replitStarted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleComplete}
                data-testid="button-complete-day5"
              >
                <Check className="w-5 h-5" />
                Complete Day 5 - My MVP is Being Built!
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
