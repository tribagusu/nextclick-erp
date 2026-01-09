-- Migration: 20260109_017_fix_rls_soft_delete
-- Description: Remove deleted_at checks from RLS policies
-- 
-- RATIONALE: RLS should enforce PERMISSION (who can access), not VISIBILITY 
-- (which rows are shown). Soft-delete filtering is an application concern 
-- handled by repositories.
--
-- The previous policies with `deleted_at IS NULL` in USING clauses caused
-- the "new row violates row-level security policy" error when attempting
-- soft-delete because the updated row became invisible to RLS.

-- ============================================================================
-- DROP AFFECTED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS clients_select_all ON clients;
DROP POLICY IF EXISTS employees_select_all ON employees;
DROP POLICY IF EXISTS projects_select_all ON projects;
DROP POLICY IF EXISTS milestones_select ON project_milestones;
DROP POLICY IF EXISTS milestone_employees_select ON milestone_employees;
DROP POLICY IF EXISTS communication_select ON communication_logs;

-- ============================================================================
-- RECREATE POLICIES WITHOUT deleted_at CHECKS
-- ============================================================================

-- Clients: All authenticated users can SELECT
CREATE POLICY clients_select_all ON clients
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Employees: Admin/Manager or own record
CREATE POLICY employees_select_all ON employees
    FOR SELECT USING (
        (SELECT public.get_my_role()) IN ('admin', 'manager')
        OR user_id = auth.uid()
    );

-- Projects: Admin/Manager, Viewer, or Project Member
CREATE POLICY projects_select_all ON projects
    FOR SELECT USING (
        (SELECT public.get_my_role()) IN ('admin', 'manager', 'viewer')
        OR (SELECT public.am_project_member(id))
    );

-- Project Milestones: Same visibility as projects
CREATE POLICY milestones_select ON project_milestones
    FOR SELECT USING (
        (SELECT public.get_my_role()) IN ('admin', 'manager', 'viewer')
        OR (SELECT public.am_project_member(project_id))
    );

-- Milestone Employees: Based on milestone's project visibility
CREATE POLICY milestone_employees_select ON milestone_employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_milestones pm
            WHERE pm.id = milestone_id
            AND (
                (SELECT public.get_my_role()) IN ('admin', 'manager', 'viewer')
                OR (SELECT public.am_project_member(pm.project_id))
            )
        )
    );

-- Communication Logs: Admin/Manager, Viewer, or Project Member (if linked)
CREATE POLICY communication_select ON communication_logs
    FOR SELECT USING (
        (SELECT public.get_my_role()) IN ('admin', 'manager', 'viewer')
        OR (project_id IS NOT NULL AND (SELECT public.am_project_member(project_id)))
    );
