import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { UiGoal } from '../goalTypes'
import type { GoalPlacementContext } from '../landscapeTypes'
import {
  getCompositionProjectionRole,
  normalizeCompositionView,
  type CompositionProjectionRole,
  type CompositionStructureNode,
  type CompositionView,
  type CompositionViewNode,
} from './authoring/compositionViewAuthoring'
import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import { normalizeDurationModel } from './durationModel'
import { splitFilterIds } from './goalFilters'
import { normalizeJurisdictionCode } from './jurisdictionMetadata'
import {
  isCourseProfileFilterId,
  resolvePersonalCurriculumStageScope,
} from './personalCurriculumStageScope'

const ROOT_TAG = 'root'
const SYNTHETIC_PROGRAM_UNIT_TAG = 'synthetic:program-unit'

type PersonalCurriculumConfig = Record<string, {
  selected?: boolean
  filterId?: string
  durationModel?: string
  stage?: string
}>

export interface RuntimeCompositionScope extends GoalPlacementContext {
  landscapeId: string
}

export const shouldApplyLearnerPlacementFallback = (
  landscapeId: string,
  compositionManagedLandscapeIds: ReadonlySet<string>,
) => !compositionManagedLandscapeIds.has(landscapeId)

const normalizeComparableToken = (value?: string) => value?.trim().toUpperCase() ?? ''

const getStructuralTreeOrder = (goal: UiGoal) =>
  typeof goal.extendedData?.treeOrder === 'number'
    ? goal.extendedData.treeOrder
    : Number.MAX_SAFE_INTEGER

const isSyntheticProgramUnit = (goal: UiGoal) =>
  (goal.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG)

const normalizeCourseProfileScope = (value?: string) => {
  const normalized = normalizeComparableToken(value)
  if (normalized === 'ALL') return 'GK+LK'
  return normalized || undefined
}

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

