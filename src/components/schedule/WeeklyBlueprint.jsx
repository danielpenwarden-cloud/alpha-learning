import { useState, useEffect } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { useAuth } from '../../hooks/useAuth';
import { MILESTONES } from '../../data/milestones';
import { DOMAIN_MAP } from '../../data/domains';
import { generateWeeklyPlan, buildStudentContext } from '../../lib/ai';

export default function WeeklyBlueprint() {
  const { student, age, milestoneStatus, domainScores } = useStudent();
  const { isDemo, exitDemo } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (isDemo) return;
    setLoading(true);
    setError('');
    try {
      const ctx = buildStudentContext(student, age, milestoneStatus, domainScores, MILESTONES);
      const result = await generateWeeklyPlan(ctx);
      setPlan(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl">
            Weekly Blueprint
          </h2>
          <p className="text-text-secondary text-sm mt-1 mb-4">
            AI-generated weekly learning plan based on {student.firstName}'s current progress.
          </p>
        </div>
        <button
          onClick={isDemo ? exitDemo : generate}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
        >
          {isDemo ? 'Sign up to generate plans' : loading ? 'Generating...' : plan ? 'Regenerate Plan' : 'Generate This Week\'s Plan'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {loading && (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-8 h-8 rounded-lg mx-auto mb-3 animate-pulse flex items-center justify-center text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            {'\u03B1'}
          </div>
          <p className="text-text-secondary text-sm">Analyzing {student.firstName}'s data and generating personalized plan...</p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-4">
          {/* Week overview */}
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <h3 className="text-text-primary text-sm font-semibold mb-1">This Week's Focus</h3>
            <p className="text-text-secondary text-sm">{plan.weekFocus}</p>
          </div>

          {/* Domain plans */}
          {plan.domains?.map((dp, i) => {
            const domain = DOMAIN_MAP[dp.domain];
            return (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-4 border-l-4"
                style={{ borderLeftColor: domain?.color || '#94a3b8' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{domain?.icon}</span>
                  <h3 className="text-text-primary text-sm font-semibold">{domain?.name || dp.domain}</h3>
                </div>
                <p className="text-text-secondary text-sm mb-3">{dp.focus}</p>

                {/* Targets */}
                {dp.targets?.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Targets</h4>
                    <ul className="space-y-1">
                      {dp.targets.map((t, j) => (
                        <li key={j} className="text-text-secondary text-xs flex items-start gap-1.5">
                          <span className="text-green-600 mt-0.5">{'\u2022'}</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Activities */}
                {dp.activities?.length > 0 && (
                  <div>
                    <h4 className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Activities</h4>
                    <div className="space-y-1.5">
                      {dp.activities.map((act, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs">
                          <span className="text-text-dim shrink-0 w-16">{act.day}</span>
                          <span className="text-text-primary flex-1">{act.activity}</span>
                          <span className="text-text-dim shrink-0">{act.duration}</span>
                          {act.milestoneId && (
                            <span className="text-text-dim font-mono text-[10px] shrink-0">{act.milestoneId}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Tips */}
          {plan.tips?.length > 0 && (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-text-primary text-sm font-semibold mb-2">Tips</h3>
              <ul className="space-y-1.5">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="text-text-secondary text-sm flex items-start gap-2">
                    <span className="text-accent">{'\u{1F4A1}'}</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!plan && !loading && (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-dim text-sm">Click "Generate This Week's Plan" to create a personalized learning plan based on {student.firstName}'s current milestone data.</p>
        </div>
      )}
    </div>
  );
}
