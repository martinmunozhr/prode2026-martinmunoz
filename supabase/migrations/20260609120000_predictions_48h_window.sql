-- Ventana de pronóstico: abre 48hs antes del kickoff, cierra en el horario de comienzo.
-- Antes las policies solo cerraban en el kickoff (match_date > now()), sin límite inferior:
-- se podía pronosticar en cualquier momento previo. Ahora se exige además que falten
-- 48hs o menos para el partido. Candado duro, en línea con el frontend (getMatchPredState).

drop policy if exists "Users insert own predictions before kickoff" on public.predictions;
drop policy if exists "Users update own predictions before kickoff" on public.predictions;

create policy "Users insert own predictions in window" on public.predictions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.match_date > now()
        and m.match_date <= now() + interval '48 hours'
    )
  );

create policy "Users update own predictions in window" on public.predictions
  for update using (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.match_date > now()
        and m.match_date <= now() + interval '48 hours'
    )
  );
