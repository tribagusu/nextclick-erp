# Frontend Onboarding Guide

Welcome to the Next Click ERP V2 frontend! This guide covers the React patterns and UI conventions used in this codebase.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Patterns](#key-patterns)
- [Components](#components)
- [Hooks & Data Fetching](#hooks--data-fetching)
- [Forms](#forms)
- [Getting Started](#getting-started)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Utility-first styling |
| **Shadcn/ui** | Accessible UI components |
| **TanStack Query v5** | Server state management |
| **React Hook Form + Zod** | Form handling & validation |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Authenticated pages (route group)
│   └── api/                # API routes (thin delegates)
├── features/               # Feature modules
│   └── [feature]/
│       └── ui/
│           ├── components/ # Feature-specific components
│           └── hooks/      # TanStack Query hooks
└── shared/
    ├── components/ui/      # Shadcn components
    ├── providers/          # React context providers
    └── lib/                # Utilities
```

---

## Key Patterns

### 1. Clean Orchestrator Pattern

Table pages use an orchestrator component that manages state:

```tsx
// ClientsTable.tsx - Orchestrator
export function ClientsTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data, isLoading } = useClients({ search, page });
  
  return (
    <>
      <ClientsToolbar onSearch={setSearch} onAdd={() => setDialogOpen(true)} />
      <ClientsDataTable data={data?.clients} />
      <ClientsPagination page={page} onChange={setPage} total={data?.total} />
      <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
```

### 2. Dialog-Based Forms

Forms open in dialogs instead of navigating to new pages:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Client</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  </DialogContent>
</Dialog>
```

### 3. Clickable Table Rows

Table rows navigate to detail pages:

```tsx
<TableRow 
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => router.push(`/clients/${client.id}`)}
>
```

---

## Components

### Shadcn/ui Components

Located in `src/shared/components/ui/`. Common components:

| Component | Usage |
|-----------|-------|
| `Button` | Actions, form submit |
| `Dialog` | Modals for forms |
| `Input`, `Textarea` | Form inputs |
| `Select` | Dropdowns |
| `Table` | Data tables |
| `Card` | Container cards |
| `DatePicker` | Date input (uses Calendar + Popover) |

### Using DatePicker

```tsx
import { DatePicker } from '@/shared/components/ui/date-picker';

<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Select date"
/>
```

---

## Hooks & Data Fetching

### TanStack Query Hooks

Each feature has hooks in `features/[feature]/ui/hooks/`:

```typescript
// Reading data
const { data, isLoading, error } = useClients({
  page: 1,
  pageSize: 10,
  search: 'acme',
});

// Single item
const { data: client } = useClient(clientId);

// Mutations
const createClient = useCreateClient();
await createClient.mutateAsync(formData);
```

### Hook Pattern

```typescript
// useClients.ts
export function useClients(params: ClientListParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => fetchClients(params),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
```

---

## Forms

### React Hook Form + Zod Pattern

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema } from '../domain/schemas';

const form = useForm({
  resolver: zodResolver(clientFormSchema),
  defaultValues: { name: '', email: '' },
});

const onSubmit = async (data: ClientFormData) => {
  const transformed = transformClientInput(data);
  await createClient.mutateAsync(transformed);
};

<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input {...form.register('name')} />
  {form.formState.errors.name && (
    <p className="text-destructive">{form.formState.errors.name.message}</p>
  )}
</form>
```

---

## Getting Started

### 1. Run Development Server

```bash
npm run dev
```

### 2. Create a New Component

```bash
# Generate in a feature module
touch src/features/clients/ui/components/NewComponent.tsx
```

### 3. Add a New Shadcn Component

```bash
npx shadcn@latest add button
```

### 4. Key Files to Review

| File | Purpose |
|------|---------|
| `src/shared/providers/` | Context providers |
| `src/features/clients/` | Reference feature implementation |
| `src/shared/components/ui/` | Available UI components |

---

## Common Gotchas

1. **Import Path**: Use `@/` alias for imports from `src/`
2. **Server vs Client**: App Router pages are server components by default - use `'use client'` for interactivity
3. **Shadcn**: Components are copied into your codebase, not installed as a package
4. **Forms**: Always transform empty strings to `null` before API calls

---

> Next: [BACKEND.md](./BACKEND.md) | [DATABASE.md](./DATABASE.md)
