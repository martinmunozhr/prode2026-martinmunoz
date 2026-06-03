// Live data layer that bridges Supabase to the existing mock-data shapes.
// This keeps existing components working while the source of truth is the DB.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  matches as catalogMatches,
  teams as catalogTeams,
  getRoster,
  isRealRoster,
  type Match,
  type Player,
  type RankingEntry,
  type Team,
} from "@/lib/mock-data";
import { getHomeBootstrap } from "@/lib/home.functions";

type DbMatchRow = {
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

function dbRowToMatch(m: DbMatchRow): Match {
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

// Lee TODOS los matches desde Supabase (fixture + scores). Si la tabla esta vacia,
// usa el catalogo del mock como fallback para que la pagina nunca se rompa.
export function useLiveMatches(): { matches: Match[]; loading: boolean } {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(
          "id, home_id, away_id, match_date, stadium, city, stage, group_letter, home_score, away_score, status",
        );
      if (cancelled) return;
      const rows = (data as DbMatchRow[] | null) ?? [];
      if (error || rows.length === 0) {
        setMatches(catalogMatches);
        setLoading(false);
        return;
      }
      setMatches(rows.map(dbRowToMatch));
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel("matches-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, []);

  return { matches, loading };
}

export function useUpcomingLiveMatches(limit = 5): { matches: Match[]; loading: boolean } {
  const { matches, loading } = useLiveMatches();
  const now = Date.now();
  const upcoming = matches
    .filter((m) => m.status !== "finished" && new Date(m.date).getTime() > now - 3 * 3600_000)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
  return { matches: upcoming, loading };
}

// Public ranking: aggregate predictions points + crystal ball points by user.
export type LiveRankingEntry = RankingEntry & { userId: string };

export function useLiveRanking(): { ranking: LiveRankingEntry[]; loading: boolean } {
  const [data, setData] = useState<LiveRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [profilesRes, predsRes, cbRes, gspRes] = await Promise.all([
        supabase.from("profiles").select("id, username, avatar_color, favorite_team_id"),
        supabase
          .from("predictions")
          .select("user_id, points_earned, home_score, away_score, match_id"),
        supabase.from("crystal_ball").select("user_id, points_earned"),
        supabase.from("goalscorer_predictions").select("user_id, points_earned"),
      ]);

      if (cancelled) return;
      const profiles = profilesRes.data ?? [];
      const preds = predsRes.data ?? [];
      const cbs = cbRes.data ?? [];
      const gsps = gspRes.data ?? [];

      // Resolve match outcomes for exact/partial counters
      const { data: finishedMatches } = await supabase
        .from("matches")
        .select("id, home_score, away_score")
        .eq("status", "finished");
      const fmap = new Map<string, { h: number; a: number }>();
      for (const m of finishedMatches ?? []) {
        if (m.home_score !== null && m.away_score !== null)
          fmap.set(m.id, { h: m.home_score, a: m.away_score });
      }

      const stats = new Map<string, { points: number; exact: number; partial: number }>();
      for (const p of preds) {
        const cur = stats.get(p.user_id) ?? { points: 0, exact: 0, partial: 0 };
        cur.points += p.points_earned ?? 0;
        const real = fmap.get(p.match_id);
        if (real) {
          if (p.home_score === real.h && p.away_score === real.a) cur.exact++;
          else {
            const po = p.home_score > p.away_score ? "H" : p.home_score < p.away_score ? "A" : "D";
            const ro = real.h > real.a ? "H" : real.h < real.a ? "A" : "D";
            if (po === ro) cur.partial++;
          }
        }
        stats.set(p.user_id, cur);
      }
      for (const c of cbs) {
        const cur = stats.get(c.user_id) ?? { points: 0, exact: 0, partial: 0 };
        cur.points += c.points_earned ?? 0;
        stats.set(c.user_id, cur);
      }
      for (const g of gsps) {
        const cur = stats.get(g.user_id) ?? { points: 0, exact: 0, partial: 0 };
        cur.points += g.points_earned ?? 0;
        stats.set(g.user_id, cur);
      }

      const teamFlag = new Map(catalogTeams.map((t) => [t.id, t.flag]));

      const rows: LiveRankingEntry[] = profiles.map((p) => {
        const s = stats.get(p.id) ?? { points: 0, exact: 0, partial: 0 };
        return {
          userId: p.id,
          position: 0, // assigned after sort
          username: p.username ?? "Anónimo",
          avatar: (p.favorite_team_id && teamFlag.get(p.favorite_team_id)) || "⚽",
          points: s.points,
          exact: s.exact,
          partial: s.partial,
          streak: 0,
        };
      });
      rows.sort((a, b) => b.points - a.points || b.exact - a.exact);
      rows.forEach((r, i) => (r.position = i + 1));

      setData(rows);
      setLoading(false);
    };
    load();

    // Realtime: re-aggregate on any score-affecting change
    const ch = supabase
      .channel("ranking-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "predictions" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "crystal_ball" }, load)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goalscorer_predictions" },
        load,
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, []);

  return { ranking: data, loading };
}

// Lightweight hook for the home page: a single server function call returns
// pre-aggregated top 10 + match scores. No realtime, no big payloads on mobile.
export function useHomeBootstrap(): {
  topRanking: LiveRankingEntry[];
  upcoming: Match[];
  loading: boolean;
} {
  const [state, setState] = useState<{
    topRanking: LiveRankingEntry[];
    upcoming: Match[];
    loading: boolean;
  }>({ topRanking: [], upcoming: [], loading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bootstrap, matchesRes] = await Promise.all([
          getHomeBootstrap(),
          supabase
            .from("matches")
            .select(
              "id, home_id, away_id, match_date, stadium, city, stage, group_letter, home_score, away_score, status",
            ),
        ]);
        if (cancelled) return;

        const teamFlag = new Map(catalogTeams.map((t) => [t.id, t.flag]));
        const ranking: LiveRankingEntry[] = bootstrap.topRanking.map((r) => ({
          userId: r.userId,
          position: r.position,
          username: r.username,
          avatar: (r.favoriteTeamId && teamFlag.get(r.favoriteTeamId)) || "⚽",
          points: r.points,
          exact: r.exact,
          partial: r.partial,
          streak: 0,
        }));

        const dbRows = (matchesRes.data as DbMatchRow[] | null) ?? [];
        const allMatches = dbRows.length > 0 ? dbRows.map(dbRowToMatch) : catalogMatches;

        const now = Date.now();
        const upcoming = allMatches
          .filter(
            (m) =>
              m.homeId !== "tbd" &&
              m.awayId !== "tbd" &&
              m.status !== "finished" &&
              new Date(m.date).getTime() > now - 3 * 3600_000,
          )
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);

        setState({ topRanking: ranking, upcoming, loading: false });
      } catch {
        if (!cancelled) setState({ topRanking: [], upcoming: [], loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// Catalogo de selecciones desde Supabase con fallback al mock.
// Util para la pagina de Equipos: si la tabla `teams` esta poblada manda DB,
// si no usa el catalogo estatico para que la pagina nunca se rompa.
export function useTeamsCatalog(): { teams: Team[]; loading: boolean } {
  const [teams, setTeams] = useState<Team[]>(catalogTeams);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, code, flag, group_letter, confederation")
        .neq("id", "tbd");
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setLoading(false);
        return;
      }
      setTeams(
        data.map((r) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          flag: r.flag,
          group: r.group_letter,
          confederation: r.confederation as Team["confederation"],
        })),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { teams, loading };
}

function mapDbPosition(dbPos: string | null | undefined): Player["position"] {
  const p = (dbPos ?? "").toUpperCase();
  if (p === "GK" || p === "POR") return "POR";
  if (p === "DEF") return "DEF";
  if (p === "MID" || p === "MED") return "MED";
  if (p === "FWD" || p === "DEL") return "DEL";
  return "MED";
}

function rarityFromIndex(idx: number): Player["rarity"] {
  if (idx === 9 || idx === 19) return "legendary";
  if (idx < 3) return "epic";
  if (idx % 7 === 0) return "rare";
  return "common";
}

// Roster desde Supabase con fallback al mock.
// Si la tabla `players` tiene jugadores cargados para el equipo, manda DB;
// si esta vacia usa getRoster(teamId) del mock para que el album nunca quede en blanco.
export function useTeamRoster(teamId: string): {
  roster: Player[];
  isReal: boolean;
  loading: boolean;
} {
  const [state, setState] = useState<{
    roster: Player[];
    isReal: boolean;
    loading: boolean;
  }>({
    roster: getRoster(teamId),
    isReal: isRealRoster(teamId),
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, position, jersey_number, club, rarity, image_url")
        .eq("team_id", teamId)
        .order("jersey_number", { ascending: true });
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setState({
          roster: getRoster(teamId),
          isReal: isRealRoster(teamId),
          loading: false,
        });
        return;
      }
      const dbRarityMap: Record<string, Player["rarity"]> = {
        legendario: "legendary", epico: "epic", raro: "rare", comun: "common",
      };
      const mapped: Player[] = data.map((r, i) => ({
        id: r.id,
        name: r.name,
        number: r.jersey_number ?? i + 1,
        position: mapDbPosition(r.position),
        age: 0,
        club: r.club ?? "—",
        rarity: dbRarityMap[r.rarity ?? ""] ?? rarityFromIndex(i),
        imageUrl: r.image_url ?? undefined,
      }));
      setState({ roster: mapped, isReal: true, loading: false });
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  return state;
}
