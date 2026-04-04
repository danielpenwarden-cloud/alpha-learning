import { useNavigate } from 'react-router-dom';

export default function StatCard({ domain }) {
  const navigate = useNavigate();
  const path = `/${domain.id}`;

  return (
    <button
      onClick={() => navigate(path)}
      className="bg-bg-card border border-border rounded-xl p-4 md:p-5 text-left hover:border-text-dim transition-colors w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg md:text-xl">{domain.icon}</span>
        <span className="text-text-primary text-sm md:text-base font-medium">{domain.name}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-border rounded-full mb-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${domain.avgProgress}%`, backgroundColor: domain.color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-text-muted text-sm">
          {domain.mastered + domain.proficient}/{domain.total} milestones
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: domain.color }}>
            {domain.childScore}%
          </span>
          <span className="text-text-dim text-[10px]">vs age</span>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="flex gap-2 mt-2">
        {domain.mastered > 0 && (
          <span className="text-sm text-green-600">{domain.mastered} mastered</span>
        )}
        {domain.proficient > 0 && (
          <span className="text-sm text-sky-600">{domain.proficient} proficient</span>
        )}
        {domain.inProgress > 0 && (
          <span className="text-sm text-orange-600">{domain.inProgress} in progress</span>
        )}
      </div>
    </button>
  );
}
