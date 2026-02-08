import { storage } from './storage';

// All 20 drip emails for the challenge sequence
// Variables: {{firstName}}, {{DASHBOARD_URL}}, {{UNLOCK_URL}}, {{READINESS_CALL_URL}}
// Legal footer + unsubscribe link automatically appended by emailService.ts
// All seeded as isActive=false - Matt must enable them in admin before any send

const DRIP_EMAILS = [
  {
    emailNumber: 1,
    dayTrigger: 0,
    subject: "You just did something 99% of people never do...",
    altSubject: "{{firstName}}, your first SaaS ideas are ready",
    body: `{{firstName}}...

You're IN.

And I need you to understand something right now...

What you just did - signing up, committing, actually STARTING - puts you ahead of 99% of people who say they want to build a business.

Most people talk. You ACTED.

That matters more than you think.

Here's something I've learned after 20+ years of building businesses online...

The gap between "I want to" and "I'm doing it" is where MOST people live their entire lives.

You just crossed it.

Now let me tell you what's sitting in your dashboard right now...

Your first AI-generated SaaS ideas. Scored. Ranked. Ready to explore.

These aren't random ideas pulled from thin air. They're based on real market patterns, real problems, and real opportunities.

Your job today is simple: look through them and start thinking about which one gets you FIRED UP.

Because here's what I've noticed with everyone I've worked with...

The people who build the BEST products aren't always the smartest or the most technical.

They're the ones who pick an idea they genuinely CARE about.

An idea that solves a problem they understand. An idea they'd use themselves.

That ENERGY carries you through the hard bits.

Log in now and explore your ideas:

{{DASHBOARD_URL}}

Tomorrow, we validate it. That's where things get REALLY interesting.

Speak tomorrow,

Matt

P.S. If you haven't unlocked the FULL 21-day challenge yet, you can grab lifetime access here: {{UNLOCK_URL}}`,
  },
  {
    emailNumber: 2,
    dayTrigger: 2,
    subject: "The 10-minute test that saves you MONTHS of wasted time",
    altSubject: "Is your idea actually worth building? (Let's find out)",
    body: `{{firstName}}...

I want to tell you something that might save you MONTHS of wasted effort.

When I built my first software product years ago, I skipped validation entirely.

I was SO excited about the idea that I just... started building.

Three months later I had a product nobody wanted.

No users. No revenue. Just a really expensive lesson.

And here's the thing - that experience is SO common it's almost a rite of passage in the startup world.

But it doesn't HAVE to be.

Because there's a simple test you can run in about 10 minutes that tells you whether your idea has real potential or whether you'd be building something the market doesn't need.

That's what today's lesson is about.

You're going to do THREE things:

1. Research your competitors (yes, having competitors is actually a GOOD sign - it means there's a market)

2. Map out the specific pain points your product solves

3. Write your "I Help" statement - one sentence that makes it crystal clear who you help and how

When you nail that "I Help" statement, something clicks.

Suddenly you can explain your product to ANYONE in 10 seconds flat.

And here's a business insight most people miss...

The best SaaS businesses don't try to be completely unique. They take something that ALREADY works and make it better, simpler, or cheaper for a specific group of people.

That's it. That's the formula.

You don't need to reinvent the wheel. You need to build a BETTER wheel for a specific type of car.

Log in and validate your idea now:

{{DASHBOARD_URL}}

By the end of today, you'll have ONE locked-in idea with a clear value proposition.

That's POWERFUL.

Matt

P.S. Want the full challenge unlocked so you can work ahead at your own pace? Grab it here: {{UNLOCK_URL}}

P.P.S. If you're looking at your idea and thinking "is this REALLY the right one?"... that's actually a good sign. It means you're taking this seriously. And it's EXACTLY the kind of thing I help people figure out in my coaching. Having someone who's launched multiple SaaS products look over your shoulder makes a HUGE difference this early on. Just saying...`,
  },
  {
    emailNumber: 3,
    dayTrigger: 3,
    subject: "The #1 reason most apps never launch (and how to avoid it)",
    altSubject: "Your AI just mapped out your entire product...",
    body: `{{firstName}}...

Let me share something that took me YEARS to learn...

The #1 reason most apps never launch isn't bad ideas. It isn't lack of skill. It isn't money.

It's SCOPE.

People try to build EVERYTHING at once.

Every feature. Every bell and whistle. Every "wouldn't it be cool if..."

And they NEVER finish.

I've seen it hundreds of times. Talented people with great ideas who spend 6 months building something that could have been done in 6 WEEKS... if they'd just focused on what MATTERED.

Here's the rule I follow in EVERY business I build:

Launch with LESS than you think you need.

Not because you're lazy. Because getting your product in front of REAL people as fast as possible is the single most valuable thing you can do.

Real users will tell you what to build next. Real feedback beats your imagination every single time.

Today, AI is going to map out ALL the features your product could have.

Core features. Shared features. Your unique differentiators.

And then YOU decide what goes in your MVP. The Minimum Viable Product. The LEAN version that does the job.

Everything else goes on a "later" list.

This is how REAL products get built. By REAL companies. Including every one of mine.

Here's what I want you to understand about SaaS as a business model...

The beauty of SaaS is that you launch once, then IMPROVE forever. Every month your product gets better. Every month you add more value. Every month your revenue grows.

You don't need to build it all on day one. You just need to build ENOUGH to launch.

Today teaches you how to know what "enough" is.

Log in and get your feature map:

{{DASHBOARD_URL}}

After today, you'll know EXACTLY what you're building. No more guessing.

Matt

P.S. If you're enjoying the challenge so far, make sure you've unlocked the full thing: {{UNLOCK_URL}}

P.P.S. The difference between people who build a product that SELLS and people who build something nobody wants often comes down to getting the features RIGHT. My coaching clients get direct feedback on their feature choices before they build a single thing. Something to think about...`,
  },
  {
    emailNumber: 4,
    dayTrigger: 4,
    subject: "Something shifts in your brain today...",
    altSubject: "{{firstName}}, it's time to make this REAL",
    body: `{{firstName}}...

Today something changes.

Today your product gets a NAME.

And I'll be honest with you - I've worked with a LOT of people on this challenge, and this is the day where something shifts psychologically.

When your product has a name... when you own the domain... when you can TYPE it into a browser and see YOUR space on the internet...

It stops being "that app idea I'm working on."

It becomes a PRODUCT. Your product.

That shift matters more than most people realise.

Because it changes how you THINK about what you're building. It changes how you TALK about it. And it changes how seriously you TAKE it.

Today you'll use AI to generate brandable names. You'll check domain availability. You'll look at trademarks and social handles.

And by the end of the day, you'll OWN a domain.

Here's a quick naming tip from someone who's named more products than I can count...

Don't overthink it.

A good name is:
- Easy to spell
- Easy to say out loud
- Available as a .com (or close to it)
- Not already trademarked in your space

That's it. It doesn't need to be clever. It doesn't need to be a pun. It just needs to be CLEAR and MEMORABLE.

Some of the biggest companies in the world have names that mean absolutely nothing - Google, Spotify, Stripe. The name doesn't make the product. The PRODUCT makes the name.

Pick one. Move forward. You can always rebrand later (though honestly, most people don't need to).

Log in and name your SaaS:

{{DASHBOARD_URL}}

Tomorrow we give it a LOOK. And that's when people really start getting excited.

See you in there,

Matt

P.S. I've seen people get stuck on naming for WEEKS. Don't be that person. My coaching clients never have to second-guess stuff like this because I'm right there going "yep, that one's good, go with it." Sometimes you just need someone who's done it before to give you the green light.`,
  },
  {
    emailNumber: 5,
    dayTrigger: 5,
    subject: "Why your product needs to LOOK expensive (even if it's not)",
    altSubject: "Nobody will believe you made this yourself...",
    body: `{{firstName}}...

Let me share a business truth that most people don't want to hear...

People judge products by how they LOOK.

It doesn't matter how good your product is under the hood.

If it LOOKS like it was thrown together in someone's bedroom... people won't trust it enough to pay for it.

But here's the flip side...

If your product LOOKS polished, professional, and expensive... people automatically assume it IS.

They trust it more. They're willing to pay more. They take it more seriously.

This is called "perceived value" and it's one of the most powerful forces in business.

A product that LOOKS like it cost £50K to build commands £50K prices - even if it cost you almost nothing to make.

Today, your product gets its visual identity.

Brand colours. Design style. Logo. The complete look.

And when you're done, nobody will KNOW this was built by one person using AI tools.

They'll see a product that looks like it was designed by a professional team. And that's EXACTLY what you want.

Here's the thing about SaaS pricing that most new founders don't understand...

People don't pay based on what something COSTS to build.

They pay based on the VALUE it provides and the TRUST they feel.

Professional design = trust = higher prices = more revenue.

It's that simple.

Today we lock in your brand. Tomorrow we set up the tools that make the actual BUILD possible.

Log in and build your brand:

{{DASHBOARD_URL}}

This is getting REAL now.

Matt`,
  },
  {
    emailNumber: 6,
    dayTrigger: 6,
    subject: "I used to spend £200K/year on developers. Now I use these 2 tools.",
    altSubject: "Set this up today (takes 20 mins, saves you a fortune)",
    body: `{{firstName}}...

I want to give you some context that I think will blow your mind.

Before AI coding tools existed, building a SaaS product cost a FORTUNE.

I'm talking £50K-£200K just to get a basic product off the ground.

Developers. Designers. Project managers. Months of back-and-forth. Bugs. Delays. More money.

I know because I LIVED it. For years. Across multiple businesses.

The total amount I've spent on development teams over my career is... genuinely painful to think about.

And now?

Two tools. That's all you need.

Replit (where your app lives and runs) and Claude (the AI that writes your code).

These two tools together do what I used to pay entire TEAMS to do.

And here's what's crazy...

The results are often BETTER. Faster. And you're in CONTROL.

No waiting weeks for a developer to make a simple change. No miscommunication. No invoices that make your eyes water.

YOU describe what you want. AI builds it. You test it. Done.

That's the world we live in now.

And that's why right NOW is the single best time in history to start a SaaS business.

The barrier to entry that used to be £100K+ is now... essentially zero.

You just need the knowledge of HOW to use these tools effectively.

That's what today's lesson gives you. Setup takes about 20 minutes, and you'll learn 4 prompt templates you'll use over and over again throughout the challenge.

Log in and get set up:

{{DASHBOARD_URL}}

Tomorrow we build your product blueprint. That's where it gets REALLY exciting.

Matt

P.S. Here's something I've noticed after working with hundreds of people on this... the ones who fly through the BUILD phase are usually the ones who had their tools configured RIGHT from the start. Getting stuck on technical setup problems burns hours and kills momentum. That's one of the things my coaching clients love most - they never get stuck because I'm right there with them. No wasted time. No frustration.`,
  },
  {
    emailNumber: 7,
    dayTrigger: 7,
    subject: "The moment everything changes ({{firstName}}, hit play today)",
    altSubject: "You hit \"go\" today. For real.",
    body: `{{firstName}}...

This is the email I've been waiting to send you.

Because TODAY is the day everything changes.

Everything you've done over the last 6 days - the idea, the validation, the features, the name, the brand, the tools...

It ALL comes together right now.

Today you create your Product Requirements Document (PRD).

Think of it as the BLUEPRINT for your entire product.

Every feature. Every page. Every flow. Every detail - all laid out in one document.

And then... you paste it into Replit and tell it to start BUILDING.

I still remember the first time I did this.

Watching AI take a document I'd written and turn it into a WORKING application...

Pages appearing. Features working. A real product materialising in front of me...

In MINUTES. Not months. MINUTES.

It's honestly one of the most surreal experiences in modern business.

And it's about to happen to YOU.

But let me put this in perspective for you...

What you're about to do today would have taken a development team 2-3 months and cost anywhere from £30K-£80K.

You're going to do it this afternoon. For essentially free.

That's not a gimmick. That's the genuine reality of building software in 2025/2026.

And it's why I believe SaaS is the single best business model on the planet right now.

Low costs. High margins. Recurring revenue. Global reach. And now - no technical barrier to entry.

The opportunity is ENORMOUS. And you're right in the middle of it.

Log in and build your PRD:

{{DASHBOARD_URL}}

Let's GO.

Matt`,
  },
  {
    emailNumber: 8,
    dayTrigger: 8,
    subject: "You now have a better dev process than most actual developers",
    altSubject: "The system that makes EVERYTHING easier from here",
    body: `{{firstName}}...

Today I want to teach you something that separates amateurs from professionals.

Not just in software. In ANY business.

It's called having a SYSTEM.

Most people who build things - products, businesses, content - do it randomly. They wing it. They make it up as they go.

And it works... until it doesn't.

Until something breaks and they can't figure out why. Until they make a change and it wrecks something else. Until they lose work because they didn't save properly.

Today you set up a PROFESSIONAL development workflow.

GitHub (version control - think of it as an "undo" button for your entire project). Claude Code. And your CLAUDE.md file, which gives AI a set of golden rules to follow every time it writes code for you.

Here's what's funny about this...

Most actual professional developers don't have this level of organisation.

I'm serious. I've worked with dev teams charging £100+/hour who don't have clear coding rules documented anywhere.

You - someone who probably couldn't write a line of code a week ago - are about to have a more structured, more disciplined development process than people who've been coding for YEARS.

That's not an accident. That's by DESIGN.

Because having a system means you can BUILD reliably. CONSISTENTLY. Without things randomly breaking.

And it means when you want to build your NEXT product (and trust me, once you've done this once, you'll want to do it again)... you already have the system in place.

One system. Infinite products. THAT'S leverage.

Log in and set up your workflow:

{{DASHBOARD_URL}}

Tomorrow you learn the 8 skills that make AI do EXACTLY what you want. Don't miss it.

Matt`,
  },
  {
    emailNumber: 9,
    dayTrigger: 9,
    subject: "8 skills. Learn these and you can build ANYTHING.",
    altSubject: "The difference between fighting AI and flowing with it",
    body: `{{firstName}}...

What I'm about to share with you today is probably the most VALUABLE training in the entire challenge.

Not because it's complex. Because it's FOUNDATIONAL.

These 8 skills will serve you for the rest of your life.

Not just for this challenge. Not just for this product. For EVERY product you ever build. For every AI tool you ever use. For every problem you ever solve with technology.

Here they are:

1. Be Specific - vague instructions = vague results
2. Reverse mistakes - how to undo anything without panicking
3. Report errors properly - AI can fix any bug if you tell it what happened
4. Break down big tasks - small steps = reliable results
5. Commit before changes - always save your work before trying something new
6. Ask for options - don't accept the first answer, ask for alternatives
7. Vibe with it - work WITH AI, not against it
8. Ask Why - understand what AI did so you can learn from it

These 8 skills are the difference between someone who FIGHTS with AI tools and someone who FLOWS with them.

The people who struggle? They give vague instructions, panic when something breaks, try to do everything in one go, and never save their work.

The people who FLY? They're specific, methodical, patient, and curious.

Here's the business insight buried in this...

These skills don't just make you good at building software.

They make you good at DELEGATING to AI. And in the next 5-10 years, being great at AI delegation will be one of the most valuable skills in the WORLD.

You're not just learning to build an app.

You're learning a skill set that will be worth an ENORMOUS amount of money for decades to come.

Every business will need people who can get AI to do what they want. And you're becoming one of those people RIGHT NOW.

Log in and master these skills:

{{DASHBOARD_URL}}

Tomorrow we enter the BUILD phase. And these 8 skills are going to make the whole thing smooth.

You've got this.

Matt`,
  },
  {
    emailNumber: 10,
    dayTrigger: 10,
    subject: "Your app just got AI superpowers (this changes everything)",
    altSubject: "The 4-step loop you'll use 100+ times",
    body: `{{firstName}}...

We've hit the TURNING POINT.

Everything up to now has been preparation.

From today... we BUILD.

And today's lesson teaches you two things that will change how you work forever.

The first: your app gets its own AI brain.

Real AI features. Built into YOUR product. Powered by real AI.

Your users will interact with your app and get intelligent responses. Not canned answers. Not pre-written scripts. Real AI.

Think about that for a second...

Your product - the one YOU built from scratch - will have the same kind of AI capabilities that companies are spending MILLIONS to develop.

That's your competitive advantage. And it costs you almost nothing.

The second thing you learn today is even more important...

The BUILD-TEST-FIX-REPEAT loop.

This 4-step cycle is the SAME process I use across ALL my software businesses. And you'll use it 100+ times from here.

Build something. Test it. Fix what's broken. Repeat.

Simple? Yes. But POWERFUL.

Because it removes all the overwhelm. You never need to think "how do I build this entire thing?" You just need to think "what's the NEXT small thing I can build and test?"

That's it. Over and over. And before you know it... you've built an entire product.

Let me give you a number that might excite you...

The average SaaS product with AI features charges 2-3x MORE than the same product without AI. AI is a premium feature. And you're building it in TODAY.

Log in and give your app AI powers:

{{DASHBOARD_URL}}

You're past the halfway mark. Keep the momentum going.

Matt`,
  },
  {
    emailNumber: 11,
    dayTrigger: 11,
    subject: "The 3-second rule that determines if people BUY or BOUNCE",
    altSubject: "First impressions MATTER (here's why today is big)",
    body: `{{firstName}}...

I want to share something with you about human psychology that will change how you think about your product.

People make a SUBCONSCIOUS decision about whether they trust a product within 3 seconds of seeing it.

Three seconds.

Before they read a single word. Before they understand what your product does. Before they even know the price.

Their brain has already decided: "this looks legit" or "this looks dodgy."

And that snap judgement is based almost ENTIRELY on design.

Colours. Layout. Typography. Spacing. The overall "feel."

Today, your app goes from looking like a prototype to looking like a REAL product.

You're going to take those brand choices you made on Day 5 and apply them across your ENTIRE application.

Every page. Every button. Every element. All consistent. All professional.

And here's what that does for your business...

Good design isn't about looking pretty. It's about TRUST.

Trust is the currency of online business. People buy from products they trust.

And design is the fastest way to BUILD that trust.

After today, people will look at your app and their brain will say "this is professional, this is safe, I can trust this."

That single change will affect your conversion rate more than almost anything else you do.

Log in and brand your app:

{{DASHBOARD_URL}}

Looking good, {{firstName}}. Really good.

Matt`,
  },
  {
    emailNumber: 12,
    dayTrigger: 12,
    subject: "Real users can now sign up for YOUR product",
    altSubject: "{{firstName}}, you just built something people can USE",
    body: `{{firstName}}...

Big day today. Like, REALLY big.

Because after today... real people can sign up and use your product.

Think about that.

A few days ago you had an IDEA. Now you have a product with:

- User registration
- Login and logout
- Individual user accounts with their own data
- Security and authentication
- An admin dashboard where YOU can see everything

That admin dashboard is going to become your best friend.

Total users. New signups. Active users. Who's doing what. When they last logged in.

You'll see EVERYTHING happening inside your product in real time.

Now here's something I want you to start thinking about...

Every SaaS business is essentially the same business model:

Get users → Provide value → Charge money → Keep them happy → They stay and pay every month

That's it. That's the entire model.

And the "recurring revenue" part is what makes SaaS the most ATTRACTIVE business model on the planet.

You don't sell once and start again from zero next month.

Every customer you get STAYS and pays you again. And again. And again.

Month after month. While you sleep. While you're on holiday. While you're building your next feature.

THAT'S the power of what you're building.

Today's lesson gives you the first piece: users who can sign up and log in.

The rest of the puzzle - payments, email, sales - is coming over the next few days.

Log in and let your users in:

{{DASHBOARD_URL}}

Your app is getting closer to launch EVERY single day.

Matt`,
  },
  {
    emailNumber: 13,
    dayTrigger: 13,
    subject: "The feature that turns \"users\" into \"customers\" (read this)",
    altSubject: "Welcome emails, notifications, the works...",
    body: `{{firstName}}...

Let me tell you about the single most underrated feature in any SaaS product.

It's not AI. It's not a beautiful design. It's not some fancy feature.

It's EMAIL.

The ability to communicate with your users automatically.

Sounds boring, right?

But here's what email actually does for your business...

A welcome email when someone signs up makes them 33% more likely to become an active user.

A notification when something important happens keeps people coming BACK.

A password reset email means people don't just abandon your product when they forget their login.

Email is the GLUE that holds your product together.

And it's the bridge between "someone who tried your product once" and "a paying customer who sticks around for years."

Every successful SaaS business I've built or studied has one thing in common: great email communication.

Not spammy marketing emails. Just smart, helpful, timely messages that make the user experience BETTER.

That's what you're adding today.

Your app will be able to send emails. Welcome messages. Notifications. Whatever YOUR product needs.

You'll set it up, send a test to yourself, and it's DONE.

Quick to implement. MASSIVE in impact.

Log in and add email to your app:

{{DASHBOARD_URL}}

Nearly at the finish line now. Don't stop.

Matt`,
  },
  {
    emailNumber: 14,
    dayTrigger: 15,
    subject: "Your app can now accept MONEY. (Read that again.)",
    altSubject: "Read this subject line again. Slowly.",
    body: `{{firstName}}...

I need you to really let this sink in.

Your app can now accept MONEY.

You - someone who probably couldn't write a line of code three weeks ago - built a product from SCRATCH... and it can now take PAYMENTS.

Stripe checkout. Full payment flow. End to end.

Do you understand how significant that is?

Let me put this in context...

There are people who spend YEARS in business before they ever build something that can accept a payment online.

There are people who spend tens of thousands of pounds hiring developers to build payment systems.

And there are people who never get here at all. They stay in the "planning" phase forever, dreaming about the business they'll "one day" build.

You're not one of those people.

You BUILT it. And it WORKS.

Now I want to talk to you about something that most new founders get completely wrong...

Pricing.

Most people price their SaaS way too LOW.

They think "who would pay £30/month for this?" or "it's just a small tool, I should charge £5."

But here's the reality...

If your product saves someone TIME, makes them MONEY, or solves a genuine PAIN... they will HAPPILY pay £20, £30, £50, even £100+ per month.

And with recurring SaaS revenue, even a small number of customers adds up FAST.

100 customers at £29/month = £2,900/month = £34,800/year

That's not a side hustle. That's a BUSINESS.

And 100 customers is not a lot. That's very achievable with the right product and the right marketing.

Which we cover in the coming days.

Log in and set up payments:

{{DASHBOARD_URL}}

This is MASSIVE. Well done, {{firstName}}.

Matt`,
  },
  {
    emailNumber: 15,
    dayTrigger: 16,
    subject: "You're about to lose 60% of your customers (unless you do THIS today)",
    altSubject: "If your app doesn't pass this test, you'll lose users",
    body: `{{firstName}}...

Here's a stat that should make you sit up...

Over 60% of your users will visit your app on their PHONE.

Not their laptop. Their phone.

So if your app doesn't work properly on mobile, you're losing MORE THAN HALF your potential customers before they even get started.

They'll open it. It'll look weird. Buttons won't work. Text will be tiny. They'll close it.

Gone. Forever.

That's revenue you'll never see.

Today you fix that.

You'll test your app on your actual phone and run through the critical checks:

Does it load fast? Is the text readable without zooming? Are buttons big enough to tap? No sideways scrolling? Do forms work? Does your main feature function properly on a small screen?

Simple checks. But CRITICAL.

Here's a business insight from someone who's been doing this for over 20 years...

The difference between products that GROW and products that stall is almost always about REMOVING friction.

Every tiny annoyance. Every confusing button. Every page that doesn't load right.

Each one is a small reason for someone to leave and never come back.

Your job as a product owner isn't just to add features. It's to REMOVE obstacles between your user and the value your product provides.

Today is about removing one of the BIGGEST obstacles: a broken mobile experience.

Log in and make your app mobile-ready:

{{DASHBOARD_URL}}

Nearly there now...

Matt`,
  },
  {
    emailNumber: 16,
    dayTrigger: 17,
    subject: "Final sprint. Let's finish this thing.",
    altSubject: "Your MVP checklist (8 items. Let's check them ALL off.)",
    body: `{{firstName}}...

This is the FINAL BUILD PUSH.

You've got 8 items on your MVP checklist:

1. Core features working
2. AI integrated
3. Auth working
4. Email set up
5. Mobile responsive
6. Onboarding built
7. Admin dashboard
8. No major bugs

Today you SPRINT to the finish.

Testing and building running SIDE BY SIDE.

Find bugs. Fix them. Polish the UI. Tighten everything up.

This is where you go from "almost done" to "DONE."

And let me tell you something from experience...

There is NOTHING like the feeling of checking off that last item on the list.

That moment when you step back and think "I BUILT this. It WORKS. It's REAL."

It's one of the best feelings in business.

But I want to be honest with you about something...

Perfection is the enemy of launching.

Your product does NOT need to be perfect. It needs to be GOOD ENOUGH.

Good enough to provide value. Good enough to charge for. Good enough that people will use it and come back.

You can - and WILL - improve it forever. That's the beauty of SaaS. You launch, you get feedback, you improve. Endlessly.

But you can't improve something that doesn't EXIST.

So today, finish the checklist. Get it to "good enough." And prepare yourself for what's coming...

Because the next three days are about SELLING. And that's where the fun REALLY starts.

Log in and FINISH your MVP:

{{DASHBOARD_URL}}

You're SO close. Keep going.

Matt`,
  },
  {
    emailNumber: 17,
    dayTrigger: 19,
    subject: "A copywriter would charge you £3K+ for what AI just did in 10 minutes",
    altSubject: "AI just wrote your ENTIRE sales page...",
    body: `{{firstName}}...

Your product is BUILT.

Now we need people to BUY it.

And that means you need a sales page.

Now, most people DREAD this part.

"I'm not a copywriter." "I don't know how to sell." "I hate writing sales pages."

I get it. Selling feels uncomfortable. Especially when you're selling something YOU built.

But here's a reframe that changed everything for me...

You're not selling. You're HELPING.

Your product solves a REAL problem for REAL people. Your sales page is just you explaining that problem, showing how your product fixes it, and making it easy for them to say yes.

That's not sleazy. That's SERVICE.

And today, AI writes the whole thing for you.

Powerful headlines. Complete sales copy. Problem statement. Solution overview. Features and benefits. Social proof sections. FAQ. Call to action.

The WORKS.

A professional copywriter would charge £2,000-£5,000 for this.

AI does it in minutes. And it's based on everything YOU'VE built over the last 19 days, so it's not generic rubbish - it's specific to YOUR product, YOUR audience, YOUR solution.

Here's one more insight for you...

The sales page isn't just a page. It's a MACHINE.

When it's working, it sells for you 24/7. While you sleep. While you eat. While you're out living your life.

One good sales page can generate revenue for YEARS.

That's the asset you're building today.

Log in and build your sales machine:

{{DASHBOARD_URL}}

Two days left. You're about to LAUNCH.

Matt`,
  },
  {
    emailNumber: 18,
    dayTrigger: 20,
    subject: "How to get customers without spending a penny on ads",
    altSubject: "Google now knows your product EXISTS",
    body: `{{firstName}}...

Your product is built. Your sales page is done.

But NONE of that matters if nobody can FIND you.

So let me share something that most new founders get wrong about marketing...

They think they need to spend money on ads.

Facebook ads. Google ads. Instagram ads.

And look - ads CAN work. But they're expensive, complicated, and risky when you're just starting out.

There's a better way.

It's called organic traffic. And it's FREE.

People searching Google for EXACTLY the problem your product solves... finding YOUR product... and signing up.

No ad spend. No marketing agency. Just your product appearing where people are already LOOKING.

That's what SEO does. And that's what today is about.

You'll set up:
- Keyword research (what your customers are actually searching for)
- On-page SEO (telling Google what your product is about)
- Meta descriptions (the text that shows in search results)
- Sitemap (helping search engines find all your pages)

AND you'll submit to search engines and list your product in SaaS directories.

Here's the thing about SEO that makes it the BEST marketing channel for SaaS...

It compounds.

Month 1: a trickle of traffic.
Month 3: a steady stream.
Month 6: a reliable flow.
Month 12: a river.

Every piece of content you create. Every page you optimise. It all builds on itself.

While paid ads STOP the moment you stop paying, SEO keeps GROWING.

That's sustainable business. That's long-term wealth.

Log in and get discovered:

{{DASHBOARD_URL}}

Tomorrow is the FINAL day. And it's a big one.

Matt

P.S. Once you've launched, the biggest question is always "what do I focus on NEXT?" How do you get your first 10 customers? Your first 100? How do you price it? How do you grow? That's exactly what I cover in my free 1:1 Readiness Review call. More on that tomorrow...`,
  },
  {
    emailNumber: 19,
    dayTrigger: 21,
    subject: "You did it. Now here's the roadmap to REAL money.",
    altSubject: "{{firstName}}... look at what you've built",
    body: `{{firstName}}...

You did it.

I want you to stop for a second and actually take that in.

When you started this challenge, you had an idea. Maybe not even that. Maybe just a FEELING that you wanted to build something.

And now?

You've got a live, AI-powered SaaS product.

With user authentication. Email integration. Payment processing. Mobile responsiveness. An admin dashboard. A sales page. SEO.

You BUILT that.

Not a development team. Not a tech co-founder. Not an expensive agency.

YOU.

That is genuinely remarkable. And I don't say that lightly.

Now... let's talk about what comes NEXT.

Because building the product is only HALF the equation.

The other half? Turning it into a BUSINESS.

Today's final training covers your roadmap to revenue:

- Pricing strategy (what to charge and why)
- Customer acquisition (20+ ways to get your first users)
- Content marketing (free traffic from valuable content)
- Email marketing (turning visitors into customers)
- Affiliate programs (other people selling FOR you)
- Product launches (creating buzz and urgency)

This is the roadmap from "I have a product" to "I have a business that generates real income."

And here's what excites me about YOUR position right now...

You have something that 99% of "wantrepreneurs" don't have.

A REAL product. That WORKS. That people can USE and PAY for.

You've crossed the hardest gap in entrepreneurship: from idea to execution.

Everything from here is about GROWTH. And growth, with the right guidance, is a solvable problem.

Log in for your final training:

{{DASHBOARD_URL}}

And listen...

If you want help turning this into a REAL income stream, I'm offering a free 1:1 Readiness Review call.

Just you and me. I'll look at what you've built, tell you EXACTLY what I'd do next, and map out your path to revenue.

No sales pitch. Just straight up advice from someone who's been building online businesses for over two decades.

Book your free call here:

{{READINESS_CALL_URL}}

Spots are limited. First come, first served.

Proud of you, {{firstName}}.

Matt`,
  },
  {
    emailNumber: 20,
    dayTrigger: 22,
    subject: "{{firstName}}... the challenge is over. Your business is just beginning.",
    altSubject: "What happens NOW? (Don't make this mistake)",
    body: `{{firstName}}...

I want you to think about where you were when you started this challenge.

No product. No technical skills. Probably a fair amount of doubt about whether you could actually DO this.

And now?

You have a LIVE SaaS product. Users can sign up. Payments work. Emails send. Search engines know it exists. You've got a sales page, a marketing roadmap, and an admin panel showing you everything.

You built that. In 21 days. Starting from zero.

That puts you in a very small group of people who actually EXECUTE on their ideas.

But here's the thing I need to be straight with you about...

The BIGGEST mistake I see people make at this point?

They stop.

They built something amazing. They feel great about it. They tell a few friends. Maybe they post about it on social media.

And then... nothing.

Life gets busy. The momentum fades. The product sits there gathering dust.

And six months later they say "yeah, I built an app once, never really did anything with it."

That breaks my heart every time I see it.

Because the hard part is DONE. You've BUILT the thing. The foundation is THERE.

Everything from here is iteration. Marketing. Talking to users. Making it better.

And here's what that can look like with even MODEST success...

50 customers at £19/month = £950/month
100 customers at £29/month = £2,900/month
200 customers at £49/month = £9,800/month

Those aren't fantasy numbers. Those are achievable targets for a focused SaaS product solving a real problem.

And that's RECURRING. Every month. While you sleep. While you build your next feature. While you live your life.

That's the business you're sitting on right now.

So please... don't stop.

Keep building. Keep marketing. Keep iterating. Keep GOING.

And if you want someone in your corner to help you figure out the NEXT steps...

Book a free Readiness Review call with me.

I'll look at your product, tell you what I'd do to get your first paying customers, and give you an honest roadmap for turning this into real monthly income.

It's free. It's 1:1. And it's the kind of advice I normally charge a LOT for.

Book your call here:

{{READINESS_CALL_URL}}

I mean it when I say I'm proud of what you've done.

Now go and make it COUNT.

Matt`,
  },
  {
    emailNumber: 21,
    dayTrigger: 24,
    subject: "{{firstName}}, can I give you 30 minutes of free advice?",
    altSubject: "Quick question for you, {{firstName}}",
    body: `Hey {{firstName}},

It's been a few days since you finished the challenge, and I've been thinking about you.

Specifically, I've been thinking about what YOUR next move should be.

Because here's what I know from working with hundreds of people who've been exactly where you are right now...

The difference between people who turn their product into real income and people who don't?

It's not talent. It's not luck. It's not even the product itself.

It's having someone who can look at what you've built and say: "Here's EXACTLY what I'd do next if I were you."

That's why I'm offering you a free Readiness Review call.

Here's what happens on the call:

1. You show me your product (takes 5 minutes)
2. I tell you what's working and what needs fixing (honest, no fluff)
3. We map out your first 30 days of marketing together
4. I give you a specific plan to get your first paying customers

No pitch. No upsell. Just 30 minutes of straight-up advice from someone who's been building and selling online for 20+ years.

I do these because I genuinely love seeing people succeed with what they've built. And honestly? Helping you win helps me win too, because YOUR success story becomes proof that this challenge works.

But I can only do a handful of these each week, so they fill up fast.

If you've been thinking "what now?" or "how do I actually get customers?" - this call will give you clarity.

Book your free call here:

{{READINESS_CALL_URL}}

Seriously, {{firstName}}. You built something real. Let me help you turn it into something profitable.

Matt

P.S. There's no catch. No "free call that's actually a sales pitch." I'll give you a genuine action plan you can start executing immediately. The only thing I ask is that you come prepared - have your product live and ready to show me. Book here: {{READINESS_CALL_URL}}`,
  },
];

