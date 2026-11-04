import type { LandscapeEntry } from '../hooks/useLandscapes'
import type {
  ClassSession,
  TrainerClassCurriculumConfig,
  TrainerClassCurriculumConfigEntry,
} from '../trainerTypes'
import {
  TEACHER_COURSE_PLAN_SCHEMA_VERSION,
  TEACHER_COURSE_PLAN_STORAGE_KEY,
} from '../coursePlanTypes'
import { sanitizeSkillpilotId } from './skillpilotId'

const apiBase = (import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/u, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

export const EXISTING_LEARNER_LINKING_ENABLED =
  import.meta.env?.VITE_EXISTING_LEARNER_LINKING_ENABLED === 'true'

export const LEGACY_TEACHER_WORKSPACE_STORAGE_KEY = 'skillpilot_teacher_workspace_v1'
export const LEGACY_TEACHER_PENDING_STORAGE_KEY = 'skillpilot_teacher_pending_supervision_v1'

export interface ExistingLearnerProfile {
  skillpilotId: string
  selectedCurriculum?: string
  personalCurriculum: string
}

const isInternalPersonalCurriculumEntry = (landscapeId: string): boolean => (
  landscapeId.startsWith('__skillpilot_')
)

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const normalizeConfigEntry = (value: unknown): TrainerClassCurriculumConfigEntry | null => {
  if (!isRecord(value) || typeof value.selected !== 'boolean') return null
  const optionalString = (key: string) => typeof value[key] === 'string' && value[key].trim()
    ? value[key].trim()
    : undefined
  return {
    selected: value.selected,
    ...(optionalString('filterId') ? { filterId: optionalString('filterId') } : {}),
    ...(optionalString('durationModel') ? { durationModel: optionalString('durationModel') } : {}),
    ...(optionalString('stage') ? { stage: optionalString('stage') } : {}),
  }
}

export const parseExistingLearnerPersonalConfig = (value: string): TrainerClassCurriculumConfig => {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('invalid-personal-curriculum')
  }
  if (!isRecord(parsed)) throw new Error('invalid-personal-curriculum')

  const nested = parsed.personalCurriculum
  const rawConfig = isRecord(nested) ? nested : parsed
  const config: TrainerClassCurriculumConfig = {}
  for (const [landscapeId, rawEntry] of Object.entries(rawConfig)) {
    if (
      !landscapeId.trim()
      || landscapeId === '__proto__'
      || landscapeId === 'prototype'
      || landscapeId === 'constructor'
    ) continue
    const entry = normalizeConfigEntry(rawEntry)
    if (entry) config[landscapeId] = entry
  }
  return config
}

export const getExistingLearnerSubjectIds = (
  personalConfig: TrainerClassCurriculumConfig,
  landscapes: LandscapeEntry[] = [],
  rootLandscapeId?: string,
) => {
  const configuredSubjectIds = Object.keys(personalConfig).filter((landscapeId) => (
    landscapeId !== rootLandscapeId
    && !isInternalPersonalCurriculumEntry(landscapeId)
    && personalConfig[landscapeId]?.selected === true
  ))
  if (landscapes.length === 0) {
    if (configuredSubjectIds.length > 0) return configuredSubjectIds
    return rootLandscapeId && personalConfig[rootLandscapeId]?.selected === true
      ? [rootLandscapeId]
      : []
  }

  const knownLandscapeIds = new Set(
    landscapes.map((entry) => entry.meta.landscapeId),
  )
  const knownConfiguredSubjectIds = landscapes
    .map((entry) => entry.meta.landscapeId)
    .filter((landscapeId) => (
      configuredSubjectIds.includes(landscapeId)
      && knownLandscapeIds.has(landscapeId)
    ))
  if (configuredSubjectIds.length > 0) {
    return knownConfiguredSubjectIds.length === configuredSubjectIds.length
      ? knownConfiguredSubjectIds
      : []
  }

  return rootLandscapeId
    && knownLandscapeIds.has(rootLandscapeId)
    && personalConfig[rootLandscapeId]?.selected === true
    ? [rootLandscapeId]
    : []
}

