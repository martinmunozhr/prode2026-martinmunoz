-- Seguridad: revocar EXECUTE de anon/authenticated en funciones SECURITY DEFINER
-- internas (cambian estado o son de trigger) que quedaban invocables vía /rest/v1/rpc.
-- La más grave: grant_coins (un usuario logueado podía darse monedas infinitas).
-- Se PRESERVAN las RPC que el cliente llama legítimamente (open_pack, recycle_card,
-- simulate_pack, accept_trade) y los helpers de RLS (has_role, etc.).

revoke execute on function public.grant_coins(_user_id uuid, _amount integer, _tx_type public.coin_tx_type, _description text, _metadata jsonb) from anon, authenticated;
revoke execute on function public.process_round_payouts(_round_id text) from anon, authenticated;
revoke execute on function public.recalc_goalscorer_points(_match_id text) from anon, authenticated;
revoke execute on function public.recompute_power_rankings() from anon, authenticated;
revoke execute on function public.auto_assign_rarities() from anon, authenticated;
revoke execute on function public.refresh_round_dates(_round_id text) from anon, authenticated;
revoke execute on function public.ensure_user_coins(_user_id uuid) from anon, authenticated;
revoke execute on function public.assign_match_round() from anon, authenticated;
revoke execute on function public.auto_resolve_round_challenges() from anon, authenticated;
revoke execute on function public.resolve_challenge(_challenge_id uuid) from anon, authenticated;
revoke execute on function public.handle_awards_update() from anon, authenticated;
revoke execute on function public.handle_match_result() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_new_user_coins() from anon, authenticated;
revoke execute on function public.trg_match_events_recalc() from anon, authenticated;
revoke execute on function public.trg_match_refresh_round() from anon, authenticated;
revoke execute on function public.trg_payout_on_finish() from anon, authenticated;
revoke execute on function public.trg_recompute_elo() from anon, authenticated;
revoke execute on function public.validate_goalscorer_pred() from anon, authenticated;
