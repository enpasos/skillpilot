import assert from 'node:assert/strict'
import type { ClassSession } from '../trainerTypes'
import {
  classifyTrainerClassFileContent,
  decryptTrainerClassFileContent,
  encryptTrainerClassFileContent,
  isValidTrainerClassFilePassword,
  MAX_TRAINER_CLASS_FILE_PASSWORD_BYTES,
  MAX_TRAINER_CLASS_FILE_SIZE,
  MIN_TRAINER_CLASS_FILE_PASSWORD_LENGTH,
  parseLegacyTrainerClassFileContent,
  parseTrainerClassFileEnvelope,
  sanitizeLocalTrainerClassSession,
  TRAINER_CLASS_FILE_EXTENSION,
} from './trainerClassFile'
import { migrateTrainerClassSession } from './trainerLandscapeContext'

const PASSWORD = 'Kurs 9b! Sicher 🔐'
const SAMPLE_ID = '1e506aa5-027d-4f96-b882-84c745bef8b2'
const SAMPLE_SESSION: ClassSession = {
  id: '6d552a95-f0d4-4d43-96f5-10aab5bb1f39',
  name: 'Physik 9b – Kräfte & Energie 🚀',
  landscapeId: 'DE_DEU_S_GYM_CANONICAL_PHYSIK',
  activeFilter: 'DE-HE',
  personalConfig: {
    DE_DEU_S_GYM_CANONICAL: {
      selected: true,
      filterId: 'DE-HE',
      durationModel: 'G9',
      stage: 'SEK_I',
    },
    DE_DEU_S_GYM_CANONICAL_PHYSIK: {
      selected: true,
      filterId: 'ALL',
    },
  },
  rootLandscapeId: 'DE_DEU_S_GYM_CANONICAL',
  students: [
    { id: SAMPLE_ID, name: 'Zoë Müller 😊', accessMode: 'learner-id' },
    { id: '2ca9a344-45b5-4835-9169-cf68128b2e32', name: '李 明' },
  ],
  currentGoalId: 'PHYSIK_9_KRAEFTE',
  source: 'local-generated',
}
const EXISTING_LEARNER_ID = '0d1b63fa-cb42-4435-ae72-15c6d2e27116'
const EXISTING_LEARNER_SESSION: ClassSession = {
  id: 'eb426ca8-991f-49ee-aafe-c096f68f3bd7',
  name: 'Einzelbetreuung',
  landscapeId: 'DE_DEU_S_GYM_CANONICAL_MATHEMATIK',
  activeFilter: 'LK',
  personalConfig: {
    DE_DEU_S_GYM_CANONICAL: {
      selected: true,
      filterId: 'DE-HE',
      durationModel: 'G9',
      stage: 'SEK_II',
    },
    DE_DEU_S_GYM_CANONICAL_MATHEMATIK: {
      selected: true,
      filterId: 'LK',
    },
    DE_DEU_S_GYM_CANONICAL_PHYSIK: {
      selected: true,
      filterId: 'LK',
    },
  },
  rootLandscapeId: 'DE_DEU_S_GYM_CANONICAL',
  students: [{ id: EXISTING_LEARNER_ID, name: 'Alex', accessMode: 'learner-id' }],
  source: 'existing-learner',
}

const rejectionMessage = async (operation: () => Promise<unknown>): Promise<string> => {
  try {
    await operation()
  } catch (error) {
    return (error as Error).message
  }
  assert.fail('Expected operation to reject')
}

const thrownMessage = (operation: () => unknown): string => {
  try {
    operation()
  } catch (error) {
    return (error as Error).message
  }
  assert.fail('Expected operation to throw')
}

assert.equal(TRAINER_CLASS_FILE_EXTENSION, '.skillpilot')
assert.equal(MIN_TRAINER_CLASS_FILE_PASSWORD_LENGTH, 15)
assert.equal(isValidTrainerClassFilePassword('12345678901234'), false)
assert.equal(isValidTrainerClassFilePassword('               '), false)
assert.equal(isValidTrainerClassFilePassword('123456789012345'), true)
assert.equal(isValidTrainerClassFilePassword('🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐'), true)
assert.equal(
  isValidTrainerClassFilePassword('a'.repeat(MAX_TRAINER_CLASS_FILE_PASSWORD_BYTES + 1)),
  false,
)

