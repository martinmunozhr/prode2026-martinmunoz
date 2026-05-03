import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { RankingRow } from "@/components/ranking-row";
import { useLiveRanking, type LiveRankingEntry } from "@/lib/live-data";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Trophy, Medal, Award, Users, Share2 } from "lucide-react";
import figRonaldo from "@/assets/figuras/ronaldo.webp";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking Global — Prode Mundial 2026" },
      {
        name: "description",
        content:
          "Tabla de posiciones global del prode del Mundial 2026. Mirá los mejores pronosticadores.",
      },
      { property: "og:title", content: "Ranking Global" },
      { property: "og:description", content: "Los mejores pronosticadores del Mundial 2026." },
    ],
  }),
  component: RankingPage,
});

function ordinal(n: number): string {
  return `${n}°`;
}

async function shareRanking(myPosition: number, myPoints: number, total: number) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const text =
    total > 0
      ? `Voy ${ordinal(myPosition)} de ${total} en el Prode Mundial 2026 con ${myPoints} pts. ¿Te animás a superarme? ${url}`
      : `Estoy jugando el Prode Mundial 2026. Sumate al ranking. ${url}`;
  const data = { title: "Prode Mundial 2026", text, url };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return;
    } catch (e) {
      // El usuario canceló o el navegador rechazó: silencio, no es error real.
      const isAbort = e instanceof Error && e.name === "AbortError";
      if (isAbort) return;
    }
  }

  // Fallback: copiar al portapapeles
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado al portapapeles");
      return;
    } catch {
      // sigue al fallback final
    }
  }

  toast.error("No se pudo compartir desde este navegador");
}

function RankingPage() {
  const { ranking, loading } = useLiveRanking();
  const { user } = useAuth();
  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  const myEntry = useMemo(() => {
    if (!user) return null;
    return ranking.find((e) => e.userId === user.id) ?? null;
  }, [ranking, user]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="relative mb-8 overflow-hidden min-h-[180px]">
        <div className="relative z-10 max-w-[68%]">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">
            Competencia global
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Ranking</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            3 pts por resultado exacto · 1 pt por ganador correcto. Multiplica en mata-mata.
          </p>
        </div>
        <img
          src={figRonaldo}
          alt=""
          aria-hidden
          className="hidden md:block absolute -top-2 right-0 h-44 lg:h-56 object-contain object-bottom pointer-events-none drop-shadow-2xl"
          loading="lazy"
          decoding="async"
        />
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className="h-56 rounded-xl bg-muted/30 animate-pulse" />
          <div className="h-12 rounded-xl bg-muted/20 animate-pulse" />
          <div className="h-12 rounded-xl bg-muted/20 animate-pulse" />
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-16 border border-border/40 rounded-2xl bg-card/40">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-display text-2xl tracking-wider">Todavía no hay jugadores</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sé el primero en registrarte y cargar tus pronósticos.
          </p>
        </div>
      ) : (
        <>
          {myEntry && (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  Tu posición
                </span>
                <span className="font-display text-2xl tracking-wider text-primary">
                  {ordinal(myEntry.position)}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {myEntry.points} pts · {myEntry.exact} exactos
                </span>
              </div>
              <button
                onClick={() => shareRanking(myEntry.position, myEntry.points, ranking.length)}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform"
              >
                <Share2 className="h-3.5 w-3.5" /> Compartir
              </button>
            </div>
          )}

          {/* Podio (sólo si hay 3 o más) */}
          {podium.length >= 3 && (
            <section className="mb-10">
              <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
                <PodiumCard
                  entry={podium[1]}
                  place={2}
                  icon={<Medal />}
                  height="h-44 md:h-56"
                  tone="silver"
                />
                <PodiumCard
                  entry={podium[0]}
                  place={1}
                  icon={<Trophy />}
                  height="h-56 md:h-72"
                  tone="gold"
                />
                <PodiumCard
                  entry={podium[2]}
                  place={3}
                  icon={<Award />}
                  height="h-36 md:h-44"
                  tone="bronze"
                />
              </div>
            </section>
          )}

          <div className="hidden md:grid grid-cols-[60px_1fr_100px_100px_100px] gap-4 px-4 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            <div className="text-center">Pos</div>
            <div>Jugador</div>
            <div className="text-center">Exactos</div>
            <div className="text-center">Parciales</div>
            <div className="text-right">Puntos</div>
          </div>

          <div className="space-y-2">
            {(rest.length > 0 ? rest : podium).map((e) => (
              <RankingRow key={e.userId} entry={e} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PodiumCard({
  entry,
  place,
  icon,
  height,
  tone,
}: {
  entry: LiveRankingEntry;
  place: number;
  icon: React.ReactNode;
  height: string;
  tone: "gold" | "silver" | "bronze";
}) {
  const styles = {
    gold: "bg-gradient-trophy border-accent/60 shadow-glow-trophy text-accent-foreground",
    silver: "bg-gradient-card border-muted-foreground/40",
    bronze: "bg-gradient-card border-orange-500/40",
  };
  const iconColor = {
    gold: "text-accent-foreground",
    silver: "text-muted-foreground",
    bronze: "text-orange-400",
  };

  return (
    <div
      className={`${height} ${styles[tone]} border-2 rounded-2xl p-4 flex flex-col items-center justify-end text-center relative overflow-hidden`}
    >
      <div className={`absolute top-3 right-3 ${iconColor[tone]}`}>{icon}</div>
      <div className="text-4xl md:text-5xl mb-2">{entry.avatar}</div>
      <div className="font-display text-base md:text-xl tracking-wide truncate w-full">
        {entry.username}
      </div>
      <div
        className={`font-display text-3xl md:text-5xl tabular-nums mt-1 ${tone === "gold" ? "" : "text-primary"}`}
      >
        {entry.points}
      </div>
      <div className="text-[10px] uppercase tracking-widest opacity-80">pts</div>
      <div className={`absolute bottom-2 left-3 font-display text-5xl md:text-6xl opacity-30`}>
        {place}
      </div>
    </div>
  );
}
