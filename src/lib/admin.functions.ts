// Admin-only server functions for syncing data from API-Football.
// Each call respects the daily 100-request limit.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  apiFootballFetch,
  WORLD_CUP_LEAGUE_ID,
  WORLD_CUP_SEASON,
  getRemainingRequests,
  logSync,
  mapPosition,
} from "@/lib/api-football.server";
import { assertAdmin, norm } from "@/lib/admin.helpers.server";

// ---------------- REMAINING QUOTA ----------------
export const getApiQuota = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    return getRemainingRequests();
  });

// ---------------- SYNC SQUADS ----------------
type ApiSquadResp = {
  team: { id: number; name: string };
  players: Array<{
    id: number;
    name: string;
    age: number | null;
    number: number | null;
    position: string | null;
  }>;
};

export const syncSquads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const { used, limit } = await getRemainingRequests();
    const { data: teams } = await supabaseAdmin.from("teams").select("id, name, code");
    if (!teams) return { ok: false, error: "no teams" };

    const remaining = limit - used;
    if (remaining < teams.length + 1) {
      return {
        ok: false,
        error: `Insuficientes requests (${remaining}/${teams.length + 1} necesarias). Esperá al reseteo diario.`,
      };
    }

    // 1) Fetch league teams once to map our team_id -> api team id
    const leagueTeams = await apiFootballFetch<{ team: { id: number; name: string; code: string | null } }>("/teams", {
      league: WORLD_CUP_LEAGUE_ID,
      season: WORLD_CUP_SEASON,
    });

    let inserted = 0;
    let teamsMatched = 0;
    let requestsUsed = 1;
    const unmatched: string[] = [];

    for (const t of teams) {
      const api = leagueTeams.response.find(
        (r) => norm(r.team.name) === norm(t.name) || (r.team.code && r.team.code.toUpperCase() === t.code.toUpperCase()),
      );
      if (!api) {
        unmatched.push(t.name);
        continue;
      }
      teamsMatched++;

      try {
        const squad = await apiFootballFetch<ApiSquadResp>("/players/squads", { team: api.team.id });
        requestsUsed++;
        const players = squad.response[0]?.players ?? [];

        // Wipe existing squad for this team to keep it clean
        await supabaseAdmin.from("players").delete().eq("team_id", t.id);

        if (players.length > 0) {
          const rows = players.map((p) => ({
            team_id: t.id,
            name: p.name,
            position: mapPosition(p.position),
            jersey_number: p.number,
            api_player_id: p.id,
            club: null,
            is_captain: false,
          }));
          const { error } = await supabaseAdmin.from("players").insert(rows);
          if (!error) inserted += rows.length;
        }
      } catch (e) {
        console.error("squad sync err", t.id, e);
      }
    }

    await supabaseAdmin
      .from("app_settings")
      .upsert({ key: "squads_locked", value: true as never, is_public: true, updated_at: new Date().toISOString() }, { onConflict: "key" });

    await logSync("squads", inserted > 0 ? "success" : "partial", requestsUsed, {
      inserted,
      teamsMatched,
      unmatched,
    });

    return { ok: true, inserted, teamsMatched, unmatched, requestsUsed };
  });

// ---------------- SYNC RESULTS (today / live) ----------------
type ApiFixture = {
  fixture: { id: number; date: string; status: { short: string } };
  teams: { home: { id: number; name: string }; away: { id: number; name: string } };
  goals: { home: number | null; away: number | null };
};

