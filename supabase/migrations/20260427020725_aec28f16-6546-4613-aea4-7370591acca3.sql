
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Generate a stable random cron_secret if missing (NOT public)
INSERT INTO public.app_settings (key, value, is_public, updated_at)
SELECT 'cron_secret', to_jsonb(encode(gen_random_bytes(32), 'hex')), false, now()
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'cron_secret');

-- Unschedule existing job if present (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('prode-sync-results-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Schedule daily sync at 10:00 UTC (07:00 ART)
SELECT cron.schedule(
  'prode-sync-results-daily',
  '0 10 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://project--e2158aea-e2c1-4c86-ba3f-5af952e45d56.lovable.app/api/public/cron/sync-results',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT trim(both '"' from value::text) FROM public.app_settings WHERE key = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $cron$
);
