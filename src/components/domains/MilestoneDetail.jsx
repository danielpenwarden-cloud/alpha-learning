import { useToast } from '../shared/Toast';

const STATUS_COLORS = {
  'mastered': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  'proficient': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
  'in-progress': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  'emerging': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  'not-started': { bg: 'bg-gray-50', text: 'text-text-dim', border: 'border-border' },
};

const STATUS_OPTIONS = ['not-started', 'emerging', 'in-progress', 'proficient', 'mastered'];

export default function MilestoneDetail({ milestone, onClose, onUpdate }) {
  const { addToast } = useToast();
  if (!milestone) return null;

  function handleUpdate(id, updates) {
    const prevStatus = milestone.status;
    onUpdate(id, updates);

    // Show toast on status upgrade
    if (updates.status && updates.status !== prevStatus) {
      if (updates.status === 'mastered') {
        addToast(`${milestone.name} marked as mastered!`, { type: 'success' });
      } else if (updates.status === 'proficient') {
        addToast(`${milestone.name} marked as proficient!`, { type: 'success' });
      }
    }
  }

  const colors = STATUS_COLORS[milestone.status] || STATUS_COLORS['not-started'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-md bg-bg-card border-l border-border h-full overflow-y-auto p-5 animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-text-dim text-xs font-mono">{milestone.id}</span>
            <h3 className="text-text-primary text-lg font-semibold mt-1">{milestone.name}</h3>
            <p className="text-text-secondary text-sm mt-0.5">{milestone.description}</p>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text-secondary text-xl leading-none p-1">
            &times;
          </button>
        </div>

        {/* Status badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border} mb-4`}>
          <span className={`text-xs font-medium capitalize ${colors.text}`}>
            {milestone.status.replace('-', ' ')}
          </span>
          <span className={`text-xs ${colors.text}`}>{milestone.progress}%</span>
        </div>

        {/* Progress slider */}
        <div className="mb-5">
          <label className="text-text-muted text-xs block mb-1.5">Progress</label>
          <input
            type="range"
            min="0"
            max="100"
            value={milestone.progress}
            onChange={e => {
              const progress = parseInt(e.target.value);
              let status = 'not-started';
              if (progress >= 90) status = 'mastered';
              else if (progress >= 75) status = 'proficient';
              else if (progress >= 25) status = 'in-progress';
              else if (progress > 0) status = 'emerging';
              handleUpdate(milestone.id, { progress, status });
            }}
            className="w-full accent-literacy"
          />
          <div className="flex justify-between text-text-dim text-[10px] mt-0.5">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        {/* Status selector */}
        <div className="mb-5">
          <label className="text-text-muted text-xs block mb-1.5">Status</label>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleUpdate(milestone.id, { status: s })}
                className={`text-[11px] px-2.5 py-1 rounded-md border capitalize transition-colors ${
                  milestone.status === s
                    ? `${STATUS_COLORS[s].bg} ${STATUS_COLORS[s].border} ${STATUS_COLORS[s].text}`
                    : 'border-border text-text-dim hover:text-text-muted'
                }`}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Detail sections */}
        {milestone.detail && (
          <Section title="Detail" content={milestone.detail} />
        )}
        {milestone.howToAssess && (
          <Section title="How to Assess" content={milestone.howToAssess} />
        )}
        {milestone.howToTeach && (
          <Section title="How to Teach" content={milestone.howToTeach} />
        )}
        {milestone.age5Target && (
          <Section title="Age 5 Target" content={milestone.age5Target} />
        )}
        {milestone.evidenceNotes && (
          <Section title="Evidence Notes" content={milestone.evidenceNotes} />
        )}
      </div>
    </div>
  );
}

function Section({ title, content }) {
  return (
    <div className="mb-4">
      <h4 className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-1">{title}</h4>
      <p className="text-text-secondary text-sm leading-relaxed">{content}</p>
    </div>
  );
}
