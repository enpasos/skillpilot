import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { LearningGoal } from '../src/landscapeTypes'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import {
  type GoalEvidenceProfile,
  type GoalEvidenceReviewRecord,
  fingerprintGoalEvidenceProfile,
  fingerprintGoalEvidenceReviewInput,
  fingerprintGoalForEvidence,
} from './goalEvidenceProfileModel'
import {
  type PositiveGoalEvidenceReviewRecord,
  fingerprintPositiveGoalEvidenceProfile,
} from './positiveGoalEvidenceProfileModel'
import {
  parseGoalBookEvidenceReviewRecord,
  validateGoalBookEvidenceReviewRecordSemantics,
} from './goalBookEvidenceReviewLoader'

const readRepositoryJson = (path: string) => JSON.parse(readFileSync(
  fileURLToPath(new URL(`../../${path}`, import.meta.url)),
  'utf8',
))

// Read-only smoke test against a configured current Economics record. Neither
// historical evidence nor live goal/profile bindings are rewritten by a test.
const config = readRepositoryJson('app/scripts/config/goal-books/de-gym-economics-current-canonical.json') as {
  landscapePath: string
  semanticKindLedgerPath: string
  goalVisualizationQaPath: string
  evidenceReviewPaths: string[]
}
const text = readFileSync(fileURLToPath(new URL(
  `../../${config.evidenceReviewPaths[0]}`,
  import.meta.url,
)), 'utf8')
const rawV2 = JSON.parse(text.split(/\r?\n/u).find((line) => line.trim() !== '')!) as PositiveGoalEvidenceReviewRecord
const currentLandscape = normalizeCanonicalLandscape(readRepositoryJson(config.landscapePath))
const currentGoal = currentLandscape.goals.find(({ id }) => id === rawV2.goalId)
assert.ok(currentGoal)
const ledger = readRepositoryJson(config.semanticKindLedgerPath) as {
  decisions: Array<{ goalId: string; semanticKind: string }>
}
const semanticKind = ledger.decisions.find(({ goalId }) => goalId === rawV2.goalId)?.semanticKind
assert.equal(semanticKind, 'curricularAtomic')
const qa = readRepositoryJson(config.goalVisualizationQaPath) as {
  records: Array<{ goalId: string; imageUrl: string; assetSha256: string }>
}
const qaRecord = qa.records.find(({ goalId }) => goalId === rawV2.goalId)
const digests: Record<string, string> = qaRecord
  ? { [qaRecord.imageUrl]: qaRecord.assetSha256 }
  : {}
const goal = currentGoal as unknown as LearningGoal
const parsedV2 = parseGoalBookEvidenceReviewRecord(rawV2, 'current Economics V2')
assert.equal(parsedV2, rawV2, 'The loader must validate the original record without converting or mutating it.')
assert.equal(parsedV2.schemaVersion, 2)
assert.equal(parsedV2.status, 'needs_human_review')
assert.equal(parsedV2.reviewAuthority, 'ai_candidate')
assert.equal(parsedV2.evidenceLevel, 'E1')
assert.equal(parsedV2.maximumClaimScope, 'G1')
assert.deepEqual(validateGoalBookEvidenceReviewRecordSemantics(parsedV2, goal, digests, semanticKind), [])

