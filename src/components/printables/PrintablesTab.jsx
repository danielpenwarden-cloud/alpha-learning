import { useState } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { useAuth } from '../../hooks/useAuth';
import { MILESTONES } from '../../data/milestones';
import { DOMAINS } from '../../data/domains';
import { generateWorksheet } from '../../lib/ai';
import { DEMO_WORKSHEETS } from '../../data/demoContent';
import WorksheetPDF from './WorksheetPDF';

export default function PrintablesTab() {
  const { student, age, milestoneStatus } = useStudent();
  const { isDemo, exitDemo } = useAuth();
  const [selectedDomain, setSelectedDomain] = useState('literacy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [worksheet, setWorksheet] = useState(null);
  const [history, setHistory] = useState(() => {
    // Pre-load demo worksheets into history for demo users
    if (isDemo) {
      return Object.values(DEMO_WORKSHEETS).map(ws => ({
        ...ws,
        date: new Date().toLocaleDateString(),
      }));
    }
    return [];
  });
  const [showPDF, setShowPDF] = useState(false);

  async function generate() {
    if (isDemo) return; // Blocked in demo
    setLoading(true);
    setError('');
    try {
      const domainMilestones = MILESTONES.filter(m => m.domainId === selectedDomain);
      const summary = domainMilestones.map(m => {
        const s = milestoneStatus[m.id] || { status: 'not-started', progress: 0 };
        return `${m.name}: ${s.status} (${s.progress}%)`;
      }).join(', ');

      const inProgress = domainMilestones
        .filter(m => {
          const s = milestoneStatus[m.id];
          return s && (s.status === 'in-progress' || s.status === 'emerging');
        })
        .map(m => m.name)
        .join(', ') || 'beginning level skills';

      const result = await generateWorksheet(age, selectedDomain, summary, inProgress, student?.firstName || 'Child');
      setWorksheet(result);
      setHistory(prev => [{ ...result, domain: selectedDomain, date: new Date().toLocaleDateString() }, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const domain = DOMAINS.find(d => d.id === selectedDomain);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl">
          Printable Worksheets
        </h2>
        <p className="text-text-secondary text-sm mt-1 mb-4">
          {isDemo
            ? 'Browse sample worksheets below. Sign up to generate personalized worksheets for your child.'
            : `AI-generated worksheets personalized to ${student.firstName}'s current level. A4, black & white, printer-friendly.`}
        </p>
      </div>

      {/* Generator controls */}
      <div className="bg-bg-card border border-border rounded-xl p-4 md:p-6">
        <h3 className="text-text-primary text-sm md:text-lg font-semibold mb-3 md:mb-4">
          {isDemo ? 'Sample Worksheets' : 'Generate New Worksheet'}
        </h3>
        <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
          {DOMAINS.map(d => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDomain(d.id);
                if (isDemo && DEMO_WORKSHEETS[d.id]) {
                  setWorksheet(DEMO_WORKSHEETS[d.id]);
                }
              }}
              className={`text-xs md:text-sm px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg border transition-colors ${
                selectedDomain === d.id
                  ? 'text-white'
                  : 'border-border text-text-dim hover:text-text-muted'
              }`}
              style={selectedDomain === d.id ? { backgroundColor: d.color, borderColor: d.color } : {}}
            >
              {d.icon} {d.name}
            </button>
          ))}
        </div>
        {isDemo ? (
          <button
            onClick={exitDemo}
            className="px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
          >
            Sign up to generate custom worksheets
          </button>
        ) : (
          <button
            onClick={generate}
            disabled={loading}
            className="px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
          >
            {loading ? 'Generating...' : 'Generate Worksheet'}
          </button>
        )}
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
          <p className="text-text-secondary text-sm">Creating a personalized {domain?.name} worksheet...</p>
        </div>
      )}

      {/* Current worksheet preview */}
      {worksheet && !loading && (
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary text-sm font-semibold">{worksheet.title}</h3>
            <button
              onClick={() => setShowPDF(true)}
              className="text-xs px-3 py-1.5 rounded-lg border border-literacy text-literacy hover:bg-literacy/10 transition-colors"
            >
              {'\u{1F5A8}\uFE0F'} Print / Download PDF
            </button>
          </div>
          <p className="text-text-muted text-xs mb-4 italic">{worksheet.instructions}</p>

          <div className="space-y-3">
            {worksheet.activities?.map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-bg-hover rounded-lg">
                <span className="text-text-dim text-xs font-mono w-5 shrink-0">{i + 1}.</span>
                <div>
                  <span className="text-[10px] uppercase text-text-dim font-semibold tracking-wide">{act.type}</span>
                  <p className="text-text-primary text-sm mt-0.5">{act.prompt}</p>
                  {act.content && (
                    <p className="text-text-secondary text-lg font-mono mt-1 tracking-widest">{act.content}</p>
                  )}
                  {act.hint && (
                    <p className="text-text-dim text-xs mt-1 italic">{act.hint}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo: auto-show literacy worksheet */}
      {isDemo && !worksheet && (
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-text-dim text-sm text-center">Select a domain above to preview a sample worksheet.</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <h3 className="text-text-primary text-sm font-semibold mb-3">
            {isDemo ? 'Sample Worksheets' : 'Recent Worksheets'}
          </h3>
          <div className="space-y-2">
            {history.map((ws, i) => {
              const d = DOMAINS.find(dom => dom.id === ws.domain);
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{d?.icon}</span>
                    <span className="text-text-primary text-sm">{ws.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-dim text-xs">{ws.date}</span>
                    <button
                      onClick={() => { setWorksheet(ws); setSelectedDomain(ws.domain); }}
                      className="text-literacy text-xs hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPDF && worksheet && (
        <WorksheetPDF worksheet={worksheet} onClose={() => setShowPDF(false)} />
      )}
    </div>
  );
}
