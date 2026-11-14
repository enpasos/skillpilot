import assert from 'node:assert/strict'
import type { UiGoal } from '../src/goalTypes'
import { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects, type LearnerMapUnitIdentity,
  type LearnerUnitMapFixture, type LearnerUnitMapProjectionInput } from '../src/components/learningUnitMap/learnerUnitMapProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'

// Small hand-made learner trees: every cluster is a tree node, every leaf an atomic goal.
const subjectA = 'subject-a'
const subjectB = 'subject-b'
const goal = (id: string, contains: string[] = [], requires: string[] = [], landscapeId = subjectA): UiGoal => ({
  id, title: id, description: `Die lernende Person kann ${id}.`, phase: 'GLOBAL', themenfeld: '', area: '', level: 0, core: true,
  weight: 1, tags: [], leitideen: [], kompetenzen: [], sourceRef: '', requires, contains, examples: [],
  effectiveRequires: [...requires], inheritedRequires: [], type: contains.length ? 'cluster' : 'atomic', nodeKind: 'tutor', landscapeId,
})
const preparationCluster = (id: string, contains: string[]): UiGoal => ({ ...goal(id, contains),
  personalCurriculumProjection: { revision: 'atomic-prerequisite-learning-v1', role: 'structure', presentationOnly: true } })
const tree = (goals: UiGoal[], rootIds: string[]) => {
  const goalIndexAll = new Map(goals.map(item => [item.id, item]))
  const visibleChildrenByParent = buildDirectChildrenMap(goalIndexAll)
  const visibleGoalIds = new Set<string>()
  const visit = (id: string) => { if (visibleGoalIds.has(id)) return; visibleGoalIds.add(id); (visibleChildrenByParent.get(id) ?? []).forEach(visit) }
  rootIds.forEach(visit)
  return { rootGoals: rootIds.map(id => goalIndexAll.get(id)!), goalIndexAll, canonicalGoalIndexAll: goalIndexAll, visibleGoalIds, visibleChildrenByParent }
}
const unitsOf = (entries: Record<string, string>) => new Map<string, LearnerMapUnitIdentity>(Object.entries(entries).map(([node, key]) => [node, { key }]))
const project = (input: Omit<LearnerUnitMapProjectionInput, 'units'> & { units?: LearnerUnitMapProjectionInput['units'] }) =>
  buildLearnerUnitMapProjection({ units: new Map(), ...input })
const children = (fixture: LearnerUnitMapFixture, id: string) => fixture.entries[id].children
const rootChildren = (fixture: LearnerUnitMapFixture) => children(fixture, fixture.rootId)
const relations = (fixture: LearnerUnitMapFixture, scopeId: string) => fixture.scopeRelations?.[scopeId] ?? []
const findRelation = (fixture: LearnerUnitMapFixture, scopeId: string, source: string, target: string) =>
  relations(fixture, scopeId).find(relation => relation.source === source && relation.target === target)
/** Arrows exist only between the children of one unit (or of the root). */
const assertArrowsAmongChildren = (fixture: LearnerUnitMapFixture, label: string) => {
  for (const [scopeId, list] of Object.entries(fixture.scopeRelations ?? {})) for (const relation of list) {
    assert(fixture.entries[scopeId]?.children?.includes(relation.source) && fixture.entries[scopeId].children!.includes(relation.target),
      `${label}: relation ${relation.source} -> ${relation.target} lies on board ${scopeId} without both ends being its children`)
  }
}
/** Only units and atomic goals remain, and each unit contains exactly its children. */
const assertOnlyUnitsAndGoals = (fixture: LearnerUnitMapFixture, label: string) => {
  for (const entry of Object.values(fixture.entries)) {
    if (entry.id === fixture.rootId) continue
    assert(entry.kind === 'unit' ? entry.children!.length > 0 : !entry.children?.length, `${label}: ${entry.id} is neither a unit nor a goal`)
  }
}

