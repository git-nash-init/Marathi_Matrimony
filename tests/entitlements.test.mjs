import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../supabase/migrations/006_premium_entitlements.sql', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/services/subscription.service.ts', import.meta.url), 'utf8');

// feature → minimum plan rank, parsed from feature_min_rank() in the migration
const matrix = Object.fromEntries(
  [...sql.matchAll(/WHEN '(\w+)'\s+THEN (\d)/g)]
    .filter(([, name]) => !['silver', 'diamond', 'platinum'].includes(name))
    .map(([, name, rank]) => [name, Number(rank)])
);

const expected = {
  silver: ['unlock_contact', 'view_who_viewed_me', 'unlimited_interests', 'view_my_unlocks', 'recommendations', 'matchmaking'],
  diamond: ['unlock_documents', 'view_contact_viewers', 'priority_listing', 'advanced_matchmaking', 'unlimited_view_history', 'download_pdf'],
  platinum: ['highlighted_profile', 'unlimited_unlocks', 'early_access', 'priority_support'],
};
const rankOf = { silver: 1, diamond: 2, platinum: 3 };

test('feature matrix assigns every feature to the plan shown on the cards', () => {
  for (const [plan, features] of Object.entries(expected)) {
    for (const f of features) assert.equal(matrix[f], rankOf[plan], `${f} should need ${plan}`);
  }
  const total = Object.values(expected).flat().length;
  assert.equal(Object.keys(matrix).length, total, 'no undocumented features in the matrix');
});

test('higher plans inherit everything from lower plans', () => {
  const has = (plan, f) => rankOf[plan] >= matrix[f];
  for (const f of expected.silver) assert.ok(has('diamond', f) && has('platinum', f));
  for (const f of expected.diamond) assert.ok(!has('silver', f) && has('platinum', f));
  for (const f of expected.platinum) assert.ok(!has('diamond', f));
});

test('daily unlock caps are Silver 10, Diamond 25, Platinum unlimited; free interests are 5/month', () => {
  const cap = sql.match(/unlock_daily_limit[\s\S]*?CASE public\.my_plan\(\)([\s\S]*?)END;/)[1];
  assert.match(cap, /'silver' THEN 10/);
  assert.match(cap, /'diamond' THEN 25/);
  assert.match(cap, /'platinum' THEN NULL/);
  assert.match(sql, /ELSE 5 END/, 'free interest limit of 5 reported by get_my_entitlements');
});

test('plan text in the database matches the offline fallback in the app', () => {
  const dbFeatures = (slug) => {
    const block = sql.match(new RegExp(`features = '(\\[[^']*\\])'::jsonb\\s*WHERE slug = '${slug}'`))[1];
    return JSON.parse(block);
  };
  const fallbackBlock = service.slice(service.indexOf('function getMockPlans'));
  for (const slug of ['silver', 'diamond', 'platinum']) {
    const start = fallbackBlock.indexOf(`slug: '${slug}'`);
    const feats = [...fallbackBlock.slice(start).match(/features: \[([\s\S]*?)\]/)[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
    assert.deepEqual(feats, dbFeatures(slug), `${slug} features differ between DB and getMockPlans`);
  }
});

test('plan prices and durations match the product spec', () => {
  assert.match(sql, /price = 1000, duration_days = 90/);
  assert.match(sql, /price = 2500, duration_days = 365/);
  assert.match(sql, /price = 3000, duration_days = 548/);
});

test('premium tables are only reachable through RPCs (no client write grants)', () => {
  const all = ['006_premium_entitlements', '007_interests_rpc', '008_premium_features']
    .map((n) => readFileSync(new URL(`../supabase/migrations/${n}.sql`, import.meta.url), 'utf8')).join('\n');
  for (const table of ['payments', 'subscriptions', 'interests', 'profile_views', 'contact_unlocks']) {
    assert.match(all, new RegExp(`REVOKE INSERT, UPDATE, DELETE ON public\\.${table} FROM anon, authenticated`));
  }
});
