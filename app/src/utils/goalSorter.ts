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
const WHY_TITLE_PREFIXES = ['warum', 'why']
const FLASHCARD_TAG_PREFIX = 'srs-deck:'
const FLASHCARD_TAG = 'memorization'
const FLASHCARD_TITLE_TOKENS = ['lernkarten', 'flashcards']
const EXERCISE_TITLE_TOKENS = ['übungen', 'uebungen', 'abi-training', 'vorschlag', 'klausur']

const LEARNING_FLOW_BUCKET_WHY = 0
const LEARNING_FLOW_BUCKET_TUTORIAL = 1
const LEARNING_FLOW_BUCKET_FLASHCARD = 2
const LEARNING_FLOW_BUCKET_EXERCISE = 3

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

const normalizeText = (value: string): string =>
  value.normalize('NFKC').toLocaleLowerCase(DEFAULT_LOCALE)

const hasAnyToken = (value: string, tokens: string[]) => tokens.some((token) => value.includes(token))

const isWhyIntroGoal = (goal: UiGoal) => {
  const title = normalizeText(goal.title ?? '').trimStart()
  return WHY_TITLE_PREFIXES.some((prefix) => title.startsWith(prefix))
}

const isFlashcardGoal = (goal: UiGoal) => {
  if (goal.nodeKind === 'memory') return true

  const tags = goal.tags ?? []
  if (tags.some((tag) => tag === FLASHCARD_TAG || tag.startsWith(FLASHCARD_TAG_PREFIX))) return true

  const title = normalizeText(goal.title ?? '')
  return hasAnyToken(title, FLASHCARD_TITLE_TOKENS)
}

const isExerciseGoal = (goal: UiGoal) => {
  if (goal.nodeKind === 'exam') return true
  if (goal.examData) return true

  const title = normalizeText(goal.title ?? '')
  return hasAnyToken(title, EXERCISE_TITLE_TOKENS)
}

const getLearningFlowBucket = (goal: UiGoal): number => {
  if (isWhyIntroGoal(goal)) return LEARNING_FLOW_BUCKET_WHY
  if (isFlashcardGoal(goal)) return LEARNING_FLOW_BUCKET_FLASHCARD
  if (isExerciseGoal(goal)) return LEARNING_FLOW_BUCKET_EXERCISE
  return LEARNING_FLOW_BUCKET_TUTORIAL
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
  E: 700,
  Q1: 710,
  Q2: 720,
  Q3: 730,
  Q4: 740,
  Abitur: 750,
  GLOBAL: 900,
}

