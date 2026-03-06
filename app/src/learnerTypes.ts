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
  learningStrategy?: 'RANDOM' | 'SEQUENTIAL';
  autoPilot?: boolean;
  strictMode?: boolean;
  copySources: CopySource[];
  activeGoalId?: string;
}

export interface FrontierGoal {
  id: string;
  title: string;
  description: string;
  type: 'atomic' | 'cluster';
  nodeKind?: 'exam' | 'tutor' | 'memory';
  reason: string;
  tags?: string[];
  resourceLinks?: Array<{
    type?: string;
    title?: string;
    url: string;
    resourceType?: string;
    provider?: string;
    sections?: string[];
    description?: string;
    lang?: string;
    license?: string;
  }>;
  sourceRef?: string;
  sourceLicense?: string;
  sourceLicenseUrl?: string;
}

export interface StateMachineInfo {
  state: string;
  requiredAction: string;
  goalOptions: FrontierGoal[];
  curriculumOptions: { landscapeId: string; title: string }[];
  activeGoal?: FrontierGoal;
}

export interface GoalStats {
  mastered_atomic: number;
  total_atomic: number;
}

export interface UnifiedLearnerStateResponse {
  skillpilotId: string;
  curriculum: { landscapeId: string; title: string };
  frontier: FrontierGoal[];
  goals: {
    planned: FrontierGoal[];
    mastered_count: number;
    total_count: number;
    personalized?: GoalStats;
    scope?: GoalStats;
    scope_completed?: boolean;
  };
  nextAllowedActions: string[];
  activeFilters: string[];
  copySources: CopySource[];
  learningState: string;
  activeGoal?: FrontierGoal;
  stateMachine: StateMachineInfo;
}
