"use client"

import { useEffect, useState } from "react"
import { getStreak } from "@/utils/streak"

export default function StreakCalendar() {

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [streak, setStreak] = useState(0)
  const [dailyCount, setDailyCount] = useState<Record<string, number>>({})

  const formatDate = (date: Date) => date.toDateString()

   
  useEffect(() => {

    const update = () => {
      const data = getStreak()
      setStreak(data.current)
      setDailyCount(data.dailyCount || {})
    }

    update()

    
    const interval = setInterval(update, 1000)

   
    window.addEventListener("focus", update)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", update)
    }

  }, [])

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

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

   
      <div className="mt-4 text-sm text-center">
        🔥 Current Streak: {streak}
      </div>

     
      <div className="grid grid-cols-7 gap-2 mt-4">

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1

          const dateObj = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          )

          const dateStr = formatDate(dateObj)
 
          const isActive = (dailyCount[dateStr] || 0) >= 3

          return (
            <div
              key={day}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800"
            >
              {isActive ? "🔥" : ""}
            </div>
          )
        })}

      </div>

    </div>
  )
}