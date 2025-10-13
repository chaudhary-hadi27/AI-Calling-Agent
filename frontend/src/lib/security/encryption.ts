/**
 * Client-Side Encryption Utilities
 * Handles sensitive data encryption before transmission
 */

/**
 * Encrypt sensitive data using AES-GCM
 * @param data - String data to encrypt
 * @param password - Encryption password
 * @returns Base64 encoded encrypted data with IV
 */
export async function encryptData(data: string, password: string): Promise<string> {
  try {
    // Generate encryption key from password
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Generate salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive AES key from password
    const aesKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Generate IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data
    const encodedData = encoder.encode(data);
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encodedData
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data encrypted with encryptData
 * @param encryptedData - Base64 encoded encrypted data
 * @param password - Decryption password
 * @returns Decrypted string
 */
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  try {
    // Decode base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    // Generate encryption key from password
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive AES key
    const aesKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      data
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate secure random string
 * @param length - Length of string to generate
 * @returns Random hex string
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash data using SHA-256
 * @param data - String to hash
 * @returns Hex encoded hash
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate RSA key pair for asymmetric encryption
 * @returns Public and private key pair
 */
export async function generateRSAKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  return keyPair;
}

/**
 * Export public key to PEM format
 * @param key - CryptoKey to export
 * @returns PEM formatted key string
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', key);
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const exportedAsBase64 = btoa(exportedAsString);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
}

/**
 * Import public key from PEM format
 * @param pem - PEM formatted key string
 * @returns CryptoKey
 */
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length
  ).replace(/\s/g, '');
  const binaryDer = atob(pemContents);
  const binaryDerArray = Uint8Array.from(binaryDer, c => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    'spki',
    binaryDerArray,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

/**
 * Encrypt sensitive form data before sending to server
 * Useful for passwords, credit cards, etc.
 * @param sensitiveData - Object containing sensitive fields
 * @param sessionKey - Temporary session encryption key
 * @returns Encrypted data object
 */
export async function encryptSensitiveFields<T extends Record<string, any>>(
  sensitiveData: T,
  sessionKey: string
): Promise<Record<string, string>> {
  const encrypted: Record<string, string> = {};

  for (const [key, value] of Object.entries(sensitiveData)) {
    if (value !== null && value !== undefined) {
      encrypted[key] = await encryptData(String(value), sessionKey);
    }
  }

  return encrypted;
}

/**
 * Secure storage wrapper with encryption
 */
export class SecureStorage {
  private static encryptionKey = generateSecureRandom(32);

  /**
   * Store data securely in localStorage
   */
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      const encrypted = await encryptData(jsonString, this.encryptionKey);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('SecureStorage.setItem error:', error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = await decryptData(encrypted, this.encryptionKey);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('SecureStorage.getItem error:', error);
      return null;
    }
  }

  /**
   * Remove item from secure storage
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all secure storage
   */
  static clear(): void {
    localStorage.clear();
  }
}

/**
 * Mask sensitive data for logging
 * @param data - String to mask
 * @param visibleChars - Number of visible characters at start/end
 * @returns Masked string
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars * 2) {
    return '***';
  }

  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const masked = '*'.repeat(Math.max(4, data.length - visibleChars * 2));

  return `${start}${masked}${end}`;
}

/**
 * Check if browser supports required crypto APIs
 */
export function isCryptoSupported(): boolean {
  return !!(
    window.crypto &&
    window.crypto.subtle &&
    window.crypto.getRandomValues
  );
}