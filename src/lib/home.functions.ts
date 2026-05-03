// Server-side aggregations for the home page.
// Goal: ship a tiny payload to mobile clients instead of streaming the full
// predictions/profiles tables to do client-side aggregation.

import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type HomeRankingEntry = {
  userId: string;
  position: number;
  username: string;
  favoriteTeamId: string | null;
  points: number;
  exact: number;
  partial: number;
};

export type HomeMatchScore = {
  id: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "finished";
};

export type HomeBootstrap = {
  topRanking: HomeRankingEntry[];
  liveMatchScores: HomeMatchScore[];
};

export const getHomeBootstrap = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeBootstrap> => {
    const sb = supabaseAdmin;

    // Pull only what we need. Profiles, predictions points, crystal_ball points,
    // goalscorer points, and finished matches for exact/partial counters.
    const [profilesRes, predsRes, cbRes, gspRes, finishedRes, allMatchesRes] = await Promise.all([
      sb.from("profiles").select("id, username, avatar_color, favorite_team_id"),
      sb.from("predictions").select("user_id, points_earned, home_score, away_score, match_id"),
      sb.from("crystal_ball").select("user_id, points_earned"),
      sb.from("goalscorer_predictions").select("user_id, points_earned"),
      sb.from("matches").select("id, home_score, away_score").eq("status", "finished"),
      sb.from("matches").select("id, home_score, away_score, status"),
    ]);

    const profiles = profilesRes.data ?? [];
    const preds = predsRes.data ?? [];
    const cbs = cbRes.data ?? [];
    const gsps = gspRes.data ?? [];
    const finishedMatches = finishedRes.data ?? [];

    const fmap = new Map<string, { h: number; a: number }>();
    for (const m of finishedMatches) {
      if (m.home_score !== null && m.away_score !== null)
        fmap.set(m.id, { h: m.home_score, a: m.away_score });
    }

    const stats = new Map<string, { points: number; exact: number; partial: number }>();
    for (const p of preds) {
      const cur = stats.get(p.user_id) ?? { points: 0, exact: 0, partial: 0 };
      cur.points += p.points_earned ?? 0;
      const real = fmap.get(p.match_id);
      if (real && p.home_score !== null && p.away_score !== null) {
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

    const rows: HomeRankingEntry[] = profiles.map((p) => {
      const s = stats.get(p.id) ?? { points: 0, exact: 0, partial: 0 };
      return {
        userId: p.id,
        position: 0,
        username: p.username ?? "Anónimo",
        favoriteTeamId: p.favorite_team_id ?? null,
        points: s.points,
        exact: s.exact,
        partial: s.partial,
      };
    });
    rows.sort((a, b) => b.points - a.points || b.exact - a.exact);
    rows.forEach((r, i) => (r.position = i + 1));

    const topRanking = rows.slice(0, 10); // ship only top 10

    const liveMatchScores: HomeMatchScore[] = (allMatchesRes.data ?? []).map((m) => ({
      id: m.id,
      homeScore: m.home_score,
      awayScore: m.away_score,
      status: m.status as HomeMatchScore["status"],
    }));

    return { topRanking, liveMatchScores };
  },
);
