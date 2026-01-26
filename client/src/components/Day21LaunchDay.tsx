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
  Rocket,
  MessageSquare,
  PenTool,
  Gift,
  Youtube,
  Twitter,
  Bookmark,
  Award,
  Mic,
  Video,
  MailPlus,
  Star,
  HelpCircle,
  ListChecks,
  Newspaper,
  Share2,
  Globe,
  Handshake,
  Radio,
  ThumbsUp,
  Repeat,
  Calendar,
  Presentation,
  RefreshCw,
  Layers,
  Clock,
  HeartHandshake,
  Store,
  Crosshair
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
  { icon: FileText, title: "AI-Powered Blog", tagline: "Content that writes itself" },
  { icon: GitCompare, title: "Comparison Pages", tagline: "Steal your competitors' traffic" },
  { icon: Percent, title: "Affiliate Program", tagline: "An army of salespeople" },
  { icon: MessageSquare, title: "Reddit & Quora Answers", tagline: "Be helpful where buyers hang out" },
  { icon: Rocket, title: "Product Hunt Launch", tagline: "Get featured to thousands of early adopters" },
  { icon: PenTool, title: "Guest Post Outreach", tagline: "Get published on blogs your customers read" },
  { icon: Gift, title: "Lead Magnets & Free Tools", tagline: "Give value, capture emails" },
  { icon: Youtube, title: "Faceless YouTube Videos", tagline: "Rank in the world's second biggest search engine" },
  { icon: Twitter, title: "Twitter/X Threads", tagline: "Go viral talking about problems you solve" },
  { icon: Bookmark, title: "Directory Submissions", tagline: "Get listed everywhere your buyers look" },
  { icon: Award, title: "Case Studies", tagline: "Turn happy customers into sales tools" },
  { icon: Mic, title: "Podcast Guest Pitches", tagline: "Borrow other people's audiences" },
  { icon: Video, title: "Webinar Content", tagline: "Educate and sell on autopilot" },
  { icon: MailPlus, title: "Email Nurture Sequences", tagline: "Turn subscribers into buyers while you sleep" },
  { icon: Star, title: "Social Proof Engine", tagline: "Automate testimonial collection and display" },
  { icon: HelpCircle, title: "SEO Help Articles", tagline: "Rank for every question your customers ask" },
  { icon: ListChecks, title: "Listicle Placements", tagline: "Get included in 'Best X Tools' articles" },
  { icon: Newspaper, title: "Newsletter Sponsorships", tagline: "Pay to reach curated audiences" },
  { icon: Share2, title: "Viral Referral Program", tagline: "Turn users into recruiters" },
  { icon: Globe, title: "Localized Landing Pages", tagline: "Rank in every city and country" }
];

const ACTIVE_STRATEGIES = [
  { icon: Mail, title: "Automated Cold Email", tagline: "Reach thousands while you sleep" },
  { icon: Megaphone, title: "Paid Ads", tagline: "Instant traffic, controlled spend" },
  { icon: UserPlus, title: "Influencer Partnerships", tagline: "Borrow their audience" },
  { icon: Linkedin, title: "LinkedIn Outreach", tagline: "Connect directly with decision makers" },
  { icon: MessageSquare, title: "Cold DMs", tagline: "Slide into buyer inboxes on any platform" },
  { icon: Users, title: "Community Infiltration", tagline: "Become the go-to expert in your niche" },
  { icon: Handshake, title: "JV Partnerships", tagline: "Team up with complementary businesses" },
  { icon: Radio, title: "HARO & Press Outreach", tagline: "Get quoted in major publications" },
  { icon: ThumbsUp, title: "Review Site Outreach", tagline: "Get listed and reviewed on G2, Capterra" },
  { icon: Repeat, title: "Retargeting Campaigns", tagline: "Follow visitors until they convert" },
  { icon: Calendar, title: "Webinar Partnerships", tagline: "Co-host with people who have your audience" },
  { icon: Trophy, title: "Contests & Giveaways", tagline: "Go viral with irresistible offers" },
  { icon: Presentation, title: "Virtual Summit Speaking", tagline: "Present to thousands of ideal customers" },
  { icon: RefreshCw, title: "Win-Back Campaigns", tagline: "Reactivate churned users automatically" },
  { icon: TrendingUp, title: "Upsell Sequences", tagline: "Maximize revenue from existing customers" },
  { icon: Layers, title: "Bundle Deals", tagline: "Partner with others for irresistible packages" },
  { icon: Clock, title: "Flash Sales & Urgency", tagline: "Create FOMO that drives action" },
  { icon: HeartHandshake, title: "Affiliate Recruitment", tagline: "Actively recruit your army of promoters" },
  { icon: Store, title: "App Store Optimization", tagline: "Rank higher where people search for apps" },
  { icon: Crosshair, title: "Lookalike Audiences", tagline: "Find more people just like your best customers" }
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
            <div className="space-y-3">
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
              <strong>That's 20 of 50+ passive methods.</strong> You don't need all of them - you just need 1 or 2 that work for YOUR product. The hard part is knowing which ones.
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
            <div className="space-y-3">
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
              <strong>That's 20 of 50+ active methods.</strong> Most founders waste months trying random tactics. The ones who win pick 1-2 methods and master them.
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
                100+ Growth Strategies Exist
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
            <p className={`${ds.body} mt-3`}>
              Some people want to learn how to do it themselves. Others just want it done for them.
              <strong> I can help with both.</strong>
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-900 bg-slate-900 text-white">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold mb-3">Is Your SaaS Ready for Growth?</h4>
              <p className="text-slate-300">
                You've seen 40 strategies. Most can be automated with AI. But here's the thing...
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-white font-medium mb-2">Not every SaaS is ready for marketing.</p>
                <p className="text-slate-300 text-sm">
                  If your product, positioning, or offer isn't right, throwing traffic at it is like pouring water into a leaky bucket. You'll waste time and money.
                </p>
              </div>

              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-white font-medium mb-2">A free Readiness Review tells you where you stand.</p>
                <p className="text-slate-300 text-sm">
                  I'll look at what you've built and tell you honestly - is it ready for traffic, or does it need work first? Plus I'll map out exactly what to focus on next.
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-slate-400 text-sm font-medium">On the call, I'll tell you...</p>
              {[
                "Whether your SaaS is ready for marketing (or what to fix first)",
                "Which 2-3 strategies from the 40 are best for YOUR specific product",
                "The single biggest thing holding you back from your first customers",
                "What I'd do in your position if I was starting from scratch"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-slate-200 text-sm">{item}</p>
                </div>
              ))}
            </div>

            <a
              href="https://www.mattwebley.com/readiness"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full h-16 text-xl font-bold gap-2 bg-white text-slate-900 hover:bg-slate-100">
                Book Your Free Readiness Review <ArrowUpRight className="w-6 h-6" />
              </Button>
            </a>
            <p className="text-center text-slate-400 text-sm mt-3">
              Free call. Honest feedback. Find out exactly where you stand.
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
            <h4 className={`${ds.heading} mb-3`}>What's Next? Find Out If You're Ready.</h4>
            <p className={`${ds.body} mb-4`}>
              You've built something real. Now the question is - is it ready for customers? Book a free Readiness Review and I'll tell you exactly where you stand and what to do next.
            </p>
            <a
              href="https://www.mattwebley.com/readiness"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full gap-2">
                Book Your Free Readiness Review <ArrowUpRight className="w-5 h-5" />
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
            Complete the Challenge! <Trophy className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
