-- ═══════════════════════════════════════════════
-- 010: Flashcard sessions table
-- Stores per-session results for alphabet and number flashcard assessments
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS flashcard_sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  administered_by UUID REFERENCES profiles(id),
  deck_id     TEXT NOT NULL,                          -- 'alphabet' or 'numbers'
  results     JSONB NOT NULL DEFAULT '[]'::jsonb,     -- [{item, known}]
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_count   INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for querying sessions by student + deck
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_student
  ON flashcard_sessions(student_id, deck_id, created_at DESC);

-- RLS
ALTER TABLE flashcard_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flashcard sessions for their students"
  ON flashcard_sessions FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM student_access WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert flashcard sessions for their students"
  ON flashcard_sessions FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT student_id FROM student_access WHERE user_id = auth.uid()
    )
  );
