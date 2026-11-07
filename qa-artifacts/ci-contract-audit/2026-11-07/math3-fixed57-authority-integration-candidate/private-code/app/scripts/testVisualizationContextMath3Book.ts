// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadGoalBookBuildInputs } from './goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from './materializeGoalDescriptionRolloutBatch'
const id = 'ce198bc9-b014-52ba-814f-25cc3e020668'
const base = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-math-national-atlas.json')
const model = buildGoalDescriptionRolloutSubsetModel({ baseModel: base.model, goalIds: [id],
  bookId: 'de-gym-math-matrix-current-page-20261107-v1', title: 'Mathematik – ein Lernziel' })
const page = model.pages[0]
assert.equal(page.pageFingerprint, 'sha256:b889dbe3a76abe081ddf921ecf01e3d8f0f5602fb054eeb342514853c057642d')
assert.equal(page.visualization?.qaStatus, 'review_candidate')
assert.equal(page.visualization?.approvedForPublication, false)
const qa = JSON.parse(readFileSync('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json', 'utf8'))
const row = qa.records.find((row: { goalId: string }) => row.goalId === id)
assert.equal(row.humanApproved, 'no'); assert.equal(row.humanIssueIdentified, 'no'); assert.equal(row.aiApproved, 'yes')
console.log(JSON.stringify({ currentPageFingerprint: page.pageFingerprint, visualization: page.visualization,
  humanApproved: row.humanApproved, humanIssueIdentified: row.humanIssueIdentified, aiApproved: row.aiApproved,
  sourceLink: JSON.parse(readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', 'utf8')).goals.find((goal: { id: string }) => goal.id === id).resourceLinks,
  newDescriptionReviewClaimed: false }, null, 2))
