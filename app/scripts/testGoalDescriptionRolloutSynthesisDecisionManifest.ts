import assert from 'node:assert/strict'
import {
  buildGoalDescriptionRolloutResolutionSynthesis,
} from './materializeGoalDescriptionRolloutResolutions'
import type {
  GoalDescriptionDualRoundResolutionSource,
} from './validateGoalDescriptionDualRoundResolution'
import type { GoalDescriptionReviewRecord } from './validateGoalDescriptionReviewCampaign'
import type { GoalDescriptionDualRoundSummary } from './validateGoalDescriptionReviewDualRound'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedBindings,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

const digest = (character: string) => `sha256:${character.repeat(64)}` as const
const goalId = 'goal-synthesis-01'
const finalText = {
  titleDe: 'Zusammenhang erklären',
  titleEn: 'Explain a relationship',
  descriptionDe: 'Die lernende Person kann einen fachlichen Zusammenhang erklären und auf einen veränderten Fall übertragen.',
  descriptionEn: 'The learner can explain a subject-specific relationship and transfer it to a changed case.',
}
const firstEvidence = {
  essentialUnderstandingDe: 'Die zentrale Beziehung gilt unter klar benannten Bedingungen.',
  essentialUnderstandingEn: 'The central relationship holds under clearly stated conditions.',
  observablePerformanceDe: 'Die lernende Person erklärt und begründet die Beziehung selbstständig.',
  observablePerformanceEn: 'The learner independently explains and justifies the relationship.',
  transferExpectationDe: 'Die lernende Person nutzt die Beziehung in einem strukturell veränderten Fall.',
  transferExpectationEn: 'The learner uses the relationship in a structurally changed case.',
}
const secondEvidence = {
  essentialUnderstandingDe: 'Die Beziehung verbindet zwei Größen innerhalb ihres Gültigkeitsbereichs.',
  essentialUnderstandingEn: 'The relationship connects two quantities within its range of validity.',
  observablePerformanceDe: 'Die lernende Person konstruiert eine Begründung aus unabhängigen Daten.',
  observablePerformanceEn: 'The learner constructs a justification from independent data.',
  transferExpectationDe: 'Die lernende Person prüft die Beziehung bei veränderten Randbedingungen.',
  transferExpectationEn: 'The learner tests the relationship under changed boundary conditions.',
}

const source = ({
  label,
  evidence,
}: {
  label: 'a' | 'b'
  evidence: typeof firstEvidence
}): GoalDescriptionDualRoundResolutionSource => ({
  binding: {
    campaignId: `campaign-${label}`,
    campaignDigest: digest(label === 'a' ? '1' : '2'),
    roundId: `round-${label}`,
    independenceGroupId: `independent-${label}`,
    reviewInputFingerprint: digest('3'),
    goalReviewContextFingerprint: digest('4'),
    batchId: `round-${label}.batch-001`,
    runId: `run-${label}`,
    runManifestDigest: digest(label === 'a' ? '5' : '6'),
    resultsDigest: digest(label === 'a' ? '7' : '8'),
    recordId: `record-${label}`,
    recordDigest: digest(label === 'a' ? '9' : 'a'),
  },
  decision: 'keep',
  record: {
    goalId,
    goalFingerprint: digest('b'),
    pageFingerprint: digest('c'),
    currentTitleDe: finalText.titleDe,
    currentTitleEn: finalText.titleEn,
    currentDescriptionDe: finalText.descriptionDe,
    currentDescriptionEn: finalText.descriptionEn,
    decision: 'keep',
    understandingEvidence: evidence,
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  } as GoalDescriptionReviewRecord,
})

