import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import type { LearningGoal } from '../src/landscapeTypes'
import { GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION } from './goalBookModel'
import { fingerprintGoalForEvidence } from './goalEvidenceProfileModel'
import {
  buildGoalDescriptionCanonicalContext,
  fingerprintGoalDescriptionReviewInput,
  type GoalDescriptionReviewInput,
} from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionDualRoundResolution,
  fingerprintGoalDescriptionReviewContext,
  fingerprintGoalDescriptionReviewPage,
  validateGoalDescriptionDualRoundResolutionBindings,
  type GoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolutionBindingArtifacts,
  type GoalDescriptionDualRoundResolutionRoundBinding,
} from './validateGoalDescriptionDualRoundResolution'
import type {
  GoalDescriptionDualRoundSummary,
  GoalDescriptionReviewRoundArtifacts,
} from './validateGoalDescriptionReviewDualRound'

const digest = (character: string) => `sha256:${character.repeat(64)}` as const
const sha256 = (value: Buffer) => (
  `sha256:${createHash('sha256').update(value).digest('hex')}` as const
)

const canonicalGoal = {
  id: 'goal-current-01',
  shortKey: 'CURRENT_01',
  phase: 'J8',
  title: 'Zusammenhang begründen',
  titleEn: 'Justify a relationship',
  description: 'Die lernende Person kann einen fachlichen Zusammenhang erklären, begründen und auf einen veränderten Fall übertragen.',
  descriptionEn: 'The learner can explain and justify a subject-specific relationship and transfer it to a changed case.',
  core: true,
  weight: 1,
  tags: ['fixture'],
  competencyRefs: ['PROCESS.EXPLAIN'],
  sourceRef: 'Fixture source, p. 1',
  dimensionTags: {
    framework: 'fixture-framework',
    demandLevel: 'AB2',
    processCompetencies: ['explain'],
    guidingIdeas: ['relationship'],
    phase: 'J8',
    area: 'Fixture area',
    topicCode: 'F1',
  },
  applicability: { jurisdiction: ['DE-HE'] },
  type: 'atomic',
  semanticAtomic: true,
  requires: [],
  contains: [],
  examples: ['fixture-example'],
}

const effectiveSemanticKind = 'curricularAtomic' as const
const goalFingerprint = fingerprintGoalForEvidence(
  canonicalGoal as unknown as LearningGoal,
  GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,
  effectiveSemanticKind,
)
const pageWithPlaceholderFingerprint = {
  pageNumber: 1,
  goalId: canonicalGoal.id,
  anchor: `goal-${canonicalGoal.id}`,
  title: canonicalGoal.title,
  description: canonicalGoal.description,
  breadcrumbs: ['Fixture'],
  chapterIds: ['fixture'],
  requires: [],
  reverseRequires: [],
  externalPrerequisites: [],
  externalReverseRequires: [],
  visualization: null,
  evidenceReview: null,
  goalFingerprint,
  pageFingerprint: digest('0'),
}
const page = {
  ...pageWithPlaceholderFingerprint,
  pageFingerprint: fingerprintGoalDescriptionReviewPage(pageWithPlaceholderFingerprint),
}
const inputGoal = {
  goalId: canonicalGoal.id,
  goalFingerprint,
  pageFingerprint: page.pageFingerprint,
  currentTitleDe: canonicalGoal.title,
  currentTitleEn: canonicalGoal.titleEn,
  currentDescriptionDe: canonicalGoal.description,
  currentDescriptionEn: canonicalGoal.descriptionEn,
  canonicalContext: buildGoalDescriptionCanonicalContext(canonicalGoal),
  reviewContext: { page, evidenceProfile: null },
}
const inputWithoutFingerprint = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v3/goal-description-review-input.schema.json' as const,
  schemaVersion: 3 as const,
  bundleFingerprint: digest('1'),
  bookDigest: digest('2'),
  goalCount: 1,
  goals: [inputGoal],
}
const currentInput: GoalDescriptionReviewInput = {
  ...inputWithoutFingerprint,
  reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(inputWithoutFingerprint),
}
const goalReviewContextFingerprint = fingerprintGoalDescriptionReviewContext(inputGoal)

