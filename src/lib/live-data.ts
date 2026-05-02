// Live data layer that bridges Supabase to the existing mock-data shapes.
// This keeps existing components working while the source of truth is the DB.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  matches as catalogMatches,
  teams as catalogTeams,
  type Match,
  type RankingEntry,
} from "@/lib/mock-data";
import { getHomeBootstrap } from "@/lib/home.functions";

type LiveScore = {
  home: number | null;
  away: number | null;
  status: "scheduled" | "live" | "finished";
};

// Load live scores keyed by match id from Supabase and merge with catalog matches.
export function useLiveMatches(): { matches: Match[]; loading: boolean } {
  const [scores, setScores] = useState<Map<string, LiveScore>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("matches").select("id, home_score, away_score, status");
      if (cancelled) return;
      const map = new Map<string, LiveScore>();
      for (const m of data ?? [])
        map.set(m.id, {
          home: m.home_score,
          away: m.away_score,
          status: m.status as LiveScore["status"],
        });
      setScores(map);
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel("matches-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, (payload) => {
        const row = payload.new as {
          id: string;
          home_score: number | null;
          away_score: number | null;
          status: LiveScore["status"];
        };
        setScores((prev) => {
          const next = new Map(prev);
          next.set(row.id, { home: row.home_score, away: row.away_score, status: row.status });
          return next;
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, []);

  const now = Date.now();
  const matches = catalogMatches.map((m) => {
    const s = scores.get(m.id);
    if (!s) return m;
    // Safety: if the catalog match is still in the future, ignore stale "finished" rows
    // from the DB (e.g. seed/test data) so we don't show fake results before kickoff.
    const isFuture = new Date(m.date).getTime() > now;
    if (isFuture && s.status === "finished") return m;
    return {
      ...m,
      homeScore: s.home ?? m.homeScore,
      awayScore: s.away ?? m.awayScore,
      status: isFuture ? m.status : s.status,
    };
  });

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
        const data = await getHomeBootstrap();
        if (cancelled) return;
        const teamFlag = new Map(catalogTeams.map((t) => [t.id, t.flag]));
        const ranking: LiveRankingEntry[] = data.topRanking.map((r) => ({
          userId: r.userId,
          position: r.position,
          username: r.username,
          avatar: (r.favoriteTeamId && teamFlag.get(r.favoriteTeamId)) || "⚽",
          points: r.points,
          exact: r.exact,
          partial: r.partial,
          streak: 0,
        }));

        const now = Date.now();
        const scoreMap = new Map(data.liveMatchScores.map((s) => [s.id, s]));
        const merged = catalogMatches.map((m) => {
          const s = scoreMap.get(m.id);
          if (!s) return m;
          const isFuture = new Date(m.date).getTime() > now;
          if (isFuture && s.status === "finished") return m;
          return {
            ...m,
            homeScore: s.homeScore ?? m.homeScore,
            awayScore: s.awayScore ?? m.awayScore,
            status: isFuture ? m.status : s.status,
          };
        });
        const upcoming = merged
          .filter(
            (m) => m.status !== "finished" && new Date(m.date).getTime() > now - 3 * 3600_000,
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
