import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import type { MilestoneCoursePlanBlock, TeacherCoursePlan, TeacherCoursePlanBlock } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import type { SkillLandscape } from '../landscapeTypes'
import { normalizeLandscape } from '../hooks/useLandscapes'
import { collectCompositionProjectionRoleGoalIds, type CompositionView } from './authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from './compositionViewRuntime'
import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import { materializeLearnerLearningPlanCopy } from './learnerCoursePlanPublication'
import { normalizeLearnerProjectedEntries } from './learnerTreeProjection'
import { buildVisibleChildrenMap } from './treeProjectionRuntime'
import {
  buildCoursePlanExamPreparationBlocks, coursePlanPreparationConsentKey,
  defaultCoursePlanPreparationEnd, previewCoursePlanExamPreparation,
} from './coursePlanExamPreparation'
import { createTeacherCoursePlan, evaluateTeacherCoursePlan, reviseTeacherCoursePlan } from './localTeacherCoursePlan'

function goal(id: string, contains: string[] = []): UiGoal {
  return {
    id, title: id, description: id, phase: 'E', themenfeld: '', area: '', level: 1,
    core: true, weight: 1, leitideen: [], kompetenzen: [], sourceRef: '', requires: [], contains,
    examples: [], type: contains.length ? 'cluster' : 'atomic',
  }
}
function task(id: string, coveredGoalIds?: string[]): UiGoal {
  return {
    ...goal(id), examData: {
      reviewStatus: 'released', coveredGoalIds, taskContent: 'Aufgabe', solutionContent: 'Lösung',
      scoring: { maxPoints: 2, passingPoints: 2, steps: [{ id: 'step', points: 2, description: 'Bewertung' }] },
    },
  }
}
const index = (...goals: UiGoal[]) => new Map(goals.map((entry) => [entry.id, entry]))
const milestone: MilestoneCoursePlanBlock = {
  id: 'exam', kind: 'milestone', title: 'Kinematik', goalIds: ['a', 'selected-task'], date: '2026-10-27',
}
const startDate = '2026-10-22'
const endDate = '2026-10-26'
const goals = index(
  goal('a'), { ...goal('b'), requires: ['foundation'] }, goal('foundation'), goal('unrelated'),
  { ...task('selected-task', ['a', 'b']), requires: ['a', 'b'] },
  task('unselected-task', ['unrelated']), goal('all', ['a', 'b', 'foundation', 'selected-task', 'unrelated']),
)
function planWith(blocks: TeacherCoursePlanBlock[] = [milestone]): TeacherCoursePlan {
  const initial = createTeacherCoursePlan({ classId: 'exam-preparation', createdOn: startDate, recordedAt: `${startDate}T08:00:00.000Z` })
  assert(initial)
  const plan = reviseTeacherCoursePlan(initial, { blocks, changedOn: startDate, recordedAt: `${startDate}T09:00:00.000Z` })
  assert(plan)
  return plan
}
const emptyPlan = planWith()
const previewFor = (plan = emptyPlan, goalIndex = goals, exam = milestone, from = startDate, until = endDate,
  options: { includeSuggestions?: boolean; referenceGoals?: ReadonlyMap<string, UiGoal> } = {}) => (
  previewCoursePlanExamPreparation({ plan, milestone: exam, goals: goalIndex, startDate: from, endDate: until,
    includeSuggestions: options.includeSuggestions ?? true, referenceGoals: options.referenceGoals })
)
const build = (plan: TeacherCoursePlan, goalIndex = goals, exam = milestone, from = startDate, until = endDate,
  options: { moveLaterGoals?: boolean; includeSuggestions?: boolean; referenceGoals?: ReadonlyMap<string, UiGoal> } = {}) => (
  buildCoursePlanExamPreparationBlocks({
    plan, milestone: exam, preview: previewFor(plan, goalIndex, exam, from, until, options), goals: goalIndex,
    startDate: from, endDate: until, blockId: 'preparation', title: 'Vorbereitung',
    moveLaterGoals: options.moveLaterGoals ?? false,
  })
)

