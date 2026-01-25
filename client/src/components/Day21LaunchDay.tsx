import { useState } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  ChevronLeft,
  Trophy,
  Users,
  DollarSign,
  Calculator,
  Target,
  ArrowUpRight,
  Sparkles,
  Zap,
  TrendingUp,
  Mail,
  Linkedin,
  Megaphone,
  UserPlus,
  FileText,
  GitCompare,
  Percent,
  Lightbulb,
  Rocket
} from "lucide-react";
import { ds } from "@/lib/design-system";

interface Day21LaunchDayProps {
  appName: string;
  onComplete: (data: { monthlyGoal: number; pricePoint: number; customersNeeded: number; commitmentStatement: string }) => void;
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
];

const PASSIVE_STRATEGIES = [
  {
    icon: FileText,
    title: "AI-Powered Blog",
    tagline: "Content that writes itself",
    what: "An automated system that generates SEO-optimized blog posts for your app, targeting keywords your customers are searching for.",
    why: "While you sleep, your blog ranks in Google and brings in visitors who are actively looking for solutions like yours. One well-ranked article can bring hundreds of visitors per month for YEARS.",
    result: "Imagine waking up to new signups from people who found your blog post at 3am."
  },
  {
    icon: GitCompare,
    title: "Comparison Pages",
    tagline: "Steal your competitors' traffic",
    what: "Pages that rank for '[Competitor] vs [Your App]' and '[Competitor] alternative' searches. People searching these terms are READY to switch.",
    why: "These are the highest-intent keywords in SaaS. Someone searching 'Notion alternative' has already decided they need a solution - they're just choosing which one.",
    result: "Your competitors spent years building their brand. You can capture their search traffic in weeks."
  },
  {
    icon: Percent,
    title: "Affiliate Program",
    tagline: "An army of salespeople",
    what: "Pay others a commission (typically 20-30%) for every paying customer they send you. Bloggers, YouTubers, and influencers promote your app to their audiences.",
    why: "You only pay when you get paid. Zero upfront cost, 100% performance-based. Affiliates have audiences that trust them - that trust transfers to your product.",
    result: "Hundreds of people actively promoting your app, and you only pay for results."
  }
];

const ACTIVE_STRATEGIES = [
  {
    icon: Mail,
    title: "Automated Cold Email",
    tagline: "Reach thousands while you sleep",
    what: "AI-personalized emails sent automatically to your ideal customers. Modern tools can send hundreds of personalized emails per day without you lifting a finger.",
    why: "Cold email is still one of the highest-ROI channels in B2B. With AI personalization, response rates are higher than ever. The cost per lead is pennies.",
  },
  {
    icon: Megaphone,
    title: "Paid Ads",
    tagline: "Instant traffic, controlled spend",
    what: "Google Ads for people actively searching. Meta Ads for targeting specific demographics. LinkedIn Ads for B2B job titles.",
    why: "Ads let you test and validate faster than any organic method. Start with $10/day, find what works, then scale. Instant feedback loop.",
  },
  {
    icon: UserPlus,
    title: "Influencer Partnerships",
    tagline: "Borrow their audience",
    what: "Pay creators to mention, review, or demo your product. Micro-influencers (1K-50K followers) often have the best ROI.",
    why: "People trust recommendations from creators they follow. One good partnership can bring more customers than months of your own content.",
  }
];

