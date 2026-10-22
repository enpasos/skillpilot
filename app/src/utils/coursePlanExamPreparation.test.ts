import assert from 'node:assert/strict'
import type { MilestoneCoursePlanBlock, TeacherCoursePlan, TeacherCoursePlanBlock } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
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
const previewFor = (plan = emptyPlan, goalIndex = goals, exam = milestone, from = startDate, until = endDate) => (
  previewCoursePlanExamPreparation({ plan, milestone: exam, goals: goalIndex, startDate: from, endDate: until })
)
const build = (plan: TeacherCoursePlan, goalIndex = goals, exam = milestone, from = startDate, until = endDate,
  options: { moveLaterGoals?: boolean; includeExternalFoundations?: boolean } = {}) => (
  buildCoursePlanExamPreparationBlocks({
    plan, milestone: exam, preview: previewFor(plan, goalIndex, exam, from, until), goals: goalIndex,
    startDate: from, endDate: until, blockId: 'preparation', title: 'Vorbereitung', moveLaterGoals: false, ...options,
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
// coverage calculation. Acceptance acknowledges separate checking, never mastery.
const externalGoals = new Map(goals)
externalGoals.set('b', { ...goals.get('b')!, requires: ['math:linear-equations'] })
const externalPreview = previewFor(emptyPlan, externalGoals)
assert.deepEqual(externalPreview.externalFoundationGoalIds, ['math:linear-equations'])
assert.deepEqual(externalPreview.unavailableGoalIds, [])
assert(!externalPreview.requiredGoalIds.includes('math:linear-equations'))
assert.equal(build(emptyPlan, externalGoals), null)
const externalBlocks = build(emptyPlan, externalGoals, milestone, startDate, endDate, { includeExternalFoundations: true })
assert(externalBlocks)
assert(!JSON.stringify(externalBlocks).includes('linear-equations'), 'external acknowledgement never schedules or masters external goals')
const qualifiedGoals = new Map(goals)
qualifiedGoals.set('b', { ...goals.get('b')!, requires: ['physics:foundation'] })
assert.deepEqual(previewFor(emptyPlan, qualifiedGoals).foundationGoalIds, ['foundation'])
assert.deepEqual(previewFor(emptyPlan, qualifiedGoals).externalFoundationGoalIds, [])
const outsideBaselineGoals = new Map(goals).set('external-atom', goal('external-atom'))
outsideBaselineGoals.set('b', { ...goals.get('b')!, requires: ['external-atom'] })
assert.deepEqual(previewFor(masteredPlan, outsideBaselineGoals).externalFoundationGoalIds, ['external-atom'],
  'an available goal outside the authoritative course target remains external')

// Authored coverage errors remain hard blockers even when the same reference
// also occurs as an external prerequisite. Requires are never task coverage.
const missingCoverage = new Map(externalGoals)
missingCoverage.set('selected-task', { ...task('selected-task', ['math:linear-equations']), requires: ['a'] })
assert(previewFor(emptyPlan, missingCoverage).unavailableGoalIds.includes('math:linear-equations'))
assert.equal(build(emptyPlan, missingCoverage, milestone, startDate, endDate, { includeExternalFoundations: true }), null)
const unknownTask = new Map(goals).set('selected-task', { ...task('selected-task'), requires: ['a', 'b'] })
assert.deepEqual(previewFor(emptyPlan, unknownTask).coverage.unknownTaskIds, ['selected-task'])
assert.equal(build(emptyPlan, unknownTask), null)
const cycleGoals = new Map(goals)
cycleGoals.set('a', { ...goal('a'), requires: ['b'] })
cycleGoals.set('b', { ...goal('b'), requires: ['a'] })
const cyclePreview = previewFor(emptyPlan, cycleGoals)
assert(cyclePreview.unavailableGoalIds.includes('a') && cyclePreview.unavailableGoalIds.includes('b'))
assert.equal(build(emptyPlan, cycleGoals), null, 'cyclic prerequisites cannot produce a promise of complete preparation')

assert.notEqual(coursePlanPreparationConsentKey(emptyPlan, milestone, basic, startDate, endDate),
  coursePlanPreparationConsentKey(emptyPlan, { ...milestone, goalIds: ['different-package'] }, basic, startDate, endDate),
  'changing selected packages invalidates consent even if the unresolved open work is identical')

console.log('Course-plan exam preparation tests passed.')
