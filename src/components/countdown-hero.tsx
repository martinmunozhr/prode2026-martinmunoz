import { useEffect, useState } from "react";

const TARGET = new Date("2026-06-11T20:00:00Z").getTime();

function diff(now: number) {
  const d = Math.max(0, TARGET - now);
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    minutes: Math.floor((d % 3600000) / 60000),
    seconds: Math.floor((d % 60000) / 1000),
  };
}

export function CountdownHero() {
  const [t, setT] = useState(() => diff(Date.now()));

  useEffect(() => {
    const i = setInterval(() => setT(diff(Date.now())), 1000);
    return () => clearInterval(i);
  }, []);

  const items = [
    { label: "Días", value: t.days },
    { label: "Horas", value: t.hours },
    { label: "Min", value: t.minutes },
    { label: "Seg", value: t.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {items.map((it, i) => (
        <div
          key={it.label}
          className="bg-gradient-card border border-border/50 rounded-xl p-3 md:p-5 text-center shadow-card-sport relative overflow-hidden"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-pitch opacity-5" />
          <div className="relative font-display text-4xl md:text-6xl text-primary leading-none tabular-nums">
            {String(it.value).padStart(2, "0")}
          </div>
          <div className="relative mt-1 text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
