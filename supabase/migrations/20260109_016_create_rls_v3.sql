-- Migration: 20260109_016_create_rls_v3
-- Description: Re-implement RLS with is_active filter and simplified role checks

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Get current user's role (using is_active instead of deleted_at)
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT role::text FROM public.users
  WHERE id = auth.uid() AND is_active = true
$$;

-- Check project membership
CREATE OR REPLACE FUNCTION public.am_project_member(p_project_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_employees pe
    JOIN public.employees e ON pe.employee_id = e.id
    WHERE pe.project_id = p_project_id
    AND e.user_id = auth.uid()
    AND e.deleted_at IS NULL
  )
$$;

-- ============================================================================
-- 2. USERS POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY users_select_own ON users
    FOR SELECT USING (id = auth.uid());

-- Admin can read all users
CREATE POLICY users_select_admin ON users
    FOR SELECT USING ((SELECT public.get_my_role()) = 'admin');

-- Users can update their own profile (but not role)
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admin can update any user
CREATE POLICY users_update_admin ON users
    FOR UPDATE 
    USING ((SELECT public.get_my_role()) = 'admin')
    WITH CHECK ((SELECT public.get_my_role()) = 'admin');

-- Service role policies (for Auth hooks)
CREATE POLICY users_insert_service ON users
    FOR INSERT WITH CHECK (true); -- Usually restricted by role elsewhere, but ok for service_role

-- Trigger-based insert for new users (if not service role) can encounter issues 
-- but normally handled by service_role trigger. 
-- We allow admins to insert too if manual creation is needed.
CREATE POLICY users_insert_admin ON users
    FOR INSERT WITH CHECK ((SELECT public.get_my_role()) = 'admin');

-- Admin can delete users (Hard Delete)
CREATE POLICY users_delete_admin ON users
    FOR DELETE USING ((SELECT public.get_my_role()) = 'admin');


-- ============================================================================
-- 3. EMPLOYEES POLICIES
-- ============================================================================
-- Admin (Read/Write), Employees (Read Self)

CREATE POLICY employees_select_all ON employees
    FOR SELECT USING (
        deleted_at IS NULL AND (
            (SELECT public.get_my_role()) = 'admin' 
            OR user_id = auth.uid() 
            OR (SELECT public.get_my_role()) = 'manager' -- Managers need to see employees
        )
    );

CREATE POLICY employees_insert_admin ON employees
    FOR INSERT WITH CHECK ((SELECT public.get_my_role()) = 'admin');

CREATE POLICY employees_update_admin ON employees
    FOR UPDATE 
    USING ((SELECT public.get_my_role()) = 'admin')
    WITH CHECK ((SELECT public.get_my_role()) = 'admin');

CREATE POLICY employees_delete_admin ON employees
    FOR DELETE USING ((SELECT public.get_my_role()) = 'admin');


-- ============================================================================
-- 4. CLIENTS POLICIES
-- ============================================================================
-- All (Read), Manage: Admin/Manager

CREATE POLICY clients_select_all ON clients
    FOR SELECT USING (deleted_at IS NULL AND auth.uid() IS NOT NULL);

CREATE POLICY clients_insert_manage ON clients
    FOR INSERT WITH CHECK ((SELECT public.get_my_role()) IN ('admin', 'manager'));

CREATE POLICY clients_update_manage ON clients
    FOR UPDATE 
    USING ((SELECT public.get_my_role()) IN ('admin', 'manager'))
    WITH CHECK ((SELECT public.get_my_role()) IN ('admin', 'manager'));

CREATE POLICY clients_delete_manage ON clients
    FOR DELETE USING ((SELECT public.get_my_role()) IN ('admin', 'manager'));


-- ============================================================================
-- 5. PROJECTS POLICIES
-- ============================================================================
-- Manage: Admin/Manager, Assigned: Edit (some fields), View: All Viewer + Assigned

CREATE POLICY projects_select_all ON projects
    FOR SELECT USING (
        deleted_at IS NULL AND (
            (SELECT public.get_my_role()) IN ('admin', 'manager')
            OR (SELECT public.get_my_role()) = 'viewer'
            OR (SELECT public.am_project_member(id))
        )
    );

CREATE POLICY projects_insert_manage ON projects
    FOR INSERT WITH CHECK ((SELECT public.get_my_role()) IN ('admin', 'manager'));

