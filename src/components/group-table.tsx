import { Link } from "@tanstack/react-router";
import { getGroupStandings } from "@/lib/mock-data";
import { Flag } from "@/components/flag";
import { cn } from "@/lib/utils";

export function GroupTable({ group }: { group: string }) {
  const rows = getGroupStandings(group);
  const noMatchesYet = rows.every((r) => r.pj === 0);

  return (
    <div className="bg-gradient-card border border-border/50 rounded-2xl overflow-hidden shadow-card-sport">
      <div className="px-4 py-3 bg-secondary/40 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-display text-xl tracking-wider">Grupo {group}</h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {noMatchesYet ? "Aún no se jugó" : "Top 2 + mejores 3eros"}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="text-left font-semibold px-3 py-2">#</th>
            <th className="text-left font-semibold px-3 py-2">Equipo</th>
            <th className="text-center font-semibold px-2 py-2">PJ</th>
            <th className="text-center font-semibold px-2 py-2 hidden sm:table-cell">PG</th>
            <th className="text-center font-semibold px-2 py-2 hidden sm:table-cell">PE</th>
            <th className="text-center font-semibold px-2 py-2 hidden sm:table-cell">PP</th>
            <th className="text-center font-semibold px-2 py-2">DG</th>
            <th className="text-center font-semibold px-2 py-2 text-primary">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.team.id}
              className={cn(
                "border-t border-border/30 hover:bg-muted/30 transition-colors",
                i < 2 && "bg-primary/5",
              )}
            >
              <td className="px-3 py-2.5 font-display text-base tabular-nums">{i + 1}</td>
              <td className="px-3 py-2.5">
                <Link
                  to="/equipos/$equipoId"
                  params={{ equipoId: r.team.id }}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Flag teamId={r.team.id} className="text-xl" />
                  <span className="font-semibold truncate">{r.team.name}</span>
                </Link>
              </td>
              <td className="px-2 py-2.5 text-center tabular-nums">{r.pj}</td>
              <td className="px-2 py-2.5 text-center tabular-nums hidden sm:table-cell">{r.pg}</td>
              <td className="px-2 py-2.5 text-center tabular-nums hidden sm:table-cell">{r.pe}</td>
              <td className="px-2 py-2.5 text-center tabular-nums hidden sm:table-cell">{r.pp}</td>
              <td
                className={cn(
                  "px-2 py-2.5 text-center tabular-nums",
                  r.dg > 0 ? "text-primary" : r.dg < 0 ? "text-alert" : "",
                )}
              >
                {r.dg > 0 ? "+" : ""}
                {r.dg}
              </td>
              <td className="px-2 py-2.5 text-center font-display text-lg text-primary tabular-nums">
                {r.pts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
