import assert from 'node:assert/strict'
import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { TrainerClassCurriculumConfig } from '../trainerTypes'
import { TEACHER_COURSE_PLAN_STORAGE_KEY } from '../coursePlanTypes'
import { migrateTrainerClassSession } from './trainerLandscapeContext'
import {
  buildExistingLearnerClassSession,
  getExistingLearnerSubjectIds,
  isExistingLearnerClassSession,
  isExistingLearnerSessionDisabled,
  isLegacyLinkedSupervisionSession,
  LEGACY_TEACHER_PENDING_STORAGE_KEY,
  LEGACY_TEACHER_WORKSPACE_STORAGE_KEY,
  parseExistingLearnerPersonalConfig,
  removeLegacyTeacherSupervisionSessions,
  removeUnsupportedTeacherSessions,
  removeUnsupportedTeacherSessionsFromBrowserStorage,
  selectExistingLearnerSubject,
} from './existingLearnerClass'

const landscapes = [
  { meta: { landscapeId: 'ROOT', subject: 'Schule' }, goals: [] },
  { meta: { landscapeId: 'MATH', subject: 'Mathematik' }, goals: [] },
  { meta: { landscapeId: 'PHYSICS', subject: 'Physik' }, goals: [] },
] as unknown as LandscapeEntry[]

const personalConfig: TrainerClassCurriculumConfig = {
  ROOT: { selected: true, filterId: 'DE-HE', stage: 'sek2' },
  PHYSICS: { selected: true, filterId: 'LK' },
  MATH: { selected: true, filterId: 'LK' },
  UNKNOWN: { selected: true },
}

assert.deepEqual(
  parseExistingLearnerPersonalConfig(JSON.stringify(personalConfig)),
  personalConfig,
)
assert.deepEqual(
  parseExistingLearnerPersonalConfig(JSON.stringify({ personalCurriculum: personalConfig })),
  personalConfig,
)
assert.deepEqual(
  getExistingLearnerSubjectIds(personalConfig, landscapes, 'ROOT'),
  ['MATH', 'PHYSICS'],
  'subjects follow the runtime catalog and exclude the root and unknown entries',
)

const created = buildExistingLearnerClassSession({
  className: ' Einzelbetreuung ',
  learnerAlias: ' Alex ',
  profile: {
    skillpilotId: 'sp_existing_learner',
    personalCurriculum: JSON.stringify(personalConfig),
  },
  landscapes,
  rootLandscapeId: 'ROOT',
})
assert.equal(created.name, 'Einzelbetreuung')
assert.equal(created.landscapeId, 'MATH')
assert.equal(created.activeFilter, 'DE-HE')
assert.equal(created.rootLandscapeId, 'ROOT')
assert.equal(created.students.length, 1)
assert.deepEqual(created.students[0], {
  id: 'sp_existing_learner',
  name: 'Alex',
  accessMode: 'learner-id',
})
assert.equal(created.source, 'existing-learner')
assert.ok(isExistingLearnerClassSession(created))

const physics = selectExistingLearnerSubject(created, 'PHYSICS', landscapes)
assert.equal(physics.landscapeId, 'PHYSICS')
assert.equal(physics.currentGoalId, undefined)
assert.deepEqual(physics.personalConfig, personalConfig)
assert.equal(selectExistingLearnerSubject(physics, 'UNKNOWN', landscapes), physics)

assert.throws(
  () => parseExistingLearnerPersonalConfig('{not-json'),
  /invalid-personal-curriculum/u,
)
assert.throws(
  () => buildExistingLearnerClassSession({
    className: 'Leer',
    learnerAlias: 'Alex',
    profile: {
      skillpilotId: 'sp_empty',
      personalCurriculum: JSON.stringify({ ROOT: { selected: true } }),
    },
    landscapes,
    rootLandscapeId: 'ROOT',
  }),
  /missing-personalized-subjects/u,
)

const legacy = {
  id: 'legacy-class',
  source: 'linked-supervision',
  students: [{ id: 'opaque-membership', name: 'Alt', accessMode: 'teacher-membership' }],
  linkedSupervision: { workspaceId: 'w', courseId: 'c', memberId: 'm' },
}
assert.ok(isLegacyLinkedSupervisionSession(legacy))
assert.equal(isLegacyLinkedSupervisionSession(created), false)

