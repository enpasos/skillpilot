export interface CanonicalAuthoringGoal extends Record<string, unknown> {
  id: string
  title: string
  titleEn?: string
  description?: string
  descriptionEn?: string
  shortKey?: string
  requires: string[]
  contains: string[]
  type?: 'atomic' | 'cluster'
  tags?: string[]
  extendedData?: Record<string, unknown>
  dimensionTags?: Record<string, unknown>
  weight?: number
  core?: boolean
}

export interface CanonicalAuthoringLandscape extends Record<string, unknown> {
  landscapeId: string
  title: string
  description?: string
  goals: CanonicalAuthoringGoal[]
}

export interface AuthoringDiagnostic {
  severity: 'error' | 'warning'
  message: string
  goalId?: string
}

export interface CanonicalGraphIndex {
  goalById: Map<string, CanonicalAuthoringGoal>
  goalOrderIndexById: Map<string, number>
  childrenById: Map<string, string[]>
  parentById: Map<string, string[]>
  rootGoalIds: string[]
  descendantsById: Map<string, Set<string>>
  compareGoalIds: (leftId: string, rightId: string) => number
}

const ORDER_KEYS = ['treeOrder', 'sortOrder', 'displayOrder', 'order', 'position'] as const
export const STATE_LOOKING_TITLE_PATTERN = /^(?:E(?:\.\d+)?|Q[1-4](?:\.\d+)?|J\d+|S\d+)\b/u

export const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

export const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback
}

export const asOptionalString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

export const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string')
}

export const normalizeGoalRef = (ref: string): string => {
  const idx = ref.indexOf(':')
  if (idx >= 0 && idx < ref.length - 1) return ref.slice(idx + 1)
  return ref
}

export const dedupeGoalRefs = (refs: string[]): string[] => {
  const seen = new Set<string>()
  const deduped: string[] = []
  refs.forEach((ref) => {
    const normalized = normalizeGoalRef(ref)
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    deduped.push(ref)
  })
  return deduped
}

export const cloneJsonValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

export const normalizeCanonicalGoal = (value: unknown, index: number): CanonicalAuthoringGoal => {
  const record = asRecord(value)
  const typeRaw = record.type
  const type = typeRaw === 'atomic' || typeRaw === 'cluster' ? typeRaw : undefined
  const tags = asStringArray(record.tags)

  return {
    ...record,
    id: asString(record.id, `goal_${index + 1}`),
    title: asString(record.title, `Goal ${index + 1}`),
    titleEn: asOptionalString(record.titleEn),
    description: asOptionalString(record.description),
    descriptionEn: asOptionalString(record.descriptionEn),
    shortKey: asOptionalString(record.shortKey),
    requires: dedupeGoalRefs(asStringArray(record.requires)),
    contains: dedupeGoalRefs(asStringArray(record.contains)),
    type,
    tags: tags.length > 0 ? tags : undefined,
    extendedData: Object.keys(asRecord(record.extendedData)).length > 0 ? asRecord(record.extendedData) : undefined,
    dimensionTags: Object.keys(asRecord(record.dimensionTags)).length > 0 ? asRecord(record.dimensionTags) : undefined,
  }
}

export const normalizeCanonicalLandscape = (value: unknown): CanonicalAuthoringLandscape => {
  const record = asRecord(value)
  const goalsRaw = Array.isArray(record.goals) ? record.goals : []
  return {
    ...record,
    landscapeId: asString(record.landscapeId),
    title: asString(record.title),
    description: asOptionalString(record.description),
    goals: goalsRaw.map((goal, index) => normalizeCanonicalGoal(goal, index)),
  }
}

const toNumericOrder = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

export const readGoalOrder = (goal: CanonicalAuthoringGoal): number | undefined => {
  const extended = asRecord(goal.extendedData)
  for (const key of ORDER_KEYS) {
    const direct = toNumericOrder((goal as Record<string, unknown>)[key])
    if (direct !== undefined) return direct
    const fromExtended = toNumericOrder(extended[key])
    if (fromExtended !== undefined) return fromExtended
  }
  return undefined
}

export const resolveCanonicalNodeType = (goal: CanonicalAuthoringGoal): 'atomic' | 'cluster' => {
  if (goal.type === 'atomic' || goal.type === 'cluster') return goal.type
  return goal.contains.length > 0 ? 'cluster' : 'atomic'
}

