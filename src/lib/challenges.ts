// Hooks y helpers para el sistema de Desafíos por jornada (round-based)
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Round = {
  id: string;
  name: string;
  stage: string;
  group_matchday: number | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
};

export type ChallengeStatus = "pending" | "accepted" | "rejected" | "resolved" | "cancelled";

export type Challenge = {
  id: string;
  round_id: string;
  challenger_id: string;
  opponent_id: string;
  status: ChallengeStatus;
  challenger_points: number | null;
  opponent_points: number | null;
  winner_id: string | null;
  is_draw: boolean;
  bonus_points: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileLite = {
  id: string;
  username: string;
  avatar_color: string;
  favorite_team_id: string | null;
};

// ---------- ROUNDS ----------

export function useRounds(): { rounds: Round[]; loading: boolean } {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("rounds")
        .select("*")
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      setRounds((data ?? []) as Round[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rounds, loading };
}

// ---------- CHALLENGES ----------

export function useChallenges(): {
  challenges: Challenge[];
  profiles: Map<string, ProfileLite>;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileLite>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: chs } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });
    const list = (chs ?? []) as Challenge[];
    setChallenges(list);

    const ids = new Set<string>();
    list.forEach((c) => {
      ids.add(c.challenger_id);
      ids.add(c.opponent_id);
    });
    if (ids.size) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, avatar_color, favorite_team_id")
        .in("id", Array.from(ids));
      const m = new Map<string, ProfileLite>();
      (profs ?? []).forEach((p) => m.set(p.id, p as ProfileLite));
      setProfiles(m);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("challenges-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  return { challenges, profiles, loading, refresh: load };
}

// ---------- ALL PROFILES (para elegir oponente) ----------

export function useAllProfiles(excludeUserId?: string): {
  profiles: ProfileLite[];
  loading: boolean;
} {
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_color, favorite_team_id")
        .order("username", { ascending: true });
      if (cancelled) return;
      const list = (data ?? []) as ProfileLite[];
      setProfiles(excludeUserId ? list.filter((p) => p.id !== excludeUserId) : list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [excludeUserId]);

  return { profiles, loading };
}

// ---------- ACTIONS ----------

function rlsError(raw: { message: string }, friendlyMsg: string): Error {
  const isRls = raw.message.includes("row-level security") || raw.message.includes("violates");
  return new Error(isRls ? friendlyMsg : raw.message);
}

export async function createChallenge(challengerId: string, opponentId: string, roundId: string) {
  const { error } = await supabase.from("challenges").insert({
    challenger_id: challengerId,
    opponent_id: opponentId,
    round_id: roundId,
    status: "pending",
  });
  if (error) throw rlsError(error, "No se pudo crear el desafío: la jornada ya arrancó o ya tenés uno activo en esa jornada.");
}

export async function acceptChallenge(challengeId: string) {
  const { error } = await supabase
    .from("challenges")
    .update({ status: "accepted" })
    .eq("id", challengeId);
  if (error) throw rlsError(error, "No se pudo aceptar el desafío: la jornada ya arrancó.");
}

export async function rejectChallenge(challengeId: string) {
  const { error } = await supabase
    .from("challenges")
    .update({ status: "rejected" })
    .eq("id", challengeId);
  if (error) throw rlsError(error, "No se pudo rechazar el desafío: la jornada ya arrancó.");
}

export async function cancelChallenge(challengeId: string) {
  const { error } = await supabase
    .from("challenges")
    .update({ status: "cancelled" })
    .eq("id", challengeId);
  if (error) throw rlsError(error, "No se pudo cancelar el desafío.");
}

// Helpers de visualización

/** Ventana de desafío: la jornada arrancó Y todavía no terminó. */
export function isRoundActive(round: Round): boolean {
  if (!round.starts_at) return false;
  const now = Date.now();
  const start = new Date(round.starts_at).getTime();
  if (start > now) return false;
  if (round.ends_at) {
    const end = new Date(round.ends_at).getTime();
    if (end <= now) return false;
  }
  return true;
}

export function isRoundFuture(round: Round): boolean {
  if (!round.starts_at) return false;
  return new Date(round.starts_at).getTime() > Date.now();
}

export function isRoundEnded(round: Round): boolean {
  if (!round.ends_at) return false;
  return new Date(round.ends_at).getTime() <= Date.now();
}

/** Alias para compatibilidad con código existente que chequea si crear está bloqueado. */
export function isRoundLocked(round: Round): boolean {
  return !isRoundActive(round);
}

export function describeChallengeOutcome(c: Challenge, viewerId?: string): string {
  if (c.status !== "resolved") return "";
  if (c.is_draw) {
    return "Empate · cada uno se llevó la mitad de los puntos del rival";
  }
  if (!viewerId) {
    const winnerSide = c.winner_id === c.challenger_id ? "Retador" : "Rival";
    return `${winnerSide} gana · +${c.bonus_points ?? 0} pts bonus`;
  }
  if (c.winner_id === viewerId) return `¡Ganaste! +${c.bonus_points ?? 0} pts bonus`;
  return `Perdiste · −${c.bonus_points ?? 0} pts`;
}
