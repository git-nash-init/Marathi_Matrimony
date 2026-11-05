-- Rolls back Phase 10 (migration 022). Run by hand in the SQL Editor.
SELECT cron.unschedule('notify-expiring-subscriptions');
DROP FUNCTION IF EXISTS public.notify_expiring_subscriptions();
DROP FUNCTION IF EXISTS public.admin_list_broadcasts(int, int);
DROP FUNCTION IF EXISTS public.admin_send_broadcast(text, text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.admin_count_recipients(text, jsonb);
DROP FUNCTION IF EXISTS public.broadcast_recipients(text, jsonb);
DROP FUNCTION IF EXISTS public.set_my_notification_preferences(boolean);
DROP FUNCTION IF EXISTS public.get_my_notification_preferences();
-- Kept: member opt-outs and the record of what was sent.
