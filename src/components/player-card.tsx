import { Player } from "@/lib/mock-data";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const rarityStyles: Record<Player["rarity"], { ring: string; bg: string; label: string; stars: number }> = {
  common: { ring: "border-border/50", bg: "bg-gradient-card", label: "Común", stars: 1 },
  rare: { ring: "border-secondary/60", bg: "bg-gradient-card", label: "Rara", stars: 2 },
  epic: { ring: "border-accent/60 shadow-glow-trophy", bg: "bg-gradient-card", label: "Épica", stars: 3 },
  legendary: { ring: "border-primary/70 shadow-glow-pitch", bg: "bg-gradient-holo animate-holo", label: "Leyenda", stars: 4 },
};

const positionColor: Record<Player["position"], string> = {
  POR: "text-accent",
  DEF: "text-blue-400",
  MED: "text-primary",
  DEL: "text-alert",
};

export function PlayerCard({ player, teamFlag, onClick, animationDelay }: { player: Player; teamFlag: string; onClick?: () => void; animationDelay?: number }) {
  const r = rarityStyles[player.rarity];
  const isLegendary = player.rarity === "legendary";

  return (
    <button
      type="button"
      onClick={onClick}
      style={animationDelay !== undefined ? { animationDelay: `${animationDelay}ms` } : undefined}
      className={cn(
        "relative aspect-[3/4] rounded-2xl border-2 overflow-hidden p-3 flex flex-col transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 cursor-pointer group text-left animate-card-reveal focus:outline-none focus:ring-2 focus:ring-primary",
        r.ring,
        r.bg,
      )}
    >
      {/* Holo overlay for legendary */}
      {isLegendary && (
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none bg-gradient-holo animate-holo" />
      )}

      {/* Header: number + position */}
      <div className="flex items-start justify-between relative z-10">
        <div className={cn("font-display text-3xl leading-none", isLegendary ? "text-background" : "text-foreground")}>
          {player.number}
        </div>
        <div className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-background/40 backdrop-blur", positionColor[player.position])}>
          {player.position}
        </div>
      </div>

      {/* Avatar (emoji placeholder) */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className={cn("text-6xl md:text-7xl transition-transform group-hover:scale-110", isLegendary && "drop-shadow-2xl")}>
          {teamFlag}
        </div>
      </div>

      {/* Name + club */}
      <div className="relative z-10 text-center">
        <div className={cn("font-display text-sm md:text-base leading-tight uppercase tracking-wide truncate", isLegendary ? "text-background" : "text-foreground")}>
          {player.name}
        </div>
        <div className={cn("text-[10px] uppercase tracking-wider mt-0.5 truncate", isLegendary ? "text-background/80" : "text-muted-foreground")}>
          {player.club}
        </div>
      </div>

      {/* Rarity stars */}
      <div className="relative z-10 mt-2 flex items-center justify-center gap-0.5">
        {Array.from({ length: r.stars }).map((_, i) => (
          <Star
            key={i}
            className={cn("h-3 w-3 fill-current", isLegendary ? "text-background" : player.rarity === "epic" ? "text-accent" : player.rarity === "rare" ? "text-secondary-foreground" : "text-muted-foreground")}
          />
        ))}
      </div>
    </div>
  );
}
