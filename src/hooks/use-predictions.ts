import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export type PredMap = Record<string, { home: number; away: number }>;

type PredRow = { match_id: string; home_score: number; away_score: number };

// Carga los pronósticos del usuario y expone un guardado reutilizable.
// Lo usan tanto Mis Pronósticos como la Home para no duplicar la lógica.
export function usePredictions() {
  const { user, loading: authLoading } = useAuth();
  const [preds, setPreds] = useState<PredMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPreds({});
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("predictions")
        .select("match_id, home_score, away_score")
        .eq("user_id", user.id);
      if (!active) return;
      const map: PredMap = {};
      (data as PredRow[] | null)?.forEach((p) => {
        map[p.match_id] = { home: p.home_score, away: p.away_score };
      });
      setPreds(map);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const savePrediction = useCallback(
    async (matchId: string, home: number, away: number) => {
      if (!user) return;
      const { error } = await supabase
        .from("predictions")
        .upsert(
          { user_id: user.id, match_id: matchId, home_score: home, away_score: away },
          { onConflict: "user_id,match_id" },
        );
      if (error) {
        const isRls =
          error.message.includes("row-level security") || error.message.includes("violates");
        if (!isRls) console.error("prediction save error:", error);
        toast.error(
          isRls
            ? "Este partido ya arrancó — no se pueden guardar más pronósticos."
            : "No se pudo guardar. Probá de nuevo en un momento.",
        );
        throw error;
      }
      setPreds((p) => ({ ...p, [matchId]: { home, away } }));
      toast.success("Pronóstico guardado");
    },
    [user],
  );

  return { preds, setPreds, savePrediction, loading };
}
