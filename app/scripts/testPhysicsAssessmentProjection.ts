import assert from 'node:assert/strict'
import './testCurriculumQualityStatus'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import type { UiGoal } from '../src/goalTypes'
import { normalizeLandscape } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  collectCompositionProjectionRoleGoalIds,
  type CompositionView,
} from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'
import { goalMatchesFilters } from '../src/utils/goalFilters'
import { normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildVisibleChildrenMap } from '../src/utils/treeProjectionRuntime'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { collectRenderedAtomicGoalIdsFromCompositionView, evaluateRouteProfile, createRouteProfiles } from './generateCurriculumQualityStatus'
import { liveVerificationInputs } from './lib/verificationInputSnapshot'

const routeProfiles = createRouteProfiles()
const root = resolve(import.meta.dirname, '../..')
const canonicalLandscape = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), 'utf8')) as SkillLandscape
const canonical = normalizeLandscape(canonicalLandscape)
assert(canonical, 'Canonical Physics must be loadable.')
const canonicalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const viewDirectory = resolve(root, 'curricula/DE/Gymnasium/composition-views/physik')
const practiceRootIds = [
  '424b07df-bf66-5d7f-99f5-f28b32ad1f22',
  '549a427d-f10a-5537-990e-6fdd7466848b',
  '9dd7c596-a751-523c-acba-916f73e900a5',
  'b47a2a23-b56d-5433-9036-075d6bb7c782',
  '85bbad98-2f48-5d64-85c4-ab6cf67f24c2',
]
const abiturRootIds = {
  GK: '61684ca7-b725-534f-944b-c7645cea1792',
  LK: '79028c45-90ae-57eb-8016-f5a96af18fa2',
} as const
const hesseStageViewIds = new Set(['de-he-gym-physics-gk', 'de-he-gym-physics-lk',
  'de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk',
  'de-he-gym-physics-gk-g8', 'de-he-gym-physics-lk-g8',
  'de-he-gym-physics-gk-g9', 'de-he-gym-physics-lk-g9'])
const newHesseDurationViewIds = new Set([
  'de-he-gym-physics-gk-g8', 'de-he-gym-physics-lk-g8',
  'de-he-gym-physics-gk-g9', 'de-he-gym-physics-lk-g9',
  'de-he-gym-seki-physics-g8', 'de-he-gym-seki-physics-g9',
])
const newLandSekIViewIds = new Set(['bb', 'be', 'bw', 'by', 'hb', 'hh', 'mv', 'ni', 'nw', 'rp', 'sh', 'sl', 'sn', 'st', 'th']
  .map(state => `de-${state}-gym-seki-physics`))
