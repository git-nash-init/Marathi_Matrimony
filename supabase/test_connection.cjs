const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env directly
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
  console.log('STATUS: CREDENTIALS_MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');

  try {
    // Attempt to query subscription_plans
    const { data, error } = await supabase.from('subscription_plans').select('*');
    
    if (error) {
      console.log('QUERY_RESULT: ERROR');
      console.log('ERROR_CODE:', error.code);
      console.log('ERROR_MESSAGE:', error.message);
      console.log('ERROR_DETAILS:', error.details);
      console.log('ERROR_HINT:', error.hint);
    } else {
      console.log('QUERY_RESULT: SUCCESS');
      console.log('PLANS_COUNT:', data ? data.length : 0);
      console.log('PLANS_DATA:', JSON.stringify(data));
    }

    // Also check profiles table
    const profilesRes = await supabase.from('profiles').select('id').limit(1);
    console.log('PROFILES_QUERY:', profilesRes.error ? `ERROR (${profilesRes.error.message})` : 'SUCCESS');

  } catch (err) {
    console.log('CONNECTION_EXCEPTION:', err.message);
  }
}

testConnection();
