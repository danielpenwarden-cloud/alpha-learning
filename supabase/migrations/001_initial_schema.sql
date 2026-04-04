-- ═══════════════════════════════════════════════
-- ALPHA LEARNING — Initial Schema
-- ═══════════════════════════════════════════════

-- Profiles extend Supabase auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'guide', 'admin')),
  timezone TEXT DEFAULT 'Asia/Bangkok',
  notification_preferences JSONB DEFAULT '{"push": true, "email": true, "sunday_recap": true}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  school_name TEXT,
  notes TEXT,
  target_school_entry TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link parents/guides to students
CREATE TABLE student_access (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'parent',
  PRIMARY KEY (student_id, user_id)
);

-- Domains
CREATE TABLE domains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INT
);

-- Milestone definitions
CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  domain_id TEXT REFERENCES domains(id),
  name TEXT NOT NULL,
  description TEXT,
  detail TEXT,
  how_to_assess TEXT,
  how_to_teach TEXT,
  age5_target TEXT,
  sort_order INT,
  difficulty_level INT DEFAULT 1
);

-- Prerequisite edges
CREATE TABLE milestone_prerequisites (
  milestone_id TEXT REFERENCES milestones(id),
  requires_milestone_id TEXT REFERENCES milestones(id),
  PRIMARY KEY (milestone_id, requires_milestone_id)
);

-- Student progress on milestones
CREATE TABLE student_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  milestone_id TEXT REFERENCES milestones(id),
  status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started','emerging','in-progress','proficient','mastered')),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  evidence_notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  assessed_by UUID REFERENCES profiles(id),
  UNIQUE (student_id, milestone_id)
);

-- Domain scores (tracked over time for charts)
CREATE TABLE domain_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  domain_id TEXT REFERENCES domains(id),
  score_vs_age INT CHECK (score_vs_age >= 0 AND score_vs_age <= 100),
  score_vs_5yr INT CHECK (score_vs_5yr >= 0 AND score_vs_5yr <= 100),
  assessed_at DATE NOT NULL,
  notes TEXT
);

-- Documents & evidence
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_path TEXT,
  source TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id),
  ai_extracted BOOLEAN DEFAULT FALSE,
  ai_insights TEXT,
  linked_milestones TEXT[],
  pii_detected BOOLEAN DEFAULT FALSE,
  pii_items JSONB,
  redacted_file_path TEXT
);

-- Assessments
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('micro', 'asq3', 'formal')),
  domain_id TEXT REFERENCES domains(id),
  questions JSONB,
  score INT,
  administered_at TIMESTAMPTZ DEFAULT NOW(),
  administered_by UUID REFERENCES profiles(id),
  notes TEXT
);

-- Worksheets
CREATE TABLE worksheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  title TEXT NOT NULL,
  domain_id TEXT REFERENCES domains(id),
  content JSONB,
  target_milestones TEXT[],
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  printed BOOLEAN DEFAULT FALSE
);

-- Weekly recaps
CREATE TABLE weekly_recaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  milestones_progressed TEXT[],
  milestones_completed TEXT[],
  milestones_stuck TEXT[],
  domain_trends JSONB,
  ai_summary TEXT,
  next_week_plan JSONB,
  parent_notes TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own students" ON students
  FOR ALL USING (id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users see own student milestones" ON student_milestones
  FOR ALL USING (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users see own domain scores" ON domain_scores
  FOR ALL USING (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users see own documents" ON documents
  FOR ALL USING (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users see own assessments" ON assessments
  FOR ALL USING (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users see own worksheets" ON worksheets
  FOR ALL USING (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users see own recaps" ON weekly_recaps
  FOR ALL USING (student_id IN (
    SELECT student_id FROM student_access WHERE user_id = auth.uid()
  ));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