export const syncResults = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const { used, limit } = await getRemainingRequests();
    if (limit - used < 2) {
      return { ok: false, error: "Sin requests disponibles hoy" };
    }

    let updated = 0;
    let requestsUsed = 0;

    try {
      // Pull fixtures from today and yesterday, plus live
      const fixtures = await apiFootballFetch<ApiFixture>("/fixtures", {
        league: WORLD_CUP_LEAGUE_ID,
        season: WORLD_CUP_SEASON,
        from: new Date(Date.now() - 36 * 3600_000).toISOString().slice(0, 10),
        to: new Date(Date.now() + 24 * 3600_000).toISOString().slice(0, 10),
      });
      requestsUsed++;

      const { data: matches } = await supabaseAdmin.from("matches").select("id, home_id, away_id, match_date");

      const teamMap = new Map<string, string>(); // norm(name) -> teams.id
      const { data: allTeams } = await supabaseAdmin.from("teams").select("id, name");
      for (const t of allTeams ?? []) teamMap.set(norm(t.name), t.id);

      for (const fx of fixtures.response) {
        const homeId = teamMap.get(norm(fx.teams.home.name));
        const awayId = teamMap.get(norm(fx.teams.away.name));
        if (!homeId || !awayId) continue;

        // Find our match by teams + date proximity (±36h)
        const fxDate = new Date(fx.fixture.date).getTime();
        const ourMatch = (matches ?? []).find(
          (m) =>
            m.home_id === homeId &&
            m.away_id === awayId &&
            Math.abs(new Date(m.match_date).getTime() - fxDate) < 36 * 3600_000,
        );
        if (!ourMatch) continue;

        const status =
          fx.fixture.status.short === "FT" || fx.fixture.status.short === "AET" || fx.fixture.status.short === "PEN"
            ? "finished"
            : ["1H", "2H", "HT", "ET", "P", "BT", "LIVE"].includes(fx.fixture.status.short)
              ? "live"
              : "scheduled";

        const { error } = await supabaseAdmin
          .from("matches")
          .update({
            home_score: fx.goals.home,
            away_score: fx.goals.away,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ourMatch.id);

        if (!error) updated++;
      }

      await logSync("results", "success", requestsUsed, { updated });
      return { ok: true, updated, requestsUsed };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await logSync("results", "failed", requestsUsed, undefined, msg);
      return { ok: false, error: msg };
    }
  });

// ---------------- MANUAL SCORE OVERRIDE ----------------
export const updateMatchManually = createServerFn({ method: "POST" })
  .inputValidator((data: { matchId: string; homeScore: number; awayScore: number; status: "scheduled" | "live" | "finished" }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("matches")
      .update({
        home_score: data.homeScore,
        away_score: data.awayScore,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.matchId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

// ---------------- PREDICTOR (top 5 likely scores) ----------------
export const predictMatch = createServerFn({ method: "GET" })
  .inputValidator((data: { homeId: string; awayId: string }) => data)
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin.rpc("predict_match", {
      _home_id: data.homeId,
      _away_id: data.awayId,
    });
    if (error) return { ok: false, error: error.message, predictions: [] };
    return { ok: true, predictions: rows ?? [] };
  });

// ---------------- MATCH EVENTS (goalscorers) ----------------
export const addMatchEvent = createServerFn({ method: "POST" })
  .inputValidator((data: { matchId: string; teamId: string; playerId: string | null; playerName: string; eventType: "Goal" | "Yellow Card" | "Red Card"; minute: number | null }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("match_events").insert({
      match_id: data.matchId,
      team_id: data.teamId,
      player_id: data.playerId,
      player_name: data.playerName,
      event_type: data.eventType,
      minute: data.minute,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

export const deleteMatchEvent = createServerFn({ method: "POST" })
  .inputValidator((data: { eventId: string }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("match_events").delete().eq("id", data.eventId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

// ---------------- TOURNAMENT AWARDS ----------------
export const updateAwards = createServerFn({ method: "POST" })
  .inputValidator((data: {
    campeon_id: string | null;
    subcampeon_id: string | null;
    tercer_puesto_id: string | null;
    fair_play_id: string | null;
    goleador_nombre: string | null;
    mejor_jugador_nombre: string | null;
    mejor_arquero_nombre: string | null;
    finalized: boolean;
  }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("tournament_awards")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

// ---------------- RECALC ALL POINTS (nuclear button) ----------------
export const recalcAllPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    // Re-trigger handle_match_result for every finished match by touching updated_at
    const { data: finished, error: e1 } = await supabaseAdmin
      .from("matches")
      .select("id")
      .eq("status", "finished");
    if (e1) return { ok: false, error: e1.message };
    let count = 0;
    for (const m of finished ?? []) {
      const { error } = await supabaseAdmin
        .from("matches")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", m.id);
      if (!error) count++;
    }
    return { ok: true, recalculated: count };
  });

