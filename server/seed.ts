import { db } from "./db";
import { dayContent, badges, emailTemplates } from "@shared/schema";
import { count } from "drizzle-orm";

export async function seedIfNeeded() {
  try {
    const [result] = await db.select({ count: count() }).from(dayContent);
    if (result.count > 0) {
      console.log("✅ Database already seeded, skipping...");
      return;
    }
    console.log("📦 Database empty, running seed...");
    await seed();
  } catch (error) {
    console.error("Error checking database:", error);
  }
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed badges - aligned with timeline milestones
  // Start (Day 0) → Idea (Days 1-2) → Plan (Days 3-4) → Prepare (Days 5-9) → Build (Days 10-18) → Launch (Days 19-21)
  console.log("Creating badges...");
  const badgeData = [
    // Phase completion badges
    {
      name: "All In",
      description: "Made a commitment to yourself",
      icon: "🤝",
      triggerType: "day_completed",
      triggerValue: 0,
    },
    {
      name: "Ideator",
      description: "You've picked your winning idea",
      icon: "💡",
      triggerType: "day_completed",
      triggerValue: 2,
    },
    {
      name: "Strategist",
      description: "Your product is planned and named",
      icon: "🗺️",
      triggerType: "day_completed",
      triggerValue: 4,
    },
    {
      name: "Ready to Build",
      description: "Tools set up, PRD ready, let's build",
      icon: "🎯",
      triggerType: "day_completed",
      triggerValue: 9,
    },
    {
      name: "Builder",
      description: "Your MVP is complete",
      icon: "🏗️",
      triggerType: "day_completed",
      triggerValue: 18,
    },
    {
      name: "On the Map",
      description: "Your app is discoverable by Google & AI",
      icon: "📍",
      triggerType: "day_completed",
      triggerValue: 20,
    },
    {
      name: "The Launcher",
      description: "You launched your SaaS!",
      icon: "🚀",
      triggerType: "day_completed",
      triggerValue: 21,
    },
    // Build in Public badge
    {
      name: "Public Builder",
      description: "Shared your commitment to build in public",
      icon: "📣",
      triggerType: "build_in_public",
      triggerValue: 1,
    },
    // Ambassador badge - for submitting a testimonial
    {
      name: "Ambassador",
      description: "Shared your experience with a testimonial",
      icon: "🌟",
      triggerType: "testimonial_submitted",
      triggerValue: 1,
    },
    // Streak badges
    {
      name: "On Fire!",
      description: "7-day streak - One week strong!",
      icon: "🔥",
      triggerType: "streak",
      triggerValue: 7,
    },
    {
      name: "Unstoppable",
      description: "14-day streak - Two weeks of consistency!",
      icon: "⚡",
      triggerType: "streak",
      triggerValue: 14,
    },
    {
      name: "Marathon Runner",
      description: "18-day streak - Made it to the pause point!",
      icon: "🏃",
      triggerType: "streak",
      triggerValue: 18,
    },
    // Referral badges
    {
      name: "Connector",
      description: "Referred your first friend - unlocked Launch Checklist!",
      icon: "🤝",
      triggerType: "referral",
      triggerValue: 1,
    },
    {
      name: "Networker",
      description: "Referred 3 friends - unlocked Marketing Prompts!",
      icon: "📢",
      triggerType: "referral",
      triggerValue: 3,
    },
    {
      name: "Influencer",
      description: "Referred 5 friends - unlocked Custom Critique Video!",
      icon: "🎬",
      triggerType: "referral",
      triggerValue: 5,
    },
    {
      name: "Super Referrer",
      description: "Referred 10 friends - unlocked Free Coaching Call!",
      icon: "🏆",
      triggerType: "referral",
      triggerValue: 10,
    },
  ];

  // Clear existing badges and re-insert (badges don't have a unique constraint besides id)
  await db.delete(badges);
  for (const badge of badgeData) {
    await db.insert(badges).values(badge);
  }

  // Seed day content (21 days + Start Here)
  console.log("Creating day content...");
  const dayContentData = [
    // ============================================
    // START HERE (Day 0)
    // ============================================
    {
      day: 0,
      title: "Start Here",
      description: "Welcome to the 21-Day AI SaaS Challenge! Get motivated, learn the rules for success, and commit to your journey.",
      phase: "Start",
      videoUrl: null,
      aiTaskType: null,
      aiTaskTitle: null,
      aiTaskDescription: null,
      suggestions: null,
      template: null,
      microDecisionQuestion: null,
      microDecisionOptions: null,
      reflectionQuestion: null,
      tip: "This challenge has been carefully designed to take you from zero to launch-ready. Set a daily reminder, same time every day, and trust the process. The people who finish are the ones who show up consistently.",
      lesson: `Welcome to the 21-Day AI SaaS Challenge!

In the next 21 days, you're going to go from idea to launch-ready product. No fluff. No theory. Just focused action every single day.

This isn't a course you watch. It's a challenge you DO.

WHY AN APP, NOT VIDEOS?

The AI space moves FAST. Tools change. Best practices evolve. What works today might be outdated next month. By building this as an interactive app instead of pre-recorded videos, I can update the challenge in real-time whenever something major changes. You'll always have the most current strategies and tools - not advice from 6 months ago.

THE RULES FOR SUCCESS:

1. SHOW UP DAILY - Some days are quick, some take longer. What matters is you show up and do the work.

2. NEVER BREAK THE CHAIN - Show up every single day. Your streak is your commitment to yourself.

3. DONE > PERFECT - A shipped product beats a perfect idea. Progress over perfection, always.

4. NO SKIPPING - Every day builds on the last. Skip one, and you'll feel lost. Trust the process.

You're about to join a small percentage of people who actually BUILD instead of just talking about it.

Ready? Let's go.`,
      outcome: "Commitment to the 21-day journey with a clear understanding of the rules for success",
      completionMessage: "You've made the commitment. Now it's time to find your winning idea. See you on Day 1!",
      xpReward: 50,
      estimatedMinutes: 3,
    },
    // ============================================
    // IDEA (Days 1-2)
    // ============================================
    {
      day: 1,
      title: "Choosing Your $100K+ Idea",
      description: "Use AI to generate personalized SaaS ideas based on your knowledge, skills, and interests - then shortlist the best ones.",
      phase: "Idea",
      videoUrl: null,
      aiTaskType: "suggestion",
      aiTaskTitle: "AI Idea Generator",
      aiTaskDescription: "Tell us about yourself and AI will generate personalized SaaS ideas scored against proven criteria. Don't like them? Regenerate for fresh ideas!",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Which area excites you most?",
      microDecisionOptions: JSON.stringify(["B2B SaaS", "B2C Apps", "Developer Tools", "Productivity"]),
      reflectionQuestion: "What problem do you want to solve and why does it matter to you?",
      tip: "The BEST first projects come from what you ALREADY KNOW. If you've been in any business where people make REAL MONEY - you've got a MASSIVE head start! Getting someone to buy something that helps them MAKE MORE MONEY is an EASY sell.",
      lesson: `Here's the BRUTAL truth: The BEST first projects come from what you ALREADY KNOW.

If you've been in KDP, print on demand, Amazon FBA, online courses, or ANY business where people are making REAL MONEY - you've got a MASSIVE head start!

Why? Because getting someone to buy a "cute goldfish app" is HARD. Getting them to buy something that helps them MAKE MORE MONEY? That's an EASY sell! These people see tools as ESSENTIAL INVESTMENTS, not "nice to haves."

PRO TIP: B2B (selling to businesses) is almost ALWAYS a better starting point than B2C (selling to consumers). Businesses EXPECT to pay for tools. They have BUDGETS. They make decisions FAST. Consumers? They'll spend 3 hours comparing apps to save $2.

THE 4-POINT FILTER:

1. PAIN INTENSITY - Is this a HATED, FREQUENT, DIFFICULT, SLOW or COSTLY task?
2. CASH PROXIMITY - Does it help them EARN or SAVE money (or time)?
3. SPEED TO MVP - Can you ship a working version in 14 days or LESS?
4. PERSONAL ADVANTAGE - Do YOU have any KNOWLEDGE? ACCESS? INSIGHT? AUDIENCE?

Score each 1-5. If it doesn't hit 16+ out of 20, it's DEAD in the water.

Think NICHE - DO NOT THINK BROAD! The NICHER the BETTER usually...`,
      outcome: "Your shortlist of SaaS ideas, ready for validation",
      completionMessage: "Most people never get past 'someday I'll start.' You've got your ideas locked in and you're ready to move. You're already ahead of 90% of people who talk about building a business. Tomorrow, we find out which one people will actually PAY for.",
      xpReward: 100,
      estimatedMinutes: 8,
    },
    {
      day: 2,
      title: "Will People Pay For This?",
      description: "Validate your idea by identifying real pain points, checking competitors, and creating your 'I help X with Y problem' statement.",
      phase: "Idea",
      videoUrl: null,
      aiTaskType: "suggestion",
      aiTaskTitle: "Idea Validation & Pain Point Analysis",
      aiTaskDescription: "AI analyzes your chosen idea against market demand, competitors, and identifies the specific painful problems it solves.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your primary competitive advantage?",
      microDecisionOptions: JSON.stringify(["Better UX", "Lower Price", "Unique Feature", "Niche Focus"]),
      reflectionQuestion: "What makes your solution different from existing alternatives?",
      tip: "Competition is NOT bad - it means there's MONEY in it! If you can't find at LEAST 3 active competitors, demand might be UNPROVEN. Look for where people are COMPLAINING about existing tools.",
      lesson: `There's absolutely NO point trying to build a SaaS if you aren't going to make any MONEY at it! Here's the 3-step framework to validate your idea:

STEP 1: Ask your LLM

Just straight up ASK Claude if your idea is likely a VIABLE idea. Will this make money or not? And WHY? Tell it to BE HONEST and NOT sugar coat it.

STEP 2: Look for competitors SELLING something similar

If there are other products on the market already with similar FEATURES that solve the SAME problems, then chances are you can make something BETTER, FASTER, CHEAPER and take some of their market share.

STEP 3: ASK your target market

If you can TALK to people that have the PROBLEM that your SAAS is looking to solve and simply see if they LIKE the idea - you learn lots this way.

BONUS: TRUST YOUR GUT.

It NEVER lets me down!

The "I Help" Statement:

By end of today, you should be able to say: "I help [SPECIFIC PERSON] solve [PAINFUL PROBLEM] so they can [DESIRED OUTCOME]."`,
      outcome: "One validated SaaS idea with specific pain points you'll solve - and your 'I help X with Y' statement",
      completionMessage: "The hardest decision is behind you. You picked ONE idea and identified the exact pains it solves. That's what separates builders from dreamers. Now we turn these pain points into features.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    // ============================================
    // PLAN (Days 3-4)
    // ============================================
    {
      day: 3,
      title: "Core Features & Your USP",
      description: "Clone competitor's essential features AND identify 1-2 unique features that will set you apart from everyone else.",
      phase: "Plan",
      videoUrl: null,
      aiTaskType: "suggestion",
      aiTaskTitle: "Feature Generation & USP Discovery",
      aiTaskDescription: "AI analyzes competitor features to identify must-haves, then helps you discover unique selling points that differentiate you.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your USP focus?",
      microDecisionOptions: JSON.stringify(["Speed/Simplicity", "AI-Powered", "Better Integration", "Niche-Specific"]),
      reflectionQuestion: "What one unique feature will make customers choose you over competitors?",
      tip: "Why create a 'clone' when you can have ALL their best features AND be 10-20% better with just ONE unique feature? That's a WINNING combination.",
      lesson: `The TRUTH is, if you just create something with the SAME feature set as a competitor then YOU can have a WILDLY successful business! BUT... Why create some "clone" when you can have ALL of their best features AND be 10-20% better by including ONE feature they don't have!

STEP 1: List Essential Core Features

These are the features that your competitors have that if YOU don't have them, most people will NOT switch to yours or even consider it. Where multiple competitors share the same features, this forms YOUR feature set.

STEP 2: Find Your USP

Ask Claude: "I am building SAAS for [NICHE]. My target market are [AVATAR] and the problem my SAAS solves is [PROBLEM]. Write me 10 USP ideas that my competition doesn't likely have that would make my software better than theirs."

Go through them and PICK one or two that excite you. If results are generic, tell it: "I want these USP ideas to be so wild, it'd shock people in the space. NOTHING generic will do."

The WINNING FORMULA:

CLONED CORE FEATURES + USP + LONGER FREE TRIAL + CHEAPER MONTHLY PRICE = WIN`,
      outcome: "A complete feature list: core features you MUST have, competitive must-haves, and 1-2 unique USP features",
      completionMessage: "You know what beats a 'perfect' feature list? One that you can actually build. You just defined your core features, what competitors have, and what makes you DIFFERENT. Tomorrow: naming your product and claiming your territory.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 4,
      title: "Name It & Claim It",
      description: "Choose your product name, secure the .com domain, claim your social handles, and do a quick trademark check before you fall in love with it.",
      phase: "Plan",
      videoUrl: null,
      aiTaskType: "suggestion",
      aiTaskTitle: "AI Name Generator",
      aiTaskDescription: "AI generates brandable name ideas based on your idea, pain points, and features. Then you'll register your domain, claim social handles, and check for trademarks.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What vibe do you want for your brand name?",
      microDecisionOptions: JSON.stringify(["Short & Punchy (Slack, Zoom)", "Made-up Word (Spotify, Trello)", "Compound Word (Mailchimp, Dropbox)", "Action Word (Notion, Figma)"]),
      reflectionQuestion: "Say your product name out loud 5 times. Does it feel right? If you have to spell it for people, it's wrong.",
      tip: "NEVER pay more than $10-15/year for a .com domain. If someone wants $100+, it's a domain squatter. Change the name instead. Your time is better spent building than negotiating with hoarders.",
      lesson: `Your name is your first impression. Get this RIGHT.

THE GOLDEN RULES:

1. ALWAYS GET THE .COM - Not .io, not .co, not .app. The .com. It's what people type automatically. If you can't get the .com for a reasonable price, CHANGE THE NAME.

2. KEEP IT SHORT - 1-2 words maximum. Under 10 characters is ideal. If you can't fit it in a Twitter handle, it's too long.

3. MAKE IT SPEAKABLE - Say it out loud. If you have to spell it for people every time, it's WRONG. "It's Trello, T-R-E-L-L-O" is fine. "It's Xqyzt, X-Q-Y-Z-T" is not.

4. BE UNIQUE - "ProjectManager" is not a name - it's a description. "Asana" is a name. Made-up words that SOUND good are often better than descriptive names.

NAMING APPROACHES (Pick One):

1. INVENTED/BRANDABLE - Made-up words like Spotify, Trello, Asana. Unique, trademarkable, and .com is usually available. AI generates these for you.

2. DESCRIPTIVE - Describes what it does like Mailchimp, Salesforce, QuickBooks. Clearer to customers but harder to get the .com.

Either works. Invented names are easier to get domains for, descriptive names are easier for customers to understand. Pick what feels right and can get a .com for under $20.

WHAT TO AVOID:

❌ HYPHENS OR NUMBERS - "task-hub-123.com" looks cheap and confusing. Just don't.

❌ OVERPAYING FOR DOMAINS - Normal .com registration: $10-15/year on Namecheap. If it's $100+, it's a "premium" domain owned by a squatter. If you can't get it for under $20, pick a DIFFERENT name.

❌ GENERIC NAMES - "Analytics Platform" or "Marketing Tool" - you can't trademark these and they're forgettable.

CLAIM YOUR SOCIAL HANDLES:

Once you have a name, grab it EVERYWHERE before someone else does:

- Twitter/X - Your brand's voice
- Instagram - Visual presence
- YouTube - For video content
- Facebook - Business page
- LinkedIn - B2B credibility
- TikTok - If your audience is there

Why bother? Because in 6 months when you're ready to grow, you don't want to find out @YourBrandName is taken by a dormant account or a squatter wanting $500.

Same rules as domains: if the exact handle isn't available, consider tweaking the name NOW rather than being "YourBrandName_Official" forever.

CHECK FOR TRADEMARKS:

Before you get too attached, do a quick trademark search. You DON'T need to register a trademark right now - that can come later when you're making money. But you DO want to make sure no one else has already trademarked your exact name in the software/SaaS space.

Search the UK Intellectual Property Office and the US Patent and Trademark Office (USPTO). If you find an exact match in your industry, consider tweaking the name now rather than dealing with a cease-and-desist letter later.

The name you pick today will be on every invoice, every email, every conversation. Make it count.

IN THE EXERCISE BELOW:

You'll get AI-generated name suggestions, then clickable links to check everything - domain availability on Namecheap, trademark searches for UK and US, and direct signup links for Twitter/X, Instagram, YouTube, and more. All in one place, no hunting around.`,
      outcome: "Your product name chosen, .com domain registered, social handles claimed, and trademark search completed",
      completionMessage: "You have a NAME. A real brand that's YOURS. Domain secured, socials claimed, trademarks checked. Nobody can take these from you now. Tomorrow: creating your logo.",
      xpReward: 100,
      estimatedMinutes: 15,
    },
    // ============================================
    // PREPARE (Days 5-9)
    // ============================================
    {
      day: 5,
      title: "Create Your Logo",
      description: "Design a simple, memorable logo for your SaaS. You don't need to be a designer - AI tools make this easy.",
      phase: "Prepare",
      videoUrl: null,
      aiTaskType: "creative",
      aiTaskTitle: "Logo Creation",
      aiTaskDescription: "Create a professional logo using AI tools or simple design principles.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What style of logo fits your brand?",
      microDecisionOptions: JSON.stringify(["Text-only logo", "Icon + text", "Abstract symbol", "Lettermark (initials)"]),
      reflectionQuestion: "Does your logo feel like YOUR brand?",
      tip: "A text-only logo in a clean font is better than a bad graphic. Don't overthink it - you can always refine later.",
      lesson: `Your logo is the FACE of your product.

It doesn't need to be perfect. It needs to be DONE.

THE TRUTH ABOUT LOGOS:

Most successful companies have SIMPLE logos. Google is just text. Netflix is just text. Stripe is just text. You don't need a fancy designer.

HOW WE'RE DOING THIS:

AI image tools change ALL THE TIME. What works great today might not tomorrow. So here's the approach:

OPTION 1 (RECOMMENDED): TRY MULTIPLE AI MODELS
Use [Abacus AI](https://chatllm.abacus.ai/WlwgmxfvHg) to test your prompt across different image generators - DALL-E, Stable Diffusion, Midjourney-style models, and more. Same prompt, multiple models, see what looks best. This is the best way to find a model that works for YOUR logo.

OPTION 2: USE WHAT YOU ALREADY HAVE
If you're already paying for ChatGPT Plus or another AI with image generation - give it a try. Some models are better at logos than others, so you may need to experiment.

FALLBACK: DIY TEXT LOGO IN 5 MINUTES
1. Go to [Canva](https://www.canva.com/) (free)
2. Search "logo" templates
3. Pick one that's SIMPLE
4. Replace the text with your app name
5. Choose 1-2 colors max
6. Download as PNG

OR JUST OUTSOURCE IT ($5-20)
Not into design? Hire someone on [Fiverr](https://www.fiverr.com/categories/graphics-design/creative-logo-design). Logos start at $5 and you can get something decent for under $20. Totally valid - focus on what YOU'RE good at.

WHAT MAKES A GOOD LOGO:

- Readable at small sizes
- Works in black and white
- Simple enough to remember
- Matches your brand vibe

Don't spend days on this. Spend 30 minutes, make something decent, move on. You can always update it later.`,
      outcome: "A logo file ready to use in your app",
      completionMessage: "You have a logo! Your app now has a face. Tomorrow: setting up your AI toolkit.",
      xpReward: 100,
      estimatedMinutes: 15,
    },
    {
      day: 6,
      title: "Your AI Toolkit",
      description: "Sign up for Replit and Claude Pro - the only two tools you NEED to build your SaaS.",
      phase: "Prepare",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Tool Setup Checklist",
      aiTaskDescription: "Set up your accounts for Replit (development environment) and Claude Pro (AI coding powerhouse).",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Have you used AI coding tools before?",
      microDecisionOptions: JSON.stringify(["Never", "A little", "Regularly", "I'm experienced"]),
      reflectionQuestion: "What's holding you back from building right now?",
      tip: "Get the PAID accounts. The prices are ridiculously low for what you get. IMPORTANT: We do most things through Claude Code, NOT Replit's AI. But when you DO use Replit's agent, click the lightning bolt icon for 'fast' mode. It handles most tasks and costs WAY less than the default mode.",
      lesson: `Your AI Tech Stack - Keep it SIMPLE:

ESSENTIAL (you need both):

1. REPLIT - Your development environment. Easy to use, runs in the browser, has a built-in AI agent as a fallback option.

2. CLAUDE PRO (~$20/month) - The REAL powerhouse. Claude Code plugs INTO Replit and becomes your primary AI coding assistant. Better quality code, lower costs than using Replit's agent alone.

That's it. Two tools. Don't overcomplicate this.

HOW THEY WORK TOGETHER:

Replit gives you the environment and ease of use. Claude Code does the heavy lifting - it's the best coding model available and works REALLY well. You get the best of both worlds.

OPTIONAL (nice to have, not required):

- Wispr Flow - Voice-to-text AI that lets you talk instead of type. 3x faster.
- Abacus AI - Video generation, text-to-speech, image generation, and all sorts of AI models to create assets
- OpenAI API - If your app needs AI features (we'll cover this later)

The goal is to START BUILDING, not to collect subscriptions.`,
      outcome: "Replit and Claude Pro accounts set up and ready to build",
      completionMessage: "Your AI toolkit is ready. You now have superpowers that would've cost $300K+ and taken years just a few years ago. Tomorrow: we create your PRD and start building.",
      xpReward: 100,
      estimatedMinutes: 10,
    },
    {
      day: 7,
      title: "Summary + PRD Into Replit",
      description: "Finalize your plan, generate a professional Product Requirements Document with AI, and paste it into Replit to start building.",
      phase: "Prepare",
      videoUrl: null,
      aiTaskType: "template",
      aiTaskTitle: "PRD Generation",
      aiTaskDescription: "AI summarizes everything from Days 1-5 and creates a complete Product Requirements Document ready for Replit.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How detailed should your PRD be?",
      microDecisionOptions: JSON.stringify(["Brief overview", "Standard detail", "Very detailed", "Everything included"]),
      reflectionQuestion: "Looking at everything you've defined, what excites you most about building this?",
      tip: "We write the PRD with Claude, then paste it into Replit to build the initial app. After that, we switch to Claude Code for 99% of ongoing work - it's much better for iterating, adding features, and keeping costs down.",
      lesson: `WHAT IS A PRD?

A PRD (Product Requirements Document) is your SAAS blueprint. A detailed written plan that outlines EXACTLY what you're going to build.

We FEED the PRD to Replit, which will start to BUILD our software on its own! LIKE MAGIC!

TO MAKE A DECENT PRD YOU NEED:

- SAAS NAME
- CUSTOMER AVATAR
- PROBLEM (your SAAS solves)
- FEATURE SET
- USP
- LOOK AND FEEL (preferred colors, style - you CAN screenshot tools you like and feed them to Replit)

A BASIC PRD PROMPT LOOKS LIKE THIS:

"I need a PRD for my SAAS I'm building in Replit. The SAAS NAME is [NAME], my CUSTOMER AVATAR is [AVATAR], The PROBLEM my SAAS solves is [PROBLEM], my FEATURE set is [FEATURES], my USP is [USP] and I want it to LOOK AND FEEL like [DESCRIPTION]."

But don't worry about filling that in - we'll generate a proper PRD for you in the exercise below using everything you've already defined!`,
      outcome: "A complete PRD pasted into Replit with your first build session started",
      completionMessage: "You have a PRD. A real Product Requirements Document that tells you exactly what to build. Most founders skip this and wonder why they're still coding 6 months later. You're different. Tomorrow: Claude Code setup.",
      xpReward: 100,
      estimatedMinutes: 8,
    },
    {
      day: 8,
      title: "Claude Code + GitHub Setup",
      description: "Connect GitHub for version control, install Claude Code, and create your CLAUDE.md instruction file.",
      phase: "Prepare",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Development Workflow Setup",
      aiTaskDescription: "Set up Claude Code integration with Replit and GitHub for version control and AI-assisted development.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Which feature will you build first?",
      microDecisionOptions: JSON.stringify(["Authentication", "Main core feature", "Database setup", "Landing page"]),
      reflectionQuestion: "What will it feel like when you see your first feature working?",
      tip: "Get into the habit of using the entire app AS you build it. This prevents you breaking something and not knowing about it until later.",
      lesson: `Today we set up the tools. Three things:

1. GITHUB

You know Google Docs? How it saves EVERY version of your document? You can go back to yesterday. Last week. Last month.

GitHub is Google Docs for code.

Every time you save, it keeps a copy. Something breaks? Go back to when it worked. Laptop dies? Code is safe in the cloud.

It's FREE. Takes 2 minutes. EVERY pro developer uses it.

2. CLAUDE CODE

Replit has built-in AI. It's good. But it's EXPENSIVE. We're talking hundreds of dollars a month if you're building regularly.

Claude Code does the SAME thing. Runs right inside Replit. But at a FRACTION of the cost.

This one change will save you THOUSANDS over time.

3. CLAUDE.md

A text file that tells Claude about your project. Claude reads it at the start of every session.

What goes in it? Your app name. What it does. What tech you're using. Some rules. A session log.

It starts simple. It grows over time. When Claude keeps making the same mistake, you add a rule. When you finish a session, you update the log. It gets SMARTER as you use it.

WHY THIS MATTERS:

Without GitHub, one mistake could lose everything. Without Claude Code, you'll burn through money. Without CLAUDE.md, Claude doesn't know your project.

With all three? You have a professional setup that REAL developers use.

Let's get it done.`,
      outcome: "GitHub connected, Claude Code installed, CLAUDE.md created",
      completionMessage: "Your dev environment is SET UP. GitHub for backups, Claude Code for building, CLAUDE.md for context. You have a professional setup. Tomorrow: learning how to get the BEST results from Claude Code.",
      xpReward: 100,
      estimatedMinutes: 15,
    },

    // ============================================
    // PREPARE continued (Day 9)
    // ============================================
    {
      day: 9,
      title: "Master Claude Code",
      description: "Learn how to effectively use Claude Code to build, fix, and iterate on your app. This is your superpower.",
      phase: "Prepare",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Claude Code Mastery",
      aiTaskDescription: "Learn the essential commands, prompts, and workflows that make Claude Code your most powerful building tool.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your biggest challenge with AI coding tools?",
      microDecisionOptions: JSON.stringify(["Not sure what to ask", "Results aren't what I want", "Don't know how to fix errors", "Everything feels overwhelming"]),
      reflectionQuestion: "What feature would you build if you knew Claude Code would get it right first time?",
      tip: "Don't overthink it. Be creative, have fun, but commit often so you can always go back.",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

Now let's learn how to TALK to Claude Code.

Most people get frustrated because they don't know the rules. They ask vague questions and get vague answers. They panic when something breaks. They send huge prompts and wonder why it's a mess.

Today you learn the 8 rules that make everything click:

1. BE SPECIFIC - vague prompts = vague results
2. SAY "REVERSE" - to undo any change instantly
3. REPORT ERRORS/BUGS - copy, paste, explain what you expected
4. BREAK IT DOWN - one task at a time
5. COMMIT FIRST - save your progress before big changes
6. ASK FOR OPTIONS - get advice, then you choose
7. VIBE WITH IT - be creative, but watch scope creep
8. ASK WHY - not seeing what you expect? Ask!

These aren't complicated. But they make ALL the difference.

Let's go through each one.`,
      outcome: "Confident using Claude Code to build, fix, and improve your app with effective prompts",
      completionMessage: "You now know how to TALK to your AI. That's the skill that separates people who build fast from people who get frustrated. Tomorrow: learning the Build-Test-Fix loop that every successful builder uses.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // BUILD (Days 10-18)
    // ============================================
    {
      day: 10,
      title: "The Build Loop",
      description: "Learn the most important workflow in software: Build, Test, Fix, Repeat. This is how real builders ship.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "workflow",
      aiTaskTitle: "The Build Loop",
      aiTaskDescription: "Master the Build-Test-Fix cycle that every successful builder uses daily.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What did you work on in your first loop?",
      microDecisionOptions: JSON.stringify(["Fixed something broken", "Improved how it looks", "Added a missing piece", "Made it clearer to use"]),
      reflectionQuestion: "How did it feel to complete your first Build-Test-Fix loop?",
      tip: "Finding bugs isn't failure - it's PROGRESS. NO software is ever 100% bug-free. Our goal isn't perfection (that takes years and is impossible). We fix everything WE can find and what any BETA testers find, then ship it and fix issues FAST with AI when they crop up. Perfectionism = procrastination.",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

This is THE skill that separates people who ship from people who don't.

BUILD → TEST → FIX → REPEAT

Every successful builder does this loop HUNDREDS of times. Today you'll learn it by doing it.

THE LOOP EXPLAINED:

1. BUILD something (or have AI build it)
2. TEST it immediately - click everything, try to break it
3. FIX what's broken (with Claude Code's help)
4. REPEAT until it works

WHY THIS MATTERS:

Most people build for HOURS without testing. Then they find 47 bugs at once and feel overwhelmed. Smart builders test CONSTANTLY. Find one bug, fix it, move on. Small wins stack up.

THE SECRET TO GOOD BUG REPORTS:

Bad: "The page is broken"
Good: "When I click the Save button on the Settings page, I expect it to save and show a success message, but instead nothing happens. Fix it."

The more specific you are, the faster AI can help you fix it.

TODAY'S MISSION:

Find ONE bug in your app. Describe it clearly. Fix it with Claude Code. That's it. Simple? Yes. But this simple loop is what you'll do every single day of building. Master it now.`,
      outcome: "Found and fixed your first bug using the Build-Test-Fix loop",
      completionMessage: "You just completed your first Build-Test-Fix loop! This is the skill that will carry you through everything. Finding bugs = progress. Tomorrow: defining your brand.",
      xpReward: 100,
      estimatedMinutes: 8,
    },
    {
      day: 11,
      title: "Define Your Brand",
      description: "Choose your colors, fonts, and visual style. This makes your app look professional and consistent.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "creative",
      aiTaskTitle: "Brand Identity",
      aiTaskDescription: "Define your brand colors, typography, and visual style guide.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What vibe should your brand have?",
      microDecisionOptions: JSON.stringify(["Professional & trustworthy", "Fun & friendly", "Bold & energetic", "Minimal & clean"]),
      reflectionQuestion: "Would your target customer feel at home with this brand?",
      tip: "Happy with what you've got? SKIP this day. Design changes can always happen later - features matter more right now.",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

Look at your app right now. How does it FEEL?

If you're happy with Replit's default design - SKIP THIS DAY. Come back later. Features matter more than aesthetics at this stage.

But if it looks generic...

TODAY: TRANSFORM YOUR APP'S ENTIRE LOOK WITH ONE PROMPT.

TWO OPTIONS:

OPTION 1: Pick a famous design style that everyone knows:
- SPOTIFY: Dark & energetic
- NETFLIX: Cinematic & bold
- AIRBNB: Warm & inviting
- DUOLINGO: Fun & playful
- APPLE: Premium & elegant
- UBER: Clean & minimal
- SLACK: Professional & friendly
- CALM: Soft & peaceful

OPTION 2: Paste a URL of ANY website you love. We'll analyze its design and generate a prompt to recreate something similar. This is approximate inspiration, not an exact copy.

Either way, you pick your accent color, and you get ONE prompt that transforms EVERYTHING - spacing, shadows, animations, the whole vibe.

HEADS UP: Design changes need iteration. You'll say "softer shadows" or "more padding" or "that's too dark". This is normal. Designers iterate dozens of times.

Remember: You're not stuck with anything. "Reverse that" brings it all back.`,
      outcome: "A defined color palette and typography applied to your app",
      completionMessage: "Your app now has a consistent look and feel! This is what separates amateur projects from professional products. Tomorrow: adding the AI brain.",
      xpReward: 100,
      estimatedMinutes: 8,
    },

    {
      day: 12,
      title: "Add The AI Brain",
      description: "Integrate OpenAI API to make your app intelligent. This is what makes AI SaaS special.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "AI Integration",
      aiTaskDescription: "Connect OpenAI API to your app and create your first AI-powered feature.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What should AI do in your app?",
      microDecisionOptions: JSON.stringify(["Generate content", "Analyze/summarize data", "Answer questions", "Automate tasks"]),
      reflectionQuestion: "What manual task could AI do for your users that would make them say 'THIS IS AMAZING'?",
      tip: "Worried about AI costs? Here's the reality: most SaaS subscribers barely use the features they pay for. Whatever your worst-case cost estimate is, actual usage will be way lower.",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

Today your app gets a BRAIN.

This is what makes AI SaaS different from regular SaaS. Your app doesn't just store data or display things - it THINKS. And here's the thing: Users EXPECT this now. An app without AI feels like a website from 2010.

AI lets your app do things that used to be really hard to build. Now it's easy:

- Summarize long documents in seconds
- Generate personalized content on demand
- Answer questions about complex data
- Analyze text and pull out key insights
- Turn messy input into structured data
- Categorize and tag things automatically
- Write first drafts (emails, descriptions, posts)
- Translate content to any language
- Suggest next steps based on context
- Score or evaluate submissions
- Create personalized plans or recommendations
- Detect patterns humans would miss
- Generate reports automatically
- Smart search that understands meaning, not just keywords

THE SIMPLE VERSION:

1. Get an OpenAI API key (platform.openai.com)
2. Store it in Replit Secrets (never in your code!)
3. Tell Claude Code to add an AI feature

That's it. The AI handles the rest.

THE PROMPT:

Just describe what you want naturally. For example: "When the user submits a journal entry, use AI to suggest 3 action items based on what they wrote."

WHAT SHOULD YOUR AI DO?

Ask yourself: What manual task could the AI do that would make users say "THIS IS AMAZING"? Generate something for them? Analyze something for them? Summarize something for them? Suggest something for them?

Pick ONE thing. Get it working PERFECTLY. You can add more later.

THE COST REALITY:

AI API costs are tiny. Different models have different prices, but we're talking fractions of a penny per request. You could run thousands of AI calls and barely notice it on your bill. Don't overthink costs - just build.

OTHER OPTIONS:

There are other AI APIs out there - Claude's API, Google's Gemini, and more. They're all solid. But OpenAI is a great starting point: it's general purpose, well-documented, and most tutorials use it. Once you're comfortable, you can explore alternatives. For now, just pick one and BUILD.`,
      outcome: "AI API integrated, first AI-powered feature working in your app",
      completionMessage: "Your app can THINK now. That's the core of AI SaaS - intelligence built in. Tomorrow: connecting other APIs you might need.",
      xpReward: 100,
      estimatedMinutes: 15,
    },
    {
      day: 13,
      title: "Email & APIs",
      description: "Set up Resend for email and learn how external APIs give your app superpowers.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "API Connections",
      aiTaskDescription: "Identify and connect the external APIs your app needs to deliver real value.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What superpower does your app need?",
      microDecisionOptions: JSON.stringify(["Payments (Stripe)", "Data/Scraping", "Third-party integration", "None needed yet"]),
      reflectionQuestion: "What can your app do now that it couldn't do before?",
      tip: "Before adding ANY external API, ask Replit Agent first... 'Can you do [thing] without an external service?' Often Replit can handle it natively. Also... Replit sometimes offers easy one-click API integrations, but they're not always the most cost-effective option. Yes, use them to build your app, but be willing to swap them out when you start getting customers.",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

External APIs let your app do things you couldn't easily build yourself. Here are the popular ones...

POPULAR APIs:

- Charging money... Stripe, Paddle, LemonSqueezy
- Sending SMS or calls... Twilio, MessageBird
- Sending emails at scale... Resend, SendGrid, Postmark
- File and image uploads... Cloudflare R2, Cloudinary
- Location and maps... Google Maps
- Web scraping... Bright Data, ScrapingBee
- Connect to other apps... Zapier

DO YOU ACTUALLY NEED ONE?

Maybe not! Many successful apps are just...
- A database (Replit has it)
- User accounts (Replit has it)
- AI features (you added yesterday)
- Good UX (that's on you)

If your app works without external APIs, skip this day. Don't add stuff you don't need.

THE RULE:

Add ONE at a time. Get it working. Test it. Then consider the next one. Every external dependency is something that can break, could cost you unnecessarily, and adds extra setup and complexity.`,
      outcome: "External APIs connected (if needed), or confirmed app works without them",
      completionMessage: "Your app now has superpowers - or you've confirmed it doesn't need them. Both are wins. Tomorrow: making sure users can log in.",
      xpReward: 100,
      estimatedMinutes: 12,
    },
    {
      day: 14,
      title: "Users & Admin",
      description: "Add user authentication AND build your admin dashboard. Know who's using your app and what they're doing.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "User Authentication",
      aiTaskDescription: "Verify or add user authentication so each user has their own account and data.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Does your app have user authentication?",
      microDecisionOptions: JSON.stringify(["Yes, it works", "No, need to add it", "Not sure", "Don't need it"]),
      reflectionQuestion: "Can users sign up and see only their own data?",
      tip: "Replit probably already added auth when you first built your app. Check before adding it again. Ask Replit: 'Does my app have user authentication?'",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

Today you're doing TWO things: authentication (letting people sign up and log in) and admin dashboard (so you can see what's happening).

PART 1: AUTHENTICATION

Authentication = "Who are you?" It's how your app knows which user is which.

GOOD NEWS - Replit probably already has it. When you built your app, Replit Agent likely added authentication automatically. Before doing ANYTHING, check:

Ask Replit Agent: "Does my app have user authentication? Can users sign up, log in, and see only their own data?"

If YES - skip to Part 2. Don't overcomplicate this.

If NO - add it with ONE prompt:

"Add user authentication. I need: Login/signup button in the header, show the user's name when logged in, logout button, each user should only see their own data."

ONE THING TO KNOW:

Replit's auth might show Replit branding on the login screen. For now, stick with it - it's easy and it WORKS. Don't complicate things.

BUT if it becomes a problem later (like you want fully custom branding), you can switch to Supabase, Firebase, or other auth providers. It's a bit fiddly but doable. Cross that bridge IF you get there.

PART 2: ADMIN DASHBOARD

Now you have users. But how many? Are they coming back? Are they actually USING the thing?

Don't guess. KNOW.

Here's the thing - AI makes it EASY to build a proper dashboard. Not a toy with 4 numbers. A REAL dashboard like the big companies have. User growth charts. Retention metrics. Conversion funnels. Activity feeds. The works.

So that's what we're doing. Answer a few questions about YOUR app, and we'll generate a prompt that builds you something incredible. Revenue tracking, power user lists, feature popularity, geographic breakdown - pick what matters to YOU.

Why settle for "simple" when comprehensive takes the same amount of effort?

WHY THIS MATTERS:

Without data, you're flying blind. With data, you KNOW what to fix:
- "50 signups but 5 came back" = onboarding problem
- "Signing up but not using feature" = feature problem
- "Usage growing every week" = keep doing what you're doing

Data tells you what to fix. Check your dashboard every day.`,
      outcome: "Users can log in AND you have an admin dashboard showing key metrics",
      completionMessage: "Users can log in and you can SEE what's happening in your app. Data beats guessing. Tomorrow - taking payments with Stripe.",
      xpReward: 100,
      estimatedMinutes: 15,
    },
    {
      day: 15,
      title: "Take Payments",
      description: "Add Stripe payments so your app can actually make money.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Payments Setup",
      aiTaskDescription: "Connect Stripe for payments and build your first checkout flow.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What will you charge for?",
      microDecisionOptions: JSON.stringify(["Monthly subscription", "One-time purchase", "Credits/tokens", "Premium features"]),
      reflectionQuestion: "What's the first thing you want to charge money for in your app?",
      tip: "Use TEST MODE while building. Stripe's test card is 4242 4242 4242 4242. You can switch to live mode when you're ready to launch.",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

Today you're adding the ability to take payments. The exercise below walks you through setting up Stripe step by step.

Before you start, decide on a pricing model:

SUBSCRIPTION - They pay monthly/yearly. Examples: $19/month, $29/month, $99/year.

ONE-TIME - They pay once, use forever. Examples: $49, $99, $199.

USAGE-BASED - They pay for what they use. Examples: $10 for 100 credits.

FREEMIUM - Free tier with limits, paid tier unlocks more.

HOW TO PRICE IT

Pricing is subjective. Here's what I recommend - I call it "friction-based pricing":

Start LOWER than competitors - maybe half of what they charge. Then increase your price over time until you hit friction (people stop buying). When that happens, pull it back to where it was selling well. This eliminates the guessing game of "is it the price or my funnel that's the problem?" If people are buying at $29, try $39. Still buying? Try $49. When sales drop, go back to $39.

Your goal is NOT to be the cheapest. Ideally you want to be the MOST expensive eventually - that signals value. But you earn that position over time.

The magic trick: grandfather your early users at the lower price. They stay on the cheap plan forever while new users pay more. This makes your early adopters feel special and VERY sticky - they'll never leave because they know they're getting a deal nobody else can get.

Quick math: A $29/month app with 100 paying users = $2,900/month. You don't need millions of users.`,
      outcome: "Stripe connected, checkout flow working in test mode",
      completionMessage: "Payment infrastructure done. Your app can now accept payments when you're ready to go live. Tomorrow: mobile optimization.",
      xpReward: 100,
      estimatedMinutes: 15,
    },
    {
      day: 16,
      title: "Mobile & Speed",
      description: "Make your app fast and mobile-friendly. Slow loading and broken mobile layouts kill apps.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Mobile & Performance",
      aiTaskDescription: "Test and fix your app's mobile experience and loading speed.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How does your app perform on mobile right now?",
      microDecisionOptions: JSON.stringify(["Fast and looks great", "Works but a bit slow", "Some things are broken", "Haven't tested yet"]),
      reflectionQuestion: "Can users complete the main task on their phone without frustration or waiting?",
      tip: "Test on a REAL phone with mobile data (not wifi). That's what your users will experience. If you're frustrated waiting, they will be too.",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

Today we fix TWO things that kill apps: broken mobile and slow loading.

BRUTAL TRUTH #1: More than HALF your users will access your app on their PHONE. Not their laptop. Their PHONE. If it's broken on mobile? They're GONE.

BRUTAL TRUTH #2: 53% of mobile users abandon pages that take longer than 3 seconds to load. THREE SECONDS. Every extra second = lost customers.

MOBILE TESTING - Start in Replit's preview (use the screen size toggle in top right), then test on your REAL phone. Browser simulators miss things real devices catch.

What to check:
- Does text read without zooming?
- Can you tap buttons with your thumb?
- Does the main feature actually work?
- Any weird horizontal scrolling?

SPEED TESTING - Open your app on your phone using mobile data (not wifi). Count the seconds. If you're waiting and getting frustrated, your users will be too.

What to check:
- Does first page load in under 3 seconds?
- Do you see something useful immediately (not blank screen)?
- Are there loading spinners when fetching data?
- Does clicking around feel instant?

THE FIX: Open Claude Code and say "Optimize my app for mobile and speed. Fix any responsive issues at 375px width, add code splitting and lazy loading, compress images, and add loading states where data is fetched."

Don't overthink it. The question is simple: Can someone use this on their phone without frustration? Yes or no.`,
      outcome: "App is mobile-responsive and loads quickly",
      completionMessage: "Your app is fast and mobile-friendly. That's a competitive advantage most indie devs ignore. Tomorrow: autonomous testing.",
      xpReward: 100,
      estimatedMinutes: 8,
    },

    {
      day: 17,
      title: "Test & Ship",
      description: "Make sure the important stuff works. Then ship it - real users will find the rest.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "session",
      aiTaskTitle: "Core Feature Testing",
      aiTaskDescription: "Test your main features before shipping.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Have you tested your core features?",
      microDecisionOptions: JSON.stringify(["Yes, main stuff works", "Tested a bit", "Just a quick look", "Haven't tested yet"]),
      reflectionQuestion: "Does your main feature work well enough for beta testers?",
      tip: "You WILL ship with bugs. Every app does. The goal isn't perfection - it's making sure the core stuff works. Real users will find the edge cases you'd never think of. With AI you can fix bugs FAST, so don't worry.",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

Here's the truth about building a SaaS business - you WILL ship with bugs. You can't find them all yourself. The only way to truly find every edge case is with REAL USERS using your app in ways you'd never think of.

That's not a failure. That's how software works.

YOUR TESTING OPTIONS:

1. MANUAL - Click through the main flows yourself
2. REPLIT AUTONOMOUS TESTING AGENT - "Test my app's main features and report any bugs"
3. CLAUDE FOR CHROME - Can see your screen and spot issues
4. BETA TESTERS - Ask friends or early supporters to try your app

THE MINDSET SHIFT:

Stop trying to find every bug. Start trying to find BLOCKING bugs - things that would stop a user from completing the main task. Fix those. Ship the rest.

THE TRUTH ABOUT BUGS:

There's no such thing as 100% bug-free software. Google ships bugs. Apple ships bugs. Microsoft ships bugs. Every. Single. Day. The difference? They fix them fast.

That's your job too. Ship it, then be ready to fix what users find. Speed of fixing matters more than perfection at launch. And unless you have an audience or current customer base then it's unlikely it'll affect many users as building a SaaS business doesn't happen overnight.

PUBLISHING YOUR APP:

Once you've tested the important stuff, it's time to publish. Replit makes this dead simple.

1. Click the "Deploy" button in Replit (top right)
2. Choose a deployment option - Replit will guide you through what fits your app
3. Follow the prompts to set up billing if needed
4. Your app gets a public URL like yourapp.replit.app

That's it. Your app is now live on the internet. Real people can use it.

CONNECT YOUR CUSTOM DOMAIN:

Now connect the domain you registered earlier so your app lives at yourbrand.com instead of yourapp.replit.app.

1. In Replit deployment settings, go to Custom Domains
2. Add your domain name
3. Replit will show you DNS records to add
4. Go to your domain registrar (Namecheap, GoDaddy, etc.) and add those records
5. Wait a few minutes for it to connect

IF YOU USED NAMECHEAP:
Go to Domain List → Manage → Advanced DNS. Add the records Replit gave you. Usually a CNAME record pointing to your Replit URL. Can take up to 48 hours but usually works in minutes.

NEED HELP? Ask Claude Code - "Help me connect my domain [yourdomain.com] from [registrar] to my Replit deployment step by step."`,
      outcome: "App tested, published, and live on the internet",
      completionMessage: "Your app is LIVE. Real people can use it. Tomorrow you'll keep building until it's MVP-ready - take as long as you need.",
      xpReward: 100,
      estimatedMinutes: 20,
    },
    {
      day: 18,
      title: "Build Your MVP",
      description: "THE PAUSE POINT. Build your Minimum Viable Product. Stay here as long as you need - days or weeks - until your MVP is ready.",
      phase: "Build",
      videoUrl: null,
      aiTaskType: "session",
      aiTaskTitle: "Build Your MVP",
      aiTaskDescription: "This is THE pause point. Build your MVP - the simplest version that delivers real value.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What are you focusing on today?",
      microDecisionOptions: JSON.stringify(["Core features", "Bug fixes", "UI polish", "New functionality"]),
      reflectionQuestion: "Does your app solve the ONE core problem you set out to solve?",
      tip: "THIS IS THE PAUSE POINT. Your MVP isn't about having every feature - it's about having ONE thing that works brilliantly. Stay here until that's true. Typically this looks like your competitor's core feature set PLUS your USP feature - then you're ready to go!",
      lesson: `***FIRST: Open the [Claude Code Guide](/claude-code). Use those prompts to start your session.***

STOP. READ THIS CAREFULLY.

This is THE PAUSE POINT - and it's time to talk about your MVP.

WHAT IS AN MVP?

MVP stands for Minimum Viable Product. But most people get this WRONG.

An MVP is NOT:
- A broken app with missing features
- A prototype that "kind of works"
- An excuse to ship garbage
- Half-built functionality

An MVP IS:
- The SMALLEST version of your product that delivers REAL VALUE
- Your competitors' core features - the baseline you need to compete
- PLUS your USP - the thing that makes you DIFFERENT
- Something people would actually PAY for
- Proof that your idea works

THE MVP CHECKLIST:

Your MVP must have:

1. COMPETITOR CORE FEATURES
   - What do your competitors ALL have in common? You need those too.
   - These are the basics your customers EXPECT. No excuses.
   - Study 3-5 competitors. List their core features. Build those.

2. YOUR USP FEATURE
   - This is what makes you DIFFERENT from competitors.
   - The unique angle, the special sauce, your differentiator.
   - Without this, you're just a clone. WITH this, you have a business.

2. USER ACCOUNTS
   - People can sign up and log in
   - Their data is saved and private

3. BASIC RELIABILITY
   - Doesn't crash
   - Handles errors gracefully
   - Works on mobile

4. PROFESSIONAL APPEARANCE
   - Doesn't look like a school project
   - Consistent styling
   - Clear navigation

WHAT YOUR MVP DOES NOT NEED:

- Every feature you dreamed of
- Perfect design
- Advanced analytics
- Multiple integrations
- Social sharing
- Dark mode
- 47 settings options

The word "minimum" is there for a reason. RESIST the urge to add more.

THE RULE: Stay on Day 18 until your MVP is READY.

Some people spend one day here. Some spend two weeks. Some spend a month. ALL OF THAT IS FINE.

Use the PAUSE button. Come back tomorrow and keep building. And the next day. And the next.

WHAT TO DO EACH SESSION:

1. Ask: "Do I have my competitors' core features built?"
2. If NO - build them
3. Ask: "Is my USP feature working?"
4. If NO - build it
5. Ask: "What's the ONE thing blocking launch?"
6. Fix that ONE thing
7. Repeat

THE MVP MINDSET:

Your first users don't need perfection. They need a SOLUTION.

If your app solves their problem - even with rough edges - they'll use it. They'll give you feedback. They'll help you build version 2.

But if you never ship? You get nothing.

WHEN TO MOVE ON:

Your MVP is ready when a stranger could sign up, use it without help, and you wouldn't be embarrassed to show them.

YOU'RE SO CLOSE.

Think about it - a few more hours of focused work and you could have something REAL. Something you can SELL. Something that could help hundreds, maybe THOUSANDS of people solve a problem they're struggling with right now.

Most people never get this far. They talk about building something "someday." But you? You're HERE. You're DOING IT.

Now go build. Come back when it's ready.`,
      outcome: "MVP is built and submitted to the Showcase with screenshot",
      completionMessage: "You've built a working product AND shared it with the world. That takes guts. MVP Builder badge earned! Tomorrow: creating a sales page that converts visitors into customers.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 19,
      title: "Build Your Sales Page",
      description: "Create a high-converting sales page for your product using proven structures and power prompts.",
      phase: "Launch",
      videoUrl: null,
      aiTaskType: "build",
      aiTaskTitle: "Sales Page",
      aiTaskDescription: "Build a sales page that turns visitors into customers.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's most important for your sales page?",
      microDecisionOptions: JSON.stringify(["Clear value proposition", "Easy to understand", "Removes objections", "Makes signing up easy"]),
      reflectionQuestion: "How will it feel when your sales page starts converting visitors into customers?",
      tip: "The headline is the most important part. If they don't read the headline, they won't read anything else. Test multiple options.",
      lesson: `Time to SELL what you've built.


WHY SAAS IS EASIER TO SELL

Selling SaaS is a LOT easier than selling most things.

Why? You're offering a FREE TRIAL. Zero risk. They try before they buy.

You're not saying "give me your money" - you're saying "try this for free." Much easier. Much lower resistance. The product sells itself if it's good.


BUILD IT ONCE, SELLS 24/7

Here's the best part - you create this sales process ONCE.

One sales page. One signup flow. One free trial system.

Then it works around the clock. Giving away free trials while you sleep. No sales calls. No chasing leads. Just people finding your page, trying your product, and paying if they love it.


YOU'RE NOT "SELLING"

Don't psych yourself out about "selling."

You're just inviting people to try something that might help them. If it does, they'll pay. If it doesn't, no harm done.

That's it. That's the whole game.


WHAT WE'RE BUILDING TODAY

A complete sales page using a proven 10-section structure. You'll use AI to generate the copy, then build it with Claude Code.

The interactive section below walks you through the exact structure and gives you the prompts to generate everything.`,
      outcome: "Built a complete sales page with headline, copy, and pricing",
      completionMessage: "Your sales page is LIVE. You have a headline, problem/solution copy, features, pricing, and CTAs. Tomorrow: where to send traffic.",
      xpReward: 100,
      estimatedMinutes: 30,
    },

    // ============================================
    // LAUNCH (Days 19-21)
    // ============================================
    {
      day: 20,
      title: "Get Found by Google & AI",
      description: "Get found by Google AND AI assistants like ChatGPT and Perplexity.",
      phase: "Launch",
      videoUrl: null,
      aiTaskType: "build",
      aiTaskTitle: "SEO Setup",
      aiTaskDescription: "Add meta tags, Open Graph, favicon, and submit to search engines.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How important is organic search traffic for your app?",
      microDecisionOptions: JSON.stringify(["Very important", "Somewhat important", "Not sure yet", "I'll focus on other channels"]),
      reflectionQuestion: "What would it mean if people started finding your app through Google?",
      tip: "SEO takes time, but it compounds. And more people are asking AI for recommendations now - being mentioned across the web helps with both.",
      lesson: `Right now, if someone Googles what your app does... they won't find you.

People search Google 8.5 BILLION times per day. If even a tiny fraction of those searches are for what your app does, that's free traffic. Every day. Forever.

Unlike paid ads (which stop the moment you stop paying), SEO compounds. A page you optimize today can bring visitors for YEARS.

HERE'S THE CATCH - Google doesn't trust brand new sites. It can take weeks or even MONTHS before they start sending you real traffic. The sooner you set this up, the sooner that clock starts ticking.

Oh, and more people are using AI assistants (ChatGPT, Perplexity, etc.) to discover new products. Being mentioned across the web helps you get recommended there too.

Let's get you found.`,
      outcome: "Keywords chosen, pages optimized, site submitted to Google",
      completionMessage: "You're now discoverable! Tomorrow: the final day - your $100K roadmap.",
      xpReward: 100,
      estimatedMinutes: 20,
    },
    {
      day: 21,
      title: "Your $100K Roadmap",
      description: "See what your app could earn - and discover the strategies to get there.",
      phase: "Launch",
      videoUrl: null,
      aiTaskType: "calculator",
      aiTaskTitle: "Income Calculator",
      aiTaskDescription: "Calculate your potential earnings and discover growth strategies.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your next step after this challenge?",
      microDecisionOptions: JSON.stringify(["Figure it out myself", "Get expert guidance", "Take a break first", "Not sure yet"]),
      reflectionQuestion: "What would your life look like with your target number of paying customers?",
      tip: "You only need ONE or TWO growth strategies that work. Most successful founders focus on 1-2 channels and go ALL IN. I can help you build AI systems that take care of most of this for you, growing your SaaS business on autopilot.",
      lesson: `You just did something 99% of people NEVER do.

You went from "I have an idea" to "I have a WORKING PRODUCT" in just a few weeks. That puts you in RARE company.

This challenge taught you to BUILD. Now let's talk about how to SELL.`,
      outcome: "Challenge complete! Growth strategies revealed and income potential calculated.",
      completionMessage: "CONGRATULATIONS! You completed the 21-Day AI SaaS Challenge. From idea to product to growth strategies. Now go build that business.",
      xpReward: 200,
      estimatedMinutes: 15,
    },
  ];

  for (const day of dayContentData) {
    await db.insert(dayContent).values(day).onConflictDoUpdate({
      target: dayContent.day,
      set: {
        title: day.title,
        description: day.description,
        phase: day.phase,
        videoUrl: day.videoUrl,
        aiTaskType: day.aiTaskType,
        aiTaskTitle: day.aiTaskTitle,
        aiTaskDescription: day.aiTaskDescription,
        suggestions: day.suggestions,
        template: day.template,
        microDecisionQuestion: day.microDecisionQuestion,
        microDecisionOptions: day.microDecisionOptions,
        reflectionQuestion: day.reflectionQuestion,
        tip: day.tip,
        lesson: day.lesson,
        outcome: day.outcome,
        completionMessage: day.completionMessage,
        xpReward: day.xpReward,
        estimatedMinutes: day.estimatedMinutes,
      },
    });
  }

  // Seed email templates
  console.log("Creating email templates...");
  const emailTemplateData = [
    {
      templateKey: "purchase_confirmation",
      name: "Purchase Confirmation",
      subject: "You're in! Welcome to the 21-Day AI SaaS Challenge",
      body: `You're In, {{firstName}}!

Welcome to the 21-Day AI SaaS Challenge. Your journey from idea to launch-ready product starts now.

ORDER CONFIRMED
---------------
21-Day AI SaaS Challenge
Total: {{currencySymbol}}{{total}}

WHAT'S NEXT
-----------
1. Start Day 0 today - it only takes 5 minutes
2. Complete one day at a time - go at your own pace
3. In 21 days, you'll have a working product

Start now: https://challenge.mattwebley.com/dashboard

Questions? Just reply to this email.

- Matt

--
21-Day AI SaaS Challenge
You're receiving this because you purchased the challenge.`,
      description: "Sent to customer after purchasing the main challenge",
      variables: "firstName, currencySymbol, total",
    },
    {
      templateKey: "coaching_confirmation",
      name: "Coaching Confirmation",
      subject: "Coaching Sessions Confirmed - Let's Build Together!",
      body: `Coaching Confirmed!

Hey {{firstName}}, great decision! You've just unlocked coaching sessions to supercharge your SaaS build.

YOUR COACHING PACKAGE
---------------------
{{coachingType}}

- Direct 1:1 video calls
- Screen share building together
- Unblock any issue immediately
- Flexible scheduling

Total: {{currencySymbol}}{{amount}}

HOW TO BOOK YOUR SESSIONS
-------------------------
I'll be in touch within 24 hours with a link to book your first session. Keep an eye on your inbox!

Questions? Just reply to this email.

- Matt

--
21-Day AI SaaS Challenge
You're receiving this because you purchased coaching.`,
      description: "Sent to customer after purchasing coaching",
      variables: "firstName, currencySymbol, amount, coachingType",
    },
    {
      templateKey: "coaching_purchase_notification",
      name: "Coaching Purchase Notification (Admin)",
      subject: "New Coaching Purchase: {{coachingType}} - {{currencySymbol}}{{amount}}",
      body: `New Coaching Purchase!

FROM
----
Name: {{userName}}
Email: {{userEmail}}

ORDER DETAILS
-------------
Package: {{coachingType}}
Amount: {{currencySymbol}}{{amount}}
Currency: {{currency}}

ACTION REQUIRED
---------------
Send booking link to customer within 24 hours.

--
View all users: https://challenge.mattwebley.com/admin`,
      description: "Sent to admin when someone purchases coaching",
      variables: "userName, userEmail, coachingType, currencySymbol, amount, currency",
    },
    {
      templateKey: "testimonial_notification",
      name: "Testimonial Notification (Admin)",
      subject: "New Challenge Testimonial from {{userName}}",
      body: `New Testimonial!

FROM
----
Name: {{userName}}
Email: {{userEmail}}

WRITTEN TESTIMONIAL
-------------------
{{testimonial}}

VIDEO TESTIMONIAL
-----------------
{{videoUrl}}

THEIR APP
---------
Name: {{appName}}
URL: {{appUrl}}

--
View all testimonials: https://challenge.mattwebley.com/admin`,
      description: "Sent to admin when someone submits a testimonial",
      variables: "userName, userEmail, testimonial, videoUrl, appName, appUrl",
    },
    {
      templateKey: "critique_notification",
      name: "Critique Request Notification (Admin)",
      subject: "New Critique Request from {{userName}}",
      body: `New Critique Request!

FROM
----
Name: {{userName}}
Send Video To: {{preferredEmail}}
Backup Email: {{userEmail}}

SALES PAGE URL
--------------
{{salesPageUrl}}

PRODUCT DESCRIPTION
-------------------
{{productDescription}}

TARGET AUDIENCE
---------------
{{targetAudience}}

SPECIFIC QUESTIONS
------------------
{{specificQuestions}}

--
Submitted: {{timestamp}}
View all requests: https://challenge.mattwebley.com/admin`,
      description: "Sent to admin when someone requests a sales page critique",
      variables: "userName, userEmail, preferredEmail, salesPageUrl, productDescription, targetAudience, specificQuestions, timestamp",
    },
    {
      templateKey: "critique_completed",
      name: "Critique Completed",
      subject: "Your Sales Page Video Critique is Ready!",
      body: `Hey {{firstName}}!

Your sales page video critique is ready. I've recorded a detailed walkthrough with specific suggestions to improve your conversions.

WATCH YOUR CRITIQUE
-------------------
{{videoUrl}}

In this video, I cover:
- First impressions and headline analysis
- Structure and flow improvements
- Specific copy suggestions
- Call-to-action optimization
- Quick wins you can implement today

After watching, if you have questions or want to discuss any of the suggestions, just reply to this email.

Looking forward to seeing your improved sales page!

- Matt

--
21-Day AI SaaS Challenge`,
      description: "Sent to customer when their sales page critique video is ready",
      variables: "firstName, videoUrl",
    },
    {
      templateKey: "question_notification",
      name: "Question Notification (Admin)",
      subject: "New Question on Day {{day}}: {{dayTitle}}",
      body: `New Question on Day {{day}}!

FROM
----
Name: {{userName}}
Email: {{userEmail}}

DAY {{day}}: {{dayTitle}}

QUESTION
--------
{{question}}

ANSWER NOW
----------
{{answerUrl}}

Click the link above to view the question and submit your answer.

--
View all pending questions: https://challenge.mattwebley.com/admin`,
      description: "Sent to admin when someone asks a question",
      variables: "userName, userEmail, day, dayTitle, question, answerUrl",
    },
    {
      templateKey: "discussion_notification",
      name: "Discussion Notification (Admin)",
      subject: "New Comment on Day {{day}}: {{dayTitle}}",
      body: `New Discussion Post on Day {{day}}!

FROM
----
Name: {{userName}}
Email: {{userEmail}}

DAY {{day}}: {{dayTitle}}

MESSAGE
-------
{{content}}

--
View all comments: https://challenge.mattwebley.com/admin`,
      description: "Sent to admin when someone posts a discussion comment",
      variables: "userName, userEmail, day, dayTitle, content",
    },
    {
      templateKey: "referral_notification",
      name: "Referral Notification (Admin)",
      subject: "New Referral: {{referrerName}} referred {{newUserName}}",
      body: `New Referral!

REFERRER
--------
Name: {{referrerName}}
Email: {{referrerEmail}}
Total Referrals: {{referralCount}}

NEW USER (REFERRED)
-------------------
Name: {{newUserName}}
Email: {{newUserEmail}}

--
View all users: https://challenge.mattwebley.com/admin`,
      description: "Sent to admin when someone refers a new user",
      variables: "referrerName, referrerEmail, newUserName, newUserEmail, referralCount",
    },
  ];

  for (const template of emailTemplateData) {
    await db.insert(emailTemplates).values(template).onConflictDoUpdate({
      target: emailTemplates.templateKey,
      set: {
        name: template.name,
        subject: template.subject,
        body: template.body,
        description: template.description,
        variables: template.variables,
        updatedAt: new Date(),
      },
    });
  }

  console.log("✅ Seeding complete!");
}
