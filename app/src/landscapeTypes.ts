export type DemandLevel = 'AB1' | 'AB2' | 'AB3'

export interface DimensionTags {
  framework: string
  demandLevel: DemandLevel
  processCompetencies: string[]
  guidingIdeas: string[]
  phase: string
  area: string
  topicCode: string
}


export interface LandscapeFilter {
  id: string
  label: string
}

export interface LearningGoal {
  /** Original goal id (KC-oriented, may be German). */
  id: string
  /** Short, ASCII-only key that is stable across languages and UIs. */
  shortKey: string
  /** Localized title shown to learners (German in the current landscape). */
  title: string
  /** Localized description, typically “Die lernende Person kann …”. */
  description: string
  core: boolean
  weight: number
  tags?: string[]
  dimensionTags: DimensionTags
  courseLevel?: string
  themenfeld?: string
  leitideen?: string[]
  kompetenzen?: string[]
  requires: string[]
  contains: string[]
  examples: string[]
  sourceRef?: string
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
