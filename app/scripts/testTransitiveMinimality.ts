// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { auditTransitiveMinimality, auditTransitiveMinimalityOrigin, validateTransitiveMinimalityScope,
  type AuditGoal, type AuditLandscape, type MinimalityOrigin } from './auditTransitiveMinimality'
const one = (goals: AuditGoal[]): AuditLandscape[] => [{ landscapeId: 'L', goals }]
let targetedComparisons = 0, invalidScopeComparisons = 0
function assertTargetedError(catalog: AuditLandscape[], roots: string[]) {
  let reference: unknown
  try { auditTransitiveMinimality(catalog, roots) } catch (error) { reference = error }
  assert.ok(reference, 'full audit must reject the fixture')
  for (const check of [
    () => validateTransitiveMinimalityScope(catalog, roots),
    () => auditTransitiveMinimalityOrigin(catalog, roots, { source: 'L:q', prerequisite: 'L:a' }),
    () => auditTransitiveMinimalityOrigin(catalog, roots, { source: 'absent:q', prerequisite: 'absent:a' }),
  ]) {
    assert.throws(check, (error) => String(error) === String(reference))
    invalidScopeComparisons++
  }
}
function assertSelectedMatches(catalog: AuditLandscape[], roots: string[], origins: MinimalityOrigin[]) {
  const before = JSON.stringify(catalog), reference = auditTransitiveMinimality(catalog, roots)
  assert.equal(validateTransitiveMinimalityScope(catalog, roots), undefined)
  for (const origin of origins) {
    assert.deepEqual(auditTransitiveMinimalityOrigin(catalog, roots, origin),
      reference.findings.find((finding) => finding.source === origin.source && finding.prerequisite === origin.prerequisite))
    targetedComparisons++
  }
  assert.equal(JSON.stringify(catalog), before, 'targeted queries must not mutate the input')
  return reference
}
const run = (goals: AuditGoal[]) => {
  const catalog = one(goals)
  try {
    return assertSelectedMatches(catalog, ['L'], goals.flatMap((goal) => (goal.requires ?? []).map((ref) => ({
      source: `L:${goal.id}`, prerequisite: ref.includes(':') ? ref : `L:${ref}`,
    }))))
  } catch (error) {
    assertTargetedError(catalog, ['L'])
    throw error
  }
}
const pairs = (result: ReturnType<typeof run>) => result.findings.map((f) => [f.source, f.prerequisite])
assert.throws(() => auditTransitiveMinimality(one([{ id: 'a' }]), []), /Empty root scope/)
assert.throws(() => run([]), /Empty audit scope/)
for (const catalog of [
  [], null, {}, [{ landscapeId: '', goals: [] }], [{ landscapeId: 1, goals: [] }],
  [{ landscapeId: 'L', goals: {} }], [{ landscapeId: 'L', goals: [null] }],
  ...[undefined, '', ' ', 1, 'a:b', ' a', 'a b'].map((id) => one([{ id } as AuditGoal])),
  ...[null, {}, 'a'].map((requires) => one([{ id: 'a', requires } as AuditGoal])),
  ...[null, 1, '', 'a:b:c', 'X:', 'a b'].map((ref) => one([{ id: 'a', contains: [ref] } as AuditGoal])),
] as unknown[]) assert.throws(() => auditTransitiveMinimality(catalog as AuditLandscape[], ['L']))
assert.throws(() => auditTransitiveMinimality([
  { landscapeId: 'L', goals: [{ id: 'a' }] }, { landscapeId: 'L', goals: [{ id: 'b' }] },
], ['L']), /Duplicate landscape ID/)
assert.throws(() => auditTransitiveMinimality([
  { landscapeId: 'L', goals: [{ id: 'a' }] }, { landscapeId: 'Empty', goals: [] },
], ['L', 'Empty']), /Empty audit scope.*Empty/)
assert.throws(() => auditTransitiveMinimality(one([{ id: 'a' }]), ['Missing']), /Unknown root/)
assert.throws(() => auditTransitiveMinimality(one([{ id: 'a' }]), ['']), /Invalid root/)

