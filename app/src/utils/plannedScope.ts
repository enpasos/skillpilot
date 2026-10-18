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
  plannedGoalIds: Iterable<string> = [],
) => {
  const exactPlannedGoalIds = new Set(plannedGoalIds)
  const taggedRootIds = Array.from(allGoals.values())
    .filter((goal) => goal.tags?.includes('root'))
    .map((goal) => goal.id)
  const referencedGoalIds = new Set(Array.from(renderedChildrenByParent.values()).flat())
  const renderedRootIds = taggedRootIds.length > 0
    ? taggedRootIds
    : Array.from(allGoals.keys()).filter((goalId) => !referencedGoalIds.has(goalId))
  const renderedGoalIds = new Set<string>()
  const pendingRenderedIds = [...renderedRootIds]
  while (pendingRenderedIds.length > 0) {
    const goalId = pendingRenderedIds.pop()!
    if (!allGoals.has(goalId) || renderedGoalIds.has(goalId)) continue
    renderedGoalIds.add(goalId)
    pendingRenderedIds.push(...(renderedChildrenByParent.get(goalId) ?? []))
  }
  // A persisted composition alias can cover only part of today's subject root.
  const hasHiddenPlannedCompositionGoal = Array.from(exactPlannedGoalIds)
    .some((goalId) => {
      const goal = allGoals.get(goalId)
      return !renderedGoalIds.has(goalId) && !!goal && isCompositionStructureNode(goal)
    })
  const statsByGoalId = new Map<string, { scopedConcrete: number; unscopedConcrete: number }>()
  const parentIdsByChild = new Map<string, Set<string>>()
  const renderedPlannedDescendantCache = new Map<string, boolean>()
  const visiting = new Set<string>()

  renderedChildrenByParent.forEach((childIds, parentId) => {
    if (!renderedGoalIds.has(parentId)) return
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

  const hasExactPlannedGoalInRenderedSubtree = (
    goalId: string,
    visited: Set<string> = new Set(),
  ): boolean => {
    const cached = renderedPlannedDescendantCache.get(goalId)
    if (cached !== undefined) return cached
    if (visited.has(goalId)) return false

    const nextVisited = new Set(visited)
    nextVisited.add(goalId)
    const containsExactPlannedGoal = exactPlannedGoalIds.has(goalId)
      || (renderedChildrenByParent.get(goalId) ?? []).some((childId) =>
        hasExactPlannedGoalInRenderedSubtree(childId, nextVisited),
      )
    renderedPlannedDescendantCache.set(goalId, containsExactPlannedGoal)
    return containsExactPlannedGoal
  }

  const isScopeMarkerCandidate = (goalId: string) => {
    if (!renderedGoalIds.has(goalId) || exactPlannedGoalIds.has(goalId)) return false
    if (scopedGoalIds.has(goalId) && !hasHiddenPlannedCompositionGoal) return false
    if (!isFullyCoveredScopeRepresentative(goalId)) return false
    // An exact visible selection must remain the only selected row. A fully
    // covered ancestor is merely an equivalent scope when it has only that
    // selected subtree; showing the same removal icon there makes both rows
    // look selected and also hides the ancestor's own selection control.
    // Hidden persisted scopes use equivalent visible branches instead.
    return !hasExactPlannedGoalInRenderedSubtree(goalId)
  }

  const hasSelectedOrRepresentativeAncestor = (goalId: string, visited: Set<string> = new Set()): boolean => {
    if (visited.has(goalId)) return false
    const nextVisited = new Set(visited)
    nextVisited.add(goalId)

    const parentIds = parentIdsByChild.get(goalId) ?? new Set<string>()
    return Array.from(parentIds).some((parentId) =>
      exactPlannedGoalIds.has(parentId)
      || isScopeMarkerCandidate(parentId)
      || hasSelectedOrRepresentativeAncestor(parentId, nextVisited),
    )
  }

  const markerGoalIds = new Set<string>()
  allGoals.forEach((_, goalId) => {
    if (isScopeMarkerCandidate(goalId) && !hasSelectedOrRepresentativeAncestor(goalId)) {
      markerGoalIds.add(goalId)
    }
  })

  if (!hasHiddenPlannedCompositionGoal) {
    // Preserve the existing year/phase structure preference for canonical foci.
    const compositionStructureMarkerGoalIds = Array.from(markerGoalIds).filter((goalId) => {
      const goal = allGoals.get(goalId)
      return !!goal && isCompositionStructureNode(goal)
    })
    if (compositionStructureMarkerGoalIds.length > 0) {
      return new Set(compositionStructureMarkerGoalIds)
    }
  }

  return markerGoalIds
}