const extractScopeToken = (goal: Pick<UiGoal, 'title' | 'phase'> | undefined): string | undefined => {
  if (!goal) return undefined

  const normalizedPhase = normalizeComparableToken(goal.phase)
  if (/^J([5-9]|10)$/u.test(normalizedPhase)) {
    return normalizedPhase
  }
  if (/^(E|Q[1-4]|ABITUR)$/u.test(normalizedPhase)) {
    return normalizedPhase
  }

  const normalizedTitle = normalizeComparableToken(goal.title)
  const yearMatch = /^JAHRGANG(?:SSTUFE)?\s+([5-9]|10)\b/u.exec(normalizedTitle)
  if (yearMatch) {
    return `J${yearMatch[1]}`
  }

  if (normalizedTitle.startsWith('E-PHASE')) {
    return 'E'
  }

  const qMatch = /^Q([1-4])(?:\b|[.\s:\-–(])/u.exec(normalizedTitle)
  if (qMatch) {
    return `Q${qMatch[1]}`
  }

  return undefined
}

const isExplicitScopeAnchor = (goal: UiGoal, scopeToken?: string) => {
  if (!scopeToken) return false
  const normalizedTitle = normalizeComparableToken(goal.title)
  if (scopeToken.startsWith('J')) {
    return normalizedTitle === `JAHRGANGSSTUFE ${scopeToken.slice(1)}`
      || normalizedTitle === `JAHRGANG ${scopeToken.slice(1)}`
      || normalizedTitle === scopeToken
  }
  if (scopeToken === 'E') {
    return normalizedTitle === 'E-PHASE' || normalizedTitle === 'E'
  }
  if (/^Q[1-4]$/u.test(scopeToken)) {
    return normalizedTitle === scopeToken
  }
  return false
}

const collectReachableGoalIds = (goalById: Map<string, UiGoal>) => {
  const reachable = new Set<string>()
  const stack = Array.from(goalById.values())
    .filter((goal) => (goal.tags ?? []).includes(ROOT_TAG))
    .map((goal) => goal.id)

  while (stack.length > 0) {
    const goalId = stack.pop()
    if (!goalId || reachable.has(goalId)) continue
    reachable.add(goalId)
    const goal = goalById.get(goalId)
    if (!goal) continue
    ;(goal.contains ?? []).forEach((childId) => {
      if (!reachable.has(childId)) {
        stack.push(childId)
      }
    })
  }

  return reachable
}

const buildParentIdsByChild = (goalById: Map<string, UiGoal>) => {
  const parentIdsByChild = new Map<string, string[]>()
  goalById.forEach((goal) => {
    ;(goal.contains ?? []).forEach((childId) => {
      const parentIds = parentIdsByChild.get(childId) ?? []
      parentIds.push(goal.id)
      parentIdsByChild.set(childId, parentIds)
    })
  })
  return parentIdsByChild
}

const compareSupplementCandidates = (
  left: { goal: UiGoal; distance: number },
  right: { goal: UiGoal; distance: number },
) => {
  if (left.distance !== right.distance) {
    return left.distance - right.distance
  }

  const leftIsCompositionStructure = isSyntheticProgramUnit(left.goal) && left.goal.extendedData?.syntheticStructureKind === 'compositionView'
  const rightIsCompositionStructure = isSyntheticProgramUnit(right.goal) && right.goal.extendedData?.syntheticStructureKind === 'compositionView'
  if (leftIsCompositionStructure !== rightIsCompositionStructure) {
    return leftIsCompositionStructure ? -1 : 1
  }

  const leftIsSynthetic = isSyntheticProgramUnit(left.goal)
  const rightIsSynthetic = isSyntheticProgramUnit(right.goal)
  if (leftIsSynthetic !== rightIsSynthetic) {
    return leftIsSynthetic ? -1 : 1
  }

  const leftTreeOrder = getStructuralTreeOrder(left.goal)
  const rightTreeOrder = getStructuralTreeOrder(right.goal)
  if (leftTreeOrder !== rightTreeOrder) {
    return leftTreeOrder - rightTreeOrder
  }

  return left.goal.title.localeCompare(right.goal.title, undefined, { sensitivity: 'base' })
}

const findBestReachableScopeParentId = (
  routeGoal: UiGoal,
  goalById: Map<string, UiGoal>,
  reachableGoalIds: Set<string>,
) => {
  const routeScopeToken = extractScopeToken(routeGoal)
  if (!routeScopeToken) return undefined

  const candidates = Array.from(reachableGoalIds)
    .map((goalId) => goalById.get(goalId))
    .filter((goal): goal is UiGoal => !!goal)
    .filter((goal) => extractScopeToken(goal) === routeScopeToken)
    .map((goal) => ({ goal, distance: 0 }))
    .sort(compareSupplementCandidates)

  return candidates[0]?.goal.id
}

const findBestSupplementAnchorId = ({
  routeGoalId,
  routeGoal,
  targetParentId,
  goalById,
  reachableGoalIds,
  parentIdsByChild,
}: {
  routeGoalId: string
  routeGoal: UiGoal
  targetParentId: string
  goalById: Map<string, UiGoal>
  reachableGoalIds: Set<string>
  parentIdsByChild: Map<string, string[]>
}) => {
  const routeScopeToken = extractScopeToken(routeGoal)
  const queue: Array<{ goalId: string; distance: number }> = [{ goalId: routeGoalId, distance: 0 }]
  const visited = new Set<string>([routeGoalId])
  const candidates: Array<{ goal: UiGoal; distance: number }> = []

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) continue
    const currentGoal = goalById.get(current.goalId)
    if (!currentGoal) continue

    if (
      current.goalId !== targetParentId
      && current.goalId !== routeGoalId
      && (currentGoal.contains ?? []).length > 0
      && !isExplicitScopeAnchor(currentGoal, routeScopeToken)
    ) {
      candidates.push({ goal: currentGoal, distance: current.distance })
    }

    const parentIds = parentIdsByChild.get(current.goalId) ?? []
    parentIds.forEach((parentId) => {
      if (visited.has(parentId) || reachableGoalIds.has(parentId)) return
      visited.add(parentId)
      queue.push({ goalId: parentId, distance: current.distance + 1 })
    })
  }

  if (candidates.length > 0) {
    return candidates.sort(compareSupplementCandidates)[0]?.goal.id
  }

  return routeGoalId !== targetParentId ? routeGoalId : undefined
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

    const rawConfig = (() => {
      const nested = (parsed as Record<string, unknown>).personalCurriculum
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        return nested as Record<string, unknown>
      }
      return parsed as Record<string, unknown>
    })()

    const config: PersonalCurriculumConfig = {}
    Object.entries(rawConfig).forEach(([key, entry]) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return
      const record = entry as Record<string, unknown>
      config[key] = {
        selected: typeof record.selected === 'boolean' ? record.selected : undefined,
        filterId: typeof record.filterId === 'string' ? record.filterId : undefined,
        durationModel: typeof record.durationModel === 'string' ? record.durationModel : undefined,
        stage: typeof record.stage === 'string' ? record.stage : undefined,
      }
    })
    return config
  } catch {
    return {}
  }
}

