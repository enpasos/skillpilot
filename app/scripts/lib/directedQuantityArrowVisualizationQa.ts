// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
export const DIRECTED_QUANTITY_ARROW_CRITERION = 'directed-quantity-arrows-v1' as const
export type ArrowImageRepresentation = 'spatialQuantityArrow' | 'separateVectorConstruction'
  | 'fieldLineConvention' | 'opticalRayOrObject' | 'displacementArrow' | 'otherRepresentation' | 'none' | 'unresolved'
export type ArrowCriterionCheck = 'pass' | 'fail' | 'notApplicable' | 'undecided'
export interface DirectedQuantityArrowImageReview {
  criterionVersion: typeof DIRECTED_QUANTITY_ARROW_CRITERION
  assetSha256: string
  representationKinds: ArrowImageRepresentation[]
  status: 'accepted' | 'notApplicable' | 'undecided' | 'rejected'
  checks: {
    referencePoint: ArrowCriterionCheck
    direction: ArrowCriterionCheck
    quantityAndOwnScale: ArrowCriterionCheck
    tipNotPlace: ArrowCriterionCheck
    additionSameQuantityReference: ArrowCriterionCheck
  }
  evidence: { path: string; sha256: string; entryId: string }
  reviewedAt: string | null
  reviewer: string
  notes: string
}
export interface ArrowImageQaRecord {
  goalId: string
  assetSha256?: unknown
  visualizationState?: unknown
  directedQuantityArrowReview?: unknown
}
const checkNames = ['referencePoint', 'direction', 'quantityAndOwnScale', 'tipNotPlace', 'additionSameQuantityReference'] as const
const representationKinds = new Set(['spatialQuantityArrow', 'separateVectorConstruction', 'fieldLineConvention',
  'opticalRayOrObject', 'displacementArrow', 'otherRepresentation', 'none', 'unresolved'])
const digestPattern = /^sha256:[a-f0-9]{64}$/u
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

/** Pixels are judged by an actual material reader. This validates the reader's
 * typed decision and its exact-asset binding, never infers a vector from a title.
 */
export function directedQuantityArrowImageIssues(record: ArrowImageQaRecord): string[] {
  const problems: string[] = []
  const issue = (message: string) => problems.push(`${record.goalId}: ${message}`)
  const value = record.directedQuantityArrowReview
  if (!isObject(value)) return [`${record.goalId}: missing directed-quantity-arrow image decision`]
  const allowed = new Set(['criterionVersion', 'assetSha256', 'representationKinds', 'status', 'checks', 'evidence', 'reviewedAt', 'reviewer', 'notes'])
  if (Object.keys(value).some(key => !allowed.has(key))) issue('unknown arrow review property')
  if (value.criterionVersion !== DIRECTED_QUANTITY_ARROW_CRITERION) issue('unsupported arrow criterion')
  if (!digestPattern.test(String(value.assetSha256)) || value.assetSha256 !== record.assetSha256) issue('arrow decision is not bound to the current image hash')
  if (!Array.isArray(value.representationKinds) || !value.representationKinds.length
    || new Set(value.representationKinds).size !== value.representationKinds.length
    || value.representationKinds.some(kind => !representationKinds.has(String(kind)))) issue('invalid image representation classification')
  if (!['accepted', 'notApplicable', 'undecided', 'rejected'].includes(String(value.status))) issue('invalid arrow decision status')
  const evidence = value.evidence
  if (!isObject(evidence) || Object.keys(evidence).some(key => !['path', 'sha256', 'entryId'].includes(key))
    || typeof evidence.path !== 'string' || !/^curricula\/DE\/Gymnasium\/quality\//u.test(evidence.path)
    || evidence.path.includes('..') || !digestPattern.test(String(evidence.sha256))
    || typeof evidence.entryId !== 'string' || !evidence.entryId) issue('invalid arrow review evidence binding')
  if (typeof value.notes !== 'string' || !value.notes.trim()) issue('missing individual arrow review rationale')
  const checks = value.checks
  if (!isObject(checks) || Object.keys(checks).length !== checkNames.length
    || checkNames.some(key => !['pass', 'fail', 'notApplicable', 'undecided'].includes(String(checks[key])))) {
    issue('incomplete arrow criterion checks')
    return problems
  }
  const kinds = Array.isArray(value.representationKinds) ? value.representationKinds : []
  const quantitative = kinds.includes('spatialQuantityArrow') || kinds.includes('separateVectorConstruction')
  if (value.status === 'accepted') {
    if (!quantitative || kinds.includes('unresolved')) issue('accepted criterion has no resolved quantity-arrow representation')
    if (checkNames.some(key => checks[key] === 'fail' || checks[key] === 'undecided')) issue('accepted criterion contains failed or undecided checks')
    for (const key of ['referencePoint', 'direction', 'quantityAndOwnScale', 'tipNotPlace']) {
      if (checks[key] !== 'pass') issue(`accepted quantity arrow lacks ${key}`)
    }
    if (typeof value.reviewedAt !== 'string' || !Number.isFinite(Date.parse(value.reviewedAt))
      || typeof value.reviewer !== 'string' || !value.reviewer.trim()) issue('accepted criterion lacks an actual attributed review')
  }
  if (value.status === 'notApplicable' && (quantitative || kinds.includes('unresolved')
    || checkNames.some(key => checks[key] !== 'notApplicable'))) issue('quantity arrow cannot be exempted from the image criterion')
  if (value.status === 'undecided' && checkNames.some(key => checks[key] !== 'undecided')) issue('undecided image must not claim passed criterion parts')
  if (value.status === 'rejected' && !checkNames.some(key => checks[key] === 'fail')) issue('rejected image has no failed criterion')
  return problems
}

