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
      name: "The Launcher",
      description: "Completed all 21 days and LAUNCHED!",
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

  // Seed day content (21 days)
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
      lesson: `Claude Code is your AI pair programmer. But like any tool, you need to know HOW to use it.

THE GOLDEN RULES OF CLAUDE CODE:

1. BE SPECIFIC, NOT VAGUE
❌ "Make it look better"
✅ "Add padding of 16px around all cards, make the primary button larger with rounded corners"

2. ONE THING AT A TIME
❌ "Add login, dashboard, settings, and notifications"
✅ "Add a login form with email and password fields. Include validation and error messages."

3. GIVE CONTEXT
❌ "Fix the bug"
✅ "When I click the submit button, nothing happens. The form should send data to /api/submit and show a success message."

4. INCLUDE EXAMPLES
❌ "Make it like other apps"
✅ "Make the sidebar look like Notion's sidebar - collapsible, dark background, icons next to each item"

THE ESSENTIAL PROMPTS:

FOR BUILDING:
"Create a [component/feature] that [does what]. It should [requirements]. Style it to [match existing design]."

FOR FIXING:
"I have a bug: [describe what's happening]. Expected: [what should happen]. Actual: [what's actually happening]. Here's the error: [paste error]"

FOR IMPROVING:
"Improve the [component] by [specific change]. Keep the existing functionality but [add/change/remove] [specific thing]."

WHEN THINGS GO WRONG:
1. Don't panic - Claude Code can fix almost anything
2. Describe the problem clearly
3. Include error messages
4. Say what you were trying to do
5. Ask it to explain what went wrong

The more you use Claude Code, the better you'll get at prompting it. Start simple, be specific, iterate.`,
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
      lesson: `Time for a reality check. What did Replit actually build?

Here's the truth: AI-generated code is NEVER perfect on the first pass. That's not failure - that's NORMAL. Even the best developers iterate.

Today we find the gaps so we can fix them.

THE AUDIT PROCESS:

STEP 1: Open Your PRD
Pull up the PRD you created on Day 6. This is your checklist.

STEP 2: Test Every Feature
Go through your app and check each feature from your PRD:
✅ WORKS - Feature exists and works as expected
⚠️ PARTIAL - Feature exists but doesn't work correctly
❌ MISSING - Feature wasn't built at all

STEP 3: Document Everything
For each issue, write:
- What should happen
- What actually happens (or doesn't)
- How important is it (Critical/Important/Nice-to-have)

STEP 4: Prioritize Your Fix List
Order your issues:
1. CRITICAL - App is broken without this
2. IMPORTANT - Core functionality but can wait
3. NICE-TO-HAVE - Polish and extras

THE GAP CATEGORIES:

BROKEN FEATURES
- Things that exist but don't work
- Buttons that don't click, forms that don't submit
- These are usually quick fixes

MISSING FEATURES
- Things from your PRD that weren't built
- You'll need to prompt Claude Code to add these
- Start with the core features, not the nice-to-haves

WRONG IMPLEMENTATION
- It works but not how you wanted
- Describe specifically what should change
- Give examples of the correct behavior

After today, you'll have a clear, prioritized list of everything you need to fix. No more guessing - just execution.`,
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
      lesson: `This is the FIX DAY. Time to work through that list.

IMPORTANT: This day is designed to be PAUSED. If you have 20 things to fix, don't try to do them all in 5 minutes. Take your time. Come back tomorrow. Use the pause button.

THE FIX WORKFLOW:

1. PICK ONE ITEM
Start with the highest priority unfixed item from your list.

2. DESCRIBE IT CLEARLY
Open Claude Code and describe:
- What's wrong
- What it should do instead
- Any error messages you're seeing

3. LET AI FIX IT
Claude Code will make changes. Watch what it does.

4. TEST IMMEDIATELY
Does it work now? Yes → Mark it fixed, move to next. No → Describe what's still wrong.

5. REPEAT
Work through your list, one item at a time.

FIXING TIPS:

DON'T BATCH FIXES
Fix one thing, test it, then move on. Batching breaks things.

COMMIT WORKING CODE
After fixing something critical, commit to GitHub. "Fixed login form validation" - this creates a save point.

IT'S OK TO SKIP
If something is taking forever, skip it and come back. Often the AI figures it out after you've fixed other things.

ASK FOR EXPLANATIONS
"Why isn't this working?" is a valid prompt. Claude Code can explain the problem and solution.

THE PAUSE BUTTON:

If you're overwhelmed:
- Pause the challenge
- Work on fixes at your own pace
- Come back when you're ready

There's no prize for rushing. A working app is worth more than a fast launch.

This phase is about getting your core features WORKING. Once they work, everything else is easier.`,
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
      lesson: `Your USP is your WEAPON. It's why people choose you over the 10 other tools that do something similar.

Today we make sure that weapon is SHARP.

WHAT MAKES A GOOD USP:

1. IT'S DEMONSTRABLE
You can SHOW it, not just describe it. "We have AI" is not a USP. "Our AI writes 10 posts in 30 seconds" is.

2. IT'S DIFFERENT
Competitors can't easily copy it, or they haven't done it yet.

3. IT SOLVES A REAL PAIN
It's not a feature for the sake of features - it removes a genuine frustration.

4. IT'S IMMEDIATELY UNDERSTOOD
A user can see what it does in 5 seconds.

THE USP TEST:

STEP 1: Identify Your USP
What's the ONE thing that makes your app different? Write it down.

STEP 2: Test The Core Flow
Use your app to do the USP thing:
- Does it work?
- Is it fast?
- Is the result good?
- Would someone pay for this?

STEP 3: Compare To Competitors
Open a competitor's tool. Try to do the same thing.
- Is yours faster?
- Is yours easier?
- Is the result better?
- Is yours cheaper?

If you can't honestly say YES to at least one of these, your USP needs work.

STEP 4: Get Feedback
Show someone (friend, family, potential user):
"Watch me do this thing"
Ask: "Would you pay $X/month for that?"

Their reaction tells you everything.

IF YOUR USP DOESN'T IMPRESS:

Option 1: Improve the execution
It's the right idea, just needs to work better.

Option 2: Make it more visible
It works, but people can't see the value clearly.

Option 3: Pick a different USP
Maybe feature #2 is actually more impressive.

Your USP is your marketing message. Make it UNDENIABLE.`,
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
      lesson: `Time to test EVERYTHING.

Before you launch, you need to know every feature works. Not "probably works" - ACTUALLY works.

THE TESTING MINDSET:

Think like someone who's NEVER seen your app:
- Can they figure out what to do?
- Do buttons do what they say?
- Are error messages helpful?
- Can they complete the main task?

THE FEATURE TEST PROCESS:

FOR EACH FEATURE:

1. HAPPY PATH
Do the thing the feature is meant to do.
Does it work? Is the result correct?

2. EDGE CASES
Try weird inputs:
- Empty fields
- Very long text
- Special characters
- Numbers where text should be
- Text where numbers should be

3. ERROR HANDLING
Make it fail on purpose:
- Disconnect internet
- Use wrong credentials
- Submit invalid data
What happens? Does it crash or fail gracefully?

4. SPEED
Is it fast enough? Users expect:
- Page loads: Under 3 seconds
- Actions: Under 1 second
- AI tasks: Under 10 seconds (with loading indicator)

WHAT TO LOOK FOR:

✅ Button does what label says
✅ Form validates input before submit
✅ Error messages explain what's wrong
✅ Success states confirm what happened
✅ Loading states show something is happening
✅ Data saves and retrieves correctly
✅ Navigation makes sense

FIXING AS YOU GO:

When you find a bug:
1. Write it down (briefly)
2. Finish testing first
3. Then fix all bugs together

OR if it's critical:
1. Stop and fix it now
2. Commit the fix
3. Continue testing

After today, you'll have confidence that your features actually WORK.`,
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

