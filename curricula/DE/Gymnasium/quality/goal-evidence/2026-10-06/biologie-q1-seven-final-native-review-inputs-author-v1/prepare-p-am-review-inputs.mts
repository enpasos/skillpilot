import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'

const repo = resolve('.')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1'
if (existsSync(resolve(repo, base, 'final-native-review-inputs.author-v1.freeze.json'))) throw new Error('Frozen package; use a new author continuation')
const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const digest = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(repo, path))).digest('hex')
const bind = (path: string) => ({ path, sha256: digest(path), bytes: readFileSync(resolve(repo, path)).length })
const write = (name: string, value: unknown) => writeFileSync(resolve(repo, base, name), JSON.stringify(value, null, 2) + '\n')
const canonicalPath = base + '/inputs/canonical-390.de.candidate.json'
const kindPath = base + '/inputs/semantic-kinds-390.candidate.json'
const canonical = read(canonicalPath)
const kinds = read(kindPath)
const model = read(base + '/qa-artifacts/seven.book-model.json')
const currentGoalById = new Map<string, any>(canonical.goals.map((goal: any) => [goal.id, goal]))
const ids = model.pages.map((page: any) => page.goalId)
const scienceCasesPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-source-topic-corrections-author-v7/seven-goals-sixteen-complete-cases.fresh-review-input.snapshot.json'
const scienceCases = read(scienceCasesPath)
const verified = read(base + '/qa-artifacts/native-input-and-preservation-verification.actual.json')
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md'
const criteriaFingerprint = digest(criteriaPath)
const pRows = ids.map((id: string) => {
  const goal = currentGoalById.get(id)!
  if (kinds.decisions.find((row: any) => row.goalId === id)?.semanticKind !== 'curricularAtomic') throw new Error('Missing native kind input')
  const actualAsset = verified.exactSevenCurrentGoalAndImageBindings.find((row: any) => row.goalId === id)
  const resourceDigests = { [actualAsset.imageUrl]: digest(actualAsset.actualPublic.path) }
  if (resourceDigests[actualAsset.imageUrl] !== actualAsset.assetSha256) throw new Error('Changed selected bytes')
  const cases = scienceCases.rows.find((row: any) => row.goalId === id).cases
  return {
    goalId: id, semanticKind: 'curricularAtomic', wholeCurrentCandidateGoal: goal,
    goalFingerprint: fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
    reviewCriteriaFingerprint: criteriaFingerprint,
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, resourceDigests, 'curricularAtomic'),
    resourceDigests, actualSelectedAsset: actualAsset.actualPublic,
    currentSourceCaseBodies: cases, existingSourceCaseBodiesChanged: false,
    candidateOutputStillRequired: true,
    requiredFutureCandidateStatus: 'needs_human_review', requiredFutureReviewAuthority: 'ai_candidate', requiredEvidenceLevel: 'E1', requiredMaximumClaimScope: 'G1', reviewRunIdsToUseNow: [],
    independentPReviewComplete: false, humanApproval: false, learnerEvidence: false,
  }
})
write('inputs/positive-review-inputs.native-fingerprints.pending.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'inert exact native P-v2 review inputs; no profile or review verdict created',
  canonical: bind(canonicalPath), semanticKindLedger: bind(kindPath), subjectCriteria: bind(criteriaPath),
  authoringPrompt: bind('curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md'),
  outputSchema: bind('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),
  sourceMaterial: bind(scienceCases.sourceMaterial.path), sevenGoalSixteenCaseSourceSnapshot: bind(scienceCasesPath),
  nativeFingerprintHelpers: bind('app/scripts/positiveGoalEvidenceProfileModel.ts'),
  rows: pRows, currentSourceCaseCount: pRows.reduce((sum: number, row: any) => sum + row.currentSourceCaseBodies.length, 0),
  positiveProfileRecordsCreated: 0, independentPApproval: false, activeWrites: false, strictNetGain: 0,
})
const pConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2,
  reviewId: 'biologie-q1-seven-final-native-review-author-v1-pending-p', goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId: canonical.landscapeId, landscapePath: canonicalPath, semanticKindLedgerPath: kindPath, reviewCriteriaPath: criteriaPath,
  reviewPath: base + '/inputs/positive-evidence.pending.review.jsonl', reviewRunManifestPaths: [], reviewedResourceTypes: ['goal-visualization'], requireApproved: false,
  scope: { label: 'Seven final candidate goals: current profile inputs only; seven profiles still absent', goalIds: ids },
}
write('inputs/positive-evidence.pending.config.json', pConfig)
writeFileSync(resolve(repo, pConfig.reviewPath), '')
const pCheck = reviewPositiveGoalEvidenceConfig(base + '/inputs/positive-evidence.pending.config.json')
if (pCheck.records.length || !pCheck.errors.length) throw new Error('Expected truthful missing-seven-profile HOLD')
write('qa-artifacts/native-positive-check.pending-profiles.actual.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), nativeChecker: bind('app/scripts/positiveGoalEvidenceReview.ts'),
  config: bind(base + '/inputs/positive-evidence.pending.config.json'), result: 'HOLD', returnedErrors: pCheck.errors, returnedCounts: pCheck.counts, profilesActuallyPresent: pCheck.records.length,
  additionalActiveRootImageResolutionLimitation: ids.map((id: string) => {
    const asset = verified.exactSevenCurrentGoalAndImageBindings.find((row: any) => row.goalId === id)
    return { goalId: id, nativeProspectivePublicPath: 'app/public' + asset.imageUrl, currentlyExistsInActiveRoot: existsSync(resolve(repo, 'app/public' + asset.imageUrl)), actualIsolatedPNG: asset.actualPublic, selectedHashExact: true }
  }),
  explanation: 'The native P checker was run unchanged and correctly reports absent seven profiles. Its checker/materializer resolve reviewed image URLs against the main repository app/public. The current exact images are deliberately isolated, so a future full P check must use legitimately integrated assets or an independently authorized supported isolated input route. This is a preparation boundary, not missing user authorization.',
  newPApprovals: 0, activeWrites: false, humanApproval: false, learnerEvidence: false,
})
const aConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-eighteen-current-reviewed-integration-candidate-v2/full-atomicity.config.json'
const mConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-learner-view-adoption-candidate-v1/full-memory.current-learner-views.config.json'
const aConfig = read(aConfigPath)
const mConfig = read(mConfigPath)
const priorScienceAndMemory = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-source-topic-corrections-author-v7/effective-native-inputs.author-v7.json').independentAExistingSevenScienceMemoryAndMaterialsDecision
write('inputs/atomicity-memory-native-review-inputs.pending.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'full existing A/M baselines plus exact seven current candidate inputs; no new A/M decision records',
  canonical: bind(canonicalPath), semanticKindLedger: bind(kindPath),
  existingFullAtomicity: { config: bind(aConfigPath), review: bind(aConfig.reviewPath) },
  existingFullMemory: { config: bind(mConfigPath), review: bind(mConfig.reviewPath), cards: bind(mConfig.cardReviewPath), visibilityScopes: mConfig.visibilityScopes.map((scope: any) => ({ label: scope.label, input: bind(scope.viewPath) })) },
  priorScientificMemoryOpinionReference: priorScienceAndMemory,
  noMemoryOpinionPromotedToNativeDecision: true,
  rows: pRows.map((row: any) => ({ goalId: row.goalId, wholeCurrentCandidateGoal: row.wholeCurrentCandidateGoal, nativeGoalFingerprint: row.goalFingerprint, nativeSelectedPage: model.pages.find((page: any) => page.goalId === row.goalId), nativePReviewInputFingerprint: row.reviewInputFingerprint, memoryAndAtomicityReviewStillRequired: true, newGUISupersetRegistrationStillPending: true })),
  nativeNewARecords: 0, nativeNewMRecords: 0, newCardRecords: 0, currentGUIScopeRecordsPreserved: true,
  activeWrites: false, strictNetGain: 0, humanApproval: false, humanTrial: false,
})
console.log(JSON.stringify({ positiveInputs: pRows.length, unchangedSourceCases: pRows.reduce((sum: number, row: any) => sum + row.currentSourceCaseBodies.length, 0), positiveProfiles: pCheck.records.length, nativePStatus: 'HOLD', nativeA_MNewDecisions: 0 }))
