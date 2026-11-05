// admin-users: admin actions that need the Supabase Auth admin API (block, unblock, remove, password
// reset). The caller's own token runs the admin_* database function first, so the database decides
// whether this admin may do this, including roles and 2-step verification. The service role is used
// only after that check passes, and never leaves this function.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const URL_ = Deno.env.get('SUPABASE_URL')!;
const service = createClient(URL_, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const ALLOWED_ORIGINS = (
  Deno.env.get('ALLOWED_ORIGINS') ??
  'https://sanaibandh.com,https://www.sanaibandh.com,http://localhost:5199,http://localhost:3000'
).split(',').map((o) => o.trim());

const BAN_FOREVER = '876000h';
const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const corsFor = (req: Request): Record<string, string> => {
  const origin = req.headers.get('origin') ?? '';
  return {
    ...(ALLOWED_ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
};

// Removes every file under a folder. A member's files are not kept after their account is removed.
async function clearFolder(bucket: string, folder: string): Promise<void> {
  const { data, error } = await service.storage.from(bucket).list(folder, { limit: 1000 });
  if (error) throw error;
  const paths = (data ?? []).filter((f) => f.id).map((f) => `${folder}/${f.name}`);
  if (paths.length) {
    const { error: removeError } = await service.storage.from(bucket).remove(paths);
    if (removeError) throw removeError;
  }
}

Deno.serve(async (req) => {
  const cors = corsFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader) return json({ error: 'Please sign in.' }, 401);
  const caller = createClient(URL_, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  try {
    const { action, user_id: userId, reason, confirm } = await req.json().catch(() => ({} as Record<string, string>));
    if (!UUID_FORMAT.test(String(userId ?? ''))) return json({ error: 'Unknown member.' }, 400);

    const refuse = (error: { code?: string; message?: string }) =>
      json({ error: error.message ?? 'Request refused.' }, error.code === '42501' ? 403 : 400);

    if (action === 'block') {
      const { data, error } = await caller.rpc('admin_block_user', { p_user: userId, p_reason: reason });
      if (error) return refuse(error);
      const { error: banError } = await service.auth.admin.updateUserById(userId, { ban_duration: BAN_FOREVER });
      // The database block already stops all access; the ban only stops new sign-ins.
      return json({ ...data, sign_in_blocked: !banError });
    }

    if (action === 'unblock') {
      const { data, error } = await caller.rpc('admin_unblock_user', { p_user: userId });
      if (error) return refuse(error);
      const { error: banError } = await service.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      if (banError) return json({ error: 'The block was lifted, but sign-in could not be restored. Try again.' }, 500);
      return json(data);
    }

    if (action === 'reset_password') {
      const { data: email, error } = await caller.rpc('admin_prepare_password_reset', { p_user: userId });
      if (error) return refuse(error);
      const origin = req.headers.get('origin') ?? '';
      const site = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
      const { error: sendError } = await caller.auth.resetPasswordForEmail(email as string, {
        redirectTo: `${site}/reset-password`,
      });
      if (sendError) return json({ error: 'The reset email could not be sent. Try again.' }, 502);
      return json({ success: true });
    }

    if (action === 'remove') {
      const { data, error } = await caller.rpc('admin_prepare_user_removal', { p_user: userId, p_confirm: confirm });
      if (error) return refuse(error);
      const prepared = data as { profile_id: string | null };

      await clearFolder('profile-photos', userId);
      await clearFolder('verification-documents', userId);
      if (prepared.profile_id) await clearFolder('profile-documents', prepared.profile_id);

      const { error: removeError } = await service.auth.admin.deleteUser(userId);
      if (removeError) return json({ error: 'The account could not be removed. Try again.' }, 500);

      const { data: me } = await caller.auth.getUser();
      await service.from('audit_logs').insert({
        actor_id: me.user?.id ?? null,
        actor_role: 'super_admin',
        action: 'account_removed',
        target_entity: 'auth.users',
        target_id: userId,
        details: {},
      });
      return json({ success: true });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (err) {
    console.error('admin-users error', (err as Error)?.message);
    return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
  }
});