const storage = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
  },
})
storage.set(LEGACY_TEACHER_WORKSPACE_STORAGE_KEY, 'secret')
storage.set(LEGACY_TEACHER_PENDING_STORAGE_KEY, 'pending')
storage.set('skillpilot_active_class', 'legacy-class')
storage.set(TEACHER_COURSE_PLAN_STORAGE_KEY, JSON.stringify({
  schemaVersion: 1,
  plansByClassId: {
    'legacy-class': { classId: 'legacy-class' },
    'legacy-class:MATH': { classId: 'legacy-class:MATH' },
    'current-class': { classId: 'current-class' },
  },
}))
storage.set('skillpilot_classes', JSON.stringify([
  legacy,
  created,
]))

const retainedClasses = removeLegacyTeacherSupervisionSessions([legacy, created])
assert.deepEqual(retainedClasses, [created])
assert.equal(storage.has(LEGACY_TEACHER_WORKSPACE_STORAGE_KEY), false)
assert.equal(storage.has(LEGACY_TEACHER_PENDING_STORAGE_KEY), false)
assert.equal(storage.has('skillpilot_active_class'), false)
assert.deepEqual(
  Object.keys(JSON.parse(storage.get(TEACHER_COURSE_PLAN_STORAGE_KEY)!).plansByClassId),
  ['current-class'],
)

const generated = {
  ...created,
  id: 'generated-class',
  students: [{ id: 'generated-learner', name: 'Neu' }],
  source: 'local-generated' as const,
}
assert.equal(isExistingLearnerSessionDisabled(created, false), true)
assert.equal(isExistingLearnerSessionDisabled(created, true), false)
storage.set(LEGACY_TEACHER_WORKSPACE_STORAGE_KEY, 'secret-again')
storage.set(LEGACY_TEACHER_PENDING_STORAGE_KEY, 'pending-again')
storage.set('skillpilot_active_class', created.id)
storage.set(TEACHER_COURSE_PLAN_STORAGE_KEY, JSON.stringify({
  schemaVersion: 1,
  plansByClassId: {
    [created.id]: { classId: created.id },
    [`${created.id}:MATH`]: { classId: `${created.id}:MATH` },
    [legacy.id]: { classId: legacy.id },
    [generated.id]: { classId: generated.id },
  },
}))

const retainedWhenDirectLinkingIsDisabled = removeUnsupportedTeacherSessions(
  [legacy, created, generated],
  false,
)
assert.deepEqual(retainedWhenDirectLinkingIsDisabled, [generated])
assert.equal(storage.has(LEGACY_TEACHER_WORKSPACE_STORAGE_KEY), false)
assert.equal(storage.has(LEGACY_TEACHER_PENDING_STORAGE_KEY), false)
assert.equal(storage.has('skillpilot_active_class'), false)
assert.deepEqual(
  Object.keys(JSON.parse(storage.get(TEACHER_COURSE_PLAN_STORAGE_KEY)!).plansByClassId),
  [generated.id],
  'disabled package-consumer cleanup keeps ordinary local classes only',
)

storage.set('skillpilot_classes', JSON.stringify([legacy, null]))
const retainedBeforeFailingMigration = removeUnsupportedTeacherSessionsFromBrowserStorage(
  [legacy, null],
  true,
)
assert.deepEqual(retainedBeforeFailingMigration, [null])
assert.throws(
  () => retainedBeforeFailingMigration.map((session) => migrateTrainerClassSession(
    session as unknown as Parameters<typeof migrateTrainerClassSession>[0],
  )),
  TypeError,
)
assert.deepEqual(
  JSON.parse(storage.get('skillpilot_classes')!),
  [null],
  'legacy cards are durably removed before a later migration failure',
)

storage.set(TEACHER_COURSE_PLAN_STORAGE_KEY, '{not-json')
removeUnsupportedTeacherSessions([], true)
assert.equal(
  storage.has(TEACHER_COURSE_PLAN_STORAGE_KEY),
  false,
  'malformed course-plan storage is removed fail-closed',
)
storage.set(TEACHER_COURSE_PLAN_STORAGE_KEY, JSON.stringify({
  schemaVersion: 999,
  plansByClassId: { legacy: { classId: 'legacy' } },
}))
removeUnsupportedTeacherSessions([], true)
assert.equal(
  storage.has(TEACHER_COURSE_PLAN_STORAGE_KEY),
  false,
  'schema-drifted course-plan storage is removed fail-closed',
)

console.log('existing learner class tests passed')
