// Apache-2.0. Inert author candidates only; no active QA/graph writes.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import {
  fingerprintGoalForEvidence,
  fingerprintGoalEvidenceProfile,
  fingerprintGoalEvidenceReviewInput,
  validateGoalEvidenceRecordSemantics,
} from '../../../app/scripts/goalEvidenceProfileModel'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../app/scripts/positiveGoalEvidenceProfileModel'

const base = 'tmp/cross-subject-requires/decimal-rounding-v4-20261013'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const write = (name: string, value: unknown, jsonl = false) => {
  const path = `${base}/${name}`
  writeFileSync(path, (jsonl ? JSON.stringify(value) : JSON.stringify(value, null, 2)) + '\n', { flag: 'wx' })
  return { path, sha256: sha(readFileSync(path)) }
}
const author = read(`${base}/goal.author-candidate.json`)
const goal = author.proposedGoal
const p = read(`${base}/positive-profile.body.author-candidate.json`)
const d = read(`${base}/description-profile.body.author-candidate.json`)
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md'
const criteriaFingerprint = sha(readFileSync(criteriaPath))
const common = {
  landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
  goalId: goal.id,
  status: 'needs_human_review',
  reviewAuthority: 'ai_candidate',
  reviewedAt: author.authoredAt,
  reviewer: author.author,
  evidenceLevel: 'E1',
  maximumClaimScope: 'G1',
  reviewRunIds: [],
  dissent: ['V4 intrinsically teaches and assesses narrow decimal place meaning; source/placement/granularity and independent native content approval remain pending. No whole2f or natural-rounding mastery is assumed. Prompt/teacher separation is author-validated only; actual independent P/D/host-context review, ImageV and dualD are pending.'],
}
const positive = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',
  schemaVersion: 2,
  reviewId: 'math-decimal-rounding-nonnegative-author-20261013-v4',
  goalFingerprintRuleVersion: 'goal-evidence-v1',
  profileRuleVersion: 'positive-understanding-evidence-v2',
  reviewCriteriaFingerprint: criteriaFingerprint,
  goalFingerprint: fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
  reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, {}, 'curricularAtomic'),
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(p),
  ...common,
  reason: 'DE: V4 intrinsisches Dezimalstellenverständnis wird innerhalb der üblichen gegebenen Schulrundung geprüft; unterer Nachbar und Nullergebnis ergänzen Übertrag, Nullen und Abschneidekontrast. Tatsächlich verfasster bilingualer AI-Autorenkandidat für ein noch nicht installiertes Ziel: gegebene Stelle und Regel, nichtnegative endliche Dezimalzahlen, selbstständige Stellenwertbegründung mit höchstens leerer beschrifteter Tafel, kleine Nullen, Halbfallübertrag und frischer Kontrast zu Abschneiden. Kein unabhängiger Review, kein Bildnachweis und keine menschliche Freigabe werden behauptet. EN: Actual bilingual AI author candidate for an uninstalled goal: given place and rule, nonnegative terminating decimals, independent place-value reasoning with at most a blank labelled table, intrinsic place meaning, small zeros, lower-neighbor and zero-result transfer, exact-tie carry, and a fresh truncation contrast. No independent review, image evidence, or human approval is claimed.',
  profile: p,
}
const description = {
  schemaVersion: 1,
  reviewId: 'math-decimal-rounding-description-author-20261013-v4',
  ruleVersion: 'goal-evidence-v1',
  goalFingerprint: fingerprintGoalForEvidence(goal, 'goal-evidence-v1', 'curricularAtomic'),
  reviewInputFingerprint: fingerprintGoalEvidenceReviewInput(goal, 'goal-evidence-v1', {}, 'curricularAtomic'),
  profileFingerprint: fingerprintGoalEvidenceProfile(d, 'goal-evidence-v1'),
  ...common,
  reason: 'DE: Tatsächlich verfasstes didaktisches Beschreibungs-/Kontrastprofil für den inerten Vorschlag. Es bindet die begrenzte Domäne, die gegebene Konvention und die Bedeutung der Rundungsoperation; es ist kein nativer Round-A/B- oder Synthesisnachweis. EN: Actual didactic description/contrast profile for the inert proposal. It binds the bounded domain, supplied convention, and meaning of rounding; it is not native Round-A/B or synthesis evidence.',
  profile: d,
}
const require = createRequire(resolve('app/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats')
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const checks = []
for (const [kind, record, schemaPath, errors] of [
  ['positive', positive, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', validatePositiveGoalEvidenceRecordSemantics(positive as any, goal, {}, 'curricularAtomic')],
  ['description', description, 'contracts/goal-evidence/v1/goal-evidence-profile.schema.json', validateGoalEvidenceRecordSemantics(description as any, goal, {}, 'curricularAtomic')],
] as const) {
  const validate = ajv.compile(read(schemaPath))
  const schemaValid = validate(record)
  checks.push({ kind, schemaPath, schemaSha256: sha(readFileSync(schemaPath)), schemaValid, schemaErrors: validate.errors ?? [], nativeSemanticErrors: errors })
}
const failed = checks.some(check => !check.schemaValid || check.nativeSemanticErrors.length)
if (failed) {
  write('native-candidate-validation.failure.json', { schemaVersion: 1, checks, status: 'author_candidate_invalid_no_gate_approval' })
  throw new Error(JSON.stringify(checks))
}
const artifacts = [write('positive-evidence.author-candidate.jsonl', positive, true), write('description-evidence.author-candidate.jsonl', description, true)]
write('native-candidate-validation.json', {
  schemaVersion: 1,
  status: 'candidate_schema_and_native_input_semantics_pass_not_independent_gate_approval',
  effectiveSemanticKind: 'curricularAtomic',
  checks,
  artifacts,
  goalAuthorArtifactSha256: sha(readFileSync(`${base}/goal.author-candidate.json`)),
  criteriaPath,
  criteriaFingerprint,
  criticalLimit: 'Goal is not installed, requires/scope and independent semantics are pending; no V resource exists. These provisional author-input hashes must not be mechanically rebound as final approval after an image or graph change. Create additive candidates and actual reviewer checks against the final inputs.',
})
console.log(JSON.stringify({ status: 'PASS author-candidate shape/input only', checks: checks.map(c => ({ kind: c.kind, schemaValid: c.schemaValid, nativeSemanticErrors: c.nativeSemanticErrors })), artifacts }))
