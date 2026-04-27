// Sistema de puntuación para Prode Mundial 2026
import type { Match } from "@/lib/mock-data";

export type Stage = Match["stage"];

// Multiplicadores por fase del torneo
export const stageMultiplier: Record<Stage, number> = {
  Grupos: 1,
  Dieciseisavos: 1,
  Octavos: 1.5,
  Cuartos: 2,
  Semifinal: 2.5,
  "Tercer Puesto": 2,
  Final: 3,
};

export type Outcome = "home" | "draw" | "away";

export function outcomeOf(home: number, away: number): Outcome {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

/**
 * Puntos de una predicción contra un resultado real.
 * - 3 pts por marcador exacto (reemplaza el 1 pt, NO suma)
 * - 1 pt por acertar el resultado (V/E/D)
 * Multiplicado por la fase del partido.
 */
export function calcMatchPoints(
  pred: { home: number; away: number },
  real: { home: number; away: number },
  stage: Stage,
): number {
  const mult = stageMultiplier[stage] ?? 1;
  if (pred.home === real.home && pred.away === real.away) return 3 * mult;
  if (outcomeOf(pred.home, pred.away) === outcomeOf(real.home, real.away)) return 1 * mult;
  return 0;
}

// ---- Bola de Cristal (predicciones de torneo) ----
export const crystalBallPoints = {
  campeon: 10,
  goleador: 7,
  mejorJugador: 7,
  mejorArquero: 5,
  fairPlay: 3,
};

export type CrystalBallPrediction = {
  campeon_id?: string | null;
  goleador_nombre?: string | null;
  mejor_jugador_nombre?: string | null;
  mejor_arquero_nombre?: string | null;
  fair_play_id?: string | null;
};

export type CrystalBallResult = CrystalBallPrediction;

export function calcCrystalBallPoints(
  pred: CrystalBallPrediction,
  real: CrystalBallResult,
): number {
  let p = 0;
  if (pred.campeon_id && pred.campeon_id === real.campeon_id) p += crystalBallPoints.campeon;
  if (pred.goleador_nombre && pred.goleador_nombre === real.goleador_nombre)
    p += crystalBallPoints.goleador;
  if (pred.mejor_jugador_nombre && pred.mejor_jugador_nombre === real.mejor_jugador_nombre)
    p += crystalBallPoints.mejorJugador;
  if (pred.mejor_arquero_nombre && pred.mejor_arquero_nombre === real.mejor_arquero_nombre)
    p += crystalBallPoints.mejorArquero;
  if (pred.fair_play_id && pred.fair_play_id === real.fair_play_id) p += crystalBallPoints.fairPlay;
  return p;
}

// Lock date: inicio del Mundial 2026
export const WORLD_CUP_KICKOFF = new Date("2026-06-11T20:00:00Z");

export function isCrystalBallLocked(now: Date = new Date()): boolean {
  return now.getTime() >= WORLD_CUP_KICKOFF.getTime();
}
