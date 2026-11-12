// SPDX-License-Identifier: Apache-2.0
import {
  loadVerifiedPrerequisiteReductionContext,
  verifiedPrerequisiteReductionSummary,
  type VerifiedPrerequisiteReductionContext,
} from './prerequisiteReductionProof'

export interface OptionalHistoricalReviewContext {
  context: VerifiedPrerequisiteReductionContext | undefined
  diagnostic?: string
  detail?: string
}

/**
 * Historical QA comparisons are optional privileges, not current-graph validity.
 * Any failed proof denies that privilege. The caller must still run every QA
 * check against the current goals; this does not catch or waive QA failures.
 */
export async function loadOptionalHistoricalReviewContext(
  options: Parameters<typeof loadVerifiedPrerequisiteReductionContext>[0] = {},
): Promise<OptionalHistoricalReviewContext> {
  try {
    const context = await loadVerifiedPrerequisiteReductionContext(options)
    if (context === undefined) return {
      context: undefined,
      diagnostic: 'Historical review reuse is not available: no declared proof; QA checks current goals only.',
    }
    // Only an actual registered capability may enable historical comparisons.
    verifiedPrerequisiteReductionSummary(context)
    return { context }
  } catch (error) {
    return {
      context: undefined,
      diagnostic: 'Historical review reuse is unavailable: proof verification failed; QA checks current goals only.',
      // Keep OS paths and other machine-specific details out of status artifacts.
      detail: error instanceof Error ? error.message : String(error),
    }
  }
}
