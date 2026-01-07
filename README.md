# Nextclick ERP

A modern Enterprise Resource Planning (ERP) application built with Next.js 16, React 19, and Supabase.

## Features

- **Client Management** - Track clients with contact info and notes
- **Project Tracking** - Manage projects with status, priority, and budget
- **Milestone Management** - Track project milestones with assignments
- **Team Management** - Assign employees to projects and milestones
- **Communication Logs** - Record client and project communications
- **Role-Based Access** - Admin, Manager, Employee, and Viewer roles

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, Tailwind CSS v4, Shadcn/ui |
| State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + RLS |
| Testing | Vitest |

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm
- Supabase project

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Authenticated pages
│   └── api/                # API routes
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   ├── clients/            # Client management
│   ├── projects/           # Project management
│   ├── milestones/         # Milestone tracking
│   ├── employees/          # Employee management
│   └── communications/     # Communication logs
└── shared/                 # Shared utilities & components
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm test         # Run tests
npm run lint     # Lint code
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System architecture overview
- [Features](./docs/features/) - Feature-specific documentation
- [Onboarding](./docs/onboarding/) - Developer guides
  - [Frontend](./docs/onboarding/FRONTEND.md)
  - [Backend](./docs/onboarding/BACKEND.md)
  - [Database](./docs/onboarding/DATABASE.md)

## License

Private - All rights reserved
