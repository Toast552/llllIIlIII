export function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-v2-text-muted">
      <div className="text-center space-y-4 animate-v2-welcome-fade-in">
        {/* Branding */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          MassGen
        </h1>

        {/* Guiding copy */}
        <p className="text-sm text-v2-text-secondary">
          Ready when you are
        </p>
        <p className="text-xs text-v2-text-muted">
          Choose a config and enter your question below
        </p>

        {/* Bouncing chevron */}
        <div className="pt-4 animate-v2-chevron-bounce">
          <svg
            className="w-5 h-5 mx-auto text-v2-accent/40"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
