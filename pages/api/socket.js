import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🔥 Initializing Socket.IO...");

    const io = new Server(res.socket.server, {
      path: "/api/socket",
    });

    res.socket.server.io = io;

    const rooms = {};

    io.on("connection", (socket) => {
      console.log("⚡ User connected:", socket.id);

      socket.on("join-room", ({ roomId, username }) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
          rooms[roomId] = {
            users: [],
            scores: [],
          };
        }

        rooms[roomId].users.push({
          id: socket.id,
          username,
        });

        io.to(roomId).emit("room-users", rooms[roomId].users);
      });

      socket.on("submit-score", ({ roomId, username, wpm, accuracy }) => {
        if (!rooms[roomId]) return;

        const existing = rooms[roomId].scores.find(
         (s) => s.username === username
        );

        if (!existing) {

          rooms[roomId].scores.push({ username, wpm, accuracy });
                } else {
   
             if (accuracy > existing.accuracy) {
         existing.wpm = wpm;
             existing.accuracy = accuracy;
           }
        }
        const sorted = rooms[roomId].scores.sort(
        (a, b) => b.accuracy - a.accuracy
        );

        

        io.to(roomId).emit("leaderboard", sorted);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);

        Object.keys(rooms).forEach((roomId) => {
          rooms[roomId].users = rooms[roomId].users.filter(
            (u) => u.id !== socket.id
          );
          rooms[roomId].users.push({
         id: socket.id,
         username,
        });

          io.to(roomId).emit("room-users", rooms[roomId].users);
        });
      });
    });
  }

  res.end();
}