const basic = previewFor()
assert.equal(evaluateTeacherCoursePlan(emptyPlan, goals, endDate).quality.status, 'insufficient')
assert(basic.planEvaluable, 'missing coverage attestation does not invalidate a calculable learner plan')
assert.deepEqual(basic.coverage.additionalGoalIds, ['b'])
assert.deepEqual(basic.foundationGoalIds, ['foundation'])
assert.deepEqual(new Set(basic.requiredGoalIds), new Set(['a', 'b', 'foundation', 'selected-task']))
assert(!basic.requiredGoalIds.includes('unselected-task'), 'preparation never selects additional matching task packages')
const completed = build(emptyPlan)
assert(completed)
assert.deepEqual(milestone.goalIds, ['a', 'selected-task'], 'preparation never rewrites exam scope')
const completedMetrics = evaluateTeacherCoursePlan({ ...emptyPlan, blocks: completed }, goals, endDate).metrics
assert(completedMetrics)
assert(basic.requiredGoalIds.every((id) => completedMetrics.dueGoalIds.includes(id)))
assert.equal(completed.filter((block) => block.kind === 'learning').length, 1)
assert.equal(defaultCoursePlanPreparationEnd(milestone), '2026-10-26')
assert.equal(previewFor(emptyPlan, goals, milestone, '2026-10-24', '2026-10-25').validDates, false)
assert.equal(previewFor(emptyPlan, goals, milestone, startDate, milestone.date).validDates, false)
assert.equal(previewFor(emptyPlan, goals, milestone, '2026-10-26', '2026-10-22').validDates, false)
assert.equal(build(emptyPlan, goals, { ...milestone, active: false }), null)

// Mastery is supplied by the authoritative planning snapshot; it is neither
// inferred from successful tasks nor modified when preparation is added.
const masteredPlan: TeacherCoursePlan = {
  ...emptyPlan, planningBaseline: {
    source: 'learner-planning-landscape-v1', curriculumId: 'physics', landscapeId: 'physics',
    scopeAtomicGoalIds: ['a', 'b', 'foundation', 'selected-task', 'unrelated', 'unselected-task'],
    openAtomicGoalIds: ['b', 'foundation', 'selected-task', 'unrelated', 'unselected-task'],
    totalAtomicGoalCount: 6, masteredAtomicGoalCount: 1, capturedAt: `${startDate}T09:00:00.000Z`,
  },
}
const masteryBefore = JSON.stringify(masteredPlan.planningBaseline)
assert.deepEqual(previewFor(masteredPlan).masteredGoalIds, ['a'])
const masteredBlocks = build(masteredPlan)
assert(masteredBlocks)
const masteredPreparation = masteredBlocks.at(-1)
assert(masteredPreparation?.kind === 'learning')
assert(!masteredPreparation.goalIds?.includes('a'))
assert.equal(JSON.stringify(masteredPlan.planningBaseline), masteryBefore)

// Every changed section is named, including duplicate authored roots with no
// currently assigned atoms. Inactive broad sections remain entirely untouched.
const late: TeacherCoursePlanBlock = {
  id: 'late', kind: 'learning', goalId: 'all', startDate: '2026-11-02', endDate: '2026-11-13',
}
const duplicate: TeacherCoursePlanBlock = {
  id: 'duplicate', kind: 'learning', goalId: 'b', startDate: '2026-11-16', endDate: '2026-11-20',
}
const inactive = { ...late, id: 'inactive', active: false }
const laterPlan = planWith([milestone, late, duplicate, inactive])
const beforeMove = JSON.stringify(laterPlan)
assert.deepEqual(previewFor(laterPlan).laterBlockIds, ['late', 'duplicate'])
assert.equal(build(laterPlan), null, 'moving goals requires explicit acceptance')
const moved = build(laterPlan, goals, milestone, startDate, endDate, { moveLaterGoals: true })
assert(moved)
const changedLate = moved.find((block) => block.id === 'late')
assert(changedLate?.kind === 'learning')
assert.deepEqual(changedLate.goalIds, ['unrelated'], 'unrelated scheduled scope remains in its original section')
assert.equal(moved.find((block) => block.id === 'duplicate')?.active, false)
assert.deepEqual(moved.find((block) => block.id === 'inactive'), inactive)
assert.equal(JSON.stringify(laterPlan), beforeMove, 'preview and application builders do not mutate the source plan')

