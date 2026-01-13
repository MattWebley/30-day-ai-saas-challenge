import { useState } from "react";
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
  Rocket
} from "lucide-react";

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

export function Day21LaunchDay({ appName, onComplete }: Day21LaunchDayProps) {
  const [step, setStep] = useState<"intro" | "calculator" | "vision" | "gap" | "cta" | "complete">("intro");
  const [selectedPrice, setSelectedPrice] = useState(29);
  const [targetIncome, setTargetIncome] = useState(5000);
  const [commitmentStatement, setCommitmentStatement] = useState("");

  const customersNeeded = Math.ceil(targetIncome / selectedPrice);
  const yearlyIncome = targetIncome * 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">The Money</h3>
        <p className="text-slate-600 mt-1">
          Let's see what {appName || "your app"} could actually earn - and what it takes to get there.
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
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                <p>
                  And once you have them? <strong>They pay you every month.</strong>
                </p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("vision")}
          >
            Show Me What's Possible <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Vision */}
      {step === "vision" && (
        <>
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
              <p>
                You work when you want. From where you want. On something <strong>you built</strong>.
              </p>
              <p className="font-bold text-slate-900 pt-2">
                That's not a fantasy. That's what happens when you turn an app into a business.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">But Here's the Thing...</h4>
            <p className="text-slate-700">
              You can absolutely hit ${targetIncome.toLocaleString()}/month with {customersNeeded} customers.
              People do it every day.
            </p>
            <p className="text-slate-700 mt-3 font-bold">
              But most people who build apps never get there. Why?
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("gap")}
          >
            Tell Me Why <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: The Gap */}
      {step === "gap" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">The Gap Between App and Business</h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 mb-2">You have an APP if you:</p>
                <ul className="text-slate-600 space-y-1">
                  <li>- Built something that works</li>
                  <li>- Maybe have a few users</li>
                  <li>- Wait for customers to find you</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-bold text-slate-900 mb-2">You have a BUSINESS if you:</p>
                <ul className="text-slate-700 space-y-1">
                  <li>- Know exactly who your customer is</li>
                  <li>- Have a repeatable way to reach them</li>
                  <li>- Can turn strangers into paying customers</li>
                  <li>- Keep them paying month after month</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">The Four Pillars You Need to Figure Out</h4>
            <div className="space-y-3">
              {BUSINESS_PILLARS.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <pillar.icon className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">{pillar.title}</p>
                    <p className="text-slate-600">{pillar.question}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">The Hard Truth</h4>
            <p className="text-slate-700">
              This is months of learning. Maybe years.
              Most people never figure it out - not because they can't,
              but because they get stuck, distracted, or overwhelmed.
            </p>
            <p className="text-slate-700 mt-3">
              The difference between apps that make money and apps that don't?
              <strong> The founder knew what to focus on.</strong>
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("cta")}
          >
            So What Do I Do? <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 5: The CTA */}
      {step === "cta" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 font-medium text-center text-lg">
              You have two paths forward. Neither is wrong - but one is faster.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">Path 1: Figure It Out Yourself</h4>
                <p className="text-slate-600 mt-1">Research, experiment, learn from mistakes</p>
                <p className="text-sm text-slate-500 mt-2">6-12 months of trial and error</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary bg-primary/5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg text-slate-900">Path 2: Work With Me 1:1</h4>
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">Recommended</span>
                </div>
                <p className="text-slate-600 mt-1">Get expert guidance from someone who's done it</p>
                <p className="text-sm text-slate-500 mt-2">Accelerate to results in weeks, not months</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 pl-16">
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Weekly calls to keep you accountable and on track</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>Direct access to ask questions as they come up</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Star className="w-4 h-4 text-slate-500" />
                <span>Help with your sales page, positioning, and pricing</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Target className="w-4 h-4 text-slate-500" />
                <span>A clear roadmap customized to YOUR app and market</span>
              </div>
            </div>

            <a
              href="https://www.mattwebley.com/workwithmatt"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full h-14 text-lg font-bold gap-2">
                Book a Free Strategy Call <ArrowUpRight className="w-5 h-5" />
              </Button>
            </a>
            <p className="text-center text-slate-500 text-sm mt-3">
              No obligation. Let's talk about {appName || "your app"} and your goals.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Your Commitment</h4>
            <p className="text-slate-600 mb-4">
              Regardless of which path you choose, write down what you're committing to:
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

          {commitmentStatement.length >= 50 && (
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gap-2"
              onClick={() => setStep("complete")}
            >
              Complete the 21 Day Challenge <Trophy className="w-5 h-5" />
            </Button>
          )}

          {commitmentStatement.length < 50 && (
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
            <h4 className="font-bold text-lg mb-4 text-slate-900">What You Accomplished</h4>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-center gap-3">
                <Rocket className="w-5 h-5 text-green-600" />
                Built a complete SaaS application from scratch
              </li>
              <li className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-green-600" />
                Added AI-powered features
              </li>
              <li className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                Set up user authentication and email
              </li>
              <li className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-600" />
                Created your launch strategy
              </li>
              <li className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                Know your numbers and what's next
              </li>
            </ul>
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
