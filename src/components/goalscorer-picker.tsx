import { useEffect, useMemo, useState } from "react";
import { Info, Plus, Minus, Trophy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

type Player = {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  team_id: string;
  rarity: string;
};

// Orden de relevancia para goleadores: figuras y delanteros arriba, arqueros al final.
const RARITY_RANK: Record<string, number> = { legendario: 0, epico: 1, raro: 2, comun: 3 };
const POSITION_RANK: Record<string, number> = { DEL: 0, MED: 1, DEF: 2, POR: 3 };
const POSITION_LABEL: Record<string, string> = {
  DEL: "DEL",
  MED: "MED",
  DEF: "DEF",
  POR: "ARQ",
};
const RARITY_DOT: Record<string, string> = {
  legendario: "bg-fuchsia-400",
  epico: "bg-amber-400",
  raro: "bg-sky-400",
  comun: "bg-zinc-500",
};

/** Goleadores primero: por rareza (amenaza de gol), luego puesto, luego nombre. */
function byGoalThreat(a: Player, b: Player): number {
  const r = (RARITY_RANK[a.rarity] ?? 9) - (RARITY_RANK[b.rarity] ?? 9);
  if (r !== 0) return r;
  const p = (POSITION_RANK[a.position] ?? 9) - (POSITION_RANK[b.position] ?? 9);
  if (p !== 0) return p;
  return a.name.localeCompare(b.name);
}

type GSP = {
  id: string;
  player_id: string;
  team_id: string;
  goals_predicted: number;
  points_earned: number | null;
};

type Props = {
  matchId: string;
  homeId: string;
  awayId: string;
  homeName: string;
  awayName: string;
  predHome: number;
  predAway: number;
  locked: boolean;
};

/**
 * Picker opcional de goleadores. La cantidad total elegida por equipo debe
 * coincidir con los goles pronosticados. Permite repetir un jugador.
 */
export function GoalscorerPicker({
  matchId,
  homeId,
  awayId,
  homeName,
  awayName,
  predHome,
  predAway,
  locked,
}: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState<Record<string, Player[]>>({});
  const [picks, setPicks] = useState<GSP[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: ps } = await supabase
        .from("players")
        .select("id,name,position,jersey_number,team_id,rarity")
        .in("team_id", [homeId, awayId]);
      if (!active) return;
      const byTeam: Record<string, Player[]> = { [homeId]: [], [awayId]: [] };
      ((ps as Player[] | null) ?? []).forEach((p) => {
        if (byTeam[p.team_id]) byTeam[p.team_id].push(p);
      });
      // Goleadores potenciales arriba (delanteros y figuras), arqueros al final.
      byTeam[homeId].sort(byGoalThreat);
      byTeam[awayId].sort(byGoalThreat);
      setPlayers(byTeam);

      if (user) {
        const { data: gs } = await supabase
          .from("goalscorer_predictions")
          .select("id,player_id,team_id,goals_predicted,points_earned")
          .eq("user_id", user.id)
          .eq("match_id", matchId);
        setPicks((gs as GSP[] | null) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [open, homeId, awayId, matchId, user]);

  const homePicked = useMemo(
    () => picks.filter((p) => p.team_id === homeId).reduce((s, p) => s + p.goals_predicted, 0),
    [picks, homeId],
  );
  const awayPicked = useMemo(
    () => picks.filter((p) => p.team_id === awayId).reduce((s, p) => s + p.goals_predicted, 0),
    [picks, awayId],
  );

  const totalAlreadyPicked = picks.length;

  const adjustPick = async (player: Player, delta: number) => {
    if (!user || locked || saving) return;
    const existing = picks.find((p) => p.player_id === player.id);
    const isHome = player.team_id === homeId;
    const currentTeamSum = isHome ? homePicked : awayPicked;
    const cap = isHome ? predHome : predAway;

    if (delta > 0 && currentTeamSum >= cap) {
      toast.error(`Ya elegiste ${cap} goleador(es) para ${isHome ? homeName : awayName}`);
      return;
    }

    setSaving(true);
    try {
      if (existing) {
        const newQty = existing.goals_predicted + delta;
        if (newQty <= 0) {
          const { error } = await supabase
            .from("goalscorer_predictions")
            .delete()
            .eq("id", existing.id);
          if (error) throw error;
          setPicks((ps) => ps.filter((p) => p.id !== existing.id));
        } else {
          const { data, error } = await supabase
            .from("goalscorer_predictions")
            .update({ goals_predicted: newQty })
            .eq("id", existing.id)
            .select()
            .single();
          if (error) throw error;
          setPicks((ps) => ps.map((p) => (p.id === existing.id ? (data as GSP) : p)));
        }
      } else if (delta > 0) {
        const { data, error } = await supabase
          .from("goalscorer_predictions")
          .insert({
            user_id: user.id,
            match_id: matchId,
            player_id: player.id,
            team_id: player.team_id,
            goals_predicted: 1,
          })
          .select()
          .single();
        if (error) throw error;
        setPicks((ps) => [...ps, data as GSP]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      const isRls = msg.includes("row-level security") || msg.includes("violates");
      toast.error(isRls ? "El partido ya arrancó — no podés cambiar los goleadores." : msg);
    } finally {
      setSaving(false);
    }
  };

  if (predHome + predAway === 0) {
    return (
      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5" />
        Pronóstico 0-0: no hay goles para asignar goleadores.
      </div>
    );
  }

  const totalPicked = homePicked + awayPicked;
  const totalNeeded = predHome + predAway;
  const isComplete = totalPicked === totalNeeded;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={locked}
        className="w-full text-left px-4 py-2.5 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition flex items-center justify-between gap-2 disabled:opacity-60"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <Trophy className="h-4 w-4 text-accent" />
          {locked ? "Goleadores elegidos" : "Elegir goleadores"}
          <span className="text-xs font-normal text-muted-foreground">(+1 pt por acierto)</span>
        </span>
        <span className="text-xs font-semibold tabular-nums">
          {totalAlreadyPicked > 0
            ? isComplete
              ? <span className="text-primary">{totalPicked}/{totalNeeded} ✓</span>
              : `${totalPicked}/${totalNeeded} elegidos`
            : locked
              ? "ninguno"
              : "opcional →"}
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-border/50 bg-card/50 p-3 space-y-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-md p-2.5">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <span>
              <strong>Opcional.</strong> Elegí quién convierte cada gol — sumás{" "}
              <strong>+1 punto extra por cada acierto</strong> (multiplicado por la fase).
              Con pronóstico {predHome}-{predAway} tenés que elegir{" "}
              <strong>{predHome} {predHome === 1 ? "goleador" : "goleadores"} de {homeName}</strong>{" "}
              y <strong>{predAway} {predAway === 1 ? "goleador" : "goleadores"} de {awayName}</strong>.
              Podés repetir al mismo jugador si pronosticás que hace 2 o más goles.
              {" "}Están ordenados por probabilidad de gol: arriba los delanteros y figuras.
            </span>
          </div>

          {loading ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              Cargando plantillas...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              <TeamColumn
                title={homeName}
                allowed={predHome}
                picked={homePicked}
                players={players[homeId] ?? []}
                picks={picks}
                onAdjust={adjustPick}
                locked={locked || saving}
              />
              <TeamColumn
                title={awayName}
                allowed={predAway}
                picked={awayPicked}
                players={players[awayId] ?? []}
                picks={picks}
                onAdjust={adjustPick}
                locked={locked || saving}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TeamColumn({
  title,
  allowed,
  picked,
  players,
  picks,
  onAdjust,
  locked,
}: {
  title: string;
  allowed: number;
  picked: number;
  players: Player[];
  picks: GSP[];
  onAdjust: (p: Player, delta: number) => void;
  locked: boolean;
}) {
  const complete = picked === allowed;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-xs font-bold uppercase tracking-wide">{title}</div>
        <div className={`text-xs font-semibold tabular-nums ${complete ? "text-primary" : "text-muted-foreground"}`}>
          {picked}/{allowed} {complete && "✓"}
        </div>
      </div>
      {allowed === 0 ? (
        <div className="text-xs text-muted-foreground px-2 py-3 border border-dashed border-border/40 rounded-md text-center">
          0 goles pronosticados para este equipo
        </div>
      ) : players.length === 0 ? (
        <div className="text-xs text-muted-foreground px-2 py-3 border border-dashed border-border/40 rounded-md text-center">
          Plantilla aún no cargada
        </div>
      ) : (
        <div className="max-h-52 overflow-y-auto rounded-md border border-border/40 divide-y divide-border/30">
          {players.map((p) => {
              const pick = picks.find((x) => x.player_id === p.id);
              const qty = pick?.goals_predicted ?? 0;
              return (
                <div key={p.id} className={`flex items-center gap-2 px-2 py-2 text-xs ${qty > 0 ? "bg-primary/5" : ""}`}>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${RARITY_DOT[p.rarity] ?? "bg-zinc-500"}`}
                    title={p.rarity}
                  />
                  <span className="w-9 shrink-0 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {POSITION_LABEL[p.position] ?? p.position}
                  </span>
                  <span className="flex-1 truncate font-medium">{p.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={locked || qty === 0}
                      onClick={() => onAdjust(p, -1)}
                      className="h-7 w-7 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-30 flex items-center justify-center"
                      aria-label={`Quitar gol de ${p.name}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold tabular-nums text-sm">{qty > 0 ? qty : "—"}</span>
                    <button
                      type="button"
                      disabled={locked || (picked >= allowed && qty === 0)}
                      onClick={() => onAdjust(p, +1)}
                      className="h-7 w-7 rounded bg-primary/20 hover:bg-primary/40 disabled:opacity-30 flex items-center justify-center"
                      aria-label={`Sumar gol de ${p.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
