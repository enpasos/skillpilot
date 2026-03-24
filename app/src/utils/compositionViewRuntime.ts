import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { UiGoal } from '../goalTypes'
import type { GoalPlacementContext, LearningLandscape } from '../landscapeTypes'
import {
  normalizeCompositionView,
  type CompositionStructureNode,
  type CompositionView,
  type CompositionViewNode,
} from './authoring/compositionViewAuthoring'
import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import { GLOBAL_STAGE_SCOPE_CONFIG_IDS, isCourseProfileFilterId } from './personalCurriculumStageScope'

const ROOT_TAG = 'root'
const SYNTHETIC_PROGRAM_UNIT_TAG = 'synthetic:program-unit'
const JURISDICTION_PATTERN = /^DE-[A-Z]{2}$/i

type PersonalCurriculumConfig = Record<string, { selected?: boolean; filterId?: string }>

export interface RuntimeCompositionScope extends GoalPlacementContext {
  landscapeId: string
}

const normalizeComparableToken = (value?: string) => value?.trim().toUpperCase() ?? ''

const isJurisdictionFilterId = (value?: string) => JURISDICTION_PATTERN.test(value?.trim() ?? '')

const normalizeStageLabel = (stage?: string) => {
  const normalized = normalizeComparableToken(stage)
  if (normalized === 'SEKII') return 'Sekundarstufe II'
  if (normalized === 'SEKI') return 'Sekundarstufe I'
  return undefined
}

const stripRootTag = (goal: UiGoal): UiGoal => ({
  ...goal,
  tags: (goal.tags ?? []).filter((tag) => tag !== ROOT_TAG),
  contains: [...goal.contains],
  requires: [...goal.requires],
  effectiveRequires: goal.effectiveRequires ? [...goal.effectiveRequires] : goal.effectiveRequires,
  inheritedRequires: goal.inheritedRequires ? [...goal.inheritedRequires] : goal.inheritedRequires,
})

const parsePersonalCurriculum = (value?: string | null): PersonalCurriculumConfig => {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    const config: PersonalCurriculumConfig = {}
    Object.entries(parsed as Record<string, unknown>).forEach(([key, entry]) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return
      const record = entry as Record<string, unknown>
      config[key] = {
        selected: typeof record.selected === 'boolean' ? record.selected : undefined,
        filterId: typeof record.filterId === 'string' ? record.filterId : undefined,
      }
    })
    return config
  } catch {
    return {}
  }
}

const inferStageFromPersonalCurriculum = (config: PersonalCurriculumConfig): string | undefined => {
  const sek1Selected = config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]?.selected ?? true
  const sek2Selected = config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]?.selected ?? true

  if (sek2Selected && !sek1Selected) return 'SekII'
  if (sek1Selected && !sek2Selected) return 'SekI'
  return undefined
}

export const deriveRuntimeCompositionScope = ({
  landscapeId,
  landscapeMeta,
  activeFilter,
  learnerPersonalCurriculum,
}: {
  landscapeId: string
  landscapeMeta?: LearningLandscape | null
  activeFilter?: string
  learnerPersonalCurriculum?: string | null
}): RuntimeCompositionScope | null => {
  if (!landscapeId || !landscapeMeta?.frameworkId?.startsWith('canonical-gymnasium')) {
    return null
  }

  const personalCurriculum = parsePersonalCurriculum(learnerPersonalCurriculum)
  const rootFilterId = personalCurriculum[CANONICAL_GYMNASIUM_ROOT_ID]?.filterId
  const landscapeFilterId = personalCurriculum[landscapeId]?.filterId
  const normalizedActiveFilter = normalizeComparableToken(activeFilter)
  const normalizedLandscapeFilterId = normalizeComparableToken(landscapeFilterId)
  const normalizedRootFilterId = normalizeComparableToken(rootFilterId)

  const jurisdiction = [normalizedRootFilterId, normalizedLandscapeFilterId, normalizedActiveFilter]
    .find((value) => isJurisdictionFilterId(value))
  const stage = inferStageFromPersonalCurriculum(personalCurriculum)
  const courseProfileCandidate = [landscapeFilterId, activeFilter].find((value) => isCourseProfileFilterId(value))
  const courseProfile = courseProfileCandidate && normalizeComparableToken(courseProfileCandidate) !== 'ALL'
    ? normalizeComparableToken(courseProfileCandidate)
    : undefined

  if (!jurisdiction || !stage || !courseProfile) {
    return null
  }

  return {
    landscapeId,
    schoolForm: 'Gymnasium',
    jurisdiction,
    stage,
    courseProfile,
  }
}

