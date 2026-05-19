import { sanitizeSkillpilotId } from './skillpilotId'

const STORAGE_KEY = 'skillpilot_login_profiles_v1'
const PBKDF2_ITERATIONS = 250_000

export interface LocalSkillpilotLoginProfile {
  name: string
  createdAt: string
  updatedAt: string
}

interface StoredEncryptedProfile extends LocalSkillpilotLoginProfile {
  salt: string
  iv: string
  ciphertext: string
}

export interface SkillpilotLoginPayload {
  skillpilotId: string
  selectedLandscapeId?: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, 80)

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

const base64ToBytes = (value: string) => {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

const readStoredProfiles = (): StoredEncryptedProfile[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(profile => typeof profile?.name === 'string') : []
  } catch {
    return []
  }
}

const writeStoredProfiles = (profiles: StoredEncryptedProfile[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

const requireCrypto = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Browser encryption is not available.')
  }
  return globalThis.crypto
}

const deriveKey = async (password: string, salt: Uint8Array) => {
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
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export const listLocalSkillpilotLogins = (): LocalSkillpilotLoginProfile[] => (
  readStoredProfiles()
    .map(({ name, createdAt, updatedAt }) => ({ name, createdAt, updatedAt }))
    .sort((a, b) => a.name.localeCompare(b.name))
)

export const saveLocalSkillpilotLogin = async (
  name: string,
  password: string,
  payload: SkillpilotLoginPayload,
) => {
  const normalizedName = normalizeName(name)
  const normalizedPassword = password.trim()
  const sanitizedId = sanitizeSkillpilotId(payload.skillpilotId)
  if (!normalizedName) {
    throw new Error('Missing login name.')
  }
  if (!normalizedPassword) {
    throw new Error('Missing password.')
  }
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID.')
  }

  const crypto = requireCrypto()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(normalizedPassword, salt)
  const plaintext = encoder.encode(JSON.stringify({
    skillpilotId: sanitizedId,
    selectedLandscapeId: payload.selectedLandscapeId || undefined,
  } satisfies SkillpilotLoginPayload))
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(plaintext),
  ))
  const now = new Date().toISOString()
  const profiles = readStoredProfiles()
  const existing = profiles.find(profile => profile.name === normalizedName)
  const next: StoredEncryptedProfile = {
    name: normalizedName,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ciphertext),
  }

  writeStoredProfiles([
    ...profiles.filter(profile => profile.name !== normalizedName),
    next,
  ])
}

export const loadLocalSkillpilotLogin = async (name: string, password: string): Promise<SkillpilotLoginPayload> => {
  const normalizedName = normalizeName(name)
  const normalizedPassword = password.trim()
  if (!normalizedName || !normalizedPassword) {
    throw new Error('Missing login name or password.')
  }
  const profile = readStoredProfiles().find(entry => entry.name === normalizedName)
  if (!profile) {
    throw new Error('Login profile not found.')
  }

  const salt = base64ToBytes(profile.salt)
  const iv = base64ToBytes(profile.iv)
  const key = await deriveKey(normalizedPassword, salt)
  const decrypted = await requireCrypto().subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(base64ToBytes(profile.ciphertext)),
  )
  const parsed = JSON.parse(decoder.decode(decrypted)) as SkillpilotLoginPayload
  const sanitizedId = sanitizeSkillpilotId(parsed.skillpilotId)
  if (!sanitizedId) {
    throw new Error('Stored SkillPilot ID is invalid.')
  }
  return {
    skillpilotId: sanitizedId,
    selectedLandscapeId: parsed.selectedLandscapeId || undefined,
  }
}

export const deleteLocalSkillpilotLogin = (name: string) => {
  const normalizedName = normalizeName(name)
  if (!normalizedName) return
  writeStoredProfiles(readStoredProfiles().filter(profile => profile.name !== normalizedName))
}
