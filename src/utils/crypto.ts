// AES-GCM Encryption/Decryption Utilities

export async function encrypt(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();

  // Derive key from password
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt data
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data)
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedData: string, password: string): Promise<string> {
  try {
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    // Derive key from password
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Decrypt
    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);

    // Return as string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error('Decryption failed. Invalid password or corrupted data.');
  }
}

// Legacy functions for backward compatibility
export const encryptWithPassword = encrypt;
export const decryptWithPassword = decrypt;

/**
 * Generate a random 256-bit encryption key
 */
export function generateEncryptionKey(): string {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...keyBytes));
}

/**
 * Encrypt private key with encryption key (AES-GCM)
 */
export async function encryptPrivateKey(privateKey: string, encryptionKey: string): Promise<string> {
  const encoder = new TextEncoder();

  // Import encryption key
  const keyBytes = new Uint8Array(
    atob(encryptionKey)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt private key
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(privateKey)
  );

  // Combine iv + encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt private key with encryption key (AES-GCM)
 */
export async function decryptPrivateKey(encryptedData: string, encryptionKey: string): Promise<string> {
  try {
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    // Extract iv and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Import encryption key
    const keyBytes = new Uint8Array(
      atob(encryptionKey)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    // Decrypt
    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);

    // Return as string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error('Private key decryption failed. Invalid encryption key or corrupted data.');
  }
}

