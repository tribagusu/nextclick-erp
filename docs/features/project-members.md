# Project Members Feature

## Overview

Manages team assignments for projects through the `project_employees` junction table.

## Architecture

```
features/project-members/
├── api/
│   └── handlers.ts
└── ui/
    ├── components/
    │   ├── TeamMembersDialog.tsx    # Add/remove members
    │   └── TeamMembersSection.tsx   # Display in project detail
    └── hooks/
        └── useProjectMembers.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/[id]/members` | Get team members |
| POST | `/api/projects/[id]/members` | Add member |
| DELETE | `/api/projects/[id]/members` | Remove member |

## Database Table

```sql
CREATE TABLE project_employees (
  project_id UUID REFERENCES projects(id),
  employee_id UUID REFERENCES employees(id),
  role VARCHAR(100),           -- e.g., "Project Manager", "Developer"
  assigned_at TIMESTAMPTZ,
  PRIMARY KEY (project_id, employee_id)
);
```

## RLS Functions

```sql
-- Check if current user is assigned to a project
CREATE FUNCTION is_assigned_to_project(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_employees pe
    WHERE pe.project_id = p_project_id
      AND pe.employee_id = get_current_employee_id()
  );
END;
$$;
```

## Hooks

```typescript
// Get project team
const { data: members } = useProjectMembers(projectId);

// Mutations
const addMember = useAddProjectMember();
const removeMember = useRemoveProjectMember();
```
