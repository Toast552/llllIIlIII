import { Panel, Group, Separator } from 'react-resizable-panels';
import { cn } from '../../../lib/utils';
import { useTileStore, TileState } from '../../../stores/v2/tileStore';
import { TileWrapper } from './TileWrapper';
import { EmptyState } from './EmptyState';

export function TileContainer() {
  const tiles = useTileStore((s) => s.tiles);
  const activeTileId = useTileStore((s) => s.activeTileId);
  const setActiveTile = useTileStore((s) => s.setActiveTile);

  if (tiles.length === 0) {
    return <EmptyState />;
  }

  if (tiles.length === 1) {
    return (
      <div className="h-full animate-v2-tile-enter">
        <TileWrapper tile={tiles[0]} isActive showClose={false} />
      </div>
    );
  }

  // Multiple tiles: render in a resizable panel group
  return (
    <Group orientation="horizontal" className="h-full animate-v2-tile-enter">
      {tiles.map((tile, index) => (
        <TilePanel
          key={tile.id}
          tile={tile}
          index={index}
          total={tiles.length}
          isActive={tile.id === activeTileId}
          onFocus={() => setActiveTile(tile.id)}
        />
      ))}
    </Group>
  );
}

interface TilePanelProps {
  tile: TileState;
  index: number;
  total: number;
  isActive: boolean;
  onFocus: () => void;
}

function TilePanel({ tile, index, total, isActive, onFocus }: TilePanelProps) {
  return (
    <>
      {index > 0 && (
        <Separator
          className={cn(
            'w-[2px] bg-v2-border transition-colors duration-150',
            'hover:bg-v2-accent'
          )}
        />
      )}
      <Panel
        id={tile.id}
        minSize={total >= 4 ? 15 : total >= 3 ? 18 : 20}
        defaultSize={100 / total}
      >
        <div
          className="h-full"
          onClick={onFocus}
        >
          <TileWrapper tile={tile} isActive={isActive} showClose={total > 1} />
        </div>
      </Panel>
    </>
  );
}
