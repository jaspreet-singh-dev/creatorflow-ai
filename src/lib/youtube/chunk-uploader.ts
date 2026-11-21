/**
 * Official YouTube Data API v3 Resumable Chunk Uploader
 * 
 * Implements Google's official resumable upload protocol:
 * - Chunks in exact multiples of 256 KiB (default: 2 MB = 2,097,152 bytes)
 * - Sets Content-Range: bytes START-END/TOTAL
 * - Handles HTTP 308 Resume Incomplete with Range: bytes=0-X offset extraction
 * - Recovers from network interruptions via empty status query: Range bytes * / TOTAL
 * - Implements exponential backoff retry on recoverable 5xx / 408 / network errors
 * - Supports cancellation via AbortController
 */

export interface ChunkUploaderOptions {
  uploadUrl: string;
  accessToken?: string; // Short-lived OAuth access token for media PUT authorization
  file: Blob | File | { size: number; type?: string; slice: (start: number, end: number) => any };
  chunkSize?: number; // Must be a multiple of 256 KiB (262,144 bytes)
  maxRetries?: number;
  initialOffset?: number;
  onProgress?: (percent: number, bytesUploaded: number, totalBytes: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number, bytesUploaded: number) => void;
  onRetry?: (attempt: number, delayMs: number, reason: string) => void;
  signal?: AbortSignal;
}

export interface ChunkUploadResult {
  success: boolean;
  videoId?: string;
  rawResponse?: any;
  error?: string;
  aborted?: boolean;
}

// 256 KiB Google byte granularity
export const GOOGLE_UPLOAD_GRANULARITY = 256 * 1024; // 262,144 bytes
export const DEFAULT_CHUNK_SIZE = GOOGLE_UPLOAD_GRANULARITY * 8; // 2,097,152 bytes (2 MB)

/**
 * Validates that chunk size is a positive integer multiple of 256 KiB
 */
export function isValidChunkSize(bytes: number): boolean {
  return bytes > 0 && bytes % GOOGLE_UPLOAD_GRANULARITY === 0;
}

/**
 * Queries Google's resumable upload endpoint to discover how many bytes were already received.
 * Sent as an empty PUT with `Content-Range: bytes * / TOTAL`.
 * Per YouTube documentation, includes Authorization header when authenticated via OAuth.
 */
export async function queryUploadStatus(
  uploadUrl: string,
  totalBytes: number,
  accessToken?: string,
  signal?: AbortSignal
): Promise<{ completed: boolean; bytesReceived: number; videoId?: string; raw?: any }> {
  const headers: Record<string, string> = {
    "Content-Range": `bytes */${totalBytes}`,
  };
  if (typeof window === "undefined") {
    headers["Content-Length"] = "0";
  }
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers,
    signal,
  });

  if (response.status === 200 || response.status === 201) {
    const data = await response.json();
    return {
      completed: true,
      bytesReceived: totalBytes,
      videoId: data?.id,
      raw: data,
    };
  }

  if (response.status === 308) {
    const rangeHeader = response.headers.get("Range");
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=0-(\d+)/);
      if (match) {
        return {
          completed: false,
          bytesReceived: parseInt(match[1], 10) + 1,
        };
      }
    }
    return { completed: false, bytesReceived: 0 };
  }

  throw new Error(`Status query failed with HTTP ${response.status}: ${response.statusText}`);
}

/**
 * Cancels an in-progress Google resumable upload session by sending an official DELETE request
 * to Google's resumable session URL per official specification.
 * Request must include Content-Length: 0 and Authorization when OAuth is used.
 * Google's documented successful cancellation response is strictly HTTP 499 (Client Closed Request).
 */
export async function cancelYouTubeUploadSession(
  uploadUrl: string,
  accessToken?: string,
  signal?: AbortSignal
): Promise<{ success: boolean; sessionTerminated: boolean; error?: string }> {
  if (!uploadUrl) {
    return { success: false, sessionTerminated: false, error: "No upload session URL provided." };
  }

  try {
    const headers: Record<string, string> = {};
    if (typeof window === "undefined") {
      headers["Content-Length"] = "0";
    }
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(uploadUrl, {
      method: "DELETE",
      headers,
      signal,
    });

    // Google's official documented response for successful cancellation is strictly HTTP 499 (Client Closed Request)
    if (response.status === 499) {
      return { success: true, sessionTerminated: true };
    }

    // Do not automatically treat 404, 200, or 204 as proof that the session was cancelled
    return {
      success: false,
      sessionTerminated: false,
      error: `Remote cancellation returned HTTP ${response.status} instead of expected HTTP 499.`,
    };
  } catch (err: any) {
    // Network failure during cancellation
    return {
      success: false,
      sessionTerminated: false,
      error: err?.message || "Network error while sending DELETE request to YouTube session.",
    };
  }
}

/**
 * Executes a full Resumable Chunked Upload to YouTube Data API v3
 */