// Sibling units of unequal depth, and a non-unit cluster between a unit and its sub-unit.
const depth = tree([
  goal('subject', ['U', 'W']), goal('U', ['C', 'u1']), goal('C', ['V', 'c1']), goal('V', ['v1', 'v2']), goal('W', ['w1']),
  goal('u1'), goal('c1'), goal('v1'), goal('v2'), goal('w1'),
], ['subject'])
const depthMap = project({ ...depth, units: unitsOf({ U: 'u', V: 'v', W: 'w' }) })
assertOnlyUnitsAndGoals(depthMap, 'unequal depth')
assert.deepEqual(rootChildren(depthMap), ['U', 'W'], 'the subject root is no node; its units are children of the root')
assert.deepEqual(children(depthMap, 'U'), ['V', 'c1', 'u1'], 'a removed cluster hands its sub-unit and goals to the nearest unit')
assert.deepEqual(children(depthMap, 'V'), ['v1', 'v2'])
assert.deepEqual(children(depthMap, 'W'), ['w1'], 'a sibling unit may contain goals only')
assert.equal(depthMap.entries.C, undefined, 'the cluster between a unit and its sub-unit is removed')
assert.equal(depthMap.entries.subject, undefined)
assert.deepEqual(depthMap.entryPaths?.C, [depthMap.rootId, 'U', 'C'], 'a removed cluster still leads to the board holding its content')
assert.deepEqual(depthMap.entryPaths?.v1, [depthMap.rootId, 'U', 'V', 'v1'])
assert.equal(depthMap.entries.U.kind, 'unit')
assert.deepEqual(depthMap.findings, [])

// With an empty units map, every atomic goal is a child of the root.
const flat = project(depth)
assert.deepEqual(rootChildren(flat), ['v1', 'v2', 'c1', 'u1', 'w1'], 'an empty units map yields all atomic goals at the root, in tree order')
assert.equal(Object.values(flat.entries).filter(entry => entry.kind === 'unit').length, 0)
assertOnlyUnitsAndGoals(flat, 'empty units map')

// Two tree nodes with one key under two subject roots merge into one map node.
const merged = tree([
  goal('subject-1', ['X1', 'free']), goal('X1', ['x1']), goal('x1', [], ['x2']), goal('free'),
  goal('subject-2', ['X2', 'Y2'], [], subjectB), goal('X2', ['x2'], [], subjectB), goal('x2', [], [], subjectB),
  goal('Y2', ['y2'], [], subjectB), goal('y2', [], [], subjectB),
], ['subject-1', 'subject-2'])
const mergedMap = project({ ...merged, units: new Map([['X1', { key: 'stage', label: 'Stufe' }], ['X2', { key: 'stage', label: 'Stufe' }], ['Y2', { key: 'y' }]]) })
const stage = mergedMap.unitEntryIds.stage
assert.equal(stage, '__unit__:stage', 'a key with several tree nodes becomes one synthetic map node')
assert.deepEqual(rootChildren(mergedMap), [stage, 'free', 'Y2'], 'the merged unit appears once at the root')
assert.deepEqual(children(mergedMap, stage), ['x1', 'x2'], 'the merged unit holds the union of both tree nodes')
assert.equal(mergedMap.entries[stage].title, 'Stufe')
assert.deepEqual(mergedMap.entries[stage].subjects, [subjectA, subjectB], 'subjects come from the goals, not from titles')
assert.deepEqual(mergedMap.subjectIds, [subjectA, subjectB])
assert.deepEqual(mergedMap.entryPaths?.X2, [mergedMap.rootId, stage, 'X2'], 'each merged tree node leads to the merged board')
assert.equal(findRelation(mergedMap, stage, 'x2', 'x1')?.kind, 'requirement', 'goal demand inside the merged unit stays a direct arrow')

// The subject filter keeps units that still contain goals; hidden demand becomes outside context.
const onlyA = filterLearnerUnitMapToSubjects(mergedMap, new Set([subjectA]))
assert.deepEqual(rootChildren(onlyA), [stage, 'free'], 'a unit holding only goals of a hidden subject disappears')
assert.deepEqual(children(onlyA, stage), ['x1'])
assert.equal(onlyA.entries.x2, undefined)
assert.equal(relations(onlyA, stage).length, 0, 'no arrow leads to a hidden goal')
assert.deepEqual(onlyA.scopeContext?.[stage]?.x1?.map(requirement => requirement.sourceGoalIds), [['x2']],
  'demand on a hidden goal stays visible as outside context')
