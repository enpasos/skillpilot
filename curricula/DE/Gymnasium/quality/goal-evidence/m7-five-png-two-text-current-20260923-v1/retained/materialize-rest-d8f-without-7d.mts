import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../..')
const sourcePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-five-png-two-text-current-20260923-v1/retained/rest-d8f.review.jsonl'
const sourceSha256 = '343216d2a6fee16be39f68bdb81099b926ea30f3224619f18a08a91e3f4f1950'
const targetPath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-five-png-two-text-current-20260923-v1/retained/rest-d8f-without-7d.review.jsonl'
const targetConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-five-png-two-text-current-20260923-v1/retained/rest-d8f-without-7d.config.json'
const excludedGoalId = '7d37513b-fa1a-54cc-9e2a-9279a381f0f0'
const sha256 = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')

const sourceBytes = readFileSync(resolve(root, sourcePath))
if (sha256(sourceBytes) !== sourceSha256) throw new Error(`Historical five-goal P review bytes changed: ${sourcePath}`)
const sourceLines = sourceBytes.toString('utf8').trimEnd().split('\n')
if (sourceLines.length !== 5) throw new Error('Expected exactly five historical P records')
const sourceIds = sourceLines.map((line) => JSON.parse(line).goalId as string)
if (sourceIds.filter((id) => id === excludedGoalId).length !== 1 || new Set(sourceIds).size !== 5) {
  throw new Error('Historical P scope is not unique or excludes the wrong goal')
}
const retainedLines = sourceLines.filter((_line, index) => sourceIds[index] !== excludedGoalId)
const retainedConfig = JSON.parse(readFileSync(resolve(root, targetConfigPath), 'utf8'))
const retainedIds = retainedLines.map((line) => JSON.parse(line).goalId as string)
if (JSON.stringify(retainedIds) !== JSON.stringify(retainedConfig.scope.goalIds)) {
  throw new Error('Retained four-goal P scope does not match the configured goal order')
}
const expectedBytes = `${retainedLines.join('\n')}\n`
const target = resolve(root, targetPath)
if (process.argv[2] === '--write' && process.argv.length === 3) {
  writeFileSync(target, expectedBytes, { flag: 'wx' })
  console.log(`Wrote ${targetPath}: four unchanged records`)
} else if (process.argv.length === 2) {
  if (readFileSync(target, 'utf8') !== expectedBytes) throw new Error(`Stale materialized P review: ${targetPath}`)
  console.log(`Verified ${targetPath}: four unchanged records`)
} else {
  throw new Error('Usage: tsx materialize-rest-d8f-without-7d.mts [--write]')
}
