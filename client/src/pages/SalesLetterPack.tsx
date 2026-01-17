import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTestMode } from "@/contexts/TestModeContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import {
  Lock,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Target,
  Zap,
  PenTool,
  Menu,
  MessageSquare,
  Shield,
  Users,
  DollarSign
} from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  tags?: string[];
}

interface PromptCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  prompts: Prompt[];
}

// HYPER-FOCUSED: Only prompts for creating a SaaS sales letter/page
const SALES_LETTER_CATEGORIES: PromptCategory[] = [
  {
    id: "complete-sales-page",
    name: "Complete Sales Page",
    icon: FileText,
    description: "Generate your entire SaaS sales page",
    prompts: [
      {
        id: "full-saas-sales-page",
        title: "Complete SaaS Sales Page Generator",
        description: "Generate your entire sales page from scratch",
        prompt: `Write a complete sales page for my SaaS product. Take someone from curious to customer.

**MY SAAS PRODUCT:**
- Name: [PRODUCT NAME]
- What it does (one sentence): [DESCRIPTION]
- Price: [AMOUNT/MONTH or ONE-TIME]
- Target customer: [WHO BUYS THIS - be specific about their role/situation]
- The transformation: [BEFORE STATE] → [AFTER STATE]
- Key features (top 3): [LIST THEM]
- Main objection: [WHY PEOPLE HESITATE]

**WRITE THE COMPLETE SALES PAGE:**

**1. HERO SECTION**
- Pre-headline: "For [specific person]..."
- Main headline: 10-15 words, focus on the END RESULT
- Subheadline: Expand with credibility or specificity
- Social proof snippet (e.g., "Trusted by 500+ teams")
- Primary CTA button text
- Optional: Screenshot/demo placeholder note

**2. PROBLEM SECTION**
- "If you're like most [target customers]..."
- 3-5 specific pain points they experience daily
- The REAL cost of these problems (time, money, stress)
- Validate their frustration - it's not their fault

**3. SOLUTION INTRODUCTION**
- "What if..." or "Imagine..." transition
- Introduce your SaaS as the answer
- Simple 3-step process: How it works
- Quick value statement

**4. FEATURES & BENEFITS**
For each key feature:
- Feature name
- What it does (1 sentence)
- "Which means..." [benefit]
- "So you can..." [outcome]
Format as a scannable section with icons or visuals notes.

**5. SOCIAL PROOF SECTION**
- 3 customer testimonials with:
  - Quote
  - Specific result/metric
  - Name, title, company
  - Photo placeholder note
- Logos section placeholder ("Trusted by teams at...")

**6. PRICING SECTION**
- Pricing table/card
- What's included at each tier
- Most popular plan highlighted
- CTA for each tier
- "Cancel anytime" or flexibility note

**7. FAQ SECTION**
Write 6-8 FAQs covering:
- "How does it work?"
- "Is my data secure?"
- "Can I cancel anytime?"
- "What if it doesn't work for my situation?"
- "How is this different from [competitor/alternative]?"
- Integration/technical questions
- Pricing/refund questions

**8. GUARANTEE SECTION**
- Bold guarantee headline
- What happens if they're not satisfied
- Timeframe (14-day, 30-day, etc.)
- Remove all perceived risk

**9. FINAL CTA SECTION**
- Summary of the transformation
- Urgency element (if real)
- Primary CTA button
- Secondary link ("or schedule a demo")

**10. FOOTER ELEMENTS**
- Contact email
- Links: Privacy Policy, Terms of Service
- Trust badges (SSL, payment security)

**STYLE:**
- Conversational, not corporate
- "You" focused throughout
- Short paragraphs (2-3 sentences max)
- Bold key phrases
- Scannable with bullets and headers`,
        tags: ["complete", "generator"]
      },
      {
        id: "saas-homepage-variant",
        title: "SaaS Homepage/Sales Page Hybrid",
        description: "For when your homepage IS your sales page",
        prompt: `Write a SaaS homepage that doubles as a sales page. Many SaaS products use their homepage to convert - this needs to work for both first-time visitors AND ready-to-buy customers.

**MY SAAS:**
- Name: [PRODUCT NAME]
- One-liner: [WHAT IT DOES IN ONE SENTENCE]
- Target user: [WHO]
- Pricing model: [FREE TRIAL / FREEMIUM / PAID ONLY]
- Main differentiator: [WHAT MAKES YOU DIFFERENT]

**WRITE THESE SECTIONS:**

**HERO (Above the fold)**
- Headline: Clear value proposition (what you do + for whom)
- Subheadline: How you do it differently
- Primary CTA: "Start Free Trial" / "Get Started Free"
- Secondary CTA: "Watch Demo" / "See How It Works"
- Visual: Screenshot or animation placeholder
- Trust line: "No credit card required" or "Trusted by X teams"

**SOCIAL PROOF BAR**
- Logos of notable customers
- Or: "Join 1,000+ [type of customer]"

**PROBLEM/SOLUTION** (Keep it tight)
- 2-3 sentences on the pain
- 2-3 sentences on how you solve it
- Visual showing before/after or the product in action

**FEATURES GRID**
3-6 key features, each with:
- Icon placeholder
- Feature name (3-5 words)
- One sentence description
- Benefit (why it matters)

**HOW IT WORKS**
3 simple steps:
1. [Action] - [Result]
2. [Action] - [Result]
3. [Action] - [Result]
With CTA: "Get started in minutes"

**TESTIMONIALS**
2-3 short, punchy testimonials with:
- Quote (2-3 sentences max)
- Name, role, company
- Specific metric if available

**PRICING PREVIEW** (Optional - or link to pricing page)
- Show tiers at a glance
- "Starting at $X/month"
- CTA to pricing page

**FINAL CTA**
- Headline: Restate the core value
- CTA button
- Risk reversal: "Free trial, no credit card, cancel anytime"

Keep everything scannable. Someone should understand what you do in 5 seconds.`,
        tags: ["homepage", "hybrid"]
      }
    ]
  },
  {
    id: "headlines-hooks",
    name: "Headlines & Hooks",
    icon: Target,
    description: "The first thing they read - make it count",
    prompts: [
      {
        id: "saas-headlines",
        title: "50 SaaS Headline Templates",
        description: "Proven headline formulas for SaaS products",
        prompt: `Generate 50 headline templates specifically for SaaS sales pages. These should be fill-in-the-blank formulas I can adapt.

**MY SAAS:**
- Product: [NAME]
- What it does: [ONE SENTENCE]
- For whom: [TARGET USER]
- Key result: [MAIN OUTCOME]

**GENERATE HEADLINES IN THESE CATEGORIES:**

**OUTCOME-FOCUSED (10)**
Lead with the end result:
- "[Outcome] in [Timeframe]"
- "Finally, [outcome] without [pain]"
- "Get [result] — automatically"

**PROBLEM-AWARE (10)**
Lead with their pain:
- "Stop [painful thing]. Start [good thing]."
- "Tired of [problem]?"
- "[Problem] is costing you [cost]. Fix it."

**SIMPLICITY (10)**
Emphasize ease:
- "The simple way to [outcome]"
- "[Outcome] made easy"
- "[Complex task] in [short time]"

**SPEED (5)**
Emphasize time savings:
- "[Task] in minutes, not [longer time]"
- "From [start] to [end] in [time]"

**SOCIAL PROOF (5)**
Lead with credibility:
- "The [tool] [X number] teams trust for [outcome]"
- "Why [number] [users] switched to [product]"

**COMPARISON (5)**
Position against alternatives:
- "[Outcome] without [competitor's pain point]"
- "Like [known thing], but [better]"

**QUESTION (5)**
Provoke thought:
- "What if [dream scenario]?"
- "Ready to [desired action]?"

For each headline:
1. The template with [BRACKETS]
2. Example using my product
3. When to use it (cold traffic, retargeting, etc.)`,
        tags: ["headlines", "templates"]
      },
      {
        id: "opening-paragraphs",
        title: "Opening Paragraph Templates",
        description: "First paragraph that keeps them reading",
        prompt: `Write 10 different opening paragraphs for my SaaS sales page. The first paragraph decides if they keep reading.

**MY SAAS:**
- Product: [NAME]
- Target user: [WHO]
- Their main frustration: [PAIN POINT]
- What they really want: [DESIRED OUTCOME]

**WRITE 10 OPENINGS:**

**1. THE EMPATHY OPENER**
Start by showing you understand their situation.
"If you're like most [target users], you're probably..."

**2. THE QUESTION OPENER**
Start with a question they'll answer "yes" to.
"Have you ever...?"

**3. THE STATISTIC OPENER**
Start with a surprising number.
"[X%] of [target users] waste [Y hours] on [task] every week..."

**4. THE STORY OPENER**
Start mid-story that mirrors their situation.
"Last Tuesday, [person] was staring at..."

**5. THE BOLD CLAIM OPENER**
Start with a statement that raises eyebrows.
"There's a better way to [task] — and it takes [short time]."

**6. THE COMMON ENEMY OPENER**
Unite against a shared frustration.
"[Frustrating thing] shouldn't be this hard."

**7. THE FUTURE VISION OPENER**
Start with where they want to be.
"Imagine [desired situation]..."

**8. THE MISTAKE OPENER**
Point out what's not working.
"Most [target users] approach [task] completely wrong..."

**9. THE CONTRAST OPENER**
Show the gap between now and possible.
"You could keep [current painful way]. Or..."

**10. THE DIRECT OPENER**
Get straight to the point.
"[Product] helps [target users] [do thing] [faster/better/easier]."

For each opening:
- Complete paragraph (50-100 words)
- Why it works
- How to transition to the next section`,
        tags: ["openings", "hooks"]
      }
    ]
  },
  {
    id: "features-benefits",
    name: "Features & Benefits",
    icon: Zap,
    description: "Turn features into reasons to buy",
    prompts: [
      {
        id: "feature-benefit-converter",
        title: "Feature → Benefit Converter",
        description: "Transform boring features into compelling benefits",
        prompt: `Convert my SaaS features into compelling benefits for the sales page.

**MY FEATURES:**
1. [FEATURE 1]
2. [FEATURE 2]
3. [FEATURE 3]
4. [FEATURE 4]
5. [FEATURE 5]
(Add more as needed)

**MY TARGET USER:** [WHO THEY ARE]
**WHAT THEY CARE ABOUT:** [THEIR PRIORITIES - e.g., saving time, looking good to boss, reducing stress]

**FOR EACH FEATURE, WRITE:**

**1. THE BENEFIT STACK**
- Feature: [What it is]
- "Which means...": [The immediate result]
- "So you can...": [What they can now do]
- "Which ultimately...": [The real-life impact]

**2. THE ONE-LINER**
Combine feature + benefit in one punchy line for the sales page.
Example: "Automated reports that save you 5 hours every week"

**3. THE EXPANDED VERSION**
A short paragraph (2-3 sentences) for feature sections.
Example: "Generate reports automatically while you focus on what matters. Set it once, and get weekly insights delivered to your inbox. No more late nights pulling data."

**4. THE BULLET VERSION**
A scannable bullet point for feature lists.
Example: "✓ Automated reporting — save 5+ hours/week"

**5. COMPARISON TO ALTERNATIVE**
How is this better than how they do it now?
Example: "Instead of manually exporting CSVs, get real-time dashboards"

Output all features in a format I can copy directly to my sales page.`,
        tags: ["features", "benefits"]
      },
      {
        id: "how-it-works",
        title: "How It Works Section Generator",
        description: "Explain your SaaS in 3 simple steps",
        prompt: `Write the "How It Works" section for my SaaS sales page. This needs to make a potentially complex product feel simple.

**MY SAAS:**
- Product: [NAME]
- What it does: [DESCRIPTION]
- The actual process: [DESCRIBE THE USER JOURNEY FROM SIGNUP TO VALUE]

**GENERATE:**

**OPTION 1: 3-STEP VERSION**
Step 1: [ACTION VERB] — [OUTCOME]
Step 2: [ACTION VERB] — [OUTCOME]
Step 3: [ACTION VERB] — [OUTCOME]

Each step needs:
- A clear action word (Connect, Set up, Launch, etc.)
- What happens in plain English
- Visual placeholder description

**OPTION 2: BEFORE/AFTER VERSION**
Before [Product]:
- [Old painful way 1]
- [Old painful way 2]
- [Old painful way 3]

After [Product]:
- [New easy way 1]
- [New easy way 2]
- [New easy way 3]

**OPTION 3: TIMELINE VERSION**
- Day 1: [What they do and get]
- Week 1: [Results they see]
- Month 1: [Transformation achieved]

**SECTION HEADLINE OPTIONS (5)**
- "How It Works"
- "Get Started in 3 Simple Steps"
- "From [Start] to [Result] in Minutes"
- "[Outcome] Made Simple"
- "Here's How [Product] Works"

**CTA TO FOLLOW:**
Button text + supporting text that follows this section.`,
        tags: ["how-it-works", "process"]
      },
      {
        id: "feature-sections",
        title: "Feature Section Copy",
        description: "Full copy for each feature section",
        prompt: `Write the complete feature sections for my SaaS sales page. Each feature gets its own mini-section.

**MY TOP 5 FEATURES:**
1. [FEATURE 1]: [Brief description]
2. [FEATURE 2]: [Brief description]
3. [FEATURE 3]: [Brief description]
4. [FEATURE 4]: [Brief description]
5. [FEATURE 5]: [Brief description]

**TARGET USER:** [WHO]
**THEIR PRIORITIES:** [What they care about most]

**FOR EACH FEATURE, WRITE:**

**SECTION HEADLINE**
Feature-focused but benefit-driven.
Example: "Automated Reports That Write Themselves"

**BODY COPY (3-4 sentences)**
- What the feature does
- Why it matters to them
- The result they get
- Optional: How it's different from alternatives

**SUPPORTING BULLETS (3-4)**
Specific sub-features or capabilities within this feature.

**VISUAL NOTE**
What screenshot, gif, or graphic should accompany this.

**CTA (optional)**
If this feature deserves its own call-to-action.

Format the output so I can copy each section directly to my page builder.`,
        tags: ["features", "sections"]
      }
    ]
  },
  {
    id: "social-proof",
    name: "Social Proof & Testimonials",
    icon: Users,
    description: "Let your customers sell for you",
    prompts: [
      {
        id: "testimonial-templates",
        title: "Testimonial Request Templates",
        description: "Questions that get powerful testimonials",
        prompt: `Generate testimonial request templates that will get me powerful testimonials for my SaaS sales page.

**MY SAAS:** [NAME]
**WHAT IT DOES:** [DESCRIPTION]
**TYPICAL RESULTS:** [WHAT CUSTOMERS ACHIEVE]

**CREATE:**

**1. EMAIL REQUEST TEMPLATE**
Write an email I can send to happy customers asking for a testimonial.
Include:
- Subject line options
- Why I'm asking
- Specific questions to answer
- How long it should take
- Permission request for use

**2. INTERVIEW QUESTIONS (10)**
If I were to interview a customer, what questions would draw out the best answers?
Focus on:
- Their situation BEFORE using us
- The problem they were facing
- Why they chose us
- What results they got (specific numbers)
- What they'd tell someone considering us

**3. WRITTEN TESTIMONIAL PROMPTS**
If they prefer to write it themselves, give them prompts:
- "Before [product], I was struggling with..."
- "I chose [product] because..."
- "The biggest result I've seen is..."
- "I'd recommend [product] to anyone who..."

**4. VIDEO TESTIMONIAL QUESTIONS**
For video testimonials, provide 5 questions that work on camera.

**5. TESTIMONIAL FORMATS FOR THE SALES PAGE**
Show me how to format testimonials:
- Short quote (1-2 lines) with name
- Medium testimonial (3-4 sentences) with name, title, company
- Full case study format (problem, solution, results)

**6. WHAT MAKES A TESTIMONIAL POWERFUL**
Criteria to look for:
- Specific numbers or metrics
- Before/after transformation
- Emotional component
- Credibility of the person
- Relevance to target customer`,
        tags: ["testimonials", "social-proof"]
      },
      {
        id: "social-proof-sections",
        title: "Social Proof Section Copy",
        description: "All the social proof sections you need",
        prompt: `Write all the social proof sections for my SaaS sales page.

**MY SAAS:** [NAME]
**CUSTOMERS:** [WHO USES IT]
**NOTABLE CUSTOMERS:** [ANY RECOGNIZABLE NAMES/COMPANIES]
**KEY METRICS:** [USERS, CUSTOMERS, DATA POINTS]
**BEST RESULTS:** [WHAT CUSTOMERS HAVE ACHIEVED]

**WRITE THESE SECTIONS:**

**1. TRUST BAR (Below Hero)**
Short line that builds immediate credibility.
Options:
- "Trusted by [X] teams worldwide"
- "Join [X]+ [type of users]"
- "[X] [things done] and counting"
- "Rated [X/5] by [X] users"

**2. LOGO SECTION**
- Headline: "Trusted by teams at..."
- Note on which logos to include
- Fallback if no big names: "Trusted by startups and growing teams"

**3. TESTIMONIAL SECTION**
Layout for 3 testimonials:
- Headline for section: "What Our Customers Say" (or better)
- Format for each testimonial
- Placement recommendations

**4. METRICS/STATS SECTION**
If I have numbers to share:
- [X] customers
- [X] tasks completed
- [X]% time saved
- [X]+ integrations

**5. CASE STUDY TEASER**
If I have a full case study:
- Headline: "[Company] achieved [result] with [product]"
- 2-3 sentence summary
- Link to full case study

**6. TRUST BADGES**
What trust elements to include:
- Security badges (SOC 2, GDPR, etc.)
- Review site ratings (G2, Capterra)
- Payment security
- Uptime guarantees

Format everything ready to paste into my sales page.`,
        tags: ["social-proof", "trust"]
      }
    ]
  },
  {
    id: "pricing-offers",
    name: "Pricing & Offers",
    icon: DollarSign,
    description: "Present your pricing to maximize conversions",
    prompts: [
      {
        id: "pricing-section",
        title: "Pricing Section Copy",
        description: "Write your pricing section for maximum conversions",
        prompt: `Write the pricing section for my SaaS sales page.

**MY PRICING:**
- Plan 1: [NAME] - $[X]/month - [WHAT'S INCLUDED]
- Plan 2: [NAME] - $[X]/month - [WHAT'S INCLUDED]
- Plan 3: [NAME] - $[X]/month - [WHAT'S INCLUDED]
(Or describe your pricing model)

**BILLING OPTIONS:** [MONTHLY / ANNUAL / BOTH]
**FREE TRIAL:** [YES/NO - HOW LONG]
**REFUND POLICY:** [GUARANTEE]

**WRITE:**

**1. SECTION HEADLINE OPTIONS (5)**
- "Simple, Transparent Pricing"
- "Choose Your Plan"
- "Start Free, Upgrade When Ready"
- "Pricing That Scales With You"
- [Custom based on my positioning]

**2. PRICING TABLE COPY**
For each plan:
- Plan name
- Price (monthly + annual if applicable)
- Best for: [who this plan is for]
- Feature list (what's included)
- CTA button text
- "Most Popular" badge placement

**3. ANNUAL DISCOUNT MESSAGING**
How to present the annual savings:
- "Save [X]% with annual"
- "2 months free with annual"
- Toggle copy

**4. FREE TRIAL MESSAGING**
If applicable:
- "Start your [X]-day free trial"
- "No credit card required" (if true)
- What they get during trial

**5. MONEY-BACK GUARANTEE**
If applicable:
- Guarantee statement
- How it works
- Why you offer it

**6. FAQ BELOW PRICING**
3-4 pricing-specific questions:
- "Can I change plans later?"
- "What happens after my trial?"
- "Do you offer refunds?"
- "Is there a contract?"

**7. ENTERPRISE/CUSTOM SECTION**
If you offer custom pricing:
- "Need more?" or "Enterprise"
- What's available
- "Contact us" CTA`,
        tags: ["pricing", "conversion"]
      },
      {
        id: "value-justification",
        title: "Price Justification Copy",
        description: "Make your price feel like a no-brainer",
        prompt: `Write copy that justifies my SaaS pricing and makes it feel like an obvious value.

**MY SAAS:**
- Product: [NAME]
- Price: $[X]/month or $[X] one-time
- What they get: [KEY DELIVERABLES]
- Main result: [OUTCOME]
- Who it's for: [TARGET USER]

**WRITE THESE VALUE JUSTIFICATIONS:**

**1. COST COMPARISON**
Compare to:
- Hiring someone to do this manually
- Using alternatives/competitors
- The cost of NOT solving this problem
- What they might already be spending

Example: "Hiring a [role] costs $[X]/hour. [Product] does the same work for $[Y]/month."

**2. TIME SAVINGS**
Calculate the time value:
- Hours saved per week/month
- What that time is worth
- What they could do with that time

Example: "Save [X] hours per week. At $[Y]/hour, that's $[Z] in value every month."

**3. ROI CALCULATION**
If applicable:
- Revenue increase
- Cost reduction
- Efficiency gain
- Break-even point

Example: "Most customers see [X]% improvement in [metric]. That pays for [Product] in [timeframe]."

**4. RISK REVERSAL**
Make the decision feel safe:
- Free trial messaging
- Guarantee messaging
- "Cancel anytime" emphasis
- "What do you have to lose?"

**5. THE ALTERNATIVE**
What's the cost of doing nothing?
- Time wasted
- Opportunities missed
- Stress continued
- Competitors getting ahead

**6. PRICE ANCHORING**
If you can compare to higher-priced alternatives:
- "[Competitor] charges $[X]. We're $[Y]."
- "Get [similar result] for a fraction of the cost."

Write complete copy I can use in my pricing section and throughout the page.`,
        tags: ["pricing", "value"]
      }
    ]
  },
  {
    id: "objections-faq",
    name: "Objections & FAQ",
    icon: MessageSquare,
    description: "Handle every reason not to buy",
    prompts: [
      {
        id: "saas-faq",
        title: "Complete SaaS FAQ Section",
        description: "All the questions your prospects have",
        prompt: `Write a complete FAQ section for my SaaS sales page. Cover every question a prospect might have.

**MY SAAS:**
- Product: [NAME]
- What it does: [DESCRIPTION]
- Price: [AMOUNT]
- Target user: [WHO]
- Biggest objection: [MAIN HESITATION]

**WRITE FAQS IN THESE CATEGORIES:**

**PRODUCT QUESTIONS**
- What is [product]?
- How does it work?
- What makes [product] different from [alternatives]?
- What features are included?
- Do you have a mobile app?

**GETTING STARTED**
- How do I get started?
- Is there a learning curve?
- How long until I see results?
- Do you offer onboarding?
- Can I import my existing data?

**PRICING & BILLING**
- How much does it cost?
- Is there a free trial?
- What happens after my trial ends?
- Can I change plans?
- Do you offer refunds?
- Are there any hidden fees?

**SECURITY & TECHNICAL**
- Is my data secure?
- Where is my data stored?
- Do you offer SSO/enterprise security?
- What's your uptime guarantee?
- Do you integrate with [common tools]?

**SUPPORT**
- What kind of support do you offer?
- How quickly do you respond?
- Is there documentation?

**FOR EACH FAQ:**
- Write the question as customers would ask it
- Write a clear, honest answer (2-4 sentences)
- Include a CTA where appropriate

Format ready for an accordion or FAQ page.`,
        tags: ["faq", "objections"]
      },
      {
        id: "objection-handlers",
        title: "Objection Handling Copy",
        description: "Overcome specific objections on your page",
        prompt: `Write copy that handles common objections to buying my SaaS. This copy will be woven throughout my sales page.

**MY SAAS:** [NAME]
**PRICE:** [AMOUNT]
**TARGET USER:** [WHO]

**HANDLE THESE OBJECTIONS:**

**"IT'S TOO EXPENSIVE"**
Write copy that:
- Reframes price as investment
- Shows ROI
- Compares to alternatives
- Reminds about trial/guarantee

**"I DON'T HAVE TIME TO LEARN SOMETHING NEW"**
Write copy that:
- Emphasizes simplicity
- Mentions onboarding support
- Shows quick time-to-value
- Addresses the learning curve

**"I'VE TRIED TOOLS LIKE THIS BEFORE"**
Write copy that:
- Acknowledges their past experience
- Explains how this is different
- Points to specific differentiators
- Uses social proof from switchers

**"MY SITUATION IS DIFFERENT"**
Write copy that:
- Shows variety of use cases
- Uses diverse testimonials
- Emphasizes flexibility
- Offers personalized demo

**"I NEED TO THINK ABOUT IT / ASK MY TEAM"**
Write copy that:
- Creates appropriate urgency
- Offers resources to share
- Provides team trial options
- Addresses stakeholder concerns

**"WHAT IF IT DOESN'T WORK?"**
Write copy that:
- Emphasizes guarantee
- Shows success stories
- Removes perceived risk
- Offers support

For each objection, provide:
- Headline or callout text
- Body copy (2-3 sentences)
- Where to place it on the page`,
        tags: ["objections", "conversion"]
      }
    ]
  },
  {
    id: "cta-guarantee",
    name: "CTAs & Guarantee",
    icon: Shield,
    description: "Close the sale and remove risk",
    prompts: [
      {
        id: "cta-buttons",
        title: "CTA Button & Section Copy",
        description: "Calls-to-action that convert",
        prompt: `Write CTA (call-to-action) copy for my SaaS sales page. Every CTA should make them want to click.

**MY SAAS:**
- Product: [NAME]
- Main action: [SIGN UP / START TRIAL / GET STARTED]
- Price: [FREE TRIAL / PAID]
- Urgency: [ANY REAL URGENCY?]

**WRITE THESE CTAs:**

**PRIMARY CTA BUTTONS (10 options)**
- Action-oriented: "Start Free Trial"
- Result-oriented: "Get [Result] Now"
- First-person: "Start My Free Trial"
- Urgency: "Get Started Today"
Mix of styles. 6-7 words max.

**BUTTON SUPPORTING TEXT**
Text that goes directly under the button:
- "No credit card required"
- "Free for 14 days"
- "Setup takes 2 minutes"
- "Cancel anytime"

**HERO CTA SECTION**
Complete hero CTA with:
- Primary button text
- Secondary link text (e.g., "or watch demo")
- Supporting text

**MID-PAGE CTA SECTION**
A CTA section to place after features:
- Headline: Reinforce value
- 1-2 sentences
- Button
- Supporting text

**FINAL CTA SECTION**
The last CTA before footer:
- Headline: Create closure
- Summarize the transformation
- Button
- Risk reversal reminder

**STICKY CTA (if using)**
For a sticky header or footer CTA:
- Ultra-short text
- Button text

Format all CTAs ready to copy.`,
        tags: ["cta", "buttons"]
      },
      {
        id: "guarantee-copy",
        title: "Guarantee Section Copy",
        description: "Remove all risk from buying",
        prompt: `Write the guarantee section for my SaaS sales page. The guarantee removes risk and gives confidence to buy.

**MY SAAS:**
- Product: [NAME]
- Price: [AMOUNT]
- Trial period: [X DAYS]
- Refund policy: [WHAT I OFFER]

**WRITE THESE GUARANTEE OPTIONS:**

**1. SIMPLE MONEY-BACK GUARANTEE**
- Headline: "[X]-Day Money-Back Guarantee"
- Body: Clear, simple refund promise
- What they need to do to request it
- No questions asked messaging

**2. FREE TRIAL GUARANTEE**
- Headline: "Try [Product] Free for [X] Days"
- Body: What they get during trial
- What happens after
- No commitment messaging

**3. RESULTS GUARANTEE** (if applicable)
- Headline: "Get [Result] or Your Money Back"
- Body: Specific outcome you guarantee
- Conditions (if any)
- Shows confidence

**4. RISK REVERSAL MESSAGING**
Short copy to use near CTAs:
- "Try it risk-free"
- "Not happy? Get a full refund"
- "Your [result] is guaranteed"
- "Cancel anytime, no questions"

**5. GUARANTEE BADGE/BOX**
Visual guarantee element:
- Badge text
- Icon suggestion
- Placement recommendation

**ALSO PROVIDE:**
- Where to place guarantee on the page
- How prominent to make it
- Guarantee mention in FAQ`,
        tags: ["guarantee", "risk-reversal"]
      },
      {
        id: "ps-closing",
        title: "Closing & P.S. Copy",
        description: "The final push before they decide",
        prompt: `Write closing copy and P.S. sections for my SaaS sales page. For pages with a letter format or long-form structure.

**MY SAAS:**
- Product: [NAME]
- Main benefit: [KEY OUTCOME]
- Price: [AMOUNT]
- Urgency: [ANY REAL DEADLINE/SCARCITY]
- Guarantee: [WHAT YOU OFFER]

**WRITE:**

**1. FINAL SECTION BEFORE FOOTER**
A compelling closing section:
- Headline that creates urgency or resolution
- 2-3 sentences summarizing the transformation
- What they're risking by NOT trying
- Final CTA

**2. P.S. SECTION** (if using letter format)
Write 3 P.S. options:

**P.S. Option 1: Summary**
Restate the core offer and benefit.
"P.S. — When you start your free trial today, you're getting..."

**P.S. Option 2: Guarantee**
Remind them of the risk reversal.
"P.S. — Remember, you're protected by our [X]-day guarantee..."

**P.S. Option 3: Urgency**
If there's a real deadline or scarcity.
"P.S. — This [offer/price] is only available until..."

**3. FOOTER CTA**
A small, final prompt above the footer:
- "Ready to [outcome]? Start your free trial."
- Or simple button

**4. EXIT INTENT COPY** (if using popup)
- Headline: Stop them from leaving
- Body: One last reason to stay/try
- CTA: "Wait — try it free"

Format ready to use.`,
        tags: ["closing", "ps"]
      }
    ]
  },
  {
    id: "legal-trust",
    name: "Legal & Trust Elements",
    icon: Shield,
    description: "Privacy policy, terms, and trust builders",
    prompts: [
      {
        id: "privacy-policy",
        title: "SaaS Privacy Policy Template",
        description: "Privacy policy for your sales page footer",
        prompt: `Generate a privacy policy for my SaaS product. This should be clear, honest, and cover the essentials.

**MY SAAS:**
- Product name: [NAME]
- Company name: [COMPANY]
- Website: [URL]
- Data collected: [WHAT USER DATA YOU COLLECT]
- Third-party services: [STRIPE, ANALYTICS, ETC]
- Contact email: [EMAIL]

**GENERATE A PRIVACY POLICY COVERING:**

**1. INTRODUCTION**
- Who we are
- What this policy covers
- Last updated date

**2. INFORMATION WE COLLECT**
- Account information (name, email, etc.)
- Usage data
- Payment information (handled by Stripe)
- Cookies and tracking

**3. HOW WE USE YOUR INFORMATION**
- To provide the service
- To communicate with you
- To improve the product
- For billing

**4. DATA SHARING**
- Third-party services we use
- We don't sell your data
- Legal requirements

**5. DATA SECURITY**
- How we protect data
- Encryption
- Access controls

**6. YOUR RIGHTS**
- Access your data
- Delete your data
- Export your data
- Opt-out options

**7. COOKIES**
- What cookies we use
- How to manage them

**8. CHANGES TO POLICY**
- How we notify of changes

**9. CONTACT**
- How to reach us with questions

Write in plain English, not legal jargon. This should be readable by normal humans.

**IMPORTANT:** Note that this is a template and should be reviewed by a legal professional for my specific situation.`,
        tags: ["privacy", "legal"]
      },
      {
        id: "terms-of-service",
        title: "SaaS Terms of Service Template",
        description: "Terms of service for your SaaS",
        prompt: `Generate terms of service for my SaaS product.

**MY SAAS:**
- Product name: [NAME]
- Company name: [COMPANY]
- Website: [URL]
- Type of service: [WHAT IT DOES]
- Pricing model: [SUBSCRIPTION/ONE-TIME]
- Contact email: [EMAIL]

**GENERATE TERMS COVERING:**

**1. ACCEPTANCE OF TERMS**
- Agreement by using the service
- Must be 18+ or have permission

**2. DESCRIPTION OF SERVICE**
- What we provide
- What we don't guarantee

**3. ACCOUNT TERMS**
- Account creation
- Account security
- One account per person/company

**4. PAYMENT TERMS**
- Pricing and billing
- Subscription renewals
- Refund policy
- Failed payments

**5. ACCEPTABLE USE**
- What users can do
- What users cannot do
- Prohibited activities

**6. INTELLECTUAL PROPERTY**
- Our ownership of the service
- User ownership of their data
- Feedback and suggestions

**7. TERMINATION**
- How users can cancel
- How we can terminate
- What happens to data

**8. LIMITATION OF LIABILITY**
- Service provided "as is"
- Limitation of damages
- Indemnification

**9. CHANGES TO TERMS**
- How we notify of changes
- Continued use = acceptance

**10. CONTACT**
- How to reach us

Write clearly, not in dense legal language. Include placeholders where specific details are needed.

**IMPORTANT:** Note that this is a template and should be reviewed by a legal professional.`,
        tags: ["terms", "legal"]
      },
      {
        id: "trust-badges",
        title: "Trust Elements & Badges Copy",
        description: "Trust signals for your sales page",
        prompt: `Write copy for trust elements and badges on my SaaS sales page.

**MY SAAS:**
- Product: [NAME]
- Security measures: [WHAT YOU HAVE - SSL, ENCRYPTION, ETC]
- Compliance: [GDPR, SOC 2, HIPAA, ETC - IF ANY]
- Uptime: [YOUR GUARANTEE/HISTORY]
- Support: [WHAT YOU OFFER]
- Reviews: [G2, CAPTERRA, TRUSTPILOT SCORES - IF ANY]

**WRITE COPY FOR:**

**1. SECURITY BADGE SECTION**
- Headline: "Your Data Is Safe With Us" (or similar)
- 3-4 security points with icons:
  - SSL encryption
  - Data protection
  - Secure payments
  - Privacy commitment

**2. COMPLIANCE BADGES** (if applicable)
- What to display
- What each means in plain English
- Where to place them

**3. UPTIME/RELIABILITY**
- "[X]% uptime guarantee"
- Status page mention
- Reliability commitment

**4. PAYMENT SECURITY**
- "Secure checkout powered by Stripe"
- Card logos to display
- Trust messaging

**5. REVIEW BADGES** (if applicable)
- How to display ratings
- Quote from a review
- Link to review profiles

**6. SUPPORT COMMITMENT**
- "Real humans, real fast"
- Response time
- Support channels

**7. FOOTER TRUST LINE**
Single line for the footer:
- "[Product] is trusted by [X]+ teams worldwide. [Security badge] [Payment badge]"

Provide copy ready to use with icon/badge suggestions.`,
        tags: ["trust", "badges"]
      }
    ]
  }
];

