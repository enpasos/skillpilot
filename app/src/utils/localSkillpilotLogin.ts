import { sanitizeSkillpilotId } from './skillpilotId'
import {
  decryptBytesWithPassword,
  encryptBytesWithPassword,
} from './passwordEncryption'

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

const decoder = new TextDecoder()

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, 80)

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

  const plaintext = new TextEncoder().encode(JSON.stringify({
    skillpilotId: sanitizedId,
    selectedLandscapeId: payload.selectedLandscapeId || undefined,
  } satisfies SkillpilotLoginPayload))
  const encrypted = await encryptBytesWithPassword(plaintext, normalizedPassword, {
    iterations: PBKDF2_ITERATIONS,
  })
  const now = new Date().toISOString()
  const profiles = readStoredProfiles()
  const existing = profiles.find(profile => profile.name === normalizedName)
  const next: StoredEncryptedProfile = {
    name: normalizedName,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    salt: encrypted.salt,
    iv: encrypted.iv,
    ciphertext: encrypted.ciphertext,
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

  const decrypted = await decryptBytesWithPassword(
    {
      salt: profile.salt,
      iv: profile.iv,
      ciphertext: profile.ciphertext,
    },
    normalizedPassword,
    { iterations: PBKDF2_ITERATIONS },
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
