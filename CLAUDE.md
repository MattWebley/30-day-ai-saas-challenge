# Project: 21 Day AI SaaS Challenge

## Rules for Claude (Always Follow)

### Core Rules
- Read this file at the start of every session
- Update Session Log at the end of every session
- Commit working code before starting edits
- Create a new branch if changes may break functionality
- Do not remove working features unless explicitly instructed
- Run `npm run check` after edits to verify TypeScript

### Dev Server (CRITICAL)
- **NEVER run `npm run dev` in background mode** - causes stale processes blocking port 5000
- If port 5000 blocked: `fuser -k 5000/tcp`
- Let user start dev server via Replit's Run button when possible

### Design System (CRITICAL)
Uses **Minimal Clean** design system in `/client/src/lib/design-system.ts`.

- **Cards**: `bg-white`, `border-2 border-slate-200`, use `<Card>` component
- **Info boxes**: `bg-slate-50` with `border-2 border-slate-200` - NO colored backgrounds
- **Interactive options**: White bg, slate border default, primary border when selected
- **Success states**: Green text (`text-green-600`) only, not green backgrounds

### Typography (CRITICAL)
Interactive components MUST match lesson text styling:

- **Body text**: `text-slate-700` (NOT text-sm, NOT text-slate-600)
- **Card headers**: `text-lg font-bold text-slate-900`
- **Labels/emphasis**: `text-slate-700 font-medium`
- **Hint/secondary**: `text-slate-600`
- **Page titles**: `text-2xl font-extrabold text-slate-900`

**NEVER use `text-sm` for body text. NEVER use `text-slate-500` for readable content.**

---

## Project Overview

A gamified 21 Day AI SaaS Challenge guiding users from idea to launch-ready product through daily micro-tasks.

### Challenge Structure
- **Days 0-4**: Idea & Planning (Start, Idea, Validate, Features, Name)
- **Day 5**: Logo
- **Days 6-9**: Prepare (Tech Stack, PRD, Claude Code setup, Master Claude Code)
- **Days 10-18**: Build (AI Brain, Brand, APIs, Auth, Email, Mobile, Admin, MVP)
- **Days 19-21**: Launch (Sales Machine, Launch Plan, Launch Day)

### Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Radix UI, Wouter, TanStack Query
- **Backend**: Node.js, Express, Passport.js, Express Session
- **Database**: PostgreSQL, Drizzle ORM
- **AI**: OpenAI
- **Real-time**: WebSockets

### Project Structure
```
/client          - Frontend React app (/src for components, pages, hooks)
/server          - Express backend (/routes for API handlers)
/shared          - Shared TypeScript types
drizzle.config.ts, vite.config.ts, components.json
```

---

## Day Page Format (CRITICAL)

Every day in Dashboard.tsx MUST follow:
1. Header (automatic)
2. Matt Webley's Tip (automatic)
3. DayInstructions (automatic)
4. Today's Lesson (Step 1) - from `dayData.lesson`
5. Interactive Component (Step 2) - day-specific component

```tsx
) : currentDay === X ? (
  <>
    {dayData.lesson && (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
          <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
        </div>
        <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
          <div className="prose prose-slate max-w-none">
            {dayData.lesson.split('\n\n').map((p: string, i: number) => (
              <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0">{p}</p>
            ))}
          </div>
        </Card>
      </div>
    )}
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
        <h2 className="font-bold text-xl text-slate-900">Action Title</h2>
      </div>
      <DayXComponent ... />
    </div>
  </>
```

Lessons stored in `seed.ts`, written in Matt's punchy style (ALL CAPS emphasis, short sentences).

---

## Current Status
- **Status**: In Progress
- **Last Session**: 2026-01-20 (Day 5 & 6 overhaul)
- **Branch**: main
- **Repo**: MattWebley/30-day-ai-saas-challenge

