// Database operations for Supabase persistence
import { supabase } from './supabase';

// ─── Profile ──────────────────────────────────────

export async function ensureProfileExists(userId, displayName) {
  if (!supabase) return;

  // Check if profile exists
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (data) return; // Profile already exists (created by trigger)

  // Fallback: create profile if trigger hasn't fired yet
  const { error } = await supabase
    .from('profiles')
    .insert({ id: userId, display_name: displayName || 'Parent' });

  if (error && error.code !== '23505') {
    // 23505 = unique_violation (race condition with trigger — safe to ignore)
    console.error('Error ensuring profile:', error);
  }
}

// ─── Profile (update) ────────────────────────────

export async function updateProfile(userId, { displayName }) {
  if (!supabase) return;

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId);

  if (error) console.error('Error updating profile:', error);
}

// ─── Student ──────────────────────────────────────

export async function fetchStudentForUser(userId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('student_access')
    .select('student_id, students(*)')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.students;
}

export async function fetchStudentsForUser(userId) {
  if (!supabase) return [];

  // Primary: query via student_access join
  const { data, error } = await supabase
    .from('student_access')
    .select('student_id, students(*)')
    .eq('user_id', userId);

  if (!error && data && data.length > 0) {
    const students = data.map(row => row.students).filter(Boolean);
    if (students.length > 0) return students;
  }

  if (error) {
    console.error('fetchStudentsForUser student_access error:', error);
  }

  // Fallback: query students table directly by created_by
  // This handles cases where student_access RLS blocks the read
  // or the access row is missing
  const { data: directData, error: directError } = await supabase
    .from('students')
    .select('*')
    .eq('created_by', userId);

  if (directError) {
    console.error('fetchStudentsForUser direct fallback error:', directError);
    throw directError;
  }

  return directData || [];
}

export async function updateStudent(studentId, updates) {
  if (!supabase) return null;

  const mapped = {};
  if (updates.firstName !== undefined) mapped.first_name = updates.firstName;
  if (updates.dateOfBirth !== undefined) mapped.date_of_birth = updates.dateOfBirth;
  if (updates.schoolName !== undefined) mapped.school_name = updates.schoolName;
  if (updates.notes !== undefined) mapped.notes = updates.notes;
  if (updates.targetSchoolEntry !== undefined) mapped.target_school_entry = updates.targetSchoolEntry;
  if (updates.country !== undefined) mapped.country = updates.country;

  const { data, error } = await supabase
    .from('students')
    .update(mapped)
    .eq('id', studentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating student:', error);
    return null;
  }
  return data;
}

export async function deleteStudent(studentId) {
  if (!supabase) return;

  // Delete access record first, then student (cascade should handle related data)
  await supabase.from('student_access').delete().eq('student_id', studentId);
  const { error } = await supabase.from('students').delete().eq('id', studentId);
  if (error) console.error('Error deleting student:', error);
}

export async function createStudentForUser(userId, studentData) {
  if (!supabase) return null;

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .insert({
      first_name: studentData.firstName,
      date_of_birth: studentData.dateOfBirth,
      school_name: studentData.schoolName,
      notes: studentData.notes,
      target_school_entry: studentData.targetSchoolEntry,
      country: studentData.country || 'US',
      created_by: userId,
    })
    .select()
    .single();

  if (studentErr) throw studentErr;

  // Link student to user
  const { error: accessErr } = await supabase
    .from('student_access')
    .insert({ student_id: student.id, user_id: userId, role: 'parent' });

  if (accessErr) throw accessErr;
  return student;
}

// ─── Milestone Status ─────────────────────────────

export async function fetchMilestoneStatuses(studentId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('student_milestones')
    .select('milestone_id, status, progress, evidence_notes, assessed_at')
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching milestone statuses:', error);
    return [];
  }
  return data || [];
}

export async function upsertMilestoneStatus(studentId, userId, milestoneId, updates) {
  if (!supabase) return;

  const { error } = await supabase
    .from('student_milestones')
    .upsert({
      student_id: studentId,
      milestone_id: milestoneId,
      status: updates.status,
      progress: updates.progress,
      evidence_notes: updates.evidenceNotes || null,
      assessed_by: userId,
      assessed_at: new Date().toISOString(),
    }, {
      onConflict: 'student_id,milestone_id',
    });

  if (error) console.error('Error upserting milestone:', error);
}

