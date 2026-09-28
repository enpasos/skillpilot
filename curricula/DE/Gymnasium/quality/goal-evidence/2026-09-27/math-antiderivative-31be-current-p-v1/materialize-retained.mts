import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../..')
const sourcePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-plane-plane-0f-current-image-bound-v1/retained-first15-ten.review.jsonl'
const sourceSha256 = '88353cc18414653b8fe0ff6ec42e62b1593b9adb4aa6fa81f02f6a57032eb6ea'
const targetPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-antiderivative-31be-current-p-v1/retained-first15-nine.review.jsonl'
const excludedGoalId = '31be24f0-3ab1-54d2-856d-fa9b7f36552f'
const sha256 = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')

const sourceBytes = readFileSync(resolve(root, sourcePath))
if (sha256(sourceBytes) !== sourceSha256) throw new Error(`Historical ten-goal P review bytes changed: ${sourcePath}`)
const sourceLines = sourceBytes.toString('utf8').trimEnd().split('\n')
if (sourceLines.length !== 10) throw new Error('Expected exactly ten historical P records')
const sourceIds = sourceLines.map((line) => JSON.parse(line).goalId as string)
if (sourceIds.filter((id) => id === excludedGoalId).length !== 1 || new Set(sourceIds).size !== 10) {
  throw new Error('Historical ten-goal P scope is not unique or excludes the wrong goal')
}
const retainedLines = sourceLines.filter((_line, index) => sourceIds[index] !== excludedGoalId)
const retainedConfig = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-antiderivative-31be-current-p-v1/retained-first15-nine.config.json'), 'utf8'))
const retainedIds = retainedLines.map((line) => JSON.parse(line).goalId as string)
if (JSON.stringify(retainedIds) !== JSON.stringify(retainedConfig.scope.goalIds)) {
  throw new Error('Retained nine-goal P scope does not match the configured goal order')
}
const expectedBytes = `${retainedLines.join('\n')}\n`
const target = resolve(root, targetPath)
if (process.argv[2] === '--write' && process.argv.length === 3) {
  writeFileSync(target, expectedBytes, { flag: 'wx' })
  console.log(`Wrote ${targetPath}: nine unchanged records`)
} else if (process.argv.length === 2) {
  if (readFileSync(target, 'utf8') !== expectedBytes) throw new Error(`Stale materialized P review: ${targetPath}`)
  console.log(`Verified ${targetPath}: nine unchanged records`)
} else {
  throw new Error('Usage: tsx materialize-retained.mts [--write]')
}
