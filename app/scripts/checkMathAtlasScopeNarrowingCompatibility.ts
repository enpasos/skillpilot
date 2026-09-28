import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, stableGoalBookJson, type GoalBookModel } from './goalBookModel'
import { loadGoalDescriptionReviewCampaignResultDirectories } from './validateGoalDescriptionReviewCampaignResults'
import type { GoalDescriptionReviewInput } from './validateGoalDescriptionReviewCampaign'
import type {
  GoalDescriptionDualRoundSummary,
  GoalDescriptionReviewRoundArtifacts,
} from './validateGoalDescriptionReviewDualRound'
import type { GoalDescriptionDualRoundResolution } from './validateGoalDescriptionDualRoundResolution'
import {
  buildGoalDescriptionScopeNarrowingCompatibility,
  validateGoalDescriptionScopeNarrowingCompatibility,
} from './validateGoalDescriptionScopeNarrowingCompatibility'

const root = fileURLToPath(new URL('../..', import.meta.url))
const preparation = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-27/m7-gklk-projection-preparation-20260927-v1'
)
const json = async <T>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8')) as T
const inside = (parent: string, path: string): string => {
  const absolute = resolve(parent, path)
  const suffix = relative(root, absolute)
  assert.ok(suffix !== '..' && !suffix.startsWith(`..${sep}`), `unsafe artifact path ${path}`)
  return absolute
}
const insideBatch = (parent: string, path: string): string => {
  const absolute = inside(parent, path)
  const suffix = relative(parent, absolute)
  assert.ok(suffix && suffix !== '..' && !suffix.startsWith(`..${sep}`),
    `unsafe batch artifact path ${path}`)
  return absolute
}
const loadRound = async (groupDirectory: string, name: string): Promise<GoalDescriptionReviewRoundArtifacts> => {
  const directory = inside(groupDirectory, name)
  const bundle = await json<GoalDescriptionReviewRoundArtifacts['bundle']>(resolve(directory, 'review-bundle-manifest.json'))
  const input = await json<GoalDescriptionReviewInput>(resolve(directory, 'description-review-input.json'))
  const campaign = await json<GoalDescriptionReviewRoundArtifacts['campaign']>(resolve(directory, 'description-review-campaign.json'))
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory: resolve(directory, 'batches'),
    resultsDirectory: resolve(directory, 'results'),
  })
  assert.deepEqual(loaded.errors, [], `${directory}: invalid campaign result directories`)
  return { bundle, input, campaign, resultPairs: loaded.resultPairs }
}

const report = await json<{ affectedPages: Array<{
  goalId: string; declaredStrictDResolution: boolean
}>; proposedBookDigest: string }>(resolve(root, preparation, 'course-projection-delta.json'))
const targetIds = new Set(report.affectedPages.filter((page) => page.declaredStrictDResolution)
  .map((page) => page.goalId))
assert.equal(targetIds.size, 98)
const proposedAtlasBook = (await loadGoalBookBuildInputs(resolve(root, preparation,
  'proposed-atlas.config.json'))).model
