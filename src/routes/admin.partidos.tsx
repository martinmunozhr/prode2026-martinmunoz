import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { updateMatchManually, addMatchEvent, deleteMatchEvent } from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";
import { ChevronDown, ChevronUp, Plus, X, Trophy, Square } from "lucide-react";

export const Route = createFileRoute("/admin/partidos")({
  component: AdminPartidos,
});

type MatchRow = Database["public"]["Tables"]["matches"]["Row"] & {
  home: { name: string; flag: string } | null;
  away: { name: string; flag: string } | null;
};

type EventRow = Database["public"]["Tables"]["match_events"]["Row"];
type PlayerRow = { id: string; name: string; team_id: string; jersey_number: number | null };

function AdminPartidos() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "scheduled" | "live" | "finished">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const updateFn = useServerFn(updateMatchManually);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("matches")
      .select(
        "*, home:teams!matches_home_id_fkey(name, flag), away:teams!matches_away_id_fkey(name, flag)",
      )
      .order("match_date");
    setMatches((data as MatchRow[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = matches.filter((m) => filter === "all" || m.status === filter);

  const save = async (
    m: MatchRow,
    hs: number,
    as_: number,
    st: "scheduled" | "live" | "finished",
  ) => {
    setSavingId(m.id);
    try {
      const r = await updateFn({
        data: { matchId: m.id, homeScore: hs, awayScore: as_, status: st },
      });
      if (r.ok) {
        toast.success("Partido actualizado. Recalculando puntos...");
        await load();
      } else toast.error(r.error ?? "Error");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "scheduled", "live", "finished"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all"
              ? "Todos"
              : f === "scheduled"
                ? "Próximos"
                : f === "live"
                  ? "En vivo"
                  : "Finalizados"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className="rounded-xl border border-border/50 bg-card/30">
              <MatchRow
                match={m}
                saving={savingId === m.id}
                onSave={save}
                onToggle={() => setExpanded((id) => (id === m.id ? null : m.id))}
                expanded={expanded === m.id}
              />
              {expanded === m.id && <EventsPanel match={m} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchRow({
  match,
  saving,
  onSave,
  onToggle,
  expanded,
}: {
  match: MatchRow;
  saving: boolean;
  onSave: (m: MatchRow, hs: number, as_: number, st: "scheduled" | "live" | "finished") => void;
  onToggle: () => void;
  expanded: boolean;
}) {
  const [hs, setHs] = useState(match.home_score ?? 0);
  const [as_, setAs] = useState(match.away_score ?? 0);
  const [st, setSt] = useState<"scheduled" | "live" | "finished">(match.status);

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center px-3 py-2 text-sm">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {new Date(match.match_date).toLocaleString("es-AR", {
            dateStyle: "short",
            timeStyle: "short",
          })}{" "}
          · {match.stage}
        </div>
        <div className="font-semibold truncate">
          {match.home?.flag} {match.home?.name ?? match.home_id} vs{" "}
          {match.away?.name ?? match.away_id} {match.away?.flag}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={20}
          value={hs}
          onChange={(e) => setHs(Number(e.target.value))}
          className="w-12 rounded bg-muted/40 px-2 py-1 text-center"
        />
        <span>-</span>
        <input
          type="number"
          min={0}
          max={20}
          value={as_}
          onChange={(e) => setAs(Number(e.target.value))}
          className="w-12 rounded bg-muted/40 px-2 py-1 text-center"
        />
      </div>
      <select
        value={st}
        onChange={(e) => setSt(e.target.value as "scheduled" | "live" | "finished")}
        className="rounded bg-muted/40 px-2 py-1 text-xs"
      >
        <option value="scheduled">Pendiente</option>
        <option value="live">En vivo</option>
        <option value="finished">Final</option>
      </select>
      <button
        onClick={() => onSave(match, hs, as_, st)}
        disabled={saving}
        className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider disabled:opacity-50"
      >
        {saving ? "..." : "Guardar"}
      </button>
      <button
        onClick={onToggle}
        className="p-1.5 rounded hover:bg-muted/40"
        title="Ver eventos / goleadores"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
    </div>
  );
}

function EventsPanel({ match }: { match: MatchRow }) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const addFn = useServerFn(addMatchEvent);
  const delFn = useServerFn(deleteMatchEvent);

  const load = async () => {
    setLoading(true);
    const [evRes, plRes] = await Promise.all([
      supabase.from("match_events").select("*").eq("match_id", match.id).order("minute"),
      supabase
        .from("players")
        .select("id,name,team_id,jersey_number")
        .in("team_id", [match.home_id, match.away_id])
        .order("jersey_number"),
    ]);
    setEvents((evRes.data as EventRow[] | null) ?? []);
    setPlayers((plRes.data as PlayerRow[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [match.id]);

  const homePlayers = players.filter((p) => p.team_id === match.home_id);
  const awayPlayers = players.filter((p) => p.team_id === match.away_id);

  const remove = async (id: string) => {
    const r = await delFn({ data: { eventId: id } });
    if (r.ok) {
      toast.success("Evento borrado. Recalculando goleadores...");
      load();
    } else toast.error(r.error ?? "Error");
  };

  const add = async (
    teamId: string,
    playerId: string | null,
    playerName: string,
    type: "Goal" | "Yellow Card" | "Red Card",
    minute: number | null,
  ) => {
    if (!playerName.trim()) return toast.error("Falta nombre del jugador");
    const r = await addFn({
      data: { matchId: match.id, teamId, playerId, playerName, eventType: type, minute },
    });
    if (r.ok) {
      toast.success("Evento agregado");
      load();
    } else toast.error(r.error ?? "Error");
  };

  return (
    <div className="border-t border-border/40 p-3 bg-background/40 space-y-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
        <Trophy className="h-3 w-3" /> Eventos del partido
        <span className="font-normal normal-case tracking-normal text-[11px] text-muted-foreground/70">
          — Cargá los goles para que se calculen los puntos extra de goleadores. Las tarjetas son
          informativas.
        </span>
      </div>

      {loading ? (
        <div className="h-20 rounded bg-muted/20 animate-pulse" />
      ) : (
        <>
          {events.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {events.map((e) => (
                <li key={e.id} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/30">
                  <span className="w-8 text-center font-bold tabular-nums">{e.minute ?? "—"}'</span>
                  <span className="text-base">
                    {e.event_type === "Goal" ? "⚽" : e.event_type === "Yellow Card" ? "🟨" : "🟥"}
                  </span>
                  <span className="flex-1 truncate">
                    {e.player_name}{" "}
                    <span className="text-muted-foreground">
                      ({e.team_id === match.home_id ? match.home?.name : match.away?.name})
                    </span>
                  </span>
                  <button
                    onClick={() => remove(e.id)}
                    className="p-1 rounded hover:bg-destructive/20 text-destructive"
                    aria-label="Borrar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-muted-foreground italic">Sin eventos cargados.</div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            <AddEventForm
              teamId={match.home_id}
              teamName={match.home?.name ?? match.home_id}
              players={homePlayers}
              onAdd={add}
            />
            <AddEventForm
              teamId={match.away_id}
              teamName={match.away?.name ?? match.away_id}
              players={awayPlayers}
              onAdd={add}
            />
          </div>
        </>
      )}
    </div>
  );
}

function AddEventForm({
  teamId,
  teamName,
  players,
  onAdd,
}: {
  teamId: string;
  teamName: string;
  players: PlayerRow[];
  onAdd: (
    teamId: string,
    playerId: string | null,
    playerName: string,
    type: "Goal" | "Yellow Card" | "Red Card",
    minute: number | null,
  ) => void;
}) {
  const [playerId, setPlayerId] = useState("");
  const [customName, setCustomName] = useState("");
  const [type, setType] = useState<"Goal" | "Yellow Card" | "Red Card">("Goal");
  const [minute, setMinute] = useState<string>("");

  const submit = () => {
    const p = players.find((x) => x.id === playerId);
    const name = p?.name ?? customName;
    onAdd(teamId, p?.id ?? null, name, type, minute ? Number(minute) : null);
    setMinute("");
    setCustomName("");
  };

  return (
    <div className="rounded-lg border border-border/40 p-2 space-y-2">
      <div className="text-[11px] font-bold uppercase tracking-widest">{teamName}</div>
      <div className="grid grid-cols-[1fr_60px_auto] gap-1.5 items-center">
        {players.length > 0 ? (
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="rounded bg-muted/40 px-2 py-1 text-xs min-w-0"
          >
            <option value="">Elegí jugador...</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.jersey_number ? `#${p.jersey_number} ` : ""}
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            placeholder="Nombre jugador (manual)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="rounded bg-muted/40 px-2 py-1 text-xs min-w-0"
          />
        )}
        <input
          type="number"
          min={0}
          max={130}
          placeholder="min"
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          className="rounded bg-muted/40 px-2 py-1 text-xs text-center"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded bg-muted/40 px-2 py-1 text-xs"
        >
          <option value="Goal">⚽ Gol</option>
          <option value="Yellow Card">🟨 TA</option>
          <option value="Red Card">🟥 TR</option>
        </select>
      </div>
      <button
        onClick={submit}
        disabled={!playerId && !customName.trim()}
        className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-primary/20 hover:bg-primary/30 text-xs font-bold disabled:opacity-40"
      >
        <Plus className="h-3 w-3" /> Agregar
      </button>
    </div>
  );
}

// Suppress unused import warning
void Square;