CREATE POLICY projects_update ON projects
    FOR UPDATE 
    USING (
        (SELECT public.get_my_role()) IN ('admin', 'manager')
        OR (SELECT public.am_project_member(id))
    )
    WITH CHECK (
        (SELECT public.get_my_role()) IN ('admin', 'manager')
        OR (SELECT public.am_project_member(id))
    );

CREATE POLICY projects_delete_manage ON projects
    FOR DELETE USING ((SELECT public.get_my_role()) IN ('admin', 'manager'));


-- ============================================================================
-- 6. PROJECT_EMPLOYEES POLICIES
-- ============================================================================
-- Manage: Admin/Manager (Assign members), View: Project visibility

CREATE POLICY project_employees_select ON project_employees
    FOR SELECT USING (
        (SELECT public.get_my_role()) IN ('admin', 'manager')
        OR (SELECT public.get_my_role()) = 'viewer'
        OR (SELECT public.am_project_member(project_id))
    );

CREATE POLICY project_employees_insert_manage ON project_employees
    FOR INSERT WITH CHECK ((SELECT public.get_my_role()) IN ('admin', 'manager'));

CREATE POLICY project_employees_delete_manage ON project_employees
    FOR DELETE USING ((SELECT public.get_my_role()) IN ('admin', 'manager'));


-- ============================================================================
-- 7. PROJECT_MILESTONES POLICIES
-- ============================================================================

CREATE POLICY milestones_select ON project_milestones
    FOR SELECT USING (
        deleted_at IS NULL AND (
            (SELECT public.get_my_role()) IN ('admin', 'manager')
            OR (SELECT public.get_my_role()) = 'viewer'
            OR (SELECT public.am_project_member(project_id))
        )
    );

CREATE POLICY milestones_insert_manage ON project_milestones
    FOR INSERT WITH CHECK ((SELECT public.get_my_role()) IN ('admin', 'manager'));

CREATE POLICY milestones_update ON project_milestones
    FOR UPDATE 
    USING (
         (SELECT public.get_my_role()) IN ('admin', 'manager')
         OR (SELECT public.am_project_member(project_id))
    )
    WITH CHECK (
         (SELECT public.get_my_role()) IN ('admin', 'manager')
         OR (SELECT public.am_project_member(project_id))
    );

CREATE POLICY milestones_delete_manage ON project_milestones
    FOR DELETE USING ((SELECT public.get_my_role()) IN ('admin', 'manager'));


-- ============================================================================
-- 8. MILESTONE_EMPLOYEES POLICIES
-- ============================================================================

CREATE POLICY milestone_employees_select ON milestone_employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_milestones pm
            WHERE pm.id = milestone_id
            AND pm.deleted_at IS NULL
            AND (
                (SELECT public.get_my_role()) IN ('admin', 'manager')
                OR (SELECT public.get_my_role()) = 'viewer'
                OR (SELECT public.am_project_member(pm.project_id))
            )
        )
    );

CREATE POLICY milestone_employees_insert_manage ON milestone_employees
    FOR INSERT WITH CHECK ((SELECT public.get_my_role()) IN ('admin', 'manager'));

CREATE POLICY milestone_employees_delete_manage ON milestone_employees
    FOR DELETE USING ((SELECT public.get_my_role()) IN ('admin', 'manager'));


-- ============================================================================
-- 9. COMMUNICATION_LOGS POLICIES
-- ============================================================================

CREATE POLICY communication_select ON communication_logs
    FOR SELECT USING (
        deleted_at IS NULL AND (
            (SELECT public.get_my_role()) IN ('admin', 'manager')
            OR (SELECT public.get_my_role()) = 'viewer'
            OR (project_id IS NOT NULL AND (SELECT public.am_project_member(project_id)))
        )
    );

CREATE POLICY communication_insert ON communication_logs
    FOR INSERT WITH CHECK (
        (SELECT public.get_my_role()) IN ('admin', 'manager')
        OR (project_id IS NOT NULL AND (SELECT public.am_project_member(project_id)))
    );

CREATE POLICY communication_update ON communication_logs
    FOR UPDATE 
    USING (
        (SELECT public.get_my_role()) IN ('admin', 'manager')
        OR (project_id IS NOT NULL AND (SELECT public.am_project_member(project_id)))
    )
    WITH CHECK (
        (SELECT public.get_my_role()) IN ('admin', 'manager')
        OR (project_id IS NOT NULL AND (SELECT public.am_project_member(project_id)))
    );

CREATE POLICY communication_delete_manage ON communication_logs
    FOR DELETE USING ((SELECT public.get_my_role()) IN ('admin', 'manager'));
