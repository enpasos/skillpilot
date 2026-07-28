import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import type { UiGoal } from '../src/goalTypes'
import { normalizeLandscape, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  compileCompositionView,
  getCompositionProjectionRole,
  type CompositionView,
  type CompiledCompositionPreviewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import type { CanonicalAuthoringLandscape } from '../src/utils/authoring/canonicalAuthoring'
import {
  applyCompositionViewProjection,
  compositionViewExposesGoal,
} from '../src/utils/compositionViewRuntime'
import { applyGoalPlacementProjection } from '../src/utils/goalPlacementProjection'
import { normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'

const createGoal = (
  id: string,
  title: string,
  contains: string[] = [],
  requires: string[] = [],
): UiGoal => ({
  id,
  title,
  description: title,
  phase: 'GLOBAL',
  themenfeld: '',
  area: '',
  level: 1,
  core: true,
  weight: 1,
  leitideen: [],
  kompetenzen: [],
  sourceRef: '',
  requires,
  effectiveRequires: [...requires],
  inheritedRequires: [],
  contains,
  examples: [],
  tags: id === 'ROOT' ? ['root'] : [],
  type: contains.length > 0 ? 'cluster' : 'atomic',
  nodeKind: 'tutor',
})

const goals = [
  createGoal('ROOT', 'Root', [
    'TARGET',
    'SUPPORT_CLUSTER',
    'SHARED',
    'TARGET_BRANCH',
    'PREREQUISITE_BRANCH',
  ]),
  createGoal('TARGET', 'Target', [], ['SUPPORT_CLUSTER']),
  createGoal('SUPPORT_CLUSTER', 'Support cluster', ['SUPPORT_CHILD']),
  createGoal('SUPPORT_CHILD', 'Support child'),
  createGoal('SHARED', 'Shared'),
  createGoal('TARGET_BRANCH', 'Target branch', ['DEEPER_PREREQUISITE', 'DIRECT_PREREQUISITE']),
  createGoal('DEEPER_PREREQUISITE', 'Deeper prerequisite', ['DEEPER_PREREQUISITE_CHILD']),
  createGoal('DEEPER_PREREQUISITE_CHILD', 'Deeper prerequisite child'),
  createGoal('DIRECT_PREREQUISITE', 'Direct prerequisite'),
  createGoal('PREREQUISITE_BRANCH', 'Prerequisite branch', ['DEEPER_TARGET']),
  createGoal('DEEPER_TARGET', 'Deeper target', ['DEEPER_TARGET_CHILD']),
  createGoal('DEEPER_TARGET_CHILD', 'Deeper target child'),
]

const entry: LandscapeEntry = {
  meta: {
    landscapeId: 'TEST',
    locale: 'de',
    title: 'Test',
    description: 'Test landscape',
    goals: [],
  },
  goals,
}

const canonicalLandscape: CanonicalAuthoringLandscape = {
  landscapeId: 'TEST',
  title: 'Test',
  goals: goals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    phase: goal.phase,
    area: goal.area,
    level: goal.level,
    core: goal.core,
    weight: goal.weight,
    requires: [...goal.requires],
    contains: [...goal.contains],
    tags: [...(goal.tags ?? [])],
    type: goal.type,
  })),
}

const view: CompositionView = {
  viewId: 'projection-role-test',
  landscapeId: 'TEST',
  scope: {
    schoolForm: 'Gymnasium',
    stage: 'Sekundarstufe II',
  },
  rootNodes: [
    {
      kind: 'structure',
      id: 'scope',
      label: 'Scope',
      children: [
        { kind: 'goalEntry', goalId: 'TARGET' },
        {
          kind: 'canonicalSubtree',
          goalId: 'SUPPORT_CLUSTER',
          projectionRole: 'prerequisiteOnly',
        },
        {
          kind: 'goalEntry',
          goalId: 'SUPPORT_CHILD',
          projectionRole: 'target',
        },
        {
          kind: 'goalEntry',
          goalId: 'SHARED',
          projectionRole: 'prerequisiteOnly',
        },
        {
          kind: 'goalEntry',
          goalId: 'SHARED',
          projectionRole: 'target',
        },
      ],
    },
  ],
}

const collectPreviewGoalIds = (
  nodes: CompiledCompositionPreviewNode[],
  result: Set<string> = new Set<string>(),
): Set<string> => {
  nodes.forEach((node) => {
    if (node.sourceGoalId) result.add(node.sourceGoalId)
    collectPreviewGoalIds(node.children, result)
  })
  return result
}

