import { createHash } from 'node:crypto'
import type { LearningGoal } from '../src/landscapeTypes'

export type GoalEvidenceReviewStatus = 'needs_human_review' | 'approved' | 'rejected'
export type GoalEvidenceReviewAuthority = 'ai_candidate' | 'human'

export interface GoalEvidenceProfile {
  archetype: 'concept' | 'procedure' | 'representation' | 'modeling' | 'proof' | 'experiment' | 'data'
  facets: Array<{ id: string; criterionDe: string; criterionEn: string }>
  coverageRequirements: {
    allOf: string[]
    anyOf: string[][]
    minimumIndependentChecks: number
    requireChangedCase: boolean
    requireCueFreeTransfer: boolean
  }
  variationAxes: Array<{ id: string; textDe: string; textEn: string }>
  misconceptions: Array<{
    id: string
    signalDe: string
    signalEn: string
    correctionEvidenceDe: string
    correctionEvidenceEn: string
  }>
  nonEvidence: Array<{ id: string; textDe: string; textEn: string }>
  outOfScope: Array<{ id: string; textDe: string; textEn: string }>
  contrastCaseBriefs: Array<{
    id: string
    purposeDe: string
    purposeEn: string
    strengthDe: string
    strengthEn: string
    whyAlternativesUnderperformDe: string
    whyAlternativesUnderperformEn: string
  }>
}

export interface GoalEvidenceReviewRecord {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  goalFingerprint: string
  reviewInputFingerprint: string
  profileFingerprint: string
  status: GoalEvidenceReviewStatus
  reviewAuthority: GoalEvidenceReviewAuthority
  reviewedAt: string
  reviewer: string
  reason: string
  evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5'
  maximumClaimScope: 'G0' | 'G1' | 'G2' | 'G3' | 'G4'
  reviewRunIds: string[]
  dissent: string[]
  profile: GoalEvidenceProfile
}

