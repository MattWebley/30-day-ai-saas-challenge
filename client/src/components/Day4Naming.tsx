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
  const MAX_AI_ATTEMPTS = 5;

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
    console.log('[Day4] handleFinish called, moving to complete step');
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
          <p className={ds.label + " uppercase tracking-wide mb-1"}>Naming Your Product</p>
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

            {/* Don't Get Stuck Warning */}
            <div className={ds.infoBoxHighlight}>
              <p className={ds.label + " mb-2"}>Don't overthink this.</p>
              <p className={ds.muted}>
                Finding the "perfect" name can paralyze you for weeks. The truth is, your name matters far less than your product.
                Pick something decent that has an available .com and MOVE ON. You can always rebrand later if your product takes off - many successful companies have.
                Done is better than perfect.
              </p>
            </div>

            {/* Naming Approaches Info */}
            <div className={ds.cardWithPadding}>
              <h3 className={ds.heading + " mb-3"}>Your Naming Options</h3>
              <div className="space-y-3">
                <div className={ds.infoBox + " flex items-start gap-3"}>
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className={ds.label}>Invented/Brandable Name</p>
                    <p className={ds.muted}>Made-up words like Spotify, Trello, Asana. Unique and trademarkable. Easier to get the .com. AI generates these below.</p>
                  </div>
                </div>
                <div className={ds.infoBox + " flex items-start gap-3"}>
                  <span className="text-lg">📝</span>
                  <div>
                    <p className={ds.label}>Descriptive Name</p>
                    <p className={ds.muted}>Describes what it does like Mailchimp, Salesforce, QuickBooks. Clearer to customers but harder to get .com.</p>
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
                          className={selectedIndex === i ? ds.optionSelected : ds.optionDefault}
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
                Before you register anything, let's do some quick checks.
              </p>
            </div>

            {/* Name Display */}
            <div className={ds.optionSelected + " p-6"}>
              <div className="text-center">
                <p className={ds.capsLabel + " mb-2"}>Your Product Name</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{finalName}</h3>
                <p className={ds.body + " text-lg font-mono mt-2"}>{finalDomain}</p>
              </div>
            </div>

            {/* Step 1: Trademark Check - FIRST */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-3">
                <div className={ds.stepCircle}>1</div>
                <h4 className={ds.heading}>Check for Existing Trademarks</h4>
              </div>
              <p className={ds.muted + " mb-3"}>
                We're NOT asking you to register a trademark - that's expensive and unnecessary right now.
                We just want to make sure nobody ELSE has already trademarked "{finalName}" in software/SaaS so you don't get a cease-and-desist letter later.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.gov.uk/search-for-trademark?q=${encodeURIComponent(finalName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ds.optionDefault + " inline-flex items-center gap-2 text-sm font-medium"}
                >
                  🇬🇧 UK Trademark Search <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`https://tmsearch.uspto.gov/search/search-information`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ds.optionDefault + " inline-flex items-center gap-2 text-sm font-medium"}
                >
                  🇺🇸 US Trademark Search <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className={ds.infoBoxHighlight + " mt-3"}>
                <p className={ds.muted}>
                  <strong>What you're looking for</strong> - Search for your name and see if anyone has registered it for software, apps, or SaaS.
                  If there's an exact match in your category, pick a different name. If it's clear, you're good to go.
                </p>
              </div>
              <div className={ds.infoBox + " mt-2"}>
                <p className={ds.muted}>
                  <strong>Found a conflict?</strong> Go back and pick a different name. It's much easier to change now than after you've registered everything.
                </p>
              </div>
            </div>

            {/* Step 2: Social Handles - SECOND */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-3">
                <div className={ds.stepCircle}>2</div>
                <h4 className={ds.heading}>Check Social Handle Availability</h4>
              </div>
              <p className={ds.muted + " mb-3"}>
                Check if your handles are available. You'll register these on the next screen.
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.filter(p => p.id !== "domain").map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.checkUrl(finalName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ds.optionDefault + " inline-flex items-center gap-2 text-sm"}
                  >
                    <span>{platform.icon}</span>
                    <span className="font-medium">{platform.label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
              <p className={ds.muted + " text-sm mt-3"}>
                Click each to check if @{finalName.toLowerCase().replace(/\s+/g, '')} is available
              </p>
              <div className={ds.infoBoxHighlight + " mt-3"}>
                <p className={ds.muted}>
                  <strong>Can't get every handle?</strong> That's okay. You can use variations like "{finalName.replace(/\s+/g, '')}App" or "Get{finalName.replace(/\s+/g, '')}". As long as you can get most of them, you're good.
                </p>
              </div>
            </div>

            {/* Step 3: Domain Check - THIRD */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-3">
                <div className={ds.stepCircle}>3</div>
                <h4 className={ds.heading}>Check Domain Availability</h4>
              </div>
              <p className={ds.muted + " mb-3"}>
                Finally, check that your .com is available. You'll register this on the next screen too.
              </p>
              <div className="text-center">
                <a
                  href={`https://www.namecheap.com/domains/registration/results/?domain=${finalDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ds.optionDefault + " inline-flex items-center gap-2 font-medium"}
                >
                  🌐 Check {finalDomain} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className={ds.infoBoxHighlight + " mt-3"}>
                <p className={ds.muted}>
                  <strong>Pricing tip:</strong> Only pay ~$10-15/year for a .com. If it's priced higher, it's a "premium" domain - pick a different name instead.
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
                <Check className="w-5 h-5" /> All Clear - Continue to Registration
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
              <p className={ds.muted}>Follow this order for <strong>{finalName}</strong> - social handles first, then domains.</p>
            </div>

            <div className={ds.optionSelected + " p-6"}>
              <div className="text-center">
                <p className={ds.capsLabel + " mb-2"}>Your Product</p>
                <h3 className="text-4xl font-extrabold text-slate-900 mb-2">{finalName}</h3>
                <p className={ds.body + " text-xl font-mono"}>{finalDomain}</p>
              </div>
            </div>

            {/* Step 1: Social Handles - FIRST */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-4">
                <div className={ds.stepCircle}>1</div>
                <h4 className={ds.heading}>Register Social Handles First</h4>
              </div>
              <p className={ds.muted + " mb-4"}>
                Claim your username on these platforms before someone else does.
              </p>

              <div className="space-y-2">
                {SOCIAL_PLATFORMS.filter(p => p.id !== "domain").map((platform) => {
                  const isRegistered = registeredItems.has(platform.id);

                  return (
                    <div
                      key={platform.id}
                      onClick={() => toggleRegistered(platform.id)}
                      className={isRegistered ? ds.successBox + " flex items-center justify-between cursor-pointer" : ds.optionDefault + " flex items-center justify-between"}
                    >
                      <div className="flex items-center gap-3">
                        <div className={isRegistered ? ds.stepCircleComplete : ds.checkDefault}>
                          {isRegistered && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{platform.icon}</span>
                          <span className={isRegistered ? ds.successText + " font-medium line-through" : ds.label}>
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
            </div>

            {/* Step 2: Primary Domain - SECOND */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-4">
                <div className={ds.stepCircle}>2</div>
                <h4 className={ds.heading}>Register Your Primary Domain</h4>
              </div>
              <p className={ds.muted + " mb-4"}>
                Get your main .com domain - this is your home base on the internet.
              </p>

              <div
                onClick={() => toggleRegistered("domain")}
                className={registeredItems.has("domain") ? ds.successBox + " flex items-center justify-between cursor-pointer" : ds.optionDefault + " flex items-center justify-between"}
              >
                <div className="flex items-center gap-3">
                  <div className={registeredItems.has("domain") ? ds.stepCircleComplete : ds.checkDefault}>
                    {registeredItems.has("domain") && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <span className={registeredItems.has("domain") ? ds.successText + " font-medium line-through" : ds.label}>
                      {finalDomain}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.namecheap.com/domains/registration/results/?domain=${finalDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800"
                >
                  Register <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Step 3: Typo/Protection Domains - OPTIONAL */}
            <div className={ds.cardWithPadding}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold border border-slate-200">3</div>
                <div className="flex items-center gap-2">
                  <h4 className={ds.heading}>Protect Your Brand (Optional)</h4>
                  <span className={ds.capsLabel + " bg-slate-100 px-2 py-0.5 rounded"}>For serious builders</span>
                </div>
              </div>
              <p className={ds.muted + " mb-4"}>
                If you're committed to this product, consider registering common typos and variations to protect your brand. Don't go overboard - 3-5 extra domains is plenty.
              </p>

              <div className="space-y-3">
                <div className={ds.infoBoxHighlight}>
                  <p className={ds.label + " mb-2"}>Common variations to consider:</p>
                  <ul className={ds.muted + " space-y-1"}>
                    <li>• <strong>Typos:</strong> {finalName.toLowerCase().replace(/\s+/g, '').slice(0, -1) + finalName.slice(-1).repeat(2)}.com (double letter)</li>
                    <li>• <strong>Plurals:</strong> {finalName.toLowerCase().replace(/\s+/g, '')}s.com</li>
                    <li>• <strong>Hyphenated:</strong> {finalName.toLowerCase().replace(/\s+/g, '-')}.com (if multi-word)</li>
                    <li>• <strong>Common misspellings:</strong> Think about how people might mishear or misspell it</li>
                    <li>• <strong>Alternative TLDs:</strong> .co, .io, .app, .ai, or your country (.co.uk, .de, .com.au, etc.) - only if cheap</li>
                  </ul>
                </div>

                <div className={ds.infoBox}>
                  <p className={ds.muted}>
                    <strong>Budget tip:</strong> Only buy these if they're ~$10-15 each. Don't spend hundreds on domain protection right now - but do grab the cheap obvious ones early, before someone else does.
                  </p>
                </div>

                <div className={ds.infoBox}>
                  <p className={ds.muted}>
                    <strong>Reality check:</strong> If a typo seems MORE natural or obvious than your actual name, that's a red flag. If people are more likely to type the "wrong" version, maybe reconsider going back and picking a simpler name.
                  </p>
                </div>

                <a
                  href={`https://www.namecheap.com/domains/registration/results/?domain=${finalName.toLowerCase().replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Search for variations on Namecheap <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Progress indicator - Optional tracking */}
            {registeredItems.size > 0 && (
              <div className={ds.cardWithPadding}>
                <div className="flex items-center justify-between mb-2">
                  <span className={ds.muted}>Your progress (optional)</span>
                  <span className={ds.label}>
                    {registeredItems.size}/{SOCIAL_PLATFORMS.length} done
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(registeredItems.size / SOCIAL_PLATFORMS.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Skip notice */}
            <div className={ds.infoBoxHighlight}>
              <p className={ds.muted}>
                <strong>Short on time?</strong> You don't have to register everything right now.
                The checklist above is just to help you track what you've done. You can complete this day
                and come back to register things later - just don't wait too long or someone might grab your name!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep("confirm")}
                className="gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                size="lg"
                className="flex-1 h-14 text-lg font-bold gap-2"
                onClick={() => {
                  console.log('[Day4] Complete button clicked, calling onComplete');
                  toast.info("Completing Day 4...");
                  try {
                    onComplete();
                    console.log('[Day4] onComplete called successfully');
                  } catch (error) {
                    console.error('[Day4] Error calling onComplete:', error);
                    toast.error("Error completing day - check console");
                  }
                }}
              >
                {registeredItems.size === 0 ? "Skip Registration for Now" : "Complete Day 4"} <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
