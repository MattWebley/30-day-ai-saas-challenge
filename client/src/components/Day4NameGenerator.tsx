import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
import { Sparkles, Loader2, Check, ChevronRight, ChevronLeft, ExternalLink, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NameSuggestion {
  name: string;
  domain: string;
  tagline: string;
  why: string;
}

interface DomainCheckResult {
  domain: string;
  available: boolean;
  price?: string;
  registrar?: string;
}

interface Day4Props {
  onComplete: () => void;
}

const MOCK_DATA = {
  chosenIdea: { title: "AI Content Optimizer", desc: "Helps marketers optimize content" },
};

export function Day4NameGenerator({ onComplete }: Day4Props) {
  const queryClient = useQueryClient();
  const { testMode } = useTestMode();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [aiAttempts, setAiAttempts] = useState(0);
  const MAX_AI_ATTEMPTS = 3;

  const [nameSuggestions, setNameSuggestions] = useState<NameSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");
  const [finalName, setFinalName] = useState("");
  const [finalDomain, setFinalDomain] = useState("");
  const [domainResults, setDomainResults] = useState<Record<string, DomainCheckResult>>({});

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

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/day4", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const generateNames = async () => {
    if (aiAttempts >= MAX_AI_ATTEMPTS) return;
    setAiAttempts(prev => prev + 1);
    setIsGenerating(true);

    try {
      const prompt = `You are a SaaS branding expert. Generate 6 great product names for this idea:

Product: "${chosenIdea?.title}"
Description: ${chosenIdea?.desc}

NAMING RULES (CRITICAL):
1. Keep it SHORT - 1-2 words max, under 12 characters total
2. Make it MEMORABLE and easy to spell
3. Avoid hyphens, numbers, or special characters
4. Should be brandable and unique (not generic)
5. Prefer .com domain availability (assume common words are taken)
6. Can be: Made-up words, Compound words, or Creative spellings
7. Should feel professional and modern

For each name, provide:
- name: The product name (1-2 words)
- domain: The .com domain (just the name, we'll add .com)
- tagline: A 5-7 word tagline that explains what it does
- why: One sentence explaining why this name works for this product

Respond in this JSON format:
{
  "names": [
    {
      "name": "Example Name",
      "domain": "examplename",
      "tagline": "Short tagline here",
      "why": "Why this name works..."
    }
  ]
}

ONLY respond with valid JSON.`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const parsed = JSON.parse(data.response);
      setNameSuggestions(parsed.names || []);
      setSelectedIndex(null);
    } catch (error) {
      console.error("Error generating names:", error);
      toast.error("Failed to generate names. Try again.");
    }
    setIsGenerating(false);
  };

  const checkDomain = async (domain: string) => {
    setIsChecking(true);
    try {
      const res = await apiRequest("POST", "/api/check-domain", { domain: `${domain}.com` });
      const data = await res.json();
      setDomainResults(prev => ({
        ...prev,
        [domain]: data
      }));
    } catch (error) {
      console.error("Error checking domain:", error);
      toast.error("Failed to check domain availability");
    }
    setIsChecking(false);
  };

  const checkAllDomains = async () => {
    for (const suggestion of nameSuggestions) {
      await checkDomain(suggestion.domain);
    }
  };

  const selectName = (index: number) => {
    setSelectedIndex(index);
    const selected = nameSuggestions[index];
    setFinalName(selected.name);
    setFinalDomain(`${selected.domain}.com`);
  };

  const handleCustomName = () => {
    if (!customName.trim()) return;
    const domainName = customName.toLowerCase().replace(/[^a-z0-9]/g, '');
    setFinalName(customName.trim());
    setFinalDomain(`${domainName}.com`);
    setCurrentStep(3);
  };

  const handleFinish = () => {
    saveProgress.mutate({
      finalName,
      finalDomain,
      allSuggestions: nameSuggestions,
      domainChecks: domainResults
    });
    setCurrentStep(4);
  };

  if (!chosenIdea) {
    return (
      <Card className="p-8 border-2 border-amber-200 bg-amber-50 text-center">
        <Globe className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Day 2 First!</h3>
        <p className="text-slate-600">
          You need to choose your final idea in Day 2 before naming your product.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 border border-slate-200 bg-slate-50">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Naming:</p>
        <h3 className="font-bold text-slate-900">{chosenIdea.title}</h3>
        <p className="text-sm text-slate-600 mt-1">{chosenIdea.desc}</p>
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
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Product Name</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                A great name is short, memorable, and tells people what you do.
              </p>
            </div>

            {/* Naming Tips */}
            <Card className="p-6 border-2 border-blue-200 bg-blue-50">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                The Rules of Great SaaS Names
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>SHORT:</strong> 1-2 words, under 12 characters total</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>MEMORABLE:</strong> Easy to spell, say, and remember</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>.COM DOMAIN:</strong> Always choose .com - it's what people expect</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>NO HYPHENS/NUMBERS:</strong> They confuse people and look unprofessional</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>BRANDABLE:</strong> Unique enough to stand out, not generic</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>HINT AT VALUE:</strong> Bonus if it suggests what you do (but not required)</span>
                </div>
              </div>
            </Card>

            {/* AI Name Generator */}
            <Card className="p-6 border-2 border-slate-200">
              <div className="text-center mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        className="gap-2"
                        onClick={generateNames}
                        disabled={isGenerating || aiAttempts >= MAX_AI_ATTEMPTS}
                        data-testid="button-generate-names"
                      >
                        {isGenerating ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Generating Names...</>
                        ) : aiAttempts >= MAX_AI_ATTEMPTS ? (
                          <>No attempts left</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Generate 6 Name Ideas{aiAttempts > 0 && MAX_AI_ATTEMPTS - aiAttempts === 1 ? ' (1 left)' : ''}</>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI will suggest 6 brandable names</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {nameSuggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-lg">Name Suggestions:</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={checkAllDomains}
                      disabled={isChecking}
                    >
                      {isChecking ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Checking...</>
                      ) : (
                        <><Globe className="w-3 h-3" /> Check All Domains</>
                      )}
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    {nameSuggestions.map((suggestion, i) => {
                      const domainCheck = domainResults[suggestion.domain];
                      return (
                        <button
                          key={i}
                          onClick={() => selectName(i)}
                          className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                            selectedIndex === i
                              ? 'border-black bg-slate-50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg text-slate-900">{suggestion.name}</h4>
                                {selectedIndex === i && (
                                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-slate-600 italic mb-2">{suggestion.tagline}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-mono text-slate-700">{suggestion.domain}.com</span>
                                {domainCheck && (
                                  domainCheck.available ? (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Available
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> Taken
                                    </span>
                                  )
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{suggestion.why}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedIndex !== null && (
                    <div className="flex justify-end pt-4">
                      <Button
                        size="lg"
                        className="gap-2"
                        onClick={() => setCurrentStep(2)}
                        data-testid="button-confirm-name"
                      >
                        Choose This Name <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {nameSuggestions.length > 0 && (
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 uppercase">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">I already have a name:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your product name..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomName()}
                    className="flex-1"
                    data-testid="input-custom-name"
                  />
                  <Button
                    onClick={handleCustomName}
                    disabled={!customName.trim()}
                  >
                    Use This
                  </Button>
                </div>
              </div>
            </Card>
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
              <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Perfect! Let's Check the Domain</h2>
              <p className="text-slate-500">
                You chose <strong>{finalName}</strong>
              </p>
            </div>

            <Card className="p-6 border-2 border-slate-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Your Product Name:
                  </label>
                  <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{finalName}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Your Domain:
                  </label>
                  <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg flex items-center justify-between">
                    <p className="text-xl font-mono text-slate-900">{finalDomain}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => checkDomain(finalDomain.replace('.com', ''))}
                      disabled={isChecking}
                    >
                      {isChecking ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      Check Availability
                    </Button>
                  </div>

                  {domainResults[finalDomain.replace('.com', '')] && (
                    <div className="mt-3">
                      {domainResults[finalDomain.replace('.com', '')].available ? (
                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-green-900 mb-1">Domain Available!</p>
                              <p className="text-sm text-green-700 mb-3">
                                Great news! {finalDomain} is available to register.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => window.open(`https://www.namecheap.com/domains/registration/results/?domain=${finalDomain}`, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Register on Namecheap
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-amber-900 mb-1">Domain Taken</p>
                              <p className="text-sm text-amber-700">
                                This domain is already registered. Go back and choose another name.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

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
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleFinish}
                data-testid="button-confirm-final"
              >
                <Check className="w-5 h-5" /> Confirm & Continue
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Product Has a Name!</h2>
              <p className="text-slate-500">Time to bring {finalName} to life.</p>
            </div>

            <Card className="p-6 border-2 border-black">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-500 uppercase mb-2">Your Product</p>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">{finalName}</h3>
                <p className="text-lg font-mono text-slate-600">{finalDomain}</p>
              </div>
            </Card>

            <Card className="p-5 border-2 border-blue-200 bg-blue-50">
              <h4 className="font-bold text-blue-900 mb-2">Next Steps:</h4>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Register your domain on <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="underline">Namecheap</a> or <a href="https://www.godaddy.com" target="_blank" rel="noopener noreferrer" className="underline">GoDaddy</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Protect your brand - check if social media handles are available (@{finalName.toLowerCase().replace(/\s+/g, '')})</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Keep moving - tomorrow we'll start building!</span>
                </li>
              </ol>
            </Card>

            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={onComplete}
              data-testid="button-complete-day4"
            >
              Complete Day 4 <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
