import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { buildGoalBookSourceAtlasInputs } = await import(pathToFileURL(resolve('app/scripts/goalBookSourceAtlasInputs.ts')).href)
const { fingerprintSemanticKindSourceGoal, stableGoalBookJson, parseAndValidateGoalBookModel,
  loadGoalBookBuildInputs } = await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href)
const { validateStandaloneResolutionIndexSchema, validateStandaloneResolutionIndexStructure,
  hasExactCurrentOpenDescriptionDeferral } = await import(pathToFileURL(resolve('app/scripts/reportDeepUnderstandingRollout.ts')).href)
const out = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-reviewed-integration-technical-v1'
const original = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1'
const current = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-frog-adult-targeted-raster-native-author-successor-v2'
const fcc = 'fcc20f50-8eb3-5d6c-b37f-5be13c7d314e'
const capsule = resolve(process.argv[2])
assert.ok(capsule.startsWith(resolve('tmp') + '/'))
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const digest = (path: string) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
const bind = (path: string) => ({ path, sha256: digest(path), bytes: readFileSync(path).length })
const entry = read(join(out, 'reviewed-eight-integration.technical.entry.json'))
const atlas = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
const beforeAtlas = buildGoalBookSourceAtlasInputs(atlas, resolve('.'))
const afterAtlas = buildGoalBookSourceAtlasInputs({ ...atlas, landscapePath: entry.futureCanonicalCopy.path }, resolve('.'))
assert.deepEqual(beforeAtlas.receipt.counts, afterAtlas.receipt.counts)
assert.equal(beforeAtlas.receipt.counts.canonicalCurricularAtomicGoals, 394)
assert.equal(beforeAtlas.receipt.counts.publishedCurricularAtomicGoals, 394)
assert.equal(beforeAtlas.receipt.counts.sourceViews, 24)
assert.equal(atlas.mappingPaths.length, 31)
assert.deepEqual(beforeAtlas.receipt.scopes.map((scope: any) => [scope.key, scope.goalIds, scope.witnesses]),
  afterAtlas.receipt.scopes.map((scope: any) => [scope.key, scope.goalIds, scope.witnesses]))

const beforeLandscape = read(entry.beforeActiveBindings[0].path)
const afterLandscape = read(entry.futureCanonicalCopy.path)
const kinds = read(entry.kindLedgerWhole479.path)
const beforeById = new Map<string, any>(beforeLandscape.goals.map((goal: any) => [goal.id, goal]))
const afterById = new Map<string, any>(afterLandscape.goals.map((goal: any) => [goal.id, goal]))
assert.equal(beforeById.size, 479)
assert.equal(afterById.size, 479)
assert.equal(kinds.decisions.length, 479)
for (const decision of kinds.decisions) {
  assert.equal(fingerprintSemanticKindSourceGoal(beforeById.get(decision.goalId)), decision.sourceFingerprint)
  assert.equal(fingerprintSemanticKindSourceGoal(afterById.get(decision.goalId)), decision.sourceFingerprint)
}
const currentAtomic = new Set<string>(kinds.decisions.filter((decision: any) => decision.semanticKind === 'curricularAtomic').map((decision: any) => decision.goalId))
assert.equal(currentAtomic.size, 394)
const indexPaths = [entry.normalOriginal7PlusDeferredFCCIndex.path, entry.normalCurrentFCC1Index.path]
for (const path of indexPaths) {
  const index = read(path)
  assert.deepEqual(validateStandaloneResolutionIndexSchema(index), [])
  assert.deepEqual(validateStandaloneResolutionIndexStructure(index, currentAtomic), [])
}
const originalFolder = resolve(indexPaths[0], '..')
const originalSynthesis = read(join(originalFolder, 'synthesis-decisions.json'))
const originalSummary = read(join(originalFolder, 'dual-summary.json'))
assert.equal(originalSynthesis.deferredGoals.length, 1)
assert.equal(hasExactCurrentOpenDescriptionDeferral(originalSynthesis.deferredGoals[0],
  originalSummary.goals.find((goal: any) => goal.goalId === fcc)), true)
const currentIndex = read(indexPaths[1])
assert.equal(currentIndex.resolutions[0].goalId, fcc)
assert.equal(currentIndex.resolutions[0].strictDescriptionComplete, true)
assert.deepEqual(currentIndex.deferredGoalIds ?? [], [])

