import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const R = process.cwd()
const T = R + '/tmp/chemie-m7-resumed-20261016'
const O = T + '/BW-lab-aggregate-two-views-independent-b-v1'
const A = T + '/BW-lab-aggregate-existing-child-acquisition-author-v1'
const L = T + '/chemie-shared640-recycling-native-author-capsule-L6-v1'
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const hash = (x: unknown) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex')
const sha = (p: string) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const pin = (p: string) => ({ path: path.relative(R, p), sha256: sha(p) })
const first = O + '/FIRST.scientific-source-role-acquisition.independent-b.sealed.json'
assert.equal(sha(first), '42927e8e3c86a97814391229a6aeeed8c78ff639ba9a8d93e409205683abc144')
const cp = L + '/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const kp = L + '/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
assert.equal(sha(cp), 'ae53884b26285d9483b315f030216566b74fb7067e9fc962610e493aadeb3fb2')
assert.equal(sha(kp), '23347dac27ae2d616a2334b5c30c5465c031ae177a034d6d1f7df18e2585295a')
const code = L + '/app/src/utils/authoring/compositionViewAuthoring.ts'
const filterCode = L + '/app/src/utils/goalFilters.ts'
const { collectCompositionProjectionRoleGoalIds: collect, compileCompositionView: compile,
  getCompositionProjectionRole: getRole } = await import(code)
