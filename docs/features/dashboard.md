# Dashboard Feature

## Overview

Analytics dashboard with key metrics and quick-access widgets.

## Architecture

```
features/dashboard/
├── api/
│   └── handlers.ts
└── ui/
    ├── components/
    │   ├── DashboardMetrics.tsx    # Overview cards
    │   ├── RecentProjects.tsx      # Recent activity
    │   └── QuickActions.tsx        # Common actions
    └── hooks/
        └── useDashboard.ts
```

## API Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard metrics |

## Metrics

| Metric | Source |
|--------|--------|
| Total Clients | `clients` table count |
| Active Projects | `projects` where status = 'in_progress' |
| Pending Milestones | `project_milestones` where status = 'pending' |
| Recent Communications | Latest 5 communication logs |

## Implementation

```typescript
const { data, isLoading } = useDashboardMetrics();
// Returns: { clientCount, projectCount, milestoneCount, ... }
```
