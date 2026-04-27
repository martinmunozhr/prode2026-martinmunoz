import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { updateMatchManually } from "@/lib/admin.functions";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/partidos")({
  component: AdminPartidos,
});

type MatchRow = Database["public"]["Tables"]["matches"]["Row"] & {
  home: { name: string; flag: string } | null;
  away: { name: string; flag: string } | null;
};

function AdminPartidos() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "scheduled" | "live" | "finished">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const updateFn = useServerFn(updateMatchManually);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("matches")
      .select("*, home:teams!matches_home_id_fkey(name, flag), away:teams!matches_away_id_fkey(name, flag)")
      .order("match_date");
    setMatches((data as MatchRow[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = matches.filter((m) => filter === "all" || m.status === filter);

  const save = async (m: MatchRow, hs: number, as_: number, st: "scheduled" | "live" | "finished") => {
    setSavingId(m.id);
    try {
      const r = await updateFn({ data: { matchId: m.id, homeScore: hs, awayScore: as_, status: st } });
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
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "Todos" : f === "scheduled" ? "Próximos" : f === "live" ? "En vivo" : "Finalizados"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Fase</th>
                <th className="px-3 py-2 text-right">Local</th>
                <th className="px-3 py-2 text-center">Marcador</th>
                <th className="px-3 py-2 text-left">Visitante</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <MatchEditor key={m.id} match={m} saving={savingId === m.id} onSave={save} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MatchEditor({
  match,
  saving,
  onSave,
}: {
  match: MatchRow;
  saving: boolean;
  onSave: (m: MatchRow, hs: number, as_: number, st: "scheduled" | "live" | "finished") => void;
}) {
  const [hs, setHs] = useState(match.home_score ?? 0);
  const [as_, setAs] = useState(match.away_score ?? 0);
  const [st, setSt] = useState<"scheduled" | "live" | "finished">(match.status);

  return (
    <tr className="border-t border-border/30 hover:bg-muted/20">
      <td className="px-3 py-2 text-xs whitespace-nowrap">{new Date(match.match_date).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}</td>
      <td className="px-3 py-2 text-xs">{match.stage}</td>
      <td className="px-3 py-2 text-right font-semibold">{match.home?.name ?? match.home_id}</td>
      <td className="px-3 py-2">
        <div className="flex items-center justify-center gap-1">
          <input type="number" min={0} max={20} value={hs} onChange={(e) => setHs(Number(e.target.value))} className="w-12 rounded bg-muted/40 px-2 py-1 text-center" />
          <span>-</span>
          <input type="number" min={0} max={20} value={as_} onChange={(e) => setAs(Number(e.target.value))} className="w-12 rounded bg-muted/40 px-2 py-1 text-center" />
        </div>
      </td>
      <td className="px-3 py-2 font-semibold">{match.away?.name ?? match.away_id}</td>
      <td className="px-3 py-2">
        <select value={st} onChange={(e) => setSt(e.target.value as "scheduled" | "live" | "finished")} className="rounded bg-muted/40 px-2 py-1 text-xs">
          <option value="scheduled">Pendiente</option>
          <option value="live">En vivo</option>
          <option value="finished">Finalizado</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <button
          onClick={() => onSave(match, hs, as_, st)}
          disabled={saving}
          className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {saving ? "..." : "Guardar"}
        </button>
      </td>
    </tr>
  );
}
