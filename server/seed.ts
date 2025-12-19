import { db } from "./db";
import { dayContent, badges } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed badges
  console.log("Creating badges...");
  const badgeData = [
    {
      name: "First Steps",
      description: "Completed Day 1: Found Your Million Dollar Idea",
      icon: "🎯",
      triggerType: "day_completed",
      triggerValue: 1,
    },
    {
      name: "Clarifier",
      description: "Completed Week 1: Idea & Planning (Days 1-7)",
      icon: "🔍",
      triggerType: "day_completed",
      triggerValue: 7,
    },
    {
      name: "Builder",
      description: "Completed Week 2: Building Your MVP (Days 8-14)",
      icon: "🏗️",
      triggerType: "day_completed",
      triggerValue: 14,
    },
    {
      name: "Integrator",
      description: "Completed Week 3: APIs, Integrations & Polish (Days 15-21)",
      icon: "⚡",
      triggerType: "day_completed",
      triggerValue: 21,
    },
    {
      name: "Feature Master",
      description: "Completed Week 4: Advanced Features & Polish (Days 22-28)",
      icon: "✨",
      triggerType: "day_completed",
      triggerValue: 28,
    },
    {
      name: "The Finisher",
      description: "Completed all 30 days!",
      icon: "🏆",
      triggerType: "day_completed",
      triggerValue: 30,
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
      description: "21-day streak - No missed days!",
      icon: "💎",
      triggerType: "streak",
      triggerValue: 21,
    },
  ];

  for (const badge of badgeData) {
    await db.insert(badges).values(badge).onConflictDoNothing();
  }

  // Seed day content (30 days)
  console.log("Creating day content...");
  const dayContentData = [
    // ============================================
    // WEEK 1: IDEA & PLANNING (Days 1-7)
    // ============================================
    {
      day: 1,
      title: "Choosing Your PERFECT $100K+ Idea",
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
1. They are good at different things (and that changes, often)
2. You can play them off against each other - get ONE to write something, pass it to the OTHER to critique

I want you to start using ChatGPT and Claude for EVERYTHING you do...
- Need help? Ask it.
- Need an opinion from a user's perspective? Ask it.
- Want a second opinion? Drop output from one LLM into the other.

STOP trying to do EVERYTHING yourself. The THINKING. The WRITING. The DESIGNING... EVERYTHING. Use AI for MOST things. It's SMARTER and BETTER because it has the COMBINED knowledge of all of HUMANITY.`,
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
      completionMessage: "Week 1 DONE. You have a validated idea, a clear plan, tools set up, and you've started building. While others are still 'thinking about it,' you're DOING it. Next week: we build the MVP.",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 2: BUILDING YOUR MVP (Days 8-14)
    // ============================================
    {
      day: 8,
      title: "Watch The MAGIC Happen",
      description: "Drop your PRD into Replit and watch AI build your ENTIRE app structure in minutes. This is the moment it gets REAL.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "First Build Session",
      aiTaskDescription: "Paste your PRD into Replit Agent and watch it build. Then tell us what you see!",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What excites you MOST about today?",
      microDecisionOptions: JSON.stringify(["Seeing my idea become REAL", "Finding out if this actually works", "Getting past the 'planning' phase", "Proving I can actually do this"]),
      reflectionQuestion: "You just built something REAL. How does that feel?",
      tip: "Don't try to UNDERSTAND everything Replit builds. You don't need to! You just need to DIRECT it. You're the BOSS, not the employee.",
      lesson: `Here's the moment you've been waiting for. Today your idea becomes REAL.

The BRUTAL truth? Most people NEVER get here. They plan forever. They "research" forever. They THINK about building but never BUILD.

Not you. Today you BUILD.

STEP 1: Open Replit
Go to replit.com → Click "Create Repl" → Select "Agent"
This is your AI builder. It's SMARTER than most dev teams and works 24/7.

STEP 2: Feed It Your PRD
Remember that PRD from Day 6? PASTE THE WHOLE THING into the Agent chat.
Don't overthink it. Just paste it and hit enter.

STEP 3: Watch The Magic
Seriously - just WATCH. The Agent will:
- Create your entire project structure
- Set up your database
- Build your screens
- Add navigation
- Style everything

This would take a human dev team WEEKS. The Agent does it in MINUTES.

STEP 4: Click Around
Once it's done, CLICK THROUGH YOUR APP. Does it load? Can you see screens? Does it FEEL like what you imagined?

It won't be perfect. That's fine. You're going to make it YOURS over the next few days.

KEY INSIGHT: You don't need to understand HOW it built this. You just need to know WHAT you want to change. That's tomorrow.`,
      outcome: "Your PRD turned into a REAL working app structure you can click through",
      completionMessage: "You just did something 99% of 'wantrepreneurs' never do - you actually BUILT something. It's rough, it's early, but it's REAL. Tomorrow we make it yours.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 9,
      title: "Make It YOURS (Customization Day)",
      description: "Your app looks generic right now. Today we make it UNMISTAKABLY yours - branding, colors, copy, personality.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Brand Your App",
      aiTaskDescription: "Tell us your brand vibe and we'll generate the perfect customization prompts for Replit.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What FEELING should your app give users?",
      microDecisionOptions: JSON.stringify(["Professional & Trustworthy", "Fun & Friendly", "Bold & Powerful", "Simple & Clean"]),
      reflectionQuestion: "When users land on your app, what's the FIRST impression you want them to have?",
      tip: "Your app doesn't need to look AMAZING. It needs to look CREDIBLE. Users decide in 3 seconds if they trust your app. Make those 3 seconds count.",
      lesson: `Right now your app looks like every other AI-generated app. GENERIC. FORGETTABLE.

Today we fix that.

Here's the truth: Users judge your app in 3 SECONDS. Before they read anything, before they try anything, they FEEL something. That feeling determines if they stay or bounce.

THE 4 THINGS THAT MAKE YOUR APP "YOURS":

1. COLORS
Pick 2-3 colors MAX. One primary (buttons, links), one background, one accent.
Don't overthink this. Go to coolors.co, find a palette you like, DONE.

2. LOGO/NAME PLACEMENT
Your logo or app name should be visible on EVERY screen. Top left corner. Simple. Consistent.

3. COPY (THE WORDS)
Generic: "Welcome to Dashboard"
YOURS: "Let's make some money, [Name]!"

The words should sound like YOU wrote them, not a robot.

4. PERSONALITY
Is your app serious? Playful? Motivational? Pick ONE personality and be CONSISTENT.

THE CUSTOMIZATION PROMPT:
Copy this into Replit Agent:

"I want to customize the look and feel of my app:

COLORS:
- Primary color: [YOUR COLOR - e.g., #3B82F6]
- Background: [YOUR COLOR - e.g., #F8FAFC]
- Accent: [YOUR COLOR - e.g., #10B981]

BRANDING:
- Add my app name '[YOUR APP NAME]' to the top left of every page
- Use the font [Inter/Poppins/whatever you like]

COPY CHANGES:
- Change 'Dashboard' to '[YOUR CUSTOM NAME]'
- Change 'Welcome' to '[YOUR CUSTOM GREETING]'
- Make all button text more action-oriented

Apply these changes across the ENTIRE app consistently."

THAT'S IT. Watch your app transform from generic to YOURS.`,
      outcome: "Your app now has YOUR brand - colors, copy, and personality that's unmistakably yours",
      completionMessage: "Generic is DEAD. Your app now looks and feels like YOURS. When users land on it, they'll know immediately this isn't some template - it's a REAL product. Tomorrow: we build the thing people PAY for.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 10,
      title: "Build The Money Feature",
      description: "Today you build THE thing people will PAY for. The ONE feature that makes your app worth money.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Core Feature Builder",
      aiTaskDescription: "Define your money-making feature and we'll generate the perfect build prompt.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What does your app help people DO?",
      microDecisionOptions: JSON.stringify(["SAVE time on something tedious", "MAKE more money", "AVOID costly mistakes", "GET something they couldn't before"]),
      reflectionQuestion: "If your app did ONLY this one thing, would people still pay? If yes, you've found your core.",
      tip: "Features don't make money. SOLUTIONS make money. People don't pay for features - they pay for outcomes. Focus on the OUTCOME.",
      lesson: `Listen up. This is THE most important day of the challenge.

Everything else - the branding, the extra features, the polish - is DECORATION. THIS is what people PAY for.

THE MONEY FEATURE FORMULA:
Your core feature = The MAIN thing users come to DO
Without this, your app is worthless. WITH this, everything else is a bonus.

ASK YOURSELF:
"People will pay me $X/month to _____________"

Fill in that blank. THAT'S your core feature.

EXAMPLES:
- "...to automatically generate social media posts from their blog"
- "...to track their Amazon FBA inventory across warehouses"
- "...to find winning products before their competitors"
- "...to get AI to write their email sequences"

NOT EXAMPLES (too vague):
- "...to have a nice dashboard" (that's not a feature, that's decoration)
- "...to manage things" (WHAT things?)
- "...to be more productive" (HOW specifically?)

BUILD IT NOW:
Copy this into Replit Agent:

"Build my core feature: [YOUR ONE-SENTENCE DESCRIPTION]

Here's what it needs to do:
1. User inputs: [WHAT THEY PROVIDE]
2. Processing: [WHAT HAPPENS TO IT]
3. Output: [WHAT THEY GET BACK]

Make it work end-to-end. I want to be able to:
- [STEP 1 - e.g., 'Enter my blog URL']
- [STEP 2 - e.g., 'Click Generate']
- [STEP 3 - e.g., 'See 5 social posts ready to copy']

Focus on making this ONE flow work perfectly. Don't build anything else."

TEST IT IMMEDIATELY:
Did it work? Did you get the output you expected?
If yes: CELEBRATE. You just built the thing people will pay for.
If no: Tell the Agent what's wrong and have it fix it. Don't move on until it WORKS.`,
      outcome: "Your CORE money-making feature is built and working end-to-end",
      completionMessage: "You just built the thing that makes your app worth money. Not features. Not decoration. The ACTUAL thing people will pay for. That's HUGE. Tomorrow: what to do when things break.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 11,
      title: "When Things Break (5-Min Fixes)",
      description: "Something WILL break. Here's exactly how to fix it in 5 minutes or less - every single time.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Bug Squasher",
      aiTaskDescription: "Tell us what's broken and we'll generate the exact fix prompt you need.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's going wrong?",
      microDecisionOptions: JSON.stringify(["Something LOOKS wrong (colors, layout, text)", "Something DOESN'T WORK (buttons, forms, actions)", "I see an ERROR message", "It's just... WEIRD"]),
      reflectionQuestion: "Every bug you fix makes you better at this. What did this one teach you?",
      tip: "NEVER spend more than 5 minutes on a bug yourself. If it's not fixed in 5 minutes, ASK THE AI. It's seen this bug a thousand times before.",
      lesson: `Things WILL break. That's not failure - that's BUILDING.

The difference between people who ship and people who quit? People who ship know how to fix things FAST.

Here's the BRUTAL truth: Professional developers spend 50% of their time debugging. But YOU have something they didn't have 2 years ago - AI that's seen EVERY bug before.

THE 5-MINUTE FIX FORMULA:

STEP 1: IDENTIFY (30 seconds)
What TYPE of problem is it?
- VISUAL: Something looks wrong
- FUNCTIONAL: Something doesn't work
- ERROR: Red text or scary messages
- DATA: Things don't save or load

STEP 2: SCREENSHOT + DESCRIBE (1 minute)
Take a screenshot of the problem.
Write ONE sentence: "I expected X but got Y"

STEP 3: ASK AI (2 minutes)
Paste this into Replit Agent:

"I have a bug:
[SCREENSHOT or PASTE THE ERROR]

Expected: [WHAT SHOULD HAPPEN]
Actual: [WHAT'S HAPPENING]

Find and fix this issue."

STEP 4: TEST (1 minute)
Did it work?
YES → Move on, you're done
NO → Tell the Agent: "That didn't fix it. It's still doing [X]. Try a different approach."

STEP 5: ESCALATE (only if needed)
If Replit can't fix it after 2-3 tries:
- Copy the error and your description
- Paste into Claude or ChatGPT
- Ask for an explanation + fix
- Paste the fix back into Replit

THE GOLDEN RULE:
Never spend more than 5 minutes stuck. The AI has seen your bug before. ALWAYS ask for help.

Bugs are SPEED BUMPS, not roadblocks. Now you know how to fly over them.`,
      outcome: "You can fix ANY bug in 5 minutes or less using the AI fix formula",
      completionMessage: "You just learned the #1 skill that separates shippers from quitters - fixing things FAST. Bugs don't scare you anymore. Tomorrow: making your app actually LOOK good.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 12,
      title: "Make It LOOK Professional",
      description: "Your app works. Now let's make it LOOK like something people would pay for. Zero design skills required.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Design Upgrade",
      aiTaskDescription: "Tell us what screens need work and we'll generate the design upgrade prompts.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's the BIGGEST visual problem with your app right now?",
      microDecisionOptions: JSON.stringify(["It looks CLUTTERED (too much stuff)", "It looks BORING (too plain)", "It looks AMATEUR (inconsistent styling)", "It looks CONFUSING (hard to navigate)"]),
      reflectionQuestion: "If you showed your app to a potential customer RIGHT NOW, what would you be embarrassed about?",
      tip: "Good design isn't about being PRETTY. It's about being CLEAR. If users know what to do without thinking, that's good design.",
      lesson: `Here's the truth about design: It's not about talent. It's about STEALING.

Every good-looking app you've ever seen? They STOLE their design from somewhere else. Spacing, colors, layouts - it's all been done before.

Today, YOU steal from the best.

THE 5 THINGS THAT MAKE APPS LOOK PRO:

1. WHITESPACE
Most amateur apps are CRAMPED. Everything jammed together.
Fix: Add MORE space between elements. When you think there's enough, add MORE.

2. CONSISTENCY
Same colors, same fonts, same button styles EVERYWHERE.
Fix: Pick ONE style and stick to it across every screen.

3. HIERARCHY
The most important thing should be the BIGGEST and most VISIBLE.
Fix: Make your main action button 2x bigger than everything else.

4. ALIGNMENT
Everything should line up. Left edges. Right edges. Centers.
Fix: Use a grid. Everything snaps to the same invisible lines.

5. CONTRAST
Important things should POP. Less important things should fade.
Fix: Primary actions = bold colors. Secondary actions = subtle colors.

THE DESIGN UPGRADE PROMPT:
Paste this into Replit Agent:

"I want to improve the design of my app. Apply these changes:

WHITESPACE:
- Add more padding inside all cards and containers
- Add more spacing between sections
- Give elements room to breathe

CONSISTENCY:
- Use the same border radius on all cards and buttons
- Use the same shadow style everywhere
- Make all headings the same size per level (h1, h2, h3)

HIERARCHY:
- Make the primary action button on each page bigger and bolder
- Make secondary actions smaller and less prominent
- Use larger text for important information

ALIGNMENT:
- Align all form labels consistently
- Make sure cards in grids are the same height
- Center-align or left-align consistently (pick one)

Apply these changes across the ENTIRE app."

DO THIS NOW. Then look at your app. It will look 10x more professional.`,
      outcome: "Your app now LOOKS like something people would pay money for",
      completionMessage: "Your app doesn't just WORK now - it LOOKS professional. First impressions matter. You just made sure yours is a good one. Tomorrow: adding your second killer feature.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 13,
      title: "Add Your Second KILLER Feature",
      description: "One feature is a tool. Two features is a PRODUCT. Today you level up.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Feature #2 Builder",
      aiTaskDescription: "Pick your second feature and we'll generate the complete build prompt.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What would make your core feature MORE valuable?",
      microDecisionOptions: JSON.stringify(["HISTORY - See past results/activity", "SETTINGS - Customize how it works", "EXPORT - Get data out (PDF, CSV, share)", "INSIGHTS - Analytics and trends"]),
      reflectionQuestion: "If a user LOVED feature #1, what would make them say 'WOW this app is amazing'?",
      tip: "Feature #2 should make Feature #1 BETTER, not distract from it. Think: What would a power user want after they've used the core feature 10 times?",
      lesson: `One feature = a tool.
Two features = a PRODUCT.

Today you go from tool to product.

THE FEATURE #2 RULE:
Your second feature should make your FIRST feature more valuable. It's not a separate thing - it's an ENHANCEMENT.

EXAMPLES THAT WORK:
- Core = generate content → #2 = save/organize past generations
- Core = analyze data → #2 = export results as PDF/share link
- Core = track something → #2 = see trends and insights over time
- Core = create something → #2 = templates to start faster

EXAMPLES THAT DON'T WORK:
- Core = generate content → #2 = calendar feature (unrelated)
- Core = track fitness → #2 = recipe database (different product)

PICK YOUR FEATURE #2:
Based on your core feature, which of these adds the MOST value?
1. HISTORY - Users can see everything they've done before
2. SETTINGS - Users can customize how things work
3. EXPORT - Users can get their data out (share, download)
4. INSIGHTS - Users can see patterns and analytics

BUILD IT NOW:
Paste this into Replit Agent:

"Add Feature #2 to my app: [YOUR FEATURE DESCRIPTION]

This feature should:
1. Be accessible from [WHERE - e.g., 'a new tab in the sidebar' or 'a button on the results page']
2. Show [WHAT DATA - e.g., 'all past generations with dates']
3. Let users [ACTIONS - e.g., 'click to view details, delete old ones, or re-run']

Make sure:
- It connects to the existing data from my core feature
- The navigation makes sense (user can easily get there and back)
- It matches the existing design style

Build this complete feature."

TEST IMMEDIATELY:
1. Does your core feature still work? (DON'T BREAK IT!)
2. Does the new feature work?
3. Do they connect properly?
4. Can you navigate between them easily?

If anything broke, use your Day 11 bug-fixing skills. Don't panic.`,
      outcome: "Your app now has TWO features that work together - you have a real PRODUCT",
      completionMessage: "You now have a PRODUCT, not just a tool. Two features working together. This is what separates side projects from real SaaS businesses. Tomorrow: the safety net that protects everything you've built.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 14,
      title: "Protect Your Work FOREVER",
      description: "You've built something REAL. Now let's make sure you NEVER lose it. Set up your safety net in 5 minutes.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Safety Net Setup",
      aiTaskDescription: "Set up version control so you can experiment fearlessly.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What scares you most about making changes?",
      microDecisionOptions: JSON.stringify(["Breaking something that WORKS", "Losing HOURS of progress", "Not being able to UNDO", "Not knowing WHAT changed"]),
      reflectionQuestion: "After this, you can experiment FEARLESSLY. How does that change what you're willing to try?",
      tip: "The best builders aren't afraid to experiment because they KNOW they can always go back. That's not bravery - it's PREPARATION.",
      lesson: `You've built something REAL over the past 7 days. Let's make sure you NEVER lose it.

Here's what separates amateurs from pros:

AMATEURS: "I'm afraid to change anything because I might break it"
PROS: "I'll try anything because I can always undo it"

Today you become a pro.

THE SAFETY NET (5 MINUTES):

STEP 1: Connect to GitHub (if not done already)
In Replit: Tools → Git → Connect to GitHub
This backs up EVERYTHING to the cloud. Even if Replit explodes, your code is safe.

STEP 2: Create Your First "Save Point"
In Replit, type in the Git panel:
- Add a message: "Working MVP with 2 features"
- Click "Commit All"
- Click "Push"

That's it. Your work is now PROTECTED FOREVER.

THE CHECKPOINT HABIT:
From now on, BEFORE you make any big change:

1. Ask yourself: "Would I be sad if I lost what I have now?"
2. If YES → Create a checkpoint (commit + push)
3. Then make your change FEARLESSLY

WHEN TO CHECKPOINT:
✓ Something finally WORKS
✓ BEFORE adding a new feature
✓ BEFORE trying to fix something weird
✓ At the END of every build session
✓ Anytime you think "I don't want to lose this"

THE UNDO BUTTON:
If you break something badly:
1. Don't panic
2. In Replit Git panel, find your last good commit
3. Click "Revert to this commit"
4. You're back to working code
5. Try a different approach

This takes 30 seconds and will save you HOURS of frustration.

🎉 WEEK 2 COMPLETE!

Look at what you've accomplished:
- Day 8: Built your first REAL app
- Day 9: Made it YOURS with branding
- Day 10: Built the MONEY feature
- Day 11: Learned to fix ANYTHING in 5 minutes
- Day 12: Made it LOOK professional
- Day 13: Added a second KILLER feature
- Day 14: Protected it FOREVER

You now have a working MVP. A REAL product. Most people never get this far.`,
      outcome: "Your work is protected forever - you can now experiment fearlessly",
      completionMessage: "WEEK 2 COMPLETE! You have a working MVP with two features, professional design, and it's backed up forever. You're not dreaming about building a business anymore - you're DOING it. Next week: we add the superpowers (APIs, AI features, and more).",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 3: SUPERPOWERS (Days 15-21)
    // ============================================
    {
      day: 15,
      title: "Unlock The SUPERPOWERS (APIs Explained)",
      description: "APIs let you plug in features that would take YEARS to build yourself. AI, payments, emails - all in minutes.",
      phase: "Week 3: Superpowers",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Superpower Selection",
      aiTaskDescription: "Pick which superpowers your app needs and we'll show you exactly how to add them.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Which SUPERPOWER does your app need most?",
      microDecisionOptions: JSON.stringify(["AI Brain (OpenAI) - make it smart", "Money Collection (Stripe) - get paid", "Communication (Email/SMS) - reach users", "Storage (Files/Images) - save stuff"]),
      reflectionQuestion: "What's ONE feature that would make your app 10x more valuable - but you have NO idea how to build?",
      tip: "APIs are like hiring specialists. Need AI? Hire OpenAI. Need payments? Hire Stripe. They do the hard work, you just connect the wires.",
      lesson: `Time to give your app SUPERPOWERS.

Right now your app can only do what Replit built. That's like having a car with no engine. Today we add the engine.

WHAT THE HELL IS AN API?

Simple version: An API lets your app USE other people's technology.

- OpenAI spent BILLIONS building AI. You can use it for $0.002 per request.
- Stripe spent YEARS building payment systems. You can use it for 2.9% + 30¢.
- Resend built email infrastructure. You can send 3,000 emails/month FREE.

You don't need to build ANY of this. You just PLUG IT IN.

THE SUPERPOWERS AVAILABLE TO YOU:

🧠 AI BRAIN (OpenAI/Claude API)
- Generate content
- Analyze data
- Answer questions
- Summarize text
- The possibilities are ENDLESS

💰 MONEY COLLECTION (Stripe)
- Accept credit cards
- Manage subscriptions
- Handle refunds
- Send invoices

📧 COMMUNICATION (Resend/Twilio)
- Send emails that hit INBOXES (not spam)
- Send SMS notifications
- Password reset emails
- Welcome sequences

📁 STORAGE (AWS S3/Cloudinary)
- User file uploads
- Image storage
- Document management

HOW TO ADD ANY API:
1. Sign up for the service
2. Get your API key
3. Store it in Replit Secrets (NEVER in code!)
4. Tell Replit Agent: "Integrate [API NAME] using my key in secrets"

That's it. The Agent knows how to connect them all.

This week, we're adding the superpowers that turn your app from "interesting" to "I NEED this."`,
      outcome: "You understand APIs and know exactly which superpowers your app needs",
      completionMessage: "You now see the POSSIBILITIES. APIs are how small teams build products that compete with giants. Tomorrow: we add your first superpower - AI.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 16,
      title: "Give Your App A BRAIN (AI Integration)",
      description: "Add AI-powered features that make your app SMART. This is the stuff that makes people say 'WOW'.",
      phase: "Week 3: Superpowers",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "AI Brain Setup",
      aiTaskDescription: "Connect OpenAI to your app and build your first AI-powered feature.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What should AI DO in your app?",
      microDecisionOptions: JSON.stringify(["GENERATE content (text, ideas, suggestions)", "ANALYZE data (insights, summaries, scores)", "ANSWER questions (chatbot, help, support)", "AUTOMATE tasks (processing, sorting, tagging)"]),
      reflectionQuestion: "What manual task could AI do for your users that would make them say 'THIS IS AMAZING'?",
      tip: "The OpenAI API costs about $0.002 per request. That's 500 AI calls for $1. Don't overthink costs - just BUILD.",
      lesson: `Today your app gets a BRAIN.

This is what separates "just another tool" from "I can't live without this."

THE AI INTEGRATION (10 MINUTES):

STEP 1: Get Your API Key
Go to platform.openai.com
Click "API Keys" → "Create new secret key"
Copy it somewhere safe (you'll only see it once!)

STEP 2: Store It In Replit
In Replit: Tools → Secrets
Add new secret: OPENAI_API_KEY = [paste your key]
NEVER put API keys in your code. EVER. That's how you get hacked.

STEP 3: Add Your First AI Feature
Copy this into Replit Agent:

"Add an AI-powered feature to my app:

When users [TRIGGER - e.g., 'click the Generate button']:
1. Take their input: [WHAT INPUT - e.g., 'the text in the main textarea']
2. Send it to OpenAI with this instruction: [WHAT TO DO - e.g., 'Summarize this in 3 bullet points']
3. Display the result: [WHERE - e.g., 'in a new card below the input']

Use the OpenAI API key from secrets (OPENAI_API_KEY).
Add a loading state while it's processing.
Handle errors gracefully."

THAT'S IT. Your app now has AI.

EXAMPLE AI FEATURES BY APP TYPE:

Content tool → "Generate 5 headline variations"
Analytics tool → "Explain this data in plain English"
Research tool → "Summarize these findings"
Productivity tool → "Suggest next steps based on progress"
E-commerce tool → "Write product descriptions from bullet points"

THE MAGIC FORMULA:
User gives INPUT → AI processes with INSTRUCTION → User gets OUTPUT

Pick ONE feature. Build it. Test it. Watch users' faces when they see it work.

AI is no longer impressive by itself. What's impressive is AI that solves YOUR users' specific problem in a way they didn't know was possible.`,
      outcome: "Your app has AI - at least one feature that uses OpenAI to do something SMART",
      completionMessage: "Your app just got a brain. This is the moment it stops being 'another tool' and starts being something SPECIAL. Tomorrow: getting paid.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 17,
      title: "Get PAID (Stripe Integration)",
      description: "Time to make MONEY. Set up Stripe so you can actually charge for your SaaS.",
      phase: "Week 3: Superpowers",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Payment Setup",
      aiTaskDescription: "Connect Stripe and set up your pricing tiers.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How will you charge?",
      microDecisionOptions: JSON.stringify(["Monthly subscription ($X/month)", "Annual subscription (discount for yearly)", "One-time payment + subscription", "Freemium (free tier + paid upgrade)"]),
      reflectionQuestion: "What price would make you think 'Yes, people will pay that' AND 'Yes, that's worth my time'?",
      tip: "START CHEAP. You can always raise prices later. Getting your FIRST paying customer is more important than maximizing revenue on day one.",
      lesson: `Today we make you MONEY.

Everything else is decoration. If people don't pay, you don't have a business. You have a hobby.

THE STRIPE SETUP (15 MINUTES):

STEP 1: Create Your Stripe Account
Go to stripe.com → Sign up
You can start in TEST MODE (no real money yet)

STEP 2: Create Your Product & Prices
In Stripe Dashboard:
- Products → Add Product
- Name it (e.g., "Pro Plan")
- Add pricing (e.g., $29/month)
- Copy the Price ID (starts with price_)

STEP 3: Store Your Keys
In Replit Secrets, add:
- STRIPE_SECRET_KEY = sk_test_... (from Stripe)
- STRIPE_PUBLISHABLE_KEY = pk_test_...

STEP 4: Tell The Agent
Copy this into Replit Agent:

"Add Stripe payment integration:

1. Create a pricing page showing my plans:
   - [PLAN NAME]: $[PRICE]/month - [FEATURES]
   - [PLAN NAME]: $[PRICE]/month - [FEATURES]

2. When users click 'Subscribe':
   - Create a Stripe Checkout session
   - Redirect to Stripe's hosted checkout
   - On success, redirect back and update their subscription status

3. Add a webhook to handle:
   - Successful payments
   - Failed payments
   - Subscription cancellations

Use my Stripe keys from secrets."

PRICING PSYCHOLOGY:

Don't overthink this. Here's what works for new SaaS:

STARTER PRICING:
- Basic: $19-29/month (entry point)
- Pro: $49-79/month (most popular)
- Enterprise: $149+/month (for big fish)

THE ANCHOR TRICK:
Your middle tier should be the one you WANT people to buy.
Make it look like the obvious choice between cheap and expensive.

IMPORTANT: Test in TEST MODE first!
Use Stripe's test card: 4242 4242 4242 4242
Go through the entire flow as a user.
Only switch to LIVE keys when everything works.

Tomorrow: making sure emails actually hit inboxes.`,
      outcome: "Stripe is connected - you can accept real payments for your SaaS",
      completionMessage: "Your app can now make MONEY. This is huge. You're not building a side project anymore - you're building a BUSINESS. Tomorrow: email integration so you can actually communicate with customers.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 18,
      title: "Emails That Actually ARRIVE",
      description: "Set up email so your app can send welcome emails, password resets, and notifications that hit INBOXES, not spam.",
      phase: "Week 3: Superpowers",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Email Setup",
      aiTaskDescription: "Connect Resend for transactional emails that actually get delivered.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's the MOST important email your app will send?",
      microDecisionOptions: JSON.stringify(["Welcome email (first impression)", "Password reset (critical for trust)", "Notifications (keep users engaged)", "Receipts/Invoices (for payments)"]),
      reflectionQuestion: "Think about an app you love. What email from them made you feel like they 'get it'?",
      tip: "Use Resend. It's free for 3,000 emails/month and takes 5 minutes to set up. No excuses.",
      lesson: `Your app needs to TALK to users. Email is how.

Without proper email:
- Password resets don't work
- Welcome emails go to spam
- You can't notify users of anything
- You look unprofessional

THE EMAIL SETUP (10 MINUTES):

STEP 1: Create Resend Account
Go to resend.com → Sign up (free tier is plenty to start)

STEP 2: Get Your API Key
Dashboard → API Keys → Create API Key
Copy it.

STEP 3: Store It Securely
In Replit Secrets: RESEND_API_KEY = [your key]

STEP 4: Tell The Agent
Copy this into Replit Agent:

"Set up email with Resend (API key in secrets as RESEND_API_KEY):

1. Welcome email - send when user signs up:
   - From: hello@[yourdomain].com
   - Subject: Welcome to [APP NAME]!
   - Body: Friendly welcome, what they can do, one clear CTA

2. Password reset email:
   - Include secure reset link
   - Link expires in 1 hour
   - Clear instructions

3. General notification function:
   - Reusable for any future emails
   - Takes: to, subject, body

Make emails look professional with proper formatting."

DOMAIN VERIFICATION (Optional but recommended):
If you want to send from your own domain (not @resend.dev):
- Go to Resend → Domains → Add Domain
- Add the DNS records they give you
- Takes 24-48 hours to verify

PRO TIP: Write emails like you're talking to ONE person, not "Dear Valued Customer." Be human.

EMAILS THAT WORK:
❌ "Your account has been successfully created. Please log in to continue."
✅ "You're in! 🎉 Here's what to do first..."

❌ "Click here to reset your password."
✅ "Forgot your password? No worries - click below to get back in."

Make every email feel like it came from a human who gives a damn.`,
      outcome: "Emails working - welcome emails, password resets, and notifications that actually arrive",
      completionMessage: "Your app can now communicate with users like a real business. Emails land in inboxes, not spam. That's professionalism. Tomorrow: user accounts and security.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 19,
      title: "Lock It DOWN (Authentication)",
      description: "Add user accounts - signup, login, password reset. Keep the bad guys out and the good guys in.",
      phase: "Week 3: Superpowers",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "User Accounts Setup",
      aiTaskDescription: "Set up authentication so users can create accounts and log in securely.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How should users sign up?",
      microDecisionOptions: JSON.stringify(["Email + Password (simple & universal)", "Google Sign-In (one-click easy)", "Magic Link (no password needed)", "All of the above (user choice)"]),
      reflectionQuestion: "What's the fastest way to get users from 'interested' to 'using your app'?",
      tip: "Start with email + password. Add social login later if you want. Don't overcomplicate your first version.",
      lesson: `Your app needs to know WHO is using it.

Without authentication:
- Anyone can see anyone's data
- You can't personalize anything
- You can't charge specific users
- You have no idea who's using your product

THE AUTH SETUP (10 MINUTES):

Tell Replit Agent:

"Set up user authentication:

1. SIGNUP
   - Email and password
   - Validate email format
   - Password minimum 8 characters
   - Send welcome email after signup

2. LOGIN
   - Email and password
   - Remember me option
   - Redirect to dashboard after login

3. PASSWORD RESET
   - Send reset link via email
   - Link expires in 1 hour
   - Confirm new password matches

4. PROTECTION
   - Protect all dashboard routes
   - Redirect non-logged-in users to login
   - Show current user's name in the header

5. LOGOUT
   - Clear session
   - Redirect to homepage

Hash all passwords securely. Never store plain text passwords."

THAT'S IT. The Agent knows how to do this properly.

SECURITY BASICS (stuff the Agent handles):
✓ Passwords hashed (bcrypt)
✓ Sessions expire after inactivity
✓ HTTPS (Replit does this automatically)
✓ Reset links are one-time use

TEST THE FLOW:
1. Sign up with a new email
2. Log out
3. Log back in
4. Request password reset
5. Use the reset link
6. Log in with new password

If all that works, you're good.

OPTIONAL UPGRADES (not for MVP):
- Google/GitHub sign-in
- Two-factor authentication
- Email verification before access

Keep it simple for now. You can add fancy stuff later.`,
      outcome: "User accounts working - signup, login, logout, password reset all functional",
      completionMessage: "Your app is now SECURE. Users have their own accounts, their data is protected, and you know who's who. Tomorrow: building your admin dashboard.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 20,
      title: "Your ADMIN Dashboard",
      description: "Build the control center where YOU manage everything - users, data, payments, and problems.",
      phase: "Week 3: Superpowers",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Admin Dashboard",
      aiTaskDescription: "Build your admin panel to manage users, view data, and control your SaaS.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What do YOU need to see when you log in as admin?",
      microDecisionOptions: JSON.stringify(["User list (who's signed up)", "Revenue metrics (who's paying)", "Usage stats (what's being used)", "All of the above"]),
      reflectionQuestion: "When your app has 100 users, what information will you need to access FAST?",
      tip: "Your admin dashboard doesn't need to be pretty. It needs to be FUNCTIONAL. You're the only one who'll see it.",
      lesson: `Time to build YOUR control center.

Users get the pretty app. YOU get the control panel.

Without an admin dashboard:
- You don't know who's signed up
- You can't see what's happening
- You can't help users with problems
- You're flying blind

THE ADMIN BUILD (10 MINUTES):

Tell Replit Agent:

"Build an admin dashboard at /admin (protected, only for admin users):

1. OVERVIEW PAGE
   Show me at a glance:
   - Total users
   - New users this week
   - Active users today
   - Revenue this month (if applicable)

2. USER MANAGEMENT
   - List all users with: name, email, signup date, plan
   - Search and filter users
   - Click to see user details
   - Ability to delete/disable accounts

3. DATA VIEW
   - See all [MAIN CONTENT TYPE] created by users
   - Filter by user, date, status
   - Quick actions (delete, feature, etc.)

4. QUICK ACTIONS
   - Impersonate user (see what they see)
   - Send announcement to all users
   - Export user list to CSV

Make it functional. Doesn't need to be beautiful.
Protect with admin-only access check."

ADMIN ACCESS:
Option 1: Check if user email = your email
Option 2: Add an 'isAdmin' column to users table
Option 3: Separate admin login entirely

Keep it simple: if (user.email === 'you@yourdomain.com')

THINGS YOU'LL THANK YOURSELF FOR:

1. Quick user search - when someone emails "I can't log in"
2. User activity view - see what they've done
3. Delete button - for spam/test accounts
4. Export - for when you need data in a spreadsheet

Your admin is YOUR tool. Build what YOU need.`,
      outcome: "Admin dashboard where you can see and manage everything in your SaaS",
      completionMessage: "You now have CONTROL. You can see who's using your app, what they're doing, and manage problems when they happen. Tomorrow: final testing and polish.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 21,
      title: "Test EVERYTHING (Launch Prep)",
      description: "Go through your ENTIRE app as a new user. Find the breaks. Fix them. Get ready to launch.",
      phase: "Week 3: Superpowers",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Launch Checklist",
      aiTaskDescription: "Complete the pre-launch testing checklist and fix any issues.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How does your app feel right now?",
      microDecisionOptions: JSON.stringify(["READY - Ship it!", "ALMOST - Just a few bugs", "NERVOUS - Needs more polish", "SCARED - Major stuff broken"]),
      reflectionQuestion: "If you HAD to launch tomorrow, what's the ONE thing you'd panic about?",
      tip: "Open a private/incognito browser. Sign up as a BRAND NEW user. Don't use your test account. Experience what real users will experience.",
      lesson: `Time to find out if this thing ACTUALLY works.

Today you're not the builder. You're a USER. A skeptical, impatient, easily-confused user.

THE REAL USER TEST:

Open an incognito browser window. Go to your app. Pretend you've never seen it before.

Now go through EVERYTHING:

1. FIRST IMPRESSION (30 seconds)
   - Do I understand what this does?
   - Do I want to sign up?
   - Is the signup button obvious?

2. SIGNUP FLOW
   - Sign up with a NEW email
   - Did I get a welcome email?
   - Am I logged in?
   - Do I know what to do next?

3. CORE FEATURE
   - Can I figure out how to use the main feature?
   - Does it work?
   - Do I get feedback (loading, success)?
   - Does the output make sense?

4. PAYMENT (Test Mode)
   - Can I find the upgrade option?
   - Is pricing clear?
   - Does checkout work? (Use card 4242 4242 4242 4242)
   - Am I upgraded after paying?

5. ACCOUNT STUFF
   - Can I change my settings?
   - Can I reset my password?
   - Can I log out and back in?
   - Does my data persist?

6. EDGE CASES
   - What if I enter nothing?
   - What if I enter garbage?
   - What if I'm on mobile?
   - What if I refresh mid-action?

WRITE DOWN EVERY PROBLEM:

For each issue, note:
- What happened
- What should have happened
- How annoying is it (1-5)

Fix EVERY 4 and 5 before launch.
Fix 3s if you have time.
1s and 2s can wait.

THE FINAL TOUCHES:

□ Favicon uploaded (the little icon in browser tabs)
□ Page title correct on all pages
□ 404 page exists (test: yourapp.com/sdjkhfsjkdfh)
□ Privacy policy page (AI can write this)
□ Terms of service page (AI can write this)

Ask the Agent: "Generate a simple privacy policy and terms of service for my SaaS app called [NAME] that does [DESCRIPTION]. Keep it standard and straightforward."

🎉 WEEK 3 COMPLETE!

Look at what you have now:
- Working AI features
- Payment processing
- Email that works
- User authentication
- Admin dashboard
- Tested and polished

You have a REAL SaaS. Most people never get this far. You did.`,
      outcome: "App fully tested, bugs fixed, legal pages added, READY FOR LAUNCH",
      completionMessage: "WEEK 3 DONE! You have a REAL, WORKING, SELLABLE SaaS product. AI features, payments, emails, auth, admin - all working. You built in 21 days what takes most people MONTHS. Next week: advanced features and the final push.",
      xpReward: 150,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 4: POLISH & LAUNCH (Days 22-30)
    // ============================================
    {
      day: 22,
      title: "Make It FEEL Premium",
      description: "The difference between amateur and professional? FEEDBACK. Every click should feel acknowledged.",
      phase: "Week 4: Polish & Launch",
      videoUrl: null,
      aiTaskType: "audit",
      aiTaskTitle: "UX Upgrade",
      aiTaskDescription: "List your app's main actions and we'll show you how to make each one feel polished.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's the VIBE of your app?",
      microDecisionOptions: JSON.stringify(["PROFESSIONAL - Clean, corporate, trustworthy", "FRIENDLY - Warm, encouraging, approachable", "POWERFUL - Bold, confident, no-nonsense", "FUN - Playful, delightful, surprising"]),
      reflectionQuestion: "Think of an app you LOVE using. What makes it feel so good? Now... does YOUR app have that?",
      tip: "Users can't tell you why an app feels 'cheap' or 'premium' but they KNOW the difference instantly. It's the little things. Today we fix the little things.",
      lesson: `Here's the difference between a $10 app and a $100 app: FEEDBACK.

Amateur apps: Click → Nothing → Did it work???
Pro apps: Click → Loading... → Success! ✓

Today we make your app FEEL expensive.

THE FEEDBACK CHECKLIST:

Every action needs THREE things:
1. SOMETHING IS HAPPENING (loading state)
2. IT WORKED (success feedback)
3. IT BROKE (helpful error message)

Go through your app and find EVERY button. Does it have all three?

THE UPGRADE PROMPT:

Tell Replit Agent:

"Improve the user feedback throughout my app:

1. ADD TOAST NOTIFICATIONS
   - Success: Green, checkmark, auto-dismiss after 3 seconds
   - Error: Red, stays until dismissed, helpful message
   - Loading: Shows when actions take more than 500ms

2. ADD LOADING STATES
   - Buttons show spinner when clicked
   - Forms disable during submission
   - Pages show skeleton while loading data

3. ADD CONFIRMATION DIALOGS
   - Before deleting anything
   - Before canceling subscriptions
   - Before any destructive action

4. IMPROVE ERROR MESSAGES
   Change these patterns:
   - 'Error' → 'Couldn't save. Try again?'
   - 'Failed' → 'Something went wrong on our end. We're on it.'
   - 'Invalid' → 'Please check your [field name]'

Use the sonner library for toasts.
Make it feel professional."

THE FEEL TEST:

After implementing, go through your app and click EVERYTHING.
- Does every button feel responsive?
- Do I always know if something worked?
- Are errors helpful, not scary?

If YES to all three, you've got a premium feel.`,
      outcome: "Your app FEELS professional - every action has feedback, every error is helpful",
      completionMessage: "Your app just went from 'amateur' to 'professional' without adding a single feature. That's the power of UX. Users can't explain it, but they FEEL it.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 23,
      title: "Numbers That MATTER (User Dashboard)",
      description: "Give users a dashboard that shows them what they care about. Not data dumps - INSIGHTS.",
      phase: "Week 4: Polish & Launch",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "User Dashboard",
      aiTaskDescription: "Define what metrics your users care about and we'll help you display them beautifully.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What does YOUR user want to know when they log in?",
      microDecisionOptions: JSON.stringify(["'Am I making progress?' (trends)", "'What should I do next?' (actions)", "'What did I accomplish?' (totals)", "'What's happening right now?' (activity)"]),
      reflectionQuestion: "If users could see just ONE number when they log in, what should it be?",
      tip: "Most dashboards SUCK because they show EVERYTHING. Great dashboards show ONE thing clearly. What's your ONE thing?",
      lesson: `Let's talk about dashboards.

Most dashboards are GARBAGE. 15 charts, no insights. Data everywhere, meaning nowhere.

Today we build a dashboard that actually HELPS.

THE DASHBOARD RULE:
Answer ONE question clearly. Then add supporting details.

EXAMPLES:

Productivity app: "You're 73% to your weekly goal" (one big number)
Analytics app: "Traffic up 23% this week" (with trend line)
Finance app: "You've saved $1,240 this month" (with progress bar)

THE QUESTION YOUR DASHBOARD ANSWERS:
Fill in: "When my users log in, they want to know _________"

That's your dashboard's ONE JOB.

THE BUILD PROMPT:

Tell Replit Agent:

"Create a user dashboard that shows:

MAIN METRIC (big and prominent):
- [YOUR KEY NUMBER - e.g., 'Tasks completed this week']
- Show comparison to last period (up/down arrow)

SUPPORTING STATS (row of 3-4 cards):
- [STAT 1 - e.g., 'Current streak: X days']
- [STAT 2 - e.g., 'Total [things] created']
- [STAT 3 - e.g., 'Time saved this month']

ONE CHART (if data supports it):
- [CHART TYPE] showing [DATA OVER TIME]
- Keep it simple, 30 days max

RECENT ACTIVITY (list):
- Last 5-10 actions the user took
- With timestamps

Make the main metric HUGE. Everything else supports it.
Mobile-responsive layout."

THE CHART CHEAT SHEET:
- GOING UP OR DOWN over time? → Line chart
- COMPARING THINGS? → Bar chart
- PARTS OF A WHOLE? → Donut (use sparingly)
- ONE BIG NUMBER? → Just show the number. Big.

WHAT TO AVOID:
❌ Too many charts (pick 1-2 max)
❌ Tiny numbers everywhere
❌ No context ("47" means nothing - "47 more than last week" means something)
❌ "Vanity metrics" that look good but don't help`,
      outcome: "User dashboard that shows ONE key insight clearly with supporting context",
      completionMessage: "Your users now have a dashboard that actually HELPS them. Not a data dump - a clear answer to what they care about. That's what keeps people coming back.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 24,
      title: "Mobile That WORKS",
      description: "55% of users are on mobile. If your app sucks on phones, you're losing HALF your potential customers.",
      phase: "Week 4: Polish & Launch",
      videoUrl: null,
      aiTaskType: "audit",
      aiTaskTitle: "Mobile Audit",
      aiTaskDescription: "Test your app on mobile and we'll help you fix what's broken.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How does your app look on your phone RIGHT NOW?",
      microDecisionOptions: JSON.stringify(["GREAT - Works perfectly", "OK - Usable but awkward", "BAD - Hard to use", "BROKEN - Doesn't work at all"]),
      reflectionQuestion: "Open your app on your phone. What's the FIRST thing that frustrates you?",
      tip: "Open your app on your ACTUAL phone right now. Not the browser simulator. Your REAL phone. Click everything. Find the pain.",
      lesson: `Stop reading. Grab your phone. Open your app. NOW.

I'll wait.

...

OK, how was it? If it was anything less than "actually good," today we fix that.

THE MOBILE REALITY:
- 55% of web traffic is mobile
- If your app sucks on phones, you lose HALF your users
- Bad mobile = bad first impression = no second chance

THE MOBILE TESTING CHECKLIST:

Open your app on your phone and check:

□ Can I read all text without zooming?
□ Can I tap buttons without missing?
□ Can I fill out forms without rage?
□ Can I navigate with one thumb?
□ Does everything fit on screen?

For every "no," that's a problem to fix.

THE FIX PROMPT:

Tell Replit Agent:

"Fix these mobile issues in my app:

1. NAVIGATION
   - Add hamburger menu for mobile (hide full nav)
   - Bottom navigation bar for main actions
   - Make touch targets 44x44px minimum

2. TEXT
   - Minimum font size 16px (prevents iOS zoom)
   - Limit line width to ~70 characters
   - Use proper spacing between lines

3. FORMS
   - Full-width inputs on mobile
   - Labels above fields (not beside)
   - Use correct input types (email, tel, number)
   - Form doesn't jump when keyboard appears

4. TABLES/DATA
   - Convert wide tables to card layout on mobile
   - Or make tables horizontally scrollable
   - Show most important columns first

5. IMAGES
   - Scale down on mobile
   - Don't break layout

Test at 375px width (iPhone SE size) for worst case."

QUICK MOBILE WINS:

Add this one line to fix most font issues:
- Minimum font size: 16px everywhere

Add this to fix tap targets:
- Minimum button/link size: 44x44 pixels
- Space between tap targets: 8px minimum

Add this to fix navigation:
- Hide menu behind hamburger icon on mobile
- Or use bottom tab bar for main actions

TEST ON REAL PHONES:
- Your phone
- A friend's phone (different size)
- Chrome DevTools (iPhone SE, iPhone 14)

If it works on iPhone SE, it works everywhere.`,
      outcome: "Your app works on mobile - readable, tappable, usable",
      completionMessage: "Your app now works on PHONES. You just stopped losing half your potential users. That's not a feature - that's survival.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 25,
      title: "Speed That WINS",
      description: "A slow app loses users. A fast app wins. Today we make your app FAST.",
      phase: "Week 4: Polish & Launch",
      videoUrl: null,
      aiTaskType: "audit",
      aiTaskTitle: "Speed Boost",
      aiTaskDescription: "Check your app's performance and fix the slow parts.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How FAST does your app feel?",
      microDecisionOptions: JSON.stringify(["INSTANT - Everything loads immediately", "FAST - Most things load quick", "OK - Some pages are slow", "SLOW - Users are definitely noticing"]),
      reflectionQuestion: "Time yourself: how many SECONDS from clicking your URL to seeing your app fully loaded?",
      tip: "A 1-second delay = 7% drop in conversions. A 3-second load = 53% of mobile users leave. Speed is literally money.",
      lesson: `Let's be honest: is your app slow?

Load your app right now. Count the seconds until it's usable.

1-2 seconds = Good
3-4 seconds = Users are leaving
5+ seconds = You have a serious problem

THE SPEED CHECK:

1. Open Chrome DevTools (right-click → Inspect → Lighthouse tab)
2. Click "Analyze page load"
3. Look at your Performance score

Below 50 = Problem
50-80 = Needs work
80+ = You're good

THE QUICK FIXES:

Tell Replit Agent:

"Improve my app's performance:

1. IMAGES
   - Compress all images (use TinyPNG or Squoosh)
   - Add loading='lazy' to images below the fold
   - Use WebP format if possible

2. LOADING STATES
   - Show skeleton screens while data loads
   - Don't wait for everything - show what you have
   - Load critical stuff first, extras later

3. DATABASE
   - Add indexes on frequently-searched columns
   - Don't load ALL data, paginate
   - Cache data that doesn't change often

4. CODE
   - Remove unused dependencies
   - Lazy load routes (only load pages when visited)
   - Minify JavaScript and CSS (Replit does this for production)

5. FIRST LOAD
   - Reduce initial bundle size
   - Show something in under 1 second
   - Full app can load after

Run a Lighthouse audit and fix the top issues."

THE 80/20 SPEED FIXES:

These 4 things fix 80% of speed problems:

1. COMPRESS IMAGES - Biggest impact for least effort
2. ADD LOADING STATES - Perceived speed matters
3. LAZY LOAD - Don't load what isn't needed
4. DATABASE INDEXES - Speeds up every query

THE REALITY CHECK:

Your app doesn't need to be PERFECT. It needs to be FAST ENOUGH.

Fast enough = Users don't notice the wait
Fast enough = The app feels responsive
Fast enough = Nobody leaves because of speed

That's your target. Not perfection. Fast enough.`,
      outcome: "App loads fast - images optimized, loading states added, performance improved",
      completionMessage: "Your app is now FAST. Users won't notice the performance - and that's exactly the point. Speed is invisible when it's good. It only becomes visible when it's bad.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 26,
      title: "Let Users LEAVE (Data Export)",
      description: "Give users the power to export their data. Ironically, this makes them STAY.",
      phase: "Week 4: Polish & Launch",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Data Export",
      aiTaskDescription: "Add export features so users can take their data anywhere.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What would users do with their exported data?",
      microDecisionOptions: JSON.stringify(["ANALYZE it (spreadsheets, charts)", "SHARE it (reports, presentations)", "BACKUP it (peace of mind)", "MOVE it (to another tool)"]),
      reflectionQuestion: "Ever been trapped in an app that wouldn't let you export? How did that feel? Don't do that to your users.",
      tip: "Export builds TRUST. Users think 'I can leave anytime' which ironically makes them STAY because they don't feel trapped.",
      lesson: `Here's a weird truth about SaaS:

The more freedom you give users to LEAVE, the more likely they are to STAY.

Export features say: "We're confident you'll stay because we're GOOD, not because you're TRAPPED."

That's powerful.

THE EXPORT BUILD:

Tell Replit Agent:

"Add data export features to my app:

1. CSV EXPORT
   - Button: 'Export to CSV'
   - Include: [LIST YOUR MAIN DATA FIELDS]
   - Filename: my-data-YYYY-MM-DD.csv
   - Works with large datasets

2. PDF REPORT (optional but impressive)
   - Button: 'Download Report'
   - Professional layout with my app logo
   - Summary stats at top
   - Data in clean table format
   - Filename: report-YYYY-MM-DD.pdf

3. FULL BACKUP
   - Button: 'Export All My Data'
   - JSON file with EVERYTHING
   - For users who want complete backup
   - Include all related data

4. UX
   - Show loading state while generating
   - Success message when done
   - Handle large exports gracefully

Put export options in Settings or on the main data page."

WHERE TO PUT EXPORT BUTTONS:

Option 1: Settings page → "Your Data" section
Option 2: Main data view → "Export" dropdown in header
Option 3: Account page → "Download my data"

Any of these works. Pick one.

WHAT USERS THINK WHEN THEY SEE EXPORT:

❌ Without export: "Am I trapped here?"
✅ With export: "Cool, I can leave whenever. But I don't need to."

THE TRUST SIGNAL:

Export features tell users:
- We respect your data
- We're not holding you hostage
- We're confident in our product

It's a power move that costs you nothing.`,
      outcome: "Users can export their data - CSV, reports, full backup",
      completionMessage: "Your users now OWN their data. They can leave anytime. And weirdly, that makes them want to stay. Trust is a powerful thing.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 27,
      title: "Your LANDING PAGE",
      description: "Your app needs a front door. A landing page that converts visitors into signups. Let's build it.",
      phase: "Week 4: Polish & Launch",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Landing Page",
      aiTaskDescription: "Create a landing page that converts visitors into users.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What should your landing page FOCUS on?",
      microDecisionOptions: JSON.stringify(["THE PROBLEM - Pain they're experiencing", "THE SOLUTION - What your app does", "THE PROOF - Results others got", "THE OFFER - Why sign up NOW"]),
      reflectionQuestion: "In ONE sentence, why should someone sign up for your app TODAY?",
      tip: "A great landing page answers ONE question: 'What's in it for me?' Answer it in the first 5 seconds and you've won.",
      lesson: `Your app needs a front door.

Right now, people land on your login page. That's like walking into a store and immediately seeing the cash register.

You need a LANDING PAGE - something that sells.

THE LANDING PAGE FORMULA:

1. HERO SECTION (Above the fold - no scrolling)
   - Headline: What you do + for whom + the benefit
   - Subheadline: How you do it differently
   - CTA button: "Start Free" or "Try It Now"
   - Maybe a screenshot or demo video

2. PROBLEM SECTION
   - "Tired of [THEIR PAIN]?"
   - 3 specific problems they face
   - Make them feel understood

3. SOLUTION SECTION
   - "Here's how [APP NAME] helps"
   - 3-4 key features with benefits (not just features)
   - Screenshots or illustrations

4. SOCIAL PROOF (if you have it)
   - Testimonials
   - Logos of companies using it
   - Numbers ("500+ users" or "10,000 tasks completed")

5. FINAL CTA
   - Repeat your main call-to-action
   - Maybe add urgency ("Free during beta")

THE BUILD PROMPT:

Tell Replit Agent:

"Create a landing page for my app:

APP NAME: [YOUR APP NAME]
TAGLINE: [ONE SENTENCE - WHAT IT DOES FOR WHOM]
TARGET USER: [WHO IS THIS FOR]
MAIN BENEFIT: [THE #1 THING THEY GET]

Build a landing page with:

1. HERO
   - Headline: [YOUR HEADLINE]
   - Subheadline: [YOUR SUBHEADLINE]
   - CTA: 'Start Free' → links to /signup
   - Include a screenshot of the app

2. PROBLEM
   - Section title: 'The Problem'
   - 3 pain points as cards

3. SOLUTION
   - Section title: 'How [APP NAME] Helps'
   - 3-4 features with icons and descriptions

4. CTA
   - 'Ready to get started?'
   - 'Start Free' button → /signup

Modern, clean design. Mobile-responsive.
Put it at the root URL (/)"

WRITE YOUR HEADLINE:

Formula: [ACTION] [THING] [WITHOUT PAIN/WITH BENEFIT]

Examples:
- "Create social posts without the headache"
- "Track your habits and actually stick to them"
- "Build landing pages in minutes, not hours"

Your turn. What's yours?`,
      outcome: "Landing page that converts visitors into signups",
      completionMessage: "Your app now has a front door. Visitors can understand what you do and why they should care - before they even sign up. That's marketing 101.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 28,
      title: "Security CHECK (Don't Get Hacked)",
      description: "Before you launch, let's make sure you're not leaving the door wide open for hackers.",
      phase: "Week 4: Polish & Launch",
      videoUrl: null,
      aiTaskType: "audit",
      aiTaskTitle: "Security Audit",
      aiTaskDescription: "Run through the security checklist before launch.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How confident are you in your app's security?",
      microDecisionOptions: JSON.stringify(["CONFIDENT - I've thought about this", "UNSURE - I don't really know", "WORRIED - I haven't checked anything", "CLUELESS - Security what?"]),
      reflectionQuestion: "If a hacker broke into your app tomorrow, what's the worst thing they could access?",
      tip: "You don't need to be a security expert. You just need to NOT do the obviously dumb things. This checklist covers the obvious stuff.",
      lesson: `Before you launch, let's make sure you're not an easy target.

You don't need to be a security expert. You just need to NOT do the dumb stuff.

THE SECURITY CHECKLIST:

Go through each item. Check it. Fix what's broken.

1. API KEYS & SECRETS
   □ All API keys in environment variables (not code)
   □ No secrets in GitHub/Replit files
   □ .env file in .gitignore
   □ No keys visible in browser console/network tab

2. AUTHENTICATION
   □ Passwords are hashed (not plain text)
   □ Password reset links expire
   □ Sessions expire after inactivity
   □ Can't access dashboard without logging in

3. DATA PROTECTION
   □ Users can only see THEIR data
   □ Admin routes require admin check
   □ No user IDs exposed in URLs that allow access to others' data
   □ Input validation on all forms

4. COMMON ATTACKS
   □ SQL injection: Using ORM (Drizzle/Prisma), not raw SQL
   □ XSS: React escapes HTML by default (don't use dangerouslySetInnerHTML)
   □ CSRF: Using proper session management

5. HTTPS
   □ Replit/Vercel handles this automatically
   □ No mixed content warnings
   □ API calls use https://

THE QUICK SECURITY FIX:

Tell Replit Agent:

"Audit my app for basic security issues:

1. Check that all API routes require authentication
2. Ensure users can only access their own data
3. Verify no secrets are exposed in client code
4. Add rate limiting to prevent abuse
5. Ensure all forms have input validation

Fix any issues you find."

THE TEST:

1. Log in as User A
2. Copy a URL that shows User A's data
3. Log in as User B
4. Paste that URL
5. Can User B see User A's data?

If YES, you have a HUGE problem. Fix it now.

WHAT HACKERS LOOK FOR:

1. Exposed API keys (free money for them)
2. No auth checks (access anything)
3. User IDs in URLs (enumerate all users)
4. No rate limiting (brute force passwords)

Don't be an easy target. Run through this list.`,
      outcome: "Basic security audit complete - no obvious vulnerabilities",
      completionMessage: "Your app isn't an easy target anymore. You've checked the basics. Professional security audits exist for a reason, but you've covered the obvious stuff. That's enough for launch.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 29,
      title: "Pre-Launch CHECKLIST",
      description: "Tomorrow you launch. Today you make absolutely sure everything is ready. No surprises.",
      phase: "Week 4: Polish & Launch",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Final Check",
      aiTaskDescription: "Run through the complete pre-launch checklist.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How ready do you FEEL?",
      microDecisionOptions: JSON.stringify(["PUMPED - Let's gooo!", "READY - Nervous but prepared", "WORRIED - Still have doubts", "TERRIFIED - Is it good enough?"]),
      reflectionQuestion: "What's the ONE thing that would embarrass you if it broke on launch day?",
      tip: "Tomorrow is launch day. Today is 'find everything that could go wrong' day. Better to find problems now than when real users are watching.",
      lesson: `Tomorrow you launch. Today we make sure you're ACTUALLY ready.

Go through this ENTIRE checklist. Check every single item. Fix anything that's broken.

THE FINAL CHECKLIST:

CORE FUNCTIONALITY
□ Sign up works (test with a new email)
□ Login works
□ Password reset works
□ Main feature works end-to-end
□ Secondary features work
□ Payments work (test with 4242 4242 4242 4242)
□ Data saves and persists after refresh
□ Logout works

USER EXPERIENCE
□ Landing page is clear and compelling
□ Signup is simple (minimum fields)
□ Dashboard loads without errors
□ Navigation makes sense
□ Mobile works
□ Loading states exist
□ Error messages are helpful

TECHNICAL
□ No console errors
□ No broken links
□ No exposed API keys
□ Fast enough (< 3 second load)
□ Images optimized
□ HTTPS working

CONTENT
□ Favicon set
□ Page titles correct
□ 404 page exists
□ Privacy policy page exists
□ Terms of service page exists

BUSINESS
□ Stripe keys are LIVE (not test)
□ Email domain verified (or using resend.dev)
□ Support email ready (even if just your email)
□ Know what you'll do if something breaks

THE FINAL TEST:

1. Open incognito browser
2. Go to your landing page
3. Sign up as a brand new user
4. Complete one full workflow
5. Upgrade to paid (use real card in test mode)
6. Check you got charged
7. Check welcome email arrived
8. Log out and log back in

If ALL of that works, you're ready.

COMMON LAUNCH DAY DISASTERS:

1. Stripe still in test mode → No real payments!
2. Email not set up → Users can't reset passwords
3. No error handling → Ugly crashes
4. Forgot to buy domain → Weird URL
5. Database issues → Lost data

Check. Check. Check. Then check again.

Sleep well tonight. Tomorrow you launch.`,
      outcome: "Complete pre-launch checklist done - ready for launch day",
      completionMessage: "You've checked everything. You've tested everything. You're as ready as you'll ever be. Tomorrow is the day. Get some sleep. You've earned it.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 30,
      title: "🚀 LAUNCH DAY",
      description: "You did it. 30 days ago this was an idea. Today it's a REAL product. Time to launch.",
      phase: "The Finisher",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "Launch Time",
      aiTaskDescription: "You've made it. Let's launch this thing.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How do you feel RIGHT NOW?",
      microDecisionOptions: JSON.stringify(["PROUD - I can't believe I built this", "EXCITED - Let's get users!", "NERVOUS - Is it good enough?", "EXHAUSTED - But I'm finishing this"]),
      reflectionQuestion: "30 days ago, this was just an idea. Look at what you've built. What surprised you most about yourself?",
      tip: "Most people never finish ANYTHING. You did. That alone puts you in the top 1% of people who talk about building something.",
      lesson: `🎉 YOU ACTUALLY DID IT.

30 days ago, you had an idea.
Today, you have a REAL product.

Let that sink in.

WHAT YOU'VE BUILT:

□ A complete SaaS application
□ User authentication & accounts
□ AI-powered features
□ Payment processing
□ Email integration
□ Admin dashboard
□ Professional UI/UX
□ Mobile-responsive design
□ Landing page that converts
□ Security basics covered

This is REAL. This is YOURS.

Most people never finish anything. They talk about it, plan it, "research" it... but they never SHIP.

You shipped.

That makes you different.

THE LAUNCH:

Your app is ready. Here's how to launch:

1. Switch Stripe to LIVE mode
2. Verify your email domain (or use resend.dev)
3. Share your landing page URL with:
   - 5 people who have the problem you solve
   - 3 online communities where your users hang out
   - Your social media (if you have any)

Start small. Get 5-10 users. Learn from them.

---

BUT HERE'S THE TRUTH...

An app is NOT a business.

You've built the product. That's the easy part. (Yes, really.)

The HARD part? Getting people to pay for it.

Most builders get stuck right here:
- They have a product nobody knows about
- They have no idea how to market it
- They don't know how to price it
- They can't get their first 10 customers
- They have no systems for growth

The skills that got you HERE won't get you THERE.

Building an app = technical skills
Building a business = completely different skills

Positioning. Pricing. Sales. Marketing. Systems. Scaling.

That's the stuff that turns a product into income.

---

WHAT'S NEXT?

If you're serious about turning this into REAL income - not just a side project that collects dust - I can help.

I offer 1:1 mentorship where we work together on the BUSINESS side:
- Positioning that attracts the right customers
- Pricing that people actually pay
- Marketing that doesn't feel gross
- Systems that generate consistent income
- The accountability to actually follow through

Apply here: https://www.mattwebley.com/workwithmatt

You've proven you can BUILD.
Now let's see if you're ready to build the BUSINESS.

---

Congratulations. You're a builder now.

What you do next determines everything.`,
      outcome: "You launched. You're officially a builder.",
      completionMessage: "🎉 30 DAYS COMPLETE! You built a real SaaS product from scratch. You're in the top 1% of people who actually SHIP. The product is done - now the real work begins. If you want 1:1 help turning this into real income, apply here: https://www.mattwebley.com/workwithmatt",
      xpReward: 300,
      estimatedMinutes: 5,
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
        tip: (day as any).tip || null,
        lesson: (day as any).lesson || null,
        outcome: day.outcome,
        completionMessage: (day as any).completionMessage || null,
        estimatedMinutes: (day as any).estimatedMinutes || 5,
        xpReward: day.xpReward,
        updatedAt: new Date(),
      },
    });
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