const firstSource = source({ label: 'a', evidence: firstEvidence })
const secondSource = source({ label: 'b', evidence: secondEvidence })
const synthesizedAt = '2026-08-26T12:00:01.000Z'
const batchInputFirst = digest('d')
const batchInputSecond = digest('e')
const expected: GoalDescriptionRolloutSynthesisExpectedBindings = {
  batch: {
    batchId: 'fixture-rollout-batch',
    batchManifestDigest: digest('f'),
    configDigest: digest('0'),
    bundleFingerprint: digest('1'),
    bookDigest: digest('2'),
    reviewInputFingerprint: digest('3'),
    dualSummaryDigest: digest('4'),
    canonicalLandscapeDigest: digest('5'),
  },
  rounds: {
    first: buildGoalDescriptionRolloutSynthesisRoundBinding(firstSource.binding, batchInputFirst),
    second: buildGoalDescriptionRolloutSynthesisRoundBinding(secondSource.binding, batchInputSecond),
  },
  synthesizedAt,
  goals: [{
    goalId,
    effectiveSemanticKind: 'curricularAtomic',
    goalFingerprint: digest('b'),
    pageFingerprint: digest('c'),
    goalReviewContextFingerprint: digest('4'),
    finalText,
    firstSource,
    secondSource,
  }],
}

const manifestWithoutFingerprint: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
  schemaVersion: 1,
  synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
  manifestId: 'fixture-rollout-batch-synthesis',
  authority: 'ai_synthesis',
  synthesizedBy: 'Fixture AI synthesizer',
  synthesizedAt,
  batch: expected.batch,
  rounds: expected.rounds,
  decisions: [{
    decisionId: 'fixture-rollout-batch-synthesis-goal-01',
    goalId,
    effectiveSemanticKind: 'curricularAtomic',
    goalFingerprint: digest('b'),
    pageFingerprint: digest('c'),
    goalReviewContextFingerprint: digest('4'),
    finalText,
    resolutionDecision: 'current_after_revision',
    evidenceRound: 'second',
    records: {
      first: {
        recordId: firstSource.binding.recordId,
        recordDigest: firstSource.binding.recordDigest,
      },
      second: {
        recordId: secondSource.binding.recordId,
        recordDigest: secondSource.binding.recordDigest,
      },
    },
    rationaleDe: 'Zwei unabhängige aktuelle keep-Reviews bestätigen den kanonischen Finaltext; die zweite Evidence-Fassung bildet die Modellgrenzen präziser ab.',
    rationaleEn: 'Two independent current keep reviews confirm the canonical final text; the second evidence formulation captures the model limits more precisely.',
  }],
}
const withFingerprint = (
  value: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'>,
): GoalDescriptionRolloutSynthesisDecisionManifest => ({
  ...value,
  manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(value),
})
const manifest = withFingerprint(manifestWithoutFingerprint)

const valid = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest, expected })
assert.deepEqual(valid.errors, [])

const summaryGoal = {
  goalId,
  firstRecordId: firstSource.binding.recordId,
  secondRecordId: secondSource.binding.recordId,
  firstRunId: firstSource.binding.runId,
  secondRunId: secondSource.binding.runId,
  firstDecision: 'keep',
  secondDecision: 'keep',
  agreement: 'disagreement',
  disagreementFields: ['understandingEvidence'],
  requiresSynthesis: true,
  automaticAcceptance: false,
} as GoalDescriptionDualRoundSummary['goals'][number]
const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
  batchId: expected.batch.batchId,
  manifest,
  decision: manifest.decisions[0],
  summaryGoal,
  firstSource,
  secondSource,
})
const repeatedSynthesis = buildGoalDescriptionRolloutResolutionSynthesis({
  batchId: expected.batch.batchId,
  manifest,
  decision: manifest.decisions[0],
  summaryGoal,
  firstSource,
  secondSource,
})
assert.deepEqual(synthesis, repeatedSynthesis, 'Identical manifest bindings must produce deterministic synthesis bytes.')
assert.deepEqual(synthesis.understandingEvidence, secondEvidence)
assert.equal(synthesis.authority, 'ai_synthesis')
assert.equal(synthesis.humanAttestation, null)
assert.equal(synthesis.dissent[0]?.disposition, 'accepted_second')

const staleFingerprint = structuredClone(manifest)
staleFingerprint.decisions[0].rationaleEn = 'Tampered after fingerprinting.'
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: staleFingerprint,
    expected,
  })).errors.join('\n'),
  /fingerprint is stale or foreign/u,
)

