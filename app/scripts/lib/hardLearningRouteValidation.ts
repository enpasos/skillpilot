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
  nodeKind?: string
  examData?: unknown
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
  /** Include genuine in-scope assessment forms outside the legacy exam folders. */
  terminalGoalSelector?: (goal: TGoal) => boolean
  /**
   * Selects current-stage nodes for the terminal relation and own-anchor proof.
   * Earlier incoming support is configured separately. A stage profile
   * may allow reviewed memory/assessment nodes without selecting them as
   * ordinary curricular goals that need their own coverage finding.
   */
  routeGoalSelector?: (goal: TGoal) => boolean
  goalSelector: (goal: TGoal) => boolean
  /** Earlier preparation is incoming support only; it never enlarges the terminal scope. */
  priorStagePreparation?: {
    motivationAnchorGoalIds: string[]
    routeGoalSelector: (goal: TGoal) => boolean
  }
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

/** Mirrors the runtime protection role; semantic membership stays independent. */
export const hasHardRouteAssessmentRole = (
  goal: HardRouteGoal, kind: HardRouteSemanticKind | undefined,
): boolean => kind === 'practiceAssessment' || goal.nodeKind?.toLowerCase() === 'exam'
  || goal.examData !== undefined && goal.examData !== null

const hasPathToTarget = (
  startId: string,
  targetId: string,
  edgeMap: Map<string, string[]>,
  isAllowed: (id: string) => boolean = () => true,
): boolean => {
  if (!isAllowed(startId)) return false
  if (startId === targetId) return true
  const visited = new Set<string>()
  const stack = [startId]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || visited.has(current)) continue
    visited.add(current)
    for (const next of edgeMap.get(current) ?? []) {
      if (!isAllowed(next)) continue
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
 * Separate authored preparation from the current-stage terminal relation.
 * Stage membership must be exclusive. In requires direction, preparation may
 * cross current -> prior once; no unknown node or prior -> current return counts.
 */
export const buildHardRouteProofGraph = <TGoal extends HardRouteGoal>(
  goals: TGoal[],
  semanticKindByGoalId: ReadonlyMap<string, HardRouteSemanticKind>,
  profile: HardRouteProfile<TGoal>,
) => {
  const goalById = new Map(goals.map((goal) => [goal.id, goal]))
  const isCurrentStageGoal = (goal: TGoal): boolean => (
    (profile.routeGoalSelector?.(goal) ?? true)
    && !profile.priorStagePreparation?.routeGoalSelector(goal)
  )
  const isPriorStageGoal = (goal: TGoal): boolean => (
    (profile.priorStagePreparation?.routeGoalSelector(goal) ?? false)
    && !(profile.routeGoalSelector?.(goal) ?? true)
  )
  const isRouteGoal = (goal: TGoal): boolean => (
    (goal.contains?.length ?? 0) === 0
    && isRouteSemanticKind(semanticKindByGoalId.get(goal.id))
  )
  const currentStageEdges = new Map<string, string[]>()
  const preparationEdges = new Map<string, string[]>()
  for (const goal of goals) {
    if (!isRouteGoal(goal) || (!isCurrentStageGoal(goal) && !isPriorStageGoal(goal))) continue
    const requirements = Array.from(new Set(goal.requires ?? [])).filter((id) => {
      const required = goalById.get(id)
      return required !== undefined && isRouteGoal(required)
    })
    const current = isCurrentStageGoal(goal)
    if (current) currentStageEdges.set(goal.id, requirements.filter((id) => isCurrentStageGoal(goalById.get(id)!)))
    preparationEdges.set(goal.id, requirements.filter((id) => (
      (current && isCurrentStageGoal(goalById.get(id)!)) || isPriorStageGoal(goalById.get(id)!)
    )))
  }
  const isOrdinaryCurricularGoal = (goal: TGoal): boolean => (
    semanticKindByGoalId.get(goal.id) === 'curricularAtomic'
    && !hasHardRouteAssessmentRole(goal, semanticKindByGoalId.get(goal.id))
  )
  const hasPriorStagePreparationPath = (startId: string): boolean => {
    const visited = new Set<string>()
    const stack: Array<[string, boolean]> = [[startId, false]]
    while (stack.length) {
      const [id, alreadyHasContent] = stack.pop()!
      const goal = goalById.get(id)
      if (!goal || !preparationEdges.has(id)) continue
      const hasContent = alreadyHasContent || (isPriorStageGoal(goal) && isOrdinaryCurricularGoal(goal))
      const key = `${id}:${hasContent}`
      if (visited.has(key)) continue
      visited.add(key)
      if (hasContent && profile.priorStagePreparation?.motivationAnchorGoalIds.includes(id)) return true
      for (const requiredId of preparationEdges.get(id) ?? []) stack.push([requiredId, hasContent])
    }
    return false
  }
  const hasPreparationPath = (startId: string): boolean => (
    profile.motivationAnchorGoalIds.some((id) => hasPathToTarget(startId, id, currentStageEdges))
    || hasPriorStagePreparationPath(startId)
  )
  const reachesPreparationAnchor = (startId: string): boolean => (
    profile.motivationAnchorGoalIds.some((id) => hasPathToTarget(startId, id, currentStageEdges))
    || (profile.priorStagePreparation?.motivationAnchorGoalIds.some((id) =>
      hasPathToTarget(startId, id, preparationEdges)) ?? false)
  )
  const hasEffectiveMotivationPath = (startId: string, effectiveEdges: Map<string, string[]>): boolean => (
    profile.motivationAnchorGoalIds.some((id) => hasPathToTarget(startId, id, effectiveEdges, (goalId) => {
      const goal = goalById.get(goalId)
      return goal !== undefined && isCurrentStageGoal(goal)
    })) || hasPriorStagePreparationPath(startId)
  )
  return { currentStageEdges, preparationEdges, isCurrentStageGoal, isPriorStageGoal, isOrdinaryCurricularGoal,
    hasPreparationPath, reachesPreparationAnchor, hasEffectiveMotivationPath }
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
  const { currentStageEdges: directAtomicEdges, preparationEdges, isCurrentStageGoal,
    isPriorStageGoal, isOrdinaryCurricularGoal, hasPreparationPath, reachesPreparationAnchor } = buildHardRouteProofGraph(goals, semanticKindByGoalId, profile)
  const reverseDirectAtomicEdges = buildReverseEdges(directAtomicEdges)
  const reversePreparationEdges = buildReverseEdges(preparationEdges)
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

  const anchorProfiles = [
    { ids: profile.motivationAnchorGoalIds, selector: isCurrentStageGoal },
    ...(profile.priorStagePreparation ? [{ ids: profile.priorStagePreparation.motivationAnchorGoalIds,
      selector: isPriorStageGoal }] : []),
  ]
  anchorProfiles.forEach(({ ids, selector }) => ids.forEach((anchorId) => {
    const anchor = goalById.get(anchorId)
    if (!anchor) {
      findings.push({ goalId: anchorId, message: `Missing motivation anchor for ${profile.scopeLabel}.` })
      return
    }
    if (!isAtomic(anchor)
        || semanticKindByGoalId.get(anchorId) !== 'orientation'
        || !selector(anchor)
        || (anchor.requires?.length ?? 0) > 0) {
      findings.push({
        goalId: anchorId,
        message: `Motivation anchor must be an in-scope atomic semanticKind=orientation goal and prerequisite-free for ${profile.scopeLabel}.`,
      })
    }
  }))

  const terminalIds = Array.from(new Set([...profile.terminalGoalClusterIds.flatMap((clusterId) => {
    if (!goalById.has(clusterId)) {
      findings.push({ goalId: clusterId, message: `Missing terminal cluster for ${profile.scopeLabel}.` })
      return []
    }
    return collectAtomicDescendants(clusterId, goalById)
  }), ...goals.filter(goal => isAtomic(goal)
    && profile.terminalGoalSelector?.(goal)
    && isCurrentStageGoal(goal)
    && hasHardRouteAssessmentRole(goal, semanticKindByGoalId.get(goal.id))).map(goal => goal.id)]))

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
        || !hasHardRouteAssessmentRole(terminal, semanticKindByGoalId.get(terminalId))
        || !isCurrentStageGoal(terminal)) {
      findings.push({
        goalId: terminalId,
        message: `Terminal goal must be an in-scope atomic assessment (semanticKind=practiceAssessment or actual assessment execution form) goal for ${profile.scopeLabel}.`,
      })
    }
    if (terminal.nodeKind?.toLowerCase() === 'exam' || terminal.examData != null) {
      const exam = terminal.examData as { taskContent?: string; solutionContent?: string; reviewStatus?: string;
        scoring?: { maxPoints?: number; passingPoints?: number; steps?: unknown[] } } | undefined
      if (!exam || typeof exam.taskContent !== 'string' || !exam.taskContent.trim()
          || typeof exam.solutionContent !== 'string' || !exam.solutionContent.trim()
          || exam.reviewStatus && exam.reviewStatus.trim().toLowerCase() !== 'released'
          || !(Number(exam.scoring?.maxPoints) > 0) || !(Number(exam.scoring?.passingPoints) > 0)
          || !Array.isArray(exam.scoring?.steps) || !exam.scoring.steps.length) {
        findings.push({ goalId: terminalId, message: `Assessment execution terminal lacks usable released task/rubric metadata for ${profile.scopeLabel}.` })
      }
    }
    reportInvalidRequirements(terminal)
    if (!hasPreparationPath(terminalId)) {
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
    if (!isCurrentStageGoal(goal)) {
      findings.push({
        goalId: goal.id,
        message: `Curricular atomic goal is outside the explicit route-node scope for ${profile.scopeLabel}.`,
      })
    }
    reportInvalidRequirements(goal)
    const missingSegments: string[] = []
    if (!hasPreparationPath(goal.id)) {
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
    .filter((goal) => isAtomic(goal) && semanticKindByGoalId.get(goal.id) === 'curricularAtomic'
      && !hasHardRouteAssessmentRole(goal, semanticKindByGoalId.get(goal.id)))
    .map((goal) => goal.id)

  terminalIds.forEach((terminalId) => {
    const hasCurricularRoute = selectedCurricularGoalIds.some((goalId) =>
      hasPathToTarget(terminalId, goalId, directAtomicEdges) && hasPreparationPath(goalId))
    if (!hasCurricularRoute) {
      findings.push({
        goalId: terminalId,
        message: `Terminal goal has no route through an ordinary curricular atomic goal for ${profile.scopeLabel}.`,
      })
    }
  })

  const proofParticipatingGoals = goals.filter((goal) => (
    preparationEdges.has(goal.id) && reachesPreparationAnchor(goal.id)
    && terminalIds.some((terminalId) => hasPathToTarget(goal.id, terminalId, reversePreparationEdges))
  ))

  proofParticipatingGoals.forEach((goal) => {
    reportInvalidRequirements(goal)
    const goalKind = semanticKindByGoalId.get(goal.id)
    if (!isRouteSemanticKind(goalKind)) return

    // Witness filtering must never hide an authored prerequisite's role/order.
    for (const requiredId of goal.requires ?? []) {
      const requiredGoal = goalById.get(requiredId)
      const requiredKind = semanticKindByGoalId.get(requiredId)
      if (!requiredGoal || !isAtomic(requiredGoal) || !isRouteSemanticKind(requiredKind)) continue
      const goalOrder = ROUTE_ORDER[goalKind]
      const requiredOrder = ROUTE_ORDER[requiredKind]
      if (requiredOrder <= goalOrder) continue
      findings.push({
        goalId: goal.id,
        message: `Route order is reversed: ${goalKind} directly requires later ${requiredKind} goal ${requiredId} for ${profile.scopeLabel}.`,
      })
    }

    if (goalKind === 'memory') {
      const followsCurricularGoal = goals.some((curricularGoal) => (
        (selectedCurricularGoalIds.includes(curricularGoal.id) || isPriorStageGoal(curricularGoal))
        && isOrdinaryCurricularGoal(curricularGoal) && hasPreparationPath(curricularGoal.id)
        && hasPathToTarget(goal.id, curricularGoal.id, preparationEdges)
      ))
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
