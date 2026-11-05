-- Rolls back Phase 9 (migration 021). Run by hand in the SQL Editor.
DROP FUNCTION IF EXISTS public.reply_my_ticket(uuid, text);
DROP FUNCTION IF EXISTS public.get_my_tickets();
DROP FUNCTION IF EXISTS public.admin_update_ticket(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.admin_reply_ticket(uuid, text);
DROP FUNCTION IF EXISTS public.admin_get_ticket(uuid);
DROP FUNCTION IF EXISTS public.admin_list_tickets(text, text, text, int, int);
ALTER POLICY contact_inquiries_admin_select ON public.contact_inquiries USING (public.is_admin());
ALTER POLICY contact_inquiries_admin_update ON public.contact_inquiries USING (public.is_admin()) WITH CHECK (public.is_admin());
-- Kept: ticket_messages and the new columns hold conversations with members.
