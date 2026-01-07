# Next Click ERP V2 - Architecture Documentation

> **Purpose**: Comprehensive architecture overview for the Next Click ERP V2 codebase.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Tech Stack](#tech-stack)
- [High-Level Architecture](#high-level-architecture)
- [Directory Structure](#directory-structure)
- [Feature-Based Architecture](#feature-based-architecture)
- [UI Component Patterns](#ui-component-patterns)
- [Data Flow](#data-flow)
- [Authentication & Security](#authentication--security)
- [Testing Strategy](#testing-strategy)

---

## Executive Summary

Next Click ERP V2 is a modern, full-stack Enterprise Resource Planning application built with **Next.js 16**, **React 19**, and **Supabase**. The codebase implements a **feature-based vertical slice architecture** with a **3-layer service pattern** (Handler → Service → Repository).

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 (App Router) | Server components, Turbopack, API routes |
| State Management | TanStack Query v5 | Server state caching, automatic refetching |
| Database | Supabase (PostgreSQL) | Real-time, RLS security, managed infrastructure |
| Styling | Tailwind CSS v4 + Shadcn/ui | Utility-first, accessible components |
| Forms | React Hook Form + Zod | Validation-first, type-safe forms |
| Testing | Vitest | Fast, ESM-native unit testing |

---

## Tech Stack

### Core Framework
```
Next.js 16 (App Router + Turbopack)
├── React 19
├── TypeScript 5
└── Node.js 20+
```

### Frontend Layer

| Technology | Purpose |
|------------|---------|
| Tailwind CSS v4 | Utility-first styling |
| Shadcn/ui (Radix) | Accessible UI components |
| next-themes | Dark/light mode |
| Lucide React | Icons |
| TanStack Query v5 | Server state management |
| React Hook Form | Form state management |
| Zod | Client & server validation |

### Backend Layer

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Serverless endpoints |
| Supabase | PostgreSQL + Auth + RLS |
| Vitest | Unit testing framework |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   Pages    │  │ Components │  │   Hooks    │  │  Dialogs   │   │
│  │  (App Dir) │  │ (Feature)  │  │ (TanStack) │  │  (Forms)   │   │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘   │
└────────┼───────────────┼───────────────┼───────────────┼───────────┘
         │               │               │               │
         └───────────────┴───────────────┴───────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js)                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  app/api/  (Thin Delegates)                                  │   │
│  │  └── clients/route.ts  →  features/clients/api/handlers.ts   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  features/[feature]/domain/services/                         │   │
│  │  ├── [feature].service.ts   (Business logic + validation)   │   │
│  │  └── [feature].repository.ts (Database queries)             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE (Supabase/PostgreSQL)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Tables    │  │     RLS     │  │  Triggers   │                 │
│  │  (clients,  │  │  Policies   │  │ (user sync) │                 │
│  │  projects)  │  │ (per-user)  │  │             │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
nextclick-erp/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Authenticated pages
│   │   │   ├── clients/              # /clients/*
│   │   │   ├── projects/             # /projects/*
│   │   │   ├── communications/       # /communications/*
│   │   │   ├── employees/            # /employees/*
│   │   │   ├── milestones/           # /milestones/*
│   │   │   └── page.tsx              # Dashboard home
│   │   ├── api/                      # API route delegates
│   │   │   ├── clients/              # Client CRUD
│   │   │   ├── projects/             # Project CRUD
│   │   │   ├── communications/       # Communication CRUD
│   │   │   ├── employees/            # Employee CRUD
│   │   │   └── milestones/           # Milestone CRUD
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing redirect
│   │
│   ├── features/                     # ⭐ Feature modules
│   │   ├── auth/                     # Authentication
│   │   ├── clients/                  # Client management
│   │   ├── projects/                 # Project management
│   │   ├── communications/           # Communication logs
│   │   ├── employees/                # Employee management
│   │   ├── milestones/               # Milestone tracking
│   │   └── dashboard/                # Dashboard analytics
│   │
│   └── shared/                       # Cross-cutting concerns
│       ├── components/               # Shared UI components
│       │   ├── ui/                   # Shadcn components
│       │   └── layout/               # Layout components
│       ├── lib/                      # Utilities
│       │   ├── supabase/             # Database clients
│       │   └── utils.ts              # Helpers (cn, etc.)
│       ├── providers/                # React providers
│       └── types/                    # Global types
│
├── supabase/
│   └── migrations/                   # Database migrations
│
└── docs/                             # Documentation
```

---

## Feature-Based Architecture

### Feature Anatomy (V2 Standard)

Each feature follows a **standardized vertical slice** pattern:

```
features/clients/
├── api/
│   └── handlers.ts              # HTTP request handlers
├── domain/
│   ├── schemas.ts               # Zod validation (form + API)
│   ├── types.ts                 # TypeScript interfaces
│   ├── services/
│   │   ├── client.service.ts    # Business logic
│   │   └── client.repository.ts # Database queries (extends BaseRepository)
│   └── __tests__/
│       └── schemas.test.ts      # Schema tests
├── ui/
│   ├── components/
│   │   ├── ClientsTable.tsx     # Orchestrator component
│   │   ├── ClientsToolbar.tsx   # Search + filters + add button
│   │   ├── ClientsDataTable.tsx # Table display
│   │   ├── ClientsPagination.tsx
│   │   ├── ClientFormDialog.tsx  # Create dialog
│   │   ├── ClientEditDialog.tsx  # Edit dialog
│   │   └── ClientDeleteDialog.tsx
│   └── hooks/
│       └── useClients.ts        # TanStack Query hooks
└── README.md                    # Feature documentation
```

### Current Features

| Feature | Status | Description |
|---------|--------|-------------|
| `auth` | ✅ Complete | Supabase Auth, user sync trigger, is_active status |
| `clients` | ✅ Complete | CRUD, dialog forms, clickable rows |
| `projects` | ✅ Complete | CRUD, dialog forms (simplified create + full edit) |
| `communications` | ✅ Complete | CRUD, dialog forms, mode filter |
| `employees` | ✅ Complete | CRUD, full-page forms |
| `milestones` | ✅ Complete | CRUD, full-page forms |
| `dashboard` | ✅ Complete | Metrics & analytics |

### Import Rules

```typescript
// ✅ ALLOWED: Feature → Shared
import { Button } from "@/shared/components/ui/button";

// ✅ ALLOWED: Feature → Own code
import { ClientCard } from "../components/ClientCard";

// ✅ ALLOWED: Feature hooks from another feature (read-only data)
import { useClients } from "@/features/clients/ui/hooks/useClients";

// ❌ FORBIDDEN: Shared → Feature
import { ClientCard } from "@/features/clients/..."; // Never!
```

---

## UI Component Patterns

### Clean Orchestrator Pattern

Table pages follow the **Clean Orchestrator** pattern where the main table component manages state and delegates rendering:

```
┌─────────────────────────────────────────────┐
│         ClientsTable (Orchestrator)         │
│  • Manages state (search, page, dialogs)    │
│  • Fetches data via useClients()            │
│  • Handles events                           │
└─────────────────────────────────────────────┘
         │           │           │
         ▼           ▼           ▼
   ┌──────────┐ ┌──────────┐ ┌───────────┐
   │ Toolbar  │ │DataTable │ │Pagination │
   └──────────┘ └──────────┘ └───────────┘
         │
         ▼
   ┌──────────────────────────────────────┐
   │         Dialog Components            │
   │  FormDialog | EditDialog | Delete    │
   └──────────────────────────────────────┘
```

### Dialog-Based Forms (Bifurcated Strategy)

Complex forms use the **Bifurcated Dialog** strategy:

| Dialog Type | Fields | Use Case |
|-------------|--------|----------|
| **FormDialog** (Create) | 4-5 essential fields | Quick creation |
| **EditDialog** (Edit) | All fields | Full editing |

Example (Projects):
- `ProjectFormDialog`: Name, Client, Status, Priority
- `ProjectEditDialog`: All 10 fields including dates, budget, etc.

### Clickable Table Rows

All data tables support clickable rows for navigation:

```tsx
<TableRow 
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => router.push(`/clients/${client.id}`)}
>
```

---

## Data Flow

### Schema Validation Strategy

Each feature has **two schemas** for different contexts:

```typescript
// Form schema (client-side, string inputs)
export const clientFormSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email().optional(),
});

// API schema (server-side, accepts null)
export const clientApiSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().nullable().optional(),
});
```

### Read Operation

```
Browser                    API Route              Service
   │                          │                      │
   │  GET /api/clients        │                      │
   ├─────────────────────────►│                      │
   │                          │  getClients()        │
   │                          ├─────────────────────►│
   │                          │                      │
   │                          │    ┌─────────────────┴─────┐
   │                          │    │ Repository.findAll()  │
   │                          │    │ → Supabase query      │
   │                          │    └─────────────────┬─────┘
   │                          │◄─────────────────────┘
   │  { data, total }         │
   │◄─────────────────────────┤
```

### Write Operation

```
1. Client sends request with JSON body
2. API handler delegates to service
3. Service validates with API schema (Zod)
4. Repository executes Supabase insert/update
5. Handler returns JSON response
```

---

## Authentication & Security

### Three-Layer Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: DATABASE (Row Level Security)                         │
│  • RLS policies on all tables                                   │
│  • auth.uid() enforcement at DB level                           │
│  • Soft delete (deleted_at) filtering                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: APPLICATION (is_active check)                         │
│  • User profile fetched on login                                │
│  • is_active = false blocks sign-in                             │
│  • Middleware protects dashboard routes                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: FRONTEND (Role-based UI)                              │
│  • Permission-based rendering                                   │
│  • Role-based navigation                                        │
└─────────────────────────────────────────────────────────────────┘
```

### User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full system access |
| `manager` | Manage clients, projects |
| `employee` | View assigned items |

### Auth Flow

```
1. User signs up → Supabase creates auth.users record
2. Database trigger → Inserts public.users profile (role: employee)
3. User signs in → Service checks is_active status
4. If active → Redirect to dashboard
5. If inactive → Sign out and show error
```

---

## Testing Strategy

### Test Structure

```
features/[feature]/domain/
├── __tests__/
│   └── schemas.test.ts        # Validation tests
└── services/__tests__/
    └── [feature].service.test.ts  # Service tests
```

### Test Commands

```bash
npm test              # Run all tests (Vitest)
npm test -- --run     # Run once without watch
npm run build         # TypeScript + build verification
```

### Current Coverage

| Test File | Tests |
|-----------|-------|
| auth/schemas.test.ts | Auth validation |
| clients/schemas.test.ts | Client validation |
| clients/service.test.ts | Client CRUD |
| projects/schemas.test.ts | Project validation |
| projects/service.test.ts | Project CRUD |
| communications/schemas.test.ts | Communication validation |
| communications/service.test.ts | Communication CRUD |
| employees/schemas.test.ts | Employee validation |
| employees/service.test.ts | Employee CRUD |
| milestones/schemas.test.ts | Milestone validation |
| milestones/service.test.ts | Milestone CRUD |

---

## Quick Reference

### Adding a New Feature

```bash
# 1. Create structure
mkdir -p src/features/[name]/{api,domain/services,domain/__tests__,ui/{components,hooks}}

# 2. Create domain files
touch src/features/[name]/domain/{schemas,types}.ts
touch src/features/[name]/domain/services/{[name].service,[name].repository}.ts

# 3. Create API handler
touch src/features/[name]/api/handlers.ts

# 4. Create API route delegate
mkdir -p src/app/api/[name]
touch src/app/api/[name]/route.ts
```

### Key File Locations

| Need | Location |
|------|----------|
| Supabase server client | `src/shared/lib/supabase/server.ts` |
| Base repository | `src/shared/lib/supabase/base.repository.ts` |
| UI components | `src/shared/components/ui/` |
| FormDialog | `src/shared/components/ui/form-dialog.tsx` |
| Database types | `src/shared/types/database.types.ts` |

### Code Standards

- **Components**: PascalCase, extract sub-components >100 lines
- **Hooks**: camelCase, prefix with `use`
- **Schemas**: Two schemas (form + API) per feature
- **Types**: No `any`, always define interfaces
- **Dialogs**: Use `FormDialog` for forms, `AlertDialog` for confirms

---

> **Last Updated**: 2026-01-07  
> **Version**: 2.0  
> **Maintainer**: Development Team
