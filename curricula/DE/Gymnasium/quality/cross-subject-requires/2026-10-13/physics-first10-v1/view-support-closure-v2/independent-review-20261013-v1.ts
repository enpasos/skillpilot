import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape, normalizeGoalRef, resolveCanonicalNodeType } from '../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../app/src/utils/authoring/compositionViewAuthoring'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '../../..')
const digest = (b: string | Buffer) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const bytes = (p: string) => readFileSync(resolve(repo, p))
const read = (p: string) => JSON.parse(bytes(p).toString('utf8'))
const serialize = (x: any) => JSON.stringify(x, null, 2) + '\n'
const authorPath = 'tmp/cross-subject-requires/physics-view-closure-support-author-v2/author-report.json'
const author = read(authorPath)
const physicsPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const kindPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const kinds = new Map(read(kindPath).decisions.map((x: any) => [x.goalId, x.semanticKind]))
const p = normalizeCanonicalLandscape(read(physicsPath))
const physics = { ...p, goals: p.goals.map(g => ({ ...g, semanticKind: kinds.get(g.id) })) }
const math = normalizeCanonicalLandscape(read(mathPath))
const all = new Map([...physics.goals, ...math.goals].map(g => [g.id, g]))
assert.equal(all.size, physics.goals.length + math.goals.length)
const pg = new Map(physics.goals.map(g => [g.id, g]))
const mg = new Map(math.goals.map(g => [g.id, g]))
const landscapes = new Map([[physics.landscapeId, physics], [math.landscapeId, math]])
const universe = { landscapeId: 'independent-physics-math-support-review', title: 'Independent canonical ownership universe', goals: [...physics.goals, ...math.goals] }
const roots = new Map([...landscapes].map(([id, l]) => [id, l.goals.find(g => g.tags?.includes('root'))!.id]))
const protectedInputs = author.protectedInputHashes.map((x: any) => ({ path: x.path, actualSha256: digest(bytes(x.path)), expectedSha256: 'sha256:' + x.sha256, matches: digest(bytes(x.path)) === 'sha256:' + x.sha256 }))
assert(protectedInputs.every((x: any) => x.matches), 'Protected input drift')

