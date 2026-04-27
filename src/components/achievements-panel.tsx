import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Coins, Flame, Trophy, Gift, Recycle, Package, ArrowLeftRight, Crown, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Coins = { balance: number; total_earned: number; total_spent: number };
type Streak = { exact_streak: number; best_exact_streak: number };
type Tx = {
  id: string;
  amount: number;
  tx_type: string;
  description: string | null;
  created_at: string;
};
type Payout = {
  round_id: string;
  points_paid: number;
  achievements_paid: Record<string, number>;
  paid_at: string;
};

const TX_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  round_points: { icon: Target, label: "Puntos de fecha", color: "text-pitch" },
  streak_bonus: { icon: Flame, label: "Racha de exactos", color: "text-orange-400" },
  goalscorer_bonus: { icon: Zap, label: "Goleadores", color: "text-amber-400" },
  challenge_bonus: { icon: Trophy, label: "Desafío", color: "text-fuchsia-400" },
  round_achievement: { icon: Crown, label: "Logro de fecha", color: "text-trophy" },
  pack_purchase: { icon: Package, label: "Sobre comprado", color: "text-sky-400" },
  recycle: { icon: Recycle, label: "Reciclaje", color: "text-emerald-400" },
  trade: { icon: ArrowLeftRight, label: "Intercambio", color: "text-cyan-400" },
  admin_grant: { icon: Gift, label: "Bonificación admin", color: "text-violet-400" },
};

export function AchievementsPanel({ userId }: { userId: string }) {
  const [coins, setCoins] = useState<Coins | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [coinsRes, streakRes, txsRes, payoutsRes] = await Promise.all([
        supabase.from("user_coins").select("balance, total_earned, total_spent").eq("user_id", userId).maybeSingle(),
        supabase.from("user_streaks").select("exact_streak, best_exact_streak").eq("user_id", userId).maybeSingle(),
        supabase.from("coin_transactions").select("id, amount, tx_type, description, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        supabase.from("round_payouts").select("round_id, points_paid, achievements_paid, paid_at").eq("user_id", userId).order("paid_at", { ascending: false }).limit(10),
      ]);
      setCoins(coinsRes.data ?? { balance: 0, total_earned: 0, total_spent: 0 });
      setStreak(streakRes.data ?? { exact_streak: 0, best_exact_streak: 0 });
      setTxs((txsRes.data ?? []) as Tx[]);
      setPayouts((payoutsRes.data ?? []) as unknown as Payout[]);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return <div className="h-40 rounded-xl bg-muted/20 animate-pulse" />;
  }

  const totalAchievements = payouts.reduce((acc, p) => {
    return acc + Object.values(p.achievements_paid || {}).filter((v) => Number(v) > 0).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Coins} label="Monedas" value={coins?.balance ?? 0} accent="text-trophy" />
        <StatCard icon={Flame} label="Racha actual" value={streak?.exact_streak ?? 0} accent="text-orange-400" suffix="exactos" />
        <StatCard icon={Crown} label="Mejor racha" value={streak?.best_exact_streak ?? 0} accent="text-fuchsia-400" />
        <StatCard icon={Trophy} label="Logros pagos" value={totalAchievements} accent="text-pitch" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MiniStat label="Total ganado" value={`+${coins?.total_earned ?? 0}`} accent="text-pitch" />
        <MiniStat label="Total gastado" value={`-${coins?.total_spent ?? 0}`} accent="text-muted-foreground" />
        <MiniStat label="Saldo neto" value={String((coins?.total_earned ?? 0) - (coins?.total_spent ?? 0))} />
      </div>

      {/* Logros por fecha */}
      <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
        <h3 className="font-display text-2xl tracking-wider mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-trophy" /> Logros por fecha
        </h3>
        {payouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no se cerró ninguna fecha. Una vez que termine, vas a ver acá tus logros.</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => {
              const ach = p.achievements_paid || {};
              return (
                <div key={p.round_id} className="rounded-xl border border-border/50 bg-background/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-sm uppercase tracking-wider">{p.round_id.replace(/-/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">{p.points_paid} pts → +{p.points_paid * 100} monedas</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AchievementBadge active={Number(ach.exact_streak) > 0} icon={Flame} label={`Racha exactos +${ach.exact_streak ?? 0}`} />
                    <AchievementBadge active={Number(ach.goalscorer) > 0} icon={Zap} label={`Goleadores +${ach.goalscorer ?? 0}`} />
                    <AchievementBadge active={Number(ach.perfect) > 0} icon={Target} label="Pleno de fecha +500" />
                    <AchievementBadge active={Number(ach.top1) > 0} icon={Crown} label="#1 de la fecha +1000" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
        <h3 className="font-display text-2xl tracking-wider mb-3">Historial de monedas</h3>
        {txs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos aún.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {txs.map((t) => {
              const meta = TX_META[t.tx_type] ?? { icon: Coins, label: t.tx_type, color: "text-foreground" };
              const Icon = meta.icon;
              const positive = t.amount >= 0;
              return (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <div className={cn("h-8 w-8 rounded-lg bg-background/60 flex items-center justify-center", meta.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{t.description ?? meta.label}</div>
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{meta.label} · {new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className={cn("font-display text-lg tracking-wider", positive ? "text-pitch" : "text-muted-foreground")}>
                    {positive ? "+" : ""}{t.amount}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, suffix }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; accent?: string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-4">
      <div className="flex items-center justify-between">
        <Icon className={cn("h-5 w-5", accent)} />
      </div>
      <div className={cn("font-display text-3xl tracking-wider mt-2", accent)}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}{suffix ? ` · ${suffix}` : ""}</div>
    </div>
  );
}

function MiniStat({ label, value, accent = "text-foreground" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/30 p-3 flex items-center justify-between">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={cn("font-bold", accent)}>{value}</span>
    </div>
  );
}

function AchievementBadge({ active, icon: Icon, label }: { active: boolean; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
      active ? "bg-pitch/10 text-pitch border-pitch/40" : "bg-muted/20 text-muted-foreground border-border/40 opacity-60",
    )}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
