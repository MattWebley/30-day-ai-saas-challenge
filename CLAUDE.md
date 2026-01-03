# Project: 21 Day AI SaaS Challenge

## Rules for Claude (Always Follow)

### CLAUDE.md Management
- Always read this file at the start of every session.
- Update the Session Log at the end of every session with completed tasks and fixes.

### GitHub Safety
- Always commit the current working code before starting edits.
- If a change may break existing functionality, create a new branch and explain why.
- Write clear, descriptive commit messages for all changes.

### Preserve Functionality
- Do not remove or alter working features unless explicitly instructed.
- If a change risks regression, stop and explain the impact before proceeding.

### Code Changes
- Keep changes incremental and well-commented.
- Highlight what was added, removed, or updated.

### Verification
- After edits, run tests or basic checks to confirm nothing is broken.
- Report any errors, warnings, or issues that appear.

### General
- Treat GitHub as the single source of truth.
- All steps must be safe, reversible, and transparent.

---

## Project Overview
A gamified 21 Day AI SaaS Challenge application that guides users from idea to launch-ready product through daily 5-minute micro-tasks. The app provides structured guidance, tracks progress, and uses AI to personalize the learning experience.

### Challenge Structure (21 Days)
- **Week 1 (Days 1-7)**: Idea & Planning - Find idea, validate, features, name, tech stack, PRD
- **Week 2 (Days 8-10)**: Build & Verify - Master Claude Code, reality check, fix & iterate
- **Week 3 (Days 11-14)**: Make It Work - Test USP, feature testing, AI brain, APIs
- **Week 4 (Days 15-18)**: Infrastructure - Auth, email, onboarding, admin dashboard
- **Week 5 (Days 19-21)**: Polish & Launch - Mobile ready, brand polish, LAUNCH

## Tech Stack

### Frontend
- React 19.2.0
- Vite 7.1.9 (build tool & dev server)
- TypeScript 5.6.3
- Tailwind CSS 4.1.14
- Radix UI (component library)
- Wouter 3.3.5 (routing)
- TanStack Query 5.60.5 (data fetching)
- Framer Motion (animations)
- React Hook Form + Zod (form validation)

### Backend
- Node.js with Express 4.21.2
- TypeScript (tsx for dev, compiled for production)
- Passport.js (authentication - local strategy)
- Express Session (session management)

### Database
- PostgreSQL
- Drizzle ORM 0.39.3
- Drizzle Kit 0.31.4 (migrations)

### AI Integration
- OpenAI 6.10.0

### Real-time
- WebSockets (ws 8.18.0)

### Additional Tools
- GitHub Integration (@octokit/rest 22.0.0)
- Date manipulation (date-fns)
- Toast notifications (sonner)

## Project Structure

```
/client          - Frontend React application
  /src           - React components, pages, hooks
/server          - Express backend API
  /index.ts      - Main server entry point
  /routes        - API route handlers
/shared          - Shared TypeScript types and utilities
/script          - Build scripts
/attached_assets - Project assets and media
drizzle.config.ts - Database configuration
vite.config.ts    - Vite build configuration
components.json   - shadcn/ui component config
```

---

## Day Page Format (CRITICAL - DO NOT BREAK)

Every day in Dashboard.tsx MUST follow this exact format:

1. **Header** - Day number, phase, title, description (automatic)
2. **Matt Webley's Tip** - If tip exists in database (automatic)
3. **DayInstructions** - "What To Do Today" + "Today's Outcome" (automatic)
4. **Today's Lesson** (Step 1) - Rendered from `dayData.lesson`
5. **Interactive Component** (Step 2) - The day-specific component

