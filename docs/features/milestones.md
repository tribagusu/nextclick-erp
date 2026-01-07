# Milestones Feature

## Overview

Project milestone tracking with employee assignments and restricted edit mode for assigned employees.

## Architecture

```
features/milestones/
├── api/
│   ├── handlers.ts                    # Main CRUD
│   └── milestone-employees.handlers.ts # Assignment handlers
├── domain/
│   ├── schemas.ts
│   ├── types.ts
│   └── services/
│       ├── milestone.service.ts
│       ├── milestone.repository.ts
│       └── milestone-employees.service.ts
└── ui/
    ├── components/
    │   ├── MilestonesTab.tsx           # Embedded in project detail
    │   ├── MilestoneCard.tsx           # Single milestone display
    │   ├── MilestoneFormDialog.tsx     # Create/edit form
    │   ├── MilestoneProgress.tsx       # Progress stats
    │   └── MilestoneAssignmentDialog.tsx # Assign employees
    └── hooks/
        ├── useMilestones.ts
        └── useMilestoneEmployees.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/milestones` | List (filterable by projectId) |
| POST | `/api/milestones` | Create milestone |
| GET | `/api/milestones/[id]` | Get milestone |
| PUT | `/api/milestones/[id]` | Update milestone |
| DELETE | `/api/milestones/[id]` | Soft-delete |
| GET | `/api/milestones/[id]/employees` | Get assignees |
| POST | `/api/milestones/[id]/employees` | Add assignee |
| DELETE | `/api/milestones/[id]/employees/[empId]` | Remove assignee |

## Milestone Status

| Status | Color | Description |
|--------|-------|-------------|
| `pending` | Gray | Not started |
| `in_progress` | Blue | Active work |
| `completed` | Green | Finished |
| `cancelled` | Red | Cancelled |

## Restricted Edit Mode

Employees assigned to a milestone can only edit:
- `status`
- `completion_date`
- `remarks`

```tsx
// MilestoneFormDialog with restrictions
<MilestoneFormDialog
  restrictedMode={true}  // Hides name, description, due_date
  milestoneId={id}
/>
```

## Assignment Check

```typescript
// In MilestoneCard
const isAssigned = currentEmployeeId && 
  assignees.some(a => a.employee_id === currentEmployeeId);

// Show Update button for assigned non-managers
{!canManage && isAssigned && (
  <Button onClick={() => setProgressDialogOpen(true)}>
    Update
  </Button>
)}
```

## DatePicker Component

Milestone forms use the `DatePicker` component:

```tsx
import { DatePicker } from '@/shared/components/ui/date-picker';

<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Select completion date"
/>
```
