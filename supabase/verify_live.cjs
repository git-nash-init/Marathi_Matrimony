const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
      if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value;
    }
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function verifyLiveDatabase() {
  console.log('=== STARTING LIVE SUPABASE DATABASE VERIFICATION ===\n');

  let tablesStatus = {};
  let allTablesExist = true;

  // 1. Query each table
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        // If error is code 42P01 or PGRST205 (table missing)
        tablesStatus[table] = { status: 'FAIL', error: error.message, code: error.code };
        allTablesExist = false;
      } else {
        tablesStatus[table] = { status: 'PASS', sampleCount: data ? data.length : 0 };
      }
    } catch (e) {
      tablesStatus[table] = { status: 'FAIL', error: e.message };
      allTablesExist = false;
    }
  }

  console.log('1. TABLE VERIFICATION RESULTS:');
  for (const [tbl, res] of Object.entries(tablesStatus)) {
    console.log(`  - ${tbl}: ${res.status} ${res.error ? `(${res.error})` : ''}`);
  }

  // 2. Verify subscription_plans seed data
  console.log('\n2. SUBSCRIPTION PLANS VERIFICATION:');
  let plansPass = false;
  try {
    const { data: plans, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (planError) {
      console.log('  Subscription plans query error:', planError.message);
    } else if (plans && plans.length >= 4) {
      console.log(`  Found ${plans.length} subscription plans:`);
      const free = plans.find(p => p.name_en.toLowerCase() === 'free');
      const silver = plans.find(p => p.name_en.toLowerCase() === 'silver');
      const gold = plans.find(p => p.name_en.toLowerCase() === 'gold');
      const premium = plans.find(p => p.name_en.toLowerCase() === 'premium');

      const freeOk = free && Number(free.price) === 0 && free.duration_days === 0;
      const silverOk = silver && Number(silver.price) === 499 && silver.duration_days === 90;
      const goldOk = gold && Number(gold.price) === 999 && gold.duration_days === 180;
      const premiumOk = premium && Number(premium.price) === 1499 && premium.duration_days === 365;

      console.log(`  - Free plan (₹0):`, freeOk ? 'PASS' : `FAIL (${JSON.stringify(free)})`);
      console.log(`  - Silver plan (₹499 / 90d):`, silverOk ? 'PASS' : `FAIL (${JSON.stringify(silver)})`);
      console.log(`  - Gold plan (₹999 / 180d):`, goldOk ? 'PASS' : `FAIL (${JSON.stringify(gold)})`);
      console.log(`  - Premium plan (₹1499 / 365d):`, premiumOk ? 'PASS' : `FAIL (${JSON.stringify(premium)})`);

      if (freeOk && silverOk && goldOk && premiumOk) {
        plansPass = true;
      }
    } else {
      console.log(`  Insufficient plans found: ${plans ? plans.length : 0}`);
    }
  } catch (e) {
    console.log('  Subscription verification error:', e.message);
  }

  // 3. Verify Community & Education & Location lookup tables
  console.log('\n3. MASTER LOOKUP TABLES SEED DATA:');
  const { data: communities } = await supabase.from('community_options').select('name_en').limit(5);
  const { data: educations } = await supabase.from('education_options').select('name_en').limit(5);
  const { data: locations } = await supabase.from('location_options').select('city').limit(5);
  console.log(`  - Community options seeded:`, communities && communities.length > 0 ? `PASS (${communities.length}+ items)` : 'FAIL');
  console.log(`  - Education options seeded:`, educations && educations.length > 0 ? `PASS (${educations.length}+ items)` : 'FAIL');
  console.log(`  - Location options seeded:`, locations && locations.length > 0 ? `PASS (${locations.length}+ items)` : 'FAIL');

  // 4. Verify RLS behavior on sensitive tables
  console.log('\n4. RLS PRIVACY VERIFICATION:');
  const { data: testProfiles, error: profileRlsError } = await supabase.from('profiles').select('*');
  console.log('  - Anonymous query to profiles returns empty / controlled data without leak:', (testProfiles && testProfiles.length === 0) || profileRlsError ? 'PASS' : 'REVIEW');

  console.log('\n=== LIVE VERIFICATION SUMMARY ===');
  console.log('ALL TABLES EXIST:', allTablesExist ? 'YES' : 'NO');
  console.log('SUBSCRIPTION PLANS VALIDATED:', plansPass ? 'YES' : 'NO');
}

verifyLiveDatabase();
