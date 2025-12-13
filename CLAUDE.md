# Project: 30 Day AI SaaS Challenge

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
A gamified 30 Day AI SaaS Challenge application that guides users from idea to launch-ready product through daily 5-minute micro-tasks. The app provides structured guidance, tracks progress, and uses AI to personalize the learning experience.

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
- Last Session: 2025-12-13
- Current Branch: main
- GitHub Repo: MattWebley/30-day-ai-saas-challenge

## Pending Tasks
- [ ] Review existing features and create comprehensive task list
- [ ] Document current API endpoints
- [ ] Add testing setup (unit & integration tests)
- [ ] Document database schema
- [ ] Set up CI/CD pipeline
- [ ] Add environment variables documentation

## Known Issues
- `.claude/` directory is untracked (needs decision: commit or gitignore)

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