// Initial engagement emails for users who paid but never started (never completed Day 0)
// dayTrigger = days since signup
// One-time sequence — once they start, they move to the normal nag system
const INITIAL_ENGAGEMENT_EMAILS = [
  {
    emailNumber: 201,
    dayTrigger: 1,
    emailType: 'initial' as const,
    nagLevel: 1,
    subject: "Your first lesson takes 10 minutes (and it's the fun one)",
    altSubject: "{{firstName}}, your AI-generated SaaS ideas are waiting",
    body: `Hey {{firstName}},

I noticed you haven't jumped into the challenge yet, and I didn't want you to miss the best bit...

Your first lesson generates real SaaS ideas for you using AI.

You answer a few questions. AI analyses the market. And you get a scored list of product ideas personalised to YOUR skills and interests.

It takes about 10 minutes, and honestly? It's the part most people say got them hooked.

Your dashboard is ready:

{{DASHBOARD_URL}}

Just click "Start Day 0" and follow the steps. Everything is guided.

Matt`,
  },
  {
    emailNumber: 202,
    dayTrigger: 3,
    emailType: 'initial' as const,
    nagLevel: 2,
    subject: "Quick question — is something holding you back?",
    altSubject: "{{firstName}}, just checking in",
    body: `Hey {{firstName}},

I wanted to check in because you haven't started the challenge yet.

Sometimes people sign up and then think "I'll do it later" — and later never comes.

If something's holding you back, here are the most common things I hear:

"I'm not technical enough" — You don't need to be. The challenge teaches everything step by step. No coding knowledge required.

"I don't have time" — Each lesson takes 15-30 minutes. You can do it on your lunch break.

"I'm not sure which idea to pick" — That's literally what Day 0 helps you figure out. AI does the heavy lifting.

Your first lesson is sitting right here:

{{DASHBOARD_URL}}

Give it 10 minutes. If it's not for you, no hard feelings. But I think you'll surprise yourself.

Matt

P.S. If you're stuck on something technical (can't log in, page not loading, etc.), just reply to this email and I'll sort it out.`,
  },
  {
    emailNumber: 203,
    dayTrigger: 7,
    emailType: 'initial' as const,
    nagLevel: 3,
    subject: "Your challenge access is still waiting",
    altSubject: "{{firstName}} — one last note from me",
    body: `{{firstName}},

This is my last nudge about getting started.

You invested in the challenge, and I want to make sure you get your money's worth.

Everything is set up and waiting for you. Your first lesson takes 10 minutes. And people who start Day 0 almost always keep going — because once you see AI generating real product ideas for you, something clicks.

Here's your dashboard:

{{DASHBOARD_URL}}

Whenever you're ready, it'll be there.

Matt`,
  },
];

