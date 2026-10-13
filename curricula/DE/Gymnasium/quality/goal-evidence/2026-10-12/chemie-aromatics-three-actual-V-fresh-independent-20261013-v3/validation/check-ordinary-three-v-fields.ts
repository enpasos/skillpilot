import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const [packet, repo] = process.argv.slice(2)
const check = async () => {
  const model = await import(pathToFileURL(resolve(repo, 'app/scripts/goalVisualizationQaModel.ts')).href)
  const ledger = JSON.parse(readFileSync(resolve(packet, 'review/V.ordinary-selected-three.inactive.qa.json'), 'utf8'))
  const before = JSON.parse(readFileSync(resolve(packet, 'inputs/active-chemie.qa.raw.json'), 'utf8'))
  assert.equal(ledger.schemaVersion, 1)
  assert.equal(ledger.subject, 'chemie')
  assert.equal(ledger.records.length, 3)
  const results = ledger.records.map((row: any) => {
    const old = before.records.find((r: any) => r.goalId === row.goalId)
    for (const key of Object.keys(old).filter((k) => k.toLowerCase().startsWith('human'))) assert.deepEqual(row[key], old[key])
    const expected = row.goalId !== 'e5941581-0aba-5354-b4b9-d0249d4538a8'
    const normalized = model.normalizeGoalVisualizationAiReview(row, row.assetSha256)
    assert.equal(normalized.aiApprovedAssetSha256, row.assetSha256)
    assert.equal(normalized.aiApproved, expected ? 'yes' : 'no')
    assert.equal(model.isGoalVisualizationAiApproved(row), expected)
    return { goalId: row.goalId, currentExactHashAiApproval: expected, humanFieldsRetained: true }
  })
  console.log(JSON.stringify({ scope: 'three-target ordinary V fields', actualModel: 'app/scripts/goalVisualizationQaModel.ts', results, accepted: 2, held: 1, activeWrites: 0, humanApproval: false, m7Gain: 0 }))
}
check().catch((error) => { console.error(error); process.exitCode = 1 })
