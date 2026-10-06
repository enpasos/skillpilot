// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { goalEvidenceSemanticPayload, goalEvidenceReviewInputPayload } from '../../../../../../../app/scripts/goalEvidenceProfileModel'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'

const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
const old = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
const out = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-independent-a-v1'
const canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const sk = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const hash = (v: unknown) => createHash('sha256').update(stableGoalBookJson(v)).digest('hex')
const before = read(old + '/prospective-input-tree/' + canonical)
const after = read(author + '/proposed-active-tree/' + canonical)
const live = read(author + '/current-376-inputs/' + canonical)
const beforeKinds = read(old + '/prospective-input-tree/' + sk)
const afterKinds = read(author + '/semantic-kinds.author-binding-candidate.json')
const beforeQA = read(old + '/prospective-input-tree/' + qaPath)
const liveQA = read(author + '/current-376-inputs/' + qaPath)
const digests = (qa: any) => Object.fromEntries(qa.records.filter((r: any) => r.imageUrl && r.assetSha256).map((r: any) => [r.imageUrl, r.assetSha256]))
const candidateDigests = digests(beforeQA)
const byAfter = new Map<string, any>(after.goals.map((g: any) => [g.id, g]))
const byLive = new Map<string, any>(live.goals.map((g: any) => [g.id, g]))
const kinds = new Map<string, string>(beforeKinds.decisions.map((d: any) => [d.goalId, d.semanticKind]))
const curriculumIds = before.goals.filter((g: any) => kinds.get(g.id) === 'curricularAtomic').map((g: any) => g.id)
assert.equal(curriculumIds.length, 378)
for (const goal of before.goals.filter((g: any) => kinds.get(g.id) === 'curricularAtomic')) {
  const next = byAfter.get(goal.id)
  assert.deepEqual(goalEvidenceSemanticPayload(goal, 'positive-understanding-evidence-v2', 'curricularAtomic'), goalEvidenceSemanticPayload(next, 'positive-understanding-evidence-v2', 'curricularAtomic'), goal.id)
  assert.deepEqual(goalEvidenceReviewInputPayload(goal, 'positive-understanding-evidence-v2', candidateDigests, 'curricularAtomic'), goalEvidenceReviewInputPayload(next, 'positive-understanding-evidence-v2', candidateDigests, 'curricularAtomic'), goal.id)
}
const strict = read(author + '/34-current-strict-d-binding-inputs.author-frozen.json')
for (const id of strict.currentStrictGoalIds) {
  assert.deepEqual(buildGoalDescriptionCanonicalContext(byLive.get(id)), buildGoalDescriptionCanonicalContext(byAfter.get(id)), id)
}
const fullConfig = read(old + '/full-current.metadata-corrected.config.json')
const view = read(fullConfig.compositionViewPath)
const build = (landscape: any, ledger: any, qa: any) => buildGoalBookModel({landscape, semanticKindLedger: ledger, compositionView: view, goalVisualizationQa: qa, goalVisualizationAssetDigests: digests(qa), evidenceReviewSources: [], config: fullConfig})
const beforeModel = build(before, beforeKinds, beforeQA)
const afterModel = build(after, afterKinds, beforeQA)
const liveModel = build(live, read(author + '/current-376-inputs/' + sk), liveQA)
assert.equal(beforeModel.pages.length, 378)
assert.equal(afterModel.pages.length, 378)
assert.equal(liveModel.pages.length, 376)
assert.deepEqual(afterModel.pages, read(author + '/full378.after-route-source.author-candidate.book-model.json').pages)
assert.deepEqual(liveModel.pages, read(author + '/live376.current-strict-binding-input.book-model.json').pages)
const beforePage = new Map(beforeModel.pages.map(p => [p.goalId, p]))
const afterPage = new Map(afterModel.pages.map(p => [p.goalId, p]))
const livePage = new Map(liveModel.pages.map(p => [p.goalId, p]))
for (const row of strict.perGoalLiveReviewedAndRoutePageInputs) {
  assert.deepEqual(beforePage.get(row.goalId), row.beforeReviewed378Page, row.goalId)
  assert.deepEqual(afterPage.get(row.goalId), row.afterRoute378Page, row.goalId)
  assert.deepEqual(livePage.get(row.goalId), row.live376Page, row.goalId)
  assert.deepEqual(buildGoalDescriptionCanonicalContext(byAfter.get(row.goalId)), row.unchangedCanonicalContext)
}
for (const id of strict.unchanged70WholeGoalCanonicalDPAndReviewed378ToRoute378PageGoalIds) assert.deepEqual(beforePage.get(id), afterPage.get(id), id)
const nativeContains = validateCanonicalLandscape(normalizeCanonicalLandscape(after))
assert.equal(nativeContains.filter(r => r.severity === 'error').length, 0)
const prepared = prepareLandscapeEntries([normalizeCanonicalLandscape(after)]).flatMap(e => e.goals)
const effective = new Map(prepared.map(g => [g.id, g.effectiveRequires]))
const newTasks = ['4cb74d76-99f1-5264-b1e3-448cda47b005', '171b47e2-2c53-50f2-a145-a26b896fd73f']
const terminalRows = newTasks.map(id => ({goalId: id, effectiveRequires: effective.get(id), canonicalRequires: byAfter.get(id).requires, tags: byAfter.get(id).tags, coveredGoalIds: byAfter.get(id).examData.coveredGoalIds}))
for (const row of terminalRows) assert.deepEqual(row.effectiveRequires, row.canonicalRequires)
const scopeInput = read(author + '/native-scope-inputs.actual.json')
for (const row of scopeInput.inputRows) {
  const expected = row.path === canonical ? sha(author + '/proposed-active-tree/' + canonical) : row.sha256
  assert.equal(sha(scopeInput.nativeRoot + '/' + row.path), expected, row.path)
}
const compilerPath = scopeInput.nativeRoot + '/app/scripts/applicabilityCompiler.ts'
assert.equal(sha(compilerPath), sha('app/scripts/applicabilityCompiler.ts'))
const compiler = await import(pathToFileURL(resolve(compilerPath)).href)
const compilation = compiler.buildApplicabilityCompilation()
const chemistry = compilation.reports.find((r: any) => r.landscapeId === 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
assert(chemistry)
assert.equal(chemistry.summary.errors, 0)
const scopeIds = ['3d6699ae-ebbd-5a55-8798-b809a9d74f0a', '18819a59-2442-530f-a7c3-26755398ec66', 'd3cd250f-5221-589d-aa1c-44a4692d1acb', ...newTasks]
const scopeRows = chemistry.goals.filter((g: any) => scopeIds.includes(g.goalId))
assert.equal(scopeRows.length, 5)
for (const row of scopeRows) {
  const expected = row.goalId === newTasks[0] ? ['DE-BY', 'DE-HE'] : ['DE-HE']
  assert.deepEqual(row.compiledApplicability.jurisdiction, expected, row.goalId)
  if (expected.length === 1) assert(!row.evidence.some((e: any) => e.value === 'DE-BY'))
  if (newTasks.includes(row.goalId)) assert(row.evidence.every((e: any) => e.kind === 'assessment-requires'))
}
const sourcePaths = [fullConfig.compositionViewPath, old + '/full-current.metadata-corrected.config.json', old + '/prospective-input-tree/' + sk, old + '/prospective-input-tree/' + qaPath, author + '/semantic-kinds.author-binding-candidate.json', compilerPath, 'app/scripts/applicabilityCompiler.ts', 'app/scripts/goalBookModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/validateGoalDescriptionReviewCampaign.ts', 'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/hooks/useLandscapes.ts']
writeFileSync(out + '/independent-native-context-scope-checks.actual.json', JSON.stringify({schemaVersion: 1, reviewer: 'independent-a', checkedAtUTC: new Date().toISOString(), status: 'PASS independently rebuilt three full native page sets and isolated native applicability compilation', inputCodeAndConfigs: sourcePaths.map(path => ({path, sha256: sha(path)})), isolated497InputRowsVerifiedWithCandidateCanonicalOverlay: true, nativePageCounts: {beforeReviewed: beforeModel.pages.length, route: afterModel.pages.length, live: liveModel.pages.length}, all378CurricularOwnNativePositivePayloadsExact: true, strict104NativeCanonicalContextsExact: true, strict34ThreeStateWholePagesExactlyReproduced: true, strict70BeforeToRouteWholePagesExact: true, nativeContainsDiagnostics: nativeContains, terminalRows, nativeCompilerSummary: chemistry.summary, nativeScopeRows: scopeRows, modelsDigest: {before: hash(beforeModel), route: hash(afterModel), live: hash(liveModel)}, independentBConclusionsRead: false, restoredNativeDBindings: 0, newScientificCompletions: 0, fullCQRExecuted: false, floorCertificationIssued: false, activeWrites: false, humanApproval: false, humanTrial: false}, null, 2) + '\n')
console.log('PASS independent A native: 376/378/378 full pages rebuilt; all34 exact triplets reproduced; all70 predecessor pages exact;378 P payloads and104 D contexts exact; isolated497 inputs verified; quant children/AND/assessment HE-only; Paraben-use assessment BY+HE assessment-requires only; zero compiler errors.')
