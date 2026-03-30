export function updateStreak() {
  
  const getLocalDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}
const today = getLocalDate()

  const stored = JSON.parse(localStorage.getItem("streak") || "{}")

  let data = {
    current: stored.current || 0,
    lastActiveDate: stored.lastActiveDate || "",
    days: stored.days || [],
    dailyCount: stored.dailyCount || {}
  }

 
  data.dailyCount[today] = (data.dailyCount[today] || 0) + 1

  console.log("Today's count:", data.dailyCount[today])

 
  if (data.dailyCount[today] < 3) {
    localStorage.setItem("streak", JSON.stringify(data))
    return data
  }
 
  if (data.lastActiveDate === today) {
    localStorage.setItem("streak", JSON.stringify(data))
    return data
  }

  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (data.lastActiveDate === yesterdayStr) {
    data.current += 1
  } else {
    data.current = 1
  }

  data.lastActiveDate = today

   
  if (!data.days.includes(today)) {
    data.days.push(today)
  }

  localStorage.setItem("streak", JSON.stringify(data))
  window.dispatchEvent(new Event("streakUpdated"))

  return data
}
export function getStreak() {
  const stored = JSON.parse(localStorage.getItem("streak") || "{}")

  return {
    current: stored.current || 0,
    lastActiveDate: stored.lastActiveDate || "",
    days: stored.days || [],
    dailyCount: stored.dailyCount || {}
  }
}