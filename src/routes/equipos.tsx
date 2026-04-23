import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { teams, groupLetters } from "@/lib/mock-data";
import { Flag } from "@/components/flag";

export const Route = createFileRoute("/equipos")({
  head: () => ({
    meta: [
      { title: "Equipos Mundial 2026 — 48 Selecciones" },
      { name: "description", content: "Las 48 selecciones del Mundial 2026 distribuidas en 12 grupos. Conocé sus planteles." },
      { property: "og:title", content: "Equipos Mundial 2026" },
      { property: "og:description", content: "Las 48 selecciones del Mundial 2026." },
    ],
  }),
  component: EquiposPage,
});

function EquiposPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/equipos") {
    return <Outlet />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-10">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Selecciones</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Equipos</h1>
        <p className="mt-2 text-muted-foreground">48 selecciones · 12 grupos · 1 destino: la Final del Mundial.</p>
      </header>

      <div className="space-y-10">
        {groupLetters.map((g) => {
          const groupTeams = teams.filter((t) => t.group === g);
          if (groupTeams.length === 0) return null;
          return (
            <section key={g}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-pitch flex items-center justify-center font-display text-xl text-primary-foreground shadow-glow-pitch">
                  {g}
                </div>
                <h2 className="font-display text-2xl tracking-wider">Grupo {g}</h2>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupTeams.map((t) => (
                  <Link
                    key={t.id}
                    to="/equipos/$equipoId"
                    params={{ equipoId: t.id }}
                    className="group bg-gradient-card border border-border/50 rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-glow-pitch transition-all"
                  >
                    <Flag teamId={t.id} className="text-4xl group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <div className="font-display text-base tracking-wide truncate">{t.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.confederation}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
