import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, type GoalBookModel } from './goalBookModel'
import { loadGoalDescriptionReviewCampaignResultDirectories } from './validateGoalDescriptionReviewCampaignResults'
import type { GoalDescriptionReviewInput } from './validateGoalDescriptionReviewCampaign'
import type { GoalDescriptionReviewRoundArtifacts } from './validateGoalDescriptionReviewDualRound'
import type { GoalDescriptionDualRoundResolution } from './validateGoalDescriptionDualRoundResolution'
import {
  buildGoalDescriptionScopeNarrowingCompatibility,
  fingerprintGoalDescriptionScopeNarrowingCompatibility,
  validateGoalDescriptionScopeNarrowingCompatibility,
  type GoalDescriptionScopeNarrowingArtifacts,
  type GoalDescriptionScopeNarrowingCompatibility,
} from './validateGoalDescriptionScopeNarrowingCompatibility'

const root = fileURLToPath(new URL('../..', import.meta.url))
const group = resolve(root,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-21/m7-proof-statistics-hold-repairs-7-v1')
const proposedConfig = resolve(root,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-27/m7-gklk-projection-preparation-20260927-v1/proposed-atlas.config.json')
const goalId = '01217f4a-5221-5df9-b379-7b241fccf809'
const json = async <T>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8')) as T
const loadRound = async (name: string): Promise<GoalDescriptionReviewRoundArtifacts> => {
  const directory = resolve(group, name)
  const bundle = await json<GoalDescriptionReviewRoundArtifacts['bundle']>(resolve(directory, 'review-bundle-manifest.json'))
  const input = await json<GoalDescriptionReviewInput>(resolve(directory, 'description-review-input.json'))
  const campaign = await json<GoalDescriptionReviewRoundArtifacts['campaign']>(resolve(directory, 'description-review-campaign.json'))
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory: resolve(directory, 'batches'),
    resultsDirectory: resolve(directory, 'results'),
  })
  assert.deepEqual(loaded.errors, [])
  return { bundle, input, campaign, resultPairs: loaded.resultPairs }
}

const originalResolutionPath = resolve(group, `resolutions/${goalId}.resolution.json`)
const originalResolutionBytes = await readFile(originalResolutionPath)
const originalResolution = JSON.parse(originalResolutionBytes.toString('utf8')) as GoalDescriptionDualRoundResolution
const originalDualSummaryBytes = await readFile(resolve(group, 'dual-summary.json'))
const originalDualSummary = JSON.parse(originalDualSummaryBytes.toString('utf8'))
const originalSubsetBook = await json<GoalBookModel>(resolve(group, 'bundle/book-model.json'))
const proposedAtlasBook = (await loadGoalBookBuildInputs(proposedConfig)).model
const canonicalLandscape = await json<unknown>(resolve(root, proposedAtlasBook.source.landscapePath))
const [first, second] = await Promise.all([loadRound('round-a'), loadRound('round-b')])
const synthesisDecisionManifestBytes = await readFile(resolve(group, 'synthesis-decisions.json'))
const originalIndex = await json<{ resolutions: Array<{
  goalId: string; resolutionDigest: string; strictDescriptionComplete: boolean
}> }>(resolve(group, 'resolution-index.json'))
const declared = originalIndex.resolutions.find((entry) => entry.goalId === goalId)
assert.ok(declared?.strictDescriptionComplete)
const receipt = buildGoalDescriptionScopeNarrowingCompatibility({
  goalId, originalResolutionBytes,
  originalInput: first.input,
  originalSubsetBook,
  proposedAtlasBook,
})
assert.equal(receipt.originalResolutionDigest, declared.resolutionDigest)
const artifacts: GoalDescriptionScopeNarrowingArtifacts = {
  compatibility: receipt,
  originalResolutionBytes,
  originalResolution,
  originalDualSummary,
  originalDualSummaryBytes,
  originalInput: first.input,
  originalSubsetBook,
  first,
  second,
  synthesisDecisionManifestArtifact: {
    manifest: JSON.parse(synthesisDecisionManifestBytes.toString('utf8')),
    manifestBytes: synthesisDecisionManifestBytes,
    manifestPath: 'synthesis-decisions.json',
  },
  canonicalLandscape,
  proposedAtlasBook,
}
const positive = await validateGoalDescriptionScopeNarrowingCompatibility(artifacts)
assert.deepEqual(positive.errors, [], positive.errors.join('\n'))
assert.equal(positive.compatible, true)

const refingerprint = (mutated: GoalDescriptionScopeNarrowingCompatibility) => {
  const { compatibilityFingerprint: _fingerprint, ...payload } = mutated
  void _fingerprint
  return { ...payload,
    compatibilityFingerprint: fingerprintGoalDescriptionScopeNarrowingCompatibility(payload) }
}
const reject = async (candidate: GoalDescriptionScopeNarrowingArtifacts, reason: string) => {
  const result = await validateGoalDescriptionScopeNarrowingCompatibility(candidate)
  assert.equal(result.compatible, false, reason)
  assert.ok(result.errors.length > 0, reason)
}
await reject({ ...artifacts, compatibility: {
  ...receipt, unexpectedApproval: true,
} as unknown as GoalDescriptionScopeNarrowingCompatibility }, 'closed schema must reject extra approval')
await reject({ ...artifacts, compatibility: refingerprint({
  ...receipt, removedScopeKeys: ['DE-HE|SekII|G8|GK'],
}) }, 'rewritten scope list must not be accepted')
await reject({ ...artifacts, compatibility: refingerprint({
  ...receipt, proposedPageDigest: `sha256:${'0'.repeat(64)}`,
}) }, 'rewritten page digest must not be accepted')
await reject({ ...artifacts, originalResolutionBytes: Buffer.from(
  originalResolutionBytes.toString('utf8').replace('keep_current', 'open_current'),
) }, 'changed old resolution bytes must not be accepted')
await reject({ ...artifacts, proposedAtlasBook: {
  ...proposedAtlasBook,
  source: { ...proposedAtlasBook.source, atlasCourseProfilePolicy: undefined },
} as GoalBookModel }, 'an atlas without the declared course policy must not be accepted')
await reject({ ...artifacts, originalInput: {
  ...first.input, reviewInputFingerprint: `sha256:${'0'.repeat(64)}`,
} }, 'a stale original review-input fingerprint must not be accepted')
await reject({ ...artifacts, first: {
  ...first,
  campaign: { ...first.campaign, reviewInputFingerprint: `sha256:${'0'.repeat(64)}` },
} }, 'a changed independent review-round campaign must not be accepted')
await reject({ ...artifacts, canonicalLandscape: {
  goals: (canonicalLandscape as { goals: Array<{ id: string }> }).goals.map((goal) => (
    goal.id === goalId ? { ...goal, tags: ['GK', 'LK'] } : goal
  )),
} }, 'a canonical goal that admits GK must not be accepted')

console.log('Real GK/LK compatibility case plus 8 negative artifact mutations passed; diagnostic lane only')
