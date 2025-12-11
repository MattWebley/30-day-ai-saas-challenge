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

  const handleFinish = () => {
    saveProgress.mutate({ 
      who, 
      what, 
      benefit, 
      finalPitch,
      pitchVariations 
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
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">10</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">The 10-Second Pitch Formula</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                If you can't explain it in 10 seconds, it's too complicated.
              </p>
            </div>

            <Card className="p-6 border-2 border-black bg-slate-50">
              <p className="text-center text-lg font-medium text-slate-800 mb-4">
                The magic formula:
              </p>
              <div className="text-center text-2xl font-bold text-black">
                "I help <span className="text-blue-600">[WHO]</span> do <span className="text-blue-600">[WHAT]</span> so they can <span className="text-blue-600">[BENEFIT]</span>"
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                That's it. No jargon. No buzzwords. Something a 10-year-old could understand.
              </p>
            </Card>

            <Card className="p-5 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3">Examples of great 10-second pitches:</h4>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-800">"I help busy professionals organize emails so they can reach inbox zero daily."</p>
                  <p className="text-xs text-slate-500 mt-1">WHO: busy professionals | WHAT: organize emails | BENEFIT: inbox zero</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-800">"I help small businesses track expenses so they can save money on taxes."</p>
                  <p className="text-xs text-slate-500 mt-1">WHO: small businesses | WHAT: track expenses | BENEFIT: save on taxes</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-800">"I help parents find babysitters so they can enjoy worry-free date nights."</p>
                  <p className="text-xs text-slate-500 mt-1">WHO: parents | WHAT: find babysitters | BENEFIT: worry-free date nights</p>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep(2)}
                data-testid="button-next-step1"
              >
                Build My Pitch <ChevronRight className="w-5 h-5" />
              </Button>
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
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Fill In Your Formula</h2>
              <p className="text-slate-500">Answer these 3 questions to build your pitch.</p>
            </div>

            <div className="space-y-4">
              <Card className="p-5 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  WHO do you help? <span className="text-slate-400 font-normal">(be specific)</span>
                </label>
                <Input
                  placeholder="e.g., busy freelancers, first-time homebuyers, stressed parents..."
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  className="text-lg"
                  data-testid="input-who"
                />
              </Card>

              <Card className="p-5 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  WHAT do you help them do? <span className="text-slate-400 font-normal">(one action)</span>
                </label>
                <Input
                  placeholder="e.g., find clients, save for retirement, meal plan..."
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                  className="text-lg"
                  data-testid="input-what"
                />
              </Card>

              <Card className="p-5 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  What BENEFIT do they get? <span className="text-slate-400 font-normal">(the outcome they want)</span>
                </label>
                <Input
                  placeholder="e.g., earn more money, have peace of mind, save 5 hours/week..."
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  className="text-lg"
                  data-testid="input-benefit"
                />
              </Card>
            </div>

            {who && what && benefit && (
              <Card className="p-5 border-2 border-black bg-slate-50">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Your draft pitch:</p>
                <p className="text-xl font-medium text-slate-900">
                  "I help <span className="text-blue-600">{who}</span> {what} so they can <span className="text-blue-600">{benefit}</span>."
                </p>
              </Card>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep(1)}
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep(3)}
                disabled={!who || !what || !benefit}
                data-testid="button-next-step2"
              >
                Get AI Variations <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Pick Your Best Pitch</h2>
              <p className="text-slate-500">Generate variations and choose the one that feels right.</p>
            </div>

            {pitchVariations.length === 0 ? (
              <Card className="p-8 border-2 border-slate-200 text-center">
                <p className="text-slate-500 mb-4">Generate AI-powered pitch variations based on your inputs.</p>
                <Button
                  className="gap-2"
                  onClick={generatePitches}
                  disabled={isGenerating || aiAttempts >= MAX_AI_ATTEMPTS}
                  data-testid="button-generate-pitches"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Crafting pitches...</>
                  ) : aiAttempts >= MAX_AI_ATTEMPTS ? (
                    <>No attempts left</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate 4 Pitch Variations{aiAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                  )}
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {pitchVariations.map((pitch, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectPitch(i)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                      selectedPitch === i
                        ? 'border-black bg-black text-white'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedPitch === i ? 'border-white bg-white' : 'border-slate-300'
                      }`}>
                        {selectedPitch === i && <Check className="w-4 h-4 text-black" />}
                      </div>
                      <span className={`flex-1 ${selectedPitch === i ? 'text-white' : 'text-slate-800'}`}>
                        {pitch}
                      </span>
                    </div>
                  </button>
                ))}

                {aiAttempts < MAX_AI_ATTEMPTS && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={generatePitches}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Regenerate{aiAttempts === MAX_AI_ATTEMPTS - 1 ? ' (1 left)' : ''}</>
                    )}
                  </Button>
                )}
              </div>
            )}

            {selectedPitch !== null && (
              <Card className="p-5 border-2 border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Edit your final pitch:
                </label>
                <Textarea
                  value={finalPitch}
                  onChange={(e) => setFinalPitch(e.target.value)}
                  className="min-h-[80px] text-lg"
                  data-testid="input-final-pitch"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => copyToClipboard(finalPitch)}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </Button>
                </div>
              </Card>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep(2)}
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleFinish}
                disabled={!finalPitch.trim()}
                data-testid="button-finish"
              >
                <Check className="w-5 h-5" /> Complete Day 4
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
