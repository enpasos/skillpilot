import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import { normalizeTrainerLandscapeId } from './trainerLandscapeContext'

type Role = 'learner' | 'trainer' | 'explorer'

export const getStoredLandscapeIdForRole = (role: Role | null | undefined) => {
  if (typeof window === 'undefined') return ''
  try {
    if (role === 'trainer') {
      return normalizeTrainerLandscapeId(window.localStorage.getItem('skillpilot_trainer_landscape'))
    }
    if (role === 'learner') {
      return window.localStorage.getItem('skillpilot_learner_landscape') || ''
    }
  } catch {
    return ''
  }
  return ''
}

export const getLearnerSelectedLandscapeId = (data: Record<string, unknown>) => {
  const selectedCurriculum = typeof data.selectedCurriculum === 'string' ? data.selectedCurriculum : ''
  const personalCurriculum = typeof data.personalCurriculum === 'string' ? data.personalCurriculum : ''

  if (personalCurriculum) {
    try {
      const parsed = JSON.parse(personalCurriculum) as Record<string, unknown>
      const rootConfig = parsed[CANONICAL_GYMNASIUM_ROOT_ID]
      if (
        rootConfig &&
        typeof rootConfig === 'object' &&
        !Array.isArray(rootConfig) &&
        (rootConfig as { selected?: unknown }).selected === true
      ) {
        return CANONICAL_GYMNASIUM_ROOT_ID
      }
    } catch {
      // Fall back to selectedCurriculum below.
    }
  }

  return selectedCurriculum
}

export const getLearnerPathToken = (pathname: string) => {
  const match = /^\/learner\/([^/]+)\/?$/.exec(pathname)
  if (!match?.[1]) return ''
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}
