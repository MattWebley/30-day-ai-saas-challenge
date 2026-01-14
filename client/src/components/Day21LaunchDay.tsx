import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Trophy,
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  Calculator,
  Target,
  ArrowUpRight,
  Calendar,
  MessageSquare,
  Star,
  Rocket,
  Filter,
  Check,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Day21LaunchDayProps {
  appName: string;
  onComplete: (data: { monthlyGoal: number; pricePoint: number; customersNeeded: number; selectedStrategies: string[]; commitmentStatement: string }) => void;
}

const PRICE_TIERS = [
  { price: 9, label: "$9/mo", description: "Low barrier, high volume needed" },
  { price: 29, label: "$29/mo", description: "Sweet spot for most SaaS" },
  { price: 49, label: "$49/mo", description: "Premium positioning" },
  { price: 99, label: "$99/mo", description: "High-value, fewer customers" },
  { price: 199, label: "$199/mo", description: "Enterprise-lite" },
];

const INCOME_MILESTONES = [
  { amount: 1000, label: "$1K/mo", emoji: "🎯", description: "Covers a car payment or nice dinner out every week" },
  { amount: 2500, label: "$2.5K/mo", emoji: "🔥", description: "Part-time income, real validation" },
  { amount: 5000, label: "$5K/mo", emoji: "💰", description: "Replace a decent salary, work from anywhere" },
  { amount: 10000, label: "$10K/mo", emoji: "🚀", description: "Six figures annually, life-changing money" },
  { amount: 25000, label: "$25K/mo", emoji: "💎", description: "Top 1% of indie hackers" },
];

const BUSINESS_PILLARS = [
  {
    icon: Users,
    title: "Customer Acquisition",
    question: "How do you consistently get new customers every month?",
  },
  {
    icon: DollarSign,
    title: "Sales & Conversion",
    question: "How do you turn visitors into paying customers?",
  },
  {
    icon: TrendingUp,
    title: "Retention & Growth",
    question: "How do you keep customers paying month after month?",
  },
  {
    icon: Zap,
    title: "Operations & Scale",
    question: "How do you run this without burning out?",
  },
];

// Customer Acquisition Strategies (moved from Day 20)
interface Strategy {
  id: string;
  name: string;
  description: string;
  category: "free" | "paid" | "content" | "outreach" | "community";
  effort: 1 | 2 | 3 | 4 | 5;
  timeToResults: "quick" | "medium" | "slow";
  cost: "free" | "low" | "medium" | "high";
  impactPotential: "low" | "medium" | "high";
  tips: string;
}

