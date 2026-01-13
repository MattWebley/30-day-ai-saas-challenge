import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Rocket,
  ArrowUpRight,
  Trophy,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  Calendar,
  MessageSquare,
  Star
} from "lucide-react";

interface Day21LaunchDayProps {
  appName: string;
  onComplete: (data: { nextStepChoice: string; commitmentStatement: string }) => void;
}

const BUSINESS_PILLARS = [
  {
    icon: Users,
    title: "Customer Acquisition",
    description: "How do you consistently get new customers every month?",
    details: [
      "Which channels work for YOUR audience?",
      "How much does each customer cost to acquire?",
      "Can you make it repeatable and scalable?",
    ],
  },
  {
    icon: DollarSign,
    title: "Pricing & Monetization",
    description: "How do you maximize revenue without losing customers?",
    details: [
      "What's your pricing strategy?",
      "Should you offer annual plans?",
      "When do you raise prices?",
    ],
  },
  {
    icon: TrendingUp,
    title: "Retention & Growth",
    description: "How do you keep customers paying month after month?",
    details: [
      "What makes them stay vs leave?",
      "How do you reduce churn?",
      "How do you get referrals?",
    ],
  },
  {
    icon: Zap,
    title: "Operations & Scale",
    description: "How do you run this without burning out?",
    details: [
      "Support at scale",
      "When to hire help",
      "Systems and automation",
    ],
  },
];

const NEXT_PATHS = [
  {
    id: "solo",
    title: "Figure It Out Myself",
    description: "Research, experiment, learn from mistakes",
    time: "6-12 months of trial and error",
    icon: Target,
  },
  {
    id: "mentorship",
    title: "Get Expert Guidance",
    description: "Work with someone who's done it",
    time: "Accelerate to results in weeks",
    icon: Rocket,
    highlighted: true,
  },
];

export function Day21LaunchDay({ appName, onComplete }: Day21LaunchDayProps) {
  const [step, setStep] = useState<"vision" | "reality" | "choice" | "complete">("vision");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [commitmentStatement, setCommitmentStatement] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Build Your Business</h3>
        <p className="text-slate-600 mt-1">
          You have an app. Now let's talk about what comes next.
        </p>
      </Card>

      {/* Step 1: The Vision */}
      {step === "vision" && (
        <>
          <Card className="p-8 border-2 border-slate-200 bg-slate-50">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-3">
                You Did Something Most People Never Will
              </h4>
              <p className="text-slate-700 text-lg">
                You went from idea to working product in 21 days.
                You're now in the top 1% of people who actually BUILD things.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Picture This in 12 Months...</h4>
            <div className="space-y-4 text-slate-700">
              <p>
                {appName || "Your app"} has <strong>200+ paying customers</strong>.
              </p>
              <p>
                Your phone buzzes with Stripe notifications: <strong>$5,000+/month</strong> coming in automatically.
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

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("reality")}
          >
            Show Me What It Takes <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: The Reality */}
      {step === "reality" && (
        <>
          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-slate-700 font-medium text-center">
              An app makes $0 on its own. Here's what turns it into a business:
            </p>
          </Card>

          <div className="space-y-4">
            {BUSINESS_PILLARS.map((pillar) => (
              <Card key={pillar.title} className="p-5 border-2 border-slate-200 bg-white">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <pillar.icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{pillar.title}</h4>
                    <p className="text-slate-600 mb-3">{pillar.description}</p>
                    <ul className="space-y-1">
                      {pillar.details.map((detail, i) => (
                        <li key={i} className="text-sm text-slate-500 flex items-start gap-2">
                          <span>•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>

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
            onClick={() => setStep("choice")}
          >
            What Are My Options? <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: The Choice */}
      {step === "choice" && (
        <>
          <Card className="p-4 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 font-medium text-center">
              You have two paths forward. Neither is wrong - but one is faster.
            </p>
          </Card>

          <div className="space-y-4">
            {NEXT_PATHS.map((path) => (
              <Card
                key={path.id}
                className={`p-6 border-2 cursor-pointer transition-all ${
                  path.highlighted
                    ? "border-primary bg-primary/5"
                    : selectedPath === path.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedPath(path.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    path.highlighted ? "bg-primary text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    <path.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-slate-900">{path.title}</h4>
                      {path.highlighted && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">Recommended</span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1">{path.description}</p>
                    <p className="text-sm text-slate-500 mt-2">{path.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* The CTA */}
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-start gap-4 mb-4">
              <Star className="w-6 h-6 text-amber-500" />
              <div>
                <h4 className="font-bold text-lg text-slate-900">Work With Me 1:1</h4>
                <p className="text-slate-600">
                  I help SaaS founders go from working product to paying customers.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Weekly calls to keep you accountable and on track</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>Direct access to ask questions as they come up</span>
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
              No obligation. Let's talk about your app and your goals.
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

      {/* Step 4: Complete */}
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
                <DollarSign className="w-5 h-5 text-green-600" />
                Created your pricing strategy
              </li>
              <li className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                Built your launch plan
              </li>
              <li className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-600" />
                Know exactly what's next
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
              nextStepChoice: selectedPath || "undecided",
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
