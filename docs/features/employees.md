# Employees Feature

## Overview

Employee management with full-page create/edit forms and integration with project/milestone assignments.

## Architecture

```
features/employees/
├── api/
│   └── handlers.ts
├── domain/
│   ├── schemas.ts
│   ├── types.ts
│   └── services/
│       ├── employee.service.ts
│       └── employee.repository.ts
└── ui/
    ├── components/
    │   ├── EmployeesTable.tsx
    │   ├── EmployeeFormDialog.tsx
    │   └── EmployeeDeleteDialog.tsx
    └── hooks/
        └── useEmployees.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/[id]` | Get employee |
| PUT | `/api/employees/[id]` | Update employee |
| DELETE | `/api/employees/[id]` | Soft-delete |
| GET | `/api/employees/me` | Get current user's employee record |

## Employee-User Linking

Employees can be linked to user accounts via `user_id`:

```typescript
// Get current employee (for assignment checks)
const { data: currentEmployee } = useCurrentEmployee();
```

## Hooks

```typescript
// List employees
const { data } = useEmployees({ page: 1, pageSize: 10 });

// Single employee
const { data: employee } = useEmployee(id);

// Current user's employee record
const { data: myEmployee } = useCurrentEmployee();
```

## RLS Policy

Employees can read their own record:

```sql
CREATE POLICY employees_select_self ON employees
FOR SELECT USING (user_id = auth.uid());
```