assert.deepEqual(pairs(run([
  { id: 'q', requires: ['b', 'a'] }, { id: 'b', requires: ['a'] }, { id: 'a' },
])), [['L:q', 'L:a']])
// The raw R graph is minimal; the remaining effective path uses inheritance.
const inherited = run([
  { id: 'cluster', contains: ['b'], requires: ['a'] },
  { id: 'g', requires: ['b', 'a'] }, { id: 'b' }, { id: 'a' },
])
assert.deepEqual(pairs(inherited), [['L:g', 'L:a']])
assert.deepEqual(inherited.findings[0].witness, ['L:g', 'L:b', 'L:a'])
assert.deepEqual(inherited.findings[0].supportingOrigins[1], { source: 'L:cluster', prerequisite: 'L:a' })
// Separate authored origins for the same inherited requirement must survive.
assert.deepEqual(pairs(run([
  { id: 'c1', contains: ['g'], requires: ['a'] },
  { id: 'c2', contains: ['g'], requires: ['a'] },
  { id: 'g', requires: ['a', 'L:a'] }, { id: 'a' },
])), [['L:g', 'L:a']])
// Two lexical references to one authored pair are a set, not two proof origins.
assert.equal(run([{ id: 'q', requires: ['a', 'L:a'] }, { id: 'a' }]).findings.length, 0)
assert.equal(run([{ id: 'cluster', contains: ['b'], requires: ['a'] }, { id: 'b' }, { id: 'a' }]).findings.length, 0)
// Foreign references, plain global IDs and foreign contains inheritance are kept.
const foreign: AuditLandscape[] = [
  { landscapeId: 'Math', goals: [
    { id: 'cluster', contains: ['Physics:b'], requires: ['a'] },
    { id: 'q', requires: ['b', 'a'] }, { id: 'a' },
  ] },
  { landscapeId: 'Physics', goals: [{ id: 'b' }] },
]
const foreignResult = auditTransitiveMinimality(foreign, ['Math'])
assert.equal(foreignResult.nodeCount, 4)
assert.deepEqual(pairs(foreignResult), [['Math:q', 'Math:a']])
assert.deepEqual(foreignResult.findings[0].witness, ['Math:q', 'Physics:b', 'Math:a'])
assert.equal(foreignResult.crossLandscapeReferenceCount, 2)
const foreignAncestor = auditTransitiveMinimality([
  { landscapeId: 'L', goals: [{ id: 'q', requires: ['Foreign:b', 'Foreign:c'] }] },
  { landscapeId: 'Foreign', goals: [
    { id: 'parent', contains: ['b', 'unrelatedSibling'], requires: ['c'] },
    { id: 'b' }, { id: 'c' }, { id: 'unrelatedSibling' },
  ] },
], ['L'])
assert.deepEqual(pairs(foreignAncestor), [['L:q', 'Foreign:c']])
assert.equal(foreignAncestor.nodeCount, 4)
assert.deepEqual(foreignAncestor.inheritanceOnlyAncestors, ['Foreign:parent'])
assert.deepEqual(foreignAncestor.findings[0].supportingOrigins[1],
  { source: 'Foreign:parent', prerequisite: 'Foreign:c' })
// Requiring a cluster does not add contains edges to §7.3 reachability.
assert.equal(run([
  { id: 'q', requires: ['cluster', 'a'] }, { id: 'cluster', contains: ['a'] }, { id: 'a' },
]).findings.length, 0)
for (const [fixture, error] of [
  [[{ id: 'a', requires: ['missing'] }], /Unknown reference/],
  [[{ id: 'a', requires: ['Foreign:missing'] }], /Unknown reference/],
  [[{ id: 'a', requires: ['b'] }, { id: 'b', requires: ['a'] }], /effective requires cycle/],
  [[{ id: 'a', contains: ['b'] }, { id: 'b', contains: ['a'] }], /contains cycle/],
  [[{ id: 'c', contains: ['b'], requires: ['x'] }, { id: 'x', requires: ['b'] }, { id: 'b' }], /effective requires cycle/],
  [[{ id: 'a' }, { id: 'a' }], /Duplicate qualified goal/],
] as [AuditGoal[], RegExp][]) assert.throws(() => run(fixture), error)
assert.throws(() => auditTransitiveMinimality([
  { landscapeId: 'L', goals: [{ id: 'q', requires: ['a'] }] },
  { landscapeId: 'X', goals: [{ id: 'a' }] }, { landscapeId: 'Y', goals: [{ id: 'a' }] },
], ['L']), /Ambiguous reference/)
assert.deepEqual(auditTransitiveMinimality([
  { landscapeId: 'L', goals: [{ id: 'q', requires: ['X:a'] }] },
  { landscapeId: 'X', goals: [{ id: 'a' }] }, { landscapeId: 'Y', goals: [{ id: 'a' }] },
], ['L']).landscapes, ['L', 'X'])

