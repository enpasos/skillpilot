export type GoalVisualizationQaYesNo = 'yes' | 'no'

export interface GoalVisualizationAiReviewFields {
  aiApproved: GoalVisualizationQaYesNo
  aiApprovedAssetSha256: string
  aiReviewedAt: string | null
  aiReviewer: string
  aiNotes: string
}

type GoalVisualizationAiReviewRecord = Partial<GoalVisualizationAiReviewFields> & {
  assetSha256?: unknown
}

const normalizeText = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim()

const normalizeTimestamp = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

export const emptyGoalVisualizationAiReview = (): GoalVisualizationAiReviewFields => ({
  aiApproved: 'no',
  aiApprovedAssetSha256: '',
  aiReviewedAt: null,
  aiReviewer: '',
  aiNotes: '',
})

/**
 * AI review state is evidence for one exact image, never for a goal or URL in
 * general. A missing or different review hash therefore invalidates the whole
 * AI review block. Legacy ChatGPT triage fields intentionally do not imply an
 * explicit AI approval.
 */
export const normalizeGoalVisualizationAiReview = (
  existing: GoalVisualizationAiReviewRecord | Record<string, unknown> | undefined,
  currentAssetSha256: string,
): GoalVisualizationAiReviewFields => {
  const reviewHash = normalizeText(existing?.aiApprovedAssetSha256)
  if (!currentAssetSha256 || reviewHash !== currentAssetSha256) {
    return emptyGoalVisualizationAiReview()
  }

  return {
    aiApproved: existing?.aiApproved === 'yes' ? 'yes' : 'no',
    aiApprovedAssetSha256: reviewHash,
    aiReviewedAt: normalizeTimestamp(existing?.aiReviewedAt),
    aiReviewer: normalizeText(existing?.aiReviewer),
    aiNotes: normalizeText(existing?.aiNotes),
  }
}

export const isGoalVisualizationAiApproved = (
  record: GoalVisualizationAiReviewRecord,
): boolean => isAiApprovedForCurrentAsset(record)
import { isAiApprovedForCurrentAsset } from '../src/utils/goalVisualizationQaStatus'
