// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = dirname(fileURLToPath(import.meta.url))
const root = resolve(directory, '../../../../../../..')
const args = process.argv.slice(2)
assert.ok(args.length === 0 || args.length === 1 && args[0] === '--write', 'Only --write is supported')
const write = args[0] === '--write'
const digest = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const json = value => `${JSON.stringify(value, null, 2)}\n`
const pins = JSON.parse(readFileSync(resolve(directory, 'retained-source-pins.json'), 'utf8'))
assert.equal(pins.schemaVersion, 1)
const receipt = []
for (const pin of pins.sourcePins) {
  const configBytes = readFileSync(resolve(root, pin.configPath))
  const reviewBytes = readFileSync(resolve(root, pin.reviewPath))
  assert.equal(digest(configBytes), pin.configSha256, `${pin.name}: historical config drifted`)
  assert.equal(digest(reviewBytes), pin.reviewSha256, `${pin.name}: historical review bytes drifted`)
  const original = JSON.parse(configBytes)
  assert.equal(original.reviewPath, pin.reviewPath)
  const excluded = new Set(pin.excludedGoalIds)
  assert.equal(excluded.size, pin.excludedGoalIds.length)
  assert.ok(pin.excludedGoalIds.every(id => original.scope.goalIds.includes(id)))
  const remainingIds = original.scope.goalIds.filter(id => !excluded.has(id))
  const selected = []
  const seen = new Set()
  // Preserve each selected historical JSONL line byte for byte, including its
  // original whitespace and terminator. No timestamps or judgments are edited.
  for (const line of reviewBytes.toString('utf8').match(/[^\n]*\n|[^\n]+$/gu) ?? []) {
    if (!line.trim()) continue
    const record = JSON.parse(line)
    assert.ok(original.scope.goalIds.includes(record.goalId), `${pin.name}: foreign record`)
    assert.ok(!seen.has(record.goalId), `${pin.name}: duplicate record`)
    seen.add(record.goalId)
    if (!excluded.has(record.goalId)) selected.push(line)
  }
  assert.equal(seen.size, original.scope.goalIds.length)
  assert.equal(selected.length, remainingIds.length)
  const reviewPath = resolve(directory, `${pin.name}.review.jsonl`)
  const configPath = resolve(directory, `${pin.name}.config.json`)
  const retained = {
    ...original,
    reviewPath: relative(root, reviewPath).split('\\').join('/'),
    scope: { ...original.scope, label: `Thirteen byte-identical historical Q4 P records retained; the late function-class comparison receives one separately reviewed current prerequisite successor`, goalIds: remainingIds },
  }
  const outputs = [[reviewPath, selected.join('')], [configPath, json(retained)]]
  for (const [path, bytes] of outputs) {
    if (write) writeFileSync(path, bytes)
    else assert.equal(readFileSync(path, 'utf8'), bytes, `${pin.name}: retained output differs`)
  }
  receipt.push({ name: pin.name, sourceConfigPath: pin.configPath, sourceConfigSha256: pin.configSha256,
    sourceReviewPath: pin.reviewPath, sourceReviewSha256: pin.reviewSha256,
    excludedGoalIds: pin.excludedGoalIds, retainedGoalIds: remainingIds,
    retainedConfigPath: relative(root, configPath).split('\\').join('/'), retainedConfigSha256: digest(json(retained)),
    retainedReviewPath: retained.reviewPath, retainedReviewSha256: digest(selected.join('')) })
}
const receiptPath = resolve(directory, 'retained-slices.receipt.json')
const receiptBytes = json({ schemaVersion: 1, purpose: 'Exact historical P review slices; no new review, approval, run, or completion claim.', slices: receipt })
if (write) writeFileSync(receiptPath, receiptBytes)
else assert.equal(readFileSync(receiptPath, 'utf8'), receiptBytes)
console.log(`Retained P slices ${write ? 'materialized' : 'verified'}: ${receipt.map(item => item.retainedGoalIds.length).join('+')}; original bytes preserved.`)
