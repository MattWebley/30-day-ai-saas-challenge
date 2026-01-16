import { useState, useMemo } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Check,
  Rocket,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";

interface Day20LaunchPlanProps {
  appName: string;
  onComplete: (data: { selectedStrategies: string[] }) => void;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  category: "launch" | "social" | "content" | "outreach" | "community" | "paid";
  effort: 1 | 2 | 3 | 4 | 5;
  timeToResults: "quick" | "medium" | "slow";
  cost: "free" | "low" | "medium" | "high";
  tips: string;
}

const STRATEGIES: Strategy[] = [
  // LAUNCH PLATFORMS
  { id: "product-hunt", name: "Product Hunt Launch", description: "Launch on Product Hunt for early adopter traffic", category: "launch", effort: 3, timeToResults: "quick", cost: "free", tips: "Prepare 2 weeks in advance. Get a hunter, prepare assets, line up supporters." },
  { id: "betalist", name: "BetaList", description: "Get featured for startup enthusiasts", category: "launch", effort: 1, timeToResults: "quick", cost: "free", tips: "Free to submit. Good for collecting emails pre-launch." },
  { id: "appsumo", name: "AppSumo Launch", description: "Offer a lifetime deal on AppSumo", category: "launch", effort: 3, timeToResults: "quick", cost: "free", tips: "High volume, low-margin. Great for cash injection & social proof." },
  { id: "hacker-news", name: "Hacker News (Show HN)", description: "Launch post for tech audience", category: "launch", effort: 2, timeToResults: "quick", cost: "free", tips: "Very technical audience. Best for developer tools." },
  { id: "indie-hackers", name: "Indie Hackers", description: "Share your story and product", category: "launch", effort: 2, timeToResults: "quick", cost: "free", tips: "Great for connecting with other founders." },
  { id: "startup-directories", name: "Startup Directories", description: "List on 50+ directories (SaaSHub, etc)", category: "launch", effort: 2, timeToResults: "medium", cost: "free", tips: "Tedious but free backlinks + small traffic." },

  // SOCIAL MEDIA
  { id: "build-in-public", name: "Build in Public (Twitter/X)", description: "Share your journey and lessons", category: "social", effort: 2, timeToResults: "slow", cost: "free", tips: "Consistency > perfection. Share real numbers." },
  { id: "linkedin-content", name: "LinkedIn Content", description: "Post valuable content for B2B audiences", category: "social", effort: 2, timeToResults: "medium", cost: "free", tips: "Best for B2B. Personal stories perform well." },
  { id: "tiktok", name: "TikTok Content", description: "Short-form video showing your product", category: "social", effort: 3, timeToResults: "medium", cost: "free", tips: "Show the problem & solution in 30 seconds." },
  { id: "instagram-reels", name: "Instagram Reels", description: "Short videos for visual products", category: "social", effort: 3, timeToResults: "medium", cost: "free", tips: "Repurpose TikTok content. Good for B2C." },
  { id: "youtube-shorts", name: "YouTube Shorts", description: "Quick 60-second product videos", category: "social", effort: 2, timeToResults: "medium", cost: "free", tips: "Repurpose TikTok content." },

  // CONTENT
  { id: "youtube", name: "YouTube Tutorials", description: "Video content solving problems", category: "content", effort: 4, timeToResults: "slow", cost: "low", tips: "How-to videos compound over time." },
  { id: "seo-content", name: "SEO / Blog Content", description: "Articles that rank in Google", category: "content", effort: 4, timeToResults: "slow", cost: "free", tips: "Takes 3-6 months. Focus on long-tail keywords." },
  { id: "guest-posting", name: "Guest Posting", description: "Write articles for other blogs", category: "content", effort: 3, timeToResults: "medium", cost: "free", tips: "Aim for blogs your audience reads." },
  { id: "substack-newsletter", name: "Start a Newsletter", description: "Build an email list with content", category: "content", effort: 3, timeToResults: "slow", cost: "free", tips: "Long-term asset. Owned audience." },
  { id: "podcast-guesting", name: "Podcast Guesting", description: "Appear on podcasts your audience listens to", category: "content", effort: 3, timeToResults: "medium", cost: "free", tips: "Pitch 10+ podcasts. Focus on smaller shows." },
  { id: "webinars", name: "Host Webinars", description: "Teach something valuable, pitch at end", category: "content", effort: 3, timeToResults: "quick", cost: "free", tips: "80% education, 20% pitch." },

  // COMMUNITIES
  { id: "reddit", name: "Reddit Communities", description: "Engage in relevant subreddits", category: "community", effort: 3, timeToResults: "medium", cost: "free", tips: "Be helpful first. Redditors hate obvious marketing." },
  { id: "facebook-groups", name: "Facebook Groups", description: "Join and contribute to niche groups", category: "community", effort: 2, timeToResults: "medium", cost: "free", tips: "Answer questions without pitching." },
  { id: "discord-servers", name: "Discord Communities", description: "Engage in Discord servers in your niche", category: "community", effort: 2, timeToResults: "medium", cost: "free", tips: "Be a regular contributor first." },
  { id: "slack-communities", name: "Slack Communities", description: "Participate in professional Slack groups", category: "community", effort: 2, timeToResults: "medium", cost: "free", tips: "Great for B2B." },
  { id: "niche-forums", name: "Niche Forums", description: "Participate in industry-specific forums", category: "community", effort: 2, timeToResults: "medium", cost: "free", tips: "Find where YOUR audience hangs out." },

  // OUTREACH
  { id: "cold-email", name: "Cold Email Outreach", description: "Reach out directly to potential customers", category: "outreach", effort: 3, timeToResults: "quick", cost: "low", tips: "Personalization is key. 1-3% reply rate is normal." },
  { id: "cold-dm", name: "Cold DMs (Twitter/LinkedIn)", description: "Direct message potential customers", category: "outreach", effort: 3, timeToResults: "quick", cost: "free", tips: "Be genuine, not salesy. Offer value first." },
  { id: "loom-demos", name: "Personalized Loom Demos", description: "Send personalized video demos to prospects", category: "outreach", effort: 3, timeToResults: "quick", cost: "free", tips: "Higher response rate than cold emails." },
  { id: "warm-intros", name: "Ask for Warm Intros", description: "Get introduced through mutual connections", category: "outreach", effort: 2, timeToResults: "quick", cost: "free", tips: "Highest conversion rate." },

  // PAID
  { id: "google-ads", name: "Google Ads", description: "Pay for search clicks", category: "paid", effort: 4, timeToResults: "quick", cost: "high", tips: "High intent traffic. Start with exact match." },
  { id: "facebook-ads", name: "Facebook/Meta Ads", description: "Target demographics and interests", category: "paid", effort: 4, timeToResults: "quick", cost: "high", tips: "Great for B2C. Requires creative testing." },
  { id: "micro-influencers", name: "Micro-Influencers", description: "Pay small creators (1K-50K followers)", category: "paid", effort: 3, timeToResults: "quick", cost: "low", tips: "Often better ROI than big influencers." },
  { id: "newsletter-sponsorship", name: "Newsletter Sponsorships", description: "Sponsor newsletters your audience reads", category: "paid", effort: 2, timeToResults: "quick", cost: "medium", tips: "Test small before committing big." },
  { id: "youtube-sponsors", name: "YouTube Sponsorships", description: "Sponsor YouTube videos in your niche", category: "paid", effort: 2, timeToResults: "quick", cost: "medium", tips: "Videos keep getting views. Evergreen traffic." },
];

