-- 1) USER_ROLES: restrict SELECT and add INSERT/UPDATE/DELETE policies
DROP POLICY IF EXISTS "Roles viewable by everyone" ON public.user_roles;

CREATE POLICY "Users view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) PREDICTIONS: hide pre-kickoff predictions from other users
DROP POLICY IF EXISTS "Predictions viewable by everyone" ON public.predictions;

CREATE POLICY "Own predictions always viewable"
  ON public.predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Predictions viewable after kickoff"
  ON public.predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = predictions.match_id
        AND m.match_date <= now()
    )
  );

-- 3) REALTIME: scope channel subscriptions
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read own + public topics" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated can write own topics" ON realtime.messages;

CREATE POLICY "Authenticated can read own + public topics"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    realtime.topic() LIKE 'public:%'
    OR realtime.topic() LIKE 'match:%'
    OR realtime.topic() = 'user:' || auth.uid()::text
    OR realtime.topic() LIKE 'user:' || auth.uid()::text || ':%'
  );

CREATE POLICY "Authenticated can write own topics"
  ON realtime.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.topic() LIKE 'public:%'
    OR realtime.topic() = 'user:' || auth.uid()::text
    OR realtime.topic() LIKE 'user:' || auth.uid()::text || ':%'
  );