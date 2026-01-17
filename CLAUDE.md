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
- **Last Session**: 2026-01-17 (Video thumbnail styling)
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
