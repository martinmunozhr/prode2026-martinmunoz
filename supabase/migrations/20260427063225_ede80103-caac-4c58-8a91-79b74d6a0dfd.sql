-- 1) Extend process_round_payouts to grant achievement bonuses
CREATE OR REPLACE FUNCTION public.process_round_payouts(_round_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  u RECORD;
  pts INTEGER;
  already INTEGER;
  delta INTEGER;
  ach JSONB;
  exact_streak_bonus INTEGER;
  goalscorer_bonus INTEGER;
  challenge_bonus INTEGER;
  perfect_bonus INTEGER;
  top1_user UUID;
  match_count INTEGER;
  user_predicted_count INTEGER;
  user_outcome_hits INTEGER;
  user_exact_hits INTEGER;
  cur_streak INTEGER;
  best_user_pts INTEGER;
BEGIN
  IF NOT public.is_round_finished(_round_id) THEN RETURN; END IF;

  -- # de partidos en la fecha
  SELECT COUNT(*) INTO match_count FROM public.matches WHERE round_id = _round_id;

  -- Top 1 de la fecha (mayor cantidad de puntos en la ronda)
  SELECT user_id, points INTO top1_user, best_user_pts FROM (
    SELECT p.user_id AS user_id,
           public.points_for_user_in_round(p.user_id, _round_id) AS points
    FROM public.predictions p
    JOIN public.matches m ON m.id = p.match_id
    WHERE m.round_id = _round_id
    GROUP BY p.user_id
  ) ranked
  ORDER BY points DESC NULLS LAST
  LIMIT 1;

  FOR u IN
    SELECT DISTINCT p.user_id FROM public.predictions p
    JOIN public.matches m ON m.id = p.match_id
    WHERE m.round_id = _round_id
  LOOP
    pts := public.points_for_user_in_round(u.user_id, _round_id);

    SELECT COALESCE(points_paid, 0), COALESCE(achievements_paid, '{}'::jsonb)
      INTO already, ach
    FROM public.round_payouts WHERE user_id = u.user_id AND round_id = _round_id;
    already := COALESCE(already, 0);
    ach := COALESCE(ach, '{}'::jsonb);

    -- Pago base por puntos (delta)
    delta := (pts - already) * 100;
    IF delta > 0 THEN
      PERFORM public.grant_coins(u.user_id, delta, 'round_points',
        'Puntos fecha ' || _round_id, jsonb_build_object('round_id', _round_id, 'points', pts));
    END IF;

    ----------------------------------------------------------------------
    -- 1) Bonus por aciertos EXACTOS en la fecha (suma a la racha global)
    --    +50 por cada exacto consecutivo. Reseteamos la racha si falla.
    ----------------------------------------------------------------------
    IF NOT (ach ? 'exact_streak') THEN
      -- Iterar partidos en orden cronológico
      cur_streak := COALESCE((SELECT exact_streak FROM public.user_streaks WHERE user_id = u.user_id), 0);
      exact_streak_bonus := 0;
      DECLARE
        m RECORD;
        ph INT; pa INT;
      BEGIN
        FOR m IN SELECT id, home_score, away_score, match_date FROM public.matches
                 WHERE round_id = _round_id AND status = 'finished' ORDER BY match_date LOOP
          SELECT home_score, away_score INTO ph, pa FROM public.predictions
            WHERE user_id = u.user_id AND match_id = m.id;
          IF ph IS NOT NULL AND pa IS NOT NULL THEN
            IF ph = m.home_score AND pa = m.away_score THEN
              cur_streak := cur_streak + 1;
              exact_streak_bonus := exact_streak_bonus + 50;
            ELSE
              cur_streak := 0;
            END IF;
          ELSE
            cur_streak := 0;
          END IF;
        END LOOP;
      END;

      INSERT INTO public.user_streaks (user_id, exact_streak, best_exact_streak)
      VALUES (u.user_id, cur_streak, cur_streak)
      ON CONFLICT (user_id) DO UPDATE
        SET exact_streak = cur_streak,
            best_exact_streak = GREATEST(user_streaks.best_exact_streak, cur_streak),
            updated_at = now();

      IF exact_streak_bonus > 0 THEN
        PERFORM public.grant_coins(u.user_id, exact_streak_bonus, 'streak_bonus',
          'Racha de exactos fecha ' || _round_id,
          jsonb_build_object('round_id', _round_id, 'count', exact_streak_bonus / 50));
      END IF;
      ach := ach || jsonb_build_object('exact_streak', exact_streak_bonus);
    END IF;

    ----------------------------------------------------------------------
    -- 2) Bonus por goleadores acertados (cada gsp con points_earned > 0 = +100)
    ----------------------------------------------------------------------
    IF NOT (ach ? 'goalscorer') THEN
      SELECT COALESCE(COUNT(*), 0) * 100 INTO goalscorer_bonus
      FROM public.goalscorer_predictions g
      JOIN public.matches m ON m.id = g.match_id
      WHERE g.user_id = u.user_id AND m.round_id = _round_id
        AND COALESCE(g.points_earned, 0) > 0;
      IF goalscorer_bonus > 0 THEN
        PERFORM public.grant_coins(u.user_id, goalscorer_bonus, 'goalscorer_bonus',
          'Goleadores acertados fecha ' || _round_id,
          jsonb_build_object('round_id', _round_id));
      END IF;
      ach := ach || jsonb_build_object('goalscorer', goalscorer_bonus);
    END IF;

    ----------------------------------------------------------------------
    -- 3) Pleno de la fecha: acertó al menos el resultado de todos los partidos
    ----------------------------------------------------------------------
    IF NOT (ach ? 'perfect') THEN
      SELECT COUNT(*) INTO user_predicted_count
      FROM public.predictions p
      JOIN public.matches m ON m.id = p.match_id
      WHERE p.user_id = u.user_id AND m.round_id = _round_id;

      SELECT COUNT(*) INTO user_outcome_hits
      FROM public.predictions p
      JOIN public.matches m ON m.id = p.match_id
      WHERE p.user_id = u.user_id AND m.round_id = _round_id
        AND COALESCE(p.points_earned, 0) > 0;

      perfect_bonus := 0;
      IF user_predicted_count = match_count AND user_outcome_hits = match_count AND match_count > 0 THEN
        perfect_bonus := 500;
        PERFORM public.grant_coins(u.user_id, perfect_bonus, 'round_achievement',
          'Pleno fecha ' || _round_id,
          jsonb_build_object('round_id', _round_id, 'achievement', 'perfect_round'));
      END IF;
      ach := ach || jsonb_build_object('perfect', perfect_bonus);
    END IF;

    ----------------------------------------------------------------------
    -- 4) Top 1 ranking de la fecha
    ----------------------------------------------------------------------
    IF NOT (ach ? 'top1') AND top1_user = u.user_id AND best_user_pts > 0 THEN
      PERFORM public.grant_coins(u.user_id, 1000, 'round_achievement',
        '#1 ranking fecha ' || _round_id,
        jsonb_build_object('round_id', _round_id, 'achievement', 'top_scorer_round'));
      ach := ach || jsonb_build_object('top1', 1000);
    ELSIF NOT (ach ? 'top1') THEN
      ach := ach || jsonb_build_object('top1', 0);
    END IF;

    INSERT INTO public.round_payouts (user_id, round_id, points_paid, achievements_paid)
    VALUES (u.user_id, _round_id, pts, ach)
    ON CONFLICT (user_id, round_id) DO UPDATE
      SET points_paid = pts, achievements_paid = ach, paid_at = now();
  END LOOP;

  ----------------------------------------------------------------------
  -- 5) Bonus por desafíos resueltos en la fecha
  ----------------------------------------------------------------------
  DECLARE
    c RECORD;
  BEGIN
    FOR c IN
      SELECT id, challenger_id, opponent_id, winner_id, is_draw
      FROM public.challenges
      WHERE round_id = _round_id AND status = 'resolved'
    LOOP
      -- Marcar pago en metadata para no duplicar (usamos coin_transactions metadata)
      IF NOT EXISTS (
        SELECT 1 FROM public.coin_transactions
        WHERE tx_type = 'challenge_bonus' AND metadata->>'challenge_id' = c.id::text
      ) THEN
        IF c.is_draw THEN
          PERFORM public.grant_coins(c.challenger_id, 50, 'challenge_bonus',
            'Empate desafío', jsonb_build_object('challenge_id', c.id, 'round_id', _round_id));
          PERFORM public.grant_coins(c.opponent_id, 50, 'challenge_bonus',
            'Empate desafío', jsonb_build_object('challenge_id', c.id, 'round_id', _round_id));
        ELSIF c.winner_id IS NOT NULL THEN
          PERFORM public.grant_coins(c.winner_id, 200, 'challenge_bonus',
            'Ganaste un desafío', jsonb_build_object('challenge_id', c.id, 'round_id', _round_id));
        END IF;
      END IF;
    END LOOP;
  END;
