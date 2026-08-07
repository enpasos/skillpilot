interface NextVisibleLearnerGoalSelectionInput {
  currentGoalId?: string | null
  currentRouteGoalId?: string | null
  learnerStateReady?: boolean
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

interface InitialLearnerGoalRevealInput {
  learnerStateReady: boolean
  hasAlreadyRevealed: boolean
  hasLearnerTree: boolean
  currentRouteGoalId?: string | null
  activeGoalId?: string | null
  hasPlannedGoals: boolean
}

interface FocusMutationRevealTargetInput {
  activeGoalId?: string | null
  authoritativeFocusGoalIds?: Iterable<string>
  requestedFocusGoalIds?: Iterable<string>
}

export type InitialLearnerGoalReveal = 'active' | 'scope'

const firstNonBlankGoalId = (goalIds: Iterable<string>): string | null => {
  for (const goalId of goalIds) {
    const normalizedGoalId = goalId.trim()
    if (normalizedGoalId) return normalizedGoalId
  }
  return null
}

export function getFocusMutationRevealTarget({
  activeGoalId,
  authoritativeFocusGoalIds = [],
  requestedFocusGoalIds = [],
}: FocusMutationRevealTargetInput): string | null {
  const normalizedActiveGoalId = activeGoalId?.trim()
  if (normalizedActiveGoalId) return normalizedActiveGoalId

  return firstNonBlankGoalId(requestedFocusGoalIds)
    ?? firstNonBlankGoalId(authoritativeFocusGoalIds)
}

export function getInitialLearnerGoalReveal({
  learnerStateReady,
  hasAlreadyRevealed,
  hasLearnerTree,
  currentRouteGoalId,
  activeGoalId,
  hasPlannedGoals,
}: InitialLearnerGoalRevealInput): InitialLearnerGoalReveal | null {
  if (!learnerStateReady || hasAlreadyRevealed || !hasLearnerTree || currentRouteGoalId) {
    return null
  }
  if (activeGoalId) {
    return 'active'
  }
  return hasPlannedGoals ? 'scope' : null
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
  learnerStateReady = true,
  visibleGoalIds,
  activeGoalId,
  plannedGoalIds = [],
  visibleRootGoalIds = [],
}: NextVisibleLearnerGoalSelectionInput): string | null {
  const visible = new Set(visibleGoalIds)

  if (currentRouteGoalId) {
    return null
  }

  // Do not create an internal fallback route before the authoritative learner
  // state has had a chance to provide the active goal.
  if (!learnerStateReady) {
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
