import {
  deleteLocalSkillpilotLogin,
  listLocalSkillpilotLogins,
  loadLocalSkillpilotLogin,
  saveLocalSkillpilotLogin,
} from './localSkillpilotLogin'

const STORAGE_KEY = 'skillpilot_login_profiles_v1'
const SAMPLE_ID = '1e506aa5-027d-4f96-b882-84c745bef8b2'
const SECOND_ID = '507e0902-93ee-4767-b6e8-1ec8afb12acb'
const PASSWORD = ' legacy password '

const assertEqual = (actual: unknown, expected: unknown, message?: string) => {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, received ${String(actual)}`)
  }
}

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const assertRejects = async (
  operation: () => Promise<unknown>,
  message: string,
) => {
  try {
    await operation()
  } catch {
    return
  }
  throw new Error(message)
}

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, String(value))
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  clear() {
    this.values.clear()
  }
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
const localStorage = new MemoryStorage()
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: { localStorage },
})

try {
  await saveLocalSkillpilotLogin('Mein SkillPilot', PASSWORD, {
    skillpilotId: SAMPLE_ID,
    selectedLandscapeId: 'DE_GYMNASIUM',
  })
  const stored = localStorage.getItem(STORAGE_KEY) ?? ''
  assert(!stored.includes(SAMPLE_ID), 'local encrypted profiles must not expose the SkillPilot ID')
  assert(!stored.includes(PASSWORD), 'local encrypted profiles must not expose the password')
  assertEqual(listLocalSkillpilotLogins().length, 1)
  assertEqual(listLocalSkillpilotLogins()[0]?.name, 'Mein SkillPilot')

  const loaded = await loadLocalSkillpilotLogin('Mein SkillPilot', PASSWORD)
  assertEqual(loaded.skillpilotId, SAMPLE_ID)
  assertEqual(loaded.selectedLandscapeId, 'DE_GYMNASIUM')
  await assertRejects(
    () => loadLocalSkillpilotLogin('Mein SkillPilot', 'wrong password'),
    'a wrong local-profile password must fail',
  )

  const beforeOverwrite = JSON.parse(stored) as Array<Record<string, unknown>>
  await saveLocalSkillpilotLogin('Mein SkillPilot', PASSWORD, {
    skillpilotId: SECOND_ID,
  })
  const afterOverwrite = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Array<Record<string, unknown>>
  assertEqual(afterOverwrite.length, 1)
  assertEqual(afterOverwrite[0]?.createdAt, beforeOverwrite[0]?.createdAt)
  assertEqual(
    (await loadLocalSkillpilotLogin('Mein SkillPilot', PASSWORD)).skillpilotId,
    SECOND_ID,
  )

  const tampered = structuredClone(afterOverwrite)
  const ciphertext = String(tampered[0]?.ciphertext)
  tampered[0]!.ciphertext = `${ciphertext[0] === 'A' ? 'B' : 'A'}${ciphertext.slice(1)}`
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tampered))
  await assertRejects(
    () => loadLocalSkillpilotLogin('Mein SkillPilot', PASSWORD),
    'tampered local-profile ciphertext must fail authentication',
  )

  deleteLocalSkillpilotLogin('Mein SkillPilot')
  assertEqual(listLocalSkillpilotLogins().length, 0)
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, 'window', originalWindow)
  } else {
    Reflect.deleteProperty(globalThis, 'window')
  }
}

console.log('local SkillPilot login encryption tests passed')
