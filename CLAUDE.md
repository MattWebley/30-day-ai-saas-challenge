# Project: 21-Day AI SaaS Challenge

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

A gamified 21-Day AI SaaS Challenge guiding users from idea to launch-ready product through daily micro-tasks.

### Challenge Structure
- **Days 0-4**: Idea & Planning (Start, Idea, Validate, Features, Name)
- **Day 5**: Logo
- **Days 6-9**: Prepare (Tech Stack, PRD, Claude Code setup, Master Claude Code)
- **Days 10-18**: Build (AI Brain, Brand, APIs, Auth, Email, Mobile, Admin, MVP)
- **Days 19-21**: Launch (Sales Machine, SEO & AI Search, $100K Roadmap)

### Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Radix UI, Wouter, TanStack Query
- **Backend**: Node.js, Express, Passport.js, Express Session
- **Database**: PostgreSQL, Drizzle ORM
- **AI**: Claude Sonnet (all AI features - single API key)
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
- **Last Session**: 2026-01-30 (One-click upsell fixes, Stripe debugging)
- **Branch**: main
- **Repo**: MattWebley/30-day-ai-saas-challenge

## Pending Tasks
- [x] **Set up Stripe** - DONE: Keys added, main challenge checkout working
- [x] **Test Mode** - DONE: Defaults to false, toggle moved to Admin panel
- [x] **Launch Pack** - REMOVED: Entire feature removed
- [x] **Prompt Pack** - REMOVED: Orphaned code deleted
- [x] **Add VSL video** - DONE: Vimeo embed added to landing page
- [x] **Email System** - DONE: Plain text emails, 5 types working
- [x] **Stripe Price IDs** - DONE: All 5 products configured (10 price IDs)
- [x] **AI Protection System** - DONE: Rate limiting, abuse detection, logging
- [x] **AI Setup** - DONE: All AI now uses Claude Sonnet (single API key: ANTHROPIC_API_KEY)
- [x] **Day 0 Video** - DONE: Loom video added
- [x] **Day 1 Video** - DONE: Loom video added
- [ ] Test AI Mentor chat bot (now on Claude API)
- [ ] Test Showcase feature end-to-end
- [ ] Test Day 0 → Day 1 → Day 2 flow
- [ ] Test email delivery (use admin test endpoint)
- [ ] Add Namecheap affiliate ID to Day4Naming.tsx
- [ ] Add coaching call booking links (Days 1-7, 19-21)
- [ ] Enable "Book a Call" button in Day 2 (needs Calendly link)

### PRE-LAUNCH BLOCKERS (DO THESE BEFORE GOING LIVE)
- [ ] **CRITICAL: Create Stripe products** - 5 products × 2 currencies = 10 price IDs
- [ ] **CRITICAL: Set up challenge.mattwebley.com/waitlist** - Day 21 CTA 404s
- [ ] **CRITICAL: Set up mattwebley.com/readiness page** - Readiness Review CTA

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

*See CLAUDE_ARCHIVE.md for sessions from Jan 14-27, 2026*

### 2026-01-28 - AI Protection System & Hybrid AI Setup
- **Tasks Completed:**
  - **My Progress Page Redesign:**
    - Timeline view with phases matching challenge structure (Start, Idea, Plan, Prepare, Build, Launch)
    - Fixed badges showing 0 (was using wrong data source)
    - Fixed days showing 22 instead of 21 (excluded Day 0 from count)
    - Added `hasStarted` check to show timeline only after first day completed
  - **Current Task Button Fix:**
    - Now redirects to `lastCompletedDay + 1` instead of Day 0
  - **Stripe Price IDs Added:**
    - All 5 products configured with real price IDs (USD + GBP = 10 total)
    - Coaching Single Expert, 4-Pack Expert, Single Matt, 4-Pack Matt, Video Critique
  - **Coaching Success Page Created:**
    - New `/coaching/success` page with product-specific messaging
  - **Component Rename:**
    - Renamed `Day19MobileReady.tsx` → `Day16MobileReady.tsx` for clarity
  - **AI Mentor Chatbot Overhaul:**
    - Rewrote system prompt with complete 21-day curriculum
    - Strict scope boundaries (only helps with challenge topics)
    - Switched from OpenAI to Claude API
  - **Comprehensive AI Protection System:**
    - Created `/server/aiService.ts` with:
      - Rate limiting per endpoint type (chat: 20/hr, ideaGen: 5/hr, features: 10/hr, general: 15/hr)
      - Abuse pattern detection (7 patterns: prompt injection, jailbreaks, etc.)
      - Email alerts for abuse attempts (`sendAbuseAlertEmail`)
      - Usage logging to database (`aiUsageLogs` table)
    - Admin endpoints for viewing AI usage (`/api/admin/ai-usage`, `/api/admin/ai-usage/stats`)
  - **Hybrid AI Configuration (Cost Optimization):**
    - **Claude Sonnet** (premium): AI Mentor Chat, PRD Generation
    - **GPT-4o-mini** (cheap): All other 9 endpoints
    - Estimated ~90% cost reduction on bulk AI calls
    - Both providers share same rate limiting and abuse detection
