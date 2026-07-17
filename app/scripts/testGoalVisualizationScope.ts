import assert from 'node:assert/strict'

import {
  isOrdinaryAtomicGoalForVisualization,
  normalizeGoalVisualizationSubject,
} from '../../scripts/goal_visualization_scope.mjs'

const ordinaryLeaf = {
  id: 'ordinary',
  contains: [],
  tags: ['Analysis'],
}

assert.equal(isOrdinaryAtomicGoalForVisualization(ordinaryLeaf), true)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, contains: ['child'] }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, contains: 'malformed' }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, nodeKind: 'memory' }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, nodeKind: 'exam' }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, nodeKind: 'tutor' }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, examData: null }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, tags: ['memorization'] }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, tags: ['SRS-DECK:example'] }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, tags: ['Motivation'] }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, tags: ['orientation'] }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, tags: ['Practice'] }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization({ ...ordinaryLeaf, tags: ['Assessment'] }), false)
assert.equal(isOrdinaryAtomicGoalForVisualization(null), false)

assert.equal(normalizeGoalVisualizationSubject('  Mathematik '), 'mathematik')
assert.equal(normalizeGoalVisualizationSubject('Politik und Wirtschaft'), 'politik-und-wirtschaft')
assert.equal(normalizeGoalVisualizationSubject('Französisch'), 'franzoesisch')

console.log('Goal-visualization scope self-test passed: 17 scope guarantees.')