const COST_LABELS = {
  free: { label: "Free", color: "text-green-600", bg: "bg-green-100" },
  low: { label: "$50-200", color: "text-blue-600", bg: "bg-blue-100" },
  medium: { label: "$200-1K", color: "text-amber-600", bg: "bg-amber-100" },
  high: { label: "$1K+", color: "text-red-600", bg: "bg-red-100" },
};

const TIME_LABELS = {
  quick: { label: "Days-Weeks", color: "text-green-600" },
  medium: { label: "1-3 Months", color: "text-amber-600" },
  slow: { label: "3-6+ Months", color: "text-red-600" },
};

const CATEGORY_LABELS = {
  launch: "Launch Platforms",
  social: "Social Media",
  content: "Content",
  community: "Communities",
  outreach: "Direct Outreach",
  paid: "Paid Ads",
};

export function Day20LaunchPlan({ appName, onComplete }: Day20LaunchPlanProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"intro" | "pick" | "complete">("intro");
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [showAllStrategies, setShowAllStrategies] = useState(false);
  const [filters, setFilters] = useState({
    cost: "all" as "all" | "free" | "low" | "medium" | "high",
  });

  const filteredStrategies = useMemo(() => {
    return STRATEGIES.filter((s) => {
      if (filters.cost !== "all" && s.cost !== filters.cost) return false;
      return true;
    });
  }, [filters]);

  const displayedStrategies = showAllStrategies ? filteredStrategies : filteredStrategies.slice(0, 12);

  const toggleStrategy = (id: string) => {
    if (selectedStrategies.includes(id)) {
      setSelectedStrategies(selectedStrategies.filter((s) => s !== id));
    } else if (selectedStrategies.length < 3) {
      setSelectedStrategies([...selectedStrategies, id]);
    }
  };

  const selectedStrategyData = STRATEGIES.filter((s) => selectedStrategies.includes(s.id));

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Your Launch Plan</h3>
        <p className="text-slate-600 mt-1">
          Pick 1-3 ways to get {appName || "your app"} in front of customers.
        </p>
      </Card>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-start gap-4">
              <Rocket className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">
                  A Product Nobody Knows About Makes $0
                </h4>
                <p className="text-slate-700">
                  You've built something. Now you need to get it in front of people who will pay for it.
                  There are dozens of ways to do this. You only need 1-3 to work.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-amber-100 bg-amber-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">The Overwhelm Trap</h4>
            <p className="text-slate-700 mb-3">
              Most people try to do EVERYTHING: Twitter AND TikTok AND YouTube AND SEO AND ads AND...
            </p>
            <p className="text-slate-700 font-medium">
              Result? They do nothing well. Pick 1-3 channels that fit YOU and go deep.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What You'll Choose From</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="font-medium text-slate-900">{label}</p>
                  <p className="text-sm text-slate-500">
                    {STRATEGIES.filter(s => s.category === key).length} options
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("pick")}
          >
            Show Me the Options <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Pick Strategies */}
      {step === "pick" && (
        <>
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="text-center mb-2">
              <p className="text-slate-700 font-medium">
                {STRATEGIES.length} ways to get customers. Pick <strong>1-3</strong> to focus on.
              </p>
            </div>
          </Card>

          {/* Filter */}
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-700">Filter by cost:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "free", "low", "medium", "high"] as const).map((cost) => (
                <button
                  key={cost}
                  onClick={() => setFilters({ cost })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filters.cost === cost
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cost === "all" ? "All" : cost === "free" ? "Free Only" : COST_LABELS[cost].label}
                </button>
              ))}
            </div>
          </Card>

          {/* Selection Status */}
          <Card className={`p-4 border-2 ${selectedStrategies.length >= 1 ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-900">
                  {selectedStrategies.length}/3 selected
                </span>
                {selectedStrategies.length === 0 && (
                  <p className="text-sm text-slate-600">Tap to select</p>
                )}
                {selectedStrategies.length >= 1 && (
                  <p className="text-sm text-green-700 font-medium">
                    {selectedStrategies.length === 1 ? "1 focused channel can build a business!" :
                     selectedStrategies.length === 2 ? "Solid foundation!" : "Max focus!"}
                  </p>
                )}
              </div>
              {selectedStrategies.length >= 1 && (
                <Button onClick={() => setStep("complete")} className="gap-2">
                  Done <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>

          {/* Strategy Cards */}
          <div className="space-y-2">
            {displayedStrategies.map((strategy) => {
              const isSelected = selectedStrategies.includes(strategy.id);
              const costInfo = COST_LABELS[strategy.cost];
              const timeInfo = TIME_LABELS[strategy.timeToResults];

              return (
                <Card
                  key={strategy.id}
                  className={`p-3 border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => toggleStrategy(strategy.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? "border-primary bg-primary text-white" : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{strategy.name}</h4>
                          <p className="text-xs text-slate-600">{strategy.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${costInfo.bg} ${costInfo.color} flex-shrink-0`}>
                          {costInfo.label}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span className={timeInfo.color}>{timeInfo.label}</span>
                        <span>Effort: {strategy.effort}/5</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Show More/Less */}
          {filteredStrategies.length > 12 && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowAllStrategies(!showAllStrategies)}
            >
              {showAllStrategies ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show All {filteredStrategies.length} Options <ChevronDown className="w-4 h-4" /></>
              )}
            </Button>
          )}

          {selectedStrategies.length >= 1 && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("complete")}
            >
              Lock In My Focus <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <Rocket className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-2">Your Launch Channels</h4>
              <p className="text-slate-700">
                Focus on these. Ignore everything else until one works.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="space-y-3">
              {selectedStrategyData.map((s, i) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{s.name}</h4>
                      <p className="text-slate-600 text-sm mt-1">{s.tips}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <p className="text-slate-700">Want to change your choices?</p>
              <Button variant="outline" size="sm" onClick={() => setStep("pick")} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Change
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Tomorrow: The Finish Line</h4>
            <p className="text-slate-700">
              Day 21 is about seeing what {appName || "your app"} could earn - and completing the challenge.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({ selectedStrategies })}
          >
            Complete Day 20 <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
