import assert from 'node:assert/strict'
import {
  TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY,
  type TeacherCoursePlan,
  type TeacherCoursePlanBlock,
} from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import {
  addCoursePlanDays,
  appendCourseCoverageAttestation,
  appendCourseCoverageEvent,
  assignAtomicGoalsToLearningBlocks,
  countCoursePlanWorkdaysInclusive,
  createTeacherCoursePlan,
  evaluateTeacherCoursePlan,
  isCourseGoalCovered,
  loadTeacherCoursePlan,
  normalizeTeacherCoursePlan,
  parseCoursePlanDate,
  parseTeacherCoursePlanStore,
  resolveAtomicGoalDescendants,
  reviseTeacherCoursePlan,
  saveTeacherCoursePlan,
  toggleCourseGoalCoverage,
  type StorageWriter,
  undoLastTeacherCoursePlanRevision,
} from './localTeacherCoursePlan'

function uiGoal(
  id: string,
  contains: string[] = [],
  type: UiGoal['type'] = contains.length > 0 ? 'cluster' : 'atomic',
): UiGoal {
  return {
    id,
    title: id,
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
  }
}

function goalMap(...goals: UiGoal[]): Map<string, UiGoal> {
  return new Map(goals.map((goal) => [goal.id, goal]))
}

function requirePlan(plan: TeacherCoursePlan | null): TeacherCoursePlan {
  assert(plan, 'expected a valid course plan')
  return plan
}

function createPlan(classId = 'physics-lk'): TeacherCoursePlan {
  return requirePlan(createTeacherCoursePlan({
    classId,
    createdOn: '2026-08-01',
    recordedAt: '2026-08-01T08:00:00.000Z',
    schoolYearLabel: '2026/27',
  }))
}

function addBlocks(
  plan: TeacherCoursePlan,
  blocks: readonly TeacherCoursePlanBlock[],
  changedOn = '2026-08-01',
): TeacherCoursePlan {
  return requirePlan(reviseTeacherCoursePlan(plan, {
    blocks,
    changedOn,
    recordedAt: `${changedOn}T09:00:00.000Z`,
  }))
}

const atoms = Array.from({ length: 10 }, (_, index) => uiGoal(`g${index + 1}`))
const fullGoalIndex = goalMap(uiGoal('root', atoms.map(({ id }) => id)), ...atoms)

// Calendar dates never round-trip through local time and workdays are Monday-Friday.
assert.deepEqual(parseCoursePlanDate('2024-02-29'), {
  value: '2024-02-29',
  year: 2024,
  month: 2,
  day: 29,
  epochDay: 19782,
})
assert.equal(parseCoursePlanDate('2023-02-29'), null)
assert.equal(parseCoursePlanDate('2026-8-01'), null)
assert.equal(addCoursePlanDays('2026-03-29', 1), '2026-03-30')
assert.equal(countCoursePlanWorkdaysInclusive('2026-08-01', '2026-08-09'), 5)
assert.equal(countCoursePlanWorkdaysInclusive('2026-08-09', '2026-08-01'), null)

// Visible projection children override canonical contains; missing goals and cycles fail closed.
const projectedIndex = goalMap(
  uiGoal('projected-root', ['missing-in-canonical']),
  uiGoal('a'),
  uiGoal('b'),
)
const projected = resolveAtomicGoalDescendants(
  'projected-root',
  projectedIndex,
  new Map([['projected-root', ['b', 'a']]]),
)
assert.equal(projected.quality.status, 'complete')
assert.deepEqual(projected.atomicGoalIds, ['b', 'a'])
const missing = resolveAtomicGoalDescendants('projected-root', projectedIndex)
assert.equal(missing.quality.status, 'invalid')
assert.deepEqual(missing.atomicGoalIds, [])
const cyclicIndex = goalMap(uiGoal('cycle-a', ['cycle-b']), uiGoal('cycle-b', ['cycle-a']))
assert.equal(resolveAtomicGoalDescendants('cycle-a', cyclicIndex).quality.status, 'invalid')

