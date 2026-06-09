import type { Match } from "@/lib/mock-data";

// Ventana de pronóstico: abre 48hs antes del kickoff y cierra en el horario de comienzo.
// El mismo criterio está reflejado del lado servidor en las policies RLS de `predictions`.
export const PRED_WINDOW_MS = 48 * 60 * 60 * 1000;

export type PredState = "open" | "future" | "locked";

// Pasar `now` (Date.now()) permite que la pantalla recalcule el estado con el correr del tiempo.
export function getMatchPredState(match: Match, now: number = Date.now()): PredState {
  if (match.status === "live") return "locked";
  const kickoff = new Date(match.date).getTime();
  if (kickoff > now) {
    return kickoff - now <= PRED_WINDOW_MS ? "open" : "future";
  }
  return "locked";
}
