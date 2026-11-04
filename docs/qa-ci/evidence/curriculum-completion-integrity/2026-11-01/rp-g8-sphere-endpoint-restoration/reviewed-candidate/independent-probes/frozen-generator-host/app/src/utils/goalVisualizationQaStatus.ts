export type AiApprovalStatus = 'approved' | 'rejected' | 'open' | 'stale'

export interface AiApprovalRecord {
  assetSha256?: unknown
  aiApproved?: unknown
  aiApprovedAssetSha256?: unknown
  aiReviewedAt?: unknown
}

const normalizedSha256 = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

export const aiApprovalStatus = (record: AiApprovalRecord): AiApprovalStatus => {
  const currentHash = normalizedSha256(record.assetSha256)
  const reviewedHash = normalizedSha256(record.aiApprovedAssetSha256)
  if (!currentHash || !reviewedHash) return record.aiApproved === 'yes' ? 'stale' : 'open'
  if (currentHash !== reviewedHash) return 'stale'

  if (record.aiApproved === 'yes') return 'approved'
  if (record.aiApproved === 'no' && normalizedSha256(record.aiReviewedAt)) return 'rejected'

  return 'open'
}

export const isAiApprovedForCurrentAsset = (record: AiApprovalRecord): boolean =>
  aiApprovalStatus(record) === 'approved'
