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

