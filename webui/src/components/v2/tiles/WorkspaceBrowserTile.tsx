import { useState, useMemo } from 'react';
import { cn } from '../../../lib/utils';
import { useWorkspaceStore, type WorkspaceFileInfo } from '../../../stores/workspaceStore';
import { useAgentStore } from '../../../stores/agentStore';
import { useTileStore } from '../../../stores/v2/tileStore';
import { getAgentColor } from '../../../utils/agentColors';

export function WorkspaceBrowserTile() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const agentOrder = useAgentStore((s) => s.agentOrder);
  const addTile = useTileStore((s) => s.addTile);

  const workspacePaths = Object.keys(workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');

  // Keep selectedWorkspace in sync — pick first available if current is invalid
  const effectiveWorkspace =
    workspacePaths.includes(selectedWorkspace) ? selectedWorkspace : workspacePaths[0] || '';

  const files = workspaces[effectiveWorkspace]?.files || [];

  const handleFileClick = (file: WorkspaceFileInfo) => {
    addTile({
      id: `file-${file.path}`,
      type: 'file-viewer',
      targetId: file.path,
      label: file.path.split('/').pop() || file.path,
    });
  };

  if (workspacePaths.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-v2-text-muted text-sm">
        No workspace files available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-v2-base">
      {/* Workspace selector (multi-agent) */}
      {workspacePaths.length > 1 && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-v2-border shrink-0">
          {workspacePaths.map((path, index) => {
            const agentId = agentOrder[index];
            const color = agentId
              ? getAgentColor(agentId, agentOrder)
              : undefined;
            const isSelected = path === effectiveWorkspace;
            return (
              <button
                key={path}
                onClick={() => setSelectedWorkspace(path)}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  isSelected
                    ? 'text-v2-text font-medium'
                    : 'text-v2-text-muted hover:text-v2-text hover:bg-v2-sidebar-hover'
                )}
                style={
                  isSelected && color
                    ? { backgroundColor: `${color.hex}20` }
                    : undefined
                }
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: color?.hex || '#80848E' }}
                />
                {agentId || `Workspace ${index + 1}`}
              </button>
            );
          })}
        </div>
      )}

      {/* File tree */}
      <div className="flex-1 overflow-auto v2-scrollbar">
        <FileTree files={files} onFileClick={handleFileClick} />
      </div>
    </div>
  );
}

// ============================================================================
// File Tree
// ============================================================================

interface FileTreeProps {
  files: WorkspaceFileInfo[];
  onFileClick: (file: WorkspaceFileInfo) => void;
}

function FileTree({ files, onFileClick }: FileTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-v2-text-muted text-sm">
        No files in workspace
      </div>
    );
  }

  return (
    <div className="py-1">
      {tree.children.map((node) => (
        <TreeNode key={node.path} node={node} depth={0} onFileClick={onFileClick} />
      ))}
    </div>
  );
}

// ============================================================================
// Tree Node
// ============================================================================

interface TreeNodeData {
  name: string;
  path: string;
  isDir: boolean;
  file?: WorkspaceFileInfo;
  children: TreeNodeData[];
}

interface TreeNodeProps {
  node: TreeNodeData;
  depth: number;
  onFileClick: (file: WorkspaceFileInfo) => void;
}

function TreeNode({ node, depth, onFileClick }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center gap-1.5 w-full text-sm text-v2-text-secondary',
            'hover:bg-v2-sidebar-hover hover:text-v2-text',
            'transition-colors duration-100 py-0.5 pr-2'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <svg
            className={cn('w-3 h-3 shrink-0 transition-transform', expanded && 'rotate-90')}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="w-3.5 h-3.5 shrink-0 text-v2-text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4.5A1.5 1.5 0 013.5 3h3l1.5 1.5h4.5A1.5 1.5 0 0114 6v5.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 11.5V4.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{node.name}</span>
        </button>
        {expanded &&
          node.children.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.file && onFileClick(node.file)}
      className={cn(
        'flex items-center gap-1.5 w-full text-sm text-v2-text-secondary',
        'hover:bg-v2-sidebar-hover hover:text-v2-text',
        'transition-colors duration-100 py-0.5 pr-2'
      )}
      style={{ paddingLeft: `${depth * 16 + 8 + 15}px` }}
    >
      <FileIcon name={node.name} />
      <span className="truncate">{node.name}</span>
      {node.file && (
        <span className="ml-auto text-[10px] text-v2-text-muted shrink-0">
          {formatSize(node.file.size)}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function buildTree(files: WorkspaceFileInfo[]): TreeNodeData {
  const root: TreeNodeData = { name: '', path: '', isDir: true, children: [] };

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');

      if (isLast) {
        current.children.push({
          name: part,
          path,
          isDir: false,
          file,
          children: [],
        });
      } else {
        let dir = current.children.find((c) => c.isDir && c.name === part);
        if (!dir) {
          dir = { name: part, path, isDir: true, children: [] };
          current.children.push(dir);
        }
        current = dir;
      }
    }
  }

  // Sort: directories first, then files, both alphabetically
  const sortChildren = (node: TreeNodeData) => {
    node.children.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  };
  sortChildren(root);

  return root;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  const isCode = ['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'cpp', 'c', 'h'].includes(ext || '');
  const isConfig = ['json', 'yaml', 'yml', 'toml', 'ini', 'env'].includes(ext || '');
  const isMarkdown = ext === 'md';

  const className = cn(
    'w-3.5 h-3.5 shrink-0',
    isCode ? 'text-blue-400' : isConfig ? 'text-amber-400' : isMarkdown ? 'text-emerald-400' : 'text-v2-text-muted'
  );

  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2h5l3 3v9H4V2z" strokeLinejoin="round" />
      <path d="M9 2v3h3" strokeLinejoin="round" />
    </svg>
  );
}
