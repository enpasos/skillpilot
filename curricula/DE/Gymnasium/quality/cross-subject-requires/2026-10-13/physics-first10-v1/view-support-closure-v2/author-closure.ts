import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape, normalizeGoalRef, resolveCanonicalNodeType } from '../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../app/src/utils/authoring/compositionViewAuthoring'

const artifact = dirname(fileURLToPath(import.meta.url))
const repo = resolve(artifact, '../../..')
const mode = process.argv[2] ?? 'prepare'
assert(['prepare', 'apply', 'verify'].includes(mode), 'Use prepare, apply or verify.')
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const serialize = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const writeNew = (path: string, bytes: string | Buffer) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, bytes, { flag: 'wx' })
}
const physicsPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const viewDirectory = 'curricula/DE/Gymnasium/composition-views/physik'
const protectedInputs = [physicsPath, mathPath, ledgerPath,
  'app/src/utils/authoring/compositionViewAuthoring.ts',
  'app/src/utils/authoring/canonicalAuthoring.ts',
  'curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-13/physics-first10-v1/accepted10.independent-review.json',
  'curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-13/physics-first10-v1/batch001.proposal-candidate.exact.json',
  'tmp/cross-subject-requires/root-retained-closure-and-fixtures.independent-review.json',
  'tmp/cross-subject-requires/root-physics-first10-expectation-v1.independent-review.json',
  'tmp/cross-subject-requires/root-physics-first10-expectation-v2.independent-review.json',
]
const inputHashes = protectedInputs.map(path => ({ path, sha256: hash(readFileSync(resolve(repo, path))) }))
const kinds = new Map(read(ledgerPath).decisions.map((row: any) => [row.goalId, row.semanticKind]))
const normalizedPhysics = normalizeCanonicalLandscape(read(physicsPath))
const physics = { ...normalizedPhysics, goals: normalizedPhysics.goals.map(goal => ({ ...goal, semanticKind: kinds.get(goal.id) })) }
const math = normalizeCanonicalLandscape(read(mathPath))
const landscapes = new Map([[physics.landscapeId, physics], [math.landscapeId, math]])
const allGoals = [...physics.goals, ...math.goals]
const universe = { landscapeId: 'physics-mathematics-explicit-support-authoring', title: 'Canonical Physics and Mathematics', goals: allGoals }
const goals = new Map(allGoals.map(goal => [goal.id, goal]))
assert.equal(goals.size, allGoals.length, 'Bare canonical UUID ownership must be unambiguous.')
const physicsGoals = new Map(physics.goals.map(goal => [goal.id, goal]))
const mathGoals = new Map(math.goals.map(goal => [goal.id, goal]))
const roots = new Map([...landscapes].map(([id, landscape]) => [id, landscape.goals.find(goal => goal.tags?.includes('root'))?.id ?? '']))
const parents = new Map<string, string[]>()
for (const goal of physics.goals) for (const child of goal.contains.map(normalizeGoalRef)) {
  assert(physicsGoals.has(child), `Physics contains must stay internal: ${goal.id}->${child}`)
  parents.set(child, [...(parents.get(child) ?? []), goal.id])
}
const effective = new Map<string, string[]>()
for (const goal of physics.goals) {
  const requirements = new Set(goal.requires.map(normalizeGoalRef))
  const stack = [...(parents.get(goal.id) ?? [])]
  const seen = new Set<string>()
  while (stack.length) {
    const id = stack.pop()!
    if (seen.has(id)) continue
    seen.add(id)
    const ancestor = physicsGoals.get(id)!
    for (const required of ancestor.requires.map(normalizeGoalRef)) requirements.add(required)
    stack.push(...(parents.get(id) ?? []))
  }
  effective.set(goal.id, [...requirements].sort())
}
const viewPaths = readdirSync(resolve(repo, viewDirectory)).filter(name => name.endsWith('.view.json')).sort().map(name => `${viewDirectory}/${name}`)
assert.equal(viewPaths.length, 69, 'Exactly the active69 Physics views are in scope.')
const visibleIds = (nodes: any[]): string[] => {
  const ids = new Set<string>()
  const visit = (node: any) => { if (node.sourceGoalId) ids.add(node.sourceGoalId); node.children.forEach(visit) }
  nodes.forEach(visit)
  return [...ids].sort()
}
const analyze = (raw: any) => {
  const view = normalizeCompositionView(raw)
  assert.equal(view.landscapeId, physics.landscapeId)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals, roots)
  const available = new Set([...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds])
  const authoredPhysicsIds = [...available].filter(id => physicsGoals.has(id)).sort()
  const queue = authoredPhysicsIds.map(id => ({ id, route: [id] }))
  const reached = new Set<string>()
  const requiredMath = new Map<string, Array<{ dependentGoalId: string, route: string[], authoredOrigin: boolean }>>()
  const reachableMath = new Map<string, Array<{ dependentGoalId: string, route: string[], authoredOrigin: boolean }>>()
  const absentPhysics = new Set<string>()
  const absentPhysicsRoutes = new Map<string, string[]>()
  for (let index = 0; index < queue.length; index++) {
    const { id, route } = queue[index]
    if (reached.has(id)) continue
    reached.add(id)
    assert(physicsGoals.has(id), `Reachability must remain within Physics: ${id}`)
    for (const required of effective.get(id) ?? []) {
      assert(goals.has(required), `${id} requires unknown canonical UUID ${required}`)
      const nextRoute = [...route, required]
      if (physicsGoals.has(required)) {
        if (!available.has(required)) {
          absentPhysics.add(required)
          if (!absentPhysicsRoutes.has(required)) absentPhysicsRoutes.set(required, nextRoute)
        }
        if (!reached.has(required)) queue.push({ id: required, route: nextRoute })
      } else {
        assert(mathGoals.has(required), `Unsupported foreign owner for ${required}`)
        const origin = { dependentGoalId: id, route: nextRoute, authoredOrigin: available.has(id) }
        reachableMath.set(required, [...(reachableMath.get(required) ?? []), origin])
        // Only an authored available Physics competence supplies authority for
        // a new Mathematics lookup reference. Broader legacy reachability is
        // audit debt, never an implicit projection or prerequisite expansion.
        if (available.has(id)) requiredMath.set(required, [...(requiredMath.get(required) ?? []), origin])
      }
    }
  }
  const compilation = compileCompositionView(view, physics, universe, landscapes)
  assert.deepEqual(compilation.findings.filter(finding => finding.severity === 'error'), [], `Invalid authored view ${view.viewId}`)
  return { view, roles, available, authoredPhysicsIds, reached, requiredMath, reachableMath, absentPhysics, absentPhysicsRoutes, compilation }
}
const planPath = resolve(artifact, 'author-report.json')
if (mode === 'prepare') {
  assert(!existsSync(planPath), 'Use a new versioned artifact directory; existing author reports are immutable.')
  const plans: any[] = []
  for (const path of viewPaths) {
    const beforeBytes = readFileSync(resolve(repo, path))
    const beforeRaw = JSON.parse(beforeBytes.toString('utf8'))
    const before = analyze(beforeRaw)
    const missing = [...before.requiredMath.keys()].filter(id => !before.available.has(id)).sort()
    const afterRaw = structuredClone(beforeRaw)
    const additions = missing.map(goalId => ({ kind: resolveCanonicalNodeType(mathGoals.get(goalId)!) === 'cluster' ? 'canonicalSubtree' : 'goalEntry', goalId, projectionRole: 'prerequisiteOnly' }))
    afterRaw.rootNodes.push(...additions)
    const after = analyze(afterRaw)
    assert.equal(serialize([...before.roles.targetGoalIds].sort()), serialize([...after.roles.targetGoalIds].sort()), `Authored target set changed: ${path}`)
    assert.equal(serialize(visibleIds(before.compilation.compiledRootNodes)), serialize(visibleIds(after.compilation.compiledRootNodes)), `Visible target set changed: ${path}`)
    assert.equal(serialize(before.compilation.compiledRootNodes), serialize(after.compilation.compiledRootNodes), `Visible contains tree changed: ${path}`)
    assert([...after.requiredMath.keys()].every(id => after.available.has(id)), `Missing Mathematics support after repair: ${path}`)
    const afterBytes = additions.length ? Buffer.from(serialize(afterRaw)) : beforeBytes
    writeNew(resolve(artifact, 'before', path), beforeBytes)
    writeNew(resolve(artifact, 'after', path), afterBytes)
    writeNew(resolve(artifact, 'compiled-before', `${before.view.viewId}.tree.json`), serialize(before.compilation.compiledRootNodes))
    plans.push({ path, viewId: before.view.viewId, scope: before.view.scope, beforeSha256: hash(beforeBytes), afterSha256: hash(afterBytes),
      authoredPhysicsGoalCount: before.authoredPhysicsIds.length, reachedPhysicsGoalCount: before.reached.size,
      reachedPhysicsNotAuthoredAvailable: [...before.absentPhysics].sort(),
      reachedPhysicsNotAuthoredAvailableRoutes: [...before.absentPhysicsRoutes].sort(([a], [b]) => a.localeCompare(b)).map(([goalId, route]) => ({ goalId, route })),
      broadReachabilityMathGoalIds: [...before.reachableMath.keys()].sort(),
      unavailablePhysicsOriginMathRequirements: [...before.reachableMath].flatMap(([goalId, origins]) => origins.filter(origin => !origin.authoredOrigin).map(origin => ({ goalId, ...origin }))),
      requiredMathGoalIds: [...before.requiredMath.keys()].sort(),
      alreadyAvailableMathGoalIds: [...before.requiredMath.keys()].filter(id => before.available.has(id)).sort(),
      addedReferences: additions.map(reference => ({ ...reference, origins: before.requiredMath.get(reference.goalId) })),
      authoredTargetSetSha256: hash(serialize([...before.roles.targetGoalIds].sort())),
      visibleTargetSetSha256: hash(serialize(visibleIds(before.compilation.compiledRootNodes))),
      visibleContainsTreeSha256: hash(serialize(before.compilation.compiledRootNodes)),
      beforeAfterAuthoredTargetBytesEqual: true, beforeAfterVisibleTargetBytesEqual: true, beforeAfterVisibleContainsTreeBytesEqual: true,
      beforeCompilerErrors: [], afterCompilerErrors: [] })
  }
  const report = { schemaVersion: 1, status: 'author-proposal-pending-independent-review', author: '/root/requires_runtime_path',
    method: 'Author explicit Mathematics support only from existing direct plus contains-inherited requirements of Physics goals already authoritatively available as target or prerequisiteOnly. Broader Physics requires reachability is preserved as audit debt and never creates a projection or authoring authority. Stop at Mathematics; never follow Mathematics requires, change a canonical edge, infer mastery or add a target. Existing authored Mathematics subtrees count as available and are not duplicated.',
    ownership: 'Full canonical UUID definitions are unique across Physics and Mathematics.', authorScriptSha256: hash(readFileSync(fileURLToPath(import.meta.url))), protectedInputHashes: inputHashes,
    viewCount: plans.length, changedViewCount: plans.filter(plan => plan.addedReferences.length).length,
    addedReferenceCount: plans.reduce((count, plan) => count + plan.addedReferences.length, 0),
    authoredTargetsAndVisibleTreesUnchanged: true, plans,
    limits: ['This is author work, not an independent scientific or technical approval.', 'Missing Physics availability is reported, not automatically authored or promoted.', 'Global composition348, graph and quality-floor checks remain Root verification requirements.'] }
  for (const input of inputHashes) assert.equal(hash(readFileSync(resolve(repo, input.path))), input.sha256, `Input drift: ${input.path}`)
  writeNew(planPath, serialize(report))
  console.log(serialize({ mode, views: plans.length, changedViews: report.changedViewCount, addedReferences: report.addedReferenceCount,
    missingPhysicsAvailabilityViews: plans.filter(plan => plan.reachedPhysicsNotAuthoredAvailable.length).length,
    targetAndTreeBytesUnchanged: true, reportPath: planPath }))
} else {
  const plan = JSON.parse(readFileSync(planPath, 'utf8'))
  assert.deepEqual(inputHashes, plan.protectedInputHashes, 'Protected canonical, compiler, approval or prior receipt input drift.')
  assert.deepEqual(viewPaths, plan.plans.map((entry: any) => entry.path), 'Active view inventory drift.')
  for (const entry of plan.plans) {
    const actual = readFileSync(resolve(repo, entry.path))
    assert.equal(hash(actual), mode === 'apply' ? entry.beforeSha256 : entry.afterSha256, `Active view drift: ${entry.path}`)
    const before = readFileSync(resolve(artifact, 'before', entry.path))
    const after = readFileSync(resolve(artifact, 'after', entry.path))
    assert.equal(hash(before), entry.beforeSha256)
    assert.equal(hash(after), entry.afterSha256)
    const a = analyze(JSON.parse(before.toString('utf8')))
    const b = analyze(JSON.parse(after.toString('utf8')))
    assert.equal(serialize([...a.roles.targetGoalIds].sort()), serialize([...b.roles.targetGoalIds].sort()))
    assert.equal(serialize(a.compilation.compiledRootNodes), serialize(b.compilation.compiledRootNodes))
    assert([...b.requiredMath.keys()].every(id => b.available.has(id)), `Unclosed support: ${entry.path}`)
    assert.deepEqual(JSON.parse(before.toString('utf8')).rootNodes, JSON.parse(after.toString('utf8')).rootNodes.slice(0, a.view.rootNodes.length), `Existing node changed: ${entry.path}`)
  }
  if (mode === 'apply') for (const entry of plan.plans) if (entry.beforeSha256 !== entry.afterSha256) {
    assert.equal(hash(readFileSync(resolve(repo, entry.path))), entry.beforeSha256)
    writeFileSync(resolve(repo, entry.path), readFileSync(resolve(artifact, 'after', entry.path)))
  }
  const result = { schemaVersion: 1, status: mode === 'apply' ? 'author-applied-pending-independent-review' : 'author-verified-not-independent-review', mode,
    author: '/root/requires_runtime_path', reportSha256: hash(readFileSync(planPath)), viewCount: plan.viewCount,
    changedViewCount: plan.changedViewCount, addedReferenceCount: plan.addedReferenceCount,
    authoredTargetsAndVisibleTreesUnchanged: true, protectedInputsUnchanged: true }
  writeNew(resolve(artifact, `${mode}-result.json`), serialize(result))
  console.log(serialize(result))
}