const staleMilestonePlan = addBlocks(createPlan('stale-milestone'), [{
  id: 'stale-milestone-block',
  kind: 'milestone',
  title: 'Abituraufgaben abgeschlossen',
  goalId: 'goal-no-longer-in-scope',
  date: '2026-08-21',
}])
const staleMilestoneEvaluation = evaluateTeacherCoursePlan(
  staleMilestonePlan,
  fullGoalIndex,
  '2026-08-14',
)
assert.equal(staleMilestoneEvaluation.quality.status, 'invalid')
assert.equal(staleMilestoneEvaluation.metrics, null)

// Overlapping atoms belong exclusively to the chronologically first learning block.
const overlapIndex = goalMap(
  uiGoal('early-root', ['g1', 'g2']),
  uiGoal('late-root', ['g2', 'g3']),
  ...atoms.slice(0, 3),
)
const overlapPlan = addBlocks(createPlan(), [
  {
    id: 'late',
    kind: 'learning',
    goalId: 'late-root',
    startDate: '2026-08-10',
    endDate: '2026-08-14',
  },
  {
    id: 'early',
    kind: 'learning',
    goalId: 'early-root',
    startDate: '2026-08-03',
    endDate: '2026-08-07',
  },
])
const overlapAssignments = assignAtomicGoalsToLearningBlocks(overlapPlan, overlapIndex)
assert.equal(overlapAssignments.quality.status, 'complete')
assert.deepEqual(overlapAssignments.assignments, [
  {
    blockId: 'early',
    goalId: 'early-root',
    atomicGoalIds: ['g1', 'g2'],
    duplicateAtomicGoalIds: [],
  },
  {
    blockId: 'late',
    goalId: 'late-root',
    atomicGoalIds: ['g3'],
    duplicateAtomicGoalIds: ['g2'],
  },
])

// Revisions archive their complete prior plan state; undo is itself a new revision.
const undoLearningBlock: TeacherCoursePlanBlock = {
  id: 'undo-learning',
  kind: 'learning',
  goalId: 'root',
  startDate: '2026-08-03',
  endDate: '2026-08-14',
}
const undoBufferBlock: TeacherCoursePlanBlock = {
  id: 'undo-buffer',
  kind: 'buffer',
  title: 'Geschützter Puffer',
  startDate: '2026-08-17',
  endDate: '2026-08-19',
}
const initialUndoPlan = createPlan('undo-class')
assert.equal(initialUndoPlan.revisionOrigin, 'initial')
assert.equal(initialUndoPlan.revisionChangedAt, '2026-08-01T08:00:00.000Z')
assert.deepEqual(initialUndoPlan.revisionHistory, [])
const firstEdit = requirePlan(reviseTeacherCoursePlan(initialUndoPlan, {
  blocks: [undoLearningBlock],
  schoolYearLabel: '2027/28',
  changedOn: '2026-08-02',
  recordedAt: '2026-08-02T10:00:00.000Z',
}))
const secondEdit = requirePlan(reviseTeacherCoursePlan(firstEdit, {
  blocks: [undoBufferBlock],
  schoolYearLabel: '',
  changedOn: '2026-08-03',
  recordedAt: '2026-08-03T10:00:00.000Z',
}))
assert.equal(secondEdit.revision, 3)
assert.deepEqual(secondEdit.revisionHistory.map(({ revision }) => revision), [1, 2])
assert.deepEqual(secondEdit.revisionHistory[1]?.blocks, [undoLearningBlock])
assert.equal(secondEdit.revisionHistory[1]?.schoolYearLabel, '2027/28')
assert.equal(secondEdit.revisionHistory[1]?.revisionChangedAt, '2026-08-02T10:00:00.000Z')

