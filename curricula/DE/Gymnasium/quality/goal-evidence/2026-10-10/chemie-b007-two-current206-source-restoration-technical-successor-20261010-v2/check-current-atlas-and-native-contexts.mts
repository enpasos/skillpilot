// SPDX-License-Identifier: Apache-2.0
// Technical successor only: normal production helpers, no scientific verdict.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../..')
const prior = join(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b007-two-current206-targeted-author-successor-20261010-v1')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const bind = (path: string) => {
  const bytes = readFileSync(path)
  return { path: relative(root, path), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }
}
const write = (name: string, value: unknown) => writeFileSync(join(here, name), JSON.stringify(value, null, 2) + '\n')
const modelHelper = join(root, 'app/scripts/goalBookModel.ts')
const atlasHelper = join(root, 'app/scripts/goalBookSourceAtlasInputs.ts')
const { loadGoalBookBuildInputs } = await import(pathToFileURL(modelHelper).href)
const { checkGoalBookSourceAtlasInputs, compactGoalBookSourceAtlasReceipt } = await import(pathToFileURL(atlasHelper).href)
const { compileCompositionView } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const { normalizeCanonicalLandscape } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)

const guard = read(join(prior, 'current-inputs-and-preservation.author.json'))
const oldProof = read(join(prior, 'checks/actual-native-routes-source-view-and-protected206.result.json'))
const oldNative = read(join(prior, 'native/current-whole-selected-pages-and-contexts.raw.json'))
const baseline = read(join(root, guard.baseline.path))
const candidate = read(join(prior, 'candidate/canonical.candidate523.inactive.json'))
const kinds = read(join(prior, 'candidate/semantic-kinds.candidate523.inactive.json'))
assert.equal(bind(join(root, guard.liveBaselineAtAuthoring.path)).sha256, guard.liveBaselineAtAuthoring.sha256)
assert.equal(bind(join(root, guard.liveKindsAtAuthoring.path)).sha256, guard.liveKindsAtAuthoring.sha256)
const oldById = new Map(baseline.goals.map((goal: any) => [goal.id, goal]))
const newById = new Map(candidate.goals.map((goal: any) => [goal.id, goal]))
assert.equal(baseline.goals.length, 517)
assert.equal(candidate.goals.length, 523)
assert.ok(baseline.goals.every((goal: any) => newById.has(goal.id)))
assert.equal(guard.currentStrictGoalIds.length, 206)
assert.equal(guard.currentStrictGoalIds.filter((id: string) => JSON.stringify(oldById.get(id)) === JSON.stringify(newById.get(id))).length, 201)

const atlasConfig = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const atlas = checkGoalBookSourceAtlasInputs(atlasConfig, root)
assert.deepEqual(atlas.receipt.counts, { canonicalCurricularAtomicGoals: 398, publishedCurricularAtomicGoals: 378, sourceViews: 48, unresolvedSourceScopeDecisions: 496, omittedGoals: 20 })
const mappingPath = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json'
const mapping = read(join(root, mappingPath))
assert.equal(mapping.mappings.length, 483)
assert.equal(mapping.decisions.length, 332)
assert.deepEqual(mapping, read(join(here, 'sources/BY-current483-main-mapping.snapshot.json')))
const by = atlas.receipt.scopes.find((scope: any) => scope.key === 'DE-BY/SekI/')
const restoredRoutes = [
  ['597ac03c-d25f-5c34-a87c-52c059c87295', '7b5310e2-3b69-5a45-8966-f8523ea42fb9', 'partial'],
  ['9751b6d8-cde3-527b-b37c-babb6cee79d2', '7c68f201-5b73-5b1f-8576-cc1a23fafb83', 'exact'],
].map(([goalId, sourceGoalId, matchType]) => {
  assert.deepEqual(mapping.mappings.filter((row: any) => row.legacyGoalId === sourceGoalId && row.canonicalGoalId === goalId).map((row: any) => row.matchType), [matchType])
  assert.deepEqual(mapping.decisions.filter((row: any) => row.sourceGoalId === sourceGoalId).map((row: any) => row.canonicalGoalIds), [['08b44b8f-e407-5a1f-82dc-e70e598022cf', goalId]])
  const witnesses = by.witnesses.filter((row: any) => row.sourceGoalId === sourceGoalId && row.mappedTargetGoalId === goalId)
  assert.deepEqual(witnesses.map((row: any) => [row.goalId, row.coverage, row.profileBasis, row.mappingPath]), [[goalId, 'direct', 'source-metadata', mappingPath]])
  assert.deepEqual(newById.get(goalId), oldById.get(goalId), 'B007 candidate must retain the whole restored C10 child')
  return { goalId, sourceGoalId, matchType, witnesses, wholeCurrentAndCandidateGoalExact: true }
})
write('checks/current-chemistry-source-atlas.compact.actual.json', compactGoalBookSourceAtlasReceipt(atlas.receipt))

