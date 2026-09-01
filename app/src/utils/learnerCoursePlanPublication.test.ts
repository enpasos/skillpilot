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
