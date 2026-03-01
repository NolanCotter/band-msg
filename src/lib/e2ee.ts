const E2EE_PREFIX = "enc:v1";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const keyCache = new Map<string, Promise<CryptoKey>>();

function toBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes as Uint8Array<ArrayBuffer>;
}

function toOwnedBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(bytes) as Uint8Array<ArrayBuffer>;
}

function getCacheKey(passphrase: string, channelId: string): string {
  return `${channelId}\u0000${passphrase}`;
}

async function getAesKey(passphrase: string, channelId: string): Promise<CryptoKey> {
  const cacheKey = getCacheKey(passphrase, channelId);
  const existing = keyCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode(`band-msg:e2ee:${channelId}`),
        iterations: 250000,
        hash: "SHA-256",
      },
      baseKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"]
    );
  })();

  keyCache.set(cacheKey, promise);
  return promise;
}

export function isEncryptedPayload(content: string): boolean {
  return content.startsWith(`${E2EE_PREFIX}:`);
}

export async function encryptForChannel(
  plaintext: string,
  passphrase: string,
  channelId: string
): Promise<string> {
  const key = await getAesKey(passphrase, channelId);
  const iv = toOwnedBytes(crypto.getRandomValues(new Uint8Array(12)));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );

  return `${E2EE_PREFIX}:${toBase64(iv)}:${toBase64(new Uint8Array(ciphertext) as Uint8Array<ArrayBuffer>)}`;
}

export async function decryptForChannel(
  content: string,
  passphrase: string,
  channelId: string
): Promise<string | null> {
  if (!isEncryptedPayload(content)) {
    return content;
  }

  const parts = content.split(":");
  if (parts.length !== 4) {
    return null;
  }

  const iv = toOwnedBytes(fromBase64(parts[2]));
  const payload = toOwnedBytes(fromBase64(parts[3]));

  try {
    const key = await getAesKey(passphrase, channelId);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      payload
    );
    return decoder.decode(plaintext);
  } catch {
    return null;
  }
}
