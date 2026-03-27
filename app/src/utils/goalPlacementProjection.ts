import type { UiGoal } from '../goalTypes'
import type { GoalPlacement, GoalPlacementContext, LearningLandscape, ProgramUnit } from '../landscapeTypes'
import { normalizeJurisdictionCode } from './jurisdictionMetadata'

export interface ProjectableLandscapeEntry {
  meta: LearningLandscape
  goals: UiGoal[]
}

const SYNTHETIC_PROGRAM_UNIT_TAG = 'synthetic:program-unit'
const PROGRAM_UNIT_ANCHOR_TAG = 'program-unit:anchor'

const normalizeComparableText = (value: string | undefined): string =>
  (value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('de-DE')
    .replace(/\s+/g, ' ')
    .trim()

const isWildcardFilter = (value?: string) => !value || value.toLocaleLowerCase() === 'all'

const normalizeFilterIds = (filters?: string | string[]) =>
  (Array.isArray(filters) ? filters : [filters])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .filter((value) => !isWildcardFilter(value))

const getProgramUnitPhaseTokens = (unit: ProgramUnit): string[] => {
  const tokens = new Set<string>()
  const shortLabel = normalizeComparableText(unit.shortLabel)
  const label = normalizeComparableText(unit.label)

  if (shortLabel) tokens.add(shortLabel)
  if (label) tokens.add(label)

  const yearMatch = /jahrgang(?:sstufe)?\s+(\d{1,2})/.exec(label)
  if (yearMatch) {
    tokens.add(`j${yearMatch[1]}`)
  }

  const phaseMatch = /\b(e|q[1-4])\b/.exec(label)
  if (phaseMatch) {
    tokens.add(phaseMatch[1])
  }

  return Array.from(tokens)
}

const resolveProgramUnitAnchorGoalId = (
  unit: ProgramUnit,
  goals: UiGoal[],
): string | undefined => {
  const unitLabel = normalizeComparableText(unit.label)
  const unitShortLabel = normalizeComparableText(unit.shortLabel)
  const unitPhaseTokens = getProgramUnitPhaseTokens(unit)

  let bestGoalId: string | undefined
  let bestScore = 0

  goals.forEach((goal) => {
    if (!Array.isArray(goal.contains) || goal.contains.length === 0) return

    const goalPhase = normalizeComparableText(goal.phase)
    const rawTitle = normalizeComparableText(goal.title)
    let semanticScore = 0

    if (unitPhaseTokens.some((token) => token && goalPhase === token)) {
      semanticScore += 100
    }

    if (unitLabel) {
      if (rawTitle === unitLabel) semanticScore += 120
      if (
        rawTitle.startsWith(`${unitLabel} `)
        || rawTitle.startsWith(`${unitLabel} (`)
        || rawTitle.startsWith(`${unitLabel} ·`)
      ) {
        semanticScore += 90
      }
    }

    if (unitShortLabel) {
      if (rawTitle === unitShortLabel) semanticScore += 130
      if (
        rawTitle.startsWith(`${unitShortLabel} `)
        || rawTitle.startsWith(`${unitShortLabel} –`)
        || rawTitle.startsWith(`${unitShortLabel} -`)
        || rawTitle.startsWith(`${unitShortLabel}:`)
      ) {
        semanticScore += 110
      }
    }

    if (semanticScore === 0) return

    const score = semanticScore + Math.min(goal.contains.length, 25)

    if (score > bestScore) {
      bestScore = score
      bestGoalId = goal.id
    }
  })

  return bestGoalId
}

const containsTransitively = (
  goalById: Map<string, UiGoal>,
  ancestorGoalId: string,
  targetGoalId: string,
  visiting: Set<string> = new Set(),
): boolean => {
  if (ancestorGoalId === targetGoalId) return true
  if (visiting.has(ancestorGoalId)) return false

  visiting.add(ancestorGoalId)
  const goal = goalById.get(ancestorGoalId)
  if (!goal) return false

  for (const childId of goal.contains ?? []) {
    if (childId === targetGoalId) {
      return true
    }
    if (containsTransitively(goalById, childId, targetGoalId, new Set(visiting))) {
      return true
    }
  }

  return false
}

const inferPlacementFilterDimension = (filterId?: string): keyof GoalPlacementContext | undefined => {
  if (!filterId) return undefined
  const normalized = filterId.trim()
  if (!normalized) return undefined

  if (normalizeJurisdictionCode(normalized)) return 'jurisdiction'
  if (/^(GK|LK|GK\+LK)$/i.test(normalized)) return 'courseProfile'
  if (/^G[89]$/i.test(normalized)) return 'durationModel'
  if (/^Sek ?I{1,2}$/i.test(normalized)) return 'stage'
  if (/^Gymnasium$/i.test(normalized)) return 'schoolForm'
  return undefined
}

const splitCourseProfile = (value: string): string[] => {
  const normalized = value.trim().toUpperCase()
  if (normalized === 'GK+LK') return ['GK', 'LK', 'GK+LK']
  return [normalized]
}

const contextValueMatchesFilter = (
  contextValue: string,
  filterId: string,
  dimension: keyof GoalPlacementContext,
): boolean => {
  if (dimension === 'courseProfile') {
    const filterToken = filterId.trim().toUpperCase()
    return splitCourseProfile(contextValue).includes(filterToken)
  }
  if (dimension === 'jurisdiction') {
    const normalizedContextValue = normalizeJurisdictionCode(contextValue)
    const normalizedFilterId = normalizeJurisdictionCode(filterId)
    return normalizedContextValue !== null && normalizedContextValue === normalizedFilterId
  }
  return contextValue.trim().toLocaleLowerCase('de-DE') === filterId.trim().toLocaleLowerCase('de-DE')
}

const placementMatchesFilters = (
  placement: GoalPlacement,
  activeFilters?: string | string[],
): boolean => {
  const filterIds = normalizeFilterIds(activeFilters)
  if (filterIds.length === 0) return false

  return filterIds.every((filterId) => {
    const dimension = inferPlacementFilterDimension(filterId)
    if (!dimension) return false

    const contextValue = placement.context?.[dimension]
    if (!contextValue) return true

    return contextValueMatchesFilter(contextValue, filterId, dimension)
  })
}

const placementIsDefaultSafe = (placement: GoalPlacement): boolean => {
  const context = placement.context
  if (!context) return true
  return !context.jurisdiction && !context.courseProfile
}

const createSyntheticProgramUnitAnchor = (
  landscapeId: string,
  unit: ProgramUnit,
): UiGoal => ({
  id: `synthetic:${landscapeId}:program-unit:${unit.id}`,
  landscapeId,
  title: unit.label,
  description: `Synthetischer Strukturknoten für ${unit.label}. Dieser Knoten wird zur Laufzeit aus programUnits und goalPlacements projiziert.`,
  phase: 'GLOBAL',
  themenfeld: '',
  area: 'Program Structure',
  level: 2,
  core: true,
  weight: 1,
  tags: [
    SYNTHETIC_PROGRAM_UNIT_TAG,
    PROGRAM_UNIT_ANCHOR_TAG,
    `program-unit:${unit.kind}`,
  ],
  leitideen: [],
  kompetenzen: [],
  sourceRef: 'runtime program unit projection',
  requires: [],
  contains: [],
  examples: [],
  competencyRefs: [],
  effectiveRequires: [],
  inheritedRequires: [],
  extendedData: {
    synthetic: true,
    treeOrder: unit.order ?? 0,
    programUnitId: unit.id,
  },
  type: 'cluster',
  nodeKind: 'tutor',
})

export function applyGoalPlacementProjection<T extends ProjectableLandscapeEntry>(
  entries: T[],
  activeFilter?: string | string[],
): T[] {
  return entries.map((entry) => {
    if (!Array.isArray(entry.goals) || entry.goals.length === 0) return entry
    if (!Array.isArray(entry.meta.programUnits) || entry.meta.programUnits.length === 0) return entry
    if (!Array.isArray(entry.meta.goalPlacements) || entry.meta.goalPlacements.length === 0) return entry

    const clonedGoals: UiGoal[] = entry.goals.map((goal) => ({
      ...goal,
      contains: Array.isArray(goal.contains) ? [...goal.contains] : [],
      tags: Array.isArray(goal.tags) ? [...goal.tags] : [],
    }))
    const goalById = new Map<string, UiGoal>(clonedGoals.map((goal) => [goal.id, goal]))
    const rootGoal = clonedGoals.find((goal) => goal.tags?.includes('root'))
    const originalRootContains = rootGoal ? [...rootGoal.contains] : []
    const authoredParentIdsByGoalId = new Map<string, string[]>()
    clonedGoals.forEach((goal) => {
      ;(goal.contains ?? []).forEach((childId) => {
        const parents = authoredParentIdsByGoalId.get(childId) ?? []
        parents.push(goal.id)
        authoredParentIdsByGoalId.set(childId, parents)
      })
    })
    const unitsById = new Map(entry.meta.programUnits.map((unit) => [unit.id, unit]))
    const goalPlacements = entry.meta.goalPlacements ?? []
    const anchorByUnitId = new Map<string, string>()
    const unitIdByAnchorGoalId = new Map<string, string>()
    const primaryPlacementAnchorByGoalId = new Map<string, string>()

    entry.meta.programUnits.forEach((unit) => {
      const anchorGoalId = resolveProgramUnitAnchorGoalId(unit, clonedGoals)
      if (anchorGoalId) {
        anchorByUnitId.set(unit.id, anchorGoalId)
        unitIdByAnchorGoalId.set(anchorGoalId, unit.id)
      }
    })

    entry.meta.programUnits.forEach((unit) => {
      const anchorGoalId = anchorByUnitId.get(unit.id)
      if (!anchorGoalId) return

      const hasUnsafePlacement = goalPlacements.some((placement) => {
        const eligible = normalizeFilterIds(activeFilter).length === 0
          ? placementIsDefaultSafe(placement)
          : placementMatchesFilters(placement, activeFilter)
        if (!eligible) return false
        if (placement.unitId !== unit.id) return false
        if (placement.goalId === anchorGoalId) return false

        return containsTransitively(goalById, placement.goalId, anchorGoalId)
      })

      if (hasUnsafePlacement) {
        anchorByUnitId.delete(unit.id)
      }
    })

    const rootDetachedGoalIds = new Set<string>()

    const ensureAnchorForUnit = (unitId: string): string | undefined => {
      const existingAnchorId = anchorByUnitId.get(unitId)
      if (existingAnchorId) return existingAnchorId

      const unit = unitsById.get(unitId)
      if (!unit) return undefined

      const syntheticAnchor = createSyntheticProgramUnitAnchor(entry.meta.landscapeId, unit)
      clonedGoals.push(syntheticAnchor)
      goalById.set(syntheticAnchor.id, syntheticAnchor)
      anchorByUnitId.set(unit.id, syntheticAnchor.id)
      unitIdByAnchorGoalId.set(syntheticAnchor.id, unit.id)

      const parentAnchorId = unit.parentUnitId
        ? (
          unitsById.get(unit.parentUnitId)?.kind === 'program'
            ? rootGoal?.id
            : ensureAnchorForUnit(unit.parentUnitId)
        )
        : rootGoal?.id
      if (parentAnchorId) {
        const parentAnchor = goalById.get(parentAnchorId)
        if (parentAnchor && !parentAnchor.contains.includes(syntheticAnchor.id)) {
          parentAnchor.contains.push(syntheticAnchor.id)
        }
      }

      return syntheticAnchor.id
    }

    goalPlacements.forEach((placement) => {
      const eligible = normalizeFilterIds(activeFilter).length === 0
        ? placementIsDefaultSafe(placement)
        : placementMatchesFilters(placement, activeFilter)
      if (!eligible) return
      if (placement.relation !== 'primary') return

      const unit = unitsById.get(placement.unitId)
      if (!unit) return

      const anchorGoalId = ensureAnchorForUnit(unit.id)
      if (!anchorGoalId || anchorGoalId === placement.goalId) return

      const anchorGoal = goalById.get(anchorGoalId)
      const placedGoal = goalById.get(placement.goalId)
      if (!anchorGoal || !placedGoal) return
      const authoredParentIds = authoredParentIdsByGoalId.get(placedGoal.id) ?? []
      const hasExplicitNonRootAuthorParent = authoredParentIds.some((parentId) => parentId !== rootGoal?.id)
      if (hasExplicitNonRootAuthorParent) return

      if (!anchorGoal.contains.includes(placedGoal.id)) {
        anchorGoal.contains.push(placedGoal.id)
      }

      rootDetachedGoalIds.add(placedGoal.id)
      primaryPlacementAnchorByGoalId.set(placedGoal.id, anchorGoal.id)
    })

    if (rootGoal && rootDetachedGoalIds.size > 0) {
      const clonedRoot = goalById.get(rootGoal.id)
      if (clonedRoot) {
        const resolveTopLevelAnchor = (goalId: string): string | undefined => {
          let anchorId = primaryPlacementAnchorByGoalId.get(goalId)
          const seenAnchors = new Set<string>()

          while (anchorId && !seenAnchors.has(anchorId)) {
            seenAnchors.add(anchorId)
            const unitId = unitIdByAnchorGoalId.get(anchorId)
            if (!unitId) {
              break
            }

            const unit = unitsById.get(unitId)
            const parentUnitId = unit?.parentUnitId
            if (!parentUnitId) {
              break
            }

            const parentUnit = unitsById.get(parentUnitId)
            if (!parentUnit || parentUnit.kind === 'program') {
              break
            }

            const parentAnchorId = ensureAnchorForUnit(parentUnitId)
            if (!parentAnchorId || parentAnchorId === anchorId) {
              break
            }

            anchorId = parentAnchorId
          }

          return anchorId
        }

        const rebuiltRootContains: string[] = []
        const seenRootChildren = new Set<string>()

        originalRootContains.forEach((childId) => {
          if (rootDetachedGoalIds.has(childId)) {
            const replacementAnchorId = resolveTopLevelAnchor(childId)
            if (replacementAnchorId && !seenRootChildren.has(replacementAnchorId)) {
              rebuiltRootContains.push(replacementAnchorId)
              seenRootChildren.add(replacementAnchorId)
            }
            return
          }

          if (!seenRootChildren.has(childId)) {
            rebuiltRootContains.push(childId)
            seenRootChildren.add(childId)
          }
        })

        clonedRoot.contains.forEach((childId) => {
          if (rootDetachedGoalIds.has(childId)) {
            return
          }
          if (!seenRootChildren.has(childId)) {
            rebuiltRootContains.push(childId)
            seenRootChildren.add(childId)
          }
        })

        clonedRoot.contains = rebuiltRootContains
      }
    }

    return {
      ...entry,
      goals: clonedGoals,
    }
  })
}
