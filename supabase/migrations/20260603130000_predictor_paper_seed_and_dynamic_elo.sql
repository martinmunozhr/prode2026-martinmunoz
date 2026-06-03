-- Predictor del Mundial: siembra de fuerza desde el paper + ajuste dinámico de Elo.
--
-- Contexto: el predictor (RPC predict_match) usa Elo→Poisson para dar marcadores
-- probables, pero todos los equipos tenían Elo=1750 (sin diferenciación) y no había
-- ningún mecanismo de actualización con resultados reales.
--
-- Esta migración:
--   1) Agrega power_rankings.seed_rating = prior experto basado en el paper de
--      Panmure Liberum (Klement, abr-2026): cuotas Polymarket (Fig 3) + prob. de
--      clasificación (Fig 1) + criterio futbolístico. NO bakea los upsets de suerte
--      del bracket (Brasil queda fuerte aunque el paper lo elimine temprano).
--   2) Siembra elo_rating = seed_rating.
--   3) recompute_power_rankings(): resetea al seed y reproduce todos los partidos
--      finalizados en orden de fecha aplicando Elo (idempotente, tolera correcciones).
--   4) Trigger en matches que recalcula automáticamente al cargar/editar resultados.

-- 1) Columna de seed (prior del paper)
alter table public.power_rankings
  add column if not exists seed_rating numeric;

-- 2) Siembra. team_id, rating del prior experto.
insert into public.power_rankings (team_id, seed_rating, elo_rating, matches_played, wins, draws, losses, goals_for, goals_against)
values
  ('esp',1910,1910,0,0,0,0,0,0),
  ('fra',1890,1890,0,0,0,0,0,0),
  ('ing',1855,1855,0,0,0,0,0,0),
  ('arg',1840,1840,0,0,0,0,0,0),
  ('bra',1840,1840,0,0,0,0,0,0),
  ('por',1815,1815,0,0,0,0,0,0),
  ('ger',1795,1795,0,0,0,0,0,0),
  ('ned',1785,1785,0,0,0,0,0,0),
  ('bel',1760,1760,0,0,0,0,0,0),
  ('nor',1755,1755,0,0,0,0,0,0),
  ('cro',1720,1720,0,0,0,0,0,0),
  ('uru',1715,1715,0,0,0,0,0,0),
  ('col',1705,1705,0,0,0,0,0,0),
  ('mar',1705,1705,0,0,0,0,0,0),
  ('sui',1695,1695,0,0,0,0,0,0),
  ('jpn',1690,1690,0,0,0,0,0,0),
  ('sen',1685,1685,0,0,0,0,0,0),
  ('usa',1660,1660,0,0,0,0,0,0),
  ('mex',1655,1655,0,0,0,0,0,0),
  ('swe',1650,1650,0,0,0,0,0,0),
  ('kor',1645,1645,0,0,0,0,0,0),
  ('tur',1640,1640,0,0,0,0,0,0),
  ('ecu',1635,1635,0,0,0,0,0,0),
  ('egy',1625,1625,0,0,0,0,0,0),
  ('civ',1625,1625,0,0,0,0,0,0),
  ('aut',1620,1620,0,0,0,0,0,0),
  ('aus',1615,1615,0,0,0,0,0,0),
  ('irn',1610,1610,0,0,0,0,0,0),
  ('alg',1600,1600,0,0,0,0,0,0),
  ('can',1600,1600,0,0,0,0,0,0),
  ('sco',1600,1600,0,0,0,0,0,0),
  ('cze',1585,1585,0,0,0,0,0,0),
  ('tun',1560,1560,0,0,0,0,0,0),
  ('par',1560,1560,0,0,0,0,0,0),
  ('cod',1555,1555,0,0,0,0,0,0),
  ('gha',1555,1555,0,0,0,0,0,0),
  ('qat',1550,1550,0,0,0,0,0,0),
  ('ksa',1545,1545,0,0,0,0,0,0),
  ('uzb',1540,1540,0,0,0,0,0,0),
  ('rsa',1535,1535,0,0,0,0,0,0),
  ('pan',1525,1525,0,0,0,0,0,0),
  ('bih',1525,1525,0,0,0,0,0,0),
  ('jor',1495,1495,0,0,0,0,0,0),
  ('irq',1495,1495,0,0,0,0,0,0),
  ('cpv',1440,1440,0,0,0,0,0,0),
  ('nzl',1430,1430,0,0,0,0,0,0),
  ('cuw',1400,1400,0,0,0,0,0,0),
  ('hai',1385,1385,0,0,0,0,0,0)
