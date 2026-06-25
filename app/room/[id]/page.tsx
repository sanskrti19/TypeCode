"use client";

import TypingBox from "@/components/TypingBox";
import { useRoom } from "@/hooks/useRoom";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function RoomPage() {
  const params = useParams();
  const roomId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const {
    participants,
    progress,
    connected,
    error,
    emitProgress,
    emitScore,
    retry,
  } = useRoom(roomId);

  if (!roomId) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <p className="text-text-sub text-sm">Invalid room link.</p>
      </div>
    );
  }

  if (!connected && !error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-sub font-mono">joining room…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="bg-bg-sub border border-border rounded-xl p-8 max-w-md text-center">
          <p className="text-error text-sm mb-2">Could not join room</p>
          <p className="text-text-sub text-xs mb-6 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={retry}
              className="px-6 py-2.5 bg-accent hover:bg-accent-dim text-white rounded-lg text-sm font-medium transition-colors"
            >
              retry
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-bg-elevated hover:bg-border border border-border text-text-main rounded-lg text-sm font-medium transition-colors"
            >
              solo practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TypingBox
      roomId={roomId}
      participants={participants}
      roomProgress={progress}
      emitProgress={emitProgress}
      emitScore={emitScore}
    />
  );
}