const createSyntheticStructureGoal = ({
  entry,
  view,
  node,
  contains,
  treeOrder,
  isRoot,
}: {
  entry: LandscapeEntry
  view: CompositionView
  node: CompositionStructureNode
  contains: string[]
  treeOrder: number
  isRoot: boolean
}): UiGoal => ({
  id: `composition:${view.viewId}:structure:${node.id}`,
  landscapeId: entry.meta.landscapeId,
  title: node.label,
  description: node.label,
  phase: 'GLOBAL',
  themenfeld: '',
  area: '',
  level: 0,
  core: true,
  weight: 1,
  tags: isRoot ? [SYNTHETIC_PROGRAM_UNIT_TAG, ROOT_TAG] : [SYNTHETIC_PROGRAM_UNIT_TAG],
  leitideen: [],
  kompetenzen: [],
  sourceRef: '',
  requires: [],
  contains,
  examples: [],
  competencyRefs: [],
  effectiveRequires: [],
  inheritedRequires: [],
  extendedData: {
    treeOrder,
    syntheticStructureKind: 'compositionView',
    compositionViewId: view.viewId,
    compositionNodeId: node.id,
  },
  type: 'cluster',
  nodeKind: 'tutor',
})

const collectReferencedGoalIds = (node: CompositionViewNode, goalIds: Set<string>) => {
  if (node.kind === 'canonicalSubtree') {
    goalIds.add(node.goalId)
    return
  }

  node.children.forEach((child) => collectReferencedGoalIds(child, goalIds))
}

const buildSyntheticGoals = (
  entry: LandscapeEntry,
  view: CompositionView,
  goalById: Map<string, UiGoal>,
) => {
  const syntheticGoals: UiGoal[] = []

  const materializeNode = (
    node: CompositionViewNode,
    siblingOrder: number,
    isRoot: boolean,
  ): string | null => {
    if (node.kind === 'canonicalSubtree') {
      return goalById.has(node.goalId) ? node.goalId : null
    }

    const childIds = node.children
      .map((child, childIndex) => materializeNode(child, childIndex, false))
      .filter((childId): childId is string => typeof childId === 'string')

    const syntheticGoal = createSyntheticStructureGoal({
      entry,
      view,
      node,
      contains: childIds,
      treeOrder: siblingOrder,
      isRoot,
    })
    syntheticGoals.push(syntheticGoal)
    return syntheticGoal.id
  }

  view.rootNodes.forEach((node, index) => {
    materializeNode(node, index, true)
  })

  return syntheticGoals
}

const buildSyntheticGoalsForNodes = (
  entry: LandscapeEntry,
  view: CompositionView,
  goalById: Map<string, UiGoal>,
  nodes: CompositionViewNode[],
) => {
  const syntheticGoals: UiGoal[] = []

  const materializeNode = (
    node: CompositionViewNode,
    siblingOrder: number,
  ): string | null => {
    if (node.kind === 'canonicalSubtree') {
      return goalById.has(node.goalId) ? node.goalId : null
    }

    const childIds = node.children
      .map((child, childIndex) => materializeNode(child, childIndex))
      .filter((childId): childId is string => typeof childId === 'string')

    const syntheticGoal = createSyntheticStructureGoal({
      entry,
      view,
      node,
      contains: childIds,
      treeOrder: siblingOrder,
      isRoot: false,
    })
    syntheticGoals.push(syntheticGoal)
    return syntheticGoal.id
  }

  const childIds = nodes
    .map((node, index) => materializeNode(node, index))
    .filter((childId): childId is string => typeof childId === 'string')

  return { syntheticGoals, childIds }
}

export const applyCompositionViewProjection = (
  entries: LandscapeEntry[],
  rawView: unknown,
): LandscapeEntry[] => {
  if (!rawView) return entries

  const view = normalizeCompositionView(rawView)
  if (!view.landscapeId || view.rootNodes.length === 0) {
    return entries
  }

  return entries.map((entry) => {
    if (entry.meta.landscapeId !== view.landscapeId) {
      return entry
    }

    const referencedGoalIds = new Set<string>()
    view.rootNodes.forEach((node) => collectReferencedGoalIds(node, referencedGoalIds))

    const goalById = new Map(entry.goals.map((goal) => [goal.id, goal]))
    const hasAllReferencedGoals = Array.from(referencedGoalIds).every((goalId) => goalById.has(goalId))
    if (!hasAllReferencedGoals) {
      return entry
    }

    const strippedGoals = entry.goals.map(stripRootTag)
    const strippedGoalById = new Map(strippedGoals.map((goal) => [goal.id, goal]))

    const stageLabel = normalizeStageLabel(view.scope.stage)
    const stageAnchorGoal = stageLabel
      ? strippedGoals.find((goal) =>
        (goal.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG) && goal.title === stageLabel,
      )
      : undefined

    if (stageAnchorGoal && view.rootNodes.length === 1 && view.rootNodes[0]?.kind === 'structure') {
      const rootStructure = view.rootNodes[0]
      const { syntheticGoals, childIds } = buildSyntheticGoalsForNodes(
        entry,
        view,
        strippedGoalById,
        rootStructure.children,
      )
      const preservedStageChildren = (stageAnchorGoal.contains ?? []).filter((childId) => {
        const child = strippedGoalById.get(childId)
        if (!child) return false
        if ((child.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG)) return false
        if (referencedGoalIds.has(childId)) return false
        return true
      })

      stageAnchorGoal.contains = [...preservedStageChildren, ...childIds]
      return {
        ...entry,
        goals: [...syntheticGoals, ...strippedGoals],
      }
    }

    const syntheticGoals = buildSyntheticGoals(entry, view, strippedGoalById)

    return {
      ...entry,
      goals: [...syntheticGoals, ...strippedGoals],
    }
  })
}