export async function uploadVideoInChunks(options: ChunkUploaderOptions): Promise<ChunkUploadResult> {
  const {
    uploadUrl,
    file,
    chunkSize = DEFAULT_CHUNK_SIZE,
    maxRetries = 5,
    onProgress,
    onChunkComplete,
    onRetry,
    signal,
  } = options;

  const totalBytes = file.size;
  let currentOffset = options.initialOffset || 0;

  if (!isValidChunkSize(chunkSize) && totalBytes > chunkSize) {
    console.warn(
      `Chunk size ${chunkSize} is not an exact multiple of 256 KiB (${GOOGLE_UPLOAD_GRANULARITY}). Aligning to nearest 256 KiB multiple.`
    );
  }

  const alignedChunkSize = Math.max(
    GOOGLE_UPLOAD_GRANULARITY,
    Math.floor(chunkSize / GOOGLE_UPLOAD_GRANULARITY) * GOOGLE_UPLOAD_GRANULARITY
  );

  const totalChunks = Math.ceil(totalBytes / alignedChunkSize);
  let chunkIndex = 0;

  while (currentOffset < totalBytes) {
    if (signal?.aborted) {
      return { success: false, aborted: true, error: "Upload cancelled by user." };
    }

    const endByte = Math.min(currentOffset + alignedChunkSize - 1, totalBytes - 1);
    const chunkBlob = file.slice(currentOffset, endByte + 1);
    const chunkLength = endByte - currentOffset + 1;
    const contentRange = `bytes ${currentOffset}-${endByte}/${totalBytes}`;

    let success = false;
    let attempt = 0;

    while (!success && attempt <= maxRetries) {
      if (signal?.aborted) {
        return { success: false, aborted: true, error: "Upload cancelled by user." };
      }

      try {
        const headers: Record<string, string> = {
          "Content-Type": (file as any).type || "video/mp4",
          "Content-Range": contentRange,
        };
        if (typeof window === "undefined") {
          headers["Content-Length"] = String(chunkLength);
        }
        if (options.accessToken) {
          headers["Authorization"] = `Bearer ${options.accessToken}`;
        }

        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers,
          body: chunkBlob as any,
          signal,
        });

        // Case A: Chunk uploaded and video processing complete (HTTP 200 / 201)
        if (response.status === 200 || response.status === 201) {
          const resultData = await response.json();
          onProgress?.(100, totalBytes, totalBytes);
          return {
            success: true,
            videoId: resultData.id,
            rawResponse: resultData,
          };
        }

        // Case B: Chunk acknowledged, upload incomplete (HTTP 308 Resume Incomplete)
        if (response.status === 308) {
          const rangeHeader = response.headers.get("Range");
          if (rangeHeader) {
            const match = rangeHeader.match(/bytes=0-(\d+)/);
            if (match) {
              const lastAckByte = parseInt(match[1], 10);
              currentOffset = lastAckByte + 1;
            } else {
              currentOffset = endByte + 1;
            }
          } else {
            currentOffset = endByte + 1;
          }

          success = true;
          chunkIndex++;
          const percent = Math.min(99, Math.round((currentOffset / totalBytes) * 100));
          onProgress?.(percent, currentOffset, totalBytes);
          onChunkComplete?.(chunkIndex, totalChunks, currentOffset);
          break;
        }

        // Case C: Non-recoverable client error (4xx except 408 / 429)
        if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
          let errMsg = `Upload failed with HTTP ${response.status}: ${response.statusText}`;
          try {
            const errData = await response.json();
            if (errData?.error?.message) errMsg = errData.error.message;
          } catch {
            // ignore JSON parse
          }
          return { success: false, error: errMsg };
        }

        // Case D: Recoverable server error (5xx, 408, 429)
        throw new Error(`Recoverable server error HTTP ${response.status}`);
      } catch (err: any) {
        if (signal?.aborted || err?.name === "AbortError") {
          return { success: false, aborted: true, error: "Upload cancelled by user." };
        }

        attempt++;
        if (attempt > maxRetries) {
          return {
            success: false,
            error: `Upload interrupted after ${maxRetries} failed retries: ${err.message}`,
          };
        }

        // Exponential Backoff: 1s, 2s, 4s, 8s, 16s + jitter
        const delayMs = Math.pow(2, attempt - 1) * 1000 + Math.floor(Math.random() * 500);
        onRetry?.(attempt, delayMs, err.message);

        await new Promise((r) => setTimeout(r, delayMs));

        // Before sending chunk again, query YouTube endpoint to see if bytes were actually received
        try {
          const status = await queryUploadStatus(uploadUrl, totalBytes, options.accessToken, signal);
          if (status.completed) {
            onProgress?.(100, totalBytes, totalBytes);
            return {
              success: true,
              videoId: status.videoId,
              rawResponse: status.raw,
            };
          }
          currentOffset = status.bytesReceived;
          break; // break retry loop to recalculate chunk from updated offset
        } catch {
          // If status query also fails, proceed to next retry attempt
        }
      }
    }
  }

  return { success: false, error: "Upload loop terminated unexpectedly without confirmation." };
}
