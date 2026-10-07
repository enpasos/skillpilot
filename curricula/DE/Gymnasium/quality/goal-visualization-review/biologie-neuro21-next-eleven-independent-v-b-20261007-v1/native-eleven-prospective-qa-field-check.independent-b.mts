import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  isGoalVisualizationAiApproved,
  normalizeGoalVisualizationAiReview,
} from '../../../../../../app/scripts/goalVisualizationQaModel.ts'

const root = process.cwd()
const base = resolve(fileURLToPath(new URL('.', import.meta.url)))
const inputPath = 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro21-next-eleven-friendly-comic-primary-raster-author-20261007-v1/eleven-whole-goal-current-material-source-original-raster-native-routing.author.raw.json'
const raw = JSON.parse(await readFile(resolve(root, inputPath), 'utf8'))
const rows = JSON.parse(await readFile(resolve(base, 'native-eleven-qa-rows.independent-b.prospective.json'), 'utf8')).records
const active = JSON.parse(await readFile(resolve(root, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'), 'utf8'))
assert.equal(rows.length, 11)
for (const row of rows) {
  const input = raw.records.find((candidate: any) => candidate.goalId === row.goalId)
  assert.ok(input)
  const digest = `sha256:${createHash('sha256').update(await readFile(resolve(root, input.selectedUnchangedOriginalAsset.path))).digest('hex')}`
  assert.equal(row.assetSha256, digest)
  assert.equal(row.aiApprovedAssetSha256, digest)
  assert.equal(row.description, input.wholeStage02CandidateGoal.description)
  assert.equal(row.title, input.wholeStage02CandidateGoal.title)
  assert.equal(row.visualizationState, 'available')
  assert.equal(row.missingReason, '')
  assert.equal(isGoalVisualizationAiApproved(row), true)
  const normalized = normalizeGoalVisualizationAiReview(row, digest)
  assert.equal(isGoalVisualizationAiApproved({ ...row, ...normalized }), true)
  const otherHash = `sha256:${'f'.repeat(64)}`
  assert.notEqual(otherHash, digest)
  const stale = normalizeGoalVisualizationAiReview(row, otherHash)
  assert.equal(stale.aiApproved, 'no')
  assert.equal(stale.aiApprovedAssetSha256, '')
  assert.equal(isGoalVisualizationAiApproved({ ...row, ...stale, assetSha256: otherHash }), false)
  const old = active.records.find((candidate: any) => candidate.goalId === row.goalId)
  assert.ok(old)
  for (const field of ['humanApproved', 'humanIssueIdentified', 'humanIssueDescription', 'humanReviewedAt', 'humanReviewer']) {
    assert.equal(row[field], old[field])
  }
}
process.stdout.write(`${JSON.stringify({ nativeRows: 11, exactRasterHashAndGoalDescriptionBindings: 11, unchangedHumanFlags: 11, failClosedOnChangedHash: 11, activeAssetImport: false, nativeFullBookOrAppAcceptance: false, newStrictCompletion: 0 })}\n`)
