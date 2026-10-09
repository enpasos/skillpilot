// SPDX-License-Identifier: Apache-2.0
// Ordinary P-v2 checks against exact inactive proposed goals, after science FIRST.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'

const root = process.cwd()
const dir = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-two-semantic-children-independent-b-v1'
const authorDir = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-one-fossil-culture-semantic-split-author-c-v1'
const full = (p: string) => resolve(root, p)
const json = (p: string) => JSON.parse(readFileSync(full(p), 'utf8'))
const digest = (b: Buffer) => `sha256:${createHash('sha256').update(b).digest('hex')}`
const bind = (p: string) => {
  const b = readFileSync(full(p))
  return { path: relative(root, full(p)), sha256: digest(b), bytes: b.length }
}
const writeNew = (p: string, body: string) => {
  if (existsSync(full(p))) throw new Error(`Preserve previous exact bytes: ${p}`)
  writeFileSync(full(p), body)
}
const requireApp = createRequire(full('app/package.json'))
const Ajv2020 = requireApp('ajv/dist/2020').default
const addFormats = requireApp('ajv-formats').default
const modelPath = 'app/scripts/positiveGoalEvidenceProfileModel.ts'
const model = await import(pathToFileURL(full(modelPath)).href)
const schemaPath = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-systematics-behavior-eighteen-whole-author-v1/input/profile-criteria.original.md'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const inputPath = `${dir}/two-children.exact-whole-goals-parent-four-bilingual-cases.input.json`
const firstPath = `${dir}/two-children.independent-b.science-A-M-P-FIRST.freeze.json`
const specPath = `${authorDir}/two-normal-positive-profile-specs.readable-v2.author-candidate.json`
const authorRecordsPath = `${authorDir}/two-proposed-whole-P-v2.ai-candidate.records.jsonl`
const first = json(firstPath)
for (const r of first.sealedArtifacts) {
  if (JSON.stringify(bind(r.path)) !== JSON.stringify(r)) throw new Error(`Changed science FIRST artifact ${r.path}`)
}
const input = json(inputPath)
const author = json(specPath)
const canonical = json(canonicalPath)
const authorRecords = readFileSync(full(authorRecordsPath), 'utf8').trim().split(/\r?\n/).map((r: string) => JSON.parse(r))
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(json(schemaPath))
const criteriaFingerprint = bind(criteriaPath).sha256
const stamp = new Date().toISOString()
const records = input.wholeCaseProfileEntries.map((entry: any, i: number) => {
  const goal = entry.wholeCandidateGoal
  const profile = entry.wholeProfile
  if (canonical.goals.some((r: any) => r.id === goal.id)) throw new Error('Child unexpectedly active; do not classify it as inactive')
  if (author.goals[i].goalId !== goal.id || JSON.stringify(profile) !== JSON.stringify(author.goals[i].profile)) throw new Error('Reviewed whole profile and exact author normal specification disagree')
  return {
    $schema: model.POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
    schemaVersion: model.POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
    reviewId: dir.split('/').at(-1),
    goalFingerprintRuleVersion: model.POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
    profileRuleVersion: model.POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
    reviewCriteriaFingerprint: criteriaFingerprint,
    landscapeId: canonical.landscapeId,
    goalId: goal.id,
    goalFingerprint: model.fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
    reviewInputFingerprint: model.fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, {}, 'curricularAtomic'),
    profileFingerprint: model.fingerprintPositiveGoalEvidenceProfile(profile),
    status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt: stamp,
    reviewer: 'Codex /root/evo12_visual_independent_b; independent whole two-child review with science FIRST before normal P-v2 tooling; model variant unexposed',
    reason: 'Exact inactive child candidate and whole bilingual profile/case pair independently scientifically reviewed. Proposed curricularAtomic kind only; no active canonical/kind or configured current-goal approval. RP ancestry-to-selected-behaviour and all13 whole-source/22-partner regional placement obligations remain separately open. No native/image/human/learner evidence claim.',
    evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [], dissent: [], profile,
  }
})
const findings = records.map((r: any, i: number) => {
  const valid = validate(r)
  const semanticErrors = model.validatePositiveGoalEvidenceRecordSemantics(r, input.wholeCaseProfileEntries[i].wholeCandidateGoal, {}, 'curricularAtomic')
  const a = authorRecords.find((v: any) => v.goalId === r.goalId)
  const fpKeys = ['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint']
  const exactFingerprints = fpKeys.every((k) => r[k] === a[k])
  const exactProfile = JSON.stringify(r.profile) === JSON.stringify(a.profile)
  return { goalId: r.goalId, schemaErrors: valid ? [] : structuredClone(validate.errors), semanticErrors,
    exactSuccessorFingerprints: exactFingerprints, exactSuccessorWholeProfile: exactProfile,
    kindBinding: 'inactive_proposed_curricularAtomic; not authoritative active ledger', currentCanonicalMembership: false,
    reviewedResourceDigests: {}, nativeOrSourceApproval: false }
})
const passed = findings.length === 2 && findings.every((f: any) => f.schemaErrors.length === 0 && f.semanticErrors.length === 0 && f.exactSuccessorFingerprints && f.exactSuccessorWholeProfile)
const recordPath = `${dir}/two-exact-proposed-whole-P.independent-b.ai-candidate.records.jsonl`
writeNew(recordPath, records.map((r: any) => JSON.stringify(r)).join('\n') + '\n')
const receipt = {
  schemaVersion: 1, license: 'CC-BY-4.0', createdAt: new Date().toISOString(),
  role: 'ordinary existing P-v2 record schema/model/fingerprint checks against whole inactive child bodies; no current configured canonical approval',
  scienceFIRST: bind(firstPath),
  ordinarySchemaAndModel: [bind(schemaPath), bind(modelPath)],
  exactInputs: [bind(inputPath), bind(specPath), bind(authorRecordsPath), bind(criteriaPath), bind(canonicalPath)],
  records: bind(recordPath), findings, actualExit: passed ? 0 : 1,
  needsHumanReview: 2, approved: 0, reviewAuthority: 'ai_candidate', status: 'needs_human_review', evidenceLevel: 'E1', maximumClaimScope: 'G1',
  currentConfiguredPCheckExecuted: false,
  currentConfiguredPCheckLimitation: 'Neither proposed child exists in the active canonical or authoritative semantic-kind ledger; truthful current config integration and native/source/image reviews remain pending.',
  newScientificClosures: 0, restoredBindings: 0, strictGain: 0, activeWrites: [],
  humanApproval: false, humanTrial: false, actualExperimentPerformed: false, actualLearnerPerformance: false,
}
writeNew(`${dir}/two-exact-proposed-P.ordinary-schema-semantics-fingerprints.actual.json`, JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ records: 2, actualExit: receipt.actualExit, needsHumanReview: 2, findings }))
process.exitCode = receipt.actualExit
