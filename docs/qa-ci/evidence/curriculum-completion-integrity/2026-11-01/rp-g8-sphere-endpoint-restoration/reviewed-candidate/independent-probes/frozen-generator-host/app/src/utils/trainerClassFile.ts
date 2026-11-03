import type {
  ClassSession,
  StudentMapping,
  TrainerClassCurriculumConfig,
  TrainerClassCurriculumConfigEntry,
} from '../trainerTypes'
import {
  canonicalBase64ToBytes,
  decryptBytesWithPassword,
  encryptBytesWithPassword,
} from './passwordEncryption'

export const TRAINER_CLASS_FILE_EXTENSION = '.skillpilot'
export const MAX_TRAINER_CLASS_FILE_SIZE = 8 * 1024 * 1024
export const MIN_TRAINER_CLASS_FILE_PASSWORD_LENGTH = 15
export const MAX_TRAINER_CLASS_FILE_PASSWORD_BYTES = 1024

const FILE_FORMAT = 'skillpilot-password-encrypted'
const FILE_VERSION = 1
const FILE_PURPOSE = 'trainer-class'
const FILE_KDF_NAME = 'PBKDF2'
const FILE_KDF_HASH = 'SHA-256'
const FILE_KDF_ITERATIONS = 600_000
const FILE_CIPHER_NAME = 'AES-GCM'
const FILE_CIPHER_KEY_LENGTH = 256
const FILE_CIPHER_TAG_LENGTH = 128
const FILE_SALT_LENGTH = 16
const FILE_IV_LENGTH = 12

const PAYLOAD_FORMAT = 'skillpilot-trainer-class'
const PAYLOAD_VERSION = 1
const MAX_TRAINER_CLASS_PAYLOAD_SIZE = 5 * 1024 * 1024
const MAX_CLASS_STUDENTS = 10_000
const MAX_PERSONAL_CONFIG_ENTRIES = 2_000
const MAX_SHORT_FIELD_BYTES = 1024
const MAX_NAME_FIELD_BYTES = 4096

const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })
const additionalData = encoder.encode(
  'SkillPilot\0password-envelope\0v1\0trainer-class'
  + '\0PBKDF2-SHA-256-600000\0AES-256-GCM-128\0payload-v1',
)