const timelyPlan = planWith([milestone, {
  id: 'early', kind: 'learning', goalId: 'a', startDate: '2026-10-19', endDate: '2026-10-20',
}])
assert.deepEqual(previewFor(timelyPlan).timelyGoalIds, ['a'])
assert(!previewFor(timelyPlan).toPlanGoalIds.includes('a'))
assert(build(timelyPlan))

// Global rounding may move a previously timely goal when a late atom is pulled
// forward. The final check must protect all required goals, not just new work.
const roundingGoals = index(goal('a'), task('task', ['a']))
const roundingExam = { ...milestone, goalIds: ['task'] }
const roundingPlan = planWith([roundingExam,
  { id: 'a-later', kind: 'learning', goalId: 'a', startDate: '2026-10-19', endDate: '2026-10-30' },
  { id: 'task-later', kind: 'learning', goalId: 'task', startDate: '2026-10-19', endDate: '2026-11-02' },
])
const roundingPreview = previewFor(roundingPlan, roundingGoals, roundingExam, startDate, startDate)
assert.deepEqual(roundingPreview.timelyGoalIds, ['a'])
assert.deepEqual(roundingPreview.toPlanGoalIds, ['task'])
const partialCandidate = { ...roundingPlan, blocks: [roundingPlan.blocks[0]!, roundingPlan.blocks[1]!,
  { ...roundingPlan.blocks[2]!, active: false },
  { id: 'preparation', kind: 'learning' as const, goalId: 'task', startDate, endDate: startDate },
] }
assert.deepEqual(evaluateTeacherCoursePlan(partialCandidate, roundingGoals, startDate).metrics?.dueGoalIds, ['task'])
assert.equal(build(roundingPlan, roundingGoals, roundingExam, startDate, startDate, { moveLaterGoals: true }), null,
  'the builder must reject a plan that would push an already timely required goal behind the deadline')

// Prerequisite-only external references stay outside the target universe and
// coverage calculation. They remain visible advice without requiring a waiver.
const externalGoals = new Map(goals)
externalGoals.set('b', { ...goals.get('b')!, requires: ['math:linear-equations'] })
const externalPreview = previewFor(emptyPlan, externalGoals)
assert.deepEqual(externalPreview.externalFoundationGoalIds, ['math:linear-equations'])
assert.deepEqual(externalPreview.unavailableGoalIds, [])
assert(!externalPreview.requiredGoalIds.includes('math:linear-equations'))
const externalBlocks = build(emptyPlan, externalGoals)
assert(externalBlocks)
assert(!JSON.stringify(externalBlocks).includes('linear-equations'), 'external advice never schedules or masters external goals')
assert(build(emptyPlan, externalGoals, milestone, startDate, endDate, { includeSuggestions: false }),
  'external foundations do not prevent preparing just the explicit selection')
const qualifiedGoals = new Map(goals)
qualifiedGoals.set('b', { ...goals.get('b')!, requires: ['physics:foundation'] })
assert.deepEqual(previewFor(emptyPlan, qualifiedGoals).foundationGoalIds, ['foundation'])
assert.deepEqual(previewFor(emptyPlan, qualifiedGoals).externalFoundationGoalIds, [])
const outsideBaselineGoals = new Map(goals).set('external-atom', goal('external-atom'))
outsideBaselineGoals.set('b', { ...goals.get('b')!, requires: ['external-atom'] })
assert.deepEqual(previewFor(masteredPlan, outsideBaselineGoals).externalFoundationGoalIds, ['external-atom'],
  'an available goal outside the authoritative course target remains external')

