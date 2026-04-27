-- Tabla de pronósticos de goleadores (uno por usuario+partido+jugador, con cantidad)
CREATE TABLE public.goalscorer_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  match_id TEXT NOT NULL,
  player_id UUID NOT NULL,
  team_id TEXT NOT NULL,
  goals_predicted INTEGER NOT NULL DEFAULT 1 CHECK (goals_predicted >= 1 AND goals_predicted <= 7),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id, player_id)
);

CREATE INDEX idx_gsp_user_match ON public.goalscorer_predictions(user_id, match_id);
CREATE INDEX idx_gsp_match ON public.goalscorer_predictions(match_id);

ALTER TABLE public.goalscorer_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goalscorer preds viewable by everyone"
  ON public.goalscorer_predictions FOR SELECT USING (true);

CREATE POLICY "Users insert own gsp before kickoff"
  ON public.goalscorer_predictions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND m.match_date > now())
  );

CREATE POLICY "Users update own gsp before kickoff"
  ON public.goalscorer_predictions FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND m.match_date > now())
  );

CREATE POLICY "Users delete own gsp before kickoff"
  ON public.goalscorer_predictions FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND m.match_date > now())
  );

CREATE TRIGGER trg_gsp_updated_at
  BEFORE UPDATE ON public.goalscorer_predictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Validación: la suma de goals_predicted por equipo debe coincidir con la predicción del marcador
CREATE OR REPLACE FUNCTION public.validate_goalscorer_pred()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pred_home INT;
  pred_away INT;
  m_home TEXT;
  m_away TEXT;
  sum_home INT;
  sum_away INT;
BEGIN
  SELECT m.home_id, m.away_id INTO m_home, m_away FROM public.matches m WHERE m.id = NEW.match_id;
  IF m_home IS NULL THEN
    RAISE EXCEPTION 'Partido no existe';
  END IF;

  IF NEW.team_id NOT IN (m_home, m_away) THEN
    RAISE EXCEPTION 'El jugador no pertenece a un equipo del partido';
  END IF;

  -- Buscar predicción de marcador
  SELECT p.home_score, p.away_score INTO pred_home, pred_away
  FROM public.predictions p WHERE p.user_id = NEW.user_id AND p.match_id = NEW.match_id;

  IF pred_home IS NULL THEN
    RAISE EXCEPTION 'Primero cargá tu pronóstico de marcador';
  END IF;

  -- Calcular suma post-cambio (incluyendo este registro)
  SELECT COALESCE(SUM(CASE WHEN gsp.team_id = m_home THEN gsp.goals_predicted ELSE 0 END), 0),
         COALESCE(SUM(CASE WHEN gsp.team_id = m_away THEN gsp.goals_predicted ELSE 0 END), 0)
  INTO sum_home, sum_away
  FROM public.goalscorer_predictions gsp
  WHERE gsp.user_id = NEW.user_id AND gsp.match_id = NEW.match_id
    AND gsp.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF NEW.team_id = m_home THEN sum_home := sum_home + NEW.goals_predicted; END IF;
  IF NEW.team_id = m_away THEN sum_away := sum_away + NEW.goals_predicted; END IF;

  IF sum_home > pred_home THEN
    RAISE EXCEPTION 'Goleadores del local (%) superan los goles pronosticados (%)', sum_home, pred_home;
  END IF;
  IF sum_away > pred_away THEN
    RAISE EXCEPTION 'Goleadores del visitante (%) superan los goles pronosticados (%)', sum_away, pred_away;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_gsp
  BEFORE INSERT OR UPDATE ON public.goalscorer_predictions
  FOR EACH ROW EXECUTE FUNCTION public.validate_goalscorer_pred();

