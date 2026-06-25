import { connectDB } from "@/lib/mongodb";
import Room from "@/models/Room";

const STALE_MS = 60_000;
const ROOM_TTL_MS = 5 * 60 * 60 * 1000;

function pruneRoom(room) {
  const now = Date.now();
  room.users = (room.users || []).filter(
    (u) => u.lastSeen && now - new Date(u.lastSeen).getTime() < STALE_MS
  );

  const progress = room.progress || {};
  const activeIds = new Set(room.users.map((u) => u.id));
  for (const id of Object.keys(progress)) {
    if (!activeIds.has(id)) delete progress[id];
  }
  room.progress = progress;
  room.markModified("progress");
  return room;
}

function serializeRoom(room) {
  return {
    users: room.users.map((u) => ({ id: u.id, username: u.username })),
    progress: room.progress || {},
    scores: room.scores || [],
    lastActive: room.lastActive,
  };
}

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id: roomId } = await params;

    let room = await Room.findOne({ roomId });
    if (!room) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    if (Date.now() - new Date(room.lastActive).getTime() > ROOM_TTL_MS) {
      await Room.deleteOne({ roomId });
      return Response.json({ error: "Room expired" }, { status: 410 });
    }

    pruneRoom(room);
    await room.save();

    return Response.json(serializeRoom(room));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id: roomId } = await params;
    const body = await req.json();
    const { action } = body;

    let room = await Room.findOne({ roomId });
    if (!room && action !== "join") {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    if (!room) {
      room = await Room.create({
        roomId,
        users: [],
        progress: {},
        scores: [],
        lastActive: new Date(),
      });
    }

    room.lastActive = new Date();

    if (action === "join") {
      const { sessionId, username } = body;
      if (!sessionId || !username) {
        return Response.json({ error: "Missing sessionId or username" }, { status: 400 });
      }

      room.users = (room.users || []).filter((u) => u.username !== username);
      room.users.push({
        id: sessionId,
        username,
        lastSeen: new Date(),
      });
    } else if (action === "leave") {
      const { sessionId } = body;
      room.users = (room.users || []).filter((u) => u.id !== sessionId);
      if (room.progress?.[sessionId]) {
        delete room.progress[sessionId];
        room.markModified("progress");
      }
    } else if (action === "progress") {
      const { sessionId, username, wpm, accuracy, progress, finished } = body;
      if (!sessionId) {
        return Response.json({ error: "Missing sessionId" }, { status: 400 });
      }

      const user = room.users.find((u) => u.id === sessionId);
      if (user) user.lastSeen = new Date();

      room.progress = room.progress || {};
      room.progress[sessionId] = {
        id: sessionId,
        username: username || user?.username,
        wpm: wpm ?? 0,
        accuracy: accuracy ?? 100,
        progress: progress ?? 0,
        finished: !!finished,
      };
      room.markModified("progress");
    } else if (action === "score") {
      const { username, wpm, accuracy } = body;
      room.scores = room.scores || [];
      room.scores.push({
        username,
        wpm,
        accuracy,
        time: new Date(),
      });
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    pruneRoom(room);
    await room.save();

    return Response.json(serializeRoom(room));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
