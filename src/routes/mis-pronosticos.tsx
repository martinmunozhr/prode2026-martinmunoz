import { createFileRoute } from "@tanstack/react-router";
import { MatchCard } from "@/components/match-card";
import { matches } from "@/lib/mock-data";
import { Target, Clock, Lock } from "lucide-react";

export const Route = createFileRoute("/mis-pronosticos")({
  head: () => ({
    meta: [
      { title: "Mis Pronósticos — Prode Mundial 2026" },
      { name: "description", content: "Cargá tus pronósticos para los próximos partidos del Mundial 2026." },
      { property: "og:title", content: "Mis Pronósticos" },
      { property: "og:description", content: "Tu panel de pronósticos del Mundial 2026." },
    ],
  }),
  component: MisPronosticosPage,
});

function MisPronosticosPage() {
  const pending = matches.filter((m) => m.status === "scheduled").slice(0, 8);
  const finished = matches.filter((m) => m.status === "finished").slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Tu juego</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Mis Pronósticos</h1>
        <p className="mt-2 text-muted-foreground">Cargá tus marcadores antes del inicio de cada partido.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard icon={<Target />} value="0" label="Aciertos exactos" tone="primary" />
        <StatCard icon={<Clock />} value={String(pending.length)} label="Pendientes" tone="accent" />
        <StatCard icon={<Lock />} value={String(finished.length)} label="Cerrados" tone="muted" />
        <StatCard icon={<Target />} value="0" label="Puntos totales" tone="primary" />
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-5 w-5 text-accent" />
          <h2 className="font-display text-2xl tracking-wider">Pendientes</h2>
          <span className="ml-auto text-xs text-muted-foreground">{pending.length} partidos</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {pending.map((m) => <MatchCard key={m.id} match={m} editable />)}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-display text-2xl tracking-wider">Ya jugados</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {finished.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: "primary" | "accent" | "muted" }) {
  const colors = {
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-muted-foreground",
  };
  return (
    <div className="bg-gradient-card border border-border/50 rounded-xl p-4 shadow-card-sport">
      <div className={colors[tone]}>{icon}</div>
      <div className="font-display text-3xl mt-2 tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
