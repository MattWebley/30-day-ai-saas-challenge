import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Presentation, ChevronLeft, ChevronRight } from "lucide-react";
import { useTestMode } from "@/contexts/TestModeContext";

interface Slide {
  title: string;
  points: string[];
}

interface VideoSlidesProps {
  day: number;
}

// Slide content for each day - designed for video scripts, not lesson duplicates
const slideContent: Record<number, Slide[]> = {
  0: [
    {
      title: "Welcome to 21 Days",
      points: [
        "This is a BUILD challenge, not a course",
        "21 days from idea → launch-ready product",
        "Show up daily. No skipping. No excuses.",
      ],
    },
    {
      title: "The 4 Rules",
      points: [
        "1. SHOW UP DAILY -consistency beats intensity",
        "2. NEVER BREAK THE CHAIN -your streak matters",
        "3. DONE > PERFECT -ship beats polish",
        "4. NO SKIPPING -each day builds on the last",
      ],
    },
    {
      title: "What You'll Build",
      points: [
        "Days 1-7: Find & plan your winning idea",
        "Days 8-14: Build your product",
        "Days 15-18: Test & refine",
        "Days 19-21: Polish & LAUNCH",
      ],
    },
  ],
  1: [
    {
      title: "Day 1: Find Your Idea",
      points: [
        "The BEST ideas come from what you ALREADY know",
        "Industries where people make REAL MONEY = easier sales",
        "Think NICHE, not broad",
      ],
    },
    {
      title: "The 4-Point Filter",
      points: [
        "PAIN INTENSITY -Is this task hated/frequent/costly?",
        "CASH PROXIMITY -Does it help earn or save money?",
        "SPEED TO MVP -Can you ship in 14 days?",
        "PERSONAL ADVANTAGE -Your knowledge, access, audience?",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Generate 28 personalized ideas using AI",
        "Score each against the 4-point filter",
        "Shortlist your top 3-5 ideas",
        "Don't overthink -trust your gut",
      ],
    },
  ],
  2: [
    {
      title: "Day 2: Validate Your Idea",
      points: [
        "No point building if nobody will PAY for it",
        "Competition = GOOD (proves there's money)",
        "Trust your gut, but VERIFY first",
      ],
    },
    {
      title: "The 3-Step Validation",
      points: [
        "1. ASK YOUR LLM -Is this viable? Be BRUTALLY honest",
        "2. FIND COMPETITORS -If 3+ exist, demand is proven",
        "3. ASK YOUR TARGET -Talk to real people with the problem",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Pick ONE idea from your shortlist",
        "Identify 1-3 specific PAINFUL problems it solves",
        "Create your 'I help [X] with [Y]' statement",
        "The hardest decision is behind you after today",
      ],
    },
  ],
  3: [
    {
      title: "Day 3: Features & USP",
      points: [
        "Clone competitor features = table stakes",
        "Your USP is why people choose YOU",
        "ALL their features + ONE unique thing = WIN",
      ],
    },
    {
      title: "The Feature Strategy",
      points: [
        "STEP 1: List ESSENTIAL features competitors share",
        "STEP 2: Find ONE thing they DON'T have",
        "Ask AI for 28 wild USP ideas that would SHOCK the space",
      ],
    },
    {
      title: "The Winning Formula",
      points: [
        "Cloned core features",
        "+ Your unique USP",
        "+ Longer free trial",
        "+ Cheaper monthly price = YOU WIN",
      ],
    },
  ],
  4: [
    {
      title: "Day 4: Name & Claim",
      points: [
        "Your name is your first impression",
        "ALWAYS get the .com -no exceptions",
        "If you can't get .com cheap, CHANGE THE NAME",
      ],
    },
    {
      title: "The Golden Rules",
      points: [
        "SHORT: 1-2 words, under 10 characters ideal",
        "SPEAKABLE: If you have to spell it, it's WRONG",
        "UNIQUE: 'ProjectManager' is a description, not a name",
        "NO HYPHENS OR NUMBERS: Ever.",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Generate name ideas with AI",
        "Register your .com ($10-15/year max)",
        "Claim ALL social handles (Twitter, IG, LinkedIn)",
        "This name is yours forever now",
      ],
    },
  ],
  5: [
    {
      title: "Day 5: Create Your Logo",
      points: [
        "Your logo is the FACE of your brand",
        "It doesn't need to be perfect -it needs to EXIST",
        "30 minutes max. Done beats perfect.",
      ],
    },
    {
      title: "Your Logo Options",
      points: [
        "WORDMARK: Just your name in a nice font -clean, professional",
        "ICON + TEXT: Simple symbol next to your name",
        "AI-GENERATED: Use Midjourney or Ideogram for concepts",
        "Canva has FREE logo templates -use them!",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Pick your logo style (wordmark is easiest)",
        "Open Canva, Midjourney, or your tool of choice",
        "Create and save as PNG",
        "You can always refine later -just GET ONE",
      ],
    },
  ],
  6: [
    {
      title: "Day 6: AI Tech Stack",
      points: [
        "These tools are your SUPERPOWERS",
        "Total cost: ~$50/month -accept it as cost of doing business",
        "Get PAID accounts -don't skimp here",
      ],
    },
    {
      title: "Your AI Stack",
      points: [
        "ChatGPT Plus (~$20/mo) -advice, content, ideas",
        "Claude Pro (~$20/mo) -second opinion, different strengths",
        "Replit -where your software LIVES",
        "OpenAI API -the brain of your app (pay-as-you-go)",
      ],
    },
    {
      title: "Why Both Claude AND ChatGPT?",
      points: [
        "They're good at DIFFERENT things",
        "Play them off each other for better results",
        "One writes, the other critiques",
        "This changes constantly -stay flexible",
      ],
    },
  ],
  7: [
    {
      title: "Day 7: Create Your PRD",
      points: [
        "PRD = Product Requirements Document",
        "Your BLUEPRINT that tells Replit what to build",
        "Feed it to Replit and watch the MAGIC happen",
      ],
    },
    {
      title: "What Goes In Your PRD",
      points: [
        "SaaS NAME",
        "CUSTOMER AVATAR (who is this for?)",
        "PROBLEM it solves",
        "FEATURE SET",
        "USP",
        "LOOK AND FEEL",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Use ChatGPT to generate your PRD",
        "Review it -change anything wrong",
        "Paste it into Replit",
        "Watch it start building FOR you",
      ],
    },
  ],
  8: [
    {
      title: "Day 8: Claude Code + GitHub",
      points: [
        "AI agents are FASTER, CHEAPER, BETTER than dev teams",
        "What took weeks with humans = MINUTES with AI",
        "This is an ever-changing space -EMBRACE it",
      ],
    },
    {
      title: "Your Daily Workflow",
      points: [
        "1. Start with a CLEAR goal",
        "2. Tell the agent what you want",
        "3. Review what it creates",
        "4. Test it in the app",
        "5. Iterate until it works",
      ],
    },
    {
      title: "Week 1 Complete!",
      points: [
        "You have a validated idea",
        "You have a clear plan",
        "You have your tools set up",
        "You've started building",
        "While others think about it, you're DOING it",
      ],
    },
  ],
  9: [
    {
      title: "Day 9: Master Claude Code",
      points: [
        "Claude Code saves you THOUSANDS vs Replit AI alone",
        "Same power, fraction of the price",
        "The SECRET is how you TALK to it",
      ],
    },
    {
      title: "The Prompting Rules",
      points: [
        "BE SPECIFIC: 'Make it better' = useless",
        "ONE THING at a time: Login first, THEN dashboard",
        "DESCRIBE problems like talking to a human",
        "Good prompts = fast results",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Install Claude Code in Replit shell",
        "Learn the 3 key prompts (Session START, Session END)",
        "Complete today = unlock Claude Code Guide",
        "This skill separates fast builders from stuck ones",
      ],
    },
  ],
  10: [
    {
      title: "Day 10: The Build Loop",
      points: [
        "BUILD → TEST → FIX → REPEAT",
        "This is THE skill that separates shippers from dreamers",
        "Every successful builder does this HUNDREDS of times",
      ],
    },
    {
      title: "Why This Matters",
      points: [
        "Most people build for HOURS without testing",
        "Then find 47 bugs at once = overwhelmed",
        "Smart builders test CONSTANTLY",
        "Small wins stack up",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Find ONE bug in your app",
        "Describe it CLEARLY (not just 'it's broken')",
        "Fix it with Claude Code",
        "Congratulations -you just did the loop!",
      ],
    },
  ],
  11: [
    {
      title: "Day 11: Define Your Brand",
      points: [
        "Brand is more than a logo -it's how your app FEELS",
        "Pick ONE color and use it EVERYWHERE",
        "Consistency = professional",
      ],
    },
    {
      title: "Your Brand Identity",
      points: [
        "PRIMARY COLOR: The main accent color for buttons/links",
        "FONT: One clean font (Inter, Poppins, or Roboto)",
        "These two choices make 90% of the difference",
        "Don't overthink -pick and COMMIT",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Choose your primary color",
        "Pick your font",
        "Apply to your app with Claude Code",
        "Your app now LOOKS like a real product",
      ],
    },
  ],
  12: [
    {
      title: "Day 12: Add The AI Brain",
      points: [
        "This is what makes AI SaaS SPECIAL",
        "Users EXPECT intelligence now -it's 2025",
        "An app without AI feels like a website from 2010",
      ],
    },
    {
      title: "Why AI Is Your MOAT",
      points: [
        "Regular features can be copied in a weekend",
        "Good AI features are HARD to replicate",
        "Users aren't paying for your buttons",
        "They're paying for what the AI DOES for them",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Get OpenAI API key (platform.openai.com)",
        "Add key to Replit Secrets (NEVER in code!)",
        "Tell Claude Code to add ONE AI feature",
        "Pick the thing that makes users say 'THIS IS AMAZING'",
      ],
    },
  ],
  13: [
    {
      title: "Day 13: Add Superpowers",
      points: [
        "External APIs = capabilities you CAN'T build yourself",
        "Payments, data feeds, integrations",
        "BUT FIRST: Ask Replit if it can do it natively",
      ],
    },
    {
      title: "Common Superpowers",
      points: [
        "PAYMENTS: Stripe -the standard for charging money",
        "SCRAPING: Bright Data -get data from other sites",
        "INTEGRATIONS: Most services have APIs",
        "Add ONE at a time. Test. Then consider the next.",
      ],
    },
    {
      title: "What If You Don't Need Any?",
      points: [
        "That's FINE! Many successful SaaS apps are just:",
        "Database + User accounts + AI features + Good UX",
        "Replit has all of that built in",
        "Don't add complexity for the sake of it",
      ],
    },
  ],
  14: [
    {
      title: "Day 14: Add Login",
      points: [
        "Authentication = 'Who are you?'",
        "How your app knows which user is which",
        "Everyone sees their OWN stuff, not everyone else's",
      ],
    },
    {
      title: "Good News",
      points: [
        "Replit probably ALREADY has it",
        "Check first: 'Does my app have user authentication?'",
        "If YES -you're DONE. Move on.",
        "If NO -one prompt adds it all",
      ],
    },
    {
      title: "The Test",
      points: [
        "Sign up with test email A, add data",
        "Log out",
        "Sign up with test email B",
        "Can you see A's data? You SHOULDN'T",
        "If isolated, auth works. Done.",
      ],
    },
  ],
  15: [
    {
      title: "Day 15: Email Setup",
      points: [
        "Without email, NO way to reach users after they leave",
        "They sign up. They leave. They forget. Game over.",
        "Email is your direct line BACK to them",
      ],
    },
    {
      title: "Start With ONE Email",
      points: [
        "The WELCOME email is all you need today",
        "SHORT: 3-4 sentences max",
        "PERSONAL: Use their name",
        "ONE ACTION: 'Click here to get started'",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Sign up for Resend (free for 3,000/month)",
        "Get API key → add to Replit Secrets",
        "Tell Claude Code: 'Send welcome email on signup'",
        "Test it. See it arrive. Done.",
      ],
    },
  ],
  16: [
    {
      title: "Day 16: Mobile Ready",
      points: [
        "More than HALF your users will be on their PHONE",
        "If it looks broken on mobile -they're GONE",
        "No second chances",
      ],
    },
    {
      title: "What You're Testing",
      points: [
        "DOES IT LOAD? On your REAL phone",
        "CAN YOU READ IT? Without pinching/zooming",
        "CAN YOU TAP THE BUTTONS? Big enough for a thumb?",
        "DOES THE MAIN THING WORK on mobile?",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Open your app on your ACTUAL phone",
        "Test every main feature",
        "Document issues, fix with Claude Code",
        "Mobile-ready = launch-ready",
      ],
    },
  ],
  17: [
    {
      title: "Day 17: Admin Dashboard",
      points: [
        "You need to SEE what's happening inside",
        "Not guess. Not assume. KNOW.",
        "How many users? Are they using it? Are they coming back?",
      ],
    },
    {
      title: "The 4 Numbers You Need",
      points: [
        "TOTAL USERS -how many ever signed up",
        "NEW THIS WEEK -are people finding you?",
        "ACTIVE THIS WEEK -are they coming back?",
        "TOTAL ACTIONS -are they doing the thing?",
      ],
    },
    {
      title: "Why This Matters",
      points: [
        "Without data, you're flying BLIND",
        "With data, you KNOW what to fix:",
        "'50 signups but 5 came back' = onboarding problem",
        "'Signups but no usage' = feature problem",
        "Data tells you what to fix",
      ],
    },
  ],
  18: [
    {
      title: "Day 18: Build Your MVP",
      points: [
        "MVP = Minimum Viable Product",
        "The SMALLEST version that delivers REAL value",
        "THIS IS THE PAUSE POINT - stay until it's ready",
      ],
    },
    {
      title: "When Your MVP is Ready",
      points: [
        "Core feature works BRILLIANTLY",
        "A stranger could use it without help",
        "You wouldn't be embarrassed to show it",
        "Time to CAPTURE your progress",
      ],
    },
    {
      title: "Submit to the Showcase",
      points: [
        "Screenshot of your dashboard",
        "Your app URL",
        "Share your experience (this becomes your testimonial)",
        "Bonus: record a quick video testimonial",
      ],
    },
  ],
  19: [
    {
      title: "Day 19: The Money",
      points: [
        "SaaS = RECURRING revenue (every customer pays monthly)",
        "100 customers at $29/mo = $34,800/year",
        "You don't need millions - you need HUNDREDS",
      ],
    },
    {
      title: "The Beautiful Math",
      points: [
        "$1K/mo = covers a car payment",
        "$5K/mo = replace a salary",
        "$10K/mo = six figures annually",
        "All achievable with hundreds of customers",
      ],
    },
    {
      title: "App vs Business",
      points: [
        "An APP = something that works",
        "A BUSINESS = you know how to get and keep customers",
        "Today: set your income goal and target customers",
        "The gap is what we'll address",
      ],
    },
  ],
  20: [
    {
      title: "Day 20: The Launch Plan",
      points: [
        "18 proven customer acquisition strategies",
        "Each rated: effort, time, cost, impact, automation",
        "Filter by what works for YOU",
      ],
    },
    {
      title: "Pick Your 3 Strategies",
      points: [
        "Product Hunt, Reddit, LinkedIn, YouTube, Cold Email...",
        "Paid ads, SEO, partnerships, community building",
        "Mix free and paid. Mix quick wins and long-term plays.",
        "No one strategy works for everyone",
      ],
    },
    {
      title: "See Your Potential",
      points: [
        "Pick your price point ($9-$199/mo)",
        "Toggle low/mid/high success scenarios",
        "See 12-month cumulative customer growth",
        "Watch your potential MRR add up",
      ],
    },
  ],
  21: [
    {
      title: "Day 21: Build Your Business",
      points: [
        "You did something most people never will",
        "Idea to product in 21 days = top 1%",
        "Now: what turns an app into a business?",
      ],
    },
    {
      title: "The Four Pillars",
      points: [
        "Customer Acquisition - how do you get customers?",
        "Pricing & Monetization - how do you maximize revenue?",
        "Retention & Growth - how do you keep them paying?",
        "Operations & Scale - how do you not burn out?",
      ],
    },
    {
      title: "Your Choice",
      points: [
        "Figure it out yourself (6-12 months trial and error)",
        "Get expert guidance (accelerate to weeks)",
        "Neither is wrong - one is faster",
        "Either way: CONGRATULATIONS. You BUILT something.",
      ],
    },
  ],
};

export function VideoSlides({ day }: VideoSlidesProps) {
  const { testMode } = useTestMode();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [open, setOpen] = useState(false);

  // Only show in test mode (admin/dev mode)
  if (!testMode) return null;

  const slides = slideContent[day];
  if (!slides || slides.length === 0) return null;

  const goNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setCurrentSlide(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Presentation className="w-4 h-4" />
          Video Slides
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Day {day} Video Slides
          </DialogTitle>
        </DialogHeader>

        {/* Slide Content */}
        <div className="min-h-[400px] flex flex-col">
          <div className="flex-1 bg-white border-2 border-slate-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {slides[currentSlide].title}
            </h2>
            <ul className="space-y-4">
              {slides[currentSlide].points.map((point, i) => (
                <li key={i} className="flex items-start gap-4 text-lg text-slate-700">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {/* Slide Indicators */}
            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-sm">
                {currentSlide + 1} / {slides.length}
              </span>
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentSlide
                        ? "bg-primary"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={currentSlide === slides.length - 1}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Test mode only
        </p>
      </DialogContent>
    </Dialog>
  );
}
