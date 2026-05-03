import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, RefreshCw, Download, Globe, Upload } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { syncSquads, syncResults, getApiQuota } from "@/lib/admin.functions";
import {
  syncSquadsWC2026,
  syncResultsWC2026,
  importRosterText,
  previewRosterText,
} from "@/lib/data-sources.functions";
import { supabase } from "@/integrations/supabase/client";
import { authHeaders } from "@/lib/auth-headers";

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

type TeamRow = { id: string; name: string; code: string; group_letter: string };

type ParsedPreview = {
  name: string;
  position: string;
  jersey_number: number | null;
  club: string | null;
  is_captain: boolean;
};

function AdminSync() {
  const [quota, setQuota] = useState<{ used: number; limit: number; date: string } | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  // Manual import state
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [rosterText, setRosterText] = useState("");
  const [replace, setReplace] = useState(true);
  const [preview, setPreview] = useState<ParsedPreview[]>([]);

  const quotaFn = useServerFn(getApiQuota);
  const squadsFn = useServerFn(syncSquads);
  const resultsFn = useServerFn(syncResults);
  const wcSquadsFn = useServerFn(syncSquadsWC2026);
  const wcResultsFn = useServerFn(syncResultsWC2026);
  const importFn = useServerFn(importRosterText);
  const previewFn = useServerFn(previewRosterText);

  const reload = async () => {
    try {
      const q = await quotaFn({ headers: await authHeaders() });
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
    const { data: ts } = await supabase
      .from("teams")
      .select("id, name, code, group_letter")
      .order("group_letter")
      .order("name");
    setTeams((ts as TeamRow[] | null) ?? []);
  };

  useEffect(() => {
    reload();
  }, []);

  const runSync = async (kind: "squads" | "results" | "wc-squads" | "wc-results") => {
    setRunning(kind);
    try {
      const headers = await authHeaders();
      const r =
        kind === "squads"
          ? await squadsFn({ headers })
          : kind === "results"
            ? await resultsFn({ headers })
            : kind === "wc-squads"
              ? await wcSquadsFn({ headers })
              : await wcResultsFn({ headers });
      if (r.ok) {
        if (kind === "squads" || kind === "wc-squads") {
          const ins = "inserted" in r ? r.inserted : 0;
          const tm = "teamsMatched" in r ? r.teamsMatched : 0;
          toast.success(`Plantillas: ${ins} jugadores en ${tm} equipos`);
        } else {
          const u = "updated" in r ? r.updated : 0;
          toast.success(`Resultados: ${u} partidos actualizados`);
        }
      } else toast.error(r.error ?? "Error");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setRunning(null);
      reload();
    }
  };

  const doPreview = async () => {
    if (!rosterText.trim()) {
      setPreview([]);
      return;
    }
    try {
      const r = await previewFn({ data: { text: rosterText }, headers: await authHeaders() });
      setPreview(r.players);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const doImport = async () => {
    if (!selectedTeam) {
      toast.error("Elegí un equipo");
      return;
    }
    if (!rosterText.trim()) {
      toast.error("Pegá la lista de jugadores");
      return;
    }
    setRunning("manual");
    try {
      const r = await importFn({
        data: { teamId: selectedTeam, text: rosterText, replace },
        headers: await authHeaders(),
      });
      if (r.ok) {
        toast.success(`${r.inserted} jugadores importados en ${r.teamName}`);
        setRosterText("");
        setPreview([]);
      } else {
        toast.error(r.error ?? "Error");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setRunning(null);
      reload();
    }
  };

  const remaining = quota ? quota.limit - quota.used : 0;
  const pct = quota ? Math.min(100, (quota.used / quota.limit) * 100) : 0;

  const teamsByGroup = useMemo(() => {
    const m = new Map<string, TeamRow[]>();
    for (const t of teams) {
      const g = t.group_letter ?? "?";
      if (!m.has(g)) m.set(g, []);
      m.get(g)!.push(t);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [teams]);

  return (
    <div className="space-y-6">
      {/* QUOTA */}
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

      {/* API-FOOTBALL */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Fuente: API-Football
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-card/40 p-5">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="font-bold uppercase tracking-wider">Plantillas</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Importa los squads desde API-Football (~50 requests). Requiere plan que cubra la
              temporada 2026.
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
              Actualiza marcadores y estados de hoy y ayer (~1 request).
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
      </div>

      {/* WC2026 API */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4" /> Fuente: WC2026 API
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-card/40 p-5 opacity-70">
            <h3 className="font-bold uppercase tracking-wider">Plantillas WC2026</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              La WC2026 API <strong>no expone rosters</strong> (solo equipos, grupos, partidos y
              estadios). Para cargar plantillas usá <strong>API-Football</strong> arriba o el{" "}
              <strong>importador manual</strong> de abajo.
            </p>
            <button
              disabled
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted text-muted-foreground font-bold uppercase tracking-wider text-sm cursor-not-allowed"
            >
              No disponible
            </button>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/40 p-5">
            <h3 className="font-bold uppercase tracking-wider">Resultados WC2026</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sincroniza marcadores y estados desde WC2026 API.
            </p>
            <button
              disabled={running !== null}
              onClick={() => runSync("wc-results")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground font-bold uppercase tracking-wider text-sm disabled:opacity-50"
            >
              {running === "wc-results" ? "Sincronizando..." : "Sync WC2026"}
            </button>
          </div>
        </div>
      </div>

      {/* MANUAL IMPORT */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="h-5 w-5 text-primary" />
          <h3 className="font-bold uppercase tracking-wider">Carga manual de plantilla</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Pegá la lista de jugadores de un equipo, uno por línea. Detecta dorsal, posición
          (GK/DEF/MID/FWD y sus variantes), capitán <code>(C)</code> y club. Ejemplos válidos:
        </p>
        <pre className="text-xs bg-muted/30 rounded p-3 mb-4 overflow-x-auto">
          {`10 Lionel Messi FWD Inter Miami (C)
1 Emiliano Martinez GK Aston Villa
Rodrigo De Paul, MID, 7, Atletico Madrid
Julian Alvarez - FWD - #9 - Atletico`}
        </pre>

        <div className="grid gap-3 md:grid-cols-[300px_1fr]">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Equipo</span>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="mt-1 w-full rounded-md bg-muted/40 border border-border/40 px-3 py-2 text-sm"
              >
                <option value="">— Elegí un equipo —</option>
                {teamsByGroup.map(([g, list]) => (
                  <optgroup key={g} label={`Grupo ${g}`}>
                    {list.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={replace}
                onChange={(e) => setReplace(e.target.checked)}
              />
              Reemplazar plantilla actual
            </label>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={doPreview}
                disabled={!rosterText.trim()}
                className="px-4 py-2 rounded-md bg-muted/40 hover:bg-muted/60 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
              >
                Previsualizar
              </button>
              <button
                type="button"
                onClick={doImport}
                disabled={running !== null || !selectedTeam || !rosterText.trim()}
                className="px-4 py-2 rounded-md bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {running === "manual" ? "Importando..." : "Importar"}
              </button>
            </div>
          </div>

          <div>
            <textarea
              value={rosterText}
              onChange={(e) => setRosterText(e.target.value)}
              rows={12}
              placeholder="Pegá acá la lista de jugadores..."
              className="w-full rounded-md bg-muted/30 border border-border/40 p-3 text-sm font-mono"
            />
            {preview.length > 0 && (
              <div className="mt-3 rounded-md border border-border/40 overflow-hidden">
                <div className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2 bg-muted/30">
                  Preview ({preview.length} jugadores)
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="text-muted-foreground">
                      <tr>
                        <th className="text-left px-2 py-1">#</th>
                        <th className="text-left px-2 py-1">Pos</th>
                        <th className="text-left px-2 py-1">Nombre</th>
                        <th className="text-left px-2 py-1">Club</th>
                        <th className="text-center px-2 py-1">C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p, i) => (
                        <tr key={i} className="border-t border-border/30">
                          <td className="px-2 py-1 font-mono">{p.jersey_number ?? "-"}</td>
                          <td className="px-2 py-1">{p.position}</td>
                          <td className="px-2 py-1">{p.name}</td>
                          <td className="px-2 py-1 text-muted-foreground">{p.club ?? "-"}</td>
                          <td className="px-2 py-1 text-center">{p.is_captain ? "★" : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HISTORY */}
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
