import { db } from "./db";
import { dayContent, badges } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed badges - aligned with timeline milestones
  // Start (Day 0) → Idea (Day 1) → Plan (Day 4) → Build (Day 8) → Polish (Day 14) → Launch (Day 21)
  console.log("Creating badges...");
  const badgeData = [
    // Phase completion badges
    {
      name: "Ideator",
      description: "Completed Idea phase: Found your $100K+ idea",
      icon: "💡",
      triggerType: "day_completed",
      triggerValue: 2,
    },
    {
      name: "Strategist",
      description: "Completed Plan phase: Features, naming & tech stack done",
      icon: "🗺️",
      triggerType: "day_completed",
      triggerValue: 4,
    },
    {
      name: "Ready to Build",
      description: "Completed Prepare phase: PRD done, first build complete",
      icon: "🎯",
      triggerType: "day_completed",
      triggerValue: 8,
    },
    {
      name: "Builder",
      description: "Completed Build phase: Core features working",
      icon: "🏗️",
      triggerType: "day_completed",
      triggerValue: 14,
    },
    {
      name: "Polisher",
      description: "Completed Polish phase: Auth, email & admin done",
      icon: "✨",
      triggerType: "day_completed",
      triggerValue: 18,
    },
    {
      name: "The Launcher",
      description: "LAUNCHED! You completed the 21 Day Challenge!",
      icon: "🚀",
      triggerType: "day_completed",
      triggerValue: 21,
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
      name: "Elite",
      description: "21-day streak - Perfect run through the challenge!",
      icon: "💎",
      triggerType: "streak",
      triggerValue: 21,
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
      description: "Welcome to the 21 Day AI SaaS Challenge! Get motivated, learn the rules for success, and commit to your journey.",
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
      lesson: `Welcome to the 21 Day AI SaaS Challenge!

In the next 21 days, you're going to go from idea to launch-ready product. No fluff. No theory. Just focused action every single day.

This isn't a course you watch. It's a challenge you DO.

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
    // IDEA & PLANNING (Days 1-7)
    // ============================================
    {
      day: 1,
      title: "Choosing Your $100K+ Idea",
      description: "Use AI to generate personalized SaaS ideas based on your knowledge, skills, and interests - then shortlist the best ones.",
      phase: "Idea & Planning",
      videoUrl: null,
      aiTaskType: "suggestion",
      aiTaskTitle: "AI Idea Generator",
      aiTaskDescription: "Tell us about yourself and AI will generate 28 personalized SaaS ideas scored against proven criteria.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Which area excites you most?",
      microDecisionOptions: JSON.stringify(["B2B SaaS", "B2C Apps", "Developer Tools", "Productivity"]),
      reflectionQuestion: "What problem do you want to solve and why does it matter to you?",
      tip: "The BEST first projects come from what you ALREADY KNOW. If you've been in any business where people make REAL MONEY - you've got a MASSIVE head start! Getting someone to buy something that helps them MAKE MORE MONEY is an EASY sell.",
      lesson: `Here's the BRUTAL truth: The BEST first projects come from what you ALREADY KNOW.

If you've been in KDP, print on demand, Amazon FBA, online courses, or ANY business where people are making REAL MONEY - you've got a MASSIVE head start!

Why? Because getting someone to buy a "cute goldfish app" is HARD. Getting them to buy something that helps them MAKE MORE MONEY? That's an EASY sell! These people see tools as ESSENTIAL INVESTMENTS, not "nice to haves."

THE 4-POINT FILTER:

1. PAIN INTENSITY - Is this a HATED, FREQUENT, DIFFICULT, SLOW or COSTLY task?
2. CASH PROXIMITY - Does it help them EARN or SAVE money (or time)?
3. SPEED TO MVP - Can you ship a working version in 14 days or LESS?
4. PERSONAL ADVANTAGE - Do YOU have any KNOWLEDGE? ACCESS? INSIGHT? AUDIENCE?

Score each 1-5. If it doesn't hit 16+ out of 20, it's DEAD in the water.

Think NICHE - DO NOT THINK BROAD! The NICHER the BETTER usually...`,
      outcome: "A shortlist of 3-5 SaaS ideas scored against proven criteria, ready for validation",
      completionMessage: "Most people never get past 'someday I'll start.' You just generated 28 ideas and picked your favorites. You're already ahead of 90% of people who talk about building a business. Tomorrow, we find out which one people will actually PAY for.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 2,
      title: "Will People Pay For This?",
      description: "Validate your idea by identifying real pain points, checking competitors, and creating your 'I help X with Y problem' statement.",
      phase: "Idea & Planning",
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

Just straight up ASK ChatGPT or Claude if your idea is likely a VIABLE idea. Will this make money or not? And WHY? Tell it to BE HONEST and NOT sugar coat it.

STEP 2: Look for competitors SELLING something similar

If there are other products on the market already with similar FEATURES that solve the SAME problems, then chances are you can make something BETTER, FASTER, CHEAPER and take some of their market share.

STEP 3: ASK your target market

If you can TALK to people that have the PROBLEM that your SAAS is looking to solve and simply see if they LIKE the idea - you learn lots this way.

BONUS: TRUST YOUR GUT.

It NEVER lets me down!

The "I Help" Statement:

By end of today, you should be able to say: "I help [SPECIFIC PERSON] solve [PAINFUL PROBLEM] so they can [DESIRED OUTCOME]."`,
      outcome: "One validated SaaS idea with 1-3 specific, painful problems it solves - and your 'I help X with Y' statement",
      completionMessage: "The hardest decision is behind you. You picked ONE idea and identified the exact pains it solves. That's what separates builders from dreamers. Now we turn these pain points into features.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 3,
      title: "Core Features & Your USP",
      description: "Clone competitor's essential features AND identify 1-2 unique features that will set you apart from everyone else.",
      phase: "Idea & Planning",
      videoUrl: null,
      aiTaskType: "suggestion",
      aiTaskTitle: "Feature Generation & USP Discovery",
      aiTaskDescription: "AI analyzes competitor features to identify must-haves, then helps you discover unique selling points that differentiate you.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your USP focus?",
      microDecisionOptions: JSON.stringify(["Speed/Simplicity", "AI-Powered", "Better Integration", "Niche-Specific"]),
      reflectionQuestion: "What one unique feature will make customers choose you over competitors?",
      tip: "Why create a 'clone' when you can have ALL their best features AND be 10-20% better with just ONE unique feature? That's a KILLER combination.",
      lesson: `The TRUTH is, if you just create something with the SAME feature set as a competitor then YOU can have a WILDLY successful business! BUT... Why create some "clone" when you can have ALL of their best features AND be 10-20% better by including ONE feature they don't have!

STEP 1: List Essential Core Features

These are the features that your competitors have that if YOU don't have them, most people will NOT switch to yours or even consider it. Where multiple competitors share the same features, this forms YOUR feature set.

STEP 2: Find Your USP

Ask ChatGPT or Claude: "I am building SAAS for [NICHE]. My target market are [AVATAR] and the problem my SAAS solves is [PROBLEM]. Write me 28 USP ideas that my competition doesn't likely have that would make my software better than theirs."

Go through them and PICK one or two that excite you. If results are generic, tell it: "I want these USP ideas to be so wild, it'd shock people in the space. NOTHING generic will do."

The WINNING FORMULA:

CLONED CORE FEATURES + USP + LONGER FREE TRIAL + CHEAPER MONTHLY PRICE = WIN`,
      outcome: "A complete feature list: core features you MUST have, competitive must-haves, and 1-2 unique USP features",
      completionMessage: "You know what beats a 'perfect' feature list? One that you can actually build. You just defined your core features, what competitors have, and what makes you DIFFERENT. Tomorrow: naming and MVP roadmap.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 4,
      title: "Name It & Claim It",
      description: "Choose a killer name, secure the .com domain (no exceptions!), and claim all your social handles before someone else does.",
      phase: "Idea & Planning",
      videoUrl: null,
      aiTaskType: "suggestion",
      aiTaskTitle: "AI Name Generator",
      aiTaskDescription: "AI generates brandable name ideas based on your idea, pain points, and features. Then you'll register your domain and claim social handles.",
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

WHAT TO AVOID:

❌ HYPHENS OR NUMBERS - "task-hub-123.com" looks cheap and confusing. Just don't.

❌ OVERPAYING FOR DOMAINS - Normal .com registration: $10-15/year on Namecheap. If it's $100+, it's a "premium" domain owned by a squatter. If you can't get it for under $20, pick a DIFFERENT name.

❌ GENERIC NAMES - "Analytics Platform" or "Marketing Tool" - you can't trademark these and they're forgettable.

The name you pick today will be on every invoice, every email, every conversation. Make it count.`,
      outcome: "Your product name chosen, .com domain registered, and all social handles claimed",
      completionMessage: "You have a NAME. A real brand that's YOURS. Domain secured, socials claimed. Nobody can take these from you now. Tomorrow: setting up your AI-powered development toolkit.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 5,
      title: "AI Tech Stack Setup",
      description: "Sign up for Replit, Claude, ChatGPT, and OpenAI API - your AI-powered development toolkit.",
      phase: "Idea & Planning",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Tool Setup Checklist",
      aiTaskDescription: "Set up your accounts for Replit (AI agent builder), Claude (Pro), ChatGPT (Plus), and OpenAI API.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Have you used AI coding tools before?",
      microDecisionOptions: JSON.stringify(["Never", "A little", "Regularly", "I'm experienced"]),
      reflectionQuestion: "What's holding you back from building right now?",
      tip: "Don't skimp on this. Get the PAID accounts on all of these. The prices are SO ridiculously low - just grab them and accept it as the cost of doing business.",
      lesson: `Our AI Software Stack - The BASICS of what you'll need:

1. ChatGPT Plus (~$20/month) - Your AI assistant for advice, opinions, and content
2. Claude Pro (~$20/month) - Second opinion, different strengths, better for some tasks
3. Replit - The main AI agent SAAS builder where your software lives
4. OpenAI API - The brain of many projects, very cheap pay-as-you-go

WHY BOTH CLAUDE AND CHATGPT?

They're good at different things (and that changes, often). You can play them off against each other - get ONE to write something, pass it to the OTHER to critique.`,
      outcome: "Replit, Claude, ChatGPT, and OpenAI API accounts set up and ready to build",
      completionMessage: "Your AI toolkit is ready. You now have superpowers that would've cost $300K+ and taken years just a few years ago. Tomorrow: we create your PRD and start building.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 6,
      title: "Summary + PRD Into Replit",
      description: "Finalize your plan, generate a professional Product Requirements Document with AI, and paste it into Replit to start building.",
      phase: "Idea & Planning",
      videoUrl: null,
      aiTaskType: "template",
      aiTaskTitle: "PRD Generation",
      aiTaskDescription: "AI summarizes everything from Days 1-5 and creates a complete Product Requirements Document ready for Replit.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How detailed should your PRD be?",
      microDecisionOptions: JSON.stringify(["Brief overview", "Standard detail", "Very detailed", "Everything included"]),
      reflectionQuestion: "Looking at everything you've defined, what excites you most about building this?",
      tip: "Use ChatGPT for the PRD - in my experience it does a better job 99% of the time. But still worth checking Claude's version too.",
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

THE PRD PROMPT:

"I need a PRD for my SAAS I'm building in Replit. The SAAS NAME is [NAME], my CUSTOMER AVATAR is [AVATAR], The PROBLEM my SAAS solves is [PROBLEM], my FEATURE set is [FEATURES], my USP is [USP] and I want it to LOOK AND FEEL like [DESCRIPTION]."

Check through it, change anything that's wrong, then PASTE IT INTO REPLIT and watch the MAGIC happen!`,
      outcome: "A complete PRD pasted into Replit with your first build session started",
      completionMessage: "You have a PRD. A real Product Requirements Document that tells you exactly what to build. Most founders skip this and wonder why they're still coding 6 months later. You're different. Tomorrow: Claude Code setup.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 7,
      title: "Claude Code + GitHub Setup",
      description: "Connect Claude Code to Replit and GitHub, learn the daily workflow, and complete your first real build session.",
      phase: "Idea & Planning",
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
      lesson: `The AI Agent we are using is already FASTER, CHEAPER and BETTER than LARGE teams of SENIOR developers.

WITH HUMANS:

Simple features can take weeks or months. Debugging can take weeks. Everything is SLOW, CUMBERSOME & EXPENSIVE!

WITH AI:

You tell it what you want, and it BUILDS it. Often in minutes.

Is it perfect? No. But it will only get BETTER. If it can't do something you want today, GIVE IT A COUPLE OF WEEKS AND IT PROBABLY WILL!

DAILY WORKFLOW:

1. Start your session with a clear goal
2. Tell the agent what you want to build or fix
3. Review what it creates
4. Test it in the app
5. Iterate until it works

KEY NOTE:

You HAVE to accept this is an EVER-CHANGING space. Things change CONSTANTLY. Don't FEAR this. EMBRACE it.`,
      outcome: "Claude Code connected to Replit and GitHub, first build session complete",
      completionMessage: "Week 1 DONE. You have a validated idea, a clear plan, tools set up, and you've started building. While others are still 'thinking about it,' you're DOING it. Next week: we verify what got built.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // BUILD & VERIFY (Days 8-10)
    // ============================================
    {
      day: 8,
      title: "Master Claude Code",
      description: "Learn how to effectively use Claude Code to build, fix, and iterate on your app. This is your superpower.",
      phase: "Build & Verify",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Claude Code Mastery",
      aiTaskDescription: "Learn the essential commands, prompts, and workflows that make Claude Code your most powerful building tool.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your biggest challenge with AI coding tools?",
      microDecisionOptions: JSON.stringify(["Not sure what to ask", "Results aren't what I want", "Don't know how to fix errors", "Everything feels overwhelming"]),
      reflectionQuestion: "What feature would you build if you knew Claude Code would get it right first time?",
      tip: "Claude Code works best when you're SPECIFIC. 'Make the button blue' is better than 'improve the design'. 'Add a login form with email and password' is better than 'add authentication'.",
      lesson: `WHY CLAUDE CODE?

It'll save you THOUSANDS. You CAN just use Replit's built-in AI on its own. It's easier to get started. But here's the truth: it gets VERY expensive, VERY fast. We're talking hundreds of dollars a month if you're building regularly.

Claude Code runs in Replit's shell. Same power. Fraction of the price.

THE SECRET TO GETTING WHAT YOU WANT:

Be SPECIFIC. "Make it look better" = USELESS. "Add 16px padding around all cards" = USEFUL.

ONE thing at a time. Don't ask for login, dashboard, AND settings. Ask for login. Wait. Then dashboard.

Describe problems like you're talking to a human. "Fix the bug" = TERRIBLE. "When I click submit, nothing happens. It should show a success message." = GOOD.

The difference between building in DAYS vs being stuck for WEEKS comes down to how you talk to the AI. Good prompts = fast results.

Complete today and you'll unlock the CLAUDE CODE GUIDE in the menu - all 3 prompts in one place for easy access.`,
      outcome: "Confident using Claude Code to build, fix, and improve your app with effective prompts",
      completionMessage: "You now know how to TALK to your AI. That's the skill that separates people who build fast from people who get frustrated. Tomorrow: we check what Replit actually built.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 9,
      title: "The Build Loop",
      description: "Learn the most important workflow in software: Build, Test, Fix, Repeat. This is how real builders ship.",
      phase: "Build & Verify",
      videoUrl: null,
      aiTaskType: "workflow",
      aiTaskTitle: "The Build Loop",
      aiTaskDescription: "Master the Build-Test-Fix cycle that every successful builder uses daily.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What did you work on in your first loop?",
      microDecisionOptions: JSON.stringify(["Fixed something broken", "Improved how it looks", "Added a missing piece", "Made it clearer to use"]),
      reflectionQuestion: "How did it feel to complete your first Build-Test-Fix loop?",
      tip: "Finding bugs isn't failure - it's PROGRESS. The faster you find and fix them, the faster you ship. Pros find bugs constantly - they just fix them faster.",
      lesson: `This is THE skill that separates people who ship from people who don't.

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

Bad: "It's broken"
Good: "When I click Save, the page refreshes but data isn't in the database"

The more specific you are, the faster AI can help you fix it.

TODAY'S MISSION:

Find ONE bug in your app. Describe it clearly. Fix it with Claude Code. That's it. Simple? Yes. But this simple loop is what you'll do every single day of building. Master it now.`,
      outcome: "Found and fixed your first bug using the Build-Test-Fix loop",
      completionMessage: "You just completed your first Build-Test-Fix loop! This is the skill that will carry you through everything. Finding bugs = progress. Tomorrow: more fixing and iterating.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 10,
      title: "Add The AI Brain",
      description: "Integrate OpenAI API to make your app intelligent. This is what makes AI SaaS special.",
      phase: "Build & Verify",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "AI Integration",
      aiTaskDescription: "Connect OpenAI API to your app and create your first AI-powered feature.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What should AI do in your app?",
      microDecisionOptions: JSON.stringify(["Generate content", "Analyze/summarize data", "Answer questions", "Automate tasks"]),
      reflectionQuestion: "What manual task could AI do for your users that would make them say 'THIS IS AMAZING'?",
      tip: "The OpenAI API costs about $0.002 per request. That's 500 AI calls for $1. Don't overthink costs - just BUILD.",
      lesson: `Today your app gets a BRAIN.

This is what makes AI SaaS different from regular SaaS. Your app doesn't just store data or display things - it THINKS. And here's the thing: Users EXPECT this now. It's 2025. An app without AI feels like a website from 2010.

WHY THIS MATTERS:

1. It's your MOAT. Regular features can be copied in a weekend. Good AI features are HARD to replicate.
2. It's the VALUE. Users aren't paying for your pretty buttons. They're paying for what the AI does for them.

THE SIMPLE VERSION:

1. Get an OpenAI API key (platform.openai.com)
2. Store it in Replit Secrets (never in your code!)
3. Tell Claude Code to add an AI feature

That's it. The AI handles the rest.

THE PROMPT:

"Add an AI feature. When the user [does something], take their input, send it to OpenAI with this instruction: [what you want the AI to do], and show the result. Use the API key from secrets. Add a loading spinner."

WHAT SHOULD YOUR AI DO?

Ask yourself: What manual task could the AI do that would make users say "THIS IS AMAZING"? Generate something for them? Analyze something for them? Summarize something for them? Suggest something for them?

Pick ONE thing. Get it working PERFECTLY. You can add more later.

THE COST REALITY:

OpenAI API is about $0.002 per request. That's 500 AI calls for $1. Don't overthink costs - just BUILD. This is the feature that makes your app worth paying for. Make it good.`,
      outcome: "AI API integrated, first AI-powered feature working in your app",
      completionMessage: "Your app can THINK now. That's the core of AI SaaS - intelligence built in. Tomorrow: connecting other APIs you might need.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // MAKE IT WORK (Days 11-14)
    // ============================================
    {
      day: 11,
      title: "Add Superpowers",
      description: "Connect external APIs to give your app capabilities beyond what you could build yourself - payments, data, integrations.",
      phase: "Make It Work",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "API Connections",
      aiTaskDescription: "Identify and connect the external APIs your app needs to deliver real value.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What superpower does your app need?",
      microDecisionOptions: JSON.stringify(["Payments (Stripe)", "Data/Scraping", "Third-party integration", "None needed yet"]),
      reflectionQuestion: "What can your app do now that it couldn't do before?",
      tip: "Before adding ANY external API, ask Replit Agent first: 'Can you do [thing] without an external service?' Often Replit can handle it natively. Only add APIs when truly necessary.",
      lesson: `Your app has an AI brain. Now let's give it SUPERPOWERS.

External APIs let your app do things that would be impossible to build yourself. Payments. Data feeds. Third-party integrations. These are the things that turn a toy into a real product.

BUT FIRST - ASK REPLIT:

Before you add ANY external service, ask Replit Agent: "Can you help me [do the thing] without an external API?"

You'd be SURPRISED how much Replit can do natively. Database? Built in. Auth? Built in. File storage? Built in. Only reach for external APIs when Replit genuinely can't do what you need.

COMMON SUPERPOWERS:

1. PAYMENTS (Stripe)
If you're charging money, you need Stripe. It's the standard.
- Sign up at stripe.com
- Get your API keys (test mode first!)
- Add to Replit Secrets: STRIPE_SECRET_KEY
- Tell Claude Code: "Add Stripe checkout for [your pricing]"

2. WEB SCRAPING (Bright Data)
Need data from other websites? That's web scraping. It's powerful but USE IT RESPONSIBLY.
- Only scrape public data
- Respect rate limits
- Check the site's terms of service
Bright Data is the go-to service for this.

3. OTHER INTEGRATIONS
Need to connect to Slack? Google Sheets? A specific industry tool? Most have APIs. Google "[service name] API" and look for their developer docs.

THE RULE:

Add ONE superpower at a time. Get it working. Test it. Then consider the next one.

Don't go API-crazy. Every external dependency is something that can break. Keep it minimal until you KNOW you need it.

WHAT IF YOU DON'T NEED ANY?

That's fine! Many successful SaaS apps are just:
- A database (Replit has it)
- User accounts (Replit has it)
- AI features (you added yesterday)
- Good UX (that's on you)

If your app works without external APIs, skip this day. Move on. Don't add complexity for the sake of it.`,
      outcome: "External APIs connected (if needed), or confirmed app works without them",
      completionMessage: "Your app now has superpowers - or you've confirmed it doesn't need them. Both are wins. Tomorrow: making sure users can log in.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 12,
      title: "Add Login",
      description: "Make sure users can sign up, log in, and see only their own data. Authentication is what makes your app multi-user.",
      phase: "Make It Work",
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
      lesson: `Authentication = "Who are you?"

It's how your app knows which user is which, so everyone sees their OWN stuff, not everyone else's.

GOOD NEWS:

Replit probably already has it. When you built your app, Replit Agent likely added authentication automatically. Before doing ANYTHING, check:

Ask Replit Agent: "Does my app have user authentication? Can users sign up, log in, and see only their own data?"

If YES - you're DONE. Move to the next day. Seriously. Don't overcomplicate this.

If NO - add it with ONE prompt:

"Add user authentication. I need:
- Login/signup button in the header
- Show the user's name when logged in
- Logout button
- Each user should only see their own data"

That's it. Replit handles all the hard stuff - OAuth, sessions, tokens, security. You just describe what you want.

WHAT AUTH GIVES YOU:

1. USERS - People can create accounts
2. PRIVACY - Each person sees only their stuff
3. PERSISTENCE - Their data is saved and waiting when they come back
4. MONETIZATION - You know who to charge (later)

WITHOUT AUTH:

Everyone sees the same data. There's no "your account." You can't have paying customers because you don't know who anyone is.

THE TEST:

1. Sign up with a test email
2. Add some data
3. Log out
4. Sign up with a DIFFERENT test email
5. Can you see the first account's data? You shouldn't.

If each account is isolated, auth is working. Done.`,
      outcome: "Users can sign up, log in, and each user sees only their own data",
      completionMessage: "Users can now log in and have their own accounts. Your app is no longer a single-player game. Tomorrow: reaching your users with email.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 13,
      title: "Email Setup",
      description: "Set up email so you can communicate with users - welcome emails, updates, and notifications.",
      phase: "Make It Work",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Email Setup",
      aiTaskDescription: "Connect Resend for transactional emails and set up your welcome email.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your first email priority?",
      microDecisionOptions: JSON.stringify(["Welcome email", "Password reset", "Activity notifications", "Weekly digest"]),
      reflectionQuestion: "What will your welcome email say to make new users feel excited?",
      tip: "Start with ONE email - the welcome email. You can add more later. Resend is free for 3,000 emails/month which is plenty to start.",
      lesson: `Without email, you have NO way to reach users after they leave your app.

They sign up. They leave. They forget about you. Game over.

Email is your direct line back to them. It's how you:
- Welcome new signups
- Remind inactive users
- Announce new features
- Reset passwords
- Send notifications

TODAY'S GOAL: Get ONE email working - the welcome email.

THE SETUP (10 minutes):

1. SIGN UP FOR RESEND
Go to resend.com and create an account. It's free for 3,000 emails/month.

2. GET YOUR API KEY
In the Resend dashboard, create an API key. Copy it immediately.

3. ADD TO REPLIT SECRETS
In your Replit project, go to Secrets (the lock icon). Add:
Name: RESEND_API_KEY
Value: [paste your key]

4. TELL CLAUDE CODE TO ADD EMAIL
"When a new user signs up, send them a welcome email using Resend. The email should:
- Welcome them by name
- Tell them what to do first
- Include a link back to the app
Use the RESEND_API_KEY from secrets."

YOUR WELCOME EMAIL SHOULD:

- Be SHORT (3-4 sentences max)
- Feel personal (use their name)
- Give ONE clear action ("Click here to get started")
- Set expectations ("Here's what you can do with [app name]")

EXAMPLE:

"Hey [Name]! Welcome to [App]. You're all set up and ready to go. Click here to [do the main thing]. If you have any questions, just reply to this email. - [Your name]"

That's it. One email. Working. You can add more emails later (password reset, notifications, weekly updates). But start with this one.

WHY RESEND?

It's simple, reliable, and free to start. The API is clean. Claude Code knows how to use it. Don't overthink email providers - Resend works.`,
      outcome: "Resend connected, welcome email sending to new signups",
      completionMessage: "You can now REACH your users. That's huge. Email is your lifeline to customers. Tomorrow: mobile optimization.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 14,
      title: "Mobile Ready",
      description: "Make your app work beautifully on phones and tablets. Most users will access on mobile.",
      phase: "Make It Work",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Mobile Optimization",
      aiTaskDescription: "Test and fix your app's mobile experience across different screen sizes.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How does your app look on mobile right now?",
      microDecisionOptions: JSON.stringify(["Looks great!", "Usable but not pretty", "Some things are broken", "Haven't checked yet"]),
      reflectionQuestion: "Can users complete the main task on their phone without frustration?",
      tip: "Test on a REAL phone, not just browser dev tools. The experience is different. Also try with one hand - can you reach all the buttons?",
      lesson: `Here's a BRUTAL truth: More than HALF your users will access your app on their PHONE.

Not their laptop. Not their desktop. Their PHONE.

And if your app looks broken on mobile? They're GONE. They don't come back. They don't give you a second chance. This isn't about being perfect. It's about being USABLE.

WHAT YOU'RE ACTUALLY TESTING:

1. DOES IT LOAD? Open your app on your actual phone (not browser dev tools - your REAL phone). Does it load? Fast? Good.
2. CAN YOU READ IT? Without pinching and zooming? Text should be readable without squinting.
3. CAN YOU TAP THE BUTTONS? Are they big enough for a thumb? If you're missing buttons with your finger, they're too small.
4. DOES THE MAIN THING WORK? Whatever your app DOES - can you do it on mobile? This is the only question that actually matters.

THE FAST FIX:

Open Claude Code and say: "Test my app at 375px width. Fix anything that's broken. Make buttons at least 44px tall. Make text readable. No horizontal scrolling." That's it. Don't overthink it.

DO THIS NOW:

1. Open your app on your phone
2. Try the main feature
3. Note what's broken or awkward
4. Fix it with Claude Code

Mobile optimization isn't about perfection. It's about: Can someone USE this on their phone? Yes or no.`,
      outcome: "App works on mobile devices - responsive and touch-friendly",
      completionMessage: "Your app works on mobile now. You just unlocked the majority of potential users. Tomorrow: user onboarding.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // TEST & REFINE (Days 15-18)
    // ============================================
    {
      day: 15,
      title: "User Onboarding",
      description: "Create a smooth first-run experience. Help new users understand and love your app in the first 2 minutes.",
      phase: "Test & Refine",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Onboarding Flow",
      aiTaskDescription: "Design and build an onboarding experience that helps users get value quickly.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What should onboarding focus on?",
      microDecisionOptions: JSON.stringify(["Quick tour of features", "Get them to first success", "Collect preferences", "Just let them explore"]),
      reflectionQuestion: "What's the ONE thing a user must do to 'get' your app?",
      tip: "The best onboarding gets users to their first 'aha moment' as fast as possible. What's the smallest action that shows them the value?",
      lesson: `First impressions are EVERYTHING.

When someone signs up, you have about 2 minutes before they decide whether your app is for them or not. Two minutes. That's it.

THE ONLY GOAL OF ONBOARDING:

Get them to their first WIN as fast as humanly possible. Not "show them features." Not "explain everything." Just help them DO something and feel successful.

THE 2-MINUTE RULE:

Within 2 minutes of signing up, a user should:
1. Understand what the app does
2. DO the main thing
3. See a result that makes them think "oh, that's cool"

If that takes more than 2 minutes? You'll lose most of them.

THE SIMPLEST ONBOARDING THAT WORKS:

1. They sign up
2. Take them STRAIGHT to the main feature
3. Pre-fill it with example data so they can try immediately
4. One click to get a result
5. "Wow, that was easy. I like this."

Done.

WHAT KILLS ONBOARDING:

- Long tutorials (no one watches them)
- Too many steps before they get value
- Forcing email verification before they can try the app
- Empty states with no guidance
- Feature dumps ("Here's 20 things you can do!")

THE QUESTION:

What's the ONE thing a user needs to do to "get" your app? That's your onboarding. Everything else is distraction. Make them successful in 2 minutes or less.`,
      outcome: "Smooth onboarding flow that gets users to their first success quickly",
      completionMessage: "New users now have a clear path to success. That's the difference between an app people try once and an app people keep using. Tomorrow: seeing what's happening in your app.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 16,
      title: "Admin Dashboard",
      description: "Build a simple dashboard to see what's happening in your app. Users, activity, and key metrics.",
      phase: "Test & Refine",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Admin Panel",
      aiTaskDescription: "Create an admin dashboard to monitor users, activity, and app health.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What do you most want to track?",
      microDecisionOptions: JSON.stringify(["User signups & activity", "Feature usage", "Errors & issues", "Revenue (when added)"]),
      reflectionQuestion: "What information would help you make better decisions about your app?",
      tip: "Your admin dashboard is for YOU, not users. Keep it simple - just the data you'll actually look at. You can add more later.",
      lesson: `You need to see what's happening inside your app.

Not guess. Not assume. KNOW.

How many users do you have? How many signed up this week? Are people actually USING the thing or just signing up and leaving? Right now, you probably don't know. Let's fix that.

THE SIMPLEST ADMIN DASHBOARD:

You don't need fancy graphs. You need FOUR numbers:
1. Total users (how many people have ever signed up)
2. New users this week (are people still finding you?)
3. Active users this week (are they coming back?)
4. Total [main actions] (are they doing the thing?)

That's it. Four numbers. You can add more later.

THE SETUP:

Tell Claude Code: "Create an admin page at /admin. Only I can access it. Show me: total users, new users this week, active users this week, and total [actions]. Also show the last 20 [actions] with user and timestamp." Done.

WHY THIS MATTERS:

Without data, you're flying blind. You THINK things are going well. You HOPE people like it.

With data, you KNOW:
- "Oh, 50 people signed up but only 5 came back" -> Onboarding problem
- "People are signing up but not using the main feature" -> Feature problem
- "Usage is growing every week" -> Keep doing what you're doing

DATA TELLS YOU WHAT TO FIX. Build the dashboard. Check it every day. Make decisions based on what you see, not what you hope.`,
      outcome: "Admin dashboard showing users, activity, and key metrics",
      completionMessage: "You can now SEE what's happening in your app. Data beats guessing. Tomorrow: THE BUILD PHASE.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 17,
      title: "Build It Out",
      description: "THE PAUSE POINT. You've learned 95% of what you need. Now BUILD. Stay here as long as you need - days or weeks.",
      phase: "Test & Refine",
      videoUrl: null,
      aiTaskType: "session",
      aiTaskTitle: "Build Mode",
      aiTaskDescription: "This is THE pause point. Build, fix, iterate. Stay here until your app is ready.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What are you focusing on today?",
      microDecisionOptions: JSON.stringify(["Core features", "Bug fixes", "UI polish", "New functionality"]),
      reflectionQuestion: "What's the ONE thing that would make your app significantly better?",
      tip: "THIS IS THE PAUSE POINT. Use the PAUSE button. Stay on Day 17 for as long as you need. Days. Weeks. Build until you're ready.",
      lesson: `STOP. READ THIS CAREFULLY.

This is THE PAUSE POINT.

You've now learned 95% of everything you need to build a SaaS. AI integration. APIs. Auth. Email. Mobile. Onboarding. Admin dashboard. The tools are in your hands.

Now it's time to actually BUILD.

THE RULE: Stay on Day 17 until your app is READY.

Some people spend one day here. Some spend two weeks. Some spend a month. ALL OF THAT IS FINE.

Use the PAUSE button in the sidebar. Come back tomorrow and keep building. And the next day. And the next.

WHAT "READY" MEANS:

Your app should:
- Have all core features working
- Handle errors gracefully (no crashes)
- Work on mobile
- Look decent (not perfect - decent)
- Be something you'd show to a stranger

If you're not there yet? KEEP BUILDING.

WHAT TO DO EACH SESSION:

1. Pick ONE thing to work on
2. Build it or fix it
3. Test it
4. Repeat

Don't try to do everything. One thing at a time. Small wins stack up.

WHEN YOU GET STUCK:

- Describe the problem clearly to Claude Code
- If it's a bug: "When I click X, Y happens instead of Z"
- If it's a feature: "I want users to be able to do X"
- If you're lost: Take a break. Come back tomorrow.

THE MINDSET:

This isn't a race. This is where real builders spend their time. In the code. Making things work. Finding bugs and fixing them. Adding polish.

Everyone wants to launch. But launching garbage doesn't help anyone. Build something you're proud of FIRST.

WHEN TO MOVE ON:

When your app is something you'd be comfortable showing to real users. When it works. When it doesn't embarrass you.

Then - and only then - move to Day 18.`,
      outcome: "App is built out, tested, and ready for final polish and launch",
      completionMessage: "You've put in the work. Your app is taking shape. If you need more time, use PAUSE. When ready, it's time to TEST and POLISH.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 18,
      title: "Test Everything",
      description: "Systematically test your USP and every feature. Find the bugs before your users do.",
      phase: "Test & Refine",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Full Test Suite",
      aiTaskDescription: "Test your USP and all features. Click everything. Try to break it.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How did testing go?",
      microDecisionOptions: JSON.stringify(["Everything works!", "Found minor issues", "Found major issues", "Need more building time"]),
      reflectionQuestion: "Would you feel confident letting a paying customer use this right now?",
      tip: "Test like a user, not a developer. Click every button. Try to break things. Enter weird data. If it breaks for you, it'll break for customers.",
      lesson: `Today you become your app's WORST enemy.

Click every button. Fill every form. Try to BREAK things. Because if YOU can break it, your USERS definitely will.

FIRST: TEST YOUR USP

Your Unique Selling Point is your WEAPON. It's why people choose YOU.

1. Open your app
2. Do the USP thing
3. Ask yourself: Would I pay for this?
4. Compare to a competitor - is yours better?

If your USP doesn't make you think "yeah, that's pretty cool" - go back to Day 17 and improve it.

THEN: TEST EVERYTHING ELSE

The testing mindset: Pretend you've never seen your app before. You're a confused user who just landed here.

TRY TO BREAK IT:

- Enter nothing. Submit empty forms.
- Enter garbage. asdfasdfasdf everywhere.
- Enter EVERYTHING. Paste a novel into a text box.
- Do things in the wrong order.
- Click the same button 10 times fast.
- Use it on mobile.

What happens? Does it crash? Does it give a helpful error? Does it just... do nothing?

WHAT TO LOOK FOR:

- Loading states - is there a spinner?
- Success states - do you KNOW when it worked?
- Error states - when it fails, do you know WHY?
- Edge cases - emoji? Long names? Special characters?

WHEN YOU FIND BUGS:

Fix them NOW. You're about to launch. Every bug you find is a bug your users won't hit.

THE GOAL:

By end of today, you should be able to say: "I've clicked every button, tested every feature, and I'm confident this works."`,
      outcome: "All features tested, bugs fixed, app is reliable and ready for launch",
      completionMessage: "Your app has been battle-tested. You know it works. That confidence is worth everything. Tomorrow: making it beautiful.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // POLISH & LAUNCH (Days 19-21)
    // ============================================
    {
      day: 19,
      title: "Brand & Beauty",
      description: "Polish the visuals. Logo, colors, typography. Make it look like a product people would pay for.",
      phase: "Polish & Launch",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Visual Polish",
      aiTaskDescription: "Add final visual polish - logo, consistent branding, and professional touches.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What needs the most visual work?",
      microDecisionOptions: JSON.stringify(["Need a logo", "Colors are inconsistent", "Typography needs work", "Overall needs polish"]),
      reflectionQuestion: "If someone landed on your app right now, would they think 'this looks professional'?",
      tip: "You don't need a perfect logo. A clean text logo in a nice font is better than a bad graphic. Focus on consistency over creativity.",
      lesson: `Let's talk about what REALLY matters here.

Your app WORKS. It does the thing. But does it look like something worth paying for?

Here's the truth: People judge your app in the first 3 seconds. Before they even USE it. They look at it and think "professional" or "amateur". And that judgment directly affects what they'll pay.

THIS IS SIMPLER THAN YOU THINK:

1. PICK ONE COLOR - Seriously. Just one main color. Blue, green, purple, whatever. Use it for buttons, links, and accents. Everything else is white/gray backgrounds and dark text. That's your brand. Done.
2. TEXT LOGO IS FINE - You don't need a designer. Your app name in a clean font IS a logo. Canva takes 5 minutes. Don't overthink this.
3. MAKE IT CONSISTENT - Same button style everywhere. Same card style everywhere. Same spacing everywhere. CONSISTENCY is what makes things look professional - not fancy graphics.

THE QUICK FIX:

Tell Claude Code: "Make my app look consistent. Primary color is [pick one]. Same button style, same card style, same spacing on every page. Add a simple text logo in the header." That's it. 15 minutes max.

LOOK AT WHAT YOU'VE BUILT.

Seriously. Open your app right now and look at it.

This isn't a side project anymore. This isn't a "maybe someday" thing. This is a branded, professional-looking SaaS product that you built. Two more days and you LAUNCH.`,
      outcome: "App has consistent branding, logo, and professional visual design",
      completionMessage: "Your app LOOKS like a real product now. Consistent, polished, credible. Almost there!",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 20,
      title: "Final Prep",
      description: "Last checks before launch. Make sure everything is ready.",
      phase: "Polish & Launch",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Pre-Launch",
      aiTaskDescription: "Final preparations before launch day.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How ready do you feel?",
      microDecisionOptions: JSON.stringify(["Ready to launch!", "Almost there", "Need more time", "Not sure"]),
      reflectionQuestion: "What's the ONE thing you'd regret not fixing before launch?",
      tip: "If something is bugging you, fix it now. You'll feel better launching something you're proud of.",
      lesson: `Tomorrow you launch.

Take a breath. Look at what you've built.

TODAY'S JOB: Final sweep.

Go through your app one more time. Not to rebuild it. Not to add features. Just to make sure everything is RIGHT.

THE FINAL CHECKLIST:

1. Does signup/login work?
2. Does your main feature work?
3. Does your USP feature work?
4. Does it work on mobile?
5. Does it look professional?
6. Are there any obvious bugs?
7. Is there anything that would embarrass you?

If you find something - fix it NOW.

IF EVERYTHING WORKS:

Great. You're ready. Get some rest. Tomorrow is launch day.

IF YOU'RE NOT READY:

That's okay too. Go back to Day 17. Keep building. There's no shame in taking more time.

But be honest with yourself: Are you "not ready" or are you just scared?

Fear is normal. Perfectionism is a trap. At some point, you have to ship.

Done is better than perfect. You can always improve after launch.`,
      outcome: "Final checks complete, ready for launch",
      completionMessage: "Everything is ready. Tomorrow, you launch. Get some rest. You've earned it.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 21,
      title: "Launch Day",
      description: "GO LIVE. You're about to launch your AI SaaS.",
      phase: "Polish & Launch",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Launch",
      aiTaskDescription: "Final launch checklist and GO LIVE.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How do you feel about launching?",
      microDecisionOptions: JSON.stringify(["Excited and ready!", "Nervous but ready", "Want more polish first", "Terrified"]),
      reflectionQuestion: "What will you do to celebrate after you launch?",
      tip: "Done is better than perfect. You can always improve after launch. The goal today is to be LIVE, not to be flawless.",
      lesson: `LAUNCH DAY.

21 days ago, you probably wondered if you could actually do this. Build a real SaaS product. With AI. From scratch.

Look at where you are now.

THE PRE-LAUNCH REALITY CHECK:

Before you hit that button, confirm these things work:
1. Can someone sign up and log in? YES/NO
2. Does your main feature work? YES/NO
3. Does your USP feature work? YES/NO
4. Does it work on mobile? YES/NO
5. Does it look professional? YES/NO

If you said YES to all of these - you're ready to launch. If you said NO to any of them - fix it now. Don't launch broken.

WHAT THIS COSTS TO RUN:

Let's be HONEST about the numbers:
- Replit: Free to start, $7-20/month for custom domain
- OpenAI API: ~$20-50/month depending on usage
- Email (Resend): Free for first 3,000 emails/month
- Domain: $10-15/year

Total: Under $50/month to start. That's less than most people spend on coffee.

AFTER YOU CLICK LAUNCH:

1. Test everything LIVE as a new user
2. Share with 5-10 people you trust
3. Watch your admin dashboard
4. Fix what breaks (something always breaks)

YOU BUILT A SAAS. NOW WHAT?

Here's the thing nobody tells you: Building a product is actually the EASY part. Turning that product into a BUSINESS? That's where most people get stuck.

How do you get your first paying customers? How do you price it? How do you market it when you're not a marketer? How do you grow without burning out?

These are the questions that separate products that make money from products that sit there collecting dust. I've helped dozens of SaaS founders navigate this exact transition. From "I have a product" to "I have a profitable business."

If you want help with the next step - getting customers, pricing strategy, marketing that actually works, and building a sustainable business around what you've built - let's talk.

Book a call: www.mattwebley.com/workwithmatt

But first: LAUNCH THIS THING. You've earned it.`,
      outcome: "App is LIVE and accessible to the world. You launched!",
      completionMessage: "YOU LAUNCHED! 21 days. From idea to live product. You did what most people only dream about. The journey is just beginning, but you've proven you can BUILD. Congratulations!",
      xpReward: 200,
      estimatedMinutes: 10,
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

  console.log("✅ Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
