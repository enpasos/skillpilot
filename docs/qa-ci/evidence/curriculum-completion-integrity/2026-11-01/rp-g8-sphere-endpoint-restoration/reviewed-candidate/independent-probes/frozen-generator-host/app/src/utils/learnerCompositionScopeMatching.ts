export const LEARNER_COMPOSITION_SCOPE_DIMENSIONS = [
  'schoolForm',
  'jurisdiction',
  'stage',
  'durationModel',
  'courseProfile',
] as const

type LearnerCompositionScopeDimension =
  (typeof LEARNER_COMPOSITION_SCOPE_DIMENSIONS)[number]

export type LearnerCompositionScope = Readonly<
  Partial<Record<LearnerCompositionScopeDimension, string>>
>

export interface LearnerCompositionScopeMatch {
  scopeSize: number
  courseFallbackCount: number
  coursePreferenceRank: number
}

const learnerCompositionScopeDimensions = new Set<string>(
  LEARNER_COMPOSITION_SCOPE_DIMENSIONS,
)

const normalizeToken = (value?: string): string =>
  value?.trim().toUpperCase() ?? ''

export const normalizeLearnerCompositionScope = (
  rawScope?: Readonly<Record<string, unknown>> | null,
): Record<string, string> => Object.fromEntries(
  Object.entries(rawScope ?? {})
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([dimension, value]) => [dimension, (value as string).trim()]),
)

export const isConstrainedLearnerCompositionScope = (
  rawScope?: Readonly<Record<string, unknown>> | null,
): boolean => {
  const scope = normalizeLearnerCompositionScope(rawScope)
  return Object.keys(scope).every((dimension) =>
    learnerCompositionScopeDimensions.has(dimension)
  )
    && normalizeToken(scope.schoolForm).length > 0
    && normalizeToken(scope.stage).length > 0
    && normalizeToken(scope.jurisdiction) !== 'ALL'
}

export const isCombinedLearnerCourseProfile = (
  rawScope?: Readonly<Record<string, unknown>> | null,
): boolean => {
  const requestedCourseProfile = normalizeToken(
    normalizeLearnerCompositionScope(rawScope).courseProfile,
  )
  return requestedCourseProfile === 'ALL' || requestedCourseProfile === 'GK+LK'
}

/**
 * Scores one reviewed authored scope against a committed learner scope.
 *
 * Authored scopes may deliberately omit non-anchor dimensions, for example a
 * duration-neutral Sek-II view. School form and stage are different: both are
 * required and must match exactly. Unknown requested dimensions fail closed.
 */
export const scoreLearnerCompositionScope = (
  rawAuthoredScope: Readonly<Record<string, unknown>>,
  rawRequestedScope: Readonly<Record<string, unknown>>,
): LearnerCompositionScopeMatch | null => {
  const authoredScope = normalizeLearnerCompositionScope(rawAuthoredScope)
  const requestedScope = normalizeLearnerCompositionScope(rawRequestedScope)
  if (!isConstrainedLearnerCompositionScope(requestedScope)) {
    return null
  }
  if (
    normalizeToken(authoredScope.schoolForm) !== normalizeToken(requestedScope.schoolForm)
    || normalizeToken(authoredScope.stage) !== normalizeToken(requestedScope.stage)
  ) {
    return null
  }

  let courseFallbackCount = 0
  let coursePreferenceRank = 0
  const requestedCourseProfile = normalizeToken(requestedScope.courseProfile)
  for (const [dimension, authoredValue] of Object.entries(authoredScope)) {
    const requestedValue = requestedScope[dimension]
    if (!requestedValue) return null

    if (dimension !== 'courseProfile') {
      if (normalizeToken(authoredValue) !== normalizeToken(requestedValue)) {
        return null
      }
      continue
    }

    const authoredCourseProfile = normalizeToken(authoredValue)
    if (authoredCourseProfile === requestedCourseProfile) {
      continue
    }
    if (
      (requestedCourseProfile === 'ALL' || requestedCourseProfile === 'GK+LK')
      && (authoredCourseProfile === 'GK' || authoredCourseProfile === 'LK')
    ) {
      courseFallbackCount += 1
      coursePreferenceRank += authoredCourseProfile === 'LK' ? 0 : 1
      continue
    }
    return null
  }

  return {
    scopeSize: Object.keys(authoredScope).length,
    courseFallbackCount,
    coursePreferenceRank,
  }
}

export const compareLearnerCompositionScopeMatches = (
  left: LearnerCompositionScopeMatch,
  right: LearnerCompositionScopeMatch,
): number => (
  right.scopeSize - left.scopeSize
  || left.courseFallbackCount - right.courseFallbackCount
  || left.coursePreferenceRank - right.coursePreferenceRank
)
