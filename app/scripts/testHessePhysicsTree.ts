import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { normalizeLandscape, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import type { CompositionStructureNode, CompositionView, CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
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

console.log('Hessen Physics tree tests passed (GK/LK, projection, generator replay and BB/BE isolation).')
