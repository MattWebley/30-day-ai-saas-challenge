import { db } from "./db";
import { dayContent, badges } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed badges
  console.log("Creating badges...");
  const badgeData = [
    {
      name: "First Steps",
      description: "Completed Day 1: Chose Your $100K+ Idea",
      icon: "🎯",
      triggerType: "day_completed",
      triggerValue: 1,
    },
    {
      name: "Planner",
      description: "Completed Week 1: Idea & Planning (Days 1-7)",
      icon: "🔍",
      triggerType: "day_completed",
      triggerValue: 7,
    },
    {
      name: "Builder",
      description: "Completed Week 2: Build & Verify (Days 8-10)",
      icon: "🏗️",
      triggerType: "day_completed",
      triggerValue: 10,
    },
    {
      name: "Tester",
      description: "Completed Week 3: Make It Work (Days 11-14)",
      icon: "🧪",
      triggerType: "day_completed",
      triggerValue: 14,
    },
    {
      name: "Integrator",
      description: "Completed Week 4: Infrastructure (Days 15-18)",
      icon: "⚡",
      triggerType: "day_completed",
      triggerValue: 18,
    },
    {
      name: "Launch Ready",
      description: "Completed Week 5: Polish & Launch Prep (Days 19-20)",
      icon: "✨",
      triggerType: "day_completed",
      triggerValue: 20,
    },
    {
      name: "The Launcher",
      description: "Completed all 21 days and LAUNCHED your SaaS!",
      icon: "🚀",
      triggerType: "day_completed",
      triggerValue: 21,
    },
    {
      name: "On Fire!",
      description: "7-day streak",
      icon: "🔥",
      triggerType: "streak",
      triggerValue: 7,
    },
    {
      name: "Unstoppable",
      description: "14-day streak",
      icon: "⚡",
      triggerType: "streak",
      triggerValue: 14,
    },
    {
      name: "Elite Consistency",
      description: "21-day streak - Completed the entire challenge!",
      icon: "💎",
      triggerType: "streak",
      triggerValue: 21,
    },
  ];

  for (const badge of badgeData) {
    await db.insert(badges).values(badge).onConflictDoNothing();
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
    // WEEK 1: IDEA & PLANNING (Days 1-7)
    // ============================================
    {
      day: 1,
      title: "Choosing Your $100K+ Idea",
      description: "Use AI to generate personalized SaaS ideas based on your knowledge, skills, and interests - then shortlist the best ones.",
      phase: "Week 1: Idea & Planning",
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

THE 4-POINT FILTER - Your BULLETPROOF AI SAAS App Scorecard:

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
      phase: "Week 1: Idea & Planning",
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

BONUS - TRUST YOUR GUT. It NEVER lets me down!

The "I Help" Statement: By end of today, you should be able to say: "I help [SPECIFIC PERSON] solve [PAINFUL PROBLEM] so they can [DESIRED OUTCOME]."`,
      outcome: "One validated SaaS idea with 1-3 specific, painful problems it solves - and your 'I help X with Y' statement",
      completionMessage: "The hardest decision is behind you. You picked ONE idea and identified the exact pains it solves. That's what separates builders from dreamers. Now we turn these pain points into features.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 3,
      title: "Core Features & Your USP",
      description: "Clone competitor's essential features AND identify 1-2 unique features that will set you apart from everyone else.",
      phase: "Week 1: Idea & Planning",
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
      phase: "Week 1: Idea & Planning",
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

THE GOLDEN RULES OF SAAS NAMING:

1. ALWAYS GET THE .COM
Not .io, not .co, not .app. The .com. It's what people type automatically. If you can't get the .com for a reasonable price, CHANGE THE NAME.

2. KEEP IT SHORT
1-2 words maximum. Under 10 characters is ideal. If you can't fit it in a Twitter handle, it's too long.

3. MAKE IT SPEAKABLE
Say it out loud. If you have to spell it for people every time, it's WRONG. "It's Trello, T-R-E-L-L-O" is fine. "It's Xqyzt, X-Q-Y-Z-T" is not.

4. BE UNIQUE
"ProjectManager" is not a name - it's a description. "Asana" is a name. Made-up words that SOUND good are often better than descriptive names.

WHAT TO AVOID:

❌ HYPHENS OR NUMBERS
"task-hub-123.com" looks cheap and confusing. Just don't.

❌ OVERPAYING FOR DOMAINS
Normal .com registration: $10-15/year on Namecheap
If it's $100+: It's a "premium" domain owned by a squatter
Rule: If you can't get it for under $20, pick a DIFFERENT name

❌ GENERIC NAMES
"Analytics Platform" or "Marketing Tool" - you can't trademark these and they're forgettable.

REGISTER EVERYTHING TODAY:

1. DOMAIN: Use Namecheap (namecheap.com) - best prices, best interface
2. TWITTER/X: twitter.com/[yourname] - check and register
3. INSTAGRAM: instagram.com/[yourname] - check and register
4. LINKEDIN: Create a company page
5. TIKTOK: If relevant to your audience
6. GITHUB: If you'll have any public code

Grab them ALL. Even if you never use them. Someone WILL squat on them if you don't.

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
      phase: "Week 1: Idea & Planning",
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

Why BOTH Claude AND ChatGPT?
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
      phase: "Week 1: Idea & Planning",
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
      lesson: `What is a PRD?
A PRD (Product Requirements Document) is your SAAS blueprint. A detailed written plan that outlines EXACTLY what you're going to build.

We FEED the PRD to Replit, which will start to BUILD our software on its own! LIKE MAGIC!

To make a decent PRD you need:
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
      phase: "Week 1: Idea & Planning",
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

WITH HUMANS: Simple features can take weeks or months. Debugging can take weeks. Everything is SLOW, CUMBERSOME & EXPENSIVE!

WITH AI: You tell it what you want, and it BUILDS it. Often in minutes.

Is it perfect? No. But it will only get BETTER. If it can't do something you want today, GIVE IT A COUPLE OF WEEKS AND IT PROBABLY WILL!

DAILY WORKFLOW:
1. Start your session with a clear goal
2. Tell the agent what you want to build or fix
3. Review what it creates
4. Test it in the app
5. Iterate until it works

KEY NOTE: You HAVE to accept this is an EVER-CHANGING space. Things change CONSTANTLY. Don't FEAR this. EMBRACE it.`,
      outcome: "Claude Code connected to Replit and GitHub, first build session complete",
      completionMessage: "Week 1 DONE. You have a validated idea, a clear plan, tools set up, and you've started building. While others are still 'thinking about it,' you're DOING it. Next week: we verify what got built.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 2: BUILD & VERIFY (Days 8-10)
    // ============================================
    {
      day: 8,
      title: "Master Claude Code",
      description: "Learn how to effectively use Claude Code to build, fix, and iterate on your app. This is your superpower.",
      phase: "Week 2: Build & Verify",
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
      lesson: `WHY CLAUDE CODE? It'll save you THOUSANDS.

You CAN just use Replit's built-in AI on its own. It's easier to get started. But here's the truth: it gets VERY expensive, VERY fast. We're talking hundreds of dollars a month if you're building regularly.

Claude Code runs in Replit's shell. Same power. Fraction of the price.

THE CATCH: Replit resets every time you close it. So you need to reinstall Claude Code each session. That's why I'm giving you 3 simple prompts to copy-paste every time.

YOUR DAILY ROUTINE:
1. Open Replit
2. Paste the INSTALL prompt (installs Claude Code)
3. Paste the START prompt (Claude catches up on your project)
4. Build stuff
5. Before closing, paste the END prompt (saves everything)

That's it. Do this every time and you'll never lose work, never explain your project twice, and save a fortune on AI costs.

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
      title: "The Reality Check",
      description: "Compare what Replit built against your PRD. Document what's working, what's missing, and what needs fixing.",
      phase: "Week 2: Build & Verify",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "PRD vs Reality Audit",
      aiTaskDescription: "AI helps you systematically compare your PRD features against what actually got built, creating a prioritized fix list.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How does the app compare to your vision?",
      microDecisionOptions: JSON.stringify(["Better than expected!", "Close but needs work", "Missing key features", "Barely resembles my PRD"]),
      reflectionQuestion: "What's the ONE thing that must work perfectly before anything else?",
      tip: "This audit isn't about being disappointed - it's about having a CLEAR list of what to fix. Every SaaS starts rough. The magic is in the iteration.",
      lesson: `Alright. Time for a reality check.

Open your app RIGHT NOW and click through it. What actually works? What's broken? What's completely missing?

Here's a TRUTH that took me a while to accept: AI-generated code is NEVER perfect on the first pass. NEVER. And that's FINE. It's not failure - it's just how this works.

Even the best human developers iterate. The difference is the AI does 80% of the work in minutes instead of weeks.

YOUR JOB TODAY:

1. Open your PRD from Day 6
2. Go through EVERY feature you listed
3. Mark each one: WORKS / BROKEN / MISSING

Be BRUTALLY honest. If it kind of works but not really - it's BROKEN. If you have to squint and pretend - it's BROKEN.

WHAT YOU'LL PROBABLY FIND:

- Some things work perfectly (nice!)
- Some things are half-built (common)
- Some things weren't even attempted (also common)
- Some things work but look terrible (very common)

This isn't a disaster. This is INFORMATION. Now you know EXACTLY what to fix instead of vaguely feeling like "something's not right."

THE PRIORITY QUESTION:

What's the ONE thing that MUST work before anything else?

Your main feature? Authentication? The thing you'll charge money for?

THAT'S what you fix first. Everything else can wait.

Write it all down. Tomorrow we start fixing.`,
      outcome: "A complete audit of your app with a prioritized list of fixes and missing features",
      completionMessage: "You now have a MAP. Every gap between your vision and reality is documented. No more wondering what to work on - you have a clear fix list. Tomorrow: we start fixing.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 10,
      title: "Fix & Iterate",
      description: "Work through your fix list systematically. This is where you can PAUSE and take your time getting things right.",
      phase: "Week 2: Build & Verify",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Fix Session",
      aiTaskDescription: "Use your prioritized list to fix issues one by one. Track your progress and celebrate wins.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How many critical issues did you find?",
      microDecisionOptions: JSON.stringify(["None - it's working!", "1-3 issues", "4-6 issues", "More than 6"]),
      reflectionQuestion: "What's the most satisfying bug you fixed today?",
      tip: "Take your TIME here. There's no rush. Use the PAUSE button if you need days or weeks to get through your fix list. Better to launch something that WORKS than rush a broken product.",
      lesson: `Today we FIX things. One at a time.

Here's the process: Pick the MOST important broken thing. Describe it to Claude Code. Let it fix it. Test it. Move on.

That's it. That's the whole day.

THE ONLY RULE THAT MATTERS:

ONE. THING. AT. A. TIME.

Don't try to batch fixes. Don't try to fix 10 things at once. That's how you break things that were already working.

Fix one thing. Test it. Confirm it works. THEN move to the next thing.

WHAT IF IT'S NOT WORKING?

Describe it BETTER. Include:
- What's happening (the bug)
- What SHOULD happen (the expected behavior)
- Any error messages you see

The AI can fix almost anything if you describe the problem clearly.

IMPORTANT - READ THIS:

This day is designed to be PAUSED.

If you have 20 things to fix, you're not fixing them all today. That's fine. Use the pause button. Come back tomorrow. Come back next week. There's NO prize for rushing.

A working app is worth more than a fast launch.

COMMIT YOUR WINS:

Every time something critical starts working, commit to GitHub. "Fixed login form" or "Fixed save button" - whatever it is. These are your save points. If something breaks later, you can go back.

Keep going until your core features WORK. Not perfect. Just WORKING.`,
      outcome: "Critical issues fixed, app is functional, ready to verify core features work",
      completionMessage: "You're iterating like a real developer. Fix, test, repeat. That's how ALL software gets built. If you need more time, use PAUSE. When ready, Week 3 is about making sure your USP actually delivers.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 3: MAKE IT WORK (Days 11-14)
    // ============================================
    {
      day: 11,
      title: "Test Your USP",
      description: "Your Unique Selling Point is why people will choose YOU over competitors. Today we verify it actually works.",
      phase: "Week 3: Make It Work",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "USP Verification",
      aiTaskDescription: "Test your unique selling point end-to-end. Does it deliver on its promise?",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Does your USP feature work as intended?",
      microDecisionOptions: JSON.stringify(["Works perfectly!", "Mostly works, minor issues", "Works but needs improvement", "Doesn't work yet"]),
      reflectionQuestion: "If you showed this USP to a potential customer, would they be impressed?",
      tip: "Your USP is what you'll SELL. Everything else is table stakes. If your USP doesn't make people say 'wow, that's cool' - it's not strong enough.",
      lesson: `Your USP is your WEAPON. It's the reason someone picks YOU over the 10 other tools that do something similar.

Today we make sure that weapon is SHARP.

THE QUESTION THAT MATTERS:

If I showed my USP feature to a potential customer RIGHT NOW, would they say "Wow, that's cool - I'd pay for that"?

If the answer is anything other than a clear YES, we have work to do.

WHAT MAKES A USP ACTUALLY WORK:

1. You can SHOW it, not just describe it
"We have AI" = NOT a USP
"Our AI writes 10 posts in 30 seconds" = USP

2. It's OBVIOUSLY different from competitors
Can they do this too? If yes, it's not a USP.

3. It solves a REAL pain
Not a feature for the sake of features. An actual frustration that people hate.

THE TEST:

1. Open your app
2. Do the USP thing
3. Ask yourself: Would I pay for this?

Be HONEST. If you're making excuses ("well, once I add X it'll be better...") - it's not ready.

Then open a competitor. Do the same thing with their tool. Is yours FASTER? EASIER? BETTER? CHEAPER?

If you can't say YES to at least one of those, your USP needs work.

THE BRUTAL TRUTH:

Your USP is what you'll put in your marketing. It's what you'll say on your landing page. It's what will make people click "Buy."

If it doesn't make YOU excited, it won't make THEM excited.

Make it UNDENIABLE.`,
      outcome: "USP tested and working, clear value proposition that differentiates you from competitors",
      completionMessage: "You've verified your WEAPON works. Your USP is what will make people choose YOU. Tomorrow: we test all the other features.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 12,
      title: "Feature Testing",
      description: "Systematically test every feature in your app. Find the bugs before your users do.",
      phase: "Week 3: Make It Work",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Feature Test Suite",
      aiTaskDescription: "Create and run through a test checklist for every feature in your app.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How many features have bugs?",
      microDecisionOptions: JSON.stringify(["None - all working!", "1-2 minor issues", "Several need fixes", "Most have problems"]),
      reflectionQuestion: "Which feature are you most proud of after testing?",
      tip: "Test like a user, not a developer. Click every button. Try to break things. Enter weird data. If it breaks for you, it'll break for customers.",
      lesson: `Today you become your app's WORST enemy.

Click every button. Fill every form. Try to BREAK things. Because if YOU can break it, your USERS definitely will.

THE TESTING MINDSET:

Pretend you've never seen your app before. You're not the builder - you're a confused user who just landed on this thing.

- Can you figure out what to do?
- Do buttons actually do what they say?
- When something goes wrong, does it tell you WHY?

TRY TO BREAK IT:

Enter nothing. Submit empty forms.
Enter garbage. asdfasdfasdf into every field.
Enter EVERYTHING. Paste a novel into a text box.
Do things in the wrong order. Skip steps. Go backwards.

What happens? Does it crash? Does it give a helpful error? Does it just... do nothing?

THE STUFF THAT'S EASY TO MISS:

- Loading states - is there a spinner when things are happening?
- Success states - do you KNOW when something worked?
- Error states - when it fails, do you know WHY?
- Edge cases - what if someone enters an emoji? A really long name?

WHEN YOU FIND BUGS:

Write them down. Don't fix them yet. Finish testing first, THEN fix everything.

Unless it's completely broken - then fix it now.

THE GOAL:

By the end of today, you should be able to use your app like a REAL user and have confidence it won't embarrass you.

Break it now, so your users don't break it later.`,
      outcome: "All features tested, bugs identified and fixed, app is reliable and ready",
      completionMessage: "Your app has been TESTED. You know what works and what doesn't. That's more than most founders know when they launch. Tomorrow: we add the AI brain.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 13,
      title: "Add The AI Brain",
      description: "Integrate OpenAI or Claude API to make your app intelligent. This is what makes AI SaaS special.",
      phase: "Week 3: Make It Work",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "AI Integration",
      aiTaskDescription: "Connect OpenAI or Claude API to your app and create your first AI-powered feature.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What should AI do in your app?",
      microDecisionOptions: JSON.stringify(["Generate content", "Analyze/summarize data", "Answer questions", "Automate tasks"]),
      reflectionQuestion: "What manual task could AI do for your users that would make them say 'THIS IS AMAZING'?",
      tip: "The OpenAI API costs about $0.002 per request. That's 500 AI calls for $1. Don't overthink costs - just BUILD.",
      lesson: `Today your app gets a BRAIN.

This is what makes AI SaaS different from regular SaaS. Your app doesn't just store data or display things - it THINKS.

And here's the thing: Users EXPECT this now. It's 2025. An app without AI feels like a website from 2010.

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

Ask yourself: What manual task could the AI do that would make users say "THIS IS AMAZING"?

- Generate something for them?
- Analyze something for them?
- Summarize something for them?
- Suggest something for them?

Pick ONE thing. Get it working PERFECTLY. You can add more later.

THE COST REALITY:

OpenAI API is about $0.002 per request. That's 500 AI calls for $1. Don't overthink costs - just BUILD.

This is the feature that makes your app worth paying for. Make it good.`,
      outcome: "AI API integrated, first AI-powered feature working in your app",
      completionMessage: "Your app can THINK now. That's the core of AI SaaS - intelligence built in. Tomorrow: connecting other APIs you might need.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 14,
      title: "Connect APIs",
      description: "Add the external services your app needs - storage, analytics, or other integrations.",
      phase: "Week 3: Make It Work",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "API Connections",
      aiTaskDescription: "Identify and connect any additional APIs your app needs to function properly.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Which API does your app need most?",
      microDecisionOptions: JSON.stringify(["File storage (images, docs)", "Analytics (tracking)", "External data source", "None - AI was enough"]),
      reflectionQuestion: "What external service would make your app 10x more useful?",
      tip: "Don't add APIs you don't need. Each integration is another thing that can break. Only add what's ESSENTIAL for your core use case.",
      lesson: `APIs let you plug in superpowers you'd never build yourself.

But here's the CRITICAL question: Do you ACTUALLY need another API?

Most apps don't need much beyond what you already have. AI? Done. Database? Done. If your app works without adding more stuff - STOP. Don't add complexity for the sake of it.

WHEN YOU ACTUALLY NEED AN API:

- Users need to upload files? → You need storage (Cloudinary, S3)
- You need real-time external data? → You need that specific API
- You need to send emails? → We'll do that on Day 16

That's about it for most MVPs.

WHEN YOU DON'T NEED AN API (YET):

- Analytics → Add this AFTER launch, when you have users
- Payments → Add this when you're ready to charge
- Extra features → Add this when users ASK for it

THE RULE:

Only add what's ESSENTIAL for your core use case. Every API is another thing that can break. Every integration is another account to manage.

IF YOU DO NEED SOMETHING:

1. Sign up for the service
2. Get the API key
3. Add it to Replit Secrets
4. Tell Claude Code: "Integrate [service]. I need to [do what]. Use the API key from secrets."

Done.

THE HONEST TRUTH:

If you're not sure whether you need an API, you probably don't. Ship without it. Add it when users tell you they need it.

Simple apps are easier to build, easier to maintain, and easier to sell.`,
      outcome: "All necessary APIs connected, app has the integrations it needs to work",
      completionMessage: "Week 3 DONE. Your app has AI, it's tested, and it's connected to the services it needs. You have a WORKING product. Next week: the infrastructure that makes it ready for real users.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 4: INFRASTRUCTURE (Days 15-18)
    // ============================================
    {
      day: 15,
      title: "User Authentication",
      description: "Let users create accounts, log in, and have their own private data. Essential for any real SaaS.",
      phase: "Week 4: Infrastructure",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Auth Setup",
      aiTaskDescription: "Set up user authentication with Replit Auth or another auth provider.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What auth method do you prefer?",
      microDecisionOptions: JSON.stringify(["Replit Auth (easiest)", "Email + Password", "Google/Social login", "Magic link (passwordless)"]),
      reflectionQuestion: "How important is it that users have their own accounts in your app?",
      tip: "Replit Auth is the FASTEST way to add login. It works, it's secure, and it takes minutes. Start there unless you have a specific reason not to.",
      lesson: `Without authentication, everyone sees everyone's data.

That's bad. Let's fix it.

WHY YOU NEED AUTH:

1. Users can save their OWN stuff that only THEY can see
2. You can personalize the experience for each person
3. You can't charge someone if you don't know who they are
4. Apps without login feel sketchy and temporary

THE FASTEST OPTION (Just Do This):

Use Replit Auth. One-click setup. Secure. Handles everything.

Tell Claude Code:
"Add Replit Auth. Login button in the header. Show user's name when logged in. Logout button. Each user only sees their own data."

That's it. Auth done.

BUT WHAT IF...

"But users need a Replit account!" - Most don't care. For an MVP, this is FINE.

"But I want Google login!" - More setup. Do it later if users ask.

"But I want email/password!" - You handle password resets, security, all of it. More work for you. Skip this for now.

The goal is to get auth WORKING so you can move forward. You can always change it later.

TEST IT:

1. Sign up as a new user
2. Create some data
3. Log out
4. Log back in - is your data still there?
5. Log in as a DIFFERENT user - do you see the first user's data? (You shouldn't!)

If all that works, you're done.

Auth is table stakes. Not exciting. Just necessary. Get it working and move on.`,
      outcome: "User authentication working, users can sign up, log in, and have private data",
      completionMessage: "Your app has USERS now. Real accounts, real data, real privacy. Tomorrow: email setup so you can communicate with those users.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 16,
      title: "Email Setup",
      description: "Set up transactional emails - welcome emails, notifications, and password resets. Keep users engaged.",
      phase: "Week 4: Infrastructure",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Email Integration",
      aiTaskDescription: "Connect an email service to send transactional emails to your users.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What emails does your app need to send?",
      microDecisionOptions: JSON.stringify(["Welcome emails only", "Welcome + notifications", "Full transactional suite", "Not sure yet"]),
      reflectionQuestion: "What email would make a user think 'this app really cares about me'?",
      tip: "Resend is the easiest email API to set up. Free tier is generous. Start there.",
      lesson: `Email is how you stay connected to your users when they're NOT in your app.

Someone signs up → Welcome email.
Something important happens → Notification email.
They haven't been back → "We miss you" email.

Without email, you're just hoping they remember you exist. That's not a strategy.

THE ONLY EMAILS THAT MATTER (for now):

1. WELCOME EMAIL - When they sign up. "Hey, thanks for joining. Here's how to get started."

2. THAT'S IT - Seriously. Start with just one email. Add more when you have users.

THE SETUP (5 minutes):

Use Resend. It's free for 3,000 emails/month. That's more than enough.

1. Sign up at resend.com
2. Verify your domain (follow their steps)
3. Get API key
4. Add to Replit Secrets: RESEND_API_KEY

Then tell Claude Code:
"When a user signs up, send them a welcome email using Resend. Subject: Welcome to [Your App]. Body: [Your message]. Use the API key from secrets."

Done.

THE STUFF THAT DOESN'T MATTER YET:

Fancy HTML templates? Later.
Automated sequences? Later.
Analytics on opens/clicks? Later.

You just need ONE email working. The welcome email. Get that done, test it, move on.

PRO TIP:

Send a test email to yourself. Check your spam folder. If it ends up in spam, you have a domain verification issue. Fix it before launch.

Emails keep users coming back. Set it up. Keep it simple.`,
      outcome: "Email service connected, welcome and notification emails working",
      completionMessage: "Your app can EMAIL users now. Welcome emails, notifications, the works. Tomorrow: making the first-run experience great.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 17,
      title: "User Onboarding",
      description: "Create a smooth first-run experience. Help new users understand and love your app in the first 2 minutes.",
      phase: "Week 4: Infrastructure",
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

Get them to their first WIN as fast as humanly possible.

Not "show them features." Not "explain everything." Just help them DO something and feel successful.

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

What's the ONE thing a user needs to do to "get" your app?

That's your onboarding. Everything else is distraction.

Make them successful in 2 minutes or less.`,
      outcome: "Smooth onboarding flow that gets users to their first success quickly",
      completionMessage: "New users now have a clear path to success. That's the difference between an app people try once and an app people keep using. Tomorrow: seeing what's happening in your app.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 18,
      title: "Admin Dashboard",
      description: "Build a simple dashboard to see what's happening in your app. Users, activity, and key metrics.",
      phase: "Week 4: Infrastructure",
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

How many users do you have? How many signed up this week? Are people actually USING the thing or just signing up and leaving?

Right now, you probably don't know. Let's fix that.

THE SIMPLEST ADMIN DASHBOARD:

You don't need fancy graphs. You need FOUR numbers:

1. Total users (how many people have ever signed up)
2. New users this week (are people still finding you?)
3. Active users this week (are they coming back?)
4. Total [main actions] (are they doing the thing?)

That's it. Four numbers. You can add more later.

THE SETUP:

Tell Claude Code:
"Create an admin page at /admin. Only I can access it. Show me: total users, new users this week, active users this week, and total [actions]. Also show the last 20 [actions] with user and timestamp."

Done.

WHY THIS MATTERS:

Without data, you're flying blind. You THINK things are going well. You HOPE people like it.

With data, you KNOW:
- "Oh, 50 people signed up but only 5 came back" → Onboarding problem
- "People are signing up but not using the main feature" → Feature problem
- "Usage is growing every week" → Keep doing what you're doing

DATA TELLS YOU WHAT TO FIX.

This is the last piece of infrastructure. After this, your app is ready for real users.

Build the dashboard. Check it every day. Make decisions based on what you see, not what you hope.`,
      outcome: "Admin dashboard showing users, activity, and key metrics",
      completionMessage: "Week 4 DONE. Your app has real infrastructure - auth, email, onboarding, and admin. It's not a toy anymore. Next week: polish and launch.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 5: POLISH & LAUNCH (Days 19-21)
    // ============================================
    {
      day: 19,
      title: "Mobile Ready",
      description: "Make your app work beautifully on phones and tablets. Most users will access on mobile.",
      phase: "Week 5: Polish & Launch",
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

And if your app looks broken on mobile? They're GONE. They don't come back. They don't give you a second chance.

This isn't about being perfect. It's about being USABLE.

WHAT YOU'RE ACTUALLY TESTING:

1. DOES IT LOAD?
Open your app on your actual phone (not browser dev tools - your REAL phone). Does it load? Fast? Good.

2. CAN YOU READ IT?
Without pinching and zooming? Text should be readable without squinting.

3. CAN YOU TAP THE BUTTONS?
Are they big enough for a thumb? If you're missing buttons with your finger, they're too small.

4. DOES THE MAIN THING WORK?
Whatever your app DOES - can you do it on mobile? This is the only question that actually matters.

THE FAST FIX:

Open Claude Code and say:
"Test my app at 375px width. Fix anything that's broken. Make buttons at least 44px tall. Make text readable. No horizontal scrolling."

That's it. Don't overthink it.

HERE'S WHAT I WANT YOU TO REALISE:

You're not just playing around anymore. You're building a REAL product that works on ANY device. Most people never get this far. They have ideas. They have dreams. They have "someday" plans.

You have a product that's almost ready to sell.

Two more days. That's it. Two more days and you'll have something you can put a price tag on.

Let that sink in.`,
      outcome: "App works perfectly on mobile devices, responsive and touch-friendly",
      completionMessage: "Your app works on mobile now. You just unlocked the majority of potential users. Tomorrow: making it LOOK as good as it works.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 20,
      title: "Brand & Beauty",
      description: "Polish the visuals. Logo, colors, typography. Make it look like a product people would pay for.",
      phase: "Week 5: Polish & Launch",
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

Here's the truth: People judge your app in the first 3 seconds. Before they even USE it. They look at it and think "professional" or "amateur".

And that judgment directly affects what they'll pay.

THIS IS SIMPLER THAN YOU THINK:

1. PICK ONE COLOR
Seriously. Just one main color. Blue, green, purple, whatever. Use it for buttons, links, and accents. Everything else is white/gray backgrounds and dark text.

That's your brand. Done.

2. TEXT LOGO IS FINE
You don't need a designer. Your app name in a clean font IS a logo. Canva takes 5 minutes. Don't overthink this.

3. MAKE IT CONSISTENT
Same button style everywhere. Same card style everywhere. Same spacing everywhere. CONSISTENCY is what makes things look professional - not fancy graphics.

THE QUICK FIX:

Tell Claude Code:
"Make my app look consistent. Primary color is [pick one]. Same button style, same card style, same spacing on every page. Add a simple text logo in the header."

That's it. 15 minutes max.

LOOK AT WHAT YOU'VE BUILT.

Seriously. Open your app right now and look at it.

This isn't a side project anymore. This isn't a "maybe someday" thing. This is a branded, professional-looking SaaS product that you built in 20 days.

Tomorrow you LAUNCH.

And after that? Well, having a product is just the first step. Turning it into a BUSINESS is a different challenge entirely.

But let's get through tomorrow first. One day at a time.`,
      outcome: "App has consistent branding, logo, and professional visual design",
      completionMessage: "Your app LOOKS like a real product now. Consistent, polished, credible. Tomorrow: we LAUNCH.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 21,
      title: "Launch Day",
      description: "Final checks, real costs, and GO LIVE. You're about to launch your AI SaaS.",
      phase: "Week 5: Polish & Launch",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Launch Checklist",
      aiTaskDescription: "Final pre-launch checklist and deployment to production.",
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

If you said YES to all of these - you're ready to launch.

If you said NO to any of them - fix it now. Don't launch broken.

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

Here's the thing nobody tells you: Building a product is actually the EASY part.

Turning that product into a BUSINESS? That's where most people get stuck.

- How do you get your first paying customers?
- How do you price it?
- How do you market it when you're not a marketer?
- How do you grow without burning out?

These are the questions that separate products that make money from products that sit there collecting dust.

I've helped dozens of SaaS founders navigate this exact transition. From "I have a product" to "I have a profitable business."

If you want help with the next step - getting customers, pricing strategy, marketing that actually works, and building a sustainable business around what you've built - let's talk.

Book a call: www.mattwebley.com/workwithmatt

But first: LAUNCH THIS THING.

You've earned it.`,
      outcome: "App is LIVE and accessible to the world. You launched!",
      completionMessage: "🚀 YOU LAUNCHED! 21 days. From idea to live product. You did what most people only dream about. The journey is just beginning, but you've proven you can BUILD. Congratulations!",
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
