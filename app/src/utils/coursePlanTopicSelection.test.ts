import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import type { UiGoal } from '../goalTypes'
import { convertLearningGoal } from '../goalTypes'
import type { SkillLandscape } from '../landscapeTypes'
import {
  buildCoursePlanTopicTree,
  analyzeCoursePlanTaskCoverage,
  filterCoursePlanTopicTree,
  findCoursePlanMatchingTasks,
  normalizeCoursePlanTopicGoalIds,
  resolveCoursePlanReferencedTopics,
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

// HE-LK places these two content atoms directly in the learner tree. The
// published task also references their canonical parent, which is not visible.
const canonicalPhysics = JSON.parse(readFileSync(new URL(
  '../../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', import.meta.url,
), 'utf8')) as SkillLandscape
const physicsReferences = new Map(canonicalPhysics.goals.map((entry) => {
  const converted = convertLearningGoal(entry, { landscapeId: canonicalPhysics.landscapeId })
  return [converted.id, converted] as const
}))
const kinematicsTaskIds = ['4ab1cf6d-b808-5b86-9291-85df0b9f2496', '6ea3fb3c-abdc-568f-ab13-97c36dc274e4']
const kinematicsTopics = ['e4b38061-1f28-43ad-8371-a3e7c0e81856', 'd6dc0e02-831d-4894-a61a-852bcc74f147']
const matchingKinematics = new Set(findCoursePlanMatchingTasks(kinematicsTopics, physicsReferences).map(({ id }) => id))
assert(kinematicsTaskIds.every((id) => matchingKinematics.has(id)),
  'both reviewed kinematics packages must be usable candidates in the course planner')
assert.deepEqual(analyzeCoursePlanTaskCoverage([...kinematicsTopics, ...kinematicsTaskIds], physicsReferences).uncoveredGoalIds, [],
  'the written kinematics packages cover their explicitly mapped model competencies')
const freeFallClusterId = '230345f3-c360-4963-b390-ab94e3e2c864'
const physicsTaskId = 'a9562b05-c54d-5635-9244-3f7dd24a8642'
const physicsContentIds = [
  'ce431132-dfc4-42c2-aff6-bd72035190f8', 'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  '09029573-864f-40ca-bf8a-cee7bf6dcb73', '4a2bf015-052b-4af0-aed7-324259fa1a8a',
  'ac25ffe3-fd42-592d-a937-79cc13460313',
]
const physicsTargets = new Map([physicsTaskId, ...physicsContentIds].map((id) => [id, physicsReferences.get(id)!]))
assert.equal(physicsTargets.has(freeFallClusterId), false)
assert.equal(physicsReferences.get(physicsTaskId)?.examData?.coveredGoalIds?.length, 6)
assert.deepEqual(analyzeCoursePlanTaskCoverage([physicsTaskId], physicsTargets).unknownTaskIds, [physicsTaskId],
  'the projected tree alone cannot resolve an omitted canonical coverage wrapper')
const physicsCoverage = analyzeCoursePlanTaskCoverage([physicsTaskId], physicsTargets, undefined, physicsReferences)
assert.deepEqual(physicsCoverage.coveredGoalIds, physicsContentIds,
  'six authored roots resolve to five unique, already-visible HE-LK content atoms')
assert.deepEqual(physicsCoverage.unavailableGoalIds, [])
assert.deepEqual(physicsCoverage.unknownTaskIds, [])
assert.deepEqual(findCoursePlanMatchingTasks(physicsContentIds, physicsTargets, undefined, physicsReferences)
  .map((task) => task.id), [physicsTaskId],
  'matching assessment candidates resolve canonical wrappers through the same target-safe lookup')
assert.deepEqual(resolveCoursePlanReferencedTopics([`physics:${freeFallClusterId}`], physicsTargets, undefined, physicsReferences), {
  atomicGoalIds: ['e4b38061-1f28-43ad-8371-a3e7c0e81856', '09029573-864f-40ca-bf8a-cee7bf6dcb73'], invalidGoalIds: [],
}, 'qualified references use the same canonical cluster while retaining visible target IDs')
const partialOutsideReferences = new Map(physicsReferences)
partialOutsideReferences.set('outside-course', goal('outside-course'))
partialOutsideReferences.set(freeFallClusterId, {
  ...physicsReferences.get(freeFallClusterId)!,
  contains: [...physicsReferences.get(freeFallClusterId)!.contains, 'outside-course'],
})
assert.deepEqual(resolveCoursePlanReferencedTopics([freeFallClusterId], physicsTargets, undefined, partialOutsideReferences), {
  atomicGoalIds: [], invalidGoalIds: [freeFallClusterId],
}, 'one hidden atom invalidates the entire fallback reference instead of producing partial coverage')
assert.deepEqual(analyzeCoursePlanTaskCoverage([physicsTaskId], physicsTargets, undefined, partialOutsideReferences).unknownTaskIds,
  [physicsTaskId], 'a partially out-of-scope canonical cluster remains an unknown task mapping')
assert.deepEqual(resolveCoursePlanReferencedTopics(['outside-course'], physicsTargets, undefined, partialOutsideReferences), {
  atomicGoalIds: [], invalidGoalIds: ['outside-course'],
}, 'known canonical text cannot promote an unavailable atom into the course target')
assert(analyzeCoursePlanTaskCoverage([freeFallClusterId, physicsTaskId], physicsTargets, undefined, physicsReferences)
  .unavailableGoalIds.includes(freeFallClusterId), 'fallback resolution does not make an invisible root selectable')

const projectedReferences = index(goal('visible-root', ['a', 'hidden']), goal('hidden'),
  goal('reference-wrapper', ['visible-root']), goal('cycle-left', ['cycle-right']), goal('cycle-right', ['cycle-left']))
const projectedTargets = index(goal('visible-root', ['a', 'hidden']), { ...goal('a'), requires: ['outside'] })
const projectedEdges = new Map([['visible-root', ['a']]])
assert.deepEqual(resolveCoursePlanReferencedTopics(['visible-root', 'reference-wrapper'], projectedTargets, projectedEdges, projectedReferences), {
  atomicGoalIds: ['a'], invalidGoalIds: [],
}, 'visible cluster references always honor the authoritative projection and never add their hidden canonical siblings or requires')
assert.deepEqual(resolveCoursePlanReferencedTopics(['cycle-left'], projectedTargets, projectedEdges, projectedReferences), {
  atomicGoalIds: [], invalidGoalIds: ['cycle-left'],
}, 'canonical reference cycles terminate and cannot create complete coverage')

console.log('coursePlanTopicSelection tests passed')
