# Database Onboarding Guide

Welcome to the Next Click ERP V2 database layer! This guide covers Supabase configuration, migrations, RLS policies, and common database patterns.

## Table of Contents

- [Overview](#overview)
- [Supabase Clients](#supabase-clients)
- [Database Schema](#database-schema)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Migrations](#migrations)
- [Common Patterns](#common-patterns)

---

## Overview

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Security | Row Level Security (RLS) |
| Client | `@supabase/supabase-js` |

---

## Supabase Clients

### Server Client (API Routes)

```typescript
import { createClient } from '@/shared/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('clients').select('*');
}
```

### Browser Client (Client Components)

```typescript
import { createClient } from '@/shared/lib/supabase/client';

const supabase = createClient();
```

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User profiles (synced from auth.users) |
| `employees` | Employee records (linked to users) |
| `clients` | Client/customer records |
| `projects` | Project records |
| `project_milestones` | Milestone tracking |
| `project_employees` | Project team assignments |
| `milestone_employees` | Milestone assignments |
| `communications` | Communication logs |

### Common Columns

All tables include:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now(),
deleted_at TIMESTAMPTZ  -- Soft delete
```

### User-Employee Relationship

```
auth.users (Supabase Auth)
    │
    └──> users (public schema, synced via trigger)
           │
           └──> employees (user_id FK)
```

---

## Row Level Security (RLS)

### RLS Helper Functions

Located in migrations, executed with `SECURITY DEFINER`:

```sql
-- Get current user's role
CREATE FUNCTION get_user_role() RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

-- Check if admin
CREATE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$;

-- Check if can manage (admin or manager)
CREATE FUNCTION can_manage() RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('admin', 'manager');
$$;

-- Get current employee ID
CREATE FUNCTION get_current_employee_id() RETURNS UUID
SECURITY DEFINER AS $$
  SELECT id FROM employees WHERE user_id = auth.uid();
$$;

-- Check project assignment
CREATE FUNCTION is_assigned_to_project(p_project_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_employees 
    WHERE project_id = p_project_id 
      AND employee_id = get_current_employee_id()
  );
$$;
```

### Policy Examples

```sql
-- Admins can do everything
CREATE POLICY clients_all_admin ON clients
  FOR ALL USING (is_admin());

-- Managers can view and edit
CREATE POLICY clients_select_manage ON clients
  FOR SELECT USING (can_manage() AND deleted_at IS NULL);

-- Employees can view
CREATE POLICY clients_select_employee ON clients
  FOR SELECT USING (
    get_user_role() = 'employee' AND deleted_at IS NULL
  );

-- Employees can read own record
CREATE POLICY employees_select_self ON employees
  FOR SELECT USING (user_id = auth.uid());
```

---

## Migrations

### Location

```
supabase/migrations/
├── 20260107_001_create_enums.sql
├── 20260107_002_create_tables.sql
├── 20260107_003_create_rls_policies.sql
├── 20260107_004_create_user_trigger.sql
└── ...
```

### Creating a New Migration

Via Supabase MCP or CLI:

```sql
-- Example: Add new column
ALTER TABLE projects ADD COLUMN priority project_priority DEFAULT 'medium';
```

### Migration Best Practices

1. **Naming**: `YYYYMMDD_NNN_description.sql`
2. **Idempotent**: Use `IF NOT EXISTS` where possible
3. **Order**: Enums → Tables → RLS → Triggers

---

## Common Patterns

### Soft Delete

All tables use soft delete:

```sql
-- Never hard delete
UPDATE clients SET deleted_at = now() WHERE id = $1;

-- Query excludes deleted
SELECT * FROM clients WHERE deleted_at IS NULL;
```

### Enum Types

```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'viewer');
CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
```

### User Sync Trigger

Automatically creates user profile when auth user signs up:

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, is_active)
  VALUES (NEW.id, NEW.email, 'employee', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Querying with Repository

### Base Repository

```typescript
export class BaseRepository<T> {
  protected client: SupabaseClient;
  protected table: string;
  
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async softDelete(id: string): Promise<void> {
    await this.client
      .from(this.table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
  }
}
```

### Complex Queries

```typescript
// With joins
const { data } = await supabase
  .from('project_milestones')
  .select(`
    *,
    project:projects(id, project_name),
    assignees:milestone_employees(
      employee:employees(id, name)
    )
  `)
  .eq('id', milestoneId);
```

---

## Debugging

### Check RLS Policies

```sql
SELECT policyname, cmd, qual::text 
FROM pg_policies 
WHERE tablename = 'your_table';
```

### Test as User

```sql
-- Set role for testing
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid"}';
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

> Previous: [FRONTEND.md](./FRONTEND.md) | [BACKEND.md](./BACKEND.md)
