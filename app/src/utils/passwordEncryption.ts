export interface PasswordEncryptedBytes {
  salt: string
  iv: string
  ciphertext: string
}

interface PasswordEncryptionOptions {
  iterations: number
  additionalData?: Uint8Array
  saltLength?: number
  ivLength?: number
}

const encoder = new TextEncoder()

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

const requireCrypto = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('browser-encryption-unavailable')
  }
  return globalThis.crypto
}

const requireIterations = (iterations: number) => {
  if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > 10_000_000) {
    throw new Error('invalid-password-encryption-iterations')
  }
}

export const bytesToCanonicalBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export const canonicalBase64ToBytes = (value: string): Uint8Array => {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.length % 4 !== 0
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(value)
  ) {
    throw new Error('invalid-password-encryption-base64')
  }

  try {
    const binary = atob(value)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }
    if (bytesToCanonicalBase64(bytes) !== value) {
      throw new Error('invalid-password-encryption-base64')
    }
    return bytes
  } catch {
    throw new Error('invalid-password-encryption-base64')
  }
}

const deriveKey = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> => {
  requireIterations(iterations)
  const crypto = requireCrypto()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(encoder.encode(password)),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

const aesGcmParameters = (
  iv: Uint8Array,
  additionalData?: Uint8Array,
): AesGcmParams => ({
  name: 'AES-GCM',
  iv: toArrayBuffer(iv),
  tagLength: 128,
  ...(additionalData
    ? { additionalData: toArrayBuffer(additionalData) }
    : {}),
})

export const encryptBytesWithPassword = async (
  plaintext: Uint8Array,
  password: string,
  options: PasswordEncryptionOptions,
): Promise<PasswordEncryptedBytes> => {
  const crypto = requireCrypto()
  const salt = crypto.getRandomValues(new Uint8Array(options.saltLength ?? 16))
  const iv = crypto.getRandomValues(new Uint8Array(options.ivLength ?? 12))
  const key = await deriveKey(password, salt, options.iterations)
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    aesGcmParameters(iv, options.additionalData),
    key,
    toArrayBuffer(plaintext),
  ))
  return {
    salt: bytesToCanonicalBase64(salt),
    iv: bytesToCanonicalBase64(iv),
    ciphertext: bytesToCanonicalBase64(ciphertext),
  }
}

export const decryptBytesWithPassword = async (
  encrypted: PasswordEncryptedBytes,
  password: string,
  options: PasswordEncryptionOptions,
): Promise<Uint8Array> => {
  const salt = canonicalBase64ToBytes(encrypted.salt)
  const iv = canonicalBase64ToBytes(encrypted.iv)
  const ciphertext = canonicalBase64ToBytes(encrypted.ciphertext)
  const key = await deriveKey(password, salt, options.iterations)
  const plaintext = await requireCrypto().subtle.decrypt(
    aesGcmParameters(iv, options.additionalData),
    key,
    toArrayBuffer(ciphertext),
  )
  return new Uint8Array(plaintext)
}
