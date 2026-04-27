REVOKE EXECUTE ON FUNCTION public.accept_trade(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.auto_assign_rarities() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.ensure_user_coins(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.grant_coins(uuid, integer, public.coin_tx_type, text, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.open_pack(public.pack_type) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.process_round_payouts(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recalc_goalscorer_points(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recycle_card(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.refresh_round_dates(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.resolve_challenge(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.accept_trade(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_coins(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.open_pack(public.pack_type) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recycle_card(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_challenge(uuid) TO authenticated;