// Unknown assessment coverage and unavailable recommendation references stay
// visible as limitations, but cannot override a learner's explicit selection.
const missingCoverage = new Map(externalGoals)
missingCoverage.set('selected-task', { ...task('selected-task', ['math:linear-equations']), requires: ['a'] })
assert(previewFor(emptyPlan, missingCoverage).unavailableGoalIds.includes('math:linear-equations'))
assert(build(emptyPlan, missingCoverage, milestone, startDate, endDate, { includeSuggestions: false }))
const unknownTask = new Map(goals).set('selected-task', { ...task('selected-task'), requires: ['a', 'b'] })
assert.deepEqual(previewFor(emptyPlan, unknownTask).coverage.unknownTaskIds, ['selected-task'])
assert(build(emptyPlan, unknownTask, milestone, startDate, endDate, { includeSuggestions: false }),
  'a usable selected task remains preparable even without explicit coverage metadata')
const cycleGoals = new Map(goals)
cycleGoals.set('a', { ...goal('a'), requires: ['b'] })
cycleGoals.set('b', { ...goal('b'), requires: ['a'] })
const cyclePreview = previewFor(emptyPlan, cycleGoals)
assert(cyclePreview.unavailableGoalIds.includes('a') && cyclePreview.unavailableGoalIds.includes('b'))
assert(build(emptyPlan, cycleGoals, milestone, startDate, endDate, { includeSuggestions: false }),
  'an unresolved cycle in optional additions cannot force those additions into the selected preparation')
const selectedCycleExam = { ...milestone, goalIds: ['a', 'b', 'selected-task'] }
assert.equal(build(planWith([selectedCycleExam]), cycleGoals, selectedCycleExam, startDate, endDate,
  { includeSuggestions: false }), null, 'a real cycle inside the selected work remains a hard blocker')

// The default path respects the selected topics. A suggestion is an addition
// only after opting in; rejecting it cannot prevent creating preparation.
const selectedGoals = new Map(goals).set('c', goal('c'))
const selectedExam = { ...milestone, goalIds: ['a', 'c', 'selected-task'] }
const selectedPlan = planWith([selectedExam])
const selectedOnly = previewCoursePlanExamPreparation({
  plan: selectedPlan, milestone: selectedExam, goals: selectedGoals, startDate, endDate,
})
assert.equal(selectedOnly.includeSuggestions, false)
assert.deepEqual(new Set(selectedOnly.requiredGoalIds), new Set(['a', 'c', 'selected-task']))
assert.deepEqual(selectedOnly.coverage.additionalGoalIds, ['b'])
assert(selectedOnly.foundationGoalIds.includes('foundation'), 'optional foundations remain visible recommendations')
assert(!selectedOnly.toPlanGoalIds.includes('b') && !selectedOnly.toPlanGoalIds.includes('foundation'))
assert.deepEqual(selectedOnly.invalidSelectedGoalIds, [])
const selectedBlocks = buildCoursePlanExamPreparationBlocks({
  plan: selectedPlan, milestone: selectedExam, preview: selectedOnly, goals: selectedGoals,
  startDate, endDate, blockId: 'selected-only', title: 'Gewählte Themen', moveLaterGoals: false,
})
assert(selectedBlocks, 'the unextended default selection can be adopted without consenting to extras')
const selectedCopy = materializeLearnerLearningPlanCopy({
  plan: { ...selectedPlan, blocks: selectedBlocks }, fallbackPlanLabel: 'Klausur', goals: selectedGoals,
})
assert(selectedCopy.ok)
assert.deepEqual(new Set(selectedCopy.copy.blocks.filter((block) => block.kind === 'learning')
  .flatMap((block) => block.atomicGoalIds ?? [])), new Set(['a', 'c', 'selected-task']))