const firstExport = await encryptTrainerClassFileContent(SAMPLE_SESSION, PASSWORD)
const secondExport = await encryptTrainerClassFileContent(SAMPLE_SESSION, PASSWORD)
const firstEnvelope = parseTrainerClassFileEnvelope(firstExport)
const secondEnvelope = parseTrainerClassFileEnvelope(secondExport)

assert.notEqual(firstExport, secondExport, 'every export must use fresh randomness')
assert.notEqual(firstEnvelope.kdf.salt, secondEnvelope.kdf.salt, 'salt must be fresh')
assert.notEqual(firstEnvelope.cipher.iv, secondEnvelope.cipher.iv, 'IV must be fresh')
assert.equal(firstEnvelope.kdf.iterations, 600_000)
assert.equal(firstEnvelope.kdf.hash, 'SHA-256')
assert.equal(firstEnvelope.cipher.name, 'AES-GCM')
assert.equal(firstEnvelope.cipher.keyLength, 256)
assert.equal(firstEnvelope.cipher.tagLength, 128)
assert.equal(firstExport.includes(SAMPLE_ID), false, 'learner IDs must not be exposed')
assert.equal(firstExport.includes('Zoë Müller'), false, 'student names must not be exposed')
assert.equal(firstExport.includes(PASSWORD), false, 'passwords must not be exposed')
assert.deepEqual(
  await decryptTrainerClassFileContent(firstExport, PASSWORD),
  SAMPLE_SESSION,
  'Unicode and every supported optional field must survive a roundtrip',
)
const existingLearnerExport = await encryptTrainerClassFileContent(
  EXISTING_LEARNER_SESSION,
  PASSWORD,
)
assert.equal(
  existingLearnerExport.includes(EXISTING_LEARNER_ID),
  false,
  'the linked SkillPilot ID must never appear in the encrypted class-file envelope',
)
assert.equal(
  existingLearnerExport.includes('Alex'),
  false,
  'the local learner alias must never appear in the encrypted class-file envelope',
)
assert.deepEqual(
  await decryptTrainerClassFileContent(existingLearnerExport, PASSWORD),
  EXISTING_LEARNER_SESSION,
  'a local existing-learner class must retain all personalized subjects',
)
const canonicalRoundtripSession: ClassSession = {
  ...SAMPLE_SESSION,
  landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
}
const migratedCanonicalRoundtripSession = migrateTrainerClassSession(
  await decryptTrainerClassFileContent(
    await encryptTrainerClassFileContent(canonicalRoundtripSession, PASSWORD),
    PASSWORD,
  ),
)
assert.equal(
  migratedCanonicalRoundtripSession.currentGoalId,
  canonicalRoundtripSession.currentGoalId,
  'current encrypted exports must retain the active goal during canonical migration',
)
assert.deepEqual(
  migrateTrainerClassSession(migratedCanonicalRoundtripSession),
  migratedCanonicalRoundtripSession,
  'migrating a current canonical class must be idempotent',
)
assert.equal(
  migrateTrainerClassSession({
    ...canonicalRoundtripSession,
    landscapeId: '24f2ca0f-b94a-444e-bb70-677cb6f85c02',
  }).currentGoalId,
  undefined,
  'an active goal must still be cleared when a legacy landscape ID actually changes',
)
const composedPassword = 'Sichere Übergabe 2026!'
const decomposedPassword = composedPassword.normalize('NFD')
const normalizedExport = await encryptTrainerClassFileContent(SAMPLE_SESSION, composedPassword)
assert.deepEqual(
  await decryptTrainerClassFileContent(normalizedExport, decomposedPassword),
  SAMPLE_SESSION,
  'visually identical Unicode passwords must work across normalized keyboard input',
)
assert.deepEqual(
  sanitizeLocalTrainerClassSession({
    id: SAMPLE_SESSION.id,
    name: SAMPLE_SESSION.name,
    landscapeId: SAMPLE_SESSION.landscapeId,
    activeFilter: SAMPLE_SESSION.activeFilter,
    students: SAMPLE_SESSION.students.map(student => ({ ...student, accessMode: undefined })),
    personalConfig: undefined,
    rootLandscapeId: undefined,
    currentGoalId: undefined,
    source: undefined,
    linkedSupervision: undefined,
  }),
  {
    id: SAMPLE_SESSION.id,
    name: SAMPLE_SESSION.name,
    landscapeId: SAMPLE_SESSION.landscapeId,
    activeFilter: SAMPLE_SESSION.activeFilter,
    students: SAMPLE_SESSION.students.map(({ id, name }) => ({ id, name })),
  },
  'in-memory undefined optional fields must be omitted rather than breaking old classes',
)