- **Files Created:**
  - `server/aiService.ts` - Centralized AI service with protections
  - `client/src/components/Day16MobileReady.tsx` - Renamed from Day19
  - `client/src/pages/CoachingSuccess.tsx` - Coaching thank you page
- **Files Modified:**
  - `server/routes.ts` - Updated all 11 AI endpoints to use aiService, added admin AI usage endpoints
  - `server/storage.ts` - Added AI usage logging functions
  - `server/emailService.ts` - Added abuse alert email function
  - `shared/schema.ts` - Added `aiUsageLogs` table
  - `client/src/pages/BuildLog.tsx` - Timeline redesign
  - `client/src/pages/Dashboard.tsx` - Current task redirect fix, component rename
  - `client/src/App.tsx` - Added coaching success route
- **Files Deleted:**
  - `client/src/components/Day19MobileReady.tsx` - Renamed to Day16
- **Database:**
  - Pushed new `aiUsageLogs` table schema
- **AI Endpoint Distribution:**
  | Provider | Endpoints |
  |----------|-----------|
  | Claude Sonnet | AI Mentor Chat, PRD Summary, PRD Full |
  | GPT-4o-mini | Idea Gen, AI Prompts, Design Analysis, Competitor Research, USP Features, Core Features, Shared Features, MVP Roadmap, AI Answers, A/B Headlines |
- **Notes for Next Session:**
  - Test AI Mentor chat (now on Claude)
  - Test AI protection (try "ignore all instructions" to trigger abuse alert)
  - Check admin panel for AI usage logs after making AI requests
  - Both ANTHROPIC_API_KEY and OPENAI_API_KEY must be set in Replit Secrets

### 2026-01-28 (Session 2) - Day 0 Fix, Videos, Claude-Only AI
- **Tasks Completed:**
  - **Fixed Day 0 Not Loading:**
    - Bug in `useDays.ts`: `enabled: day > 0` excluded Day 0
    - Changed to `day >= 0` to include Day 0
    - Also fixed `day ?` to `day !== undefined` (0 is falsy in JS)
  - **Added Loom Videos:**
    - Day 0: `https://www.loom.com/embed/dac0eedf4efa4f1e83aca36cadab00ef`
    - Day 1: `https://www.loom.com/embed/a333ecd106db43d591eedb1e9fbf5f4b`
  - **Switched All AI to Claude:**
    - Removed hybrid setup (was Claude + GPT-4o-mini)
    - All 13 AI endpoints now use `callClaude` instead of `callGPT`
    - Only need `ANTHROPIC_API_KEY` in Replit Secrets (not OpenAI)
  - **Day 2 Competitor Research Overhaul:**
    - Removed manual Google search queries
    - Added "Find Competitors" button that uses AI to find real competitors
    - Shows loading state, displays results with URLs
    - Users can remove irrelevant ones or add more manually
  - **Day 2 Pain Points Simplified:**
    - Old prompt generated overly specific pain points
    - New prompt generates SHORT (under 10 words), GENERAL pain points
    - Example: "Wasting time on repetitive tasks" instead of long specific scenarios
  - **Browser Title Updated:** Changed "21 Day" to "21-Day" (with hyphen)
