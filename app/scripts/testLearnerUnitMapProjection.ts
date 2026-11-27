import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import type { UiGoal } from '../src/goalTypes'
import { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects, type LearnerMapUnitIdentity,
  type LearnerUnitMapFixture, type LearnerUnitMapProjectionInput } from '../src/utils/learnerNavigation/learnerUnitMapProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { deriveLearnerUnitMapPreview, learnerUnitMapSubjectIds, MATHEMATICS_LANDSCAPE_ID,
  PHYSICS_LANDSCAPE_ID } from '../src/utils/learnerNavigation/learnerUnitMapPreview'

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

// The actual UI may select one overview root above its subject roots. Existing
// subject sections remain units, and foreign preparation keeps its identity.
{
  const preparationIds = ['chem-orientation', 'chem-safety', 'chem-lab', 'chem-substances',
    'chem-observed-states', 'chem-particles', 'chem-diffusion']
  const chemistryId = 'foreign-chemistry'
  const foreign = preparationIds.map((id, index) => goal(id, [], index ? [preparationIds[index - 1]] : [], chemistryId))
  const section: UiGoal = { ...goal('physics-section', [...preparationIds, 'membrane-model'], [], PHYSICS_LANDSCAPE_ID),
    tags: ['synthetic:program-unit'], extendedData: { syntheticStructureKind: 'compositionView',
      compositionViewId: 'authored-physics', compositionNodeId: 'physics-sekii-gk' } }
  const foreignSection: UiGoal = { ...goal('foreign-section', ['foreign-extra'], [], chemistryId),
    tags: ['synthetic:program-unit'], extendedData: { syntheticStructureKind: 'compositionView',
      compositionViewId: 'not-selected-chemistry', compositionNodeId: 'chemistry-year' } }
  const input = tree([goal('overview', ['physics-root', 'foreign-section'], [], 'overview-landscape'),
    { ...goal('physics-root', [section.id], [], PHYSICS_LANDSCAPE_ID),
      tags: ['root', 'synthetic:program-unit'], extendedData: { syntheticStructureKind: 'compositionView',
        compositionViewId: 'authored-physics', compositionNodeId: 'physics-root' } }, section, foreignSection,
    ...foreign, goal('membrane-model', [], [preparationIds.at(-1)!], PHYSICS_LANDSCAPE_ID),
    goal('foreign-extra', [], [], chemistryId)], ['overview'])
  const before = JSON.stringify([...input.goalIndexAll])
  const preview = deriveLearnerUnitMapPreview(input)
  assert.equal(preview.maxStep, 1, 'A transparent overview must not conceal the existing subject unit.')
  assert(preview.units.has(section.id))
  assert(!preview.units.has('physics-root'), 'A synthetic subject root under an overview never becomes an additional unit.')
  assert(!preview.units.has(foreignSection.id), 'Traversing the overview does not invent units for another subject.')
  const fixture = buildLearnerUnitMapProjection({ ...input, units: preview.units, after: preview.after })
  for (const id of preparationIds) assert(fixture.entryPaths![id].includes(fixture.unitEntryIds.sek2))
  assert.equal(Object.keys(fixture.entries).filter(id => preparationIds.includes(id)).length, 7)
  assert.equal(JSON.stringify([...input.goalIndexAll]), before, 'Overview traversal cannot change the canonical learning basis.')
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
assert.equal(depthMap.entries.U.unitType, 'unit', 'a unit from the tree is named a plain unit')
assert.deepEqual(depthMap.findings, [])

// One subject can leave a single actionable goal inside an otherwise useful view group.
const scoped = tree([goal('parent', ['group']), goal('group', ['left', 'subtree']), goal('subtree', ['right']),
  goal('left', [], [], subjectB), goal('right', [], ['left'])], ['parent'])
const unfiltered = project({ ...scoped, units: new Map([['group', { key: 'group', presentationGroup: true }]]) })
const filtered = filterLearnerUnitMapToSubjects(unfiltered, new Set([subjectA]))
assert.deepEqual(children(unfiltered, 'group'), ['left', 'right'])
assert.deepEqual(rootChildren(filtered), ['right'])
assert.deepEqual(filtered.entryPaths?.group, [filtered.rootId, 'right'])
assert.deepEqual(filtered.entryPaths?.subtree, [filtered.rootId, 'right'], 'a canonical subtree alias reveals the promoted goal')
assert.deepEqual(filtered.scopeContext?.[filtered.rootId]?.right.map(value => value.sourceGoalIds), [['left']])
assert.equal(filtered.entries.right.kind, 'goal')
assert.deepEqual(filterLearnerUnitMapToSubjects(filtered, new Set([subjectA])), filtered)

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

// Declared sibling calendars survive a subject filter through hidden units.
// Derived/backward demand and another board never supply calendar bridges.
{
  const calendarTree = tree([
    goal('subjects', ['LEFT', 'RIGHT']), goal('LEFT', ['S', 'H1', 'H2', 'M', 'T', 'H3', 'U']),
    goal('RIGHT', ['F', 'G']), goal('S', ['s', 's2']), goal('H1', ['h1'], [], subjectB),
    goal('H2', ['h2'], [], subjectB), goal('M', ['m']), goal('T', ['t', 't2']), goal('H3', ['h3'], [], subjectB), goal('U', ['u']),
    goal('F', ['f'], [], subjectB), goal('G', ['g']),
    goal('s', [], ['t']), goal('s2'), goal('h1', [], [], subjectB), goal('h2', [], [], subjectB), goal('h3', [], [], subjectB),
    goal('m', [], ['h1']), goal('t'), goal('t2', [], ['s2']), goal('u'), goal('f', [], [], subjectB), goal('g'),
  ], ['subjects'])
  const calendarUnits = unitsOf({ LEFT: 'left', RIGHT: 'right', S: 's', H1: 'h1', H2: 'h2', H3: 'h3', M: 'm', T: 't', U: 'u', F: 'f', G: 'g' })
  const calendarOrder = [{ unit: 'h1', after: 's' }, { unit: 'h2', after: 'h1' }, { unit: 't', after: 'h2' },
    { unit: 'h3', after: 't' }, { unit: 'u', after: 'h3' }, { unit: 'g', after: 'f' }]
  const calendar = project({ ...calendarTree, units: calendarUnits, after: calendarOrder })
  // Preserve an independently supplied requirement relation at the same pair
  // as the newly contracted calendar, without changing its actual provenance.
  const existingDemand = { source: 'S', target: 'T', kind: 'summary' as const, unitOrder: 'derived' as const,
    provenance: [{ requiredGoalId: 's2', dependentGoalId: 't2', inherited: false, sourceGoalIds: ['s2'], unresolved: false }] }
  calendar.scopeRelations!.LEFT.push(existingDemand)
  const beforeCalendar = JSON.stringify(calendar)
  const filtered = filterLearnerUnitMapToSubjects(calendar, new Set([subjectA]))
  const declaredPairs = (fixture: LearnerUnitMapFixture) => relations(fixture, 'LEFT')
    .filter(relation => relation.unitOrder === 'declared').map(relation => [relation.source, relation.target]).sort()
  assert.deepEqual(declaredPairs(filtered), [['S', 'T'], ['T', 'U']], 'Several hidden calendar units contract to the next retained sibling.')
  const bridge = relations(filtered, 'LEFT').find(relation => relation.source === 'T' && relation.target === 'U'
    && relation.unitOrder === 'declared')
  assert.deepEqual(bridge?.provenance, [], 'New calendar bridges have no invented requirements.')
  const enriched = relations(filtered, 'LEFT').filter(relation => relation.source === 'S' && relation.target === 'T')
  assert.equal(enriched.length, 1, 'One endpoint pair retains one renderer edge, even when it already carries demand.')
  assert.deepEqual(enriched[0], { ...existingDemand, unitOrder: 'declared' },
    'Calendar enrichment changes only order metadata; kind, backward marker and actual provenance stay intact.')
  assert.deepEqual(relations(filtered, 'LEFT').find(relation => relation.backward),
    relations(calendar, 'LEFT').find(relation => relation.backward), 'Backward demand remains unchanged.')
  assert(!relations(filtered, 'LEFT').some(relation => relation.source === 'S' && relation.target === 'M'
    && relation.unitOrder === 'declared'), 'A hidden derived demand is not a declared calendar path.')
  assert.deepEqual(filtered.scopeContext?.M?.m?.map(requirement => requirement.sourceGoalIds), [['h1']],
    'The hidden requirement retains its existing outside context.')
  assert.equal(relations(filtered, 'RIGHT').length, 0, 'A separate sibling board supplies no cross-board calendar relation.')
  assertArrowsAmongChildren(filtered, 'contracted calendar')
  for (const [id, entry] of Object.entries(filtered.entries)) assert.deepEqual(entry.requires, calendar.entries[id].requires)
  assert.deepEqual(filterLearnerUnitMapToSubjects(filtered, new Set([subjectA])), filtered)
  assert.equal(JSON.stringify(calendar), beforeCalendar, 'Filtering never mutates the full fixture.')
  assert.deepEqual(filterLearnerUnitMapToSubjects(calendar, new Set([subjectA, subjectB])).scopeRelations, calendar.scopeRelations,
    'Keeping all subjects preserves the original calendar and all existing relations exactly.')
  const redundantInput = { ...calendar, scopeRelations: structuredClone(calendar.scopeRelations) }
  const authoredRedundant = { source: 'S', target: 'U', kind: 'summary' as const, provenance: [], unitOrder: 'declared' as const }
  redundantInput.scopeRelations!.LEFT.push(authoredRedundant)
  assert.deepEqual(relations(filterLearnerUnitMapToSubjects(redundantInput, new Set([subjectA])), 'LEFT')
    .find(relation => relation.source === 'S' && relation.target === 'U'), authoredRedundant,
  'An existing declared relation is preserved even when redundant; reduction applies only to newly contracted bridges.')
  const branch = project({ ...calendarTree, units: calendarUnits, after: [...calendarOrder,
    { unit: 'm', after: 's' }, { unit: 't', after: 'm' }] })
  const filteredBranch = filterLearnerUnitMapToSubjects(branch, new Set([subjectA]))
  assert.deepEqual(declaredPairs(filteredBranch), [['M', 'T'], ['S', 'M'], ['T', 'U']],
    'An alternative retained branch prevents a redundant new S -> T shortcut.')
}

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
const requiredFoundations = preparationMap.unitEntryIds['required-foundations:e']
assert(requiredFoundations)
assert.equal(parentOf(preparationMap, requiredFoundations), 'E', 'preparation stays in the earliest actual acquisition unit')
assert.equal(parentOf(preparationMap, 'pa'), requiredFoundations, 'needed by two ordered units: grouped beside topics in the earlier unit')
assert.equal(parentOf(preparationMap, 'pb'), requiredFoundations, 'transitively needed preparation shares the same actual acquisition place')
assert.deepEqual(preparationMap.entries[requiredFoundations].children, ['pb', 'pa'], 'foundations retain prerequisite-first order')
assert.equal(parentOf(preparationMap, 'pc'), preparationMap.rootId, 'needed by two units without order: beside them')
assert.equal(parentOf(preparationMap, 'pd'), 'E1', 'descends while exactly one earliest child unit needs it')
assert.equal(parentOf(preparationMap, 'pe'), preparationMap.rootId, 'needed by no placed goal: at the root')
for (const id of ['pa', 'pb', 'pc', 'pd', 'pe']) assert.equal(preparationMap.entries[id].preparation, true, `${id} is marked as preparation`)
assert.equal(preparationMap.entries.e1.preparation, undefined)
assert.equal(preparationMap.entries.prep, undefined, 'the synthetic preparation cluster is no map node')
assertArrowsAmongChildren(preparationMap, 'preparation')
assert.equal(findRelation(preparationMap, 'E', requiredFoundations, 'e1')?.kind, 'summary')
assert(findRelation(preparationMap, 'E', requiredFoundations, 'e1')?.provenance.some(cause => cause.sourceGoalIds.includes('pa')),
  'the grouping retains the actual prerequisite witness to its consumer')
assert.equal(findRelation(preparationMap, requiredFoundations, 'pb', 'pa')?.kind, 'requirement',
  'internal prerequisites remain visible inside the preparation group')
const preparationFlat = project(preparation)
for (const id of ['pa', 'pb', 'pc', 'pd', 'pe']) assert.equal(parentOf(preparationFlat, id), preparationFlat.rootId)

// Coarsening all preparation into one group would create a false cycle:
// p0 -> topic A -> p1 -> topics B/C, with p0 also needed by C.
const interleavedPreparation = tree([
  goal('subject', ['E', 'prep']), goal('E', ['A', 'B', 'C']),
  goal('A', ['a']), goal('B', ['b']), goal('C', ['c']),
  goal('a', [], ['p0']), goal('b', [], ['p1']), goal('c', [], ['p0', 'p1']),
  goal('p0'), goal('p1', [], ['a']), preparationCluster('prep', ['p0', 'p1']),
], ['subject'])
const interleavedSnapshot = JSON.stringify([...interleavedPreparation.goalIndexAll])
const stratified = project({ ...interleavedPreparation, units: unitsOf({ E: 'e', A: 'a', B: 'b', C: 'c' }) })
assert.equal(parentOf(stratified, 'p0'), 'E')
assert.equal(parentOf(stratified, 'p1'), 'E')
assert(findRelation(stratified, 'E', 'p0', 'A'))
assert(findRelation(stratified, 'E', 'A', 'p1'))
assert(findRelation(stratified, 'E', 'p1', 'B'))
assert(!findRelation(stratified, 'E', 'A', 'p0'))
assert(!findRelation(stratified, 'E', 'p1', 'A'))
assert.equal(JSON.stringify([...interleavedPreparation.goalIndexAll]), interleavedSnapshot)
assertArrowsAmongChildren(stratified, 'stratified preparation')

// Units declared by their own goals (learning units) where all of them share one parent.
const memberMap = project({ ...depth, units: unitsOf({ U: 'u', V: 'v', W: 'w' }), memberUnits: [
  { key: 'lu', label: 'Lerneinheit', goalIds: ['v1', 'v2'], withAssessments: true },
  { key: 'split', label: 'Geteilt', goalIds: ['v1', 'w1'] },
  { key: 'absent', label: 'Fehlt', goalIds: ['missing'] },
] })
assert.deepEqual(children(memberMap, 'V'), ['__unit__:lu'])
assert.deepEqual(children(memberMap, '__unit__:lu'), ['v1', 'v2'])
assert.equal(memberMap.entries['__unit__:lu'].unitType, 'unitWithAssessments', 'a unit whose entry names assessment reviews is a unit with assessments')
const plainMember = project({ ...depth, units: unitsOf({ U: 'u', V: 'v', W: 'w' }), memberUnits: [{ key: 'plain', label: 'Ohne', goalIds: ['v1', 'v2'] }] })
assert.equal(plainMember.entries['__unit__:plain'].unitType, 'unit', 'a declared unit without assessment reviews is a plain unit')
const singleMember = project({ ...depth, units: unitsOf({ U: 'u', V: 'v', W: 'w' }), memberUnits: [
  { key: 'reviewed', label: 'Deklarierte Einheit', goalIds: ['v1'], withAssessments: true },
] })
assert.deepEqual(children(singleMember, '__unit__:reviewed'), ['v1'], 'a unit with its own assessment contract keeps its board')
assert.deepEqual(memberMap.findings.map(finding => finding.kind), ['memberUnitSplit', 'memberUnitAbsent'])

// A course outside the two preview subjects gets the map from its own data: it qualifies
// when it declares a learning unit for every atomic goal, and only then.
{
  const courseId = 'course-with-declared-units'
  const course = tree([goal('course-root', ['c-u0', 'c-u1'], [], courseId), goal('c-u0', ['c-start', 'c-a'], [], courseId),
    goal('c-u1', ['c-b', 'c-task'], [], courseId), goal('c-start', [], [], courseId), goal('c-a', [], ['c-start'], courseId),
    goal('c-b', [], ['c-a'], courseId), goal('c-task', [], ['c-b'], courseId)], ['course-root'])
  const meta = { landscapeId: courseId, title: 'Course', learningUnitCoverage: 'complete' as const,
    programUnits: [{ id: 'u0', kind: 'learningUnit' as const, label: 'Auffrischung', labelEn: 'Refresher' },
      { id: 'u1', kind: 'learningUnit' as const, label: 'Systeme', labelEn: 'Systems' }],
    goalPlacements: [['c-start', 'u0'], ['c-a', 'u0'], ['c-b', 'u1'], ['c-task', 'u1']]
      .map(([goalId, unitId]) => ({ goalId, unitId, relation: 'own' as const })) }
  assert.deepEqual(learnerUnitMapSubjectIds(), [MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID], 'without course data the map keeps its two subjects')
  assert(learnerUnitMapSubjectIds([{ meta }]).includes(courseId))
  for (const [label, incomplete] of [['partial coverage', { ...meta, learningUnitCoverage: 'partial' as const }],
    ['no coverage statement', { ...meta, learningUnitCoverage: undefined }], ['no learning unit', { ...meta, programUnits: [] }]] as const) {
    assert(!learnerUnitMapSubjectIds([{ meta: incomplete }]).includes(courseId), `${label} does not qualify a course for the map`)
    assert.equal(deriveLearnerUnitMapPreview({ ...course, landscapeSources: [{ meta: incomplete }] }).memberUnits.length, 0, label)
  }
  // The statement alone is not trusted: with its delivered goals the source is checked goal by goal.
  const delivered = [...course.goalIndexAll.values()]
  assert(learnerUnitMapSubjectIds([{ goals: delivered, meta }]).includes(courseId))
  assert(!learnerUnitMapSubjectIds([{ goals: delivered, meta: { ...meta, goalPlacements: meta.goalPlacements.slice(1) } }]).includes(courseId),
    'an atomic goal without an owning unit disqualifies a course that states complete coverage')
  assert(!learnerUnitMapSubjectIds([{ goals: delivered, meta: { ...meta,
    goalPlacements: [...meta.goalPlacements, { goalId: 'c-a', unitId: 'u1', relation: 'own' as const }] } }]).includes(courseId),
  'an atomic goal owned by two units disqualifies the course')
  assert(learnerUnitMapSubjectIds([{ goals: delivered.filter(item => item.id !== 'c-task'), meta: { ...meta,
    goalPlacements: meta.goalPlacements.filter(placement => placement.goalId !== 'c-task') } }]).includes(courseId),
  'a learner scope that leaves a goal and its placement out keeps the course on the map')
  const preview = deriveLearnerUnitMapPreview({ ...course, landscapeSources: [{ meta }], language: 'en' })
  assert.deepEqual(preview.memberUnits.map(unit => [unit.label, unit.goalIds]), [['Refresher', ['c-start', 'c-a']], ['Systems', ['c-b', 'c-task']]])
  // Beside a Gymnasium subject the course keeps its declared units, and the stage stays a stage.
  const stageSection = (id: string, landscapeId: string, contains: string[]): UiGoal => ({ ...goal(id, contains, [], landscapeId),
    tags: ['synthetic:program-unit'], extendedData: { syntheticStructureKind: 'compositionView', compositionViewId: `view-${landscapeId}`, compositionNodeId: 'sek1' } })
  const mathStage = [stageSection('math-stage', MATHEMATICS_LANDSCAPE_ID, ['m-1']), goal('m-1', [], [], MATHEMATICS_LANDSCAPE_ID)]
  const beside = tree([goal('overview', ['math-stage', 'course-root'], [], 'overview-landscape'), ...mathStage, ...delivered], ['overview'])
  const besidePreview = deriveLearnerUnitMapPreview({ ...beside, landscapeSources: [{ goals: delivered, meta }] })
  assert.deepEqual([...besidePreview.units.keys()], ['math-stage'])
  assert.deepEqual(besidePreview.memberUnits.map(unit => unit.goalIds.length), [2, 2])
  // A course whose tree comes through a composition view does not qualify yet, and its
  // section never joins a stage of the Gymnasium, whatever its node id.
  const viewed = tree([goal('overview', ['math-stage', 'course-stage'], [], 'overview-landscape'), ...mathStage,
    stageSection('course-stage', courseId, ['c-start', 'c-a', 'c-b', 'c-task']),
    ...['c-start', 'c-a', 'c-b', 'c-task'].map(id => goal(id, [], [], courseId))], ['overview'])
  assert(!learnerUnitMapSubjectIds([{ meta }], viewed.goalIndexAll).includes(courseId), 'a course under a composition view is not covered yet')
  const viewedPreview = deriveLearnerUnitMapPreview({ ...viewed, landscapeSources: [{ meta }] })
  assert.deepEqual([...viewedPreview.units.keys()], ['math-stage'], 'only the Mathematics section is a stage unit')
  assert.deepEqual(viewedPreview.memberUnits, [])
  const fixture = buildLearnerUnitMapProjection({ ...course, units: preview.units, after: preview.after, memberUnits: preview.memberUnits })
  assert.deepEqual(fixture.subjectIds, [courseId])
  assert.deepEqual(children(fixture, fixture.rootId)!.map(id => fixture.entries[id].title), ['Refresher', 'Systems'],
    'the clusters that merely wrap the declared units are not shown beside them')
  const [refresherBoard, systemsBoard] = children(fixture, fixture.rootId)!
  assert.deepEqual([fixture.entryPaths!['c-u0'], fixture.entryPaths!['c-u1']],
    [[fixture.rootId, refresherBoard, 'c-u0'], [fixture.rootId, systemsBoard, 'c-u1']],
    'a wrapping cluster selected in the tree opens the board of its unit, not the board above')
  assert.deepEqual(fixture.findings, [])
}

// The shipped linear algebra course (MIT 18.06 aligned) is such a course.
{
  const source = JSON.parse(readFileSync(new URL(
    '../../curricula/US/MIT_OCW/18.06-aligned/json/US_MAS_U_SKILLPILOT_LINEAR_ALGEBRA.en.json', import.meta.url), 'utf8'))
  const { goals: rawGoals, ...meta } = source
  const goals = (rawGoals as { id: string; title: string; type: string; tags?: string[]; contains?: string[]; requires?: string[] }[])
    .map(raw => ({ ...goal(raw.id, raw.contains ?? [], raw.requires ?? [], meta.landscapeId), title: raw.title, tags: raw.tags ?? [],
      type: raw.type as UiGoal['type'] }))
  const course = tree(goals, goals.filter(item => item.tags.includes('root')).map(item => item.id))
  assert(learnerUnitMapSubjectIds([{ goals, meta }]).includes(meta.landscapeId), 'every atomic goal of the shipped course has exactly one unit')
  assert(!learnerUnitMapSubjectIds([{ goals, meta: { ...meta, goalPlacements: meta.goalPlacements.slice(1) } }]).includes(meta.landscapeId),
    'the shipped course without the placement of its first goal would not get the map')
  const preview = deriveLearnerUnitMapPreview({ ...course, landscapeSources: [{ goals, meta }], language: 'en' })
  const fixture = buildLearnerUnitMapProjection({ ...course, units: preview.units, after: preview.after, memberUnits: preview.memberUnits })
  const unitIds = children(fixture, fixture.rootId)!
  assert.deepEqual(unitIds.map(id => [fixture.entries[id].kind, fixture.entries[id].title]),
    meta.programUnits.map((unit: { labelEn: string }) => ['unit', unit.labelEn]), 'the map shows the declared units of the course in their order')
  const clusters = goals.filter(item => item.type === 'cluster' && !item.tags.includes('root')).map(item => item.id)
  assert.deepEqual(clusters.map(id => fixture.entryPaths![id]?.at(-2)), unitIds, 'each cluster of the course leads to the board of its unit')
  const atoms = goals.filter(item => item.type === 'atomic').map(item => item.id).sort()
  assert.deepEqual(unitIds.flatMap(id => children(fixture, id) ?? []).sort(), atoms, 'every atomic goal of the course lies in one of its units')
  assert.deepEqual(fixture.findings, [])
}

console.log('Learner unit map projection passed: units and goals only, unequal depth, removed clusters, merged keys, '
  + 'subject filter, arrows among children, declared/derived/backward order, bad after, preparation, member units '
  + 'and courses with declared units.')
