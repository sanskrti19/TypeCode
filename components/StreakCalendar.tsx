"use client"

import { useEffect, useState } from "react"

interface Activity {
  date: string
  streakEarned: boolean
}

export default function StreakCalendar() {

  const [activity, setActivity] = useState<Activity[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthString =
    currentMonth.getFullYear() +
    "-" +
    String(currentMonth.getMonth() + 1).padStart(2, "0")

  useEffect(() => {
    fetch(`/api/streak/month?month=${monthString}`)
      .then(res => res.json())
      .then(data => setActivity(data))
  }, [monthString])

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const getActivityForDay = (day: number) => {
    const date = `${monthString}-${String(day).padStart(2, "0")}`
    return activity.find(a => a.date === date)
  }

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-xl text-white">

     
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth}>←</button>

        <span className="font-semibold">
          {currentMonth.toLocaleString("default", { month: "long" })}
        </span>

        <button onClick={nextMonth}>→</button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const act = getActivityForDay(day)

          return (
            <div
              key={day}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800"
            >
              {act?.streakEarned ? "🔥" : ""}
            </div>
          )
        })}

      </div>

    </div>
  )
}