const firstBinding: GoalDescriptionDualRoundResolutionRoundBinding = {
  campaignId: 'campaign-a',
  campaignDigest: digest('3'),
  roundId: 'round-a',
  independenceGroupId: 'blind-a',
  reviewInputFingerprint: digest('4'),
  goalReviewContextFingerprint,
  batchId: 'round-a.batch-001',
  runId: 'run-a',
  runManifestDigest: digest('5'),
  resultsDigest: digest('6'),
  recordId: 'record-a',
  recordDigest: digest('7'),
}
const secondBinding: GoalDescriptionDualRoundResolutionRoundBinding = {
  campaignId: 'campaign-b',
  campaignDigest: digest('8'),
  roundId: 'round-b',
  independenceGroupId: 'blind-b',
  reviewInputFingerprint: digest('4'),
  goalReviewContextFingerprint,
  batchId: 'round-b.batch-001',
  runId: 'run-b',
  runManifestDigest: digest('9'),
  resultsDigest: digest('a'),
  recordId: 'record-b',
  recordDigest: digest('b'),
}

const dualSummary: GoalDescriptionDualRoundSummary = {
  schemaVersion: 1,
  validationContract: 'goal-description-dual-round-v1',
  automaticAcceptance: false,
  bundleFingerprint: digest('c'),
  reviewInputFingerprint: digest('4'),
  goalCount: 1,
  rounds: {
    first: {
      campaignId: firstBinding.campaignId,
      roundId: firstBinding.roundId,
      independenceGroupId: firstBinding.independenceGroupId,
      runIds: [firstBinding.runId],
      providers: ['Provider A'],
      modelIdentities: ['Provider A::Model A::v1'],
    },
    second: {
      campaignId: secondBinding.campaignId,
      roundId: secondBinding.roundId,
      independenceGroupId: secondBinding.independenceGroupId,
      runIds: [secondBinding.runId],
      providers: ['Provider B'],
      modelIdentities: ['Provider B::Model B::v1'],
    },
  },
  diversity: {
    policy: 'report_only',
    sharedProviders: [],
    sharedModelIdentities: [],
    distinctProviderOrModel: true,
    policySatisfied: true,
  },
  counts: {
    exactAgreement: 0,
    disagreement: 1,
    unavailable: 0,
    requiresSynthesis: 1,
  },
  goals: [{
    goalId: canonicalGoal.id,
    firstRecordId: firstBinding.recordId,
    secondRecordId: secondBinding.recordId,
    firstRunId: firstBinding.runId,
    secondRunId: secondBinding.runId,
    firstDecision: 'keep',
    secondDecision: 'keep',
    agreement: 'disagreement',
    disagreementFields: ['rationale'],
    requiresSynthesis: true,
    automaticAcceptance: false,
  }],
}
const dualSummaryBytes = Buffer.from(`${JSON.stringify(dualSummary, null, 2)}\n`)

const resolutionWithoutFingerprint = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-dual-round-resolution.schema.json' as const,
  schemaVersion: 1 as const,
  resolutionId: 'resolution-goal-current-01',
  goal: {
    goalId: canonicalGoal.id,
    effectiveSemanticKind,
    goalFingerprint,
    pageFingerprint: page.pageFingerprint,
    goalReviewContextFingerprint,
    finalText: {
      titleDe: canonicalGoal.title,
      titleEn: canonicalGoal.titleEn,
      descriptionDe: canonicalGoal.description,
      descriptionEn: canonicalGoal.descriptionEn,
    },
  },
  rounds: { first: firstBinding, second: secondBinding },
  dualSummary: {
    validationContract: 'goal-description-dual-round-v1' as const,
    digest: sha256(dualSummaryBytes),
  },
  status: 'resolved' as const,
  decision: 'keep_current' as const,
  synthesis: {
    synthesisId: 'synthesis-goal-current-01',
    authority: 'ai_synthesis' as const,
    synthesizedBy: 'Fixture AI synthesizer',
    synthesizedAt: '2026-08-25T12:00:00.000Z',
    rationaleDe: 'Beide Prüfungen bestätigen den aktuellen Text; die Begründungsnuancen wurden zusammengeführt.',
    rationaleEn: 'Both reviews confirm the current text; their rationale nuances were synthesized.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die lernende Person versteht den fachlichen Zusammenhang und seine Bedingungen.',
      essentialUnderstandingEn: 'The learner understands the subject-specific relationship and its conditions.',
      observablePerformanceDe: 'Die lernende Person erklärt und begründet den Zusammenhang an einem konkreten Fall.',
      observablePerformanceEn: 'The learner explains and justifies the relationship in a concrete case.',
      transferExpectationDe: 'Die lernende Person überträgt den Zusammenhang auf einen veränderten Fall.',
      transferExpectationEn: 'The learner transfers the relationship to a changed case.',
    },
    dissent: [{
      dissentId: 'rationale-nuance',
      source: 'both' as const,
      textDe: 'Die Begründungen gewichten unterschiedliche, aber vereinbare Aspekte.',
      textEn: 'The rationales emphasize different but compatible aspects.',
      disposition: 'merged' as const,
    }],
    humanAttestation: null,
  },
}
const withFingerprint = (
  value: Omit<GoalDescriptionDualRoundResolution, 'resolutionFingerprint'>,
): GoalDescriptionDualRoundResolution => ({
  ...value,
  resolutionFingerprint: fingerprintGoalDescriptionDualRoundResolution(value),
})
const resolution = withFingerprint(resolutionWithoutFingerprint)