const undone = requirePlan(undoLastTeacherCoursePlanRevision(secondEdit, {
  changedOn: '2026-08-04',
  recordedAt: '2026-08-04T10:00:00.000Z',
}))
assert.equal(undone.revision, 4)
assert.equal(undone.revisionOrigin, 'undo')
assert.equal(undone.restoredFromRevision, 2)
assert.equal(undone.schoolYearLabel, '2027/28')
assert.deepEqual(undone.blocks, [undoLearningBlock])
assert.deepEqual(undone.revisionHistory.map(({ revision }) => revision), [1, 2, 3])
assert.deepEqual(undone.revisionHistory[2]?.blocks, [undoBufferBlock])
assert.notStrictEqual(undone.blocks[0], undone.revisionHistory[1]?.blocks[0])

// Undoing the undo restores the state that was current immediately before it.
const undoOfUndo = requirePlan(undoLastTeacherCoursePlanRevision(undone, {
  changedOn: '2026-08-05',
  recordedAt: '2026-08-05T10:00:00.000Z',
}))
assert.equal(undoOfUndo.revision, 5)
assert.equal(undoOfUndo.revisionOrigin, 'undo')
assert.equal(undoOfUndo.restoredFromRevision, 3)
assert.equal(undoOfUndo.schoolYearLabel, undefined)
assert.deepEqual(undoOfUndo.blocks, [undoBufferBlock])
assert.deepEqual(undoOfUndo.revisionHistory.map(({ revision }) => revision), [1, 2, 3, 4])

const blocks: TeacherCoursePlanBlock[] = [
  {
    id: 'learning-1',
    kind: 'learning',
    goalId: 'root',
    title: 'Mechanik',
    startDate: '2026-08-03',
    endDate: '2026-08-14',
  },
  {
    id: 'buffer-1',
    kind: 'buffer',
    title: 'Puffer',
    startDate: '2026-08-17',
    endDate: '2026-08-19',
  },
  {
    id: 'milestone-1',
    kind: 'milestone',
    title: 'Klausur',
    goalId: 'root',
    date: '2026-08-21',
  },
]
let pacedPlan = addBlocks(createPlan(), blocks)

// A Wednesday in a ten-workday block has three deterministic goals due.
const wednesday = evaluateTeacherCoursePlan(pacedPlan, fullGoalIndex, '2026-08-05')
assert(wednesday.metrics)
assert.equal(wednesday.metrics.expectedGoalEquivalent, 3)
assert.deepEqual(wednesday.metrics.dueGoalIds, ['g1', 'g2', 'g3'])
const learningOnWednesday = wednesday.blocks.find((block) => block.kind === 'learning')
assert(learningOnWednesday?.kind === 'learning')
assert.deepEqual(learningOnWednesday.dueGoalIds, ['g1', 'g2', 'g3'])
assert.equal(wednesday.quality.status, 'insufficient')
assert.equal(wednesday.metrics.coverageStatus, 'neutral')
assert.equal(wednesday.pacingGauge.reason, 'plan-revision-too-recent')

const eventDates = [
  '2026-08-04',
  '2026-08-05',
  '2026-08-07',
  '2026-08-10',
  '2026-08-11',
  '2026-08-12',
  '2026-08-13',
  '2026-08-14',
]
for (const [index, effectiveOn] of eventDates.entries()) {
  pacedPlan = requirePlan(appendCourseCoverageEvent(pacedPlan, {
    id: `event-${index + 1}`,
    goalId: `g${index + 1}`,
    action: 'covered',
    effectiveOn,
    recordedAt: `${effectiveOn}T12:00:00.000Z`,
  }))
}
pacedPlan = requirePlan(appendCourseCoverageAttestation(pacedPlan, {
  id: 'attestation-1',
  throughDate: '2026-08-14',
  recordedAt: '2026-08-14T18:00:00.000Z',
}))

