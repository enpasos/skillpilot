import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [packet, repo] = process.argv.slice(2)
const read = (relative: string) => JSON.parse(readFileSync(resolve(packet, relative), 'utf8'))
const digest = (path: string) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`

async function main() {
  const model = await import(pathToFileURL(resolve(repo, 'app/scripts/goalVisualizationQaModel.ts')).href)
  const strict = await import(pathToFileURL(resolve(repo, 'app/scripts/reportDeepUnderstandingRollout.ts')).href)
  const config = read('review/V.independent.config.json')
  const first = read('FIRST.three-actual-native-mobile-V.frozen.json')
  const before = read('inputs/active.selected-three.qa.original.json')
  const ledger = read('review/V.ordinary-selected-three.inactive.qa.json')
  const future = read('review/V.root-integration.future-live-three.qa.json')
  assert.equal(digest(resolve(repo, config.firstVerdictBinding.path)), config.firstVerdictBinding.sha256)
  assert.equal(ledger.schemaVersion, 1)
  assert.equal(ledger.subject, 'chemie')
  assert.equal(ledger.records.length, 3)
  assert.deepEqual(ledger.records.map((row: any) => row.goalId), config.goalIds)
  const results = ledger.records.map((row: any) => {
    const old = before.records.find((r: any) => r.goalId === row.goalId)
    const finding = first.findings.find((r: any) => r.goalId === row.goalId)
    const expected = finding.verdict === 'PASS'
    for (const key of Object.keys(old).filter((key) => key.toLowerCase().startsWith('human')
      || key.startsWith('chatGpt') || ['umlautsCorrectChatGpt', 'contentApprovedChatGpt'].includes(key))) {
      assert.deepEqual(row[key], old[key], `${row.goalId}:${key}`)
    }
    assert.equal(row.visualizationState, 'available')
    assert.equal(row.missingReason, '')
    assert.equal(digest(resolve(repo, row.publicAssetPath)), row.assetSha256)
    assert.equal(digest(resolve(repo, row.canonicalAssetPath)), row.assetSha256)
    const normalized = model.normalizeGoalVisualizationAiReview(row, row.assetSha256)
    assert.equal(normalized.aiApprovedAssetSha256, row.assetSha256)
    assert.equal(normalized.aiApproved, expected ? 'yes' : 'no')
    assert.equal(model.isGoalVisualizationAiApproved(row), expected)
    assert.equal(strict.hasCompletedDeepUnderstandingVisualizationReview(row), expected)
    const planned = future.records.find((r: any) => r.goalId === row.goalId)
    assert.equal(planned.publicAssetPath, `app/public${planned.imageUrl}`)
    assert.equal(planned.canonicalAssetPath,
      `curricula/DE/Gymnasium/visualizations/chemie/${row.goalId}/${row.goalId}.png`)
    for (const key of Object.keys(row).filter((key) => !['landscapePath', 'canonicalAssetPath', 'publicAssetPath'].includes(key))) {
      assert.deepEqual(planned[key], row[key])
    }
    return { goalId: row.goalId, verdict: finding.verdict, exactCurrentHashMachineV: expected,
      currentHumanAndLegacyFieldsRetained: true, candidateSourcePublicParity: true }
  })
  console.log(JSON.stringify({ schemaVersion: 1, scope: 'three-target ordinary V model and strict machine V predicate',
    model: 'app/scripts/goalVisualizationQaModel.ts', strictPredicate: 'hasCompletedDeepUnderstandingVisualizationReview',
    results, approved: 1, held: 2, activeWrites: 0, humanApproval: false, humanTrial: false, strictM7Gain: 0 }, null, 2))
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
