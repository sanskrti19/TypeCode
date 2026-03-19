import PracticeActivity from "@/models/PracticeActivity"
import { qualifiesForStreak } from "@/utils/streakUtils"

export const logPractice = async (req: Request) => {

  const body = await req.json()
  const { solved, time } = body

  // ⚠️ TEMP user (replace later with auth)
  const userId = "dummyUserId"

  const today = new Date().toISOString().split("T")[0]

  let activity = await PracticeActivity.findOne({ userId, date: today })

  if (!activity) {
    activity = new PracticeActivity({
      userId,
      date: today
    })
  }

  activity.problemsSolved += solved
  activity.practiceTime += time

  if (qualifiesForStreak(activity.problemsSolved, activity.practiceTime)) {
    activity.streakEarned = true
  }

  await activity.save()

  return Response.json(activity)
}



export const getMonthlyActivity = async (req: Request) => {

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month")

  const userId = "dummyUserId"

  const activities = await PracticeActivity.find({
    userId,
    date: { $regex: `^${month}` }
  })

  return Response.json(activities)
}