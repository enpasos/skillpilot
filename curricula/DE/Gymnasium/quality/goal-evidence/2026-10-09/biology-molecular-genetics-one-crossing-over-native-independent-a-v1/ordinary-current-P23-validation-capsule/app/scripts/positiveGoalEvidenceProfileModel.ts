import { createHash } from 'node:crypto'
import type { LearningGoal } from '../src/landscapeTypes'
import {
  fingerprintGoalForEvidence,
  goalEvidenceReviewInputPayload,
  stableGoalEvidenceJson,
} from './goalEvidenceProfileModel'

export const POSITIVE_GOAL_EVIDENCE_SCHEMA_URL =
  'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json' as const
export const POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION = 2 as const
export const POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION = 'goal-evidence-v1' as const
export const POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION = 'positive-understanding-evidence-v2' as const

export type PositiveGoalEvidenceReviewStatus = 'needs_human_review' | 'approved' | 'rejected'
export type PositiveGoalEvidenceReviewAuthority = 'ai_candidate' | 'human'

export interface PositiveGoalEvidenceProfile {
  archetype: 'concept' | 'procedure' | 'representation' | 'modeling' | 'proof' | 'experiment' | 'data'
  expectations: Array<{
    id: string
    essentialUnderstandingDe: string
    essentialUnderstandingEn: string
    observablePerformanceDe: string
    observablePerformanceEn: string
  }>
  coverageExpectations: {
    requiredExpectationIds: string[]
    alternativeExpectationGroups: string[][]
    minimumIndependentDemonstrations: number
    freshVariationRequired: true
    independentTransferRequired: true
  }
  variationAxes: Array<{ id: string; textDe: string; textEn: string }>
  applicationCaseBriefs: Array<{
    id: string
    taskDemandDe: string
    taskDemandEn: string
    expectedPerformanceDe: string
    expectedPerformanceEn: string
    understandingFocusDe: string
    understandingFocusEn: string
  }>
}

export interface PositiveGoalEvidenceReviewRecord {
  $schema: typeof POSITIVE_GOAL_EVIDENCE_SCHEMA_URL
  schemaVersion: typeof POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION
  reviewId: string
  goalFingerprintRuleVersion: typeof POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION
  profileRuleVersion: typeof POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION
  reviewCriteriaFingerprint: string
  landscapeId: string
  goalId: string
  goalFingerprint: string
  reviewInputFingerprint: string
  profileFingerprint: string
  status: PositiveGoalEvidenceReviewStatus
  reviewAuthority: PositiveGoalEvidenceReviewAuthority
  reviewedAt: string
  reviewer: string
  reason: string
  evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5'
  maximumClaimScope: 'G0' | 'G1' | 'G2' | 'G3' | 'G4'
  reviewRunIds: string[]
  dissent: string[]
  profile: PositiveGoalEvidenceProfile
}

const sha256 = (value: string): string => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

export function fingerprintGoalForPositiveEvidence(
  goal: LearningGoal,
  effectiveSemanticKind?: string,
): string {
  return fingerprintGoalForEvidence(
    goal,
    POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
    effectiveSemanticKind,
  )
}

export function positiveGoalEvidenceReviewInputPayload(
  goal: LearningGoal,
  reviewCriteriaFingerprint: string,
  resourceDigests: Readonly<Record<string, string>> = {},
  effectiveSemanticKind?: string,
) {
  return {
    profileSchemaVersion: POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
    profileRuleVersion: POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
    reviewCriteriaFingerprint,
    goalInput: goalEvidenceReviewInputPayload(
      goal,
      POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
      resourceDigests,
      effectiveSemanticKind,
    ),
  }
}

export function fingerprintPositiveGoalEvidenceReviewInput(
  goal: LearningGoal,
  reviewCriteriaFingerprint: string,
  resourceDigests: Readonly<Record<string, string>> = {},
  effectiveSemanticKind?: string,
): string {
  return sha256(stableGoalEvidenceJson(positiveGoalEvidenceReviewInputPayload(
    goal,
    reviewCriteriaFingerprint,
    resourceDigests,
    effectiveSemanticKind,
  )))
}

export function fingerprintPositiveGoalEvidenceProfile(
  profile: PositiveGoalEvidenceProfile,
): string {
  return sha256(stableGoalEvidenceJson({
    profileSchemaVersion: POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
    profileRuleVersion: POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
    profile,
  }))
}

