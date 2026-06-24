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
  forceActiveGoalReveal?: boolean
}

export function shouldAutoRevealActiveGoal({
  activeGoalId,
  previousRevealedActiveGoalId,
  currentRouteGoalId,
  pendingRouteSyncGoalId,
  forceActiveGoalReveal = false,
}: ActiveGoalRevealInput): boolean {
  if (!activeGoalId) return false
  if (forceActiveGoalReveal) return currentRouteGoalId !== activeGoalId

  const activeGoalChanged = activeGoalId !== previousRevealedActiveGoalId
  if (activeGoalChanged) {
    if (!currentRouteGoalId) return true
    return !!previousRevealedActiveGoalId && currentRouteGoalId === previousRevealedActiveGoalId
  }

  if (currentRouteGoalId && currentRouteGoalId !== activeGoalId) return false

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
  visibleRootGoalIds = [],
}: NextVisibleLearnerGoalSelectionInput): string | null {
  const visible = new Set(visibleGoalIds)

  if (currentRouteGoalId) {
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
