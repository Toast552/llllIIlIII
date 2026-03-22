import { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { useAgentStore } from '../../../stores/agentStore';
import type { SessionInfo } from '../../../types';

interface SessionSectionProps {
  collapsed: boolean;
}

export function SessionSection({ collapsed }: SessionSectionProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const currentSessionId = useAgentStore((s) => s.sessionId);
  const question = useAgentStore((s) => s.question);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data: { sessions: SessionInfo[] }) => {
        setSessions(data.sessions || []);
      })
      .catch(() => {
        // API not available
      });
  }, [currentSessionId]);

  return (
    <div className="py-1">
      {!collapsed && (
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-v2-text-muted">
            Sessions
          </span>
          <button
            className={cn(
              'flex items-center justify-center w-4 h-4 rounded',
              'text-v2-text-muted hover:text-v2-text',
              'transition-colors duration-150'
            )}
            title="New session"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="space-y-0.5">
        {/* Current session always shown at top */}
        {question && (
          <SidebarItem
            icon={<span className="w-2 h-2 rounded-full bg-v2-online" />}
            label={question.length > 30 ? question.slice(0, 30) + '...' : question}
            active
            collapsed={collapsed}
          />
        )}

        {/* Other sessions from API */}
        {sessions
          .filter((s) => s.session_id !== currentSessionId)
          .slice(0, 10)
          .map((session) => (
            <SidebarItem
              key={session.session_id}
              icon={
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    session.is_running ? 'bg-v2-online' : 'bg-v2-offline'
                  )}
                />
              }
              label={session.question || session.session_id.slice(0, 8)}
              collapsed={collapsed}
            />
          ))}

        {!question && sessions.length === 0 && !collapsed && (
          <p className="text-xs text-v2-text-muted px-2 py-2 italic">
            No sessions
          </p>
        )}
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

export function SidebarItem({ icon, label, active, collapsed, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full rounded px-2 py-1.5 text-sm',
        'transition-colors duration-100',
        active
          ? 'bg-[var(--v2-channel-active)] text-v2-text'
          : 'text-v2-text-secondary hover:bg-[var(--v2-channel-hover)] hover:text-v2-text',
        collapsed && 'justify-center px-0'
      )}
      title={collapsed ? label : undefined}
    >
      <span className="shrink-0 flex items-center justify-center w-5 h-5">
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
