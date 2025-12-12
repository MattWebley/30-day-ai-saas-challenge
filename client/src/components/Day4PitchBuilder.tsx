import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
import { Sparkles, Loader2, ChevronRight, ChevronLeft, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MOCK_DATA = {
  chosenIdea: { title: "AI Content Optimizer", desc: "Helps marketers optimize content" },
  bleedingNeck: "Marketers waste hours rewriting content that still doesn't convert",
};

interface Day4Props {
  onComplete: () => void;
}

export function Day4PitchBuilder({ onComplete }: Day4Props) {
  const queryClient = useQueryClient();
  const { testMode } = useTestMode();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAttempts, setAiAttempts] = useState(0);
  const MAX_AI_ATTEMPTS = 3;

  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");
  const [benefit, setBenefit] = useState("");
  const [pitchVariations, setPitchVariations] = useState<string[]>([]);
  const [selectedPitch, setSelectedPitch] = useState<number | null>(null);
  const [finalPitch, setFinalPitch] = useState("");
  const [icpData, setIcpData] = useState<{ description: string; hangouts: string[] } | null>(null);
  const [isGeneratingICP, setIsGeneratingICP] = useState(false);
  const [icpAttempts, setIcpAttempts] = useState(0);

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
  const bleedingNeck = testMode ? MOCK_DATA.bleedingNeck : day3Progress?.userInputs?.bleedingNeckProblem;

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day4", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const generatePitches = async () => {
    if (aiAttempts >= MAX_AI_ATTEMPTS) return;
    setAiAttempts(prev => prev + 1);
    setIsGenerating(true);
    try {
      const prompt = `Create 4 different 10-second pitch variations for this product:

Product: ${chosenIdea?.title}
Description: ${chosenIdea?.desc}
Problem it solves: ${bleedingNeck || 'Not specified'}
Target: ${who || 'Not specified'}
What they do: ${what || 'Not specified'}
Benefit: ${benefit || 'Not specified'}

Each pitch should:
- Be ONE sentence, under 15 words
- Be so simple a 10-year-old understands it
- Use the formula: "I help [WHO] [DO WHAT] so they can [BENEFIT]"
- No jargon or buzzwords

Give me exactly 4 variations, one per line. Just the pitch, nothing else:`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const pitches = data.response
        .split('\n')
        .map((line: string) => line.replace(/^[-•*\d.]+\s*/, '').replace(/^\.\s*/, '').trim())
        .filter((line: string) => line.length > 10 && line.length < 200);
      setPitchVariations(pitches.slice(0, 4));
      setSelectedPitch(null);
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSelectPitch = (index: number) => {
    setSelectedPitch(index);
    setFinalPitch(pitchVariations[index]);
  };

  const generateICP = async () => {
    if (icpAttempts >= MAX_AI_ATTEMPTS) return;
    setIcpAttempts(prev => prev + 1);
    setIsGeneratingICP(true);
    try {
      const prompt = `Based on this target customer description, create a detailed ideal customer profile (ICP/avatar):

Target Customer: ${who}
Product: ${chosenIdea?.title}
What they need: ${what}
Benefit they want: ${benefit}
Problem it solves: ${bleedingNeck || 'Not specified'}

Give me TWO things:

1. A 2-3 sentence vivid description of this ideal customer. Include their typical age range, job/situation, daily frustrations, and what success looks like for them. Make it feel like a real person.

2. Exactly 7 specific online places where this exact person hangs out (be specific - not just "Facebook" but "Facebook Groups for [specific topic]"). Include specific subreddits, communities, podcasts, YouTube channels, newsletters, or forums they'd frequent.

Format your response EXACTLY like this:
DESCRIPTION: [your 2-3 sentence avatar description]
HANGOUTS:
1. [specific place]
2. [specific place]
3. [specific place]
4. [specific place]
5. [specific place]
6. [specific place]
7. [specific place]`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const response = data.response;

      const descMatch = response.match(/DESCRIPTION:\s*([\s\S]+?)(?=HANGOUTS:|$)/);
      const description = descMatch ? descMatch[1].trim() : "";

      const hangoutsMatch = response.match(/HANGOUTS:\s*([\s\S]+)/);
      const hangoutsText = hangoutsMatch ? hangoutsMatch[1] : "";
      const hangouts = hangoutsText
        .split('\n')
        .map((line: string) => line.replace(/^[\d.)\-•*]+\s*/, '').trim())
        .filter((line: string) => line.length > 5)
        .slice(0, 7);

      setIcpData({ description, hangouts });
    } catch {
      toast.error("Failed to generate. Try again.");
    }
    setIsGeneratingICP(false);
  };

  const handleFinish = () => {
    saveProgress.mutate({ 
      who, 
      what, 
      benefit, 
      finalPitch,
      pitchVariations,
      icpDescription: icpData?.description,
      icpHangouts: icpData?.hangouts
    });
    onComplete();
  };

  if (!chosenIdea) {
    return (
      <Card className="p-8 border-2 border-slate-200 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Previous Days First</h3>
        <p className="text-slate-600">
          You need to complete Days 1-3 before crafting your pitch.
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

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="p-5 border-2 border-black bg-slate-50">
              <p className="text-center text-sm font-medium text-slate-600 mb-2">The 10-second pitch formula:</p>
              <div className="text-center text-xl font-bold text-black">
                "I help <span className="text-blue-600">[WHO]</span> do <span className="text-blue-600">[WHAT]</span> so they can <span className="text-blue-600">[BENEFIT]</span>"
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-4 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  WHO do you help?
                </label>
                <Input
                  placeholder="e.g. busy freelancers, first-time homebuyers..."
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  className="text-base"
                  data-testid="input-who"
                />
              </Card>

              <Card className="p-4 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  WHAT do you help them do?
                </label>
                <Input
                  placeholder="e.g. find clients, save for retirement..."
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                  className="text-base"
                  data-testid="input-what"
                />
              </Card>

              <Card className="p-4 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  What BENEFIT do they get?
                </label>
                <Input
                  placeholder="e.g. earn more money, save 5 hours/week..."
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  className="text-base"
                  data-testid="input-benefit"
                />
              </Card>
            </div>

            {who && what && benefit && (
              <>
                <Card className="p-4 border-2 border-black bg-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Your draft pitch:</p>
                  <p className="text-lg font-medium text-slate-900">
                    "I help {who} {what} so they can {benefit}."
                  </p>
                </Card>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">AI Pitch Variations</p>
                    {pitchVariations.length === 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              className="gap-2"
                              onClick={generatePitches}
                              disabled={isGenerating || aiAttempts >= MAX_AI_ATTEMPTS}
                              data-testid="button-generate-pitches"
                            >
                              {isGenerating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Generate 4 Ideas{aiAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>AI creates 4 pitch variations based on your inputs</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : aiAttempts < MAX_AI_ATTEMPTS && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={generatePitches}
                              disabled={isGenerating}
                            >
                              {isGenerating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</>
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Regenerate{aiAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Generate new pitch variations</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {pitchVariations.length > 0 && (
                    <div className="space-y-2">
                      {pitchVariations.map((pitch, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectPitch(i)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all cursor-pointer text-sm ${
                            selectedPitch === i
                              ? 'border-black bg-black text-white'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selectedPitch === i ? 'border-white bg-white' : 'border-slate-300'
                            }`}>
                              {selectedPitch === i && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <span className={selectedPitch === i ? 'text-white' : 'text-slate-800'}>
                              {pitch}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPitch !== null && (
                  <Card className="p-4 border-2 border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Your final pitch (edit if needed):
                    </label>
                    <Textarea
                      value={finalPitch}
                      onChange={(e) => setFinalPitch(e.target.value)}
                      className="min-h-[60px] text-base"
                      data-testid="input-final-pitch"
                    />
                    <div className="flex justify-end mt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => copyToClipboard(finalPitch)}
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy your pitch to clipboard</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Card>
                )}
              </>
            )}

            <div className="flex justify-end pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(2)}
                      disabled={!finalPitch.trim()}
                      data-testid="button-next-step1"
                    >
                      Meet Your Customer <ChevronRight className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Continue to discover your ideal customer</TooltipContent>
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
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Ideal Customer</h2>
              <p className="text-slate-500">Discover who they are and where to find them.</p>
            </div>

            <Card className="p-4 border-2 border-black bg-slate-50">
              <p className="text-sm font-bold text-slate-500 uppercase mb-1">You're building for:</p>
              <p className="text-lg font-bold text-black">{who}</p>
            </Card>

            {!icpData ? (
              <Card className="p-6 border-2 border-slate-200 text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="gap-2"
                        onClick={generateICP}
                        disabled={isGeneratingICP || icpAttempts >= MAX_AI_ATTEMPTS}
                        data-testid="button-generate-icp"
                      >
                        {isGeneratingICP ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Building profile...</>
                        ) : icpAttempts >= MAX_AI_ATTEMPTS ? (
                          <>No attempts left</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Generate Customer Profile{icpAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI creates a detailed customer avatar and where to find them</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900">Your Ideal Customer</h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm">{icpData.description}</p>
                </Card>

                <Card className="p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20" />
                        <ellipse cx="12" cy="12" rx="4" ry="10" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900">7 Places They Hang Out</h4>
                  </div>
                  <div className="space-y-2">
                    {icpData.hangouts.map((hangout, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-slate-700 text-sm">{hangout}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {icpAttempts < MAX_AI_ATTEMPTS && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={generateICP}
                    disabled={isGeneratingICP}
                  >
                    {isGeneratingICP ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Regenerate{icpAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                    )}
                  </Button>
                )}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to your pitch</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={handleFinish}
                      disabled={!icpData}
                      data-testid="button-finish"
                    >
                      <Check className="w-5 h-5" /> Complete Day 4
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save and complete Day 4</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
