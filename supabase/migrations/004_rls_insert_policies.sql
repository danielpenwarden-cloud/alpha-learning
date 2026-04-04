-- ═══════════════════════════════════════════════
-- Fix RLS to allow auto-seeding on first sign-in
-- ═══════════════════════════════════════════════
-- Problem: The existing "FOR ALL USING (id IN student_access)" policy on
-- students blocks INSERT because no student_access row exists yet when
-- creating a brand new student. PostgreSQL uses USING as WITH CHECK for
-- INSERT when no explicit WITH CHECK is provided.
--
-- Fix: Add a separate INSERT policy that checks created_by = auth.uid().
-- Multiple policies on the same table are OR'd, so the INSERT will pass
-- via this policy even though the FOR ALL policy would reject it.

-- Allow authenticated users to create students where they are the creator
CREATE POLICY "Users can create students"
  ON students
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Ensure profiles table has a policy allowing users to read/insert their own profile
-- (profiles table doesn't have RLS enabled, but add upsert safety)
-- Note: profiles are auto-created by the handle_new_user() trigger, but
-- we add a fallback INSERT policy in case the trigger hasn't fired yet.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Ensure student_access allows users to manage their own access rows
ALTER TABLE student_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own student access"
  ON student_access
  FOR ALL
  USING (user_id = auth.uid());
