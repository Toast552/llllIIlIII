import { TimelineView } from '../../timeline/TimelineView';
import { useTileStore } from '../../../stores/v2/tileStore';

export function TimelineTile() {
  const addTile = useTileStore((s) => s.addTile);

  return (
    <div className="h-full overflow-auto v2-scrollbar bg-v2-base">
      <TimelineView
        onNodeClick={(node) => {
          // Open agent channel when clicking a timeline node
          if (node.agentId) {
            addTile({
              id: `channel-${node.agentId}`,
              type: 'agent-channel',
              targetId: node.agentId,
              label: node.agentId,
            });
          }
        }}
      />
    </div>
  );
}
