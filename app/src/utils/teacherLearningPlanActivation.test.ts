import assert from 'node:assert/strict'

import type { LearnerLearningPlanDetail } from '../learnerLearningPlanTypes'
import type { LearnerLearningPlanCopy } from './learnerCoursePlanPublication'
import { learnerPlanCopyMatchesServer } from './teacherLearningPlanActivation'

const localCopy: LearnerLearningPlanCopy = {
  planLabel: 'Mathematik und Physik',
  atomicGoalCount: 2,
  blocks: [
    {
      id: 'later-block-created-first',
      kind: 'learning',
      goalId: 'later-focus',
      title: 'Späterer Block',
      startDate: '2026-09-14',
      endDate: '2026-09-18',
      atomicGoalIds: ['later-atom'],
    },
    {
      id: 'earlier-block-created-later',
      kind: 'learning',
      goalId: 'earlier-focus',
      title: 'Früherer Block',
      startDate: '2026-09-07',
      endDate: '2026-09-11',
      atomicGoalIds: ['earlier-atom'],
    },
  ],
}

const serverPlan: LearnerLearningPlanDetail = {
  planId: 'plan-1',
  revision: 1,
  landscapeId: 'canonical-physics',
  planLabel: localCopy.planLabel,
  stale: false,
  period: { startDate: '2026-09-07', endDate: '2026-09-18' },
  currentBlock: null,
  nextMilestone: null,
  metrics: {
    dueThroughToday: 0,
    completedDueThroughToday: 0,
    openDueThroughToday: 0,
    dueToday: 0,
    completedDueToday: 0,
    openDueToday: 0,
    totalPlanned: 2,
  },
  buffer: { totalWorkdays: 0, remainingWorkdays: 0 },
  pace: { status: 'neutral', reason: 'descriptive-only' },
  nextEligibleGoal: null,
  continueReason: 'no-open-due-frontier-goal',
  canContinue: false,
  // The backend normalizes the later-created earlier block to the front.
  blocks: [localCopy.blocks[1]!, localCopy.blocks[0]!],
}

assert.equal(
  learnerPlanCopyMatchesServer(localCopy, serverPlan),
  true,
  'backend date normalization does not turn an equal plan into an unconfirmed activation',
)

assert.equal(
  learnerPlanCopyMatchesServer(localCopy, {
    ...serverPlan,
    blocks: serverPlan.blocks.map((block) => (
      block.id === 'earlier-block-created-later' && block.kind === 'learning'
        ? { ...block, atomicGoalIds: ['different-atom'] }
        : block
    )),
  }),
  false,
  'canonical ordering still rejects a semantic atomic-goal difference',
)

assert.equal(
  learnerPlanCopyMatchesServer(localCopy, {
    ...serverPlan,
    blocks: serverPlan.blocks.map((block) => (
      block.id === 'later-block-created-first' && block.kind === 'learning'
        ? { ...block, endDate: '2026-09-19' }
        : block
    )),
  }),
  false,
  'canonical ordering still rejects a semantic date difference',
)

console.log('Teacher multi-subject activation comparison tests passed.')
