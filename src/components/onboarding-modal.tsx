import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Trophy, Target, Users, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const STORAGE_KEY = "prode-onboarding-seen-v1";

export function OnboardingModal() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, [user, loading]);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted/60 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="bg-gradient-pitch p-6 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest font-bold">Bienvenido</span>
          </div>
          <h2 className="font-display text-3xl tracking-wider mt-2">¡Empezá a jugar!</h2>
          <p className="text-sm mt-2 opacity-90">
            Pronosticá los 104 partidos del Mundial 2026 y competí con tu familia y amigos.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5 p-2 rounded-lg bg-primary/15 text-primary">
              <Target className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-bold">Acertá el resultado</div>
              <div className="text-muted-foreground">
                <strong>1 punto</strong> si acertás ganador o empate. <strong>3 puntos</strong> si
                acertás el marcador exacto.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5 p-2 rounded-lg bg-primary/15 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-bold">Sumá goleadores (opcional)</div>
              <div className="text-muted-foreground">
                Elegí quién marca cada gol. <strong>+1 punto extra por acierto</strong>. Si no
                querés, saltealo, no perdés nada.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5 p-2 rounded-lg bg-primary/15 text-primary">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-bold">Bola de Cristal</div>
              <div className="text-muted-foreground">
                Pronosticá el campeón, goleador y MVP <em>antes del primer partido</em>. Hasta{" "}
                <strong>32 puntos</strong> en juego.
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            💡 En fases finales los puntos se multiplican: Octavos x1.5, Cuartos x2, Semis x2.5,{" "}
            <strong>Final x3</strong>.
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              to="/reglas"
              onClick={close}
              className="flex-1 text-center px-4 py-2.5 rounded-md border border-border/60 hover:bg-muted/40 text-sm font-bold uppercase tracking-wider"
            >
              Ver reglas completas
            </Link>
            <button
              onClick={close}
              className="flex-1 px-4 py-2.5 rounded-md bg-gradient-pitch text-primary-foreground text-sm font-bold uppercase tracking-wider shadow-glow-pitch"
            >
              ¡Empezar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
