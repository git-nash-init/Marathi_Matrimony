const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kurdyzoumgjrfwwucxyg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lyQl6L0FrATPiqgifEIDsA_2iMcykUV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getTestSession() {
  const email = 'user_qa_test_marathi@test.com';
  const password = 'Password@1234';

  console.log(`Attempting login for ${email}...`);
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.log(`Login failed (${error.message}). Attempting sign up...`);
    const signupRes = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Rahul',
          last_name: 'Kadam',
        },
      },
    });

    if (signupRes.error) {
      console.error('Sign up error:', signupRes.error);
    } else {
      console.log('Sign up successful:', signupRes.data.user?.id);
      data = signupRes.data;
    }
  } else {
    console.log('Login successful! User ID:', data.user?.id);
  }

  return data?.session;
}

getTestSession().then(session => {
  if (session) {
    console.log('Obtained valid Supabase session!');
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, 'session.json'), JSON.stringify(session, null, 2));
  } else {
    console.log('No session obtained');
  }
}).catch(console.error);
