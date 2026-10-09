import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, relative, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

const root = process.cwd()
const here = dirname(fileURLToPath(import.meta.url))
const requireApp = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = requireApp('ajv/dist/2020').default
const addFormats = requireApp('ajv-formats').default
const model = await import(pathToFileURL(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const bind = (p: string) => ({ path: relative(root, p), sha256: `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`, bytes: readFileSync(p).length })
const candidatePath = join(here, 'two-child-four-whole-bilingual-cases-and-P.readable-v2.author-candidate.json')
const specPath = join(here, 'two-normal-positive-profile-specs.readable-v2.author-candidate.json')
const criteriaPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-systematics-behavior-eighteen-whole-author-v1/input/profile-criteria.original.md')
const schemaPath = resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const canonicalPath = resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const schema = json(schemaPath)
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)
const current = json(candidatePath)
const spec = json(specPath)
const criteriaFingerprint = bind(criteriaPath).sha256
const records = current.entries.map((entry: any, index: number) => {
  const goal = entry.wholeCandidateGoal
  const profile = entry.wholeProfile
  const author = spec.goals[index]
  if (author.goalId !== goal.id || JSON.stringify(author.profile) !== JSON.stringify(profile)) throw new Error('Author spec/body mismatch')
  return {
    $schema: model.POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
    schemaVersion: model.POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
    reviewId: spec.reviewId,
    goalFingerprintRuleVersion: model.POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
    profileRuleVersion: model.POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
    reviewCriteriaFingerprint: criteriaFingerprint,
    landscapeId: json(canonicalPath).landscapeId,
    goalId: goal.id,
    goalFingerprint: model.fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
    reviewInputFingerprint: model.fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, {}, 'curricularAtomic'),
    profileFingerprint: model.fingerprintPositiveGoalEvidenceProfile(profile),
    status: 'needs_human_review',
    reviewAuthority: 'ai_candidate',
    reviewedAt: spec.reviewedAt,
    reviewer: spec.reviewer,
    reason: 'Inactive author proposal against a proposed curricularAtomic kind, not an active canonical goal or independent review. Whole constructed cases require independent science/P/A/M/source/placement/native/V review. Original regional duties, including RP ancestry-to-behaviour, remain unresolved where stated.',
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    reviewRunIds: [],
    dissent: [],
    profile,
  }
})
const findings = records.map((record: any, i: number) => {
  const valid = validate(record)
  return {
    goalId: record.goalId,
    schemaErrors: valid ? [] : structuredClone(validate.errors),
    semanticErrors: model.validatePositiveGoalEvidenceRecordSemantics(record, current.entries[i].wholeCandidateGoal, {}, 'curricularAtomic'),
    kindBinding: 'proposed_kind_only_independent_AM_pending',
    resources: [],
    currentCanonicalMembershipClaimed: false,
  }
})
const output = join(here, 'two-proposed-whole-P-v2.ai-candidate.records.jsonl')
if (existsSync(output)) throw new Error('Never overwrite an earlier actual output')
writeFileSync(output, records.map((r: any) => JSON.stringify(r)).join('\n') + '\n')
const receiptPath = join(here, 'two-proposed-P-v2.ordinary-schema-and-semantics.actual.json')
if (existsSync(receiptPath)) throw new Error('Never overwrite earlier receipt')
const receipt = {
  schemaVersion: 1,
  role: 'Direct ordinary record schema/helper checks only; no configured current landscape, source, native or independent approval',
  command: ['app/node_modules/.bin/tsx', relative(root, fileURLToPath(import.meta.url))],
  inputs: [bind(candidatePath), bind(specPath), bind(criteriaPath), bind(schemaPath), bind(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts'))],
  records: bind(output),
  findings,
  actualExit: findings.every((f: any) => !f.schemaErrors.length && !f.semanticErrors.length) ? 0 : 1,
  needsHumanReview: 2,
  humanApproval: false,
  sourceOrNativeApproval: false,
  activeWrites: [],
  strictGain: 0,
}
writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ records: 2, actualExit: receipt.actualExit, findings }))
process.exitCode = receipt.actualExit
