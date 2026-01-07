-- Migration: Add is_active column to users table
-- Description: Add is_active boolean to control login access

-- Add is_active column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Create index for quick filtering
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- Comment for documentation
COMMENT ON COLUMN users.is_active IS 'If FALSE, user cannot login to the system';
