
-- ============================================================
-- 1. NEW TABLES
-- ============================================================

-- Players (squads)
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('GK','DEF','MID','FWD')),
  jersey_number INTEGER,
  club TEXT,
  is_captain BOOLEAN NOT NULL DEFAULT false,
  api_player_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_players_team ON public.players(team_id);
CREATE UNIQUE INDEX idx_players_api ON public.players(api_player_id) WHERE api_player_id IS NOT NULL;

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players viewable by everyone" ON public.players FOR SELECT USING (true);
CREATE POLICY "Admins insert players" ON public.players FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update players" ON public.players FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete players" ON public.players FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_players_updated BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Match events
CREATE TABLE public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES public.teams(id),
  player_id UUID REFERENCES public.players(id),
  player_name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('goal','own_goal','penalty','yellow_card','red_card','substitution')),
  minute INTEGER,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_match ON public.match_events(match_id);
CREATE INDEX idx_events_player ON public.match_events(player_id);

ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "Admins insert events" ON public.match_events FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update events" ON public.match_events FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete events" ON public.match_events FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Power rankings (ELO)
CREATE TABLE public.power_rankings (
  team_id TEXT PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  elo_rating NUMERIC(8,2) NOT NULL DEFAULT 1500,
  matches_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.power_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Power rankings viewable by everyone" ON public.power_rankings FOR SELECT USING (true);
CREATE POLICY "Admins manage power rankings insert" ON public.power_rankings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage power rankings update" ON public.power_rankings FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Tournament awards (oficial)
CREATE TABLE public.tournament_awards (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  campeon_id TEXT REFERENCES public.teams(id),
  subcampeon_id TEXT REFERENCES public.teams(id),
  tercer_puesto_id TEXT REFERENCES public.teams(id),
  fair_play_id TEXT REFERENCES public.teams(id),
  goleador_nombre TEXT,
  mejor_jugador_nombre TEXT,
  mejor_arquero_nombre TEXT,
  finalized BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.tournament_awards (id) VALUES (1);

ALTER TABLE public.tournament_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Awards viewable by everyone" ON public.tournament_awards FOR SELECT USING (true);
CREATE POLICY "Admins update awards" ON public.tournament_awards FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- App settings
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.app_settings (key, value, is_public) VALUES
  ('api_football_daily_limit', '100'::jsonb, true),
  ('api_football_requests_today', '0'::jsonb, true),
  ('last_sync_date', '"1970-01-01"'::jsonb, true),
  ('squads_locked', 'false'::jsonb, true);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings viewable by everyone" ON public.app_settings FOR SELECT USING (is_public = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update settings" ON public.app_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert settings" ON public.app_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- API sync logs
CREATE TABLE public.api_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success','partial','failed')),
  requests_used INTEGER NOT NULL DEFAULT 0,
  details JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sync_logs_created ON public.api_sync_logs(created_at DESC);

ALTER TABLE public.api_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view sync logs" ON public.api_sync_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert sync logs" ON public.api_sync_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============================================================
-- 2. SEED POWER RANKINGS for existing teams
-- ============================================================
INSERT INTO public.power_rankings (team_id, elo_rating)
SELECT id, 
  CASE confederation
    WHEN 'UEFA' THEN 1750
    WHEN 'CONMEBOL' THEN 1720
    WHEN 'CONCACAF' THEN 1500
    WHEN 'AFC' THEN 1480
    WHEN 'CAF' THEN 1500
    WHEN 'OFC' THEN 1300
    ELSE 1500
  END
FROM public.teams
ON CONFLICT (team_id) DO NOTHING;

-- ============================================================
-- 3. SCORING FUNCTIONS
-- ============================================================

-- Stage multiplier
CREATE OR REPLACE FUNCTION public.stage_multiplier(_stage match_stage)
RETURNS NUMERIC LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _stage
    WHEN 'Grupos' THEN 1.0
    WHEN 'Dieciseisavos' THEN 1.0
    WHEN 'Octavos' THEN 1.5
    WHEN 'Cuartos' THEN 2.0
    WHEN 'Semifinal' THEN 2.5
    WHEN 'Tercer Puesto' THEN 2.0
    WHEN 'Final' THEN 3.0
    ELSE 1.0
  END
$$;

-- Calculate prediction points
CREATE OR REPLACE FUNCTION public.calc_prediction_points(
  _pred_home INTEGER, _pred_away INTEGER,
  _real_home INTEGER, _real_away INTEGER,
  _stage match_stage
) RETURNS INTEGER LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  mult NUMERIC := public.stage_multiplier(_stage);
  pred_outcome TEXT;
  real_outcome TEXT;
BEGIN
  IF _pred_home = _real_home AND _pred_away = _real_away THEN
    RETURN FLOOR(3 * mult);
  END IF;
  pred_outcome := CASE WHEN _pred_home > _pred_away THEN 'H' WHEN _pred_home < _pred_away THEN 'A' ELSE 'D' END;
  real_outcome := CASE WHEN _real_home > _real_away THEN 'H' WHEN _real_home < _real_away THEN 'A' ELSE 'D' END;
  IF pred_outcome = real_outcome THEN
    RETURN FLOOR(1 * mult);
  END IF;
  RETURN 0;
END;
$$;

-- Trigger: when match finishes, update predictions points + ELO
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
  -- only act when finishing with scores
  IF NEW.status <> 'finished' OR NEW.home_score IS NULL OR NEW.away_score IS NULL THEN
    RETURN NEW;
  END IF;

  -- Recalc all predictions for this match
  UPDATE public.predictions p
  SET points_earned = public.calc_prediction_points(p.home_score, p.away_score, NEW.home_score, NEW.away_score, NEW.stage),
      updated_at = now()
  WHERE p.match_id = NEW.id;

  -- Update ELO only if status changed to finished (or scores changed)
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.home_score IS DISTINCT FROM NEW.home_score) OR (OLD.away_score IS DISTINCT FROM NEW.away_score) THEN
    SELECT elo_rating INTO home_elo FROM public.power_rankings WHERE team_id = NEW.home_id;
    SELECT elo_rating INTO away_elo FROM public.power_rankings WHERE team_id = NEW.away_id;
    
    IF home_elo IS NOT NULL AND away_elo IS NOT NULL THEN
      expected_home := 1.0 / (1.0 + POWER(10, (away_elo - home_elo) / 400.0));
      expected_away := 1.0 - expected_home;
      
      IF NEW.home_score > NEW.away_score THEN
        actual_home := 1.0; actual_away := 0.0;
      ELSIF NEW.home_score < NEW.away_score THEN
        actual_home := 0.0; actual_away := 1.0;
      ELSE
        actual_home := 0.5; actual_away := 0.5;
      END IF;
      
      goal_diff := ABS(NEW.home_score - NEW.away_score);
      multiplier := CASE 
        WHEN goal_diff <= 1 THEN 1.0
        WHEN goal_diff = 2 THEN 1.5
        ELSE (11.0 + goal_diff) / 8.0
      END;
      
      -- Stage importance
      multiplier := multiplier * public.stage_multiplier(NEW.stage);
      
      UPDATE public.power_rankings SET
        elo_rating = home_elo + k_factor * multiplier * (actual_home - expected_home),
        matches_played = matches_played + 1,
        wins = wins + (CASE WHEN actual_home = 1.0 THEN 1 ELSE 0 END),
        draws = draws + (CASE WHEN actual_home = 0.5 THEN 1 ELSE 0 END),
        losses = losses + (CASE WHEN actual_home = 0.0 THEN 1 ELSE 0 END),
        goals_for = goals_for + NEW.home_score,
        goals_against = goals_against + NEW.away_score,
        updated_at = now()
      WHERE team_id = NEW.home_id;
      
      UPDATE public.power_rankings SET
        elo_rating = away_elo + k_factor * multiplier * (actual_away - expected_away),
        matches_played = matches_played + 1,
        wins = wins + (CASE WHEN actual_away = 1.0 THEN 1 ELSE 0 END),
        draws = draws + (CASE WHEN actual_away = 0.5 THEN 1 ELSE 0 END),
        losses = losses + (CASE WHEN actual_away = 0.0 THEN 1 ELSE 0 END),
        goals_for = goals_for + NEW.away_score,
        goals_against = goals_against + NEW.home_score,
        updated_at = now()
      WHERE team_id = NEW.away_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_result
AFTER INSERT OR UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.handle_match_result();

-- Crystal ball recalc
CREATE OR REPLACE FUNCTION public.handle_awards_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.crystal_ball cb
  SET points_earned = 
    (CASE WHEN cb.campeon_id IS NOT NULL AND cb.campeon_id = NEW.campeon_id THEN 10 ELSE 0 END) +
    (CASE WHEN cb.goleador_nombre IS NOT NULL AND cb.goleador_nombre = NEW.goleador_nombre THEN 7 ELSE 0 END) +
    (CASE WHEN cb.mejor_jugador_nombre IS NOT NULL AND cb.mejor_jugador_nombre = NEW.mejor_jugador_nombre THEN 7 ELSE 0 END) +
    (CASE WHEN cb.mejor_arquero_nombre IS NOT NULL AND cb.mejor_arquero_nombre = NEW.mejor_arquero_nombre THEN 5 ELSE 0 END) +
    (CASE WHEN cb.fair_play_id IS NOT NULL AND cb.fair_play_id = NEW.fair_play_id THEN 3 ELSE 0 END),
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_awards_update
AFTER UPDATE ON public.tournament_awards
FOR EACH ROW EXECUTE FUNCTION public.handle_awards_update();

-- ============================================================
-- 4. ADMIN AUTO-ASSIGN for martinmunoz.rrhh@gmail.com
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname TEXT;
  fav TEXT;
  user_role app_role := 'user';
BEGIN
  uname := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  fav := NEW.raw_user_meta_data->>'favorite_team_id';

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = uname) THEN
    uname := uname || '_' || substr(NEW.id::text, 1, 6);
  END IF;

  INSERT INTO public.profiles (id, username, favorite_team_id)
  VALUES (NEW.id, uname, fav);

  -- Admin auto-assign
  IF LOWER(NEW.email) = 'martinmunoz.rrhh@gmail.com' THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. PREDICTOR FUNCTION (Poisson over ELO)
