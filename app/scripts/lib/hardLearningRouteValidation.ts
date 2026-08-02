export type HardRouteSemanticKind =
  | 'orientation'
  | 'curricularAtomic'
  | 'curricularArea'
  | 'practiceAssessment'
  | 'memory'
  | 'programStructure'
  | 'runtimeSupport'

export interface HardRouteGoal {
  id: string
  title?: string
  requires?: string[]
  contains?: string[]
}

export interface OrientationMotivationGoal extends HardRouteGoal {
  semanticKind?: HardRouteSemanticKind
  type?: string
  nodeKind?: string
  tags?: string[]
  examples?: unknown[]
  examData?: unknown
}

export interface HardRouteProfile<TGoal extends HardRouteGoal> {
  scopeLabel: string
  motivationAnchorGoalIds: string[]
  terminalGoalClusterIds: string[]
  /**
   * Selects every semantic route node that is allowed to prove this scoped
   * route. This is deliberately separate from goalSelector: a stage profile
   * may allow reviewed memory/assessment nodes without selecting them as
   * ordinary curricular goals that need their own coverage finding.
   */
  routeGoalSelector?: (goal: TGoal) => boolean
  goalSelector: (goal: TGoal) => boolean
}

export interface HardRouteFinding {
  goalId?: string
  message: string
}

const LEGACY_ORIENTATION_TAGS = new Set(['motivation', 'orientation'])
const FORBIDDEN_ORIENTATION_TAGS = new Set(['assessment', 'exam', 'practice', 'abitur'])

/**
 * Validates the global structural contract of a motivation/orientation node.
 * An authoritative semantic kind always wins; explicit legacy tags are used
 * only when no semantic kind is available.
 */
export const validateOrientationMotivationStructure = <TGoal extends OrientationMotivationGoal>(
  goal: TGoal,
  authoritativeSemanticKind: HardRouteSemanticKind | undefined = goal.semanticKind,
): HardRouteFinding[] => {
  const normalizedTags = (goal.tags ?? [])
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim().toLowerCase())
  const isOrientation = authoritativeSemanticKind !== undefined
    ? authoritativeSemanticKind === 'orientation'
    : normalizedTags.some((tag) => LEGACY_ORIENTATION_TAGS.has(tag))
  if (!isOrientation) return []

  const findings: HardRouteFinding[] = []
  const add = (message: string) => findings.push({ goalId: goal.id, message })
  if ((goal.contains?.length ?? 0) > 0 || goal.type === 'cluster') {
    add('Motivation/orientation goal must be atomic.')
  }
  if ((goal.requires?.length ?? 0) > 0) {
    add('Motivation/orientation goal must be prerequisite-free.')
  }
  if (goal.examData !== undefined && goal.examData !== null) {
    add('Motivation/orientation goal must not carry assessment metadata (examData).')
  }
  if (goal.nodeKind === 'exam' || goal.nodeKind === 'memory') {
    add(`Motivation/orientation goal must not use nodeKind=${goal.nodeKind}.`)
  }
  if ((goal.examples?.length ?? 0) > 0) {
    add('Motivation/orientation goal must not carry assessable examples.')
  }
  const forbiddenTags = normalizedTags.filter((tag) => (
    tag === 'memorization'
    || tag.startsWith('srs-deck:')
    || FORBIDDEN_ORIENTATION_TAGS.has(tag)
  ))
  if (forbiddenTags.length > 0) {
    add(`Motivation/orientation goal carries forbidden learning or assessment tag(s): ${Array.from(new Set(forbiddenTags)).join(', ')}.`)
  }
  return findings
}

type HardRouteProofSemanticKind = Extract<HardRouteSemanticKind,
  'orientation' | 'curricularAtomic' | 'memory' | 'practiceAssessment'>

const ROUTE_SEMANTIC_KINDS = new Set<HardRouteProofSemanticKind>([
  'orientation',
  'curricularAtomic',
  'memory',
  'practiceAssessment',
])

const isRouteSemanticKind = (
  semanticKind: HardRouteSemanticKind | undefined,
): semanticKind is HardRouteProofSemanticKind => (
  semanticKind !== undefined && ROUTE_SEMANTIC_KINDS.has(semanticKind as HardRouteProofSemanticKind)
)

const ROUTE_ORDER: Readonly<Record<HardRouteProofSemanticKind, number>> = {
  orientation: 0,
  curricularAtomic: 1,
  memory: 1,
  practiceAssessment: 2,
}

const hasPathToTarget = (
  startId: string,
  targetId: string,
  edgeMap: Map<string, string[]>,
): boolean => {
  if (startId === targetId) return true
  const visited = new Set<string>()
  const stack = [startId]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || visited.has(current)) continue
    visited.add(current)
    for (const next of edgeMap.get(current) ?? []) {
      if (next === targetId) return true
      if (!visited.has(next)) stack.push(next)
    }
  }
  return false
}

