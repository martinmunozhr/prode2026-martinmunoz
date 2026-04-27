// Server functions for alternative data sources:
//  - WC2026 API (squads + results)
//  - Manual roster import (paste text per team)

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, norm } from "@/lib/admin.helpers.server";
import { logSync } from "@/lib/api-football.server";
import {
  wc2026Fetch,
  mapWcPosition,
  parseRosterText,
  type WC2026SquadResponse,
  type WC2026Fixture,
} from "@/lib/wc2026-api.server";

// ---------------- WC2026: SYNC SQUADS ----------------
export const syncSquadsWC2026 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertAdmin(context.userId);
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Forbidden" };
    }

    if (!process.env.WC2026_API_KEY) {
      return { ok: false as const, error: "WC2026_API_KEY no está configurada en el servidor" };
    }

    const { data: teams, error: teamsErr } = await supabaseAdmin
      .from("teams")
      .select("id, name, code");
    if (teamsErr) return { ok: false as const, error: `DB: ${teamsErr.message}` };
    if (!teams || teams.length === 0)
      return { ok: false as const, error: "No hay equipos cargados" };

    let inserted = 0;
    let teamsMatched = 0;
    let calls = 0;
    const unmatched: string[] = [];
    const errors: string[] = [];

    // Process teams in parallel batches to avoid worker timeout (default ~30s).
    const CONCURRENCY = 8;
    const queue = [...teams];

    type TeamRow = { id: string; name: string; code: string };
    async function processTeam(t: TeamRow) {
      try {
        let squad: WC2026SquadResponse | null = null;
        try {
          squad = await wc2026Fetch<WC2026SquadResponse>(
            `/v1/teams/${encodeURIComponent(t.code)}/squad`,
          );
          calls++;
        } catch (e1) {
          try {
            squad = await wc2026Fetch<WC2026SquadResponse>(
              `/v1/teams/${encodeURIComponent(t.id)}/squad`,
            );
            calls++;
          } catch (e2) {
            squad = null;
            const msg = e2 instanceof Error ? e2.message : String(e2);
            if (errors.length < 3) errors.push(`${t.name}: ${msg}`);
          }
        }

        const players = squad?.players ?? squad?.squad ?? [];
        if (players.length === 0) {
          unmatched.push(t.name);
          return;
        }
        teamsMatched++;

        await supabaseAdmin.from("players").delete().eq("team_id", t.id);
        const rows = players.map((p) => ({
          team_id: t.id,
          name: p.name,
          position: mapWcPosition(p.position ?? null),
          jersey_number: p.shirtNumber ?? p.number ?? null,
          api_player_id: typeof p.id === "number" ? p.id : null,
          club: p.club ?? null,
          is_captain: !!p.isCaptain,
        }));
        const { error } = await supabaseAdmin.from("players").insert(rows);
        if (!error) inserted += rows.length;
      } catch (e) {
        console.error("wc2026 squad err", t.id, e);
        unmatched.push(t.name);
      }
    }

    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length > 0) {
        const t = queue.shift();
        if (!t) break;
        await processTeam(t);
      }
    });
    await Promise.all(workers);

    if (inserted === 0) {
      const sample = errors[0] ?? "no se pudo obtener ningún roster";
      await logSync("squads_wc2026", "failed", calls, { unmatched, errors }, sample);
      return {
        ok: false as const,
        error: `WC2026 API no devolvió plantillas. Detalle: ${sample}`,
        unmatched,
      };
    }

    await supabaseAdmin.from("app_settings").upsert(
      {
        key: "squads_locked",
        value: true as never,
        is_public: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    await logSync("squads_wc2026", "success", calls, { inserted, teamsMatched, unmatched });

    return { ok: true as const, inserted, teamsMatched, unmatched, requestsUsed: calls };
  });

