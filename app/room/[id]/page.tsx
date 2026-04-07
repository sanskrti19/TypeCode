"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import TypingBox from "@/components/TypingBox";
import { useParams } from "next/navigation";
import { Socket } from "socket.io-client";



export default function RoomPage() {
  const params = useParams();
   const roomId = Array.isArray(params?.id) ? params.id[0] : params?.id;

   const [participants, setParticipants] = useState<{ id: string; username: string }[]>([]);
   const [leaderboard, setLeaderboard] = useState<{
       username: string;
       wpm: number;
       accuracy: number;
       }[]>([]);
  
  
  const [socket, setSocket] = useState<Socket | null>(null);

   useEffect(() => {
  let s;

  const init = async () => {
    await fetch("/api/socket");

    s = io({ path: "/api/socket" });

    setSocket(s);

    let username = localStorage.getItem("username") || "Guest";

    if (!username) {
      username = prompt("Enter your name") || "Guest";
      localStorage.setItem("username", username);
    }

    if (!roomId) return;

    s.emit("join-room", { roomId, username });

    s.on("room-users", setParticipants);
    s.on("leaderboard", setLeaderboard);
  };

  init();

  return () => {
    if (s) {
      s.off("room-users");
      s.off("leaderboard");
      s.disconnect();
    }
  };
}, [roomId]);
     

     

  if (!socket) return null;

  return (
    <div className="p-6">
      <h1>Room: {roomId}</h1>
      // @ts-ignore
      <TypingBox
      roomId={roomId}
       socket={socket}
      participants={participants}
       leaderboard={leaderboard}
/>

       

      <h2>Participants</h2>
      {participants.map((p, i) => (
        <div key={i}>{p.username}</div>
      ))}

      <h2 className="mt-4">Leaderboard</h2>
      {leaderboard?.map((l, i) => (
  <p key={i} className="text-sm text-zinc-400">
    {i + 1}. {l.username} - {l.wpm} WPM ({l.accuracy}%)
  </p>
))}
      
    </div>
  );
}