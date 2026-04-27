-- ============================================================
-- 1. ROUNDS (Jornadas)
-- ============================================================
CREATE TABLE public.rounds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stage public.match_stage NOT NULL,
  group_matchday INTEGER, -- 1, 2, 3 para fase de grupos; null para KO
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rounds viewable by everyone" ON public.rounds
  FOR SELECT USING (true);

CREATE POLICY "Admins insert rounds" ON public.rounds
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update rounds" ON public.rounds
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete rounds" ON public.rounds
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_rounds_updated_at
  BEFORE UPDATE ON public.rounds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Agregar round_id a matches
ALTER TABLE public.matches ADD COLUMN round_id TEXT REFERENCES public.rounds(id) ON DELETE SET NULL;
CREATE INDEX idx_matches_round_id ON public.matches(round_id);

-- ============================================================
-- 2. Seed inicial de jornadas (Mundial 2026: 3 grupos jornadas + KO)
-- ============================================================
INSERT INTO public.rounds (id, name, stage, group_matchday, sort_order) VALUES
  ('grupos-j1', 'Fase de Grupos - Jornada 1', 'Grupos', 1, 10),
  ('grupos-j2', 'Fase de Grupos - Jornada 2', 'Grupos', 2, 20),
  ('grupos-j3', 'Fase de Grupos - Jornada 3', 'Grupos', 3, 30),
  ('dieciseisavos', 'Dieciseisavos de Final', 'Dieciseisavos', NULL, 40),
  ('octavos', 'Octavos de Final', 'Octavos', NULL, 50),
  ('cuartos', 'Cuartos de Final', 'Cuartos', NULL, 60),
  ('semifinal', 'Semifinales', 'Semifinal', NULL, 70),
  ('tercer-puesto', 'Tercer Puesto', 'Tercer Puesto', NULL, 80),
  ('final', 'Final', 'Final', NULL, 90);

-- ============================================================
-- 3. Función para asignar round_id automáticamente a matches
-- ============================================================
CREATE OR REPLACE FUNCTION public.assign_match_round()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rid TEXT;
  matchday INT;
BEGIN
  IF NEW.stage = 'Grupos' THEN
    -- Calcular jornada: usar el partido # del equipo en el grupo (basado en match_date orden)
    -- Simplificación: contar partidos previos del home en el mismo grupo + 1
    SELECT COUNT(*) + 1 INTO matchday
    FROM public.matches m
    WHERE m.stage = 'Grupos'
      AND m.group_letter = NEW.group_letter
      AND (m.home_id = NEW.home_id OR m.away_id = NEW.home_id)
      AND m.match_date < NEW.match_date
      AND m.id <> NEW.id;
    matchday := LEAST(matchday, 3);
    rid := 'grupos-j' || matchday::text;
  ELSIF NEW.stage = 'Dieciseisavos' THEN rid := 'dieciseisavos';
  ELSIF NEW.stage = 'Octavos' THEN rid := 'octavos';
  ELSIF NEW.stage = 'Cuartos' THEN rid := 'cuartos';
  ELSIF NEW.stage = 'Semifinal' THEN rid := 'semifinal';
  ELSIF NEW.stage = 'Tercer Puesto' THEN rid := 'tercer-puesto';
  ELSIF NEW.stage = 'Final' THEN rid := 'final';
  END IF;
  NEW.round_id := rid;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_assign_round
  BEFORE INSERT OR UPDATE OF stage, group_letter, match_date, home_id, away_id ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.assign_match_round();

-- Backfill round_id en matches existentes
UPDATE public.matches SET stage = stage WHERE round_id IS NULL;

-- ============================================================
-- 4. Función: actualizar starts_at / ends_at de una jornada
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_round_dates(_round_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.rounds r
  SET starts_at = (SELECT MIN(match_date) FROM public.matches WHERE round_id = _round_id),
      ends_at = (SELECT MAX(match_date) FROM public.matches WHERE round_id = _round_id),
      updated_at = now()
  WHERE r.id = _round_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_match_refresh_round()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.round_id IS NOT NULL THEN
    PERFORM public.refresh_round_dates(NEW.round_id);
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.round_id IS NOT NULL AND OLD.round_id <> NEW.round_id THEN
    PERFORM public.refresh_round_dates(OLD.round_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_refresh_round_dates
  AFTER INSERT OR UPDATE OF round_id, match_date ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.trg_match_refresh_round();

-- ============================================================
-- 5. Función: puntos de un usuario en una jornada
-- ============================================================
CREATE OR REPLACE FUNCTION public.points_for_user_in_round(_user_id UUID, _round_id TEXT)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT SUM(COALESCE(p.points_earned, 0))
    FROM public.predictions p
    JOIN public.matches m ON m.id = p.match_id
    WHERE p.user_id = _user_id AND m.round_id = _round_id
  ), 0) + COALESCE((
    SELECT SUM(COALESCE(g.points_earned, 0))
    FROM public.goalscorer_predictions g
    JOIN public.matches m ON m.id = g.match_id
    WHERE g.user_id = _user_id AND m.round_id = _round_id
  ), 0);
$$;