const collectReachableGoalIds = (projectedEntry: LandscapeEntry): Set<string> => {
  const goalById = new Map(projectedEntry.goals.map((goal) => [goal.id, goal]))
  const reachable = new Set<string>()
  const visit = (goalId: string) => {
    if (reachable.has(goalId)) return
    reachable.add(goalId)
    ;(goalById.get(goalId)?.contains ?? []).forEach(visit)
  }
  projectedEntry.goals
    .filter((goal) => (goal.tags ?? []).includes('root'))
    .forEach((goal) => visit(goal.id))
  return reachable
}

const firstNode = view.rootNodes[0]
assert.equal(firstNode.kind, 'structure')
if (firstNode.kind !== 'structure') {
  throw new Error('Expected structure node.')
}
const defaultTargetNode = firstNode.children[0]
assert.equal(defaultTargetNode.kind, 'goalEntry')
if (defaultTargetNode.kind !== 'goalEntry') {
  throw new Error('Expected goalEntry node.')
}
assert.equal(
  getCompositionProjectionRole(defaultTargetNode),
  'target',
  'A missing projectionRole must remain backwards-compatible and mean target.',
)

assert.equal(compositionViewExposesGoal([entry], view, 'TARGET'), true)
assert.equal(compositionViewExposesGoal([entry], view, 'SUPPORT_CLUSTER'), false)
assert.equal(
  compositionViewExposesGoal([entry], view, 'SUPPORT_CHILD'),
  true,
  'An explicit target must win over an inherited prerequisiteOnly role.',
)
assert.equal(
  compositionViewExposesGoal([entry], view, 'SHARED'),
  true,
  'An explicit target must win when the same goal is also prerequisiteOnly.',
)

const [projectedEntry] = applyCompositionViewProjection([entry], view)
assert.ok(projectedEntry)
const projectedGoalIds = new Set(projectedEntry.goals.map((goal) => goal.id))
goals.forEach((goal) => {
  assert.equal(
    projectedGoalIds.has(goal.id),
    true,
    `Projection roles must retain the stable canonical goal ID ${goal.id}.`,
  )
})
assert.deepEqual(
  projectedEntry.goals.find((goal) => goal.id === 'TARGET')?.requires,
  ['SUPPORT_CLUSTER'],
  'A support-only prerequisite must remain in requires.',
)
assert.deepEqual(
  projectedEntry.goals.find((goal) => goal.id === 'TARGET')?.effectiveRequires,
  ['SUPPORT_CLUSTER'],
  'A support-only prerequisite must remain in effectiveRequires.',
)

const reachableGoalIds = collectReachableGoalIds(projectedEntry)
assert.equal(reachableGoalIds.has('TARGET'), true)
assert.equal(reachableGoalIds.has('SUPPORT_CLUSTER'), false)
assert.equal(reachableGoalIds.has('SUPPORT_CHILD'), true)
assert.equal(reachableGoalIds.has('SHARED'), true)
assert.deepEqual(
  entry.goals.find((goal) => goal.id === 'ROOT')?.contains,
  [
    'TARGET',
    'SUPPORT_CLUSTER',
    'SHARED',
    'TARGET_BRANCH',
    'PREREQUISITE_BRANCH',
  ],
  'Applying a view must not mutate the canonical input landscape.',
)

const compiled = compileCompositionView(view, canonicalLandscape)
assert.deepEqual(
  compiled.findings.filter((finding) => finding.severity === 'error'),
  [],
)
const previewGoalIds = collectPreviewGoalIds(compiled.compiledRootNodes)
assert.equal(previewGoalIds.has('TARGET'), true)
assert.equal(previewGoalIds.has('SUPPORT_CLUSTER'), false)
assert.equal(previewGoalIds.has('SUPPORT_CHILD'), true)
assert.equal(previewGoalIds.has('SHARED'), true)

const specificityView: CompositionView = {
  viewId: 'projection-role-specificity-test',
  landscapeId: 'TEST',
  scope: {
    schoolForm: 'Gymnasium',
    stage: 'Sekundarstufe II',
  },
  rootNodes: [
    {
      kind: 'structure',
      id: 'specificity-scope',
      label: 'Specificity scope',
      children: [
        {
          kind: 'landscapeEntry',
          landscapeId: 'TEST',
        },
        {
          kind: 'canonicalSubtree',
          goalId: 'TARGET_BRANCH',
        },
        {
          kind: 'canonicalSubtree',
          goalId: 'DEEPER_PREREQUISITE',
          projectionRole: 'prerequisiteOnly',
        },
        {
          kind: 'goalEntry',
          goalId: 'DIRECT_PREREQUISITE',
          projectionRole: 'prerequisiteOnly',
        },
        {
          kind: 'canonicalSubtree',
          goalId: 'PREREQUISITE_BRANCH',
          projectionRole: 'prerequisiteOnly',
        },
        {
          kind: 'canonicalSubtree',
          goalId: 'DEEPER_TARGET',
          projectionRole: 'target',
        },
      ],
    },
  ],
}