const base = await loadGoalBookBuildInputs(relative(root, join(prior, 'candidate/baseline-native-book.config.json')), root)
const next = await loadGoalBookBuildInputs(relative(root, join(prior, 'candidate/candidate-native-book.config.json')), root)
assert.equal(base.model.pages.length, 398)
assert.equal(next.model.pages.length, 402)
const oldPages = new Map(base.model.pages.map((page: any) => [page.goalId, page]))
const newPages = new Map(next.model.pages.map((page: any) => [page.goalId, page]))
for (const id of guard.currentStrictGoalIds) assert.equal((oldPages.get(id) as any).goalFingerprint, (newPages.get(id) as any).goalFingerprint, id)
for (const page of oldNative.candidateRoutinePages) assert.deepEqual(newPages.get(page.goalId), page.page, 'Fresh whole candidate page differs: ' + page.goalId)
for (const page of oldNative.affectedExistingPages) {
  assert.deepEqual(oldPages.get(page.goalId), page.currentPage, 'Fresh current native context differs: ' + page.goalId)
  assert.deepEqual(newPages.get(page.goalId), page.candidatePage, 'Fresh candidate native context differs: ' + page.goalId)
}
const stripPagination = (value: any): any => Array.isArray(value) ? value.map(stripPagination) : value && typeof value === 'object'
  ? Object.fromEntries(Object.entries(value).filter(([key]) => !['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint'].includes(key)).map(([key, item]) => [key, stripPagination(item)])) : value
const changed = guard.currentStrictGoalIds.filter((id: string) => JSON.stringify(stripPagination(oldPages.get(id))) !== JSON.stringify(stripPagination(newPages.get(id))))
assert.deepEqual(changed, oldProof.protectedPageBindings.filter((row: any) => !row.visiblePageContentIgnoringPaginationExact).map((row: any) => row.goalId))
assert.equal(changed.length, 8)

const kindById = new Map(kinds.decisions.map((row: any) => [row.goalId, row.semanticKind]))
const normalized = normalizeCanonicalLandscape({ ...candidate, goals: candidate.goals.map((goal: any) => ({ ...goal, semanticKind: kindById.get(goal.id) })) })
const affectedViews = oldProof.unchangedAffectedNationalViews.map((view: any) => {
  assert.deepEqual(bind(join(root, view.binding.path)), view.binding)
  const compiled = compileCompositionView(read(join(root, view.binding.path)), normalized)
  assert.deepEqual(compiled.findings, view.actualFindings, view.viewId)
  return { binding: view.binding, viewId: view.viewId, scope: view.scope, findings: compiled.findings, sourceStatus: 'HOLD; unchanged source obligations and operators require independent successor review' }
})
const hePath = join(prior, 'candidate/he-seki-existing-source-view.bounded-candidate.json')
const he = compileCompositionView(read(hePath), normalized)
assert.deepEqual(he.findings.filter((finding: any) => finding.severity === 'error'), [])
const originalHEViewId = read(join(root, oldProof.targetedExistingHEView.original.path)).viewId
const regional = affectedViews.filter((view: any) => view.viewId !== originalHEViewId)
assert.equal(regional.length, 39)
const cpv = regional.flatMap((view: any) => view.findings.filter((finding: any) => finding.code === 'CPV-009')).length
assert.equal(cpv, 70)