// Nag/re-engagement emails sent when users go inactive
// dayTrigger = days of inactivity before sending
const NAG_EMAILS = [
  {
    emailNumber: 101,
    dayTrigger: 1,
    emailType: 'nag' as const,
    nagLevel: 1,
    subject: "You're building something amazing - don't stop now",
    altSubject: "{{firstName}}, are you stuck? (I can help)",
    body: `Hey {{firstName}},

I noticed you haven't been back to the challenge recently, and I wanted to check in.

Are you stuck on something? Confused about a step? Just got busy?

Whatever it is, it's completely normal. EVERYONE hits a wall at some point.

Here's what I'd suggest: just log in and spend 5 minutes on your next lesson. That's it. Five minutes.

You don't need to finish it. You don't need to do it perfectly. Just open it up and start.

Because here's what I've learned from hundreds of people doing this challenge...

The ones who succeed aren't the ones who never stop. They're the ones who START AGAIN after stopping.

Your dashboard is right here:

{{DASHBOARD_URL}}

You've already done the hardest part - you started. Don't let that momentum disappear.

I'm rooting for you.

Matt`,
  },
  {
    emailNumber: 102,
    dayTrigger: 3,
    emailType: 'nag' as const,
    nagLevel: 2,
    subject: "The other challengers are pulling ahead...",
    altSubject: "{{firstName}}, your SaaS idea is waiting",
    body: `{{firstName}}...

I'll be honest with you.

While you've been away, other people in the challenge have been building.

They're completing lessons. Making progress. Getting closer to having a live, revenue-generating product.

And your product? It's sitting there. Waiting for you.

I'm not saying this to guilt-trip you. I'm saying it because I've seen this pattern before and it ALWAYS ends the same way...

People who take a break "just for a few days" rarely come back. And then six months later, they're still in the same spot - no product, no business, no progress.

You signed up for this challenge because you wanted something DIFFERENT.

You wanted to BUILD something. To prove to yourself that you could do it.

That desire hasn't gone away. It's still there.

The only question is: are you going to act on it, or let it fade?

Your next lesson takes less than 30 minutes:

{{DASHBOARD_URL}}

The challenge is still here. Your progress is still saved. You can pick up EXACTLY where you left off.

But the window doesn't stay open forever.

Matt

P.S. If you're stuck on something specific, just reply to this email and tell me what's blocking you. I read every reply.`,
  },
  {
    emailNumber: 103,
    dayTrigger: 6,
    emailType: 'nag' as const,
    nagLevel: 3,
    subject: "Last check-in - I don't want you to regret this",
    altSubject: "{{firstName}}, this is my last email about this",
    body: `{{firstName}},

This is my last check-in about the challenge.

I've sent a couple of emails over the past few days and I haven't heard back, so I want to respect your time.

But before I stop, I want to leave you with one thought...

Six months from now, you're going to look back at this moment.

And you'll either think: "I'm so glad I got back on track and finished what I started."

Or: "I wish I hadn't given up."

I've been doing this for over 20 years. I've seen THOUSANDS of people start things. The ones who finish? They're the ones making money online right now. Building businesses. Living on their own terms.

The ones who quit? They're still scrolling. Still wishing. Still saying "one day."

Your product is still there. Your progress is saved. Everything is waiting for you:

{{DASHBOARD_URL}}

If life genuinely got in the way, I understand. No judgment. Just know the door is open whenever you're ready.

But if you're just putting it off... if there's a part of you that KNOWS you should get back to it...

Today is the day.

Not tomorrow. Not next week. Today.

Matt

P.S. If something about the challenge isn't working for you, or you need help with a specific problem, reply to this email. I genuinely want to help you finish what you started.`,
  },
];

