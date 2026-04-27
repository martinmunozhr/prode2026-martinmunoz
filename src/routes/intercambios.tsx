import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Loader2,
  Plus,
  X,
  Send,
  Check,
  Search,
  Inbox,
  History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { FutCard } from "@/components/fut-card";
import { RARITY_LABEL, type CardRarity } from "@/lib/cards";
import { acceptTradeFn, proposeTradeFn, rejectTradeFn } from "@/lib/cards.functions";
import { authHeaders } from "@/lib/auth-headers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/intercambios")({
  head: () => ({
    meta: [
      { title: "Intercambios — Prode Mundial 2026" },
      {
        name: "description",
        content:
          "Proponé intercambios de figuritas con otros participantes y completá tu álbum más rápido.",
      },
      { property: "og:title", content: "Intercambios — Prode Mundial 2026" },
      {
        property: "og:description",
        content: "Intercambiá tus figuritas repetidas con otros participantes.",
      },
    ],
  }),
  component: IntercambiosPage,
});

type Player = {
  id: string;
  name: string;
  team_id: string;
  position: string;
  jersey_number: number | null;
  club: string | null;
  rarity: CardRarity;
};

type CollectionRow = { player_id: string; quantity: number; player: Player };

type ProfileLite = { id: string; username: string };

type TradeRow = {
  id: string;
  proposer_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message: string | null;
  created_at: string;
};

type TradeItemRow = {
  trade_id: string;
  from_user_id: string;
  player_id: string;
  quantity: number;
  player: Player;
};

type Tab = "recibidas" | "enviadas" | "nuevo" | "historial";

// Lazy import — Outbox icon en lucide se llama "Send"-like; usamos "Inbox" + "Send" pero hagamos versión propia para "enviadas"
function OutboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <path d="M12 13V3" />
      <path d="m9 6 3-3 3 3" />
    </svg>
  );
}

function IntercambiosPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("recibidas");

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ArrowLeftRight className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-4xl">Intercambios entre participantes</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Necesitás ingresar para proponer intercambios y completar tu álbum.
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
          Mercado de figuritas
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Intercambios</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Ofrecé tus repetidas y pedí las que te faltan. El otro participante decide si acepta o
          rechaza tu propuesta.
        </p>
      </header>

      <div className="flex gap-1 p-1 rounded-xl border border-border/50 bg-card/40 w-fit mb-6 overflow-x-auto">
        <TabBtn
          active={tab === "recibidas"}
          onClick={() => setTab("recibidas")}
          icon={Inbox}
          label="Recibidas"
        />
        <TabBtn
          active={tab === "enviadas"}
          onClick={() => setTab("enviadas")}
          icon={OutboxIcon}
          label="Enviadas"
        />
        <TabBtn
          active={tab === "nuevo"}
          onClick={() => setTab("nuevo")}
          icon={Plus}
          label="Nuevo"
        />
        <TabBtn
          active={tab === "historial"}
          onClick={() => setTab("historial")}
          icon={History}
          label="Historial"
        />
      </div>

      {tab === "recibidas" && <ListaTab kind="recibidas" />}
      {tab === "enviadas" && <ListaTab kind="enviadas" />}
      {tab === "historial" && <ListaTab kind="historial" />}
      {tab === "nuevo" && <NuevoTradeTab />}
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
  icon: React.ComponentType<{ className?: string }>;
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

