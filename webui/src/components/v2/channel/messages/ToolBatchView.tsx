import { useState } from 'react';
import { cn } from '../../../../lib/utils';
import type { ToolCallMessage } from '../../../../stores/v2/messageStore';

/** Number of tools visible when collapsed */
const COLLAPSED_VISIBLE = 3;

interface ToolBatchViewProps {
  tools: ToolCallMessage[];
}

export function ToolBatchView({ tools }: ToolBatchViewProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  // Aggregate status
  const anyPending = tools.some((t) => t.result === undefined);
  const anyFailed = tools.some((t) => t.success === false);

  // Aggregate elapsed
  const totalElapsed = tools.reduce((sum, t) => sum + (t.elapsed || 0), 0);
  const elapsedStr = totalElapsed > 0
    ? totalElapsed > 1000
      ? `${(totalElapsed / 1000).toFixed(1)}s`
      : `${Math.round(totalElapsed)}ms`
    : null;

  // Server/tool name for header — use the common prefix or first tool name
  const serverName = getServerName(tools);

  // Which tools to show when collapsed
  const visibleTools = expanded
    ? tools
    : tools.slice(-COLLAPSED_VISIBLE);
  const hiddenCount = expanded ? 0 : Math.max(0, tools.length - COLLAPSED_VISIBLE);

  return (
    <div className="px-2 py-0.5">
      {/* Batch header */}
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

        {/* Batch status icon */}
        <span className={cn('shrink-0', anyPending ? 'text-blue-400' : anyFailed ? 'text-red-400' : 'text-v2-online')}>
          {anyPending ? (
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="6" strokeDasharray="20" strokeDashoffset="5" />
            </svg>
          ) : anyFailed ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>

        {/* Server/tool name */}
        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
          {serverName}
        </span>

        {/* Tool count */}
        <span className="text-xs text-v2-text-muted">
          ×{tools.length}
        </span>

        <div className="flex-1" />

        {/* Total elapsed */}
        {elapsedStr && (
          <span className="text-xs text-v2-text-muted shrink-0">
            {elapsedStr}
          </span>
        )}
      </button>

      {/* Tool tree */}
      <div className="ml-5 border-l border-v2-border-subtle">
        {/* Hidden count indicator */}
        {hiddenCount > 0 && (
          <div className="flex items-center gap-1.5 pl-3 py-0.5 text-xs text-v2-text-muted">
            <span className="text-v2-border">├─</span>
            <button
              onClick={() => setExpanded(true)}
              className="hover:text-v2-text transition-colors"
            >
              (+{hiddenCount} earlier)
            </button>
          </div>
        )}

        {/* Visible tools */}
        {visibleTools.map((tool, i) => {
          const isLast = i === visibleTools.length - 1 && hiddenCount === 0
            ? i === tools.length - 1
            : i === visibleTools.length - 1;
          const connector = isLast ? '└─' : '├─';
          const isPending = tool.result === undefined;
          const toolExpanded = expandedToolId === tool.id;

          return (
            <div key={tool.id}>
              <button
                onClick={() => setExpandedToolId(toolExpanded ? null : tool.id)}
                className={cn(
                  'flex items-center gap-1.5 w-full text-left pl-3 pr-2 py-0.5',
                  'hover:bg-[var(--v2-channel-hover)] transition-colors duration-100',
                  'text-xs'
                )}
              >
                <span className="text-v2-border font-mono shrink-0">{connector}</span>

                {/* Tool status */}
                <span className={cn(
                  'shrink-0',
                  isPending ? 'text-blue-400' : tool.success ? 'text-v2-online' : 'text-red-400'
                )}>
                  {isPending ? (
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="8" cy="8" r="6" strokeDasharray="20" strokeDashoffset="5" />
                    </svg>
                  ) : tool.success ? (
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 8l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                    </svg>
                  )}
                </span>

                {/* Tool name (short) */}
                <span className="font-mono text-v2-text-secondary shrink-0">
                  {tool.toolName}
                </span>

                {/* Arg hint */}
                <span className="text-v2-text-muted truncate">
                  {extractArgHint(tool.args)}
                </span>

                <div className="flex-1" />

                {/* Elapsed */}
                {tool.elapsed != null && (
                  <span className="text-v2-text-muted shrink-0">
                    {tool.elapsed > 1000
                      ? `${(tool.elapsed / 1000).toFixed(1)}s`
                      : `${Math.round(tool.elapsed)}ms`}
                  </span>
                )}
              </button>

              {/* Expanded tool details */}
              {toolExpanded && (
                <ToolDetail tool={tool} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Tool Detail (expanded within batch)
// ============================================================================

function ToolDetail({ tool }: { tool: ToolCallMessage }) {
  return (
    <div className="ml-8 mr-2 mb-1 space-y-1.5 animate-v2-fade-in">
      {Object.keys(tool.args).length > 0 && (
        <div className="rounded bg-v2-surface p-2 border border-v2-border-subtle">
          <div className="text-[10px] uppercase tracking-wider text-v2-text-muted mb-1">Args</div>
          <pre className="text-xs font-mono whitespace-pre-wrap break-all text-v2-text-secondary">
            {formatArgs(tool.args)}
          </pre>
        </div>
      )}
      {tool.result !== undefined && (
        <div className="rounded bg-v2-surface p-2 border border-v2-border-subtle">
          <div className="text-[10px] uppercase tracking-wider text-v2-text-muted mb-1">Result</div>
          <pre className="text-xs font-mono text-v2-text-secondary whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto v2-scrollbar">
            {tool.result}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

/** Extract common server/tool name from a batch of tools */
function getServerName(tools: ToolCallMessage[]): string {
  const names = tools.map((t) => t.toolName);
  // If all same name, use that
  if (names.every((n) => n === names[0])) return names[0];
  // Otherwise find common prefix (e.g., "filesystem" from "filesystem__read_file", "filesystem__write_file")
  const first = names[0];
  for (let len = first.length; len > 0; len--) {
    const prefix = first.slice(0, len);
    if (names.every((n) => n.startsWith(prefix))) {
      // Clean up trailing separators
      return prefix.replace(/[_\s]+$/, '') || first;
    }
  }
  return first;
}

/** Extract a short arg hint for the tree view */
function extractArgHint(args: Record<string, unknown>): string {
  for (const key of ['path', 'file_path', 'filename', 'file', 'target', 'command']) {
    if (typeof args[key] === 'string') {
      return args[key] as string;
    }
  }
  return '';
}

/** Format args as compact JSON */
function formatArgs(args: Record<string, unknown>): string {
  return JSON.stringify(args, null, 2);
}
