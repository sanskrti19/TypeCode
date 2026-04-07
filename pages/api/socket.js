import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🔥 Initializing Socket.IO...");

    const io = new Server(res.socket.server, {
      path: "/api/socket",
    });

    res.socket.server.io = io;

    const rooms = {};
    const ROOM_TTL = 5 * 60 * 60 * 1000;

    // 🧹 Cleanup inactive rooms
    setInterval(() => {
      const now = Date.now();

      Object.keys(rooms).forEach((roomId) => {
        const room = rooms[roomId];

        if (!room.lastActive) return;

        if (now - room.lastActive > ROOM_TTL) {
          delete rooms[roomId];
          console.log("🧹 Room deleted:", roomId);
        }
      });
    }, 60000);

    io.on("connection", (socket) => {
      console.log("⚡ User connected:", socket.id);

      // ✅ JOIN ROOM
      socket.on("join-room", ({ roomId, username }) => {
        socket.join(roomId);

        socket.username = username;
        socket.roomId = roomId;

        if (!rooms[roomId]) {
          rooms[roomId] = {
            users: [],
            scores: [],
            lastActive: Date.now(),
          };
        }

        // prevent duplicate users
        const exists = rooms[roomId].users.find(
          (u) => u.id === socket.id
        );

        if (!exists) {
          rooms[roomId].users.push({
            id: socket.id,
            username,
          });
        }

        rooms[roomId].lastActive = Date.now();

        io.to(roomId).emit("room-users", rooms[roomId].users);
      });

      // ✅ SUBMIT SCORE (ALL ATTEMPTS STORED)
      socket.on("submit-score", ({ roomId, username, wpm, accuracy }) => {
        if (!rooms[roomId]) return;

        rooms[roomId].scores.push({
          username,
          wpm,
          accuracy,
          time: Date.now(),
        });

        rooms[roomId].lastActive = Date.now();

        const sorted = rooms[roomId].scores.sort(
          (a, b) => b.wpm - a.wpm
        );

        io.to(roomId).emit("leaderboard", sorted);
      });

      // ❌ DISCONNECT
      socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);

        const roomId = socket.roomId;

        if (!roomId || !rooms[roomId]) return;

        rooms[roomId].users = rooms[roomId].users.filter(
          (u) => u.id !== socket.id
        );

        io.to(roomId).emit("room-users", rooms[roomId].users);
      });
    });
  }

  res.end();
}