This is what makes AI SaaS different from regular SaaS. Your app can THINK.

WHY ADD AI:

1. IT'S YOUR MOAT
Regular features can be copied easily. AI features are harder to replicate well.

2. IT'S THE VALUE
Users aren't paying for your UI - they're paying for what AI does for them.

3. IT'S EXPECTED
In 2025, users expect apps to be smart. No AI = feels outdated.

THE AI INTEGRATION:

STEP 1: Get API Keys

OpenAI:
- Go to platform.openai.com
- Create account, add payment
- API Keys → Create new key
- Copy it somewhere safe

Claude (optional):
- Go to console.anthropic.com
- Create account
- Get API key

STEP 2: Store Keys Safely

In Replit:
- Go to Secrets (lock icon)
- Add: OPENAI_API_KEY = [your key]
- NEVER put keys in code!

STEP 3: Add AI Feature

Tell Claude Code:
"Add an AI feature that [does what you want].

When user [triggers it]:
1. Take their [input]
2. Send to OpenAI with this instruction: [what AI should do]
3. Show result in [where]

Use OPENAI_API_KEY from secrets.
Add loading state while processing.
Handle errors gracefully."

AI FEATURE IDEAS:

FOR CONTENT APPS:
- Generate variations
- Improve/rewrite text
- Create summaries
- Translate content

