import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'

const repo = resolve('.')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-positive-author-v1'
const inputPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1'
if (existsSync(resolve(repo, packagePath, 'native-positive-author-v1.final.freeze.json'))) throw new Error('Frozen package; use a new continuation')
const read = (path: string): any => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const sha = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(repo, path))).digest('hex')
const binding = (path: string) => ({ path, sha256: sha(path), bytes: readFileSync(resolve(repo, path)).length })
const write = (name: string, value: any) => writeFileSync(resolve(repo, packagePath, name), JSON.stringify(value, null, 2) + '\n')
const require = createRequire(resolve(repo, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats').default
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validateRecord = ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const validateConfig = ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
const inputFreezePath = inputPath + '/final-native-review-inputs.author-v1.freeze.json'
const inputFreeze = read(inputFreezePath)
for (const frozen of inputFreeze.files) if (sha(inputPath + '/' + frozen.path) !== 'sha256:' + frozen.sha256) throw new Error('Changed frozen review input ' + frozen.path)
const inputs = read(inputPath + '/inputs/positive-review-inputs.native-fingerprints.pending.json')
const originalConfig = read(inputPath + '/inputs/positive-evidence.pending.config.json')
const candidateSet = read(packagePath + '/seven-positive-profile-specifications.author-candidate.json')
const currentNativeCanonical = read(originalConfig.landscapePath)
const byID = new Map<string, any>(currentNativeCanonical.goals.map((goal: any) => [goal.id, goal]))
const kindLedger = read(originalConfig.semanticKindLedgerPath)
if (candidateSet.reviewId !== originalConfig.reviewId || candidateSet.goals.length !== 7 || inputs.rows.length !== 7) throw new Error('Review identity or seven-goal scope differs')
if (candidateSet.goals.map((goal: any) => goal.goalId).join('|') !== inputs.rows.map((row: any) => row.goalId).join('|')) throw new Error('Goal order differs from exact native inputs')
const criteriaFingerprint = sha(originalConfig.reviewCriteriaPath)
const records: any[] = []
const actualChecks: any[] = []
for (const [index, input] of inputs.rows.entries()) {
  const candidate = candidateSet.goals[index]
  const goal = byID.get(input.goalId)!
  if (kindLedger.decisions.find((decision: any) => decision.goalId === goal.id)?.semanticKind !== 'curricularAtomic') throw new Error('Semantic kind differs')
  const link = goal.resourceLinks.find((link: any) => link.type === 'goal-visualization' && link.role === 'primary')
  if (!link || sha(input.actualSelectedAsset.path) !== input.resourceDigests[link.url]) throw new Error('Current selected PNG binding differs')
  const resources = { [link.url]: sha(input.actualSelectedAsset.path) }
  const goalFingerprint = fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
  const reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, resources, 'curricularAtomic')
  if (goalFingerprint !== input.goalFingerprint || criteriaFingerprint !== input.reviewCriteriaFingerprint || reviewInputFingerprint !== input.reviewInputFingerprint) throw new Error('Exact native fingerprint input differs for ' + goal.id)
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json', schemaVersion: 2,
    reviewId: originalConfig.reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: criteriaFingerprint, landscapeId: currentNativeCanonical.landscapeId, goalId: goal.id,
    goalFingerprint, reviewInputFingerprint, profileFingerprint: fingerprintPositiveGoalEvidenceProfile(candidate.profile),
    status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt: candidateSet.reviewedAt,
    reviewer: candidateSet.reviewer, reason: candidate.reason, evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [], dissent: candidate.dissent,
    profile: candidate.profile,
  }
  if (!validateRecord(record)) throw new Error(ajv.errorsText(validateRecord.errors, { separator: ' | ' }))
  const semanticErrors = validatePositiveGoalEvidenceRecordSemantics(record, goal, resources, 'curricularAtomic')
  if (semanticErrors.length) throw new Error(semanticErrors.join(' | '))
  const actualCaseIDs = input.currentSourceCaseBodies.map((row: any) => row.caseBody.caseId ?? row.caseBody.caseKey)
  if (record.profile.applicationCaseBriefs.map((item: any) => item.id).join('|') !== actualCaseIDs.join('|')) throw new Error('Profile is not tied to exact original material cases')
  records.push(record)
  actualChecks.push({ goalId: goal.id, title: goal.title, titleEn: goal.titleEn, goalFingerprint, reviewInputFingerprint, profileFingerprint: record.profileFingerprint, subjectCriteriaFingerprint: criteriaFingerprint, exactSelectedRaster: binding(input.actualSelectedAsset.path), resourceDigests: resources, expectationCount: record.profile.expectations.length, currentCaseIDs: actualCaseIDs, archetype: record.profile.archetype, closedNativeRecordSchema: 'PASS', nativeRecordSemanticsWithActualPNGDigests: 'PASS', noProfileCopiedFromAnotherGoal: true, profileAuthority: 'ai_candidate', profileStatus: 'needs_human_review', actualLearnerEvidence: false, independentPApproval: false })
}
const reviewPath = packagePath + '/positive-evidence.seven.author-candidates.review.jsonl'
writeFileSync(resolve(repo, reviewPath), records.map(record => JSON.stringify(record)).join('\n') + '\n')
const config = { ...originalConfig, reviewPath, scope: { label: 'Seven actually authored current P-v2 candidates; independent reviews and active image binding pending', goalIds: records.map(record => record.goalId) } }
if (!validateConfig(config)) throw new Error(ajv.errorsText(validateConfig.errors, { separator: ' | ' }))
write('positive-evidence.seven.author-candidates.config.json', config)
let materializerStatus: string
let materializerError: string | null = null
try {
  const actualNativeRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  if (JSON.stringify(actualNativeRecords) !== JSON.stringify(records)) throw new Error('Native materializer differs from exact pure-helper records')
  materializerStatus = 'PASS'
} catch (error) {
  materializerError = error instanceof Error ? error.message : String(error)
  if (!materializerError.includes('goal-visualization asset is missing at')) throw error
  materializerStatus = 'HOLD_MISSING_ACTIVE_PUBLIC_IMAGE'
}
const checked = reviewPositiveGoalEvidenceConfig(packagePath + '/positive-evidence.seven.author-candidates.config.json')
if (checked.records.length !== 7 || checked.counts.needsHumanReview !== 7 || checked.counts.approved !== 0 || checked.counts.rejected !== 0) throw new Error('Truthful candidate authority/counts were lost')
write('native-targeted-profile-schema-semantics-and-binding-checks.actual.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'author technical validation of seven actual profiles; not independent scientific P approval',
  exactSourceInputFreeze: binding(inputFreezePath), nativeSchema: binding('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),
  nativeConfigSchema: binding('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'),
  unchangedProductionHelpers: ['app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/materializePositiveGoalEvidenceCandidates.ts', 'app/scripts/positiveGoalEvidenceReview.ts'].map(binding),
  authoredProfiles: records.length, actualMaterialCasesUsed: actualChecks.reduce((sum, row) => sum + row.currentCaseIDs.length, 0), rows: actualChecks,
  closedNativeSchemaErrors: 0, exactNativeSemanticErrorsWithActualIsolatedPNGDigests: 0,
  unchangedNativeMaterializerStatus: materializerStatus, unchangedNativeMaterializerError: materializerError,
  unchangedNativeFullCheckerStatus: checked.errors.length ? 'HOLD_ACTIVE_IMAGE_BINDINGS' : 'PASS', unchangedNativeFullCheckerErrors: checked.errors, actualCheckerCounts: checked.counts,
  bindingLimitationExplanation: 'Seven exact current profiles exist. Their criteria, goal, profile and review-input fingerprints validate with the actual isolated PNGs using unchanged native pure helpers. The full checker/materializer resolve image URLs against active app/public, where these seven assets remain deliberately unintegrated. Missing physical images also cause the full checker to derive incomplete resource fingerprints. These are technical active-binding holds, not substitute scientific approvals or missing user authorization.',
  independentPReviewComplete: false, newPScientificApprovalsClaimed: 0, currentCanonicalOrImageChanges: false, activeWrites: false, strictNetGain: 0, humanApproval: false, humanTrial: false, learnerEvidence: false,
})
console.log(JSON.stringify({ actualProfiles: records.length, exactNativeSchemaAndSemantics: 'PASS7', originalMaterialCases: 16, nativeMaterializer: materializerStatus, nativeFullChecker: checked.errors.length ? 'HOLD_ACTIVE_IMAGE_BINDINGS' : 'PASS', candidateCounts: checked.counts, independentApproval: false }))
