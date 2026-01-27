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
- **Days 19-21**: Launch (Sales Machine, SEO & AI Search, $100K Roadmap)

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
- **Last Session**: 2026-01-27 (VSL Video Added + Branch Merged)
- **Branch**: main
- **Repo**: MattWebley/30-day-ai-saas-challenge

## Pending Tasks
- [x] **Set up Stripe** - DONE: Keys added, checkout working
- [x] **Test Mode** - DONE: Defaults to false, toggle moved to Admin panel
- [x] **Launch Pack** - REMOVED: Entire feature removed (sidebar, checkout, server routes)
- [ ] Test AI Mentor chat bot (check browser console)
- [ ] Test Showcase feature end-to-end
- [ ] Test Day 0 → Day 1 → Day 2 flow
- [ ] Test Day 8-21 components
- [ ] Add Namecheap affiliate ID to Day4Naming.tsx
- [ ] Add coaching call booking links (Days 1-7, 19-21)
- [ ] Enable "Book a Call" button in Day 2 (needs Calendly link)
- [x] **Add VSL video** - DONE: Vimeo embed added to landing page hero section
- [ ] Add real Stripe price IDs for: Prompt Pack, Coaching tiers, Critique

### PRE-LAUNCH BLOCKERS (DO THESE BEFORE GOING LIVE)
- [ ] **CRITICAL: Set up Systeme.io waitlist autoresponder** - Day 21 "Join the Waitlist" button links to `challenge.mattwebley.com/waitlist` which currently 404s
- [ ] **CRITICAL: Set up mattwebley.com/readiness page** - Day 21 Readiness Review CTA links here

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

*See CLAUDE_ARCHIVE.md for sessions from Jan 14-23, 2026*

### 2026-01-24 - Day 19 Overhaul & Critique Page
- **Tasks Completed:**
  - **New Critique Page:** Created standalone `/critique` page for Sales Page Video Critique
    - Moved from Coaching page to its own route
    - Pricing: £495/$595 base + £95/$97 headlines bump (50% off messaging)
    - Currency toggle (USD/GBP) based on user's purchase currency
    - Locked state for users who haven't reached Day 19
    - "Sales Page Training Already Included" notice for Day 19+ users
  - **Sidebar Updates:**
    - Changed "Sales Letter Pack" → "Sales Letter Critique"
    - Added uniform Lock/Unlock icons across Sales Letter Critique, Claude Code Guide, and Launch Pack
    - Links to `/critique` when unlocked (Day 19+)
  - **Ambassador Badge:** New badge (🌟) for submitting testimonials
    - Added to seed.ts with triggerType "testimonial_submitted"
    - Routes.ts awards badge when showcase entry includes testimonial
  - **Day 19 Lesson Improvements:**
    - Added "WHY SAAS IS EASIER TO SELL" section (free trials, zero risk)
    - Added "BUILD IT ONCE, SELLS 24/7" messaging
    - Removed duplication between lesson and interactive component
    - Better whitespace and subheads for readability
  - **Day 19 Interactive Component:**
    - Made critique pitch its own step in flow (intro → structure → prompts → build → critique → showcase → complete)
    - Added 50% off pricing display with strikethrough (£990/£495)
    - Added visual feedback for copy buttons (green checkmark, "Copied!" text)
    - Removed ChatGPT mention - only Claude.ai now
    - Removed "20+ years" mentions - focus on conversion rates instead
    - Fixed showcase section to match design system (bg-primary instead of bg-green-500)
    - Updated social platforms: Instagram, TikTok, YouTube, Facebook, and email lists
    - Changed "10-100 paying customers" → "first few paying customers" (honesty fix)
    - Added republish reminders in build and complete steps
- **Fixes Applied:**
  - Design system violations fixed (removed bg-green-500, bg-amber-500 for icon headers)
  - Removed colored backgrounds (amber-50, etc.) - using ds.cardWithPadding
  - Ambassador badge now properly seeded in database
- **Files Created:**
  - `client/src/pages/Critique.tsx` - Standalone critique page
