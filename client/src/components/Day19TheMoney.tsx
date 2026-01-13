import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronRight,
  DollarSign,
  Users,
  TrendingUp,
  Calculator,
  Target,
  Zap
} from "lucide-react";

interface Day19TheMoneyProps {
  appName: string;
  onComplete: (data: { monthlyGoal: number; pricePoint: number; customersNeeded: number }) => void;
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

export function Day19TheMoney({ appName, onComplete }: Day19TheMoneyProps) {
  const [step, setStep] = useState<"intro" | "calculator" | "reality" | "complete">("intro");
  const [selectedPrice, setSelectedPrice] = useState(29);
  const [targetIncome, setTargetIncome] = useState(5000);
  const [hasCalculated, setHasCalculated] = useState(false);

  const customersNeeded = Math.ceil(targetIncome / selectedPrice);
  const yearlyIncome = targetIncome * 12;

  const getCustomersPerDay = (months: number) => {
    return (customersNeeded / (months * 30)).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">The Money</h3>
        <p className="text-slate-600 mt-1">
          Let's talk about what {appName || "your app"} could actually earn.
        </p>
      </Card>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-xl text-slate-900 mb-2">
                You Built Something People Could Pay For
              </h4>
              <p className="text-slate-700">
                That's not nothing. That's EVERYTHING. Most people never get here.
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
              <p>
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
                That's {getCustomersPerDay(6)} new customers per day for 6 months
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
            onClick={() => {
              setHasCalculated(true);
              setStep("reality");
            }}
          >
            Show Me the Reality Check <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Reality Check */}
      {step === "reality" && (
        <>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">The Honest Truth</h4>
            <p className="text-slate-700">
              You can absolutely hit ${targetIncome.toLocaleString()}/month with {customersNeeded} customers.
              People do it every day. But here's what separates those who make it from those who don't:
            </p>
          </Card>

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
            <h4 className="font-bold text-lg mb-4 text-slate-900">What You'll Need to Figure Out</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Customer Acquisition</p>
                  <p className="text-slate-600">Where do your customers hang out? How do you get in front of them?</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Pricing & Positioning</p>
                  <p className="text-slate-600">How do you justify ${selectedPrice}/month? What makes you worth it?</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Users className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Conversion</p>
                  <p className="text-slate-600">How do you turn a visitor into a trial? A trial into a customer?</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 text-center">
              <strong>Tomorrow:</strong> We'll build your launch strategy and timeline.
              <br />
              <strong>Day 21:</strong> You'll see the full picture of what's next.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("complete")}
          >
            I Understand the Opportunity <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-2">Your Target is Set</h4>
              <p className="text-slate-700 text-lg">
                ${targetIncome.toLocaleString()}/month with {customersNeeded} customers at ${selectedPrice}/month
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Your Numbers</h4>
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

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({
              monthlyGoal: targetIncome,
              pricePoint: selectedPrice,
              customersNeeded
            })}
          >
            Continue to Day 20: The Launch Plan <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
