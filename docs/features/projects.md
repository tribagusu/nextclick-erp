# Projects Feature

## Overview

Project lifecycle management with team assignments, milestones, and tabbed detail pages.

## Architecture

```
features/projects/
├── api/
│   └── handlers.ts
├── domain/
│   ├── schemas.ts
│   ├── types.ts
│   └── services/
│       ├── project.service.ts
│       └── project.repository.ts
└── ui/
    ├── components/
    │   ├── ProjectsTable.tsx
    │   ├── ProjectFormDialog.tsx   # Simplified create
    │   ├── ProjectEditDialog.tsx   # Full edit
    │   ├── ProjectCard.tsx         # Project info card
    │   └── TeamMembersSection.tsx  # Team tab
    └── hooks/
        └── useProjects.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/[id]` | Get project details |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Soft-delete project |
| GET | `/api/projects/[id]/members` | Get team members |

## Project Detail Page

The project detail page (`/projects/[id]`) uses tabs:

| Tab | Content |
|-----|---------|
| **Project Info** | Status, priority, dates, budget |
| **Milestones** | `MilestonesTab` component |

## Bifurcated Dialog Strategy

**Create Dialog** (`ProjectFormDialog`):
- 4 essential fields: Name, Client, Status, Priority

**Edit Dialog** (`ProjectEditDialog`):
- All fields including: dates, budget, description

## Project Status Flow

```
draft → in_progress → on_hold → completed
                   ↓
               cancelled
```

## Team Management

Team members are managed via `project_employees` junction table:

```typescript
const { data: members } = useProjectMembers(projectId);
const addMember = useAddProjectMember();
const removeMember = useRemoveProjectMember();
```
