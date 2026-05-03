import { Match, getTeam } from "@/lib/mock-data";
import { Flag } from "@/components/flag";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Clock, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { getTeamPalette } from "@/lib/team-colors";

const STAGE_MULTIPLIER: Record<Match["stage"], number> = {
  Grupos: 1,
  Dieciseisavos: 1,
  Octavos: 1.5,
  Cuartos: 2,
  Semifinal: 2.5,
  "Tercer Puesto": 2,
  Final: 3,
};

const STAGE_TOOLTIP: Record<Match["stage"], string> = {
  Grupos: "Fase de grupos · puntos x1",
  Dieciseisavos: "Dieciseisavos · puntos x1",
  Octavos: "Octavos de final · cada acierto multiplica x1.5",
  Cuartos: "Cuartos de final · cada acierto multiplica x2",
  Semifinal: "Semifinal · cada acierto multiplica x2.5",
  "Tercer Puesto": "Partido por el 3er puesto · puntos x2",
  Final: "¡La gran final! Cada acierto multiplica x3",
};

type Props = {
  match: Match;
  editable?: boolean;
  initialPrediction?: { home: number; away: number } | null;
  onSave?: (home: number, away: number) => Promise<void> | void;
};

// Show match date in the user's local timezone (most users in AR/UY/CL).
function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function MatchCard({ match, editable, initialPrediction, onSave }: Props) {
  const home = getTeam(match.homeId) ?? {
    id: match.homeId,
    name: "Por definir",
    code: "TBD",
    flag: "⏳",
    group: "?",
    confederation: "OFC" as const,
  };
  const away = getTeam(match.awayId) ?? {
    id: match.awayId,
    name: "Por definir",
    code: "TBD",
    flag: "⏳",
    group: "?",
    confederation: "OFC" as const,
  };
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";
  const isTbd = match.homeId === "tbd" || match.awayId === "tbd";

  const [pred, setPred] = useState(initialPrediction ?? { home: 0, away: 0 });
  const [saved, setSaved] = useState(!!initialPrediction);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialPrediction) {
      setPred(initialPrediction);
      setSaved(true);
    }
  }, [initialPrediction?.home, initialPrediction?.away]);

  const handleSave = async () => {
    if (saving) return;
    if (onSave) {
      setSaving(true);
      try {
        await onSave(pred.home, pred.away);
        setSaved(true);
      } finally {
        setSaving(false);
      }
    } else {
      setSaved(true);
    }
  };

  const homePal = getTeamPalette(home.id);
  const awayPal = getTeamPalette(away.id);

  return (
    <div className="group bg-gradient-card border border-border/50 rounded-2xl p-5 shadow-card-sport hover:shadow-elevated hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
      {/* Team color accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] opacity-80"
        style={{
          background: `linear-gradient(90deg, ${homePal.color} 0%, ${homePal.color} 48%, transparent 50%, ${awayPal.color} 52%, ${awayPal.color} 100%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full blur-3xl opacity-15 group-hover:opacity-25 transition-opacity"
        style={{ background: homePal.color }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full blur-3xl opacity-15 group-hover:opacity-25 transition-opacity"
        style={{ background: awayPal.color }}
      />
      {/* Status badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
          {match.group && (
            <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
              Grupo {match.group}
            </span>
          )}
          <span className="text-muted-foreground/70">{match.stage}</span>
          {STAGE_MULTIPLIER[match.stage] > 1 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={STAGE_TOOLTIP[match.stage]}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/15 border border-accent/40 text-accent text-[10px] font-bold hover:bg-accent/25 focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-help"
                >
                  <Zap className="h-2.5 w-2.5" />x{STAGE_MULTIPLIER[match.stage]}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-center">
                {STAGE_TOOLTIP[match.stage]}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-alert">
            <span className="h-2 w-2 rounded-full bg-alert animate-pulse" />
            En vivo
          </span>
        )}
        {isFinished && (
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Final
          </span>
        )}
      </div>

      {/* Teams + Score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <Flag teamId={home.id} className="text-5xl" />
          <div className="font-display text-base md:text-lg tracking-wide leading-tight">
            {home.name}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {home.code}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 px-2">
          {isFinished ? (
            <div className="font-display text-4xl md:text-5xl tabular-nums text-primary">
              {match.homeScore} <span className="text-muted-foreground/50">-</span>{" "}
              {match.awayScore}
            </div>
          ) : editable && !isTbd ? (
            <div className="flex items-center gap-2">
              <ScoreInput
                label={`Goles ${home.name}`}
                value={pred.home}
                onChange={(v) => {
                  setPred({ ...pred, home: v });
                  setSaved(false);
                }}
              />
              <span className="text-muted-foreground font-display text-2xl" aria-hidden>
                :
              </span>
              <ScoreInput
                label={`Goles ${away.name}`}
                value={pred.away}
                onChange={(v) => {
                  setPred({ ...pred, away: v });
                  setSaved(false);
                }}
              />
            </div>
          ) : (
            <div className="font-display text-3xl text-muted-foreground/70">
              {isTbd ? "TBD" : "VS"}
            </div>
          )}
          {!isFinished && (
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span suppressHydrationWarning>{mounted ? fmtDate(match.date) : ""}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <Flag teamId={away.id} className="text-5xl" />
          <div className="font-display text-base md:text-lg tracking-wide leading-tight">
            {away.name}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {away.code}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          <span>
            {match.stadium} · {match.city}
          </span>
        </div>
        {editable && !isTbd && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider disabled:opacity-60 hover:scale-105 transition-transform"
          >
            {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar"}
          </button>
        )}
      </div>
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={20}
      value={value}
      aria-label={label}
      onWheel={(e) => e.currentTarget.blur()}
      onKeyDown={(e) => {
        // arrow up/down already work; block "e" / "+" / "-" which can corrupt the value
        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
      }}
      onChange={(e) => onChange(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
      className="w-14 h-14 rounded-lg bg-input border border-border/50 text-center font-display text-3xl text-primary focus:outline-none focus:border-primary focus:shadow-glow-pitch transition-all tabular-nums"
    />
  );
}