const fermiGoalId = '658cf33d-a0c2-5d47-801a-3dbcd5cac074'
const fermiAssessmentId = '71e8936b-fa8a-50dc-8c47-fca015b85ac5'
const kinematicsAssessments = [
  { id: 'c5807a37-129e-5df6-8989-482bc7f5683e', maxPoints: 24 },
  { id: '6ea3fb3c-abdc-568f-ab13-97c36dc274e4', maxPoints: 36 },
]
const retainedVerticalAssessmentId = '4ab1cf6d-b808-5b86-9291-85df0b9f2496'
assert.equal(canonicalById.get(retainedVerticalAssessmentId)?.extendedData?.applicabilityProjection, 'excluded')
assert.deepEqual(canonicalById.get(retainedVerticalAssessmentId)?.examData?.coveredGoalIds, [])
const astronomyAssessments = new Map([
  ['14cc61c4-4909-5671-b1ee-930a02cb9f51', 'af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93'],
  ['50521f0d-71b1-51cf-b30d-650e3abf3036', '1b060e79-dc2d-5e4e-abb5-42eca39f9cc7'],
])
for (const [taskId, basisId] of astronomyAssessments) {
  const task = canonicalById.get(taskId)!
  assert.equal(task.examData?.reviewStatus, 'released')
  assert.deepEqual(task.requires, [basisId])
  assert.deepEqual(task.examData?.coveredGoalIds, [basisId])
}
const diodeSekIJurisdictions = new Set(['DE-BB', 'DE-BE', 'DE-HB', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-SH'])
const diodeTaskIds = [
  'c61b2a69-b5cd-5785-bb04-5d6bca53b218',
  '4ac5a07c-fff0-5eae-890d-89e13eaf69c3',
  '18fb1470-5a03-5277-9486-ae74c63c8a8c',
]
const expectedSekITasks = (view: CompositionView): Array<{ goalId: string; wrapperId: string }> => {
  if (view.scope.stage !== 'CrossStage') return []
  const jurisdiction = view.scope.jurisdiction ?? ''
  // Upper-secondary demand alone does not establish a lower-secondary source placement.
  if (diodeSekIJurisdictions.has(jurisdiction)) return []
  const diodeTasks = diodeTaskIds.map((goalId) => ({ goalId, wrapperId: 'physics-final-diode-seki' }))
  if (['DE-SL', 'DE-SN'].includes(jurisdiction)) return [
    ...diodeTasks,
    ...[...astronomyAssessments.keys()].slice(0, jurisdiction === 'DE-SL' ? 2 : 1)
      .map(goalId => ({ goalId, wrapperId: 'physics-b040-source-local-astronomy' })),
  ]
  if (['DE-ST', 'DE-TH'].includes(jurisdiction)) return diodeTasks.slice(0, 1)
  if (!jurisdiction) {
    return [{ goalId: '74a32716-2b46-5d96-8b57-3f6edb90e088', wrapperId: 'physics-b034-assessments-seki' }, ...diodeTasks]
  }
  return []
}

// Existing scope exclusions, independent of the references being restored.
// A new direct goalEntry must not override these prerequisite-only subtrees.
const q4SupportTaskIds = {
  opticalSound: '51af53cb-8866-52cd-b2ca-af8bd8a836e0',
  opticalChannels: '4dbe6eb9-4d77-58a9-a15c-f0b8bb110a65',
  storedSwitch: '5902ebe8-2025-5a7c-b95d-13057398d6e6',
  elementFormation: '6da29199-f086-512c-89f2-1b5ca865eef9',
  stellarEndStates: '6c87a996-9166-5c6e-8cda-01d40720f9c8',
  reactor: '74a32716-2b46-5d96-8b57-3f6edb90e088',
  emitterCircuit: '144007cb-e2bc-5c82-bf9d-dda705b15257',
}
const q4SupportJurisdictions = new Set([...diodeSekIJurisdictions, 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'])
const expectedPrerequisiteOnlyTasks = (view: CompositionView): string[] => {
  if (view.scope.stage !== 'CrossStage') return []
  if (q4SupportJurisdictions.has(view.scope.jurisdiction ?? '')) {
    return Object.values(q4SupportTaskIds).filter((id) => view.scope.courseProfile === 'GK' || id !== q4SupportTaskIds.emitterCircuit)
  }
  if (!view.scope.jurisdiction) {
    return view.scope.courseProfile === 'GK'
      ? [q4SupportTaskIds.opticalSound, q4SupportTaskIds.opticalChannels, q4SupportTaskIds.emitterCircuit]
      : [q4SupportTaskIds.elementFormation, q4SupportTaskIds.stellarEndStates]
  }
  return []
}

const collectDescendants = (
  rootId: string,
  byId: Map<string, UiGoal>,
  childrenByParent?: Map<string, string[]>,
): Set<string> => {
  const result = new Set<string>()
  const visit = (id: string) => {
    if (result.has(id)) return
    result.add(id)
    const goal = byId.get(id)
    assert(goal, `Missing referenced goal ${id}`)
    ;(childrenByParent ? childrenByParent.get(id) ?? [] : goal.contains).forEach(visit)
  }
  visit(rootId)
  return result
}

const assertAstronomyTargetVisibility = (view: CompositionView, visible: Set<string>): number => {
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, canonicalById)
  const filters = [view.scope.courseProfile, view.scope.jurisdiction].filter((value): value is string => !!value)
  // Derive obligations from ordinary targets and canonical prerequisites,
  // independently of whether an assessment reference is present in the view.
  const pending = [...targetGoalIds].filter(id => {
    const goal = canonicalById.get(id)
    return goal && goal.contains.length === 0 && !goal.examData && goalMatchesFilters(goal, filters)
  })
  const demanded = new Set<string>()
  while (pending.length) {
    const id = pending.pop()!
    if (demanded.has(id)) continue
    demanded.add(id)
    pending.push(...(canonicalById.get(id)?.requires ?? []).map(ref => ref.split(':').at(-1)!))
  }
  let expected = 0
  for (const [taskId, basisId] of astronomyAssessments) {
    if (!demanded.has(basisId)) continue
    assert(visible.has(taskId), `${view.viewId}: existing astronomy demand needs its released assessment ${taskId}`)
    expected++
  }
  return expected
}

const isBesideExistingAstronomyPreparation = (nodes: CompositionView['rootNodes'], taskId: string): boolean => {
  const basisId = astronomyAssessments.get(taskId)
  if (!basisId) return false
  const references = nodes.filter(node => 'goalId' in node).map(node => node.goalId)
  return (references.includes(taskId) && references.includes(basisId))
    || nodes.some(node => node.kind === 'structure' && isBesideExistingAstronomyPreparation(node.children, taskId))
}

// Assessment coverage is not a prerequisite edge. It still determines which
// content an exercise belongs with: do not schedule it before the competency
// it assesses. Compare authored partial orders, never sibling-array positions.
const assertAssessmentPlacement = (
  viewId: string, task: UiGoal, byId: Map<string, UiGoal>, ancestorsById: Map<string, string[]>,
): void => {
  const taskPath = ancestorsById.get(task.id)
  if (!taskPath) return
  const stage = (path: string[]) => path.map(id => byId.get(id)!.title)
    .find(title => /^Sekundarstufe (?:I|II)(?:\s|$)/u.test(title))
  for (const reference of task.examData?.coveredGoalIds ?? []) {
    const covered = reference.split(':').at(-1)!
    const coveredPath = ancestorsById.get(covered)
    if (!coveredPath) continue
    assert(!(stage(taskPath)?.match(/^Sekundarstufe I(?:\s|$)/u)
      && stage(coveredPath)?.match(/^Sekundarstufe II(?:\s|$)/u)),
    `${viewId}: assessment ${task.id} is in Sek I before its assessed competency ${covered} in Sek II`)
    let index = 0
    while (index < Math.min(taskPath.length, coveredPath.length) && taskPath[index] === coveredPath[index]) index++
    if (!index || index === Math.min(taskPath.length, coveredPath.length)) continue
    const parent = byId.get(taskPath[index - 1])!
    const order = parent.extendedData?.compositionChildOrder as { after: Array<{ unit: string; after: string }> } | undefined
    if (!order) continue
    const taskUnit = byId.get(taskPath[index])?.extendedData?.compositionNodeId as string | undefined
    const coveredUnit = byId.get(coveredPath[index])?.extendedData?.compositionNodeId as string | undefined
    if (!taskUnit || !coveredUnit) continue
    const pending = [coveredUnit], reached = new Set<string>()
    while (pending.length) {
      const current = pending.pop()!
      if (reached.has(current)) continue
      reached.add(current)
      pending.push(...order.after.filter(pair => pair.unit === current).map(pair => pair.after))
    }
    assert(!reached.has(taskUnit),
      `${viewId}: assessment ${task.id} precedes its assessed competency ${covered} by declared after order`)
  }
}

let viewCount = 0
let fermiScopeViewCount = 0
let practiceTaskPairs = 0
let abiturTaskPairs = 0
let preservedSekITaskPairs = 0
let preservedPrerequisiteOnlyPairs = 0
let filteredPrerequisiteOnlyPairs = 0
let kinematicsTaskPairs = 0
let astronomyTaskPairs = 0
const counts = () => ({ viewCount, fermiScopeViewCount, practiceTaskPairs, abiturTaskPairs,
  preservedSekITaskPairs, preservedPrerequisiteOnlyPairs, filteredPrerequisiteOnlyPairs,
  kinematicsTaskPairs, astronomyTaskPairs })
const newDurationCounts = Object.fromEntries(Object.keys(counts()).map(key => [key, 0])) as ReturnType<typeof counts>
const newLandCounts = { ...newDurationCounts }
const jurisdictions = new Set<string>()
for (const filename of readdirSync(viewDirectory).filter((name) => name.endsWith('.view.json')).sort()) {
  const view = JSON.parse(readFileSync(resolve(viewDirectory, filename), 'utf8')) as CompositionView
  const previousCounts = counts()
  const recordDurationCounts = () => {
    const added = newHesseDurationViewIds.has(view.viewId) ? newDurationCounts
      : newLandSekIViewIds.has(view.viewId) ? newLandCounts : undefined
    if (!added) return
    for (const key of Object.keys(added) as Array<keyof typeof added>) {
      added[key] += counts()[key] - previousCounts[key]
    }
  }
  const course = view.scope.courseProfile
  const [projected] = normalizeLearnerProjectedEntries(applyCompositionViewProjection([canonical], view))
  assert(projected)
  const byId = new Map(projected.goals.map((goal) => [goal.id, goal]))
  const filters = [course, view.scope.jurisdiction].filter((value): value is string => !!value)
  const children = buildVisibleChildrenMap(byId, undefined, {
    [CANONICAL_GYMNASIUM_ROOT_ID]: { selected: true, stage: view.scope.stage },
    [canonical.meta.landscapeId]: { selected: true, filterId: filters.join(',') },
  })
  const visible = new Set<string>()
  const ancestorsById = new Map<string, string[]>()
  const visit = (id: string, ancestors: string[] = []) => {
    assert(!visible.has(id), `${view.viewId}: learner tree repeats ${id}`)
    visible.add(id)
    ancestorsById.set(id, ancestors)
    ;(children.get(id) ?? []).forEach((childId) => visit(childId, [...ancestors, id]))
  }
  projected.goals.filter((goal) => goal.tags?.includes('root')).forEach((goal) => visit(goal.id))
  const { targetGoalIds, prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, canonicalById)
  for (const id of visible) if (byId.get(id)?.examData) {
    assertAssessmentPlacement(view.viewId, byId.get(id)!, byId, ancestorsById)
  }

  // Composition previews retain shared exercise collections across courses.
  // Check the assessment's exact target scope in the final learner tree,
  // including its course/jurisdiction filters and prerequisite-only overrides.
  assert.equal(
    visible.has(fermiAssessmentId),
    visible.has(fermiGoalId),
    `${view.viewId}: the Fermi assessment must follow exactly its competency's target scope`,
  )
  fermiScopeViewCount++
  assert(!visible.has(retainedVerticalAssessmentId),
    `${view.viewId}: the retained mixed task must not become an active assessment target`)
  astronomyTaskPairs += assertAstronomyTargetVisibility(view, visible)
  for (const taskId of astronomyAssessments.keys()) {
    if (!visible.has(taskId)) continue
    assert.deepEqual(byId.get(taskId)?.examData, canonicalById.get(taskId)?.examData,
      `${view.viewId}: astronomy tasks retain their complete canonical payload`)
  }

  if ((course !== 'GK' && course !== 'LK') || !['SekII', 'CrossStage'].includes(view.scope.stage ?? '')) {
    recordDurationCounts()
    continue
  }
  // Bavaria and Baden-Wuerttemberg author separate course structures; this
  // independent scope list must not silently skip a broken or removed reference.
  if (['DE-BY', 'DE-BW'].includes(view.scope.jurisdiction ?? '')) {
    recordDurationCounts()
    continue
  }
  const expectedRootIds = [...practiceRootIds, abiturRootIds[course]]
  const hesseCollection = (rootId: string): string | undefined => {
    if (!hesseStageViewIds.has(view.viewId)) return undefined
    const nodeId = rootId === abiturRootIds[course] ? 'physics-he-abitur'
      : [practiceRootIds[0], practiceRootIds[2], practiceRootIds[3]].includes(rootId) ? `he-physics-topic-${rootId}` : undefined
    if (!nodeId) return undefined
    const matches = projected.goals.filter(goal => goal.extendedData?.compositionNodeId === nodeId)
    assert.equal(matches.length, 1, `${view.viewId}: exactly one replacement collection ${nodeId}`)
    return matches[0].id
  }
  const preservedSekITasks = expectedSekITasks(view)
  viewCount++
  if (view.scope.jurisdiction) jurisdictions.add(view.scope.jurisdiction)
  for (const { id, maxPoints } of kinematicsAssessments) {
    assert(visible.has(id), `${view.viewId}: the reviewed vector-free kinematics task must remain reachable`)
    const hesseKinematicsCollection = hesseCollection(practiceRootIds[0])
    if (hesseKinematicsCollection) assert(ancestorsById.get(id)?.includes(hesseKinematicsCollection),
      `${view.viewId}: Hessian kinematics assessments belong to the E-phase exercise collection`)
    assert.equal(byId.get(id)?.examData?.reviewStatus, 'released')
    assert.equal(byId.get(id)?.examData?.scoring.maxPoints, maxPoints)
    assert.deepEqual(byId.get(id)?.examData, canonicalById.get(id)?.examData,
      `${view.viewId}: both language bodies and exact scoring must survive projection`)
    kinematicsTaskPairs++
  }

  for (const goalId of expectedPrerequisiteOnlyTasks(view)) {
    assert(prerequisiteOnlyGoalIds.has(goalId) && !targetGoalIds.has(goalId),
      `${view.viewId}: ${goalId} must retain its existing prerequisite-only role`)
    assert(!visible.has(goalId), `${view.viewId}: restoring exercises must not add prerequisite-only ${goalId} to the target tree`)
    assert(byId.has(goalId), `${view.viewId}: prerequisite-only ${goalId} remains available for prerequisite and mastery lookup`)
    preservedPrerequisiteOnlyPairs++
    if (goalMatchesFilters(canonicalById.get(goalId)!, filters)) filteredPrerequisiteOnlyPairs++
  }

  assert(!visible.has(abiturRootIds[course === 'GK' ? 'LK' : 'GK']),
    `${view.viewId}: the other course's Abitur collection must not appear as a second Abitur entry`)

  for (const preservedSekITask of preservedSekITasks) {
    assert(visible.has(preservedSekITask.goalId), `${view.viewId}: previously visible Sek-I assessment disappeared`)
    const ancestors = (ancestorsById.get(preservedSekITask.goalId) ?? []).map((id) => byId.get(id)!)
    assert(ancestors.some((goal) => /^Sekundarstufe I(?:\s|$)/u.test(goal.title)),
      `${view.viewId}: assessment must remain in Sek I after restoring the Q4 collection`)
    assert(!ancestors.some((goal) => /^Sekundarstufe II(?:\s|$)/u.test(goal.title)),
      `${view.viewId}: assessment must not move from Sek I to Sek II`)
    preservedSekITaskPairs++
  }

  for (const rootId of expectedRootIds) {
    const sourceRoot = canonicalById.get(rootId)!
    // The source collections define exact task obligations. Their old Hessian
    // E/Q folder names do not define other Länder's source-backed year units.
    const isAbitur = rootId === abiturRootIds[course]
    const abiturUnits = isAbitur ? projected.goals.filter(goal => visible.has(goal.id)
      && goal.extendedData?.compositionNodeId && goal.title === 'Abiturprüfung') : []
    if (isAbitur) assert.equal(abiturUnits.length, 1,
      `${view.viewId}: exactly one dedicated Abitur unit must remain visible`)
    const projectedRootId = isAbitur ? abiturUnits[0].id : hesseCollection(rootId)
    if (projectedRootId) {
      assert(visible.has(projectedRootId), `${view.viewId}: missing assessment collection ${sourceRoot.title}`)
      assert((ancestorsById.get(projectedRootId) ?? []).some(id => /^Sekundarstufe II(?:\s|$)/u.test(byId.get(id)!.title)),
        `${view.viewId}: ${sourceRoot.title} must remain in Sek II`)
      assert((children.get(projectedRootId)?.length ?? 0) > 0,
        `${view.viewId}: ${sourceRoot.title} became an empty placeholder`)
    }
    const collectionIds = projectedRootId ? collectDescendants(projectedRootId, byId, children) : undefined
    const expectedTasks = [...collectDescendants(rootId, canonicalById)]
      .map((id) => canonicalById.get(id)!)
      .filter((goal) => goal.examData && goalMatchesFilters(goal, filters) && !prerequisiteOnlyGoalIds.has(goal.id))
    assert(expectedTasks.length > 0, `${view.viewId}: ${sourceRoot.title} has no applicable source tasks`)

    for (const source of expectedTasks) {
      assert(visible.has(source.id), `${view.viewId}: missing task ${source.title} (${source.id})`)
      const ancestors = (ancestorsById.get(source.id) ?? []).map(id => byId.get(id)!)
      const establishedLowerTask = rootId === practiceRootIds[4]
        && preservedSekITasks.some(task => task.goalId === source.id)
      const astronomyPreparation = isBesideExistingAstronomyPreparation(view.rootNodes, source.id)
      if (collectionIds) assert(collectionIds.has(source.id) || astronomyPreparation || establishedLowerTask,
        `${view.viewId}: ${source.title} must remain in its collection or its established preparation section`)
      assert(ancestors.some(goal => goal.extendedData?.compositionNodeId
        && !/^Sekundarstufe (?:I|II)(?:\s|$)/u.test(goal.title) && goal.title !== 'Physik'),
        `${view.viewId}: ${source.title} needs an authored learning unit`)
      assert.equal(ancestors.filter(goal => /^Sekundarstufe (?:I|II)(?:\s|$)/u.test(goal.title)).length, 1,
        `${view.viewId}: ${source.title} needs exactly one stage placement; source timing is checked by the Land generator`)
      const projectedTask = byId.get(source.id)!
      assert(['', 'released'].includes(source.examData?.reviewStatus ?? ''),
        `${source.title}: assessment review status must permit the existing GoalCard presentation`)
      assert((source.examData?.taskContent.trim().length ?? 0) > 0, `${source.title}: missing task text`)
      assert((source.examData?.solutionContent.trim().length ?? 0) > 0, `${source.title}: missing solution text`)
      assert.deepEqual(projectedTask.examData, source.examData,
        `${view.viewId}: projection must preserve the complete task, solution and scoring for ${source.title}`)
      assert.equal(projectedTask.nodeKind, 'exam', `${view.viewId}: ${source.title} lost its exam presentation`)
    }

    if (rootId === abiturRootIds[course]) {
      assert.deepEqual([...collectionIds!].filter(id => byId.get(id)?.examData).sort(),
        expectedTasks.map(task => task.id).sort(), `${view.viewId}: the Abitur unit retains exactly both sample exams' proposals`)
      if (hesseStageViewIds.has(view.viewId)) assert.deepEqual([...(children.get(projectedRootId!) ?? [])].sort(),
        [...sourceRoot.contains].sort(), `${view.viewId}: the Hessian exam unit retains exactly the canonical sample exams`)
      assert.equal(expectedTasks.length, 8, `${view.viewId}: both Abitur sample exams must retain four proposals`)
      abiturTaskPairs += expectedTasks.length
    } else {
      practiceTaskPairs += expectedTasks.length
    }
  }
  recordDurationCounts()
}
console.log('Physics duration assessment counts:', JSON.stringify({ total: counts(), addedHesseDuration: newDurationCounts, addedLandSekI: newLandCounts }))
const assertCount = (key: keyof typeof newDurationCounts, legacy: number, added: number, message: string): void => {
  assert.equal(counts()[key] - newDurationCounts[key] - newLandCounts[key], legacy, `${message} Preserve the exact existing-view floor.`)
  assert.equal(newDurationCounts[key], added, `${message} Check every additional HE duration obligation.`)
  assert.equal(counts()[key], legacy + added + newLandCounts[key], message)
}
assert.equal(newLandCounts.fermiScopeViewCount, 15, 'Check each additional source-backed Land Sek-I view.')
assertCount('viewCount', 60, 4, 'Cover every existing GK/LK and SekII/CrossStage assessment-collection view.')
assertCount('fermiScopeViewCount', 69, 6, 'Check exact Fermi assessment target visibility in every Physics composition view.')
assert.equal(jurisdictions.size, 14, 'Cover all jurisdictions using these Physics assessment collections.')
assertCount('kinematicsTaskPairs', 120, 8, 'Both reviewed kinematics assessments must appear in all shared GK/LK exercise views.')
assertCount('astronomyTaskPairs', 136, 8, 'Every existing ordinary astronomy demand needs its applicable task across all views.')
assertCount('practiceTaskPairs', 4266, 308,
  'Expose every current canonical collection obligation, including the new individual and nested assessments.')
assertCount('abiturTaskPairs', 480, 32, 'Every applicable view must expose both Abitur sample exams and all eight proposals.')
assertCount('preservedSekITaskPairs', 30, 0, 'Preserve the source-backed Sek-I task placements, including six SL/SN astronomy placements.')
assertCount('preservedPrerequisiteOnlyPairs', 161, 0, 'Preserve every existing Q4 prerequisite-only role affected by explicit task references.')
assertCount('filteredPrerequisiteOnlyPairs', 48, 0, 'Course and jurisdiction filters must not silently reintroduce these support tasks as targets.')
const missingAstronomyFixture = mkdtempSync(resolve(tmpdir(), 'physics-missing-astronomy-'))
try {
  const missingView = JSON.parse(readFileSync(resolve(viewDirectory, 'de-bb-gk.view.json'), 'utf8')) as CompositionView
  const missingTaskId = [...astronomyAssessments.keys()][0]
  const removeTask = (nodes: CompositionView['rootNodes']): void => {
    for (let index = nodes.length - 1; index >= 0; index--) {
      const node = nodes[index]
      if ('goalId' in node && node.goalId === missingTaskId) nodes.splice(index, 1)
      else if (node.kind === 'structure') removeTask(node.children)
    }
  }
  removeTask(missingView.rootNodes)
  const missingViewPath = resolve(missingAstronomyFixture, 'missing.json')
  writeFileSync(missingViewPath, JSON.stringify(missingView))
  const missingVisible = collectRenderedAtomicGoalIdsFromCompositionView(canonicalLandscape, missingViewPath, ['GK'])
  assert.throws(() => assertAstronomyTargetVisibility(missingView, missingVisible),
    /existing astronomy demand needs its released assessment/,
    'Removing a task must fail while its independently derived preparation demand remains.')
} finally {
  rmSync(missingAstronomyFixture, { recursive: true, force: true })
}
const routeProfile = routeProfiles.find((profile) => profile.profileId === 'canonical-physics-sek1')
assert(routeProfile, 'The actual Physics Sek-I route profile must remain configured.')
const currentCatalog = loadCurrentCurriculumCatalog(liveVerificationInputs).entries
  .map(entry => entry.landscape as SkillLandscape)
const routeStatus = evaluateRouteProfile(canonicalLandscape, routeProfile, buildApplicabilityCompilation(), currentCatalog)
const compositionRule = routeStatus.rules.find((rule) => rule.id === 'CQR-104')
assert(compositionRule, 'The actual endpoint-composition rule must run over the current Physics views.')
assert.equal(compositionRule.status, 'pass', JSON.stringify(compositionRule, null, 2))
console.log(`Physics CQR-104 passed: ${compositionRule.metrics?.relevantCompositionViews} views, ${compositionRule.metrics?.evaluatedProjectionScopes} actual route scopes.`)
console.log(`Physics assessment projection passed: ${viewCount} views, ${practiceTaskPairs} practice-task pairs, ${abiturTaskPairs} Abitur-task pairs, ${preservedSekITaskPairs} preserved Sek-I placements; complete texts, solutions and unique course-specific navigation preserved.`)
