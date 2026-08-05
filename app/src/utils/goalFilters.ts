import type { UiGoal } from '../goalTypes'
import { normalizeDurationModel } from './durationModel'
import { normalizeJurisdictionCode } from './jurisdictionMetadata'

type FilterableGoal = Pick<UiGoal, 'tags' | 'applicability'>
type FilterDimension = 'courseProfile' | 'durationModel' | 'jurisdiction' | 'generic'

const COURSE_FILTER_VALUES = new Set(['GK', 'LK', 'GK+LK'])

export const isWildcardFilter = (filterId?: string) => {
  if (!filterId) return false
  return filterId.toLowerCase() === 'all'
}

export const splitFilterIds = (filterIds?: string | string[]): string[] => (
  (Array.isArray(filterIds) ? filterIds : [filterIds])
    .flatMap((value) => (typeof value === 'string' ? value.split(',') : []))
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
)

const normalizeFilterToken = (value?: string) => value?.trim().toUpperCase() ?? ''

const inferFilterDimension = (filterId: string): FilterDimension => {
  const normalized = normalizeFilterToken(filterId)
  if (COURSE_FILTER_VALUES.has(normalized)) return 'courseProfile'
  if (normalizeDurationModel(normalized)) return 'durationModel'
  if (normalizeJurisdictionCode(normalized)) return 'jurisdiction'
  return 'generic'
}

const getNormalizedTagValues = (goal: FilterableGoal) =>
  new Set(
    (goal.tags ?? [])
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => normalizeFilterToken(value)),
  )

const getNormalizedApplicabilityValues = (goal: FilterableGoal) =>
  new Set(
    goal.applicability
      ? Object.values(goal.applicability)
          .flatMap((values) => (Array.isArray(values) ? values : []))
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          .map((value) => normalizeFilterToken(value))
      : [],
  )

const getExplicitCourseValues = (goal: FilterableGoal) => {
  const values = new Set<string>()
  const normalizedTags = getNormalizedTagValues(goal)
  const normalizedApplicabilityValues = getNormalizedApplicabilityValues(goal)

  normalizedTags.forEach((value) => {
    if (COURSE_FILTER_VALUES.has(value)) {
      if (value === 'GK+LK') {
        values.add('GK')
        values.add('LK')
      } else {
        values.add(value)
      }
    }
  })

  normalizedApplicabilityValues.forEach((value) => {
    if (COURSE_FILTER_VALUES.has(value)) {
      if (value === 'GK+LK') {
        values.add('GK')
        values.add('LK')
      } else {
        values.add(value)
      }
    }
  })

  return values
}

const getExplicitJurisdictionValues = (goal: FilterableGoal) => {
  const values = new Set<string>()
  const normalizedTags = getNormalizedTagValues(goal)
  const normalizedApplicabilityValues = getNormalizedApplicabilityValues(goal)

  normalizedTags.forEach((value) => {
    const jurisdiction = normalizeJurisdictionCode(value)
    if (jurisdiction) values.add(jurisdiction)
  })

  normalizedApplicabilityValues.forEach((value) => {
    const jurisdiction = normalizeJurisdictionCode(value)
    if (jurisdiction) values.add(jurisdiction)
  })

  return values
}

const getExplicitDurationModelValues = (goal: FilterableGoal) => {
  const values = new Set<string>()
  const normalizedTags = getNormalizedTagValues(goal)
  const normalizedApplicabilityValues = getNormalizedApplicabilityValues(goal)

  normalizedTags.forEach((value) => {
    const durationModel = normalizeDurationModel(value)
    if (durationModel) values.add(durationModel)
  })

  normalizedApplicabilityValues.forEach((value) => {
    const durationModel = normalizeDurationModel(value)
    if (durationModel) values.add(durationModel)
  })

  return values
}

const getGenericFilterValues = (goal: FilterableGoal) => {
  const values = new Set<string>()
  getNormalizedTagValues(goal).forEach((value) => values.add(value))
  getNormalizedApplicabilityValues(goal).forEach((value) => values.add(value))
  return values
}

export const goalMatchesFilter = (goal: FilterableGoal, filterId?: string): boolean => {
  const effectiveFilters = splitFilterIds(filterId).filter((value) => !isWildcardFilter(value))
  if (effectiveFilters.length === 0) return true
  if (effectiveFilters.length > 1) return goalMatchesFilters(goal, effectiveFilters)

  const normalizedFilterId = normalizeFilterToken(effectiveFilters[0])
  const dimension = inferFilterDimension(normalizedFilterId)

  if (dimension === 'courseProfile') {
    const explicitCourseValues = getExplicitCourseValues(goal)
    if (explicitCourseValues.size === 0) return true
    if (normalizedFilterId === 'GK+LK') {
      return explicitCourseValues.has('GK') || explicitCourseValues.has('LK')
    }
    return explicitCourseValues.has(normalizedFilterId)
  }

  if (dimension === 'jurisdiction') {
    const normalizedJurisdiction = normalizeJurisdictionCode(normalizedFilterId)
    if (!normalizedJurisdiction) return true
    const explicitJurisdictionValues = getExplicitJurisdictionValues(goal)
    if (explicitJurisdictionValues.size === 0) return true
    return explicitJurisdictionValues.has(normalizedJurisdiction)
  }

  if (dimension === 'durationModel') {
    const normalizedDurationModel = normalizeDurationModel(normalizedFilterId)
    if (!normalizedDurationModel) return true
    const explicitDurationModelValues = getExplicitDurationModelValues(goal)
    if (explicitDurationModelValues.size === 0) return true
    return explicitDurationModelValues.has(normalizedDurationModel)
  }

  const genericValues = getGenericFilterValues(goal)
  if (genericValues.has(normalizedFilterId)) return true

  return genericValues.size === 0
}

export const goalMatchesFilters = (
  goal: FilterableGoal,
  filterIds?: string | string[],
): boolean => {
  const effectiveFilters = splitFilterIds(filterIds)
    .filter((value) => !isWildcardFilter(value))

  if (effectiveFilters.length === 0) {
    return true
  }

  return effectiveFilters.every((filterId) => goalMatchesFilter(goal, filterId))
}
