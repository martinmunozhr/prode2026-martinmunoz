import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";

export function useCoins() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (!user) {
      setBalance(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_coins")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(data?.balance ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    refetch();
    if (!user) return;
    // Realtime: actualizar saldo si cambia
    const channel = supabase
      .channel(`coins-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_coins", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const next = (payload.new as { balance?: number } | null)?.balance;
          if (typeof next === "number") setBalance(next);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { balance, loading, refetch };
}
