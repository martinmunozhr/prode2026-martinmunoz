import { createFileRoute, Link } from "@tanstack/react-router";
import { MatchCard } from "@/components/match-card";
import { GoalscorerPicker } from "@/components/goalscorer-picker";
import { getTeam, type Match } from "@/lib/mock-data";
import { calcMatchPoints } from "@/lib/scoring";
import { Target, Clock, Lock, LogIn, Info, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/mis-pronosticos")({
  head: () => ({
    meta: [
      { title: "Mis Pronósticos — Prode Mundial 2026" },
      { name: "description", content: "Cargá tus pronósticos para los próximos partidos del Mundial 2026." },
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

type PredRow = { match_id: string; home_score: number; away_score: number };

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
  const [preds, setPreds] = useState<Record<string, { home: number; away: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: ms } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });

      let predMap: Record<string, { home: number; away: number }> = {};
      if (user) {
        const { data: ps } = await supabase
          .from("predictions")
          .select("match_id, home_score, away_score")
          .eq("user_id", user.id);
        (ps as PredRow[] | null)?.forEach((p) => {
          predMap[p.match_id] = { home: p.home_score, away: p.away_score };
        });
      }

      if (!active) return;
      setMatches(((ms as DbMatch[] | null) ?? []).map(dbToMatch));
      setPreds(predMap);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user, authLoading]);

  const savePrediction = async (matchId: string, home: number, away: number) => {
    if (!user) return;
    const { error } = await supabase
      .from("predictions")
      .upsert(
        { user_id: user.id, match_id: matchId, home_score: home, away_score: away },
        { onConflict: "user_id,match_id" }
      );
    if (error) {
      toast.error("No se pudo guardar: " + error.message);
      throw error;
    }
    setPreds((p) => ({ ...p, [matchId]: { home, away } }));
    toast.success("Pronóstico guardado");
  };

  // Filtrar partidos con equipos TBD (fase final aún por definir)
  const playable = matches.filter((m) => m.homeId !== "tbd" && m.awayId !== "tbd");
  const pending = playable.filter((m) => m.status === "scheduled");
  const finished = playable.filter((m) => m.status === "finished");
  const myCount = Object.keys(preds).length;

  const totalPoints = useMemo(() => {
    let pts = 0;
    finished.forEach((m) => {
      const p = preds[m.id];
      if (!p || m.homeScore == null || m.awayScore == null) return;
      pts += calcMatchPoints({ home: p.home, away: p.away }, { home: m.homeScore, away: m.awayScore }, m.stage);
    });
    return Math.round(pts);
  }, [finished, preds]);

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
            <div key={i} className="h-24 rounded-xl bg-gradient-card border border-border/50 animate-pulse" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-gradient-card border border-border/50 animate-pulse" />
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
          <p className="mt-3 text-muted-foreground">Necesitás una cuenta para cargar y guardar tus pronósticos.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/login" className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold uppercase tracking-wider">Ingresar</Link>
            <Link to="/registro" className="px-5 py-2.5 rounded-xl bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch">Sumate gratis</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Tu juego</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Mis Pronósticos</h1>
        <p className="mt-2 text-muted-foreground">Cargá tus marcadores antes del inicio de cada partido.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard icon={<Target />} value={String(myCount)} label="Cargados" tone="primary" />
        <StatCard icon={<Clock />} value={String(pending.length)} label="Pendientes" tone="accent" />
        <StatCard icon={<Lock />} value={String(finished.length)} label="Cerrados" tone="muted" />
        <StatCard icon={<Target />} value={String(totalPoints)} label="Puntos totales" tone="primary" />
      </div>

      <InfoBanner />

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-5 w-5 text-accent" />
          <h2 className="font-display text-2xl tracking-wider">Pendientes</h2>
          <span className="ml-auto text-xs text-muted-foreground">{pending.length} partidos</span>
        </div>
        {pending.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-border/40 rounded-xl p-6 text-center">
            No hay partidos pendientes ahora mismo.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pending.map((m) => {
              const home = getTeam(m.homeId);
              const away = getTeam(m.awayId);
              const pred = preds[m.id];
              return (
                <div key={m.id} className="space-y-0">
                  <MatchCard
                    match={m}
                    editable
                    initialPrediction={pred ?? null}
                    onSave={(h, a) => savePrediction(m.id, h, a)}
                  />
                  {pred && home && away && (
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
                  )}
                </div>
              );
            })}
          </div>
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
          <div className="text-[11px] uppercase tracking-widest font-bold text-primary">Cómo se juega</div>
          <h3 className="font-display text-xl mt-0.5">Reglas en 30 segundos</h3>
          <ul className="mt-3 grid md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            <li>✅ <strong>1 punto</strong> si acertás el resultado (ganador o empate)</li>
            <li>🎯 <strong>3 puntos</strong> si acertás el marcador exacto</li>
            <li>⚽ <strong>+1 extra</strong> por cada goleador acertado (opcional)</li>
            <li>🔥 <strong>Multiplica</strong> en mata-mata: x1.5 a x3 en la Final</li>
          </ul>
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


function StatCard({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: "primary" | "accent" | "muted" }) {
  const colors = {
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-muted-foreground",
  };
  return (
    <div className="bg-gradient-card border border-border/50 rounded-xl p-4 shadow-card-sport">
      <div className={colors[tone]}>{icon}</div>
      <div className="font-display text-3xl mt-2 tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