// Independent role precedence implementation from the reviewed semantics:
// goalEntry outranks a subtree; nearest subtree wins; equal specificity target
// wins. Union of both resolved roles is authored availability, not requires
// reachability and not mastery.
const roleMap = (nodes: any[]) => {
  const assignments = new Map<string, { rank: number, distance: number, role: string }>()
  const assign = (id: string, rank: number, distance: number, role: string) => {
    const old = assignments.get(id)
    if (!old || rank > old.rank || rank === old.rank && distance < old.distance || rank === old.rank && distance === old.distance && role === 'target') assignments.set(id, { rank, distance, role })
  }
  const subtree = (id: string, rank: number, role: string) => {
    const best = new Map<string, number>()
    const queue = [{ id: normalizeGoalRef(id), distance: 0 }]
    for (let i = 0; i < queue.length; i++) {
      const n = queue[i]
      if ((best.get(n.id) ?? Infinity) <= n.distance) continue
      best.set(n.id, n.distance)
      const g = all.get(n.id); assert(g, `Unknown authored node ${n.id}`)
      assign(n.id, rank, n.distance, role)
      g.contains.forEach(child => queue.push({ id: normalizeGoalRef(child), distance: n.distance + 1 }))
    }
  }
  const visit = (n: any) => {
    if (n.kind === 'structure') { n.children.forEach(visit); return }
    if (n.kind === 'landscapeEntry') { subtree(roots.get(n.landscapeId)!, 0, 'target'); return }
    const role = n.projectionRole ?? 'target'
    assert(['target', 'prerequisiteOnly'].includes(role))
    if (n.kind === 'canonicalSubtree') subtree(n.goalId, 1, role)
    else { assert.equal(n.kind, 'goalEntry'); assert(all.has(normalizeGoalRef(n.goalId))); assign(normalizeGoalRef(n.goalId), 2, 0, role) }
  }
  nodes.forEach(visit)
  return assignments
}
const targetIds = (r: ReturnType<typeof roleMap>) => [...r].filter(([,x]) => x.role === 'target').map(([id]) => id).sort()
const availableIds = (r: ReturnType<typeof roleMap>) => [...r.keys()].sort()
const visibleIds = (nodes: any[]) => {
  const ids = new Set<string>()
  const visit = (n: any) => { if (n.sourceGoalId) ids.add(n.sourceGoalId); n.children.forEach(visit) }
  nodes.forEach(visit)
  return [...ids].sort()
}
const parents = new Map<string, string[]>()
for (const g of physics.goals) for (const child of g.contains) parents.set(normalizeGoalRef(child), [...parents.get(normalizeGoalRef(child)) ?? [], g.id])
const originsFor = (id: string) => {
  const seen = new Set<string>(), queue = [id], result: any[] = []
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i]; if (seen.has(n)) continue; seen.add(n)
    const g = pg.get(n); assert(g)
    for (const ref of g.requires) result.push({ dependentGoalId: id, declaredByGoalId: n, requiredGoalId: normalizeGoalRef(ref), inheritedAlongContains: n !== id })
    queue.push(...parents.get(n) ?? [])
  }
  return result
}
const expectedMath = (roles: ReturnType<typeof roleMap>) => {
  const result = new Map<string, any[]>()
  for (const id of roles.keys()) if (pg.has(id)) for (const o of originsFor(id)) if (!pg.has(o.requiredGoalId)) {
    assert(mg.has(o.requiredGoalId))
    result.set(o.requiredGoalId, [...result.get(o.requiredGoalId) ?? [], o])
  }
  return result
}
const mathSupportRoots = (nodes: any[]) => {
  const result = new Map<string, any>()
  const visit = (n: any) => {
    if (n.kind === 'structure') { n.children.forEach(visit); return }
    if (n.kind === 'landscapeEntry') return
    const id = normalizeGoalRef(n.goalId)
    if (n.projectionRole === 'prerequisiteOnly' && !pg.has(id)) { assert(!result.has(id)); result.set(id, n) }
  }
  nodes.forEach(visit)
  return result
}
const checkRootEquality = (view: any) => {
  const roles = roleMap(view.rootNodes)
  return serialize([...mathSupportRoots(view.rootNodes).keys()].sort()) === serialize([...expectedMath(roles).keys()].sort())
}
const checks: any[] = [], reviewedAdds: any[] = []
for (const plan of author.plans) {
  const beforePath = 'tmp/cross-subject-requires/physics-view-closure-support-author-v2/before/' + plan.path
  const afterPath = 'tmp/cross-subject-requires/physics-view-closure-support-author-v2/after/' + plan.path
  const beforeRaw = read(beforePath), afterRaw = read(afterPath), currentRaw = read(plan.path)
  assert.equal(digest(bytes(beforePath)), 'sha256:' + plan.beforeSha256)
  assert.equal(digest(bytes(afterPath)), 'sha256:' + plan.afterSha256)
  assert.equal(digest(bytes(plan.path)), digest(bytes(afterPath)))
  assert.deepEqual(currentRaw, afterRaw)
  assert.deepEqual({ ...beforeRaw, rootNodes: undefined }, { ...afterRaw, rootNodes: undefined })
  assert.deepEqual(afterRaw.rootNodes.slice(0, beforeRaw.rootNodes.length), beforeRaw.rootNodes)
  const added = afterRaw.rootNodes.slice(beforeRaw.rootNodes.length)
  const before = normalizeCompositionView(beforeRaw), after = normalizeCompositionView(afterRaw)
  const br = roleMap(before.rootNodes), ar = roleMap(after.rootNodes)
  const nativeRoles = collectCompositionProjectionRoleGoalIds(after.rootNodes, all, roots)
  assert.deepEqual(targetIds(ar), [...nativeRoles.targetGoalIds].sort())
  assert.deepEqual([...ar].filter(([,x]) => x.role === 'prerequisiteOnly').map(([id]) => id).sort(), [...nativeRoles.prerequisiteOnlyGoalIds].sort())
  assert.deepEqual(targetIds(br), targetIds(ar))
  assert(!targetIds(ar).some(id => mg.has(id)), 'Mathematics target promotion')
  const bc = compileCompositionView(before, physics, universe, landscapes)
  const ac = compileCompositionView(after, physics, universe, landscapes)
  assert.deepEqual(bc.findings.filter(f => f.severity === 'error'), [])
  assert.deepEqual(ac.findings.filter(f => f.severity === 'error'), [])
  assert.equal(serialize(bc.compiledRootNodes), serialize(ac.compiledRootNodes))
  assert.equal(serialize(visibleIds(bc.compiledRootNodes)), serialize(visibleIds(ac.compiledRootNodes)))
  const storedTreePath = `tmp/cross-subject-requires/physics-view-closure-support-author-v2/compiled-before/${plan.viewId}.tree.json`
  assert.equal(digest(serialize(bc.compiledRootNodes)), digest(bytes(storedTreePath)))
  const expected = expectedMath(br)
  const missingBefore = [...expected.keys()].filter(id => !br.has(id)).sort()
  assert.deepEqual(added.map((n: any) => n.goalId).sort(), missingBefore)
  assert(checkRootEquality(after), 'New authored available Physics exact root equality failed')
  for (const n of added) {
    assert.equal(n.projectionRole, 'prerequisiteOnly')
    assert.equal(ar.get(n.goalId)?.role, 'prerequisiteOnly')
    const m = mg.get(n.goalId); assert(m)
    assert.equal(n.kind, resolveCanonicalNodeType(m) === 'cluster' ? 'canonicalSubtree' : 'goalEntry')
    const jurisdictions: string[] = (m as any).applicability?.jurisdiction ?? []
    if (after.scope.jurisdiction) assert(jurisdictions.includes(after.scope.jurisdiction), 'Added reference jurisdiction mismatch')
    const origins = expected.get(n.goalId)!; assert(origins.length)
    assert(origins.every(o => br.has(o.dependentGoalId)), 'Legacy unprojected Physics supplied authority')
    reviewedAdds.push({ viewId: after.viewId, scope: after.scope, reference: n, canonicalOwnerLandscapeId: math.landscapeId, completeCanonicalGoal: m, completeCanonicalGoalSha256: digest(serialize(m)), effectiveRole: ar.get(n.goalId), actualDirectOrContainsInheritedPhysicsOrigins: origins, rationale: n.goalId === '2331caf2-ccb2-5492-9fc6-48763b848bae' ? 'BY already authors the reflection Physics prerequisite as support-only. Its actual direct angle prerequisite must be authoritatively available; the added angle goal remains support-only.' : n.goalId === '11e3cf89-9224-5894-8e4a-ae8ff5af0119' ? 'The authored available nuclide Physics goal requires this additive-equation goal. A support lookup was absent despite unchanged target semantics; the new Math reference only enables that existing prerequisite check.' : 'The already authored available Physics goal has this existing Math requirement. Add only the explicit missing canonical lookup root, respecting cluster versus leaf kind; the underlying edge is not newly authored or re-reviewed.' })
  }
  checks.push({ path: plan.path, viewId: after.viewId, scope: after.scope, beforeSha256: digest(bytes(beforePath)), afterSnapshotSha256: digest(bytes(afterPath)), actualCurrentSha256: digest(bytes(plan.path)), addedReferences: added, authoredTargetSha256Before: digest(serialize(targetIds(br))), authoredTargetSha256After: digest(serialize(targetIds(ar))), visibleTargetSha256Before: digest(serialize(visibleIds(bc.compiledRootNodes))), visibleTargetSha256After: digest(serialize(visibleIds(ac.compiledRootNodes))), compiledTreeSha256Before: digest(serialize(bc.compiledRootNodes)), compiledTreeSha256After: digest(serialize(ac.compiledRootNodes)), exactMathRootsRequiredByAuthoredAvailablePhysics: [...expectedMath(ar).keys()].sort(), targetAndTreeBytesEqual: true, independentRolesMatchCompilerRoles: true, compilerErrors: [], missingLegacyPhysicsNotAutoProjected: plan.reachedPhysicsNotAuthoredAvailable, acceptedScope: true })
}
assert.equal(checks.length, 69)
assert.equal(reviewedAdds.length, 34)
assert.equal(checks.filter(x => x.addedReferences.length).length, 27)

