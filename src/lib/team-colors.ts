/**
 * Paleta de color principal por selección.
 * Se usa para teñir banners de equipo, anillos de figuritas, badges, etc.
 *
 * Cada equipo expone:
 *  - color: HEX del color principal "icónico" del seleccionado
 *  - tint: clase Tailwind para fondo translúcido sutil
 *  - ring: clase Tailwind para borde/ring
 *  - text: clase Tailwind para texto de acento
 *
 * Cuando un país no está mapeado, se devuelve el fallback violeta del sistema.
 */

export type TeamPalette = {
  /** HEX, para usar en `style` (gradients, glows) */
  color: string;
  /** secundario opcional para gradients */
  color2?: string;
};

const PALETTE: Record<string, TeamPalette> = {
  // CONMEBOL
  arg: { color: "#75AADB", color2: "#FFFFFF" },              // celeste y blanco
  bra: { color: "#009C3B", color2: "#FFDF00" },              // verde y amarillo
  uru: { color: "#5BC0EB", color2: "#FFFFFF" },              // celeste
  col: { color: "#FFCD00", color2: "#003893" },              // amarillo y azul
  ecu: { color: "#FFD100", color2: "#0072CE" },              // amarillo y azul
  par: { color: "#D52B1E", color2: "#FFFFFF" },              // rojo y blanco
  ven: { color: "#7B1E2D", color2: "#FFCD00" },              // vinotinto

  // CONCACAF
  mex: { color: "#006847", color2: "#CE1126" },              // verde y rojo
  usa: { color: "#0A3161", color2: "#B31942" },              // azul oscuro y rojo
  can: { color: "#D80621", color2: "#FFFFFF" },              // rojo
  crc: { color: "#002B7F", color2: "#CE1126" },
  pan: { color: "#005AA7", color2: "#D21034" },
  jam: { color: "#009B3A", color2: "#FED100" },

  // UEFA
  fra: { color: "#0055A4", color2: "#FFFFFF" },              // azul Francia
  esp: { color: "#AA151B", color2: "#F1BF00" },              // rojo y amarillo
  ing: { color: "#FFFFFF", color2: "#CE1124" },              // blanco con cruz roja
  ger: { color: "#000000", color2: "#FFCC00" },              // negro/dorado
  ita: { color: "#0066CC", color2: "#FFFFFF" },              // azurri
  por: { color: "#006233", color2: "#D52B1E" },
  ned: { color: "#FF6900", color2: "#FFFFFF" },              // naranja
  bel: { color: "#ED2939", color2: "#FAE042" },
  cro: { color: "#171796", color2: "#FF0000" },
  den: { color: "#C60C30", color2: "#FFFFFF" },
  sui: { color: "#DA291C", color2: "#FFFFFF" },
  pol: { color: "#DC143C", color2: "#FFFFFF" },
  aut: { color: "#ED2939", color2: "#FFFFFF" },
  tur: { color: "#E30A17", color2: "#FFFFFF" },
  ser: { color: "#C6363C", color2: "#0C4076" },
  nor: { color: "#BA0C2F", color2: "#00205B" },

  // AFC
  jpn: { color: "#1A237E", color2: "#BC002D" },              // azul samurái
  kor: { color: "#CD2E3A", color2: "#0047A0" },
  aus: { color: "#FFCD00", color2: "#00843D" },              // socceroos
  irn: { color: "#239F40", color2: "#DA0000" },
  ksa: { color: "#006C35", color2: "#FFFFFF" },
  qat: { color: "#8A1538", color2: "#FFFFFF" },
  uae: { color: "#00732F", color2: "#FF0000" },
  irq: { color: "#CE1126", color2: "#FFFFFF" },

  // CAF
  mar: { color: "#C1272D", color2: "#006233" },
  sen: { color: "#00853F", color2: "#FDEF42" },
  egy: { color: "#CE1126", color2: "#000000" },
  nga: { color: "#008753", color2: "#FFFFFF" },              // súper águilas
  civ: { color: "#FF8200", color2: "#009A44" },
  alg: { color: "#006233", color2: "#FFFFFF" },
  cmr: { color: "#007A33", color2: "#CE1126" },              // leones indomables
  gha: { color: "#FFCD00", color2: "#006B3F" },
  tun: { color: "#E70013", color2: "#FFFFFF" },
  rsa: { color: "#007749", color2: "#FFB81C" },              // bafana

  // OFC
  nzl: { color: "#000000", color2: "#FFFFFF" },              // all whites
};

const FALLBACK: TeamPalette = { color: "#A855F7", color2: "#EC4899" };

export function getTeamPalette(teamId: string | undefined | null): TeamPalette {
  if (!teamId) return FALLBACK;
  return PALETTE[teamId] ?? FALLBACK;
}

/**
 * Devuelve un linear-gradient listo para usar en `style.background`,
 * con foco en el color principal del equipo.
 */
export function teamGradient(teamId: string | undefined | null, opts?: { angle?: number; alpha?: number }): string {
  const { color, color2 } = getTeamPalette(teamId);
  const angle = opts?.angle ?? 135;
  const alpha = opts?.alpha ?? 1;
  const c2 = color2 ?? color;
  if (alpha < 1) {
    return `linear-gradient(${angle}deg, ${hexToRgba(color, alpha)} 0%, ${hexToRgba(c2, alpha * 0.6)} 100%)`;
  }
  return `linear-gradient(${angle}deg, ${color} 0%, ${c2} 100%)`;
}

/** glow box-shadow tinted to team color */
export function teamGlow(teamId: string | undefined | null, alpha = 0.45): string {
  const { color } = getTeamPalette(teamId);
  return `0 0 32px ${hexToRgba(color, alpha)}, 0 0 80px ${hexToRgba(color, alpha * 0.5)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
