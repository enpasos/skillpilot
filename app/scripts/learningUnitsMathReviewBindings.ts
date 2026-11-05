import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest } from './learningUnitsMathAuthoring'
import { contentSignatures } from './learningUnits/reviewSignatures'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const arg = (key: string, fallback: string) => { const index = args.indexOf(key); return index < 0 ? fallback : args[index + 1] }
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const inputsPath = arg('--inputs', 'tmp/math-learning-units/batches/math-2026-11-05-batch-a-scoped/content-review-inputs.json')
const decisionsPath = arg('--decisions', 'curricula/DE/Gymnasium/quality/learning-units/math-batch-a-2026-11-05/independent-content-decisions.json')
const inputs = read(inputsPath); const decisions = read(decisionsPath)
const rows = inputs.map((row: any) => {
  assert.equal(digest(canonicalJson(row.reviewInput)), row.reviewedInputSha256)
  const decision = decisions.decisions.find((value: any) => value.contractId === row.contractId)
  assert.ok(decision); assert.equal(decision.contentDecision, 'PASS'); assert.equal(decision.ownDemandDecision, 'PASS')
  assert.equal(decision.recallDecision, 'PASS_NO_OWN_RECALL_REQUIRED')
  const signatures = contentSignatures(row.reviewInput)
  for (const [key, value] of Object.entries(signatures)) assert.equal(value, decision[key], `Reviewed content or local demand changed: ${row.contractId}/${key}`)
  return { contractId: row.contractId, priorReviewedInputSha256: decision.reviewedInputSha256,
    currentReviewedInputSha256: row.reviewedInputSha256, ...signatures,
    actualContentReviewer: decision.independentReviewer,
    status: 'exact-content-and-demand-equivalence-verified; independent-current-source-and-placement-rebind-still-required' }
})
const result = { schemaVersion: 1, semantics: 'reviewed-content-equivalence-not-new-approval-v1', decisionsPath,
  decisionsSha256: digest(readFileSync(resolve(root, decisionsPath))), inputsPath, packets: rows }
const output = resolve(root, arg('--output', 'tmp/math-learning-units/batch-a-content-equivalence.json'))
mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`)
console.log(`Exact independently reviewed content/Own/D/K signatures preserved for ${rows.length} packets; no approval receipt generated`)
