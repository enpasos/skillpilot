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
  activeGoalId?: string;
}

export interface FrontierGoal {
  id: string;
  title: string;
  description: string;
  type: 'atomic' | 'cluster';
  reason: string;
  tags?: string[];
}

export interface UnifiedLearnerStateResponse {
  skillpilotId: string;
  curriculum: { landscapeId: string; title: string };
  frontier: FrontierGoal[];
  goals: {
    planned: FrontierGoal[];
    masteredCount: number;
    totalCount: number;
  };
  nextAllowedActions: string[];
  activeFilters: string[];
  copySources: CopySource[];
  learningState: string;
  activeGoal?: FrontierGoal;
  stateMachine: any; // Simplified for now
}
