import assert from 'node:assert/strict'
import type { UiGoal } from '../goalTypes'
import { sortGoalsTopologically } from './goalSorter'
import type { LearningMapFixture, MapPracticeMaterial } from '../components/learningUnitMap/types'
import { getLearningScopeRelations } from '../components/learningUnitMap/scopeRelations'
import { placeUnitLearningResources, unitResourcePlacements } from '../components/learningUnitMap/unitLearningMaterialActions'
import { buildSortedChildrenMap } from './learnerNavigation/treeSiblingOrder'
import { compositionSiblingOrder, projectedSiblingOrder } from './unitStudyOrder'

const goal = (id: string, title: string, overrides: Partial<UiGoal> = {}): UiGoal => ({
  id, title, description: title, phase: 'Q1', themenfeld: '', area: '', level: 0, core: true, weight: 1,
  tags: [], leitideen: [], kompetenzen: [], sourceRef: '', requires: [], contains: [], examples: [],
  type: 'atomic', nodeKind: 'tutor', ...overrides,
})
const order = (goals: UiGoal[], allGoals: UiGoal[] = goals) =>
  sortGoalsTopologically(goals, { allGoalsById: new Map(allGoals.map((entry) => [entry.id, entry])) })
    .map((entry) => entry.id)

// Hard edges: a sibling requirement always precedes its consumer; the title
// decides between otherwise equal siblings.
assert.deepEqual(order([
  goal('c', 'Anwenden', { requires: ['b'] }),
  goal('b', 'Zusammenhang', { requires: ['landscape:a'] }),
  goal('a', 'Begriff'),
  goal('d', 'Ausblick'),
]), ['d', 'a', 'b', 'c'])

// Configured order: explicit position, then the learning flow from the
// motivating introduction over tutorials and flashcards to exercises.
assert.deepEqual(order([
  goal('exercise', 'Aufgaben', { nodeKind: 'exam' }),
  goal('cards', 'Begriffe', { nodeKind: 'memory' }),
  goal('tutorial', 'Zusammenhang'),
  goal('why', 'Warum Physik?'),
  goal('pinned', 'Zuletzt im Alphabet', { tags: ['order:1'] }),
]), ['pinned', 'why', 'tutorial', 'cards', 'exercise'])

// The authored course of any unit orders the visible steps even when a
// manually positioned assessment, an alphabetical tie or a filtered step intervenes.
const botany = [
  goal('report', 'A report', { nodeKind: 'exam', tags: ['order:0'] }),
  goal('compare', 'Compare leaves', { requires: ['identify'] }),
  goal('identify', 'Identify tree species'),
  goal('opening', 'What grows here?'),
]
for (const children of [botany, [...botany].reverse()]) {
  assert.deepEqual(sortGoalsTopologically(children, {
    orientationGoalId: 'opening', guidedStudyOrder: ['opening', 'identify', 'unavailable', 'compare', 'report'],
  }).map(child => child.id), ['opening', 'identify', 'compare', 'report'])
}
assert.deepEqual(sortGoalsTopologically([goal('b', 'B', { requires: ['a'] }), goal('c', 'C', { requires: ['b'] }),
  goal('a', 'A')], { guidedStudyOrder: ['c', 'a'] }).map(child => child.id), ['a', 'b', 'c'],
  'A contradictory declaration must never reverse even an indirect prerequisite.')
const sections = ['end', 'start'].map(id => goal(id, id, { extendedData: { compositionNodeId: id } }))
const declared = compositionSiblingOrder(goal('parent', 'Parent', { extendedData: {
  compositionChildOrderChildIds: ['start', 'hidden', 'end'],
  compositionChildOrder: { after: [{ after: 'start', unit: 'hidden' }, { after: 'hidden', unit: 'end' }] },
} }), sections)
assert.deepEqual(sortGoalsTopologically(sections, { siblingOrder: declared }).map(child => child.id), ['start', 'end'])

