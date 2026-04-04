import { useMemo } from 'react';
import { MILESTONES, PREREQUISITES } from '../data/milestones';
import { useStudent } from './useStudent';

export function useMilestones(domainId) {
  const { milestoneStatus, updateMilestone } = useStudent();

  const milestones = useMemo(() =>
    MILESTONES
      .filter(m => m.domainId === domainId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(m => ({
        ...m,
        ...(milestoneStatus[m.id] || { status: 'not-started', progress: 0 }),
      })),
    [domainId, milestoneStatus]
  );

  const prerequisites = useMemo(() =>
    PREREQUISITES.filter(p =>
      milestones.some(m => m.id === p.milestoneId)
    ),
    [milestones]
  );

  const completionPct = useMemo(() => {
    if (milestones.length === 0) return 0;
    const total = milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(total / milestones.length);
  }, [milestones]);

  return { milestones, prerequisites, completionPct, updateMilestone };
}
