import { useMessageStore } from '../../../stores/v2/messageStore';
import { SidebarItem } from './SessionSection';

interface ThreadSectionProps {
  collapsed: boolean;
}

export function ThreadSection({ collapsed }: ThreadSectionProps) {
  const threads = useMessageStore((s) => s.threads);

  return (
    <div className="py-1">
      {!collapsed && (
        <div className="flex items-center px-2 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-v2-text-muted">
            Threads
          </span>
        </div>
      )}

      {threads.length > 0 ? (
        <div className="space-y-0.5">
          {threads.map((thread) => (
            <SidebarItem
              key={thread.id}
              collapsed={collapsed}
              icon={
                <span className={`w-2 h-2 rounded-full ${
                  thread.status === 'running' ? 'bg-v2-online animate-pulse' : 'bg-v2-offline'
                }`} />
              }
              label={thread.task ? thread.task.slice(0, 30) : thread.id}
            />
          ))}
        </div>
      ) : (
        !collapsed && (
          <p className="text-xs text-v2-text-muted px-2 py-2 italic">
            No active threads
          </p>
        )
      )}
    </div>
  );
}
