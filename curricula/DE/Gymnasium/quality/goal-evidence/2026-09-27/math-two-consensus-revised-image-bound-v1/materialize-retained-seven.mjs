import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const oldPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-unordered-selections-revised-image-bound-v1/retained-nine.review.jsonl'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-consensus-revised-image-bound-v1'
const oldBytes = readFileSync(resolve(root, oldPath))
const oldSha = createHash('sha256').update(oldBytes).digest('hex')
assert.equal(oldSha, '4a9ca4e1b34b6522e9fe6cf28d61c3ac27f7feb39ac8f1ac00a7b8c8f3623272', 'historical retained-nine source changed')
const config = JSON.parse(readFileSync(resolve(root, `${base}/retained-seven.config.json`), 'utf8'))
const excluded = new Set([
  '0408ac7f-0530-5de5-b248-cf581c9b5a17',
  '27bdc580-ba17-5399-bf02-48f354846d1d',
])
const oldLines = oldBytes.toString('utf8').trimEnd().split('\n')
assert.equal(oldLines.length, 9)
const retained = oldLines.filter((line) => !excluded.has(JSON.parse(line).goalId))
assert.deepEqual(retained.map((line) => JSON.parse(line).goalId), config.scope.goalIds)
const output = Buffer.from(`${retained.join('\n')}\n`)
const target = resolve(root, `${base}/retained-seven.review.jsonl`)
if (process.argv[2] === '--write') writeFileSync(target, output, { flag: 'wx' })
else if (process.argv.length === 2) assert.deepEqual(readFileSync(target), output)
else throw new Error('Usage: node materialize-retained-seven.mjs [--write]')
console.log(`${process.argv[2] === '--write' ? 'Wrote' : 'Verified'} seven byte-identical historical P-v2 records`)
