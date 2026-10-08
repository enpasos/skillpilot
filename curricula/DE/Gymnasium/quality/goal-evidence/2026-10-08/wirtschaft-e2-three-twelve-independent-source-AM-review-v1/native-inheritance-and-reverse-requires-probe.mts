// Apache-2.0. Targeted independent technical inspection; all changes remain inert.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { buildCanonicalGraphIndex, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/'
const author = base + 'wirtschaft-e2-three-twelve-source-atomicity-author-v2'
const own = base + 'wirtschaft-e2-three-twelve-independent-source-AM-review-v1'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const hash = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(path)).digest('hex')
const candidate = read(author + '/canonical-three-clusters-twelve-atoms.inert.json')
const newIds: string[] = read(author + '/atomic-goal-ids.candidate.json')
const parents: string[] = read(author + '/stable-parent-goal-ids.json')
const impact = read(author + '/current-mapping-and-reverse-requires-impact.open.json')
const goalMap = (graph: any) => new Map<string, any>(graph.goals.map((g: any) => [g.id, g]))
const unprotected = goalMap(candidate)
const protectedGraph = structuredClone(candidate)
for (const g of protectedGraph.goals) if (newIds.includes(g.id)) {
  g.extendedData.applicabilityMappingInheritance = 'boundary'
}
const protectedMap = goalMap(protectedGraph)
const atomicScope = new Set(newIds)
const currentInputUpdates: any[] = []
const evidence = impact.foreignAndOriginalMappingsRetainedByteExact.flatMap((file: any) => {
  const actualMapping = read(file.mappingPath)
  if (hash(file.mappingPath) !== file.originalSha256) {
    // Root integrated one independently reviewed source-page locator correction.
    // Compare the entire current mapping and source objects before using them.
    assert.ok(file.mappingPath.includes('/DE-BW/upper-secondary/'))
    const historicalPath = base + 'wirtschaft-q1-bw-two-current-source-location-successors-author-v1/unchanged-original-mapping-bytes/upper-secondary/bw_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'
    assert.equal(hash(historicalPath), file.originalSha256)
    const originalMapping = read(historicalPath)
    const comparableMapping = structuredClone(actualMapping)
    comparableMapping.sourceExtractionPath = originalMapping.sourceExtractionPath
    assert.deepEqual(comparableMapping, originalMapping)
    const originalSource = read(originalMapping.sourceExtractionPath)
    const actualSource = read(actualMapping.sourceExtractionPath)
    const comparableSource = structuredClone(actualSource)
    assert.equal(actualSource.sourceGoals[3].sourceRef, 'Bildungsplan 2016 Gymnasium Wirtschaft Baden-Wuerttemberg, 3.1.1 (4), S. 14.')
    assert.equal(originalSource.sourceGoals[3].sourceRef, 'Bildungsplan 2016 Gymnasium Wirtschaft Baden-Wuerttemberg, 3.1.1 (4), S. 13.')
    comparableSource.sourceGoals[3].sourceRef = originalSource.sourceGoals[3].sourceRef
    assert.deepEqual(comparableSource, originalSource)
    currentInputUpdates.push({ mappingPath: file.mappingPath, historicalPath, historicalSha256: hash(historicalPath), actualMappingSha256: hash(file.mappingPath), onlyActualMappingDelta: '/sourceExtractionPath', actualSourceExtractionPath: actualMapping.sourceExtractionPath, actualSourceSha256: hash(actualMapping.sourceExtractionPath), onlySourceDelta: '/sourceGoals/3/sourceRef', scopeOfOurIndependentCheck: 'whole parsed objects compared, all IDs, competencies, edges and review decisions identical; this is not a new independent PDF-location adjudication' })
  }
  for (const edge of file.edgesToStableParents) {
    assert.ok(actualMapping.mappings.some((row: any) => row.legacyGoalId === edge.legacyGoalId && row.canonicalGoalId === edge.canonicalGoalId))
    const oldSource = read(file.sourceExtractionPath).sourceGoals.find((row: any) => row.id === edge.legacyGoalId)
    const currentSource = read(actualMapping.sourceExtractionPath).sourceGoals.find((row: any) => row.id === edge.legacyGoalId)
    assert.deepEqual(currentSource, oldSource, 'Actual affected source-goal input changed')
  }
  return file.edgesToStableParents.map((edge: any) => ({
    mappingPath: file.mappingPath, sourceGoalId: edge.legacyGoalId,
    targetId: edge.canonicalGoalId,
    authorCandidateInheritedNewAtomIds: sourceAtlasDescendants(edge.canonicalGoalId, unprotected, atomicScope, candidate.landscapeId),
    protectedCandidateInheritedNewAtomIds: sourceAtlasDescendants(edge.canonicalGoalId, protectedMap, atomicScope, candidate.landscapeId),
  }))
})
assert.equal(evidence.length, 24)
assert.ok(evidence.every((row: any) => row.authorCandidateInheritedNewAtomIds.length === 4))
assert.ok(evidence.every((row: any) => row.protectedCandidateInheritedNewAtomIds.length === 0))
const direct = newIds.map(id => ({ goalId: id, actualTargets: sourceAtlasDescendants(id, protectedMap, atomicScope, candidate.landscapeId) }))
assert.ok(direct.every(row => row.actualTargets.length === 1 && row.actualTargets[0] === row.goalId))

