import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  normalizeCanonicalLandscape, validateCanonicalLandscape, normalizeGoalRef,
} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {
  normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds,
} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-source-hold-remediation-candidate-v1'
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'))
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const rawBefore = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const rawAfter = read(`${own}/proposed-five-and-stage.validation-snapshot.json`)
const before = normalizeCanonicalLandscape(rawBefore)
const after = normalizeCanonicalLandscape(rawAfter)
const bMap = new Map(before.goals.map(g => [g.id, g]))
const aMap = new Map(after.goals.map(g => [g.id, g]))
const structuralId = read(`${own}/bounded-stage-route-deltas.json`).provisionalStructuralClusterId
const errors = validateCanonicalLandscape(after).filter(f => f.severity === 'error')
assert.deepEqual(errors, [])
assert.equal(new Set(after.goals.map(g => g.id)).size, after.goals.length)
assert.equal(after.goals.length, before.goals.length + 1)
assert.equal(after.goals.filter(g => !g.contains.length && g.type !== 'cluster').length,
  before.goals.filter(g => !g.contains.length && g.type !== 'cluster').length)

// The authoring native validator checks contains; a separate explicit DFS
// checks requires and the inherited atomic prerequisites needed for this route.
const index = (landscape: typeof before) => {
  const goals = new Map(landscape.goals.map(g => [g.id, g]))
  const parents = new Map<string, string[]>()
  for (const g of landscape.goals) for (const child of g.contains) {
    const id = normalizeGoalRef(child)
    parents.set(id, [...(parents.get(id) ?? []), g.id])
  }
  const effective = (id: string, visited = new Set<string>()): Set<string> => {
    assert(!visited.has(id), `contains cycle at ${id}`)
    const next = new Set(visited).add(id)
    return new Set([...(goals.get(id)?.requires ?? []).map(normalizeGoalRef),
      ...(parents.get(id) ?? []).flatMap(p => [...effective(p, next)])])
  }
  const expand = (id: string, visiting = new Set<string>()): Set<string> => {
    assert(!visiting.has(id), `effective requires cycle at ${id}`)
    const g = goals.get(id)
    assert(g, `unknown goal ${id}`)
    const next = new Set(visiting).add(id)
    const refs = effective(id)
    const result = new Set<string>()
    for (const ref of refs) {
      assert(goals.has(ref), `missing requires/contains ${id} -> ${ref}`)
      result.add(ref)
      for (const d of expand(ref, next)) result.add(d)
    }
    return result
  }
  // Cluster dependency membership and requires form separate DAGs. When
  // projecting a required cluster to its constituent atoms, use a finite
  // reachability worklist, not a mixed-edge DAG assertion (ordinary sibling
  // didactic dependencies would incorrectly look like a mixed cycle).
  const expandedMembership = (id: string): Set<string> => {
    const queue = [...effective(id)]
    const result = new Set<string>()
    while (queue.length) {
      const ref = queue.pop()!
      if (result.has(ref)) continue
      const goal = goals.get(ref)
      assert(goal, `unknown required member ${ref}`)
      result.add(ref)
      queue.push(...effective(ref), ...goal.contains.map(normalizeGoalRef))
    }
    return result
  }
  return { effective, expand, expandedMembership }
}
const original = index(before)
const candidate = index(after)
const targetIds: string[] = read(`${own}/input-bindings-and-boundaries.json`).goalIds
const closures = targetIds.map(goalId => ({ goalId,
  beforeEffective: [...original.effective(goalId)].sort(),
  afterEffective: [...candidate.effective(goalId)].sort(),
  beforeTransitive: [...original.expand(goalId)].sort(),
  afterTransitive: [...candidate.expand(goalId)].sort(),
  beforeRequiredClusterMemberClosure: [...original.expandedMembership(goalId)].sort(),
  afterRequiredClusterMemberClosure: [...candidate.expandedMembership(goalId)].sort(),
}))
for (const id of ['e0e201bd-a1fd-5985-ab08-fd24c8655f3d',
  '16a80de2-b5e0-5467-a9b3-5860730d7d8b', '58486300-3f84-5aa1-9ed4-66186af62669']) {
  const closure = candidate.expandedMembership(id)
  for (const excluded of ['1e803ef8-fc76-493d-85c5-de877cd38fda',
    'a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca', 'f5efab9d-2c61-44ea-b36a-87f873b51fd8',
    '67cd332f-9db7-50e1-87f6-172ef3714300']) assert(!closure.has(excluded), `${id} still requires later atomic/bonding route ${excluded}`)
}
const closedPreservation = ['b5086548-169e-5d63-a14a-dabf631fa013', 'd726e00e-1f87-5ba5-8c79-76ad4022365e'].map(goalId => {
  assert.deepEqual(aMap.get(goalId), bMap.get(goalId))
  assert.deepEqual([...candidate.effective(goalId)].sort(), [...original.effective(goalId)].sort())
  assert.deepEqual([...candidate.expand(goalId)].sort(), [...original.expand(goalId)].sort())
  assert.deepEqual([...candidate.expandedMembership(goalId)].sort(), [...original.expandedMembership(goalId)].sort())
  assert.deepEqual(buildGoalDescriptionCanonicalContext(aMap.get(goalId) as any), buildGoalDescriptionCanonicalContext(bMap.get(goalId) as any))
  return { goalId, allGoalFieldsPreserved: true, canonicalDescriptionContextPreserved: true,
    effectivePrerequisitesPreserved: true, transitivePrerequisitesPreserved: true,
    pageAndWholeBookBindings: 'Not proved by this graph check; final native candidate book/context check must resolve any actual ancestor/navigation/order changes.' }
})

