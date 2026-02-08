import type { UiGoal } from '../goalTypes'

export interface GoalSortOptions {
  allGoalsById?: Map<string, UiGoal>
  minAbsoluteSupport?: number
  minRelativeSupport?: number
  locale?: string
}

const DEFAULT_MIN_ABSOLUTE_SUPPORT = 2
const DEFAULT_MIN_RELATIVE_SUPPORT = 0.25
const DEFAULT_LOCALE = 'de-DE'

type SoftMatrix = Map<string, Map<string, number>>

const MANUAL_ORDER_TAG_PREFIX = 'order:'
const MANUAL_ORDER_KEYS = ['treeOrder', 'sortOrder', 'displayOrder', 'order', 'position']

const normalizeRefId = (ref: string) => {
  if (typeof ref !== 'string') return ref
  const idx = ref.indexOf(':')
  if (idx >= 0 && idx < ref.length - 1) return ref.slice(idx + 1)
  return ref
}

const parseFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const getManualOrder = (goal: UiGoal): number | undefined => {
  const extended = goal.extendedData as Record<string, unknown> | undefined
  if (extended) {
    for (const key of MANUAL_ORDER_KEYS) {
      const parsed = parseFiniteNumber(extended[key])
      if (parsed !== undefined) return parsed
    }
  }

  for (const tag of goal.tags ?? []) {
    if (!tag.startsWith(MANUAL_ORDER_TAG_PREFIX)) continue
    const parsed = parseFiniteNumber(tag.slice(MANUAL_ORDER_TAG_PREFIX.length))
    if (parsed !== undefined) return parsed
  }

  return undefined
}

const phaseRankMap: Record<string, number> = {
  E: 100,
  Q1: 110,
  Q2: 120,
  Q3: 130,
  Q4: 140,
  Abitur: 150,
  GLOBAL: 900,
}

const getPhaseRank = (phase: string): number | undefined => {
  const direct = phaseRankMap[phase]
  if (direct !== undefined) return direct

  const sMatch = /^S(\d{1,2})$/.exec(phase)
  if (sMatch) return 300 + Number.parseInt(sMatch[1], 10)

  const jMatch = /^J(\d{1,2})$/.exec(phase)
  if (jMatch) return 500 + Number.parseInt(jMatch[1], 10)

  return undefined
}

const getDescendants = (
  goalId: string,
  allGoalsById: Map<string, UiGoal>,
  memo: Map<string, Set<string>>,
  visiting: Set<string>,
): Set<string> => {
  const cached = memo.get(goalId)
  if (cached) return cached
  if (visiting.has(goalId)) return new Set<string>()

  visiting.add(goalId)
  const descendants = new Set<string>()
  const goal = allGoalsById.get(goalId)

  for (const childRef of goal?.contains ?? []) {
    const childId = normalizeRefId(childRef)
    if (!allGoalsById.has(childId)) continue
    descendants.add(childId)
    const childDescendants = getDescendants(childId, allGoalsById, memo, visiting)
    childDescendants.forEach((id) => descendants.add(id))
  }

  visiting.delete(goalId)
  memo.set(goalId, descendants)
  return descendants
}

const buildSoftMatrix = (
  goals: UiGoal[],
  allGoalsById: Map<string, UiGoal>,
  minAbsoluteSupport: number,
  minRelativeSupport: number,
): SoftMatrix => {
  const matrix: SoftMatrix = new Map()
  const descendantMemo = new Map<string, Set<string>>()
  const visiting = new Set<string>()
  const descendantsByGoal = new Map<string, Set<string>>()
  const providersByGoal = new Map<string, Set<string>>()
  const requireBearingDescendantsByGoal = new Map<string, number>()

  goals.forEach((goal) => {
    const descendants = getDescendants(goal.id, allGoalsById, descendantMemo, visiting)
    descendantsByGoal.set(goal.id, descendants)

    const providers = new Set(descendants)
    providers.add(goal.id)
    providersByGoal.set(goal.id, providers)

    const requireBearingDescendants = Array.from(descendants).reduce((count, descendantId) => {
      const descendant = allGoalsById.get(descendantId)
      return descendant && descendant.requires.length > 0 ? count + 1 : count
    }, 0)
    requireBearingDescendantsByGoal.set(goal.id, requireBearingDescendants)
  })

  for (const sourceGoal of goals) {
    const sourceMap = new Map<string, number>()
    matrix.set(sourceGoal.id, sourceMap)

    for (const targetGoal of goals) {
      if (sourceGoal.id === targetGoal.id) continue

      const providers = providersByGoal.get(sourceGoal.id) ?? new Set<string>()
      const demanders = descendantsByGoal.get(targetGoal.id) ?? new Set<string>()

      let support = 0
      for (const demanderId of demanders) {
        const demander = allGoalsById.get(demanderId)
        if (!demander) continue
        for (const req of demander.requires) {
          if (providers.has(normalizeRefId(req))) {
            support += 1
          }
        }
      }

      const withRequires = requireBearingDescendantsByGoal.get(targetGoal.id) ?? 0
      const ratio = support / Math.max(1, withRequires)
      const qualifies = support >= minAbsoluteSupport && ratio >= minRelativeSupport
      sourceMap.set(targetGoal.id, qualifies ? support : 0)
    }
  }

  return matrix
}

