-- ============ FIGURITAS / SOBRES / INTERCAMBIOS ============

-- 1) Enums
CREATE TYPE public.card_rarity AS ENUM ('comun', 'raro', 'epico', 'legendario');
CREATE TYPE public.pack_type AS ENUM ('comun', 'raro', 'epico', 'legendario');
CREATE TYPE public.coin_tx_type AS ENUM (
  'round_points', 'streak_bonus', 'goalscorer_bonus', 'challenge_bonus',
  'round_achievement', 'pack_purchase', 'recycle', 'trade', 'admin_grant'
);
CREATE TYPE public.trade_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- 2) Rareza por jugador
ALTER TABLE public.players
  ADD COLUMN rarity public.card_rarity NOT NULL DEFAULT 'comun';

CREATE INDEX idx_players_team_rarity ON public.players(team_id, rarity);

-- 3) Saldo de monedas
CREATE TABLE public.user_coins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coins viewable by everyone"
  ON public.user_coins FOR SELECT USING (true);

-- 4) Auditoría de transacciones
CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  tx_type public.coin_tx_type NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coin_tx_user ON public.coin_transactions(user_id, created_at DESC);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tx viewable by owner or admin"
  ON public.coin_transactions FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- 5) Colección
CREATE TABLE public.user_collection (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  first_obtained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, player_id)
);

CREATE INDEX idx_collection_user ON public.user_collection(user_id);

ALTER TABLE public.user_collection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection viewable by everyone"
  ON public.user_collection FOR SELECT USING (true);

-- 6) Aperturas de sobres (historial)
CREATE TABLE public.pack_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_type public.pack_type NOT NULL,
  cost INTEGER NOT NULL,
  player_ids UUID[] NOT NULL,
  rarities public.card_rarity[] NOT NULL,
  duplicates_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pack_openings_user ON public.pack_openings(user_id, created_at DESC);

ALTER TABLE public.pack_openings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Openings viewable by owner or admin"
  ON public.pack_openings FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- 7) Fragmentos de reciclaje (1 garantizado cada 10 repetidas recicladas por rareza)
CREATE TABLE public.user_recycle_fragments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rarity public.card_rarity NOT NULL,
  fragments INTEGER NOT NULL DEFAULT 0 CHECK (fragments >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, rarity)
);

ALTER TABLE public.user_recycle_fragments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fragments viewable by owner or admin"
  ON public.user_recycle_fragments FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- 8) Intercambios (M↔N)
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.trade_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CHECK (proposer_id <> receiver_id)
);

CREATE INDEX idx_trades_proposer ON public.trades(proposer_id, status);
CREATE INDEX idx_trades_receiver ON public.trades(receiver_id, status);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trades viewable by participants"
  ON public.trades FOR SELECT
  USING (auth.uid() IN (proposer_id, receiver_id) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users propose trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Participants update trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() IN (proposer_id, receiver_id));

CREATE TABLE public.trade_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trade_items_trade ON public.trade_items(trade_id);

ALTER TABLE public.trade_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trade items viewable by participants"
  ON public.trade_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trades t
      WHERE t.id = trade_id
        AND (auth.uid() IN (t.proposer_id, t.receiver_id) OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users add own trade items while pending"
  ON public.trade_items FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id
    AND EXISTS (
      SELECT 1 FROM public.trades t
      WHERE t.id = trade_id AND t.status = 'pending'
        AND auth.uid() IN (t.proposer_id, t.receiver_id)
    )
  );

-- 9) Tracking de rachas y logros por usuario
CREATE TABLE public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  exact_streak INTEGER NOT NULL DEFAULT 0,
  best_exact_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Streaks viewable by everyone"
  ON public.user_streaks FOR SELECT USING (true);

-- 10) Marcar qué fechas/bonus ya fueron pagados (idempotencia)
CREATE TABLE public.round_payouts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  round_id TEXT NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  points_paid INTEGER NOT NULL DEFAULT 0,
  achievements_paid JSONB NOT NULL DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, round_id)
);

ALTER TABLE public.round_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payouts viewable by owner or admin"
  ON public.round_payouts FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- ============ FUNCIONES DE ECONOMÍA ============