FOR DATA APPS:
- Analyze patterns
- Generate insights
- Predict outcomes
- Categorize items

FOR PRODUCTIVITY:
- Auto-complete tasks
- Suggest next steps
- Summarize long content
- Extract key points

Start with ONE AI feature. Get it working perfectly. Then add more.`,
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

But here's the key: Only add what you NEED.

COMMON APIS AND WHEN TO USE THEM:

FILE STORAGE (Cloudinary, AWS S3)
Use if: Users need to upload/store files, images, documents
Don't use if: Your app is text-only

ANALYTICS (Mixpanel, PostHog, Plausible)
Use if: You need to understand user behavior
Don't use if: You're pre-launch (add this later)

EXTERNAL DATA (Various APIs)
Use if: Your app needs real-time external data
Examples: Weather, stocks, news, product data

EMAIL (Resend, SendGrid)
Use if: You need to send transactional emails
We'll cover this in detail on Day 16

PAYMENTS (Stripe)
Use if: You're charging users
We'll cover this when you're ready to monetize

THE INTEGRATION PROCESS:

1. IDENTIFY THE NEED
"I need [capability] because users need to [do what]"

2. PICK THE SERVICE
Research options. Usually go with the most popular - better docs, more examples.

3. GET CREDENTIALS
Sign up, get API keys, add to Replit Secrets.

4. INTEGRATE
Tell Claude Code:
"Integrate [service] API.
I need to [what you want to do].
Use the API key from secrets.
Handle errors gracefully."

5. TEST
Make sure it works before moving on.

INTEGRATION TIPS:

START MINIMAL
Only integrate what's essential for launch. You can add more later.

READ THE DOCS
AI is helpful but API docs have the truth. Skim them at least.

HANDLE ERRORS
APIs fail sometimes. Your app shouldn't crash when they do.

WATCH COSTS
Some APIs charge per request. Understand pricing before going live.

After today, your app should have all the external connections it needs to function.`,
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
      lesson: `Without auth, everyone sees everyone's data. Not great.

Today we fix that. Users get their own accounts.

WHY AUTHENTICATION MATTERS:

1. PRIVATE DATA
Users can save things that only THEY can see.

2. PERSONALIZATION
You can customize the experience per user.

3. PAYMENTS
Can't charge someone if you don't know who they are.

4. TRUST
Apps without login feel sketchy and temporary.

AUTHENTICATION OPTIONS:

REPLIT AUTH (Recommended)
Pros: One-click setup, secure, handles everything
Cons: Users need Replit account (actually fine for most)
Best for: MVP, fast launch

EMAIL + PASSWORD
Pros: Traditional, users understand it
Cons: You handle password resets, security
Best for: Established apps with custom needs

SOCIAL LOGIN (Google, GitHub, etc.)
Pros: One-click for users, no password to remember
Cons: More setup, dependency on third party
Best for: Consumer apps, dev tools

MAGIC LINK (Passwordless)
Pros: No passwords, secure, modern
Cons: Need email setup, slight friction
Best for: Apps that already have email integration

SETTING UP REPLIT AUTH:

Tell Claude Code:
"Add Replit Auth to my app:
1. Add a Login button in the header
2. Show user's name/avatar when logged in
3. Add a Logout button
4. Protect [which pages] so only logged-in users can access
5. Save user data (from [feature]) to their account
6. Each user should only see their own data"

AFTER AUTH IS SET UP:

Test these flows:
1. New user signs up → Can they access protected pages?
2. User creates data → Is it saved to their account?
3. User logs out and back in → Is their data still there?
4. Different user logs in → Do they see only their data?

Authentication is table stakes. Get it working, then move on.`,
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
      lesson: `Email isn't optional anymore. It's how you stay connected with users.

THE EMAILS YOU NEED:

ESSENTIAL (Start Here):
1. Welcome email - When they sign up
2. Password reset - When they forget password (if using email auth)

IMPORTANT (Add Soon):
3. Usage notifications - "You created X today"
4. Feature updates - "New feature available"

NICE TO HAVE (Later):
5. Re-engagement - "We miss you"
6. Weekly summaries - "Here's what happened"

EMAIL SERVICES:

RESEND (Recommended)
- Free: 3,000 emails/month
- Easy API, great docs
- Made for developers
- resend.com

SENDGRID
- Free: 100 emails/day
- More established
- sendgrid.com

MAILGUN
- Pay as you go
- Good deliverability
- mailgun.com

SETTING UP RESEND:

1. Sign up at resend.com
2. Verify your domain (follow their steps)
3. Get API key
4. Add to Replit Secrets: RESEND_API_KEY

ADDING EMAILS TO YOUR APP:

Tell Claude Code:
"Add email functionality using Resend:

1. When a user signs up, send a welcome email:
   - To: their email
   - Subject: 'Welcome to [App Name]!'
   - Body: [your welcome message]

2. When [event happens], send a notification:
   - To: the user's email
   - Subject: '[relevant subject]'
   - Body: [relevant message]

Use RESEND_API_KEY from secrets.
Handle errors gracefully - don't break the app if email fails."

EMAIL BEST PRACTICES:

- Keep emails SHORT and useful
- Don't spam - only send when there's value
- Include unsubscribe option (legally required)
- Test deliverability - check spam folder
- Use a real from address (noreply is fine)

Emails keep users coming back. Set them up now.`,
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
      lesson: `First impressions are everything. Users decide in 2 minutes if your app is for them.

THE GOAL OF ONBOARDING:

Get users to their first SUCCESS as fast as possible.

Not "show them features"
Not "explain everything"
Just: Help them WIN quickly

THE 2-MINUTE RULE:

Within 2 minutes of signing up, a user should:
1. Understand what the app does
2. Complete ONE action
3. See value from that action

If they can't do this, they'll leave.

ONBOARDING PATTERNS:

PATTERN 1: GUIDED FIRST ACTION
- After signup, take them straight to the main feature
- Pre-fill example data
- One button to get a result
- "Wow, that was easy"

PATTERN 2: QUICK TOUR
- 3-4 tooltips pointing at key features
- "Skip" button always visible
- End with a clear call to action
- Takes 30 seconds max

PATTERN 3: COLLECT PREFERENCES
- Ask 2-3 questions
- Use answers to customize their experience
- Show them results immediately
- "We personalized this for you"

WHAT TO AVOID:

❌ Long tutorials (no one watches them)
❌ Too many steps before value
❌ Forcing email verification before trying app
❌ Empty states with no guidance
❌ Feature dumps (here's 20 things you can do!)

BUILDING YOUR ONBOARDING:

Tell Claude Code:
"Add onboarding for new users:

When a user first signs up:
1. Show a welcome message with their name
2. Take them to [main feature]
3. Pre-fill with [example data] so they can try immediately
4. After they [complete action], show a success message
5. Then show quick tips for what to do next

Mark onboarding as complete so they don't see it again."

TEST YOUR ONBOARDING:

1. Create a new test account
2. Time how long until first success
3. If > 2 minutes, simplify
4. Ask someone unfamiliar to try it
5. Watch where they get confused

Good onboarding = users who stay.`,
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
      lesson: `You need to see what's happening in your app. Not guess - KNOW.

AN ADMIN DASHBOARD SHOWS YOU:

1. WHO'S USING YOUR APP
- How many users signed up
- When they signed up
- Who's active vs inactive

2. WHAT THEY'RE DOING
- Which features are used most
- How often they use the app
- What content they create

3. WHAT'S BREAKING
- Error counts
- Failed operations
- User complaints

4. HOW YOU'RE DOING
- Growth trends
- Usage patterns
- Revenue (when you add payments)

SIMPLE ADMIN DASHBOARD:

Start with just these metrics:
- Total users
- New users this week
- Active users this week
- Total [main actions] taken
- Recent activity list

That's it. You can add more later.

BUILDING YOUR DASHBOARD:

Tell Claude Code:
"Create an admin dashboard at /admin:

1. Protect it - only admin users can access
2. Show these stats:
   - Total users (count)
   - Users signed up this week (count)
   - Active users this week (used app in last 7 days)
   - Total [actions] (count of main feature usage)

3. Show recent activity:
   - Last 20 [actions] with user and timestamp

4. Make it simple and clean - this is for me, not users

Mark my account as admin."

WHAT TO DO WITH THIS DATA:

DAILY CHECK:
- Anyone new sign up?
- Any issues to fix?

WEEKLY REVIEW:
- Is usage growing?
- What features are popular?
- Where do people get stuck?

MONTHLY ANALYSIS:
- What should I build next?
- What can I remove?
- Is this working?

Data helps you make better decisions. Start collecting it now.`,
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
      lesson: `More than half your users will access your app on mobile.

If it doesn't work on phones, you're losing half your potential users.

MOBILE TESTING CHECKLIST:

LAYOUT:
□ No horizontal scrolling
□ Text is readable without zooming
□ Buttons are tappable (not too small)
□ Forms are usable
□ Navigation works

FUNCTIONALITY:
□ All features work on mobile
□ Touch targets are big enough (44x44px minimum)
□ No hover-only interactions
□ Forms work with mobile keyboard
□ File uploads work (if applicable)

PERFORMANCE:
□ Loads in under 3 seconds on 4G
□ Images are optimized
□ No unnecessary animations
□ Works on slower phones

TESTING PROCESS:

1. BROWSER DEV TOOLS
Open your app → F12 → Device toolbar
Test at: 375px (iPhone SE), 390px (iPhone 14), 412px (Android)

2. REAL DEVICE
Send yourself the link
Actually use it on your phone
Try with one hand

3. DIFFERENT DEVICES
Test on both iOS and Android if possible
Ask friends with different phones to try

COMMON MOBILE ISSUES:

ISSUE: Buttons too small
FIX: "Make all buttons at least 44px tall with padding"

ISSUE: Text too small
FIX: "Body text should be at least 16px on mobile"

ISSUE: Horizontal scrolling
FIX: "Check for elements with fixed widths, make them responsive"

ISSUE: Forms are awkward
FIX: "Make inputs full width on mobile, add proper input types"

FIXING MOBILE ISSUES:

Tell Claude Code:
"Fix mobile responsiveness:

1. On screens under 768px:
   - Stack elements vertically
   - Make buttons full width
   - Increase touch targets to 44px minimum
   - Hide non-essential elements

2. Fix these specific issues:
   [List what's broken]

3. Test at 375px width"

Build for mobile FIRST. Desktop users can handle more.`,
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
      lesson: `Time to make your app LOOK professional.

This isn't about being pretty - it's about being CREDIBLE.

Users judge quality by appearance. Fair or not, ugly = untrustworthy.

LOGO OPTIONS:

OPTION 1: TEXT LOGO (Recommended)
Your app name in a nice font. Clean, simple, scalable.
Tools: Canva, Figma (both free)

OPTION 2: ICON + TEXT
Simple icon (emoji works!) + your name
Good if you want something more memorable

OPTION 3: AI-GENERATED
Use Midjourney, DALL-E, or similar
Prompt: "Simple minimal logo for [app name], [description], app icon style"

Keep it SIMPLE. Complex logos look amateur.

COLOR POLISH:

Pick 3 colors maximum:
1. Primary - Main brand color, used for buttons
2. Background - Usually white or very light
3. Accent - For highlights and secondary elements

Use them CONSISTENTLY everywhere.

TYPOGRAPHY POLISH:

Pick 2 fonts maximum:
1. Headings - Can be bolder, more personality
2. Body - Must be highly readable

Sizes:
- Headings: 24-32px
- Subheadings: 18-20px
- Body: 16px
- Small text: 14px

CONSISTENCY CHECKLIST:

□ Same colors everywhere
□ Same fonts everywhere
□ Same button styles
□ Same spacing patterns
□ Same border radius
□ Logo on every page

QUICK POLISH FIXES:

Tell Claude Code:
"Polish the visual design:

1. COLORS:
   - Primary: [your color]
   - Background: [your color]
   - Accent: [your color]
   Apply consistently across all pages

2. TYPOGRAPHY:
   - Headings: [font], bold
   - Body: [font], regular
   - Ensure consistent sizing

3. SPACING:
   - Consistent padding in cards (16px or 24px)
   - Consistent margins between sections
   - Add more whitespace where cramped

4. CONSISTENCY:
   - Same button style everywhere
   - Same input style everywhere
   - Same card style everywhere"

ADDING YOUR LOGO:

Tell Claude Code:
"Add my logo to the app:
1. Show in header/navbar on all pages
2. Show on login/signup page
3. Add as favicon

Logo is [describe or provide URL/file]"

Professional appearance = professional perception.`,
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
      lesson: `This is it. Launch day.

Everything you've built over 21 days comes down to this: making it LIVE.

PRE-LAUNCH CHECKLIST:

FUNCTIONALITY:
□ Core feature works
□ USP feature works
□ Authentication works
□ Users can sign up and log in
□ Data saves correctly
□ Emails send
□ No major bugs

DESIGN:
□ Looks professional
□ Works on mobile
□ Logo is visible
□ Consistent branding

LEGAL (Quick Basics):
□ Privacy policy (AI can write one)
□ Terms of service (AI can write one)
□ Cookie notice if needed

INFRASTRUCTURE:
□ Custom domain connected (optional but recommended)
□ SSL certificate active (https://)
□ Error monitoring in place

THE REAL COSTS:

Let's be honest about what this costs to run:

REPLIT:
- Free tier works for MVP
- Paid ($7-20/month) for custom domain and more resources

OPENAI API:
- Pay per use
- GPT-3.5: ~$0.002 per 1K tokens (very cheap)
- GPT-4: ~$0.06 per 1K tokens (more capable)
- Budget $20-50/month to start

EMAIL (Resend):
- Free tier: 3,000 emails/month (enough to start)
- Paid: $20/month for more

DOMAIN:
- ~$10-15/year

TOTAL TO START: $20-50/month

NOT INCLUDED (add later when needed):
- Analytics
- More storage
- Better hosting
- Marketing

DEPLOYING:

In Replit:
1. Click "Deploy" button
2. Choose deployment type (Autoscale for production)
3. Confirm settings
4. Your app is LIVE

CONNECTING DOMAIN (Optional):

1. In Replit, go to deployment settings
2. Add your custom domain
3. Add DNS records at your domain provider
4. Wait for propagation (can take hours)

AFTER YOU LAUNCH:

1. TEST EVERYTHING LIVE
   Go through your app as a new user

2. SHARE WITH A FEW PEOPLE
   Friends, family, potential users
   Get feedback

3. MONITOR
   Watch your admin dashboard
   Check for errors

4. ITERATE
   Fix what breaks
   Improve what's confusing
   Add what's requested

🎉 CONGRATULATIONS 🎉

You just launched an AI SaaS.

21 days ago you had an idea. Now you have a PRODUCT.

Most people never get here. They plan forever. They dream forever. They "research" forever.

You BUILT something. And you SHIPPED it.

That's the difference between people who talk and people who DO.

What comes next is up to you. But you've proven you can build. And that changes everything.`,
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
