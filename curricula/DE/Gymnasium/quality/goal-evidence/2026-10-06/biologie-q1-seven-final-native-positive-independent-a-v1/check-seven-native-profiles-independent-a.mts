import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'

const root = resolve('.')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own = base + 'biologie-q1-seven-final-native-positive-independent-a-v1/'
const author = base + 'biologie-q1-seven-final-native-positive-author-v1/'
const input = base + 'biologie-q1-seven-final-native-review-inputs-author-v1/'
if (existsSync(resolve(own, 'independent-p-a.final.freeze.json'))) throw new Error('Frozen review; use a new continuation')
const read = (path: string): any => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const sha = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')
const binding = (path: string) => ({ path, sha256: sha(path), bytes: readFileSync(resolve(root, path)).length })
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats').default
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const recordSchema = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
const configSchema = 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'
const validateRecord = ajv.compile(read(recordSchema))
const validateConfig = ajv.compile(read(configSchema))
const inputs = read(input + 'inputs/positive-review-inputs.native-fingerprints.pending.json')
const configPath = author + 'positive-evidence.seven.author-candidates.config.json'
const config = read(configPath)
if (!validateConfig(config)) throw new Error(ajv.errorsText(validateConfig.errors))
const canonical = read(config.landscapePath)
const semanticLedger = read(config.semanticKindLedgerPath)
const byID = new Map<string, any>(canonical.goals.map((goal: any) => [goal.id, goal]))
const records = readFileSync(resolve(config.reviewPath), 'utf8').trim().split('\n').map(line => JSON.parse(line))
if (records.length !== 7 || records.map(record => record.goalId).join('|') !== inputs.rows.map((row: any) => row.goalId).join('|')) throw new Error('Exact seven-goal order differs')
const criteriaFingerprint = sha(config.reviewCriteriaPath)
const rows: any[] = []
for (const [index, record] of records.entries()) {
  const inputRow = inputs.rows[index]
  const goal = byID.get(record.goalId)
  if (JSON.stringify(goal) !== JSON.stringify(inputRow.wholeCurrentCandidateGoal)) throw new Error('Native goal body differs')
  const kind = semanticLedger.decisions.find((item: any) => item.goalId === record.goalId)
  if (kind?.semanticKind !== 'curricularAtomic' || kind?.decisionStatus !== 'authoritative') throw new Error('Kind is not authoritative curricularAtomic')
  const image = goal.resourceLinks.filter((link: any) => link.type === 'goal-visualization' && link.role === 'primary')
  if (image.length !== 1) throw new Error('Expected one current primary raster')
  const resourceDigests = { [image[0].url]: sha(inputRow.actualSelectedAsset.path) }
  if (JSON.stringify(resourceDigests) !== JSON.stringify(inputRow.resourceDigests)) throw new Error('Actual PNG digest differs')
  if (!validateRecord(record)) throw new Error(ajv.errorsText(validateRecord.errors, { separator: ' | ' }))
  const semantics = validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, 'curricularAtomic')
  if (semantics.length) throw new Error(semantics.join(' | '))
  const goalFingerprint = fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
  const reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, resourceDigests, 'curricularAtomic')
  const profileFingerprint = fingerprintPositiveGoalEvidenceProfile(record.profile)
  if (record.reviewCriteriaFingerprint !== criteriaFingerprint || record.goalFingerprint !== inputRow.goalFingerprint || record.reviewInputFingerprint !== inputRow.reviewInputFingerprint || record.profileFingerprint !== profileFingerprint || record.goalFingerprint !== goalFingerprint || record.reviewInputFingerprint !== reviewInputFingerprint) throw new Error('A native binding is stale')
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate' || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1' || record.reviewRunIds.length || record.dissent.length) throw new Error('Candidate status or unsupported run/dissent claim differs')
  if (record.reviewId !== config.reviewId || record.landscapeId !== canonical.landscapeId) throw new Error('Review identity differs')
  const caseIDs = inputRow.currentSourceCaseBodies.map((item: any) => item.caseBody.caseId ?? item.caseBody.caseKey)
  if (record.profile.applicationCaseBriefs.map((item: any) => item.id).join('|') !== caseIDs.join('|')) throw new Error('Case coverage differs')
  const activeImage = 'app/public' + image[0].url
  rows.push({ goalId: record.goalId, goalFingerprint, reviewInputFingerprint, profileFingerprint,
    exactCurrentGoal: true, semanticKind: kind.semanticKind, closedNativeSchema: 'PASS',
    unchangedNativeSemanticsWithActualIsolatedPNG: 'PASS', semanticErrors: semantics,
    exactSelectedPNG: binding(inputRow.actualSelectedAsset.path), activePublicPNGExists: existsSync(resolve(activeImage)),
    exactCaseIDs: caseIDs, expectations: record.profile.expectations.length,
    variationAxes: record.profile.variationAxes.length, truthfulStatus: record.status,
    truthfulAuthority: record.reviewAuthority, evidenceLevel: record.evidenceLevel, maximumClaimScope: record.maximumClaimScope,
    unsupportedRunClaims: record.reviewRunIds.length })
}
const fullChecker = reviewPositiveGoalEvidenceConfig(configPath)
const expectedMissingImageErrors = fullChecker.errors.filter(error => error.includes('goal-visualization asset is missing at'))
const expectedMissingDigestErrors = fullChecker.errors.filter(error => error.includes('stale reviewInputFingerprint'))
const unexpectedErrors = fullChecker.errors.filter(error => !expectedMissingImageErrors.includes(error) && !expectedMissingDigestErrors.includes(error))
if (unexpectedErrors.length || expectedMissingImageErrors.length !== 7 || expectedMissingDigestErrors.length !== 7) throw new Error('Full checker had unexpected errors: ' + fullChecker.errors.join(' | '))
let materializerError: string | null = null
try {
  await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: read(author + 'seven-positive-profile-specifications.author-candidate.json') })
  throw new Error('Unexpected active-image resolution PASS while images are isolated')
} catch (error) {
  materializerError = error instanceof Error ? error.message : String(error)
  if (!materializerError.includes('goal-visualization asset is missing at')) throw error
}
const result = { schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'independent A targeted native technical reproduction; scientific judgement recorded separately',
  records: binding(config.reviewPath), config: binding(configPath), schema: binding(recordSchema), configSchema: binding(configSchema),
  productionHelpers: ['app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/positiveGoalEvidenceReview.ts', 'app/scripts/materializePositiveGoalEvidenceCandidates.ts'].map(binding),
  rows, nativeClosedSchemaAndSemanticsWithActualIsolatedPNGs: 'PASS7',
  nativeFullChecker: 'HOLD_ACTIVE_IMAGE_BINDINGS', nativeFullCheckerErrors: fullChecker.errors,
  missingActiveImageErrors: expectedMissingImageErrors.length, derivedMissingResourceFingerprintErrors: expectedMissingDigestErrors.length,
  unexpectedFullCheckerErrors: unexpectedErrors, actualCheckerCounts: fullChecker.counts,
  nativeMaterializer: 'HOLD_MISSING_ACTIVE_PUBLIC_IMAGE', nativeMaterializerError: materializerError,
  activeWrites: false, validatorSpecialPathOrProductionEdits: false, humanApproval: false, learnerEvidence: false, strictNetGain: 0 }
writeFileSync(resolve(own, 'native-schema-semantics-and-image-binding-checks.independent-a.actual.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ ownIndependentTechnicalReproduction: 'PASS7', materialCases: rows.reduce((n, row) => n + row.exactCaseIDs.length, 0), fullChecker: result.nativeFullChecker, expectedErrors: fullChecker.errors.length, unexpectedErrors: unexpectedErrors.length, activeWrites: false }))
