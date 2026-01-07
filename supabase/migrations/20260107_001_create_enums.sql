-- Next Click ERP V2 - Database Enums
-- Migration: 20260107_001_create_enums
-- Description: Create all PostgreSQL enums for type safety

-- User roles for RBAC
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'viewer');

-- Employee employment status
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'on_leave');

-- Project lifecycle status
CREATE TYPE project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'cancelled');

-- Project priority levels
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Milestone completion status
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Communication channel types
CREATE TYPE communication_mode AS ENUM ('email', 'call', 'meeting');
