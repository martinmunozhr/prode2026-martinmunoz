import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MatchCard } from "@/components/match-card";
import { GroupTable } from "@/components/group-table";
import { groupLetters } from "@/lib/mock-data";
import { useLiveMatches } from "@/lib/live-data";
import { cn } from "@/lib/utils";
import figMbappe from "@/assets/figuras/mbappe.webp";
import figVinicius from "@/assets/figuras/vinicius.webp";

const STAGES = ["Grupos", "Dieciseisavos", "Octavos", "Cuartos", "Semifinal", "Tercer Puesto", "Final"] as const;
type Stage = typeof STAGES[number];

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
  const { matches, loading } = useLiveMatches();
  const [stage, setStage] = useState<Stage>("Grupos");
  const [activeGroup, setActiveGroup] = useState<string>("A");

  const stageMatches = matches.filter((m) => m.stage === stage);
  const groupMatches = stageMatches.filter((m) => m.group === activeGroup);
  const knockoutMatches = stageMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectStage = (s: Stage) => {
    setStage(s);
    if (typeof window !== "undefined") requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  const selectGroup = (g: string) => {
    setActiveGroup(g);
    if (typeof window !== "undefined") requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="relative mb-8 rounded-2xl border border-border/40 bg-gradient-card overflow-hidden h-44 md:h-52">
        <div className="relative z-10 p-5 md:p-7 max-w-[60%]">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Calendario</div>
          <h1 className="font-display text-4xl md:text-6xl tracking-tight mt-1">Fixture</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-md">12 grupos de 4. Los 2 mejores y los 8 mejores terceros pasan a dieciseisavos.</p>
        </div>
        <img
          src={figMbappe}
          alt=""
          aria-hidden
          className="hidden md:block absolute right-0 bottom-0 h-[110%] object-contain object-bottom pointer-events-none drop-shadow-2xl"
         loading="lazy" decoding="async" />
      </header>

      {/* Stage selector */}
      <div className="flex flex-wrap gap-2 mb-6 sticky top-16 z-40 bg-background/80 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-border/30">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => selectStage(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
              stage === s
                ? "bg-gradient-pitch text-primary-foreground shadow-glow-pitch"
                : "bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {stage === "Grupos" ? (
        <>
          <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Seleccionar grupo">
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
                    : "bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30",
                )}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
            <div className="space-y-6">
              <GroupTable group={activeGroup} />
              <div className="hidden lg:flex relative rounded-2xl border border-border/40 bg-gradient-card overflow-hidden min-h-[340px] items-end justify-center p-4">
                <img
                  src={figVinicius}
                  alt=""
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 mx-auto h-[320px] object-contain pointer-events-none drop-shadow-2xl"
                 loading="lazy" decoding="async" />
                <div className="relative z-10 text-center pb-2">
                  <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Tu próximo movimiento</div>
                  <div className="font-display text-lg leading-tight mt-1">¿Quién pasa de fase?</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-wider">Partidos del Grupo {activeGroup}</h2>
              {loading ? (
                <div className="h-40 rounded-xl bg-muted/30 animate-pulse" />
              ) : groupMatches.length === 0 ? (
                <div className="text-sm text-muted-foreground border border-border/40 rounded-xl p-6 text-center">Sin partidos cargados.</div>
              ) : (
                groupMatches.map((m) => <MatchCard key={m.id} match={m} />)
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            <div className="h-40 rounded-xl bg-muted/30 animate-pulse md:col-span-2" />
          ) : knockoutMatches.length === 0 ? (
            <div className="text-sm text-muted-foreground border border-border/40 rounded-xl p-6 text-center md:col-span-2">
              Esta fase se definirá cuando avance el torneo.
            </div>
          ) : (
            knockoutMatches.map((m) => <MatchCard key={m.id} match={m} />)
          )}
        </div>
      )}
    </div>
  );
}
