import { learnerPlanStatus } from '../../scripts/fixtures/learnerPlanStatus'
import assert from 'node:assert/strict'

import type { LearnerLearningPlanDetail } from '../learnerLearningPlanTypes'
import type { LearnerLearningPlanCopy } from './learnerCoursePlanPublication'
import type { LandscapeEntry } from '../hooks/useLandscapes'
import { convertLearningGoal } from '../goalTypes'
import { getTeacherCoursePlanStorageId } from './teacherCoursePlanContext'
import {
  compareTeacherLearningPlanDraft,
  learnerPlanCopyMatchesServer,
  loadTeacherLearningPlanActivation,
  loadTeacherLearningPlanActivationSubject,
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
  buffer: { totalWorkdays: 0, remainingWorkdays: 0 },
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

const examTopicBlock = {
  id: 'exam-topics', kind: 'milestone' as const, title: 'Klausur',
  goalIds: ['earlier-focus', 'later-focus'], date: '2026-09-21',
}
const copyWithExamScope = { ...localCopy, blocks: [...localCopy.blocks, examTopicBlock] }
const serverWithExamScope = { ...serverPlan, blocks: [...serverPlan.blocks, examTopicBlock] }
assert.equal(learnerPlanCopyMatchesServer(copyWithExamScope, serverWithExamScope), true)
assert.equal(learnerPlanCopyMatchesServer(copyWithExamScope, {
  ...serverWithExamScope,
  blocks: [...serverPlan.blocks, { ...examTopicBlock, goalIds: ['earlier-focus'] }],
}), false, 'changing only the exam selection must require applying the updated plan')
assert.equal(learnerPlanCopyMatchesServer(copyWithExamScope, {
  ...serverWithExamScope,
  blocks: [...serverPlan.blocks, { ...examTopicBlock, goalIds: undefined }],
}), false, 'a backend response that loses topic roots never confirms activation')
assert.equal(learnerPlanCopyMatchesServer({
  ...copyWithExamScope, blocks: [...localCopy.blocks, { ...examTopicBlock, goalIds: [] }],
}, {
  ...serverWithExamScope,
  blocks: [...serverPlan.blocks, { ...examTopicBlock, goalIds: [], goalId: 'ignored-legacy-target' }],
}), true, 'an explicit empty list overrides a lingering legacy target consistently')

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

const titlelessBlocks = localCopy.blocks.map((block) => {
  assert.equal(block.kind, 'learning')
  if (block.kind !== 'learning' || !block.goalId) throw new Error('expected learning block')
  return { id: block.id, kind: block.kind, goalId: block.goalId,
    startDate: block.startDate, endDate: block.endDate }
})
const titlelessPlan = reviseTeacherCoursePlan(emptyPlan, {
  changedOn: '2026-09-04', recordedAt: '2026-09-04T08:01:00.000Z',
  schoolYearLabel: localCopy.planLabel, blocks: titlelessBlocks,
})
assert.ok(titlelessPlan)
const unchangedLocalSnapshot = JSON.stringify(titlelessPlan)
const oldCurriculumTitle = 'Earlier curriculum title'
const oldTitleServer: LearnerLearningPlanDetail = {
  ...serverPlan,
  blocks: serverPlan.blocks.map((block) => block.id === 'later-block-created-first'
    ? { ...block, title: oldCurriculumTitle } : block),
}
assert.deepEqual(compareTeacherLearningPlanDraft(titlelessPlan, localCopy, oldTitleServer),
  { status: 'current', issue: null },
  'a changed curriculum-owned fallback title does not claim a local teacher edit')
assert.equal(learnerPlanCopyMatchesServer(localCopy, oldTitleServer), false,
  'the same fallback-title difference still fails the exact activation response check')
assert.deepEqual(compareTeacherLearningPlanDraft(titlelessPlan, localCopy, { ...serverPlan, stale: true }),
  { status: 'review-required', issue: 'server-plan-stale' },
  'a stale curriculum scope is a review state even for byte-equal planned blocks')
assert.deepEqual(compareTeacherLearningPlanDraft(titlelessPlan, twoAtomCopy, {
  ...serverPlan,
  blocks: twoAtomCopy.blocks.map((block) => block.kind === 'learning'
    ? { ...block, atomicGoalIds: [...block.atomicGoalIds].reverse() } : block),
}), { status: 'review-required', issue: 'projected-goals-changed' },
'changed in-block prerequisite ordering remains visible without alleging a teacher edit')
assert.deepEqual(compareTeacherLearningPlanDraft(titlelessPlan, localCopy, {
  ...serverPlan,
  blocks: serverPlan.blocks.map((block) => block.kind === 'learning'
    ? { ...block, atomicGoalIds: [...(block.atomicGoalIds ?? []), 'new-curriculum-atom'] } : block),
}), { status: 'review-required', issue: 'projected-goals-changed' },
'changed atomic scope is not silently accepted by the relaxed title-only status comparison')
assert.deepEqual(compareTeacherLearningPlanDraft(titlelessPlan, {
  ...localCopy, atomicGoalCount: 1, blocks: localCopy.blocks.slice(1),
}, serverPlan), { status: 'review-required', issue: 'projected-goals-changed' },
'a still-authored block emptied by curriculum projection is not called a local deletion')

const explicitTitlePlan = reviseTeacherCoursePlan(titlelessPlan, {
  changedOn: '2026-09-04', recordedAt: '2026-09-04T08:02:00.000Z',
  blocks: titlelessBlocks.map((block) => block.id === 'later-block-created-first'
    ? { ...block, title: oldCurriculumTitle } : block),
})
assert.ok(explicitTitlePlan)
const explicitTitleCopy: LearnerLearningPlanCopy = { ...localCopy, blocks: oldTitleServer.blocks as LearnerLearningPlanCopy['blocks'] }
assert.deepEqual(compareTeacherLearningPlanDraft(explicitTitlePlan, explicitTitleCopy, serverPlan),
  { status: 'update-required', issue: null }, 'an explicitly authored title change remains unapplied')
assert.deepEqual(compareTeacherLearningPlanDraft(explicitTitlePlan, explicitTitleCopy, oldTitleServer),
  { status: 'current', issue: null }, 'a matching explicit title is current')
const removedTitlePlan = reviseTeacherCoursePlan(explicitTitlePlan, {
  changedOn: '2026-09-04', recordedAt: '2026-09-04T08:03:00.000Z', blocks: titlelessBlocks,
})
assert.ok(removedTitlePlan)
assert.deepEqual(compareTeacherLearningPlanDraft(removedTitlePlan, localCopy, oldTitleServer),
  { status: 'review-required', issue: 'learning-block-title-origin-unknown' },
  'removing an explicit title retained on the server cannot be hidden as a fallback-only update')
assert.deepEqual(compareTeacherLearningPlanDraft(removedTitlePlan, localCopy, serverPlan),
  { status: 'current', issue: null }, 'confirmed title removal does not stay pending because of history')
assert.deepEqual(compareTeacherLearningPlanDraft(titlelessPlan, { ...localCopy, planLabel: 'Changed plan label' }, serverPlan),
  { status: 'update-required', issue: null }, 'an explicit plan label difference remains unapplied')
assert.deepEqual(compareTeacherLearningPlanDraft(titlelessPlan, localCopy, {
  ...serverPlan,
  blocks: serverPlan.blocks.map((block) => block.kind === 'learning'
    ? { ...block, endDate: '2026-09-20' } : block),
}), { status: 'update-required', issue: null }, 'a date difference remains unapplied')
assert.equal(JSON.stringify(titlelessPlan), unchangedLocalSnapshot,
  'status classification does not update local revision, baseline, history, or class metadata')

const planWithExamScope = reviseTeacherCoursePlan(titlelessPlan, {
  changedOn: '2026-09-04', recordedAt: '2026-09-04T08:04:00.000Z',
  blocks: [...titlelessBlocks, examTopicBlock],
})
assert(planWithExamScope)
assert.deepEqual(compareTeacherLearningPlanDraft(planWithExamScope, copyWithExamScope, serverWithExamScope),
  { status: 'current', issue: null })
assert.deepEqual(compareTeacherLearningPlanDraft(planWithExamScope, copyWithExamScope, {
  ...serverWithExamScope,
  blocks: [...serverPlan.blocks, { ...examTopicBlock, goalIds: ['earlier-focus'] }],
}), { status: 'update-required', issue: null }, 'changing exam roots is an authored change')
const serverOnlyExamSubject = await loadTeacherLearningPlanActivationSubject({
  classSession: {
    id: 'server-only-exam', name: 'Physik', landscapeId: serverPlan.landscapeId,
    activeFilter: 'all', students: [],
  },
  landscapeId: serverPlan.landscapeId, label: 'Physik', landscapeEntries: [],
  runtimeCatalogState: { mode: 'repository' }, serverPlan: serverWithExamScope,
  serverAvailable: true, storage: { getItem: () => null },
})
assert.equal(serverOnlyExamSubject.status, 'cockpit-only')
assert.deepEqual(serverOnlyExamSubject.copy?.blocks.at(-1), examTopicBlock,
  'reusing an existing server plan preserves its exam topic selection')
const storedExamCopy = serverOnlyExamSubject.copy?.blocks.at(-1)
assert(storedExamCopy?.kind === 'milestone')
assert.notEqual(storedExamCopy.goalIds, examTopicBlock.goalIds,
  'reusing a server plan creates an independent topic-root array')

const examOnlyServer: LearnerLearningPlanDetail = {
  ...serverPlan, blocks: [examTopicBlock],
  period: { startDate: examTopicBlock.date, endDate: examTopicBlock.date },
}
const examOnlySession = {
  id: 'exam-only-class', name: 'Physik', landscapeId: serverPlan.landscapeId,
  activeFilter: 'all', students: [],
}
const examOnlyStorageId = getTeacherCoursePlanStorageId(examOnlySession)
const examOnlyPlan = createTeacherCoursePlan({
  classId: examOnlyStorageId, createdOn: '2026-09-04', recordedAt: '2026-09-04T08:00:00.000Z',
  schoolYearLabel: localCopy.planLabel,
})
assert(examOnlyPlan)
const selectedExamPlan = reviseTeacherCoursePlan(examOnlyPlan, {
  changedOn: '2026-09-04', recordedAt: '2026-09-04T08:01:00.000Z', blocks: [examTopicBlock],
})
assert(selectedExamPlan)
assert.equal(saveTeacherCoursePlan(selectedExamPlan, storage).ok, true)
const examOnlyEntries: LandscapeEntry[] = [{
  meta: {
    landscapeId: serverPlan.landscapeId, locale: 'de-DE', title: 'Physik', description: '',
    frameworkId: 'flat-test', goals: [],
  },
  goals: examTopicBlock.goalIds.map((id) => convertLearningGoal({
    id, title: id, description: id, requires: [], contains: [], weight: 1,
    dimensionTags: { framework: 'flat-test', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'GLOBAL' },
  }, { landscapeId: serverPlan.landscapeId })),
}]
const examOnlyContext = {
  classSession: examOnlySession, landscapeId: serverPlan.landscapeId, label: 'Physik',
  landscapeEntries: examOnlyEntries, runtimeCatalogState: { mode: 'repository' as const },
  serverAvailable: true,
}
const examOnlyLocalSubject = await loadTeacherLearningPlanActivationSubject({
  ...examOnlyContext, serverPlan: null, storage,
})
assert.equal(examOnlyLocalSubject.status, 'ready',
  'selected exam topics are activatable without a dated or paused learning section')
assert.equal(examOnlyLocalSubject.copy?.atomicGoalCount, 0,
  'activating exam scope does not manufacture scheduled work')
assert.deepEqual(teacherLearningPlanActivationRequest('2026-09-04', [examOnlyLocalSubject]).plans[0]?.blocks,
  [examTopicBlock], 'milestone-only activation preserves the exact selected topics without generating preparation')
const examOnlyStoredSubject = await loadTeacherLearningPlanActivationSubject({
  ...examOnlyContext, serverPlan: examOnlyServer, storage: { getItem: () => null },
})
assert.equal(examOnlyStoredSubject.status, 'cockpit-only',
  'a server-only exam scope stays replayable without a local preparation draft')
assert.deepEqual(examOnlyStoredSubject.copy?.blocks, [examTopicBlock])
for (const emptyExam of [{ ...examTopicBlock, active: false }, { ...examTopicBlock, goalIds: [] }]) {
  const unavailableExamSubject = await loadTeacherLearningPlanActivationSubject({
    ...examOnlyContext, serverPlan: { ...examOnlyServer, blocks: [emptyExam] }, storage: { getItem: () => null },
  })
  assert.equal(unavailableExamSubject.copy, null,
    'an inactive or empty deadline is not an active learning scope')
}

assert.equal(learnerPlanCopyMatchesServer(localCopy, {
  ...serverPlan, blocks: serverPlan.blocks.map((block) => ({ ...block, active: true })),
}), true, 'legacy omitted activation and explicit active have identical behavior')
assert.equal(learnerPlanCopyMatchesServer(localCopy, {
  ...serverPlan, blocks: serverPlan.blocks.map((block) => ({ ...block, active: false })),
}), false, 'an activation response may not silently pause the requested work')
const multiRootPausedCopy: LearnerLearningPlanCopy = {
  ...localCopy, atomicGoalCount: 0,
  blocks: localCopy.blocks.map((block) => block.kind === 'learning'
    ? { ...block, active: false, goalIds: [block.goalId!, 'additional-topic'] } : block),
}
const multiRootPausedServer: LearnerLearningPlanDetail = { ...serverPlan, blocks: multiRootPausedCopy.blocks }
assert.equal(learnerPlanCopyMatchesServer(multiRootPausedCopy, multiRootPausedServer), true)
assert.equal(learnerPlanCopyMatchesServer(multiRootPausedCopy, {
  ...multiRootPausedServer,
  blocks: multiRootPausedServer.blocks.map((block) => block.kind === 'learning'
    ? { ...block, goalIds: undefined } : block),
}), false, 'a lost preparation root list cannot confirm activation')
const pausedLocalPlan = reviseTeacherCoursePlan(titlelessPlan, {
  changedOn: '2026-09-04', recordedAt: '2026-09-04T08:05:00.000Z',
  blocks: titlelessBlocks.map((block) => ({ ...block, active: false })),
})
assert(pausedLocalPlan)
const pausedLocalCopy: LearnerLearningPlanCopy = {
  ...localCopy, atomicGoalCount: 0, blocks: localCopy.blocks.map((block) => ({ ...block, active: false })),
}
assert.deepEqual(compareTeacherLearningPlanDraft(pausedLocalPlan, pausedLocalCopy, serverPlan),
  { status: 'update-required', issue: null }, 'pausing is a real authored plan update')
const pausedServerOnlySubject = await loadTeacherLearningPlanActivationSubject({
  classSession: {
    id: 'server-only-paused', name: 'Physik', landscapeId: serverPlan.landscapeId,
    activeFilter: 'all', students: [],
  },
  landscapeId: serverPlan.landscapeId, label: 'Physik', landscapeEntries: [],
  runtimeCatalogState: { mode: 'repository' }, serverPlan: multiRootPausedServer,
  serverAvailable: true, storage: { getItem: () => null },
})
assert.equal(pausedServerOnlySubject.status, 'cockpit-only', 'an intentionally paused subject remains replayable')
assert.equal(pausedServerOnlySubject.copy?.atomicGoalCount, 0)
assert.deepEqual(pausedServerOnlySubject.copy?.blocks, multiRootPausedCopy.blocks)
assert.deepEqual(teacherLearningPlanActivationRequest('2026-09-04', [pausedServerOnlySubject]).plans[0]?.blocks,
  multiRootPausedCopy.blocks, 'batch activation carries paused data and preparation roots unchanged')

const originalFetch = globalThis.fetch
let scopeReadCount = 0
globalThis.fetch = (async () => {
  scopeReadCount += 1
  return new Response(JSON.stringify({ asOf: '2026-09-04', followLearningPlans: true, plans: [serverPlan], status: learnerPlanStatus('2026-09-04', [serverPlan.landscapeId]) }))
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
