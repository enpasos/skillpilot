import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const contractPath = (version: 'v1' | 'v2') => fileURLToPath(new URL(
  `../../contracts/goal-evidence/${version}/goal-public-feedback.schema.json`,
  import.meta.url,
))

const v1Schema = JSON.parse(await readFile(contractPath('v1'), 'utf8')) as Record<string, unknown>
const v2Schema = JSON.parse(await readFile(contractPath('v2'), 'utf8')) as Record<string, unknown>
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(v2Schema)

const digest = (character: string) => `sha256:${character.repeat(64)}`
const envelope = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-public-feedback.schema.json',
  schemaVersion: 2,
  context: {
    goalId: 'goal-a',
    goalFingerprint: digest('a'),
    pageFingerprint: digest('b'),
    bookId: 'de-gym-mathematik-bundesweit',
    bookEdition: 'curricular-atomic-v1',
    bookDigest: digest('c'),
    locale: 'de-DE',
    scopeLabel: 'Gymnasium Mathematik bundesweit',
    pageNumber: 42,
    canonicalUrl: 'https://skillpilot.com/lernzielbuch#goal-goal-a',
    publicationManifestFingerprint: digest('d'),
  },
  feedback: {
    category: 'source_assignment',
    observation: 'Die angegebene Quelle trägt die konkrete Kompetenz nicht.',
    evidence: 'Die bezeichnete Passage behandelt ausschließlich einen anderen Inhaltsbereich.',
    proposedImprovement: 'Die Zuordnung fachlich prüfen und gegebenenfalls enger belegen.',
    sourceReference: 'Amtliches Dokument, Abschnitt 3.2, Seite 17.',
    reviewerRole: 'teacher',
  },
  privacyAcknowledged: true,
  automatedProcessingAcknowledged: true,
}

assert.equal(validate(envelope), true, JSON.stringify(validate.errors))

const minimalEnvelope = {
  ...envelope,
  feedback: {
    category: 'factual_error',
    observation: 'Die Aussage ist im angegebenen Zahlenbereich falsch.',
  },
}
assert.equal(validate(minimalEnvelope), true, JSON.stringify(validate.errors))

const categories = [
  'factual_error',
  'wording_or_language',
  'missing_or_overbroad_goal',
  'prerequisite_or_sequence',
  'chapter_structure',
  'scope_or_applicability',
  'source_assignment',
  'visualization_or_accessibility',
  'other',
]
categories.forEach((category) => {
  assert.equal(validate({ ...minimalEnvelope, feedback: { ...minimalEnvelope.feedback, category } }), true)
})

const v1Properties = v1Schema.properties as Record<string, unknown>
const v2Properties = v2Schema.properties as Record<string, unknown>
assert.deepEqual(v2Properties.context, v1Properties.context, 'V2 must preserve the complete V1 server-derived context')

assert.equal(validate({ ...envelope, automatedProcessingAcknowledged: false }), false)
assert.equal(validate({ ...envelope, privacyAcknowledged: false }), false)
assert.equal(validate({ ...envelope, learnerId: 'forbidden' }), false)
assert.equal(validate({ ...envelope, feedback: { ...envelope.feedback, category: 'visual_cue' } }), false)
assert.equal(validate({ ...envelope, feedback: { ...envelope.feedback, observation: '' } }), false)
assert.equal(validate({ ...envelope, feedback: { ...envelope.feedback, evidence: '' } }), false)
assert.equal(validate({ ...envelope, feedback: { ...envelope.feedback, evidence: '   ' } }), false)
assert.equal(validate({ ...envelope, feedback: { ...envelope.feedback, proposedImprovement: 'x'.repeat(4001) } }), false)
assert.equal(validate({ ...envelope, feedback: { ...envelope.feedback, reviewerRole: 'administrator' } }), false)
assert.equal(validate({
  ...envelope,
  context: { ...envelope.context, sessionId: 'forbidden' },
}), false)

console.log('Goal-public-feedback V2 contract tests passed.')
