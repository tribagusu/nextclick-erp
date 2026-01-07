# Backend Onboarding Guide

Welcome to the Next Click ERP V2 backend! This guide covers the API patterns, service architecture, and development conventions.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [API Routes](#api-routes)
- [3-Layer Pattern](#3-layer-pattern)
- [Validation](#validation)
- [RBAC & Permissions](#rbac--permissions)
- [Adding a New Feature](#adding-a-new-feature)

---

## Architecture Overview

```
Request → API Route → Handler → Service → Repository → Supabase
                         │          │
                         └──────────┴── Validation (Zod)
```

---

## API Routes

### Location

API routes live in `src/app/api/[resource]/route.ts` as thin delegates:

```typescript
// src/app/api/clients/route.ts
import { handleGetClients, handleCreateClient } from '@/features/clients/api/handlers';

export const GET = handleGetClients;
export const POST = handleCreateClient;
```

Dynamic routes for single resources:

```typescript
// src/app/api/clients/[id]/route.ts
import { handleGetClient, handleUpdateClient, handleDeleteClient } 
  from '@/features/clients/api/handlers';

export const GET = handleGetClient;
export const PUT = handleUpdateClient;
export const DELETE = handleDeleteClient;
```

---

## 3-Layer Pattern

### 1. Handlers (API Layer)

Located in `features/[feature]/api/handlers.ts`:

```typescript
export async function handleGetClients(request: Request) {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedResponse();

  // 2. Extract params
  const url = new URL(request.url);
  const params = {
    page: parseInt(url.searchParams.get('page') ?? '1'),
    search: url.searchParams.get('search') ?? undefined,
  };

  // 3. Delegate to service
  const service = new ClientService(supabase);
  const data = await service.getClients(params);
  
  return successResponse(data);
}
```

### 2. Services (Business Logic)

Located in `features/[feature]/domain/services/[feature].service.ts`:

```typescript
export class ClientService {
  private repository: ClientRepository;
  
  constructor(client: SupabaseClient) {
    this.repository = new ClientRepository(client);
  }
  
  async createClient(input: ClientCreateInput) {
    // Validate
    const result = clientFormSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }
    
    // Transform
    const data = transformClientInput(result.data);
    
    // Persist
    const client = await this.repository.create(data);
    return { success: true, client };
  }
}
```

### 3. Repositories (Data Access)

Located in `features/[feature]/domain/services/[feature].repository.ts`:

```typescript
export class ClientRepository extends BaseRepository<Client> {
  constructor(client: SupabaseClient) {
    super(client, 'clients');
  }
  
  async findByEmail(email: string) {
    const { data, error } = await this.client
      .from('clients')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  }
}
```

---

## Validation

### Zod Schemas

Each feature has schemas in `domain/schemas.ts`:

```typescript
export const clientFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

// Transform empty strings to null for database
export function transformClientInput(data: ClientFormData) {
  return {
    ...data,
    email: data.email || null,
    phone: data.phone || null,
  };
}
```

---

## RBAC & Permissions

### Permission Checking

Located in `src/shared/lib/auth/permissions.ts`:

```typescript
import { canManage, hasPermission } from '@/shared/lib/auth/permissions';

// Check if user can manage (admin or manager)
if (canManage(user.role)) {
  // Allow edit/delete
}

// Check specific permission
if (hasPermission(user.role, 'projects:write')) {
  // Allow project modifications
}
```

### Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| `admin` | 4 | All permissions |
| `manager` | 3 | Manage clients, projects, communications |
| `employee` | 2 | View + assigned items |
| `viewer` | 1 | Read-only |

---

## API Response Helpers

Located in `src/shared/lib/api/api-utils.ts`:

```typescript
import { 
  successResponse, 
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/shared/lib/api/api-utils';

// Success with data
return successResponse({ clients, total });

// Validation error (400)
return validationErrorResponse('Name is required');

// Unauthorized (401)
return unauthorizedResponse();

// Not found (404)
return notFoundResponse('Client');
```

---

## Adding a New Feature

### Step 1: Create Directory Structure

```bash
mkdir -p src/features/widgets/{api,domain/services,ui/{components,hooks}}
```

### Step 2: Create Domain Files

```typescript
// domain/schemas.ts
export const widgetFormSchema = z.object({
  name: z.string().min(1),
});

// domain/types.ts
export interface Widget {
  id: string;
  name: string;
  created_at: string;
}
```

### Step 3: Create Repository & Service

```typescript
// domain/services/widget.repository.ts
export class WidgetRepository extends BaseRepository<Widget> {
  constructor(client: SupabaseClient) {
    super(client, 'widgets');
  }
}

// domain/services/widget.service.ts
export class WidgetService {
  constructor(client: SupabaseClient) {
    this.repository = new WidgetRepository(client);
  }
  // CRUD methods...
}
```

### Step 4: Create API Handlers

```typescript
// api/handlers.ts
export async function handleGetWidgets(request: Request) {
  // Implementation
}
```

### Step 5: Create API Route Delegate

```typescript
// src/app/api/widgets/route.ts
import { handleGetWidgets, handleCreateWidget } 
  from '@/features/widgets/api/handlers';

export const GET = handleGetWidgets;
export const POST = handleCreateWidget;
```

---

## Testing

### Running Tests

```bash
npm test              # Watch mode
npm test -- --run     # Single run
```

### Test Location

```
features/[feature]/domain/
├── __tests__/
│   └── schemas.test.ts
└── services/__tests__/
    └── [feature].service.test.ts
```

---

> Previous: [FRONTEND.md](./FRONTEND.md) | Next: [DATABASE.md](./DATABASE.md)
