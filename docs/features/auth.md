# Authentication Feature

## Overview

The auth feature handles user authentication, session management, and authorization using Supabase Auth.

## Architecture

```
features/auth/
├── domain/
│   ├── schemas.ts         # Validation for signin/signup
│   └── __tests__/
│       └── schemas.test.ts
└── ui/
    ├── components/
    │   ├── SignInForm.tsx
    │   └── SignUpForm.tsx
    └── hooks/
        └── useAuth.ts     # useCurrentUser, useSignIn, useSignOut
```

## Key Components

### useAuth Hooks

```typescript
// Get current authenticated user
const { data: user, isLoading } = useCurrentUser();

// Sign in mutation
const signIn = useSignIn();
await signIn.mutateAsync({ email, password });

// Sign out mutation
const signOut = useSignOut();
```

## User Sync Trigger

When a user signs up via Supabase Auth, a database trigger automatically creates a profile:

```sql
-- Trigger function
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'employee');
  RETURN NEW;
END;
$$;
```

## User Status

Users have an `is_active` flag. Inactive users are blocked at sign-in:

```typescript
if (!profile.is_active) {
  await supabase.auth.signOut();
  throw new Error('Account is deactivated');
}
```

## Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access |
| `manager` | Manage clients, projects, communications |
| `employee` | View + edit assigned items only |
| `viewer` | Read-only access |
