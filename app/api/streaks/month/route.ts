import { getMonthlyActivity } from "@/controllers/streakController"

export async function GET(req: Request) {
  return getMonthlyActivity(req)
}