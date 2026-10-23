/**
 * Supabase Schema & Constraints Validator
 */
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
const seedPath = path.join(__dirname, 'migrations', '002_seed_data.sql');

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const seedSql = fs.readFileSync(seedPath, 'utf8');

const requiredTables = [
  'profiles',
  'profile_photos',
  'partner_preferences',
  'education_options',
  'occupation_options',
  'location_options',
  'community_options',
  'interests',
  'shortlists',
  'profile_views',
  'blocked_profiles',
  'profile_reports',
  'subscription_plans',
  'subscriptions',
  'payments',
  'notifications',
  'success_stories'
];

console.log('--- STARTING SCHEMA VALIDATION ---');

// 1. Check Tables
let missingTables = [];
for (const table of requiredTables) {
  const pattern = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}\\b`, 'i');
  if (!pattern.test(schemaSql)) {
    missingTables.push(table);
  }
}
console.log(`1. Tables verification (${requiredTables.length} total):`, missingTables.length === 0 ? 'PASS' : `FAIL (Missing: ${missingTables.join(', ')})`);

// 2. Check Constraints
const constraints = [
  { name: 'Self-interest rejection constraint', pattern: /sender_profile_id\s*<>\s*receiver_profile_id/i },
  { name: 'Duplicate interest rejection unique constraint', pattern: /UNIQUE\s*\(\s*sender_profile_id\s*,\s*receiver_profile_id\s*\)/i },
  { name: 'Self-shortlist rejection constraint', pattern: /profile_id\s*<>\s*shortlisted_profile_id/i },
  { name: 'Duplicate shortlist rejection unique constraint', pattern: /UNIQUE\s*\(\s*profile_id\s*,\s*shortlisted_profile_id\s*\)/i },
  { name: 'Self-view rejection constraint', pattern: /viewer_profile_id\s*<>\s*viewed_profile_id/i },
  { name: 'Self-block rejection constraint', pattern: /profile_id\s*<>\s*blocked_profile_id/i },
  { name: 'Duplicate block rejection unique constraint', pattern: /UNIQUE\s*\(\s*profile_id\s*,\s*blocked_profile_id\s*\)/i },
  { name: 'Self-report rejection constraint', pattern: /reporter_profile_id\s*<>\s*reported_profile_id/i },
  { name: 'Age check constraint', pattern: /min_age\s*>=\s*18/i },
  { name: 'Height check constraint', pattern: /height_cm\s*>\s*0/i },
  { name: 'Income check constraint', pattern: /annual_income\s*>=\s*0/i },
  { name: 'Subscription price non-negative constraint', pattern: /price\s*>=\s*0/i }
];

let constraintsPassed = true;
for (const c of constraints) {
  if (!c.pattern.test(schemaSql)) {
    console.error(`Missing constraint: ${c.name}`);
    constraintsPassed = false;
  }
}
console.log('2. Constraints verification:', constraintsPassed ? 'PASS' : 'FAIL');

// 3. Check RLS
let rlsPassed = true;
for (const table of requiredTables) {
  const rlsPattern = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
  if (!rlsPattern.test(schemaSql)) {
    console.error(`RLS not enabled for: ${table}`);
    rlsPassed = false;
  }
}
console.log('3. RLS on all 17 tables verification:', rlsPassed ? 'PASS' : 'FAIL');

// 4. Check Seed Plans
const seedPlans = ['Free', 'Silver', 'Gold', 'Premium'];
let seedPassed = true;
for (const plan of seedPlans) {
  if (!seedSql.includes(plan)) {
    console.error(`Missing seed plan: ${plan}`);
    seedPassed = false;
  }
}
console.log('4. Subscription plans seed verification (Free, Silver, Gold, Premium):', seedPassed ? 'PASS' : 'FAIL');

console.log('--- VALIDATION COMPLETE ---');