/** Generator preservation is lossless for unchanged bytes. Changed bytes retain
 * no predecessor criterion decision; an explicit successor review is required.
 */
export function preserveDirectedQuantityArrowImageReview(
  existing: { directedQuantityArrowReview?: unknown } | undefined,
  currentAssetSha256: string,
): { directedQuantityArrowReview?: unknown } {
  const review = existing?.directedQuantityArrowReview
  return isObject(review) && review.assetSha256 === currentAssetSha256
    ? { directedQuantityArrowReview: structuredClone(review) } : {}
}

export function isDirectedQuantityArrowCriterionApproved(record: ArrowImageQaRecord): boolean {
  if (directedQuantityArrowImageIssues(record).length) return false
  const review = record.directedQuantityArrowReview as DirectedQuantityArrowImageReview
  return review.status === 'accepted' || review.status === 'notApplicable'
}

export function validateDirectedQuantityArrowImageEvidence(
  records: readonly ArrowImageQaRecord[], readBytes: (path: string) => Buffer,
): { accepted: number; notApplicable: number; undecided: number; rejected: number } {
  const counts = { accepted: 0, notApplicable: 0, undecided: 0, rejected: 0 }
  const loaded = new Map<string, Map<string, { goalId: string; review: Omit<DirectedQuantityArrowImageReview, 'evidence'> }>>()
  const loadedHashes = new Map<string, string>()
  const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
  const stable = (value: unknown): string => JSON.stringify(value && typeof value === 'object'
    ? Array.isArray(value) ? value.map(item => JSON.parse(stable(item)))
      : Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, item]) => [key, JSON.parse(stable(item))]))
    : value)
  for (const record of records) {
    if (record.visualizationState !== 'available') continue
    const issues = directedQuantityArrowImageIssues(record)
    if (issues.length) throw new Error(`Directed quantity arrows: ${issues.join('; ')}`)
    const review = record.directedQuantityArrowReview as DirectedQuantityArrowImageReview
    let rows = loaded.get(review.evidence.path)
    if (!rows) {
      const bytes = readBytes(review.evidence.path)
      if (digest(bytes) !== review.evidence.sha256) throw new Error(`Directed quantity arrows: image review evidence hash mismatch for ${record.goalId}`)
      const source = JSON.parse(bytes.toString('utf8')) as { schemaVersion: number; documentType: string;
        sourceBindings: Array<{ path: string; sha256: string }>; rows: Array<{ goalId: string; review: Omit<DirectedQuantityArrowImageReview, 'evidence'> }> }
      if (source.schemaVersion !== 1 || source.documentType !== 'directed-quantity-arrow-image-decisions' || !Array.isArray(source.rows)
        || !Array.isArray(source.sourceBindings)) throw new Error('Directed quantity arrows: invalid image criterion review evidence')
      for (const binding of source.sourceBindings) {
        if (!/^curricula\/DE\/Gymnasium\/quality\//u.test(binding.path) || binding.path.includes('..')
          || digest(readBytes(binding.path)) !== binding.sha256) throw new Error(`Directed quantity arrows: changed image review source ${binding.path}`)
      }
      rows = new Map(source.rows.map(row => [row.goalId, row]))
      if (rows.size !== source.rows.length) throw new Error('Directed quantity arrows: duplicate image review evidence entry')
      loaded.set(review.evidence.path, rows)
      loadedHashes.set(review.evidence.path, digest(bytes))
    }
    if (loadedHashes.get(review.evidence.path) !== review.evidence.sha256) throw new Error(`Directed quantity arrows: image review evidence hash mismatch for ${record.goalId}`)
    const { evidence: _binding, ...decision } = review
    const row = rows.get(review.evidence.entryId)
    if (!row || row.goalId !== record.goalId || stable(row.review) !== stable(decision)) throw new Error(`Directed quantity arrows: image decision contradicts reviewed material for ${record.goalId}`)
    counts[review.status] += 1
  }
  return counts
}
