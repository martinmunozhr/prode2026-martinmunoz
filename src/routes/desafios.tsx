import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Swords, Check, X, Clock, Trophy, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  useRounds,
  useChallenges,
  useAllProfiles,
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  cancelChallenge,
  isRoundLocked,
  describeChallengeOutcome,
  type Round,
} from "@/lib/challenges";
import { toast } from "sonner";

export const Route = createFileRoute("/desafios")({
  head: () => ({
    meta: [
      { title: "Desafíos — Prode Mundial 2026" },
      { name: "description", content: "Desafiá a tus amigos jornada por jornada y llevate sus puntos." },
    ],
  }),
  component: DesafiosPage,
});

function DesafiosPage() {
  const { user, loading: loadingAuth } = useAuth();
  const { rounds, loading: loadingRounds } = useRounds();
  const { challenges, profiles, loading: loadingCh } = useChallenges();
  const { profiles: allProfiles, loading: loadingAll } = useAllProfiles(user?.id);

  const [selectedRound, setSelectedRound] = useState<string>("");
  const [selectedOpponent, setSelectedOpponent] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const activeRound = useMemo(
    () => rounds.find((r) => r.id === selectedRound) ?? rounds[0],
    [rounds, selectedRound],
  );

  // Jornadas en las que el usuario ya tiene un desafío activo (pending/accepted)
  const myActiveRounds = useMemo(() => {
    if (!user) return new Set<string>();
    const s = new Set<string>();
    for (const c of challenges) {
      if ((c.status === "pending" || c.status === "accepted") &&
          (c.challenger_id === user.id || c.opponent_id === user.id)) {
        s.add(c.round_id);
      }
    }
    return s;
  }, [challenges, user]);

  // Oponentes ya bloqueados en esa jornada
  const blockedOpponents = useMemo(() => {
    if (!activeRound) return new Set<string>();
    const s = new Set<string>();
    for (const c of challenges) {
      if (c.round_id === activeRound.id && (c.status === "pending" || c.status === "accepted")) {
        s.add(c.challenger_id);
        s.add(c.opponent_id);
      }
    }
    return s;
  }, [challenges, activeRound]);

  const myChallenges = useMemo(
    () => (user ? challenges.filter((c) => c.challenger_id === user.id || c.opponent_id === user.id) : []),
    [challenges, user],
  );
  const otherChallenges = useMemo(
    () => (user ? challenges.filter((c) => c.challenger_id !== user.id && c.opponent_id !== user.id) : challenges),
    [challenges, user],
  );

  if (loadingAuth) {
    return <div className="container mx-auto px-4 py-12 text-muted-foreground">Cargando…</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-md mx-auto text-center bg-gradient-card border border-border/50 rounded-3xl p-8 shadow-card-sport">
          <Swords className="h-12 w-12 mx-auto text-primary mb-3" />
          <h1 className="font-display text-3xl tracking-wide">Desafíos 1 vs 1</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Iniciá sesión para desafiar a otros participantes y llevarte sus puntos jornada por jornada.
          </p>
          <Link to="/login" className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider text-sm">
            Ingresar
          </Link>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!activeRound || !selectedOpponent) {
      toast.error("Elegí jornada y rival");
      return;
    }
    if (myActiveRounds.has(activeRound.id)) {
      toast.error("Ya tenés un desafío activo en esta jornada");
      return;
    }
    if (blockedOpponents.has(selectedOpponent)) {
      toast.error("Ese rival ya tiene un desafío activo en esta jornada");
      return;
    }
    setSubmitting(true);
    try {
      await createChallenge(user.id, selectedOpponent, activeRound.id);
      toast.success("Desafío enviado. Esperá que tu rival lo acepte.");
      setSelectedOpponent("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear el desafío");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-14">
      <header className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-bold uppercase tracking-widest">
          <Swords className="h-3.5 w-3.5" />
          Nuevo modo
        </div>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">Desafíos por jornada</h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
          Desafiá a un participante por los puntos que sume en una jornada. <strong>1 desafío por jornada</strong>.
          El ganador se lleva sus puntos <em>+ los del rival</em>. En caso de empate, cada uno se lleva la mitad de los puntos del otro.
        </p>
      </header>

      {/* Crear desafío */}
      <section className="mt-8 rounded-2xl border border-border/50 bg-gradient-card p-5 sm:p-6 shadow-card-sport">
        <h2 className="font-display text-2xl tracking-wide mb-4 flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" /> Crear desafío
        </h2>

        {loadingRounds || loadingAll ? (
          <div className="h-24 rounded-lg bg-muted/30 animate-pulse" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">
                Jornada
              </label>
              <select
                value={activeRound?.id ?? ""}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:border-primary"
              >
                {rounds.map((r) => (
                  <option key={r.id} value={r.id} disabled={isRoundLocked(r)}>
                    {r.name}{isRoundLocked(r) ? " (cerrada)" : ""}
                  </option>
                ))}
              </select>
              {activeRound && (
                <RoundMeta round={activeRound} alreadyHas={myActiveRounds.has(activeRound.id)} />
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">
                Rival
              </label>
              <select
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:border-primary"
                disabled={!activeRound || isRoundLocked(activeRound) || myActiveRounds.has(activeRound.id)}
              >
                <option value="">Elegí un rival…</option>
                {allProfiles.map((p) => (
                  <option key={p.id} value={p.id} disabled={blockedOpponents.has(p.id)}>
                    {p.username}{blockedOpponents.has(p.id) ? " (ocupado)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={handleCreate}
                disabled={
                  submitting ||
                  !activeRound ||
                  !selectedOpponent ||
                  isRoundLocked(activeRound) ||
                  myActiveRounds.has(activeRound.id)
                }
                className="px-5 py-2.5 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider text-sm shadow-glow-pitch hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? "Enviando…" : "Enviar desafío"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Mis desafíos */}
      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wide mb-4">Mis desafíos</h2>
        {loadingCh ? (
          <div className="h-20 rounded-lg bg-muted/30 animate-pulse" />
        ) : myChallenges.length === 0 ? (
          <EmptyState
            icon={<Swords className="h-8 w-8 text-muted-foreground" />}
            title="Todavía no tenés desafíos"
            text="Elegí una jornada y un rival arriba para empezar."
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {myChallenges.map((c) => (
              <ChallengeCard
                key={c.id}
                c={c}
                rounds={rounds}
                profiles={profiles}
                viewerId={user.id}
                onAccept={async () => {
                  try { await acceptChallenge(c.id); toast.success("Desafío aceptado"); }
                  catch (e) { toast.error(e instanceof Error ? e.message : "Error"); }
                }}
                onReject={async () => {
                  try { await rejectChallenge(c.id); toast.success("Desafío rechazado"); }
                  catch (e) { toast.error(e instanceof Error ? e.message : "Error"); }
                }}
                onCancel={async () => {
                  try { await cancelChallenge(c.id); toast.success("Desafío cancelado"); }
                  catch (e) { toast.error(e instanceof Error ? e.message : "Error"); }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Otros desafíos */}
      {otherChallenges.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-wide mb-4">Otros desafíos en juego</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {otherChallenges.slice(0, 8).map((c) => (
              <ChallengeCard
                key={c.id}
                c={c}
                rounds={rounds}
                profiles={profiles}
                viewerId={user.id}
                readOnly
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RoundMeta({ round, alreadyHas }: { round: Round; alreadyHas: boolean }) {
  return (
    <div className="mt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
      {round.starts_at ? (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> Arranca {new Date(round.starts_at).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> Sin partidos cargados todavía
        </span>
      )}
      {alreadyHas && (
        <span className="inline-flex items-center gap-1 text-accent">
          <AlertCircle className="h-3 w-3" /> Ya tenés un desafío activo en esta jornada
        </span>
      )}
    </div>
  );
}

function ChallengeCard({
  c, rounds, profiles, viewerId, onAccept, onReject, onCancel, readOnly,
}: {
  c: import("@/lib/challenges").Challenge;
  rounds: Round[];
  profiles: Map<string, import("@/lib/challenges").ProfileLite>;
  viewerId: string;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}) {
  const round = rounds.find((r) => r.id === c.round_id);
  const challenger = profiles.get(c.challenger_id);
  const opponent = profiles.get(c.opponent_id);
  const iAmChallenger = c.challenger_id === viewerId;
  const iAmOpponent = c.opponent_id === viewerId;
  const outcomeText = describeChallengeOutcome(c, viewerId);

  const statusBadge = (() => {
    switch (c.status) {
      case "pending":   return <span className="px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-wider">Pendiente</span>;
      case "accepted":  return <span className="px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider">En curso</span>;
      case "rejected":  return <span className="px-2 py-0.5 rounded-full bg-muted/40 border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Rechazado</span>;
      case "cancelled": return <span className="px-2 py-0.5 rounded-full bg-muted/40 border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Cancelado</span>;
      case "resolved":  return <span className="px-2 py-0.5 rounded-full bg-trophy/20 border border-trophy/40 text-trophy text-[10px] font-bold uppercase tracking-wider">Resuelto</span>;
    }
  })();

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-card p-4 shadow-card-sport">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          {round?.name ?? c.round_id}
        </div>
        {statusBadge}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <PlayerSide name={challenger?.username ?? "—"} side="Retador" you={iAmChallenger}
          points={c.challenger_points} winner={c.winner_id === c.challenger_id} />
        <Swords className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <PlayerSide name={opponent?.username ?? "—"} side="Rival" you={iAmOpponent}
          points={c.opponent_points} winner={c.winner_id === c.opponent_id} alignRight />
      </div>

      {outcomeText && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-trophy">
          <Trophy className="h-3.5 w-3.5" /> {outcomeText}
        </div>
      )}

      {!readOnly && c.status === "pending" && (
        <div className="mt-3 flex gap-2">
          {iAmOpponent && (
            <>
              <button onClick={onAccept}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-gradient-pitch text-primary-foreground text-xs font-bold uppercase tracking-wider">
                <Check className="h-3.5 w-3.5" /> Aceptar
              </button>
              <button onClick={onReject}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border text-xs font-bold uppercase tracking-wider hover:bg-muted/40">
                <X className="h-3.5 w-3.5" /> Rechazar
              </button>
            </>
          )}
          {iAmChallenger && (
            <button onClick={onCancel}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border text-xs font-bold uppercase tracking-wider hover:bg-muted/40">
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerSide({ name, side, you, points, winner, alignRight }: {
  name: string; side: string; you: boolean; points: number | null; winner: boolean; alignRight?: boolean;
}) {
  return (
    <div className={`flex-1 min-w-0 ${alignRight ? "text-right" : ""}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {side}{you && " · vos"}
      </div>
      <div className={`font-display text-lg tracking-wide truncate ${winner ? "text-trophy" : ""}`}>
        {name}
      </div>
      {points !== null && (
        <div className="text-xs text-muted-foreground">{points} pts</div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-gradient-card p-8 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="font-display text-xl tracking-wide">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">{text}</p>
    </div>
  );
}
