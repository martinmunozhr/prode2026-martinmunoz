import { Match, getTeam } from "@/lib/mock-data";
import { MapPin, Clock } from "lucide-react";
import { useState } from "react";

type Props = {
  match: Match;
  editable?: boolean;
  initialPrediction?: { home: number; away: number };
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) +
    " · " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export function MatchCard({ match, editable, initialPrediction }: Props) {
  const home = getTeam(match.homeId)!;
  const away = getTeam(match.awayId)!;
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  const [pred, setPred] = useState(initialPrediction ?? { home: 0, away: 0 });
  const [saved, setSaved] = useState(!!initialPrediction);

  return (
    <div className="group bg-gradient-card border border-border/50 rounded-2xl p-5 shadow-card-sport hover:shadow-elevated hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
      {/* Status badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
          {match.group && (
            <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
              Grupo {match.group}
            </span>
          )}
          <span className="text-muted-foreground/70">{match.stage}</span>
        </div>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-alert">
            <span className="h-2 w-2 rounded-full bg-alert animate-pulse" />
            En vivo
          </span>
        )}
        {isFinished && (
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Final</span>
        )}
      </div>

      {/* Teams + Score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-5xl leading-none">{home.flag}</div>
          <div className="font-display text-base md:text-lg tracking-wide leading-tight">{home.name}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{home.code}</div>
        </div>

        <div className="flex flex-col items-center gap-2 px-2">
          {isFinished ? (
            <div className="font-display text-4xl md:text-5xl tabular-nums text-primary">
              {match.homeScore} <span className="text-muted-foreground/50">-</span> {match.awayScore}
            </div>
          ) : editable ? (
            <div className="flex items-center gap-2">
              <ScoreInput value={pred.home} onChange={(v) => { setPred({ ...pred, home: v }); setSaved(false); }} />
              <span className="text-muted-foreground font-display text-2xl">:</span>
              <ScoreInput value={pred.away} onChange={(v) => { setPred({ ...pred, away: v }); setSaved(false); }} />
            </div>
          ) : (
            <div className="font-display text-3xl text-muted-foreground/70">VS</div>
          )}
          {!isFinished && (
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Clock className="h-3 w-3" />
              {fmtDate(match.date)}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-5xl leading-none">{away.flag}</div>
          <div className="font-display text-base md:text-lg tracking-wide leading-tight">{away.name}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{away.code}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          <span>{match.stadium} · {match.city}</span>
        </div>
        {editable && (
          <button
            onClick={() => setSaved(true)}
            disabled={saved}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider disabled:opacity-60 hover:scale-105 transition-transform"
          >
            {saved ? "Guardado ✓" : "Guardar"}
          </button>
        )}
      </div>
    </div>
  );
}

function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      value={value}
      onChange={(e) => onChange(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
      className="w-14 h-14 rounded-lg bg-input border border-border/50 text-center font-display text-3xl text-primary focus:outline-none focus:border-primary focus:shadow-glow-pitch transition-all tabular-nums"
    />
  );
}
