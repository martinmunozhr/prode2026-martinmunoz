import { Player } from "@/lib/mock-data";
import { Flag, teamIdToIso2 } from "@/components/flag";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Star, Trophy, Calendar, MapPin, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

const rarityMeta: Record<Player["rarity"], { label: string; color: string; stars: number; gradient: string }> = {
  common: { label: "Común", color: "text-muted-foreground", stars: 1, gradient: "from-muted/40 to-muted/10" },
  rare: { label: "Rara", color: "text-secondary-foreground", stars: 2, gradient: "from-secondary/40 to-secondary/10" },
  epic: { label: "Épica", color: "text-accent", stars: 3, gradient: "from-accent/40 to-accent/10" },
  legendary: { label: "Leyenda", color: "text-primary", stars: 4, gradient: "from-primary/60 via-accent/40 to-alert/40" },
};

const positionLabel: Record<Player["position"], string> = {
  POR: "Arquero",
  DEF: "Defensor",
  MED: "Mediocampista",
  DEL: "Delantero",
};

export function PlayerModal({ player, teamId, teamFlag, teamName, open, onOpenChange }: {
  player: Player | null;
  teamId?: string;
  teamFlag: string;
  teamName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!player) return null;
  const r = rarityMeta[player.rarity];
  const isLegendary = player.rarity === "legendary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-2 border-primary/30 bg-card">
        <DialogTitle className="sr-only">{player.name} — {teamName}</DialogTitle>
        {/* Hero card */}
        <div className={cn("relative aspect-[3/4] bg-gradient-to-br p-6 flex flex-col", r.gradient, isLegendary && "bg-gradient-holo animate-holo")}>
          {isLegendary && <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-gradient-holo animate-holo" />}

          <div className="flex items-start justify-between relative z-10">
            <div className={cn("font-display text-6xl leading-none", isLegendary ? "text-background" : "text-foreground")}>
              {player.number}
            </div>
            <div className={cn("text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-background/50 backdrop-blur", r.color)}>
              {player.position}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative z-10">
            {teamId && teamIdToIso2(teamId) ? (
              <Flag teamId={teamId} className={cn("text-[10rem] !rounded-lg shadow-elevated", isLegendary && "drop-shadow-2xl")} />
            ) : (
              <div className={cn("text-[10rem] leading-none", isLegendary && "drop-shadow-2xl")}>{teamFlag}</div>
            )}
          </div>

          <div className="relative z-10 text-center">
            <div className={cn("font-display text-3xl leading-tight uppercase tracking-wide", isLegendary ? "text-background" : "text-foreground")}>
              {player.name}
            </div>
            <div className={cn("text-xs uppercase tracking-widest mt-1", isLegendary ? "text-background/80" : "text-muted-foreground")}>
              {teamName}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-5 space-y-4 bg-card">
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: r.stars }).map((_, i) => (
              <Star key={i} className={cn("h-5 w-5 fill-current", r.color)} />
            ))}
            <span className={cn("ml-2 text-xs uppercase tracking-widest font-bold", r.color)}>{r.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat icon={<Hash className="h-4 w-4" />} label="Dorsal" value={`#${player.number}`} />
            <Stat icon={<MapPin className="h-4 w-4" />} label="Posición" value={positionLabel[player.position]} />
            <Stat icon={<Calendar className="h-4 w-4" />} label="Edad" value={`${player.age} años`} />
            <Stat icon={<Trophy className="h-4 w-4" />} label="Club" value={player.club} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {icon}{label}
      </div>
      <div className="font-display text-base tracking-wide truncate">{value}</div>
    </div>
  );
}
