import type { UiGoal } from '../goalTypes'
import { isSyntheticProgramUnit } from './treeProjectionRuntime'

export const buildGoalContainsClosure = (
  rootGoalIds: Iterable<string>,
  allGoals: Map<string, UiGoal>,
) => {
  const closure = new Set<string>()
  const stack = Array.from(rootGoalIds)

  while (stack.length > 0) {
    const goalId = stack.pop()
    if (!goalId || closure.has(goalId)) continue

    closure.add(goalId)
    const goal = allGoals.get(goalId)
    goal?.contains?.forEach((childId) => {
      if (!closure.has(childId)) {
        stack.push(childId)
      }
    })
  }

  return closure
}

export const buildRenderedScopeDescendantCountMap = (
  allGoals: Map<string, UiGoal>,
  renderedChildrenByParent: Map<string, string[]>,
  scopedGoalIds: Set<string>,
) => {
  const countsByGoalId = new Map<string, number>()
  const visiting = new Set<string>()

  const compute = (goalId: string): number => {
    const cached = countsByGoalId.get(goalId)
    if (cached !== undefined) return cached
    if (visiting.has(goalId)) return 0

    visiting.add(goalId)
    let count = scopedGoalIds.has(goalId) ? 1 : 0

    renderedChildrenByParent.get(goalId)?.forEach((childId) => {
      count += compute(childId)
    })

    visiting.delete(goalId)
    countsByGoalId.set(goalId, count)
    return count
  }

  allGoals.forEach((_, goalId) => {
    compute(goalId)
  })

  return countsByGoalId
}

export const buildRenderedScopeMarkerGoalIds = (
  allGoals: Map<string, UiGoal>,
  renderedChildrenByParent: Map<string, string[]>,
  scopedGoalIds: Set<string>,
) => {
  const statsByGoalId = new Map<string, { scopedConcrete: number; unscopedConcrete: number }>()
  const parentIdsByChild = new Map<string, Set<string>>()
  const visiting = new Set<string>()

  renderedChildrenByParent.forEach((childIds, parentId) => {
    childIds.forEach((childId) => {
      const parentIds = parentIdsByChild.get(childId) ?? new Set<string>()
      parentIds.add(parentId)
      parentIdsByChild.set(childId, parentIds)
    })
  })

  const compute = (goalId: string): { scopedConcrete: number; unscopedConcrete: number } => {
    const cached = statsByGoalId.get(goalId)
    if (cached) return cached
    if (visiting.has(goalId)) return { scopedConcrete: 0, unscopedConcrete: 0 }

    visiting.add(goalId)
    const goal = allGoals.get(goalId)
    const isSynthetic = !!goal && isSyntheticProgramUnit(goal)
    const isScoped = scopedGoalIds.has(goalId)
    const stats = {
      scopedConcrete: goal && !isSynthetic && isScoped ? 1 : 0,
      unscopedConcrete: goal && !isSynthetic && !isScoped ? 1 : 0,
    }

    renderedChildrenByParent.get(goalId)?.forEach((childId) => {
      const childStats = compute(childId)
      stats.scopedConcrete += childStats.scopedConcrete
      stats.unscopedConcrete += childStats.unscopedConcrete
    })

    visiting.delete(goalId)
    statsByGoalId.set(goalId, stats)
    return stats
  }

  const isFullyCoveredScopeRepresentative = (goalId: string) => {
    const stats = compute(goalId)
    return stats.scopedConcrete > 0 && stats.unscopedConcrete === 0
  }

  const markerGoalIds = new Set<string>()
  allGoals.forEach((_, goalId) => {
    if (scopedGoalIds.has(goalId)) return
    if (!isFullyCoveredScopeRepresentative(goalId)) return

    const parentIds = parentIdsByChild.get(goalId) ?? new Set<string>()
    const hasFullyCoveredParent = Array.from(parentIds).some((parentId) =>
      isFullyCoveredScopeRepresentative(parentId),
    )
    if (!hasFullyCoveredParent) {
      markerGoalIds.add(goalId)
    }
  })

  return markerGoalIds
}
