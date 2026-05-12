import type { UiGoal } from '../goalTypes'
import { isCompositionStructureNode, isSyntheticProgramUnit } from './treeProjectionRuntime'

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
    const isRenderedLeaf = (renderedChildrenByParent.get(goalId) ?? []).length === 0
    const isScoped = scopedGoalIds.has(goalId)
    const stats = {
      scopedConcrete: goal && !isSynthetic && isRenderedLeaf && isScoped ? 1 : 0,
      unscopedConcrete: goal && !isSynthetic && isRenderedLeaf && !isScoped ? 1 : 0,
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

  const hasFullyCoveredAncestor = (goalId: string, visited: Set<string> = new Set()): boolean => {
    if (visited.has(goalId)) return false
    const nextVisited = new Set(visited)
    nextVisited.add(goalId)

    const parentIds = parentIdsByChild.get(goalId) ?? new Set<string>()
    return Array.from(parentIds).some((parentId) =>
      isFullyCoveredScopeRepresentative(parentId) || hasFullyCoveredAncestor(parentId, nextVisited),
    )
  }

  const markerGoalIds = new Set<string>()
  allGoals.forEach((_, goalId) => {
    if (scopedGoalIds.has(goalId)) return
    if (!isFullyCoveredScopeRepresentative(goalId)) return

    if (!hasFullyCoveredAncestor(goalId)) {
      markerGoalIds.add(goalId)
    }
  })

  const compositionStructureMarkerGoalIds = Array.from(markerGoalIds).filter((goalId) => {
    const goal = allGoals.get(goalId)
    return !!goal && isCompositionStructureNode(goal)
  })

  if (compositionStructureMarkerGoalIds.length > 0) {
    return new Set(compositionStructureMarkerGoalIds)
  }

  return markerGoalIds
}