### Code Pattern for Each Day:
```tsx
) : currentDay === X ? (
  <>
    {/* Today's Lesson */}
    {dayData.lesson && (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
          <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
        </div>
        <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
          <div className="prose prose-slate max-w-none">
            {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
              <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0">{paragraph}</p>
            ))}
          </div>
        </Card>
      </div>
    )}
    {/* Day X: Component Title */}
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
        <h2 className="font-bold text-xl text-slate-900">Action Title Here</h2>
      </div>
      <DayXComponent ... />
    </div>
  </>
```

### Lessons Must:
- Be stored in `seed.ts` in the `lesson` field for each day
- Be written in Matt's punchy style (ALL CAPS emphasis, short sentences, direct)
- Every day from 0-21 must have a lesson

---

## Current Status
- Status: In Progress
- Last Session: 2026-01-03
- Current Branch: main
- GitHub Repo: MattWebley/30-day-ai-saas-challenge

## Pending Tasks
- [ ] Test Day 1 completion flow (debug logging added - check console)
- [ ] Test Day 2 new shortlist/validation flow end-to-end
- [ ] Test all Day 8-21 components end-to-end
- [ ] Test Day 0 "Start Here" flow end-to-end
- [ ] Test My Progress page with real user data
- [ ] Test Claude Code Guide page (/claude-code) after Day 8 completion
- [ ] Review and update badges for 21-day challenge structure
- [ ] Add Namecheap affiliate ID to Day4Naming.tsx (replace YOUR_AFFILIATE_ID placeholder)
- [ ] Add coaching call booking links to Day 1-7 and Days 19-21
- [ ] Enable "Book a Call" button in Day 2 when ready (add Calendly link + price)
- [ ] Review battle pass progress bar styling on different screen sizes
- [ ] Before launch: Set testMode default to false in TestModeContext.tsx
- [ ] Document current API endpoints
- [ ] Add testing setup (unit & integration tests)
- [ ] Document database schema
- [ ] Set up CI/CD pipeline
- [ ] Add environment variables documentation

## Known Issues
- `.claude/` directory is tracked in git (contains local settings)
- Old feature/week1-restructure branch can be deleted (already merged)
- Day 1 completion may not work - debug logging added, needs testing
- Badges may be outdated for 21-day structure (user reported)

---

## Session Log

### 2025-12-13 - CLAUDE.md Setup & Documentation
- Tasks Completed:
  - Created CLAUDE.md with project rules
  - Connected local repository to GitHub (MattWebley/30-day-ai-saas-challenge)
  - Merged local and remote Git histories
  - Updated CLAUDE.md with actual project information
  - Documented complete tech stack and project structure
- Fixes Applied:
  - None
- Notes:
  - Repository successfully synced with GitHub
  - CLAUDE.md now serves as central documentation hub
  - Ready for next development phase

### 2025-12-19 - Day 2 & Day 3 Improvements
- Tasks Completed:
  - Fixed overly specific AI pain point generation (removed percentages/metrics from prompts)
  - Fixed scroll-to-top behavior throughout app (App.tsx) and Day 2 step transitions
  - Removed copy/paste prompt functionality from Day 2
  - Added built-in AI validation with manual validation methods
  - Made market viability check more concise (4 lines max: DEMAND, MARKET SIZE, TOP RISK, VERDICT)
  - Improved AI response presentation with native formatting (removed "AI Analysis" headers)
  - Made competitor URLs clickable and open in new tabs
  - Removed re-run button (only shows before first analysis)
  - Complete Day 2 UI redesign to match app design language (removed AI branding, gradients)
  - Updated validation note text to emphasize real customer validation
  - Removed redundant "pain points" from Day 3 outcome text
- Fixes Applied:
  - Fixed missing CheckCircle2 import causing Day 2 crash
  - Fixed URL links not opening in new tabs (added explicit onClick handler with window.open)
  - Fixed custom pain points causing crash (implemented stable React keys)
  - Fixed re-run button showing incorrectly (added conditional rendering)
  - Fixed scroll behavior using instant scroll instead of smooth
  - Fixed dark hover transitions (removed transition-all classes throughout Day 2)
