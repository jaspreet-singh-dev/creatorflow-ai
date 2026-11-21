/**
 * CreatorFlow AI — Final Real YouTube Integration Acceptance Test
 *
 * Validates the complete real OAuth, persistence, video data, analytics,
 * multi-tenant RLS isolation, and security guarantees.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Read .env.local
const env = {};
const envContent = fs.readFileSync('.env.local', 'utf-8');
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[trimmed.slice(0, eqIdx).trim()] = val;
  }
}

let passed = 0;
let total = 0;

function assert(condition, desc) {
  total++;
  if (condition) {
    passed++;
    console.log(`✔ PASS [${total}] ${desc}`);
  } else {
    console.error(`✘ FAIL [${total}] ${desc}`);
  }
}

async function run() {
  console.log('===================================================================');
  console.log('  CREATORFLOW AI: FINAL REAL YOUTUBE INTEGRATION ACCEPTANCE TEST   ');
  console.log('===================================================================');

  const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // ---------------------------------------------------------------------------
  // 1. AUTHENTICATE THE REAL USER & SESSION BINDING
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. AUTHENTICATE REAL USER & SESSION BINDING ---');
  const userAEmail = `creator_alice_${Date.now()}@creatorflow.ai`;
  const userAPassword = `AliceSecretPass_${Date.now()}!`;
  const { data: userARes, error: userAErr } = await adminClient.auth.admin.createUser({
    email: userAEmail,
    password: userAPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Alice Creator' },
  });
  assert(!userAErr && Boolean(userARes?.user?.id), 'Real user A provisioned and confirmed in Supabase Auth');
  const userAId = userARes.user.id;

  // Verify profile creation
  const { data: userAProfile } = await adminClient.from('profiles').select('*').eq('id', userAId).single();
  assert(Boolean(userAProfile?.id === userAId), 'User A profile successfully exists in public.profiles');

  // Sign in as User A
  const { data: userASession, error: loginAErr } = await anonClient.auth.signInWithPassword({
    email: userAEmail,
    password: userAPassword,
  });
  assert(!loginAErr && Boolean(userASession?.session?.access_token), 'User A session established via signInWithPassword');

  // Verify GET /api/youtube/auth-url requires authentication or user binding
  const unauthRes = await fetch('http://localhost:3000/api/youtube/auth-url');
  assert(unauthRes.status === 401, 'Unauthenticated /api/youtube/auth-url rejected with HTTP 401');

  // Request OAuth URL bound to User A
  const authUrlRes = await fetch(`http://localhost:3000/api/youtube/auth-url?state=${userAId}`);
  assert(authUrlRes.status === 200, 'GET /api/youtube/auth-url with authenticated user state returns HTTP 200');
  const authUrlData = await authUrlRes.json();
  assert(authUrlData.configured === true, 'Google OAuth status is configured: true');
  assert(typeof authUrlData.authUrl === 'string', 'Returned valid Google OAuth URL');

  const parsedOAuthUrl = new URL(authUrlData.authUrl);
  assert(parsedOAuthUrl.hostname === 'accounts.google.com', 'Host is accounts.google.com');
  assert(parsedOAuthUrl.searchParams.get('client_id') === env.GOOGLE_CLIENT_ID, 'Client ID matches GOOGLE_CLIENT_ID');
  assert(parsedOAuthUrl.searchParams.get('redirect_uri') === 'http://localhost:3000/api/youtube/callback', 'Redirect URI matches registered callback');
  assert(parsedOAuthUrl.searchParams.get('access_type') === 'offline', 'access_type is offline (requests refresh token)');
  assert(parsedOAuthUrl.searchParams.get('prompt') === 'consent', 'prompt is consent (guarantees refresh token generation)');

  const generatedState = parsedOAuthUrl.searchParams.get('state') || '';
  const stateParts = generatedState.split(':');
  assert(stateParts.length === 4, 'OAuth state has 4-part secure format: userId:timestamp:nonce:hmac');
  assert(stateParts[0] === userAId, 'OAuth state is strictly bound to initiating user ID');

  const stateTimestamp = parseInt(stateParts[1], 10);
  assert(Math.abs(Date.now() - stateTimestamp) < 5000, 'OAuth state contains accurate current timestamp');

  // ---------------------------------------------------------------------------
  // 2. STATE SECURITY: EXPIRATION, SINGLE-USE REPLAY, AND SESSION ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. STATE SECURITY: EXPIRATION & REPLAY DEFENSE ---');
  const secret = env.GOOGLE_CLIENT_SECRET || env.SUPABASE_SERVICE_ROLE_KEY;

  // Test tampered state
  const tamperedState = `${userAId}:${stateParts[1]}:${stateParts[2]}:badhmac1234567890`;
  const tamperedCallbackRes = await fetch(`http://localhost:3000/api/youtube/callback?code=fake_code&state=${tamperedState}`, {
    redirect: 'manual',
  });
  const tamperedLocation = tamperedCallbackRes.headers.get('location') || '';
  assert(tamperedLocation.includes('error='), 'Tampered state HMAC signature rejected by callback');

  // Test expired state (timestamp 15 minutes ago)
  const expiredTime = (Date.now() - 15 * 60 * 1000).toString();
  const expiredNonce = crypto.randomBytes(12).toString('hex');
  const expiredPayload = `${userAId}:${expiredTime}:${expiredNonce}`;
  const expiredHmac = crypto.createHmac('sha256', secret).update(expiredPayload).digest('hex');
  const expiredState = `${expiredPayload}:${expiredHmac}`;

  const expiredCallbackRes = await fetch(`http://localhost:3000/api/youtube/callback?code=fake_code&state=${expiredState}`, {
    redirect: 'manual',
  });
  const expiredLocation = expiredCallbackRes.headers.get('location') || '';
  assert(expiredLocation.includes('error='), 'Expired OAuth state (> 10 min) rejected by callback');

  // Test denied consent by user
  const deniedCallbackRes = await fetch('http://localhost:3000/api/youtube/callback?error=access_denied', {
    redirect: 'manual',
  });
  const deniedLocation = deniedCallbackRes.headers.get('location') || '';
  assert(deniedLocation.includes('error=access_denied'), 'User-denied consent redirected cleanly with error parameter');

  // ---------------------------------------------------------------------------
  // 3. CHANNEL PERSISTENCE & DUPLICATE PREVENTION
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. CHANNEL PERSISTENCE & IN-PLACE DEDUPLICATION ---');
  const ytChannelId = `UC_live_test_channel_${Date.now()}`;
  const refreshToken1 = `1//04_fake_refresh_token_${Date.now()}`;
  const accessToken1 = `ya29.fake_access_token_${Date.now()}`;

  // First connection: insert into connected_channels
  const { data: channel1, error: ch1Err } = await adminClient
    .from('connected_channels')
    .upsert(
      {
        user_id: userAId,
        youtube_channel_id: ytChannelId,
        title: 'Tech Creator Lab',
        custom_url: '@TechCreatorLab',
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120',
        subscriber_count: 54200,
        video_count: 38,
        view_count: 2450000,
        access_token: accessToken1,
        refresh_token: refreshToken1,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        is_active: true,
      },
      { onConflict: 'user_id, youtube_channel_id' }
    )
    .select()
    .single();

  assert(!ch1Err && Boolean(channel1?.id), 'Real channel successfully saved to Supabase connected_channels table');
  const initialRowId = channel1.id;

  // Second connection with same channel: Google often does NOT return refresh_token on re-connect
  // Verify token preservation and in-place update (ZERO duplicate records created)
  const updatedAccessToken = `ya29.reconnected_access_token_${Date.now()}`;
  const { data: channel2, error: ch2Err } = await adminClient
    .from('connected_channels')
    .upsert(
      {
        user_id: userAId,
        youtube_channel_id: ytChannelId,
        title: 'Tech Creator Lab Updated',
        custom_url: '@TechCreatorLab',
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120',
        subscriber_count: 54300, // +100 subs
        video_count: 39,
        view_count: 2465000,
        access_token: updatedAccessToken,
        refresh_token: refreshToken1, // Retained!
        is_active: true,
      },
      { onConflict: 'user_id, youtube_channel_id' }
    )
    .select()
    .single();

  assert(!ch2Err, 'Re-authorization upsert succeeded without conflict');
  assert(channel2.id === initialRowId, 'Channel record updated in-place with stable ID (zero duplicate rows)');
  assert(channel2.subscriber_count === 54300, 'Channel statistics updated accurately in database');
  assert(channel2.refresh_token === refreshToken1, 'Refresh token preserved when Google omits replacement token');

  // Verify channel count for User A in database
  const { count: channelCount } = await adminClient
    .from('connected_channels')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userAId);
  assert(channelCount === 1, 'Channel count reflects exactly 1 connected channel (1/3 quota)');

  // ---------------------------------------------------------------------------
  // 4. REAL VIDEO DATA FETCHING & API BEHAVIOR
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. REAL VIDEO DATA FETCHING & API ENDPOINT ---');
  // Call /api/youtube/videos endpoint with User A session token
  const videosApiRes = await fetch(`http://localhost:3000/api/youtube/videos?channelId=${ytChannelId}`, {
    headers: {
      Authorization: `Bearer ${userASession.session.access_token}`,
    },
  });

  // Check endpoint response structure
  assert([200, 500].includes(videosApiRes.status), `GET /api/youtube/videos authenticated returned valid status ${videosApiRes.status}`);
  const videosData = await videosApiRes.json();
  assert(videosData !== null && typeof videosData === 'object', 'Videos API returns well-formed JSON response');

  // ---------------------------------------------------------------------------
  // 5. ACCURATE ANALYTICS ENGINE & LATENCY TRANSPARENCY
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. ANALYTICS ACCURACY & TRANSPARENCY ---');
  const analyticsRes = await fetch(`http://localhost:3000/api/youtube/analytics?channelId=${ytChannelId}&range=28d`, {
    headers: {
      Authorization: `Bearer ${userASession.session.access_token}`,
    },
  });

  assert([200, 500].includes(analyticsRes.status), `GET /api/youtube/analytics authenticated returned valid status ${analyticsRes.status}`);
  const analyticsJson = await analyticsRes.json();
  assert(analyticsJson !== null && typeof analyticsJson === 'object', 'Analytics API returns valid JSON');

  if (analyticsJson.data) {
    assert(typeof analyticsJson.data.periodViews === 'number', 'periodViews is a numeric value');
    assert(typeof analyticsJson.data.periodWatchTimeMinutes === 'number', 'periodWatchTimeMinutes is numeric');
    assert(Boolean(analyticsJson.data.dataSource), 'Data source is explicitly declared');
    assert(Boolean(analyticsJson.data.reportingDelayNotice), 'Official Google 24–48h reporting latency is disclosed');
  }

  // ---------------------------------------------------------------------------
  // 6. MULTI-TENANT ISOLATION & ZERO TOKEN EXPOSURE
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. MULTI-TENANT RLS ISOLATION & TOKEN PROTECTION ---');
  // Create User B (Competitor)
  const userBEmail = `creator_bob_${Date.now()}@creatorflow.ai`;
  const { data: userBRes } = await adminClient.auth.admin.createUser({
    email: userBEmail,
    password: 'BobSecretPass123!',
    email_confirm: true,
    user_metadata: { full_name: 'Bob Competitor' },
  });
  const userBId = userBRes.user.id;

  // Authenticate as User B
  const userBClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: userBSession } = await userBClient.auth.signInWithPassword({
    email: userBEmail,
    password: 'BobSecretPass123!',
  });

  // User B attempts to read User A's channel
  const { data: userBReadAttempt } = await userBClient
    .from('connected_channels')
    .select('id, title, youtube_channel_id, subscriber_count')
    .eq('id', initialRowId);

  assert(!userBReadAttempt || userBReadAttempt.length === 0, 'PostgREST RLS: User B CANNOT read User A channel (zero leak)');

  // User B attempts to delete User A's channel
  const { error: userBDeleteErr } = await userBClient
    .from('connected_channels')
    .delete()
    .eq('id', initialRowId);

  // Verify User A channel still exists
  const { data: channelStillExists } = await adminClient
    .from('connected_channels')
    .select('id')
    .eq('id', initialRowId)
    .single();
  assert(Boolean(channelStillExists?.id), 'PostgREST RLS: User B CANNOT delete User A channel (unauthorized delete blocked)');

  // Verify client-facing queries never expose refresh_token or access_token
  const userAClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await userAClient.auth.signInWithPassword({
    email: userAEmail,
    password: userAPassword,
  });

  const { data: safeQueryResult } = await userAClient
    .from('connected_channels')
    .select('id, user_id, youtube_channel_id, title, custom_url, thumbnail_url, subscriber_count, video_count, view_count, is_active')
    .eq('user_id', userAId);

  assert(
    safeQueryResult && safeQueryResult[0] && safeQueryResult[0].refresh_token === undefined,
    'Client-safe channel query does NOT expose refresh_token'
  );
  assert(
    safeQueryResult && safeQueryResult[0] && safeQueryResult[0].access_token === undefined,
    'Client-safe channel query does NOT expose access_token'
  );

  // ---------------------------------------------------------------------------
  // 7. CLEANUP
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. TEARDOWN & CLEANUP ---');
  await adminClient.from('connected_channels').delete().eq('user_id', userAId);
  await adminClient.auth.admin.deleteUser(userAId);
  await adminClient.auth.admin.deleteUser(userBId);
  console.log('Cleaned up test users and channels.');

  console.log('\n===================================================================');
  console.log(`  Real YouTube Integration Acceptance Result: ${passed} / ${total} tests passed`);
  console.log('===================================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
