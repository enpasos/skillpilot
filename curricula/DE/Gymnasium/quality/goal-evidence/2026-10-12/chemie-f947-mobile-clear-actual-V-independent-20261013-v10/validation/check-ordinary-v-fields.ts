import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const [packet, repo] = process.argv.slice(2)
const check = async () => {
  const model = await import(pathToFileURL(resolve(repo, 'app/scripts/goalVisualizationQaModel.ts')).href)
  const ledger = JSON.parse(readFileSync(resolve(packet, 'review/V.ordinary-selected-one.inactive.qa.json'), 'utf8'))
  assert.equal(ledger.schemaVersion, 1)
  assert.equal(ledger.subject, 'chemie')
  assert.equal(ledger.records.length, 1)
  const row = ledger.records[0]
  assert.equal(row.goalId, 'f947cd04-952a-5a9d-9445-3ffc70e02c3c')
  assert.equal(row.humanApproved, 'no')
  const normalized = model.normalizeGoalVisualizationAiReview(row, row.assetSha256)
  assert.equal(normalized.aiApprovedAssetSha256, row.assetSha256)
  assert.equal(normalized.aiApproved, 'yes')
  assert.equal(model.isGoalVisualizationAiApproved(row), true)
  console.log(JSON.stringify({ scope: 'one-target ordinary V fields', goalId: row.goalId, actualModel: 'app/scripts/goalVisualizationQaModel.ts', currentExactHashAiApproval: true, humanApproval: false, writeToActiveQa: false }))
}
check().catch((error) => { console.error(error); process.exitCode = 1 })