const snapshotPaths = new Set(read(join(root, atlasConfig)).sourceDocumentSnapshots.map((row: any) => row.path))
const currentByteInputs = atlas.receipt.inputBindings.filter((row: any) => !snapshotPaths.has(row.path)).map((row: any) => {
  const current = bind(join(root, row.path)); assert.equal('sha256:' + current.sha256, row.sha256, row.path); return current
})
const modelHelpers = [modelHelper, atlasHelper, join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts'), join(root, 'app/src/utils/authoring/canonicalAuthoring.ts')].map(bind)
const sourceSnapshotContracts = atlas.receipt.inputBindings.filter((row: any) => snapshotPaths.has(row.path))
const affectedInputBindings = [...currentByteInputs, bind(join(root, atlasConfig)), bind(join(root, 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json')), ...affectedViews.map((row: any) => row.binding), bind(hePath), ...modelHelpers]
write('checks/normal-current-atlas-native-contexts.result.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'normal targeted technical current-input verification, no independent scientific review',
  normalAtlasCounts: atlas.receipt.counts, currentOperativeBYMainMapping: bind(join(root, mappingPath)), actualRestoredRoutes: restoredRoutes,
  allOriginal517GoalIdsRetained: true, currentWholeGoals: 517, candidateWholeGoals: 523, pureNativeCurrentPages: 398, pureNativeCandidatePages: 402,
  currentStrictSemanticFingerprintsExact: 206, previousSixCandidateWholePagesExact: 6, previousAffectedWholeContextObjectsExact: oldNative.affectedExistingPages.length,
  unchangedProtectedPageContexts: 198, protectedContextGoalIdsStillOpen: changed,
  restoredBYTargetIdsOverlappingB007ChangedPageContexts: restoredRoutes.filter(row => changed.includes(row.goalId)).map(row => row.goalId),
  affectedRegionalViews: regional, remainingRegionalSourceViews: 39, remainingActualSourceCPV009: 70, targetedHEViewCandidate: { binding: bind(hePath), findings: he.findings },
  sourceSnapshotContractsFromNormalConfig: sourceSnapshotContracts, sourceSnapshotDocumentsRequiredForPortableExecution: false,
  currentByteInputBindings: [...new Map(affectedInputBindings.map((row: any) => [row.path, row])).values()],
  oldRequiredPortableInputsStillExact: true, nativeRenderedArtifactsReusedOnlyAfterFreshWholePageEquality: true,
  newAtomicImageBindingsMissing: 6, newRequiredPrimaryCardsPendingVisibility: 2, independentSuccessorReviewsCompleted: 0,
  newScientificCompletions: 0, strictGain: 0, restoredActiveBindingsByThisPackage: 0, sourceHoldsCleared: 0, activeWrites: false, humanApproval: false, humanTrial: false,
  fullBuildExecuted: false, wholeCentralExecuted: false, runtimeChanges: false,
})
console.log(JSON.stringify({ normalAtlas: atlas.receipt.counts, exactRestoredDirectBYRoutes: restoredRoutes.length, preservedCurrentIds: 517, exactStrictSemanticFingerprints: 206, nativeCurrentPages: 398, nativeCandidatePages: 402, unchangedSixWholeCandidatePages: 6, unchangedExistingContextObjects: oldNative.affectedExistingPages.length, remainingRegionalSourceViews: 39, remainingActualSourceCPV009: cpv, newOverlap: restoredRoutes.filter(row => changed.includes(row.goalId)).map(row => row.goalId), strictGain: 0, activeWrites: false }))