// Only the two independently inspected incoming dependencies are changed here.
const alternative = read(author + '/reverse-requires.minimal-independent-review-alternative.patch.json')
for (const op of alternative.ops) {
  const goal = protectedMap.get(op.goalId)
  assert.deepEqual(goal.requires, op.before)
  goal.requires = op.after
}
const reachable = (map: Map<string, any>, id: string): Set<string> => {
  const found = new Set<string>()
  const visit = (next: string) => {
    if (found.has(next)) return
    found.add(next)
    const goal = map.get(next)
    assert.ok(goal, 'Unknown goal ' + next)
    for (const raw of goal.requires ?? []) visit(raw.replace(candidate.landscapeId + ':', ''))
    // A cluster prerequisite entails its members in the intended mastery model.
    for (const raw of goal.contains ?? []) visit(raw.replace(candidate.landscapeId + ':', ''))
  }
  visit(id)
  return found
}
const assessment = '57984b50-0dbe-4fb1-a020-0f25953a8b74'
const project = '596c02e3-6263-5084-8593-c5f51808326b'
const paths = [assessment, project].map(id => ({
  goalId: id,
  authorCandidateReachableNewBYAtoms: newIds.filter(x => reachable(unprotected, id).has(x)),
  minimalAlternativeReachableNewBYAtoms: newIds.filter(x => reachable(protectedMap, id).has(x)),
}))
assert.equal(paths[0].authorCandidateReachableNewBYAtoms.length, 12)
assert.equal(paths[1].authorCandidateReachableNewBYAtoms.length, 4)
assert.ok(paths.every(row => row.minimalAlternativeReachableNewBYAtoms.length === 0))
const diagnostics = validateCanonicalLandscape(protectedGraph, buildCanonicalGraphIndex(protectedGraph))
assert.equal(diagnostics.filter((x: any) => x.severity === 'error').length, 0)
for (const edge of ['requires', 'contains']) {
  const visiting = new Set<string>(), done = new Set<string>()
  const visit = (id: string) => {
    assert.ok(!visiting.has(id), 'Cycle ' + edge + ' ' + id)
    if (done.has(id)) return
    visiting.add(id)
    for (const raw of protectedMap.get(id)[edge] ?? []) {
      const next = raw.replace(candidate.landscapeId + ':', '')
      assert.ok(protectedMap.has(next))
      visit(next)
    }
    visiting.delete(id); done.add(id)
  }
  for (const id of protectedMap.keys()) visit(id)
}
writeFileSync(own + '/protected-boundaries-and-two-requires.inert.json', JSON.stringify(protectedGraph, null, 2) + '\n')
writeFileSync(own + '/native-inheritance-and-reverse-requires-probe.actual.json', JSON.stringify({
  role: 'independent_targeted_machine_inspection', actualCheckedAt: new Date().toISOString(),
  authorInputSha256: hash(author + '/canonical-three-clusters-twelve-atoms.inert.json'),
  realNativeMethod: 'sourceAtlasDescendants on all24 actual historic parent targets plus12 exact direct component targets',
  evidence, currentInputUpdates, initialStoppedGuard: 'The first attempt rejected the changed BW mapping bytes before any output was written; the actual whole-object comparison above resolves only this technical input difference.', actualDirectComponentTargets: direct, reverseRequiresClosure: paths,
  actualNativeCanonicalDiagnostics: diagnostics, requiresAndContainsDags: 'PASS',
  limits: ['Requires closure also traverses contains to expose the cluster mastery scope; this is an explicit conservative semantic probe, not a learner runtime test.', 'No full applicability compiler, source atlas campaign, composition compilation or Layer-A dashboard run is claimed here.', 'Old whole-canonical snapshot is a review input, never a live replacement. Current unrelated goal/resource changes must be preserved by a later narrow guarded integration.'],
  activeWrites: 0, currentAtomicDenominatorChanged: false, newStrictClosures: 0,
}, null, 2) + '\n')
console.log(JSON.stringify({actualHistoricalParentEdges: evidence.length, inheritedNewAtomsBefore: 96, inheritedNewAtomsAfter: 0, retainedDirectComponents: direct.length, assessmentOptionalAtomsBefore: 12, assessmentOptionalAtomsAfter: 0, nativeErrors: diagnostics.filter((x: any) => x.severity === 'error').length, activeWrites: 0}))
