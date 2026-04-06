"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import TypingBox from "@/components/TypingBox";
import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id;

  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const init = async () => {
      await fetch("/api/socket");

      const s = io({
        path: "/api/socket",
      });

      setSocket(s); //  

      let username = localStorage.getItem("username");

      if (!username) {
        username = prompt("Enter your name") || "Guest";
        localStorage.setItem("username", username);
      }

      s.emit("join-room", { roomId, username });

      s.on("room-users", setParticipants);
      s.on("leaderboard", setLeaderboard);
    };

    init();

    return () => {
      if (socket) {
        socket.off("room-users");
        socket.off("leaderboard");
      }
    };
  }, [roomId]);

  if (!socket) return null;

  return (
    <div className="p-6">
      <h1>Room: {roomId}</h1>

      <TypingBox roomId={roomId} socket={socket} />

      <h2>Participants</h2>
      {participants.map((p, i) => (
        <div key={i}>{p.username}</div>
      ))}

      <h2 className="mt-4">Leaderboard</h2>
      {leaderboard.map((l, i) => (
        <div key={i}>
          {l.username} - {l.wpm} WPM - {l.accuracy}%
        </div>
      ))}
    </div>
  );
}