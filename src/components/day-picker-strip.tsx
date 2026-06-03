import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type DayBucket = {
  /** YYYY-MM-DD key */
  key: string;
  /** Date at 00:00 local */
  date: Date;
  count: number;
  /** count of matches the user already predicted this day */
  predicted: number;
};

type Props = {
  days: DayBucket[];
  selected: string | null;
  onSelect: (key: string) => void;
  todayKey?: string;
};

const WD = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DayPickerStrip({ days, selected, onSelect, todayKey }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll the selected day into view when it changes
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selected]);

  const grouped = useMemo(() => {
    // Group consecutive days by month for the month label band
    return days;
  }, [days]);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/40 p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <CalendarDays className="h-5 w-5 opacity-60" />
        No hay partidos por pronosticar.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-wide font-bold text-muted-foreground">
          Elegí el día
        </span>
        <span className="ml-auto text-xs uppercase tracking-wide text-muted-foreground">
          {days.length} {days.length === 1 ? "jornada" : "jornadas"}
        </span>
      </div>

      <div className="relative">
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

        <button
          type="button"
          onClick={() => scrollBy(-280)}
          aria-label="Desplazar hacia atrás"
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-card border border-border/60 shadow-card-sport hover:border-primary/40 hidden md:flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(280)}
          aria-label="Desplazar hacia adelante"
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-card border border-border/60 shadow-card-sport hover:border-primary/40 hidden md:flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1"
          role="tablist"
          aria-label="Días con partidos"
        >
          {grouped.map((d) => {
            const isSelected = selected === d.key;
            const isToday = !!(todayKey && d.key === todayKey);
            const allDone = d.predicted >= d.count && d.count > 0;
            return (
              <button
                key={d.key}
                ref={isSelected ? selectedRef : null}
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelect(d.key)}
                className={cn(
                  "snap-start shrink-0 w-[88px] sm:w-[100px] rounded-2xl border p-3 text-center transition-all relative overflow-hidden",
                  isSelected
                    ? "bg-gradient-pitch text-primary-foreground border-primary shadow-glow-pitch scale-[1.02]"
                    : isToday
                      ? "bg-card border-emerald-500/40 hover:border-emerald-500/60 hover:bg-card/80"
                      : "bg-card border-border/50 hover:border-primary/40 hover:bg-card/80",
                )}
              >
                <div
                  className={cn(
                    "text-xs uppercase tracking-wide font-bold",
                    isSelected ? "text-primary-foreground/90" : isToday ? "text-emerald-400" : "text-muted-foreground",
                  )}
                >
                  {isToday ? "HOY" : WD[d.date.getDay()]}
                </div>
                <div className="font-display text-3xl tabular-nums leading-none mt-1">
                  {String(d.date.getDate()).padStart(2, "0")}
                </div>
                <div
                  className={cn(
                    "text-xs uppercase tracking-wide font-bold mt-0.5",
                    isSelected ? "text-primary-foreground/90" : "text-muted-foreground",
                  )}
                >
                  {MONTHS[d.date.getMonth()]}
                </div>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums px-2 py-0.5 rounded-full",
                      isSelected
                        ? "bg-white/20 text-primary-foreground"
                        : allDone
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {d.predicted}/{d.count}
                  </span>
                </div>
                {allDone && !isSelected && (
                  <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