const withSuggestions = previewCoursePlanExamPreparation({
  plan: selectedPlan, milestone: selectedExam, goals: selectedGoals, startDate, endDate, includeSuggestions: true,
})
assert.equal(withSuggestions.includeSuggestions, true)
assert.deepEqual(new Set(withSuggestions.requiredGoalIds), new Set(['a', 'b', 'c', 'foundation', 'selected-task']))
assert.notEqual(coursePlanPreparationConsentKey(selectedPlan, selectedExam, selectedOnly, startDate, endDate),
  coursePlanPreparationConsentKey(selectedPlan, selectedExam, withSuggestions, startDate, endDate),
  'opting in changes the preview identity even if previously mastered work hides a visible count difference')

// A draft task cannot become scheduled assessment work. The selected content
// can still be prepared, and the omitted task remains explicitly disclosed.
const draftGoal = { ...task('draft-task', ['a']), examData: { ...task('draft-task', ['a']).examData!, reviewStatus: 'draft' } }
const unusableGoal = { ...task('unusable-task', ['a']), examData: { ...task('unusable-task', ['a']).examData!, taskContent: '' } }
for (const excluded of [draftGoal, unusableGoal]) {
  const taskGoals = new Map(goals).set(excluded.id, excluded)
  const taskExam = { ...milestone, goalIds: ['a', excluded.id] }
  const taskPlan = planWith([taskExam])
  const taskPreview = previewCoursePlanExamPreparation({ plan: taskPlan, milestone: taskExam,
    goals: taskGoals, startDate, endDate })
  assert.deepEqual(taskPreview.excludedTaskGoalIds, [excluded.id])
  assert.deepEqual(taskPreview.requiredGoalIds, ['a'])
  assert(!taskPreview.toPlanGoalIds.includes(excluded.id))
  assert(buildCoursePlanExamPreparationBlocks({ plan: taskPlan, milestone: taskExam, preview: taskPreview,
    goals: taskGoals, startDate, endDate, blockId: 'content-only', title: 'Inhalte', moveLaterGoals: false }),
  'unusable assessment material does not block valid selected content')
}
const missingSelection = { ...milestone, goalIds: ['a', 'missing-selected-root'] }
const missingPlan = planWith([missingSelection])
assert(previewFor(missingPlan, goals, missingSelection, startDate, endDate, { includeSuggestions: false })
  .invalidSelectedGoalIds.includes('missing-selected-root'))
assert.equal(build(missingPlan, goals, missingSelection, startDate, endDate, { includeSuggestions: false }), null,
  'an unavailable explicit selection remains invalid instead of silently disappearing')

// The actual Hessen LK view references the canonical free-fall cluster and
// its atoms redundantly in one task. The cluster is not a captured atom, and
// declining suggested preparation must not strand the chosen assessment.
const canonicalPhysics = normalizeLandscape(JSON.parse(readFileSync(new URL(
  '../../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', import.meta.url), 'utf8')) as SkillLandscape)
assert(canonicalPhysics)
const physicsReferences = new Map(canonicalPhysics.goals.map((entry) => [entry.id, entry]))
const physicsView = JSON.parse(readFileSync(new URL(
  '../../../curricula/DE/Gymnasium/composition-views/physik/de-he-sekii-lk.view.json', import.meta.url), 'utf8')) as CompositionView