const getSoftSupport = (matrix: SoftMatrix, fromId: string, toId: string) =>
  matrix.get(fromId)?.get(toId) ?? 0

export function sortGoalsTopologically(goals: UiGoal[], options: GoalSortOptions = {}): UiGoal[] {
  if (goals.length <= 1) return goals

  const allGoalsById = options.allGoalsById ?? new Map(goals.map((goal) => [goal.id, goal]))
  const minAbsoluteSupport = options.minAbsoluteSupport ?? DEFAULT_MIN_ABSOLUTE_SUPPORT
  const minRelativeSupport = options.minRelativeSupport ?? DEFAULT_MIN_RELATIVE_SUPPORT
  const locale = options.locale ?? DEFAULT_LOCALE

  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
  const siblingIds = new Set(goals.map((goal) => goal.id))
  const goalById = new Map(goals.map((goal) => [goal.id, goal]))
  const manualOrderById = new Map(goals.map((goal) => [goal.id, getManualOrder(goal)]))
  const phaseRankById = new Map(goals.map((goal) => [goal.id, getPhaseRank(goal.phase)]))

  const adjacency = new Map<string, Set<string>>()
  const inDegree = new Map<string, number>()
  goals.forEach((goal) => {
    adjacency.set(goal.id, new Set())
    inDegree.set(goal.id, 0)
  })

  // Hard edges: direct sibling requirements define the topological constraints.
  goals.forEach((goal) => {
    goal.requires.forEach((reqRef) => {
      const reqId = normalizeRefId(reqRef)
      if (!siblingIds.has(reqId) || reqId === goal.id) return
      const neighbors = adjacency.get(reqId)
      if (!neighbors || neighbors.has(goal.id)) return
      neighbors.add(goal.id)
      inDegree.set(goal.id, (inDegree.get(goal.id) ?? 0) + 1)
    })
  })

  const softMatrix = buildSoftMatrix(goals, allGoalsById, minAbsoluteSupport, minRelativeSupport)

  const scoreAgainstRemaining = (candidateId: string, remaining: Set<string>) => {
    let score = 0
    for (const otherId of remaining) {
      if (otherId === candidateId) continue
      score += getSoftSupport(softMatrix, candidateId, otherId)
      score -= getSoftSupport(softMatrix, otherId, candidateId)
    }
    return score
  }

  const compareTitleThenId = (aId: string, bId: string) => {
    const a = goalById.get(aId)
    const b = goalById.get(bId)
    const byTitle = collator.compare(a?.title ?? '', b?.title ?? '')
    if (byTitle !== 0) return byTitle
    return aId.localeCompare(bId)
  }

  const compareConfiguredOrder = (aId: string, bId: string) => {
    const aManual = manualOrderById.get(aId)
    const bManual = manualOrderById.get(bId)
    const aHasManual = aManual !== undefined
    const bHasManual = bManual !== undefined
    if (aHasManual && bHasManual && aManual !== bManual) return aManual - bManual
    if (aHasManual !== bHasManual) return aHasManual ? -1 : 1

    const aPhase = phaseRankById.get(aId)
    const bPhase = phaseRankById.get(bId)
    const aHasPhase = aPhase !== undefined
    const bHasPhase = bPhase !== undefined
    if (aHasPhase && bHasPhase && aPhase !== bPhase) return aPhase - bPhase
    if (aHasPhase !== bHasPhase) return aHasPhase ? -1 : 1

    return 0
  }

  const rankCandidates = (candidateIds: string[], remaining: Set<string>) =>
    [...candidateIds].sort((aId, bId) => {
      const configuredOrderDiff = compareConfiguredOrder(aId, bId)
      if (configuredOrderDiff !== 0) return configuredOrderDiff

      const scoreDiff = scoreAgainstRemaining(bId, remaining) - scoreAgainstRemaining(aId, remaining)
      if (scoreDiff !== 0) return scoreDiff
      return compareTitleThenId(aId, bId)
    })

  const remaining = new Set(goals.map((goal) => goal.id))
  const result: UiGoal[] = []

  while (remaining.size > 0) {
    const available = Array.from(remaining).filter((goalId) => (inDegree.get(goalId) ?? 0) === 0)
    const candidates = available.length > 0 ? available : Array.from(remaining)
    const nextId = rankCandidates(candidates, remaining)[0]

    const nextGoal = goalById.get(nextId)
    if (!nextGoal) {
      remaining.delete(nextId)
      continue
    }

    result.push(nextGoal)
    remaining.delete(nextId)

    for (const neighborId of adjacency.get(nextId) ?? []) {
      inDegree.set(neighborId, (inDegree.get(neighborId) ?? 0) - 1)
    }
  }

  return result
}
