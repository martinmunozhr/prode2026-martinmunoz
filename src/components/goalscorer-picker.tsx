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
};

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
        .select("id,name,position,jersey_number,team_id")
        .in("team_id", [homeId, awayId])
        .order("jersey_number", { ascending: true });
      if (!active) return;
      const byTeam: Record<string, Player[]> = { [homeId]: [], [awayId]: [] };
      ((ps as Player[] | null) ?? []).forEach((p) => {
        if (byTeam[p.team_id]) byTeam[p.team_id].push(p);
      });
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
    return () => { active = false; };
  }, [open, homeId, awayId, matchId, user]);

  const homePicked = useMemo(
    () => picks.filter((p) => p.team_id === homeId).reduce((s, p) => s + p.goals_predicted, 0),
    [picks, homeId]
  );
  const awayPicked = useMemo(
    () => picks.filter((p) => p.team_id === awayId).reduce((s, p) => s + p.goals_predicted, 0),
    [picks, awayId]
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
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (predHome + predAway === 0) {
    return (
      <div className="mt-3 text-[11px] text-muted-foreground/80 italic flex items-center gap-1.5">
        <Info className="h-3 w-3" />
        Si tu pronóstico es 0-0 no hay goleadores para elegir.
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={locked}
        className="w-full text-left px-3 py-2 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition flex items-center justify-between gap-2 disabled:opacity-60"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Trophy className="h-3.5 w-3.5 text-accent" />
          Goleadores (opcional)
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {totalAlreadyPicked > 0 ? `${homePicked + awayPicked}/${predHome + predAway}` : "elegir"}
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-border/50 bg-card/50 p-3 space-y-3">
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-secondary/30 rounded-md p-2">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
            <span>
              Es <strong>opcional</strong>. Si lo hacés, sumás <strong>+1 punto extra por cada goleador acertado</strong> (×
              multiplicador de fase). Si pronosticaste {predHome}-{predAway}, debés elegir{" "}
              <strong>{predHome} de {homeName}</strong> y <strong>{predAway} de {awayName}</strong>.
              Podés repetir el mismo jugador (ej: hat-trick).
            </span>
          </div>

          {loading ? (
            <div className="text-xs text-muted-foreground text-center py-4">Cargando plantillas...</div>
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
        <div className="text-[11px] font-bold uppercase tracking-widest">{title}</div>
        <div className={`text-[11px] tabular-nums ${complete ? "text-primary" : "text-muted-foreground"}`}>
          {picked}/{allowed}
        </div>
      </div>
      {allowed === 0 ? (
        <div className="text-[11px] text-muted-foreground italic px-2 py-3 border border-dashed border-border/40 rounded-md text-center">
          0 goles pronosticados
        </div>
      ) : players.length === 0 ? (
        <div className="text-[11px] text-muted-foreground italic px-2 py-3 border border-dashed border-border/40 rounded-md text-center">
          Plantilla aún no cargada
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto rounded-md border border-border/40 divide-y divide-border/30">
          {players
            .filter((p) => p.position !== "Goalkeeper" && p.position !== "Arquero")
            .map((p) => {
              const pick = picks.find((x) => x.player_id === p.id);
              const qty = pick?.goals_predicted ?? 0;
              return (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 text-xs">
                  <span className="w-6 text-center text-[10px] text-muted-foreground tabular-nums">
                    {p.jersey_number ?? "—"}
                  </span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={locked || qty === 0}
                      onClick={() => onAdjust(p, -1)}
                      className="h-6 w-6 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-30 flex items-center justify-center"
                      aria-label={`Quitar gol de ${p.name}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center font-bold tabular-nums">{qty}</span>
                    <button
                      type="button"
                      disabled={locked || (picked >= allowed && qty === 0)}
                      onClick={() => onAdjust(p, +1)}
                      className="h-6 w-6 rounded bg-primary/20 hover:bg-primary/40 disabled:opacity-30 flex items-center justify-center"
                      aria-label={`Sumar gol de ${p.name}`}
                    >
                      <Plus className="h-3 w-3" />
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