- Notes:
  - Day 2 extensively redesigned for consistency with rest of app
  - All AI prompts optimized for conciseness and usefulness
  - URL detection and rendering working properly with regex parser
  - Database reseeded with updated Day 3 outcome
  - Changed Day 2 from "AI-branded" to professional "Quick Research Tools"
  - All cards now use white backgrounds with border-2 border-slate-200

### 2025-12-19 (Session 2) - End of Day Wrap-up
- Tasks Completed:
  - Committed WIP changes to feature/week1-restructure branch
  - Major seed.ts restructure with updated badges and Week 1 day content
  - Simplified Day 1 complete button (removed tooltip wrapper)
  - Added debug logging to completion flow for troubleshooting
- Fixes Applied:
  - None (debug session)
- Notes:
  - Feature branch `feature/week1-restructure` is 3 commits ahead of main
  - Seed data includes restructured badges (Clarifier, Builder, Integrator, Feature Master) and new 21-day streak badge
  - Day content updated for Week 1 structure
  - Debug console.logs added to track completion flow - need to remove before merging to main
  - Next session should: test completion flow, remove debug logs, merge to main, run db:push

### 2025-12-19 (Session 3) - Complete Days 4-30 Components
- Tasks Completed:
  - Created all Day 8-30 interactive components (22 new components)
  - Day4Naming.tsx - AI name generator using context from Days 2-3
  - Day8FirstBuild.tsx through Day14SafetyNet.tsx (Week 2 components)
  - Day15SuperpowerSelector.tsx through Day25SpeedBoost.tsx (Weeks 3-4 components)
  - Day26DataExport.tsx through Day30LaunchDay.tsx (Final week components)
  - Updated Dashboard.tsx with all component imports and routing
  - Day 4 now focused on naming: education on .com domains, pricing ($10-15/year), Namecheap affiliate links
  - Added social media registration checklist (Twitter/X, Instagram, LinkedIn, TikTok, GitHub)
  - Updated seed.ts Day 4 content for naming focus ("Name It & Claim It")
- Fixes Applied:
  - Fixed Day16AIBrain missing userIdea prop
  - Fixed Day18EmailSetup missing appName prop
- Notes:
  - All 30 days now have interactive components
  - Day 4 requires domain registration before proceeding
  - Each day component passes context from previous days where applicable
  - Branch feature/week1-restructure now 7 commits ahead of main
  - Ready for testing and merge to main

### 2025-12-30 - Branch Merge & Cleanup
- Tasks Completed:
  - Removed debug console.logs from Dashboard.tsx and Day1IdeaGenerator.tsx
  - Ran database seed to apply updated Day content
  - Merged feature/week1-restructure branch into main
  - Pushed all changes to remote
- Fixes Applied:
  - Cleaned up completion flow logging (production-ready)
- Notes:
  - All 30 Day components now merged to main
  - TypeScript check passing
  - Database seeded with latest content
  - Branch feature/week1-restructure successfully merged

### 2025-12-30 (Session 2) - Major Restructure: 30 Days → 21 Days
- Tasks Completed:
  - Restructured entire challenge from 30 days to 21 days
  - Created 14 new interactive Day components (Day8-Day21):
    - Day8ClaudeCode.tsx - Claude Code mastery with prompt templates
    - Day9RealityCheck.tsx - PRD vs Reality audit tool
    - Day10FixIterate.tsx - Fix workflow with PAUSE button
    - Day11TestUSP.tsx - USP verification checklist
    - Day12FeatureTesting.tsx - Feature test suite builder
    - Day13AIBrain.tsx - OpenAI integration setup
    - Day14ConnectAPIs.tsx - API connections checklist
    - Day15Authentication.tsx - Auth method selection (Replit Auth recommended)
    - Day16Email.tsx - Email setup with Resend
    - Day17Onboarding.tsx - User onboarding flow builder
    - Day18AdminDashboard.tsx - Admin panel setup
    - Day19MobileReady.tsx - Mobile responsiveness checks
    - Day20BrandBeauty.tsx - Brand polish with color picker
    - Day21LaunchDay.tsx - Pre-launch checklist + LAUNCH button
  - Deleted 31 old/unused Day component files
  - Updated seed.ts with new 21-day content structure
  - Updated seed.ts to use onConflictDoUpdate (fixes stale data issue)
  - Updated Dashboard.tsx with new component routing
  - Created battle pass style progress tracker in Sidebar:
    - Level display with current day / 21
    - 5 milestone nodes: Plan, Build, Test, Scale, Launch
    - Visual progress track with gradient fill
    - Current milestone pulse animation
    - XP progress bar to next milestone
  - Updated branding from "30 Day" to "21 Day AI SaaS Challenge"
  - Cleaned up database (removed days 22-30)
