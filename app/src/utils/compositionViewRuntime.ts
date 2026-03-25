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

const isStageAnchorGoal = (goal: UiGoal, stage?: string) => {
  if (!(goal.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG)) {
    return false
  }

  const normalizedStage = normalizeComparableToken(stage)
  const normalizedTitle = normalizeComparableToken(goal.title)

  if (normalizedStage === 'SEKI') {
    return normalizedTitle === 'SEKUNDARSTUFE I'
      || normalizedTitle.startsWith('SEKUNDARSTUFE I ')
      || normalizedTitle.endsWith('(SEK I)')
  }

  if (normalizedStage === 'SEKII') {
    return normalizedTitle === 'SEKUNDARSTUFE II'
      || normalizedTitle.startsWith('SEKUNDARSTUFE II ')
      || normalizedTitle.endsWith('(SEK II)')
      || normalizedTitle === 'KURSSTUFE'
      || normalizedTitle.startsWith('KURSSTUFE ')
  }

  return false
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
  if (sek1Selected && sek2Selected) return 'CrossStage'
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

  if (!jurisdiction) {
    return null
  }

  if (stage === 'SekI') {
    return {
      landscapeId,
      schoolForm: 'Gymnasium',
      jurisdiction,
      stage,
    }
  }

  if (!stage && !courseProfile) {
    return null
  }

  return {
    landscapeId,
    schoolForm: 'Gymnasium',
    jurisdiction,
    ...(stage ? { stage } : {}),
    ...(courseProfile ? { courseProfile } : {}),
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

interface CanonicalSubtreePresentation {
  displayLabel?: string
  treeOrder?: number
}

const collectCanonicalSubtreePresentation = (
  nodes: CompositionViewNode[],
  presentationByGoalId: Map<string, CanonicalSubtreePresentation>,
) => {
  nodes.forEach((node, index) => {
    if (node.kind === 'canonicalSubtree') {
      const existing = presentationByGoalId.get(node.goalId) ?? {}
      const displayLabel = node.displayLabel?.trim()
      presentationByGoalId.set(node.goalId, {
        ...existing,
        ...(displayLabel ? { displayLabel } : {}),
        treeOrder: index,
      })
      return
    }

    collectCanonicalSubtreePresentation(node.children, presentationByGoalId)
  })
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

    if (childIds.length === 0) {
      return null
    }

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

    if (childIds.length === 0) {
      return null
    }

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

const applyAnchoredProjection = ({
  entry,
  view,
  strippedGoals,
  strippedGoalById,
  anchorGoalId,
  nodes,
  referencedGoalIds,
  ensureRootTag = false,
  preserveExistingChildren = true,
}: {
  entry: LandscapeEntry
  view: CompositionView
  strippedGoals: UiGoal[]
  strippedGoalById: Map<string, UiGoal>
  anchorGoalId: string
  nodes: CompositionViewNode[]
  referencedGoalIds: Set<string>
  ensureRootTag?: boolean
  preserveExistingChildren?: boolean
}) => {
  const anchorGoal = strippedGoalById.get(anchorGoalId)
  if (!anchorGoal) {
    return null
  }

  const { syntheticGoals, childIds } = buildSyntheticGoalsForNodes(
    entry,
    view,
    strippedGoalById,
    nodes,
  )
  const preservedAnchorChildren = preserveExistingChildren
    ? (anchorGoal.contains ?? []).filter((childId) => {
      const child = strippedGoalById.get(childId)
      if (!child) return false
      if ((child.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG)) return false
      if (referencedGoalIds.has(childId)) return false
      const referencedSubtreeCache = new Map<string, boolean>()
      if (subtreeReferencesAnyGoal(childId, strippedGoalById, referencedGoalIds, referencedSubtreeCache)) {
        return false
      }
      return true
    })
    : []

  const finalAnchorChildIds = [...preservedAnchorChildren, ...childIds]
  anchorGoal.contains = finalAnchorChildIds
  if (ensureRootTag && !(anchorGoal.tags ?? []).includes(ROOT_TAG)) {
    anchorGoal.tags = [...(anchorGoal.tags ?? []), ROOT_TAG]
  }

  const treeOrderById = new Map(finalAnchorChildIds.map((childId, index) => [childId, index]))
  const applyTreeOrder = (goal: UiGoal): UiGoal => {
    const treeOrder = treeOrderById.get(goal.id)
    if (treeOrder === undefined) return goal
    return {
      ...goal,
      extendedData: {
        ...(goal.extendedData ?? {}),
        treeOrder,
      },
    }
  }

  return {
    ...entry,
    goals: [...syntheticGoals.map(applyTreeOrder), ...strippedGoals.map(applyTreeOrder)],
  }
}

const subtreeReferencesAnyGoal = (
  goalId: string,
  goalById: Map<string, UiGoal>,
  referencedGoalIds: Set<string>,
  cache: Map<string, boolean>,
  visiting: Set<string> = new Set(),
): boolean => {
  const cached = cache.get(goalId)
  if (cached !== undefined) return cached
  if (visiting.has(goalId)) return false

  const goal = goalById.get(goalId)
  if (!goal) {
    cache.set(goalId, false)
    return false
  }

  if (referencedGoalIds.has(goalId)) {
    cache.set(goalId, true)
    return true
  }

  const nextVisiting = new Set(visiting)
  nextVisiting.add(goalId)
  const hasReferencedDescendant = (goal.contains ?? []).some((childId) =>
    subtreeReferencesAnyGoal(childId, goalById, referencedGoalIds, cache, nextVisiting),
  )
  cache.set(goalId, hasReferencedDescendant)
  return hasReferencedDescendant
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
    const presentationByGoalId = new Map<string, CanonicalSubtreePresentation>()
    view.rootNodes.forEach((node) => collectReferencedGoalIds(node, referencedGoalIds))
    collectCanonicalSubtreePresentation(view.rootNodes, presentationByGoalId)

    const goalById = new Map(entry.goals.map((goal) => [goal.id, goal]))
    const presentReferencedGoalIds = Array.from(referencedGoalIds).filter((goalId) => goalById.has(goalId))
    if (presentReferencedGoalIds.length === 0) {
      return entry
    }

    const authoredRootGoal = entry.goals.find((goal) =>
      (goal.tags ?? []).includes(ROOT_TAG) && goal.contains.length > 0,
    )

    const strippedGoals = entry.goals.map((goal) => {
      const strippedGoal = stripRootTag(goal)
      const presentation = presentationByGoalId.get(strippedGoal.id)
      const withRootTag = authoredRootGoal?.id === strippedGoal.id && !(strippedGoal.tags ?? []).includes(ROOT_TAG)
        ? {
          ...strippedGoal,
          tags: [...(strippedGoal.tags ?? []), ROOT_TAG],
        }
        : strippedGoal
      if (!presentation) return withRootTag
      return {
        ...withRootTag,
        title: presentation.displayLabel ?? withRootTag.title,
        extendedData: {
          ...(withRootTag.extendedData ?? {}),
          ...(presentation.displayLabel ? { compositionDisplayLabel: presentation.displayLabel } : {}),
          ...(typeof presentation.treeOrder === 'number' ? { treeOrder: presentation.treeOrder } : {}),
          compositionViewId: view.viewId,
        },
      }
    })
    const strippedGoalById = new Map(strippedGoals.map((goal) => [goal.id, goal]))

    const stageAnchorGoal = strippedGoals.find((goal) => isStageAnchorGoal(goal, view.scope.stage))

    if (stageAnchorGoal && view.rootNodes.length === 1 && view.rootNodes[0]?.kind === 'structure') {
      const rootStructure = view.rootNodes[0]
      const anchoredStageEntry = applyAnchoredProjection({
        entry,
        view,
        strippedGoals,
        strippedGoalById,
        anchorGoalId: stageAnchorGoal.id,
        nodes: rootStructure.children,
        referencedGoalIds,
      })
      if (anchoredStageEntry) {
        return anchoredStageEntry
      }
    }

    if (authoredRootGoal) {
      const rootProjectionNodes = view.rootNodes.length === 1
        && view.rootNodes[0]?.kind === 'structure'
        && normalizeComparableToken(view.rootNodes[0].label) === normalizeComparableToken(authoredRootGoal.title)
        ? view.rootNodes[0].children
        : view.rootNodes
      const anchoredRootEntry = applyAnchoredProjection({
        entry,
        view,
        strippedGoals,
        strippedGoalById,
        anchorGoalId: authoredRootGoal.id,
        nodes: rootProjectionNodes,
        referencedGoalIds,
        ensureRootTag: true,
        preserveExistingChildren: false,
      })
      if (anchoredRootEntry) {
        return anchoredRootEntry
      }
    }

    const syntheticGoals = buildSyntheticGoals(entry, view, strippedGoalById)

    return {
      ...entry,
      goals: [...syntheticGoals, ...strippedGoals],
    }
  })
}
