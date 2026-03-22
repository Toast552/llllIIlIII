import { useEffect } from 'react';
import { useFileContent } from '../../../hooks/useFileContent';
import { useWorkspaceStore } from '../../../stores/workspaceStore';

interface FileViewerTileProps {
  filePath: string;
}

export function FileViewerTile({ filePath }: FileViewerTileProps) {
  const { content, isLoading, error, fetchFile } = useFileContent();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const workspacePath = Object.keys(workspaces)[0] || '';

  // Fetch file content on mount
  useEffect(() => {
    if (workspacePath) {
      fetchFile(filePath, workspacePath);
    }
  }, [filePath, workspacePath, fetchFile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-v2-text-muted text-sm">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="8" r="6" strokeDasharray="20" strokeDashoffset="5" />
          </svg>
          Loading {filePath}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-v2-text-muted text-sm">
        No content available
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto v2-scrollbar bg-v2-surface">
      <pre className="p-4 text-sm font-mono text-v2-text-secondary whitespace-pre-wrap leading-relaxed">
        {content.content}
      </pre>
    </div>
  );
}