function duplicateIds(items: Array<{ id: string }>): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) duplicates.add(item.id)
    seen.add(item.id)
  }
  return [...duplicates].sort()
}

export function validatePositiveGoalEvidenceRecordSemantics(
  record: PositiveGoalEvidenceReviewRecord,
  goal: LearningGoal | undefined,
  resourceDigests: Readonly<Record<string, string>> = {},
  effectiveSemanticKind?: string,
): string[] {
  const errors: string[] = []
  if (!goal) return [`${record.goalId}: goal does not exist in the configured landscape`]
  if (record.goalId !== goal.id) errors.push(`${record.goalId}: record goalId does not match the goal`)
  if (record.goalFingerprintRuleVersion !== POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION) {
    errors.push(`${record.goalId}: unsupported goalFingerprintRuleVersion`)
  }
  if (record.profileRuleVersion !== POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION) {
    errors.push(`${record.goalId}: unsupported profileRuleVersion`)
  }

  const expectedGoalFingerprint = fingerprintGoalForPositiveEvidence(goal, effectiveSemanticKind)
  if (record.goalFingerprint !== expectedGoalFingerprint) {
    errors.push(`${record.goalId}: stale goalFingerprint; expected ${expectedGoalFingerprint}`)
  }

  const expectedReviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(
    goal,
    record.reviewCriteriaFingerprint,
    resourceDigests,
    effectiveSemanticKind,
  )
  if (record.reviewInputFingerprint !== expectedReviewInputFingerprint) {
    errors.push(`${record.goalId}: stale reviewInputFingerprint; expected ${expectedReviewInputFingerprint}`)
  }

  const expectedProfileFingerprint = fingerprintPositiveGoalEvidenceProfile(record.profile)
  if (record.profileFingerprint !== expectedProfileFingerprint) {
    errors.push(`${record.goalId}: profileFingerprint does not match the profile; expected ${expectedProfileFingerprint}`)
  }

  if (record.status === 'approved' && record.reviewAuthority !== 'human') {
    errors.push(`${record.goalId}: approved profiles require human reviewAuthority`)
  }
  if (record.reviewAuthority === 'ai_candidate' && record.status !== 'needs_human_review') {
    errors.push(`${record.goalId}: AI candidates require needs_human_review status`)
  }

  const minimumIndependentDemonstrations = record.profile.coverageExpectations
    .minimumIndependentDemonstrations
  if (
    !Number.isInteger(minimumIndependentDemonstrations)
    || minimumIndependentDemonstrations < 2
    || minimumIndependentDemonstrations > 8
  ) {
    errors.push(`${record.goalId}: minimumIndependentDemonstrations must be an integer from 2 to 8`)
  }
  if (record.profile.applicationCaseBriefs.length < 2 || record.profile.applicationCaseBriefs.length > 8) {
    errors.push(`${record.goalId}: applicationCaseBriefs must contain from 2 to 8 fresh application cases`)
  }

  const profileCollections: Array<[string, Array<{ id: string }>]> = [
    ['expectations', record.profile.expectations],
    ['variationAxes', record.profile.variationAxes],
    ['applicationCaseBriefs', record.profile.applicationCaseBriefs],
  ]
  for (const [name, items] of profileCollections) {
    for (const duplicate of duplicateIds(items)) {
      errors.push(`${record.goalId}: duplicate ${name} id ${duplicate}`)
    }
  }

  const expectationIds = new Set(record.profile.expectations.map((expectation) => expectation.id))
  const coverageReferences = [
    ...record.profile.coverageExpectations.requiredExpectationIds,
    ...record.profile.coverageExpectations.alternativeExpectationGroups.flat(),
  ]
  for (const expectationId of coverageReferences) {
    if (!expectationIds.has(expectationId)) {
      errors.push(`${record.goalId}: coverage references unknown expectation ${expectationId}`)
    }
  }

  const alternativeGroupKeys = new Set<string>()
  for (const group of record.profile.coverageExpectations.alternativeExpectationGroups) {
    const key = [...group].sort().join('|')
    if (alternativeGroupKeys.has(key)) {
      errors.push(`${record.goalId}: duplicate alternative expectation group ${key}`)
    }
    alternativeGroupKeys.add(key)
  }

  return errors
}
