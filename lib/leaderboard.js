import { updateStreak } from "@/utils/streak"

export async function saveScore(result) {
  await fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result)
  })
    console.log("SAVE SCORE CALLED")

 
  if (result.wpm > 10) {
    updateStreak()
  }
  if (roomId) { 
  fetch(`/api/rooms/${roomId}/result`, {
    method: "POST",
    body: JSON.stringify({
      wpm: stats.wpm,
      accuracy: stats.accuracy
    })
  });
} else {
  saveScore({ wpm: stats.wpm, accuracy: stats.accuracy });
}
}

export async function getScores() {
  const res = await fetch("/api/leaderboard")
  return res.json()
}

export function getRank(wpm) {
  if (wpm < 20) return "Beginner"
  if (wpm < 40) return "Rookie"
  if (wpm < 60) return "Pro"
  if (wpm < 80) return "Elite"
  return "Typing God"
}