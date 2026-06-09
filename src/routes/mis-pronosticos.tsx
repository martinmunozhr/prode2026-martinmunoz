import { createFileRoute, Link } from "@tanstack/react-router";
import { MatchCard } from "@/components/match-card";
import { GoalscorerPicker } from "@/components/goalscorer-picker";
import { DayPickerStrip, dayKey, type DayBucket } from "@/components/day-picker-strip";
import { PredictionCountdownHero } from "@/components/prediction-countdown";
import { Flag } from "@/components/flag";
import { getTeam, type Match } from "@/lib/mock-data";
import { calcMatchPoints } from "@/lib/scoring";
import { getMatchPredState } from "@/lib/pred-window";
import { usePredictions } from "@/hooks/use-predictions";
import {
  Target,
  Clock,
  Lock,
  LogIn,
  Info,
  Trophy,
  CalendarDays,
  AlarmClock,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mis-pronosticos")({
  head: () => ({
    meta: [
      { title: "Mis Pronósticos — Prode Mundial 2026" },
      {
        name: "description",
        content: "Cargá tus pronósticos para los próximos partidos del Mundial 2026.",
      },
      { property: "og:title", content: "Mis Pronósticos" },
      { property: "og:description", content: "Tu panel de pronósticos del Mundial 2026." },
    ],
  }),
  component: MisPronosticosPage,
});

type DbMatch = {
  id: string;
  home_id: string;
  away_id: string;
  match_date: string;
  stadium: string;
  city: string;
  stage: string;
  group_letter: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
};

function dbToMatch(m: DbMatch): Match {
  return {
    id: m.id,
    homeId: m.home_id,
    awayId: m.away_id,
    date: m.match_date,
    stadium: m.stadium,
    city: m.city,
    stage: m.stage as Match["stage"],
    group: m.group_letter ?? undefined,
    homeScore: m.home_score ?? undefined,
    awayScore: m.away_score ?? undefined,
    status: m.status as Match["status"],
  };
}