const byPath = 'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json'
const by = normalizeCompositionView(read(byPath))
const angle = '2331caf2-ccb2-5492-9fc6-48763b848bae'
const reflection = '3c8e5510-a12d-5770-8a01-e5fe741b259c'
const byRoles = roleMap(by.rootNodes)
assert.equal(byRoles.get(reflection)?.role, 'prerequisiteOnly')
assert(expectedMath(byRoles).has(angle))
const remove = structuredClone(by); remove.rootNodes = remove.rootNodes.filter((n: any) => n.kind === 'structure' || n.goalId !== angle)
assert(!checkRootEquality(remove))
const promote = structuredClone(by); const node: any = promote.rootNodes.find((n: any) => n.kind !== 'structure' && n.goalId === angle); assert(node); node.projectionRole = 'target'
assert(!checkRootEquality(promote))
assert.equal(roleMap(promote.rootNodes).get(angle)?.role, 'target')
const conflicting = structuredClone(by); conflicting.rootNodes.push({ kind: 'goalEntry', goalId: angle, projectionRole: 'target' } as any)
const conflictingCompilation = compileCompositionView(conflicting, physics, universe, landscapes)
const conflictErrors = conflictingCompilation.findings.filter(f => f.severity === 'error')
const conflictingRole = roleMap(conflicting.rootNodes).get(angle)?.role
const conflictEqualityStillPasses = checkRootEquality(conflicting)

