import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Package, BarChart3, Sparkles, PackageOpen } from "lucide-react";
import { simulatePackFn, simulateOpenPackFn } from "@/lib/cards.functions";
import { PACKS, RARITY_LABEL, RARITY_ORDER, type CardRarity, type PackType } from "@/lib/cards";
import { FutCard } from "@/components/fut-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authHeaders } from "@/lib/auth-headers";

export const Route = createFileRoute("/admin/sobres")({
  component: AdminSobres,
});

type SimCard = {
  player_id: string;
  rarity: CardRarity;
  player_name: string;
  team_id: string;
  position: string;
  jersey_number: number | null;
  club: string | null;
};

const RARITY_COLOR: Record<CardRarity, string> = {
  comun: "bg-zinc-500",
  raro: "bg-sky-500",
  epico: "bg-amber-500",
  legendario: "bg-fuchsia-500",
};

function AdminSobres() {
  const [packType, setPackType] = useState<PackType>("epico");
  const [iter, setIter] = useState<number>(500);
  const [running, setRunning] = useState(false);
  const [opening, setOpening] = useState(false);
  const [reveal, setReveal] = useState<SimCard[] | null>(null);
  const [result, setResult] = useState<{ rarity: CardRarity; count: number }[] | null>(null);

  const run = async () => {
    setRunning(true);
    try {
      const r = await simulatePackFn({ data: { packType, iterations: iter }, headers: await authHeaders() });
      setResult(r.result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en la simulación");
    } finally {
      setRunning(false);
    }
  };

  const openOne = async () => {
    setOpening(true);
    try {
      const r = await simulateOpenPackFn({ data: { packType }, headers: await authHeaders() });
      setReveal(r.cards as SimCard[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error abriendo sobre");
    } finally {
      setOpening(false);
    }
  };

  const total = useMemo(() => result?.reduce((a, b) => a + Number(b.count), 0) ?? 0, [result]);
  const pack = PACKS.find((p) => p.type === packType)!;

  useEffect(() => { setResult(null); }, [packType]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-pitch shadow-glow-pitch">
          <Package className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl tracking-wider">Simulador de sobres</h2>
          <p className="text-xs text-muted-foreground">Probá la distribución de rarezas sin gastar monedas reales.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/40 p-5 grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Tipo de sobre</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {PACKS.map((p) => (
              <button
                key={p.type}
                onClick={() => setPackType(p.type)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors",
                  packType === p.type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                {RARITY_LABEL[p.type]}
                <span className="block text-[9px] opacity-70 mt-0.5">{p.cards} cartas</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Iteraciones (1–10000)</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={iter}
            onChange={(e) => setIter(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
            className="mt-2 w-full px-3 py-2 rounded-lg bg-background/60 border border-border/60 font-mono text-sm"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Total cartas a simular: {(iter * pack.cards).toLocaleString()}</p>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={run}
            disabled={running}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider text-xs shadow-glow-pitch hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            Simular
          </button>
          <button
            onClick={openOne}
            disabled={opening}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-accent/50 bg-accent/10 text-accent font-bold uppercase tracking-wider text-xs hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {opening ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageOpen className="h-4 w-4" />}
            Abrir 1 sobre
          </button>
        </div>
      </div>

      {/* Probabilidades teóricas */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Odds teóricas — sobre {RARITY_LABEL[packType]}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RARITY_ORDER.map((r) => (
            <div key={r} className="rounded-lg border border-border/40 bg-background/30 p-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", RARITY_COLOR[r])} />
                <span className="text-xs font-bold uppercase tracking-wider">{RARITY_LABEL[r]}</span>
              </div>
              <div className="font-display text-3xl mt-1">{Math.round(pack.odds[r] * 100)}%</div>
            </div>
          ))}
        </div>
        {pack.guaranteesLegendary && (
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-300/10 border border-amber-300/30 px-3 py-1.5 rounded-md">
            <Sparkles className="h-3.5 w-3.5" /> 1 Legendario garantizado
          </div>
        )}
      </div>

      {/* Resultados */}
      {result && (
        <div className="rounded-2xl border border-pitch/40 bg-pitch/5 p-5">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-pitch font-bold">Resultado de la simulación</div>
              <div className="font-display text-2xl">{total.toLocaleString()} cartas</div>
            </div>
            <div className="text-xs text-muted-foreground">{iter} sobres × {pack.cards} cartas</div>
          </div>
          <div className="space-y-2">
            {RARITY_ORDER.map((r) => {
              const row = result.find((x) => x.rarity === r);
              const count = Number(row?.count ?? 0);
              const pct = total ? (count / total) * 100 : 0;
              const expected = pack.odds[r] * 100;
              const delta = pct - expected;
              return (
                <div key={r} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", RARITY_COLOR[r])} />
                    {RARITY_LABEL[r]}
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-background/60 overflow-hidden">
                    <div className={cn("h-full", RARITY_COLOR[r])} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-24 text-right text-sm font-mono tabular-nums">
                    {count.toLocaleString()} <span className="text-muted-foreground">({pct.toFixed(1)}%)</span>
                  </div>
                  <div className={cn(
                    "w-16 text-right text-xs font-mono tabular-nums",
                    Math.abs(delta) < 1 ? "text-muted-foreground" : delta > 0 ? "text-pitch" : "text-alert",
                  )}>
                    {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-4">
            Δ = diferencia respecto a las odds teóricas. Cuantas más iteraciones, más se debería acercar a 0.
          </p>
        </div>
      )}

      {reveal && <SimRevealModal cards={reveal} onClose={() => setReveal(null)} />}
    </div>
  );
}

function SimRevealModal({ cards, onClose }: { cards: SimCard[]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const showAll = step >= cards.length;
  const current = !showAll ? cards[step] : null;

  useEffect(() => { setFlipped(false); }, [step]);

  const advance = () => {
    if (!flipped) { setFlipped(true); return; }
    setStep((s) => s + 1);
  };
  const skipAll = () => setStep(cards.length);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 overflow-auto">
      {current?.rarity === "legendario" && flipped && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.7_0.24_295/0.35),transparent_60%)] animate-pulse" />
      )}
      {current?.rarity === "epico" && flipped && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.78_0.18_75/0.25),transparent_65%)]" />
      )}

      <div className="max-w-5xl w-full relative">
        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-widest text-accent font-bold">Simulación · sin afectar tu álbum</div>
          <h2 className="font-display text-4xl mt-1">{showAll ? "Botín simulado" : `Carta ${step + 1} de ${cards.length}`}</h2>
          {!showAll && (
            <button onClick={skipAll} className="text-xs text-muted-foreground hover:text-foreground mt-2 underline underline-offset-4">
              Saltar animación
            </button>
          )}
        </div>

        {showAll ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {cards.map((c, i) => (
                <FutCard
                  key={i}
                  name={c.player_name}
                  teamId={c.team_id}
                  position={c.position.slice(0, 3).toUpperCase()}
                  jerseyNumber={c.jersey_number}
                  club={c.club}
                  rarity={c.rarity}
                  animationDelay={i * 60}
                  size="md"
                />
              ))}
            </div>
            <div className="text-center mt-6">
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch">
                Cerrar
              </button>
            </div>
          </>
        ) : current ? (
          <button
            onClick={advance}
            className="block mx-auto group"
            aria-label="Revelar siguiente carta"
            style={{ perspective: "1200px" }}
          >
            <div
              className="w-64 transition-transform duration-700"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
              }}
            >
              {flipped ? (
                <div key={step} className="animate-card-flip">
                  <FutCard
                    name={current.player_name}
                    teamId={current.team_id}
                    position={current.position.slice(0, 3).toUpperCase()}
                    jerseyNumber={current.jersey_number}
                    club={current.club}
                    rarity={current.rarity}
                    size="lg"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4.2] w-full rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-zinc-900 via-purple-950 to-zinc-900 flex items-center justify-center shadow-elevated relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.7_0.24_295/0.3),transparent_50%)]" />
                  <Sparkles className="h-20 w-20 text-accent animate-pulse" />
                  <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] uppercase tracking-widest text-white/70">
                    Tocá para revelar
                  </div>
                </div>
              )}
            </div>
            <div className="text-center mt-4 text-xs text-muted-foreground uppercase tracking-widest">
              {flipped ? "Tocá para continuar" : "Tocá la carta"}
            </div>
          </button>
        ) : null}
      </div>
    </div>
  );
}
