import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Coins,
  Package,
  BookOpen,
  ArrowLeftRight,
  Sparkles,
  Loader2,
  Recycle,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { useCoins } from "@/hooks/use-coins";
import { FutCard } from "@/components/fut-card";
import { PACKS, RARITY_LABEL, RARITY_ORDER, type CardRarity, type PackType } from "@/lib/cards";
import { openPackFn, recycleCardFn, type OpenedCard } from "@/lib/cards.functions";
import { authHeaders } from "@/lib/auth-headers";
import { teams as MOCK_TEAMS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function FiguritasError({ error }: { error: unknown }) {
  // El detalle técnico va a la consola, no a la cara del usuario.
  useEffect(() => {
    console.error("Figuritas render error:", error);
  }, [error]);
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center"
      style={{ minHeight: "60vh" }}
    >
      <Package className="h-12 w-12 text-muted-foreground/60" />
      <h2 className="font-display text-2xl tracking-wider">No pudimos abrir las figuritas</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Hubo un problema cargando esta sección. Probá recargar la página.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-pitch px-6 py-3 font-bold uppercase tracking-wider text-primary-foreground shadow-glow-pitch hover:scale-105 transition-transform"
      >
        Recargar
      </button>
    </div>
  );
}

export const Route = createFileRoute("/figuritas")({
  errorComponent: FiguritasError,
  head: () => ({
    meta: [
      { title: "Figuritas y Sobres — Prode Mundial 2026" },
      {
        name: "description",
        content:
          "Abrí sobres con las monedas que ganás en el prode, completá tu álbum y intercambiá con otros participantes.",
      },
      { property: "og:title", content: "Figuritas y Sobres — Prode Mundial 2026" },
      {
        property: "og:description",
        content:
          "Sistema de paquetes de figuritas: ganá monedas, abrí sobres, completá el álbum, intercambiá.",
      },
    ],
  }),
  component: FiguritasPage,
});

type Tab = "sobres" | "coleccion" | "intercambios";