assert.deepEqual(
  buildGoalDescriptionDualRoundResolution({
    resolutionId: resolutionWithoutFingerprint.resolutionId,
    goalId: canonicalGoal.id,
    effectiveSemanticKind,
    decision: 'keep_current',
    synthesis: resolutionWithoutFingerprint.synthesis,
    dualSummaryBytes,
    currentInput,
    firstSource: { binding: firstBinding, decision: 'keep' },
    secondSource: { binding: secondBinding, decision: 'keep' },
  }),
  resolution,
)

const synthesisDecisionManifestBinding = {
  contract: 'goal-description-rollout-synthesis-decision-v1' as const,
  manifestPath: 'synthesis-decisions.json',
  manifestId: 'fixture-rollout-synthesis-manifest',
  manifestDigest: digest('d'),
  manifestFingerprint: digest('e'),
  decisionId: 'fixture-rollout-synthesis-decision',
}
const manifestBuiltResolution = buildGoalDescriptionDualRoundResolution({
  resolutionId: resolutionWithoutFingerprint.resolutionId,
  goalId: canonicalGoal.id,
  effectiveSemanticKind,
  decision: 'keep_current',
  synthesis: resolutionWithoutFingerprint.synthesis,
  dualSummaryBytes,
  currentInput,
  firstSource: { binding: firstBinding, decision: 'keep' },
  secondSource: { binding: secondBinding, decision: 'keep' },
  synthesisDecisionManifest: synthesisDecisionManifestBinding,
})
assert.deepEqual(
  manifestBuiltResolution,
  buildGoalDescriptionDualRoundResolution({
    resolutionId: resolutionWithoutFingerprint.resolutionId,
    goalId: canonicalGoal.id,
    effectiveSemanticKind,
    decision: 'keep_current',
    synthesis: resolutionWithoutFingerprint.synthesis,
    dualSummaryBytes,
    currentInput,
    firstSource: { binding: firstBinding, decision: 'keep' },
    secondSource: { binding: secondBinding, decision: 'keep' },
    synthesisDecisionManifest: synthesisDecisionManifestBinding,
  }),
  'The same synthesis-decision binding must generate byte-equivalent V1 resolution data.',
)
assert.deepEqual(manifestBuiltResolution.synthesisDecisionManifest, synthesisDecisionManifestBinding)

const baseArtifacts: GoalDescriptionDualRoundResolutionBindingArtifacts = {
  resolution,
  dualSummary,
  dualSummaryBytes,
  currentInput,
  canonicalGoal,
  firstSource: { binding: firstBinding, decision: 'keep' },
  secondSource: { binding: secondBinding, decision: 'keep' },
}

const valid = await validateGoalDescriptionDualRoundResolutionBindings(baseArtifacts)
assert.deepEqual(valid.errors, [])
assert.equal(valid.strictDescriptionComplete, true)