const getPhaseRank = (phase: string): number | undefined => {
  const direct = phaseRankMap[phase]
  if (direct !== undefined) return direct

  const sMatch = /^S(\d{1,2})$/.exec(phase)
  if (sMatch) return 300 + Number.parseInt(sMatch[1], 10)

  // Late Sek-I year anchors should sort before upper-secondary E/Q phases.
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

/**
 * Soft support of a source sibling for a target sibling: how often goals
 * inside the target branch require the source or one of its descendants.
 * Only qualifying support is stored, so siblings without sub-branches — such
 * as one long flat list of atomic goals — cost nothing here.
 */
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

  goals.forEach((goal) => {
    const descendants = getDescendants(goal.id, allGoalsById, descendantMemo, visiting)
    descendantsByGoal.set(goal.id, descendants)

    const providers = new Set(descendants)
    providers.add(goal.id)
    providersByGoal.set(goal.id, providers)
  })

  for (const targetGoal of goals) {
    // Demand of the target branch: how often its descendants require each goal.
    const demandByRequiredId = new Map<string, number>()
    let requireBearingDescendants = 0
    for (const demanderId of descendantsByGoal.get(targetGoal.id) ?? []) {
      const demander = allGoalsById.get(demanderId)
      if (!demander || demander.requires.length === 0) continue
      requireBearingDescendants += 1
      for (const req of demander.requires) {
        const requiredId = normalizeRefId(req)
        demandByRequiredId.set(requiredId, (demandByRequiredId.get(requiredId) ?? 0) + 1)
      }
    }
    if (demandByRequiredId.size === 0) continue

    for (const sourceGoal of goals) {
      if (sourceGoal.id === targetGoal.id) continue

      let support = 0
      for (const providerId of providersByGoal.get(sourceGoal.id) ?? []) {
        support += demandByRequiredId.get(providerId) ?? 0
      }
      if (support === 0) continue

      const ratio = support / Math.max(1, requireBearingDescendants)
      if (support < minAbsoluteSupport || ratio < minRelativeSupport) continue

      const sourceMap = matrix.get(sourceGoal.id) ?? new Map<string, number>()
      sourceMap.set(targetGoal.id, support)
      matrix.set(sourceGoal.id, sourceMap)
    }
  }

  return matrix
}

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
  const learningFlowBucketById = new Map(goals.map((goal) => [goal.id, getLearningFlowBucket(goal)]))
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

  // Net soft support of every goal against the goals still to be placed:
  // support it gives minus support it receives. Placing a goal withdraws its
  // share, so the scores never have to be recomputed against the whole rest.
  const scoreById = new Map<string, number>(goals.map((goal) => [goal.id, 0]))
  const supportersByTarget = new Map<string, Map<string, number>>()
  const addScore = (goalId: string, delta: number) => scoreById.set(goalId, (scoreById.get(goalId) ?? 0) + delta)
  softMatrix.forEach((supportByTarget, sourceId) => {
    supportByTarget.forEach((support, targetId) => {
      addScore(sourceId, support)
      addScore(targetId, -support)
      const supporters = supportersByTarget.get(targetId) ?? new Map<string, number>()
      supporters.set(sourceId, support)
      supportersByTarget.set(targetId, supporters)
    })
  })
  const withdrawPlacedGoal = (placedId: string) => {
    softMatrix.get(placedId)?.forEach((support, targetId) => addScore(targetId, support))
    supportersByTarget.get(placedId)?.forEach((support, sourceId) => addScore(sourceId, -support))
  }

  const compareTitleThenId = (aId: string, bId: string) => {
    const a = goalById.get(aId)
    const b = goalById.get(bId)
    const byTitle = collator.compare(a?.title ?? '', b?.title ?? '')
    if (byTitle !== 0) return byTitle
    return aId.localeCompare(bId)
  }
  const titleRankById = new Map(
    Array.from(goalById.keys()).sort(compareTitleThenId).map((goalId, rank) => [goalId, rank] as const),
  )

  const compareConfiguredOrder = (aId: string, bId: string) => {
    const aManual = manualOrderById.get(aId)
    const bManual = manualOrderById.get(bId)
    const aHasManual = aManual !== undefined
    const bHasManual = bManual !== undefined
    if (aHasManual && bHasManual && aManual !== bManual) return aManual - bManual
    if (aHasManual !== bHasManual) return aHasManual ? -1 : 1

    const aLearningFlow = learningFlowBucketById.get(aId) ?? LEARNING_FLOW_BUCKET_TUTORIAL
    const bLearningFlow = learningFlowBucketById.get(bId) ?? LEARNING_FLOW_BUCKET_TUTORIAL
    if (aLearningFlow !== bLearningFlow) return aLearningFlow - bLearningFlow

    const aPhase = phaseRankById.get(aId)
    const bPhase = phaseRankById.get(bId)
    const aHasPhase = aPhase !== undefined
    const bHasPhase = bPhase !== undefined
    if (aHasPhase && bHasPhase && aPhase !== bPhase) return aPhase - bPhase
    if (aHasPhase !== bHasPhase) return aHasPhase ? -1 : 1

    return 0
  }

  const compareCandidates = (aId: string, bId: string) => {
    const configuredOrderDiff = compareConfiguredOrder(aId, bId)
    if (configuredOrderDiff !== 0) return configuredOrderDiff

    const scoreDiff = (scoreById.get(bId) ?? 0) - (scoreById.get(aId) ?? 0)
    if (scoreDiff !== 0) return scoreDiff
    return (titleRankById.get(aId) ?? 0) - (titleRankById.get(bId) ?? 0)
  }

  // Only the first-ranked candidate is placed per step, so one pass replaces
  // a full sort of all candidates.
  const pickNext = (candidateIds: string[]) =>
    candidateIds.reduce((bestId, candidateId) => (compareCandidates(candidateId, bestId) < 0 ? candidateId : bestId))

  const remaining = new Set(goals.map((goal) => goal.id))
  const result: UiGoal[] = []

  while (remaining.size > 0) {
    const available = Array.from(remaining).filter((goalId) => (inDegree.get(goalId) ?? 0) === 0)
    const candidates = available.length > 0 ? available : Array.from(remaining)
    const nextId = pickNext(candidates)

    const nextGoal = goalById.get(nextId)
    if (!nextGoal) {
      remaining.delete(nextId)
      continue
    }

    result.push(nextGoal)
    remaining.delete(nextId)
    withdrawPlacedGoal(nextId)

    for (const neighborId of adjacency.get(nextId) ?? []) {
      inDegree.set(neighborId, (inDegree.get(neighborId) ?? 0) - 1)
    }
  }

  return result
}