function FiguritasPage() {
  const { user, loading: authLoading } = useAuth();
  const { balance } = useCoins();
  const [tab, setTab] = useState<Tab>("sobres");

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-4xl">Tu álbum te espera</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Necesitás una cuenta para ganar monedas, abrir sobres e intercambiar figuritas.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-md border border-border text-sm font-bold uppercase tracking-wider"
          >
            Ingresar
          </Link>
          <Link
            to="/registro"
            className="px-5 py-2.5 rounded-md bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch"
          >
            Sumate
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-accent font-bold">
          Álbum del Mundial
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Figuritas</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Por cada punto que sumás en el prode te llevás{" "}
          <strong className="text-foreground">100 monedas</strong>. Usalas para abrir sobres,
          completar tu álbum y desafiar a otros participantes.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-trophy text-trophy-foreground font-bold shadow-glow-trophy">
          <Coins className="h-4 w-4" />
          <span className="font-display text-2xl tracking-wider">{balance ?? "—"}</span>
          <span className="text-xs uppercase tracking-widest">monedas</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-border/50 bg-card/40 w-fit mb-6 overflow-x-auto">
        <TabBtn
          active={tab === "sobres"}
          onClick={() => setTab("sobres")}
          icon={Package}
          label="Sobres"
        />
        <TabBtn
          active={tab === "coleccion"}
          onClick={() => setTab("coleccion")}
          icon={BookOpen}
          label="Mi colección"
        />
        <TabBtn
          active={tab === "intercambios"}
          onClick={() => setTab("intercambios")}
          icon={ArrowLeftRight}
          label="Intercambios"
        />
      </div>

      {tab === "sobres" && <SobresTab balance={balance ?? 0} />}
      {tab === "coleccion" && <ColeccionTab />}
      {tab === "intercambios" && <IntercambiosTab />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Package;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground shadow-glow-pitch"
          : "text-muted-foreground hover:text-foreground hover:bg-background/40",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ─────────── SOBRES ───────────
function SobresTab({ balance }: { balance: number }) {
  const [opening, setOpening] = useState<PackType | null>(null);
  const [reveal, setReveal] = useState<OpenedCard[] | null>(null);

  const handleOpen = async (packType: PackType) => {
    setOpening(packType);
    try {
      const { cards } = await openPackFn({ data: { packType }, headers: await authHeaders() });
      setReveal(cards);
      toast.success("¡Sobre abierto!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo abrir el sobre");
    } finally {
      setOpening(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PACKS.map((p) => {
          const cant = balance >= p.cost;
          const rarityKey: CardRarity = p.type;
          return (
            <div
              key={p.type}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3",
                rarityKey === "legendario" &&
                  "border-fuchsia-400/60 shadow-[0_0_28px_oklch(0.7_0.24_295/0.4)]",
                rarityKey === "epico" && "border-amber-400/60",
                rarityKey === "raro" && "border-sky-400/60",
                rarityKey === "comun" && "border-zinc-500/60",
              )}
              style={{
                background:
                  rarityKey === "legendario"
                    ? "linear-gradient(160deg, #6b21a8 0%, #f0abfc 50%, #fde68a 100%)"
                    : rarityKey === "epico"
                      ? "linear-gradient(160deg, #92400e 0%, #f5c249 100%)"
                      : rarityKey === "raro"
                        ? "linear-gradient(160deg, #1e3a5f 0%, #6ea4cc 100%)"
                        : "linear-gradient(160deg, #3f3f46 0%, #71717a 100%)",
              }}
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-widest font-bold text-white/80">
                  Sobre
                </div>
                <div className="font-display text-3xl tracking-wider text-white">
                  {RARITY_LABEL[rarityKey]}
                </div>
                <div className="text-xs text-white/80 mt-0.5">{p.cards} figuritas</div>
              </div>

              <p className="relative text-xs text-white/90 leading-snug">{p.description}</p>

              <div className="relative space-y-1">
                <div className="text-[10px] uppercase tracking-widest font-bold text-white/70 pb-0.5">
                  Chances de cada figurita
                </div>
                {RARITY_ORDER.filter((r) => p.odds[r] > 0).map((r) => (
                  <div key={r} className="flex justify-between text-xs text-white/90">
                    <span>{RARITY_LABEL[r]}</span>
                    <span className="font-mono font-bold">{Math.round(p.odds[r] * 100)}%</span>
                  </div>
                ))}
                {p.guaranteesLegendary && (
                  <div className="text-[11px] font-bold text-amber-100 flex items-center gap-1 pt-1">
                    <Sparkles className="h-3 w-3" /> 1 Legendario garantizado
                  </div>
                )}
              </div>

              <button
                disabled={!cant || opening !== null}
                onClick={() => handleOpen(p.type)}
                className={cn(
                  "relative mt-auto w-full px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all",
                  cant
                    ? "bg-white text-zinc-900 hover:scale-[1.02]"
                    : "bg-white/20 text-white/60 cursor-not-allowed",
                )}
              >
                {opening === p.type ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Coins className="h-4 w-4" />
                )}
                {p.cost}
              </button>
            </div>
          );
        })}
      </div>

      {reveal && <RevealModal cards={reveal} onClose={() => setReveal(null)} />}
    </>
  );
}