- **Files Modified:**
  - `client/src/App.tsx` - Added /critique route
  - `client/src/components/Day19TheSalesMachine.tsx` - Major updates (critique step, copy feedback, republish reminders)
  - `client/src/components/Day18BuildYourMVP.tsx` - Minor updates
  - `client/src/components/layout/Sidebar.tsx` - Sales Letter Critique link, uniform lock icons
  - `client/src/pages/Coaching.tsx` - Removed critique content
  - `client/src/pages/Dashboard.tsx` - Minor updates
  - `client/src/pages/Landing.tsx` - Minor updates
  - `client/src/pages/SalesLetterPack.tsx` - Simplified
  - `server/routes.ts` - Ambassador badge awarding on testimonial submission
  - `server/seed.ts` - Ambassador badge, Day 19 lesson updates
- **Notes for Next Session:**
  - Database was re-seeded - Ambassador badge is active
  - Test Ambassador badge awarding (submit showcase with testimonial)
  - Test /critique page flow and checkout
  - Test Day 19 full flow with new critique step
  - Confirm no badge needed after Day 19 (Builder at Day 18, Launcher at Day 21)

### 2026-01-24 (Session 2) - Day 20 Overhaul: Keyword-First SEO
- **Tasks Completed:**
  - **Day 20 Complete Rebuild:** Changed from "Launch Plan" to "Get Found by Google" with keyword-first approach
    - Created new `Day20GetFound.tsx` component with 7-step flow:
    - Step 1: Intro - What is SEO, why keywords matter
    - Step 2: Generate Keywords - AI prompt for primary, secondary, and long-tail keywords
    - Step 3: Pick Keywords - User selects primary keyword + up to 5 secondary keywords
    - Step 4: Optimize - Comprehensive SEO prompt using their chosen keywords (title tags, meta, H1/H2, URLs, images, internal links, OG tags, favicon, sitemap)
    - Step 5: Submit to Google - Search Console walkthrough with verification help
    - Step 6: Directories - Essential (Google, Bing) + 8 bonus directories
    - Step 7: Complete - Summary showing their keyword strategy + coaching pitch
  - **Keyword Research Prompt:** Generates primary, secondary, long-tail, and competitor keywords with search intent and competition level
  - **SEO Optimization Prompt:** 10-point comprehensive optimization based on user's chosen keywords
  - **Lesson Updates:** Keyword-first messaging, explains why keywords matter before the technical stuff
  - **VideoSlides Updates:** Keywords → Optimize → Submit flow
  - **Coaching Pitch:** "SEO takes time. Want faster results? Our coaches can help."
- **Why This Approach:**
  - Keywords first = actionable and personalized
  - Users understand WHY they're optimizing (for specific searches)
  - Comprehensive SEO prompt covers everything in one shot
  - Saves their keyword research and choices for reference
- **Files Modified:**
  - `client/src/components/Day20GetFound.tsx` - Complete keyword-first rebuild
  - `client/src/components/DayInstructions.tsx` - Updated for keyword flow
  - `client/src/components/VideoSlides.tsx` - Keywords → Optimize → Submit
  - `server/seed.ts` - Keyword-focused lesson content
- **Notes for Next Session:**
  - Database was re-seeded
  - Test full Day 20 flow: intro → generate keywords → pick keywords → optimize → submit → directories → complete
  - Test keyword research prompt generates good results
  - Test SEO optimization prompt includes user's chosen keywords
  - Old Day20LaunchPlan.tsx still exists but unused (can delete)

### 2026-01-24 (Session 3) - Day 21 Overhaul: Growth Strategies + Work With Matt CTA
- **Tasks Completed:**
  - **Day 21 Complete Rebuild:** Kept income calculator, added growth strategy education + call booking
    - 8-step flow: intro → calculator → strategies-intro → passive → active → more → commitment → complete
    - **Income Calculator:** Set income goal, pick price point, see customers needed (kept from old version)
    - **Strategies Intro:** "You only need 1-2 methods that work" messaging
    - **Passive Strategies (3):** AI-powered blog, comparison pages, affiliate program
      - Each has: what it is, why it's powerful, result preview
    - **Active Strategies (3):** Automated cold email, paid ads, influencer partnerships
      - Plus "and there's more..." hint (LinkedIn automation, webinars, etc.)
    - **77 Strategies Hook:** "That's just 6 of 77+ strategies" curiosity hook
    - **Work With Matt CTA:** Dark card with benefits list, links to mattwebley.com/workwithmatt
    - **Commitment:** Optional commitment statement
  - **Strategy Cards:** Explain WHAT and WHY but not HOW (teases coaching value)
  - **Design System:** Matches Days 19-20 style (ds helpers, icon circles, back buttons)
