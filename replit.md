# 30 Day AI SaaS Challenge

## Overview

A gamified daily challenge application that guides users from zero to a working AI SaaS MVP in 30 days. Each day delivers structured micro-tasks (5 minutes or less) with AI-generated suggestions, pre-filled templates, micro-decisions, and reflections. The platform features a badge reward system, progress tracking, and daily curriculum content organized into phases (Clarifier, Blueprint Architect, Maker Mode, MVP Builder, Refinement Specialist).

## User Preferences

- **Design Style**: Clean black and white aesthetic like MattWebley.com
- **Font**: Poppins
- **Colors**: Pure black (#000000) text on white (#FFFFFF) backgrounds, blue (#007BFF) accents
- **Border Radius**: 6px
- **Communication**: Simple, everyday language
- **No AI-generated gradient styles** - use intentional, curated color palettes for special elements
- **No generic Lucide icons** - Create custom unique SVG icons instead of using generic AlertTriangle, Target, Star, etc. Icons should be distinctive and on-brand

## Recent Changes

### Day 1-4 Updates (Dec 12, 2025)
- Day 1: Now allows selecting 3-5 ideas (instead of forcing exactly 5)
- Day 2: Hover tooltips on idea cards show full description and target customer
- Day 4: Redesigned as AI-driven screen planner (analyzes features/ICP to recommend screens)
- All prompts clearly labeled as "Prompt" (e.g., "Market Viability Check Prompt")
- Mobile sidebar now scrolls properly

### Day 3: Core Features & USP Generator (Dec 11, 2025)
- Created Day3FeatureBuilder component with competitor analysis prompts
- Step 1: Find Core Features from competitor analysis
- Step 2: Generate USP features based on user skills + competitor gaps
- Editable feature checklist for core + USP features
- Integrated into Dashboard

### Brand Pack in Admin Panel (Dec 11, 2025)
- Added brand settings table to database (brandSettings)
- Admin can customize: primary color, accent color, text color, background color, font family, border radius, logo URL, app name
- BrandProvider component applies settings globally via CSS variables
- Settings persist to database and apply on page load

### Sidebar Improvements (Dec 11, 2025)
- Removed fixed sidebar scroll - now scrolls with page
- Progressive fade on future days (1 ahead = 70%, 2 ahead = 50%, 3+ ahead = 35% opacity)
- Day Streak: warm cream/caramel palette (#FFF8E7 bg, #D4A574 circle)
- My Journey: sage/forest green palette (#E8F4F0 bg, #2D6A4F text)
- Settings and Logout moved inside scrollable area

### Navigation & UX (Dec 11, 2025)
- ScrollToTop component - pages scroll to top on navigation
- All buttons have cursor pointer on hover

### Matt Webley's Tip Box (Dec 11, 2025)
- Added Matt Webley photo (matt-webley.png in client/public)
- Clean black/white design with photo, "Matt Webley's Tip" header

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Animations**: Framer Motion
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Build**: esbuild for production bundling with selective dependency bundling

### Authentication
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Strategy**: Passport.js with openid-client

### Database Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command

### Key Data Models
- **Users**: Authentication and profile data
- **Sessions**: PostgreSQL-backed session storage
- **Day Content**: 30-day curriculum with phases, AI task types, suggestions
- **User Progress**: Per-day completion tracking with micro-decisions and reflections
- **Badges**: Achievement system with triggers based on day completion
- **User Stats**: Aggregate statistics (streaks, completed days)
- **Day Comments**: Discussion system on each lesson with moderation
- **Brand Settings**: Global app theming (colors, fonts, border radius, logo, app name)

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Layout, Sidebar components
│   │   ├── BrandProvider.tsx  # Global brand settings
│   │   ├── Day1IdeaGenerator.tsx
│   │   ├── Day2IdeaValidator.tsx
│   │   ├── Day3FeatureBuilder.tsx
│   │   └── DayChat.tsx
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route components (Dashboard, Admin, Badges, Settings)
│   └── lib/             # Utilities and API client
├── client/public/       # Static assets (matt-webley.png)
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database operations interface
│   └── replitAuth.ts    # Authentication setup
├── shared/              # Shared code (schema, types)
└── attached_assets/     # User uploaded files
```

## Key Components

### Day 1: Idea Generator
- 28 AI-scored ideas (number of wealth)
- Color-coded cards: green (20+), orange (15-19), red (lower)
- Custom idea input option
- Shortlist top 3-5 ideas (flexible selection)
- Tooltips on all interactive elements

### Day 2: Idea Validator
- Interactive validator with shortlisted ideas from Day 1
- Hover tooltips show idea details (description, target customer) at a glance
- Copy-pastable AI prompts for validation (clearly labeled as "Prompts")
- "Use Our AI" buttons to run prompts
- Narrow ideas down to 1 final choice

### Day 3: Core Features & USP Generator (6 Steps)
- Step 1: Define Bleeding Neck Problem
- Step 2: Find Core Features from competitor analysis
- Step 3: Generate USP features based on user skills + competitor gaps
- Step 4: Create 10-Second Pitch (WHO/WHAT/BENEFIT formula)
- Step 5: Generate ICP + 7 online hangouts
- Step 6: Summary of all decisions

### Day 4: App Screen Planner
- AI-driven screen recommendations based on features and ICP
- Analyzes your specific product to suggest minimum screens for MVP
- Each screen includes purpose and key elements
- User flow visualization with reasoning

### Day 5: MVP Prioritizer
- Identify the ONE killer feature for MVP
- Focus on what makes the product unique

## Prompts Used Throughout App
All prompts are clearly labeled with "Prompt" suffix for clarity:
- **Day 2**: Market Viability Check Prompt, Competitor Deep Dive Prompt, Customer Pain Points Prompt
- **Day 3**: Bleeding Neck Problem Prompt, Core Features Prompt, USP Features Prompt, 10-Second Pitch Prompt, ICP Generator Prompt

## Tooltips
Tooltips are used throughout the app for contextual help:
- All buttons have descriptive tooltips on hover
- Day 2 idea cards show full idea details on hover
- Interactive elements explain their purpose
- AI generation buttons explain what will happen

### My Journey Section (Sidebar)
- Shows user's chosen idea and key decisions
- Hover tooltip with detailed journey notes
- Sage/forest green color palette

### Admin Panel
- Student progress tracking
- Comment moderation queue
- Brand Pack settings (colors, fonts, logo, etc.)
- Day-by-day completion heatmap

## External Dependencies

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Session storage in `sessions` table

### Authentication
- Replit OIDC provider (`ISSUER_URL` defaults to `https://replit.com/oidc`)
- Requires `REPL_ID` and `SESSION_SECRET` environment variables

### UI Components
- Radix UI primitives (comprehensive set for dialogs, dropdowns, forms, etc.)
- Lucide React icons
- Embla Carousel for carousels
- Recharts for data visualization
- Vaul for drawer components

### Replit Integration
- `@replit/vite-plugin-runtime-error-modal` for error display
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` in development
