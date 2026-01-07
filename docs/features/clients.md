# Clients Feature

## Overview

Client management with CRUD operations, dialog-based forms, and clickable table rows.

## Architecture

```
features/clients/
├── api/
│   └── handlers.ts          # handleGetClients, handleCreateClient, etc.
├── domain/
│   ├── schemas.ts           # clientFormSchema, transformClientInput
│   ├── types.ts             # ClientListParams, ClientFormData
│   └── services/
│       ├── client.service.ts
│       └── client.repository.ts
└── ui/
    ├── components/
    │   ├── ClientsTable.tsx       # Orchestrator
    │   ├── ClientsToolbar.tsx     # Search + Add button
    │   ├── ClientsDataTable.tsx   # Table display
    │   ├── ClientsPagination.tsx
    │   ├── ClientFormDialog.tsx   # Create dialog
    │   ├── ClientEditDialog.tsx   # Edit dialog
    │   └── ClientDeleteDialog.tsx
    └── hooks/
        └── useClients.ts          # useClients, useClient, mutations
```

## API Endpoints

| Method | Endpoint | Handler |
|--------|----------|---------|
| GET | `/api/clients` | `handleGetClients` |
| POST | `/api/clients` | `handleCreateClient` |
| GET | `/api/clients/[id]` | `handleGetClient` |
| PUT | `/api/clients/[id]` | `handleUpdateClient` |
| DELETE | `/api/clients/[id]` | `handleDeleteClient` |

## Hooks

```typescript
// List with pagination
const { data, isLoading } = useClients({
  page: 1,
  pageSize: 10,
  search: 'acme',
});

// Single client
const { data: client } = useClient(clientId);

// Mutations
const createClient = useCreateClient();
const updateClient = useUpdateClient();
const deleteClient = useDeleteClient();
```

## Form Schema

```typescript
export const clientFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});
```

## UI Pattern

The table uses the **Clean Orchestrator** pattern:

1. `ClientsTable` manages state and dialogs
2. `ClientsToolbar` handles search input and "Add Client" button
3. `ClientsDataTable` renders the table with clickable rows
4. Dialogs open from toolbar (create) or row actions (edit/delete)
