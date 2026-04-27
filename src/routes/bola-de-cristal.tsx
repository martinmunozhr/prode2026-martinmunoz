import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { teams } from "@/lib/mock-data";
import figBellingham from "@/assets/figuras/bellingham.png";
import { isCrystalBallLocked, WORLD_CUP_KICKOFF, crystalBallPoints } from "@/lib/scoring";
import { Sparkles, Lock, LogIn, Trophy, Save } from "lucide-react";
import { toast } from "sonner";
import { PlayerAutocomplete } from "@/components/player-autocomplete";

export const Route = createFileRoute("/bola-de-cristal")({
  head: () => ({
    meta: [
      { title: "Bola de Cristal — Prode Mundial 2026" },
      { name: "description", content: "Predicciones del torneo: campeón, goleador, mejor jugador, mejor arquero y fair play." },
      { property: "og:title", content: "Bola de Cristal — Mundial 2026" },
      { property: "og:description", content: "Pronosticá lo grande del Mundial 2026 antes del pitazo inicial." },
    ],
  }),
  component: BolaDeCristalPage,
});

type CrystalRow = {
  campeon_id: string | null;
  goleador_nombre: string | null;
  mejor_jugador_nombre: string | null;
  mejor_arquero_nombre: string | null;
  fair_play_id: string | null;
  locked: boolean;
};

function diff(now: number) {
  const d = Math.max(0, WORLD_CUP_KICKOFF.getTime() - now);
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    minutes: Math.floor((d % 3600000) / 60000),
    seconds: Math.floor((d % 60000) / 1000),
  };
}

function BolaDeCristalPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<CrystalRow>({
    campeon_id: null,
    goleador_nombre: null,
    mejor_jugador_nombre: null,
    mejor_arquero_nombre: null,
    fair_play_id: null,
    locked: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setT(diff(Date.now()));
    const i = setInterval(() => setT(diff(Date.now())), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (authLoading || !user) { setLoading(false); return; }
    let active = true;
    (async () => {
      const { data: row } = await supabase
        .from("crystal_ball")
        .select("campeon_id, goleador_nombre, mejor_jugador_nombre, mejor_arquero_nombre, fair_play_id, locked")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (row) setData(row as CrystalRow);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user, authLoading]);

  const locked = isCrystalBallLocked() || data.locked;

  const save = async () => {
    if (!user || locked) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      campeon_id: data.campeon_id,
      goleador_nombre: data.goleador_nombre,
      mejor_jugador_nombre: data.mejor_jugador_nombre,
      mejor_arquero_nombre: data.mejor_arquero_nombre,
      fair_play_id: data.fair_play_id,
      locked: false,
    };
    const { error } = await supabase
      .from("crystal_ball")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error("No se pudo guardar: " + error.message);
    else toast.success("Bola de Cristal guardada");
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <header className="mb-8">
          <div className="h-3 w-40 bg-accent/20 rounded animate-pulse" />
          <div className="h-12 w-64 bg-muted/40 rounded mt-3 animate-pulse" />
        </header>
        <div className="h-20 mb-8 rounded-2xl bg-gradient-card border border-border/50 animate-pulse" />
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-gradient-card border border-border/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center bg-gradient-card border border-border/50 rounded-3xl p-10">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-pitch flex items-center justify-center shadow-glow-pitch mb-5">
            <LogIn className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl tracking-tight">Ingresá para jugar</h1>
          <p className="mt-3 text-muted-foreground">Necesitás cuenta para guardar tu Bola de Cristal.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/login" className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold uppercase tracking-wider">Ingresar</Link>
            <Link to="/registro" className="px-5 py-2.5 rounded-xl bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch">Sumate</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <header className="relative mb-8 overflow-visible">
        <div className="text-[11px] uppercase tracking-widest text-accent font-bold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Predicciones del torneo
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Bola de Cristal</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          5 predicciones de torneo. Se bloquean al inicio del Mundial.
        </p>
        <img
          src={figBellingham}
          alt=""
          aria-hidden
          className="hidden md:block absolute -top-4 right-0 h-44 lg:h-52 object-contain pointer-events-none drop-shadow-2xl"
        />
      </header>

      {/* Countdown */}
      <div className="mb-8 bg-gradient-card border border-border/50 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
        {locked ? (
          <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-wider text-sm">
            <Lock className="h-4 w-4" /> Bola de Cristal bloqueada
          </div>
        ) : (
          <>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Cierra en</div>
            <div className="flex gap-3 font-display text-2xl tabular-nums text-primary">
              <span>{String(t.days).padStart(2, "0")}d</span>
              <span>{String(t.hours).padStart(2, "0")}h</span>
              <span>{String(t.minutes).padStart(2, "0")}m</span>
              <span>{String(t.seconds).padStart(2, "0")}s</span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <CrystalField
          label="Campeón del Mundial"
          points={crystalBallPoints.campeon}
          icon={<Trophy className="h-5 w-5" />}
          locked={locked}
        >
          <select
            disabled={locked}
            value={data.campeon_id ?? ""}
            onChange={(e) => setData((d) => ({ ...d, campeon_id: e.target.value || null }))}
            className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary disabled:opacity-60"
          >
            <option value="">Elegí selección</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
            ))}
          </select>
        </CrystalField>

        <CrystalField label="Goleador del torneo" points={crystalBallPoints.goleador} icon={<Sparkles className="h-5 w-5" />} locked={locked}>
          <PlayerAutocomplete
            disabled={locked}
            placeholder="Ej: Lionel Messi"
            value={data.goleador_nombre}
            onChange={(v) => setData((d) => ({ ...d, goleador_nombre: v }))}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">Buscá entre los jugadores del Mundial. Si tu plantel no está cargado todavía, podés escribir el nombre libremente.</p>
        </CrystalField>

        <CrystalField label="Mejor jugador" points={crystalBallPoints.mejorJugador} icon={<Sparkles className="h-5 w-5" />} locked={locked}>
          <PlayerAutocomplete
            disabled={locked}
            placeholder="Ej: Kylian Mbappé"
            value={data.mejor_jugador_nombre}
            onChange={(v) => setData((d) => ({ ...d, mejor_jugador_nombre: v }))}
          />
        </CrystalField>

        <CrystalField label="Mejor arquero" points={crystalBallPoints.mejorArquero} icon={<Sparkles className="h-5 w-5" />} locked={locked}>
          <PlayerAutocomplete
            disabled={locked}
            placeholder="Ej: Emiliano Martínez"
            value={data.mejor_arquero_nombre}
            onChange={(v) => setData((d) => ({ ...d, mejor_arquero_nombre: v }))}
            positionFilter="Goalkeeper"
          />
        </CrystalField>

        <CrystalField label="Premio Fair Play" points={crystalBallPoints.fairPlay} icon={<Sparkles className="h-5 w-5" />} locked={locked}>
          <select
            disabled={locked}
            value={data.fair_play_id ?? ""}
            onChange={(e) => setData((d) => ({ ...d, fair_play_id: e.target.value || null }))}
            className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary disabled:opacity-60"
          >
            <option value="">Elegí selección</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
            ))}
          </select>
        </CrystalField>
      </div>

      <button
        onClick={save}
        disabled={saving || locked}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-pitch text-primary-foreground font-bold uppercase tracking-wider shadow-glow-pitch hover:scale-105 transition-transform disabled:opacity-60 disabled:hover:scale-100"
      >
        <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar Bola de Cristal"}
      </button>
    </div>
  );
}

function CrystalField({
  label, points, icon, children, locked,
}: { label: string; points: number; icon: React.ReactNode; children: React.ReactNode; locked: boolean }) {
  return (
    <div className="bg-gradient-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="font-display text-lg tracking-wide">{label}</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-accent bg-accent/10 border border-accent/30 px-2.5 py-1 rounded-full">
          {points} pts
        </div>
      </div>
      {children}
      {locked && (
        <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3 w-3" /> Bloqueado
        </div>
      )}
    </div>
  );
}
