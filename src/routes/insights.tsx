import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { computeInsights, type UserInsights, type UserPrediction } from "@/lib/insights";
import { teams, type Match } from "@/lib/mock-data";
import { Flag } from "@/components/flag";
import { Activity, Target, TrendingUp, Flame, LogIn } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Radiografía del Prode — Insights" },
      {
        name: "description",
        content:
          "Análisis de tus pronósticos: aciertos exactos, parciales, racha y equipos que más prediciste.",
      },
    ],
  }),
  component: InsightsPage,
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

function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const [{ data: ms }, { data: ps }] = await Promise.all([
        supabase.from("matches").select("*"),
        supabase
          .from("predictions")
          .select("match_id, home_score, away_score")
          .eq("user_id", user.id),
      ]);
      if (!active) return;
      const matchesById: Record<string, Match> = {};
      ((ms as DbMatch[] | null) ?? []).forEach((m) => {
        matchesById[m.id] = dbToMatch(m);
      });
      setInsights(computeInsights((ps as UserPrediction[] | null) ?? [], matchesById));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8">
          <div className="h-3 w-24 bg-primary/20 rounded animate-pulse" />
          <div className="h-12 w-72 bg-muted/40 rounded mt-3 animate-pulse" />
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-gradient-card border border-border/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center bg-gradient-card border border-border/50 rounded-3xl p-10">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-pitch flex items-center justify-center shadow-glow-pitch mb-5">
            <LogIn className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl tracking-tight">Ingresá para ver tus insights</h1>
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
              Sumate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">
          Tus números
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Tus estadísticas</h1>
        <p className="mt-2 text-muted-foreground">Cómo venís en el prode hasta ahora.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat
          icon={<Target />}
          value={String(insights.totalPoints)}
          label="Puntos totales"
          tone="primary"
        />
        <Stat
          icon={<Activity />}
          value={String(insights.totalPreds)}
          label="Pronósticos"
          tone="accent"
        />
        <Stat
          icon={<Flame />}
          value={String(insights.currentStreak)}
          label="Aciertos seguidos"
          tone="primary"
        />
        <Stat
          icon={<TrendingUp />}
          value={String(insights.bestStreak)}
          label="Mejor racha de aciertos"
          tone="accent"
        />
      </div>

      <section className="mb-10 bg-gradient-card border border-border/50 rounded-2xl p-6">
        <h2 className="font-display text-xl tracking-wider mb-5">
          Precisión sobre {insights.finishedPreds} partidos cerrados
        </h2>
        <Bar
          label="Marcador exacto"
          pct={insights.exactPct}
          count={insights.exact}
          color="bg-pitch"
        />
        <Bar
          label="Resultado parcial"
          pct={insights.partialPct}
          count={insights.partial}
          color="bg-primary"
        />
        <Bar
          label="Errados"
          pct={insights.finishedPreds ? (insights.miss / insights.finishedPreds) * 100 : 0}
          count={insights.miss}
          color="bg-muted"
        />
      </section>

      <section className="bg-gradient-card border border-border/50 rounded-2xl p-6">
        <h2 className="font-display text-xl tracking-wider mb-4">Equipos que más vés ganando</h2>
        {insights.topTeamsPicked.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Cargá pronósticos para ver tus tendencias.
          </p>
        ) : (
          <div className="space-y-2">
            {insights.topTeamsPicked.map((t) => {
              const team = teams.find((x) => x.id === t.teamId);
              if (!team) return null;
              return (
                <div
                  key={t.teamId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30"
                >
                  <Flag teamId={team.id} className="text-3xl" />
                  <div className="font-display text-base tracking-wide flex-1">{team.name}</div>
                  <div className="font-display text-2xl tabular-nums text-primary">{t.count}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    veces
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: "primary" | "accent";
}) {
  const c = tone === "primary" ? "text-primary" : "text-accent";
  return (
    <div className="bg-gradient-card border border-border/50 rounded-xl p-4">
      <div className={c}>{icon}</div>
      <div className="font-display text-3xl mt-2 tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function Bar({
  label,
  pct,
  count,
  color,
}: {
  label: string;
  pct: number;
  count: number;
  color: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground uppercase tracking-wider font-semibold">
          {label}
        </span>
        <span className="font-display text-sm tabular-nums">
          {count} · {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-background/60 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
