import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Copy,
  CheckCircle2,
  FileText,
  Zap,
  Target,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day19TheSalesMachineProps {
  appName: string;
  userIdea: string;
  onComplete: (data: { salesPageBuilt: boolean; headline: string }) => void;
}

export function Day19TheSalesMachine({ appName, userIdea, onComplete }: Day19TheSalesMachineProps) {
  const [step, setStep] = useState<"intro" | "structure" | "prompts" | "build" | "complete">("intro");
  const [headline, setHeadline] = useState("");
  const { toast } = useToast();

  const productName = appName || "your app";
  const productIdea = userIdea || "your SaaS product";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const HEADLINE_PROMPT = `I need 10 powerful headline options for my SaaS product: ${productName}

What it does: ${productIdea}

Give me headlines that:
- Lead with the OUTCOME or TRANSFORMATION (not the product)
- Create curiosity or address a specific pain point
- Are specific, not generic
- Could work for a landing page hero section

Format: Just the headlines, numbered 1-10. No explanations.`;

  const SALES_PAGE_PROMPT = `Write a complete sales page for my SaaS product.

Product: ${productName}
What it does: ${productIdea}

Use this proven structure:

1. HEADLINE: [Use this headline: "${headline || "A compelling headline"}"]

2. SUBHEADLINE: Expand on the headline, add specificity

3. THE PROBLEM (2-3 paragraphs):
- Describe the pain they're experiencing
- Make them feel understood
- Agitate the problem slightly

4. THE SOLUTION (2-3 paragraphs):
- Introduce the product as the answer
- Focus on transformation, not features
- Paint the "after" picture

5. HOW IT WORKS (3-4 steps):
- Simple numbered steps
- Make it look easy
- Remove overwhelm

6. FEATURES & BENEFITS (5-7 bullets):
- Each feature tied to a benefit
- Specific, not generic
- Focus on outcomes

7. WHO THIS IS FOR:
- Describe the ideal customer
- Help them self-identify
- "This is for you if..."

8. SOCIAL PROOF SECTION:
- Placeholder for testimonials
- Trust indicators

9. THE OFFER:
- What they get (bullet list)
- Pricing (leave as placeholder)
- Risk reversal (guarantee)

10. CALL TO ACTION:
- Clear, compelling button text
- Urgency without being pushy

11. FAQ (5 common questions):
- Address objections
- Remove friction

Write in a conversational, direct tone. Use short paragraphs. Make it scannable.`;

  const PRICING_PROMPT = `Write a pricing section for ${productName}.

Create 2-3 pricing tiers that make sense for a SaaS product.

For each tier include:
- Tier name (Basic, Pro, etc.)
- Price point (suggest realistic SaaS pricing)
- What's included (5-7 features per tier)
- Who it's best for
- CTA button text

Make the middle tier the "recommended" option.
Include a brief FAQ about pricing (3 questions).
Add a money-back guarantee statement.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-slate-200 bg-white">
        <h3 className="text-2xl font-extrabold text-slate-900">Build Your Sales Page</h3>
        <p className="text-slate-600 mt-1">
          Turn visitors into customers with a page that actually converts.
        </p>
      </Card>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">
                  Your Product is Built. Now You Need to SELL It.
                </h4>
                <p className="text-slate-700">
                  A great sales page is the difference between "nobody signs up" and "I woke up to new customers."
                  Today, we're building yours.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What Makes a Sales Page Convert</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Speaks to ONE person</p>
                  <p className="text-slate-600">Not "everyone" - your IDEAL customer</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Focuses on THEM, not you</p>
                  <p className="text-slate-600">Their problem, their transformation, their outcome</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Removes all risk</p>
                  <p className="text-slate-600">Free trial, guarantee, easy to say yes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Follows a proven structure</p>
                  <p className="text-slate-600">Problem → Solution → Proof → Offer → CTA</p>
                </div>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("structure")}
          >
            Show Me the Structure <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 2: Structure */}
      {step === "structure" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">The Anatomy of a High-Converting Sales Page</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-900">Headline + Subheadline</p>
                  <p className="text-slate-600">The promise. Grabs attention. Makes them want to read more.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-900">The Problem</p>
                  <p className="text-slate-600">Make them feel understood. "This person GETS me."</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-900">The Solution</p>
                  <p className="text-slate-600">Your product as the answer. Paint the "after" picture.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                <div>
                  <p className="font-bold text-slate-900">How It Works</p>
                  <p className="text-slate-600">3-4 simple steps. Remove overwhelm. Make it look easy.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                <div>
                  <p className="font-bold text-slate-900">Features & Benefits</p>
                  <p className="text-slate-600">What they get. Each feature tied to an outcome.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">6</div>
                <div>
                  <p className="font-bold text-slate-900">Social Proof</p>
                  <p className="text-slate-600">Testimonials, logos, numbers. "Others trust this."</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">7</div>
                <div>
                  <p className="font-bold text-slate-900">The Offer + Pricing</p>
                  <p className="text-slate-600">What they get, what it costs, why it's worth it.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">8</div>
                <div>
                  <p className="font-bold text-slate-900">Guarantee + Risk Reversal</p>
                  <p className="text-slate-600">Remove fear. Make it safe to say yes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">9</div>
                <div>
                  <p className="font-bold text-slate-900">FAQ</p>
                  <p className="text-slate-600">Answer objections. Handle doubts before they ask.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">10</div>
                <div>
                  <p className="font-bold text-slate-900">Final CTA</p>
                  <p className="text-slate-600">Clear call to action. Tell them exactly what to do.</p>
                </div>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("prompts")}
          >
            Give Me the Power Prompts <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 3: Power Prompts */}
      {step === "prompts" && (
        <>
          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-slate-700">
              <strong>Important:</strong> These AI prompts will get you 80% of the way there - a solid foundation you can build on.
              You'll still need to tweak the copy, adjust the tone, and add screenshots/videos of your product in action.
              That final 20% of human polish is what makes good copy GREAT.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Step 1: Generate Your Headline</h4>
            <p className="text-slate-600 mb-4">
              The headline is the most important part. Get 10 options to choose from.
            </p>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm mb-4 whitespace-pre-wrap">
              {HEADLINE_PROMPT}
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => copyToClipboard(HEADLINE_PROMPT, "Headline prompt")}
            >
              <Copy className="w-4 h-4" />
              Copy Headline Prompt
            </Button>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Your Chosen Headline</h4>
            <p className="text-slate-600 mb-4">
              After running the prompt above, paste your favorite headline here:
            </p>
            <Textarea
              placeholder="Paste your chosen headline here..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="min-h-[80px] bg-white"
            />
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Step 2: Generate Your Full Sales Page</h4>
            <p className="text-slate-600 mb-4">
              This prompt creates your entire sales page following the proven structure.
            </p>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm mb-4 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {SALES_PAGE_PROMPT}
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => copyToClipboard(SALES_PAGE_PROMPT, "Sales page prompt")}
            >
              <Copy className="w-4 h-4" />
              Copy Sales Page Prompt
            </Button>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-2 text-slate-900">Step 3: Generate Your Pricing Section</h4>
            <p className="text-slate-600 mb-4">
              Create a pricing section with tiers that make sense for your product.
            </p>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm mb-4 whitespace-pre-wrap">
              {PRICING_PROMPT}
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => copyToClipboard(PRICING_PROMPT, "Pricing prompt")}
            >
              <Copy className="w-4 h-4" />
              Copy Pricing Prompt
            </Button>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-slate-700">
              <strong>Pro tip:</strong> Run these prompts in ChatGPT or Claude.ai first.
              Then bring the content to your app and have Claude Code build the actual page.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("build")}
          >
            I've Got My Content - Let's Build It <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 4: Build It */}
      {step === "build" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">Now Build Your Sales Page</h4>
            <p className="text-slate-700 mb-4">
              Take the content you generated and build the actual page in your app.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <p className="text-slate-700">Open Claude Code in your project</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <p className="text-slate-700">Tell it to create a landing page or sales page route</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <p className="text-slate-700">Paste in your generated content section by section</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                <p className="text-slate-700">Ask Claude Code to style it nicely with proper spacing and typography</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                <p className="text-slate-700">Add your CTA buttons that link to sign up / free trial</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <h4 className="font-bold text-lg mb-3 text-slate-900">Example Prompt for Claude Code</h4>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
{`Create a sales page at /landing with the following content:

[PASTE YOUR GENERATED SALES PAGE CONTENT HERE]

Style it with:
- Clean, modern design
- Plenty of white space
- Clear visual hierarchy
- Mobile responsive
- CTA buttons that stand out`}
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => setStep("complete")}
          >
            I've Built My Sales Page <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Step 5: Complete */}
      {step === "complete" && (
        <>
          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-2xl text-slate-900 mb-2">Sales Page Built!</h4>
              <p className="text-slate-700">
                You now have a page designed to convert visitors into customers.
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h4 className="font-bold text-lg mb-4 text-slate-900">What You've Created</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">A headline that grabs attention and promises transformation</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Problem/solution copy that makes visitors feel understood</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Clear "how it works" steps that remove overwhelm</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Features and benefits that focus on outcomes</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Pricing that makes the decision easy</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">CTAs that tell visitors exactly what to do</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-amber-200 bg-amber-50">
            <p className="text-slate-700">
              <strong>Remember:</strong> AI got you 80% there. Before you move on, read through your sales page out loud.
              Tweak anything that doesn't sound like YOU. Add screenshots, a demo video, or GIFs showing your product in action.
              That human polish is what turns good copy into copy that converts.
            </p>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-700 text-center">
              <strong>Tomorrow:</strong> We'll figure out where to send traffic -
              your go-to-market strategy for getting {productName} in front of customers.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2"
            onClick={() => onComplete({ salesPageBuilt: true, headline: headline || "Generated headline" })}
          >
            Continue to Day 20: Go-To-Market <ArrowRight className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