export const createGoalIdComparator = (
  goalById: Map<string, CanonicalAuthoringGoal>,
  goalOrderIndexById: Map<string, number>,
): (leftId: string, rightId: string) => number => (
  (leftId: string, rightId: string): number => {
    const left = goalById.get(leftId)
    const right = goalById.get(rightId)
    if (!left && !right) return leftId.localeCompare(rightId)
    if (!left) return 1
    if (!right) return -1

    const leftOrder = readGoalOrder(left)
    const rightOrder = readGoalOrder(right)
    if (leftOrder !== undefined && rightOrder !== undefined && leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }
    if (leftOrder !== undefined && rightOrder === undefined) return -1
    if (leftOrder === undefined && rightOrder !== undefined) return 1

    const leftIndex = goalOrderIndexById.get(leftId) ?? Number.MAX_SAFE_INTEGER
    const rightIndex = goalOrderIndexById.get(rightId) ?? Number.MAX_SAFE_INTEGER
    if (leftIndex !== rightIndex) return leftIndex - rightIndex

    const byTitle = left.title.localeCompare(right.title, 'de', { sensitivity: 'base', numeric: true })
    if (byTitle !== 0) return byTitle
    return left.id.localeCompare(right.id)
  }
)

export const buildCanonicalGraphIndex = (landscape: CanonicalAuthoringLandscape | null): CanonicalGraphIndex => {
  const goalById = new Map<string, CanonicalAuthoringGoal>()
  const goalOrderIndexById = new Map<string, number>()

  ;(landscape?.goals ?? []).forEach((goal, index) => {
    goalById.set(goal.id, goal)
    goalOrderIndexById.set(goal.id, index)
  })

  const compareGoalIds = createGoalIdComparator(goalById, goalOrderIndexById)
  const childrenById = new Map<string, string[]>()
  const parentById = new Map<string, string[]>()

  goalById.forEach((_, goalId) => {
    childrenById.set(goalId, [])
    parentById.set(goalId, [])
  })

  goalById.forEach((goal) => {
    const directChildren: string[] = []
    const seenChildren = new Set<string>()

    for (const ref of goal.contains) {
      const childId = normalizeGoalRef(ref)
      if (!goalById.has(childId)) continue
      if (seenChildren.has(childId)) continue
      directChildren.push(childId)
      seenChildren.add(childId)
      const currentParents = parentById.get(childId) ?? []
      currentParents.push(goal.id)
      parentById.set(childId, currentParents)
    }

    childrenById.set(goal.id, directChildren)
  })

  parentById.forEach((parents, goalId) => {
    parentById.set(goalId, Array.from(new Set(parents)).sort(compareGoalIds))
  })

  const rootGoalIds = Array.from(goalById.keys()).filter((goalId) => (parentById.get(goalId)?.length ?? 0) === 0)
  rootGoalIds.sort(compareGoalIds)

  const descendantsById = new Map<string, Set<string>>()
  const visit = (goalId: string, visiting: Set<string> = new Set()): Set<string> => {
    const cached = descendantsById.get(goalId)
    if (cached) return cached
    if (visiting.has(goalId)) return new Set()
    visiting.add(goalId)
    const result = new Set<string>()
    for (const childId of childrenById.get(goalId) ?? []) {
      result.add(childId)
      visit(childId, new Set(visiting)).forEach((descendantId) => result.add(descendantId))
    }
    descendantsById.set(goalId, result)
    return result
  }

  Array.from(goalById.keys()).forEach((goalId) => {
    visit(goalId)
  })

  return {
    goalById,
    goalOrderIndexById,
    childrenById,
    parentById,
    rootGoalIds,
    descendantsById,
    compareGoalIds,
  }
}

