import { Server } from "socket.io"

export const initSocket = (server) => {
  const io = new Server(server, {
    path: "/api/socket",
  })

  const rooms = {}

  io.on("connection", (socket) => {

    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId)

      if (!rooms[roomId]) rooms[roomId] = []

      rooms[roomId].push({ id: socket.id, username })

      io.to(roomId).emit("room-users", rooms[roomId])
    })

    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter(u => u.id !== socket.id)
        io.to(roomId).emit("room-users", rooms[roomId])
      }
    })

  })

  return io
}