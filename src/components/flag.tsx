import "flag-icons/css/flag-icons.min.css";
import { cn } from "@/lib/utils";

// Map team id (our internal ids) → ISO 3166-1 alpha-2 country code used by flag-icons.
// Special-case GB-ENG for England (uses sub-region code).
const ID_TO_ISO2: Record<string, string> = {
  mex: "mx", can: "ca", usa: "us",
  arg: "ar", bra: "br", uru: "uy", col: "co", ecu: "ec", par: "py", ven: "ve",
  fra: "fr", esp: "es", ing: "gb-eng", ger: "de", ita: "it", por: "pt",
  ned: "nl", bel: "be", cro: "hr", den: "dk", sui: "ch", pol: "pl",
  aut: "at", tur: "tr", ser: "rs", nor: "no",
  crc: "cr", pan: "pa", jam: "jm",
  jpn: "jp", kor: "kr", aus: "au", irn: "ir", ksa: "sa", qat: "qa",
  uae: "ae", irq: "iq",
  mar: "ma", sen: "sn", egy: "eg", nga: "ng", civ: "ci", alg: "dz",
  cmr: "cm", gha: "gh", tun: "tn", rsa: "za",
  nzl: "nz",
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
          ? { width: "1.5em", height: "1.125em", lineHeight: 1, backgroundSize: "cover", backgroundPosition: "center" }
          : { width: "1.5em", height: "1.5em", lineHeight: 1, backgroundSize: "cover", backgroundPosition: "center" }
      }
    />
  );
}
