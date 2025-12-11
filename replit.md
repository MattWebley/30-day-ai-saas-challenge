# 30 Day AI SaaS Challenge

## Overview

A gamified daily challenge application that guides users from zero to a working AI SaaS MVP in 30 days. Each day delivers structured micro-tasks (5 minutes or less) with AI-generated suggestions, pre-filled templates, micro-decisions, and reflections. The platform features a badge reward system, progress tracking, and daily curriculum content organized into phases (Clarifier, Blueprint Architect, Maker Mode, MVP Builder, Refinement Specialist).

## User Preferences

Preferred communication style: Simple, everyday language.

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

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/ui/   # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route components
│   └── lib/             # Utilities and API client
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database operations interface
│   └── replitAuth.ts    # Authentication setup
├── shared/              # Shared code (schema, types)
└── migrations/          # Drizzle database migrations
```

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
- Custom `vite-plugin-meta-images` for OpenGraph image handling