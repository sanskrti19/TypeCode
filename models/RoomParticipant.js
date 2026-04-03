import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  }
}, { timestamps: true });

participantSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default mongoose.models.RoomParticipant || 
mongoose.model("RoomParticipant", participantSchema);