## Pending Tasks
- [x] **Set up Stripe** - DONE: Keys added, checkout working
- [ ] Test AI Mentor chat bot (check browser console)
- [ ] Test Showcase feature end-to-end
- [ ] Test Day 0 → Day 1 → Day 2 flow
- [ ] Test Day 8-21 components
- [ ] Add Namecheap affiliate ID to Day4Naming.tsx
- [ ] Add coaching call booking links (Days 1-7, 19-21)
- [ ] Enable "Book a Call" button in Day 2 (needs Calendly link)
- [ ] Before launch: Set testMode to false in TestModeContext.tsx
- [ ] Add VSL video (placeholder added, needs actual video/thumbnail)
- [ ] Consider adding a cheaper bump offer ($27-67 range) for higher conversion

## Known Issues
- Day 1 completion may not work - debug logging added
- AI Mentor chat bot reported not working - improved error handling added

---

## Development Rules

### Code Style
- TypeScript strict mode
- React 19 best practices (hooks, functional components)
- Tailwind CSS for styling
- Radix UI for primitives

### Database
- Drizzle ORM for all operations
- `npm run db:push` after schema changes

### API
- Proper error handling on all routes
- Zod for validation
- REST conventions
- Session auth via Passport.js

### Commands
- `npm run dev` - Full development
- `npm run dev:client` - Frontend only
- `npm run check` - TypeScript verification

---

## Session Log

### Summary of Major Milestones (Dec 2025 - Jan 2026)
- **Dec 13**: Initial CLAUDE.md setup, GitHub connection
- **Dec 19**: Day 2-3 improvements, UI redesign
- **Dec 30**: Restructured 30 days → 21 days, battle pass progress tracker
- **Jan 2**: Day 0 "Start Here" onboarding, Day 8-21 component overhaul
- **Jan 3**: My Progress page, Report Problem feature, Day 2 redesign
- **Jan 5**: Showcase feature, admin chat management
- **Jan 8-9**: Badge system overhaul, major day reordering (Days 10-16)
- **Jan 11**: Typography unification, design system update
- **Jan 12**: Build section restructure, admin comment delete, AI Mentor fix
- **Jan 13**: Video Slides feature, Days 14-21 restructure, curriculum finalization

### 2026-01-14 - Day 19-21 Polish
- Day 19: Personalized sales page prompts with challenge data
- Day 20: Replaced 15-item checklist with simple "pick 1-3 channels" (~35 strategies)
- Day 21: Streamlined to income calculator → vision → CTA → complete
- Fixed Day 20 being a blocker before finish line

### 2026-01-15 - Landing Page Overhaul & VSL Setup
- **Tasks Completed:**
  - Condensed CLAUDE.md from 1085 to 174 lines (84% reduction)
  - Added VSL placeholder section with play button, duration badge, thumbnail support
  - Moved VSL directly under headline (better conversion placement)
  - Moved dashboard screenshot to "The Solution" section with caption
  - Added "built this app with same system" proof point (dark callout box)
  - Added pause button / flexible timing messaging
  - Wrote 3 different VSL script options for user
- **Fixes Applied:**
  - Fixed "10+ years" → "8+ years" inconsistency in Landing.tsx
  - Removed "battle pass" mentions from Landing page (2 spots)
  - Updated AI tools cost from "$20" to "<$100 for whole challenge"
  - Increased testimonial photos size (James, Jack, Tim: w-14 → w-20)
  - Removed em dash from proof point copy
- **Notes for Next Session:**
  - Stripe setup ready to go - user needs to add API keys to Replit Secrets
  - Keys needed: STRIPE_SECRET_KEY (sk_test_...) and STRIPE_PUBLISHABLE_KEY (pk_test_...)
  - Pricing: £295 / $399 USD one-time payment, 12 months access
  - VSL placeholder live - needs actual video/thumbnail when recorded

### 2026-01-16 - Day 21 & Seed Fixes
- **Tasks Completed:**
  - Rewrote Day 21 "So Many Ways To Get There" section (income calculator)
  - Removed old "Put That In Perspective" copy (small town Facebook group analogy)
  - Added 22-item bulleted list of customer acquisition strategies (two-column layout)
  - Balanced automation messaging (~75% achievable, ~25% AI-powered)
  - Added "...and that's just scratching the surface" abundance messaging
  - Reviewed all 22 days of lessons for structure/content alignment
