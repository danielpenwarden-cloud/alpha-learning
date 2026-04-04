import { SCHEDULE_BLOCKS, RESEARCH_CITATIONS } from '../../data/schedule';

const ENERGY_LABELS = {
  peak: { label: 'Peak', color: '#22c55e', bg: 'bg-green-50' },
  high: { label: 'High', color: '#84cc16', bg: 'bg-lime-50' },
  moderate: { label: 'Moderate', color: '#f59e0b', bg: 'bg-orange-50' },
  rising: { label: 'Rising', color: '#60a5fa', bg: 'bg-blue-50' },
  recovering: { label: 'Recovering', color: '#60a5fa', bg: 'bg-blue-50' },
  declining: { label: 'Declining', color: '#f97316', bg: 'bg-orange-50' },
  low: { label: 'Low', color: '#ef4444', bg: 'bg-red-50' },
};

const TYPE_ICONS = {
  learning: '\u{1F4DA}',
  play: '\u{1F3B2}',
  routine: '\u{1F504}',
  break: '\u{1F9C3}',
  rest: '\u{1F634}',
  school: '\u{1F3EB}',
};

export default function LearningSchedule() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl">
          Learning Schedule
        </h2>
        <p className="text-text-secondary text-sm mt-1 mb-4">
          Science-based daily schedule optimized for 4-5 year old cognitive rhythms.
          Based on the Alpha School 2-hour mastery model.
        </p>
      </div>

      {/* Energy curve summary */}
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <h3 className="text-text-primary text-sm font-semibold mb-3">Cognitive Energy Curve</h3>
        <div className="flex items-end gap-0.5 h-16">
          {SCHEDULE_BLOCKS.map((block, i) => {
            const energyMap = { peak: 100, high: 85, moderate: 60, rising: 50, recovering: 45, declining: 35, low: 20 };
            const height = energyMap[block.energy] || 30;
            const energy = ENERGY_LABELS[block.energy];
            return (
              <div
                key={i}
                className="flex-1 rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${height}%`,
                  backgroundColor: energy?.color || '#94a3b8',
                  opacity: 0.5,
                }}
                title={`${block.time}: ${block.label} (${block.energy})`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-text-dim">
          <span>7:00</span><span>10:00</span><span>13:00</span><span>16:00</span><span>19:00</span>
        </div>
      </div>

      {/* Schedule blocks */}
      <div className="space-y-2">
        {SCHEDULE_BLOCKS.map((block, i) => {
          const energy = ENERGY_LABELS[block.energy];
          const isLearning = block.type === 'learning';

          return (
            <div
              key={i}
              className={`bg-bg-card border rounded-xl p-4 transition-colors ${
                isLearning ? 'border-l-4' : 'border border-border'
              }`}
              style={isLearning ? { borderLeftColor: block.color } : {}}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 text-center">
                  <span className="text-lg">{TYPE_ICONS[block.type] || '\u{1F4C5}'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-text-primary text-sm font-semibold">{block.label}</span>
                    {block.domain && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded border"
                        style={{ color: block.color, borderColor: block.color + '40' }}
                      >
                        {block.domain}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-text-muted text-xs">{block.time}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: energy?.color, backgroundColor: energy?.color + '15' }}>
                      {energy?.label}
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs mt-1.5">{block.description}</p>

                  {block.warning && (
                    <p className="text-red-700 text-xs mt-1.5 flex items-start gap-1">
                      <span>{'\u26A0\uFE0F'}</span> {block.warning}
                    </p>
                  )}

                  {block.activities && (
                    <ul className="mt-2 space-y-1">
                      {block.activities.map((act, j) => (
                        <li key={j} className="text-text-muted text-xs flex items-start gap-1.5">
                          <span className="text-text-dim mt-0.5">&bull;</span>
                          {act}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Research citations */}
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <h3 className="text-text-primary text-sm font-semibold mb-3">
          Research Citations
        </h3>
        <div className="space-y-3">
          {RESEARCH_CITATIONS.map((cite, i) => (
            <div key={i} className="border-l-2 border-accent pl-3">
              <p className="text-text-primary text-xs font-medium">{cite.title}</p>
              <p className="text-text-dim text-[10px]">{cite.source}</p>
              <p className="text-text-secondary text-xs mt-0.5">{cite.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
