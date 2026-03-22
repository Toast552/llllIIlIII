import { useState, useEffect, useRef } from 'react';
import { cn } from '../../../lib/utils';
import { useAgentStore } from '../../../stores/agentStore';
import { useMessageStore } from '../../../stores/v2/messageStore';
import { useThemeStore } from '../../../stores/themeStore';
import { useTileStore } from '../../../stores/v2/tileStore';
import { useV2KeyboardShortcuts } from '../../../hooks/useV2KeyboardShortcuts';
import type { ConnectionStatus } from '../../../hooks/useWebSocket';
import { Sidebar } from '../sidebar/Sidebar';
import { TileContainer } from '../tiles/TileContainer';
import { GlobalInputBar } from './GlobalInputBar';
import { FinalAnswerOverlay } from './FinalAnswerOverlay';
import { LaunchIndicator } from './LaunchIndicator';

interface AppShellProps {
  wsStatus: ConnectionStatus;
  startCoordination: (question: string, configPath?: string) => void;
  continueConversation: (question: string) => void;
  cancelCoordination?: () => void;
  selectedConfig: string | null;
  onConfigChange: (configPath: string) => void;
}

export function AppShell({
  wsStatus,
  startCoordination,
  continueConversation,
  cancelCoordination,
  selectedConfig,
  onConfigChange,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFinalAnswer, setShowFinalAnswer] = useState(false);

  // Keyboard shortcuts
  useV2KeyboardShortcuts();

  // Theme sync
  const getEffectiveTheme = useThemeStore((s) => s.getEffectiveTheme);
  const themeMode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [getEffectiveTheme, themeMode]);

  // Auto-select first agent channel when agents initialize
  const agentOrder = useAgentStore((s) => s.agentOrder);
  const tiles = useTileStore((s) => s.tiles);
  const setTile = useTileStore((s) => s.setTile);
  const prevAgentCountRef = useRef(0);

  useEffect(() => {
    // When agents first appear and no tile is open, auto-open the first agent
    if (agentOrder.length > 0 && prevAgentCountRef.current === 0 && tiles.length === 0) {
      const firstAgent = agentOrder[0];
      const agents = useAgentStore.getState().agents;
      setTile({
        id: `channel-${firstAgent}`,
        type: 'agent-channel',
        targetId: firstAgent,
        label: agents[firstAgent]?.modelName || firstAgent,
      });
    }
    prevAgentCountRef.current = agentOrder.length;
  }, [agentOrder, tiles.length, setTile]);

  // Show final answer overlay when consensus is reached
  const viewMode = useAgentStore((s) => s.viewMode);

  useEffect(() => {
    if (viewMode === 'finalComplete') {
      setShowFinalAnswer(true);
    }
  }, [viewMode]);

  const question = useAgentStore((s) => s.question);
  const isComplete = useAgentStore((s) => s.isComplete);
  const hasRenderableActivity = useMessageStore((s) =>
    Object.values(s.messages).some((agentMessages) =>
      agentMessages.some((message) => message.type !== 'round-divider')
    )
  );

  // Keep the launch sequence visible until the first meaningful agent activity arrives.
  const isLaunching = !!question && !isComplete && !hasRenderableActivity;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-v2-main text-v2-text font-sans">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Crossfade the launch sequence into the tile view instead of hard-swapping */}
        <div className="relative flex-1 min-h-0">
          <div
            data-testid="launch-layer"
            className={cn(
              'absolute inset-0 flex transition-opacity duration-300',
              isLaunching ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <LaunchIndicator
              configName={selectedConfig?.split('/').pop()?.replace('.yaml', '') || undefined}
            />
          </div>
          <div
            data-testid="tiles-layer"
            className={cn(
              'absolute inset-0 transition-opacity duration-300',
              isLaunching ? 'opacity-0 pointer-events-none' : 'opacity-100'
            )}
          >
            <TileContainer />
          </div>
        </div>

        {/* Global input bar — start session or broadcast */}
        <GlobalInputBar
          wsStatus={wsStatus}
          startCoordination={startCoordination}
          continueConversation={continueConversation}
          cancelCoordination={cancelCoordination}
          selectedConfig={selectedConfig}
          onConfigChange={onConfigChange}
          hasActiveSession={!!question}
          isComplete={isComplete}
          isLaunching={isLaunching}
        />
      </div>

      {/* Final Answer Overlay */}
      {showFinalAnswer && (
        <FinalAnswerOverlay
          onDismiss={() => setShowFinalAnswer(false)}
        />
      )}
    </div>
  );
}
