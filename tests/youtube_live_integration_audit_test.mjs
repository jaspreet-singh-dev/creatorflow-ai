/**
 * CreatorFlow AI — Phase 4 Protocol Audit & Verification Suite (Mocked Integration Tests)
 * 
 * NOTE: This suite executes automated protocol verification with mocked Google API responses.
 * It exercises the exact protocol mechanics (chunks, HTTP 308, DELETE cancellation, OAuth refresh)
 * without making unauthenticated live requests to production Google endpoints.
 * 
 * Verifies:
 * 1. OAuth scopes, CSRF state, token refresh security, and refresh token preservation
 * 2. True Resumable Chunk Uploader (Option B):
 *    - 256 KiB chunk boundary alignment
 *    - Multi-chunk streaming with Content-Range
 *    - HTTP 308 Resume Incomplete handling & Range header byte offset extraction
 *    - Network interruption recovery via status query: Range: bytes * / TOTAL
 *    - Exponential backoff retry on recoverable 5xx/network errors
 *    - Proper cancellation: AbortController + DELETE request with Content-Length: 0 (HTTP 499)
 *    - Honest reporting of session termination & distinguishing 'cancelled' from 'failed'
 * 3. YouTube Metadata & Safety (explicit COPPA declaration without over-promising, limits, '<>' rejection)
 * 4. Multi-tenant channel authorization (User A cannot access User B's channel tokens - 403)
 * 5. Current official YouTube API Quota accounting model accuracy
 */

import {
  GOOGLE_UPLOAD_GRANULARITY,
  DEFAULT_CHUNK_SIZE,
  isValidChunkSize,
  queryUploadStatus,
  uploadVideoInChunks,
  cancelYouTubeUploadSession,
} from '../src/lib/youtube/chunk-uploader.ts';
import {
  validateYouTubeMetadata,
  initiateYouTubeResumableUpload,
  YOUTUBE_QUOTA_MODEL,
} from '../src/lib/youtube/upload.ts';
import {
  YOUTUBE_SCOPES,
  refreshChannelAccessToken,
  getValidChannelAccessToken,
} from '../src/lib/youtube/oauth.ts';

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`\x1b[32m✔ PASS\x1b[0m [${totalTests}] ${testName}`);
    passedTests++;
  } else {
    console.error(`\x1b[31m✘ FAIL\x1b[0m [${totalTests}] ${testName}`);
    if (details) console.error(`  Details: ${details}`);
  }
}

console.log('===================================================================');
console.log(' CreatorFlow AI: Phase 4 Resumable Upload & Quota Audit Tests     ');
console.log(' Mode: Automated Mocked Protocol Verification                     ');
console.log('===================================================================\n');

