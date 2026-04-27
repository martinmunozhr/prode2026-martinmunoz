import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { predictMatch } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Flag } from "@/components/flag";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/predictor")({
  component: AdminPredictor,
});

type Team = { id: string; name: string; flag: string; code: string };
type Match = {
  id: string;
  home_id: string;
  away_id: string;
  match_date: string;
  stage: string;
  status: string;
};
type Pred = { home_score: number; away_score: number; probability: number };
type Ranking = { team_id: string; elo_rating: number; matches_played: number };

function AdminPredictor() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [preds, setPreds] = useState<Pred[]>([]);
  const [loading, setLoading] = useState(false);
  const predFn = useServerFn(predictMatch);

  useEffect(() => {
    (async () => {
      const [t, m, r] = await Promise.all([
        supabase.from("teams").select("id, name, flag, code").order("name"),
        supabase
          .from("matches")
          .select("id, home_id, away_id, match_date, stage, status")
          .eq("status", "scheduled")
          .order("match_date")
          .limit(20),
        supabase
          .from("power_rankings")
          .select("team_id, elo_rating, matches_played")
          .order("elo_rating", { ascending: false }),
      ]);
      setTeams(t.data ?? []);
      setMatches(m.data ?? []);
      setRankings((r.data as Ranking[] | null) ?? []);
    })();
  }, []);

  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const run = async (h: string, a: string) => {
    if (!h || !a || h === a) return;
    setHome(h);
    setAway(a);
    setLoading(true);
    try {
      const r = await predFn({ data: { homeId: h, awayId: a } });
      setPreds(r.predictions as Pred[]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-bold uppercase tracking-wider">
            Resultados más probables (ELO + Poisson)
          </h3>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={home}
            onChange={(e) => run(e.target.value, away)}
            className="rounded-md bg-muted/40 px-3 py-2"
          >
            <option value="">Local...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={away}
            onChange={(e) => run(home, e.target.value)}
            className="rounded-md bg-muted/40 px-3 py-2"
          >
            <option value="">Visitante...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => run(home, away)}
            disabled={!home || !away || loading}
            className="rounded-md bg-gradient-pitch px-4 py-2 text-primary-foreground font-bold uppercase tracking-wider text-sm disabled:opacity-50"
          >
            {loading ? "Calculando..." : "Predecir"}
          </button>
        </div>

        {preds.length > 0 && (
          <div className="mt-5 grid gap-2 md:grid-cols-5">
            {preds.map((p, i) => (
              <div
                key={i}
                className={`rounded-lg border p-4 text-center ${i === 0 ? "border-primary bg-primary/10" : "border-border/40 bg-muted/20"}`}
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  #{i + 1}
                </div>
                <div className="font-display text-3xl tracking-wider mt-1">
                  {p.home_score} - {p.away_score}
                </div>
                <div className="mt-1 text-xs font-mono text-primary">
                  {(p.probability * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/40 p-5">
          <h3 className="font-bold uppercase tracking-wider mb-3">
            Próximos partidos (clic para predecir)
          </h3>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {matches.map((m) => (
              <button
                key={m.id}
                onClick={() => run(m.home_id, m.away_id)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted/30 text-left"
              >
                <Flag iso2={teamMap.get(m.home_id)?.flag ?? ""} className="h-4 w-6" />
                <span className="text-sm flex-1">{teamMap.get(m.home_id)?.name}</span>
                <span className="text-xs text-muted-foreground">vs</span>
                <span className="text-sm flex-1 text-right">{teamMap.get(m.away_id)?.name}</span>
                <Flag iso2={teamMap.get(m.away_id)?.flag ?? ""} className="h-4 w-6" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 p-5">
          <h3 className="font-bold uppercase tracking-wider mb-3">Top 16 ELO</h3>
          <div className="space-y-1">
            {rankings.slice(0, 16).map((r, i) => {
              const t = teamMap.get(r.team_id);
              return (
                <div key={r.team_id} className="flex items-center gap-2 px-2 py-1.5">
                  <span className="w-5 text-xs font-mono text-muted-foreground">#{i + 1}</span>
                  {t && <Flag iso2={t.flag} className="h-4 w-6" />}
                  <span className="text-sm flex-1">{t?.name ?? r.team_id}</span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {Math.round(Number(r.elo_rating))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
