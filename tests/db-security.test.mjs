import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sql = readFileSync(new URL('../supabase/migrations/011_security_hardening.sql', import.meta.url), 'utf8');
const columnsTs = readFileSync(new URL('../src/lib/profileColumns.ts', import.meta.url), 'utf8');

const srcFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return srcFiles(p);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('database.types.ts') ? [p] : [];
  });
const src = srcFiles(fileURLToPath(new URL('../src', import.meta.url)));

test('admin RPCs take the acting admin from auth.uid(), never from a parameter', () => {
  const adminFns = [...sql.matchAll(/CREATE OR REPLACE FUNCTION public\.(admin_\w+)\(([^)]*)\)/g)];
  assert.ok(adminFns.length >= 6, 'admin functions are defined in 011');
  for (const [, name, args] of adminFns) {
    assert.doesNotMatch(args, /p_admin_user_id|p_user_id/, `${name} must not accept a caller id`);
  }
  for (const old of ['admin_approve_profile(uuid, uuid, text)', 'admin_toggle_user_suspension(uuid, uuid, boolean, text)',
    'get_or_create_conversation(uuid, uuid)']) {
    assert.ok(sql.includes(`DROP FUNCTION IF EXISTS public.${old}`), `old signature ${old} is dropped`);
  }
});

test('admin and private RPCs are not executable by anon', () => {
  const revoke = sql.match(/REVOKE EXECUTE ON FUNCTION([\s\S]*?)FROM PUBLIC, anon;/)[1];
  for (const fn of ['admin_approve_profile', 'admin_list_profiles', 'get_or_create_conversation', 'get_my_private_profile']) {
    assert.ok(revoke.includes(`public.${fn}(`), `${fn} revoked from anon`);
  }
});

test('client column list matches the profiles SELECT grant and excludes surname/Aadhaar', () => {
  const base = sql.match(/GRANT SELECT \(([\s\S]*?)\) ON public\.profiles/)[1].split(',').map((s) => s.trim());
  // Phase 6 grants its new columns separately, and leaves native_place out on purpose.
  const phase6 = readFileSync(new URL('../supabase/migrations/018_phase6_community.sql', import.meta.url), 'utf8')
    .match(/GRANT SELECT \(([\s\S]*?)\)\s+ON public\.profiles/)[1].split(',').map((c) => c.trim());
  const granted = [...base, ...phase6];
  const client = [...columnsTs.slice(columnsTs.indexOf('PROFILE_COLUMNS')).match(/\[([\s\S]*?)\]/)[1].matchAll(/'(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(client, granted);
  assert.ok(!granted.includes('last_name') && !granted.includes('aadhaar_number') && !granted.includes('native_place'));
});

test("no client code selects '*' from profiles (it fails under the column grant)", () => {
  for (const file of src) {
    const code = readFileSync(file, 'utf8');
    const re = /from\('profiles'\)[\s\S]{0,80}?\.select\((['"`])\*/g;
    assert.equal(re.test(code), false, `${file} selects * from profiles`);
  }
});

test('profile status is server-owned: members cannot self-approve or self-verify', () => {
  const latest = readFileSync(new URL('../supabase/migrations/013_phase1_foundation.sql', import.meta.url), 'utf8');
  const guard = latest.match(/FUNCTION public\.guard_profile_system_columns\(\)[\s\S]*?\$\$;/)[0];
  assert.doesNotMatch(guard, /auto_approval/);
  assert.match(guard, /NEW\.aadhaar_number := NULL/);
  assert.match(guard, /NEW\.profile_status := 'pending_approval'/);
  assert.match(guard, /NEW\.verification_status := 'pending'/);
  assert.match(guard, /OLD\.profile_status = 'suspended' THEN\s+NEW\.profile_status := 'suspended'/);
});

test('match scoring weights still add up to 100 with diet and income', () => {
  const score = sql.match(/FUNCTION public\.pref_score[\s\S]*?\$\$;/)[0];
  const weights = [...score.matchAll(/THEN (\d+) ELSE 0 END/g)].map((m) => Number(m[1]));
  // location's top tier (15) is the CASE's first branch, not "THEN n ELSE 0"
  assert.equal(weights.reduce((a, b) => a + b, 0) + 15, 100);
  assert.match(score, /preferred_diet/);
  assert.match(score, /income_lakhs\(pp\.min_income\)/);
});

test('web push secrets stay server-side (Vault + service_role only)', () => {
  const push = readFileSync(new URL('../supabase/migrations/012_web_push.sql', import.meta.url), 'utf8');
  const fn = readFileSync(new URL('../supabase/functions/send-push/index.ts', import.meta.url), 'utf8');
  assert.match(push, /REVOKE EXECUTE ON FUNCTION[\s\S]*public\.push_service_config\(\)[\s\S]*FROM PUBLIC, anon, authenticated;/);
  assert.match(push, /GRANT EXECUTE ON FUNCTION public\.push_service_config\(\), public\.store_push_vapid_keys\(text, text\) TO service_role;/);
  assert.match(push, /REVOKE INSERT, UPDATE, DELETE ON public\.push_subscriptions FROM anon, authenticated;/);
  assert.match(fn, /sameSecret\(req\.headers\.get\('x-push-secret'\)/, 'send action requires the shared secret');
  assert.match(fn, /timingSafeEqual/, 'secret comparison is constant-time');
  assert.match(fn, /action === 'init'\) \{\s+if \(!\(await isSignedIn\(req\)\)\)/, 'init requires a signed-in member');
  assert.match(fn, /isPushEndpoint\(s\.endpoint\)/, 'only real push services are called');
  assert.doesNotMatch(fn, /'Access-Control-Allow-Origin': '\*'/, 'CORS is not open to every site');
  assert.doesNotMatch(fn, /private_key[^\n]*json\(/, 'private key is never returned');
});

test('production build settings keep secrets and source out of the bundle', () => {
  const vite = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
  assert.match(vite, /envPrefix: \['VITE_'\]/);
  assert.match(vite, /sourcemap: false/);
  assert.doesNotMatch(vite, /host: true/);
});

test('live host sends the security headers', () => {
  const htaccess = readFileSync(new URL('../public/.htaccess', import.meta.url), 'utf8');
  for (const h of ['Strict-Transport-Security', 'Content-Security-Policy', 'Permissions-Policy', 'X-Content-Type-Options']) {
    assert.ok(htaccess.includes(h), h);
  }
  assert.doesNotMatch(htaccess, /Access-Control-Allow-Origin/);
  assert.match(htaccess, /^\s*RewriteRule \^\(\.\*\)\$ https:/m, 'HTTPS redirect is on');
});

test('no client code sends or shows a full Aadhaar number, or hardcodes who is an admin', () => {
  for (const file of src) {
    const code = readFileSync(file, 'utf8');
    if (file.includes('database.types')) continue;
    assert.doesNotMatch(code, /aadhaar_number/, file);
    assert.doesNotMatch(code, /user_metadata\??\.role/, file);
    assert.doesNotMatch(code, /@gmail\.com'/, file);
  }
});
