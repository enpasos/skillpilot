// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import type {
  CanonicalAuthoringGoal,
  CanonicalAuthoringLandscape,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  compileCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionProjectionRole,
  type CompositionStructureNode,
  type CompositionView,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'

const goal = (id: string, contains: string[] = []): CanonicalAuthoringGoal => ({
  id,
  title: `Fixture ${id}`,
  description: `Synthetic regression fixture ${id}.`,
  contains,
  requires: [],
  type: contains.length ? 'cluster' : 'atomic',
  tags: id === 'ROOT' ? ['root'] : [],
  weight: 1,
  core: true,
})

const sharedAtomLandscape: CanonicalAuthoringLandscape = {
  landscapeId: 'VISIBLE_OVERLAP_FIXTURE',
  title: 'Synthetic visible overlap fixture',
  goals: [
    goal('ROOT', ['LEFT', 'RIGHT']),
    goal('LEFT', ['LEFT_ATOM', 'SHARED']),
    goal('RIGHT', ['RIGHT_ATOM', 'SHARED']),
    goal('LEFT_ATOM'),
    goal('RIGHT_ATOM'),
    goal('SHARED'),
  ],
}

const sharedClusterLandscape: CanonicalAuthoringLandscape = {
  landscapeId: 'VISIBLE_CLUSTER_OVERLAP_FIXTURE',
  title: 'Synthetic nested visible overlap fixture',
  goals: [
    goal('ROOT', ['LEFT', 'RIGHT']),
    goal('LEFT', ['LEFT_ATOM', 'SHARED_CLUSTER']),
    goal('RIGHT', ['RIGHT_ATOM', 'SHARED_CLUSTER']),
    goal('LEFT_ATOM'),
    goal('RIGHT_ATOM'),
    goal('SHARED_CLUSTER', ['SHARED_CHILD', 'SHARED_OTHER']),
    goal('SHARED_CHILD'),
    goal('SHARED_OTHER'),
  ],
}

const subtree = (
  goalId: string,
  projectionRole?: CompositionProjectionRole,
): CompositionViewNode => ({
  kind: 'canonicalSubtree',
  goalId,
  ...(projectionRole ? { projectionRole } : {}),
})

const direct = (
  goalId: string,
  projectionRole?: CompositionProjectionRole,
): CompositionViewNode => ({
  kind: 'goalEntry',
  goalId,
  ...(projectionRole ? { projectionRole } : {}),
})

const section = (
  id: string,
  children: CompositionViewNode[],
): CompositionStructureNode => ({ kind: 'structure', id, label: `Fixture section ${id}`, children })

const branches = (): CompositionViewNode[] => [
  section('left-section', [subtree('LEFT')]),
  section('right-section', [subtree('RIGHT')]),
]

const visibleGoalIds = (nodes: CompiledCompositionPreviewNode[]): string[] => (
  nodes.flatMap((node) => [
    ...(node.sourceGoalId ? [node.sourceGoalId] : []),
    ...visibleGoalIds(node.children),
  ])
)

let cases = 0
const check = (
  name: string,
  rootNodes: CompositionViewNode[],
  expectedErrorCodes: string[],
  expectedVisibleIds: string[],
  landscape = sharedAtomLandscape,
) => {
  const view: CompositionView = {
    viewId: `visible-overlap-${name}`,
    landscapeId: landscape.landscapeId,
    scope: { schoolForm: 'Gymnasium', stage: 'Sekundarstufe I' },
    rootNodes,
  }
  const inputsBefore = structuredClone({ view, landscape })
  const result = compileCompositionView(view, landscape)
  const errorCodes = [...new Set(result.findings
    .filter((finding) => finding.severity === 'error')
    .map((finding) => finding.code))].sort()

  assert.deepEqual(errorCodes, [...expectedErrorCodes].sort(), `${name}: compiler error codes`)
  assert.deepEqual(
    visibleGoalIds(result.compiledRootNodes).sort(),
    [...expectedVisibleIds].sort(),
    `${name}: visible goals and occurrence counts`,
  )
  assert.deepEqual({ view, landscape }, inputsBefore, `${name}: inputs must remain unchanged`)
  cases += 1
}

const hiddenSharedIds = ['LEFT', 'LEFT_ATOM', 'RIGHT', 'RIGHT_ATOM']
const visibleSharedIds = ['LEFT', 'LEFT_ATOM', 'SHARED', 'RIGHT', 'RIGHT_ATOM', 'SHARED']
const overlapErrors = ['CPV-004', 'CPV-005', 'CPV-006']

// The canonical DAG overlaps, while the compiled learner tree does not.
check('common-support-atom', [
  ...branches(),
  direct('SHARED', 'prerequisiteOnly'),
], [], hiddenSharedIds)

check('common-support-cluster', [
  ...branches(),
  subtree('SHARED_CLUSTER', 'prerequisiteOnly'),
], [], hiddenSharedIds, sharedClusterLandscape)

check('all-support-subtrees', [
  section('left-section', [subtree('LEFT', 'prerequisiteOnly')]),
  section('right-section', [subtree('RIGHT', 'prerequisiteOnly')]),
], [], [])

// Removing overlap diagnostics for hidden support must preserve visible errors.
check('visible-partial-overlap', branches(), overlapErrors, visibleSharedIds)

check('duplicate-visible-root', [
  section('first-section', [subtree('LEFT')]),
  section('second-section', [subtree('LEFT')]),
], overlapErrors, ['LEFT', 'LEFT_ATOM', 'SHARED', 'LEFT', 'LEFT_ATOM', 'SHARED'])

check('duplicate-direct-goal', [
  section('first-section', [direct('SHARED')]),
  section('second-section', [direct('SHARED')]),
], ['CPV-005', 'CPV-006'], ['SHARED', 'SHARED'])

check('duplicate-direct-goal-same-parent', [
  section('single-section', [direct('SHARED'), direct('SHARED')]),
], ['CPV-005'], ['SHARED', 'SHARED'])

check('direct-goal-and-subtree', [
  section('left-section', [subtree('LEFT')]),
  section('direct-section', [direct('SHARED')]),
], ['CPV-005', 'CPV-006'], ['LEFT', 'LEFT_ATOM', 'SHARED', 'SHARED'])

// At equal specificity, target wins independently of authored reference order.
for (const roles of [
  ['prerequisiteOnly', 'target'],
  ['target', 'prerequisiteOnly'],
] as const) {
  check(`equal-specificity-${roles.join('-')}`, [
    ...branches(),
    ...roles.map((role) => direct('SHARED', role)),
  ], overlapErrors, [...visibleSharedIds, 'SHARED'])
}

// Invalid references and roles must not become valid by being hidden.
check('missing-visible-subtree', [subtree('ABSENT')], ['CPV-002'], [])
check('missing-support-subtree', [subtree('ABSENT', 'prerequisiteOnly')], ['CPV-002'], [])
check('missing-support-direct-goal', [direct('ABSENT', 'prerequisiteOnly')], ['CPV-002'], [])

check('invalid-subtree-role', [{
  kind: 'canonicalSubtree',
  goalId: 'LEFT',
  projectionRole: 'visible',
} as unknown as CompositionViewNode], ['CPV-008'], ['LEFT', 'LEFT_ATOM', 'SHARED'])

check('invalid-direct-goal-role', [{
  kind: 'goalEntry',
  goalId: 'SHARED',
  projectionRole: 'visible',
} as unknown as CompositionViewNode], ['CPV-008'], ['SHARED'])

console.log(`Composition visible overlap regression tests passed (${cases} cases).`)