-- ============================================================
-- 6. CHALLENGES (Desafíos)
-- ============================================================
CREATE TYPE public.challenge_status AS ENUM ('pending', 'accepted', 'rejected', 'resolved', 'cancelled');

CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id TEXT NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL,
  opponent_id UUID NOT NULL,
  status public.challenge_status NOT NULL DEFAULT 'pending',
  challenger_points INTEGER,
  opponent_points INTEGER,
  -- Ganador. NULL = empate o sin resolver
  winner_id UUID,
  is_draw BOOLEAN NOT NULL DEFAULT false,
  -- Bonus: puntos del rival que se lleva el ganador
  bonus_points INTEGER,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT challenges_diff_users CHECK (challenger_id <> opponent_id)
);

CREATE INDEX idx_challenges_round ON public.challenges(round_id);
CREATE INDEX idx_challenges_challenger ON public.challenges(challenger_id);
CREATE INDEX idx_challenges_opponent ON public.challenges(opponent_id);
CREATE INDEX idx_challenges_status ON public.challenges(status);

-- Índice único parcial: un usuario solo puede tener un desafío activo (pending/accepted) por jornada
CREATE UNIQUE INDEX uniq_challenge_active_per_user_round_challenger
  ON public.challenges(challenger_id, round_id)
  WHERE status IN ('pending', 'accepted');

CREATE UNIQUE INDEX uniq_challenge_active_per_user_round_opponent
  ON public.challenges(opponent_id, round_id)
  WHERE status IN ('pending', 'accepted');

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

-- Crear desafío: solo siendo retador, jornada aún no empezada
CREATE POLICY "Users create own challenges before round starts" ON public.challenges
  FOR INSERT WITH CHECK (
    auth.uid() = challenger_id
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.rounds r
      WHERE r.id = round_id
        AND (r.starts_at IS NULL OR r.starts_at > now())
    )
  );

-- Aceptar / rechazar / cancelar:
-- - opponent puede pasar de pending → accepted o rejected
-- - challenger puede pasar de pending → cancelled
-- - solo antes de que empiece la jornada
CREATE POLICY "Users respond to own challenges before round starts" ON public.challenges
  FOR UPDATE USING (
    (auth.uid() = opponent_id OR auth.uid() = challenger_id)
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.rounds r
      WHERE r.id = round_id
        AND (r.starts_at IS NULL OR r.starts_at > now())
    )
  );

CREATE TRIGGER trg_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 7. Función: ¿está terminada toda una jornada? (todos los partidos finished)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_round_finished(_round_id TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT COUNT(*) > 0 AND BOOL_AND(status = 'finished')
    FROM public.matches WHERE round_id = _round_id
  ), false);
$$;

-- ============================================================
-- 8. Función: resolver un desafío
-- ============================================================
CREATE OR REPLACE FUNCTION public.resolve_challenge(_challenge_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c RECORD;
  pts_c INT;
  pts_o INT;
BEGIN
  SELECT * INTO c FROM public.challenges WHERE id = _challenge_id;
  IF c IS NULL THEN RAISE EXCEPTION 'Desafío no existe'; END IF;
  IF c.status <> 'accepted' THEN RAISE EXCEPTION 'Solo se resuelven desafíos aceptados'; END IF;
  IF NOT public.is_round_finished(c.round_id) THEN
    RAISE EXCEPTION 'La jornada no está terminada todavía';
  END IF;

  pts_c := public.points_for_user_in_round(c.challenger_id, c.round_id);
  pts_o := public.points_for_user_in_round(c.opponent_id, c.round_id);

  UPDATE public.challenges SET
    challenger_points = pts_c,
    opponent_points = pts_o,
    is_draw = (pts_c = pts_o),
    -- Empate: cada uno se lleva la mitad de los puntos del rival
    bonus_points = CASE
      WHEN pts_c = pts_o THEN FLOOR(pts_o / 2.0)::INT  -- referencial; en empate ambos reciben FLOOR(otro/2)
      WHEN pts_c > pts_o THEN pts_o
      ELSE pts_c
    END,
    winner_id = CASE WHEN pts_c = pts_o THEN NULL WHEN pts_c > pts_o THEN c.challenger_id ELSE c.opponent_id END,
    status = 'resolved',
    resolved_at = now(),
    updated_at = now()
  WHERE id = _challenge_id;
END;
$$;

-- ============================================================
-- 9. Auto-resolver: cuando un match pasa a finished, intentar resolver desafíos de esa jornada
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_resolve_round_challenges()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ch RECORD;
BEGIN
  IF NEW.status = 'finished' AND NEW.round_id IS NOT NULL AND public.is_round_finished(NEW.round_id) THEN
    FOR ch IN SELECT id FROM public.challenges WHERE round_id = NEW.round_id AND status = 'accepted' LOOP
      BEGIN
        PERFORM public.resolve_challenge(ch.id);
      EXCEPTION WHEN OTHERS THEN
        -- log y seguir
        RAISE NOTICE 'No se pudo resolver desafío %: %', ch.id, SQLERRM;
      END;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_auto_resolve_challenges
  AFTER UPDATE OF status, home_score, away_score ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.auto_resolve_round_challenges();