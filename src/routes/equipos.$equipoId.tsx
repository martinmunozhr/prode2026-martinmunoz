import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getTeam, getRoster, matches, type Player } from "@/lib/mock-data";
import { PlayerCard } from "@/components/player-card";
import { MatchCard } from "@/components/match-card";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/equipos/$equipoId")({
  loader: ({ params }) => {
    const team = getTeam(params.equipoId);
    if (!team) throw notFound();
    return { team, roster: getRoster(params.equipoId) };
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

function EquipoDetailPage() {
  const { team, roster } = Route.useLoaderData();
  const teamMatches = matches.filter((m) => m.homeId === team.id || m.awayId === team.id).slice(0, 3);

  const byPos: Record<Player["position"], Player[]> = {
    POR: roster.filter((p: Player) => p.position === "POR"),
    DEF: roster.filter((p: Player) => p.position === "DEF"),
    MED: roster.filter((p: Player) => p.position === "MED"),
    DEL: roster.filter((p: Player) => p.position === "DEL"),
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/equipos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Todos los equipos
      </Link>

      {/* Team hero */}
      <header className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-hero p-6 md:p-10 mb-10">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="text-[8rem] md:text-[10rem] leading-none drop-shadow-2xl">{team.flag}</div>
          <div className="text-center md:text-left">
            <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Grupo {team.group} · {team.confederation}</div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tight mt-1">{team.name}</h1>
            <p className="mt-2 text-muted-foreground">26 jugadores convocados · álbum de figuritas</p>
          </div>
        </div>
      </header>

      {/* Próximos partidos */}
      {teamMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-wider mb-4">Próximos partidos</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {teamMatches.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Álbum de figuritas */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-accent font-bold">Álbum Panini</div>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight">Plantel · 26 figuritas</h2>
          </div>
          <div className="text-xs text-muted-foreground hidden md:block">Hover para ampliar · Estrellas = rareza</div>
        </div>

        {(["POR", "DEF", "MED", "DEL"] as const).map((pos) => (
          <div key={pos} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-display text-lg tracking-wider text-muted-foreground">{posLabel(pos)}</h3>
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{byPos[pos].length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {byPos[pos].map((p: Player) => (
                <PlayerCard key={p.id} player={p} teamFlag={team.flag} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function posLabel(p: "POR" | "DEF" | "MED" | "DEL") {
  return p === "POR" ? "Arqueros" : p === "DEF" ? "Defensores" : p === "MED" ? "Mediocampistas" : "Delanteros";
}
