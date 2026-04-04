import { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MilestoneDetail from './MilestoneDetail';

const STATUS_STYLES = {
  'mastered': { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  'proficient': { bg: '#e0f2fe', border: '#0ea5e9', text: '#0c4a6e' },
  'in-progress': { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  'emerging': { bg: '#ffedd5', border: '#ea580c', text: '#9a3412' },
  'not-started': { bg: '#f1f5f9', border: '#5e8a9e', text: '#5e8a9e' },
};

function MilestoneNode({ data }) {
  const style = STATUS_STYLES[data.status] || STATUS_STYLES['not-started'];

  return (
    <div
      className="rounded-lg px-3 py-2 cursor-pointer transition-all hover:scale-105 min-w-[140px]"
      style={{
        backgroundColor: style.bg,
        border: `2px solid ${style.border}`,
      }}
      onClick={() => data.onSelect(data.milestone)}
    >
      <div className="flex items-center justify-between gap-2">
        <span style={{ color: style.text }} className="text-[10px] font-mono opacity-70">
          {data.milestone.id}
        </span>
        <span style={{ color: style.text }} className="text-[10px] font-semibold">
          {data.progress}%
        </span>
      </div>
      <p style={{ color: style.text }} className="text-xs font-medium mt-0.5 leading-tight">
        {data.milestone.name}
      </p>
    </div>
  );
}

const nodeTypes = { milestone: MilestoneNode };

export default function MilestoneTree({ milestones, prerequisites, completionPct, onUpdate, domainColor }) {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const handleSelect = useCallback((milestone) => {
    setSelectedMilestone(milestone);
  }, []);

  const initialNodes = useMemo(() => {
    // Layout: arrange by difficulty level, spread horizontally
    const byLevel = {};
    milestones.forEach(m => {
      const level = m.difficultyLevel || 1;
      if (!byLevel[level]) byLevel[level] = [];
      byLevel[level].push(m);
    });

    const nodes = [];
    const levels = Object.keys(byLevel).sort((a, b) => a - b);

    levels.forEach((level, levelIdx) => {
      const items = byLevel[level];
      const totalWidth = items.length * 180;
      const startX = -totalWidth / 2 + 90;

      items.forEach((m, idx) => {
        nodes.push({
          id: m.id,
          type: 'milestone',
          position: { x: startX + idx * 180, y: levelIdx * 100 },
          data: {
            milestone: m,
            status: m.status,
            progress: m.progress,
            onSelect: handleSelect,
          },
        });
      });
    });

    return nodes;
  }, [milestones, handleSelect]);

  const initialEdges = useMemo(() =>
    prerequisites.map(p => ({
      id: `${p.requires}-${p.milestoneId}`,
      source: p.requires,
      target: p.milestoneId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    })),
    [prerequisites]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
        <h3 className="text-text-primary text-base font-semibold">Skills Graph</h3>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-sm">Completion:</span>
          <span className="font-[family-name:var(--font-display)] text-lg" style={{ color: domainColor }}>
            {completionPct}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-4 py-2.5 border-b border-border-light">
        {Object.entries(STATUS_STYLES).map(([status, style]) => (
          <span key={status} className="flex items-center gap-2 text-xs" style={{ color: style.text }}>
            <span className="w-4 h-4 rounded" style={{ backgroundColor: style.bg, border: `2px solid ${style.border}` }} />
            {status.replace('-', ' ')}
          </span>
        ))}
      </div>

      {/* React Flow graph */}
      <div style={{ height: 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#d4e0ec" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Milestone detail panel */}
      {selectedMilestone && (
        <MilestoneDetail
          milestone={selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
          onUpdate={(id, updates) => {
            onUpdate(id, updates);
            setSelectedMilestone(prev => prev ? { ...prev, ...updates } : null);
            // Update node data
            setNodes(nds => nds.map(n =>
              n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
            ));
          }}
        />
      )}
    </div>
  );
}