const buildReverseEdges = (edgeMap: Map<string, string[]>): Map<string, string[]> => {
  const reverse = new Map<string, string[]>()
  edgeMap.forEach((targets, sourceId) => {
    if (!reverse.has(sourceId)) reverse.set(sourceId, [])
    targets.forEach((targetId) => {
      reverse.set(targetId, [...(reverse.get(targetId) ?? []), sourceId])
    })
  })
  return reverse
}

const collectAtomicDescendants = <TGoal extends HardRouteGoal>(
  goalId: string,
  goalById: Map<string, TGoal>,
  visiting = new Set<string>(),
): string[] => {
  if (visiting.has(goalId)) return []
  const goal = goalById.get(goalId)
  if (!goal) return []
  if ((goal.contains?.length ?? 0) === 0) return [goalId]
  const nextVisiting = new Set(visiting)
  nextVisiting.add(goalId)
  return Array.from(new Set((goal.contains ?? []).flatMap((childId) =>
    collectAtomicDescendants(childId, goalById, nextVisiting))))
}

/**
 * Proves the strict route invariant on authored direct atomic prerequisites.
 * Compatibility inheritance from clusters is deliberately excluded.
 */
export const validateHardDirectAtomicRoutes = <TGoal extends HardRouteGoal>(
  goals: TGoal[],
  semanticKindByGoalId: ReadonlyMap<string, HardRouteSemanticKind>,
  profile: HardRouteProfile<TGoal>,
): HardRouteFinding[] => {
  const findings: HardRouteFinding[] = []
  const goalById = new Map(goals.map((goal) => [goal.id, goal]))
  const isAtomic = (goal: TGoal) => (goal.contains?.length ?? 0) === 0
  const isProfileRouteGoal = (goal: TGoal): boolean => (
    isAtomic(goal)
    && isRouteSemanticKind(semanticKindByGoalId.get(goal.id))
    && (profile.routeGoalSelector?.(goal) ?? true)
  )
  const directAtomicEdges = new Map<string, string[]>()

  goals.forEach((goal) => {
    if (!isProfileRouteGoal(goal)) return
    directAtomicEdges.set(
      goal.id,
      Array.from(new Set((goal.requires ?? []).filter((requiredId) => {
        const requiredGoal = goalById.get(requiredId)
        return requiredGoal !== undefined && isProfileRouteGoal(requiredGoal)
      }))),
    )
  })
  const reverseDirectAtomicEdges = buildReverseEdges(directAtomicEdges)
  const invalidRouteRequirementIds = (goal: TGoal): string[] => (
    (goal.requires ?? []).filter((requiredId) => {
      const requiredGoal = goalById.get(requiredId)
      return requiredGoal === undefined
        || !isAtomic(requiredGoal)
        || !isRouteSemanticKind(semanticKindByGoalId.get(requiredId))
    })
  )
  const reportedInvalidRequirements = new Set<string>()
  const reportInvalidRequirements = (goal: TGoal) => {
    if (reportedInvalidRequirements.has(goal.id)) return
    const invalidRequirementIds = invalidRouteRequirementIds(goal)
    if (invalidRequirementIds.length === 0) return
    reportedInvalidRequirements.add(goal.id)
    findings.push({
      goalId: goal.id,
      message: `Route goal has non-route direct prerequisite(s) ${invalidRequirementIds.join(', ')} for ${profile.scopeLabel}.`,
    })
  }

  profile.motivationAnchorGoalIds.forEach((anchorId) => {
    const anchor = goalById.get(anchorId)
    if (!anchor) {
      findings.push({ goalId: anchorId, message: `Missing motivation anchor for ${profile.scopeLabel}.` })
      return
    }
    if (!isAtomic(anchor)
        || semanticKindByGoalId.get(anchorId) !== 'orientation'
        || !(profile.routeGoalSelector?.(anchor) ?? true)
        || (anchor.requires?.length ?? 0) > 0) {
      findings.push({
        goalId: anchorId,
        message: `Motivation anchor must be an in-scope atomic semanticKind=orientation goal and prerequisite-free for ${profile.scopeLabel}.`,
      })
    }
  })

  const terminalIds = Array.from(new Set(profile.terminalGoalClusterIds.flatMap((clusterId) => {
    if (!goalById.has(clusterId)) {
      findings.push({ goalId: clusterId, message: `Missing terminal cluster for ${profile.scopeLabel}.` })
      return []
    }
    return collectAtomicDescendants(clusterId, goalById)
  })))

  if (terminalIds.length === 0) {
    findings.push({ message: `No atomic terminal goals configured for ${profile.scopeLabel}.` })
  }

  terminalIds.forEach((terminalId) => {
    const terminal = goalById.get(terminalId)
    if (!terminal) {
      findings.push({ goalId: terminalId, message: `Missing terminal goal for ${profile.scopeLabel}.` })
      return
    }
    if (!isAtomic(terminal)
        || semanticKindByGoalId.get(terminalId) !== 'practiceAssessment'
        || !(profile.routeGoalSelector?.(terminal) ?? true)) {
      findings.push({
        goalId: terminalId,
        message: `Terminal goal must be an in-scope atomic semanticKind=practiceAssessment goal for ${profile.scopeLabel}.`,
      })
    }
    reportInvalidRequirements(terminal)
    if (!profile.motivationAnchorGoalIds.some((anchorId) =>
      hasPathToTarget(terminalId, anchorId, directAtomicEdges))) {
      findings.push({
        goalId: terminalId,
        message: `Terminal goal has no direct atomic path to its motivation anchor for ${profile.scopeLabel}.`,
      })
    }
  })

  goals.filter(profile.goalSelector).forEach((goal) => {
    if (!isAtomic(goal) || semanticKindByGoalId.get(goal.id) !== 'curricularAtomic') {
      findings.push({
        goalId: goal.id,
        message: `Selected route goal must be atomic and semanticKind=curricularAtomic for ${profile.scopeLabel}.`,
      })
      return
    }
    if (!(profile.routeGoalSelector?.(goal) ?? true)) {
      findings.push({
        goalId: goal.id,
        message: `Curricular atomic goal is outside the explicit route-node scope for ${profile.scopeLabel}.`,
      })
    }
    reportInvalidRequirements(goal)
    const missingSegments: string[] = []
    if (!profile.motivationAnchorGoalIds.some((anchorId) =>
      hasPathToTarget(goal.id, anchorId, directAtomicEdges))) {
      missingSegments.push('motivation')
    }
    if (!terminalIds.some((terminalId) =>
      hasPathToTarget(goal.id, terminalId, reverseDirectAtomicEdges))) {
      missingSegments.push('terminal')
    }
    if (missingSegments.length > 0) {
      findings.push({
        goalId: goal.id,
        message: `Curricular atomic goal is missing direct atomic ${missingSegments.join(' and ')} route segment(s) for ${profile.scopeLabel}.`,
      })
    }
  })

  const selectedCurricularGoalIds = goals
    .filter(profile.goalSelector)
    .filter((goal) => isAtomic(goal) && semanticKindByGoalId.get(goal.id) === 'curricularAtomic')
    .map((goal) => goal.id)

  terminalIds.forEach((terminalId) => {
    const hasCurricularRoute = selectedCurricularGoalIds.some((goalId) =>
      profile.motivationAnchorGoalIds.some((anchorId) =>
        hasPathToTarget(terminalId, goalId, directAtomicEdges)
        && hasPathToTarget(goalId, anchorId, directAtomicEdges)))
    if (!hasCurricularRoute) {
      findings.push({
        goalId: terminalId,
        message: `Terminal goal has no route through an ordinary curricular atomic goal for ${profile.scopeLabel}.`,
      })
    }
  })

  const proofParticipatingGoals = goals.filter((goal) => {
    if (!isProfileRouteGoal(goal)) return false
    const reachesAnchor = profile.motivationAnchorGoalIds.some((anchorId) =>
      hasPathToTarget(goal.id, anchorId, directAtomicEdges))
    const reachesTerminal = terminalIds.some((terminalId) =>
      hasPathToTarget(goal.id, terminalId, reverseDirectAtomicEdges))
    return reachesAnchor && reachesTerminal
  })

  proofParticipatingGoals.forEach((goal) => {
    reportInvalidRequirements(goal)
    const goalKind = semanticKindByGoalId.get(goal.id)
    if (!isRouteSemanticKind(goalKind)) return

    for (const requiredId of directAtomicEdges.get(goal.id) ?? []) {
      const requiredKind = semanticKindByGoalId.get(requiredId)
      if (!isRouteSemanticKind(requiredKind)) continue
      if (ROUTE_ORDER[requiredKind] <= ROUTE_ORDER[goalKind]) continue
      findings.push({
        goalId: goal.id,
        message: `Route order is reversed: ${goalKind} directly requires later ${requiredKind} goal ${requiredId} for ${profile.scopeLabel}.`,
      })
    }

    if (goalKind === 'memory') {
      const followsCurricularGoal = selectedCurricularGoalIds.some((curricularGoalId) =>
        profile.motivationAnchorGoalIds.some((anchorId) =>
          hasPathToTarget(goal.id, curricularGoalId, directAtomicEdges)
          && hasPathToTarget(curricularGoalId, anchorId, directAtomicEdges)))
      if (!followsCurricularGoal) {
        findings.push({
          goalId: goal.id,
          message: `Memory goal participates in the hard route without following an ordinary curricular atomic goal for ${profile.scopeLabel}.`,
        })
      }
    }
  })

  return findings
}