const exactRecordLine = `  ${JSON.stringify({
  recordId: 'record-byte-bound',
  goalId: canonicalGoal.id,
  decision: 'keep',
})}  `
const extractionArtifacts = {
  input: currentInput,
  campaign: {
    campaignId: 'campaign-byte-bound',
    roundId: 'round-byte-bound',
    independenceGroupId: 'blind-byte-bound',
  },
  resultPairs: [{
    batchId: 'round-byte-bound.batch-001',
    run: { runId: 'run-byte-bound', goalIds: [canonicalGoal.id] },
    recordsBytes: Buffer.from(`${exactRecordLine}\n`),
  }],
} as unknown as GoalDescriptionReviewRoundArtifacts
const extracted = extractGoalDescriptionDualRoundResolutionSource({
  artifacts: extractionArtifacts,
  goalId: canonicalGoal.id,
  label: 'Fixture',
})
assert.deepEqual(extracted.errors, [])
assert.equal(extracted.source?.binding.recordDigest, sha256(Buffer.from(exactRecordLine)))
assert.equal(extracted.source?.binding.resultsDigest, sha256(Buffer.from(`${exactRecordLine}\n`)))
const duplicateExtracted = extractGoalDescriptionDualRoundResolutionSource({
  artifacts: {
    ...extractionArtifacts,
    resultPairs: [
      ...extractionArtifacts.resultPairs,
      { ...extractionArtifacts.resultPairs[0], batchId: 'duplicate-batch' },
    ],
  },
  goalId: canonicalGoal.id,
  label: 'Fixture',
})
assert.match(duplicateExtracted.errors.join('\n'), /exactly one run/u)
const missingExtracted = extractGoalDescriptionDualRoundResolutionSource({
  artifacts: { ...extractionArtifacts, resultPairs: [] },
  goalId: canonicalGoal.id,
  label: 'Fixture',
})
assert.match(missingExtracted.errors.join('\n'), /exactly one run.*found 0/u)
const duplicateRecordExtracted = extractGoalDescriptionDualRoundResolutionSource({
  artifacts: {
    ...extractionArtifacts,
    resultPairs: [{
      ...extractionArtifacts.resultPairs[0],
      recordsBytes: Buffer.from(`${exactRecordLine}\n${exactRecordLine}\n`),
    }],
  },
  goalId: canonicalGoal.id,
  label: 'Fixture',
})
assert.match(duplicateRecordExtracted.errors.join('\n'), /exactly one record.*found 2/u)

const globallyDriftedInputWithoutFingerprint = {
  ...currentInput,
  bundleFingerprint: digest('d'),
  bookDigest: digest('e'),
}
const globallyDriftedInput: GoalDescriptionReviewInput = {
  ...globallyDriftedInputWithoutFingerprint,
  reviewInputFingerprint: fingerprintGoalDescriptionReviewInput({
    $schema: globallyDriftedInputWithoutFingerprint.$schema,
    schemaVersion: globallyDriftedInputWithoutFingerprint.schemaVersion,
    bundleFingerprint: globallyDriftedInputWithoutFingerprint.bundleFingerprint,
    bookDigest: globallyDriftedInputWithoutFingerprint.bookDigest,
    goalCount: globallyDriftedInputWithoutFingerprint.goalCount,
    goals: globallyDriftedInputWithoutFingerprint.goals,
  }),
}
const globalDrift = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  currentInput: globallyDriftedInput,
})
assert.deepEqual(globalDrift.errors, [])
assert.equal(globalDrift.strictDescriptionComplete, true)

const mutateResolution = (
  mutate: (draft: GoalDescriptionDualRoundResolution) => void,
) => {
  const draft = structuredClone(resolution)
  mutate(draft)
  return withFingerprint(Object.fromEntries(
    Object.entries(draft).filter(([key]) => key !== 'resolutionFingerprint'),
  ) as Omit<GoalDescriptionDualRoundResolution, 'resolutionFingerprint'>)
}

const manifestBoundResolution = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: mutateResolution((draft) => {
    draft.synthesisDecisionManifest = synthesisDecisionManifestBinding
  }),
})
assert.deepEqual(manifestBoundResolution.errors, [])
assert.equal(manifestBoundResolution.strictDescriptionComplete, true)

const wrongRun = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: mutateResolution((draft) => { draft.rounds.first.runId = 'foreign-run' }),
})
assert.match(wrongRun.errors.join('\n'), /First round runId does not match/u)
assert.equal(wrongRun.strictDescriptionComplete, false)

const duplicateRun = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: mutateResolution((draft) => { draft.rounds.second.runId = draft.rounds.first.runId }),
})
assert.match(duplicateRun.errors.join('\n'), /distinct runIds/u)

