import { Flag, teamIdToIso2 } from "@/components/flag";
import { cn } from "@/lib/utils";
import type { CardRarity } from "@/lib/cards";
import { RARITY_LABEL, RARITY_STARS } from "@/lib/cards";
import { teamGradient } from "@/lib/team-colors";
import { Star, Lock, User } from "lucide-react";

/**
 * Carta estilo FUT — diseño común para toda la app.
 * - Marco/halo cambia según rareza
 * - Si `locked = true`, se muestra silueta tipo "no tenés esta figurita"
 */
export type FutCardProps = {
  name: string;
  teamId: string;
  position?: string;
  jerseyNumber?: number | null;
  club?: string | null;
  rarity: CardRarity;
  imageUrl?: string;
  /** Si está bloqueada (no la tenés todavía). */
  locked?: boolean;
  /** Cantidad poseída (si > 1, se muestra como repetida). */
  quantity?: number;
  /** Tamaño visual: sm para grids densos, md normal, lg para hero/reveal. */
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  animationDelay?: number;
};

const RARITY_THEME: Record<
  CardRarity,
  { ring: string; halo: string; chip: string; gradient: string; nameColor: string }
> = {
  comun: {
    ring: "ring-1 ring-zinc-400/40",
    halo: "from-zinc-300/10 to-zinc-500/0",
    chip: "bg-zinc-700/70 text-zinc-100",
    gradient: "linear-gradient(160deg, #4a4a52 0%, #2a2a30 100%)",
    nameColor: "text-zinc-100",
  },
  raro: {
    ring: "ring-2 ring-sky-300/60",
    halo: "from-sky-200/15 to-sky-500/0",
    chip: "bg-sky-600/80 text-white",
    gradient: "linear-gradient(160deg, #c0d9ed 0%, #6ea4cc 60%, #3a6f9a 100%)",
    nameColor: "text-slate-900",
  },
  epico: {
    ring: "ring-2 ring-amber-300/80 shadow-[0_0_28px_oklch(0.78_0.18_75/0.45)]",
    halo: "from-amber-200/30 to-amber-500/0",
    chip: "bg-amber-500/90 text-amber-950",
    gradient: "linear-gradient(160deg, #fde68a 0%, #f5c249 50%, #b88419 100%)",
    nameColor: "text-amber-950",
  },
  legendario: {
    ring: "ring-2 ring-fuchsia-300 shadow-[0_0_36px_oklch(0.7_0.24_295/0.6)]",
    halo: "from-fuchsia-300/40 via-amber-200/20 to-cyan-300/30",
    chip: "bg-gradient-to-r from-fuchsia-500 to-amber-400 text-zinc-950",
    gradient: "linear-gradient(135deg, #fde68a 0%, #f0abfc 35%, #a78bfa 70%, #67e8f9 100%)",
    nameColor: "text-zinc-950",
  },
};

const SIZE_CLASS = {
  sm: {
    box: "text-xs",
    num: "text-2xl",
    name: "text-[11px]",
    flag: "text-4xl",
    chip: "text-[8px] px-1.5",
  },
  md: {
    box: "text-sm",
    num: "text-3xl",
    name: "text-sm",
    flag: "text-5xl",
    chip: "text-[9px] px-2",
  },
  lg: {
    box: "text-base",
    num: "text-4xl",
    name: "text-base",
    flag: "text-7xl",
    chip: "text-[10px] px-2.5",
  },
} as const;

export function FutCard({
  name,
  teamId,
  position,
  jerseyNumber,
  club,
  rarity,
  imageUrl,
  locked = false,
  quantity,
  size = "md",
  onClick,
  className,
  animationDelay,
}: FutCardProps) {
  const theme = RARITY_THEME[rarity];
  const sz = SIZE_CLASS[size];
  const stars = RARITY_STARS[rarity];
  const Component = onClick ? "button" : "div";

  // Marco usa color del equipo + gradient de rareza superpuesto; locked usa neutro.
  const background = locked
    ? "linear-gradient(160deg, oklch(0.22 0.04 290) 0%, oklch(0.16 0.03 290) 100%)"
    : `${theme.gradient}, ${teamGradient(teamId, { angle: 160, alpha: 0.55 })}`;

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{
        background,
        animationDelay: animationDelay !== undefined ? `${animationDelay}ms` : undefined,
      }}
      className={cn(
        "relative aspect-[3/4] rounded-2xl overflow-hidden p-3 flex flex-col text-left transition-all duration-300 animate-card-reveal",
        theme.ring,
        locked && "ring-1 ring-border/40 grayscale opacity-70",
        onClick &&
          "cursor-pointer hover:-translate-y-1 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary",
        sz.box,
        className,
      )}
    >
      {/* Halo radial */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
          theme.halo,
        )}
      />

      {/* Patrón estilo holo solo para legendario */}
      {rarity === "legendario" && !locked && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-50 animate-holo bg-gradient-holo"
          aria-hidden
        />
      )}

      {/* Repetida indicator */}
      {!locked && (quantity ?? 0) > 1 && (
        <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-background/80 text-foreground border border-border/60">
          x{quantity}
        </div>
      )}

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/40 backdrop-blur-[2px]">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Sin descubrir
          </span>
        </div>
      )}

      {/* Header: número + posición + rareza */}
      <div className="relative z-10 flex items-start justify-between">
        <div
          className={cn(
            "font-display leading-none",
            sz.num,
            theme.nameColor,
            locked && "text-muted-foreground",
          )}
        >
          {jerseyNumber ?? "?"}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "font-bold uppercase tracking-widest rounded",
              theme.chip,
              sz.chip,
              "py-0.5",
            )}
          >
            {RARITY_LABEL[rarity]}
          </span>
          {position && (
            <span
              className={cn(
                "font-bold uppercase tracking-widest rounded bg-background/40 backdrop-blur",
                sz.chip,
                "py-0.5",
                theme.nameColor,
              )}
            >
              {position}
            </span>
          )}
        </div>
      </div>

      {/* Imagen del jugador o bandera */}
      <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden">
        {imageUrl && !locked ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover object-top rounded-lg drop-shadow-xl"
            loading="lazy"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <User className="absolute h-16 w-16 text-foreground/[0.06]" aria-hidden />
            {teamIdToIso2(teamId) ? (
              <Flag teamId={teamId} className={cn("relative", sz.flag, "!rounded-md drop-shadow-xl")} />
            ) : (
              <span className={cn("relative", sz.flag, "drop-shadow-xl")}>🏳️</span>
            )}
          </div>
        )}
      </div>

      {/* Nombre + club + estrellas */}
      <div className="relative z-10 text-center">
        <div
          className={cn(
            "font-display uppercase tracking-wide truncate",
            sz.name,
            theme.nameColor,
            locked && "text-muted-foreground",
          )}
        >
          {locked ? "???" : name}
        </div>
        {club && !locked && (
          <div
            className={cn(
              "text-[9px] uppercase tracking-widest mt-0.5 truncate opacity-80",
              theme.nameColor,
            )}
          >
            {club}
          </div>
        )}
        <div className="mt-1 flex items-center justify-center gap-0.5">
          {Array.from({ length: stars }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3 w-3 fill-current",
                locked ? "text-muted-foreground/40" : theme.nameColor,
              )}
            />
          ))}
        </div>
      </div>
    </Component>
  );
}
