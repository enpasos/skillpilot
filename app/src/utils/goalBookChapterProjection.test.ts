import assert from 'node:assert/strict'
import { compileGoalBookChapterProjection } from './goalBookChapterProjection'

const goalGraph = {
  schemaVersion: '1.0.0' as const,
  landscapeId: 'fixture-landscape',
  title: 'Fixture',
  goals: [
    {
      id: 'A',
      title: 'A',
      contains: [],
      type: 'atomic' as const,
      semanticKind: 'curricularAtomic',
    },
    {
      id: 'B',
      title: 'B',
      contains: [],
      type: 'atomic' as const,
      semanticKind: 'curricularAtomic',
    },
    {
      id: 'C',
      title: 'C',
      contains: [],
      type: 'atomic' as const,
      semanticKind: 'curricularAtomic',
    },
  ],
}

const view = {
  viewId: 'fixture-view',
  landscapeId: 'fixture-landscape',
  title: 'Fixture projection',
  scope: { schoolForm: 'Gymnasium', stage: 'SekI' },
  rootNodes: [{
    kind: 'structure',
    id: 'root',
    label: 'Root',
    children: [{
      kind: 'goalEntry',
      goalId: 'A',
    }, {
      kind: 'structure',
      id: 'nested',
      label: 'Nested',
      children: [{ kind: 'goalEntry', goalId: 'B' }],
    }, {
      kind: 'goalEntry',
      goalId: 'C',
    }, {
      kind: 'goalEntry',
      goalId: 'external-prerequisite',
      projectionRole: 'prerequisiteOnly',
    }],
  }],
}

const result = compileGoalBookChapterProjection(
  view,
  goalGraph,
  new Set(['A', 'B', 'C']),
)
assert(result.projection, JSON.stringify(result.findings))
assert.deepEqual(
  result.projection.chapters.map(({ chapterId, treeOrder }) => ({ chapterId, treeOrder })),
  [{ chapterId: 'structure:root', treeOrder: 0 }, { chapterId: 'structure:nested', treeOrder: 2 }],
)
assert.deepEqual(
  result.projection.placements.map(({ goalId, navigationOrder, treeOrder }) => ({
    goalId,
    navigationOrder,
    treeOrder,
  })),
  [
    { goalId: 'A', navigationOrder: 0, treeOrder: 1 },
    { goalId: 'B', navigationOrder: 1, treeOrder: 3 },
    { goalId: 'C', navigationOrder: 2, treeOrder: 4 },
  ],
)

const prerequisiteOnlyView = structuredClone(view)
prerequisiteOnlyView.rootNodes[0].children[1] = {
  kind: 'goalEntry',
  goalId: 'B',
  projectionRole: 'prerequisiteOnly',
}
const roleResult = compileGoalBookChapterProjection(
  prerequisiteOnlyView,
  goalGraph,
  new Set(['A', 'B', 'C']),
)
assert(roleResult.projection, JSON.stringify(roleResult.findings))
assert.deepEqual(roleResult.projection.placements.map(({ goalId }) => goalId), ['A', 'C'])

const unresolvedTargetView = structuredClone(view)
unresolvedTargetView.rootNodes[0].children.push({
  kind: 'goalEntry',
  goalId: 'missing-target',
})
const unresolvedResult = compileGoalBookChapterProjection(
  unresolvedTargetView,
  goalGraph,
  new Set(['A', 'B', 'C']),
)
assert.equal(unresolvedResult.projection, null)
assert.ok(unresolvedResult.findings.some(({ code, goalId }) => (
  code === 'CPV-002' && goalId === 'missing-target'
)))

console.log('Goal-book chapter projection tests passed.')
