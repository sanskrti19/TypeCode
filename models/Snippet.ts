// models/Snippet.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISnippet extends Document {
  language: 'javascript' | 'python' | 'cpp' | 'sql' | 'typescript' | 'java';
  topic: string;           // 'loops', 'recursion', 'arrays', etc.
  difficulty: 'easy' | 'medium' | 'hard';
  code: string;            // the actual snippet to type
  description: string;     // what this snippet teaches
  tags: string[];          // ['for-loop', 'iteration', 'range']
  source?: string;         // 'leetcode', 'mdn', 'custom', etc.
  charCount: number;       // pre-computed for fast WPM calc
  lineCount: number;
  estimatedWPM: number;    // target WPM for this snippet
  timesPlayed: number;     // aggregate analytics
  avgAccuracy: number;
  isActive: boolean;       // soft delete / curation
  createdAt: Date;
}

const SnippetSchema = new Schema<ISnippet>({
  language:      { type: String, required: true, index: true },
  topic:         { type: String, required: true, index: true },
  difficulty:    { type: String, required: true, index: true },
  code:          { type: String, required: true },
  description:   { type: String, required: true },
  tags:          [String],
  source:        String,
  charCount:     { type: Number, required: true },
  lineCount:     { type: Number, required: true },
  estimatedWPM:  { type: Number, default: 60 },
  timesPlayed:   { type: Number, default: 0 },
  avgAccuracy:   { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

// Compound index — your most common query pattern
SnippetSchema.index({ language: 1, difficulty: 1, topic: 1 });
SnippetSchema.index({ tags: 1 });

export default mongoose.models.Snippet || mongoose.model<ISnippet>('Snippet', SnippetSchema);