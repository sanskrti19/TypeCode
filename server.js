import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const rooms = {};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {

    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);

      if (!rooms[roomId]) rooms[roomId] = [];

      rooms[roomId].push({ id: socket.id, username });

      io.to(roomId).emit("room-users", rooms[roomId]);
    });

    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter(u => u.id !== socket.id);
        io.to(roomId).emit("room-users", rooms[roomId]);
      }
    });

  });

  server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});