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
  Sparkles,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  FileText,
  Palette,
  Database,
  Code,
  Plug,
  Shield,
  Bug,
  TestTube,
  Megaphone,
  DollarSign,
  Rocket,
  HeadphonesIcon,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Prompt data structure
interface Prompt {
  id: string;
  title: string;
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

// The comprehensive prompt library - 150+ battle-tested prompts
const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "ideation",
    name: "Ideation & Validation",
    icon: Lightbulb,
    description: "Generate and validate SaaS ideas",
    prompts: [
      {
        id: "idea-generator",
        title: "SaaS Idea Generator Based on Skills",
        prompt: `I want you to generate 10 unique SaaS product ideas based on my background.

My skills: [YOUR SKILLS]
My interests: [YOUR INTERESTS]
My industry experience: [YOUR EXPERIENCE]
Problems I've personally faced: [PROBLEMS]

For each idea, provide:
1. Product name (catchy, memorable)
2. One-sentence pitch
3. Target customer (be specific)
4. Core problem it solves
5. Why I'm uniquely positioned to build this
6. Estimated technical complexity (1-10)
7. Market size potential (small/medium/large)

Focus on ideas that:
- Can be built by one person with AI assistance
- Have clear monetization from day 1
- Solve a painful, frequent problem
- Don't require massive scale to be profitable`,
        tags: ["ideation", "brainstorming"]
      },
      {
        id: "idea-validator-scorecard",
        title: "Idea Validation Scorecard (Complete Analysis)",
        prompt: `Analyze my SaaS idea using a comprehensive validation framework:

MY IDEA: [DESCRIBE YOUR IDEA IN 2-3 SENTENCES]
TARGET CUSTOMER: [WHO WOULD PAY FOR THIS]
PRICE POINT I'M CONSIDERING: [AMOUNT]

Score each dimension 1-10 and explain your reasoning:

**PROBLEM VALIDATION**
1. Pain Severity: How much does this problem hurt? (1=mild annoyance, 10=hair on fire)
2. Pain Frequency: How often do they experience this? (1=yearly, 10=multiple times daily)
3. Current Solutions: How well are existing solutions working? (1=perfectly solved, 10=terrible options)
4. Willingness to Pay: Would they pay real money to solve this? (1=never, 10=take my money now)
5. Problem Awareness: Do they know they have this problem? (1=oblivious, 10=actively searching)

**MARKET VALIDATION**
6. Market Size: How many people have this problem? (1=tiny niche, 10=massive market)
7. Market Accessibility: Can I reach them affordably? (1=impossible, 10=easy channels exist)
8. Market Timing: Is this the right moment? (1=too early/late, 10=perfect timing)
9. Competition Landscape: What's the competition like? (1=dominated by giants, 10=open field)
10. Switching Costs: How hard to switch from current solution? (1=impossible, 10=effortless)

**FOUNDER-FIT VALIDATION**
11. Domain Expertise: Do I understand this space? (1=clueless, 10=industry veteran)
12. Technical Ability: Can I build this? (1=no way, 10=easy build)
13. Passion Level: Will I stick with this for 5+ years? (1=bored already, 10=obsessed)
14. Unfair Advantage: Do I have unique access/insight? (1=nothing special, 10=massive advantage)
15. Network Effect: Can I leverage my network? (1=no connections, 10=perfect network)

**BUSINESS MODEL VALIDATION**
16. Revenue Clarity: Is monetization obvious? (1=no clue, 10=crystal clear)
17. Unit Economics: Can this be profitable? (1=impossible, 10=great margins)
18. Scalability: Can this scale without proportional effort? (1=pure services, 10=pure software)
19. Defensibility: Can this be moated over time? (1=easily copied, 10=highly defensible)
20. Exit Potential: Could this be acquired? (1=acqui-hire at best, 10=strategic value)

After scoring, provide:
- Total score out of 200
- Top 3 strengths (highest scores)
- Top 3 concerns (lowest scores)
- GO/NO-GO recommendation with reasoning
- If GO: What to validate first
- If NO-GO: How to pivot the idea to improve scores`,
        tags: ["validation", "scoring"]
      },
      {
        id: "underserved-market-finder",
        title: "Underserved Market Opportunity Finder",
        prompt: `Help me find underserved markets and niches for a SaaS business.

MY GENERAL AREA OF INTEREST: [YOUR AREA - e.g., "productivity", "marketing", "finance"]
MY SKILLS: [YOUR RELEVANT SKILLS]

Research and identify:

**UNDERSERVED INDUSTRIES**
Find 5 industries that:
- Are behind on technology adoption
- Have money to spend on solutions
- Are underserved by current SaaS options
- Have fragmented, outdated tools
For each: Name the industry, explain why it's underserved, estimate market size, and identify the key decision maker.

**UNDERSERVED JOB ROLES**
Find 5 specific job roles that:
- Spend significant time on repetitive tasks
- Don't have dedicated tools built for them
- Are often overlooked by software companies
- Have budget authority or influence
For each: Name the role, their biggest daily pain, what tools they're misusing, and their willingness to pay.

**UNDERSERVED WORKFLOWS**
Find 5 specific workflows/processes that:
- Are done manually or with spreadsheets
- Happen frequently in businesses
- Have high error/frustration rates
- Could be dramatically improved with software
For each: Describe the workflow, who does it, current solution, and transformation opportunity.

**EMERGING OPPORTUNITIES**
Find 5 emerging opportunities based on:
- New regulations creating needs
- Technology shifts enabling new solutions
- Generational changes in work preferences
- Remote work creating new problems
- AI creating new categories
For each: Describe the opportunity, timing factors, and first-mover advantage potential.

For the top 3 opportunities overall, provide:
- Potential SaaS product concept
- Estimated competition level
- Go-to-market strategy hint
- Why NOW is the time`,
        tags: ["market-research", "opportunities"]
      },
      {
        id: "problem-interview-script",
        title: "Customer Discovery Interview Script (Complete Guide)",
        prompt: `Create a comprehensive customer discovery interview script for validating my SaaS idea:

MY IDEA: [DESCRIBE YOUR IDEA]
TARGET CUSTOMER: [WHO YOU'RE INTERVIEWING]
PROBLEM I THINK THEY HAVE: [THE PROBLEM YOU BELIEVE EXISTS]

Generate a complete 30-minute interview script:

**OPENING (2 minutes)**
- How to introduce yourself without biasing responses
- How to set expectations for the conversation
- How to make them comfortable being honest
- Recording permission script

**BACKGROUND QUESTIONS (5 minutes)**
- 3 questions about their role and responsibilities
- 2 questions about their typical day
- 1 question about their biggest priorities right now
Purpose: Understand their context without leading

**PROBLEM EXPLORATION (10 minutes)**
- 5 open-ended questions to uncover pain points naturally
- How to dig deeper with follow-up questions
- Questions about frequency and severity
- Questions about impact on their work/life
- Questions about who else is affected
Include specific phrases to use and avoid

**CURRENT SOLUTIONS (5 minutes)**
- How they're solving this today
- What they've tried before
- What they like/hate about current solutions
- How much time/money they spend on this
- What would make them switch

**FUTURE STATE (3 minutes)**
- What would ideal look like
- What would they pay for that solution
- Who would need to approve the purchase
- What would make them NOT buy

**WRAP-UP (5 minutes)**
- How to ask for referrals to other potential customers
- How to gauge their interest in being a beta user
- How to stay in touch without being pushy
- Thank you script

**ANALYSIS FRAMEWORK**
After interviews, how to:
- Score each interview (validated/invalidated/unclear)
- Identify patterns across interviews
- Know when you have enough validation
- Decide whether to proceed, pivot, or abandon

**RED FLAGS TO WATCH FOR**
- Signs they're being polite but not honest
- Signs you're leading them
- Signs the problem isn't painful enough
- Signs they won't actually pay`,
        tags: ["customer-discovery", "interviews"]
      },
      {
        id: "problem-validator",
        title: "Problem Validation Interview Script",
        prompt: `Create a customer discovery interview script for validating this problem:

Problem: [DESCRIBE THE PROBLEM]
Target customer: [WHO HAS THIS PROBLEM]

Generate:
1. 5 warm-up questions (build rapport, understand their role)
2. 10 problem exploration questions (understand frequency, severity, current solutions)
3. 5 solution-agnostic questions (what would ideal look like)
4. 3 willingness-to-pay questions (without revealing your solution)
5. Key things to listen for that validate/invalidate the problem

Important: Questions should be open-ended, not leading. We want to discover truth, not confirm our bias.`,
        tags: ["validation", "customer-research"]
      },
      {
        id: "competitor-analysis",
        title: "Competitor Deep-Dive Analysis",
        prompt: `Analyze my competitors for [YOUR PRODUCT IDEA]:

Main competitors:
1. [COMPETITOR 1]
2. [COMPETITOR 2]
3. [COMPETITOR 3]

For each competitor, analyze:
1. Their positioning and target customer
2. Pricing model and tiers
3. Core features (must-haves vs nice-to-haves)
4. What customers love (check reviews)
5. What customers complain about
6. Their apparent weaknesses
7. How long they've been in market

Then identify:
- Gaps in the market none of them serve well
- Features they all have (table stakes)
- Pricing sweet spots they're missing
- Underserved customer segments
- My potential differentiation angles`,
        tags: ["competition", "market-research"]
      },
      {
        id: "mvp-scoper",
        title: "MVP Feature Prioritization",
        prompt: `Help me scope the MVP for my SaaS:

Product: [YOUR PRODUCT]
Core problem: [MAIN PROBLEM IT SOLVES]
Target user: [WHO IS THIS FOR]

List every feature I'm considering:
[LIST ALL FEATURES YOU'RE THINKING ABOUT]

Now categorize each feature:
1. MUST HAVE (users literally cannot use the product without this)
2. SHOULD HAVE (significantly improves core experience)
3. COULD HAVE (nice to have, not critical)
4. WON'T HAVE (save for later versions)

For each MUST HAVE, explain:
- Why it's essential
- Simplest possible implementation
- How to validate it works before building more

My MVP should be buildable in 2 weeks. Be ruthless about cutting scope.`,
        tags: ["mvp", "planning"]
      },
      {
        id: "pricing-strategy",
        title: "Pricing Strategy Designer",
        prompt: `Design a pricing strategy for my SaaS:

Product: [YOUR PRODUCT]
Target customer: [B2B/B2C, company size, role]
Core value delivered: [WHAT THEY GET]
Competitor pricing: [WHAT OTHERS CHARGE]

Create:
1. 3 pricing tiers with names, prices, and included features
2. The psychology behind each tier (anchor, popular choice, aspirational)
3. What metric to charge on (per user, per usage, flat fee) and why
4. Free trial vs freemium recommendation with reasoning
5. Annual discount strategy
6. Price anchoring tactics
7. How to present pricing to maximize conversions

Consider:
- Value-based pricing over cost-based
- What customers are willing to pay, not what it costs you
- How to make the middle tier the obvious choice`,
        tags: ["pricing", "monetization"]
      },
      {
        id: "business-model-canvas",
        title: "AI Business Model Canvas Generator",
        prompt: `Generate a complete Business Model Canvas for my AI-powered SaaS:

MY PRODUCT: [NAME AND DESCRIPTION]
TARGET MARKET: [WHO IT'S FOR]

Create a comprehensive canvas:

**1. VALUE PROPOSITIONS**
- Primary value proposition (the main promise)
- Secondary value propositions (supporting benefits)
- Unique differentiators vs competitors
- Jobs you help customers complete
- Pains you relieve
- Gains you create

**2. CUSTOMER SEGMENTS**
- Primary customer segment (most important)
- Secondary segments (future expansion)
- Customer personas with demographics, psychographics, behaviors
- Market size estimates for each segment
- Segment prioritization rationale

**3. CHANNELS**
- Awareness stage channels
- Evaluation stage channels
- Purchase channels
- Delivery channels
- After-sales channels
- Channel cost analysis

**4. CUSTOMER RELATIONSHIPS**
- Acquisition strategy (how to get them)
- Retention strategy (how to keep them)
- Expansion strategy (how to grow them)
- Self-service vs high-touch approach
- Community building approach
- Automated vs personal touchpoints

**5. REVENUE STREAMS**
- Primary revenue model
- Secondary revenue opportunities
- Pricing strategy
- Payment terms
- Revenue per customer estimates
- Revenue diversification plan

**6. KEY RESOURCES**
- Technical resources needed
- Human resources needed
- Financial resources needed
- Intellectual property
- Data assets

**7. KEY ACTIVITIES**
- Product development priorities
- Marketing and sales activities
- Customer success activities
- Operations requirements
- What to build vs buy vs partner

**8. KEY PARTNERSHIPS**
- Strategic partners needed
- Supplier relationships
- Technology partners
- Distribution partners
- Partner value exchange

**9. COST STRUCTURE**
- Fixed costs
- Variable costs
- Economies of scale opportunities
- Cost optimization priorities
- Unit economics targets

Finally, provide:
- Risk assessment for each area
- MVP approach (minimum viable version of each element)
- 30-60-90 day action plan`,
        tags: ["business-model", "strategy"]
      },
      {
        id: "landing-page-teardown",
        title: "Competitor Landing Page Teardown Analyzer",
        prompt: `Analyze competitor landing pages to improve my own:

COMPETITOR URLS TO ANALYZE:
1. [COMPETITOR 1 URL]
2. [COMPETITOR 2 URL]
3. [COMPETITOR 3 URL]

MY PRODUCT: [YOUR PRODUCT DESCRIPTION]

For each competitor, analyze:

**MESSAGING ANALYSIS**
- Main headline: What promise are they making?
- Subheadline: How do they expand on it?
- Value proposition clarity (1-10)
- Emotional triggers used
- Pain points addressed
- Benefits highlighted
- Unique angles/positioning

**STRUCTURAL ANALYSIS**
- Page sections and their order
- Information hierarchy
- Above-the-fold content
- Social proof placement
- CTA placement and frequency
- FAQ/objection handling
- Trust signals used

**VISUAL ANALYSIS**
- Hero image/video approach
- Color psychology
- Typography choices
- White space usage
- Visual hierarchy
- Mobile experience

**CONVERSION ELEMENTS**
- Primary CTA text and design
- Secondary CTAs
- Lead magnets offered
- Pricing presentation
- Guarantee/risk reversal
- Urgency/scarcity tactics
- Exit intent approach

**COPY TECHNIQUES**
- Headline formulas used
- Storytelling approach
- Voice and tone
- Power words
- Specificity level
- Before/after framing

**STRENGTHS TO STEAL**
- Best practices to adopt
- Messaging that resonates
- Design patterns that work

**WEAKNESSES TO EXPLOIT**
- Gaps in their messaging
- Missing trust elements
- Confusing sections
- Opportunities they're missing

**YOUR DIFFERENTIATION STRATEGY**
Based on this analysis:
- How to position against them
- Messaging angles they're not using
- Design approaches to try
- Unique proof points to highlight
- Gaps you can fill

**ACTION ITEMS**
Specific improvements for your landing page with priority order.`,
        tags: ["competitive-analysis", "conversion"]
      },
      {
        id: "survey-questions",
        title: "Customer Survey Question Generator",
        prompt: `Create survey questions to validate my product and understand customers:

MY PRODUCT: [PRODUCT DESCRIPTION]
SURVEY GOAL: [WHAT YOU WANT TO LEARN]
TARGET RESPONDENT: [WHO WILL TAKE THIS SURVEY]

Generate questions for:

**DEMOGRAPHIC/SEGMENTATION QUESTIONS (5 questions)**
- Role/job title
- Company size
- Industry
- Experience level
- Decision-making authority
Make these useful for segmenting responses.

**PROBLEM VALIDATION QUESTIONS (5 questions)**
- Frequency of the problem
- Severity of the problem
- Current solutions used
- Satisfaction with current solutions
- Time/money spent on current solutions
Use scales where appropriate.

**SOLUTION FIT QUESTIONS (5 questions)**
- Interest level in proposed solution
- Must-have features
- Nice-to-have features
- Deal-breaker features
- Comparison to alternatives

**PRICING QUESTIONS (3 questions)**
Using Van Westendorp price sensitivity:
- At what price is this too expensive?
- At what price is this a bargain?
- At what price does it seem too cheap (suspicious quality)?
- At what price is it getting expensive but still worth it?

**BUYING BEHAVIOR QUESTIONS (4 questions)**
- How they discover new tools
- Who else is involved in decisions
- What triggers a purchase decision
- What prevents purchases

**OPEN-ENDED QUESTIONS (3 questions)**
- What would make this a "must-have"?
- What concerns would you have?
- What's missing from current solutions?

**FOLLOW-UP QUESTIONS (2 questions)**
- Interest in beta testing
- Best way to contact

For each question, provide:
- The question itself
- Answer type (multiple choice, scale, open text)
- Answer options if applicable
- Why this question matters
- How to analyze responses

Also include:
- Recommended survey length
- Incentive suggestions
- Distribution strategy
- Statistical significance requirements
- Analysis framework`,
        tags: ["surveys", "research"]
      }
    ]
  },
  {
    id: "prd",
    name: "Product Requirements",
    icon: FileText,
    description: "Write detailed product specs",
    prompts: [
      {
        id: "prd-generator",
        title: "Complete PRD Generator",
        prompt: `Write a comprehensive Product Requirements Document for:

Product: [YOUR PRODUCT NAME]
Problem: [CORE PROBLEM]
Target user: [PRIMARY USER PERSONA]

Include these sections:
1. Executive Summary (2-3 sentences)
2. Problem Statement (what pain exists today)
3. Target Users (demographics, behaviors, needs)
4. User Stories (as a [user], I want [action] so that [benefit])
5. Functional Requirements (what the system must do)
6. Non-Functional Requirements (performance, security, scalability)
7. Success Metrics (how we know it's working)
8. Out of Scope (what we're NOT building)
9. Dependencies & Assumptions
10. Timeline & Milestones

Be specific and actionable. Each requirement should be testable.`,
        tags: ["prd", "documentation"]
      },
      {
        id: "user-stories",
        title: "User Story Generator with Acceptance Criteria",
        prompt: `Generate detailed user stories for this feature:

Feature: [FEATURE NAME]
Product context: [BRIEF PRODUCT DESCRIPTION]
User type: [WHO WILL USE THIS]

For each user story, provide:
1. Story: "As a [user type], I want [action] so that [benefit]"
2. Acceptance Criteria (Given/When/Then format):
   - Given [precondition]
   - When [action]
   - Then [expected result]
3. Edge cases to consider
4. Dependencies on other features
5. Estimated complexity (S/M/L)

Generate at least 8-10 user stories covering:
- Happy path (everything works)
- Error states
- Edge cases
- Different user permissions (if applicable)`,
        tags: ["user-stories", "agile"]
      },
      {
        id: "technical-spec",
        title: "Technical Specification Writer",
        prompt: `Write a technical specification for implementing:

Feature: [FEATURE NAME]
Context: [HOW IT FITS IN THE APP]
User story: [THE USER STORY THIS ADDRESSES]

Include:
1. Overview (what we're building, why)
2. Technical approach (high-level architecture)
3. Data model (new tables, fields, relationships)
4. API endpoints (method, path, request/response)
5. Frontend components (what UI elements needed)
6. Business logic (key algorithms, calculations)
7. Security considerations
8. Performance considerations
9. Testing approach
10. Rollout plan

Tech stack context: [YOUR TECH STACK]`,
        tags: ["technical", "architecture"]
      },
      {
        id: "database-schema",
        title: "Database Schema Designer",
        prompt: `Design the database schema for my SaaS:

Product: [YOUR PRODUCT]
Core entities: [MAIN THINGS YOU NEED TO STORE]
Key relationships: [HOW THINGS RELATE]

For each table, provide:
1. Table name
2. All columns with:
   - Name
   - Data type
   - Constraints (primary key, foreign key, unique, not null)
   - Default value if any
3. Indexes needed for performance
4. Foreign key relationships

Also include:
- Entity relationship diagram (describe in text)
- Common queries this schema optimizes for
- Scalability considerations
- Multi-tenancy approach if B2B

Use [PostgreSQL/MySQL/SQLite] syntax.`,
        tags: ["database", "schema"]
      }
    ]
  },
  {
    id: "ui-ux",
    name: "UI/UX Design",
    icon: Palette,
    description: "Design interfaces and user flows",
    prompts: [
      {
        id: "user-flow",
        title: "User Flow Mapper",
        prompt: `Map out the complete user flow for:

Action: [WHAT THE USER IS TRYING TO DO]
Starting point: [WHERE THEY BEGIN]
End goal: [WHAT SUCCESS LOOKS LIKE]

For each step in the flow:
1. Screen/page name
2. What the user sees
3. Actions available to them
4. Decision points (if any)
5. Where each action leads
6. Potential drop-off points and how to prevent them

Include flows for:
- Happy path (everything goes right)
- Error recovery (something goes wrong)
- Edge cases (unusual but valid scenarios)

Format as a numbered flow with arrows showing progression.`,
        tags: ["user-flow", "ux"]
      },
      {
        id: "component-design",
        title: "UI Component Specification",
        prompt: `Design the UI component for:

Component: [COMPONENT NAME, e.g., "User Settings Panel"]
Purpose: [WHAT IT DOES]
Context: [WHERE IT APPEARS IN THE APP]

Provide:
1. Visual structure (layout, sections)
2. All UI elements with:
   - Element type (button, input, dropdown, etc.)
   - Label/placeholder text
   - States (default, hover, active, disabled, error)
   - Validation rules if input
3. Responsive behavior (desktop, tablet, mobile)
4. Accessibility requirements (ARIA labels, keyboard navigation)
5. Loading states
6. Empty states
7. Error states with messages

Design system context: Using Tailwind CSS with shadcn/ui components.`,
        tags: ["ui", "components"]
      },
      {
        id: "onboarding-flow",
        title: "Onboarding Flow Designer",
        prompt: `Design an onboarding flow for new users of:

Product: [YOUR PRODUCT]
Core value: [MAIN THING THEY NEED TO EXPERIENCE]
Activation metric: [WHAT DEFINES AN "ACTIVATED" USER]

Create an onboarding that:
1. Gets them to the "aha moment" as fast as possible
2. Collects only essential information
3. Shows, doesn't tell (interactive > reading)

For each step:
1. Screen title and purpose
2. What information we collect (if any) and why
3. Visual elements and copy
4. Progress indication
5. Skip option (yes/no and why)
6. What happens on completion

Also include:
- Welcome email content
- First-session guidance/tooltips
- Checklist for activation milestones`,
        tags: ["onboarding", "activation"]
      },
      {
        id: "dashboard-design",
        title: "Dashboard Layout Designer",
        prompt: `Design a dashboard for:

Product: [YOUR PRODUCT]
User role: [WHO IS VIEWING THIS]
Primary goals: [WHAT THEY NEED TO DO/SEE]

The dashboard should answer:
1. "How am I doing?" (key metrics)
2. "What needs attention?" (alerts, actions)
3. "What should I do next?" (recommendations)

Specify:
1. Layout grid (what goes where)
2. Each widget/card with:
   - Purpose
   - Data displayed
   - Visualization type (number, chart, list, etc.)
   - Update frequency
   - Click actions
3. Filtering and date range options
4. Empty states for new users
5. Mobile responsiveness approach

Prioritize: Most important info visible without scrolling.`,
        tags: ["dashboard", "data-visualization"]
      },
      {
        id: "form-design",
        title: "Smart Form Designer",
        prompt: `Design an optimal form for:

Purpose: [WHAT THE FORM COLLECTS]
Context: [WHERE IT APPEARS]
User state: [NEW USER, RETURNING, ETC.]

For each field:
1. Label and placeholder
2. Input type (text, email, select, etc.)
3. Validation rules with error messages
4. Required vs optional
5. Help text if needed
6. Auto-fill possibilities

Form UX optimizations:
1. Field ordering (easiest first, build momentum)
2. Grouping related fields
3. Progressive disclosure (show fields based on answers)
4. Inline validation approach
5. Submit button states and copy
6. Success and error handling
7. Mobile keyboard optimization (inputmode)

Keep it minimal: Every field should justify its existence.`,
        tags: ["forms", "ux"]
      }
    ]
  },
  {
    id: "backend",
    name: "Backend Development",
    icon: Database,
    description: "Build APIs and server logic",
    prompts: [
      {
        id: "api-endpoint",
        title: "REST API Endpoint Generator",
        prompt: `Create a REST API endpoint for:

Resource: [WHAT RESOURCE, e.g., "User Subscriptions"]
Operation: [CRUD OPERATION]
Tech stack: Node.js with Express, PostgreSQL, Drizzle ORM

Provide complete code for:
1. Route definition with proper HTTP method
2. Request validation using Zod
3. Authentication/authorization check
4. Database query with Drizzle
5. Response formatting
6. Error handling with appropriate status codes

Include:
- TypeScript types for request and response
- JSDoc comments
- Rate limiting consideration
- Logging for debugging

The endpoint should follow REST best practices and return consistent JSON responses.`,
        tags: ["api", "rest"]
      },
      {
        id: "auth-system",
        title: "Authentication System Builder",
        prompt: `Build an authentication system for my SaaS:

Requirements:
- [EMAIL/PASSWORD, OAUTH, MAGIC LINK, etc.]
- Session or JWT based
- Remember me functionality
- Password reset flow

Tech stack: [YOUR STACK]

Provide:
1. Database schema for users and sessions
2. Registration endpoint with validation
3. Login endpoint with rate limiting
4. Session/token management
5. Password hashing approach
6. Protected route middleware
7. Logout and session invalidation
8. Password reset email flow

Security considerations:
- CSRF protection
- Secure cookie settings
- Brute force prevention
- Input sanitization`,
        tags: ["auth", "security"]
      },
      {
        id: "background-jobs",
        title: "Background Job Processor",
        prompt: `Design a background job system for:

Job type: [WHAT NEEDS TO HAPPEN ASYNC]
Trigger: [WHAT INITIATES THE JOB]
Frequency: [ONE-TIME, SCHEDULED, ETC.]

Provide:
1. Job queue setup (using [Redis/PostgreSQL/memory])
2. Job producer code (how to add jobs)
3. Job consumer/worker code
4. Retry logic with exponential backoff
5. Dead letter queue for failed jobs
6. Job status tracking
7. Monitoring and alerting approach

Handle:
- Job deduplication
- Concurrency limits
- Graceful shutdown
- Error recovery
- Idempotency (safe to retry)`,
        tags: ["jobs", "async"]
      },
      {
        id: "webhook-handler",
        title: "Webhook Handler Builder",
        prompt: `Create a webhook handler for:

Service: [STRIPE, GITHUB, TWILIO, ETC.]
Events to handle: [LIST EVENTS]

Provide complete implementation:
1. Endpoint that receives webhooks
2. Signature verification for security
3. Event parsing and routing
4. Handler for each event type
5. Idempotency handling (don't process twice)
6. Error handling that doesn't expose internals
7. Logging for debugging
8. Return appropriate responses

Also include:
- How to test locally (using CLI or ngrok)
- Retry handling approach
- Event ordering considerations`,
        tags: ["webhooks", "integrations"]
      },
      {
        id: "caching-strategy",
        title: "Caching Strategy Designer",
        prompt: `Design a caching strategy for:

Data being cached: [WHAT DATA]
Access pattern: [READ-HEAVY, WRITE-HEAVY, ETC.]
Freshness requirements: [HOW STALE IS ACCEPTABLE]

Provide:
1. Cache layer recommendation (Redis, in-memory, CDN)
2. Cache key structure
3. TTL strategy
4. Cache invalidation approach:
   - When to invalidate
   - How to invalidate (delete, update, lazy)
5. Cache-aside vs write-through pattern
6. Code implementation for:
   - Cache read with fallback
   - Cache write
   - Cache invalidation
7. Monitoring cache hit rates

Handle:
- Cache stampede prevention
- Graceful degradation if cache fails
- Memory limits`,
        tags: ["caching", "performance"]
      }
    ]
  },
  {
    id: "frontend",
    name: "Frontend Development",
    icon: Code,
    description: "Build React components and pages",
    prompts: [
      {
        id: "react-component",
        title: "React Component Generator",
        prompt: `Create a React component for:

Component: [COMPONENT NAME]
Purpose: [WHAT IT DOES]
Props needed: [LIST PROPS WITH TYPES]

Tech stack: React 19, TypeScript, Tailwind CSS, shadcn/ui

Provide:
1. TypeScript interface for props
2. Component implementation with:
   - Proper TypeScript typing
   - Tailwind CSS styling
   - shadcn/ui components where appropriate
   - Loading states
   - Error states
   - Empty states
3. Usage example
4. Accessibility considerations

The component should be:
- Reusable and composable
- Well-typed with no 'any'
- Following React best practices (hooks, composition)`,
        tags: ["react", "components"]
      },
      {
        id: "data-fetching",
        title: "Data Fetching with TanStack Query",
        prompt: `Implement data fetching for:

Data needed: [WHAT DATA]
Endpoint: [API ENDPOINT]
Update frequency: [HOW OFTEN IT CHANGES]

Using TanStack Query (React Query), provide:
1. Query hook with proper typing
2. Query key structure
3. Stale time and cache time settings
4. Loading and error UI handling
5. Refetch strategies (on focus, interval, manual)
6. Optimistic updates if applicable
7. Prefetching strategy
8. Pagination if needed (infinite scroll or pages)

Also include:
- How to invalidate this query
- How to update cache directly
- Error boundary integration`,
        tags: ["data-fetching", "react-query"]
      },
      {
        id: "form-handling",
        title: "Form with Validation",
        prompt: `Create a form component for:

Form purpose: [WHAT IT COLLECTS]
Fields: [LIST ALL FIELDS WITH TYPES]
Submit action: [API CALL OR OTHER]

Using React Hook Form with Zod validation, provide:
1. Zod schema for validation
2. Form component with:
   - All fields with proper inputs
   - Real-time validation feedback
   - Submit handling with loading state
   - Error display (field-level and form-level)
   - Success handling
3. TypeScript types inferred from Zod
4. Accessible form markup

Include:
- Dirty/pristine field tracking
- Submit only when valid
- Reset functionality
- Default values handling`,
        tags: ["forms", "validation"]
      },
      {
        id: "state-management",
        title: "State Management Pattern",
        prompt: `Design state management for:

Feature: [WHAT FEATURE]
State shape: [WHAT DATA NEEDS TO BE TRACKED]
Shared between: [WHICH COMPONENTS NEED ACCESS]

Recommend the best approach:
- Local state (useState)
- Lifted state
- Context API
- URL state
- Server state (TanStack Query)

Then implement with:
1. State type definitions
2. State initialization
3. Update functions/actions
4. Selectors if needed
5. How components access and update
6. Persistence strategy if needed

Explain why this approach over alternatives.`,
        tags: ["state", "architecture"]
      },
      {
        id: "responsive-layout",
        title: "Responsive Layout Builder",
        prompt: `Create a responsive layout for:

Page: [PAGE NAME]
Content sections: [LIST SECTIONS]
Key breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)

Using Tailwind CSS, provide:
1. Mobile-first layout code
2. Tablet adjustments
3. Desktop adjustments
4. Container and spacing system
5. Navigation adaptation (hamburger on mobile)
6. Image/media handling
7. Typography scaling

Include:
- Flexbox/Grid decisions and why
- Touch-friendly tap targets on mobile
- Content priority changes between breakpoints
- Testing approach for responsiveness`,
        tags: ["responsive", "css"]
      }
    ]
  },
  {
    id: "integrations",
    name: "API Integrations",
    icon: Plug,
    description: "Connect to third-party services",
    prompts: [
      {
        id: "stripe-integration",
        title: "Stripe Payments Integration",
        prompt: `Integrate Stripe payments for:

Business model: [SUBSCRIPTION, ONE-TIME, USAGE-BASED]
Products/prices: [YOUR PRICING TIERS]
Tech stack: [YOUR STACK]

Provide complete implementation for:
1. Stripe product/price setup
2. Checkout session creation
3. Customer portal for managing subscription
4. Webhook handling for:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
5. Subscription status checking
6. Usage-based billing (if applicable)
7. Proration handling

Frontend:
- Pricing page with Stripe checkout
- Billing settings page
- Subscription status display

Handle:
- Failed payments
- Subscription cancellation
- Plan upgrades/downgrades`,
        tags: ["stripe", "payments"]
      },
      {
        id: "email-integration",
        title: "Transactional Email Setup",
        prompt: `Set up transactional emails for:

Email provider: [RESEND, SENDGRID, POSTMARK, ETC.]
Emails needed:
- [LIST ALL EMAIL TYPES]

For each email type, provide:
1. Trigger (when it sends)
2. Subject line
3. HTML template with dynamic variables
4. Plain text fallback
5. Send function code

Also implement:
1. Email service abstraction (easy to swap providers)
2. Template management approach
3. Email queue for reliability
4. Tracking (opens, clicks) if available
5. Unsubscribe handling

Best practices:
- From address setup (SPF, DKIM)
- Testing emails locally
- Preview/review system`,
        tags: ["email", "notifications"]
      },
      {
        id: "oauth-integration",
        title: "OAuth Provider Integration",
        prompt: `Integrate OAuth login for:

Provider: [GOOGLE, GITHUB, APPLE, ETC.]
Use case: [LOGIN, DATA ACCESS, BOTH]
Tech stack: [YOUR STACK]

Provide:
1. OAuth app setup instructions for the provider
2. Environment variables needed
3. OAuth flow implementation:
   - Authorization URL generation
   - Callback handler
   - Token exchange
   - User profile fetching
4. Account linking (connect to existing account)
5. Token refresh handling
6. Scope management

Frontend:
- "Sign in with X" button
- Account connections settings
- Error handling UI

Security:
- State parameter for CSRF
- Secure token storage
- Scope minimization`,
        tags: ["oauth", "auth"]
      },
      {
        id: "openai-integration",
        title: "OpenAI API Integration",
        prompt: `Integrate OpenAI API for:

Use case: [WHAT YOU'RE USING AI FOR]
Model: [GPT-4, GPT-3.5, ETC.]
Expected usage: [VOLUME, LATENCY REQUIREMENTS]

Provide:
1. API client setup with error handling
2. Prompt template management
3. Chat completion function with:
   - System prompt
   - User message handling
   - Temperature and other params
   - Token counting
4. Streaming response handling
5. Rate limiting and queuing
6. Cost tracking per request
7. Fallback for API failures

Handle:
- Context window limits
- Content moderation
- Caching repeated queries
- Timeout handling

Also:
- How to test without hitting API
- Prompt versioning approach`,
        tags: ["openai", "ai"]
      },
      {
        id: "file-upload",
        title: "File Upload System",
        prompt: `Build a file upload system for:

File types: [IMAGES, DOCUMENTS, ETC.]
Max size: [SIZE LIMIT]
Storage: [S3, CLOUDFLARE R2, LOCAL]

Provide:
1. Upload endpoint with:
   - File type validation
   - Size limit enforcement
   - Virus scanning consideration
   - Unique filename generation
2. Storage service abstraction
3. Pre-signed URL generation for direct upload
4. Download/access URL generation
5. Thumbnail generation (for images)
6. Cleanup of orphaned files

Frontend:
- Drag and drop upload component
- Progress indicator
- Preview before upload
- Multiple file handling

Security:
- File type verification (not just extension)
- Access control on downloads
- CDN integration`,
        tags: ["uploads", "storage"]
      }
    ]
  },
  {
    id: "security",
    name: "Security & Auth",
    icon: Shield,
    description: "Secure your application",
    prompts: [
      {
        id: "security-audit",
        title: "Security Audit Checklist",
        prompt: `Perform a security audit on my SaaS:

Tech stack: [YOUR STACK]
Sensitive data: [WHAT YOU STORE]
User roles: [ADMIN, USER, ETC.]

Check for:
1. Authentication vulnerabilities:
   - Password policy enforcement
   - Session management
   - Brute force protection
   - MFA availability

2. Authorization vulnerabilities:
   - IDOR (accessing others' data)
   - Privilege escalation
   - Role enforcement

3. Data security:
   - Encryption at rest
   - Encryption in transit
   - PII handling
   - Backup security

4. API security:
   - Rate limiting
   - Input validation
   - SQL injection
   - XSS prevention

5. Infrastructure:
   - HTTPS enforcement
   - Security headers
   - Dependency vulnerabilities
   - Secret management

For each issue found, provide:
- Risk level
- How to fix
- Code example if applicable`,
        tags: ["security", "audit"]
      },
      {
        id: "rbac-system",
        title: "Role-Based Access Control",
        prompt: `Design an RBAC system for:

Roles needed: [LIST ROLES]
Resources: [WHAT THINGS NEED PROTECTION]
Actions: [CREATE, READ, UPDATE, DELETE, ETC.]

Provide:
1. Database schema for roles and permissions
2. Permission checking middleware
3. Role assignment system
4. UI permission checking (show/hide elements)
5. API permission checking
6. Superadmin override capability
7. Audit logging for permission changes

Also:
- Default role for new users
- Role hierarchy (if roles inherit)
- Custom permission support
- Permission caching strategy`,
        tags: ["rbac", "authorization"]
      },
      {
        id: "input-validation",
        title: "Input Validation & Sanitization",
        prompt: `Create a comprehensive input validation system for:

Input types I handle:
- [LIST ALL USER INPUT TYPES]

For each input type, provide:
1. Validation rules (Zod schema)
2. Sanitization function
3. Error messages (user-friendly)
4. Where validation happens (client, server, both)

Common attack vectors to prevent:
- SQL injection
- XSS (Cross-Site Scripting)
- Command injection
- Path traversal
- SSRF
- NoSQL injection

Also provide:
- Centralized validation utility
- How to handle validation errors consistently
- Logging suspicious input patterns`,
        tags: ["validation", "security"]
      }
    ]
  },
  {
    id: "debugging",
    name: "Debugging & Problem Solving",
    icon: Bug,
    description: "Fix issues and debug code",
    prompts: [
      {
        id: "debug-error",
        title: "Error Debugging Assistant",
        prompt: `Help me debug this error:

Error message:
\`\`\`
[PASTE ERROR MESSAGE]
\`\`\`

Context:
- What I was trying to do: [ACTION]
- When it happens: [TRIGGER]
- Tech stack: [YOUR STACK]

Relevant code:
\`\`\`
[PASTE RELEVANT CODE]
\`\`\`

Please:
1. Explain what the error means in plain English
2. Identify the likely root cause
3. Suggest 3-5 potential fixes, ranked by likelihood
4. Provide the corrected code
5. Explain how to prevent this in the future

If you need more context, tell me what to check.`,
        tags: ["debugging", "errors"]
      },
      {
        id: "code-review",
        title: "Code Review Request",
        prompt: `Review this code for issues:

\`\`\`
[PASTE YOUR CODE]
\`\`\`

Context: [WHAT THIS CODE DOES]

Review for:
1. Bugs or logic errors
2. Security vulnerabilities
3. Performance issues
4. Code style and readability
5. Error handling completeness
6. Edge cases not handled
7. TypeScript type safety
8. Testing considerations

For each issue:
- Severity (critical/major/minor/suggestion)
- Location (line number or section)
- What's wrong
- How to fix it
- Improved code snippet`,
        tags: ["code-review", "quality"]
      },
      {
        id: "performance-debug",
        title: "Performance Issue Debugger",
        prompt: `Help me fix this performance issue:

Problem: [DESCRIBE THE SLOWNESS]
When it happens: [TRIGGER/PATTERN]
Current timing: [HOW SLOW]
Expected timing: [HOW FAST IT SHOULD BE]

Relevant code:
\`\`\`
[PASTE CODE]
\`\`\`

Database queries (if applicable):
\`\`\`
[PASTE QUERIES]
\`\`\`

Please:
1. Identify likely bottlenecks
2. Suggest profiling approach
3. Provide optimized code
4. Explain the optimization
5. Estimate improvement
6. Suggest monitoring to add`,
        tags: ["performance", "optimization"]
      },
      {
        id: "refactor-code",
        title: "Code Refactoring Request",
        prompt: `Refactor this code to be cleaner:

\`\`\`
[PASTE YOUR CODE]
\`\`\`

Issues I'm concerned about:
- [LIST SPECIFIC CONCERNS]

Goals:
- Improve readability
- Reduce complexity
- Make it more maintainable
- Follow best practices for [YOUR STACK]

Please:
1. Show the refactored code
2. Explain each change and why
3. Ensure no behavior changes (same inputs = same outputs)
4. Add TypeScript types if missing
5. Suggest tests that verify the refactor`,
        tags: ["refactoring", "clean-code"]
      }
    ]
  },
  {
    id: "testing",
    name: "Testing & QA",
    icon: TestTube,
    description: "Write tests and ensure quality",
    prompts: [
      {
        id: "unit-tests",
        title: "Unit Test Generator",
        prompt: `Write unit tests for this code:

\`\`\`
[PASTE YOUR CODE]
\`\`\`

Testing framework: [JEST, VITEST, ETC.]

Generate tests covering:
1. Happy path (normal operation)
2. Edge cases:
   - Empty inputs
   - Null/undefined
   - Boundary values
   - Invalid types
3. Error conditions
4. Async behavior (if applicable)

For each test:
- Descriptive test name
- Arrange/Act/Assert structure
- Appropriate assertions
- Mock setup if needed

Also provide:
- Code coverage expectations
- What can't be unit tested (needs integration test)`,
        tags: ["testing", "unit-tests"]
      },
      {
        id: "integration-tests",
        title: "API Integration Test Generator",
        prompt: `Write integration tests for this API:

Endpoint: [METHOD] [PATH]
Purpose: [WHAT IT DOES]
Request body: [SCHEMA]
Response: [EXPECTED RESPONSE]

Testing framework: [SUPERTEST, ETC.]

Generate tests for:
1. Success cases:
   - Valid request returns correct response
   - Response format matches spec
   - Database state changes correctly

2. Authentication:
   - Unauthenticated request rejected
   - Wrong user can't access

3. Validation:
   - Missing required fields
   - Invalid field types
   - Out of range values

4. Error handling:
   - Not found (404)
   - Server error handling

Include:
- Test database setup/teardown
- Authentication helpers
- Response assertions`,
        tags: ["testing", "integration"]
      },
      {
        id: "test-plan",
        title: "QA Test Plan Generator",
        prompt: `Create a comprehensive test plan for:

Feature: [FEATURE NAME]
Description: [WHAT IT DOES]
User flows: [LIST MAIN FLOWS]

Generate:
1. Test scenarios (high-level what to test)
2. Test cases for each scenario:
   - ID
   - Description
   - Preconditions
   - Steps
   - Expected result
   - Priority (P0/P1/P2)

Cover:
- Functional testing (does it work?)
- Usability testing (is it easy to use?)
- Edge case testing (weird scenarios)
- Regression areas (what might break?)
- Cross-browser/device testing
- Accessibility testing
- Performance testing thresholds

Also include:
- Test data needed
- Environment requirements
- Definition of done`,
        tags: ["qa", "test-plan"]
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Copy",
    icon: Megaphone,
    description: "Write converting copy",
    prompts: [
      {
        id: "landing-page",
        title: "Landing Page Copy Generator",
        prompt: `Write landing page copy for:

Product: [YOUR PRODUCT]
Target customer: [WHO IT'S FOR]
Main problem: [PAIN POINT]
Key benefit: [TRANSFORMATION]

Write each section:
1. Hero Section:
   - Headline (clear, benefit-focused)
   - Subheadline (expand on promise)
   - CTA button text
   - Supporting visual description

2. Problem Section:
   - Agitate the pain (make them feel it)
   - Show you understand

3. Solution Section:
   - Introduce your product
   - How it solves the problem

4. Features/Benefits:
   - 3-5 key features
   - Each with benefit-focused description

5. Social Proof:
   - Testimonial format suggestions
   - Trust indicators

6. Objection Handling:
   - Common concerns addressed

7. CTA Section:
   - Final push to action
   - Risk reversal (guarantee)

Write in a conversational, confident tone. Focus on benefits over features.`,
        tags: ["copywriting", "landing-page"]
      },
      {
        id: "email-sequence",
        title: "Email Marketing Sequence",
        prompt: `Create an email sequence for:

Goal: [CONVERT, ONBOARD, RETAIN, ETC.]
Audience: [WHO RECEIVES THIS]
Trigger: [WHAT STARTS THE SEQUENCE]

Write a [NUMBER] email sequence:

For each email:
1. Send timing (Day X, hours after previous)
2. Subject line (and 2 alternatives for A/B testing)
3. Preview text
4. Email body with:
   - Opening hook
   - Main content
   - Single clear CTA
   - P.S. line (optional bonus)
5. Goal of this specific email

The sequence should:
- Tell a story across emails
- Build trust and relationship
- Handle objections naturally
- Create urgency without being pushy
- Have clear progression toward goal`,
        tags: ["email", "marketing"]
      },
      {
        id: "value-proposition",
        title: "Value Proposition Canvas",
        prompt: `Create a value proposition for:

Product: [YOUR PRODUCT]
Customer segment: [TARGET CUSTOMER]

Complete this canvas:

CUSTOMER PROFILE:
1. Jobs to be done:
   - Functional jobs (tasks they need to complete)
   - Social jobs (how they want to be perceived)
   - Emotional jobs (how they want to feel)

2. Pains:
   - Frustrations with current solutions
   - Risks and fears
   - Obstacles and challenges

3. Gains:
   - Desired outcomes
   - Benefits they'd love
   - What would exceed expectations

VALUE MAP:
1. Products/Services:
   - What you offer

2. Pain relievers:
   - How you reduce pains

3. Gain creators:
   - How you create gains

Then synthesize into:
- One-sentence value proposition
- Elevator pitch (30 seconds)
- Positioning statement`,
        tags: ["positioning", "strategy"]
      },
      {
        id: "social-media",
        title: "Social Media Content Generator",
        prompt: `Create social media content for:

Product: [YOUR PRODUCT]
Platform: [TWITTER, LINKEDIN, ETC.]
Content goal: [AWARENESS, ENGAGEMENT, CONVERSIONS]

Generate 10 posts:
- Mix of formats (text, thread ideas, poll ideas)
- Different angles (educational, promotional, story)

For each post:
1. The post content (platform-appropriate length)
2. Best posting time
3. Hashtags if applicable
4. Engagement prompt/CTA
5. Visual suggestion if helpful

Content themes to cover:
- Product benefits
- Customer pain points
- Behind the scenes
- Tips and education
- Social proof/results
- Thought leadership`,
        tags: ["social-media", "content"]
      }
    ]
  },
  {
    id: "sales",
    name: "Sales & Conversion",
    icon: DollarSign,
    description: "Optimize for revenue",
    prompts: [
      {
        id: "sales-page",
        title: "Long-Form Sales Page Writer",
        prompt: `Write a long-form sales page for:

Product: [YOUR PRODUCT]
Price: [YOUR PRICE]
Target buyer: [IDEAL CUSTOMER]
Main transformation: [BEFORE → AFTER]

Structure:
1. Pre-headline (call out the reader)
2. Headline (big promise)
3. Opening story (hook them in)
4. Problem amplification (twist the knife)
5. Failed solutions (what doesn't work)
6. The breakthrough (your discovery)
7. Product introduction
8. How it works (simple steps)
9. Features → Benefits (what they get)
10. Proof (testimonials, results)
11. Bonuses (add value)
12. Price reveal and justification
13. Guarantee (reverse risk)
14. Urgency/scarcity
15. Final CTA
16. P.S. sections

Write persuasively but honestly. Focus on transformation, not features.`,
        tags: ["sales-page", "conversion"]
      },
      {
        id: "pricing-page",
        title: "Pricing Page Optimizer",
        prompt: `Optimize my pricing page:

Current tiers:
[DESCRIBE YOUR CURRENT PRICING]

Conversion rate: [CURRENT RATE]
Most popular tier: [WHICH ONE]
Goal: [INCREASE CONVERSIONS, INCREASE ARPU, ETC.]

Analyze and provide:
1. Tier naming recommendations
2. Feature allocation across tiers
3. Visual hierarchy suggestions
4. Price anchoring strategy
5. CTA copy for each tier
6. FAQ section suggestions
7. Trust elements to add
8. Social proof placement
9. Comparison table design
10. Enterprise/custom tier approach

Psychology to apply:
- Decoy effect
- Charm pricing
- Feature framing
- Loss aversion`,
        tags: ["pricing", "conversion"]
      },
      {
        id: "objection-handling",
        title: "Sales Objection Handler",
        prompt: `Create objection handling for:

Product: [YOUR PRODUCT]
Price point: [PRICE]
Target customer: [WHO]

Common objections to address:
1. "It's too expensive"
2. "I don't have time"
3. "I need to think about it"
4. "I need to ask my [boss/spouse]"
5. "How do I know this will work for me?"
6. "I've tried similar things before"
7. [ADD YOUR SPECIFIC OBJECTIONS]

For each objection:
1. Empathize (show understanding)
2. Clarify (make sure you understand)
3. Respond (address the real concern)
4. Confirm (check if satisfied)
5. Close (move forward)

Provide:
- Word-for-word responses
- FAQ versions for website
- Email response templates`,
        tags: ["sales", "objections"]
      }
    ]
  },
  {
    id: "launch",
    name: "Launch & Growth",
    icon: Rocket,
    description: "Launch and grow your SaaS",
    prompts: [
      {
        id: "launch-checklist",
        title: "Launch Checklist Generator",
        prompt: `Create a comprehensive launch checklist for:

Product: [YOUR PRODUCT]
Launch date: [DATE]
Launch type: [SOFT LAUNCH, PRODUCT HUNT, ETC.]

Generate checklist for:

PRE-LAUNCH (2 weeks before):
- Product readiness
- Marketing materials
- Email list preparation
- Social media setup
- Influencer outreach
- Press kit

LAUNCH WEEK:
- Day-by-day tasks
- Content to post
- People to notify
- Monitoring setup

LAUNCH DAY:
- Hour-by-hour schedule
- Response templates ready
- Team communication plan
- Metrics to watch

POST-LAUNCH:
- Follow-up tasks
- Analysis to do
- Iteration priorities

Include timing and owner for each task.`,
        tags: ["launch", "planning"]
      },
      {
        id: "growth-channels",
        title: "Growth Channel Identifier",
        prompt: `Identify growth channels for:

Product: [YOUR PRODUCT]
Target customer: [WHO]
Budget: [AMOUNT OR BOOTSTRAP]
Current stage: [PRE-LAUNCH, EARLY, GROWTH]

Analyze each channel:
1. SEO
2. Content marketing
3. Social media (by platform)
4. Paid ads (by platform)
5. Email marketing
6. Referral program
7. Partnerships
8. Community building
9. Product-led growth
10. Cold outreach

For each relevant channel:
- Why it fits (or doesn't)
- Getting started steps
- Resource requirements
- Time to results
- Key metrics to track
- Quick wins to try first

Recommend:
- Top 2-3 channels to focus on
- Sequencing strategy
- Budget allocation`,
        tags: ["growth", "marketing"]
      },
      {
        id: "product-hunt",
        title: "Product Hunt Launch Playbook",
        prompt: `Create a Product Hunt launch strategy for:

Product: [YOUR PRODUCT]
Category: [RELEVANT CATEGORY]
Target badge: [TOP 5, #1, ETC.]

Provide:

PRE-LAUNCH:
1. Ship page optimization
2. Hunter selection strategy
3. Community building approach
4. Supporters list building
5. Asset preparation (images, GIF, video)

LAUNCH DAY:
1. Optimal launch timing
2. First comment template
3. Response strategy for questions
4. Social media amplification plan
5. Email to supporters
6. How to ask for upvotes (without violating rules)

POST-LAUNCH:
1. Thank you to supporters
2. Leveraging the badge
3. Converting visitors to users

Common mistakes to avoid.
Templates for all communications.`,
        tags: ["product-hunt", "launch"]
      },
      {
        id: "retention-strategy",
        title: "User Retention Strategy",
        prompt: `Design a retention strategy for:

Product: [YOUR PRODUCT]
Current churn rate: [PERCENTAGE]
Key activation metric: [WHAT MAKES USERS STICK]
User lifecycle: [DESCRIBE STAGES]

Provide strategies for each stage:

1. Activation (first value):
   - Time to value optimization
   - Onboarding improvements
   - Activation triggers

2. Engagement (regular use):
   - Feature adoption
   - Usage frequency drivers
   - Notification strategy

3. Retention (preventing churn):
   - Churn prediction signals
   - Win-back campaigns
   - Exit survey insights

4. Expansion (growth):
   - Upsell opportunities
   - Referral program
   - Power user features

For each:
- Metrics to track
- Experiments to run
- Automation to build`,
        tags: ["retention", "growth"]
      }
    ]
  },
  {
    id: "support",
    name: "Customer Support",
    icon: HeadphonesIcon,
    description: "Handle support efficiently",
    prompts: [
      {
        id: "support-templates",
        title: "Support Response Templates",
        prompt: `Create support response templates for:

Product: [YOUR PRODUCT]
Common issues: [LIST TOP ISSUES]

For each issue type, provide:
1. Initial response template
2. Follow-up if not resolved
3. Escalation template
4. Resolution confirmation

Include templates for:
- Bug reports
- Feature requests
- Billing issues
- How-to questions
- Complaints
- Cancellation requests
- Refund requests

Each template should:
- Be warm and professional
- Include personalization spots
- Have clear next steps
- Set expectations on timing

Also create:
- Canned responses for quick replies
- Auto-response for after hours
- Satisfaction survey follow-up`,
        tags: ["support", "templates"]
      },
      {
        id: "help-docs",
        title: "Help Documentation Writer",
        prompt: `Write help documentation for:

Feature: [FEATURE NAME]
User level: [BEGINNER, INTERMEDIATE, ADVANCED]

Create:
1. Getting Started Guide:
   - Prerequisites
   - Step-by-step walkthrough
   - Screenshots descriptions
   - Common first-time issues

2. Feature Deep Dive:
   - What it does
   - When to use it
   - How to use it
   - Advanced options
   - Best practices

3. Troubleshooting:
   - Common problems
   - Solutions
   - When to contact support

4. FAQ:
   - Top 10 questions with answers

Write in second person ("you").
Use simple language, no jargon.
Include next steps/related articles.`,
        tags: ["documentation", "help"]
      }
    ]
  },
  {
    id: "analytics",
    name: "Analytics & Metrics",
    icon: BarChart3,
    description: "Track and analyze performance",
    prompts: [
      {
        id: "metrics-framework",
        title: "SaaS Metrics Framework",
        prompt: `Design a metrics framework for:

Product: [YOUR PRODUCT]
Business model: [SUBSCRIPTION, USAGE, ETC.]
Stage: [PRE-REVENUE, EARLY, GROWTH]

Define and explain how to calculate:

REVENUE METRICS:
- MRR / ARR
- ARPU
- Revenue growth rate
- Net revenue retention

CUSTOMER METRICS:
- CAC
- LTV
- LTV:CAC ratio
- Payback period

PRODUCT METRICS:
- Activation rate
- Daily/Weekly/Monthly active users
- Feature adoption
- Session duration

GROWTH METRICS:
- Conversion rate (free to paid)
- Churn rate
- Expansion revenue
- Viral coefficient

For each metric:
- Definition
- Formula
- How to track/measure
- Good benchmark
- How to improve`,
        tags: ["metrics", "analytics"]
      },
      {
        id: "analytics-setup",
        title: "Analytics Implementation Plan",
        prompt: `Plan analytics implementation for:

Product: [YOUR PRODUCT]
Key questions to answer:
- [LIST BUSINESS QUESTIONS]

Recommend:
1. Analytics tools (and why):
   - Product analytics
   - Web analytics
   - Error tracking
   - Session replay

2. Events to track:
   - User actions (list all)
   - System events
   - Business events

3. For each event:
   - Event name (naming convention)
   - Properties to capture
   - When it fires
   - Sample code

4. Dashboards to build:
   - Executive dashboard
   - Product dashboard
   - Marketing dashboard

5. Alerts to set up:
   - What to monitor
   - Thresholds
   - Who to notify`,
        tags: ["analytics", "tracking"]
      }
    ]
  },
  {
    id: "ai-integration",
    name: "AI Features & Integration",
    icon: Sparkles,
    description: "Build AI-powered features into your SaaS",
    prompts: [
      {
        id: "ai-feature-brainstorm",
        title: "AI Feature Brainstorm for Your SaaS",
        prompt: `Brainstorm AI-powered features I could add to my SaaS:

MY PRODUCT: [WHAT YOUR PRODUCT DOES]
TARGET USER: [WHO USES IT]
CURRENT FEATURES: [LIST MAIN FEATURES]
DATA I HAVE ACCESS TO: [WHAT DATA THE APP GENERATES/STORES]

Generate AI feature ideas in these categories:

**AUTOMATION FEATURES**
5 features that automate manual tasks:
- What task it automates
- How AI makes it possible
- User benefit (time saved, accuracy improved)
- Technical complexity (1-10)
- Implementation approach

**INTELLIGENCE FEATURES**
5 features that provide insights or predictions:
- What insight/prediction it provides
- What data it uses
- How accurate it needs to be to be useful
- How to present the insight to users
- Fallback if AI is wrong

**GENERATION FEATURES**
5 features that create content or suggestions:
- What it generates
- User input required
- Quality expectations
- Human review workflow
- Personalization approach

**ASSISTANCE FEATURES**
5 features that help users accomplish tasks:
- What task it assists with
- Interaction model (chat, suggestions, auto-complete)
- When to intervene vs stay silent
- Learning from user behavior
- Graceful degradation

**PERSONALIZATION FEATURES**
5 features that customize the experience:
- What gets personalized
- Signals used for personalization
- Cold start problem solution
- Privacy considerations
- User control over personalization

For the top 5 ideas overall:
- Detailed implementation approach
- API/model recommendations
- Cost estimation
- MVP version vs full vision
- Competitive advantage created`,
        tags: ["ai-features", "product"]
      },
      {
        id: "openai-implementation",
        title: "OpenAI/Claude API Implementation Guide",
        prompt: `Create a complete implementation guide for adding AI to my feature:

FEATURE I'M BUILDING: [DESCRIBE THE AI FEATURE]
WHAT INPUT IT RECEIVES: [USER INPUT OR DATA]
WHAT OUTPUT IT SHOULD PRODUCE: [EXPECTED RESULT]
MY TECH STACK: [YOUR STACK]

Provide complete implementation:

**1. MODEL SELECTION**
- Recommended model and why
- Cost per request estimate
- Latency expectations
- Alternative models to consider
- When to upgrade/downgrade models

**2. PROMPT ENGINEERING**
Complete prompt template with:
- System prompt (personality, constraints, format)
- User prompt template with variable placeholders
- Few-shot examples if needed
- Output format specification (JSON schema if structured)
- Edge case handling in the prompt

**3. API IMPLEMENTATION**
Complete code for:
\`\`\`typescript
// API client setup
// Rate limiting
// Error handling with retries
// Streaming if applicable
// Token counting
// Cost tracking
\`\`\`

**4. REQUEST HANDLING**
- Input validation and sanitization
- Context window management
- Conversation history handling
- Timeout configuration
- Cancellation handling

**5. RESPONSE PROCESSING**
- Parsing structured responses
- Handling malformed responses
- Validation against expected schema
- Fallback for failed parsing
- Caching successful responses

**6. ERROR HANDLING**
- Rate limit errors (429)
- API errors (500, 503)
- Content filter triggers
- Token limit exceeded
- Network failures
- Graceful user-facing error messages

**7. COST OPTIMIZATION**
- Prompt optimization techniques
- Caching strategies
- Model selection based on task complexity
- Batching requests
- Usage monitoring and alerts

**8. TESTING APPROACH**
- Mocking for unit tests
- Evaluation criteria for AI outputs
- Regression testing approach
- A/B testing framework

**9. MONITORING**
- Metrics to track
- Quality monitoring
- Cost dashboards
- Alert thresholds`,
        tags: ["openai", "implementation"]
      },
      {
        id: "prompt-template-library",
        title: "Production Prompt Template System",
        prompt: `Design a prompt template system for my AI-powered feature:

FEATURE: [YOUR AI FEATURE]
VARIATIONS NEEDED: [DIFFERENT USE CASES/PERSONAS]

Create a complete prompt template architecture:

**1. BASE PROMPT STRUCTURE**
\`\`\`
[SYSTEM_CONTEXT]
You are [ROLE] that helps [USER_TYPE] with [TASK].

[PERSONALITY_TRAITS]
- Trait 1
- Trait 2

[CONSTRAINTS]
- Never do X
- Always do Y
- Format requirements

[OUTPUT_FORMAT]
Respond in this exact format:
{json schema or structure}

[FEW_SHOT_EXAMPLES]
Example 1:
Input: ...
Output: ...

[USER_INPUT]
{user_message}
\`\`\`

**2. TEMPLATE VARIATIONS**
Create 5 different prompt variations for:
- Different user expertise levels
- Different use cases
- Different output lengths
- Different tones
- Different languages

**3. DYNAMIC INJECTION**
How to inject:
- User context (name, history, preferences)
- Product context (features, data)
- Temporal context (time, date, timezone)
- Session context (previous messages)

**4. PROMPT VERSIONING SYSTEM**
- Version naming convention
- A/B testing framework
- Rollback strategy
- Performance comparison metrics
- Changelog documentation

**5. QUALITY GUARDRAILS**
- Input validation prompts
- Output validation prompts
- Safety check prompts
- Relevance check prompts
- Consistency check prompts

**6. EVALUATION FRAMEWORK**
- Criteria for good outputs
- Scoring rubric
- Automated evaluation prompts
- Human evaluation workflow
- Feedback loop for improvement`,
        tags: ["prompts", "templates"]
      },
      {
        id: "ai-chat-implementation",
        title: "AI Chat/Copilot Feature Builder",
        prompt: `Build a complete AI chat or copilot feature for my SaaS:

PRODUCT: [YOUR PRODUCT]
COPILOT PURPOSE: [WHAT IT HELPS USERS DO]
DATA ACCESS: [WHAT DATA THE COPILOT CAN ACCESS]
ACTIONS IT CAN TAKE: [WHAT THE COPILOT CAN DO]

Design the complete system:

**1. CONVERSATIONAL DESIGN**
- Opening message
- Suggested prompts/questions
- Response length guidelines
- Personality and tone
- Handling off-topic requests
- Graceful "I don't know" responses
- Handoff to human support

**2. CONTEXT MANAGEMENT**
- What context to include with each message
- Conversation history length
- User profile data to include
- Product data to include
- How to summarize long conversations
- Session vs persistent memory

**3. FUNCTION CALLING / ACTIONS**
Define functions the AI can call:
\`\`\`typescript
{
  name: "function_name",
  description: "When to call this",
  parameters: {
    // JSON schema
  },
  handler: async (params) => {
    // Implementation
  }
}
\`\`\`
Create 10 useful functions for your copilot.

**4. UI/UX DESIGN**
- Chat widget placement
- Mobile experience
- Typing indicators
- Message streaming display
- Error state handling
- Loading states
- Minimize/expand behavior
- Notification badges

**5. BACKEND ARCHITECTURE**
- Message queue for reliability
- Conversation storage schema
- Rate limiting per user
- Concurrent request handling
- Caching strategy
- Analytics events to track

**6. SAFETY & MODERATION**
- Input content filtering
- Output content filtering
- PII detection and handling
- Prompt injection prevention
- Jailbreak prevention
- Audit logging

**7. ADVANCED FEATURES**
- Multi-turn planning
- Task decomposition
- Confirmation before actions
- Undo capabilities
- Learning from user corrections
- Proactive suggestions`,
        tags: ["chat", "copilot"]
      },
      {
        id: "rag-implementation",
        title: "RAG (Retrieval Augmented Generation) System",
        prompt: `Build a RAG system to give my AI access to my product's knowledge base:

KNOWLEDGE SOURCES:
- [LIST YOUR DOCS, HELP ARTICLES, ETC.]
QUERY TYPES: [WHAT USERS WILL ASK]
ACCURACY REQUIREMENTS: [HOW ACCURATE IT NEEDS TO BE]

Design the complete RAG system:

**1. DOCUMENT PROCESSING**
- Document ingestion pipeline
- Chunking strategy (size, overlap)
- Metadata extraction
- Document hierarchy handling
- Update/refresh strategy
- Multi-format support (PDF, HTML, etc.)

**2. EMBEDDING STRATEGY**
- Embedding model selection
- Batch processing approach
- Embedding storage (vector DB)
- Embedding update triggers
- Cost estimation
- Latency optimization

**3. RETRIEVAL SYSTEM**
- Semantic search implementation
- Hybrid search (keyword + semantic)
- Re-ranking approach
- Number of chunks to retrieve
- Relevance threshold
- Fallback when nothing relevant found

**4. CONTEXT AUGMENTATION**
- How to format retrieved context
- Context ordering (most relevant first)
- Source attribution
- Handling conflicting information
- Date/version awareness

**5. GENERATION WITH CONTEXT**
Complete prompt template:
\`\`\`
System: You are a helpful assistant with access to our knowledge base.

Context from our documentation:
{retrieved_chunks}

User question: {query}

Instructions:
- Answer based on the provided context
- Cite sources when possible
- Say "I don't have information about that" if context doesn't help
- Never make up information
\`\`\`

**6. EVALUATION & IMPROVEMENT**
- Retrieval quality metrics
- Answer quality metrics
- User feedback collection
- Failed query analysis
- Continuous improvement loop

**7. ADVANCED TECHNIQUES**
- Query expansion
- Hypothetical document embeddings (HyDE)
- Multi-hop reasoning
- Self-consistency checking
- Confidence scoring`,
        tags: ["rag", "knowledge-base"]
      }
    ]
  },
  {
    id: "devops",
    name: "Deployment & DevOps",
    icon: Rocket,
    description: "Deploy and operate your SaaS",
    prompts: [
      {
        id: "deployment-checklist",
        title: "Production Deployment Checklist",
        prompt: `Create a comprehensive deployment checklist for my SaaS:

TECH STACK: [YOUR STACK]
HOSTING: [WHERE YOU'RE DEPLOYING]
EXPECTED TRAFFIC: [USERS, REQUESTS PER SECOND]

Generate a complete checklist:

**PRE-DEPLOYMENT CHECKS**
□ All tests passing (unit, integration, e2e)
□ No critical security vulnerabilities in dependencies
□ Database migrations tested
□ Environment variables configured
□ Secrets properly stored (not in code)
□ Build process successful
□ Bundle size acceptable
□ No console errors/warnings
□ API documentation updated
□ Changelog updated

**INFRASTRUCTURE SETUP**
□ Production environment provisioned
□ SSL/TLS certificates configured
□ CDN configured for static assets
□ Database backups configured
□ Log aggregation set up
□ Error tracking configured (Sentry, etc.)
□ Uptime monitoring configured
□ Performance monitoring configured
□ Auto-scaling rules defined
□ Load balancer configured

**SECURITY CHECKLIST**
□ HTTPS enforced everywhere
□ Security headers configured (CSP, HSTS, etc.)
□ Rate limiting configured
□ DDoS protection enabled
□ SQL injection prevention verified
□ XSS prevention verified
□ CORS properly configured
□ Authentication tokens secure
□ Sensitive data encrypted
□ Admin routes protected

**DATABASE READINESS**
□ Indexes optimized for common queries
□ Connection pooling configured
□ Backup/restore tested
□ Migration rollback plan ready
□ Read replicas if needed
□ Data retention policies set

**MONITORING & ALERTING**
□ Application health endpoint
□ Database health monitoring
□ Error rate alerts
□ Latency alerts
□ Disk space alerts
□ Memory usage alerts
□ CPU usage alerts
□ Failed login alerts
□ Business metric alerts (signup, churn)
□ On-call rotation set

**ROLLBACK PLAN**
□ Previous version tagged
□ Database rollback scripts ready
□ Feature flags for quick disable
□ Communication plan for issues
□ Emergency contact list
□ Rollback tested

**POST-DEPLOYMENT VERIFICATION**
□ Smoke tests passing
□ Key user flows working
□ Payments processing
□ Emails sending
□ Third-party integrations working
□ Analytics tracking correctly
□ No error spikes
□ Performance baseline met`,
        tags: ["deployment", "checklist"]
      },
      {
        id: "ci-cd-pipeline",
        title: "CI/CD Pipeline Configuration",
        prompt: `Design a CI/CD pipeline for my SaaS:

TECH STACK: [YOUR STACK]
CODE HOSTING: [GITHUB, GITLAB, ETC.]
DEPLOYMENT TARGET: [VERCEL, AWS, ETC.]
TEAM SIZE: [NUMBER OF DEVELOPERS]

Create the complete pipeline:

**PIPELINE STAGES**

1. **CODE QUALITY (on every push)**
\`\`\`yaml
# Linting
# Type checking
# Code formatting check
# Dependency security scan
# Secret scanning
\`\`\`

2. **TESTING (on PR and main)**
\`\`\`yaml
# Unit tests with coverage
# Integration tests
# E2E tests (on PR only, or subset)
# Visual regression tests
# Performance benchmarks
\`\`\`

3. **BUILD (on main branch)**
\`\`\`yaml
# Production build
# Docker image creation
# Asset optimization
# Source map generation
# Version tagging
\`\`\`

4. **STAGING DEPLOYMENT (on main)**
\`\`\`yaml
# Deploy to staging
# Run smoke tests
# Performance tests
# Security scan
# Manual approval gate
\`\`\`

5. **PRODUCTION DEPLOYMENT (after approval)**
\`\`\`yaml
# Blue-green or canary deployment
# Database migrations
# Cache invalidation
# Health checks
# Rollback on failure
\`\`\`

**ENVIRONMENT CONFIGURATION**
- Environment variable management
- Secrets handling
- Configuration per environment
- Feature flags integration

**BRANCH STRATEGY**
- main = production
- develop = staging
- feature/* = development
- hotfix/* = emergency fixes
- PR requirements and protections

**NOTIFICATION SETUP**
- Build status in Slack/Discord
- Deployment notifications
- Failed build alerts
- Security alert escalation

**OPTIMIZATION TIPS**
- Caching strategies for faster builds
- Parallel test execution
- Incremental builds
- Artifact reuse
- Cost optimization

Provide complete configuration files for [YOUR CI PLATFORM].`,
        tags: ["ci-cd", "devops"]
      },
      {
        id: "monitoring-setup",
        title: "Production Monitoring & Alerting System",
        prompt: `Design a comprehensive monitoring system for my SaaS:

PRODUCT: [YOUR PRODUCT]
TECH STACK: [YOUR STACK]
CRITICAL USER FLOWS: [KEY ACTIONS THAT MUST WORK]
SLA TARGETS: [UPTIME, RESPONSE TIME GOALS]

Create the complete monitoring strategy:

**1. APPLICATION MONITORING**

Health Metrics:
- Request rate (per endpoint)
- Error rate (per endpoint)
- Latency (p50, p90, p99)
- Active users
- Background job status
- Queue depths
- Cache hit rates

Business Metrics:
- Signups per hour
- Conversions per hour
- Active sessions
- Feature usage
- Revenue (if applicable)

**2. INFRASTRUCTURE MONITORING**

Server Metrics:
- CPU utilization
- Memory utilization
- Disk usage and I/O
- Network throughput
- Container health
- Auto-scaling status

Database Metrics:
- Query performance
- Connection pool usage
- Replication lag
- Table sizes
- Slow queries
- Lock contention

**3. ALERTING RULES**

Immediate (Page on-call):
- Site completely down
- Error rate > 5%
- Database unreachable
- Payment processing failure
- Security breach detected

Urgent (Slack + email):
- Error rate > 1%
- Latency p99 > 5s
- Disk space > 80%
- Unusual traffic patterns
- Failed deployments

Warning (Daily digest):
- Latency increasing trend
- Error rate increasing trend
- Approaching resource limits
- Certificate expiring soon
- Dependencies outdated

**4. DASHBOARDS**

Executive Dashboard:
- Uptime percentage
- Key business metrics
- User growth
- Revenue metrics

Engineering Dashboard:
- Error rates by service
- Latency distributions
- Deployment history
- On-call incidents

Real-time Dashboard:
- Live request map
- Current error stream
- Active users now
- Resource utilization

**5. INCIDENT RESPONSE**

Runbooks for common issues:
- High error rate response
- Database issues response
- Third-party outage response
- Security incident response

Post-mortem template and process.`,
        tags: ["monitoring", "alerting"]
      }
    ]
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    icon: Shield,
    description: "Legal documents and compliance",
    prompts: [
      {
        id: "terms-of-service",
        title: "Terms of Service Generator",
        prompt: `Generate Terms of Service for my SaaS:

COMPANY NAME: [YOUR COMPANY]
PRODUCT NAME: [YOUR PRODUCT]
PRODUCT DESCRIPTION: [WHAT IT DOES]
PRICING MODEL: [HOW YOU CHARGE]
USER DATA COLLECTED: [WHAT DATA YOU STORE]
THIRD-PARTY SERVICES USED: [STRIPE, AWS, ETC.]
TARGET MARKET: [US, EU, GLOBAL]

Create comprehensive Terms of Service covering:

**1. INTRODUCTION & ACCEPTANCE**
- Who the agreement is between
- How agreement is formed
- Age requirements
- Capacity to contract

**2. ACCOUNT TERMS**
- Account creation requirements
- Account security responsibilities
- One account per person/entity
- Account termination rights

**3. SERVICE DESCRIPTION**
- What the service provides
- Service availability (uptime commitment)
- Service modifications (right to change)
- Beta features disclaimer

**4. PAYMENT TERMS**
- Pricing and billing
- Payment methods accepted
- Failed payment handling
- Refund policy
- Price change notification
- Subscription terms (if applicable)

**5. ACCEPTABLE USE POLICY**
- Permitted uses
- Prohibited uses (exhaustive list)
- Content restrictions
- Rate limits and fair use
- Consequences of violation

**6. INTELLECTUAL PROPERTY**
- Your ownership of the service
- User ownership of their data
- License grant to you for user content
- Feedback and suggestions
- DMCA / copyright policy

**7. DATA & PRIVACY**
- Reference to Privacy Policy
- Data processing terms
- Data security measures
- Data portability
- Data deletion rights

**8. DISCLAIMERS & LIMITATIONS**
- "As is" disclaimer
- No warranty of results
- Limitation of liability (cap at fees paid)
- Indemnification
- Force majeure

**9. TERMINATION**
- Termination by user
- Termination by you (for cause)
- Effect of termination
- Survival of terms

**10. DISPUTE RESOLUTION**
- Governing law
- Arbitration clause (if applicable)
- Class action waiver (if applicable)
- Jurisdiction

**11. GENERAL PROVISIONS**
- Entire agreement
- Severability
- Waiver
- Assignment
- Contact information
- Modification of terms

IMPORTANT: Add disclaimer that this should be reviewed by a lawyer.`,
        tags: ["legal", "terms"]
      },
      {
        id: "privacy-policy",
        title: "Privacy Policy Generator (GDPR/CCPA Compliant)",
        prompt: `Generate a Privacy Policy for my SaaS:

COMPANY NAME: [YOUR COMPANY]
PRODUCT NAME: [YOUR PRODUCT]
COMPANY LOCATION: [COUNTRY/STATE]
TARGET USERS: [US, EU, GLOBAL]
DATA COLLECTED:
- Personal info: [EMAIL, NAME, ETC.]
- Usage data: [WHAT YOU TRACK]
- Payment data: [WHAT YOU STORE]
THIRD-PARTY SERVICES:
- Analytics: [GOOGLE ANALYTICS, ETC.]
- Payments: [STRIPE, ETC.]
- Hosting: [AWS, ETC.]
- Email: [SENDGRID, ETC.]
COOKIES USED: [YES/NO, WHAT TYPES]

Create a comprehensive Privacy Policy:

**1. INTRODUCTION**
- Who you are (controller identity)
- What this policy covers
- Last updated date
- How to contact you about privacy

**2. INFORMATION WE COLLECT**
For each data type:
- What specific data
- Why we collect it (legal basis)
- Whether required or optional
- How long we keep it

Categories:
- Information you provide directly
- Information collected automatically
- Information from third parties

**3. HOW WE USE INFORMATION**
Purposes of processing:
- Provide the service
- Process payments
- Send communications
- Improve the service
- Marketing (with opt-out)
- Legal compliance

Legal bases (for GDPR):
- Contract performance
- Legitimate interests
- Consent
- Legal obligation

**4. HOW WE SHARE INFORMATION**
- Service providers (and their roles)
- Legal requirements
- Business transfers
- With your consent
- Never: selling data

**5. DATA RETENTION**
- How long for each data type
- Retention for legal purposes
- Deletion procedures

**6. DATA SECURITY**
- Security measures in place
- Encryption practices
- Employee access controls
- Incident response

**7. YOUR RIGHTS**
GDPR rights (if applicable):
- Access your data
- Correct your data
- Delete your data
- Port your data
- Object to processing
- Withdraw consent
- Lodge complaint with authority

CCPA rights (if applicable):
- Know what data collected
- Delete your data
- Opt-out of sale
- Non-discrimination

How to exercise rights.

**8. COOKIES & TRACKING**
- Types of cookies used
- Purpose of each
- How to manage preferences
- Third-party tracking
- DNT signals

**9. INTERNATIONAL TRANSFERS**
- Where data is processed
- Safeguards for transfers
- Adequacy decisions or SCCs

**10. CHILDREN'S PRIVACY**
- Minimum age
- COPPA compliance if applicable
- Parental consent procedures

**11. CHANGES TO POLICY**
- How you'll notify of changes
- Material changes handling

**12. CONTACT INFORMATION**
- Privacy contact email
- DPO info if applicable
- Physical address

IMPORTANT: Recommend review by privacy lawyer.`,
        tags: ["privacy", "gdpr", "ccpa"]
      },
      {
        id: "data-processing-agreement",
        title: "Data Processing Agreement (DPA) Template",
        prompt: `Generate a Data Processing Agreement for my SaaS:

COMPANY NAME: [YOUR COMPANY]
PRODUCT: [YOUR PRODUCT]
CUSTOMER TYPE: [B2B - WHO ARE YOUR CUSTOMERS]
DATA PROCESSED: [WHAT DATA YOU PROCESS ON BEHALF OF CUSTOMERS]
SUB-PROCESSORS: [THIRD PARTIES WHO ACCESS DATA]

Create a GDPR-compliant DPA:

**1. DEFINITIONS**
- Controller (customer)
- Processor (you)
- Data Subject
- Personal Data
- Processing
- Sub-processor
- Supervisory Authority

**2. SCOPE OF PROCESSING**
- Subject matter
- Duration
- Nature and purpose
- Types of personal data
- Categories of data subjects

**3. PROCESSOR OBLIGATIONS**
- Process only on documented instructions
- Ensure personnel confidentiality
- Implement security measures
- Assist with data subject requests
- Assist with compliance obligations
- Make available audit information
- Delete or return data on termination

**4. SECURITY MEASURES (ANNEX)**
Technical measures:
- Encryption standards
- Access controls
- Network security
- Data backup

Organizational measures:
- Employee training
- Access management
- Security policies
- Incident response

**5. SUB-PROCESSORS**
- Current sub-processor list
- Authorization process
- Notification of changes
- Sub-processor obligations
- Liability for sub-processors

**6. DATA TRANSFERS**
- Transfer mechanisms (SCCs if needed)
- Adequacy assessments
- Additional safeguards

**7. DATA SUBJECT RIGHTS**
- Assistance with requests
- Response timeframes
- Notification procedures

**8. DATA BREACHES**
- Notification timeline (72 hours)
- Information to provide
- Documentation requirements
- Cooperation obligations

**9. AUDIT RIGHTS**
- Scope of audits
- Notice requirements
- Confidentiality of audit
- Cost allocation

**10. LIABILITY**
- Limitation of liability
- Indemnification

**11. TERM AND TERMINATION**
- Duration
- Effect of termination
- Data return/deletion

**STANDARD CONTRACTUAL CLAUSES**
Include reference to or attachment of appropriate SCCs.

IMPORTANT: This must be reviewed by legal counsel.`,
        tags: ["dpa", "gdpr", "legal"]
      }
    ]
  },
  {
    id: "automation",
    name: "Automation & Workflows",
    icon: Plug,
    description: "Automate your SaaS operations",
    prompts: [
      {
        id: "workflow-automation",
        title: "Internal Workflow Automation Designer",
        prompt: `Design automated workflows for my SaaS operations:

MY PRODUCT: [YOUR PRODUCT]
TEAM SIZE: [NUMBER OF PEOPLE]
CURRENT MANUAL PROCESSES: [WHAT YOU DO MANUALLY]
TOOLS WE USE: [SLACK, EMAIL, NOTION, ETC.]

Design automations for:

**1. NEW USER ONBOARDING AUTOMATION**
Trigger: User signs up
Actions:
- Welcome email sequence timing
- Internal Slack notification
- CRM record creation
- Segment assignment
- Trial timeline setup
- Onboarding checklist creation
Provide complete Zapier/n8n workflow.

**2. PAYMENT & BILLING AUTOMATION**
Triggers and actions for:
- Successful payment → thank you + invoice
- Failed payment → retry sequence
- Subscription upgrade → team notification
- Subscription cancel → win-back sequence
- Trial ending → conversion sequence
- Invoice creation → send to customer

**3. SUPPORT AUTOMATION**
- Auto-categorize support tickets
- Route to right team member
- Auto-respond to common questions
- Escalation rules
- SLA tracking
- Satisfaction survey triggers

**4. CHURN PREVENTION AUTOMATION**
Monitor signals and trigger interventions:
- Decreasing login frequency
- Unused key features
- Support ticket sentiment
- Failed payments
- Explicit cancel intent
For each signal: monitoring method + intervention

**5. GROWTH AUTOMATION**
- Feature adoption campaigns
- Upsell triggers
- Referral program automation
- Review request timing
- Case study identification
- Testimonial collection

**6. INTERNAL OPERATIONS**
- Daily/weekly metrics reports
- Anomaly detection alerts
- Team standup reminders
- Customer anniversary notifications
- Renewal reminders
- License compliance tracking

For each automation:
- Trigger conditions
- Action sequence
- Tools to connect
- Error handling
- Testing approach`,
        tags: ["automation", "workflows"]
      },
      {
        id: "zapier-integrations",
        title: "Zapier/Integration Architecture",
        prompt: `Design a complete integration strategy for my SaaS:

MY PRODUCT: [YOUR PRODUCT]
WHAT DATA WE HAVE: [KEY EVENTS/DATA]
POPULAR TOOLS OUR USERS USE: [LIST TOOLS]

Create integration architecture:

**1. OUTGOING WEBHOOKS/TRIGGERS**
Events to expose:
| Event | Payload | Use Case |
| --- | --- | --- |
| user.created | {id, email, name} | Add to CRM |
| payment.completed | {amount, customer} | Update accounting |
(List 15-20 useful events)

For each event:
- When it fires
- Data payload structure
- Retry strategy
- Documentation example

**2. INCOMING WEBHOOKS/ACTIONS**
Actions to accept:
| Action | Required Data | Result |
| --- | --- | --- |
| create_user | {email, name} | New user created |
| update_subscription | {user_id, plan} | Plan changed |
(List 15-20 useful actions)

For each action:
- Required vs optional fields
- Validation rules
- Success/error responses
- Rate limits

**3. NATIVE INTEGRATIONS TO BUILD**
Priority integrations based on user demand:

Tier 1 (Must have):
- [Integration 1]: Use case, implementation approach
- [Integration 2]: Use case, implementation approach
- [Integration 3]: Use case, implementation approach

Tier 2 (Should have):
(List 5 more)

Tier 3 (Nice to have):
(List 5 more)

For each:
- OAuth vs API key authentication
- Data sync approach (real-time vs batch)
- Error handling
- User setup flow

**4. EMBEDDED INTEGRATION PLATFORM**
Options to evaluate:
- Zapier Partner Program
- Tray.io embedded
- Workato
- Building custom

Decision framework:
- Cost analysis
- User experience
- Maintenance burden
- Feature completeness

**5. API DESIGN FOR INTEGRATIONS**
Best practices for developer-friendly API:
- Authentication options
- Rate limiting strategy
- Versioning approach
- Documentation standards
- SDK/client libraries
- Sandbox environment`,
        tags: ["integrations", "zapier"]
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
            {prompt.title}
          </span>
        </div>
        {!isLocked && (
          <div className="flex items-center gap-2">
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
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
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
            isLocked ? "bg-slate-100" : "bg-primary/10"
          )}>
            <Icon className={cn("w-5 h-5", isLocked ? "text-slate-400" : "text-primary")} />
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

export default function PromptPack() {
  const { user, isAuthenticated } = useAuth();
  const { testMode } = useTestMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Allow access if authenticated OR in test mode
  const canView = isAuthenticated || testMode;

  // Check if user has purchased the prompt pack OR in test mode
  const hasAccess = (user as any)?.promptPackPurchased === true || testMode;

  // If not authenticated and not in test mode, show login prompt
  if (!canView) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h1>
          <p className="text-slate-600 mb-6">
            Please log in to access the Prompt Pack.
          </p>
          <a href="/api/login">
            <Button className="w-full">Log In</Button>
          </a>
        </Card>
      </div>
    );
  }

  // Total prompts count
  const totalPrompts = PROMPT_CATEGORIES.reduce((acc, cat) => acc + cat.prompts.length, 0);

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
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {totalPrompts}+ Advanced Prompts
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              The SaaS Builder's Prompt Pack
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {hasAccess
                ? "Your complete library of battle-tested prompts for building, launching, and growing your SaaS."
                : `Unlock instant access to ${totalPrompts} advanced prompts covering every aspect of building a successful SaaS business.`}
            </p>
          </div>

          {/* Unlock CTA (if locked) */}
          {!hasAccess && (
            <Card className="p-6 mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Unlock All {totalPrompts} Prompts</h3>
                    <p className="text-slate-600">One-time purchase, lifetime access</p>
                  </div>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={isCheckingOut}
                  size="lg"
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      Unlock for $49
                      <Sparkles className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Categories */}
          <div className="space-y-4">
            {PROMPT_CATEGORIES.map(category => (
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
                Stop wasting time writing prompts from scratch.
              </p>
              <Button
                onClick={handlePurchase}
                disabled={isCheckingOut}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-bold"
              >
                {isCheckingOut ? "Processing..." : "Unlock All Prompts - $49"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Copied toast */}
      {copiedToast && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-4 h-4 text-green-400" />
          Prompt copied to clipboard
        </div>
      )}
    </div>
  );
}
