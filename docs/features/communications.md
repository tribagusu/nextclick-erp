# Communications Feature

## Overview

Communication logging with mode filter (email, phone, meeting, other) and dialog-based forms.

## Architecture

```
features/communications/
├── api/
│   └── handlers.ts
├── domain/
│   ├── schemas.ts
│   ├── types.ts
│   └── services/
│       ├── communication.service.ts
│       └── communication.repository.ts
└── ui/
    ├── components/
    │   ├── CommunicationsTable.tsx
    │   ├── CommunicationsToolbar.tsx
    │   ├── CommunicationFormDialog.tsx
    │   ├── CommunicationDeleteDialog.tsx
    │   └── CommunicationsPagination.tsx
    └── hooks/
        └── useCommunications.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communications` | List with filters |
| POST | `/api/communications` | Create log |
| GET | `/api/communications/[id]` | Get log |
| PUT | `/api/communications/[id]` | Update log |
| DELETE | `/api/communications/[id]` | Soft-delete |

## Communication Modes

| Mode | Description |
|------|-------------|
| `email` | Email correspondence |
| `phone` | Phone calls |
| `meeting` | In-person or video meetings |
| `other` | Other communication types |

## Filtering

```typescript
const { data } = useCommunications({
  projectId: 'uuid',      // Filter by project
  mode: 'email',          // Filter by mode
  search: 'keyword',      // Search in summary
});
```
