import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
const envContent = fs.readFileSync('.env.local', 'utf-8');
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

// Test with Anon key (like the frontend browser does)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const testEmail = `creator_test_${Date.now()}@creatorflow.ai`;
  const testPassword = 'Password123!';
  console.log('Testing browser-style signup with email:', testEmail);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { full_name: 'Creator Test User' }
    }
  });

  if (error) {
    console.error('SignUp error:', error.message);
  } else {
    console.log('SignUp result: user id =', data.user?.id);
    console.log('Session created directly?', Boolean(data.session));
    console.log('User identities:', data.user?.identities?.length);
  }

  // Cleanup with admin client
  if (data?.user?.id) {
    const adminSupabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    await adminSupabase.auth.admin.deleteUser(data.user.id);
    console.log('Cleaned up test user successfully.');
  }
}

run().catch(console.error);