assert.equal(
  compositionViewExposesGoal([entry], specificityView, 'TARGET_BRANCH'),
  true,
  'A canonical target subtree must override the broad landscape target without changing its role.',
)
assert.equal(
  compositionViewExposesGoal([entry], specificityView, 'DEEPER_PREREQUISITE'),
  false,
  'A deeper prerequisiteOnly subtree must override a shallower target subtree.',
)
assert.equal(
  compositionViewExposesGoal([entry], specificityView, 'DEEPER_PREREQUISITE_CHILD'),
  false,
  'The more specific prerequisiteOnly role must apply to all descendants of that subtree.',
)
assert.equal(
  compositionViewExposesGoal([entry], specificityView, 'DIRECT_PREREQUISITE'),
  false,
  'A direct prerequisiteOnly goalEntry must override inherited target roles.',
)
assert.equal(
  compositionViewExposesGoal([entry], specificityView, 'PREREQUISITE_BRANCH'),
  false,
  'A canonical prerequisiteOnly subtree must override the broad landscape target.',
)
assert.equal(
  compositionViewExposesGoal([entry], specificityView, 'DEEPER_TARGET'),
  true,
  'A deeper target subtree must override a shallower prerequisiteOnly subtree.',
)
assert.equal(
  compositionViewExposesGoal([entry], specificityView, 'DEEPER_TARGET_CHILD'),
  true,
  'The more specific target role must apply to all descendants of that subtree.',
)

const [specificityProjectedEntry] = applyCompositionViewProjection([entry], specificityView)
assert.ok(specificityProjectedEntry)
const specificityReachableGoalIds = collectReachableGoalIds(specificityProjectedEntry)
assert.equal(specificityReachableGoalIds.has('TARGET_BRANCH'), true)
assert.equal(specificityReachableGoalIds.has('DEEPER_PREREQUISITE'), false)
assert.equal(specificityReachableGoalIds.has('DEEPER_PREREQUISITE_CHILD'), false)
assert.equal(specificityReachableGoalIds.has('DIRECT_PREREQUISITE'), false)
assert.equal(specificityReachableGoalIds.has('PREREQUISITE_BRANCH'), false)
assert.equal(specificityReachableGoalIds.has('DEEPER_TARGET'), true)
assert.equal(specificityReachableGoalIds.has('DEEPER_TARGET_CHILD'), true)
goals.forEach((goal) => {
  assert.equal(
    specificityProjectedEntry.goals.some((candidate) => candidate.id === goal.id),
    true,
    `Specificity projection must retain the stable canonical goal ID ${goal.id}.`,
  )
})

const invalidView = {
  ...view,
  rootNodes: [
    {
      kind: 'goalEntry',
      goalId: 'TARGET',
      projectionRole: 'visible',
    },
  ],
} as unknown as CompositionView
const invalidResult = compileCompositionView(invalidView, canonicalLandscape)
assert.equal(
  invalidResult.findings.some((finding) => finding.code === 'CPV-008' && finding.severity === 'error'),
  true,
  'Unknown projection roles must be rejected by the composition-view validator.',
)

