import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Zap,
  Moon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Gift,
  ArrowRight
} from "lucide-react";

interface Day19TheSalesMachineProps {
  appName: string;
  onComplete: (data: { understoodSalesProcess: boolean }) => void;
}

export function Day19TheSalesMachine({ appName, onComplete }: Day19TheSalesMachineProps) {
  const [step, setStep] = useState<"intro" | "dream" | "reality" | "warning" | "complete">("intro");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">The Sales Machine</h3>
        <p className="text-slate-600 mt-1">
          How to convert strangers into customers while you sleep.
        </p>
      </Card>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="text-center">
              <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h4 className="font-bold text-xl text-slate-900 mb-2">
                Before You Get Traffic, You Need This
              </h4>
              <p className="text-slate-700">
                There's no point driving people to {appName || "your app"} if you don't know
                how to turn them into paying customers.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Most Founders Get This Backwards</h4>
            <div className="space-y-4 text-slate-700">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">What they do:</p>
                  <p>Build app → Try to get traffic → Wonder why nobody signs up</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">What works:</p>
                  <p>Build app → Create sales process → THEN drive traffic</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What is a "Sales Machine"?</h4>
            <p className="text-slate-700 mb-4">
              It's a system that takes someone who has never heard of you and turns them into a paying customer -
              <strong> without you having to be there.</strong>
            </p>
            <div className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Stranger</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Visitor</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Free Trial</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-green-600">Customer</span>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("dream")}
          >
            Show Me How It Works <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: The Dream */}
      {step === "dream" && (
        <>
          <Card className="p-6 border-2 border-green-100 bg-green-50">
            <div className="text-center">
              <Moon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-xl text-slate-900 mb-2">
                The Dream: Sales While You Sleep
              </h4>
              <p className="text-slate-700">
                Imagine waking up to Stripe notifications. New customers. While you were asleep.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Here's the Beautiful Part</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">No Rejection</p>
                  <p className="text-slate-600">
                    People find your page. They read it. They decide on their own.
                    If they're not interested, they just leave. No awkward conversations.
                    No one telling you "no" to your face.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">No "Selling"</p>
                  <p className="text-slate-600">
                    You're not convincing anyone. You're not doing calls. You're not being pushy.
                    You present the offer. They decide. Done.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Works 24/7</p>
                  <p className="text-slate-600">
                    Your sales page works while you're sleeping, eating, building, living.
                    It doesn't get tired. It doesn't take days off.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">The Core of It: The Free Trial Offer</h4>
            <p className="text-slate-700 mb-4">
              The magic happens when you make it <strong>easy to say yes</strong>:
            </p>
            <div className="p-5 bg-slate-50 rounded-lg border-2 border-slate-200">
              <div className="flex items-start gap-3 mb-4">
                <Gift className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 text-lg">The Free Trial Formula</p>
                </div>
              </div>
              <div className="space-y-3 text-slate-700">
                <p>1. <strong>Show the problem</strong> they have (they need to feel seen)</p>
                <p>2. <strong>Show the solution</strong> your app provides</p>
                <p>3. <strong>Make the offer irresistible:</strong> "Try it free. No credit card. Cancel anytime."</p>
                <p>4. <strong>Remove all risk</strong> from their decision</p>
              </div>
            </div>
            <p className="text-slate-600 mt-4 text-center">
              When done right, people convince <em>themselves</em>. You just make it easy.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("reality")}
          >
            Sounds Great - What's the Catch? <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Reality Check */}
      {step === "reality" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What Makes a Sales Page Actually Work</h4>
            <p className="text-slate-700 mb-4">
              The difference between a page that converts 0.5% vs 5% is HUGE.
              That's 10x more customers from the same traffic.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-bold text-slate-900">Psychology</p>
                <p className="text-slate-600">Understanding what makes people trust, believe, and act</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-bold text-slate-900">Positioning</p>
                <p className="text-slate-600">Why YOUR solution vs everything else they could do</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-bold text-slate-900">Objection Handling</p>
                <p className="text-slate-600">Answering their doubts before they even ask</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-bold text-slate-900">The Right Words</p>
                <p className="text-slate-600">Copy that speaks to their situation, not generic marketing fluff</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">The Components of a Sales Machine</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-900">Landing Page / Sales Page</p>
                  <p className="text-slate-600">The first thing people see - makes or breaks the sale</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-900">Free Trial or Lead Magnet</p>
                  <p className="text-slate-600">Something valuable with zero risk to them</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-900">Email Sequence</p>
                  <p className="text-slate-600">Nurture them from "interested" to "ready to buy"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                <div>
                  <p className="font-bold text-slate-900">Pricing Page</p>
                  <p className="text-slate-600">Clear, confident, makes the decision easy</p>
                </div>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("warning")}
          >
            Got It - Anything Else? <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Warning About AI */}
      {step === "warning" && (
        <>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">
                  Important Warning: AI Sales Pages
                </h4>
                <p className="text-slate-700">
                  You might be thinking: "I'll just ask ChatGPT to write my sales page."
                  <br /><br />
                  <strong>Here's the truth nobody tells you:</strong>
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What AI Gives You vs. What You Need</h4>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-bold text-slate-900 mb-2">What AI produces:</p>
                <ul className="text-slate-600 space-y-1">
                  <li>- Professional-looking copy that sounds "marketing-y"</li>
                  <li>- Generic benefits that could apply to any product</li>
                  <li>- Bullet points that look impressive but don't connect</li>
                  <li>- Words that are technically correct but emotionally flat</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-bold text-slate-900 mb-2">What actually converts:</p>
                <ul className="text-slate-700 space-y-1">
                  <li>- Copy that makes them think "this person GETS me"</li>
                  <li>- Specific language YOUR customers actually use</li>
                  <li>- Stories and proof that build real trust</li>
                  <li>- Words that trigger emotion, not just comprehension</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">The Real Talk</h4>
            <p className="text-slate-700 mb-4">
              An AI can give you a <strong>starting point</strong>. But out of the box,
              AI-generated sales pages typically convert at 0.5-1%.
            </p>
            <p className="text-slate-700 mb-4">
              A well-crafted sales page? <strong>3-10%</strong>. Sometimes higher.
            </p>
            <p className="text-slate-700">
              That's not a small difference. That's the difference between a hobby and a business.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-3 text-slate-900">What This Means for You</h4>
            <p className="text-slate-700 mb-4">
              Building a sales machine that actually converts is a skill.
              It takes understanding psychology, your specific market, and what makes people buy.
            </p>
            <p className="text-slate-700">
              You can learn it over time. Or you can work with someone who already knows it.
              Either way, <strong>don't expect to just prompt your way to great conversion rates.</strong>
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("complete")}
          >
            I Understand - Let's Continue <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 5: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-2">You Get It</h4>
              <p className="text-slate-700">
                Before traffic, you need a system to convert it.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Quick Recap</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">A sales machine converts strangers to customers <strong>automatically</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">No rejection, no selling, works while you sleep</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Free trials with zero risk make it easy to say yes</p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">AI-generated sales copy looks nice but usually doesn't convert well</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Getting this right is the difference between hobby and business</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 text-center">
              <strong>Tomorrow:</strong> Now that you understand the sales machine,
              we'll pick WHERE to send traffic - your launch strategies.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({ understoodSalesProcess: true })}
          >
            Continue to Day 20: The Launch Plan <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
