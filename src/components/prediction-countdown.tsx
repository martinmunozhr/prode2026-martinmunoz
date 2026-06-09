import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Cuenta el tiempo que queda para pronosticar un partido (hasta el kickoff).
// variant "hero" = tiles grandes D/H/M/S. variant "inline" = pill compacto para la card.

type Parts = { total: number; days: number; hours: number; minutes: number; seconds: number };

function diff(targetMs: number, now: number): Parts {
  const d = Math.max(0, targetMs - now);
  return {
    total: d,
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    minutes: Math.floor((d % 3600000) / 60000),
    seconds: Math.floor((d % 60000) / 1000),
  };
}

type Urgency = "calm" | "soon" | "urgent";
function urgencyOf(ms: number): Urgency {
  if (ms <= 2 * 3600000) return "urgent"; // menos de 2 horas
  if (ms <= 24 * 3600000) return "soon"; // menos de 1 día
  return "calm";
}

function usePartsTo(targetIso: string) {
  const targetMs = new Date(targetIso).getTime();
  const [parts, setParts] = useState<Parts>({
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setParts(diff(targetMs, Date.now()));
    const i = setInterval(() => setParts(diff(targetMs, Date.now())), 1000);
    return () => clearInterval(i);
  }, [targetMs]);
  return { parts, mounted };
}

/** Texto corto y claro del tiempo restante. */
function shortText(p: Parts) {
  if (p.days > 0) return `${p.days}d ${p.hours}h ${String(p.minutes).padStart(2, "0")}m`;
  if (p.hours > 0)
    return `${p.hours}h ${String(p.minutes).padStart(2, "0")}m ${String(p.seconds).padStart(2, "0")}s`;
  return `${p.minutes}m ${String(p.seconds).padStart(2, "0")}s`;
}

const URGENCY_INLINE: Record<Urgency, string> = {
  calm: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
  soon: "bg-amber-500/15 border-amber-500/40 text-amber-400",
  urgent: "bg-alert/15 border-alert/50 text-alert",
};

/** Pill compacto para mostrar dentro de la card del partido. */
export function PredictionCountdownInline({ target }: { target: string }) {
  const { parts, mounted } = usePartsTo(target);
  const u = urgencyOf(parts.total);
  return (
    <span
      suppressHydrationWarning
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold tabular-nums",
        URGENCY_INLINE[u],
        u === "urgent" && "animate-pulse",
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {mounted ? `Cierra en ${shortText(parts)}` : "Cierra pronto"}
    </span>
  );
}

const URGENCY_HERO: Record<Urgency, { tile: string; num: string }> = {
  calm: { tile: "border-emerald-500/30", num: "text-emerald-400" },
  soon: { tile: "border-amber-500/30", num: "text-amber-400" },
  urgent: { tile: "border-alert/40", num: "text-alert" },
};

/** Tiles grandes D/H/M/S para el hero del próximo partido que cierra. */
export function PredictionCountdownHero({ target }: { target: string }) {
  const { parts, mounted } = usePartsTo(target);
  const u = urgencyOf(parts.total);
  const style = URGENCY_HERO[u];
  const tiles = [
    { label: "Días", value: parts.days },
    { label: "Horas", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Seg", value: parts.seconds },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3" suppressHydrationWarning>
      {tiles.map((it) => (
        <div
          key={it.label}
          className={cn(
            "rounded-xl border bg-card/60 p-2.5 md:p-4 text-center relative overflow-hidden",
            style.tile,
            u === "urgent" && "animate-pulse",
          )}
        >
          <div
            className={cn("font-display text-3xl md:text-5xl leading-none tabular-nums", style.num)}
          >
            {mounted ? String(it.value).padStart(2, "0") : "--"}
          </div>
          <div className="mt-1 text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