// A single downstream leaf can give rise to an arrow between whole branches.
const section = (id: string) => ({ id, title: id, description: '', kind: 'unit' as const, requires: [], position: { x: 0, y: 0 } })
const fixture: LearningMapFixture = {
  rootId: 'unit', title: 'Open curricula', entries: Object.fromEntries(['unit', 'use', 'basis'].map(id => [id, section(id)])),
  entryPaths: { parent: ['unit', 'parent'], previous: ['unit', 'basis', 'previous'], next: ['unit', 'use', 'next'] },
  scopeRelations: { unit: [
    { source: 'basis', target: 'use', kind: 'summary', provenance: [] },
    { source: 'use', target: 'basis', kind: 'summary', provenance: [], backward: true },
  ] },
}
fixture.entries.unit.children = ['basis', 'use']
const projected = projectedSiblingOrder(fixture, 'parent', ['next', 'previous', 'unplaced'])
assert.deepEqual(projected, [{ source: 'previous', target: 'next' }])
assert.deepEqual(sortGoalsTopologically([goal('next', 'A'), goal('previous', 'Z')], { siblingOrder: projected })
  .map(child => child.id), ['previous', 'next'])

// Two independent recommendations belong on their closest common board.
// Filtering the authored atom removes both even when its branch remains.
const nestedMaterial: MapPracticeMaterial = {
  schemaVersion: 4, unit: { landscapeId: 'demo', compositionNodeId: 'unit', viewIds: ['demo-view'] },
  intro: { de: { question: 'Wie?', promise: 'Erklären.' }, en: { question: 'How?', promise: 'Explain.' } }, exercises: [],
  studyRecommendations: [
    { beforeGoalId: 'source', afterGoalId: 'assessment' },
    { beforeGoalId: 'source', afterGoalId: 'application' },
  ],
}
const nestedGoals = [
  goal('unit', 'Unit', { landscapeId: 'demo', type: 'cluster',
    extendedData: { compositionNodeId: 'unit', compositionViewId: 'demo-view' } }),
  goal('assessment', 'Assessment', { tags: ['order:0'], nodeKind: 'exam' }),
  goal('branch', 'Branch', { type: 'cluster' }),
  goal('source', 'Source'),
  goal('application', 'Application'),
]
const nestedGoalIndex = new Map(nestedGoals.map(entry => [entry.id, entry]))
const nestedPlacements = unitResourcePlacements({ material: nestedMaterial, scopes: new Set(['unit']),
  cardDeckIds: new Map(), assessments: new Map() })
for (const visible of [true, false]) {
  const children = { unit: ['assessment', 'branch'], branch: visible ? ['application', 'source'] : ['application'] }
  const nestedFixture: LearningMapFixture = { rootId: 'unit', title: 'Unit', scopeRelations: {}, entries: {
    unit: { ...section('unit'), children: children.unit }, branch: { ...section('branch'), children: children.branch },
    assessment: { ...section('assessment'), kind: 'assessment' }, application: { ...section('application'), kind: 'goal' },
    // A filtered atom may still exist in the wider goal catalog.
    source: { ...section('source'), kind: 'goal' },
  } }
  const sorted = buildSortedChildrenMap(new Map(Object.entries(children)), nestedGoalIndex, 'learner', nestedFixture, [nestedMaterial])
  assert.deepEqual(sorted.get('unit'), visible ? ['branch', 'assessment'] : ['assessment', 'branch'])
  assert.deepEqual(sorted.get('branch'), visible ? ['source', 'application'] : ['application'])
  const map = placeUnitLearningResources(nestedFixture, nestedPlacements)
  const expected = { unit: ['branch', 'assessment'], branch: ['source', 'application'] }
  for (const id of ['unit', 'branch'] as const) {
    const pairs = getLearningScopeRelations(map, id).map(({ source, target, kind }) => [source, target, kind])
    assert.deepEqual(pairs, visible ? [[...expected[id], 'studyRecommendation']] : [])
  }
}

// Soft support: a branch whose goals are required from inside another branch
// comes first, although the alphabet and the missing direct edge say otherwise.
const basics = goal('basics', 'Zahlen', { type: 'cluster', contains: ['basics-1', 'basics-2'] })
const usage = goal('usage', 'Anwendungen', { type: 'cluster', contains: ['usage-1', 'usage-2'] })
const branchGoals = [basics, usage,
  goal('basics-1', 'Zahlbereiche'), goal('basics-2', 'Rechengesetze'),
  goal('usage-1', 'Sachaufgaben', { requires: ['basics-1'] }),
  goal('usage-2', 'Modellieren', { requires: ['basics-2'] })]