const wrongFinalTextWithoutFingerprint = structuredClone(manifestWithoutFingerprint)
wrongFinalTextWithoutFingerprint.decisions[0].finalText.descriptionEn = 'A foreign final description.'
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: withFingerprint(wrongFinalTextWithoutFingerprint),
    expected,
  })).errors.join('\n'),
  /current canonical text and fingerprints/u,
)

const wrongRecordWithoutFingerprint = structuredClone(manifestWithoutFingerprint)
wrongRecordWithoutFingerprint.decisions[0].records.second.recordDigest = digest('f')
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: withFingerprint(wrongRecordWithoutFingerprint),
    expected,
  })).errors.join('\n'),
  /record id or byte digest/u,
)

for (const sourceDecision of ['revise', 'split_review', 'block'] as const) {
  const invalidExpected = structuredClone(expected)
  invalidExpected.goals[0].firstSource.decision = sourceDecision
  assert.match(
    (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
      manifest,
      expected: invalidExpected,
    })).errors.join('\n'),
    /synthesis requires either two current keep records or, for keep_current only, exactly one current keep and one current revise record/u,
  )
}

const proposedDescriptionDe = 'Die lernende Person kann den Zusammenhang unter einer ausdrücklich genannten Zusatzbedingung erklären.'
const proposedDescriptionEn = 'The learner can explain the relationship under an explicitly stated additional condition.'
const mixedExpected = structuredClone(expected)
mixedExpected.goals[0].secondSource.decision = 'revise'
mixedExpected.goals[0].secondSource.record!.decision = 'revise'
mixedExpected.goals[0].secondSource.record!.proposedDescriptionDe = proposedDescriptionDe
mixedExpected.goals[0].secondSource.record!.proposedDescriptionEn = proposedDescriptionEn
const mixedManifestWithoutFingerprint = structuredClone(manifestWithoutFingerprint)
mixedManifestWithoutFingerprint.decisions[0].resolutionDecision = 'keep_current'
mixedManifestWithoutFingerprint.decisions[0].evidenceRound = 'second'
mixedManifestWithoutFingerprint.decisions[0].revisionDissent = {
  sourceRound: 'second',
  disposition: 'rejected_keep_current',
  proposedDescriptionDe,
  proposedDescriptionEn,
  rationaleDe: 'Die Zusatzbedingung ist fachlich relevant und bleibt in der ausgewählten Evidenz gebunden; als kanonischer Ersatztext ist der Vorschlag jedoch unnötig lang.',
  rationaleEn: 'The additional condition is relevant and remains bound in the selected evidence, but the proposed canonical replacement is unnecessarily long.',
}
const mixedManifest = withFingerprint(mixedManifestWithoutFingerprint)
assert.deepEqual(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: mixedManifest,
    expected: mixedExpected,
  })).errors,
  [],
  'keep_current must accept exactly one current keep plus one current revise when the rejected proposal is bound as dissent.',
)
const mixedSummaryGoal = {
  ...summaryGoal,
  secondDecision: 'revise',
  disagreementFields: ['decision', 'proposedDescription', 'understandingEvidence'],
} as GoalDescriptionDualRoundSummary['goals'][number]
const mixedSynthesis = buildGoalDescriptionRolloutResolutionSynthesis({
  batchId: mixedExpected.batch.batchId,
  manifest: mixedManifest,
  decision: mixedManifest.decisions[0],
  summaryGoal: mixedSummaryGoal,
  firstSource: mixedExpected.goals[0].firstSource,
  secondSource: mixedExpected.goals[0].secondSource,
})
assert.deepEqual(mixedSynthesis.understandingEvidence, secondEvidence)
assert.equal(mixedSynthesis.dissent[0]?.source, 'second')
assert.equal(mixedSynthesis.dissent[0]?.disposition, 'rejected_revision_evidence_accepted')
assert.match(mixedSynthesis.dissent[0]?.textDe ?? '', new RegExp(proposedDescriptionDe, 'u'))
assert.match(mixedSynthesis.dissent[0]?.textEn ?? '', new RegExp(proposedDescriptionEn, 'u'))