- **Fixes Applied:**
  - Day 7: Changed phase from "Idea & Planning" → "Prepare" (was misaligned)
  - Day 12: Removed "It's 2025" reference (now evergreen)
  - Day 12: Added "OTHER OPTIONS" section mentioning Claude API, Gemini as alternatives to OpenAI
- **Notes for Next Session:**
  - All lessons reviewed and aligned with challenge structure
  - Stripe setup still pending (user needs to add API keys)

### 2026-01-16 (Session 2) - Video Lesson Integration
- **Tasks Completed:**
  - Added Loom video embed support with modal player for all days (0-21)
  - Day 0 has real Loom video: `420c8729c9d544c3a265ea8273fe797e`
  - Days 1-21 have placeholder URLs (ready for real videos)
  - Video thumbnails integrated into "Today's Lesson" card (uniform across all days)
  - Loading bar animation while video loads
  - Hover effect on play button
  - Created `useStepWithScroll` hook for better multi-step UX (auto-scrolls on step change)
  - Applied scroll hook to all 22 day components
- **Fixes Applied:**
  - Removed diagonal slide animation from dialogs (cleaner fade/zoom only)
  - Header "Watch Lesson" button commented out (video now in lesson area)
- **How to Add Videos:**
  - Edit `lessonVideos` map in Dashboard.tsx (line ~78)
  - Format: `1: "https://www.loom.com/embed/VIDEO_ID"`

### 2026-01-16 (Session 3) - Stripe Checkout & Order Page
- **Tasks Completed:**
  - Created `/order` page with ClickFunnels-style checkout flow
  - Currency toggle with flag emojis (🇺🇸 USD $399 / 🇬🇧 GBP £295)
  - Order summary box with dynamic totals
  - Guarantee section matching sales page promise
  - Trust signals (SSL, Stripe badges)
  - Updated all Landing.tsx CTAs to link to /order (removed direct Stripe calls)
  - Cleaned up unused checkout state/functions from Landing.tsx
  - Added 1:1 Coaching Call bump offer ($299 USD / £195 GBP)
  - Bump shows strikethrough regular price ($1,200 / £995)
  - Backend updated to handle bump in checkout session
- **Fixes Applied:**
  - Fixed CTA button hover effects (changed nested `<a><button>` to styled `<a>`)
  - Darkened subheadline text color (slate-700 → slate-900)
  - Fixed email address on order page (.co.uk → .com)
  - Redesigned order page header (removed dark banner, added clean pill badge)
  - Updated cancel_url to go back to /order instead of /
- **Stripe Price IDs:**
  - Main challenge USD: `price_1SqGYdLcRVtxg5yV9eeLLOJK`
  - Main challenge GBP: `price_1SqGYdLcRVtxg5yVgbtDKL7S`
  - Bump USD: `price_1SqHNdLcRVtxg5yVD8k1VxJg`
  - Bump GBP: `price_1SqHNdLcRVtxg5yVVFNyNhGa`
- **Notes for Next Session:**
  - Test full checkout flow: Landing → Order → Stripe → Success
  - Consider adding a cheaper bump offer ($27-67) for higher conversion rates
  - Current bump at $299 is 75% of main price (best practice is 20-40%)
  - Cheaper bump ideas: Prompt library, templates, checklists, community access

### 2026-01-17 - Video Thumbnail Styling
- **Tasks Completed:**
  - Added Loom thumbnail support for video lessons (Days 0-21)
  - Created `lessonThumbnails` map for explicit thumbnail URLs (Loom URLs have unpredictable hash suffixes)
  - Added Day 0 thumbnail: `420c8729c9d544c3a265ea8273fe797e-49b24f08ffb05d98.jpg`
  - Applied gradient overlay to all 23 video thumbnails (22 dashboard + 1 landing VSL)
  - Gradient: `from-black/20 via-transparent to-black/60` (darkens top/bottom, clear middle)
  - Changed fallback background from black (`bg-slate-900`) to light gray (`bg-slate-200`)
  - Unified play button styling: `bg-white/90` with hover scale effect
