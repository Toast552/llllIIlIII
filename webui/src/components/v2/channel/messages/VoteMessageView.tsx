import type { VoteMessage } from '../../../../stores/v2/messageStore';

interface VoteMessageViewProps {
  message: VoteMessage;
}

export function VoteMessageView({ message }: VoteMessageViewProps) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-start gap-3 rounded-v2-card bg-violet-500/5 border border-violet-500/20 px-3 py-2.5">
        {/* Ballot icon */}
        <span className="text-violet-400 mt-0.5 shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <path d="M2 7h12" />
            <path d="M5.5 9.5l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">
              {message.voteLabel}
            </span>
            <span className="text-sm text-v2-text-secondary">
              Voted for <span className="font-medium text-v2-text">{message.targetName || message.targetId}</span>
            </span>
          </div>

          {message.reason && (
            <p className="text-xs text-v2-text-muted mt-1 italic">
              {message.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