const viewDeltas = read(`${own}/five-runtime-composition-view-deltas.json`).viewDeltas
const viewChecks = viewDeltas.map((delta: any) => {
  assert.equal(sha(delta.operativePath), delta.operativeSha256)
  const oldView = normalizeCompositionView(read(delta.operativePath))
  const newView = normalizeCompositionView(read(delta.candidatePath))
  const oldRoles = collectCompositionProjectionRoleGoalIds(oldView.rootNodes, bMap)
  const newRoles = collectCompositionProjectionRoleGoalIds(newView.rootNodes, aMap)
  const oldAtomIds = [...oldRoles.targetGoalIds].filter(i => !bMap.get(i)?.contains.length).sort()
  const newAtomIds = [...newRoles.targetGoalIds].filter(i => !aMap.get(i)?.contains.length).sort()
  assert.deepEqual(newAtomIds, oldAtomIds)
  const compiled = compileCompositionView(newView, after)
  const compileErrors = compiled.findings.filter(f => f.severity === 'error')
  assert.deepEqual(compileErrors, [])
  assert(newRoles.targetGoalIds.has(structuralId))
  assert(newRoles.targetGoalIds.has('1e372b97-6f1c-596c-8a8b-fc03193d784a'), 'Existing particle Memory goal must remain visible')
  return { operativePath: delta.operativePath, candidatePath: delta.candidatePath,
    targetAtomsBefore: oldAtomIds.length, targetAtomsAfter: newAtomIds.length,
    targetAtomSetPreserved: true, compileErrors, existingParticleMemoryVisible: true }
})

const hBefore = read('curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json')
const hAfter = read(`${own}/hessen-source-mapping-additive.candidate.review.json`)
assert.equal(hAfter.mappings.length, hBefore.mappings.length + 1)
for (const row of hBefore.mappings) assert(hAfter.mappings.some((r: any) => JSON.stringify(r) === JSON.stringify(row)))
const sourceAssertions = read(`${own}/current-source-clause-bindings-and-bounded-coverage.json`).bindings.map((binding: any) => {
  assert.equal(sha(binding.sourceExtractionPath), binding.sourceExtractionSha256)
  const extraction = read(binding.sourceExtractionPath)
  const source = extraction.sourceGoals.find((g: any) => g.id === binding.sourceGoalId)
  assert(source)
  assert.equal(source.sourceText, binding.sourceText)
  assert.equal(source.parentBulletText, binding.parentBulletText)
  assert.equal(source.sourceSpan, binding.sourceSpan)
  return { goalId: binding.goalId, sourceGoalId: binding.sourceGoalId, exactCurrentSourceBinding: true,
    scientificCoverageBoundary: binding.coverageBoundary }
})
const receipt = {
  observedAt: new Date().toISOString(), status: 'candidate', authority: 'ai_candidate',
  nativeContainsValidationErrors: errors, scopedEffectiveRequiresCheck: 'PASS: seven goal closures plus two preserved closed sibling closures',
  candidateRecordsBefore: before.goals.length, candidateRecordsAfter: after.goals.length,
  atomicDenominatorDelta: 0, targetPrerequisiteClosures: closures, closedPreservation,
  runtimeViews: viewChecks, exactSourceBindings: sourceAssertions,
  sourceMappingsAdded: 1, existingSourceMappingsPreserved: true,
  scientificLimits: 'Graph and native view checks prove candidate mechanics. They do not adopt the structural ID, finish split goals, approve entire source rows or replace final-book D/P/V.',
  strictClosureAdded: 0, operativeMutations: false,
}
writeFileSync(`${own}/native-scoped-graph-source-view.receipt.json`, `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify({ containsErrors: errors.length, scopedGoalClosures: closures.length,
  preservedClosedSiblings: closedPreservation.length, runtimeViews: viewChecks.length,
  exactSourceBindings: sourceAssertions.length, atomicDenominatorDelta: 0 }))
