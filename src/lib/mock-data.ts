// Mock data for Prode Mundial 2026
// Format: 48 teams, 12 groups of 4

export type Team = {
  id: string;
  name: string;
  code: string; // ISO 3-letter
  flag: string; // emoji
  group: string;
  confederation: "CONMEBOL" | "UEFA" | "CONCACAF" | "AFC" | "CAF" | "OFC";
};

export type Match = {
  id: string;
  homeId: string;
  awayId: string;
  date: string; // ISO
  stadium: string;
  city: string;
  stage: "Grupos" | "Dieciseisavos" | "Octavos" | "Cuartos" | "Semifinal" | "Tercer Puesto" | "Final";
  group?: string;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "finished";
};

export type Player = {
  id: string;
  name: string;
  number: number;
  position: "POR" | "DEF" | "MED" | "DEL";
  age: number;
  club: string;
  rarity: "common" | "rare" | "epic" | "legendary";
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

// 48 selecciones (subset realista del Mundial 2026)
export const teams: Team[] = [
  // Anfitriones (Grupo A)
  { id: "mex", name: "México", code: "MEX", flag: "🇲🇽", group: "A", confederation: "CONCACAF" },
  { id: "can", name: "Canadá", code: "CAN", flag: "🇨🇦", group: "A", confederation: "CONCACAF" },
  { id: "usa", name: "Estados Unidos", code: "USA", flag: "🇺🇸", group: "B", confederation: "CONCACAF" },
  // Sudamérica
  { id: "arg", name: "Argentina", code: "ARG", flag: "🇦🇷", group: "C", confederation: "CONMEBOL" },
  { id: "bra", name: "Brasil", code: "BRA", flag: "🇧🇷", group: "D", confederation: "CONMEBOL" },
  { id: "uru", name: "Uruguay", code: "URU", flag: "🇺🇾", group: "E", confederation: "CONMEBOL" },
  { id: "col", name: "Colombia", code: "COL", flag: "🇨🇴", group: "F", confederation: "CONMEBOL" },
  { id: "ecu", name: "Ecuador", code: "ECU", flag: "🇪🇨", group: "G", confederation: "CONMEBOL" },
  { id: "par", name: "Paraguay", code: "PAR", flag: "🇵🇾", group: "H", confederation: "CONMEBOL" },
  // Europa
  { id: "fra", name: "Francia", code: "FRA", flag: "🇫🇷", group: "A", confederation: "UEFA" },
  { id: "esp", name: "España", code: "ESP", flag: "🇪🇸", group: "B", confederation: "UEFA" },
  { id: "ing", name: "Inglaterra", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "C", confederation: "UEFA" },
  { id: "ger", name: "Alemania", code: "GER", flag: "🇩🇪", group: "D", confederation: "UEFA" },
  { id: "ita", name: "Italia", code: "ITA", flag: "🇮🇹", group: "E", confederation: "UEFA" },
  { id: "por", name: "Portugal", code: "POR", flag: "🇵🇹", group: "F", confederation: "UEFA" },
  { id: "ned", name: "Países Bajos", code: "NED", flag: "🇳🇱", group: "G", confederation: "UEFA" },
  { id: "bel", name: "Bélgica", code: "BEL", flag: "🇧🇪", group: "H", confederation: "UEFA" },
  { id: "cro", name: "Croacia", code: "CRO", flag: "🇭🇷", group: "I", confederation: "UEFA" },
  { id: "den", name: "Dinamarca", code: "DEN", flag: "🇩🇰", group: "I", confederation: "UEFA" },
  { id: "sui", name: "Suiza", code: "SUI", flag: "🇨🇭", group: "J", confederation: "UEFA" },
  { id: "pol", name: "Polonia", code: "POL", flag: "🇵🇱", group: "J", confederation: "UEFA" },
  { id: "aut", name: "Austria", code: "AUT", flag: "🇦🇹", group: "K", confederation: "UEFA" },
  { id: "tur", name: "Turquía", code: "TUR", flag: "🇹🇷", group: "K", confederation: "UEFA" },
  { id: "ser", name: "Serbia", code: "SER", flag: "🇷🇸", group: "L", confederation: "UEFA" },
  { id: "nor", name: "Noruega", code: "NOR", flag: "🇳🇴", group: "L", confederation: "UEFA" },
  // CONCACAF extra
  { id: "crc", name: "Costa Rica", code: "CRC", flag: "🇨🇷", group: "B", confederation: "CONCACAF" },
  { id: "pan", name: "Panamá", code: "PAN", flag: "🇵🇦", group: "I", confederation: "CONCACAF" },
  { id: "jam", name: "Jamaica", code: "JAM", flag: "🇯🇲", group: "K", confederation: "CONCACAF" },
  // AFC
  { id: "jpn", name: "Japón", code: "JPN", flag: "🇯🇵", group: "C", confederation: "AFC" },
  { id: "kor", name: "Corea del Sur", code: "KOR", flag: "🇰🇷", group: "D", confederation: "AFC" },
  { id: "aus", name: "Australia", code: "AUS", flag: "🇦🇺", group: "E", confederation: "AFC" },
  { id: "irn", name: "Irán", code: "IRN", flag: "🇮🇷", group: "F", confederation: "AFC" },
  { id: "ksa", name: "Arabia Saudita", code: "KSA", flag: "🇸🇦", group: "G", confederation: "AFC" },
  { id: "qat", name: "Qatar", code: "QAT", flag: "🇶🇦", group: "H", confederation: "AFC" },
  // CAF
  { id: "mar", name: "Marruecos", code: "MAR", flag: "🇲🇦", group: "A", confederation: "CAF" },
  { id: "sen", name: "Senegal", code: "SEN", flag: "🇸🇳", group: "B", confederation: "CAF" },
  { id: "egy", name: "Egipto", code: "EGY", flag: "🇪🇬", group: "C", confederation: "CAF" },
  { id: "nga", name: "Nigeria", code: "NGA", flag: "🇳🇬", group: "D", confederation: "CAF" },
  { id: "civ", name: "Costa de Marfil", code: "CIV", flag: "🇨🇮", group: "G", confederation: "CAF" },
  { id: "alg", name: "Argelia", code: "ALG", flag: "🇩🇿", group: "H", confederation: "CAF" },
  { id: "cmr", name: "Camerún", code: "CMR", flag: "🇨🇲", group: "J", confederation: "CAF" },
  { id: "gha", name: "Ghana", code: "GHA", flag: "🇬🇭", group: "L", confederation: "CAF" },
  { id: "tun", name: "Túnez", code: "TUN", flag: "🇹🇳", group: "I", confederation: "CAF" },
  { id: "rsa", name: "Sudáfrica", code: "RSA", flag: "🇿🇦", group: "F", confederation: "CAF" },
  // OFC
  { id: "nzl", name: "Nueva Zelanda", code: "NZL", flag: "🇳🇿", group: "E", confederation: "OFC" },
  // Repechaje fillers
  { id: "uae", name: "Emiratos Árabes", code: "UAE", flag: "🇦🇪", group: "L", confederation: "AFC" },
  { id: "irq", name: "Irak", code: "IRQ", flag: "🇮🇶", group: "K", confederation: "AFC" },
  { id: "ven", name: "Venezuela", code: "VEN", flag: "🇻🇪", group: "J", confederation: "CONMEBOL" },
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
      [0, 1], [2, 3],
      [0, 2], [1, 3],
      [0, 3], [1, 2],
    ];
    pairs.forEach((p, idx) => {
      const stadium = stadiums[(gi + idx) % stadiums.length];
      const day = dayOffset + Math.floor(idx / 2);
      const hour = (idx % 2 === 0) ? 18 : 21;
      // Some matches have results to demo scoring
      const isPast = day < 4;
      out.push({
        id: `m${id++}`,
        homeId: ts[p[0]].id,
        awayId: ts[p[1]].id,
        date: matchDate(day, hour),
        stadium: stadium.stadium,
        city: stadium.city,
        stage: "Grupos",
        group: g,
        status: isPast ? "finished" : "scheduled",
        homeScore: isPast ? Math.floor(Math.random() * 4) : undefined,
        awayScore: isPast ? Math.floor(Math.random() * 3) : undefined,
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
  "POR", "POR", "POR",
  "DEF", "DEF", "DEF", "DEF", "DEF", "DEF", "DEF", "DEF",
  "MED", "MED", "MED", "MED", "MED", "MED", "MED", "MED",
  "DEL", "DEL", "DEL", "DEL", "DEL", "DEL", "DEL",
];

const firstNames = ["Lucas", "Mateo", "Diego", "Carlos", "Marco", "Luis", "Juan", "Pedro", "Pablo", "Sergio", "Andrés", "Rafael", "Nicolás", "Kevin", "Adrián", "Hugo", "Iván", "Daniel", "Bruno", "Tomás", "Joaquín", "Maximiliano", "Emilio", "Felipe", "Gonzalo", "Federico"];
const lastNames = ["Silva", "Rodríguez", "García", "Martínez", "López", "Sánchez", "Pérez", "Fernández", "Torres", "Ramírez", "Morales", "Castro", "Vargas", "Romero", "Herrera", "Mendoza", "Cruz", "Ortiz", "Reyes", "Jiménez", "Aguilar", "Delgado", "Núñez", "Peña", "Cabrera", "Vega"];
const clubs = ["Real Madrid", "Barcelona", "Manchester City", "Liverpool", "Bayern Munich", "PSG", "Inter", "Milan", "Juventus", "Atlético Madrid", "Chelsea", "Arsenal", "Borussia Dortmund", "Napoli", "Tottenham", "Boca Juniors", "River Plate", "Flamengo", "Palmeiras"];

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

export const ranking: RankingEntry[] = [
  { position: 1, username: "elprofeta", avatar: "🧙", points: 142, exact: 18, partial: 32, streak: 7 },
  { position: 2, username: "messi_fan10", avatar: "🐐", points: 138, exact: 17, partial: 33, streak: 5 },
  { position: 3, username: "tactico", avatar: "🧠", points: 131, exact: 15, partial: 36, streak: 3 },
  { position: 4, username: "lacrack", avatar: "🔥", points: 124, exact: 14, partial: 34, streak: 2 },
  { position: 5, username: "vamosarg", avatar: "🇦🇷", points: 119, exact: 13, partial: 33, streak: 4 },
  { position: 6, username: "mundialista", avatar: "🌍", points: 115, exact: 12, partial: 33, streak: 1 },
  { position: 7, username: "pibedeoro", avatar: "⚽", points: 108, exact: 11, partial: 32, streak: 0 },
  { position: 8, username: "elcomentarista", avatar: "🎙️", points: 103, exact: 10, partial: 31, streak: 2 },
  { position: 9, username: "futbolero99", avatar: "👟", points: 97, exact: 9, partial: 30, streak: 1 },
  { position: 10, username: "garra_charrua", avatar: "🇺🇾", points: 94, exact: 9, partial: 28, streak: 0 },
  { position: 11, username: "samba", avatar: "🥁", points: 88, exact: 8, partial: 28, streak: 0 },
  { position: 12, username: "tucapitán", avatar: "©️", points: 81, exact: 7, partial: 26, streak: 1 },
];

export function getGroupStandings(group: string) {
  const ts = getTeamsByGroup(group);
  return ts.map((t) => {
    const ms = matches.filter((m) => m.group === group && (m.homeId === t.id || m.awayId === t.id) && m.status === "finished");
    let pj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    ms.forEach((m) => {
      pj++;
      const isHome = m.homeId === t.id;
      const f = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      const c = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
      gf += f; gc += c;
      if (f > c) pg++; else if (f === c) pe++; else pp++;
    });
    return { team: t, pj, pg, pe, pp, gf, gc, dg: gf - gc, pts: pg * 3 + pe };
  }).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}
