"use client"

import { useEffect, useState } from "react"
import { getStreak } from "@/utils/streak"

export default function StreakCalendar() {
const [streak,setStreak]=useState(0)
const [dailyCount,setDailyCount]=useState<Record<string,number>>({})
const [currentMonth,setCurrentMonth]=useState(new Date())

const formatDate=(date:Date)=>
date.toISOString().slice(0,10)

useEffect(()=>{

const update=()=>{

const data=getStreak()

setStreak(data.current)
setDailyCount(data.dailyCount||{})
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

return()=>{

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

const monthName=currentMonth.toLocaleString(
"default",
{
month:"long",
year:"numeric"
}
)

const year=currentMonth.getFullYear()
const month=currentMonth.getMonth()

const daysInMonth=
new Date(
year,
month+1,
0
).getDate()

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
"
>

<div className="
flex
justify-between
items-center
mb-4
">

<div>

<h3 className="
text-white
text-2xl
font-semibold
">
🔥 Streaks
</h3>

<p className="
text-zinc-500
text-sm
mt-1
">
{monthName}
</p>

</div>

<div className="flex gap-2">

<button
onClick={()=>
setCurrentMonth(
new Date(
year,
month-1,
1
)
)}
className="
w-8
h-8
rounded-full
bg-zinc-800
hover:bg-zinc-700
"
>
‹
</button>

<button
onClick={()=>
setCurrentMonth(
new Date(
year,
month+1,
1
)
)}
className="
w-8
h-8
rounded-full
bg-zinc-800
hover:bg-zinc-700
"
>
›
</button>

</div>

</div>

<div className="
flex
justify-center
items-center
gap-2
mb-8
">

🔥

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
grid-cols-7
gap-3
"
>

{Array.from(
{length:daysInMonth},
(_,i)=>{

const dateObj=
new Date(
year,
month,
i+1
)

const isActive=
(dailyCount[
formatDate(dateObj)
]||0)>=3

return(

<div
key={i}
className={`
h-11
rounded-xl
border
transition-all
flex
flex-col
items-center
justify-center
text-xs

${
isActive
?
`
bg-orange-500/15
border-orange-500/40
shadow-[0_0_12px_rgba(249,115,22,.4)]
`
:
`
bg-zinc-800/70
border-zinc-800
`
}
`}
>

<span>{i+1}</span>

{isActive&&
<span className="text-[10px]">
🔥
</span>
}

</div>

)

})}

</div>

</div>

)
}