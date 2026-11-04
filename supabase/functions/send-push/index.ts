// send-push: delivers a notification row as a Web Push message to every subscribed device of
// its user. Called by the trg_notifications_push trigger (migration 012) with the Vault-held
// shared secret. `{ "action": "init" }` needs a signed-in member: it creates the VAPID key pair
// on first use and returns the public key; it never reveals anything private.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { createHash, timingSafeEqual } from 'node:crypto';

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

const ALLOWED_ORIGINS = (
  Deno.env.get('ALLOWED_ORIGINS') ??
  'https://sanaibandh.com,https://www.sanaibandh.com,http://localhost:5199,http://localhost:3000'
).split(',').map((o) => o.trim());

// Only real browser push services, so a stored endpoint can't make this function call anything else.
const PUSH_HOST =
  /^(fcm\.googleapis\.com|android\.googleapis\.com|([a-z0-9-]+\.)*push\.services\.mozilla\.com|([a-z0-9-]+\.)*notify\.windows\.com|([a-z0-9-]+\.)*push\.apple\.com)$/;

const isPushEndpoint = (endpoint: string): boolean => {
  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:' && PUSH_HOST.test(url.hostname);
  } catch {
    return false;
  }
};

const sha256 = (value: string) => createHash('sha256').update(value).digest();
const sameSecret = (a: string, b: string) => timingSafeEqual(sha256(a), sha256(b));

const corsFor = (req: Request): Record<string, string> => {
  const origin = req.headers.get('origin') ?? '';
  return {
    ...(ALLOWED_ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
};

async function readConfig(): Promise<PushConfig> {
  const { data, error } = await admin.rpc('push_service_config');
  if (error) throw error;
  return data as PushConfig;
}

async function ensureKeys(): Promise<PushConfig> {
  const cfg = await readConfig();
  if (cfg.public_key && cfg.private_key) return cfg;

  // First run: generate the VAPID pair here so the private key never leaves the server.
  const keys = webpush.generateVAPIDKeys();
  const { error: storeError } = await admin.rpc('store_push_vapid_keys', {
    p_public: keys.publicKey,
    p_private: keys.privateKey,
  });
  if (storeError) throw storeError;
  return readConfig();
}

async function isSignedIn(req: Request): Promise<boolean> {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const { data, error } = await admin.auth.getUser(token);
  return !error && Boolean(data.user);
}

Deno.serve(async (req) => {
  const cors = corsFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));

    if (body.action === 'init') {
      if (!(await isSignedIn(req))) return json({ error: 'Unauthorized' }, 401);
      const cfg = await ensureKeys();
      return json({ public_key: cfg.public_key });
    }

    const stored = await readConfig();
    if (!stored.webhook_secret || !sameSecret(req.headers.get('x-push-secret') ?? '', stored.webhook_secret)) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const n = body.notification as NotificationRow | undefined;
    if (!n?.user_id || !n.title) return json({ error: 'Bad request' }, 400);

    const cfg = await ensureKeys();
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
        if (!isPushEndpoint(s.endpoint)) {
          expired.push(s.id);
          return;
        }
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
          else console.error('push failed with status', status);
        }
      }),
    );

    if (expired.length) await admin.from('push_subscriptions').delete().in('id', expired);
    if (sent) {
      await admin.from('push_subscriptions').update({ last_used_at: new Date().toISOString() }).eq('user_id', n.user_id);
    }

    return json({ sent, removed: expired.length });
  } catch (err) {
    console.error('send-push error', (err as Error)?.message);
    return json({ error: 'Internal error' }, 500);
  }
});