on conflict (team_id) do update
  set seed_rating = excluded.seed_rating,
      elo_rating  = excluded.seed_rating,
      matches_played = 0, wins = 0, draws = 0, losses = 0,
      goals_for = 0, goals_against = 0;

-- 3) Recálculo: reset al seed + replay de finalizados en orden de fecha.
create or replace function public.recompute_power_rankings()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  m record;
  rh numeric; ra numeric;
  eh numeric; sh numeric;
  k numeric := 40;          -- factor de aprendizaje (pocos partidos por equipo)
  gd integer; g numeric;    -- multiplicador por diferencia de gol (World Football Elo)
begin
  update public.power_rankings
    set elo_rating = coalesce(seed_rating, 1500),
        matches_played = 0, wins = 0, draws = 0, losses = 0,
        goals_for = 0, goals_against = 0;

  for m in
    select home_id, away_id, home_score, away_score
    from public.matches
    where status = 'finished'
      and home_score is not null and away_score is not null
      and home_id <> 'tbd' and away_id <> 'tbd'
    order by match_date asc, id asc
  loop
    select elo_rating into rh from public.power_rankings where team_id = m.home_id;
    select elo_rating into ra from public.power_rankings where team_id = m.away_id;
    if rh is null or ra is null then continue; end if;

    eh := 1.0 / (1.0 + power(10.0, (ra - rh) / 400.0));   -- esperanza local
    if    m.home_score > m.away_score then sh := 1;
    elsif m.home_score = m.away_score then sh := 0.5;
    else  sh := 0; end if;

    gd := abs(m.home_score - m.away_score);
    g  := case when gd <= 1 then 1 when gd = 2 then 1.5 else (11.0 + gd) / 8.0 end;

    update public.power_rankings set
      elo_rating = rh + k * g * (sh - eh),
      matches_played = matches_played + 1,
      wins   = wins   + (case when sh = 1   then 1 else 0 end),
      draws  = draws  + (case when sh = 0.5 then 1 else 0 end),
      losses = losses + (case when sh = 0   then 1 else 0 end),
      goals_for = goals_for + m.home_score,
      goals_against = goals_against + m.away_score
    where team_id = m.home_id;

    update public.power_rankings set
      elo_rating = ra + k * g * (eh - sh),
      matches_played = matches_played + 1,
      wins   = wins   + (case when sh = 0   then 1 else 0 end),
      draws  = draws  + (case when sh = 0.5 then 1 else 0 end),
      losses = losses + (case when sh = 1   then 1 else 0 end),
      goals_for = goals_for + m.away_score,
      goals_against = goals_against + m.home_score
    where team_id = m.away_id;
  end loop;

  update public.power_rankings set updated_at = now();
end;
$$;

-- 4) Trigger: recalcular al insertar/editar/borrar resultados.
create or replace function public.trg_recompute_elo()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public.recompute_power_rankings();
  return null;
end;
$$;

drop trigger if exists matches_elo_recompute on public.matches;
create trigger matches_elo_recompute
  after insert or delete or update of status, home_score, away_score
  on public.matches
  for each statement
  execute function public.trg_recompute_elo();

-- Cálculo inicial (por si ya hay resultados cargados).
select public.recompute_power_rankings();
