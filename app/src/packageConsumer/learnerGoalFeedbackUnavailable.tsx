import type { UiGoal } from '../goalTypes'

type FeedbackGoal = Pick<UiGoal, 'id' | 'title' | 'landscapeId' | 'semanticKind' | 'contains'>

/** Repository feedback publications do not belong to package-consumer runtimes. */
export const LearnerGoalFeedbackAction: (props: { goal: FeedbackGoal }) => null = () => null
