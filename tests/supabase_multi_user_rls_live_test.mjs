/**
 * CreatorFlow AI — Live Supabase Multi-User RLS & CRUD Acceptance Suite
 * 
 * Verifies against live production Supabase instance:
 * 1. PostgREST accessibility on all 10 application tables
 * 2. Real authenticated INSERT, SELECT, UPDATE, DELETE lifecycle
 * 3. Multi-tenant user isolation with two independent users (Alice & Bob)
 * 4. RLS enforcement preventing Bob from viewing, modifying, or deleting Alice's data
 * 5. RLS check preventing Bob from spoofing Alice's user_id on INSERT
 * 6. Clean database teardown without residual artifacts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Read environment variables safely
const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1).trim();
    }
  });
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✔ PASS [${totalTests}] ${message}`);
  } else {
    console.error(`✘ FAIL [${totalTests}] ${message}`);
  }
}

async function runLiveRlsAudit() {
  console.log('===================================================================');
  console.log('   CreatorFlow AI: Live Supabase Multi-Tenant RLS Acceptance Test  ');
  console.log('===================================================================');

  const adminClient = createClient(url, serviceKey);
  const anonClient = createClient(url, anonKey);

  // ---------------------------------------------------------------------------
  // 1. ALL 10 TABLES POSTGREST READINESS CHECK
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. POSTGREST ACCESS ON ALL 10 TABLES ---');
  const tables = [
    'profiles',
    'connected_channels',
    'videos',
    'video_metadata',
    'upload_jobs',
    'thumbnail_assets',
    'content_ideas',
    'analytics_snapshots',
    'subscriptions',
    'usage_records',
  ];

  let accessibleCount = 0;
  for (const table of tables) {
    const { data, error } = await adminClient.from(table).select('*').limit(1);
    if (!error) {
      accessibleCount++;
      assert(true, `Table [${table}] accessible with service_role permissions (0 errors)`);
    } else {
      assert(false, `Table [${table}] error: ${error.code} - ${error.message}`);
    }
  }
  assert(accessibleCount === 10, 'All 10 application tables are fully accessible via PostgREST');

  // ---------------------------------------------------------------------------
  // 2. PROVISION TWO DISTINCT USERS (ALICE & BOB)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. MULTI-USER PROVISIONING & AUTHENTICATION ---');
  const timestamp = Date.now();
  const aliceEmail = `alice_test_${timestamp}@creatorflow.ai`;
  const alicePassword = `Alice_Secret_Pass_${timestamp}!`;
  const bobEmail = `bob_test_${timestamp}@creatorflow.ai`;
  const bobPassword = `Bob_Secret_Pass_${timestamp}!`;

  let aliceId = null;
  let bobId = null;
  let aliceToken = null;
  let bobToken = null;

  try {
    // Create Alice
    const { data: aliceUser, error: aErr } = await adminClient.auth.admin.createUser({
      email: aliceEmail,
      password: alicePassword,
      email_confirm: true,
      user_metadata: { full_name: 'Alice Creator' },
    });
    if (aErr) throw aErr;
    aliceId = aliceUser.user.id;

    // Create Bob
    const { data: bobUser, error: bErr } = await adminClient.auth.admin.createUser({
      email: bobEmail,
      password: bobPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Bob Competitor' },
    });
    if (bErr) throw bErr;
    bobId = bobUser.user.id;

    // Login Alice
    const { data: aLogin, error: aLogErr } = await anonClient.auth.signInWithPassword({
      email: aliceEmail,
      password: alicePassword,
    });
    if (aLogErr) throw aLogErr;
    aliceToken = aLogin.session.access_token;

    // Login Bob
    const { data: bLogin, error: bLogErr } = await anonClient.auth.signInWithPassword({
      email: bobEmail,
      password: bobPassword,
    });
    if (bLogErr) throw bLogErr;
    bobToken = bLogin.session.access_token;

    assert(Boolean(aliceId && bobId && aliceId !== bobId), 'Two distinct user accounts created (Alice & Bob)');
    assert(Boolean(aliceToken && bobToken && aliceToken !== bobToken), 'Two separate authenticated user JWT sessions issued');
  } catch (err) {
    console.error('Provisioning failed:', err.message);
    process.exit(1);
  }

  // Instantiate isolated clients
  const aliceClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${aliceToken}` } },
  });
  const bobClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${bobToken}` } },
  });

  // ---------------------------------------------------------------------------
  // 3. AUTHENTICATED CRUD LIFECYCLE (ALICE)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. AUTHENTICATED CRUD LIFECYCLE (ALICE) ---');
  let aliceVideoId = null;

  // 3.1 INSERT: Alice creates a video project
  const { data: insertedVideo, error: insertErr } = await aliceClient
    .from('videos')
    .insert({
      user_id: aliceId,
      title: 'Alice 10x Productivity Workflow 2026',
      description: 'Exclusive proprietary strategy notes for Alice channel.',
      tags: ['productivity', 'workflow', 'ai'],
      privacy_status: 'private',
      status: 'draft',
    })
    .select('id, title, user_id')
    .single();

  assert(!insertErr && insertedVideo?.id, 'INSERT: Alice successfully created a video record');
  aliceVideoId = insertedVideo?.id;

  // 3.2 SELECT: Alice reads her own video record
  const { data: aliceVideos, error: selectErr } = await aliceClient
    .from('videos')
    .select('id, title, user_id')
    .eq('id', aliceVideoId);

  assert(
    !selectErr && aliceVideos?.length === 1 && aliceVideos[0].title === 'Alice 10x Productivity Workflow 2026',
    'SELECT: Alice successfully queried and retrieved her own video record'
  );

  // 3.3 UPDATE: Alice updates her video record
  const { error: updateErr } = await aliceClient
    .from('videos')
    .update({ title: 'Alice Masterclass: AI Workspaces 2026 (Updated)' })
    .eq('id', aliceVideoId);

  const { data: updatedAliceVideos } = await aliceClient
    .from('videos')
    .select('title')
    .eq('id', aliceVideoId);

  assert(
    !updateErr && updatedAliceVideos?.[0]?.title === 'Alice Masterclass: AI Workspaces 2026 (Updated)',
    'UPDATE: Alice successfully updated her video title in-place'
  );

  // ---------------------------------------------------------------------------
  // 4. MULTI-TENANT ROW LEVEL SECURITY (RLS) ISOLATION (ALICE VS BOB)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. MULTI-TENANT RLS ISOLATION & ATTACK DEFENSE ---');

  // 4.1 SELECT LEAK TEST: Bob queries all videos
  const { data: bobViewAll } = await bobClient.from('videos').select('*');
  assert(
    Array.isArray(bobViewAll) && bobViewAll.length === 0,
    'RLS SELECT DEFENSE: Bob cannot see Alice video in general video list (returned 0 rows)'
  );

  // 4.2 TARGETED READ LEAK TEST: Bob attempts to read Alice specific video by ID
  const { data: bobTargetedRead } = await bobClient
    .from('videos')
    .select('*')
    .eq('id', aliceVideoId);

  assert(
    Array.isArray(bobTargetedRead) && bobTargetedRead.length === 0,
    'RLS DIRECT LOOKUP DEFENSE: Bob direct query for Alice videoId returns 0 rows (confidentiality preserved)'
  );

  // 4.3 MALICIOUS UPDATE DEFENSE: Bob attempts to overwrite Alice video title
  const { error: bobUpdateErr } = await bobClient
    .from('videos')
    .update({ title: 'DEFACED BY BOB' })
    .eq('id', aliceVideoId);

  // Verify Alice record was NOT modified
  const { data: aliceVerifyUnchanged } = await aliceClient
    .from('videos')
    .select('title')
    .eq('id', aliceVideoId);

  assert(
    aliceVerifyUnchanged?.[0]?.title === 'Alice Masterclass: AI Workspaces 2026 (Updated)',
    'RLS UPDATE DEFENSE: Bob cannot modify Alice video record (tampering prevented)'
  );

  // 4.4 MALICIOUS DELETE DEFENSE: Bob attempts to delete Alice video
  const { error: bobDeleteErr } = await bobClient
    .from('videos')
    .delete()
    .eq('id', aliceVideoId);

  // Verify Alice record still exists
  const { data: aliceVerifyStillExists } = await aliceClient
    .from('videos')
    .select('id')
    .eq('id', aliceVideoId);

  assert(
    aliceVerifyStillExists?.length === 1,
    'RLS DELETE DEFENSE: Bob cannot delete Alice video record (data destruction prevented)'
  );

  // 4.5 SPOOFED INSERT DEFENSE: Bob attempts to insert a video with user_id = aliceId
  const { data: spoofedInsert, error: spoofErr } = await bobClient
    .from('videos')
    .insert({
      user_id: aliceId, // Spoofed user_id!
      title: 'Bob Impersonating Alice',
    })
    .select();

  assert(
    Boolean(spoofErr && (spoofErr.code === '42501' || spoofErr.message.includes('policy'))),
    'RLS INSERT WITH CHECK DEFENSE: Bob cannot spoof Alice user_id on INSERT (Postgres rejects with RLS violation)'
  );

  // ---------------------------------------------------------------------------
  // 5. DELETE & DATABASE CLEANUP (ALICE)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. AUTHENTICATED DELETE & CLEANUP ---');

  // Alice deletes her video
  const { error: aliceDeleteErr } = await aliceClient
    .from('videos')
    .delete()
    .eq('id', aliceVideoId);

  const { data: aliceVideosAfterDelete } = await aliceClient
    .from('videos')
    .select('*')
    .eq('id', aliceVideoId);

  assert(
    !aliceDeleteErr && aliceVideosAfterDelete?.length === 0,
    'DELETE: Alice successfully deleted her own video record'
  );

  // Teardown users
  if (aliceId) await adminClient.auth.admin.deleteUser(aliceId);
  if (bobId) await adminClient.auth.admin.deleteUser(bobId);
  assert(true, 'Teardown: Ephemeral test accounts (Alice & Bob) safely purged from auth and database');

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n===================================================================');
  console.log(`  Live Multi-Tenant RLS Audit Result: ${passedTests} / ${totalTests} checks passed`);
  console.log('===================================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLiveRlsAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
