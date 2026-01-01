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

## Current Status
- Status: In Progress
- Last Session: 2026-01-01
- Current Branch: main
- GitHub Repo: MattWebley/30-day-ai-saas-challenge

## Pending Tasks
- [ ] Test all Day 8-21 components end-to-end
- [ ] Add Namecheap affiliate ID to Day4Naming.tsx (replace YOUR_AFFILIATE_ID placeholder)
- [ ] Add coaching call booking links to Day 1-7 and Days 19-21
- [ ] Review battle pass progress bar styling on different screen sizes
- [ ] Document current API endpoints
- [ ] Add testing setup (unit & integration tests)
- [ ] Document database schema
- [ ] Set up CI/CD pipeline
- [ ] Add environment variables documentation

## Known Issues
- `.claude/` directory is tracked in git (contains local settings)
- Old feature/week1-restructure branch can be deleted (already merged)

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