// Catalog, goal and reference permutations leave counts, proof paths and origin
// choices unchanged. Code-point ordering includes BMP/non-BMP prefixes and
// unpaired surrogates, which advance by one UTF-16 unit rather than two.
const deterministic: AuditLandscape[] = [
  { landscapeId: 'L', goals: [
    { id: 'q', requires: ['F:b', 'a', 'F:c'] }, { id: 'a' },
    ...['𐀀a', '\uD800a', '\uDC00', 'Za', '𐀀', '\uE000', '\uDC00a', 'äa', '\uD800', 'ä', 'Z']
      .map((id) => ({ id, requires: ['q', 'a'] })),
  ] },
  { landscapeId: 'F', goals: [
    { id: 'parent', contains: ['b', 'c'], requires: ['L:a'] },
    { id: 'b' }, { id: 'c' },
  ] },
]
const stable = auditTransitiveMinimality(deterministic, ['L'])
assert.deepEqual(stable.findings.map((finding) => finding.source), [
  'L:Z', 'L:Za', 'L:q', 'L:ä', 'L:äa', 'L:\uD800', 'L:\uD800a',
  'L:\uDC00', 'L:\uDC00a', 'L:\uE000', 'L:𐀀', 'L:𐀀a',
])
assert.deepEqual(auditTransitiveMinimality(deterministic.slice().reverse().map((landscape) => ({
  ...landscape, goals: landscape.goals.slice().reverse().map((goal) => ({
    ...goal, contains: goal.contains?.slice().reverse(), requires: goal.requires?.slice().reverse(),
  })),
})), ['L', 'L']), stable)

// Independent literal reference: delete each pair, then rebuild effective
// adjacency to a fixed point using only immediate contains inheritance.
const subsets = <T>(items: T[]): T[][] => Array.from({ length: 2 ** items.length }, (_, mask) =>
  items.filter((_, i) => mask & (1 << i)))
const edge = (a: number, b: number) => `${a},${b}`
function literal(size: number, contains: [number, number][], authored: [number, number][]) {
  const rebuild = (removed?: string): Set<string> => {
    const result = new Set(authored.map(([a, b]) => edge(a, b)).filter((key) => key !== removed))
    let changed = true
    while (changed) {
      changed = false
      for (const [parent, child] of contains) for (const key of [...result]) {
        const [a, b] = key.split(',').map(Number)
        if (a !== parent || result.has(edge(child, b))) continue
        result.add(edge(child, b)); changed = true
      }
    }
    return result
  }
  const reach = (edges: Set<string>, source: number, target: number): boolean => {
    const visited = new Set<number>(), queue = [source]
    while (queue.length) {
      const node = queue.pop()!
      for (let p = 0; p < size; p++) if (edges.has(edge(node, p))) {
        if (p === target) return true
        if (!visited.has(p)) { visited.add(p); queue.push(p) }
      }
    }
    return false
  }
  const full = rebuild()
  if (Array.from({ length: size }, (_, i) => i).some((i) => reach(full, i, i))) return null
  return authored.filter(([a, b]) => reach(rebuild(edge(a, b)), a, b))
    .map(([a, b]) => [`L:${a}`, `L:${b}`]).sort()
}
let compared = 0, invalid = 0
for (let size = 1; size <= 4; size++) {
  const possible: [number, number][] = []
  for (let a = 0; a < size; a++) for (let b = a + 1; b < size; b++) possible.push([a, b])
  for (const contains of subsets(possible)) for (const requires of subsets(possible)) {
    const goals = Array.from({ length: size }, (_, id) => ({ id: String(id),
      contains: contains.filter(([a]) => a === id).map(([, b]) => String(b)),
      requires: requires.filter(([a]) => a === id).map(([, b]) => String(b)),
    }))
    const expected = literal(size, contains, requires)
    if (expected === null) { assert.throws(() => run(goals), /effective requires cycle/); invalid++; continue }
    const result = run(goals)
    assert.deepEqual(pairs(result).sort(), expected)
    // Include unauthored pairs: a surviving path alone cannot certify an origin.
    for (const source of goals) for (const prerequisite of goals) if (!source.requires.includes(prerequisite.id)) {
      assert.equal(auditTransitiveMinimalityOrigin(one(goals), ['L'], {
        source: `L:${source.id}`, prerequisite: `L:${prerequisite.id}`,
      }), undefined)
      targetedComparisons++
    }
    // Every reported path survives removal. Its provenance points to a distinct
    // still-authored requirement; a stale inherited copy is never an origin.
    for (const finding of result.findings) {
      assert.equal(finding.witness[0], finding.source)
      assert.equal(finding.witness.at(-1), finding.prerequisite)
      assert.equal(finding.supportingOrigins.length, finding.witness.length - 1)
      finding.supportingOrigins.forEach((origin, i) => {
        assert.notDeepEqual(origin, { source: finding.source, prerequisite: finding.prerequisite })
        assert.equal(origin.prerequisite, finding.witness[i + 1])
      })
    }
    compared++
  }
}
console.log(`PASS: ${compared} literal removal/reinheritance comparisons; ${invalid} invalid effective graphs rejected; cross-subject, duplicate-origin, cluster-boundary and input counterexamples.`)


