import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MatchCard } from "@/components/match-card";
import { GroupTable } from "@/components/group-table";
import { matches, groupLetters } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fixture")({
  head: () => ({
    meta: [
      { title: "Fixture Mundial 2026 — Calendario completo" },
      { name: "description", content: "Calendario completo del Mundial 2026: todos los partidos por grupo, sede y fecha." },
      { property: "og:title", content: "Fixture Mundial 2026" },
      { property: "og:description", content: "Calendario completo de los 104 partidos del Mundial 2026." },
    ],
  }),
  component: FixturePage,
});

function FixturePage() {
  const [activeGroup, setActiveGroup] = useState<string>("A");
  const groupMatches = matches.filter((m) => m.group === activeGroup);

  const selectGroup = (g: string) => {
    setActiveGroup(g);
    if (typeof window !== "undefined") {
      // smooth scroll the content into view
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Calendario</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Fixture</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">12 grupos de 4 equipos. Los 2 mejores de cada grupo + los 8 mejores terceros pasan a dieciseisavos.</p>
      </header>

      {/* Group selector */}
      <div className="flex flex-wrap gap-2 mb-8 sticky top-16 z-40 bg-background/80 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-border/30" role="tablist" aria-label="Seleccionar grupo">
        {groupLetters.map((g) => (
          <button
            key={g}
            onClick={() => selectGroup(g)}
            role="tab"
            aria-selected={activeGroup === g}
            aria-label={`Grupo ${g}`}
            className={cn(
              "h-11 w-11 rounded-lg font-display text-xl tracking-wider transition-all",
              activeGroup === g
                ? "bg-gradient-pitch text-primary-foreground shadow-glow-pitch scale-110"
                : "bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <div>
          <GroupTable group={activeGroup} />
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl tracking-wider">Partidos del Grupo {activeGroup}</h2>
          {groupMatches.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>
    </div>
  );
}
