import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  canonicalGoalMatchesCourseProfile,
  parseAndValidateGoalBookModel,
  stableGoalBookJson,
  type GoalBookModel,
} from './goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from './materializeGoalDescriptionRolloutBatch'
import { proveMathAtlasReviewSubsetNarrowing } from './mathAtlasReviewSubsetCompatibility'
import {
  validateGoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import type { GoalDescriptionReviewInput } from './validateGoalDescriptionReviewCampaign'
import type {
  GoalDescriptionDualRoundSummary,
  GoalDescriptionReviewRoundArtifacts,
} from './validateGoalDescriptionReviewDualRound'

const schemaId = 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-scope-narrowing-compatibility.schema.json' as const
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const schema = JSON.parse(readFileSync(resolve(root,
  'contracts/goal-description-review/v1/goal-description-scope-narrowing-compatibility.schema.json',
), 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: true })
const validateSchema = ajv.compile(schema)
const sha256 = (bytes: Uint8Array): `sha256:${string}` => (
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`
)
const stableDigest = (value: unknown): `sha256:${string}` => (
  sha256(Buffer.from(stableGoalBookJson(value)))
)

export interface GoalDescriptionScopeNarrowingCompatibility {
  $schema: typeof schemaId
  schemaVersion: 1
  compatibilityId: string
  compatibilityFingerprint: `sha256:${string}`
  goalId: string
  originalResolutionDigest: `sha256:${string}`
  originalReviewInputFingerprint: `sha256:${string}`
  originalSubsetBookDigest: `sha256:${string}`
  proposedAtlasBookDigest: `sha256:${string}`
  proposedSubsetBookDigest: `sha256:${string}`
  originalPageFingerprint: `sha256:${string}`
  proposedPageFingerprint: `sha256:${string}`
  originalPageDigest: `sha256:${string}`
  proposedPageDigest: `sha256:${string}`
  removedScopeKeys: string[]
}

export interface GoalDescriptionScopeNarrowingArtifacts {
  compatibility: GoalDescriptionScopeNarrowingCompatibility
  originalResolutionBytes: Buffer
  originalResolution: GoalDescriptionDualRoundResolution
  originalDualSummary: GoalDescriptionDualRoundSummary
  originalDualSummaryBytes: Buffer
  originalInput: GoalDescriptionReviewInput
  originalSubsetBook: GoalBookModel
  first: GoalDescriptionReviewRoundArtifacts
  second: GoalDescriptionReviewRoundArtifacts
  synthesisDecisionManifestArtifact?: {
    manifest: Parameters<typeof validateGoalDescriptionDualRoundResolution>[0]['synthesisDecisionManifestArtifact'] extends infer T
      ? NonNullable<T>['manifest'] : never
    manifestBytes: Buffer
    manifestPath: string
  }
  humanAttestationBytes?: Buffer
  canonicalLandscape: unknown
  proposedAtlasBook: GoalBookModel
}

export const fingerprintGoalDescriptionScopeNarrowingCompatibility = (
  receipt: Omit<GoalDescriptionScopeNarrowingCompatibility, 'compatibilityFingerprint'>,
): `sha256:${string}` => stableDigest(receipt)

/** Builds a claim, not a validation or approval. The validator must be called separately. */
export const buildGoalDescriptionScopeNarrowingCompatibility = ({
  goalId,
  originalResolutionBytes,
  originalInput,
  originalSubsetBook,
  proposedAtlasBook,
}: Pick<GoalDescriptionScopeNarrowingArtifacts,
  'originalResolutionBytes' | 'originalInput' | 'originalSubsetBook' | 'proposedAtlasBook'
> & { goalId: string }): GoalDescriptionScopeNarrowingCompatibility => {
  const proposedSubsetBook = buildGoalDescriptionRolloutSubsetModel({
    baseModel: proposedAtlasBook,
    goalIds: originalSubsetBook.pages.map((page) => page.goalId),
    bookId: originalSubsetBook.book.id,
    title: originalSubsetBook.book.title,
  })
  const oldPage = originalSubsetBook.pages.find((page) => page.goalId === goalId)
  const proposedPage = proposedSubsetBook.pages.find((page) => page.goalId === goalId)
  if (!oldPage || !proposedPage) throw new Error(`Missing compatibility page ${goalId}`)
  const proof = proveMathAtlasReviewSubsetNarrowing(oldPage, proposedPage)
  if (!proof.exactScopeNarrowing) throw new Error(`${goalId}: not an exact GK scope narrowing`)
  const receipt = {
    $schema: schemaId,
    schemaVersion: 1 as const,
    compatibilityId: `math-gklk-${goalId}`,
    goalId,
    originalResolutionDigest: sha256(originalResolutionBytes),
    originalReviewInputFingerprint: originalInput.reviewInputFingerprint as `sha256:${string}`,
    originalSubsetBookDigest: originalSubsetBook.digest as `sha256:${string}`,
    proposedAtlasBookDigest: proposedAtlasBook.digest as `sha256:${string}`,
    proposedSubsetBookDigest: proposedSubsetBook.digest as `sha256:${string}`,
    originalPageFingerprint: oldPage.pageFingerprint as `sha256:${string}`,
    proposedPageFingerprint: proposedPage.pageFingerprint as `sha256:${string}`,
    originalPageDigest: proof.oldPageDigest as `sha256:${string}`,
    proposedPageDigest: proof.proposedPageDigest as `sha256:${string}`,
    removedScopeKeys: proof.removedScopes,
  }
  return {
    ...receipt,
    compatibilityFingerprint: fingerprintGoalDescriptionScopeNarrowingCompatibility(receipt),
  }
}

/** Explicit independent D-compatibility lane; never changes the original dual-round decision. */
export const validateGoalDescriptionScopeNarrowingCompatibility = async (
  artifacts: GoalDescriptionScopeNarrowingArtifacts,
): Promise<{ errors: string[]; compatible: boolean }> => {
  const { compatibility, originalResolutionBytes, originalResolution, originalDualSummary,
    originalDualSummaryBytes, originalInput, originalSubsetBook, first, second,
    synthesisDecisionManifestArtifact, humanAttestationBytes, canonicalLandscape,
    proposedAtlasBook } = artifacts
  const errors: string[] = []
  if (!validateSchema(compatibility)) {
    return { errors: [`Compatibility receipt violates closed schema: ${ajv.errorsText(validateSchema.errors)}`], compatible: false }
  }
  const { compatibilityFingerprint, ...payload } = compatibility
  if (compatibilityFingerprint
    !== fingerprintGoalDescriptionScopeNarrowingCompatibility(payload)) {
    errors.push('Compatibility receipt fingerprint is stale or foreign')
  }
  try {
    if (stableGoalBookJson(JSON.parse(originalResolutionBytes.toString('utf8')))
      !== stableGoalBookJson(originalResolution)) {
      errors.push('Original resolution object disagrees with its persisted bytes')
    }
  } catch {
    errors.push('Original resolution bytes are not valid JSON')
  }
  if (compatibility.originalResolutionDigest !== sha256(originalResolutionBytes)) {
    errors.push('Original resolution byte digest is stale or foreign')
  }
  for (const [label, model] of [
    ['Original review subset', originalSubsetBook],
    ['Proposed full atlas', proposedAtlasBook],
  ] as const) {
    try { parseAndValidateGoalBookModel(model) } catch (error) {
      errors.push(`${label}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  if (proposedAtlasBook.source.atlasCourseProfilePolicy !== 'canonical-course-markers-v1') {
    errors.push('Proposed atlas does not declare canonical-course-markers-v1')
  }
  if (compatibility.goalId !== originalResolution.goal.goalId) {
    errors.push('Compatibility goalId disagrees with the original resolution')
  }
  if (originalInput.bookDigest !== originalSubsetBook.digest
    || compatibility.originalSubsetBookDigest !== originalSubsetBook.digest
    || compatibility.originalReviewInputFingerprint !== originalInput.reviewInputFingerprint) {
    errors.push('Original review input/subset bindings disagree with the receipt')
  }
  if (stableGoalBookJson(originalInput.goals.map(({ goalId }) => goalId))
    !== stableGoalBookJson(originalSubsetBook.pages.map(({ goalId }) => goalId))) {
    errors.push('Original review input goal order differs from its bound subset book')
  }
  const oldPage = originalSubsetBook.pages.find((page) => page.goalId === compatibility.goalId)
  const oldInputGoal = originalInput.goals.find((goal) => goal.goalId === compatibility.goalId)
  if (!oldPage || !oldInputGoal
    || stableGoalBookJson(oldInputGoal.reviewContext.page) !== stableGoalBookJson(oldPage)) {
    errors.push('Original target page is missing or differs from the reviewed V3 input')
  }
  let proposedSubsetBook: GoalBookModel | null = null
  try {
    proposedSubsetBook = buildGoalDescriptionRolloutSubsetModel({
      baseModel: proposedAtlasBook,
      goalIds: originalSubsetBook.pages.map((page) => page.goalId),
      bookId: originalSubsetBook.book.id,
      title: originalSubsetBook.book.title,
    })
    parseAndValidateGoalBookModel(proposedSubsetBook)
  } catch (error) {
    errors.push(`Proposed review subset could not be validated: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (compatibility.proposedAtlasBookDigest !== proposedAtlasBook.digest
    || compatibility.proposedSubsetBookDigest !== proposedSubsetBook?.digest) {
    errors.push('Proposed full atlas or review subset digest disagrees with the receipt')
  }
  const newPage = proposedSubsetBook?.pages.find((page) => page.goalId === compatibility.goalId)
  if (oldPage && newPage) {
    const proof = proveMathAtlasReviewSubsetNarrowing(oldPage, newPage)
    if (!proof.exactScopeNarrowing) errors.push('Target page differs by more than a strict GK scope narrowing')
    if (compatibility.originalPageFingerprint !== oldPage.pageFingerprint
      || compatibility.proposedPageFingerprint !== newPage.pageFingerprint
      || compatibility.originalPageDigest !== proof.oldPageDigest
      || compatibility.proposedPageDigest !== proof.proposedPageDigest
      || stableGoalBookJson(compatibility.removedScopeKeys)
        !== stableGoalBookJson(proof.removedScopes)) {
      errors.push('Per-page fingerprints, digests or removed GK scopes disagree with the receipt')
    }
  } else {
    errors.push('Target page is absent from old or proposed review subset')
  }
  const canonicalMatches = (canonicalLandscape as { goals?: unknown })?.goals
  const currentGoals = Array.isArray(canonicalMatches) ? canonicalMatches.filter((goal) => (
    goal && typeof goal === 'object' && (goal as { id?: unknown }).id === compatibility.goalId
  )) : []
  if (currentGoals.length !== 1) {
    errors.push('Canonical landscape must contain exactly one compatibility goal')
  } else if (canonicalGoalMatchesCourseProfile(currentGoals[0], 'GK')
    || !canonicalGoalMatchesCourseProfile(currentGoals[0], 'LK')) {
    errors.push('Canonical goal is not LK-only under the current course policy')
  }
  // The original approval is validated in its original context. We never
  // recompute or replace its round, page or context fingerprints.
  const original = await validateGoalDescriptionDualRoundResolution({
    resolution: originalResolution,
    dualSummary: originalDualSummary,
    dualSummaryBytes: originalDualSummaryBytes,
    currentInput: originalInput,
    landscape: canonicalLandscape,
    first,
    second,
    synthesisDecisionManifestArtifact,
    humanAttestationBytes,
  })
  if (!original.strictDescriptionComplete || original.errors.length > 0) {
    errors.push('Original dual-round D resolution no longer validates strictly')
    errors.push(...original.errors.map((error) => `Original D: ${error}`))
  }
  return { errors, compatible: errors.length === 0 }
}