export function Day21LaunchDay({ appName, onComplete }: Day21LaunchDayProps) {
  const [step, setStep, containerRef] = useStepWithScroll<
    "intro" | "calculator" | "strategies-intro" | "passive" | "active" | "more" | "commitment" | "complete"
  >("intro");
  const [selectedPrice, setSelectedPrice] = useState(29);
  const [targetIncome, setTargetIncome] = useState(5000);
  const [commitmentStatement, setCommitmentStatement] = useState("");

  const customersNeeded = Math.ceil(targetIncome / selectedPrice);
  const yearlyIncome = targetIncome * 12;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className={ds.cardWithPadding}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-7 h-7 text-slate-600" />
              </div>
              <h4 className="font-bold text-2xl text-slate-900 mb-3">
                You Did Something Most People Never Will
              </h4>
              <p className={ds.body}>
                You went from idea to working product in 21 days.
                You're now in the top 1% of people who actually BUILD things.
              </p>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-4`}>The SaaS Numbers Are Beautiful</h4>
            <div className="space-y-4">
              <p className={ds.body}>
                Unlike one-time sales, SaaS is recurring revenue.
                Every customer you get pays you again next month. And the month after.
              </p>
              <p className={ds.body}>
                100 customers at $29/month = <strong>$2,900/month</strong> = <strong>$34,800/year</strong>
              </p>
              <p className="font-bold text-slate-900">
                That's not a side project. That's a salary.
              </p>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-4`}>The Ultimate Business Model</h4>
            <div className="space-y-3">
              <p className={ds.body}>
                <strong>Faceless.</strong> No need to be on camera, build a personal brand, or become an influencer. Your product does the talking.
              </p>
              <p className={ds.body}>
                <strong>Passive.</strong> Once it's built and the systems are in place, customers sign up, pay, and use your app without you lifting a finger.
              </p>
              <p className={ds.body}>
                <strong>Recurring.</strong> Get paid every single month from customers you already have. No more chasing one-time sales.
              </p>
              <p className={ds.body}>
                <strong>Location-free.</strong> Run it from anywhere with WiFi. Your laptop is your office. The beach, a café, your couch - you choose.
              </p>
              <p className={ds.body}>
                <strong>Automated.</strong> Signups, onboarding, billing, support - most of it runs itself with the right systems.
              </p>
              <p className="font-bold text-slate-900 mt-4">
                This is the business you can build in your spare time that eventually buys back ALL your time.
              </p>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-4`}>What Could You Do With...</h4>
            <div className="space-y-3">
              {INCOME_MILESTONES.map((milestone) => (
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
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("intro")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <Card className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h4 className={ds.heading}>What's Your Monthly Income Goal?</h4>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-900 mb-2">
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

          <Card className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h4 className={ds.heading}>Pick Your Price Point</h4>
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

          <Card className={ds.cardWithPadding}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-slate-600 mb-2">To hit ${targetIncome.toLocaleString()}/month at ${selectedPrice}/month, you need</p>
              <p className="text-4xl font-bold text-slate-900 mb-2">
                {customersNeeded} customers
              </p>
              <p className="text-slate-600">
                That's it. {customersNeeded} people paying ${selectedPrice}/month.
              </p>
            </div>
          </Card>

          <Card className="p-4 border border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              <strong>Disclaimer:</strong> These are hypothetical examples for educational purposes.
              No income is guaranteed. Results depend on execution, market, and many other factors.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("strategies-intro")}
          >
            How Do I Get Those Customers? <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Strategies Intro */}
      {step === "strategies-intro" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("calculator")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <Card className={`${ds.card} p-5`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Here's the Secret...</h3>
                <p className={ds.body}>
                  You don't need to master every marketing channel. You just need <strong>one or two that work for you</strong>.
                </p>
              </div>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-4`}>Two Types of Growth</h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <p className="font-bold text-slate-900">Passive Methods</p>
                </div>
                <p className={ds.body}>
                  Set them up once, they work forever. Traffic and leads come in while you sleep.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="font-bold text-slate-900">Active Methods</p>
                </div>
                <p className={ds.body}>
                  Require ongoing effort, but get faster results. Scale up when they work.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className={ds.body}>
              <strong>What you're about to see:</strong> I'll show you some of the most powerful growth methods - what they are and why they work.
              This challenge taught you to BUILD. These strategies are how you SELL.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("passive")}
          >
            Show Me Passive Methods <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Passive Strategies */}
      {step === "passive" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("strategies-intro")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <Card className={`${ds.card} p-5`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Passive Growth Methods</h3>
                <p className={ds.body}>
                  Set up once. They keep working while you sleep.
                </p>
              </div>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <div className="space-y-4">
              {PASSIVE_STRATEGIES.map((strategy, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 flex-shrink-0">
                    <strategy.icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{strategy.title}</h4>
                    <p className="text-sm text-slate-600">{strategy.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border border-slate-200 bg-slate-50">
            <p className={ds.body}>
              <strong>That's 3 of 30+ passive methods.</strong> Most can run on autopilot once set up - but they need to be executed perfectly with the right strategy to actually work.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("active")}
          >
            Show Me Active Methods <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 5: Active Strategies */}
      {step === "active" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("passive")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <Card className={`${ds.card} p-5`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Active Growth Methods</h3>
                <p className={ds.body}>
                  Faster results. Scale up what works.
                </p>
              </div>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <div className="space-y-4">
              {ACTIVE_STRATEGIES.map((strategy, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 flex-shrink-0">
                    <strategy.icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{strategy.title}</h4>
                    <p className="text-sm text-slate-600">{strategy.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border border-slate-200 bg-slate-50">
            <p className={ds.body}>
              <strong>That's 3 of 40+ active methods.</strong> AI can help you execute at scale - but without the right strategy, you'll waste months figuring out what actually works.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("more")}
          >
            But Wait, There's More... <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 6: More Strategies + CTA */}
      {step === "more" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("active")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <Card className={ds.cardWithPadding}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                That's Just 6 of 77+ Strategies
              </h3>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
              <p className={`${ds.body} text-center`}>
                <strong>The challenge taught you HOW to build.</strong><br/>
                The strategies above show you WHAT works.<br/>
                But implementing them properly? That's where most people get stuck.
              </p>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-3`}>Here's the Hard Truth...</h4>
            <p className={ds.body}>
              You just proved you have what it takes. You didn't quit. You didn't make excuses.
              You built something REAL while most people are still "thinking about it."
            </p>
            <p className={`${ds.body} mt-3`}>
              But here's what nobody tells you: <strong>99% of solo founders fail in the first year.</strong>
              Not because they can't build. Not because their idea is bad.
              Because they don't have someone who's been there showing them what actually works.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-900 bg-slate-900 text-white">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold mb-3">Launch, Grow & Scale Your SaaS Using the Same Free Methods That Built My $12M+ Portfolio</h4>
              <p className="text-slate-300">
                25+ years in the trenches. $12M+ in SaaS alone. I've made every mistake so you don't have to - and I'll show you exactly how to launch, grow, and scale using mostly free, organic methods that actually work.
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {[
                "How to get your first 100 paying customers without spending a penny on ads",
                "The free SEO strategy that brings in leads 24/7 while you sleep (no blogging required)",
                "Why cold outreach still works - and the exact scripts that get 40%+ reply rates",
                "The \"content multiplier\" method that turns 1 hour of work into a month of free marketing",
                                "Why most founders waste money on ads way too early - and what to do instead",
                "The community infiltration method that builds trust before you ever pitch",
                "How to turn happy customers into a referral machine without awkward asks",
                "The \"competitor audience\" hack that puts you in front of buyers who are READY to switch",
                "Why email lists beat social media followers 10-to-1 for SaaS (and how to build yours fast)",
                "The partnership strategy that got me in front of 50,000+ potential customers for $0",
                "How to rank on Google for buying keywords without waiting 12 months",
                "The free tool strategy that built a 10,000-person waitlist before launch",
                "Why \"build in public\" fails for 90% of founders - and the free alternative that actually works",
                                "How to take your sales page from 'good' to 'can't stop buying' with advanced conversion tweaks",
                "The affiliate recruitment method that brings partners to YOU (instead of begging)",
                "Why you don't need a big audience to make big money - and how to leverage other people's",
                "The 5-email welcome sequence that turns free users into paying customers on autopilot",
                "How to validate demand and get paid BEFORE you build - using free tools only"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-slate-200 text-sm">{item}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white/10 rounded-lg mb-6">
              <p className="text-white text-center font-medium">
                You've come this far. You've proven you can execute.<br/>
                Now it's time to stop guessing and get expert guidance.
              </p>
            </div>

            <a
              href="https://www.mattwebley.com/workwithmatt"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full h-16 text-xl font-bold gap-2 bg-white text-slate-900 hover:bg-slate-100">
                Book Your Call With Matt <ArrowUpRight className="w-6 h-6" />
              </Button>
            </a>
            <p className="text-center text-slate-400 text-sm mt-3">
              Serious founders only. Let's see if we're a fit.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("commitment")}
          >
            Complete the Challenge <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 7: Commitment */}
      {step === "commitment" && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("more")} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <Card className={ds.cardWithPadding}>
            <h4 className="text-xl font-bold text-slate-900 text-center mb-4">Ready for the Next Challenge?</h4>
            <p className={`${ds.body} mb-4`}>
              You've built your AI SaaS. Now comes the fun part - getting customers. I'm thinking about creating a <strong>Launch, Grow & Scale Challenge</strong> that walks you through it step by step.
            </p>
            <p className={`${ds.body} mb-4`}>
              Same format. Same daily guidance. But focused entirely on marketing your AI SaaS using mostly free methods.
            </p>
            <p className={`${ds.muted} mb-4`}>
              If enough people want it, I'll build it. Join the waitlist and you'll be first to know.
            </p>
            <a
              href="https://challenge.mattwebley.com/waitlist"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <button
                className="w-full h-16 px-6 flex items-center justify-center gap-3 text-white rounded-2xl shadow-inner font-bold cursor-pointer transition-all duration-150 text-lg bg-primary hover:bg-primary/90 border-t-2 border-primary/80 active:scale-95"
              >
                <Rocket className="w-6 h-6" />
                JOIN THE WAITLIST
              </button>
            </a>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("complete")}
          >
            Complete the 21 Day Challenge <Trophy className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 8: Complete */}
      {step === "complete" && (
        <>
          <Card className={ds.cardWithPadding}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="font-bold text-3xl text-slate-900 mb-2">
                CONGRATULATIONS!
              </h4>
              <p className={ds.body}>
                You completed the 21 Day AI SaaS Challenge.
              </p>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-3`}>Your Target</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">${targetIncome.toLocaleString()}</p>
                <p className="text-slate-600 text-sm">Monthly Goal</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">${selectedPrice}</p>
                <p className="text-slate-600 text-sm">Per Customer</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{customersNeeded}</p>
                <p className="text-slate-600 text-sm">Customers Needed</p>
              </div>
            </div>
          </Card>

          <Card className={ds.cardWithPadding}>
            <h4 className={`${ds.heading} mb-3`}>You've Proven You Can Build. Now Let's Sell.</h4>
            <p className={`${ds.body} mb-4`}>
              99% of founders fail alone. After 25+ years and $23M+ in online sales ($12M+ in SaaS), I know exactly what separates the 1% who make it.
              Book a call and let's see if I can help you get there.
            </p>
            <a
              href="https://www.mattwebley.com/workwithmatt"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full gap-2">
                Book Your Call With Matt <ArrowUpRight className="w-5 h-5" />
              </Button>
            </a>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({
              monthlyGoal: targetIncome,
              pricePoint: selectedPrice,
              customersNeeded,
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
