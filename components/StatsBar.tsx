"use client";

interface StatsBarProps {
  wpm: number;
  accuracy: number;
  timeLeft: number;
}

export default function StatsBar({ wpm, accuracy, timeLeft }: StatsBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-bg-sub/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center gap-10 md:gap-16">
        <Stat value={wpm} label="wpm" />
        <Stat value={`${accuracy}%`} label="acc" />
        <Stat value={timeLeft} label="time" />
      </div>
    </footer>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
      <span className="font-mono text-2xl md:text-3xl text-text-main tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-widest text-text-sub font-medium">
        {label}
      </span>
    </div>
  );
}
