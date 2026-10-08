// Apache-2.0. Technical candidate verification, not a substantive review.
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const directory = dirname(fileURLToPath(import.meta.url))
const root = resolve(directory, '../../../../../../..')
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const hash = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const goals = JSON.parse(await readFile(resolve(directory, 'whole-goals.candidate.json'), 'utf8'))
const originals = JSON.parse(await readFile(resolve(directory, 'whole-goals.original.json'), 'utf8'))
const candidateBytes = await readFile(resolve(directory, 'positive.candidates.json'))
const candidates = JSON.parse(candidateBytes.toString())
const criteriaBytes = await readFile(resolve(directory, 'authoring-review.criteria.md'))
const schemaBytes = await readFile(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const schema = JSON.parse(schemaBytes.toString())
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)
const errors: unknown[] = []
const records: unknown[] = []
const landscapeId = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const registry = JSON.parse(await readFile(resolve(root, 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'), 'utf8'))
const subject = registry.subjects.find((item: any) => item.landscapePath === 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
if (!subject) throw new Error('No registered Economics semantic-kind scope')
const kindBytes = await readFile(resolve(root, subject.semanticKindLedgerPath))
const kindLedger = JSON.parse(kindBytes.toString())
if (kindLedger.sourceLandscapeId !== landscapeId) throw new Error('Semantic-kind identity mismatch')
const kinds = new Map(kindLedger.decisions.filter((item: any) => item.decisionStatus === 'authoritative').map((item: any) => [item.goalId, item.semanticKind]))
for (let index = 0; index < candidates.goals.length; index++) {
  const candidate = candidates.goals[index]
  const goal = goals[index]
  if (kinds.get(goal.id) !== 'curricularAtomic') throw new Error(`Not authoritative curricularAtomic: ${goal.id}`)
  if (goal.id !== candidate.goalId || originals[index].id !== goal.id) throw new Error('Goal order mismatch')
  const changed = [...new Set([...Object.keys(goal), ...Object.keys(originals[index])])]
    .filter(key => JSON.stringify(goal[key]) !== JSON.stringify(originals[index][key])).sort()
  const expectedFields = new Set(['3e26fb9e-634c-5454-b11f-1d925201182c','13b20cee-8977-5b3f-938b-2064e96f2a5b','b456e539-24bb-5ec5-a996-14c9c77b64d0']).has(goal.id) ? ['descriptionEn'] : ['descriptionEn','titleEn']
  if (new Set(["7f8f6648-6faa-52c5-9793-3654ef9dc36d", "9267ad99-f474-5fd7-8b6a-bd03fbc70394", "13b20cee-8977-5b3f-938b-2064e96f2a5b", "9ebddb42-c799-5cf3-bfbc-f611ac66207b", "f7034be8-64e9-5f63-9556-d7b8dc59eda7"]).has(goal.id)) expectedFields.push('dimensionTags'); expectedFields.sort()
  if (JSON.stringify(changed) !== JSON.stringify(expectedFields)) throw new Error(`Unintended delta ${goal.id}`)
  const record = {
    $schema: schema.$id,
    schemaVersion: 2,
    reviewId: candidates.reviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: hash(criteriaBytes), landscapeId,
    goalId: goal.id,
    goalFingerprint: fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, hash(criteriaBytes), {}, 'curricularAtomic'),
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(candidate.profile),
    status: 'needs_human_review', reviewAuthority: 'ai_candidate',
    reviewedAt: candidates.reviewedAt, reviewer: candidates.reviewer,
    reason: candidate.reason, evidenceLevel: candidate.evidenceLevel,
    maximumClaimScope: candidate.maximumClaimScope, reviewRunIds: [], dissent: [],
    profile: candidate.profile,
  }
  if (!validate(record)) errors.push({ goalId: goal.id, schemaErrors: validate.errors })
  const semanticErrors = validatePositiveGoalEvidenceRecordSemantics(record as any, goal, {}, 'curricularAtomic')
  if (semanticErrors.length) errors.push({ goalId: goal.id, semanticErrors })
  records.push(record)
}
const receipt = {
  role: 'author_technical_check', createdAt: new Date().toISOString(),
  candidateCount: candidates.goals.length, parsedWholeGoals: goals.length,
  boundedRecordSchema: schema.$id,
  nativeFingerprintAndSemanticFunctions: 'app/scripts/positiveGoalEvidenceProfileModel.ts',
  schemaSha256: hash(schemaBytes), candidateSha256: hash(candidateBytes),
  currentRegisteredSemanticKindPath: subject.semanticKindLedgerPath,
  semanticKindLedgerSha256: hash(kindBytes),
  wholeCandidateSha256: hash(await readFile(resolve(directory, 'whole-goals.candidate.json'))),
  errors, passed: errors.length === 0,
  independentDescriptionReviewClaim: false, currentWholeSourceMappingClaim: false,
  visualizationClaim: false, humanApprovalClaim: false, newStrictClosures: 0,
  limits: ['The actual active registered semantic-kind ledger confirms these selected IDs as authoritative curricularAtomic; candidate EN fields still require final target/source fingerprint bindings at integration.',
    'No resourceDigests are supplied while final images are pending; these records remain inert and cannot stand in for final image-bound records.',
    'This is technical author verification, not independent substantive review.'],
}
await writeFile(resolve(directory, 'candidate-native-schema.actual.receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
if (errors.length) { console.error(JSON.stringify(errors, null, 2)); process.exit(1) }
await writeFile(resolve(directory, 'positive.schema-smoke.records.inert.jsonl'), records.map(record => JSON.stringify(record)).join('\n') + '\n', { flag: 'wx' })
console.log(`${records.length} inert P-v2 records passed the actual closed schema and native fingerprints/semantics; independent reviews 0, strict closures 0.`)
