CREATE TABLE public.crystal_ball (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  locked BOOLEAN NOT NULL DEFAULT false,
  campeon_id TEXT,
  goleador_nombre TEXT,
  mejor_jugador_nombre TEXT,
  mejor_arquero_nombre TEXT,
  fair_play_id TEXT,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crystal_ball ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crystal ball viewable by everyone"
  ON public.crystal_ball FOR SELECT USING (true);

CREATE POLICY "Users insert own crystal ball"
  ON public.crystal_ball FOR INSERT
  WITH CHECK (auth.uid() = user_id AND locked = false);

CREATE POLICY "Users update own crystal ball when not locked"
  ON public.crystal_ball FOR UPDATE
  USING (auth.uid() = user_id AND locked = false);

CREATE TRIGGER update_crystal_ball_updated_at
  BEFORE UPDATE ON public.crystal_ball
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();