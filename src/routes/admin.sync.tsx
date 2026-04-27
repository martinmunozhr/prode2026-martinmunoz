import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { syncSquads, syncResults, getApiQuota } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/sync")({
  component: AdminSync,
});

type LogRow = {
  id: string;
  sync_type: string;
  status: string;
  requests_used: number;
  details: unknown;
  error: string | null;
  created_at: string;
};

function AdminSync() {
  const [quota, setQuota] = useState<{ used: number; limit: number; date: string } | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const quotaFn = useServerFn(getApiQuota);
  const squadsFn = useServerFn(syncSquads);
  const resultsFn = useServerFn(syncResults);

  const reload = async () => {
    try {
      const q = await quotaFn();
      setQuota(q);
    } catch (e) {
      console.warn(e);
    }
    const { data } = await supabase
      .from("api_sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setLogs((data as LogRow[] | null) ?? []);
  };

  useEffect(() => {
    reload();
  }, []);

  const runSync = async (kind: "squads" | "results") => {
    setRunning(kind);
    try {
      const r = kind === "squads" ? await squadsFn() : await resultsFn();
      if (r.ok) {
        toast.success(
          kind === "squads"
            ? `Plantillas: ${"inserted" in r ? r.inserted : 0} jugadores en ${"teamsMatched" in r ? r.teamsMatched : 0} equipos`
            : `Resultados: ${"updated" in r ? r.updated : 0} partidos actualizados`,
        );
      } else toast.error(r.error ?? "Error");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setRunning(null);
      reload();
    }
  };

  const remaining = quota ? quota.limit - quota.used : 0;
  const pct = quota ? Math.min(100, (quota.used / quota.limit) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Quota API-Football hoy ({quota?.date ?? "-"})
            </div>
            <div className="font-display text-3xl tracking-wider mt-1">
              {quota ? quota.used : "-"}{" "}
              <span className="text-muted-foreground text-xl">/ {quota?.limit ?? 100}</span>
            </div>
          </div>
          <button
            onClick={reload}
            className="p-2 rounded-md bg-muted/40 hover:bg-muted/60"
            aria-label="Refrescar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
          <div
            className={`h-full ${pct > 80 ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Quedan {remaining} requests. Se resetea cada día.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/40 p-5">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="font-bold uppercase tracking-wider">Plantillas oficiales</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Importa los squads de las 48 selecciones desde API-Football. Usa ~50 requests. Hacelo
            cuando se confirmen las listas oficiales.
          </p>
          <button
            disabled={running !== null || remaining < 50}
            onClick={() => runSync("squads")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider text-sm disabled:opacity-50"
          >
            {running === "squads" ? "Importando..." : "Importar plantillas"}
          </button>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 p-5">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-bold uppercase tracking-wider">Sync resultados</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Actualiza marcadores y estados de los partidos de hoy y ayer. Usa ~1 request. Ejecutalo
            cada cierto tiempo durante el Mundial.
          </p>
          <button
            disabled={running !== null || remaining < 2}
            onClick={() => runSync("results")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider text-sm disabled:opacity-50"
          >
            {running === "results" ? "Sincronizando..." : "Sync ahora"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <h3 className="font-bold uppercase tracking-wider mb-3">Historial</h3>
        {logs.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin sincronizaciones todavía.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left py-2">Fecha</th>
                  <th className="text-left">Tipo</th>
                  <th className="text-left">Estado</th>
                  <th className="text-right">Reqs</th>
                  <th className="text-left">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-border/30">
                    <td className="py-1.5 text-xs">
                      {new Date(l.created_at).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="text-xs uppercase">{l.sync_type}</td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          l.status === "success"
                            ? "bg-primary/20 text-primary"
                            : l.status === "partial"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="text-right font-mono">{l.requests_used}</td>
                    <td className="text-xs text-muted-foreground max-w-md truncate">
                      {l.error ?? (l.details ? JSON.stringify(l.details) : "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
