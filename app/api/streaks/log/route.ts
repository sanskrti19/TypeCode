import { logPractice } from "@/controllers/streakController"

export async function POST(req: Request) {
  return logPractice(req)
}