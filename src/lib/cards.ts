// Tipos y constantes del sistema de figuritas / sobres / monedas.
export type CardRarity = "comun" | "raro" | "epico" | "legendario";

export const RARITY_LABEL: Record<CardRarity, string> = {
  comun: "Común",
  raro: "Raro",
  epico: "Épico",
  legendario: "Legendario",
};

export const RARITY_ORDER: CardRarity[] = ["legendario", "epico", "raro", "comun"];

export const RARITY_STARS: Record<CardRarity, number> = {
  comun: 1,
  raro: 2,
  epico: 3,
  legendario: 4,
};

export type PackType = CardRarity;

export type PackDef = {
  type: PackType;
  cost: number;
  cards: number;
  /** Probabilidades C / R / E / L (no incluye garantía del legendario) */
  odds: Record<CardRarity, number>;
  guaranteesLegendary?: boolean;
  description: string;
};

export const PACKS: PackDef[] = [
  {
    type: "comun",
    cost: 100,
    cards: 5,
    odds: { comun: 0.75, raro: 0.22, epico: 0.03, legendario: 0 },
    description: "Sobre de bronce. Cinco figuritas, mayoría comunes.",
  },
  {
    type: "raro",
    cost: 250,
    cards: 7,
    odds: { comun: 0.45, raro: 0.45, epico: 0.09, legendario: 0.01 },
    description: "Sobre de plata. Siete figuritas con buena chance de raras.",
  },
  {
    type: "epico",
    cost: 500,
    cards: 9,
    odds: { comun: 0.15, raro: 0.45, epico: 0.35, legendario: 0.05 },
    description: "Sobre de oro. Nueve figuritas, fuerte presencia épica.",
  },
  {
    type: "legendario",
    cost: 1000,
    cards: 11,
    odds: { comun: 0, raro: 0.3, epico: 0.55, legendario: 0.15 },
    guaranteesLegendary: true,
    description: "Sobre legendario. Once figuritas, una legendaria garantizada.",
  },
];

export const PACK_BY_TYPE: Record<PackType, PackDef> = Object.fromEntries(
  PACKS.map((p) => [p.type, p]),
) as Record<PackType, PackDef>;

/** Recompensa de monedas por punto de pronóstico. */
export const COINS_PER_POINT = 100;

/** Bonus configurables. */
export const ACHIEVEMENT_BONUS = {
  /** Por cada acierto exacto consecutivo (resetea al fallar). */
  exactStreakStep: 50,
  /** Por cada goleador acertado en un partido. */
  perGoalscorerHit: 100,
  /** Ganar un desafío de la fecha. */
  challengeWin: 200,
  /** Empate en desafío. */
  challengeDraw: 50,
  /** Pleno (todos los partidos de la fecha aciertados al menos en resultado). */
  perfectRound: 500,
  /** Top 1 del ranking de la fecha. */
  topScorerRound: 1000,
} as const;
