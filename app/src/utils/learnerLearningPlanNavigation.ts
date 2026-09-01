export interface LearnerLearningPlanNavigationTarget {
  landscapeId: string
  activeGoalId: string
}

export interface LearnerLearningPlanNavigationHandlers {
  selectGoal: (goalId: string) => void
  selectGoalInLandscape?: (landscapeId: string, goalId: string) => void
}

/**
 * Keeps the subject route and planned active goal in one navigation decision.
 * A cross-subject target fails closed when the caller cannot change the
 * landscape; selecting a foreign goal inside the current landscape would
 * produce an inconsistent route.
 */
export const navigateToLearnerLearningPlanGoal = (
  currentLandscapeId: string,
  target: LearnerLearningPlanNavigationTarget,
  handlers: LearnerLearningPlanNavigationHandlers,
): boolean => {
  if (target.landscapeId !== currentLandscapeId) {
    if (!handlers.selectGoalInLandscape) return false
    handlers.selectGoalInLandscape(target.landscapeId, target.activeGoalId)
    return true
  }
  handlers.selectGoal(target.activeGoalId)
  return true
}
