import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Target, CheckCircle2, Zap, Sparkles, Lock, Star } from "lucide-react";
import pelota from "@/assets/elementos/pelota.webp";

export const Route = createFileRoute("/reglas")({
  head: () => ({
    meta: [
      { title: "Reglas — Prode Mundial 2026" },
      { name: "description", content: "Cómo se juega y cómo se suman puntos en el Prode del Mundial 2026." },
      { property: "og:title", content: "Reglas del Prode Mundial 2026" },
      { property: "og:description", content: "Sistema de puntos, multiplicadores y Bola de Cristal explicados simple." },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-4xl">
      <header className="relative mb-10 overflow-visible">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Cómo se juega</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Reglas del Prode</h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-xl">
          Simple, claro y para toda la familia. Cargá tus pronósticos antes de cada partido y sumá puntos.
        </p>
        <img
          src={pelota}
          alt=""
          aria-hidden
          className="hidden md:block absolute -top-2 right-0 h-28 lg:h-36 object-contain pointer-events-none drop-shadow-2xl"
        / loading="lazy" decoding="async">
      </header>

      <Section icon={<Target />} title="Puntos por partido">
        <Card title="1 punto" tone="accent" desc="Si acertás el resultado (gana local, gana visitante o empate). Por ejemplo: pronosticaste 2-1 y salió 3-0 → ganaron los locales, sumás 1 punto." />
        <Card title="3 puntos" tone="primary" desc="Si acertás el marcador EXACTO. Pronosticaste 2-1 y salió 2-1 → 3 puntos. Importante: el marcador exacto reemplaza al punto por resultado, NO se suman." />
      </Section>

      <Section icon={<Trophy />} title="Goleadores (opcional, +1 punto extra)">
        <div className="md:col-span-2 rounded-xl border border-border/50 bg-gradient-card p-5 shadow-card-sport">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cuando cargás tu marcador, podés <strong>opcionalmente</strong> elegir quién hará los goles.
            <br />
            <br />
            Por cada goleador que aciertes sumás <strong>+1 punto extra</strong> (que también se multiplica en mata-mata, ver abajo).
            <br />
            <br />
            La cantidad de goleadores debe coincidir exactamente con tu pronóstico:
          </p>
          <ul className="mt-3 text-sm space-y-1.5 text-muted-foreground">
            <li>• Si pronosticás <strong>2-1</strong>, elegís 2 jugadores del local y 1 del visitante.</li>
            <li>• Si pensás que <strong>uno hace los 2</strong> (hat-trick parcial), elegís al mismo jugador 2 veces.</li>
            <li>• Si <strong>no querés arriesgar</strong> goleadores, no pasa nada — no perdés puntos.</li>
            <li>• Si pronosticás <strong>0-0</strong>, no hay goleadores que elegir.</li>
          </ul>
        </div>
      </Section>

      <Section icon={<Zap />} title="Multiplicadores por fase">
        <div className="md:col-span-2 rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-widest">
              <tr><th className="text-left p-3">Fase</th><th className="text-right p-3">Multiplicador</th><th className="text-right p-3">Ejemplo (marcador exacto)</th></tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <Row stage="Fase de Grupos" mult="x1" example="3 pts" />
              <Row stage="Dieciseisavos" mult="x1" example="3 pts" />
              <Row stage="Octavos de Final" mult="x1.5" example="4 pts" />
              <Row stage="Cuartos de Final" mult="x2" example="6 pts" />
              <Row stage="Semifinales" mult="x2.5" example="7 pts" />
              <Row stage="Tercer Puesto" mult="x2" example="6 pts" />
              <Row stage="Final" mult="x3" example="9 pts" highlight />
            </tbody>
          </table>
          <div className="bg-secondary/20 p-3 text-xs text-muted-foreground">
            💡 Los multiplicadores también aplican a los goleadores. En la Final, cada goleador acertado vale 3 puntos.
          </div>
        </div>
      </Section>

      <Section icon={<Sparkles />} title="Bola de Cristal (predicciones del torneo)">
        <Card title="Campeón" tone="primary" desc="10 puntos si acertás quién levanta la copa." />
        <Card title="Goleador del torneo" tone="accent" desc="7 puntos por acertar al máximo artillero." />
        <Card title="Mejor jugador" tone="accent" desc="7 puntos por acertar al MVP del Mundial." />
        <Card title="Mejor arquero" tone="muted" desc="5 puntos por acertar al guante de oro." />
        <Card title="Premio Fair Play" tone="muted" desc="3 puntos por acertar al equipo más limpio." />
      </Section>

      <Section icon={<Lock />} title="Cierre y reglas importantes">
        <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
          <Tip text="Cada partido se cierra al iniciar el partido. Después no podés modificar tu pronóstico." />
          <Tip text="La Bola de Cristal se cierra al iniciar el primer partido del Mundial." />
          <Tip text="Los puntos se calculan automáticamente al cargarse el resultado oficial." />
          <Tip text="El ranking se actualiza en tiempo real. Si subís o bajás, lo ves al toque." />
        </div>
      </Section>

      <div className="mt-12 text-center">
        <Link
          to="/mis-pronosticos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform"
        >
          <CheckCircle2 className="h-4 w-4" /> Cargar mis pronósticos
        </Link>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary">{icon}</div>
        <h2 className="font-display text-2xl tracking-wider">{title}</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

function Card({ title, tone, desc }: { title: string; tone: "primary" | "accent" | "muted"; desc: string }) {
  const colors = {
    primary: "border-primary/40 bg-primary/5",
    accent: "border-accent/40 bg-accent/5",
    muted: "border-border/50 bg-card/50",
  };
  return (
    <div className={`rounded-xl border ${colors[tone]} p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Star className={`h-4 w-4 ${tone === "primary" ? "text-primary" : tone === "accent" ? "text-accent" : "text-muted-foreground"}`} />
        <div className="font-display text-lg">{title}</div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Row({ stage, mult, example, highlight }: { stage: string; mult: string; example: string; highlight?: boolean }) {
  return (
    <tr className={highlight ? "bg-primary/10 font-bold" : ""}>
      <td className="p-3">{stage}</td>
      <td className="p-3 text-right tabular-nums">{mult}</td>
      <td className="p-3 text-right tabular-nums text-muted-foreground">{example}</td>
    </tr>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/20 border border-border/30">
      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}
