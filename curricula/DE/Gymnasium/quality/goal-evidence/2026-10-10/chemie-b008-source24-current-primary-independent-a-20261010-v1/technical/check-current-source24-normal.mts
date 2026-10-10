// SPDX-License-Identifier: Apache-2.0
// Independent A technical verification after the sealed substantive FIRST.
// No active writes, no source-coverage/count exception and no fresh scientific verdict.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve('.')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-current-primary-independent-a-20261010-v1'
const input = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1'
const p26 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1'
const sourceAPI = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const modelAPI = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const sha = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')
const put = (name: string, value: unknown) => {
  const path = resolve(root, own, 'checks', name)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}
const firstPath = own + '/FIRST.current-source24-primary-and-partial-scope.verdict.json'
assert.equal(sha(firstPath), 'sha256:476d573d33974fbe4d16381ef310cd3d5708150031e9201fc9d58191cce86dcc')
const first = read(firstPath)
const landscape = read(input + '/inputs/whole-current511-398-candidate.exact.json')
const kinds = read(input + '/inputs/current511-semantic-kinds.path-only.json')
const goals = new Map(landscape.goals.map((goal: any) => [goal.id, goal]))
const atomIds = new Set<string>(kinds.decisions.filter((decision: any) => decision.semanticKind === 'curricularAtomic').map((decision: any) => decision.goalId))
assert.equal(atomIds.size, 398)
const targetIds = new Set<string>(first.allActual24GoalDecisions.map((decision: any) => decision.goalId))
assert.equal(targetIds.size, 24)
const edgeRows: any[] = []
const uniqueSources = new Map<string, any>()
const scopedTargets = new Set<string>()
const parentRows: any[] = []
for (const decision of first.allActual24GoalDecisions) {
  const goal: any = goals.get(decision.goalId)
  assert.equal(goal.extendedData.applicabilityMappingInheritance, 'boundary')
  const direct = sourceAPI.sourceAtlasDescendants(goal.id, goals, atomIds, landscape.landscapeId)
  assert.deepEqual(direct, [goal.id])
  const inherited = sourceAPI.sourceAtlasDescendants(decision.retainedParentId, goals, atomIds, landscape.landscapeId)
  assert.ok(!inherited.some((id: string) => targetIds.has(id)), 'A generic retained-area mapping inherited into a separately bounded child')
  parentRows.push({ goalId: goal.id, retainedParentId: decision.retainedParentId, directTargetIds: direct, inheritedTargetIds: inherited, inheritedNewChildApproval: false })
  for (const reviewed of decision.actualReviewedEdges) {
    assert.equal(reviewed.edge.matchType, 'partial')
    const mapping = read(reviewed.mappingPath)
    assert.ok(mapping.mappings.some((edge: any) => modelAPI.stableGoalBookJson(edge) === modelAPI.stableGoalBookJson(reviewed.edge)))
    const extractionBinding = reviewed.wholeSourceBodyRef.extraction
    assert.equal(sha(extractionBinding.path), extractionBinding.sha256)
    const extraction = read(extractionBinding.path)
    const source = extraction.sourceGoals.find((goal: any) => goal.id === reviewed.edge.legacyGoalId)
    assert.ok(source)
    assert.equal(source.sourceText, reviewed.actualWholeSourceOperator)
    assert.deepEqual(source.sourceOccurrences || [], reviewed.exactOccurrences || [])
    const passage = extraction.passages.find((item: any) => item.id === source.passageId) || {}
    const docs = extraction.sourceDocuments?.length ? extraction.sourceDocuments : [extraction.sourceDocument]
    const documentKeys = [...new Set([source.sourceDocumentKey, ...(source.tags || []).filter((tag: string) => tag.startsWith('sourceDocument:')).map((tag: string) => tag.slice(15)), passage.sourceDocumentKey].filter(Boolean))]
    assert.ok(documentKeys.length <= 1)
    const documents = documentKeys.length ? docs.filter((doc: any) => doc.key === documentKeys[0]) : docs
    assert.equal(documents.length, 1)
    const levels = [source, passage, documents[0], extraction]
    const stage = sourceAPI.sourceAtlasFacet(levels, 'stage')
    const course = sourceAPI.sourceAtlasFacet(levels, 'courseProfile')
    const scoped = course !== null && stage?.length === 1 && (stage[0] === 'SekI' || course.length > 0)
    if (scoped) scopedTargets.add(goal.id)
    edgeRows.push({ goalId: goal.id, sourceGoalId: source.id, sourceSpan: source.sourceSpan, jurisdiction: extraction.jurisdiction, matchType: reviewed.edge.matchType, stage, courseProfile: course, scoped, sourceOperatorExact: true, occurrenceMetadataExact: true, wholeSourceOrCourseApproval: false })
    uniqueSources.set(extractionBinding.path + '/' + source.id, source)
  }
}
assert.equal(edgeRows.length, 63)
assert.equal(uniqueSources.size, 54)
assert.equal([...uniqueSources.values()].reduce((sum, source) => sum + (source.sourceOccurrences || []).length, 0), 131)
assert.equal(scopedTargets.size, 23)
assert.ok(!scopedTargets.has('e5a5dcd8-053c-55fd-b5c7-bba93779da53'))
assert.equal(new Set(parentRows.map(row => row.retainedParentId)).size, 7)
const c11 = edgeRows.find(row => row.goalId === 'e5a5dcd8-053c-55fd-b5c7-bba93779da53')
assert.deepEqual(c11.stage, ['SekII'])
assert.deepEqual(c11.courseProfile, [])
const observed = read(input + '/checks/actual-normal-whole-source-union-before-unchanged-failing-count-assertion.observed.json')
assert.equal(observed.actualAtomicGoalIds.length, 398)
assert.equal(observed.actualSourceUnionGoalIds.length, 378)
assert.equal(observed.actualUnresolvedScopes.length, 496)
assert.equal(observed.wholeOmittedGoalBodies.length, 20)
const scopedInActualWholeCompiler = new Set<string>()
for (const scope of observed.actualWholeScopes) for (const id of scope.goalIds) if (targetIds.has(id)) scopedInActualWholeCompiler.add(id)
assert.deepEqual([...scopedInActualWholeCompiler].sort(), [...scopedTargets].sort())
const config = read(input + '/source-atlas/whole398-source24.normal-probe.inputs.json')
assert.equal(config.expectedCurricularAtomicGoalCount, 398)
assert.equal(config.expectedUnresolvedScopeDecisionCount, 496)
const policy = modelAPI.parseSubjectDurationModelPolicy(read(input + '/inputs/current-normal-duration-policy.exact.json'), config.subject, config.expectedJurisdictions, observed.actualWholeScopes)
assert.equal(policy.size, 16)
const fresh = read(input + '/native/whole398-fresh-normal-review-model.actual.json')
const prior = read(p26 + '/native/after-whole-normal-book-model.actual.json')
assert.equal(fresh.pages.length, 398)
assert.equal(modelAPI.stableGoalBookJson(fresh.pages), modelAPI.stableGoalBookJson(prior.pages))
const compactActive = read(p26 + '/source/current-active381-362-source-projection.receipt.exact.json')
const active = sourceAPI.expandGoalBookSourceAtlasReceipt(compactActive)
const activeIds = new Set(active.scopes.flatMap((scope: any) => scope.goalIds))
assert.equal(activeIds.size, 362)
put('normal-source24-facets-boundaries-duration-and-native.actual.json', {
  schemaVersion: 1, role: 'Independent A targeted technical confirmation after sealed substantive FIRST',
  actualNormalAPIs: ['sourceAtlasFacet', 'sourceAtlasDescendants', 'parseSubjectDurationModelPolicy', 'stableGoalBookJson', 'expandGoalBookSourceAtlasReceipt'],
  firstVerdict: { path: firstPath, sha256: sha(firstPath) },
  actual54WholeSourceBodiesAnd131OccurrenceMetadataExact: true,
  actual63ExplicitPartialEdgeChecks: edgeRows, actual24BoundaryChecks: parentRows,
  actual23ScopedChildIds: [...scopedTargets].sort(), actualC11ScopeHold: c11,
  actualWhole398SourceUnion: 378, actualWhole20Omitted: true, actualWhole496Unresolved: true,
  actualOldActive381SourceUnion: activeIds.size, actualNormalDurationPolicyJurisdictions: policy.size,
  actualNormalDurationPolicyScopes: observed.actualWholeScopes.length,
  all398ExistingNativePageBodiesAndFingerprintsExactlyRetained: true,
  nativeModelSourceAtlasMappingConsumption: false,
  nativeEqualityDoesNotApproveSourceCourseOrNationalPublication: true,
  whole398SourceCompilerStillHasRequiredFailingCountAssertion: true,
  scientificFirstChanged: false, strictGain: 0, restoredActiveBindings: 0, humanApproval: false, activeWrites: false
})
console.log(JSON.stringify({ actualNormalTargetedChecks: 'PASS', wholeSourceBodies: uniqueSources.size, literalOccurrenceMetadata: 131, explicitPartialEdges: edgeRows.length, boundedChildren: targetIds.size, actualScopedChildren: scopedTargets.size, C11: 'HOLD_UNSPECIFIED_SOURCE_COURSE', wholeSourceCoverage: 'HOLD_378_OF_398', nativePagesExactlyRetained: fresh.pages.length, strictGain: 0 }))
