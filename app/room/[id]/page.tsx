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
   
  const [socket, setSocket] = useState<Socket | null>(null);
   useEffect(() => {
  let s:Socket;

  
  const init = async () => {
    await fetch("/api/socket");
    s = io({ path: "/api/socket" });
    setSocket(s);
     
     const username =localStorage.getItem("username") || "Guest";
    if (!roomId) return;

    s.emit("join-room", { roomId, username });

    s.on("room-users", setParticipants);
     
  };

  init();

  return () => {
    if (s) {
      s.off("room-users");
       
      s.disconnect();
    }
  };
}, [roomId]); 
  

  if (!socket) return null;

  return (
    <div className="p-6">
      <h1>Room: {roomId}</h1>
       
      <TypingBox
      roomId={roomId}
       socket={socket}
      participants={participants}
        
/>
 
      
    </div>
  );
}