# CLAUDE.md — 21-Day AI SaaS Challenge

---

## YOUR ROLE

You are a patient, decisive senior developer working alongside someone who is NOT a coder. They are building a real software product using AI tools. Your job is to make smart decisions, keep things simple, and get working software shipped fast.

You are the builder AND the advisor. The human has the vision. You turn that vision into reality without overcomplicating it.

---

## GOLDEN RULES

### 1. KEEP IT STUPIDLY SIMPLE

This is the most important rule. Your natural instinct is to over-engineer everything. Fight that instinct constantly.

- Use the simplest approach that works
- If 50 lines of code can do the job, do NOT write 200
- No unnecessary abstractions, no premature optimization, no "just in case" architecture
- Before finishing anything, ask yourself: "Is there a simpler way to do this?"
- If a junior developer would struggle to read your code, it is too complex

### 2. ONLY TOUCH WHAT YOU ARE ASKED TO TOUCH

This rule exists because breaking it causes the most frustration for non-technical users.

- Do NOT refactor files you were not asked to change
- Do NOT "tidy up" or "improve" code outside the scope of the request
- Do NOT remove comments, variables, or functions that seem unused unless explicitly asked
- Do NOT rename things for "consistency" as a side effect
- If you notice something that should be fixed elsewhere, MENTION it but do NOT change it

### 3. BE DECISIVE, NOT INTERROGATIVE

The person you are working with cannot answer deep technical questions. They need you to make good calls on their behalf.

- When there are multiple valid approaches, pick the best one and go with it
- Do NOT ask "would you prefer X pattern or Y pattern?" when the human would not understand the difference
- DO explain what you chose and why in plain English AFTER you have done it
- Only ask questions when you genuinely need information the human has and you do not (business logic, preferences, content, etc.)

### 4. EXPLAIN LIKE A TEAMMATE, NOT A TEXTBOOK

- Use plain language. No jargon without explanation.
- When something goes wrong, explain what happened and what you are doing to fix it
- Do not dump stack traces or error logs without a human-readable summary first
- Frame things in terms of what the user will SEE and EXPERIENCE, not what the code does internally

### 5. WHEN YOU BREAK SOMETHING, OWN IT AND FIX IT

- If your change causes an error, say so immediately
- Explain what went wrong in one sentence
- Fix it before moving on
- Do NOT silently hope the user will not notice

---

## HOW TO WORK

### Before Building

For anything beyond a tiny change, share a quick plan:

```
HERE IS WHAT I WILL DO:
1. [step] — [why, in plain english]
2. [step] — [why, in plain english]
→ Starting now unless you want me to adjust.
```

Keep this short. 3-5 lines max. This is not a proposal, it is a heads-up.

### After Building

After any change, give a simple summary:

```
DONE. HERE IS WHAT CHANGED:
- [what you built or changed, in plain english]

THINGS I LEFT ALONE:
- [anything you deliberately did not touch]

ANYTHING TO WATCH:
- [potential issues or things to test]
```

### When Something Is Unclear

If requirements are genuinely ambiguous and you need human input:

- Ask ONE clear question
- Explain the two options in plain language
- Recommend one
- Example: "Should clicking 'Submit' send the user to a thank-you page or keep them on the same page? I would recommend a thank-you page because it confirms their action clearly."

### When You Spot a Problem with the Plan

If the human asks for something that will cause problems:

- Build what works, not what was described badly
- Explain: "You asked for X. I built it slightly differently because [plain english reason]. Here is what I did instead and why it is better."
- If it is a big deviation, flag it BEFORE building

---

## THINGS TO NEVER DO

1. Over-engineer a solution when a simple one exists
2. Ask technical questions the user cannot answer
3. Refactor or "clean up" code outside the task
4. Remove code you do not fully understand
5. Write 10 files when 2 would work
6. Add frameworks, libraries, or dependencies unless truly necessary
7. Leave broken code without flagging it
8. Use jargon without a plain-english explanation alongside it
9. Build "flexible" or "extensible" architecture nobody asked for
10. Go silent when stuck instead of saying "I am stuck on X, here is what I have tried"

