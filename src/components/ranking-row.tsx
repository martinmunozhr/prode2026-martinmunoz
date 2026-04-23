import { RankingEntry } from "@/lib/mock-data";
import { Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function RankingRow({ entry, highlight }: { entry: RankingEntry; highlight?: boolean }) {
  const isPodium = entry.position <= 3;
  const podiumColor =
    entry.position === 1 ? "text-accent" :
    entry.position === 2 ? "text-muted-foreground" :
    entry.position === 3 ? "text-orange-400" : "";

  return (
    <div
      className={cn(
        "grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_100px_100px_100px] items-center gap-3 md:gap-4 px-4 py-3 rounded-xl border border-border/40 bg-gradient-card transition-all hover:border-primary/30",
        highlight && "border-primary/50 shadow-glow-pitch",
      )}
    >
      <div className={cn("font-display text-2xl md:text-3xl text-center tabular-nums", isPodium ? podiumColor : "text-muted-foreground")}>
        {entry.position}
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-secondary text-xl shrink-0">
          {entry.avatar}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{entry.username}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {/* Compact stats visible on mobile (hidden on desktop where columns show them) */}
            <span className="md:hidden inline-flex items-center gap-1">
              <Target className="h-3 w-3 text-primary" />
              <span className="tabular-nums font-semibold text-foreground">{entry.exact}</span>
              <span className="opacity-60">·</span>
              <span className="tabular-nums">{entry.partial}p</span>
            </span>
            {entry.streak > 0 && (
              <span className="inline-flex items-center gap-1 text-alert">
                <Flame className="h-3 w-3" />
                <span>{entry.streak}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center gap-1.5 text-sm">
        <Target className="h-4 w-4 text-primary" />
        <span className="tabular-nums font-semibold">{entry.exact}</span>
      </div>
      <div className="hidden md:block text-sm text-center text-muted-foreground tabular-nums">
        {entry.partial}
      </div>

      <div className="font-display text-2xl md:text-3xl text-primary text-right tabular-nums">
        {entry.points}
        <span className="text-xs text-muted-foreground ml-1 font-sans font-normal">pts</span>
      </div>
    </div>
  );
}
