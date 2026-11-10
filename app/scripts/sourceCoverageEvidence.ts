export interface SourceCoverageEvidenceLike {
  kind: string
  dimension: string
  value: string
  source: string
}

export interface SourceCoverageGoalLike {
  goalId: string
  goalType: string
  evidence: SourceCoverageEvidenceLike[]
}

export interface ReviewedRequiresClosureEntryLike {
  landscapeId?: string
  goalId?: string
  jurisdiction?: string
  requiredByGoalId?: string
}

interface CheckerOptions<CanonicalGoal> {
  landscapeId: string
  jurisdiction: string
  goals: SourceCoverageGoalLike[]
  canonicalGoalById: Map<string, CanonicalGoal>
  surrogateEntriesByKey: Map<string, ReviewedRequiresClosureEntryLike[]>
  isEligibleCanonicalGoal: (goal: CanonicalGoal | undefined) => boolean
  getCanonicalRequires?: (goal: CanonicalGoal) => readonly string[]
}

export function sourceCoverageSurrogateKey(
  landscapeId: string,
  goalId: string,
  jurisdiction: string,
): string {
  return [landscapeId, goalId, jurisdiction].join('|')
}

export function hasDirectSourceCoverageEvidence(
  goal: SourceCoverageGoalLike,
  jurisdiction: string,
): boolean {
  return goal.evidence.some((evidence) =>
    evidence.dimension === 'jurisdiction'
    && evidence.value === jurisdiction
    && (evidence.kind === 'provenance' || evidence.kind === 'mapping'))
}

export function createReviewedRequiresClosureCoverageChecker<CanonicalGoal>({
  landscapeId,
  jurisdiction,
  goals,
  canonicalGoalById,
  surrogateEntriesByKey,
  isEligibleCanonicalGoal,
  getCanonicalRequires,
}: CheckerOptions<CanonicalGoal>): {
  hasCoverageBackedJurisdictionEvidence: (goal: SourceCoverageGoalLike) => boolean
  hasReviewedRequiresClosureSurrogateEvidence: (goal: SourceCoverageGoalLike) => boolean
} {
  const goalById = new Map(goals.map((goal) => [goal.goalId, goal]))

  const hasActiveRequiresEvidence = (goal: SourceCoverageGoalLike, sourceId: string): boolean =>
    goal.evidence.some((evidence) =>
      evidence.kind === 'requires-closure'
      && evidence.dimension === 'jurisdiction'
      && evidence.value === jurisdiction
      && evidence.source === `required by ${sourceId}`)

  // A reviewed carrier stays fixed when transitive reduction removes its direct
  // edge. Verify the same relation through current local atomic requires hops.
  const hasCurrentRequiresPath = (sourceId: string, targetId: string): boolean => {
    const visiting = new Set<string>()
    const reachesTargetById = new Map<string, boolean>()
    let hasCycle = false
    const visit = (goalId: string): boolean => {
      if (visiting.has(goalId)) {
        hasCycle = true
        return false
      }
      if (reachesTargetById.has(goalId)) return reachesTargetById.get(goalId)!
      const canonicalGoal = canonicalGoalById.get(goalId)
      const reportGoal = goalById.get(goalId)
      if (!canonicalGoal || reportGoal?.goalType !== 'atomic') return false
      visiting.add(goalId)
      let reachesTarget = false
      for (const reference of getCanonicalRequires?.(canonicalGoal) ?? []) {
        if (typeof reference !== 'string') continue
        const parts = reference.split(':')
        const nextId = parts.length === 1 ? parts[0]
          : parts.length === 2 && parts[0] === landscapeId ? parts[1] : undefined
        if (!nextId) continue
        const nextGoal = goalById.get(nextId)
        const canonicalNextGoal = canonicalGoalById.get(nextId)
        if (nextGoal?.goalType !== 'atomic' || !canonicalNextGoal) continue
        const nextReachesTarget = visit(nextId)
        if (hasActiveRequiresEvidence(nextGoal, goalId)
          && (nextId === targetId || nextReachesTarget)) reachesTarget = true
      }
      visiting.delete(goalId)
      reachesTargetById.set(goalId, reachesTarget)
      return reachesTarget
    }
    return sourceId !== targetId && visit(sourceId) && !hasCycle
  }

  const hasCoverageBackedJurisdictionEvidence = (
    goal: SourceCoverageGoalLike,
    visitedGoalIds: Set<string> = new Set(),
  ): boolean => {
    if (hasDirectSourceCoverageEvidence(goal, jurisdiction)) return true
    return hasReviewedRequiresClosureSurrogateEvidence(goal, visitedGoalIds)
  }

  const hasReviewedRequiresClosureSurrogateEvidence = (
    goal: SourceCoverageGoalLike,
    visitedGoalIds: Set<string> = new Set(),
  ): boolean => {
    const entries = surrogateEntriesByKey.get(
      sourceCoverageSurrogateKey(landscapeId, goal.goalId, jurisdiction),
    ) ?? []

    return entries.some((entry) => {
      const requiredByGoalId = entry.requiredByGoalId
      if (entry.landscapeId !== landscapeId || entry.goalId !== goal.goalId
        || entry.jurisdiction !== jurisdiction) return false
      if (!requiredByGoalId || visitedGoalIds.has(requiredByGoalId)) return false
      const requiredByGoal = goalById.get(requiredByGoalId)
      const canonicalRequiredByGoal = canonicalGoalById.get(requiredByGoalId)
      if (
        !requiredByGoal
        || requiredByGoal.goalType !== 'atomic'
        || !canonicalRequiredByGoal
        || !isEligibleCanonicalGoal(canonicalRequiredByGoal)
      ) {
        return false
      }
      if (getCanonicalRequires
        ? !hasCurrentRequiresPath(requiredByGoalId, goal.goalId)
        : !hasActiveRequiresEvidence(goal, requiredByGoalId)) return false

      return hasCoverageBackedJurisdictionEvidence(
        requiredByGoal,
        new Set([...visitedGoalIds, goal.goalId]),
      )
    })
  }

  return {
    hasCoverageBackedJurisdictionEvidence: (goal) =>
      hasCoverageBackedJurisdictionEvidence(goal),
    hasReviewedRequiresClosureSurrogateEvidence: (goal) =>
      hasReviewedRequiresClosureSurrogateEvidence(goal),
  }
}
