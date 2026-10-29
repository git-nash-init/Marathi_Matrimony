// send-push: delivers a notification row as a Web Push message to every subscribed device of
// its user. Called by the trg_notifications_push trigger (migration 012) with the Vault-held
// shared secret. `{ "action": "init" }` (no secret needed) creates the VAPID key pair on first
// use and returns the public key; it never reveals anything private.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

interface PushConfig {
  public_key: string | null;
  private_key: string | null;
  webhook_secret: string | null;
}

interface NotificationRow {
  id: string;
  user_id: string;
  type?: string;
  title: string;
  message: string;
  action_url?: string | null;
}

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function loadConfig(): Promise<PushConfig> {
  const { data, error } = await admin.rpc('push_service_config');
  if (error) throw error;
  const cfg = data as PushConfig;
  if (cfg.public_key && cfg.private_key) return cfg;

  // First run: generate the VAPID pair here so the private key never leaves the server.
  const keys = webpush.generateVAPIDKeys();
  const { error: storeError } = await admin.rpc('store_push_vapid_keys', {
    p_public: keys.publicKey,
    p_private: keys.privateKey,
  });
  if (storeError) throw storeError;
  const { data: stored, error: reloadError } = await admin.rpc('push_service_config');
  if (reloadError) throw reloadError;
  return stored as PushConfig;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const cfg = await loadConfig();

    if (body.action === 'init') return json({ public_key: cfg.public_key });

    if (!cfg.webhook_secret || req.headers.get('x-push-secret') !== cfg.webhook_secret) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const n = body.notification as NotificationRow | undefined;
    if (!n?.user_id || !n.title) return json({ error: 'Bad request' }, 400);

    webpush.setVapidDetails('mailto:contact@sanaibandh.com', cfg.public_key!, cfg.private_key!);

    const { data: subs, error } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', n.user_id);
    if (error) throw error;

    const payload = JSON.stringify({
      title: n.title,
      body: n.message,
      url: n.action_url || '/dashboard',
      tag: n.id,
    });

    let sent = 0;
    const expired: string[] = [];
    await Promise.all(
      (subs ?? []).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { TTL: 60 * 60 * 24 },
          );
          sent++;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          // 404/410: the browser dropped this subscription — forget it.
          if (status === 404 || status === 410) expired.push(s.id);
          else console.error('push failed', status, (err as { body?: string }).body);
        }
      }),
    );

    if (expired.length) await admin.from('push_subscriptions').delete().in('id', expired);
    if (sent) {
      await admin.from('push_subscriptions').update({ last_used_at: new Date().toISOString() }).eq('user_id', n.user_id);
    }

    return json({ sent, removed: expired.length });
  } catch (err) {
    console.error('send-push error', err);
    return json({ error: 'Internal error' }, 500);
  }
});
