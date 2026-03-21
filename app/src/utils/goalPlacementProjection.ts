import type { UiGoal } from '../goalTypes'
import type { GoalPlacement, GoalPlacementContext, LearningLandscape, ProgramUnit } from '../landscapeTypes'

export interface ProjectableLandscapeEntry {
  meta: LearningLandscape
  goals: UiGoal[]
}

const normalizeComparableText = (value: string | undefined): string =>
  (value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('de-DE')
    .replace(/\s+/g, ' ')
    .trim()

const isWildcardFilter = (value?: string) => !value || value.toLocaleLowerCase() === 'all'

const getProgramUnitPhaseTokens = (unit: ProgramUnit): string[] => {
  const tokens = new Set<string>()
  const shortLabel = normalizeComparableText(unit.shortLabel)
  const label = normalizeComparableText(unit.label)

  if (shortLabel) tokens.add(shortLabel)
  if (label) tokens.add(label)

  const yearMatch = /jahrgang\s+(\d{1,2})/.exec(label)
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
    let score = 0

    if (unitPhaseTokens.some((token) => token && goalPhase === token)) {
      score += 100
    }

    if (unitLabel) {
      if (rawTitle === unitLabel) score += 120
      if (
        rawTitle.startsWith(`${unitLabel} `)
        || rawTitle.startsWith(`${unitLabel} (`)
        || rawTitle.startsWith(`${unitLabel} ·`)
      ) {
        score += 90
      }
    }

    if (unitShortLabel) {
      if (rawTitle === unitShortLabel) score += 130
      if (
        rawTitle.startsWith(`${unitShortLabel} `)
        || rawTitle.startsWith(`${unitShortLabel} –`)
        || rawTitle.startsWith(`${unitShortLabel} -`)
        || rawTitle.startsWith(`${unitShortLabel}:`)
      ) {
        score += 110
      }
    }

    score += Math.min(goal.contains.length, 25)

    if (score > bestScore) {
      bestScore = score
      bestGoalId = goal.id
    }
  })

  return bestGoalId
}

const inferPlacementFilterDimension = (filterId?: string): keyof GoalPlacementContext | undefined => {
  if (!filterId) return undefined
  const normalized = filterId.trim()
  if (!normalized) return undefined

  if (/^DE-[A-Z]{2}$/.test(normalized)) return 'jurisdiction'
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
  return contextValue.trim().toLocaleLowerCase('de-DE') === filterId.trim().toLocaleLowerCase('de-DE')
}

const placementMatchesActiveFilter = (
  placement: GoalPlacement,
  activeFilter?: string,
): boolean => {
  if (isWildcardFilter(activeFilter)) return false

  const dimension = inferPlacementFilterDimension(activeFilter)
  if (!dimension) return false

  const contextValue = placement.context?.[dimension]
  if (!contextValue) return true

  return contextValueMatchesFilter(contextValue, activeFilter!, dimension)
}

const placementIsDefaultSafe = (placement: GoalPlacement): boolean => {
  const context = placement.context
  if (!context) return true
  return !context.jurisdiction && !context.courseProfile
}

export function applyGoalPlacementProjection<T extends ProjectableLandscapeEntry>(
  entries: T[],
  activeFilter?: string,
): T[] {
  return entries.map((entry) => {
    if (!Array.isArray(entry.goals) || entry.goals.length === 0) return entry
    if (!Array.isArray(entry.meta.programUnits) || entry.meta.programUnits.length === 0) return entry
    if (!Array.isArray(entry.meta.goalPlacements) || entry.meta.goalPlacements.length === 0) return entry

    const clonedGoals = entry.goals.map((goal) => ({
      ...goal,
      contains: Array.isArray(goal.contains) ? [...goal.contains] : [],
    }))
    const goalById = new Map(clonedGoals.map((goal) => [goal.id, goal]))
    const rootGoal = clonedGoals.find((goal) => goal.tags?.includes('root'))
    const unitsById = new Map(entry.meta.programUnits.map((unit) => [unit.id, unit]))
    const anchorByUnitId = new Map<string, string>()

    entry.meta.programUnits.forEach((unit) => {
      const anchorGoalId = resolveProgramUnitAnchorGoalId(unit, clonedGoals)
      if (anchorGoalId) {
        anchorByUnitId.set(unit.id, anchorGoalId)
      }
    })

    const rootDetachedGoalIds = new Set<string>()

    entry.meta.goalPlacements.forEach((placement) => {
      const eligible = isWildcardFilter(activeFilter)
        ? placementIsDefaultSafe(placement)
        : placementMatchesActiveFilter(placement, activeFilter)
      if (!eligible) return

      const unit = unitsById.get(placement.unitId)
      if (!unit) return

      const anchorGoalId = anchorByUnitId.get(unit.id)
      if (!anchorGoalId || anchorGoalId === placement.goalId) return

      const anchorGoal = goalById.get(anchorGoalId)
      const placedGoal = goalById.get(placement.goalId)
      if (!anchorGoal || !placedGoal) return

      if (!anchorGoal.contains.includes(placedGoal.id)) {
        anchorGoal.contains.push(placedGoal.id)
      }

      if (placement.relation === 'primary') {
        rootDetachedGoalIds.add(placedGoal.id)
      }
    })

    if (rootGoal && rootDetachedGoalIds.size > 0) {
      const clonedRoot = goalById.get(rootGoal.id)
      if (clonedRoot) {
        clonedRoot.contains = clonedRoot.contains.filter((childId) => !rootDetachedGoalIds.has(childId))
      }
    }

    return {
      ...entry,
      goals: entry.goals.map((goal) => goalById.get(goal.id) ?? goal),
    }
  })
}