assert.equal(proposedAtlasBook.digest, report.proposedBookDigest)
const canonicalLandscape = await json<unknown>(resolve(root, proposedAtlasBook.source.landscapePath))
const registry = await json<{ subjects: Array<{
  subject: string; resolutionIndexPaths: string[]
}> }>(resolve(root,
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'))
const math = registry.subjects.find((subject) => subject.subject === 'mathematik')
assert.ok(math)
const groupCache = new Map<string, {
  originalSubsetBook: GoalBookModel
  originalDualSummary: GoalDescriptionDualRoundSummary
  originalDualSummaryBytes: Buffer
  first: GoalDescriptionReviewRoundArtifacts
  second: GoalDescriptionReviewRoundArtifacts
}>()
const accepted: Array<{ goalId: string; compatibilityFingerprint: string }> = []
const rejected: Array<{ goalId: string; reason: string }> = []
const seen = new Set<string>()
for (const indexPath of math.resolutionIndexPaths) {
  const absoluteIndex = resolve(root, indexPath)
  const index = await json<{
    groups: Array<{
      groupId: string; artifactDirectory?: string; dualSummaryPath: string
    }>
    resolutions: Array<{
      goalId: string; groupId: string; resolutionPath: string;
      resolutionDigest: string; strictDescriptionComplete: boolean;
      humanAttestationPath?: string
    }>
  }>(absoluteIndex)
  for (const entry of index.resolutions) {
    if (!targetIds.has(entry.goalId)) continue
    assert.ok(!seen.has(entry.goalId), `duplicate D owner ${entry.goalId}`)
    seen.add(entry.goalId)
    assert.equal(entry.strictDescriptionComplete, true)
    const group = index.groups.find((candidate) => candidate.groupId === entry.groupId)
    assert.ok(group)
    const groupDirectory = inside(dirname(absoluteIndex), group.artifactDirectory ?? group.groupId)
    let groupArtifacts = groupCache.get(groupDirectory)
    if (!groupArtifacts) {
      const [originalSubsetBook, originalDualSummaryBytes, first, second] = await Promise.all([
        json<GoalBookModel>(resolve(groupDirectory, 'bundle/book-model.json')),
        readFile(inside(dirname(absoluteIndex), group.dualSummaryPath)),
        loadRound(groupDirectory, 'round-a'),
        loadRound(groupDirectory, 'round-b'),
      ])
      groupArtifacts = {
        originalSubsetBook,
        originalDualSummary: JSON.parse(originalDualSummaryBytes.toString('utf8')),
        originalDualSummaryBytes, first, second,
      }
      groupCache.set(groupDirectory, groupArtifacts)
    }
    const originalResolutionPath = inside(dirname(absoluteIndex), entry.resolutionPath)
    const originalResolutionBytes = await readFile(originalResolutionPath)
    const originalResolution = JSON.parse(originalResolutionBytes.toString('utf8')) as GoalDescriptionDualRoundResolution
    let compatibility: ReturnType<typeof buildGoalDescriptionScopeNarrowingCompatibility>
    try {
      compatibility = buildGoalDescriptionScopeNarrowingCompatibility({
        goalId: entry.goalId,
        originalResolutionBytes,
        originalInput: groupArtifacts.first.input,
        originalSubsetBook: groupArtifacts.originalSubsetBook,
        proposedAtlasBook,
      })
    } catch (error) {
      rejected.push({ goalId: entry.goalId,
        reason: error instanceof Error ? error.message : String(error) })
      continue
    }
    assert.equal(compatibility.originalResolutionDigest, entry.resolutionDigest,
      `${entry.goalId}: registered original resolution digest changed`)
    const decisionBinding = originalResolution.synthesisDecisionManifest
    const synthesisDecisionManifestArtifact = decisionBinding
      ? await (async () => {
        const path = insideBatch(dirname(dirname(originalResolutionPath)), decisionBinding.manifestPath)
        const manifestBytes = await readFile(path)
        return {
          manifest: JSON.parse(manifestBytes.toString('utf8')),
          manifestBytes,
          manifestPath: decisionBinding.manifestPath,
        }
      })() : undefined
    const humanAttestationBytes = entry.humanAttestationPath
      ? await readFile(inside(dirname(absoluteIndex), entry.humanAttestationPath)) : undefined
    const result = await validateGoalDescriptionScopeNarrowingCompatibility({
      compatibility,
      originalResolutionBytes,
      originalResolution,
      originalDualSummary: groupArtifacts.originalDualSummary,
      originalDualSummaryBytes: groupArtifacts.originalDualSummaryBytes,
      originalInput: groupArtifacts.first.input,
      originalSubsetBook: groupArtifacts.originalSubsetBook,
      first: groupArtifacts.first,
      second: groupArtifacts.second,
      synthesisDecisionManifestArtifact,
      humanAttestationBytes,
      canonicalLandscape,
      proposedAtlasBook,
    })
    if (result.compatible) {
      accepted.push({ goalId: entry.goalId,
        compatibilityFingerprint: compatibility.compatibilityFingerprint })
    } else {
      rejected.push({ goalId: entry.goalId, reason: result.errors.join(' | ') })
    }
  }
}
assert.equal(seen.size, 98)
assert.equal(accepted.length, 82, `Expected 82 full compatibility proofs; failures: ${JSON.stringify(rejected)}`)
assert.equal(rejected.length, 16)
const acceptedFingerprintDigest = `sha256:${createHash('sha256').update(stableGoalBookJson(
  accepted.sort((a, b) => a.goalId.localeCompare(b.goalId)),
)).digest('hex')}`
assert.equal(acceptedFingerprintDigest,
  'sha256:56acfa26e4adb17ea9c939506920ef0b9b6bf8a9767c37e2ebb1b27e9454814b',
  'the accepted compatibility receipt set drifted and needs re-adjudication')
console.log(JSON.stringify({
  originalDClaims: seen.size,
  fullyValidatedCompatibilityClaims: accepted.length,
  newDClaimsRegistered: 0,
  rejected: rejected.map(({ goalId, reason }) => ({ goalId, reason })),
  acceptedFingerprintDigest,
}, null, 2))
