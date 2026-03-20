import type { UiGoal } from '../goalTypes'

type FilterableGoal = Pick<UiGoal, 'tags' | 'applicability'>

export const isWildcardFilter = (filterId?: string) => {
  if (!filterId) return false
  return filterId.toLowerCase() === 'all'
}

const getGoalFilterValues = (goal: FilterableGoal): string[] => {
  const applicabilityValues = goal.applicability
    ? Object.values(goal.applicability)
        .flatMap((values) => (Array.isArray(values) ? values : []))
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : []

  const tagValues = (goal.tags ?? []).filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )

  return [...applicabilityValues, ...tagValues]
}

export const goalMatchesFilter = (goal: FilterableGoal, filterId?: string): boolean => {
  if (!filterId || isWildcardFilter(filterId)) return true

  const filterValues = getGoalFilterValues(goal)
  if (filterValues.includes(filterId)) return true

  return filterValues.length === 0
}
