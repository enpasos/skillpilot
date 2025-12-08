import type { LearningGoal } from './landscapeTypes'

export type CourseLevel = string
export type PhaseCode = 'GLOBAL' | 'E' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
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
  effectiveRequires?: string[]
  inheritedRequires?: string[]
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
  return {
    id: goal.id,
    landscapeId: origin?.landscapeId,
    title: goal.title,
    description: goal.description,
    phase: (dim?.phase as PhaseCode) ?? 'GLOBAL',
    themenfeld: dim?.topicCode ?? '',
    area: dim?.area ?? '',
    level: demandLevelToNumber(dim?.demandLevel ?? ''),
    core: goal.core,
    weight: goal.weight,
    tags,
    leitideen: (dim?.guidingIdeas as Leitidee[]) ?? [],
    kompetenzen: dim?.processCompetencies ?? [],
    sourceRef: goal.sourceRef ?? '',
    requires: goal.requires ?? [],
    contains: goal.contains ?? [],
    examples: goal.examples ?? [],
    effectiveRequires: goal.requires ?? [],
    inheritedRequires: [],
  }
}

export interface ExternalRequirement {
  landscapeId: string
  landscapeTitle: string
  subject?: string
  goalId: string
  goalTitle: string
}