const pushScopedFilter = (filters: string[], value?: string | null) => {
  splitFilterIds(value ?? undefined).forEach((normalized) => {
    if (!normalized || normalized.toLowerCase() === 'all') return
    if (!filters.includes(normalized)) {
      filters.push(normalized)
    }
  })
}

export const deriveRuntimeGoalPlacementFilters = ({
  landscapeId,
  rootLandscapeId = CANONICAL_GYMNASIUM_ROOT_ID,
  activeFilter,
  learnerPersonalCurriculum,
}: {
  landscapeId: string
  rootLandscapeId?: string
  activeFilter?: string
  learnerPersonalCurriculum?: string | null
}) => {
  const personalCurriculum = parsePersonalCurriculum(learnerPersonalCurriculum)
  const rootConfig = personalCurriculum[rootLandscapeId]
  const landscapeConfig = personalCurriculum[landscapeId]
  const filters: string[] = []

  pushScopedFilter(filters, rootConfig?.filterId)
  pushScopedFilter(filters, landscapeConfig?.filterId)
  pushScopedFilter(filters, activeFilter)

  const durationModel = [
    landscapeConfig?.durationModel,
    rootConfig?.durationModel,
  ]
    .map((value) => normalizeDurationModel(value))
    .find((value): value is NonNullable<typeof value> => !!value)

  if (durationModel && !filters.includes(durationModel)) {
    filters.push(durationModel)
  }

  return filters
}