- **Fixes Applied:**
  - Removed "Click to play video" text from all video thumbnails (redundant with play button)
  - Landing page VSL now matches dashboard video thumbnail styling
- **How to Add Thumbnails:**
  - Go to `https://www.loom.com/share/VIDEO_ID`
  - View page source, find `og:image` meta tag
  - Add URL to `lessonThumbnails` map in Dashboard.tsx (~line 105)
- **To Revert Gradient Overlay:**
  - Search for `GRADIENT OVERLAY` comment and delete those div elements (23 total)
- **Notes for Next Session:**
  - Days 1-21 still need real Loom videos and thumbnails
  - Test video thumbnail display on Day 0 (should show your face/screen from the Loom recording)

### 2026-01-17 (Session 2) - Email Confirmations & Checkout Flow Fixes
- **Tasks Completed:**
  - Implemented full checkout flow with login requirement
  - Added purchase verification (marks `challengePurchased`, `promptPackPurchased`, `launchPackPurchased` in DB)
  - One-click upsell for coaching (uses saved payment method from initial checkout)
  - Currency-aware upsell page (reads currency from URL, shows correct pricing)
  - Created Welcome page with confetti celebration after purchase
  - Set up Resend email service via Replit connector
  - Purchase confirmation emails (sent after successful checkout)
  - Coaching confirmation emails (sent after successful upsell)
  - Added test mode toggle button (top-right corner) for previewing upsell pages
  - Added "Skip to Upsell" button on Order page (test mode only)
- **Schema Changes:**
  - Added to users table: `challengePurchased`, `promptPackPurchased`, `launchPackPurchased`, `coachingPurchased`, `stripeCustomerId`
- **New Files:**
  - `server/emailService.ts` - Resend email integration with HTML templates
  - `client/src/pages/Welcome.tsx` - Post-purchase celebration page
  - `client/src/pages/CoachingUpsell.tsx` - Coaching upsell page
- **Fixes Applied:**
  - Removed green CTA button from bottom of Landing page
  - Changed footer company name to "Webley Global - FZCO, Dubai"
  - CoachingUpsell redirects to /welcome instead of /dashboard
  - CoachingUpsell checks if user already has coaching (redirects to dashboard)
- **Email Setup:**
  - Uses Replit's Resend connector (auto-configured)
  - From email: `info@rapidwebsupport.com`
  - Emails include: order summary, currency-correct pricing, next steps, CTA
- **Notes for Next Session:**
  - Test full flow: Order → Stripe → CheckoutSuccess → CoachingUpsell → Welcome
  - Bump offer Stripe price IDs still need to be created (Sales Letter Pack, Launch Pack)
  - Port 5000 conflicts may occur - use Replit Stop/Run to clear

### 2026-01-19 - Day 0-1 Improvements & Sidebar Fix
- **Tasks Completed:**
  - Day 1: Added "I Already Have Ideas" option - users can now enter their own ideas OR use AI generation
  - Day 1: Removed 3-5 idea requirement - users can proceed with just 1 idea (encouraged to add more)
  - Day 1: Updated completion message to work for both paths ("ideas locked in" vs "generated 28 ideas")
  - Day 1: Added B2B vs B2C tip to lesson ("B2B is almost ALWAYS a better starting point")
  - Day 0: Added explanatory text under "The Rules for Success" heading
  - Sidebar: Fixed phase display - now shows current phase (Idea/Plan/Build/etc) instead of next milestone
  - Sidebar: Updated milestone definitions to align with actual phase boundaries
- **Fixes Applied:**
  - Removed all "3-5 ideas" requirements from Day 1 (now 1+ ideas allowed)
  - Fixed "Select Your Top 3-5 Ideas" → "Select Your Favorites"
  - Updated outcome text in seed.ts to be path-agnostic
  - Re-seeded database twice to apply lesson/message changes

