import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const [packet, repo] = process.argv.slice(2)
const check = async () => {
  const model = await import(pathToFileURL(resolve(repo, 'app/scripts/goalVisualizationQaModel.ts')).href)
  const ledger = JSON.parse(readFileSync(resolve(packet, 'review/V.ordinary-selected-one.inactive.qa.json'), 'utf8'))
  const before = JSON.parse(readFileSync(resolve(packet, 'inputs/active-chemie.qa.raw.json'), 'utf8'))
  assert.equal(ledger.schemaVersion, 1)
  assert.equal(ledger.subject, 'chemie')
  assert.equal(ledger.records.length, 1)
  const row = ledger.records[0]
  assert.equal(row.goalId, 'e5941581-0aba-5354-b4b9-d0249d4538a8')
  const old = before.records.find((r: any) => r.goalId === row.goalId)
  for (const key of Object.keys(old).filter((k) => k.toLowerCase().startsWith('human') || k.startsWith('chatGpt') || ['umlautsCorrectChatGpt', 'contentApprovedChatGpt'].includes(k))) assert.deepEqual(row[key], old[key])
  const normalized = model.normalizeGoalVisualizationAiReview(row, row.assetSha256)
  assert.equal(normalized.aiApprovedAssetSha256, row.assetSha256)
  assert.equal(normalized.aiApproved, 'yes')
  assert.equal(model.isGoalVisualizationAiApproved(row), true)
  console.log(JSON.stringify({ scope: 'one corrected e594 target ordinary V fields', actualModel: 'app/scripts/goalVisualizationQaModel.ts', goalId: row.goalId, currentExactHashAiApproval: true, humanAndLegacyFieldsRetained: true, activeWrites: 0, humanApproval: false, m7Gain: 0 }))
}
check().catch((error) => { console.error(error); process.exitCode = 1 })
