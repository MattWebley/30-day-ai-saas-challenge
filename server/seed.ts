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
      title: "Naming, Domains & MVP Roadmap",
      description: "Name your SaaS, secure the .com domain and social handles, then prioritize which features to build first.",
      phase: "Week 1: Idea & Planning",
      videoUrl: null,
      aiTaskType: "suggestion",
      aiTaskTitle: "Name Generator & MVP Prioritization",
      aiTaskDescription: "AI generates name ideas, checks domain availability, then helps you prioritize features into MVP vs V2.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your MVP philosophy?",
      microDecisionOptions: JSON.stringify(["Launch fast, iterate", "Build it right first", "Balanced approach", "Maximum features"]),
      reflectionQuestion: "What's the absolute minimum feature set that delivers real value?",
      tip: "Use NAMECHEAP for domains - it's the best. You NEED the .com. If you can't get it, CHANGE THE NAME! Also grab all social handles TODAY.",
      lesson: `NAMING YOUR SAAS
Ask ChatGPT or Claude for name ideas and pick one. But there's considerations:

1. TRADEMARKS: Do a quick trademark search in US and UK. Avoid obvious clashes.
2. DOMAIN: Use Namecheap. You NEED the .com - if you can't get it, change the name! Buy obvious misspellings too.
3. SOCIALS: Grab Facebook, Instagram, LinkedIn, X - ALL of them. Even if you never use them.

MVP ROADMAP
Now prioritize your features. What MUST be built for MVP vs what can wait for V2?

Remember: We want this MVP to take 7-30 DAYS maximum. If cloning all competitor features seems too big, NICHE DOWN into something smaller. Focus on ONE or TWO core features but do them REALLY well.

Put future features on a "V2 List" - learn this phrase: "Not MVP, maybe V2." It'll SAVE your sanity.`,
      outcome: "Your SaaS name, .com domain secured, social handles grabbed, and a prioritized MVP roadmap",
      completionMessage: "You have a NAME and a clear roadmap. Most founders spend months on this. You did it in a day. Tomorrow: setting up your AI-powered development toolkit.",
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
      title: "Your First Build Session with AI",
      description: "Put your PRD into Replit and watch AI build your first working screen - then customize it with specific requests.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Build Session",
      aiTaskDescription: "Drop your PRD into Replit Agent and get your first working screen built. Then customize it with targeted requests.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What screen should AI build first?",
      microDecisionOptions: JSON.stringify(["Dashboard - where users land after login", "Core action screen - the main thing users do", "Onboarding - first-time user experience", "Settings - user preferences and account"]),
      reflectionQuestion: "Look at what AI just built. What ONE thing would make it 20% better?",
      tip: "Don't try to build everything at once. Get ONE screen working, then move to the next. Momentum beats perfection.",
      lesson: `YOUR FIRST REAL BUILD SESSION

Today you're going to watch AI build something real for you.

STEP 1: PREPARE YOUR PRD
Open the PRD you created on Day 6. Make sure it includes:
- What the app does (one sentence)
- Who it's for
- The 3-5 main features
- The screens you need

STEP 2: DROP IT INTO REPLIT AGENT
Go to Replit → Create new project → Open Agent
Paste your entire PRD or drag the file in.
Click "Start Building"

Watch it work. It will:
- Set up your project structure
- Create database tables
- Build basic screens
- Add routing and navigation

STEP 3: YOUR FIRST CUSTOMIZATION
Once it's done, look at what was built. Now make it YOURS.

Copy this prompt template:

---
"I want to customize [SCREEN NAME].

Currently it shows: [WHAT YOU SEE]
I want it to show: [WHAT YOU WANT]

Specifically:
1. [CHANGE 1 - e.g., "Change the header to say 'Welcome back, {user name}'"]
2. [CHANGE 2 - e.g., "Add a card showing their current streak"]
3. [CHANGE 3 - e.g., "Make the main CTA button blue and larger"]

Keep everything else the same."
---

STEP 4: TEST IT
After each change, click through your app. Does it work?

Pro tip: You can STACK multiple requests in one message. The agent will do them all.`,
      outcome: "First screen built by AI and customized to your vision",
      completionMessage: "You just built your first real screen. Not a tutorial - YOUR app, YOUR vision. The agent did the heavy lifting, you directed. This is how you build fast.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 9,
      title: "Prompting Like a Pro: Get Exactly What You Want",
      description: "AI generates prompts FOR you based on what you're trying to build - then you use them to get perfect results.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Prompt Generator",
      aiTaskDescription: "Tell us what feature you want. AI will generate the PERFECT prompt to get exactly the result you need.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What are you trying to build today?",
      microDecisionOptions: JSON.stringify(["A form that collects user input", "A display that shows data beautifully", "An action that processes something", "Navigation between screens"]),
      reflectionQuestion: "What's the most important detail you want the AI to get right?",
      tip: "The difference between a vague result and a perfect result is specificity. Generic prompts get generic results. Specific prompts get exactly what you want.",
      lesson: `THE PROMPT FORMULA THAT WORKS EVERY TIME

Bad prompts → vague results → frustration
Good prompts → exactly what you want → shipped

TODAY'S AI TASK:
Let AI write the perfect prompt FOR you.

Copy this into Claude or ChatGPT:

---
"I'm building [YOUR APP] and I need help writing the perfect prompt to give to my Replit AI agent.

I want to build: [DESCRIBE THE FEATURE]

The feature should:
- [REQUIREMENT 1]
- [REQUIREMENT 2]
- [REQUIREMENT 3]

Generate a detailed, specific prompt I can copy-paste into Replit Agent that will get me exactly what I want on the first try.

Include:
1. Exact UI elements needed
2. Specific behaviors (what happens when users click/type)
3. Data that needs to be saved/loaded
4. Error states and edge cases
5. Styling preferences

Format it so I can copy-paste directly."
---

WHAT YOU'LL GET:
The AI will generate a perfect, detailed prompt you can paste into Replit.

EXAMPLE:
Instead of: "Add a contact form"

AI generates:
"Add a contact form to the /contact page with:
- Name field (required, text)
- Email field (required, email validation)
- Message field (required, textarea, 500 char max)
- Submit button (blue, full width, says 'Send Message')
- On submit: validate all fields, save to database, send email notification to admin@myapp.com
- Show success message: 'Thanks! We'll reply within 24 hours.'
- Show inline errors if validation fails
- Disable button while submitting, show loading spinner"

See the difference? One gets a generic form. One gets EXACTLY what you need.

Use this technique for EVERY feature you build.`,
      outcome: "Perfect prompts generated that get you exactly what you want",
      completionMessage: "You now have a superpower: you can get AI to write perfect prompts for you. No more vague results. No more back-and-forth. Tomorrow: building your core feature.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 10,
      title: "Build Your Core Feature (AI Does 90%)",
      description: "AI generates your complete core feature spec - then builds it for you. You just test and tweak.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Feature Builder",
      aiTaskDescription: "Describe what your core feature does. AI generates the complete spec and implementation prompt.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's the CORE action in your app?",
      microDecisionOptions: JSON.stringify(["Users CREATE something (posts, projects, content)", "Users ANALYZE something (data, text, images)", "Users TRACK something (progress, habits, metrics)", "Users CONNECT something (people, tools, services)"]),
      reflectionQuestion: "If your app only did ONE thing perfectly, what would that be?",
      tip: "Your core feature is the reason people use your app. Everything else is supporting cast. Get this ONE thing working beautifully before anything else.",
      lesson: `BUILDING YOUR CORE FEATURE TODAY

Your core feature is the heart of your app. Let's build it RIGHT.

STEP 1: DEFINE IT CLEARLY
Complete this sentence: "Users come to my app to ____________"

That's your core feature.

STEP 2: LET AI DESIGN IT
Copy this prompt into Claude or ChatGPT:

---
"I'm building [APP NAME] - [ONE SENTENCE DESCRIPTION].

My core feature is: [THE THING USERS COME TO DO]

Design this feature in detail:

1. USER FLOW
   - What does the user see first?
   - What do they input/click?
   - What happens next?
   - What's the final result?

2. UI COMPONENTS
   - What screens are needed?
   - What's on each screen?
   - What buttons, forms, displays?

3. DATA FLOW
   - What data is collected?
   - Where is it stored?
   - How is it processed?
   - What's displayed back?

4. EDGE CASES
   - What if the input is invalid?
   - What if the process fails?
   - What if there's no data yet?

Generate a complete, detailed prompt I can paste into Replit Agent to build this entire feature."
---

STEP 3: BUILD IT
Take the generated prompt → Paste into Replit Agent → Watch it build

STEP 4: TEST IT
Go through the entire flow as a user:
- Does input work?
- Does processing happen?
- Do I see the result?
- Do errors show clearly?

STEP 5: REFINE
For anything not quite right:
"The [THING] isn't working correctly. It currently [DOES X]. It should [DO Y]. Fix this specific issue."`,
      outcome: "Core feature fully built, tested, and working",
      completionMessage: "Your core feature WORKS. The thing that makes your app valuable is now real. Most founders never get this far. Tomorrow: debugging like a pro.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 11,
      title: "Debug Like a Pro (AI Fixes Your Bugs)",
      description: "Screenshot your bugs and use AI to generate instant fixes. No more hours of frustration.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Bug Fixer",
      aiTaskDescription: "Describe your bug or drop a screenshot. AI generates the exact fix you need.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What type of bug are you dealing with?",
      microDecisionOptions: JSON.stringify(["It looks wrong (visual/styling)", "It doesn't work (functionality broken)", "It crashes (error messages)", "It's just weird (unexpected behavior)"]),
      reflectionQuestion: "What did this bug teach you about how your app works?",
      tip: "The fastest way to fix bugs: screenshot → describe what's wrong → describe what should happen → paste into AI → get fix → paste fix into Replit. 2 minutes max.",
      lesson: `THE 2-MINUTE BUG FIX FORMULA

Bugs are inevitable. Spending hours on them is NOT.

THE SCREENSHOT METHOD:
1. Screenshot the problem
2. Drop it into ChatGPT or Claude
3. Say what's wrong and what should happen
4. Get the fix
5. Apply it

TODAY'S AI TASK:
When you hit a bug, use this prompt template:

---
"I'm getting a bug in my Replit project.

[PASTE SCREENSHOT OR ERROR MESSAGE]

WHAT'S HAPPENING:
[Describe the current broken behavior]

WHAT SHOULD HAPPEN:
[Describe the expected correct behavior]

HOW TO REPRODUCE:
1. [Step 1]
2. [Step 2]
3. [Then this happens]

Please:
1. Explain what's likely causing this
2. Give me the exact code fix I can paste into Replit
3. Tell me what file to put it in
4. Suggest how to prevent this in the future"
---

ADVANCED DEBUGGING:

For errors you can't figure out:
"Here's my error: [PASTE ERROR]
Here's the code that's breaking: [PASTE CODE]
Explain it like I'm not a developer and give me the fix."

For UI issues:
"[SCREENSHOT] This button should be blue and aligned right, but it's gray and centered. Give me the exact CSS/Tailwind classes to fix this."

For data issues:
"Data saves but doesn't show up when I refresh. Here's my save code: [CODE]. Here's my load code: [CODE]. What's wrong?"

Remember: The AI has seen thousands of these bugs before. It knows the fix. Just show it what's wrong.`,
      outcome: "Bugs fixed quickly using AI-powered debugging workflow",
      completionMessage: "You can now fix bugs in minutes, not hours. This single skill will save you more time than anything else in this challenge. Tomorrow: using AI as your expert team.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 12,
      title: "Your AI Expert Team (Get Any Answer)",
      description: "AI becomes your expert coder, designer, marketer, and strategist - all at once. Learn to get expert answers instantly.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Expert Consultation",
      aiTaskDescription: "Ask any question about building your SaaS. AI responds as the expert you need.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What kind of expert do you need right now?",
      microDecisionOptions: JSON.stringify(["Technical architect - 'How should I structure this?'", "UX designer - 'How should this feel?'", "Business strategist - 'Is this the right approach?'", "Debugger - 'Why isn't this working?'"]),
      reflectionQuestion: "What's the one question you've been afraid to ask because you thought you 'should know' the answer?",
      tip: "There are no stupid questions when talking to AI. Ask everything. The AI has no judgment and infinite patience. Use it.",
      lesson: `YOUR UNLIMITED EXPERT TEAM

You now have 24/7 access to:
- Senior developers
- UX designers
- Business strategists
- Marketing experts
- Security consultants

All for the cost of a coffee.

TODAY'S AI TASK:
Pick the expert you need most right now and use this template:

---
FOR TECHNICAL DECISIONS:
"Act as a senior developer who has built 50+ SaaS applications.

I'm building [YOUR APP]. I need to [WHAT YOU'RE TRYING TO DO].

Options I'm considering:
1. [OPTION A]
2. [OPTION B]

Which approach is better for my situation? Give me:
- Your recommendation and why
- Potential pitfalls of each approach
- The exact implementation steps
- Code examples if helpful"

FOR UX DECISIONS:
"Act as a UX designer who specializes in SaaS products.

I'm building [YOUR APP] for [YOUR USERS].

Currently, [DESCRIBE CURRENT FLOW].

Is this the right approach? If not, how should I improve it?
Be specific - tell me exactly what to change."

FOR BUSINESS DECISIONS:
"Act as a SaaS founder who has built and sold multiple products.

I'm building [YOUR APP]. I'm trying to decide [YOUR DILEMMA].

What would you do in my situation? Give me:
- Your recommendation
- Why this approach
- Common mistakes to avoid
- What to do if it doesn't work"

FOR SECOND OPINIONS:
"Here's what I built/wrote/decided: [PASTE IT]

As an expert in [AREA], what would you add or change to make this better?
Be critical - I want to improve, not feel good."
---

THE BOUNCE TECHNIQUE:
1. Ask ChatGPT your question
2. Paste the response into Claude: "Is there anything you'd add or disagree with?"
3. You now have TWO expert opinions to synthesize

Use this for every important decision.`,
      outcome: "Expert advice on demand for any challenge you face",
      completionMessage: "You now have the ability to get world-class advice on ANY topic, instantly. Most founders pay thousands for consultants. You have something better - and it's available 24/7.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 13,
      title: "Build Feature #2 (Full AI Generation)",
      description: "AI designs and builds your second feature from scratch - complete user flow, UI, data, and edge cases.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Feature Generator",
      aiTaskDescription: "Tell AI your second feature. It designs and generates everything you need to build it.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your second most important feature?",
      microDecisionOptions: JSON.stringify(["User settings and preferences", "Data history and past results", "Sharing or collaboration", "Analytics and insights"]),
      reflectionQuestion: "How does this feature make your core feature more valuable?",
      tip: "Feature #2 should SUPPORT feature #1, not compete with it. It should make the core experience better, not distract from it.",
      lesson: `BUILDING FEATURE #2 (THE AI WAY)

Your core feature works. Now let's add the second feature that makes it even better.

STEP 1: CHOOSE WISELY
Your second feature should:
- Support your core feature (not distract from it)
- Be something users ask for
- Be achievable in one build session

Good examples:
- If core = create content → #2 = save/organize content
- If core = track progress → #2 = see history/analytics
- If core = analyze data → #2 = export/share results

STEP 2: LET AI DESIGN IT
Copy this prompt into Claude or ChatGPT:

---
"I'm building [APP NAME]. My core feature is [CORE FEATURE].

For my second feature, I want to add: [FEATURE #2 DESCRIPTION]

Design this feature completely:

1. HOW IT CONNECTS TO CORE
   - Where do users access this from?
   - How does data flow from core feature to this?

2. COMPLETE USER FLOW
   - Step by step, what happens?
   - What does each screen show?

3. UI SPECIFICATION
   - What components are needed?
   - Layout and arrangement
   - Key interactions

4. DATA REQUIREMENTS
   - What data is needed?
   - Where does it come from?
   - What's stored, what's calculated?

5. EDGE CASES
   - First-time user (no data yet)
   - Power user (lots of data)
   - Error states

Generate a complete prompt I can paste into Replit Agent to build this feature. Make sure it integrates properly with the existing app."
---

STEP 3: BUILD & TEST
1. Paste the generated prompt into Replit
2. Let it build
3. Test the entire user flow (including feature #1!)
4. Fix any integration issues

INTEGRATION TESTING CHECKLIST:
□ Feature #1 still works
□ Feature #2 works standalone
□ Data flows between them correctly
□ Navigation makes sense
□ No confusing dead ends`,
      outcome: "Second feature built and integrated with existing app",
      completionMessage: "Two features working together. Your app is becoming a real product. The AI did the building - you're directing the vision. That's exactly how it should work.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 14,
      title: "Git, Checkpoints & Never Losing Work",
      description: "AI sets up your safety net - proper version control so you can experiment freely without fear of breaking everything.",
      phase: "Week 2: Building Your MVP",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "AI Version Control Setup",
      aiTaskDescription: "AI generates your complete version control workflow - checkpoints, commits, and recovery procedures.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your biggest fear about making changes?",
      microDecisionOptions: JSON.stringify(["Breaking something that works", "Losing hours of work", "Not being able to undo", "Not knowing what changed"]),
      reflectionQuestion: "Think about a time you wished you could 'undo' a change. What would having that ability have saved you?",
      tip: "The best developers aren't afraid to experiment because they KNOW they can always go back. That safety comes from version control. Set it up once, use it forever.",
      lesson: `YOUR SAFETY NET: NEVER LOSE WORK AGAIN

The WORST feeling: Breaking something and not being able to get it back.

Today we eliminate that fear forever.

TODAY'S AI TASK:
Set up version control with this prompt:

---
"I'm building a SaaS project in Replit. Set up a complete version control workflow for me:

1. REPLIT CHECKPOINTS
   - How to create a checkpoint before risky changes
   - Naming convention for checkpoints
   - When to create checkpoints
   - How to rollback if needed

2. GITHUB INTEGRATION (if not already set up)
   - Connect this project to GitHub
   - Set up proper .gitignore
   - Initial commit with good message

3. COMMIT WORKFLOW
   - When to commit
   - Good commit message format
   - What to include in each commit

4. BACKUP STRATEGY
   - How to ensure I never lose work
   - What to do at end of each day
   - Emergency recovery procedures

5. DOCUMENTATION
   - Generate a README.md with:
     - What this project does
     - How to set it up
     - How to run it
     - Environment variables needed

Walk me through setting all this up right now."
---

THE CHECKPOINT RITUAL:

BEFORE any risky change:
1. Create a Replit checkpoint: "Working [feature name]"
2. Commit to GitHub: "feat: working [feature name]"
3. Now experiment freely!

IF things break badly:
1. Try one fix (2-3 minutes max)
2. Still broken? Rollback to checkpoint
3. You're back to working code
4. Try a different approach

WHEN TO CHECKPOINT:
- Something FINALLY works
- Before adding a major feature
- Before trying to fix a weird bug
- End of every build session
- Anytime you think "I don't want to lose this"

This takes 30 seconds and can save you HOURS.`,
      outcome: "Version control set up with checkpoints, GitHub, and recovery workflow",
      completionMessage: "Week 2 COMPLETE! You've built two features, learned to debug with AI, and set up safety nets. You're building like a real developer now - fast, with confidence. Next week: APIs and superpowers!",
      xpReward: 100,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 3: APIs, INTEGRATIONS & POLISH (Days 15-21)
    // ============================================
    {
      day: 15,
      title: "Introduction to APIs",
      description: "Understanding APIs - how to plug in AI magic and third-party services.",
      phase: "Week 3: APIs & Integrations",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "API Fundamentals",
      aiTaskDescription: "Learn what APIs are and how they'll supercharge your SaaS.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Which API interests you most?",
      microDecisionOptions: JSON.stringify(["AI/OpenAI", "Payments/Stripe", "Email", "Storage"]),
      reflectionQuestion: "What functionality would make your SaaS amazing that you couldn't build yourself?",
      tip: "Finding the right APIs is what brings absolute MAGIC to your software. You can plug in functionality that would take YEARS to build yourself.",
      lesson: `WHAT IS AN API?

API = How two pieces of software communicate with each other.

Think of it like ordering food:
- You (your app) tell the waiter (API) what you want
- The kitchen (external service) makes it
- Waiter brings it back to you

WHY APIs ARE MAGIC:
- Want AI image generation? There's an API for that
- Want to send emails? There's an API for that
- Want to process payments? There's an API for that
- Want speech-to-text? There's an API for that

You can get your SaaS to do ANYTHING because even if Replit can't code it, you can plug an API into it!

COMMON APIs YOU'LL USE:
- OpenAI API - AI text/image generation
- Stripe - Payment processing
- Resend/SendGrid - Email delivery
- Twilio - SMS messaging
- AWS S3 - File storage

Each API has documentation. You can literally ask Claude: "How do I integrate [API] into my Replit project?"`,
      outcome: "Understanding of APIs and which ones your SaaS needs",
      completionMessage: "You now understand the MAGIC of APIs. Tomorrow: adding your first AI integration.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 16,
      title: "Adding Your First API Integration",
      description: "Integrate OpenAI or Claude API to add AI-powered features to your SaaS.",
      phase: "Week 3: APIs & Integrations",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "AI API Integration",
      aiTaskDescription: "Connect OpenAI or Claude API to add intelligent features to your product.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Which AI provider?",
      microDecisionOptions: JSON.stringify(["OpenAI", "Claude/Anthropic", "Both", "Other"]),
      reflectionQuestion: "What AI-powered feature will delight your users most?",
      tip: "OpenAI API is very cheap pay-as-you-go. It'll probably be the BRAIN of your project. Get it set up early.",
      lesson: `ADDING AI TO YOUR SAAS

Step 1: Get your API key
- Go to platform.openai.com or console.anthropic.com
- Create an account and generate an API key
- Add billing (pay-as-you-go, very cheap)

Step 2: Store it securely
- In Replit, use Secrets to store your API key
- NEVER put API keys in your code directly
- Name it something like OPENAI_API_KEY

Step 3: Tell the agent to integrate it
"I want to add an AI feature that [DESCRIPTION]. Use the OpenAI API key stored in secrets. When the user [ACTION], call the API and [RESULT]."

EXAMPLE PROMPTS:
"Add a feature where users can paste text and get an AI-generated summary"
"When users click 'Generate Ideas', call OpenAI to create 5 suggestions based on their input"
"Add an AI chat assistant that answers questions about [TOPIC]"

The agent knows how to integrate these APIs. Just tell it what you want!`,
      outcome: "AI API integrated with at least one AI-powered feature working",
      completionMessage: "Your SaaS now has AI superpowers! This is what makes modern software magical. Tomorrow: email integration.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 17,
      title: "Email Integration",
      description: "Set up Resend or SendGrid so your app can send emails that actually reach inboxes.",
      phase: "Week 3: APIs & Integrations",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Email Service Setup",
      aiTaskDescription: "Configure email sending so your app can send welcome emails, notifications, and more.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Which email service?",
      microDecisionOptions: JSON.stringify(["Resend", "SendGrid", "AWS SES", "Postmark"]),
      reflectionQuestion: "What's the most important email your app needs to send?",
      tip: "Use Resend or SendGrid to make your software able to send emails that actually end up in people's PRIMARY inboxes.",
      lesson: `WHY YOU NEED EMAIL

Your SaaS needs to send emails:
- Welcome emails when users sign up
- Password reset emails
- Notification emails
- Onboarding sequences

WITHOUT proper email setup, your emails go to SPAM!

RECOMMENDED: Resend or SendGrid
Both are developer-friendly and have generous free tiers.

SETUP STEPS:
1. Create account at resend.com or sendgrid.com
2. Verify your domain (follow their DNS instructions)
3. Get your API key
4. Store in Replit Secrets
5. Ask agent to integrate

TELL THE AGENT:
"Set up email sending using Resend. API key is in secrets as RESEND_API_KEY. Create a welcome email that sends when users sign up with their name and a getting started guide."

IMPORTANT: Domain verification can take 24-48 hours. Start this today!`,
      outcome: "Email service integrated with welcome emails working",
      completionMessage: "Your app can now communicate with users via email. This is essential for any real SaaS. Tomorrow: authentication.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 18,
      title: "Authentication & User Management",
      description: "Set up secure user authentication - sign up, login, password reset, and user sessions.",
      phase: "Week 3: APIs & Integrations",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Auth System Setup",
      aiTaskDescription: "Implement secure authentication so users can create accounts and log in.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Primary auth method?",
      microDecisionOptions: JSON.stringify(["Email/Password", "Social login (Google)", "Magic link", "All options"]),
      reflectionQuestion: "How can you make signup as frictionless as possible?",
      tip: "Most SAAS projects need: Sign up, Login, Logout, Password reset, and Session management. The agent can build all of this.",
      lesson: `AUTHENTICATION ESSENTIALS

Your users need to:
- Create an account
- Log in securely
- Stay logged in (sessions)
- Reset forgotten passwords
- Log out

TELL THE AGENT:
"Set up user authentication with:
- Email and password signup/login
- Password reset via email
- Secure session management
- Redirect to dashboard after login
- Protect dashboard routes from non-logged-in users"

SECURITY BASICS:
- Passwords should be hashed (never stored in plain text)
- Use HTTPS (Replit handles this)
- Sessions should expire after inactivity
- Password reset links should expire

OPTIONAL ADDITIONS:
- Social login (Google, GitHub)
- Two-factor authentication
- Email verification before access

Start simple. You can add more later.`,
      outcome: "Secure authentication system with signup, login, and password reset",
      completionMessage: "Your SaaS now has real user accounts! Users can sign up and log in securely. Tomorrow: getting paid.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 19,
      title: "Payment Integration (Stripe)",
      description: "Set up Stripe so you can accept payments and charge subscriptions.",
      phase: "Week 3: APIs & Integrations",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Stripe Payment Setup",
      aiTaskDescription: "Integrate Stripe to accept payments for your SaaS subscriptions.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Payment model?",
      microDecisionOptions: JSON.stringify(["Monthly subscription", "Annual subscription", "One-time + subscription", "Usage-based"]),
      reflectionQuestion: "What will your launch pricing be?",
      tip: "Hook up Stripe for payment processing. The agent can handle most of this - just tell it your pricing tiers.",
      lesson: `GETTING PAID WITH STRIPE

Stripe is the industry standard for SaaS payments. It handles:
- Credit card processing
- Subscription management
- Invoices
- Failed payment recovery

SETUP STEPS:
1. Create account at stripe.com
2. Get your API keys (test AND live)
3. Store in Replit Secrets (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY)
4. Create your products/prices in Stripe dashboard

TELL THE AGENT:
"Integrate Stripe for payments. I have 2 tiers:
- Basic: $29/month
- Pro: $79/month
Create a pricing page, checkout flow, and webhook to handle successful payments. Update user's subscription status in the database."

IMPORTANT:
- Start with TEST mode (use test API keys)
- Test the full flow before going live
- Handle failed payments gracefully
- Show users their subscription status

You can go live when you're ready by switching to live API keys.`,
      outcome: "Stripe integrated with working checkout flow and subscription management",
      completionMessage: "Your SaaS can now make money! This is huge. You have a real, monetizable product. Tomorrow: polish time.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 20,
      title: "UI/UX Polish",
      description: "Make your app look professional - consistent styling, responsive design, and delightful details.",
      phase: "Week 3: APIs & Integrations",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Visual Polish",
      aiTaskDescription: "Clean up the UI, ensure mobile responsiveness, and add professional touches.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What needs the most polish?",
      microDecisionOptions: JSON.stringify(["Mobile responsiveness", "Consistent styling", "Loading states", "Error handling"]),
      reflectionQuestion: "What would make your app feel more premium?",
      tip: "You CAN screenshot tools you like and feed them to Replit. It might do a good job of something similar - just don't copy direct competitors.",
      lesson: `MAKING IT LOOK PRO

Your MVP works. Now let's make it LOOK like it works.

QUICK WINS:
1. Consistent colors and fonts throughout
2. Proper spacing and alignment
3. Loading states (spinners, skeletons)
4. Error messages that help (not just "Error!")
5. Mobile responsive design

TELL THE AGENT:
"Review the UI and make it more professional:
- Ensure consistent spacing and typography
- Add loading states to all async actions
- Make sure it looks good on mobile
- Improve error messages to be helpful
- Add subtle hover states to buttons"

SCREENSHOT METHOD:
Find a SaaS you love the look of (NOT a competitor). Screenshot their UI. Show it to the agent: "Make my dashboard look more like this style - clean, modern, with good spacing."

PRIORITY ORDER:
1. Mobile works (most users are on mobile)
2. Core flows look polished
3. Edge cases handled gracefully
4. Delightful small touches (animations, micro-interactions)`,
      outcome: "Professional-looking UI with mobile responsiveness and polished interactions",
      completionMessage: "Your app now LOOKS like a real product. First impressions matter, and yours is now making a great one. Tomorrow: final testing.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 21,
      title: "Final Testing, Bug Fixes & Launch Prep",
      description: "Complete testing of all features, fix remaining bugs, and prepare for launch.",
      phase: "Week 3: APIs & Integrations",
      videoUrl: null,
      aiTaskType: "setup",
      aiTaskTitle: "Launch Preparation",
      aiTaskDescription: "Final QA pass, bug fixes, and pre-launch checklist.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Launch readiness?",
      microDecisionOptions: JSON.stringify(["Ready to go!", "Few bugs left", "Need more polish", "Major issues"]),
      reflectionQuestion: "What's the ONE thing that must work perfectly at launch?",
      tip: "Test as a NEW user. Sign up fresh. Go through every flow. Fix anything confusing or broken. Then do it again.",
      lesson: `LAUNCH PREP CHECKLIST

FULL USER FLOW TEST:
1. Sign up as a completely new user
2. Complete onboarding
3. Use every core feature
4. Upgrade to paid (test mode)
5. Manage account settings
6. Log out and back in

CHECK EACH:
□ Signup works and sends welcome email
□ Login works (and password reset)
□ Core features work correctly
□ Payment flow works (test mode)
□ Mobile experience is good
□ Error messages are helpful
□ Loading states exist
□ Data saves and persists

BUG PRIORITY:
- P0: Blocks core functionality - FIX NOW
- P1: Annoying but workaround exists - Fix before launch
- P2: Minor issues - Can fix after launch
- P3: Nice to have - Add to V2 list

FINAL TOUCHES:
- Favicon and app title
- 404 page
- Terms of service page
- Privacy policy page (AI can write these)`,
      outcome: "All critical bugs fixed, full testing complete, ready for launch",
      completionMessage: "Week 3 COMPLETE! You have a REAL, working SaaS product with AI features, email, auth, payments, and professional polish. You built this in 21 days. Most people take YEARS. You're ready for users!",
      xpReward: 150,
      estimatedMinutes: 5,
    },

    // ============================================
    // WEEK 4: ADVANCED FEATURES & POLISH (Days 22-30)
    // ============================================
    {
      day: 22,
      title: "UX Audit: Making Your App Feel Professional",
      description: "AI analyzes your app and identifies exactly where you need better user feedback - then generates the code to fix it.",
      phase: "Week 4: Advanced Features & Polish",
      videoUrl: null,
      aiTaskType: "audit",
      aiTaskTitle: "AI UX Audit",
      aiTaskDescription: "Describe your app's main user actions. AI will identify friction points and generate the exact code to add professional feedback patterns.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your app's personality?",
      microDecisionOptions: JSON.stringify(["Minimal & clean - subtle feedback", "Friendly & warm - encouraging messages", "Professional & serious - formal confirmations", "Fun & playful - delightful surprises"]),
      reflectionQuestion: "Think about the last app you used that felt 'premium'. What made it feel that way?",
      tip: "The difference between a $10 app and a $100 app isn't features - it's feel. Every click should have a response. Every action should feel acknowledged.",
      lesson: `THE UX AUDIT: WHERE DOES YOUR APP FEEL "OFF"?

Amateur apps feel clunky. Professional apps feel smooth. The difference? Feedback loops.

TODAY'S AI TASK:
Copy this prompt into Claude or ChatGPT, filling in YOUR app details:

---
"I'm building [YOUR APP NAME] - [ONE SENTENCE DESCRIPTION].

Here are the main actions users take:
1. [ACTION 1 - e.g., "Create a new project"]
2. [ACTION 2 - e.g., "Save their work"]
3. [ACTION 3 - e.g., "Delete items"]
4. [ACTION 4 - e.g., "Submit a form"]
5. [ACTION 5 - e.g., "Complete a task"]

For each action, tell me:
1. What feedback should the user see? (toast, modal, animation, sound?)
2. What could go wrong and how should we handle it?
3. What would make this feel DELIGHTFUL, not just functional?

Then generate the exact code I need to implement:
- A toast notification system (use sonner or react-hot-toast)
- Confirmation modals for destructive actions
- Success states that feel rewarding
- Error states that are helpful, not scary

Make the code production-ready for a React + TypeScript app."
---

WHAT YOU'LL GET:
The AI will analyze YOUR specific app and generate:
- Custom toast messages for your actions
- Modal components for confirmations
- Micro-interactions that match your app's personality
- Error handling that doesn't make users feel stupid

THE PROFESSIONAL TOUCH:
- Success toasts: "Project created!" with a subtle checkmark
- Error toasts: "Couldn't save - check your connection" (not "ERROR 500")
- Confirmation modals: "Delete this project? This can't be undone."
- Loading states: Skeleton screens, not spinning wheels

Copy the AI's code directly into Replit and watch your app transform.`,
      outcome: "AI-generated feedback system implemented - toasts, modals, and micro-interactions working",
      completionMessage: "Your app now FEELS different. Users might not notice the changes consciously, but they'll trust your app more. That's the power of good UX.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 23,
      title: "Dashboard Builder: Visualize Your Data",
      description: "AI designs a custom dashboard for YOUR app's data - complete with charts, stats, and insights your users actually need.",
      phase: "Week 4: Advanced Features & Polish",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Dashboard Designer",
      aiTaskDescription: "Tell AI about your app's data. It will design and generate a complete dashboard with the right visualizations.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's the PRIMARY insight your users need?",
      microDecisionOptions: JSON.stringify(["Progress over time - 'Am I improving?'", "Comparisons - 'How do I stack up?'", "Totals & achievements - 'What have I accomplished?'", "Activity feed - 'What's happening now?'"]),
      reflectionQuestion: "If your users could only see ONE number when they log in, what should it be?",
      tip: "The best dashboards answer ONE question instantly. Don't build a dashboard that needs explanation - build one that makes users say 'Oh, I get it' in 2 seconds.",
      lesson: `BUILDING A DASHBOARD THAT ACTUALLY HELPS

Most dashboards are useless - too much data, no insight. Let's build one that matters.

TODAY'S AI TASK:
Copy this prompt into Claude or ChatGPT:

---
"I'm building [YOUR APP NAME] - [ONE SENTENCE DESCRIPTION].

My app tracks this data:
- [DATA TYPE 1 - e.g., "User tasks completed per day"]
- [DATA TYPE 2 - e.g., "Time spent on each project"]
- [DATA TYPE 3 - e.g., "Revenue per customer"]
- [DATA TYPE 4 - e.g., "Feature usage stats"]

My users care most about: [THE ONE KEY METRIC]

Design a dashboard that:
1. Shows the ONE most important number prominently
2. Uses the RIGHT chart type for each data set
3. Answers the question: [WHAT QUESTION SHOULD THE DASHBOARD ANSWER?]

Generate complete React + TypeScript code using Recharts including:
- A stats overview section with key numbers
- 2-3 charts that tell a story
- Proper loading states
- Mobile-responsive layout

Make it clean and minimal - no chart junk."
---

CHART TYPES CHEAT SHEET:
- LINE CHART: Trends over time (daily/weekly/monthly)
- BAR CHART: Comparing categories or periods
- DONUT CHART: Parts of a whole (use sparingly!)
- SINGLE NUMBER: When one metric matters most
- PROGRESS BAR: Toward a goal

THE GOLDEN RULE:
Every chart should answer a question. If you can't state the question, delete the chart.

BAD: "Here's all your data in 12 charts"
GOOD: "You're 73% to your monthly goal. Here's your trend."

Paste the AI's code into Replit. You now have a dashboard that actually means something.`,
      outcome: "Custom dashboard with meaningful visualizations - stats, charts, and insights that users actually need",
      completionMessage: "You just turned raw data into insights. Your users can now see their progress at a glance - that's what keeps them coming back.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 24,
      title: "AI Builds Your Admin Dashboard",
      description: "Paste your app description. AI analyzes it, tells you EXACTLY what admin features you need, and generates the complete build prompt. Zero thinking required.",
      phase: "Week 4: Advanced Features & Polish",
      videoUrl: null,
      aiTaskType: "audit",
      aiTaskTitle: "AI Admin Audit",
      aiTaskDescription: "Paste your PRD or app description from Day 6. AI analyzes your app and generates a complete, customized admin dashboard - telling you exactly what you need and why.",
      suggestions: null,
      template: null,
      microDecisionQuestion: null,
      microDecisionOptions: null,
      reflectionQuestion: null,
      tip: "You don't need to figure out what admin features you need. AI will analyze YOUR specific app and tell you. Then it builds the whole thing. Your job is to paste and review.",
      lesson: `AI BUILDS YOUR ADMIN: ZERO THINKING REQUIRED

Stop trying to figure out what admin features you need. Let AI analyze your app and TELL you.

HERE'S WHAT'S ABOUT TO HAPPEN:

1. You paste your app description (the PRD from Day 6)
2. AI analyzes it and identifies exactly what you need to manage
3. AI generates your complete admin dashboard specification
4. You paste that into Replit and watch it build

That's it. No decisions. No guessing. AI does the thinking.

STEP 1: GRAB YOUR APP DESCRIPTION

Go back to Day 6 and copy your PRD. Or just write a quick summary:
- What your app does
- Who it's for
- What users create/do in the app
- How you charge (if applicable)

STEP 2: PASTE THIS PROMPT INTO CLAUDE OR CHATGPT

---
"I need you to analyze my SaaS app and design the PERFECT admin dashboard for it.

HERE'S MY APP:
[PASTE YOUR PRD OR APP DESCRIPTION HERE]

YOUR JOB:

1. ANALYZE MY APP
   Look at what my app does and tell me:
   - What data will I need to monitor daily?
   - What user actions will I need to manage?
   - What could go wrong that I need to catch?
   - What metrics actually matter for THIS specific business?

2. DESIGN MY ADMIN DASHBOARD
   Based on your analysis, create a complete admin specification with:

   THE HOMEPAGE DASHBOARD
   - What 4-6 key numbers should I see the moment I log in?
   - What charts/graphs would actually be useful?
   - What alerts need my immediate attention?

   USER MANAGEMENT
   - What user info do I need to see and edit?
   - What filters make sense for MY type of users?
   - What actions do I need (beyond basic edit/delete)?

   [MAIN ENTITY] MANAGEMENT
   - Based on what users create in my app, what do I need to manage?
   - How should I organize and filter this content?
   - What bulk actions would save me time?

   REVENUE/BILLING (if applicable)
   - What payment info do I need quick access to?
   - How do I handle refunds, upgrades, failed payments?

   DANGER ZONE
   - What could break that I need to monitor?
   - What early warning signs should trigger alerts?

3. GENERATE THE BUILD PROMPT
   Now write me the EXACT prompt I should paste into Replit Agent to build this entire admin dashboard. Make it specific to my app - not generic.

   Include all pages, all components, all API routes, all database queries.

   Make it so I can paste it and the agent builds the whole thing."
---

STEP 3: REVIEW WHAT AI FOUND

AI will come back with:
- An analysis of what YOU specifically need (not generic advice)
- A complete admin design tailored to YOUR app
- A ready-to-paste prompt for Replit

Read through the analysis. Does it make sense? Did AI catch things you hadn't thought of?

If something's missing, just say: "Also add [X] because [reason]"

STEP 4: BUILD IT

Take that generated prompt → Paste into Replit Agent → Watch your admin get built.

WHAT YOU'LL END UP WITH:

□ A dashboard showing YOUR key metrics at a glance
□ User management tailored to YOUR user data
□ Content management for whatever YOUR users create
□ Revenue tracking if you're charging
□ Alerts for things that could go wrong in YOUR specific app
□ Quick actions that save YOU time based on YOUR workflows

All of it specific to your app. Not some generic template.

THE MAGIC:
You didn't have to figure out what you need.
You didn't have to design anything.
You didn't have to write a single spec.

AI analyzed YOUR app and built YOUR admin.

That's the power of letting AI do the thinking.`,
      outcome: "AI-designed admin dashboard built specifically for YOUR app - not a template, a custom solution",
      completionMessage: "AI just analyzed your entire app and built you a custom admin dashboard. You didn't have to figure out what you needed - AI told you. This is how you build fast: let AI do the thinking, you do the directing.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 25,
      title: "Smart Search & Filtering",
      description: "AI builds a complete search system for YOUR app - instant results, smart filters, and a UX that makes finding things effortless.",
      phase: "Week 4: Advanced Features & Polish",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Search Builder",
      aiTaskDescription: "Describe what users search for in your app. AI generates a complete search system with filters, sorting, and instant results.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How do your users think about finding things?",
      microDecisionOptions: JSON.stringify(["By name/title - they know what they're looking for", "By category/type - they're browsing options", "By date - they want recent or historical", "By status - they need to filter by state"]),
      reflectionQuestion: "What's the most frustrating search experience you've ever had? What made it bad?",
      tip: "Good search is invisible. Users don't think 'wow, great search!' - they just find what they need instantly. Bad search makes users leave.",
      lesson: `SEARCH THAT DOESN'T SUCK

Bad search = frustrated users = churn. Let's build search that just works.

TODAY'S AI TASK:
Copy this prompt into Claude or ChatGPT:

---
"I'm building [YOUR APP NAME] - [ONE SENTENCE DESCRIPTION].

Users search for: [MAIN SEARCHABLE ENTITY - e.g., "projects", "recipes", "documents"]

Each item has these fields:
- [FIELD 1 - e.g., "title (text)"]
- [FIELD 2 - e.g., "category (enum: work, personal, ideas)"]
- [FIELD 3 - e.g., "status (enum: active, completed, archived)"]
- [FIELD 4 - e.g., "createdAt (date)"]
- [FIELD 5 - e.g., "tags (array)"]

Build a complete search and filter system:

1. SEARCH BAR
   - Searches across [which fields?]
   - Debounced (300ms delay)
   - Shows loading state
   - "No results" with helpful suggestion

2. FILTERS
   - Filter by [FILTER 1 - e.g., category dropdown]
   - Filter by [FILTER 2 - e.g., status toggles]
   - Filter by [FILTER 3 - e.g., date range]
   - Clear all filters button

3. SORTING
   - Sort by: [OPTIONS - e.g., newest, oldest, alphabetical, most used]
   - Remember user's preference

4. URL SYNC
   - Store search/filter state in URL
   - Users can share/bookmark filtered views

5. RESULTS
   - Highlight matching text
   - Show result count
   - Pagination or infinite scroll

Generate complete React + TypeScript code with:
- Frontend search component
- API route with proper filtering
- Database query optimization"
---

SEARCH UX BEST PRACTICES:
- Instant feedback (show loading, show count)
- Preserve scroll position when filtering
- Remember recent searches
- Suggest popular searches when empty
- Handle typos gracefully

THE TECHNICAL BITS:
- Debounce: Don't search on every keystroke
- Backend filtering: Don't fetch everything then filter
- Indexes: Add database indexes on searchable fields

Paste the code into Replit. Test it with real data.`,
      outcome: "Complete search system with filters, sorting, URL sync, and instant results",
      completionMessage: "Finding things in your app is now effortless. This seemingly simple feature is what separates amateur apps from professional ones.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 26,
      title: "Data Export & Portability",
      description: "AI generates complete export functionality - CSV, PDF reports, and data downloads that build trust with your users.",
      phase: "Week 4: Advanced Features & Polish",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Export Builder",
      aiTaskDescription: "Tell AI what data users have. It generates complete export features with proper formatting and professional PDF reports.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What would your users do with exported data?",
      microDecisionOptions: JSON.stringify(["Analyze in spreadsheets - they want CSV/Excel", "Share with others - they need PDF reports", "Backup their work - they want full data dump", "Import elsewhere - they need standard formats"]),
      reflectionQuestion: "Have you ever been trapped in an app that wouldn't let you export your data? How did that feel?",
      tip: "Export features build trust. Users think 'I'm not locked in - I can leave anytime.' Ironically, that makes them MORE likely to stay.",
      lesson: `DATA FREEDOM: LET YOUR USERS TAKE THEIR STUFF

Users want to know they OWN their data. Export features prove it.

TODAY'S AI TASK:
Copy this prompt into Claude or ChatGPT:

---
"I'm building [YOUR APP NAME] - [ONE SENTENCE DESCRIPTION].

Users have this data they might want to export:
- [DATA TYPE 1 - e.g., "List of projects with: name, description, status, dates"]
- [DATA TYPE 2 - e.g., "Activity history: actions, timestamps, results"]
- [DATA TYPE 3 - e.g., "Analytics: daily usage, achievements, progress"]

Build complete export functionality:

1. CSV EXPORT
   - Export [main entity] to CSV
   - Include all relevant columns with headers
   - Handle special characters (commas, quotes)
   - Filename: [entity]-export-YYYY-MM-DD.csv

2. PDF REPORT
   - Professional report layout
   - Header with app logo and date range
   - Summary statistics at top
   - Detailed data in clean table format
   - Footer with generation timestamp
   - Filename: [entity]-report-YYYY-MM-DD.pdf

3. FULL DATA EXPORT (Account Backup)
   - JSON file with ALL user data
   - Include all related entities
   - Useful for migration or backup
   - Filename: my-data-export-YYYY-MM-DD.json

4. UX
   - Export button in obvious location
   - Loading state during generation
   - Success toast when complete
   - Handle large exports gracefully

Generate React + TypeScript code using:
- CSV: Papa Parse or native generation
- PDF: jsPDF or react-pdf
- Include backend API routes"
---

PRO TIPS:
- Large exports: Generate in background, email when ready
- PDF branding: Include your logo, use your colors
- Privacy: Only export that user's data, never others'
- Dates: Use ISO format for data, human format for reports

WHAT THIS SIGNALS TO USERS:
"We don't hold your data hostage"
"We're confident you'll stay because we're good, not because you're trapped"
"We respect your ownership"

This is trust-building 101.`,
      outcome: "CSV export, PDF reports, and full data backup - users can take their data anywhere",
      completionMessage: "Your users now own their data completely. This single feature communicates more trust than any marketing copy ever could.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 27,
      title: "Mobile Audit & Responsive Overhaul",
      description: "AI audits your app for mobile issues and generates specific fixes - no more pinching, squinting, or rage-tapping tiny buttons.",
      phase: "Week 4: Advanced Features & Polish",
      videoUrl: null,
      aiTaskType: "audit",
      aiTaskTitle: "AI Mobile Audit",
      aiTaskDescription: "Describe your current layout. AI identifies mobile problems and generates the exact CSS/component fixes needed.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How do you expect most users to access your app?",
      microDecisionOptions: JSON.stringify(["Mostly desktop - but mobile should work", "50/50 split - both matter equally", "Mostly mobile - phone-first audience", "Tablet-heavy - lots of iPad users"]),
      reflectionQuestion: "Open your app on your phone right now. What's the first thing that frustrates you?",
      tip: "55% of web traffic is mobile. If your app sucks on phones, you're losing HALF your potential users before they even see your features.",
      lesson: `MOBILE REALITY CHECK

Open your app on your phone. Be honest: is it good?

TODAY'S AI TASK:
First, actually test your app on your phone (or Chrome DevTools mobile view).
Note every problem you see. Then copy this prompt:

---
"I'm building [YOUR APP NAME] - [ONE SENTENCE DESCRIPTION].

Here are the mobile issues I've found:
1. [ISSUE 1 - e.g., "Navigation bar is too cramped, buttons overlap"]
2. [ISSUE 2 - e.g., "Text is too small to read on the dashboard"]
3. [ISSUE 3 - e.g., "Forms are hard to fill out, keyboard covers inputs"]
4. [ISSUE 4 - e.g., "Tables don't fit, have to scroll horizontally constantly"]
5. [ISSUE 5 - e.g., "Buttons are too small to tap accurately"]

My current layout:
- Navigation: [DESCRIBE - e.g., "Top bar with 5 nav items"]
- Main screens: [DESCRIBE - e.g., "Dashboard, list view, detail view, settings"]
- Complex areas: [DESCRIBE - e.g., "Data tables with 6 columns"]

Generate a complete mobile-responsive overhaul:

1. NAVIGATION
   - Convert to hamburger menu or bottom tabs on mobile
   - Make touch targets 44px minimum

2. TYPOGRAPHY
   - Minimum 16px font size (prevents iOS zoom)
   - Proper line height for readability
   - Don't make users pinch to read

3. FORMS
   - Full-width inputs on mobile
   - Proper input types (email, tel, number)
   - Labels above fields, not beside
   - Form doesn't shift when keyboard appears

4. TABLES → CARDS
   - Convert data tables to stacked cards on mobile
   - Or make tables horizontally scrollable
   - Priority: show most important info first

5. TOUCH TARGETS
   - All buttons 44x44px minimum
   - Adequate spacing between tap targets
   - No hover-only interactions

Generate specific CSS/Tailwind and component changes for each issue."
---

THE MOBILE TESTING CHECKLIST:
□ Can I read all text without zooming?
□ Can I tap all buttons without mis-clicking?
□ Do forms work with the keyboard up?
□ Does navigation work with one thumb?
□ Do images and tables fit the screen?

Do this on a REAL phone, not just DevTools.`,
      outcome: "App fully tested and working on mobile - proper navigation, readable text, tappable buttons",
      completionMessage: "You just unlocked half of the internet. Mobile users can now actually use your app. That's not a nice-to-have, that's survival.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 28,
      title: "Performance Audit & Speed Boost",
      description: "AI analyzes your app for performance bottlenecks and generates specific optimizations - faster loads, snappier interactions.",
      phase: "Week 4: Advanced Features & Polish",
      videoUrl: null,
      aiTaskType: "audit",
      aiTaskTitle: "AI Performance Audit",
      aiTaskDescription: "Tell AI about your current performance issues. It identifies bottlenecks and generates specific fixes.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "Where does your app feel slowest?",
      microDecisionOptions: JSON.stringify(["Initial page load - takes forever to see content", "Navigation - switching pages feels sluggish", "Data operations - saving/loading feels slow", "Everything feels fine, but I want it faster"]),
      reflectionQuestion: "Time yourself: how many seconds from hitting enter to seeing your app fully loaded? Be honest.",
      tip: "A 1-second delay = 7% drop in conversions. A 3-second load = 53% of mobile users leave. Speed is literally money.",
      lesson: `MAKE IT FAST: PERFORMANCE THAT MATTERS

Slow apps lose users. Fast apps win. Here's how to diagnose and fix.

STEP 1: MEASURE FIRST
Open Chrome DevTools → Lighthouse → Run audit
Note your scores:
- Performance: ___
- First Contentful Paint: ___
- Largest Contentful Paint: ___
- Time to Interactive: ___

STEP 2: AI ANALYSIS
Copy this prompt into Claude or ChatGPT:

---
"I'm building [YOUR APP NAME] - [ONE SENTENCE DESCRIPTION].

Here's my current performance situation:
- Lighthouse Performance Score: [SCORE]
- First Contentful Paint: [TIME]
- Largest Contentful Paint: [TIME]
- Time to Interactive: [TIME]

Current issues I've noticed:
1. [ISSUE 1 - e.g., "Initial load takes 4+ seconds"]
2. [ISSUE 2 - e.g., "Dashboard feels sluggish with data"]
3. [ISSUE 3 - e.g., "Images load slowly"]

My tech stack:
- Frontend: [e.g., React, Next.js]
- Backend: [e.g., Node/Express]
- Database: [e.g., PostgreSQL]
- Hosting: [e.g., Replit, Vercel]

Analyze my performance and generate specific fixes:

1. IMAGE OPTIMIZATION
   - Convert to WebP
   - Proper sizing
   - Lazy loading
   - Generate the code

2. API OPTIMIZATION
   - Reduce unnecessary calls
   - Add caching
   - Pagination for lists
   - Generate the code

3. LOADING STATES
   - Skeleton screens instead of spinners
   - Optimistic updates
   - Progressive loading
   - Generate the code

4. CODE SPLITTING
   - Lazy load routes
   - Dynamic imports for heavy components
   - Generate the code

5. DATABASE
   - Add indexes for common queries
   - Optimize N+1 problems
   - Generate the queries

Give me specific, copy-paste-ready code for each fix."
---

QUICK WINS (Do These Today):
1. Compress images with TinyPNG or Squoosh
2. Add loading="lazy" to images below the fold
3. Remove unused npm packages
4. Add indexes to frequently-queried database columns

TARGET SCORES:
- Performance: > 80
- FCP: < 1.8s
- LCP: < 2.5s
- TTI: < 3.9s`,
      outcome: "Measurably faster app - optimized images, efficient APIs, proper loading states",
      completionMessage: "Speed is a competitive advantage. Your users will feel the difference even if they can't articulate it. This is polish that matters. But here's the truth: a polished app without a business strategy is just an expensive hobby. Something to think about as you finish these final days...",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 29,
      title: "Bulletproof Error Handling",
      description: "AI reviews your app and generates comprehensive error handling - graceful failures, helpful messages, and logging that saves your sanity.",
      phase: "Week 4: Advanced Features & Polish",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Error System Builder",
      aiTaskDescription: "Tell AI about your app's operations. It generates complete error handling - boundaries, messages, and logging.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "What's your error philosophy?",
      microDecisionOptions: JSON.stringify(["Protective - catch everything, never show raw errors", "Transparent - tell users exactly what went wrong", "Helpful - explain the error AND how to fix it", "Minimal - simple 'try again' for everything"]),
      reflectionQuestion: "What's the worst error message you've ever seen in an app? What made it so bad?",
      tip: "Your users WILL hit errors. The question is: will they see 'ERROR: ECONNREFUSED 127.0.0.1:5432' or 'Having trouble connecting. Check your internet and try again.'?",
      lesson: `ERROR HANDLING: WHEN (NOT IF) THINGS BREAK

Things WILL break. Networks fail. Servers hiccup. Users do unexpected things. Your job: fail gracefully.

TODAY'S AI TASK:
Copy this prompt into Claude or ChatGPT:

---
"I'm building [YOUR APP NAME] - [ONE SENTENCE DESCRIPTION].

Here are the main operations that could fail:
1. [OPERATION 1 - e.g., "User login/authentication"]
2. [OPERATION 2 - e.g., "Saving user data"]
3. [OPERATION 3 - e.g., "Loading dashboard data"]
4. [OPERATION 4 - e.g., "Processing payments"]
5. [OPERATION 5 - e.g., "Third-party API calls"]

Generate a complete error handling system:

1. ERROR BOUNDARY (React)
   - Catch crashes, show friendly fallback
   - Allow user to "try again"
   - Report error to logging

2. API ERROR HANDLING
   - Consistent try/catch pattern
   - Different messages for different errors:
     - Network error → "Connection problem"
     - 401 → "Please log in again"
     - 403 → "You don't have permission"
     - 404 → "Not found"
     - 500 → "Something went wrong on our end"
   - Never show raw error messages to users

3. FORM VALIDATION ERRORS
   - Inline error messages
   - Clear, specific feedback
   - Don't clear the form on error

4. TOAST NOTIFICATIONS
   - Error toasts for failures
   - Include "try again" action when possible
   - Auto-dismiss after 5 seconds

5. ERROR LOGGING
   - Log to console in development
   - Log to database/service in production
   - Include: error message, stack trace, user ID, timestamp, action attempted

6. OFFLINE HANDLING
   - Detect when offline
   - Queue actions to retry
   - Show offline indicator

Generate complete React + TypeScript code for all of this."
---

ERROR MESSAGE WRITING GUIDE:
BAD: "Error: ECONNREFUSED"
BAD: "Something went wrong"
GOOD: "Couldn't save your changes. Check your internet and try again."
GOOD: "This email is already registered. Try logging in instead?"

THE FORMULA:
[What happened] + [Why it might have happened] + [What to do next]

ERROR LOGGING SAVES LIVES:
When a user reports "it's broken", you need to know:
- What they were doing
- What error occurred
- When it happened
- What their state was

Without logging, you're flying blind.`,
      outcome: "Complete error handling - boundaries, friendly messages, and logging that helps you debug",
      completionMessage: "Your app now fails gracefully. When things break (and they will), users get help instead of cryptic messages, and you get the logs to fix it. Tomorrow is your final day. You've built something real - but building an app and building a business are two very different things.",
      xpReward: 100,
      estimatedMinutes: 5,
    },
    {
      day: 30,
      title: "Launch Ready: Final Polish & What's Next",
      description: "AI generates your personalized launch checklist, README, and final polish tasks. Then we talk about what REALLY comes next.",
      phase: "The Finisher",
      videoUrl: null,
      aiTaskType: "generator",
      aiTaskTitle: "AI Launch Prep",
      aiTaskDescription: "Tell AI about your app. It generates a personalized launch checklist and README tailored to your specific project.",
      suggestions: null,
      template: null,
      microDecisionQuestion: "How do you feel right now?",
      microDecisionOptions: JSON.stringify(["Proud - I can't believe I actually built this", "Nervous - Is it good enough to show people?", "Excited - I want to get this in front of users", "Exhausted - but ready to push through"]),
      reflectionQuestion: "30 days ago, this was just an idea. Look at what you've built. What surprised you most about this journey?",
      tip: "Most people never finish anything. You did. That alone puts you in the top 1%. The code doesn't have to be perfect. It has to work and solve a real problem.",
      lesson: `DAY 30: YOU ACTUALLY DID IT

30 days ago, this was an idea. Today, it's real software.

Let's make sure you're truly launch-ready.

FINAL AI TASK:
Copy this prompt into Claude or ChatGPT:

---
"I've just completed building [YOUR APP NAME] - [ONE SENTENCE DESCRIPTION].

Tech stack: [YOUR STACK]
Main features: [LIST YOUR FEATURES]
Target users: [WHO IS THIS FOR]

Generate three things for me:

1. PERSONALIZED LAUNCH CHECKLIST
   Based on my specific app, what do I need to verify before launch?
   Include: security checks, functionality tests, edge cases, legal requirements
   Be specific to MY app, not generic

2. README.md
   Generate a complete README for my GitHub repo including:
   - Project description
   - Features list
   - Tech stack
   - Setup instructions
   - Environment variables needed
   - How to contribute (if open source)

3. PRE-LAUNCH POLISH
   What are the TOP 5 small things I should fix/add before showing this to users?
   Be specific and actionable."
---

THE FINAL CHECKLIST:

SECURITY
□ No API keys in code (use environment variables)
□ Authentication working properly
□ Admin routes protected
□ User data isolated (can't see others' data)

FUNCTIONALITY
□ All core features tested
□ Forms validate properly
□ Error handling in place
□ Mobile works

POLISH
□ Loading states present
□ Success/error feedback
□ No broken links
□ No console errors

BACKUP
□ Code in GitHub
□ Database backed up
□ Environment variables documented

---

WHAT YOU'VE BUILT:
- A real, working SaaS application
- User authentication
- Core features that solve a problem
- Professional UI/UX with feedback
- Admin dashboard
- Search and filtering
- Data export
- Mobile-responsive design
- Error handling
- Performance optimization

---

THE HONEST TRUTH ABOUT WHAT'S NEXT:

You've done what 99% of people never do. You shipped.

But here's what nobody tells you: an app is NOT a business.

Most builders get stuck right here. They have a working product but no idea how to:
- Position it so the right people find it
- Price it so people actually pay
- Get their first 10 paying customers
- Scale beyond word-of-mouth
- Build systems that generate consistent income

The technical skills that got you here won't get you there. Building a business requires completely different skills: positioning, pricing, sales, marketing, systems.

That's exactly what I help with.

If you're serious about turning this into real income - not just a side project that collects dust - I offer 1:1 mentorship where we work together on the BUSINESS side.

Apply here: https://www.mattwebley.com/workwithmatt

Most people never finish. You did. That makes you different.

Now let's see if you're ready to build the business too.`,
      outcome: "Launch checklist complete, README generated, app polished and ready for real users",
      completionMessage: "You did it. 30 days ago, this was just an idea. Today, it's a real SaaS. Most people never finish anything. You shipped. That makes you a builder. But building an app and building a business are two different things. If you want 1:1 help turning this into real income, apply here: https://www.mattwebley.com/workwithmatt",
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