### 2026-01-19 (Session 2) - Day 4 Overhaul & Navigation Fixes
- **Tasks Completed:**
  - Day 4: Completely rebuilt name generation with better prompt using user's idea, pain points, features
  - Day 4: Added trademark check section with UK/US search links (shown BEFORE confirming name)
  - Day 4: Added social handles preview in confirm step (all platforms: Twitter, Instagram, YouTube, Facebook, LinkedIn, TikTok)
  - Day 4: Removed GitHub from social platforms (not needed for SaaS)
  - Day 4: Removed Personal/Founder naming option (not relevant for SaaS)
  - Day 4: Made registration checklist rows fully clickable (not just the circle)
  - Day 4: Removed requirement to register anything before completing day
  - Day 4: Simplified complete step to just be a tracking checklist (removed duplicate trademark section)
  - Day 4: Added "can't get every handle" tip about using variations
  - Day 4: Updated lesson to mention links are coming in exercise
  - Day 2: Added "I help X solve Y" statement input
  - Coaching page: Added single session option (£349/$449) with British coach branding
  - Coaching page: Added USD/GBP currency toggle
  - Sidebar: Fixed locked days - now properly prevents navigation with visual feedback
  - Sidebar: Test mode now bypasses all day locking
- **Fixes Applied:**
  - Fixed .com.com bug (now strips existing .com before adding)
  - Fixed name generation not changing (added temperature=1.0 to OpenAI, better prompt with timestamp)
  - Removed all em dashes from codebase (replaced with regular dashes)
  - Removed "killer" from all user-facing text (changed to "winning"/"standout")
  - Updated DayInstructions for Days 2, 3, 4, 19 to match components
  - Fixed Day 3 instructions (removed pitch/ICP that wasn't in component)
  - Changed "Killer feature" → "Standout feature" in BuildLog
- **Files Modified:**
  - `client/src/components/Day4Naming.tsx` - Major overhaul
  - `client/src/components/Day2IdeaValidator.tsx` - Added I help statement
  - `client/src/components/DayInstructions.tsx` - Updated days 2,3,4,19
  - `client/src/components/layout/Sidebar.tsx` - Fixed locking, test mode bypass
  - `client/src/pages/Coaching.tsx` - Single session, currency toggle
  - `client/src/pages/BuildLog.tsx` - Standout feature label
  - `client/src/pages/SalesLetterPack.tsx` - Removed em dashes
  - `server/routes.ts` - Added temperature=1.0 to AI endpoint, single coaching checkout
  - `server/seed.ts` - Updated Day 4 lesson, naming approaches, removed GitHub/killer
- **Notes for Next Session:**
  - Test Day 4 name generation - should now give different names each time
  - Test sidebar navigation with test mode on/off
  - Continue testing from Day 5 onwards
  - Server restart required for AI temperature change to take effect

### 2026-01-20 - Day 5 Logo & Day 6 Tech Stack Overhaul
- **Day 5 Logo - Complete Restructure:**
  - Changed to AI-first approach (removed "choose logo type" step)
  - Step 1: Pick brand vibe + colors → generates AI prompt
  - Step 2: Create with AI tools or fallback options
  - Removed specific AI tool recommendations (they change too fast)
  - Added two clear options: "Use what you already have" OR "Try Abacus AI"
  - Added collapsible fallback section with 6-step Canva text logo guide
  - Added Fiverr outsourcing option ($5-20)
  - Updated color picker with popular schemes (Classic Blue, Bold Red, Fresh Green, etc.)
  - Added gradient options (Sunset, Ocean, Aurora - like Instagram/Stripe)
  - Added "Other" option with custom color text input
  - AI prompt now adapts for gradients vs flat colors
  - Removed premature "Add to Replit" instructions (they don't have Replit yet)
- **Day 6 Tech Stack - Simplified & Enhanced:**
  - Essential tools: Replit + Claude Pro only (everything else optional)
  - Clarified roles: Replit = dev environment with fallback AI, Claude Code = the powerhouse
  - Added "Click the checkbox when you've set up each tool" instruction
  - Added "$500/hr business advisor that's FREE" messaging
  - Added 4 prompt templates for different situations:
    - 🔧 Fixing a Problem
    - 🧠 Need Advice / Hive Mind
    - 🤔 How Do I...
    - 👀 Review My Approach
  - Added "Coming soon" note about Claude Code having full context
  - Added "play around but don't get distracted" note
  - Improved continue button section with clear status indicators
  - Updated Abacus.AI description: video gen, text-to-speech, image gen, assets
- **Dashboard - Lesson Link Support:**
  - Added `parseLinks()` helper function to render markdown-style links
  - Lessons can now include `[text](url)` links that open in new tabs
  - Applied to all lesson paragraph rendering
- **Seed.ts Updates:**
  - Day 5 lesson: Added links to Abacus AI, Canva, Fiverr
  - Day 5 lesson: Updated to match new AI-first approach
  - Day 6 lesson: Simplified to "two tools only" message
  - Day 6: Updated descriptions for clarity
  - Removed all Notion references (using Google examples instead)
- **Files Modified:**
  - `client/src/components/Day5Logo.tsx` - Complete rewrite
  - `client/src/components/Day5TechStack.tsx` - Major enhancements
  - `client/src/components/DayInstructions.tsx` - Updated Day 5 & 6
  - `client/src/components/VideoSlides.tsx` - Updated Day 5 & 6 slides
  - `client/src/pages/Dashboard.tsx` - Added parseLinks() for lesson links
  - `server/seed.ts` - Day 5 & 6 lesson content updates
- **Notes for Next Session:**
  - Test Day 5 logo flow end-to-end
  - Test Day 6 tech stack checkboxes and continue flow
  - Test prompt copy buttons work correctly
  - Verify lesson links open in new tabs
  - Continue testing Days 7+ onwards

### 2026-01-20 (Session 2) - Day 6 & 7 PRD Overhaul
- **Day 6 Tech Stack Consolidation:**
  - Merged duplicate "$500/hr business advisor" sections into one
  - Combined the business use cases list with the prompt templates section
  - Removed separate Step 3 from Dashboard (now all in Day5TechStack component)
- **Day 7 PRD - Major Overhaul:**
  - Changed Day 7 tip from ChatGPT recommendation to Claude/PRD explanation
  - Updated VideoSlides to recommend Claude instead of ChatGPT for PRD
  - PRD now uses ALL data from previous days: name, idea, value prop, pain points, features, USP, brand vibe
  - Added two required questions: Customer Avatar and Look & Feel
  - Made "Everything We Know So Far" section editable (Edit button toggles input fields)
  - Added big prominent download section with large icon
  - Changed download from .md to .txt (PRD.txt) for better Replit compatibility
  - Added "How to Use Your PRD" steps with Replit link
  - Added cost warning about Replit (let it build, then STOP - switch to Claude Code)
  - Button now says "I've Pasted My PRD Into Replit" to complete day
  - Removed duplicate Replit cost warning from Dashboard
- **Files Modified:**
  - `client/src/components/Day5TechStack.tsx` - Consolidated $500/hr advisor section
  - `client/src/components/Day6SummaryPRD.tsx` - Major rewrite with editable data, new questions, download flow
  - `client/src/components/VideoSlides.tsx` - Changed ChatGPT to Claude for Day 7
  - `client/src/pages/Dashboard.tsx` - Pass all data to PRD component, removed duplicate warning
  - `server/routes.ts` - PRD generation now uses customerAvatar, lookAndFeel, all previous data
  - `server/seed.ts` - Updated Day 7 tip and lesson content
- **Notes for Next Session:**
  - Test Day 7 PRD generation flow end-to-end
  - Test editable "Everything We Know" section
  - Verify PRD.txt download works
  - Test Day 8+ flow (Claude Code setup)
  - Database was re-seeded - may need to re-seed again if testing
