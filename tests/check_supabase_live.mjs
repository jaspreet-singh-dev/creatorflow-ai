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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Connecting to Supabase...');
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('listUsers error:', error.message);
  } else {
    console.log(`Supabase Auth Users count: ${data.users.length}`);
    for (const u of data.users) {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Confirmed: ${Boolean(u.email_confirmed_at)}`);
    }
  }

  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan_tier');
  if (pErr) console.error('profiles error:', pErr.message);
  else {
    console.log(`Profiles count: ${profiles.length}`);
    for (const p of profiles) {
      console.log(`- Profile: ${p.id} | ${p.email} | ${p.full_name}`);
    }
  }

  const { data: channels, error: cErr } = await supabase
    .from('connected_channels')
    .select('id, user_id, title, youtube_channel_id, access_token, refresh_token');
  if (cErr) {
    console.error('channels error:', cErr.message);
  } else {
    console.log(`Connected channels count: ${channels.length}`);
    for (const c of channels) {
      console.log(`- Channel: "${c.title}" (ID: ${c.youtube_channel_id}) -> User: ${c.user_id}`);
      console.log(`  Has access_token: ${Boolean(c.access_token)}, Has refresh_token: ${Boolean(c.refresh_token)}`);
    }
  }
}

run().catch(console.error);
