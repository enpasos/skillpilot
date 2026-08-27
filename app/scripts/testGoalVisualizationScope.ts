import assert from 'node:assert/strict'

import {
  isActiveClusterOverviewForVisualization,
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

const activeClusterOverview = {
  id: 'overview',
  contains: ['child'],
  tags: ['Geometry'],
  resourceLinks: [{
    type: 'goal-visualization',
    role: 'primary',
    url: '/assets/goal-visualizations/mathematik/overview/overview.jpg',
  }],
}
assert.equal(isActiveClusterOverviewForVisualization(activeClusterOverview), true)
assert.equal(isActiveClusterOverviewForVisualization({ ...activeClusterOverview, contains: [] }), false)
assert.equal(isActiveClusterOverviewForVisualization({ ...activeClusterOverview, resourceLinks: [] }), false)
assert.equal(isActiveClusterOverviewForVisualization({
  ...activeClusterOverview,
  resourceLinks: [{ ...activeClusterOverview.resourceLinks[0], role: 'secondary' }],
}), false)
assert.equal(isActiveClusterOverviewForVisualization({ ...activeClusterOverview, tags: ['assessment'] }), false)
assert.equal(isActiveClusterOverviewForVisualization(null), false)

assert.equal(normalizeGoalVisualizationSubject('  Mathematik '), 'mathematik')
assert.equal(normalizeGoalVisualizationSubject('Politik und Wirtschaft'), 'politik-und-wirtschaft')
assert.equal(normalizeGoalVisualizationSubject('Französisch'), 'franzoesisch')

console.log('Goal-visualization scope self-test passed: 23 scope guarantees.')
