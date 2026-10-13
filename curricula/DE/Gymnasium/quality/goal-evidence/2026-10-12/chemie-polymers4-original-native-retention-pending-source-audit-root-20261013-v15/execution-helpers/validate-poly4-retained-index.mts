import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadGoalDescriptionReviewCampaignResultDirectories } from '../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import { validateGoalDescriptionReviewDualRound } from '../../app/scripts/validateGoalDescriptionReviewDualRound.ts'
import { validateGoalDescriptionDualRoundResolution } from '../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import { validateLegacyResolutionIndexSnapshot } from '../../app/scripts/reportDeepUnderstandingRollout.ts'

const root = resolve(import.meta.dirname, '../..')
const target = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers4-original-native-retention-pending-source-audit-root-20261013-v15')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const digest = (p: string) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const index = read(resolve(target, 'resolution-index.original4.aggregate-v1.inactive.json'))
assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
const group = index.groups[0]
const original = resolve(target, group.artifactDirectory)
const loadRound = async (name: string) => {
  const directory = resolve(original, name)
  const campaign = read(resolve(directory, 'description-review-campaign.json'))
  const result = await loadGoalDescriptionReviewCampaignResultDirectories({campaign, batchesDirectory: resolve(directory, 'batches'), resultsDirectory: resolve(directory, 'results')})
  assert.deepEqual(result.errors, [])
  return {campaign, input: read(resolve(directory, 'description-review-input.json')), bundle: read(resolve(directory, 'review-bundle-manifest.json')), resultPairs: result.resultPairs}
}
const [first, second] = await Promise.all([loadRound('round-a'), loadRound('round-b')])
const dual = await validateGoalDescriptionReviewDualRound({first, second})
assert.deepEqual(dual.errors, [])
assert.equal(dual.summary.goalCount, 18)
const summaryPath = resolve(target, group.dualSummaryPath)
assert.equal(digest(summaryPath), group.dualSummaryDigest)
const bytes = readFileSync(summaryPath)
assert.deepEqual(JSON.parse(bytes.toString()), dual.summary)
const manifest = read(resolve(original, 'batch-manifest.json'))
const landscape = read(resolve(root, manifest.source.landscapePath))
const results = []
for (const row of index.resolutions) {
  const path = resolve(target, row.resolutionPath)
  assert.equal(digest(path), row.resolutionDigest)
  const resolution = read(path)
  assert.equal(resolution.resolutionFingerprint, row.resolutionFingerprint)
  const result = await validateGoalDescriptionDualRoundResolution({resolution, dualSummary: dual.summary, dualSummaryBytes: bytes, currentInput: first.input, landscape, first, second})
  assert.deepEqual(result.errors, [], row.goalId)
  assert.equal(result.strictDescriptionComplete, true, row.goalId)
  results.push({goalId: row.goalId, errors: result.errors, originalResolutionDigest: row.resolutionDigest, structurallyValidOriginalStrictResolution: true})
}
assert.equal(results.length, 4)
const checks = resolve(target, 'checks')
mkdirSync(checks, {recursive:true})
writeFileSync(resolve(checks, 'original-four-run-record-resolution-API.actual.json'), JSON.stringify({schemaVersion:1, role:'Technical retention validation only; current primary-source and context acceptance pending', originalCampaignGoalCount:18, retainedResolutionCount:4, originalRunRecordSummaryAndResolutionMetadataUnchanged:true, newScientificVotes:0, actualStrictGain:0, results}, null, 2) + '\n')
console.log('PASS: four exact original resolutions validate against unchanged genuine eighteen-goal campaigns. Current source/context acceptance remains pending; active strict gain zero.')
