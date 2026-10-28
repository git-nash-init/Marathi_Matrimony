-- 010_expire_subscriptions_cron.sql
-- Hourly: mark lapsed subscriptions expired and reset listing_priority.
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expire-subscriptions';
SELECT cron.schedule('expire-subscriptions', '0 * * * *', 'select public.expire_subscriptions()');
