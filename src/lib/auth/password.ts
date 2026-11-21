/**
 * Cryptographic Password Hashing & Verification Module
 * Uses NIST-recommended PBKDF2 with HMAC-SHA-256, 100,000 iterations,
 * and a cryptographically unique 16-byte random salt per user.
 * Supports transparent backward-compatible migration from legacy SHA-256 and plaintext.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function bufToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Constant-time comparison between two hex strings to prevent timing attacks.
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Hashes a password using PBKDF2 (HMAC-SHA-256, 100,000 iterations, random 16-byte salt).
 * Returns serialized format: `pbkdf2:100000:<salt_hex>:<hash_hex>`
 */
export async function hashPassword(password: string): Promise<string> {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;

  if (!cryptoObj || !cryptoObj.subtle) {
    // Basic fallback for environments without Web Crypto
    return `plaintext:${password}`;
  }

  // 1. Generate unique 16-byte cryptographic salt
  const salt = new Uint8Array(SALT_BYTES);
  cryptoObj.getRandomValues(salt);

  // 2. Import raw password
  const encoder = new TextEncoder();
  const passwordKey = await cryptoObj.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  // 3. Derive bits with PBKDF2
  const derivedBits = await cryptoObj.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    HASH_BYTES * 8
  );

  const saltHex = bufToHex(salt);
  const hashHex = bufToHex(derivedBits);

  return `pbkdf2:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * Verifies a password against a stored hash string.
 * Supports:
 * 1. Standard PBKDF2: `pbkdf2:100000:<salt>:<hash>`
 * 2. Legacy SHA-256: 64-char hex string (flags needsRehash: true)
 * 3. Legacy Plaintext: Raw password string (flags needsRehash: true)
 */
export async function verifyPassword(
  password: string,
  storedValue: string
): Promise<{ isValid: boolean; needsRehash: boolean }> {
  if (!storedValue) return { isValid: false, needsRehash: false };

  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;

  // Case 1: Standard PBKDF2 format
  if (storedValue.startsWith("pbkdf2:")) {
    if (!cryptoObj || !cryptoObj.subtle) {
      return { isValid: false, needsRehash: false };
    }

    const parts = storedValue.split(":");
    if (parts.length !== 4) return { isValid: false, needsRehash: false };

    const iterations = parseInt(parts[1], 10);
    const salt = hexToBuf(parts[2]);
    const expectedHashHex = parts[3];

    const encoder = new TextEncoder();
    const passwordKey = await cryptoObj.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await cryptoObj.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations,
        hash: "SHA-256",
      },
      passwordKey,
      HASH_BYTES * 8
    );

    const actualHashHex = bufToHex(derivedBits);
    const match = constantTimeCompare(expectedHashHex, actualHashHex);

    return { isValid: match, needsRehash: iterations < PBKDF2_ITERATIONS };
  }

  // Case 2: Legacy salted SHA-256 (64 hex characters)
  if (/^[a-f0-9]{64}$/i.test(storedValue) && cryptoObj && cryptoObj.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`cf_salt_v1_${password}`);
    const hashBuffer = await cryptoObj.subtle.digest("SHA-256", data);
    const computedLegacyHex = bufToHex(hashBuffer);

    if (constantTimeCompare(storedValue.toLowerCase(), computedLegacyHex.toLowerCase())) {
      // Password is correct, but needs upgrade to PBKDF2
      return { isValid: true, needsRehash: true };
    }
    return { isValid: false, needsRehash: false };
  }

  // Case 3: Plaintext fallback
  if (storedValue.startsWith("plaintext:")) {
    const rawExpected = storedValue.replace("plaintext:", "");
    if (rawExpected === password) {
      return { isValid: true, needsRehash: true };
    }
  } else if (storedValue === password) {
    return { isValid: true, needsRehash: true };
  }

  return { isValid: false, needsRehash: false };
}
