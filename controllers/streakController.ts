import { Request, Response } from "express"
import PracticeActivity from "../models/PracticeActivity"
import { qualifiesForStreak } from "../utils/streakUtils"

export const logPractice = async (req: Request, res: Response) => {

  const userId = (req as any).user.id
  const { solved, time } = req.body

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

  res.json(activity)
}



export const getMonthlyActivity = async (req: Request, res: Response) => {

  const userId = (req as any).user.id
  const { month } = req.query

  const activities = await PracticeActivity.find({
    userId,
    date: { $regex: `^${month}` }
  })

  res.json(activities)
}
 

 