export async function bulkUpsertMilestoneStatuses(studentId, userId, statuses) {
  if (!supabase || statuses.length === 0) return;

  const rows = statuses.map(s => ({
    student_id: studentId,
    milestone_id: s.milestoneId,
    status: s.status,
    progress: s.progress,
    evidence_notes: s.evidenceNotes || null,
    assessed_by: userId,
    assessed_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('student_milestones')
    .upsert(rows, { onConflict: 'student_id,milestone_id' });

  if (error) console.error('Error bulk upserting milestones:', error);
}

// ─── Domain Scores ────────────────────────────────

export async function fetchLatestDomainScores(studentId) {
  if (!supabase) return [];

  // Get the most recent score for each domain
  const { data, error } = await supabase
    .from('domain_scores')
    .select('domain_id, score_vs_age, score_vs_5yr, assessed_at')
    .eq('student_id', studentId)
    .order('assessed_at', { ascending: false });

  if (error) {
    console.error('Error fetching domain scores:', error);
    return [];
  }

  // Deduplicate: keep only latest per domain
  const seen = new Set();
  return (data || []).filter(d => {
    if (seen.has(d.domain_id)) return false;
    seen.add(d.domain_id);
    return true;
  });
}

export async function saveDomainScore(studentId, domainId, scoreVsAge, scoreVs5yr) {
  if (!supabase) return;

  const { error } = await supabase
    .from('domain_scores')
    .insert({
      student_id: studentId,
      domain_id: domainId,
      score_vs_age: scoreVsAge,
      score_vs_5yr: scoreVs5yr,
      assessed_at: new Date().toISOString().split('T')[0],
    });

  if (error) console.error('Error saving domain score:', error);
}

export async function bulkInsertDomainScores(studentId, scoresMap) {
  if (!supabase) return;

  const today = new Date().toISOString().split('T')[0];
  const rows = Object.entries(scoresMap).map(([domainId, scores]) => ({
    student_id: studentId,
    domain_id: domainId,
    score_vs_age: scores.childScore,
    score_vs_5yr: scores.comparison5yr.us,
    assessed_at: today,
    notes: 'Initial seed data',
  }));

  const { error } = await supabase
    .from('domain_scores')
    .insert(rows);

  if (error) console.error('Error seeding domain scores:', error);
}

// ─── Documents ────────────────────────────────────

export async function fetchDocuments(studentId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('student_id', studentId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  return data || [];
}

export async function uploadFileToStorage(studentId, file) {
  if (!supabase) return null;

  const ext = file.name.split('.').pop();
  const filePath = `${studentId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  return filePath;
}

export async function getFileUrl(filePath) {
  if (!supabase || !filePath) return null;

  const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
  return data?.publicUrl || null;
}

export async function saveDocument(studentId, userId, doc) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('documents')
    .insert({
      student_id: studentId,
      file_name: doc.fileName,
      file_type: doc.fileType,
      file_path: doc.filePath || null,
      source: doc.source,
      uploaded_by: userId,
      ai_extracted: doc.aiExtracted || false,
      ai_insights: doc.aiInsights || null,
      linked_milestones: doc.linkedMilestones || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving document:', error);
    return null;
  }
  return data;
}

export async function updateDocument(docId, updates) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('documents')
    .update({
      ...(updates.aiExtracted !== undefined && { ai_extracted: updates.aiExtracted }),
      ...(updates.aiInsights !== undefined && { ai_insights: updates.aiInsights }),
      ...(updates.linkedMilestones !== undefined && { linked_milestones: updates.linkedMilestones }),
      ...(updates.piiDetected !== undefined && { pii_detected: updates.piiDetected }),
    })
    .eq('id', docId)
    .select()
    .single();

  if (error) {
    console.error('Error updating document:', error);
    return null;
  }
  return data;
}

export async function deleteDocument(docId) {
  if (!supabase) return;

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId);

  if (error) console.error('Error deleting document:', error);
}

export async function deleteAllDocuments(studentId) {
  if (!supabase) return;

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('student_id', studentId);

  if (error) console.error('Error deleting all documents:', error);
}

// ─── Assessments ──────────────────────────────────

export async function saveAssessment(studentId, userId, assessment) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      student_id: studentId,
      type: assessment.type || 'micro',
      domain_id: assessment.domainId,
      questions: assessment.questions,
      score: assessment.score,
      administered_by: userId,
      notes: assessment.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving assessment:', error);
    return null;
  }
  return data;
}

// ─── Worksheets ───────────────────────────────────

export async function saveWorksheet(studentId, worksheet) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('worksheets')
    .insert({
      student_id: studentId,
      title: worksheet.title,
      domain_id: worksheet.domainId,
      content: worksheet,
      target_milestones: worksheet.targetMilestones || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving worksheet:', error);
    return null;
  }
  return data;
}

// ─── Weekly Recaps ────────────────────────────────

export async function fetchWeeklyRecaps(studentId, limit = 10) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('weekly_recaps')
    .select('*')
    .eq('student_id', studentId)
    .order('week_start', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recaps:', error);
    return [];
  }
  return data || [];
}

export async function saveWeeklyRecap(studentId, recap) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('weekly_recaps')
    .insert({
      student_id: studentId,
      week_start: recap.weekStart,
      week_end: recap.weekEnd,
      milestones_progressed: recap.milestonesProgressed || [],
      milestones_completed: recap.milestonesCompleted || [],
      milestones_stuck: recap.milestonesStuck || [],
      domain_trends: recap.domainTrends || {},
      ai_summary: recap.aiSummary,
      next_week_plan: recap.nextWeekPlan || {},
      parent_notes: recap.parentNotes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving recap:', error);
    return null;
  }
  return data;
}

// ─── Flashcard Sessions ──────────────────────────

export async function saveFlashcardSession(studentId, userId, session) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('flashcard_sessions')
    .insert({
      student_id: studentId,
      administered_by: userId || null,
      deck_id: session.deckId,
      results: session.results,
      correct_count: session.correctCount,
      total_count: session.totalCount,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving flashcard session:', error);
    return null;
  }
  return data;
}

export async function fetchFlashcardSessions(studentId, deckId, limit = 20) {
  if (!supabase) return [];

  let query = supabase
    .from('flashcard_sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (deckId) {
    query = query.eq('deck_id', deckId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching flashcard sessions:', error);
    return [];
  }
  return data || [];
}
