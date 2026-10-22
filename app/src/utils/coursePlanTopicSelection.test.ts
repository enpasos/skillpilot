import assert from 'node:assert/strict'
import type { UiGoal } from '../goalTypes'
import {
  buildCoursePlanTopicTree,
  analyzeCoursePlanTaskCoverage,
  filterCoursePlanTopicTree,
  findCoursePlanMatchingTasks,
  normalizeCoursePlanTopicGoalIds,
  resolveCoursePlanTopicSelection,
  setCoursePlanTopicSelected,
} from './coursePlanTopicSelection'

function goal(id: string, contains: string[] = [], title = id): UiGoal {
  return {
    id, title, contains, description: title, phase: 'E', themenfeld: '', area: '', level: 1,
    core: true, weight: 1, leitideen: [], kompetenzen: [], sourceRef: '', requires: [], examples: [],
    type: contains.length > 0 ? 'cluster' : 'atomic',
  }
}
const index = (...goals: UiGoal[]) => new Map(goals.map((entry) => [entry.id, entry]))
const treeGoals = index(
  goal('root', ['fall', 'throw'], 'Bewegungen'),
  goal('fall', ['a', 'b'], 'Freier Fall'),
  goal('throw', ['c', 'd'], 'Senkrechter Wurf'),
  goal('a', [], 'Fallzeit'), goal('b', [], 'Fallstrecke'),
  goal('c', [], 'Steigzeit'), goal('d', [], 'Höhe'),
  { ...goal('outside', [], 'Mathematische Voraussetzung'), requires: [] },
)
treeGoals.get('fall')!.requires = ['outside']

assert.deepEqual(resolveCoursePlanTopicSelection(['root', 'fall', 'a'], treeGoals), {
  atomicGoalIds: ['a', 'b', 'c', 'd'], invalidGoalIds: [],
}, 'Overlapping roots count each contained atom once and never add requires')

const withoutFall = setCoursePlanTopicSelected(['root'], 'fall', false, treeGoals)
assert.deepEqual(withoutFall, ['throw'], 'Removing a child of a selected parent persists the remaining branch')
assert.deepEqual(resolveCoursePlanTopicSelection(JSON.parse(JSON.stringify(withoutFall)), treeGoals).atomicGoalIds, ['c', 'd'])
const withoutOneAtom = setCoursePlanTopicSelected(['root'], 'b', false, treeGoals)
assert.deepEqual(withoutOneAtom, ['a', 'throw'])
assert.deepEqual(resolveCoursePlanTopicSelection(withoutOneAtom, treeGoals).atomicGoalIds, ['a', 'c', 'd'])
assert.deepEqual(setCoursePlanTopicSelected(withoutOneAtom, 'root', true, treeGoals), ['root'], 'Selecting a parent compacts redundant roots')
assert.deepEqual(setCoursePlanTopicSelected(['root'], 'fall', true, treeGoals), ['root'])

const overlapping = index(goal('left', ['a', 'b']), goal('right', ['b', 'c']), goal('a'), goal('b'), goal('c'))
assert.deepEqual(resolveCoursePlanTopicSelection(['left', 'right'], overlapping).atomicGoalIds, ['a', 'b', 'c'])
assert.deepEqual(setCoursePlanTopicSelected(['left', 'right'], 'b', false, overlapping), ['a', 'c'], 'A shared deselected atom must disappear from both selected branches')
assert.deepEqual(setCoursePlanTopicSelected(['left', 'right'], 'left', false, overlapping), ['c'])

