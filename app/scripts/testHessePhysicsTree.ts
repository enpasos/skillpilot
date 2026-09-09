import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { normalizeLandscape, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  collectCompositionProjectionRoleGoalIds,
  type CompositionStructureNode,
  type CompositionView,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { resolveAtomicGoalDescendants } from '../src/utils/localTeacherCoursePlan'
import { repairHessePhysicsTree } from './lib/hessePhysicsTreePlacements'
import type { PhysicsPlacementView } from './lib/physicsViewPlacementTypes'
import { verifyBbBePhysicsCompositionViews } from './generateBbPhysicsSourceExtraction'

const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const canonicalPhysics = normalizeLandscape(readJson(
  '../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
) as SkillLandscape)
assert(canonicalPhysics, 'Canonical Physics must be loadable.')

const destinations = [
  ['physics-b034-transistor', 'b034-preserved-rootNodes-0-children-13-children-6'],
  ['physics-final-diode-sekii', 'b034-preserved-rootNodes-0-children-13-children-6'],
  ['physics-b034-stars', 'b034-preserved-rootNodes-0-children-13-children-7'],
  ['physics-b034-nuclear', 'b034-preserved-rootNodes-0-children-13-children-3'],
  ['physics-b034-assessments', 'physics-q4'],
] as const
const diodeTaskIds = [
  'c61b2a69-b5cd-5785-bb04-5d6bca53b218',
  '4ac5a07c-fff0-5eae-890d-89e13eaf69c3',
  '18fb1470-5a03-5277-9486-ae74c63c8a8c',
]
const previousQ4PracticeIds = [
  '85bbad98-2f48-5d64-85c4-ab6cf67f24c2',
  'b34f3e03-bbe7-5ede-941c-3f26c9b07bb8',
  '2874902d-eccd-513e-ab60-98892497911d',
  'c518e9dc-8514-5fde-9811-19caa85cfb1a',
  'c77d28e5-a03e-5518-8c3a-55e9e9a2cea3',
  '04832ee1-648a-5421-a01d-0a15c3536c5f',
  '71af215d-c6d5-59ce-a3f6-4a2e60f1216d',
]
const examIds = {
  GK: '61684ca7-b725-534f-944b-c7645cea1792',
  LK: '79028c45-90ae-57eb-8016-f5a96af18fa2',
}

const flatten = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap((node) => (
  node.kind === 'structure' ? [node, ...flatten(node.children)] : [node]
))
const structure = (view: CompositionView, id: string): CompositionStructureNode => {
  const matches = flatten(view.rootNodes).filter((node) => node.kind === 'structure' && node.id === id)
  assert.equal(matches.length, 1, `${view.viewId}: exactly one structure ${id}`)
  const match = matches[0]
  assert(match.kind === 'structure')
  return match
}
const referenceRoles = (view: CompositionView) => flatten(view.rootNodes)
  .filter((node) => node.kind !== 'structure')
  .map((node) => `${node.kind}:${node.goalId}:${node.projectionRole ?? 'target'}`)
  .sort()

const removeNode = (nodes: CompositionViewNode[], selected: CompositionViewNode): boolean => {
  const index = nodes.indexOf(selected)
  if (index >= 0) {
    nodes.splice(index, 1)
    return true
  }
  return nodes.some((node) => node.kind === 'structure' && removeNode(node.children, selected))
}

const project = (view: CompositionView): LandscapeEntry => {
  const [entry] = normalizeLearnerProjectedEntries(applyCompositionViewProjection([canonicalPhysics], view))
  assert(entry)
  return entry
}
const canonicalIds = new Set(canonicalPhysics.goals.map(({ id }) => id))
const reachableIds = (entry: LandscapeEntry): Set<string> => {
  const byId = new Map(entry.goals.map((goal) => [goal.id, goal]))
  const ids = new Set<string>()
  const visit = (id: string) => {
    assert(!ids.has(id), `Learner-facing Physics tree must not repeat ${id}`)
    ids.add(id)
    byId.get(id)?.contains.forEach(visit)
  }
  entry.goals.filter((goal) => goal.tags?.includes('root')).forEach((goal) => visit(goal.id))
  return ids
}

const roleOverrideLandscape = normalizeLandscape({
  landscapeId: 'planning-role-override', locale: 'de', title: 'Physik', description: 'Projection-role regression',
  goals: ['ROOT', 'TARGET', 'SUPPORT'].map((id) => ({
    id, title: id, description: id, weight: 1,
    type: id === 'ROOT' ? 'cluster' : 'atomic',
    tags: id === 'ROOT' ? ['root'] : [],
    contains: id === 'ROOT' ? ['TARGET', 'SUPPORT'] : [],
    requires: id === 'TARGET' ? ['SUPPORT'] : [],
    dimensionTags: {
      framework: 'test', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'Q3',
    },
  })),
})
assert(roleOverrideLandscape)
const roleOverrideNodes: CompositionViewNode[] = [
  { kind: 'canonicalSubtree', goalId: 'TARGET', projectionRole: 'target' },
  { kind: 'canonicalSubtree', goalId: 'SUPPORT', projectionRole: 'target' },
  { kind: 'goalEntry', goalId: 'SUPPORT', projectionRole: 'prerequisiteOnly' },
]
for (const children of [roleOverrideNodes, [...roleOverrideNodes].reverse()]) {
  const [projected] = applyCompositionViewProjection([roleOverrideLandscape], {
    viewId: 'planning-role-override-view', landscapeId: roleOverrideLandscape.meta.landscapeId,
    scope: { schoolForm: 'Gymnasium', stage: 'Sekundarstufe II' },
    rootNodes: [{ kind: 'structure', id: 'sekii', label: 'Sekundarstufe II', children }],
  })
  const byId = new Map(projected.goals.map((goal) => [goal.id, goal]))
  const root = projected.goals.find((goal) => goal.tags?.includes('root'))
  assert(root)
  assert.deepEqual(projected.goals.filter((goal) => goal.tags?.includes('root')).map((goal) => goal.id), ['ROOT'],
    'The normal target projection retains exactly one authored root.')
  assert(!reachableIds(projected).has('SUPPORT'),
    'A direct prerequisite-only goalEntry overrides an explicit target subtree reference, regardless of order.')
  assert(byId.has('SUPPORT'), 'Excluded support must retain its canonical ID for prerequisite/mastery access.')
  assert.deepEqual(byId.get('TARGET')?.requires, ['SUPPORT'], 'Projection must preserve prerequisite dependencies.')
  assert.deepEqual(resolveAtomicGoalDescendants(root.id, byId).atomicGoalIds, ['TARGET'],
    'Synthetic stage references must not reintroduce prerequisite-only atoms into planning.')
}

const [rootExcludedProjection] = applyCompositionViewProjection([roleOverrideLandscape], {
  viewId: 'planning-root-excluded-view', landscapeId: roleOverrideLandscape.meta.landscapeId,
  scope: { schoolForm: 'Gymnasium', stage: 'Sekundarstufe II' },
  rootNodes: [{
    kind: 'structure', id: 'sekii', label: 'Sekundarstufe II', children: [
      { kind: 'canonicalSubtree', goalId: 'ROOT', projectionRole: 'prerequisiteOnly' },
      { kind: 'goalEntry', goalId: 'TARGET', projectionRole: 'target' },
    ],
  }],
})
const rootExcludedGoals = new Map(rootExcludedProjection.goals.map((goal) => [goal.id, goal]))
const rootExcludedRoots = rootExcludedProjection.goals.filter((goal) => goal.tags?.includes('root'))
assert.deepEqual(rootExcludedRoots.map((goal) => goal.id), ['composition:planning-root-excluded-view:structure:sekii'],
  'An excluded canonical root must not become a second visible root beside its synthetic target stage.')
assert(!reachableIds(rootExcludedProjection).has('ROOT'), 'The prerequisite-only root stays outside the visible target tree.')
assert(!reachableIds(rootExcludedProjection).has('SUPPORT'), 'The prerequisite-only sibling stays outside the visible target tree.')
assert(rootExcludedGoals.has('ROOT') && rootExcludedGoals.has('SUPPORT'),
  'Excluded root and support IDs remain addressable for prerequisite/mastery access.')
assert.deepEqual(rootExcludedGoals.get('TARGET')?.requires, ['SUPPORT'])
assert.deepEqual(resolveAtomicGoalDescendants(rootExcludedRoots[0].id, rootExcludedGoals).atomicGoalIds, ['TARGET'],
  'Only the explicitly restored target descendant enters planning.')

// Trainer planning consumes the unnormalized Level 2 projection, not the
// presentation-only learner tree. An intentionally empty GK branch must not
// hide the entire Sek II stage from the plan-section selector.
for (const profile of ['gk', 'lk'] as const) {
  for (const stagePrefix of ['', 'sekii-']) {
    const view = readJson(
      `../../curricula/DE/Gymnasium/composition-views/physik/de-he-${stagePrefix}${profile}.view.json`,
    ) as CompositionView
    const [entry] = applyCompositionViewProjection([canonicalPhysics], view)
    const allGoals = new Map(entry.goals.map((goal) => [goal.id, goal]))
    const collectDescendants = (rootId: string): Set<string> => {
      const ids = new Set<string>()
      const visit = (id: string) => {
        if (ids.has(id)) return
        ids.add(id)
        const goal = allGoals.get(id)
        assert(goal, `${view.viewId}: projected reference ${id} must exist.`)
        goal.contains.forEach(visit)
      }
      visit(rootId)
      return ids
    }
    const root = entry.goals.find((goal) => goal.tags?.includes('root'))
    assert(root)
    const visibleIds = collectDescendants(root.id)
    const planningGoals = new Map([...allGoals].filter(([id]) => visibleIds.has(id)))
    const planningChildren = new Map([...planningGoals].map(([id, goal]) => [
      id, goal.contains.filter((childId) => planningGoals.has(childId)),
    ]))
    const stages = [...planningGoals.values()].filter((goal) => /^Sekundarstufe II\b/.test(goal.title))
    assert.equal(stages.length, 1, `${view.viewId}: exactly one Sek II stage must be discoverable.`)
    if (stagePrefix === '') {
      assert([...planningGoals.values()].some((goal) => goal.title === 'Sekundarstufe I'),
        `${view.viewId}: CrossStage planning must also retain Sek I.`)
    }
    const canonicalGoals = new Map(canonicalPhysics.goals.map((goal) => [goal.id, goal]))
    const { targetGoalIds, prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(
      view.rootNodes, canonicalGoals,
    )
    for (const stage of [root, ...stages]) {
      const resolution = resolveAtomicGoalDescendants(stage.id, planningGoals, planningChildren)
      assert.equal(resolution.quality.status, 'complete',
        `${view.viewId}: ${stage.title} must remain plannable: ${JSON.stringify(resolution.quality.issues)}`)
      assert(resolution.atomicGoalIds.length > 0, `${view.viewId}: ${stage.title} must contain learning targets.`)
      const expectedAtoms = [...collectDescendants(stage.id)]
        .filter((id) => allGoals.get(id)?.type === 'atomic')
      assert.deepEqual([...resolution.atomicGoalIds].sort(), expectedAtoms.sort(),
        `${view.viewId}: planning must retain every projected target atom exactly once.`)
      resolution.atomicGoalIds.forEach((id) => {
        assert(targetGoalIds.has(id), `${view.viewId}: ${id} must have an authored target role.`)
        assert(!prerequisiteOnlyGoalIds.has(id), `${view.viewId}: prerequisite-only ${id} must never enter a plan.`)
      })
    }
    if (profile === 'gk') {
      const projectedEmpty = planningGoals.get('ad021f2e-6b94-5e6e-a264-3d1110094b87')
      assert(projectedEmpty, `${view.viewId}: retain the reported projected GK cluster as regression coverage.`)
      assert.equal(projectedEmpty.type, 'cluster')
      assert.deepEqual(projectedEmpty.contains, [])
      const sourceChildren = canonicalGoals.get(projectedEmpty.id)?.contains ?? []
      assert(sourceChildren.length > 0, 'The reported GK cluster is not empty in the canonical source.')
      assert(sourceChildren.every((id) => prerequisiteOnlyGoalIds.has(id)),
        'The reported GK cluster is empty only because its children are authored prerequisite-only.')
      assert.deepEqual(resolveAtomicGoalDescendants(projectedEmpty.id, planningGoals, planningChildren).atomicGoalIds, [],
        'An intentionally empty projected cluster must not become an atomic learning target.')
    }
  }
}

for (const profile of ['GK', 'LK'] as const) {
  const view = readJson(
    `../../curricula/DE/Gymnasium/composition-views/physik/de-he-sekii-${profile.toLowerCase()}.view.json`,
  ) as CompositionView & PhysicsPlacementView
  const stage = structure(view, 'physics-root')
  assert.equal(stage.label, `Sekundarstufe II (${profile})`)
  assert.equal(stage.labelEn, 'Upper Secondary',
    'Shared English metadata must not conflict when the backend merges GK and LK.')
  assert.deepEqual(view.rootNodes.filter((node) => node.kind === 'structure'), [stage],
    'Pure Hessen Sek II must have one visible stage wrapper, not supplemental root siblings.')
  assert.deepEqual(stage.children.filter((node) => node.kind === 'structure').map((node) => node.id),
    ['physics-e-phase', 'physics-q1', 'physics-q2', 'physics-q3', 'physics-q4'])

  for (const [childId, parentId] of destinations) {
    assert(structure(view, parentId).children.includes(structure(view, childId)),
      `${profile}: ${childId} belongs directly under ${parentId}`)
  }
  assert.equal(structure(view, 'physics-final-diode-sekii').label, 'Dioden')
  assert.equal(structure(view, 'physics-final-diode-sekii').labelEn, 'Diodes')
  const exercises = structure(view, 'physics-b034-assessments')
  assert.equal(exercises.label, 'Übungen Q4')
  for (const taskId of [...diodeTaskIds, ...previousQ4PracticeIds]) {
    assert(exercises.children.some((node) => node.kind !== 'structure' && node.goalId === taskId),
      `Assessment ${taskId} belongs in Q4 exercises, not the content branch.`)
  }

  const projected = project(view)
  const goalById = new Map(projected.goals.map((goal) => [goal.id, goal]))
  const root = projected.goals.find((goal) => goal.tags?.includes('root'))
  assert(root)
  assert.equal(root.title, 'Physik')
  assert.deepEqual(root.contains.map((id) => goalById.get(id)?.title), [`Sekundarstufe II (${profile})`],
    'Actual learner projection must expose a stage, not Physik -> Physik or supplements at root level.')
  const visibleIds = reachableIds(projected)
  assert.equal(goalById.get(examIds[profile])?.title, `Abiturprüfung Physik (${profile})`)
  assert(visibleIds.has(examIds[profile]))
  assert(!visibleIds.has(examIds[profile === 'GK' ? 'LK' : 'GK']))
  assert(![...visibleIds].some((id) => /belegte Quellenanteile|Source-Supported Components/.test(goalById.get(id)?.title ?? '')))

  // Recreate the reported authoring error to verify repair rather than merely
  // accepting already-correct checked-in data. References and roles must survive.
  const regressed = structuredClone(view)
  const regressedStage = structure(regressed, 'physics-root')
  regressedStage.label = 'Physik'
  delete regressedStage.labelEn
  for (const [id] of destinations) {
    const node = structure(regressed, id)
    assert(removeNode(regressed.rootNodes, node))
    regressed.rootNodes.push(node)
  }
  const oldDiodes = structure(regressed, 'physics-final-diode-sekii')
  oldDiodes.label = 'Dioden: belegte Quellenanteile'
  oldDiodes.labelEn = 'Diodes: Source-Supported Components'
  structure(regressed, 'physics-b034-assessments').label = 'Materialgestützte Prüfungsaufgaben'
  for (const taskId of diodeTaskIds) {
    const task = flatten(regressed.rootNodes).find((node) => node.kind !== 'structure' && node.goalId === taskId)
    assert(task)
    assert(removeNode(regressed.rootNodes, task))
    oldDiodes.children.push(task)
  }
  for (const taskId of previousQ4PracticeIds) {
    const task = flatten(regressed.rootNodes).find((node) => node.kind !== 'structure' && node.goalId === taskId)
    assert(task && task.kind !== 'structure')
    assert(removeNode(regressed.rootNodes, task))
    if (taskId === '85bbad98-2f48-5d64-85c4-ab6cf67f24c2') task.displayLabel = 'Übungen'
    structure(regressed, 'physics-q4').children.push(task)
  }
  const oldExam = flatten(regressed.rootNodes).find((node) => node.kind !== 'structure' && node.goalId === examIds[profile])
  assert(oldExam && oldExam.kind !== 'structure')
  oldExam.displayLabel = 'Abiturprüfung Physik'
  const rolesBeforeRepair = referenceRoles(regressed)
  const beforeProjection = project(regressed)
  const targetsBeforeRepair = [...reachableIds(beforeProjection)].filter((id) => canonicalIds.has(id)).sort()
  repairHessePhysicsTree(regressed)
  assert.deepEqual(referenceRoles(regressed), rolesBeforeRepair, 'Tree repair must preserve every authored reference and role.')
  const repairedProjection = project(regressed)
  assert.deepEqual([...reachableIds(repairedProjection)].filter((id) => canonicalIds.has(id)).sort(), targetsBeforeRepair,
    'Tree repair must not add/remove canonical learning targets or expose prerequisite-only support.')
  const canonicalPrerequisites = (entry: LandscapeEntry) => entry.goals.filter((goal) => canonicalIds.has(goal.id))
    .map((goal) => [goal.id, goal.requires, goal.effectiveRequires])
    .sort(([left], [right]) => String(left).localeCompare(String(right)))
  assert.deepEqual(canonicalPrerequisites(repairedProjection), canonicalPrerequisites(beforeProjection),
    'Presentation repair must not alter canonical prerequisites or remove stable mastery-addressable IDs.')
  for (const [childId, parentId] of destinations) {
    assert(structure(regressed, parentId).children.includes(structure(regressed, childId)))
  }
  const repairedExercises = structure(regressed, 'physics-b034-assessments')
  for (const taskId of [...diodeTaskIds, ...previousQ4PracticeIds]) {
    assert(repairedExercises.children.some((node) => node.kind !== 'structure' && node.goalId === taskId),
      `Generator replay must restore assessment ${taskId} into Q4 exercises.`)
  }
  assert.equal(structure(regressed, 'physics-root').label, stage.label)
  assert.equal(project(regressed).goals.find((goal) => goal.id === examIds[profile])?.title, `Abiturprüfung Physik (${profile})`)
  assert.deepEqual(repairHessePhysicsTree(structuredClone(regressed)), regressed, 'Repeated generator repair must be idempotent.')
  assert.deepEqual(repairHessePhysicsTree(structuredClone(view)), view, 'Committed views must already have the corrected shape.')
  const missingDestination = structuredClone(view)
  assert(removeNode(missingDestination.rootNodes, structure(missingDestination,
    'b034-preserved-rootNodes-0-children-13-children-6')))
  // Keep the supplement but remove its reviewed destination: never invent a new placement.
  missingDestination.rootNodes.push(structuredClone(structure(view, 'physics-b034-transistor')))
  assert.throws(() => repairHessePhysicsTree(missingDestination), /Missing reviewed HE Physics structure/)
  const duplicateStage = structuredClone(view)
  duplicateStage.rootNodes.push(structuredClone(structure(view, 'physics-root')))
  assert.throws(() => repairHessePhysicsTree(duplicateStage), /Duplicate HE Physics structure/)
  for (const otherScope of [{ jurisdiction: 'DE-BY' }, { stage: 'CrossStage' }]) {
    const unrelatedView = structuredClone(view)
    Object.assign(unrelatedView.scope, otherScope)
    assert.deepEqual(repairHessePhysicsTree(structuredClone(unrelatedView)), unrelatedView,
      'Hessen Sek II repair must not mutate other jurisdictions or stages.')
  }
}

const independentViewPaths = ['bb', 'be'].flatMap((jurisdiction) => (
  ['gk', 'lk', 'sekii-gk', 'sekii-lk'].map((suffix) => new URL(
    `../../curricula/DE/Gymnasium/composition-views/physik/de-${jurisdiction}-${suffix}.view.json`,
    import.meta.url,
  ))
))
const independentViewBytes = independentViewPaths.map((path) => readFileSync(path))
verifyBbBePhysicsCompositionViews()
independentViewPaths.forEach((path, index) => {
  assert.deepEqual(readFileSync(path), independentViewBytes[index],
    `BB/BE source extraction preflight must preserve reviewed view bytes: ${path.pathname}`)
})

console.log('Hessen Physics tree tests passed (GK/LK stage planning, projection, generator replay and BB/BE isolation).')
