import { useState } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { useAuth } from '../../hooks/useAuth';
import { MILESTONES } from '../../data/milestones';
import { generateInsights, buildStudentContext } from '../../lib/ai';
import { DOMAIN_MAP } from '../../data/domains';
import { DEMO_INSIGHTS } from '../../data/demoContent';

const BADGE_STYLES = {
  strength: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '\u{1F4AA}' },
  focus: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '\u{1F3AF}' },
  crossDomain: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', icon: '\u{1F517}' },
  plateau: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '\u26A0\uFE0F' },
  nextStep: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: '\u{1F680}' },
};

export default function AIInsights() {
  const { student, age, milestoneStatus, domainScores } = useStudent();
  const { isDemo } = useAuth();
  const [insights, setInsights] = useState(isDemo ? DEMO_INSIGHTS : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (isDemo) {
      setInsights(DEMO_INSIGHTS);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ctx = buildStudentContext(student, age, milestoneStatus, domainScores, MILESTONES);
      const result = await generateInsights(ctx);
      setInsights(result);
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
            AI Insights
          </h2>
          <p className="text-text-secondary text-sm mt-1 mb-4">
            Auto-generated analysis of {student.firstName}'s learning progress, strengths, and next steps.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
        >
          {loading ? 'Analyzing...' : insights ? 'Refresh Insights' : 'Generate Insights'}
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
          <p className="text-text-secondary text-sm">Analyzing all milestone data, scores, and trends...</p>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-4">
          {/* Strengths */}
          {insights.strengths?.length > 0 && (
            <InsightSection title="Strengths" type="strength" items={insights.strengths} />
          )}

          {/* Next Best Step */}
          {insights.nextBestStep?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2">
                {BADGE_STYLES.nextStep.icon} Next Best Step (per domain)
              </h3>
              {insights.nextBestStep.map((item, i) => {
                const domain = DOMAIN_MAP[item.domain];
                return (
                  <div key={i} className={`${BADGE_STYLES.nextStep.bg} border ${BADGE_STYLES.nextStep.border} rounded-xl p-4 border-l-4`}
                    style={{ borderLeftColor: domain?.color }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{domain?.icon}</span>
                      <span className="text-text-primary text-sm font-medium">{item.title}</span>
                      {item.milestoneId && (
                        <span className="text-text-dim text-[10px] font-mono">{item.milestoneId}</span>
                      )}
                    </div>
                    <p className="text-text-secondary text-xs">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Focus Areas */}
          {insights.focusAreas?.length > 0 && (
            <InsightSection title="Focus Areas" type="focus" items={insights.focusAreas} />
          )}

          {/* Plateau Alerts */}
          {insights.plateauAlerts?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2">
                {BADGE_STYLES.plateau.icon} Plateau Alerts
              </h3>
              {insights.plateauAlerts.map((item, i) => (
                <div key={i} className={`${BADGE_STYLES.plateau.bg} border ${BADGE_STYLES.plateau.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-text-primary text-sm font-medium">{item.title}</span>
                    {item.milestoneId && (
                      <span className="text-text-dim text-[10px] font-mono">{item.milestoneId}</span>
                    )}
                  </div>
                  <p className="text-text-secondary text-xs">{item.detail}</p>
                  {item.suggestion && (
                    <p className="text-orange-600 text-xs mt-1.5 flex items-start gap-1">
                      <span>{'\u{1F4A1}'}</span> {item.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Cross-Domain Connections */}
          {insights.crossDomain?.length > 0 && (
            <InsightSection title="Cross-Domain Connections" type="crossDomain" items={insights.crossDomain} />
          )}

          {/* Benchmark Note */}
          {insights.benchmarkNote && (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-text-primary text-sm font-semibold mb-1">
                {'\u{1F1F3}\u{1F1FF}'} vs {'\u{1F1FA}\u{1F1F8}'} Benchmark Comparison
              </h3>
              <p className="text-text-secondary text-sm">{insights.benchmarkNote}</p>
            </div>
          )}
        </div>
      )}

      {!insights && !loading && (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-dim text-sm">Click "Generate Insights" to get AI-powered analysis of {student.firstName}'s progress.</p>
        </div>
      )}
    </div>
  );
}

function InsightSection({ title, type, items }) {
  const style = BADGE_STYLES[type];
  return (
    <div className="space-y-2">
      <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2">
        {style.icon} {title}
      </h3>
      {items.map((item, i) => (
        <div key={i} className={`${style.bg} border ${style.border} rounded-xl p-4`}>
          <span className="text-text-primary text-sm font-medium">{item.title}</span>
          {item.milestoneId && (
            <span className="text-text-dim text-[10px] font-mono ml-2">{item.milestoneId}</span>
          )}
          <p className="text-text-secondary text-xs mt-1">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}
