import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import type { UiGoal } from '../src/goalTypes'
import { normalizeLandscape, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  compileCompositionView,
  getCompositionProjectionRole,
  type CompositionView,
  type CompositionStructureNode,
  type CompositionViewNode,
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
    semanticKind: goal.id === 'SUPPORT_CLUSTER'
      ? 'curricularArea'
      : goal.contains.length > 0
        ? 'programStructure'
        : 'curricularAtomic',
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

const opaqueCurricularAreaView: CompositionView = {
  viewId: 'opaque-curricular-area-test',
  landscapeId: 'TEST',
  scope: {
    schoolForm: 'Gymnasium',
    stage: 'Sekundarstufe II',
  },
  rootNodes: [
    {
      kind: 'goalEntry',
      goalId: 'SUPPORT_CLUSTER',
    },
  ],
}
const opaqueCurricularAreaResult = compileCompositionView(
  opaqueCurricularAreaView,
  canonicalLandscape,
)
assert.equal(
  opaqueCurricularAreaResult.findings.some(
    (finding) => finding.code === 'CPV-009' && finding.severity === 'error',
  ),
  true,
  'A reviewed curricularArea cluster must not be exposed as an opaque goalEntry.',
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

const collectCompositionStructures = (
  nodes: CompositionViewNode[],
): CompositionStructureNode[] => nodes.flatMap((node) => (
  node.kind === 'structure'
    ? [node, ...collectCompositionStructures(node.children)]
    : []
))

const hesseMathematicsViewsWithQ2Supplements = [
  'de-he-gk-g8.view.json',
  'de-he-gk-g9.view.json',
  'de-he-gk.view.json',
  'de-he-lk-g8.view.json',
  'de-he-lk-g9.view.json',
  'de-he-lk.view.json',
  'de-he-sekii-gk.view.json',
  'de-he-sekii-lk.view.json',
]

hesseMathematicsViewsWithQ2Supplements.forEach((viewFileName) => {
  const compositionView = JSON.parse(
    readFileSync(
      new URL(
        `../../curricula/DE/Gymnasium/composition-views/mathematik/${viewFileName}`,
        import.meta.url,
      ),
      'utf8',
    ),
  ) as CompositionView
  const structures = collectCompositionStructures(compositionView.rootNodes)
  const q2Structures = structures.filter((node) => node.id === 'q2')
  const q2SupplementStructures = structures.filter((node) => (
    node.id === 'q2-source-extraction-supplements'
    || node.id === 'he-source-extraction-supplements-sekii'
  ))

  assert.equal(
    q2Structures.length,
    1,
    `${viewFileName} must define exactly one Q2 structure.`,
  )
  assert.equal(
    q2SupplementStructures.length,
    1,
    `${viewFileName} must retain exactly one reviewed Q2 supplement structure.`,
  )
  assert.equal(
    q2Structures[0].children.includes(q2SupplementStructures[0]),
    true,
    `${viewFileName} must place the reviewed supplemental content below its one Q2 structure.`,
  )
  assert.equal(
    q2SupplementStructures[0].label,
    'Skalarprodukt und Analytische Geometrie',
    `${viewFileName} must not present the supplemental content as a second Q2 phase.`,
  )
})

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
const hesseLkProjectionRegressionIds = {
  orientation: '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2',
  projectionPrerequisite: '3016ec37-1c2e-47db-83f5-e767923bc97e',
  orthogonalProjection: 'ed5d869b-af4e-4b80-b34d-a2338e16ce34',
  reflectionArea: 'dd042c27-d513-5352-9de9-2a5923a98e69',
} as const
const hesseLkDirectPrerequisiteClosure = [
  ['09f47964-2cd0-410e-93ee-9632b582fc91', '2bb4bb91-7929-483a-b735-44275f6b5cdc'],
  ['2d75fd3f-c68b-4a11-89ae-19a30fefc47a', 'af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186'],
  ['29ce4053-b5c5-4a82-9ff0-3acc492284d8', 'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e'],
  ['29ce4053-b5c5-4a82-9ff0-3acc492284d8', '7bff61c1-1a69-4991-97de-0cff764f507e'],
  ['29ce4053-b5c5-4a82-9ff0-3acc492284d8', '39fa30f2-e1ae-5c36-be56-793b77906abb'],
  ['075f1ef2-6860-4b20-9df2-878157eb395e', 'f242a3e8-55a3-492e-8354-b81b24cdbb78'],
  ['075f1ef2-6860-4b20-9df2-878157eb395e', '19f170e4-b88f-4c06-b72a-ce6923748bb4'],
  ['944dd479-9f30-5acb-ab32-3ea0b6dc8e06', '0a846521-edcc-5c3c-a844-eac061e053ce'],
  ['36e0de23-1e3b-5c69-888f-e5e19e79cbbe', 'fac75b4a-4ec2-5d38-bbce-9b002c8a4904'],
  ['508292f2-671b-4fd3-acbf-53d705e44693', 'efc3506a-5f35-4d77-9498-d70a091a470b'],
  ['508292f2-671b-4fd3-acbf-53d705e44693', '4ac925cf-3862-4810-be2a-d92efff7d735'],
  ['2e40a879-b62e-5dbf-aa45-020c0625a902', '96c55cb6-d2c7-5145-8567-b5f570f55a8a'],
  ['2e40a879-b62e-5dbf-aa45-020c0625a902', '74dc4b0d-a167-564c-bdc1-5cf510aee280'],
  ['4a53a441-3c2a-53aa-8a1a-e08a6898e826', '9278bc5e-a77f-5f72-8636-0d0d3e3d32ae'],
  ['8cb5c712-9c58-5910-8c63-8c3736369b80', 'fac75b4a-4ec2-5d38-bbce-9b002c8a4904'],
  ['bd3576b8-f4e5-542a-a8a2-74524d9cee21', 'fac75b4a-4ec2-5d38-bbce-9b002c8a4904'],
  ['c2c49659-5917-5be5-a3bd-e46f1b17126f', '3256476b-ec65-4038-9f5a-a8808fbcf207'],
  ['c2c49659-5917-5be5-a3bd-e46f1b17126f', '509ae03b-96b1-4bb1-b015-b83d14569dae'],
] as const

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

assert.equal(
  compositionViewExposesGoal(
    [canonicalMathEntry],
    hesseSekundarstufeTwoLkView,
    hesseLkProjectionRegressionIds.projectionPrerequisite,
  ),
  true,
  'The direct prerequisite of the orthogonal-projection goal must be an explicit Hessen LK target.',
)
;[
  hesseLkProjectionRegressionIds.orthogonalProjection,
  hesseLkProjectionRegressionIds.reflectionArea,
  'fcd1d180-ddce-5408-8c5d-70e417b179e7',
  'a97c7cce-1343-5d04-926f-4a4f323b3c21',
  '985d5529-a586-50eb-bd7f-2db2be8906d1',
].forEach((goalId) => {
  assert.equal(
    compositionViewExposesGoal(
      [canonicalMathEntry],
      hesseSekundarstufeTwoLkView,
      goalId,
    ),
    true,
    `The Hessen LK view must expose the canonical target subtree goal ${goalId}.`,
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
assert.equal(
  learnerFacingGoalById
    .get(hesseLkProjectionRegressionIds.orthogonalProjection)
    ?.requires.includes(hesseLkProjectionRegressionIds.projectionPrerequisite),
  true,
  'The learner-facing Hessen LK projection must retain the direct prerequisite of the orthogonal-projection goal.',
)
assert.ok(
  learnerFacingGoalById.has(hesseLkProjectionRegressionIds.projectionPrerequisite),
  'The direct orthogonal-projection prerequisite must be present in the projected structural lookup.',
)
hesseLkDirectPrerequisiteClosure.forEach(([targetGoalId, prerequisiteGoalId]) => {
  assert.equal(
    compositionViewExposesGoal(
      [canonicalMathEntry],
      hesseSekundarstufeTwoLkView,
      targetGoalId,
    ),
    true,
    `The reviewed Hessen LK target ${targetGoalId} must stay learner-facing.`,
  )
  assert.equal(
    canonicalGoalById.get(targetGoalId)?.requires.includes(prerequisiteGoalId),
    true,
    `The reviewed canonical edge ${targetGoalId} -> ${prerequisiteGoalId} must stay explicit.`,
  )
  assert.ok(
    learnerFacingGoalById.has(prerequisiteGoalId),
    `The direct prerequisite ${prerequisiteGoalId} of Hessen LK target ${targetGoalId} must remain in the projected structural lookup.`,
  )
})
canonicalMathEntry.goals
  .filter((goal) => goal.contains.length === 0)
  .filter((goal) => compositionViewExposesGoal(
    [canonicalMathEntry],
    hesseSekundarstufeTwoLkView,
    goal.id,
  ))
  .forEach((goal) => {
    goal.requires.forEach((prerequisiteGoalId) => {
      assert.ok(
        learnerFacingGoalById.has(prerequisiteGoalId),
        `Every direct prerequisite of reviewed Hessen LK target ${goal.id} must be explicitly present in the projected structural lookup; missing ${prerequisiteGoalId}.`,
      )
    })
  })
assert.deepEqual(
  learnerFacingGoalById.get(hesseLkProjectionRegressionIds.reflectionArea)?.contains,
  [
    'fcd1d180-ddce-5408-8c5d-70e417b179e7',
    'a97c7cce-1343-5d04-926f-4a4f323b3c21',
    '985d5529-a586-50eb-bd7f-2db2be8906d1',
  ],
  'The reflection curricular area must remain a real subtree and must not become an opaque atomic frontier goal.',
)

const masteryAfterOrientation = new Map<string, number>([
  [hesseLkProjectionRegressionIds.orientation, 1],
])
const frontierAfterOrientation = learnerFacingHesseSekundarstufeTwoLk.goals
  .filter((goal) => compositionViewExposesGoal(
    [canonicalMathEntry],
    hesseSekundarstufeTwoLkView,
    goal.id,
  ))
  .filter((goal) => goal.contains.length === 0)
  .filter((goal) => (masteryAfterOrientation.get(goal.id) ?? 0) < 0.9)
  .filter((goal) => goal.requires.every((requirementId) => {
    const projectedRequirement = learnerFacingGoalById.get(requirementId)
    if (!projectedRequirement) return true
    return (masteryAfterOrientation.get(requirementId) ?? 0) >= 0.9
  }))
  .map((goal) => goal.id)

assert.equal(
  frontierAfterOrientation.includes(hesseLkProjectionRegressionIds.orthogonalProjection),
  false,
  'After completing only the Sek-II orientation, orthogonal projections must remain blocked by their projected prerequisite.',
)
assert.equal(
  frontierAfterOrientation.includes(hesseLkProjectionRegressionIds.reflectionArea),
  false,
  'After completing only the Sek-II orientation, a curricular-area cluster must never be offered as an atomic frontier goal.',
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
const learnerFacingSekundarstufeTwoLk = learnerFacingGoalById.get(
  learnerFacingMathRoot.contains[0],
)
assert.ok(
  learnerFacingSekundarstufeTwoLk,
  'The reviewed Hessen mathematics LK upper-secondary root must remain addressable.',
)
const learnerFacingQ2Goals = learnerFacingSekundarstufeTwoLk.contains
  .map((goalId) => learnerFacingGoalById.get(goalId))
  .filter((goal): goal is UiGoal => goal?.title.startsWith('Q2:') === true)
assert.equal(
  learnerFacingQ2Goals.length,
  1,
  'The learner-facing Hessen mathematics LK upper-secondary tree must expose exactly one direct Q2 phase.',
)

const learnerFacingQ2DescendantIds = new Set<string>()
const pendingQ2GoalIds = [...learnerFacingQ2Goals[0].contains]
while (pendingQ2GoalIds.length > 0) {
  const goalId = pendingQ2GoalIds.pop()
  if (!goalId || learnerFacingQ2DescendantIds.has(goalId)) continue
  learnerFacingQ2DescendantIds.add(goalId)
  pendingQ2GoalIds.push(...(learnerFacingGoalById.get(goalId)?.contains ?? []))
}
[
  '2ac2e902-a6ad-53c9-b139-d1c63d823023',
  '3016ec37-1c2e-47db-83f5-e767923bc97e',
  'dd042c27-d513-5352-9de9-2a5923a98e69',
].forEach((goalId) => {
  assert.equal(
    learnerFacingQ2DescendantIds.has(goalId),
    true,
    `Reviewed Hessen LK Q2 goal ${goalId} must remain below the single learner-facing Q2 phase.`,
  )
})

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