const overlongMixedExpected = structuredClone(mixedExpected)
const overlongProposedDescriptionDe = `D${'e'.repeat(3899)}`
const overlongProposedDescriptionEn = `E${'n'.repeat(3899)}`
overlongMixedExpected.goals[0].secondSource.record!.proposedDescriptionDe = overlongProposedDescriptionDe
overlongMixedExpected.goals[0].secondSource.record!.proposedDescriptionEn = overlongProposedDescriptionEn
const overlongMixedManifestWithoutFingerprint = structuredClone(mixedManifestWithoutFingerprint)
overlongMixedManifestWithoutFingerprint.decisions[0].revisionDissent!.proposedDescriptionDe = overlongProposedDescriptionDe
overlongMixedManifestWithoutFingerprint.decisions[0].revisionDissent!.proposedDescriptionEn = overlongProposedDescriptionEn
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: withFingerprint(overlongMixedManifestWithoutFingerprint),
    expected: overlongMixedExpected,
  })).errors.join('\n'),
  /generated (German|English) rejected-revision dissent must be non-blank, trimmed, and at most 4000 characters/u,
  'Individually schema-valid proposal and rationale inputs must fail before they can generate schema-invalid dissent.',
)

const missingRevisionDissent = structuredClone(mixedManifestWithoutFingerprint)
delete missingRevisionDissent.decisions[0].revisionDissent
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: withFingerprint(missingRevisionDissent),
    expected: mixedExpected,
  })).errors.join('\n'),
  /requires exact rejected-revision dissent binding/u,
)

const wrongRevisionRound = structuredClone(mixedManifestWithoutFingerprint)
wrongRevisionRound.decisions[0].revisionDissent!.sourceRound = 'first'
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: withFingerprint(wrongRevisionRound),
    expected: mixedExpected,
  })).errors.join('\n'),
  /requires exact rejected-revision dissent binding/u,
)

const wrongRevisionText = structuredClone(mixedManifestWithoutFingerprint)
wrongRevisionText.decisions[0].revisionDissent!.proposedDescriptionEn = 'A foreign revision proposal.'
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: withFingerprint(wrongRevisionText),
    expected: mixedExpected,
  })).errors.join('\n'),
  /requires exact rejected-revision dissent binding/u,
)

const twoReviseExpected = structuredClone(mixedExpected)
twoReviseExpected.goals[0].firstSource.decision = 'revise'
twoReviseExpected.goals[0].firstSource.record!.decision = 'revise'
twoReviseExpected.goals[0].firstSource.record!.proposedDescriptionDe = proposedDescriptionDe
twoReviseExpected.goals[0].firstSource.record!.proposedDescriptionEn = proposedDescriptionEn
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: mixedManifest,
    expected: twoReviseExpected,
  })).errors.join('\n'),
  /exactly one current keep and one current revise record/u,
)

for (const disallowedDecision of ['split_review', 'block'] as const) {
  const disallowedExpected = structuredClone(mixedExpected)
  disallowedExpected.goals[0].secondSource.decision = disallowedDecision
  disallowedExpected.goals[0].secondSource.record!.decision = disallowedDecision
  assert.match(
    (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
      manifest: mixedManifest,
      expected: disallowedExpected,
    })).errors.join('\n'),
    /not an allowed current keep\/revise record/u,
  )
}

const staleReviseExpected = structuredClone(mixedExpected)
staleReviseExpected.goals[0].secondSource.record!.goalFingerprint = digest('f')
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: mixedManifest,
    expected: staleReviseExpected,
  })).errors.join('\n'),
  /record is stale or foreign/u,
)

const nonIndependentWithoutFingerprint = structuredClone(manifestWithoutFingerprint)
nonIndependentWithoutFingerprint.rounds.second.independenceGroupId = nonIndependentWithoutFingerprint.rounds.first.independenceGroupId
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: withFingerprint(nonIndependentWithoutFingerprint),
    expected,
  })).errors.join('\n'),
  /distinct independenceGroupIds/u,
)

const fakeHumanWithoutFingerprint = {
  ...structuredClone(manifestWithoutFingerprint),
  authority: 'human',
} as unknown as Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'>
assert.match(
  (await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: withFingerprint(fakeHumanWithoutFingerprint),
    expected,
  })).errors.join('\n'),
  /authority/u,
)

console.log('Goal-description rollout synthesis-decision manifest tests passed.')
