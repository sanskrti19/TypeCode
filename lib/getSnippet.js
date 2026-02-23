import snippets from "@/data/snippets.json"

export function getRandomSnippet(filters = {}) {
  let filtered = snippets

  if (filters.language) {
    filtered = filtered.filter(s => s.language === filters.language)
  }

  if (filters.difficulty) {
    filtered = filtered.filter(s => s.difficulty === filters.difficulty)
  }

  if (filters.topic) {
    filtered = filtered.filter(s => s.topic === filters.topic)
  }

  if (filtered.length === 0) return "No snippet found."

  const randomIndex = Math.floor(Math.random() * filtered.length)
  return filtered[randomIndex].code
}