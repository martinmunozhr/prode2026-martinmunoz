import type { Match } from "@/lib/mock-data";
import { calcMatchPoints, outcomeOf } from "@/lib/scoring";

export type UserPrediction = {
  match_id: string;
  home_score: number;
  away_score: number;
};

export type UserInsights = {
  totalPreds: number;
  finishedPreds: number;
  exact: number;
  partial: number;
  miss: number;
  exactPct: number;
  partialPct: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  topTeamsPicked: { teamId: string; count: number }[];
};

export function computeInsights(
  preds: UserPrediction[],
  matchesById: Record<string, Match>,
): UserInsights {
  let exact = 0,
    partial = 0,
    miss = 0,
    totalPoints = 0;
  let currentStreak = 0,
    bestStreak = 0,
    runningStreak = 0;
  const teamPickCount: Record<string, number> = {};

  // Ordenar por fecha asc para racha
  const sorted = [...preds]
    .map((p) => ({ p, m: matchesById[p.match_id] }))
    .filter((x) => x.m)
    .sort((a, b) => new Date(a.m.date).getTime() - new Date(b.m.date).getTime());

  for (const { p, m } of sorted) {
    const winnerPick =
      outcomeOf(p.home_score, p.away_score) === "home"
        ? m.homeId
        : outcomeOf(p.home_score, p.away_score) === "away"
          ? m.awayId
          : null;
    if (winnerPick) teamPickCount[winnerPick] = (teamPickCount[winnerPick] ?? 0) + 1;

    if (m.status !== "finished" || m.homeScore == null || m.awayScore == null) continue;

    const pts = calcMatchPoints(
      { home: p.home_score, away: p.away_score },
      { home: m.homeScore, away: m.awayScore },
      m.stage,
    );
    totalPoints += pts;

    const isExact = p.home_score === m.homeScore && p.away_score === m.awayScore;
    const isPartial = !isExact && pts > 0;

    if (isExact) exact++;
    else if (isPartial) partial++;
    else miss++;

    if (pts > 0) {
      runningStreak++;
      if (runningStreak > bestStreak) bestStreak = runningStreak;
      currentStreak = runningStreak;
    } else {
      runningStreak = 0;
      currentStreak = 0;
    }
  }

  const finishedPreds = exact + partial + miss;
  const topTeamsPicked = Object.entries(teamPickCount)
    .map(([teamId, count]) => ({ teamId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalPreds: preds.length,
    finishedPreds,
    exact,
    partial,
    miss,
    exactPct: finishedPreds ? (exact / finishedPreds) * 100 : 0,
    partialPct: finishedPreds ? (partial / finishedPreds) * 100 : 0,
    totalPoints,
    currentStreak,
    bestStreak,
    topTeamsPicked,
  };
}
