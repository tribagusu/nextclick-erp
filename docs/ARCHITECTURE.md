# Next Click ERP V1 - Architecture Documentation

> **Purpose**: Comprehensive architecture overview for the Next Click ERP codebase, designed to inform v2 planning and onboard new developers.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Tech Stack](#tech-stack)
- [High-Level Architecture](#high-level-architecture)
- [Directory Structure](#directory-structure)
- [Feature-Based Architecture](#feature-based-architecture)
- [Data Flow](#data-flow)
- [Authentication & Security](#authentication--security)
- [Error Monitoring & Logging](#error-monitoring--logging)
- [Testing Strategy](#testing-strategy)
- [Current State Analysis](#current-state-analysis)
- [Recommendations for v2](#recommendations-for-v2)

---

## Executive Summary

Next Click ERP is a modern, full-stack Enterprise Resource Planning application built with **Next.js 16**, **React 19**, and **Supabase**. The codebase implements a **feature-based vertical slice architecture** with a **BFF (Backend For Frontend) pattern**, separating concerns across three layers: API handlers, services, and repositories.

### Key Architectural Decisions

| Decision         | Choice                      | Rationale                                         |
| ---------------- | --------------------------- | ------------------------------------------------- |
| Framework        | Next.js 16 (App Router)     | Server components, file-based routing, API routes |
| State Management | TanStack Query v5           | Server state caching, automatic refetching        |
| Database         | Supabase (PostgreSQL)       | Real-time, RLS security, managed infrastructure   |
| Styling          | Tailwind CSS v4 + Shadcn/ui | Utility-first, accessible components              |
| Validation       | Zod                         | TypeScript-first schema validation                |
| Logging          | Pino                        | Structured JSON logging for observability         |

---

## Tech Stack

### Core Framework

```
Next.js 16 (App Router + Turbopack)
├── React 19
├── TypeScript 5
└── Node.js 18+
```

### Frontend Layer

| Technology        | Purpose                  |
| ----------------- | ------------------------ |
| Tailwind CSS v4   | Utility-first styling    |
| Shadcn/ui (Radix) | Accessible UI components |
| next-themes       | Dark/light mode          |
| Lucide React      | Icons                    |
| TanStack Query v5 | Server state management  |
| TanStack Table v8 | Data tables              |
| React Hook Form   | Form management          |
| Zod               | Client-side validation   |

### Backend Layer

| Technology         | Purpose                 |
| ------------------ | ----------------------- |
| Next.js API Routes | Serverless endpoints    |
| Supabase           | PostgreSQL + Auth + RLS |
| Resend             | Transactional email     |
| Pino               | Structured logging      |

### Monitoring & Observability

| Technology           | Purpose                        |
| -------------------- | ------------------------------ |
| Custom Error Handler | Error classification & routing |
| Discord Webhooks     | Real-time critical alerts      |
| Jira Integration     | Automated ticket creation      |
| Supabase Logs        | Error persistence & analytics  |

### Development & Testing

| Technology            | Purpose           |
| --------------------- | ----------------- |
| Jest                  | Unit testing      |
| React Testing Library | Component testing |
| Playwright            | E2E testing       |
| ESLint                | Linting           |
| TypeScript            | Type checking     |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   Pages    │  │ Components │  │   Hooks    │  │  Contexts  │   │
│  │  (App Dir) │  │ (Feature)  │  │ (TanStack) │  │   (Auth)   │   │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘   │
└────────┼───────────────┼───────────────┼───────────────┼───────────┘
         │               │               │               │
         └───────────────┼───────────────┼───────────────┘
                         ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js)                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  app/api/  (Thin Delegates)                                  │   │
│  │  └── client/route.ts  →  features/clients/api/handlers.ts    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  features/[feature]/api/handlers.ts                          │   │
│  │  • Request parsing                                           │   │
│  │  • Response formatting                                       │   │
│  │  • Error handling                                            │   │
│  └─────────────────────────┬───────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  features/[feature]/domain/service.ts                        │   │
│  │  • Business logic                                            │   │
│  │  • Validation (Zod)                                          │   │
│  │  • Data transformation (camelCase ↔ snake_case)              │   │
│  └─────────────────────────┬───────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  features/[feature]/domain/repository.ts                     │   │
│  │  • Database queries                                          │   │
│  │  • Supabase operations                                       │   │
│  └─────────────────────────┬───────────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE (Supabase/PostgreSQL)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Tables    │  │     RLS     │  │  Triggers   │                 │
│  │ (clients,   │  │  Policies   │  │  (auto-sync │                 │
│  │  projects)  │  │ (per-user)  │  │   users)    │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
nextclick-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (pages)/                  # Route group for pages
│   │   │   ├── auth/                 # /auth/*
│   │   │   ├── clients/              # /clients/*
│   │   │   ├── companies/            # /companies/*
│   │   │   ├── projects/             # /projects/*
│   │   │   ├── employees/            # /employees/*
│   │   │   └── dashboard/            # /dashboard
│   │   ├── api/                      # API route delegates
│   │   │   ├── auth/                 # Auth endpoints
│   │   │   ├── client/               # Client CRUD
│   │   │   ├── company/              # Company CRUD
│   │   │   ├── project/              # Project CRUD
│   │   │   ├── employee/             # Employee CRUD
│   │   │   └── milestone/            # Milestone CRUD
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home redirect
│   │
│   ├── features/                     # ⭐ Feature modules
│   │   ├── auth/                     # Authentication feature
│   │   ├── clients/                  # Client management
│   │   ├── companies/                # Company management
│   │   ├── projects/                 # Project management
│   │   ├── employees/                # Employee management
│   │   ├── milestone/                # Milestone tracking
│   │   └── dashboard/                # Dashboard & analytics
│   │
│   ├── shared/                       # Cross-cutting concerns
│   │   ├── components/               # Shared UI components
│   │   │   ├── ui/                   # Shadcn components
│   │   │   ├── layout/               # Layout components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── GlobalErrorHandler.tsx
│   │   ├── lib/                      # Utilities & configs
│   │   │   ├── api/                  # API client utilities
│   │   │   ├── auth/                 # Auth utilities
│   │   │   ├── supabase/             # Database clients
│   │   │   ├── email/                # Email templates
│   │   │   ├── error-monitoring/     # Error tracking
│   │   │   └── logs/                 # Logger config
│   │   ├── hooks/                    # Generic hooks
│   │   ├── contexts/                 # React contexts
│   │   ├── providers/                # Provider wrappers
│   │   ├── types/                    # Global types
│   │   ├── schemas/                  # Global schemas
│   │   └── utils/                    # Utility functions
│   │
│   └── __tests__/                    # Test files
│
├── docs/                             # Documentation
│   ├── onboarding/                   # Onboarding guides
│   └── instructions/                 # Technical docs
│
├── scripts/                          # Build/dev scripts
└── public/                           # Static assets
```

---

## Feature-Based Architecture

### Feature Anatomy

Each feature is a **vertical slice** containing all layers from UI to database:

```
features/clients/                     # Example feature
├── api/                              # Layer 1: HTTP handlers
│   └── handlers.ts                   # GET, POST, PUT, DELETE
├── domain/                           # Layer 2 & 3: Business + Data
│   ├── schemas.ts                    # Zod validation schemas
│   ├── types.ts                      # TypeScript interfaces
│   ├── repository.ts                 # Database queries
│   └── service.ts                    # Business logic
├── ui/                               # Layer 4: Presentation
│   ├── components/                   # Feature-specific components
│   │   ├── ClientCard.tsx
│   │   ├── ClientForm.tsx
│   │   └── ClientList.tsx
│   ├── hooks/                        # Data fetching hooks
│   │   └── useClient.ts
│   └── pages/                        # Page components
│       └── ClientsPage.tsx
├── __tests__/                        # Feature tests
└── README.md                         # Feature documentation
```

### Current Features

| Feature     | Status         | Description                        |
| ----------- | -------------- | ---------------------------------- |
| `auth`      | ✅ Complete    | Supabase Auth, RLS, password reset |
| `clients`   | ✅ Complete    | Client CRUD, search, pagination    |
| `companies` | 🚧 In Progress | Company management                 |
| `projects`  | 🚧 In Progress | Project tracking                   |
| `employees` | 🚧 In Progress | Employee management                |
| `milestone` | 🚧 In Progress | Project milestones                 |
| `dashboard` | ✅ Complete    | Metrics & analytics                |

### Import Rules

```typescript
// ✅ ALLOWED: Feature → Shared
import { Button } from "@/shared/components/ui/button";

// ✅ ALLOWED: Feature → Own code
import { ClientCard } from "../components/ClientCard";

// ❌ FORBIDDEN: Feature → Another Feature
import { ProjectCard } from "@/features/projects/..."; // Move to shared!

// ❌ FORBIDDEN: Shared → Feature
import { ClientCard } from "@/features/clients/..."; // Never!
```

---

## Data Flow

### Read Operation (GET)

```
Browser                    API Route              Feature Handlers
   │                          │                        │
   │  GET /api/client         │                        │
   ├─────────────────────────►│                        │
   │                          │  getClients()          │
   │                          ├───────────────────────►│
   │                          │                        │
   │                          │          ┌─────────────┴─────────────┐
   │                          │          │                           │
   │                          │          ▼                           │
   │                          │    ┌──────────────┐                  │
   │                          │    │   Service    │                  │
   │                          │    │ - Validation │                  │
   │                          │    │ - Transform  │                  │
   │                          │    └──────┬───────┘                  │
   │                          │           │                          │
   │                          │           ▼                          │
   │                          │    ┌──────────────┐                  │
   │                          │    │  Repository  │                  │
   │                          │    │ - Supabase   │                  │
   │                          │    └──────┬───────┘                  │
   │                          │           │                          │
   │                          │           ▼                          │
   │                          │    ┌──────────────┐                  │
   │                          │    │   Database   │                  │
   │                          │    │ (PostgreSQL) │                  │
   │                          │    └──────┬───────┘                  │
   │                          │           │                          │
   │                          │◄──────────┴──────────────────────────┘
   │  { data: [...], meta }   │
   │◄─────────────────────────┤
   │                          │
```

### Write Operation (POST/PUT)

```
1. Client sends request with JSON body
2. API handler extracts body
3. Service validates with Zod schema
4. Service transforms camelCase → snake_case
5. Repository executes Supabase insert/update
6. Repository returns raw data
7. Service transforms snake_case → camelCase
8. Handler wraps in apiSuccess() response
9. Client receives JSON response
```

---

## Authentication & Security

### Three-Layer Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: DATABASE (Row Level Security)                         │
│  • RLS policies on all tables                                   │
│  • auth.uid() = user_id enforced at DB level                    │
│  • Cannot be bypassed by application code                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: BACKEND (API Middleware)                              │
│  • requirePermission() checks                                   │
│  • Role-based access control                                    │
│  • Audit logging                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: FRONTEND (UX)                                         │
│  • Permission-based UI rendering                                │
│  • Role-based navigation                                        │
│  • can() helper for conditional UI                              │
└─────────────────────────────────────────────────────────────────┘
```

### User Roles

| Role       | Permissions                         |
| ---------- | ----------------------------------- |
| `admin`    | Full system access                  |
| `manager`  | Manage clients, projects, companies |
| `employee` | View assigned projects              |
| `viewer`   | Read-only access                    |

### Supabase Clients

| Client                         | Use Case                          | RLS         |
| ------------------------------ | --------------------------------- | ----------- |
| `createSupabaseServerClient()` | User-scoped operations            | ✅ Enforced |
| `supabaseAdmin`                | Admin operations, background jobs | ❌ Bypassed |

---

## Error Monitoring & Logging

### Error Classification & Routing

```
Error Occurs
     │
     ▼
┌──────────────────┐
│ Error Handler    │
│ (classify error) │
└────────┬─────────┘
         │
    ┌────┴────────────────────────────┐
    │                                  │
    ▼                                  ▼
CRITICAL                           MEDIUM/LOW
    │                                  │
    ├──► Discord Webhook               ├──► Supabase Log
    ├──► Jira Ticket (Critical)        └──► Analytics
    └──► Supabase Log
```

### Structured Logging (Pino)

```typescript
// ✅ Correct logging
logger.info({ userId, action: "create_client" }, "Client created");
logger.error({ error, clientId }, "Failed to create client");

// ❌ Never use console.log in production
console.log("something happened");
```

---

## Testing Strategy

### Test Pyramid

```
          ┌─────────┐
          │   E2E   │  ← Playwright (critical flows)
          │ (Few)   │
         ┌┴─────────┴┐
         │Integration│  ← API route tests
         │ (Some)    │
        ┌┴───────────┴┐
        │    Unit     │  ← Jest + RTL (components, utils)
        │   (Many)    │
        └─────────────┘
```

### Test Commands

```bash
npm test                  # Unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # E2E tests
npm run test:e2e:ui       # E2E with UI
```

---

## Current State Analysis

### Strengths ✅

| Area               | Assessment                                                |
| ------------------ | --------------------------------------------------------- |
| **Architecture**   | Clean vertical slice pattern, good separation of concerns |
| **Documentation**  | Comprehensive onboarding docs (frontend/backend guides)   |
| **Type Safety**    | Full TypeScript coverage with Zod validation              |
| **Error Handling** | Mature error monitoring with Discord/Jira integration     |
| **Security**       | Three-layer security model with RLS                       |
| **Logging**        | Structured JSON logging with Pino                         |

### Areas for Improvement ⚠️

| Area                     | Issue                                                | Impact                        |
| ------------------------ | ---------------------------------------------------- | ----------------------------- |
| **Feature Completeness** | Companies, Projects, Employees partially implemented | Blocks full ERP functionality |
| **Test Coverage**        | Limited E2E tests                                    | Risk of regressions           |
| **API Consistency**      | Some handlers lack proper error handling             | Inconsistent error responses  |
| **Code Duplication**     | Repository patterns repeated across features         | Maintenance overhead          |
| **State Management**     | No global client state (beyond Auth)                 | Complex cross-feature state   |

### Technical Debt 🔧

1. **Inconsistent layer implementation**: Some features have flattened domain structure, others use subdirectories
2. **Missing pagination**: Not all list endpoints support pagination
3. **Limited caching**: No server-side caching strategy
4. **No rate limiting**: API routes lack rate limiting
5. **PWA support**: Not implemented

---

## Recommendations for v2

### Priority 1: Foundation

| Task                            | Rationale                                            |
| ------------------------------- | ---------------------------------------------------- |
| Standardize feature structure   | All features should use identical directory patterns |
| Create base repository class    | Reduce code duplication, ensure consistent patterns  |
| Implement global error handling | Unified error responses across all endpoints         |
| Add API rate limiting           | Security and resource protection                     |

### Priority 2: Features

| Task                       | Rationale               |
| -------------------------- | ----------------------- |
| Complete Projects feature  | Core ERP functionality  |
| Complete Employees feature | HR management           |
| Add Tasks module           | Project task management |
| Add Documents module       | File management         |

### Priority 3: Quality

| Task                       | Rationale                |
| -------------------------- | ------------------------ |
| Increase E2E coverage      | Critical path protection |
| Add performance monitoring | Identify bottlenecks     |
| Implement caching layer    | Reduce database load     |
| Add PWA support            | Offline capability       |

### Proposed v2 Structure Changes

```diff
  features/
    clients/
-     domain/
-       repository.ts
-       service.ts
-       schemas.ts
-       types.ts
+     domain/
+       index.ts           # Barrel export
+       schemas.ts         # Validation
+       types.ts           # Types
+       services/
+         client.service.ts
+         client.repository.ts
+     api/
+       handlers.ts
+       middleware.ts      # NEW: Feature-specific middleware
+     ui/
+       ...
+     __tests__/
+       unit/
+       integration/
```

---

## Quick Reference

### Adding a New Feature

```bash
# 1. Create structure
mkdir -p src/features/[name]/{api,domain/services,ui/{components,hooks,pages},__tests__}

# 2. Create files
touch src/features/[name]/domain/{schemas,types}.ts
touch src/features/[name]/domain/services/{repository,service}.ts
touch src/features/[name]/api/handlers.ts
touch src/features/[name]/README.md

# 3. Create API route delegate
touch src/app/api/[name]/route.ts
```

### Key File Locations

| Need            | Location                                     |
| --------------- | -------------------------------------------- |
| API utilities   | `src/shared/lib/api/api-utils.ts`            |
| Supabase client | `src/shared/lib/supabase/server.ts`          |
| Auth helpers    | `src/shared/lib/auth/supabase-auth.ts`       |
| Error handler   | `src/shared/lib/error-monitoring/handler.ts` |
| Logger          | `src/shared/lib/logs/logger.ts`              |
| UI components   | `src/shared/components/ui/`                  |

### Code Standards

- **Components**: Max 50 lines, PascalCase files
- **API routes**: Wrap with `withErrorMonitoring()`
- **Validation**: Always use Zod schemas
- **Logging**: Use Pino, never `console.log`
- **Types**: Never use `any`, always define types

---

> **Last Updated**: 2026-01-07  
> **Maintainer**: Development Team
