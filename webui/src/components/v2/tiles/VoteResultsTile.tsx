import { VoteVisualization } from '../../VoteVisualization';

export function VoteResultsTile() {
  return (
    <div className="h-full overflow-auto v2-scrollbar p-4 bg-v2-base">
      <VoteVisualization />
    </div>
  );
}
