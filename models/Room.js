import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    users: [
      {
        id: String,
        username: String,
        lastSeen: { type: Date, default: Date.now },
      },
    ],
    progress: { type: mongoose.Schema.Types.Mixed, default: {} },
    scores: [
      {
        username: String,
        wpm: Number,
        accuracy: Number,
        time: { type: Date, default: Date.now },
      },
    ],
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Room ||
  mongoose.model("Room", RoomSchema);
