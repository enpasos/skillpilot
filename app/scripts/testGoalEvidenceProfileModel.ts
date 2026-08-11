import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal } from '../src/landscapeTypes'
import {
  type GoalEvidenceProfile,
  type GoalEvidenceReviewRecord,
  fingerprintGoalEvidenceProfile,
  fingerprintGoalEvidenceReviewInput,
  fingerprintGoalForEvidence,
  validateGoalEvidenceRecordSemantics,
} from './goalEvidenceProfileModel'

const goal: LearningGoal = {
  id: 'goal-a',
  title: 'Darstellung wählen',
  description: 'Die lernende Person kann eine Darstellung wählen und begründen.',
  weight: 1,
  dimensionTags: {
    framework: 'test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'E',
  },
  requires: ['goal-prerequisite'],
  contains: [],
  semanticAtomic: true,
  type: 'atomic',
}

const profile: GoalEvidenceProfile = {
  archetype: 'representation',
  facets: [
    { id: 'purpose', criterionDe: 'Erkennt den Zweck.', criterionEn: 'Identifies the purpose.' },
    { id: 'comparison', criterionDe: 'Vergleicht Alternativen.', criterionEn: 'Compares alternatives.' },
  ],
  coverageRequirements: {
    allOf: ['purpose'],
    anyOf: [['purpose', 'comparison']],
    minimumIndependentChecks: 2,
    requireChangedCase: true,
    requireCueFreeTransfer: true,
  },
  variationAxes: [{ id: 'question', textDe: 'Fragestellung', textEn: 'Question' }],
  misconceptions: [{
    id: 'always-graph',
    signalDe: 'Wählt immer den Graphen.',
    signalEn: 'Always chooses the graph.',
    correctionEvidenceDe: 'Begründet einen Gegenfall.',
    correctionEvidenceEn: 'Justifies a counter-case.',
  }],
  nonEvidence: [{ id: 'single-word', textDe: 'Ein einzelnes Schlagwort.', textEn: 'A single keyword.' }],
  outOfScope: [],
  contrastCaseBriefs: [
    {
      id: 'table-case',
      purposeDe: 'Exakte Einzelwerte',
      purposeEn: 'Exact individual values',
      strengthDe: 'Direkt ablesbar',
      strengthEn: 'Directly readable',
      whyAlternativesUnderperformDe: 'Andere Formen sind indirekter.',
      whyAlternativesUnderperformEn: 'Other forms are less direct.',
    },
    {
      id: 'graph-case',
      purposeDe: 'Verlauf',
      purposeEn: 'Trend',
      strengthDe: 'Muster sichtbar',
      strengthEn: 'Patterns are visible',
      whyAlternativesUnderperformDe: 'Andere Formen zeigen den Verlauf schlechter.',
      whyAlternativesUnderperformEn: 'Other forms show the trend less clearly.',
    },
  ],
}

const ruleVersion = 'goal-evidence-v1'
const effectiveSemanticKind = 'curricularAtomic'
const record: GoalEvidenceReviewRecord = {
  schemaVersion: 1,
  reviewId: 'pilot',
  ruleVersion,
  landscapeId: 'landscape',
  goalId: goal.id,
  goalFingerprint: fingerprintGoalForEvidence(goal, ruleVersion, effectiveSemanticKind),
  reviewInputFingerprint: fingerprintGoalEvidenceReviewInput(
    goal,
    ruleVersion,
    {},
    effectiveSemanticKind,
  ),
  profileFingerprint: fingerprintGoalEvidenceProfile(profile, ruleVersion),
  status: 'needs_human_review',
  reviewAuthority: 'ai_candidate',
  reviewedAt: '2026-08-10T00:00:00.000Z',
  reviewer: 'test-candidate',
  reason: 'Test candidate.',
  evidenceLevel: 'E1',
  maximumClaimScope: 'G1',
  reviewRunIds: [],
  dissent: [],
  profile,
}

assert.deepEqual(validateGoalEvidenceRecordSemantics(record, goal, {}, effectiveSemanticKind), [])

const staleGoal = { ...goal, description: `${goal.description} Geändert.` }
assert.match(
  validateGoalEvidenceRecordSemantics(record, staleGoal, {}, effectiveSemanticKind).join('\n'),
  /stale goalFingerprint/,
)

assert.match(
  validateGoalEvidenceRecordSemantics(record, goal, {}, 'orientation').join('\n'),
  /stale goalFingerprint/,
)

const badProfileRecord = {
  ...record,
  profile: {
    ...profile,
    coverageRequirements: { ...profile.coverageRequirements, allOf: ['missing'] },
  },
} satisfies GoalEvidenceReviewRecord
assert.match(
  validateGoalEvidenceRecordSemantics(badProfileRecord, goal, {}, effectiveSemanticKind).join('\n'),
  /profileFingerprint does not match/,
)
assert.match(
  validateGoalEvidenceRecordSemantics(badProfileRecord, goal, {}, effectiveSemanticKind).join('\n'),
  /unknown facet missing/,
)

const invalidApproval = { ...record, status: 'approved' as const }
assert.match(
  validateGoalEvidenceRecordSemantics(invalidApproval, goal, {}, effectiveSemanticKind).join('\n'),
  /require human reviewAuthority/,
)

const duplicateFacetProfile = {
  ...profile,
  facets: [...profile.facets, profile.facets[0]],
}
const duplicateFacetRecord = {
  ...record,
  profile: duplicateFacetProfile,
  profileFingerprint: fingerprintGoalEvidenceProfile(duplicateFacetProfile, ruleVersion),
}
assert.match(
  validateGoalEvidenceRecordSemantics(duplicateFacetRecord, goal, {}, effectiveSemanticKind).join('\n'),
  /duplicate facets id purpose/,
)

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const pilotRecord = JSON.parse(readFileSync(resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-representation-choice-pilot.review.jsonl',
), 'utf8').trim()) as GoalEvidenceReviewRecord
assert.equal(pilotRecord.goalId, '8dd9f210-2683-5902-acab-e3be22725232')
assert.equal(pilotRecord.status, 'needs_human_review')
assert.equal(pilotRecord.reviewAuthority, 'ai_candidate')
assert.equal(pilotRecord.profile.coverageRequirements.requireCueFreeTransfer, true)
assert.ok(pilotRecord.profile.coverageRequirements.minimumIndependentChecks >= 3)
assert.deepEqual(
  pilotRecord.profile.contrastCaseBriefs.map(({ id }) => id),
  ['table-best', 'graph-best', 'expression-best', 'sketch-best'],
)
assert.ok(pilotRecord.profile.misconceptions.some(({ id }) => id === 'always-choose-graph'))
assert.ok(pilotRecord.profile.nonEvidence.some(({ id }) => id === 'single-word-choice'))
assert.ok(pilotRecord.profile.nonEvidence.some(({ id }) => id === 'echo-visual-cue'))

console.log('Goal evidence profile model tests passed.')