const STRATEGIES: Strategy[] = [
  // LAUNCH PLATFORMS
  { id: "product-hunt", name: "Product Hunt Launch", description: "Launch on Product Hunt for early adopter traffic", category: "free", effort: 3, timeToResults: "quick", cost: "free", impactPotential: "high", tips: "Prepare 2 weeks in advance. Get hunter, prepare assets, line up supporters." },
  { id: "betalist", name: "BetaList", description: "Get featured on BetaList for startup enthusiasts", category: "free", effort: 1, timeToResults: "quick", cost: "free", impactPotential: "low", tips: "Free to submit. Good for collecting emails pre-launch." },
  { id: "appsumo", name: "AppSumo Launch", description: "Offer a lifetime deal on AppSumo marketplace", category: "free", effort: 3, timeToResults: "quick", cost: "free", impactPotential: "high", tips: "High volume, low-margin customers. Great for cash injection & social proof." },
  { id: "hacker-news", name: "Hacker News (Show HN)", description: "Launch post for tech audience", category: "community", effort: 2, timeToResults: "quick", cost: "free", impactPotential: "medium", tips: "Very technical audience. Best for developer tools." },
  { id: "indie-hackers", name: "Indie Hackers", description: "Share your story and product", category: "community", effort: 2, timeToResults: "quick", cost: "free", impactPotential: "low", tips: "Great for connecting with other founders." },
  { id: "startup-directories", name: "Startup Directories", description: "List on 50+ directories (SaaSHub, AlternativeTo)", category: "free", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "low", tips: "Tedious but free backlinks + small traffic." },

  // SOCIAL MEDIA
  { id: "build-in-public", name: "Build in Public (Twitter/X)", description: "Share your journey and lessons on Twitter", category: "content", effort: 2, timeToResults: "slow", cost: "free", impactPotential: "medium", tips: "Consistency > perfection. Share real numbers." },
  { id: "linkedin-content", name: "LinkedIn Content", description: "Post valuable content for B2B audiences", category: "content", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Best for B2B. Personal stories perform well." },
  { id: "tiktok", name: "TikTok Content", description: "Short-form video showing your product", category: "content", effort: 3, timeToResults: "medium", cost: "free", impactPotential: "high", tips: "Show the problem & solution in 30 seconds." },
  { id: "instagram-reels", name: "Instagram Reels", description: "Short videos for visual products", category: "content", effort: 3, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Repurpose TikTok content. Good for B2C." },
  { id: "twitter-threads", name: "Twitter/X Threads", description: "Educational threads showcasing expertise", category: "content", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "One great thread can go viral." },

  // VIDEO
  { id: "youtube", name: "YouTube Tutorials", description: "Video content solving problems", category: "content", effort: 4, timeToResults: "slow", cost: "low", impactPotential: "high", tips: "How-to videos compound over time." },
  { id: "youtube-shorts", name: "YouTube Shorts", description: "Quick 60-second product videos", category: "content", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Repurpose TikTok content." },
  { id: "loom-demos", name: "Personalized Loom Demos", description: "Send personalized video demos to prospects", category: "outreach", effort: 3, timeToResults: "quick", cost: "free", impactPotential: "medium", tips: "Higher response rate than cold emails." },

  // WRITTEN CONTENT
  { id: "seo-content", name: "SEO / Blog Content", description: "Articles that rank in Google", category: "content", effort: 4, timeToResults: "slow", cost: "free", impactPotential: "high", tips: "Takes 3-6 months. Focus on long-tail keywords." },
  { id: "guest-posting", name: "Guest Posting", description: "Write articles for other blogs", category: "content", effort: 3, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Aim for blogs your audience reads." },
  { id: "quora-answers", name: "Quora Answers", description: "Answer questions and mention your product", category: "content", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "low", tips: "Find questions with traffic. Be helpful." },
  { id: "medium-articles", name: "Medium Articles", description: "Publish on Medium for built-in audience", category: "content", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "low", tips: "Join relevant publications." },
  { id: "substack-newsletter", name: "Start a Newsletter", description: "Build an email list with content", category: "content", effort: 3, timeToResults: "slow", cost: "free", impactPotential: "high", tips: "Long-term asset. Owned audience." },

  // COMMUNITIES
  { id: "reddit", name: "Reddit Communities", description: "Engage in relevant subreddits", category: "community", effort: 3, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Be helpful first. Redditors hate obvious marketing." },
  { id: "facebook-groups", name: "Facebook Groups", description: "Join and contribute to niche groups", category: "community", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Answer questions without pitching." },
  { id: "discord-servers", name: "Discord Communities", description: "Engage in Discord servers in your niche", category: "community", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "low", tips: "Be a regular contributor first." },
  { id: "slack-communities", name: "Slack Communities", description: "Participate in professional Slack groups", category: "community", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "low", tips: "Great for B2B." },
  { id: "niche-forums", name: "Niche Forums", description: "Participate in industry-specific forums", category: "community", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "low", tips: "Find where YOUR audience hangs out." },
  { id: "community-building", name: "Build Your Own Community", description: "Create a Discord/Slack community", category: "community", effort: 5, timeToResults: "slow", cost: "free", impactPotential: "high", tips: "Long-term play. Community becomes a moat." },

  // OUTREACH
  { id: "cold-email", name: "Cold Email Outreach", description: "Reach out directly to potential customers", category: "outreach", effort: 3, timeToResults: "quick", cost: "low", impactPotential: "medium", tips: "Personalization is key. 1-3% reply rate is normal." },
  { id: "cold-dm", name: "Cold DMs (Twitter/LinkedIn)", description: "Direct message potential customers", category: "outreach", effort: 3, timeToResults: "quick", cost: "free", impactPotential: "medium", tips: "Be genuine, not salesy. Offer value first." },
  { id: "linkedin-outreach", name: "LinkedIn Connection Requests", description: "Connect with prospects and start conversations", category: "outreach", effort: 2, timeToResults: "quick", cost: "free", impactPotential: "medium", tips: "Don't pitch in the connection request." },
  { id: "warm-intros", name: "Ask for Warm Intros", description: "Get introduced through mutual connections", category: "outreach", effort: 2, timeToResults: "quick", cost: "free", impactPotential: "high", tips: "Highest conversion rate." },

  // PARTNERSHIPS
  { id: "partnerships", name: "Strategic Partnerships", description: "Partner with complementary tools", category: "free", effort: 4, timeToResults: "slow", cost: "free", impactPotential: "high", tips: "Takes relationship building." },
  { id: "podcast-guesting", name: "Podcast Guesting", description: "Appear on podcasts your audience listens to", category: "content", effort: 3, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Pitch 10+ podcasts. Focus on smaller shows." },
  { id: "micro-influencers", name: "Micro-Influencers", description: "Pay small creators (1K-50K followers)", category: "paid", effort: 3, timeToResults: "quick", cost: "low", impactPotential: "medium", tips: "Often better ROI than big influencers." },
  { id: "influencer-marketing", name: "Influencer Marketing", description: "Pay larger creators to promote", category: "paid", effort: 3, timeToResults: "quick", cost: "high", impactPotential: "high", tips: "Negotiate performance-based deals." },
  { id: "youtube-sponsors", name: "YouTube Sponsorships", description: "Sponsor YouTube videos in your niche", category: "paid", effort: 2, timeToResults: "quick", cost: "medium", impactPotential: "high", tips: "Videos keep getting views. Evergreen traffic." },

  // REFERRAL
  { id: "referral-program", name: "Referral Program", description: "Reward customers for referrals", category: "free", effort: 3, timeToResults: "medium", cost: "low", impactPotential: "high", tips: "Needs existing happy customers." },
  { id: "affiliate", name: "Affiliate Program", description: "Pay commission for each customer", category: "paid", effort: 3, timeToResults: "medium", cost: "medium", impactPotential: "high", tips: "20-30% commission is standard." },
  { id: "lifetime-deal-sites", name: "Lifetime Deal Sites", description: "List on StackSocial, PitchGround", category: "free", effort: 2, timeToResults: "quick", cost: "free", impactPotential: "medium", tips: "Similar to AppSumo but smaller." },

  // PAID ADS
  { id: "google-ads", name: "Google Ads", description: "Pay for search clicks", category: "paid", effort: 4, timeToResults: "quick", cost: "high", impactPotential: "high", tips: "High intent traffic. Start with exact match." },
  { id: "facebook-ads", name: "Facebook/Meta Ads", description: "Target demographics and interests", category: "paid", effort: 4, timeToResults: "quick", cost: "high", impactPotential: "medium", tips: "Great for B2C. Requires creative testing." },
  { id: "linkedin-ads", name: "LinkedIn Ads", description: "Target by job title, company, industry", category: "paid", effort: 3, timeToResults: "quick", cost: "high", impactPotential: "medium", tips: "Expensive but very targeted for B2B." },
  { id: "twitter-ads", name: "Twitter/X Ads", description: "Promoted tweets and accounts", category: "paid", effort: 3, timeToResults: "quick", cost: "medium", impactPotential: "low", tips: "Cheaper. Good for tech audiences." },
  { id: "reddit-ads", name: "Reddit Ads", description: "Target specific subreddits", category: "paid", effort: 2, timeToResults: "quick", cost: "medium", impactPotential: "medium", tips: "Cheap and targeted." },
  { id: "tiktok-ads", name: "TikTok Ads", description: "Reach younger demographics", category: "paid", effort: 3, timeToResults: "quick", cost: "medium", impactPotential: "medium", tips: "UGC-style performs best." },
  { id: "newsletter-sponsorship", name: "Newsletter Sponsorships", description: "Sponsor newsletters your audience reads", category: "paid", effort: 2, timeToResults: "quick", cost: "medium", impactPotential: "medium", tips: "Test small before committing big." },
  { id: "podcast-ads", name: "Podcast Advertising", description: "Sponsor podcasts", category: "paid", effort: 2, timeToResults: "quick", cost: "medium", impactPotential: "medium", tips: "Host-read ads convert best." },

  // LEAD GEN
  { id: "free-tool", name: "Free Tool / Calculator", description: "Build a free tool that attracts customers", category: "free", effort: 4, timeToResults: "medium", cost: "free", impactPotential: "high", tips: "Solves a related problem. Captures emails." },
  { id: "lead-magnet", name: "Lead Magnet (PDF/Template)", description: "Offer a download for email", category: "free", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Checklist, template, or guide." },
  { id: "freemium", name: "Freemium Model", description: "Offer a free tier to attract users", category: "free", effort: 4, timeToResults: "medium", cost: "free", impactPotential: "high", tips: "Free tier should be useful but limited." },
  { id: "open-source", name: "Open Source Component", description: "Open source part of your product", category: "free", effort: 4, timeToResults: "slow", cost: "free", impactPotential: "medium", tips: "Developers find it, some convert." },

  // REVIEWS
  { id: "g2-capterra", name: "G2 / Capterra Listings", description: "Get listed on software review sites", category: "free", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "B2B buyers check these sites." },
  { id: "trustpilot", name: "Trustpilot Reviews", description: "Build social proof with reviews", category: "free", effort: 1, timeToResults: "slow", cost: "free", impactPotential: "low", tips: "Automate review requests." },

  // EVENTS
  { id: "webinars", name: "Host Webinars", description: "Teach something valuable, pitch at end", category: "content", effort: 3, timeToResults: "quick", cost: "free", impactPotential: "medium", tips: "80% education, 20% pitch." },
  { id: "live-demos", name: "Weekly Live Demos", description: "Open demo sessions for prospects", category: "content", effort: 2, timeToResults: "quick", cost: "free", impactPotential: "medium", tips: "Low-pressure way to see the product." },
  { id: "virtual-summits", name: "Speak at Virtual Summits", description: "Present at online conferences", category: "content", effort: 3, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Establish authority." },
  { id: "local-meetups", name: "Local Meetups & Events", description: "Attend or speak at local events", category: "community", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "low", tips: "Great for B2B local businesses." },

  // PR
  { id: "press-outreach", name: "Press/PR Outreach", description: "Pitch journalists for coverage", category: "free", effort: 4, timeToResults: "medium", cost: "free", impactPotential: "high", tips: "Craft a newsworthy angle. Use HARO." },
  { id: "haro", name: "HARO (Help a Reporter)", description: "Respond to journalist queries", category: "free", effort: 2, timeToResults: "medium", cost: "free", impactPotential: "medium", tips: "Respond quickly with genuine expertise." },
];

const COST_LABELS = {
  free: { label: "Free", color: "text-green-600", bg: "bg-green-100" },
  low: { label: "$50-200/mo", color: "text-blue-600", bg: "bg-blue-100" },
  medium: { label: "$200-1000/mo", color: "text-amber-600", bg: "bg-amber-100" },
  high: { label: "$1000+/mo", color: "text-red-600", bg: "bg-red-100" },
};

const TIME_LABELS = {
  quick: { label: "Days-Weeks", color: "text-green-600" },
  medium: { label: "1-3 Months", color: "text-amber-600" },
  slow: { label: "3-6+ Months", color: "text-red-600" },
};

export function Day21LaunchDay({ appName, onComplete }: Day21LaunchDayProps) {
  const [step, setStep] = useState<"intro" | "calculator" | "strategies" | "vision" | "cta" | "complete">("intro");
  const [selectedPrice, setSelectedPrice] = useState(29);
  const [targetIncome, setTargetIncome] = useState(5000);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [commitmentStatement, setCommitmentStatement] = useState("");
  const [showAllStrategies, setShowAllStrategies] = useState(false);
  const [filters, setFilters] = useState({
    cost: "all" as "all" | "free" | "low" | "medium" | "high",
  });

  const customersNeeded = Math.ceil(targetIncome / selectedPrice);
  const yearlyIncome = targetIncome * 12;

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
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">The Money</h3>
        <p className="text-slate-600 mt-1">
          Let's see what {appName || "your app"} could actually earn - and how to get there.
        </p>
      </Card>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className="p-8 border-2 border-green-100 bg-green-50">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-3">
                You Did Something Most People Never Will
              </h4>
              <p className="text-slate-700 text-lg">
                You went from idea to working product in 21 days.
                You're now in the <strong>top 1%</strong> of people who actually BUILD things.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">The SaaS Math is Beautiful</h4>
            <div className="space-y-4 text-slate-700">
              <p>
                Unlike one-time sales, SaaS is <strong>recurring revenue</strong>.
                Every customer you get pays you again next month. And the month after.
              </p>
              <p>
                100 customers at $29/month = <strong>$2,900/month</strong> = <strong>$34,800/year</strong>
              </p>
              <p className="font-bold">
                That's not a side project. That's a salary.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What Could You Do With...</h4>
            <div className="space-y-3">
              {INCOME_MILESTONES.slice(0, 4).map((milestone) => (
                <div
                  key={milestone.amount}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="text-2xl">{milestone.emoji}</span>
                  <div>
                    <p className="font-bold text-slate-900">{milestone.label}</p>
                    <p className="text-slate-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-600 text-sm">
              <strong>Earnings Disclaimer:</strong> These numbers are hypothetical examples for educational purposes only.
              No income is guaranteed. Most software products never generate significant revenue.
              Your results depend entirely on your execution, market conditions, product quality, and many other factors.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("calculator")}
          >
            Calculate My Potential <Calculator className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Calculator */}
      {step === "calculator" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-slate-700" />
              <h4 className="font-bold text-lg text-slate-900">What's Your Monthly Income Goal?</h4>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-slate-900 mb-2">
                  ${targetIncome.toLocaleString()}<span className="text-xl font-normal text-slate-500">/month</span>
                </p>
                <p className="text-slate-600">
                  = ${yearlyIncome.toLocaleString()}/year
                </p>
              </div>

              <Slider
                value={[targetIncome]}
                onValueChange={(value) => setTargetIncome(value[0])}
                min={1000}
                max={25000}
                step={500}
                className="w-full"
              />

              <div className="flex justify-between text-sm text-slate-500">
                <span>$1K/mo</span>
                <span>$25K/mo</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6 text-slate-700" />
              <h4 className="font-bold text-lg text-slate-900">Pick Your Price Point</h4>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {PRICE_TIERS.map((tier) => (
                <button
                  key={tier.price}
                  onClick={() => setSelectedPrice(tier.price)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    selectedPrice === tier.price
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-bold text-slate-900">{tier.label}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-slate-500 mt-3">
              {PRICE_TIERS.find(t => t.price === selectedPrice)?.description}
            </p>
          </Card>

          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <Users className="w-10 h-10 text-green-600 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">To hit ${targetIncome.toLocaleString()}/month at ${selectedPrice}/month, you need:</p>
              <p className="text-5xl font-extrabold text-slate-900 mb-2">
                {customersNeeded} customers
              </p>
              <p className="text-slate-600">
                That's it. {customersNeeded} people who pay you ${selectedPrice}/month.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Put That In Perspective</h4>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                <p>
                  <strong>{customersNeeded} people</strong> is a small town Facebook group.
                  A niche subreddit. A tiny fraction of LinkedIn.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                <p>
                  You don't need to go viral. You don't need millions of users.
                  You need <strong>{customersNeeded} people</strong> who have the problem you solve.
                </p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("strategies")}
          >
            How Do I Get Those Customers? <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Customer Acquisition Strategies */}
      {step === "strategies" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="text-center">
              <h4 className="font-bold text-xl text-slate-900 mb-2">
                {STRATEGIES.length} Ways to Get Customers
              </h4>
              <p className="text-slate-600">
                You only need <strong>1-2-3 to actually work</strong>. Pick the ones that fit YOU.
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
                  {selectedStrategies.length}/3 strategies selected
                </span>
                {selectedStrategies.length === 0 && (
                  <p className="text-sm text-slate-600">Pick 1-3 to focus on</p>
                )}
                {selectedStrategies.length >= 1 && (
                  <p className="text-sm text-green-700 font-medium">
                    {selectedStrategies.length === 1 ? "1 strategy can build a business!" :
                     selectedStrategies.length === 2 ? "Solid foundation!" : "Max focus - perfect!"}
                  </p>
                )}
              </div>
              {selectedStrategies.length >= 1 && (
                <Button onClick={() => setStep("vision")} className="gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
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
                <>Show All {filteredStrategies.length} Strategies <ChevronDown className="w-4 h-4" /></>
              )}
            </Button>
          )}

          {selectedStrategies.length >= 1 && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("vision")}
            >
              Lock In My Focus <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </>
      )}

      {/* Step 4: Vision */}
      {step === "vision" && (
        <>
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your Growth Plan</h4>
            <div className="space-y-2">
              {selectedStrategyData.map((s, i) => (
                <div key={s.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-sm text-slate-600">{s.tips}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Picture This in 12 Months...</h4>
            <div className="space-y-4 text-slate-700">
              <p>
                {appName || "Your app"} has <strong>{customersNeeded}+ paying customers</strong>.
              </p>
              <p>
                Your phone buzzes with Stripe notifications: <strong>${targetIncome.toLocaleString()}/month</strong> coming in automatically.
              </p>
              <p>
                You wake up to emails from happy users. Some asking for features.
                Some just saying thanks.
              </p>
              <p className="font-bold text-slate-900 pt-2">
                That's not a fantasy. That's what happens when you turn an app into a business.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">But Here's the Thing...</h4>
            <p className="text-slate-700">
              You CAN hit ${targetIncome.toLocaleString()}/month. People do it every day.
            </p>
            <p className="text-slate-700 mt-3 font-bold">
              But most people who build apps never get there. Why?
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">The Gap Between App and Business</h4>
            <div className="space-y-3">
              {BUSINESS_PILLARS.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <pillar.icon className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">{pillar.title}</p>
                    <p className="text-slate-600 text-sm">{pillar.question}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("cta")}
          >
            What Do I Do Next? <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 5: The CTA */}
      {step === "cta" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 font-medium text-center text-lg">
              You've built something real. Now let's make it profitable.
            </p>
          </Card>

          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-slate-900">Work With Me 1:1</h4>
                <p className="text-slate-600 mt-1">
                  Let's turn {appName || "your app"} into a real business together.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Weekly calls to keep you accountable and moving forward</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Direct access to ask questions when you're stuck</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Star className="w-5 h-5 text-primary" />
                <span>Help with your sales page, positioning, and pricing</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Target className="w-5 h-5 text-primary" />
                <span>A clear roadmap customized to YOUR app and market</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Users className="w-5 h-5 text-primary" />
                <span>Customer acquisition strategies that actually work</span>
              </div>
            </div>

            <a
              href="https://www.mattwebley.com/workwithmatt"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full h-16 text-xl font-bold gap-2">
                Book a Free Strategy Call With Matt <ArrowUpRight className="w-6 h-6" />
              </Button>
            </a>
            <p className="text-center text-slate-500 text-sm mt-3">
              No obligation. Let's talk about your app and your goals.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Your Commitment</h4>
            <p className="text-slate-600 mb-4">
              Whether you work with me or go it alone - write down what you're committing to:
            </p>
            <Textarea
              placeholder="I commit to...

In the next 30 days, I will...

My first milestone is..."
              value={commitmentStatement}
              onChange={(e) => setCommitmentStatement(e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          {commitmentStatement.length >= 50 ? (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("complete")}
            >
              Complete the 21 Day Challenge <Trophy className="w-5 h-5" />
            </Button>
          ) : (
            <p className="text-center text-slate-500">
              Write your commitment (50+ characters) to complete
            </p>
          )}
        </>
      )}

      {/* Step 6: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h4 className="font-bold text-3xl text-slate-900 mb-2">
                CONGRATULATIONS!
              </h4>
              <p className="text-slate-700 text-lg">
                You completed the 21 Day AI SaaS Challenge.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Your Target</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">${targetIncome.toLocaleString()}</p>
                <p className="text-slate-600">Monthly Goal</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">${selectedPrice}</p>
                <p className="text-slate-600">Per Customer</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{customersNeeded}</p>
                <p className="text-slate-600">Customers Needed</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Your Growth Focus</h4>
            {selectedStrategyData.map((s, i) => (
              <div key={s.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg mb-2 last:mb-0">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <p className="font-medium text-slate-900">{s.name}</p>
              </div>
            ))}
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Your Commitment</h4>
            <p className="text-slate-700 italic">"{commitmentStatement}"</p>
          </Card>

          <Card className="p-6 border-2 border-primary bg-primary/5">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Ready to Turn This Into a Business?</h4>
            <p className="text-slate-700 mb-4">
              You've built something real. Let's make it profitable.
            </p>
            <a
              href="https://www.mattwebley.com/workwithmatt"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full gap-2">
                Book Your Free Strategy Call <ArrowUpRight className="w-5 h-5" />
              </Button>
            </a>
          </Card>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({
              monthlyGoal: targetIncome,
              pricePoint: selectedPrice,
              customersNeeded,
              selectedStrategies,
              commitmentStatement
            })}
          >
            Finish & Return to Dashboard <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
