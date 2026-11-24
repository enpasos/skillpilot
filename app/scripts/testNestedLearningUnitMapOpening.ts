// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import type { UiGoal } from '../src/goalTypes'
import { buildLearnerUnitMapProjection } from '../src/utils/learnerNavigation/learnerUnitMapProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'

const leaf = (id: string): UiGoal => ({
  id, title: id, description: '', type: 'atomic', landscapeId: 'physics', level: 0,
  core: true, weight: 1, phase: 'GLOBAL', themenfeld: '', area: '', tags: [], leitideen: [],
  kompetenzen: [], sourceRef: '', contains: [], requires: [], examples: [], nodeKind: 'tutor',
})
const structure = (id: string, title: string, children: string[]): UiGoal => ({
  ...leaf(id), title, type: 'cluster', contains: children,
  extendedData: { syntheticStructureKind: 'compositionView', compositionNodeId: id, compositionViewId: 'local-view' },
})

const parent = structure('motion', 'Bewegungen', ['fall-section'])
const child = structure('fall-section', 'Freier Fall', ['opening', 'owned', 'other', 'exam'])
const intro: UiGoal = { ...leaf('opening'), semanticKind: 'orientation' }
const goals = [parent, child, intro, leaf('owned'), leaf('other'), { ...leaf('exam'), nodeKind: 'exam' as const }]
const index = new Map(goals.map(goal => [goal.id, goal]))
function project(own: string[]) {
  return buildLearnerUnitMapProjection({
    rootGoals: [parent], goalIndexAll: index, canonicalGoalIndexAll: index,
    visibleGoalIds: new Set(index.keys()), visibleChildrenByParent: buildDirectChildrenMap(index),
    units: new Map([[parent.id, { key: 'parent-section' }], [child.id, { key: 'child-section' }]]),
    memberUnits: [{ key: 'declared-fall', label: child.title, goalIds: own, withAssessments: true }],
  })
}

const before = JSON.stringify(goals)
const map = project(['opening', 'owned', 'exam'])
assert.equal(map.unitEntryIds['declared-fall'], map.unitEntryIds['child-section'])
assert.deepEqual(map.entries[parent.id].children, [child.id])
assert.deepEqual(map.entries[child.id].children, child.contains)
assert.equal(map.entries[child.id].orientationGoalId, intro.id)
assert.equal(map.entries[child.id].unitType, 'unitWithAssessments')
assert.deepEqual(map.entryPaths![intro.id], [map.rootId, parent.id, child.id, intro.id])
assert.equal(Object.values(map.entries).filter(entry => entry.title === child.title).length, 1)

const differentUnit = project(['owned', 'exam'])
assert.notEqual(differentUnit.unitEntryIds['declared-fall'], differentUnit.unitEntryIds['child-section'],
  'Matching titles alone cannot establish that a declared unit owns the section opening')
assert.equal(JSON.stringify(goals), before)
console.log('Nested composition section and its declared learning unit share one board and the owned opening.')
