// Server-only utility for API-Football integration.
// Limit: 100 requests/day on free plan.
// All callers MUST go through tryUseRequests() to respect the daily quota.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const API_BASE = "https://v3.football.api-sports.io";
export const WORLD_CUP_LEAGUE_ID = 1; // FIFA World Cup
export const WORLD_CUP_SEASON = 2026;

export type ApiFootballResponse<T> = {
  response: T[];
  errors: unknown[];
  results: number;
};

export async function getRemainingRequests(): Promise<{ used: number; limit: number; date: string }> {
  const { data: limitRow } = await supabaseAdmin.from("app_settings").select("value").eq("key", "api_football_daily_limit").single();
  const { data: usedRow } = await supabaseAdmin.from("app_settings").select("value").eq("key", "api_football_requests_today").single();
  const { data: dateRow } = await supabaseAdmin.from("app_settings").select("value").eq("key", "last_sync_date").single();

  const today = new Date().toISOString().slice(0, 10);
  const lastDate = String(dateRow?.value ?? "").replace(/"/g, "") || "1970-01-01";

  // Reset counter at day boundary
  if (lastDate !== today) {
    await supabaseAdmin.from("app_settings").upsert(
      [
        { key: "api_football_requests_today", value: 0, is_public: true, updated_at: new Date().toISOString() },
        { key: "last_sync_date", value: today, is_public: true, updated_at: new Date().toISOString() },
      ],
      { onConflict: "key" },
    );
    return { used: 0, limit: Number(limitRow?.value ?? 100), date: today };
  }

  return { used: Number(usedRow?.value ?? 0), limit: Number(limitRow?.value ?? 100), date: today };
}

async function incrementRequestCount(by: number) {
  const { used } = await getRemainingRequests();
  await supabaseAdmin
    .from("app_settings")
    .update({ value: used + by, updated_at: new Date().toISOString() })
    .eq("key", "api_football_requests_today");
}

export async function apiFootballFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<ApiFootballResponse<T>> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("API_FOOTBALL_KEY is not configured");

  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString(), { headers: { "x-apisports-key": key } });
  await incrementRequestCount(1);

  if (!res.ok) throw new Error(`API-Football ${path} -> ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as ApiFootballResponse<T>;
  if (json.errors && (Array.isArray(json.errors) ? json.errors.length : Object.keys(json.errors).length) > 0) {
    // API-Football returns errors as object or array; surface them but don't throw if quota issue.
    console.warn("API-Football payload errors:", json.errors);
  }
  return json;
}

export async function logSync(
  syncType: string,
  status: "success" | "partial" | "failed",
  requestsUsed: number,
  details?: Record<string, unknown>,
  error?: string,
) {
  await supabaseAdmin.from("api_sync_logs").insert({
    sync_type: syncType,
    status,
    requests_used: requestsUsed,
    details: (details ?? null) as never,
    error: error ?? null,
  });
}

// Position mapping API-Football -> our enum
export function mapPosition(p: string | null | undefined): "GK" | "DEF" | "MID" | "FWD" {
  const v = (p ?? "").toLowerCase();
  if (v.startsWith("g")) return "GK";
  if (v.startsWith("d")) return "DEF";
  if (v.startsWith("m") || v.includes("attacker midfielder")) return "MID";
  return "FWD";
}
