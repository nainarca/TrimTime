-- ============================================================
-- TRIMTIME — PostgreSQL Initialization Script
-- Runs once when the container is first created
-- ============================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- for text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";   -- for composite indexes

-- Set timezone
SET timezone = 'UTC';
