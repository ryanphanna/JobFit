-- Migration: Add database indexes for performance
-- Created: 2026-01-24
-- Purpose: Improve query performance on frequently accessed columns

-- Jobs table indexes
-- Index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);

-- Index on created_at for date-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_jobs_date_added ON jobs(date_added DESC);

-- Composite index for user + date queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_jobs_user_date ON jobs(user_id, date_added DESC);

-- Index on status for filtering by job status
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE status IS NOT NULL;

-- Resumes table indexes
-- Index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- Profiles table indexes
-- Composite index for admin/tester queries
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_tester ON profiles(is_tester) WHERE is_tester = true;

-- Index on subscription tier for tier-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(subscription_tier);

-- Analyze tables to update statistics
ANALYZE jobs;
ANALYZE resumes;
ANALYZE profiles;

-- Optional: Create statistics for better query planning
-- Uncomment if you want even better query performance
-- CREATE STATISTICS jobs_user_status ON user_id, status FROM jobs;
-- CREATE STATISTICS resumes_user_created ON user_id, created_at FROM resumes;
