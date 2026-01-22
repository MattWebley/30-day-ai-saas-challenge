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
      title: "How To Create It",
      points: [
        "AI tools change ALL THE TIME -what works today might not tomorrow",
        "Use whatever AI you ALREADY have (ChatGPT, Claude, etc.)",
        "Or try Abacus AI to test multiple models with one prompt",
        "Fallback: 5-min text logo in Canva, or just hire someone on Fiverr",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Pick your brand vibe and colors",
        "Generate your AI prompt",
        "Create and save as PNG",
        "You can always refine later -just GET ONE",
      ],
    },
  ],
  6: [
    {
      title: "Day 6: AI Tech Stack",
      points: [
        "Keep it SIMPLE -you only need TWO tools",
        "Don't overcomplicate this",
        "Get PAID accounts -they're worth it",
      ],
    },
    {
      title: "Essential Tools (Required)",
      points: [
        "REPLIT -your dev environment, easy to use, has fallback AI agent",
        "CLAUDE PRO (~$20/mo) -the REAL powerhouse, plugs into Replit",
        "Claude Code = best coding model, lower costs, incredible results",
      ],
    },
    {
      title: "Optional Tools (Nice to Have)",
      points: [
        "ChatGPT Plus -brainstorming, second opinions",
        "Abacus AI -video gen, text-to-speech, images, all sorts of assets",
        "OpenAI API -if your app needs AI features",
        "Add these LATER if you need them",
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
        "Use Claude to generate your PRD",
        "Review it -change anything wrong",
        "Paste it into Replit",
        "Watch it start building FOR you",
      ],
    },
  ],
  8: [
    {
      title: "Day 8: Development Setup",
      points: [
        "Today: Set up your PROFESSIONAL dev environment",
        "Three things you need",
        "This is what REAL developers use",
      ],
    },
    {
      title: "The Three Tools",
      points: [
        "1. GITHUB - version control, never lose your work",
        "2. CLAUDE CODE - same power, fraction of Replit AI cost",
        "3. CLAUDE.md - your instruction file for Claude",
      ],
    },
    {
      title: "Why This Matters",
      points: [
        "Without GitHub: One mistake = lose everything",
        "Without Claude Code: Burn through money",
        "Without CLAUDE.md: Claude doesn't know your project",
        "With all three? Professional setup. Let's go.",
      ],
    },
  ],
  9: [
    {
      title: "Day 9: Master Claude Code",
      points: [
        "The SECRET is how you TALK to Claude",
        "Vague prompts = vague results",
        "Today you learn the rules that make it click",
      ],
    },
    {
      title: "The Prompting Rules",
      points: [
        "BE SPECIFIC: 'Make it better' = useless",
        "ONE THING at a time: Login first, THEN dashboard",
        "DESCRIBE problems: what happens vs what should happen",
        "Good prompts = fast results",
      ],
    },
    {
      title: "Power Move: Prompt Stacking",
      points: [
        "Most people: prompt, wait, prompt, wait (SLOW)",
        "Pros: stack up prompts while Claude works",
        "THE CATCH: Only stack for DIFFERENT files",
        "Same file = wait. Different files = stack away.",
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
      title: "Day 14: Users & Admin",
      points: [
        "TWO things today: auth + admin dashboard",
        "Auth = who are your users?",
        "Admin = what are they doing?",
      ],
    },
    {
      title: "Part 1: Authentication",
      points: [
        "Replit probably ALREADY has it - check first",
        "If YES - skip to Part 2",
        "If NO - one prompt adds it all",
        "Test: can user A see user B's data? Shouldn't.",
      ],
    },
    {
      title: "Part 2: Admin Dashboard",
      points: [
        "4 numbers you need: total users, new this week,",
        "active this week, total actions",
        "Build /admin page - only YOU can access",
        "Check daily - data tells you what to fix",
      ],
    },
  ],
  15: [
    {
      title: "Day 15: Take Payments",
      points: [
        "Once you add payments, you have a BUSINESS",
        "Not a project. Not a hobby. A real business.",
        "This is one of the biggest milestones",
      ],
    },
    {
      title: "The Psychology of Charging",
      points: [
        "Charging SOMETHING is infinitely better than free",
        "Free users complain the most, value it the least",
        "Most people charge TOO LITTLE at first",
        "Start higher than feels comfortable",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Create Stripe account (free)",
        "Get TEST keys → add to Replit Secrets",
        "Build checkout with Claude Code",
        "Test with card 4242 4242 4242 4242",
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
      title: "Day 17: Autonomous Testing",
      points: [
        "Tomorrow is THE PAUSE POINT - MVP day",
        "Before you ship, you want to KNOW it works",
        "Not hope. Not 'I think so.' KNOW.",
      ],
    },
    {
      title: "The Testing Superpower",
      points: [
        "Claude Code can write tests FOR you",
        "Tests run automatically - in seconds",
        "No more clicking around hoping things work",
        "One test for your ONE core feature",
      ],
    },
    {
      title: "The Process",
      points: [
        "1. Identify your core feature",
        "2. Have Claude write a test for it",
        "3. Run the test",
        "4. If it fails - GOOD! Fix the bug",
        "5. Run again until it passes = PROOF it works",
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
      title: "Day 19: The Sales Machine",
      points: [
        "Before traffic, you need a system to CONVERT it",
        "A sales machine turns strangers into customers automatically",
        "No rejection, no selling, works while you SLEEP",
      ],
    },
    {
      title: "The Free Trial Formula",
      points: [
        "Show the problem they have (they feel SEEN)",
        "Show the solution your app provides",
        "Make the offer irresistible: 'Try free, no credit card'",
        "Remove ALL risk - people convince themselves",
      ],
    },
    {
      title: "The AI Warning",
      points: [
        "AI sales pages LOOK professional but don't convert",
        "Generic copy, no emotional connection",
        "AI pages: 0.5-1% conversion",
        "Well-crafted pages: 3-10%+ - that's a 10x difference",
      ],
    },
  ],
  20: [
    {
      title: "Day 20: Your Launch Plan",
      points: [
        "A product nobody knows about makes $0",
        "The OVERWHELM TRAP: trying to be everywhere",
        "You only need 1-3 channels to work",
      ],
    },
    {
      title: "Pick What Fits YOU",
      points: [
        "Love writing? SEO, Twitter, LinkedIn",
        "Love video? YouTube, TikTok, Reels",
        "Love talking? Cold outreach, communities, podcasts",
        "Have budget? Paid ads, sponsorships",
      ],
    },
    {
      title: "Lock In Your Focus",
      points: [
        "Browse all the options",
        "Pick 1-3 channels maximum",
        "Commit to these for 90 days",
        "Tomorrow: the money math",
      ],
    },
  ],
  21: [
    {
      title: "Day 21: Your $100K Roadmap",
      points: [
        "CONGRATULATIONS - you built something!",
        "SaaS = RECURRING revenue (customers pay every month)",
        "100 customers at $29/mo = $34,800/year",
      ],
    },
    {
      title: "The Math + Your Growth Plan",
      points: [
        "Calculate: income goal, price point, customers needed",
        "Pick 1-3 customer acquisition strategies (50+ options)",
        "You only need ONE channel to WORK",
        "The secret: go ALL IN on what fits you",
      ],
    },
    {
      title: "What's Next?",
      points: [
        "An APP = something that works",
        "A BUSINESS = knowing how to get and keep customers",
        "Two paths: figure it out (6-12 months) OR get guidance (weeks)",
        "Book a call: mattwebley.com/workwithmatt",
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
