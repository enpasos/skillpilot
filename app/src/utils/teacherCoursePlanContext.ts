import type { ClassSession, TrainerClassCurriculumConfigEntry } from '../trainerTypes'
import { GLOBAL_STAGE_SCOPE_CONFIG_IDS } from './personalCurriculumStageScope'

const STORAGE_ID_VERSION = 'teacher-course-plan-v2'
const FNV_64_PRIME = 0x100000001b3n
const FNV_64_MASK = 0xffffffffffffffffn
const FNV_64_OFFSET_A = 0xcbf29ce484222325n
const FNV_64_OFFSET_B = 0x84222325cbf29ce4n

const normalizeText = (value: string | undefined) => value?.trim() ?? ''

const normalizedConfigEntry = (
  entry: TrainerClassCurriculumConfigEntry | undefined,
) => ({
  selected: entry?.selected === true,
  filterId: normalizeText(entry?.filterId),
  durationModel: normalizeText(entry?.durationModel),
  stage: normalizeText(entry?.stage),
})

const fnv1a64 = (value: string, offset: bigint) => {
  let hash = offset
  for (const byte of new TextEncoder().encode(value)) {
    hash ^= BigInt(byte)
    hash = (hash * FNV_64_PRIME) & FNV_64_MASK
  }
  return hash.toString(16).padStart(16, '0')
}

const stableDigest = (value: string) => (
  `${fnv1a64(value, FNV_64_OFFSET_A)}${fnv1a64(value, FNV_64_OFFSET_B)}`
)

const normalizedClassId = (classId: string) => classId.trim()

export const teacherCoursePlanStoragePrefixForClass = (classId: string) => {
  const normalized = normalizedClassId(classId)
  return normalized
    ? `${STORAGE_ID_VERSION}:${stableDigest(normalized)}:`
    : ''
}

/**
 * A local course plan belongs to one exact Level-2 course context. Unrelated
 * personalized subjects intentionally do not participate in the digest, so a
 * change to Physics cannot hide the current Mathematics plan (and vice versa).
 */
export const getTeacherCoursePlanStorageId = (session: ClassSession) => {
  const classPrefix = teacherCoursePlanStoragePrefixForClass(session.id)
  if (!classPrefix) return ''

  const rootLandscapeId = normalizeText(session.rootLandscapeId || session.landscapeId)
  const landscapeId = normalizeText(session.landscapeId)
  const relevantConfigIds = [...new Set([
    rootLandscapeId,
    landscapeId,
    GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1,
    GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2,
  ].filter(Boolean))].sort()
  const config = Object.fromEntries(relevantConfigIds.map((configId) => [
    configId,
    normalizedConfigEntry(session.personalConfig?.[configId]),
  ]))
  const context = JSON.stringify({
    version: 1,
    rootLandscapeId,
    landscapeId,
    activeFilter: normalizeText(session.activeFilter),
    config,
  })
  return `${classPrefix}${stableDigest(context)}`
}

export const getLegacyTeacherCoursePlanStorageIds = (session: ClassSession) => (
  [...new Set([
    normalizedClassId(session.id),
    `${normalizedClassId(session.id)}:${normalizeText(session.landscapeId)}`,
    ...Object.keys(session.personalConfig ?? {}).map(
      (landscapeId) => `${normalizedClassId(session.id)}:${normalizeText(landscapeId)}`,
    ),
  ].filter(Boolean))]
)
