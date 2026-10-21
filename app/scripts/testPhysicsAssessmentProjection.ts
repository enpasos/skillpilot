import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
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

const root = resolve(import.meta.dirname, '../..')
const canonical = normalizeLandscape(JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), 'utf8')) as SkillLandscape)
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
const diodeSekIJurisdictions = new Set(['DE-BB', 'DE-BE', 'DE-HB', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-SH'])
const diodeTaskIds = [
  'c61b2a69-b5cd-5785-bb04-5d6bca53b218',
  '4ac5a07c-fff0-5eae-890d-89e13eaf69c3',
  '18fb1470-5a03-5277-9486-ae74c63c8a8c',
]
const expectedSekITasks = (view: CompositionView): Array<{ goalId: string; wrapperId: string }> => {
  if (view.scope.stage !== 'CrossStage') return []
  const jurisdiction = view.scope.jurisdiction ?? ''
  if (diodeSekIJurisdictions.has(jurisdiction)) {
    return [{ goalId: diodeTaskIds[0], wrapperId: 'physics-final-diode-prerequisite-practice' }]
  }
  const diodeTasks = diodeTaskIds.map((goalId) => ({ goalId, wrapperId: 'physics-final-diode-seki' }))
  if (['DE-SL', 'DE-SN'].includes(jurisdiction)) return diodeTasks
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

let viewCount = 0
let practiceTaskPairs = 0
let abiturTaskPairs = 0
let preservedSekITaskPairs = 0
let preservedPrerequisiteOnlyPairs = 0
let filteredPrerequisiteOnlyPairs = 0
const jurisdictions = new Set<string>()
for (const filename of readdirSync(viewDirectory).filter((name) => name.endsWith('.view.json')).sort()) {
  const view = JSON.parse(readFileSync(resolve(viewDirectory, filename), 'utf8')) as CompositionView
  const course = view.scope.courseProfile
  if ((course !== 'GK' && course !== 'LK') || !['SekII', 'CrossStage'].includes(view.scope.stage ?? '')) continue
  // Bavaria and Baden-Wuerttemberg author separate course structures; this
  // independent scope list must not silently skip a broken or removed reference.
  if (['DE-BY', 'DE-BW'].includes(view.scope.jurisdiction ?? '')) continue
  const expectedRootIds = [...practiceRootIds, abiturRootIds[course]]
  const preservedSekITasks = expectedSekITasks(view)
  viewCount++
  if (view.scope.jurisdiction) jurisdictions.add(view.scope.jurisdiction)

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
    assert(ancestors.some((goal) => goal.extendedData?.compositionNodeId === preservedSekITask.wrapperId),
      `${view.viewId}: preserve the existing Sek-I assessment wrapper and its stable reference`)
    assert(ancestors.some((goal) => /^Sekundarstufe I(?:\s|$)/u.test(goal.title)),
      `${view.viewId}: assessment must remain in Sek I after restoring the Q4 collection`)
    assert(!ancestors.some((goal) => /^Sekundarstufe II(?:\s|$)/u.test(goal.title)),
      `${view.viewId}: assessment must not move from Sek I to Sek II`)
    preservedSekITaskPairs++
  }

  for (const rootId of expectedRootIds) {
    const sourceRoot = canonicalById.get(rootId)!
    // These CrossStage views keep established Sek-I tasks in their original
    // sections and explicitly compose the remaining canonical Q4 assessments.
    const projectedRootId = rootId === practiceRootIds[4] && preservedSekITasks.length > 0
      ? projected.goals.find((goal) => goal.extendedData?.compositionNodeId === 'physics-q4-practice')?.id
      : rootId
    assert(projectedRootId && visible.has(projectedRootId), `${view.viewId}: missing assessment collection ${sourceRoot.title}`)
    if (view.scope.stage === 'CrossStage') {
      assert((ancestorsById.get(projectedRootId) ?? []).some((id) => /^Sekundarstufe II(?:\s|$)/u.test(byId.get(id)!.title)),
        `${view.viewId}: ${sourceRoot.title} must remain in Sek II`)
    }
    assert((children.get(projectedRootId)?.length ?? 0) > 0,
      `${view.viewId}: ${sourceRoot.title} became an empty placeholder instead of an expandable collection`)
    const collectionIds = collectDescendants(projectedRootId, byId, children)
    const expectedTasks = [...collectDescendants(rootId, canonicalById)]
      .map((id) => canonicalById.get(id)!)
      .filter((goal) => goal.examData && goalMatchesFilters(goal, filters) && !prerequisiteOnlyGoalIds.has(goal.id))
    assert(expectedTasks.length > 0, `${view.viewId}: ${sourceRoot.title} has no applicable source tasks`)

    for (const source of expectedTasks) {
      assert(visible.has(source.id), `${view.viewId}: missing task ${source.title} (${source.id})`)
      assert(collectionIds.has(source.id) || (rootId === practiceRootIds[4] && preservedSekITasks.some((task) => task.goalId === source.id)),
        `${view.viewId}: ${source.title} must remain in its exercise collection or its established Sek-I section`)
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
      assert.equal(children.get(rootId)?.length, 2, `${view.viewId}: both Abitur sample exams must remain reachable`)
      assert.equal(expectedTasks.length, 8, `${view.viewId}: both Abitur sample exams must retain four proposals`)
      abiturTaskPairs += expectedTasks.length
    } else {
      practiceTaskPairs += expectedTasks.length
    }
  }
}
assert.equal(viewCount, 60, 'Cover every existing GK/LK and SekII/CrossStage assessment-collection view.')
assert.equal(jurisdictions.size, 14, 'Cover all jurisdictions using these Physics assessment collections.')
assert.equal(practiceTaskPairs, 3006, 'Restore the existing practice scope without silently adding or removing assessment targets.')
assert.equal(abiturTaskPairs, 480, 'Every applicable view must expose both Abitur sample exams and all eight proposals.')
assert.equal(preservedSekITaskPairs, 40, 'Preserve the established Sek-I task placement in every affected CrossStage view.')
assert.equal(preservedPrerequisiteOnlyPairs, 161, 'Preserve every existing Q4 prerequisite-only role affected by explicit task references.')
assert.equal(filteredPrerequisiteOnlyPairs, 48, 'Course and jurisdiction filters must not silently reintroduce these support tasks as targets.')
console.log(`Physics assessment projection passed: ${viewCount} views, ${practiceTaskPairs} practice-task pairs, ${abiturTaskPairs} Abitur-task pairs, ${preservedSekITaskPairs} preserved Sek-I placements; complete texts, solutions and unique course-specific navigation preserved.`)