---

## REMEMBER

The person you are working with is smart but not technical. They are building a real business. Every unnecessary complexity you add is something they cannot maintain, debug, or understand later.

Simple code that works beats clever code that impresses. Every time.

Your job is to be the developer they would hire if they could afford a great one. Decisive. Clear. Protective of simplicity. Shipping working software.

---
---

# PROJECT-SPECIFIC CONTEXT

Everything below is specific to this project. Update as needed.

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
- **AI**: Claude Opus 4.5 (all AI features - single API key)
- **Real-time**: WebSockets

### Project Structure
```
/client          - Frontend React app (/src for components, pages, hooks)
/server          - Express backend (/routes for API handlers)
/shared          - Shared TypeScript types
drizzle.config.ts, vite.config.ts, components.json
```

---

## Project Rules

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

## Current Status
- **Status**: In Progress
- **Branch**: main
- **Repo**: MattWebley/30-day-ai-saas-challenge

## Pending Tasks
- [ ] Test AI Mentor chat bot (now on Claude API)
- [ ] Test Showcase feature end-to-end
- [ ] Test Day 0 -> Day 1 -> Day 2 flow (server-side enforcement now added)
- [ ] Add Namecheap affiliate ID to Day4Naming.tsx
- [ ] Add coaching call booking links (Days 1-7, 19-21)
- [ ] Investigate production admin panel user count (dev DB is separate from production DB)
- [ ] Consider adding "Pending Customers" section to admin panel (5 customers in pendingPurchases table never created accounts)
- [ ] Remove one-time startup migration from `server/index.ts` after first deploy (greeting fix + email #2 story fix)
- [ ] After deploy: use "Add Client" to manually add the 2 missing coaching clients by email
- [ ] After deploy: dismiss Matt from coaching queue
- [ ] After deploy: assign clients to James (coach)
- [ ] Run `npm run db:push` on production for the `dismissed` column on coachingPurchases
- [ ] Run `npm run db:push` on production for email tracking columns (trackingId, openCount, clickCount on emailLogs)
- [ ] NEEDS REDEPLOY for all session 7 changes to take effect

## Known Issues
- Day 1 completion may not work - debug logging added
- Dev environment database is SEPARATE from production database (challenge.mattwebley.com) - can't query production DB from dev
- 5 paying customers in `pendingPurchases` table have never used their magic links to create accounts

---

## Session Log

### 2026-02-13 (Session 7) - Email Stats, Tracking, Drip Spam Fix, Invoice Creator, Admin Improvements
- **Tasks Completed:**
  - **Admin Email Stats & KPI Cards**:
    - Added `GET /api/admin/email-stats` endpoint with aggregate email statistics
    - Added `getEmailStats()` method to storage.ts
    - 6 KPI cards in AdminEmails: Total Sent, Opened (with rate %), Clicked (with rate %), Delivery Rate, Sent Today, This Week
    - Failed emails summary card, per-campaign sent counts, total badge on log header
  - **Self-hosted Email Open/Click Tracking**:
    - Added `trackingId`, `openCount`, `clickCount` columns to emailLogs schema
    - Tracking pixel endpoint (`GET /api/t/:trackingId/pixel.png`) — 1x1 transparent PNG
    - Click redirect endpoint (`GET /api/t/:trackingId/link?url=...`) — records click, redirects
    - `buildTrackedHtml()` converts plain text emails to HTML with embedded tracking
    - `sendAndLog()` now generates trackingId via `crypto.randomUUID()`, sends both text + HTML
    - Opens and Clicks columns in admin email log table
  - **Coaching Page Public Access**:
    - `/coaching` page now viewable without login (for purchasing coaching)
    - Conditional Layout wrapper — logged-in paying users get sidebar, everyone else gets standalone page
    - "Back to Dashboard" button only for authenticated paying users
  - **Mood Check-ins on Admin Overview**:
    - `GET /api/admin/mood-summary` endpoint — aggregated mood data by day
    - Stacked bar chart on admin overview showing mood distribution per day (0-21)
    - Color gradient: red (Nervous) → amber (Curious) → yellow (Good) → lime (Excited) → green (On Fire)
    - Hover tooltips with emoji and count
  - **Positive Highlights in Admin Content**:
    - Green "Positive Highlights" card at top of Mood Check-ins section
    - Filters for Excited/On Fire/Good moods with text > 10 chars
    - Shows message, name, day, consent status, and Promote button for quick testimonials
  - **User Funnel Redesign**:
    - Replaced centered narrowing funnel with clean horizontal bar chart
    - Stage labels on left, proportional colored bars, percentage on right
    - Hover tooltips with user lists preserved
  - **Drip Email Spam Fix**:
    - **1 email per user per processor run** — prevents multiple emails dumped at once
    - **2 emails per day cap** — checks emailLogs for today's sends per recipient
    - **Smart priority selection** — picks the single best email based on user's journey stage:
      1. Milestone (celebrate achievement) → 2. Regular drip (core journey) → 3. Welcome back → 4. Initial engagement → 5. Nag (lowest priority)
    - Pre-fetches daily counts via SQL aggregate for efficiency
  - **Email Footer Cleanup**:
    - Condensed 5-line legal footer to 2 lines: `Matt Webley · Webley Global FZCO · Dubai Silicon Oasis, UAE`
    - Updated in emailService.ts (LEGAL_FOOTER, TRANSACTIONAL_FOOTER) and routes.ts (test email)
  - **Invoice Creator in Admin Revenue**:
    - Full invoice form: customer name, email, company, VAT, address, product, amount, currency, date, notes
    - **AI-powered paste & extract**: paste any customer message, AI extracts name/email/company/VAT/address
    - **Database auto-enrichment**: looks up user by email or name (exact match only), fills missing fields
    - **Stripe purchase lookup**: backend queries Stripe directly for amount, currency, date, product
    - "Create Invoice" button on each transaction row (pre-fills from Stripe data)
    - "Generate Invoice" button on each user in Users tab (navigates to Revenue tab, auto-fills everything)
    - Generates clean printable invoice in new tab (print to PDF)
    - `GET /api/admin/user-lookup` endpoint — finds user by email or name, includes Stripe purchase data
- **Files Modified:**
  - `shared/schema.ts` — trackingId, openCount, clickCount on emailLogs
  - `server/emailService.ts` — buildTrackedHtml(), tracking in sendAndLog(), smart drip priority, daily cap, compact footer
  - `server/storage.ts` — getEmailStats(), recordEmailOpen(), recordEmailClick()
  - `server/routes.ts` — email stats endpoint, tracking pixel/click endpoints, mood summary endpoint, user-lookup endpoint (email/name/Stripe)
  - `client/src/App.tsx` — /coaching route made public
  - `client/src/pages/Coaching.tsx` — conditional Layout, back button
  - `client/src/pages/Admin.tsx` — mood summary chart, funnel redesign (FunnelRow), mood color gradient
  - `client/src/pages/admin/AdminEmails.tsx` — email stats KPIs, open/click columns
  - `client/src/pages/admin/AdminRevenue.tsx` — invoice creator with AI extract, database enrichment, Stripe lookup
  - `client/src/pages/admin/AdminUsers.tsx` — "Generate Invoice" button on user detail panel
  - `client/src/pages/admin/AdminContent.tsx` — positive highlights card for mood check-ins
  - `client/src/pages/admin/adminTypes.ts` — trackingId, openCount, clickCount on EmailLog type
- **Notes for Next Session:**
  - NEEDS REDEPLOY for all changes to take effect (21+ commits ahead of origin)
  - Run `npm run db:push` on production for email tracking columns (trackingId, openCount, clickCount)
  - Drip email processor now sends max 1 email per user per hour, max 2 per day — emails will trickle out naturally
  - Invoice creator uses `/api/ai-prompt` for extraction (counts against AI usage quota)
  - Tracking pixel/click URLs hardcoded to `https://challenge.mattwebley.com` — only works on production

### 2026-02-10 (Session 6) - Coaching Admin Major Build-out, Session Editing, Rebooking Links
- **Tasks Completed (across 2 continued conversations):**
  - **Coaching data fix — missing clients**:
    - Fixed null email bug in `all-coaching-clients` endpoint that silently skipped users
    - Coaching data lives in 3 sources (coachingPurchases, users.coachingPurchased, pendingPurchases) — all 3 now queried
  - **Dismiss coaching clients**:
    - Added `dismissed` boolean column to coachingPurchases schema
    - Dismiss endpoint cleans ALL 3 data sources atomically (set coachingPurchased=false, mark purchases dismissed, delete pendingPurchases coaching entries)
  - **Add Client manually**:
    - `POST /api/admin/coaching-clients/add` — admin can add coaching client by email
    - Add Client form in admin Coaching Clients section
  - **Per-coach client overview in admin**:
    - Each coach card has expandable "Clients" button showing assigned clients
    - Visual progress bars (green=done, blue=booked, grey=pending)
    - Click client to expand individual session details
    - Financial info: client revenue (what they paid) + coach cost (completed sessions × rate)
  - **Compact coach cards**:
    - Avatar + name + stats always visible; setup details (email, cal link, rate, edit, deactivate) hidden behind gear icon
    - "View as Coach" link in details panel
    - Signed agreement viewable via click on badge
  - **Setup & Settings collapsed section**:
    - Cal.com integration and Coach Invitations moved to collapsed "Setup & Settings" card at bottom
  - **Expandable transaction details in AdminRevenue**:
    - Transaction rows clickable, show selectable detail grid (name, email, product, amount, date, Stripe charge ID)
  - **Coach financial info**:
    - Admin per-coach view: shows "Paid £X" (revenue) and "Coach cost: £X" per client
    - Coach dashboard: shows earned per client + potential total
  - **Coach nudge email**:
    - "Nudge to Book" button on coach dashboard sends reminder email
    - `sendCoachNudgeEmail()` function + `POST /api/coach/clients/:purchaseId/nudge` endpoint
  - **Admin session editing**:
    - `PATCH /api/admin/coach-sessions/:id` endpoint — admin can change session status, completedAt, scheduledAt, coachNotes
    - Session status badges in admin per-coach client view are now dropdown selects (Pending/Booked/Done/Cancelled)
    - All Sessions table also has editable status dropdowns
  - **Coach rebooking link**:
    - `POST /api/coach/clients/:purchaseId/rebook` — creates Stripe checkout for 4 more sessions at the same price client originally paid
    - `sendCoachingRebookEmail()` — sends client the payment link
    - Green "Send Rebooking Link" button replaces "Nudge to Book" when client's sessions are all used up
    - Confirmation prompt shows the price before sending
- **Files Modified:**
  - `shared/schema.ts` — Added `dismissed` boolean to coachingPurchases
  - `server/routes.ts` — New endpoints: add client, dismiss client, coach agreements, nudge, update session, rebook link. Updated all-coaching-clients to filter dismissed + fix null email
  - `server/emailService.ts` — Added `sendCoachNudgeEmail()`, `sendCoachingRebookEmail()`
  - `server/webhookHandlers.ts` — Added `dismissed: false` to synthetic records
  - `client/src/pages/admin/AdminCoaches.tsx` — Major redesign: compact coach cards, gear icon details, per-coach client drill-down, financial info, session status dropdowns, add/dismiss client, Setup & Settings section
  - `client/src/pages/admin/AdminRevenue.tsx` — Expandable transaction detail rows
  - `client/src/pages/CoachDashboard.tsx` — Earnings per client, nudge button, rebooking link button
- **Notes for Next Session:**
  - NEEDS REDEPLOY for ALL changes to take effect (49 commits ahead of origin)
  - Run `npm run db:push` on production for `dismissed` column
  - After deploy: manually add 2 missing coaching clients, dismiss Matt, assign clients to James
  - Stripe webhook handles rebooking payments automatically (same `coaching`/`coaching-matt` productType)
  - Rebooking always creates 4 sessions at the same total price the client originally paid

### 2026-02-08 (Session 4) - Day 2 Pain Points Bug Fix, Admin Email Improvements, Drip Email Updates
- **Tasks Completed:**
  - **Day 2 Pain Points Bug Fix** (customer-reported: Paul Hampton):
    - Pain points were cleaned at render time but stored uncleaned, causing mismatch between displayed items and `selectedPainPoints` state
    - Added `cleanPainText()` helper — cleans pain points once at entry (AI generation + saved data load)
    - Removed render-time cleaning to prevent mismatches
    - Reset `selectedPainPoints` to `[]` when regenerating pain points
    - Improved error message: "Maximum 5 selected. Remove one first to add another."
  - **Admin Email: Editable Time Delays**:
    - Added `dayTrigger` to `updateDripEmail` in storage + routes
    - Added "Send after (days)" number input in admin email edit panel
    - Only shown for initial engagement and nag emails (not daily drip/milestone)
  - **Admin Email: Test Email Variables Fix**:
    - Test drip email endpoint was missing `COACHING_URL`, `REFERRAL_URL`, `CRITIQUE_URL`, `SHOWCASE_URL`
    - Added all 4 missing variables so test emails match real sends
  - **Unlock Page Admin Preview Fix**:
    - `/unlock` page was redirecting admins to dashboard (allDaysUnlocked = true)
    - Added admin exception so Matt can preview the page
  - **Drip Email Greeting Updates**:
    - Changed ~28 emails from `{{firstName}}...` → `Hi {{firstName}},`
    - Changed 2 emails from `{{firstName}},` → `Hi {{firstName}},`
    - Left `Hey {{firstName}},` emails as-is (already natural)
    - Added startup migration to update existing database emails
  - **Drip Email #2 Story Fix**:
    - Removed fictional backstory ("When I built my first software product years ago...")
    - Replaced with honest framing about common validation mistakes
    - Added database migration for existing email
  - **Legal Footer Address Update**:
    - Removed "Building A1, Dubai Digital Park" from all email footers
    - Now just "Dubai Silicon Oasis, Dubai, United Arab Emirates"
    - Updated in `emailService.ts` (2 places) and `routes.ts` (1 place)
- **Files Modified:**
  - `client/src/components/Day2IdeaValidator.tsx` — Pain points bug fix (cleanPainText helper, removed render-time cleaning)
  - `client/src/pages/admin/AdminEmails.tsx` — Editable dayTrigger for drip emails
  - `client/src/pages/Unlock.tsx` — Admin can preview unlock page
  - `server/storage.ts` — Added dayTrigger to updateDripEmail type
  - `server/routes.ts` — dayTrigger in PATCH endpoint, test email variables fix, address update
  - `server/emailService.ts` — Address update in legal footers
  - `server/dripEmailSeed.ts` — Greeting changes, email #2 story fix
  - `server/index.ts` — One-time database migration (greetings + email #2 story)
- **Notes for Next Session:**
  - NEEDS REDEPLOY for all changes to take effect
  - Remove one-time startup migration from `server/index.ts` after first successful deploy
  - Day 2 pain points fix should resolve Paul Hampton's bug — verify after deploy
  - All drip email greetings now use "Hi" or "Hey" — check a test email to confirm

### 2026-02-06 (Session 3) - Major Security Audit, Bump Offer, Focus Button Fix
- **Tasks Completed:**
  - **Bump Offer ("Unlock All Days")** - fully implemented:
    - Created Stripe product `prod_TvYOg7olMygIHU` with USD $29 / GBP £19 prices
    - Bump now appears as visible line item in Stripe Checkout (not charged secretly via webhook)
    - LAUNCHOFFER coupon restricted to challenge product only (won't discount the bump)
    - Old unrestricted LAUNCHOFFER promo code deactivated, new product-scoped one created
    - Removed separate webhook bump charge (was confusing customers - they didn't see it at checkout)
    - Updated Order.tsx note: "Promo codes apply to the challenge only, not this add-on"
  - **Focus Button mobile fix** - dropdown was cut off on mobile:
    - Changed dropdown from `left-0` to `right-0` so it opens leftward (stays on screen)
    - Moved FocusButton from Dashboard content into Layout mobile header (replaces Bug icon)
    - Bug/Report Problem icon moved back to bottom of page (was already there, just removed from mobile header)
    - Dashboard FocusButton hidden on mobile (`hidden lg:block`) to avoid duplicate
  - **MAJOR SECURITY AUDIT AND FIXES:**
    - **Disabled Replit OAuth login** - `/api/login` now redirects to `/auth-error` login page
    - **11 admin endpoints secured with `isAdmin` checks** (were only checking `isAuthenticated`):
      - pending-comments, comments status, brand-settings
      - All 7 chatbot admin endpoints (settings GET/POST, messages, flagged, users, user history, review, flag)
    - **10 AI endpoints secured with `challengePurchased` check** (prevent unpaid users burning Claude API credits):
      - generate-ideas, ai-prompt, analyze-design, research-competitors, generate-usp-features
      - ai/generate-features, ai/generate-mvp-roadmap, ai/generate-prd, ai/generate-prd-details, chat
    - **6 content creation endpoints secured with `challengePurchased` check**:
      - comments, showcase, testimonial, questions, critique/submit
    - **Day completion endpoint** now checks `challengePurchased` before allowing any day
    - **Client-side payment gate** in App.tsx: authenticated non-paying users redirected to /order
    - **Password login** now uses `timingSafeEqual` (was imported but using `!==`)
    - **`/api/auth/user`** now strips `passwordHash`, `adminNotes`, `stripeCustomerId` from response
    - **Rate limiting** added to login (5 attempts/email/15min) and magic-link (3 requests/email/hour)
    - **Day content endpoints** (`/api/days`, `/api/days/:day`) now require auth + purchase check
    - **Comments and questions endpoints** now require authentication
    - **Self-delete guard** fixed: `req.user.id` changed to `req.user.claims.sub`
    - **Webhook secret** debug logging removed from production
  - **Admin panel caching fix** - `staleTime: 30_000` added to admin users queries in Admin.tsx, AdminUsers.tsx, AdminMarketing.tsx (was `Infinity`, data never refreshed)
- **Stripe Changes:**
  - New product: "Unlock All 21 Days" (`prod_TvYOg7olMygIHU`)
  - New prices: `price_1SxhHpLcRVtxg5yVD93NYLz6` (USD $29), `price_1SxhHpLcRVtxg5yVeJC8rNlY` (GBP £19)
  - New coupon `7oDvtMnK` (75% off, restricted to challenge product only)
  - New promo code `promo_1SxhIbLcRVtxg5yVmC7w3U8l` (LAUNCHOFFER, linked to new restricted coupon)
  - Old promo code `promo_1SxIpPLcRVtxg5yVQpiewygH` deactivated
- **Files Modified:**
  - `server/routes.ts` - Security fixes (admin checks, purchase checks, rate limiting, auth on public endpoints, password timing-safe, user data stripping)
  - `server/webhookHandlers.ts` - Removed separate bump charge, removed webhook secret logging
  - `server/replitAuth.ts` - Disabled Replit OAuth login
  - `client/src/App.tsx` - Client-side payment gate for non-paying users
  - `client/src/pages/Order.tsx` - Updated bump offer note text
  - `client/src/pages/Dashboard.tsx` - Hidden FocusButton on mobile
  - `client/src/pages/Admin.tsx` - Added staleTime: 30_000 to users query
  - `client/src/pages/admin/AdminUsers.tsx` - Added staleTime: 30_000 to users query
  - `client/src/pages/admin/AdminMarketing.tsx` - Added staleTime: 30_000 to users query
  - `client/src/components/FocusButton.tsx` - Fixed dropdown positioning (right-0)
  - `client/src/components/layout/Layout.tsx` - Moved FocusButton to mobile header
- **Notes for Next Session:**
  - NEEDS REDEPLOY for all security fixes to take effect
  - Dev database is separate from production - only 1 user in dev, production has real customers
  - 5 pending purchases never created accounts (magic links unused)
  - Consider adding pending customers view to admin panel
  - No CSRF protection on the app (low priority, mitigated by sameSite: lax)
  - XSS risk in badge share pages (badge name/description injected into HTML unescaped)

### 2026-02-05 (Session 2) - Admin Dashboard Redesign, Day Drip Security Fix
- **Tasks Completed:**
  - **Admin Dashboard Visual Redesign** — all 6 admin files restyled (styling only, zero functionality changes):
    - KPI cards: colored left borders (blue/green/amber/emerald), matching icon backgrounds, larger numbers
    - Needs Attention panel: amber accent border, amber count badges, AlertTriangle icon
    - Tab navigation: active tab bg, red badge for pending content items
    - Charts: shadow-sm, header separators
    - Student table: semantic status badges (green=completed, blue=active, slate=inactive)
    - User Funnel: shadow-sm, bordered key metric sub-cards
    - AdminUsers: green/slate payment pills, blue admin badge, colored activity log categories, red top bars on delete/ban modals
    - AdminRevenue: fixed `bg-amber-50` design violation on Grant Access box, refunded red pill badge, active/inactive coupon left borders, red top bar on refund modal
    - AdminContent: amber/blue/green critique status badges, amber flagged indicator, green approve buttons, showcase hover shadows, blue featured testimonial border
    - AdminMarketing: colored announcement type icons (blue/amber/green/purple), A/B test shadows, green leading trophy
    - AdminSettings: red left border on flagged messages when present, disabled email templates get opacity + red badge
  - **SECURITY FIX: Server-side day drip enforcement** added to `POST /api/progress/complete/:day`:
    - Validates day number (0-21)
    - Checks previous day is completed before allowing current day
    - Checks time-based drip (Day 0 & 1 immediate, then 1 per calendar day since signup)
    - Coaching purchasers and admins bypass all restrictions
    - Previously ALL day access control was client-side only (sidebar UI) — anyone could complete any day via direct API call
- **Files Modified:**
  - `client/src/pages/Admin.tsx` — Overview tab visual redesign
  - `client/src/pages/admin/AdminUsers.tsx` — Users tab visual redesign
  - `client/src/pages/admin/AdminRevenue.tsx` — Revenue tab visual redesign
  - `client/src/pages/admin/AdminContent.tsx` — Content tab visual redesign
  - `client/src/pages/admin/AdminMarketing.tsx` — Marketing tab visual redesign
  - `client/src/pages/admin/AdminSettings.tsx` — Settings tab visual redesign
  - `server/routes.ts` — Added server-side day access enforcement
- **Security Issues Discovered:**
  - `/api/days` and `/api/days/:day` are public endpoints (no auth) — anyone can read lesson descriptions
  - `/api/progress/complete/:day` had NO validation — now FIXED
  - Day access was purely a frontend UI restriction in sidebar — now server enforces it too
- **Notes for Next Session:**
  - Needs REDEPLOY for server-side day drip enforcement to take effect
  - User is considering a "Unlock All Days" bump offer at checkout (~$29 for $99 challenge)
  - Still need to decide: gate `/api/days/:day` endpoint with auth, or leave public (lesson text only, no completion)
  - Bump offer needs: Stripe product creation, checkout page checkbox, webhook handling

### 2026-02-05 (Session 1) - Stripe Webhook Fix, Magic Links, Settings Page
- **Tasks Completed:**
  - Fixed Stripe webhook failures (57 failures since Jan 30)
    - Created new webhook endpoint in Stripe with new secret
    - Webhook now returns 200 successfully
  - Fixed magic link URLs using wrong domain (Replit dev URL instead of production)
    - `server/routes.ts` - Magic link endpoint now hardcodes production URL
    - `server/routes.ts` - Admin answer URL now hardcodes production URL
  - Created admin tool to manually grant access to customers
  - Implemented magic link authentication flow for new customers:
    - 30-day token validity (not 15 minutes)
    - `sendWelcomeAccessEmail` function for welcome emails
    - Welcome page handles both authenticated and non-authenticated users
  - Added password setup functionality on Welcome page
  - Updated AuthError.tsx to show email/password login as default
  - Fixed coaching upsell "No thanks" button (was tiny text, now proper button)
  - Made chat widget smaller on mobile (just icon, no text)
  - Fixed Settings page - now shows real user data and saves changes
    - Added `PUT /api/auth/user` endpoint for profile updates
    - Settings page fetches real user data
    - Users can update first name and last name
- **Files Modified:**
  - `server/routes.ts` - Magic link fix, profile update endpoint
  - `server/webhookHandlers.ts` - Magic link generation for guest purchases
  - `server/emailService.ts` - Added `sendWelcomeAccessEmail` function
  - `client/src/pages/Welcome.tsx` - Password setup, non-auth handling
  - `client/src/pages/AuthError.tsx` - Email/password login form
  - `client/src/pages/CoachingUpsell.tsx` - Fixed No thanks button
  - `client/src/pages/Settings.tsx` - Made functional with real data
  - `client/src/components/ChatWidget.tsx` - Mobile size fix
- **Emails Sent:**
  - Sent welcome emails to 5 customers who paid today
  - Sent apology emails with fresh magic links to same 5 customers
- **Notes for Next Session:**
  - User needs to REDEPLOY for magic link URL fix to take effect
  - Test the full purchase flow after redeploy
  - Audit remaining database email templates for correct URLs

### 2026-02-03 (Session 2) - Videos Complete, Day 20 Styling Fix
- **Tasks Completed:**
  - Added ALL remaining videos (Days 13-21) - all 22 days now have videos
  - Fixed Day 20 design to match app's design system:
    - Changed icon containers from `rounded-full` to `rounded-lg`
    - Replaced `Card` component with `div className={ds.cardWithPadding}`
    - Used proper typography classes (`ds.body`, `ds.muted`, `ds.label`)
    - Standardized info boxes with `ds.infoBoxHighlight`
  - Fixed Day 9 Mastery Progress mobile overflow (labels hidden on small screens)
- **Files Modified:**
  - `client/src/pages/Dashboard.tsx` - Added Days 13-21 videos and thumbnails
  - `client/src/components/Day20GetFound.tsx` - Complete styling overhaul
  - `client/src/components/Day9ClaudeCodeMastery.tsx` - Mobile fix for progress labels
- **No New Issues Discovered**
- **Notes for Next Session:**
  - All videos now complete (Days 0-21)
  - Pending tasks remain: test AI Mentor, test Showcase, add Namecheap affiliate ID, coaching links

### 2026-02-03 (Session 1) - Videos, Security, CLAUDE.md Template
- **Tasks Completed:**
  - Added 14 Loom videos (Days 0-12 + Day 8.1) with thumbnails
  - Security audit and fixes (Test Mode admin-only, debug endpoints secured)
  - Fixed comment sanitization (HTML entities)
  - Created new CLAUDE.md template for non-technical builders
  - Updated Day 8 with new template

*See CLAUDE.md.backup for previous version. See CLAUDE_ARCHIVE.md for older session logs.*