export function normalizeGoalEvidenceText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stableGoalEvidenceJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableGoalEvidenceJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableGoalEvidenceJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function sha256(value: string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

export function goalEvidenceSemanticPayload(
  goal: LearningGoal,
  ruleVersion: string,
  effectiveSemanticKind?: string,
) {
  const localizedGoal = goal as LearningGoal & { titleEn?: string; descriptionEn?: string }
  return {
    ruleVersion,
    goalId: goal.id,
    shortKey: normalizeGoalEvidenceText(goal.shortKey),
    title: normalizeGoalEvidenceText(goal.title),
    titleEn: normalizeGoalEvidenceText(localizedGoal.titleEn),
    description: normalizeGoalEvidenceText(goal.description),
    descriptionEn: normalizeGoalEvidenceText(localizedGoal.descriptionEn),
    semanticKind: normalizeGoalEvidenceText(effectiveSemanticKind ?? goal.semanticKind),
    semanticAtomic: goal.semanticAtomic ?? null,
    type: normalizeGoalEvidenceText(goal.type),
    nodeKind: normalizeGoalEvidenceText(goal.nodeKind),
    tags: [...(goal.tags ?? [])].map(normalizeGoalEvidenceText).sort(),
    dimensionTags: goal.dimensionTags,
  }
}

export function goalEvidenceReviewInputPayload(
  goal: LearningGoal,
  ruleVersion: string,
  resourceDigests: Readonly<Record<string, string>> = {},
  effectiveSemanticKind?: string,
) {
  const goalVisualizations = (goal.resourceLinks ?? [])
    .filter((link) => link.type === 'goal-visualization')
    .map((link) => ({
      role: normalizeGoalEvidenceText(link.role),
      url: normalizeGoalEvidenceText(link.url),
      altText: normalizeGoalEvidenceText(link.altText),
      reviewStatus: normalizeGoalEvidenceText(link.reviewStatus),
      digest: resourceDigests[link.url] ?? null,
    }))
    .sort((left, right) => stableGoalEvidenceJson(left).localeCompare(stableGoalEvidenceJson(right)))

  return {
    ruleVersion,
    goalFingerprint: fingerprintGoalForEvidence(goal, ruleVersion, effectiveSemanticKind),
    requires: [...(goal.requires ?? [])].sort(),
    contains: [...(goal.contains ?? [])].sort(),
    examples: [...(goal.examples ?? [])].map(normalizeGoalEvidenceText).sort(),
    goalVisualizations,
  }
}

export function fingerprintGoalForEvidence(
  goal: LearningGoal,
  ruleVersion: string,
  effectiveSemanticKind?: string,
): string {
  return sha256(stableGoalEvidenceJson(
    goalEvidenceSemanticPayload(goal, ruleVersion, effectiveSemanticKind),
  ))
}

export function fingerprintGoalEvidenceReviewInput(
  goal: LearningGoal,
  ruleVersion: string,
  resourceDigests: Readonly<Record<string, string>> = {},
  effectiveSemanticKind?: string,
): string {
  return sha256(stableGoalEvidenceJson(
    goalEvidenceReviewInputPayload(goal, ruleVersion, resourceDigests, effectiveSemanticKind),
  ))
}

export function fingerprintGoalEvidenceProfile(profile: GoalEvidenceProfile, ruleVersion: string): string {
  return sha256(stableGoalEvidenceJson({ ruleVersion, profile }))
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

export function validateGoalEvidenceRecordSemantics(
  record: GoalEvidenceReviewRecord,
  goal: LearningGoal | undefined,
  resourceDigests: Readonly<Record<string, string>> = {},
  effectiveSemanticKind?: string,
): string[] {
  const errors: string[] = []
  if (!goal) return [`${record.goalId}: goal does not exist in the configured landscape`]
  if (record.goalId !== goal.id) errors.push(`${record.goalId}: record goalId does not match the goal`)

  const expectedGoalFingerprint = fingerprintGoalForEvidence(
    goal,
    record.ruleVersion,
    effectiveSemanticKind,
  )
  if (record.goalFingerprint !== expectedGoalFingerprint) {
    errors.push(`${record.goalId}: stale goalFingerprint; expected ${expectedGoalFingerprint}`)
  }

  const expectedReviewInputFingerprint = fingerprintGoalEvidenceReviewInput(
    goal,
    record.ruleVersion,
    resourceDigests,
    effectiveSemanticKind,
  )
  if (record.reviewInputFingerprint !== expectedReviewInputFingerprint) {
    errors.push(`${record.goalId}: stale reviewInputFingerprint; expected ${expectedReviewInputFingerprint}`)
  }

  const expectedProfileFingerprint = fingerprintGoalEvidenceProfile(record.profile, record.ruleVersion)
  if (record.profileFingerprint !== expectedProfileFingerprint) {
    errors.push(`${record.goalId}: profileFingerprint does not match the profile; expected ${expectedProfileFingerprint}`)
  }

  if (record.status === 'approved' && record.reviewAuthority !== 'human') {
    errors.push(`${record.goalId}: approved profiles require human reviewAuthority`)
  }

  const profileCollections: Array<[string, Array<{ id: string }>]> = [
    ['facets', record.profile.facets],
    ['variationAxes', record.profile.variationAxes],
    ['misconceptions', record.profile.misconceptions],
    ['nonEvidence', record.profile.nonEvidence],
    ['outOfScope', record.profile.outOfScope],
    ['contrastCaseBriefs', record.profile.contrastCaseBriefs],
  ]
  for (const [name, items] of profileCollections) {
    for (const duplicate of duplicateIds(items)) errors.push(`${record.goalId}: duplicate ${name} id ${duplicate}`)
  }

  const facetIds = new Set(record.profile.facets.map((facet) => facet.id))
  const coverageRefs = [
    ...record.profile.coverageRequirements.allOf,
    ...record.profile.coverageRequirements.anyOf.flat(),
  ]
  for (const facetId of coverageRefs) {
    if (!facetIds.has(facetId)) errors.push(`${record.goalId}: coverage references unknown facet ${facetId}`)
  }

  const anyOfKeys = new Set<string>()
  for (const group of record.profile.coverageRequirements.anyOf) {
    const key = [...group].sort().join('|')
    if (anyOfKeys.has(key)) errors.push(`${record.goalId}: duplicate anyOf coverage group ${key}`)
    anyOfKeys.add(key)
  }

  return errors
}