function MisPronosticosPage() {
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { preds, savePrediction } = usePredictions();

  // Reloj que avanza para reclasificar partidos (future → open → locked) sin recargar.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: ms } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });
      if (!active) return;
      setMatches(((ms as DbMatch[] | null) ?? []).map(dbToMatch));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  // Filtrar partidos con equipos TBD (fase final aún por definir)
  const playable = matches.filter((m) => m.homeId !== "tbd" && m.awayId !== "tbd");
  // upcoming includes both scheduled and live matches (not yet finished)
  const upcoming = playable.filter((m) => m.status !== "finished");
  const finished = playable.filter((m) => m.status === "finished");
  const myCount = Object.keys(preds).length;

  const todayKey = useMemo(() => {
    const now = new Date();
    return dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  // Agrupar pendientes por día
  const dayBuckets = useMemo<DayBucket[]>(() => {
    const map = new Map<string, DayBucket>();
    upcoming.forEach((m) => {
      const d = new Date(m.date);
      const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const k = dayKey(local);
      const existing = map.get(k);
      const hasPred = !!preds[m.id];
      if (existing) {
        existing.count += 1;
        if (hasPred) existing.predicted += 1;
      } else {
        map.set(k, { key: k, date: local, count: 1, predicted: hasPred ? 1 : 0 });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [upcoming, preds]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Auto-seleccionar: preferir hoy si tiene partidos, luego primer día sin pronosticar, luego el primero
  useEffect(() => {
    if (dayBuckets.length === 0) {
      setSelectedDay(null);
      return;
    }
    if (selectedDay && dayBuckets.find((d) => d.key === selectedDay)) return;
    // Prefer today if it has matches
    if (dayBuckets.find((d) => d.key === todayKey)) {
      setSelectedDay(todayKey);
      return;
    }
    const firstUndone = dayBuckets.find((d) => d.predicted < d.count);
    setSelectedDay((firstUndone ?? dayBuckets[0]).key);
  }, [dayBuckets, selectedDay, todayKey]);

  const dayMatches = useMemo(() => {
    if (!selectedDay) return [];
    return upcoming.filter((m) => {
      const d = new Date(m.date);
      return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate())) === selectedDay;
    });
  }, [upcoming, selectedDay]);

  const totalPoints = useMemo(() => {
    let pts = 0;
    finished.forEach((m) => {
      const p = preds[m.id];
      if (!p || m.homeScore == null || m.awayScore == null) return;
      pts += calcMatchPoints(
        { home: p.home, away: p.away },
        { home: m.homeScore, away: m.awayScore },
        m.stage,
      );
    });
    return Math.round(pts);
  }, [finished, preds]);

  // Partidos abiertos ahora (ventana de 48h hasta el kickoff) y su progreso.
  const openMatches = useMemo(
    () => upcoming.filter((m) => getMatchPredState(m, nowMs) === "open"),
    [upcoming, nowMs],
  );
  const nextClosing = useMemo(
    () =>
      openMatches
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null,
    [openMatches],
  );
  const openPredicted = useMemo(
    () => openMatches.filter((m) => preds[m.id]).length,
    [openMatches, preds],
  );

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8">
          <div className="h-3 w-24 bg-primary/20 rounded animate-pulse" />
          <div className="h-12 w-72 bg-muted/40 rounded mt-3 animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-muted/30 rounded mt-3 animate-pulse" />
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-gradient-card border border-border/50 animate-pulse"
            />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-gradient-card border border-border/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center bg-gradient-card border border-border/50 rounded-3xl p-10 shadow-elevated">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-pitch flex items-center justify-center shadow-glow-pitch mb-5">
            <LogIn className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl tracking-tight">Ingresá para pronosticar</h1>
          <p className="mt-3 text-muted-foreground">
            Necesitás una cuenta para cargar y guardar tus pronósticos.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold uppercase tracking-wider"
            >
              Ingresar
            </Link>
            <Link
              to="/registro"
              className="px-5 py-2.5 rounded-xl bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch"
            >
              Sumate gratis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-wide text-primary font-bold">Tu juego</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Mis Pronósticos</h1>
        <p className="mt-2 text-muted-foreground">
          Cargá tus marcadores antes del inicio de cada partido.
        </p>
      </header>

      {nextClosing && (
        <NextClosingHero
          match={nextClosing}
          predicted={!!preds[nextClosing.id]}
          onGo={() => {
            const d = new Date(nextClosing.date);
            setSelectedDay(dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate())));
          }}
        />
      )}

      {openMatches.length > 0 && (
        <PredictionProgress done={openPredicted} total={openMatches.length} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard icon={<Target />} value={String(myCount)} label="Cargados" tone="primary" />
        <StatCard
          icon={<Clock />}
          value={String(upcoming.length)}
          label="Por jugar"
          tone="accent"
        />
        <StatCard icon={<Lock />} value={String(finished.length)} label="Cerrados" tone="muted" />
        <StatCard
          icon={<Target />}
          value={String(totalPoints)}
          label="Puntos totales"
          tone="primary"
        />
      </div>

      <InfoBanner />

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="h-5 w-5 text-accent" />
          <h2 className="font-display text-2xl tracking-wider">Por jornada</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {upcoming.length} partidos en {dayBuckets.length}{" "}
            {dayBuckets.length === 1 ? "día" : "días"}
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-gradient-card p-10 text-center">
            <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-display text-2xl tracking-wide">
              Todavía no hay partidos cargados
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              El fixture del Mundial 2026 se confirma tras el sorteo final. Apenas estén disponibles
              los partidos, vas a poder pronosticar día por día desde acá.
            </p>
            <Link
              to="/fixture"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-wider hover:border-primary/40"
            >
              Ver fixture
            </Link>
          </div>
        ) : (
          <>
            <DayPickerStrip
              days={dayBuckets}
              selected={selectedDay}
              onSelect={setSelectedDay}
              todayKey={todayKey}
            />

            {selectedDay && (
              <DayHeader
                dayKeyValue={selectedDay}
                count={dayMatches.length}
                isToday={selectedDay === todayKey}
              />
            )}

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {dayMatches.map((m) => {
                const home = getTeam(m.homeId);
                const away = getTeam(m.awayId);
                const pred = preds[m.id];
                const predStateValue = getMatchPredState(m, nowMs);
                return (
                  <div key={m.id} className="space-y-0">
                    <MatchCard
                      match={m}
                      predState={predStateValue}
                      initialPrediction={pred ?? null}
                      onSave={
                        predStateValue === "open" ? (h, a) => savePrediction(m.id, h, a) : undefined
                      }
                    />
                    {home &&
                      away &&
                      predStateValue === "open" &&
                      (pred ? (
                        <GoalscorerPicker
                          matchId={m.id}
                          homeId={m.homeId}
                          awayId={m.awayId}
                          homeName={home.name}
                          awayName={away.name}
                          predHome={pred.home}
                          predAway={pred.away}
                          locked={false}
                        />
                      ) : (
                        <div className="mt-3 rounded-lg border border-dashed border-border/50 bg-secondary/20 px-3 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-accent shrink-0" />
                          <span>
                            Guardá el marcador para poder elegir <strong>goleadores</strong> y sumar{" "}
                            <strong>+1 punto extra</strong> por cada acierto.
                          </span>
                        </div>
                      ))}
                    {home && away && predStateValue === "locked" && pred && (
                      <GoalscorerPicker
                        matchId={m.id}
                        homeId={m.homeId}
                        awayId={m.awayId}
                        homeName={home.name}
                        awayName={away.name}
                        predHome={pred.home}
                        predAway={pred.away}
                        locked={true}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-display text-2xl tracking-wider">Ya jugados</h2>
          <span className="ml-auto text-xs text-muted-foreground">{finished.length} partidos</span>
        </div>
        {finished.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-border/40 rounded-xl p-6 text-center">
            Todavía no se jugaron partidos.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {finished.map((m) => (
              <MatchCard key={m.id} match={m} initialPrediction={preds[m.id] ?? null} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoBanner() {
  return (
    <div className="mb-8 rounded-2xl border border-border/50 bg-gradient-card p-5 shadow-card-sport">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide font-bold text-primary">
            Cómo se juega
          </div>
          <h3 className="font-display text-xl mt-0.5">Reglas en 30 segundos</h3>
          <ul className="mt-3 grid md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            <li>
              ✅ <strong>1 punto</strong> si acertás el resultado (ganador o empate)
            </li>
            <li>
              🎯 <strong>3 puntos</strong> si acertás el marcador exacto
            </li>
            <li>
              ⚽ <strong>+1 extra</strong> por cada goleador acertado (opcional)
            </li>
            <li>
              🔥 <strong>Multiplica</strong> en mata-mata: x1.5 a x3 en la Final
            </li>
          </ul>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-secondary/30 px-3 py-2.5 text-sm text-foreground/80">
            <span aria-hidden>⏰</span>
            <span>
              Cada partido se abre para pronosticar <strong>48hs antes</strong> de empezar y cierra
              al inicio. Los que todavía no se abren muestran una cuenta regresiva de cuándo vas a
              poder cargarlos.
            </span>
          </div>
          <Link
            to="/reglas"
            className="inline-flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
          >
            <Trophy className="h-3 w-3" /> Ver reglas completas
          </Link>
        </div>
      </div>
    </div>
  );
}

function NextClosingHero({
  match,
  predicted,
  onGo,
}: {
  match: Match;
  predicted: boolean;
  onGo: () => void;
}) {
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  return (
    <div className="mb-6 rounded-2xl border border-border/50 bg-gradient-card p-5 md:p-6 shadow-card-sport">
      <div className="flex items-center gap-2 mb-4">
        <AlarmClock className="h-4 w-4 text-accent" />
        <span className="text-xs uppercase tracking-widest font-bold text-accent">
          Próximo cierre
        </span>
        {predicted ? (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Ya pronosticado
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-amber-400">
            Todavía no lo pronosticaste
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <div className="flex w-24 flex-col items-center gap-1 text-center">
            <Flag teamId={home?.id ?? match.homeId} className="text-4xl" />
            <span className="font-display text-sm leading-tight tracking-wide">
              {home?.name ?? "Por definir"}
            </span>
          </div>
          <span className="font-display text-2xl text-muted-foreground/60">VS</span>
          <div className="flex w-24 flex-col items-center gap-1 text-center">
            <Flag teamId={away?.id ?? match.awayId} className="text-4xl" />
            <span className="font-display text-sm leading-tight tracking-wide">
              {away?.name ?? "Por definir"}
            </span>
          </div>
        </div>

        <div className="md:min-w-[280px]">
          <div className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground md:text-right">
            Tiempo para pronosticar
          </div>
          <PredictionCountdownHero target={match.date} />
        </div>
      </div>

      {!predicted && (
        <button
          onClick={onGo}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-pitch px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow-pitch transition-transform hover:scale-[1.02] md:w-auto"
        >
          <Target className="h-4 w-4" /> Pronosticar este partido
        </button>
      )}
    </div>
  );
}

function PredictionProgress({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = done >= total;
  const left = total - done;
  return (
    <div className="mb-8 rounded-2xl border border-border/50 bg-card/40 p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        {allDone ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (
          <AlarmClock className="h-5 w-5 text-amber-400" />
        )}
        <span className="text-sm font-bold">
          {allDone
            ? "¡Listo! Pronosticaste todos los partidos abiertos."
            : `Pronosticaste ${done} de ${total} partidos abiertos`}
        </span>
        {!allDone && (
          <span className="ml-auto text-xs font-bold uppercase tracking-wide text-amber-400">
            Te {left === 1 ? "falta" : "faltan"} {left}
          </span>
        )}
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${allDone ? "bg-emerald-500" : "bg-gradient-pitch"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DayHeader({
  dayKeyValue,
  count,
  isToday,
}: {
  dayKeyValue: string;
  count: number;
  isToday?: boolean;
}) {
  // dayKeyValue is "YYYY-MM-DD" — parse as local
  const [y, m, d] = dayKeyValue.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const formatted = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  // capitalize first letter
  const label = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return (
    <div className="mt-5 flex items-end justify-between gap-3 flex-wrap">
      <div>
        <div className="text-xs uppercase tracking-wide text-accent font-bold">Jornada</div>
        <h3 className="font-display text-2xl md:text-3xl tracking-tight flex items-center gap-1">
          {label}
          {isToday && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400 ml-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Hoy
            </span>
          )}
        </h3>
      </div>
      <div className="text-xs text-muted-foreground">
        {count} {count === 1 ? "partido" : "partidos"} para pronosticar
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: "primary" | "accent" | "muted";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "accent"
        ? "text-accent"
        : "text-muted-foreground";
  return (
    <div className="bg-gradient-card border border-border/50 rounded-xl p-4 shadow-card-sport">
      <div className={toneClass}>{icon}</div>
      <div className="font-display text-3xl mt-2 tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