const projectedChildren = new Map([['root', ['fall']], ['fall', ['a']]])
assert.deepEqual(resolveCoursePlanTopicSelection(['root'], treeGoals, projectedChildren).atomicGoalIds, ['a'], 'The authored learner-facing contains projection wins')
assert.deepEqual(setCoursePlanTopicSelected([], 'root', true, treeGoals, projectedChildren), ['root'])
const compositionGoals = new Map(treeGoals)
compositionGoals.set('composition:phase', {
  ...goal('composition:phase', ['fall', 'throw']), tags: ['synthetic:program-unit'],
  extendedData: { syntheticStructureKind: 'compositionView' },
})
assert.deepEqual(setCoursePlanTopicSelected([], 'composition:phase', true, compositionGoals), ['fall', 'throw'], 'Selecting a synthetic structure persists canonical subtree IDs')
assert.deepEqual(setCoursePlanTopicSelected(['composition:phase'], 'b', false, compositionGoals), ['a', 'throw'])
assert.deepEqual(normalizeCoursePlanTopicGoalIds(['composition:phase'], compositionGoals), ['fall', 'throw'], 'An untouched legacy synthetic root is canonicalized before save')
assert.deepEqual(normalizeCoursePlanTopicGoalIds(['fall', 'a', 'composition:phase', 'throw'], compositionGoals), ['fall', 'throw'], 'Canonicalization removes duplicate and subsumed roots')
assert.deepEqual(resolveCoursePlanTopicSelection(
  normalizeCoursePlanTopicGoalIds(['composition:phase'], compositionGoals), compositionGoals,
), resolveCoursePlanTopicSelection(['composition:phase'], compositionGoals), 'Canonicalization preserves the selected atomic scope')
assert.deepEqual(normalizeCoursePlanTopicGoalIds(['left', 'right', 'b', 'left'], overlapping), ['left', 'right'], 'Partially overlapping roots remain represented once each')
assert.deepEqual(normalizeCoursePlanTopicGoalIds(['old-goal', 'fall', 'old-goal'], treeGoals), ['old-goal', 'fall'], 'Normalization preserves unavailable saved roots')
assert.deepEqual(normalizeCoursePlanTopicGoalIds(['composition:phase'], compositionGoals,
  new Map([['composition:phase', ['fall']], ['fall', ['a']]])), ['fall'], 'Normalization uses the current visible subtree rather than canonical hidden descendants')
compositionGoals.set('opaque', { ...goal('opaque'), type: 'cluster', extendedData: { compositionEntryKind: 'goalEntry' } })
compositionGoals.get('composition:phase')!.contains.push('opaque')
assert.deepEqual(normalizeCoursePlanTopicGoalIds(['composition:phase'], compositionGoals), ['fall', 'throw'], 'Opaque projection containers do not become invalid selected children')
assert.deepEqual(normalizeCoursePlanTopicGoalIds([], compositionGoals), [])

assert.deepEqual(resolveCoursePlanTopicSelection(['fall', 'old-goal'], treeGoals), {
  atomicGoalIds: ['a', 'b'], invalidGoalIds: ['old-goal'],
})
assert.deepEqual(setCoursePlanTopicSelected(['fall', 'old-goal'], 'throw', true, treeGoals), ['fall', 'old-goal', 'throw'], 'Unrelated edits retain unavailable saved references')
assert.deepEqual(setCoursePlanTopicSelected(['fall', 'old-goal'], 'old-goal', false, treeGoals), ['fall'], 'An unavailable reference can be explicitly removed')
const broken = index(goal('missing-child', ['missing']), goal('cycle-a', ['cycle-b']), goal('cycle-b', ['cycle-a']))
assert.deepEqual(resolveCoursePlanTopicSelection(['missing-child', 'cycle-a'], broken), { atomicGoalIds: [], invalidGoalIds: ['missing-child', 'cycle-a'] })
assert.equal(buildCoursePlanTopicTree(broken).length, 2, 'Malformed cyclic components cannot recurse forever')

const tree = buildCoursePlanTopicTree(treeGoals)
const fallSearch = filterCoursePlanTopicTree(tree, 'Freier Fall', treeGoals, 'de')
assert.equal(fallSearch.length, 1)
assert.equal(fallSearch[0].goalId, 'root')
assert.equal(fallSearch[0].selectable, false, 'A path-only search ancestor cannot select hidden siblings')
assert.deepEqual(fallSearch[0].children.map((node) => node.goalId), ['fall'])
assert.equal(fallSearch[0].children[0].selectable, true)
assert.deepEqual(fallSearch[0].children[0].children.map((node) => node.goalId), ['a', 'b'], 'A matched topic shows all descendants that its checkbox selects')
assert(fallSearch[0].children[0].children.every((node) => node.selectable))
const heightSearch = filterCoursePlanTopicTree(tree, 'HÖHE', treeGoals, 'de')
assert.equal(heightSearch[0].selectable, false)
assert.equal(heightSearch[0].children[0].selectable, false)
assert.equal(heightSearch[0].children[0].children[0].selectable, true)
assert.deepEqual(filterCoursePlanTopicTree(tree, 'kein treffer', treeGoals, 'de'), [])
assert.deepEqual(filterCoursePlanTopicTree(tree, ' ', treeGoals, 'de'), tree)
assert.deepEqual(resolveCoursePlanTopicSelection(['fall', 'throw'], treeGoals).atomicGoalIds, ['a', 'b', 'c', 'd'], 'Filtering a tree never mutates the selection or original goal index')