// V1 remains its own closed contract. This synthetic fixture exercises loader
// compatibility only and is never written as curriculum review evidence.
const v1Goal: LearningGoal = {
  id: 'economics-loader-test-profit',
  title: 'Gewinn im Unternehmensmodell deuten',
  description: 'Die lernende Person kann Erlös und Kosten auf den Gewinn beziehen.',
  dimensionTags: {
    framework: 'synthetic-economics-loader-test', demandLevel: 'AB2',
    processCompetencies: [], guidingIdeas: [], phase: 'test',
  },
  weight: 1, type: 'atomic', semanticAtomic: true, requires: [], contains: [],
}
const profile: GoalEvidenceProfile = {
  archetype: 'modeling',
  facets: [
    { id: 'relation', criterionDe: 'Gewinn auf Erlös und Kosten beziehen.', criterionEn: 'Relate profit to revenue and costs.' },
    { id: 'interpretation', criterionDe: 'Die Differenz im Fall deuten.', criterionEn: 'Interpret the difference in context.' },
  ],
  coverageRequirements: {
    allOf: ['relation', 'interpretation'], anyOf: [], minimumIndependentChecks: 2,
    requireChangedCase: true, requireCueFreeTransfer: true,
  },
  variationAxes: [{ id: 'cost-change', textDe: 'Andere Kostenstruktur.', textEn: 'Different cost structure.' }],
  misconceptions: [{
    id: 'revenue-is-profit', signalDe: 'Erlös mit Gewinn gleichsetzen.', signalEn: 'Equate revenue with profit.',
    correctionEvidenceDe: 'Kosten in die Begründung einbeziehen.', correctionEvidenceEn: 'Include costs in the justification.',
  }],
  nonEvidence: [{ id: 'label', textDe: 'Nur das Wort Gewinn nennen.', textEn: 'Only name the word profit.' }],
  outOfScope: [],
  contrastCaseBriefs: ['higher-fixed-costs', 'lower-unit-costs'].map((id) => ({
    id, purposeDe: 'Die geänderte Gewinnlage untersuchen.', purposeEn: 'Examine the changed profit position.',
    strengthDe: 'Der Fall macht die Kostenwirkung sichtbar.', strengthEn: 'The case reveals the effect of costs.',
    whyAlternativesUnderperformDe: 'Nur Erlöse zu vergleichen erfasst die Kostenwirkung nicht.',
    whyAlternativesUnderperformEn: 'Comparing only revenues misses the effect of costs.',
  })),
}
const v1: GoalEvidenceReviewRecord = {
  schemaVersion: 1, reviewId: 'synthetic-economics-loader-v1', ruleVersion: 'goal-evidence-v1',
  landscapeId: 'synthetic-economics-loader-test', goalId: v1Goal.id,
  goalFingerprint: fingerprintGoalForEvidence(v1Goal, 'goal-evidence-v1', 'curricularAtomic'),
  reviewInputFingerprint: fingerprintGoalEvidenceReviewInput(v1Goal, 'goal-evidence-v1', {}, 'curricularAtomic'),
  profileFingerprint: fingerprintGoalEvidenceProfile(profile, 'goal-evidence-v1'),
  status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt: '2026-10-08T00:00:00Z',
  reviewer: 'synthetic-loader-test', reason: 'Technical V1 compatibility fixture; no curriculum approval.',
  evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [], dissent: [], profile,
}
const parsedV1 = parseGoalBookEvidenceReviewRecord(v1, 'synthetic V1')
assert.equal(parsedV1, v1)
assert.deepEqual(validateGoalBookEvidenceReviewRecordSemantics(parsedV1, v1Goal, {}, 'curricularAtomic'), [])
assert.throws(() => parseGoalBookEvidenceReviewRecord({ ...v1, unexpected: true }, 'V1 extra'), /closed goal-evidence schema/u)
assert.throws(() => parseGoalBookEvidenceReviewRecord({ ...v1, ruleVersion: 'unsupported' }, 'V1 rule'), /ruleVersion must be goal-evidence-v1/u)

for (const [label, malformed] of [
  ['misdeclared V1', { ...rawV2, schemaVersion: 1 }],
  ['unsupported version', { ...rawV2, schemaVersion: 3 }],
  ['wrong V2 schema', { ...rawV2, $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-profile.schema.json' }],
  ['missing V2 schema', { ...rawV2, $schema: undefined }],
  ['V2 extra', { ...rawV2, unexpected: true }],
  ['V2 missing coverage', { ...rawV2, profile: { ...rawV2.profile, coverageExpectations: undefined } }],
  ['V2 AI approval', { ...rawV2, status: 'approved' }],
  ['V2 wrong profile rule', { ...rawV2, profileRuleVersion: 'goal-evidence-v1' }],
] as const) {
  assert.throws(() => parseGoalBookEvidenceReviewRecord(malformed, label), /closed goal-evidence schema/u)
}

const errorsFor = (record: PositiveGoalEvidenceReviewRecord, changedGoal = goal, changedDigests = digests, kind = semanticKind) => (
  validateGoalBookEvidenceReviewRecordSemantics(parseGoalBookEvidenceReviewRecord(record, 'semantic test'), changedGoal, changedDigests, kind).join('\n')
)
assert.match(errorsFor(rawV2, { ...goal, description: `${goal.description} Changed test-only text.` }), /stale goalFingerprint/u)
assert.match(errorsFor(rawV2, { ...goal, requires: [...(goal.requires ?? []), 'fresh-test-only-prerequisite'] }), /stale reviewInputFingerprint/u)
assert.match(errorsFor(rawV2, goal, digests, 'orientation'), /stale goalFingerprint/u)
assert.ok(qaRecord?.imageUrl, 'Current V2 smoke input must exercise an actual QA resource binding.')
assert.match(errorsFor(rawV2, goal, { ...digests, [qaRecord.imageUrl]: `sha256:${'f'.repeat(64)}` }), /stale reviewInputFingerprint/u)
const badCoverage = structuredClone(rawV2)
badCoverage.profile.coverageExpectations.requiredExpectationIds.push('unbound-test-expectation')
badCoverage.profileFingerprint = fingerprintPositiveGoalEvidenceProfile(badCoverage.profile)
assert.match(errorsFor(badCoverage), /coverage references unknown expectation/u)
assert.match(errorsFor({ ...rawV2, profileFingerprint: `sha256:${'f'.repeat(64)}` }), /profileFingerprint does not match/u)
assert.match(validateGoalBookEvidenceReviewRecordSemantics(parsedV2, undefined, digests, semanticKind).join('\n'), /goal does not exist/u)

console.log('Goal-book evidence loader tests passed (current Economics V2, closed V1, schema failures, goal/resource/semantic-kind/profile bindings, and AI authority).')
