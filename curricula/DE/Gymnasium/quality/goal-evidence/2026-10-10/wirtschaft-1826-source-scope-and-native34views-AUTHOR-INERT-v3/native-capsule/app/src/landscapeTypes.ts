export type DemandLevel = 'AB1' | 'AB2' | 'AB3'

export type SemanticKind =
  | 'curricularAtomic'
  | 'curricularArea'
  | 'programStructure'
  | 'practiceAssessment'
  | 'memory'
  | 'orientation'
  | 'runtimeSupport'

export type ProgramUnitKind =
  | 'program'
  | 'stage'
  | 'year'
  | 'phase'
  | 'semester'
  | 'module'
  | 'track'
  | 'exam'

export interface ProgramUnit {
  id: string
  kind: ProgramUnitKind
  label: string
  shortLabel?: string
  order?: number
  parentUnitId?: string
}

export interface GoalPlacementContext {
  schoolForm?: string
  stage?: string
  jurisdiction?: string
  durationModel?: string
  courseProfile?: string
  [key: string]: string | undefined
}

export interface GoalPlacement {
  goalId: string
  unitId: string
  relation: 'primary' | 'secondary' | 'assessed'
  context?: GoalPlacementContext
}

export interface CompetencyCatalogEntry {
  id: string
  label: string
  dimension: string
}

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
  /**
   * Optional release gate for learner-facing hard exam mode.
   * Missing means legacy data; explicit non-released statuses block hard-check use.
   */
  reviewStatus?: 'draft' | 'needs_review' | 'released' | string
  /** Optional human review rationale carried by the release package. */
  reviewNote?: string
  /** Canonical goal IDs covered by this assessment package. */
  coveredGoalIds?: string[]
  /** Human-readable or canonical strand labels covered by this assessment package. */
  coveredStrands?: string[]
  /** Demand levels covered by the assessment package, e.g. AB1/AB2/AB3. */
  demandLevels?: string[]
  /** Optional source artifact path for reviewed authored exam packages. */
  sourceArtifactPath?: string
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
  skillpilotId?: string
  role?: string
  altText?: string
  reviewStatus?: string
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

export type ApplicabilityMap = Record<string, string[]>

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
  phase?: string
  semanticAtomic?: boolean
  semanticKind?: SemanticKind
  requires: string[]
  contains: string[]
  examples?: string[]
  sourceRef?: string
  resourceLinks?: ResourceLink[]
  applicability?: ApplicabilityMap
  competencyRefs?: string[]
  extendedData?: Record<string, unknown>
  release?: ReleaseMetadata
  examData?: ExamData
  experimentData?: ExperimentData
  /** Explicit node type ("atomic" | "cluster"), optional for backward compatibility. */
  type?: 'atomic' | 'cluster'
  /** Explicit node kind ("exam" | "tutor" | "memory"), optional for backward compatibility. */
  nodeKind?: 'exam' | 'tutor' | 'memory'
}

export interface SkillLandscape {
  $schema?: string
  landscapeFormatVersion?: string
  landscapeId: string
  locale: string
  /** Human-readable subject name, e.g. "Mathematik", "Physik". */
  subject?: string
  /** Identifier for the underlying curriculum/framework, e.g. "hessen-kc-2024-math". */
  frameworkId?: string
  title: string
  description: string
  compatibilityOnly?: boolean
  legacyHiddenByDefault?: boolean
  filters?: LandscapeFilter[]
  programUnits?: ProgramUnit[]
  goalPlacements?: GoalPlacement[]
  competencyCatalog?: CompetencyCatalogEntry[]
  goals: LearningGoal[]
}
