import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../..')
const sourcePath = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-038r-calculus-and-j10-logarithms-3-v1.review.jsonl'
const sourceSha256 = '82845bc7ca4ae4c9db717e6ce9e3466c5d202bed3ab43cdf76c1e35be317f2fe'
const targetPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-ftc-b9bb-prerequisite-current-p-v1/retained-b038r-two.review.jsonl'
const excludedGoalId = 'b9bbd2a8-1379-5ffb-817f-41467d48abef'
const sha256 = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')

const sourceBytes = readFileSync(resolve(root, sourcePath))
if (sha256(sourceBytes) !== sourceSha256) throw new Error(`Historical B038r P review bytes changed: ${sourcePath}`)
const sourceLines = sourceBytes.toString('utf8').trimEnd().split('\n')
if (sourceLines.length !== 3) throw new Error('Expected exactly three historical B038r P records')
const sourceIds = sourceLines.map((line) => JSON.parse(line).goalId as string)
if (sourceIds.filter((id) => id === excludedGoalId).length !== 1 || new Set(sourceIds).size !== 3) {
  throw new Error('Historical B038r P scope is not unique or excludes the wrong goal')
}
const retainedLines = sourceLines.filter((_line, index) => sourceIds[index] !== excludedGoalId)
const retainedConfig = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-ftc-b9bb-prerequisite-current-p-v1/retained-b038r-two.config.json'), 'utf8'))
const retainedIds = retainedLines.map((line) => JSON.parse(line).goalId as string)
if (JSON.stringify(retainedIds) !== JSON.stringify(retainedConfig.scope.goalIds)) {
  throw new Error('Retained B038r P scope does not match the configured goal order')
}
const expectedBytes = `${retainedLines.join('\n')}\n`
const target = resolve(root, targetPath)
if (process.argv[2] === '--write' && process.argv.length === 3) {
  writeFileSync(target, expectedBytes, { flag: 'wx' })
  console.log(`Wrote ${targetPath}: two unchanged records`)
} else if (process.argv.length === 2) {
  if (readFileSync(target, 'utf8') !== expectedBytes) throw new Error(`Stale materialized P review: ${targetPath}`)
  console.log(`Verified ${targetPath}: two unchanged records`)
} else {
  throw new Error('Usage: tsx materialize-retained.mts [--write]')
}
