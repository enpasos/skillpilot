import { createHash } from 'node:crypto'
import type {
  GoalDescriptionDualRoundResolution,
  GoalDescriptionDualRoundResolutionSource,
} from './validateGoalDescriptionDualRoundResolution'
import type {
  GoalDescriptionRolloutSynthesisDecisionManifest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'
import type { GoalDescriptionDualRoundSummary } from './validateGoalDescriptionReviewDualRound'

export const GOAL_DESCRIPTION_RESOLUTION_LONG_TEXT_MAX_LENGTH = 4000

type SynthesisDecision = GoalDescriptionRolloutSynthesisDecisionManifest['decisions'][number]
type RevisionDissent = NonNullable<SynthesisDecision['revisionDissent']>

const assertGeneratedLongText = (value: string, label: string) => {
  const characterLength = [...value].length
  if (
    characterLength < 1
    || characterLength > GOAL_DESCRIPTION_RESOLUTION_LONG_TEXT_MAX_LENGTH
    || value.trim() !== value
  ) {
    throw new Error(
      `${label} must be non-blank, trimmed, and at most `
      + `${GOAL_DESCRIPTION_RESOLUTION_LONG_TEXT_MAX_LENGTH} characters; generated ${characterLength}`,
    )
  }
}

export const buildGoalDescriptionRejectedRevisionDissent = ({
  batchId,
  goalId,
  revisionDissent,
}: {
  batchId: string
  goalId: string
  revisionDissent: RevisionDissent
}): GoalDescriptionDualRoundResolution['synthesis']['dissent'][number] => {
  const textDe = `Die ${revisionDissent.sourceRound === 'first' ? 'erste' : 'zweite'} Runde schlug folgende Revision vor: „${revisionDissent.proposedDescriptionDe}“ Die Synthese verwirft diesen Ersatztext ausdrücklich und behält den aktuellen kanonischen Wortlaut bei. ${revisionDissent.rationaleDe}`
  const textEn = `The ${revisionDissent.sourceRound} round proposed this revision: “${revisionDissent.proposedDescriptionEn}” The synthesis explicitly rejects that replacement text and retains the current canonical wording. ${revisionDissent.rationaleEn}`
  assertGeneratedLongText(textDe, `${goalId}: generated German rejected-revision dissent`)
  assertGeneratedLongText(textEn, `${goalId}: generated English rejected-revision dissent`)
  return {
    dissentId: `synthesis-dissent-${createHash('sha256').update(`${batchId}\u0000${goalId}`).digest('hex')}`,
    source: revisionDissent.sourceRound,
    textDe,
    textEn,
    disposition: 'rejected_revision_evidence_accepted',
  }
}

const buildGoalDescriptionKeepDisagreementDissent = ({
  batchId,
  decision,
  summaryGoal,
}: {
  batchId: string
  decision: SynthesisDecision
  summaryGoal: GoalDescriptionDualRoundSummary['goals'][number]
}): GoalDescriptionDualRoundResolution['synthesis']['dissent'][number] => {
  const disagreementFields = summaryGoal.disagreementFields.join(', ')
  const textDe = `Die beiden aktuellen keep-Reviews unterscheiden sich in ${disagreementFields}; das Manifest wählt ausdrücklich die Evidence-Fassung der ${decision.evidenceRound === 'first' ? 'ersten' : 'zweiten'} Runde.`
  const textEn = `The two current keep reviews differ in ${disagreementFields}; the manifest explicitly selects the evidence formulation from the ${decision.evidenceRound} round.`
  assertGeneratedLongText(textDe, `${decision.goalId}: generated German keep-review dissent`)
  assertGeneratedLongText(textEn, `${decision.goalId}: generated English keep-review dissent`)
  return {
    dissentId: `synthesis-dissent-${createHash('sha256').update(`${batchId}\u0000${decision.goalId}`).digest('hex')}`,
    source: 'both',
    textDe,
    textEn,
    disposition: decision.evidenceRound === 'first' ? 'accepted_first' : 'accepted_second',
  }
}

export const buildGoalDescriptionRolloutResolutionSynthesis = ({
  batchId,
  manifest,
  decision,
  summaryGoal,
  firstSource,
  secondSource,
}: {
  batchId: string
  manifest: GoalDescriptionRolloutSynthesisDecisionManifest
  decision: SynthesisDecision
  summaryGoal: GoalDescriptionDualRoundSummary['goals'][number]
  firstSource: GoalDescriptionDualRoundResolutionSource
  secondSource: GoalDescriptionDualRoundResolutionSource
}): GoalDescriptionDualRoundResolution['synthesis'] => {
  const sources = { first: firstSource, second: secondSource } as const
  const evidenceSource = sources[decision.evidenceRound]
  const otherRound = decision.evidenceRound === 'first' ? 'second' : 'first'
  const otherSource = sources[otherRound]
  const reviseRound = firstSource.decision === 'revise'
    ? 'first'
    : secondSource.decision === 'revise'
      ? 'second'
      : null
  const mixedKeepRevise = (
    decision.resolutionDecision === 'keep_current'
    && [firstSource.decision, secondSource.decision].filter((value) => value === 'keep').length === 1
    && [firstSource.decision, secondSource.decision].filter((value) => value === 'revise').length === 1
  )
  const revisionDissent = decision.revisionDissent
  if (mixedKeepRevise) {
    const reviseSource = reviseRound ? sources[reviseRound] : null
    if (
      !reviseRound
      || !reviseSource?.record
      || !revisionDissent
      || revisionDissent.sourceRound !== reviseRound
      || revisionDissent.disposition !== 'rejected_keep_current'
      || revisionDissent.proposedDescriptionDe !== reviseSource.record.proposedDescriptionDe
      || revisionDissent.proposedDescriptionEn !== reviseSource.record.proposedDescriptionEn
    ) {
      throw new Error(`${decision.goalId}: mixed keep/revise synthesis lacks exact rejected-revision binding`)
    }
  } else if (revisionDissent) {
    throw new Error(`${decision.goalId}: revision dissent is only valid for exactly one keep plus one revise`)
  }
  const selectedReviseAllowed = (
    mixedKeepRevise
    && evidenceSource.decision === 'revise'
    && otherSource.decision === 'keep'
  )
  if (
    !evidenceSource.record
    || (evidenceSource.decision !== 'keep' && !selectedReviseAllowed)
  ) {
    throw new Error(`${decision.goalId}: selected evidence round is not an allowed current keep/revise record`)
  }
  const dissent = revisionDissent
    ? [buildGoalDescriptionRejectedRevisionDissent({
        batchId,
        goalId: decision.goalId,
        revisionDissent,
      })]
    : summaryGoal.agreement === 'disagreement'
      ? [buildGoalDescriptionKeepDisagreementDissent({ batchId, decision, summaryGoal })]
      : []
  return {
    synthesisId: decision.decisionId,
    authority: 'ai_synthesis',
    synthesizedBy: manifest.synthesizedBy,
    synthesizedAt: manifest.synthesizedAt,
    rationaleDe: decision.rationaleDe,
    rationaleEn: decision.rationaleEn,
    understandingEvidence: structuredClone(evidenceSource.record.understandingEvidence),
    dissent,
    humanAttestation: null,
  }
}