- **Files Modified:**
  - `client/src/hooks/useDays.ts` - Fixed Day 0 loading bug
  - `client/src/pages/Dashboard.tsx` - Added Day 0 & Day 1 video URLs
  - `client/index.html` - Updated title to "21-Day"
  - `server/routes.ts` - Switched all AI calls from GPT to Claude
  - `client/src/components/Day2IdeaValidator.tsx` - AI competitor search, simplified pain points
- **Notes for Next Session:**
  - Only ANTHROPIC_API_KEY needed now (OpenAI key no longer required)
  - Test Day 2 competitor search and pain point generation
  - Add more Loom videos as they're recorded (Days 2-21)
  - Test full Day 0 → Day 1 → Day 2 flow after redeployment

### 2026-01-29 - Idea Generation Overhaul, GPT Removal, Day 3 Fixes
- **Tasks Completed:**
  - **Removed All GPT/OpenAI Code:**
    - Deleted `callGPT` and `callGPTForJSON` functions from aiService.ts
    - Removed OpenAI import and client initialization
    - App now 100% Claude-powered (single ANTHROPIC_API_KEY)
  - **Day 1 Idea Generation Overhaul:**
    - Reduced from 28 ideas → 3 ideas (faster, cheaper)
    - Added regeneration feature (up to 10 times, 30s cooldown)
    - Shows warning after 5 regenerations about remaining count
    - Added staggered reveal animation (ideas appear one at a time)
    - Updated time estimate to "up to 2 minutes"
    - Added detailed logging for debugging
  - **Updated All "28 Ideas" References:**
    - Landing.tsx (5 places), Order.tsx, VideoSlides.tsx, seed.ts
    - Changed to "personalized ideas" or "AI-generated ideas"
  - **Day 0 Completion Modal:**
    - Day 0 now shows completion modal like other days (was skipping it)
  - **Badge Reset Fix:**
    - Added `deleteUserBadges()` function to storage.ts
    - Reset now clears badges AND progress
    - Frontend invalidates badge cache on reset
  - **Day 2 Improvements:**
    - "Book a Call" button now opens /coaching in new tab (was disabled)
    - Added Google search keywords after AI finds competitors
    - Search queries use description keywords (not made-up product name)
  - **Day 3 Feature Generation Fix:**
    - Added `credentials: "include"` to fetch (was failing auth)
    - Added validation for missing idea/pain points
    - Added error handling with toast messages
    - Updated UI styling to match design system (full-width button, better layout)
  - **AI Service Logging:**
    - Added detailed logging to `callClaude` and `callClaudeForJSON`
    - Logs endpoint, token usage, response length, errors
- **Files Modified:**
  - `server/aiService.ts` - Removed GPT code, added logging
  - `server/routes.ts` - Reduced to 3 ideas, better logging
  - `server/storage.ts` - Added deleteUserBadges function
  - `server/seed.ts` - Updated Day 1 description, USP prompt
  - `client/src/components/Day1IdeaGenerator.tsx` - Regeneration, staggered reveal
  - `client/src/components/Day2IdeaValidator.tsx` - Google search, Book a Call fix
  - `client/src/components/Day3CoreFeatures.tsx` - Auth fix, UI improvements
  - `client/src/pages/Dashboard.tsx` - Day 0 completion modal
  - `client/src/pages/Settings.tsx` - Badge cache invalidation on reset
  - `client/src/pages/Landing.tsx` - Removed "28 ideas" mentions
  - `client/src/pages/Order.tsx` - Removed "28 ideas" mention
  - `client/src/components/VideoSlides.tsx` - Updated idea generation text
- **Notes for Next Session:**
  - Test Day 1 → Day 2 → Day 3 full flow
  - Day 3 feature generation may still be slow (makes 3-4 AI calls)
  - Consider caching competitor data between Day 2 and Day 3