// ─────────── LISTA ───────────
function ListaTab({ kind }: { kind: "recibidas" | "enviadas" | "historial" }) {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeRow[] | null>(null);
  const [items, setItems] = useState<TradeItemRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    let q = supabase.from("trades").select("*").order("created_at", { ascending: false });
    if (kind === "recibidas") q = q.eq("receiver_id", user.id).eq("status", "pending");
    else if (kind === "enviadas") q = q.eq("proposer_id", user.id).eq("status", "pending");
    else q = q.or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`).neq("status", "pending");
    const { data: tr } = await q;
    setTrades((tr ?? []) as TradeRow[]);

    if (tr && tr.length > 0) {
      const ids = tr.map((t) => t.id);
      const { data: its } = await supabase
        .from("trade_items")
        .select(
          "trade_id, from_user_id, player_id, quantity, player:players(id, name, team_id, position, jersey_number, club, rarity)",
        )
        .in("trade_id", ids);
      setItems((its ?? []) as unknown as TradeItemRow[]);

      const userIds = Array.from(new Set(tr.flatMap((t) => [t.proposer_id, t.receiver_id])));
      const { data: pr } = await supabase.from("profiles").select("id, username").in("id", userIds);
      const map: Record<string, ProfileLite> = {};
      (pr ?? []).forEach((p) => {
        map[p.id] = p as ProfileLite;
      });
      setProfiles(map);
    } else {
      setItems([]);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user?.id, kind]);

  const handleAccept = async (id: string) => {
    setBusy(id);
    try {
      await acceptTradeFn({ data: { tradeId: id }, headers: await authHeaders() });
      toast.success("¡Intercambio aceptado! Las figuritas ya están en tu álbum.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo aceptar");
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusy(id);
    try {
      await rejectTradeFn({ data: { tradeId: id }, headers: await authHeaders() });
      toast.success("Intercambio cancelado");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cancelar");
    } finally {
      setBusy(null);
    }
  };

  if (!trades)
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );

  if (trades.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
        <ArrowLeftRight className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          {kind === "recibidas"
            ? "No tenés propuestas pendientes."
            : kind === "enviadas"
              ? "No mandaste ninguna propuesta todavía."
              : "No hay intercambios cerrados."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trades.map((t) => {
        const myItems = items.filter((i) => i.trade_id === t.id && i.from_user_id === user!.id);
        const otherItems = items.filter((i) => i.trade_id === t.id && i.from_user_id !== user!.id);
        const otherUserId = t.proposer_id === user!.id ? t.receiver_id : t.proposer_id;
        const otherUser = profiles[otherUserId]?.username ?? "...";
        const isReceived = t.receiver_id === user!.id && t.status === "pending";
        const isSent = t.proposer_id === user!.id && t.status === "pending";

        return (
          <div key={t.id} className="rounded-2xl border border-border/50 bg-card/40 p-4 md:p-5">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                    t.status === "pending" &&
                      "bg-amber-500/20 text-amber-300 border border-amber-500/40",
                    t.status === "accepted" && "bg-pitch/20 text-pitch border border-pitch/40",
                    t.status === "rejected" && "bg-alert/20 text-alert border border-alert/40",
                    t.status === "cancelled" && "bg-muted text-muted-foreground",
                  )}
                >
                  {t.status === "pending"
                    ? "Pendiente"
                    : t.status === "accepted"
                      ? "Aceptado"
                      : t.status === "rejected"
                        ? "Rechazado"
                        : "Cancelado"}
                </span>
                <span className="text-sm font-bold">
                  {kind === "enviadas" ? "Para " : kind === "recibidas" ? "De " : ""}
                  <span className="text-primary">{otherUser}</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                {isReceived && (
                  <>
                    <button
                      disabled={busy === t.id}
                      onClick={() => handleAccept(t.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-pitch text-pitch-foreground text-xs font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {busy === t.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Aceptar
                    </button>
                    <button
                      disabled={busy === t.id}
                      onClick={() => handleReject(t.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 text-xs font-bold uppercase tracking-wider hover:bg-muted/40 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Rechazar
                    </button>
                  </>
                )}
                {isSent && (
                  <button
                    disabled={busy === t.id}
                    onClick={() => handleReject(t.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 text-xs font-bold uppercase tracking-wider hover:bg-muted/40 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Cancelar
                  </button>
                )}
              </div>
            </div>

            {t.message && (
              <p className="text-sm text-muted-foreground italic border-l-2 border-border/60 pl-3 mb-4">
                "{t.message}"
              </p>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <TradeSide
                title={kind === "recibidas" ? "Te ofrecen" : "Vas a entregar"}
                cards={kind === "recibidas" ? otherItems : myItems}
                highlight={kind === "recibidas"}
              />
              <TradeSide
                title={kind === "recibidas" ? "Te piden" : "Vas a recibir"}
                cards={kind === "recibidas" ? myItems : otherItems}
                highlight={kind !== "recibidas"}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TradeSide({
  title,
  cards,
  highlight,
}: {
  title: string;
  cards: TradeItemRow[];
  highlight: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-3 border",
        highlight ? "border-pitch/30 bg-pitch/5" : "border-border/40 bg-background/30",
      )}
    >
      <div
        className={cn(
          "text-[10px] uppercase tracking-widest font-bold mb-2",
          highlight ? "text-pitch" : "text-muted-foreground",
        )}
      >
        {title}
      </div>
      {cards.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">—</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {cards.map((it) => (
            <div key={it.player_id + it.trade_id} className="relative">
              <FutCard
                size="sm"
                name={it.player.name}
                teamId={it.player.team_id}
                position={it.player.position.slice(0, 3).toUpperCase()}
                jerseyNumber={it.player.jersey_number}
                club={it.player.club}
                rarity={it.player.rarity}
              />
              {it.quantity > 1 && (
                <span className="absolute -top-1 -right-1 z-30 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  ×{it.quantity}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────── NUEVO TRADE ───────────
function NuevoTradeTab() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<ProfileLite[]>([]);
  const [partnerId, setPartnerId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [myCol, setMyCol] = useState<CollectionRow[]>([]);
  const [theirCol, setTheirCol] = useState<CollectionRow[]>([]);
  const [offer, setOffer] = useState<Record<string, number>>({}); // player_id → qty
  const [request, setRequest] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Cargar lista de usuarios
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username")
        .neq("id", user.id)
        .order("username")
        .limit(200);
      setPartners((data ?? []) as ProfileLite[]);
    })();
  }, [user?.id]);

  // Cargar mi colección (con repetidas)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_collection")
        .select(
          "player_id, quantity, player:players(id, name, team_id, position, jersey_number, club, rarity)",
        )
        .eq("user_id", user.id)
        .gt("quantity", 1);
      setMyCol((data ?? []) as unknown as CollectionRow[]);
    })();
  }, [user?.id]);

  // Cargar colección del otro
  useEffect(() => {
    if (!partnerId) {
      setTheirCol([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_collection")
        .select(
          "player_id, quantity, player:players(id, name, team_id, position, jersey_number, club, rarity)",
        )
        .eq("user_id", partnerId)
        .gt("quantity", 1);
      setTheirCol((data ?? []) as unknown as CollectionRow[]);
    })();
    setOffer({});
    setRequest({});
  }, [partnerId]);

  const filteredPartners = useMemo(
    () => partners.filter((p) => p.username.toLowerCase().includes(search.toLowerCase())),
    [partners, search],
  );

  const toggleOffer = (pid: string, max: number) => {
    setOffer((o) => {
      const cur = o[pid] ?? 0;
      const next = cur >= max - 1 ? 0 : cur + 1; // dejamos siempre 1 al usuario
      const copy = { ...o };
      if (next === 0) delete copy[pid];
      else copy[pid] = next;
      return copy;
    });
  };
  const toggleRequest = (pid: string, max: number) => {
    setRequest((o) => {
      const cur = o[pid] ?? 0;
      const next = cur >= max - 1 ? 0 : cur + 1;
      const copy = { ...o };
      if (next === 0) delete copy[pid];
      else copy[pid] = next;
      return copy;
    });
  };

  const offerCount = Object.values(offer).reduce((a, b) => a + b, 0);
  const requestCount = Object.values(request).reduce((a, b) => a + b, 0);
  const canSend = partnerId && offerCount > 0 && requestCount > 0 && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await proposeTradeFn({
        data: {
          receiverId: partnerId,
          message: message || undefined,
          offer: Object.entries(offer).map(([playerId, quantity]) => ({ playerId, quantity })),
          request: Object.entries(request).map(([playerId, quantity]) => ({ playerId, quantity })),
        },
        headers: await authHeaders(),
      });
      toast.success("¡Propuesta enviada!");
      setOffer({});
      setRequest({});
      setMessage("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selección de usuario */}
      <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
          ¿Con quién querés intercambiar?
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar participante..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-background/60 border border-border/60 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {filteredPartners.map((p) => (
            <button
              key={p.id}
              onClick={() => setPartnerId(p.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors",
                partnerId === p.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              {p.username}
            </button>
          ))}
          {filteredPartners.length === 0 && (
            <p className="text-xs text-muted-foreground">Sin resultados.</p>
          )}
        </div>
      </div>

      {partnerId && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <CollectionPicker
              title="Tus repetidas (ofrecés)"
              empty="No tenés repetidas para ofrecer."
              cards={myCol}
              selected={offer}
              onToggle={toggleOffer}
              accent="pitch"
            />
            <CollectionPicker
              title={`Repetidas de ${partners.find((p) => p.id === partnerId)?.username ?? ""} (pedís)`}
              empty="Este usuario no tiene repetidas."
              cards={theirCol}
              selected={request}
              onToggle={toggleRequest}
              accent="primary"
            />
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 280))}
              placeholder="Mensaje para el otro participante (opcional)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background/60 border border-border/60 text-sm resize-none"
            />
            <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
              <div className="text-xs text-muted-foreground">
                Ofrecés <span className="font-bold text-foreground">{offerCount}</span> figurita
                {offerCount !== 1 ? "s" : ""} · Pedís{" "}
                <span className="font-bold text-foreground">{requestCount}</span>
              </div>
              <button
                onClick={send}
                disabled={!canSend}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar propuesta
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CollectionPicker({
  title,
  empty,
  cards,
  selected,
  onToggle,
  accent,
}: {
  title: string;
  empty: string;
  cards: CollectionRow[];
  selected: Record<string, number>;
  onToggle: (pid: string, max: number) => void;
  accent: "pitch" | "primary";
}) {
  const [filter, setFilter] = useState<"todas" | CardRarity>("todas");
  const filtered = useMemo(
    () => (filter === "todas" ? cards : cards.filter((c) => c.player.rarity === filter)),
    [cards, filter],
  );

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {(["todas", "legendario", "epico", "raro", "comun"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-background/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "todas" ? "Todas" : RARITY_LABEL[f as CardRarity]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">{empty}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[480px] overflow-y-auto">
          {filtered.map((c) => {
            const sel = selected[c.player_id] ?? 0;
            const max = c.quantity; // dejamos al menos 1
            return (
              <button
                key={c.player_id}
                onClick={() => onToggle(c.player_id, max)}
                className={cn(
                  "relative rounded-xl transition-all",
                  sel > 0 &&
                    (accent === "pitch"
                      ? "ring-2 ring-pitch shadow-glow-pitch"
                      : "ring-2 ring-primary shadow-glow-pitch"),
                )}
              >
                <FutCard
                  size="sm"
                  name={c.player.name}
                  teamId={c.player.team_id}
                  position={c.player.position.slice(0, 3).toUpperCase()}
                  jerseyNumber={c.player.jersey_number}
                  club={c.player.club}
                  rarity={c.player.rarity}
                  quantity={c.quantity}
                />
                {sel > 0 && (
                  <span className="absolute -top-2 -left-2 z-30 px-2 py-0.5 rounded-full bg-pitch text-pitch-foreground text-[10px] font-bold shadow-glow-pitch">
                    +{sel}
                  </span>
                )}
                <div className="text-[10px] text-muted-foreground mt-0.5">tenés {c.quantity}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
