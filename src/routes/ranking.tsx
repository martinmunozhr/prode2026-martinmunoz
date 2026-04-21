import { createFileRoute } from "@tanstack/react-router";
import { RankingRow } from "@/components/ranking-row";
import { ranking } from "@/lib/mock-data";
import { Trophy, Medal, Award } from "lucide-react";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking Global — Prode Mundial 2026" },
      { name: "description", content: "Tabla de posiciones global del prode del Mundial 2026. Mirá los mejores pronosticadores." },
      { property: "og:title", content: "Ranking Global" },
      { property: "og:description", content: "Los mejores pronosticadores del Mundial 2026." },
    ],
  }),
  component: RankingPage,
});

function RankingPage() {
  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Competencia global</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Ranking</h1>
        <p className="mt-2 text-muted-foreground">3 pts por resultado exacto · 1 pt por ganador correcto.</p>
      </header>

      {/* Podio */}
      <section className="mb-10">
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
          <PodiumCard entry={podium[1]} place={2} icon={<Medal />} height="h-44 md:h-56" tone="silver" />
          <PodiumCard entry={podium[0]} place={1} icon={<Trophy />} height="h-56 md:h-72" tone="gold" />
          <PodiumCard entry={podium[2]} place={3} icon={<Award />} height="h-36 md:h-44" tone="bronze" />
        </div>
      </section>

      {/* Headers */}
      <div className="hidden md:grid grid-cols-[60px_1fr_100px_100px_100px] gap-4 px-4 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        <div className="text-center">Pos</div>
        <div>Jugador</div>
        <div className="text-center">Exactos</div>
        <div className="text-center">Parciales</div>
        <div className="text-right">Puntos</div>
      </div>

      <div className="space-y-2">
        {rest.map((e) => <RankingRow key={e.position} entry={e} />)}
      </div>
    </div>
  );
}

function PodiumCard({ entry, place, icon, height, tone }: { entry: typeof ranking[number]; place: number; icon: React.ReactNode; height: string; tone: "gold" | "silver" | "bronze" }) {
  const styles = {
    gold: "bg-gradient-trophy border-accent/60 shadow-glow-trophy text-accent-foreground",
    silver: "bg-gradient-card border-muted-foreground/40",
    bronze: "bg-gradient-card border-orange-500/40",
  };
  const iconColor = { gold: "text-accent-foreground", silver: "text-muted-foreground", bronze: "text-orange-400" };

  return (
    <div className={`${height} ${styles[tone]} border-2 rounded-2xl p-4 flex flex-col items-center justify-end text-center relative overflow-hidden`}>
      <div className={`absolute top-3 right-3 ${iconColor[tone]}`}>{icon}</div>
      <div className="text-4xl md:text-5xl mb-2">{entry.avatar}</div>
      <div className="font-display text-base md:text-xl tracking-wide truncate w-full">{entry.username}</div>
      <div className={`font-display text-3xl md:text-5xl tabular-nums mt-1 ${tone === "gold" ? "" : "text-primary"}`}>{entry.points}</div>
      <div className="text-[10px] uppercase tracking-widest opacity-80">pts</div>
      <div className={`absolute bottom-2 left-3 font-display text-5xl md:text-6xl opacity-30`}>{place}</div>
    </div>
  );
}