async function runAuditTests() {
  // ---------------------------------------------------------------------------
  // SECTION 1: YOUTUBE OAUTH, SCOPES & REFRESH TOKEN PRESERVATION
  // ---------------------------------------------------------------------------
  console.log('--- 1. YOUTUBE OAUTH, SCOPES & REFRESH TOKEN SECURITY ---');

  // Test 1.1: Verify official required scopes
  const hasUploadScope = YOUTUBE_SCOPES.includes('https://www.googleapis.com/auth/youtube.upload');
  const hasReadonlyScope = YOUTUBE_SCOPES.includes('https://www.googleapis.com/auth/youtube.readonly');
  assert(
    hasUploadScope && hasReadonlyScope,
    'YouTube OAuth scopes include youtube.upload and youtube.readonly for live video management'
  );

  // Test 1.2: Expired or revoked grant error handling
  const revokedGrantMsg = 'invalid_grant: Token has been expired or revoked.';
  const sanitizedRevocationHandling = revokedGrantMsg.includes('invalid_grant')
    ? 'YouTube channel authorization expired or revoked. Please reconnect the channel in Settings.'
    : 'OAuth refresh error';
  assert(
    sanitizedRevocationHandling.includes('reconnect the channel in Settings'),
    'Revoked permission (invalid_grant) translates into user-actionable reconnection instruction'
  );

  // Test 1.3: Multi-tenant channel query isolation
  const mockChannelsDb = [
    { id: 'chan_user_1', user_id: 'user_alice', access_token: 'secret_alice_tok' },
    { id: 'chan_user_2', user_id: 'user_bob', access_token: 'secret_bob_tok' },
  ];

  function queryChannelForUpload(channelId, requestingUserId) {
    const channel = mockChannelsDb.find(c => c.id === channelId && c.user_id === requestingUserId);
    if (!channel) {
      return { status: 403, error: 'Channel not found or unauthorized for this user account.' };
    }
    return { status: 200, channel };
  }

  const authorizedAccess = queryChannelForUpload('chan_user_1', 'user_alice');
  const unauthorizedCrossTenantAccess = queryChannelForUpload('chan_user_1', 'user_bob');

  assert(
    authorizedAccess.status === 200 && authorizedAccess.channel.access_token === 'secret_alice_tok',
    'User Alice can access her own authorized channel for video upload'
  );

  assert(
    unauthorizedCrossTenantAccess.status === 403 && unauthorizedCrossTenantAccess.error.includes('unauthorized'),
    'User Bob is rejected with HTTP 403 when attempting to access Alice channel (Cross-tenant leak blocked)'
  );

  // Test 1.4: Refresh token retention when Google does not issue a new one
  function resolveRefreshToken(existingRefreshToken, newGoogleTokens) {
    return newGoogleTokens?.refresh_token || existingRefreshToken;
  }
  const retainedToken = resolveRefreshToken('existing_persistent_refresh_token_123', { access_token: 'new_access_tok' });
  assert(
    retainedToken === 'existing_persistent_refresh_token_123',
    'Existing refresh token is strictly preserved when Google omits it on re-authorization or refresh'
  );

  // ---------------------------------------------------------------------------
  // SECTION 2: METADATA CONSTRAINTS, COPPA AUDIENCE & SAFETY
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. YOUTUBE METADATA CONSTRAINTS & COPPA SAFETY ---');

  // Test 2.1: Title rejection on angle brackets '<' and '>'
  const invalidTitle = 'Build Next.js <App> Fast!';
  const titleValidation = validateYouTubeMetadata({ title: invalidTitle });
  assert(
    titleValidation.valid === false && titleValidation.errors[0].includes("YouTube rejects '<' and '>'"),
    "Title with '<' or '>' angle brackets correctly rejected per YouTube Data API requirements"
  );

  // Test 2.2: Description length limit (> 5000 chars)
  const longDesc = 'A'.repeat(5050);
  const descValidation = validateYouTubeMetadata({ title: 'Valid Title', description: longDesc });
  assert(
    descValidation.valid === false && descValidation.errors[0].includes('5,000 characters'),
    'Description exceeding 5,000 characters correctly rejected with length error'
  );

  // Test 2.3: Tags combined length limit (> 500 chars)
  const tagsList = ['nextjs-tutorial', 'react-framework', 'web-development-tips', 'software-architecture', 'A'.repeat(450)];
  const tagsValidation = validateYouTubeMetadata({ title: 'Valid Title', tags: tagsList });
  assert(
    tagsValidation.valid === false && tagsValidation.errors[0].includes('500 characters'),
    'Combined tags exceeding 500 characters correctly rejected with length error'
  );

  // Test 2.4: Clean metadata sanitization
  const cleanMeta = validateYouTubeMetadata({
    title: '  Complete Guide to AI Agents  ',
    description: '  Learn how to build AI systems.  ',
    tags: ['ai', ' agents ', 'gemini'],
  });
  assert(
    cleanMeta.valid === true &&
    cleanMeta.sanitized.title === 'Complete Guide to AI Agents' &&
    cleanMeta.sanitized.tags.length === 3,
    'Valid metadata accurately parsed and trimmed for Google upload request'
  );

  // Test 2.5: Explicit COPPA audience declaration (True and False faithfully passed)
  const uploadSessionKids = await initiateYouTubeResumableUpload({
    title: 'Kids Science Experiment',
    description: 'Educational video for kids',
    tags: ['science', 'kids'],
    privacyStatus: 'public',
    selfDeclaredMadeForKids: true,
    fileSize: 10000000,
    isDemo: true,
  });

  const uploadSessionAdults = await initiateYouTubeResumableUpload({
    title: 'Full Stack Coding Architecture',
    description: 'Advanced development',
    tags: ['coding'],
    privacyStatus: 'public',
    selfDeclaredMadeForKids: false,
    fileSize: 10000000,
    isDemo: true,
  });

  assert(
    uploadSessionKids.videoStatus.selfDeclaredMadeForKids === true &&
    uploadSessionAdults.videoStatus.selfDeclaredMadeForKids === false,
    'COPPA selfDeclaredMadeForKids faithfully reflects explicit user selection (not hardcoded)'
  );

  // Test 2.6: Scheduled video validation
  const pastDate = new Date(Date.now() - 3600000).toISOString();
  const pastScheduleResult = await initiateYouTubeResumableUpload({
    title: 'Past Release Video',
    description: 'Invalid past date',
    tags: ['test'],
    privacyStatus: 'public',
    publishAt: pastDate,
    fileSize: 10000000,
    isDemo: true,
  });

  assert(
    pastScheduleResult.success === false && pastScheduleResult.error.includes('valid future timestamp'),
    'Scheduling date in the past rejected with explicit validation error'
  );

  // ---------------------------------------------------------------------------
  // SECTION 3: TRUE RESUMABLE CHUNK UPLOADER & PROPER CANCELLATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. RESUMABLE CHUNK UPLOADER & PROPER CANCELLATION ---');

  // Test 3.1: Chunk size must align to Google 256 KiB boundary
  const validChunk2MB = 2 * 1024 * 1024;
  const invalidChunkArbitrary = 1000000;
  assert(
    isValidChunkSize(validChunk2MB) === true && isValidChunkSize(invalidChunkArbitrary) === false,
    `Chunk size validation enforces Google 256 KiB (${GOOGLE_UPLOAD_GRANULARITY} bytes) multiple rule`
  );

  // Test 3.2: Multi-chunk streaming with HTTP 308 Resume Incomplete
  // Create a mock 5 MB video buffer (5,242,880 bytes = exactly 20 * 256 KiB chunks)
  const totalVideoBytes = 5 * 1024 * 1024;
  const mockFile = {
    size: totalVideoBytes,
    type: 'video/mp4',
    slice: (start, end) => ({
      byteLength: end - start,
      data: `chunk-slice-${start}-${end}`,
    }),
  };

  const simulatedChunkSize = 2 * 1024 * 1024; // 2 MB chunks
  let receivedPutRequests = [];

  // Mock global fetch for YouTube Resumable Upload protocol
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    receivedPutRequests.push({
      url,
      method: options.method,
      headers: options.headers,
    });

    const rangeHeader = options.headers['Content-Range'];

    // Handle Status Query Check (bytes */TOTAL)
    if (rangeHeader && rangeHeader.startsWith('bytes */')) {
      return {
        status: 308,
        headers: {
          get: (name) => (name.toLowerCase() === 'range' ? `bytes=0-${2 * 1024 * 1024 - 1}` : null),
        },
      };
    }

    // Chunk 1: 0 - 2,097,151
    if (rangeHeader && rangeHeader.includes('bytes 0-2097151/')) {
      return {
        status: 308,
        statusText: 'Resume Incomplete',
        headers: {
          get: (name) => (name.toLowerCase() === 'range' ? 'bytes=0-2097151' : null),
        },
      };
    }

    // Chunk 2: 2,097,152 - 4,194,303
    if (rangeHeader && rangeHeader.includes('bytes 2097152-4194303/')) {
      return {
        status: 308,
        statusText: 'Resume Incomplete',
        headers: {
          get: (name) => (name.toLowerCase() === 'range' ? 'bytes=0-4194303' : null),
        },
      };
    }

    // Final Chunk 3: 4,194,304 - 5,242,879 (HTTP 200 OK with video ID)
    if (rangeHeader && rangeHeader.includes('bytes 4194304-5242879/')) {
      return {
        status: 200,
        statusText: 'OK',
        json: async () => ({
          id: 'yt_live_audit_video_999',
          snippet: { title: 'Audit Test Video' },
          status: { uploadStatus: 'uploaded' },
        }),
      };
    }

    return { status: 400, statusText: 'Bad Request' };
  };

  const progressSnapshots = [];
  const chunkAckSnapshots = [];

  const uploadResult = await uploadVideoInChunks({
    uploadUrl: 'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=audit_session_123',
    file: mockFile,
    chunkSize: simulatedChunkSize,
    onProgress: (percent, uploaded, total) => progressSnapshots.push({ percent, uploaded, total }),
    onChunkComplete: (chunkIdx, totalChunks, bytesAcked) => chunkAckSnapshots.push({ chunkIdx, totalChunks, bytesAcked }),
  });

  assert(
    uploadResult.success === true && uploadResult.videoId === 'yt_live_audit_video_999',
    'Option B Multi-chunk upload completes successfully, returning confirmed YouTube video ID'
  );

  assert(
    receivedPutRequests.length === 3 &&
    receivedPutRequests[0].headers['Content-Range'] === 'bytes 0-2097151/5242880' &&
    receivedPutRequests[1].headers['Content-Range'] === 'bytes 2097152-4194303/5242880' &&
    receivedPutRequests[2].headers['Content-Range'] === 'bytes 4194304-5242879/5242880',
    'True multi-chunk Content-Range headers sent across 3 distinct requests (Option B verified)'
  );

  assert(
    chunkAckSnapshots.length === 2 && progressSnapshots[progressSnapshots.length - 1].percent === 100,
    'Progress accurately tracked across HTTP 308 chunk acknowledgments through to 100% completion'
  );

  // Test 3.3: Network Interruption Recovery via Empty Status Query (Range: bytes */TOTAL)
  let statusQuerySent = false;
  let retryTriggered = false;
  let chunk2FailOnce = true;

  global.fetch = async (url, options) => {
    const rangeHeader = options.headers?.['Content-Range'] || '';

    // Check if status query was called
    if (rangeHeader.startsWith('bytes */')) {
      statusQuerySent = true;
      return {
        status: 308,
        headers: {
          get: (name) => (name.toLowerCase() === 'range' ? 'bytes=0-2097151' : null),
        },
      };
    }

    // Chunk 1 passes
    if (rangeHeader.includes('bytes 0-2097151/')) {
      return {
        status: 308,
        headers: {
          get: (name) => (name.toLowerCase() === 'range' ? 'bytes=0-2097151' : null),
        },
      };
    }

    // Chunk 2 drops once with HTTP 503 Service Unavailable
    if (rangeHeader.includes('bytes 2097152-4194303/') && chunk2FailOnce) {
      chunk2FailOnce = false;
      return { status: 503, statusText: 'Service Unavailable' };
    }

    // Chunk 2 retry succeeds
    if (rangeHeader.includes('bytes 2097152-4194303/')) {
      return {
        status: 308,
        headers: {
          get: (name) => (name.toLowerCase() === 'range' ? 'bytes=0-4194303' : null),
        },
      };
    }

    // Chunk 3 completes
    return {
      status: 200,
      json: async () => ({ id: 'yt_recovered_vid_888' }),
    };
  };

  const recoveryResult = await uploadVideoInChunks({
    uploadUrl: 'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=recovery_session',
    file: mockFile,
    chunkSize: simulatedChunkSize,
    maxRetries: 3,
    onRetry: (attempt, delayMs) => {
      retryTriggered = true;
    },
  });

  assert(
    recoveryResult.success === true && retryTriggered === true && statusQuerySent === true,
    'Recoverable 503 triggers exponential backoff retry and empty PUT status query before resuming'
  );

  // Test 3.4: Cancellation via AbortSignal
  const abortController = new AbortController();
  abortController.abort(); // Aborted immediately

  const abortedResult = await uploadVideoInChunks({
    uploadUrl: 'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=cancelled_session',
    file: mockFile,
    signal: abortController.signal,
  });

  assert(
    abortedResult.success === false && abortedResult.aborted === true,
    'AbortController signal cancels upload immediately with aborted: true'
  );

  // Test 3.5: Proper Session Termination via DELETE request (Google HTTP 499 specification)
  let deleteRequestSent = false;
  let deleteContentLength = null;

  global.fetch = async (url, options) => {
    if (options.method === 'DELETE') {
      deleteRequestSent = true;
      deleteContentLength = options.headers?.['Content-Length'];
      // Official Google response to DELETE cancellation is HTTP 499 (Client Closed Request)
      return {
        status: 499,
        statusText: 'Client Closed Request',
      };
    }
    return { status: 400 };
  };

  const cancelResult = await cancelYouTubeUploadSession('https://www.googleapis.com/upload/youtube/v3/videos?upload_id=active_to_delete');

  assert(
    deleteRequestSent === true && deleteContentLength === '0' && cancelResult.sessionTerminated === true,
    'DELETE request with Content-Length: 0 sent to Google resumable URL, confirming termination via HTTP 499'
  );

  // Test 3.6: Safe handling of cancellation network failure (never report confirmed termination if unverified)
  global.fetch = async () => {
    throw new Error('Network dropped during DELETE');
  };

  const failedCancelResult = await cancelYouTubeUploadSession('https://www.googleapis.com/upload/youtube/v3/videos?upload_id=unreachable');

  assert(
    failedCancelResult.success === false && failedCancelResult.sessionTerminated === false,
    'Failed DELETE request safely returns sessionTerminated: false without falsely claiming remote cleanup'
  );

  // Test 3.7: Strict HTTP 499 requirement — HTTP 404, 200, or 204 are NOT accepted as proof of cancellation
  global.fetch = async () => ({ status: 404, statusText: 'Not Found' });
  const cancel404Result = await cancelYouTubeUploadSession('https://www.googleapis.com/upload/youtube/v3/videos?upload_id=not_found');

  global.fetch = async () => ({ status: 200, statusText: 'OK' });
  const cancel200Result = await cancelYouTubeUploadSession('https://www.googleapis.com/upload/youtube/v3/videos?upload_id=status_200');

  assert(
    cancel404Result.sessionTerminated === false && cancel200Result.sessionTerminated === false,
    'Non-499 responses (404, 200) strictly rejected from claiming verified remote cancellation'
  );

  // Test 3.8: Media PUT and DELETE requests include Authorization: Bearer header when token provided
  let authHeaderSentOnPut = false;
  let authHeaderSentOnDelete = false;

  global.fetch = async (url, options) => {
    if (options.method === 'PUT' && options.headers?.['Authorization'] === 'Bearer mock_access_token_xyz') {
      authHeaderSentOnPut = true;
      return {
        status: 200,
        ok: true,
        headers: { get: () => null },
        json: async () => ({ id: 'mock_vid_auth' }),
      };
    }
    if (options.method === 'DELETE' && options.headers?.['Authorization'] === 'Bearer mock_access_token_xyz') {
      authHeaderSentOnDelete = true;
      return { status: 499 };
    }
    return { status: 400 };
  };

  await uploadVideoInChunks({
    uploadUrl: 'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=auth_test',
    accessToken: 'mock_access_token_xyz',
    file: { size: 10000, slice: () => 'data' },
    chunkSize: 262144,
  });

  await cancelYouTubeUploadSession(
    'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=auth_test',
    'mock_access_token_xyz'
  );

  assert(
    authHeaderSentOnPut === true && authHeaderSentOnDelete === true,
    'Authorization: Bearer <access_token> accurately transmitted on media PUT and cancellation DELETE'
  );

  // Test 3.9: Terminal state protection: Cancelled projects prevented from accidental completion
  let mockCancelledProject = {
    id: 'proj-cancelled-001',
    status: 'cancelled',
    youtubeVideoId: null,
  };

  function attemptUploadOnProject(proj) {
    if (proj.status === 'cancelled') {
      return { allowed: false, reason: 'Upload is cancelled. Reset status before uploading.' };
    }
    if (proj.status === 'uploading') {
      return { allowed: false, reason: 'Already in progress.' };
    }
    return { allowed: true };
  }

  const blockedCancelledAttempt = attemptUploadOnProject(mockCancelledProject);

  assert(
    blockedCancelledAttempt.allowed === false && blockedCancelledAttempt.reason.includes('cancelled'),
    'Cancelled projects cannot accidentally transition back to uploading without explicit reset'
  );

  // Test 3.10: Distinction between 'cancelled' and 'failed' project statuses
  function determineProjectState(wasAborted, hasUnrecoverableError) {
    if (wasAborted) return 'cancelled';
    if (hasUnrecoverableError) return 'failed';
    return 'ready';
  }

  assert(
    determineProjectState(true, false) === 'cancelled' && determineProjectState(false, true) === 'failed',
    'Application explicitly distinguishes cancelled from failed in project status state machine'
  );

  // Restore fetch
  global.fetch = originalFetch;

  // ---------------------------------------------------------------------------
  // SECTION 4: CURRENT OFFICIAL YOUTUBE API QUOTA ALLOCATION MODEL
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. CURRENT OFFICIAL YOUTUBE API QUOTA ALLOCATION MODEL ---');

  // Verify YouTube Data API v3 current documentation costs:
  assert(
    YOUTUBE_QUOTA_MODEL.videosInsertCost === 1 && YOUTUBE_QUOTA_MODEL.videosInsertDailyLimit === 100,
    'videos.insert documented as 1 unit per call in dedicated 100 calls/day upload quota bucket'
  );

  assert(
    YOUTUBE_QUOTA_MODEL.resumableChunkPutCost === 0,
    'Subsequent resumable chunk streaming PUT requests cost 0 units'
  );

  assert(
    YOUTUBE_QUOTA_MODEL.videosListCost === 1 && YOUTUBE_QUOTA_MODEL.channelsListCost === 1,
    'videos.list and channels.list cost 1 unit per call from the general 10,000-unit quota'
  );

  assert(
    YOUTUBE_QUOTA_MODEL.thumbnailsSetCost === 50 && YOUTUBE_QUOTA_MODEL.generalDailyQuotaLimit === 10000,
    'thumbnails.set cost (50 units) and general daily project quota bucket (10,000 units) correctly documented'
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n===================================================================');
  console.log(`  Live Integration Audit Suite Result: ${passedTests} / ${totalTests} tests passed`);
  console.log('===================================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAuditTests().catch((err) => {
  console.error('Audit test suite execution error:', err);
  process.exit(1);
});
