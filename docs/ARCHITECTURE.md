# Nextclick ERP - Architecture Documentation

> **Purpose**: Comprehensive architecture overview for the Nextclick ERP codebase.

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
│  │  projects)  │  │ (per-role)  │  │             │                 │
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
│   │   │   ├── auth/                 # Auth endpoints
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
│   │   ├── project-members/          # Project team assignments
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
│       │   ├── auth/                 # RBAC permissions
│       │   ├── api/                  # API utilities
│       │   └── utils.ts              # Helpers (cn, etc.)
│       ├── providers/                # React providers
│       └── types/                    # Global types
│
├── supabase/
│   └── migrations/                   # Database migrations
│       ├── 001_create_enums.sql      # Enum types
│       ├── 002_create_tables.sql     # Table definitions
│       ├── 003_create_rls_policies.sql  # RLS policies
│       └── 004_create_user_trigger.sql  # Auth trigger
│
└── docs/                             # Documentation
    ├── ARCHITECTURE.md               # This file
    ├── features/                     # Feature documentation
    └── onboarding/                   # Developer onboarding
```

---

## Feature-Based Architecture

### Feature Anatomy (V2 Standard)

Each feature follows a **standardized vertical slice** pattern:

```
features/[feature]/
├── api/
│   ├── handlers.ts              # HTTP request handlers
│   └── [specialized].handlers.ts # Sub-resource handlers
├── domain/
│   ├── schemas.ts               # Zod validation (form + API)
│   ├── types.ts                 # TypeScript interfaces
│   ├── services/
│   │   ├── [feature].service.ts    # Business logic
│   │   └── [feature].repository.ts # Database queries
│   └── __tests__/
│       └── schemas.test.ts      # Schema tests
└── ui/
    ├── components/
    │   ├── [Feature]Table.tsx   # Orchestrator component
    │   ├── [Feature]Toolbar.tsx # Search + filters + add button
    │   ├── [Feature]DataTable.tsx # Table display
    │   ├── [Feature]FormDialog.tsx  # Create/edit dialog
    │   └── [Feature]DeleteDialog.tsx
    └── hooks/
        └── use[Feature]s.ts     # TanStack Query hooks
```

### Current Features

| Feature | Description | Key Files |
|---------|-------------|-----------|
| `auth` | Supabase Auth, user sync trigger, RBAC | `useAuth.ts`, `permissions.ts` |
| `clients` | Client management with CRUD | `ClientsTable.tsx`, `ClientFormDialog.tsx` |
| `projects` | Project lifecycle with team | `ProjectEditDialog.tsx`, `TeamMembersSection.tsx` |
| `project-members` | Team assignment for projects | `TeamMembersDialog.tsx` |
| `employees` | Employee management | `EmployeesTable.tsx` |
| `milestones` | Milestone tracking with assignments | `MilestonesTab.tsx`, `MilestoneAssignmentDialog.tsx` |
| `communications` | Communication logs | `CommunicationsTable.tsx` |
| `dashboard` | Metrics & analytics | `DashboardMetrics.tsx` |

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

Table pages follow the **Clean Orchestrator** pattern:

```
┌─────────────────────────────────────────────┐
│         [Feature]Table (Orchestrator)       │
│  • Manages state (search, page, dialogs)    │
│  • Fetches data via use[Feature]s()         │
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

### Dialog-Based Forms

Forms use the **Dialog-based** approach for context preservation:

| Dialog Type | Purpose | Example |
|-------------|---------|---------|
| **FormDialog** | Create new items | `ProjectFormDialog` - simplified fields |
| **EditDialog** | Edit existing items | `ProjectEditDialog` - all fields |
| **AssignmentDialog** | Manage relationships | `MilestoneAssignmentDialog` |

### Restricted Edit Mode

Employees can edit milestones assigned to them with restricted fields:

```typescript
// restrictedMode prop hides certain fields
<MilestoneFormDialog
  restrictedMode={true}  // Only: status, remarks, completion_date
/>
```

---

## Data Flow

### Schema Validation Strategy

Each feature has a **single schema** that transforms form input to API format:

```typescript
// Zod schema with form validation
export const clientFormSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email().optional().or(z.literal("")),
});

// Transform function to convert empty strings to null
export function transformClientInput(data: ClientFormData) {
  return {
    ...data,
    email: data.email || null,
    phone: data.phone || null,
  };
}
```

### API Request Flow

```
Browser → API Route (delegate) → Handler → Service → Repository → Supabase
           │                        │           │
           └── Auth check           └── Validate └── RLS applied
```

---

## Authentication & Security

### Four-Tier Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│  Tier 1: DATABASE (Row Level Security - RLS)                    │
│  • Policy functions: is_admin(), can_manage(), get_user_role()  │
│  • Assignment checks: is_assigned_to_project(project_id)        │
│  • Employee self-read: user_id = auth.uid()                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tier 2: APPLICATION (Active Status Check)                      │
│  • is_active flag on users table                                │
│  • Blocked users cannot sign in                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tier 3: MIDDLEWARE (Route Protection)                          │
│  • /api/* and /(dashboard)/* require auth                       │
│  • Redirect to /signin if unauthenticated                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tier 4: FRONTEND (Role-based UI)                               │
│  • canManage(role) for edit/delete buttons                      │
│  • restrictedMode for field-level access                        │
│  • Permission-based navigation                                  │
└─────────────────────────────────────────────────────────────────┘
```

### User Roles & Permissions

| Role | CRUD Clients | CRUD Projects | Assign Teams | CRUD Employees |
|------|-------------|---------------|--------------|----------------|
| `admin` | ✅ Full | ✅ Full | ✅ | ✅ Full |
| `manager` | ✅ Full | ✅ Full | ✅ | ❌ View only |
| `employee` | 👁️ View | 📝 Assigned only | ❌ | ❌ Self only |
| `viewer` | 👁️ View | 👁️ View | ❌ | ❌ |

### Database Functions (SECURITY DEFINER)

```sql
-- Get current employee ID for assignment checks
CREATE FUNCTION get_current_employee_id() RETURNS UUID
SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM employees WHERE user_id = auth.uid()
$$;

-- Check if user is assigned to a project
CREATE FUNCTION is_assigned_to_project(p_project_id UUID) RETURNS BOOLEAN
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
npm test              # Run all tests (Vitest watch)
npm test -- --run     # Run once without watch
npm run build         # TypeScript + build verification
```

### Current Test Coverage

| Feature | Schema Tests | Service Tests |
|---------|-------------|---------------|
| auth | ✅ | - |
| clients | ✅ | ✅ |
| projects | ✅ | ✅ |
| communications | ✅ | ✅ |
| employees | ✅ | ✅ |
| milestones | ✅ | ✅ |

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
| RBAC permissions | `src/shared/lib/auth/permissions.ts` |
| UI components | `src/shared/components/ui/` |
| DatePicker | `src/shared/components/ui/date-picker.tsx` |
| Database types | `src/shared/types/database.types.ts` |
| Migrations | `supabase/migrations/` |

### Code Standards

- **Components**: PascalCase, extract sub-components >100 lines
- **Hooks**: camelCase, prefix with `use`
- **Schemas**: Zod validation + transform function
- **Types**: No `any`, always define interfaces
- **Dialogs**: Use `Dialog` for forms, `AlertDialog` for confirms
- **Date inputs**: Use `DatePicker` component (Calendar + Popover)

---

> **Last Updated**: 2026-01-07  
> **Version**: 2.1  
> **Maintainer**: Development Team
