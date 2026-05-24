interface NextVisibleLearnerGoalSelectionInput {
  currentGoalId?: string | null
  currentRouteGoalId?: string | null
  visibleGoalIds: Iterable<string>
  activeGoalId?: string | null
  plannedGoalIds?: Iterable<string>
  plannedScopeGoalIds?: Iterable<string>
  visibleRootGoalIds?: Iterable<string>
}

interface ActiveGoalRevealInput {
  activeGoalId?: string | null
  previousRevealedActiveGoalId?: string | null
  currentRouteGoalId?: string | null
  pendingRouteSyncGoalId?: string | null
}

export function shouldAutoRevealActiveGoal({
  activeGoalId,
  previousRevealedActiveGoalId,
  currentRouteGoalId,
  pendingRouteSyncGoalId,
}: ActiveGoalRevealInput): boolean {
  if (!activeGoalId) return false

  const activeGoalChanged = activeGoalId !== previousRevealedActiveGoalId
  if (activeGoalChanged) return true

  const initialRouteNeedsSync = !currentRouteGoalId
  if (!initialRouteNeedsSync) return false

  return pendingRouteSyncGoalId !== activeGoalId
}

export function getNextVisibleLearnerGoalSelection({
  currentGoalId,
  currentRouteGoalId,
  visibleGoalIds,
  activeGoalId,
  plannedGoalIds = [],
  plannedScopeGoalIds = [],
  visibleRootGoalIds = [],
}: NextVisibleLearnerGoalSelectionInput): string | null {
  const visible = new Set(visibleGoalIds)
  const plannedScope = new Set(plannedScopeGoalIds)
  let explicitRouteStillAuthoritative = false

  if (currentRouteGoalId) {
    if (activeGoalId && currentRouteGoalId === activeGoalId) {
      return null
    }

    const routeWithinPlannedScope = plannedScope.size === 0 || plannedScope.has(currentRouteGoalId)
    if (routeWithinPlannedScope) {
      explicitRouteStillAuthoritative = true
    }
  }

  if (explicitRouteStillAuthoritative) {
    return null
  }

  if (currentGoalId && visible.has(currentGoalId) && !currentRouteGoalId) return null

  if (activeGoalId && visible.has(activeGoalId) && activeGoalId !== currentGoalId) {
    return activeGoalId
  }

  for (const goalId of plannedGoalIds) {
    if (visible.has(goalId) && goalId !== currentGoalId) {
      return goalId
    }
  }

  for (const goalId of visibleRootGoalIds) {
    if (visible.has(goalId) && goalId !== currentGoalId) {
      return goalId
    }
  }

  for (const goalId of visible) {
    if (goalId !== currentGoalId) {
      return goalId
    }
  }

  return null
}
