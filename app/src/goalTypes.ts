import type { LearningGoal } from './landscapeTypes'

export type CourseLevel = string
export type PhaseCode =
  | 'GLOBAL'
  | 'E' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Abitur'
  | 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10' | 'S11' | 'S12' | 'S13' | 'S14'
  | 'Pflichtbereich' | 'Wahlpflichtbereich' | 'Wahlbereich' | 'Bachelorarbeit' | 'Programm'
  | 'Modul' | 'Module'
  | 'GOP' | 'Bachelorprüfung' | 'Studienleistung' | 'Grundlagenphase' | 'Vertiefungsphase'
  | 'J1' | 'J2' | 'J3' | 'J4' | 'J5' | 'J6' | 'J7' | 'J8' | 'J9' | 'J10' | 'J11' | 'J12' | 'J13'
  | 'J1' | 'J2' | 'J3' | 'J4' | 'J5' | 'J6' | 'J7' | 'J8' | 'J9' | 'J10' | 'J11' | 'J12' | 'J13'
export type Leitidee = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

export interface UiGoal {
  id: string
  landscapeId?: string
  title: string
  description: string
  phase: PhaseCode
  themenfeld: string
  area: string
  level: number
  core: boolean
  weight: number
  tags?: string[]
  leitideen: Leitidee[]
  kompetenzen: string[]
  sourceRef: string
  requires: string[]
  contains: string[]
  examples: string[]
  resourceLinks?: import('./landscapeTypes').ResourceLink[]
  effectiveRequires?: string[]
  inheritedRequires?: string[]
  extendedData?: Record<string, unknown>
  examData?: import('./landscapeTypes').ExamData
  oerContent?: import('./landscapeTypes').OerContent
  experimentData?: import('./landscapeTypes').ExperimentData
  /** Explicit node type ("atomic" | "cluster"), optional for backward compatibility. */
  type?: 'atomic' | 'cluster'
  /** Explicit node kind ("exam" | "tutor" | "memory"), optional for backward compatibility. */
  nodeKind?: 'exam' | 'tutor' | 'memory'
}

function demandLevelToNumber(level: string): number {
  if (level === 'AB1') return 1
  if (level === 'AB2') return 2
  if (level === 'AB3') return 3
  const parsed = Number(level)
  return Number.isFinite(parsed) ? Number(parsed) : 2
}

export function convertLearningGoal(
  goal: LearningGoal,
  origin?: { landscapeId?: string },
): UiGoal {
  const tags = Array.isArray(goal.tags) ? [...goal.tags] : []
  const cl = (goal as { courseLevel?: string }).courseLevel
  if (cl === 'GK') {
    if (!tags.includes('GK')) tags.push('GK')
  } else if (cl === 'LK') {
    if (!tags.includes('LK')) tags.push('LK')
  } else if (cl === 'both') {
    if (!tags.includes('GK')) tags.push('GK')
    if (!tags.includes('LK')) tags.push('LK')
  }

  const dim = goal.dimensionTags
  const nodeType = goal.type ?? ((goal.contains && goal.contains.length > 0) ? 'cluster' : 'atomic')
  const nodeKind = goal.nodeKind ?? (goal.examData ? 'exam' : 'tutor')
  const inferredCore = typeof goal.core === 'boolean' ? goal.core : tags.includes('GK')
  return {
    id: goal.id,
    landscapeId: origin?.landscapeId,
    title: goal.title,
    description: goal.description,
    phase: (dim?.phase as PhaseCode) ?? 'GLOBAL',
    themenfeld: dim?.topicCode ?? '',
    area: dim?.area ?? '',
    level: demandLevelToNumber(dim?.demandLevel ?? ''),
    core: inferredCore,
    weight: goal.weight,
    tags,
    leitideen: (dim?.guidingIdeas as Leitidee[]) ?? [],
    kompetenzen: dim?.processCompetencies ?? [],
    sourceRef: goal.sourceRef ?? '',
    requires: goal.requires ?? [],
    contains: goal.contains ?? [],
    examples: goal.examples ?? [],
    resourceLinks: goal.resourceLinks,
    effectiveRequires: goal.requires ?? [],
    inheritedRequires: [],
    extendedData: goal.extendedData,
    examData: goal.examData,
    oerContent: goal.oerContent,
    experimentData: goal.experimentData,
    type: nodeType,
    nodeKind
  }
}

export interface ExternalRequirement {
  landscapeId: string
  landscapeTitle: string
  subject?: string
  goalId: string
  goalTitle: string
}
