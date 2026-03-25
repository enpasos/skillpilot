import type { UiGoal } from '../goalTypes'
import { goalMatchesFilter } from './goalFilters'
import { goalMatchesGlobalStageScope } from './personalCurriculumStageScope'

export type TreeStructureMode = 'all' | 'content' | 'competency'
export type TreeAudience = 'learner' | 'trainer'
export type TreePhaseContext = 'E' | 'Q1' | 'Q2' | 'Q3' | 'Q4'

const COMPETENCY_DIMENSION_ROOT_TAG = 'competency-axis:dimension-root'
const SYNTHETIC_PROGRAM_UNIT_TAG = 'synthetic:program-unit'

export const isCompetencyDimensionRoot = (goal: UiGoal) =>
  (goal.tags ?? []).includes(COMPETENCY_DIMENSION_ROOT_TAG)

export const isSyntheticProgramUnit = (goal: UiGoal) =>
  (goal.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG)

const isCompositionStructureNode = (goal: UiGoal) =>
  isSyntheticProgramUnit(goal) && goal.extendedData?.syntheticStructureKind === 'compositionView'

const normalizeTreeComparableText = (value: string | undefined) =>
  (value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('de-DE')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeRedundantStructureTitle = (value: string | undefined) =>
  normalizeTreeComparableText(value)
    .replace(/^q[1-4][.:]\s*/u, '')
    .replace(/^e-phase:\s*/u, '')
    .replace(/\s+\(sek(?:undarstufe)?\s*i{1,2}\)$/u, '')
    .replace(/\s+\((gk|lk)\)$/u, '')
    .trim()

export const detectExplicitPhaseContext = (goal: UiGoal): TreePhaseContext | undefined => {
  const normalizedPhase = normalizeTreeComparableText(goal.phase)
  if (normalizedPhase === 'e') return 'E'
  if (normalizedPhase === 'q1') return 'Q1'
  if (normalizedPhase === 'q2') return 'Q2'
  if (normalizedPhase === 'q3') return 'Q3'
  if (normalizedPhase === 'q4') return 'Q4'

  const title = normalizeTreeComparableText(goal.title)
  if (!title) return undefined

  if (
    title.startsWith('e-phase')
    || /^e\.\d/.test(title)
    || title.endsWith('(e)')
    || title.includes(' e-phase')
  ) {
    return 'E'
  }

  const qMatch = /^q([1-4])(?:\b|[.\s:\-–(])/.exec(title)
  if (qMatch) {
    return `Q${qMatch[1]}` as TreePhaseContext
  }

  const trailingQMatch = /\(q([1-4])\)$/.exec(title)
  if (trailingQMatch) {
    return `Q${trailingQMatch[1]}` as TreePhaseContext
  }

  return undefined
}

export const isGoalRelevantInPhaseContext = (
  goalId: string,
  phaseContext: TreePhaseContext | undefined,
  allGoals: Map<string, UiGoal>,
  cache: Map<string, boolean>,
  visiting: Set<string> = new Set(),
): boolean => {
  if (!phaseContext) return true

  const cacheKey = `${phaseContext}:${goalId}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) return cached
  if (visiting.has(cacheKey)) return false

  visiting.add(cacheKey)
  const goal = allGoals.get(goalId)
  if (!goal) {
    cache.set(cacheKey, false)
    return false
  }

  const explicitPhaseContext = detectExplicitPhaseContext(goal)
  if (explicitPhaseContext) {
    const matches = explicitPhaseContext === phaseContext
    cache.set(cacheKey, matches)
    return matches
  }

  const childIds = goal.contains ?? []
  if (childIds.length === 0) {
    cache.set(cacheKey, true)
    return true
  }

  const matches = childIds.some((childId) =>
    isGoalRelevantInPhaseContext(childId, phaseContext, allGoals, cache, new Set(visiting)),
  )
  cache.set(cacheKey, matches)
  return matches
}

const hasEquivalentConcreteSibling = (
  syntheticGoal: UiGoal,
  siblingIds: string[],
  allGoals: Map<string, UiGoal>,
) => {
  const syntheticTitle = normalizeTreeComparableText(syntheticGoal.title)
  if (!syntheticTitle) return false

  return siblingIds.some((siblingId) => {
    const sibling = allGoals.get(siblingId)
    if (!sibling || sibling.id === syntheticGoal.id || isSyntheticProgramUnit(sibling)) return false

    const siblingTitle = normalizeTreeComparableText(sibling.title)
    return (
      siblingTitle === syntheticTitle
      || siblingTitle.startsWith(`${syntheticTitle} `)
      || siblingTitle.startsWith(`${syntheticTitle} -`)
      || siblingTitle.startsWith(`${syntheticTitle} –`)
      || siblingTitle.startsWith(`${syntheticTitle}:`)
      || siblingTitle.startsWith(`${syntheticTitle} ·`)
      || siblingTitle.startsWith(`${syntheticTitle} (`)
    )
  })
}

type PersonalCurriculumConfigLike = Record<string, { selected: boolean; filterId?: string }>

interface RootBranchInfo {
  depth: number
  rootChildOrder: number
}

const getStructuralTreeOrder = (goal: UiGoal) =>
  typeof goal.extendedData?.treeOrder === 'number'
    ? goal.extendedData.treeOrder
    : Number.MAX_SAFE_INTEGER

const compareRootBranchInfo = (left: RootBranchInfo | undefined, right: RootBranchInfo | undefined) => {
  if (!left && !right) return 0
  if (!left) return 1
  if (!right) return -1
  if (left.rootChildOrder !== right.rootChildOrder) {
    return left.rootChildOrder - right.rootChildOrder
  }
  if (left.depth !== right.depth) {
    return right.depth - left.depth
  }
  return 0
}

const buildSingleOccurrenceLearnerChildrenMap = (
  allGoals: Map<string, UiGoal>,
  visibleChildrenByParent: Map<string, string[]>,
) => {
  const visibleParentIdsByChild = new Map<string, string[]>()
  visibleChildrenByParent.forEach((childIds, parentId) => {
    childIds.forEach((childId) => {
      const parents = visibleParentIdsByChild.get(childId) ?? []
      parents.push(parentId)
      visibleParentIdsByChild.set(childId, parents)
    })
  })

  const rootIds = Array.from(allGoals.values())
    .filter((goal) => goal.tags?.includes('root'))
    .map((goal) => goal.id)

  if (rootIds.length === 0) {
    allGoals.forEach((goal) => {
      if ((visibleParentIdsByChild.get(goal.id) ?? []).length === 0) {
        rootIds.push(goal.id)
      }
    })
  }

  const rootBranchInfoByGoalId = new Map<string, RootBranchInfo>()
  let nextRootChildOrder = 0

  const visitBranch = (goalId: string, info: RootBranchInfo, path: Set<string> = new Set()) => {
    if (path.has(goalId)) return
    const existing = rootBranchInfoByGoalId.get(goalId)
    if (existing && compareRootBranchInfo(existing, info) <= 0) {
      return
    }

    rootBranchInfoByGoalId.set(goalId, info)
    const nextPath = new Set(path)
    nextPath.add(goalId)
    ;(visibleChildrenByParent.get(goalId) ?? []).forEach((childId) => {
      visitBranch(childId, { rootChildOrder: info.rootChildOrder, depth: info.depth + 1 }, nextPath)
    })
  }

  rootIds.forEach((rootId) => {
    ;(visibleChildrenByParent.get(rootId) ?? []).forEach((childId) => {
      visitBranch(childId, { rootChildOrder: nextRootChildOrder, depth: 1 })
      nextRootChildOrder += 1
    })
  })

  const preferredParentIdByChild = new Map<string, string>()

  visibleParentIdsByChild.forEach((parentIds, childId) => {
    const preferredParentId = [...parentIds].sort((leftParentId, rightParentId) => {
      const branchCompare = compareRootBranchInfo(
        rootBranchInfoByGoalId.get(leftParentId),
        rootBranchInfoByGoalId.get(rightParentId),
      )
      if (branchCompare !== 0) return branchCompare

      const leftGoal = allGoals.get(leftParentId)
      const rightGoal = allGoals.get(rightParentId)
      const leftTreeOrder = leftGoal ? getStructuralTreeOrder(leftGoal) : Number.MAX_SAFE_INTEGER
      const rightTreeOrder = rightGoal ? getStructuralTreeOrder(rightGoal) : Number.MAX_SAFE_INTEGER
      if (leftTreeOrder !== rightTreeOrder) return leftTreeOrder - rightTreeOrder

      const leftTitle = leftGoal?.title ?? leftParentId
      const rightTitle = rightGoal?.title ?? rightParentId
      const titleCompare = leftTitle.localeCompare(rightTitle, undefined, { sensitivity: 'base' })
      if (titleCompare !== 0) return titleCompare

      return leftParentId.localeCompare(rightParentId)
    })[0]

    if (preferredParentId) {
      preferredParentIdByChild.set(childId, preferredParentId)
    }
  })

  const resolvedChildrenByParent = new Map<string, string[]>()
  visibleChildrenByParent.forEach((childIds, parentId) => {
    resolvedChildrenByParent.set(
      parentId,
      childIds.filter((childId) => preferredParentIdByChild.get(childId) === parentId),
    )
  })

  const keepNodeCache = new Map<string, boolean>()
  const rootIdSet = new Set(rootIds)

  const keepNode = (goalId: string, path: Set<string> = new Set()): boolean => {
    const cached = keepNodeCache.get(goalId)
    if (cached !== undefined) return cached
    if (path.has(goalId)) return false

    const goal = allGoals.get(goalId)
    if (!goal) {
      keepNodeCache.set(goalId, false)
      return false
    }

    if (rootIdSet.has(goalId)) {
      keepNodeCache.set(goalId, true)
      return true
    }

    const originalStructuralChildren = goal.contains ?? []
    if (originalStructuralChildren.length === 0) {
      keepNodeCache.set(goalId, true)
      return true
    }

    const nextPath = new Set(path)
    nextPath.add(goalId)
    const hasKeptChild = (resolvedChildrenByParent.get(goalId) ?? []).some((childId) => keepNode(childId, nextPath))
    keepNodeCache.set(goalId, hasKeptChild)
    return hasKeptChild
  }

  const prunedChildrenByParent = new Map<string, string[]>()
  resolvedChildrenByParent.forEach((childIds, parentId) => {
    if (!keepNode(parentId)) return
    prunedChildrenByParent.set(
      parentId,
      childIds.filter((childId) => keepNode(childId)),
    )
  })

  return prunedChildrenByParent
}

export const buildVisibleChildrenMap = (
  allGoals: Map<string, UiGoal>,
  activeFilter?: string,
  personalConfig?: PersonalCurriculumConfigLike,
  structureMode: TreeStructureMode = 'all',
  audience: TreeAudience = 'trainer',
) => {
  const visibleChildrenByParent = new Map<string, string[]>()
  const hasConfig = !!personalConfig && Object.keys(personalConfig).length > 0
  const nestedUnderSyntheticProgramUnit = new Set<string>()

  allGoals.forEach((parent) => {
    if (!isSyntheticProgramUnit(parent)) return
    ;(parent.contains ?? []).forEach((childId) => {
      nestedUnderSyntheticProgramUnit.add(childId)
    })
  })

  allGoals.forEach((parent) => {
    const childIds = parent.contains ?? []
    if (childIds.length === 0) return

    const hasPositiveSibling = hasConfig && childIds.some((childId) => {
      const child = allGoals.get(childId)
      if (!child) return false
      const config = (child.landscapeId ? personalConfig?.[child.landscapeId] : undefined) ?? personalConfig?.[child.id]
      return config?.selected === true
    })

    const visibleChildren = childIds.filter((childId) => {
      const child = allGoals.get(childId)
      if (!child) return false

      if (audience === 'learner' && isSyntheticProgramUnit(child) && hasEquivalentConcreteSibling(child, childIds, allGoals)) {
        return false
      }

      if (!goalMatchesGlobalStageScope(child, personalConfig ?? {})) {
        return false
      }

      if (!goalMatchesFilter(child, activeFilter)) {
        return false
      }

      const isCompetencyRoot = isCompetencyDimensionRoot(child)
      const isRootParent = parent.tags?.includes('root')

      if (isCompetencyRoot) {
        if (structureMode !== 'competency') {
          return false
        }
        if (!isRootParent) {
          return false
        }
      }

      if (isRootParent) {
        if (structureMode === 'competency' && !isCompetencyRoot) {
          return false
        }
        if (structureMode === 'all' && isCompetencyRoot && nestedUnderSyntheticProgramUnit.has(child.id)) {
          return false
        }
      }

      if (hasConfig) {
        const config = (child.landscapeId ? personalConfig?.[child.landscapeId] : undefined) ?? personalConfig?.[child.id]
        if (config) {
          if (config.selected !== true) return false
          if (!goalMatchesFilter(child, config.filterId)) {
            return false
          }
        } else if (hasPositiveSibling) {
          return false
        }
      }

      return true
    })

    visibleChildrenByParent.set(parent.id, visibleChildren)
  })

  if (audience !== 'learner') {
    return visibleChildrenByParent
  }

  return buildSingleOccurrenceLearnerChildrenMap(allGoals, visibleChildrenByParent)
}

export const getRenderedChildIds = (
  goalId: string,
  allGoals: Map<string, UiGoal>,
  visibleChildrenByParent: Map<string, string[]>,
  audience: TreeAudience = 'trainer',
  inheritedPhaseContext?: TreePhaseContext,
): { childIds: string[]; phaseContext: TreePhaseContext | undefined } => {
  const goal = allGoals.get(goalId)
  if (!goal) {
    return { childIds: [], phaseContext: inheritedPhaseContext }
  }

  const sortedChildren = visibleChildrenByParent.get(goalId) ?? []
  const phaseContext = detectExplicitPhaseContext(goal) ?? inheritedPhaseContext
  const phaseContextCache = new Map<string, boolean>()
  const phaseFilteredChildIds = audience !== 'learner' || !phaseContext
    ? sortedChildren
    : sortedChildren.filter((childId) =>
      isGoalRelevantInPhaseContext(childId, phaseContext, allGoals, phaseContextCache),
    )

  const childIds = audience !== 'learner'
    ? phaseFilteredChildIds
    : phaseFilteredChildIds.flatMap((childId) => {
      const child = allGoals.get(childId)
      if (!child || !isCompositionStructureNode(goal)) {
        return [childId]
      }

      const parentTitle = normalizeRedundantStructureTitle(goal.title)
      const childTitle = normalizeRedundantStructureTitle(child.title)
      if (!parentTitle || parentTitle !== childTitle) {
        return [childId]
      }

      const grandChildIds = visibleChildrenByParent.get(childId) ?? []
      if (grandChildIds.length === 0) {
        return [childId]
      }

      return phaseContext
        ? grandChildIds.filter((grandChildId) =>
          isGoalRelevantInPhaseContext(grandChildId, phaseContext, allGoals, phaseContextCache),
        )
        : grandChildIds
    })

  return { childIds, phaseContext }
}
