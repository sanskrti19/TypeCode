"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface RoomParticipant {
  id: string;
  username: string;
  wpm?: number;
  accuracy?: number;
  progress?: number;
  finished?: boolean;
}

export interface RoomProgress {
  [sessionId: string]: RoomParticipant;
}

interface UseRoomResult {
  participants: RoomParticipant[];
  progress: RoomProgress;
  connected: boolean;
  error: string | null;
  sessionId: string;
  emitProgress: (data: {
    wpm: number;
    accuracy: number;
    progress: number;
    finished?: boolean;
  }) => void;
  emitScore: (data: { wpm: number; accuracy: number }) => void;
  retry: () => void;
}

function getSessionId(roomId: string) {
  const key = `room-session-${roomId}`;
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useRoom(roomId: string | undefined): UseRoomResult {
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [progress, setProgress] = useState<RoomProgress>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const sessionIdRef = useRef("");
  const usernameRef = useRef("Guest");

  useEffect(() => {
    if (!roomId) return;
    sessionIdRef.current = getSessionId(roomId);
    usernameRef.current = localStorage.getItem("username") || "Guest";
  }, [roomId]);

  const applyState = useCallback((data: {
    users?: RoomParticipant[];
    progress?: RoomProgress;
  }) => {
    if (data.users) setParticipants(data.users);
    if (data.progress) setProgress(data.progress);
  }, []);

  const roomAction = useCallback(
    async (body: Record<string, unknown>) => {
      if (!roomId) return null;
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Room request failed (${res.status})`);
      }
      return res.json();
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval>;

    const init = async () => {
      try {
        setError(null);
        const data = await roomAction({
          action: "join",
          sessionId: sessionIdRef.current,
          username: usernameRef.current,
        });
        if (cancelled) return;
        applyState(data);
        setConnected(true);

        pollTimer = setInterval(async () => {
          try {
            const res = await fetch(`/api/rooms/${roomId}`);
            if (!res.ok) return;
            const state = await res.json();
            if (!cancelled) applyState(state);
          } catch {
            /* ignore transient poll errors */
          }
        }, 1500);
      } catch (err) {
        if (!cancelled) {
          setConnected(false);
          setError(
            err instanceof Error ? err.message : "Could not join room"
          );
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      clearInterval(pollTimer);
      roomAction({
        action: "leave",
        sessionId: sessionIdRef.current,
      }).catch(() => {});
    };
  }, [roomId, roomAction, applyState, retryCount]);

  const emitProgress = useCallback(
    (data: {
      wpm: number;
      accuracy: number;
      progress: number;
      finished?: boolean;
    }) => {
      if (!roomId || !connected) return;
      roomAction({
        action: "progress",
        sessionId: sessionIdRef.current,
        username: usernameRef.current,
        ...data,
      })
        .then(applyState)
        .catch(() => {});
    },
    [roomId, connected, roomAction, applyState]
  );

  const emitScore = useCallback(
    (data: { wpm: number; accuracy: number }) => {
      if (!roomId || !connected) return;
      roomAction({
        action: "score",
        sessionId: sessionIdRef.current,
        username: usernameRef.current,
        ...data,
      })
        .then(applyState)
        .catch(() => {});
    },
    [roomId, connected, roomAction, applyState]
  );

  const retry = useCallback(() => setRetryCount((c) => c + 1), []);

  return {
    participants,
    progress,
    connected,
    error,
    sessionId: sessionIdRef.current,
    emitProgress,
    emitScore,
    retry,
  };
}