// Component for individual prompt display
function PromptCard({ prompt, isLocked, onCopy }: { prompt: Prompt; isLocked: boolean; onCopy: (text: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {isLocked ? (
              <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            ) : expanded ? (
              <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
            )}
            <span className={cn(
              "font-medium",
              isLocked ? "text-slate-400" : "text-slate-900"
            )}>
              {prompt.title}
            </span>
          </div>
          {!isLocked && (
            <p className="text-sm text-slate-500 mt-1 ml-7">{prompt.description}</p>
          )}
        </div>
        {!isLocked && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {prompt.tags?.map(tag => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>

      {expanded && !isLocked && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <div className="mt-4 relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
              {prompt.prompt}
            </pre>
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
function CategorySection({ category, isLocked, onCopy }: { category: PromptCategory; isLocked: boolean; onCopy: (text: string) => void }) {
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
            isLocked ? "bg-slate-100" : "bg-violet-100"
          )}>
            <Icon className={cn("w-5 h-5", isLocked ? "text-slate-400" : "text-violet-600")} />
          </div>
          <div className="text-left">
            <h3 className={cn("font-bold", isLocked ? "text-slate-500" : "text-slate-900")}>
              {category.name}
            </h3>
            <p className="text-sm text-slate-500">
              {category.prompts.length} prompts
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
          {category.prompts.map(prompt => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isLocked={isLocked}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SalesLetterPack() {
  const { user, isAuthenticated } = useAuth();
  const { testMode } = useTestMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Allow access if authenticated OR in test mode
  const canView = isAuthenticated || testMode;

  // Check if user has purchased the sales letter pack OR in test mode
  const hasAccess = (user as any)?.promptPackPurchased === true || testMode;

  // If not authenticated and not in test mode, show login prompt
  if (!canView) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h1>
          <p className="text-slate-600 mb-6">
            Please log in to access the Sales Letter Pack.
          </p>
          <a href="/api/login">
            <Button className="w-full">Log In</Button>
          </a>
        </Card>
      </div>
    );
  }

  // Total prompts count
  const totalPrompts = SALES_LETTER_CATEGORIES.reduce((acc, cat) => acc + cat.prompts.length, 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handlePurchase = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/prompt-pack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: 'usd' }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Copied toast */}
      {copiedToast && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          Copied to clipboard!
        </div>
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
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <PenTool className="w-4 h-4" />
              {totalPrompts} SaaS Sales Page Prompts
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              The SaaS Sales Letter Pack
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {hasAccess
                ? "Everything you need to write a high-converting sales page for your SaaS. Copy, customize, and launch."
                : `Unlock ${totalPrompts} prompts to write every section of your SaaS sales page — from headline to legal pages.`}
            </p>
            {hasAccess && (
              <div className="mt-4 inline-block bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700">
                <strong>Pro tip:</strong> Use these prompts with the latest Claude or Gemini models for best results. They handle nuanced marketing copy better than other AI tools.
              </div>
            )}
          </div>

          {/* Unlock CTA (if locked) */}
          {!hasAccess && (
            <Card className="relative p-6 mb-8 border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-transparent">
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                LIMITED TIME
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Unlock All {totalPrompts} Prompts</h3>
                    <p className="text-slate-600">
                      <span className="text-slate-400 line-through">$147</span>
                      <span className="ml-2 font-bold text-violet-600">$49</span>
                      <span className="text-slate-500 ml-1 text-sm">(Limited time only)</span>
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={isCheckingOut}
                  size="lg"
                  className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg px-8"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      Unlock for $49
                      <PenTool className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Categories */}
          <div className="space-y-4">
            {SALES_LETTER_CATEGORIES.map(category => (
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
                Stop staring at a blank page. Get your SaaS sales page done.
              </p>
              <p className="text-lg mb-4">
                <span className="text-slate-400 line-through">$147</span>
                <span className="ml-2 font-bold text-violet-600 text-2xl">$49</span>
                <span className="text-slate-500 ml-2 text-sm">(Limited time only)</span>
              </p>
              <Button
                onClick={handlePurchase}
                disabled={isCheckingOut}
                size="lg"
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold"
              >
                {isCheckingOut ? "Processing..." : `Unlock All ${totalPrompts} Prompts`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
