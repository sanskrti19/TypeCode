import { updateStreak } from "@/utils/streak";

export async function saveScore(result) {
  if (result && result.wpm != null && result.wpm >= 0) {
    updateStreak();
  }
}

export function getRank(wpm) {
  if (wpm < 20) return "Beginner";
  if (wpm < 40) return "Rookie";
  if (wpm < 60) return "Pro";
  if (wpm < 80) return "Elite";
  return "Typing God";
}
