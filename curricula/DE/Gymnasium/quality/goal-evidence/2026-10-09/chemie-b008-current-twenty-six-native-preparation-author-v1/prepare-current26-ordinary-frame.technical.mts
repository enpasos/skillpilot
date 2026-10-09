// SPDX-License-Identifier: Apache-2.0
// Inactive normal canonical review frame; unresolved source/projection gates stay open.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookModel, loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { emptyGoalVisualizationAiReview } from '../../../../../../../app/scripts/goalVisualizationQaModel.ts'

const root = resolve('.')
const own = dirname(fileURLToPath(import.meta.url))
const cap = resolve(root, 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule')
const rel = (p: string) => relative(root, p)
const sha = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const declarations = new Map<string, any>()
const bind = (p: string) => {
  assert.equal(lstatSync(p).isSymbolicLink(), false)
  const b = readFileSync(p), value = { path: rel(p), sha256: sha(b), bytes: b.length }
  declarations.set(p, value)
  return value
}
const read = (p: string) => { bind(p); return JSON.parse(readFileSync(p, 'utf8')) }
const write = (p: string, x: any) => {
  assert.ok(p.startsWith(own + '/'), 'Only new own technical outputs')
  const bytes = Buffer.isBuffer(x) ? x : Buffer.from(typeof x === 'string' ? x : JSON.stringify(x, null, 2) + '\n')
  if (existsSync(p)) assert.ok(readFileSync(p).equals(bytes), 'Preserve existing different output ' + p)
  else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, bytes) }
  return bind(p)
}
const capCopy = (p: string, source: string) => {
  const target = resolve(cap, p)
  assert.ok(target.startsWith(cap + '/'))
  assert.equal(lstatSync(source).isSymbolicLink(), false)
  mkdirSync(dirname(target), { recursive: true })
  if (existsSync(target)) assert.ok(readFileSync(target).equals(readFileSync(source)), 'Capsule input mismatch ' + p)
  else copyFileSync(source, target)
  assert.equal(lstatSync(target).isSymbolicLink(), false)
}
const verified = (b: any) => {
  const actual = bind(resolve(root, b.path))
  assert.equal(actual.sha256, 'sha256:' + b.sha256.replace(/^sha256:/, ''))
  if (b.bytes !== undefined) assert.equal(actual.bytes, b.bytes)
  return actual
}
assert.equal(existsSync(resolve(own, 'neutral-current26-native-independent-review.entry.json')), false, 'Final packet immutable')
const actualCanonPath = resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const actualKindsPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const actualQAPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const before = read(actualCanonPath), beforeKinds = read(actualKindsPath), beforeQA = read(actualQAPath)
const initialBindings = [bind(actualCanonPath), bind(actualKindsPath), bind(actualQAPath)]
assert.equal(before.goals.length, 480)
assert.equal(beforeKinds.counts.curricularAtomic, 378)
assert.equal(beforeQA.records.length, 379)
const candidatePath = resolve(own, 'candidate/canonical504-current26-resource-links.inactive.json')
const candidate = read(candidatePath)
const raw = read(resolve(own, 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json'))
const ids: string[] = raw.routineBodies.map((r: any) => r.wholeGoal.id)
assert.equal(new Set(ids).size, 26)
const visual = read(resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-twenty-six-current-visual-pairing-technical-v1/all26-actual-role-pairing.current-inactive.v2.json'))
const visualById = new Map<string, any>(visual.rows.map((r: any) => [r.goalId, r]))
const futureKindsPath = resolve(own, 'candidate/semantic-kinds.current504.technical-review-input.json')
const futureKinds = read(resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-sl-specific-source-continuation-author-root-20261008-v21/native/current504.semantic-kind.technical-input.json'))
futureKinds.sourceLandscapePath = rel(candidatePath)
assert.equal(futureKinds.counts.curricularAtomic, 395)
write(futureKindsPath, futureKinds)
const qa = structuredClone(beforeQA), assetOrigins = new Map<string, string>()
for (const q of qa.records) if (q.visualizationState === 'available') assetOrigins.set(q.imageUrl, resolve(root, q.publicAssetPath))
for (const gid of ids) {
  const goal = candidate.goals.find((g: any) => g.id === gid), image = visualById.get(gid)
  assert.ok(goal && image)
  const raster = verified(image.actualSelectedRaster), link = image.selectedResourceLink
  assert.deepEqual(goal.resourceLinks, [link])
  assert.equal(image.pairedCurrentRoleStatus, 'PAIRED_KEEP')
  assetOrigins.set(link.url, resolve(root, raster.path))
  let q = qa.records.find((q: any) => q.goalId === gid)
  if (!q) {
    q = { goalId: gid, title: goal.title, description: goal.description, subject: 'chemie',
      landscapeId: candidate.landscapeId, landscapePath: rel(candidatePath),
      umlautsCorrectChatGpt: 'no', contentApprovedChatGpt: 'no', humanApproved: 'no',
      humanIssueIdentified: 'no', humanIssueDescription: '', humanReviewedAt: null, humanReviewer: '' }
    qa.records.push(q)
  }
  Object.assign(q, { title: goal.title, description: goal.description, visualizationState: 'available',
    missingReason: '', imageUrl: link.url, publicAssetPath: 'app/public' + link.url,
    canonicalAssetPath: raster.path, assetSha256: raster.sha256, chatGptReviewedAt: null,
    chatGptReviewer: '', chatGptNotes: 'Inactive native candidate; exact existing paired image-only verdicts preserved separately. Native D/P/source/atomicity/memory reviews remain pending.',
    ...emptyGoalVisualizationAiReview() })
}
for (const old of beforeQA.records) {
  const next = qa.records.find((q: any) => q.goalId === old.goalId)
  if (!ids.includes(old.goalId)) assert.deepEqual(next, old)
  for (const key of Object.keys(old).filter(k => k.startsWith('human'))) assert.deepEqual(next[key], old[key])
}
const qaPath = resolve(own, 'candidate/visualization-qa.current504.native-unapproved.json')
write(qaPath, qa)
const reviewView = { viewId: 'chemie-b008-current504-native-author-review-universe-395-20261009-v1',
  landscapeId: candidate.landscapeId, scope: { schoolForm: 'Gymnasium', stage: 'CrossStage' },
  rootNodes: [{ kind: 'structure', id: 'chemie-m7-review-root', label: 'Chemie – kanonische M7-Prüfsicht',
    children: [{ kind: 'canonicalSubtree', goalId: '442c31c5-c561-5c7a-90bb-2335d779175c' }] }] }
const reviewViewPath = resolve(own, 'candidate/all-current504-candidate-atoms.review-only.view.json')
write(reviewViewPath, reviewView)
const actualNational = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json', root)
assert.equal(actualNational.model.pages.length, 359)
write(resolve(own, 'native/national359.actual-current-national-loader.book-model.json'), actualNational.model)
const rootBeforeConfig = { schemaVersion: 1, bookId: 'chemie-b008-current480-review-before',
  title: 'Chemie – kanonische M7-Prüfsicht', landscapePath: rel(actualCanonPath),
  compositionViewPath: rel(reviewViewPath), semanticKindLedgerPath: rel(actualKindsPath),
  goalVisualizationQaPath: rel(actualQAPath), publicationMode: 'review',
  atlasBaseUrl: 'https://skillpilot.com/lernzielbuch', evidenceReviewPaths: [],
  outputPath: rel(resolve(own, 'native/whole378.same-canonical-root.before.book-model.json')) }
const rootBeforeConfigPath = resolve(own, 'candidate/whole378.same-canonical-root.before.config.json')
write(rootBeforeConfigPath, rootBeforeConfig)
const rootBefore = await loadGoalBookBuildInputs(rel(rootBeforeConfigPath), root)
assert.equal(rootBefore.model.pages.length, 378)
write(resolve(root, rootBeforeConfig.outputPath), rootBefore.model)
const futureConfig = { ...rootBeforeConfig, bookId: 'chemie-b008-current504-inactive-native-universe',
  title: 'Chemie – kanonische M7-Prüfsicht', landscapePath: rel(candidatePath),
  semanticKindLedgerPath: rel(futureKindsPath), goalVisualizationQaPath: rel(qaPath),
  outputPath: rel(resolve(own, 'native/whole395.inactive-review-only.book-model.json')) }
const futureConfigPath = resolve(own, 'candidate/whole395.inactive-review-only.config.json')
write(futureConfigPath, futureConfig)
const assetDigests: Record<string, string> = {}
const copiedAssets: any[] = []
for (const q of qa.records) if (q.visualizationState === 'available') {
  const origin = assetOrigins.get(q.imageUrl)
  assert.ok(origin)
  const actual = bind(origin)
  assert.equal(actual.sha256, q.assetSha256)
  assetDigests[q.imageUrl] = actual.sha256
  capCopy(q.publicAssetPath, origin)
  copiedAssets.push({ imageUrl: q.imageUrl, actualOrigin: actual, operativeCapsulePath: q.publicAssetPath })
}
const built = buildGoalBookModel({ landscape: candidate, compositionView: reviewView,
  semanticKindLedger: futureKinds, goalVisualizationQa: qa, goalVisualizationAssetDigests: assetDigests,
  evidenceReviewSources: [], config: futureConfig } as any)
assert.equal(built.pages.length, 395)
write(resolve(root, futureConfig.outputPath), built)
for (const p of [candidatePath, futureKindsPath, qaPath, reviewViewPath, futureConfigPath]) capCopy(rel(p), p)
const loaded = await loadGoalBookBuildInputs(rel(futureConfigPath), cap)
assert.equal(stableGoalBookJson(loaded.model), stableGoalBookJson(built))
const projectedPage = (page: any) => { const out = structuredClone(page); delete out.ordinal; return out }
const futurePages = new Map<string, any>(built.pages.map(p => [p.goalId, p]))
const comparisons = rootBefore.model.pages.map(page => {
  const next = futurePages.get(page.goalId)
  if (!next) return { goalId: page.goalId, selectedRoutine: ids.includes(page.goalId), convertedOldFamily: true,
    removedFromAtomicReviewPages: true, wholeBeforePage: page }
  const old = projectedPage(page), after = projectedPage(next)
  const fields = Object.keys({ ...old, ...after }).filter(k => stableGoalBookJson(old[k]) !== stableGoalBookJson(after[k]))
  return { goalId: page.goalId, selectedRoutine: ids.includes(page.goalId), convertedOldFamily: false,
    changedFieldsExcludingOrdinal: fields, wholeBeforePage: page, wholeInactiveCandidatePage: next }
})
assert.equal(comparisons.filter(c => c.convertedOldFamily).length, 7)
const priorContext = read(resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-sl-specific-source-continuation-author-root-20261008-v21/actual-native43-source-view-findings-three-SL-models-and-current177-contexts.json'))
const protectedRows = priorContext.all177ProtectedActualPageContextComparisons.map((r: any) => {
  const actual = comparisons.find(c => c.goalId === r.goalId)
  assert.ok(actual && !actual.convertedOldFamily)
  return { goalId: r.goalId, currentCanonicalRootComparison: actual, historicalContextReviewStatus: r.reviewStatus,
    priorActualChangedFields: r.actualChangedPageFields, targetedCurrentContextReviewPending: (actual.changedFieldsExcludingOrdinal?.length ?? 0) > 0 }
})
assert.equal(protectedRows.length, 177)
write(resolve(own, 'native/whole378-to-inactive395.same-review-root.actual-page-context-diff.json'), {
  schemaVersion: 1, role: 'Whole page comparison in an identical normal canonical-root review view; not a national source-scope approval',
  beforePages: 378, inactiveCandidatePages: 395, wholeBeforePagesAndCandidateRows: comparisons,
  removedFormerAtomicFamilies: comparisons.filter(c => c.convertedOldFamily).map(c => c.goalId),
  newlyAuthoredAtomicPageIds: built.pages.filter(p => !rootBefore.model.pages.some(b => b.goalId === p.goalId)).map(p => p.goalId),
  currentProtected177Rows: protectedRows,
  actualProtectedContextDeltaCount: protectedRows.filter((r: any) => r.targetedCurrentContextReviewPending).length,
  currentNationalBeforeModelPath: rel(resolve(own, 'native/national359.actual-current-national-loader.book-model.json')),
  normalNationalCandidateAtlasStatus: 'HOLD; canonical review frame does not resolve source/course/placement obligations',
  activeWrites: [], strictGain: 0, humanApproval: false })
write(resolve(own, 'checks/ordinary-thin-capsule-current26-frame.actual.json'), {
  schemaVersion: 1, capsulePath: rel(cap), normalApis: ['loadGoalBookBuildInputs', 'buildGoalBookModel'],
  normalCurrentNationalPages: 359, normalSameRootBeforePages: 378, normalInactiveCanonicalPages: 395,
  wholeCandidateCapsuleModelExact: true, actualImageFileCount: copiedAssets.length,
  actualImageOrigins: copiedAssets, symlinksCreated: 0, fullHistoryCopies: 0,
  independentNativeApproval: false, wholeSource19Closure: false, atomicityAndMemoryReviewStatus: 'PENDING',
  netStrictGain: 0, activeWrites: [] })
const probe = read(resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-paired-source-refinement-technical-root-20261008-v24/ordinary-atlas.current504.pending-source-decisions.probe.inputs.json'))
probe.landscapePath = rel(candidatePath); probe.semanticKindLedgerPath = rel(futureKindsPath)
probe.outputDirectory = rel(resolve(own, 'source-atlas/pending-normal-source-views'))
probe.manifestPath = rel(resolve(own, 'source-atlas/pending-normal-source-manifest.json'))
probe.navigationViewPath = rel(resolve(own, 'source-atlas/pending-normal-navigation.view.json'))
write(resolve(own, 'source-atlas/current504-genuine-paired-source.normal-probe.inputs.json'), probe)
let atlasError = ''
try {
  const atlas = buildGoalBookSourceAtlasInputs(probe, root)
  for (const [p, bytes] of Object.entries(atlas.outputs)) write(resolve(root, p), bytes)
  write(resolve(own, 'source-atlas/ordinary-current504-source-probe.actual.json'), {
    schemaVersion: 1, normalCompilerExitEquivalent: 0, actualReceipt: atlas.receipt,
    nativeWholeScopeApproval: false, activeWrites: [], strictGain: 0 })
} catch (error) {
  atlasError = error instanceof Error ? error.message : String(error)
  write(resolve(own, 'source-atlas/ordinary-current504-source-probe.actual.json'), {
    schemaVersion: 1, normalCompilerExitEquivalent: 1, actualError: atlasError,
    unchangedHistoricalFailurePreserved: true, normalSourceAtlasReady: false,
    nativeWholeScopeApproval: false, activeWrites: [], strictGain: 0 })
}
for (const b of initialBindings) assert.deepEqual(bind(resolve(root, b.path)), b)
write(resolve(own, 'checks/current-chemistry-three-active-file-preservation.actual.json'), {
  schemaVersion: 1, actualActiveBindings: initialBindings, exactPreserved: true, activeWrites: [] })
console.log(JSON.stringify({ currentNationalPages: 359, currentWholeAtomicPages: 378, candidateInactive395: true, selectedImageRoles: 26,
  all395CapsuleModelExact: true, protected177CurrentContextDeltaCount: protectedRows.filter((r: any) => r.targetedCurrentContextReviewPending).length,
  ordinaryCandidateSourceAtlas: atlasError ? 'HOLD' : 'compiler_created_not_scientifically_approved', atlasError,
  sourceD_P_A_M_VApproval: false, activeWrites: 0, strictGain: 0 }))
