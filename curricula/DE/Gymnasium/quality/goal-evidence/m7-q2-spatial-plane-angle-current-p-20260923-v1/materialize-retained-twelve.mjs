import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const directory = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-spatial-plane-angle-current-p-20260923-v1'
const heldGoalId = '7bb3c312-f714-55e6-a31f-f31605a93760'
const sourceConfigPath = `${directory}/retained-thirteen.config.json`
const sourceReviewPath = `${directory}/retained-thirteen.review.jsonl`
const outputConfigPath = `${directory}/retained-twelve-after-quality-hold.config.json`
const outputReviewPath = `${directory}/retained-twelve-after-quality-hold.review.jsonl`
const sourceConfigSha256 = '967d34fccb001bac2e75e7f1526302a76b1ba752f34acf9b47583bbe00dcbbde'
const sourceReviewSha256 = '9e3eb596159b541e3683b648f2ddee2f12821e18830325a00a23c4213f8e0f97'

const digest = (bytes) => createHash('sha256').update(bytes).digest('hex')
const read = (path) => readFileSync(resolve(path))
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const mode = process.argv[2]
assert(process.argv.length === 3 && ['--write', '--check'].includes(mode), 'Usage: node materialize-retained-twelve.mjs --write|--check (from repository root)')

const sourceConfigBytes = read(sourceConfigPath)
const sourceReviewBytes = read(sourceReviewPath)
assert(digest(sourceConfigBytes) === sourceConfigSha256, 'Historical 13-goal config changed')
assert(digest(sourceReviewBytes) === sourceReviewSha256, 'Historical 13-goal review changed')

const sourceConfig = JSON.parse(sourceConfigBytes.toString('utf8'))
const sourceLines = sourceReviewBytes.toString('utf8').trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
assert(sourceConfig.scope.goalIds.length === 13 && sourceRecords.length === 13, 'Expected the original 13-goal scope')
assert(sourceConfig.scope.goalIds.every((id, index) => sourceRecords[index].goalId === id), 'Historical scope and review order differ')
assert(sourceConfig.scope.goalIds.filter((id) => id === heldGoalId).length === 1, 'Expected exactly one quarantined image goal')

const retainedIds = sourceConfig.scope.goalIds.filter((id) => id !== heldGoalId)
const retainedLines = sourceLines.filter((_line, index) => sourceRecords[index].goalId !== heldGoalId)
assert(retainedIds.length === 12 && retainedLines.length === 12, 'Expected twelve unchanged records')
const config = {
  ...sourceConfig,
  reviewPath: outputReviewPath,
  scope: {
    label: 'Zwölf unveränderte Q2-Raumgeometrie-P-v2-Kandidaten nach Bild-Qualitäts-HOLD',
    goalIds: retainedIds,
  },
}
const outputs = [
  [outputConfigPath, Buffer.from(`${JSON.stringify(config, null, 2)}\n`)],
  [outputReviewPath, Buffer.from(`${retainedLines.join('\n')}\n`)],
]

for (const [path, expected] of outputs) {
  const absolute = resolve(path)
  if (!existsSync(absolute)) {
    assert(mode === '--write', `${path} is missing`)
    writeFileSync(absolute, expected, { flag: 'wx' })
  } else {
    assert(readFileSync(absolute).equals(expected), `${path} differs from the unchanged historical records`)
  }
}
console.log(`Verified ${retainedIds.length} unchanged records; ${heldGoalId} remains outside the central P registry.`)
