import { useState, useEffect } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { MILESTONES } from '../../data/milestones';
import { generateInsights, buildStudentContext } from '../../lib/ai';
import { showLocalNotification, getNotificationPermission, scheduleSundayRecapCheck } from '../../lib/notifications';

export default function SundayRecap() {
  const { student, age, milestoneStatus, domainScores, domainStats } = useStudent();
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSunday = new Date().getDay() === 0;

  // Schedule Sunday recap notification
  useEffect(() => {
    const cleanup = scheduleSundayRecapCheck(async () => {
      if (getNotificationPermission() === 'granted') {
        const mastered = domainStats.reduce((s, d) => s + d.mastered, 0);
        const total = domainStats.reduce((s, d) => s + d.total, 0);

        showLocalNotification(
          `${student.firstName}'s Weekly Recap Ready!`,
          `${mastered}/${total} milestones mastered. Tap to view this week's summary and next week's plan.`,
          { tag: 'sunday-recap', data: { url: '/' } }
        );
      }
    });
    return cleanup;
  }, [student.firstName, domainStats]);

  async function generateRecap() {
    setLoading(true);
    setError('');
    try {
      const ctx = buildStudentContext(student, age, milestoneStatus, domainScores, MILESTONES);
      const result = await generateInsights(ctx);
      setRecap(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Stats for the recap card
  const mastered = domainStats.reduce((s, d) => s + d.mastered, 0);
  const proficient = domainStats.reduce((s, d) => s + d.proficient, 0);
  const inProgress = domainStats.reduce((s, d) => s + d.inProgress, 0);
  const total = domainStats.reduce((s, d) => s + d.total, 0);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 md:p-6 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-text-primary text-sm md:text-base font-semibold flex items-center gap-2 min-w-0">
          {isSunday ? '\u{1F31F}' : '\u{1F4CA}'} {isSunday ? 'Sunday Recap' : 'Weekly Summary'}
        </h3>
        <button
          onClick={generateRecap}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg text-white font-medium disabled:opacity-50 shrink-0 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
        >
          {loading ? 'Generating...' : recap ? 'Refresh' : 'Generate Recap'}
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <span className="font-[family-name:var(--font-display)] text-green-600 text-lg">{mastered}</span>
          <p className="text-text-dim text-[10px]">Mastered</p>
        </div>
        <div className="text-center">
          <span className="font-[family-name:var(--font-display)] text-sky-600 text-lg">{proficient}</span>
          <p className="text-text-dim text-[10px]">Proficient</p>
        </div>
        <div className="text-center">
          <span className="font-[family-name:var(--font-display)] text-orange-600 text-lg">{inProgress}</span>
          <p className="text-text-dim text-[10px]">In Progress</p>
        </div>
        <div className="text-center">
          <span className="font-[family-name:var(--font-display)] text-text-dim text-lg">{total - mastered - proficient - inProgress}</span>
          <p className="text-text-dim text-[10px]">Not Started</p>
        </div>
      </div>

      {/* Completion bar */}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden flex">
        <div className="h-full bg-green-500" style={{ width: `${(mastered / total) * 100}%` }} />
        <div className="h-full bg-sky-500" style={{ width: `${(proficient / total) * 100}%` }} />
        <div className="h-full bg-orange-500" style={{ width: `${(inProgress / total) * 100}%` }} />
      </div>
      <p className="text-text-dim text-[10px] mt-1.5 text-right pr-1">
        {Math.round(((mastered + proficient) / total) * 100)}% on track
      </p>

      {error && (
        <p className="text-red-600 text-xs mt-2">{error}</p>
      )}

      {recap && !loading && (
        <div className="mt-3 space-y-2">
          {recap.strengths?.slice(0, 2).map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-green-600 shrink-0">{'\u{1F4AA}'}</span>
              <span className="text-text-secondary">{s.title}: {s.detail}</span>
            </div>
          ))}
          {recap.nextBestStep?.slice(0, 2).map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-purple-600 shrink-0">{'\u{1F680}'}</span>
              <span className="text-text-secondary">{s.title}: {s.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
