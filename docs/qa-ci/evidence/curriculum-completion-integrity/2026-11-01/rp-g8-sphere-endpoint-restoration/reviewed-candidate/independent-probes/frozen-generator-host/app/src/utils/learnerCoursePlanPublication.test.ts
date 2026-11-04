import assert from 'node:assert/strict'

import type { LearnerCoursePlanLandscapeBaseline, TeacherCoursePlan } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import { createTeacherCoursePlan, reviseTeacherCoursePlan } from './localTeacherCoursePlan'
import { materializeLearnerLearningPlanCopy } from './learnerCoursePlanPublication'

const goal = (
  id: string,
  contains: string[] = [],
  type: UiGoal['type'] = contains.length > 0 ? 'cluster' : 'atomic',
): UiGoal => ({
  id,
  title: `Titel ${id}`,
  description: id,
  phase: 'GLOBAL',
  themenfeld: '',
  area: '',
  level: 1,
  core: true,
  weight: 1,
  leitideen: [],
  kompetenzen: [],
  sourceRef: '',
  requires: [],
  contains,
  examples: [],
  type,
})

const goals = new Map([
  goal('root', ['canonical-hidden-child']),
  goal('already-mastered'),
  goal('still-open'),
  goal('canonical-hidden-child'),
].map((item) => [item.id, item]))
const visibleChildren = new Map<string, readonly string[]>([
  ['root', ['already-mastered', 'still-open']],
])
const learnerDerivedBaseline: LearnerCoursePlanLandscapeBaseline = {
  source: 'learner-planning-landscape-v1',
  curriculumId: 'canonical-physics',
  landscapeId: 'canonical-physics',
  scopeAtomicGoalIds: ['already-mastered', 'still-open'],
  openAtomicGoalIds: ['still-open'],
  totalAtomicGoalCount: 2,
  masteredAtomicGoalCount: 1,
  capturedAt: '2026-09-01T08:00:00.000Z',
}

const initial = createTeacherCoursePlan({
  classId: 'must-never-leave-the-browser',
  createdOn: '2026-09-01',
  recordedAt: '2026-09-01T08:00:00.000Z',
  schoolYearLabel: '2026/27 · Physik',
})
assert(initial)
const plan = reviseTeacherCoursePlan(initial, {
  planningBaseline: learnerDerivedBaseline,
  changedOn: '2026-09-01',
  recordedAt: '2026-09-01T09:00:00.000Z',
  blocks: [
    {
      id: 'learning-block',
      kind: 'learning',
      goalId: 'root',
      startDate: '2026-09-01',
      endDate: '2026-09-11',
    },
    {
      id: 'buffer-block',
      kind: 'buffer',
      title: 'Puffer',
      startDate: '2026-09-12',
      endDate: '2026-09-14',
    },
    {
      id: 'milestone-block',
      kind: 'milestone',
      title: 'Klausur',
      goalId: 'root',
      date: '2026-09-15',
    },
  ],
})
assert(plan)

const materialized = materializeLearnerLearningPlanCopy({
  plan,
  fallbackPlanLabel: 'Fallback',
  goals,
  visibleChildrenByParent: visibleChildren,
})
assert.equal(materialized.ok, true)
if (!materialized.ok) throw new Error('expected a materialized learner plan copy')
assert.equal(materialized.copy.planLabel, '2026/27 · Physik')
assert.equal(materialized.copy.atomicGoalCount, 1)
assert.deepEqual(materialized.copy.blocks, [
  {
    id: 'learning-block',
    kind: 'learning',
    goalId: 'root',
    title: 'Titel root',
    startDate: '2026-09-01',
    endDate: '2026-09-11',
    atomicGoalIds: ['still-open'],
  },
  {
    id: 'buffer-block',
    kind: 'buffer',
    title: 'Puffer',
    startDate: '2026-09-12',
    endDate: '2026-09-14',
  },
  {
    id: 'milestone-block',
    kind: 'milestone',
    title: 'Klausur',
    goalId: 'root',
    date: '2026-09-15',
  },
])

