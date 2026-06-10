-- El predictor sugiere el pronostico que maximiza puntos esperados del prode.
-- Scoring: 3 pts exacto (reemplaza al punto de resultado), 1 pt resultado.
-- EV(marcador) = 2*P(exacto) + P(resultado). Los multiplicadores por fase
-- escalan parejo dentro de un partido, asi que el ranking queda igual.

drop function if exists public.predict_match(text, text);

create function public.predict_match(_home_id text, _away_id text)
returns table(home_score integer, away_score integer, p_exact numeric, p_outcome numeric, ev_points numeric)
language plpgsql
stable
set search_path to 'public'
as $function$
declare
  home_elo numeric;
  away_elo numeric;
  diff numeric;
  base numeric := 1.40;
  ha numeric;
  lh numeric;
  la numeric;
begin
  select elo_rating into home_elo from public.power_rankings where team_id = _home_id;
  select elo_rating into away_elo from public.power_rankings where team_id = _away_id;
  if home_elo is null or away_elo is null then return; end if;

  diff := home_elo - away_elo;
  ha := case when _home_id in ('usa','mex','can') then 0.25 else 0.08 end;
  lh := greatest(0.2, base + (diff / 400.0) + ha);
  la := greatest(0.2, base - (diff / 400.0));

  -- Grilla 0..8 cubre >99.9% de la masa de probabilidad con estos lambdas.
  return query
  with grid as (
    select gi.i, gj.j,
           (exp(-lh) * power(lh, gi.i) / factorial(gi.i)) *
           (exp(-la) * power(la, gj.j) / factorial(gj.j)) as p
    from generate_series(0, 8) as gi(i), generate_series(0, 8) as gj(j)
  ),
  outcomes as (
    select
      sum(p) filter (where i > j) as ph,
      sum(p) filter (where i = j) as pd,
      sum(p) filter (where i < j) as pa
    from grid
  )
  select g.i, g.j,
         round(g.p, 4),
         round(case when g.i > g.j then o.ph when g.i = g.j then o.pd else o.pa end, 4),
         round(2 * g.p + case when g.i > g.j then o.ph when g.i = g.j then o.pd else o.pa end, 4)
  from grid g cross join outcomes o
  order by 5 desc, 3 desc
  limit 5;
end;
$function$;

-- Solo el server (service_role) la invoca; el panel admin pasa por predictMatch.
revoke execute on function public.predict_match(text, text) from public, anon, authenticated;