### 2026-01-29 (Session 2) - Design System Fixes & Security Hardening
- **Tasks Completed:**
  - **Day 5 (Logo) Design System Overhaul:**
    - Replaced all manual `Card` styling with `ds.cardWithPadding`
    - Changed step circles from `bg-slate-900` to `ds.stepCircle` (primary color)
    - Updated all text to use design system classes (`ds.body`, `ds.label`, `ds.muted`, `ds.heading`)
    - Updated option buttons to use `ds.optionDefault`/`ds.optionSelected`
    - Converted info boxes to use `ds.infoBoxHighlight`
    - Removed unused Card import
  - **Day 6 (PRD) Design System Fix:**
    - Changed step circles from grey (`bg-slate-200`) to primary color (`ds.stepCircle`)
  - **Day 5 TechStack Fixes:**
    - Fixed green background on "Coming soon" box → `ds.infoBoxHighlight`
    - Added visual feedback to copy buttons (turn green with checkmark, show "Copied!" for 2 seconds)
  - **Security: Discussion & Q&A Protection:**
    - Added 11 prompt injection detection patterns to `detectSpam()`:
      - `ignore previous/all instructions`
      - `pretend you're a different`
      - `jailbreak`, `bypass`, `hack`, `exploit`
      - `repeat after me`, `say exactly`
      - `what's your system prompt`
      - `act as`, `roleplay as`, `pretend to be`
      - `DAN`, `developer mode`, `god mode`
      - `disregard instructions`
      - `you are now`, `forget your rules`
      - Script injection (`<script>`, `javascript:`)
      - Template injection (`{{}}`, `${}`)
    - Added `sanitizeContent()` function for XSS prevention (escapes HTML)
    - Applied sanitization to comments, questions, and answers before storage
    - Added length validation: questions (10-2000 chars), answers (max 10000 chars)
    - Blocked suspicious content with friendly error messages
- **Files Modified:**
  - `client/src/components/Day5Logo.tsx` - Full design system overhaul
  - `client/src/components/Day6SummaryPRD.tsx` - Step circles fixed
  - `client/src/components/Day5TechStack.tsx` - Green bg fix, copy button feedback
  - `server/routes.ts` - Security: spam detection, sanitization, validation
- **Notes for Next Session:**
  - All Day components now use consistent design system
  - Discussion/Q&A protected against prompt injection and XSS
  - Test copy buttons on Day 5 TechStack page
  - Test submitting questions with suspicious content to verify blocking works

### 2026-01-30 - One-Click Upsell Fixes & Stripe Debugging
- **Tasks Completed:**
  - **One-Click Upsell Session Persistence Fixes:**
    - Added explicit `req.session.save()` in process-success endpoint
    - Session wasn't persisting stripeCustomerId before response was sent
    - Added 500ms delay in CheckoutSuccess before redirect to ensure cookie is processed
    - Added `sameSite: 'lax'` to session cookie configuration
  - **Fixed Stale User Data Bug:**
    - `req.user` object was stale after process-success updated database
    - Upsell endpoint now fetches fresh user data from DB instead of using `req.user`
  - **Added Debug Endpoint:**
    - Created `/api/debug/session` to check session state
    - Shows sessionId, stripeCustomerId, login status
  - **Added Webhook Debugging:**
    - Added logging to show webhook secret info (first/last chars)
    - Logs signature received for debugging verification failures
  - **Stripe Key Management:**
    - Discovered duplicate `STRIPE_SECRET_KEY` in Replit Secrets causing issues
    - Helped user roll/rotate keys after accidental exposure
    - Cleaned up to single key entry
- **Key Discovery:**
  - **100% discount coupons don't save payment methods** - Stripe doesn't capture card info when there's no charge
  - One-click upsell only works when customer actually pays (card is saved)
  - Test with real card or partial discount, not 100% off coupons
- **Files Modified:**
  - `server/routes.ts` - Session save, fresh DB fetch, debug endpoint, better logging
  - `server/webhookHandlers.ts` - Added webhook secret debugging logs
  - `server/replitAuth.ts` - Added sameSite cookie config
  - `client/src/pages/CheckoutSuccess.tsx` - Added delay before redirect, better logging
- **Known Issues:**
  - Stripe webhook signature verification failing (400 errors)
  - User has correct webhook secret but verification still fails
  - May be related to how StripeSync library processes webhooks
  - One-click upsell should work via process-success endpoint (doesn't need webhook)
- **Notes for Next Session:**
  - Test one-click upsell with real card payment (not 100% discount)
  - Webhook issue is separate from upsell - investigate if needed
  - Consider removing or fixing StripeSync integration if webhooks remain problematic
  - Coupon `TEST100` exists in admin (100% off) - don't use for upsell testing
