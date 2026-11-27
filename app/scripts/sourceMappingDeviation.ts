import { createHash } from 'node:crypto'
import { sourceMappingDigest } from './sourceMappingDigest'

type EditionIdentity = { targetLandscapeId: string; sourceId: string; edition: string }
type EvidenceRef = { path: string; sha256: string }
type RowRef = { sourceGoalId: string; rowSha256: string }
type OriginalLocation = { locator: string; excerpt: string }
type EvidenceRoute = { route: string; finding: string }
type StandingDecision = {
  standingDecision: EvidenceRef
  retainedPerformance: string
  droppedPerformance: string
}

type DeviationEvidence =
  | { category: 'schoolOrTeacher'; evidence: {
      addressedTo: 'school' | 'teacher'; subject: string; operator: string
      heading: string; tableHeader: string; sourceLocation: OriginalLocation
    } }
  | { category: 'duplicate'; evidence: { duplicateOf: RowRef; samePerformance: string; sameScope: string } }
  | { category: 'replacedWithinEdition'; evidence: {
      replacedBy: RowRef; replacedLocation: OriginalLocation; replacementLocation: OriginalLocation
      authorityLocation: OriginalLocation; effectivePeriod: string
    } }
  | { category: 'infeasiblePracticalAssessment'; evidence: StandingDecision & {
      requiredPerformance: string; practicalObstacle: string
      consideredEvidenceRoutes: EvidenceRoute[]; ownInvestigation: EvidenceRoute
    } }
  | { category: 'deliberateDidacticDeviation'; evidence: StandingDecision & { learnerImpact: string } }

export type DeclinedDecision = RowRef & {
  decision: 'declined'
  author: string
  reviewer: string
  reviewedAt: string
  deviation: DeviationEvidence & { categoryVersion: 1; reason: string; review: EvidenceRef }
}

const sha256Pattern = /^[0-9a-f]{64}$/u
const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const textPresent = (value: unknown): value is string => typeof value === 'string' && /\S/u.test(value)
const identity = (value: string): string => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase()

/** The row digest binds the current wording, context and scope in the identified edition. */
export function deviationApprovalSha256(decision: DeclinedDecision, editionIdentity: EditionIdentity): string {
  const { targetLandscapeId, sourceId, edition } = editionIdentity
  const { sourceGoalId, rowSha256, author, deviation } = decision
  const { categoryVersion, category, reason, evidence } = deviation
  return sourceMappingDigest({
    targetLandscapeId, sourceId, edition, sourceGoalId, rowSha256, author, categoryVersion, category, reason, evidence,
  })
}

function hasExactFields(value: unknown, fields: readonly string[]): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === fields.length && fields.every(field => Object.hasOwn(value, field))
}

function hasTextFields(value: unknown, fields: readonly string[]): boolean {
  return hasExactFields(value, fields) && fields.every(field => textPresent(value[field]))
}

function isEvidenceRef(value: unknown): value is EvidenceRef {
  return hasExactFields(value, ['path', 'sha256']) && textPresent(value.path)
    && typeof value.sha256 === 'string' && sha256Pattern.test(value.sha256)
}

function isOtherRow(value: unknown, sourceGoalId: string): boolean {
  return hasExactFields(value, ['sourceGoalId', 'rowSha256']) && textPresent(value.sourceGoalId)
    && value.sourceGoalId !== sourceGoalId && typeof value.rowSha256 === 'string' && sha256Pattern.test(value.rowSha256)
}

