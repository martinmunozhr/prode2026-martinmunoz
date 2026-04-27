-- Trigger: cuando se actualiza un partido, recalcula puntos + ELO
DROP TRIGGER IF EXISTS trg_handle_match_result ON public.matches;
CREATE TRIGGER trg_handle_match_result
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.handle_match_result();

-- Trigger: cuando se cargan/borran eventos (goles), recalcular puntos de goleadores
DROP TRIGGER IF EXISTS trg_match_events_recalc ON public.match_events;
CREATE TRIGGER trg_match_events_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.match_events
FOR EACH ROW
EXECUTE FUNCTION public.trg_match_events_recalc();

-- Trigger: validar goleadores antes de guardar
DROP TRIGGER IF EXISTS trg_validate_gsp ON public.goalscorer_predictions;
CREATE TRIGGER trg_validate_gsp
BEFORE INSERT OR UPDATE ON public.goalscorer_predictions
FOR EACH ROW
EXECUTE FUNCTION public.validate_goalscorer_pred();

-- Trigger: cuando se actualizan premios, recalcular crystal ball
DROP TRIGGER IF EXISTS trg_handle_awards_update ON public.tournament_awards;
CREATE TRIGGER trg_handle_awards_update
AFTER UPDATE ON public.tournament_awards
FOR EACH ROW
EXECUTE FUNCTION public.handle_awards_update();

-- Trigger: nuevo usuario => profile + rol
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Trigger: updated_at automático en tablas que lo usan
DROP TRIGGER IF EXISTS trg_set_updated_at_matches ON public.matches;
CREATE TRIGGER trg_set_updated_at_matches BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_set_updated_at_predictions ON public.predictions;
CREATE TRIGGER trg_set_updated_at_predictions BEFORE UPDATE ON public.predictions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_set_updated_at_profiles ON public.profiles;
CREATE TRIGGER trg_set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_set_updated_at_crystal_ball ON public.crystal_ball;
CREATE TRIGGER trg_set_updated_at_crystal_ball BEFORE UPDATE ON public.crystal_ball FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();