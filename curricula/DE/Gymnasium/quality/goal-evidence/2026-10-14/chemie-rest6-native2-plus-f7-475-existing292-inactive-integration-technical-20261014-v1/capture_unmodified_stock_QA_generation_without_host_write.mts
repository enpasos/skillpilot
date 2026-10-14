// SPDX-License-Identifier: Apache-2.0
// Instrument the file destination only; execute the untouched stock generator.
import fs from 'node:fs'
import { syncBuiltinESMExports } from 'node:module'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const out = path.dirname(fileURLToPath(import.meta.url))
const repo = process.cwd()
const host = path.join(repo, 'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host')
const ledger = path.join(host, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const output = path.join(out, 'checks/EXPECTED.unmodified-stock-QA426.sorted-current-candidate.NOT-APPLIED.json')
const originalBytes = fs.readFileSync(ledger)
const originalWrite = fs.writeFileSync
let captured = 0
fs.writeFileSync = ((target, ...args) => {
  if (path.resolve(String(target)) !== ledger) throw new Error(`Unexpected stock write: ${String(target)}`)
  captured += 1
  return originalWrite(output, ...args as [any, any])
}) as typeof fs.writeFileSync
syncBuiltinESMExports()
process.argv = [process.execPath, path.join(host, 'app/scripts/generateGoalVisualizationQaLedgers.ts'), '--subject=chemie']
await import(pathToFileURL(path.join(host, 'app/scripts/generateGoalVisualizationQaLedgers.ts')).href)
if (captured !== 1 || !originalBytes.equals(fs.readFileSync(ledger))) throw new Error('QA read-only capture failed')
const rawExpected = fs.readFileSync(output)
const original = JSON.parse(originalBytes.toString())
const expected = JSON.parse(rawExpected.toString())
const originalMap = new Map(original.records.map((r: any) => [r.goalId, r]))
const changed = expected.records.flatMap((record: any) => JSON.stringify(originalMap.get(record.goalId)) === JSON.stringify(record) ? [] : [record.goalId])
console.log(JSON.stringify({ capturedStockOutputWithoutHostWrite: true, stockSourceUnmodified: true, expectedBytes: rawExpected.length, expectedSHA256: createHash('sha256').update(rawExpected).digest('hex'), currentRows: original.records.length, expectedRows: expected.records.length, wholeRecordContentChangedGoalIds: changed, currentGoalIdOrder: original.records.map((r: any) => r.goalId), expectedGoalIdOrder: expected.records.map((r: any) => r.goalId) }))