function RevealModal({ cards, onClose }: { cards: OpenedCard[]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const showAll = step >= cards.length;
  const current = !showAll ? cards[step] : null;

  // Reset flip on each new card
  useEffect(() => {
    setFlipped(false);
  }, [step]);

  const advance = () => {
    if (!flipped) {
      setFlipped(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const skipAll = () => setStep(cards.length);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 overflow-auto">
      {/* Glow especial para legendarios */}
      {current?.rarity === "legendario" && flipped && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.7_0.24_295/0.35),transparent_60%)] animate-pulse" />
      )}
      {current?.rarity === "epico" && flipped && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.78_0.18_75/0.25),transparent_65%)]" />
      )}

      <div className="max-w-5xl w-full relative">
        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-widest text-accent font-bold">
            ¡Sobre abierto!
          </div>
          <h2 className="font-display text-4xl mt-1">
            {showAll ? "Tu botín" : `Carta ${step + 1} de ${cards.length}`}
          </h2>
          {!showAll && (
            <button
              onClick={skipAll}
              className="text-xs text-muted-foreground hover:text-foreground mt-2 underline underline-offset-4"
            >
              Saltar animación
            </button>
          )}
        </div>

        {showAll ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {cards.map((c, i) => (
                <div key={i} className="relative">
                  <FutCard
                    name={c.player_name}
                    teamId={c.team_id}
                    position={c.position.slice(0, 3).toUpperCase()}
                    jerseyNumber={c.jersey_number}
                    club={c.club}
                    rarity={c.rarity}
                    imageUrl={c.image_url ?? undefined}
                    animationDelay={i * 60}
                    size="md"
                  />
                  {c.is_new && (
                    <span className="absolute -top-2 -left-2 z-30 px-2 py-0.5 rounded-full bg-pitch text-pitch-foreground text-[10px] font-bold uppercase tracking-wider shadow-glow-pitch">
                      ¡Nueva!
                    </span>
                  )}
                  {c.is_duplicate && (
                    <span className="absolute -top-2 -left-2 z-30 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border">
                      Repetida
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-6 flex gap-3 justify-center">
              <Link
                to="/intercambios"
                className="px-5 py-2.5 rounded-lg border border-border text-sm font-bold uppercase tracking-wider hover:bg-muted/40"
              >
                Ir a intercambios
              </Link>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch"
              >
                Listo
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
                    imageUrl={current.image_url ?? undefined}
                    size="lg"
                  />
                  {current.is_new && (
                    <div className="text-center mt-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-pitch text-pitch-foreground text-xs font-bold uppercase tracking-wider shadow-glow-pitch">
                        ¡Nueva en tu álbum!
                      </span>
                    </div>
                  )}
                  {current.is_duplicate && (
                    <div className="text-center mt-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider border border-border">
                        Repetida — reciclala por monedas
                      </span>
                    </div>
                  )}
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

// ─────────── COLECCIÓN ───────────
type CollectionItem = {
  player_id: string;
  quantity: number;
  player: {
    id: string;
    name: string;
    team_id: string;
    position: string;
    jersey_number: number | null;
    club: string | null;
    rarity: CardRarity;
    image_url: string | null;
  };
};

function ColeccionTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<CollectionItem[] | null>(null);
  const [filter, setFilter] = useState<"todas" | "repetidas" | CardRarity>("todas");
  const [recycling, setRecycling] = useState<string | null>(null);
  const [confirmRecycle, setConfirmRecycle] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_collection")
      .select(
        "player_id, quantity, player:players(id, name, team_id, position, jersey_number, club, rarity, image_url)",
      )
      .eq("user_id", user.id)
      .gt("quantity", 0);
    setItems((data ?? []) as unknown as CollectionItem[]);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user?.id]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "todas") return items;
    if (filter === "repetidas") return items.filter((i) => i.quantity > 1);
    return items.filter((i) => i.player.rarity === filter);
  }, [items, filter]);

  const stats = useMemo(() => {
    const acc = { total: 0, comun: 0, raro: 0, epico: 0, legendario: 0, dup: 0 };
    items?.forEach((i) => {
      acc.total++;
      acc[i.player.rarity]++;
      if (i.quantity > 1) acc.dup++;
    });
    return acc;
  }, [items]);

  const handleRecycle = async (playerId: string) => {
    setRecycling(playerId);
    try {
      const r = await recycleCardFn({ data: { playerId }, headers: await authHeaders() });
      toast.success(`+${r.refund} monedas (${RARITY_LABEL[r.rarity]})`);
      if (r.bonus_player_id && r.bonus_rarity) {
        toast.success(`🎉 ¡Carta garantizada ${RARITY_LABEL[r.bonus_rarity]}!`);
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo reciclar");
    } finally {
      setRecycling(null);
    }
  };

  if (!items) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Total" value={stats.total} />
        <Stat label="Legendarios" value={stats.legendario} accent="text-fuchsia-400" />
        <Stat label="Épicos" value={stats.epico} accent="text-amber-400" />
        <Stat label="Raros" value={stats.raro} accent="text-sky-400" />
        <Stat label="Repetidas" value={stats.dup} accent="text-pitch" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["todas", "repetidas", "legendario", "epico", "raro", "comun"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "todas"
              ? "Todas"
              : f === "repetidas"
                ? "Repetidas"
                : RARITY_LABEL[f as CardRarity]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {items.length === 0
            ? 'Tu álbum está vacío. Tocá la pestaña "Sobres" (arriba) y abrí tu primer sobre con monedas.'
            : "No hay figuritas con ese filtro."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((it, i) => (
            <div key={it.player_id} className="relative">
              <FutCard
                name={it.player.name}
                teamId={it.player.team_id}
                position={it.player.position.slice(0, 3).toUpperCase()}
                jerseyNumber={it.player.jersey_number}
                club={it.player.club}
                rarity={it.player.rarity}
                imageUrl={it.player.image_url ?? undefined}
                quantity={it.quantity}
                animationDelay={i * 18}
              />
              {it.quantity > 1 && (
                <button
                  disabled={recycling === it.player_id}
                  onClick={() => setConfirmRecycle(it.player_id)}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pitch text-pitch-foreground text-[11px] font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform disabled:opacity-50"
                  title="Cambiar una repetida por monedas"
                >
                  <Recycle className="h-3 w-3" />
                  Reciclar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resumen por equipo: link a álbum */}
      <div className="mt-12 p-5 rounded-xl border border-border/50 bg-card/40">
        <h3 className="font-display text-xl tracking-wider mb-2">Tu álbum por selección</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Mirá qué figuritas te faltan de cada equipo en su perfil. Las que no obtuviste aparecen
          como silueta.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {MOCK_TEAMS.slice(0, 16).map((t) => (
            <Link
              key={t.id}
              to="/equipos/$equipoId"
              params={{ equipoId: t.id }}
              className="px-2 py-2 rounded-lg border border-border/50 bg-background/30 hover:border-primary/40 text-center"
            >
              <div className="text-2xl">{t.flag}</div>
              <div className="text-[10px] uppercase tracking-widest mt-1 truncate">{t.name}</div>
            </Link>
          ))}
        </div>
        <Link
          to="/equipos"
          className="block mt-4 text-center text-sm text-primary font-bold uppercase tracking-wider"
        >
          Ver todas las selecciones →
        </Link>
      </div>

      {confirmRecycle &&
        (() => {
          const item = items.find((i) => i.player_id === confirmRecycle);
          if (!item) return null;
          return (
            <RecycleConfirmModal
              item={item}
              busy={recycling === item.player_id}
              onCancel={() => setConfirmRecycle(null)}
              onConfirm={() => {
                setConfirmRecycle(null);
                handleRecycle(item.player_id);
              }}
            />
          );
        })()}
    </>
  );
}

function RecycleConfirmModal({
  item,
  busy,
  onConfirm,
  onCancel,
}: {
  item: CollectionItem;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-2xl p-6">
        <div className="flex items-center gap-2 text-pitch">
          <Recycle className="h-5 w-5" />
          <span className="text-xs uppercase tracking-widest font-bold">Reciclar repetida</span>
        </div>
        <h3 className="font-display text-2xl tracking-wide mt-2">{item.player.name}</h3>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Vas a cambiar <strong>una</strong> de tus {item.quantity} figuritas repetidas de{" "}
          {item.player.name} por <strong>monedas</strong> (según su rareza:{" "}
          {RARITY_LABEL[item.player.rarity]}).
        </p>
        <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-foreground/80">
          ✅ No perdés la figurita: te queda en el álbum. Solo se va una de las repetidas.
        </div>
        <p className="text-xs text-muted-foreground mt-3">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border/60 text-sm font-bold uppercase tracking-wider hover:bg-muted/40 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 px-4 py-2.5 rounded-lg bg-pitch text-pitch-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-[1.02] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Recycle className="h-4 w-4" />}
            Sí, reciclar
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-3">
      <div className={cn("font-display text-3xl", accent)}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

// ─────────── INTERCAMBIOS ───────────
function IntercambiosTab() {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
      <ArrowLeftRight className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <h3 className="font-display text-2xl">Intercambios entre participantes</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        Ofrecé tus repetidas a otros usuarios y pediles las que te faltan. Los intercambios
        funcionan con cartas múltiples por cada lado.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link
          to="/intercambios"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider text-sm shadow-glow-pitch hover:scale-105 transition-transform"
        >
          <ArrowLeftRight className="h-4 w-4" /> Ir a intercambios
        </Link>
      </div>
      <div className="mt-6 inline-flex items-start gap-2 px-4 py-2.5 rounded-lg bg-pitch/10 border border-pitch/40 text-pitch text-xs max-w-md text-left">
        <Trash2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          ¿Te salió una figurita repetida? Cambiala por monedas. Cada 10 repetidas que reciclás, te
          regalamos una figurita.
        </span>
      </div>
    </div>
  );
}
