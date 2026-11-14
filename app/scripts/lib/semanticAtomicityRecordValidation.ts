// SPDX-License-Identifier: Apache-2.0

/** Shared record contract used by the standalone check and the CQR producer. */
export function validateSemanticAtomicityRecordShape(
  value: unknown,
  config: { reviewId: string; ruleVersion: string; landscapeId: string },
): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return ['Review record must be an object']
  }
  const record = value as Record<string, unknown>
  const errors: string[] = []
  if (record.schemaVersion !== 1) errors.push(`${record.goalId}: schemaVersion must be 1`)
  if (record.reviewId !== config.reviewId) errors.push(`${record.goalId}: reviewId does not match ${config.reviewId}`)
  if (record.ruleVersion !== config.ruleVersion) errors.push(`${record.goalId}: ruleVersion does not match ${config.ruleVersion}`)
  if (record.landscapeId !== config.landscapeId) errors.push(`${record.goalId}: landscapeId does not match ${config.landscapeId}`)
  if (typeof record.status !== 'string' || !['atomic', 'needs_developer_review', 'non_atomic'].includes(record.status)) {
    errors.push(`${record.goalId}: status ${String(record.status)} is not supported`)
  }
  if (record.status === 'atomic' && record.semanticAtomic !== true) {
    errors.push(`${record.goalId}: status atomic requires semanticAtomic true`)
  }
  if (record.status === 'non_atomic' && record.semanticAtomic !== false) {
    errors.push(`${record.goalId}: status non_atomic requires semanticAtomic false`)
  }
  if (record.status === 'needs_developer_review' && record.semanticAtomic !== null) {
    errors.push(`${record.goalId}: status needs_developer_review requires semanticAtomic null`)
  }
  if (typeof record.reason !== 'string' || !record.reason.trim()) errors.push(`${record.goalId}: reason is required`)
  return errors
}