-- ============================================================
CREATE OR REPLACE FUNCTION public.predict_match(_home_id TEXT, _away_id TEXT)
RETURNS TABLE(home_score INTEGER, away_score INTEGER, probability NUMERIC) 
LANGUAGE plpgsql STABLE AS $$
DECLARE
  home_elo NUMERIC;
  away_elo NUMERIC;
  diff NUMERIC;
  lambda_home NUMERIC;
  lambda_away NUMERIC;
  i INTEGER;
  j INTEGER;
  p NUMERIC;
  fact_i NUMERIC;
  fact_j NUMERIC;
BEGIN
  SELECT elo_rating INTO home_elo FROM public.power_rankings WHERE team_id = _home_id;
  SELECT elo_rating INTO away_elo FROM public.power_rankings WHERE team_id = _away_id;
  IF home_elo IS NULL OR away_elo IS NULL THEN
    RETURN;
  END IF;
  
  diff := home_elo - away_elo;
  -- Average World Cup goals ~ 1.4 per side, +home advantage 0.25
  lambda_home := GREATEST(0.2, 1.45 + (diff / 400.0) + 0.25);
  lambda_away := GREATEST(0.2, 1.45 - (diff / 400.0));
  
  CREATE TEMP TABLE tmp_pred(h INT, a INT, prob NUMERIC) ON COMMIT DROP;
  
  FOR i IN 0..6 LOOP
    fact_i := 1;
    FOR k IN 1..i LOOP fact_i := fact_i * k; END LOOP;
    FOR j IN 0..6 LOOP
      fact_j := 1;
      FOR k IN 1..j LOOP fact_j := fact_j * k; END LOOP;
      p := (EXP(-lambda_home) * POWER(lambda_home, i) / fact_i) *
           (EXP(-lambda_away) * POWER(lambda_away, j) / fact_j);
      INSERT INTO tmp_pred VALUES (i, j, p);
    END LOOP;
  END LOOP;
  
  RETURN QUERY SELECT h, a, prob FROM tmp_pred ORDER BY prob DESC LIMIT 5;
END;
$$;