export const resolveExistingLearnerRootLandscapeId = (input: {
  profile: ExistingLearnerProfile
  personalConfig: TrainerClassCurriculumConfig
  existingRootLandscapeId?: string
  fallbackRootLandscapeId?: string
  availableRootLandscapeIds?: readonly string[]
}): string => {
  const selectedConfigIds = Object.keys(input.personalConfig).filter((landscapeId) => (
    !isInternalPersonalCurriculumEntry(landscapeId)
    && input.personalConfig[landscapeId]?.selected === true
  ))
  const candidates = [
    input.existingRootLandscapeId,
    input.fallbackRootLandscapeId,
  ]
    .map((landscapeId) => landscapeId?.trim() ?? '')
    .filter(Boolean)

  const explicitCandidate = candidates.find((landscapeId) => (
    input.personalConfig[landscapeId]?.selected === true
  ))
  if (explicitCandidate) return explicitCandidate

  const selectedAvailableRoots = (input.availableRootLandscapeIds ?? []).filter(
    (landscapeId) => input.personalConfig[landscapeId]?.selected === true,
  )
  if (selectedAvailableRoots.length === 1) return selectedAvailableRoots[0]

  const profileCurriculumId = input.profile.selectedCurriculum?.trim() ?? ''
  if (
    profileCurriculumId
    && input.personalConfig[profileCurriculumId]?.selected === true
    && (
      (input.availableRootLandscapeIds?.length ?? 0) === 0
      || input.availableRootLandscapeIds?.includes(profileCurriculumId)
    )
  ) {
    return profileCurriculumId
  }

  // A single selected landscape is a valid flat curriculum with no separate
  // subject module. Multiple selected IDs without a declared root are
  // ambiguous and must not be guessed from their order or labels.
  if (selectedConfigIds.length === 1) return selectedConfigIds[0]
  throw new Error('invalid-personal-curriculum')
}

const activeFilterFor = (
  personalConfig: TrainerClassCurriculumConfig,
  landscapeId: string,
  rootLandscapeId?: string,
) => {
  const rootFilter = rootLandscapeId ? personalConfig[rootLandscapeId]?.filterId?.trim() : ''
  if (rootFilter && rootFilter.toLowerCase() !== 'all') return rootFilter
  const subjectFilter = personalConfig[landscapeId]?.filterId?.trim()
  return subjectFilter && subjectFilter.toLowerCase() !== 'all' ? subjectFilter : 'all'
}

const normalizeProfile = (value: unknown, expectedId: string): ExistingLearnerProfile => {
  if (!isRecord(value)) throw new Error('invalid-learner-profile')
  const skillpilotId = typeof value.skillpilotId === 'string'
    ? sanitizeSkillpilotId(value.skillpilotId)
    : ''
  if (!skillpilotId || skillpilotId !== expectedId) throw new Error('invalid-learner-profile')
  if (typeof value.personalCurriculum !== 'string' || !value.personalCurriculum.trim()) {
    throw new Error('missing-personal-curriculum')
  }
  return {
    skillpilotId,
    selectedCurriculum: typeof value.selectedCurriculum === 'string'
      ? value.selectedCurriculum.trim()
      : undefined,
    personalCurriculum: value.personalCurriculum,
  }
}

export const fetchExistingLearnerProfile = async (
  skillpilotId: string,
  signal?: AbortSignal,
): Promise<ExistingLearnerProfile> => {
  const normalizedId = sanitizeSkillpilotId(skillpilotId)
  if (!normalizedId) throw new Error('missing-skillpilot-id')
  const response = await fetch(
    toApi(`/api/ui/learners/${encodeURIComponent(normalizedId)}`),
    { signal, cache: 'no-store' },
  )
  if (response.status === 404) throw new Error('learner-not-found')
  if (!response.ok) throw new Error('learner-profile-unavailable')
  return normalizeProfile(await response.json() as unknown, normalizedId)
}

export const buildExistingLearnerClassSession = (input: {
  className: string
  learnerAlias: string
  profile: ExistingLearnerProfile
  landscapes: LandscapeEntry[]
  rootLandscapeId?: string
  existing?: ClassSession
}): ClassSession => {
  const personalConfig = parseExistingLearnerPersonalConfig(input.profile.personalCurriculum)
  const subjectIds = getExistingLearnerSubjectIds(personalConfig, input.landscapes, input.rootLandscapeId)
  if (subjectIds.length === 0) throw new Error('missing-personalized-subjects')

  const activeLandscapeId = subjectIds.includes(input.existing?.landscapeId ?? '')
    ? input.existing!.landscapeId
    : subjectIds[0]
  const rootIsSelected = input.rootLandscapeId
    ? personalConfig[input.rootLandscapeId]?.selected === true
    : false

  return {
    id: input.existing?.id ?? crypto.randomUUID(),
    name: input.className.trim(),
    landscapeId: activeLandscapeId,
    activeFilter: activeFilterFor(personalConfig, activeLandscapeId, input.rootLandscapeId),
    personalConfig,
    ...(rootIsSelected ? { rootLandscapeId: input.rootLandscapeId } : {}),
    students: [{
      id: input.profile.skillpilotId,
      name: input.learnerAlias.trim(),
      accessMode: 'learner-id',
    }],
    currentGoalId: input.existing?.landscapeId === activeLandscapeId
      ? input.existing.currentGoalId
      : undefined,
    source: 'existing-learner',
  }
}

export const isExistingLearnerClassSession = (
  session: ClassSession | null | undefined,
): session is ClassSession & { source: 'existing-learner' } => (
  session?.source === 'existing-learner'
  && session.students.length === 1
)

