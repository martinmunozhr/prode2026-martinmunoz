import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateAwards, recalcAllPoints } from "@/lib/admin.functions";
import { Trophy, RefreshCw, Save } from "lucide-react";

export const Route = createFileRoute("/admin/awards")({
  component: AdminAwards,
});

type Team = { id: string; name: string };
type Awards = {
  campeon_id: string | null;
  subcampeon_id: string | null;
  tercer_puesto_id: string | null;
  fair_play_id: string | null;
  goleador_nombre: string | null;
  mejor_jugador_nombre: string | null;
  mejor_arquero_nombre: string | null;
  finalized: boolean;
};

const empty: Awards = {
  campeon_id: null, subcampeon_id: null, tercer_puesto_id: null, fair_play_id: null,
  goleador_nombre: null, mejor_jugador_nombre: null, mejor_arquero_nombre: null, finalized: false,
};

function AdminAwards() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [data, setData] = useState<Awards>(empty);
  const [saving, setSaving] = useState(false);
  const [recalcing, setRecalcing] = useState(false);
  const updateFn = useServerFn(updateAwards);
  const recalcFn = useServerFn(recalcAllPoints);

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: a }] = await Promise.all([
        supabase.from("teams").select("id, name").neq("id", "tbd").order("name"),
        supabase.from("tournament_awards").select("*").eq("id", 1).maybeSingle(),
      ]);
      setTeams(t ?? []);
      if (a) setData({
        campeon_id: a.campeon_id, subcampeon_id: a.subcampeon_id, tercer_puesto_id: a.tercer_puesto_id,
        fair_play_id: a.fair_play_id, goleador_nombre: a.goleador_nombre,
        mejor_jugador_nombre: a.mejor_jugador_nombre, mejor_arquero_nombre: a.mejor_arquero_nombre,
        finalized: a.finalized,
      });
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await updateFn({ data });
      if (r.ok) toast.success("Premios actualizados. Bola de Cristal recalculada.");
      else toast.error(r.error ?? "Error");
    } finally { setSaving(false); }
  };

  const recalc = async () => {
    setRecalcing(true);
    try {
      const r = await recalcFn();
      if (r.ok) toast.success(`Recalculados ${"recalculated" in r ? r.recalculated : 0} partidos`);
      else toast.error(r.error ?? "Error");
    } finally { setRecalcing(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-5 w-5 text-accent" />
          <h2 className="font-display text-2xl tracking-wider">Premios oficiales del torneo</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">Cargá los ganadores cuando termine el Mundial. Esto recalcula automáticamente los puntos de Bola de Cristal de todos los usuarios.</p>

        <div className="grid md:grid-cols-2 gap-4">
          <TeamSelect label="Campeón" value={data.campeon_id} teams={teams} onChange={(v) => setData({ ...data, campeon_id: v })} />
          <TeamSelect label="Subcampeón" value={data.subcampeon_id} teams={teams} onChange={(v) => setData({ ...data, subcampeon_id: v })} />
          <TeamSelect label="Tercer Puesto" value={data.tercer_puesto_id} teams={teams} onChange={(v) => setData({ ...data, tercer_puesto_id: v })} />
          <TeamSelect label="Fair Play" value={data.fair_play_id} teams={teams} onChange={(v) => setData({ ...data, fair_play_id: v })} />
          <TextInput label="Goleador" value={data.goleador_nombre} onChange={(v) => setData({ ...data, goleador_nombre: v })} />
          <TextInput label="Mejor Jugador" value={data.mejor_jugador_nombre} onChange={(v) => setData({ ...data, mejor_jugador_nombre: v })} />
          <TextInput label="Mejor Arquero" value={data.mejor_arquero_nombre} onChange={(v) => setData({ ...data, mejor_arquero_nombre: v })} />
          <label className="flex items-end gap-2">
            <input type="checkbox" checked={data.finalized} onChange={(e) => setData({ ...data, finalized: e.target.checked })} className="h-5 w-5 rounded" />
            <span className="text-sm">Marcar como finalizado</span>
          </label>
        </div>

        <button onClick={save} disabled={saving} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider text-sm disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar premios"}
        </button>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="font-bold uppercase tracking-wider text-destructive">Zona peligrosa</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Recalcula los puntos de TODOS los partidos finalizados. Útil si corregiste un resultado.</p>
        <button onClick={recalc} disabled={recalcing} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 text-destructive text-sm font-bold uppercase tracking-wider disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${recalcing ? "animate-spin" : ""}`} /> {recalcing ? "Recalculando..." : "Recalcular puntos"}
        </button>
      </div>
    </div>
  );
}

function TeamSelect({ label, value, teams, onChange }: { label: string; value: string | null; teams: Team[]; onChange: (v: string | null) => void }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">{label}</div>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm">
        <option value="">— sin definir —</option>
        {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    </label>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">{label}</div>
      <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder="Nombre completo del jugador" className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
    </label>
  );
}
