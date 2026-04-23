import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getTeam, getRoster, matches, isRealRoster, type Player, type Team } from "@/lib/mock-data";
import { PlayerCard } from "@/components/player-card";
import { PlayerModal } from "@/components/player-modal";
import { MatchCard } from "@/components/match-card";
import { Flag } from "@/components/flag";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type LoaderData = { team: Team; roster: Player[]; real: boolean };

export const Route = createFileRoute("/equipos/$equipoId")({
  loader: ({ params }): LoaderData => {
    const team = getTeam(params.equipoId);
    if (!team) throw notFound();
    return { team, roster: getRoster(params.equipoId), real: isRealRoster(params.equipoId) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.team.name} — Plantel y Álbum de Figuritas` },
          { name: "description", content: `Plantel completo de ${loaderData.team.name} para el Mundial 2026: 26 jugadores en formato álbum de figuritas.` },
          { property: "og:title", content: `${loaderData.team.name} — Mundial 2026` },
          { property: "og:description", content: `Plantel y figuritas de ${loaderData.team.name}.` },
        ]
      : [{ title: "Equipo no encontrado" }],
  }),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-5xl">Equipo no encontrado</h1>
      <Link to="/equipos" className="mt-4 inline-block text-primary underline">Ver todos los equipos</Link>
    </div>
  ),
  component: EquipoDetailPage,
});

type PosFilter = "ALL" | Player["position"];
type RarityFilter = "ALL" | Player["rarity"];

function EquipoDetailPage() {
  const { team, roster, real } = Route.useLoaderData() as LoaderData;
  const teamMatches = matches.filter((m) => m.homeId === team.id || m.awayId === team.id).slice(0, 3);

  const [posFilter, setPosFilter] = useState<PosFilter>("ALL");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("ALL");
  const [selected, setSelected] = useState<Player | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return roster.filter((p) => {
      if (posFilter !== "ALL" && p.position !== posFilter) return false;
      if (rarityFilter !== "ALL" && p.rarity !== rarityFilter) return false;
      return true;
    });
  }, [roster, posFilter, rarityFilter]);

  const byPos: Record<Player["position"], Player[]> = {
    POR: filtered.filter((p) => p.position === "POR"),
    DEF: filtered.filter((p) => p.position === "DEF"),
    MED: filtered.filter((p) => p.position === "MED"),
    DEL: filtered.filter((p) => p.position === "DEL"),
  };

  const legendaryCount = roster.filter((p) => p.rarity === "legendary").length;
  const obtained = roster.length; // toda la página = "abriste el sobre"

  let renderIdx = 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/equipos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Todos los equipos
      </Link>

      {/* Team hero */}
      <header className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-hero p-6 md:p-10 mb-10">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <Flag teamId={team.id} className="text-[8rem] md:text-[10rem] !rounded-lg shadow-elevated" />
          <div className="text-center md:text-left">
            <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Grupo {team.group} · {team.confederation}</div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tight mt-1">{team.name}</h1>
            <p className="mt-2 text-muted-foreground">26 jugadores convocados · álbum de figuritas</p>
            {real && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent font-bold bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3" /> Plantel real verificado
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Álbum de figuritas */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-accent font-bold">Álbum Panini</div>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight">Plantel · 26 figuritas</h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pitch/10 border border-pitch/30 text-pitch font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> {obtained} / 26 obtenidas
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
              <Sparkles className="h-3.5 w-3.5" /> {legendaryCount} leyendas
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 p-3 rounded-xl border border-border/50 bg-card/40">
          <FilterGroup
            label="Posición"
            value={posFilter}
            onChange={(v) => setPosFilter(v as PosFilter)}
            options={[
              { v: "ALL", l: "Todos" },
              { v: "POR", l: "POR" },
              { v: "DEF", l: "DEF" },
              { v: "MED", l: "MED" },
              { v: "DEL", l: "DEL" },
            ]}
          />
          <div className="w-px bg-border/50 mx-1 hidden sm:block" />
          <FilterGroup
            label="Rareza"
            value={rarityFilter}
            onChange={(v) => setRarityFilter(v as RarityFilter)}
            options={[
              { v: "ALL", l: "Todas" },
              { v: "legendary", l: "Leyenda" },
              { v: "epic", l: "Épica" },
              { v: "rare", l: "Rara" },
              { v: "common", l: "Común" },
            ]}
          />
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No hay figuritas con esos filtros.</div>
        )}

        {(["POR", "DEF", "MED", "DEL"] as const).map((pos) =>
          byPos[pos].length === 0 ? null : (
            <div key={pos} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg tracking-wider text-muted-foreground">{posLabel(pos)}</h3>
                <div className="flex-1 h-px bg-border/30" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{byPos[pos].length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {byPos[pos].map((p) => {
                  const delay = renderIdx++ * 18;
                  return (
                    <PlayerCard
                      key={p.id}
                      player={p}
                      teamId={team.id}
                      teamFlag={team.flag}
                      animationDelay={delay}
                      onClick={() => { setSelected(p); setModalOpen(true); }}
                    />
                  );
                })}
              </div>
            </div>
          ),
        )}
      </section>

      {/* Próximos partidos */}
      {teamMatches.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-wider mb-4">Próximos partidos</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {teamMatches.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      <PlayerModal
        player={selected}
        teamFlag={team.flag}
        teamName={team.name}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

function FilterGroup<T extends string>({ label, value, onChange, options }: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold hidden sm:inline">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md transition-colors",
              value === o.v
                ? "bg-primary text-primary-foreground"
                : "bg-background/40 text-muted-foreground hover:text-foreground hover:bg-background/80",
            )}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function posLabel(p: "POR" | "DEF" | "MED" | "DEL") {
  return p === "POR" ? "Arqueros" : p === "DEF" ? "Defensores" : p === "MED" ? "Mediocampistas" : "Delanteros";
}
