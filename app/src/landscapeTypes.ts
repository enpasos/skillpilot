export type DemandLevel = 'AB1' | 'AB2' | 'AB3'

export interface DimensionTags {
  framework: string
  demandLevel: DemandLevel
  processCompetencies: string[]
  guidingIdeas: string[]
  phase: string
  area?: string
  topicCode?: string
}


export interface LandscapeFilter {
  id: string
  label: string
}

export interface ExamData {
  taskContent: string
  taskContentEn?: string
  solutionContent: string
  solutionContentEn?: string
  scoring: {
    maxPoints: number
    passingPoints: number
    steps: Array<{
      id: string
      points: number
      description: string
    }>
  }
}

export interface ResourceLink {
  type: string
  title: string
  url: string
  resourceType?: string
  provider?: string
  sections?: string[]
  description?: string
  lang?: string
  license?: string
}

export interface ExperimentData {
  title: string
  description: string
  equipment: string[]
}

export interface ReleaseMetadata {
  examYear: number
  kind: 'offer' | 'master'
  courseLevel: 'GK' | 'LK'
  status: 'draft' | 'released'
}

export interface LearningGoal {
  /** Original goal id (KC-oriented, may be German). */
  id: string
  /** Short, ASCII-only key that is stable across languages and UIs. Optional in older landscape files. */
  shortKey?: string
  /** Localized title shown to learners (German in the current landscape). */
  title: string
  /** Localized description, typically “Die lernende Person kann …”. */
  description: string
  /** Optional in older landscape files; runtime derives a fallback from tags/courseLevel. */
  core?: boolean
  weight: number
  tags?: string[]
  dimensionTags: DimensionTags
  courseLevel?: string
  themenfeld?: string
  leitideen?: string[]
  kompetenzen?: string[]
  requires: string[]
  contains: string[]
  examples?: string[]
  sourceRef?: string
  resourceLinks?: ResourceLink[]
  extendedData?: Record<string, unknown>
  release?: ReleaseMetadata
  examData?: ExamData
  experimentData?: ExperimentData
  /** Explicit node type ("atomic" | "cluster"), optional for backward compatibility. */
  type?: 'atomic' | 'cluster'
  /** Explicit node kind ("exam" | "tutor" | "memory"), optional for backward compatibility. */
  nodeKind?: 'exam' | 'tutor' | 'memory'
}

export interface LearningLandscape {
  landscapeId: string
  locale: string
  /** Human-readable subject name, e.g. "Mathematik", "Physik". */
  subject?: string
  /** Identifier for the underlying curriculum/framework, e.g. "hessen-kc-2024-math". */
  frameworkId?: string
  title: string
  description: string
  filters?: LandscapeFilter[]
  goals: LearningGoal[]
}