-- Asegurar fila de monedas
CREATE OR REPLACE FUNCTION public.ensure_user_coins(_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_coins (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Otorgar / debitar monedas con auditoría
CREATE OR REPLACE FUNCTION public.grant_coins(
  _user_id UUID, _amount INTEGER, _tx_type public.coin_tx_type,
  _description TEXT DEFAULT NULL, _metadata JSONB DEFAULT NULL
)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  PERFORM public.ensure_user_coins(_user_id);
  UPDATE public.user_coins
  SET balance = balance + _amount,
      total_earned = total_earned + GREATEST(_amount, 0),
      total_spent = total_spent + GREATEST(-_amount, 0),
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING balance INTO new_balance;

  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;

  INSERT INTO public.coin_transactions (user_id, amount, tx_type, description, metadata)
  VALUES (_user_id, _amount, _tx_type, _description, _metadata);

  RETURN new_balance;
END;
$$;

-- Asignar rareza automática por equipo (1 Leg, 4 Épi, 8 Raros, resto Comunes)
CREATE OR REPLACE FUNCTION public.auto_assign_rarities()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN SELECT id FROM public.teams LOOP
    -- reset
    UPDATE public.players SET rarity = 'comun' WHERE team_id = t.id;

    -- Legendario: capitán o jersey 10
    UPDATE public.players SET rarity = 'legendario'
    WHERE id IN (
      SELECT id FROM public.players
      WHERE team_id = t.id
      ORDER BY (CASE WHEN is_captain THEN 0 ELSE 1 END),
               (CASE WHEN jersey_number = 10 THEN 0 ELSE 1 END),
               jersey_number NULLS LAST
      LIMIT 1
    );

    -- Épicos: top 4 restantes priorizando atacantes con dorsales bajos
    UPDATE public.players SET rarity = 'epico'
    WHERE id IN (
      SELECT id FROM public.players
      WHERE team_id = t.id AND rarity = 'comun'
      ORDER BY (CASE position
                  WHEN 'Forward' THEN 0 WHEN 'Delantero' THEN 0
                  WHEN 'Midfielder' THEN 1 WHEN 'Mediocampista' THEN 1
                  WHEN 'Defender' THEN 2 WHEN 'Defensor' THEN 2
                  ELSE 3 END),
               jersey_number NULLS LAST
      LIMIT 4
    );

    -- Raros: 8 siguientes
    UPDATE public.players SET rarity = 'raro'
    WHERE id IN (
      SELECT id FROM public.players
      WHERE team_id = t.id AND rarity = 'comun'
      ORDER BY jersey_number NULLS LAST
      LIMIT 8
    );
  END LOOP;
END;
$$;

-- Ejecutar asignación inicial
SELECT public.auto_assign_rarities();

-- Apertura de sobre (server-side: odds + duplicados)
CREATE OR REPLACE FUNCTION public.open_pack(_pack_type public.pack_type)
RETURNS TABLE(player_id UUID, rarity public.card_rarity, is_new BOOLEAN, is_duplicate BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  cost INTEGER;
  num_cards INTEGER;
  guarantees_legendary BOOLEAN := FALSE;
  i INTEGER;
  r NUMERIC;
  chosen_rarity public.card_rarity;
  chosen_player UUID;
  existing_qty INTEGER;
  result_players UUID[] := ARRAY[]::UUID[];
  result_rarities public.card_rarity[] := ARRAY[]::public.card_rarity[];
  duplicates INTEGER := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;

  CASE _pack_type
    WHEN 'comun'      THEN cost := 100;  num_cards := 5;
    WHEN 'raro'       THEN cost := 250;  num_cards := 7;
    WHEN 'epico'      THEN cost := 500;  num_cards := 9;
    WHEN 'legendario' THEN cost := 1000; num_cards := 11; guarantees_legendary := TRUE;
  END CASE;

  -- Cobrar
  PERFORM public.grant_coins(uid, -cost, 'pack_purchase',
    'Sobre ' || _pack_type, jsonb_build_object('pack_type', _pack_type));

  FOR i IN 1..num_cards LOOP
    -- Última carta del legendario: forzar legendario
    IF guarantees_legendary AND i = num_cards THEN
      chosen_rarity := 'legendario';
    ELSE
      r := random();
      CASE _pack_type
        WHEN 'comun' THEN
          chosen_rarity := CASE
            WHEN r < 0.75 THEN 'comun'::public.card_rarity
            WHEN r < 0.97 THEN 'raro'::public.card_rarity
            ELSE 'epico'::public.card_rarity END;
        WHEN 'raro' THEN
          chosen_rarity := CASE
            WHEN r < 0.45 THEN 'comun'::public.card_rarity
            WHEN r < 0.90 THEN 'raro'::public.card_rarity
            WHEN r < 0.99 THEN 'epico'::public.card_rarity
            ELSE 'legendario'::public.card_rarity END;
        WHEN 'epico' THEN
          chosen_rarity := CASE
            WHEN r < 0.15 THEN 'comun'::public.card_rarity
            WHEN r < 0.60 THEN 'raro'::public.card_rarity
            WHEN r < 0.95 THEN 'epico'::public.card_rarity
            ELSE 'legendario'::public.card_rarity END;
        WHEN 'legendario' THEN
          chosen_rarity := CASE
            WHEN r < 0.30 THEN 'raro'::public.card_rarity
            WHEN r < 0.85 THEN 'epico'::public.card_rarity
            ELSE 'legendario'::public.card_rarity END;
      END CASE;
    END IF;

    -- Elegir jugador random de esa rareza
    SELECT p.id INTO chosen_player
    FROM public.players p
    WHERE p.rarity = chosen_rarity
    ORDER BY random() LIMIT 1;

    IF chosen_player IS NULL THEN
      -- fallback a común
      SELECT p.id INTO chosen_player FROM public.players p
      WHERE p.rarity = 'comun' ORDER BY random() LIMIT 1;
      chosen_rarity := 'comun';
    END IF;

    -- ¿Repetida?
    SELECT quantity INTO existing_qty FROM public.user_collection
    WHERE user_id = uid AND user_collection.player_id = chosen_player;

    IF existing_qty IS NULL THEN
      INSERT INTO public.user_collection (user_id, player_id, quantity)
      VALUES (uid, chosen_player, 1);
      is_new := TRUE; is_duplicate := FALSE;
    ELSE
      UPDATE public.user_collection
      SET quantity = quantity + 1, updated_at = now()
      WHERE user_id = uid AND user_collection.player_id = chosen_player;
      duplicates := duplicates + 1;
      is_new := FALSE; is_duplicate := TRUE;
    END IF;

    result_players := result_players || chosen_player;
    result_rarities := result_rarities || chosen_rarity;
    player_id := chosen_player;
    rarity := chosen_rarity;
    RETURN NEXT;
  END LOOP;

  INSERT INTO public.pack_openings (user_id, pack_type, cost, player_ids, rarities, duplicates_count)
  VALUES (uid, _pack_type, cost, result_players, result_rarities, duplicates);
END;
$$;

-- Reciclar una repetida
CREATE OR REPLACE FUNCTION public.recycle_card(_player_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  qty INTEGER;
  pr public.card_rarity;
  refund INTEGER;
  pack_cost INTEGER;
  fragments INTEGER;
  bonus_player UUID := NULL;
  bonus_rarity public.card_rarity := NULL;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;

  SELECT uc.quantity, p.rarity INTO qty, pr
  FROM public.user_collection uc JOIN public.players p ON p.id = uc.player_id
  WHERE uc.user_id = uid AND uc.player_id = _player_id;

  IF qty IS NULL OR qty < 2 THEN RAISE EXCEPTION 'No tenés repetidas de esta carta'; END IF;

  pack_cost := CASE pr
    WHEN 'comun' THEN 100 WHEN 'raro' THEN 250
    WHEN 'epico' THEN 500 WHEN 'legendario' THEN 1000 END;
  refund := FLOOR(pack_cost * 0.75);

  UPDATE public.user_collection SET quantity = quantity - 1, updated_at = now()
  WHERE user_id = uid AND player_id = _player_id;

  PERFORM public.grant_coins(uid, refund, 'recycle',
    'Reciclaje ' || pr, jsonb_build_object('player_id', _player_id, 'rarity', pr));

  -- Sumar fragmento
  INSERT INTO public.user_recycle_fragments (user_id, rarity, fragments)
  VALUES (uid, pr, 1)
  ON CONFLICT (user_id, rarity) DO UPDATE
    SET fragments = user_recycle_fragments.fragments + 1, updated_at = now()
  RETURNING user_recycle_fragments.fragments INTO fragments;

  -- ¿Llegó a 10? → garantizar carta de esa rareza
  IF fragments >= 10 THEN
    UPDATE public.user_recycle_fragments SET fragments = fragments - 10, updated_at = now()
    WHERE user_id = uid AND rarity = pr;

    SELECT id INTO bonus_player FROM public.players WHERE rarity = pr ORDER BY random() LIMIT 1;
    IF bonus_player IS NOT NULL THEN
      bonus_rarity := pr;
      INSERT INTO public.user_collection (user_id, player_id, quantity)
      VALUES (uid, bonus_player, 1)
      ON CONFLICT (user_id, player_id) DO UPDATE
        SET quantity = user_collection.quantity + 1, updated_at = now();
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'refund', refund, 'rarity', pr, 'fragments', fragments,
    'bonus_player_id', bonus_player, 'bonus_rarity', bonus_rarity
  );
END;
$$;

-- Aceptar trade (transferencia atómica)
CREATE OR REPLACE FUNCTION public.accept_trade(_trade_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t RECORD;
  it RECORD;
  to_user UUID;
  current_qty INTEGER;
BEGIN
  SELECT * INTO t FROM public.trades WHERE id = _trade_id;
  IF t IS NULL THEN RAISE EXCEPTION 'Intercambio no existe'; END IF;
  IF t.status <> 'pending' THEN RAISE EXCEPTION 'Intercambio ya resuelto'; END IF;
  IF auth.uid() <> t.receiver_id THEN RAISE EXCEPTION 'Solo el receptor acepta'; END IF;

  -- Validar y transferir cada item
  FOR it IN SELECT * FROM public.trade_items WHERE trade_id = _trade_id LOOP
    SELECT quantity INTO current_qty FROM public.user_collection
    WHERE user_id = it.from_user_id AND player_id = it.player_id;

    IF current_qty IS NULL OR current_qty < it.quantity THEN
      RAISE EXCEPTION 'Cartas insuficientes para completar el trade';
    END IF;

    to_user := CASE WHEN it.from_user_id = t.proposer_id THEN t.receiver_id ELSE t.proposer_id END;

    UPDATE public.user_collection SET quantity = quantity - it.quantity, updated_at = now()
    WHERE user_id = it.from_user_id AND player_id = it.player_id;

    INSERT INTO public.user_collection (user_id, player_id, quantity)
    VALUES (to_user, it.player_id, it.quantity)
    ON CONFLICT (user_id, player_id) DO UPDATE
      SET quantity = user_collection.quantity + it.quantity, updated_at = now();
  END LOOP;

  UPDATE public.trades SET status = 'accepted', resolved_at = now(), updated_at = now()
  WHERE id = _trade_id;
END;
$$;

-- Cuando termina un partido, pagar puntos del usuario por la fecha (idempotente)
CREATE OR REPLACE FUNCTION public.process_round_payouts(_round_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u RECORD;
  pts INTEGER;
  already INTEGER;
  delta INTEGER;
BEGIN
  IF NOT public.is_round_finished(_round_id) THEN RETURN; END IF;

  FOR u IN
    SELECT DISTINCT p.user_id FROM public.predictions p
    JOIN public.matches m ON m.id = p.match_id
    WHERE m.round_id = _round_id
  LOOP
    pts := public.points_for_user_in_round(u.user_id, _round_id);
    SELECT COALESCE(points_paid, 0) INTO already
    FROM public.round_payouts WHERE user_id = u.user_id AND round_id = _round_id;
    already := COALESCE(already, 0);
    delta := (pts - already) * 100;
    IF delta > 0 THEN
      PERFORM public.grant_coins(u.user_id, delta, 'round_points',
        'Puntos fecha ' || _round_id, jsonb_build_object('round_id', _round_id, 'points', pts));
    END IF;
    INSERT INTO public.round_payouts (user_id, round_id, points_paid)
    VALUES (u.user_id, _round_id, pts)
    ON CONFLICT (user_id, round_id) DO UPDATE
      SET points_paid = pts, paid_at = now();
  END LOOP;
END;
$$;

-- Trigger que al finalizar el último partido de la fecha pague monedas
CREATE OR REPLACE FUNCTION public.trg_payout_on_finish()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'finished' AND NEW.round_id IS NOT NULL
     AND public.is_round_finished(NEW.round_id) THEN
    PERFORM public.process_round_payouts(NEW.round_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER matches_payout_after_finish
  AFTER UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.trg_payout_on_finish();

-- Inicializar saldos para usuarios existentes
INSERT INTO public.user_coins (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Asegurar saldo en alta de usuario
CREATE OR REPLACE FUNCTION public.handle_new_user_coins()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_coins (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_coins
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_coins();