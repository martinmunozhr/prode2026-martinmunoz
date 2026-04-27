// Public cron endpoint to sync match results from API-Football.
// Protected by a shared secret stored in app_settings (key='cron_secret').
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  apiFootballFetch,
  WORLD_CUP_LEAGUE_ID,
  WORLD_CUP_SEASON,
  getRemainingRequests,
  logSync,
} from "@/lib/api-football.server";

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type ApiFixture = {
  fixture: { id: number; date: string; status: { short: string } };
  teams: { home: { id: number; name: string }; away: { id: number; name: string } };
  goals: { home: number | null; away: number | null };
};

async function runSync() {
  const { used, limit } = await getRemainingRequests();
  if (limit - used < 2) {
    await logSync("results-cron", "failed", 0, undefined, "no quota");
    return { ok: false, error: "no quota" };
  }
  let updated = 0;
  let requestsUsed = 0;
  try {
    const fixtures = await apiFootballFetch<ApiFixture>("/fixtures", {
      league: WORLD_CUP_LEAGUE_ID,
      season: WORLD_CUP_SEASON,
      from: new Date(Date.now() - 36 * 3600_000).toISOString().slice(0, 10),
      to: new Date(Date.now() + 24 * 3600_000).toISOString().slice(0, 10),
    });
    requestsUsed++;

    const { data: matches } = await supabaseAdmin
      .from("matches")
      .select("id, home_id, away_id, match_date");
    const teamMap = new Map<string, string>();
    const { data: allTeams } = await supabaseAdmin.from("teams").select("id, name");
    for (const t of allTeams ?? []) teamMap.set(norm(t.name), t.id);

    for (const fx of fixtures.response) {
      const homeId = teamMap.get(norm(fx.teams.home.name));
      const awayId = teamMap.get(norm(fx.teams.away.name));
      if (!homeId || !awayId) continue;
      const fxDate = new Date(fx.fixture.date).getTime();
      const ourMatch = (matches ?? []).find(
        (m) =>
          m.home_id === homeId &&
          m.away_id === awayId &&
          Math.abs(new Date(m.match_date).getTime() - fxDate) < 36 * 3600_000,
      );
      if (!ourMatch) continue;
      const status =
        fx.fixture.status.short === "FT" ||
        fx.fixture.status.short === "AET" ||
        fx.fixture.status.short === "PEN"
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
    await logSync("results-cron", "success", requestsUsed, { updated });
    return { ok: true, updated, requestsUsed };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logSync("results-cron", "failed", requestsUsed, undefined, msg);
    return { ok: false, error: msg };
  }
}

export const Route = createFileRoute("/api/public/cron/sync-results")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const provided = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
        const { data: secretRow } = await supabaseAdmin
          .from("app_settings")
          .select("value")
          .eq("key", "cron_secret")
          .maybeSingle();
        const secret = String(secretRow?.value ?? "").replace(/"/g, "");
        if (!secret || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const result = await runSync();
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});