const testPath = 'app/scripts/testPhysicsGoalBookInputs.ts'
const testSource = bytes(testPath).toString('utf8')
const start = testSource.indexOf('  const expectedForeignPrerequisiteIds = new Set<string>()')
const end = testSource.indexOf('  if (NATIONAL_PHYSICS_VIEW_IDS.has(view.viewId))', start)
assert(start >= 0 && end > start)
const reviewedTestDelta = testSource.slice(start, end)
assert(reviewedTestDelta.includes('collectAuthoredProjectionGoalIds(view.rootNodes, physicsAndMathGoalById)'))
assert(reviewedTestDelta.includes('effectivePhysicsRequiresByGoalId.get(goalId)'))
const receipt = {
  schemaVersion: 1, completedAt: new Date().toISOString(), reviewer: { agentCanonicalName: '/root/requires_canonical_review', model: 'GPT-6.1 Sol', reasoningEffort: 'Ultra', independentOfAuthor: '/root/requires_runtime_path', authority: 'ai_candidate' },
  status: 'scope_and_technical_review_completed', exactAuthorReport: { path: authorPath, sha256: digest(bytes(authorPath)) },
  protectedInputs, actualTestInput: { path: testPath, sha256: digest(bytes(testPath)), exactNewForeignExpectationBlockSha256: digest(reviewedTestDelta), reviewedBlock: reviewedTestDelta },
  actualCanonicalInputs: [physicsPath, mathPath, kindPath].map(path => ({ path, sha256: digest(bytes(path)) })),
  checks, reviewedAdditions: reviewedAdds,
  negativeControls: { noActiveMutation: true, missingByAngle: { exactRootEqualityRejected: true, requiresOrigin: reflection }, replaceSameAngleRoleWithTarget: { exactRootEqualityRejected: true, resolvedRole: 'target' }, equalSpecificityAdditionalTargetConflict: { conflictingRole, exactRootEqualityStillPasses: conflictEqualityStillPasses, compilerErrors: conflictErrors } },
  scopeConclusions: ['All 34 additions are canonical Mathematics definitions with explicit prerequisiteOnly role and appropriate jurisdiction. Actual role resolution preserves that role.', 'All 69 authored target sets, compiled visible target sets and complete compiled trees are byte-equal before/after. No Mathematics target/progress promotion or Physics legacy closure was introduced.', 'Expected foreign roots must follow all expressly available Physics target and support-only goals, using direct plus contains-inherited edges. Merely visible Physics targets miss the BY support-only reflection prerequisite.', 'No requires-transitive mastery, no canonical goal/source/QA change and no auto-hydration of omitted legacy Physics nodes is approved.', 'Legacy omitted Physics dependencies remain a separately disclosed debt; this delta does not certify full learning-route closure of every view.'],
  limits: ['This receipt reviews the specific 34-reference view delta and the new expectation logic, not the objective scientific necessity of existing 21 foreign edges.', 'Root focused test run, global composition348, DAG, M7 and full CI are separate evidence. They were not duplicated or claimed by this reviewer.', 'Root newer expectation code must remain bound to these exact bytes; further code changes require another additive review.']
}
const path = resolve(here, 'independent-scope-and-test-review-20261013-v1.json')
writeFileSync(path, serialize(receipt), { flag: 'wx' })
console.log(serialize({ path, sha256: digest(readFileSync(path)), viewCount: checks.length, changedViews: checks.filter(x => x.addedReferences.length).length, addedReferenceCount: reviewedAdds.length, negativeControls: receipt.negativeControls }))
