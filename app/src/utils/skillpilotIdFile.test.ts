import {
  decryptSkillpilotIdFileContent,
  encryptSkillpilotIdFileContent,
  isValidSkillpilotIdFilePassword,
  MAX_SKILLPILOT_ID_FILE_SIZE,
  MIN_SKILLPILOT_ID_FILE_PASSWORD_LENGTH,
  parseSkillpilotIdFileEnvelope,
  SKILLPILOT_ID_FILE_NAME,
} from './skillpilotIdFile'

const SAMPLE_ID = '1e506aa5-027d-4f96-b882-84c745bef8b2'
const PASSWORD = '4827'

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

const assertInvalidEnvelope = (content: string, message: string) => {
  try {
    parseSkillpilotIdFileEnvelope(content)
  } catch (error) {
    assertEqual((error as Error).message, 'invalid-skillpilot-id-file')
    return
  }
  throw new Error(message)
}

assertEqual(SKILLPILOT_ID_FILE_NAME, 'skillpilot-id.skillpilot')
assertEqual(MIN_SKILLPILOT_ID_FILE_PASSWORD_LENGTH, 4)
assertEqual(isValidSkillpilotIdFilePassword('123'), false)
assertEqual(isValidSkillpilotIdFilePassword('    '), false)
assertEqual(isValidSkillpilotIdFilePassword('1234'), true)
assertEqual(isValidSkillpilotIdFilePassword('🔐🔐🔐🔐'), true)

const firstExport = await encryptSkillpilotIdFileContent(SAMPLE_ID, PASSWORD)
const secondExport = await encryptSkillpilotIdFileContent(SAMPLE_ID, PASSWORD)

assert(firstExport !== secondExport, 'two exports must use fresh salt and IV values')
assert(!firstExport.includes(SAMPLE_ID), 'the encrypted file must not expose the SkillPilot ID')
assert(!firstExport.includes(PASSWORD), 'the encrypted file must not expose the password')
assertEqual(await decryptSkillpilotIdFileContent(firstExport, PASSWORD), SAMPLE_ID)

await assertRejects(
  () => decryptSkillpilotIdFileContent(firstExport, '1739'),
  'a wrong password must fail',
)
await assertRejects(
  () => decryptSkillpilotIdFileContent(firstExport, `${PASSWORD} `),
  'passwords must not be trimmed',
)

const parsedEnvelope = JSON.parse(firstExport) as Record<string, unknown>
const mutateEnvelope = (
  mutation: (envelope: Record<string, unknown>) => void,
): string => {
  const envelope = structuredClone(parsedEnvelope)
  mutation(envelope)
  return JSON.stringify(envelope)
}

assertInvalidEnvelope(SAMPLE_ID, 'a raw UUID must be rejected')
assertInvalidEnvelope(
  JSON.stringify({ skillpilotId: SAMPLE_ID }),
  'a plaintext JSON payload must be rejected',
)
assertInvalidEnvelope(
  `${'x'.repeat(MAX_SKILLPILOT_ID_FILE_SIZE)}!`,
  'an oversized file must be rejected',
)
assertInvalidEnvelope(
  mutateEnvelope(envelope => {
    envelope.version = 2
  }),
  'an unknown version must be rejected',
)
assertInvalidEnvelope(
  mutateEnvelope(envelope => {
    envelope.purpose = 'trainer-class'
  }),
  'a different purpose must be rejected',
)
assertInvalidEnvelope(
  mutateEnvelope(envelope => {
    const kdf = envelope.kdf as Record<string, unknown>
    kdf.iterations = 10_000_000
  }),
  'attacker-controlled KDF iterations must be rejected before derivation',
)
assertInvalidEnvelope(
  mutateEnvelope(envelope => {
    const cipher = envelope.cipher as Record<string, unknown>
    cipher.name = 'AES-CBC'
  }),
  'an unsupported cipher must be rejected',
)
assertInvalidEnvelope(
  mutateEnvelope(envelope => {
    const kdf = envelope.kdf as Record<string, unknown>
    kdf.salt = 'AAAA'
  }),
  'a salt with the wrong length must be rejected',
)
assertInvalidEnvelope(
  mutateEnvelope(envelope => {
    const cipher = envelope.cipher as Record<string, unknown>
    cipher.iv = 'AAAA'
  }),
  'an IV with the wrong length must be rejected',
)

const tamperedCiphertext = mutateEnvelope(envelope => {
  const ciphertext = String(envelope.ciphertext)
  const replacement = ciphertext[0] === 'A' ? 'B' : 'A'
  envelope.ciphertext = `${replacement}${ciphertext.slice(1)}`
})
await assertRejects(
  () => decryptSkillpilotIdFileContent(tamperedCiphertext, PASSWORD),
  'tampered AES-GCM ciphertext must fail authentication',
)

console.log('encrypted SkillPilot ID file tests passed')