- Fixes Applied:
  - Fixed seed.ts using onConflictDoNothing (wasn't updating existing records)
  - Fixed Day13AIBrain missing userIdea prop in Dashboard routing
  - Removed days 22-30 from database
- Notes:
  - New 5-week structure focused on building (not sales/marketing)
  - Days 1-7 unchanged (locked as requested)
  - Each new day has interactive element, todo list, and outcome
  - PAUSE functionality added to Day 10 for iterative work
  - Coaching call placements: Idea validation (Days 1-7), Build a Business (Days 19-21)
  - TypeScript check passing
  - Database seeded with all 21 days

### 2026-01-01 - Minor UI Fix
- Tasks Completed:
  - Shortened Day 1 title from "Choosing Your PERFECT $100K+ Idea" to "Choosing Your $100K+ Idea"
  - Reseeded database with updated title
- Fixes Applied:
  - Day 1 title now fits properly in sidebar navigation
- Notes:
  - Brief session with single UI tweak
  - All pending tasks from previous session remain open
  - Next priority: Test Day 8-21 components end-to-end

### 2026-01-02 - Day 0 "Start Here" Onboarding Experience
- Tasks Completed:
  - Created Day0StartHere.tsx - full onboarding/commitment flow:
    - Welcome header with journey milestone preview (Idea → Plan → Build → Polish → Launch)
    - 4 "Rules for Success" with tap-to-commit interaction and progress badge
    - "What's Your Why" section - 8 selectable motivations + custom input
    - 12-month income goal selector (6 preset options + custom)
    - Accountability promise textarea with character minimum
    - Share to community checkbox (posts to Day 0 discussion)
    - Choice screen after completion: "Start Day 1 Now" or "Start Tomorrow"
  - Updated Sidebar milestones from Plan/Build/Test/Scale/Launch to Idea/Plan/Build/Polish/Launch
  - Added Day 0 to seed.ts with phase "Start"
  - Updated Dashboard.tsx routing for Day 0 with redirect logic
  - Auto-posts commitment to discussion when "share" is checked
  - Updated DayInstructions.tsx language ("micro-decision" → "make your choice")
  - Day 0 now gates Day 1 (must complete Start Here first)
- Fixes Applied:
  - Fixed duplicate tips issue (Matt Webley's tip vs Pro Tip)
  - Fixed "5 minutes a day" claims throughout (changed to "show up daily")
  - Fixed character counter showing "0/20" (now shows "At least X more characters")
  - Fixed button hover states on choice screen (now using Button component)
  - Clarified share checkbox text ("visible to others taking the challenge")
- Notes:
  - All user onboarding data saved: whyReasons, incomeGoal, accountabilityMessage, shareToDiscussion
  - This data can be used for personalized nag/motivation emails
  - Challenge now clearly positioned as "launch-ready" not "launch" (no sales/marketing covered)
  - Database reseeded with Day 0 content
  - TypeScript check passing
  - Next priority: Test Day 0 flow end-to-end, then Day 8-21 components

### 2026-01-02 (Session 2) - Complete Day 8-21 Component Overhaul
- Tasks Completed:
  - Completely rewrote all Day 8-21 components with action-oriented, multi-step workflows
  - Each day now has: concrete actions, documentation of wins, celebratory messaging
  - **Day 8 (First Build Win)**: Choose → Build → Document what you built
  - **Day 9 (Reality Check)**: Test → Document (what works/needs fix) → Prioritize
  - **Day 10 (Fix & Iterate)**: Focus on ONE issue → Fix it → Document the fix
  - **Day 11 (Test USP)**: Define USP → Test it live → Answer "would someone pay?"
  - **Day 12 (Feature Testing)**: Test mission → Document bugs → Fix/acknowledge
  - **Day 13 (AI Brain)**: Plan ONE AI feature → Build it → Test and document wow factor
  - **Day 14 (Connect APIs)**: Decide if needed → Connect ONE API → Verify it works
  - **Day 15 (Authentication)**: Choose method → Implement → Test login flow
  - **Day 16 (Email Setup)**: Plan first email → Setup Resend → Send test and verify
  - **Day 17 (Onboarding)**: Define first success → Build path → Time and test it
  - **Day 18 (Admin Dashboard)**: Choose metrics → Build dashboard → Check your stats
  - **Day 19 (Mobile Ready)**: Test on actual phone → Document issues → Fix or note
  - **Day 20 (Brand Polish)**: Pick color → Apply branding → Verify it looks professional
  - **Day 21 (Launch Day)**: Pre-launch checklist → BIG LAUNCH BUTTON → Celebrate and plan next steps
  - Updated Dashboard.tsx with correct props for all new component interfaces
- Fixes Applied:
  - Fixed all component props (userIdea, appName, topPriority) passed from Dashboard
  - Fixed Day 9 prop from `prd` to `userIdea`
  - Fixed Day 10 to pass `topPriority` from Day 9 completion data
  - Changed all Day 2 references from `selectedIdea` to `chosenIdea`
- Pattern Changes:
  - All days now return meaningful completion data (not just checkbox counts)
  - Trophy/celebration messaging for wins
  - Multi-step workflows: plan → do → document
  - Focus on ONE thing per day (not checklists)
  - Removed copy/paste prompts in favor of inline guidance
  - Consistent styling: white backgrounds, slate borders, primary accents
- Notes:
  - TypeScript check passing
  - All 14 Day components completely rewritten (Day 8-21)
  - Each day now gives users a tangible win and sense of progress
  - Ready for testing

### 2026-01-03 - My Progress Page & Day Component Enhancements
- Tasks Completed:
  - Created BuildLog.tsx: comprehensive "My Progress" page
    - Shows all user decisions and milestones organized by phase (Start/Idea/Plan/Build/Polish/Launch)
    - Accordion-based navigation with expandable day details
    - Displays day-specific data (ideas, features, auth method, brand colors, etc.)
    - Stats bar showing days completed, current streak, and total XP
    - Empty state for new users with encouraging messaging
  - Enhanced all Day 8-21 components with refined multi-step workflows:
    - Day 8: Choose quick win → Build → Document what you built
    - Day 9: Test → Document (works/needs fix) → Prioritize
    - Day 10: Focus ONE issue → Fix → Document the fix
    - Day 11: Define USP → Test live → Answer "would someone pay?"
    - Day 12: Test mission → Document bugs → Fix/acknowledge
    - Day 13: Plan AI feature → Build → Document wow factor
    - Day 14: Decide API need → Connect ONE → Verify works
    - Day 15: Choose auth → Implement → Test login flow
    - Day 16: Plan email → Setup Resend → Send test
    - Day 17: Define success → Build path → Time and test
    - Day 18: Choose metrics → Build dashboard → Check stats
    - Day 19: Test on phone → Document issues → Fix or note
    - Day 20: Pick color → Apply branding → Verify professional
    - Day 21: Pre-launch checklist → LAUNCH → Celebrate
  - Added "My Progress" link to Sidebar navigation
  - Updated App.tsx with /build-log route
  - Updated Dashboard.tsx with correct component props
  - Updated server/routes.ts for progress data retrieval
- Fixes Applied:
  - All component props correctly passed from Dashboard
  - FileText icon import added to Sidebar
- Notes:
  - TypeScript check passing
  - Users can now see their complete journey from Day 0 to Day 21
  - Progress page shows what decisions were made on each day
  - Next priority: Test complete user flow including new progress page

### 2026-01-03 (Session 2) - Content & Format Consistency Pass
- Tasks Completed:
  - Added mentorship CTAs to Days 19-21:
    - Day 19: Soft CTA about building something real
    - Day 20: Soft CTA building narrative toward business
    - Day 21: Hard CTA linking to mattwebley.com/workwithmatt
  - Rewrote all Day 8-18 lessons in Matt's punchy writing style:
    - ALL CAPS emphasis, short sentences, direct tone
    - Matches existing Day 1-7 lesson format
  - Fixed lesson rendering for Days 3-21 in Dashboard.tsx:
    - Was only showing lessons for Days 1-2
    - Added lesson + component pattern to all days
  - Added `whitespace-pre-line` CSS class to preserve line breaks in lessons
  - Completed DayInstructions.tsx with all 22 days:
    - Was only Days 0-6, now includes all days 0-21
    - Each day has 4-5 specific action items
  - Updated badges to match new timeline:
    - Fixed "First Steps" description (was "Million Dollar Idea", now "$100K+ Idea")
    - Added "Launch Ready" badge for completing Day 20
  - Documented Day Page Format in CLAUDE.md to prevent regression
- Fixes Applied:
  - Fixed line breaks not displaying in lessons (whitespace-pre-line)
  - Fixed missing "What To Do Today" instructions for Days 7-21
  - Fixed Week 5 missing badge (added "Launch Ready")
- Notes:
  - Every day now verified to have: lesson, to-do list, outcome, Matt's tip, interactive exercise
  - Day format pattern documented in CLAUDE.md
  - TypeScript check passing
  - Database seeded with all content updates

### 2026-01-03 (Session 3) - Day 2 Redesign & Report Problem Feature
- Tasks Completed:
  - **Report Problem Feature**: Created ReportProblem.tsx component
    - Captures debug info: user data, progress, browser info, timestamp
    - Modal with problem description textarea
    - Generates mailto link to matt@mattwebley.com with all debug data
    - Added to Layout.tsx (mobile header + page footer on all pages)
  - **Day 2 Complete Redesign**: New shortlist validation flow
    - Shows "Your Shortlist from Day 1" with all 3-5 ideas
    - Each idea displays Day 1 score and can get AI validation insights
    - Validation shows: Demand Score (1-10), Competition Level, Top Risk
    - User chooses ONE idea then selects 1-3 pain points
    - Added action-over-perfection motivational message
    - Added "Stuck? Book a Call" section with Coming Soon button
  - Updated server route /api/progress/day2 to save new fields:
    - chosenIdea, chosenIdeaTitle, selectedPainPoints, validationInsights
  - Fixed Dashboard.tsx to read from userInputs instead of completionData
  - Added debug logging to Day 1 completion flow for troubleshooting
- Fixes Applied:
  - Fixed DayCompletionModal showing "Day X/30" instead of "Day X/21"
  - Added toast error when dayData is null in handleComplete
  - Fixed all Dashboard references from completionData to userInputs
  - Fixed field name from selectedIdea to chosenIdea for Day 2 data
- Notes:
  - User reported Day 1 completion "does nothing" - debug logging added
  - User reported badges seem outdated - added to pending tasks
  - Day 2 now has cleaner flow: see all ideas → validate → choose → pain points
  - Book a Call button ready for Calendly link when pricing is set
  - TypeScript check passing
  - All changes committed and pushed to main

### 2026-01-03 (Session 4) - Brief Session Start
- Tasks Completed:
  - Reviewed project status and pending tasks from CLAUDE.md
  - Pulled latest changes (already up-to-date)
  - Summarized session 3 work and priorities for next session
- Fixes Applied:
  - None (no code changes this session)
- Notes:
  - Attempted to start dev server but encountered persistent port 5000 conflicts
  - Port conflicts may be caused by orphaned node processes in Replit environment
  - Next session: Kill all node processes before starting, then debug Day 1 completion flow
  - Priority remains: Test Day 1 completion, Day 2 flow, and Day 0 onboarding

### 2026-01-03 (Session 5) - Claude Code Guide & Day 8/13 Enhancements
- Tasks Completed:
  - **Day 8 - Complete Claude Code Workflow Guide**:
    - Added cost savings messaging: "Why Claude Code? It'll save you THOUSANDS"
    - Explains Replit AI is easy but expensive, Claude Code is same power at fraction of price
    - Simplified "Your Daily Build Routine" - 3 prompts, copy/paste, build
    - Step 1: Install Claude Code (green) - with "Run EVERY session" note
    - Step 2: Session START Prompt (amber)
    - Step 3: Session END Prompt (indigo)
    - Removed technical jargon (git, commits, branches) for biz opp audience
    - Updated Day 8 lesson in seed.ts with cost explanation
  - **Claude Code Guide Page** (`/claude-code`):
    - Created standalone page with all 3 prompts for easy access
    - Large copy buttons, color-coded steps
    - "Bookmark this page" call-to-action
    - Added to sidebar navigation with BookOpen icon
    - Locked until Day 8 complete (shows lock + "Day 8")
    - Unlocks in test mode but still shows lock icon (clickable)
  - **Day 13 - OpenAI API Setup Guide**:
    - 5-step detailed setup flow (all visible immediately, no gating):
      1. Create OpenAI Account & Add Credits ($5-10)
      2. Get Your API Key (with "COPY IT NOW" warning)
      3. Add Key to Replit Secrets (exact UI steps)
      4. Describe Your AI Feature (inline textarea)
      5. Tell Claude Code to Build It (copyable prompt)
    - Direct links to platform.openai.com/signup and /api-keys
    - Copy buttons for secret name and Claude Code prompt
    - Cost info: GPT-3.5 ~$0.002 per 1K tokens
  - **Configuration**:
    - Set test mode default to ON (until launch)
    - Updated reference from "pros" to "1:1 mentorship clients"
- Fixes Applied:
  - Fixed port 5000 conflicts by killing orphaned processes
  - Changed Claude Code Guide icon from Terminal to BookOpen
  - Made Claude Code Guide clickable in test mode while showing lock
  - Removed gated "plan" step from Day 13 - all setup steps now visible immediately
- Notes:
  - All changes committed and pushed to main (10 commits this session)
  - TypeScript check passing
  - Database seeded with updated Day 8 lesson
  - To launch: Change testMode default from `true` to `false` in TestModeContext.tsx
  - Next priority: Test Day 1 completion flow, Day 2 flow, Day 0 onboarding

---

## Project-Specific Rules

### Code Style
- Use TypeScript strict mode
- Follow React 19 best practices (hooks, functional components)
- Use Tailwind CSS utility classes for styling
- Prefer Radix UI components for UI primitives

### Database
- Always use Drizzle ORM for database operations
- Run `npm run db:push` after schema changes
- Never write raw SQL unless absolutely necessary

### API Development
- All API routes should have proper error handling
- Use Zod for request validation
- Follow REST conventions for endpoints
- Session-based authentication via Passport.js

### Development Workflow
- Run `npm run dev` for backend development
- Run `npm run dev:client` for frontend-only development
- Always test locally before committing
- Use `npm run check` to verify TypeScript compilation