END;
$function$;

-- 2) Simulación de apertura de sobres (no cobra ni guarda)
CREATE OR REPLACE FUNCTION public.simulate_pack(_pack_type pack_type, _iterations integer DEFAULT 100)
RETURNS TABLE(rarity card_rarity, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  num_cards INTEGER;
  guarantees_legendary BOOLEAN := FALSE;
  i INTEGER; j INTEGER;
  r NUMERIC;
  chosen_rarity public.card_rarity;
BEGIN
  CASE _pack_type
    WHEN 'comun' THEN num_cards := 5;
    WHEN 'raro' THEN num_cards := 7;
    WHEN 'epico' THEN num_cards := 9;
    WHEN 'legendario' THEN num_cards := 11; guarantees_legendary := TRUE;
  END CASE;

  IF _iterations < 1 THEN _iterations := 1; END IF;
  IF _iterations > 10000 THEN _iterations := 10000; END IF;

  CREATE TEMP TABLE _sim_results (rarity public.card_rarity) ON COMMIT DROP;

  FOR i IN 1.._iterations LOOP
    FOR j IN 1..num_cards LOOP
      IF guarantees_legendary AND j = num_cards THEN
        chosen_rarity := 'legendario';
      ELSE
        r := random();
        CASE _pack_type
          WHEN 'comun' THEN
            chosen_rarity := CASE WHEN r < 0.75 THEN 'comun'::card_rarity
                                  WHEN r < 0.97 THEN 'raro'::card_rarity
                                  ELSE 'epico'::card_rarity END;
          WHEN 'raro' THEN
            chosen_rarity := CASE WHEN r < 0.45 THEN 'comun'::card_rarity
                                  WHEN r < 0.90 THEN 'raro'::card_rarity
                                  WHEN r < 0.99 THEN 'epico'::card_rarity
                                  ELSE 'legendario'::card_rarity END;
          WHEN 'epico' THEN
            chosen_rarity := CASE WHEN r < 0.15 THEN 'comun'::card_rarity
                                  WHEN r < 0.60 THEN 'raro'::card_rarity
                                  WHEN r < 0.95 THEN 'epico'::card_rarity
                                  ELSE 'legendario'::card_rarity END;
          WHEN 'legendario' THEN
            chosen_rarity := CASE WHEN r < 0.30 THEN 'raro'::card_rarity
                                  WHEN r < 0.85 THEN 'epico'::card_rarity
                                  ELSE 'legendario'::card_rarity END;
        END CASE;
      END IF;
      INSERT INTO _sim_results VALUES (chosen_rarity);
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT s.rarity, COUNT(*)::bigint FROM _sim_results s GROUP BY s.rarity;
END;
$function$;