- **Key Messaging:**
  - "The challenge taught you to BUILD. These strategies are how you SELL."
  - "These aren't questions you can answer with another course or YouTube video."
  - "Access to the full playbook of 77+ strategies" (coaching benefit)
- **Files Modified:**
  - `client/src/components/Day21LaunchDay.tsx` - Complete rebuild with growth strategies
  - `client/src/pages/Dashboard.tsx` - Removed unused selectedStrategies prop
  - `client/src/components/DayInstructions.tsx` - Updated Day 21 instructions
  - `client/src/components/VideoSlides.tsx` - Updated Day 21 slides
  - `server/seed.ts` - New Day 21 lesson with strategy teasers
- **Notes for Next Session:**
  - Database was re-seeded - Days 20 & 21 are up to date
  - Test Day 20 full flow (keyword-first SEO)
  - Test Day 21 full flow (calculator → strategies → call booking)
  - Both days lead to mattwebley.com/workwithmatt for coaching
  - Old unused components can be deleted: Day20LaunchPlan.tsx, Day20BrandBeauty.tsx

### 2026-01-24 (Session 4) - Day 20 Simplified SEO + AI Search
- **Tasks Completed:**
  - **Simplified Day 20 Flow:** Removed multi-step keyword picking (too clunky)
    - Old flow: generate keywords → manually pick → optimize → submit
    - New flow: intro → optimize (one prompt) → submit → directories → complete
    - ONE comprehensive prompt does keyword research AND optimization together
    - Claude Code figures out the best keywords AND applies them
  - **AI Search Section:** Added info about getting found by AI assistants (ChatGPT, Perplexity, etc.)
    - Emerging field of "LLM SEO" - being mentioned across web helps AI recommend you
    - Included in directories step with practical tips
  - **Day Name Change:** "Launch Plan" → "Get Found by Google" → "Get Found by Google & AI"
  - **Duplicate Content Fix:** Trimmed Day 20 & 21 lessons to be short teasers
    - Lessons no longer repeat what's in the interactive component
    - "The interactive section below walks you through everything..."
  - **Google Trust Timeline:** Added note that Google doesn't trust new sites
    - Can take weeks or MONTHS for traffic to flow
    - Added to lesson + DayInstructions
  - **Day 21 Active Methods:** Reduced from 4 to 3 + hint at more
- **Files Modified:**
  - `client/src/components/Day20GetFound.tsx` - Simplified to 5-step flow with one comprehensive prompt
  - `client/src/components/Day21LaunchDay.tsx` - Reduced active methods, added hints
  - `client/src/components/DayInstructions.tsx` - Updated Day 20 instructions for new flow
  - `client/src/pages/Dashboard.tsx` - Updated title to "Get Found by Google & AI"
  - `server/seed.ts` - Trimmed lessons, added Google trust timeline, updated titles
- **Additional Updates:**
  - VideoSlides Day 20 updated to match new 5-step flow
  - Day 20 lesson updated - removed reference to "finding keywords" step
  - Added AI assistant mention to lesson
- **Notes for Next Session:**
  - Database was re-seeded - all changes applied
  - Test Day 20 simplified SEO flow
  - Test Day 21 growth strategies flow
  - Old unused components to delete: Day20LaunchPlan.tsx, Day20BrandBeauty.tsx

