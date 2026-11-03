import type { GoalBookFeedbackLinkBinding } from './goalBookFeedback'
import { goalBookDefinitionById } from './goalBookPublicationRegistry'

export const LEARNER_COCKPIT_GOAL_FEEDBACK_ORIGIN = 'learner-cockpit' as const

export interface LearnerCockpitGoalFeedbackNavigationState {
  goalFeedbackOrigin: typeof LEARNER_COCKPIT_GOAL_FEEDBACK_ORIGIN
}

export const LEARNER_COCKPIT_GOAL_FEEDBACK_NAVIGATION_STATE = Object.freeze({
  goalFeedbackOrigin: LEARNER_COCKPIT_GOAL_FEEDBACK_ORIGIN,
}) satisfies LearnerCockpitGoalFeedbackNavigationState

export const isLearnerCockpitGoalFeedbackNavigationState = (
  value: unknown,
): value is LearnerCockpitGoalFeedbackNavigationState => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  const keys = Object.keys(candidate)
  return keys.length === 1
    && keys[0] === 'goalFeedbackOrigin'
    && candidate.goalFeedbackOrigin === LEARNER_COCKPIT_GOAL_FEEDBACK_ORIGIN
}

export const learnerCockpitGoalFeedbackReturnPath = (
  binding: GoalBookFeedbackLinkBinding,
): string | null => {
  const definition = goalBookDefinitionById(binding.bookId)
  if (!definition) return null
  return `/learner/${encodeURIComponent(binding.goalId)}?${new URLSearchParams({
    l: definition.landscapeId,
  }).toString()}`
}
