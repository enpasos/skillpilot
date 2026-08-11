import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { LearningGoal } from '../src/landscapeTypes'
import { fingerprintGoalForEvidence } from './goalEvidenceProfileModel'
import {
  type PositiveGoalEvidenceProfile,
  type PositiveGoalEvidenceReviewRecord,
  POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
  POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
  POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
} from './positiveGoalEvidenceProfileModel'

const schemaPath = fileURLToPath(new URL(
  '../../contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
  import.meta.url,
))
const schema = JSON.parse(await readFile(schemaPath, 'utf8')) as Record<string, unknown>
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validateSchema = ajv.compile(schema)

const goal: LearningGoal = {
  id: 'goal-a',
  title: 'Darstellung wählen',
  description: 'Die lernende Person kann eine Darstellung passend zur Fragestellung wählen und begründen.',
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
  resourceLinks: [
    {
      type: 'goal-visualization',
      title: 'Visualisierung: Darstellung wählen',
      url: '/assets/goal-visualizations/test/goal-a.jpg',
      role: 'primary',
      altText: 'Mehrere mathematische Darstellungen derselben Situation.',
      reviewStatus: 'pilot',
    },
  ],
}

const profile: PositiveGoalEvidenceProfile = {
  archetype: 'representation',
  expectations: [
    {
      id: 'identify-information-need',
      essentialUnderstandingDe: 'Die Fragestellung bestimmt, welche Information eine Darstellung zugänglich machen soll.',
      essentialUnderstandingEn: 'The question determines which information a representation should make accessible.',
      observablePerformanceDe: 'Die lernende Person benennt die benötigte Information und ordnet ihr eine passende Darstellung zu.',
      observablePerformanceEn: 'The learner names the required information and matches it to a suitable representation.',
    },
    {
      id: 'justify-selection',
      essentialUnderstandingDe: 'Tabelle, Graph, Term und Skizze unterstützen unterschiedliche mathematische Zwecke.',
      essentialUnderstandingEn: 'Tables, graphs, expressions, and sketches support different mathematical purposes.',
      observablePerformanceDe: 'Die lernende Person begründet ihre Wahl mit einem konkreten Auswahlkriterium und vergleicht eine passende Alternative.',
      observablePerformanceEn: 'The learner justifies the choice with a concrete selection criterion and compares a suitable alternative.',
    },
  ],
  coverageExpectations: {
    requiredExpectationIds: ['identify-information-need', 'justify-selection'],
    alternativeExpectationGroups: [],
    minimumIndependentDemonstrations: 2,
    freshVariationRequired: true,
    independentTransferRequired: true,
  },
  variationAxes: [
    {
      id: 'question-purpose',
      textDe: 'Exakter Einzelwert, Verlauf, allgemeiner Zusammenhang oder qualitative Übersicht',
      textEn: 'Exact value, trend, general relationship, or qualitative overview',
    },
  ],
  applicationCaseBriefs: [
    {
      id: 'exact-values',
      taskDemandDe: 'Wenige gegebene Messwerte sollen exakt verglichen werden.',
      taskDemandEn: 'A small number of supplied measurements must be compared exactly.',
      expectedPerformanceDe: 'Die lernende Person wählt eine Tabelle und begründet die direkte Verfügbarkeit der exakten Werte.',
      expectedPerformanceEn: 'The learner chooses a table and justifies the direct availability of the exact values.',
      understandingFocusDe: 'Die Wahl folgt dem Informationsbedarf der Fragestellung.',
      understandingFocusEn: 'The choice follows the information need of the question.',
    },
    {
      id: 'trend',
      taskDemandDe: 'Ein Verlauf und seine markanten Änderungen sollen erkannt werden.',
      taskDemandEn: 'A trend and its notable changes must be recognized.',
      expectedPerformanceDe: 'Die lernende Person wählt einen Graphen und erläutert, wie der Verlauf darin sichtbar wird.',
      expectedPerformanceEn: 'The learner chooses a graph and explains how it makes the trend visible.',
      understandingFocusDe: 'Die Darstellung unterstützt den qualitativen Vergleich des Verlaufs.',
      understandingFocusEn: 'The representation supports a qualitative comparison of the trend.',
    },
  ],
}

