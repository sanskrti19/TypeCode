"use client"

import { useEffect, useState } from "react"
import { getStreak } from "@/utils/streak"

export default function StreakCalendar() {
  const [streak, setStreak] = useState(0)
  const [dailyCount, setDailyCount] = useState<Record<string, number>>({})

  const formatDate = (date: Date) =>
    date.toISOString().slice(0,10)

  useEffect(() => {

    const update=()=>{

      const data=getStreak()

      setStreak(data.current)
      setDailyCount(data.dailyCount || {})
    }

    update()

    window.addEventListener(
      "streakUpdated",
      update
    )

    window.addEventListener(
      "focus",
      update
    )

    return ()=>{

      window.removeEventListener(
        "streakUpdated",
        update
      )

      window.removeEventListener(
        "focus",
        update
      )

    }

  },[])

  const today=new Date()

  const days=31

  return(

<div
className="
bg-zinc-900/80
border
border-zinc-800
rounded-3xl
p-6
shadow-xl
backdrop-blur
relative
overflow-hidden
"
>

<div className="flex justify-between items-start mb-5">

<div>

<h3 className="
text-white
text-3xl
font-medium
">
Streaks
</h3>

</div>

<button
className="
text-zinc-400
hover:text-white
text-3xl
leading-none
"
>
›
</button>

</div>


<div className="
flex
justify-center
items-center
gap-2
mb-6
">

<span className="text-orange-400">
🔥
</span>

<p className="
text-white
text-xl
font-medium
">
{streak} Day Streak
</p>

</div>


<div
className="
grid
grid-cols-8
gap-2
"
>

{Array.from(
{length:days},
(_,i)=>{

const dateObj=new Date(
today.getFullYear(),
today.getMonth(),
i+1
)

const isActive=
(dailyCount[
formatDate(dateObj)
] ||0)>=3

return(

<div
key={i}
className={`
w-10
h-10
rounded-xl
border
transition-all

${
isActive
?
`
bg-orange-500/15
border-orange-500/40
shadow-[0_0_12px_rgba(249,115,22,.4)]
flex
items-center
justify-center
`
:
`
bg-zinc-800/70
border-zinc-800
`
}
`}
>

{isActive && "🔥"}

</div>

)

})}

</div>

</div>

)
}