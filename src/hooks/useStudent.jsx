import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import {
  ensureProfileExists,
  fetchStudentsForUser,
  createStudentForUser,
  fetchMilestoneStatuses,
  upsertMilestoneStatus,
  bulkUpsertMilestoneStatuses,
  bulkInsertDomainScores,
  fetchLatestDomainScores,
  deleteStudent as dbDeleteStudent,
  updateStudent as dbUpdateStudent,
} from '../lib/db';
import { MILESTONES, INITIAL_STATUS, PREREQUISITES } from '../data/milestones';
import { CHILD_SCORES } from '../data/benchmarks';
import { DOMAINS } from '../data/domains';

const StudentContext = createContext(null);

const DEFAULT_STUDENT = {
  id: 'default',
  firstName: 'Lani',
  dateOfBirth: '2021-06-15',
  schoolName: 'Lovell School, Pattaya',
  notes: '4-6yr classroom since Sep 2025. 1 year of schooling. Uses Reading Eggs app.',
  targetSchoolEntry: 'NZ mid-2026',
  country: 'US',
};

const DEMO_STUDENT = {
  id: 'demo-child',
  firstName: 'Demo Child',
  dateOfBirth: '2021-06-15',
  schoolName: 'Demo School',
  notes: 'Demo account',
  targetSchoolEntry: 'NZ mid-2026',
  country: 'US',
};

const EMPTY_STATUS_MAP = Object.fromEntries(
  MILESTONES.map(m => [m.id, { milestoneId: m.id, status: 'not-started', progress: 0, evidenceNotes: '' }])
);

const EMPTY_SCORES = Object.fromEntries(
  DOMAINS.map(d => [d.id, { childScore: 0, comparison5yr: { us: 0, nz: 0, au: 0, uk: 0 } }])
);

function mapDbStudent(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    dateOfBirth: row.date_of_birth,
    schoolName: row.school_name || '',
    notes: row.notes || '',
    targetSchoolEntry: row.target_school_entry || '',
    country: row.country || 'US',
  };
}

function buildInitialStatusMap() {
  const map = {};
  INITIAL_STATUS.forEach(s => { map[s.milestoneId] = s; });
  return map;
}

export function calcAge(dob) {
  const now = new Date();
  const d = new Date(dob);
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  if (months < 0) { years--; months += 12; }
  return { years, months, totalMonths: years * 12 + months };
}

