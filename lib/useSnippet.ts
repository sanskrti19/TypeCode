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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSnippet(filters: SnippetFilters = {}) {
  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSnippet = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query string from filters
      const params = new URLSearchParams()
      if (filters.language)   params.set("language",   filters.language)
      if (filters.difficulty) params.set("difficulty", filters.difficulty)
      if (filters.topic)      params.set("topic",      filters.topic)

      const res = await fetch(`/api/snippets?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch snippet")

      const data = await res.json()
      setSnippet(data)
    } catch (err) {
      setError("Could not load snippet. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [filters.language, filters.difficulty, filters.topic])

 
  useEffect(() => {
    fetchSnippet()
  }, [fetchSnippet])

  return {
    snippet,           
    code: snippet?.code ?? "",   
    loading,
    error,
    refresh: fetchSnippet,   
  }
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