const reviewCriteriaFingerprint = `sha256:${'a'.repeat(64)}`
const effectiveSemanticKind = 'curricularAtomic'
const record: PositiveGoalEvidenceReviewRecord = {
  $schema: POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
  schemaVersion: 2,
  reviewId: 'positive-pilot',
  goalFingerprintRuleVersion: POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
  profileRuleVersion: POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
  reviewCriteriaFingerprint,
  landscapeId: 'landscape',
  goalId: goal.id,
  goalFingerprint: fingerprintGoalForPositiveEvidence(goal, effectiveSemanticKind),
  reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(
    goal,
    reviewCriteriaFingerprint,
    {},
    effectiveSemanticKind,
  ),
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(profile),
  status: 'needs_human_review',
  reviewAuthority: 'ai_candidate',
  reviewedAt: '2026-08-11T00:00:00.000Z',
  reviewer: 'test-candidate',
  reason: 'Positive, content-specific test candidate.',
  evidenceLevel: 'E1',
  maximumClaimScope: 'G1',
  reviewRunIds: [],
  dissent: [],
  profile,
}

assert.equal(validateSchema(record), true, JSON.stringify(validateSchema.errors))
assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(
  record,
  goal,
  {},
  effectiveSemanticKind,
), [])

assert.equal(
  record.goalFingerprint,
  fingerprintGoalForEvidence(
    goal,
    POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
    effectiveSemanticKind,
  ),
  'V2 must preserve the established goal-fingerprint rule.',
)

for (const forbiddenKey of [
  'misconceptions',
  'nonEvidence',
  'outOfScope',
  'contrastCaseBriefs',
  'requireCueFreeTransfer',
  'whyAlternativesUnderperformDe',
]) {
  const invalidRecord = structuredClone(record) as Record<string, unknown>
  const invalidProfile = invalidRecord.profile as Record<string, unknown>
  invalidProfile[forbiddenKey] = []
  assert.equal(validateSchema(invalidRecord), false, `${forbiddenKey} must remain outside V2.`)
}

const invalidNestedCoverage = structuredClone(record) as Record<string, unknown>
const invalidNestedCoverageProfile = invalidNestedCoverage.profile as Record<string, unknown>
const invalidNestedCoverageExpectations = invalidNestedCoverageProfile.coverageExpectations as Record<string, unknown>
invalidNestedCoverageExpectations.requireCueFreeTransfer = true
assert.equal(validateSchema(invalidNestedCoverage), false, 'Archived V1 coverage keys must remain outside V2.')

const invalidNestedApplication = structuredClone(record) as Record<string, unknown>
const invalidNestedApplicationProfile = invalidNestedApplication.profile as Record<string, unknown>
const invalidNestedApplicationCases = invalidNestedApplicationProfile.applicationCaseBriefs as Array<Record<string, unknown>>
invalidNestedApplicationCases[0].whyAlternativesUnderperformDe = 'Nicht Teil des positiven V2-Vertrags.'
assert.equal(validateSchema(invalidNestedApplication), false, 'Archived V1 application-case keys must remain outside V2.')

for (const invalidMinimum of [1, 2.5, 9]) {
  const invalidProfile = {
    ...profile,
    coverageExpectations: {
      ...profile.coverageExpectations,
      minimumIndependentDemonstrations: invalidMinimum,
    },
  }
  const invalidRecord = {
    ...record,
    profile: invalidProfile,
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(invalidProfile),
  }
  assert.equal(validateSchema(invalidRecord), false, `${invalidMinimum} demonstrations must fail schema validation.`)
  assert.match(
    validatePositiveGoalEvidenceRecordSemantics(
      invalidRecord,
      goal,
      {},
      effectiveSemanticKind,
    ).join('\n'),
    /minimumIndependentDemonstrations must be an integer from 2 to 8/,
  )
}

