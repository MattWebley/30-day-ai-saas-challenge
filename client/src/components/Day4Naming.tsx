import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ds } from "@/lib/design-system";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface NameSuggestion {
  name: string;
  domain: string;
  tagline: string;
  why: string;
}

interface Day4NamingProps {
  dayId: number;
  userIdea: string;
  painPoints: string[];
  features: string[];
  onComplete: () => void;
}

// Namecheap affiliate link
const NAMECHEAP_AFFILIATE = "https://www.namecheap.com/?aff=YOUR_AFFILIATE_ID";

// Social platforms to register - with direct signup URLs
const SOCIAL_PLATFORMS = [
  {
    id: "domain",
    label: "Domain (.com)",
    icon: "🌐",
    signupUrl: "https://www.namecheap.com",
    checkUrl: (name: string) => `https://www.namecheap.com/domains/registration/results/?domain=${name.toLowerCase().replace(/\s+/g, '')}.com`,
    description: "Register your .com domain (~$10/year)",
    priority: true
  },
  {
    id: "twitter",
    label: "Twitter / X",
    icon: "𝕏",
    signupUrl: "https://twitter.com/i/flow/signup",
    checkUrl: (name: string) => `https://twitter.com/${name.toLowerCase().replace(/\s+/g, '')}`,
    description: "Create account & claim your @handle",
    priority: true
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "📷",
    signupUrl: "https://www.instagram.com/accounts/emailsignup/",
    checkUrl: (name: string) => `https://instagram.com/${name.toLowerCase().replace(/\s+/g, '')}`,
    description: "Create account & claim your @handle",
    priority: true
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: "▶️",
    signupUrl: "https://www.youtube.com/create_channel",
    checkUrl: (name: string) => `https://www.youtube.com/@${name.toLowerCase().replace(/\s+/g, '')}`,
    description: "Create channel & claim your @handle",
    priority: true
  },
  {
    id: "facebook",
    label: "Facebook Page",
    icon: "📘",
    signupUrl: "https://www.facebook.com/pages/create",
    checkUrl: (name: string) => `https://www.facebook.com/${name.toLowerCase().replace(/\s+/g, '')}`,
    description: "Create business page",
    priority: false
  },
  {
    id: "linkedin",
    label: "LinkedIn Page",
    icon: "💼",
    signupUrl: "https://www.linkedin.com/company/setup/new/",
    checkUrl: (name: string) => `https://www.linkedin.com/company/${name.toLowerCase().replace(/\s+/g, '-')}`,
    description: "Create a company page for your product",
    priority: false
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: "🎵",
    signupUrl: "https://www.tiktok.com/signup",
    checkUrl: (name: string) => `https://tiktok.com/@${name.toLowerCase().replace(/\s+/g, '')}`,
    description: "If relevant to your audience",
    priority: false
  },
];