assert.deepEqual(order([usage, basics], branchGoals), ['basics', 'usage'])
assert.deepEqual(order([usage, basics]), ['usage', 'basics'], 'Without the branch goals only the title decides.')

// The order is the one a direct evaluation yields: every step places the
// candidate with the best net support against all goals not yet placed.
const referenceOrder = (goals: UiGoal[], allGoals: UiGoal[]) => {
  const byId = new Map(allGoals.map((entry) => [entry.id, entry]))
  const branch = (id: string): string[] => [id, ...(byId.get(id)?.contains ?? []).flatMap(branch)]
  const support = (source: UiGoal, target: UiGoal) => {
    const providers = new Set(branch(source.id))
    const demanders = branch(target.id).slice(1).map((id) => byId.get(id)!)
    const count = demanders.flatMap((demander) => demander.requires).filter((id) => providers.has(id)).length
    const requireBearing = demanders.filter((demander) => demander.requires.length > 0).length
    return count >= 2 && count / Math.max(1, requireBearing) >= 0.25 ? count : 0
  }
  const remaining = [...goals]
  const placed: string[] = []
  while (remaining.length > 0) {
    const blocked = (candidate: UiGoal) => candidate.requires.some((id) => id !== candidate.id
      && remaining.some((other) => other.id === id))
    const available = remaining.filter((candidate) => !blocked(candidate))
    const net = (candidate: UiGoal) => remaining.filter((other) => other !== candidate)
      .reduce((sum, other) => sum + support(candidate, other) - support(other, candidate), 0)
    const next = [...(available.length > 0 ? available : remaining)].sort((left, right) =>
      net(right) - net(left) || left.title.localeCompare(right.title, 'de-DE') || left.id.localeCompare(right.id))[0]
    placed.push(next.id)
    remaining.splice(remaining.indexOf(next), 1)
  }
  return placed
}
let seed = 20261112
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 0x100000000
}
for (let round = 0; round < 300; round += 1) {
  const all: UiGoal[] = []
  const siblings = Array.from({ length: 2 + Math.floor(random() * 7) }, (_, index) => {
    const children = Array.from({ length: Math.floor(random() * 4) }, (_child, child) => goal(`s${index}-${child}`, `Teil ${child}`))
    const sibling = goal(`s${index}`, `Thema ${Math.floor(random() * 5)}`, {
      type: children.length > 0 ? 'cluster' : 'atomic', contains: children.map((child) => child.id),
    })
    all.push(sibling, ...children)
    return sibling
  })
  all.forEach((entry) => {
    while (random() < 0.45) entry.requires.push(all[Math.floor(random() * all.length)].id)
  })
  assert.deepEqual(order(siblings, all), referenceOrder(siblings, all), `Random sibling group ${round} keeps its order.`)
}

// One long flat list, as the "Notwendige Grundlagen" branch of a Personal
// Curriculum can be: sorting it must stay far away from blocking the browser.
const flat = Array.from({ length: 1600 }, (_, index) => goal(`flat-${String(index).padStart(4, '0')}`, `Ziel ${1600 - index}`, {
  requires: index % 7 === 0 && index > 0 ? [`flat-${String(index - 1).padStart(4, '0')}`] : [],
}))
const started = performance.now()
const sortedFlat = order(flat)
const elapsed = performance.now() - started
assert.equal(sortedFlat.length, flat.length)
assert.equal(new Set(sortedFlat).size, flat.length)
flat.forEach((entry) => entry.requires.forEach((requiredId) => {
  assert(sortedFlat.indexOf(requiredId) < sortedFlat.indexOf(entry.id), 'Requirements precede their consumers at scale.')
}))
assert(elapsed < 5000, `Sorting 1600 flat siblings took ${Math.round(elapsed)} ms.`)

console.log('Goal sorter order and scale tests passed.')
