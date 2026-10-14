// Apache-2.0. Independent read-only candidate schema/input checks; no quality approval.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fingerprintGoalForEvidence, fingerprintGoalEvidenceProfile, fingerprintGoalEvidenceReviewInput, validateGoalEvidenceRecordSemantics } from '../../../app/scripts/goalEvidenceProfileModel'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '../../../app/scripts/positiveGoalEvidenceProfileModel'
const base = 'tmp/cross-subject-requires/decimal-rounding-v3-20261013'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes: string | Buffer) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const goal = read(base + '/goal.author-candidate.json').proposedGoal
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md'
const criteria = sha(readFileSync(criteriaPath))
const require = createRequire(resolve('app/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats')
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const checks: any[] = []
for (const kind of ['positive', 'description']) {
  const path = base + '/' + (kind === 'positive' ? 'positive-evidence.author-candidate.jsonl' : 'description-evidence.author-candidate.jsonl')
  const rows = readFileSync(path, 'utf8').trim().split('\n').map(line => JSON.parse(line))
  if (rows.length !== 1) throw new Error('Expected exactly one sealed candidate per native body')
  const record = rows[0]
  const schemaPath = 'contracts/goal-evidence/' + (kind === 'positive' ? 'v2' : 'v1') + '/goal-evidence-profile.schema.json'
  const validate = ajv.compile(read(schemaPath))
  const schemaValid = validate(record)
  const semanticErrors = kind === 'positive' ? validatePositiveGoalEvidenceRecordSemantics(record, goal, {}, 'curricularAtomic') : validateGoalEvidenceRecordSemantics(record, goal, {}, 'curricularAtomic')
  const bodyPath = base + '/' + (kind === 'positive' ? 'positive-profile.body.author-candidate.json' : 'description-profile.body.author-candidate.json')
  const expectedBody = read(bodyPath)
  const goalFP = kind === 'positive' ? fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic') : fingerprintGoalForEvidence(goal, 'goal-evidence-v1', 'curricularAtomic')
  const inputFP = kind === 'positive' ? fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, {}, 'curricularAtomic') : fingerprintGoalEvidenceReviewInput(goal, 'goal-evidence-v1', {}, 'curricularAtomic')
  const bodyFP = kind === 'positive' ? fingerprintPositiveGoalEvidenceProfile(expectedBody) : fingerprintGoalEvidenceProfile(expectedBody, 'goal-evidence-v1')
  const bindings = { exactBodyMatches: JSON.stringify(record.profile) === JSON.stringify(expectedBody), goalFingerprintMatches: record.goalFingerprint === goalFP, reviewInputFingerprintMatches: record.reviewInputFingerprint === inputFP, profileFingerprintMatches: record.profileFingerprint === bodyFP, honestAuthority: record.reviewAuthority === 'ai_candidate' && record.status === 'needs_human_review' && record.reviewRunIds.length === 0 }
  checks.push({ kind, path, sha256: sha(readFileSync(path)), schemaPath, schemaSha256: sha(readFileSync(schemaPath)), bodyPath, bodySha256: sha(readFileSync(bodyPath)), schemaValid, schemaErrors: validate.errors ?? [], semanticErrors, recomputed: { goalFingerprint: goalFP, reviewInputFingerprint: inputFP, profileFingerprint: bodyFP }, bindings })
}
const passed = checks.every(c => c.schemaValid && c.semanticErrors.length === 0 && Object.values(c.bindings).every(Boolean))
const output = { schemaVersion: 1, reviewerAgentIdentity: '/root/requires_canonical_review', requestedModel: 'GPT-6.1 Sol Ultra', status: passed ? 'PASS_candidate_shape_and_exact_native_inputs_only' : 'FAIL_candidate_shape_or_inputs', packageSha256: sha(readFileSync(base + '/sealed-author-package.index.json')), goalArtifactSha256: sha(readFileSync(base + '/goal.author-candidate.json')), criteriaPath, criteriaFingerprint: criteria, resourceDigests: {}, effectiveSemanticKind: 'curricularAtomic', checks, limitation: 'This validates sealed author-candidate shape and fingerprints against an uninstalled goal without images. It is not a native independent D/P/A/M/V, learner evidence, M7, scope or activation approval.' }
writeFileSync(base + '/independent-native-validation-v1.json', JSON.stringify(output, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ status: output.status, checks: checks.map(c => ({ kind: c.kind, schemaValid: c.schemaValid, semanticErrors: c.semanticErrors, bindings: c.bindings })) }))
if (!passed) process.exitCode = 1
