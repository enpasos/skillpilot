import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const directory = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-second16-20260923-v1'
const retainedId = 'a8ff2666-8df3-4253-8021-3efe42114e40'
const sourceConfigPath = `${directory}/text-only-6.config.json`
const sourceReviewPath = `${directory}/text-only-6.review.jsonl`
const outputConfigPath = `${directory}/text-only-a8ff-retained-after-quality-holds.config.json`
const outputReviewPath = `${directory}/text-only-a8ff-retained-after-quality-holds.review.jsonl`
const sourceConfigSha256 = '9ab2fa3c0112b1a60fef13d8578ca1e99731d5a040f7eefc9d160d3323aac03b'
const sourceReviewSha256 = 'b3e1bd34625333ef81c5ef23c1a42f12d457014bd86ab4825405f2d21c9b2d0f'

const digest = (bytes) => createHash('sha256').update(bytes).digest('hex')
const read = (path) => readFileSync(resolve(path))
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const mode = process.argv[2]
assert(process.argv.length === 3 && ['--write', '--check'].includes(mode), 'Usage: node materialize-retained-a8ff.mjs --write|--check (from repository root)')
const configBytes = read(sourceConfigPath)
const reviewBytes = read(sourceReviewPath)
assert(digest(configBytes) === sourceConfigSha256, 'Historical six-goal config changed')
assert(digest(reviewBytes) === sourceReviewSha256, 'Historical six-goal review changed')

const sourceConfig = JSON.parse(configBytes.toString('utf8'))
const sourceLines = reviewBytes.toString('utf8').trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
assert(sourceConfig.scope.goalIds.length === 6 && sourceRecords.length === 6, 'Expected the original six-goal scope')
assert(sourceConfig.scope.goalIds.every((id, index) => sourceRecords[index].goalId === id), 'Historical scope and review order differ')
assert(sourceConfig.scope.goalIds.filter((id) => id === retainedId).length === 1, 'Expected exactly one retained current goal')
const retainedLine = sourceLines[sourceConfig.scope.goalIds.indexOf(retainedId)]
const config = {
  ...sourceConfig,
  reviewPath: outputReviewPath,
  scope: {
    label: 'Aktueller P-v2-Kandidat a8ff2666 nach Bild-Qualitäts-HOLDs im ursprünglichen Sechserpaket',
    goalIds: [retainedId],
  },
}
const outputs = [
  [outputConfigPath, Buffer.from(`${JSON.stringify(config, null, 2)}\n`)],
  [outputReviewPath, Buffer.from(`${retainedLine}\n`)],
]
for (const [path, expected] of outputs) {
  const absolute = resolve(path)
  if (!existsSync(absolute)) {
    assert(mode === '--write', `${path} is missing`)
    writeFileSync(absolute, expected, { flag: 'wx' })
  } else {
    assert(readFileSync(absolute).equals(expected), `${path} differs from the unchanged historical record`)
  }
}
console.log(`Verified unchanged P-v2 record for ${retainedId}; five held-image goals remain outside the central P registry.`)