export function StudentProvider({ children }) {
  const { user, isDemo } = useAuth();
  const [students, setStudents] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [milestoneStatus, setMilestoneStatus] = useState(buildInitialStatusMap);
  const [domainScores, setDomainScores] = useState(CHILD_SCORES);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(!!supabase);
  const prevActiveIdRef = useRef(null);

  // Derived state
  const student = students.find(s => s.id === activeStudentId) || students[0] || DEFAULT_STUDENT;
  const hasStudents = students.length > 0;
  const age = calcAge(student.dateOfBirth);

  // Effect 1: Load student list
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Demo mode
    if (isDemo) {
      setStudents([DEMO_STUDENT]);
      setActiveStudentId(DEMO_STUDENT.id);
      setMilestoneStatus(buildInitialStatusMap());
      setDomainScores(CHILD_SCORES);
      setLoading(false);
      return;
    }

    // Offline mode
    if (!supabase || user.id === 'offline') {
      setStudents([DEFAULT_STUDENT]);
      setActiveStudentId(DEFAULT_STUDENT.id);
      setMilestoneStatus(buildInitialStatusMap());
      setDomainScores(CHILD_SCORES);
      setLoading(false);
      return;
    }

    // Supabase mode
    let cancelled = false;

    async function loadStudents() {
      try {
        const displayName = user.user_metadata?.display_name || user.email;
        await ensureProfileExists(user.id, displayName);

        const dbStudents = await fetchStudentsForUser(user.id);

        if (cancelled) return;

        if (dbStudents.length > 0) {
          const mapped = dbStudents.map(mapDbStudent);
          setStudents(mapped);
          setActiveStudentId(mapped[0].id);
          setIsOnline(true);
        } else {
          // No students — new user, onboarding will handle creation
          setStudents([]);
          setActiveStudentId(null);
          setIsOnline(true);
        }
      } catch (err) {
        console.error('Error loading students:', err);
        setIsOnline(false);
        // Fall back to offline with default
        setStudents([DEFAULT_STUDENT]);
        setActiveStudentId(DEFAULT_STUDENT.id);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStudents();
    return () => { cancelled = true; };
  }, [user, isDemo]);

  // Effect 2: Load active student data when activeStudentId changes
  useEffect(() => {
    if (!activeStudentId) return;
    if (isDemo || !supabase || !user || user.id === 'offline' || user.id === 'demo') return;
    // Don't reload if the ID hasn't actually changed
    if (prevActiveIdRef.current === activeStudentId) return;
    prevActiveIdRef.current = activeStudentId;

    // For default/demo student, use local data
    if (activeStudentId === 'default' || activeStudentId === 'demo-child') return;

    let cancelled = false;

    async function loadStudentData() {
      try {
        // Load milestone statuses
        const statuses = await fetchMilestoneStatuses(activeStudentId);
        if (!cancelled && statuses.length > 0) {
          const statusMap = {};
          statuses.forEach(s => {
            statusMap[s.milestone_id] = {
              milestoneId: s.milestone_id,
              status: s.status,
              progress: s.progress,
              evidenceNotes: s.evidence_notes || '',
            };
          });
          setMilestoneStatus(statusMap);
        } else if (!cancelled && statuses.length === 0) {
          // New student with no milestones yet
          setMilestoneStatus({ ...EMPTY_STATUS_MAP });
        }

        // Load domain scores
        const scores = await fetchLatestDomainScores(activeStudentId);
        if (!cancelled && scores.length > 0) {
          const scoreMap = { ...CHILD_SCORES };
          scores.forEach(s => {
            if (scoreMap[s.domain_id]) {
              scoreMap[s.domain_id] = {
                ...scoreMap[s.domain_id],
                childScore: s.score_vs_age,
                comparison5yr: {
                  ...scoreMap[s.domain_id].comparison5yr,
                  us: s.score_vs_5yr,
                },
              };
            }
          });
          setDomainScores(scoreMap);
        } else if (!cancelled && scores.length === 0) {
          setDomainScores({ ...EMPTY_SCORES });
        }
      } catch (err) {
        console.error('Error loading student data:', err);
      }
    }

    loadStudentData();
    return () => { cancelled = true; };
  }, [activeStudentId, isDemo, user]);

  // Recalculate domainScores.childScore from milestoneStatus
  useEffect(() => {
    setDomainScores(prev => {
      const next = { ...prev };
      DOMAINS.forEach(domain => {
        const domainMilestones = MILESTONES.filter(m => m.domainId === domain.id);
        if (domainMilestones.length === 0) return;
        const avg = domainMilestones.reduce((sum, m) => {
          const s = milestoneStatus[m.id];
          return sum + (s ? s.progress : 0);
        }, 0) / domainMilestones.length;
        next[domain.id] = { ...next[domain.id], childScore: Math.round(avg) };
      });
      return next;
    });
  }, [milestoneStatus]);

  // Compute domain stats
  const domainStats = DOMAINS.map(domain => {
    const milestones = MILESTONES.filter(m => m.domainId === domain.id);
    const statuses = milestones.map(m => milestoneStatus[m.id] || { status: 'not-started', progress: 0 });
    const mastered = statuses.filter(s => s.status === 'mastered').length;
    const proficient = statuses.filter(s => s.status === 'proficient').length;
    const inProgress = statuses.filter(s => s.status === 'in-progress').length;
    const avgProgress = statuses.reduce((sum, s) => sum + s.progress, 0) / statuses.length;
    const scores = domainScores[domain.id] || { childScore: 0, comparison5yr: { us: 0 } };

    return {
      ...domain,
      total: milestones.length,
      mastered,
      proficient,
      inProgress,
      avgProgress: Math.round(avgProgress),
      childScore: scores.childScore,
      comparison5yr: scores.comparison5yr,
    };
  });

  const updateMilestone = useCallback((milestoneId, updates) => {
    // Demo guard
    if (isDemo) return;

    setMilestoneStatus(prev => ({
      ...prev,
      [milestoneId]: { ...prev[milestoneId], milestoneId, ...updates },
    }));

    // Persist to Supabase (fire-and-forget)
    if (isOnline && student.id !== 'default' && student.id !== 'demo-child' && user && user.id !== 'offline' && user.id !== 'demo') {
      upsertMilestoneStatus(student.id, user.id, milestoneId, {
        status: updates.status || milestoneStatus[milestoneId]?.status || 'not-started',
        progress: updates.progress ?? milestoneStatus[milestoneId]?.progress ?? 0,
        evidenceNotes: updates.evidenceNotes || milestoneStatus[milestoneId]?.evidenceNotes || '',
        ...updates,
      });
    }
  }, [isOnline, student.id, user, milestoneStatus, isDemo]);

  const addStudent = useCallback(async (data) => {
    if (isDemo || !user || user.id === 'demo') return null;

    let newStudent;
    if (supabase && user.id !== 'offline') {
      const dbStudent = await createStudentForUser(user.id, data);
      if (dbStudent) {
        newStudent = mapDbStudent(dbStudent);
      }
    } else {
      // Offline: create local student
      newStudent = { ...data, id: `local-${Date.now()}` };
    }

    if (newStudent) {
      setStudents(prev => [...prev, newStudent]);
      setActiveStudentId(newStudent.id);
      // Reset milestone/score state for new student
      setMilestoneStatus({ ...EMPTY_STATUS_MAP });
      setDomainScores({ ...EMPTY_SCORES });
      prevActiveIdRef.current = newStudent.id;
    }
    return newStudent;
  }, [user, isDemo]);

  const removeStudent = useCallback(async (studentId) => {
    if (isDemo || !user || user.id === 'demo') return;

    try {
      if (supabase && user.id !== 'offline') {
        await dbDeleteStudent(studentId);
      }
      setStudents(prev => {
        const updated = prev.filter(s => s.id !== studentId);
        // If we removed the active student, switch to first remaining
        if (activeStudentId === studentId && updated.length > 0) {
          setActiveStudentId(updated[0].id);
          prevActiveIdRef.current = null; // Force reload
        }
        return updated;
      });
    } catch (err) {
      console.error('Error removing student:', err);
    }
  }, [user, isDemo, activeStudentId]);

  const updateStudentDetails = useCallback(async (studentId, updates) => {
    if (isDemo || !user || user.id === 'demo') return;

    try {
      if (supabase && user.id !== 'offline') {
        await dbUpdateStudent(studentId, updates);
      }
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, ...updates } : s
      ));
    } catch (err) {
      console.error('Error updating student:', err);
    }
  }, [user, isDemo]);

  return (
    <StudentContext.Provider value={{
      student,
      students,
      activeStudentId,
      setActiveStudentId: (id) => {
        prevActiveIdRef.current = null; // Force reload on switch
        setActiveStudentId(id);
      },
      hasStudents,
      age,
      milestoneStatus,
      domainScores,
      domainStats,
      updateMilestone,
      addStudent,
      removeStudent,
      updateStudentDetails,
      loading,
      isOnline,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent must be used within StudentProvider');
  return context;
}
