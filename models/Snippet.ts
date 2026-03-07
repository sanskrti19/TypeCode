import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Language = "javascript" | "python" | "cpp" | "sql" | "typescript" | "java";
export type Difficulty = "easy" | "medium" | "hard";

export interface ISnippet extends Document {
  id: string;
  language: Language;
  difficulty: Difficulty;
  topic: string;
  pattern: string;
  code: string;
  charCount: number;   // pre-computed, used in WPM calculations
  lineCount: number;
  timesPlayed: number; // incremented each session
  isActive: boolean;   // lets you soft-disable snippets without deleting
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SnippetSchema = new Schema<ISnippet>(
  {
    id:          { type: String, required: true, unique: true },
    language:    { type: String, required: true, index: true },
    difficulty:  { type: String, required: true, index: true },
    topic:       { type: String, required: true, index: true },
    pattern:     { type: String, required: true },
    code:        { type: String, required: true },
    charCount:   { type: Number, required: true },
    lineCount:   { type: Number, required: true },
    timesPlayed: { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Compound index — covers your most common filter: language + difficulty + topic
SnippetSchema.index({ language: 1, difficulty: 1, topic: 1 });
SnippetSchema.index({ language: 1, topic: 1 });

// ─── Model (safe for Next.js hot reload) ─────────────────────────────────────

const Snippet: Model<ISnippet> =
  mongoose.models.Snippet || mongoose.model<ISnippet>("Snippet", SnippetSchema);

export default Snippet;