"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { saveScore } from "@/lib/leaderboard";
import ResultModal from "./ResultModal";
import StreakCalendar from "./StreakCalendar";
import LeaderboardPanel from "./LeaderboardPanel";
import TypingDisplay from "./TypingDisplay";
import StatsBar from "./StatsBar";

interface Participant {
  id?: string;
  username: string;
  wpm?: number;
  accuracy?: number;
  progress?: number;
  finished?: boolean;
}

interface RoomProgress {
  [socketId: string]: Participant;
}

type Panel = "leaderboard" | "streaks" | "rooms" | "race" | null;

interface TypingBoxProps {
  roomId?: string;
  participants?: Participant[];
  roomProgress?: RoomProgress;
  emitProgress?: (data: {
    wpm: number;
    accuracy: number;
    progress: number;
    finished?: boolean;
  }) => void;
  emitScore?: (data: { wpm: number; accuracy: number }) => void;
}

export default function TypingBox({
  roomId,
  participants = [],
  roomProgress = {},
  emitProgress,
  emitScore,
}: TypingBoxProps) {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [username, setUsername] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [roomLink, setRoomLink] = useState("");
  const [activePanel, setActivePanel] = useState<Panel>(
    roomId ? "race" : null
  );
  const [displayName, setDisplayName] = useState("");

  const { entries, loading, error, refresh } = useLeaderboard();
  const lastProgressEmit = useRef(0);

  const handleComplete = useCallback(
    async (finalStats: { wpm: number; accuracy: number }) => {
      setShowResult(true);
      saveScore(finalStats);

      const name = localStorage.getItem("username");
      try {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: name,
            wpm: finalStats.wpm,
            accuracy: finalStats.accuracy,
          }),
        });
        refresh();
      } catch (err) {
        console.error("Failed to save score:", err);
      }

      if (roomId && emitScore && emitProgress) {
        emitScore({
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
        });
        emitProgress({
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
          progress: 100,
          finished: true,
        });
      }
    },
    [roomId, emitScore, emitProgress, refresh]
  );

  const {
    text,
    input,
    stats,
    timeLeft,
    finished,
    resetTest: engineReset,
  } = useTypingEngine(handleComplete);

  const resetTest = useCallback(() => {
    engineReset();
    setShowResult(false);
  }, [engineReset]);

  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem("rooms") || "[]");
    setRooms(storedRooms);
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) {
      setUsername(name);
      setDisplayName(name);
      setShowNameInput(false);
    } else if (roomId) {
      setShowNameInput(true);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) setRoomLink(`${window.location.origin}/room/${roomId}`);
  }, [roomId]);

  useEffect(() => {
    if (!emitProgress || !roomId || finished) return;
    const now = Date.now();
    if (now - lastProgressEmit.current < 500) return;
    lastProgressEmit.current = now;
    const progressPct =
      text.length > 0 ? Math.round((input.length / text.length) * 100) : 0;
    emitProgress({
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      progress: progressPct,
      finished: false,
    });
  }, [emitProgress, roomId, input, text, stats, finished]);

  const createRoom = async () => {
    if (!localStorage.getItem("username")) {
      setShowNameInput(true);
      return;
    }
    const storedName = localStorage.getItem("username");
    const existingRoom = localStorage.getItem("activeRoom");
    if (existingRoom) {
      const confirmNew = confirm(
        "You already have a room. Create a new one?"
      );
      if (!confirmNew) {
        window.location.href = `/room/${existingRoom}`;
        return;
      }
    }
    const res = await fetch("/api/rooms", { method: "POST" });
    const data = await res.json();
    await fetch(`/api/rooms/${data.roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join",
        sessionId: crypto.randomUUID(),
        username: storedName,
      }),
    });
    const stored = JSON.parse(localStorage.getItem("rooms") || "[]");
    const newRoom = { id: data.roomId, name: `${storedName}'s Room` };
    if (!stored.find((r: { id: string }) => r.id === data.roomId)) {
      localStorage.setItem("rooms", JSON.stringify([newRoom, ...stored]));
    }
    localStorage.setItem("activeRoom", data.roomId);
    window.location.href = `/room/${data.roomId}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
  };

  const togglePanel = (panel: Panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const displayParticipants: Participant[] = roomId
    ? Object.values(roomProgress).length > 0
      ? Object.values(roomProgress)
      : participants
    : participants;

  const storedName = displayName || username;

  return (
    <>
      {showNameInput && (
        <div className="fixed inset-0 flex items-center justify-center bg-bg/80 backdrop-blur-sm z-50 px-4">
          <div className="bg-bg-sub border border-border rounded-xl p-8 w-full max-w-sm">
            <p className="text-xs uppercase tracking-widest text-text-sub mb-1">
              welcome
            </p>
            <h2 className="text-xl text-text-main mb-6">pick a username</h2>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoFocus
              className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text-main font-mono text-sm focus:outline-none focus:border-accent mb-4 placeholder:text-text-dim"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const finalName = username.trim();
                  if (!finalName) return;
                  localStorage.setItem("username", finalName);
                  setDisplayName(finalName);
                  setShowNameInput(false);
                }
              }}
            />
            <button
              className="w-full py-3 bg-accent hover:bg-accent-dim text-white rounded-lg text-sm font-medium transition-colors"
              onClick={() => {
                const finalName = username.trim();
                if (!finalName) return;
                localStorage.setItem("username", finalName);
                setDisplayName(finalName);
                setShowNameInput(false);
              }}
            >
              continue
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-bg flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border/50">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-0.5 select-none">
              <span className="font-mono text-xl text-text-main tracking-tight">
                type
              </span>
              <span className="font-mono text-xl text-accent tracking-tight">
                code
              </span>
            </a>

            <div className="hidden sm:flex items-center gap-1 bg-bg-sub rounded-lg p-1">
              <span className="mode-pill mode-pill-active px-3 py-1.5 rounded-md text-xs font-medium">
                30
              </span>
              <span className="mode-pill px-3 py-1.5 rounded-md text-xs font-medium cursor-default">
                code
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {storedName && (
              <span className="hidden md:block text-xs text-text-sub font-mono mr-2">
                {storedName}
              </span>
            )}
            <button
              onClick={resetTest}
              title="Restart"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-sub hover:text-text-main hover:bg-bg-sub transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </button>
            <button
              onClick={createRoom}
              title="Create room"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-sub hover:text-accent hover:bg-bg-sub transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>
            <button
              onClick={() => togglePanel("rooms")}
              title="Rooms"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                activePanel === "rooms"
                  ? "text-accent bg-bg-sub"
                  : "text-text-sub hover:text-text-main hover:bg-bg-sub"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => togglePanel("leaderboard")}
              title="Leaderboard"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                activePanel === "leaderboard"
                  ? "text-accent bg-bg-sub"
                  : "text-text-sub hover:text-text-main hover:bg-bg-sub"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
            <button
              onClick={() => togglePanel("streaks")}
              title="Streaks"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                activePanel === "streaks"
                  ? "text-accent bg-bg-sub"
                  : "text-text-sub hover:text-text-main hover:bg-bg-sub"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </button>
            {roomId && (
              <button
                onClick={() => togglePanel("race")}
                title="Race"
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                  activePanel === "race"
                    ? "text-accent bg-bg-sub"
                    : "text-text-sub hover:text-text-main hover:bg-bg-sub"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Main typing area */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-10 pb-28 pt-8">
          <div className="w-full max-w-4xl relative">
            {!input.length && !finished && (
              <p className="text-center text-text-sub text-sm mb-8 animate-pulse">
                click here or press any key to focus
              </p>
            )}
            <TypingDisplay text={text} input={input} />
            <div className="flex items-center justify-center gap-5 mt-6 text-[11px] uppercase tracking-widest text-text-dim">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-success/40 border border-success" />
                correct
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-error/40 border border-error" />
                wrong
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-bg-elevated border border-border" />
                upcoming
              </span>
            </div>
          </div>
        </main>

        <StatsBar wpm={stats.wpm} accuracy={stats.accuracy} timeLeft={timeLeft} />

        {/* Slide-out panel */}
        {activePanel && (
          <>
            <div
              className="fixed inset-0 bg-bg/50 z-20 md:hidden"
              onClick={() => setActivePanel(null)}
            />
            <aside className="panel-slide fixed right-0 top-0 bottom-0 w-full sm:w-[var(--panel-width)] bg-bg-sub border-l border-border z-30 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <h2 className="text-xs uppercase tracking-widest text-text-sub">
                  {activePanel === "leaderboard" && "leaderboard"}
                  {activePanel === "streaks" && "streaks"}
                  {activePanel === "rooms" && "rooms"}
                  {activePanel === "race" && "live race"}
                </h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-sub hover:text-text-main hover:bg-bg-elevated transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {activePanel === "leaderboard" && (
                  <LeaderboardPanel
                    entries={entries}
                    loading={loading}
                    error={error}
                    limit={15}
                  />
                )}

                {activePanel === "streaks" && <StreakCalendar />}

                {activePanel === "rooms" && (
                  <div>
                    <button
                      onClick={createRoom}
                      className="w-full py-2.5 mb-4 bg-accent hover:bg-accent-dim text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      create room
                    </button>
                    {rooms.length === 0 ? (
                      <p className="text-sm text-text-sub">
                        No rooms yet. Create one to race friends.
                      </p>
                    ) : (
                      rooms.map((room) => (
                        <a
                          key={room.id}
                          href={`/room/${room.id}`}
                          className="block py-3 border-b border-border text-sm text-text-sub hover:text-text-main transition-colors"
                        >
                          {room.name}
                        </a>
                      ))
                    )}
                  </div>
                )}

                {activePanel === "race" && roomId && (
                  <div>
                    {roomLink && (
                      <button
                        onClick={copyLink}
                        className="w-full py-2.5 mb-5 bg-bg-elevated hover:bg-border border border-border text-text-main rounded-lg text-sm font-mono transition-colors truncate px-3"
                      >
                        copy invite link
                      </button>
                    )}
                    {displayParticipants.length === 0 ? (
                      <p className="text-sm text-text-sub">
                        Waiting for racers…
                      </p>
                    ) : (
                      displayParticipants.map((p, index) => (
                        <div
                          key={p.id || `${p.username}-${index}`}
                          className="py-3 border-b border-border last:border-0"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-text-main">
                              {p.username}
                            </span>
                            <span className="font-mono text-sm text-text-sub tabular-nums">
                              {p.wpm ?? 0} wpm
                            </span>
                          </div>
                          {p.progress != null && p.progress > 0 && (
                            <div className="h-1 bg-bg rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent transition-all duration-300 rounded-full"
                                style={{
                                  width: `${Math.min(p.progress, 100)}%`,
                                }}
                              />
                            </div>
                          )}
                          {p.finished && (
                            <span className="text-[10px] uppercase tracking-widest text-success mt-1.5 block">
                              finished
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </aside>
          </>
        )}

        {roomId && !activePanel && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={() => togglePanel("race")}
              className="flex items-center gap-2 px-4 py-2 bg-bg-sub border border-border rounded-full text-xs text-text-sub hover:text-text-main hover:border-accent/50 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              {displayParticipants.length} racer
              {displayParticipants.length !== 1 ? "s" : ""} live
            </button>
          </div>
        )}
      </div>

      {showResult && (
        <ResultModal
          stats={stats}
          text={text}
          input={input}
          onRestart={resetTest}
        />
      )}
    </>
  );
}
