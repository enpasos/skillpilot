// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const folder = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-two-semantic-child-rasters-independent-v-b-v1'
const { normalizeGoalVisualizationAiReview, isGoalVisualizationAiApproved } = await import(pathToFileURL(path.resolve('app/scripts/goalVisualizationQaModel.ts')).href)
const { createGoalVisualizationLink, isGoalVisualizationLink } = await import(pathToFileURL(path.resolve('scripts/goal_visualization_common.mjs')).href)
const verdict = JSON.parse(fs.readFileSync(`${folder}/two-child-rasters.independent-b.metadata-whole-goal-provenance.verdict.json`, 'utf8'))
const checked = verdict.rows.map((row: any) => {
  const normalized = normalizeGoalVisualizationAiReview(row, row.assetSha256)
  assert.equal(normalized.aiApproved, 'yes')
  assert.equal(isGoalVisualizationAiApproved(row), true)
  const mismatch = normalizeGoalVisualizationAiReview(row, 'f'.repeat(64))
  assert.equal(mismatch.aiApproved, 'no')
  assert.equal(isGoalVisualizationAiApproved({ ...row, assetSha256: 'f'.repeat(64) }), false)
  const candidate = row.resourceLinkCandidate
  const ordinary = createGoalVisualizationLink(row.wholeProposedGoal, {
    publicUrl: candidate.url,
    provider: row.actualProvider,
    description: row.captionDe,
    altText: row.altTextDe,
    lang: 'de',
    license: 'CC-BY-4.0',
    reviewStatus: 'pilot',
  })
  assert.deepEqual(ordinary, candidate)
  assert.equal(isGoalVisualizationLink(candidate), true)
  assert.equal(candidate.skillpilotId, row.wholeProposedGoal.id)
  assert.equal(row.wholeProposedGoal.resourceLinks.length, 0)
  return {
    goalId: row.goalId,
    exactHashMachineVisualApprovalAcceptedByOrdinaryModel: true,
    mismatchedHashRejectedByOrdinaryModel: true,
    candidateResourceLinkEqualsOrdinaryFactory: true,
    candidatePublicURLIsNotAClaimOfActualPublication: true,
    currentCanonicalResourceLinkIntegrated: false,
    humanApproval: false,
  }
})
console.log(JSON.stringify({
  schemaVersion: 1,
  license: 'CC-BY-4.0',
  role: 'Scoped exact inactive image QA and candidate links using unchanged ordinary repository functions after substantive FIRST',
  checked,
  checkedCount: checked.length,
  currentCentralVCheckExecuted: false,
  sourceNativeOrM7Approval: false,
  strictGain: 0,
  activeWrites: [],
}, null, 2))
