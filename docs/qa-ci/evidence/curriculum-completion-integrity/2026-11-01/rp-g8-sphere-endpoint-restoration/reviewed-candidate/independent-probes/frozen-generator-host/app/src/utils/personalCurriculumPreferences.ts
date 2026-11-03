import type { Learner } from '../learnerTypes'

export interface PersonalCurriculumPreferences {
  strategy: 'RANDOM' | 'SEQUENTIAL'
  autoPilot: boolean
  followLearningPlans: boolean
  /** Day or week basis; stored per SkillPilot-ID, never per client. */
  learningPlanPeriodBasis: 'DAY' | 'WEEK'
  learningPlanCountOnlyExplicitGoals: boolean
  strictMode: boolean
  useAssessmentShortcuts: boolean
  showGoalVisualizationsInChat: boolean
}

export const learnerPreferences = (learner: Learner | null) => ({
  learningStrategy: learner?.learningStrategy ?? 'SEQUENTIAL',
  autoPilot: learner?.autoPilot ?? true,
  followLearningPlans: learner?.followLearningPlans ?? false,
  learningPlanPeriodBasis: learner?.learningPlanPeriodBasis ?? 'WEEK',
  learningPlanCountOnlyExplicitGoals: learner?.learningPlanCountOnlyExplicitGoals ?? false,
  strictMode: learner?.strictMode ?? false,
  useAssessmentShortcuts: learner?.useAssessmentShortcuts ?? true,
  showGoalVisualizationsInChat: learner?.showGoalVisualizationsInChat ?? true,
})

/** The write succeeded; only the following authoritative reload needs retrying. */
export class PreferencesReloadError extends Error {
  constructor() {
    super('preferences-saved-reload-failed')
    this.name = 'PreferencesReloadError'
  }
}
