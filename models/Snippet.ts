import mongoose, { Schema, Document, Model } from "mongoose";

 

export type Language = "javascript" | "python" | "cpp" | "sql" | "typescript" | "java";
export type Difficulty = "easy" | "medium" | "hard";

export interface ISnippet extends Document {
  id: string;
  language: Language;
  difficulty: Difficulty;
  topic: string;
  pattern: string;
  code: string;
  charCount: number;    
  lineCount: number;
  timesPlayed: number;  
  isActive: boolean;    
  createdAt: Date;
  updatedAt: Date;
}

 

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

 
SnippetSchema.index({ language: 1, difficulty: 1, topic: 1 });
SnippetSchema.index({ language: 1, topic: 1 });

 

const Snippet: Model<ISnippet> =
  mongoose.models.Snippet || mongoose.model<ISnippet>("Snippet", SnippetSchema);

export default Snippet;