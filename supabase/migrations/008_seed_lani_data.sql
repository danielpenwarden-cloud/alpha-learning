-- ═══════════════════════════════════════════════
-- Seed Lani's milestone data for Dan's account
-- ═══════════════════════════════════════════════
-- The INITIAL_STATUS and CHILD_SCORES data was always local JavaScript.
-- This migration writes it to Supabase so the dashboard shows real data.
-- Uses Dan's user ID to find the student created during onboarding.

DO $$
DECLARE
  v_student_id UUID;
  v_user_id UUID := '669d3901-8ad7-4f11-a188-665162822b6c';
BEGIN
  -- Find the student created by Dan
  SELECT id INTO v_student_id
  FROM students
  WHERE created_by = v_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_student_id IS NULL THEN
    RAISE NOTICE 'No student found for user %. Skipping seed.', v_user_id;
    RETURN;
  END IF;

  RAISE NOTICE 'Seeding data for student %', v_student_id;

  -- ─── Milestone Statuses (40 milestones) ────────────────
  -- Delete existing (if any) to avoid duplicates
  DELETE FROM student_milestones WHERE student_id = v_student_id;

  INSERT INTO student_milestones (student_id, milestone_id, status, progress, evidence_notes, assessed_by, assessed_at)
  VALUES
    -- LITERACY
    (v_student_id, 'L01', 'mastered',    100, 'Writes own name, brother''s name, and "Tegan"', v_user_id, '2026-02-25'),
    (v_student_id, 'L02', 'mastered',    100, 'Holds books correctly, points to text', v_user_id, '2026-02-25'),
    (v_student_id, 'L03', 'in-progress',  73, 'Writes 19/26 letters (tested Feb 25 2026)', v_user_id, '2026-02-25'),
    (v_student_id, 'L04', 'in-progress',  50, 'Reading Eggs: 31/250 phonic skills mastered, completed lessons on N and P with sounds', v_user_id, '2026-02-25'),
    (v_student_id, 'L05', 'not-started',   0, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'L06', 'not-started',   0, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'L07', 'not-started',   0, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'L08', 'emerging',     10, 'Reading Eggs: 4/236 sight words known', v_user_id, '2026-02-25'),
    (v_student_id, 'L09', 'in-progress',  40, 'Read 2 fiction books (Pp, Nn) on Reading Eggs', v_user_id, '2026-02-25'),
    (v_student_id, 'L10', 'in-progress',  50, 'Reading Eggs Map 1 quiz 93%, Lesson 12 score 100%, Lesson 11 score 90%', v_user_id, '2026-02-25'),
    (v_student_id, 'L11', 'proficient',   75, 'Reading Eggs estimated reading age 5 years', v_user_id, '2026-02-25'),
    (v_student_id, 'L12', 'emerging',     10, 'Reading Eggs: 12/130 skills mastered, just starting CVC decoding', v_user_id, '2026-02-25'),

    -- NUMERACY
    (v_student_id, 'N01', 'mastered',    100, 'Counts 1-10 fluently', v_user_id, '2026-02-25'),
    (v_student_id, 'N02', 'proficient',   70, '1:1 correspondence solid to 7', v_user_id, '2026-02-25'),
    (v_student_id, 'N03', 'in-progress',  60, 'Recognizes 1-5,7. Confuses 6 and 9', v_user_id, '2026-02-25'),
    (v_student_id, 'N04', 'mastered',    100, 'Counts to 29 (tested Feb 25 2026)', v_user_id, '2026-02-25'),
    (v_student_id, 'N05', 'mastered',    100, 'All 4 basic shapes', v_user_id, '2026-02-25'),
    (v_student_id, 'N06', 'in-progress',  50, 'Good with ''more'', developing ''fewer''', v_user_id, '2026-02-25'),
    (v_student_id, 'N07', 'in-progress',  65, 'Strong: on,under,next to. Learning: behind,between', v_user_id, '2026-02-25'),
    (v_student_id, 'N08', 'not-started',   0, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'N09', 'in-progress',  55, 'Sorts by color well, developing shape/size', v_user_id, '2026-02-25'),
    (v_student_id, 'N10', 'in-progress',  70, 'Writes numbers to 10, needs support with 8 and 9 (school report)', v_user_id, '2026-02-25'),
    (v_student_id, 'N11', 'in-progress',  30, 'School taught number bonds for 5 and 10', v_user_id, '2026-02-25'),
    (v_student_id, 'N12', 'in-progress',  45, 'Bigger/smaller good. Taller/shorter developing', v_user_id, '2026-02-25'),

    -- SOCIAL-EMOTIONAL
    (v_student_id, 'S01', 'in-progress',  55, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'S02', 'mastered',    100, 'Negotiates sharing, collaborates in sand pit (school report)', v_user_id, '2026-02-25'),
    (v_student_id, 'S03', 'proficient',   75, 'Builds intricate structures independently (school report)', v_user_id, '2026-02-25'),
    (v_student_id, 'S04', 'proficient',   70, 'Observed peers, offered help, demonstrated to group (school report)', v_user_id, '2026-02-25'),
    (v_student_id, 'S05', 'proficient',   75, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'S06', 'in-progress',  50, 'Navigated sharing successfully (school report)', v_user_id, '2026-02-25'),
    (v_student_id, 'S07', 'in-progress',  40, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'S08', 'proficient',   80, '"Fantastic communicating" (school report)', v_user_id, '2026-02-25'),

    -- MOTOR SKILLS
    (v_student_id, 'M01', 'mastered',    100, 'Consistent tripod grip', v_user_id, '2026-02-25'),
    (v_student_id, 'M02', 'mastered',    100, 'Writes 3 names (own, brother, Tegan)', v_user_id, '2026-02-25'),
    (v_student_id, 'M03', 'in-progress',  40, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'M04', 'in-progress',  55, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'M05', 'in-progress',  73, 'Writes 19/26 letters (tested Feb 25 2026)', v_user_id, '2026-02-25'),
    (v_student_id, 'M06', 'mastered',    100, 'Hops on one foot, balances 5 seconds (tested Feb 25 2026)', v_user_id, '2026-02-25'),
    (v_student_id, 'M07', 'proficient',   75, NULL, v_user_id, '2026-02-25'),
    (v_student_id, 'M08', 'proficient',   85, 'Colours within lines well (tested Feb 25 2026)', v_user_id, '2026-02-25');

  -- ─── Domain Scores ─────────────────────────────────────
  DELETE FROM domain_scores WHERE student_id = v_student_id;

  INSERT INTO domain_scores (student_id, domain_id, score_vs_age, score_vs_5yr, assessed_at, notes)
  VALUES
    (v_student_id, 'literacy',  42, 68, '2026-02-25', 'Initial seed from assessment data'),
    (v_student_id, 'numeracy',  62, 70, '2026-02-25', 'Initial seed from assessment data'),
    (v_student_id, 'social',    68, 68, '2026-02-25', 'Initial seed from assessment data'),
    (v_student_id, 'motor',     79, 74, '2026-02-25', 'Initial seed from assessment data');

  RAISE NOTICE 'Successfully seeded 40 milestones and 4 domain scores for student %', v_student_id;
END $$;