assert.deepEqual(onlyA.subjectIds, [subjectA])
assert.deepEqual(onlyA.entries[stage].subjects, [subjectA])
assert.deepEqual(children(mergedMap, stage), ['x1', 'x2'], 'filtering leaves the unfiltered fixture untouched')
assert.equal(findRelation(mergedMap, stage, 'x2', 'x1')?.provenance.length, 1)
const onlyB = filterLearnerUnitMapToSubjects(mergedMap, new Set([subjectB]))
assert.deepEqual(rootChildren(onlyB), [stage, 'Y2'])
assert.deepEqual(children(onlyB, stage), ['x2'])

// A goal reachable through two removed clusters appears once; one under two units is reported.
const twice = tree([
  goal('subject', ['U', 'U2']), goal('U', ['C1', 'C2']), goal('C1', ['g', 'h']), goal('C2', ['g']), goal('U2', ['g', 'k']),
  goal('g'), goal('h'), goal('k'),
], ['subject'])
const twiceMap = project({ ...twice, units: unitsOf({ U: 'u', U2: 'u2' }) })
assert.deepEqual(children(twiceMap, 'U'), ['g', 'h'], 'a goal under two removed clusters of one unit appears once')
assert.deepEqual(children(twiceMap, 'U2'), ['k'], 'a goal under two units keeps its first place')
assert.deepEqual(twiceMap.findings.map(finding => [finding.kind, finding.goalIds]), [['goalInTwoPlaces', ['g']]])

// Order: declared `after`, transitive reduction, Rückgriff, derived dependency, bad declarations.
const order = tree([
  goal('subject', ['P', 'Q', 'R', 'Z']),
  goal('P', ['p1', 'P1']), goal('P1', ['p11']), goal('Q', ['q1', 'q2']), goal('R', ['r1']), goal('Z', ['z1']),
  goal('p1'), goal('p11', [], ['r1', 'p1']), goal('q1', [], ['p1']), goal('q2', [], ['q1']), goal('r1', [], ['q2']), goal('z1', [], ['p1']),
], ['subject'])
const orderMap = project({ ...order, units: unitsOf({ P: 'p', P1: 'p1u', Q: 'q', R: 'r', Z: 'z' }), after: [
  { unit: 'q', after: 'p' }, { unit: 'r', after: 'q' }, { unit: 'r', after: 'p' },
  { unit: 'p1u', after: 'q' }, { unit: 'nope', after: 'p' }, { unit: 'p', after: 'r' }, { unit: 'q', after: 'q' },
] })
assertArrowsAmongChildren(orderMap, 'order')
assertOnlyUnitsAndGoals(orderMap, 'order')
const pq = findRelation(orderMap, orderMap.rootId, 'P', 'Q')
assert.equal(pq?.unitOrder, 'declared', 'a declared after is drawn between the two units')
assert.deepEqual(pq?.provenance.map(requirement => [requirement.dependentGoalId, requirement.sourceGoalIds]), [['q1', ['p1']]],
  'demand covered by the declared order is its provenance')
assert.equal(findRelation(orderMap, orderMap.rootId, 'Q', 'R')?.unitOrder, 'declared')
assert.equal(findRelation(orderMap, orderMap.rootId, 'P', 'R'), undefined, 'a declared after that follows from the others is not drawn')
const backward = findRelation(orderMap, orderMap.rootId, 'R', 'P')
assert.equal(backward?.backward, true, 'a goal of an earlier unit needing a goal of a later unit is a Rückgriff')
assert.deepEqual(backward?.provenance.map(requirement => [requirement.dependentGoalId, requirement.sourceGoalIds]), [['p11', ['r1']]])
assert.equal(backward?.unitOrder, undefined)
const derived = findRelation(orderMap, orderMap.rootId, 'P', 'Z')
assert.equal(derived?.unitOrder, 'derived', 'demand between sibling units without after is a derived dependency')
assert.equal(derived?.backward, undefined)
assert.equal(findRelation(orderMap, 'Q', 'q1', 'q2')?.kind, 'requirement', 'demand between two goals of one unit is a direct arrow')
assert.equal(findRelation(orderMap, 'P', 'p1', 'P1')?.kind, 'summary', 'demand from a goal into a sibling unit is a summary arrow')
assert.equal(findRelation(orderMap, orderMap.rootId, 'Q', 'P'), undefined, 'covered demand never adds a reverse arrow')
assert.deepEqual(orderMap.findings.map(finding => [finding.kind, finding.unitKeys]).sort(), [
  ['afterNotSiblings', ['p1u', 'q']],
  ['contradictoryAfter', ['p', 'r']],
  ['redundantAfter', ['r', 'p']],
  ['selfAfter', ['q']],
  ['unknownUnit', ['nope']],
], 'bad declarations are reported and not applied, never thrown')
assert(!relations(orderMap, orderMap.rootId).some(relation => relation.source === 'Q' && relation.target === 'P1'))
assert.equal(orderMap.scopeContext?.P1?.p11?.some(requirement => requirement.sourceGoalIds.includes('r1')), true,
  'demand leaving a board stays outside context on the inner board')

