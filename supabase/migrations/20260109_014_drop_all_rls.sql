-- Migration: 20260109_014_drop_all_rls
-- Description: Drop all policies and RLS helper functions to restart cleanly

-- Drop all policies from tables
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_select_admin ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_update_admin ON users;
DROP POLICY IF EXISTS users_insert_admin ON users;
DROP POLICY IF EXISTS users_insert_auth ON users;
DROP POLICY IF EXISTS users_insert_service ON users;

DROP POLICY IF EXISTS employees_select_admin ON employees;
DROP POLICY IF EXISTS employees_insert_admin ON employees;
DROP POLICY IF EXISTS employees_update_admin ON employees;
DROP POLICY IF EXISTS employees_delete_admin ON employees;

DROP POLICY IF EXISTS clients_select_all ON clients;
DROP POLICY IF EXISTS clients_select ON clients; -- Handle generic name variation
DROP POLICY IF EXISTS clients_insert_manage ON clients;
DROP POLICY IF EXISTS clients_insert ON clients; -- Handle generic name variation
DROP POLICY IF EXISTS clients_update_manage ON clients;
DROP POLICY IF EXISTS clients_update ON clients; -- Handle generic name variation
DROP POLICY IF EXISTS clients_delete_manage ON clients;
DROP POLICY IF EXISTS clients_delete ON clients; -- Handle generic name variation

DROP POLICY IF EXISTS projects_select_all ON projects;
DROP POLICY IF EXISTS projects_insert_manage ON projects;
DROP POLICY IF EXISTS projects_update ON projects;
DROP POLICY IF EXISTS projects_delete_manage ON projects;

DROP POLICY IF EXISTS project_employees_select ON project_employees;
DROP POLICY IF EXISTS project_employees_insert_manage ON project_employees;
DROP POLICY IF EXISTS project_employees_delete_manage ON project_employees;

DROP POLICY IF EXISTS milestones_select ON project_milestones;
DROP POLICY IF EXISTS milestones_insert_manage ON project_milestones;
DROP POLICY IF EXISTS milestones_update ON project_milestones;
DROP POLICY IF EXISTS milestones_delete_manage ON project_milestones;

DROP POLICY IF EXISTS milestone_employees_select ON milestone_employees;
DROP POLICY IF EXISTS milestone_employees_insert_manage ON milestone_employees;
DROP POLICY IF EXISTS milestone_employees_delete_manage ON milestone_employees;

DROP POLICY IF EXISTS communication_select ON communication_logs;
DROP POLICY IF EXISTS communication_insert ON communication_logs;
DROP POLICY IF EXISTS communication_update ON communication_logs;
DROP POLICY IF EXISTS communication_delete_manage ON communication_logs;
DROP POLICY IF EXISTS communication_delete ON communication_logs; -- Handle generic name variation

-- Drop helper functions
-- Using CASCADE to ensure any lingering dependencies are also removed
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.am_project_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_employee_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.can_manage() CASCADE;
DROP FUNCTION IF EXISTS public.is_assigned_to_project(uuid) CASCADE;
