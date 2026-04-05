interface NextVisibleLearnerGoalSelectionInput {
  currentGoalId?: string | null
  currentRouteGoalId?: string | null
  visibleGoalIds: Iterable<string>
  activeGoalId?: string | null
  plannedGoalIds?: Iterable<string>
  visibleRootGoalIds?: Iterable<string>
}

export function getNextVisibleLearnerGoalSelection({
  currentGoalId,
  currentRouteGoalId,
  visibleGoalIds,
  activeGoalId,
  plannedGoalIds = [],
  visibleRootGoalIds = [],
}: NextVisibleLearnerGoalSelectionInput): string | null {
  if (!currentGoalId) return null
  if (currentRouteGoalId) return null

  const visible = new Set(visibleGoalIds)
  if (visible.has(currentGoalId)) return null

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