// Current plan position and last-week speed are deliberately independent.
const evaluated = evaluateTeacherCoursePlan(pacedPlan, fullGoalIndex, '2026-08-14')
assert.equal(evaluated.quality.status, 'complete')
assert(evaluated.metrics)
assert.deepEqual(evaluated.metrics.dueGoalIds, atoms.map(({ id }) => id))
assert.equal(evaluated.metrics.plannedGoalCount, 10)
assert.equal(evaluated.metrics.expectedGoalEquivalent, 10)
assert.equal(evaluated.metrics.coveredGoalCount, 8)
assert.equal(evaluated.metrics.coverageStatus, 'behind')
assert.equal(evaluated.metrics.totalBufferWorkdays, 3)
assert.equal(evaluated.metrics.remainingBufferWorkdays, 3)
assert.deepEqual(evaluated.metrics.nextMilestone, {
  blockId: 'milestone-1',
  title: 'Klausur',
  goalId: 'root',
  date: '2026-08-21',
})
assert.deepEqual(evaluated.pacingGauge, {
  status: 'ready',
  asOf: '2026-08-14',
  windowStart: '2026-08-07',
  actualGoalsPerWeek: 5,
  expectedGoalsPerWeek: 5,
  ratio: 1,
  zone: 'green',
  reason: null,
})
assert.equal(isCourseGoalCovered(pacedPlan, 'g8', '2026-08-14'), true)

// A new append-only event invalidates the earlier attestation without deleting it.
const reopenedPlan = requirePlan(toggleCourseGoalCoverage(pacedPlan, {
  id: 'event-9',
  goalId: 'g8',
  effectiveOn: '2026-08-14',
  recordedAt: '2026-08-14T19:00:00.000Z',
}))
assert.equal(reopenedPlan.coverageAttestations.length, 1)
assert.equal(reopenedPlan.coverageEvents.at(-1)?.action, 'reopened')
assert.equal(isCourseGoalCovered(reopenedPlan, 'g8', '2026-08-14'), false)
const invalidatedAttestation = evaluateTeacherCoursePlan(reopenedPlan, fullGoalIndex, '2026-08-14')
assert.equal(invalidatedAttestation.quality.status, 'insufficient')
assert.equal(invalidatedAttestation.metrics?.coverageStatus, 'neutral')
assert.equal(invalidatedAttestation.pacingGauge.reason, 'coverage-not-attested')

// A stable, attested plan still keeps the gauge neutral without any coverage history.
let emptyHistoryPlan = addBlocks(createPlan('empty-history'), [blocks[0]!])
emptyHistoryPlan = requirePlan(appendCourseCoverageAttestation(emptyHistoryPlan, {
  id: 'empty-attestation',
  throughDate: '2026-08-14',
  recordedAt: '2026-08-14T18:00:00.000Z',
}))
const emptyHistory = evaluateTeacherCoursePlan(emptyHistoryPlan, fullGoalIndex, '2026-08-14')
assert.equal(emptyHistory.pacingGauge.reason, 'coverage-history-missing')
assert.equal(emptyHistory.quality.status, 'insufficient')

// A current attestation cannot make a recently revised plan's gauge look reliable.
let recentRevisionPlan = requirePlan(reviseTeacherCoursePlan(pacedPlan, {
  blocks,
  changedOn: '2026-08-10',
  recordedAt: '2026-08-14T19:30:00.000Z',
}))
recentRevisionPlan = requirePlan(appendCourseCoverageAttestation(recentRevisionPlan, {
  id: 'attestation-after-revision',
  throughDate: '2026-08-14',
  recordedAt: '2026-08-14T20:00:00.000Z',
}))
assert.equal(
  evaluateTeacherCoursePlan(recentRevisionPlan, fullGoalIndex, '2026-08-14').pacingGauge.reason,
  'plan-revision-too-recent',
)

// A weekend-only learning block is structurally valid but cannot create false metrics.
const weekendPlan = addBlocks(createPlan('weekend'), [{
  id: 'weekend-learning',
  kind: 'learning',
  goalId: 'root',
  startDate: '2026-08-01',
  endDate: '2026-08-02',
}])
const weekendEvaluation = evaluateTeacherCoursePlan(weekendPlan, fullGoalIndex, '2026-08-03')
assert.equal(weekendEvaluation.quality.status, 'invalid')
assert.equal(weekendEvaluation.metrics, null)

