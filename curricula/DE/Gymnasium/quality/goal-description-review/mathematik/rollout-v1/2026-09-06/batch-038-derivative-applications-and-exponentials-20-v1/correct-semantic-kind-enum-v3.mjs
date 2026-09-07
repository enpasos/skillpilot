// Mechanical schema correction of four individually reviewed v3 records.
// Original review receipt is immutable; this receipt records the exact follow-up.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../../..')
const receiptPath = resolve(here, 'semantic-kind-enum-correction-v3.receipt.json')
const followup = JSON.parse(readFileSync(resolve(here, 'review-followup-v3.receipt.json'), 'utf8'))
const path = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const raw = readFileSync(resolve(root, path), 'utf8')
if (existsSync(receiptPath)) {
  assert.equal(sha(raw), JSON.parse(readFileSync(receiptPath, 'utf8')).afterSha256)
  console.log('CHECK B038h semantic-kind enum correction PASS')
} else {
  assert.equal(sha(raw), followup.files.find(file => file.path === path).afterSha256)
  const ledger = JSON.parse(raw)
  const changedGoalIds = followup.reviews.map(review => review.goalId)
  const changes = changedGoalIds.map(goalId => {
    const record = ledger.decisions.find(record => record.goalId === goalId)
    const before = structuredClone(record)
    assert.equal(record.semanticKind, 'curricularAtomic')
    assert.equal(record.decisionBasis, 'reviewed-b038h-v3-individual-ai-curricular-atomic-source-route-adjudication')
    record.decisionBasis = 'reviewed-current-pilot-curricular-atomic'
    return { goalId, before, after: structuredClone(record) }
  })
  const output = JSON.stringify(ledger, null, 2) + '\n'
  const receipt = {
    schemaVersion: 1, status: 'MECHANICAL_SCHEMA_CORRECTION_NOT_NEW_REVIEW', path,
    beforeSha256: sha(raw), afterSha256: sha(output),
    reason: 'Use the existing closed-schema enum for already individually reviewed curricular atoms; the original v3 receipt retains the detailed AI authority and rationale. No semanticKind, source fingerprint or fachliche decision changes.',
    changes,
  }
  if (process.argv.includes('--write')) {
    writeFileSync(resolve(root, path), output)
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
  }
  console.log(JSON.stringify(receipt, null, 2))
}
