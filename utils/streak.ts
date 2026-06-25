export interface StreakData {
  current: number;
  lastActiveDate: string;
  days: string[];
  dailyCount: Record<string, number>;
}

export function getLocalDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getLocalDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return getLocalDate(d);
}

function normalizeStreak(stored: Partial<StreakData>): StreakData {
  const data: StreakData = {
    current: stored.current || 0,
    lastActiveDate: stored.lastActiveDate || "",
    days: stored.days || [],
    dailyCount: stored.dailyCount || {},
  };

  if (!data.lastActiveDate) return data;

  const today = getLocalDate();
  const yesterday = getLocalDateOffset(-1);

  if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
    data.current = 0;
  }

  return data;
}

export function updateStreak(): StreakData {
  const today = getLocalDate();
  const stored = JSON.parse(localStorage.getItem("streak") || "{}");
  const data = normalizeStreak(stored);

  data.dailyCount[today] = (data.dailyCount[today] || 0) + 1;

  if (data.dailyCount[today] < 3) {
    localStorage.setItem("streak", JSON.stringify(data));
    window.dispatchEvent(new Event("streakUpdated"));
    return data;
  }

  if (data.lastActiveDate === today) {
    localStorage.setItem("streak", JSON.stringify(data));
    window.dispatchEvent(new Event("streakUpdated"));
    return data;
  }

  const yesterday = getLocalDateOffset(-1);

  if (data.lastActiveDate === yesterday) {
    data.current += 1;
  } else {
    data.current = 1;
  }

  data.lastActiveDate = today;

  if (!data.days.includes(today)) {
    data.days.push(today);
  }

  localStorage.setItem("streak", JSON.stringify(data));
  window.dispatchEvent(new Event("streakUpdated"));
  return data;
}

export function getStreak(): StreakData {
  const stored = JSON.parse(localStorage.getItem("streak") || "{}");
  const data = normalizeStreak(stored);
  localStorage.setItem("streak", JSON.stringify(data));
  return data;
}
