import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flag } from "@/components/flag";

export const Route = createFileRoute("/admin/jugadores")({
  component: AdminJugadores,
});

type Team = { id: string; name: string; flag: string; group_letter: string };
type Player = { id: string; name: string; position: string; jersey_number: number | null; club: string | null };

function AdminJugadores() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from("teams").select("id, name, flag, group_letter").order("group_letter").order("name");
      setTeams(t ?? []);
      // counts per team
      const { data: all } = await supabase.from("players").select("team_id");
      const c: Record<string, number> = {};
      for (const p of all ?? []) c[p.team_id] = (c[p.team_id] ?? 0) + 1;
      setCounts(c);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const { data } = await supabase.from("players").select("id, name, position, jersey_number, club").eq("team_id", selected).order("jersey_number");
      setPlayers(data ?? []);
    })();
  }, [selected]);

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <div className="rounded-xl border border-border/50 bg-card/40 p-3 max-h-[70vh] overflow-y-auto">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-2">Selecciones ({teams.length})</h2>
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              selected === t.id ? "bg-primary/10 text-primary" : "hover:bg-muted/30"
            }`}
          >
            <Flag iso2={t.flag} className="h-4 w-6" />
            <span className="flex-1 text-left truncate">{t.name}</span>
            <span className={`text-xs font-mono ${counts[t.id] ? "text-primary" : "text-muted-foreground"}`}>{counts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-card/40 p-4">
        {!selected ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Seleccioná un equipo</div>
        ) : players.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Sin jugadores cargados. Andá a <strong>Sync API</strong> para importar las plantillas oficiales.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2">#</th>
                <th className="text-left">Nombre</th>
                <th className="text-left">Pos</th>
                <th className="text-left">Club</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-t border-border/30">
                  <td className="py-1.5 font-mono text-muted-foreground">{p.jersey_number ?? "-"}</td>
                  <td className="font-semibold">{p.name}</td>
                  <td className="text-xs">{p.position}</td>
                  <td className="text-xs text-muted-foreground">{p.club ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