const canonicalMath = JSON.parse(
  readFileSync(
    new URL(
      '../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as SkillLandscape
const hesseSekundarstufeTwoLkView = JSON.parse(
  readFileSync(
    new URL(
      '../../curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as CompositionView
const canonicalMathEntry = normalizeLandscape(canonicalMath)
assert.ok(canonicalMathEntry, 'The canonical mathematics landscape must be loadable.')

const bridgeGoalIds = [
  '30c013ac-5164-4c3c-8bc1-9a10b2f49533',
  '1ce8af38-082a-477b-af48-b924c92761bf',
]
const formulaCollectionGoalIds = [
  '1e77bb2f-0cd6-5961-b0fb-230317c73fce',
  '288633c1-f61c-5b48-af7e-a80357f96cad',
  'c71ae268-f28e-59f0-982d-91db8f963378',
  'e8237315-654e-5150-97de-49c4cb49b3d1',
  '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda',
]
const yearSevenPrerequisiteChainGoalIds = [
  '80c232f1-8f72-5829-9dbe-5a610ccab3be',
  '496f16a0-c031-5753-b988-d6cd3cab595e',
  'fcfbff12-bd03-52ec-b242-a693212b3d2b',
  'd668c22d-caeb-5e91-8980-721c931a2bcf',
]
const prerequisiteOnlyGoalIds = [
  ...bridgeGoalIds,
  ...formulaCollectionGoalIds,
  ...yearSevenPrerequisiteChainGoalIds,
]
const representativeSekundarstufeTwoTargetGoalIds = [
  '1878f680-095c-511d-aaed-e98393f7fde9',
  '7337049a-c85c-5b94-adaa-81dc93528bf8',
]

prerequisiteOnlyGoalIds.forEach((goalId) => {
  assert.ok(
    canonicalMathEntry.goals.some((goal) => goal.id === goalId),
    `The prerequisite-only goal ${goalId} must retain its stable canonical ID.`,
  )
  assert.equal(
    compositionViewExposesGoal(
      [canonicalMathEntry],
      hesseSekundarstufeTwoLkView,
      goalId,
    ),
    false,
    `The Hessen Sekundarstufe II LK view must not expose support goal ${goalId} as a frontier target.`,
  )
})

representativeSekundarstufeTwoTargetGoalIds.forEach((goalId) => {
  assert.equal(
    compositionViewExposesGoal(
      [canonicalMathEntry],
      hesseSekundarstufeTwoLkView,
      goalId,
    ),
    true,
    `The Hessen Sekundarstufe II LK view must keep genuine target goal ${goalId} selectable.`,
  )
})

const canonicalGoalById = new Map(
  canonicalMathEntry.goals.map((goal) => [goal.id, goal] as const),
)
assert.deepEqual(
  formulaCollectionGoalIds.every((goalId) =>
    canonicalGoalById
      .get('1878f680-095c-511d-aaed-e98393f7fde9')
      ?.requires.includes(goalId),
  ),
  true,
  'Formula-collection goals must remain prerequisites of their genuine Sekundarstufe II target.',
)
assert.equal(
  canonicalGoalById
    .get('7337049a-c85c-5b94-adaa-81dc93528bf8')
    ?.requires.includes('d668c22d-caeb-5e91-8980-721c931a2bcf'),
  true,
  'The year-seven support chain must remain connected to its genuine Sekundarstufe II target.',
)

const [projectedHesseSekundarstufeTwoLk] = applyCompositionViewProjection(
  [canonicalMathEntry],
  hesseSekundarstufeTwoLkView,
)
assert.ok(projectedHesseSekundarstufeTwoLk)
const projectedCanonicalIds = new Set(
  projectedHesseSekundarstufeTwoLk.goals.map((goal) => goal.id),
)
prerequisiteOnlyGoalIds.forEach((goalId) => {
  assert.equal(
    projectedCanonicalIds.has(goalId),
    true,
    `Projection must preserve prerequisite-only goal ${goalId} for global mastery checks.`,
  )
})

const [placementProjectedCanonicalMath] = applyGoalPlacementProjection(
  [canonicalMathEntry],
  ['DE-HE', 'LK', 'G9'],
)
assert.ok(placementProjectedCanonicalMath)

const [compositionProjectedHesseSekundarstufeTwoLk] =
  applyCompositionViewProjection(
    [placementProjectedCanonicalMath],
    hesseSekundarstufeTwoLkView,
  )
assert.ok(compositionProjectedHesseSekundarstufeTwoLk)

const [learnerFacingHesseSekundarstufeTwoLk] =
  normalizeLearnerProjectedEntries([
    compositionProjectedHesseSekundarstufeTwoLk,
  ])
assert.ok(learnerFacingHesseSekundarstufeTwoLk)

const learnerFacingGoalById = new Map(
  learnerFacingHesseSekundarstufeTwoLk.goals.map((goal) => [goal.id, goal] as const),
)
const learnerFacingMathRoot = learnerFacingHesseSekundarstufeTwoLk.goals.find(
  (goal) => (goal.tags ?? []).includes('root'),
)
assert.ok(learnerFacingMathRoot, 'The learner-facing mathematics root must remain present.')
assert.equal(
  learnerFacingMathRoot.contains.length,
  1,
  'The authored Sekundarstufe II view must replace broad placement fallback siblings.',
)
assert.equal(
  learnerFacingGoalById.get(learnerFacingMathRoot.contains[0])?.title,
  'Sekundarstufe II (LK)',
  'Hessen mathematics LK upper secondary must expose the reviewed Sek-II root.',
)

const canonicalFallbackSiblingIds = [
  '6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb',
  'ed631938-ad77-405e-ac25-b06d750b9c05',
  '4eefbd04-9e49-41ea-a087-9ad6ac71ec5a',
]
canonicalFallbackSiblingIds.forEach((goalId) => {
  assert.equal(
    learnerFacingMathRoot.contains.includes(goalId),
    false,
    `Canonical fallback goal ${goalId} must not remain a direct learner-facing sibling.`,
  )
  assert.equal(
    learnerFacingGoalById.has(goalId),
    true,
    `Projection must retain stable canonical goal ${goalId} outside the learner-facing tree.`,
  )
})
assert.equal(
  learnerFacingMathRoot.contains.some((goalId) =>
    learnerFacingGoalById.get(goalId)?.title === 'Sekundarstufe I'
  ),
  false,
  'An explicit upper-secondary scope must not expose a Sekundarstufe-I sibling.',
)

console.log('Composition projection role tests passed.')