export const deriveRuntimeCompositionScope = ({
  landscapeId,
  rootLandscapeId = CANONICAL_GYMNASIUM_ROOT_ID,
  scopeEnabled,
  catalogJurisdictions,
  activeFilter,
  learnerPersonalCurriculum,
}: {
  landscapeId: string
  rootLandscapeId?: string
  scopeEnabled: boolean
  catalogJurisdictions?: readonly string[]
  activeFilter?: string
  learnerPersonalCurriculum?: string | null
}): RuntimeCompositionScope | null => {
  if (!landscapeId || !scopeEnabled) {
    return null
  }

  const personalCurriculum = parsePersonalCurriculum(learnerPersonalCurriculum)
  const rootFilterId = personalCurriculum[rootLandscapeId]?.filterId
  const landscapeFilterId = personalCurriculum[landscapeId]?.filterId
  const activeFilters = splitFilterIds(activeFilter)
  const scopedFilters = [rootFilterId, landscapeFilterId, ...activeFilters]
  const catalogJurisdictionSet = new Set(catalogJurisdictions ?? [])
  const jurisdiction = scopedFilters
    .map((value) => value?.trim())
    .find((value): value is string => !!value && catalogJurisdictionSet.has(value))
    ?? scopedFilters
      .map((value) => normalizeJurisdictionCode(value))
      .find((value): value is NonNullable<typeof value> => !!value)
  const courseProfileCandidate = [landscapeFilterId, ...activeFilters].find((value) => isCourseProfileFilterId(value))
  const courseProfile = normalizeCourseProfileScope(courseProfileCandidate)
  const stage = resolvePersonalCurriculumStageScope(personalCurriculum, {
    landscapeId,
    rootLandscapeId,
  })
  const durationModel = [
    personalCurriculum[landscapeId]?.durationModel,
    personalCurriculum[rootLandscapeId]?.durationModel,
    rootFilterId,
    landscapeFilterId,
    ...activeFilters,
  ]
    .map((value) => normalizeDurationModel(value))
    .find((value): value is NonNullable<typeof value> => !!value)

  if (!jurisdiction && !stage && !courseProfile && !durationModel) {
    return null
  }

  if (stage === 'SekI') {
    return {
      landscapeId,
      schoolForm: 'Gymnasium',
      ...(jurisdiction ? { jurisdiction } : {}),
      stage,
      ...(durationModel ? { durationModel } : {}),
    }
  }

  return {
    landscapeId,
    schoolForm: 'Gymnasium',
    ...(jurisdiction ? { jurisdiction } : {}),
    ...(stage ? { stage } : {}),
    ...(courseProfile ? { courseProfile } : {}),
    ...(durationModel ? { durationModel } : {}),
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

const resolveLandscapeEntryGoalId = (
  landscapeId: string,
  rootGoalIdByLandscapeId: Map<string, string>,
): string | null => rootGoalIdByLandscapeId.get(landscapeId) ?? null

type ProjectionRoleSource = 'landscapeEntry' | 'canonicalSubtree' | 'goalEntry'

interface ProjectionRoleAssignment {
  role: CompositionProjectionRole
  source: ProjectionRoleSource
  distance: number
}

const PROJECTION_ROLE_SOURCE_PRIORITY: Record<ProjectionRoleSource, number> = {
  landscapeEntry: 0,
  canonicalSubtree: 1,
  goalEntry: 2,
}

const isMoreSpecificProjectionRoleAssignment = (
  candidate: ProjectionRoleAssignment,
  current: ProjectionRoleAssignment | undefined,
) => {
  if (!current) return true

  const candidatePriority = PROJECTION_ROLE_SOURCE_PRIORITY[candidate.source]
  const currentPriority = PROJECTION_ROLE_SOURCE_PRIORITY[current.source]
  if (candidatePriority !== currentPriority) {
    return candidatePriority > currentPriority
  }

  if (candidate.distance !== current.distance) {
    return candidate.distance < current.distance
  }

  return candidate.role === 'target' && current.role === 'prerequisiteOnly'
}

const collectProjectionRoleGoalIds = (
  nodes: CompositionViewNode[],
  goalById: Map<string, UiGoal>,
  rootGoalIdByLandscapeId: Map<string, string>,
) => {
  const assignmentByGoalId = new Map<string, ProjectionRoleAssignment>()

  const assignGoal = (goalId: string, assignment: ProjectionRoleAssignment) => {
    if (isMoreSpecificProjectionRoleAssignment(assignment, assignmentByGoalId.get(goalId))) {
      assignmentByGoalId.set(goalId, assignment)
    }
  }

  const assignSubtree = (
    rootGoalId: string,
    role: CompositionProjectionRole,
    source: Extract<ProjectionRoleSource, 'landscapeEntry' | 'canonicalSubtree'>,
  ) => {
    const shortestDistanceByGoalId = new Map<string, number>()
    const queue: Array<{ goalId: string; distance: number }> = [{ goalId: rootGoalId, distance: 0 }]

    for (let index = 0; index < queue.length; index += 1) {
      const { goalId, distance } = queue[index]
      const knownDistance = shortestDistanceByGoalId.get(goalId)
      if (knownDistance !== undefined && knownDistance <= distance) continue
      shortestDistanceByGoalId.set(goalId, distance)
      assignGoal(goalId, { role, source, distance })

      const goal = goalById.get(goalId)
      ;(goal?.contains ?? []).forEach((childId) => {
        queue.push({ goalId: childId, distance: distance + 1 })
      })
    }
  }

  const visitNode = (node: CompositionViewNode) => {
    if (node.kind === 'structure') {
      node.children.forEach(visitNode)
      return
    }

    if (node.kind === 'landscapeEntry') {
      const rootGoalId = resolveLandscapeEntryGoalId(node.landscapeId, rootGoalIdByLandscapeId)
      if (rootGoalId) assignSubtree(rootGoalId, 'target', 'landscapeEntry')
      return
    }

    const role = getCompositionProjectionRole(node)
    if (node.kind === 'canonicalSubtree') {
      assignSubtree(node.goalId, role, 'canonicalSubtree')
    } else {
      assignGoal(node.goalId, { role, source: 'goalEntry', distance: 0 })
    }
  }

  nodes.forEach(visitNode)
  const targetGoalIds = new Set<string>()
  const prerequisiteOnlyGoalIds = new Set<string>()
  assignmentByGoalId.forEach((assignment, goalId) => {
    if (assignment.role === 'prerequisiteOnly') {
      prerequisiteOnlyGoalIds.add(goalId)
    } else {
      targetGoalIds.add(goalId)
    }
  })
  return { targetGoalIds, prerequisiteOnlyGoalIds }
}

const collectReferencedGoalIds = (
  node: CompositionViewNode,
  goalIds: Set<string>,
  rootGoalIdByLandscapeId: Map<string, string>,
) => {
  if (node.kind === 'canonicalSubtree') {
    if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return
    goalIds.add(node.goalId)
    return
  }

  if (node.kind === 'goalEntry') {
    if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return
    goalIds.add(node.goalId)
    return
  }

  if (node.kind === 'landscapeEntry') {
    const goalId = resolveLandscapeEntryGoalId(node.landscapeId, rootGoalIdByLandscapeId)
    if (goalId) {
      goalIds.add(goalId)
    }
    return
  }

  node.children.forEach((child) => collectReferencedGoalIds(child, goalIds, rootGoalIdByLandscapeId))
}

interface CanonicalSubtreePresentation {
  displayLabel?: string
  treeOrder?: number
  opaque?: boolean
}

const collectCanonicalSubtreePresentation = (
  nodes: CompositionViewNode[],
  presentationByGoalId: Map<string, CanonicalSubtreePresentation>,
  rootGoalIdByLandscapeId: Map<string, string>,
) => {
  nodes.forEach((node, index) => {
    if (node.kind === 'canonicalSubtree') {
      if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return
      const existing = presentationByGoalId.get(node.goalId) ?? {}
      const displayLabel = node.displayLabel?.trim()
      presentationByGoalId.set(node.goalId, {
        ...existing,
        ...(displayLabel ? { displayLabel } : {}),
        treeOrder: index,
      })
      return
    }

    if (node.kind === 'goalEntry') {
      if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return
      const existing = presentationByGoalId.get(node.goalId) ?? {}
      const displayLabel = node.displayLabel?.trim()
      presentationByGoalId.set(node.goalId, {
        ...existing,
        ...(displayLabel ? { displayLabel } : {}),
        treeOrder: index,
        opaque: true,
      })
      return
    }

    if (node.kind === 'landscapeEntry') {
      const resolvedGoalId = resolveLandscapeEntryGoalId(node.landscapeId, rootGoalIdByLandscapeId)
      if (!resolvedGoalId) return
      const existing = presentationByGoalId.get(resolvedGoalId) ?? {}
      const displayLabel = node.displayLabel?.trim()
      presentationByGoalId.set(resolvedGoalId, {
        ...existing,
        ...(displayLabel ? { displayLabel } : {}),
        treeOrder: index,
      })
      return
    }

    collectCanonicalSubtreePresentation(node.children, presentationByGoalId, rootGoalIdByLandscapeId)
  })
}

const buildSyntheticGoals = (
  entry: LandscapeEntry,
  view: CompositionView,
  goalById: Map<string, UiGoal>,
  rootGoalIdByLandscapeId: Map<string, string>,
) => {
  const syntheticGoals: UiGoal[] = []

  const materializeNode = (
    node: CompositionViewNode,
    siblingOrder: number,
    isRoot: boolean,
  ): string | null => {
    if (node.kind === 'canonicalSubtree') {
      if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return null
      return goalById.has(node.goalId) ? node.goalId : null
    }

    if (node.kind === 'goalEntry') {
      if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return null
      return goalById.has(node.goalId) ? node.goalId : null
    }

    if (node.kind === 'landscapeEntry') {
      const goalId = resolveLandscapeEntryGoalId(node.landscapeId, rootGoalIdByLandscapeId)
      return goalId && goalById.has(goalId) ? goalId : null
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
  rootGoalIdByLandscapeId: Map<string, string>,
) => {
  const syntheticGoals: UiGoal[] = []

  const materializeNode = (
    node: CompositionViewNode,
    siblingOrder: number,
  ): string | null => {
    if (node.kind === 'canonicalSubtree') {
      if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return null
      return goalById.has(node.goalId) ? node.goalId : null
    }

    if (node.kind === 'goalEntry') {
      if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return null
      return goalById.has(node.goalId) ? node.goalId : null
    }

    if (node.kind === 'landscapeEntry') {
      const goalId = resolveLandscapeEntryGoalId(node.landscapeId, rootGoalIdByLandscapeId)
      return goalId && goalById.has(goalId) ? goalId : null
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
  rootGoalIdByLandscapeId,
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
  rootGoalIdByLandscapeId: Map<string, string>
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
    rootGoalIdByLandscapeId,
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

export const compositionViewExposesGoal = (
  entries: LandscapeEntry[],
  rawView: unknown,
  goalId: string,
): boolean => {
  if (!goalId || !rawView) return false

  const view = normalizeCompositionView(rawView)
  if (!view.landscapeId || view.rootNodes.length === 0) {
    return false
  }

  const goalByIdAcrossEntries = new Map(entries.flatMap((entry) => entry.goals.map((goal) => [goal.id, goal] as const)))
  if (!goalByIdAcrossEntries.has(goalId)) {
    return false
  }

  const rootGoalIdByLandscapeId = new Map(
    entries.flatMap((entry) => {
      const rootGoal = entry.goals.find((goal) => (goal.tags ?? []).includes(ROOT_TAG) && goal.contains.length > 0)
      return rootGoal ? [[entry.meta.landscapeId, rootGoal.id] as const] : []
    }),
  )
  const { targetGoalIds } = collectProjectionRoleGoalIds(
    view.rootNodes,
    goalByIdAcrossEntries,
    rootGoalIdByLandscapeId,
  )
  return targetGoalIds.has(goalId)
}

export const applyMatchedCompositionRouteGoalProjection = (
  entries: LandscapeEntry[],
  routeGoalId?: string | null,
): LandscapeEntry[] => {
  if (!routeGoalId) return entries

  return entries.map((entry) => {
    const goalById = new Map(entry.goals.map((goal) => [goal.id, goal] as const))
    const routeGoal = goalById.get(routeGoalId)
    if (!routeGoal) {
      return entry
    }

    const reachableGoalIds = collectReachableGoalIds(goalById)
    if (reachableGoalIds.has(routeGoalId)) {
      return entry
    }

    const targetParentId = findBestReachableScopeParentId(routeGoal, goalById, reachableGoalIds)
    if (!targetParentId) {
      return entry
    }

    const parentIdsByChild = buildParentIdsByChild(goalById)
    const supplementalAnchorId = findBestSupplementAnchorId({
      routeGoalId,
      routeGoal,
      targetParentId,
      goalById,
      reachableGoalIds,
      parentIdsByChild,
    })
    if (!supplementalAnchorId) {
      return entry
    }

    const targetParent = goalById.get(targetParentId)
    if (!targetParent || (targetParent.contains ?? []).includes(supplementalAnchorId)) {
      return entry
    }

    const clonedGoals = entry.goals.map((goal) =>
      goal.id === targetParentId
        ? {
          ...goal,
          contains: [...(goal.contains ?? []), supplementalAnchorId],
        }
        : {
          ...goal,
          contains: Array.isArray(goal.contains) ? [...goal.contains] : [],
        },
    )

    return {
      ...entry,
      goals: clonedGoals,
    }
  })
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

  const goalByIdAcrossEntries = new Map(entries.flatMap((entry) => entry.goals.map((goal) => [goal.id, goal] as const)))
  const rootGoalIdByLandscapeId = new Map(
    entries.flatMap((entry) => {
      const rootGoal = entry.goals.find((goal) => (goal.tags ?? []).includes(ROOT_TAG) && goal.contains.length > 0)
      return rootGoal ? [[entry.meta.landscapeId, rootGoal.id] as const] : []
    }),
  )
  const { prerequisiteOnlyGoalIds } = collectProjectionRoleGoalIds(
    view.rootNodes,
    goalByIdAcrossEntries,
    rootGoalIdByLandscapeId,
  )

  return entries.map((entry) => {
    if (entry.meta.landscapeId !== view.landscapeId) {
      return entry
    }

    const referencedGoalIds = new Set<string>()
    const presentationByGoalId = new Map<string, CanonicalSubtreePresentation>()
    view.rootNodes.forEach((node) => collectReferencedGoalIds(node, referencedGoalIds, rootGoalIdByLandscapeId))
    collectCanonicalSubtreePresentation(view.rootNodes, presentationByGoalId, rootGoalIdByLandscapeId)

    const presentReferencedGoalIds = Array.from(referencedGoalIds).filter((goalId) => goalByIdAcrossEntries.has(goalId))
    if (presentReferencedGoalIds.length === 0 && prerequisiteOnlyGoalIds.size === 0) {
      return entry
    }

    const authoredRootGoal = entry.goals.find((goal) =>
      (goal.tags ?? []).includes(ROOT_TAG) && goal.contains.length > 0,
    )

    const strippedGoals = entry.goals.map((goal) => {
      const strippedGoal = stripRootTag({
        ...goal,
        contains: (goal.contains ?? []).filter((childId) => !prerequisiteOnlyGoalIds.has(childId)),
      })
      const presentation = presentationByGoalId.get(strippedGoal.id)
      const withRootTag = authoredRootGoal?.id === strippedGoal.id && !(strippedGoal.tags ?? []).includes(ROOT_TAG)
        ? {
          ...strippedGoal,
          tags: [...(strippedGoal.tags ?? []), ROOT_TAG],
        }
        : strippedGoal
      const maybeOpaque = presentation?.opaque
        ? {
          ...withRootTag,
          contains: [],
        }
        : withRootTag
      if (!presentation) return maybeOpaque
      return {
        ...maybeOpaque,
        title: presentation.displayLabel ?? maybeOpaque.title,
        extendedData: {
          ...(maybeOpaque.extendedData ?? {}),
          ...(presentation.displayLabel ? { compositionDisplayLabel: presentation.displayLabel } : {}),
          ...(typeof presentation.treeOrder === 'number' ? { treeOrder: presentation.treeOrder } : {}),
          ...(presentation.opaque ? { compositionEntryKind: 'goalEntry' } : {}),
          compositionViewId: view.viewId,
        },
      }
    })
    const strippedGoalById = new Map(strippedGoals.map((goal) => [goal.id, goal]))
    const projectedGoalById = new Map(goalByIdAcrossEntries)
    strippedGoals.forEach((goal) => projectedGoalById.set(goal.id, goal))

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
        rootGoalIdByLandscapeId,
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

    const stageAnchorGoal = strippedGoals.find((goal) => isStageAnchorGoal(goal, view.scope.stage))

    if (stageAnchorGoal && view.rootNodes.length === 1 && view.rootNodes[0]?.kind === 'structure') {
      const rootStructure = view.rootNodes[0]
      const anchoredStageEntry = applyAnchoredProjection({
        entry,
        view,
        strippedGoals,
        strippedGoalById: projectedGoalById,
        rootGoalIdByLandscapeId,
        anchorGoalId: stageAnchorGoal.id,
        nodes: rootStructure.children,
        referencedGoalIds,
      })
      if (anchoredStageEntry) {
        return anchoredStageEntry
      }
    }

    const syntheticGoals = buildSyntheticGoals(entry, view, projectedGoalById, rootGoalIdByLandscapeId)

    return {
      ...entry,
      goals: [...syntheticGoals, ...strippedGoals],
    }
  })
}