const recordDigestMismatch = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: mutateResolution((draft) => { draft.rounds.second.recordDigest = digest('f') }),
})
assert.match(recordDigestMismatch.errors.join('\n'), /record bytes/u)

const stalePageWithPlaceholder = {
  ...page,
  breadcrumbs: ['Fixture', 'Changed local context'],
  pageFingerprint: digest('0'),
}
const stalePage = {
  ...stalePageWithPlaceholder,
  pageFingerprint: fingerprintGoalDescriptionReviewPage(stalePageWithPlaceholder),
}
const changedInputGoal = {
  ...inputGoal,
  pageFingerprint: stalePage.pageFingerprint,
  reviewContext: { ...inputGoal.reviewContext, page: stalePage },
}
const changedInputWithoutFingerprint = {
  ...inputWithoutFingerprint,
  goals: [changedInputGoal],
}
const changedInput: GoalDescriptionReviewInput = {
  ...changedInputWithoutFingerprint,
  reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(changedInputWithoutFingerprint),
}
const changedContextFingerprint = fingerprintGoalDescriptionReviewContext(changedInputGoal)
const staleContextResolution = mutateResolution((draft) => {
  draft.goal.pageFingerprint = stalePage.pageFingerprint
  draft.goal.goalReviewContextFingerprint = changedContextFingerprint
})
const staleContext = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: staleContextResolution,
  currentInput: changedInput,
})
assert.match(staleContext.errors.join('\n'), /stale per-goal V3 review context/u)

for (const sourceDecision of ['revise', 'split_review', 'block'] as const) {
  const openSummary = structuredClone(dualSummary)
  openSummary.goals[0].firstDecision = sourceDecision
  const openSummaryBytes = Buffer.from(`${JSON.stringify(openSummary, null, 2)}\n`)
  const openResolution = mutateResolution((draft) => {
    draft.status = 'open'
    draft.decision = sourceDecision === 'split_review' ? 'current_after_split' : 'current_after_revision'
    draft.dualSummary.digest = sha256(openSummaryBytes)
  })
  const openResult = await validateGoalDescriptionDualRoundResolutionBindings({
    ...baseArtifacts,
    resolution: openResolution,
    dualSummary: openSummary,
    dualSummaryBytes: openSummaryBytes,
    firstSource: { binding: firstBinding, decision: sourceDecision },
  })
  assert.deepEqual(openResult.errors, [])
  assert.equal(openResult.strictDescriptionComplete, false)

  const incorrectlyResolved = mutateResolution((draft) => {
    draft.dualSummary.digest = sha256(openSummaryBytes)
  })
  const resolvedResult = await validateGoalDescriptionDualRoundResolutionBindings({
    ...baseArtifacts,
    resolution: incorrectlyResolved,
    dualSummary: openSummary,
    dualSummaryBytes: openSummaryBytes,
    firstSource: { binding: firstBinding, decision: sourceDecision },
  })
  assert.match(resolvedResult.errors.join('\n'), /must remain open until two fresh/u)
}

const missingDissent = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: mutateResolution((draft) => { draft.synthesis.dissent = [] }),
})
assert.match(missingDissent.errors.join('\n'), /requires at least one explicit bilingual dissent/u)

const fakeHuman = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: mutateResolution((draft) => {
    draft.synthesis.authority = 'human'
    draft.synthesis.humanAttestation = {
      attestationId: 'fixture-human-attestation',
      attestationDigest: digest('f'),
      reviewedBy: 'Fixture human',
      reviewedAt: '2026-08-25T12:30:00.000Z',
      approvalBasis: 'Independent review of both records and the current canonical goal.',
    }
  }),
})
assert.match(fakeHuman.errors.join('\n'), /separately supplied attestation bytes/u)

const staleResolutionFingerprint = structuredClone(resolution)
staleResolutionFingerprint.synthesis.rationaleEn = 'Tampered after fingerprinting.'
const staleResolution = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: staleResolutionFingerprint,
})
assert.match(staleResolution.errors.join('\n'), /resolutionFingerprint is stale or foreign/u)

const summaryDigestMismatch = await validateGoalDescriptionDualRoundResolutionBindings({
  ...baseArtifacts,
  resolution: mutateResolution((draft) => { draft.dualSummary.digest = digest('f') }),
})
assert.match(summaryDigestMismatch.errors.join('\n'), /persisted dual-summary bytes/u)

console.log('Goal-description dual-round resolution tests passed.')
