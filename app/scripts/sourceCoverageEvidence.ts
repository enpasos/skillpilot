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
}: CheckerOptions<CanonicalGoal>): {
  hasCoverageBackedJurisdictionEvidence: (goal: SourceCoverageGoalLike) => boolean
  hasReviewedRequiresClosureSurrogateEvidence: (goal: SourceCoverageGoalLike) => boolean
} {
  const goalById = new Map(goals.map((goal) => [goal.goalId, goal]))

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
      if (!hasActiveRequiresEvidence) return false

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
