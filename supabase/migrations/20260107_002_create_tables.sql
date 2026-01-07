-- Next Click ERP V2 - Database Tables
-- Migration: 20260107_002_create_tables
-- Description: Create all tables with proper relationships and constraints

-- ============================================================================
-- USERS TABLE (syncs with Supabase Auth)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Index for common queries
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- ============================================================================
-- EMPLOYEES TABLE (business entity)
-- ============================================================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable: employee may not have system account
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position TEXT,
    department TEXT,
    hire_date DATE,
    status employee_status NOT NULL DEFAULT 'active',
    salary DECIMAL(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_employees_user_id ON employees(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_status ON employees(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_department ON employees(department) WHERE deleted_at IS NULL;

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_clients_company ON clients(company_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_name ON clients(name) WHERE deleted_at IS NULL;

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    project_name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status project_status NOT NULL DEFAULT 'draft',
    priority project_priority NOT NULL DEFAULT 'medium',
    total_budget DECIMAL(12, 2) DEFAULT 0,
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    payment_terms TEXT,
    last_payment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_projects_client ON projects(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_priority ON projects(priority) WHERE deleted_at IS NULL;

-- ============================================================================
-- PROJECT_EMPLOYEES JUNCTION TABLE (team assignment)
-- ============================================================================
CREATE TABLE project_employees (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project_id, employee_id)
);

CREATE INDEX idx_project_employees_employee ON project_employees(employee_id);

-- ============================================================================
-- PROJECT_MILESTONES TABLE
-- ============================================================================
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone TEXT NOT NULL, -- Milestone name/title
    description TEXT,
    due_date DATE,
    completion_date DATE,
    status milestone_status NOT NULL DEFAULT 'pending',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_milestones_project ON project_milestones(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_milestones_status ON project_milestones(status) WHERE deleted_at IS NULL;

-- ============================================================================
-- MILESTONE_EMPLOYEES JUNCTION TABLE (milestone assignment)
-- ============================================================================
CREATE TABLE milestone_employees (
    milestone_id UUID NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (milestone_id, employee_id)
);

CREATE INDEX idx_milestone_employees_employee ON milestone_employees(employee_id);

-- ============================================================================
-- COMMUNICATION_LOGS TABLE
-- ============================================================================
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Optional: communication may not be about a specific project
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mode communication_mode NOT NULL,
    summary TEXT NOT NULL,
    follow_up_required BOOLEAN NOT NULL DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_communication_client ON communication_logs(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_communication_project ON communication_logs(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_communication_follow_up ON communication_logs(follow_up_date) 
    WHERE deleted_at IS NULL AND follow_up_required = TRUE;

-- ============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON project_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_logs_updated_at BEFORE UPDATE ON communication_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