// Selected witnesses must not hide errors elsewhere in the complete scope.
const selectedWitness: AuditGoal[] = [
  { id: 'q', requires: ['b', 'a'] }, { id: 'b', requires: ['a'] }, { id: 'a' },
]
for (const extra of [
  [{ id: 'x', requires: ['y'] }, { id: 'y', requires: ['x'] }],
  [{ id: 'x', contains: ['y'] }, { id: 'y', contains: ['x'] }],
  [{ id: 'x', requires: ['unknown'] }],
] as AuditGoal[][]) assertTargetedError(one([...selectedWitness, ...extra]), ['L'])
assertTargetedError([
  ...one([...selectedWitness, { id: 'x', requires: ['shared'] }]),
  { landscapeId: 'X', goals: [{ id: 'shared' }] },
  { landscapeId: 'Y', goals: [{ id: 'shared' }] },
], ['L'])
// A foreign containment ancestor is imported for inheritance, not skipped by a
// selected query whose redundant witness is entirely local.
for (const requires of [['missing'], ['L:foreignEntry']]) assertTargetedError([
  ...one([...selectedWitness, { id: 'foreignEntry', requires: ['F:child'] }]),
  { landscapeId: 'F', goals: [{ id: 'parent', contains: ['child'], requires }, { id: 'child' }] },
], ['L'])
assertTargetedError([
  ...one(selectedWitness), { landscapeId: 'F', goals: [{ id: 'bad', contains: ['missing'] }] },
], ['L'])
for (const [catalog, roots] of [
  [one([{ id: 'a' }]), []], [one([]), ['L']], [one([{ id: 'a' }]), ['Missing']],
  [one([{ id: 'a' }]), ['']], [[], ['L']],
] as [AuditLandscape[], string[]][]) assertTargetedError(catalog, roots)

const noAuthoredOrigin = one([
  { id: 'q', requires: ['b'] }, { id: 'b', requires: ['a'] }, { id: 'a' },
])
assert.equal(auditTransitiveMinimalityOrigin(noAuthoredOrigin, ['L'], { source: 'L:q', prerequisite: 'L:a' }), undefined)
// Omitting an authored origin removes its inherited contributions as well;
// independently authored origins for that prerequisite continue to contribute.
assertSelectedMatches(one([
  { id: 'parent', contains: ['child'], requires: ['a'] }, { id: 'child' }, { id: 'a' },
]), ['L'], [{ source: 'L:parent', prerequisite: 'L:a' }, { source: 'L:child', prerequisite: 'L:a' }])
const alternateOrigins = assertSelectedMatches(one([
  { id: 'outer', contains: ['parent'], requires: ['a'] },
  { id: 'parent', contains: ['child'], requires: ['a'] }, { id: 'child' }, { id: 'a' },
]), ['L'], [{ source: 'L:parent', prerequisite: 'L:a' }, { source: 'L:outer', prerequisite: 'L:a' }])
assert.deepEqual(alternateOrigins.findings[0], {
  source: 'L:parent', prerequisite: 'L:a', witness: ['L:parent', 'L:a'],
  supportingOrigins: [{ source: 'L:outer', prerequisite: 'L:a' }],
})
// No cross-call preparation is reused: materialization may introduce a cycle.
const mutated = one([{ id: 'q', requires: ['b'] }, { id: 'b' }])
assert.equal(validateTransitiveMinimalityScope(mutated, ['L']), undefined)
assert.equal(auditTransitiveMinimalityOrigin(mutated, ['L'], { source: 'L:q', prerequisite: 'L:b' }), undefined)
mutated[0].goals[1].requires = ['q']
assertTargetedError(mutated, ['L'])
assertSelectedMatches(foreign, ['Math'], [
  { source: 'Math:q', prerequisite: 'Math:a' }, { source: 'Math:cluster', prerequisite: 'Math:a' },
])
assertSelectedMatches(deterministic, ['L'], stable.findings)
assertSelectedMatches(deterministic.slice().reverse().map((landscape) => ({
  ...landscape, goals: landscape.goals.slice().reverse().map((goal) => ({
    ...goal, contains: goal.contains?.slice().reverse(), requires: goal.requires?.slice().reverse(),
  })),
})), ['L', 'L'], stable.findings)
console.log(`PASS: ${targetedComparisons} selected-origin/full-finding comparisons; ${invalidScopeComparisons} exact validity/selected/full-error comparisons; fresh mutation, missing origin, foreign ancestor and Unicode counterexamples.`)
