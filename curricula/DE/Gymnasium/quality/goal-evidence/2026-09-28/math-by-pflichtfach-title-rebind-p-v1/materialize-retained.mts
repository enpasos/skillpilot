import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1'
const sha256 = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')
const splits = [
  {
    sourcePath: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-v-resumed-png-image-bound-v1/retained-b042-seven.review.jsonl',
    sourceSha256: '9ff38209f4edaf2bfdf58812f8c668fb1b42e7565cd5e12f5e71f1488952e060',
    expectedSourceCount: 7,
    excludedIds: ['0b162cb0-8507-5ac2-b9d6-57f40f4d3f35', '71fe4a39-38e8-5c6a-8eef-ff4783fe70c2'],
    targetName: 'retained-b042-five',
  },
  {
    sourcePath: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-normal-domain-image-bound-p-20260924-v1/current-two.review.jsonl',
    sourceSha256: '912f6afc8d172cffea0169a57833ce7449f314eb28589bc9f2fa0e4adadeba32',
    expectedSourceCount: 2,
    excludedIds: ['b431148b-526c-4bde-b04b-48d23101d0d3'],
    targetName: 'retained-normal-one',
  },
  {
    sourcePath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-038h-current-exponential-scope-7-v1.review.jsonl',
    sourceSha256: '4faeecbe757622ab272d3cceb402624e026cde6986704c3e274ee1400cf53d37',
    expectedSourceCount: 7,
    excludedIds: ['49f9059a-876c-5051-8146-d008b5cc691c'],
    targetName: 'retained-b038h-six',
  },
] as const

if (process.argv.length > 3 || (process.argv.length === 3 && process.argv[2] !== '--write')) {
  throw new Error('Usage: tsx materialize-retained.mts [--write]')
}
for (const split of splits) {
  const sourceBytes = readFileSync(resolve(root, split.sourcePath))
  if (sha256(sourceBytes) !== split.sourceSha256) throw new Error(`Historical P review bytes changed: ${split.sourcePath}`)
  const sourceLines = sourceBytes.toString('utf8').trimEnd().split('\n')
  const sourceIds = sourceLines.map((line) => JSON.parse(line).goalId as string)
  if (sourceLines.length !== split.expectedSourceCount || new Set(sourceIds).size !== split.expectedSourceCount) {
    throw new Error(`Unexpected historical P scope: ${split.sourcePath}`)
  }
  if (split.excludedIds.some((id) => sourceIds.filter((sourceId) => sourceId === id).length !== 1)) {
    throw new Error(`Expected each excluded ID once: ${split.sourcePath}`)
  }
  const excludedIds = new Set<string>(split.excludedIds)
  const retainedLines = sourceLines.filter((_line, index) => !excludedIds.has(sourceIds[index]))
  const targetPath = `${packagePath}/${split.targetName}.review.jsonl`
  const config = JSON.parse(readFileSync(resolve(root, `${packagePath}/${split.targetName}.config.json`), 'utf8'))
  const retainedIds = retainedLines.map((line) => JSON.parse(line).goalId as string)
  if (JSON.stringify(retainedIds) !== JSON.stringify(config.scope.goalIds)) {
    throw new Error(`Retained P scope differs from config: ${targetPath}`)
  }
  const expectedBytes = `${retainedLines.join('\n')}\n`
  const target = resolve(root, targetPath)
  if (process.argv[2] === '--write') {
    writeFileSync(target, expectedBytes, { flag: 'wx' })
    console.log(`Wrote ${targetPath}: ${retainedLines.length} unchanged records`)
  } else {
    if (readFileSync(target, 'utf8') !== expectedBytes) throw new Error(`Stale materialized P review: ${targetPath}`)
    console.log(`Verified ${targetPath}: ${retainedLines.length} unchanged records`)
  }
}