// Preparation goals stand in the unit that first needs them.
const preparation = tree([
  goal('subject', ['E', 'L', 'M', 'N', 'prep']),
  goal('E', ['e1', 'E1']), goal('E1', ['e11']), goal('L', ['l1']), goal('M', ['m1']), goal('N', ['n1']),
  goal('e1', [], ['pa']), goal('e11', [], ['pd']), goal('l1', [], ['pa']), goal('m1', [], ['pc']), goal('n1', [], ['pc']),
  preparationCluster('prep', ['pa', 'pb', 'pc', 'pd', 'pe']),
  goal('pa', [], ['pb']), goal('pb'), goal('pc'), goal('pd'), goal('pe'),
], ['subject'])
const preparationMap = project({ ...preparation, units: unitsOf({ E: 'e', E1: 'e1u', L: 'l', M: 'm', N: 'n' }),
  after: [{ unit: 'l', after: 'e' }] })
const parentOf = (fixture: LearnerUnitMapFixture, id: string) => fixture.entryPaths?.[id]?.at(-2)
assert.equal(parentOf(preparationMap, 'pa'), 'E', 'needed by two ordered units: in the earlier one')
assert.equal(parentOf(preparationMap, 'pb'), 'E', 'needed through another preparation goal: where that one is needed first')
assert.equal(parentOf(preparationMap, 'pc'), preparationMap.rootId, 'needed by two units without order: beside them')
assert.equal(parentOf(preparationMap, 'pd'), 'E1', 'descends while exactly one earliest child unit needs it')
assert.equal(parentOf(preparationMap, 'pe'), preparationMap.rootId, 'needed by no placed goal: at the root')
for (const id of ['pa', 'pb', 'pc', 'pd', 'pe']) assert.equal(preparationMap.entries[id].preparation, true, `${id} is marked as preparation`)
assert.equal(preparationMap.entries.e1.preparation, undefined)
assert.equal(preparationMap.entries.prep, undefined, 'the synthetic preparation cluster is no map node')
assertArrowsAmongChildren(preparationMap, 'preparation')
assert.equal(findRelation(preparationMap, 'E', 'pa', 'e1')?.kind, 'requirement', 'a preparation goal prepares its consumer like any goal')
const preparationFlat = project(preparation)
for (const id of ['pa', 'pb', 'pc', 'pd', 'pe']) assert.equal(parentOf(preparationFlat, id), preparationFlat.rootId)

// Units declared by their own goals (learning units) where all of them share one parent.
const memberMap = project({ ...depth, units: unitsOf({ U: 'u', V: 'v', W: 'w' }), memberUnits: [
  { key: 'lu', label: 'Lerneinheit', goalIds: ['v1', 'v2'] },
  { key: 'split', label: 'Geteilt', goalIds: ['v1', 'w1'] },
  { key: 'absent', label: 'Fehlt', goalIds: ['missing'] },
] })
assert.deepEqual(children(memberMap, 'V'), ['__unit__:lu'])
assert.deepEqual(children(memberMap, '__unit__:lu'), ['v1', 'v2'])
assert.deepEqual(memberMap.findings.map(finding => finding.kind), ['memberUnitSplit', 'memberUnitAbsent'])

console.log('Learner unit map projection passed: units and goals only, unequal depth, removed clusters, merged keys, '
  + 'subject filter, arrows among children, declared/derived/backward order, bad after, preparation and member units.')
