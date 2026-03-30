import type { UiGoal } from '../goalTypes'

const SYNTHETIC_PROGRAM_UNIT_TAG = 'synthetic:program-unit'

type TreePhaseContext = 'E' | 'Q1' | 'Q2' | 'Q3' | 'Q4'

const normalizeComparableText = (value: string | undefined) =>
  (value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('de-DE')
    .replace(/\s+/g, ' ')
    .trim()

const isSyntheticProgramUnit = (goal: UiGoal) =>
  (goal.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG)

const isCompositionStructureNode = (goal: UiGoal) =>
  isSyntheticProgramUnit(goal) && goal.extendedData?.syntheticStructureKind === 'compositionView'

const detectExplicitPhaseContext = (goal: UiGoal): TreePhaseContext | undefined => {
  const normalizedPhase = normalizeComparableText(goal.phase)
  if (normalizedPhase === 'e') return 'E'
  if (normalizedPhase === 'q1') return 'Q1'
  if (normalizedPhase === 'q2') return 'Q2'
  if (normalizedPhase === 'q3') return 'Q3'
  if (normalizedPhase === 'q4') return 'Q4'

  const title = normalizeComparableText(goal.title)
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

const isFlattenableSyntheticPhaseNode = (goal: UiGoal | undefined) =>
  !!goal && isSyntheticProgramUnit(goal) && !isCompositionStructureNode(goal) && !!detectExplicitPhaseContext(goal)

const isGoalRelevantInPhaseContext = (
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

const hasEquivalentPreferredSibling = (
  syntheticGoal: UiGoal,
  siblingIds: string[],
  allGoals: Map<string, UiGoal>,
) => {
  const syntheticTitle = normalizeComparableText(syntheticGoal.title)
  if (!syntheticTitle) return false

  return siblingIds.some((siblingId) => {
    const sibling = allGoals.get(siblingId)
    if (!sibling || sibling.id === syntheticGoal.id) return false
    if (isSyntheticProgramUnit(sibling) && !isCompositionStructureNode(sibling)) return false

    const siblingTitle = normalizeComparableText(sibling.title)
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

const dedupePreservingOrder = (ids: string[]) => {
  const seen = new Set<string>()
  return ids.filter((id) => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

interface RootBranchInfo {
  depth: number
  rootChildOrder: number
}

const extractScopeToken = (goal: Pick<UiGoal, 'title' | 'phase'> | undefined): string | undefined => {
  if (!goal) return undefined

  const normalizedPhase = normalizeComparableText(goal.phase)
  if (/^j([5-9]|10)$/u.test(normalizedPhase)) {
    return normalizedPhase.toUpperCase()
  }
  if (/^(e|q[1-4])$/u.test(normalizedPhase)) {
    return normalizedPhase.toUpperCase()
  }

  const normalizedTitle = normalizeComparableText(goal.title)
  const yearMatch = /^jahrgang(?:sstufe)?\s+([5-9]|10)\b/u.exec(normalizedTitle)
  if (yearMatch) {
    return `J${yearMatch[1]}`
  }

  if (normalizedTitle.startsWith('e-phase')) {
    return 'E'
  }

  const qMatch = /^q([1-4])(?:\b|[.\s:\-–(])/u.exec(normalizedTitle)
  if (qMatch) {
    return `Q${qMatch[1]}`
  }

  return undefined
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

export function normalizeLearnerVisibleChildrenMap(
  allGoals: Map<string, UiGoal>,
  visibleChildrenByParent: Map<string, string[]>,
) {
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
      const childGoal = allGoals.get(childId)
      const childScopeToken = extractScopeToken(childGoal)
      const leftGoal = allGoals.get(leftParentId)
      const rightGoal = allGoals.get(rightParentId)

      const leftIsCompositionStructure = leftGoal ? isCompositionStructureNode(leftGoal) : false
      const rightIsCompositionStructure = rightGoal ? isCompositionStructureNode(rightGoal) : false
      if (leftIsCompositionStructure !== rightIsCompositionStructure) {
        return leftIsCompositionStructure ? -1 : 1
      }

      if (childScopeToken) {
        const leftScopeMatches = extractScopeToken(leftGoal) === childScopeToken
        const rightScopeMatches = extractScopeToken(rightGoal) === childScopeToken
        if (leftScopeMatches !== rightScopeMatches) {
          return leftScopeMatches ? -1 : 1
        }
      }

      const branchCompare = compareRootBranchInfo(
        rootBranchInfoByGoalId.get(leftParentId),
        rootBranchInfoByGoalId.get(rightParentId),
      )
      if (branchCompare !== 0) return branchCompare

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

export function normalizeLearnerProjectedEntries<T extends { goals: UiGoal[] }>(entries: T[]): T[] {
  return entries.map((entry) => {
    if (!Array.isArray(entry.goals) || entry.goals.length === 0) return entry

    const clonedGoals = entry.goals.map((goal) => ({
      ...goal,
      contains: Array.isArray(goal.contains) ? [...goal.contains] : [],
      tags: Array.isArray(goal.tags) ? [...goal.tags] : [],
    }))
    const goalById = new Map<string, UiGoal>(clonedGoals.map((goal) => [goal.id, goal]))
    const relevanceCache = new Map<string, boolean>()
    const normalizedChildrenCache = new Map<string, string[]>()

    const computeNormalizedChildren = (
      goalId: string,
      inheritedPhaseContext?: TreePhaseContext,
      visiting: Set<string> = new Set(),
    ): string[] => {
      const cacheKey = `${goalId}:${inheritedPhaseContext ?? ''}`
      const cached = normalizedChildrenCache.get(cacheKey)
      if (cached) return cached
      if (visiting.has(cacheKey)) return []

      const goal = goalById.get(goalId)
      if (!goal) return []

      const sortedChildren = goal.contains ?? []
      const phaseContext = detectExplicitPhaseContext(goal) ?? inheritedPhaseContext
      const phaseFilteredChildIds = !phaseContext
        ? sortedChildren
        : sortedChildren.filter((childId) =>
          isGoalRelevantInPhaseContext(childId, phaseContext, goalById, relevanceCache),
        )

      const nextVisiting = new Set(visiting)
      nextVisiting.add(cacheKey)

      const normalizedChildren = dedupePreservingOrder(
        phaseFilteredChildIds.flatMap((childId) => {
          const child = goalById.get(childId)
          if (!child) {
            return [childId]
          }

          if (
            isSyntheticProgramUnit(child)
            && !isCompositionStructureNode(child)
            && hasEquivalentPreferredSibling(child, phaseFilteredChildIds, goalById)
          ) {
            return []
          }

          if (isFlattenableSyntheticPhaseNode(child)) {
            const childPhaseContext = detectExplicitPhaseContext(child) ?? phaseContext
            return computeNormalizedChildren(childId, childPhaseContext, nextVisiting)
          }

          return [childId]
        }),
      )

      normalizedChildrenCache.set(cacheKey, normalizedChildren)
      return normalizedChildren
    }

    clonedGoals.forEach((goal) => {
      goal.contains = computeNormalizedChildren(goal.id)
    })

    return {
      ...entry,
      goals: clonedGoals,
    }
  })
}
