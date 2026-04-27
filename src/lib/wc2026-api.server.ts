// Server-only utility for WC2026 API integration.
// Docs: https://wc2026api.com (REST endpoints, Bearer auth).
// Endpoints used (best-effort, fall back to alternates if 404):
//   GET /v1/teams/:teamCode/squad   -> roster
//   GET /v1/fixtures?date=YYYY-MM-DD -> fixtures
//
// All responses are normalized to our internal shapes.

const BASE = "https://api.wc2026api.com";

export type WC2026Player = {
  id?: number | string;
  name: string;
  position?: string | null;
  shirtNumber?: number | null;
  number?: number | null;
  club?: string | null;
  isCaptain?: boolean;
};

export type WC2026SquadResponse = {
  team?: { name?: string; code?: string };
  players?: WC2026Player[];
  squad?: WC2026Player[];
};

export type WC2026Fixture = {
  id?: string | number;
  date?: string;
  status?: string;
  homeTeam?: { name?: string; code?: string };
  awayTeam?: { name?: string; code?: string };
  score?: { home?: number | null; away?: number | null };
  homeScore?: number | null;
  awayScore?: number | null;
};

function authHeaders() {
  const key = process.env.WC2026_API_KEY;
  if (!key) throw new Error("WC2026_API_KEY no está configurada");
  return {
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
  };
}

export async function wc2026Fetch<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    throw new Error(`WC2026 ${path} -> ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export function mapWcPosition(p: string | null | undefined): "GK" | "DEF" | "MID" | "FWD" {
  const v = (p ?? "").toLowerCase().trim();
  if (!v) return "FWD";
  if (v.startsWith("g") || v.includes("keeper") || v.includes("arquero") || v.includes("portero"))
    return "GK";
  if (
    v.startsWith("d") ||
    v.includes("back") ||
    v.includes("defen") ||
    v.includes("zaguero") ||
    v.includes("lateral")
  )
    return "DEF";
  if (v.startsWith("m") || v.includes("mid") || v.includes("medio") || v.includes("volante"))
    return "MID";
  return "FWD";
}

// Parse a free-text roster paste. Each non-empty line = one player.
// Supported formats per line (anything goes; we extract what we can):
//   "10 Lionel Messi FWD Inter Miami (C)"
//   "Lionel Messi, FWD, 10, Inter Miami, captain"
//   "Lionel Messi - FWD - #10"
//   "Messi"   (just a name)
export type ParsedPlayer = {
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  jersey_number: number | null;
  club: string | null;
  is_captain: boolean;
};

const POS_TOKENS = new Map<string, "GK" | "DEF" | "MID" | "FWD">([
  ["gk", "GK"],
  ["g", "GK"],
  ["por", "GK"],
  ["arq", "GK"],
  ["arquero", "GK"],
  ["portero", "GK"],
  ["goalkeeper", "GK"],
  ["def", "DEF"],
  ["d", "DEF"],
  ["defensor", "DEF"],
  ["defender", "DEF"],
  ["zag", "DEF"],
  ["lateral", "DEF"],
  ["mid", "MID"],
  ["m", "MID"],
  ["med", "MID"],
  ["medio", "MID"],
  ["volante", "MID"],
  ["mediocampista", "MID"],
  ["midfielder", "MID"],
  ["fwd", "FWD"],
  ["f", "FWD"],
  ["del", "FWD"],
  ["delantero", "FWD"],
  ["forward", "FWD"],
  ["atacante", "FWD"],
  ["striker", "FWD"],
]);

export function parseRosterText(text: string): ParsedPlayer[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const out: ParsedPlayer[] = [];
  for (const raw of lines) {
    let line = raw;
    // detect captain mark
    const isCaptain = /\(c\)|\bcapt(?:a[ií]n|ain)\b|\*+$/i.test(line);
    line = line.replace(/\(c\)|\bcapt(?:a[ií]n|ain)\b|\*+$/gi, "").trim();

    // split by common delimiters; if only spaces, also try spaces
    const parts =
      line.includes(",") || line.includes("|") || line.includes(";") || line.includes(" - ")
        ? line.split(/[,|;]| - /).map((p) => p.trim()).filter(Boolean)
        : line.split(/\s+/);

    let jersey: number | null = null;
    let position: "GK" | "DEF" | "MID" | "FWD" | null = null;
    const remaining: string[] = [];

    for (const tok of parts) {
      const cleaned = tok.replace(/^#/, "").trim();
      // jersey number
      if (jersey == null && /^\d{1,2}$/.test(cleaned)) {
        const n = parseInt(cleaned, 10);
        if (n >= 1 && n <= 99) {
          jersey = n;
          continue;
        }
      }
      // position token
      const lower = cleaned.toLowerCase();
      if (position == null && POS_TOKENS.has(lower)) {
        position = POS_TOKENS.get(lower)!;
        continue;
      }
      remaining.push(tok);
    }

    // If we split by spaces and have many tokens, the name is the contiguous
    // alphabetic run; club is whatever extra trailing tokens remain after name.
    let name = "";
    let club: string | null = null;

    if (parts.length > 1 && (line.includes(",") || line.includes("|") || line.includes(";") || line.includes(" - "))) {
      // delimited: first remaining = name, rest = club
      name = remaining[0] ?? "";
      club = remaining.slice(1).join(" ").trim() || null;
    } else {
      // space-separated: take leading capitalized words as the name
      const tokens = remaining;
      const nameToks: string[] = [];
      const clubToks: string[] = [];
      let inName = true;
      for (const t of tokens) {
        const looksLikeName = /^[A-ZÁÉÍÓÚÑ][\p{L}'.-]*$/u.test(t);
        if (inName && looksLikeName) nameToks.push(t);
        else {
          inName = false;
          clubToks.push(t);
        }
      }
      name = nameToks.join(" ").trim() || tokens.join(" ").trim();
      club = clubToks.join(" ").trim() || null;
    }

    if (!name) continue;

    out.push({
      name,
      position: position ?? "FWD",
      jersey_number: jersey,
      club,
      is_captain: isCaptain,
    });
  }
  return out;
}