assert.deepEqual(classifyTrainerClassFileContent(firstExport), {
  kind: 'encrypted',
  content: firstExport,
})
assert.equal(
  await rejectionMessage(() => decryptTrainerClassFileContent(firstExport, 'Falsches Passwort')),
  'trainer-class-file-decryption-failed',
)
assert.equal(
  await rejectionMessage(() => decryptTrainerClassFileContent(firstExport, `${PASSWORD} `)),
  'trainer-class-file-decryption-failed',
  'passwords must not be trimmed',
)

const mutateEnvelope = (
  content: string,
  mutation: (envelope: Record<string, unknown>) => void,
): string => {
  const envelope = structuredClone(JSON.parse(content) as Record<string, unknown>)
  mutation(envelope)
  return JSON.stringify(envelope)
}

const tamperedCiphertext = mutateEnvelope(firstExport, envelope => {
  const ciphertext = String(envelope.ciphertext)
  envelope.ciphertext = `${ciphertext[0] === 'A' ? 'B' : 'A'}${ciphertext.slice(1)}`
})
assert.equal(
  await rejectionMessage(() => decryptTrainerClassFileContent(tamperedCiphertext, PASSWORD)),
  'trainer-class-file-decryption-failed',
)

for (const [description, mutated] of [
  ['version', mutateEnvelope(firstExport, envelope => { envelope.version = 2 })],
  ['purpose', mutateEnvelope(firstExport, envelope => { envelope.purpose = 'skillpilot-id' })],
  ['format', mutateEnvelope(firstExport, envelope => { envelope.format = 'plaintext' })],
  ['KDF iterations', mutateEnvelope(firstExport, envelope => {
    ;(envelope.kdf as Record<string, unknown>).iterations = 10_000_000
  })],
  ['KDF name', mutateEnvelope(firstExport, envelope => {
    ;(envelope.kdf as Record<string, unknown>).name = 'scrypt'
  })],
  ['salt size', mutateEnvelope(firstExport, envelope => {
    ;(envelope.kdf as Record<string, unknown>).salt = 'AAAA'
  })],
  ['cipher', mutateEnvelope(firstExport, envelope => {
    ;(envelope.cipher as Record<string, unknown>).name = 'AES-CBC'
  })],
  ['IV size', mutateEnvelope(firstExport, envelope => {
    ;(envelope.cipher as Record<string, unknown>).iv = 'AAAA'
  })],
  ['extra metadata', mutateEnvelope(firstExport, envelope => { envelope.extra = true })],
] as const) {
  assert.equal(
    thrownMessage(() => classifyTrainerClassFileContent(mutated)),
    'invalid-trainer-class-file',
    `${description} must be rejected before password derivation`,
  )
  assert.equal(
    thrownMessage(() => parseLegacyTrainerClassFileContent(mutated)),
    'invalid-trainer-class-file',
    `${description} must never fall back to legacy plaintext`,
  )
}

assert.equal(
  thrownMessage(() => classifyTrainerClassFileContent(`${'x'.repeat(MAX_TRAINER_CLASS_FILE_SIZE)}!`)),
  'invalid-trainer-class-file',
)
assert.equal(
  thrownMessage(() => classifyTrainerClassFileContent(JSON.stringify({
    format: 'skillpilot-password-encrypted',
    id: SAMPLE_SESSION.id,
    name: SAMPLE_SESSION.name,
    landscapeId: SAMPLE_SESSION.landscapeId,
    activeFilter: SAMPLE_SESSION.activeFilter,
    students: SAMPLE_SESSION.students,
  }))),
  'invalid-trainer-class-file',
  'an envelope marker must prevent legacy fallback even when class fields exist',
)