export interface TrainerClassFileEnvelope {
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

interface TrainerClassFilePayload {
  format: typeof PAYLOAD_FORMAT
  version: typeof PAYLOAD_VERSION
  session: ClassSession
}

export type TrainerClassFileClassification =
  | { kind: 'encrypted'; content: string }
  | { kind: 'legacy'; session: ClassSession }

const invalidFile = (): never => {
  throw new Error('invalid-trainer-class-file')
}

const linkedSession = (): never => {
  throw new Error('linked-trainer-class-file-not-supported')
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const hasExactKeys = (value: Record<string, unknown>, expected: readonly string[]): boolean => {
  const actual = Object.keys(value).sort()
  const sortedExpected = [...expected].sort()
  return actual.length === sortedExpected.length
    && sortedExpected.every((key, index) => actual[index] === key)
}

const hasOnlyKeys = (value: Record<string, unknown>, allowed: ReadonlySet<string>): boolean => (
  Object.keys(value).every(key => allowed.has(key))
)

const hasOwn = (value: Record<string, unknown>, key: string): boolean => (
  Object.prototype.hasOwnProperty.call(value, key)
)

const hasForbiddenControlCharacter = (value: string): boolean => Array.from(value).some(character => {
  const codePoint = character.codePointAt(0) ?? 0
  return (codePoint <= 0x1f && codePoint !== 0x09 && codePoint !== 0x0a && codePoint !== 0x0d)
    || codePoint === 0x7f
})

const requireBoundedString = (
  value: unknown,
  maxBytes = MAX_SHORT_FIELD_BYTES,
): string => {
  if (typeof value !== 'string') return invalidFile()
  if (
    value.length === 0
    || encoder.encode(value).byteLength > maxBytes
    || hasForbiddenControlCharacter(value)
  ) {
    return invalidFile()
  }
  return value
}

const optionalBoundedString = (
  record: Record<string, unknown>,
  key: string,
  maxBytes = MAX_SHORT_FIELD_BYTES,
): string | undefined => (
  hasOwn(record, key) && record[key] !== undefined
    ? requireBoundedString(record[key], maxBytes)
    : undefined
)

const sanitizeStudent = (value: unknown): StudentMapping => {
  const student = isRecord(value) ? value : invalidFile()
  if (!hasOnlyKeys(student, new Set(['id', 'name', 'accessMode']))) invalidFile()

  const accessMode = optionalBoundedString(student, 'accessMode')
  if (accessMode === 'teacher-membership') linkedSession()
  if (accessMode !== undefined && accessMode !== 'learner-id') return invalidFile()

  return {
    id: requireBoundedString(student.id),
    name: requireBoundedString(student.name, MAX_NAME_FIELD_BYTES),
    ...(accessMode ? { accessMode } : {}),
  }
}

const sanitizePersonalConfigEntry = (value: unknown): TrainerClassCurriculumConfigEntry => {
  const entry = isRecord(value) ? value : invalidFile()
  if (!hasOnlyKeys(entry, new Set(['selected', 'filterId', 'durationModel', 'stage']))) {
    invalidFile()
  }
  if (typeof entry.selected !== 'boolean') return invalidFile()
  const selected = entry.selected

  const filterId = optionalBoundedString(entry, 'filterId')
  const durationModel = optionalBoundedString(entry, 'durationModel')
  const stage = optionalBoundedString(entry, 'stage')
  return {
    selected,
    ...(filterId !== undefined ? { filterId } : {}),
    ...(durationModel !== undefined ? { durationModel } : {}),
    ...(stage !== undefined ? { stage } : {}),
  }
}

const sanitizePersonalConfig = (value: unknown): TrainerClassCurriculumConfig => {
  const config = isRecord(value) ? value : invalidFile()
  const entries = Object.entries(config)
  if (entries.length > MAX_PERSONAL_CONFIG_ENTRIES) invalidFile()

  const sanitized: TrainerClassCurriculumConfig = {}
  for (const [landscapeId, entry] of entries) {
    if (
      landscapeId === '__proto__'
      || landscapeId === 'prototype'
      || landscapeId === 'constructor'
    ) {
      invalidFile()
    }
    const sanitizedLandscapeId = requireBoundedString(landscapeId)
    sanitized[sanitizedLandscapeId] = sanitizePersonalConfigEntry(entry)
  }
  return sanitized
}

/**
 * Copies a local class into the current public ClassSession shape. Unknown
 * fields are rejected so decrypted or legacy input cannot smuggle capabilities
 * or objects into browser storage.
 */
export const sanitizeLocalTrainerClassSession = (value: unknown): ClassSession => {
  const session = isRecord(value) ? value : invalidFile()
  const allowedKeys = new Set([
    'id',
    'name',
    'landscapeId',
    'activeFilter',
    'personalConfig',
    'rootLandscapeId',
    'students',
    'currentGoalId',
    'source',
    'linkedSupervision',
  ])
  if (!hasOnlyKeys(session, allowedKeys)) invalidFile()
  if (session.linkedSupervision !== undefined) linkedSession()

  const source = optionalBoundedString(session, 'source')
  if (source === 'linked-supervision') linkedSession()
  if (
    source !== undefined
    && source !== 'local-generated'
    && source !== 'existing-learner'
  ) return invalidFile()

  const studentValues = session.students
  if (!Array.isArray(studentValues) || studentValues.length > MAX_CLASS_STUDENTS) {
    return invalidFile()
  }
  const students = studentValues.map(sanitizeStudent)
  const studentIds = new Set(students.map(student => student.id))
  if (studentIds.size !== students.length) invalidFile()

  const personalConfig = hasOwn(session, 'personalConfig') && session.personalConfig !== undefined
    ? sanitizePersonalConfig(session.personalConfig)
    : undefined
  const rootLandscapeId = optionalBoundedString(session, 'rootLandscapeId')
  const currentGoalId = optionalBoundedString(session, 'currentGoalId')

  if (
    source === 'existing-learner'
    && (
      students.length !== 1
      || students[0]?.accessMode !== 'learner-id'
      || personalConfig === undefined
      || personalConfig[requireBoundedString(session.landscapeId)]?.selected !== true
    )
  ) {
    invalidFile()
  }

  return {
    id: requireBoundedString(session.id),
    name: requireBoundedString(session.name, MAX_NAME_FIELD_BYTES),
    landscapeId: requireBoundedString(session.landscapeId),
    activeFilter: requireBoundedString(session.activeFilter),
    ...(personalConfig !== undefined ? { personalConfig } : {}),
    ...(rootLandscapeId !== undefined ? { rootLandscapeId } : {}),
    students,
    ...(currentGoalId !== undefined ? { currentGoalId } : {}),
    ...(source !== undefined ? { source } : {}),
  }
}

const normalizeTrainerClassFilePassword = (password: string): string => password.normalize('NFC')

export const isValidTrainerClassFilePassword = (password: string): boolean => {
  const normalizedPassword = normalizeTrainerClassFilePassword(password)
  const characterLength = Array.from(normalizedPassword).length
  const byteLength = encoder.encode(normalizedPassword).byteLength
  return characterLength >= MIN_TRAINER_CLASS_FILE_PASSWORD_LENGTH
    && byteLength <= MAX_TRAINER_CLASS_FILE_PASSWORD_BYTES
    && normalizedPassword.trim().length > 0
}

const requireFileSize = (content: string): void => {
  if (encoder.encode(content).byteLength > MAX_TRAINER_CLASS_FILE_SIZE) invalidFile()
}

const parseJsonFile = (content: string): unknown => {
  requireFileSize(content)
  try {
    return JSON.parse(content.replace(/^\uFEFF/u, ''))
  } catch {
    return invalidFile()
  }
}

const looksLikeEncryptedEnvelope = (value: unknown): boolean => {
  if (!isRecord(value)) return false
  return [
    'format',
    'version',
    'purpose',
    'kdf',
    'cipher',
    'ciphertext',
  ].some(key => hasOwn(value, key))
}

const parseEnvelopeValue = (value: unknown): TrainerClassFileEnvelope => {
  const envelope = isRecord(value) ? value : invalidFile()
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
    || typeof cipher.iv !== 'string'
    || typeof envelope.ciphertext !== 'string'
  ) {
    invalidFile()
  }
  const saltValue = typeof kdf.salt === 'string' ? kdf.salt : invalidFile()
  const ivValue = typeof cipher.iv === 'string' ? cipher.iv : invalidFile()
  const ciphertextValue = typeof envelope.ciphertext === 'string'
    ? envelope.ciphertext
    : invalidFile()

  try {
    const salt = canonicalBase64ToBytes(saltValue)
    const iv = canonicalBase64ToBytes(ivValue)
    const ciphertext = canonicalBase64ToBytes(ciphertextValue)
    if (
      salt.byteLength !== FILE_SALT_LENGTH
      || iv.byteLength !== FILE_IV_LENGTH
      || ciphertext.byteLength < FILE_CIPHER_TAG_LENGTH / 8 + 1
      || ciphertext.byteLength > MAX_TRAINER_CLASS_PAYLOAD_SIZE + FILE_CIPHER_TAG_LENGTH / 8
    ) {
      invalidFile()
    }
  } catch {
    invalidFile()
  }
  return envelope as unknown as TrainerClassFileEnvelope
}

export const parseTrainerClassFileEnvelope = (
  content: string,
): TrainerClassFileEnvelope => parseEnvelopeValue(parseJsonFile(content))

const parsePayload = (plaintext: Uint8Array): ClassSession => {
  if (plaintext.byteLength > MAX_TRAINER_CLASS_PAYLOAD_SIZE) invalidFile()
  let payload: unknown
  try {
    payload = JSON.parse(decoder.decode(plaintext))
  } catch {
    invalidFile()
  }
  const parsed = isRecord(payload) ? payload : invalidFile()
  if (
    !hasExactKeys(parsed, ['format', 'version', 'session'])
    || parsed.format !== PAYLOAD_FORMAT
    || parsed.version !== PAYLOAD_VERSION
  ) {
    invalidFile()
  }
  return sanitizeLocalTrainerClassSession(parsed.session)
}

export const encryptTrainerClassFileContent = async (
  session: ClassSession,
  password: string,
): Promise<string> => {
  const normalizedPassword = normalizeTrainerClassFilePassword(password)
  if (!isValidTrainerClassFilePassword(normalizedPassword)) {
    throw new Error('invalid-trainer-class-file-password')
  }
  const sanitizedSession = sanitizeLocalTrainerClassSession(session)
  const plaintext = encoder.encode(JSON.stringify({
    format: PAYLOAD_FORMAT,
    version: PAYLOAD_VERSION,
    session: sanitizedSession,
  } satisfies TrainerClassFilePayload))
  if (plaintext.byteLength > MAX_TRAINER_CLASS_PAYLOAD_SIZE) invalidFile()

  const encrypted = await encryptBytesWithPassword(plaintext, normalizedPassword, {
    iterations: FILE_KDF_ITERATIONS,
    additionalData,
    saltLength: FILE_SALT_LENGTH,
    ivLength: FILE_IV_LENGTH,
  })
  const envelope: TrainerClassFileEnvelope = {
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
  const content = `${JSON.stringify(envelope, null, 2)}\n`
  requireFileSize(content)
  return content
}

export const decryptTrainerClassFileContent = async (
  content: string,
  password: string,
): Promise<ClassSession> => {
  const normalizedPassword = normalizeTrainerClassFilePassword(password)
  if (!isValidTrainerClassFilePassword(normalizedPassword)) {
    throw new Error('invalid-trainer-class-file-password')
  }
  const envelope = parseTrainerClassFileEnvelope(content)
  let plaintext: Uint8Array
  try {
    plaintext = await decryptBytesWithPassword(
      {
        salt: envelope.kdf.salt,
        iv: envelope.cipher.iv,
        ciphertext: envelope.ciphertext,
      },
      normalizedPassword,
      {
        iterations: FILE_KDF_ITERATIONS,
        additionalData,
      },
    )
  } catch (error) {
    if ((error as Error).message === 'browser-encryption-unavailable') throw error
    throw new Error('trainer-class-file-decryption-failed')
  }
  return parsePayload(plaintext)
}

export const parseLegacyTrainerClassFileContent = (content: string): ClassSession => {
  const parsed = parseJsonFile(content)
  if (looksLikeEncryptedEnvelope(parsed)) invalidFile()
  return sanitizeLocalTrainerClassSession(parsed)
}

export const classifyTrainerClassFileContent = (
  content: string,
): TrainerClassFileClassification => {
  const parsed = parseJsonFile(content)
  if (looksLikeEncryptedEnvelope(parsed)) {
    parseEnvelopeValue(parsed)
    return { kind: 'encrypted', content }
  }
  return { kind: 'legacy', session: sanitizeLocalTrainerClassSession(parsed) }
}
