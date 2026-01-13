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
        "1. SHOW UP DAILY — consistency beats intensity",
        "2. NEVER BREAK THE CHAIN — your streak matters",
        "3. DONE > PERFECT — ship beats polish",
        "4. NO SKIPPING — each day builds on the last",
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
        "PAIN INTENSITY — Is this task hated/frequent/costly?",
        "CASH PROXIMITY — Does it help earn or save money?",
        "SPEED TO MVP — Can you ship in 14 days?",
        "PERSONAL ADVANTAGE — Your knowledge, access, audience?",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Generate 28 personalized ideas using AI",
        "Score each against the 4-point filter",
        "Shortlist your top 3-5 ideas",
        "Don't overthink — trust your gut",
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
        "1. ASK YOUR LLM — Is this viable? Be BRUTALLY honest",
        "2. FIND COMPETITORS — If 3+ exist, demand is proven",
        "3. ASK YOUR TARGET — Talk to real people with the problem",
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
        "ALWAYS get the .com — no exceptions",
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
      title: "Day 5: AI Tech Stack",
      points: [
        "These tools are your SUPERPOWERS",
        "Total cost: ~$50/month — accept it as cost of doing business",
        "Get PAID accounts — don't skimp here",
      ],
    },
    {
      title: "Your AI Stack",
      points: [
        "ChatGPT Plus (~$20/mo) — advice, content, ideas",
        "Claude Pro (~$20/mo) — second opinion, different strengths",
        "Replit — where your software LIVES",
        "OpenAI API — the brain of your app (pay-as-you-go)",
      ],
    },
    {
      title: "Why Both Claude AND ChatGPT?",
      points: [
        "They're good at DIFFERENT things",
        "Play them off each other for better results",
        "One writes, the other critiques",
        "This changes constantly — stay flexible",
      ],
    },
  ],
  6: [
    {
      title: "Day 6: Create Your PRD",
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
        "Review it — change anything wrong",
        "Paste it into Replit",
        "Watch it start building FOR you",
      ],
    },
  ],
  7: [
    {
      title: "Day 7: Claude Code Setup",
      points: [
        "AI agents are FASTER, CHEAPER, BETTER than dev teams",
        "What took weeks with humans = MINUTES with AI",
        "This is an ever-changing space — EMBRACE it",
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
  8: [
    {
      title: "Day 8: Master Claude Code",
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
  9: [
    {
      title: "Day 9: The Build Loop",
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
        "Congratulations — you just did the loop!",
      ],
    },
  ],
  10: [
    {
      title: "Day 10: Add The AI Brain",
      points: [
        "This is what makes AI SaaS SPECIAL",
        "Users EXPECT intelligence now — it's 2025",
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
  11: [
    {
      title: "Day 11: Add Superpowers",
      points: [
        "External APIs = capabilities you CAN'T build yourself",
        "Payments, data feeds, integrations",
        "BUT FIRST: Ask Replit if it can do it natively",
      ],
    },
    {
      title: "Common Superpowers",
      points: [
        "PAYMENTS: Stripe — the standard for charging money",
        "SCRAPING: Bright Data — get data from other sites",
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
  12: [
    {
      title: "Day 12: Add Login",
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
        "If YES — you're DONE. Move on.",
        "If NO — one prompt adds it all",
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
  13: [
    {
      title: "Day 13: Email Setup",
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
  14: [
    {
      title: "Day 14: Heads Down",
      points: [
        "THIS IS THE PAUSE POINT",
        "Build Mode isn't a one-day thing",
        "Stay here until your app is READY",
      ],
    },
    {
      title: "The Rule",
      points: [
        "Some people spend one day here",
        "Some spend two WEEKS here",
        "BOTH ARE FINE",
        "Use the PAUSE button. Come back tomorrow. Repeat.",
      ],
    },
    {
      title: "When To Move On",
      points: [
        "Core features working",
        "Handles errors gracefully",
        "Looks decent (not perfect, DECENT)",
        "Something you'd show to a real person",
        "When you hit that — move to testing",
      ],
    },
  ],
  15: [
    {
      title: "Day 15: Test Your USP",
      points: [
        "Your USP is your WEAPON",
        "It's why someone picks YOU over 10 competitors",
        "Today we make sure that weapon is SHARP",
      ],
    },
    {
      title: "The Question That Matters",
      points: [
        "Show your USP to a potential customer RIGHT NOW",
        "Would they say 'Wow, I'd pay for that'?",
        "If not a clear YES — we have work to do",
        "No excuses ('once I add X...')",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Open your app. Do the USP thing.",
        "Ask yourself: Would I pay for this?",
        "Compare to a competitor — is yours BETTER?",
        "Make it UNDENIABLE",
      ],
    },
  ],
  16: [
    {
      title: "Day 16: Feature Testing",
      points: [
        "Today you become your app's WORST enemy",
        "Click every button. Fill every form.",
        "Try to BREAK things",
      ],
    },
    {
      title: "Try To Break It",
      points: [
        "Enter NOTHING — submit empty forms",
        "Enter GARBAGE — asdfasdf in every field",
        "Enter EVERYTHING — paste a novel",
        "Do things in the WRONG ORDER",
        "What happens?",
      ],
    },
    {
      title: "Your Task Today",
      points: [
        "Test like a USER, not a developer",
        "Write down bugs — don't fix yet",
        "Finish testing, THEN fix everything",
        "Break it now so users don't break it later",
      ],
    },
  ],
  17: [
    {
      title: "Day 17: User Onboarding",
      points: [
        "First impressions are EVERYTHING",
        "You have 2 MINUTES before they decide",
        "Get them to their first WIN as fast as possible",
      ],
    },
    {
      title: "The 2-Minute Rule",
      points: [
        "Within 2 minutes of signing up, a user should:",
        "1. Understand what the app does",
        "2. DO the main thing",
        "3. See a result that makes them say 'oh, that's cool'",
      ],
    },
    {
      title: "What KILLS Onboarding",
      points: [
        "Long tutorials (no one watches)",
        "Too many steps before value",
        "Empty states with no guidance",
        "Feature dumps ('Here's 20 things!')",
        "Keep it SIMPLE",
      ],
    },
  ],
  18: [
    {
      title: "Day 18: Admin Dashboard",
      points: [
        "You need to SEE what's happening inside",
        "Not guess. Not assume. KNOW.",
        "How many users? Are they using it? Are they coming back?",
      ],
    },
    {
      title: "The 4 Numbers You Need",
      points: [
        "TOTAL USERS — how many ever signed up",
        "NEW THIS WEEK — are people finding you?",
        "ACTIVE THIS WEEK — are they coming back?",
        "TOTAL ACTIONS — are they doing the thing?",
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
  19: [
    {
      title: "Day 19: Mobile Ready",
      points: [
        "More than HALF your users will be on their PHONE",
        "If it looks broken on mobile — they're GONE",
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
      title: "The Reality Check",
      points: [
        "You're not playing around anymore",
        "This is a REAL product on ANY device",
        "Two more days. That's it.",
        "Two days and you can put a price tag on this",
      ],
    },
  ],
  20: [
    {
      title: "Day 20: Brand & Beauty",
      points: [
        "Your app WORKS. But does it LOOK like it's worth paying for?",
        "People judge in the first 3 SECONDS",
        "Before they even USE it",
      ],
    },
    {
      title: "This Is Simpler Than You Think",
      points: [
        "PICK ONE COLOR — use it everywhere",
        "TEXT LOGO IS FINE — your name in a clean font",
        "MAKE IT CONSISTENT — same style everywhere",
        "Consistency = professional",
      ],
    },
    {
      title: "Look At What You've Built",
      points: [
        "This isn't a side project anymore",
        "This is a branded, professional SaaS product",
        "Built in 20 days",
        "Tomorrow: you LAUNCH",
      ],
    },
  ],
  21: [
    {
      title: "Day 21: LAUNCH DAY",
      points: [
        "21 days ago, you wondered if you could do this",
        "Build a real SaaS. With AI. From scratch.",
        "Look at where you are NOW.",
      ],
    },
    {
      title: "Pre-Launch Checklist",
      points: [
        "Can someone sign up and log in? ✓",
        "Does your main feature work? ✓",
        "Does your USP feature work? ✓",
        "Does it work on mobile? ✓",
        "Does it look professional? ✓",
      ],
    },
    {
      title: "YOU DID IT",
      points: [
        "You built a SaaS in 21 days",
        "Most people only DREAM about this",
        "You ACTUALLY DID IT",
        "Hit that launch button. You've earned it.",
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
