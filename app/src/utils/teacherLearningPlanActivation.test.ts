import assert from 'node:assert/strict'

import type { LearnerLearningPlanDetail } from '../learnerLearningPlanTypes'
import type { LearnerLearningPlanCopy } from './learnerCoursePlanPublication'
import {
  learnerPlanCopyMatchesServer,
  loadTeacherLearningPlanActivation,
  teacherLearningPlanActivationRequest,
  teacherLearningPlanSubjectsBlocked,
  teacherLearningPlanDraftsMatch,
  type TeacherLearningPlanActivationSubject,
} from './teacherLearningPlanActivation'
import { createTeacherCoursePlan, reviseTeacherCoursePlan, saveTeacherCoursePlan } from './localTeacherCoursePlan'

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

const twoAtomCopy: LearnerLearningPlanCopy = {
  ...localCopy,
  atomicGoalCount: 3,
  blocks: localCopy.blocks.map((block) => (
    block.id === 'earlier-block-created-later' && block.kind === 'learning'
      ? { ...block, atomicGoalIds: ['prerequisite', 'dependent'] }
      : block
  )),
}
assert.equal(
  learnerPlanCopyMatchesServer(twoAtomCopy, {
    ...serverPlan,
    metrics: { ...serverPlan.metrics, totalPlanned: 3 },
    blocks: serverPlan.blocks.map((block) => (
      block.id === 'earlier-block-created-later' && block.kind === 'learning'
        ? { ...block, atomicGoalIds: ['dependent', 'prerequisite'] }
        : block
    )),
  }),
  false,
  'a server-side in-block permutation remains fail-closed until the exact result is confirmed',
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

const activationSubject: TeacherLearningPlanActivationSubject = {
  landscapeId: serverPlan.landscapeId,
  label: 'Nur lokaler Fachname',
  storageId: 'private-local-course-id',
  localPlan: null,
  copy: localCopy,
  serverPlan,
  expectedRevision: serverPlan.revision,
  activationSource: 'server',
  status: 'cockpit-only',
  issue: null,
}
const request = teacherLearningPlanActivationRequest('2026-09-04', [activationSubject])
assert.deepEqual(request, {
  asOf: '2026-09-04',
  plans: [{ landscapeId: serverPlan.landscapeId, expectedRevision: serverPlan.revision,
    planLabel: localCopy.planLabel, blocks: localCopy.blocks }],
})
assert.equal(JSON.stringify(request).includes(activationSubject.storageId), false,
  'local course identity never enters the activation or preview payload')
assert.equal(JSON.stringify(request).includes(activationSubject.label), false,
  'local display metadata is not sent as subject metadata')
assert.equal(teacherLearningPlanSubjectsBlocked([activationSubject]), false)
assert.equal(teacherLearningPlanSubjectsBlocked([{ ...activationSubject, status: 'unavailable' }]), true)
assert.equal(teacherLearningPlanSubjectsBlocked([{ ...activationSubject, copy: null }]), true,
  'a missing replayable copy for a stored subject cannot disappear from the batch silently')

const initiallyEmptySubject: TeacherLearningPlanActivationSubject = {
  ...activationSubject,
  storageId: 'initially-empty-subject',
  copy: null, serverPlan: null, localPlan: null, activationSource: null, status: 'draft',
}
const items = new Map<string, string>()
const storage = { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => { items.set(key, value) } }
assert.equal(teacherLearningPlanDraftsMatch([initiallyEmptySubject], storage), true,
  'an unchanged empty subject is part of the snapshot without blocking other prepared subjects')
const emptyPlan = createTeacherCoursePlan({ classId: initiallyEmptySubject.storageId, createdOn: '2026-09-04', recordedAt: '2026-09-04T08:00:00.000Z' })
assert.ok(emptyPlan)
const newlyPreparedPlan = reviseTeacherCoursePlan(emptyPlan, {
  changedOn: '2026-09-04', recordedAt: '2026-09-04T08:01:00.000Z',
  blocks: [{ id: 'new-section', kind: 'learning', goalId: 'new-goal', startDate: '2026-09-04', endDate: '2026-09-04' }],
})
assert.ok(newlyPreparedPlan)
assert.equal(saveTeacherCoursePlan(newlyPreparedPlan, storage).ok, true)
assert.equal(teacherLearningPlanDraftsMatch([initiallyEmptySubject], storage), false,
  'a newly prepared previously empty subject invalidates the whole preview and activation snapshot')

const originalFetch = globalThis.fetch
let scopeReadCount = 0
globalThis.fetch = (async () => {
  scopeReadCount += 1
  return new Response(JSON.stringify({ asOf: '2026-09-04', followLearningPlans: true, plans: [serverPlan] }))
}) as typeof fetch
try {
  await assert.rejects(() => loadTeacherLearningPlanActivation({
    classSession: { id: 'private-course', name: 'Private alias', landscapeId: 'math', activeFilter: 'all', students: [], personalConfig: { math: { selected: true } } },
    learnerId: 'learner-42', landscapeEntries: [], runtimeCatalogState: { mode: 'repository' }, language: 'de',
  }, '2026-09-04'), /learning-plan-subject-scope-changed/u,
  'a current server subject missing from the local trainer configuration must not be hidden as a complete shared plan')
  assert.equal(scopeReadCount, 1, 'outdated scope fails before loading details, projecting drafts, or preparing activation')
} finally {
  globalThis.fetch = originalFetch
}

console.log('Teacher multi-subject activation comparison tests passed.')
