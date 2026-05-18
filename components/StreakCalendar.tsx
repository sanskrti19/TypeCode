"use client"

import { useEffect, useState } from "react"
import { getStreak } from "@/utils/streak"

export default function StreakCalendar() {

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [streak, setStreak] = useState(0)
  const [dailyCount, setDailyCount] = useState<Record<string, number>>({})
 
  const formatDate = (date: Date) =>
    date.toISOString().slice(0, 10)

  useEffect(() => {

    const update = () => {
      const data = getStreak()
      setStreak(data.current)
      setDailyCount(data.dailyCount || {})
    }

    update()
 
    window.addEventListener("streakUpdated", update)
    window.addEventListener("focus", update)

    return () => {
      window.removeEventListener("streakUpdated", update)
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

 <div className="bg-zinc-900/90 p-5 rounded-2xl 
 text-white w-72 border border-zinc-800 shadow-lg fixed bottom-8 right-16 z-50 ">

  <div className="flex justify-between items-center mb-3">

    <button
      onClick={prevMonth}
      className="text-zinc-400"
    >
      ←
    </button>

    <span className="font-semibold text-sm">
      {currentMonth.toLocaleString(
        "default",
        {month:"short"}
      )}
    </span>

    <button
      onClick={nextMonth}
      className="text-zinc-400"
    >
      →
    </button>

  </div>

  <div className="text-sm font-medium text-center mb-4">
    🔥 {streak} Day Streak
  </div>

  <div className="grid grid-cols-7 gap-2">

    {Array.from(
      {length:daysInMonth},
      (_,i)=>{

      const day=i+1

      const dateObj=
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      )

      const dateStr=
      formatDate(dateObj)

      const isActive=
      (dailyCount[dateStr]||0)>=3

      return(

      <div
      key={day}
      className={`
      w-8 h-8 text-xs
      flex items-center justify-center
      rounded-md
      ${
      isActive
      ? "bg-orange-500/20"
      : "bg-zinc-800"
      }
      `}
      >

      {isActive?"🔥":""}

      </div>

      )

    })}

  </div>

</div>

)
}