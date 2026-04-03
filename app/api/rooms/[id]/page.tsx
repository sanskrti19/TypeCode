"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TypingBox from "@/components/TypingBox";


export default function RoomPage() {
  const params = useParams();
  const roomId = params.id;

  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const joinRoom = async () => {
      await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST"
      });

      const res = await fetch(`/api/rooms/${roomId}/participants`);
      const data = await res.json();

      setParticipants(data.participants);
    };

    joinRoom();
  }, [roomId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Room</h1>

      <p className="mt-2">Users in room:</p>
      <TypingBox roomId={roomId} />

      <div className="mt-4 space-y-2">
        {participants.map((p: any) => (
          <div key={p._id} className="bg-zinc-800 p-2 rounded">
            {p.userId?.username || "User"}
          </div>
        ))}
      </div>
    </div>
  );
}