// Storage is schema-versioned, class-keyed, and never overwritten after corrupt input.
const stored = new Map<string, string>()
const storage: StorageWriter = {
  getItem: (key) => stored.get(key) ?? null,
  setItem: (key, value) => stored.set(key, value),
}
assert.equal(saveTeacherCoursePlan(pacedPlan, storage).ok, true)
const secondPlan = createPlan('math-gk')
assert.equal(saveTeacherCoursePlan(secondPlan, storage).ok, true)
const reloadedPhysicsPlan = loadTeacherCoursePlan('physics-lk', storage).plan
assert.equal(reloadedPhysicsPlan?.classId, 'physics-lk')
assert.deepEqual(reloadedPhysicsPlan?.revisionHistory.map(({ revision }) => revision), [1])
assert.equal(loadTeacherCoursePlan('math-gk', storage).plan?.classId, 'math-gk')
const persisted = JSON.parse([...stored.values()][0]!) as { schemaVersion: number; plansByClassId: unknown }
assert.equal(persisted.schemaVersion, 1)
assert.equal(Object.keys(persisted.plansByClassId as object).length, 2)

stored.set('skillpilot_teacher_course_plans_v1', '{broken')
const corruptBeforeWrite = stored.get('skillpilot_teacher_course_plans_v1')
assert.equal(saveTeacherCoursePlan(secondPlan, storage).ok, false)
assert.equal(stored.get('skillpilot_teacher_course_plans_v1'), corruptBeforeWrite)
assert.equal(parseTeacherCoursePlanStore('{broken').quality.status, 'invalid')

// Invalid histories are rejected as a whole, not silently repaired into plausible data.
const malformed = structuredClone(pacedPlan) as TeacherCoursePlan
malformed.coverageEvents[1]!.id = malformed.coverageEvents[0]!.id
assert.equal(normalizeTeacherCoursePlan(malformed).plan, null)
assert.equal(normalizeTeacherCoursePlan(malformed).quality.status, 'invalid')

const missingHistory = structuredClone(pacedPlan) as TeacherCoursePlan
delete (missingHistory as unknown as Record<string, unknown>).revisionHistory
assert.equal(normalizeTeacherCoursePlan(missingHistory).plan, null)
const rewrittenHistory = structuredClone(secondEdit)
rewrittenHistory.revisionHistory[1]!.revision = 1
assert.equal(normalizeTeacherCoursePlan(rewrittenHistory).plan, null)

// The history limit fails closed: no oldest snapshot is silently discarded.
let boundedPlan = createPlan('bounded-history')
for (let index = 0; index < TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY; index += 1) {
  const changedOn = addCoursePlanDays('2026-08-02', index)
  assert(changedOn)
  boundedPlan = requirePlan(reviseTeacherCoursePlan(boundedPlan, {
    changedOn,
    recordedAt: `${changedOn}T10:00:00.000Z`,
  }))
}
assert.equal(boundedPlan.revisionHistory.length, TEACHER_COURSE_PLAN_MAX_REVISION_HISTORY)
const serializedBoundedHistory = JSON.stringify(boundedPlan.revisionHistory)
assert.equal(reviseTeacherCoursePlan(boundedPlan, {
  changedOn: '2027-05-01',
  recordedAt: '2027-05-01T10:00:00.000Z',
}), null)
assert.equal(undoLastTeacherCoursePlanRevision(boundedPlan, {
  changedOn: '2027-05-01',
  recordedAt: '2027-05-01T10:00:00.000Z',
}), null)
assert.equal(JSON.stringify(boundedPlan.revisionHistory), serializedBoundedHistory)

console.log('Local teacher course-plan tests passed.')
