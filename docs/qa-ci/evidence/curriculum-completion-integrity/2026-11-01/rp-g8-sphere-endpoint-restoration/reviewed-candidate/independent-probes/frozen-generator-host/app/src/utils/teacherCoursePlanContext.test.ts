import assert from 'node:assert/strict'

import type { ClassSession } from '../trainerTypes'
import {
  getTeacherCoursePlanStorageId,
  teacherCoursePlanStoragePrefixForClass,
} from './teacherCoursePlanContext'
import { GLOBAL_STAGE_SCOPE_CONFIG_IDS } from './personalCurriculumStageScope'
import { berlinDateKey } from './learnerLearningPlanReadModel'

const base: ClassSession = {
  id: 'class-a',
  name: 'Physics',
  rootLandscapeId: 'school-root',
  landscapeId: 'physics',
  activeFilter: 'LK',
  personalConfig: {
    'school-root': { selected: true, filterId: 'DE-HE', stage: 'SekII' },
    physics: { selected: true, filterId: 'LK', durationModel: 'G9' },
    mathematics: { selected: true, filterId: 'GK', durationModel: 'G9' },
    [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]: { selected: false },
    [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]: { selected: true },
  },
  students: [],
}

const id = getTeacherCoursePlanStorageId(base)
assert.match(id, /^teacher-course-plan-v2:[0-9a-f]{32}:[0-9a-f]{32}$/u)
assert.equal(
  getTeacherCoursePlanStorageId({
    ...base,
    personalConfig: Object.fromEntries(Object.entries(base.personalConfig ?? {}).reverse()),
  }),
  id,
  'object insertion order does not affect the plan context',
)
assert.equal(
  getTeacherCoursePlanStorageId({
    ...base,
    personalConfig: {
      ...base.personalConfig,
      mathematics: { selected: true, filterId: 'LK', durationModel: 'G8' },
    },
  }),
  id,
  'an unrelated personalized subject does not hide the active subject plan',
)

for (const [label, changed] of [
  ['class', { ...base, id: 'class-b' }],
  ['root', { ...base, rootLandscapeId: 'other-root' }],
  ['subject', { ...base, landscapeId: 'mathematics' }],
  ['active filter', { ...base, activeFilter: 'GK' }],
  ['stage', {
    ...base,
    personalConfig: {
      ...base.personalConfig,
      'school-root': { selected: true, filterId: 'DE-HE', stage: 'SekI' },
    },
  }],
  ['profile', {
    ...base,
    personalConfig: {
      ...base.personalConfig,
      physics: { selected: true, filterId: 'GK', durationModel: 'G9' },
    },
  }],
  ['duration', {
    ...base,
    personalConfig: {
      ...base.personalConfig,
      physics: { selected: true, filterId: 'LK', durationModel: 'G8' },
    },
  }],
] as const) {
  assert.notEqual(getTeacherCoursePlanStorageId(changed), id, `${label} changes the plan context`)
}

assert.notEqual(
  teacherCoursePlanStoragePrefixForClass('class-a'),
  teacherCoursePlanStoragePrefixForClass('class-b'),
  'class cleanup prefixes are isolated',
)
assert.equal(
  berlinDateKey(Date.parse('2026-03-28T23:30:00.000Z')),
  '2026-03-29',
  'teacher planning uses the Europe/Berlin date across a UTC date boundary',
)
assert.equal(
  berlinDateKey(Date.parse('2026-03-29T22:30:00.000Z')),
  '2026-03-30',
  'teacher planning keeps the Europe/Berlin date after the daylight-saving transition',
)

console.log('Teacher course-plan context tests passed.')
