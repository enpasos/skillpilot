export interface LearnerState {
  learnerId: string
  landscapeId: string
  mastery: Record<string, number>
  meta: {
    lastUpdated: string
  }
}

export type MasteryMap = Record<string, number>

export interface CopySource {
  sourceId: string;
  copiedAt: string; // ISO timestamp
}

export interface Learner {
  skillpilotId: string;
  createdAt: string;
  selectedCurriculum: string;
  personalCurriculum: string;
  copySources: CopySource[];
}