const multiTopicPlan: TeacherCoursePlan = {
  ...plan,
  blocks: [...plan.blocks.slice(0, 2), {
    id: 'exam-topics', kind: 'milestone', title: 'Klausur mit Themenauswahl',
    goalId: 'ignored-legacy-id', goalIds: ['root', 'already-mastered'], date: '2026-09-15',
  }],
}
const topicCopy = materializeLearnerLearningPlanCopy({
  plan: multiTopicPlan, fallbackPlanLabel: 'Fallback', goals, visibleChildrenByParent: visibleChildren,
})
assert(topicCopy.ok)
assert.equal(topicCopy.copy.atomicGoalCount, materialized.copy.atomicGoalCount,
  'exam scope adds no scheduled work and retains already-mastered topics')
assert.deepEqual(topicCopy.copy.blocks[2], {
  id: 'exam-topics', kind: 'milestone', title: 'Klausur mit Themenauswahl',
  goalIds: ['root', 'already-mastered'], date: '2026-09-15',
})
const sourceExam = multiTopicPlan.blocks[2]
const copiedExam = topicCopy.copy.blocks[2]
assert(sourceExam?.kind === 'milestone' && copiedExam?.kind === 'milestone')
assert.notEqual(sourceExam.goalIds, copiedExam.goalIds, 'publication copies the selected roots')
const examOnlyCopy = materializeLearnerLearningPlanCopy({
  plan: { ...multiTopicPlan, planningBaseline: undefined, blocks: [sourceExam] },
  fallbackPlanLabel: 'Fallback', goals, visibleChildrenByParent: visibleChildren,
})
assert(examOnlyCopy.ok)
assert.deepEqual(examOnlyCopy.copy.blocks, [copiedExam],
  'selected exam scope can be published without creating dated learning work')
assert.equal(examOnlyCopy.copy.atomicGoalCount, 0,
  'exam topics do not acquire a daily or weekly quota through publication')
const unavailableExamPlan = { ...multiTopicPlan, blocks: [...multiTopicPlan.blocks.slice(0, 2), {
  ...sourceExam, goalIds: ['root', 'outside-visible-scope'],
}] }
assert.deepEqual(materializeLearnerLearningPlanCopy({
  plan: unavailableExamPlan, fallbackPlanLabel: 'Fallback', goals, visibleChildrenByParent: visibleChildren,
}), { ok: false, blockId: 'exam-topics', goalId: 'outside-visible-scope' })
const clearedExamCopy = materializeLearnerLearningPlanCopy({
  plan: { ...multiTopicPlan, blocks: [...multiTopicPlan.blocks.slice(0, 2), { ...sourceExam, goalIds: [] }] },
  fallbackPlanLabel: 'Fallback', goals, visibleChildrenByParent: visibleChildren,
})
assert(clearedExamCopy.ok)
assert.deepEqual(clearedExamCopy.copy.blocks[2], { ...copiedExam, goalIds: [] })

const prerequisiteGoals = new Map([
  goal('prerequisite-root', ['dependent', 'prerequisite-cluster']),
  {
    ...goal('dependent'),
    effectiveRequires: ['prerequisite-cluster'],
  },
  goal('prerequisite-cluster', ['prerequisite']),
  goal('prerequisite'),
].map((item) => [item.id, item]))
const prerequisiteInitial = createTeacherCoursePlan({
  classId: 'prerequisite-publication',
  createdOn: '2026-09-01',
  recordedAt: '2026-09-01T08:00:00.000Z',
})
assert(prerequisiteInitial)
const prerequisitePlan = reviseTeacherCoursePlan(prerequisiteInitial, {
  changedOn: '2026-09-01',
  recordedAt: '2026-09-01T09:00:00.000Z',
  blocks: [{
    id: 'prerequisite-learning-block',
    kind: 'learning',
    goalId: 'prerequisite-root',
    startDate: '2026-09-01',
    endDate: '2026-09-04',
  }],
})
assert(prerequisitePlan)
const prerequisiteMaterialized = materializeLearnerLearningPlanCopy({
  plan: prerequisitePlan,
  fallbackPlanLabel: 'Voraussetzungsplan',
  goals: prerequisiteGoals,
})
assert.equal(prerequisiteMaterialized.ok, true)
if (!prerequisiteMaterialized.ok) throw new Error('expected prerequisite materialization')
assert.deepEqual(prerequisiteMaterialized.copy.blocks[0], {
  id: 'prerequisite-learning-block',
  kind: 'learning',
  goalId: 'prerequisite-root',
  title: 'Titel prerequisite-root',
  startDate: '2026-09-01',
  endDate: '2026-09-04',
  atomicGoalIds: ['prerequisite', 'dependent'],
})

