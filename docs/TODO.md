# 🚀 Nextclick ERP: 4-Week Sprint Plan

> **Project Goal**: Move from 90% completion to "Investor Ready" by hardening security, polishing UI, and enabling mobile PWA support.

## 👥 Frontend Stream 1: The "Visual & Perceived Performance" Lead
**Focus**: Eliminating "jank" and providing visual feedback during data fetching.
**Primary Directory**: `src/features/[feature]/ui/components/`

### Tasks:
* **[Level: Min] Skeleton UI Implementation**: 
    * Replace all null/empty loading states in `ClientsTable`, `ProjectsTable`, and `EmployeesTable`.
    * Use Shadcn/ui `Skeleton` to match the row heights of the actual data.
* **[Level: Nice] Custom Dashboard Skeletons**: 
    * Create structural placeholders for `DashboardMetrics.tsx` to prevent layout shift.
* **[Level: Excellent] Feature-Level Error Boundaries**: 
    * Implement React Error Boundaries around vertical slices so one failing API doesn't crash the whole ERP.

---

## 👥 Frontend Stream 2: The "Platform & PWA" Lead
**Focus**: Making the ERP feel like a native mobile app.
**Primary Directory**: `public/`, `src/shared/components/layout/`

### Tasks:
* **[Level: Min] PWA Manifest & Assets**: 
    * Configure `manifest.json` with icons, theme colors, and `display: standalone`.
* **[Level: Nice] Responsive Navigation Overhaul**: 
    * Implement a `MobileNav` (bottom bar or drawer) that triggers only on screens < 768px.
* **[Level: Excellent] Basic Service Worker**: 
    * Implement a service worker to cache static assets (JS/CSS) for instant loading on repeat visits.

---

## 👥 Frontend Stream 3: The "UX & Quality" Lead
**Focus**: Data integrity, form validation, and user accessibility.
**Primary Directory**: `src/features/[feature]/domain/schemas.ts`

### Tasks:
* **[Level: Min] Zod Schema Validation Audit**: 
    * Ensure every field in `schemas.ts` has a user-friendly error message.
    * Example: `name: z.string().min(1, "Please enter the client's full name")`.
* **[Level: Nice] Sanitize Form Data**: 
    * Remove any sensitive data from the form before submission using DOMPurify.
* **[Level: Excellent] A11y & Keyboard Navigation**: 
    * Ensure all `FormDialog` components can be completed and submitted using only the Tab and Enter keys.

---

## 🛡️ Backend Stream: The "Security & Type Safety" Lead
**Focus**: Enforcing the 3-Layer Security Model and removing technical debt.
**Primary Directory**: `src/app/api/`, `src/features/[feature]/domain/services/`

### Tasks:
* **[Level: Min] Zero-"any" Policy**: 
    * Remove all `any` types from `handlers.ts`.
    * Use `z.infer<typeof schema>` to ensure the `Handler` layer is 100% type-safe.
* **[Level: Nice] 3-Layer Security Audit**: 
    * Verify `Handler` (Auth check) → `Service` (Business Logic) → `Repository` (RLS) flow.
* **[Level: Excellent] Vitest Schema Coverage**: 
    * Write unit tests for `transformClientInput` and other data transformers in `__tests__/schemas.test.ts`.

---

## ✅ Definition of Done (Milestone 1)
- [ ] Code follows the Feature-Based Architecture rules (no Shared -> Feature imports).
- [ ] No `any` types remain in the modified files.
- [ ] All new components are responsive and tested on mobile viewports.
- [ ] All code passes `npm run build` and `npm test`.


> Read: [PR_TEMPLATE.md](./PR_TEMPLATE.md)
