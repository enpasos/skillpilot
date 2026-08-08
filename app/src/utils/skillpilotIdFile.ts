import {
  canonicalBase64ToBytes,
  decryptBytesWithPassword,
  encryptBytesWithPassword,
} from './passwordEncryption'
import { sanitizeSkillpilotId } from './skillpilotId'

export const SKILLPILOT_ID_FILE_NAME = 'skillpilot-id.skillpilot'
export const MAX_SKILLPILOT_ID_FILE_SIZE = 4096
export const MIN_SKILLPILOT_ID_FILE_PASSWORD_LENGTH = 4
export const MAX_SKILLPILOT_ID_FILE_PASSWORD_BYTES = 1024

const FILE_FORMAT = 'skillpilot-password-encrypted'
const FILE_VERSION = 1
const FILE_PURPOSE = 'skillpilot-id'
const FILE_KDF_NAME = 'PBKDF2'
const FILE_KDF_HASH = 'SHA-256'
const FILE_KDF_ITERATIONS = 600_000
const FILE_CIPHER_NAME = 'AES-GCM'
const FILE_CIPHER_KEY_LENGTH = 256
const FILE_CIPHER_TAG_LENGTH = 128
const FILE_SALT_LENGTH = 16
const FILE_IV_LENGTH = 12
const MAX_FILE_CIPHERTEXT_LENGTH = 1024

const PAYLOAD_FORMAT = 'skillpilot-id'
const PAYLOAD_VERSION = 1
const SKILLPILOT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu

const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })
const additionalData = encoder.encode(
  'SkillPilot\0password-envelope\0v1\0skillpilot-id'
  + '\0PBKDF2-SHA-256-600000\0AES-256-GCM-128',
)

interface SkillpilotIdFileEnvelope {
  format: typeof FILE_FORMAT
  version: typeof FILE_VERSION
  purpose: typeof FILE_PURPOSE
  kdf: {
    name: typeof FILE_KDF_NAME
    hash: typeof FILE_KDF_HASH
    iterations: typeof FILE_KDF_ITERATIONS
    salt: string
  }
  cipher: {
    name: typeof FILE_CIPHER_NAME
    keyLength: typeof FILE_CIPHER_KEY_LENGTH
    tagLength: typeof FILE_CIPHER_TAG_LENGTH
    iv: string
  }
  ciphertext: string
}

