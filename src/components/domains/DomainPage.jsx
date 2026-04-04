import { useState } from 'react';
import { useStudent } from '../../hooks/useStudent';
import { useMilestones } from '../../hooks/useMilestones';
import { DOMAIN_MAP } from '../../data/domains';
import PercentileChart from './PercentileChart';
import MilestoneTree from './MilestoneTree';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'mastered', label: 'Mastered', color: '#22c55e' },
  { value: 'proficient', label: 'Proficient', color: '#0ea5e9' },
  { value: 'in-progress', label: 'In Progress', color: '#f97316' },
  { value: 'not-started', label: 'Not Started', color: '#5e8a9e' },
];

export default function DomainPage({ domainId }) {
  const domain = DOMAIN_MAP[domainId];
  const { domainScores } = useStudent();
  const { milestones, prerequisites, completionPct, updateMilestone } = useMilestones(domainId);
  const scores = domainScores[domainId];
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  if (!domain) return <p className="text-text-muted">Domain not found.</p>;

  const filteredMilestones = milestones.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '4px' }}>
      {/* Domain Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl">{domain.icon}</span>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-text-primary text-xl md:text-2xl">
              {domain.name}
            </h2>
            <p className="text-text-muted" style={{ fontSize: '15px' }}>
              {milestones.length} milestones &middot; {completionPct}% overall
            </p>
          </div>
        </div>

        {/* Score badges */}
        <div className="flex gap-3 flex-wrap">
          <Badge label="vs own age" value={`${scores.childScore}%`} color={domain.color} />
          <Badge label="vs age 5 (US)" value={`${scores.comparison5yr.us}%`} color={domain.color} />
          <Badge label="vs age 5 (NZ)" value={`${scores.comparison5yr.nz}%`} color="#0ea5e9" />
          <Badge label="vs age 5 (UK)" value={`${scores.comparison5yr.uk}%`} color="#8b5cf6" />
        </div>
      </div>

      {/* Two-column layout on desktop: chart + tree */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '14px' }}>
        {/* Percentile Chart */}
        <PercentileChart domainId={domainId} color={domain.color} />

        {/* Milestone Tree */}
        <MilestoneTree
          key={domainId}
          milestones={milestones}
          prerequisites={prerequisites}
          completionPct={completionPct}
          onUpdate={updateMilestone}
          domainColor={domain.color}
        />
      </div>

      {/* Milestone list with search and filter */}
      <div className="bg-bg-card border border-border rounded-xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-text-primary font-semibold" style={{ fontSize: '18px' }}>All Milestones</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-literacy transition-colors w-full sm:w-48"
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md border transition-colors ${
                filter === f.value
                  ? 'border-text-dim text-text-primary bg-bg-hover'
                  : 'border-border text-text-muted hover:text-text-primary'
              }`}
              style={{ fontSize: '14px' }}
            >
              {f.color && <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: f.color }} />}
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1 text-text-dim">
                  {milestones.filter(m => m.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {filteredMilestones.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-bg-hover transition-colors">
              <StatusDot status={m.status} />
              <span className="text-text-muted font-mono shrink-0" style={{ fontSize: '13px', width: '32px' }}>{m.id}</span>
              <div className="flex-1 min-w-0">
                <span className="text-text-primary font-semibold" style={{ fontSize: '18px' }}>{m.name}</span>
                <span className="text-text-secondary ml-2 hidden sm:inline" style={{ fontSize: '16px' }}> — {m.description}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${m.progress}%`,
                      backgroundColor: getStatusColor(m.status),
                    }}
                  />
                </div>
                <span className="text-text-muted w-10 text-right" style={{ fontSize: '14px' }}>{m.progress}%</span>
              </div>
            </div>
          ))}
          {filteredMilestones.length === 0 && (
            <p className="text-text-muted text-center py-4" style={{ fontSize: '16px' }}>No milestones match your filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ label, value, color }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-lg border border-border">
      <span className="font-[family-name:var(--font-display)] text-text-primary" style={{ fontSize: '20px' }}>{value}</span>
      <span className="text-text-muted" style={{ fontSize: '11px' }}>{label}</span>
    </div>
  );
}

function StatusDot({ status }) {
  const color = getStatusColor(status);
  return <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />;
}

function getStatusColor(status) {
  const map = {
    'mastered': '#22c55e',
    'proficient': '#0ea5e9',
    'in-progress': '#f97316',
    'emerging': '#ea580c',
    'not-started': '#5e8a9e',
  };
  return map[status] || map['not-started'];
}