for (const validMinimum of [2, 8]) {
  const validProfile = {
    ...profile,
    coverageExpectations: {
      ...profile.coverageExpectations,
      minimumIndependentDemonstrations: validMinimum,
    },
  }
  const validRecord = {
    ...record,
    profile: validProfile,
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(validProfile),
  }
  assert.equal(validateSchema(validRecord), true, JSON.stringify(validateSchema.errors))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(
    validRecord,
    goal,
    {},
    effectiveSemanticKind,
  ), [])
}

const oneApplicationCaseProfile = {
  ...profile,
  applicationCaseBriefs: profile.applicationCaseBriefs.slice(0, 1),
}
const oneApplicationCaseRecord = {
  ...record,
  profile: oneApplicationCaseProfile,
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(oneApplicationCaseProfile),
}
assert.equal(validateSchema(oneApplicationCaseRecord), false)
assert.match(
  validatePositiveGoalEvidenceRecordSemantics(
    oneApplicationCaseRecord,
    goal,
    {},
    effectiveSemanticKind,
  ).join('\n'),
  /applicationCaseBriefs must contain from 2 to 8 fresh application cases/,
)

const staleGoal = { ...goal, description: `${goal.description} Präzisiert.` }
assert.match(
  validatePositiveGoalEvidenceRecordSemantics(
    record,
    staleGoal,
    {},
    effectiveSemanticKind,
  ).join('\n'),
  /stale goalFingerprint/,
)

const changedCriteriaRecord = {
  ...record,
  reviewCriteriaFingerprint: `sha256:${'b'.repeat(64)}`,
}
assert.match(
  validatePositiveGoalEvidenceRecordSemantics(
    changedCriteriaRecord,
    goal,
    {},
    effectiveSemanticKind,
  ).join('\n'),
  /stale reviewInputFingerprint/,
)

const changedResourceDigestRecord = {
  ...record,
  reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(
    goal,
    reviewCriteriaFingerprint,
    { '/assets/goal-visualizations/test/goal-a.jpg': `sha256:${'c'.repeat(64)}` },
    effectiveSemanticKind,
  ),
}
assert.match(
  validatePositiveGoalEvidenceRecordSemantics(
    changedResourceDigestRecord,
    goal,
    { '/assets/goal-visualizations/test/goal-a.jpg': `sha256:${'d'.repeat(64)}` },
    effectiveSemanticKind,
  ).join('\n'),
  /stale reviewInputFingerprint/,
)

const profileWithUnknownCoverage = {
  ...profile,
  coverageExpectations: {
    ...profile.coverageExpectations,
    requiredExpectationIds: ['unknown-expectation'],
  },
}
const recordWithUnknownCoverage = {
  ...record,
  profile: profileWithUnknownCoverage,
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(profileWithUnknownCoverage),
}
assert.match(
  validatePositiveGoalEvidenceRecordSemantics(
    recordWithUnknownCoverage,
    goal,
    {},
    effectiveSemanticKind,
  ).join('\n'),
  /coverage references unknown expectation unknown-expectation/,
)

const duplicateExpectationProfile = {
  ...profile,
  expectations: [...profile.expectations, profile.expectations[0]],
}
const duplicateExpectationRecord = {
  ...record,
  profile: duplicateExpectationProfile,
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(duplicateExpectationProfile),
}
assert.match(
  validatePositiveGoalEvidenceRecordSemantics(
    duplicateExpectationRecord,
    goal,
    {},
    effectiveSemanticKind,
  ).join('\n'),
  /duplicate expectations id identify-information-need/,
)

assert.equal(validateSchema({ ...record, status: 'approved' }), false)
assert.match(
  validatePositiveGoalEvidenceRecordSemantics(
    { ...record, status: 'approved' },
    goal,
    {},
    effectiveSemanticKind,
  ).join('\n'),
  /approved profiles require human reviewAuthority/,
)

console.log('Positive goal evidence profile V2 tests passed.')