const { goalMatchesFilters } = await import(filterCode)
const canonical = read(cp)
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const kinds = new Map<string, string>(read(kp).decisions.map((g: any) => [g.goalId, g.semanticKind]))
const typed = { ...canonical, goals: canonical.goals.map((g: any) => ({ ...g, semanticKind: kinds.get(g.id) })) }
const aggregate = '266a2b2a-9ee2-52f6-ae09-59343da9a60b'
const children = ['416dfd33-8b43-5c49-903c-9847b95e4208', '13d4f336-ab16-54a7-9479-c920b458f385']
const consumers = ['fcc73fb5-7413-557f-aea3-b9692a66ee75', '580b3616-f121-5d82-ac6b-fc24f145fbdc', 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4']
assert.deepEqual(goals.get(aggregate).contains, children)
assert.equal(kinds.get(aggregate), 'curricularArea')
assert.ok(children.every(id => kinds.get(id) === 'curricularAtomic' && goals.get(id).contains.length === 0))
const sorted = (values: Iterable<string>) => [...values].sort()
const getEntries = (nodes: any[], out: any[] = []) => {
  for (const n of nodes) { if (n.kind === 'structure') getEntries(n.children, out); else out.push(n) }
  return out
}
const inventory = (nodes: any[]) => {
  const occurrences: Record<string, Array<string | null>> = {}
  const walk = (ns: any[], parent: string | null) => {
    for (const n of ns) {
      if (n.sourceGoalId) (occurrences[n.sourceGoalId] ??= []).push(parent)
      walk(n.children ?? [], n.runtimeId)
    }
  }
  walk(nodes, null)
  return occurrences
}
const rows: any[] = []
for (const course of ['gk', 'lk']) {
  const sides: any[] = []
  for (const side of ['before', 'after']) {
    const p = `${A}/${side}/de-bw-${course}.view.json`
    const view = read(p)
    const assignments = collect(view.rootNodes, goals)
    const target = new Set<string>(sorted(assignments.targetGoalIds).filter(id => goalMatchesFilters(goals.get(id), [view.scope.courseProfile, view.scope.jurisdiction, view.scope.durationModel].filter(Boolean))))
    const support = assignments.prerequisiteOnlyGoalIds
    const role = (id: string) => target.has(id) ? 'target' : support.has(id) ? 'prerequisiteOnly' : assignments.targetGoalIds.has(id) ? 'authored-target-filtered-out' : 'absent'
    const raw = compile(view, canonical)
    const kindAware = compile(view, typed)
    const inv = inventory(kindAware.compiledRootNodes)
    const ordinary = sorted([...target].filter(id => kinds.get(id) === 'curricularAtomic' && goals.get(id).contains.length === 0))
    const missing = ordinary.flatMap(id => (goals.get(id).requires ?? []).filter((req: string) => !target.has(req) && !support.has(req)).map((req: string) => `${id} requires ${req}`)).sort()
    const entries = getEntries(view.rootNodes)
    const childRows = children.map(id => {
      const refs = entries.filter(n => n.kind === 'goalEntry' && n.goalId === id)
      assert.equal(refs.length, 1)
      assert.equal(getRole(refs[0]), 'target')
      return { id, authoredRef: refs[0], resolvedRole: role(id), renderedCount: inv[id]?.length ?? 0, renderedParents: inv[id] ?? [] }
    })
    const reverse = structuredClone(view.rootNodes)
    reverse[0].children.reverse()
    const reversed = collect(reverse, goals)
    assert.deepEqual(sorted(reversed.targetGoalIds), sorted(assignments.targetGoalIds))
    assert.deepEqual(sorted(reversed.prerequisiteOnlyGoalIds), sorted(support))
    sides.push({ side, view: pin(p), scope: view.scope,
      rawFindings: raw.findings, kindAwareFindings: kindAware.findings,
      authoredTargets: sorted(assignments.targetGoalIds), effectiveTargets: sorted(target), ordinaryTargets: ordinary,
      prerequisiteOnlyIds: sorted(support), aggregateRole: role(aggregate), aggregateRenderedCount: inv[aggregate]?.length ?? 0,
      children: childRows, renderedTreeSHA256: hash(kindAware.compiledRootNodes), renderedInventorySHA256: hash(inv),
      duplicateRenderedIds: Object.keys(inv).filter(id => inv[id].length > 1),
      multipleParentIds: Object.keys(inv).filter(id => new Set(inv[id]).size > 1),
      missingDirectOrdinaryInterfaces: missing, rolesOrderIndependent: true })
  }
  const [b, a] = sides
  const removedEdges = b.missingDirectOrdinaryInterfaces.filter((e: string) => !a.missingDirectOrdinaryInterfaces.includes(e))
  const addedEdges = a.missingDirectOrdinaryInterfaces.filter((e: string) => !b.missingDirectOrdinaryInterfaces.includes(e))
  assert.deepEqual(b.authoredTargets, a.authoredTargets)
  assert.deepEqual(b.effectiveTargets, a.effectiveTargets)
  assert.deepEqual(b.ordinaryTargets, a.ordinaryTargets)
  assert.deepEqual(a.prerequisiteOnlyIds.filter((id: string) => !b.prerequisiteOnlyIds.includes(id)), [aggregate])
  assert.ok(b.prerequisiteOnlyIds.every((id: string) => a.prerequisiteOnlyIds.includes(id)))
  assert.equal(b.aggregateRole, 'absent')
  assert.equal(a.aggregateRole, 'prerequisiteOnly')
  assert.equal(a.aggregateRenderedCount, 0)
  assert.ok(a.children.every((x: any) => x.resolvedRole === 'target' && x.renderedCount === 1 && x.renderedParents.length === 1))
  assert.equal(b.renderedTreeSHA256, a.renderedTreeSHA256)
  assert.equal(b.renderedInventorySHA256, a.renderedInventorySHA256)
  assert.deepEqual(b.rawFindings, a.rawFindings)
  assert.deepEqual(b.kindAwareFindings, a.kindAwareFindings)
  assert.deepEqual(a.duplicateRenderedIds, [])
  assert.deepEqual(a.multipleParentIds, [])
  assert.deepEqual(removedEdges, consumers.map(id => `${id} requires ${aggregate}`).sort())
  assert.deepEqual(addedEdges, [])
  assert.ok(consumers.every(id => a.effectiveTargets.includes(id) && goals.get(id).requires.includes(aggregate)))
  const newContext = consumers.map(id => ({consumerId:id, prerequisite:aggregate, oldRole:b.aggregateRole, newRole:a.aggregateRole, ordinaryTarget:true}))
  rows.push({ course, before: b, after: a, removedMissingOrdinaryInterfaces: removedEdges, addedMissingOrdinaryInterfaces: addedEdges,
    actualDirectContextsResolved: newContext, exactBoundedDeltaPASS: true,
    fullKindAwareAcceptance: a.kindAwareFindings.every((f: any) => f.severity !== 'error') })
}
const result = { documentType: 'independent-b-actually-executed-stock-finite-role-compile-proof', atUTC: new Date().toISOString(),
  inputs: { first: pin(first), canonical: pin(cp), kinds: pin(kp), compilerCollector: pin(code), scopeFilter: pin(filterCode), actualScript: pin(O + '/check-finite-compiler.mts') },
  execution: 'Four actual whole views: stock collector, raw compiler and transient SEM-kind-aware compiler; scoped goal filter; actual child role defaults and reverse-order collector check. No backend suite or full publication build.',
  rows, exactTwoViewDeltaPASS: true, totalResolvedOrdinaryInterfaces: 6,
  fullKindAwareAcceptance: rows.every(row => row.fullKindAwareAcceptance), oldErrorsAndHoldsWaived: false }
fs.writeFileSync(O + '/CHECK.actual-stock-raw-kind-aware-roles-unique-tree.independent-b.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({exactTwoViewDeltaPASS:true, fullKindAwareAcceptance:result.fullKindAwareAcceptance,
  rows:rows.map(r => ({course:r.course, targets:r.after.effectiveTargets.length, ordinaryTargets:r.after.ordinaryTargets.length,
    supportBefore:r.before.prerequisiteOnlyIds.length,supportAfter:r.after.prerequisiteOnlyIds.length,
    rawErrors:r.after.rawFindings.filter((f:any)=>f.severity==='error').length,
    kindAwareErrors:r.after.kindAwareFindings.filter((f:any)=>f.severity==='error').length,
    missingOrdinaryBefore:r.before.missingDirectOrdinaryInterfaces.length,missingOrdinaryAfter:r.after.missingDirectOrdinaryInterfaces.length,
    removedInterfaces:r.removedMissingOrdinaryInterfaces, newInterfaces:r.addedMissingOrdinaryInterfaces}))},null,2))
