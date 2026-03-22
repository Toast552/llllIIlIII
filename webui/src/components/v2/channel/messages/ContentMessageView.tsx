import { useState } from 'react';
import { cn } from '../../../../lib/utils';
import type { ContentMessage } from '../../../../stores/v2/messageStore';

interface ContentMessageViewProps {
  message: ContentMessage;
}

export function ContentMessageView({ message }: ContentMessageViewProps) {
  const isThinking = message.contentType === 'thinking';
  const [expanded, setExpanded] = useState(!isThinking);

  const content = message.content.trim();
  if (!content) return null;
  const lines = content.split('\n');
  const firstLine = lines[0];
  const hasMore = lines.length > 1 || firstLine.length > 120;

  // For short content, show inline without collapse
  if (!hasMore) {
    return (
      <div className="px-4 py-0.5">
        <div className={cn(
          'text-sm leading-relaxed',
          isThinking ? 'text-v2-text-muted italic' : 'text-v2-text-secondary',
        )}>
          {content}
        </div>
      </div>
    );
  }

  // For longer content, show collapsible one-liner
  const preview = firstLine.length > 100 ? firstLine.slice(0, 100) + '...' : firstLine;

  return (
    <div className="px-4 py-0.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-start gap-2 w-full text-left rounded px-2 py-1',
          'hover:bg-[var(--v2-channel-hover)] transition-colors duration-100',
        )}
      >
        {/* Expand chevron */}
        <svg
          className={cn(
            'w-3 h-3 mt-1 text-v2-text-muted transition-transform duration-150 shrink-0',
            expanded && 'rotate-90'
          )}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Icon */}
        <span className={cn(
          'mt-0.5 shrink-0',
          isThinking ? 'text-violet-400' : 'text-v2-text-muted'
        )}>
          {isThinking ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6" />
              <path d="M6 6.5c0-1.1.9-2 2-2s2 .9 2 2c0 .7-.4 1.4-1 1.7V9" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.5" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4h10M3 8h7M3 12h9" strokeLinecap="round" />
            </svg>
          )}
        </span>

        {/* Preview text */}
        <span className={cn(
          'text-sm truncate',
          isThinking ? 'text-v2-text-muted italic' : 'text-v2-text-secondary',
        )}>
          {expanded ? '' : preview}
          {!expanded && lines.length > 1 && (
            <span className="text-v2-text-muted ml-1">
              (+{lines.length - 1} lines)
            </span>
          )}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="ml-7 mt-1 mb-2 rounded bg-v2-surface p-3 border border-v2-border-subtle animate-v2-fade-in">
          <pre className={cn(
            'whitespace-pre-wrap text-[13px] leading-relaxed break-words',
            isThinking ? 'text-v2-text-muted italic' : 'text-v2-text-secondary',
          )}>
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}
