"use client";

import { useEffect, useState } from "react";
import { getStreak, getLocalDate } from "@/utils/streak";

export default function StreakCalendar() {
  const [streak, setStreak] = useState(0);
  const [dailyCount, setDailyCount] = useState<Record<string, number>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const update = () => {
      const data = getStreak();
      setStreak(data.current);
      setDailyCount(data.dailyCount || {});
    };
    update();
    window.addEventListener("streakUpdated", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("streakUpdated", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = currentMonth.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });

  const today = getLocalDate();
  const todayCount = dailyCount[today] || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-3xl text-text-main tabular-nums">
            {streak}
          </p>
          <p className="text-xs uppercase tracking-widest text-text-sub mt-0.5">
            day streak
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-sub">today</p>
          <p className="font-mono text-lg text-accent tabular-nums">
            {todayCount}/3
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-text-sub">
          {monthLabel}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="w-7 h-7 rounded text-text-sub hover:text-text-main hover:bg-bg-elevated transition-colors text-sm"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="w-7 h-7 rounded text-text-sub hover:text-text-main hover:bg-bg-elevated transition-colors text-sm"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const dateObj = new Date(year, month, i + 1);
          const dateKey = getLocalDate(dateObj);
          const count = dailyCount[dateKey] || 0;
          const isComplete = count >= 3;
          const isPartial = count > 0 && count < 3;
          const isToday = dateKey === today;

          return (
            <div
              key={i}
              title={`${count} practice${count !== 1 ? "s" : ""}`}
              className={`
                aspect-square rounded flex items-center justify-center text-[10px] font-mono
                ${
                  isComplete
                    ? "bg-accent/20 text-accent"
                    : isPartial
                      ? "bg-bg-elevated text-text-sub"
                      : "text-text-dim"
                }
                ${isToday ? "ring-1 ring-accent/50" : ""}
              `}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
