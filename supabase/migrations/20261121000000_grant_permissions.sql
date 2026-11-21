-- ==============================================================================
-- CREATORFLOW AI: Grant Schema & Table Privileges to Supabase API Roles
-- Migration: 20261121000000_grant_permissions.sql
-- ==============================================================================

-- 1. Grant usage on public schema to PostgREST roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant table, sequence, and routine privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Ensure future tables created automatically inherit these privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
