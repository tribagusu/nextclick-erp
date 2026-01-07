-- Next Click ERP V2 - Add Role to Project Employees
-- Migration: 20260107_006_add_role_to_project_employees
-- Description: Add optional role column for team member roles on projects

ALTER TABLE project_employees ADD COLUMN IF NOT EXISTS role TEXT;

COMMENT ON COLUMN project_employees.role IS 'Optional role for the team member on this project (e.g., Developer, Designer, Lead)';