const legacyContent = `\uFEFF${JSON.stringify({
  id: SAMPLE_SESSION.id,
  name: SAMPLE_SESSION.name,
  landscapeId: SAMPLE_SESSION.landscapeId,
  activeFilter: SAMPLE_SESSION.activeFilter,
  students: SAMPLE_SESSION.students.map(({ id, name }) => ({ id, name })),
  currentGoalId: SAMPLE_SESSION.currentGoalId,
})}`
const expectedLegacy = {
  id: SAMPLE_SESSION.id,
  name: SAMPLE_SESSION.name,
  landscapeId: SAMPLE_SESSION.landscapeId,
  activeFilter: SAMPLE_SESSION.activeFilter,
  students: SAMPLE_SESSION.students.map(({ id, name }) => ({ id, name })),
  currentGoalId: SAMPLE_SESSION.currentGoalId,
}
assert.deepEqual(parseLegacyTrainerClassFileContent(legacyContent), expectedLegacy)
assert.deepEqual(classifyTrainerClassFileContent(legacyContent), {
  kind: 'legacy',
  session: expectedLegacy,
})

const linkedBySource = { ...SAMPLE_SESSION, source: 'linked-supervision' }
const linkedByMembership = {
  ...SAMPLE_SESSION,
  students: [{ id: 'opaque-member', name: 'Lernende Person', accessMode: 'teacher-membership' }],
}
const linkedByCapability = {
  ...SAMPLE_SESSION,
  linkedSupervision: {
    workspaceId: 'workspace',
    courseId: 'course',
    memberId: 'member',
    subjects: [],
  },
}
for (const linked of [linkedBySource, linkedByMembership, linkedByCapability]) {
  assert.equal(
    await rejectionMessage(() => encryptTrainerClassFileContent(linked as ClassSession, PASSWORD)),
    'linked-trainer-class-file-not-supported',
  )
  assert.equal(
    thrownMessage(() => parseLegacyTrainerClassFileContent(JSON.stringify(linked))),
    'linked-trainer-class-file-not-supported',
  )
}

for (const invalidExistingLearnerSession of [
  {
    ...EXISTING_LEARNER_SESSION,
    students: [
      ...EXISTING_LEARNER_SESSION.students,
      { id: SAMPLE_ID, name: 'Zweite Person', accessMode: 'learner-id' },
    ],
  },
  {
    ...EXISTING_LEARNER_SESSION,
    students: [{ id: EXISTING_LEARNER_ID, name: 'Alex' }],
  },
  {
    ...EXISTING_LEARNER_SESSION,
    personalConfig: undefined,
  },
  {
    ...EXISTING_LEARNER_SESSION,
    personalConfig: {
      ...EXISTING_LEARNER_SESSION.personalConfig,
      [EXISTING_LEARNER_SESSION.landscapeId]: { selected: false, filterId: 'LK' },
    },
  },
]) {
  assert.equal(
    thrownMessage(() => sanitizeLocalTrainerClassSession(invalidExistingLearnerSession)),
    'invalid-trainer-class-file',
    'existing-learner imports must preserve the one-learner personalized class invariant',
  )
}

assert.equal(
  thrownMessage(() => sanitizeLocalTrainerClassSession({ ...SAMPLE_SESSION, unexpected: true })),
  'invalid-trainer-class-file',
)
assert.equal(
  thrownMessage(() => sanitizeLocalTrainerClassSession({
    ...SAMPLE_SESSION,
    students: [...SAMPLE_SESSION.students, SAMPLE_SESSION.students[0]],
  })),
  'invalid-trainer-class-file',
)
assert.equal(
  await rejectionMessage(() => encryptTrainerClassFileContent(SAMPLE_SESSION, 'kurz')),
  'invalid-trainer-class-file-password',
)

console.log('encrypted trainer class file tests passed')