// ---------------- WC2026: SYNC RESULTS ----------------
export const syncResultsWC2026 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertAdmin(context.userId);
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Forbidden" };
    }
    if (!process.env.WC2026_API_KEY) {
      return { ok: false as const, error: "WC2026_API_KEY no está configurada" };
    }

    let updated = 0;
    let calls = 0;

    try {
      // WC2026 API exposes /matches (full list). We pull once and filter locally.
      type MatchApi = {
        id?: number | string;
        home_team?: string;
        away_team?: string;
        home_score?: number | null;
        away_score?: number | null;
        status?: string;
        kickoff_utc?: string;
        group_name?: string | null;
        round?: string;
      };
      type MatchList = { matches?: MatchApi[] } | MatchApi[];
      const r = await wc2026Fetch<MatchList>(`/matches`);
      calls++;
      const all = (Array.isArray(r) ? r : (r.matches ?? [])).map<WC2026Fixture>((m) => ({
        id: m.id,
        date: m.kickoff_utc,
        status: m.status,
        homeTeam: { name: m.home_team },
        awayTeam: { name: m.away_team },
        homeScore: m.home_score ?? null,
        awayScore: m.away_score ?? null,
      }));

      const { data: matches } = await supabaseAdmin
        .from("matches")
        .select("id, home_id, away_id, match_date");
      const { data: allTeams } = await supabaseAdmin.from("teams").select("id, name, code");
      const codeMap = new Map<string, string>();
      const nameMap = new Map<string, string>();
      for (const t of allTeams ?? []) {
        codeMap.set((t.code ?? "").toUpperCase(), t.id);
        nameMap.set(norm(t.name), t.id);
      }

      for (const fx of all) {
        const home =
          codeMap.get((fx.homeTeam?.code ?? "").toUpperCase()) ??
          nameMap.get(norm(fx.homeTeam?.name ?? ""));
        const away =
          codeMap.get((fx.awayTeam?.code ?? "").toUpperCase()) ??
          nameMap.get(norm(fx.awayTeam?.name ?? ""));
        if (!home || !away) continue;

        const fxDate = fx.date ? new Date(fx.date).getTime() : null;
        const ourMatch = (matches ?? []).find(
          (m) =>
            m.home_id === home &&
            m.away_id === away &&
            (fxDate == null ||
              Math.abs(new Date(m.match_date).getTime() - fxDate) < 36 * 3600_000),
        );
        if (!ourMatch) continue;

        const homeScore = fx.score?.home ?? fx.homeScore ?? null;
        const awayScore = fx.score?.away ?? fx.awayScore ?? null;
        const s = (fx.status ?? "").toLowerCase();
        const status: "scheduled" | "live" | "finished" =
          s.includes("final") || s.includes("ft") || s === "finished"
            ? "finished"
            : s.includes("live") || s.includes("1h") || s.includes("2h") || s.includes("ht")
              ? "live"
              : "scheduled";

        const { error } = await supabaseAdmin
          .from("matches")
          .update({
            home_score: homeScore,
            away_score: awayScore,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ourMatch.id);
        if (!error) updated++;
      }

      await logSync("results_wc2026", "success", calls, { updated });
      return { ok: true, updated, requestsUsed: calls };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await logSync("results_wc2026", "failed", calls, undefined, msg);
      return { ok: false, error: msg };
    }
  });

// ---------------- MANUAL ROSTER IMPORT ----------------
export const importRosterText = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { teamId: string; text: string; replace: boolean }) => {
      if (!data.teamId || typeof data.teamId !== "string") throw new Error("teamId requerido");
      if (!data.text || typeof data.text !== "string") throw new Error("texto requerido");
      if (data.text.length > 50_000) throw new Error("texto demasiado largo");
      return data;
    },
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context.userId);
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Forbidden",
        inserted: 0,
      };
    }

    const { data: team, error: teamErr } = await supabaseAdmin
      .from("teams")
      .select("id, name")
      .eq("id", data.teamId)
      .maybeSingle();
    if (teamErr) return { ok: false, error: teamErr.message, inserted: 0 };
    if (!team) return { ok: false, error: "Equipo no encontrado", inserted: 0 };

    const parsed = parseRosterText(data.text);
    if (parsed.length === 0) {
      return { ok: false, error: "No se detectó ningún jugador en el texto", inserted: 0 };
    }

    if (data.replace) {
      await supabaseAdmin.from("players").delete().eq("team_id", team.id);
    }

    const rows = parsed.map((p) => ({
      team_id: team.id,
      name: p.name,
      position: p.position,
      jersey_number: p.jersey_number,
      club: p.club,
      is_captain: p.is_captain,
      api_player_id: null,
    }));

    const { error } = await supabaseAdmin.from("players").insert(rows);
    if (error) return { ok: false, error: error.message, inserted: 0 };

    await logSync("manual_roster", "success", 0, {
      team: team.name,
      count: rows.length,
      replace: data.replace,
    });

    return { ok: true, inserted: rows.length, teamName: team.name };
  });

// Preview parse without writing to DB (useful for the UI)
export const previewRosterText = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string }) => {
    if (typeof data.text !== "string") throw new Error("texto inválido");
    if (data.text.length > 50_000) throw new Error("texto demasiado largo");
    return data;
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    try {
      await assertAdmin(context.userId);
    } catch {
      return { players: [] as ReturnType<typeof parseRosterText> };
    }
    return { players: parseRosterText(data.text) };
  });