export function Day4Naming({ dayId, userIdea, painPoints, features, onComplete }: Day4NamingProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<"generate" | "confirm" | "complete">("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAttempts, setAiAttempts] = useState(0);
  const MAX_AI_ATTEMPTS = 3;

  const [nameSuggestions, setNameSuggestions] = useState<NameSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");
  const [finalName, setFinalName] = useState("");
  const [finalDomain, setFinalDomain] = useState("");
  const [registeredItems, setRegisteredItems] = useState<Set<string>>(new Set());

  const toggleRegistered = (itemId: string) => {
    const newRegistered = new Set(registeredItems);
    if (newRegistered.has(itemId)) {
      newRegistered.delete(itemId);
    } else {
      newRegistered.add(itemId);
    }
    setRegisteredItems(newRegistered);
  };

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/4", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  // Extract keywords from user's idea and pain points for name generation
  const extractKeywords = () => {
    const text = `${userIdea} ${painPoints.join(' ')} ${features.join(' ')}`.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 3 && w.length < 10);
    return Array.from(new Set(words)).slice(0, 10);
  };

  const generateNames = async () => {
    if (aiAttempts >= MAX_AI_ATTEMPTS) return;
    const attemptNumber = aiAttempts + 1;
    setAiAttempts(attemptNumber);
    setIsGenerating(true);

    const keywords = extractKeywords();
    const painPointsList = painPoints.slice(0, 3).join(', ') || 'solving user problems';
    const featuresList = features.slice(0, 3).join(', ') || 'core functionality';

    try {
      const prompt = `You are a SaaS naming expert. Create 6 unique, brandable product names.

THE PRODUCT:
"${userIdea}"

KEY PROBLEMS IT SOLVES:
${painPointsList}

CORE FEATURES:
${featuresList}

NAMING STRATEGIES (use a mix):
1. INVENTED WORDS: Combine syllables to create new words (like Spotify = spot + identify, Trello = "trellis")
2. PORTMANTEAU: Blend two relevant words (like Pinterest = pin + interest)
3. MODIFIED SPELLING: Take a relevant word and modify it (like Lyft, Fiverr, Tumblr)
4. ABSTRACT + SUFFIX: Use abstract roots with tech suffixes -io, -ly, -ify, -able (like Airtable, Loomly)
5. ACTION WORDS: Verbs that describe the benefit (like Zoom, Slack, Notion)
6. METAPHORS: Names that evoke the feeling/benefit (like Asana = yoga pose for calm workflow)

REQUIREMENTS:
- Each name MUST be 4-9 characters
- Easy to spell and pronounce
- .com domain should be potentially available (avoid common words)
- Generate names that could work for: ${userIdea.slice(0, 50)}

ATTEMPT ${attemptNumber} OF 3 - Be creative and different! Timestamp: ${Date.now()}

Return ONLY this JSON format:
{"names":[{"name":"ProductName","domain":"productname","tagline":"5-7 word tagline","why":"Brief explanation of naming logic"}]}`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();

      // Try to parse the response
      let parsed;
      try {
        // Handle potential markdown code blocks
        let responseText = data.response || '';
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Failed to parse AI response");
      }

      const names = parsed.names || [];
      if (names.length > 0) {
        setNameSuggestions(names);
        setSelectedIndex(null);
      } else {
        throw new Error("No names returned");
      }
    } catch (error) {
      console.error("Error generating names:", error);

      // Smart fallback using their actual product keywords
      const baseWords = extractKeywords();
      const prefixes = ['Nova', 'Flux', 'Sync', 'Apex', 'Vibe', 'Pulse'];
      const suffixes = ['ly', 'io', 'fy', 'hub', 'app', 'base'];

      const fallbackNames = prefixes.map((pre, i) => {
        const keyword = baseWords[i] || '';
        const suffix = suffixes[i];
        const name = keyword ?
          `${keyword.charAt(0).toUpperCase()}${keyword.slice(1, 4)}${suffix}` :
          `${pre}${suffix}`;
        return {
          name: name,
          domain: name.toLowerCase(),
          tagline: `Smart ${userIdea.split(' ').slice(0, 3).join(' ')} solution`,
          why: "Generated based on your product keywords"
        };
      });

      setNameSuggestions(fallbackNames);
      toast.error("AI had trouble - here are some alternatives based on your product");
    }
    setIsGenerating(false);
  };

  const selectName = (index: number) => {
    setSelectedIndex(index);
    const selected = nameSuggestions[index];
    setFinalName(selected.name);
    // Strip any existing .com before adding it
    const cleanDomain = selected.domain.replace(/\.com$/i, '').toLowerCase();
    setFinalDomain(`${cleanDomain}.com`);
  };

  const handleCustomName = () => {
    if (!customName.trim()) return;
    const domainName = customName.toLowerCase().replace(/[^a-z0-9]/g, '');
    setFinalName(customName.trim());
    setFinalDomain(`${domainName}.com`);
    setCurrentStep("confirm");
  };

  const handleFinish = () => {
    saveProgress.mutate({
      finalName,
      finalDomain,
      allSuggestions: nameSuggestions,
    });
    setCurrentStep("complete");
  };

  return (
    <div className="space-y-6">
      {/* Context Card */}
      {userIdea && (
        <div className={ds.infoBoxHighlight}>
          <p className={ds.label + " uppercase tracking-wide mb-1"}>Naming Your Product:</p>
          <p className={ds.label}>{userIdea}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Generate Names */}
        {currentStep === "generate" && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Name Your Product</h2>
              <p className={ds.muted + " max-w-lg mx-auto"}>
                Choose a name that's memorable, easy to spell, and has an available .com domain.
              </p>
            </div>

            {/* Naming Approaches Info */}
            <div className={ds.cardWithPadding}>
              <h3 className={ds.heading + " mb-3"}>Your Naming Options:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className={ds.label}>Invented/Brandable Name</p>
                    <p className={ds.muted + " text-sm"}>Made-up words like Spotify, Trello, Asana. Unique and trademarkable. Easier to get the .com. AI generates these below.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-lg">📝</span>
                  <div>
                    <p className={ds.label}>Descriptive Name</p>
                    <p className={ds.muted + " text-sm"}>Describes what it does like Mailchimp, Salesforce, QuickBooks. Clearer to customers but harder to get .com.</p>
                  </div>
                </div>
              </div>
              <p className={ds.muted + " text-sm mt-4 text-center"}>
                You can use AI suggestions below OR enter your own name idea at the bottom.
              </p>
            </div>

            {/* AI Generator */}
            <div className={ds.cardWithPadding}>
              <h3 className={ds.heading + " mb-2"}>Option 1: Generate Brandable Names</h3>
              <p className={ds.muted + " mb-4"}>AI creates unique, invented names that are likely to have .com available.</p>
              <div className="text-center mb-6">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={generateNames}
                  disabled={isGenerating || aiAttempts >= MAX_AI_ATTEMPTS}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating Names...</>
                  ) : aiAttempts >= MAX_AI_ATTEMPTS ? (
                    <>No attempts left</>
                  ) : (
                    <>Generate 6 Name Ideas {aiAttempts > 0 ? `(${MAX_AI_ATTEMPTS - aiAttempts} left)` : ''}</>
                  )}
                </Button>
              </div>

              {nameSuggestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className={ds.heading}>Pick Your Favorite:</h3>

                  <div className="grid gap-3">
                    {nameSuggestions.map((suggestion, i) => {
                      return (
                        <button
                          key={i}
                          onClick={() => selectName(i)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedIndex === i
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-xl text-slate-900">{suggestion.name}</h4>
                                {selectedIndex === i && (
                                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-slate-600 italic mb-2">"{suggestion.tagline}"</p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-mono text-slate-700">
                                  {suggestion.domain.replace(/\.com$/i, '')}.com
                                </span>
                                <a
                                  href={`https://www.namecheap.com/domains/registration/results/?domain=${suggestion.domain.replace(/\.com$/i, '')}.com`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  Check availability <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              <p className="text-xs text-slate-500">{suggestion.why}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedIndex !== null && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setCurrentStep("confirm")}
                    >
                      Choose "{nameSuggestions[selectedIndex].name}" <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              )}

            </div>

            {/* Custom Name Option */}
            <div className={ds.cardWithPadding}>
              <h3 className={ds.heading + " mb-2"}>Option 2: Enter Your Own Name</h3>
              <p className={ds.muted + " mb-4"}>Have a name idea already? Descriptive, personal, or anything else - enter it here.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your product name..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomName()}
                  className="flex-1"
                />
                <Button
                  onClick={handleCustomName}
                  disabled={!customName.trim()}
                >
                  Use This Name
                </Button>
              </div>
            </div>

          </motion.div>
        )}

        {/* Step 2: Confirm */}
        {currentStep === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Great Choice!</h2>
              <p className={ds.muted}>
                Let's make sure you can get the domain.
              </p>
            </div>

            <div className={ds.cardWithPadding}>
              <div className="space-y-4">
                <div className={ds.infoBoxHighlight + " text-center p-6"}>
                  <p className={ds.label + " uppercase mb-2"}>Your Product Name</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{finalName}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <p className={ds.body + " text-lg font-mono"}>{finalDomain}</p>
                    <a
                      href={`https://www.namecheap.com/domains/registration/results/?domain=${finalDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      Check availability <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="text-center">
                  <a
                    href={`https://www.namecheap.com/domains/registration/results/?domain=${finalDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Register on Namecheap (~$10/year)
                  </a>
                </div>
              </div>
            </div>

            {/* Important Reminder */}
            <div className={ds.infoBoxHighlight}>
              <p className={ds.muted}>
                <strong>Remember:</strong> Only pay ~$10-15/year for a .com. If it's priced higher,
                it's a "premium" domain. Pick a different name instead.
              </p>
            </div>

            {/* Trademark Check - Before Confirming */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">⚖️</span>
                <h4 className={ds.heading}>Check for Trademarks</h4>
              </div>
              <p className={ds.muted + " mb-3"}>
                Make sure no one has trademarked "{finalName}" in software/SaaS before committing.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.gov.uk/search-for-trademark?q=${encodeURIComponent(finalName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-slate-300 text-sm font-medium"
                >
                  🇬🇧 UK Trademark Search <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`https://tmsearch.uspto.gov/search/search-information`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-slate-300 text-sm font-medium"
                >
                  🇺🇸 US Trademark Search <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Social Handles Preview - Before Confirming */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">📱</span>
                <h4 className={ds.heading}>Social Handles to Claim</h4>
              </div>
              <p className={ds.muted + " mb-3"}>
                After confirming, you'll need to register these. Check availability now:
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.checkUrl(finalName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-slate-300 text-sm"
                  >
                    <span>{platform.icon}</span>
                    <span className="font-medium">{platform.label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Click each to check if @{finalName.toLowerCase().replace(/\s+/g, '')} is available
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">
                  <strong>Can't get every handle?</strong> If the .com is available but one or two socials aren't, that's not the end of the world. You can use variations like "{finalName.replace(/\s+/g, '')}App" or "Get{finalName.replace(/\s+/g, '')}". Focus on getting the .com - that's what matters most.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep("generate")}
                className="gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Pick Different Name
              </Button>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleFinish}
              >
                <Check className="w-5 h-5" /> Confirm & Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Complete */}
        {currentStep === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Now Register Everything</h2>
              <p className={ds.muted}>Tick off each item as you claim it for <strong>{finalName}</strong>.</p>
            </div>

            <div className="bg-white border-2 border-primary rounded-lg p-6">
              <div className="text-center">
                <p className={ds.label + " uppercase mb-2"}>Your Product</p>
                <h3 className="text-4xl font-extrabold text-slate-900 mb-2">{finalName}</h3>
                <p className={ds.body + " text-xl font-mono"}>{finalDomain}</p>
              </div>
            </div>

            {/* Registration Checklist */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={ds.heading}>Registration Checklist</h4>
                <span className={ds.muted}>
                  {registeredItems.size}/{SOCIAL_PLATFORMS.length} done
                </span>
              </div>

              {/* All platforms in one list */}
              <div className="space-y-2">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const isRegistered = registeredItems.has(platform.id);

                  return (
                    <div
                      key={platform.id}
                      onClick={() => toggleRegistered(platform.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isRegistered
                          ? "border-green-300 bg-green-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isRegistered
                              ? "border-green-500 bg-green-500"
                              : "border-slate-300"
                          }`}
                        >
                          {isRegistered && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{platform.icon}</span>
                          <span className={`font-medium ${isRegistered ? "text-green-700 line-through" : "text-slate-900"}`}>
                            {platform.label}
                          </span>
                        </div>
                      </div>

                      <a
                        href={platform.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800"
                      >
                        Sign Up <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Progress indicator */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Registration progress</span>
                  <span className="font-medium text-slate-900">
                    {Math.round((registeredItems.size / SOCIAL_PLATFORMS.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${(registeredItems.size / SOCIAL_PLATFORMS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={onComplete}
            >
              Complete Day 4 <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
