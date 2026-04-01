"use client";

import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Room</h1>
      <p>Room ID: {roomId}</p>

      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
        }}
        className="mt-4 bg-blue-500 px-4 py-2 rounded"
      >
        Copy Invite Link
      </button>
    </div>
  );
}