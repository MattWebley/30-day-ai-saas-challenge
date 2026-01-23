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
- **Last Session**: 2026-01-23 (Day 17 Test & Publish overhaul)
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

*See CLAUDE_ARCHIVE.md for sessions from Jan 14-21, 2026*

### 2026-01-22 - Day 12-13 Overhaul & Colon Cleanup
- **Tasks Completed:**
  - **Day 12 (AI Brain):** Restyled to match Days 9-11 design pattern using `ds` design system and `useStepWithScroll` hook
  - **Day 12:** Simplified test section to minimal checkbox ("My AI feature is working") with optional notes
  - **Day 12:** Replaced specific API pricing ($0.002) with general "costs are tiny" messaging
  - **Day 12:** Rewrote "WHY THIS MATTERS" section with practical AI use case list (content suggestions, summaries, chatbots, etc.)
  - **Day 13 (External APIs):** Complete rebuild - now walks through Resend email setup as practical API example
  - **Day 13:** Created new `Day13ExternalAPIs.tsx` component with 6-step flow
  - **Day 13:** Sends actual test email to verify API setup works (user enters email, builds test button, confirms receipt)
  - **Day 13:** Added troubleshooting help suggesting Claude Code/Replit for debugging
  - **Colon Cleanup:** Removed colons from all conversational/instructional text across 25+ Day components
- **Style Rule Applied:**
  - User doesn't use colons in conversational text - prefer "..." or dashes instead
  - Changed patterns like "Here's how:" → "Here's how" or "What you need:" → "What you need"
- **Files Modified:**
  - `client/src/components/Day10AIBrain.tsx` - Restyled with ds design system
  - `client/src/components/Day13ExternalAPIs.tsx` - NEW: Resend email setup flow
  - `client/src/components/DayInstructions.tsx` - Updated Day 13 instructions, removed colons
  - `client/src/pages/Dashboard.tsx` - Uses new Day13ExternalAPIs component
  - 25+ Day component files - Removed colons from instructional text
  - `server/seed.ts` - Updated Day 12 & 13 lessons
- **Files with Colon Cleanup:**
  - Day0StartHere, Day2IdeaValidator, Day3CoreFeatures, Day4Naming, Day5Logo, Day5TechStack
  - Day9ClaudeCodeMastery, Day9RealityCheck, Day10BuildLoop, Day10AIBrain
  - Day11Brand, Day11AddSuperpowers, Day12LetUsersIn, Day13ReachYourUsers
  - Day17BuildItOut, Day17Onboarding, Day18AdminDashboard, Day18BuildYourMVP
  - Day18TestEverything, Day19MobileReady, Day19TheSalesMachine
  - Day20BrandBeauty, Day21LaunchDay, DayInstructions
- **Notes for Next Session:**
  - Re-seed database: `npx tsx server/seed.ts`
  - Test Day 13 Resend email flow end-to-end
  - Test Day 12 AI Brain with new styling
  - Continue testing Days 14+ onwards

### 2026-01-22 (Session 2) - Day 14-17 Restructure & Autonomous Testing
- **Tasks Completed:**
  - **Day 15 Payments:** Created new `Day15Payments.tsx` component for Stripe setup (replaced duplicate email day)
    - 6-step flow: intro → signup → keys → secrets → build → test → done
    - Test card instructions (4242 4242 4242 4242)
    - Updated DayInstructions, VideoSlides, and seed.ts lesson
  - **Day 17 Autonomous Testing:** Replaced Admin Dashboard with new testing day
    - Created `Day17AutonomousTesting.tsx` component
    - Flow: intro → identify core feature → write test → run → fix (if failed) → done
    - Claude Code prompts for writing tests, running tests, fixing bugs
    - Updated DayInstructions, VideoSlides, and seed.ts lesson
  - **Day 14 Users & Admin:** Combined authentication with admin dashboard
    - Added new "admin" step after auth test passes
    - Admin dashboard prompt with 4 key numbers (total users, new/active this week, total actions)
    - Added "Want More?" section with 8 exciting optional metrics (revenue, power users, streaks, feature popularity, time to first action, conversion funnel, geography, device breakdown)
    - Updated title from "Add Login" → "Users & Admin"
    - Added note about Replit auth branding (may show Replit logo, alternatives available)
  - **Menu titles updated:** Day 13 = "Email & APIs", Day 15 = "Take Payments", Day 17 = "Autonomous Testing"
- **Fixes Applied:**
  - Day 13/15 overlap resolved (both were about email - Day 15 now Stripe payments)
  - Day 17 Admin Dashboard content moved to Day 14 (better fit after auth setup)
- **Files Created:**
  - `client/src/components/Day15Payments.tsx` - Stripe payments setup flow
  - `client/src/components/Day17AutonomousTesting.tsx` - Autonomous testing flow
- **Files Modified:**
  - `client/src/components/Day12LetUsersIn.tsx` - Added admin dashboard step with exciting metrics
  - `client/src/components/DayInstructions.tsx` - Updated Days 14, 15, 17
  - `client/src/components/VideoSlides.tsx` - Updated Days 14, 15, 17
  - `client/src/pages/Dashboard.tsx` - Uses new Day15Payments and Day17AutonomousTesting components
  - `server/seed.ts` - Updated lessons, titles, outcomes for Days 14, 15, 17
