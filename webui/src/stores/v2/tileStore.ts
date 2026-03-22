import { create } from 'zustand';

export type TileType =
  | 'agent-channel'
  | 'file-viewer'
  | 'artifact-preview'
  | 'subagent-view'
  | 'timeline-view'
  | 'workspace-browser'
  | 'vote-results';

export interface TileState {
  id: string;
  type: TileType;
  /** Agent ID for agent-channel/subagent tiles, file path for file-viewer, etc. */
  targetId: string;
  label: string;
}

interface TileStoreState {
  /** All open tiles in order (left to right) */
  tiles: TileState[];
  /** ID of the focused/active tile */
  activeTileId: string | null;
  /** Whether autofit mode is on (show all agents) */
  autofit: boolean;
}

interface TileStoreActions {
  /** Set a single tile (replaces all tiles) */
  setTile: (tile: TileState) => void;
  /** Add a tile to the right of the active tile */
  addTile: (tile: TileState) => void;
  /** Remove a tile by ID */
  removeTile: (tileId: string) => void;
  /** Set the active/focused tile */
  setActiveTile: (tileId: string) => void;
  /** Toggle autofit mode (show all agent channels) */
  toggleAutofit: () => void;
  /** Set autofit with specific agent tiles */
  setAutofitTiles: (tiles: TileState[]) => void;
  /** Replace all tiles */
  setTiles: (tiles: TileState[]) => void;
  /** Reset to empty state */
  reset: () => void;
}

const initialState: TileStoreState = {
  tiles: [],
  activeTileId: null,
  autofit: false,
};

export const useTileStore = create<TileStoreState & TileStoreActions>(
  (set) => ({
    ...initialState,

    setTile: (tile) =>
      set({
        tiles: [tile],
        activeTileId: tile.id,
        autofit: false,
      }),

    addTile: (tile) =>
      set((state) => {
        // Don't add duplicate tiles for the same target
        const existing = state.tiles.find(
          (t) => t.type === tile.type && t.targetId === tile.targetId
        );
        if (existing) {
          return { activeTileId: existing.id };
        }

        const activeIndex = state.tiles.findIndex(
          (t) => t.id === state.activeTileId
        );
        const insertIndex = activeIndex === -1 ? state.tiles.length : activeIndex + 1;
        const newTiles = [...state.tiles];
        newTiles.splice(insertIndex, 0, tile);

        return {
          tiles: newTiles,
          activeTileId: tile.id,
          autofit: false,
        };
      }),

    removeTile: (tileId) =>
      set((state) => {
        const newTiles = state.tiles.filter((t) => t.id !== tileId);
        let newActive = state.activeTileId;
        if (state.activeTileId === tileId) {
          // Focus the tile to the left, or the first tile
          const removedIndex = state.tiles.findIndex((t) => t.id === tileId);
          const focusIndex = Math.max(0, removedIndex - 1);
          newActive = newTiles[focusIndex]?.id ?? null;
        }
        return {
          tiles: newTiles,
          activeTileId: newActive,
          autofit: newTiles.length > 1 ? state.autofit : false,
        };
      }),

    setActiveTile: (tileId) =>
      set({ activeTileId: tileId }),

    toggleAutofit: () =>
      set((state) => ({ autofit: !state.autofit })),

    setAutofitTiles: (tiles) =>
      set({
        tiles,
        activeTileId: tiles[0]?.id ?? null,
        autofit: true,
      }),

    setTiles: (tiles) =>
      set((state) => ({
        tiles,
        activeTileId: tiles.find((t) => t.id === state.activeTileId)?.id
          ?? tiles[0]?.id
          ?? null,
      })),

    reset: () => set(initialState),
  })
);
