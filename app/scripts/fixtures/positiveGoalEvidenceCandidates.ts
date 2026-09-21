import type { LearningGoal } from '../../src/landscapeTypes'
import type {
  PositiveGoalEvidenceProfile,
  PositiveGoalEvidenceReviewRecord,
} from '../positiveGoalEvidenceProfileModel'

// Synthetic, frozen inputs: historical curriculum reviews must not be refreshed
// merely to keep a materializer unit test in sync with live curriculum edits.
export const landscapeId = 'positive-evidence-materializer-test'
export const criteria = '# Materializer test criteria\n\nExplain and transfer the relationship.\n'
export const goals: LearningGoal[] = [
  {
    id: 'double',
    title: 'Eine Menge verdoppeln',
    description: 'Die lernende Person kann eine Menge verdoppeln und den Zusammenhang erklären.',
    dimensionTags: { framework: 'test', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'test' },
    weight: 1,
    requires: [],
    contains: [],
    type: 'atomic',
    semanticAtomic: true,
    resourceLinks: [{
      type: 'goal-visualization',
      title: 'Verdoppeln',
      role: 'primary',
      url: '/assets/goal-visualizations/materializer-test/double.png',
      altText: 'Zwei gleich große Mengen.',
      reviewStatus: 'pilot',
    }],
  },
  {
    id: 'halve',
    title: 'Eine Menge halbieren',
    description: 'Die lernende Person kann eine Menge halbieren und den Zusammenhang erklären.',
    dimensionTags: { framework: 'test', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'test' },
    weight: 1,
    requires: ['double'],
    contains: [],
    type: 'atomic',
    semanticAtomic: true,
  },
]

const profile = (doubling: boolean): PositiveGoalEvidenceProfile => ({
  archetype: 'concept',
  expectations: [{
    id: 'relationship',
    essentialUnderstandingDe: doubling ? 'Verdoppeln ergibt zwei gleich große Mengen.' : 'Halbieren ergibt zwei gleich große Teile.',
    essentialUnderstandingEn: doubling ? 'Doubling gives two equal quantities.' : 'Halving gives two equal parts.',
    observablePerformanceDe: 'Die lernende Person berechnet die neue Menge und erklärt den Zusammenhang.',
    observablePerformanceEn: 'The learner calculates the new quantity and explains the relationship.',
  }],
  coverageExpectations: {
    requiredExpectationIds: ['relationship'],
    alternativeExpectationGroups: [],
    minimumIndependentDemonstrations: 2,
    freshVariationRequired: true,
    independentTransferRequired: true,
  },
  variationAxes: [{
    id: 'quantity',
    textDe: 'Andere Ausgangsmenge und anderer Kontext',
    textEn: 'Different starting quantity and context',
  }],
  applicationCaseBriefs: [
    {
      id: 'apples',
      taskDemandDe: doubling ? 'Verdopple sechs Äpfel und erkläre.' : 'Halbiere sechs Äpfel und erkläre.',
      taskDemandEn: doubling ? 'Double six apples and explain.' : 'Halve six apples and explain.',
      expectedPerformanceDe: doubling ? 'Zwölf Äpfel, weil 6 + 6 = 12.' : 'Drei Äpfel je Teil, weil 3 + 3 = 6.',
      expectedPerformanceEn: doubling ? 'Twelve apples, because 6 + 6 = 12.' : 'Three apples per part, because 3 + 3 = 6.',
      understandingFocusDe: 'Gleich große Mengen begründen die Rechnung.',
      understandingFocusEn: 'Equal quantities justify the calculation.',
    },
    {
      id: 'length',
      taskDemandDe: doubling ? 'Verdopple eine Länge von zehn Zentimetern und erkläre.' : 'Halbiere eine Länge von zehn Zentimetern und erkläre.',
      taskDemandEn: doubling ? 'Double a length of ten centimetres and explain.' : 'Halve a length of ten centimetres and explain.',
      expectedPerformanceDe: doubling ? 'Zwanzig Zentimeter, weil 10 + 10 = 20.' : 'Fünf Zentimeter je Teil, weil 5 + 5 = 10.',
      expectedPerformanceEn: doubling ? 'Twenty centimetres, because 10 + 10 = 20.' : 'Five centimetres per part, because 5 + 5 = 10.',
      understandingFocusDe: 'Der Zusammenhang gilt auch für Längen.',
      understandingFocusEn: 'The relationship also applies to lengths.',
    },
  ],
})

export const candidateSet = {
  schemaVersion: 1 as const,
  authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
  reviewId: 'positive-evidence-materializer-test',
  reviewedAt: '2026-08-25T00:00:00.000Z',
  reviewer: 'synthetic-test-candidate',
  goals: goals.map((goal, index) => ({
    goalId: goal.id,
    reason: `Synthetic materializer test for ${goal.id}; not curriculum review evidence.`,
    // The second candidate deliberately exercises the optional-field defaults.
    ...(index === 0 ? { evidenceLevel: 'E2' as const, maximumClaimScope: 'G2' as const, dissent: ['Test dissent.'] } : {}),
    profile: profile(index === 0),
  })),
}

// Golden bindings are literal expectations, not calculated by the code under test.
const fingerprints = [
  {
    goalFingerprint: 'sha256:c1d06da44202a7db5c9eb1deba88ef306cad6edf10a1667743ca309c4fef5863',
    reviewInputFingerprint: 'sha256:9e1ce5aaf78456e061f620a9235fb7ec99fb5bf898d15a631434f5bc96030130',
    profileFingerprint: 'sha256:543c0be051dec7c4c531120bff383ec0222dea4159522d7fa9f2d50bebb69689',
  },
  {
    goalFingerprint: 'sha256:d9a164522748b73759ee93e6db4e2c77c84f9cd9e5b3cc8c234158b94656fdd6',
    reviewInputFingerprint: 'sha256:eed963f4cfefce5b448310a39aaea839e4aaf42d6bcc125262eb2a49bd117a34',
    profileFingerprint: 'sha256:561ad2d46a7acc09651ec37a804421c67e150cf1078bcdee3cdd95b8cd118f39',
  },
]
export const expectedRecords: PositiveGoalEvidenceReviewRecord[] = candidateSet.goals.map((candidate, index) => ({
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',
  schemaVersion: 2,
  reviewId: candidateSet.reviewId,
  goalFingerprintRuleVersion: 'goal-evidence-v1',
  profileRuleVersion: 'positive-understanding-evidence-v2',
  reviewCriteriaFingerprint: 'sha256:f4c91dd696754efdc832961b5bd9b064b3034742f0c58f37ebd0e9603f473b6b',
  landscapeId,
  goalId: candidate.goalId,
  ...fingerprints[index],
  status: 'needs_human_review',
  reviewAuthority: 'ai_candidate',
  reviewedAt: candidateSet.reviewedAt,
  reviewer: candidateSet.reviewer,
  reason: candidate.reason,
  evidenceLevel: index === 0 ? 'E2' : 'E1',
  maximumClaimScope: index === 0 ? 'G2' : 'G1',
  reviewRunIds: [],
  dissent: index === 0 ? ['Test dissent.'] : [],
  profile: candidate.profile,
}))
