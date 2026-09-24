export type MathM7PartialOpenGoal = {
  goalId: string
  reason: 'review_dissent' | 'review_revision' | 'review_block' | 'current_image_hold' | 'unresolved_prior_dissent'
  note: string
  priorDissent?: {
    reviewRecordPath: string
    recordId: string
  }
}

type PriorReviewRecord = {
  goalId: string
  recordId: string
  decision: string
}

export const validateMathM7PartialOpenReason = (
  entry: MathM7PartialOpenGoal,
  firstDecision: string,
  secondDecision: string,
  priorReviewRecord?: PriorReviewRecord,
): string | null => {
  if (!entry.note?.trim()) return `${entry.goalId}: open-goal note is required`
  const bothKeep = firstDecision === 'keep' && secondDecision === 'keep'
  if (entry.reason === 'review_dissent') {
    return bothKeep ? `${entry.goalId}: review-dissent exclusion has two KEEP decisions` : null
  }
  if (entry.reason === 'review_revision') {
    return firstDecision === 'revise' && secondDecision === 'revise'
      ? null
      : `${entry.goalId}: review-revision exclusion needs two REVISE decisions`
  }
  if (entry.reason === 'review_block') {
    return firstDecision === 'block' && secondDecision === 'block'
      ? null
      : `${entry.goalId}: review-block exclusion needs two BLOCK decisions`
  }
  if (entry.reason === 'current_image_hold') {
    return bothKeep ? null : `${entry.goalId}: image-hold exclusion also has review dissent; classify both explicitly before synthesis`
  }
  if (entry.reason === 'unresolved_prior_dissent') {
    if (!bothKeep) return `${entry.goalId}: prior-dissent exclusion needs two current KEEP decisions`
    if (!entry.priorDissent?.reviewRecordPath?.trim() || !entry.priorDissent.recordId?.trim()) {
      return `${entry.goalId}: prior-dissent exclusion needs an exact historical review record binding`
    }
    if (
      priorReviewRecord?.goalId !== entry.goalId
      || priorReviewRecord.recordId !== entry.priorDissent.recordId
      || !['split_review', 'block'].includes(priorReviewRecord.decision)
    ) return `${entry.goalId}: historical review record does not prove the prior dissent`
    return null
  }
  return `${entry.goalId}: invalid partial open-goal reason`
}

export const classifyMathM7PartialPageOrImageBinding = (
  goalId: string,
  claimed: boolean,
  matchesReviewedBytes: boolean,
  kind: 'GoalBook page' | 'image bytes',
): 'exact' | 'unclaimed_drift' => {
  if (matchesReviewedBytes) return 'exact'
  if (claimed) throw new Error(`${goalId}: claimed ${kind} changed; targeted review is required`)
  return 'unclaimed_drift'
}
