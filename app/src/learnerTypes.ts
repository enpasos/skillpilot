export interface LearnerState {
  learnerId: string
  landscapeId: string
  mastery: Record<string, number>
  meta: {
    lastUpdated: string
  }
}

export type MasteryMap = Record<string, number>

