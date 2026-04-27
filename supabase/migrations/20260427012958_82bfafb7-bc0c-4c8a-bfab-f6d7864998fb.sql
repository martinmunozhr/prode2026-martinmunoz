
-- Fix search_path warnings
ALTER FUNCTION public.stage_multiplier(match_stage) SET search_path = public;
ALTER FUNCTION public.calc_prediction_points(integer, integer, integer, integer, match_stage) SET search_path = public;
ALTER FUNCTION public.predict_match(text, text) SET search_path = public;

-- Enable realtime
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.predictions REPLICA IDENTITY FULL;
ALTER TABLE public.match_events REPLICA IDENTITY FULL;
ALTER TABLE public.power_rankings REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.power_rankings;
