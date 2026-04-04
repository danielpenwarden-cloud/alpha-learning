-- ═══════════════════════════════════════════════
-- Fix: Allow authenticated users to INSERT students
-- ═══════════════════════════════════════════════
-- The FOR ALL USING policy from 001 blocks INSERTs because no
-- student_access row exists yet for a brand-new student.
-- This migration safely creates the INSERT policy if it doesn't exist.
--
-- Also ensures student_access INSERT policy exists so the code can
-- link the new student to the user immediately after creating it.

-- Drop and recreate to ensure clean state (idempotent)
DROP POLICY IF EXISTS "Users can create students" ON students;
CREATE POLICY "Users can create students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Also ensure students SELECT works via created_by as fallback
-- (the FOR ALL USING policy only checks student_access join)
DROP POLICY IF EXISTS "Users can read own created students" ON students;
CREATE POLICY "Users can read own created students"
  ON students
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Ensure student_access has RLS enabled and allows inserts
ALTER TABLE student_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own student access" ON student_access;
CREATE POLICY "Users manage own student access"
  ON student_access
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure profiles RLS allows inserts (for ensureProfileExists fallback)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
