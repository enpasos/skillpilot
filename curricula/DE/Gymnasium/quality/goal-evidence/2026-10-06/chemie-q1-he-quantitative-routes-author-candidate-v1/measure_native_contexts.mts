// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { goalEvidenceReviewInputPayload, goalEvidenceSemanticPayload } from '../../../../../../../app/scripts/goalEvidenceProfileModel'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey } from '../../../../../../../app/scripts/sourceCoverageEvidence'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
const old = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
const nativeRoot = 'tmp/chemie-q1-quantitative-reviewed-integration-candidate-v1-native-root'
const canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const skPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const clone = (value: any) => JSON.parse(JSON.stringify(value))
const hash = (value: any) => createHash('sha256').update(stableGoalBookJson(value)).digest('hex')
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const write = (name: string, value: any) => writeFileSync(own + '/' + name, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'})
const before = read(old + '/prospective-input-tree/' + canonical)
const after = read(own + '/proposed-active-tree/' + canonical)
const originalLedger = read(old + '/prospective-input-tree/' + skPath)
const ledger = clone(originalLedger)
const beforeById = new Map<string, any>(before.goals.map((goal: any) => [goal.id, goal]))
const afterById = new Map<string, any>(after.goals.map((goal: any) => [goal.id, goal]))
const semanticFingerprintChanges: any[] = []
for (const decision of ledger.decisions) {
  const fingerprint = fingerprintSemanticKindSourceGoal(afterById.get(decision.goalId))
  if (fingerprint !== decision.sourceFingerprint) {
    semanticFingerprintChanges.push({goalId: decision.goalId, semanticKind: decision.semanticKind, beforeSourceFingerprint: decision.sourceFingerprint, afterSourceFingerprint: fingerprint, originalDecisionBasisRetained: decision.decisionBasis})
    decision.sourceFingerprint = fingerprint
  }
}
const newGoals = after.goals.filter((goal: any) => !beforeById.has(goal.id))
assert.equal(newGoals.length, 2)
for (const goal of newGoals) {
  assert.equal(goal.contains.length, 0)
  assert(goal.tags.includes('Practice') && goal.tags.includes('Assessment') && goal.examData)
  assert.equal(goal.examData.reviewStatus, 'needs_review')
  ledger.decisions.push({goalId: goal.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(goal), semanticKind: 'practiceAssessment', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-post-split-practice-assessment'})
}
ledger.counts.practiceAssessment += 2
ledger.counts.total += 2
assert.equal(ledger.counts.curricularAtomic, 378)
// This is the author's actual semantic classification of task endpoints only.
// It is not an independent scientific content/release review of either task.
write('semantic-kinds.author-binding-candidate.json', ledger)
const qa = read(old + '/prospective-input-tree/curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const assetDigests = Object.fromEntries(qa.records.filter((row: any) => row.imageUrl && row.assetSha256).map((row: any) => [row.imageUrl, row.assetSha256]))
const modelPair = (configName: string) => {
  const config = read(old + '/' + configName)
  const source = (path: string) => read(nativeRoot + '/' + path)
  const manifest = config.compositionViewManifestPath ? source(config.compositionViewManifestPath) : null
  const common = {
    ...(config.compositionViewPath ? {compositionView: source(config.compositionViewPath)} : {}),
    ...(manifest ? {compositionViewManifest: manifest, compositionViewSources: manifest.sourcePaths.map((path: string) => ({path, view: source(path)})), navigationView: source(manifest.navigationViewPath), durationModelPolicy: source(manifest.durationModelPolicyPath)} : {}),
    goalVisualizationQa: qa, goalVisualizationAssetDigests: assetDigests, evidenceReviewSources: [], config,
  }
  return {before: buildGoalBookModel({...common, landscape: before, semanticKindLedger: originalLedger}), after: buildGoalBookModel({...common, landscape: after, semanticKindLedger: ledger})}
}
const full = modelPair('full-current.metadata-corrected.config.json')
const atlas = modelPair('atlas-current.metadata-corrected.config.json')
assert.equal(full.before.pages.length, 378)
assert.equal(full.after.pages.length, 378)
assert.deepEqual(full.after.pages.map((p: any) => p.goalId), full.before.pages.map((p: any) => p.goalId))
assert.equal(atlas.before.pages.length, 359)
assert.equal(atlas.after.pages.length, 359)
const pageDeltas = (pair: any) => pair.before.pages.flatMap((page: any, index: number) => hash(page) === hash(pair.after.pages[index]) ? [] : [{goalId: page.goalId, beforePage: page, afterPage: pair.after.pages[index], beforeSHA256: hash(page), afterSHA256: hash(pair.after.pages[index])}])
const fullPageDeltas = pageDeltas(full)
const atlasPageDeltas = pageDeltas(atlas)
const kinds = new Map<string, string>(originalLedger.decisions.map((d: any) => [d.goalId, d.semanticKind]))
const dChanges: any[] = [], pChanges: any[] = []
for (const goal of before.goals) {
  const next = afterById.get(goal.id)
  const kind = kinds.get(goal.id)
  const dBefore = buildGoalDescriptionCanonicalContext(goal), dAfter = buildGoalDescriptionCanonicalContext(next)
  if (hash(dBefore) !== hash(dAfter)) dChanges.push({goalId: goal.id, semanticKind: kind, beforeContext: dBefore, afterContext: dAfter})
  const semanticBefore = goalEvidenceSemanticPayload(goal, 'positive-understanding-evidence-v2', kind), semanticAfter = goalEvidenceSemanticPayload(next, 'positive-understanding-evidence-v2', kind)
  const pBefore = goalEvidenceReviewInputPayload(goal, 'positive-understanding-evidence-v2', assetDigests, kind), pAfter = goalEvidenceReviewInputPayload(next, 'positive-understanding-evidence-v2', assetDigests, kind)
  if (hash(semanticBefore) !== hash(semanticAfter) || hash(pBefore) !== hash(pAfter)) pChanges.push({goalId: goal.id, semanticKind: kind, beforeSemantic: semanticBefore, afterSemantic: semanticAfter, beforeReviewInput: pBefore, afterReviewInput: pAfter})
}
assert.deepEqual(pChanges.filter(row => row.semanticKind === 'curricularAtomic'), [])
const scienceIds = read(old + '/guarded-apply-plan.json').currentScienceEvidence.newScientificClosureGoalIds
assert.equal(scienceIds.length, 8)
assert(scienceIds.every((id: string) => !pChanges.some(row => row.goalId === id)))
const preparedBefore = prepareLandscapeEntries([normalizeCanonicalLandscape(before)]).flatMap(entry => entry.goals)
const preparedAfter = prepareLandscapeEntries([normalizeCanonicalLandscape(after)]).flatMap(entry => entry.goals)
const preparedBeforeById = new Map(preparedBefore.map(goal => [goal.id, goal]))
const preparedAfterById = new Map(preparedAfter.map(goal => [goal.id, goal]))
const routeRows = scienceIds.map((id: string) => {
  const direct = newGoals.filter((goal: any) => goal.requires.includes(id)).map((goal: any) => goal.id)
  return {goalId: id, directNewTerminalIds: direct, directTerminalEdges: direct.map((terminalId: string) => [id, terminalId]), newTerminalEffectiveRequires: direct.map((terminalId: string) => ({terminalId, effectiveRequires: preparedAfterById.get(terminalId)?.effectiveRequires}))}
})
for (const id of ['0d59b62e-d3f9-5969-b961-0c5e26316c04', '3d6699ae-ebbd-5a55-8798-b809a9d74f0a', '18819a59-2442-530f-a7c3-26755398ec66']) {
  const row = routeRows.find((row: any) => row.goalId === id)
  assert.equal(row?.directNewTerminalIds.length, 1)
  assert(row?.newTerminalEffectiveRequires[0].effectiveRequires?.includes(id))
}
const effectiveDeltaRows = preparedBefore.filter(goal => hash(goal.effectiveRequires) !== hash(preparedAfterById.get(goal.id)?.effectiveRequires)).map(goal => ({goalId: goal.id, beforeEffectiveRequires: goal.effectiveRequires, afterEffectiveRequires: preparedAfterById.get(goal.id)?.effectiveRequires}))
const currentStrict = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1/stable-checkpoint-four-subject-central.stdout.txt').subjects.find((s: any) => s.subject === 'chemie').strictCompleteGoalIds
const affectedCurrentStrict = fullPageDeltas.filter((row: any) => currentStrict.includes(row.goalId)).map((row: any) => row.goalId)
const sourceScope = read(own + '/native-he-only-compiled-scope.actual.json')
const surrogateRegistryPath = 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'
const surrogateRegistry = read(surrogateRegistryPath)
const surrogateEntries = new Map<string, any[]>()
for (const entry of surrogateRegistry.entries.filter((row: any) => row.status === 'accepted' && row.evidenceType === 'requires-closure' && typeof row.rationale === 'string' && row.rationale.trim())) {
  const key = sourceCoverageSurrogateKey(entry.landscapeId, entry.goalId, entry.jurisdiction)
  surrogateEntries.set(key, [...(surrogateEntries.get(key) ?? []), entry])
}
const isEligible = (goal: any) => !!goal && !goal.tags?.some((t: string) => ['Practice', 'Assessment', 'Motivation', 'Orientation', 'memorization'].includes(t) || t.startsWith('srs-deck:')) && !goal.examData && goal.nodeKind !== 'memory'
const byCoverage = (scope: any, landscape: any) => {
  const byIds = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
  const checker = createReviewedRequiresClosureCoverageChecker({landscapeId: landscape.landscapeId, jurisdiction: 'DE-BY', goals: scope.allCompiledGoalRows, canonicalGoalById: byIds, surrogateEntriesByKey: surrogateEntries, isEligibleCanonicalGoal: isEligible})
  // No authored DE-BY composition file exists in current inputs; this is the
  // native compiler-visible fallback, not the complete source/view audit.
  const rows = scope.allCompiledGoalRows.filter((row: any) => row.goalType === 'atomic' && row.compiledApplicability.jurisdiction?.includes('DE-BY') && isEligible(byIds.get(row.goalId)))
  return {visibleRawCurriculumAtoms: rows.length, sourceBackedRawCurriculumAtoms: rows.filter((row: any) => checker.hasCoverageBackedJurisdictionEvidence(row)).length, unsupportedRawGoalIds: rows.filter((row: any) => !checker.hasCoverageBackedJurisdictionEvidence(row)).map((row: any) => row.goalId)}
}
const beforeBY = byCoverage(sourceScope.before, before), afterBY = byCoverage(sourceScope.after, after)
assert(!afterBY.unsupportedRawGoalIds.includes('3d6699ae-ebbd-5a55-8798-b809a9d74f0a'))
assert(!afterBY.unsupportedRawGoalIds.includes('18819a59-2442-530f-a7c3-26755398ec66'))
const receipt = {
  schemaVersion: 1, documentType: 'inactive-native-context-footprint-receipt', checkedAtUTC: new Date().toISOString(),
  status: 'PASS native bounded footprint measurement; author candidate remains inactive and needs independent assessment/context/source/route review',
  canonicalBeforeSHA256: sha(old + '/prospective-input-tree/' + canonical), canonicalAfterSHA256: sha(own + '/proposed-active-tree/' + canonical),
  originalLedgerSHA256: sha(old + '/prospective-input-tree/' + skPath), candidateLedgerSHA256: sha(own + '/semantic-kinds.author-binding-candidate.json'),
  counts: ledger.counts, semanticFingerprintChanges, newClassificationGoalIds: newGoals.map((g: any) => g.id), newClassificationReviewScope: 'author directly checked atomic task endpoints, assessment tags and examData; practiceAssessment classification only, not independent exam content or release approval',
  fullReviewPageCount: full.after.pages.length, sourceAtlasPageCount: atlas.after.pages.length, samePageIdUniverses: true,
  fullNativePageDeltas: fullPageDeltas, atlasNativePageDeltas: atlasPageDeltas, actualCanonicalDContextDeltas: dChanges,
  actualOwnPositivePayloadDeltas: pChanges, all378OwnCurricularPositivePayloadsExact: true, allEightPriorReviewedScienceOwnPositiveInputsExact: true,
  actualAffectedCurrent104StrictDPageGoalIds: affectedCurrentStrict, protected104WholeGoalsExactIsInsufficientForDPageClosure: affectedCurrentStrict.length > 0,
  actualEffectiveRequiresDeltas: effectiveDeltaRows, scopedDirectAndEffectiveNewTerminalRouteRows: routeRows,
  nativeBYRawAtomSourceEvidenceBefore: beforeBY, nativeBYRawAtomSourceEvidenceAfter: afterBY, surrogateRegistryUnchangedSHA256: sha(surrogateRegistryPath),
  noNewSourceMappingsOrSurrogateClaims: true, fullCQR003Executed: false, fullCQR101Executed: false, fullCQR201203Executed: false, fullFloorCheckExecuted: false,
  oldScientificClosuresRecounted: 0, newScientificCompletions: 0, restoredBindings: 0, futureStrict112Certified: false, activeWrites: false, humanApproval: false, humanTrial: false,
  nativeCodeFiles: ['app/scripts/goalBookModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/validateGoalDescriptionReviewCampaign.ts', 'app/src/hooks/useLandscapes.ts', 'app/scripts/sourceCoverageEvidence.ts'].map(path => ({path, sha256: sha(path)})),
}
write('native-pages-d-p-source-route-footprint.actual.json', receipt)
write('full378.after-route-source.author-candidate.book-model.json', full.after)
write('atlas359.after-route-source.author-candidate.book-model.json', atlas.after)
console.log(JSON.stringify({fullPages: 378, atlasPages: 359, changedFullPages: fullPageDeltas.length, changedAtlasPages: atlasPageDeltas.length, changedCanonicalDContexts: dChanges.map(row => row.goalId), curricularPChanges: 0, affectedExisting104StrictDPages: affectedCurrentStrict.length, nativeBYRawAtomSourceEvidenceBefore: beforeBY, nativeBYRawAtomSourceEvidenceAfter: afterBY, newAssessments: newGoals.map((g: any) => ({id:g.id, status:g.examData.reviewStatus})), status: 'inactive author candidate; no strict increase or floor claim'}, null, 2))
