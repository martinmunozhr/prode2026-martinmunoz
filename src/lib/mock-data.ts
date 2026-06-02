// Mock data for Prode Mundial 2026
// Format: 48 teams, 12 groups of 4

export type Team = {
  id: string;
  name: string;
  code: string; // ISO 3-letter
  flag: string; // emoji
  group: string;
  confederation: "CONMEBOL" | "UEFA" | "CONCACAF" | "AFC" | "CAF" | "OFC";
  description?: string;
};

export type Match = {
  id: string;
  homeId: string;
  awayId: string;
  date: string; // ISO
  stadium: string;
  city: string;
  stage:
    | "Grupos"
    | "Dieciseisavos"
    | "Octavos"
    | "Cuartos"
    | "Semifinal"
    | "Tercer Puesto"
    | "Final";
  group?: string;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "finished";
};

export type Player = {
  id: string;
  name: string;
  number?: number;
  position: "POR" | "DEF" | "MED" | "DEL";
  age?: number;
  club: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  imageUrl?: string;
};

export type Prediction = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  status: "pending" | "saved" | "locked";
};

export type RankingEntry = {
  position: number;
  username: string;
  avatar: string;
  points: number;
  exact: number;
  partial: number;
  streak: number;
};

// 48 selecciones del Mundial 2026 — sorteo final (Kennedy Center, 5-dic-2025).
// IDs en minuscula, 3 letras estilo FIFA. Codes en mayuscula. Flags emoji para
// fallback visual; el componente <Flag/> usa team-id para mapear a iso2.
export const teams: Team[] = [
  // Group A
  { id: "mex", name: "México", code: "MEX", flag: "🇲🇽", group: "A", confederation: "CONCACAF" },
  { id: "rsa", name: "Sudáfrica", code: "RSA", flag: "🇿🇦", group: "A", confederation: "CAF" },
  { id: "kor", name: "Corea del Sur", code: "KOR", flag: "🇰🇷", group: "A", confederation: "AFC" },
  { id: "cze", name: "Rep. Checa", code: "CZE", flag: "🇨🇿", group: "A", confederation: "UEFA" },
  // Group B
  { id: "can", name: "Canadá", code: "CAN", flag: "🇨🇦", group: "B", confederation: "CONCACAF" },
  { id: "bih", name: "Bosnia y Herz.", code: "BIH", flag: "🇧🇦", group: "B", confederation: "UEFA" },
  { id: "qat", name: "Qatar", code: "QAT", flag: "🇶🇦", group: "B", confederation: "AFC" },
  { id: "sui", name: "Suiza", code: "SUI", flag: "🇨🇭", group: "B", confederation: "UEFA" },
  // Group C
  { id: "bra", name: "Brasil", code: "BRA", flag: "🇧🇷", group: "C", confederation: "CONMEBOL" },
  { id: "mar", name: "Marruecos", code: "MAR", flag: "🇲🇦", group: "C", confederation: "CAF" },
  { id: "hai", name: "Haití", code: "HAI", flag: "🇭🇹", group: "C", confederation: "CONCACAF" },
  { id: "sco", name: "Escocia", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", confederation: "UEFA" },
  // Group D
  {
    id: "usa",
    name: "Estados Unidos",
    code: "USA",
    flag: "🇺🇸",
    group: "D",
    confederation: "CONCACAF",
  },
  { id: "par", name: "Paraguay", code: "PAR", flag: "🇵🇾", group: "D", confederation: "CONMEBOL" },
  { id: "aus", name: "Australia", code: "AUS", flag: "🇦🇺", group: "D", confederation: "AFC" },
  { id: "tur", name: "Turquía", code: "TUR", flag: "🇹🇷", group: "D", confederation: "UEFA" },
  // Group E
  { id: "ger", name: "Alemania", code: "GER", flag: "🇩🇪", group: "E", confederation: "UEFA" },
  { id: "cuw", name: "Curazao", code: "CUW", flag: "🇨🇼", group: "E", confederation: "CONCACAF" },
  { id: "civ", name: "Costa de Marfil", code: "CIV", flag: "🇨🇮", group: "E", confederation: "CAF" },
  { id: "ecu", name: "Ecuador", code: "ECU", flag: "🇪🇨", group: "E", confederation: "CONMEBOL" },
  // Group F
  { id: "ned", name: "Países Bajos", code: "NED", flag: "🇳🇱", group: "F", confederation: "UEFA" },
  { id: "jpn", name: "Japón", code: "JPN", flag: "🇯🇵", group: "F", confederation: "AFC" },
  { id: "swe", name: "Suecia", code: "SWE", flag: "🇸🇪", group: "F", confederation: "UEFA" },
  { id: "tun", name: "Túnez", code: "TUN", flag: "🇹🇳", group: "F", confederation: "CAF" },
  // Group G
  { id: "irn", name: "Irán", code: "IRN", flag: "🇮🇷", group: "G", confederation: "AFC" },
  { id: "nzl", name: "Nueva Zelanda", code: "NZL", flag: "🇳🇿", group: "G", confederation: "OFC" },
  { id: "bel", name: "Bélgica", code: "BEL", flag: "🇧🇪", group: "G", confederation: "UEFA" },
  { id: "egy", name: "Egipto", code: "EGY", flag: "🇪🇬", group: "G", confederation: "CAF" },
  // Group H
  { id: "esp", name: "España", code: "ESP", flag: "🇪🇸", group: "H", confederation: "UEFA" },
  { id: "cpv", name: "Cabo Verde", code: "CPV", flag: "🇨🇻", group: "H", confederation: "CAF" },
  {
    id: "ksa",
    name: "Arabia Saudita",
    code: "KSA",
    flag: "🇸🇦",
    group: "H",
    confederation: "AFC",
  },
  { id: "uru", name: "Uruguay", code: "URU", flag: "🇺🇾", group: "H", confederation: "CONMEBOL" },
  // Group I
  { id: "fra", name: "Francia", code: "FRA", flag: "🇫🇷", group: "I", confederation: "UEFA" },
  { id: "sen", name: "Senegal", code: "SEN", flag: "🇸🇳", group: "I", confederation: "CAF" },
  { id: "irq", name: "Irak", code: "IRQ", flag: "🇮🇶", group: "I", confederation: "AFC" },
  { id: "nor", name: "Noruega", code: "NOR", flag: "🇳🇴", group: "I", confederation: "UEFA" },
  // Group J
  { id: "arg", name: "Argentina", code: "ARG", flag: "🇦🇷", group: "J", confederation: "CONMEBOL" },
  { id: "alg", name: "Argelia", code: "ALG", flag: "🇩🇿", group: "J", confederation: "CAF" },
  { id: "aut", name: "Austria", code: "AUT", flag: "🇦🇹", group: "J", confederation: "UEFA" },
  { id: "jor", name: "Jordania", code: "JOR", flag: "🇯🇴", group: "J", confederation: "AFC" },
  // Group K
  { id: "por", name: "Portugal", code: "POR", flag: "🇵🇹", group: "K", confederation: "UEFA" },
  { id: "cod", name: "RD Congo", code: "COD", flag: "🇨🇩", group: "K", confederation: "CAF" },
  { id: "uzb", name: "Uzbekistán", code: "UZB", flag: "🇺🇿", group: "K", confederation: "AFC" },
  { id: "col", name: "Colombia", code: "COL", flag: "🇨🇴", group: "K", confederation: "CONMEBOL" },
  // Group L
  { id: "ing", name: "Inglaterra", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", confederation: "UEFA" },
  { id: "cro", name: "Croacia", code: "CRO", flag: "🇭🇷", group: "L", confederation: "UEFA" },
  { id: "gha", name: "Ghana", code: "GHA", flag: "🇬🇭", group: "L", confederation: "CAF" },
  { id: "pan", name: "Panamá", code: "PAN", flag: "🇵🇦", group: "L", confederation: "CONCACAF" },
];

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}

export function getTeamsByGroup(group: string): Team[] {
  return teams.filter((t) => t.group === group);
}

export const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Mundial arranca el 11 de junio de 2026
const WC_START = new Date("2026-06-11T20:00:00Z");

function matchDate(daysOffset: number, hour = 20): string {
  const d = new Date(WC_START);
  d.setUTCDate(d.getUTCDate() + daysOffset);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

const stadiums = [
  { stadium: "Estadio Azteca", city: "Ciudad de México" },
  { stadium: "MetLife Stadium", city: "Nueva York" },
  { stadium: "SoFi Stadium", city: "Los Ángeles" },
  { stadium: "BMO Field", city: "Toronto" },
  { stadium: "AT&T Stadium", city: "Dallas" },
  { stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  { stadium: "BC Place", city: "Vancouver" },
  { stadium: "Estadio Akron", city: "Guadalajara" },
];

function genGroupMatches(): Match[] {
  const out: Match[] = [];
  let id = 1;
  let dayOffset = 0;
  groupLetters.forEach((g, gi) => {
    const ts = getTeamsByGroup(g);
    if (ts.length < 4) return;
    // 6 partidos por grupo: 0v1, 2v3, 0v2, 1v3, 0v3, 1v2
    const pairs: [number, number][] = [
      [0, 1],
      [2, 3],
      [0, 2],
      [1, 3],
      [0, 3],
      [1, 2],
    ];
    pairs.forEach((p, idx) => {
      const stadium = stadiums[(gi + idx) % stadiums.length];
      const day = dayOffset + Math.floor(idx / 2);
      const hour = idx % 2 === 0 ? 18 : 21;
      // Pre-tournament: every match scheduled, no scores. Real results come from Supabase.
      out.push({
        id: `m${id++}`,
        homeId: ts[p[0]].id,
        awayId: ts[p[1]].id,
        date: matchDate(day, hour),
        stadium: stadium.stadium,
        city: stadium.city,
        stage: "Grupos",
        group: g,
        status: "scheduled",
      });
    });
    dayOffset += 3;
  });
  return out;
}

export const matches: Match[] = genGroupMatches();

export function getMatch(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function getMatchesByGroup(group: string): Match[] {
  return matches.filter((m) => m.group === group);
}

export function getUpcomingMatches(limit = 5): Match[] {
  return matches.filter((m) => m.status === "scheduled").slice(0, limit);
}

// Roster genérico de 26 jugadores
const positions: Player["position"][] = [
  "POR",
  "POR",
  "POR",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "MED",
  "MED",
  "MED",
  "MED",
  "MED",
  "MED",
  "MED",
  "MED",
  "DEL",
  "DEL",
  "DEL",
  "DEL",
  "DEL",
  "DEL",
  "DEL",
];

const firstNames = [
  "Lucas",
  "Mateo",
  "Diego",
  "Carlos",
  "Marco",
  "Luis",
  "Juan",
  "Pedro",
  "Pablo",
  "Sergio",
  "Andrés",
  "Rafael",
  "Nicolás",
  "Kevin",
  "Adrián",
  "Hugo",
  "Iván",
  "Daniel",
  "Bruno",
  "Tomás",
  "Joaquín",
  "Maximiliano",
  "Emilio",
  "Felipe",
  "Gonzalo",
  "Federico",
];
const lastNames = [
  "Silva",
  "Rodríguez",
  "García",
  "Martínez",
  "López",
  "Sánchez",
  "Pérez",
  "Fernández",
  "Torres",
  "Ramírez",
  "Morales",
  "Castro",
  "Vargas",
  "Romero",
  "Herrera",
  "Mendoza",
  "Cruz",
  "Ortiz",
  "Reyes",
  "Jiménez",
  "Aguilar",
  "Delgado",
  "Núñez",
  "Peña",
  "Cabrera",
  "Vega",
];
const clubs = [
  "Real Madrid",
  "Barcelona",
  "Manchester City",
  "Liverpool",
  "Bayern Munich",
  "PSG",
  "Inter",
  "Milan",
  "Juventus",
  "Atlético Madrid",
  "Chelsea",
  "Arsenal",
  "Borussia Dortmund",
  "Napoli",
  "Tottenham",
  "Boca Juniors",
  "River Plate",
  "Flamengo",
  "Palmeiras",
];

function rarityFor(idx: number): Player["rarity"] {
  if (idx === 9 || idx === 19) return "legendary"; // 10 y 20 = estrellas
  if (idx < 3) return "epic"; // arqueros titulares
  if (idx % 7 === 0) return "rare";
  return "common";
}

import { getRealRoster, hasRealRoster } from "./real-squads";

export function getRoster(teamId: string): Player[] {
  const real = getRealRoster(teamId);
  if (real) return real;
  // Fallback genérico determinístico
  const seed = teamId.charCodeAt(0) + teamId.charCodeAt(1);
  return positions.map((pos, i) => ({
    id: `${teamId}-p${i + 1}`,
    name: `${firstNames[(seed + i) % firstNames.length]} ${lastNames[(seed * 3 + i) % lastNames.length]}`,
    number: i + 1,
    position: pos,
    age: 20 + ((seed + i * 3) % 16),
    club: clubs[(seed + i * 5) % clubs.length],
    rarity: rarityFor(i),
  }));
}

export function isRealRoster(teamId: string): boolean {
  return hasRealRoster(teamId);
}

// Pre-tournament: real ranking comes from useLiveRanking() once users start predicting.
export const ranking: RankingEntry[] = [];

export function getGroupStandings(group: string) {
  const ts = getTeamsByGroup(group);
  return ts
    .map((t) => {
      const ms = matches.filter(
        (m) =>
          m.group === group && (m.homeId === t.id || m.awayId === t.id) && m.status === "finished",
      );
      let pj = 0,
        pg = 0,
        pe = 0,
        pp = 0,
        gf = 0,
        gc = 0;
      ms.forEach((m) => {
        pj++;
        const isHome = m.homeId === t.id;
        const f = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
        const c = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
        gf += f;
        gc += c;
        if (f > c) pg++;
        else if (f === c) pe++;
        else pp++;
      });
      return { team: t, pj, pg, pe, pp, gf, gc, dg: gf - gc, pts: pg * 3 + pe };
    })
    .sort(
      // Stable order: pts → DG → GF → team id (alphabetical) so SSR and client match
      (a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.team.id.localeCompare(b.team.id),
    );
}
