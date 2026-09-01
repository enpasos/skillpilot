import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import { mapLegacyGymnasiumLandscapeIdToCanonical } from './trainerLandscapeContext'

type Role = 'learner' | 'trainer' | 'explorer'

export const normalizeLearnerLandscapeId = (landscapeId?: string | null) =>
  mapLegacyGymnasiumLandscapeIdToCanonical(landscapeId)

export const getStoredLandscapeIdForRole = (role: Role | null | undefined) => {
  if (typeof window === 'undefined') return ''
  try {
    if (role === 'trainer') {
      // Trainer scope belongs to the opened ClassSession. Keeping a separate
      // browser-global curriculum would silently put one course in front of
      // all others again, so retire the legacy key even on direct /trainer
      // entry (where SessionSetup is not mounted).
      window.localStorage.removeItem('skillpilot_trainer_landscape')
      return ''
    }
    if (role === 'learner') {
      const stored = window.localStorage.getItem('skillpilot_learner_landscape') || ''
      const normalized = normalizeLearnerLandscapeId(stored)
      if (stored && normalized !== stored) {
        window.localStorage.setItem('skillpilot_learner_landscape', normalized)
      }
      return normalized
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

  return normalizeLearnerLandscapeId(selectedCurriculum)
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