function assessment(id: string, coveredGoalIds?: string[], reviewStatus?: string): UiGoal {
  return {
    ...goal(id),
    examData: {
      ...(reviewStatus === undefined ? {} : { reviewStatus }), coveredGoalIds,
      taskContent: 'Aufgabe', solutionContent: 'Lösung',
      scoring: { maxPoints: 2, passingPoints: 2, steps: [{ id: 'step', points: 2, description: 'Bewertung' }] },
    },
  }
}
const tasks = index(...treeGoals.values(), assessment('fall-task', ['a', 'b'], 'released'),
  assessment('combined-task', ['fall', 'throw'], 'released'), assessment('draft-task', ['a'], 'draft'),
  assessment('legacy-task', ['a']), assessment('no-coverage'), assessment('bad-coverage', ['missing']),
  { ...assessment('requires-only'), requires: ['fall'] },
  { ...goal('placeholder'), nodeKind: 'exam', requires: ['fall'] },
)
assert.deepEqual(findCoursePlanMatchingTasks(['fall'], tasks).map((entry) => entry.id), ['fall-task', 'legacy-task'], 'Only explicit, fully covered authored assessments match')
assert.deepEqual(findCoursePlanMatchingTasks(['a'], tasks).map((entry) => entry.id), ['legacy-task'], 'Partial coverage is insufficient')
assert.deepEqual(findCoursePlanMatchingTasks(['root'], tasks).map((entry) => entry.id), ['fall-task', 'combined-task', 'legacy-task'])
assert.deepEqual(findCoursePlanMatchingTasks(['no-coverage', 'draft-task'], tasks).map((entry) => entry.id), ['no-coverage'], 'Direct assessment selection supports legacy tasks but never bypasses release gates')
tasks.get('fall-task')!.examData!.taskContent = ' '
tasks.get('legacy-task')!.examData!.scoring.maxPoints = 0
assert.deepEqual(findCoursePlanMatchingTasks(['fall'], tasks), [], 'Empty task payloads or invalid scoring are not advertised as usable tasks')

const coverageGoals = index(...treeGoals.values(),
  { ...assessment('selected-task', ['a', 'b'], 'released'), requires: ['outside'] },
  assessment('unknown-task'), assessment('unavailable-task', ['missing'], 'released'),
  assessment('overlapping-task', ['fall', 'a'], 'released'), assessment('blocked-task', ['c'], 'draft'))
assert.deepEqual(analyzeCoursePlanTaskCoverage(['a', 'c', 'selected-task'], coverageGoals), {
  topicGoalIds: ['a', 'c'], taskGoalIds: ['selected-task'], coveredGoalIds: ['a', 'b'],
  uncoveredGoalIds: ['c'], additionalGoalIds: ['b'], unknownTaskIds: [], unavailableGoalIds: [],
}, 'Coverage compares both directions, counts assessments separately, and never calls a prerequisite assessed')
const unknownCoverage = analyzeCoursePlanTaskCoverage(['unknown-task', 'unavailable-task', 'blocked-task'], coverageGoals)
assert.deepEqual(unknownCoverage.unknownTaskIds, ['unknown-task', 'unavailable-task', 'blocked-task'])
assert.deepEqual(unknownCoverage.coveredGoalIds, [])
assert.deepEqual(unknownCoverage.unavailableGoalIds, ['missing'])
assert.deepEqual(analyzeCoursePlanTaskCoverage(['fall', 'selected-task', 'overlapping-task'], coverageGoals).coveredGoalIds, ['a', 'b'],
  'Overlapping contains coverage counts each canonical content goal once')
assert.deepEqual(analyzeCoursePlanTaskCoverage(['fall'], coverageGoals).uncoveredGoalIds, ['a', 'b'],
  'Available packages do not count as selected assessment coverage')

console.log('coursePlanTopicSelection tests passed')
