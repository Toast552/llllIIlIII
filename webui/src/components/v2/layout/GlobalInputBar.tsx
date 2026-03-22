import { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { useAgentStore } from '../../../stores/agentStore';
import { useMessageStore } from '../../../stores/v2/messageStore';
import type { ConnectionStatus } from '../../../hooks/useWebSocket';
import type { ConfigInfo } from '../../../types';
import { ConfigViewerModal } from './ConfigViewerModal';

interface GlobalInputBarProps {
  wsStatus: ConnectionStatus;
  startCoordination: (question: string, configPath?: string) => void;
  continueConversation: (question: string) => void;
  cancelCoordination?: () => void;
  selectedConfig: string | null;
  onConfigChange: (configPath: string) => void;
  hasActiveSession: boolean;
  isComplete: boolean;
  isLaunching?: boolean;
}

export function GlobalInputBar({
  wsStatus,
  startCoordination,
  continueConversation,
  cancelCoordination,
  selectedConfig,
  onConfigChange,
  hasActiveSession,
  isComplete,
  isLaunching,
}: GlobalInputBarProps) {
  const [message, setMessage] = useState('');
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const [showConfigViewer, setShowConfigViewer] = useState(false);
  const [configViewPath, setConfigViewPath] = useState('');

  // Fetch available configs
  useEffect(() => {
    fetch('/api/configs')
      .then((res) => res.json())
      .then((data: { configs: ConfigInfo[] }) => {
        setConfigs(data.configs || []);
        // Auto-select first config if none selected
        if (!selectedConfig && data.configs?.length > 0) {
          onConfigChange(data.configs[0].path);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || wsStatus !== 'connected') return;

    if (hasActiveSession && isComplete) {
      // Follow-up question — update store state then send WS message
      useAgentStore.getState().startContinuation(message.trim());
      useMessageStore.getState().reset();
      continueConversation(message.trim());
    } else if (!hasActiveSession) {
      // Start new session
      useMessageStore.getState().reset();
      useAgentStore.getState().beginLaunch(message.trim());
      startCoordination(message.trim(), selectedConfig || undefined);
    }
    // If session active and not complete, this is a broadcast (TODO)

    setMessage('');
  };

  const isConnected = wsStatus === 'connected';
  const canSend = isConnected && message.trim().length > 0;

  // Determine placeholder text
  let placeholder = 'Type a question to start...';
  if (isLaunching) {
    placeholder = 'Launching coordination...';
  } else if (!selectedConfig) {
    placeholder = 'Select a config first...';
  } else if (hasActiveSession && !isComplete) {
    placeholder = 'Broadcast: @all or @agent_name ...';
  } else if (isComplete) {
    placeholder = 'Ask a follow-up question...';
  }

  const configName = selectedConfig
    ? selectedConfig.split('/').pop()?.replace('.yaml', '') || 'config'
    : 'No config';

  return (
    <div className="border-t border-v2-border bg-v2-surface px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Config selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowConfigDropdown(!showConfigDropdown)}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-v2-input',
              'border border-v2-border bg-[var(--v2-input-bg)]',
              'text-v2-text-secondary hover:text-v2-text',
              'transition-colors duration-150 whitespace-nowrap',
              !selectedConfig && 'text-v2-idle'
            )}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {configName}
          </button>

          {showConfigDropdown && (
            <div className="absolute bottom-full left-0 mb-1 w-72 max-h-64 overflow-y-auto v2-scrollbar bg-v2-surface-raised border border-v2-border rounded-v2-card shadow-lg z-50">
              {configs.map((config) => (
                <div
                  key={config.path}
                  className={cn(
                    'flex items-center px-3 py-2',
                    'hover:bg-[var(--v2-channel-hover)]',
                    'transition-colors duration-100',
                    config.path === selectedConfig
                      ? 'text-v2-accent bg-v2-accent/5'
                      : 'text-v2-text-secondary'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onConfigChange(config.path);
                      setShowConfigDropdown(false);
                    }}
                    className="flex-1 text-left text-sm min-w-0"
                  >
                    <div className="font-medium truncate">{config.name}</div>
                    <div className="text-[10px] text-v2-text-muted truncate">{config.relative}</div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfigViewPath(config.path);
                      setShowConfigViewer(true);
                      setShowConfigDropdown(false);
                    }}
                    className="shrink-0 p-1 ml-1 text-v2-text-muted hover:text-v2-text rounded"
                    title="View config"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="8" r="3" />
                      <path d="M1 8c1.5-3 4-5 7-5s5.5 2 7 5c-1.5 3-4 5-7 5s-5.5-2-7-5z" />
                    </svg>
                  </button>
                </div>
              ))}
              {configs.length === 0 && (
                <div className="px-3 py-2 text-xs text-v2-text-muted">No configs found</div>
              )}
            </div>
          )}
        </div>

        {/* Connection status dot */}
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0',
            wsStatus === 'connected' ? 'bg-v2-online' : 'bg-red-500'
          )}
          title={wsStatus}
        />

        {/* Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={!isConnected || (!selectedConfig && !hasActiveSession) || !!isLaunching}
            className={cn(
              'w-full rounded-v2-input bg-[var(--v2-input-bg)] px-4 py-2.5',
              'text-sm text-v2-text placeholder:text-v2-text-muted',
              'border-none outline-none',
              'focus:ring-2 focus:ring-v2-accent/50',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-shadow duration-150'
            )}
          />
        </div>

        {/* Cancel button (during active session) */}
        {hasActiveSession && !isComplete && !isLaunching && cancelCoordination && (
          <button
            type="button"
            onClick={cancelCoordination}
            className={cn(
              'rounded-v2-input px-3 py-2.5 text-sm font-medium',
              'bg-red-500/10 text-red-400 border border-red-500/20',
              'hover:bg-red-500/20',
              'transition-colors duration-150'
            )}
          >
            Cancel
          </button>
        )}

        {/* Send / Launch button */}
        <button
          type="submit"
          disabled={!canSend || !!isLaunching}
          className={cn(
            'rounded-v2-input px-4 py-2.5 text-sm font-medium',
            'bg-v2-accent text-white',
            'hover:bg-v2-accent-hover',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-colors duration-150'
          )}
        >
          {isLaunching ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Launching
            </span>
          ) : hasActiveSession && !isComplete ? 'Send' : isComplete ? 'Continue' : 'Start'}
        </button>
      </form>

      {/* Config Viewer Modal */}
      <ConfigViewerModal
        isOpen={showConfigViewer}
        onClose={() => setShowConfigViewer(false)}
        configPath={configViewPath}
      />
    </div>
  );
}
