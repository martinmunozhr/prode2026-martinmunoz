import { createFileRoute, Link } from "@tanstack/react-router";
import { CountdownHero } from "@/components/countdown-hero";
import { MatchCard } from "@/components/match-card";
import { RankingRow } from "@/components/ranking-row";
import { AlbumPreview } from "@/components/album-preview";
import { useUpcomingLiveMatches, useLiveRanking } from "@/lib/live-data";
import { useAuth } from "@/contexts/auth-context";
import { ArrowRight, Trophy, Users, Zap, Target, CalendarClock, Sparkles, Star } from "lucide-react";
import heroChampion from "@/assets/hero-champion.jpg";
import figMessi from "@/assets/figuras/messi.png";
import figMbappe from "@/assets/figuras/mbappe.png";
import figVinicius from "@/assets/figuras/vinicius.png";
import figHaaland from "@/assets/figuras/haaland.png";
import figBellingham from "@/assets/figuras/bellingham.png";
import figRonaldo from "@/assets/figuras/ronaldo.png";

const FIGURAS = [
  { img: figMessi, name: "Messi", country: "Argentina", flag: "🇦🇷" },
  { img: figMbappe, name: "Mbappé", country: "Francia", flag: "🇫🇷" },
  { img: figVinicius, name: "Vinícius Jr.", country: "Brasil", flag: "🇧🇷" },
  { img: figHaaland, name: "Haaland", country: "Noruega", flag: "🇳🇴" },
  { img: figBellingham, name: "Bellingham", country: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { img: figRonaldo, name: "Ronaldo", country: "Portugal", flag: "🇵🇹" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prode Mundial 2026 — Pronosticá cada partido" },
      { name: "description", content: "Sumate al prode del Mundial 2026. Pronosticá los 104 partidos, competí en el ranking global y armá tu álbum de figuritas." },
      { property: "og:title", content: "Prode Mundial 2026" },
      { property: "og:description", content: "Pronosticá cada partido del Mundial 2026 y competí con tus amigos." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const { matches: upcoming, loading: loadingMatches } = useUpcomingLiveMatches(3);
  const { ranking: liveRanking, loading: loadingRanking } = useLiveRanking();
  const top3 = liveRanking.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 md:py-14">
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-hero shadow-elevated p-6 md:p-12">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Inscripciones abiertas
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.9] tracking-tight">
              EL PRODE
              <br />
              <span className="text-gradient-pitch">DEL MUNDIAL</span>
              <br />
              2026.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
              48 selecciones. 104 partidos. Un solo campeón del prode. Pronosticá cada resultado, sumá puntos y escalá en el ranking global.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {user ? (
                <Link to="/mis-pronosticos" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform">
                  Ir a mis pronósticos <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link to="/registro" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform">
                  Sumate al prode <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link to="/fixture" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/50 backdrop-blur font-bold uppercase tracking-wider hover:border-primary/40 transition-colors">
                Ver fixture
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat icon={<Users className="h-5 w-5" />} value="48" label="Selecciones" />
              <Stat icon={<Zap className="h-5 w-5" />} value="104" label="Partidos" />
              <Stat icon={<Trophy className="h-5 w-5" />} value="1" label="Campeón" />
            </div>
          </div>

          <div className="lg:pl-6 space-y-5">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-primary/30 shadow-elevated group">
              <img
                src={heroChampion}
                alt="El Capitán levantando la copa del Mundial 2026"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Quién levantará la copa</div>
                <div className="font-display text-2xl tracking-tight">Tu pronóstico también suma.</div>
              </div>
            </div>
            <div>
              <div className="text-center mb-3">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Inicio del Mundial</div>
                <div className="font-display text-2xl text-foreground mt-1">11 · JUN · 2026</div>
              </div>
              <CountdownHero />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeader
          eyebrow="Calendario"
          title="Próximos partidos"
          action={<Link to="/fixture" className="text-sm font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">Ver todos <ArrowRight className="h-4 w-4" /></Link>}
        />
        {loadingMatches ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[0, 1, 2].map((i) => <div key={i} className="h-44 rounded-2xl bg-gradient-card border border-border/50 animate-pulse" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border/40 bg-gradient-card p-8 text-center">
            <CalendarClock className="h-10 w-10 mx-auto text-accent mb-3" />
            <h3 className="font-display text-2xl tracking-wide">El sorteo todavía no se realizó</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Apenas se confirmen los partidos del Mundial 2026 vas a poder verlos acá y empezar a pronosticar.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
      </section>

      <section className="mt-14">
        <SectionHeader eyebrow="Las figuras" title="Estrellas del Mundial" />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FIGURAS.map((f) => (
            <div
              key={f.name}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-b from-primary/10 via-card to-accent/10 shadow-elevated"
            >
              <img
                src={f.img}
                alt={`${f.name} - ${f.country}`}
                className="absolute inset-x-0 bottom-0 mx-auto h-[110%] object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-background via-background/85 to-transparent pt-10">
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-primary font-bold">
                  <Star className="h-2.5 w-2.5" /> Figura
                </div>
                <div className="font-display text-sm sm:text-base leading-tight mt-0.5">{f.name}</div>
                <div className="text-[10px] text-muted-foreground">{f.flag} {f.country}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <AlbumPreview />
      </section>

      <section className="mt-14">
        <SectionHeader
          eyebrow="Competencia"
          title="Top del ranking"
          action={<Link to="/ranking" className="text-sm font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">Tabla completa <ArrowRight className="h-4 w-4" /></Link>}
        />
        {loadingRanking ? (
          <div className="mt-6 space-y-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-gradient-card border border-border/50 animate-pulse" />)}
          </div>
        ) : top3.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border/40 bg-gradient-card p-8 text-center">
            <Sparkles className="h-10 w-10 mx-auto text-primary mb-3" />
            <h3 className="font-display text-2xl tracking-wide">Sé el primero en el ranking</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Cuando arranquen los partidos y los jugadores carguen sus pronósticos, las posiciones aparecerán acá en tiempo real.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {top3.map((e) => <RankingRow key={e.position} entry={e} highlight={e.position === 1} />)}
          </div>
        )}
      </section>

      {!user && (
        <section className="mt-14 relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-card p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-gradient-pitch opacity-5" />
          <img src={figHaaland} alt="" aria-hidden className="hidden md:block absolute -right-6 -bottom-4 h-72 lg:h-80 object-contain opacity-90 pointer-events-none drop-shadow-2xl" />
          <img src={figMessi} alt="" aria-hidden className="hidden md:block absolute -left-6 -bottom-4 h-72 lg:h-80 object-contain opacity-90 pointer-events-none drop-shadow-2xl" />
          <div className="relative max-w-xl mx-auto">
            <Target className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">¿Listo para demostrar que sabés?</h2>
            <p className="mt-3 text-muted-foreground">Cargá tus pronósticos, competí con tus amigos y armá tu álbum de figuritas con las 48 selecciones.</p>
            <Link to="/registro" className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform">
              Crear mi cuenta gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-card/40 backdrop-blur border border-border/40 rounded-xl p-3">
      <div className="text-primary">{icon}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">{eyebrow}</div>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight mt-1">{title}</h2>
      </div>
      {action}
    </div>
  );
}
