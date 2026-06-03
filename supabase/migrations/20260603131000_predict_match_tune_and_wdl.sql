-- Ajustes al motor de predicción:
--   1) predict_match: localía host-aware. Las sedes del Mundial son neutrales, así
--      que el +0.25 fijo de local sobrestimaba al equipo nominal "home". Ahora solo
--      USA/México/Canadá (anfitriones) reciben un plus de localía; el resto, mínimo.
--   2) predict_match_wdl: probabilidades de Victoria / Empate / Derrota agregando la
--      grilla Poisson (lo que el paper no da y el prode necesita para "resultado probable").

create or replace function public.predict_match(_home_id text, _away_id text)
 returns table(home_score integer, away_score integer, probability numeric)
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
  lambda_home numeric;
  lambda_away numeric;
  i integer; j integer; k integer;
  p numeric; fact_i numeric; fact_j numeric;
begin
  select elo_rating into home_elo from public.power_rankings where team_id = _home_id;
  select elo_rating into away_elo from public.power_rankings where team_id = _away_id;
  if home_elo is null or away_elo is null then return; end if;

  diff := home_elo - away_elo;
  ha := case when _home_id in ('usa','mex','can') then 0.25 else 0.08 end;
  lambda_home := greatest(0.2, base + (diff / 400.0) + ha);
  lambda_away := greatest(0.2, base - (diff / 400.0));

  -- generate_series + factorial (sin temp table, para poder ser STABLE)
  return query
    select gi.i, gj.j,
           round(
             (exp(-lambda_home) * power(lambda_home, gi.i) / factorial(gi.i)) *
             (exp(-lambda_away) * power(lambda_away, gj.j) / factorial(gj.j))
           , 4)
    from generate_series(0, 6) as gi(i),
         generate_series(0, 6) as gj(j)
    order by 3 desc
    limit 5;
end;
$function$;

-- Probabilidades Victoria / Empate / Derrota + lambdas (goles esperados).
create or replace function public.predict_match_wdl(_home_id text, _away_id text)
 returns table(p_home numeric, p_draw numeric, p_away numeric, lambda_home numeric, lambda_away numeric)
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
  lh numeric; la numeric;
  i integer; j integer; k integer;
  pi numeric; pj numeric; fact_i numeric; fact_j numeric;
  ph numeric := 0; pd numeric := 0; pa numeric := 0;
begin
  select elo_rating into home_elo from public.power_rankings where team_id = _home_id;
  select elo_rating into away_elo from public.power_rankings where team_id = _away_id;
  if home_elo is null or away_elo is null then return; end if;

  diff := home_elo - away_elo;
  ha := case when _home_id in ('usa','mex','can') then 0.25 else 0.08 end;
  lh := greatest(0.2, base + (diff / 400.0) + ha);
  la := greatest(0.2, base - (diff / 400.0));

  for i in 0..10 loop
    fact_i := 1; for k in 1..i loop fact_i := fact_i * k; end loop;
    pi := exp(-lh) * power(lh, i) / fact_i;
    for j in 0..10 loop
      fact_j := 1; for k in 1..j loop fact_j := fact_j * k; end loop;
      pj := exp(-la) * power(la, j) / fact_j;
      if    i > j then ph := ph + pi * pj;
      elsif i = j then pd := pd + pi * pj;
      else  pa := pa + pi * pj; end if;
    end loop;
  end loop;

  return query select round(ph,4), round(pd,4), round(pa,4), round(lh,3), round(la,3);
end;
$function$;
