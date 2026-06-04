-- Auditoría funcional: arreglo de triggers duplicados y limpieza de handle_match_result.
--
-- El proyecto tenía triggers DUPLICADOS en varias tablas (cada función enganchada
-- dos veces con nombres distintos, probablemente por migraciones repetidas).
-- La mayoría llamaba funciones idempotentes (set_updated_at, recalc, awards) → solo
-- trabajo redundante. La excepción peligrosa: handle_match_result actualizaba el Elo
-- de power_rankings de forma NO idempotente (matches_played+1, elo+=…, goals_for+=…)
-- y corría dos veces por update → doble conteo (enmascarado por recompute_power_rankings).
--
-- Solución: dropear los triggers duplicados (se conserva uno de cada par) y sacar el
-- bloque de Elo de handle_match_result, dejando que recompute_power_rankings (trigger
-- matches_elo_recompute, statement-level) sea la única fuente del ranking.

drop trigger if exists trg_handle_match_result on public.matches;
drop trigger if exists matches_updated_at on public.matches;
drop trigger if exists update_crystal_ball_updated_at on public.crystal_ball;
drop trigger if exists trg_events_after_change on public.match_events;
drop trigger if exists predictions_updated_at on public.predictions;
drop trigger if exists trg_awards_update on public.tournament_awards;

create or replace function public.handle_match_result()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if new.status <> 'finished' or new.home_score is null or new.away_score is null then
    return new;
  end if;

  update public.predictions p
  set points_earned = public.calc_prediction_points(p.home_score, p.away_score, new.home_score, new.away_score, new.stage),
      updated_at = now()
  where p.match_id = new.id;

  perform public.recalc_goalscorer_points(new.id);

  return new;
end;
$function$;
