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

/** Scope IDs belong to one validated native projection. A recursive branch may
 * only narrow this set; a new consumer never resets its original scope. */
export interface ReviewedDemandScopeAdapter {
  initialTargetScopeIds: (goalId: string) => ReadonlySet<string>
  reviewedDemandScopeIds: (
    prerequisiteGoalId: string,
    reviewedConsumerGoalId: string,
    candidateScopeIds: ReadonlySet<string>,
  ) => ReadonlySet<string>
}

interface CheckerOptions<CanonicalGoal> {
  landscapeId: string
  jurisdiction: string
  goals: SourceCoverageGoalLike[]
  canonicalGoalById: Map<string, CanonicalGoal>
  surrogateEntriesByKey: Map<string, ReviewedRequiresClosureEntryLike[]>
  isEligibleCanonicalGoal: (goal: CanonicalGoal | undefined) => boolean
  /** When supplied, the actual scope witness is mandatory even for a direct edge. */
  hasReviewedDemandWitness?: (prerequisiteGoalId: string, reviewedConsumerGoalId: string) => boolean
  /** When supplied, no legacy boolean or direct-edge annotation can replace it. */
  demandScopeAdapter?: ReviewedDemandScopeAdapter
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
  hasReviewedDemandWitness,
  demandScopeAdapter,
}: CheckerOptions<CanonicalGoal>): {
  hasCoverageBackedJurisdictionEvidence: (goal: SourceCoverageGoalLike) => boolean
  hasReviewedRequiresClosureSurrogateEvidence: (goal: SourceCoverageGoalLike) => boolean
} {
  const goalById = new Map(goals.map((goal) => [goal.goalId, goal]))

  const hasCoverageBackedJurisdictionEvidence = (
    goal: SourceCoverageGoalLike,
    visitedGoalIds: ReadonlySet<string>,
    candidateScopeIds?: ReadonlySet<string>,
  ): boolean => {
    if (demandScopeAdapter && !candidateScopeIds?.size) return false
    if (hasDirectSourceCoverageEvidence(goal, jurisdiction)) return true
    return hasReviewedRequiresClosureSurrogateEvidence(goal, visitedGoalIds, candidateScopeIds)
  }

  const hasReviewedRequiresClosureSurrogateEvidence = (
    goal: SourceCoverageGoalLike,
    visitedGoalIds: ReadonlySet<string>,
    candidateScopeIds?: ReadonlySet<string>,
  ): boolean => {
    if (demandScopeAdapter && (!candidateScopeIds?.size || goal.goalType !== 'atomic'
      || !isEligibleCanonicalGoal(canonicalGoalById.get(goal.goalId)))) return false
    const entries = surrogateEntriesByKey.get(
      sourceCoverageSurrogateKey(landscapeId, goal.goalId, jurisdiction),
    ) ?? []

    return entries.some((entry) => {
      const requiredByGoalId = entry.requiredByGoalId
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
      const hasActiveRequiresEvidence = goal.evidence.some((evidence) =>
        evidence.kind === 'requires-closure'
        && evidence.dimension === 'jurisdiction'
        && evidence.value === jurisdiction
        && evidence.source === `required by ${requiredByGoalId}`)
      let nextScopeIds = candidateScopeIds
      if (demandScopeAdapter) {
        const reviewed = demandScopeAdapter.reviewedDemandScopeIds(
          goal.goalId, requiredByGoalId, candidateScopeIds!,
        )
        nextScopeIds = new Set([...candidateScopeIds!].filter(id => reviewed.has(id)))
        if (nextScopeIds.size === 0) return false
      } else if (hasReviewedDemandWitness
        ? !hasReviewedDemandWitness(goal.goalId, requiredByGoalId)
        : !hasActiveRequiresEvidence) return false

      return hasCoverageBackedJurisdictionEvidence(
        requiredByGoal,
        new Set([...visitedGoalIds, goal.goalId]),
        nextScopeIds,
      )
    })
  }

  return {
    hasCoverageBackedJurisdictionEvidence: (goal) =>
      // Genuine direct source evidence does not require a surrogate route.
      hasDirectSourceCoverageEvidence(goal, jurisdiction)
      || hasReviewedRequiresClosureSurrogateEvidence(goal, new Set([goal.goalId]),
        demandScopeAdapter?.initialTargetScopeIds(goal.goalId)),
    hasReviewedRequiresClosureSurrogateEvidence: (goal) =>
      hasReviewedRequiresClosureSurrogateEvidence(goal, new Set([goal.goalId]),
        demandScopeAdapter?.initialTargetScopeIds(goal.goalId)),
  }
}