const beforeModelPath = join(original, 'native/before394-insect-eight.normal-model.json')
const originalAfterPath = join(original, 'native/after394-insect-eight.normal-model.json')
const currentModelPath = join(current, 'native/after394-fcc-adult-P7plusP1.normal-model.json')
const beforeModel = parseAndValidateGoalBookModel(read(beforeModelPath))
const originalAfter = parseAndValidateGoalBookModel(read(originalAfterPath))
const currentModel = parseAndValidateGoalBookModel(read(currentModelPath))
const beforePages = new Map<string, any>(beforeModel.pages.map((page: any) => [page.goalId, page]))
const originalPages = new Map<string, any>(originalAfter.pages.map((page: any) => [page.goalId, page]))
const currentPages = new Map<string, any>(currentModel.pages.map((page: any) => [page.goalId, page]))
assert.equal(beforePages.size, 394)
assert.equal(originalPages.size, 394)
assert.equal(currentPages.size, 394)
const protectedIds = entry.protectedStrictGoalIds as string[]
assert.equal(protectedIds.length, 327)
for (const id of protectedIds) {
  assert.equal(stableGoalBookJson(beforeById.get(id)), stableGoalBookJson(afterById.get(id)))
  assert.equal(stableGoalBookJson(beforePages.get(id)), stableGoalBookJson(currentPages.get(id)))
}
const ids = new Set<string>(entry.goalIds)
for (const [id, page] of beforePages) {
  if (!ids.has(id)) assert.equal(stableGoalBookJson(page), stableGoalBookJson(currentPages.get(id)))
}
const expectedChanged = [...currentPages].filter(([id, page]) => stableGoalBookJson(page) !== stableGoalBookJson(beforePages.get(id))).map(([id]) => id)
assert.deepEqual([...expectedChanged].sort(), [...ids].sort())
for (const id of ids) {
  if (id !== fcc) assert.equal(stableGoalBookJson(originalPages.get(id)), stableGoalBookJson(currentPages.get(id)))
}

// Rebuild only the normal in-memory model from existing selective capsule inputs. No HTML/PDF/publication output.
const configPath = join(current, 'native/after394-fcc-adult-P7plusP1.normal.config.json')
assert.equal(digest(configPath), digest(join(capsule, configPath)))
const loaded = await loadGoalBookBuildInputs(configPath, capsule)
assert.equal(stableGoalBookJson(loaded.model), stableGoalBookJson(currentModel))
const original8Bundle = parseAndValidateGoalBookModel(read(join(original, 'native/eight-current-P/bundle/book-model.json')))
const current1Bundle = parseAndValidateGoalBookModel(read(join(current, 'native/one-fcc-current-P/bundle/book-model.json')))
const nativeBindings = entry.goalIds.map((id: string) => {
  const boundPage = id === fcc ? current1Bundle.pages[0] : original8Bundle.pages.find((page: any) => page.goalId === id)
  const fullPage = currentPages.get(id)
  assert.equal(fullPage.goalFingerprint, boundPage.goalFingerprint)
  assert.equal(fullPage.title, boundPage.title)
  assert.equal(fullPage.description, boundPage.description)
  assert.deepEqual(fullPage.visualization, boundPage.visualization)
  assert.deepEqual(fullPage.evidenceReview, boundPage.evidenceReview)
  return { goalId: id, reviewedWhole394PageFingerprint: fullPage.pageFingerprint,
    reviewedLocalNativePageFingerprint: boundPage.pageFingerprint,
    fingerprintsEqual: fullPage.pageFingerprint === boundPage.pageFingerprint,
    exactFullPagePreservedInItsReviewedFrame: true,
    frameDifference: 'Whole394 and local8/local1 include different page numbering/navigation and internal/external prerequisite framing; no equality or hash-only replacement claimed',
    exactTitleDescriptionVisualizationAndOperativePReviewContext: true,
    operativePositiveReviewId: fullPage.evidenceReview.reviewId }
})
const proof = { schemaVersion: 1, checkedAt: new Date().toISOString(),
  normalAPIs: ['buildGoalBookSourceAtlasInputs', 'fingerprintSemanticKindSourceGoal', 'stableGoalBookJson',
    'parseAndValidateGoalBookModel', 'loadGoalBookBuildInputs', 'validateStandaloneResolutionIndexStructure', 'hasExactCurrentOpenDescriptionDeferral'],
  whole479SemanticSourceFingerprintsExact: 479, denominatorBeforeAndAfter: 394,
  source31Scopes24CountsAndEveryGoalSetWitnessExact: true, actualCurrentSourceCounts: beforeAtlas.receipt.counts,
  protected327WholeGoalsAndWholePagesExact: true, remaining386WholePagesExact: true,
  originalSevenCurrentWholePagesRetainedExactly: true, onlyChangedOriginalToSuccessorWholePageId: fcc,
  normalModelRebuiltInMemoryExact: true, wholeCurrentModel: bind(currentModelPath),
  normalModelInputConfigExact: bind(configPath), noNewHTMLPDFOrPublicationBundle: true,
  nativeBindings, normalOriginal7PlusDeferredAndCurrent1IndexStructurePassed: true,
  currentFCCNotDeferredOrArtificiallySuperseded: true,
  historicalOriginalFCCActualAblockBkeepDeferred: true, operativeAuthorP7AndP1ReviewIdsRetained: true,
  rootA394M394PreflightExact: entry.normalA394M394CurrentPreflight,
  wholeSourceDutyCourseLegalReapproval: false, thirdScientificReview: false,
  activeWrites: false, strictNetGain: 0, humanApproval: false, humanTrial: false }
writeFileSync(join(out, 'checks/normal-whole479-source31-scope24-native394-protected327.actual.json'), JSON.stringify(proof, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ normalSemantic479: 'PASS', normalSource31Scope24: 'PASS', normalWhole394Model: 'PASS',
  protected327: 'PASS', remaining386Pages: 'PASS', originalSevenPlusCurrentFCC1: 'PASS',
  historicalFCCGenuineDeferral: 'PASS', noNewPDF: true, activeWrites: 0, strictNetGain: 0 }))
