import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    res.socket.server.io = io;

    const rooms = {};
    const ROOM_TTL = 5 * 60 * 60 * 1000;

    setInterval(() => {
      const now = Date.now();
      Object.keys(rooms).forEach((roomId) => {
        const room = rooms[roomId];
        if (!room?.lastActive) return;
        if (now - room.lastActive > ROOM_TTL) {
          delete rooms[roomId];
        }
      });
    }, 60000);

    const getRoomUsers = (roomId) => rooms[roomId]?.users ?? [];

    const broadcastRoom = (roomId) => {
      if (!rooms[roomId]) return;
      rooms[roomId].lastActive = Date.now();
      io.to(roomId).emit("room-users", getRoomUsers(roomId));
      io.to(roomId).emit("room-state", {
        users: getRoomUsers(roomId),
        scores: rooms[roomId].scores ?? [],
        progress: rooms[roomId].progress ?? {},
      });
    };

    io.on("connection", (socket) => {
      socket.on("join-room", ({ roomId, username }) => {
        if (!roomId || !username) return;

        if (socket.roomId && socket.roomId !== roomId) {
          socket.leave(socket.roomId);
        }

        socket.join(roomId);
        socket.username = username;
        socket.roomId = roomId;

        if (!rooms[roomId]) {
          rooms[roomId] = {
            users: [],
            scores: [],
            progress: {},
            lastActive: Date.now(),
          };
        }

        rooms[roomId].users = rooms[roomId].users.filter(
          (u) => u.username !== username
        );

        rooms[roomId].users.push({
          id: socket.id,
          username,
        });

        broadcastRoom(roomId);
      });

      socket.on("leave-room", ({ roomId }) => {
        const id = roomId || socket.roomId;
        if (!id || !rooms[id]) return;

        rooms[id].users = rooms[id].users.filter((u) => u.id !== socket.id);
        if (rooms[id].progress) {
          delete rooms[id].progress[socket.id];
        }

        socket.leave(id);
        if (socket.roomId === id) socket.roomId = null;

        broadcastRoom(id);
      });

      socket.on(
        "typing-progress",
        ({ roomId, username, wpm, accuracy, progress, finished }) => {
          const id = roomId || socket.roomId;
          if (!id || !rooms[id]) return;

          rooms[id].progress[socket.id] = {
            id: socket.id,
            username: username || socket.username,
            wpm: wpm ?? 0,
            accuracy: accuracy ?? 100,
            progress: progress ?? 0,
            finished: !!finished,
          };

          rooms[id].lastActive = Date.now();
          io.to(id).emit("room-progress", rooms[id].progress);
        }
      );

      socket.on("submit-score", ({ roomId, username, wpm, accuracy }) => {
        const id = roomId || socket.roomId;
        if (!id || !rooms[id]) return;

        rooms[id].scores.push({
          username: username || socket.username,
          wpm,
          accuracy,
          time: Date.now(),
        });

        rooms[id].lastActive = Date.now();

        const bestByUser = {};
        for (const score of rooms[id].scores) {
          const key = score.username;
          if (!bestByUser[key] || score.wpm > bestByUser[key].wpm) {
            bestByUser[key] = score;
          }
        }

        const sorted = Object.values(bestByUser).sort((a, b) => b.wpm - a.wpm);
        io.to(id).emit("leaderboard", sorted);
        broadcastRoom(id);
      });

      socket.on("disconnect", () => {
        const roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;

        rooms[roomId].users = rooms[roomId].users.filter(
          (u) => u.id !== socket.id
        );
        if (rooms[roomId].progress) {
          delete rooms[roomId].progress[socket.id];
        }

        broadcastRoom(roomId);
      });
    });
  }

  res.end();
}
