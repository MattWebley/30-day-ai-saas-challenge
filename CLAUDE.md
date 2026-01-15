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
- **Last Session**: 2026-01-14
- **Branch**: main
- **Repo**: MattWebley/30-day-ai-saas-challenge

## Pending Tasks
- [ ] Test AI Mentor chat bot (check browser console)
- [ ] Test Showcase feature end-to-end
- [ ] Test Day 0 → Day 1 → Day 2 flow
- [ ] Test Day 8-21 components
- [ ] Add Namecheap affiliate ID to Day4Naming.tsx
- [ ] Add coaching call booking links (Days 1-7, 19-21)
- [ ] Enable "Book a Call" button in Day 2 (needs Calendly link)
- [ ] Before launch: Set testMode to false in TestModeContext.tsx

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