- **Notes for Next Session:**
  - Database was re-seeded - all lesson changes applied
  - Test Day 14 auth + admin dashboard flow
  - Test Day 15 Stripe payments flow
  - Test Day 17 autonomous testing flow
  - Continue testing Days 18+ onwards

### 2026-01-23 - Day 16-17 QA Overhaul & Sidebar Cleanup
- **Tasks Completed:**
  - **Day 16 (Mobile & Speed):** Added speed/performance testing alongside mobile testing
    - Added PERFORMANCE_TESTS array with 5 speed-related tests (initial load, navigation, loading states, images, no freeze)
    - Added new "performance" step to the flow after mobile tests
    - Restyled to match design system (ds import, icon circles in headers, ChevronLeft/Right buttons, back navigation)
    - Fixed "App loads on phone" fix prompt - now about broken apps, not slow loading
    - Removed unnecessary "Mobile Test Summary" textarea section
  - **Day 17 (Test & Ship):** Complete rewrite for practical QA testing approach
    - Changed from automated test writing to manual QA testing
    - Added 3 testing methods: Replit built-in autonomous testing, Claude for Chrome extension, Manual testing
    - Simplified TEST_AREAS to 5 essential items (signup, main feature, happy path, navigation, mobile)
    - Added realistic "ship with bugs" messaging - beta testers find edge cases, no software is 100% bug-free
    - Added fix issues step with Claude Code prompt for batch bug fixing
  - **Sidebar:** Removed MyJourneySection entirely (~160 lines)
    - Was showing incomplete/confusing milestone data
    - Cleaner sidebar without the hover popup
- **Fixes Applied:**
  - Day 16 design now matches Days 9-15 pattern (icon headers, back buttons, ds typography)
  - Removed mobileResult state and textarea from Day 16
  - Updated Day 17 tip: "With AI you can fix bugs FAST, so don't worry"
  - VideoSlides updated for both Day 16 (Mobile & Speed) and Day 17 (realistic testing mindset)
- **Files Modified:**
  - `client/src/components/Day19MobileReady.tsx` - Day 16 speed testing + design system styling
  - `client/src/components/Day17AutonomousTesting.tsx` - Complete rewrite for practical QA
  - `client/src/components/layout/Sidebar.tsx` - Removed MyJourneySection
  - `client/src/components/VideoSlides.tsx` - Updated Day 16 & 17 slides
  - `server/seed.ts` - Updated Day 16 & 17 lessons and tips
- **Notes for Next Session:**
  - Database was re-seeded - lessons are up to date
  - Test Day 16 mobile + speed testing flow
  - Test Day 17 practical QA flow with all 3 testing methods
  - Continue testing Days 18+ onwards

### 2026-01-23 (Session 2) - Day 17 Test, Publish & Domain Flow
- **Tasks Completed:**
  - **Day 17 Complete Overhaul:** Now "Test & Publish" with full deployment flow
    - Added "About tomorrow" info box explaining Day 18 pause button
    - Simplified testing options (Replit Autonomous Agent, Claude for Chrome, Manual)
    - Made testing option icons neutral slate instead of colored
    - Removed "Issues Found" textarea - users just test and fix, no writing down
    - Changed "happy path" to "normal use" (less jargon)
    - Added **Publish Your App** step with Replit deployment checklist
    - Added **Connect Your Domain** step (required, not optional)
      - 4-step domain connection checklist
      - Namecheap-specific instructions
      - Claude Code prompt for help with any registrar
      - **URL input field** to test domain with clickable link
      - DNS propagation warning if not working
    - **Custom domain saved to database** and displayed in Admin dashboard
  - **Admin Dashboard:** Added "App URL" column showing user's custom domain as clickable link
  - **Lesson Updates:** Updated Day 17 lesson with publishing and domain connection instructions
  - **Design System Fixes:** Removed all colored backgrounds (amber, blue, green-50) from Day 17
- **Fixes Applied:**
  - Fixed duplicate messaging in Day 17 (lesson vs component)
  - Changed "Here's a truth about building a business" → "Here's the truth about building a SaaS business"
  - Made Replit deployment options generic ("Replit will guide you") instead of specific choices
  - Storage.ts now accepts userInputs in completeDay function
  - Routes.ts now saves componentData as userInputs for all days
- **Files Modified:**
  - `client/src/components/Day17AutonomousTesting.tsx` - Major rewrite with publish + domain steps
  - `client/src/components/VideoSlides.tsx` - Updated Day 17 slides
  - `client/src/pages/Admin.tsx` - Added App URL column
  - `server/routes.ts` - Save componentData as userInputs, include customDomain in admin stats
  - `server/seed.ts` - Updated Day 17 lesson with publishing/domain content
  - `server/storage.ts` - Added userInputs parameter to completeDay
- **Notes for Next Session:**
  - Database was re-seeded - Day 17 lesson is up to date
  - Test Day 17 full flow: test → publish → domain → done
  - Test that customDomain saves correctly and shows in Admin
  - Public Builder badge has minor issue: buildInPublic not persisted for retroactive awarding (low priority)