function hasCategoryEvidence(deviation: DeclinedDecision['deviation'], sourceGoalId: string): boolean {
  const location = (value: unknown): boolean => hasTextFields(value, ['locator', 'excerpt'])
  const route = (value: unknown): boolean => hasTextFields(value, ['route', 'finding'])
  switch (deviation.category) {
    case 'schoolOrTeacher': {
      const evidence = deviation.evidence
      return hasExactFields(evidence, ['addressedTo', 'subject', 'operator', 'heading', 'tableHeader', 'sourceLocation'])
        && (evidence.addressedTo === 'school' || evidence.addressedTo === 'teacher')
        && [evidence.subject, evidence.operator, evidence.heading, evidence.tableHeader].every(textPresent)
        && location(evidence.sourceLocation)
    }
    case 'duplicate': {
      const evidence = deviation.evidence
      return hasExactFields(evidence, ['duplicateOf', 'samePerformance', 'sameScope'])
        && isOtherRow(evidence.duplicateOf, sourceGoalId)
        && [evidence.samePerformance, evidence.sameScope].every(textPresent)
    }
    case 'replacedWithinEdition': {
      const evidence = deviation.evidence
      return hasExactFields(evidence, ['replacedBy', 'replacedLocation', 'replacementLocation', 'authorityLocation', 'effectivePeriod'])
        && isOtherRow(evidence.replacedBy, sourceGoalId) && textPresent(evidence.effectivePeriod)
        && [evidence.replacedLocation, evidence.replacementLocation, evidence.authorityLocation].every(location)
    }
    case 'infeasiblePracticalAssessment': {
      const evidence = deviation.evidence
      return hasExactFields(evidence, [
        'standingDecision', 'retainedPerformance', 'droppedPerformance', 'requiredPerformance', 'practicalObstacle',
        'consideredEvidenceRoutes', 'ownInvestigation',
      ]) && [evidence.requiredPerformance, evidence.practicalObstacle].every(textPresent)
        && Array.isArray(evidence.consideredEvidenceRoutes) && evidence.consideredEvidenceRoutes.length > 0
        && evidence.consideredEvidenceRoutes.every(route) && route(evidence.ownInvestigation)
    }
    case 'deliberateDidacticDeviation':
      return hasExactFields(deviation.evidence, ['standingDecision', 'retainedPerformance', 'droppedPerformance', 'learnerImpact'])
        && textPresent(deviation.evidence.learnerImpact)
    default:
      return false
  }
}

export function validateDeviation(
  decision: DeclinedDecision,
  editionIdentity: EditionIdentity,
  readEvidence: (path: string) => Buffer,
): void {
  const { sourceGoalId, rowSha256, author, reviewer, reviewedAt, deviation } = decision
  function reject(message: string): never {
    throw new Error(`Declined source row ${sourceGoalId}: ${message}`)
  }
  function readBoundEvidence(ref: EvidenceRef, label: string): Buffer {
    let bytes: Buffer
    try {
      bytes = readEvidence(ref.path)
    } catch {
      return reject(`cannot read ${label} at ${ref.path}`)
    }
    if (bytes.length === 0 || createHash('sha256').update(bytes).digest('hex') !== ref.sha256) {
      return reject(`${label} hash mismatch at ${ref.path}`)
    }
    return bytes
  }

  if (decision.decision !== 'declined' || !textPresent(sourceGoalId) || !sha256Pattern.test(rowSha256)
    || ![editionIdentity.targetLandscapeId, editionIdentity.sourceId, editionIdentity.edition].every(textPresent)) {
    reject('missing row or edition identity')
  }
  if (!textPresent(author) || !textPresent(reviewer) || identity(author) === identity(reviewer)) {
    reject('the reviewer must be independent of the author')
  }
  const reviewDate = datePattern.test(reviewedAt) ? new Date(`${reviewedAt}T00:00:00Z`) : undefined
  if (!reviewDate || Number.isNaN(reviewDate.valueOf()) || reviewDate.toISOString().slice(0, 10) !== reviewedAt) {
    reject('reviewedAt must be an ISO calendar date')
  }
  if (!hasExactFields(deviation, ['categoryVersion', 'category', 'reason', 'evidence', 'review'])
    || deviation.categoryVersion !== 1 || !textPresent(deviation.reason) || !isEvidenceRef(deviation.review)) {
    reject('expected a version 1 deviation with an individual reason and a hash-bound review')
  }
  if (!hasCategoryEvidence(deviation, sourceGoalId)) {
    reject(`invalid category evidence for ${deviation.category}`)
  }

  if (deviation.category === 'infeasiblePracticalAssessment' || deviation.category === 'deliberateDidacticDeviation') {
    const { standingDecision, retainedPerformance, droppedPerformance } = deviation.evidence
    if (!isEvidenceRef(standingDecision) || standingDecision.path === deviation.review.path
      || !textPresent(retainedPerformance) || !textPresent(droppedPerformance)
      || identity(retainedPerformance) === identity(droppedPerformance)) {
      reject('expected a separate standing decision and distinct retained and dropped performances')
    }
    readBoundEvidence(standingDecision, 'standing decision')
  }

  const approvalBytes = readBoundEvidence(deviation.review, 'approval')
  let approval: unknown
  try {
    approval = JSON.parse(approvalBytes.toString('utf8'))
  } catch {
    return reject('approval must be valid JSON')
  }
  if (!hasExactFields(approval, ['schemaVersion', 'decisionSha256', 'reviewer', 'reviewedAt', 'verdict'])
    || approval.schemaVersion !== 1 || approval.verdict !== 'approved'
    || approval.reviewer !== reviewer || approval.reviewedAt !== reviewedAt
    || approval.decisionSha256 !== deviationApprovalSha256(decision, editionIdentity)) {
    reject('approval must affirm this exact decision and record the named reviewer and review date')
  }
}
