-- Next Click ERP V2 - Row Level Security Policies
-- Migration: 20260107_003_create_rls_policies
-- Description: Implement 3-layer security at database level
-- All policies filter deleted_at IS NULL for soft delete support

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: Get current user's role
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role FROM users 
        WHERE id = auth.uid() AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- HELPER FUNCTION: Check if user can manage (admin or manager)
-- ============================================================================
CREATE OR REPLACE FUNCTION can_manage()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- HELPER FUNCTION: Get employee ID for current user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_current_employee_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM employees 
        WHERE user_id = auth.uid() AND deleted_at IS NULL
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- HELPER FUNCTION: Check if user is assigned to a project
-- ============================================================================
CREATE OR REPLACE FUNCTION is_assigned_to_project(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM project_employees pe
        WHERE pe.project_id = p_project_id
        AND pe.employee_id = get_current_employee_id()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- USERS POLICIES
-- ============================================================================
-- Users can read their own profile
CREATE POLICY users_select_own ON users
    FOR SELECT USING (
        deleted_at IS NULL AND id = auth.uid()
    );

-- Admin can read all users
CREATE POLICY users_select_admin ON users
    FOR SELECT USING (
        deleted_at IS NULL AND is_admin()
    );

-- Users can update their own profile (but not role)
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND deleted_at IS NULL);

-- Admin can update any user
CREATE POLICY users_update_admin ON users
    FOR UPDATE USING (is_admin());

-- Only admin can insert (handled by auth trigger typically)
CREATE POLICY users_insert_admin ON users
    FOR INSERT WITH CHECK (is_admin() OR id = auth.uid());

-- ============================================================================
-- EMPLOYEES POLICIES (Admin only)
-- ============================================================================
CREATE POLICY employees_select_admin ON employees
    FOR SELECT USING (
        deleted_at IS NULL AND is_admin()
    );

CREATE POLICY employees_insert_admin ON employees
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY employees_update_admin ON employees
    FOR UPDATE USING (is_admin());

CREATE POLICY employees_delete_admin ON employees
    FOR DELETE USING (is_admin());

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================
-- All authenticated users can read clients
CREATE POLICY clients_select_all ON clients
    FOR SELECT USING (
        deleted_at IS NULL AND auth.uid() IS NOT NULL
    );

-- Admin and Manager can create clients
CREATE POLICY clients_insert_manage ON clients
    FOR INSERT WITH CHECK (can_manage());

-- Admin and Manager can update clients
CREATE POLICY clients_update_manage ON clients
    FOR UPDATE USING (can_manage());

-- Admin and Manager can delete (soft delete) clients
CREATE POLICY clients_delete_manage ON clients
    FOR DELETE USING (can_manage());

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================
-- Admin/Manager: see all projects; Employee: only assigned; Viewer: all (read-only)
CREATE POLICY projects_select_all ON projects
    FOR SELECT USING (
        deleted_at IS NULL 
        AND (
            can_manage()
            OR get_user_role() = 'viewer'
            OR is_assigned_to_project(id)
        )
    );

-- Admin and Manager can create projects
CREATE POLICY projects_insert_manage ON projects
    FOR INSERT WITH CHECK (can_manage());

-- Admin/Manager can update all; Employee can update assigned only
CREATE POLICY projects_update ON projects
    FOR UPDATE USING (
        can_manage() OR is_assigned_to_project(id)
    );

-- Only Admin and Manager can delete
CREATE POLICY projects_delete_manage ON projects
    FOR DELETE USING (can_manage());

-- ============================================================================
-- PROJECT_EMPLOYEES POLICIES (Team assignment)
-- ============================================================================
-- Anyone who can see project can see assignment
CREATE POLICY project_employees_select ON project_employees
    FOR SELECT USING (
        can_manage()
        OR get_user_role() = 'viewer'
        OR is_assigned_to_project(project_id)
    );

-- Only Admin and Manager can assign team
CREATE POLICY project_employees_insert_manage ON project_employees
    FOR INSERT WITH CHECK (can_manage());

CREATE POLICY project_employees_delete_manage ON project_employees
    FOR DELETE USING (can_manage());

-- ============================================================================
-- PROJECT_MILESTONES POLICIES
-- ============================================================================
CREATE POLICY milestones_select ON project_milestones
    FOR SELECT USING (
        deleted_at IS NULL
        AND (
            can_manage()
            OR get_user_role() = 'viewer'
            OR is_assigned_to_project(project_id)
        )
    );

-- Admin/Manager can create milestones
CREATE POLICY milestones_insert_manage ON project_milestones
    FOR INSERT WITH CHECK (can_manage());

-- Admin/Manager/Assigned employee can update
CREATE POLICY milestones_update ON project_milestones
    FOR UPDATE USING (
        can_manage() OR is_assigned_to_project(project_id)
    );

-- Only Admin and Manager can delete
CREATE POLICY milestones_delete_manage ON project_milestones
    FOR DELETE USING (can_manage());

-- ============================================================================
-- MILESTONE_EMPLOYEES POLICIES
-- ============================================================================
CREATE POLICY milestone_employees_select ON milestone_employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_milestones pm
            WHERE pm.id = milestone_id
            AND pm.deleted_at IS NULL
            AND (
                can_manage()
                OR get_user_role() = 'viewer'
                OR is_assigned_to_project(pm.project_id)
            )
        )
    );

CREATE POLICY milestone_employees_insert_manage ON milestone_employees
    FOR INSERT WITH CHECK (can_manage());

CREATE POLICY milestone_employees_delete_manage ON milestone_employees
    FOR DELETE USING (can_manage());

-- ============================================================================
-- COMMUNICATION_LOGS POLICIES
-- ============================================================================
CREATE POLICY communication_select ON communication_logs
    FOR SELECT USING (
        deleted_at IS NULL
        AND (
            can_manage()
            OR get_user_role() = 'viewer'
            OR (project_id IS NOT NULL AND is_assigned_to_project(project_id))
        )
    );

-- Admin/Manager can create any; Employee can create for assigned projects
CREATE POLICY communication_insert ON communication_logs
    FOR INSERT WITH CHECK (
        can_manage()
        OR (project_id IS NOT NULL AND is_assigned_to_project(project_id))
    );

-- Admin/Manager can update any; Employee can update for assigned projects
CREATE POLICY communication_update ON communication_logs
    FOR UPDATE USING (
        can_manage()
        OR (project_id IS NOT NULL AND is_assigned_to_project(project_id))
    );

-- Only Admin and Manager can delete
CREATE POLICY communication_delete_manage ON communication_logs
    FOR DELETE USING (can_manage());