-- Recalcular puntos de goleadores cuando un partido finaliza o cambian sus eventos
CREATE OR REPLACE FUNCTION public.recalc_goalscorer_points(_match_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  m_stage match_stage;
  m_status match_status;
  mult NUMERIC;
BEGIN
  SELECT stage, status INTO m_stage, m_status FROM public.matches WHERE id = _match_id;
  IF m_status <> 'finished' THEN
    -- reset si no está terminado
    UPDATE public.goalscorer_predictions SET points_earned = 0 WHERE match_id = _match_id;
    RETURN;
  END IF;

  mult := public.stage_multiplier(m_stage);

  -- Para cada predicción: contar cuántos goles hizo realmente ese jugador (event_type='Goal')
  UPDATE public.goalscorer_predictions gsp
  SET points_earned = FLOOR(LEAST(gsp.goals_predicted, real_goals.cnt) * mult),
      updated_at = now()
  FROM (
    SELECT player_id, COUNT(*)::INT AS cnt
    FROM public.match_events
    WHERE match_id = _match_id AND event_type = 'Goal' AND player_id IS NOT NULL
    GROUP BY player_id
  ) real_goals
  WHERE gsp.match_id = _match_id AND gsp.player_id = real_goals.player_id;

  -- Los que no acertaron: 0
  UPDATE public.goalscorer_predictions gsp
  SET points_earned = 0
  WHERE gsp.match_id = _match_id
    AND NOT EXISTS (
      SELECT 1 FROM public.match_events e
      WHERE e.match_id = _match_id AND e.event_type = 'Goal' AND e.player_id = gsp.player_id
    );
END;
$$;

-- Trigger desde match_events (cuando se cargan goles)
CREATE OR REPLACE FUNCTION public.trg_match_events_recalc()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_goalscorer_points(COALESCE(NEW.match_id, OLD.match_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_events_after_change
  AFTER INSERT OR UPDATE OR DELETE ON public.match_events
  FOR EACH ROW EXECUTE FUNCTION public.trg_match_events_recalc();

-- Extender handle_match_result para recalcular goleadores también
CREATE OR REPLACE FUNCTION public.handle_match_result()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  k_factor NUMERIC := 32;
  home_elo NUMERIC;
  away_elo NUMERIC;
  expected_home NUMERIC;
  expected_away NUMERIC;
  actual_home NUMERIC;
  actual_away NUMERIC;
  goal_diff INTEGER;
  multiplier NUMERIC;
BEGIN
  IF NEW.status <> 'finished' OR NEW.home_score IS NULL OR NEW.away_score IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.predictions p
  SET points_earned = public.calc_prediction_points(p.home_score, p.away_score, NEW.home_score, NEW.away_score, NEW.stage),
      updated_at = now()
  WHERE p.match_id = NEW.id;

  -- Recalcular goleadores
  PERFORM public.recalc_goalscorer_points(NEW.id);

  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.home_score IS DISTINCT FROM NEW.home_score) OR (OLD.away_score IS DISTINCT FROM NEW.away_score) THEN
    SELECT elo_rating INTO home_elo FROM public.power_rankings WHERE team_id = NEW.home_id;
    SELECT elo_rating INTO away_elo FROM public.power_rankings WHERE team_id = NEW.away_id;
    
    IF home_elo IS NOT NULL AND away_elo IS NOT NULL THEN
      expected_home := 1.0 / (1.0 + POWER(10, (away_elo - home_elo) / 400.0));
      expected_away := 1.0 - expected_home;
      IF NEW.home_score > NEW.away_score THEN actual_home := 1.0; actual_away := 0.0;
      ELSIF NEW.home_score < NEW.away_score THEN actual_home := 0.0; actual_away := 1.0;
      ELSE actual_home := 0.5; actual_away := 0.5; END IF;
      goal_diff := ABS(NEW.home_score - NEW.away_score);
      multiplier := CASE WHEN goal_diff <= 1 THEN 1.0 WHEN goal_diff = 2 THEN 1.5 ELSE (11.0 + goal_diff) / 8.0 END;
      multiplier := multiplier * public.stage_multiplier(NEW.stage);
      UPDATE public.power_rankings SET elo_rating = home_elo + k_factor * multiplier * (actual_home - expected_home),
        matches_played = matches_played + 1,
        wins = wins + (CASE WHEN actual_home = 1.0 THEN 1 ELSE 0 END),
        draws = draws + (CASE WHEN actual_home = 0.5 THEN 1 ELSE 0 END),
        losses = losses + (CASE WHEN actual_home = 0.0 THEN 1 ELSE 0 END),
        goals_for = goals_for + NEW.home_score, goals_against = goals_against + NEW.away_score,
        updated_at = now() WHERE team_id = NEW.home_id;
      UPDATE public.power_rankings SET elo_rating = away_elo + k_factor * multiplier * (actual_away - expected_away),
        matches_played = matches_played + 1,
        wins = wins + (CASE WHEN actual_away = 1.0 THEN 1 ELSE 0 END),
        draws = draws + (CASE WHEN actual_away = 0.5 THEN 1 ELSE 0 END),
        losses = losses + (CASE WHEN actual_away = 0.0 THEN 1 ELSE 0 END),
        goals_for = goals_for + NEW.away_score, goals_against = goals_against + NEW.home_score,
        updated_at = now() WHERE team_id = NEW.away_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Asegurar trigger en matches (idempotente)
DROP TRIGGER IF EXISTS trg_match_result ON public.matches;
CREATE TRIGGER trg_match_result
  AFTER INSERT OR UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_match_result();

-- Asegurar trigger en tournament_awards (idempotente)
DROP TRIGGER IF EXISTS trg_awards_update ON public.tournament_awards;
CREATE TRIGGER trg_awards_update
  AFTER UPDATE ON public.tournament_awards
  FOR EACH ROW EXECUTE FUNCTION public.handle_awards_update();

-- Realtime para nueva tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.goalscorer_predictions;