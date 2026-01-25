import { useState, useEffect } from "react";
import { useStepWithScroll } from "@/hooks/useStepWithScroll";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  Copy,
  CheckCircle2,
  FileText,
  Zap,
  Target,
  Users,
  ArrowRight,
  Trophy,
  Video,
  Star,
  ExternalLink,
  Loader2,
  Terminal,
} from "lucide-react";
import { Link } from "wouter";
import { ds } from "@/lib/design-system";

interface Day19TheSalesMachineProps {
  appName: string;
  userIdea: string;
  painPoints?: string[];
  features?: string[];
  aiFeature?: string;
  brandColor?: string;
  daysSinceStart?: number;
  onComplete: (data: { salesPageBuilt: boolean; headline: string; showcaseSubmitted?: boolean }) => void;
}

interface ShowcaseEntry {
  id: number;
  appName: string;
  description: string;
  screenshotUrl: string;
  liveUrl: string | null;
  testimonial: string | null;
  videoUrl: string | null;
  status: string;
}

export function Day19TheSalesMachine({
  appName,
  userIdea,
  painPoints = [],
  features = [],
  aiFeature = "",
  brandColor = "",
  daysSinceStart = 0,
  onComplete
}: Day19TheSalesMachineProps) {
  const [step, setStep, containerRef] = useStepWithScroll<"intro" | "structure" | "prompts" | "build" | "critique" | "showcase" | "complete">("intro");
  const [headline, setHeadline] = useState("");

  // Showcase state
  const [appUrl, setAppUrl] = useState("");
  const [showcaseAppName, setShowcaseAppName] = useState(appName || "");
  const [testimonial, setTestimonial] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showcaseSubmitted, setShowcaseSubmitted] = useState(false);

  // Check if user already submitted to showcase
  const { data: existingShowcase } = useQuery<ShowcaseEntry | null>({
    queryKey: ["/api/showcase/mine"],
  });

  useEffect(() => {
    if (existingShowcase) {
      setShowcaseSubmitted(true);
      setShowcaseAppName(existingShowcase.appName || "");
      setTestimonial(existingShowcase.testimonial || "");
      setVideoUrl(existingShowcase.videoUrl || "");
      setAppUrl(existingShowcase.liveUrl || "");
    }
  }, [existingShowcase]);

  const submitShowcase = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/showcase", {
        appName: showcaseAppName,
        description: `Built with the 21 Day AI SaaS Challenge`,
        screenshotUrl: "",
        liveUrl: appUrl,
        testimonial,
        videoUrl: videoUrl || null,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowcaseSubmitted(true);
      setStep("complete");
      toast.success("Submitted to showcase! You've earned your MVP Builder badge.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit to showcase");
    },
  });

  const canSubmitShowcase = showcaseAppName.length >= 2 && appUrl.length >= 10;

  const productName = appName || "your app";
  const productIdea = userIdea || "your SaaS product";

  // Build rich context from challenge progress
  const painPointsText = painPoints.length > 0
    ? `\n\nPain points this product solves:\n${painPoints.map(p => `- ${p}`).join('\n')}`
    : "";
  const featuresText = features.length > 0
    ? `\n\nKey features:\n${features.map(f => `- ${f}`).join('\n')}`
    : "";
  const aiFeatureText = aiFeature
    ? `\n\nAI-powered capability: ${aiFeature}`
    : "";
  const brandContext = brandColor
    ? `\n\nBrand primary color: ${brandColor}`
    : "";

  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const HEADLINE_PROMPT = `I need 10 powerful headline options for my SaaS product: ${productName}

What it does: ${productIdea}${painPointsText}${aiFeatureText}

Give me headlines that:
- Lead with the OUTCOME or TRANSFORMATION (not the product)
- Create curiosity or address a specific pain point from the list above
- Are specific, not generic
- Could work for a landing page hero section

Format: Just the headlines, numbered 1-10. No explanations.`;

  const SALES_PAGE_PROMPT = `Write a complete sales page for my SaaS product.

Product: ${productName}
What it does: ${productIdea}${painPointsText}${featuresText}${aiFeatureText}

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
${featuresText}${aiFeatureText}

Create 2-3 pricing tiers that make sense for this SaaS product.

For each tier include:
- Tier name (Basic, Pro, etc.)
- Price point (suggest realistic SaaS pricing)
- What's included (distribute the features above across tiers, with AI features in higher tiers)
- Who it's best for
- CTA button text

Make the middle tier the "recommended" option.
Include a brief FAQ about pricing (3 questions).
Add a money-back guarantee statement.`;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Claude Code Guide Reminder */}
      <Link href="/claude-code">
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Open the Claude Code Guide</p>
              <p className={ds.muted}>Use the prompts there to start your session.</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Step 1: Intro */}
      {step === "intro" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Let's Build Your Sales Page</h3>
                <p className={ds.muted}>We'll use AI to generate everything, then build it with Claude Code.</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Here's the plan...
              </p>
              <div className="space-y-3">
                {[
                  "Learn the proven 10-section structure",
                  "Use AI prompts to generate your copy",
                  "Build the page with Claude Code",
                  "Add screenshots and recordings",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">{i + 1}</div>
                    <p className={ds.body}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep("structure")} className="gap-2">
              Show Me the Structure <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Structure */}
      {step === "structure" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>The Anatomy of a High-Converting Sales Page</h3>
                <p className={ds.muted}>10 sections that work together to convert</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { num: 1, title: "Headline + Subheadline", desc: "The promise. Grabs attention. Makes them want more." },
                { num: 2, title: "The Problem", desc: "Make them feel understood. \"This person GETS me.\"" },
                { num: 3, title: "The Solution", desc: "Your product as the answer. Paint the \"after\" picture." },
                { num: 4, title: "How It Works", desc: "3-4 simple steps. Remove overwhelm." },
                { num: 5, title: "Features & Benefits", desc: "What they get. Each tied to an outcome." },
                { num: 6, title: "Social Proof", desc: "Testimonials, logos, numbers." },
                { num: 7, title: "The Offer + Pricing", desc: "What it costs, why it's worth it." },
                { num: 8, title: "Guarantee", desc: "Remove fear. Make it safe to say yes." },
                { num: 9, title: "FAQ", desc: "Answer objections before they ask." },
                { num: 10, title: "Final CTA", desc: "Tell them exactly what to do." },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{item.num}</div>
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className={ds.muted}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("intro")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("prompts")} className="gap-2">
              Give Me the Power Prompts <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Power Prompts */}
      {step === "prompts" && (
        <>
          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>Important</strong> - These AI prompts will get you 80% of the way there. You'll still need to tweak the copy, adjust the tone, and add screenshots/videos of your product in action. That final 20% of human polish is what makes good copy GREAT.
            </p>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className={ds.heading}>Generate Your Headline</h3>
                <p className={ds.muted}>The most important part - get 10 options to choose from</p>
              </div>
            </div>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm mb-4 whitespace-pre-wrap">
              {HEADLINE_PROMPT}
            </div>
            <Button
              variant="outline"
              className={`w-full gap-2 transition-colors ${copiedPrompt === "headline" ? "bg-green-50 border-green-300 text-green-700" : ""}`}
              onClick={() => copyToClipboard(HEADLINE_PROMPT, "headline")}
            >
              {copiedPrompt === "headline" ? (
                <><CheckCircle2 className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Headline Prompt</>
              )}
            </Button>
          </div>

          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-2"}>Your Chosen Headline</h3>
            <p className={ds.muted + " mb-4"}>After running the prompt above, paste your favorite headline here</p>
            <Textarea
              placeholder="Paste your chosen headline here..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className={ds.heading}>Generate Your Full Sales Page</h3>
                <p className={ds.muted}>Creates your entire page following the proven structure</p>
              </div>
            </div>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm mb-4 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {SALES_PAGE_PROMPT}
            </div>
            <Button
              variant="outline"
              className={`w-full gap-2 transition-colors ${copiedPrompt === "salespage" ? "bg-green-50 border-green-300 text-green-700" : ""}`}
              onClick={() => copyToClipboard(SALES_PAGE_PROMPT, "salespage")}
            >
              {copiedPrompt === "salespage" ? (
                <><CheckCircle2 className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Sales Page Prompt</>
              )}
            </Button>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className={ds.heading}>Generate Your Pricing Section</h3>
                <p className={ds.muted}>Create pricing tiers that make sense for your product</p>
              </div>
            </div>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm mb-4 whitespace-pre-wrap">
              {PRICING_PROMPT}
            </div>
            <Button
              variant="outline"
              className={`w-full gap-2 transition-colors ${copiedPrompt === "pricing" ? "bg-green-50 border-green-300 text-green-700" : ""}`}
              onClick={() => copyToClipboard(PRICING_PROMPT, "pricing")}
            >
              {copiedPrompt === "pricing" ? (
                <><CheckCircle2 className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Pricing Prompt</>
              )}
            </Button>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>Pro tip</strong> - Run these prompts in Claude.ai first. Then bring the content to your app and have Claude Code build the actual page.
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("structure")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("build")} className="gap-2">
              I've Got My Content <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 4: Build It */}
      {step === "build" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Now Build Your Sales Page</h3>
                <p className={ds.muted}>Take your content and build the actual page</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                "Open Claude Code in your project",
                "Tell it to create a landing page or sales page route",
                "Paste in your generated content section by section",
                "Ask Claude Code to style it with proper spacing and typography",
                "Add your CTA buttons that link to sign up / free trial",
                "ADD SCREENSHOTS AND SCREEN RECORDINGS of your product",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                  <p className={ds.body}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>Don't skip the visuals!</strong> Record screen captures showing your product in action. Screenshots of key features. GIFs of the user experience. This is what makes people trust your product is REAL.
            </p>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>Don't forget to republish!</strong> After building your sales page, redeploy your app so visitors can see it. Any time you make significant changes, republish to make them live.
            </p>
          </div>

          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-3"}>Example Prompt for Claude Code</h3>
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
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("prompts")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => setStep("critique")} className="gap-2">
              I've Built My Sales Page <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Critique Pitch */}
      {step === "critique" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Before You Move On...</h3>
                <p className={ds.muted}>A word of warning about AI-generated sales pages</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                Here's what usually happens - AI gives you an OK sales page, and because you're not a copywriter, it <em>looks</em> good enough. Sometimes it is.
              </p>
              <p className={ds.body}>
                But <strong>MOST of the time? It's really not.</strong> The words are there, but the <strong>persuasion</strong> isn't. The structure looks right, but the <strong>flow</strong> is off. It's missing the subtle tweaks that make someone actually click "Buy."
              </p>
              <p className={ds.body}>
                Here's the thing - it's the final 20% of tweaking that gives 80% of the results. And you need a trained, experienced copywriter's eye to spot what's missing.
              </p>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <div className="flex items-start gap-4 mb-4">
              <img
                src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                alt="Matt Webley"
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="font-bold text-slate-900">Personal Video Critique from Matt</p>
                <p className={ds.muted}>8-figure copywriter, conversion rate specialist</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={ds.body}>
                I'm offering to personally review your sales page and record a <strong>15-minute video</strong> with specific recommendations you can act on immediately. I'll tell you exactly what prompts you need to make the AI fix what needs fixing.
              </p>
              <p className={ds.body}>
                <strong>If you're serious about building a business</strong> (and not just building an app for fun), I highly recommend this. Boosting conversion rates is what I do best - and there's NEVER been a single critique where I haven't found ways to significantly improve the page. Not one.
              </p>
            </div>

            {/* Pricing */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-center gap-3">
                <span className="text-slate-400 line-through text-lg">£990 / $1,190</span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">50% OFF</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-2xl font-bold text-slate-900">£495 / $595</span>
                <p className={ds.muted + " mt-1"}>During the 21 Day Challenge only</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a href="/critique" className="block">
              <Button size="lg" className="w-full gap-2">
                <Video className="w-5 h-5" />
                Get My Sales Page Critiqued
              </Button>
            </a>
            <Button size="lg" variant="outline" onClick={() => setStep("showcase")} className="w-full gap-2">
              No Thanks, Continue to Showcase <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setStep("build")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
          </div>
        </>
      )}

      {/* Step 5: Showcase & Testimonial */}
      {step === "showcase" && (
        <>
          {/* What's in it for them */}
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Get Your First Customers</h3>
                <p className={ds.muted}>Now you have a sales page, let's get you some exposure</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className={ds.body}>
                I actively share testimonials across my <strong>Instagram, TikTok, YouTube, Facebook, and email lists</strong>. That means YOUR app in front of thousands of potential customers - completely free.
              </p>
              <p className={ds.body}>
                You could potentially land your <strong>first few paying customers</strong> just from me talking about your app. No ads. No marketing budget needed.
              </p>
              <p className={ds.body}>
                <strong>The better your testimonial, the more I'll share it.</strong>
              </p>
            </div>
          </div>

          {/* Your App Details */}
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={ds.heading}>Your App</h3>
                <p className={ds.muted}>The details for your showcase entry</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={ds.label + " mb-1 block"}>App Name</label>
                <Input
                  placeholder="My Awesome SaaS"
                  value={showcaseAppName}
                  onChange={(e) => setShowcaseAppName(e.target.value)}
                />
              </div>

              <div>
                <label className={ds.label + " mb-1 block"}>App URL (your sales page)</label>
                <Input
                  placeholder="https://your-app.com"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                />
                {appUrl && (
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:underline mt-1 text-sm"
                  >
                    Test link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Option 1: Written Experience */}
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className={ds.heading}>Option 1 - Written Experience</h3>
              </div>
            </div>
            <p className={ds.muted + " mb-4"}>
              Share your journey in writing. Answer any of these questions to create a great testimonial.
            </p>

            <div className={ds.infoBoxHighlight + " mb-4"}>
              <p className={ds.label + " mb-2"}>Answer one or more of these</p>
              <ul className={ds.body + " space-y-2"}>
                <li>• What did you think when you first heard about building an app with AI?</li>
                <li>• What was your "aha moment" during the challenge?</li>
                <li>• What would you tell someone who's on the fence about starting?</li>
                <li>• What can you do now that you couldn't do 21 days ago?</li>
              </ul>
            </div>

            <Textarea
              placeholder="Before this challenge, I never thought I could build an app. But now..."
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              className="min-h-[120px]"
            />
            <p className={ds.muted + " mt-1"}>{testimonial.length}/500 characters</p>
          </div>

          {/* Option 2: Video Testimonial */}
          <div className={ds.cardWithPadding}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className={ds.heading}>Option 2 - Video Testimonial</h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">Maximum Exposure</span>
              </div>
            </div>
            <p className={ds.body + " mb-4"}>
              A 60-second face-to-camera video gets you <strong>the most exposure</strong>. Real faces build trust, and I prioritise sharing video testimonials above everything else.
            </p>

            <div className={ds.infoBoxHighlight + " mb-4"}>
              <p className={ds.label + " mb-2"}>Record yourself answering these</p>
              <ul className={ds.body + " space-y-2"}>
                <li><strong>1.</strong> Who are you and what did you build?</li>
                <li><strong>2.</strong> What was your experience level before this?</li>
                <li><strong>3.</strong> What surprised you most about the process?</li>
                <li><strong>4.</strong> How did you find Matt's training style?</li>
                <li><strong>5.</strong> What would you say to someone thinking about doing this?</li>
              </ul>
              <p className={ds.muted + " mt-3"}>
                Keep it natural - no script needed. Just answer honestly and show your app if you can.
              </p>
            </div>

            <Input
              placeholder="https://www.loom.com/share/your-video or YouTube link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className={ds.muted + " mt-1"}>
              Use <a href="https://www.loom.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">Loom</a> for quick recording (it's free), or upload to YouTube.
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("critique")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => submitShowcase.mutate()}
              disabled={!canSubmitShowcase || submitShowcase.isPending}
            >
              {submitShowcase.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit & Get Featured <Trophy className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          {!canSubmitShowcase && (
            <p className={ds.muted + " text-center"}>
              Fill in App Name and App URL to submit
            </p>
          )}

          {/* Skip option */}
          <div className="text-center">
            <button
              onClick={() => setStep("complete")}
              className="text-slate-500 hover:text-slate-700 text-sm underline"
            >
              Skip for now - I'll do this later
            </button>
          </div>
        </>
      )}

      {/* Step 6: Complete */}
      {step === "complete" && (
        <>
          <div className={ds.cardWithPadding}>
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-2xl text-slate-900 mb-2">
                {showcaseSubmitted ? "You're In The Showcase!" : "Sales Page Built!"}
              </h3>
              <p className={ds.body}>
                {showcaseSubmitted
                  ? "Your app has been submitted. Keep an eye on your inbox and socials for features."
                  : "You now have a page designed to convert visitors into customers."
                }
              </p>
            </div>
          </div>

          <div className={ds.cardWithPadding}>
            <h3 className={ds.heading + " mb-4"}>What You've Created</h3>
            <div className="space-y-3">
              {[
                "A headline that grabs attention and promises transformation",
                "Problem/solution copy that makes visitors feel understood",
                "Clear \"how it works\" steps that remove overwhelm",
                "Features and benefits that focus on outcomes",
                "Pricing that makes the decision easy",
                "CTAs that tell visitors exactly what to do",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className={ds.body}>{item}</p>
                </div>
              ))}
              {showcaseSubmitted && (
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className={ds.body}>Submitted to showcase for exposure to thousands of potential customers</p>
                </div>
              )}
            </div>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>Remember</strong> - AI got you 80% there. Before you move on, read through your sales page out loud.
              Tweak anything that doesn't sound like YOU. Add screenshots, a demo video, or GIFs showing your product in action.
              That human polish is what turns good copy into copy that converts.
            </p>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.body}>
              <strong>Republish your app</strong> after making changes so your sales page goes live. Any time you make updates you want customers to see, redeploy.
            </p>
          </div>

          <div className={ds.infoBoxHighlight}>
            <p className={ds.body + " text-center"}>
              <strong>Tomorrow</strong> - Get found by Google & AI. SEO setup to bring free traffic to {productName}.
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("showcase")} className="gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </Button>
            <Button size="lg" onClick={() => onComplete({ salesPageBuilt: true, headline: headline || "Generated headline", showcaseSubmitted })} className="gap-2">
              Continue to Day 20 <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
