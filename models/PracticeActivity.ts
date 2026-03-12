import mongoose, { Schema, Document } from "mongoose";

export interface IPracticeActivity extends Document {
  userId: mongoose.Types.ObjectId
  date: string
  problemsSolved: number
  practiceTime: number
  streakEarned: boolean
}

const PracticeActivitySchema = new Schema<IPracticeActivity>(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  date: {
    type: String,
    required: true
  },

  problemsSolved: {
    type: Number,
    default: 0
  },

  practiceTime: {
    type: Number,
    default: 0
  },

  streakEarned: {
    type: Boolean,
    default: false
  }

}, { timestamps: true })

export default mongoose.model<IPracticeActivity>(
  "PracticeActivity",
  PracticeActivitySchema
)