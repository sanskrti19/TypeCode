"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import TypingBox from "@/components/TypingBox";
import { useParams } from "next/navigation";

type ConnectionStatus = "connecting" | "connected" | "error";

export default function RoomPage() {
  const params = useParams();
  const roomId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [participants, setParticipants] = useState<
    { id: string; username: string }[]
  >([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    const init = async () => {
      try {
        await fetch("/api/socket");
        if (cancelled) return;

        const s = io({
          path: "/api/socket",
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current = s;
        setSocket(s);

        const username = localStorage.getItem("username") || "Guest";

        const onConnect = () => {
          setStatus("connected");
          setErrorMessage(null);
          s.emit("join-room", { roomId, username });
        };

        s.on("connect", onConnect);
        s.on("room-users", setParticipants);
        s.on("connect_error", () => {
          setStatus("error");
          setErrorMessage("Could not connect to the room server.");
        });
        s.io.on("reconnect", () => {
          s.emit("join-room", { roomId, username });
        });

        if (s.connected) onConnect();
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("Failed to initialize room connection.");
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      const s = socketRef.current;
      if (s) {
        s.emit("leave-room", { roomId });
        s.off("connect");
        s.off("room-users");
        s.off("connect_error");
        s.io.off("reconnect");
        s.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  if (status === "connecting") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-sub font-mono">joining room…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="bg-bg-sub border border-border rounded-xl p-8 max-w-md text-center">
          <p className="text-error text-sm mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-accent hover:bg-accent-dim text-white rounded-lg text-sm font-medium transition-colors"
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <TypingBox roomId={roomId} socket={socket} participants={participants} />
  );
}
