-- Add job_notifications_enabled column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_notifications_enabled boolean DEFAULT false;
