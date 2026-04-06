import { useState, useEffect, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Language = "javascript" | "python" | "cpp" | "sql" | "typescript" | "java"
export type Difficulty = "easy" | "medium" | "hard"

export interface Snippet {
  _id: string
  id: string
  language: Language
  difficulty: Difficulty
  topic: string
  pattern: string
  code: string
  charCount: number
  lineCount: number
  timesPlayed: number
}

export interface SnippetFilters {
  language?: Language
  difficulty?: Difficulty
  topic?: string
}
 

const snippets = [
  "function binarySearch(arr,target){ return arr.indexOf(target) }",
  "def binary_search(arr,target): return arr.index(target)",
  "for(let i=0;i<arr.length;i++){ console.log(arr[i]) }"
];

export function useSnippet() {
  const [code, setCode] = useState("");

  const getSnippet = () => {
    const random = snippets[Math.floor(Math.random() * snippets.length)];
    setCode(random);
  };

  useEffect(() => {
    getSnippet();
  }, []);

  return {
    code,
    refresh: getSnippet
  };
}

 

export async function getRandomSnippet(filters: SnippetFilters = {}): Promise<string> {
  const params = new URLSearchParams()
  if (filters.language)   params.set("language",   filters.language)
  if (filters.difficulty) params.set("difficulty", filters.difficulty)
  if (filters.topic)      params.set("topic",      filters.topic)

  const res = await fetch(`/api/snippets?${params.toString()}`)
  if (!res.ok) return "No snippet found."

  const data = await res.json()
  return data.code ?? "No snippet found."
}