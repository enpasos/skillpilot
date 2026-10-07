import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, positiveGoalEvidenceReviewInputPayload, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { aiApprovalStatus, isAiApprovedForCurrentAsset } from '../../../../../../../app/src/utils/goalVisualizationQaStatus'
import { normalizeGoalVisualizationAiReview } from '../../../../../../../app/scripts/goalVisualizationQaModel'

const root = resolve('.')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-image-user-correction-independent-a-v1/'
const correction = 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-carrier-user-geometry-correction-20261006-v2/'
const integrated = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-reviewed-integration-candidate-v1/'
const priorAuthor = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1/'
const priorOwnP = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-positive-independent-a-v1/'
const id = 'ac9e824f-003c-50ac-8751-2b8456004c63'
if (existsSync(resolve(own, 'independent-carrier-image-a.final.freeze.json')) || existsSync(resolve(own, 'independent-carrier-image-a.v-p-stage-1.freeze.json'))) throw new Error('Frozen independent review; create a fresh follow-up')
mkdirSync(resolve(own), { recursive: true })
const boundInputs = new Map<string, any>()
const bytes = (path: string): Buffer => { const b = readFileSync(resolve(root, path)); boundInputs.set(path, { path, sha256: 'sha256:' + createHash('sha256').update(b).digest('hex'), bytes: b.length }); return b }
const sha = (path: string) => { bytes(path); return boundInputs.get(path).sha256 }
const read = (path: string): any => JSON.parse(bytes(path).toString('utf8'))
const write = (path: string, value: unknown) => writeFileSync(resolve(own, path), JSON.stringify(value, null, 2) + '\n')
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const stamp = new Date().toISOString()
const reviewer = 'Codex independent targeted carrier-image reviewer A /root/biology_q1_v7_sources_independent_a_followup; not the image author; no new peer image verdict read'
const config = read(integrated + 'positive.seven.independent-current.config.json')
const canonical = read(config.landscapePath)
const goal = canonical.goals.find((g: any) => g.id === id)
const oldRecord = bytes(config.reviewPath).toString('utf8').trim().split('\n').map(line => JSON.parse(line)).find(record => record.goalId === id)
const ledger = read('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
const oldV = ledger.records.find((r: any) => r.goalId === id)
const primary = goal.resourceLinks.filter((r: any) => r.type === 'goal-visualization' && r.role === 'primary')
if (primary.length !== 1 || primary[0].url !== oldV.imageUrl || primary[0].skillpilotId !== id) throw new Error('Current primary goal image binding differs')
const candidatePath = correction + 'carrier-corrected.candidate.png'
const candidateSHA = sha(candidatePath)
const priorSHA = sha(correction + 'before-' + id + '.png')
const activePublicSHA = sha(oldV.publicAssetPath)
const generated = read(correction + 'candidate-generation.actual.json')
if (candidateSHA !== 'sha256:' + generated.candidateSha256 || candidateSHA === priorSHA) throw new Error('Candidate production provenance or actual raster bytes mismatch')
for (const suffix of ['actual-360.png', 'actual-680.png']) sha(correction + 'carrier-corrected.' + suffix)
for (const path of [correction + 'actual-image-edit-prompt.en.md', correction + 'before-bindings.actual.json', 'AGENTS.md', 'docs/concept/skill-graph/atomic-goal-visualizations.md', priorOwnP + 'independent-p-a.final.freeze.json']) sha(path)
const prior = read(priorAuthor + 'inputs/positive-review-inputs.native-fingerprints.pending.json')
const priorRow = prior.rows.find((r: any) => r.goalId === id)
const priorWholeGoal = priorRow.wholeCurrentCandidateGoal
const withoutVisual = (g: any) => { const { resourceLinks, ...rest } = g; return rest }
const withoutVisualAndInertAuthorMarker = (g: any) => { const result = structuredClone(withoutVisual(g)); if (result.extendedData) delete result.extendedData.authorCandidate; return result }
const materialPath = prior.sourceMaterial.path
const material = read(materialPath)
if (sha(materialPath) !== prior.sourceMaterial.sha256) throw new Error('Prior complete scientific materials changed')
const materialRows = priorRow.currentSourceCaseBodies.map((entry: any) => {
  let actual = material
  for (const part of entry.JSONPointer.split('/').slice(1)) actual = actual[part]
  if (!equal(actual, entry.caseBody)) throw new Error('A complete source case body changed')
  return { JSONPointer: entry.JSONPointer, caseKey: actual.caseKey ?? actual.caseId, completeCaseBody: actual, exactBodyReusedFromValidOwnA: true }
})
if (materialRows.length !== 2 || materialRows.map((r: any) => r.caseKey).join('|') !== 'classical-carriers-a|classical-carriers-b') throw new Error('Wrong material scope')
const oldAuthorProfiles = bytes('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-positive-author-v1/positive-evidence.seven.author-candidates.review.jsonl').toString('utf8').trim().split('\n').map(l => JSON.parse(l))
const ownReviewedProfile = oldAuthorProfiles.find((r: any) => r.goalId === id).profile
if (!equal(ownReviewedProfile, oldRecord.profile)) throw new Error('Active scientific profile differs from previously independently reviewed own-A payload')
const record = structuredClone(oldRecord)
record.reviewId = 'biologie-q1-carrier-image-user-correction-independent-a-v1'
record.reviewedAt = stamp
record.reviewer = reviewer
record.reason = 'KEEP: independent actual native/360/680 PNG review verifies the corrected continuous double helix and the gene as a bracketed section of that same DNA. The complete classical-carriers-a/b bodies and the previously independently reviewed profile are exactly reused. Image labels are orientation, never learner performance. The new reviewInputFingerprint binds actual corrected PNG bytes. Final D page/context integration and the other independent image review remain separate; no human approval or trial.'
record.goalFingerprint = fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
record.reviewCriteriaFingerprint = sha(config.reviewCriteriaPath)
const resources = { [primary[0].url]: candidateSHA }
record.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, record.reviewCriteriaFingerprint, resources, 'curricularAtomic')
record.profileFingerprint = fingerprintPositiveGoalEvidenceProfile(record.profile)
if (record.goalFingerprint !== oldRecord.goalFingerprint || record.profileFingerprint !== oldRecord.profileFingerprint || record.reviewInputFingerprint === oldRecord.reviewInputFingerprint) throw new Error('Unexpected scientific-text/profile delta or unchanged resource fingerprint')
if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate' || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1' || record.reviewRunIds.length || record.dissent.length) throw new Error('Unsupported authority or learner evidence claim')
const pErrors = validatePositiveGoalEvidenceRecordSemantics(record, goal, resources, 'curricularAtomic')
if (pErrors.length) throw new Error(pErrors.join(' | '))
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv = require('ajv/dist/2020').default
const addFormats = require('ajv-formats').default
const ajv = new Ajv({ allErrors: true, strict: true }); addFormats(ajv)
const recordSchema = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
const configSchema = 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'
const validateRecord = ajv.compile(read(recordSchema))
if (!validateRecord(record)) throw new Error(ajv.errorsText(validateRecord.errors))
const plannedV = structuredClone(oldV)
plannedV.assetSha256 = candidateSHA
plannedV.aiApprovedAssetSha256 = candidateSHA
plannedV.aiApproved = 'yes'
plannedV.aiReviewedAt = stamp
plannedV.aiReviewer = reviewer
plannedV.aiNotes = 'KEEP after actual native 1672x941, 360x203 and 680x383 raster inspection. Original gold gene segment broke the spatial backbone phase; the correction maintains the same two violet/blue strands and repeated crossing/occlusion sequence through both gene boundaries. The foreground diagonal descends to the right at every visible crossing, consistent with a right-handed schematic; no handedness reversal in the marked segment. This is not an atomistic or scale-correct stereochemical model. The pale gold halo is behind DNA, the bracket selects a section and adds no independent molecule. All three labels and arrows remain readable at 360/680. HumanApproval/Trial remain no; final active D/P binding is separate.'
if (plannedV.humanApproved !== 'no' || plannedV.humanIssueIdentified !== 'no') throw new Error('Existing human flags require a separate explicit reconciliation')
const normalized = normalizeGoalVisualizationAiReview(plannedV, candidateSHA)
if (normalized.aiApproved !== 'yes' || !isAiApprovedForCurrentAsset(plannedV) || aiApprovalStatus(plannedV) !== 'approved') throw new Error('Native exact-byte AI V semantics failed')
write('single-native-v-record.candidate.json', plannedV)
writeFileSync(resolve(own, 'positive.one.independent-a.candidate.review.jsonl'), JSON.stringify(record) + '\n')
const oneConfig = structuredClone(config)
oneConfig.reviewId = record.reviewId
oneConfig.reviewPath = own + 'positive.one.independent-a.candidate.review.jsonl'
oneConfig.scope = { label: 'One corrected carrier image; exact scientific profile reused; machine candidate, final D/context integration separate', goalIds: [id] }
const validateConfig = ajv.compile(read(configSchema))
if (!validateConfig(oneConfig)) throw new Error(ajv.errorsText(validateConfig.errors))
write('positive.one.independent-a.candidate.config.json', oneConfig)
const actualFullChecker = reviewPositiveGoalEvidenceConfig(own + 'positive.one.independent-a.candidate.config.json')
const oldActiveBindingIsUnchanged = activePublicSHA === priorSHA
const expectedErrors = oldActiveBindingIsUnchanged ? actualFullChecker.errors.filter(error => error.includes('stale reviewInputFingerprint')) : []
const unexpectedErrors = actualFullChecker.errors.filter(error => !expectedErrors.includes(error))
if (unexpectedErrors.length || (oldActiveBindingIsUnchanged && expectedErrors.length !== 1)) throw new Error('Unexpected native full-checker state: ' + actualFullChecker.errors.join(' | '))
write('carrier-goal-profile-materials-and-current-resource-payload.actual.json', {
  schemaVersion: 1, createdAtUTC: stamp, goalId: id, currentWholeGoal: goal, currentOldNativePMetadata: { reviewId: oldRecord.reviewId, goalFingerprint: oldRecord.goalFingerprint, reviewInputFingerprint: oldRecord.reviewInputFingerprint, profileFingerprint: oldRecord.profileFingerprint },
  priorWholeGoalExactExcludingResourceLinks: equal(withoutVisual(goal), withoutVisual(priorWholeGoal)), priorWholeGoalExactExcludingResourceLinksAndRemovedInertAuthorCandidateMarker: equal(withoutVisualAndInertAuthorMarker(goal), withoutVisualAndInertAuthorMarker(priorWholeGoal)), historicalAuthorCandidateMetadataRemovedByReviewedIntegration: !!priorWholeGoal.extendedData?.authorCandidate && !goal.extendedData?.authorCandidate, fullSourceCases: materialRows,
  scientificProfileExactlyReusedFromOwnPriorA: true, currentPositiveReviewInputPayload: positiveGoalEvidenceReviewInputPayload(goal, record.reviewCriteriaFingerprint, resources, 'curricularAtomic'),
  actualNativePFingerprints: { goalFingerprint: record.goalFingerprint, reviewCriteriaFingerprint: record.reviewCriteriaFingerprint, reviewInputFingerprint: record.reviewInputFingerprint, profileFingerprint: record.profileFingerprint },
  role: 'Current one-goal image-binding candidate, final source/GUI context must be separately checked in final native D input', activeWrites: false, strictNetGain: 0, newScientificCompletions: 0, restoredActiveBindings: 0, humanApproval: false, humanTrial: false, learnerEvidence: false,
})
write('native-v-p-targeted-validation.actual.json', {
  schemaVersion: 1, createdAtUTC: stamp, goalId: id, nativeVApprovalPredicate: 'PASS_EXACT_CANDIDATE_BYTES', nativeVPendingActiveImport: activePublicSHA !== candidateSHA,
  nativePClosedSchema: 'PASS', nativePConfigClosedSchema: 'PASS', nativePCandidateBytesSemantics: 'PASS', nativePSemanticErrors: pErrors,
  actualFullCheckerStatus: actualFullChecker.errors.length ? 'HOLD_ACTIVE_PUBLIC_PNG_STILL_OLD' : 'PASS', actualFullCheckerErrors: actualFullChecker.errors, counts: actualFullChecker.counts, expectedOldImageDerivedStaleBindingErrors: expectedErrors.length, unexpectedErrors,
  oldActiveImageBinding: activePublicSHA, candidateImageBinding: candidateSHA,
  nativeDStatus: 'HOLD_FINAL_ACTUAL_ONE_PAGE_SOURCE_CONTEXT_INPUT', nativeDPageFingerprintNotClaimed: true, otherSixReviewPacketsReusedUnchanged: true,
  evidenceLevel: record.evidenceLevel, maximumClaimScope: record.maximumClaimScope, status: record.status, reviewAuthority: record.reviewAuthority,
  activeWrites: false, specialValidatorRules: false, strictNetGain: 0, newScientificCompletions: 0, restoredActiveBindings: 0, humanApproval: false, humanTrial: false,
})
for (const helper of ['app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/goalVisualizationQaModel.ts','app/src/utils/goalVisualizationQaStatus.ts']) sha(helper)
write('actual-bound-inputs.for-final-freeze.json', { schemaVersion: 1, createdAtUTC: stamp, inputs: [...boundInputs.values()], concurrentActiveIntegrationAllowed: true, globalNineteenInputEqualityNotClaimed: true })
console.log(JSON.stringify({ goalId: id, actualNewNativePReviewInputFingerprint: record.reviewInputFingerprint, actualGoalFingerprint: record.goalFingerprint, actualProfileFingerprint: record.profileFingerprint, V: 'KEEP_ONE_ACTUAL_CANDIDATE', P: 'KEEP_ONE_EXACT_PROFILE_AND_TWO_MATERIALS', fullNativeP: actualFullChecker.errors.length ? 'HOLD_OLD_ACTIVE_IMAGE' : 'PASS', D: 'HOLD_FINAL_CONTEXT_PAGE', strictNetGain: 0 }))
