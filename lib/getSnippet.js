import snippets from "@/data/snippets.json"

export function getRandomSnippet(filters = {}) {
  let filtered = snippets

  if (filters.language)
    filtered = filtered.filter(s => s.language === filters.language)

  if (filters.difficulty)
    filtered = filtered.filter(s => s.difficulty === filters.difficulty)

  if (filters.topic)
    filtered = filtered.filter(s => s.topic === filters.topic)

  if (!filtered.length) return "No snippet found."

  return filtered[Math.floor(Math.random() * filtered.length)].code
}