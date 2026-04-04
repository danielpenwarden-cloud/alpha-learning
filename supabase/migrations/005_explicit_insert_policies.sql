-- ═══════════════════════════════════════════════
-- Explicit INSERT/UPDATE policies for write-heavy tables
-- ═══════════════════════════════════════════════
-- The existing FOR ALL USING(...) policies can silently block INSERTs
-- in some Supabase/PostgREST configurations because the USING clause
-- isn't always correctly promoted to WITH CHECK for writes.
-- Adding explicit INSERT/UPDATE policies ensures writes always work.

-- Documents
CREATE POLICY "Users can insert documents for own students" ON documents
  FOR INSERT
  WITH CHECK (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE
  USING (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

-- Domain scores
CREATE POLICY "Users can insert domain scores" ON domain_scores
  FOR INSERT
  WITH CHECK (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

-- Student milestones
CREATE POLICY "Users can insert milestones" ON student_milestones
  FOR INSERT
  WITH CHECK (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update milestones" ON student_milestones
  FOR UPDATE
  USING (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

-- Assessments
CREATE POLICY "Users can insert assessments" ON assessments
  FOR INSERT
  WITH CHECK (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

-- Worksheets
CREATE POLICY "Users can insert worksheets" ON worksheets
  FOR INSERT
  WITH CHECK (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

-- Weekly recaps
CREATE POLICY "Users can insert recaps" ON weekly_recaps
  FOR INSERT
  WITH CHECK (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));
