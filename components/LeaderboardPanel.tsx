"use client";

interface LeaderboardEntry {
  username: string;
  wpm: number;
  accuracy?: number;
}

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  error?: string | null;
  limit?: number;
  compact?: boolean;
}

export default function LeaderboardPanel({
  entries,
  loading = false,
  error = null,
  limit = 10,
  compact = false,
}: LeaderboardPanelProps) {
  const visible = entries.slice(0, limit);

  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between py-2 animate-pulse">
            <div className="h-3.5 w-20 bg-bg-elevated rounded" />
            <div className="h-3.5 w-12 bg-bg-elevated rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-text-sub">
        Leaderboard unavailable — complete a test to save scores locally.
      </p>
    );
  }

  if (visible.length === 0) {
    return (
      <p className="text-sm text-text-sub">
        No scores yet. Finish a test to claim the top spot.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-0.5" : "space-y-1"}>
      {visible.map((user, index) => (
        <div
          key={`${user.username}-${index}`}
          className="flex justify-between items-center py-2 px-2 rounded-md hover:bg-bg-elevated/60 transition-colors group"
        >
          <span className="text-sm text-text-sub group-hover:text-text-main transition-colors truncate mr-3">
            <span
              className={`inline-block w-5 mr-2 font-mono text-xs ${
                index < 3 ? "text-accent" : "text-text-dim"
              }`}
            >
              {index + 1}
            </span>
            {user.username}
          </span>
          <span className="font-mono text-sm text-text-main tabular-nums shrink-0">
            {user.wpm}
          </span>
        </div>
      ))}
    </div>
  );
}
