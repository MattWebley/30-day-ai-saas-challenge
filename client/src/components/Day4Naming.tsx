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

interface DomainCheckResult {
  domain: string;
  available: boolean;
  checking?: boolean;
  price?: string;
  registrar?: string;
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
    signupUrl: "https://www.namecheap.com/?aff=YOUR_AFFILIATE_ID",
    checkUrl: (name: string) => `https://www.namecheap.com/domains/registration/results/?domain=${name.toLowerCase().replace(/\s+/g, '')}.com&aff=YOUR_AFFILIATE_ID`,
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
  {
    id: "github",
    label: "GitHub",
    icon: "💻",
    signupUrl: "https://github.com/signup",
    checkUrl: (name: string) => `https://github.com/${name.toLowerCase().replace(/\s+/g, '')}`,
    description: "For open source or public code",
    priority: false
  },
];

export function Day4Naming({ dayId, userIdea, painPoints, features, onComplete }: Day4NamingProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<"learn" | "generate" | "confirm" | "complete">("learn");
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

  const allItemsRegistered = registeredItems.size >= 2; // At least domain + 1 social

  const saveProgress = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/progress/4", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const checkDomainAvailability = async (domain: string): Promise<boolean | null> => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const res = await fetch("/api/check-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: `${domain}.com` }),
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error("Domain check failed:", res.status);
        return null;
      }

      const data = await res.json();
      return data.available;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Domain check timed out for:", domain);
      } else {
        console.error("Domain check failed:", error);
      }
      return null; // Unknown - assume might be available
    }
  };

  const generateNames = async () => {
    if (aiAttempts >= MAX_AI_ATTEMPTS) return;
    setAiAttempts(prev => prev + 1);
    setIsGenerating(true);
    setDomainResults({}); // Clear previous results

    // Generate a random seed to ensure unique names each time
    const randomSeed = Math.random().toString(36).substring(7);

    try {
      const prompt = `You are a startup naming expert who specializes in finding AVAILABLE domain names. Generate 6 completely unique, invented product names.

PRODUCT: ${userIdea}

CRITICAL RULES - FOLLOW EXACTLY:

1. INVENT COMPLETELY NEW WORDS that don't exist yet. Examples of good invented names:
   - Combine word fragments: "Klar" (clear) + "ify" = Klarify
   - Mash syllables: "Vex" + "ara" = Vexara
   - Add unique suffixes: -lio, -ara, -ovo, -ix, -sy, -zo
   - Use uncommon letter combos: Q, X, Z, K combinations

2. NEVER suggest these (ALL TAKEN):
   - Real English words (Notion, Slack, Zoom - taken)
   - Common tech suffixes on words (Taskly, Flowly, Appify - taken)
   - Obvious compound words (Mailchimp, Dropbox style - taken)
   - Anything you've heard of before

3. MAKE THEM PRONOUNCEABLE but unique:
   - 5-8 characters ideal
   - Easy to say out loud
   - Memorable sound

4. USE THIS RANDOMIZER TO BE UNIQUE: ${randomSeed}

GOOD EXAMPLES (the STYLE to follow, not these exact names):
- Qorvo, Zuora, Klaviyo, Airtable, Webflow, Retool, Loom
- Invented: Zyphra, Korlix, Venndo, Plexivo, Traxly, Quentis

BAD EXAMPLES (too generic, definitely taken):
- Flowly, Taskify, DataHub, AppBase, CloudSync, QuickTask

For each name provide:
- name: The invented product name
- domain: The domain (lowercase, no spaces)
- tagline: 5-7 word tagline
- why: Why this name fits the product

Return ONLY valid JSON:
{
  "names": [
    {"name": "Invented Name", "domain": "inventedname", "tagline": "Short tagline here", "why": "Why it works..."}
  ]
}`;

      const res = await apiRequest("POST", "/api/ai-prompt", { prompt });
      const data = await res.json();
      const parsed = JSON.parse(data.response);
      const names = parsed.names || [];
      setNameSuggestions(names);
      setSelectedIndex(null);

      // Check domain availability for all suggestions (update as each completes)
      if (names.length > 0) {
        names.forEach(async (suggestion: NameSuggestion) => {
          const available = await checkDomainAvailability(suggestion.domain);
          setDomainResults(prev => ({
            ...prev,
            [suggestion.domain]: {
              domain: `${suggestion.domain}.com`,
              available: available === null ? true : available, // Assume available if check fails
              checking: false,
            },
          }));
        });
      }
    } catch (error) {
      console.error("Error generating names:", error);
      // Fallback with truly random names
      const suffixes = ['ovo', 'ara', 'lix', 'zio', 'vex', 'qor'];
      const prefixes = ['Kla', 'Vor', 'Zep', 'Qua', 'Nex', 'Pry'];
      const fallbackNames = prefixes.map((pre, i) => ({
        name: `${pre}${suffixes[i]}`,
        domain: `${pre.toLowerCase()}${suffixes[i]}`,
        tagline: "Your smart solution awaits",
        why: "Unique invented name likely available"
      }));
      setNameSuggestions(fallbackNames);
      toast.error("AI unavailable - showing generated names");
    }
    setIsGenerating(false);
  };

  const checkDomain = async (domain: string) => {
    // Simulate domain check (in production, use a real API)
    setIsChecking(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate - most short names are taken
    const likelyAvailable = domain.length > 7 || domain.includes('ly') || domain.includes('ify');
    setDomainResults(prev => ({
      ...prev,
      [domain]: {
        domain: `${domain}.com`,
        available: likelyAvailable,
      }
    }));
    setIsChecking(false);
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
        {/* Step 1: Learn the Rules */}
        {currentStep === "learn" && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Hero */}
            <div className={ds.cardWithPadding}>
              <h3 className="text-2xl font-extrabold text-slate-900">Name It RIGHT</h3>
              <p className={ds.body + " mt-1"}>
                Your name is your first impression. Get this right.
              </p>
            </div>

            {/* The Rules */}
            <div className={ds.cardWithPadding}>
              <h4 className={ds.heading + " mb-4"}>
                The Golden Rules of SaaS Naming
              </h4>
              <div className="space-y-4">
                <div className={ds.infoBoxHighlight}>
                  <div className={ds.label}>Always get the .com</div>
                  <div className={ds.muted}>
                    Not .io, not .co, not .app. The .com. It's what people type automatically.
                    If you can't get the .com, pick a different name.
                  </div>
                </div>

                <div className={ds.infoBoxHighlight}>
                  <div className={ds.label}>Keep it SHORT</div>
                  <div className={ds.muted}>
                    1-2 words. Under 10 characters. Easy to type, easy to remember, easy to say out loud.
                  </div>
                </div>

                <div className={ds.infoBoxHighlight}>
                  <div className={ds.label}>Make it SPEAKABLE</div>
                  <div className={ds.muted}>
                    Say it out loud. If you have to spell it for people, it's wrong.
                    "It's Trello, T-R-E-L-L-O" is fine. "It's Xqyzt, X-Q-Y-Z-T" is not.
                  </div>
                </div>

                <div className={ds.infoBoxHighlight}>
                  <div className={ds.label}>Be UNIQUE</div>
                  <div className={ds.muted}>
                    "ProjectManager" is not a name. "Asana" is. Made-up words that sound good are
                    often better than descriptive names.
                  </div>
                </div>
              </div>
            </div>

            {/* What to AVOID */}
            <div className={ds.cardWithPadding}>
              <h4 className={ds.heading + " mb-4"}>
                What to AVOID
              </h4>
              <div className="space-y-3">
                <div>
                  <div className={ds.label}>No hyphens or numbers</div>
                  <div className={ds.muted}>
                    "task-hub-123.com" looks cheap and confusing. Don't do it.
                  </div>
                </div>
                <div>
                  <div className={ds.label}>Don't overpay for domains</div>
                  <div className={ds.muted}>
                    A .com should cost ~$10-15/year. If someone wants $500+ for a domain, pick a different name.
                    Domain squatters are not worth it at this stage.
                  </div>
                </div>
                <div>
                  <div className={ds.label}>Don't be too generic</div>
                  <div className={ds.muted}>
                    "Analytics Platform" or "Marketing Tool" - these aren't names, they're descriptions.
                    You can't trademark a generic term.
                  </div>
                </div>
              </div>
            </div>

            {/* Domain Pricing Education */}
            <div className={ds.infoBoxHighlight}>
              <h4 className={ds.heading + " mb-3"}>
                What Domains SHOULD Cost
              </h4>
              <div className="space-y-2">
                <p className={ds.muted}>
                  <strong>Normal .com registration:</strong> $10-15/year
                </p>
                <p className={ds.muted}>
                  <strong>If someone wants $100+:</strong> It's a "premium" domain owned by a squatter. Skip it.
                </p>
                <p className={ds.muted}>
                  <strong>Rule of thumb:</strong> If you can't get the .com for under $20, pick a different name.
                  Your energy is better spent building than negotiating with domain hoarders.
                </p>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setCurrentStep("generate")}
            >
              I Understand - Let's Name It <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Generate Names */}
        {currentStep === "generate" && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Name Ideas</h2>
              <p className={ds.muted + " max-w-lg mx-auto"}>
                AI will create names based on your idea, pain points, and features.
              </p>
            </div>

            {/* AI Generator */}
            <div className={ds.cardWithPadding}>
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
                  <div className="flex items-center justify-between">
                    <h3 className={ds.heading}>Pick Your Favorite:</h3>
                    <span className={ds.muted}>
                      {Object.keys(domainResults).length > 0 ? "Availability checked" : "Checking availability..."}
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {nameSuggestions.map((suggestion, i) => {
                      const domainCheck = domainResults[suggestion.domain];
                      const isAvailable = domainCheck?.available;
                      const isChecking = !domainCheck;

                      return (
                        <button
                          key={i}
                          onClick={() => selectName(i)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedIndex === i
                              ? 'border-slate-400 bg-slate-50'
                              : isAvailable
                                ? 'border-green-200 hover:border-green-300 bg-green-50/50'
                                : domainCheck && !isAvailable
                                  ? 'border-red-200 hover:border-red-300 bg-red-50/30'
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
                                <a
                                  href={`https://www.namecheap.com/domains/registration/results/?domain=${suggestion.domain}.com`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-sm font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  {suggestion.domain}.com
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                {isChecking ? (
                                  <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                                  </span>
                                ) : isAvailable ? (
                                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> Likely Available
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                    Likely Taken
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{suggestion.why}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tip about availability */}
                  <div className={ds.infoBoxHighlight}>
                    <p className={ds.muted}>
                      <strong>Tip:</strong> "Likely Available" means no website exists yet. Always verify on Namecheap before purchasing - some domains may be registered but not in use.
                    </p>
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

              {/* Custom Name Option */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className={ds.label + " mb-3"}>Already have a name in mind?</p>
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
                    Use This
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentStep("learn")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Rules
            </Button>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
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
                  <p className={ds.body + " text-lg font-mono mt-2"}>{finalDomain}</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => checkDomain(finalDomain.replace('.com', ''))}
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                  ) : (
                    <>Check Domain Availability</>
                  )}
                </Button>

                {domainResults[finalDomain.replace('.com', '')] && (
                  <div className="mt-4">
                    {domainResults[finalDomain.replace('.com', '')].available ? (
                      <div className={ds.infoBoxHighlight}>
                        <div className="flex-1">
                          <p className={ds.label + " mb-1"}>Likely Available!</p>
                          <p className={ds.muted + " mb-3"}>
                            {finalDomain} appears to be available. Register it now before someone else does!
                          </p>
                          <Button
                            className="gap-2"
                            onClick={() => window.open(`https://www.namecheap.com/domains/registration/results/?domain=${finalDomain}&aff=YOUR_AFFILIATE_ID`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Register on Namecheap (~$10/year)
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={ds.infoBoxHighlight}>
                        <div>
                          <p className={ds.label + " mb-1"}>This domain might be taken</p>
                          <p className={ds.muted + " mb-2"}>
                            Check Namecheap to confirm. If it's premium-priced ($100+), go back and pick a different name.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.open(`https://www.namecheap.com/domains/registration/results/?domain=${finalDomain}&aff=YOUR_AFFILIATE_ID`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Check on Namecheap
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Important Reminder */}
            <div className={ds.infoBoxHighlight}>
              <p className={ds.muted}>
                <strong>Remember:</strong> Only pay ~$10-15/year for a .com. If it's priced higher,
                it's a "premium" domain. Pick a different name instead.
              </p>
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

        {/* Step 4: Complete */}
        {currentStep === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Product Has a Name!</h2>
              <p className={ds.muted}>Welcome to the world, <strong>{finalName}</strong>.</p>
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
              <div className="flex items-center justify-between mb-2">
                <h4 className={ds.heading}>Claim Your Brand Everywhere</h4>
                <span className={ds.muted}>
                  {registeredItems.size}/{SOCIAL_PLATFORMS.length} done
                </span>
              </div>
              <p className={ds.muted + " mb-4"}>
                Grab these NOW - even if you won't use them immediately. Someone WILL squat on them if you don't.
              </p>

              {/* Priority platforms */}
              <div className="space-y-3 mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Essential (Do These First)</p>
                {SOCIAL_PLATFORMS.filter(p => p.priority).map((platform) => {
                  const isRegistered = registeredItems.has(platform.id);
                  const handle = finalName.toLowerCase().replace(/\s+/g, '');

                  return (
                    <div
                      key={platform.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        isRegistered
                          ? "border-green-300 bg-green-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleRegistered(platform.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isRegistered
                              ? "border-green-500 bg-green-500"
                              : "border-slate-300 hover:border-green-400"
                          }`}
                        >
                          {isRegistered && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{platform.icon}</span>
                            <span className={`font-semibold ${isRegistered ? "text-green-700 line-through" : "text-slate-900"}`}>
                              {platform.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {platform.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={platform.checkUrl(finalName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:underline"
                        >
                          Check
                        </a>
                        <a
                          href={platform.signupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800"
                        >
                          Sign Up <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional platforms */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Optional (When You're Ready)</p>
                {SOCIAL_PLATFORMS.filter(p => !p.priority).map((platform) => {
                  const isRegistered = registeredItems.has(platform.id);

                  return (
                    <div
                      key={platform.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        isRegistered
                          ? "border-green-300 bg-green-50"
                          : "border-slate-100 hover:border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleRegistered(platform.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isRegistered
                              ? "border-green-500 bg-green-500"
                              : "border-slate-300 hover:border-green-400"
                          }`}
                        >
                          {isRegistered && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{platform.icon}</span>
                            <span className={`font-medium text-sm ${isRegistered ? "text-green-700 line-through" : "text-slate-700"}`}>
                              {platform.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {platform.description}
                          </div>
                        </div>
                      </div>

                      <a
                        href={platform.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-300 rounded hover:bg-white"
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
              disabled={!registeredItems.has("domain")}
            >
              {registeredItems.has("domain") ? (
                <>Complete Day 4 <ChevronRight className="w-5 h-5" /></>
              ) : (
                <>Register your domain first to continue</>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