interface SkillpilotIdFilePayload {
  format: typeof PAYLOAD_FORMAT
  version: typeof PAYLOAD_VERSION
  skillpilotId: string
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const hasExactKeys = (value: Record<string, unknown>, expected: string[]) => {
  const actual = Object.keys(value).sort()
  return actual.length === expected.length
    && expected.slice().sort().every((key, index) => actual[index] === key)
}

const invalidFile = (): never => {
  throw new Error('invalid-skillpilot-id-file')
}

const requireString = (value: unknown): string => (
  typeof value === 'string' ? value : invalidFile()
)

const requireValidSkillpilotId = (value: unknown): string => {
  const rawSkillpilotId = requireString(value)
  const skillpilotId = sanitizeSkillpilotId(rawSkillpilotId)
  if (!SKILLPILOT_ID_PATTERN.test(skillpilotId)) invalidFile()
  return skillpilotId
}

export const isValidSkillpilotIdFilePassword = (password: string): boolean => {
  const characterLength = Array.from(password).length
  const byteLength = encoder.encode(password).byteLength
  return characterLength >= MIN_SKILLPILOT_ID_FILE_PASSWORD_LENGTH
    && byteLength <= MAX_SKILLPILOT_ID_FILE_PASSWORD_BYTES
    && password.trim().length > 0
}

export const parseSkillpilotIdFileEnvelope = (
  content: string,
): SkillpilotIdFileEnvelope => {
  if (encoder.encode(content).byteLength > MAX_SKILLPILOT_ID_FILE_SIZE) invalidFile()

  let parsed: unknown
  try {
    parsed = JSON.parse(content.replace(/^\uFEFF/u, ''))
  } catch {
    invalidFile()
  }
  const envelope = isRecord(parsed) ? parsed : invalidFile()
  if (!hasExactKeys(
    envelope,
    ['format', 'version', 'purpose', 'kdf', 'cipher', 'ciphertext'],
  )) {
    invalidFile()
  }
  const kdf = isRecord(envelope.kdf) ? envelope.kdf : invalidFile()
  const cipher = isRecord(envelope.cipher) ? envelope.cipher : invalidFile()
  if (
    envelope.format !== FILE_FORMAT
    || envelope.version !== FILE_VERSION
    || envelope.purpose !== FILE_PURPOSE
    || !hasExactKeys(kdf, ['name', 'hash', 'iterations', 'salt'])
    || kdf.name !== FILE_KDF_NAME
    || kdf.hash !== FILE_KDF_HASH
    || kdf.iterations !== FILE_KDF_ITERATIONS
    || typeof kdf.salt !== 'string'
    || !hasExactKeys(cipher, ['name', 'keyLength', 'tagLength', 'iv'])
    || cipher.name !== FILE_CIPHER_NAME
    || cipher.keyLength !== FILE_CIPHER_KEY_LENGTH
    || cipher.tagLength !== FILE_CIPHER_TAG_LENGTH
  ) {
    invalidFile()
  }
  const encodedSalt = requireString(kdf.salt)
  const encodedIv = requireString(cipher.iv)
  const encodedCiphertext = requireString(envelope.ciphertext)

  try {
    const salt = canonicalBase64ToBytes(encodedSalt)
    const iv = canonicalBase64ToBytes(encodedIv)
    const ciphertext = canonicalBase64ToBytes(encodedCiphertext)
    if (
      salt.byteLength !== FILE_SALT_LENGTH
      || iv.byteLength !== FILE_IV_LENGTH
      || ciphertext.byteLength < 17
      || ciphertext.byteLength > MAX_FILE_CIPHERTEXT_LENGTH
    ) {
      invalidFile()
    }
  } catch {
    invalidFile()
  }

  return envelope as unknown as SkillpilotIdFileEnvelope
}

export const encryptSkillpilotIdFileContent = async (
  skillpilotId: string,
  password: string,
): Promise<string> => {
  const sanitizedId = requireValidSkillpilotId(skillpilotId)
  if (!isValidSkillpilotIdFilePassword(password)) {
    throw new Error('invalid-skillpilot-id-file-password')
  }

  const plaintext = encoder.encode(JSON.stringify({
    format: PAYLOAD_FORMAT,
    version: PAYLOAD_VERSION,
    skillpilotId: sanitizedId,
  } satisfies SkillpilotIdFilePayload))
  const encrypted = await encryptBytesWithPassword(plaintext, password, {
    iterations: FILE_KDF_ITERATIONS,
    additionalData,
    saltLength: FILE_SALT_LENGTH,
    ivLength: FILE_IV_LENGTH,
  })
  const envelope: SkillpilotIdFileEnvelope = {
    format: FILE_FORMAT,
    version: FILE_VERSION,
    purpose: FILE_PURPOSE,
    kdf: {
      name: FILE_KDF_NAME,
      hash: FILE_KDF_HASH,
      iterations: FILE_KDF_ITERATIONS,
      salt: encrypted.salt,
    },
    cipher: {
      name: FILE_CIPHER_NAME,
      keyLength: FILE_CIPHER_KEY_LENGTH,
      tagLength: FILE_CIPHER_TAG_LENGTH,
      iv: encrypted.iv,
    },
    ciphertext: encrypted.ciphertext,
  }
  return `${JSON.stringify(envelope, null, 2)}\n`
}

export const decryptSkillpilotIdFileContent = async (
  content: string,
  password: string,
): Promise<string> => {
  if (!isValidSkillpilotIdFilePassword(password)) {
    throw new Error('invalid-skillpilot-id-file-password')
  }
  const envelope = parseSkillpilotIdFileEnvelope(content)
  const plaintext = await decryptBytesWithPassword(
    {
      salt: envelope.kdf.salt,
      iv: envelope.cipher.iv,
      ciphertext: envelope.ciphertext,
    },
    password,
    {
      iterations: FILE_KDF_ITERATIONS,
      additionalData,
    },
  )

  let payload: unknown
  try {
    payload = JSON.parse(decoder.decode(plaintext))
  } catch {
    invalidFile()
  }
  const parsedPayload = isRecord(payload) ? payload : invalidFile()
  if (
    !hasExactKeys(parsedPayload, ['format', 'version', 'skillpilotId'])
    || parsedPayload.format !== PAYLOAD_FORMAT
    || parsedPayload.version !== PAYLOAD_VERSION
  ) {
    invalidFile()
  }
  return requireValidSkillpilotId(parsedPayload.skillpilotId)
}
