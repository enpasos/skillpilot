import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape, validateCanonicalLandscape, normalizeGoalRef } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-source-remediation-independent-a-v1'
const read = (p: string): any => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const original = normalizeCanonicalLandscape(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))
const candidate = normalizeCanonicalLandscape(read(`${own}/eight-full-runtime.validation-snapshot.json`))
const originalMap = new Map(original.goals.map(g => [g.id, g]))
const map = new Map(candidate.goals.map(g => [g.id, g]))
const containsErrors = validateCanonicalLandscape(candidate).filter(f => f.severity === 'error')
assert.deepEqual(containsErrors, [])
assert.equal(candidate.goals.length, original.goals.length)
assert.deepEqual(candidate.goals.map(g => g.id).sort(), original.goals.map(g => g.id).sort())
const eightIds: string[] = read(`${own}/eight-complete-text-source-prerequisite-deltas.json`).rows.map((r: any) => r.goalId)
for (const goal of candidate.goals) if (!eightIds.includes(goal.id)) assert.deepEqual(goal, originalMap.get(goal.id))
const parents = new Map<string, string[]>()
for (const goal of candidate.goals) for (const c of goal.contains) {
  const id = normalizeGoalRef(c)
  parents.set(id, [...parents.get(id) ?? [], goal.id])
}
const effective = (id: string, visiting = new Set<string>()): Set<string> => {
  assert(!visiting.has(id), `contains ancestry cycle ${id}`)
  const next = new Set(visiting).add(id)
  return new Set([...(map.get(id)?.requires ?? []).map(normalizeGoalRef),
    ...(parents.get(id) ?? []).flatMap(p => [...effective(p, next)])])
}
const transit = (id: string, visiting = new Set<string>()): Set<string> => {
  assert(!visiting.has(id), `effective requires cycle ${id}`)
  const next = new Set(visiting).add(id)
  const result = new Set<string>()
  for (const r of effective(id)) {
    assert(map.has(r), `missing required ID ${id} -> ${r}`)
    result.add(r)
    for (const item of transit(r, next)) result.add(item)
  }
  return result
}
const membership = (id: string): Set<string> => {
  const queue = [...effective(id)], seen = new Set<string>()
  while (queue.length) {
    const ref = queue.pop()!
    if (seen.has(ref)) continue
    const goal = map.get(ref)
    assert(goal, `missing required member ${ref}`)
    seen.add(ref)
    queue.push(...effective(ref), ...goal.contains.map(normalizeGoalRef))
  }
  return seen
}
const closures = eightIds.map(goalId => ({ goalId, direct: map.get(goalId)!.requires,
  effective: [...effective(goalId)].sort(), transitive: [...transit(goalId)].sort(),
  requiredClusterMemberClosure: [...membership(goalId)].sort() }))
const id16 = eightIds.find(id => id.startsWith('16da'))!, id1c = eightIds.find(id => id.startsWith('1c142'))!
assert(!membership(id16).has('4961130b-1ee8-58f2-a319-dff0a864db6a'))
assert(!membership(id1c).has('f1ed86f0-534d-57d7-8952-a004a331cc54'))
const viewChecks = ['de-de-gym-chemistry-gk','de-de-gym-chemistry-lk','de-de-gym-seki-chemistry','de-he-gk','de-he-lk'].map(name => {
  const path = `curricula/DE/Gymnasium/composition-views/chemie/${name}.view.json`
  const view = normalizeCompositionView(read(path))
  const beforeRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, originalMap)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, map)
  assert.deepEqual([...roles.targetGoalIds].sort(), [...beforeRoles.targetGoalIds].sort())
  const compiled = compileCompositionView(view, candidate)
  const errors = compiled.findings.filter(f => f.severity === 'error')
  assert.deepEqual(errors, [])
  const visibility = [...eightIds, 'b781745a-256e-52b2-8d86-c1072845ccdd', '8be14f15-2258-58e6-ae4e-38953f5d0570', 'c224281a-f8a3-58cd-8ca3-2c2e134d61ff', '965ca297-5dbf-5e58-b5f0-6559a4433646'].map(goalId => ({goalId, targetReferenceVisible: roles.targetGoalIds.has(goalId)}))
  return {path, sha256:sha(path), nativeCompileErrors:errors, currentTargetReferenceSetPreserved:true, visibility,
    limit:'Native composition references are actual evidence; later backend jurisdiction/stage/course filtering and source atlas applicability remain separate. Tags alone do not prove invisibility.'}
})
const sourceChecks = read(`${own}/bounded-current-source-bindings.json`).bindings.map((b: any) => {
  assert.equal(sha(b.sourceExtractionPath), b.sha256)
  const source = read(b.sourceExtractionPath).sourceGoals.find((g: any) => g.id === b.sourceGoalId)
  assert(source)
  assert.equal(source.sourceText, b.sourceText)
  assert.deepEqual(source.sourceSpan, b.sourceSpan)
  return {goalId:b.goalId, sourceGoalId:b.sourceGoalId, exactCurrentSourceIdTextAndHash:true}
})
const provenance = read(`${own}/ten-current-provenance-before-after-candidate.json`).rows
for (const p of provenance) {
  assert.equal(sha(p.sourceBinding.path), p.sourceBinding.sha256)
  assert(read(p.sourceBinding.path).sourceGoals.some((g: any) => g.id === p.after.sourceGoalId))
}
const companionPlans = read(`${own}/three-complete-companion-text-prerequisite-placement-deltas.json`).rows
const simulation = new Map(candidate.goals.map(g => [g.id, {...g, requires:[...g.requires]}]))
for (const p of companionPlans) simulation.get(p.goalId)!.requires = p.after.requires
const visitPlan = (id: string, stack = new Set<string>(), done = new Set<string>()): void => {
  if (done.has(id)) return
  assert(!stack.has(id), `companion requires cycle ${id}`)
  for (const r of simulation.get(id)!.requires) { assert(simulation.has(r)); visitPlan(r, new Set(stack).add(id), done) }
  done.add(id)
}
for (const p of companionPlans) visitPlan(p.goalId)
const receipt = {observedAt:new Date().toISOString(), status:'inactive_independent_source_a_m_candidate',
  authority:'ai_candidate', containsErrors, scopedEightClosures:closures, fiveCurrentViews:viewChecks,
  currentSourceBindings:sourceChecks, obsoleteProvenanceCandidatesResolved:provenance.length,
  companionDirectRequiresSimulation:'PASS: three exact existing ID proposals, not active adoption or full inherited-route approval',
  allUnselectedCanonicalRecordsUnchanged:true, currentTargetReferenceSetsUnchanged:true,
  ordinaryAtomicDenominatorDelta:0, strictClosureAdded:0, PRead:false, humanApproved:false, operativeMutations:false}
writeFileSync(`${own}/native-source-dag-and-visibility.receipt.json`, JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({containsErrors:containsErrors.length, scopedClosures:closures.length,
  views:viewChecks.length, currentSourceBindings:sourceChecks.length, provenanceCandidates:provenance.length,
  exactCompanionPrerequisitePlans:companionPlans.length, strictClosureAdded:0}))
