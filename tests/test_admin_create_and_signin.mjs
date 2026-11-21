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

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const testEmail = `test_creator_${Date.now()}@creatorflow.ai`;
  const testPassword = 'TestPassword123!';

  console.log('1. Creating pre-confirmed user via admin...');
  const { data: newUser, error: cErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'CreatorFlow Admin Tester' }
  });

  if (cErr) {
    console.error('admin.createUser error:', cErr.message);
    return;
  }
  console.log('User created:', newUser.user.id);

  console.log('2. Signing in with password via anonClient (like browser login)...');
  const { data: loginData, error: lErr } = await anonClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (lErr) {
    console.error('signInWithPassword error:', lErr.message);
  } else {
    console.log('SUCCESS! Session token acquired:', Boolean(loginData.session.access_token));
    console.log('User profile created by trigger?');
    const { data: prof } = await adminClient.from('profiles').select('*').eq('id', newUser.user.id).single();
    console.log('Profile row:', prof);
  }

  // Cleanup
  await adminClient.auth.admin.deleteUser(newUser.user.id);
  console.log('Cleaned up test user.');
}

run().catch(console.error);