export const isLegacyLinkedSupervisionSession = (
  session: unknown,
): boolean => {
  if (!isRecord(session)) return false
  if (session.source === 'linked-supervision' || session.linkedSupervision !== undefined) return true
  return Array.isArray(session.students) && session.students.some((student) => (
    isRecord(student) && student.accessMode === 'teacher-membership'
  ))
}

export const isExistingLearnerSessionDisabled = (
  session: unknown,
  existingLearnerLinkingEnabled = EXISTING_LEARNER_LINKING_ENABLED,
): boolean => (
  !existingLearnerLinkingEnabled
  && isRecord(session)
  && session.source === 'existing-learner'
)

export const removeUnsupportedTeacherSessions = (
  sessions: unknown[],
  existingLearnerLinkingEnabled = EXISTING_LEARNER_LINKING_ENABLED,
): unknown[] => {
  const shouldRemove = (session: unknown) => (
    isLegacyLinkedSupervisionSession(session)
    || isExistingLearnerSessionDisabled(session, existingLearnerLinkingEnabled)
  )
  const removedClassIds = sessions
    .filter(shouldRemove)
    .map((session) => (
      isRecord(session) && typeof session.id === 'string' ? session.id : ''
    ))
    .filter(Boolean)
  clearLegacyTeacherSupervisionBrowserCredentials(removedClassIds)
  return sessions.filter((session) => !shouldRemove(session))
}

export const removeUnsupportedTeacherSessionsFromBrowserStorage = (
  sessions: unknown[],
  existingLearnerLinkingEnabled = EXISTING_LEARNER_LINKING_ENABLED,
): unknown[] => {
  const retained = removeUnsupportedTeacherSessions(sessions, existingLearnerLinkingEnabled)
  if (JSON.stringify(retained) !== JSON.stringify(sessions)) {
    localStorage.setItem('skillpilot_classes', JSON.stringify(retained))
  }
  return retained
}

export const removeLegacyTeacherSupervisionSessions = (sessions: unknown[]): unknown[] => (
  removeUnsupportedTeacherSessions(sessions, true)
)

export const selectExistingLearnerSubject = (
  session: ClassSession,
  landscapeId: string,
  landscapes: LandscapeEntry[],
): ClassSession => {
  if (!isExistingLearnerClassSession(session) || !session.personalConfig) return session
  const subjectIds = getExistingLearnerSubjectIds(session.personalConfig, landscapes, session.rootLandscapeId)
  if (!subjectIds.includes(landscapeId) || landscapeId === session.landscapeId) return session
  return {
    ...session,
    landscapeId,
    activeFilter: activeFilterFor(session.personalConfig, landscapeId, session.rootLandscapeId),
    currentGoalId: undefined,
  }
}

export const clearLegacyTeacherSupervisionBrowserCredentials = (legacyClassIds: string[] = []) => {
  try {
    localStorage.removeItem(LEGACY_TEACHER_WORKSPACE_STORAGE_KEY)
    localStorage.removeItem(LEGACY_TEACHER_PENDING_STORAGE_KEY)

    const legacyIds = new Set(legacyClassIds.map((id) => id.trim()).filter(Boolean))
    const activeClassId = localStorage.getItem('skillpilot_active_class')
    if (activeClassId && legacyIds.has(activeClassId)) {
      localStorage.removeItem('skillpilot_active_class')
    }

    const rawCoursePlans = localStorage.getItem(TEACHER_COURSE_PLAN_STORAGE_KEY)
    if (!rawCoursePlans) return
    let parsedCoursePlans: unknown
    try {
      parsedCoursePlans = JSON.parse(rawCoursePlans)
    } catch {
      localStorage.removeItem(TEACHER_COURSE_PLAN_STORAGE_KEY)
      return
    }
    if (
      !isRecord(parsedCoursePlans)
      || parsedCoursePlans.schemaVersion !== TEACHER_COURSE_PLAN_SCHEMA_VERSION
      || !isRecord(parsedCoursePlans.plansByClassId)
    ) {
      localStorage.removeItem(TEACHER_COURSE_PLAN_STORAGE_KEY)
      return
    }
    if (legacyIds.size === 0) return

    const retainedPlans = Object.fromEntries(
      Object.entries(parsedCoursePlans.plansByClassId).filter(([storedClassId]) => (
        !Array.from(legacyIds).some((legacyId) => (
          storedClassId === legacyId || storedClassId.startsWith(`${legacyId}:`)
        ))
      )),
    )
    if (Object.keys(retainedPlans).length !== Object.keys(parsedCoursePlans.plansByClassId).length) {
      localStorage.setItem(TEACHER_COURSE_PLAN_STORAGE_KEY, JSON.stringify({
        ...parsedCoursePlans,
        plansByClassId: retainedPlans,
      }))
    }
  } catch {
    // Unavailable browser storage must not prevent the trainer from opening.
  }
}