const serializedCopy = JSON.stringify(materialized.copy)
for (const forbidden of [
  'must-never-leave-the-browser',
  'planningBaseline',
  'openAtomicGoalIds',
  'mastery',
  'coverage',
  'attestation',
  'revisionHistory',
]) {
  assert(!serializedCopy.includes(forbidden), `learner plan copy excludes ${forbidden}`)
}

const insufficientGoals = new Map(goals).set('empty-cluster', goal('empty-cluster', [] as string[], 'cluster'))
const insufficientPlan: TeacherCoursePlan = {
  ...plan,
  planningBaseline: undefined,
  blocks: [{
    id: 'empty-learning-block',
    kind: 'learning',
    goalId: 'empty-cluster',
    startDate: '2026-09-01',
    endDate: '2026-09-11',
  }],
}
assert.equal(materializeLearnerLearningPlanCopy({
  plan: insufficientPlan,
  fallbackPlanLabel: 'Fallback',
  goals: insufficientGoals,
}).ok, false, 'an insufficient atomic-goal assignment fails closed')

const invalidPlan: TeacherCoursePlan = {
  ...plan,
  blocks: [{
    id: 'invalid-learning-block',
    kind: 'learning',
    goalId: 'missing-goal',
    startDate: '2026-09-01',
    endDate: '2026-09-11',
  }],
}
assert.deepEqual(materializeLearnerLearningPlanCopy({
  plan: invalidPlan,
  fallbackPlanLabel: 'Fallback',
  goals,
  visibleChildrenByParent: visibleChildren,
}), {
  ok: false,
  blockId: 'invalid-learning-block',
  goalId: 'missing-goal',
})

const preparationRoots = ['root', 'still-open']
const pausedAndPreparationPlan: TeacherCoursePlan = {
  ...plan,
  blocks: [
    { ...plan.blocks[0]!, active: false },
    { id: 'preparation', kind: 'learning', goalId: 'root', goalIds: preparationRoots,
      title: 'Vorbereitung', active: true, startDate: '2026-09-01', endDate: '2026-09-11' },
    { ...plan.blocks[1]!, active: false },
    { ...plan.blocks[2]!, active: false },
  ],
}
const pausedCopy = materializeLearnerLearningPlanCopy({
  plan: pausedAndPreparationPlan, fallbackPlanLabel: 'Fallback', goals, visibleChildrenByParent: visibleChildren,
})
assert(pausedCopy.ok)
assert.equal(pausedCopy.copy.atomicGoalCount, 1, 'paused sections do not count toward active work')
const preservedPausedBlock = pausedCopy.copy.blocks[0]
assert(preservedPausedBlock?.kind === 'learning')
assert.equal(preservedPausedBlock.active, false)
assert.deepEqual(preservedPausedBlock.atomicGoalIds, ['still-open'], 'paused work retains its atom IDs for reactivation')
const copiedPreparation = pausedCopy.copy.blocks[1]
assert(copiedPreparation?.kind === 'learning')
assert.deepEqual(copiedPreparation.goalIds, preparationRoots)
assert.notEqual(copiedPreparation.goalIds, preparationRoots)
assert.deepEqual(copiedPreparation.atomicGoalIds, ['still-open'], 'paused broad section does not steal active preparation atoms')
assert(pausedCopy.copy.blocks.every((block, index) => index === 1 ? block.active === true : block.active === false))
const fullyPausedCopy = materializeLearnerLearningPlanCopy({
  plan: { ...pausedAndPreparationPlan, blocks: pausedAndPreparationPlan.blocks.map((block) => ({ ...block, active: false })) },
  fallbackPlanLabel: 'Fallback', goals, visibleChildrenByParent: visibleChildren,
})
assert(fullyPausedCopy.ok)
assert.equal(fullyPausedCopy.copy.atomicGoalCount, 0)
assert.equal(fullyPausedCopy.copy.blocks.length, 4, 'all-paused plans remain publishable without dropping sections')
assert.deepEqual(materializeLearnerLearningPlanCopy({
  plan: { ...invalidPlan, blocks: invalidPlan.blocks.map((block) => ({ ...block, active: false })) },
  fallbackPlanLabel: 'Fallback', goals, visibleChildrenByParent: visibleChildren,
}), { ok: false, blockId: 'invalid-learning-block', goalId: 'missing-goal' },
'pausing does not bypass curriculum scope validation at publication')
