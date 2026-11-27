import { createHash } from 'node:crypto'
import { canonicalJson } from './lib/canonicalJson'
import type { OfficialRow, SourceIdentity } from './sourceMappingReview'

/** Compact UTF-8 JSON with sorted object keys. Array order carries meaning. */
export function sourceMappingDigest(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')
}

export function sourceRowSha256(edition: SourceIdentity, row: OfficialRow): string {
  const { targetLandscapeId, sourceLandscapeId, sourceId, edition: version } = edition
  return sourceMappingDigest({ targetLandscapeId, sourceLandscapeId, sourceId, edition: version,
    sourceGoalId: row.sourceGoalId, sourceRecordSha256: row.sourceRecordSha256, wording: row.wording,
    parentContext: row.parentContext, applicableScopeIds: [...row.applicableScopeIds].sort() })
}
