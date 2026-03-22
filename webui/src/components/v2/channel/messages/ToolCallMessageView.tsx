import { useState } from 'react';
import { cn } from '../../../../lib/utils';
import type { ToolCallMessage } from '../../../../stores/v2/messageStore';

interface ToolCallMessageViewProps {
  message: ToolCallMessage;
}

export function ToolCallMessageView({ message }: ToolCallMessageViewProps) {
  const [expanded, setExpanded] = useState(false);

  const isPending = message.result === undefined;
  const statusColor = isPending
    ? 'text-blue-400'
    : message.success
    ? 'text-v2-online'
    : 'text-red-400';

  const elapsedStr = message.elapsed
    ? message.elapsed > 1000
      ? `${(message.elapsed / 1000).toFixed(1)}s`
      : `${Math.round(message.elapsed)}ms`
    : null;

  const filePath = extractFilePath(message.args);

  return (
    <div className="px-2 py-0.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center gap-2 w-full text-left rounded px-2 py-1',
          'hover:bg-[var(--v2-channel-hover)] transition-colors duration-100',
          'text-sm'
        )}
      >
        {/* Expand chevron */}
        <svg
          className={cn(
            'w-3 h-3 text-v2-text-muted transition-transform duration-150 shrink-0',
            expanded && 'rotate-90'
          )}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Status icon */}
        <span className={cn('shrink-0', statusColor)}>
          {isPending ? (
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="6" strokeDasharray="20" strokeDashoffset="5" />
            </svg>
          ) : message.success ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          )}
        </span>

        {/* Tool name */}
        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
          {message.toolName}
        </span>

        {/* File path or arg hint */}
        {filePath && (
          <span className="text-xs text-v2-text-muted truncate">
            {filePath}
          </span>
        )}

        <div className="flex-1" />

        {/* Elapsed */}
        {elapsedStr && (
          <span className="text-xs text-v2-text-muted shrink-0">
            {elapsedStr}
          </span>
        )}
      </button>

      {/* Expanded content — full width */}
      {expanded && (
        <div className="mt-1 mb-2 ml-2 space-y-2 animate-v2-fade-in">
          {Object.keys(message.args).length > 0 && (
            <div className="rounded bg-v2-surface p-2 border border-v2-border-subtle">
              <div className="text-[10px] uppercase tracking-wider text-v2-text-muted mb-1">Args</div>
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                <JsonValue value={message.args} />
              </pre>
            </div>
          )}
          {message.result !== undefined && (
            <div className="rounded bg-v2-surface p-2 border border-v2-border-subtle">
              <div className="text-[10px] uppercase tracking-wider text-v2-text-muted mb-1">Result</div>
              <pre className="text-xs font-mono text-v2-text-secondary whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto v2-scrollbar">
                {message.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// JSON Syntax Highlighting
// ============================================================================

function JsonValue({ value, indent = 0 }: { value: unknown; indent?: number }) {
  if (value === null) return <span className="text-red-400">null</span>;
  if (typeof value === 'boolean') return <span className="text-purple-400">{String(value)}</span>;
  if (typeof value === 'number') return <span className="text-amber-400">{value}</span>;
  if (typeof value === 'string') {
    const display = value.length > 500 ? value.slice(0, 500) + '\u2026' : value;
    return <span className="text-green-400">&quot;{display}&quot;</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-v2-text-muted">[]</span>;
    const pad = '  '.repeat(indent + 1);
    const closePad = '  '.repeat(indent);
    return (
      <>
        {'[\n'}
        {value.map((item, i) => (
          <span key={i}>
            {pad}<JsonValue value={item} indent={indent + 1} />
            {i < value.length - 1 ? ',' : ''}{'\n'}
          </span>
        ))}
        {closePad}{']'}
      </>
    );
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-v2-text-muted">{'{}'}</span>;
    const pad = '  '.repeat(indent + 1);
    const closePad = '  '.repeat(indent);
    return (
      <>
        {'{\n'}
        {entries.map(([key, val], i) => (
          <span key={key}>
            {pad}<span className="text-blue-400">&quot;{key}&quot;</span>{': '}
            <JsonValue value={val} indent={indent + 1} />
            {i < entries.length - 1 ? ',' : ''}{'\n'}
          </span>
        ))}
        {closePad}{'}'}
      </>
    );
  }
  return <span className="text-v2-text-secondary">{String(value)}</span>;
}

function extractFilePath(args: Record<string, unknown>): string | undefined {
  for (const key of ['path', 'file_path', 'filename', 'file', 'target', 'command']) {
    if (typeof args[key] === 'string') {
      return args[key] as string;
    }
  }
  return undefined;
}
