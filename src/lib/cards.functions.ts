import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { CardRarity, PackType } from "@/lib/cards";

const PackTypeSchema = z.object({
  packType: z.enum(["comun", "raro", "epico", "legendario"]),
});

export type OpenedCard = {
  player_id: string;
  rarity: CardRarity;
  is_new: boolean;
  is_duplicate: boolean;
  player_name: string;
  team_id: string;
  position: string;
  jersey_number: number | null;
  club: string | null;
};

export const openPackFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PackTypeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: opened, error } = await supabase.rpc("open_pack", {
      _pack_type: data.packType as PackType,
    });
    if (error) throw new Error(error.message);

    const playerIds = (opened ?? []).map((c) => c.player_id);
    const { data: players } = await supabase
      .from("players")
      .select("id, name, team_id, position, jersey_number, club")
      .in("id", playerIds);

    const byId = new Map((players ?? []).map((p) => [p.id, p]));
    const cards: OpenedCard[] = (opened ?? []).map((c) => {
      const p = byId.get(c.player_id);
      return {
        player_id: c.player_id,
        rarity: c.rarity as CardRarity,
        is_new: c.is_new,
        is_duplicate: c.is_duplicate,
        player_name: p?.name ?? "—",
        team_id: p?.team_id ?? "",
        position: p?.position ?? "",
        jersey_number: p?.jersey_number ?? null,
        club: p?.club ?? null,
      };
    });

    return { cards };
  });

const RecycleSchema = z.object({ playerId: z.string().uuid() });

export const recycleCardFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => RecycleSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: result, error } = await supabase.rpc("recycle_card", {
      _player_id: data.playerId,
    });
    if (error) throw new Error(error.message);
    return result as {
      refund: number;
      rarity: CardRarity;
      fragments: number;
      bonus_player_id: string | null;
      bonus_rarity: CardRarity | null;
    };
  });

const TradeProposalSchema = z.object({
  receiverId: z.string().uuid(),
  message: z.string().max(280).optional(),
  offer: z.array(z.object({ playerId: z.string().uuid(), quantity: z.number().int().min(1).max(5) })).min(1).max(10),
  request: z.array(z.object({ playerId: z.string().uuid(), quantity: z.number().int().min(1).max(5) })).min(1).max(10),
});

export const proposeTradeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => TradeProposalSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.receiverId === userId) throw new Error("No podés intercambiar con vos mismo");

    const { data: trade, error } = await supabase
      .from("trades")
      .insert({ proposer_id: userId, receiver_id: data.receiverId, message: data.message ?? null })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const items = [
      ...data.offer.map((i) => ({ trade_id: trade.id, from_user_id: userId, player_id: i.playerId, quantity: i.quantity })),
      ...data.request.map((i) => ({ trade_id: trade.id, from_user_id: data.receiverId, player_id: i.playerId, quantity: i.quantity })),
    ];
    const { error: itemsErr } = await supabase.from("trade_items").insert(items);
    if (itemsErr) throw new Error(itemsErr.message);
    return { tradeId: trade.id };
  });

const TradeIdSchema = z.object({ tradeId: z.string().uuid() });

export const acceptTradeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => TradeIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("accept_trade", { _trade_id: data.tradeId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const rejectTradeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => TradeIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("trades")
      .update({ status: "rejected", resolved_at: new Date().toISOString() })
      .eq("id", data.tradeId)
      .eq("status", "pending")
      .or(`proposer_id.eq.${userId},receiver_id.eq.${userId}`);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const SimulatePackSchema = z.object({
  packType: z.enum(["comun", "raro", "epico", "legendario"]),
  iterations: z.number().int().min(1).max(10000).default(100),
});

export const simulatePackFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SimulatePackSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verificar admin
    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roles) throw new Error("Solo admin");

    const { data: result, error } = await supabase.rpc("simulate_pack", {
      _pack_type: data.packType as PackType,
      _iterations: data.iterations,
    });
    if (error) throw new Error(error.message);
    return { result: (result ?? []) as { rarity: CardRarity; count: number }[] };
  });