export const validateCanonicalLandscape = (
  landscape: CanonicalAuthoringLandscape | null,
  index: CanonicalGraphIndex = buildCanonicalGraphIndex(landscape),
): AuthoringDiagnostic[] => {
  const diagnostics: AuthoringDiagnostic[] = []
  const cycleNodes = new Set<string>()
  const visiting = new Set<string>()
  const visited = new Set<string>()

  const detectCycles = (goalId: string) => {
    if (visited.has(goalId)) return
    if (visiting.has(goalId)) {
      cycleNodes.add(goalId)
      return
    }

    visiting.add(goalId)
    for (const childId of index.childrenById.get(goalId) ?? []) {
      if (visiting.has(childId)) {
        cycleNodes.add(goalId)
        cycleNodes.add(childId)
        continue
      }
      detectCycles(childId)
    }
    visiting.delete(goalId)
    visited.add(goalId)
  }

  index.goalById.forEach((goal) => {
    const seenChildren = new Set<string>()
    goal.contains.forEach((ref) => {
      const childId = normalizeGoalRef(ref)
      if (!index.goalById.has(childId)) {
        diagnostics.push({ severity: 'error', goalId: goal.id, message: `Fehlender Child-Ref: ${ref}` })
        return
      }
      if (childId === goal.id) {
        diagnostics.push({ severity: 'error', goalId: goal.id, message: 'Direkte Selbstreferenz in contains.' })
        return
      }
      if (seenChildren.has(childId)) {
        diagnostics.push({ severity: 'error', goalId: goal.id, message: `Doppelter Child-Ref: ${childId}` })
        return
      }
      seenChildren.add(childId)
    })

    if (goal.type === 'cluster' && goal.contains.length === 0) {
      diagnostics.push({ severity: 'error', goalId: goal.id, message: 'Expliziter Cluster ohne direkte Kinder.' })
    }
    if (goal.type === 'atomic' && goal.contains.length > 0) {
      diagnostics.push({ severity: 'error', goalId: goal.id, message: 'Expliziter Atomic-Knoten mit direkten Kindern.' })
    }
  })

  index.goalById.forEach((_, goalId) => detectCycles(goalId))
  cycleNodes.forEach((goalId) => {
    diagnostics.push({ severity: 'error', goalId, message: 'Zyklus im contains-Graph erkannt.' })
  })

  return diagnostics.sort((left, right) => {
    if (left.goalId && right.goalId && left.goalId !== right.goalId) return index.compareGoalIds(left.goalId, right.goalId)
    if (left.goalId && !right.goalId) return -1
    if (!left.goalId && right.goalId) return 1
    return left.message.localeCompare(right.message, 'de')
  })
}

export const buildCanonicalGoalWarnings = (
  goal: CanonicalAuthoringGoal,
  parentCount: number,
): AuthoringDiagnostic[] => {
  const warnings: AuthoringDiagnostic[] = []
  const nodeType = resolveCanonicalNodeType(goal)

  if (parentCount > 1) {
    warnings.push({ severity: 'warning', goalId: goal.id, message: 'Mehr als ein direkter Parent.' })
  }

  if (nodeType === 'cluster' && !(goal.shortKey ?? '').trim()) {
    warnings.push({ severity: 'warning', goalId: goal.id, message: 'Cluster ohne shortKey.' })
  }

  if (STATE_LOOKING_TITLE_PATTERN.test(goal.title)) {
    warnings.push({ severity: 'warning', goalId: goal.id, message: 'Titel wirkt bundesland- oder phasenspezifisch.' })
  }

  if ((goal.titleEn ?? '').trim() === '') {
    warnings.push({ severity: 'warning', goalId: goal.id, message: 'titleEn fehlt.' })
  }

  if ((goal.descriptionEn ?? '').trim() === '') {
    warnings.push({ severity: 'warning', goalId: goal.id, message: 'descriptionEn fehlt.' })
  }

  return warnings
}

export const deriveNewClusterFromParent = (parent?: CanonicalAuthoringGoal): CanonicalAuthoringGoal => {
  const inheritedTags = (parent?.tags ?? []).filter((tag) =>
    tag === 'canonical'
    || tag === 'GK'
    || tag === 'LK'
    || tag.startsWith('phase:')
    || tag.startsWith('area:'),
  )

  return {
    id: crypto.randomUUID(),
    title: 'New Cluster',
    titleEn: 'New Cluster',
    description: '',
    descriptionEn: '',
    shortKey: '',
    requires: [],
    contains: [],
    type: 'cluster',
    weight: 1,
    core: typeof parent?.core === 'boolean' ? parent.core : true,
    tags: inheritedTags.length > 0 ? Array.from(new Set(inheritedTags)) : ['canonical'],
    dimensionTags: parent?.dimensionTags ? cloneJsonValue(parent.dimensionTags) : undefined,
  }
}
