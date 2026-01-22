import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTestMode } from "@/contexts/TestModeContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Lock,
  Copy,
  Check,
  Rocket,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Mail,
  Users,
  TrendingUp,
  Megaphone,
  Search,
  Handshake,
  DollarSign,
  MousePointer,
  Gift,
  Globe,
  Newspaper,
  Menu,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Strategy data structure
interface Strategy {
  id: string;
  title: string;
  content: string;
  difficulty?: "easy" | "medium" | "advanced";
  timeToResults?: string;
  cost?: "free" | "low" | "medium" | "high";
}

interface StrategyCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  strategies: Strategy[];
}

// The comprehensive launch & marketing strategies library
const STRATEGY_CATEGORIES: StrategyCategory[] = [
  {
    id: "pre-launch",
    name: "Pre-Launch Preparation",
    icon: ClipboardList,
    description: "Get ready before you go live",
    strategies: [
      {
        id: "launch-checklist",
        title: "The Complete Launch Readiness Checklist",
        difficulty: "easy",
        timeToResults: "1-2 weeks prep",
        cost: "free",
        content: `Before you launch, make sure you have these essentials locked in:

**PRODUCT READINESS**
□ Core features working and tested
□ Onboarding flow guides users to "aha moment" in under 5 minutes
□ Payment processing tested with real transactions
□ Error handling and edge cases covered
□ Mobile responsive (60%+ traffic is mobile)
□ Loading speed under 3 seconds

**MARKETING ASSETS**
□ Landing page with clear value proposition
□ 3 versions of your elevator pitch (5 sec, 30 sec, 2 min)
□ Product screenshots and demo GIF
□ Explainer video (60-90 seconds ideal)
□ Social media profiles created
□ Email signature updated with link

**SUPPORT INFRASTRUCTURE**
□ FAQ page with top 10 questions
□ Contact email set up
□ Help documentation for core features
□ Response templates for common questions

**ANALYTICS**
□ Tracking installed (Google Analytics, Mixpanel, etc.)
□ Conversion events defined
□ Dashboard set up for key metrics

**LEGAL**
□ Terms of service
□ Privacy policy
□ Cookie consent (if needed)

PRO TIP: Don't launch until you can say "yes" to at least 80% of these. The missing 20% can be added in week 1.`
      },
      {
        id: "soft-launch",
        title: "The Soft Launch Strategy",
        difficulty: "easy",
        timeToResults: "1-2 weeks",
        cost: "free",
        content: `A soft launch lets you iron out issues before going big. Here's how:

**WEEK 1: FRIENDS & FAMILY**
- Share with 10-20 trusted people
- Ask them to try signing up, using core features, and buying
- Watch for: confusion points, bugs, unclear copy
- Fix critical issues daily

**WEEK 2: EXTENDED NETWORK**
- Expand to 50-100 people (LinkedIn connections, Twitter followers)
- Frame as "early access" - people love being first
- Collect testimonials from satisfied users
- Identify your power users (they'll become advocates)

**WHAT TO TRACK**
- Where do people drop off?
- What questions do they ask repeatedly?
- What features do they love vs. ignore?
- What objections come up?

**BEFORE PUBLIC LAUNCH**
- Minimum 5 real paying customers (proves the model works)
- At least 2-3 testimonials with specific results
- Zero critical bugs for 3+ days
- Average support response under 4 hours

**THE REFRAME**: A soft launch isn't "lesser" - it's how the pros do it. Slack, Instagram, and most successful startups launched small first.`
      },
      {
        id: "waitlist-building",
        title: "Building a Pre-Launch Waitlist That Actually Converts",
        difficulty: "medium",
        timeToResults: "2-4 weeks",
        cost: "low",
        content: `A waitlist builds anticipation and gives you warm leads on day 1.

**THE LANDING PAGE FORMULA**
1. Compelling headline (problem you solve)
2. 3-5 bullet points of benefits
3. Email capture with incentive ("Get early access + 50% off")
4. Social proof if you have it
5. Progress indicator ("247 people ahead of you")

**INCENTIVE IDEAS**
- Early access before public launch
- Lifetime discount (20-50% off)
- Exclusive features for early adopters
- Free month/extended trial
- Input on product roadmap

**BUILDING THE LIST**
- Share in relevant communities (Reddit, Discord, Slack groups)
- LinkedIn posts about what you're building
- Twitter/X threads about the problem you solve
- Paid ads to landing page ($5-10/day to test)
- Ask happy beta users to refer friends

**KEEPING THEM WARM**
Weekly email updates:
- Week 1: "Here's what we're building and why"
- Week 2: "Behind the scenes progress"
- Week 3: "Feature sneak peek"
- Week 4: "You're almost in - final countdown"

**CONVERTING TO CUSTOMERS**
- Give 24-48 hour exclusive access
- Honor your discount promise
- Create urgency ("Early bird pricing ends Friday")
- Follow up with non-converters

**TARGET**: 500+ signups before launch = strong day 1`
      },
      {
        id: "launch-timing",
        title: "When to Launch: Timing Your Release for Maximum Impact",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Timing matters more than most people think.

**BEST DAYS TO LAUNCH**
- Tuesday-Thursday: Highest engagement, people are in work mode
- Avoid Mondays (inbox backlog) and Fridays (weekend mode)

**BEST TIMES**
- 8-10 AM Pacific (catches US East + West coasts)
- Noon Eastern = 5 PM London (catches UK/Europe)

**PRODUCT HUNT SPECIFIC**
- Launch at 12:01 AM Pacific (gets full 24 hours)
- Tuesday-Thursday typically most active
- Avoid major holidays or big tech events

**SEASONS TO CONSIDER**
Good: January (fresh starts), September (back to business)
Avoid: December (holidays), August (vacations)

**PIGGYBACK STRATEGY**
- Launch same day as complementary product
- Launch when competitor has PR problem
- Launch when relevant topic is trending

**THE COUNTERPOINT**
Don't wait for "perfect" timing. The best time to launch is when you're ready. A Tuesday vs. Friday difference is marginal compared to not launching at all.

**REAL TALK**: The biggest launch timing mistake is waiting too long. Done is better than perfect.`
      }
    ]
  },
  {
    id: "launch-platforms",
    name: "Launch Platforms & Strategies",
    icon: Rocket,
    description: "Where and how to announce your product",
    strategies: [
      {
        id: "product-hunt",
        title: "The Complete Product Hunt Launch Playbook",
        difficulty: "advanced",
        timeToResults: "1 day + ongoing",
        cost: "free",
        content: `Product Hunt can drive thousands of signups in 24 hours. Here's how to win:

**2 WEEKS BEFORE**
□ Create your Ship page and start collecting followers
□ Join Product Hunt community, upvote others, leave thoughtful comments
□ Find a hunter with credibility (or become a hunter yourself)
□ Prepare assets: tagline, description, images, GIF, video
□ Build your supporter list (people who will upvote day 1)

**ASSET REQUIREMENTS**
- Tagline: 60 chars max, benefit-focused
- Description: Short, medium, and long versions
- Thumbnail: 240x240, clear and eye-catching
- Gallery: 5-8 images showing the product
- First comment: Tell your story (why you built this)

**LAUNCH DAY SCHEDULE (Pacific Time)**
12:01 AM - Product goes live
12:05 AM - Post your first comment (founder story)
6:00 AM - Share on social media
8:00 AM - Email your list and supporters
12:00 PM - Check comments, respond to every one
6:00 PM - Thank supporters, share progress
11:59 PM - Final push for votes

**THE SUPPORTER STRATEGY**
- Build list of 100+ people beforehand
- DO: "Hey, we're launching on PH today, would love your support"
- DON'T: "Please upvote" (against rules, feels spammy)
- Warm contacts convert better than cold asks

**RESPONDING TO COMMENTS**
- Reply within 30 minutes
- Be genuine, not salesy
- Offer to answer questions
- Give exclusive deals to PH users

**AFTER LAUNCH**
- Thank your supporters publicly
- Use "Featured on Product Hunt" badge
- Write about your launch experience
- Connect with people you met

**TARGET**: Top 5 daily = great exposure. #1 = massive traffic boost.`
      },
      {
        id: "hacker-news",
        title: "Hacker News Launch Strategy (Show HN)",
        difficulty: "medium",
        timeToResults: "1 day",
        cost: "free",
        content: `Hacker News can send thousands of developers and tech-savvy users your way.

**THE RIGHT FIT**
HN works best for:
- Developer tools and APIs
- Technical products
- Interesting side projects
- Genuine technical innovations

HN doesn't work for:
- Obviously commercial/marketing-focused launches
- "Me too" products
- Anything that feels like an ad

**THE PERFECT SHOW HN POST**
Title: "Show HN: [Product Name] – [What it does in plain English]"
Example: "Show HN: Plausible – Simple, privacy-friendly Google Analytics alternative"

Body:
- What you built (1-2 sentences)
- Why you built it (genuine motivation)
- Interesting technical decisions
- What you're looking for (feedback, users, etc.)

**TIMING**
- 9-10 AM Eastern, Tuesday-Thursday
- Never weekends (traffic drops 50%+)

**ENGAGEMENT RULES**
- Respond to every comment thoughtfully
- Admit limitations honestly
- Don't be defensive about criticism
- Share technical details people ask about
- Thank people for trying it

**WHAT NOT TO DO**
- Don't ask people to upvote (instant death)
- Don't use marketing speak
- Don't be defensive
- Don't ignore criticism
- Don't spam other threads with links

**REALISTIC EXPECTATIONS**
- Front page = 5,000-20,000 visitors
- Conversion to signup: 3-10%
- Many are just curious, not buyers
- But the RIGHT people are there`
      },
      {
        id: "reddit-launch",
        title: "Reddit Launch Strategy: Community by Community",
        difficulty: "medium",
        timeToResults: "Immediate to weeks",
        cost: "free",
        content: `Reddit can be a goldmine or a disaster. Here's how to get it right.

**THE CARDINAL RULE**
Be a community member first, marketer second. Reddit hates obvious self-promotion.

**BEFORE LAUNCHING**
1. Join relevant subreddits 2-4 weeks early
2. Comment genuinely on other posts
3. Provide value without mentioning your product
4. Understand each subreddit's rules and culture

**FINDING YOUR SUBREDDITS**
- r/SideProject - for showing what you built
- r/startups - startup community (check rules)
- r/Entrepreneur - general business
- Industry-specific: r/webdev, r/marketing, etc.
- Local: r/[yourcity] if relevant

**THE LAUNCH POST FORMULA**
Title: Clear, specific, no hype
"I built a [what it does] to solve [problem]"

Body:
- Why you built it (genuine story)
- What it does (benefits, not features)
- What you're asking for (feedback > sales)
- Free offer for Redditors (discount, extended trial)

**ENGAGEMENT**
- Respond to every comment
- Accept criticism gracefully
- Be genuinely helpful
- Don't get defensive

**WHAT KILLS REDDIT LAUNCHES**
- Obvious self-promotion
- Ignoring subreddit rules
- Defensive responses
- Astroturfing (fake accounts)
- Generic, salesy language

**PRO TIP**: The best Reddit marketing doesn't look like marketing. Share your genuine journey, learnings, and failures. Authenticity wins.`
      },
      {
        id: "twitter-launch",
        title: "Twitter/X Launch Thread Strategy",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `A well-crafted launch thread can go viral and drive massive traffic.

**THE LAUNCH THREAD FORMULA**

Tweet 1 (Hook):
"I just launched [Product Name].

Here's the story of how I [built X in Y time / solved Z problem / went from idea to launch]:"

Tweet 2 (Problem):
"The problem I was trying to solve:
[Describe the pain point in relatable terms]"

Tweet 3-5 (Journey):
- How you discovered the problem
- Failed attempts or alternatives
- The breakthrough moment

Tweet 6-7 (Solution):
- What you built
- Key features/benefits
- Screenshot or demo GIF

Tweet 8 (Results):
- Early traction or testimonials
- Specific numbers if you have them

Tweet 9 (CTA):
"Try it free: [link]
RT if you know someone who'd find this useful"

Tweet 10 (Bonus):
- Behind the scenes insight
- What you learned
- What's next

**TIMING**
- 8-10 AM or 12-2 PM EST
- Tuesday-Thursday best
- Avoid weekends

**AMPLIFICATION**
- Pin the thread
- Reply to your own thread with updates
- Quote tweet with new insights
- Tag relevant people (sparingly)

**POST-LAUNCH**
- Engage with every reply
- Thank people for sharing
- Answer questions publicly
- Use momentum for follow-up content`
      }
    ]
  },
  {
    id: "content-marketing",
    name: "Content Marketing",
    icon: Newspaper,
    description: "Create content that drives traffic and trust",
    strategies: [
      {
        id: "seo-content",
        title: "SEO Content Strategy for SaaS: Rank and Convert",
        difficulty: "medium",
        timeToResults: "3-6 months",
        cost: "low",
        content: `SEO is the gift that keeps giving. Here's how to build content that ranks:

**CONTENT PILLARS**
Build content around 3-5 main topics related to your product:
- Pillar 1: [Main problem you solve]
- Pillar 2: [Related workflow/process]
- Pillar 3: [Industry you serve]

**KEYWORD RESEARCH**
1. Seed keywords (what would customers search?)
2. Use Ahrefs, SEMrush, or free tools like Ubersuggest
3. Target keywords with:
   - 100-1,000 monthly searches (achievable)
   - Low competition (under 30 difficulty)
   - Commercial intent (people looking for solutions)

**CONTENT TYPES THAT RANK**
1. "How to [do thing your product helps with]"
2. "[Tool] alternatives" (compare to competitors)
3. "[Tool A] vs [Tool B]" comparisons
4. "Best [category] tools for [use case]"
5. Comprehensive guides (3,000+ words)

**THE BLOG POST FORMULA**
- H1: Include primary keyword naturally
- Intro: Hook + preview what they'll learn
- H2s: Cover each subtopic (use related keywords)
- Content: Answer questions thoroughly
- CTA: Relevant offer tied to content
- Internal links: Link to product/related posts

**OPTIMIZATION CHECKLIST**
□ Primary keyword in title, H1, first 100 words
□ Related keywords throughout
□ Images with alt text
□ Meta description with keyword
□ URL slug is clean and short
□ Internal and external links

**DISTRIBUTION**
- Share on social media
- Repurpose into threads/carousels
- Email to subscribers
- Link from relevant Quora/Reddit answers

**REALISTIC TIMELINE**
Month 1-3: Little traffic, building foundation
Month 3-6: Some posts start ranking
Month 6-12: Compounding traffic growth`
      },
      {
        id: "build-in-public",
        title: "Build in Public: The Transparency Marketing Strategy",
        difficulty: "easy",
        timeToResults: "1-3 months",
        cost: "free",
        content: `Building in public turns your journey into marketing. Here's how:

**WHAT TO SHARE**
Revenue numbers (MRR, growth %)
User milestones (first 10, 100, 1000 customers)
Feature releases and updates
Failures and what you learned
Behind-the-scenes decisions
Tech stack and architecture
Pricing experiments and results
Customer conversations (anonymized)

**WHERE TO SHARE**
Twitter/X: Daily updates, threads
LinkedIn: Professional angle, lessons learned
Indie Hackers: Detailed monthly updates
Your blog: Deep dives and retrospectives

**CONTENT CADENCE**
Daily: Quick wins, small updates
Weekly: Metric updates, learnings
Monthly: Full retrospective with numbers

**THE AUTHENTICITY BALANCE**
Share: Struggles, learnings, real numbers
Don't share: Customer private info, security details, team conflicts

**WHY IT WORKS**
- Creates accountability (public pressure to execute)
- Builds audience before you need them
- Attracts similar founders and collaborators
- Shows customers you're actively improving
- SEO benefit from consistent content

**TEMPLATE: WEEKLY UPDATE**
"Week [X] update for [Product]:

Revenue: $X MRR (+Y%)
Users: X total (+Y this week)

What went well:
- [Win 1]
- [Win 2]

What didn't:
- [Challenge 1]
- [Learning from it]

Focus next week:
- [Priority 1]
- [Priority 2]"

**WARNING**: Don't fake it. Audiences can smell inauthenticity. Share real numbers or don't share at all.`
      },
      {
        id: "lead-magnets",
        title: "Lead Magnets That Actually Convert to Paying Customers",
        difficulty: "medium",
        timeToResults: "2-4 weeks",
        cost: "low",
        content: `The right lead magnet builds your list with qualified buyers.

**WHAT MAKES A GOOD LEAD MAGNET**
- Solves a specific, immediate problem
- Takes under 5 minutes to consume
- Gives a quick win
- Naturally leads to your paid solution

**HIGH-CONVERTING FORMATS**
1. Checklists/Cheat Sheets
   - "The [X] Checklist"
   - Quick reference, high perceived value

2. Templates
   - "Copy-paste [X] templates"
   - Saves time, immediately usable

3. Mini-Courses (Email)
   - "5-day [outcome] challenge"
   - Builds relationship through sequence

4. Calculators/Tools
   - "Calculate your [X]"
   - Interactive, shows value immediately

5. Curated Lists
   - "50 [resources] for [outcome]"
   - Saves research time

**THE VALUE EQUATION**
Lead magnet value = Specificity x Immediacy x Relevance

Bad: "Marketing tips ebook" (generic)
Good: "7 cold email templates that got 40%+ reply rates" (specific)

**DELIVERY SEQUENCE**
Email 1: Deliver the lead magnet
Email 2: Quick tip related to lead magnet
Email 3: Case study/social proof
Email 4: Soft pitch for product
Email 5: Stronger CTA with urgency

**PROMOTION**
- Gate behind email on your blog
- Share preview on social media
- Use as Twitter thread lead-in
- Include in your email signature
- Mention in podcast appearances

**MEASURING SUCCESS**
- Landing page conversion rate (target 30%+)
- Email open rates (target 40%+)
- Click to trial/demo (target 5%+)`
      },
      {
        id: "guest-posting",
        title: "Guest Posting Strategy for SaaS Growth",
        difficulty: "medium",
        timeToResults: "1-3 months",
        cost: "free",
        content: `Guest posting builds authority and drives qualified traffic.

**FINDING OPPORTUNITIES**
1. Google: "[your industry] guest post" or "write for us [industry]"
2. Check where competitors guest post (Ahrefs/SEMrush backlinks)
3. Industry publications and blogs
4. Medium publications with large followings
5. LinkedIn newsletters in your space

**QUALIFYING SITES**
Good sites have:
- Domain authority 30+ (use Moz or Ahrefs)
- Active, engaged audience
- Relevant to your target customers
- Allow do-follow links (some don't)
- Recent posts (not abandoned)

**THE PITCH EMAIL**
Subject: Guest post idea: [Specific Topic]

Hi [Name],

I've been reading [Blog] for a while - loved your piece on [Recent Article].

I'd like to pitch a guest post: "[Specific Title]"

It would cover:
- [Point 1]
- [Point 2]
- [Point 3]

This hasn't been published elsewhere. Here are 2-3 examples of my writing:
[Links]

Would this be a fit for [Blog]?

[Your name]

**WRITING THE POST**
- Match their style and format
- Better quality than your own blog (impress their audience)
- Include actionable, original insights
- Natural bio link (not salesy)
- One link to relevant content on your site

**THE BIO**
Bad: "John is the founder of ProductX which helps..."
Good: "John writes about [topic]. Get his free [lead magnet] at [link]."

**BUILDING RELATIONSHIPS**
- Promote the post heavily
- Engage with comments
- Offer to write again
- Cross-promote on social
- Thank the editor publicly`
      }
    ]
  },
  {
    id: "email-marketing",
    name: "Email Marketing",
    icon: Mail,
    description: "Build and monetize your email list",
    strategies: [
      {
        id: "welcome-sequence",
        title: "The High-Converting Welcome Email Sequence",
        difficulty: "medium",
        timeToResults: "1-2 weeks to build",
        cost: "low",
        content: `Your welcome sequence is your first impression. Make it count.

**EMAIL 1: INSTANT (The Welcome)**
Subject: Welcome! Here's what's next
- Thank them for joining
- Deliver promised lead magnet
- Set expectations (what emails they'll get)
- One clear next step

**EMAIL 2: DAY 1 (Quick Win)**
Subject: Try this [specific thing] today
- One actionable tip
- Takes under 5 minutes
- Builds momentum and trust

**EMAIL 3: DAY 3 (Your Story)**
Subject: Why I built [Product]
- Personal story, vulnerability
- Problem you experienced
- Why you're passionate about solving it
- No hard sell

**EMAIL 4: DAY 5 (Social Proof)**
Subject: [Customer] went from [before] to [after]
- Customer success story
- Specific results with numbers
- How they did it
- Subtle product mention

**EMAIL 5: DAY 7 (The Pitch)**
Subject: Ready to [outcome]?
- Recap value provided
- Introduce product as next step
- Clear CTA with reason to act
- Risk reversal (guarantee)

**SUBJECT LINE TIPS**
- Personal (use their name)
- Curiosity-provoking
- Under 50 characters
- Avoid spam triggers

**FORMATTING**
- Short paragraphs (1-3 sentences)
- Mobile-friendly
- One clear CTA per email
- PS line for secondary message

**METRICS TO TRACK**
- Open rate: aim for 40%+ on welcome
- Click rate: aim for 5%+
- Reply rate: encourage responses
- Unsubscribe rate: under 2%`
      },
      {
        id: "newsletter-growth",
        title: "Growing an Email Newsletter from 0 to 1,000 Subscribers",
        difficulty: "medium",
        timeToResults: "2-6 months",
        cost: "low",
        content: `A newsletter is an owned audience. Here's how to build it:

**THE VALUE PROPOSITION**
Your newsletter should promise a specific outcome:
- "Weekly tactics to grow your [X]"
- "5-minute briefing on [industry]"
- "Curated [resources] every Tuesday"

**GROWTH TACTICS**

1. Website Optimization
- Popup after 30 seconds (not instant)
- Exit intent popup
- Embedded forms in content
- Footer signup
- Dedicated landing page

2. Social Media
- Link in bio
- Mention in threads/posts
- Share best newsletter content
- "Subscribe for more like this"

3. Cross-Promotion
- Partner with similar newsletters
- Swap mentions with peers
- Guest write for others

4. Lead Magnets
- Gate your best content
- Offer exclusive resources
- Early access to features

5. Content Upgrades
- Bonus content within blog posts
- "Get the full template" in exchange for email
- Checklist versions of long posts

**FIRST 100 SUBSCRIBERS**
- Personal network (ask individually)
- LinkedIn connections
- Twitter followers
- Existing customers
- Professional communities

**100 TO 1,000**
- Consistent publishing (weekly minimum)
- Cross-promotion with peers
- Content that gets shared
- SEO-driven blog content
- Referral program ("Share, get X")

**KEEPING SUBSCRIBERS**
- Deliver on your promise
- Consistent schedule
- Reply to responses
- Clean your list quarterly`
      },
      {
        id: "cold-email",
        title: "Cold Email Outreach That Gets Responses",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "low",
        content: `Cold email works when done right. Here's the playbook:

**THE RULES**
1. Personalized (not mail merge "personalization")
2. Short (under 150 words)
3. Clear value proposition
4. Specific ask
5. No attachments

**THE FRAMEWORK (AIDA)**
Attention: Personal hook
Interest: Relevant observation
Desire: Value proposition
Action: Specific ask

**TEMPLATE 1: THE OBSERVATION**
Subject: Quick question about [their specific thing]

Hi [Name],

Noticed [specific observation about their company/content].

We help [their type of company] [achieve outcome] - recently helped [similar company] [specific result].

Worth a 15-minute call to explore?

[Your name]

**TEMPLATE 2: THE VALUE ADD**
Subject: [Specific resource] for [their company]

Hi [Name],

Put together [specific resource] based on [their situation].

[1-sentence description of what it contains]

Want me to send it over?

[Your name]

**TEMPLATE 3: THE REFERRAL ASK**
Subject: Who handles [X] at [Company]?

Hi [Name],

Trying to find the right person at [Company] who handles [specific area].

Is that you, or could you point me in the right direction?

Thanks!

**FOLLOW-UP SEQUENCE**
Day 3: "Floating this to the top of your inbox"
Day 7: Add additional value/angle
Day 14: "Should I close the loop on this?"

**TOOLS**
- Finding emails: Hunter.io, Apollo.io
- Sending: Lemlist, Mailshake
- Verification: NeverBounce, ZeroBounce

**METRICS**
- Open rate: 40%+ (subject line is key)
- Reply rate: 5-10% is good
- Meeting rate: 1-3% is normal`
      },
      {
        id: "abandoned-cart",
        title: "Abandoned Cart & Trial Recovery Emails",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Most signups don't convert immediately. Here's how to bring them back:

**ABANDONED CHECKOUT (Didn't complete purchase)**

Email 1 (1 hour later):
Subject: Did something go wrong?
- Acknowledge they were checking out
- Ask if they have questions
- Provide support contact

Email 2 (24 hours):
Subject: Still thinking about [Product]?
- Recap what they get
- Handle common objection
- Offer to hop on a call

Email 3 (72 hours):
Subject: Last chance: [Incentive]
- Limited-time discount (10-20%)
- Urgency (expires in 48 hours)
- Social proof

**TRIAL NOT ACTIVATING (Signed up but not using)**

Email 1 (Day 1):
Subject: Quick tip to get started
- Single most important first action
- Link directly to that feature
- Offer help

Email 2 (Day 3):
Subject: Most people start here
- Show the "aha moment" path
- Quick win they can achieve
- Case study of similar user

Email 3 (Day 5):
Subject: [Name], need help?
- Ask what's blocking them
- Offer call/demo
- Share resource library

**TRIAL ENDING (Active but not converted)**

Email 1 (3 days before):
Subject: Your trial ends in 3 days
- Recap what they've accomplished
- Show what they'd lose
- Special upgrade offer

Email 2 (1 day before):
Subject: Tomorrow: [Product] access ends
- Urgency
- Last chance offer
- Clear upgrade CTA

Email 3 (Day of expiry):
Subject: Your [Product] access is ending today
- Final notice
- What to do to continue
- Support contact

**PRO TIP**: The best recovery email is genuinely helpful, not pushy. Ask what's blocking them - you'll learn valuable insights.`
      }
    ]
  },
  {
    id: "social-media",
    name: "Social Media Marketing",
    icon: Megaphone,
    description: "Build presence on social platforms",
    strategies: [
      {
        id: "twitter-growth",
        title: "Twitter/X Growth Strategy for SaaS Founders",
        difficulty: "medium",
        timeToResults: "3-6 months",
        cost: "free",
        content: `Twitter is where SaaS customers and collaborators hang out. Here's how to grow:

**PROFILE OPTIMIZATION**
- Name: Your name (not company)
- Bio: What you do + who you help + credibility
- Link: Lead magnet or landing page
- Pinned tweet: Best content or launch thread

**CONTENT PILLARS**
1. Industry insights and opinions
2. Behind-the-scenes of building
3. Lessons and learnings
4. Tactical how-tos
5. Engagement bait (questions, polls)

**THE 1-5-10 RATIO**
1 promotional (product, launches)
5 value-add (tips, insights)
10 engagement (replies, retweets, discussions)

**POSTING SCHEDULE**
- 2-4 tweets per day minimum
- Morning: Share insights
- Midday: Engage with others
- Evening: Questions or lighter content
- Best days: Tuesday-Thursday

**THREAD STRATEGY**
- Weekly thread on one topic
- Hook tweet is everything
- Each tweet stands alone but connects
- End with CTA (follow, link)
- Reply to your own thread

**ENGAGEMENT TACTICS**
- Reply to big accounts in your niche (be early)
- Quote tweet with added insight
- Join Twitter Spaces
- Create your own Spaces
- DM relationships (not pitches)

**GROWTH TACTICS**
- Engage with 20-30 accounts daily
- Consistency beats virality
- Collaborate with similar accounts
- Use threads for evergreen content
- Reply to viral tweets in your niche

**WHAT NOT TO DO**
- Don't just broadcast, engage
- Don't only promote your stuff
- Don't be negative or combative
- Don't buy followers
- Don't post and disappear`
      },
      {
        id: "linkedin-growth",
        title: "LinkedIn Strategy for B2B SaaS",
        difficulty: "medium",
        timeToResults: "2-4 months",
        cost: "free",
        content: `LinkedIn is goldmine for B2B SaaS. Here's how to leverage it:

**PROFILE OPTIMIZATION**
- Photo: Professional, friendly, approachable
- Headline: Outcome you help achieve (not job title)
- Banner: Product visual or value proposition
- About: Story + what you do + CTA
- Featured: Best content, lead magnet, demo

**CONTENT THAT WORKS**
1. Personal stories with business lessons
2. Industry insights and contrarian takes
3. Step-by-step how-tos
4. Customer success stories
5. Behind-the-scenes of building

**POST FORMAT**
- Hook line (stops the scroll)
- Space after hook
- Short paragraphs
- Bullet points
- End with question or CTA

**THE HOOK FORMULA**
"I [did unexpected thing] and [unexpected result].

Here's what happened:"

**POSTING CADENCE**
- 3-5 posts per week
- Best times: 7-9 AM, 12 PM, 5-6 PM
- Best days: Tuesday-Thursday
- Engage for 30 min after posting

**ENGAGEMENT STRATEGY**
- Comment on 10-20 posts daily
- Not "Great post!" - add real value
- Connect with commenters on your posts
- DM to continue conversations

**ADVANCED TACTICS**
- LinkedIn newsletters (subscribers notified)
- Document posts (carousel-style PDFs)
- LinkedIn Live for events
- Tag relevant people in posts
- Share customer's posts with insight

**LEAD GENERATION**
- Warm up with value-first comments
- Connect with personalized note
- Offer help before pitching
- Share relevant content in DMs
- Eventually suggest call if fit`
      },
      {
        id: "youtube-strategy",
        title: "YouTube for SaaS: Tutorial and Demo Strategy",
        difficulty: "advanced",
        timeToResults: "6-12 months",
        cost: "low",
        content: `YouTube videos compound over time. Start now, reap rewards later.

**WHY YOUTUBE WORKS FOR SAAS**
- Evergreen content (videos rank for years)
- High purchase intent viewers
- Build trust through demonstration
- SEO benefit (YouTube is #2 search engine)

**VIDEO TYPES**
1. Product tutorials ("How to [use feature]")
2. Problem-solving ("How to [solve X problem]")
3. Comparisons ("[Product A] vs [Product B]")
4. Industry education ("What is [concept]?")
5. Customer interviews and case studies

**VIDEO STRUCTURE**
0:00 - Hook (what they'll learn)
0:30 - Context (why it matters)
1:00 - Main content
End - CTA (try product, subscribe)

**OPTIMIZATION**
- Title: Include keyword, clear benefit
- Thumbnail: Face, text, contrast
- Description: Front-load keywords, include links
- Tags: Primary keyword + related terms
- Cards/End screens: Link to related videos

**PRODUCTION (KEEP IT SIMPLE)**
- Loom or screen recording for tutorials
- Simple webcam setup for talking head
- Good audio > good video
- Editing: Cut pauses, add basic graphics
- Consistency beats production value

**THUMBNAIL FORMULA**
- Your face with expression
- Big text (3-5 words max)
- Bright colors, high contrast
- Mobile-friendly (will be viewed small)

**GROWTH TACTICS**
- Post consistently (weekly minimum)
- Optimize for search keywords
- Promote on other channels
- Collaborate with others in space
- Create playlists for watch time

**STARTING OUT**
- First 10 videos: Find your style
- Videos 10-30: Refine what works
- Videos 30+: Start seeing traction`
      },
      {
        id: "community-building",
        title: "Building a Community Around Your SaaS",
        difficulty: "advanced",
        timeToResults: "6-12 months",
        cost: "low",
        content: `Communities create loyalty that marketing can't buy.

**SHOULD YOU BUILD A COMMUNITY?**
Good fit if:
- Your users benefit from connecting
- There's ongoing learning/improvement
- You can commit long-term
- The topic warrants discussion

**PLATFORM OPTIONS**
- Discord: Active, real-time, younger audience
- Slack: Professional, B2B, async-friendly
- Circle: Owned, paid community features
- Facebook Groups: Older demographic, easy to start
- Mighty Networks: Course + community hybrid

**GETTING STARTED**
1. Start with your best customers
2. Seed with 20-50 engaged members
3. Be the most active participant
4. Define clear purpose and rules
5. Welcome every new member

**CONTENT PILLARS**
- Educational (industry knowledge)
- Support (help each other)
- Networking (connect members)
- Exclusive (early access, behind scenes)
- Fun (off-topic, build relationships)

**ENGAGEMENT TACTICS**
- Daily discussion prompts
- Weekly AMAs or expert sessions
- Monthly challenges or events
- Member spotlights
- Exclusive content drops

**COMMUNITY ROLES**
You → Moderators → Power users → Active members → Lurkers

Identify and empower moderators early.

**METRICS**
- Daily active users
- Messages per day
- Member retention
- New member activation
- Event attendance

**COMMON MISTAKES**
- Launching too early (before product-market fit)
- Not enough initial members (feels dead)
- Over-moderating (kills organic discussion)
- Abandoning it (communities need ongoing care)
- Making it all about you (it's about them)

**THE LONG GAME**
Communities compound. Year 1 is hard. Year 2+ is where the magic happens.`
      }
    ]
  },
  {
    id: "paid-advertising",
    name: "Paid Advertising",
    icon: DollarSign,
    description: "Spend money to acquire customers",
    strategies: [
      {
        id: "google-ads",
        title: "Google Ads for SaaS: The Starter Guide",
        difficulty: "advanced",
        timeToResults: "1-3 months",
        cost: "high",
        content: `Google Ads puts you in front of people actively searching for solutions.

**WHEN TO USE GOOGLE ADS**
- You have validated product-market fit
- You can afford $500-1,000/month minimum
- Your LTV supports CAC
- You're targeting solution-aware prospects

**CAMPAIGN TYPES**
1. Search: Text ads on search results (start here)
2. Display: Banner ads across websites
3. YouTube: Video ads
4. Performance Max: AI-optimized across all

**KEYWORD STRATEGY**
High intent (start here):
- "[your category] software"
- "[competitor] alternative"
- "best [solution] for [use case]"

Medium intent:
- "how to [problem you solve]"
- "[category] tools"

Avoid (expensive, low conversion):
- Broad industry terms
- Informational queries

**AD COPY FORMULA**
Headline 1: [Benefit/outcome]
Headline 2: [Feature or differentiator]
Headline 3: [CTA or offer]
Description: [Expand on value, include keywords]

**LANDING PAGE RULES**
- Match ad messaging exactly
- Single, clear CTA
- Fast loading (<3 seconds)
- Social proof visible
- Mobile optimized

**BUDGET ALLOCATION**
- Start with $20-30/day per campaign
- Run for 2 weeks before judging
- Cut losers, scale winners
- Focus on 1-2 campaigns initially

**KEY METRICS**
- Click-through rate (CTR): aim for 2%+
- Cost per click (CPC): varies by industry
- Conversion rate: 2-5% for free trial
- Cost per acquisition (CPA): vs. your LTV

**OPTIMIZATION**
- Check weekly, adjust monthly
- Add negative keywords to reduce waste
- Test ad copy variations
- Improve landing page conversion
- Use remarketing for visitors who didn't convert`
      },
      {
        id: "meta-ads",
        title: "Meta (Facebook/Instagram) Ads for SaaS",
        difficulty: "advanced",
        timeToResults: "1-2 months",
        cost: "medium",
        content: `Meta ads work for SaaS when you understand the buyer journey.

**WHEN META WORKS**
- B2B/B2C with clear demographics
- You have content for top-of-funnel
- Visual product or compelling offer
- Budget for testing ($500+/month)

**CAMPAIGN STRUCTURE**
Campaign → Ad Sets → Ads

1 campaign = 1 objective
2-4 ad sets = different audiences
3-5 ads per ad set = variations

**AUDIENCE STRATEGY**

Cold Traffic:
- Interest-based (your industry, tools they use)
- Lookalike (from customers/leads)
- Broad (let algorithm find buyers)

Warm Traffic:
- Website visitors
- Email list
- Video viewers
- Page engagers

**AD FORMATS**
1. Single image (simple, fast to create)
2. Video (highest engagement)
3. Carousel (show features/benefits)
4. Lead form (capture within Facebook)

**AD COPY FRAMEWORK**
Hook: Call out the problem or audience
Body: Promise + proof
CTA: Clear action to take

Example:
"Tired of [pain point]?
[Product] helps [target customer] [achieve outcome].
[Social proof line]
Try it free →"

**CREATIVE TIPS**
- Test UGC-style content
- Show the product in action
- Use real customer quotes
- Face in thumbnail = better CTR
- Text overlay on video (sound off)

**BUDGET**
- $20-50/day starting out
- 3-7 days per test
- Kill ads with poor CTR (<1%)
- Scale gradually (20% increases)

**KEY METRICS**
- CPM: cost per 1,000 impressions
- CTR: aim for 1%+ (higher for retargeting)
- CPA: cost per trial/signup
- ROAS: return on ad spend`
      },
      {
        id: "retargeting",
        title: "Retargeting: Convert Visitors Who Left",
        difficulty: "medium",
        timeToResults: "1-2 weeks",
        cost: "low",
        content: `97% of visitors leave without converting. Retargeting brings them back.

**WHY RETARGETING WORKS**
- They already know you
- Lower CPC than cold traffic
- Higher conversion rates
- Multiple touchpoints build trust

**AUDIENCE SEGMENTS**
1. All website visitors (30 days)
2. Pricing page visitors (didn't convert)
3. Blog readers
4. Free trial signups (not converted)
5. Abandoned cart/checkout

**PLATFORM OPTIONS**
- Google Display Network
- Facebook/Instagram
- LinkedIn (for B2B)
- Twitter
- AdRoll (all-in-one)

**CREATIVE STRATEGY BY FUNNEL**

Top (just visited):
- Educational content
- Case studies
- "Did you know..." facts

Middle (engaged but didn't convert):
- Testimonials
- Feature highlights
- Comparison content

Bottom (almost converted):
- Special offers
- Limited-time discounts
- "Come back" messaging

**AD EXAMPLES**

For pricing page visitors:
"Still deciding? Here's what [Customer] said:
[Testimonial]
Start your free trial →"

For abandoned checkout:
"Your [Product] is waiting.
Complete your order today and get [bonus].
[Urgency: Offer expires in 24 hours]"

**BUDGET**
- Start with $10-20/day
- Lower than cold traffic spend
- High ROAS potential
- Watch frequency (don't annoy)

**BEST PRACTICES**
- Set frequency caps (3-5x per week)
- Rotate creative to prevent ad fatigue
- Exclude converters
- Segment by behavior
- Test different messages`
      },
      {
        id: "sponsorships",
        title: "Newsletter & Podcast Sponsorships",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "medium",
        content: `Sponsoring niche content puts you in front of engaged audiences.

**WHY SPONSORSHIPS WORK**
- Built-in trust (creator's endorsement)
- Highly targeted audience
- Less competitive than ad platforms
- Trackable with unique links/codes

**FINDING OPPORTUNITIES**

Newsletters:
- Swapstack.co (newsletter marketplace)
- Letter Growth directory
- Search "[your niche] newsletter"
- Ask your audience what they read

Podcasts:
- Podchaser directory
- Search Spotify/Apple for niche shows
- Ask your customers what they listen to

**QUALIFYING SPONSORS**

Ask for:
- Subscriber/listener count
- Open/download rates
- Audience demographics
- Past sponsor results
- Pricing and format options

Good metrics:
- Newsletter: 30%+ open rate
- Podcast: 1,000+ downloads per episode
- Audience match to your ICP

**PRICING GUIDELINES**
- Newsletters: $20-50 per 1,000 subscribers
- Podcasts: $20-50 per 1,000 downloads
- Negotiate for multi-issue deals

**CREATIVE THAT CONVERTS**
- Problem-focused headline
- Specific benefit (not features)
- Social proof if possible
- Clear CTA with unique link
- Special offer for listeners/readers

**TRACKING**
- Unique UTM links per sponsor
- Unique coupon codes
- Ask "how did you hear about us?"
- Compare CPA to other channels

**SPONSORSHIP TEMPLATE**
Subject: Sponsoring [Newsletter/Podcast Name]

Hi [Name],

Love [specific thing about their content].

I run [Product], which helps [audience] [outcome].

Would love to explore sponsoring [Newsletter/Podcast].

What does a typical sponsorship look like in terms of format and pricing?

Thanks!
[Your name]`
      }
    ]
  },
  {
    id: "seo-organic",
    name: "SEO & Organic Growth",
    icon: Search,
    description: "Get found through search engines",
    strategies: [
      {
        id: "keyword-research",
        title: "Keyword Research for SaaS: Finding What Customers Search",
        difficulty: "medium",
        timeToResults: "Ongoing",
        cost: "low",
        content: `Good keywords = content that actually gets found.

**KEYWORD TYPES**
1. Commercial: "[category] software" (high intent, competitive)
2. Informational: "how to [do thing]" (lower intent, easier to rank)
3. Navigational: "[your brand]" (already know you)

**RESEARCH PROCESS**

Step 1: Brainstorm seed keywords
- What would you search for?
- What do customers call their problem?
- Check competitor content

Step 2: Expand with tools
- Google autocomplete
- "People also ask" boxes
- Ahrefs/SEMrush keyword explorer
- Free: Ubersuggest, AnswerThePublic

Step 3: Evaluate keywords
- Search volume (100-1,000 for new sites)
- Keyword difficulty (under 30 for new sites)
- Search intent (matches what you offer?)
- Commercial potential (will searchers buy?)

**KEYWORD CATEGORIES TO TARGET**

Bottom-funnel (high intent):
- "[competitor] alternatives"
- "best [category] software"
- "[category] pricing"

Middle-funnel:
- "how to [solve problem]"
- "[category] comparison"
- "[category] for [use case]"

Top-funnel:
- "what is [concept]"
- "[industry] trends"
- "[problem] statistics"

**ORGANIZING KEYWORDS**
Create a spreadsheet:
- Keyword | Volume | Difficulty | Intent | Content idea | Status

Group related keywords for single pieces:
- Main keyword + variations
- Related questions
- Long-tail versions

**PRIORITIZATION**
Start with:
1. Low difficulty + commercial intent
2. Questions your customers actually ask
3. Topics you can write authoritatively about

**TOOLS**
Free: Google Search Console, Ubersuggest, AnswerThePublic
Paid: Ahrefs, SEMrush, Moz`
      },
      {
        id: "on-page-seo",
        title: "On-Page SEO: Optimizing Content That Ranks",
        difficulty: "medium",
        timeToResults: "1-3 months",
        cost: "free",
        content: `On-page SEO tells search engines what your content is about.

**THE ESSENTIALS**

Title Tag:
- Include primary keyword
- Under 60 characters
- Compelling (encourages clicks)
- Format: "[Primary Keyword]: [Benefit]"

Meta Description:
- Include keyword naturally
- Under 160 characters
- Describe what reader gets
- Include CTA

URL Structure:
- Short and clean
- Include keyword
- Use hyphens, not underscores
- Example: /blog/keyword-here

**CONTENT OPTIMIZATION**

Heading Structure:
- H1: Main topic (one per page)
- H2s: Main sections
- H3s: Subsections
- Include keywords naturally

First 100 Words:
- Include primary keyword
- Set up what the reader will learn
- Hook them to keep reading

Throughout Content:
- Use keyword 2-5x naturally
- Include related keywords
- Answer "People also ask" questions
- Comprehensive coverage of topic

**INTERNAL LINKING**
- Link to related content
- Use descriptive anchor text
- Link from high-authority pages
- Create topic clusters

**IMAGE OPTIMIZATION**
- Descriptive file names (not IMG_001.jpg)
- Alt text with keywords
- Compressed for speed
- Relevant to content

**PAGE EXPERIENCE**
- Mobile-friendly
- Fast loading (<3 seconds)
- Easy to read (short paragraphs)
- No intrusive pop-ups

**CHECKLIST**
□ Primary keyword in title, H1, URL
□ Meta description compelling and under 160 chars
□ Keyword in first 100 words
□ H2s and H3s organized logically
□ Internal links to related content
□ Images optimized with alt text
□ Content comprehensive and valuable`
      },
      {
        id: "link-building",
        title: "Link Building for SaaS: Earn Authority",
        difficulty: "advanced",
        timeToResults: "3-6 months",
        cost: "free",
        content: `Backlinks signal authority to Google. Here's how to earn them.

**LINK BUILDING HIERARCHY**
1. Create linkable assets
2. Promote to relevant sites
3. Build relationships
4. Scale what works

**LINKABLE ASSETS**
Create content others want to reference:
- Original research/data
- Free tools/calculators
- Comprehensive guides
- Industry statistics
- Templates and resources

**TACTICS**

Guest Posting:
- Write for relevant blogs
- Include contextual link
- Focus on quality, not quantity

Resource Link Building:
- Find resource pages in your niche
- Suggest your content as addition
- Offer value, not just asks

Broken Link Building:
- Find broken links on relevant sites
- Create replacement content
- Suggest your content as fix

HARO (Help a Reporter Out):
- Sign up for queries
- Respond with expertise
- Earn links from publications

Competitor Analysis:
- Find who links to competitors
- Offer better resource
- Reach out with suggestion

**OUTREACH TEMPLATE**
Subject: Resource for your [Page Topic]

Hi [Name],

Found your piece on [topic] - great resource!

I recently published [your content] which covers [specific angle].

Thought it might be a helpful addition to your page.

Either way, keep up the great work!

[Your name]

**WHAT TO AVOID**
- Buying links (can get penalized)
- Link exchanges
- Low-quality directories
- Irrelevant guest posts
- Exact-match anchor text spam

**METRICS**
- Domain authority of linking site
- Relevance to your topic
- Link placement (in content > footer)
- Do-follow vs. no-follow`
      },
      {
        id: "technical-seo",
        title: "Technical SEO Checklist for SaaS Websites",
        difficulty: "advanced",
        timeToResults: "1-2 months",
        cost: "free",
        content: `Technical SEO ensures search engines can find and understand your site.

**THE FUNDAMENTALS**

Site Speed:
- Target: under 3 seconds
- Compress images
- Enable caching
- Minimize JavaScript
- Use CDN
- Tool: Google PageSpeed Insights

Mobile-Friendly:
- Responsive design
- Touch-friendly buttons
- Readable without zooming
- No horizontal scroll
- Tool: Google Mobile-Friendly Test

HTTPS:
- SSL certificate active
- No mixed content (HTTP on HTTPS page)
- Redirect HTTP to HTTPS

**CRAWLABILITY**

Robots.txt:
- Located at /robots.txt
- Not blocking important pages
- Pointing to sitemap

XML Sitemap:
- Located at /sitemap.xml
- Includes all important pages
- Submitted to Google Search Console
- Updated when pages added

Indexability:
- Important pages not blocked
- No accidental noindex tags
- Canonical tags correct

**SITE STRUCTURE**

URL Structure:
- Logical hierarchy
- Short, descriptive URLs
- Consistent format

Internal Linking:
- Important pages accessible in 3 clicks
- Orphan pages linked
- Anchor text descriptive

Navigation:
- Clear menu structure
- Breadcrumbs where appropriate
- Footer links to key pages

**COMMON ISSUES**

Duplicate Content:
- Use canonical tags
- Avoid same content on multiple URLs
- Handle www vs. non-www

404 Errors:
- Fix or redirect broken links
- Custom 404 page
- Regular monitoring

Redirects:
- Use 301 for permanent moves
- Avoid redirect chains
- Update internal links

**TOOLS**
- Google Search Console (free, essential)
- Screaming Frog (crawl analysis)
- Ahrefs/SEMrush (technical audits)
- PageSpeed Insights (speed)`
      }
    ]
  },
  {
    id: "partnerships",
    name: "Partnerships & Affiliates",
    icon: Handshake,
    description: "Leverage others to grow",
    strategies: [
      {
        id: "affiliate-program",
        title: "Building a SaaS Affiliate Program",
        difficulty: "medium",
        timeToResults: "3-6 months",
        cost: "low",
        content: `Affiliates can become your highest-leverage sales channel.

**WHEN TO LAUNCH**
- Product-market fit established
- Smooth onboarding experience
- Stable billing system
- Resources to support affiliates

**COMMISSION STRUCTURES**
- Percentage of first payment (20-30%)
- Percentage for lifetime (10-20%)
- Flat fee per signup ($50-200)
- Hybrid (flat + percentage)

**PLATFORM OPTIONS**
Self-hosted: Rewardful, FirstPromoter, PartnerStack
Network: ShareASale, Impact, CJ Affiliate

**RECRUITING AFFILIATES**

Best affiliate types:
- Customers who love you
- Bloggers in your space
- YouTubers doing tutorials
- Consultants serving your ICP
- Newsletter owners

Where to find them:
- Your customer list
- Industry communities
- "Best [category] tools" articles
- YouTube search
- Competitor affiliate programs

**AFFILIATE RESOURCES**
Provide:
- Unique tracking links
- Banner images (various sizes)
- Email swipe copy
- Social media posts
- Demo videos
- Product screenshots

**ACTIVATION**
- Welcome email with quick start
- First commission celebration
- Monthly newsletter with tips
- Leaderboard (gamification)
- Bonus for top performers

**PROGRAM MANAGEMENT**
- Review signups for fraud
- Pay on time, every time
- Communicate product updates
- Share what's working
- Recognize top affiliates

**METRICS**
- Active affiliates (promoting)
- Conversion rate by affiliate
- Revenue by affiliate
- Customer quality (LTV, churn)

**PROTECTION**
- Approve affiliates manually
- Ban paid search bidding on brand
- Monitor for fraud
- Clear terms of service`
      },
      {
        id: "integration-partners",
        title: "Building Integration Partnerships",
        difficulty: "advanced",
        timeToResults: "3-6 months",
        cost: "free",
        content: `Integrations expand your market and create mutual referrals.

**WHY INTEGRATIONS MATTER**
- Customers expect them
- Reduce churn (stickier product)
- Co-marketing opportunities
- Marketplace exposure

**IDENTIFYING PARTNERS**
Ask customers:
- What other tools do you use?
- Where would integration help?
- Which tools do you wish connected?

Research:
- Competitor integrations
- Complementary products
- Workflow adjacencies

**PRIORITIZATION**
Rate potential partners:
- Customer demand (1-10)
- Technical feasibility (1-10)
- Partner receptiveness (1-10)
- Marketing potential (1-10)

Start with highest combined score.

**APPROACHING PARTNERS**

For established platforms:
- Check their partner program
- Apply through official channels
- Meet requirements (users, quality)

For similar-stage companies:
- Find right contact (partnerships, BD)
- Propose mutual value
- Start with simple integration

**PARTNERSHIP LEVELS**
1. Technical: API integration only
2. Co-marketing: Joint content, events
3. Revenue share: Referral fees
4. Deep: Custom integration, dedicated support

**THE PITCH**
Subject: [Your Product] + [Their Product] Integration

Hi [Name],

Our customers keep asking for [Their Product] integration.

We're [Your Product] - we help [target market] [outcome].
[X] of our users also use [Their Product].

Would love to explore a technical integration and potentially co-market to our combined audience.

Worth a call?

[Your name]

**MAKING IT WORK**
- Start small, prove value
- Document everything
- Cross-promote properly
- Measure shared customers
- Regular check-ins`
      },
      {
        id: "influencer-partnerships",
        title: "Influencer Partnerships for SaaS",
        difficulty: "medium",
        timeToResults: "1-3 months",
        cost: "medium",
        content: `The right influencer can put your product in front of thousands.

**FINDING INFLUENCERS**

Who to look for:
- YouTube creators doing tutorials
- Twitter/LinkedIn thought leaders
- Newsletter writers in your space
- Podcast hosts interviewing your ICP
- Blog writers creating "best of" lists

Where to find them:
- YouTube search: "[your category] tutorial"
- Twitter search: "#[your topic]"
- Google: "best [category] tools"
- Podcast directories
- SparkToro for audience research

**EVALUATING FIT**

Check:
- Audience overlap with your ICP
- Engagement rate (not just followers)
- Content quality
- Previous sponsorships
- Their actual use of similar tools

Red flags:
- Buys followers (check engagement)
- Takes any sponsorship
- No audience-product fit
- Poor content quality

**PARTNERSHIP TYPES**

1. Paid Sponsorship
- Flat fee for dedicated content
- Cost: $500-10,000+ depending on size
- Best for established products

2. Affiliate/Commission
- Pay per signup or sale
- Lower upfront risk
- Good for new products

3. Free Product + Exposure
- Give free/lifetime access
- They share if they love it
- Best for micro-influencers

4. Co-creation
- Build something together
- Joint webinar, course, etc.
- Shared audience benefit

**OUTREACH**
Subject: [Specific video/content] + partnership idea

Hi [Name],

Loved your [specific content] - especially the part about [specific detail].

I'm building [Product] which helps [audience] [outcome].

Thought it might be a fit for your audience. Would love to explore:
- Sponsored content
- Affiliate partnership
- Or just getting your feedback

Either way, keep creating great stuff!

[Your name]

**MEASUREMENT**
- Unique links with UTM parameters
- Unique coupon codes
- Ask "where did you hear about us?"
- Compare CAC to other channels`
      }
    ]
  },
  {
    id: "sales-conversion",
    name: "Sales & Conversion",
    icon: MousePointer,
    description: "Turn traffic into customers",
    strategies: [
      {
        id: "pricing-psychology",
        title: "Pricing Psychology: Make Your Prices Sell",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Price is a feature. Present it right and conversions increase.

**ANCHORING**
Show highest tier first (left to right)
The expensive option makes others feel reasonable
Example: Enterprise $299 → Pro $99 → Starter $29

**THE DECOY EFFECT**
Three tiers where middle is the "obvious" choice
Starter: Limited features
Pro: Full features (best value)
Enterprise: Pro + premium support

The Pro tier gets 60%+ of signups.

**CHARM PRICING**
$99 vs $100 feels significantly cheaper
$97 works for info products
$49 feels like "under $50"

But: Round numbers ($100) can signal premium/simplicity

**PRICE FRAMING**
Monthly: $99/month
Daily: $3.30/day
Per cup of coffee: Less than your daily latte

Annual billing: Show monthly price with "billed annually"
Example: "$8/mo (billed $96/year)" not "$96/year"

**FEATURE FRAMING**
Don't just list features - tie to outcomes:
✗ "10GB storage"
✓ "Enough space for 10,000 documents"

✗ "Priority support"
✓ "Get help in under 2 hours"

**SOCIAL PROOF ON PRICING**
- "Most popular" badge on recommended tier
- Customer logos near pricing
- "Join 5,000+ companies" above pricing
- Testimonials about value

**THE GUARANTEE**
Reduce risk perception:
- "30-day money-back guarantee"
- "Cancel anytime"
- "No credit card required"

**URGENCY (HONEST)**
- Limited-time discount for launch
- Early bird pricing
- Price increase announcement
- Bonus expiring

**A/B TEST**
- Different price points
- Annual vs. monthly default
- Feature allocation
- CTA copy
- Guarantee presentation`
      },
      {
        id: "landing-page-optimization",
        title: "Landing Page Optimization That Doubles Conversions",
        difficulty: "medium",
        timeToResults: "2-4 weeks",
        cost: "free",
        content: `Your landing page is your 24/7 salesperson. Make it work.

**ABOVE THE FOLD**

Headline:
- Clear outcome, not feature
- Under 10 words
- Bad: "AI-powered analytics platform"
- Good: "Know exactly why customers churn"

Subheadline:
- Expand on how
- Address who it's for
- 1-2 sentences max

CTA:
- Action-oriented ("Start free trial" not "Submit")
- Contrasting color
- Above and below the fold

Visual:
- Product screenshot or demo
- Real people using product
- Avoid stock photos

**THE PROBLEM SECTION**
- Make them feel the pain
- Use their words (from customer research)
- Show you understand

**SOCIAL PROOF**
- Customer logos (recognizable)
- Testimonials with photos, names, titles
- Specific results ("Increased revenue 47%")
- Star ratings, review counts
- "Used by X customers"

**FEATURES → BENEFITS**
For each feature:
- What it does
- Why it matters
- The outcome they get

Use icons + short descriptions
Show the product in action

**OBJECTION HANDLING**
FAQ section addressing:
- Is it hard to use?
- How long to see results?
- What if it doesn't work?
- What makes you different?

**THE CLOSE**
- Repeat value proposition
- Summarize what they get
- Final CTA
- Guarantee/risk reversal

**TESTING PRIORITIES**
1. Headline (biggest impact)
2. CTA copy and placement
3. Social proof presentation
4. Form length
5. Visual hierarchy

**TOOLS**
- Hotjar (heatmaps, recordings)
- Google Optimize (A/B tests)
- VWO, Optimizely (advanced testing)`
      },
      {
        id: "demo-strategy",
        title: "Product Demo Strategy That Closes Deals",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Demos are your chance to sell 1-on-1. Make them count.

**BEFORE THE DEMO**

Research:
- Their company (size, industry, challenges)
- Their role (responsibilities, goals)
- How they found you
- Previous interactions

Send:
- Calendar invite with agenda
- What to prepare (if anything)
- Brief on what to expect

**DEMO STRUCTURE (30-45 min)**

0-5 min: Discovery
- Confirm what you know
- Ask about their current situation
- Understand the pain

5-10 min: Bridge
- Connect their problems to your solution
- Set up what you'll show
- Get buy-in on priorities

10-25 min: Demonstration
- Show solutions to THEIR problems
- Focus on outcomes, not features
- Pause for questions
- Confirm understanding

25-30 min: Close
- Summarize what you showed
- Address objections
- Propose next step
- Set timeline

**DURING THE DEMO**

DO:
- Use their terminology
- Tell stories of similar customers
- Ask questions throughout
- Screen share with their use case
- Pause for reactions

DON'T:
- Feature dump
- Talk more than 70%
- Skip past their questions
- Rush through
- Forget to ask for the sale

**HANDLING OBJECTIONS**

Price:
"Compared to [alternative], how does the value stack up?"
"What's the cost of NOT solving this?"

Timing:
"What would need to change for timing to be right?"
"Would a shorter trial help you evaluate?"

Need to check with others:
"Who else should we include?"
"Would a recorded demo help?"

**FOLLOW-UP**

Same day:
- Thank you email
- Summary of what you showed
- Answers to any open questions
- Clear next step

If no response:
- Day 3: Quick follow-up
- Day 7: Add new value
- Day 14: Direct question`
      },
      {
        id: "trial-optimization",
        title: "Free Trial Optimization: From Signup to Paid",
        difficulty: "medium",
        timeToResults: "1-2 months",
        cost: "free",
        content: `Most trials don't convert. Here's how to fix that.

**THE CONVERSION EQUATION**
Conversion = Quick Win x Repeated Use x Upgrade Trigger

**ACTIVATION (FIRST SESSION)**

Define "activation":
- What action predicts conversion?
- Example: "Created first project"
- Example: "Invited team member"

Optimize for that action:
- Onboarding points there
- Email encourages it
- UI guides to it

Time to activation:
- Under 5 minutes ideal
- Remove unnecessary steps
- Pre-fill where possible

**ENGAGEMENT (DURING TRIAL)**

Days 1-3: Activation focus
- Welcome email
- Getting started guide
- First success celebration

Days 4-7: Depth
- Feature highlight emails
- Tips for getting more value
- Check-in on progress

Days 8-10: Social proof
- Success stories
- Case studies
- Results others achieved

Days 11-14: Conversion
- Trial ending reminders
- Special offer (if appropriate)
- Last chance message

**CONVERSION TRIGGERS**

Build limits that trigger upgrade:
- Usage limits (X actions free)
- Feature gates (premium features)
- Time limits (trial ending)
- Team size limits

Show upgrade value at these moments.

**REDUCING FRICTION**

During trial:
- No credit card required upfront
- Clear trial length
- Full feature access (usually)
- Great support

At conversion:
- Simple upgrade flow
- Carry over all data
- Multiple payment options
- Annual discount prominent

**TRIAL EXTENSION STRATEGY**
When they ask for extension:
- Extend conditionally
- Requires call/feedback
- Sets deadline for decision

**METRICS**
- Trial start rate (visitor → trial)
- Activation rate (trial → activated)
- Conversion rate (trial → paid)
- Time to convert
- Conversion by acquisition source`
      }
    ]
  },
  {
    id: "retention-referrals",
    name: "Retention & Referrals",
    icon: Gift,
    description: "Keep customers and get referrals",
    strategies: [
      {
        id: "reducing-churn",
        title: "Reducing Churn: Keep More Customers Paying",
        difficulty: "advanced",
        timeToResults: "2-4 months",
        cost: "free",
        content: `A 5% reduction in churn can increase profits 25-95%.

**TYPES OF CHURN**

Voluntary (they chose to leave):
- Not getting value
- Found alternative
- Budget cut
- No longer need it

Involuntary (didn't mean to leave):
- Failed payment
- Credit card expired
- Billing issues

**PREVENTING VOLUNTARY CHURN**

Onboarding:
- Fast time to value
- Clear success metrics
- Early wins celebrated

Engagement:
- Track product usage
- Identify inactive users
- Re-engage before they leave

Value:
- Regular feature updates
- Customer success check-ins
- Proactive support

**CHURN INDICATORS**
Watch for:
- Decreased login frequency
- Fewer features used
- Support tickets increase
- Account admin changes
- Competitor tool usage

Trigger intervention when detected.

**THE SAVE FLOW**

When they try to cancel:
1. Ask why (required question)
2. Offer alternatives:
   - Downgrade instead of cancel
   - Pause for X months
   - Special discount
   - Talk to support
3. Accept gracefully if they still want to go
4. Keep door open for return

**PREVENTING INVOLUNTARY CHURN**

Pre-dunning:
- Email before card expires
- Multiple payment methods
- Easy update process

Failed payment:
- Retry automatically
- Email sequence
- In-app notification
- Pause vs. cancel

**EXIT SURVEY**
Ask departing customers:
- Main reason for leaving
- What would have kept you?
- What will you use instead?
- Can we reach out in future?

**WIN-BACK CAMPAIGNS**

1 week after cancel:
"We miss you - here's what's new"

1 month after cancel:
"Come back for 20% off"

3 months after cancel:
"Major update you might like"

**METRICS**
- Logo churn (% customers leaving)
- Revenue churn (% revenue leaving)
- Net revenue retention (including expansion)
- Customer lifetime value`
      },
      {
        id: "referral-program",
        title: "Referral Program: Turn Customers into Salespeople",
        difficulty: "medium",
        timeToResults: "1-3 months",
        cost: "low",
        content: `Happy customers will refer if you make it easy.

**INCENTIVE STRUCTURES**

Two-sided rewards (most effective):
- Referrer gets: $X credit, month free, cash
- Friend gets: Discount, extended trial

One-sided:
- Only referrer rewarded
- Works if your product is truly loved

Tiered:
- Rewards increase with referrals
- Gamification element

**WHEN TO ASK**
Prime moments:
- After they complete key action
- After they leave positive review
- After renewal
- After support interaction (if satisfied)
- Milestone celebrations

**THE ASK**
Don't just ask - make it easy:
- Pre-written share messages
- One-click sharing
- Unique referral links
- Email templates

**CHANNELS**
- Email referral invites
- In-app share buttons
- Social media share
- Personal referral links
- QR codes

**PROGRAM PLACEMENT**
- Dedicated referral page
- Dashboard widget
- Post-purchase email
- Account settings
- Monthly emails

**TRACKING**
- Unique links per user
- Track: shares, clicks, signups, conversions
- Payout tracking
- Fraud prevention

**PROMOTING YOUR PROGRAM**
- Email blast to existing customers
- Onboarding mention
- Success moment trigger
- Contest/competitions
- Highlight top referrers

**EXAMPLE COPY**
"Know someone who'd love [Product]?
Give them 20% off their first month.
You'll get $20 credit.
[Share your unique link]"

**METRICS**
- Referral rate (% customers referring)
- Shares per referrer
- Click-through rate
- Conversion rate on referrals
- LTV of referred customers (often 25%+ higher)`
      },
      {
        id: "customer-success",
        title: "Customer Success: From Reactive Support to Proactive Growth",
        difficulty: "medium",
        timeToResults: "3-6 months",
        cost: "low",
        content: `Customer success prevents churn and drives expansion.

**SUPPORT VS SUCCESS**
Support: Reactive, handles issues
Success: Proactive, ensures outcomes

**CUSTOMER SEGMENTATION**

By value:
- High-value: Dedicated CSM, white-glove
- Mid-value: Pooled support, periodic check-ins
- Low-value: Self-serve, automated touches

By health:
- Healthy: Celebrate, upsell
- At-risk: Intervene, save
- Churning: Win-back attempt

**HEALTH SCORING**

Inputs:
- Product usage (login frequency, features used)
- Support tickets (volume, sentiment)
- Billing (payment issues, downgrades)
- Engagement (email opens, training attendance)
- Feedback (NPS, surveys)

Score: 1-100 or Red/Yellow/Green

**TOUCH STRATEGY**

Day 1-14: Onboarding
- Welcome call/email
- Setup assistance
- First success

Day 15-30: Activation
- Feature adoption check
- Training resources
- Progress review

Ongoing: Success maintenance
- Quarterly business reviews (high-value)
- Monthly check-ins (mid-value)
- Automated triggers (all)

**PLAYBOOKS**

New customer:
1. Welcome email (Day 0)
2. Kickoff call (Week 1)
3. Training session (Week 2)
4. Progress review (Week 4)

At-risk customer:
1. Alert triggered
2. CSM outreach
3. Root cause analysis
4. Save offer/intervention
5. Follow-up

Expansion ready:
1. Usage triggers
2. Success review
3. Growth proposal
4. Upgrade/upsell

**METRICS**
- Activation rate
- Time to value
- Product adoption
- Net Promoter Score
- Renewal rate
- Expansion revenue`
      }
    ]
  },
  {
    id: "pr-press",
    name: "PR & Press",
    icon: Globe,
    description: "Get media coverage",
    strategies: [
      {
        id: "press-release",
        title: "Writing Press Releases That Get Coverage",
        difficulty: "medium",
        timeToResults: "Immediate to 1 week",
        cost: "free",
        content: `Most press releases get ignored. Here's how to stand out.

**WHEN TO SEND**
Newsworthy events:
- Funding announcement
- Major product launch
- Significant partnership
- Notable customer win
- Reaching major milestone
- Industry research/data

NOT newsworthy:
- Minor updates
- Hiring announcements
- Self-promotional fluff

**THE STRUCTURE**

Headline:
- Active voice
- Specific
- Benefit or news focused
- Under 65 characters

Opening paragraph:
- Who, what, where, when, why, how
- Most important info first
- Company name and what happened

Body paragraphs:
- Expand on the news
- Quote from spokesperson
- Customer quote if relevant
- Context and background

Boilerplate:
- About your company (2-3 sentences)
- Standard company description

Contact info:
- Name, email, phone
- Someone who'll actually respond

**EXAMPLE OPENING**
"[Company] Launches [Product] to Help [Target] [Achieve Outcome]

[City, Date] – [Company], a [description], today announced [the news]. [One sentence on why it matters]."

**DISTRIBUTION**

Direct outreach:
- Industry journalists
- Relevant beat reporters
- Newsletter writers

Newswires (paid):
- PR Newswire, Business Wire
- Useful for SEO, not pickup

Social:
- Share on LinkedIn, Twitter
- Tag relevant people

**JOURNALIST OUTREACH**

Subject: [Specific angle] story idea

Hi [Name],

Saw your recent piece on [their article] - thought you might be interested in [your news].

[One sentence on what and why it matters]

Happy to share more details or arrange an interview with our [relevant person].

[Your name]

**FOLLOW-UP**
- Wait 2-3 days
- Keep it short
- Add new angle if possible
- Don't be pushy`
      },
      {
        id: "haro-strategy",
        title: "HARO & Expert Quotes: Earn Press Mentions",
        difficulty: "easy",
        timeToResults: "1-4 weeks",
        cost: "free",
        content: `Help a Reporter Out (HARO) connects sources with journalists.

**HOW IT WORKS**
1. Sign up at helpareporter.com
2. Get 3x daily emails with journalist queries
3. Respond with your expertise
4. Get quoted and linked

**SETTING UP**
- Sign up as a source (free)
- Choose relevant categories
- Set up email filters
- Create response templates

**WINNING QUERIES**

Good fit:
- Your area of expertise
- Relevant to your audience
- From legitimate publications
- Deadline gives you time

Bad fit:
- Outside your expertise
- Low-quality outlet
- Extremely tight deadline
- Obvious spam

**THE RESPONSE FORMULA**

Subject line: [Their query topic] - [Your credential]

Body:
1. Brief intro (name, title, company)
2. Why you're qualified
3. Direct answer to their question
4. 2-3 supporting points
5. Quotable soundbite
6. Offer for follow-up

**EXAMPLE RESPONSE**
Subject: SaaS Pricing Strategies - SaaS Founder with 1000+ customers

Hi [Name],

I'm [Your Name], founder of [Company], a [brief description] with [X] customers.

Re: your query on SaaS pricing strategies:

[2-3 paragraphs with specific, quotable insights]

Key quote: "[Concise, quotable statement]"

Happy to elaborate on any of these points.

Best,
[Your Name]
[Email] | [Website]

**TIPS FOR SUCCESS**
- Respond within 1-2 hours
- Be specific, not generic
- Include credentials upfront
- Make your quote ready to use
- Follow publication requirements
- Keep responses under 300 words

**OTHER PLATFORMS**
- SourceBottle
- Qwoted
- Terkel
- #JournoRequest on Twitter

**TRACKING**
- Save successful responses
- Note which types work
- Track actual mentions
- Build journalist relationships`
      },
      {
        id: "podcast-appearances",
        title: "Getting Booked on Podcasts in Your Niche",
        difficulty: "medium",
        timeToResults: "1-3 months",
        cost: "free",
        content: `Podcasts put you in front of engaged audiences for 30-60 minutes.

**FINDING PODCASTS**

Search methods:
- Apple Podcasts/Spotify: "[your topic]"
- Google: "[topic] podcast guests"
- Listen Notes, Podchaser
- Check where competitors appeared

Qualifying criteria:
- Active (new episodes)
- Relevant audience
- Has guests (not solo)
- Quality production
- Reasonable listener count (1,000+ per episode)

**YOUR PITCH**

Subject: Guest idea: [Specific topic]

Hi [Host name],

Love [specific episode] - especially [specific insight].

I'm [Name], [one-line description]. I'd love to share [specific topic] with your audience:

3 things I could discuss:
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

I've been on [other podcasts] and can provide quality audio.

Worth exploring?

[Your name]
[LinkedIn/Website]

**BEING A GREAT GUEST**

Before:
- Listen to 2-3 episodes
- Prepare talking points (not script)
- Test your audio setup
- Have quiet environment

During:
- Tell stories, not lectures
- Give specific examples
- Be conversational
- Provide actionable takeaways
- Mention your product naturally

After:
- Thank the host publicly
- Share widely when released
- Leave a review
- Stay in touch

**YOUR AUDIO SETUP**
- External microphone (USB or XLR)
- Quiet room
- Headphones (prevents echo)
- Wired internet if possible
- Recording backup (Zencastr, etc.)

**CREATING YOUR OWN PODCAST**
Alternative: Start your own and invite others
- Builds relationships
- Creates content
- Guests often share with their audience`
      }
    ]
  },
  {
    id: "quick-wins",
    name: "Quick Wins",
    icon: TrendingUp,
    description: "Fast tactics you can implement today",
    strategies: [
      {
        id: "24-hour-tactics",
        title: "10 Marketing Tactics You Can Implement in 24 Hours",
        difficulty: "easy",
        timeToResults: "Immediate to 1 week",
        cost: "free",
        content: `No budget, no time? Do these today.

**1. Email Signature Marketing**
Add to your email signature:
- Product link
- Lead magnet link
- "PS: See what I'm building"

**2. LinkedIn "Open to Work" for Products**
Your headline: "[Your product] helps [audience] [outcome]"

**3. Thank You Page Upsell**
After email signup or free trial:
"While you're here, follow us on [Twitter/LinkedIn]"
or "Share with a friend and get [bonus]"

**4. Exit Intent Popup**
When leaving your site, offer:
- Lead magnet
- Special discount
- "Wait! Get 10% off"

**5. Answer Questions on Quora/Reddit**
Find questions about your problem space.
Answer helpfully (not salesy).
Link to relevant content.

**6. Update Your Bio Everywhere**
Twitter, LinkedIn, GitHub, forum signatures.
Make it clear what you do and for whom.

**7. Ask for Reviews**
Email happy customers:
"Would you leave a review on [G2/Capterra]?"
Make it one-click easy.

**8. Share a Milestone**
Hit any number? Share it:
"Just hit 100 users!"
"Our first $1,000 month!"
People love rooting for underdogs.

**9. Create a Loom Demo**
5-minute product walkthrough.
Share on landing page, social, emails.
Low effort, high impact.

**10. Send a "How's it going?" Email**
To every customer:
"Hey, just checking in - how's [Product] working for you?"
Simple, personal, gets feedback and testimonials.

**BONUS: The 10-Minute Content**
- Screenshot of something interesting
- Quick tip related to your space
- Hot take on industry news
- Behind-the-scenes of your work

Post it. Don't overthink it.`
      },
      {
        id: "launch-day-checklist",
        title: "Launch Day: The Hour-by-Hour Playbook",
        difficulty: "medium",
        timeToResults: "1 day",
        cost: "free",
        content: `Launch day matters. Here's exactly what to do and when.

**THE NIGHT BEFORE**
□ Double-check product is working
□ Test checkout/signup flow
□ Prepare all assets and copy
□ Draft emails ready to send
□ Schedule social posts
□ Get good sleep

**LAUNCH DAY**

6:00 AM
□ Wake up, coffee, get focused
□ Final check everything works
□ Go live if not already

7:00 AM
□ Post launch announcement (Twitter/LinkedIn)
□ Send email to waitlist/audience
□ Submit to Product Hunt (if doing)

9:00 AM
□ Engage with early comments/questions
□ Reply to every social media response
□ Check analytics are tracking
□ Fix any issues that arise

12:00 PM
□ Second social post (different angle)
□ Share early traction/feedback
□ Respond to all comments
□ Thank early customers publicly

3:00 PM
□ Email key contacts personally
□ Reach out to friendly journalists/bloggers
□ Update social with progress
□ Address any support issues

6:00 PM
□ Evening social post
□ Share day's numbers (if doing build in public)
□ Thank supporters
□ Join relevant communities to share

9:00 PM
□ Wind down but stay available
□ Final engagement round
□ Schedule tomorrow's content
□ Celebrate (you launched!)

**THINGS TO HAVE READY**
- Launch announcement copy (5 versions)
- Product screenshots and GIFs
- Quick response templates
- Price/offer details
- FAQ answers
- Support contact visible

**DON'T FORGET**
- Eat meals (seriously)
- Stay calm (issues happen)
- Celebrate wins (even small ones)
- Document everything
- Thank everyone who helps`
      }
    ]
  },
  {
    id: "ai-prompts",
    name: "AI Prompts for Launch & Marketing",
    icon: Sparkles,
    description: "Copy-paste prompts to generate marketing with AI",
    strategies: [
      {
        id: "landing-page-prompt",
        title: "Landing Page Copy Generator",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Copy this prompt into ChatGPT or Claude to generate high-converting landing page copy for your AI-built SaaS:

---

I built a SaaS product using AI tools (like Replit, Claude, Cursor). I need landing page copy that converts visitors into customers.

**My Product:**
- Name: [YOUR PRODUCT NAME]
- What it does: [ONE SENTENCE DESCRIPTION]
- Who it's for: [TARGET CUSTOMER]
- Main problem it solves: [THE PAIN POINT]
- Key features: [LIST 3-5 FEATURES]
- Price: [YOUR PRICING]
- What makes it different: [YOUR UNIQUE ANGLE]

**Write landing page copy with these sections:**

1. **Hero Section**
- Headline (10 words max, benefit-focused, not feature-focused)
- Subheadline (expand on the transformation they'll experience)
- CTA button text (action-oriented, specific)

2. **Problem Section**
- 3 pain points my target customer experiences
- Make them feel understood (use "you" language)
- Agitate the problem (what happens if they don't solve it)

3. **Solution Section**
- Introduce my product as the answer
- 3 key benefits with icons/emojis
- Keep it simple - one sentence per benefit

4. **How It Works**
- 3 simple steps to get started
- Make it feel easy and fast

5. **Features with Benefits**
- List each feature
- For each feature, explain the benefit (what it means for them)

6. **Social Proof Section**
- 3 testimonial templates I can fill in
- What specific results to highlight

7. **FAQ Section**
- 5 common objections phrased as questions
- Answers that overcome those objections

8. **Final CTA Section**
- Urgency-creating headline
- Risk reversal (guarantee)
- Final CTA button text

**Tone:** Confident but not arrogant. Conversational, not corporate. Focus on outcomes, not features.

---

After you get the copy, paste it into Claude and ask: "Review this copy. Is anything unclear, too salesy, or missing? Improve it."`
      },
      {
        id: "sales-page-prompt",
        title: "Long-Form Sales Page Generator",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Use this prompt to generate a complete long-form sales page for your SaaS:

---

I need a long-form sales page for my SaaS product. Write persuasive copy that takes someone from curious to convinced to customer.

**Product Details:**
- Product: [NAME]
- Price: [AMOUNT]
- Target buyer: [WHO BUYS THIS]
- Their current frustration: [WHAT THEY'RE STRUGGLING WITH]
- The transformation: [BEFORE STATE] → [AFTER STATE]
- Proof I have: [TESTIMONIALS, RESULTS, CREDENTIALS]

**Write a sales page following this structure:**

1. **Pre-Headline** (call out the reader)
"Attention [specific person]..."

2. **Main Headline** (big promise)
Focus on the end result they want

3. **Opening Story/Hook** (first 3 paragraphs)
- Start with a relatable situation
- Build connection and credibility
- Make them want to keep reading

4. **Problem Amplification**
- What they've already tried that didn't work
- Why those solutions failed
- The hidden cost of staying stuck
- What happens if nothing changes

5. **The Breakthrough**
- How I discovered this solution
- Why it's different from everything else
- The "aha" moment

6. **Solution Introduction**
- Introduce the product naturally
- Frame it as the answer to everything above

7. **How It Works**
- Simple 3-step process
- Make it feel achievable

8. **What's Included** (features as benefits)
- Feature 1 → "Which means [benefit]"
- Feature 2 → "So you can [outcome]"
- (Continue for all features)

9. **Social Proof**
- Customer success stories
- Specific results with numbers
- Relatable situations

10. **The Offer**
- Everything they get (stack the value)
- Price reveal with context
- Payment options

11. **Guarantee**
- Remove all risk
- Make it specific and bold
- What they get if it doesn't work

12. **Urgency/Scarcity** (if applicable)
- Why act now
- What they lose by waiting

13. **Final CTA**
- Summarize the transformation
- Clear button text
- What happens after they click

14. **P.S. Sections** (3 of them)
- Restate the main benefit
- Mention the guarantee
- Create final urgency

**Style:** Write like you're talking to a friend. Be specific with numbers and results. Use short paragraphs. Bold key phrases.

---`
      },
      {
        id: "email-sequence-prompt",
        title: "Welcome Email Sequence Generator",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate a high-converting email sequence for new signups:

---

I need a 5-email welcome sequence for my SaaS. These emails should turn new signups into paying customers (or trial users into paid).

**My SaaS:**
- Product: [NAME]
- What it does: [ONE SENTENCE]
- Free trial length: [X DAYS] or freemium model
- Activation action: [THE KEY THING THEY NEED TO DO]
- Upgrade price: [AMOUNT]
- Main objection: [WHY PEOPLE DON'T BUY]

**Write 5 emails:**

**Email 1: Welcome (Send immediately)**
- Subject line (create curiosity)
- Thank them for signing up
- Set expectations (what emails they'll get)
- One clear CTA to take the activation action
- P.S. with personal touch

**Email 2: Quick Win (Day 1)**
- Subject line (promise a result)
- Share one specific tip they can use in 5 minutes
- Show the outcome they'll get
- CTA to try it in the app
- Keep it short (under 150 words)

**Email 3: Story + Social Proof (Day 3)**
- Subject line (curiosity about a customer)
- Tell a customer success story
- Be specific about results (numbers, timeframes)
- "You can get similar results"
- CTA to take the next step

**Email 4: Objection Handling (Day 5)**
- Subject line (address the main doubt)
- "I know you might be thinking..."
- Address the #1 reason people don't buy
- Provide proof/reassurance
- Soft CTA

**Email 5: The Pitch (Day 7)**
- Subject line (direct but not pushy)
- Recap the value they've experienced
- Present the upgrade offer
- What they get vs. what they're missing
- Time-limited incentive (if you have one)
- Strong CTA with guarantee mention

**For each email, include:**
- Subject line (+ 2 alternatives for A/B testing)
- Preview text
- Body copy
- CTA button text

**Tone:** Personal, helpful, not pushy. Like a friend who wants them to succeed.

---`
      },
      {
        id: "social-media-prompt",
        title: "30-Day Social Media Content Generator",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate a month of social media content for your SaaS launch:

---

I need 30 days of social media content to promote my AI-built SaaS. Mix of educational, promotional, and engagement content.

**My Product:**
- Name: [YOUR PRODUCT]
- What it does: [ONE SENTENCE]
- Who it's for: [TARGET AUDIENCE]
- Main platforms: [TWITTER/LINKEDIN/BOTH]
- My story: [BUILT WITH AI IN X WEEKS, WHY I BUILT IT]

**Generate 30 posts:**

**Week 1: Build in Public / Launch Week**
Day 1: Launch announcement (exciting, grateful)
Day 2: The problem I'm solving (relatable story)
Day 3: Behind the scenes of building with AI
Day 4: First customer/user story
Day 5: Key feature highlight #1
Day 6: The "aha moment" users have
Day 7: Week 1 stats/learnings (transparency)

**Week 2: Education + Value**
Day 8: Common mistake in [your space]
Day 9: Quick tip related to your product
Day 10: Myth vs Reality in [your industry]
Day 11: How to [solve problem] in 3 steps
Day 12: Feature highlight #2
Day 13: User feedback/testimonial
Day 14: What I learned building this

**Week 3: Social Proof + Authority**
Day 15: Customer result with numbers
Day 16: Comparison: Before vs After using [product]
Day 17: Why I built this differently
Day 18: Feature highlight #3
Day 19: FAQ - addressing common question
Day 20: "Hot take" / contrarian opinion in your space
Day 21: Milestone celebration

**Week 4: Conversion Focus**
Day 22: Limited time offer (if applicable)
Day 23: Case study breakdown
Day 24: "Perfect for you if..." post
Day 25: Objection handling post
Day 26: Feature highlight #4
Day 27: Founder story (vulnerability, connection)
Day 28: User-generated content or testimonial
Day 29: Special offer reminder
Day 30: Looking back / looking forward

**For each post, include:**
- Hook (first line that stops the scroll)
- Body (2-4 short paragraphs or bullet points)
- CTA (what you want them to do)
- Hashtags (if relevant)

**Style:** Conversational, authentic, no corporate speak. Show personality.

---`
      },
      {
        id: "cold-email-prompt",
        title: "Cold Outreach Email Templates",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate personalized cold emails that get responses:

---

I need cold email templates to reach potential customers for my SaaS. These need to be short, personalized, and not salesy.

**My SaaS:**
- Product: [NAME]
- What it does: [ONE SENTENCE]
- Who it's for: [JOB TITLE / COMPANY TYPE]
- Main benefit: [THE OUTCOME THEY GET]
- Proof: [RESULT YOU'VE ACHIEVED FOR OTHERS]

**Generate these email templates:**

**Template 1: The Observation Email**
- Lead with something specific about their company/work
- Connect it to a problem you solve
- Offer to help (not sell)
- Under 100 words

**Template 2: The Mutual Connection**
- Reference shared connection/community/interest
- Explain why you thought of them
- Soft ask for a conversation
- Under 100 words

**Template 3: The Value-First Email**
- Lead with a useful insight for their business
- No pitch in first email
- Offer more value if interested
- Under 75 words

**Template 4: The Case Study Email**
- "Helped [similar company] achieve [result]"
- Specific numbers
- Ask if relevant to them
- Under 100 words

**Template 5: The Problem-Focused Email**
- Lead with a question about a common problem
- Show you understand their world
- Hint at solution without pitching
- Under 75 words

**For each template, include:**
- Subject line (short, curiosity-driven)
- Email body
- CTA (soft ask, easy to say yes to)
- Follow-up email (3 days later)

**Rules:**
- No "I hope this email finds you well"
- No "I'd love to pick your brain"
- No attachments or long paragraphs
- Be specific, not generic
- Make it easy to reply

---`
      },
      {
        id: "testimonial-request-prompt",
        title: "Testimonial Request Templates",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Get powerful testimonials from your customers:

---

I need to collect testimonials from my SaaS customers. Help me ask in a way that gets specific, usable responses.

**My Product:** [NAME]
**What customers use it for:** [USE CASE]

**Generate these templates:**

**Template 1: Email Request (Happy Customer)**
Subject: Quick favor? (2 min)

"Hey [Name],

I noticed you've been using [Product] for [X weeks/months] - thanks for being an early supporter!

Would you be open to sharing a quick testimonial? Just 2-3 sentences about:
- What problem [Product] solved for you
- Any specific results you've seen

No pressure at all - I know you're busy. But if you have a few minutes, it would mean a lot and help others like you find us.

Either reply to this email or I can send a quick form - whatever's easier.

Thanks!
[Your name]"

**Template 2: In-App Request (After Success Moment)**
"🎉 Nice! You just [completed key action].

Quick question: How has [Product] helped you so far?

[Text box]

(Takes 30 seconds - helps us improve!)"

**Template 3: Guided Questions (For Detailed Testimonials)**
"Thanks for agreeing to share your experience! Here are a few questions to help:

1. What were you struggling with before [Product]?
2. What made you decide to try us?
3. What specific results have you seen? (Numbers help!)
4. What would you tell someone considering [Product]?
5. Anything else you'd want people to know?

Feel free to answer however many you'd like!"

**Template 4: Video Testimonial Request**
"Hey [Name],

Your results with [Product] have been amazing - would you be open to a quick 2-minute video testimonial?

I'll send you 3 simple questions to answer on camera. Can be recorded on your phone - doesn't need to be fancy.

As a thank you, I'll give you [incentive: free month, feature access, etc.]

Interested?"

**Template 5: Twitter/LinkedIn Testimonial Prompt**
"Hey [Name], would you mind sharing your experience with [Product] on [Twitter/LinkedIn]?

Something like: 'Been using [Product] for [X]. [Specific result]. Worth checking out if you [use case].'

No pressure - but would mean a lot if you have a sec!"

**Follow-up Template (If No Response)**
"Hey [Name], just floating this back up - no worries if you're too busy! If you have 30 seconds, even a one-liner would help. Thanks either way!"

---`
      },
      {
        id: "objection-handling-prompt",
        title: "Objection Handling Script Generator",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate responses to every objection your prospects raise:

---

I need scripts to handle common objections for my SaaS. Help me respond in a way that's empathetic but effective.

**My SaaS:**
- Product: [NAME]
- Price: [AMOUNT]
- Main competitor: [COMPETITOR NAME]
- Our advantage: [WHAT WE DO BETTER]
- Guarantee: [YOUR GUARANTEE IF ANY]

**Generate responses for these objections:**

**1. "It's too expensive"**
- Reframe: Cost vs. investment
- Compare: What's the cost of NOT solving this?
- Options: Payment plans, annual discount, smaller tier

**2. "I don't have time to learn a new tool"**
- Address: How long onboarding actually takes
- Proof: How quickly others got started
- Offer: Done-for-you setup, onboarding call

**3. "I need to think about it"**
- Understand: What specifically do you need to think about?
- Address: The real objection underneath
- Urgency: What they're losing by waiting

**4. "I need to check with my [boss/team/partner]"**
- Help: What info do they need to present?
- Offer: Resources to share (one-pager, case study)
- Include: Proposal to send to decision maker

**5. "We already use [competitor]"**
- Compare: What specifically is different
- Risk: How easy it is to switch/try
- Proof: Why others switched from [competitor]

**6. "I'm not sure it will work for my situation"**
- Clarify: What's unique about their situation?
- Proof: Similar use case that succeeded
- Risk: Guarantee/trial to reduce risk

**7. "Can I get a discount?"**
- Value: Restate what they're getting
- Options: Annual plan, referral discount
- Firm: If no discount, explain why value is worth it

**8. "I've been burned before by similar tools"**
- Empathize: Acknowledge their bad experience
- Differentiate: Why this is different
- Proof: Guarantee, case studies, trial

**For each objection, give me:**
- Empathy statement (show I understand)
- Reframe (shift their perspective)
- Evidence (proof/example)
- Close (move toward next step)

**Tone:** Understanding, not defensive. Confident, not pushy.

---`
      },
      {
        id: "launch-announcement-prompt",
        title: "Launch Announcement Content Pack",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate all the content you need for launch day:

---

I'm launching my AI-built SaaS and need all my launch content ready. Generate everything I need to announce across all channels.

**Product Details:**
- Name: [YOUR PRODUCT]
- What it does: [ONE SENTENCE]
- Who it's for: [TARGET AUDIENCE]
- Built with: AI tools (Claude/Replit/Cursor)
- Build time: [X WEEKS/DAYS]
- Price: [AMOUNT]
- Launch offer: [SPECIAL DEAL IF ANY]
- Website: [URL]

**Generate these assets:**

**1. Product Hunt Launch Post**
- Tagline (60 characters max)
- Short description (260 characters)
- Full description (longer, with bullets)
- First comment (maker story - why I built this, my journey with AI)

**2. Twitter/X Launch Thread (10 tweets)**
Tweet 1: Hook (announcement, what I built)
Tweet 2: The problem (why this matters)
Tweet 3: My story (why I built it)
Tweet 4: How I built it with AI
Tweet 5: Key feature #1 (with benefit)
Tweet 6: Key feature #2 (with benefit)
Tweet 7: Key feature #3 (with benefit)
Tweet 8: Social proof / early results
Tweet 9: Launch special offer
Tweet 10: CTA + link

**3. LinkedIn Announcement Post**
- Hook line
- The problem I'm solving
- My journey to building this
- What the product does
- Early results/feedback
- CTA with link

**4. Email to My List**
- Subject line (+ 2 alternatives)
- Preview text
- Body: excitement, what it is, special offer, CTA
- P.S. with urgency

**5. Reddit Post (for r/SideProject or relevant sub)**
- Title format: "I built [X] to help [Y] do [Z]"
- Body: Problem, solution, how I built it, ask for feedback

**6. Hacker News "Show HN" Post**
- Title: "Show HN: [Product] – [What it does]"
- Body: Why I built it, technical details, what I'm looking for

**7. Short-form Video Script (60 seconds)**
- Hook (first 3 seconds)
- Problem (next 10 seconds)
- Solution (next 15 seconds)
- Demo highlights (next 20 seconds)
- CTA (final 10 seconds)

**Tone:** Excited but not hype-y. Authentic founder voice. Show personality.

---`
      },
      {
        id: "ad-copy-prompt",
        title: "Paid Ad Copy Generator",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate high-converting ad copy for paid campaigns:

---

I need ad copy for paid advertising campaigns for my SaaS. Generate variations I can test.

**My SaaS:**
- Product: [NAME]
- What it does: [ONE SENTENCE]
- Target audience: [WHO]
- Main pain point: [PROBLEM]
- Key benefit: [OUTCOME]
- Price: [AMOUNT]
- Landing page: [URL]

**Generate ads for each platform:**

**FACEBOOK/INSTAGRAM ADS (5 variations)**

Ad 1: Problem-Focused
- Headline (40 chars): Call out the pain
- Primary text (125 chars): Agitate + solution
- Description (30 chars): Benefit
- CTA button: [Best option]

Ad 2: Benefit-Focused
- Lead with the transformation
- Focus on the after state

Ad 3: Social Proof
- Lead with a result/testimonial
- Numbers and specifics

Ad 4: Question Hook
- Start with a question they say "yes" to
- Introduce solution

Ad 5: Urgency/Offer
- Lead with special offer
- Time limitation

**GOOGLE SEARCH ADS (3 variations)**

Ad 1:
- Headline 1 (30 chars): [Primary keyword + benefit]
- Headline 2 (30 chars): [Social proof/result]
- Headline 3 (30 chars): [CTA]
- Description (90 chars): [Problem → solution → action]

Ad 2: Competitor comparison angle
Ad 3: Question + answer format

**LINKEDIN ADS (3 variations)**

Ad 1: Professional tone, ROI focused
Ad 2: Thought leadership angle
Ad 3: Case study / result focused

**TWITTER ADS (3 variations)**

Short, punchy, conversational
- Version 1: Problem/solution
- Version 2: Result/benefit
- Version 3: Question/CTA

**For all ads include:**
- Primary text/copy
- Headline options
- Description options
- CTA button recommendation
- Image/creative direction suggestion

**A/B Testing Notes:**
- What to test first
- How to know what's working
- When to scale vs. when to cut

---`
      },
      {
        id: "pricing-page-prompt",
        title: "Pricing Page Copy Optimizer",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate optimized pricing page copy that converts:

---

I need help with my SaaS pricing page copy. Make it clear, compelling, and conversion-optimized.

**My Pricing:**
- Free tier: [WHAT'S INCLUDED]
- Tier 1: [NAME, PRICE, FEATURES]
- Tier 2: [NAME, PRICE, FEATURES] (most popular)
- Tier 3: [NAME, PRICE, FEATURES] (or Enterprise)
- Annual discount: [IF ANY]

**My ICP (Ideal Customer):**
- Who they are: [JOB TITLE/COMPANY]
- What they care about: [PRIORITIES]
- Budget range: [EXPECTATIONS]

**Generate pricing page copy:**

**1. Pricing Page Headline**
- Not "Pricing" - make it benefit-focused
- Example: "Simple pricing. Start free. Scale as you grow."

**2. Subheadline**
- Address the #1 pricing concern
- Example: "No hidden fees. Cancel anytime. 14-day free trial on all plans."

**3. Tier Names**
- Should reflect who uses each tier
- Example: "Starter → Growth → Enterprise" or "Solo → Team → Business"

**4. Feature Descriptions**
For each feature, write:
- Clear name (what it is)
- Benefit subtitle (why it matters)
- Example: "Unlimited projects" → "Never worry about hitting limits"

**5. "Most Popular" Badge Copy**
- Which tier to highlight
- Why (social proof angle)

**6. CTA Button Copy**
For each tier:
- Free: "Start for free"
- Paid: "Start 14-day trial" or "Get started"
- Enterprise: "Talk to sales" or "Get a demo"

**7. FAQ Section (5 questions)**
1. What happens after my trial ends?
2. Can I switch plans later?
3. What payment methods do you accept?
4. Is there a long-term contract?
5. Do you offer refunds?

**8. Trust Elements**
- Guarantee copy
- Security badges
- Payment processor logos
- Testimonial placement

**9. Annual vs Monthly Toggle**
- How to present savings
- Copy for the toggle
- Example: "Save 20% with annual billing"

**10. Enterprise/Custom Tier**
- When to show it
- What copy to use
- CTA for sales conversation

---`
      },
      {
        id: "feature-announcement-prompt",
        title: "Feature Announcement Generator",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate content for announcing new features:

---

I just shipped a new feature for my SaaS and need to announce it. Generate all the content I need.

**Feature Details:**
- Feature name: [NAME]
- What it does: [DESCRIPTION]
- Problem it solves: [PAIN POINT]
- Who asked for it: [USER FEEDBACK SOURCE]
- How to use it: [QUICK STEPS]

**Generate these announcements:**

**1. In-App Announcement**
- Modal headline (short, exciting)
- 2-3 bullet points (what's new)
- CTA button text
- "Learn more" link text

**2. Email Announcement**
Subject line: [+ 2 alternatives]
- Exciting opener
- What the feature does
- Why we built it (user feedback)
- How to try it (with link)
- What's coming next (tease)

**3. Twitter/X Post**
- Single tweet announcement
- Thread version (3-5 tweets)
- Include: what, why, how, CTA

**4. LinkedIn Post**
- Professional tone
- Why this matters for [audience]
- Behind-the-scenes on building it
- CTA

**5. Changelog Entry**
- Clear title
- Description
- Screenshot placeholder note
- Related documentation link

**6. Product Hunt Update (if applicable)**
- Short update for your product page
- What's new and why it matters

**7. Blog Post Outline**
- Headline
- Introduction (the problem)
- The solution (feature overview)
- How to use it (step by step)
- Use cases (2-3 examples)
- What's next
- CTA

**Tone:** Excited but not over-hyped. User-focused (not "we shipped" but "you can now...").

---`
      },
      {
        id: "competitor-comparison-prompt",
        title: "Competitor Comparison Page Generator",
        difficulty: "advanced",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate SEO-optimized competitor comparison pages:

---

I need to create comparison pages for SEO: "[My Product] vs [Competitor]". Help me write fair, compelling comparisons.

**My Product:**
- Name: [YOUR PRODUCT]
- What it does: [DESCRIPTION]
- Key strengths: [WHAT YOU DO BEST]
- Honest weaknesses: [WHERE YOU'RE NOT AS STRONG]
- Price: [YOUR PRICING]
- Best for: [IDEAL USER]

**Competitor:**
- Name: [COMPETITOR NAME]
- Their strengths: [WHAT THEY DO WELL]
- Their weaknesses: [WHERE THEY FALL SHORT]
- Their price: [THEIR PRICING]
- Best for: [THEIR IDEAL USER]

**Generate this comparison page:**

**1. SEO-Optimized Title**
"[Your Product] vs [Competitor]: [Year] Comparison"

**2. Meta Description**
150-160 characters, includes both product names, compels click

**3. Introduction (200 words)**
- Acknowledge both products are good options
- Set up what we'll compare
- Who should read this (decision-makers)
- What you'll learn

**4. Quick Comparison Table**
| Feature | [Your Product] | [Competitor] |
- Key features (5-7 rows)
- Pricing
- Best for

**5. Detailed Comparison Sections**
For each major category (Features, Pricing, Ease of Use, Support):
- H2 heading
- What [Competitor] offers
- What [Your Product] offers
- The verdict (fair assessment)

**6. Who Should Choose [Competitor]**
- Be honest about when they're the better choice
- Builds trust and credibility

**7. Who Should Choose [Your Product]**
- Your ideal user profile
- Specific use cases

**8. Pricing Comparison**
- Side by side breakdown
- Value analysis
- Hidden costs to watch for

**9. Migration Section**
- How easy it is to switch from [Competitor]
- What the process looks like
- Offer migration help

**10. Conclusion**
- Fair summary
- Clear recommendation
- CTA for your product

**SEO Notes:**
- Include "[Competitor] alternative" keywords
- Add FAQ schema at the bottom
- Link to your features page

**Tone:** Fair, balanced, confident but not trash-talking. Win on merits, not mudslinging.

---`
      },
      {
        id: "customer-success-prompt",
        title: "Customer Success Story Generator",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Turn customer results into compelling case studies:

---

I have a successful customer and want to create a case study. Help me tell their story in a compelling way.

**Customer Details:**
- Company/Person: [NAME]
- Industry: [THEIR INDUSTRY]
- Size: [COMPANY SIZE OR INDIVIDUAL]
- Their problem before: [WHAT THEY STRUGGLED WITH]
- How they found us: [DISCOVERY CHANNEL]
- Solution: How they use [YOUR PRODUCT]
- Results: [SPECIFIC OUTCOMES WITH NUMBERS]
- Quote from them: [IF YOU HAVE ONE]

**Generate these assets:**

**1. Full Case Study (Blog Format)**

Title: "How [Customer] [Achieved Result] with [Product]"

Structure:
- **The Challenge** (3-4 paragraphs)
  - Who they are
  - What they were struggling with
  - What they'd tried before
  - The cost of the problem

- **The Solution** (3-4 paragraphs)
  - How they found you
  - Why they chose you
  - Implementation process
  - How they use it now

- **The Results** (3-4 paragraphs)
  - Specific outcomes (numbers!)
  - Before vs. after comparison
  - Unexpected benefits
  - Customer quote

- **Key Takeaways** (bullet points)
  - 3-4 lessons others can learn

**2. Short Version (For Website)**
- 150-200 words
- Problem → Solution → Result format
- Pull quote highlighted
- Key metric in large text

**3. Social Media Version**
Twitter thread:
- Tweet 1: Result hook ("How [Customer] [result]...")
- Tweet 2: The problem
- Tweet 3: The solution
- Tweet 4: Specific results
- Tweet 5: Quote + CTA

LinkedIn post:
- Story format, same structure
- Professional tone

**4. Email Version**
- Subject: "[Customer] achieved [result] - here's how"
- Short story format
- CTA to read full case study or try product

**5. Pull Quotes (3-5)**
- Quotable one-liners from the story
- For social media, landing pages, etc.

**6. Video Script (If Recording)**
- Interview questions to ask
- B-roll shot list
- 2-minute final cut structure

---`
      },
      {
        id: "webinar-content-prompt",
        title: "Webinar/Demo Content Generator",
        difficulty: "advanced",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate complete webinar content that converts attendees to customers:

---

I'm hosting a webinar to promote my SaaS. Help me create content that educates AND sells.

**Webinar Details:**
- Topic: [WHAT YOU'LL TEACH]
- Product: [YOUR SAAS]
- Target audience: [WHO SHOULD ATTEND]
- Duration: [LENGTH]
- Goal: [SIGNUPS, DEMOS, SALES]

**Generate these components:**

**1. Webinar Title Options (5)**
- Benefit-focused
- Curiosity-creating
- Specific outcome promised

**2. Registration Page Copy**
- Headline
- What they'll learn (4-5 bullets)
- Who this is for
- Who's presenting (bio)
- Date/time
- CTA button text

**3. Reminder Email Sequence**
- 1 week before
- 1 day before
- 1 hour before
- Starting now

**4. Webinar Outline (60 min)**

0-5 min: Welcome + Agenda
- Thank attendees
- Set expectations
- Promise what they'll learn

5-20 min: Education/Value
- Teach something genuinely useful
- 3-4 key insights
- Actionable takeaways

20-35 min: Product Demo
- Natural transition
- Show how product delivers on what you just taught
- Focus on benefits, not features
- Live demo or recorded walkthrough

35-45 min: Case Studies/Proof
- Customer success stories
- Specific results
- Testimonials

45-55 min: Offer/CTA
- Special webinar-only offer
- Clear pricing
- Bonuses for signing up today
- Guarantee

55-60 min: Q&A
- Address objections
- Live questions
- Final CTA

**5. Slide Outline**
- Key slides needed
- Visual suggestions
- Talking points per slide

**6. Follow-Up Email Sequence (for attendees)**
- Replay email (day 0)
- Additional value (day 1)
- Case study (day 3)
- Offer reminder (day 5)
- Last chance (day 7)

**7. Follow-Up for No-Shows**
- Different sequence
- Replay emphasis
- Re-engagement

---`
      },
      {
        id: "video-sales-letter-prompt",
        title: "Video Sales Letter (VSL) Script Generator",
        difficulty: "advanced",
        timeToResults: "Immediate",
        cost: "free",
        content: `Write a high-converting Video Sales Letter script:

---

I need a VSL script that can convert cold traffic into customers for my SaaS.

**My Product:**
- Name: [YOUR PRODUCT]
- What it does: [ONE SENTENCE]
- Price: [AMOUNT]
- Target audience: [WHO]
- Main problem solved: [THE PAIN]
- Main result: [THE TRANSFORMATION]
- Unique mechanism: [WHY IT WORKS]
- Social proof: [TESTIMONIALS, NUMBERS]

**Write a VSL script following this structure:**

**0:00-0:30 - THE HOOK**
Open with one of these:
- Shocking statistic
- Provocative question
- Bold claim
- Story that creates curiosity
GOAL: Stop the scroll, keep them watching

**0:30-2:00 - THE PROBLEM**
- Identify their specific pain
- Show you understand (you've been there)
- Agitate the problem (what happens if unsolved)
- Make them feel the pain emotionally
Use words like "you" and "your" throughout

**2:00-4:00 - FAILED SOLUTIONS**
- What they've probably tried
- Why those solutions don't work
- Common misconceptions
- Why it's not their fault
Build frustration with status quo

**4:00-6:00 - THE BREAKTHROUGH**
- How you discovered the solution
- Your credibility/story
- The "aha moment"
- The unique mechanism (why THIS works)
Create hope and curiosity

**6:00-9:00 - THE SOLUTION**
- Introduce your product naturally
- How it works (simple 3-step process)
- Why it's different from everything else
- Features → Benefits (what it means for THEM)
Show the path from problem to result

**9:00-12:00 - PROOF**
- Customer success stories (specific results)
- Before/after comparisons
- Numbers and data
- Expert endorsements if available
Stack the evidence

**12:00-14:00 - THE OFFER**
- Everything they get (stack value)
- Bonuses (add 3-5)
- Total value vs. price
- Price reveal
- Payment options
Make it feel like a no-brainer

**14:00-15:00 - RISK REVERSAL**
- Your guarantee
- Make it bold and specific
- Remove all risk from their decision

**15:00-16:00 - URGENCY/SCARCITY**
- Why act now
- What they lose by waiting
- Deadline or limited availability

**16:00-17:00 - FINAL CTA**
- Summarize the transformation
- Clear instruction on what to do
- What happens after they click
- Final push

**TONE:** Conversational, like talking to a friend. Passionate but not hype-y. Genuine belief in your product.

**PACING NOTES:**
- Short sentences
- Paragraph breaks for pauses
- Emphasis marks for key words
- Emotion cues [pause here, lean in]

---`
      },
      {
        id: "affiliate-program-prompt",
        title: "Affiliate Program Launch Kit",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Create everything needed to launch an affiliate program:

---

I want to launch an affiliate program for my SaaS to drive referrals.

**My Product:**
- Name: [YOUR PRODUCT]
- Price: [AMOUNT]
- Target customer: [WHO BUYS THIS]
- Current customer base: [SIZE]
- Commission I can offer: [% OR FLAT]

**Generate everything I need:**

**1. Affiliate Program Structure**
- Commission percentage/amount
- Cookie duration recommendation
- Payout threshold and schedule
- Recurring vs. one-time commission
- Tier structure (if applicable)

**2. Affiliate Recruitment Page Copy**
Headline: "Earn [X] Recommending [Product] to Your Audience"

Sections:
- What the program offers
- Why promote us (conversion rates, support, product quality)
- Who should join (ideal affiliates)
- How it works (simple steps)
- Commission structure
- Tools we provide
- Apply CTA

**3. Welcome Email for Approved Affiliates**
- Congratulations message
- Login details
- Quick start guide
- Commission reminder
- Support contact
- First action to take

**4. Affiliate Swipe Copy**
Ready-to-use promotional content:

Email Templates (3):
- Introduction email
- Testimonial-focused email
- Problem/solution email

Social Media Posts (5):
- Twitter/X threads
- LinkedIn posts
- Instagram captions

Blog Post Outline:
- Review post structure
- Comparison post structure
- How-to post featuring product

**5. Promotional Graphics Specs**
- Banner sizes needed
- Logo usage guidelines
- Screenshot assets to create
- Video assets if available

**6. Affiliate Onboarding Sequence**
Day 1: Welcome + Quick Start
Day 3: Top-performing content examples
Day 7: Tips from top affiliates
Day 14: Check-in + offer support
Day 30: Advanced strategies

**7. Terms and Conditions**
- Prohibited marketing methods
- Brand guidelines
- Disclosure requirements
- Payment terms
- Termination conditions

**8. Performance Tracking**
- KPIs to monitor
- Top affiliate recognition
- Inactive affiliate re-engagement

---`
      },
      {
        id: "podcast-outreach-prompt",
        title: "Podcast Guest Outreach System",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Get booked on podcasts to promote your SaaS:

---

I want to appear on podcasts to build authority and get customers for my SaaS.

**My Background:**
- Name: [YOUR NAME]
- Product: [YOUR PRODUCT]
- Expertise: [YOUR TOPIC AREAS]
- Unique angle: [WHAT MAKES YOU INTERESTING]
- Previous media/podcasts: [IF ANY]
- Target audience: [WHO NEEDS TO HEAR THIS]

**Generate a complete podcast outreach system:**

**1. Ideal Podcast Profile**
- Podcast size range (downloads per episode)
- Topics that align with your expertise
- Audience demographics
- Show format (interview vs. solo vs. co-host)
- List 10 specific podcasts to target

**2. Guest One-Sheet**
Professional one-pager including:
- Your bio (50 words)
- Your credentials
- 5 topic ideas with compelling titles
- Sample interview questions
- Previous podcast appearances
- Social media handles
- Professional photo note
- Contact info

**3. Pitch Email Templates**

**Template 1: Cold Outreach**
Subject line options (3)
Body:
- Personalized opening (reference specific episode)
- Why you're a fit
- 2-3 topic ideas
- Social proof
- Easy ask

**Template 2: Warm Introduction Request**
Ask mutual connection to intro

**Template 3: Follow-Up (3-day)**
Shorter, add value

**Template 4: Follow-Up (1-week)**
Final gentle touch

**4. Topic Ideas (10)**
For each topic:
- Episode title (compelling)
- 3-sentence description
- Key takeaways for listeners
- Why it's timely
- Why YOU should discuss this

**5. Pre-Interview Prep**
- How to prepare for any podcast
- Talking points to always include
- Stories to have ready
- Product mention approach (subtle not salesy)
- CTA to offer listeners

**6. Post-Interview Workflow**
- Thank you email to host
- Social promotion plan
- Repurposing content (audiograms, quotes)
- Adding to media kit
- Tracking results

**7. Podcast Appearance Template**
Questions to ask host beforehand:
- Format and length
- Audience size
- Promotion timeline
- How they want you to promote

---`
      },
      {
        id: "linkedin-content-prompt",
        title: "LinkedIn Content Strategy & Posts",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Create a LinkedIn content strategy that builds authority and generates leads:

---

I want to build a presence on LinkedIn to attract customers for my SaaS.

**My Profile:**
- Name: [YOUR NAME]
- Role: [FOUNDER/CEO OF...]
- Product: [YOUR PRODUCT]
- Target audience: [WHO YOU WANT TO REACH]
- Topics I can speak on: [YOUR EXPERTISE]
- Goal: [LEADS, AUTHORITY, HIRING, ETC.]

**Generate a complete LinkedIn strategy:**

**1. Profile Optimization**
- Headline (120 characters, not just title)
- About section (hook, story, value, CTA)
- Featured section recommendations
- Experience section framing
- Skills to highlight

**2. Content Pillars (5)**
For each pillar:
- Topic area
- Why you're qualified
- Content angles
- Sample post ideas (3 each)

**3. Post Templates (20 posts)**

**Educational Posts (5):**
- How-to format
- Lessons learned format
- Myth-busting format
- Framework/process format
- Quick tip format

**Story Posts (5):**
- Founder journey story
- Customer success story
- Failure/lesson story
- Behind-the-scenes story
- Contrarian opinion story

**Engagement Posts (5):**
- Question post
- Poll post
- "Agree/disagree" post
- "Fill in the blank" post
- Hot take post

**Promotional Posts (5):**
- Product launch announcement
- Feature highlight
- Customer testimonial
- Case study summary
- Milestone celebration

**4. Posting Schedule**
- Best days/times for your audience
- Frequency recommendation
- Content mix ratio
- Engagement window strategy

**5. Hook Library (20 hooks)**
First lines that stop the scroll:
- Pattern interrupt hooks
- Curiosity hooks
- Controversy hooks
- Story hooks
- List hooks

**6. CTA Library**
- Follow for more
- Comment your thoughts
- DM for details
- Link in comments
- Save for later

**7. Comment Strategy**
- Whose posts to comment on
- How to add value (not just "Great post!")
- Converting engagement to connections
- DM conversation starters

**8. Analytics to Track**
- Key metrics
- What good looks like
- Optimization approach

---`
      },
      {
        id: "twitter-growth-prompt",
        title: "Twitter/X Growth & Content Strategy",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Build a Twitter presence that drives awareness and customers:

---

I want to grow on Twitter/X to build audience and get customers for my SaaS.

**My Account:**
- Handle: [@YOURHANDLE]
- Product: [YOUR PRODUCT]
- Topics: [WHAT YOU TWEET ABOUT]
- Current followers: [NUMBER]
- Goal: [FOLLOWER TARGET OR LEAD GOAL]

**Generate a complete Twitter strategy:**

**1. Profile Optimization**
- Name (with emoji or not)
- Bio (160 chars, clear value prop)
- Link (landing page or link tree)
- Banner image concept
- Pinned tweet strategy

**2. Tweet Templates (30 tweets)**

**Thread Starters (5):**
Hook + promise of value
- Educational thread format
- Story thread format
- Resource list thread format
- Breakdown/analysis thread format
- Lessons learned thread format

**Single Tweets (15):**
- Hot take tweets (3)
- Quick tip tweets (3)
- Question tweets (3)
- Observation tweets (3)
- Personal/authentic tweets (3)

**Promotional Tweets (5):**
- Product mention (subtle)
- Feature highlight
- Customer result
- Milestone share
- Launch announcement

**Engagement Tweets (5):**
- Quote tweet template
- Reply thread
- Community shoutout
- Collaboration post
- Retweet with context

**3. Thread Templates (5 complete threads)**

For each thread:
- Hook tweet (most important)
- 5-10 body tweets
- Summary tweet
- CTA tweet
Format with proper spacing and emojis

**4. Content Calendar**
- Tweets per day
- Best posting times
- Thread frequency
- Promotional ratio (80/20 rule)
- Engagement windows

**5. Growth Tactics**
- Who to follow and engage with
- Engagement strategy (before posting)
- Quote tweet strategy
- Reply game approach
- Collaboration opportunities

**6. Viral Tweet Analysis**
- What makes tweets go viral in your niche
- Hook patterns that work
- Format patterns that work
- Topics that resonate

**7. Tools & Automation**
- Scheduling tools
- Analytics to track
- Thread formatting
- Engagement automation (ethical)

---`
      },
      {
        id: "partnership-outreach-prompt",
        title: "Strategic Partnership Outreach",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Land strategic partnerships to grow your SaaS:

---

I want to form partnerships with complementary businesses to grow my SaaS.

**My Product:**
- Name: [YOUR PRODUCT]
- What it does: [DESCRIPTION]
- Target customer: [WHO]
- Current size: [USERS/REVENUE]
- What I can offer partners: [VALUE]
- What I'm looking for: [DESIRED PARTNERSHIP TYPE]

**Generate a complete partnership strategy:**

**1. Partner Identification**
Types of partnerships to pursue:
- Integration partners (complementary tools)
- Distribution partners (reach your audience)
- Co-marketing partners (shared campaigns)
- Reseller/agency partners
- Technology partners

For each type:
- 5 specific company suggestions
- Why they're a fit
- Contact strategy

**2. Partner Value Proposition**
What you bring to the table:
- Your audience size/demographics
- Your technology capabilities
- Your brand reputation
- Revenue opportunity for them
- Case studies of past partnerships

**3. Outreach Email Sequences**

**Cold Outreach (to target company)**
Email 1 (Day 0):
Subject: "[Their Product] + [Your Product] = [Benefit for customers]"
- Personalized opening
- Specific partnership idea
- Clear benefit for them
- Soft ask

Email 2 (Day 4):
- Follow up with additional value
- Different angle

Email 3 (Day 9):
- Final touch with case study

**Warm Outreach (via introduction)**
- Email to ask for intro
- Email for when intro is made

**4. Partnership Proposal Template**
One-pager including:
- Executive summary
- Partnership opportunity
- Value for each party
- Proposed structure
- Success metrics
- Next steps

**5. Partnership Call Agenda**
- Intro and rapport (5 min)
- Their business overview (10 min)
- Your business overview (10 min)
- Partnership exploration (15 min)
- Next steps (5 min)

Questions to ask:
- Current partnership strategy
- Success criteria
- Decision process
- Timeline

**6. Integration Partnership Specifics**
- Technical requirements discussion
- Resource commitment
- Launch plan
- Marketing coordination
- Revenue sharing (if applicable)

**7. Co-Marketing Partnership Specifics**
- Joint content ideas
- Cross-promotion plans
- Event collaboration
- Shared audience opportunities

**8. Partnership Agreement Outline**
Key terms to discuss:
- Scope of partnership
- Responsibilities of each party
- Duration and renewal
- Exclusivity (if any)
- Revenue sharing (if applicable)
- Termination conditions

---`
      },
      {
        id: "referral-program-prompt",
        title: "Referral Program Design & Copy",
        difficulty: "easy",
        timeToResults: "Immediate",
        cost: "free",
        content: `Design a referral program that actually gets customers to refer:

---

I want to create a referral program for my SaaS that turns customers into advocates.

**My Product:**
- Name: [YOUR PRODUCT]
- Price: [AMOUNT/MONTH OR ONE-TIME]
- Customer base: [NUMBER OF USERS]
- Average customer value: [LTV]
- Current NPS: [IF KNOWN]

**Generate a complete referral program:**

**1. Program Structure**
Incentive options (recommend one):
- Give X, Get X (both parties benefit)
- Give discount, Get credit
- Give free month, Get free month
- Tiered rewards (more referrals = better rewards)
- Points system

Recommendation based on your model:
- Specific reward amounts
- Why this structure works for you

**2. Program Naming**
- 5 name ideas for your referral program
- Make it memorable and action-oriented

**3. In-App Referral Page**

Headline: "Give [X], Get [X]"

Sections:
- How it works (3 simple steps)
- What you get
- What they get
- Share options (email, social, link)
- Referral tracking status
- FAQ

**4. Referral Email Template**
Pre-written email your customers can send:
- Subject line options (3)
- Body copy (personal recommendation)
- Product highlights
- Special offer mention
- CTA button

**5. Social Share Copy**
Twitter/X:
- 3 tweet options

LinkedIn:
- 1 post option

Facebook:
- 1 post option

**6. Announcement Email**
To existing customers:
- Subject: "You asked, we delivered: Earn [X] for referrals"
- Excitement about the program
- How it works
- Unique referral link
- First action to take

**7. Referral Nurture Sequence**
Remind customers to refer:
- Week 1: Introduce program
- Week 4: How your friend achieved [result]
- Week 8: "Your link has been viewed X times"
- Week 12: Success story + reminder
- Ongoing: Milestone emails

**8. Thank You Emails**
For referrer (when someone signs up):
- Celebrate their referral
- Reward confirmation
- Encourage another referral

For referred user:
- Welcome + acknowledge referrer
- Special onboarding

**9. Success Metrics**
- Participation rate target
- Referrals per customer target
- Conversion rate target
- Program ROI calculation

---`
      },
      {
        id: "press-release-prompt",
        title: "Press Release & Media Pitch Generator",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Write press releases and media pitches that get coverage:

---

I want to get press coverage for my SaaS to build credibility and awareness.

**My News:**
- Company: [YOUR COMPANY]
- Announcement: [WHAT'S THE NEWS - launch, funding, milestone, feature, partnership]
- Why it matters: [SIGNIFICANCE]
- Target publications: [TECH, INDUSTRY-SPECIFIC, LOCAL]

**Generate a complete press kit:**

**1. Press Release (AP Style)**

FOR IMMEDIATE RELEASE

**Headline:** [Newsworthy, includes company name, key detail]

**Subhead:** [Expands on headline]

**[CITY, STATE] - [Date]** - [Opening paragraph: Who, What, When, Where, Why in 2-3 sentences]

[Second paragraph: Quote from founder/CEO - why this matters]

[Third paragraph: More details about the announcement]

[Fourth paragraph: Context/background on the company]

[Fifth paragraph: Second quote - from customer, partner, or advisor]

[Boilerplate: About [Company Name] - 50 words about your company]

**Media Contact:**
[Name]
[Email]
[Phone]

###

**2. Journalist Pitch Email**

**Template 1: Cold Pitch**
Subject: [Specific, not clickbait, newsworthy]

Body:
- One sentence hook (why they should care)
- What the news is (brief)
- Why their readers care
- Offer (exclusive, interview, early access)
- Attachments mention

**Template 2: Follow-up**
Shorter, different angle, add value

**3. Media List Building**
- How to find relevant journalists
- Tools to use
- Information to track
- Personalization approach

**4. Exclusive vs. Embargo Strategy**
- When to offer exclusives
- How to pitch embargoes
- Managing multiple outlets

**5. Press Page Content**
What to include:
- Recent news
- Press releases archive
- Media kit download
- Logos and assets
- Executive bios and photos
- Company facts/stats
- Media contact

**6. Interview Prep**
- Key messages (3 points)
- Soundbites to deliver
- Questions to expect
- Bridging techniques
- What not to say

**7. Social Amplification**
When press hits:
- How to share coverage
- Thanking journalists publicly
- Repurposing coverage

---`
      },
      {
        id: "retention-email-prompt",
        title: "Retention & Churn Prevention Email Sequences",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Create emails that keep customers from churning:

---

I want to reduce churn by re-engaging users before they cancel.

**My Product:**
- Name: [YOUR PRODUCT]
- Key activation metric: [WHAT ENGAGED USERS DO]
- Average time to churn: [WHEN USERS TYPICALLY LEAVE]
- Top churn reasons: [WHY THEY LEAVE]
- What success looks like: [ENGAGED USER BEHAVIOR]

**Generate retention email sequences:**

**1. At-Risk User Detection**
Signals that indicate churn risk:
- Decreased login frequency
- Key features not used
- Support tickets increase
- Payment issues
- No activity in X days
- Downgrade request

**2. Re-Engagement Sequence (No Activity)**

Email 1 (Day 3 of no activity):
Subject: "We noticed you've been away..."
- Friendly check-in
- Quick win they can achieve
- Easy one-click action

Email 2 (Day 7):
Subject: "[Feature] just got better"
- New feature or improvement
- Why it matters to them
- CTA to try it

Email 3 (Day 14):
Subject: "Need help with [Product]?"
- Offer personal assistance
- Link to resources
- Reply to get help

Email 4 (Day 21):
Subject: "Your [Product] account"
- More direct about risk
- What they're missing
- Last attempt before pause

**3. Feature Adoption Sequence**
For users not using key features:

Email 1: "[Feature] can save you [time/money]"
- Quick tutorial
- Use case examples
- Try it now CTA

Email 2: "How [Customer] uses [Feature]"
- Case study
- Specific results
- Replicate their success

**4. Win-Back Sequence (After Cancel)**

Email 1 (Immediately):
Subject: "We're sorry to see you go"
- Ask for feedback (why they left)
- Offer to help with specific issue
- Leave door open

Email 2 (Day 7):
Subject: "We listened - here's what changed"
- If you fixed their issue, tell them
- Otherwise, share improvements
- Special offer to return

Email 3 (Day 30):
Subject: "[Result customers achieved] this month"
- Success stories
- What they're missing
- Limited-time return offer

Email 4 (Day 90):
Subject: "Still building [their goal]?"
- Personal touch
- Major updates since they left
- Generous return offer

**5. Cancellation Flow Emails**

When they click cancel:
- Save attempt email (special offer)
- Exit survey request
- Pause option instead of cancel
- Downgrade option

**6. Success Milestone Emails**
Celebrate when users achieve things:
- First [key action]
- [X] days streak
- [X] projects completed
- Usage milestones

Makes them feel successful, reduces churn.

**7. Payment Failed Sequence**

Email 1 (Immediately):
Subject: "Your payment didn't go through"
- Simple, not scary
- Update payment link
- Deadline before service pause

Email 2 (Day 3):
- Reminder, more urgent
- Alternative payment options

Email 3 (Day 7):
- Final notice
- What happens next
- Easy resolution

---`
      },
      {
        id: "community-building-prompt",
        title: "Community Building Playbook",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Build a community around your SaaS that drives retention and growth:

---

I want to build a community for my SaaS users.

**My Product:**
- Name: [YOUR PRODUCT]
- User base: [SIZE]
- User type: [WHO THEY ARE]
- What users have in common: [SHARED INTEREST/GOAL]
- Resources I can commit: [TIME/BUDGET]

**Generate a complete community strategy:**

**1. Community Purpose**
- Why the community exists (not "to promote our product")
- Value for members
- Transformation promise
- Community vision statement

**2. Platform Selection**
Evaluate options:
- Slack: [pros/cons]
- Discord: [pros/cons]
- Circle: [pros/cons]
- Facebook Groups: [pros/cons]
- Native forum: [pros/cons]

Recommendation based on your audience.

**3. Community Structure**
Channels/sections to create:
- Welcome/introductions
- General discussion
- [Topic-specific channels]
- Ask for help
- Share wins
- Resources/library
- Off-topic
- Announcements only (from you)

**4. Launch Content**
Welcome message for new members:
- Community purpose
- House rules
- How to introduce yourself
- First action to take
- Where to get help

Pinned post:
- Community guidelines
- FAQ
- Resources list

**5. Content Calendar (30 days)**
Daily/weekly content themes:
- Monday: Weekly wins share
- Tuesday: Tip of the day
- Wednesday: Q&A thread
- Thursday: Resource share
- Friday: Weekend chat

Engagement prompts (15 ideas):
- [Specific to your community]

**6. Member Onboarding Sequence**
When someone joins:
- Immediate: Welcome DM
- Day 1: Introduction prompt
- Day 3: Helpful resource share
- Day 7: Check-in

**7. Engagement Tactics**
- How to spark discussions
- Recognizing active members
- User-generated content prompts
- AMAs and events
- Challenges and competitions

**8. Moderation Guidelines**
- Community rules
- Violation responses
- Escalation process
- Spam handling
- Conflict resolution

**9. Growth Strategy**
- How to invite users to join
- Referral program for community
- Cross-promotion opportunities
- Content that attracts members

**10. Metrics to Track**
- Member count
- Active members (DAU/MAU)
- Engagement rate
- Response time
- Sentiment
- Impact on retention

---`
      },
      {
        id: "seo-content-prompt",
        title: "SEO Blog Post Generator",
        difficulty: "medium",
        timeToResults: "Immediate",
        cost: "free",
        content: `Generate SEO-optimized blog content that ranks and converts:

---

I need to create blog content that ranks in Google and brings potential customers to my SaaS.

**My SaaS:**
- Product: [NAME]
- What it does: [DESCRIPTION]
- Target audience: [WHO]
- Target keyword: [PRIMARY KEYWORD]
- Search intent: [WHAT THEY'RE TRYING TO DO]

**Generate this SEO content:**

**1. Blog Post Outline**
Title: [Include primary keyword, compelling]
- H1: [Primary keyword + benefit]
- Meta description: [150-160 chars, includes keyword, compels click]
- URL slug: [short, keyword-included]

**Introduction (150 words)**
- Hook: Start with a problem or surprising fact
- Context: Why this matters
- Promise: What they'll learn
- Include primary keyword naturally

**H2 Sections (the meat)**
For each main section:
- H2: Include related keyword
- 200-400 words of content
- Include examples, data, quotes
- Internal link opportunity

Suggested H2s:
1. [What is X] - definitional
2. [Why X matters] - importance
3. [How to X] - tactical steps
4. [Common mistakes with X] - avoid pitfalls
5. [X vs Y] - comparisons
6. [Tools for X] - mention your product naturally

**Product Mention Section**
- Natural integration (not forced)
- How your product helps with this topic
- CTA to try/learn more

**Conclusion**
- Summarize key points
- Clear next step
- CTA

**2. LSI Keywords to Include**
- [List of related terms to naturally include]

**3. Internal Linking Suggestions**
- Links to other relevant content
- Links to product pages

**4. External Linking Suggestions**
- Authoritative sources to cite
- Data/statistics sources

**5. Featured Snippet Optimization**
- Question to answer for position 0
- Formatted answer (paragraph, list, or table)

**6. FAQ Schema**
- 5 questions and answers to add as FAQ
- Related to the topic

**7. CTA Options**
- End of post CTA
- In-content CTA
- Sidebar CTA copy

---`
      }
    ]
  }
];

// Component for individual strategy display
function StrategyCard({ strategy, isLocked, onCopy }: { strategy: Strategy; isLocked: boolean; onCopy: (text: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(strategy.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "advanced": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getCostColor = (cost?: string) => {
    switch (cost) {
      case "free": return "bg-green-100 text-green-700";
      case "low": return "bg-blue-100 text-blue-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "high": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className={cn(
      "border rounded-lg transition-all",
      isLocked ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
    )}>
      <button
        onClick={() => !isLocked && setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
        disabled={isLocked}
      >
        <div className="flex items-center gap-3">
          {isLocked ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          )}
          <span className={cn(
            "font-medium",
            isLocked ? "text-slate-400" : "text-slate-900"
          )}>
            {strategy.title}
          </span>
        </div>
        {!isLocked && (
          <div className="flex items-center gap-2">
            {strategy.difficulty && (
              <span className={cn("text-xs px-2 py-0.5 rounded capitalize", getDifficultyColor(strategy.difficulty))}>
                {strategy.difficulty}
              </span>
            )}
            {strategy.cost && (
              <span className={cn("text-xs px-2 py-0.5 rounded capitalize", getCostColor(strategy.cost))}>
                {strategy.cost === "free" ? "Free" : `${strategy.cost} cost`}
              </span>
            )}
          </div>
        )}
      </button>

      {expanded && !isLocked && (
        <div className="px-4 pb-4 border-t border-slate-100">
          {strategy.timeToResults && (
            <p className="text-sm text-slate-500 mt-3 mb-3">
              Time to results: {strategy.timeToResults}
            </p>
          )}
          <div className="mt-4 relative">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
              {strategy.content}
            </div>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Category section component
function CategorySection({ category, isLocked, onCopy }: { category: StrategyCategory; isLocked: boolean; onCopy: (text: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;

  return (
    <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isLocked ? "bg-slate-100" : "bg-amber-100"
          )}>
            <Icon className={cn("w-5 h-5", isLocked ? "text-slate-400" : "text-amber-600")} />
          </div>
          <div className="text-left">
            <h3 className={cn("font-bold", isLocked ? "text-slate-500" : "text-slate-900")}>
              {category.name}
            </h3>
            <p className="text-sm text-slate-500">
              {category.strategies.length} strategies
              {isLocked && " - Unlock to access"}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {category.strategies.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isLocked={isLocked}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LaunchPack() {
  const { user, isAuthenticated } = useAuth();
  const { testMode } = useTestMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Allow access if authenticated OR in test mode
  const canView = isAuthenticated || testMode;

  // Check if user has purchased the launch pack OR in test mode
  const hasAccess = (user as any)?.launchPackPurchased === true || testMode;

  // If not authenticated and not in test mode, show login prompt
  if (!canView) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h1>
          <p className="text-slate-600 mb-6">
            Please log in to access the Launch Pack.
          </p>
          <a href="/api/login">
            <Button className="w-full">Log In</Button>
          </a>
        </Card>
      </div>
    );
  }

  // Total strategies count
  const totalStrategies = STRATEGY_CATEGORIES.reduce((acc, cat) => acc + cat.strategies.length, 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handlePurchase = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/launch-pack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar currentDay={0} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Rocket className="w-4 h-4" />
              {totalStrategies}+ Proven Strategies
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              The Launch & Marketing Playbook
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {hasAccess
                ? "Your complete library of launch, sales, and marketing strategies to get customers after you build."
                : "The 21 Day Challenge gets you to a working product. This playbook shows you exactly how to launch it and get paying customers."}
            </p>
          </div>

          {/* Info callout */}
          <Card className="p-4 mb-8 border-2 border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Why This Exists</p>
                <p className="text-sm text-blue-700 mt-1">
                  The 21 Day Challenge focuses on idea, planning, and building your product.
                  But a great product without customers is worthless. This pack covers what comes next:
                  launch strategies, marketing channels, sales tactics, and growth systems.
                </p>
              </div>
            </div>
          </Card>

          {/* Unlock CTA (if locked) */}
          {!hasAccess && (
            <Card className="relative p-6 mb-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-transparent">
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                LIMITED TIME
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Unlock All {totalStrategies} Strategies</h3>
                    <p className="text-slate-600">
                      <span className="text-slate-400 line-through">$291</span>
                      <span className="ml-2 font-bold text-amber-600">$97</span>
                      <span className="text-slate-500 ml-1 text-sm">(Limited time only)</span>
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={isCheckingOut}
                  size="lg"
                  className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      Unlock for $97
                      <Rocket className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Categories */}
          <div className="space-y-4">
            {STRATEGY_CATEGORIES.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                isLocked={!hasAccess}
                onCopy={handleCopy}
              />
            ))}
          </div>

          {/* Bottom CTA (if locked) */}
          {!hasAccess && (
            <div className="mt-12 text-center">
              <p className="text-slate-600 mb-4">
                Building is only half the battle. Get the playbook for what comes next.
              </p>
              <p className="text-lg mb-4">
                <span className="text-slate-400 line-through">$291</span>
                <span className="ml-2 font-bold text-amber-600 text-2xl">$97</span>
                <span className="text-slate-500 ml-2 text-sm">(Limited time only)</span>
              </p>
              <Button
                onClick={handlePurchase}
                disabled={isCheckingOut}
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {isCheckingOut ? "Processing..." : `Unlock All ${totalStrategies} Strategies`}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Copied toast */}
      {copiedToast && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-4 h-4 text-green-400" />
          Strategy copied to clipboard
        </div>
      )}
    </div>
  );
}
