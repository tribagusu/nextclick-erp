-- Migration: 20260109_015_drop_users_deleted_at
-- Description: Remove deleted_at from users table as confirmed by user

ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
