// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { auditTransitiveMinimality, type AuditGoal, type AuditLandscape } from './auditTransitiveMinimality'
const one = (goals: AuditGoal[]): AuditLandscape[] => [{ landscapeId: 'L', goals }]
const run = (goals: AuditGoal[]) => auditTransitiveMinimality(one(goals), ['L'])
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