// Generic gentle nudge emails for repeat inactive periods
// These replace the personal nag sequence after the user has been through it once
// Designed to be non-annoying even if received multiple times
const GENTLE_NUDGE_EMAILS = [
  {
    emailNumber: 104,
    dayTrigger: 2,
    emailType: 'nag' as const,
    nagLevel: 4,
    subject: "Your challenge progress is saved",
    altSubject: "Quick reminder — your next lesson is ready",
    body: `Hey {{firstName}},

Just a quick note — your challenge progress is saved and your next lesson is ready whenever you are.

Pick up where you left off:

{{DASHBOARD_URL}}

No pressure. It'll be here when you're ready.

Matt`,
  },
  {
    emailNumber: 105,
    dayTrigger: 7,
    emailType: 'nag' as const,
    nagLevel: 5,
    subject: "Your next lesson is waiting",
    altSubject: "Whenever you're ready, {{firstName}}",
    body: `Hey {{firstName}},

Your dashboard is here whenever you want to jump back in:

{{DASHBOARD_URL}}

Matt`,
  },
];

export async function seedDripEmails(): Promise<void> {
  try {
    const existing = await storage.getAllDripEmails();
    const allEmails = [...DRIP_EMAILS, ...INITIAL_ENGAGEMENT_EMAILS, ...NAG_EMAILS, ...GENTLE_NUDGE_EMAILS];
    const totalCount = allEmails.length;

    // Check if all email types need seeding
    const hasNagEmails = existing.some(e => e.emailNumber === 101);
    const hasGentleNudges = existing.some(e => e.emailNumber === 104);
    const hasInitialEngagement = existing.some(e => e.emailNumber === 201);

    // If all emails exist, check if content is up to date
    if (existing.length >= totalCount && hasNagEmails && hasGentleNudges && hasInitialEngagement) {
      const firstEmail = existing.find(e => e.emailNumber === 1);
      if (firstEmail && firstEmail.body.includes('What you just did - signing up, committing')) {
        console.log(`[Drip Seed] All ${totalCount} emails already up to date, skipping seed`);
        return;
      }
      console.log(`[Drip Seed] Updating ${totalCount} emails with new content...`);
    } else {
      console.log(`[Drip Seed] Seeding ${totalCount} emails (${existing.length} exist, nags: ${hasNagEmails ? 'yes' : 'no'}, nudges: ${hasGentleNudges ? 'yes' : 'no'}, initial: ${hasInitialEngagement ? 'yes' : 'no'})...`);
    }

    for (const email of DRIP_EMAILS) {
      await storage.upsertDripEmail({
        emailNumber: email.emailNumber,
        dayTrigger: email.dayTrigger,
        subject: email.subject,
        altSubject: email.altSubject,
        body: email.body,
        isActive: false,
      });
    }

    for (const email of [...INITIAL_ENGAGEMENT_EMAILS, ...NAG_EMAILS, ...GENTLE_NUDGE_EMAILS]) {
      await storage.upsertDripEmail({
        emailNumber: email.emailNumber,
        dayTrigger: email.dayTrigger,
        subject: email.subject,
        altSubject: email.altSubject,
        body: email.body,
        emailType: email.emailType,
        nagLevel: email.nagLevel,
        isActive: false,
      });
    }

    console.log(`[Drip Seed] Done - ${DRIP_EMAILS.length} drip + ${INITIAL_ENGAGEMENT_EMAILS.length} initial + ${NAG_EMAILS.length} nag + ${GENTLE_NUDGE_EMAILS.length} nudge emails seeded (disabled by default)`);
  } catch (error) {
    console.error('[Drip Seed] Error seeding drip emails:', error);
  }
}
