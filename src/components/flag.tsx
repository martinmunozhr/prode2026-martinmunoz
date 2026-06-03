// El CSS de flag-icons se importa globalmente en src/styles.css (ver nota allí).
import { cn } from "@/lib/utils";

// Map team id (our internal ids) → ISO 3166-1 alpha-2 country code used by flag-icons.
// Cubre las 48 selecciones del Mundial 2026 + algunos legacy ids del proyecto viejo
// que pueden seguir referenciandose en codigo o screenshots.
// Casos especiales: gb-eng (Inglaterra), gb-sct (Escocia) usan sub-region.
const ID_TO_ISO2: Record<string, string> = {
  // Group A
  mex: "mx",
  rsa: "za",
  kor: "kr",
  cze: "cz",
  // Group B
  can: "ca",
  bih: "ba",
  qat: "qa",
  sui: "ch",
  // Group C
  bra: "br",
  mar: "ma",
  hai: "ht",
  sco: "gb-sct",
  // Group D
  usa: "us",
  par: "py",
  aus: "au",
  tur: "tr",
  // Group E
  ger: "de",
  cuw: "cw",
  civ: "ci",
  ecu: "ec",
  // Group F
  ned: "nl",
  jpn: "jp",
  swe: "se",
  tun: "tn",
  // Group G
  irn: "ir",
  nzl: "nz",
  bel: "be",
  egy: "eg",
  // Group H
  esp: "es",
  cpv: "cv",
  ksa: "sa",
  uru: "uy",
  // Group I
  fra: "fr",
  sen: "sn",
  irq: "iq",
  nor: "no",
  // Group J
  arg: "ar",
  alg: "dz",
  aut: "at",
  jor: "jo",
  // Group K
  por: "pt",
  cod: "cd",
  uzb: "uz",
  col: "co",
  // Group L
  ing: "gb-eng",
  cro: "hr",
  gha: "gh",
  pan: "pa",
  // Legacy ids (no clasificaron pero pueden aparecer en codigo viejo)
  ita: "it",
  den: "dk",
  pol: "pl",
  ser: "rs",
  ven: "ve",
  crc: "cr",
  jam: "jm",
  uae: "ae",
  nga: "ng",
  cmr: "cm",
};

export function teamIdToIso2(id: string): string | null {
  return ID_TO_ISO2[id] ?? null;
}

type FlagProps = {
  /** internal team id (e.g. "arg") */
  teamId?: string;
  /** override ISO 2-letter code directly */
  iso2?: string;
  /** rectangle (4x3) or square (1x1) */
  shape?: "rect" | "square";
  /** tailwind class controlling visual size; default w-8 */
  className?: string;
  alt?: string;
};

/**
 * SVG flag rendered via the `flag-icons` package — works on every OS
 * (Windows does not render emoji flag glyphs).
 */
export function Flag({ teamId, iso2, shape = "rect", className, alt }: FlagProps) {
  const code = iso2 ?? (teamId ? teamIdToIso2(teamId) : null);
  if (!code) {
    // Fallback: a neutral pill so layout never collapses.
    return (
      <span
        role="img"
        aria-label={alt ?? "bandera"}
        className={cn(
          "inline-block rounded-sm bg-muted",
          shape === "square" ? "aspect-square" : "aspect-[4/3]",
          className,
        )}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={alt ?? code}
      className={cn(
        "fi inline-block rounded-sm shadow-sm overflow-hidden",
        `fi-${code}`,
        shape === "square" && "fis", // fis = flag-icon-square
        className,
      )}
      style={
        shape === "rect"
          ? {
              width: "1.5em",
              height: "1.125em",
              lineHeight: 1,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              width: "1.5em",
              height: "1.5em",
              lineHeight: 1,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
      }
    />
  );
}