### 2026-01-26 - Day 21 Growth Strategies Expansion + Congratulations Page
- **Tasks Completed:**
  - **Day 21 Expanded to 40 Strategies:** 20 passive + 20 active growth methods
    - All AI-executable methods (blog, comparison pages, cold email, etc.)
    - Added automation tags initially, then removed (made it feel too easy/DIY)
    - Updated messaging: "20 of 50+ passive methods", "20 of 50+ active methods", "100+ Growth Strategies Exist"
    - Emphasizes "you only need 1-2 that work for YOUR product"
  - **Readiness Review CTA:** Changed from mentorship pitch to lower-commitment call booking
    - "Is Your SaaS Ready for Growth?" framing
    - Free Readiness Review call (not 15 min - it's a full sales call)
    - Links to mattwebley.com/readiness
    - Hints at "done for you" option: "Some want to learn. Others want it done for them. I can help with both."
  - **New Congratulations Page:** `/congratulations` route
    - Dedicated page after Day 21 completion
    - Video placeholder for Matt's congratulations message
    - Stats card (21 days, 1 SaaS, Top 1%)
    - "What You've Accomplished" checklist
    - Readiness Review CTA
    - Day 21 completion now redirects here instead of showing modal
  - **New Favicon:** SVG favicon with "21" - white background, black text
  - **Matt's Tip Updated:** Added "I can help you build AI systems that take care of most of this for you, growing your SaaS business on autopilot"
- **Files Created:**
  - `client/src/pages/Congratulations.tsx` - Post-challenge celebration page
  - `client/public/favicon.svg` - New "21" favicon
- **Files Modified:**
  - `client/src/components/Day21LaunchDay.tsx` - 40 strategies, Readiness Review CTA, done-for-you hint
  - `client/src/pages/Dashboard.tsx` - Day 21 redirects to /congratulations
  - `client/src/App.tsx` - Added /congratulations route
  - `client/index.html` - Added SVG favicon reference
  - `server/seed.ts` - Updated Day 21 tip with AI marketing mention
  - `CLAUDE.md` - Added pre-launch blockers section
- **Pre-Launch Blockers Added:**
  - Set up Systeme.io waitlist autoresponder (challenge.mattwebley.com/waitlist currently 404s)
  - Set up mattwebley.com/readiness page for Readiness Review booking
- **Notes for Next Session:**
  - Database was re-seeded
  - Test Day 21 full flow with all 40 strategies
  - Test /congratulations page appearance
  - Add actual video to Congratulations page when ready
  - User considering AI marketing as a service offering (monthly subscription)

### 2026-01-26 (Session 2) - Cleanup, Admin Restriction, Design System Fixes
- **Tasks Completed:**
  - **Day 0 Journey Fix:** Updated milestones to show full 21-day journey (was stopping at Day 19)
    - Now shows: Start → Idea → Prepare → Build → Launch → Done!
  - **AI Headline Generation Fix:** Added error handling and console logging for A/B test variant generation
  - **Launch Pack Removed Entirely:**
    - Removed from Sidebar (link and hasLaunchPack check)
    - Removed bump offer from Order page
    - Removed `/launch-pack` route from App.tsx
    - Deleted `LaunchPack.tsx` page component
    - Cleaned up server routes (`/api/launch-pack/checkout`, bump offer logic)
    - Cleaned up webhookHandlers.ts (Launch Pack purchase handling)
    - Cleaned up emailService.ts (Launch Pack parameter)
  - **Orphaned Components Deleted:** (7 files)
    - Day7ReplitBuild.tsx, Day9RealityCheck.tsx, Day11AddSuperpowers.tsx
    - Day17Onboarding.tsx, Day20LaunchPlan.tsx, Day20BrandBeauty.tsx, Day20GoingLive.tsx
  - **Test Mode:**
    - Changed default from `true` to `false` in TestModeContext.tsx
    - Removed floating toggle from App.tsx
    - Added Test Mode toggle to Admin panel (only admins can access)
  - **Admin Panel Restriction:**
    - Sidebar: Admin link only shows for users with `isAdmin: true`
    - Admin page: Added "Access Denied" screen for non-admin users
  - **Mobile Fixes:**
    - Logo cache busting updated to `?v=3` on all references
    - Hidden "Start the Challenge" button in header on mobile (was clashing with logo)
  - **Landing Page Design Improvements:**
    - Added subtle gradient background to hero section
    - Added shadow to dark callout box
    - Added shadow/glow effect to CTA buttons
  - **Design System Fixes (Partial):**
    - Fixed colored backgrounds in: DayCommunity, Day10AIBrain, Day11BrandDesign, Day5Logo, Day13ExternalAPIs, Day13ReachYourUsers, Day12LetUsersIn (partial)
    - Changed `bg-amber-50`, `bg-blue-50`, `bg-green-50` → `bg-slate-50`
    - Changed amber/blue/green buttons → `bg-primary`
- **Files Deleted:**
  - `client/src/pages/LaunchPack.tsx`
  - `client/src/components/Day7ReplitBuild.tsx`
  - `client/src/components/Day9RealityCheck.tsx`
  - `client/src/components/Day11AddSuperpowers.tsx`
  - `client/src/components/Day17Onboarding.tsx`
  - `client/src/components/Day20LaunchPlan.tsx`
  - `client/src/components/Day20BrandBeauty.tsx`
  - `client/src/components/Day20GoingLive.tsx`
- **Files Modified:**
  - `client/src/App.tsx` - Removed LaunchPack route, removed TestModeToggle
  - `client/src/components/layout/Sidebar.tsx` - Removed Launch Pack, admin-only Admin link, logo cache bust
  - `client/src/components/layout/Layout.tsx` - Logo cache bust
  - `client/src/pages/Landing.tsx` - Logo cache bust, hidden mobile CTA, design improvements
  - `client/src/pages/Order.tsx` - Removed Launch Pack bump offer
  - `client/src/pages/Admin.tsx` - Added access control, Test Mode toggle
  - `client/src/contexts/TestModeContext.tsx` - Default to false
  - `client/src/components/Day0StartHere.tsx` - Fixed journey milestones
  - `server/routes.ts` - Removed Launch Pack checkout and references
  - `server/webhookHandlers.ts` - Removed Launch Pack handling
  - `server/emailService.ts` - Removed Launch Pack parameter
  - Multiple Day components - Design system fixes
- **Remaining Design System Violations:**
  - Day0StartHere.tsx, Day11Brand.tsx, Day12LetUsersIn.tsx (partial)
  - Day17BuildItOut.tsx, Day18TestEverything.tsx, Day19MobileReady.tsx
  - Day19TheSalesMachine.tsx, Day20GetFound.tsx, Day21LaunchDay.tsx
  - FocusButton.tsx, DayCompletionModal.tsx
- **Notes for Next Session:**
  - Mobile logo: User may need to clear browser cache if still seeing old logo
  - Continue design system fixes on remaining Day components
  - Add real Stripe price IDs for add-on products
  - Set up external pages (mattwebley.com/readiness, challenge.mattwebley.com/waitlist)

### 2026-01-27 - Complete Design System Fixes
- **Tasks Completed:**
  - **Fixed all remaining design system violations** in 9 components
  - Created backup branch `pre-design-system-fixes-jan27` for easy rollback
  - **Changes Applied:**
    - Day0StartHere: blue-50 → slate-50 for journey icons
    - Day11Brand: amber/green backgrounds → slate-50 with proper text colors
    - Day12LetUsersIn: blue/amber/purple/green backgrounds → slate-50 (6 icon containers, 4 info boxes, 2 done cards)
    - Day17BuildItOut: amber/blue/green backgrounds → slate-50, neutral icon colors
    - Day18TestEverything: purple/blue/amber/green backgrounds → slate-50
    - Day19MobileReady: blue/amber/red/green backgrounds → slate-50
    - Day19TheSalesMachine: amber-500 icon → primary, amber badge → primary
    - Day20GetFound: amber AI Search box → slate-50, green complete card → slate-50
    - DayCompletionModal: amber badge → primary, blue gradient → slate-50
- **Design System Now Consistent:**
  - All info boxes use `bg-slate-50 border-slate-200`
  - Success states use green text (`text-green-600`) only, not green backgrounds
  - Icon containers use `bg-slate-50` or `bg-primary` consistently
  - FocusButton.tsx colors left as-is (functional UI for beat mode selection)
- **Rollback:** To undo, run `git checkout pre-design-system-fixes-jan27 -- client/src/components/`
- **Files Modified:**
  - `client/src/components/Day0StartHere.tsx`
  - `client/src/components/Day11Brand.tsx`
  - `client/src/components/Day12LetUsersIn.tsx`
  - `client/src/components/Day17BuildItOut.tsx`
  - `client/src/components/Day18TestEverything.tsx`
  - `client/src/components/Day19MobileReady.tsx`
  - `client/src/components/Day19TheSalesMachine.tsx`
  - `client/src/components/Day20GetFound.tsx`
  - `client/src/components/DayCompletionModal.tsx`
- **Notes for Next Session:**
  - Design system violations now fully resolved
  - Test visually to confirm consistent appearance
  - Continue with pending tasks (AI Mentor, Showcase testing, etc.)

### 2026-01-27 (Session 2) - Landing Page Sales Copy Overhaul
- **Tasks Completed:**
  - **Complete Landing Page Copy Rewrite** using proven sales psychology techniques:
    - New headline: "How to Build Your Own Software Product in the Next 21 Days Without Writing a Single Line of Code..."
    - Whisper line: "(...even if you don't have an idea yet!)" - small italic text under headline
    - New subheadline: "No Tech Skills. No $50K Developers. Just AI and Daily Micro-Tasks."
    - Removed "Under $100" from subheadline to avoid confusion with challenge price
  - **Added Psychological Sales Techniques** (Russell Brunson / high-converting challenge style):
    - "The Daily Build Method" - named unique mechanism in Solution section
    - Future Pacing section: "Picture This: 21 Days From Now..."
    - False Close before price: "If this ONLY helped you..." (3 variations)
    - Price Anchoring: "That's less than £14 per day"
    - Reason Why: "Why so affordable? Because I'm not looking for tire-kickers..."
    - Multiple CTAs throughout page (after Solution, Journey, Proof sections)
    - Social proof line: "Join hundreds of builders who started exactly where you are now"
  - **Objections Section** - 8 conversational objection handlers:
    - Not technical, no idea, don't know where to start, never built a business, no money, no time, get stuck, tried before
  - **"by Matt Webley"** added under logo in header
  - **Proof callout made prominent** - dark background callout: "This challenge app? I built it using the EXACT same system"
  - **Access period changed** from 12 months to 6 months throughout
  - **Order Page Redesigned** to match landing page style:
    - Cleaner design with Card component
    - Updated copy: "You're One Step Away"
    - "Do the Work Guarantee" with punchier copy
    - Removed bump offer (Sales Letter Pack)
    - 6 months access (was 12)
- **Headline Variations Created** (for future A/B testing):
  - Ogilvy, Schwartz, Halbert, Hopkins, Caples, Kennedy, Sugarman, Bencivenga, Schwab, Collier styles
- **Files Modified:**
  - `client/src/pages/Landing.tsx` - Major copy overhaul
  - `client/src/pages/Order.tsx` - Complete redesign
- **Branch:** `landing-dashboard-style` (not yet merged to main)
- **Notes for Next Session:**
  - Consider A/B testing headline variations
  - May want to add visual elements (number callouts, comparison tables, timeline) - drafts were created but reverted
  - Test landing page flow and order page checkout
  - Merge `landing-dashboard-style` to main when ready

### 2026-01-27 (Session 3) - VSL Video Added + Branch Merged
- **Tasks Completed:**
  - **Merged landing-dashboard-style to main** - Sales copy overhaul now live
  - **Added VSL Video:** Embedded Vimeo video in landing page hero section
    - URL: `https://player.vimeo.com/video/1158816837?h=38a9da32e3`
    - Clean embed (no title/byline/portrait)
    - Changed "Watch the 3-minute overview" → "See how it works"
  - **Cleanup:** Removed unused `Play` icon import
- **Files Modified:**
  - `client/src/pages/Landing.tsx` - Vimeo video embed, text update
- **Notes for Next Session:**
  - Landing page now has real VSL video
  - Test video playback on mobile
  - Continue with pending tasks (AI Mentor, Showcase testing, etc.)