const [projectedPhysics] = normalizeLearnerProjectedEntries(applyCompositionViewProjection([canonicalPhysics], physicsView))
assert(projectedPhysics)
const projectedPhysicsGoals = new Map(projectedPhysics.goals.map((entry) => [entry.id, entry]))
const physicsChildren = buildVisibleChildrenMap(projectedPhysicsGoals, undefined, {
  [CANONICAL_GYMNASIUM_ROOT_ID]: { selected: true, stage: 'SekII' },
  [canonicalPhysics.meta.landscapeId]: { selected: true, filterId: 'LK,DE-HE' },
})
const physicsRoles = collectCompositionProjectionRoleGoalIds(physicsView.rootNodes, physicsReferences)
const physicsScope = [...physicsRoles.targetGoalIds].filter((id) => physicsReferences.get(id)?.type === 'atomic')
const fallCluster = '230345f3-c360-4963-b390-ab94e3e2c864'
const fallAtom = '09029573-864f-40ca-bf8a-cee7bf6dcb73'
const fallAssessment = 'a9562b05-c54d-5635-9244-3f7dd24a8642'
assert(!physicsScope.includes(fallCluster))
assert(physicsScope.includes(fallAtom) && physicsScope.includes(fallAssessment))
const physicsExam = { ...milestone, goalIds: [fallAtom, fallAssessment] }
const physicsPlan: TeacherCoursePlan = { ...planWith([physicsExam]), planningBaseline: {
  source: 'learner-planning-landscape-v1', curriculumId: CANONICAL_GYMNASIUM_ROOT_ID,
  landscapeId: canonicalPhysics.meta.landscapeId, scopeAtomicGoalIds: physicsScope,
  openAtomicGoalIds: [...physicsScope], totalAtomicGoalCount: physicsScope.length,
  masteredAtomicGoalCount: 0, capturedAt: `${startDate}T09:00:00.000Z`,
} }
const physicsBefore = JSON.stringify(physicsPlan)
const physicsPreview = previewCoursePlanExamPreparation({ plan: physicsPlan, milestone: physicsExam,
  goals: projectedPhysicsGoals, referenceGoals: physicsReferences, visibleChildren: physicsChildren,
  startDate, endDate })
assert.deepEqual(new Set(physicsPreview.requiredGoalIds), new Set([fallAtom, fallAssessment]))
assert.deepEqual(physicsPreview.invalidSelectedGoalIds, [])
assert(!physicsPreview.unavailableGoalIds.includes(fallAtom)
  && !physicsPreview.unavailableGoalIds.includes(fallAssessment), 'free fall and its assessment are not a dependency cycle')
const physicsBlocks = buildCoursePlanExamPreparationBlocks({ plan: physicsPlan, milestone: physicsExam,
  preview: physicsPreview, goals: projectedPhysicsGoals, visibleChildren: physicsChildren,
  startDate, endDate, blockId: 'physics-preparation', title: 'Physikvorbereitung', moveLaterGoals: false })
assert(physicsBlocks)
const physicsCopy = materializeLearnerLearningPlanCopy({ plan: { ...physicsPlan, blocks: physicsBlocks },
  fallbackPlanLabel: 'Kinematik', goals: projectedPhysicsGoals, visibleChildrenByParent: physicsChildren })
assert(physicsCopy.ok, 'actual selected Hessen LK preparation can reach publication')
const physicsCaptured = physicsCopy.copy.blocks.filter((block) => block.kind === 'learning')
  .flatMap((block) => block.atomicGoalIds ?? [])
assert.deepEqual(new Set(physicsCaptured), new Set([fallAtom, fallAssessment]))
assert(physicsCaptured.every((id) => physicsScope.includes(id) && physicsReferences.get(id)?.type === 'atomic'))
assert(!physicsCaptured.includes(fallCluster), 'a duplicate cluster reference never becomes captured atomic work')
assert.equal(JSON.stringify(physicsPlan), physicsBefore, 'preparation does not change scope, baseline mastery or exam selection')

assert.notEqual(coursePlanPreparationConsentKey(emptyPlan, milestone, basic, startDate, endDate),
  coursePlanPreparationConsentKey(emptyPlan, { ...milestone, goalIds: ['different-package'] }, basic, startDate, endDate),
  'changing selected packages invalidates consent even if the unresolved open work is identical')

console.log('Course-plan exam preparation tests passed.')
