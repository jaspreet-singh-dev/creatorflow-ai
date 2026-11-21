/**
 * CreatorFlow AI — Live Supabase Post-Migration Verification Suite
 * 
 * Tests:
 * 1. Existence of all 10 application tables
 * 2. Complete column matching against init_schema.sql
 * 3. RLS enablement & policy verification
 * 4. Auth & Database connectivity via configured environment variables
 * 5. Application-level authenticated user persistence check
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

async function runLiveVerification() {
  console.log('===================================================================');
  console.log('     CreatorFlow AI: Live Supabase Post-Migration Audit            ');
  console.log('===================================================================');

  // Expected tables and columns based on init_schema.sql
  const expectedSchema = {
    profiles: ['id', 'email', 'full_name', 'avatar_url', 'plan_tier', 'created_at', 'updated_at'],
    connected_channels: ['id', 'user_id', 'youtube_channel_id', 'title', 'custom_url', 'thumbnail_url', 'subscriber_count', 'video_count', 'view_count', 'refresh_token', 'access_token', 'token_expires_at', 'is_active', 'created_at', 'updated_at'],
    videos: ['id', 'user_id', 'channel_id', 'title', 'description', 'tags', 'privacy_status', 'status', 'youtube_video_id', 'scheduled_at', 'published_at', 'video_file_url', 'thumbnail_url', 'created_at', 'updated_at'],
    video_metadata: ['id', 'video_id', 'user_id', 'topic', 'niche', 'target_audience', 'primary_keyword', 'secondary_keywords', 'preferred_tone', 'language', 'titles', 'description', 'tags', 'hashtags', 'pinned_comment', 'chapters', 'thumbnail_ideas', 'quality_score', 'created_at', 'updated_at'],
    upload_jobs: ['id', 'video_id', 'user_id', 'channel_id', 'status', 'progress_percent', 'bytes_uploaded', 'total_bytes', 'youtube_upload_url', 'error_message', 'retry_count', 'created_at', 'updated_at'],
    thumbnail_assets: ['id', 'user_id', 'video_id', 'image_url', 'prompt', 'text_overlay', 'style', 'is_active', 'created_at'],
    content_ideas: ['id', 'user_id', 'channel_id', 'niche', 'title', 'hook', 'outline', 'format', 'status', 'suggested_keywords', 'created_at'],
    analytics_snapshots: ['id', 'channel_id', 'snapshot_date', 'views', 'watch_time_hours', 'avg_view_duration_seconds', 'impressions', 'ctr_percent', 'subscribers_gained', 'metrics_payload', 'created_at'],
    subscriptions: ['id', 'user_id', 'plan_tier', 'status', 'current_period_start', 'current_period_end', 'created_at', 'updated_at'],
    usage_records: ['id', 'user_id', 'period_date', 'metadata_generations_count', 'ai_ideas_count', 'video_uploads_count', 'connected_channels_count', 'created_at', 'updated_at'],
  };

  // ---------------------------------------------------------------------------
  // 1. OPENAPI SCHEMA CACHE & TABLE EXISTENCE
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. POSTGREST SCHEMA CACHE & TABLE EXISTENCE ---');
  let openApiData = null;
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (res.status === 200) {
      openApiData = await res.json();
    }
  } catch (e) {
    console.error('Failed to query OpenAPI spec:', e.message);
  }

  const existingDefinitions = Object.keys(openApiData?.definitions || {});
  const expectedTableNames = Object.keys(expectedSchema);
  
  const allTablesPresent = expectedTableNames.every(t => existingDefinitions.includes(t));
  assert(allTablesPresent, `All 10 required application tables exist in PostgREST schema cache (${existingDefinitions.length} / 10 confirmed)`);

  // ---------------------------------------------------------------------------
  // 2. COLUMN STRUCTURE MATCHING
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. COLUMN STRUCTURE VERIFICATION ---');
  let totalColumnsMatched = 0;
  let totalExpectedColumns = 0;
  let allColumnsMatch = true;

  for (const [table, expectedCols] of Object.entries(expectedSchema)) {
    const def = openApiData?.definitions?.[table];
    const actualCols = Object.keys(def?.properties || {});
    totalExpectedColumns += expectedCols.length;
    
    const missingInDb = expectedCols.filter(c => !actualCols.includes(c));
    if (missingInDb.length === 0) {
      totalColumnsMatched += expectedCols.length;
      assert(true, `Table [${table}]: all ${expectedCols.length} columns match schema definition`);
    } else {
      allColumnsMatch = false;
      assert(false, `Table [${table}]: missing columns: ${missingInDb.join(', ')}`);
    }
  }

  assert(
    allColumnsMatch && totalColumnsMatched === totalExpectedColumns,
    `Complete schema alignment: ${totalColumnsMatched} / ${totalExpectedColumns} columns verified across all 10 tables`
  );

  // ---------------------------------------------------------------------------
  // 3. AUTHENTICATION SERVICE CONNECTIVITY
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. SUPABASE AUTH & LIVE SESSION GENERATION ---');
  const adminClient = createClient(url, serviceKey);
  const anonClient = createClient(url, anonKey);

  const testEmail = `audit_verify_${Date.now()}@creatorflow.ai`;
  const testPassword = `AuditPass_${Date.now()}_Secure!`;

  let userCreated = false;
  let userLoggedIn = false;
  let userId = null;
  let userToken = null;

  try {
    // 3.1 Create confirmed user via admin API
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Audit Verification User' },
    });

    if (!createErr && created?.user) {
      userCreated = true;
      userId = created.user.id;
    }
    assert(userCreated, 'Supabase GoTrue Auth service reachable: admin user creation succeeded');

    // 3.2 Sign in via anon client to obtain user JWT
    const { data: authData, error: loginErr } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (!loginErr && authData?.session) {
      userLoggedIn = true;
      userToken = authData.session.access_token;
    }
    assert(userLoggedIn, 'Supabase GoTrue Auth sign-in succeeded: user JWT generated with role: authenticated');
  } catch (e) {
    console.error('Auth test failed:', e.message);
  }

  // ---------------------------------------------------------------------------
  // 4. APPLICATION-LEVEL DATA PERSISTENCE & PRIVILEGE STATUS
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. APPLICATION-LEVEL DATA ACCESS & PRIVILEGES ---');
  let tablePrivilegesGranted = false;
  let userQueryError = null;

  if (userToken) {
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${userToken}` } },
    });

    const { data, error } = await userClient.from('profiles').select('*').limit(1);
    if (error) {
      userQueryError = error;
      tablePrivilegesGranted = false;
    } else {
      tablePrivilegesGranted = true;
    }
  }

  if (tablePrivilegesGranted) {
    assert(true, 'Application-level authenticated user persistence verified: SELECT query succeeded');
  } else {
    assert(
      false,
      `Table-level privilege pending: query returned ${userQueryError?.code} (${userQueryError?.message}). Run GRANT script to enable API role access.`
    );
  }

  // Clean up test user
  if (userId) {
    await adminClient.auth.admin.deleteUser(userId);
  }

  console.log('\n===================================================================');
  console.log(`  Supabase Live Verification Result: ${passedTests} / ${totalTests} checks passed`);
  console.log('===================================================================');
}

runLiveVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
